//! SvelteElement visitor.
//!
//! Analyzes <svelte:element> elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SvelteElement.js`.

use super::super::AnalysisError;
use super::super::errors;
use super::VisitorContext;
use super::shared::fragment;
use crate::ast::template::{Attribute, AttributeValue, AttributeValuePart, SvelteDynamicElement};

const NAMESPACE_SVG: &str = "http://www.w3.org/2000/svg";
const NAMESPACE_MATHML: &str = "http://www.w3.org/1998/Math/MathML";

/// Check if an attribute is a text-only attribute (all parts are Text).
fn is_text_attribute(attr: &crate::ast::template::AttributeNode) -> bool {
    match &attr.value {
        AttributeValue::True(_) | AttributeValue::Expression(_) => false,
        AttributeValue::Sequence(parts) => parts
            .iter()
            .all(|p| matches!(p, AttributeValuePart::Text(_))),
    }
}

/// Visit a svelte:element.
pub fn visit<'a, 'b: 'a>(
    element: &mut SvelteDynamicElement<'b>,
    context: &mut VisitorContext<'a>,
) -> Result<(), AnalysisError> {
    // Upstream's `SvelteElement` visitor runs the same `validate_element` as the
    // regular one, so an illegal attribute name or a non-expression `on*` handler
    // is rejected here too.
    super::shared::element::validate_element(&element.attributes, context)?;

    let collect_css = context.analysis.css.has_css;
    let mut css_facts = super::shared::element::CssAttributeFacts::default();

    if collect_css {
        context.analysis.css.has_dynamic_elements = true;
        css_facts =
            super::shared::element::collect_css_attribute_facts(&element.attributes, context);
    }

    let parent_idx = context.current_parent_idx();
    let is_root_child = context.dom_element_stack.is_empty();
    let element_idx = if collect_css {
        let dom_element = super::super::types::CssDomElement {
            tag_name: String::new(),
            classes: css_facts.classes,
            id: css_facts.id,
            static_attributes: css_facts.static_attributes,
            dynamic_attribute_names: css_facts.dynamic_attribute_names,
            has_spread: css_facts.has_spread,
            has_class_directive: css_facts.has_class_directive,
            class_directive_names: css_facts.class_directive_names,
            has_style_directive: css_facts.has_style_directive,
            parent_idx,
            children_idx: Vec::new(),
            is_root_child,
            possible_prev_adjacent: Vec::new(),
            possible_next_adjacent: Vec::new(),
            possible_prev_general: Vec::new(),
            possible_next_general: Vec::new(),
            has_content: !element.fragment.nodes.is_empty(),
            has_opaque_content: false,
            is_dynamic_tag: true,
            snippet_name: context.current_snippet_name(),
            sibling_walk_incomplete: false,
            prev_is_opaque_boundary: false,
            prev_has_opaque_boundary: false,
        };
        let element_idx = context.add_dom_element(dom_element);
        if let Some(parent_idx) = parent_idx
            && parent_idx < context.analysis.css.dom_structure.elements.len()
        {
            context.analysis.css.dom_structure.elements[parent_idx]
                .children_idx
                .push(element_idx);
        }
        element_idx
    } else {
        usize::MAX
    };

    // Check that svelte:element has a 'this' attribute with a value
    // The 'tag' field is populated from the 'this' attribute during parsing
    // If it's null/undefined or empty, the 'this' attribute is missing or has no value
    let has_valid_this = element.tag.node_type().is_some();

    if !has_valid_this {
        return Err(errors::svelte_element_missing_this().at(element.start, element.end));
    }

    // Upstream runs the shared a11y checker from both element visitors; the tag
    // is not statically known, so the rules that need it are skipped inside.
    let a11y_warnings = super::shared::a11y::check_element(
        &super::shared::a11y::A11yElement::dynamic(element),
        &context.a11y_ancestors(),
    );
    for mut warning in a11y_warnings {
        if warning.start.is_none() {
            warning.start = Some(element.start);
        }
        if warning.end.is_none() {
            warning.end = Some(element.end);
        }
        context.emit_warning(warning);
    }

    // Analyze the 'this' expression to track template references
    // This is crucial for legacy state promotion to work correctly.
    //
    // Mirror upstream SvelteElement.js `context.visit(node.tag, { ...state,
    // expression: node.metadata.expression })`: the tag is a reactive template
    // expression, so it is walked with the element's ExpressionMetadata (the
    // same pattern as `expression_tag.rs`). This makes an `await` inside
    // `this={await …}` set has_await and trip the `experimental_async` gate
    // under default options, while keeping the pickled-await detection
    // root-relative (a bare `this={await p}` IS the last evaluated expression
    // and must not get a `$.save(...)` wrap).
    {
        let saved_in_expression_tag = context.in_expression_tag;
        context.in_expression_tag = true;
        let node = element.tag.as_node();
        let result = super::shared::utils::walk_js_expression_node(
            &node,
            context,
            &mut element.metadata.expression,
        );
        context.in_expression_tag = saved_in_expression_tag;
        result?;

        super::await_block::collect_pickled_awaits_node(
            &node,
            &mut context.analysis.pickled_awaits,
            context.parse_arena,
        );
    }

    // Determine SVG/MathML metadata based on xmlns attribute or ancestor context.
    // This follows the official Svelte compiler's SvelteElement.js analysis logic.
    //
    // 1. If the element has a static xmlns attribute, use its value to determine namespace
    // 2. Otherwise, walk ancestors to find the nearest element or component boundary
    let xmlns_attr = element.attributes.iter().find_map(|attr| {
        if let Attribute::Attribute(a) = attr
            && a.name == "xmlns"
            && is_text_attribute(a)
            && let AttributeValue::Sequence(parts) = &a.value
            && let Some(AttributeValuePart::Text(t)) = parts.first()
        {
            return Some(t.data.to_string());
        }
        None
    });

    if let Some(xmlns_value) = xmlns_attr {
        element.metadata.svg = xmlns_value == NAMESPACE_SVG;
        element.metadata.mathml = xmlns_value == NAMESPACE_MATHML;
    } else {
        // Walk element_ancestors (tag names) to determine namespace context.
        // Use element_ancestors instead of context.path to avoid unsafe pointer casts.
        // Walk from innermost to outermost.
        use super::regular_element::is_svg;
        let mut found = false;
        for ancestor_name in context.element_ancestors.iter().rev() {
            if ancestor_name == "foreignObject" {
                element.metadata.svg = false;
                element.metadata.mathml = false;
                found = true;
                break;
            }
            if is_svg(ancestor_name) {
                element.metadata.svg = true;
                element.metadata.mathml = false;
                found = true;
                break;
            }
            if super::regular_element::is_mathml(ancestor_name) {
                element.metadata.svg = false;
                element.metadata.mathml = true;
                found = true;
                break;
            }
        }

        if !found {
            // No SVG/MathML ancestor found, use component namespace defaults
            element.metadata.svg = context.analysis.component_namespace_is_svg;
            element.metadata.mathml = context.analysis.component_namespace_is_mathml;
        }
    }

    for attr in &element.attributes {
        if let Attribute::Attribute(attr_node) = attr {
            super::shared::attribute::record_event_attribute_arrow(context, attr_node);
        }
    }

    for attr in &element.attributes {
        if let Attribute::AnimateDirective(animate) = attr
            && context.each_block_stack.last().is_none()
        {
            return Err(errors::animation_invalid_placement().at(animate.start, animate.end));
        }
        if let Attribute::BindDirective(bind) = attr {
            super::shared::attribute::record_assign_exempt_expression(
                context,
                &bind.expression,
                true,
            );
            super::bind_directive::validate_binding_target(
                bind,
                "svelte:element",
                &element.attributes,
            )?;
        }
    }

    // Set up slot ownership context for slot attribute validation.
    // <svelte:element> can dynamically resolve to any element including custom elements,
    // so children with slot attributes should be allowed (they may be valid at runtime).
    // This matches how <svelte:component> allows slot attributes on its children.
    let was_direct_child = context.is_direct_child_of_component;
    let was_direct_snippet = context.is_direct_child_of_snippet;
    context.is_direct_child_of_component = true;
    context.is_direct_child_of_snippet = false;
    context
        .slot_owner_ancestors
        .push(super::SlotOwnerType::Component);
    context
        .fragment_owner_stack
        .push(super::FragmentOwnerType::SvelteElement);

    if collect_css {
        context.dom_element_stack.push(element_idx);
    }

    // Save and update the SVG/MathML namespace state for child analysis.
    // Child svelte:element nodes will check these fields to determine their namespace.
    let saved_svg = context.analysis.component_namespace_is_svg;
    let saved_mathml = context.analysis.component_namespace_is_mathml;
    context.analysis.component_namespace_is_svg = element.metadata.svg;
    context.analysis.component_namespace_is_mathml = element.metadata.mathml;

    // Analyze attribute expressions to detect needs_context, expression metadata, etc.
    // This is needed because attribute expressions may reference props, stores, etc.
    for attr in &mut element.attributes {
        match attr {
            Attribute::Attribute(attr_node) => {
                super::attribute::visit(attr_node, context)?;
            }
            Attribute::ClassDirective(cd) => {
                super::class_directive::visit(cd, context)?;
            }
            Attribute::StyleDirective(sd) => {
                super::style_directive::visit(sd, context)?;
            }
            Attribute::BindDirective(bd) => {
                super::script::walk_expression(&bd.expression, context)?;
            }
            Attribute::SpreadAttribute(spread) => {
                super::spread_attribute::visit(spread, context)?;
            }
            Attribute::OnDirective(on) => {
                super::on_directive::visit(on, context)?;
            }
            _ => {}
        }
    }

    // Analyze children
    // Clear element_ancestors and parent_element when entering a svelte:element boundary.
    // The official Svelte compiler breaks out of the ancestor loop at SvelteElement nodes.
    let saved_element_ancestors = std::mem::take(&mut context.element_ancestors);
    let saved_block_depth_at_element = std::mem::take(&mut context.block_depth_at_element);
    let saved_parent_element = context.parent_element.take();
    // Enter the template scope the scope builder created for this node, the way
    // the plain-component visitor does. Without it a `{@render}` cannot see a
    // `{#snippet}` declared as its sibling here, so the tag reads as dynamic.
    let saved_scope = context.scope;
    if let Some(&node_scope) = context.analysis.root.template_scope_map.get(&element.start) {
        context.scope = node_scope;
    }
    fragment::analyze(&mut element.fragment, context)?;
    context.scope = saved_scope;
    context.element_ancestors = saved_element_ancestors;
    context.block_depth_at_element = saved_block_depth_at_element;
    context.parent_element = saved_parent_element;

    // Restore namespace state
    context.analysis.component_namespace_is_svg = saved_svg;
    context.analysis.component_namespace_is_mathml = saved_mathml;

    if collect_css {
        context.dom_element_stack.pop();
    }

    // Restore context
    context.fragment_owner_stack.pop();
    context.slot_owner_ancestors.pop();
    context.is_direct_child_of_component = was_direct_child;
    context.is_direct_child_of_snippet = was_direct_snippet;

    Ok(())
}
