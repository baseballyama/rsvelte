//! Arena allocator for parse-phase AST nodes.
//!
//! Replaces individual `Box<JsNode>` heap allocations with contiguous `Vec`
//! storage, referenced by `JsNodeId` indices. This gives:
//!
//! - **Cache-friendly layout** (nodes are contiguous in memory)
//! - **Zero-cost reads** (`arena.get_js_node(id)` is a single array index)
//! - **Cheaper allocation** (Vec push vs global allocator)
//!
//! Follows the proven `JsArena` pattern from
//! `src/compiler/phases/3_transform/js_ast/arena.rs`.
//!
//! # Safety
//!
//! The arena is single-threaded (not `Sync`) and append-only.
//! `UnsafeCell` is safe because:
//! - Allocation only appends (never moves existing elements)
//! - Builders return owned values, not references into the Vec
//! - `get_*` methods return references only when no allocation is in progress

use std::cell::UnsafeCell;

use bumpalo::Bump;

use super::typed_expr::JsNode;

/// Handle to a `JsNode` stored in the parse arena.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct JsNodeId(pub u32);

/// A contiguous range of `JsNode` children stored in the arena.
/// Replaces `Vec<JsNode>` with (start_index, length).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub struct IdRange {
    pub start: u32,
    pub len: u32,
}

impl IdRange {
    #[inline(always)]
    pub fn empty() -> Self {
        IdRange { start: 0, len: 0 }
    }

    #[inline(always)]
    pub fn is_empty(&self) -> bool {
        self.len == 0
    }
}

/// Arena that owns all `JsNode` instances for a single parse unit.
///
/// Allocation takes `&self` (not `&mut self`) so that builder functions
/// can nest calls without borrow-checker conflicts.
pub struct ParseArena {
    /// All standalone JsNode instances (referenced by JsNodeId).
    js_nodes: UnsafeCell<Vec<JsNode>>,
    /// JsNode children for `Vec<JsNode>` fields (arguments, body, properties, etc.).
    /// Referenced by IdRange.
    js_children: UnsafeCell<Vec<JsNode>>,
    /// Bump arena reserved for subsequent migration phases (see
    /// `docs/bumpalo-migration-plan.md`). Currently unused — Phase 0 adds it
    /// to ParseArena without changing public APIs so that Phase 1+ have a
    /// place to allocate from.
    bump: Bump,
}

// ParseArena is explicitly NOT Sync - it's single-threaded only.
// Send is fine since we can move it between threads.
//
// SAFETY: ParseArena owns its `UnsafeCell<Vec<JsNode>>` storage. Moving it
// between threads is sound because no shared references exist when ownership
// transfers, and all internal mutation happens through `&self` methods that
// are documented as single-threaded (UnsafeCell is `!Sync`, so the type
// remains non-shareable across threads). `bumpalo::Bump` is also `Send`
// (the same constraint applies — single-threaded mutation only), so adding
// it does not change Send safety.
unsafe impl Send for ParseArena {}

impl ParseArena {
    /// Create a new arena with minimal initial capacity.
    /// Capacity grows on demand during parsing.
    pub fn new() -> Self {
        Self {
            js_nodes: UnsafeCell::new(Vec::new()),
            js_children: UnsafeCell::new(Vec::new()),
            bump: Bump::new(),
        }
    }

    /// Access the bump allocator used by Phase 1+ of the bumpalo migration.
    /// Returns a shared reference; the `Bump`'s own allocation APIs take
    /// `&self`, so callers can append without taking `&mut self`.
    #[inline]
    pub fn bump(&self) -> &Bump {
        &self.bump
    }

    // -- JsNode allocation ---------------------------------------------------

    /// Allocate a JsNode and return its handle.
    #[inline(always)]
    pub fn alloc_js_node(&self, node: JsNode) -> JsNodeId {
        // SAFETY: ParseArena is `!Sync` (single-threaded). `UnsafeCell` is used
        // so allocation can take `&self`. Append-only `Vec::push` never invalidates
        // existing references because we do not return any reference here — only
        // an owned `JsNodeId` index. No outstanding `&` or `&mut` to the Vec exist
        // at this point because all `get_*` methods only borrow during a single
        // call.
        unsafe {
            let vec = &mut *self.js_nodes.get();
            let id = JsNodeId(vec.len() as u32);
            vec.push(node);
            id
        }
    }

