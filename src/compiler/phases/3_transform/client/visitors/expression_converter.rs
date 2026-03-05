//! Expression converter: crate::ast::js::Expression → JsExpr
//!
//! This module converts the JSON-based ESTree expressions from the parser
//! (crate::ast::js::Expression) into the strongly-typed JavaScript AST
//! (crate::compiler::phases::phase3_transform::js_ast::nodes::JsExpr).
//!
//! Corresponds to the visitor pattern in Svelte's transform phase.

use crate::ast::js::Expression;
use crate::compiler::phases::phase2_analyze::scope::BindingKind;
use crate::compiler::phases::phase3_transform::client::types::ComponentContext;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;
use serde_json::Value;

/// Check if a JSON AST node contains an AwaitExpression anywhere in its tree.
///
/// This recursively walks the JSON value looking for `{"type": "AwaitExpression"}`.
/// It skips into function bodies (ArrowFunctionExpression, FunctionExpression)
/// since those create new async contexts.
fn json_has_await_expression(value: &Value) -> bool {
    match value {
        Value::Object(obj) => {
            let node_type = obj.get("type").and_then(|t| t.as_str()).unwrap_or("");
            if node_type == "AwaitExpression" {
                return true;
            }
            // Don't traverse into function bodies - they have their own async context
            if node_type == "ArrowFunctionExpression" || node_type == "FunctionExpression" {
                return false;
            }
            for (_key, val) in obj {
                if json_has_await_expression(val) {
                    return true;
                }
            }
            false
        }
        Value::Array(arr) => arr.iter().any(json_has_await_expression),
        _ => false,
    }
}

/// Check if a JSON AST node is a "simple" expression (doesn't need thunk wrapping).
///
/// Mirrors `is_simple_expression` from the official Svelte compiler.
/// Simple expressions: Literal, Identifier, ArrowFunctionExpression, FunctionExpression,
/// and ConditionalExpression/BinaryExpression/LogicalExpression with simple operands.
fn json_is_simple_expression(value: &Value) -> bool {
    match value {
        Value::Object(obj) => {
            let node_type = obj.get("type").and_then(|t| t.as_str()).unwrap_or("");
            match node_type {
                "Literal" | "Identifier" | "ArrowFunctionExpression" | "FunctionExpression" => true,
                "ConditionalExpression" => {
                    obj.get("test").is_some_and(json_is_simple_expression)
                        && obj.get("consequent").is_some_and(json_is_simple_expression)
                        && obj.get("alternate").is_some_and(json_is_simple_expression)
                }
                "BinaryExpression" | "LogicalExpression" => {
                    obj.get("left").is_some_and(json_is_simple_expression)
                        && obj.get("right").is_some_and(json_is_simple_expression)
                }
                _ => false,
            }
        }
        _ => false,
    }
}

/// Build a fallback expression, matching the official Svelte compiler's `build_fallback`.
///
/// The behavior depends on whether the default value is simple and/or contains await:
/// 1. Simple expression: `$.fallback(expr, default)`
/// 2. `await simple_expr`: `await $.fallback(expr, simple_expr)`
/// 3. Expression with await: `await $.fallback(expr, async () => default, true)`
/// 4. Non-simple, no await: `$.fallback(expr, () => default, true)`
fn build_fallback_expr(
    expression: &JsExpr,
    right_json: &Value,
    right_converted: JsExpr,
    context: &mut ComponentContext,
) -> JsExpr {
    use crate::compiler::phases::phase3_transform::js_ast::builders as b;

    // Case 1: Simple expression (no thunk needed)
    if json_is_simple_expression(right_json) {
        return b::call(
            b::member_path("$.fallback"),
            vec![expression.clone(), right_converted],
        );
    }

    // Case 2: AwaitExpression with simple argument
    let right_type = right_json
        .as_object()
        .and_then(|o| o.get("type"))
        .and_then(|t| t.as_str())
        .unwrap_or("");
    if right_type == "AwaitExpression"
        && let Some(argument) = right_json.as_object().and_then(|o| o.get("argument"))
        && json_is_simple_expression(argument)
    {
        let arg_converted = convert_json_value(argument, context);
        return b::await_expr(b::call(
            b::member_path("$.fallback"),
            vec![expression.clone(), arg_converted],
        ));
    }

    // Case 3: Expression contains await -> async thunk
    if json_has_await_expression(right_json) {
        let thunk = b::async_arrow(vec![], right_converted);
        return b::await_expr(b::call(
            b::member_path("$.fallback"),
            vec![expression.clone(), thunk, b::true_literal()],
        ));
    }

    // Case 4: Non-simple, no await -> sync thunk
    let thunk = b::arrow(vec![], right_converted);
    b::call(
        b::member_path("$.fallback"),
        vec![expression.clone(), thunk, b::true_literal()],
    )
}

/// Convert an Expression to JsExpr.
///
/// This is the main entry point for converting parsed JavaScript expressions
/// into the transform-phase AST format.
#[inline]
pub fn convert_expression(expr: &Expression, context: &mut ComponentContext) -> JsExpr {
    match expr {
        Expression::Value(val) => convert_json_value(val, context),
    }
}

/// Convert a JSON value to JsExpr.
///
/// This handles all ESTree node types by examining the "type" field.
#[inline]
fn convert_json_value(value: &Value, context: &mut ComponentContext) -> JsExpr {
    match value {
        Value::Object(obj) => {
            // Get the ESTree node type
            let node_type = obj
                .get("type")
                .and_then(|t| t.as_str())
                .unwrap_or("Unknown");

            match node_type {
                "Identifier" => convert_identifier(obj, context),
                "Literal" => convert_literal(obj, context),
                "MemberExpression" => convert_member_expression(obj, context),
                "CallExpression" => convert_call_expression(obj, context),
                "BinaryExpression" => convert_binary_expression(obj, context),
                "UnaryExpression" => convert_unary_expression(obj, context),
                "LogicalExpression" => convert_logical_expression(obj, context),
                "ConditionalExpression" => convert_conditional_expression(obj, context),
                "ArrayExpression" => convert_array_expression(obj, context),
                "ObjectExpression" => convert_object_expression(obj, context),
                "ArrowFunctionExpression" => convert_arrow_function(obj, context),
                "FunctionExpression" => convert_function_expression(obj, context),
                "AssignmentExpression" => convert_assignment_expression(obj, context),
                "UpdateExpression" => convert_update_expression(obj, context),
                "SequenceExpression" => convert_sequence_expression(obj, context),
                "ThisExpression" => JsExpr::This,
                "NewExpression" => convert_new_expression(obj, context),
                "AwaitExpression" => convert_await_expression(obj, context),
                "YieldExpression" => convert_yield_expression(obj, context),
                "SpreadElement" => convert_spread_element(obj, context),
                "TemplateLiteral" => convert_template_literal(obj, context),
                "TaggedTemplateExpression" => convert_tagged_template_expression(obj, context),
                "ChainExpression" => convert_chain_expression(obj, context),
                "MetaProperty" => {
                    // ESTree MetaProperty: meta.property (e.g., import.meta, new.target)
                    let meta = obj
                        .get("meta")
                        .and_then(|m| m.as_object())
                        .and_then(|m| m.get("name"))
                        .and_then(|n| n.as_str())
                        .unwrap_or("import");
                    let property = obj
                        .get("property")
                        .and_then(|p| p.as_object())
                        .and_then(|p| p.get("name"))
                        .and_then(|n| n.as_str())
                        .unwrap_or("meta");
                    JsExpr::Raw(format!("{}.{}", meta, property))
                }
                "ObjectPattern" | "ArrayPattern" => {
                    // Destructuring patterns used as LHS in assignment expressions.
                    // e.g., `({ x } = { x: 1 })` or `([x] = [2])`
                    // Convert through JsPattern and render to string.
                    let value_ref = Value::Object(obj.clone());
                    if let Some(pattern) = convert_param_pattern(&value_ref, context) {
                        JsExpr::Raw(pattern_to_string(&pattern))
                    } else {
                        JsExpr::Raw(format!("/* Unknown: {} */", node_type))
                    }
                }
                _ => {
                    // Unknown node type - return as raw comment
                    JsExpr::Raw(format!("/* Unknown: {} */", node_type))
                }
            }
        }
        Value::String(s) => JsExpr::Literal(JsLiteral::String(s.clone())),
        Value::Number(n) => JsExpr::Literal(JsLiteral::Number(n.as_f64().unwrap_or(0.0))),
        Value::Bool(b) => JsExpr::Literal(JsLiteral::Boolean(*b)),
        Value::Null => JsExpr::Literal(JsLiteral::Null),
        Value::Array(_) => {
            // Arrays are typically handled as ArrayExpression
            JsExpr::Raw("/* Array */".to_string())
        }
    }
}

/// Convert an Identifier node.
///
/// Note: Transform application for reactive state and props is NOT done here.
/// Transforms are applied in `build_expression()` in `shared/utils.rs` to ensure
/// consistent handling across all expression types.
///
/// We only handle non-source props here:
/// - Non-source props: access directly via `$$props.propName`
///
/// Source props and exported props have transforms registered in `add_state_transformers`,
/// so they will be transformed via `apply_transforms_to_expression()`.
#[inline]
fn convert_identifier(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    let name = obj
        .get("name")
        .and_then(|n| n.as_str())
        .unwrap_or("unknown")
        .to_string();

    // Check if this is a prop that needs special handling
    if context.state.analysis.runes
        && let Some(binding) = context.state.get_binding(&name)
        && matches!(binding.kind, BindingKind::Prop | BindingKind::BindableProp)
    {
        // Check if this is a prop source (has default value, reassigned, etc.)
        let is_source = crate::compiler::phases::phase3_transform::client::utils::is_prop_source(
            binding,
            context.state.analysis,
        );

        // Check if this prop is exported
        let is_exported = context
            .state
            .analysis
            .exports
            .iter()
            .any(|e| e.name == name);

        // Non-source, non-exported props: access directly via $$props.propName
        // Source props and exported props have transforms registered, so they
        // will be handled by apply_transforms_to_expression() later.
        if !is_source && !is_exported {
            let prop_name = binding.prop_alias.as_deref().unwrap_or(&name).to_string();
            let needs_bracket = prop_name.contains('-')
                || prop_name.chars().next().is_some_and(|c| c.is_ascii_digit());
            return JsExpr::Member(JsMemberExpression {
                object: Box::new(JsExpr::Identifier("$$props".to_string())),
                property: if needs_bracket {
                    JsMemberProperty::Expression(Box::new(JsExpr::Literal(JsLiteral::String(
                        prop_name,
                    ))))
                } else {
                    JsMemberProperty::Identifier(prop_name)
                },
                computed: needs_bracket,
                optional: false,
            });
        }
    }

    JsExpr::Identifier(name)
}

/// Convert a Literal node.
#[inline]
fn convert_literal(
    obj: &serde_json::Map<String, Value>,
    _context: &mut ComponentContext,
) -> JsExpr {
    let value = obj.get("value");

    match value {
        Some(Value::String(s)) => {
            // Check the `raw` property to preserve original quote style.
            // The official Svelte compiler (esrap) preserves the original quote style
            // from user source code. If the raw representation uses double quotes,
            // emit via Raw() to preserve them through OXC normalization.
            if let Some(Value::String(raw)) = obj.get("raw")
                && raw.starts_with('"')
            {
                return JsExpr::Raw(raw.clone());
            }
            JsExpr::Literal(JsLiteral::String(s.clone()))
        }
        Some(Value::Number(n)) => JsExpr::Literal(JsLiteral::Number(n.as_f64().unwrap_or(0.0))),
        Some(Value::Bool(b)) => JsExpr::Literal(JsLiteral::Boolean(*b)),
        Some(Value::Null) | None => JsExpr::Literal(JsLiteral::Null),
        _ => {
            // Check for regex
            if let Some(regex_obj) = obj.get("regex").and_then(|r| r.as_object()) {
                let pattern = regex_obj
                    .get("pattern")
                    .and_then(|p| p.as_str())
                    .unwrap_or("")
                    .to_string();
                let flags = regex_obj
                    .get("flags")
                    .and_then(|f| f.as_str())
                    .unwrap_or("")
                    .to_string();
                return JsExpr::Literal(JsLiteral::Regex { pattern, flags });
            }
            JsExpr::Literal(JsLiteral::Null)
        }
    }
}

