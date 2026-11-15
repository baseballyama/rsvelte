//! svelte-eslint-parser's check of a shorthand `bind:` or `class:` whose name is not an
//! identifier.

use oxc_allocator::Allocator;
use oxc_ast::ast::Expression;
use oxc_span::SourceType;
use oxc_syntax::identifier::is_identifier_name;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_svelte_syntax::syntax_tree::{AttributeKind, Component};

/// What svelte-eslint-parser throws at the first such directive, with where: Svelte makes the
/// whole name one identifier, and the parser reads the name again as JavaScript and finds another
/// node. The error is a refusal when this port cannot name that node.
pub(super) fn error(
    component: &Component,
    source: &str,
) -> Option<Result<(String, u32), Diagnostic>> {
    let name = (component.attributes.iter())
        .filter(|a| a.shorthand && matches!(a.kind, AttributeKind::Bind | AttributeKind::Class))
        .filter_map(|a| a.directive_name(&component.modifiers))
        .find(|name| !is_identifier_name(name.text(source)))?;
    let allocator = Allocator::default();
    let read = oxc_parser::Parser::new(&allocator, name.text(source), SourceType::mjs())
        .parse_expression();
    let found = match read {
        Ok(Expression::StaticMemberExpression(_) | Expression::ComputedMemberExpression(_)) => {
            "MemberExpression"
        }
        Ok(Expression::BinaryExpression(_)) => "BinaryExpression",
        _ => {
            return Some(Err(Diagnostic::error(
                "unsupported",
                "this shorthand directive name is not supported yet",
                name,
            )));
        }
    };
    let message = format!("Expected Identifier, but {found} found.");
    Some(Ok((message, name.start_offset)))
}
