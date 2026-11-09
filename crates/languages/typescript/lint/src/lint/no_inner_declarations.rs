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

/// `ESLint`'s `no-inner-declarations` over the nodes under `roots`, which are modules (strict
/// code) or scripts. In strict code a function in a block is block-scoped and allowed unless the
/// options disallow it.
pub fn no_inner_declarations(
    f: &JavaScriptFacts<'_>,
    roots: &[NodeIdentifier],
    source: &str,
    module: bool,
    options: NoInnerDeclarationsOptions,
    reporter: &mut Reporter<'_>,
) {
    let tree = f.syntax_tree;
    // Each node with whether the code around it is strict.
    let mut stack: Vec<(NodeIdentifier, bool)> = roots.iter().rev().map(|&r| (r, module)).collect();
    while let Some((node, strict)) = stack.pop() {
        let kind = match tree.kind(node) {
            Kind::Function {
                declaration: true, ..
            } if options.disallow_block_scoped_functions || !strict => Some("function"),
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
        let inner = strict || makes_strict(f, source, node);
        let at = stack.len();
        tree.for_each_child(node, |child| stack.push((child, inner)));
        stack[at..].reverse();
    }
}

/// Whether the code inside `node` is strict however the code around it is: a class, or a
/// program or function whose directive prologue says `"use strict"`.
fn makes_strict(f: &JavaScriptFacts<'_>, source: &str, node: NodeIdentifier) -> bool {
    let tree = f.syntax_tree;
    let body = match tree.kind(node) {
        Kind::Class(Class::Definition { .. }) => return true,
        Kind::Program(_) => node,
        Kind::Function { body, .. }
        | Kind::Arrow {
            body,
            expression_body: false,
            ..
        } => body,
        _ => return false,
    };
    let (Kind::Program(statements) | Kind::Block(statements)) = tree.kind(body) else {
        return false;
    };
    statements
        .iter()
        .map_while(|&statement| match tree.kind(statement) {
            // The parser keeps no parentheses, so `("use strict");` starts before its string.
            Kind::ExpressionStatement(expression)
                if matches!(tree.kind(expression), Kind::String)
                    && f.span(statement).start_offset == f.span(expression).start_offset =>
            {
                Some(expression)
            }
            _ => None,
        })
        // An escape in the directive's text would make it longer than `"use strict"`.
        .any(|directive| {
            tree.str_value(directive, source) == "use strict" && f.span(directive).len() == 12
        })
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
