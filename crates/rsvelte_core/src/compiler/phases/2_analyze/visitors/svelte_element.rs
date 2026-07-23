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
use rustc_hash::FxHashSet;

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
    // Mark that we have dynamic elements (can't safely prune type selectors)
    context.analysis.css.has_dynamic_elements = true;

    // Extract class names and ID from svelte:element attributes for CSS selector detection.
    // Since svelte:element can resolve to any element, we still need to know which classes
    // are used so the CSS pruner can keep the right selectors.
    let mut element_classes = rustc_hash::FxHashSet::default();
    let mut element_id = None;

    for attr in &element.attributes {
        match attr {
            Attribute::Attribute(attr_node) if attr_node.name == "class" => {
                match &attr_node.value {
                    AttributeValue::Sequence(parts) => {
                        for part in parts {
                            match part {
                                AttributeValuePart::Text(text) => {
                                    for class_name in text.data.split_whitespace() {
                                        context
                                            .analysis
                                            .css
                                            .used_classes
                                            .insert(class_name.to_string());
                                        element_classes.insert(class_name.to_string());
                                    }
                                }
                                AttributeValuePart::ExpressionTag(_) => {
                                    context.analysis.css.has_dynamic_classes = true;
                                }
                            }
                        }
                    }
                    AttributeValue::Expression(_) => {
                        context.analysis.css.has_dynamic_classes = true;
                    }
                    _ => {}
                }
            }
            Attribute::Attribute(attr_node) if attr_node.name == "id" => match &attr_node.value {
                AttributeValue::Sequence(parts) => {
                    let has_dynamic_part = parts
                        .iter()
                        .any(|p| matches!(p, AttributeValuePart::ExpressionTag(_)));
                    if has_dynamic_part {
                        context.analysis.css.has_dynamic_ids = true;
                    } else if parts.len() == 1
                        && let Some(AttributeValuePart::Text(text)) = parts.first()
                    {
                        element_id = Some(text.data.to_string());
                    }
                }
                AttributeValue::Expression(_) => {
                    context.analysis.css.has_dynamic_ids = true;
                }
                _ => {}
            },
            Attribute::ClassDirective(cd) => {
                context
                    .analysis
                    .css
                    .used_classes
                    .insert(cd.name.to_string());
                element_classes.insert(cd.name.to_string());
            }
            _ => {}
        }
    }

    // Create DOM element for CSS sibling combinator detection
    let parent_idx = context.current_parent_idx();
    let is_root_child = context.dom_element_stack.is_empty();
    let dom_element = super::super::types::CssDomElement {
        tag_name: String::new(), // Dynamic tag, will use is_dynamic_tag
        classes: element_classes,
        id: element_id,
        static_attributes: Vec::new(), // Dynamic element, no static attributes
        dynamic_attribute_names: FxHashSet::default(),
        has_spread: false,
        has_class_directive: false,
        class_directive_names: FxHashSet::default(),
        has_style_directive: false,
        parent_idx,
        children_idx: Vec::new(),
        is_root_child,
        possible_prev_adjacent: Vec::new(),
        possible_next_adjacent: Vec::new(),
        possible_prev_general: Vec::new(),
        possible_next_general: Vec::new(),
        has_content: !element.fragment.nodes.is_empty(),
        has_opaque_content: false, // Dynamic element, conservatively handled via is_dynamic_tag
        is_dynamic_tag: true,
        in_snippet: context
            .fragment_owner_stack
            .iter()
            .any(|o| matches!(o, super::FragmentOwnerType::SnippetBlock(..))),
        prev_is_opaque_boundary: false,
        prev_has_opaque_boundary: false,
    };

    let element_idx = context.add_dom_element(dom_element);

    // Update parent's children list
    if let Some(parent_idx) = parent_idx
        && parent_idx < context.analysis.css.dom_structure.elements.len()
    {
        context.analysis.css.dom_structure.elements[parent_idx]
            .children_idx
            .push(element_idx);
    }

    // Check that svelte:element has a 'this' attribute with a value
    // The 'tag' field is populated from the 'this' attribute during parsing
    // If it's null/undefined or empty, the 'this' attribute is missing or has no value
    let has_valid_this = element.tag.node_type().is_some();

    if !has_valid_this {
        return Err(errors::svelte_element_missing_this());
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

    // Check for invalid bindings on svelte:element
    // bind:value, bind:files, bind:group can only be used with specific elements
    for attr in &element.attributes {
        if let Attribute::BindDirective(bind) = attr {
            let name = bind.name.as_str();
            match name {
                "value" => {
                    return Err(AnalysisError::validation(
                        "bind_invalid_target",
                        "`bind:value` can only be used with `<input>`, `<textarea>`, `<select>`",
                    ));
                }
                "files" => {
                    return Err(AnalysisError::validation(
                        "bind_invalid_target",
                        "`bind:files` can only be used with `<input type=\"file\">`",
                    ));
                }
                "group" => {
                    return Err(AnalysisError::validation(
                        "bind_invalid_target",
                        "`bind:group` can only be used with `<input type=\"checkbox\">` or `<input type=\"radio\">`",
                    ));
                }
                "checked" => {
                    return Err(AnalysisError::validation(
                        "bind_invalid_target",
                        "`bind:checked` can only be used with `<input type=\"checkbox\">` or `<input type=\"radio\">`",
                    ));
                }
                _ => {}
            }
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

    // Push this element index to DOM element stack for tracking children
    context.dom_element_stack.push(element_idx);

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
                if let Some(ref expr) = on.expression {
                    super::script::walk_expression(expr, context)?;
                }
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
    fragment::analyze(&mut element.fragment, context)?;
    context.element_ancestors = saved_element_ancestors;
    context.block_depth_at_element = saved_block_depth_at_element;
    context.parent_element = saved_parent_element;

    // Restore namespace state
    context.analysis.component_namespace_is_svg = saved_svg;
    context.analysis.component_namespace_is_mathml = saved_mathml;

    // Pop this element from DOM element stack
    context.dom_element_stack.pop();

    // Restore context
    context.fragment_owner_stack.pop();
    context.slot_owner_ancestors.pop();
    context.is_direct_child_of_component = was_direct_child;
    context.is_direct_child_of_snippet = was_direct_snippet;

    Ok(())
}
