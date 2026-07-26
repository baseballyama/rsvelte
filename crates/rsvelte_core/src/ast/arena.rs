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
//! - Safe allocation stores nodes/slices in fixed-size chunks that are never
//!   moved or reallocated, so growing the chunk tables cannot move values
//!   referenced by previously returned shared references
//! - Builders return handles, not mutable references into arena storage
//! - Mutable/destructive access is `unsafe` and requires callers to prove no
//!   aliases exist

use std::cell::{Cell, RefCell, UnsafeCell};
use std::mem::MaybeUninit;

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

const CHILD_CHUNK_BITS: u32 = 6;
const CHILD_CHUNK_LEN: usize = 1 << CHILD_CHUNK_BITS;
const CHILD_CHUNK_MASK: usize = CHILD_CHUNK_LEN - 1;

/// Append-only chunked storage for child slices (`Vec<JsNode>` AST fields).
///
/// Children are addressed by the physical index of their first element, so a
/// lookup is one pointer load plus an offset — no side table from logical
/// start to owning range. Every range is kept contiguous: a range that would
/// straddle a chunk boundary starts a new chunk (the tail of the previous one
/// is padded with `JsNode::Null`), and a range longer than one chunk gets a
/// block spanning several consecutive chunk slots.
struct ChildStore {
    /// Base pointer of each chunk slot; slot `i` covers physical indices
    /// `[i * CHILD_CHUNK_LEN, (i + 1) * CHILD_CHUNK_LEN)`.
    slots: Vec<*mut MaybeUninit<JsNode>>,
    /// Owning allocations (leaked `Box`es, freed in `Drop`). One block backs
    /// one or more consecutive slots. Kept as raw pointers so the cached slot
    /// pointers keep their provenance when this `Vec` reallocates.
    blocks: Vec<*mut [MaybeUninit<JsNode>]>,
    /// Physical index just past the last initialized child (padding included).
    len: usize,
}

impl ChildStore {
    #[inline]
    fn new() -> Self {
        ChildStore {
            slots: Vec::new(),
            blocks: Vec::new(),
            len: 0,
        }
    }

    /// Reserve `chunks` new chunk slots backed by a single allocation.
    #[cold]
    fn grow(&mut self, chunks: usize) {
        let block = Box::into_raw(Box::new_uninit_slice(chunks * CHILD_CHUNK_LEN));
        let base = block.cast::<MaybeUninit<JsNode>>();
        for i in 0..chunks {
            // SAFETY: `base` owns `chunks * CHILD_CHUNK_LEN` slots, so every
            // offset below stays inside the same allocation.
            self.slots.push(unsafe { base.add(i * CHILD_CHUNK_LEN) });
        }
        self.blocks.push(block);
    }

    /// Pointer to the slot at physical index `index`.
    ///
    /// # Safety
    /// The chunk holding `index` must already be allocated.
    #[inline(always)]
    unsafe fn ptr(&self, index: usize) -> *mut JsNode {
        // SAFETY: the caller guarantees the chunk exists; `index & MASK` is
        // inside it by construction.
        unsafe {
            self.slots
                .get_unchecked(index >> CHILD_CHUNK_BITS)
                .add(index & CHILD_CHUNK_MASK)
                .cast::<JsNode>()
        }
    }

    /// Physical start index for a contiguous run of `len` children, padding the
    /// current chunk and allocating new ones as needed.
    #[inline]
    fn reserve(&mut self, len: usize) -> usize {
        let offset = self.len & CHILD_CHUNK_MASK;
        if offset != 0 && offset + len > CHILD_CHUNK_LEN {
            // Pad the current chunk so the run stays contiguous.
            let pad_to = self.len - offset + CHILD_CHUNK_LEN;
            while self.len < pad_to {
                // SAFETY: the current chunk is allocated (offset != 0 means it
                // already holds initialized children).
                unsafe { self.ptr(self.len).write(JsNode::Null) };
                self.len += 1;
            }
        }
        let start = self.len;
        let needed = (start + len).div_ceil(CHILD_CHUNK_LEN);
        if needed > self.slots.len() {
            self.grow(needed - self.slots.len());
        }
        start
    }
}

impl Drop for ChildStore {
    fn drop(&mut self) {
        for index in 0..self.len {
            // SAFETY: every physical index below `len` was initialized by
            // `alloc_js_children` (payload) or `reserve` (padding),
            // and is dropped once.
            unsafe { self.ptr(index).drop_in_place() };
        }
        for block in self.blocks.drain(..) {
            // SAFETY: each block came from `Box::into_raw` in `grow` and is
            // freed exactly once here. Elements were dropped above.
            unsafe { drop(Box::from_raw(block)) };
        }
    }
}

