//! RegularElement visitor for client-side transformation.
//!
//! Corresponds to `RegularElement.js` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/RegularElement.js`.
//!
//! This visitor handles regular HTML elements like `<div>`, `<span>`, etc.

// Allow dead code for TODO event handler stubs
#![allow(dead_code)]

use crate::ast::template::{
    Attribute, AttributeNode, AttributeValue, BindDirective, Fragment, OnDirective,
    RegularElement as RegularElementNode, TemplateNode, TransitionDirective, UseDirective,
};
use crate::compiler::phases::phase3_transform::client::transform_template::Template;
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::client::visitors::attribute::{
    is_event_attribute, visit_event_attribute,
};
use crate::compiler::phases::phase3_transform::client::visitors::bind_directive::bind_directive;
use crate::compiler::phases::phase3_transform::client::visitors::shared::element::{
    build_attribute_effect, build_attribute_value, build_set_class_call, build_set_style_call,
};
use crate::compiler::phases::phase3_transform::client::visitors::shared::fragment::{
    TextOrExpr, process_children,
};
use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::{
    apply_transforms_to_expression, build_template_chunk, expression_has_reactive_state,
};
use crate::compiler::phases::phase3_transform::client::visitors::transition_directive::transition_directive;
use crate::compiler::phases::phase3_transform::client::visitors::use_directive::use_directive;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::{JsExpr, JsStatement};
use crate::compiler::phases::phase3_transform::utils::clean_nodes;
// Note: can_delegate_event and is_capture_event are used in attribute.rs for event delegation
use rustc_hash::FxHashMap;

