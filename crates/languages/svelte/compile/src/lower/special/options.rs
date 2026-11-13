//! What `<svelte:options>` asks of the output; the parser has rejected options upstream rejects.

use oxc_ast::ast::Expression;

use super::SvelteOptions;
use crate::lower::{Attribute, AttributeValue, CompileInput, Diagnostic, unsupported};

pub(super) fn read(
    input: &CompileInput<'_>,
    attributes: &[Attribute],
) -> Result<SvelteOptions, Diagnostic> {
    let source = input.component.source_text;
    let mut options = SvelteOptions::default();
    for attribute in attributes {
        match attribute.name.text(source) {
            // Legacy mode falls back to the official compiler.
            "runes" if is_false(input, &attribute.value) => {
                return unsupported("this compiler option", attribute.span);
            }
            "customElement" => {
                options.custom_element = crate::lower::custom_element::read(input, attribute);
            }
            "css" => options.stylesheet_injected = true,
            _ => {}
        }
    }
    Ok(options)
}

fn is_false(input: &CompileInput<'_>, value: &AttributeValue) -> bool {
    let (AttributeValue::Expression { expression, .. } | AttributeValue::Shorthand(expression)) =
        value
    else {
        return false;
    };
    matches!(
        input
            .component
            .javascript
            .get_expression(*expression)
            .without_parentheses(),
        Expression::BooleanLiteral(literal) if !literal.value
    )
}
