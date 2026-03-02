//! BindDirective visitor for client-side transformation.
//!
//! Corresponds to `BindDirective.js` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/BindDirective.js`.
//!
//! This visitor handles bind: directives like:
//! - `bind:value` - two-way binding for input values
//! - `bind:checked` - two-way binding for checkboxes
//! - `bind:group` - radio/checkbox group binding
//! - `bind:this` - DOM element reference binding
//! - `bind:clientWidth/clientHeight` - element dimension bindings
//! - `bind:innerHTML/innerText/textContent` - content bindings
//! - Media bindings (currentTime, volume, paused, etc.)
//! - Window/document bindings (scrollX, scrollY, online, etc.)

use std::collections::HashSet;

use crate::ast::js::Expression;
use crate::ast::template::{
    Attribute, AttributeValue, AttributeValuePart, BindDirective, TemplateNode,
};
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;

// Note: We implement bind_this directly here rather than using shared/utils
// to avoid complex borrow checker issues with the context

/// Binding property configuration.
///
/// Corresponds to `binding_properties` in
/// `svelte/packages/svelte/src/compiler/phases/bindings.js`.
#[derive(Debug, Clone, Default)]
pub struct BindingProperty {
    /// The event that notifies of a change to the property
    pub event: Option<&'static str>,
    /// Whether updates are written to the DOM property
    pub bidirectional: bool,
    /// Whether the binding should be omitted in SSR
    pub omit_in_ssr: bool,
}

/// Build a `$.bind_this(value, setter, getter, values_thunk)` call.
///
/// Port of the reference `build_bind_this` from `shared/utils.js`.
/// Handles simple identifiers, sequence expressions, and each-block context variables.
/// Called by both element `bind:this` (line ~160) and component `bind:this` (component.rs).
///
/// `is_element_binding` should be true when binding to a RegularElement (not a component).
/// This prevents the proxy flag from being added, since element references are always
/// primitive (DOM nodes). Matches the official compiler's `is_primitive` check.
pub fn unified_build_bind_this(
    expression: &Expression,
    value: JsExpr,
    context: &mut ComponentContext,
    is_element_binding: bool,
) -> JsExpr {
    use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::{
        apply_transforms_to_expression, apply_transforms_to_expression_with_shadowed,
    };

    let raw_expr = convert_expression(expression, context);

    let (getter_expr, setter_expr) = if let JsExpr::Sequence(ref seq) = raw_expr {
        if seq.expressions.len() == 2 {
            (
                Some(seq.expressions[0].clone()),
                Some(seq.expressions[1].clone()),
            )
        } else {
            (None, None)
        }
    } else {
        (None, None)
    };

    let walk_expr = getter_expr.as_ref().unwrap_or(&raw_expr);
    let each_ids = find_each_block_ids_in_expr(walk_expr, context);

    let values: Vec<JsExpr> = each_ids
        .iter()
        .map(|id| apply_transforms_to_expression(&JsExpr::Identifier(id.name.clone()), context))
        .collect();

    let local_scope =
        crate::compiler::phases::phase3_transform::client::visitors::shared::utils::LocalScope::from_shadowed(
            each_ids.iter().map(|id| id.name.clone()),
        );

    let getter_raw = getter_expr.as_ref().unwrap_or(&raw_expr);
    let mut get = apply_transforms_to_expression_with_shadowed(getter_raw, context, &local_scope);

    let setter_raw = if let Some(ref s) = setter_expr {
        s.clone()
    } else {
        b::assign(raw_expr.clone(), b::id("$$value"))
    };

    // For bind:this on regular elements, the value being assigned is always a DOM element
    // reference, which should never be proxied. This matches the official Svelte compiler's
    // behavior where `is_primitive = path.at(-1) === 'BindDirective' && path.at(-2) === 'RegularElement'`
    // prevents the proxy flag from being added.
    // For bind:this on components, the value may need proxy (e.g., bind-this-proxy test).
    let binding_name_for_skip = if is_element_binding {
        if let JsExpr::Identifier(name) = &raw_expr {
            Some(name.clone())
        } else {
            None
        }
    } else {
        None
    };
    let old_skip_proxy = if let Some(ref name) = binding_name_for_skip {
        if let Some(transform) = context.state.transform.get(name) {
            let old = transform.skip_proxy;
            let mut t = transform.clone();
            t.skip_proxy = true;
            context.state.transform.insert(name.clone(), t);
            Some(old)
        } else {
            None
        }
    } else {
        None
    };

    let mut set = apply_transforms_to_expression_with_shadowed(&setter_raw, context, &local_scope);

    // In legacy mode, when bind:this is inside an each block AND the expression's root
    // object is an each item variable (e.g., bind:this={item.ref}), the setter needs to
    // include $.invalidate_inner_signals() to properly propagate changes.
    //
    // This does NOT apply when the root object is a different variable (e.g.,
    // bind:this={items1[item.id]} where items1 is a state variable - item is only used
    // in the computed property access, not as the mutation target).
    //
    // The official compiler achieves this through the `mutate` transform on the each item
    // variable, but our `local_scope` shadows the each item transforms. So we add the
    // invalidation wrapping directly here.
    //
    // Expected output: ($$value, item) => (item.ref = $$value, $.invalidate_inner_signals(() => (items())))
    if !context.state.analysis.runes && !each_ids.is_empty() {
        // Check if the bind:this expression's root object is an each item variable
        let expr_root = get_expression_root_identifier(&raw_expr);
        if let Some(ref root_name) = expr_root
            && let Some(each_ctx) = context
                .state
                .each_binding_context
                .iter()
                .rev()
                .find(|ctx| ctx.item_name == *root_name)
            && !each_ctx.invalidation_exprs.is_empty()
        {
            // Mark that an each item was mutated. In the official compiler, this
            // happens via the `mutate` transform callback which sets `uses_index = true`.
            // Since our local_scope shadows the each item transforms, the mutation
            // isn't detected by apply_transforms_to_expression_with_shadowed.
            // We must set this flag here so that the each block callback includes
            // the $$index and $$array parameters.
            context.state.each_item_assign_or_mutate.set(true);

            let invalidation_exprs = each_ctx.invalidation_exprs.clone();
            let invalidation_inner_exprs: Vec<JsExpr> = invalidation_exprs
                .iter()
                .map(|s| JsExpr::Raw(s.clone()))
                .collect();
            let inner = b::sequence(invalidation_inner_exprs);
            let invalidate_call = b::call(
                b::member_path("$.invalidate_inner_signals"),
                vec![b::thunk(inner)],
            );
            set = b::sequence(vec![set, invalidate_call]);
        }
    }

    // Restore the original skip_proxy value
    if let Some(ref name) = binding_name_for_skip
        && let Some(old) = old_skip_proxy
        && let Some(transform) = context.state.transform.get(name)
    {
        let mut t = transform.clone();
        t.skip_proxy = old;
        context.state.transform.insert(name.clone(), t);
    }

    // Apply optional chaining to getter MemberExpression nodes only
    if let JsExpr::Member(_) = &get {
        fn make_optional(expr: &mut JsExpr) {
            if let JsExpr::Member(member) = expr {
                member.optional = true;
                make_optional(&mut member.object);
            }
        }
        make_optional(&mut get);
    }

    let id_params: Vec<JsPattern> = each_ids.iter().map(|id| b::id_pattern(&id.name)).collect();

    get = match get {
        JsExpr::Arrow(arrow) => {
            let mut params = Vec::new();
            params.extend(id_params.clone());
            params.extend(arrow.params);
            JsExpr::Arrow(JsArrowFunction {
                params,
                body: arrow.body,
                is_async: arrow.is_async,
            })
        }
        other => {
            if getter_expr.is_some() {
                other
            } else {
                b::arrow(id_params.clone(), other)
            }
        }
    };

    set = match set {
        JsExpr::Arrow(arrow) => {
            let mut params = Vec::new();
            if let Some(first) = arrow.params.first() {
                params.push(first.clone());
            } else {
                params.push(b::id_pattern("_"));
            }
            params.extend(id_params.clone());
            for p in arrow.params.iter().skip(1) {
                params.push(p.clone());
            }
            JsExpr::Arrow(JsArrowFunction {
                params,
                body: arrow.body,
                is_async: arrow.is_async,
            })
        }
        other => {
            if setter_expr.is_some() {
                other
            } else {
                let mut params = vec![b::id_pattern("$$value")];
                params.extend(id_params);
                b::arrow(params, other)
            }
        }
    };

    let mut args = vec![value, set, get];

    if !values.is_empty() {
        let values_thunk = b::arrow(
            vec![],
            JsExpr::Array(JsArrayExpression {
                elements: values.into_iter().map(Some).collect(),
            }),
        );
        args.push(values_thunk);
    }

    b::call(b::member_path("$.bind_this"), args)
}