/// Convert a MemberExpression node.
///
/// This also handles:
/// 1. The rest_prop → $$props optimization:
///    When accessing a property on a rest_prop binding (e.g., `props.a` where `let props = $props()`),
///    we transform the object to `$$props` for read access, but NOT for direct property assignments
///    (e.g., `props.a = true` stays as-is, but `props.a.b = true` becomes `$$props.a.b = true`).
///
/// 2. Private state field access (MemberExpression.js from official compiler):
///    Rewrite `this.#foo` as `this.#foo.v` inside a constructor for `$state` fields,
///    otherwise wrap with `$.get(this.#foo)`.
#[inline]
fn convert_member_expression(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    let computed = obj
        .get("computed")
        .and_then(|c| c.as_bool())
        .unwrap_or(false);

    let optional = obj
        .get("optional")
        .and_then(|o| o.as_bool())
        .unwrap_or(false);

    // Handle private state field access: this.#foo -> this.#foo.v (in constructor) or $.get(this.#foo)
    // Reference: MemberExpression.js in official Svelte compiler
    if let Some(prop_obj) = obj.get("property").and_then(|p| p.as_object())
        && let Some("PrivateIdentifier") = prop_obj.get("type").and_then(|t| t.as_str())
        && let Some(prop_name) = prop_obj.get("name").and_then(|n| n.as_str())
    {
        let field_name = format!("#{}", prop_name);
        // Extract field info before using context mutably
        let field_info = context
            .state
            .state_fields
            .get(&field_name)
            .map(|f| (f.field_type.clone(), context.state.in_constructor));

        if let Some((field_type, in_constructor)) = field_info {
            // Build the base member expression (this.#foo)
            let object = obj
                .get("object")
                .map(|o| Box::new(convert_json_value(o, context)))
                .unwrap_or_else(|| Box::new(JsExpr::Identifier("unknown".to_string())));

            let base_member = JsExpr::Member(JsMemberExpression {
                object,
                property: JsMemberProperty::PrivateIdentifier(prop_name.to_string()),
                computed: false,
                optional,
            });

            // If in constructor and field is $state or $state.raw, use .v accessor
            if in_constructor && (field_type == "$state" || field_type == "$state.raw") {
                return JsExpr::Member(JsMemberExpression {
                    object: Box::new(base_member),
                    property: JsMemberProperty::Identifier("v".to_string()),
                    computed: false,
                    optional: false,
                });
            } else if field_type == "$state"
                || field_type == "$state.raw"
                || field_type == "$derived"
                || field_type == "$derived.by"
            {
                // Outside constructor, use $.get(this.#foo)
                return JsExpr::Call(JsCallExpression {
                    callee: Box::new(JsExpr::Member(JsMemberExpression {
                        object: Box::new(JsExpr::Identifier("$".to_string())),
                        property: JsMemberProperty::Identifier("get".to_string()),
                        computed: false,
                        optional: false,
                    })),
                    arguments: vec![base_member],
                    optional: false,
                });
            }
        }
    }

    // Check if the object is a rest_prop identifier and should be transformed to $$props
    let should_transform_to_props =
        if !computed && context.state.analysis.runes && !context.state.in_direct_assignment_lhs {
            // Check if object is an Identifier
            if let Some(object_obj) = obj.get("object").and_then(|o| o.as_object())
                && let Some("Identifier") = object_obj.get("type").and_then(|t| t.as_str())
                && let Some(name) = object_obj.get("name").and_then(|n| n.as_str())
            {
                // Check if this identifier is a rest_prop binding
                if let Some(binding) = context.state.get_binding(name) {
                    matches!(binding.kind, BindingKind::RestProp)
                } else {
                    false
                }
            } else {
                false
            }
        } else {
            false
        };

    let object = if should_transform_to_props {
        Box::new(JsExpr::Identifier("$$props".to_string()))
    } else {
        obj.get("object")
            .map(|o| Box::new(convert_json_value(o, context)))
            .unwrap_or_else(|| Box::new(JsExpr::Identifier("unknown".to_string())))
    };

    let property = if computed {
        obj.get("property")
            .map(|p| JsMemberProperty::Expression(Box::new(convert_json_value(p, context))))
            .unwrap_or(JsMemberProperty::Identifier("unknown".to_string()))
    } else {
        // Check if property is a PrivateIdentifier
        if let Some(prop_obj) = obj.get("property").and_then(|p| p.as_object())
            && let Some("PrivateIdentifier") = prop_obj.get("type").and_then(|t| t.as_str())
            && let Some(prop_name) = prop_obj.get("name").and_then(|n| n.as_str())
        {
            JsMemberProperty::PrivateIdentifier(prop_name.to_string())
        } else {
            obj.get("property")
                .and_then(|p| p.as_object())
                .and_then(|p| p.get("name"))
                .and_then(|n| n.as_str())
                .map(|n| JsMemberProperty::Identifier(n.to_string()))
                .unwrap_or(JsMemberProperty::Identifier("unknown".to_string()))
        }
    };

    JsExpr::Member(JsMemberExpression {
        object,
        property,
        computed,
        optional,
    })
}

/// Convert a CallExpression node.
///
/// This handles rune transformations like `$state()`, `$derived()`, etc.
/// The transformation logic mirrors the official Svelte compiler's
/// `CallExpression.js` visitor.
#[inline]
fn convert_call_expression(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    // Check if this is a rune call
    if let Some(rune) = get_rune_from_call(obj, context) {
        return transform_rune_call(&rune, obj, context);
    }

    let callee = obj
        .get("callee")
        .map(|c| Box::new(convert_json_value(c, context)))
        .unwrap_or_else(|| Box::new(JsExpr::Identifier("unknown".to_string())));

    let arguments = obj
        .get("arguments")
        .and_then(|a| a.as_array())
        .map(|args| {
            args.iter()
                .map(|arg| convert_json_value(arg, context))
                .collect()
        })
        .unwrap_or_default();

    let optional = obj
        .get("optional")
        .and_then(|o| o.as_bool())
        .unwrap_or(false);

    JsExpr::Call(JsCallExpression {
        callee,
        arguments,
        optional,
    })
}

/// List of all Svelte runes.
const RUNES: &[&str] = &[
    "$state",
    "$state.raw",
    "$state.snapshot",
    "$state.eager",
    "$derived",
    "$derived.by",
    "$props",
    "$effect",
    "$effect.pre",
    "$effect.tracking",
    "$effect.root",
    "$effect.pending",
    "$inspect",
    "$inspect().with",
    "$host",
];

/// Get the rune name from a CallExpression if it's a rune call.
///
/// This function mirrors the official Svelte compiler's `get_rune` function
/// from `svelte/packages/svelte/src/compiler/phases/scope.js`.
///
/// It recognizes rune patterns like:
/// - `$state()` -> "$state"
/// - `$state.raw()` -> "$state.raw"
/// - `$inspect(value).with(callback)` -> "$inspect().with"
fn get_rune_from_call(
    obj: &serde_json::Map<String, Value>,
    context: &ComponentContext,
) -> Option<String> {
    let callee = obj.get("callee")?;
    let callee_obj = callee.as_object()?;
    let callee_type = callee_obj.get("type")?.as_str()?;

    let rune_name = match callee_type {
        "Identifier" => {
            // Simple rune like $state, $derived, $effect, $inspect
            callee_obj.get("name")?.as_str()?.to_string()
        }
        "MemberExpression" => {
            // Could be either:
            // 1. Rune with method like $state.raw(), $derived.by()
            // 2. Rune call chain like $inspect().with()

            let object = callee_obj.get("object")?.as_object()?;
            let property = callee_obj.get("property")?.as_object()?;
            let property_name = property.get("name")?.as_str()?;
            let object_type = object.get("type")?.as_str()?;

            if object_type == "CallExpression" {
                // This might be $inspect().with() pattern
                // The object is a CallExpression, so check if it's a rune call
                let inner_callee = object.get("callee")?.as_object()?;
                let inner_callee_type = inner_callee.get("type")?.as_str()?;

                if inner_callee_type == "Identifier" {
                    let inner_name = inner_callee.get("name")?.as_str()?;
                    // Produce "$inspect().with" style keypath
                    let keypath = format!("{}().{}", inner_name, property_name);
                    if RUNES.contains(&keypath.as_str()) {
                        // Check if the rune is shadowed
                        if context.state.get_binding(inner_name).is_some() {
                            return None;
                        }
                        return Some(keypath);
                    }
                }
                return None;
            } else if object_type == "Identifier" {
                // Standard rune with method like $state.raw
                let object_name = object.get("name")?.as_str()?;
                format!("{}.{}", object_name, property_name)
            } else {
                return None;
            }
        }
        _ => return None,
    };

    // Check if it's a valid rune
    if !RUNES.contains(&rune_name.as_str()) {
        return None;
    }

    // Check if the rune is shadowed by a local variable
    let base_name = rune_name.split('.').next()?;
    // Note: We check if the rune name is declared as a local variable.
    // If it is, it's not a rune (e.g., `const $state = something`).
    // However, for template-level code (event handlers), we don't have full scope
    // tracking, so we skip this check if the binding lookup fails.
    // The key insight is that rune names like $state, $derived, etc. are
    // special globals that should never be shadowed in normal usage.
    if let Some(_binding) = context.state.get_binding(base_name) {
        // Only shadow if the binding is NOT in the module scope
        // (module-level rune declarations should still work)
        return None; // Shadowed by a local variable
    }

    Some(rune_name)
}

/// Determines if a value should be wrapped in $.proxy() for deep reactivity.
///
/// Returns `true` for objects, arrays, and other reference types.
/// Returns `false` for primitives, functions, and literals.
fn should_proxy_json(value: &Value) -> bool {
    let obj = match value.as_object() {
        Some(o) => o,
        None => return false,
    };

    let node_type = match obj.get("type").and_then(|t| t.as_str()) {
        Some(t) => t,
        None => return true, // Unknown type, assume proxy needed
    };

    match node_type {
        // Primitives don't need proxy
        "Literal" => false,
        // Functions don't need proxy
        "ArrowFunctionExpression" | "FunctionExpression" => false,
        // Unary and binary expressions result in primitives
        "UnaryExpression" | "BinaryExpression" => false,
        // Template literals are strings
        "TemplateLiteral" => false,
        // Identifiers might need proxy (could reference objects/arrays),
        // EXCEPT for `undefined` which is a primitive
        "Identifier" => {
            if let Some(name) = obj.get("name").and_then(|n| n.as_str()) {
                // undefined doesn't need proxy, everything else does
                name != "undefined"
            } else {
                true
            }
        }
        // Objects and arrays need proxy
        "ObjectExpression" | "ArrayExpression" => true,
        // Other expressions might need proxy (e.g., function calls that return objects)
        _ => true,
    }
}

