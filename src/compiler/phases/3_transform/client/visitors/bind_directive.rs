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

use crate::ast::js::Expression;
use crate::ast::template::{
    Attribute, AttributeValue, AttributeValuePart, BindDirective, TemplateNode,
};
use crate::compiler::phases::phase3_transform::client::types::*;
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

    // Visit the expression to transform it
    let expression = visit_expression(&node.expression, context);

    // Check if it's a sequence expression (getter/setter pair)
    let (get, set) = if is_sequence_expression(&expression) {
        extract_getter_setter(&expression)
    } else {
        // Build getter and setter from the expression
        build_getter_setter(&node.expression, &expression, context)
    };

    // Get binding property configuration
    let property = get_binding_property(binding_name);

    // Generate the appropriate binding call
    let call = if let Some(prop) = property {
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
            build_special_binding_call(binding_name, &get, &set, context, parent)
        }
    } else {
        // Special cases handled by switch
        build_special_binding_call(binding_name, &get, &set, context, parent)
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
                b::call(b::member_path("$.bind_select_value"), args)
            } else {
                let mut args = vec![node_expr.clone(), get.clone()];
                if let Some(s) = set {
                    args.push(s.clone());
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
        "group" => build_group_binding_call(&node_expr, get, set, parent, context),

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
) -> JsExpr {
    // TODO: Handle metadata.parent_each_blocks for index tracking
    // For now, use an empty array for indexes
    let indexes = b::empty_array();

    // Get binding_group_name from analysis.binding_groups
    // If not found, create one called "binding_group"
    // Reference: svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/BindDirective.js L248
    let binding_group_name = if context.state.analysis.binding_groups.is_empty() {
        // No binding groups registered - use default name "binding_group"
        // This shouldn't happen in well-analyzed code, but handle gracefully
        b::id("binding_group")
    } else {
        // Use the first binding group name (for simple cases with single bind:group)
        // TODO: Properly track which binding group this belongs to via node.metadata
        let group_name = context
            .state
            .analysis
            .binding_groups
            .values()
            .next()
            .cloned()
            .unwrap_or_else(|| "binding_group".to_string());
        b::id(&group_name)
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

            // Create a getter that first evaluates the value expression (for dependency tracking),
            // then returns the group expression
            // () => { value_expr; return get_expr; }
            group_getter = b::thunk_block(vec![
                b::stmt(value_expr),
                b::return_value(unwrap_thunk(get)),
            ]);
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

/// Build a value expression from an attribute value.
/// This builds the expression and applies necessary transforms for dependency tracking.
fn build_value_expression(value: &AttributeValue, context: &mut ComponentContext) -> JsExpr {
    use super::shared::utils::build_expression;
    use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;

    match value {
        AttributeValue::Expression(expr_tag) => {
            // Convert the expression
            let converted = convert_expression(&expr_tag.expression, context);

            // Check for reactive state
            let has_state =
                super::shared::utils::expression_has_reactive_state(&expr_tag.expression, context);

            // Build the expression with transforms applied
            let mut metadata = ExpressionMetadata::default();
            metadata.set_has_state(has_state);

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

                    let mut metadata = ExpressionMetadata::default();
                    metadata.set_has_state(has_state);

                    return build_expression(context, &converted, &metadata);
                }
            }
            // Fallback for text-only sequences (shouldn't reach here due to is_text_attribute check)
            b::undefined()
        }
        AttributeValue::True(_) => b::boolean(true),
    }
}

/// Build a bind:this call with context awareness for props.
///
/// For props (created via `$.prop()`), the getter should be `() => prop()` and
/// the setter should be `($$value) => prop($$value)` because props are getter/setter
/// functions.
///
/// For regular variables, the getter is `() => expr` and setter is `($$value) => expr = $$value`.
fn build_bind_this_call_for_context(
    value: &JsExpr,
    get: &JsExpr,
    set: &Option<JsExpr>,
    context: &ComponentContext,
) -> JsExpr {
    // Check if expression is a sequence (getter/setter pair)
    if let Some(setter) = set {
        // Already have getter/setter pair
        b::call(
            b::member_path("$.bind_this"),
            vec![value.clone(), setter.clone(), get.clone()],
        )
    } else {
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

        // Check if this variable is a state variable that needs $.get() and $.set() wrappers
        // This includes:
        // 1. Variables with state transforms registered (runes mode $state, $derived)
        // 2. Variables with BindingKind::State (legacy mode mutable_source)
        let has_state_transform = if let JsExpr::Identifier(name) = get {
            // Check transform map first (runes mode)
            if context.state.transform.get(name).is_some() {
                true
            } else {
                // In legacy mode, check analysis.root.bindings for State binding kind
                // This handles variables that will be wrapped in $.mutable_source()
                use crate::compiler::phases::phase2_analyze::scope::BindingKind;
                !context.state.analysis.runes
                    && context
                        .state
                        .analysis
                        .root
                        .bindings
                        .iter()
                        .any(|b| b.name == *name && matches!(b.kind, BindingKind::State))
            }
        } else {
            false
        };

        if is_prop {
            // For props, use function call syntax
            // getter: () => prop()
            // setter: ($$value) => prop($$value)
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
            // For state variables ($.mutable_source, $.state), use $.get() and $.set()
            // getter: () => $.get(expr)
            // setter: ($$value) => $.set(expr, $$value)
            let getter = b::arrow(vec![], b::call(b::member_path("$.get"), vec![get.clone()]));
            let setter = b::arrow(
                vec![b::id_pattern("$$value")],
                b::call(b::member_path("$.set"), vec![get.clone(), b::id("$$value")]),
            );

            b::call(
                b::member_path("$.bind_this"),
                vec![value.clone(), setter, getter],
            )
        } else {
            // For regular variables (no transform), use assignment syntax
            // getter: () => expr
            // setter: ($$value) => expr = $$value
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

/// Visit an Expression and convert it to a JsExpr.
fn visit_expression(expr: &Expression, _context: &mut ComponentContext) -> JsExpr {
    match expr {
        Expression::Value(val) => {
            if let Some(obj) = val.as_object()
                && let Some(expr_type) = obj.get("type").and_then(|v| v.as_str())
            {
                match expr_type {
                    "Identifier" => {
                        if let Some(name) = obj.get("name").and_then(|v| v.as_str()) {
                            return b::id(name);
                        }
                    }
                    "MemberExpression" => {
                        return convert_member_expression(obj);
                    }
                    "SequenceExpression" => {
                        if let Some(expressions) = obj.get("expressions").and_then(|v| v.as_array())
                        {
                            let exprs: Vec<JsExpr> = expressions
                                .iter()
                                .filter_map(|e| e.as_object().map(convert_expression_value))
                                .collect();
                            return b::sequence(exprs);
                        }
                    }
                    "Literal" => {
                        if let Some(value) = obj.get("value") {
                            if let Some(s) = value.as_str() {
                                return b::string(s);
                            } else if let Some(n) = value.as_f64() {
                                return b::number(n);
                            } else if let Some(bool_val) = value.as_bool() {
                                return b::boolean(bool_val);
                            } else if value.is_null() {
                                return b::null();
                            }
                        }
                    }
                    _ => {}
                }
            }
            // Fallback
            b::id("expr")
        }
    }
}

/// Convert a JSON object representing a MemberExpression to JsExpr.
fn convert_member_expression(obj: &serde_json::Map<String, serde_json::Value>) -> JsExpr {
    let object = obj
        .get("object")
        .and_then(|v| v.as_object())
        .map(convert_expression_value)
        .unwrap_or_else(|| b::id("unknown"));

    let computed = obj
        .get("computed")
        .and_then(|v| v.as_bool())
        .unwrap_or(false);

    if computed {
        let property = obj
            .get("property")
            .and_then(|v| v.as_object())
            .map(convert_expression_value)
            .unwrap_or_else(|| b::id("unknown"));
        b::member_computed(object, property)
    } else {
        let property_name = obj
            .get("property")
            .and_then(|v| v.as_object())
            .and_then(|o| o.get("name"))
            .and_then(|v| v.as_str())
            .unwrap_or("unknown");
        b::member(object, property_name)
    }
}

/// Convert a JSON object representing an expression to JsExpr.
fn convert_expression_value(obj: &serde_json::Map<String, serde_json::Value>) -> JsExpr {
    if let Some(expr_type) = obj.get("type").and_then(|v| v.as_str()) {
        match expr_type {
            "Identifier" => {
                if let Some(name) = obj.get("name").and_then(|v| v.as_str()) {
                    return b::id(name);
                }
            }
            "MemberExpression" => {
                return convert_member_expression(obj);
            }
            "Literal" => {
                if let Some(value) = obj.get("value") {
                    if let Some(s) = value.as_str() {
                        return b::string(s);
                    } else if let Some(n) = value.as_f64() {
                        return b::number(n);
                    } else if let Some(bool_val) = value.as_bool() {
                        return b::boolean(bool_val);
                    } else if value.is_null() {
                        return b::null();
                    }
                }
            }
            "ArrowFunctionExpression" => {
                // For arrow functions, we'll create a placeholder
                // Full implementation would parse params and body
                return b::arrow(vec![], b::id("body"));
            }
            "FunctionExpression" => {
                return b::function_expr(None, vec![], vec![]);
            }
            _ => {}
        }
    }
    b::id("expr")
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
    } else if dev {
        // Dev mode: named functions
        // get = function get() { return expression; }
        // set = function set($$value) { expression = $$value; }
        let get = b::function_expr(
            Some("get".to_string()),
            vec![],
            vec![b::return_value(expr.clone())],
        );

        let set = b::function_expr(
            Some("set".to_string()),
            vec![b::id_pattern("$$value")],
            vec![b::stmt(b::assign(expr.clone(), b::id("$$value")))],
        );

        (get, Some(set))
    } else {
        // Prod mode: arrow functions
        // get = () => expression
        let get = b::thunk(expr.clone());

        // set = ($$value) => expression = $$value
        // But we can optimize: if get === set, omit set
        let set_expr = b::assign(expr.clone(), b::id("$$value"));
        let set = b::arrow(vec![b::id_pattern("$$value")], set_expr);

        (get, Some(set))
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
                return matches!(
                    binding.kind,
                    BindingKind::State | BindingKind::Derived | BindingKind::RawState
                );
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