/// Get binding property configuration for a given binding name.
///
/// Returns Some(BindingProperty) if this is a known binding with special handling,
/// None for bindings that use the switch-based special case handling.
fn get_binding_property(name: &str) -> Option<BindingProperty> {
    match name {
        // Media bindings with events
        "duration" => Some(BindingProperty {
            event: Some("durationchange"),
            omit_in_ssr: true,
            ..Default::default()
        }),
        // Video dimensions
        "videoHeight" | "videoWidth" => Some(BindingProperty {
            event: Some("resize"),
            omit_in_ssr: true,
            ..Default::default()
        }),
        // Image dimensions
        "naturalWidth" | "naturalHeight" => Some(BindingProperty {
            event: Some("load"),
            omit_in_ssr: true,
            ..Default::default()
        }),
        // Document bindings
        "fullscreenElement" => Some(BindingProperty {
            event: Some("fullscreenchange"),
            omit_in_ssr: true,
            ..Default::default()
        }),
        "pointerLockElement" => Some(BindingProperty {
            event: Some("pointerlockchange"),
            omit_in_ssr: true,
            ..Default::default()
        }),
        "visibilityState" => Some(BindingProperty {
            event: Some("visibilitychange"),
            omit_in_ssr: true,
            ..Default::default()
        }),
        // Window size (with event)
        "devicePixelRatio" => Some(BindingProperty {
            event: Some("resize"),
            omit_in_ssr: true,
            ..Default::default()
        }),
        // Checkbox indeterminate
        "indeterminate" => Some(BindingProperty {
            event: Some("change"),
            bidirectional: true,
            omit_in_ssr: true,
        }),
        // Details open
        "open" => Some(BindingProperty {
            event: Some("toggle"),
            bidirectional: true,
            omit_in_ssr: false,
        }),
        // Default: no special event handling, use switch-based logic
        _ => None,
    }
}

/// Visit a BindDirective node.
///
/// Corresponds to `BindDirective()` function in BindDirective.js.
///
/// # Arguments
///
/// * `node` - The BindDirective AST node
/// * `context` - The component context
/// * `parent` - The parent node (RegularElement, Component, etc.)
///
/// # Returns
///
/// Returns a TransformResult indicating what was generated.
pub fn bind_directive(
    node: &BindDirective,
    context: &mut ComponentContext,
    parent: Option<&TemplateNode>,
) -> TransformResult {
    let binding_name = node.name.as_str();

    // Visit the expression to transform it using the full expression converter
    // (supports ArrowFunctionExpression, MemberExpression, etc.)
    let expression = convert_expression(&node.expression, context);

    // Check if it's a sequence expression (getter/setter pair)
    let (get, set) = if is_sequence_expression(&expression) {
        let (raw_get, raw_set) = extract_getter_setter(&expression);
        // For sequence expressions (user-provided getter/setter pair), the getter
        // needs read transforms applied (e.g., wrapping $state vars with $.get()).
        // The setter already has assignment transforms from convert_expression
        // (e.g., time = value → $.set(time, value, true)), so we only transform the getter.
        use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::apply_transforms_to_expression;
        let transformed_get = apply_transforms_to_expression(&raw_get, context);
        (transformed_get, raw_set)
    } else if binding_name == "this" {
        // bind:this is handled specially below in build_special_binding_call
        build_getter_setter(&node.expression, &expression, context)
    } else if let Some(each_result) =
        build_each_block_getter_setter(&node.expression, &expression, context)
    {
        // Inside an each block - use the each-block-aware getter/setter
        each_result
    } else {
        // Build getter and setter from the expression
        build_getter_setter(&node.expression, &expression, context)
    };

    // Get binding property configuration
    let property = get_binding_property(binding_name);

    // Generate the appropriate binding call
    // bind:this uses the unified implementation that handles each-block context properly
    let call = if binding_name == "this" {
        let is_element = is_regular_element(parent);
        unified_build_bind_this(
            &node.expression,
            context.state.node.clone(),
            context,
            is_element,
        )
    } else if let Some(prop) = property {
        if let Some(event) = prop.event {
            // Use bind_property for bindings with events
            build_bind_property_call(
                binding_name,
                event,
                &context.state.node,
                &get,
                &set,
                prop.bidirectional,
            )
        } else {
            // Fall through to special cases
            build_special_binding_call(
                binding_name,
                &get,
                &set,
                context,
                parent,
                Some(&node.expression),
            )
        }
    } else {
        // Special cases handled by switch
        build_special_binding_call(
            binding_name,
            &get,
            &set,
            context,
            parent,
            Some(&node.expression),
        )
    };

    // Check if we need to defer the binding (when element has use: directive)
    let defer = binding_name != "this" && is_regular_element(parent) && has_use_directive(parent);

    // Wrap in effect if deferred
    let statement = if defer {
        b::stmt(b::call(
            b::member_path("$.effect"),
            vec![b::thunk(call.clone())],
        ))
    } else {
        b::stmt(call.clone())
    };

    // TODO: Handle async expressions with blockers
    // if node.metadata.expression.is_async() {
    //     statement = b::stmt(b::call(
    //         b::member_path("$.run_after_blockers"),
    //         vec![
    //             node.metadata.expression.blockers(),
    //             b::thunk_block(vec![statement]),
    //         ],
    //     ));
    // }

    // Bindings need to happen after attribute updates, in order with events/actions.
    // bind:this is special as it's one-way and could influence the render effect.
    // Bindings need to happen after attribute updates, in order with events/actions.
    // bind:this is special as it's one-way and could influence the render effect.
    if binding_name == "this" || defer {
        context.state.init.push(statement);
    } else {
        context.state.after_update.push(statement);
    }

    TransformResult::None
}

/// Build the appropriate binding call for special cases.
fn build_special_binding_call(
    name: &str,
    get: &JsExpr,
    set: &Option<JsExpr>,
    context: &mut ComponentContext,
    parent: Option<&TemplateNode>,
    directive_expr: Option<&Expression>,
) -> JsExpr {
    // Clone node_expr before the match to avoid borrow checker issues
    let node_expr = context.state.node.clone();
    let set_or_get = set.clone().unwrap_or_else(|| get.clone());

    match name {
        // Window bindings
        "online" => b::call(b::member_path("$.bind_online"), vec![set_or_get]),

        "scrollX" | "scrollY" => {
            let axis = if name == "scrollX" { "x" } else { "y" };
            let mut args = vec![b::string(axis), get.clone()];
            if let Some(s) = set {
                args.push(s.clone());
            }
            b::call(b::member_path("$.bind_window_scroll"), args)
        }

        "innerWidth" | "innerHeight" | "outerWidth" | "outerHeight" => b::call(
            b::member_path("$.bind_window_size"),
            vec![b::string(name), set_or_get],
        ),

        // Document bindings
        "activeElement" => b::call(b::member_path("$.bind_active_element"), vec![set_or_get]),

        // Media bindings
        "muted" => {
            let mut args = vec![node_expr.clone(), get.clone()];
            if let Some(s) = set {
                args.push(s.clone());
            }
            b::call(b::member_path("$.bind_muted"), args)
        }

        "paused" => {
            let mut args = vec![node_expr.clone(), get.clone()];
            if let Some(s) = set {
                args.push(s.clone());
            }
            b::call(b::member_path("$.bind_paused"), args)
        }

        "volume" => {
            let mut args = vec![node_expr.clone(), get.clone()];
            if let Some(s) = set {
                args.push(s.clone());
            }
            b::call(b::member_path("$.bind_volume"), args)
        }

        "playbackRate" => {
            let mut args = vec![node_expr.clone(), get.clone()];
            if let Some(s) = set {
                args.push(s.clone());
            }
            b::call(b::member_path("$.bind_playback_rate"), args)
        }

        "currentTime" => {
            let mut args = vec![node_expr.clone(), get.clone()];
            if let Some(s) = set {
                args.push(s.clone());
            }
            b::call(b::member_path("$.bind_current_time"), args)
        }

        "buffered" => b::call(
            b::member_path("$.bind_buffered"),
            vec![node_expr.clone(), set_or_get],
        ),

        "played" => b::call(
            b::member_path("$.bind_played"),
            vec![node_expr.clone(), set_or_get],
        ),

        "seekable" => b::call(
            b::member_path("$.bind_seekable"),
            vec![node_expr.clone(), set_or_get],
        ),

        "seeking" => b::call(
            b::member_path("$.bind_seeking"),
            vec![node_expr.clone(), set_or_get],
        ),

        "ended" => b::call(
            b::member_path("$.bind_ended"),
            vec![node_expr.clone(), set_or_get],
        ),

        "readyState" => b::call(
            b::member_path("$.bind_ready_state"),
            vec![node_expr.clone(), set_or_get],
        ),

        // Resize observer bindings
        "contentRect" | "contentBoxSize" | "borderBoxSize" | "devicePixelContentBoxSize" => {
            b::call(
                b::member_path("$.bind_resize_observer"),
                vec![node_expr.clone(), b::string(name), set_or_get],
            )
        }

        // Element dimensions
        "clientWidth" | "clientHeight" | "offsetWidth" | "offsetHeight" => b::call(
            b::member_path("$.bind_element_size"),
            vec![node_expr.clone(), b::string(name), set_or_get],
        ),

        // Value binding (input/textarea/select)
        "value" => {
            // Check if parent is a select element
            let is_select = matches!(parent, Some(TemplateNode::RegularElement(elem)) if elem.name.as_str() == "select");

            if is_select {
                let mut args = vec![node_expr.clone(), get.clone()];
                if let Some(s) = set {
                    args.push(s.clone());
                }
                // Add $.invalidate_store for store bindings in each blocks
                if let Some(store_name) = get_store_to_invalidate_from_context(context) {
                    args.push(JsExpr::Raw(format!(
                        "$.invalidate_store($$stores, '{}')",
                        store_name
                    )));
                }
                b::call(b::member_path("$.bind_select_value"), args)
            } else {
                let mut args = vec![node_expr.clone(), get.clone()];
                if let Some(s) = set {
                    args.push(s.clone());
                }
                // Add $.invalidate_store for store bindings in each blocks
                if let Some(store_name) = get_store_to_invalidate_from_context(context) {
                    args.push(JsExpr::Raw(format!(
                        "$.invalidate_store($$stores, '{}')",
                        store_name
                    )));
                }
                b::call(b::member_path("$.bind_value"), args)
            }
        }

        // Files binding
        "files" => {
            let mut args = vec![node_expr.clone(), get.clone()];
            if let Some(s) = set {
                args.push(s.clone());
            }
            b::call(b::member_path("$.bind_files"), args)
        }

        // bind:this
        "this" => build_bind_this_call_for_context(&node_expr, get, set, context),

        // Content editable bindings
        "textContent" | "innerHTML" | "innerText" => {
            let mut args = vec![b::string(name), node_expr.clone(), get.clone()];
            if let Some(s) = set {
                args.push(s.clone());
            }
            b::call(b::member_path("$.bind_content_editable"), args)
        }

        // Checkbox checked binding
        "checked" => {
            let mut args = vec![node_expr.clone(), get.clone()];
            if let Some(s) = set {
                args.push(s.clone());
            }
            b::call(b::member_path("$.bind_checked"), args)
        }

        // Focus binding
        "focused" => b::call(
            b::member_path("$.bind_focused"),
            vec![node_expr.clone(), set_or_get],
        ),

        // Group binding (radio/checkbox groups)
        "group" => build_group_binding_call(&node_expr, get, set, parent, context, directive_expr),

        // Unknown binding
        _ => {
            // Generate a generic property binding as fallback
            let mut args = vec![b::string(name), node_expr.clone(), get.clone()];
            if let Some(s) = set {
                args.push(s.clone());
            }
            b::call(b::member_path("$.bind_property"), args)
        }
    }
}

