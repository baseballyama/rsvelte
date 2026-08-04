//! Emit `<svelte:options>` as a `svelteHTML.createElement(...)` call. The parser
//! stores it in `ast.options` rather than `fragment.nodes`, so it needs its own
//! emitter.

use crate::ast::template::{Attribute, Root};
use crate::svelte2tsx::template::ctx::ElementOpenerCommentIndex;
use crate::svelte2tsx::template::utils::opener_spacing::{OpenerCtx, opener_spacing};

use super::super::magic_string::MagicString;
use super::super::svelte2tsx::slice_src;

/// Emit the `<svelte:options>` tag as a `svelteHTML.createElement(...)` call.
/// The parser stores svelte:options in `ast.options` (not in `fragment.nodes`),
/// so it is handled separately.
pub(crate) fn emit_svelte_options_element(ast: &Root, source: &str, str: &mut MagicString<'_>) {
    let Some(options_node) = ast.options.as_ref() else {
        return;
    };
    if options_node.start >= options_node.end {
        return;
    }
    // Build attribute string from options attributes
    let mut attrs_parts = Vec::new();
    for node in &options_node.attributes {
        match &node.value {
            crate::ast::template::AttributeValue::True(_) => {
                attrs_parts.push(format!("\"{}\":true,", node.name));
            }
            crate::ast::template::AttributeValue::Expression(expr) => {
                let expr_text = slice_src(
                    source,
                    expr.expression.start().unwrap_or(0) as usize,
                    expr.expression.end().unwrap_or(0) as usize,
                );
                attrs_parts.push(format!("\"{}\":{},", node.name, expr_text));
            }
            // String / mixed attribute, e.g. `<svelte:options customElement="my-el">`
            // or `namespace="svg"`. Mirror the element-attribute Sequence path
            // (template/mod.rs::format_attribute_node_segments): a lone expression
            // stays a bare expression, everything else becomes a template literal.
            // Reference: language-tools .../htmlxtojsx_v2/nodes/Attribute.ts.
            crate::ast::template::AttributeValue::Sequence(parts) => {
                use crate::ast::template::AttributeValuePart;
                if parts.len() == 1
                    && let AttributeValuePart::ExpressionTag(expr) = &parts[0]
                {
                    let expr_text = slice_src(
                        source,
                        expr.expression.start().unwrap_or(0) as usize,
                        expr.expression.end().unwrap_or(0) as usize,
                    );
                    attrs_parts.push(format!("\"{}\":{},", node.name, expr_text));
                } else {
                    let mut value = String::from("`");
                    for part in parts {
                        match part {
                            AttributeValuePart::Text(text) => {
                                value.push_str(
                                    &text
                                        .raw
                                        .replace('\\', "\\\\")
                                        .replace('`', "\\`")
                                        .replace('$', "\\$"),
                                );
                            }
                            AttributeValuePart::ExpressionTag(expr) => {
                                if let (Some(s), Some(e)) =
                                    (expr.expression.start(), expr.expression.end())
                                {
                                    value.push_str("${");
                                    value.push_str(slice_src(source, s as usize, e as usize));
                                    value.push('}');
                                }
                            }
                        }
                    }
                    value.push('`');
                    attrs_parts.push(format!("\"{}\":{},", node.name, value));
                }
            }
        }
    }

    // `svelte:options` is in `LITERAL_NAME_TAGS` (official names it with a plain
    // string literal), so it contributes no `head` range to the gap replay.
    let attributes: Vec<Attribute> = options_node
        .attributes
        .iter()
        .map(|node| Attribute::Attribute(node.clone()))
        .collect();
    let spacing = opener_spacing(
        source,
        options_node.start,
        "svelte:options",
        options_node.end,
        None,
        &attributes,
        &ElementOpenerCommentIndex::default(),
        OpenerCtx {
            is_element: true,
            in_component_slot: false,
            tag_name: "svelte:options",
            is_slot_tag: false,
        },
    );
    let attrs_str = format!(
        "{}{}",
        " ".repeat(spacing.in_attr_object),
        attrs_parts.join("")
    );
    let replacement = format!(
        "{}{{ svelteHTML.createElement(\"svelte:options\", {{{}}});}}",
        " ".repeat(spacing.before_block),
        attrs_str
    );
    str.overwrite(options_node.start, options_node.end, &replacement);
}
