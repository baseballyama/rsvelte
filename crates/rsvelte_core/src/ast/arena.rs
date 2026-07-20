//! Arena allocator for parse-phase AST nodes.
//!
//! Replaces repeated AST ownership plumbing with arena-owned storage referenced
//! by `JsNodeId` indices. This gives:
//!
//! - **Zero-cost reads** (`arena.get_js_node(id)` is a single array index)
//! - **Stable shared references** (pushing more handles cannot move nodes)
//!
//! Follows the proven `JsArena` pattern from
//! `src/compiler/phases/3_transform/js_ast/arena.rs`.
//!
//! # Safety
//!
//! The arena is single-threaded (not `Sync`) and append-only for safe APIs.
//! `UnsafeCell` is safe because:
//! - Safe allocation stores nodes/slices behind `Box`, so `Vec` reallocation
//!   cannot move values referenced by previously returned shared references
//! - Builders return handles, not mutable references into arena storage
//! - Mutable/destructive access is `unsafe` and requires callers to prove no
//!   aliases exist

use std::cell::{Cell, RefCell, UnsafeCell};

use bumpalo::Bump;
use rustc_hash::FxHashMap;

use super::typed_expr::JsNode;

/// Leading + trailing comment arrays attached to a node, keyed by the node's
/// absolute `start` offset. Stored as raw ESTree `serde_json::Value`s (the same
/// shape the parser emits), so they round-trip byte-identically through
/// `parse()` output. Kept in a per-arena side table rather than on every
/// `JsNode` variant: comments are rare, and a side table avoids bloating every
/// node by 32 bytes (mirrors the `ignore_comment_map` side-channel on `Program`).
pub type NodeComments = (
    Option<Vec<serde_json::Value>>,
    Option<Vec<serde_json::Value>>,
);

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

#[derive(Clone)]
struct ChildRange {
    start: u32,
    len: u32,
    nodes: Box<[JsNode]>,
}

/// Arena that owns all `JsNode` instances for a single parse unit.
///
/// Allocation takes `&self` (not `&mut self`) so that builder functions
/// can nest calls without borrow-checker conflicts.
pub struct ParseArena {
    /// All standalone JsNode instances (referenced by JsNodeId).
    #[allow(clippy::vec_box)] // Box keeps node addresses stable across handle Vec growth.
    js_nodes: UnsafeCell<Vec<Box<JsNode>>>,
    /// JsNode children for `Vec<JsNode>` fields (arguments, body, properties, etc.).
    /// `IdRange` stores logical offsets; each range owns one boxed slice so
    /// returned child slices remain stable if this table grows.
    js_children: UnsafeCell<Vec<ChildRange>>,
    /// Maps each logical child start offset to the index in `js_children` that
    /// owns that range. Non-start offsets are left as `u32::MAX`.
    js_child_range_by_start: UnsafeCell<Vec<u32>>,
    next_js_child_start: UnsafeCell<u32>,
    /// Bump arena reserved for subsequent migration phases. Currently unused —
    /// Phase 0 adds it to ParseArena without changing public APIs so that
    /// Phase 1+ have a place to allocate from.
    bump: Bump,
    /// Side table of `leadingComments`/`trailingComments` keyed by a node's
    /// `(start, end)` span. Populated by `JsNode::from_value` when comment
    /// capture is active (see [`comment_capture_active`] — the `parse()` path),
    /// and read back by `JsNode`'s `Serialize` impl so AST output stays
    /// comment-lossless without storing comments on every node. The key includes
    /// `end` because a node and its first child can share a `start` (e.g. a
    /// `SequenceExpression` and its first element) — keying on `start` alone
    /// would leak the comment onto the inner node too.
    node_comments: RefCell<FxHashMap<(u32, u32), NodeComments>>,
}