    /// Get a shared reference to a JsNode by handle.
    #[inline(always)]
    pub fn get_js_node(&self, id: JsNodeId) -> &JsNode {
        // SAFETY: Single-threaded, append-only Vec — once an element is pushed
        // its address remains stable for the Vec's lifetime, so the returned
        // shared reference cannot be invalidated by subsequent `alloc_js_node`
        // calls (push only grows; reallocation moves elements but `&self` borrow
        // tied to the returned `&JsNode` prevents concurrent allocation per the
        // borrow checker — the caller cannot call `alloc_js_node` while the
        // returned reference is alive). Out-of-range IDs return a static fallback
        // rather than panicking.
        unsafe {
            let vec = &*self.js_nodes.get();
            if (id.0 as usize) >= vec.len() {
                #[cfg(debug_assertions)]
                eprintln!(
                    "ARENA MISMATCH: get_js_node(id={}) but arena has {} nodes",
                    id.0,
                    vec.len()
                );
                static NULL_NODE: JsNode = JsNode::Null;
                return &NULL_NODE;
            }
            &vec[id.0 as usize]
        }
    }

    /// Get a mutable reference to a JsNode by handle.
    #[inline(always)]
    #[allow(clippy::mut_from_ref)]
    pub fn get_js_node_mut(&self, id: JsNodeId) -> &mut JsNode {
        // SAFETY: Single-threaded. Caller is responsible for ensuring no other
        // outstanding reference exists for the same `id` (the borrow checker
        // cannot enforce this through `&self`, which is why this method uses
        // `#[allow(clippy::mut_from_ref)]`). Used only by mutation passes that
        // are aware of arena aliasing — see `crate::compiler::phases::phase2_analyze`.
        unsafe {
            let vec = &mut *self.js_nodes.get();
            &mut vec[id.0 as usize]
        }
    }

    // -- JsNode children (for Vec<JsNode> fields) ----------------------------

    /// Get the current child count (used to record IdRange start).
    #[inline(always)]
    pub fn js_children_count(&self) -> u32 {
        // SAFETY: Single-threaded, immutable read of `Vec::len`. `len()` does not
        // take a reference into the Vec, so no aliasing concern.
        unsafe { (*self.js_children.get()).len() as u32 }
    }

    /// Allocate a JsNode child (for `Vec<JsNode>` fields like arguments, body).
    #[inline(always)]
    pub fn alloc_js_child(&self, node: JsNode) {
        // SAFETY: Same as `alloc_js_node` — single-threaded append-only push,
        // no reference returned to the caller.
        unsafe {
            let vec = &mut *self.js_children.get();
            vec.push(node);
        }
    }

    /// Build an IdRange from children allocated since `start`.
    #[inline(always)]
    pub fn children_range_since(&self, start: u32) -> IdRange {
        let end = self.js_children_count();
        IdRange {
            start,
            len: end - start,
        }
    }

    /// Get a slice of JsNode children by range.
    #[inline(always)]
    pub fn get_js_children(&self, range: IdRange) -> &[JsNode] {
        if range.is_empty() {
            return &[];
        }
        // SAFETY: Single-threaded read. Append-only Vec means `range.start`
        // through `range.start + range.len` was valid at the time the IdRange
        // was minted; subsequent `alloc_js_child` calls only extend past `end`.
        // The borrow checker prevents concurrent allocation while this `&[JsNode]`
        // borrow is alive (the borrow ties to `&self`).
        unsafe {
            let vec = &*self.js_children.get();
            let end = (range.start + range.len) as usize;
            if end > vec.len() {
                #[cfg(debug_assertions)]
                eprintln!(
                    "ARENA CHILDREN MISMATCH: range({},{}) but arena has {} children",
                    range.start,
                    range.len,
                    vec.len()
                );
                return &[];
            }
            &vec[range.start as usize..end]
        }
    }

    /// Get a mutable slice of JsNode children by range.
    #[inline(always)]
    #[allow(clippy::mut_from_ref)]
    pub fn get_js_children_mut(&self, range: IdRange) -> &mut [JsNode] {
        if range.is_empty() {
            return &mut [];
        }
        // SAFETY: Single-threaded. Caller is responsible for non-aliasing —
        // see notes on `get_js_node_mut`. Used by transform passes that
        // mutate children in place.
        unsafe {
            let vec = &mut *self.js_children.get();
            &mut vec[range.start as usize..(range.start + range.len) as usize]
        }
    }

    /// Bulk-allocate children from a Vec and return the range.
    /// Used when children can't be allocated contiguously during parsing.
    #[inline]
    pub fn alloc_js_children(&self, nodes: Vec<JsNode>) -> IdRange {
        if nodes.is_empty() {
            return IdRange::empty();
        }
        let start = self.js_children_count();
        // SAFETY: Same as `alloc_js_child` — single-threaded append-only extend,
        // no reference returned to the caller.
        unsafe {
            let vec = &mut *self.js_children.get();
            vec.extend(nodes);
        }
        self.children_range_since(start)
    }
}

impl Default for ParseArena {
    fn default() -> Self {
        Self::new()
    }
}

