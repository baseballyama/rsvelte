use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_typescript::syntax_tree::{Class, Kind, NodeIdentifier, flag};

use super::JavaScriptFacts;

/// `ESLint`'s `no-inner-declarations` options.
#[derive(Clone, Copy, Debug, Default)]
pub struct NoInnerDeclarationsOptions {
    /// `"both"`: `var` declarations too, not only functions.
    pub variables: bool,
    /// `blockScopedFunctions: "disallow"`.
    pub disallow_block_scoped_functions: bool,
}

/// `ESLint`'s `no-inner-declarations` over the nodes under `roots`. Modules are strict code, so
/// a function in a block is block-scoped and allowed unless the options disallow it.
pub fn no_inner_declarations(
    f: &JavaScriptFacts<'_>,
    roots: &[NodeIdentifier],
    options: NoInnerDeclarationsOptions,
    reporter: &mut Reporter<'_>,
) {
    let tree = f.syntax_tree;
    let mut stack: Vec<NodeIdentifier> = roots.iter().rev().copied().collect();
    while let Some(node) = stack.pop() {
        let kind = match tree.kind(node) {
            Kind::Function {
                declaration: true, ..
            } if options.disallow_block_scoped_functions => Some("function"),
            Kind::VariableDeclaration {
                kind: flag::VAR, ..
            } if options.variables => Some("variable"),
            _ => None,
        };
        if let Some(kind) = kind
            && !at_root(f, node)
        {
            reporter.report(
                Report::range(
                    format!("Move {kind} declaration to {} root.", body(f, node)),
                    f.span(node),
                )
                .message_id("moveDeclToRoot"),
            );
        }
        let at = stack.len();
        tree.for_each_child(node, |child| stack.push(child));
        stack[at..].reverse();
    }
}

/// The declaration is a statement of a program, a function body or a class static block, or
/// exported.
fn at_root(f: &JavaScriptFacts<'_>, node: NodeIdentifier) -> bool {
    let tree = f.syntax_tree;
    let Some(parent) = f.parent(node) else {
        return true;
    };
    match tree.kind(parent) {
        Kind::Program(_) | Kind::ExportNamed(_) | Kind::ExportDefault(_) => true,
        Kind::Block(_) => f.parent(parent).is_some_and(|p| {
            matches!(
                tree.kind(p),
                Kind::Function { .. } | Kind::Arrow { .. } | Kind::Class(Class::StaticBlock(_))
            )
        }),
        _ => false,
    }
}

/// `getAllowedBodyDescription`.
fn body(f: &JavaScriptFacts<'_>, node: NodeIdentifier) -> &'static str {
    let mut at = f.parent(node);
    while let Some(current) = at {
        match f.syntax_tree.kind(current) {
            Kind::Class(Class::StaticBlock(_)) => return "class static block body",
            Kind::Function { .. } | Kind::Arrow { .. } => return "function body",
            _ => at = f.parent(current),
        }
    }
    "program"
}
