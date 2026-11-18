use oxc_ast::ast::{Expression, ObjectPropertyKind, PropertyKey, PropertyKind, Statement};
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
        // Upstream's key is the identifier itself, whatever characters it holds.
        let value = value(e);
        let shorthand = matches!(&value, Expression::Identifier(v) if v.name == identifier.name);
        let key = PropertyKey::new_static_identifier(SPAN, b.str(&identifier.name), b);
        ObjectPropertyKind::new_object_property(
            SPAN,
            PropertyKind::Init,
            key,
            value,
            false,
            shorthand,
            false,
            b,
        )
    });
    let object = b.object(properties);
    let log = b.call(b.member(b.id("console"), "log"), [object]);
    [b.statement(log), Statement::new_debugger_statement(SPAN, b)]
}
