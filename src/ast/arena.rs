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
    /// JsNode children for Vec<JsNode> fields (arguments, body, properties, etc.).
    /// Referenced by IdRange.
    js_children: UnsafeCell<Vec<JsNode>>,
}

// ParseArena is explicitly NOT Sync - it's single-threaded only.
// Send is fine since we can move it between threads.
unsafe impl Send for ParseArena {}

impl ParseArena {
    /// Create a new arena with default capacity.
    pub fn new() -> Self {
        Self {
            js_nodes: UnsafeCell::new(Vec::with_capacity(256)),
            js_children: UnsafeCell::new(Vec::with_capacity(128)),
        }
    }

    // -- JsNode allocation ---------------------------------------------------

    /// Allocate a JsNode and return its handle.
    #[inline(always)]
    pub fn alloc_js_node(&self, node: JsNode) -> JsNodeId {
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
        unsafe {
            let vec = &*self.js_nodes.get();
            if (id.0 as usize) >= vec.len() {
                // Return a static Null node for arena mismatch
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
        unsafe {
            let vec = &mut *self.js_nodes.get();
            &mut vec[id.0 as usize]
        }
    }

    // -- JsNode children (for Vec<JsNode> fields) ----------------------------

    /// Get the current child count (used to record IdRange start).
    #[inline(always)]
    pub fn js_children_count(&self) -> u32 {
        unsafe { (*self.js_children.get()).len() as u32 }
    }

    /// Allocate a JsNode child (for Vec<JsNode> fields like arguments, body).
    #[inline(always)]
    pub fn alloc_js_child(&self, node: JsNode) {
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
        unsafe {
            let vec = &*self.js_children.get();
            let end = (range.start + range.len) as usize;
            if end > vec.len() {
                // Graceful fallback for arena mismatch (e.g., DESER_ARENA used during serialize)
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
        unsafe {
            Self {
                js_nodes: UnsafeCell::new((*self.js_nodes.get()).clone()),
                js_children: UnsafeCell::new((*self.js_children.get()).clone()),
            }
        }
    }
}

impl std::fmt::Debug for ParseArena {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
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

/// Check if a serialize arena is currently set.
#[inline(always)]
pub fn has_serialize_arena() -> bool {
    SERIALIZE_ARENA.with(|cell| cell.get().is_some())
}

/// Resolve a JsNodeId during serialization. Panics if no arena is set.
#[inline(always)]
pub fn resolve_js_node_for_serialize(id: JsNodeId) -> &'static JsNode {
    SERIALIZE_ARENA.with(|cell| unsafe {
        let arena = &*cell.get().expect("serialize arena not set");
        // SAFETY: the arena outlives the serialization call
        std::mem::transmute::<&JsNode, &'static JsNode>(arena.get_js_node(id))
    })
}

/// Resolve an IdRange of JsNode children during serialization.
#[inline(always)]
pub fn resolve_js_children_for_serialize(range: IdRange) -> &'static [JsNode] {
    SERIALIZE_ARENA.with(|cell| unsafe {
        let arena = &*cell.get().expect("serialize arena not set");
        std::mem::transmute::<&[JsNode], &'static [JsNode]>(arena.get_js_children(range))
    })
}