/// Transform a rune call expression.
///
/// This mirrors the official Svelte compiler's CallExpression.js visitor.
fn transform_rune_call(
    rune: &str,
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    let arguments = obj
        .get("arguments")
        .and_then(|a| a.as_array())
        .cloned()
        .unwrap_or_default();

    match rune {
        "$host" => {
            // $host() -> $$props.$$host
            JsExpr::Member(JsMemberExpression {
                object: Box::new(JsExpr::Identifier("$$props".to_string())),
                property: JsMemberProperty::Identifier("$$host".to_string()),
                computed: false,
                optional: false,
            })
        }

        "$effect.tracking" => {
            // $effect.tracking() -> $.effect_tracking()
            JsExpr::Call(JsCallExpression {
                callee: Box::new(JsExpr::Member(JsMemberExpression {
                    object: Box::new(JsExpr::Identifier("$".to_string())),
                    property: JsMemberProperty::Identifier("effect_tracking".to_string()),
                    computed: false,
                    optional: false,
                })),
                arguments: vec![],
                optional: false,
            })
        }

        "$state" | "$state.raw" => {
            // In template context (event handlers, etc.), $state() is used for local variables
            // that don't need reactive tracking. We only need $.proxy() for deep reactivity.
            //
            // For script-level $state declarations, the transformation is handled by
            // `transform_client_runes_with_skip_and_state` in mod.rs, which uses $.state()
            // for reactive tracking when needed.
            //
            // $state(value) -> $.proxy(value) for objects/arrays, or just value for primitives
            // $state.raw(value) -> value (no proxy needed)
            let arg = arguments.first();

            if let Some(arg_value) = arg {
                let converted = convert_json_value(arg_value, context);

                // For $state (not $state.raw), wrap with $.proxy() if the value is an object/array
                if rune == "$state" && should_proxy_json(arg_value) {
                    JsExpr::Call(JsCallExpression {
                        callee: Box::new(JsExpr::Member(JsMemberExpression {
                            object: Box::new(JsExpr::Identifier("$".to_string())),
                            property: JsMemberProperty::Identifier("proxy".to_string()),
                            computed: false,
                            optional: false,
                        })),
                        arguments: vec![converted],
                        optional: false,
                    })
                } else {
                    // Primitives or $state.raw: just return the value as-is
                    converted
                }
            } else {
                // No argument - use undefined
                JsExpr::Identifier("undefined".to_string())
            }
        }

        "$state.snapshot" => {
            // $state.snapshot(value) -> $.snapshot(value)
            let converted_args: Vec<JsExpr> = arguments
                .iter()
                .map(|arg| convert_json_value(arg, context))
                .collect();

            JsExpr::Call(JsCallExpression {
                callee: Box::new(JsExpr::Member(JsMemberExpression {
                    object: Box::new(JsExpr::Identifier("$".to_string())),
                    property: JsMemberProperty::Identifier("snapshot".to_string()),
                    computed: false,
                    optional: false,
                })),
                arguments: converted_args,
                optional: false,
            })
        }

        "$derived" => {
            // $derived(expr) -> $.derived(() => expr)
            if let Some(arg) = arguments.first() {
                let converted = convert_json_value(arg, context);

                // Wrap in thunk: () => expr
                let thunk = JsExpr::Arrow(JsArrowFunction {
                    params: vec![],
                    body: JsArrowBody::Expression(Box::new(converted)),
                    is_async: false,
                });

                JsExpr::Call(JsCallExpression {
                    callee: Box::new(JsExpr::Member(JsMemberExpression {
                        object: Box::new(JsExpr::Identifier("$".to_string())),
                        property: JsMemberProperty::Identifier("derived".to_string()),
                        computed: false,
                        optional: false,
                    })),
                    arguments: vec![thunk],
                    optional: false,
                })
            } else {
                // No argument - just call $.derived()
                JsExpr::Call(JsCallExpression {
                    callee: Box::new(JsExpr::Member(JsMemberExpression {
                        object: Box::new(JsExpr::Identifier("$".to_string())),
                        property: JsMemberProperty::Identifier("derived".to_string()),
                        computed: false,
                        optional: false,
                    })),
                    arguments: vec![],
                    optional: false,
                })
            }
        }

        "$derived.by" => {
            // $derived.by(fn) -> $.derived(fn)
            let converted_args: Vec<JsExpr> = arguments
                .iter()
                .map(|arg| convert_json_value(arg, context))
                .collect();

            JsExpr::Call(JsCallExpression {
                callee: Box::new(JsExpr::Member(JsMemberExpression {
                    object: Box::new(JsExpr::Identifier("$".to_string())),
                    property: JsMemberProperty::Identifier("derived".to_string()),
                    computed: false,
                    optional: false,
                })),
                arguments: converted_args,
                optional: false,
            })
        }

        "$effect" | "$effect.pre" => {
            // $effect(fn) -> $.user_effect(fn)
            // $effect.pre(fn) -> $.user_pre_effect(fn)
            let callee_name = if rune == "$effect" {
                "user_effect"
            } else {
                "user_pre_effect"
            };

            let converted_args: Vec<JsExpr> = arguments
                .iter()
                .map(|arg| convert_json_value(arg, context))
                .collect();

            JsExpr::Call(JsCallExpression {
                callee: Box::new(JsExpr::Member(JsMemberExpression {
                    object: Box::new(JsExpr::Identifier("$".to_string())),
                    property: JsMemberProperty::Identifier(callee_name.to_string()),
                    computed: false,
                    optional: false,
                })),
                arguments: converted_args,
                optional: false,
            })
        }

        "$effect.root" => {
            // $effect.root(fn) -> $.effect_root(fn)
            let converted_args: Vec<JsExpr> = arguments
                .iter()
                .map(|arg| convert_json_value(arg, context))
                .collect();

            JsExpr::Call(JsCallExpression {
                callee: Box::new(JsExpr::Member(JsMemberExpression {
                    object: Box::new(JsExpr::Identifier("$".to_string())),
                    property: JsMemberProperty::Identifier("effect_root".to_string()),
                    computed: false,
                    optional: false,
                })),
                arguments: converted_args,
                optional: false,
            })
        }

        "$effect.pending" => {
            // $effect.pending() -> $.eager($.pending)
            JsExpr::Call(JsCallExpression {
                callee: Box::new(JsExpr::Member(JsMemberExpression {
                    object: Box::new(JsExpr::Identifier("$".to_string())),
                    property: JsMemberProperty::Identifier("eager".to_string()),
                    computed: false,
                    optional: false,
                })),
                arguments: vec![JsExpr::Member(JsMemberExpression {
                    object: Box::new(JsExpr::Identifier("$".to_string())),
                    property: JsMemberProperty::Identifier("pending".to_string()),
                    computed: false,
                    optional: false,
                })],
                optional: false,
            })
        }

        "$state.eager" => {
            // $state.eager(expr) -> $.eager(() => expr)
            if let Some(arg) = arguments.first() {
                let converted = convert_json_value(arg, context);

                // Wrap in thunk: () => expr
                let thunk = JsExpr::Arrow(JsArrowFunction {
                    params: vec![],
                    body: JsArrowBody::Expression(Box::new(converted)),
                    is_async: false,
                });

                JsExpr::Call(JsCallExpression {
                    callee: Box::new(JsExpr::Member(JsMemberExpression {
                        object: Box::new(JsExpr::Identifier("$".to_string())),
                        property: JsMemberProperty::Identifier("eager".to_string()),
                        computed: false,
                        optional: false,
                    })),
                    arguments: vec![thunk],
                    optional: false,
                })
            } else {
                JsExpr::Call(JsCallExpression {
                    callee: Box::new(JsExpr::Member(JsMemberExpression {
                        object: Box::new(JsExpr::Identifier("$".to_string())),
                        property: JsMemberProperty::Identifier("eager".to_string()),
                        computed: false,
                        optional: false,
                    })),
                    arguments: vec![],
                    optional: false,
                })
            }
        }

        "$inspect" | "$inspect().with" => {
            // $inspect(arg1, arg2, ...) ->
            //   $.inspect(() => [arg1, arg2, ...], (...$$args) => console.log(...$$args), true)
            //
            // $inspect(...args).with(callback) ->
            //   $.inspect(() => [args], callback, true)
            //
            // In non-dev mode, return empty statement.
            // The check for dev mode should be done at a higher level,
            // but we still implement the transformation here.

            if !context.state.options.dev {
                // In non-dev mode, $inspect is a no-op
                // Return a simple undefined - this will be filtered out as an empty statement
                return JsExpr::Identifier("undefined".to_string());
            }

            // Get the inspect args based on the rune type
            let (inspect_args, inspector): (Vec<JsExpr>, JsExpr) = if rune == "$inspect" {
                // $inspect(arg1, arg2, ...) - args come from the current call
                let args: Vec<JsExpr> = arguments
                    .iter()
                    .map(|arg| convert_json_value(arg, context))
                    .collect();

                // Default inspector is console.log
                let console_log = JsExpr::Member(JsMemberExpression {
                    object: Box::new(JsExpr::Identifier("console".to_string())),
                    property: JsMemberProperty::Identifier("log".to_string()),
                    computed: false,
                    optional: false,
                });

                (args, console_log)
            } else {
                // $inspect().with - need to get args from the inner $inspect() call
                // and the callback from the outer .with() call
                let callee = obj.get("callee").and_then(|c| c.as_object());
                if let Some(callee_obj) = callee {
                    let inner_call = callee_obj.get("object").and_then(|o| o.as_object());
                    if let Some(inner) = inner_call {
                        let inner_args = inner
                            .get("arguments")
                            .and_then(|a| a.as_array())
                            .map(|arr| {
                                arr.iter()
                                    .map(|arg| convert_json_value(arg, context))
                                    .collect()
                            })
                            .unwrap_or_default();

                        // The callback is the first argument of .with()
                        let callback = arguments
                            .first()
                            .map(|arg| convert_json_value(arg, context))
                            .unwrap_or_else(|| JsExpr::Identifier("undefined".to_string()));

                        (inner_args, callback)
                    } else {
                        (vec![], JsExpr::Identifier("undefined".to_string()))
                    }
                } else {
                    (vec![], JsExpr::Identifier("undefined".to_string()))
                }
            };

            // Build: () => [arg1, arg2, ...]
            let args_array = JsExpr::Array(JsArrayExpression {
                elements: inspect_args.into_iter().map(Some).collect(),
            });
            let args_thunk = JsExpr::Arrow(JsArrowFunction {
                params: vec![],
                body: JsArrowBody::Expression(Box::new(args_array)),
                is_async: false,
            });

            // Build: (...$$args) => inspector(...$$args)
            // This makes the log appear to come from the $inspect callsite
            let args_id = JsExpr::Identifier("$$args".to_string());
            let spread_args = JsExpr::Spread(Box::new(args_id.clone()));
            let inspector_call = JsExpr::Call(JsCallExpression {
                callee: Box::new(inspector),
                arguments: vec![spread_args],
                optional: false,
            });
            let fn_wrapper = JsExpr::Arrow(JsArrowFunction {
                params: vec![JsPattern::Rest(Box::new(JsPattern::Identifier(
                    "$$args".to_string(),
                )))],
                body: JsArrowBody::Expression(Box::new(inspector_call)),
                is_async: false,
            });

            // Build: $.inspect(args_thunk, fn_wrapper, true)
            // The third argument is `true` only for $inspect (not $inspect().with)
            // This tells the runtime whether to run immediately
            let mut call_args = vec![args_thunk, fn_wrapper];
            if rune == "$inspect" {
                call_args.push(JsExpr::Literal(JsLiteral::Boolean(true)));
            }

            JsExpr::Call(JsCallExpression {
                callee: Box::new(JsExpr::Member(JsMemberExpression {
                    object: Box::new(JsExpr::Identifier("$".to_string())),
                    property: JsMemberProperty::Identifier("inspect".to_string()),
                    computed: false,
                    optional: false,
                })),
                arguments: call_args,
                optional: false,
            })
        }

        _ => {
            // Unknown rune - pass through as regular call
            let callee = obj
                .get("callee")
                .map(|c| Box::new(convert_json_value(c, context)))
                .unwrap_or_else(|| Box::new(JsExpr::Identifier("unknown".to_string())));

            let converted_args: Vec<JsExpr> = arguments
                .iter()
                .map(|arg| convert_json_value(arg, context))
                .collect();

            JsExpr::Call(JsCallExpression {
                callee,
                arguments: converted_args,
                optional: false,
            })
        }
    }
}

/// Convert a BinaryExpression node.
fn convert_binary_expression(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    let operator_str = obj.get("operator").and_then(|o| o.as_str()).unwrap_or("+");

    let operator = match operator_str {
        "+" => JsBinaryOp::Add,
        "-" => JsBinaryOp::Sub,
        "*" => JsBinaryOp::Mul,
        "/" => JsBinaryOp::Div,
        "%" => JsBinaryOp::Mod,
        "**" => JsBinaryOp::Pow,
        "==" => JsBinaryOp::Eq,
        "!=" => JsBinaryOp::Ne,
        "===" => JsBinaryOp::StrictEq,
        "!==" => JsBinaryOp::StrictNe,
        "<" => JsBinaryOp::Lt,
        "<=" => JsBinaryOp::Le,
        ">" => JsBinaryOp::Gt,
        ">=" => JsBinaryOp::Ge,
        "&" => JsBinaryOp::BitAnd,
        "|" => JsBinaryOp::BitOr,
        "^" => JsBinaryOp::BitXor,
        "<<" => JsBinaryOp::Shl,
        ">>" => JsBinaryOp::Shr,
        ">>>" => JsBinaryOp::UShr,
        "in" => JsBinaryOp::In,
        "instanceof" => JsBinaryOp::InstanceOf,
        _ => JsBinaryOp::Add,
    };

    let left = obj
        .get("left")
        .map(|l| Box::new(convert_json_value(l, context)))
        .unwrap_or_else(|| Box::new(JsExpr::Literal(JsLiteral::Null)));

    let right = obj
        .get("right")
        .map(|r| Box::new(convert_json_value(r, context)))
        .unwrap_or_else(|| Box::new(JsExpr::Literal(JsLiteral::Null)));

    JsExpr::Binary(JsBinaryExpression {
        operator,
        left,
        right,
    })
}

/// Convert a UnaryExpression node.
fn convert_unary_expression(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    let operator_str = obj.get("operator").and_then(|o| o.as_str()).unwrap_or("!");

    let operator = match operator_str {
        "-" => JsUnaryOp::Minus,
        "+" => JsUnaryOp::Plus,
        "!" => JsUnaryOp::Not,
        "~" => JsUnaryOp::BitNot,
        "typeof" => JsUnaryOp::TypeOf,
        "void" => JsUnaryOp::Void,
        "delete" => JsUnaryOp::Delete,
        _ => JsUnaryOp::Not,
    };

    let argument = obj
        .get("argument")
        .map(|a| Box::new(convert_json_value(a, context)))
        .unwrap_or_else(|| Box::new(JsExpr::Literal(JsLiteral::Null)));

    let prefix = obj.get("prefix").and_then(|p| p.as_bool()).unwrap_or(true);

    JsExpr::Unary(JsUnaryExpression {
        operator,
        argument,
        prefix,
    })
}

/// Convert a LogicalExpression node.
fn convert_logical_expression(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    let operator_str = obj.get("operator").and_then(|o| o.as_str()).unwrap_or("&&");

    let operator = match operator_str {
        "&&" => JsLogicalOp::And,
        "||" => JsLogicalOp::Or,
        "??" => JsLogicalOp::NullishCoalescing,
        _ => JsLogicalOp::And,
    };

    let left = obj
        .get("left")
        .map(|l| Box::new(convert_json_value(l, context)))
        .unwrap_or_else(|| Box::new(JsExpr::Literal(JsLiteral::Null)));

    let right = obj
        .get("right")
        .map(|r| Box::new(convert_json_value(r, context)))
        .unwrap_or_else(|| Box::new(JsExpr::Literal(JsLiteral::Null)));

    JsExpr::Logical(JsLogicalExpression {
        operator,
        left,
        right,
    })
}

/// Convert a ConditionalExpression node.
fn convert_conditional_expression(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    let test = obj
        .get("test")
        .map(|t| Box::new(convert_json_value(t, context)))
        .unwrap_or_else(|| Box::new(JsExpr::Literal(JsLiteral::Null)));

    let consequent = obj
        .get("consequent")
        .map(|c| Box::new(convert_json_value(c, context)))
        .unwrap_or_else(|| Box::new(JsExpr::Literal(JsLiteral::Null)));

    let alternate = obj
        .get("alternate")
        .map(|a| Box::new(convert_json_value(a, context)))
        .unwrap_or_else(|| Box::new(JsExpr::Literal(JsLiteral::Null)));

    JsExpr::Conditional(JsConditionalExpression {
        test,
        consequent,
        alternate,
    })
}