// ParseArena is explicitly NOT Sync - it's single-threaded only.
// Send is fine since we can move it between threads.
//
// SAFETY: ParseArena owns its `UnsafeCell` storage. Moving it
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
            js_child_range_by_start: UnsafeCell::new(Vec::new()),
            next_js_child_start: UnsafeCell::new(0),
            bump: Bump::new(),
            node_comments: RefCell::new(FxHashMap::default()),
        }
    }

    // -- Node comment side table (parse-only) --------------------------------

    /// Record the comments attached to the node at `(start, end)`. Callers gate
    /// this behind [`comment_capture_active`] (the parse path); it is never
    /// reached on the compile path, so there is no per-call flag check here.
    #[inline]
    pub fn record_node_comments(
        &self,
        start: u32,
        end: u32,
        leading: Option<Vec<serde_json::Value>>,
        trailing: Option<Vec<serde_json::Value>>,
    ) {
        if leading.is_none() && trailing.is_none() {
            return;
        }
        self.node_comments
            .borrow_mut()
            .insert((start, end), (leading, trailing));
    }

    /// Whether any node comments have been recorded (cheap guard for the
    /// serialize hot path).
    #[inline]
    pub fn has_node_comments(&self) -> bool {
        !self.node_comments.borrow().is_empty()
    }

    /// Look up the comments recorded for the node spanning `(start, end)`, if any.
    #[inline]
    pub fn node_comments(&self, start: u32, end: u32) -> Option<NodeComments> {
        self.node_comments.borrow().get(&(start, end)).cloned()
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
        // so allocation can take `&self`. Values are stored behind `Box`, so
        // growing the handle Vec cannot move nodes referenced by earlier reads.
        unsafe {
            let vec = &mut *self.js_nodes.get();
            let id = JsNodeId(vec.len() as u32);
            vec.push(Box::new(node));
            id
        }
    }

    /// Get a shared reference to a JsNode by handle.
    #[inline(always)]
    pub fn get_js_node(&self, id: JsNodeId) -> &JsNode {
        // SAFETY: Single-threaded read. The returned reference points into a
        // `Box<JsNode>`, not into the handle Vec allocation, so later safe
        // appends cannot invalidate it.
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
            vec[id.0 as usize].as_ref()
        }
    }

    /// Get a mutable reference to a JsNode by handle.
    ///
    /// # Safety
    /// The caller must ensure no shared or mutable references to the same node
    /// are live for the duration of the returned borrow.
    #[inline(always)]
    #[allow(clippy::mut_from_ref)]
    pub unsafe fn get_js_node_mut(&self, id: JsNodeId) -> &mut JsNode {
        // SAFETY: Enforced by the caller's contract above.
        unsafe {
            let vec = &mut *self.js_nodes.get();
            vec[id.0 as usize].as_mut()
        }
    }

    // -- JsNode children (for Vec<JsNode> fields) ----------------------------

    /// Get a slice of JsNode children by range.
    #[inline(always)]
    pub fn get_js_children(&self, range: IdRange) -> &[JsNode] {
        if range.is_empty() {
            return &[];
        }
        // SAFETY: Single-threaded read. Matching ranges own boxed slices, so
        // later safe allocation cannot move returned child slices.
        unsafe {
            let ranges = &*self.js_children.get();
            let by_start = &*self.js_child_range_by_start.get();
            if let Some(&range_index) = by_start.get(range.start as usize)
                && range_index != u32::MAX
            {
                let entry = &ranges[range_index as usize];
                if entry.start == range.start && entry.len == range.len {
                    return entry.nodes.as_ref();
                }
            }

            #[cfg(debug_assertions)]
            {
                let child_count = *self.next_js_child_start.get();
                #[cfg(debug_assertions)]
                eprintln!(
                    "ARENA CHILDREN MISMATCH: range({},{}) but arena has {} children",
                    range.start, range.len, child_count
                );
            }
            &[]
        }
    }

    /// Get a mutable slice of JsNode children by range.
    ///
    /// # Safety
    /// The caller must ensure no shared or mutable references to the same child
    /// range are live for the duration of the returned borrow.
    #[inline(always)]
    #[allow(clippy::mut_from_ref)]
    pub unsafe fn get_js_children_mut(&self, range: IdRange) -> &mut [JsNode] {
        if range.is_empty() {
            return &mut [];
        }
        // SAFETY: Enforced by the caller's contract above.
        unsafe {
            let ranges = &mut *self.js_children.get();
            let by_start = &*self.js_child_range_by_start.get();
            let range_index = by_start
                .get(range.start as usize)
                .copied()
                .filter(|idx| *idx != u32::MAX)
                .expect("arena child range not found");
            let entry = &mut ranges[range_index as usize];
            assert_eq!(entry.start, range.start, "arena child range start mismatch");
            assert_eq!(entry.len, range.len, "arena child range len mismatch");
            entry.nodes.as_mut()
        }
    }

    /// Bulk-allocate children from a Vec and return the range.
    /// Used when children can't be allocated contiguously during parsing.
    #[inline]
    pub fn alloc_js_children(&self, nodes: Vec<JsNode>) -> IdRange {
        if nodes.is_empty() {
            return IdRange::empty();
        }
        // SAFETY: Single-threaded counter update.
        let start = unsafe {
            let next = &mut *self.next_js_child_start.get();
            let start = *next;
            *next += nodes.len() as u32;
            start
        };
        let len = nodes.len();
        // SAFETY: Single-threaded append. Children are kept in a boxed slice, so
        // returned slices remain stable even if the range table reallocates.
        unsafe {
            let ranges = &mut *self.js_children.get();
            let range_index = ranges.len() as u32;
            ranges.push(ChildRange {
                start,
                len: len as u32,
                nodes: nodes.into_boxed_slice(),
            });
            let by_start = &mut *self.js_child_range_by_start.get();
            let required_len = start as usize + len;
            if by_start.len() < required_len {
                by_start.resize(required_len, u32::MAX);
            }
            by_start[start as usize] = range_index;
        }
        IdRange {
            start,
            len: len as u32,
        }
    }
}