/// Build a bind_property call for bindings with events.
fn build_bind_property_call(
    name: &str,
    event: &str,
    node: &JsExpr,
    get: &JsExpr,
    set: &Option<JsExpr>,
    bidirectional: bool,
) -> JsExpr {
    let mut args = vec![
        b::string(name),
        b::string(event),
        node.clone(),
        set.clone().unwrap_or_else(|| get.clone()),
    ];

    if bidirectional {
        args.push(get.clone());
    }

    b::call(b::member_path("$.bind_property"), args)
}

/// Build the keypath string for a binding expression.
/// For `selected` → `"selected"`, `$order.scoops` → `"$order.scoops"`, `list[key]` → `"list.[key]"`.
/// This must match the key generation in `mark_group_bindings_in_node` (analysis phase).
fn build_group_binding_keypath(expr: &serde_json::Value) -> String {
    let mut parts: Vec<String> = Vec::new();
    build_group_keypath_parts(expr, &mut parts);
    parts.join(".")
}

fn build_group_keypath_parts(expr: &serde_json::Value, parts: &mut Vec<String>) {
    let obj = match expr.as_object() {
        Some(o) => o,
        None => return,
    };
    let expr_type = match obj.get("type").and_then(|t| t.as_str()) {
        Some(t) => t,
        None => return,
    };
    match expr_type {
        "Identifier" => {
            if let Some(name) = obj.get("name").and_then(|n| n.as_str()) {
                parts.push(name.to_string());
            }
        }
        "MemberExpression" => {
            if let Some(object) = obj.get("object") {
                build_group_keypath_parts(object, parts);
            }
            let computed = obj
                .get("computed")
                .and_then(|c| c.as_bool())
                .unwrap_or(false);
            if computed {
                if let Some(property) = obj.get("property") {
                    let prop_str = build_group_binding_keypath(property);
                    parts.push(format!("[{}]", prop_str));
                }
            } else if let Some(property) = obj.get("property")
                && let Some(name) = property.get("name").and_then(|n| n.as_str())
            {
                parts.push(name.to_string());
            }
        }
        _ => {
            // Fallback: just push type or empty
        }
    }
}

/// Build a group binding call.
///
/// This corresponds to the 'group' case in BindDirective.js (lines 214-255).
/// When the parent element has a `value` attribute that is not a text attribute,
/// we need to include the value expression in the getter for dependency tracking.
fn build_group_binding_call(
    node: &JsExpr,
    get: &JsExpr,
    set: &Option<JsExpr>,
    parent: Option<&TemplateNode>,
    context: &mut ComponentContext,
    directive_expr: Option<&Expression>,
) -> JsExpr {
    // Get binding_group_name from the innermost ancestor EachBindingContext that has
    // contains_group_binding=true and binding_group_name set.
    // This is the new approach: analysis phase assigns group names on EachBlock metadata,
    // which are stored in EachBindingContext.binding_group_name during transform.
    // Reference: svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/BindDirective.js L248
    let binding_group_name;
    {
        // Strategy 1: For EachItem-based bind:group, look up via the innermost ancestor
        // EachBindingContext that has contains_group_binding=true and a binding_group_name.
        // This covers cases like bind:group={selected} inside {#each items as selected}.
        let each_group = context
            .state
            .each_binding_context
            .iter()
            .rev()
            .find(|ctx| ctx.contains_group_binding && ctx.binding_group_name.is_some())
            .and_then(|ctx| ctx.binding_group_name.as_ref())
            .cloned();

        if let Some(group_name) = each_group {
            binding_group_name = b::id(&group_name);
        } else {
            // Strategy 2: For non-EachItem bind:group (like bind:group={current} or
            // bind:group={$order.scoops}), look up in analysis.binding_groups by keypath.
            // The keypath must match what mark_group_bindings_in_node used when registering.
            let keypath = directive_expr
                .map(|expr| {
                    let Expression::Value(val) = expr;
                    build_group_binding_keypath(val)
                })
                .unwrap_or_default();

            if let Some(group_name) = context.state.analysis.binding_groups.get(&keypath).cloned() {
                binding_group_name = b::id(&group_name);
            } else if context.state.analysis.binding_groups.is_empty() {
                binding_group_name = b::id("binding_group");
            } else {
                // Fallback: use the first registered group
                let group_name = context
                    .state
                    .analysis
                    .binding_groups
                    .values()
                    .next()
                    .cloned()
                    .unwrap_or_else(|| "binding_group".to_string());
                binding_group_name = b::id(&group_name);
            }
        }
    }

    // Build the indexes array for bind:group.
    // This corresponds to `node.metadata.parent_each_blocks.map(each => each.metadata.index)`.
    // We use the contains_group_binding flag set during analysis to identify which each blocks
    // should contribute their index to the bind:group indexes array.
    // The official compiler's parent_each_blocks is in innermost-first order (walk from innermost
    // ancestor to outermost), so we iterate the stack in reverse (innermost first).
    // Reference: svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/BindDirective.js L215-220
    let indexes = {
        let mut idx_exprs: Vec<JsExpr> = Vec::new();
        for each_ctx in context.state.each_binding_context.iter().rev() {
            // Include this each block's index if it was marked as containing a group binding.
            // The analysis phase sets contains_group_binding=true for each blocks that declare
            // identifiers referenced by the bind:group expression.
            if each_ctx.contains_group_binding {
                // The index_name is either $$index_N (from metadata.index) or the user-defined name.
                // When contains_group_binding=true, index_name is always $$index_N.
                let idx = b::id(&each_ctx.index_name);
                if each_ctx.index_reactive {
                    // Keyed block with index: wrap in $.get()
                    idx_exprs.push(b::call(b::member_path("$.get"), vec![idx]));
                } else {
                    idx_exprs.push(idx);
                }
            }
        }
        if idx_exprs.is_empty() {
            b::empty_array()
        } else {
            b::array(idx_exprs)
        }
    };

    // We need to additionally invoke the value attribute signal to register it as a dependency,
    // so that when the value is updated, the group binding is updated
    // See: svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/BindDirective.js L223-243
    let mut group_getter = get.clone();

    if let Some(TemplateNode::RegularElement(elem)) = parent {
        // Find the value attribute that is not a text attribute and not true
        let value_attr = elem.attributes.iter().find_map(|attr| {
            if let Attribute::Attribute(a) = attr {
                if a.name.as_str() == "value"
                    && !is_text_attribute_value(&a.value)
                    && !matches!(&a.value, AttributeValue::True(_))
                {
                    Some(&a.value)
                } else {
                    None
                }
            } else {
                None
            }
        });

        if let Some(value) = value_attr {
            // Build the value expression for dependency tracking
            let value_expr = build_value_expression(value, context);

            // The return value should be the "visited" expression - the directive expression
            // with all transforms applied. This mirrors the official compiler's:
            //   b.return(expression)  // where expression = context.visit(node.expression)
            // For prop variables, this gives `current()` instead of just `current`.
            // For state variables, this gives `$.get(state)`.
            use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::apply_transforms_to_expression;
            let return_expr = if let Some(dir_expr) = directive_expr {
                let converted = convert_expression(dir_expr, context);
                apply_transforms_to_expression(&converted, context)
            } else {
                unwrap_thunk(get)
            };

            // Create a getter that first evaluates the value expression (for dependency tracking),
            // then returns the group expression
            // () => { value_expr; return get_expr; }
            group_getter = b::thunk_block(vec![b::stmt(value_expr), b::return_value(return_expr)]);
        }
    }

    let set_or_get = set.clone().unwrap_or_else(|| get.clone());

    b::call(
        b::member_path("$.bind_group"),
        vec![
            binding_group_name,
            indexes,
            node.clone(),
            group_getter,
            set_or_get,
        ],
    )
}

