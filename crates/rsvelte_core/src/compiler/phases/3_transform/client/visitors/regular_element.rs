//! RegularElement visitor for client-side transformation.
//!
//! Corresponds to `RegularElement.js` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/RegularElement.js`.
//!
//! This visitor handles regular HTML elements like `<div>`, `<span>`, etc.

// Allow dead code for TODO event handler stubs
#![allow(dead_code)]

use crate::ast::template::{
    Attribute, AttributeNode, AttributeValue, BindDirective, ClassDirective, Fragment,
    LetDirective, RegularElement as RegularElementNode, StyleDirective, TemplateNode,
};
use crate::compiler::phases::phase3_transform::client::transform_template::Template;
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::client::visitors::animate_directive::animate_directive;
use crate::compiler::phases::phase3_transform::client::visitors::attach_tag::attach_tag;
use crate::compiler::phases::phase3_transform::client::visitors::attribute::{
    is_event_attribute, visit_event_attribute,
};
use crate::compiler::phases::phase3_transform::client::visitors::bind_directive::bind_directive_with_ignored;
use crate::compiler::phases::phase3_transform::client::visitors::shared::element::{
    build_attribute_effect, build_attribute_value, build_set_class, build_set_style,
};
use crate::compiler::phases::phase3_transform::client::visitors::shared::fragment::{
    TextOrExpr, is_static_element, process_children,
};
use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::{
    build_template_chunk, expression_has_reactive_state,
};
use crate::compiler::phases::phase3_transform::client::visitors::transition_directive::transition_directive;
use crate::compiler::phases::phase3_transform::client::visitors::use_directive::use_directive;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::{
    JsExpr, JsLiteral, JsPattern, JsStatement,
};
use crate::compiler::phases::phase3_transform::utils::is_svelte_whitespace_only;
use crate::compiler::phases::phase3_transform::utils::{
    clean_nodes, determine_namespace_for_children,
};
use std::borrow::Cow;
// Note: can_delegate_event and is_capture_event are used in attribute.rs for event delegation
use rustc_hash::FxHashMap;

/// Process let directives on a regular element (e.g., `<div slot="foo" let:thing>`).
///
/// Generates `$.derived_safe_equal` (legacy) or `$.derived` (runes) declarations
/// and registers `$.get()` transforms for each let-bound variable.
///
/// Corresponds to LetDirective handling in RegularElement.js lines 115-118 and 207.
/// Return type for process_element_let_directives, containing
/// the bound names and saved transforms to restore after children are visited.
struct LetDirectiveResult {
    saved_transforms: Vec<(
        String,
        Option<crate::compiler::phases::phase3_transform::client::types::IdentifierTransform>,
    )>,
    saved_transform_deep_read: im::HashMap<String, ()>,
}