/// Visit a regular element node.
///
/// Corresponds to `RegularElement()` function in RegularElement.js.
///
/// **Important ordering of statements:**
/// Following the JS implementation, we use separate vectors for element-level
/// directives (element_state) vs child processing (added directly to context.state).
/// The final order is:
/// 1. Child processing statements ($.child, $.sibling, $.reset, etc.)
/// 2. Element-level directive statements ($.event for on:, $.transition, etc.)
///
/// This ensures that child element navigation happens before actions on the parent.
pub fn visit_regular_element(
    node: &RegularElementNode,
    context: &mut ComponentContext,
) -> TransformResult {
    // Push element to template
    context
        .state
        .template
        .push_element(node.name.to_string(), node.start);

    // Handle <noscript> - it's skipped entirely
    if node.name == "noscript" {
        context.state.template.pop_element();
        return TransformResult::None;
    }

    let is_custom_element = is_custom_element_node(node);

    // Track needs_import_node for custom elements and video
    if node.name == "video" || is_custom_element {
        context.state.template.needs_import_node = true;
    }

    // Track script tags
    if node.name == "script" {
        context.state.template.contains_script_tag = true;
    }

    // Categorize attributes - pre-allocate based on total attribute count
    let attr_count = node.attributes.len();
    let mut attributes = Vec::with_capacity(attr_count);
    let mut class_directives = Vec::with_capacity(4);
    let mut style_directives = Vec::with_capacity(4);
    let mut on_directives: Vec<OnDirective> = Vec::with_capacity(4);
    let mut transition_directives: Vec<TransitionDirective> = Vec::with_capacity(2);
    let mut use_directives: Vec<UseDirective> = Vec::with_capacity(2);
    let mut bindings: FxHashMap<String, BindDirective> = FxHashMap::default();
    let has_spread = node
        .attributes
        .iter()
        .any(|attr| matches!(attr, Attribute::SpreadAttribute(_)));
    let has_use = node
        .attributes
        .iter()
        .any(|attr| matches!(attr, Attribute::UseDirective(_)));

    for attribute in &node.attributes {
        match attribute {
            Attribute::Attribute(attr) => {
                // `is` attributes need to be part of the template, otherwise they break
                // See: svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/RegularElement.js
                if attr.name == "is"
                    && context.state.metadata.namespace == "html"
                    && is_text_attribute(attr)
                    && let AttributeValue::Sequence(parts) = &attr.value
                    && let Some(crate::ast::template::AttributeValuePart::Text(text)) =
                        parts.first()
                {
                    context
                        .state
                        .template
                        .set_prop("is".to_string(), Some(text.data.to_string()));
                    continue;
                }

                // All attributes (including event attributes like onclick={...}) go into attributes
                // When has_spread is true, they're processed by build_attribute_effect
                // When has_spread is false, event attributes are handled via visit_event_attribute in the loop
                attributes.push(attribute.clone());
            }
            Attribute::ClassDirective(dir) => {
                class_directives.push(dir.clone());
            }
            Attribute::StyleDirective(dir) => {
                style_directives.push(dir.clone());
            }
            Attribute::OnDirective(dir) => {
                on_directives.push(dir.clone());
            }
            Attribute::TransitionDirective(dir) => {
                transition_directives.push(dir.clone());
            }
            Attribute::BindDirective(dir) => {
                bindings.insert(dir.name.to_string(), dir.clone());
            }
            Attribute::SpreadAttribute(_) => {
                attributes.push(attribute.clone());
            }
            Attribute::UseDirective(dir) => {
                use_directives.push(dir.clone());
            }
            _ => {}
        }
    }

    // Check if value attribute needs special handling (option, select, or bindings)
    let needs_special_value_handling = node.name == "option"
        || node.name == "select"
        || bindings.contains_key("group")
        || bindings.contains_key("checked");

    // Create separate vectors for element-level state (directives that apply to this element)
    // Following JS implementation: element_state = { ...context.state, init: [], after_update: [] }
    // These will be merged AFTER child processing to ensure correct statement order.
    let mut element_state_init: Vec<JsStatement> = Vec::with_capacity(8);
    let mut element_state_after_update: Vec<JsStatement> = Vec::with_capacity(4);

    // Process other_directives (OnDirective, TransitionDirective) into element_state
    // This matches JS: for (const attribute of other_directives) { ... element_state.init/after_update }
    for on_directive in &on_directives {
        if let TransformResult::Expression(event_call) = context.visit_on_directive(on_directive) {
            if has_use {
                // If there's a use: directive, wrap in $.effect
                element_state_init.push(b::stmt(b::call(
                    b::member_path("$.effect"),
                    vec![b::thunk(event_call)],
                )));
            } else {
                element_state_after_update.push(b::stmt(event_call));
            }
        }
    }

    // Process transition directives into element_state
    for trans_directive in &transition_directives {
        // Store current init length to capture any statements added by transition_directive
        let init_before = context.state.init.len();
        let after_update_before = context.state.after_update.len();

        transition_directive(trans_directive, context);

        // Move any statements added to context.state to element_state instead
        while context.state.init.len() > init_before {
            if let Some(stmt) = context.state.init.pop() {
                element_state_init.insert(0, stmt);
            }
        }
        while context.state.after_update.len() > after_update_before {
            if let Some(stmt) = context.state.after_update.pop() {
                element_state_after_update.insert(0, stmt);
            }
        }
    }

    // Process bind directives into element_state
    let parent_node = TemplateNode::RegularElement(node.clone());
    for bind_dir in bindings.values() {
        // Store current init length to capture any statements added by bind_directive
        let init_before = context.state.init.len();
        let after_update_before = context.state.after_update.len();

        bind_directive(bind_dir, context, Some(&parent_node));

        // Move any statements added to context.state to element_state instead
        while context.state.init.len() > init_before {
            if let Some(stmt) = context.state.init.pop() {
                element_state_init.insert(0, stmt);
            }
        }
        while context.state.after_update.len() > after_update_before {
            if let Some(stmt) = context.state.after_update.pop() {
                element_state_after_update.insert(0, stmt);
            }
        }
    }

    // Process use directives into element_state
    // According to the official Svelte implementation, actions need to run after
    // attribute updates in order with bindings/events
    for use_dir in &use_directives {
        let stmt = use_directive(use_dir, context);
        element_state_init.push(stmt);
    }

    // For input elements with bind:value, bind:checked, or bind:group,
    // add $.remove_input_defaults() call
    if node.name == "input" && !has_spread {
        let has_value_binding = bindings.contains_key("value")
            || bindings.contains_key("checked")
            || bindings.contains_key("group");

        if has_value_binding {
            context.state.init.push(b::stmt(b::call(
                b::member_path("$.remove_input_defaults"),
                vec![context.state.node.clone()],
            )));
        }
    }

    // Process attributes (excluding directives)
    if has_spread {
        // Use build_attribute_effect for spread attributes
        // This combines all attributes (including event handlers) into a single $.attribute_effect call
        let node_id = extract_node_id(&context.state.node);
        let node_expr = b::id(&node_id);
        let css_hash = context.state.analysis.css.hash.clone();

        build_attribute_effect(
            &attributes,
            &class_directives,
            &style_directives,
            context,
            node_expr,
            &css_hash,
        );
    } else {
        // Process attributes in source order (like official JS implementation)
        // Event attributes are handled by visit_event_attribute and continue
        for attribute in &attributes {
            if let Attribute::Attribute(attr) = attribute {
                // Handle event attributes (onclick={...}) first, then continue
                if is_event_attribute(attribute).is_some() {
                    visit_event_attribute(attr, context);
                    continue;
                }

                let name = get_attribute_name(node, attr);

                // Skip value attribute if it needs special handling (for option/select)
                if needs_special_value_handling && name == "value" {
                    continue;
                }

                // Static text attributes can go in the template
                let is_true_value = matches!(&attr.value, AttributeValue::True(true));
                if !is_custom_element
                    && !cannot_be_set_statically(&attr.name)
                    && (is_true_value || is_text_attribute(attr))
                    && (name != "class" || class_directives.is_empty())
                    && (name != "style" || style_directives.is_empty())
                {
                    let mut value = if is_text_attribute(attr) {
                        if let AttributeValue::Sequence(parts) = &attr.value {
                            if let crate::ast::template::AttributeValuePart::Text(text) = &parts[0]
                            {
                                text.data.to_string()
                            } else {
                                String::new()
                            }
                        } else {
                            String::new()
                        }
                    } else {
                        String::new()
                    };

                    // Add scoped class if needed
                    if name == "class"
                        && context.state.analysis.css.has_css
                        && !context.state.analysis.css.hash.is_empty()
                    {
                        let hash = &context.state.analysis.css.hash;
                        if value.is_empty() {
                            value = hash.clone();
                        } else {
                            value.push(' ');
                            value.push_str(hash);
                        }
                    }

                    if name != "class" || !value.is_empty() {
                        let prop_value = if is_boolean_attribute(&name) && is_true_value {
                            None
                        } else if is_true_value {
                            Some(String::new())
                        } else {
                            Some(value)
                        };

                        context
                            .state
                            .template
                            .set_prop(attr.name.to_string(), prop_value);
                    }
                } else if name == "autofocus" {
                    // Special case: autofocus needs $.autofocus() call
                    let result =
                        build_attribute_value(&attr.value, context, |expr, _metadata| expr);
                    let node_id = extract_node_id(&context.state.node);
                    context.state.init.push(b::stmt(b::call(
                        b::member_path("$.autofocus"),
                        vec![b::id(&node_id), result.value],
                    )));
                } else if is_custom_element {
                    // Custom element: use $.set_custom_element_data
                    let result =
                        build_attribute_value(&attr.value, context, |expr, _metadata| expr);
                    let node_id = extract_node_id(&context.state.node);
                    let call = b::call(
                        b::member_path("$.set_custom_element_data"),
                        vec![
                            b::id(&node_id),
                            b::string(attr.name.to_string()),
                            result.value,
                        ],
                    );

                    if result.has_state {
                        // For reactive values, wrap in template_effect
                        context.state.init.push(b::stmt(b::call(
                            b::member_path("$.template_effect"),
                            vec![b::thunk(call)],
                        )));
                    } else {
                        context.state.init.push(b::stmt(call));
                    }
                } else {
                    // Dynamic attribute - needs runtime handling
                    let result =
                        build_attribute_value(&attr.value, context, |expr, _metadata| expr);

                    let update = build_element_attribute_update(
                        node,
                        &extract_node_id(&context.state.node),
                        &name,
                        result.value,
                        &attributes,
                    );

                    if result.has_state {
                        context.state.update.push(b::stmt(update));
                    } else {
                        context.state.init.push(b::stmt(update));
                    }
                }
            }
        }

        // Handle class directives
        if !class_directives.is_empty() {
            let node_id = extract_node_id(&context.state.node);
            let node_expr = b::id(&node_id);
            let is_html = context.state.metadata.namespace != "svg";

            let set_class = build_set_class_call(
                node,
                node_expr,
                &class_directives,
                context,
                is_html,
                &context.state.analysis.css.hash.clone(),
            );
            context.state.init.push(b::stmt(set_class));
        }

        // Handle style directives
        if !style_directives.is_empty() {
            let node_id = extract_node_id(&context.state.node);
            let node_expr = b::id(&node_id);

            let set_style = build_set_style_call(node_expr, &style_directives, context);
            context.state.init.push(b::stmt(set_style));
        }

        // Event attributes are now handled in the main attribute loop above
        // (via visit_event_attribute when is_event_attribute is true)
    }

    // Clean child nodes - trim whitespace
    let preserve_whitespace =
        context.state.preserve_whitespace || node.name == "pre" || node.name == "textarea";

    let parent_node = TemplateNode::RegularElement(node.clone());
    let cleaned = clean_nodes(
        Some(&parent_node),
        &node.fragment.nodes,
        &[], // path - not needed for our implementation
        &context.state.metadata.namespace,
        context.state.scope,
        context.state.analysis,
        preserve_whitespace || node.name == "script",
        context.state.options.preserve_comments,
    );

    // Check if we can use textContent optimization
    // This applies when:
    // 1. All children are Text or ExpressionTag
    // 2. All ExpressionTags are non-reactive (no has_state, no has_await, no blockers)
    // 3. At least one ExpressionTag exists (otherwise pure text is in template)
    let all_text_or_expr = cleaned
        .trimmed
        .iter()
        .all(|n| matches!(n, TemplateNode::Text(_) | TemplateNode::ExpressionTag(_)));

    let has_expression_tag = cleaned
        .trimmed
        .iter()
        .any(|n| matches!(n, TemplateNode::ExpressionTag(_)));

    let all_expressions_static = cleaned.trimmed.iter().all(|n| {
        match n {
            TemplateNode::Text(_) => true,
            TemplateNode::ExpressionTag(expr_tag) => {
                // Check if expression is non-reactive
                !expression_has_reactive_state(&expr_tag.expression, context)
            }
            _ => false,
        }
    });

    let use_text_content = all_text_or_expr && has_expression_tag && all_expressions_static;

    if use_text_content {
        // Convert children to TextOrExpr for build_template_chunk
        let values: Vec<TextOrExpr> = cleaned
            .trimmed
            .iter()
            .filter_map(|n| match n {
                TemplateNode::Text(t) => Some(TextOrExpr::Text(t.clone())),
                TemplateNode::ExpressionTag(e) => Some(TextOrExpr::Expr(e.clone())),
                _ => None,
            })
            .collect();

        let result = build_template_chunk(&values, context);

        // Check if the result is an empty string literal
        let is_empty_string = matches!(&result.value, JsExpr::Literal(crate::compiler::phases::phase3_transform::js_ast::nodes::JsLiteral::String(s)) if s.is_empty());

        if !is_empty_string {
            // Set element.textContent = value
            context.state.init.push(b::stmt(b::assign(
                b::member(context.state.node.clone(), "textContent"),
                result.value,
            )));
        }
        // No need for $.reset() since we didn't descend into children
    } else if is_customizable_select_element(node) {
        // For <option>, <optgroup>, or <select> elements with rich content, we need to branch based on browser support.
        // Modern browsers preserve rich HTML in options, older browsers strip it to text only.
        // We create a separate template for the rich content and append it to the element.
        //
        // Corresponds to the `is_customizable_select_element(node)` branch in RegularElement.js

        let element_node = context.state.node.clone();

        // Add a hydration marker inside the option element so $.child() has an anchor to find
        context.state.template.push_comment(None);

        // Create a separate template for the rich content
        // Generate unique names for template and variables
        let template_name = context
            .state
            .memoizer
            .generate_id(&format!("{}_content", node.name));
        let fragment_id_name = context.state.memoizer.generate_id("fragment");
        let anchor_id_name = context.state.memoizer.generate_id("anchor");

        let fragment_id = b::id(&fragment_id_name);
        let anchor_id = b::id(&anchor_id_name);

        // Create a separate template for processing the rich content
        let mut select_template = Template::new();

        // Save current state and create new state for processing children in the separate template
        let saved_template = std::mem::replace(&mut context.state.template, select_template);
        let saved_init = std::mem::take(&mut context.state.init);
        let saved_update = std::mem::take(&mut context.state.update);
        let saved_after_update = std::mem::take(&mut context.state.after_update);

        // Process children with the new template
        process_children(
            &cleaned.trimmed,
            |is_text| {
                let mut args = vec![fragment_id.clone()];
                if is_text {
                    args.push(b::boolean(true));
                }
                b::call(b::member_path("$.first_child"), args)
            },
            false, // Not an element - we're processing into a fragment
            context,
        );

        // Capture the init/update/after_update statements from processing children
        let child_init = std::mem::take(&mut context.state.init);
        let child_update = std::mem::take(&mut context.state.update);
        let child_after_update = std::mem::take(&mut context.state.after_update);

        // Get the template and restore saved state
        select_template = std::mem::replace(&mut context.state.template, saved_template);
        context.state.init = saved_init;
        context.state.update = saved_update;
        context.state.after_update = saved_after_update;

        // Transform the template to $.from_html(...) and hoist it
        // We need to generate the template expression here
        let template_html = select_template.as_html();
        let template_call = b::call(
            b::member_path("$.from_html"),
            vec![template_html, b::number(1.0)],
        );

        // Add the template declaration to hoisted
        context
            .state
            .hoisted
            .push(b::var_decl(&template_name, Some(template_call)));

        // Build the rich content function body
        // The anchor is the child of the element (a hydration marker during hydration)
        let mut body_stmts = vec![
            b::var_decl(
                &anchor_id_name,
                Some(b::call(
                    b::member_path("$.child"),
                    vec![element_node.clone()],
                )),
            ),
            b::var_decl(
                &fragment_id_name,
                Some(b::call(b::id(&template_name), vec![])),
            ),
        ];
        body_stmts.extend(child_init);

        // Add template_effect if there are update statements
        if !child_update.is_empty() {
            body_stmts.push(b::stmt(b::call(
                b::member_path("$.template_effect"),
                vec![b::arrow_block(vec![], child_update)],
            )));
        }

        body_stmts.extend(child_after_update);
        body_stmts.push(b::stmt(b::call(
            b::member_path("$.append"),
            vec![anchor_id.clone(), fragment_id.clone()],
        )));

        // Create the $.customizable_select() call
        let customizable_select_call = b::call(
            b::member_path("$.customizable_select"),
            vec![element_node, b::arrow_block(vec![], body_stmts)],
        );

        context.state.init.push(b::stmt(customizable_select_call));
    } else {
        // Process trimmed child nodes
        // These statements go directly into context.state (child_state in JS)
        let current_node = context.state.node.clone();
        process_children(
            &cleaned.trimmed,
            |is_text| {
                let mut args = vec![current_node.clone()];
                // Only include second argument if it's true
                if is_text {
                    args.push(b::boolean(true));
                }
                b::call(b::member_path("$.child"), args)
            },
            true, // is_element
            context,
        );

        // Reset after processing children if needed
        let needs_reset = cleaned
            .trimmed
            .iter()
            .any(|n| !matches!(n, TemplateNode::Text(_)));

        if needs_reset {
            context.state.init.push(b::stmt(b::call(
                b::member_path("$.reset"),
                vec![context.state.node.clone()],
            )));
        }
    }

    // Now merge element_state statements AFTER child processing
    // This ensures: child navigation -> $.reset -> element directives
    // Matches JS: context.state.init.push(...child_state.init, ...element_state.init)
    context.state.init.extend(element_state_init);
    context
        .state
        .after_update
        .extend(element_state_after_update);

    // Handle special value attribute for option/select
    // This must happen after child processing but before pop_element
    // Corresponds to lines 480-501 in RegularElement.js
    if !has_spread && needs_special_value_handling {
        let node_id = extract_node_id(&context.state.node);

        if let Some(synthetic_node) = &node.metadata.synthetic_value_node {
            // This is an `option` element without a `value` attribute but with a single-expression child.
            // We treat the value of that expression as the value of the option.
            // Use AttributeValue::Expression to leverage build_attribute_value's transform handling
            let synthetic_attr_value = AttributeValue::Expression((**synthetic_node).clone());
            let result =
                build_attribute_value(&synthetic_attr_value, context, |expr, _metadata| expr);

            build_element_special_value_attribute(
                &node.name,
                &node_id,
                result.value,
                result.has_state,
                true, // synthetic = true
                context,
            );
        } else {
            // Look for an explicit value attribute
            for attribute in &attributes {
                if let Attribute::Attribute(attr) = attribute
                    && attr.name == "value"
                {
                    let result =
                        build_attribute_value(&attr.value, context, |expr, _metadata| expr);

                    build_element_special_value_attribute(
                        &node.name,
                        &node_id,
                        result.value,
                        result.has_state,
                        false, // synthetic = false
                        context,
                    );
                    break;
                }
            }
        }
    }

    context.state.template.pop_element();
    TransformResult::None
}

