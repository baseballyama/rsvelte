//! Lint rules over JavaScript facts alone, for every language that embeds JavaScript.
//!
//! A host language wraps them in its own [`rsvelte_kernel::diagnostics::rules::Rule`]. Its template
//! expressions are scope-analysis roots ([`crate::scope::HostRoot`]), so their reads are already
//! here; which bindings a rule reports on is the host's decision (`considered`), because the
//! upstream plugins differ: svelte-eslint-parser puts `{#each}` names in the scope core rules read,
//! while Vue's `v-for` names are reported by `vue/no-unused-variables` instead.

use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_kernel::source::index::TypedIndex;
use rsvelte_kernel::source::positions::Span;

use crate::operators::AssignmentOperator;
use crate::scope::{BindingIdentifier, DeclarationKind, Reference, Semantic};
use crate::syntax_tree::{Kind, NodeIdentifier, SyntaxTree, TypeScriptKind};

#[derive(Debug)]
pub struct JavaScriptFacts<'a> {
    pub syntax_tree: &'a SyntaxTree,
    pub sem: &'a Semantic,
    /// [`SyntaxTree::parents`].
    pub parents: &'a [NodeIdentifier],
}

impl JavaScriptFacts<'_> {
    fn parent(&self, n: NodeIdentifier) -> Option<NodeIdentifier> {
        self.parents[n.index()].opt()
    }

    /// `ESLint`'s `isInside` compares ranges; on one tree that is ancestry.
    fn inside(&self, inner: NodeIdentifier, outer: NodeIdentifier) -> bool {
        let mut n = Some(inner);
        while let Some(x) = n {
            if x == outer {
                return true;
            }
            n = self.parent(x);
        }
        false
    }

    fn span(&self, n: NodeIdentifier) -> Span {
        self.syntax_tree
            .source_location(n)
            .span()
            .expect("a source tree node has a source range")
    }
}

/// `ESLint`'s `no-unused-variables` with its default options (`variables: all`, `arguments:
/// after-used`, `caughtErrors: all`, no ignore patterns, `ignoreRestSiblings: false`).
///
/// The parser has no loop, class or catch syntax yet, so `isInLoop`, `isForInOfRef` and the
/// class/catch skips have nothing to decide and are absent; they arrive with that syntax.
/// A [`DeclarationKind::Host`] binding is judged as a variable (not a parameter).
pub fn no_unused_variables(
    f: &JavaScriptFacts<'_>,
    rule: &'static str,
    considered: impl Fn(BindingIdentifier) -> bool,
    out: &mut Vec<Diagnostic>,
) {
    for (b, binding) in f.sem.bindings.iter_enumerated() {
        if !considered(b) {
            continue;
        }
        if binding.kind == DeclarationKind::Function
            && matches!(
                f.parent(binding.node).map(|p| f.syntax_tree.kind(p)),
                Some(Kind::Function {
                    declaration: false,
                    ..
                })
            )
        {
            continue;
        }
        if binding.kind == DeclarationKind::Param
            && matches!(
                f.parent(binding.node).map(|p| f.syntax_tree.kind(p)),
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
            format!(
                "'{}' is {action} but never used.",
                f.syntax_tree.name(binding.node)
            ),
            identifier_range(f, node),
        ));
    }
}

/// typescript-eslint's identifier range covers its `?` and type annotation.
fn identifier_range(f: &JavaScriptFacts<'_>, ident: NodeIdentifier) -> Span {
    let mut span = f.span(ident);
    for t in &f.syntax_tree.typescript {
        if t.node == ident
            && matches!(
                t.kind,
                TypeScriptKind::Annotation | TypeScriptKind::Optional
            )
        {
            span.end_offset = span.end_offset.max(t.span.end_offset);
        }
    }
    span
}

fn is_exported(f: &JavaScriptFacts<'_>, b: BindingIdentifier) -> bool {
    let binding = &f.sem.bindings[b];
    let owner = match binding.kind {
        DeclarationKind::Param => return false,
        DeclarationKind::Function => f.parent(binding.node),
        _ => binding
            .declaration
            .and_then(|d| match f.syntax_tree.kind(d) {
                Kind::Declarator { .. } => f.parent(d),
                _ => Some(d),
            }),
    };
    matches!(
        owner
            .and_then(|o| f.parent(o))
            .map(|p| f.syntax_tree.kind(p)),
        Some(Kind::ExportNamed(_) | Kind::ExportDefault(_))
    )
}

fn is_after_last_used_arg(f: &JavaScriptFacts<'_>, b: BindingIdentifier) -> bool {
    let scope = f.sem.bindings[b].scope;
    !f.sem
        .bindings
        .iter_enumerated()
        .skip(b.index() + 1)
        .filter(|(_, v)| v.scope == scope && v.kind == DeclarationKind::Param)
        .any(|(later, _)| f.sem.references_to(later).next().is_some())
}

