//! SvelteComponent visitor.
//!
//! Analyzes <svelte:component> elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SvelteComponent.js`.

use super::super::{AnalysisError, errors, warnings};
use super::VisitorContext;
use super::shared::fragment;
use super::shared::utils::validate_assignment_node;
use crate::ast::template::{Attribute, SvelteComponentElement};

/// Visit a svelte:component.
pub fn visit<'a, 'b: 'a>(
    component: &mut SvelteComponentElement<'b>,
    context: &mut VisitorContext<'a>,
) -> Result<(), AnalysisError> {
    // In runes mode, <svelte:component> is deprecated because components are dynamic by default
    if context.analysis.runes {
        context.emit_warning(
            warnings::svelte_component_deprecated().at(component.start, component.end),
        );
    }

    // `<svelte:component>` must have a `this` attribute — when missing, the
    // parser leaves `component.expression` as a JSON-null expression with no
    // node type. Mirror upstream's `svelte_component_missing_this` instead of
    // silently accepting it. (issue #453, H-046)
    if component.expression.node_type().is_none() {
        // Upstream raises this from the parser with the element's start offset
        // alone, so the range is zero-width rather than the whole element.
        return Err(errors::svelte_component_missing_this().at(component.start, component.start));
    }

    // svelte:component requires a `this` expression
    // Analyze the expression to track template references
    // This is crucial for legacy state promotion to work correctly
    super::script::walk_expression(&component.expression, context)?;

    // Upstream lists `SvelteComponent` only for `path.at(-1)` and for the
    // `SequenceExpression` arm, never for a lone arrow at `path.at(-2)`.
    super::shared::attribute::record_assign_exempt_expression(
        context,
        &component.expression,
        false,
    );
    super::shared::attribute::record_component_assign_exempt(context, &component.attributes, false);

    // Analyze attributes (mirrors visit_component logic from shared/component.rs)
    for attr in &mut component.attributes {
        match attr {
            Attribute::BindDirective(bind) => {
                // Track component bindings (skip bind:this)
                if bind.name != "this" {
                    context.analysis.uses_component_bindings = true;
                }
                // Upstream runs one `BindDirective` visitor for every host, so a
                // `{get, set}` pair takes its own early branch here too.
                if super::bind_directive::is_get_set_pair(bind) {
                    super::bind_directive::validate_get_set_pair(bind, context)?;
                    super::bind_directive::walk_get_set_pair(bind, context)?;
                } else {
                    let bind_node = bind.expression.as_node();
                    validate_assignment_node((bind.start, bind.end), &bind_node, context, true)?;
                    super::bind_directive::validate_bind_value_target(bind, context)?;
                    // Walk the bind expression to add template references.
                    // This is important for legacy mode state promotion - bindings need
                    // template references to be promoted from 'normal' to 'state' kind.
                    super::bind_directive::walk_bind_expression(bind, context)?;
                }
            }
            Attribute::OnDirective(on) => {
                if on.modifiers.len() > 1 || on.modifiers.iter().any(|modifier| modifier != "once")
                {
                    return Err(
                        errors::event_handler_invalid_component_modifier().at(on.start, on.end)
                    );
                }
                // Note: Event forwarding (on:foo without handler) sets needs_props
                // in the CLIENT transform phase, not here. See OnDirective.js line 21.
                // Walk event handler expression if present
                if let Some(ref expr) = on.expression {
                    super::shared::attribute::walk_template_expression(expr, context)?;
                }
            }
            Attribute::SpreadAttribute(spread) => {
                super::shared::attribute::walk_template_expression(&spread.expression, context)?;
            }
            Attribute::Attribute(a) => {
                super::shared::attribute::warn_attribute_quoted(context, a);
                // Walk attribute value expressions
                super::attribute::visit_attribute_value_expressions(&mut a.value, context)?;
            }
            Attribute::AttachTag(attach) => {
                super::shared::attribute::walk_template_expression(&attach.expression, context)?;
            }
            Attribute::LetDirective(_) => {
                // Allowed on components (matches the shared component validator)
            }
            _ => {
                // `transition:` / `animate:` / `use:` / `class:` / `style:` are
                // not valid on `<svelte:component>` — mirror the shared
                // `validate_component_attributes` path so they raise
                // `component_invalid_directive` instead of being silently
                // accepted. (issue #453, H-047)
                let (start, end) = attr.span();
                return Err(errors::component_invalid_directive().at(start, end));
            }
        }
    }

    // Set up component context for slot attribute validation
    // svelte:component is a component, so children with slot attributes should be valid
    let was_direct_child = context.direct_component_parent;
    let was_direct_snippet = context.is_direct_child_of_snippet;
    context.direct_component_parent = super::DirectComponentParent::Component;
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
    // Enter the template scope the scope builder created for this node, the way
    // the plain-component visitor does. Without it a `{@render}` cannot see a
    // `{#snippet}` declared as its sibling here, so the tag reads as dynamic.
    let saved_scope = context.scope;
    if let Some(&node_scope) = context
        .analysis
        .root
        .template_scope_map
        .get(&component.start)
    {
        context.scope = node_scope;
    }
    fragment::analyze(&mut component.fragment, context)?;
    context.scope = saved_scope;
    context.element_ancestors = saved_element_ancestors;
    context.block_depth_at_element = saved_block_depth_at_element;
    context.parent_element = saved_parent_element;

    // Restore context
    context.fragment_owner_stack.pop();
    context.slot_owner_ancestors.pop();
    context.component_depth -= 1;
    context.direct_component_parent = was_direct_child;
    context.is_direct_child_of_snippet = was_direct_snippet;

    Ok(())
}
