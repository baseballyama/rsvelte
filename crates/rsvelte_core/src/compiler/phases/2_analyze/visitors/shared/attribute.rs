//! Attribute validation utilities.
//!
//! Functions for validating attributes on elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/shared/attribute.js`.

use super::super::super::AnalysisError;
use super::super::super::errors;
use super::super::VisitorContext;
use crate::ast::template::{AttributeNode, AttributeValue, AttributeValuePart, ExpressionTag};

/// Illegal characters in attribute names.
const ILLEGAL_ATTRIBUTE_CHARS: &[char] = &['"', '\'', '>', '/', '='];

/// Validate an attribute.
///
/// Corresponds to `validate_attribute` in `shared/attribute.js`.
pub fn validate_attribute(attribute: &AttributeNode) -> Result<(), AnalysisError> {
    // Check for illegal characters in attribute name
    if attribute
        .name
        .chars()
        .any(|c| ILLEGAL_ATTRIBUTE_CHARS.contains(&c))
    {
        return Err(AnalysisError::Validation(format!(
            "Attribute name '{}' contains illegal characters",
            attribute.name
        )));
    }

    // Check for unquoted sequences: an attribute with multiple value parts (ExpressionTag + Text, etc.)
    // that is not enclosed in quotes. In Svelte, `onclick={() => foo()}}` where the extra `}` creates
    // a mixed value sequence [ExpressionTag, Text("}")] is invalid.
    //
    // The official Svelte check is:
    //   if attribute.value.length === 1 return; (single part is ok)
    //   const is_quoted = attribute.value.at(-1)?.end !== attribute.end;
    //   if (!is_quoted) e.attribute_unquoted_sequence(attribute);
    //
    // In our AST, a single Expression variant is the unquoted single-expression case.
    // A Sequence with length > 1 is the mixed case.
    // We detect "unquoted" by checking if the last part's end equals the attribute's end
    // (no closing quote between last part and attribute end).
    if let AttributeValue::Sequence(parts) = &attribute.value
        && parts.len() > 1
    {
        // Get the end position of the last part
        let last_end = parts.last().map(|part| match part {
            AttributeValuePart::ExpressionTag(e) => e.end,
            AttributeValuePart::Text(t) => t.end,
        });
        // If the last part's end equals the attribute's end, the value is unquoted
        if last_end == Some(attribute.end) {
            return Err(errors::attribute_unquoted_sequence());
        }
    }

    Ok(())
}

/// Warn when a component or custom-element attribute wraps a lone expression in
/// quotes. Upstream reaches this only through `validate_attribute`, which both
/// of its callers guard with `analysis.runes`, so legacy components must stay
/// silent.
pub fn warn_attribute_quoted(context: &mut VisitorContext, attribute: &AttributeNode) {
    if !context.analysis.runes || !is_quoted_single_expression(attribute) {
        return;
    }
    let mut warning = super::super::super::warnings::attribute_quoted();
    warning.start = Some(attribute.start);
    warning.end = Some(attribute.end);
    context.emit_warning(warning);
}

/// Whether the attribute's value is a lone expression tag inside quotes.
pub fn is_quoted_single_expression(attribute: &AttributeNode) -> bool {
    matches!(&attribute.value, AttributeValue::Sequence(parts)
        if parts.len() == 1 && matches!(&parts[0], AttributeValuePart::ExpressionTag(_)))
}

/// Validate attribute name format.
pub fn validate_attribute_name(attribute: &AttributeNode) -> Result<(), AnalysisError> {
    // Check for empty attribute name
    if attribute.name.is_empty() {
        return Err(AnalysisError::Validation(
            "Attribute name cannot be empty".to_string(),
        ));
    }

    // Check first character
    let first_char = attribute.name.chars().next().unwrap();
    if first_char.is_ascii_digit() {
        return Err(AnalysisError::Validation(format!(
            "Attribute name '{}' cannot start with a digit",
            attribute.name
        )));
    }

    Ok(())
}