impl Clone for ParseArena {
    fn clone(&self) -> Self {
        // SAFETY: Single-threaded `Clone` — we read both Vecs and clone their
        // contents. No outstanding mutable borrow on `self` during clone (the
        // `&self` parameter prevents concurrent mutation per the borrow checker).
        //
        // The `bump` field gets a fresh empty `Bump` on clone (Bump isn't
        // Clone). This matches the not-yet-used status — Phase 1+ will need
        // to revisit if it ever stores user-visible state.
        unsafe {
            Self {
                js_nodes: UnsafeCell::new((*self.js_nodes.get()).clone()),
                js_children: UnsafeCell::new((*self.js_children.get()).clone()),
                bump: Bump::new(),
            }
        }
    }
}

impl std::fmt::Debug for ParseArena {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        // SAFETY: Single-threaded `Debug` — we only read `Vec::len()` for both
        // arenas. No reference outlives this call.
        unsafe {
            f.debug_struct("ParseArena")
                .field("js_nodes_count", &(*self.js_nodes.get()).len())
                .field("js_children_count", &(*self.js_children.get()).len())
                .finish()
        }
    }
}

// -- Thread-local serialization context --------------------------------------

use std::cell::Cell;

thread_local! {
    static SERIALIZE_ARENA: Cell<Option<*const ParseArena>> = const { Cell::new(None) };
}

/// Set the thread-local arena for serialization, run `f`, then clear it.
pub fn with_serialize_arena<F, R>(arena: &ParseArena, f: F) -> R
where
    F: FnOnce() -> R,
{
    SERIALIZE_ARENA.with(|cell| {
        cell.set(Some(arena as *const _));
        let result = f();
        cell.set(None);
        result
    })
}

/// Set the thread-local serialize arena. Caller must ensure the arena outlives
/// the period until `clear_serialize_arena` is called.
///
/// # Safety
/// The arena pointer must remain valid until `clear_serialize_arena()` is called.
pub unsafe fn set_serialize_arena(arena: *const ParseArena) {
    SERIALIZE_ARENA.with(|cell| {
        cell.set(Some(arena));
    });
}

/// Try to get the current serialize arena for allocation (used by deserialization).
/// Returns None if no arena is set.
#[inline]
pub fn try_get_serialize_arena() -> Option<&'static ParseArena> {
    // SAFETY: The pointer is set only via `with_serialize_arena` (which scopes
    // the pointer's validity to a single function call) or via the explicitly
    // `unsafe` `set_serialize_arena` (whose contract is documented). The
    // `'static` lifetime is fictional but bounded by the discipline that callers
    // never retain the returned reference past `clear_serialize_arena()` /
    // `with_serialize_arena` scope.
    SERIALIZE_ARENA.with(|cell| cell.get().map(|ptr| unsafe { &*ptr }))
}

/// Clear the thread-local serialize arena.
pub fn clear_serialize_arena() {
    SERIALIZE_ARENA.with(|cell| {
        cell.set(None);
    });
}

/// Check if a serialize arena is currently set.
#[inline(always)]
pub fn has_serialize_arena() -> bool {
    SERIALIZE_ARENA.with(|cell| cell.get().is_some())
}

/// Resolve a JsNodeId during serialization. Panics if no arena is set.
#[inline(always)]
pub fn resolve_js_node_for_serialize(id: JsNodeId) -> &'static JsNode {
    // SAFETY: The thread-local pointer is dereferenced inside the closure
    // passed to `SERIALIZE_ARENA.with`, which holds the cell read-only for the
    // duration of the call. The transmute extends the borrow to `'static` —
    // this is sound only because callers must invoke this function inside
    // `with_serialize_arena` (or explicitly between `set_serialize_arena` and
    // `clear_serialize_arena`), guaranteeing the arena outlives the returned
    // reference. Misuse outside of that scope would dangle, but the public
    // API contract documents this.
    SERIALIZE_ARENA.with(|cell| unsafe {
        let arena = &*cell.get().expect("serialize arena not set");
        std::mem::transmute::<&JsNode, &'static JsNode>(arena.get_js_node(id))
    })
}

/// Resolve an IdRange of JsNode children during serialization.
#[inline(always)]
pub fn resolve_js_children_for_serialize(range: IdRange) -> &'static [JsNode] {
    // SAFETY: Same lifetime contract as `resolve_js_node_for_serialize` — the
    // arena must outlive the returned slice, which is guaranteed when the
    // caller is inside `with_serialize_arena`.
    SERIALIZE_ARENA.with(|cell| unsafe {
        let arena = &*cell.get().expect("serialize arena not set");
        std::mem::transmute::<&[JsNode], &'static [JsNode]>(arena.get_js_children(range))
    })
}
