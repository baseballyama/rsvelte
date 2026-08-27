//! Arena allocator for JavaScript AST nodes.
//!
//! We store expressions and statements in stable chunks and reference them by
//! index (`ExprId` / `StmtId`). This gives:
//!
//! - **Zero-cost reads** (`arena.get_expr(id)` is a single array index)
//! - **Stable shared references** (pushing more handles cannot move nodes)
//!
//! The allocation methods (`alloc_expr`, `alloc_stmt`) take `&self` instead of
//! `&mut self`, using `UnsafeCell` internally. This is critical because builder
//! functions like `b::call(arena, b::member_path(arena, "$.x"), args)` pass
//! the arena to multiple nested calls. With `&mut self`, this would require
//! extracting every nested call into a temporary variable. With `&self`,
//! nested calls Just Work.
//!
//! # Safety
//!
//! The arena is single-threaded (not `Sync`) and append-only for safe APIs.
//! `UnsafeCell` is safe here because:
//! - Growing the chunk-pointer `Vec` cannot move nodes in existing chunks
//! - Builders return handles or owned values, not mutable references into
//!   arena storage
//! - Mutable/destructive access is `unsafe` and requires callers to prove no
//!   aliases exist

use super::nodes::{JsExpr, JsStatement};
use compact_str::CompactString;
use rustc_hash::FxHashMap;
use std::cell::UnsafeCell;
use std::mem::MaybeUninit;

/// Handle to an expression stored in the arena.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct ExprId(pub u32);

/// Handle to a statement stored in the arena.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct StmtId(pub u32);

const NODE_CHUNK_BITS: usize = 5;
const NODE_CHUNK_SIZE: usize = 1 << NODE_CHUNK_BITS;
const NODE_CHUNK_MASK: usize = NODE_CHUNK_SIZE - 1;

struct NodeStore<T> {
    chunks: Vec<Box<[MaybeUninit<T>]>>,
    len: usize,
}

impl<T> NodeStore<T> {
    fn new() -> Self {
        Self {
            chunks: Vec::new(),
            len: 0,
        }
    }

    #[inline(always)]
    fn push(&mut self, value: T) -> usize {
        if self.len & NODE_CHUNK_MASK == 0 {
            self.chunks
                .push(Box::<[T]>::new_uninit_slice(NODE_CHUNK_SIZE));
        }
        let index = self.len;
        self.len += 1;
        // SAFETY: the chunk was allocated above and this slot is written once.
        unsafe { self.ptr(index).write(value) };
        index
    }

    #[inline(always)]
    unsafe fn ptr(&self, index: usize) -> *mut T {
        // SAFETY: callers only pass initialized indices below `len`.
        unsafe {
            self.chunks
                .get_unchecked(index >> NODE_CHUNK_BITS)
                .as_ptr()
                .add(index & NODE_CHUNK_MASK)
                .cast_mut()
                .cast::<T>()
        }
    }
}

impl<T> Drop for NodeStore<T> {
    fn drop(&mut self) {
        for index in 0..self.len {
            // SAFETY: slots below `len` were initialized exactly once.
            unsafe { self.ptr(index).drop_in_place() };
        }
    }
}

