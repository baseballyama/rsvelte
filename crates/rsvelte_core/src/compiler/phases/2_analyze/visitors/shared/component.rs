//! Component validation utilities.
//!
//! Functions for validating component usage.
//!
//! Corresponds to Svelte's `2-analyze/visitors/shared/component.js`.

use rustc_hash::FxHashSet;

use super::super::super::AnalysisError;
use super::super::super::errors;
use super::super::VisitorContext;
use super::super::attribute::visit_attribute_value_expressions;
use super::fragment;
use super::utils::{
    validate_assignment_node, validate_attribute_name as validate_attribute_name_colon,
};
use crate::ast::template::{
    Attribute, AttributeNode, AttributeValue, AttributeValuePart, Component,
};

/// Visit a component and perform full analysis.
///
/// This is the main entry point for component analysis, called by the
/// Component visitor. It handles:
/// - Snippet resolution and tracking
/// - Attribute validation
/// - Fragment analysis
///
/// Corresponds to `visit_component(node, context)` in shared/component.js.
pub fn visit_component(
    component: &mut Component,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    use crate::ast::template::TemplateNode;

    // TODO: Set node.metadata.path = [...context.path]
    // This requires adding metadata to Component nodes

    // Check for snippet_shadowing_prop error
    // A snippet inside a Component cannot have the same name as an attribute on that Component
    // This check is done here because the visitor path isn't properly maintained
    // Corresponds to SnippetBlock.js line 42-55
    for node in &component.fragment.nodes {
        if let TemplateNode::SnippetBlock(snippet) = node {
            // Get snippet name
            if let Some(snippet_name) = snippet.expression.identifier_name() {
                // Check if any attribute matches the snippet name
                for attr in &component.attributes {
                    let attr_name = match attr {
                        Attribute::Attribute(a) => Some(a.name.as_str()),
                        Attribute::BindDirective(b) => Some(b.name.as_str()),
                        _ => None,
                    };

                    if let Some(name) = attr_name
                        && name == snippet_name
                    {
                        return Err(errors::snippet_shadowing_prop(snippet_name));
                    }
                }
            }
        }
    }

    // Determine which snippets this component might render. `resolved` is
    // true when we can list those candidates exactly; if false, the official
    // compiler treats every locally-defined snippet as a possible render
    // target, so Phase 3 must not rely on the set being a precise list.
    //
    // We currently only resolve the easy cases — an expression attribute
    // whose value is a literal can never reference a snippet, so it doesn't
    // taint resolution. Identifier / member / call expressions, spreads,
    // and bind directives all leave us with no static knowledge of which
    // snippet the component will receive, so they fall back to "unresolved".
    let mut resolved = true;
    for attr in &component.attributes {
        match attr {
            Attribute::SpreadAttribute(_) | Attribute::BindDirective(_) => {
                resolved = false;
            }
            Attribute::Attribute(a) => {
                if let crate::ast::template::AttributeValue::Expression(expr_tag) = &a.value {
                    let expr_type = expr_tag.expression.node_type().unwrap_or("");
                    if expr_type != "Literal" {
                        // Identifier / member / call etc. — could reference a
                        // snippet binding we can't statically resolve here.
                        resolved = false;
                    }
                }
            }
            _ => {}
        }
    }

    // Even when `resolved` is false, the official compiler still seeds the
    // metadata set with the locally-defined snippets (so the runtime can
    // pick from the right pool). When `resolved` is true, the same seed
    // is the actually-rendered set. We use the SnippetBlock's `start`
    // offset as a stable identity within a single parse.
    component.metadata.snippets.clear();
    for node in &component.fragment.nodes {
        if let TemplateNode::SnippetBlock(snippet) = node {
            component.metadata.snippets.insert(snippet.start as usize);
        }
    }

    // Track this component as a snippet renderer in the analysis so Phase 3
    // can decide whether to emit the resolved-set fast path or the
    // every-local-snippet fallback. The key is encoded with the component's
    // `start` offset (unique within a parse) so multiple components on the
    // same name remain distinct.
    context
        .analysis
        .snippet_renderers
        .insert(format!("Component@{}", component.start), resolved);

    // Mark the subtree as dynamic
    super::super::shared::fragment::mark_subtree_dynamic(&context.path);

    // Validate attributes
    for attr in &component.attributes {
        match attr {
            Attribute::Attribute(attr) => {
                // In runes mode, validate sequence expressions
                use super::attribute::{
                    get_attribute_expression, is_expression_attribute,
                    is_unparenthesized_sequence_expression, validate_attribute,
                };

                if context.analysis.runes {
                    validate_attribute(attr)?;

                    if is_expression_attribute(attr)
                        && let Some(expression_tag) = get_attribute_expression(attr)
                        && is_unparenthesized_sequence_expression(
                            expression_tag,
                            &context.analysis.source,
                        )
                    {
                        return Err(errors::attribute_invalid_sequence_expression());
                    }
                }
                // Check for attribute_quoted: quoted single-expression attribute on component
                if is_quoted_single_expression(attr) {
                    context.emit_warning(super::super::super::warnings::attribute_quoted());
                }
                // Check for illegal colon in attribute name
                if let Err(warning) = validate_attribute_name_colon(&attr.name) {
                    context.emit_warning(warning);
                }
                // TODO: if (attribute.name === 'slot') {
                //     validate_slot_attribute(context, attribute, true);
                // }
            }
            Attribute::BindDirective(bind) => {
                // Track component bindings
                if bind.name != "this" {
                    context.analysis.uses_component_bindings = true;
                }
                // Getter/setter bindings (`bind:value={get, set}`) skip the
                // assignment + identifier validation, mirroring upstream's
                // early SequenceExpression return in BindDirective.js.
                if bind.expression.node_type() != Some("SequenceExpression") {
                    // Validate the binding expression (checks for const/import bindings)
                    let bind_node = bind.expression.as_node();
                    validate_assignment_node(&bind_node, context, true)?;
                    // `bind:x={y}` must target state or props (bind_invalid_value).
                    // Upstream's BindDirective visitor runs this for component
                    // bindings too (BindDirective.js L193-207).
                    super::super::bind_directive::validate_bind_value_for_component(bind, context)?;
                }
            }
            Attribute::OnDirective(on) => {
                // Validate event handler modifiers
                // Only 'once' modifier is allowed on component events
                let has_invalid_modifiers = on.modifiers.iter().any(|m| m.as_str() != "once");
                if has_invalid_modifiers {
                    return Err(errors::event_handler_invalid_component_modifier());
                }

                // Note: Event forwarding (on:foo without handler) sets needs_props
                // in the CLIENT transform phase, not here. See OnDirective.js line 21.
            }
            Attribute::AttachTag(_) => {
                // TODO: Validate attach tag
                // disallow_unparenthesized_sequences(attribute.expression, context.state.analysis.source)
            }
            Attribute::LetDirective(_) | Attribute::SpreadAttribute(_) => {
                // These are allowed on components
            }
            _ => {
                // All other directive types are invalid on components
                // (TransitionDirective, AnimateDirective, UseDirective, ClassDirective, StyleDirective)
                return Err(errors::component_invalid_directive());
            }
        }
    }

    // Validate slot attributes for duplicate names
    validate_slot_attributes(component)?;

    // Visit attribute expressions to trigger needs_context detection
    // This corresponds to the context.visit(attribute, ...) calls in the official Svelte compiler.
    // The official Svelte walks through all attributes using zimmerframe which triggers
    // MemberExpression and CallExpression visitors on the expressions inside attributes.
    for attr in &mut component.attributes {
        match attr {
            Attribute::Attribute(a) => {
                // Visit expressions in the attribute value
                visit_attribute_value_expressions(&mut a.value, context)?;
            }
            Attribute::BindDirective(bind) => {
                // Visit the bind expression
                // Set in_bind_this flag to prevent false non_reactive_update warnings
                let prev_in_bind_this = context.in_bind_this;
                if bind.name == "this" {
                    context.in_bind_this = true;
                }
                super::super::script::walk_expression(&bind.expression, context)?;
                context.in_bind_this = prev_in_bind_this;
            }
            Attribute::OnDirective(on) => {
                // Visit the event handler expression if present
                if let Some(ref expr) = on.expression {
                    super::super::script::walk_expression(expr, context)?;
                }
            }
            Attribute::SpreadAttribute(spread) => {
                // Visit the spread expression
                super::super::script::walk_expression(&spread.expression, context)?;
            }
            Attribute::AttachTag(attach) => {
                // Visit the attach expression
                super::super::script::walk_expression(&attach.expression, context)?;
            }
            Attribute::LetDirective(_) => {
                // Let directives don't have expressions to visit for needs_context
            }
            _ => {
                // Other directives (StyleDirective, ClassDirective, etc.) are invalid
                // on components and were already handled above
            }
        }
    }

    // Analyze the component's children
    // TODO: Implement proper slot handling
    // The full implementation would:
    // 1. Group children by slot name
    // 2. Create appropriate scopes for each slot
    // 3. Visit each slot's content with the correct scope
    //
    // For now, just visit the fragment normally
    // Set is_direct_child_of_component for svelte:fragment validation
    let was_direct_child = context.is_direct_child_of_component;
    context.is_direct_child_of_component = true;
    // Track component depth for slot attribute validation
    context.component_depth += 1;
    // Track that this is a component for slot owner resolution
    context
        .slot_owner_ancestors
        .push(super::super::SlotOwnerType::Component);
    // Push fragment owner type for const_tag placement validation
    context
        .fragment_owner_stack
        .push(super::super::FragmentOwnerType::Component);
    // Set context.scope to the scope created by scope_builder for this component.
    // This ensures that Let directive bindings declared in scope_builder are visible
    // when analyzing children (e.g., {@const} tags that reference let: variables).
    let scope_before_component = context.scope;
    if let Some(&comp_scope) = context
        .analysis
        .root
        .template_scope_map
        .get(&component.start)
    {
        context.scope = comp_scope;
    }
    // Clear element_ancestors and parent_element when entering a component boundary.
    // The official Svelte compiler breaks out of the ancestor loop when it hits a
    // Component, SvelteComponent, SvelteElement, SvelteSelf, or SnippetBlock.
    // This ensures that node_invalid_placement checks don't cross component boundaries.
    let saved_element_ancestors = std::mem::take(&mut context.element_ancestors);
    let saved_block_depth_at_element = std::mem::take(&mut context.block_depth_at_element);
    let saved_parent_element = context.parent_element.take();
    fragment::analyze(&mut component.fragment, context)?;
    context.element_ancestors = saved_element_ancestors;
    context.block_depth_at_element = saved_block_depth_at_element;
    context.parent_element = saved_parent_element;
    context.scope = scope_before_component;
    context.fragment_owner_stack.pop();
    context.slot_owner_ancestors.pop();
    context.component_depth -= 1;
    context.is_direct_child_of_component = was_direct_child;

    Ok(())
}