/// Check if a node is a custom element.
fn is_custom_element_node(node: &RegularElementNode) -> bool {
    node.name.contains('-')
        || node.attributes.iter().any(|attr| {
            if let Attribute::Attribute(a) = attr {
                a.name == "is"
            } else {
                false
            }
        })
}

/// Check if an attribute is a text attribute (static string).
fn is_text_attribute(attr: &AttributeNode) -> bool {
    use crate::ast::template::AttributeValuePart;

    match &attr.value {
        AttributeValue::True(_) => false,
        AttributeValue::Expression(_) => false,
        AttributeValue::Sequence(parts) => parts
            .iter()
            .all(|p| matches!(p, AttributeValuePart::Text(_))),
    }
}

/// Get the attribute name (normalized).
fn get_attribute_name(_node: &RegularElementNode, attr: &AttributeNode) -> String {
    attr.name.to_string()
}

/// Check if an attribute cannot be set statically in the template.
fn cannot_be_set_statically(name: &str) -> bool {
    matches!(
        name,
        "value"
            | "checked"
            | "selected"
            | "innerHTML"
            | "innerText"
            | "textContent"
            | "autofocus"
            | "muted"
            | "defaultValue"
            | "defaultChecked"
    )
}

/// Check if an attribute is a boolean attribute.
fn is_boolean_attribute(name: &str) -> bool {
    matches!(
        name,
        "allowfullscreen"
            | "async"
            | "autofocus"
            | "autoplay"
            | "checked"
            | "controls"
            | "default"
            | "defer"
            | "disabled"
            | "formnovalidate"
            | "hidden"
            | "indeterminate"
            | "ismap"
            | "loop"
            | "multiple"
            | "muted"
            | "nomodule"
            | "novalidate"
            | "open"
            | "playsinline"
            | "readonly"
            | "required"
            | "reversed"
            | "selected"
    )
}