/// Arena that owns all `JsExpr` and `JsStatement` nodes for a single
/// compilation unit.
///
/// Allocation takes `&self` (not `&mut self`) so that builder functions
/// can nest calls without borrow-checker conflicts.
pub struct JsArena {
    exprs: UnsafeCell<NodeStore<JsExpr>>,
    stmts: UnsafeCell<NodeStore<JsStatement>>,
    /// Source spans for generated identifiers whose names are unique within
    /// this compilation unit. Keeping this out of [`JsExpr`] lets lowering
    /// continue to match ordinary `Identifier` nodes while both printers can
    /// recover the location carried by upstream's shared identifier object.
    identifier_spans: UnsafeCell<FxHashMap<CompactString, (u32, u32)>>,
    /// Source spans inherited by otherwise-unlocated identifiers while one
    /// generated expression is printed. Keying the scope by `ExprId` keeps
    /// user identifiers with the same spelling elsewhere independent.
    expression_identifier_spans: UnsafeCell<FxHashMap<ExprId, (CompactString, (u32, u32))>>,
    /// Source spans for expressions that must remain bare IR variants.
    ///
    /// In particular, member-expression consumers inspect the object by
    /// variant, so wrapping its root identifier in `JsExpr::Spanned` changes
    /// transform semantics. Keep those uncommon spans out of band instead of
    /// growing every expression node.
    bare_expr_spans: UnsafeCell<Option<FxHashMap<ExprId, (u32, u32)>>>,
}

// JsArena is explicitly NOT Sync - it's single-threaded only.
// SAFETY: the arena owns its `UnsafeCell`-backed storage outright and hands out no
// thread-shared references, so moving the whole arena across threads (Send) transfers
// sole ownership without cross-thread aliasing. It is deliberately not `Sync`, which
// is what keeps the `&self` interior mutability sound.
unsafe impl Send for JsArena {}

impl JsArena {
    /// Create an empty arena. The first node allocates one fixed-size chunk.
    pub fn new() -> Self {
        Self {
            exprs: UnsafeCell::new(NodeStore::new()),
            stmts: UnsafeCell::new(NodeStore::new()),
            identifier_spans: UnsafeCell::new(FxHashMap::default()),
            expression_identifier_spans: UnsafeCell::new(FxHashMap::default()),
            bare_expr_spans: UnsafeCell::new(None),
        }
    }

    /// Associate every use of a generated, compilation-unit-unique identifier
    /// with the source location from which it was derived.
    pub fn note_identifier_span(&self, name: &str, start: u32, end: u32) {
        // SAFETY: like node allocation, span registration is single-threaded.
        unsafe {
            (*self.identifier_spans.get()).insert(CompactString::new(name), (start, end));
        }
    }

    /// Return the source span attached to a generated identifier name.
    #[inline]
    pub fn identifier_span(&self, name: &str) -> Option<(u32, u32)> {
        // SAFETY: callers only read during/after single-threaded construction.
        unsafe { (*self.identifier_spans.get()).get(name).copied() }
    }

    /// Associate unlocated uses of `name` below one generated expression with
    /// the source identifier that upstream cloned into that expression.
    pub fn note_expression_identifier_span(
        &self,
        expression: ExprId,
        name: &str,
        start: u32,
        end: u32,
    ) {
        // SAFETY: like node allocation, span registration is single-threaded.
        unsafe {
            (*self.expression_identifier_spans.get())
                .insert(expression, (CompactString::new(name), (start, end)));
        }
    }

    /// Return the identifier span scope attached to an expression handle.
    #[inline]
    pub fn expression_identifier_span(&self, expression: ExprId) -> Option<(&str, (u32, u32))> {
        // SAFETY: callers only read during/after single-threaded construction.
        unsafe {
            (*self.expression_identifier_spans.get())
                .get(&expression)
                .map(|(name, span)| (name.as_str(), *span))
        }
    }

    // -- expressions --------------------------------------------------------

    /// Allocate an expression in the arena and return its handle.
    ///
    /// Takes `&self` (not `&mut self`) to allow nested builder calls.
    #[inline(always)]
    pub fn alloc_expr(&self, expr: JsExpr) -> ExprId {
        // SAFETY: single-threaded append into stable chunks.
        unsafe {
            let store = &mut *self.exprs.get();
            ExprId(store.push(expr) as u32)
        }
    }

    /// Get a shared reference to an expression by handle.
    #[inline(always)]
    pub fn get_expr(&self, id: ExprId) -> &JsExpr {
        // SAFETY: single-threaded read from stable boxed storage.
        unsafe {
            let store = &*self.exprs.get();
            &*store.ptr(id.0 as usize)
        }
    }

