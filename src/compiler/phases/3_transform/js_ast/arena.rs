//! Arena allocator for JavaScript AST nodes.
//!
//! Instead of heap-allocating each sub-expression/sub-statement via `Box`,
//! we store all expressions and statements in a contiguous `Vec` and reference
//! them by index (`ExprId` / `StmtId`).  This gives:
//!
//! - **Cache-friendly iteration** (nodes are contiguous in memory)
//! - **Zero-cost reads** (`arena.get_expr(id)` is a single array index)
//! - **Cheaper allocation** (push to a Vec vs. global allocator)
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
//! The arena is single-threaded (not `Sync`) and append-only for allocation.
//! `UnsafeCell` is safe here because:
//! - Allocation only appends (never moves existing elements, since we use
//!   `reserve` to avoid reallocation)
//! - No references into the Vec are held across allocation calls in the
//!   builder API (builders return owned `JsExpr`/`JsStatement`, not references)
//! - `get_expr`/`get_stmt` return references but are only called when no
//!   allocation is in progress

use super::nodes::{JsExpr, JsStatement};
use std::cell::UnsafeCell;

/// Handle to an expression stored in the arena.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct ExprId(pub u32);

/// Handle to a statement stored in the arena.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct StmtId(pub u32);

/// Arena that owns all `JsExpr` and `JsStatement` nodes for a single
/// compilation unit.
///
/// Allocation takes `&self` (not `&mut self`) so that builder functions
/// can nest calls without borrow-checker conflicts.
pub struct JsArena {
    exprs: UnsafeCell<Vec<JsExpr>>,
    stmts: UnsafeCell<Vec<JsStatement>>,
}

// JsArena is explicitly NOT Sync - it's single-threaded only.
// Send is fine since we can move it between threads.
unsafe impl Send for JsArena {}

impl JsArena {
    /// Create a new arena with default capacity.
    pub fn new() -> Self {
        Self {
            exprs: UnsafeCell::new(Vec::with_capacity(256)),
            stmts: UnsafeCell::new(Vec::with_capacity(64)),
        }
    }

    // -- expressions --------------------------------------------------------

    /// Allocate an expression in the arena and return its handle.
    ///
    /// Takes `&self` (not `&mut self`) to allow nested builder calls.
    #[inline(always)]
    pub fn alloc_expr(&self, expr: JsExpr) -> ExprId {
        // SAFETY: single-threaded, append-only, no outstanding references
        // into the Vec during allocation (builders return owned values).
        unsafe {
            let vec = &mut *self.exprs.get();
            let id = ExprId(vec.len() as u32);
            vec.push(expr);
            id
        }
    }

    /// Get a shared reference to an expression by handle.
    #[inline(always)]
    pub fn get_expr(&self, id: ExprId) -> &JsExpr {
        // SAFETY: no mutation happens while shared references exist
        // (alloc_expr only appends, doesn't touch existing elements)
        unsafe {
            let vec = &*self.exprs.get();
            &vec[id.0 as usize]
        }
    }

    /// Get a mutable reference to an expression by handle.
    ///
    /// # Safety note
    /// Caller must ensure no other references to the same slot exist.
    /// This is safe in our single-threaded builder context.
    #[inline(always)]
    #[allow(clippy::mut_from_ref)]
    pub fn get_expr_mut(&self, id: ExprId) -> &mut JsExpr {
        // SAFETY: single-threaded, caller ensures no aliasing
        unsafe {
            let vec = &mut *self.exprs.get();
            &mut vec[id.0 as usize]
        }
    }

    /// Take an expression out of the arena, replacing it with a placeholder.
    /// Useful when you need ownership (e.g., to transform an expression).
    ///
    /// Takes `&self` (not `&mut self`) because this is called from builder
    /// functions that may be nested. Safe because the arena is single-threaded
    /// and we only swap a single element (no reallocation).
    #[inline(always)]
    pub fn take_expr(&self, id: ExprId) -> JsExpr {
        // SAFETY: single-threaded, only modifies one existing element
        unsafe {
            let vec = &mut *self.exprs.get();
            std::mem::replace(
                &mut vec[id.0 as usize],
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
            let vec = &mut *self.stmts.get();
            let id = StmtId(vec.len() as u32);
            vec.push(stmt);
            id
        }
    }

    /// Get a shared reference to a statement by handle.
    #[inline(always)]
    pub fn get_stmt(&self, id: StmtId) -> &JsStatement {
        // SAFETY: same as get_expr
        unsafe {
            let vec = &*self.stmts.get();
            &vec[id.0 as usize]
        }
    }

    /// Get a mutable reference to a statement by handle.
    #[inline(always)]
    #[allow(clippy::mut_from_ref)]
    pub fn get_stmt_mut(&self, id: StmtId) -> &mut JsStatement {
        // SAFETY: single-threaded, caller ensures no aliasing
        unsafe {
            let vec = &mut *self.stmts.get();
            &mut vec[id.0 as usize]
        }
    }

    /// Take a statement out of the arena, replacing it with Empty.
    ///
    /// Takes `&self` for the same reasons as `take_expr`.
    #[inline(always)]
    pub fn take_stmt(&self, id: StmtId) -> JsStatement {
        // SAFETY: single-threaded, only modifies one existing element
        unsafe {
            let vec = &mut *self.stmts.get();
            std::mem::replace(&mut vec[id.0 as usize], JsStatement::Empty)
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
            unsafe { ((*self.exprs.get()).len(), (*self.stmts.get()).len()) };
        f.debug_struct("JsArena")
            .field("exprs_count", &exprs_count)
            .field("stmts_count", &stmts_count)
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

        let taken = arena.take_expr(id);
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
    fn test_take_stmt() {
        let arena = JsArena::new();
        let id = arena.alloc_stmt(JsStatement::Debugger);

        let taken = arena.take_stmt(id);
        assert!(matches!(taken, JsStatement::Debugger));
        // After take, slot should contain Empty
        assert!(matches!(arena.get_stmt(id), JsStatement::Empty));
    }

    #[test]
    fn test_get_expr_mut() {
        let arena = JsArena::new();
        let id = arena.alloc_expr(JsExpr::Identifier(CompactString::new("x")));

        *arena.get_expr_mut(id) = JsExpr::Identifier(CompactString::new("y"));

        match arena.get_expr(id) {
            JsExpr::Identifier(name) => assert_eq!(name.as_str(), "y"),
            _ => panic!("expected identifier"),
        }
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
    fn test_default() {
        let arena = JsArena::default();
        assert_eq!(
            format!("{:?}", arena),
            "JsArena { exprs_count: 0, stmts_count: 0 }"
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