/// Check if an attribute value is a text attribute (single static text).
/// Corresponds to `is_text_attribute` in svelte/packages/svelte/src/compiler/utils/ast.js
fn is_text_attribute_value(value: &AttributeValue) -> bool {
    matches!(value, AttributeValue::Sequence(parts) if parts.len() == 1 && matches!(parts.first(), Some(AttributeValuePart::Text(_))))
}

/// Unwrap a thunk expression (arrow function with no params) to get its body expression.
fn unwrap_thunk(expr: &JsExpr) -> JsExpr {
    match expr {
        JsExpr::Arrow(arrow) if arrow.params.is_empty() => match &arrow.body {
            JsArrowBody::Expression(body) => (**body).clone(),
            JsArrowBody::Block(block) => {
                // If it's a block with a single return statement, extract the value
                if let Some(JsStatement::Return(ret)) = block.body.first()
                    && let Some(arg) = &ret.argument
                {
                    return (**arg).clone();
                }
                expr.clone()
            }
        },
        _ => expr.clone(),
    }
}

/// Check if a raw expression JSON is a member expression (has dots, subscript access).
fn expression_json_is_member(val: &serde_json::Value) -> bool {
    let obj = match val.as_object() {
        Some(o) => o,
        None => return false,
    };
    let expr_type = match obj.get("type").and_then(|t| t.as_str()) {
        Some(t) => t,
        None => return false,
    };
    match expr_type {
        "MemberExpression" => true,
        "CallExpression" => {
            // For call expressions, check the callee
            if let Some(callee) = obj.get("callee") {
                expression_json_is_member(callee)
            } else {
                false
            }
        }
        _ => false,
    }
}

/// Build a value expression from an attribute value.
/// This builds the expression and applies necessary transforms for dependency tracking.
fn build_value_expression(value: &AttributeValue, context: &mut ComponentContext) -> JsExpr {
    use super::shared::utils::build_expression;

    match value {
        AttributeValue::Expression(expr_tag) => {
            // Convert the expression
            let converted = convert_expression(&expr_tag.expression, context);

            // Check for reactive state
            let has_state =
                super::shared::utils::expression_has_reactive_state(&expr_tag.expression, context);

            // Check if the expression is a member expression - this affects how
            // build_expression handles it in legacy mode (uses untrack + sequence pattern)
            let has_member_expression = {
                let Expression::Value(val) = &expr_tag.expression;
                expression_json_is_member(val)
            };

            // Build the expression with transforms applied
            let mut metadata = ExpressionMetadata::default();
            metadata.set_has_state(has_state);
            metadata.set_has_member_expression(has_member_expression);

            build_expression(context, &converted, &metadata)
        }
        AttributeValue::Sequence(parts) => {
            // For sequences (e.g., value="{name}"), find the first expression
            for part in parts {
                if let AttributeValuePart::ExpressionTag(expr_tag) = part {
                    let converted = convert_expression(&expr_tag.expression, context);
                    let has_state = super::shared::utils::expression_has_reactive_state(
                        &expr_tag.expression,
                        context,
                    );
                    let has_member_expression = {
                        let Expression::Value(val) = &expr_tag.expression;
                        expression_json_is_member(val)
                    };

                    let mut metadata = ExpressionMetadata::default();
                    metadata.set_has_state(has_state);
                    metadata.set_has_member_expression(has_member_expression);

                    return build_expression(context, &converted, &metadata);
                }
            }
            // Fallback for text-only sequences (shouldn't reach here due to is_text_attribute check)
            b::undefined()
        }
        AttributeValue::True(_) => b::boolean(true),
    }
}

/// Information about an each-block variable found in a bind:this expression.
#[derive(Debug, Clone)]
struct EachBlockId {
    /// The variable name (e.g., "i")
    name: String,
    /// Whether this variable is reactive (needs $.get() in values thunk)
    reactive: bool,
}

/// Find identifiers in a JsExpr that reference each-block context variables.
/// Returns a list of unique each-block identifiers found.
fn find_each_block_ids_in_expr(expr: &JsExpr, context: &ComponentContext) -> Vec<EachBlockId> {
    let mut result = Vec::new();
    let mut seen = HashSet::new();
    collect_each_block_ids(expr, context, &mut result, &mut seen);
    result
}

/// Recursively collect each-block identifiers from a JsExpr.
fn collect_each_block_ids(
    expr: &JsExpr,
    context: &ComponentContext,
    result: &mut Vec<EachBlockId>,
    seen: &mut HashSet<String>,
) {
    match expr {
        JsExpr::Identifier(name) => {
            if seen.contains(name) {
                return;
            }
            for each_ctx in &context.state.each_binding_context {
                if name == &each_ctx.index_name {
                    seen.insert(name.clone());
                    result.push(EachBlockId {
                        name: name.clone(),
                        reactive: each_ctx.index_reactive,
                    });
                    return;
                }
                if name == &each_ctx.item_name {
                    seen.insert(name.clone());
                    result.push(EachBlockId {
                        name: name.clone(),
                        reactive: each_ctx.item_reactive,
                    });
                    return;
                }
                // Also check destructured variable names from the each pattern.
                // For `{#each data as {id, text}}`, `id` and `text` are each-block
                // context variables that need to be captured in bind_this.
                // These are tracked in destructured_update_paths.
                if each_ctx
                    .destructured_update_paths
                    .contains_key(name.as_str())
                {
                    seen.insert(name.clone());
                    // Destructured each vars are always reactive (they have read transforms)
                    result.push(EachBlockId {
                        name: name.clone(),
                        reactive: true,
                    });
                    return;
                }
            }
        }
        JsExpr::Member(member) => {
            collect_each_block_ids(&member.object, context, result, seen);
            if member.computed
                && let JsMemberProperty::Expression(prop_expr) = &member.property
            {
                collect_each_block_ids(prop_expr, context, result, seen);
            }
        }
        JsExpr::Call(call) => {
            collect_each_block_ids(&call.callee, context, result, seen);
            for arg in &call.arguments {
                collect_each_block_ids(arg, context, result, seen);
            }
        }
        JsExpr::Assignment(assign) => {
            collect_each_block_ids(&assign.left, context, result, seen);
            collect_each_block_ids(&assign.right, context, result, seen);
        }
        JsExpr::Arrow(arrow) => {
            if let JsArrowBody::Expression(body) = &arrow.body {
                collect_each_block_ids(body, context, result, seen);
            }
        }
        JsExpr::Binary(binary) => {
            collect_each_block_ids(&binary.left, context, result, seen);
            collect_each_block_ids(&binary.right, context, result, seen);
        }
        JsExpr::Array(array) => {
            for e in array.elements.iter().flatten() {
                collect_each_block_ids(e, context, result, seen);
            }
        }
        JsExpr::Conditional(cond) => {
            collect_each_block_ids(&cond.test, context, result, seen);
            collect_each_block_ids(&cond.consequent, context, result, seen);
            collect_each_block_ids(&cond.alternate, context, result, seen);
        }
        JsExpr::Sequence(seq) => {
            for e in &seq.expressions {
                collect_each_block_ids(e, context, result, seen);
            }
        }
        _ => {}
    }
}

/// Make all MemberExpression nodes in an expression use optional chaining.
fn make_optional_chain(expr: &JsExpr) -> JsExpr {
    match expr {
        JsExpr::Member(member) => {
            let optional_object = make_optional_chain(&member.object);
            JsExpr::Member(JsMemberExpression {
                object: Box::new(optional_object),
                property: member.property.clone(),
                computed: member.computed,
                optional: true,
            })
        }
        JsExpr::Call(call) => {
            let optional_callee = make_optional_chain(&call.callee);
            JsExpr::Call(JsCallExpression {
                callee: Box::new(optional_callee),
                arguments: call.arguments.clone(),
                optional: call.optional,
            })
        }
        _ => expr.clone(),
    }
}

/// Extract the body expression from an Arrow function, or return the expression as-is.
fn extract_arrow_body(expr: &JsExpr) -> &JsExpr {
    match expr {
        JsExpr::Arrow(arrow) => match &arrow.body {
            JsArrowBody::Expression(body) => body.as_ref(),
            _ => expr,
        },
        _ => expr,
    }
}