    /// Attach a source span without changing the expression's IR variant.
    #[inline]
    pub fn set_bare_expr_span(&self, id: ExprId, start: u32, end: u32) {
        // SAFETY: like node allocation, span metadata is mutated only by the
        // single thread that owns this arena.
        unsafe {
            let spans = &mut *self.bare_expr_spans.get();
            spans
                .get_or_insert_with(FxHashMap::default)
                .insert(id, (start, end));
        }
    }

    /// Return an out-of-band source span, when this expression carries one.
    #[inline]
    pub fn bare_expr_span(&self, id: ExprId) -> Option<(u32, u32)> {
        // SAFETY: the arena is single-threaded and callers do not retain a
        // reference into the map across a mutation.
        unsafe {
            (&*self.bare_expr_spans.get())
                .as_ref()
                .and_then(|spans| spans.get(&id).copied())
        }
    }

    /// Take an expression out of the arena, replacing it with a placeholder.
    /// Useful when you need ownership (e.g., to transform an expression).
    ///
    /// Takes `&self` (not `&mut self`) because this is called from builder
    /// functions that may be nested.
    ///
    /// # Safety
    /// The caller must ensure no shared or mutable references to the same
    /// expression are live while the slot is replaced.
    #[inline(always)]
    pub unsafe fn take_expr(&self, id: ExprId) -> JsExpr {
        // SAFETY: Enforced by the caller's contract above.
        unsafe {
            let store = &mut *self.exprs.get();
            std::mem::replace(
                &mut *store.ptr(id.0 as usize),
                JsExpr::Literal(super::nodes::JsLiteral::Null),
            )
        }
    }

    // -- statements ---------------------------------------------------------

    /// Allocate a statement in the arena and return its handle.
    ///
    /// Takes `&self` (not `&mut self`) to allow nested builder calls.
    #[inline(always)]
    pub fn alloc_stmt(&self, stmt: JsStatement) -> StmtId {
        // SAFETY: same as alloc_expr
        unsafe {
            let store = &mut *self.stmts.get();
            StmtId(store.push(stmt) as u32)
        }
    }

    /// Get a shared reference to a statement by handle.
    #[inline(always)]
    pub fn get_stmt(&self, id: StmtId) -> &JsStatement {
        // SAFETY: same as get_expr
        unsafe {
            let store = &*self.stmts.get();
            &*store.ptr(id.0 as usize)
        }
    }
}

impl Default for JsArena {
    fn default() -> Self {
        Self::new()
    }
}

impl std::fmt::Debug for JsArena {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        // SAFETY: only reading len, no mutation
        let (exprs_count, stmts_count) =
            unsafe { ((*self.exprs.get()).len, (*self.stmts.get()).len) };
        // SAFETY: only reading the map length, no mutation.
        let identifier_spans_count = unsafe { (*self.identifier_spans.get()).len() };
        // SAFETY: only reading the map length, no mutation.
        let expression_identifier_spans_count =
            unsafe { (*self.expression_identifier_spans.get()).len() };
        f.debug_struct("JsArena")
            .field("exprs_count", &exprs_count)
            .field("stmts_count", &stmts_count)
            .field("identifier_spans_count", &identifier_spans_count)
            .field(
                "expression_identifier_spans_count",
                &expression_identifier_spans_count,
            )
            .finish()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use compact_str::CompactString;

    #[test]
    fn test_alloc_and_get_expr() {
        let arena = JsArena::new();
        let id1 = arena.alloc_expr(JsExpr::Identifier(CompactString::new("foo")));
        let id2 = arena.alloc_expr(JsExpr::Literal(super::super::nodes::JsLiteral::Number(
            42.0,
        )));

        assert_eq!(id1.0, 0);
        assert_eq!(id2.0, 1);

        match arena.get_expr(id1) {
            JsExpr::Identifier(name) => assert_eq!(name.as_str(), "foo"),
            _ => panic!("expected identifier"),
        }
        match arena.get_expr(id2) {
            JsExpr::Literal(super::super::nodes::JsLiteral::Number(n)) => {
                assert_eq!(*n, 42.0)
            }
            _ => panic!("expected number literal"),
        }
    }