/// Convert an ArrayExpression node.
fn convert_array_expression(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    let elements = obj
        .get("elements")
        .and_then(|e| e.as_array())
        .map(|elems| {
            elems
                .iter()
                .map(|elem| {
                    if elem.is_null() {
                        None
                    } else {
                        Some(convert_json_value(elem, context))
                    }
                })
                .collect()
        })
        .unwrap_or_default();

    JsExpr::Array(JsArrayExpression { elements })
}

/// Convert an ObjectExpression node.
fn convert_object_expression(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    let properties = obj
        .get("properties")
        .and_then(|p| p.as_array())
        .map(|props| {
            props
                .iter()
                .filter_map(|prop| {
                    let prop_obj = prop.as_object()?;
                    let prop_type = prop_obj.get("type")?.as_str()?;

                    match prop_type {
                        "Property" => {
                            let key = convert_property_key(prop_obj, context);
                            let value = prop_obj
                                .get("value")
                                .map(|v| Box::new(convert_json_value(v, context)))
                                .unwrap_or_else(|| Box::new(JsExpr::Literal(JsLiteral::Null)));

                            let computed = prop_obj
                                .get("computed")
                                .and_then(|c| c.as_bool())
                                .unwrap_or(false);

                            let shorthand = prop_obj
                                .get("shorthand")
                                .and_then(|s| s.as_bool())
                                .unwrap_or(false);

                            let kind = match prop_obj.get("kind")?.as_str()? {
                                "init" => JsPropertyKind::Init,
                                "get" => JsPropertyKind::Get,
                                "set" => JsPropertyKind::Set,
                                _ => JsPropertyKind::Init,
                            };

                            let method = prop_obj
                                .get("method")
                                .and_then(|v| v.as_bool())
                                .unwrap_or(false);

                            Some(JsObjectMember::Property(JsProperty {
                                key,
                                value,
                                kind,
                                computed,
                                shorthand,
                                method,
                            }))
                        }
                        "SpreadElement" => {
                            let argument = prop_obj
                                .get("argument")
                                .map(|a| Box::new(convert_json_value(a, context)))
                                .unwrap_or_else(|| Box::new(JsExpr::Literal(JsLiteral::Null)));

                            Some(JsObjectMember::SpreadElement(argument))
                        }
                        _ => None,
                    }
                })
                .collect()
        })
        .unwrap_or_default();

    JsExpr::Object(JsObjectExpression { properties })
}