/// Build the 4-arg bind:this call for runes mode when each-block variables are referenced.
fn build_bind_this_with_each_ids(
    value: &JsExpr,
    get: &JsExpr,
    set: &Option<JsExpr>,
    context: &ComponentContext,
    each_ids: &[EachBlockId],
) -> JsExpr {
    use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::{
        LocalScope, apply_transforms_to_expression_with_shadowed,
    };

    let local_scope = LocalScope::from_shadowed(each_ids.iter().map(|id| id.name.clone()));
    let id_params: Vec<JsPattern> = each_ids.iter().map(|id| b::id_pattern(&id.name)).collect();

    // Transform getter with each-block vars in local scope
    let transformed_getter =
        apply_transforms_to_expression_with_shadowed(get, context, &local_scope);

    // Transform setter with each-block vars in local scope
    let transformed_setter = if let Some(setter) = set {
        apply_transforms_to_expression_with_shadowed(setter, context, &local_scope)
    } else {
        let raw_expr = extract_arrow_body(get);
        let set_expr = b::assign(raw_expr.clone(), b::id("$$value"));
        apply_transforms_to_expression_with_shadowed(&set_expr, context, &local_scope)
    };

    // Build getter: extract body from Arrow, apply optional chaining, add id params
    let final_getter = match transformed_getter {
        JsExpr::Arrow(arrow) => {
            let optional_body = match arrow.body {
                JsArrowBody::Expression(body) => {
                    JsArrowBody::Expression(Box::new(make_optional_chain(&body)))
                }
                other => other,
            };
            let mut params = arrow.params;
            params.extend(id_params.clone());
            JsExpr::Arrow(JsArrowFunction {
                params,
                body: optional_body,
                is_async: arrow.is_async,
            })
        }
        other => {
            let optional = make_optional_chain(&other);
            b::arrow(id_params.clone(), optional)
        }
    };

    // Build setter: add id params after first param
    let final_setter = match transformed_setter {
        JsExpr::Arrow(arrow) => {
            let mut params = Vec::new();
            if let Some(first) = arrow.params.first() {
                params.push(first.clone());
            } else {
                params.push(b::id_pattern("_"));
            }
            params.extend(id_params);
            for p in arrow.params.iter().skip(1) {
                params.push(p.clone());
            }
            JsExpr::Arrow(JsArrowFunction {
                params,
                body: arrow.body,
                is_async: arrow.is_async,
            })
        }
        other => {
            let mut params = vec![b::id_pattern("$$value")];
            params.extend(id_params);
            b::arrow(params, other)
        }
    };

    // Build values thunk: () => [reactive_value1, ...]
    let values: Vec<JsExpr> = each_ids
        .iter()
        .map(|id| {
            if id.reactive {
                b::call(b::member_path("$.get"), vec![b::id(&id.name)])
            } else {
                b::id(&id.name)
            }
        })
        .collect();
    let values_thunk = b::arrow(
        vec![],
        JsExpr::Array(JsArrayExpression {
            elements: values.into_iter().map(Some).collect(),
        }),
    );

    b::call(
        b::member_path("$.bind_this"),
        vec![value.clone(), final_setter, final_getter, values_thunk],
    )
}

/// Build a bind:this call with context awareness for props, state, and each blocks.
///
/// For props, the getter/setter use function call syntax.
/// For state variables, uses $.get()/$.set() wrappers.
/// For each block items in legacy mode, uses the 4-arg form with invalidation.
fn build_bind_this_call_for_context(
    value: &JsExpr,
    get: &JsExpr,
    set: &Option<JsExpr>,
    context: &ComponentContext,
) -> JsExpr {
    use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::apply_transforms_to_expression;

    // In runes mode, check if the expression references each-block variables.
    // If so, generate the 4-arg form: $.bind_this(el, set_fn, get_fn, values_thunk)
    if context.state.analysis.runes && !context.state.each_binding_context.is_empty() {
        let each_ids = find_each_block_ids_in_expr(get, context);
        if !each_ids.is_empty() {
            return build_bind_this_with_each_ids(value, get, set, context, &each_ids);
        }
    }

    // Check if expression is a sequence (getter/setter pair)
    if let Some(setter) = set {
        let transformed_getter = apply_transforms_to_expression(get, context);
        let transformed_setter = apply_transforms_to_expression(setter, context);
        b::call(
            b::member_path("$.bind_this"),
            vec![value.clone(), transformed_setter, transformed_getter],
        )
    } else {
        // Check if we're inside an each block and the expression references the each item
        if let Some(bind_this_result) = build_bind_this_each_block(value, get, context) {
            return bind_this_result;
        }

        // Check if this is a simple identifier that's a prop
        let is_prop = if let JsExpr::Identifier(name) = get {
            if let Some(binding) = context.state.get_binding(name) {
                use crate::compiler::phases::phase2_analyze::scope::BindingKind;
                matches!(binding.kind, BindingKind::Prop | BindingKind::BindableProp)
            } else {
                false
            }
        } else {
            false
        };

        let (has_state_transform, needs_proxy) = if let JsExpr::Identifier(name) = get {
            use crate::compiler::phases::phase2_analyze::scope::BindingKind;
            if let Some(binding) = context.state.get_binding(name) {
                let is_state = matches!(
                    binding.kind,
                    BindingKind::State | BindingKind::Derived | BindingKind::RawState
                );
                let proxy = is_state
                    && context.state.analysis.runes
                    && matches!(binding.kind, BindingKind::State);
                (is_state, proxy)
            } else if context.state.transform.get(name).is_some() {
                (true, false)
            } else {
                (false, false)
            }
        } else {
            (false, false)
        };

        if is_prop {
            let getter = b::arrow(vec![], b::call(get.clone(), vec![]));
            let setter = b::arrow(
                vec![b::id_pattern("$$value")],
                b::call(get.clone(), vec![b::id("$$value")]),
            );
            b::call(
                b::member_path("$.bind_this"),
                vec![value.clone(), setter, getter],
            )
        } else if has_state_transform {
            let getter = b::arrow(vec![], b::call(b::member_path("$.get"), vec![get.clone()]));
            let mut set_args = vec![get.clone(), b::id("$$value")];
            if needs_proxy {
                set_args.push(b::boolean(true));
            }
            let setter = b::arrow(
                vec![b::id_pattern("$$value")],
                b::call(b::member_path("$.set"), set_args),
            );
            b::call(
                b::member_path("$.bind_this"),
                vec![value.clone(), setter, getter],
            )
        } else {
            let getter = b::arrow(vec![], get.clone());
            let setter = b::arrow(
                vec![b::id_pattern("$$value")],
                b::assign(get.clone(), b::id("$$value")),
            );
            b::call(
                b::member_path("$.bind_this"),
                vec![value.clone(), setter, getter],
            )
        }
    }
}

/// Build a bind:this call inside an each block (legacy mode).
///
/// Generates the 4-arg form:
/// ```javascript
/// $.bind_this(
///     element,
///     ($$value, item) => (item.ref = $$value, $.invalidate_inner_signals(...)),
///     (item) => item?.ref,
///     () => [$.get(item)]
/// )
/// ```
fn build_bind_this_each_block(
    element: &JsExpr,
    get: &JsExpr,
    context: &ComponentContext,
) -> Option<JsExpr> {
    if context.state.analysis.runes {
        return None;
    }
    let each_ctx = context.state.each_binding_context.last()?;

    let get_str = crate::compiler::phases::phase3_transform::js_ast::codegen::generate_expr(get);
    let item_name = &each_ctx.item_name;

    // Check if the getter references the each item
    let is_each_item_ref = get_str.starts_with(&format!("{}.", item_name))
        || get_str.starts_with(&format!("$.get({}).", item_name))
        || get_str == *item_name
        || get_str == format!("$.get({})", item_name);

    if !is_each_item_ref {
        return None;
    }

    each_ctx.binding_used.set(true);

    let invalidation = build_invalidation_expr(each_ctx);

    // Extract property path
    let property_path =
        if let Some(stripped) = get_str.strip_prefix(&format!("$.get({})", item_name)) {
            stripped.trim_start_matches('.').to_string()
        } else if let Some(stripped) = get_str.strip_prefix(&format!("{}.", item_name)) {
            stripped.to_string()
        } else {
            return None;
        };

    if property_path.is_empty() {
        return None;
    }

    // Setter: ($$value, item) => (item.prop = $$value, invalidation)
    let setter_body = if let Some(ref inv) = invalidation {
        format!("{}.{} = $$value, {}", item_name, property_path, inv)
    } else {
        format!("{}.{} = $$value", item_name, property_path)
    };
    let setter = JsExpr::Raw(format!(
        "($$value, {}) => (\n\t{}\n)",
        item_name, setter_body
    ));

    // Getter: (item) => item?.prop
    let getter = JsExpr::Raw(format!(
        "({}) => {}?.{}",
        item_name, item_name, property_path
    ));

    // Values thunk: () => [$.get(item)]
    let values_thunk = JsExpr::Raw(format!("() => [$.get({})]", item_name));

    Some(b::call(
        b::member_path("$.bind_this"),
        vec![element.clone(), setter, getter, values_thunk],
    ))
}

/// Build a bind:this call (legacy - without context).
#[allow(dead_code)]
fn build_bind_this_call(value: &JsExpr, get: &JsExpr, set: &Option<JsExpr>) -> JsExpr {
    // Check if expression is a sequence (getter/setter pair)
    if let Some(setter) = set {
        // Already have getter/setter pair
        b::call(
            b::member_path("$.bind_this"),
            vec![value.clone(), setter.clone(), get.clone()],
        )
    } else {
        // Simple identifier: just pass it as both getter and setter
        // $.bind_this(value, (v) => { expr = v }, () => expr)
        let getter = b::arrow(vec![], get.clone());
        let setter = b::arrow(
            vec![b::id_pattern("$$value")],
            b::assign(get.clone(), b::id("$$value")),
        );

        b::call(
            b::member_path("$.bind_this"),
            vec![value.clone(), setter, getter],
        )
    }
}

/// Check if an expression is a sequence expression (getter/setter pair).
fn is_sequence_expression(expr: &JsExpr) -> bool {
    matches!(expr, JsExpr::Sequence(_))
}