    #[test]
    fn test_alloc_and_get_stmt() {
        let arena = JsArena::new();
        let id = arena.alloc_stmt(JsStatement::Empty);

        assert_eq!(id.0, 0);
        assert!(matches!(arena.get_stmt(id), JsStatement::Empty));
    }

    #[test]
    fn test_take_expr() {
        let arena = JsArena::new();
        let id = arena.alloc_expr(JsExpr::Identifier(CompactString::new("bar")));

        // SAFETY: `id` was just allocated and no reference into its slot is
        // live here, satisfying `take_expr`'s no-aliasing contract.
        let taken = unsafe { arena.take_expr(id) };
        match taken {
            JsExpr::Identifier(name) => assert_eq!(name.as_str(), "bar"),
            _ => panic!("expected identifier"),
        }
        // After take, slot should contain the placeholder (Null literal)
        assert!(matches!(
            arena.get_expr(id),
            JsExpr::Literal(super::super::nodes::JsLiteral::Null)
        ));
    }

    #[test]
    fn test_many_allocs() {
        let arena = JsArena::new();
        for i in 0..1000u32 {
            let id = arena.alloc_expr(JsExpr::Literal(super::super::nodes::JsLiteral::Number(
                i as f64,
            )));
            assert_eq!(id.0, i);
        }
        // Verify random access
        match arena.get_expr(ExprId(500)) {
            JsExpr::Literal(super::super::nodes::JsLiteral::Number(n)) => {
                assert_eq!(*n, 500.0)
            }
            _ => panic!("expected number"),
        }
    }

    #[test]
    fn test_expr_refs_survive_later_allocations() {
        let arena = JsArena::new();
        let id = arena.alloc_expr(JsExpr::Identifier(CompactString::new("first")));
        let expr = arena.get_expr(id);

        for i in 0..10_000u32 {
            arena.alloc_expr(JsExpr::Literal(super::super::nodes::JsLiteral::Number(
                i as f64,
            )));
        }

        assert!(matches!(expr, JsExpr::Identifier(name) if name.as_str() == "first"));
    }

    #[test]
    fn test_default() {
        let arena = JsArena::default();
        assert_eq!(
            format!("{:?}", arena),
            "JsArena { exprs_count: 0, stmts_count: 0, identifier_spans_count: 0, expression_identifier_spans_count: 0 }"
        );
    }

    #[test]
    fn test_generated_identifier_span() {
        let arena = JsArena::new();
        arena.note_identifier_span("div", 7, 10);

        assert_eq!(arena.identifier_span("div"), Some((7, 10)));
        assert_eq!(arena.identifier_span("main"), None);
    }

    #[test]
    fn test_expression_identifier_span() {
        let arena = JsArena::new();
        let expression = arena.alloc_expr(JsExpr::Identifier("foo".into()));
        arena.note_expression_identifier_span(expression, "foo", 7, 10);

        assert_eq!(
            arena.expression_identifier_span(expression),
            Some(("foo", (7, 10)))
        );
    }

    #[test]
    fn test_nested_alloc() {
        // This test verifies that nested allocation works (the key benefit of &self)
        let arena = JsArena::new();
        let inner_id = arena.alloc_expr(JsExpr::Identifier(CompactString::new("x")));
        let outer_id = arena.alloc_expr(JsExpr::Call(super::super::nodes::JsCallExpression {
            callee: inner_id,
            arguments: vec![],
            optional: false,
        }));
        assert_eq!(inner_id.0, 0);
        assert_eq!(outer_id.0, 1);
    }
}
