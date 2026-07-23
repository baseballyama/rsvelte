//! SvelteComponent visitor.
//!
//! Analyzes <svelte:component> elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SvelteComponent.js`.

use super::super::{AnalysisError, errors, warnings};
use super::VisitorContext;
use super::shared::fragment;
use super::shared::utils::validate_assignment_node;
use crate::ast::template::{
    Attribute, AttributeNode, AttributeValue, AttributeValuePart, SvelteComponentElement,
};

/// Visit a svelte:component.
pub fn visit<'a, 'b: 'a>(
    component: &mut SvelteComponentElement<'b>,
    context: &mut VisitorContext<'a>,
) -> Result<(), AnalysisError> {
    // In runes mode, <svelte:component> is deprecated because components are dynamic by default
    if context.analysis.runes {
        context.emit_warning(warnings::svelte_component_deprecated());
    }

    // `<svelte:component>` must have a `this` attribute — when missing, the
    // parser leaves `component.expression` as a JSON-null expression with no
    // node type. Mirror upstream's `svelte_component_missing_this` instead of
    // silently accepting it. (issue #453, H-046)
    if component.expression.node_type().is_none() {
        return Err(errors::svelte_component_missing_this());
    }

    // svelte:component requires a `this` expression
    // Analyze the expression to track template references
    // This is crucial for legacy state promotion to work correctly
    super::script::walk_expression(&component.expression, context)?;

    // Analyze attributes (mirrors visit_component logic from shared/component.rs)
    for attr in &mut component.attributes {
        match attr {
            Attribute::BindDirective(bind) => {
                // Track component bindings (skip bind:this)
                if bind.name != "this" {
                    context.analysis.uses_component_bindings = true;
                }
                let bind_node = bind.expression.as_node();
                validate_assignment_node(&bind_node, context, true)?;
                // Walk the bind expression to add template references.
                // This is important for legacy mode state promotion - bindings need
                // template references to be promoted from 'normal' to 'state' kind.
                super::script::walk_expression(&bind.expression, context)?;
            }
            Attribute::OnDirective(on) => {
                // Note: Event forwarding (on:foo without handler) sets needs_props
                // in the CLIENT transform phase, not here. See OnDirective.js line 21.
                // Walk event handler expression if present
                if let Some(ref expr) = on.expression {
                    super::script::walk_expression(expr, context)?;
                }
            }
            Attribute::SpreadAttribute(spread) => {
                // Walk the spread expression
                super::script::walk_expression(&spread.expression, context)?;
            }
            Attribute::Attribute(a) => {
                // Check for attribute_quoted on svelte:component
                if is_quoted_single_expression(a) {
                    context.emit_warning(warnings::attribute_quoted());
                }
                // Walk attribute value expressions
                super::attribute::visit_attribute_value_expressions(&mut a.value, context)?;
            }
            Attribute::AttachTag(_) | Attribute::LetDirective(_) => {
                // Allowed on components (matches the shared component validator)
            }
            _ => {
                // `transition:` / `animate:` / `use:` / `class:` / `style:` are
                // not valid on `<svelte:component>` — mirror the shared
                // `validate_component_attributes` path so they raise
                // `component_invalid_directive` instead of being silently
                // accepted. (issue #453, H-047)
                return Err(errors::component_invalid_directive());
            }
        }
    }

    // Set up component context for slot attribute validation
    // svelte:component is a component, so children with slot attributes should be valid
    let was_direct_child = context.is_direct_child_of_component;
    let was_direct_snippet = context.is_direct_child_of_snippet;
    context.is_direct_child_of_component = true;
    context.is_direct_child_of_snippet = false;
    context.component_depth += 1;
    context
        .slot_owner_ancestors
        .push(super::SlotOwnerType::Component);
    context
        .fragment_owner_stack
        .push(super::FragmentOwnerType::Component);

    // Analyze children
    // Clear element_ancestors and parent_element when entering a component boundary.
    let saved_element_ancestors = std::mem::take(&mut context.element_ancestors);
    let saved_block_depth_at_element = std::mem::take(&mut context.block_depth_at_element);
    let saved_parent_element = context.parent_element.take();
    fragment::analyze(&mut component.fragment, context)?;
    context.element_ancestors = saved_element_ancestors;
    context.block_depth_at_element = saved_block_depth_at_element;
    context.parent_element = saved_parent_element;

    // Restore context
    context.fragment_owner_stack.pop();
    context.slot_owner_ancestors.pop();
    context.component_depth -= 1;
    context.is_direct_child_of_component = was_direct_child;
    context.is_direct_child_of_snippet = was_direct_snippet;

    Ok(())
}

/// Check if an attribute has a quoted single-expression value like `class="{foo}"`.
fn is_quoted_single_expression(attr: &AttributeNode) -> bool {
    if let AttributeValue::Sequence(parts) = &attr.value {
        parts.len() == 1 && matches!(&parts[0], AttributeValuePart::ExpressionTag(_))
    } else {
        false
    }
}