impl Default for ParseArena {
    fn default() -> Self {
        Self::new()
    }
}

impl Clone for ParseArena {
    fn clone(&self) -> Self {
        // SAFETY: Single-threaded `Clone` — we read the arena tables and clone
        // their contents. Callers must not clone while unsafe mutable/destructive
        // arena operations are active.
        //
        // The `bump` field gets a fresh empty `Bump` on clone (Bump isn't
        // Clone). This matches the not-yet-used status — Phase 1+ will need
        // to revisit if it ever stores user-visible state.
        unsafe {
            Self {
                js_nodes: UnsafeCell::new((*self.js_nodes.get()).clone()),
                js_children: UnsafeCell::new((*self.js_children.get()).clone()),
                js_child_range_by_start: UnsafeCell::new(
                    (*self.js_child_range_by_start.get()).clone(),
                ),
                next_js_child_start: UnsafeCell::new(*self.next_js_child_start.get()),
                bump: Bump::new(),
                node_comments: RefCell::new(self.node_comments.borrow().clone()),
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
                .field("js_children_count", &*self.next_js_child_start.get())
                .finish()
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use compact_str::CompactString;

    fn ident(name: &str) -> JsNode {
        JsNode::Identifier {
            start: 0,
            end: 0,
            loc: None,
            name: CompactString::new(name),
            type_annotation: None,
        }
    }

    #[test]
    fn js_node_refs_survive_later_allocations() {
        let arena = ParseArena::new();
        let id = arena.alloc_js_node(ident("first"));
        let node = arena.get_js_node(id);

        for i in 0..10_000 {
            arena.alloc_js_node(ident(&format!("n{i}")));
        }

        assert!(matches!(node, JsNode::Identifier { name, .. } if name == "first"));
    }

    #[test]
    fn js_child_slices_survive_later_allocations() {
        let arena = ParseArena::new();
        let range = arena.alloc_js_children(vec![ident("first")]);
        let children = arena.get_js_children(range);

        for i in 0..10_000 {
            arena.alloc_js_children(vec![ident(&format!("n{i}"))]);
        }

        assert!(matches!(&children[0], JsNode::Identifier { name, .. } if name == "first"));
    }

    #[test]
    fn js_child_lookup_uses_start_index() {
        let arena = ParseArena::new();
        let ranges: Vec<_> = (0..10_000)
            .map(|i| arena.alloc_js_children(vec![ident(&format!("n{i}"))]))
            .collect();

        let children = arena.get_js_children(ranges[9_999]);
        assert!(matches!(&children[0], JsNode::Identifier { name, .. } if name == "n9999"));
    }
}

// -- Thread-local serialization context --------------------------------------

thread_local! {
    static SERIALIZE_ARENA: Cell<Option<*const ParseArena>> = const { Cell::new(None) };
    /// Whether `JsNode::from_value` should record node comments into the current
    /// serialize arena's side table. A thread-local so the per-node check in the
    /// hot `from_value` path is a single `Cell` read; `parse()` flips it on via
    /// [`CommentCaptureGuard`], the compile path leaves it off.
    static COMMENT_CAPTURE: Cell<bool> = const { Cell::new(false) };
}

/// Whether node-comment capture is currently active (the `parse()` AST path).
#[inline(always)]
pub fn comment_capture_active() -> bool {
    COMMENT_CAPTURE.with(|c| c.get())
}

/// RAII guard that enables [`comment_capture_active`] for its lifetime,
/// restoring the previous value on drop (so a comment-capturing `parse()`
/// nested under a non-capturing one — or vice versa — leaves no residue).
pub struct CommentCaptureGuard {
    prev: bool,
}

impl CommentCaptureGuard {
    #[inline]
    pub fn new() -> Self {
        let prev = COMMENT_CAPTURE.with(|c| c.replace(true));
        CommentCaptureGuard { prev }
    }
}

impl Default for CommentCaptureGuard {
    #[inline]
    fn default() -> Self {
        Self::new()
    }
}

impl Drop for CommentCaptureGuard {
    #[inline]
    fn drop(&mut self) {
        COMMENT_CAPTURE.with(|c| c.set(self.prev));
    }
}

/// RAII guard that installs an arena pointer in `SERIALIZE_ARENA` for
/// the lifetime of the guard, restoring whatever pointer was set on
/// entry when dropped (including on panic unwind).
///
/// Restoring (rather than clearing to `None`) is critical: nested
/// callers — e.g. `JsNode::to_value` falling back to `DESER_ARENA` while
/// a `compile()` already installed its own arena — would otherwise wipe
/// the outer scope's pointer and leave later serialization reads without
/// the correct arena, surfacing as cross-talk between compilations on the
/// same thread.
pub struct SerializeArenaGuard {
    prev: Option<*const ParseArena>,
}

impl SerializeArenaGuard {
    /// Install `arena` as the current serialize arena.
    ///
    /// # Safety
    /// The caller must ensure `arena` outlives the returned guard.
    #[inline]
    pub unsafe fn new(arena: *const ParseArena) -> Self {
        let prev = SERIALIZE_ARENA.with(|cell| {
            let p = cell.get();
            cell.set(Some(arena));
            p
        });
        SerializeArenaGuard { prev }
    }
}

impl Drop for SerializeArenaGuard {
    #[inline]
    fn drop(&mut self) {
        SERIALIZE_ARENA.with(|cell| cell.set(self.prev));
    }
}

/// Install `arena`, run `f`, then restore the previous pointer.
/// Thin wrapper around `SerializeArenaGuard` for callers that don't
/// need to interleave AST mutation with the install/restore pair.
pub fn with_serialize_arena<F, R>(arena: &ParseArena, f: F) -> R
where
    F: FnOnce() -> R,
{
    // SAFETY: `arena` is a live `&ParseArena` borrowed for this whole function,
    // so it outlives `_guard`, satisfying `SerializeArenaGuard::new`'s contract.
    let _guard = unsafe { SerializeArenaGuard::new(arena as *const _) };
    f()
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

/// Run `f` with the current serialize arena if one is installed.
#[inline]
pub fn try_with_current_serialize_arena<R>(f: impl FnOnce(&ParseArena) -> R) -> Option<R> {
    SERIALIZE_ARENA.with(|cell| {
        let ptr = cell.get()?;
        // SAFETY: The returned reference is scoped to this closure call. The
        // pointer is installed by `with_serialize_arena` or by the unsafe
        // `set_serialize_arena` API, whose caller must keep the arena alive.
        Some(f(unsafe { &*ptr }))
    })
}

/// Run `f` with the current serialize arena. Panics if no arena is set.
#[inline]
pub fn with_current_serialize_arena<R>(f: impl FnOnce(&ParseArena) -> R) -> R {
    try_with_current_serialize_arena(f).expect("serialize arena not set")
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
