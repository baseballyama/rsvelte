//! StyleDirective visitor.
//!
//! Analyzes style: directives.
//!
//! Corresponds to Svelte's `2-analyze/visitors/StyleDirective.js`.

use super::super::errors;
use super::VisitorContext;
use super::shared::utils::walk_js_expression_node;
use crate::ast::template::{AttributeValue, AttributeValuePart, StyleDirective};
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a style directive.
pub fn visit(
    directive: &StyleDirective,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // style: directives set individual CSS properties

    // Validate modifiers - only "important" is allowed
    for modifier in &directive.modifiers {
        if modifier.as_str() != "important" {
            return Err(errors::style_directive_invalid_modifier());
        }
    }

    // Analyze the expression value
    match &directive.value {
        AttributeValue::True(_) => {
            // Shorthand: `style:color` means use the variable `color`
            // Look up the binding for the directive name and add a reference
            // This corresponds to the official compiler's handling at StyleDirective.js L18-29
            let name = directive.name.as_str();
            if let Some(&binding_idx) = context.analysis.root.scope.declarations.get(name) {
                // Add a style directive reference for legacy state promotion
                context.analysis.root.bindings[binding_idx].add_reference(
                    directive.start,
                    directive.end,
                    false, // not a generic template reference
                    false, // not a reactive declaration reference
                    true,  // IS a style directive reference
                );
            }
        }
        AttributeValue::Expression(expr_tag) => {
            // Single expression: `style:color={expr}`
            let node = expr_tag.expression.as_node();
            let mut metadata = crate::ast::template::ExpressionMetadata::default();
            walk_js_expression_node(&node, context, &mut metadata)?;
        }
        AttributeValue::Sequence(parts) => {
            // Mixed content: `style:color="prefix{expr}suffix"`
            for part in parts {
                if let AttributeValuePart::ExpressionTag(expr_tag) = part {
                    let node = expr_tag.expression.as_node();
                    let mut metadata = crate::ast::template::ExpressionMetadata::default();
                    walk_js_expression_node(&node, context, &mut metadata)?;
                }
            }
        }
    }

    Ok(())
}
