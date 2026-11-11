use oxc_ast::ast::{Expression, Statement};
use oxc_span::SPAN;
use rsvelte_svelte_semantic::compiler_syntax_tree::{CompilerSyntaxTree, NodeList};
use rsvelte_typescript_tree::{ExpressionIdentifier, Tree};

use super::builder::Builder;

/// `{@debug a, b}`: `console.log({ a: …, b: … }); debugger;`, each value as `value` lowers it.
pub(super) fn debug_tag<'o>(
    b: &Builder<'o>,
    tree: &CompilerSyntaxTree,
    javascript: &Tree,
    identifiers: NodeList,
    mut value: impl FnMut(ExpressionIdentifier) -> Expression<'o>,
) -> [Statement<'o>; 2] {
    let properties = tree.debug_identifiers(identifiers).iter().map(|&e| {
        let Expression::Identifier(identifier) = javascript.get_expression(e) else {
            unreachable!("the parser gives `{{@debug}}` identifiers only")
        };
        b.init(&identifier.name, value(e))
    });
    let object = b.object(properties);
    let log = b.call(b.member(b.id("console"), "log"), [object]);
    [b.statement(log), Statement::new_debugger_statement(SPAN, b)]
}