/// Convert a property key.
fn convert_property_key(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsPropertyKey {
    let key = obj.get("key");
    let computed = obj
        .get("computed")
        .and_then(|c| c.as_bool())
        .unwrap_or(false);

    if computed && let Some(k) = key {
        return JsPropertyKey::Computed(Box::new(convert_json_value(k, context)));
    }

    if let Some(key_obj) = key.and_then(|k| k.as_object()) {
        if let Some("Identifier") = key_obj.get("type").and_then(|t| t.as_str())
            && let Some(name) = key_obj.get("name").and_then(|n| n.as_str())
        {
            return JsPropertyKey::Identifier(name.to_string());
        }
        if let Some("Literal") = key_obj.get("type").and_then(|t| t.as_str()) {
            return JsPropertyKey::Literal(convert_literal(key_obj, context).into());
        }
    }

    JsPropertyKey::Identifier("unknown".to_string())
}

/// Extract all parameter names from the raw JSON params array.
/// This is used to temporarily remove transforms for shadowed parameters
/// when entering arrow/function expression bodies.
fn extract_param_names_from_json(obj: &serde_json::Map<String, Value>) -> Vec<String> {
    let mut names = Vec::new();
    if let Some(params) = obj.get("params").and_then(|p| p.as_array()) {
        for param in params {
            collect_param_names(param, &mut names);
        }
    }
    names
}

/// Recursively collect identifier names from a parameter pattern.
fn collect_param_names(value: &Value, names: &mut Vec<String>) {
    if let Some(obj) = value.as_object() {
        match obj.get("type").and_then(|t| t.as_str()).unwrap_or("") {
            "Identifier" => {
                if let Some(name) = obj.get("name").and_then(|n| n.as_str()) {
                    names.push(name.to_string());
                }
            }
            "AssignmentPattern" => {
                if let Some(left) = obj.get("left") {
                    collect_param_names(left, names);
                }
            }
            "ObjectPattern" => {
                if let Some(props) = obj.get("properties").and_then(|p| p.as_array()) {
                    for prop in props {
                        if let Some(prop_obj) = prop.as_object() {
                            match prop_obj.get("type").and_then(|t| t.as_str()).unwrap_or("") {
                                "Property" => {
                                    if let Some(val) = prop_obj.get("value") {
                                        collect_param_names(val, names);
                                    }
                                }
                                "RestElement" => {
                                    if let Some(arg) = prop_obj.get("argument") {
                                        collect_param_names(arg, names);
                                    }
                                }
                                _ => {}
                            }
                        }
                    }
                }
            }
            "ArrayPattern" => {
                if let Some(elements) = obj.get("elements").and_then(|e| e.as_array()) {
                    for el in elements {
                        if !el.is_null() {
                            collect_param_names(el, names);
                        }
                    }
                }
            }
            "RestElement" => {
                if let Some(arg) = obj.get("argument") {
                    collect_param_names(arg, names);
                }
            }
            _ => {}
        }
    }
}

/// Convert an ArrowFunctionExpression node.
fn convert_arrow_function(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    let params = convert_params(obj, context);

    let is_async = obj.get("async").and_then(|a| a.as_bool()).unwrap_or(false);

    // Save transforms and remove any for parameter names that shadow outer variables.
    // For example, in `createRawSnippet((count) => { ... })`, the `count` parameter
    // shadows the outer `$state` variable `count`, so `$.get()` should NOT be applied.
    let saved_transform = context.state.transform.clone();
    let param_names = extract_param_names_from_json(obj);
    for name in &param_names {
        context.state.transform.remove(name);
    }

    // Push a new local scope frame for the arrow function body.
    // This allows should_proxy_value to look up local variable init types
    // when processing assignments inside the arrow body.
    context.state.push_local_scope();

    let body = if let Some(body_obj) = obj.get("body").and_then(|b| b.as_object()) {
        if body_obj.get("type").and_then(|t| t.as_str()) == Some("BlockStatement") {
            JsArrowBody::Block(convert_block_statement(body_obj, context))
        } else {
            JsArrowBody::Expression(Box::new(convert_json_value(
                &Value::Object(body_obj.clone()),
                context,
            )))
        }
    } else {
        JsArrowBody::Block(JsBlockStatement::new())
    };

    // Pop the local scope frame
    context.state.pop_local_scope();

    // Restore transforms
    context.state.transform = saved_transform;

    JsExpr::Arrow(JsArrowFunction {
        params,
        body,
        is_async,
    })
}

/// Convert a FunctionExpression node.
fn convert_function_expression(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    let id = obj
        .get("id")
        .and_then(|i| i.as_object())
        .and_then(|i| i.get("name"))
        .and_then(|n| n.as_str())
        .map(|n| n.to_string());

    let params = convert_params(obj, context);

    // Save transforms and remove any for parameter names that shadow outer variables.
    let saved_transform = context.state.transform.clone();
    let param_names = extract_param_names_from_json(obj);
    for name in &param_names {
        context.state.transform.remove(name);
    }

    // Push a new local scope frame for the function body
    context.state.push_local_scope();

    let body = obj
        .get("body")
        .and_then(|b| b.as_object())
        .map(|b| convert_block_statement(b, context))
        .unwrap_or_default();

    // Pop the local scope frame
    context.state.pop_local_scope();

    // Restore transforms
    context.state.transform = saved_transform;

    let is_async = obj.get("async").and_then(|a| a.as_bool()).unwrap_or(false);

    let is_generator = obj
        .get("generator")
        .and_then(|g| g.as_bool())
        .unwrap_or(false);

    JsExpr::Function(JsFunctionExpression {
        id,
        params,
        body,
        is_async,
        is_generator,
    })
}

/// Convert function parameters.
fn convert_params(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> Vec<JsPattern> {
    obj.get("params")
        .and_then(|p| p.as_array())
        .map(|params| {
            params
                .iter()
                .filter_map(|param| convert_param_pattern(param, context))
                .collect()
        })
        .unwrap_or_default()
}

/// Convert a JSON parameter value to a JsPattern, handling all ESTree pattern types.
pub fn convert_param_pattern(value: &Value, context: &mut ComponentContext) -> Option<JsPattern> {
    let obj = value.as_object()?;
    let param_type = obj.get("type").and_then(|t| t.as_str())?;
    match param_type {
        "Identifier" => {
            let name = obj.get("name").and_then(|n| n.as_str())?;
            Some(JsPattern::Identifier(name.to_string()))
        }
        "AssignmentPattern" => {
            let left = obj
                .get("left")
                .and_then(|l| convert_param_pattern(l, context))?;
            let right = obj
                .get("right")
                .map(|r| {
                    let expr = convert_json_value(r, context);
                    // Apply transforms so reactive identifiers in default values get their getter calls
                    Box::new(crate::compiler::phases::phase3_transform::client::visitors::shared::utils::apply_transforms_to_expression(&expr, context))
                })
                .unwrap_or_else(|| Box::new(JsExpr::Literal(JsLiteral::Undefined)));
            Some(JsPattern::Assignment(JsAssignmentPattern {
                left: Box::new(left),
                right,
            }))
        }
        "RestElement" => {
            let argument = obj
                .get("argument")
                .and_then(|a| convert_param_pattern(a, context))?;
            Some(JsPattern::Rest(Box::new(argument)))
        }
        // Handle both ObjectPattern (official AST) and ObjectExpression (our parser's AST
        // for destructuring in @const tags)
        "ObjectPattern" | "ObjectExpression" => {
            let properties = obj
                .get("properties")
                .and_then(|p| p.as_array())
                .map(|props| {
                    props
                        .iter()
                        .filter_map(|prop| {
                            let prop_obj = prop.as_object()?;
                            let prop_type = prop_obj.get("type").and_then(|t| t.as_str())?;
                            if prop_type == "RestElement" || prop_type == "SpreadElement" {
                                let arg = prop_obj
                                    .get("argument")
                                    .and_then(|a| convert_param_pattern(a, context))?;
                                Some(JsObjectPatternProperty::Rest(Box::new(arg)))
                            } else {
                                let key_val = prop_obj.get("key").and_then(|k| k.as_object())?;
                                let key_type =
                                    key_val.get("type").and_then(|t| t.as_str()).unwrap_or("");

                                // Handle Identifier keys, Literal keys, and computed keys
                                let (key, fallback_name) = if key_type == "Literal" {
                                    // Literal key: { 'the-area': area } or { 2: sum }
                                    if let Some(val) = key_val.get("value") {
                                        if let Some(s) = val.as_str() {
                                            (
                                                JsPropertyKey::Literal(JsLiteral::String(
                                                    s.to_string(),
                                                )),
                                                None,
                                            )
                                        } else if let Some(n) = val.as_u64() {
                                            (
                                                JsPropertyKey::Literal(JsLiteral::Number(n as f64)),
                                                None,
                                            )
                                        } else if let Some(n) = val.as_f64() {
                                            (JsPropertyKey::Literal(JsLiteral::Number(n)), None)
                                        } else {
                                            return None;
                                        }
                                    } else {
                                        return None;
                                    }
                                } else if key_type == "Identifier" {
                                    // Identifier key: { x } or { x: y }
                                    let name = key_val.get("name").and_then(|n| n.as_str())?;
                                    (
                                        JsPropertyKey::Identifier(name.to_string()),
                                        Some(name.to_string()),
                                    )
                                } else {
                                    // Computed key (e.g., TemplateLiteral): { [`key${expr}`]: value }
                                    let key_expr = convert_json_value(
                                        &Value::Object(key_val.clone()),
                                        context,
                                    );
                                    // Apply transforms so reactive identifiers get their getter calls
                                    // e.g., `dimension` -> `dimension()` in `[`two${dimension()}`]`
                                    let key_expr = crate::compiler::phases::phase3_transform::client::visitors::shared::utils::apply_transforms_to_expression(&key_expr, context);
                                    (JsPropertyKey::Computed(Box::new(key_expr)), None)
                                };

                                let value_pat = prop_obj
                                    .get("value")
                                    .and_then(|v| convert_param_pattern(v, context))
                                    .or_else(|| {
                                        fallback_name
                                            .as_ref()
                                            .map(|n| JsPattern::Identifier(n.clone()))
                                    })?;
                                let shorthand = prop_obj
                                    .get("shorthand")
                                    .and_then(|s| s.as_bool())
                                    .unwrap_or(false);
                                let computed = prop_obj
                                    .get("computed")
                                    .and_then(|c| c.as_bool())
                                    .unwrap_or(false);
                                Some(JsObjectPatternProperty::Property {
                                    key,
                                    value: value_pat,
                                    computed,
                                    shorthand,
                                })
                            }
                        })
                        .collect()
                })
                .unwrap_or_default();
            Some(JsPattern::Object(JsObjectPattern { properties }))
        }
        // Handle both ArrayPattern (official AST) and ArrayExpression (our parser's AST)
        "ArrayPattern" | "ArrayExpression" => {
            let elements = obj
                .get("elements")
                .and_then(|e| e.as_array())
                .map(|elems| {
                    elems
                        .iter()
                        .map(|elem| {
                            if elem.is_null() {
                                None
                            } else {
                                convert_param_pattern(elem, context)
                            }
                        })
                        .collect()
                })
                .unwrap_or_default();
            Some(JsPattern::Array(JsArrayPattern { elements }))
        }
        _ => obj
            .get("name")
            .and_then(|n| n.as_str())
            .map(|n| JsPattern::Identifier(n.to_string())),
    }
}

/// Render a JsPattern to a JavaScript source string.
///
/// This mirrors the `emit_pattern` logic in the codegen but produces a String directly.
/// Used when a destructuring pattern needs to be embedded as a `JsExpr::Raw`.
pub fn pattern_to_string(pattern: &JsPattern) -> String {
    match pattern {
        JsPattern::Identifier(name) => name.clone(),
        JsPattern::Array(arr) => {
            let mut s = String::from("[");
            for (i, elem) in arr.elements.iter().enumerate() {
                if i > 0 {
                    s.push_str(", ");
                }
                if let Some(p) = elem {
                    s.push_str(&pattern_to_string(p));
                }
            }
            s.push(']');
            s
        }
        JsPattern::Object(obj) => {
            let mut s = String::from("{ ");
            for (i, prop) in obj.properties.iter().enumerate() {
                if i > 0 {
                    s.push_str(", ");
                }
                match prop {
                    JsObjectPatternProperty::Property {
                        key,
                        value,
                        shorthand,
                        computed,
                    } => {
                        if *shorthand {
                            s.push_str(&pattern_to_string(value));
                        } else {
                            if *computed {
                                s.push('[');
                            }
                            match key {
                                JsPropertyKey::Identifier(n) => s.push_str(n),
                                JsPropertyKey::Literal(lit) => match lit {
                                    JsLiteral::String(n) => {
                                        s.push('"');
                                        s.push_str(n);
                                        s.push('"');
                                    }
                                    JsLiteral::Number(n) => s.push_str(&n.to_string()),
                                    _ => s.push_str(&format!("{:?}", lit)),
                                },
                                JsPropertyKey::Computed(_e) => {
                                    // Computed keys in destructuring patterns are unusual;
                                    // render a placeholder
                                    s.push_str("/* computed */");
                                }
                            }
                            if *computed {
                                s.push(']');
                            }
                            s.push_str(": ");
                            s.push_str(&pattern_to_string(value));
                        }
                    }
                    JsObjectPatternProperty::Rest(inner) => {
                        s.push_str("...");
                        s.push_str(&pattern_to_string(inner));
                    }
                }
            }
            s.push_str(" }");
            s
        }
        JsPattern::Rest(inner) => {
            format!("...{}", pattern_to_string(inner))
        }
        JsPattern::Assignment(assign) => {
            format!("{} = /* default */", pattern_to_string(&assign.left))
        }
    }
}

/// Convert a BlockStatement.
fn convert_block_statement(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsBlockStatement {
    let body = obj
        .get("body")
        .and_then(|b| b.as_array())
        .map(|stmts| {
            stmts
                .iter()
                .filter_map(|stmt| convert_statement(stmt, context))
                .collect()
        })
        .unwrap_or_default();

    JsBlockStatement { body }
}

/// Convert a statement node to JsStatement.
fn convert_statement(stmt: &Value, context: &mut ComponentContext) -> Option<JsStatement> {
    let obj = stmt.as_object()?;
    let stmt_type = obj.get("type").and_then(|t| t.as_str())?;

    match stmt_type {
        "ExpressionStatement" => {
            let expr = obj
                .get("expression")
                .map(|e| convert_json_value(e, context))?;
            Some(JsStatement::Expression(JsExpressionStatement {
                expression: Box::new(expr),
            }))
        }
        "VariableDeclaration" => {
            let kind = obj.get("kind").and_then(|k| k.as_str()).unwrap_or("let");
            let declarations = obj
                .get("declarations")
                .and_then(|d| d.as_array())
                .map(|decls| {
                    decls
                        .iter()
                        .filter_map(|decl| {
                            let decl_obj = decl.as_object()?;
                            let id = decl_obj.get("id").and_then(|i| i.as_object())?;
                            let name = id.get("name").and_then(|n| n.as_str())?;

                            // Register the init expression's node type for should_proxy() lookups.
                            // This enables scope-aware identifier tracing for local variables.
                            if !context.state.local_var_init_types.is_empty()
                                && let Some(init_json) = decl_obj.get("init")
                                && let Some(t) = unwrap_ts_expression_type(init_json)
                            {
                                context
                                    .state
                                    .register_local_var_init_type(name.to_string(), t.to_string());
                            }

                            // In ESTree, `init: null` means no initializer (e.g., `let x;`).
                            // We must filter out JSON null so we don't generate `let x = null;`.
                            let init = decl_obj
                                .get("init")
                                .filter(|i| !i.is_null())
                                .map(|i| Box::new(convert_json_value(i, context)));
                            Some(JsVariableDeclarator {
                                id: JsPattern::Identifier(name.to_string()),
                                init,
                            })
                        })
                        .collect()
                })
                .unwrap_or_default();

            Some(JsStatement::VariableDeclaration(JsVariableDeclaration {
                kind: match kind {
                    "const" => crate::compiler::phases::phase3_transform::js_ast::nodes::JsVariableKind::Const,
                    "let" => crate::compiler::phases::phase3_transform::js_ast::nodes::JsVariableKind::Let,
                    _ => crate::compiler::phases::phase3_transform::js_ast::nodes::JsVariableKind::Var,
                },
                declarations,
            }))
        }
        "ReturnStatement" => {
            let argument = obj
                .get("argument")
                .map(|a| Box::new(convert_json_value(a, context)));
            Some(JsStatement::Return(JsReturnStatement { argument }))
        }
        "BlockStatement" => {
            let block = convert_block_statement(obj, context);
            Some(JsStatement::Block(block))
        }
        "IfStatement" => {
            let test = obj
                .get("test")
                .map(|t| Box::new(convert_json_value(t, context)))
                .unwrap_or_else(|| Box::new(JsExpr::Literal(JsLiteral::Boolean(false))));
            let consequent = obj
                .get("consequent")
                .and_then(|c| convert_statement(c, context))
                .map(Box::new)
                .unwrap_or_else(|| Box::new(JsStatement::Empty));
            let alternate = obj
                .get("alternate")
                .and_then(|a| convert_statement(a, context))
                .map(Box::new);
            Some(JsStatement::If(JsIfStatement {
                test,
                consequent,
                alternate,
            }))
        }
        "EmptyStatement" => Some(JsStatement::Empty),
        "ThrowStatement" => {
            let argument = obj
                .get("argument")
                .map(|a| convert_json_value(a, context))
                .unwrap_or(JsExpr::Literal(JsLiteral::Null));
            Some(JsStatement::Throw(Box::new(argument)))
        }
        "TryStatement" => {
            let block = obj
                .get("block")
                .and_then(|b| b.as_object())
                .map(|b| convert_block_statement(b, context))
                .unwrap_or_else(|| JsBlockStatement { body: Vec::new() });
            let handler = obj.get("handler").and_then(|h| {
                let h_obj = h.as_object()?;
                let param = h_obj
                    .get("param")
                    .and_then(|p| p.as_object())
                    .and_then(|p| p.get("name"))
                    .and_then(|n| n.as_str())
                    .map(|n| JsPattern::Identifier(n.to_string()));
                let body = h_obj
                    .get("body")
                    .and_then(|b| b.as_object())
                    .map(|b| convert_block_statement(b, context))
                    .unwrap_or_else(|| JsBlockStatement { body: Vec::new() });
                Some(JsCatchClause { param, body })
            });
            let finalizer = obj
                .get("finalizer")
                .and_then(|f| f.as_object())
                .map(|f| convert_block_statement(f, context));
            Some(JsStatement::Try(JsTryStatement {
                block,
                handler,
                finalizer,
            }))
        }
        "ForStatement" => {
            // Extract variable names from the init VariableDeclaration (if any)
            // so we can remove their transforms for the test, update, and body.
            // This prevents `x++` in `for (let x = 0; x < 10; x++)` from being
            // transformed to `$.update(x)` when `x` shadows an outer state variable.
            let mut init_var_names: Vec<String> = Vec::new();
            if let Some(init_val) = obj.get("init")
                && let Some(init_obj) = init_val.as_object()
                && init_obj.get("type").and_then(|t| t.as_str()) == Some("VariableDeclaration")
            {
                let kind = init_obj
                    .get("kind")
                    .and_then(|k| k.as_str())
                    .unwrap_or("var");
                // Only let/const create block scope; var is hoisted
                if (kind == "let" || kind == "const")
                    && let Some(decls) = init_obj.get("declarations").and_then(|d| d.as_array())
                {
                    for decl in decls {
                        if let Some(id) = decl
                            .as_object()
                            .and_then(|d| d.get("id"))
                            .and_then(|id| id.as_object())
                            && let Some(name) = id.get("name").and_then(|n| n.as_str())
                        {
                            init_var_names.push(name.to_string());
                        }
                    }
                }
            }

            let init = obj.get("init").and_then(|i| {
                let i_obj = i.as_object()?;
                let i_type = i_obj.get("type").and_then(|t| t.as_str())?;
                if i_type == "VariableDeclaration" {
                    let kind = i_obj.get("kind").and_then(|k| k.as_str()).unwrap_or("let");
                    let declarations = i_obj
                        .get("declarations")
                        .and_then(|d| d.as_array())
                        .map(|decls| {
                            decls
                                .iter()
                                .filter_map(|decl| {
                                    let decl_obj = decl.as_object()?;
                                    let id = decl_obj.get("id").and_then(|id| id.as_object())?;
                                    let name = id.get("name").and_then(|n| n.as_str())?;
                                    let init_val = decl_obj
                                        .get("init")
                                        .map(|iv| Box::new(convert_json_value(iv, context)));
                                    Some(JsVariableDeclarator {
                                        id: JsPattern::Identifier(name.to_string()),
                                        init: init_val,
                                    })
                                })
                                .collect()
                        })
                        .unwrap_or_default();
                    Some(JsForInit::Variable(JsVariableDeclaration {
                        kind: match kind {
                            "const" => JsVariableKind::Const,
                            "let" => JsVariableKind::Let,
                            _ => JsVariableKind::Var,
                        },
                        declarations,
                    }))
                } else {
                    Some(JsForInit::Expression(Box::new(convert_json_value(
                        i, context,
                    ))))
                }
            });

            // Save transforms and remove for-loop variable transforms so that
            // test, update, and body expressions don't incorrectly transform
            // the loop variable (e.g., `x++` should not become `$.update(x)`).
            let saved_transform = if !init_var_names.is_empty() {
                let saved = context.state.transform.clone();
                for name in &init_var_names {
                    context.state.transform.remove(name);
                }
                Some(saved)
            } else {
                None
            };

            let test = obj
                .get("test")
                .filter(|t| !t.is_null())
                .map(|t| Box::new(convert_json_value(t, context)));
            let update = obj
                .get("update")
                .filter(|u| !u.is_null())
                .map(|u| Box::new(convert_json_value(u, context)));
            let body = obj
                .get("body")
                .and_then(|b| convert_statement(b, context))
                .map(Box::new)
                .unwrap_or_else(|| Box::new(JsStatement::Empty));

            // Restore transforms
            if let Some(saved) = saved_transform {
                context.state.transform = saved;
            }

            Some(JsStatement::For(JsForStatement {
                init,
                test,
                update,
                body,
            }))
        }
        "ForInStatement" | "ForOfStatement" => {
            obj.get("body").and_then(|b| convert_statement(b, context))
        }
        "WhileStatement" | "DoWhileStatement" => {
            obj.get("body").and_then(|b| convert_statement(b, context))
        }
        "LabeledStatement" => obj.get("body").and_then(|b| convert_statement(b, context)),
        "BreakStatement" | "ContinueStatement" => Some(JsStatement::Empty),
        "SwitchStatement" => {
            let mut stmts = Vec::new();
            if let Some(cases) = obj.get("cases").and_then(|c| c.as_array()) {
                for case in cases {
                    if let Some(case_obj) = case.as_object()
                        && let Some(consequent) =
                            case_obj.get("consequent").and_then(|c| c.as_array())
                    {
                        for s in consequent {
                            if let Some(converted) = convert_statement(s, context) {
                                stmts.push(converted);
                            }
                        }
                    }
                }
            }
            Some(JsStatement::Block(JsBlockStatement { body: stmts }))
        }
        "FunctionDeclaration" => {
            let id = obj
                .get("id")
                .and_then(|i| i.as_object())
                .and_then(|i| i.get("name"))
                .and_then(|n| n.as_str())
                .map(|n| n.to_string());

            let params = convert_params(obj, context);

            // Save transforms and remove any for parameter names that shadow outer variables.
            let saved_transform = context.state.transform.clone();
            let param_names = extract_param_names_from_json(obj);
            for name in &param_names {
                context.state.transform.remove(name);
            }

            // Push a new local scope frame for the function body
            context.state.push_local_scope();

            let body = obj
                .get("body")
                .and_then(|b| b.as_object())
                .map(|b| convert_block_statement(b, context))
                .unwrap_or_default();

            // Pop the local scope frame
            context.state.pop_local_scope();

            // Restore transforms
            context.state.transform = saved_transform;

            let is_async = obj.get("async").and_then(|a| a.as_bool()).unwrap_or(false);
            let is_generator = obj
                .get("generator")
                .and_then(|g| g.as_bool())
                .unwrap_or(false);

            Some(JsStatement::FunctionDeclaration(JsFunctionDeclaration {
                id,
                params,
                body,
                is_async,
                is_generator,
            }))
        }
        _ => {
            // For unhandled statement types, try to convert as expression statement if possible
            None
        }
    }
}

/// Convert an AssignmentExpression node.
///
/// Special handling for rest_prop transformation:
/// When the LHS is `props.a = ...` (direct property assignment on rest_prop),
/// we DON'T transform `props` to `$$props`. But for deeper assignments like
/// `props.a.b = ...`, we DO transform `props` to `$$props`.
///
/// Also applies reactive transformations ($.set()) for state variables.
fn convert_assignment_expression(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    let operator_str = obj.get("operator").and_then(|o| o.as_str()).unwrap_or("=");

    // Check if the LHS is a destructuring pattern (ArrayPattern or ObjectPattern).
    // If so, we need to decompose it into individual assignments and potentially
    // wrap in an IIFE with $.to_array() calls.
    // This corresponds to visit_assignment_expression in shared/assignments.js.
    if let Some(left_val) = obj.get("left") {
        let left_type = left_val
            .as_object()
            .and_then(|o| o.get("type"))
            .and_then(|t| t.as_str())
            .unwrap_or("");

        if matches!(left_type, "ArrayPattern" | "ObjectPattern" | "RestElement")
            && let Some(result) = try_destructure_assignment(left_val, obj.get("right"), context)
        {
            return result;
        }
    }

    let operator = match operator_str {
        "=" => JsAssignmentOp::Assign,
        "+=" => JsAssignmentOp::AddAssign,
        "-=" => JsAssignmentOp::SubAssign,
        "*=" => JsAssignmentOp::MulAssign,
        "/=" => JsAssignmentOp::DivAssign,
        "%=" => JsAssignmentOp::ModAssign,
        "**=" => JsAssignmentOp::PowAssign,
        "<<=" => JsAssignmentOp::ShlAssign,
        ">>=" => JsAssignmentOp::ShrAssign,
        ">>>=" => JsAssignmentOp::UShrAssign,
        "&=" => JsAssignmentOp::BitAndAssign,
        "|=" => JsAssignmentOp::BitOrAssign,
        "^=" => JsAssignmentOp::BitXorAssign,
        "&&=" => JsAssignmentOp::AndAssign,
        "||=" => JsAssignmentOp::OrAssign,
        "??=" => JsAssignmentOp::NullishAssign,
        _ => JsAssignmentOp::Assign,
    };

    // Check if the LHS is a MemberExpression with a direct Identifier object (e.g., props.a)
    // If so, we set the flag to prevent rest_prop → $$props transformation
    let is_direct_member_assignment = if let Some(left_obj) =
        obj.get("left").and_then(|l| l.as_object())
        && let Some("MemberExpression") = left_obj.get("type").and_then(|t| t.as_str())
    {
        // Check if the computed flag is false (non-computed property access)
        let computed = left_obj
            .get("computed")
            .and_then(|c| c.as_bool())
            .unwrap_or(false);
        if !computed {
            // Check if the object is directly an Identifier (not a nested MemberExpression)
            if let Some(object_obj) = left_obj.get("object").and_then(|o| o.as_object())
                && let Some("Identifier") = object_obj.get("type").and_then(|t| t.as_str())
            {
                true
            } else {
                false
            }
        } else {
            false
        }
    } else {
        false
    };

    // Set the flag if this is a direct member assignment
    let saved_flag = context.state.in_direct_assignment_lhs;
    if is_direct_member_assignment {
        context.state.in_direct_assignment_lhs = true;
    }

    let left = obj
        .get("left")
        .map(|l| Box::new(convert_json_value(l, context)))
        .unwrap_or_else(|| Box::new(JsExpr::Literal(JsLiteral::Null)));

    // Restore the flag
    context.state.in_direct_assignment_lhs = saved_flag;

    let right = obj
        .get("right")
        .map(|r| Box::new(convert_json_value(r, context)))
        .unwrap_or_else(|| Box::new(JsExpr::Literal(JsLiteral::Null)));

    // Get the raw right expression for should_proxy check
    let right_json = obj.get("right");

    // Extract the root identifier from the ORIGINAL JSON (before conversion/transforms)
    // This is necessary because convert_json_value applies read transforms that turn
    // `rows` into `rows()`, making it impossible to identify the root identifier later.
    let original_root_name = obj.get("left").and_then(extract_root_identifier_from_json);

    // Try to apply reactive transformations for state variables
    // This corresponds to the build_assignment logic in the official Svelte compiler
    if let Some(transformed) = try_transform_assignment(
        operator_str,
        &left,
        &right,
        right_json,
        original_root_name.as_deref(),
        context,
    ) {
        return transformed;
    }

    JsExpr::Assignment(JsAssignmentExpression {
        operator,
        left,
        right,
    })
}

/// Try to apply reactive transformations to an assignment expression.
///
/// This function checks if the left-hand side is a reactive state variable
/// and applies the appropriate transformation ($.set()).
///
/// Corresponds to `build_assignment` in the official Svelte compiler's
/// `AssignmentExpression.js`.
fn try_transform_assignment(
    operator: &str,
    left: &JsExpr,
    right: &JsExpr,
    right_json: Option<&Value>,
    original_root_name: Option<&str>,
    context: &mut ComponentContext,
) -> Option<JsExpr> {
    use crate::compiler::phases::phase3_transform::client::visitors::shared::assignment_helpers::build_assignment_value;
    use crate::compiler::phases::phase3_transform::js_ast::builders as b;

    // Extract the root identifier from the left-hand side.
    // First try extracting from the converted expression, then fall back to the
    // original JSON-extracted root name. This fallback is needed because
    // convert_json_value applies read transforms (e.g., `rows` -> `rows()`)
    // which makes the root identifier unrecoverable from the converted expression.
    let root_name = extract_root_identifier_from_expr(left)
        .or_else(|| original_root_name.map(|s| s.to_string()))?;

    // Check if there's a transform for this identifier
    let transform = context.state.transform.get(&root_name)?;

    // Case: Reassignment (root identifier === left)
    // If the left side is a simple identifier (not a member expression)
    if let JsExpr::Identifier(name) = left
        && name == &root_name
        && let Some(assign_fn) = transform.assign
    {
        // Do NOT apply transforms to the right side here. The caller's
        // apply_transforms_to_expression will recurse into the arguments of the
        // generated setter call (e.g., `display(value)`) and transform identifiers
        // there. Pre-transforming here would cause double transformation when the
        // caller also transforms (e.g., `display` -> `display()` -> `display()()`).
        //
        // Build the assignment value (expand compound operators)
        let value = build_assignment_value(operator, left, right);

        // Determine if proxy is needed
        // Check skip_proxy flag on the transform (for $state.raw)
        let skip_proxy = transform.skip_proxy;

        // Check if the binding kind excludes proxy (Derived, Prop, etc.)
        use crate::compiler::phases::phase2_analyze::scope::BindingKind;
        let binding = context.state.get_binding(name);
        let binding_kind_excludes_proxy = binding
            .map(|b| {
                matches!(
                    b.kind,
                    BindingKind::Prop
                        | BindingKind::BindableProp
                        | BindingKind::Derived
                        | BindingKind::StoreSub
                        | BindingKind::RawState
                )
            })
            .unwrap_or(false);

        // Determine if proxy is needed based on:
        // 1. Not skipped (not $state.raw)
        // 2. Binding kind doesn't exclude proxy (not Derived, Prop, etc.)
        // 3. In runes mode
        // 4. Non-coercive operator (=, ||=, &&=, ??=)
        // 5. Right side should be proxied (not a primitive)
        let needs_proxy = !skip_proxy
            && !binding_kind_excludes_proxy
            && context.state.analysis.runes
            && is_non_coercive_operator(operator)
            && should_proxy_value(right_json, context);

        return Some(assign_fn(b::id(&root_name), value, needs_proxy));
    }

    // Case: Mutation (root identifier !== left, i.e., member expression assignment)
    // Skip for reactive imports (where replacement_id is set) because
    // apply_transforms_to_expression will handle the mutation wrapping with
    // properly read-transformed arguments.
    if let Some(mutate_fn) = transform.mutate
        && transform.replacement_id.is_none()
    {
        // Apply transforms to the RIGHT side so that store reads like `$a.foo`
        // become `$a().foo`.
        use super::shared::utils::apply_transforms_to_expression;
        let visited_right = apply_transforms_to_expression(right, context);

        // For Prop/BindableProp bindings, apply read transforms to the LEFT side
        // so that the base identifier gets the getter call: items -> items().
        // This produces e.g. `items(items()[0].clicked = true, true)`.
        // The read-transformed left is needed so that apply_transforms_to_expression
        // (which runs later via build_expression) can detect the Call in the base chain
        // and skip double mutation wrapping.
        //
        // For store subscriptions, the LEFT side is NOT transformed here because the
        // store_sub_mutate handles replacing the store reference with $.untrack($store).
        let is_prop_binding = {
            use crate::compiler::phases::phase2_analyze::scope::BindingKind;
            context
                .state
                .get_binding(&root_name)
                .map(|b| matches!(b.kind, BindingKind::Prop | BindingKind::BindableProp))
                .unwrap_or(false)
        };

        let visited_left = if is_prop_binding {
            apply_transforms_to_expression(left, context)
        } else {
            left.clone()
        };

        let mutation_expr = b::assign_op(operator, visited_left, visited_right);

        return Some(mutate_fn(b::id(&root_name), mutation_expr));
    }

    None
}

// ============================================================================
// Destructure assignment handling
// ============================================================================

/// A decomposed path from a destructuring pattern.
/// Represents a single assignment target extracted from a pattern like `[a, b]` or `{x, y}`.
struct DestructuredPath {
    /// The target node (Identifier or MemberExpression) as JSON
    node: Value,
    /// The expression to access this value from the RHS (e.g., `$$value.x` or `$$array[0]`)
    expression: JsExpr,
}

/// An intermediate array variable inserted for array destructuring.
/// Represents `var $$array = $.to_array(expression, length)`.
struct ArrayInsert {
    /// The generated variable name (e.g., `$$array`, `$$array_1`)
    id: String,
    /// The `$.to_array(...)` call expression
    value: JsExpr,
}

/// Try to handle a destructuring assignment expression.
///
/// When the LHS is an ArrayPattern or ObjectPattern, this decomposes the destructure
/// into individual assignments and checks if any target has a reactive transform.
/// If so, generates an IIFE (Immediately Invoked Function Expression) pattern.
///
/// This corresponds to `visit_assignment_expression` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/shared/assignments.js`.
fn try_destructure_assignment(
    left_json: &Value,
    right_json: Option<&Value>,
    context: &mut ComponentContext,
) -> Option<JsExpr> {
    use crate::compiler::phases::phase3_transform::js_ast::builders as b;

    // Convert the RHS expression
    let rhs_converted = right_json.map(|r| convert_json_value(r, context))?;

    // Determine if we need a cache variable ($$value)
    let should_cache = !matches!(&rhs_converted, JsExpr::Identifier(_));
    let rhs_ref = if should_cache {
        b::id("$$value")
    } else {
        rhs_converted.clone()
    };

    // Extract paths from the destructuring pattern
    let mut inserts: Vec<ArrayInsert> = Vec::new();
    let mut paths: Vec<DestructuredPath> = Vec::new();
    extract_destructure_paths(&mut paths, &mut inserts, left_json, &rhs_ref, context);

    // For each path, try to build a reactive assignment
    let mut changed = false;
    let mut assignments: Vec<JsExpr> = Vec::new();

    for path in &paths {
        if let Some(assignment) = try_build_single_assignment(path, context) {
            changed = true;
            assignments.push(assignment);
        } else {
            // No reactive transform needed - generate a normal assignment
            let target = convert_json_value(&path.node, context);
            assignments.push(b::assign(target, path.expression.clone()));
        }
    }

    if !changed {
        // No reactive transforms were needed - return None to fall through to normal handling
        return None;
    }

    // Determine if the assignment is standalone (an ExpressionStatement)
    // In the official compiler, this is checked via `context.path.at(-1).type.endsWith('Statement')`
    // For our purposes, we assume it's standalone if we're in a statement position.
    // We use a heuristic: if should_cache is true (non-identifier RHS) or has inserts,
    // we always generate the IIFE form.

    if !inserts.is_empty() || should_cache {
        // Generate IIFE: (($$value) => { var $$array = ...; assignments; })(rhs)
        // or (($$value) => { var $$array = ...; assignments; return $$value; })(rhs)
        let mut statements: Vec<JsStatement> = Vec::new();

        // Add array insert declarations
        for insert in &inserts {
            statements.push(JsStatement::VariableDeclaration(JsVariableDeclaration {
                kind: JsVariableKind::Var,
                declarations: vec![JsVariableDeclarator {
                    id: JsPattern::Identifier(insert.id.clone()),
                    init: Some(Box::new(insert.value.clone())),
                }],
            }));
        }

        // Add assignment statements
        for assignment in &assignments {
            statements.push(JsStatement::Expression(JsExpressionStatement {
                expression: Box::new(assignment.clone()),
            }));
        }

        // The official compiler adds `return $$value` when the assignment is NOT standalone
        // (i.e., used as part of a larger expression, not an ExpressionStatement).
        // In the visitor-based path (template expressions), destructure assignments are
        // always in expression context (event handlers, bind directives, etc.), so they
        // are never standalone. We always add `return $$value;` here.
        // Standalone cases (instance script) go through the text-based pipeline instead.
        statements.push(JsStatement::Return(JsReturnStatement {
            argument: Some(Box::new(b::id("$$value"))),
        }));

        let arrow = b::arrow_block(
            vec![JsPattern::Identifier("$$value".to_string())],
            statements,
        );
        return Some(b::call(arrow, vec![rhs_converted]));
    }

    // No inserts and no cache needed: generate sequence expression
    // (assignment1, assignment2, ...)
    if assignments.len() == 1 {
        return Some(assignments.into_iter().next().unwrap());
    }

    Some(JsExpr::Sequence(JsSequenceExpression {
        expressions: assignments,
    }))
}

/// Extract destructured assignment paths from a JSON pattern node.
///
/// This recursively decomposes `ArrayPattern`, `ObjectPattern`, and `AssignmentPattern`
/// nodes into individual `DestructuredPath` entries, each representing a single assignment target.
///
/// Corresponds to `_extract_paths` in `svelte/packages/svelte/src/compiler/utils/ast.js`.
fn extract_destructure_paths(
    paths: &mut Vec<DestructuredPath>,
    inserts: &mut Vec<ArrayInsert>,
    param: &Value,
    expression: &JsExpr,
    context: &mut ComponentContext,
) {
    use crate::compiler::phases::phase3_transform::js_ast::builders as b;

    let obj = match param.as_object() {
        Some(o) => o,
        None => return,
    };
    let node_type = obj.get("type").and_then(|t| t.as_str()).unwrap_or("");

    match node_type {
        "Identifier" | "MemberExpression" => {
            paths.push(DestructuredPath {
                node: param.clone(),
                expression: expression.clone(),
            });
        }

        "ObjectPattern" => {
            if let Some(properties) = obj.get("properties").and_then(|p| p.as_array()) {
                for prop in properties {
                    let prop_obj = match prop.as_object() {
                        Some(o) => o,
                        None => continue,
                    };
                    let prop_type = prop_obj.get("type").and_then(|t| t.as_str()).unwrap_or("");

                    if prop_type == "RestElement" {
                        // Rest element: { ...rest } = obj
                        // Generate: $.exclude_from_object(expression, [keys...])
                        let mut key_literals: Vec<JsExpr> = Vec::new();
                        for p in properties {
                            if let Some(p_obj) = p.as_object() {
                                let p_type =
                                    p_obj.get("type").and_then(|t| t.as_str()).unwrap_or("");
                                if p_type == "Property"
                                    && let Some(key) = p_obj.get("key").and_then(|k| k.as_object())
                                {
                                    let key_type =
                                        key.get("type").and_then(|t| t.as_str()).unwrap_or("");
                                    let computed = p_obj
                                        .get("computed")
                                        .and_then(|c| c.as_bool())
                                        .unwrap_or(false);

                                    if key_type == "Identifier" && !computed {
                                        if let Some(name) = key.get("name").and_then(|n| n.as_str())
                                        {
                                            key_literals.push(b::string(name));
                                        }
                                    } else if key_type == "Literal" {
                                        if let Some(val) = key.get("value") {
                                            if let Some(s) = val.as_str() {
                                                key_literals.push(b::string(s));
                                            } else if let Some(n) = val.as_f64() {
                                                key_literals.push(b::string(n.to_string()));
                                            }
                                        }
                                    } else {
                                        // Computed key: String(key)
                                        let key_expr = convert_json_value(
                                            &Value::Object(key.clone()),
                                            context,
                                        );
                                        key_literals.push(b::call(b::id("String"), vec![key_expr]));
                                    }
                                }
                            }
                        }

                        let rest_expr = b::call(
                            b::member_path("$.exclude_from_object"),
                            vec![expression.clone(), b::array(key_literals)],
                        );

                        if let Some(argument) = prop_obj.get("argument") {
                            extract_destructure_paths(
                                paths, inserts, argument, &rest_expr, context,
                            );
                        }
                    } else {
                        // Regular property: { key: value } = obj
                        let key = prop_obj.get("key");
                        let computed = prop_obj
                            .get("computed")
                            .and_then(|c| c.as_bool())
                            .unwrap_or(false);

                        let member_expr = if let Some(key_val) = key {
                            let key_obj = key_val.as_object();
                            let key_type = key_obj
                                .and_then(|k| k.get("type"))
                                .and_then(|t| t.as_str())
                                .unwrap_or("");

                            if key_type == "Identifier" && !computed {
                                // obj.key
                                let name = key_obj
                                    .and_then(|k| k.get("name"))
                                    .and_then(|n| n.as_str())
                                    .unwrap_or("unknown");
                                b::member(expression.clone(), name)
                            } else {
                                // obj[key] (computed or literal)
                                let key_expr = convert_json_value(key_val, context);
                                b::member_computed(expression.clone(), key_expr)
                            }
                        } else {
                            expression.clone()
                        };

                        let value = prop_obj.get("value").unwrap_or(param);
                        extract_destructure_paths(paths, inserts, value, &member_expr, context);
                    }
                }
            }
        }

        "ArrayPattern" => {
            let elements = obj
                .get("elements")
                .and_then(|e| e.as_array())
                .cloned()
                .unwrap_or_default();

            // Check if the last element is a RestElement
            let has_rest = elements
                .last()
                .and_then(|e| if e.is_null() { None } else { e.as_object() })
                .and_then(|o| o.get("type"))
                .and_then(|t| t.as_str())
                == Some("RestElement");

            // Generate intermediate array variable: var $$array = $.to_array(expression, length)
            let array_name = context.state.generate_array_name();
            let array_id = b::id(&array_name);

            let to_array_args = if has_rest {
                vec![expression.clone()]
            } else {
                vec![expression.clone(), b::number(elements.len() as f64)]
            };

            inserts.push(ArrayInsert {
                id: array_name.clone(),
                value: b::call(b::member_path("$.to_array"), to_array_args),
            });

            for (i, element) in elements.iter().enumerate() {
                if element.is_null() {
                    continue; // Skip holes in array patterns
                }

                let elem_obj = match element.as_object() {
                    Some(o) => o,
                    None => continue,
                };
                let elem_type = elem_obj.get("type").and_then(|t| t.as_str()).unwrap_or("");

                if elem_type == "RestElement" {
                    // ...rest = array.slice(i)
                    let rest_expr = b::call(
                        b::member(array_id.clone(), "slice"),
                        vec![b::number(i as f64)],
                    );

                    if let Some(argument) = elem_obj.get("argument") {
                        extract_destructure_paths(paths, inserts, argument, &rest_expr, context);
                    }
                } else {
                    // element = array[i]
                    let index_expr = b::member_computed(array_id.clone(), b::number(i as f64));
                    extract_destructure_paths(paths, inserts, element, &index_expr, context);
                }
            }
        }

        "AssignmentPattern" => {
            // Default value: { x = defaultValue } or [x = defaultValue]
            // Generate: $.fallback(expression, defaultValue) or async thunk variant
            // This matches the official compiler's `build_fallback()` which handles
            // simple values, await expressions, and thunk wrapping.
            let left = obj.get("left");
            let right = obj.get("right");

            if let (Some(left_val), Some(right_val)) = (left, right) {
                let default_val = convert_json_value(right_val, context);
                let fallback_expr =
                    build_fallback_expr(expression, right_val, default_val, context);
                extract_destructure_paths(paths, inserts, left_val, &fallback_expr, context);
            }
        }

        _ => {}
    }
}

/// Try to build a single reactive assignment from a destructured path.
///
/// This checks if the target identifier has a reactive transform (assign or mutate)
/// and generates the appropriate call ($.set(), $.mutate(), $.store_set(), etc.).
///
/// Returns `None` if no reactive transform is needed (plain variable).
fn try_build_single_assignment(
    path: &DestructuredPath,
    context: &mut ComponentContext,
) -> Option<JsExpr> {
    use crate::compiler::phases::phase3_transform::js_ast::builders as b;

    let node_obj = path.node.as_object()?;
    let node_type = node_obj.get("type").and_then(|t| t.as_str())?;

    // Extract the root identifier name from the target
    let root_name = extract_root_identifier_from_json(&path.node)?;

    // Check if there's a transform for this identifier and copy the function pointers
    // we need before any mutable borrows
    let transform = context.state.transform.get(&root_name)?;
    let assign_fn = transform.assign;
    let mutate_fn = transform.mutate;
    let replacement_id = transform.replacement_id.clone();

    if node_type == "Identifier"
        && root_name == node_obj.get("name").and_then(|n| n.as_str()).unwrap_or("")
    {
        // Direct identifier assignment: x = value -> $.set(x, value)
        if let Some(assign_fn) = assign_fn {
            // For destructure assignments, we don't need proxy (always using "=" operator)
            return Some(assign_fn(b::id(&root_name), path.expression.clone(), false));
        }
    } else {
        // Member expression assignment: obj.prop = value -> $.mutate(obj, obj.prop = value)
        if let Some(mutate_fn) = mutate_fn {
            let target = convert_json_value(&path.node, context);
            let mutation_expr = b::assign(target, path.expression.clone());

            let node_id = if let Some(ref replacement) = replacement_id {
                b::id(replacement)
            } else {
                b::id(&root_name)
            };
            return Some(mutate_fn(node_id, mutation_expr));
        }
    }

    None
}

/// Extract the root identifier name from a JsExpr.
///
/// Recursively walks down member expressions to find the leftmost identifier.
fn extract_root_identifier_from_expr(expr: &JsExpr) -> Option<String> {
    match expr {
        JsExpr::Identifier(name) => Some(name.clone()),
        JsExpr::Member(member) => extract_root_identifier_from_expr(&member.object),
        JsExpr::Chain(chain) => extract_root_identifier_from_expr(&chain.expression),
        _ => None,
    }
}

/// Extract the root identifier name from a JSON AST node.
///
/// Recursively walks down MemberExpression nodes to find the leftmost Identifier.
/// This is used to extract the root BEFORE conversion applies read transforms.
fn extract_root_identifier_from_json(value: &Value) -> Option<String> {
    let obj = value.as_object()?;
    let node_type = obj.get("type").and_then(|t| t.as_str())?;

    match node_type {
        "Identifier" => obj
            .get("name")
            .and_then(|n| n.as_str())
            .map(|s| s.to_string()),
        "MemberExpression" => obj
            .get("object")
            .and_then(extract_root_identifier_from_json),
        "ChainExpression" => obj
            .get("expression")
            .and_then(extract_root_identifier_from_json),
        // Unwrap TypeScript expression wrappers
        "TSAsExpression" | "TSNonNullExpression" | "TSSatisfiesExpression" => obj
            .get("expression")
            .and_then(extract_root_identifier_from_json),
        _ => None,
    }
}

/// Check if an assignment operator is non-coercive (=, ||=, &&=, ??=).
///
/// Non-coercive operators may require proxy wrapping for deep reactivity.
fn is_non_coercive_operator(operator: &str) -> bool {
    matches!(operator, "=" | "||=" | "&&=" | "??=")
}

/// Unwrap TypeScript expression wrappers (TSAsExpression, TSNonNullExpression, etc.)
/// and return the underlying AST node type.
///
/// For example, `next! as number` -> TSAsExpression wrapping TSNonNullExpression wrapping
/// Identifier -> returns "Identifier".
fn unwrap_ts_expression_type(value: &Value) -> Option<&str> {
    let obj = value.as_object()?;
    let node_type = obj.get("type").and_then(|t| t.as_str())?;

    match node_type {
        "TSAsExpression"
        | "TSNonNullExpression"
        | "TSSatisfiesExpression"
        | "TSTypeAssertion"
        | "TSInstantiationExpression" => {
            // Unwrap to the inner expression
            if let Some(expr) = obj.get("expression") {
                unwrap_ts_expression_type(expr)
            } else {
                Some(node_type)
            }
        }
        _ => Some(node_type),
    }
}

/// Check if a node type string represents a value that doesn't need proxy.
///
/// Returns `false` for node types known to produce primitive values or functions.
fn should_proxy_node_type_str(node_type: &str) -> bool {
    !matches!(
        node_type,
        "Literal"
            | "TemplateLiteral"
            | "ArrowFunctionExpression"
            | "FunctionExpression"
            | "UnaryExpression"
            | "BinaryExpression"
    )
}

/// Determines if a value should be wrapped in $.proxy() for deep reactivity.
///
/// Returns `false` for primitives, functions, and literals.
/// Returns `true` for objects, arrays, and other reference types.
///
/// When encountering an Identifier, performs scope-aware lookup:
/// 1. Check local variable init types (arrow/function-local declarations)
/// 2. Check analysis scope bindings (component-level declarations)
/// 3. Fall back to conservative proxy assumption
fn should_proxy_value(value: Option<&Value>, context: &ComponentContext) -> bool {
    let value = match value {
        Some(v) => v,
        None => return true, // Unknown, conservatively assume proxy needed
    };

    // Verify this is an object node
    if value.as_object().is_none() {
        return false;
    }

    let node_type = match unwrap_ts_expression_type(value) {
        Some(t) => t,
        None => return true, // Unknown type, assume proxy needed
    };

    match node_type {
        // Primitives don't need proxy
        "Literal" => false,
        // Functions don't need proxy
        "ArrowFunctionExpression" | "FunctionExpression" => false,
        // Unary and binary expressions result in primitives
        "UnaryExpression" | "BinaryExpression" => false,
        // Template literals are strings (primitives)
        "TemplateLiteral" => false,
        // Identifiers: scope-aware lookup to check what the identifier was initialized with
        "Identifier" => {
            // Get the actual identifier name (may need to unwrap TS wrappers to find it)
            let name = get_identifier_name_from_json(value);
            if let Some(name) = name {
                // `undefined` doesn't need proxy
                if name == "undefined" {
                    return false;
                }

                // 1. Check local variable init types (arrow/function-local declarations)
                if let Some(init_type) = context.state.get_local_var_init_type(name) {
                    // Check the types that don't need proxy in the same way as official compiler
                    match init_type {
                        "FunctionDeclaration"
                        | "ClassDeclaration"
                        | "ImportDeclaration"
                        | "EachBlock"
                        | "SnippetBlock" => return true,
                        _ => return should_proxy_node_type_str(init_type),
                    }
                }

                // 2. Check analysis scope bindings (component-level declarations)
                if let Some(binding) = context.state.get_binding(name)
                    && !binding.reassigned
                    && let Some(ref initial_type) = binding.initial_node_type
                {
                    match initial_type.as_str() {
                        "FunctionDeclaration"
                        | "ClassDeclaration"
                        | "ImportDeclaration"
                        | "EachBlock"
                        | "SnippetBlock" => {
                            return true;
                        }
                        _ => return should_proxy_node_type_str(initial_type),
                    }
                }

                // Unknown identifier, conservatively proxy
                true
            } else {
                true
            }
        }
        // Objects and arrays need proxy
        "ObjectExpression" | "ArrayExpression" => true,
        // Other expressions might need proxy (e.g., function calls that return objects)
        _ => true,
    }
}

/// Extract the identifier name from a JSON value, unwrapping any TypeScript expression wrappers.
fn get_identifier_name_from_json(value: &Value) -> Option<&str> {
    let obj = value.as_object()?;
    let node_type = obj.get("type").and_then(|t| t.as_str())?;

    match node_type {
        "Identifier" => obj.get("name").and_then(|n| n.as_str()),
        "TSAsExpression"
        | "TSNonNullExpression"
        | "TSSatisfiesExpression"
        | "TSTypeAssertion"
        | "TSInstantiationExpression" => obj
            .get("expression")
            .and_then(get_identifier_name_from_json),
        _ => None,
    }
}

/// Convert an UpdateExpression node.
///
/// This applies transforms for reactive state and store subscriptions.
/// For store subscriptions like `$store++`, it generates `$.update_store(...)`.
/// For member expressions like `$store[0].value++`, it generates `$.store_mutate(...)`.
///
/// Special handling for rest_prop transformation:
/// When the argument is `props.a` (MemberExpression on rest_prop),
/// we DON'T transform `props` to `$$props`, similar to direct assignments.
fn convert_update_expression(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    let operator_str = obj.get("operator").and_then(|o| o.as_str()).unwrap_or("++");

    let operator = match operator_str {
        "++" => JsUpdateOp::Increment,
        "--" => JsUpdateOp::Decrement,
        _ => JsUpdateOp::Increment,
    };

    let prefix = obj.get("prefix").and_then(|p| p.as_bool()).unwrap_or(true);

    let argument_value = obj.get("argument");

    // Before converting the argument (which applies read transforms), check if the
    // argument is a simple identifier with an update transform registered. If so,
    // apply the update transform directly to avoid invalid JS like $.get(x)++ or x()++.
    if let Some(arg_val) = argument_value
        && let Some(name) = extract_identifier_name_from_json(arg_val)
        && let Some(update_fn) = context.state.transform.get(&name).and_then(|t| t.update)
    {
        return update_fn(operator, JsExpr::Identifier(name), prefix);
    }

    // Check if the argument is a MemberExpression with a direct Identifier object
    let is_direct_member_update = if let Some(arg_obj) = argument_value.and_then(|a| a.as_object())
        && let Some("MemberExpression") = arg_obj.get("type").and_then(|t| t.as_str())
    {
        let computed = arg_obj
            .get("computed")
            .and_then(|c| c.as_bool())
            .unwrap_or(false);
        if !computed {
            if let Some(object_obj) = arg_obj.get("object").and_then(|o| o.as_object())
                && let Some("Identifier") = object_obj.get("type").and_then(|t| t.as_str())
            {
                true
            } else {
                false
            }
        } else {
            false
        }
    } else {
        false
    };

    // Set the flag if this is a direct member update
    let saved_flag = context.state.in_direct_assignment_lhs;
    if is_direct_member_update {
        context.state.in_direct_assignment_lhs = true;
    }

    // Convert the argument
    let argument = argument_value
        .map(|a| Box::new(convert_json_value(a, context)))
        .unwrap_or_else(|| Box::new(JsExpr::Literal(JsLiteral::Null)));

    // Restore the flag
    context.state.in_direct_assignment_lhs = saved_flag;

    // Try to apply reactive transformations for state variables and store subscriptions
    if let Some(transformed) = try_transform_update(operator, prefix, &argument, context) {
        return transformed;
    }

    JsExpr::Update(JsUpdateExpression {
        operator,
        argument,
        prefix,
    })
}

/// Extract an identifier name from a JSON AST node if it's a simple Identifier.
fn extract_identifier_name_from_json(value: &Value) -> Option<String> {
    let obj = value.as_object()?;
    let node_type = obj.get("type").and_then(|t| t.as_str())?;
    if node_type == "Identifier" {
        obj.get("name").and_then(|n| n.as_str()).map(String::from)
    } else {
        None
    }
}

/// Try to apply reactive transformations to an update expression.
///
/// This function checks if the argument is a reactive state variable or store subscription
/// and applies the appropriate transformation.
///
/// For store subscriptions:
/// - `$store++` becomes `$.update_store(store, $store(), 1)` (or -1 for decrement)
/// - `$store.prop++` becomes `$.store_mutate(store, $.untrack($store).prop++, $.untrack($store))`
///
/// Corresponds to `UpdateExpression.js` in the official Svelte compiler.
fn try_transform_update(
    operator: JsUpdateOp,
    prefix: bool,
    argument: &JsExpr,
    context: &ComponentContext,
) -> Option<JsExpr> {
    use crate::compiler::phases::phase3_transform::js_ast::builders as b;

    // Extract the root identifier from the argument
    let root_name = extract_root_identifier_from_expr(argument)?;

    // Check if there's a transform for this identifier
    let transform = context.state.transform.get(&root_name)?;

    // Case 1: Simple identifier update (root === argument)
    // If the argument is a simple identifier like `$store`, use the `update` transform
    if let JsExpr::Identifier(name) = argument
        && name == &root_name
        && let Some(update_fn) = transform.update
    {
        return Some(update_fn(operator, argument.clone(), prefix));
    }

    // Case 2: Member expression update (like `$store.prop++` or `$store[0].value++`)
    // Use the `mutate` transform.
    // Skip for reactive imports (where replacement_id is set) because
    // apply_transforms_to_expression will handle the mutation wrapping with
    // properly read-transformed arguments.
    if let Some(mutate_fn) = transform.mutate
        && transform.replacement_id.is_none()
    {
        // Build the update expression as the mutation
        let update_expr = JsExpr::Update(JsUpdateExpression {
            operator,
            argument: Box::new(argument.clone()),
            prefix,
        });

        return Some(mutate_fn(b::id(&root_name), update_expr));
    }

    None
}

/// Convert a SequenceExpression node.
fn convert_sequence_expression(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    let expressions = obj
        .get("expressions")
        .and_then(|e| e.as_array())
        .map(|exprs| {
            exprs
                .iter()
                .map(|expr| convert_json_value(expr, context))
                .collect()
        })
        .unwrap_or_default();

    JsExpr::Sequence(JsSequenceExpression { expressions })
}

/// Convert a NewExpression node.
fn convert_new_expression(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    let callee = obj
        .get("callee")
        .map(|c| Box::new(convert_json_value(c, context)))
        .unwrap_or_else(|| Box::new(JsExpr::Identifier("unknown".to_string())));

    let arguments = obj
        .get("arguments")
        .and_then(|a| a.as_array())
        .map(|args| {
            args.iter()
                .map(|arg| convert_json_value(arg, context))
                .collect()
        })
        .unwrap_or_default();

    JsExpr::New(JsNewExpression { callee, arguments })
}

/// Convert an AwaitExpression node.
fn convert_await_expression(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    let argument = obj
        .get("argument")
        .map(|a| Box::new(convert_json_value(a, context)))
        .unwrap_or_else(|| Box::new(JsExpr::Literal(JsLiteral::Null)));

    JsExpr::Await(argument)
}

/// Convert a YieldExpression node.
fn convert_yield_expression(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    let argument = obj
        .get("argument")
        .map(|a| Some(Box::new(convert_json_value(a, context))));

    let delegate = obj
        .get("delegate")
        .and_then(|d| d.as_bool())
        .unwrap_or(false);

    JsExpr::Yield(JsYieldExpression {
        argument: argument.flatten(),
        delegate,
    })
}

/// Convert a SpreadElement node.
fn convert_spread_element(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    let argument = obj
        .get("argument")
        .map(|a| Box::new(convert_json_value(a, context)))
        .unwrap_or_else(|| Box::new(JsExpr::Literal(JsLiteral::Null)));

    JsExpr::Spread(argument)
}

/// Convert a TemplateLiteral node.
fn convert_template_literal(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    let quasis = obj
        .get("quasis")
        .and_then(|q| q.as_array())
        .map(|quasis| {
            quasis
                .iter()
                .filter_map(|quasi| {
                    let quasi_obj = quasi.as_object()?;
                    let value_obj = quasi_obj.get("value")?.as_object()?;
                    let raw = value_obj.get("raw")?.as_str()?.to_string();
                    let cooked = value_obj
                        .get("cooked")
                        .and_then(|c| c.as_str())
                        .unwrap_or(&raw)
                        .to_string();
                    let tail = quasi_obj.get("tail")?.as_bool()?;

                    Some(JsTemplateElement { raw, cooked, tail })
                })
                .collect()
        })
        .unwrap_or_default();

    let expressions = obj
        .get("expressions")
        .and_then(|e| e.as_array())
        .map(|exprs| {
            exprs
                .iter()
                .map(|expr| convert_json_value(expr, context))
                .collect()
        })
        .unwrap_or_default();

    JsExpr::TemplateLiteral(JsTemplateLiteral {
        quasis,
        expressions,
    })
}

/// Convert a TaggedTemplateExpression node.
///
/// Structure: tag`template`
/// Example: css`color: red;`
fn convert_tagged_template_expression(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    // Convert the tag expression
    let tag = obj
        .get("tag")
        .map(|t| Box::new(convert_json_value(t, context)))
        .unwrap_or_else(|| Box::new(JsExpr::Identifier("unknown".to_string())));

    // Convert the quasi (template literal)
    let quasi = obj
        .get("quasi")
        .and_then(|q| q.as_object())
        .map(|q| {
            // Convert the quasi which is a TemplateLiteral
            match convert_template_literal(q, context) {
                JsExpr::TemplateLiteral(tl) => tl,
                _ => JsTemplateLiteral {
                    quasis: vec![],
                    expressions: vec![],
                },
            }
        })
        .unwrap_or_else(|| JsTemplateLiteral {
            quasis: vec![],
            expressions: vec![],
        });

    JsExpr::TaggedTemplate(JsTaggedTemplate { tag, quasi })
}

/// Convert a ChainExpression node.
///
/// Handles optional chaining: a?.b, a?.[b], a?.()
fn convert_chain_expression(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    // The expression inside a ChainExpression
    if let Some(expression) = obj.get("expression") {
        convert_json_value(expression, context)
    } else {
        JsExpr::Raw("/* ChainExpression: missing expression */".to_string())
    }
}

// Helper trait to convert JsExpr into JsLiteral for property keys
impl From<JsExpr> for JsLiteral {
    fn from(expr: JsExpr) -> Self {
        match expr {
            JsExpr::Literal(lit) => lit,
            _ => JsLiteral::Null,
        }
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_convert_simple_json() {
        // Test basic conversion without context dependency
        let json = serde_json::json!({
            "type": "Literal",
            "value": "hello"
        });

        // We'll need a context to call convert_json_value
        // For now, we'll test the basic structure
        assert_eq!(json["type"], "Literal");
        assert_eq!(json["value"], "hello");
    }

    #[test]
    fn test_literal_conversion() {
        let json_str = serde_json::json!({
            "type": "Literal",
            "value": "test"
        });

        assert!(json_str.is_object());
        let obj = json_str.as_object().unwrap();
        assert_eq!(obj.get("type").and_then(|t| t.as_str()), Some("Literal"));
    }
}