/// Check if a name is a DOM property (vs attribute).
fn is_dom_property(name: &str) -> bool {
    matches!(
        name,
        "value"
            | "checked"
            | "selected"
            | "muted"
            | "volume"
            | "currentTime"
            | "playbackRate"
            | "paused"
            | "innerHTML"
            | "innerText"
            | "textContent"
    )
}

/// Extract node ID from a JsExpr (identifier name or "node" as fallback).
fn extract_node_id(expr: &JsExpr) -> String {
    match expr {
        JsExpr::Identifier(name) => name.clone(),
        _ => "node".to_string(),
    }
}

/// Build element attribute update expression.
fn build_element_attribute_update(
    element: &RegularElementNode,
    node_id: &str,
    name: &str,
    value: JsExpr,
    attributes: &[Attribute],
) -> JsExpr {
    // Special case: muted (Firefox needs property assignment)
    if name == "muted" {
        return b::assign(b::member(b::id(node_id), "muted"), value);
    }

    // Special case: value
    if name == "value" {
        return b::call(b::member_path("$.set_value"), vec![b::id(node_id), value]);
    }

    // Special case: checked
    if name == "checked" {
        return b::call(b::member_path("$.set_checked"), vec![b::id(node_id), value]);
    }

    // Special case: selected
    if name == "selected" {
        return b::call(
            b::member_path("$.set_selected"),
            vec![b::id(node_id), value],
        );
    }

    // Special case: defaultValue
    if name == "defaultValue" {
        let has_value_attr = attributes.iter().any(|attr| {
            if let Attribute::Attribute(a) = attr {
                a.name == "value" && is_text_attribute(a)
            } else {
                false
            }
        });

        if has_value_attr || (element.name == "textarea" && !element.fragment.nodes.is_empty()) {
            return b::call(
                b::member_path("$.set_default_value"),
                vec![b::id(node_id), value],
            );
        }
    }

    // Special case: defaultChecked
    if name == "defaultChecked" {
        let has_checked_attr = attributes.iter().any(|attr| {
            if let Attribute::Attribute(a) = attr {
                matches!(&a.value, AttributeValue::True(true)) && a.name == "checked"
            } else {
                false
            }
        });

        if has_checked_attr {
            return b::call(
                b::member_path("$.set_default_checked"),
                vec![b::id(node_id), value],
            );
        }
    }

    // DOM property
    if is_dom_property(name) {
        return b::assign(b::member(b::id(node_id), name), value);
    }

    // Regular attribute
    let set_fn = if name.starts_with("xlink") {
        "$.set_xlink_attribute"
    } else {
        "$.set_attribute"
    };

    b::call(
        b::member_path(set_fn),
        vec![b::id(node_id), b::string(name), value],
    )
}