/// Validate slot attribute on an element.
///
/// The slot attribute is only valid:
/// 1. As a direct child of a component (Component, SvelteComponent, SvelteSelf)
/// 2. As a descendant of a custom element (with no component in between)
///
/// The key insight is that we need to find the NEAREST "slot owner" (component or custom element).
/// If the nearest owner is a component, we must be its direct child.
/// If the nearest owner is a custom element, we're always OK.
///
/// Corresponds to `validate_slot_attribute` in shared/attribute.js.
pub fn validate_slot_attribute(
    context: &VisitorContext,
    attribute: &AttributeNode,
) -> Result<(), AnalysisError> {
    // Check if we're a direct child of a component
    if context.is_direct_child_of_component {
        return Ok(());
    }

    // A `slot="…"` on an element whose immediate parent is a `{#snippet}` body is
    // allowed — upstream `validate_slot_attribute` returns early when
    // `context.path.at(-2)?.type === 'SnippetBlock'`. (A non-text `slot={…}` value
    // is still rejected by the separate `is_text_attribute` check in the attribute
    // visitor, mirroring upstream's `slot_attribute_invalid` there.)
    if context.is_direct_child_of_snippet {
        return Ok(());
    }

    // Find the nearest slot owner (last item in the stack)
    if let Some(nearest_owner) = context.slot_owner_ancestors.last() {
        match nearest_owner {
            super::super::SlotOwnerType::CustomElement => {
                // Custom element owner - slots are always valid inside custom elements
                return Ok(());
            }
            super::super::SlotOwnerType::Component => {
                // Component owner - we must be a direct child, but we're not (checked above)
                return Err(
                    super::super::super::errors::slot_attribute_invalid_placement()
                        .at(attribute.start, attribute.end),
                );
            }
        }
    }

    // No slot owner found - not in a valid position for slot attribute
    Err(
        super::super::super::errors::slot_attribute_invalid_placement()
            .at(attribute.start, attribute.end),
    )
}

/// Check if an attribute is an expression attribute.
pub fn is_expression_attribute(attribute: &AttributeNode<'_>) -> bool {
    use crate::ast::template::AttributeValue;

    matches!(&attribute.value, AttributeValue::Expression(_))
}

/// Get the expression tag from an attribute value.
pub fn get_attribute_expression<'b, 'a>(
    attribute: &'b AttributeNode<'a>,
) -> Option<&'b ExpressionTag<'a>> {
    use crate::ast::template::AttributeValue;

    match &attribute.value {
        AttributeValue::Expression(expr) => Some(expr),
        _ => None,
    }
}

/// Common React attribute name corrections.
pub fn get_correct_attribute_name(name: &str) -> Option<&'static str> {
    match name {
        "className" => Some("class"),
        "htmlFor" => Some("for"),
        _ => None,
    }
}

/// Check if an attribute is an event attribute (starts with "on" and has expression value).
///
/// Corresponds to `is_event_attribute` in ast.js.
pub fn is_event_attribute(attribute: &AttributeNode<'_>) -> bool {
    attribute.name.starts_with("on") && is_expression_attribute(attribute)
}

/// Record an event attribute whose expression is a lone arrow, so Phase 3 can
/// exempt that arrow's direct assignment body from the dev `$.assign` wrap.
/// Upstream's test is node identity (`expression === context.path.at(-1)`), so
/// only the arrow that *is* the attribute's expression qualifies — never one
/// nested inside it. Call this for `RegularElement` and `SvelteElement` only:
/// `<svelte:window>` and friends are absent from upstream's list.
pub fn record_event_attribute_arrow(context: &mut VisitorContext, attribute: &AttributeNode<'_>) {
    if !is_event_attribute(attribute) {
        return;
    }
    if let AttributeValue::Expression(tag) = &attribute.value
        && tag.expression.as_node().node_type() == Some("ArrowFunctionExpression")
        && let Some(start) = tag.expression.as_node().start()
    {
        context.analysis.assign_exempt_arrow_starts.insert(start);
    }
}

/// Record the nodes exempted by upstream's second `$.assign` special case
/// (`AssignmentExpression.js:204-215`), for one expression that a `Component`,
/// `<svelte:component>` or `bind:` directive visits directly: the expression
/// itself when it is an assignment, an arrow that *is* the expression, or an
/// arrow that is a direct element of a getter/setter `SequenceExpression`.
/// `lone_arrow_exempt` is false for `<svelte:component>`, whose `path.at(-2)`
/// form upstream omits.
pub fn record_assign_exempt_expression(
    context: &mut VisitorContext,
    expression: &crate::ast::js::Expression<'_>,
    lone_arrow_exempt: bool,
) {
    use crate::ast::typed_expr::JsNode;

    let Some(node) = expression.try_as_node_ref() else {
        return;
    };
    match node {
        JsNode::AssignmentExpression { start, .. } => {
            context
                .analysis
                .assign_exempt_assignment_starts
                .insert(*start);
        }
        JsNode::ArrowFunctionExpression { start, .. } if lone_arrow_exempt => {
            context.analysis.assign_exempt_arrow_starts.insert(*start);
        }
        JsNode::SequenceExpression { expressions, .. } => {
            let arena = context.parse_arena;
            for child in arena.get_js_children(*expressions) {
                if let JsNode::ArrowFunctionExpression { start, .. } = child {
                    context.analysis.assign_exempt_arrow_starts.insert(*start);
                }
            }
        }
        _ => {}
    }
}

