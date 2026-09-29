//! Lint rules over JavaScript facts alone, for every language that embeds JavaScript.
//!
//! A host
//! language wraps them in its own [`rsv_kernel::lint::Rule`] so they see its extra references
//! (a component's template expressions are scope-analysis roots, so their reads are already here).

use rsv_kernel::diag::Diagnostic;
use rsv_kernel::idx::Idx;
use rsv_kernel::source::Span;

use crate::ast::{Ast, Kind, NodeId, TsKind};
use crate::ops::AssignOp;
use crate::scope::{BindingId, DeclKind, Reference, Semantic};

#[derive(Debug)]
pub struct JsFacts<'a> {
    pub ast: &'a Ast,
    pub sem: &'a Semantic,
    /// [`Ast::parents`].
    pub parents: &'a [NodeId],
}

impl JsFacts<'_> {
    fn parent(&self, n: NodeId) -> Option<NodeId> {
        self.parents[n.idx()].opt()
    }

    /// `ESLint`'s `isInside` compares ranges; on one tree that is ancestry.
    fn inside(&self, inner: NodeId, outer: NodeId) -> bool {
        let mut n = Some(inner);
        while let Some(x) = n {
            if x == outer {
                return true;
            }
            n = self.parent(x);
        }
        false
    }

    fn span(&self, n: NodeId) -> Span {
        self.ast
            .loc(n)
            .span()
            .expect("a source tree node has a source range")
    }
}

/// `ESLint`'s `no-unused-vars` with its default options (`vars: all`, `args: after-used`,
/// `caughtErrors: all`, no ignore patterns, `ignoreRestSiblings: false`).
///
/// The parser has no loop, class or catch syntax yet, so `isInLoop`, `isForInOfRef` and the
/// class/catch skips have nothing to decide and are absent; they arrive with that syntax.
pub fn no_unused_vars(f: &JsFacts<'_>, rule: &'static str, out: &mut Vec<Diagnostic>) {
    for (b, binding) in f.sem.bindings.iter_enumerated() {
        if binding.kind == DeclKind::Function
            && matches!(
                f.parent(binding.node).map(|p| f.ast.kind(p)),
                Some(Kind::Function { decl: false, .. })
            )
        {
            continue;
        }
        if binding.kind == DeclKind::Param
            && matches!(
                f.parent(binding.node).map(|p| f.ast.kind(p)),
                Some(Kind::Function { .. } | Kind::Arrow { .. })
            )
            && !is_after_last_used_arg(f, b)
        {
            continue;
        }
        if is_used(f, b) || is_exported(f, b) {
            continue;
        }
        let var_scope = f.sem.variable_scope(binding.scope);
        let node = f
            .sem
            .references_to(b)
            .filter(|r| r.write && f.sem.variable_scope(r.scope) == var_scope)
            .last()
            .map_or(binding.node, |r| r.node);
        let action = if f.sem.references_to(b).any(|r| r.write) {
            "assigned a value"
        } else {
            "defined"
        };
        out.push(Diagnostic::error(
            rule,
            format!("'{}' is {action} but never used.", f.ast.name(binding.node)),
            identifier_range(f, node),
        ));
    }
}

/// typescript-eslint's identifier range covers its `?` and type annotation.
fn identifier_range(f: &JsFacts<'_>, ident: NodeId) -> Span {
    let mut span = f.span(ident);
    for t in &f.ast.ts {
        if t.node == ident && matches!(t.kind, TsKind::Annotation | TsKind::Optional) {
            span.hi = span.hi.max(t.span.hi);
        }
    }
    span
}

fn is_exported(f: &JsFacts<'_>, b: BindingId) -> bool {
    let binding = &f.sem.bindings[b];
    let owner = match binding.kind {
        DeclKind::Param => return false,
        DeclKind::Function => f.parent(binding.node),
        _ => binding.decl.and_then(|d| match f.ast.kind(d) {
            Kind::Declarator { .. } => f.parent(d),
            _ => Some(d),
        }),
    };
    matches!(
        owner.and_then(|o| f.parent(o)).map(|p| f.ast.kind(p)),
        Some(Kind::ExportNamed(_) | Kind::ExportDefault(_))
    )
}

fn is_after_last_used_arg(f: &JsFacts<'_>, b: BindingId) -> bool {
    let scope = f.sem.bindings[b].scope;
    !f.sem
        .bindings
        .iter_enumerated()
        .skip(b.index() + 1)
        .filter(|(_, v)| v.scope == scope && v.kind == DeclKind::Param)
        .any(|(later, _)| f.sem.references_to(later).next().is_some())
}