/// Checks if a <select>, <optgroup>, or <option> element has rich content that requires
/// special hydration handling with `$.customizable_select()`.
///
/// Rich content is anything beyond simple text, expressions, and comments for <option>,
/// anything beyond <option> children for <optgroup>,
/// or anything beyond <option>, <optgroup>, and empty text for <select>.
/// Control flow blocks are recursively checked - they only count as rich content if they
/// contain rich content themselves.
///
/// Corresponds to `is_customizable_select_element` in
/// `svelte/packages/svelte/src/compiler/phases/nodes.js`.
fn is_customizable_select_element(node: &RegularElementNode) -> bool {
    if node.name == "select" || node.name == "optgroup" || node.name == "option" {
        for child in find_descendants(&node.fragment) {
            match &child {
                TemplateNode::RegularElement(elem) => {
                    if node.name == "select" && elem.name != "option" && elem.name != "optgroup" {
                        return true;
                    }
                    if node.name == "optgroup" && elem.name != "option" {
                        return true;
                    }
                    if node.name == "option" {
                        return true;
                    }
                }
                TemplateNode::Text(text) => {
                    // Text nodes directly in <select> or <optgroup> are rich content
                    // (only if non-empty after trim)
                    if (node.name == "select" || node.name == "optgroup")
                        && !text.data.trim().is_empty()
                    {
                        return true;
                    }
                }
                _ => {
                    // Any non-RegularElement, non-Text node is rich content
                    // This includes Component, RenderTag, HtmlTag, etc.
                    return true;
                }
            }
        }
    }
    false
}

