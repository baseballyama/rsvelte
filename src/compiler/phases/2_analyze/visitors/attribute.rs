//! Attribute visitor.
//!
//! Analyzes regular attributes.
//!
//! Corresponds to Svelte's `2-analyze/visitors/Attribute.js`.

use super::VisitorContext;
use super::shared::attribute::{AttributeChunk, get_attribute_chunks, is_event_attribute};
use super::shared::fragment::mark_subtree_dynamic;
use super::shared::utils::{is_invalid_attribute_name, validate_attribute_name};
use crate::ast::template::{AttributeNode, AttributeValue, AttributeValuePart, TemplateNode};
use crate::compiler::phases::phase2_analyze::AnalysisError;
use crate::compiler::phases::phase2_analyze::errors;
use crate::compiler::utils::{can_delegate_event, cannot_be_set_statically};

/// Visit an attribute.
///
/// Corresponds to `Attribute` in Attribute.js.
///
/// Analyzes attributes and marks subtrees as dynamic when necessary.
/// Also populates `attribute.metadata.needs_clsx` and `attribute.metadata.delegated`
/// so that Phase 3 transforms can decide whether to wrap class expressions
/// in `$.clsx(...)` and whether an event handler can use the delegated
/// listener path.
pub fn visit(
    attribute: &mut AttributeNode,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // Visit children (expressions in attribute value)
    // In JS: context.next();
    // Walk through all expressions in the attribute value
    visit_attribute_value_expressions(&attribute.value, context)?;

    // Validate slot attribute must be a static value
    // Corresponds to validate_slot_attribute in shared/attribute.js
    if attribute.name == "slot" && !is_text_attribute(attribute) {
        return Err(errors::slot_attribute_invalid());
    }

    // Validate attribute name for invalid characters
    if is_invalid_attribute_name(&attribute.name) {
        return Err(errors::attribute_invalid_name(&attribute.name));
    }

    // Validate attribute name for illegal colons
    if let Err(warning) = validate_attribute_name(&attribute.name) {
        context.emit_warning(warning);
    }

    // Get the parent node to determine context
    let parent = context.path.last();

    // Special case: <option value=""> must be handled dynamically
    if let Some(TemplateNode::RegularElement(element)) = parent
        && attribute.name == "value"
        && element.name == "option"
    {
        mark_subtree_dynamic(&context.path);
    }

    // Event attributes require dynamic handling
    if is_event_attribute(attribute) {
        mark_subtree_dynamic(&context.path);
    }

    // Attributes that cannot be set statically require dynamic handling
    if cannot_be_set_statically(&attribute.name) {
        mark_subtree_dynamic(&context.path);
    }

    // Special handling for class attribute with complex expressions
    // In JS: class={[...]} or class={{...}} or class={x} need clsx to resolve the classes
    if attribute.name == "class" {
        use crate::ast::template::AttributeValue;

        // Check if it's a complex expression that needs clsx
        if let AttributeValue::Expression(expr_tag) = &attribute.value {
            let expr_type = expr_tag.expression.node_type().unwrap_or("");

            // If it's not a simple literal, template, or binary expression, it needs clsx
            if !matches!(
                expr_type,
                "Literal" | "TemplateLiteral" | "BinaryExpression"
            ) {
                mark_subtree_dynamic(&context.path);
                attribute.metadata.needs_clsx = true;
            }
        }
    }

    // Process attribute value chunks to check for function expressions
    // In JS: if (node.value !== true) { for (const chunk of get_attribute_chunks(node.value)) { ... }}
    use crate::ast::template::AttributeValue;
    if !matches!(&attribute.value, AttributeValue::True(_)) {
        let chunks = get_attribute_chunks(&attribute.value);

        for chunk in &chunks {
            if let AttributeChunk::Expression(expr_tag) = chunk {
                // Check if it's a function expression
                let expr_type = expr_tag.expression.node_type().unwrap_or("");

                // Skip validation for function expressions (they're allowed in attributes)
                if matches!(expr_type, "FunctionExpression" | "ArrowFunctionExpression") {
                    continue;
                }
            }
        }

        // Event attribute handling
        if is_event_attribute(attribute) {
            if let Some(parent) = parent
                && matches!(
                    parent,
                    TemplateNode::RegularElement(_) | TemplateNode::SvelteElement(_)
                )
            {
                // Track that this component uses event attributes
                context.uses_event_attributes = true;
                context.analysis.uses_event_attributes = true;
            }

            // Check if event can be delegated
            // In JS: node.metadata.delegated = parent?.type === 'RegularElement' && can_delegate_event(node.name.slice(2));
            if let Some(TemplateNode::RegularElement(_)) = parent {
                let event_name = &attribute.name[2..]; // Remove "on" prefix
                attribute.metadata.delegated = can_delegate_event(event_name);
            }
        }
    }

    Ok(())
}

/// Check if an attribute value is a single static text node.
///
/// Corresponds to `is_text_attribute` in utils/ast.js.
///
/// Returns true if the attribute value is:
/// - A Sequence with exactly one Text part
fn is_text_attribute(attribute: &AttributeNode) -> bool {
    match &attribute.value {
        AttributeValue::Sequence(parts) => {
            parts.len() == 1 && matches!(&parts[0], AttributeValuePart::Text(_))
        }
        // True (boolean attribute) is not a text attribute
        AttributeValue::True(_) => false,
        // Expression is not a text attribute
        AttributeValue::Expression(_) => false,
    }
}

/// Visit all JavaScript expressions within an attribute value.
///
/// This walks through the JS AST of expressions in the attribute value,
/// triggering visitors for CallExpression, MemberExpression, etc.
/// which set `needs_context` when appropriate.
pub fn visit_attribute_value_expressions(
    value: &AttributeValue,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    match value {
        AttributeValue::True(_) => {
            // No expressions to visit
        }
        AttributeValue::Expression(expr_tag) => {
            // Visit the expression
            super::script::walk_expression(&expr_tag.expression, context)?;
        }
        AttributeValue::Sequence(parts) => {
            // Visit each expression tag in the sequence
            for part in parts {
                if let AttributeValuePart::ExpressionTag(expr_tag) = part {
                    super::script::walk_expression(&expr_tag.expression, context)?;
                }
            }
        }
    }
    Ok(())
}