fn function_definitions(f: &JsFacts<'_>, b: BindingId) -> Option<NodeId> {
    let binding = &f.sem.bindings[b];
    match binding.kind {
        DeclKind::Function => f.parent(binding.node),
        _ => binding
            .init(f.ast)
            .filter(|&i| matches!(f.ast.kind(i), Kind::Function { .. } | Kind::Arrow { .. })),
    }
}

fn is_used(f: &JsFacts<'_>, b: BindingId) -> bool {
    let binding = &f.sem.bindings[b];
    let function = function_definitions(f, b);
    let mut rhs = None;
    f.sem.references_to(b).any(|r| {
        let for_itself = is_read_for_itself(f, r, rhs);
        rhs = rhs_node(f, r, rhs, binding.scope);
        r.read && !for_itself && !function.is_some_and(|func| is_self_reference(f, r, func))
    })
}

fn is_self_reference(f: &JsFacts<'_>, r: &Reference, func: NodeId) -> bool {
    let mut s = Some(r.scope);
    while let Some(scope) = s {
        if f.sem.scopes[scope].node == func {
            return true;
        }
        s = f.sem.scopes[scope].parent;
    }
    false
}

fn is_unused_expression(f: &JsFacts<'_>, node: NodeId) -> bool {
    let Some(parent) = f.parent(node) else {
        return false;
    };
    match f.ast.kind(parent) {
        Kind::ExprStmt(_) => true,
        Kind::Seq(list) => list.last() != Some(&node) || is_unused_expression(f, parent),
        _ => false,
    }
}

fn rhs_node(
    f: &JsFacts<'_>,
    r: &Reference,
    prev: Option<NodeId>,
    decl_scope: crate::scope::ScopeId,
) -> Option<NodeId> {
    let can_be_used_later = f.sem.variable_scope(r.scope) != f.sem.variable_scope(decl_scope);
    if let Some(p) = prev
        && f.inside(r.node, p)
    {
        return Some(p);
    }
    let parent = f.parent(r.node)?;
    match f.ast.kind(parent) {
        Kind::Assign(_, left, right)
            if is_unused_expression(f, parent) && left == r.node && !can_be_used_later =>
        {
            Some(right)
        }
        _ => None,
    }
}

fn is_read_for_itself(f: &JsFacts<'_>, r: &Reference, rhs: Option<NodeId>) -> bool {
    if !r.read {
        return false;
    }
    let self_update = f
        .parent(r.node)
        .is_some_and(|parent| match f.ast.kind(parent) {
            Kind::Assign(op, left, _) => {
                left == r.node
                    && is_unused_expression(f, parent)
                    && !matches!(op, AssignOp::Or | AssignOp::And | AssignOp::Nullish)
            }
            Kind::Update { .. } => is_unused_expression(f, parent),
            _ => false,
        });
    self_update
        || rhs.is_some_and(|rhs| {
            f.inside(r.node, rhs) && !is_inside_of_storable_function(f, r.node, rhs)
        })
}

fn is_inside_of_storable_function(f: &JsFacts<'_>, id: NodeId, rhs: NodeId) -> bool {
    let mut n = Some(id);
    while let Some(x) = n {
        if matches!(f.ast.kind(x), Kind::Function { .. } | Kind::Arrow { .. }) {
            return f.inside(x, rhs) && is_storable_function(f, x, rhs);
        }
        n = f.parent(x);
    }
    false
}

fn is_storable_function(f: &JsFacts<'_>, func: NodeId, rhs: NodeId) -> bool {
    let mut node = func;
    let mut parent = f.parent(func);
    while let Some(p) = parent.filter(|&p| f.inside(p, rhs)) {
        match f.ast.kind(p) {
            Kind::Seq(list) => {
                if list.last() != Some(&node) {
                    return false;
                }
            }
            Kind::Call { callee, .. } | Kind::New { callee, .. } => return callee != node,
            Kind::Assign(..) => return true,
            k if is_statement(k) => return true,
            _ => {}
        }
        node = p;
        parent = f.parent(p);
    }
    false
}

/// `ESTree` types matching `/(?:Statement|Declaration)$/`.
const fn is_statement(k: Kind<'_>) -> bool {
    matches!(
        k,
        Kind::ExprStmt(_)
            | Kind::Return(_)
            | Kind::If { .. }
            | Kind::Block(_)
            | Kind::Empty
            | Kind::VarDecl { .. }
            | Kind::Function { decl: true, .. }
            | Kind::Import { .. }
            | Kind::ExportNamed(_)
            | Kind::ExportDefault(_)
            | Kind::TsDecl
            | Kind::TsInterface { .. }
    )
}