/// Extract getter and setter from a sequence expression.
fn extract_getter_setter(expr: &JsExpr) -> (JsExpr, Option<JsExpr>) {
    match expr {
        JsExpr::Sequence(seq) if seq.expressions.len() >= 2 => {
            (seq.expressions[0].clone(), Some(seq.expressions[1].clone()))
        }
        _ => (expr.clone(), None),
    }
}

/// Build getter and setter from an expression.
fn build_getter_setter(
    original_expr: &Expression,
    expr: &JsExpr,
    context: &ComponentContext,
) -> (JsExpr, Option<JsExpr>) {
    // Check if this is a simple identifier that's a state variable
    // If so, we need to wrap with $.get() and $.set()
    let is_state_var = is_state_variable(original_expr, context);

    // Check if this is a prop (uses getter/setter functions like prop() and prop(value))
    let is_prop_var = is_prop_variable(original_expr, context);

    // In dev mode, create named functions for better stack traces
    // In prod mode, optimize for brevity
    let dev = context.state.dev;

    if is_state_var {
        // For state variables, use $.get() in getter and $.set() in setter
        // get = () => $.get(expr)
        // set = ($$value) => $.set(expr, $$value)
        let get_call = b::call(b::member_path("$.get"), vec![expr.clone()]);
        let get = if dev {
            b::function_expr(
                Some("get".to_string()),
                vec![],
                vec![b::return_value(get_call)],
            )
        } else {
            b::thunk(get_call)
        };

        let set_call = b::call(
            b::member_path("$.set"),
            vec![expr.clone(), b::id("$$value")],
        );
        let set = if dev {
            b::function_expr(
                Some("set".to_string()),
                vec![b::id_pattern("$$value")],
                vec![b::stmt(set_call)],
            )
        } else {
            b::arrow(vec![b::id_pattern("$$value")], set_call)
        };

        (get, Some(set))
    } else if is_prop_var {
        // For props, the getter calls the prop function and the setter passes a value
        // get = () => prop() -> unthunk -> prop
        // set = ($$value) => prop($$value) -> unthunk -> prop
        // Since both get and set simplify to the same thing (prop), set is omitted
        // This matches the official Svelte compiler behavior where props are getters/setters
        let get_call = b::call(expr.clone(), vec![]);
        let get = if dev {
            b::function_expr(
                Some("get".to_string()),
                vec![],
                vec![b::return_value(get_call)],
            )
        } else {
            // thunk already applies unthunk, so () => prop() becomes prop
            b::thunk(get_call)
        };

        let set_call = b::call(expr.clone(), vec![b::id("$$value")]);
        let set = if dev {
            b::function_expr(
                Some("set".to_string()),
                vec![b::id_pattern("$$value")],
                vec![b::stmt(set_call)],
            )
        } else {
            // Apply unthunk to simplify ($$value) => prop($$value) to prop
            b::unthunk(b::arrow(vec![b::id_pattern("$$value")], set_call))
        };

        // If get and set are the same (both simplified to the prop identifier),
        // omit the set argument (the official compiler does this optimization)
        // We compare by checking if both are identifiers with the same name
        let same_identifier = match (&get, &set) {
            (JsExpr::Identifier(get_name), JsExpr::Identifier(set_name)) => get_name == set_name,
            _ => false,
        };
        if !dev && same_identifier {
            (get, None)
        } else {
            (get, Some(set))
        }
    } else {
        // For non-state, non-prop expressions (e.g., each-block items, store member access),
        // apply transforms to get $.get() wrappers and store mutate handling.
        //
        // The getter applies read transforms to the expression.
        // The setter creates an assignment `expr = $$value` and applies transforms to it,
        // which triggers the store's mutate transform for store subscription member access.
        // This mirrors the official compiler: context.visit(b.assignment('=', node.expression, b.id('$$value')))
        use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::apply_transforms_to_expression;

        // Apply transforms in BOTH runes and legacy mode so that prop member access
        // gets the correct getter call form (e.g., `selected[0]` -> `selected()[0]`).
        // Previously legacy mode skipped transforms, but this caused prop member bindings
        // like `bind:group={selected[0]}` to use `selected[0]` instead of `selected()[0]`.
        let transformed_read = apply_transforms_to_expression(expr, context);

        // Build the setter by creating an assignment expression and applying transforms.
        // This allows store_sub mutate transforms to kick in for patterns like:
        //   $obj.a = $$value -> $.store_mutate(obj, $.untrack($obj).a = $$value, $.untrack($obj))
        // Also applies prop mutation transforms in legacy mode:
        //   selected[0] = $$value -> selected(selected()[0] = $$value, true)
        let assignment_expr = b::assign(expr.clone(), b::id("$$value"));
        let transformed_set = apply_transforms_to_expression(&assignment_expr, context);

        // Check if the root identifier has legacy_indirect_bindings.
        // If so, wrap the setter in a sequence with $.invalidate_inner_signals().
        // This corresponds to AssignmentExpression.js lines 159-173 in the official compiler.
        let transformed_set = if !context.state.analysis.runes {
            // Extract root identifier from the original expression
            let root_name = get_expression_root_identifier(expr);
            if let Some(ref root_name) = root_name {
                // Look up the binding
                let binding = context.state.get_binding(root_name);
                if let Some(binding) = binding {
                    if !binding.legacy_indirect_bindings.is_empty() {
                        // Build getter calls for each indirect binding
                        let mut getter_stmts = Vec::new();
                        for indirect_name in &binding.legacy_indirect_bindings {
                            // Build the getter by looking up the transform
                            let getter = if let Some(transform) =
                                context.state.transform.get(indirect_name)
                            {
                                if let Some(read_fn) = transform.read {
                                    read_fn(JsExpr::Identifier(indirect_name.clone()))
                                } else {
                                    JsExpr::Identifier(indirect_name.clone())
                                }
                            } else {
                                JsExpr::Identifier(indirect_name.clone())
                            };
                            getter_stmts.push(b::stmt(getter));
                        }

                        // Build: $.invalidate_inner_signals(() => { getter1(); getter2(); ... })
                        let invalidate_call = b::call(
                            b::member_path("$.invalidate_inner_signals"),
                            vec![b::arrow_block(vec![], getter_stmts)],
                        );

                        // Wrap: (mutation, $.invalidate_inner_signals(...))
                        b::sequence(vec![transformed_set, invalidate_call])
                    } else {
                        transformed_set
                    }
                } else {
                    transformed_set
                }
            } else {
                transformed_set
            }
        } else {
            transformed_set
        };

        if dev {
            let get = b::function_expr(
                Some("get".to_string()),
                vec![],
                vec![b::return_value(transformed_read)],
            );
            let set = b::function_expr(
                Some("set".to_string()),
                vec![b::id_pattern("$$value")],
                vec![b::stmt(transformed_set)],
            );
            (get, Some(set))
        } else {
            let get = b::thunk(transformed_read);
            let set = b::arrow(vec![b::id_pattern("$$value")], transformed_set);

            // Apply unthunk optimization: if get and set are the same identifier, omit set
            let same_identifier = match (&get, &set) {
                (JsExpr::Identifier(get_name), JsExpr::Identifier(set_name)) => {
                    get_name == set_name
                }
                _ => false,
            };
            if same_identifier {
                (get, None)
            } else {
                (get, Some(set))
            }
        }
    }
}

/// Check if an expression is a state variable ($state, $derived, or legacy state).
///
/// In legacy mode, variables that are updated (reassigned/mutated) and referenced
/// in the template are promoted to `state` kind during analysis. This enables
/// them to be wrapped in `$.mutable_source()` and use `$.get()`/`$.set()`.
fn is_state_variable(expr: &Expression, context: &ComponentContext) -> bool {
    match expr {
        Expression::Value(val) => {
            if let Some(obj) = val.as_object()
                && let Some(expr_type) = obj.get("type").and_then(|v| v.as_str())
                && expr_type == "Identifier"
                && let Some(name) = obj.get("name").and_then(|v| v.as_str())
                && let Some(binding) = context.state.get_binding(name)
            {
                use crate::compiler::phases::phase2_analyze::scope::BindingKind;
                use crate::compiler::phases::phase3_transform::client::utils::is_state_source;
                // Use is_state_source for state/raw_state (respects immutable/reassigned),
                // and always return true for derived (they always need $.get())
                return is_state_source(binding, context.state.analysis)
                    || matches!(binding.kind, BindingKind::Derived);
            }
            false
        }
    }
}

/// Check if an expression is a prop variable (export let ... in legacy mode).
///
/// Props in legacy mode are wrapped in `$.prop()` which returns a getter/setter function.
/// Reading a prop becomes `prop()` and setting becomes `prop(value)`.
fn is_prop_variable(expr: &Expression, context: &ComponentContext) -> bool {
    match expr {
        Expression::Value(val) => {
            if let Some(obj) = val.as_object()
                && let Some(expr_type) = obj.get("type").and_then(|v| v.as_str())
                && expr_type == "Identifier"
                && let Some(name) = obj.get("name").and_then(|v| v.as_str())
            {
                // Check if there's a transform registered for this prop
                // Props have a transform with both read and assign functions
                if let Some(transform) = context.state.transform.get(name) {
                    // Also verify it's actually a prop by checking the binding kind
                    if let Some(binding) = context.state.get_binding(name) {
                        use crate::compiler::phases::phase2_analyze::scope::BindingKind;
                        return matches!(
                            binding.kind,
                            BindingKind::Prop | BindingKind::BindableProp
                        ) && transform.read.is_some();
                    }
                }
            }
            false
        }
    }
}

