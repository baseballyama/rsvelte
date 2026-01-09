//! Attribute visitor.
//!
//! Analyzes regular attributes.
//!
//! Corresponds to Svelte's `2-analyze/visitors/Attribute.js`.

use super::VisitorContext;
use super::shared::attribute::{AttributeChunk, get_attribute_chunks, is_event_attribute};
use super::shared::fragment::mark_subtree_dynamic;
use crate::ast::template::{AttributeNode, TemplateNode};
use crate::compiler::phases::phase2_analyze::AnalysisError;
use crate::compiler::utils::{can_delegate_event, cannot_be_set_statically};

/// Visit an attribute.
///
/// Corresponds to `Attribute` in Attribute.js.
///
/// Analyzes attributes and marks subtrees as dynamic when necessary.
pub fn visit(attribute: &AttributeNode, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // TODO: Visit children (expressions in attribute value)
    // In JS: context.next();
    // This requires traversing expression nodes in the attribute value

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
            // TODO: Set metadata.needs_clsx flag on the attribute
            // In JS: node.metadata.needs_clsx = true;
            // This requires AST metadata support

            // For now, check if the expression is not a simple literal/template/binary
            let expr_type = expr_tag.expression.node_type().unwrap_or("");

            // If it's not a simple literal, template, or binary expression, it needs clsx
            if !matches!(
                expr_type,
                "Literal" | "TemplateLiteral" | "BinaryExpression"
            ) {
                mark_subtree_dynamic(&context.path);
                // TODO: Mark attribute.metadata.needs_clsx = true
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
                context.analysis.uses_event_attributes = true;
            }

            // Check if event can be delegated
            // In JS: node.metadata.delegated = parent?.type === 'RegularElement' && can_delegate_event(node.name.slice(2));
            if let Some(TemplateNode::RegularElement(_)) = parent {
                let event_name = &attribute.name[2..]; // Remove "on" prefix
                let _delegated = can_delegate_event(event_name);
                // TODO: Set attribute.metadata.delegated = delegated
                // This requires AST metadata support
            }
        }
    }

    Ok(())
}