fn function_definitions(f: &JavaScriptFacts<'_>, b: BindingIdentifier) -> Option<NodeIdentifier> {
    let binding = &f.sem.bindings[b];
    match binding.kind {
        DeclarationKind::Function => f.parent(binding.node),
        _ => binding.initializer(f.syntax_tree).filter(|&i| {
            matches!(
                f.syntax_tree.kind(i),
                Kind::Function { .. } | Kind::Arrow { .. }
            )
        }),
    }
}

fn is_used(f: &JavaScriptFacts<'_>, b: BindingIdentifier) -> bool {
    if f.sem.is_type_referenced(b) {
        return true;
    }
    let binding = &f.sem.bindings[b];
    let function = function_definitions(f, b);
    let mut rhs = None;
    f.sem.references_to(b).any(|r| {
        let for_itself = is_read_for_itself(f, r, rhs);
        rhs = rhs_node(f, r, rhs, binding.scope);
        r.read && !for_itself && !function.is_some_and(|func| is_self_reference(f, r, func))
    })
}

fn is_self_reference(f: &JavaScriptFacts<'_>, r: &Reference, func: NodeIdentifier) -> bool {
    let mut s = Some(r.scope);
    while let Some(scope) = s {
        if f.sem.scopes[scope].node == func {
            return true;
        }
        s = f.sem.scopes[scope].parent;
    }
    false
}

fn is_unused_expression(f: &JavaScriptFacts<'_>, node: NodeIdentifier) -> bool {
    let Some(parent) = f.parent(node) else {
        return false;
    };
    match f.syntax_tree.kind(parent) {
        Kind::ExpressionStatement(_) => true,
        Kind::Sequence(list) => list.last() != Some(&node) || is_unused_expression(f, parent),
        _ => false,
    }
}

fn rhs_node(
    f: &JavaScriptFacts<'_>,
    r: &Reference,
    prev: Option<NodeIdentifier>,
    declaration_scope: crate::scope::ScopeIdentifier,
) -> Option<NodeIdentifier> {
    let can_be_used_later =
        f.sem.variable_scope(r.scope) != f.sem.variable_scope(declaration_scope);
    if let Some(p) = prev
        && f.inside(r.node, p)
    {
        return Some(p);
    }
    let parent = f.parent(r.node)?;
    match f.syntax_tree.kind(parent) {
        Kind::Assign(_, left, right)
            if is_unused_expression(f, parent) && left == r.node && !can_be_used_later =>
        {
            Some(right)
        }
        _ => None,
    }
}

fn is_read_for_itself(f: &JavaScriptFacts<'_>, r: &Reference, rhs: Option<NodeIdentifier>) -> bool {
    if !r.read {
        return false;
    }
    let self_update = f
        .parent(r.node)
        .is_some_and(|parent| match f.syntax_tree.kind(parent) {
            Kind::Assign(op, left, _) => {
                left == r.node
                    && is_unused_expression(f, parent)
                    && !matches!(
                        op,
                        AssignmentOperator::Or
                            | AssignmentOperator::And
                            | AssignmentOperator::Nullish
                    )
            }
            Kind::Update { .. } => is_unused_expression(f, parent),
            _ => false,
        });
    self_update
        || rhs.is_some_and(|rhs| {
            f.inside(r.node, rhs) && !is_inside_of_storable_function(f, r.node, rhs)
        })
}

fn is_inside_of_storable_function(
    f: &JavaScriptFacts<'_>,
    identifier: NodeIdentifier,
    rhs: NodeIdentifier,
) -> bool {
    let mut n = Some(identifier);
    while let Some(x) = n {
        if matches!(
            f.syntax_tree.kind(x),
            Kind::Function { .. } | Kind::Arrow { .. }
        ) {
            return f.inside(x, rhs) && is_storable_function(f, x, rhs);
        }
        n = f.parent(x);
    }
    false
}

fn is_storable_function(
    f: &JavaScriptFacts<'_>,
    func: NodeIdentifier,
    rhs: NodeIdentifier,
) -> bool {
    let mut node = func;
    let mut parent = f.parent(func);
    while let Some(p) = parent.filter(|&p| f.inside(p, rhs)) {
        match f.syntax_tree.kind(p) {
            Kind::Sequence(list) => {
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
        Kind::ExpressionStatement(_)
            | Kind::Return(_)
            | Kind::If { .. }
            | Kind::Block(_)
            | Kind::Empty
            | Kind::VariableDeclaration { .. }
            | Kind::Function {
                declaration: true,
                ..
            }
            | Kind::Import { .. }
            | Kind::ExportNamed(_)
            | Kind::ExportDefault(_)
            | Kind::TypeScriptDeclaration
            | Kind::TypeScriptInterface { .. }
    )
}
