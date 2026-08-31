//! `var` is function-scoped, so `{ var v = 2; } typeof v` still resolves to the
//! local after the block ends — a shadow frame pushed and popped per block cannot
//! express that. The client's instance-script pass and the server's read-wrapping
//! pass both answer "which names does this function body bind", so they collect
//! the hoisted `var`s through this one walk rather than through a copy each.

use oxc_ast::ast::{
    ForStatementInit, ForStatementLeft, Statement, VariableDeclaration, VariableDeclarationKind,
};

/// Every `var` declaration reachable from `stmt` without crossing into a nested
/// function or class body, which open a `var` scope of their own.
pub(crate) fn collect_hoisted_var_declarations<'x, 'a>(
    stmt: &'x Statement<'a>,
    out: &mut Vec<&'x VariableDeclaration<'a>>,
) {
    match stmt {
        Statement::VariableDeclaration(decl) if decl.kind == VariableDeclarationKind::Var => {
            out.push(decl)
        }
        Statement::BlockStatement(block) => collect_in_list(&block.body, out),
        Statement::IfStatement(stmt) => {
            collect_hoisted_var_declarations(&stmt.consequent, out);
            if let Some(alternate) = &stmt.alternate {
                collect_hoisted_var_declarations(alternate, out);
            }
        }
        Statement::ForStatement(stmt) => {
            if let Some(ForStatementInit::VariableDeclaration(decl)) = &stmt.init
                && decl.kind == VariableDeclarationKind::Var
            {
                out.push(decl);
            }
            collect_hoisted_var_declarations(&stmt.body, out);
        }
        Statement::ForInStatement(stmt) => {
            collect_for_left(&stmt.left, out);
            collect_hoisted_var_declarations(&stmt.body, out);
        }
        Statement::ForOfStatement(stmt) => {
            collect_for_left(&stmt.left, out);
            collect_hoisted_var_declarations(&stmt.body, out);
        }
        Statement::WhileStatement(stmt) => collect_hoisted_var_declarations(&stmt.body, out),
        Statement::DoWhileStatement(stmt) => collect_hoisted_var_declarations(&stmt.body, out),
        Statement::LabeledStatement(stmt) => collect_hoisted_var_declarations(&stmt.body, out),
        Statement::WithStatement(stmt) => collect_hoisted_var_declarations(&stmt.body, out),
        Statement::TryStatement(stmt) => {
            collect_in_list(&stmt.block.body, out);
            if let Some(handler) = &stmt.handler {
                collect_in_list(&handler.body.body, out);
            }
            if let Some(finalizer) = &stmt.finalizer {
                collect_in_list(&finalizer.body, out);
            }
        }
        Statement::SwitchStatement(stmt) => {
            for case in &stmt.cases {
                collect_in_list(&case.consequent, out);
            }
        }
        _ => {}
    }
}

/// The same walk over a statement list — a function body, a block, a `case` arm.
pub(crate) fn collect_in_list<'x, 'a>(
    stmts: &'x [Statement<'a>],
    out: &mut Vec<&'x VariableDeclaration<'a>>,
) {
    for stmt in stmts {
        collect_hoisted_var_declarations(stmt, out);
    }
}

fn collect_for_left<'x, 'a>(
    left: &'x ForStatementLeft<'a>,
    out: &mut Vec<&'x VariableDeclaration<'a>>,
) {
    if let ForStatementLeft::VariableDeclaration(decl) = left
        && decl.kind == VariableDeclarationKind::Var
    {
        out.push(decl);
    }
}