/// Validate that slot attributes are not duplicated.
///
/// This checks for:
/// 1. Duplicate slot names in component children
/// 2. Both explicit slot="default" and implicit default content
/// 3. snippet_conflict: {#snippet children()} used alongside other content
fn validate_slot_attributes(component: &Component) -> Result<(), AnalysisError> {
    use crate::ast::template::TemplateNode;

    let mut seen_slots: FxHashSet<String> = FxHashSet::default();
    let mut has_explicit_default = false;
    let mut has_implicit_default = false;
    let mut has_children_snippet = false;
    let mut has_other_content = false;

    for node in &component.fragment.nodes {
        let slot_name = get_slot_name(node);

        if let Some(ref name) = slot_name {
            if name == "default" {
                has_explicit_default = true;
            }

            if seen_slots.contains(name) {
                return Err(errors::slot_attribute_duplicate(name, &component.name));
            }
            seen_slots.insert(name.clone());
        } else {
            // Check if this is a {#snippet children()} block
            if let TemplateNode::SnippetBlock(snippet) = node
                && snippet.expression.is_identifier("children")
            {
                has_children_snippet = true;
            }

            // Check if this is implicit default slot content
            // (not a whitespace-only Text node and not a snippet/const/debug tag)
            match node {
                TemplateNode::Text(text) => {
                    if !text.data.trim().is_empty() {
                        has_implicit_default = true;
                        has_other_content = true;
                    }
                }
                TemplateNode::SnippetBlock(_)
                | TemplateNode::ConstTag(_)
                | TemplateNode::DebugTag(_)
                | TemplateNode::Comment(_) => {
                    // These don't count as implicit default content
                }
                _ => {
                    has_implicit_default = true;
                    has_other_content = true;
                }
            }
        }
    }

    // Check for snippet_conflict: cannot have both {#snippet children()} and other content
    // Corresponds to SnippetBlock.js lines 59-73
    if has_children_snippet && has_other_content {
        return Err(errors::snippet_conflict());
    }

    // Check for slot_default_duplicate error
    if has_explicit_default && has_implicit_default {
        return Err(errors::slot_default_duplicate());
    }

    Ok(())
}