/// Iterate through descendants of a fragment, recursively descending into control flow blocks.
///
/// This yields nodes that are "concrete" content - it skips control flow wrappers and returns
/// their inner content. SnippetBlock, DebugTag, ConstTag, Comment, and ExpressionTag are skipped.
///
/// Corresponds to `find_descendants` generator in
/// `svelte/packages/svelte/src/compiler/phases/nodes.js`.
fn find_descendants(fragment: &Fragment) -> Vec<TemplateNode> {
    let mut result = Vec::new();
    find_descendants_recursive(&fragment.nodes, &mut result);
    result
}

fn find_descendants_recursive(nodes: &[TemplateNode], result: &mut Vec<TemplateNode>) {
    for node in nodes {
        match node {
            // Skip these types - they don't contribute to rich content detection
            TemplateNode::SnippetBlock(_)
            | TemplateNode::DebugTag(_)
            | TemplateNode::ConstTag(_)
            | TemplateNode::Comment(_)
            | TemplateNode::ExpressionTag(_) => {}

            // Text nodes: yield if non-whitespace
            TemplateNode::Text(text) => {
                if !text.data.trim().is_empty() {
                    result.push(node.clone());
                }
            }

            // Control flow blocks: recurse into their content
            TemplateNode::IfBlock(if_block) => {
                find_descendants_recursive(&if_block.consequent.nodes, result);
                if let Some(alternate) = &if_block.alternate {
                    find_descendants_recursive(&alternate.nodes, result);
                }
            }

            TemplateNode::EachBlock(each_block) => {
                find_descendants_recursive(&each_block.body.nodes, result);
                if let Some(fallback) = &each_block.fallback {
                    find_descendants_recursive(&fallback.nodes, result);
                }
            }

            TemplateNode::KeyBlock(key_block) => {
                find_descendants_recursive(&key_block.fragment.nodes, result);
            }

            TemplateNode::AwaitBlock(await_block) => {
                if let Some(pending) = &await_block.pending {
                    find_descendants_recursive(&pending.nodes, result);
                }
                if let Some(then) = &await_block.then {
                    find_descendants_recursive(&then.nodes, result);
                }
                if let Some(catch) = &await_block.catch {
                    find_descendants_recursive(&catch.nodes, result);
                }
            }

            TemplateNode::SvelteBoundary(boundary) => {
                find_descendants_recursive(&boundary.fragment.nodes, result);
            }

            // All other nodes (RegularElement, Component, RenderTag, HtmlTag, etc.) are yielded
            _ => {
                result.push(node.clone());
            }
        }
    }
}