/// Check if parent is a RegularElement.
fn is_regular_element(parent: Option<&TemplateNode>) -> bool {
    matches!(parent, Some(TemplateNode::RegularElement(_)))
}

/// Check if parent element has a use: directive.
fn has_use_directive(parent: Option<&TemplateNode>) -> bool {
    match parent {
        Some(TemplateNode::RegularElement(elem)) => elem
            .attributes
            .iter()
            .any(|attr| matches!(attr, Attribute::UseDirective(_))),
        _ => false,
    }
}

/// Build getter/setter for a binding inside an each block (legacy mode).
///
/// When a bind directive is inside an each block in legacy mode, the getter/setter
/// need special patterns:
/// - Getter: `() => $.get($$item).prop` or the destructured getter function
/// - Setter: `($$value) => ($.get($$item).prop = $$value, $.invalidate_inner_signals(() => (...)))`
///
/// Returns None if we're not inside an each block or the expression doesn't reference
/// an each item variable.
pub fn build_each_block_getter_setter(
    original_expr: &Expression,
    _converted_expr: &JsExpr,
    context: &mut ComponentContext,
) -> Option<(JsExpr, Option<JsExpr>)> {
    // Only applies in legacy mode (not runes)
    if context.state.analysis.runes {
        return None;
    }

    // Check if we're inside an each block at all
    if context.state.each_binding_context.is_empty() {
        return None;
    }

    // Determine what the expression references, searching ALL ancestor each contexts.
    // Returns (expr_info, matched_ctx_index) where matched_ctx_index is the index into
    // each_binding_context of the each block that declares the referenced variable.
    let (expr_info, matched_ctx_idx) = analyze_each_binding_expression(original_expr, context)?;

    // Get the matched each context (might be an ancestor, not just the innermost)
    let each_ctx = context.state.each_binding_context[matched_ctx_idx].clone();

    // Mark that this binding used the each context (for uses_index tracking)
    each_ctx.binding_used.set(true);

    // Build the invalidation sequence
    let invalidation = build_invalidation_expr(&each_ctx);

    match expr_info {
        EachBindingExprInfo::DirectItem { item_name: _ } => {
            // Direct item reference: bind:value={item}
            // Official Svelte uses collection[$$index] for both getter and setter
            // (not $.get(item)) because the item is considered "reassigned" via the bind.
            // Getter: () => collection[$$index]
            // Setter: ($$value) => (collection[$$index] = $$value, invalidation)

            // Build collection access as a proper AST node so unwrap_thunk can work on
            // the resulting arrow function (b::thunk requires a structured JsExpr::Arrow).
            let collection_expr = if let Some(ref coll_id) = each_ctx.collection_id {
                // collection is a prop (function call): selected_array()
                b::call(b::id(coll_id), vec![])
            } else {
                // collection is a raw expression (e.g., component prop or literal)
                JsExpr::Raw(each_ctx.collection_expr.clone())
            };
            let index_expr = if each_ctx.index_reactive {
                b::call(b::member_path("$.get"), vec![b::id(&each_ctx.index_name)])
            } else {
                b::id(&each_ctx.index_name)
            };

            // Build collection[index] as a computed member expression
            let member_expr = b::member_computed(collection_expr.clone(), index_expr.clone());

            // Getter: () => collection[index]  (structured arrow, unwrap_thunk-compatible)
            let get = b::thunk(member_expr.clone());

            // Setter: ($$value) => (collection[index] = $$value, invalidation)
            // Build as a raw string since assignment and sequence expressions need special handling
            let collection_access = if let Some(ref coll_id) = each_ctx.collection_id {
                format!("{}()", coll_id)
            } else {
                each_ctx.collection_expr.clone()
            };
            let index_access = if each_ctx.index_reactive {
                format!("$.get({})", each_ctx.index_name)
            } else {
                each_ctx.index_name.clone()
            };
            let setter_body = if let Some(ref inv) = invalidation {
                format!("{}[{}] = $$value, {}", collection_access, index_access, inv)
            } else {
                format!("{}[{}] = $$value", collection_access, index_access)
            };

            let set = JsExpr::Raw(format!("($$value) => ({})", setter_body));
            Some((get, Some(set)))
        }
        EachBindingExprInfo::ItemProperty {
            item_name,
            property_path,
        } => {
            // Property of each item: bind:value={item.prop} or bind:value={item.a.b} or bind:value={item[expr]}
            // Getter: () => $.get(item).prop  OR  () => $.get(item)[$.get(expr)]
            // Setter: ($$value) => ($.get(item).prop = $$value, invalidation)
            let get_base = if each_ctx.item_reactive {
                format!("$.get({})", item_name)
            } else {
                item_name.clone()
            };

            // Apply transforms to the property path (for computed properties like [index]).
            // E.g., [index] where index is a reactive each item becomes [$.get(index)].
            let transformed_prop_path = if property_path.starts_with('[') {
                // Extract the identifier inside the brackets
                let inner = &property_path[1..property_path.len() - 1];
                if let Some(transform) = context.state.transform.get(inner)
                    && let Some(read_fn) = &transform.read
                {
                    let transformed = read_fn(b::id(inner));
                    let transformed_str =
                        crate::compiler::phases::phase3_transform::js_ast::codegen::generate_expr(
                            &transformed,
                        );
                    format!("[{}]", transformed_str)
                } else {
                    property_path.clone()
                }
            } else {
                property_path.clone()
            };

            let access_prop = |base: &str, prop: &str| -> String {
                if prop.starts_with('[') {
                    format!("{}{}", base, prop)
                } else {
                    format!("{}.{}", base, prop)
                }
            };
            let get_expr_str = access_prop(&get_base, &transformed_prop_path);
            // Use a proper Arrow expression so that unwrap_thunk can strip the () => prefix
            let get = b::thunk(JsExpr::Raw(get_expr_str.clone()));

            let setter_body = if let Some(ref inv) = invalidation {
                format!(
                    "{} = $$value, {}",
                    access_prop(&get_base, &transformed_prop_path),
                    inv
                )
            } else {
                format!(
                    "{} = $$value",
                    access_prop(&get_base, &transformed_prop_path)
                )
            };

            let set = JsExpr::Raw(format!("($$value) => (\n\t{}\n)", setter_body));
            Some((get, Some(set)))
        }
        EachBindingExprInfo::DestructuredVar {
            var_name,
            update_path,
        } => {
            // Destructured variable: bind:value={f} where f comes from {#each items as { f }}
            // Getter: apply the read transform to get the proper getter expression,
            //         then wrap in thunk. b::thunk(f()) => f (via unthunk optimization)
            //         b::thunk($.get(f)) => () => $.get(f)
            // Setter: ($$value) => (update_path = $$value, invalidation)
            let get = if let Some(transform) = context.state.transform.get(&var_name)
                && let Some(read_fn) = &transform.read
            {
                b::thunk(read_fn(b::id(&var_name)))
            } else {
                b::id(&var_name)
            };

            let setter_body = if let Some(ref inv) = invalidation {
                format!("{} = $$value, {}", update_path, inv)
            } else {
                format!("{} = $$value", update_path)
            };

            let set = JsExpr::Raw(format!("($$value) => (\n\t{}\n)", setter_body));
            Some((get, Some(set)))
        }
        EachBindingExprInfo::ComputedAccess {
            access_expr,
            assign_expr,
        } => {
            // Computed access like item[index] or a()[key()]
            // Getter: () => access_expr
            // Setter: ($$value) => (assign_expr = $$value, invalidation)
            let get = JsExpr::Raw(format!("() => {}", access_expr));

            let setter_body = if let Some(ref inv) = invalidation {
                format!("{} = $$value, {}", assign_expr, inv)
            } else {
                format!("{} = $$value", assign_expr)
            };

            let set = JsExpr::Raw(format!("($$value) => (\n\t{}\n)", setter_body));
            Some((get, Some(set)))
        }
    }
}

/// Information about how a binding expression references an each block item.
#[derive(Debug)]
#[allow(dead_code)]
enum EachBindingExprInfo {
    /// Direct reference to the each item (bind:value={item})
    DirectItem { item_name: String },
    /// Property access on the each item (bind:value={item.prop})
    ItemProperty {
        item_name: String,
        property_path: String,
    },
    /// Reference to a destructured variable (bind:value={f})
    DestructuredVar {
        var_name: String,
        update_path: String,
    },
    /// Computed access expression (bind:value={a()[key()]})
    ComputedAccess {
        access_expr: String,
        assign_expr: String,
    },
}