/// Get the slot name from a node's slot attribute.
fn get_slot_name(node: &crate::ast::template::TemplateNode) -> Option<String> {
    use crate::ast::template::{Attribute, AttributeValue, AttributeValuePart, TemplateNode};

    let attrs = match node {
        TemplateNode::RegularElement(el) => Some(&el.attributes),
        TemplateNode::SvelteFragment(frag) => Some(&frag.attributes),
        TemplateNode::Component(comp) => Some(&comp.attributes),
        TemplateNode::SvelteComponent(comp) => Some(&comp.attributes),
        TemplateNode::SvelteSelf(self_) => Some(&self_.attributes),
        _ => None,
    };

    if let Some(attributes) = attrs {
        for attr in attributes {
            if let Attribute::Attribute(a) = attr
                && a.name == "slot"
            {
                // Extract the slot name from the value
                match &a.value {
                    AttributeValue::Sequence(parts) if parts.len() == 1 => {
                        if let AttributeValuePart::Text(text) = &parts[0] {
                            return Some(text.data.to_string());
                        }
                    }
                    _ => {}
                }
            }
        }
    }

    None
}

/// Validate a component and its attributes.
pub fn validate_component(
    component: &Component,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // Check for valid component name (should start with uppercase or contain a dot)
    let name = &component.name;
    let first_char = name.chars().next().unwrap_or('a');

    if !first_char.is_uppercase() && !name.contains('.') && !name.contains(':') {
        return Err(AnalysisError::Validation(format!(
            "Component name '{}' should start with an uppercase letter",
            name
        )));
    }

    // Check for duplicate attributes
    let mut seen_names: FxHashSet<String> = FxHashSet::default();

    for attr in &component.attributes {
        // Only check for duplicates on:
        // - Attribute and BindDirective (treated the same)
        // - ClassDirective
        // - StyleDirective
        // OnDirective can have multiple handlers for the same event
        let attr_name = match attr {
            Attribute::Attribute(a) => Some(format!("Attribute{}", a.name)),
            Attribute::BindDirective(b) => Some(format!("Attribute{}", b.name)), // bind:x and x are duplicates
            Attribute::ClassDirective(c) => Some(format!("class:{}", c.name)),
            Attribute::StyleDirective(s) => Some(format!("style:{}", s.name)),
            _ => None, // Other directives can have duplicates
        };

        if let Some(name) = attr_name {
            if seen_names.contains(&name) {
                return Err(AnalysisError::validation(
                    "attribute_duplicate",
                    "Attributes need to be unique",
                ));
            }
            seen_names.insert(name);
        }
    }

    // Track component bindings (excluding bind:this which doesn't need the settling loop)
    let has_bindings = component
        .attributes
        .iter()
        .any(|attr| matches!(attr, Attribute::BindDirective(bind) if bind.name != "this"));

    if has_bindings {
        context.analysis.uses_component_bindings = true;
    }

    Ok(())
}

/// Check if an attribute has a quoted single-expression value like `class="{foo}"`.
/// This corresponds to the check in shared/attribute.js:
/// `Array.isArray(value) && value.length === 1 && value[0].type === 'ExpressionTag'`
fn is_quoted_single_expression(attr: &AttributeNode) -> bool {
    if let AttributeValue::Sequence(parts) = &attr.value {
        parts.len() == 1 && matches!(&parts[0], AttributeValuePart::ExpressionTag(_))
    } else {
        false
    }
}