/// Serializes an assignment to the value property of a `<select>`, `<option>` or `<input>` element
/// that needs the hidden `__value` property.
///
/// Corresponds to `build_element_special_value_attribute` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/RegularElement.js`.
///
/// Parameters:
/// - `element_name`: The element tag name ("option", "select", etc.)
/// - `node_id`: The identifier for the element node
/// - `value`: The value expression
/// - `has_state`: Whether the value is dynamic (has reactive state)
/// - `synthetic`: Whether this is a synthetic value (no explicit value attribute, just child expression)
/// - `context`: The component context
fn build_element_special_value_attribute(
    element_name: &str,
    node_id: &str,
    value: JsExpr,
    has_state: bool,
    synthetic: bool,
    context: &mut ComponentContext,
) {
    // Apply transforms to the value expression (e.g., $.get() wrapping for reactive variables)
    let transformed_value = apply_transforms_to_expression(&value, context);

    // node.__value = transformed_value
    let assignment = b::assign(
        b::member(b::id(node_id), "__value"),
        transformed_value.clone(),
    );

    // For non-synthetic values: node.value = node.__value = transformed_value
    // For synthetic values: just node.__value = transformed_value
    let update = if synthetic {
        b::stmt(assignment)
    } else {
        b::stmt(b::assign(b::member(b::id(node_id), "value"), assignment))
    };

    if has_state {
        // For dynamic values:
        // var node_value = {};  // {} is used as a sentinel that will never equal any real value
        // if (node_value !== (node_value = transformed_value)) {
        //     node.__value = transformed_value;  // or node.value = node.__value = transformed_value for non-synthetic
        // }
        let value_id = context
            .state
            .memoizer
            .generate_id(&format!("{}_value", node_id));

        // For option elements, use {} as initial value (a sentinel that won't equal any real value)
        // This ensures the first comparison always triggers the update
        let init_value = if element_name == "option" {
            Some(b::object(vec![]))
        } else {
            None
        };

        // Add variable declaration: var node_value = {} (for option) or var node_value (for others)
        context.state.init.push(b::var_decl(&value_id, init_value));

        // Create the comparison: value_id !== (value_id = transformed_value)
        let comparison = b::binary_str(
            "!==",
            b::id(&value_id),
            b::assign(b::id(&value_id), transformed_value.clone()),
        );

        // Create the if statement: if (comparison) { update }
        // b::if_stmt takes (test, consequent, alternate)
        let if_statement = b::if_stmt(comparison, b::block(vec![update]), None);

        context.state.update.push(if_statement);
    } else {
        // For static values, just add the assignment to init
        context.state.init.push(update);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_boolean_attribute() {
        assert!(is_boolean_attribute("checked"));
        assert!(is_boolean_attribute("disabled"));
        assert!(is_boolean_attribute("readonly"));
        assert!(!is_boolean_attribute("value"));
        assert!(!is_boolean_attribute("class"));
    }

    #[test]
    fn test_is_dom_property() {
        assert!(is_dom_property("value"));
        assert!(is_dom_property("checked"));
        assert!(is_dom_property("innerHTML"));
        assert!(!is_dom_property("class"));
        assert!(!is_dom_property("id"));
    }
}
