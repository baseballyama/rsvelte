//! StyleDirective visitor.
//!
//! Analyzes style: directives.
//!
//! Corresponds to Svelte's `2-analyze/visitors/StyleDirective.js`.

use super::super::errors;
use super::VisitorContext;
use super::shared::fragment::mark_subtree_dynamic;
use super::shared::utils::walk_js_expression_node;
use crate::ast::template::{AttributeValue, AttributeValuePart, StyleDirective};
use crate::compiler::phases::phase2_analyze::AnalysisError;
use crate::compiler::phases::phase2_analyze::scope::BindingKind;

/// Visit a style directive.
pub fn visit(
    directive: &mut StyleDirective,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // style: directives set individual CSS properties

    // Validate modifiers - a single "important" is the only accepted list
    if directive.modifiers.len() > 1
        || directive
            .modifiers
            .first()
            .is_some_and(|m| m.as_str() != "important")
    {
        return Err(errors::style_directive_invalid_modifier().at(directive.start, directive.end));
    }

    mark_subtree_dynamic(&context.path);

    // Analyze the expression value
    match &directive.value {
        AttributeValue::True(_) => {
            // Shorthand: `style:color` means use the variable `color`
            // Look up the binding for the directive name and add a reference
            // This corresponds to the official compiler's handling at StyleDirective.js L18-29
            let name = directive.name.as_str();
            if let Some(binding_idx) = context.analysis.root.get_binding(name, context.scope) {
                let binding = &context.analysis.root.bindings[binding_idx];
                if binding.kind != BindingKind::Normal {
                    directive.metadata.expression.set_has_state(true);
                }
                if binding.blocker.is_some() {
                    directive
                        .metadata
                        .expression
                        .dependencies
                        .insert(binding_idx);
                }

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
            walk_js_expression_node(&node, context, &mut directive.metadata.expression)?;
            super::await_block::collect_pickled_awaits_node(
                &node,
                &mut context.analysis.pickled_awaits,
                context.parse_arena,
            );
        }
        AttributeValue::Sequence(parts) => {
            // Mixed content: `style:color="prefix{expr}suffix"`
            for part in parts {
                match part {
                    AttributeValuePart::ExpressionTag(expr_tag) => {
                        let node = expr_tag.expression.as_node();
                        walk_js_expression_node(
                            &node,
                            context,
                            &mut directive.metadata.expression,
                        )?;
                        super::await_block::collect_pickled_awaits_node(
                            &node,
                            &mut context.analysis.pickled_awaits,
                            context.parse_arena,
                        );
                    }
                    AttributeValuePart::Text(text) => {
                        super::text::check_bidirectional_control_characters(
                            &text.data, text.start, context,
                        );
                    }
                }
            }
        }
    }

    Ok(())
}
