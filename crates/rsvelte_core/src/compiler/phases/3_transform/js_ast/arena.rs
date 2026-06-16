//! Arena allocator for JavaScript AST nodes.
//!
//! We store all expressions and statements behind stable boxes and reference
//! them by index (`ExprId` / `StmtId`).  This gives:
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
//! - Safe allocation stores nodes behind `Box`, so `Vec` reallocation cannot
//!   move values referenced by previously returned shared references
//! - Builders return handles or owned values, not mutable references into
//!   arena storage
//! - Mutable/destructive access is `unsafe` and requires callers to prove no
//!   aliases exist

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
    #[allow(clippy::vec_box)] // Box keeps expression addresses stable across handle Vec growth.
    exprs: UnsafeCell<Vec<Box<JsExpr>>>,
    #[allow(clippy::vec_box)] // Box keeps statement addresses stable across handle Vec growth.
    stmts: UnsafeCell<Vec<Box<JsStatement>>>,
}

// JsArena is explicitly NOT Sync - it's single-threaded only.
// SAFETY: the arena owns its `UnsafeCell`-backed storage outright and hands out no
// thread-shared references, so moving the whole arena across threads (Send) transfers
// sole ownership without cross-thread aliasing. It is deliberately not `Sync`, which
// is what keeps the `&self` interior mutability sound.
unsafe impl Send for JsArena {}

impl JsArena {
    /// Create a new arena with pre-allocated capacity for typical component size.
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
        // SAFETY: single-threaded append. Values are stored behind `Box`, so
        // growing the handle Vec cannot move expressions referenced earlier.
        unsafe {
            let vec = &mut *self.exprs.get();
            let id = ExprId(vec.len() as u32);
            vec.push(Box::new(expr));
            id
        }
    }

    /// Get a shared reference to an expression by handle.
    #[inline(always)]
    pub fn get_expr(&self, id: ExprId) -> &JsExpr {
        // SAFETY: single-threaded read from stable boxed storage.
        unsafe {
            let vec = &*self.exprs.get();
            vec[id.0 as usize].as_ref()
        }
    }

    /// Get a mutable reference to an expression by handle.
    ///
    /// # Safety
    /// The caller must ensure no shared or mutable references to the same
    /// expression are live for the duration of the returned borrow.
    #[inline(always)]
    #[allow(clippy::mut_from_ref)]
    pub unsafe fn get_expr_mut(&self, id: ExprId) -> &mut JsExpr {
        // SAFETY: Enforced by the caller's contract above.
        unsafe {
            let vec = &mut *self.exprs.get();
            vec[id.0 as usize].as_mut()
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
            let vec = &mut *self.exprs.get();
            std::mem::replace(
                vec[id.0 as usize].as_mut(),
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
            vec.push(Box::new(stmt));
            id
        }
    }

    /// Get a shared reference to a statement by handle.
    #[inline(always)]
    pub fn get_stmt(&self, id: StmtId) -> &JsStatement {
        // SAFETY: same as get_expr
        unsafe {
            let vec = &*self.stmts.get();
            vec[id.0 as usize].as_ref()
        }
    }

    /// Get a mutable reference to a statement by handle.
    ///
    /// # Safety
    /// The caller must ensure no shared or mutable references to the same
    /// statement are live for the duration of the returned borrow.
    #[inline(always)]
    #[allow(clippy::mut_from_ref)]
    pub unsafe fn get_stmt_mut(&self, id: StmtId) -> &mut JsStatement {
        // SAFETY: Enforced by the caller's contract above.
        unsafe {
            let vec = &mut *self.stmts.get();
            vec[id.0 as usize].as_mut()
        }
    }

    /// Take a statement out of the arena, replacing it with Empty.
    ///
    /// Takes `&self` for the same reasons as `take_expr`.
    ///
    /// # Safety
    /// The caller must ensure no shared or mutable references to the same
    /// statement are live while the slot is replaced.
    #[inline(always)]
    pub unsafe fn take_stmt(&self, id: StmtId) -> JsStatement {
        // SAFETY: Enforced by the caller's contract above.
        unsafe {
            let vec = &mut *self.stmts.get();
            std::mem::replace(vec[id.0 as usize].as_mut(), JsStatement::Empty)
        }
    }
}

impl JsArena {
    /// Clear all stored expressions and statements, keeping the allocated buffer
    /// for reuse. This is O(n) for dropping stored elements but the next compilation
    /// benefits from zero allocation (the Vec buffer is already sized).
    ///
    /// # Safety
    /// The caller must ensure no shared or mutable references into this arena
    /// are live while the arena is cleared.
    pub unsafe fn reset(&self) {
        // SAFETY: Enforced by the caller's contract above.
        unsafe {
            (*self.exprs.get()).clear();
            (*self.stmts.get()).clear();
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
    fn test_take_stmt() {
        let arena = JsArena::new();
        let id = arena.alloc_stmt(JsStatement::Debugger);

        // SAFETY: `id` was just allocated and no reference into its slot is
        // live here, satisfying `take_stmt`'s no-aliasing contract.
        let taken = unsafe { arena.take_stmt(id) };
        assert!(matches!(taken, JsStatement::Debugger));
        // After take, slot should contain Empty
        assert!(matches!(arena.get_stmt(id), JsStatement::Empty));
    }

    #[test]
    fn test_get_expr_mut() {
        let arena = JsArena::new();
        let id = arena.alloc_expr(JsExpr::Identifier(CompactString::new("x")));

        // SAFETY: `id` was just allocated and no other reference into its slot
        // is live here, satisfying `get_expr_mut`'s no-aliasing contract.
        *unsafe { arena.get_expr_mut(id) } = JsExpr::Identifier(CompactString::new("y"));

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