fn process_element_let_directives(
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,

    let_directives: &[&LetDirective],
    context: &mut ComponentContext,
) -> LetDirectiveResult {
    let mut saved_transforms: Vec<(
        String,
        Option<crate::compiler::phases::phase3_transform::client::types::IdentifierTransform>,
    )> = Vec::new();
    let saved_transform_deep_read = context.state.transform_deep_read.clone();

    for let_dir in let_directives {
        let prop_name = &let_dir.name;

        // Check if expression is an Identifier or null (simple case)
        let is_simple = match &let_dir.expression {
            None => true,
            Some(expr) => expr.node_type() == Some("Identifier"),
        };

        if is_simple {
            let name = match &let_dir.expression {
                Some(expr) => expr.name().unwrap_or(prop_name).to_string(),
                None => prop_name.to_string(),
            };

            // Save existing transform before overwriting
            saved_transforms.push((name.clone(), context.state.transform.get(&name).cloned()));

            let derived_fn = if context.state.analysis.runes {
                "$.derived"
            } else {
                "$.derived_safe_equal"
            };

            // Push to `state.let_directives` (not `state.init`) so the slot
            // body assembly emits let: bindings BEFORE `{@const}` declarations
            // and other init statements. Mirrors Svelte 5.55.10 / 5.56.0
            // #18271 — `{@const}` bodies on slotted elements can reference
            // let: bindings, so the let: must be declared first.
            context.state.let_directives.push(b::const_decl(
                arena,
                &name,
                b::call(
                    arena,
                    b::member_path(arena, derived_fn),
                    vec![b::thunk(
                        arena,
                        b::member(arena, b::id("$$slotProps"), prop_name.to_string()),
                    )],
                ),
            ));

            context.state.transform.insert(
                name.clone(),
                crate::compiler::phases::phase3_transform::client::types::IdentifierTransform {
                    read: Some(|arena, node| {
                        b::call(arena, b::member_path(arena, "$.get"), vec![node])
                    }),
                    read_source: None,
                    assign: None,
                    mutate: None,
                    update: None,
                    skip_proxy: false,
                    is_defined: false,
                    is_reactive: true,
                    replacement_id: None,
                },
            );
            // Let directive bindings are template-kind.
            context.state.transform_deep_read.insert(name.clone(), ());
        }
    }

    LetDirectiveResult {
        saved_transforms,
        saved_transform_deep_read,
    }
}

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
    let is_html = context.state.metadata.namespace == "html" && node.name != "svg";
    // Avoid allocation when name is already lowercase (common case for HTML)
    let name_str = node.name.as_str();
    let elem_name = if is_html && name_str.bytes().any(|b| b.is_ascii_uppercase()) {
        name_str.to_lowercase()
    } else {
        name_str.to_string()
    };
    context
        .state
        .template
        .push_element(elem_name, node.start, is_html);

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

    // Categorize attributes in a single pass - also detect spread/use directives
    let attr_count = node.attributes.len();
    let mut attributes: Vec<&Attribute> = Vec::with_capacity(attr_count);
    let mut class_directives: Vec<&ClassDirective> = Vec::new();
    let mut style_directives: Vec<&StyleDirective> = Vec::new();
    let mut element_let_directives: Vec<&LetDirective> = Vec::new();
    let mut bindings: FxHashMap<String, &BindDirective> = FxHashMap::default();
    let mut has_spread = false;
    let mut has_use = false;

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
                attributes.push(attribute);
            }
            Attribute::ClassDirective(dir) => {
                class_directives.push(dir);
            }
            Attribute::StyleDirective(dir) => {
                style_directives.push(dir);
            }
            Attribute::BindDirective(dir) => {
                bindings.insert(dir.name.to_string(), dir);
            }
            Attribute::SpreadAttribute(_) => {
                has_spread = true;
                attributes.push(attribute);
            }
            Attribute::LetDirective(dir) => {
                element_let_directives.push(dir);
            }
            Attribute::UseDirective(_) => {
                has_use = true;
            }
            // OnDirective, TransitionDirective, AnimateDirective, AttachTag
            // are processed in source order in the directive loop below
            _ => {}
        }
    }

    // Process let directives (mirrors RegularElement.js line 207)
    let arena_ref = unsafe { &*(&context.arena as *const _) };
    let let_directive_result =
        process_element_let_directives(arena_ref, &element_let_directives, context);

    // Check if value attribute needs special handling (option, select, or bindings)
    let needs_special_value_handling = node.name == "option"
        || node.name == "select"
        || bindings.contains_key("group")
        || bindings.contains_key("checked");

    // Create separate vectors for element-level state (directives that apply to this element)
    // Following JS implementation: element_state = { ...context.state, init: [], after_update: [] }
    // These will be merged AFTER child processing to ensure correct statement order.
    let mut element_state_init: Vec<JsStatement> = Vec::new();
    let mut element_state_after_update: Vec<JsStatement> = Vec::new();

    // Process other_directives in SOURCE ORDER to match the official compiler.
    // The official code collects all non-attribute directives into `other_directives`
    // and processes them in source order. We iterate the original attribute list
    // and process each directive type as we encounter it.
    let parent_ref =
        crate::compiler::phases::phase3_transform::utils::ParentRef::RegularElement(node);
    for attribute in &node.attributes {
        match attribute {
            Attribute::OnDirective(on_directive) => {
                if let TransformResult::Expression(event_call) =
                    context.visit_on_directive(on_directive)
                {
                    if has_use {
                        element_state_init.push(b::stmt(
                            &context.arena,
                            b::call(
                                &context.arena,
                                b::member_path(&context.arena, "$.effect"),
                                vec![b::thunk(&context.arena, event_call)],
                            ),
                        ));
                    } else {
                        element_state_after_update.push(b::stmt(&context.arena, event_call));
                    }
                }
            }
            Attribute::TransitionDirective(trans_directive) => {
                let init_before = context.state.init.len();
                let after_update_before = context.state.after_update.len();

                transition_directive(trans_directive, context);

                element_state_init.extend(context.state.init.drain(init_before..));
                element_state_after_update
                    .extend(context.state.after_update.drain(after_update_before..));
            }
            Attribute::AnimateDirective(anim_directive) => {
                let init_before = context.state.init.len();
                let after_update_before = context.state.after_update.len();

                animate_directive(anim_directive, context);

                element_state_init.extend(context.state.init.drain(init_before..));
                element_state_after_update
                    .extend(context.state.after_update.drain(after_update_before..));
            }
            Attribute::BindDirective(bind_dir) => {
                let init_before = context.state.init.len();
                let after_update_before = context.state.after_update.len();

                bind_directive_with_ignored(
                    bind_dir,
                    context,
                    parent_ref,
                    &node.metadata.ignored_codes,
                );

                element_state_init.extend(context.state.init.drain(init_before..));
                element_state_after_update
                    .extend(context.state.after_update.drain(after_update_before..));
            }
            Attribute::UseDirective(use_dir) => {
                let stmt = use_directive(use_dir, context);
                element_state_init.push(stmt);
            }
            Attribute::AttachTag(attach) => {
                let init_before = context.state.init.len();

                attach_tag(attach, context);

                element_state_init.extend(context.state.init.drain(init_before..));
            }
            _ => {} // Attribute, ClassDirective, StyleDirective, LetDirective handled elsewhere
        }
    }

    // $.replay_events() for load/error elements with spreads, use directives, or event handlers
    // is emitted AFTER the second attribute loop below (which processes event attributes like
    // `onerror={...}` that go directly to `context.state.after_update`), but element_state events
    // (from OnDirective) are still pending in `element_state_after_update`. This matches the
    // official compiler order:
    //   - `on:load` / `on:error` (OnDirective) → element_state → merged to context.state AFTER replay
    //   - `onload={...}` / `onerror={...}` (event attribute) → context.state BEFORE replay
    //   - replay_events → context.state at the position set by line 283 in the official code
    let needs_replay_events = is_load_error_element(&node.name)
        && (has_spread
            || has_use
            || attributes.iter().any(|attr| {
                matches!(attr, Attribute::Attribute(a) if a.name == "onload" || a.name == "onerror")
            }));

    // For input elements, add $.remove_input_defaults() call when needed
    // Reference: RegularElement.js lines 164-190
    //
    // The logic is:
    // 1. Only for input elements
    // 2. Only if there's NO defaultValue or defaultChecked attribute
    // 3. AND one of:
    //    - has_spread
    //    - has value binding
    //    - has checked binding
    //    - has group binding
    //    - has a non-text value/checked attribute (and no group binding)
    if node.name == "input" {
        // Check if there's a value or checked attribute that's not a simple text attribute
        let has_value_attribute = attributes.iter().any(|attr| {
            if let Attribute::Attribute(a) = attr {
                (a.name == "value" || a.name == "checked") && !is_text_attribute(a)
            } else {
                false
            }
        });

        // Check if there's a defaultValue or defaultChecked attribute
        let has_default_value_attribute = attributes.iter().any(|attr| {
            if let Attribute::Attribute(a) = attr {
                a.name == "defaultValue" || a.name == "defaultChecked"
            } else {
                false
            }
        });

        let should_remove_defaults = !has_default_value_attribute
            && (has_spread
                || bindings.contains_key("value")
                || bindings.contains_key("checked")
                || bindings.contains_key("group")
                || (!bindings.contains_key("group") && has_value_attribute));

        if should_remove_defaults && !has_spread {
            // When has_spread, remove_input_defaults will be called inside set_attributes
            context.state.init.push(b::stmt(
                &context.arena,
                b::call(
                    &context.arena,
                    b::member_path(&context.arena, "$.remove_input_defaults"),
                    vec![context.state.node.clone()],
                ),
            ));
        }
    }

    // For textarea elements with bind:value, spread attributes, or non-text value attribute,
    // add $.remove_textarea_child() call
    // See: svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/RegularElement.js
    if node.name == "textarea" {
        // Check if there's a value attribute that's not a simple text
        let value_attr = attributes.iter().find_map(|attr| {
            if let Attribute::Attribute(a) = attr
                && a.name == "value"
            {
                return Some(a);
            }
            None
        });
        let needs_content_reset = value_attr.is_some_and(|attr| !is_text_attribute(attr));

        if has_spread || bindings.contains_key("value") || needs_content_reset {
            context.state.init.push(b::stmt(
                &context.arena,
                b::call(
                    &context.arena,
                    b::member_path(&context.arena, "$.remove_textarea_child"),
                    vec![context.state.node.clone()],
                ),
            ));
        }
    }

    // Process attributes (excluding directives)
    if has_spread {
        // Use build_attribute_effect for spread attributes
        // This combines all attributes (including event handlers) into a single $.attribute_effect call
        let node_id = extract_node_id(&context.state.node);
        let node_expr = b::id(&node_id);
        // Only pass CSS hash if this specific element is scoped
        let css_hash = if node.metadata.scoped {
            context.state.analysis.css.hash.clone()
        } else {
            String::new()
        };

        // Determine if we should remove input defaults (for input elements with spreads)
        // This is needed because spreads might contain value-like attributes that override defaults
        // Reference: RegularElement.js lines 164-190
        //
        // The logic is:
        // 1. Only for input elements
        // 2. Only if there's NO defaultValue or defaultChecked attribute
        // 3. AND one of: has_spread, has value binding, has checked binding, has group binding,
        //    or has a non-text value/checked attribute
        let should_remove_defaults = if node.name == "input" {
            // Check if there's a defaultValue or defaultChecked attribute
            let has_default_value_attribute = attributes.iter().any(|attr| {
                matches!(attr, Attribute::Attribute(a) if a.name == "defaultValue" || a.name == "defaultChecked")
            });

            // If there's a default value attribute, don't remove defaults
            !has_default_value_attribute
        } else {
            false
        };

        let ignore_hydration = context.state.options.dev
            && node
                .metadata
                .ignored_codes
                .iter()
                .any(|c| c == "hydration_attribute_changed");
        build_attribute_effect(
            &attributes,
            &class_directives,
            &style_directives,
            context,
            node_expr,
            &css_hash,
            should_remove_defaults,
            ignore_hydration,
        );
    } else {
        // Find class attribute for special handling
        let class_attribute = attributes.iter().find_map(|attr| {
            if let Attribute::Attribute(a) = attr
                && a.name == "class"
            {
                return Some(a);
            }
            None
        });

        // Find static style attribute for special handling with style directives
        // This is used when the style attribute has a static value AND there are style directives.
        // In that case, the static style value is passed to $.set_style() as the first argument.
        let static_style_attribute = attributes.iter().find(|attr| {
            matches!(attr, Attribute::Attribute(a) if a.name == "style"
                && !style_directives.is_empty()
                && is_text_attribute(a))
        });

        // Track if style has been handled (when style attribute exists)
        let mut style_handled = false;
        // Track if class directives have been handled inline (at source position)
        let mut class_directives_handled = false;

        // Check if element needs CSS scoping (per-element flag set during analysis)
        let is_scoped = node.metadata.scoped;

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

                // Handle class attribute with class directives inline at source position
                // (matching the official compiler's RegularElement.js which processes
                // class at its source position, not post-loop)
                if name == "class" && !class_directives.is_empty() {
                    let is_html = context.state.metadata.namespace == "html" && node.name != "svg";
                    let node_id_str = extract_node_id(&context.state.node);
                    build_set_class(
                        node,
                        &node_id_str,
                        Some(&attr.value),
                        &class_directives,
                        context,
                        is_html,
                        &context.state.analysis.css.hash.clone(),
                        is_scoped,
                    );
                    class_directives_handled = true;
                    continue;
                }

                // Skip STATIC TEXT style attribute if there are style directives.
                // Static style attribute values should be passed to $.set_style() directly,
                // not baked into the template. They will be handled in the post-loop section.
                // Dynamic style attributes (style={expr}) must still go through the
                // else-if name == "style" branch to be properly processed.
                if name == "style" && !style_directives.is_empty() && is_text_attribute(attr) {
                    continue;
                }

                // Static text attributes can go in the template
                let is_true_value = matches!(&attr.value, AttributeValue::True(true));
                if !is_custom_element
                    && !cannot_be_set_statically(&name)
                    && (is_true_value || is_text_attribute(attr))
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

                    // Add scoped class if needed (only for class without class directives)
                    if name == "class" && is_scoped {
                        let hash = &context.state.analysis.css.hash;
                        if value.is_empty() {
                            value = hash.clone();
                        } else {
                            value.push(' ');
                            value.push_str(hash);
                        }
                    }

                    if name != "class" || !value.is_empty() {
                        let prop_value = if is_true_value {
                            Some(String::new())
                        } else {
                            Some(value)
                        };

                        context.state.template.set_prop(name.clone(), prop_value);
                    }
                } else if name == "autofocus" {
                    // Special case: autofocus needs $.autofocus() call
                    let result =
                        build_attribute_value(&attr.value, context, |expr, _metadata| expr);
                    let node_id = extract_node_id(&context.state.node);
                    context.state.init.push(b::stmt(
                        &context.arena,
                        b::call(
                            &context.arena,
                            b::member_path(&context.arena, "$.autofocus"),
                            vec![b::id(&node_id), result.value],
                        ),
                    ));
                } else if name == "class" {
                    // Dynamic class attribute without class directives
                    let is_html = context.state.metadata.namespace == "html" && node.name != "svg";
                    let node_id = extract_node_id(&context.state.node);
                    build_set_class(
                        node,
                        &node_id,
                        Some(&attr.value),
                        &[], // No class directives
                        context,
                        is_html,
                        &context.state.analysis.css.hash.clone(),
                        is_scoped,
                    );
                } else if name == "style" {
                    // Dynamic style attribute (with or without style directives)
                    let node_id = extract_node_id(&context.state.node);
                    build_set_style(&node_id, Some(&attr.value), &style_directives, context);
                    style_handled = true;
                } else if is_custom_element {
                    // Custom element: use $.set_custom_element_data
                    let result =
                        build_attribute_value(&attr.value, context, |expr, _metadata| expr);
                    let node_id = extract_node_id(&context.state.node);
                    let call = b::call(
                        &context.arena,
                        b::member_path(&context.arena, "$.set_custom_element_data"),
                        vec![
                            b::id(&node_id),
                            b::string(attr.name.to_string()),
                            result.value,
                        ],
                    );

                    if result.has_state {
                        // For reactive values, wrap in template_effect
                        context.state.init.push(b::stmt(
                            &context.arena,
                            b::call(
                                &context.arena,
                                b::member_path(&context.arena, "$.template_effect"),
                                vec![b::thunk(&context.arena, call)],
                            ),
                        ));
                    } else {
                        context.state.init.push(b::stmt(&context.arena, call));
                    }
                } else {
                    // Dynamic attribute - needs runtime handling.
                    // Corresponds to RegularElement.js lines 266-274:
                    //   const { value, has_state } = build_attribute_value(
                    //       attribute.value, context,
                    //       (value, metadata) => context.state.memoizer.add(value, metadata)
                    //   );
                    //   (has_state ? context.state.update : context.state.init).push(b.stmt(update));
                    //
                    // The memoize closure is called PER-EXPRESSION inside template
                    // chunks, so we must actually call memoizer.add inside the
                    // closure rather than wrapping the whole result. We temporarily
                    // take the memoizer out of context.state to satisfy the borrow
                    // checker (the closure captures a separate &mut reference to
                    // the local memoizer while context is still borrowed).
                    let mut local_memoizer = std::mem::take(&mut context.state.memoizer);
                    let result = build_attribute_value(&attr.value, context, |expr, metadata| {
                        local_memoizer.add(
                            expr,
                            metadata.has_call(),
                            metadata.has_await(),
                            false,
                            metadata.has_state(),
                        )
                    });
                    context.state.memoizer = local_memoizer;

                    let update = build_element_attribute_update(
                        &context.arena,
                        node,
                        &extract_node_id(&context.state.node),
                        &name,
                        result.value,
                        &attributes,
                        context.state.options.dev,
                    );

                    // Route to update (template_effect) when the expression has state.
                    if result.has_state {
                        context.state.update.push(b::stmt(&context.arena, update));
                    } else {
                        context.state.init.push(b::stmt(&context.arena, update));
                    }
                }
            }
        }

        // Add CSS scoping class to elements without class attribute or class directives.
        // For custom elements: use a runtime $.set_class() call instead of baking into template.
        if is_scoped && class_attribute.is_none() && class_directives.is_empty() {
            let hash = &context.state.analysis.css.hash;
            if !hash.is_empty() {
                if is_custom_element {
                    // Custom elements: use runtime $.set_class() call
                    let node_id = extract_node_id(&context.state.node);
                    let is_html_ns =
                        context.state.metadata.namespace == "html" && node.name != "svg";
                    let flags = if is_html_ns {
                        b::number(1.0)
                    } else {
                        b::number(0.0)
                    };
                    context.state.init.push(b::stmt(
                        &context.arena,
                        b::call(
                            &context.arena,
                            b::member_path(&context.arena, "$.set_class"),
                            vec![b::id(&node_id), flags, b::string(hash)],
                        ),
                    ));
                } else {
                    // Regular elements: bake hash into template HTML
                    context
                        .state
                        .template
                        .set_prop("class".to_string(), Some(hash.clone()));
                }
            }
        }

        // Handle class directives (with or without class attribute)
        // Skip if already handled inline at source position
        if !class_directives.is_empty() && !class_directives_handled {
            let node_id = extract_node_id(&context.state.node);
            let is_html = context.state.metadata.namespace == "html" && node.name != "svg";

            // Get the class attribute value if it exists
            let class_attr_value = class_attribute.map(|attr| &attr.value);

            build_set_class(
                node,
                &node_id,
                class_attr_value,
                &class_directives,
                context,
                is_html,
                &context.state.analysis.css.hash.clone(),
                is_scoped,
            );
        }

        // Handle style directives when there's no style attribute (or when the style attribute
        // was static and was skipped in the loop above - we need to pass its value here).
        // (If there was a dynamic style attribute, it was already handled together with style_directives above)
        if !style_directives.is_empty() && !style_handled {
            let node_id = extract_node_id(&context.state.node);
            // Pass static style attribute value if available (when style attr was skipped due to directives)
            let style_attr_value = static_style_attribute.and_then(|attr| {
                if let Attribute::Attribute(a) = attr {
                    Some(&a.value)
                } else {
                    None
                }
            });
            build_set_style(
                &node_id,
                style_attr_value, // Pass static style value if available, or None
                &style_directives,
                context,
            );
        }

        // Event attributes are now handled in the main attribute loop above
        // (via visit_event_attribute when is_event_attribute is true)
    }

    // Emit $.replay_events(node) AFTER event attributes have been pushed to
    // context.state.after_update, but before element_state_after_update is merged.
    // This matches RegularElement.js line 283 behavior: event attributes (e.g.
    // `onerror={...}`) come BEFORE replay, while OnDirective events (pushed into
    // element_state_after_update) come AFTER replay via the later merge step.
    if needs_replay_events {
        let node_id = extract_node_id(&context.state.node);
        context.state.after_update.push(b::stmt(
            &context.arena,
            b::call(
                &context.arena,
                b::member_path(&context.arena, "$.replay_events"),
                vec![b::id(&node_id)],
            ),
        ));
    }

    // Clean child nodes - trim whitespace
    let preserve_whitespace =
        context.state.preserve_whitespace || node.name == "pre" || node.name == "textarea";

    // Determine namespace for children (handles svg, mathml, foreignObject)
    let child_namespace = determine_namespace_for_children(node, &context.state.metadata.namespace);

    // Save and update namespace for children
    let saved_namespace = std::mem::replace(
        &mut context.state.metadata.namespace,
        child_namespace.clone(),
    );

    let cleaned = clean_nodes(
        crate::compiler::phases::phase3_transform::utils::ParentRef::RegularElement(node),
        &node.fragment.nodes,
        &[], // path - not needed for our implementation
        &context.state.metadata.namespace,
        context.state.scope,
        context.state.analysis,
        preserve_whitespace || node.name == "script",
        context.state.options.preserve_comments,
    );

    // Check if there are any SnippetBlocks in the fragment
    // This affects how we handle child state
    let has_snippet_blocks = node
        .fragment
        .nodes
        .iter()
        .any(|n| matches!(n, TemplateNode::SnippetBlock(_)));

    // Always create a separate child state for processing children.
    // This matches the JS implementation which always creates:
    //   const child_state = { ...state, init: [], update: [], after_update: [], snippets: [] };
    // The child state is later merged back based on whether the fragment is dynamic or has snippets.
    let saved_child_init = std::mem::take(&mut context.state.init);
    let saved_child_update = std::mem::take(&mut context.state.update);
    let saved_child_after_update = std::mem::take(&mut context.state.after_update);
    let saved_child_snippets = std::mem::take(&mut context.state.snippets);

    // Propagate preserve_whitespace to child processing so that `pre`/`textarea`
    // whitespace is preserved for ExpressionTag/Text content within nested elements.
    // This mirrors the official compiler's state spread:
    //   preserve_whitespace: context.state.preserve_whitespace || name === 'pre' || name === 'textarea'
    let saved_preserve_whitespace = context.state.preserve_whitespace;
    context.state.preserve_whitespace = preserve_whitespace;

    // Process hoisted nodes (e.g., SnippetBlocks inside this element)
    // We increment the nesting level so place_snippet_declaration knows we're not at root
    context.state.template_nesting_level += 1;

    for hoisted_node in &cleaned.hoisted {
        context.visit_node(hoisted_node, None);
    }

    // Note: we keep nesting level incremented while processing children below

    // Check if we can use textContent optimization
    // This applies when:
    // 1. All children are Text or ExpressionTag
    // 2. All ExpressionTags are non-reactive (no has_state, no has_await, no blockers)
    // 3. At least one ExpressionTag exists (otherwise pure text is in template)
    let all_text_or_expr = cleaned.trimmed.iter().all(|n| {
        matches!(
            n.as_ref(),
            TemplateNode::Text(_) | TemplateNode::ExpressionTag(_)
        )
    });

    let has_expression_tag = cleaned
        .trimmed
        .iter()
        .any(|n| matches!(n.as_ref(), TemplateNode::ExpressionTag(_)));

    let all_expressions_static = cleaned.trimmed.iter().all(|n| {
        match n.as_ref() {
            TemplateNode::Text(_) => true,
            TemplateNode::ExpressionTag(expr_tag) => {
                // Check if expression is non-reactive AND has no non-pure calls.
                // Non-pure calls (to local functions) need to be in a template_effect
                // for proper execution context, so they can't use the textContent shortcut.
                //
                // Special case: $effect.pending() is inherently reactive (tracks async
                // pending state) even though it has no local bindings or transforms.
                // It must NOT use the textContent optimization - it needs to be in a
                // template_effect callback for proper reactivity. Phase 2's
                // narrow `has_call` (non-pure callee only) is what we want
                // here — pure calls like `(7.36).toString()` are still
                // eligible for the static textContent shortcut, while
                // `$effect.tracking()` / `$effect.pending()` correctly drop
                // out because Phase 2 marks them as has_call.
                !super::shared::utils::is_effect_pending_expr(
                    &expr_tag.expression,
                    context.state.parse_arena,
                ) && !expression_has_reactive_state(&expr_tag.expression, context)
                    && !expr_tag.metadata.expression.has_call()
            }
            _ => false,
        }
    });

    let use_text_content = all_text_or_expr && has_expression_tag && all_expressions_static;

    // (textContent optimization debug removed)

    // Track whether we used a code path that requires child_init to be merged
    // regardless of whether the children appear static.
    let mut force_merge_child_init = false;

    if use_text_content {
        // Convert children to TextOrExpr for build_template_chunk
        let values: Vec<TextOrExpr> = cleaned
            .trimmed
            .iter()
            .filter_map(|n| match n.as_ref() {
                TemplateNode::Text(t) => Some(TextOrExpr::Text(t.clone())),
                TemplateNode::ExpressionTag(e) => Some(TextOrExpr::Expr((**e).clone())),
                _ => None,
            })
            .collect();

        let result = build_template_chunk(&values, context);

        // Check if the result is an empty string literal
        let is_empty_string = matches!(&result.value, JsExpr::Literal(crate::compiler::phases::phase3_transform::js_ast::nodes::JsLiteral::String(s)) if s.is_empty());

        if !is_empty_string {
            // Set element.textContent = value
            context.state.init.push(b::stmt(
                &context.arena,
                b::assign(
                    &context.arena,
                    b::member(&context.arena, context.state.node.clone(), "textContent"),
                    result.value,
                ),
            ));
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

        // Create a separate template for the rich content.
        //
        // The hoisted template factory id is allocated lazily by
        // `transform_template` below (Svelte 5.56.0 #18320), so we only pass
        // the preferred base name (`<element>_content`) here. Reserving the
        // name up front would consume the slot even when an identical
        // template elsewhere in the component already supplies a deduped id,
        // causing `option_content_1_1` instead of the upstream `option_content`.
        let template_base = format!("{}_content", node.name);
        let fragment_id_name = context.state.memoizer.generate_id("fragment");
        let anchor_id_name = context.state.memoizer.generate_id("anchor");

        let fragment_id = b::id(&fragment_id_name);
        let anchor_id = b::id(&anchor_id_name);

        // Create a separate template for processing the rich content
        let select_template = Template::new();

        // Save current state and create new state for processing children in the separate template
        let saved_template = std::mem::replace(&mut context.state.template, select_template);
        let saved_init = std::mem::take(&mut context.state.init);
        let saved_update = std::mem::take(&mut context.state.update);
        let saved_after_update = std::mem::take(&mut context.state.after_update);

        // Process children with the new template
        let arena_ref2 = unsafe { &*(&context.arena as *const _) };
        process_children(
            &cleaned.trimmed,
            |is_text| {
                let mut args = vec![fragment_id.clone()];
                if is_text {
                    args.push(b::boolean(true));
                }
                b::call(
                    arena_ref2,
                    b::member_path(arena_ref2, "$.first_child"),
                    args,
                )
            },
            false, // Not an element - we're processing into a fragment
            context,
        );

        // Capture the init/update/after_update statements from processing children
        let child_init = std::mem::take(&mut context.state.init);
        let child_update = std::mem::take(&mut context.state.update);
        let child_after_update = std::mem::take(&mut context.state.after_update);

        // Route the select rich-content template through `transform_template`
        // (Svelte 5.56.0 #18320) so the hoisted `var <id> = $.from_html(...)`
        // declaration is deduplicated against identical templates elsewhere in
        // the component — matters when a <select> uses several `<option>`s with
        // identical comment-only content (`<!>`) which all share one factory
        // upstream. The base name (`<element>_content`) is unsuffixed; the
        // dedup-aware emitter inside `transform_template` allocates a fresh
        // unique id only when no cache hit exists.
        let template_id_expr = crate::compiler::phases::phase3_transform::client::transform_template::transform_template(
            &context.arena,
            &mut context.state,
            &template_base,
            crate::compiler::phases::phase3_transform::client::transform_template::Namespace::Html,
            Some(1u32),
            None,
        );
        // Use the returned identifier name for the body's factory call below.
        let template_name = match &template_id_expr {
            crate::compiler::phases::phase3_transform::js_ast::nodes::JsExpr::Identifier(name) => {
                name.to_string()
            }
            _ => template_base.clone(),
        };

        // Restore saved state (template + init/update/after_update) now that
        // the select template has been hoisted via the shared cache.
        let _ = std::mem::replace(&mut context.state.template, saved_template);
        let _ = select_template; // captured above for clarity, unused after hoist
        context.state.init = saved_init;
        context.state.update = saved_update;
        context.state.after_update = saved_after_update;

        // Build the rich content function body
        // The anchor is the child of the element (a hydration marker during hydration)
        let mut body_stmts = vec![
            b::var_decl(
                &context.arena,
                &anchor_id_name,
                Some(b::call(
                    &context.arena,
                    b::member_path(&context.arena, "$.child"),
                    vec![element_node.clone()],
                )),
            ),
            b::var_decl(
                &context.arena,
                &fragment_id_name,
                Some(b::call(&context.arena, b::id(&template_name), vec![])),
            ),
        ];
        body_stmts.extend(child_init);

        // Add template_effect if there are update statements
        if !child_update.is_empty() {
            // Use expression body for single expression statements, block body otherwise
            let effect_fn = if child_update.len() == 1 {
                if let JsStatement::Expression(expr_stmt) = &child_update[0] {
                    b::arrow(
                        &context.arena,
                        vec![],
                        context.arena.get_expr(expr_stmt.expression).clone(),
                    )
                } else {
                    b::arrow_block(vec![], child_update)
                }
            } else {
                b::arrow_block(vec![], child_update)
            };
            body_stmts.push(b::stmt(
                &context.arena,
                b::call(
                    &context.arena,
                    b::member_path(&context.arena, "$.template_effect"),
                    vec![effect_fn],
                ),
            ));
        }

        body_stmts.extend(child_after_update);
        body_stmts.push(b::stmt(
            &context.arena,
            b::call(
                &context.arena,
                b::member_path(&context.arena, "$.append"),
                vec![anchor_id.clone(), fragment_id.clone()],
            ),
        ));

        // Create the $.customizable_select() call
        let customizable_select_call = b::call(
            &context.arena,
            b::member_path(&context.arena, "$.customizable_select"),
            vec![element_node, b::arrow_block(vec![], body_stmts)],
        );

        context
            .state
            .init
            .push(b::stmt(&context.arena, customizable_select_call));
        force_merge_child_init = true;
    } else {
        // Process trimmed child nodes
        // These statements go directly into context.state (child_state in JS)
        let mut current_node = context.state.node.clone();

        // For <template> elements, needs_reset is always true and we need to call
        // $.hydrate_template() and use element.content as the child arg.
        // Reference: RegularElement.js lines 414-418
        let is_template_element = node.name == "template";
        if is_template_element {
            context.state.init.push(b::stmt(
                &context.arena,
                b::call(
                    &context.arena,
                    b::member_path(&context.arena, "$.hydrate_template"),
                    vec![current_node.clone()],
                ),
            ));
            current_node = b::member(&context.arena, current_node, "content");
        }

        let arena_ref3 = unsafe { &*(&context.arena as *const _) };
        process_children(
            &cleaned.trimmed,
            |is_text| {
                let mut args = vec![current_node.clone()];
                // Only include second argument if it's true
                if is_text {
                    args.push(b::boolean(true));
                }
                b::call(arena_ref3, b::member_path(arena_ref3, "$.child"), args)
            },
            true, // is_element
            context,
        );

        // Reset after processing children if needed
        // A reset is only needed if any child would actually advance the hydrate_node cursor.
        // Static elements don't advance the cursor, so they don't need a reset.
        // <template> elements always need reset.
        let needs_reset = is_template_element
            || cleaned.trimmed.iter().any(|n| {
                !matches!(n.as_ref(), TemplateNode::Text(_) | TemplateNode::Comment(_))
                    && !is_static_element(n.as_ref(), &context.state)
            });

        if needs_reset {
            context.state.init.push(b::stmt(
                &context.arena,
                b::call(
                    &context.arena,
                    b::member_path(&context.arena, "$.reset"),
                    vec![context.state.node.clone()],
                ),
            ));
        }
    }

    // Now handle child_state and element_state merging.
    // This matches the JS implementation at lines 440-459 in RegularElement.js:
    // - With snippets: wrap in a block
    // - Dynamic fragment: merge child_state + element_state
    // - Static fragment: only merge element_state (discard child_state)
    let child_snippets = std::mem::take(&mut context.state.snippets);
    let child_init = std::mem::take(&mut context.state.init);
    let child_update = std::mem::take(&mut context.state.update);
    let child_after_update = std::mem::take(&mut context.state.after_update);

    // Restore the parent state
    context.state.init = saved_child_init;
    context.state.update = saved_child_update;
    context.state.after_update = saved_child_after_update;
    context.state.snippets = saved_child_snippets;

    if has_snippet_blocks {
        // Wrap children in `{...}` to avoid declaration conflicts
        let mut block_body = Vec::new();
        block_body.extend(child_snippets);
        block_body.extend(child_init);
        block_body.extend(element_state_init);

        // Add template_effect for update statements
        if !child_update.is_empty() {
            block_body.push(b::stmt(
                &context.arena,
                b::call(
                    &context.arena,
                    b::member_path(&context.arena, "$.template_effect"),
                    vec![b::arrow_block(vec![], child_update)],
                ),
            ));
        }

        block_body.extend(child_after_update);
        block_body.extend(element_state_after_update);

        context.state.init.push(b::block(block_body));
    } else if force_merge_child_init
        || node.fragment.metadata.dynamic
        || has_dynamic_children_for_merge(&cleaned.trimmed, &context.state)
        || has_hoisted_init_producers(&cleaned.hoisted)
    {
        // Dynamic fragment: merge child_state.init + element_state.init
        context.state.init.extend(child_init);
        context.state.init.extend(element_state_init);
        context.state.update.extend(child_update);
        context.state.after_update.extend(child_after_update);
        context
            .state
            .after_update
            .extend(element_state_after_update);
    } else {
        // Static fragment: discard child_state (only $.next() from process_children),
        // only merge element_state
        context.state.init.extend(element_state_init);
        context
            .state
            .after_update
            .extend(element_state_after_update);
    }

    // Handle <selectedcontent> element
    // Corresponds to RegularElement.js lines 451-461
    if node.name == "selectedcontent" {
        let node_id = extract_node_id(&context.state.node);
        // $.selectedcontent(node_id, ($$element) => node_id = $$element)
        context.state.init.push(b::stmt(
            &context.arena,
            b::call(
                &context.arena,
                b::member_path(&context.arena, "$.selectedcontent"),
                vec![
                    b::id(&node_id),
                    b::arrow(
                        &context.arena,
                        vec![JsPattern::Identifier("$$element".into())],
                        b::assign(&context.arena, b::id(&node_id), b::id("$$element")),
                    ),
                ],
            ),
        ));
    }

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
            // Capture metadata for memoization (matching official compiler behavior)
            let mut synthetic_metadata = ExpressionMetadata::default();
            let result = build_attribute_value(&synthetic_attr_value, context, |expr, metadata| {
                synthetic_metadata = metadata.clone();
                expr
            });
            let meta_has_call = synthetic_metadata.has_call();
            let meta_has_await = synthetic_metadata.has_await();
            let memoized_value = context.state.memoizer.add(
                result.value,
                meta_has_call,
                meta_has_await,
                false,
                result.has_state,
            );

            build_element_special_value_attribute(
                &node.name,
                &node_id,
                memoized_value,
                result.has_state,
                true,  // synthetic = true
                false, // is_select_with_value = false (synthetic is for option)
                context,
            );
        } else {
            // Look for an explicit value attribute
            for attribute in &attributes {
                if let Attribute::Attribute(attr) = attribute
                    && attr.name == "value"
                {
                    // Capture metadata for memoization, matching the official Svelte compiler:
                    // `const { value, has_state } = build_attribute_value(attribute.value, context,
                    //   (value, metadata) => state.memoizer.add(value, metadata))`
                    // This ensures expressions like `test()` (function calls) are memoized to `$0`
                    // and the template_effect gets a dependency array like `[test]`.
                    let mut captured_metadata = ExpressionMetadata::default();
                    let result = build_attribute_value(&attr.value, context, |expr, metadata| {
                        captured_metadata = metadata.clone();
                        expr
                    });
                    let meta_has_call = captured_metadata.has_call();
                    let meta_has_await = captured_metadata.has_await();
                    // Memoize the value when needed (has_call or has_await),
                    // following the JS Memoizer.add() logic.
                    let memoized_value = context.state.memoizer.add(
                        result.value,
                        meta_has_call,
                        meta_has_await,
                        false,
                        result.has_state,
                    );

                    // For select elements: attribute.value !== true && !is_text_attribute(attribute)
                    // means a non-text value attribute on a select element
                    let is_select_with_value = node.name == "select"
                        && !matches!(&attr.value, AttributeValue::True(_))
                        && !is_text_attribute(attr);

                    build_element_special_value_attribute(
                        &node.name,
                        &node_id,
                        memoized_value,
                        result.has_state,
                        false, // synthetic = false
                        is_select_with_value,
                        context,
                    );

                    // For select elements with value, add $.init_select(node)
                    if is_select_with_value {
                        context.state.init.push(b::stmt(
                            &context.arena,
                            b::call(
                                &context.arena,
                                b::member(&context.arena, b::id("$"), "init_select"),
                                vec![b::id(&node_id)],
                            ),
                        ));
                    }

                    break;
                }
            }
        }
    }

    // Handle dir attribute re-assignment for Chromium compatibility
    // Reference: RegularElement.js lines 463-468
    // When an element has a dir attribute, we need to re-assign it to fix a
    // Chromium issue where updates to text content don't update the direction.
    let has_dir_attribute = node
        .attributes
        .iter()
        .any(|attr| matches!(attr, Attribute::Attribute(a) if a.name == "dir"));
    if has_dir_attribute {
        let node_id = extract_node_id(&context.state.node);
        let dir_member = b::member(&context.arena, b::id(&node_id), "dir");
        context.state.update.push(b::stmt(
            &context.arena,
            b::assign(&context.arena, dir_member.clone(), dir_member),
        ));
    }

    // Decrement nesting level (we incremented it before processing hoisted nodes)
    context.state.template_nesting_level -= 1;

    // Restore preserve_whitespace after processing children
    context.state.preserve_whitespace = saved_preserve_whitespace;

    // Restore namespace after processing children
    context.state.metadata.namespace = saved_namespace;

    // Restore original transforms that were saved before let: directives
    for (name, saved) in &let_directive_result.saved_transforms {
        if let Some(original_transform) = saved {
            context
                .state
                .transform
                .insert(name.clone(), original_transform.clone());
        } else {
            context.state.transform.remove(name);
        }
    }
    context.state.transform_deep_read = let_directive_result.saved_transform_deep_read;

    context.state.template.pop_element();
    TransformResult::None
}