const NODE_CHUNK_BITS: u32 = 6;
const NODE_CHUNK_LEN: usize = 1 << NODE_CHUNK_BITS;
const NODE_CHUNK_MASK: usize = NODE_CHUNK_LEN - 1;

/// Append-only chunked storage for `JsNode`.
///
/// One heap allocation per `NODE_CHUNK_LEN` nodes instead of one `Box` per
/// node, while keeping node addresses stable: chunks are never moved or
/// reallocated, only appended to the chunk-pointer `Vec`.
struct NodeStore {
    /// One allocation per chunk (leaked `Box`es, freed in `Drop`). Raw pointers
    /// keep write provenance: node handles hand out `&mut JsNode`, which must
    /// not be derived from a shared borrow of the chunk table.
    chunks: Vec<*mut [MaybeUninit<JsNode>]>,
    len: usize,
}

impl NodeStore {
    #[inline]
    fn new() -> Self {
        NodeStore {
            chunks: Vec::new(),
            len: 0,
        }
    }

    #[cold]
    fn grow(&mut self) {
        self.chunks
            .push(Box::into_raw(Box::new_uninit_slice(NODE_CHUNK_LEN)));
    }

    #[inline(always)]
    fn push(&mut self, node: JsNode) -> u32 {
        let index = self.len;
        if index >> NODE_CHUNK_BITS == self.chunks.len() {
            self.grow();
        }
        // SAFETY: the chunk holding `index` now exists, and the slot is
        // uninitialized (only indices below `len` are initialized), so writing
        // it without dropping the old value is correct.
        unsafe { self.ptr(index).write(node) };
        self.len = index + 1;
        index as u32
    }

    /// Raw pointer to the node slot at `index`.
    ///
    /// # Safety
    /// The chunk holding `index` must already be allocated.
    #[inline(always)]
    unsafe fn ptr(&self, index: usize) -> *mut JsNode {
        // SAFETY: the caller guarantees the chunk exists; `index & MASK` is
        // inside it by construction.
        unsafe {
            self.chunks
                .get_unchecked(index >> NODE_CHUNK_BITS)
                .cast::<JsNode>()
                .add(index & NODE_CHUNK_MASK)
        }
    }
}

impl Drop for NodeStore {
    fn drop(&mut self) {
        for index in 0..self.len {
            // SAFETY: slots below `len` were written by `push` and are dropped
            // exactly once, here.
            unsafe { self.ptr(index).drop_in_place() };
        }
        for chunk in self.chunks.drain(..) {
            // SAFETY: each chunk came from `Box::into_raw` in `grow` and is
            // freed exactly once here. Elements were dropped above.
            unsafe { drop(Box::from_raw(chunk)) };
        }
    }
}

/// Arena that owns all `JsNode` instances for a single parse unit.
///
/// Allocation takes `&self` (not `&mut self`) so that builder functions
/// can nest calls without borrow-checker conflicts.
pub struct ParseArena {
    /// All standalone JsNode instances (referenced by JsNodeId).
    js_nodes: UnsafeCell<NodeStore>,
    /// JsNode children for `Vec<JsNode>` fields (arguments, body, properties, etc.).
    /// `IdRange::start` is the physical index of the first child.
    js_children: UnsafeCell<ChildStore>,
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
            js_nodes: UnsafeCell::new(NodeStore::new()),
            js_children: UnsafeCell::new(ChildStore::new()),
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
        // so allocation can take `&self`. Nodes live in fixed-size chunks that
        // are never moved, so growing the chunk-pointer Vec cannot invalidate
        // references handed out earlier.
        unsafe {
            let store = &mut *self.js_nodes.get();
            JsNodeId(store.push(node))
        }
    }

    /// Get a shared reference to a JsNode by handle.
    #[inline(always)]
    pub fn get_js_node(&self, id: JsNodeId) -> &JsNode {
        // SAFETY: Single-threaded read. The returned reference points into a
        // chunk allocation, not into the chunk-pointer Vec, so later safe
        // appends cannot invalidate it.
        unsafe {
            let store = &*self.js_nodes.get();
            let index = id.0 as usize;
            if index >= store.len {
                static NULL_NODE: JsNode = JsNode::Null;
                return &NULL_NODE;
            }
            &*store.ptr(index)
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
            let store = &mut *self.js_nodes.get();
            let index = id.0 as usize;
            assert!(index < store.len, "arena node index out of bounds");
            &mut *store.ptr(index)
        }
    }

    // -- JsNode children (for Vec<JsNode> fields) ----------------------------

    /// Get a slice of JsNode children by range.
    #[inline(always)]
    pub fn get_js_children(&self, range: IdRange) -> &[JsNode] {
        if range.is_empty() {
            return &[];
        }
        // SAFETY: Single-threaded read. Children live in chunk allocations that
        // are never moved, so later safe allocation cannot invalidate a slice
        // returned here.
        unsafe {
            let store = &*self.js_children.get();
            let start = range.start as usize;
            let len = range.len as usize;
            if start + len > store.len {
                return &[];
            }
            std::slice::from_raw_parts(store.ptr(start), len)
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
            let store = &mut *self.js_children.get();
            let start = range.start as usize;
            let len = range.len as usize;
            assert!(start + len <= store.len, "arena child range not found");
            std::slice::from_raw_parts_mut(store.ptr(start), len)
        }
    }

    /// Bulk-allocate children from a Vec and return the range.
    /// Used when children can't be allocated contiguously during parsing.
    #[inline]
    pub fn alloc_js_children(&self, nodes: Vec<JsNode>) -> IdRange {
        let len = nodes.len();
        if len == 0 {
            return IdRange::empty();
        }
        // SAFETY: Single-threaded append. The nodes already exist, so no caller
        // code runs while the run is filled and the borrow cannot alias.
        unsafe {
            let store = &mut *self.js_children.get();
            let start = store.reserve(len);
            let mut index = start;
            for node in nodes {
                store.ptr(index).write(node);
                index += 1;
            }
            store.len = index;
            IdRange {
                start: start as u32,
                len: len as u32,
            }
        }
    }
}

