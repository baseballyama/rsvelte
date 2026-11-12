//! Upstream's `read_options`: the attributes `<svelte:options>` takes, checked in source order.

use oxc_ast::ast::Expression;

use super::{SvelteOptions, invalid};
use crate::lower::{Attribute, AttributeValue, CompileInput, Diagnostic, unsupported};

const NAMESPACE_SVG: &str = "http://www.w3.org/2000/svg";
const NAMESPACE_MATHML: &str = "http://www.w3.org/1998/Math/MathML";

/// Upstream's `get_static_value`: a literal, or nothing it can read statically.
enum Static<'a> {
    /// A bare attribute, or one with an empty value.
    Present,
    Boolean(bool),
    String(&'a str),
    /// Another literal, or no literal at all.
    Other,
}

pub(super) fn validate(
    input: &CompileInput<'_>,
    attributes: &[Attribute],
) -> Result<SvelteOptions, Diagnostic> {
    let source = input.component.source_text;
    let mut options = SvelteOptions::default();
    for attribute in attributes {
        if !matches!(
            attribute.value,
            AttributeValue::Boolean
                | AttributeValue::Static(_)
                | AttributeValue::Expression { .. }
                | AttributeValue::Shorthand(_)
                | AttributeValue::Interpolated(_)
        ) {
            return invalid(
                "svelte_options_invalid_attribute",
                "`<svelte:options>` can only receive static attributes",
                attribute.span,
            );
        }
        let name = attribute.name.text(source);
        let value = || static_value(input, &attribute.value);
        let boolean = || match value() {
            Static::Present => Ok(true),
            Static::Boolean(value) => Ok(value),
            _ => invalid_value(attribute, "true or false"),
        };
        match name {
            "runes" => {
                // Legacy mode falls back to the official compiler.
                if !boolean()? {
                    return unsupported("this compiler option", attribute.span);
                }
            }
            "tag" => {
                return invalid(
                    "svelte_options_deprecated_tag",
                    "\"tag\" option is deprecated \u{2014} use \"customElement\" instead",
                    attribute.span,
                );
            }
            "customElement" => {
                options.custom_element = crate::lower::custom_element::parse(input, attribute)?;
            }
            "namespace" => {
                if !matches!(
                    value(),
                    Static::String(NAMESPACE_SVG | NAMESPACE_MATHML | "html" | "mathml" | "svg")
                ) {
                    return invalid_value(attribute, "\"html\", \"mathml\" or \"svg\"");
                }
            }
            "css" => {
                if !matches!(value(), Static::String("injected")) {
                    return invalid_value(attribute, "\"injected\"");
                }
                options.stylesheet_injected = true;
            }
            "immutable" | "preserveWhitespace" | "accessors" => {
                boolean()?;
            }
            _ => {
                return invalid(
                    "svelte_options_unknown_attribute",
                    &format!("`<svelte:options>` unknown attribute '{name}'"),
                    attribute.span,
                );
            }
        }
    }
    Ok(options)
}

fn static_value<'a>(input: &CompileInput<'a>, value: &'a AttributeValue) -> Static<'a> {
    match value {
        AttributeValue::Boolean => Static::Present,
        AttributeValue::Interpolated(parts) if parts.is_empty() => Static::Present,
        AttributeValue::Static(text) => Static::String(text),
        AttributeValue::Expression { expression, .. } | AttributeValue::Shorthand(expression) => {
            let javascript = input.component.javascript;
            match javascript
                .get_expression(*expression)
                .get_inner_expression()
            {
                Expression::BooleanLiteral(literal) => Static::Boolean(literal.value),
                Expression::StringLiteral(literal) => {
                    literal.value.as_str().map_or(Static::Other, Static::String)
                }
                _ => Static::Other,
            }
        }
        _ => Static::Other,
    }
}

fn invalid_value<T>(attribute: &Attribute, list: &str) -> Result<T, Diagnostic> {
    invalid(
        "svelte_options_invalid_attribute_value",
        &format!("Value must be {list}, if specified"),
        attribute.span,
    )
}
