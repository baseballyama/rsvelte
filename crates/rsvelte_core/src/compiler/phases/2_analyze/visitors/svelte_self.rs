//! SvelteSelf visitor.
//!
//! Analyzes <svelte:self> elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SvelteSelf.js`.

use super::super::AnalysisError;
use super::super::errors;
use super::super::warnings;
use super::VisitorContext;
use super::shared::fragment;
use super::shared::special_element::validate_special_element_placement;
use super::shared::utils::validate_assignment_node;
use crate::ast::template::{Attribute, SvelteElement};

/// Visit a svelte:self.
pub fn visit<'a, 'b: 'a>(
    self_: &mut SvelteElement<'b>,
    context: &mut VisitorContext<'a>,
) -> Result<(), AnalysisError> {
    // Validate placement
    validate_special_element_placement("svelte:self", (self_.start, self_.end), context)?;

    // `<svelte:self>` is the supported spelling in legacy mode; only runes
    // components have self-imports to be deprecated in favour of.
    if context.analysis.runes {
        // The identifier and the path are independent: the identifier is the
        // component name, the path must stay the real file so the suggestion
        // resolves on a case-sensitive filesystem.
        let filename = &context.analysis.location_filename;
        let (name, basename) = if filename == "(unknown)" {
            ("Self", "Self.svelte")
        } else {
            (
                context.analysis.name.as_str(),
                filename.rsplit(['/', '\\']).next().unwrap_or(filename),
            )
        };
        context.emit_warning(
            warnings::svelte_self_deprecated(name, basename).at(self_.start, self_.end),
        );
    }

    // Upstream delegates to `visit_component`, including its directive checks.
    for attr in &self_.attributes {
        match attr {
            Attribute::BindDirective(bind) => {
                if super::bind_directive::is_get_set_pair(bind) {
                    super::bind_directive::validate_get_set_pair(bind, context)?;
                } else {
                    validate_assignment_node(
                        (bind.start, bind.end),
                        &bind.expression.as_node(),
                        context,
                        true,
                    )?;
                    super::bind_directive::validate_bind_value_target(bind, context)?;
                }
            }
            Attribute::OnDirective(on) => {
                if on.modifiers.len() > 1
                    || on
                        .modifiers
                        .iter()
                        .any(|modifier| modifier.as_str() != "once")
                {
                    return Err(
                        errors::event_handler_invalid_component_modifier().at(on.start, on.end)
                    );
                }
            }
            Attribute::Attribute(_)
            | Attribute::AttachTag(_)
            | Attribute::LetDirective(_)
            | Attribute::SpreadAttribute(_) => {}
            _ => {
                let (start, end) = attr.span();
                return Err(errors::component_invalid_directive().at(start, end));
            }
        }
    }

    // Analyze attributes — upstream's SvelteSelf.js delegates to the shared
    // `visit_component(node, context)`, which visits every attribute (and
    // the expressions inside it). Walking the expressions here is what flags
    // `uses_props` / `needs_context` for e.g.
    // `<svelte:self count={$$props.count} />`.
    for attr in &mut self_.attributes {
        match attr {
            Attribute::Attribute(a) => {
                super::shared::attribute::warn_attribute_quoted(context, a);
                // Walk attribute value expressions
                super::attribute::visit_attribute_value_expressions(&mut a.value, context)?;
            }
            Attribute::BindDirective(bind) => {
                // Track component bindings (skip bind:this)
                if bind.name != "this" {
                    context.analysis.uses_component_bindings = true;
                }
                // This host's `bind:` never reaches `bind_directive::visit`, so the
                // `non_reactive_update` rule for `bind:this` — only a reference under an
                // `{#if}` / `{#each}` / `{#await}` / `{#key}` needs state — is repeated here.
                let prev_in_bind_this = context.in_bind_this;
                if bind.name == "this" {
                    context.in_bind_this = true;
                    if context.bind_this_block_depth > 0
                        && let Ok(name) = super::bind_directive::bind_target_name(bind, context)
                        && let Some(idx) = context.analysis.root.get_binding(&name, context.scope)
                    {
                        context.analysis.root.bindings[idx].has_direct_template_read = true;
                    }
                }
                let result = if super::bind_directive::is_get_set_pair(bind) {
                    super::bind_directive::walk_get_set_pair(bind, context)
                } else {
                    super::bind_directive::walk_bind_expression(bind, context)
                };
                context.in_bind_this = prev_in_bind_this;
                result?;
            }
            Attribute::OnDirective(on) => {
                // Walk event handler expression if present. Event forwarding
                // (on:foo without handler) sets needs_props in the CLIENT
                // transform phase, not here. See OnDirective.js line 21.
                if let Some(ref expr) = on.expression {
                    super::script::walk_expression(expr, context)?;
                }
            }
            Attribute::SpreadAttribute(spread) => {
                super::spread_attribute::visit(spread, context, false)?;
            }
            Attribute::AttachTag(attach) => {
                super::attach_tag::visit(attach, context)?;
            }
            other => {
                super::shared::attribute::walk_remaining_attribute_expressions(other, context)?;
            }
        }
    }

    // Upstream reaches this node through `visit_component`, so a child carrying
    // `slot="…"` has a component owner here exactly as it does under
    // `<svelte:component>`; its `<svelte:fragment>` rule does not widen, so
    // only the slot half is set.
    let was_direct_child = context.direct_component_parent;
    let was_direct_snippet = context.is_direct_child_of_snippet;
    context.direct_component_parent = super::DirectComponentParent::SlotOwnerOnly;
    context.is_direct_child_of_snippet = false;
    context.component_depth += 1;
    context
        .slot_owner_ancestors
        .push(super::SlotOwnerType::Component);

    // Analyze children
    // Enter the template scope the scope builder created for this node, the way
    // the plain-component visitor does. Without it a `{@render}` cannot see a
    // `{#snippet}` declared as its sibling here, so the tag reads as dynamic.
    let saved_element_ancestors = std::mem::take(&mut context.element_ancestors);
    let saved_block_depth_at_element = std::mem::take(&mut context.block_depth_at_element);
    let saved_parent_element = context.parent_element.take();
    let saved_scope = context.scope;
    if let Some(&node_scope) = context.analysis.root.template_scope_map.get(&self_.start) {
        context.scope = node_scope;
    }
    context
        .fragment_owner_stack
        .push(super::FragmentOwnerType::SvelteSelf);
    let result = fragment::analyze(&mut self_.fragment, context);
    context.fragment_owner_stack.pop();
    context.scope = saved_scope;
    context.element_ancestors = saved_element_ancestors;
    context.block_depth_at_element = saved_block_depth_at_element;
    context.parent_element = saved_parent_element;
    context.slot_owner_ancestors.pop();
    context.component_depth -= 1;
    context.direct_component_parent = was_direct_child;
    context.is_direct_child_of_snippet = was_direct_snippet;
    result?;

    Ok(())
}
