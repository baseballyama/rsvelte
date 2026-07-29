//! Emit `<svelte:options>` as a `svelteHTML.createElement(...)` call. The parser
//! stores it in `ast.options` rather than `fragment.nodes`, so it needs its own
//! emitter.

use crate::ast::template::Root;

use super::super::magic_string::MagicString;
use super::super::svelte2tsx::slice_src;

/// Emit the `<svelte:options>` tag as a `svelteHTML.createElement(...)` call.
/// The parser stores svelte:options in `ast.options` (not in `fragment.nodes`),
/// so it is handled separately.
pub(crate) fn emit_svelte_options_element(ast: &Root, source: &str, str: &mut MagicString) {
    let Some(options_node) = ast.options.as_ref() else {
        return;
    };
    if options_node.start >= options_node.end {
        return;
    }
    // Build attribute string from options attributes
    let mut attrs_parts = Vec::new();
    let mut has_expression_attr = false;
    for node in &options_node.attributes {
        match &node.value {
            crate::ast::template::AttributeValue::True(_) => {
                attrs_parts.push(format!("\"{}\":true,", node.name));
            }
            crate::ast::template::AttributeValue::Expression(expr) => {
                has_expression_attr = true;
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
                    has_expression_attr = true;
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
                                has_expression_attr = true;
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
    let attrs_str = if attrs_parts.is_empty() {
        String::new()
    } else if has_expression_attr {
        // Expression attributes: preserve source spacing
        let extra_spaces =
            count_tag_to_attr_spaces_in_source("svelte:options", options_node.start, source);
        format!("{}{}", " ".repeat(extra_spaces + 1), attrs_parts.join(""))
    } else {
        // Bare boolean attributes only: no extra spacing
        attrs_parts.join("")
    };
    let replacement = format!(
        " {{ svelteHTML.createElement(\"svelte:options\", {{{}}});}}",
        attrs_str
    );
    str.overwrite(options_node.start, options_node.end, &replacement);
}

/// Count whitespace between tag name and first attribute in source.
fn count_tag_to_attr_spaces_in_source(tag_name: &str, el_start: u32, source: &str) -> usize {
    let name_end = el_start as usize + 1 + tag_name.len(); // +1 for '<'
    let bytes = source.as_bytes();
    let mut count = 0;
    let mut i = name_end;
    while i < source.len() {
        let ch = bytes[i];
        if ch == b' ' || ch == b'\t' || ch == b'\n' || ch == b'\r' {
            count += 1;
            i += 1;
        } else {
            break;
        }
    }
    count
}