/// `record_assign_exempt_expression` for every expression a component visits
/// directly. Spread attributes are excluded: upstream keeps the
/// `SpreadAttribute` node on the path, so nothing under one qualifies.
pub fn record_component_assign_exempt(
    context: &mut VisitorContext,
    attributes: &[crate::ast::template::Attribute<'_>],
    lone_arrow_exempt: bool,
) {
    use crate::ast::template::Attribute;

    for attr in attributes {
        match attr {
            Attribute::Attribute(a) => match &a.value {
                AttributeValue::Expression(tag) => {
                    record_assign_exempt_expression(context, &tag.expression, lone_arrow_exempt);
                }
                AttributeValue::Sequence(parts) => {
                    for part in parts {
                        if let AttributeValuePart::ExpressionTag(tag) = part {
                            record_assign_exempt_expression(
                                context,
                                &tag.expression,
                                lone_arrow_exempt,
                            );
                        }
                    }
                }
                AttributeValue::True(_) => {}
            },
            Attribute::BindDirective(bind) => {
                record_assign_exempt_expression(context, &bind.expression, lone_arrow_exempt);
            }
            Attribute::OnDirective(on) => {
                if let Some(expression) = &on.expression {
                    record_assign_exempt_expression(context, expression, lone_arrow_exempt);
                }
            }
            Attribute::AttachTag(attach) => {
                record_assign_exempt_expression(context, &attach.expression, lone_arrow_exempt);
            }
            _ => {}
        }
    }
}

/// Get the chunks of an attribute value.
///
/// Corresponds to `get_attribute_chunks` in ast.js.
///
/// Returns the expression tags and text nodes that make up an attribute value.
pub fn get_attribute_chunks<'a>(
    value: &'a crate::ast::template::AttributeValue<'a>,
) -> Vec<AttributeChunk<'a>> {
    use crate::ast::template::{AttributeValue, AttributeValuePart};

    match value {
        AttributeValue::True(_) => Vec::new(),
        AttributeValue::Expression(expr) => vec![AttributeChunk::Expression(expr)],
        AttributeValue::Sequence(seq) => seq
            .iter()
            .map(|node| match node {
                AttributeValuePart::Text(text) => AttributeChunk::Text(text),
                AttributeValuePart::ExpressionTag(expr) => AttributeChunk::Expression(expr),
            })
            .collect(),
    }
}

/// A chunk of an attribute value (text or expression).
#[derive(Debug)]
pub enum AttributeChunk<'a> {
    Text(&'a crate::ast::template::Text<'a>),
    Expression(&'a crate::ast::template::ExpressionTag<'a>),
}

/// Check if an expression is an unparenthesized sequence expression.
///
/// In runes mode, sequence expressions like `foo={x, y, z}` are not allowed
/// unless they are wrapped in parentheses: `foo={(x, y, z)}`.
///
/// Corresponds to `disallow_unparenthesized_sequences` in utils/ast.js.
pub fn is_unparenthesized_sequence_expression(
    expression_tag: &ExpressionTag<'_>,
    source: &str,
) -> bool {
    // Check if it's a SequenceExpression
    if let Some(expr_type) = expression_tag.expression.node_type()
        && expr_type == "SequenceExpression"
    {
        // Check if it's parenthesized by looking at the source before the expression start
        if let Some(start) = expression_tag.expression.start() {
            let mut i = start as usize;
            // Walk backwards from the expression start to find '(' or '{'
            while i > 0 {
                i -= 1;
                if i >= source.len() {
                    break;
                }
                let byte = source.as_bytes().get(i).copied();
                match byte {
                    Some(b'(') => {
                        // Expression is parenthesized
                        return false;
                    }
                    Some(b'{') => {
                        // Found opening brace without parenthesis - unparenthesized
                        return true;
                    }
                    Some(b) if (b as char).is_ascii_whitespace() => {
                        // Skip whitespace
                        continue;
                    }
                    _ => {
                        // Some other character - continue looking
                        continue;
                    }
                }
            }
        }
    }
    false
}