/// Analyze whether a binding expression references an each block item.
/// Returns `(EachBindingExprInfo, matched_context_index)` where `matched_context_index` is
/// the index into `each_binding_context` of the each block that declares the referenced variable.
/// Searches ALL ancestor each contexts (not just the innermost), so that bindings in nested
/// each blocks can match variables from outer each blocks (e.g., `bind:group={selected}` inside
/// `{#each values as value}` where `selected` comes from the ancestor `{#each selected_array as selected}`).
fn analyze_each_binding_expression(
    expr: &Expression,
    context: &ComponentContext,
) -> Option<(EachBindingExprInfo, usize)> {
    let Expression::Value(val) = expr;
    let obj = val.as_object()?;
    let expr_type = obj.get("type").and_then(|v| v.as_str())?;

    match expr_type {
        "Identifier" => {
            let name = obj.get("name").and_then(|v| v.as_str())?;

            // Search ALL ancestor each contexts for a matching item name.
            // We prefer the innermost match (search from last to first).
            for (idx, each_ctx) in context.state.each_binding_context.iter().enumerate().rev() {
                if name == each_ctx.item_name {
                    // Direct reference to this each block's item
                    return Some((
                        EachBindingExprInfo::DirectItem {
                            item_name: name.to_string(),
                        },
                        idx,
                    ));
                }

                // Check if this is a destructured variable from the each block
                // Look at the each context - if item_name is "$$item", this might be
                // a destructured variable
                if each_ctx.item_name == "$$item" {
                    // Check if this variable has a known update path from destructured context
                    if let Some(update_path) = each_ctx.destructured_update_paths.get(name) {
                        return Some((
                            EachBindingExprInfo::DestructuredVar {
                                var_name: name.to_string(),
                                update_path: update_path.clone(),
                            },
                            idx,
                        ));
                    }
                }
            }

            None
        }
        "MemberExpression" => {
            // item.prop, item.a.b, item[0], etc.
            let (root_name, property_path) = extract_member_path(obj)?;

            // Search ALL ancestor each contexts for a matching item name.
            for (idx, each_ctx) in context.state.each_binding_context.iter().enumerate().rev() {
                if root_name == each_ctx.item_name {
                    return Some((
                        EachBindingExprInfo::ItemProperty {
                            item_name: root_name,
                            property_path,
                        },
                        idx,
                    ));
                }

                // Check if the root is a getter function from destructured context
                // e.g., f().prop where f is a destructured getter (not a direct each item
                // like `arg` from {#each list as arg}, which uses $.get(arg) not arg()).
                // Only take this path if root_name is actually in the destructured paths
                // of this each context, to distinguish lambda getters from $.get() sources.
                if each_ctx.item_name == "$$item"
                    && each_ctx.destructured_update_paths.contains_key(&root_name)
                    && let Some(transform) = context.state.transform.get(&root_name)
                    && transform.is_reactive
                {
                    // This is a reactive (destructured) variable being accessed as member
                    // The getter needs to call the function: root()
                    // Build the access expression and assign expression

                    // If the property is a computed access like [key], check if the identifier
                    // inside the brackets also has a destructured getter transform and apply it.
                    // e.g., [key] -> [key()] when key is a destructured getter function.
                    let transformed_property_path = if property_path.starts_with('[') {
                        let inner = &property_path[1..property_path.len() - 1];
                        if each_ctx.destructured_update_paths.contains_key(inner)
                            && context
                                .state
                                .transform
                                .get(inner)
                                .is_some_and(|t| t.is_reactive)
                        {
                            format!("[{}()]", inner)
                        } else {
                            property_path.clone()
                        }
                    } else {
                        property_path.clone()
                    };

                    let access_expr = if transformed_property_path.starts_with('[') {
                        format!("{}(){}", root_name, transformed_property_path)
                    } else {
                        format!("{}().{}", root_name, transformed_property_path)
                    };
                    // For the assign expression, also use getter calls so the setter writes
                    // through the getter functions (e.g., a()[key()] = $$value).
                    let assign_expr = access_expr.clone();
                    return Some((
                        EachBindingExprInfo::ComputedAccess {
                            access_expr,
                            assign_expr,
                        },
                        idx,
                    ));
                }
            }

            None
        }
        _ => None,
    }
}

/// Extract the root identifier name and property path from a MemberExpression.
/// Returns (root_name, property_path) e.g., ("item", "name.first") for item.name.first
fn extract_member_path(
    obj: &serde_json::Map<String, serde_json::Value>,
) -> Option<(String, String)> {
    let object = obj.get("object")?.as_object()?;
    let property = obj.get("property")?.as_object()?;
    let computed = obj
        .get("computed")
        .and_then(|c| c.as_bool())
        .unwrap_or(false);

    let prop_name = if computed {
        // Computed property: item[expr]
        let prop_val = serde_json::Value::Object(property.clone());
        let prop_str = format_json_expr(&prop_val);
        format!("[{}]", prop_str)
    } else {
        property.get("name").and_then(|n| n.as_str())?.to_string()
    };

    let object_type = object.get("type").and_then(|t| t.as_str())?;

    if object_type == "Identifier" {
        let root_name = object.get("name").and_then(|n| n.as_str())?;
        Some((root_name.to_string(), prop_name))
    } else if object_type == "MemberExpression" {
        let (root, parent_path) = extract_member_path(object)?;
        if computed {
            Some((root, format!("{}{}", parent_path, prop_name)))
        } else {
            Some((root, format!("{}.{}", parent_path, prop_name)))
        }
    } else {
        None
    }
}

/// Format a JSON expression value to a string (simplified).
fn format_json_expr(val: &serde_json::Value) -> String {
    match val {
        serde_json::Value::Object(obj) => {
            let expr_type = obj.get("type").and_then(|t| t.as_str()).unwrap_or("");
            match expr_type {
                "Identifier" => obj
                    .get("name")
                    .and_then(|n| n.as_str())
                    .unwrap_or("?")
                    .to_string(),
                "Literal" | "NumericLiteral" => {
                    if let Some(raw) = obj.get("raw").and_then(|r| r.as_str()) {
                        raw.to_string()
                    } else if let Some(v) = obj.get("value") {
                        match v {
                            serde_json::Value::Number(n) => n.to_string(),
                            serde_json::Value::String(s) => format!("'{}'", s),
                            _ => "?".to_string(),
                        }
                    } else {
                        "?".to_string()
                    }
                }
                _ => "?".to_string(),
            }
        }
        serde_json::Value::String(s) => format!("'{}'", s),
        serde_json::Value::Number(n) => n.to_string(),
        _ => "?".to_string(),
    }
}

/// Build the invalidation expression string for an each block binding setter.
fn build_invalidation_expr(
    each_ctx: &crate::compiler::phases::phase3_transform::client::types::EachBindingContext,
) -> Option<String> {
    // In runes mode, we still need $.invalidate_store for store bindings,
    // but not $.invalidate_inner_signals
    if each_ctx.is_runes && each_ctx.store_to_invalidate.is_none() {
        return None;
    }

    if each_ctx.invalidation_exprs.is_empty() && each_ctx.store_to_invalidate.is_none() {
        return None;
    }

    let mut parts: Vec<String> = Vec::new();

    // Build: $.invalidate_inner_signals(() => (expr1, expr2, ...))
    if !each_ctx.invalidation_exprs.is_empty() {
        let inner = each_ctx.invalidation_exprs.join(", ");
        parts.push(format!("$.invalidate_inner_signals(() => ({}))", inner));
    }

    // Add $.invalidate_store($$stores, '$storeName') if the collection is a store
    if let Some(ref store_name) = each_ctx.store_to_invalidate {
        parts.push(format!("$.invalidate_store($$stores, '{}')", store_name));
    }

    if parts.is_empty() {
        None
    } else {
        Some(parts.join(", "))
    }
}

/// Get the store name to invalidate from the current each_binding_context.
/// Returns the store name (e.g., "$array") if the innermost each block iterates over a store.
///
/// This is only used in **runes mode**, because in legacy mode the store invalidation
/// is already baked into the setter expression by `build_invalidation_expr` (called from
/// `build_each_block_getter_setter`).
fn get_store_to_invalidate_from_context(context: &ComponentContext) -> Option<String> {
    // Only add separate store invalidation in runes mode.
    // In legacy mode, build_invalidation_expr already includes $.invalidate_store
    // in the setter expression, so adding it here would duplicate it.
    if !context.state.analysis.runes {
        return None;
    }
    context
        .state
        .each_binding_context
        .last()
        .and_then(|ctx| ctx.store_to_invalidate.clone())
}

/// Extract the root identifier name from a JsExpr.
///
/// For `selected` -> Some("selected"), for `selected.done` -> Some("selected"),
/// for `items[0]` -> Some("items").
/// Corresponds to the `object()` function call in the official compiler.
fn get_expression_root_identifier(expr: &JsExpr) -> Option<String> {
    match expr {
        JsExpr::Identifier(name) => Some(name.clone()),
        JsExpr::Member(member) => get_expression_root_identifier(&member.object),
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_binding_property() {
        // Duration has durationchange event
        let duration = get_binding_property("duration");
        assert!(duration.is_some());
        assert_eq!(duration.unwrap().event, Some("durationchange"));

        // Value doesn't have special event handling
        let value = get_binding_property("value");
        assert!(value.is_none());

        // Open has toggle event and is bidirectional
        let open = get_binding_property("open");
        assert!(open.is_some());
        let open = open.unwrap();
        assert_eq!(open.event, Some("toggle"));
        assert!(open.bidirectional);
    }

    #[test]
    fn test_is_sequence_expression() {
        let seq = b::sequence(vec![b::id("get"), b::id("set")]);
        assert!(is_sequence_expression(&seq));

        let simple = b::id("value");
        assert!(!is_sequence_expression(&simple));
    }

    #[test]
    fn test_extract_getter_setter() {
        let seq = b::sequence(vec![b::id("getter"), b::id("setter")]);
        let (get, set) = extract_getter_setter(&seq);

        match get {
            JsExpr::Identifier(name) => assert_eq!(name, "getter"),
            _ => panic!("Expected identifier"),
        }

        match set {
            Some(JsExpr::Identifier(name)) => assert_eq!(name, "setter"),
            _ => panic!("Expected identifier"),
        }
    }
}
