//! Values a rule can know without running the code: what a `const` holds, and a string built
//! only from literals.

use rsvelte_typescript_semantic::scope::{DeclarationKind, Semantic};
use rsvelte_typescript_syntax::operators::BinaryOperator;
use rsvelte_typescript_syntax::{Kind, NodeIdentifier};

use super::expressions::Expressions;

/// Follows an identifier through `const name = initializer` declarations to the first expression
/// that is not such an identifier (`findRootExpression` upstream). A cycle stops where it closes.
/// `semantic` is asked only for an identifier.
pub(super) fn root<'s>(
    expressions: &Expressions<'_>,
    semantic: impl FnOnce() -> &'s Semantic,
    mut expression: NodeIdentifier,
) -> NodeIdentifier {
    let javascript = expressions.javascript;
    if !matches!(expressions.kind(expression), Some(Kind::Identifier(_))) {
        return expression;
    }
    let semantic = semantic();
    let mut visited = Vec::new();
    while matches!(expressions.kind(expression), Some(Kind::Identifier(_)))
        && !visited.contains(&expression)
    {
        visited.push(expression);
        let Some(binding) = semantic.binding_of(expression) else {
            break;
        };
        // A type of the same name makes it one name with two definitions.
        if semantic.shares_name_with_type(binding) {
            break;
        }
        let binding = &semantic.bindings[binding];
        if binding.kind != DeclarationKind::Const {
            break;
        }
        let Some(declarator) = binding.declaration else {
            break;
        };
        // A destructured name does not hold the initializer.
        let Kind::Declarator {
            identifier,
            initializer: Some(initializer),
        } = javascript.kind(declarator)
        else {
            break;
        };
        if identifier != binding.node {
            break;
        }
        expression = initializer;
    }
    expression
}

/// A string literal, a template whose expressions are such strings, or their `+`
/// (`getStringIfConstant` upstream).
pub(super) fn string_if_constant(
    expressions: &Expressions<'_>,
    expression: NodeIdentifier,
) -> Option<String> {
    let (javascript, source) = (expressions.javascript, expressions.source);
    match expressions.kind(expression)? {
        Kind::String => Some(javascript.str_value(expression, source).to_owned()),
        Kind::Template {
            quasis,
            expressions: parts,
        } => {
            let mut out = String::new();
            for (index, &quasi) in quasis.iter().enumerate() {
                out.push_str(&cooked(expressions, quasi)?);
                if let Some(&inner) = parts.get(index) {
                    out.push_str(&string_if_constant(expressions, inner)?);
                }
            }
            Some(out)
        }
        Kind::Binary(BinaryOperator::Add, left, right) => {
            let mut out = string_if_constant(expressions, left)?;
            out.push_str(&string_if_constant(expressions, right)?);
            Some(out)
        }
        _ => None,
    }
}

/// A template element's value; `None` for an invalid escape.
fn cooked(expressions: &Expressions<'_>, quasi: NodeIdentifier) -> Option<String> {
    let raw = expressions
        .javascript
        .str_value(quasi, expressions.source)
        .replace("\r\n", "\n")
        .replace('\r', "\n");
    if raw.contains('\\') {
        rsvelte_typescript_syntax::lexer::decode_string(&raw)
    } else {
        Some(raw)
    }
}