/// Check if any hoisted nodes produce init statements.
///
/// DebugTag nodes are hoisted during clean_nodes but produce `$.template_effect` init
/// statements when visited. In the official compiler, the Identifier visitor sets
/// `fragment.metadata.dynamic = true` when identifiers are referenced, which ensures
/// child_init is merged. Since our Phase 2 analysis doesn't mutate the AST to set
/// this flag (immutable references), we check for DebugTag presence as a fallback.
fn has_hoisted_init_producers(hoisted: &[Cow<'_, TemplateNode>]) -> bool {
    hoisted
        .iter()
        .any(|n| matches!(n.as_ref(), TemplateNode::DebugTag(_)))
}

/// Check if any trimmed children are dynamic (non-static, non-text).
/// This is a fallback for when `fragment.metadata.dynamic` isn't reliably set.
/// It mirrors the logic in the official compiler where child_state.init is only
/// merged when the fragment is dynamic.
fn has_dynamic_children_for_merge(
    trimmed: &[Cow<'_, TemplateNode>],
    state: &ComponentClientTransformState,
) -> bool {
    trimmed.iter().any(|n| {
        !matches!(n.as_ref(), TemplateNode::Text(_) | TemplateNode::Comment(_))
            && !is_static_element(n.as_ref(), state)
    })
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
/// For HTML elements (non-SVG, non-MathML), attribute names are lowercased
/// and mapped through ATTRIBUTE_ALIASES (e.g., ASYNC -> async, READONLY -> readOnly).
/// Reference: svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/element.js
fn get_attribute_name(node: &RegularElementNode, attr: &AttributeNode) -> String {
    if !node.metadata.svg && !node.metadata.mathml {
        normalize_attribute_string(&attr.name)
    } else {
        attr.name.to_string()
    }
}

/// Check if an attribute cannot be set statically in the template.
/// These attributes need special JavaScript handling at runtime.
///
/// Corresponds to NON_STATIC_PROPERTIES in:
/// svelte/packages/svelte/src/utils.js
fn cannot_be_set_statically(name: &str) -> bool {
    // Only these attributes are unconditionally non-static
    // Other attributes like value, checked, selected are handled conditionally
    // based on the element type (see is_static_attribute)
    matches!(
        name,
        "autofocus" | "muted" | "defaultValue" | "defaultChecked" | "inert"
    )
}

/// Check if an element emits `load` and `error` events.
/// Reference: svelte/src/utils.js - LOAD_ERROR_ELEMENTS
fn is_load_error_element(name: &str) -> bool {
    matches!(
        name,
        "body" | "embed" | "iframe" | "img" | "link" | "object" | "script" | "style" | "track"
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

/// Normalize attribute name to DOM property name (returns owned String).
/// Lowercases the name and maps through ATTRIBUTE_ALIASES.
/// Reference: svelte/packages/svelte/src/utils.js ATTRIBUTE_ALIASES and normalize_attribute
fn normalize_attribute_string(name: &str) -> String {
    // Use case-insensitive comparison to avoid allocating a lowercase copy.
    // Match on length first to minimize comparisons.
    match name.len() {
        5 if name.eq_ignore_ascii_case("ismap") => "isMap".to_string(),
        8 if name.eq_ignore_ascii_case("readonly") => "readOnly".to_string(),
        8 if name.eq_ignore_ascii_case("nomodule") => "noModule".to_string(),
        9 if name.eq_ignore_ascii_case("srcobject") => "srcObject".to_string(),
        10 if name.eq_ignore_ascii_case("novalidate") => "noValidate".to_string(),
        11 if name.eq_ignore_ascii_case("playsinline") => "playsInline".to_string(),
        12 if name.eq_ignore_ascii_case("defaultvalue") => "defaultValue".to_string(),
        14 if name.eq_ignore_ascii_case("defaultchecked") => "defaultChecked".to_string(),
        14 if name.eq_ignore_ascii_case("formnovalidate") => "formNoValidate".to_string(),
        15 if name.eq_ignore_ascii_case("allowfullscreen") => "allowFullscreen".to_string(),
        21 if name.eq_ignore_ascii_case("disableremoteplayback") => {
            "disableRemotePlayback".to_string()
        }
        23 if name.eq_ignore_ascii_case("disablepictureinpicture") => {
            "disablePictureInPicture".to_string()
        }
        _ => {
            // Only allocate a new string if there are uppercase chars
            if name.bytes().any(|b| b.is_ascii_uppercase()) {
                name.to_lowercase()
            } else {
                name.to_string()
            }
        }
    }
}

/// Normalize attribute name to DOM property name (returns &str reference).
/// For cases where the result doesn't need to be owned.
/// Reference: svelte/packages/svelte/src/utils.js ATTRIBUTE_ALIASES and normalize_attribute
fn normalize_attribute(name: &str) -> &str {
    // Use case-insensitive comparison to avoid allocating a lowercase copy.
    // Match on length first to minimize comparisons.
    match name.len() {
        5 if name.eq_ignore_ascii_case("ismap") => "isMap",
        8 if name.eq_ignore_ascii_case("readonly") => "readOnly",
        8 if name.eq_ignore_ascii_case("nomodule") => "noModule",
        9 if name.eq_ignore_ascii_case("srcobject") => "srcObject",
        10 if name.eq_ignore_ascii_case("novalidate") => "noValidate",
        11 if name.eq_ignore_ascii_case("playsinline") => "playsInline",
        12 if name.eq_ignore_ascii_case("defaultvalue") => "defaultValue",
        14 if name.eq_ignore_ascii_case("defaultchecked") => "defaultChecked",
        14 if name.eq_ignore_ascii_case("formnovalidate") => "formNoValidate",
        15 if name.eq_ignore_ascii_case("allowfullscreen") => "allowFullscreen",
        21 if name.eq_ignore_ascii_case("disableremoteplayback") => "disableRemotePlayback",
        23 if name.eq_ignore_ascii_case("disablepictureinpicture") => "disablePictureInPicture",
        _ => name,
    }
}

/// Check if a name is a DOM property (vs attribute).
/// Reference: svelte/packages/svelte/src/utils.js DOM_PROPERTIES
/// DOM_PROPERTIES includes all DOM_BOOLEAN_ATTRIBUTES plus additional properties.
fn is_dom_property(name: &str) -> bool {
    matches!(
        name,
        // DOM_BOOLEAN_ATTRIBUTES (lowercase, as returned by normalize_attribute)
        "allowfullscreen"
            | "async"
            | "autofocus"
            | "autoplay"
            | "checked"
            | "controls"
            | "default"
            | "disabled"
            | "formnovalidate"
            | "indeterminate"
            | "inert"
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
            | "seamless"
            | "selected"
            | "webkitdirectory"
            | "defer"
            | "disablepictureinpicture"
            | "disableremoteplayback"
            // Additional DOM_PROPERTIES (camelCase aliases from normalize_attribute)
            | "formNoValidate"
            | "isMap"
            | "noModule"
            | "playsInline"
            | "readOnly"
            | "value"
            | "volume"
            | "defaultValue"
            | "defaultChecked"
            | "srcObject"
            | "noValidate"
            | "allowFullscreen"
            | "disablePictureInPicture"
            | "disableRemotePlayback"
            // Additional common DOM properties
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
        JsExpr::Identifier(name) => name.to_string(),
        _ => "node".to_string(),
    }
}

/// Build element attribute update expression.
/// The `name` parameter should already be normalized via `get_attribute_name()`.
fn build_element_attribute_update(
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,

    element: &RegularElementNode,
    node_id: &str,
    name: &str,
    value: JsExpr,
    attributes: &[&Attribute],
    dev: bool,
) -> JsExpr {
    // Special case: muted (Firefox needs property assignment)
    if name == "muted" {
        return b::assign(arena, b::member(arena, b::id(node_id), "muted"), value);
    }

    // Special case: value
    if name == "value" {
        return b::call(
            arena,
            b::member_path(arena, "$.set_value"),
            vec![b::id(node_id), value],
        );
    }

    // Special case: checked
    if name == "checked" {
        return b::call(
            arena,
            b::member_path(arena, "$.set_checked"),
            vec![b::id(node_id), value],
        );
    }

    // Special case: selected
    if name == "selected" {
        return b::call(
            arena,
            b::member_path(arena, "$.set_selected"),
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
                arena,
                b::member_path(arena, "$.set_default_value"),
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
                arena,
                b::member_path(arena, "$.set_default_checked"),
                vec![b::id(node_id), value],
            );
        }
    }

    // DOM property (name is already normalized, e.g., "async", "defer", "required")
    if is_dom_property(name) {
        return b::assign(arena, b::member(arena, b::id(node_id), name), value);
    }

    // Regular attribute (use normalized name for HTML attribute)
    let set_fn = if name.starts_with("xlink") {
        "$.set_xlink_attribute"
    } else {
        "$.set_attribute"
    };

    let mut args = vec![b::id(node_id), b::string(name), value];
    if dev
        && element
            .metadata
            .ignored_codes
            .iter()
            .any(|c| c == "hydration_attribute_changed")
    {
        args.push(b::boolean(true));
    }

    b::call(arena, b::member_path(arena, set_fn), args)
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
                        && !is_svelte_whitespace_only(&text.data)
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
            | TemplateNode::DeclarationTag(_)
            | TemplateNode::Comment(_)
            | TemplateNode::ExpressionTag(_) => {}

            // Text nodes: yield if non-whitespace
            TemplateNode::Text(text) => {
                if !is_svelte_whitespace_only(&text.data) {
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

/// Checks if a transformed value expression is guaranteed to be defined (not undefined).
/// Approximates scope.evaluate().is_defined from the official compiler.
/// In the official compiler, is_defined is false when value == null (loose comparison)
/// or when value is UNKNOWN. So null and undefined are not defined, and any
/// unresolvable expression is also not defined.
///
/// When `scope_root` is provided, identifiers are resolved to their bindings. If a binding
/// is not updated (neither reassigned nor mutated), not a prop, and has `initial_is_defined`
/// set, the identifier is considered defined. This mirrors the official compiler's
/// `scope.evaluate()` behavior which recurses into binding initial values.
fn is_value_known_defined(
    value: &JsExpr,
    scope_root: Option<&crate::compiler::phases::phase2_analyze::scope::ScopeRoot>,
) -> bool {
    match value {
        // null and undefined literals are explicitly not defined
        JsExpr::Literal(JsLiteral::Null) => false,
        JsExpr::Literal(JsLiteral::Undefined) => false,
        // void expressions (void 0) are undefined
        JsExpr::Void(_) => false,
        // Known defined literals: numbers, strings, booleans, regex
        JsExpr::Literal(JsLiteral::Number(_)) => true,
        JsExpr::Literal(JsLiteral::String(_)) => true,
        JsExpr::Literal(JsLiteral::Boolean(_)) => true,
        JsExpr::Literal(JsLiteral::Regex { .. }) => true,
        // Arrays and objects are always defined
        JsExpr::Array(_) => true,
        JsExpr::Object(_) => true,
        // Template literals are always strings (defined)
        JsExpr::TemplateLiteral(_) => true,
        // For identifiers: look up the binding to check if the initial value is defined.
        // This mirrors the official compiler's scope.evaluate() which, for identifiers,
        // checks if the binding is not updated, has an initial value, and is not a prop,
        // then recursively evaluates the initial value.
        JsExpr::Identifier(name) => {
            if let Some(root) = scope_root
                && let Some(binding_idx) = root.find_binding_any_scope(name)
                && let Some(binding) = root.bindings.get(binding_idx)
            {
                use crate::compiler::phases::phase2_analyze::scope::BindingKind;
                let is_prop = matches!(
                    binding.kind,
                    BindingKind::Prop | BindingKind::RestProp | BindingKind::BindableProp
                );
                let is_updated = binding.reassigned || binding.mutated;
                if !is_updated && !is_prop && binding.initial_is_defined {
                    return true;
                }
            }
            false
        }
        // Everything else: calls, member access, $.get() - treat as UNKNOWN (not defined)
        _ => false,
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
    is_select_with_value: bool,
    context: &mut ComponentContext,
) {
    // The `value` parameter is already transformed (comes from build_attribute_value which
    // applies build_expression -> apply_transforms_to_expression). Do NOT apply transforms
    // again here, as that would cause double-transformation (e.g., value() -> value()()).
    let transformed_value = value;

    // Check if the value is defined (i.e., guaranteed to not be null/undefined)
    // The official compiler uses scope.evaluate(value).is_defined which checks if
    // value == null || value === UNKNOWN. We approximate this:
    // - Literal null/undefined: NOT defined (null == null is true in JS)
    // - Known literals (numbers, strings, booleans): defined
    // - Everything else (identifiers, calls, reactive values): NOT defined (could be UNKNOWN)
    // Reference: svelte/packages/svelte/src/compiler/phases/scope.js L574
    let value_is_defined =
        is_value_known_defined(&transformed_value, Some(context.state.scope_root));

    // node.__value = transformed_value
    let assignment = b::assign(
        &context.arena,
        b::member(&context.arena, b::id(node_id), "__value"),
        transformed_value.clone(),
    );

    // For non-synthetic values: node.value = (node.__value = transformed_value) ?? ''
    // If value is defined, skip the ?? '' fallback
    // For synthetic values: just node.__value = transformed_value
    let set_value_assignment = if synthetic {
        assignment.clone()
    } else {
        let inner = if value_is_defined {
            assignment.clone()
        } else {
            // Wrap with ?? '' for potentially undefined values
            b::nullish(&context.arena, assignment.clone(), b::string(""))
        };
        b::assign(
            &context.arena,
            b::member(&context.arena, b::id(node_id), "value"),
            inner,
        )
    };

    // For select elements with value, wrap in sequence: (set_value_assignment, $.select_option(node, value))
    let update = if is_select_with_value {
        b::stmt(
            &context.arena,
            b::sequence(vec![
                set_value_assignment,
                b::call(
                    &context.arena,
                    b::member_path(&context.arena, "$.select_option"),
                    vec![b::id(node_id), transformed_value.clone()],
                ),
            ]),
        )
    } else if synthetic {
        b::stmt(&context.arena, assignment)
    } else {
        b::stmt(&context.arena, set_value_assignment)
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
        context
            .state
            .init
            .push(b::var_decl(&context.arena, &value_id, init_value));

        // Create the comparison: value_id !== (value_id = transformed_value)
        let comparison = b::binary_str(
            &context.arena,
            "!==",
            b::id(&value_id),
            b::assign(&context.arena, b::id(&value_id), transformed_value.clone()),
        );

        // Create the if statement: if (comparison) { update }
        // b::if_stmt takes (test, consequent, alternate)
        let if_statement = b::if_stmt(&context.arena, comparison, b::block(vec![update]), None);

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