impl Default for ParseArena {
    fn default() -> Self {
        Self::new()
    }
}

impl std::fmt::Debug for ParseArena {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        // SAFETY: Single-threaded `Debug` — we only read counters. No reference
        // outlives this call.
        unsafe {
            f.debug_struct("ParseArena")
                .field("js_nodes_count", &(*self.js_nodes.get()).len)
                .field("js_children_count", &(*self.js_children.get()).len)
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
            optional: false,
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

    #[test]
    fn js_nodes_span_many_chunks() {
        let arena = ParseArena::new();
        let count = NODE_CHUNK_LEN * 7 + 3;
        let ids: Vec<_> = (0..count)
            .map(|i| arena.alloc_js_node(ident(&format!("n{i}"))))
            .collect();

        for (i, id) in ids.iter().enumerate() {
            assert_eq!(id.0 as usize, i);
            let expected = format!("n{i}");
            assert!(
                matches!(arena.get_js_node(*id), JsNode::Identifier { name, .. } if *name == expected)
            );
        }
    }

    #[test]
    fn child_ranges_stay_contiguous_across_chunk_boundaries() {
        let arena = ParseArena::new();
        // Range lengths that repeatedly straddle a chunk edge, plus ranges
        // longer than one chunk (multi-slot blocks).
        let lens = [
            1,
            CHILD_CHUNK_LEN - 1,
            CHILD_CHUNK_LEN,
            CHILD_CHUNK_LEN + 1,
            7,
            CHILD_CHUNK_LEN * 3 + 5,
            2,
            CHILD_CHUNK_LEN * 2,
            13,
        ];
        let mut ranges = Vec::new();
        for (r, len) in lens.iter().enumerate() {
            let nodes: Vec<_> = (0..*len).map(|i| ident(&format!("r{r}c{i}"))).collect();
            let range = arena.alloc_js_children(nodes);
            assert_eq!(range.len as usize, *len);
            ranges.push(range);
        }

        // Starts are monotonically increasing and never overlap a previous run.
        let mut previous_end = 0;
        for range in &ranges {
            assert!(range.start >= previous_end, "child ranges must not overlap");
            previous_end = range.start + range.len;
        }

        for (r, range) in ranges.iter().enumerate() {
            let children = arena.get_js_children(*range);
            assert_eq!(children.len(), lens[r]);
            for (i, child) in children.iter().enumerate() {
                let expected = format!("r{r}c{i}");
                assert!(matches!(child, JsNode::Identifier { name, .. } if *name == expected));
            }
        }
    }

    #[test]
    fn oversized_child_slices_survive_later_allocations() {
        let arena = ParseArena::new();
        let big: Vec<_> = (0..CHILD_CHUNK_LEN * 4)
            .map(|i| ident(&format!("b{i}")))
            .collect();
        let range = arena.alloc_js_children(big);
        let children = arena.get_js_children(range);

        for i in 0..1_000 {
            arena.alloc_js_children(vec![ident(&format!("n{i}"))]);
        }

        assert_eq!(children.len(), CHILD_CHUNK_LEN * 4);
        assert!(matches!(&children[0], JsNode::Identifier { name, .. } if name == "b0"));
        let last = format!("b{}", CHILD_CHUNK_LEN * 4 - 1);
        assert!(
            matches!(children.last().unwrap(), JsNode::Identifier { name, .. } if *name == last)
        );
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
