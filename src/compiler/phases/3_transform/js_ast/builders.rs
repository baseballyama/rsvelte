//! JavaScript AST builder functions.
//!
//! These functions provide a convenient API for constructing JavaScript AST nodes,
//! similar to Svelte's `builders.js`.

use super::nodes::*;
use compact_str::CompactString;
use smallvec::smallvec;

/// Check if a string is a valid JavaScript identifier.
fn is_valid_identifier(s: &str) -> bool {
    if s.is_empty() {
        return false;
    }

    // First character must be a letter, underscore, or dollar sign
    let first_char = s.chars().next().unwrap();
    if !first_char.is_alphabetic() && first_char != '_' && first_char != '$' {
        return false;
    }

    // Remaining characters must be alphanumeric, underscore, or dollar sign
    s.chars()
        .all(|c| c.is_alphanumeric() || c == '_' || c == '$')
}

// ============================================================================
// Identifiers and Literals
// ============================================================================

/// Create an identifier expression.
#[inline]
pub fn id(name: impl Into<CompactString>) -> JsExpr {
    JsExpr::Identifier(name.into())
}

/// Create an identifier pattern.
#[inline]
pub fn id_pattern(name: impl Into<CompactString>) -> JsPattern {
    JsPattern::Identifier(name.into())
}

/// Create a string literal.
#[inline]
pub fn string(value: impl Into<CompactString>) -> JsExpr {
    JsExpr::Literal(JsLiteral::String(value.into()))
}

/// Create a number literal.
#[inline]
pub fn number(value: f64) -> JsExpr {
    JsExpr::Literal(JsLiteral::Number(value))
}

/// Create a boolean literal.
#[inline]
pub fn boolean(value: bool) -> JsExpr {
    JsExpr::Literal(JsLiteral::Boolean(value))
}

/// Create a null literal.
#[inline]
pub fn null() -> JsExpr {
    JsExpr::Literal(JsLiteral::Null)
}

/// Create a generic literal from JsLiteral.
pub fn literal(value: JsLiteral) -> JsExpr {
    JsExpr::Literal(value)
}

/// Create an undefined literal (void 0).
pub fn undefined() -> JsExpr {
    JsExpr::Void(Box::new(number(0.0)))
}

/// Create the `true` literal.
pub fn true_literal() -> JsExpr {
    boolean(true)
}

/// Create the `false` literal.
pub fn false_literal() -> JsExpr {
    boolean(false)
}

/// Create a `this` expression.
pub fn this() -> JsExpr {
    JsExpr::This
}

// ============================================================================
// Template Literals
// ============================================================================

/// Create a template literal.
pub fn template(quasis: Vec<JsTemplateElement>, expressions: Vec<JsExpr>) -> JsExpr {
    JsExpr::TemplateLiteral(JsTemplateLiteral {
        quasis,
        expressions,
    })
}

/// Create a template element.
pub fn quasi(raw: impl Into<CompactString>, tail: bool) -> JsTemplateElement {
    let raw = raw.into();
    let cooked = raw.clone();
    JsTemplateElement { raw, cooked, tail }
}

/// Create a simple template literal from a string (no expressions).
pub fn template_string(s: impl Into<CompactString>) -> JsExpr {
    template(vec![quasi(s, true)], vec![])
}

// ============================================================================
// Arrays and Objects
// ============================================================================

/// Create an array expression.
pub fn array(elements: Vec<JsExpr>) -> JsExpr {
    JsExpr::Array(JsArrayExpression {
        elements: elements.into_iter().map(Some).collect(),
    })
}

/// Create an array expression with possible holes.
pub fn array_with_holes(elements: Vec<Option<JsExpr>>) -> JsExpr {
    JsExpr::Array(JsArrayExpression { elements })
}

/// Create an empty array.
pub fn empty_array() -> JsExpr {
    array(vec![])
}

/// Create an object expression.
pub fn object(properties: Vec<JsObjectMember>) -> JsExpr {
    JsExpr::Object(JsObjectExpression { properties })
}

/// Create an empty object.
pub fn empty_object() -> JsExpr {
    object(vec![])
}

/// Check if a string is a valid JavaScript identifier.
fn is_valid_js_identifier(s: &str) -> bool {
    if s.is_empty() {
        return false;
    }
    let mut chars = s.chars();
    // First character must be a letter, underscore, or dollar sign
    let first = chars.next().unwrap();
    if !first.is_alphabetic() && first != '_' && first != '$' {
        return false;
    }
    // Rest can also include digits
    chars.all(|c| c.is_alphanumeric() || c == '_' || c == '$')
}

/// Create an object property (init).
/// If the key contains invalid characters (like hyphens), it will be quoted.
pub fn prop(key: impl Into<CompactString>, value: JsExpr) -> JsObjectMember {
    let key_str: CompactString = key.into();
    let property_key = if is_valid_js_identifier(&key_str) {
        JsPropertyKey::Identifier(key_str)
    } else {
        JsPropertyKey::Literal(JsLiteral::String(key_str))
    };
    JsObjectMember::Property(JsProperty {
        key: property_key,
        value: Box::new(value),
        kind: JsPropertyKind::Init,
        computed: false,
        shorthand: false,
        method: false,
    })
}

/// Create a shorthand object property.
pub fn prop_shorthand(name: impl Into<CompactString>) -> JsObjectMember {
    let name: CompactString = name.into();
    JsObjectMember::Property(JsProperty {
        key: JsPropertyKey::Identifier(name.clone()),
        value: Box::new(id(name)),
        kind: JsPropertyKind::Init,
        computed: false,
        shorthand: true,
        method: false,
    })
}

/// Create a computed property.
pub fn prop_computed(key: JsExpr, value: JsExpr) -> JsObjectMember {
    JsObjectMember::Property(JsProperty {
        key: JsPropertyKey::Computed(Box::new(key)),
        value: Box::new(value),
        kind: JsPropertyKind::Init,
        computed: true,
        shorthand: false,
        method: false,
    })
}

/// Create a method shorthand property: `name(params) { body }`.
pub fn prop_method(
    name: impl Into<CompactString>,
    params: Vec<JsPattern>,
    body: Vec<JsStatement>,
) -> JsObjectMember {
    let name_str: CompactString = name.into();
    let key = if is_valid_js_identifier(&name_str) {
        JsPropertyKey::Identifier(name_str)
    } else {
        JsPropertyKey::Literal(JsLiteral::String(name_str))
    };
    JsObjectMember::Property(JsProperty {
        key,
        value: Box::new(JsExpr::Function(JsFunctionExpression {
            id: None,
            params: params.into(),
            body: JsBlockStatement::with_body(body),
            is_async: false,
            is_generator: false,
        })),
        kind: JsPropertyKind::Init,
        computed: false,
        shorthand: false,
        method: true,
    })
}

/// Create a getter property.
/// If the name is not a valid identifier (e.g., contains hyphens), uses a string literal key.
pub fn getter(name: impl Into<CompactString>, body: Vec<JsStatement>) -> JsObjectMember {
    let name_str: CompactString = name.into();
    let key = if is_valid_identifier(&name_str) {
        JsPropertyKey::Identifier(name_str)
    } else {
        JsPropertyKey::Literal(JsLiteral::String(name_str))
    };
    JsObjectMember::Property(JsProperty {
        key,
        value: Box::new(JsExpr::Function(JsFunctionExpression {
            id: None,
            params: smallvec![],
            body: JsBlockStatement::with_body(body),
            is_async: false,
            is_generator: false,
        })),
        kind: JsPropertyKind::Get,
        computed: false,
        shorthand: false,
        method: false,
    })
}

/// Create a setter property.
/// If the name is not a valid identifier (e.g., contains hyphens), uses a string literal key.
pub fn setter(
    name: impl Into<CompactString>,
    param: impl Into<CompactString>,
    body: Vec<JsStatement>,
) -> JsObjectMember {
    let name_str: CompactString = name.into();
    let key = if is_valid_identifier(&name_str) {
        JsPropertyKey::Identifier(name_str)
    } else {
        JsPropertyKey::Literal(JsLiteral::String(name_str))
    };
    JsObjectMember::Property(JsProperty {
        key,
        value: Box::new(JsExpr::Function(JsFunctionExpression {
            id: None,
            params: smallvec![id_pattern(param)],
            body: JsBlockStatement::with_body(body),
            is_async: false,
            is_generator: false,
        })),
        kind: JsPropertyKind::Set,
        computed: false,
        shorthand: false,
        method: false,
    })
}

/// Create a spread element in an object.
pub fn spread(expr: JsExpr) -> JsObjectMember {
    JsObjectMember::SpreadElement(Box::new(expr))
}

/// Create a spread expression.
pub fn spread_expr(expr: JsExpr) -> JsExpr {
    JsExpr::Spread(Box::new(expr))
}

// ============================================================================
// Functions
// ============================================================================

/// Create an arrow function with expression body.
#[inline]
pub fn arrow(params: Vec<JsPattern>, body: JsExpr) -> JsExpr {
    JsExpr::Arrow(JsArrowFunction {
        params: params.into(),
        body: JsArrowBody::Expression(Box::new(body)),
        is_async: false,
    })
}

/// Create an arrow function with block body.
#[inline]
pub fn arrow_block(params: Vec<JsPattern>, body: Vec<JsStatement>) -> JsExpr {
    JsExpr::Arrow(JsArrowFunction {
        params: params.into(),
        body: JsArrowBody::Block(JsBlockStatement::with_body(body)),
        is_async: false,
    })
}

/// Create an async arrow function with expression body.
pub fn async_arrow(params: Vec<JsPattern>, body: JsExpr) -> JsExpr {
    JsExpr::Arrow(JsArrowFunction {
        params: params.into(),
        body: JsArrowBody::Expression(Box::new(body)),
        is_async: true,
    })
}

/// Create an async arrow function with block body.
pub fn async_arrow_block(params: Vec<JsPattern>, body: Vec<JsStatement>) -> JsExpr {
    JsExpr::Arrow(JsArrowFunction {
        params: params.into(),
        body: JsArrowBody::Block(JsBlockStatement::with_body(body)),
        is_async: true,
    })
}

/// Create a thunk (arrow function with no params that returns the expression).
///
/// Applies the `unthunk` optimization: `() => func()` becomes `func`.
/// This matches Svelte's optimization for simple function calls.
pub fn thunk(expr: JsExpr) -> JsExpr {
    unthunk(arrow(vec![], expr))
}

/// Optimize `(arg) => func(arg)` to `func` and `() => func()` to `func`.
/// Also optimizes `async () => await x()` to `() => x()` when x has no nested awaits.
///
/// Corresponds to `unthunk` in Svelte's builders.js.
pub fn unthunk(expr: JsExpr) -> JsExpr {
    // Only optimize arrow functions
    let JsExpr::Arrow(arrow_fn) = &expr else {
        return expr;
    };

    // Body must be an expression (not a block)
    let JsArrowBody::Expression(body_expr) = &arrow_fn.body else {
        return expr;
    };

    // optimize `async () => await x()`, but not `async () => await x(await y)`
    if arrow_fn.is_async {
        if let JsExpr::Await(inner) = body_expr.as_ref()
            && !has_await_expression(inner)
        {
            // Recursively unthunk the non-async version
            return unthunk(self::arrow(arrow_fn.params.to_vec(), *inner.clone()));
        }
        return expr;
    }

    // Body must be a call expression
    let JsExpr::Call(call) = body_expr.as_ref() else {
        return expr;
    };

    // Don't optimize optional calls: () => func?.() cannot become func
    // because func might be undefined, and calling undefined() would crash
    if call.optional {
        return expr;
    }

    // Callee must be an identifier, or a member expression on the `$` namespace.
    // In the official Svelte compiler, dotted paths like '$.effect_tracking' are
    // represented as Identifier nodes. In our AST, they are MemberExpression nodes.
    // We allow unthunking for `$.xxx` member expressions since these are stable
    // references to the Svelte runtime.
    let callee_is_static = match call.callee.as_ref() {
        JsExpr::Identifier(_) => true,
        JsExpr::Member(m) => matches!(m.object.as_ref(), JsExpr::Identifier(name) if name == "$"),
        _ => false,
    };
    if !callee_is_static {
        return expr;
    }

    // Check that params match arguments exactly
    // e.g., (a, b) => func(a, b) -> func
    // e.g., () => func() -> func
    if arrow_fn.params.len() != call.arguments.len() {
        return expr;
    }

    // Check each param matches corresponding argument
    for (i, param) in arrow_fn.params.iter().enumerate() {
        let JsPattern::Identifier(param_name) = param else {
            return expr;
        };

        let JsExpr::Identifier(arg_name) = &call.arguments[i] else {
            return expr;
        };

        if param_name != arg_name {
            return expr;
        }
    }

    // Optimization applies: return just the callee
    call.callee.as_ref().clone()
}

/// Check if a JsExpr contains any AwaitExpression (not crossing function boundaries).
/// Corresponds to `has_await_expression` in Svelte's ast.js.
fn has_await_expression(expr: &JsExpr) -> bool {
    match expr {
        JsExpr::Await(_) => true,
        // Don't traverse into function boundaries
        JsExpr::Arrow(_) | JsExpr::Function(_) => false,
        // Recursively check sub-expressions
        JsExpr::Call(call) => {
            has_await_expression(&call.callee) || call.arguments.iter().any(has_await_expression)
        }
        JsExpr::Member(member) => {
            has_await_expression(&member.object)
                || matches!(&member.property, super::nodes::JsMemberProperty::Expression(e) if has_await_expression(e))
        }
        JsExpr::Binary(bin) => has_await_expression(&bin.left) || has_await_expression(&bin.right),
        JsExpr::Logical(log) => has_await_expression(&log.left) || has_await_expression(&log.right),
        JsExpr::Unary(un) => has_await_expression(&un.argument),
        JsExpr::Update(up) => has_await_expression(&up.argument),
        JsExpr::Conditional(cond) => {
            has_await_expression(&cond.test)
                || has_await_expression(&cond.consequent)
                || has_await_expression(&cond.alternate)
        }
        JsExpr::Sequence(seq) => seq.expressions.iter().any(has_await_expression),
        JsExpr::Assignment(assign) => has_await_expression(&assign.right),
        JsExpr::Array(arr) => arr
            .elements
            .iter()
            .any(|e| e.as_ref().is_some_and(has_await_expression)),
        JsExpr::Object(obj) => obj.properties.iter().any(|p| match p {
            super::nodes::JsObjectMember::Property(prop) => has_await_expression(&prop.value),
            super::nodes::JsObjectMember::SpreadElement(e) => has_await_expression(e),
        }),
        JsExpr::TemplateLiteral(tmpl) => tmpl.expressions.iter().any(has_await_expression),
        JsExpr::TaggedTemplate(tt) => {
            has_await_expression(&tt.tag) || tt.quasi.expressions.iter().any(has_await_expression)
        }
        JsExpr::New(new_expr) => {
            has_await_expression(&new_expr.callee)
                || new_expr.arguments.iter().any(has_await_expression)
        }
        JsExpr::Yield(y) => y.argument.as_ref().is_some_and(|a| has_await_expression(a)),
        JsExpr::Spread(e) => has_await_expression(e),
        JsExpr::Void(e) => has_await_expression(e),
        // Leaf nodes: Identifier, Literal, This, Raw, Class, Chain
        _ => false,
    }
}

/// Check if a JsExpr contains an await expression (not crossing function boundaries).
/// Public version of the internal function for use in visitors.
pub fn js_expr_has_await(expr: &JsExpr) -> bool {
    has_await_expression(expr)
}

/// Strip the top-level `await` from a JsExpr.
///
/// If the expression is `JsExpr::Await(inner)`, returns the inner expression.
/// Otherwise returns the original expression unchanged.
pub fn strip_await(expr: JsExpr) -> JsExpr {
    match expr {
        JsExpr::Await(inner) => *inner,
        other => other,
    }
}

/// Wrap an expression in the `$.save()` pattern.
///
/// Turns `await expr` into `(await $.save(expr))()`.
///
/// Corresponds to the `save()` function in
/// `svelte/packages/svelte/src/compiler/utils/ast.js:637`.
pub fn save(expression: JsExpr) -> JsExpr {
    // (await $.save(expression))()
    call(
        JsExpr::Await(Box::new(call(member_path("$.save"), vec![expression]))),
        vec![],
    )
}

/// Apply `$.save()` wrapping to await expressions in an expression tree.
///
/// In async template effect values, `await X` expressions that are NOT in
/// "tail position" (i.e., not the last evaluated sub-expression) should be
/// wrapped as `(await $.save(X))()` to preserve reactivity.
///
/// This corresponds to the `pickled_awaits` mechanism in the official Svelte
/// compiler, which marks await expressions in Phase 2 analysis and transforms
/// them in Phase 3 via the `AwaitExpression` visitor.
///
/// The `is_last_evaluated_expression` logic from the official compiler is
/// replicated here as a top-down tree transformation.
pub fn apply_save_wrapping(expr: JsExpr) -> JsExpr {
    // Only process if there are await expressions
    if !has_await_expression(&expr) {
        return expr;
    }
    apply_save_recursive(expr, true)
}

/// Apply `$.save()` wrapping with the expression NOT in tail position.
///
/// This is used when the expression is inside a const declaration within an
/// async arrow body (not the final return value), so ALL await expressions
/// should be wrapped with `$.save()`.
pub fn apply_save_wrapping_non_tail(expr: JsExpr) -> JsExpr {
    if !has_await_expression(&expr) {
        return expr;
    }
    apply_save_recursive(expr, false)
}

/// Recursively apply save wrapping.
///
/// `is_tail` indicates whether this expression is in "tail position"
/// (the last evaluated sub-expression). Await expressions in tail
/// position do NOT need `$.save()` wrapping.
fn apply_save_recursive(expr: JsExpr, is_tail: bool) -> JsExpr {
    match expr {
        JsExpr::Await(inner) => {
            if is_tail {
                // Tail position: leave as plain `await X`
                JsExpr::Await(Box::new(apply_save_recursive(*inner, true)))
            } else {
                // Non-tail position: wrap as `(await $.save(X))()`
                save(*inner)
            }
        }

        JsExpr::Binary(bin) => {
            // In binary expressions, left is NOT in tail position,
            // right inherits the parent's tail status
            let left = apply_save_recursive(*bin.left, false);
            let right = apply_save_recursive(*bin.right, is_tail);
            JsExpr::Binary(JsBinaryExpression {
                operator: bin.operator,
                left: Box::new(left),
                right: Box::new(right),
            })
        }

        JsExpr::Logical(log) => {
            // Same as binary: left is NOT tail, right inherits
            let left = apply_save_recursive(*log.left, false);
            let right = apply_save_recursive(*log.right, is_tail);
            JsExpr::Logical(JsLogicalExpression {
                operator: log.operator,
                left: Box::new(left),
                right: Box::new(right),
            })
        }

        JsExpr::Assignment(assign) => {
            // Left is NOT tail, right inherits
            let left = apply_save_recursive(*assign.left, false);
            let right = apply_save_recursive(*assign.right, is_tail);
            JsExpr::Assignment(JsAssignmentExpression {
                operator: assign.operator,
                left: Box::new(left),
                right: Box::new(right),
            })
        }

        JsExpr::Call(call_expr) => {
            // Callee is NOT in tail position
            // All arguments except the last are NOT in tail position
            // The last argument inherits the parent's tail status
            let callee = apply_save_recursive(*call_expr.callee, false);
            let len = call_expr.arguments.len();
            let arguments: Vec<JsExpr> = call_expr
                .arguments
                .into_iter()
                .enumerate()
                .map(|(i, arg)| {
                    let arg_is_tail = is_tail && i == len - 1;
                    apply_save_recursive(arg, arg_is_tail)
                })
                .collect();
            JsExpr::Call(JsCallExpression {
                callee: Box::new(callee),
                arguments,
                optional: call_expr.optional,
            })
        }

        JsExpr::New(new_expr) => {
            // Same as Call: callee NOT tail, last argument inherits tail
            let callee = apply_save_recursive(*new_expr.callee, false);
            let len = new_expr.arguments.len();
            let arguments: Vec<JsExpr> = new_expr
                .arguments
                .into_iter()
                .enumerate()
                .map(|(i, arg)| {
                    let arg_is_tail = is_tail && i == len - 1;
                    apply_save_recursive(arg, arg_is_tail)
                })
                .collect();
            JsExpr::New(JsNewExpression {
                callee: Box::new(callee),
                arguments,
            })
        }

        JsExpr::Array(arr) => {
            // All elements except the last are NOT in tail position
            let len = arr.elements.len();
            let elements: Vec<Option<JsExpr>> = arr
                .elements
                .into_iter()
                .enumerate()
                .map(|(i, elem)| {
                    elem.map(|e| {
                        let elem_is_tail = is_tail && i == len - 1;
                        apply_save_recursive(e, elem_is_tail)
                    })
                })
                .collect();
            JsExpr::Array(JsArrayExpression { elements })
        }

        JsExpr::Conditional(cond) => {
            // Test is NOT in tail position
            // Consequent and alternate are NOT directly in tail position for save purposes
            // (they represent branches, each of which could be the "last" independently)
            let test = apply_save_recursive(*cond.test, false);
            // consequent and alternate: each branch acts as its own tail context
            let consequent = apply_save_recursive(*cond.consequent, is_tail);
            let alternate = apply_save_recursive(*cond.alternate, is_tail);
            JsExpr::Conditional(JsConditionalExpression {
                test: Box::new(test),
                consequent: Box::new(consequent),
                alternate: Box::new(alternate),
            })
        }

        JsExpr::Member(member) => {
            // Object is NOT in tail position when computed
            let object_is_tail = if member.computed { false } else { is_tail };
            let object = apply_save_recursive(*member.object, object_is_tail);
            let property = match member.property {
                JsMemberProperty::Expression(e) => {
                    JsMemberProperty::Expression(Box::new(apply_save_recursive(*e, is_tail)))
                }
                other => other,
            };
            JsExpr::Member(JsMemberExpression {
                object: Box::new(object),
                property,
                computed: member.computed,
                optional: member.optional,
            })
        }

        JsExpr::Sequence(seq) => {
            // All expressions except the last are NOT in tail position
            let len = seq.expressions.len();
            let expressions: Vec<JsExpr> = seq
                .expressions
                .into_iter()
                .enumerate()
                .map(|(i, e)| {
                    let e_is_tail = is_tail && i == len - 1;
                    apply_save_recursive(e, e_is_tail)
                })
                .collect();
            JsExpr::Sequence(JsSequenceExpression { expressions })
        }

        JsExpr::TemplateLiteral(tmpl) => {
            // All expressions except the last are NOT in tail position
            let len = tmpl.expressions.len();
            let expressions: Vec<JsExpr> = tmpl
                .expressions
                .into_iter()
                .enumerate()
                .map(|(i, e)| {
                    let e_is_tail = is_tail && i == len - 1;
                    apply_save_recursive(e, e_is_tail)
                })
                .collect();
            JsExpr::TemplateLiteral(JsTemplateLiteral {
                quasis: tmpl.quasis,
                expressions,
            })
        }

        JsExpr::TaggedTemplate(tt) => {
            // Tag is NOT in tail position
            let tag = apply_save_recursive(*tt.tag, false);
            let len = tt.quasi.expressions.len();
            let expressions: Vec<JsExpr> = tt
                .quasi
                .expressions
                .into_iter()
                .enumerate()
                .map(|(i, e)| {
                    let e_is_tail = is_tail && i == len - 1;
                    apply_save_recursive(e, e_is_tail)
                })
                .collect();
            JsExpr::TaggedTemplate(JsTaggedTemplate {
                tag: Box::new(tag),
                quasi: JsTemplateLiteral {
                    quasis: tt.quasi.quasis,
                    expressions,
                },
            })
        }

        JsExpr::Object(obj) => {
            // Properties: last property inherits tail
            let len = obj.properties.len();
            let properties: Vec<JsObjectMember> = obj
                .properties
                .into_iter()
                .enumerate()
                .map(|(i, prop)| {
                    let prop_is_tail = is_tail && i == len - 1;
                    match prop {
                        JsObjectMember::Property(p) => {
                            let key_is_tail = false;
                            let key = match p.key {
                                JsPropertyKey::Computed(e) => JsPropertyKey::Computed(Box::new(
                                    apply_save_recursive(*e, key_is_tail),
                                )),
                                other => other,
                            };
                            let value = apply_save_recursive(*p.value, prop_is_tail);
                            JsObjectMember::Property(JsProperty {
                                key,
                                value: Box::new(value),
                                kind: p.kind,
                                computed: p.computed,
                                shorthand: p.shorthand,
                                method: p.method,
                            })
                        }
                        JsObjectMember::SpreadElement(e) => JsObjectMember::SpreadElement(
                            Box::new(apply_save_recursive(*e, prop_is_tail)),
                        ),
                    }
                })
                .collect();
            JsExpr::Object(JsObjectExpression { properties })
        }

        JsExpr::Unary(un) => {
            // Unary argument: NOT in tail position (the result is transformed by the operator)
            let argument = apply_save_recursive(*un.argument, false);
            JsExpr::Unary(JsUnaryExpression {
                operator: un.operator,
                argument: Box::new(argument),
                prefix: un.prefix,
            })
        }

        JsExpr::Update(up) => {
            let argument = apply_save_recursive(*up.argument, false);
            JsExpr::Update(JsUpdateExpression {
                operator: up.operator,
                argument: Box::new(argument),
                prefix: up.prefix,
            })
        }

        JsExpr::Spread(inner) => JsExpr::Spread(Box::new(apply_save_recursive(*inner, is_tail))),

        JsExpr::Void(inner) => JsExpr::Void(Box::new(apply_save_recursive(*inner, false))),

        // Don't cross function boundaries
        JsExpr::Arrow(_) | JsExpr::Function(_) => expr,

        // Leaf nodes and others that don't contain sub-expressions to transform
        _ => expr,
    }
}

/// Create a thunk with a block body.
pub fn thunk_block(statements: Vec<JsStatement>) -> JsExpr {
    arrow_block(vec![], statements)
}

/// Create an async thunk with `$.save()` wrapping.
///
/// First applies `$.save()` wrapping to non-tail await expressions,
/// then applies unthunk optimization: `async () => await x()` becomes `() => x()`.
///
/// Corresponds to Svelte's `thunk(expression, true)` combined with
/// the `pickled_awaits` mechanism.
pub fn async_thunk(expr: JsExpr) -> JsExpr {
    let saved_expr = apply_save_wrapping(expr);
    unthunk(async_arrow(vec![], saved_expr))
}

/// Create a function expression.
pub fn function_expr(
    id: Option<CompactString>,
    params: Vec<JsPattern>,
    body: Vec<JsStatement>,
) -> JsExpr {
    JsExpr::Function(JsFunctionExpression {
        id,
        params: params.into(),
        body: JsBlockStatement::with_body(body),
        is_async: false,
        is_generator: false,
    })
}

/// Create a function declaration.
pub fn function_decl(
    name: impl Into<CompactString>,
    params: Vec<JsPattern>,
    body: Vec<JsStatement>,
) -> JsStatement {
    JsStatement::FunctionDeclaration(JsFunctionDeclaration {
        id: Some(name.into()),
        params: params.into(),
        body: JsBlockStatement::with_body(body),
        is_async: false,
        is_generator: false,
    })
}

/// Create an async function declaration.
pub fn async_function_decl(
    name: impl Into<CompactString>,
    params: Vec<JsPattern>,
    body: Vec<JsStatement>,
) -> JsStatement {
    JsStatement::FunctionDeclaration(JsFunctionDeclaration {
        id: Some(name.into()),
        params: params.into(),
        body: JsBlockStatement::with_body(body),
        is_async: true,
        is_generator: false,
    })
}

// ============================================================================
// Calls and Member Access
// ============================================================================

/// Create a call expression.
#[inline]
pub fn call(callee: JsExpr, arguments: Vec<JsExpr>) -> JsExpr {
    JsExpr::Call(JsCallExpression {
        callee: Box::new(callee),
        arguments,
        optional: false,
    })
}

/// Create a call expression with trailing undefined/false arguments stripped.
///
/// This matches the behavior of the official Svelte compiler's `b.call()` function
/// which removes trailing falsy arguments but keeps internal ones as `void 0`.
#[inline]
pub fn call_trimmed(callee: JsExpr, arguments: Vec<JsExpr>) -> JsExpr {
    use super::nodes::JsUnaryOp;

    let mut args = arguments;

    // Remove trailing undefined/void expressions
    // Note: We do NOT remove false booleans - they are valid argument values
    // (e.g., $.set_class(div, 1, false) where false is the class value)
    // This matches the official b.call behavior: only removes null/undefined, not false
    while let Some(last) = args.last() {
        let is_falsy = match last {
            JsExpr::Identifier(name) if name == "undefined" => true,
            JsExpr::Void(_) => true,
            JsExpr::Unary(unary) => {
                // Check for `void 0` pattern
                matches!(unary.operator, JsUnaryOp::Void)
                    && matches!(&*unary.argument, JsExpr::Literal(JsLiteral::Number(n)) if *n == 0.0)
            }
            _ => false,
        };

        if is_falsy {
            args.pop();
        } else {
            break;
        }
    }

    JsExpr::Call(JsCallExpression {
        callee: Box::new(callee),
        arguments: args,
        optional: false,
    })
}

/// Create an optional call expression.
pub fn optional_call(callee: JsExpr, arguments: Vec<JsExpr>) -> JsExpr {
    JsExpr::Call(JsCallExpression {
        callee: Box::new(callee),
        arguments,
        optional: true,
    })
}

/// Create a new expression.
pub fn new_expr(callee: JsExpr, arguments: Vec<JsExpr>) -> JsExpr {
    JsExpr::New(JsNewExpression {
        callee: Box::new(callee),
        arguments,
    })
}

/// Create a member expression with identifier property.
#[inline]
pub fn member(object: JsExpr, property: impl Into<CompactString>) -> JsExpr {
    JsExpr::Member(JsMemberExpression {
        object: Box::new(object),
        property: JsMemberProperty::Identifier(property.into()),
        computed: false,
        optional: false,
    })
}

/// Create a computed member expression.
pub fn member_computed(object: JsExpr, property: JsExpr) -> JsExpr {
    JsExpr::Member(JsMemberExpression {
        object: Box::new(object),
        property: JsMemberProperty::Expression(Box::new(property)),
        computed: true,
        optional: false,
    })
}

/// Create an optional member expression.
pub fn optional_member(object: JsExpr, property: impl Into<CompactString>) -> JsExpr {
    JsExpr::Member(JsMemberExpression {
        object: Box::new(object),
        property: JsMemberProperty::Identifier(property.into()),
        computed: false,
        optional: true,
    })
}

/// Create a member path from a dot-separated string (e.g., "$.template").
#[inline]
pub fn member_path(path: &str) -> JsExpr {
    // Fast path for common "$.xxx" pattern (avoids Vec allocation)
    if let Some(rest) = path.strip_prefix("$.")
        && !rest.contains('.')
    {
        return member(id("$"), rest);
    }

    // General case
    let mut parts = path.split('.');
    let mut expr = id(parts.next().unwrap());
    for part in parts {
        expr = member(expr, part);
    }
    expr
}

// ============================================================================
// Operators
// ============================================================================

/// Create a binary expression.
pub fn binary(op: impl Into<JsBinaryOp>, left: JsExpr, right: JsExpr) -> JsExpr {
    JsExpr::Binary(JsBinaryExpression {
        operator: op.into(),
        left: Box::new(left),
        right: Box::new(right),
    })
}

/// Create a binary expression from an operator string.
pub fn binary_str(op: &str, left: JsExpr, right: JsExpr) -> JsExpr {
    let operator = match op {
        "==" => JsBinaryOp::Eq,
        "!=" => JsBinaryOp::Ne,
        "===" => JsBinaryOp::StrictEq,
        "!==" => JsBinaryOp::StrictNe,
        "<" => JsBinaryOp::Lt,
        "<=" => JsBinaryOp::Le,
        ">" => JsBinaryOp::Gt,
        ">=" => JsBinaryOp::Ge,
        "<<" => JsBinaryOp::Shl,
        ">>" => JsBinaryOp::Shr,
        ">>>" => JsBinaryOp::UShr,
        "+" => JsBinaryOp::Add,
        "-" => JsBinaryOp::Sub,
        "*" => JsBinaryOp::Mul,
        "/" => JsBinaryOp::Div,
        "%" => JsBinaryOp::Mod,
        "**" => JsBinaryOp::Pow,
        "|" => JsBinaryOp::BitOr,
        "^" => JsBinaryOp::BitXor,
        "&" => JsBinaryOp::BitAnd,
        "in" => JsBinaryOp::In,
        "instanceof" => JsBinaryOp::InstanceOf,
        "??" | "&&" | "||" => {
            // These are logical operators, not binary operators.
            // Redirect to logical_str to avoid silent miscompilation.
            return logical_str(op, left, right);
        }
        _ => JsBinaryOp::Add, // Default to addition
    };
    binary(operator, left, right)
}

/// Create a logical expression.
pub fn logical(op: JsLogicalOp, left: JsExpr, right: JsExpr) -> JsExpr {
    JsExpr::Logical(JsLogicalExpression {
        operator: op,
        left: Box::new(left),
        right: Box::new(right),
    })
}

/// Create an AND expression.
pub fn and(left: JsExpr, right: JsExpr) -> JsExpr {
    logical(JsLogicalOp::And, left, right)
}

/// Create an OR expression.
pub fn or(left: JsExpr, right: JsExpr) -> JsExpr {
    logical(JsLogicalOp::Or, left, right)
}

/// Create a nullish coalescing expression.
pub fn nullish(left: JsExpr, right: JsExpr) -> JsExpr {
    logical(JsLogicalOp::NullishCoalescing, left, right)
}

/// Create a logical expression from an operator string.
pub fn logical_str(op: &str, left: JsExpr, right: JsExpr) -> JsExpr {
    let operator = match op {
        "&&" => JsLogicalOp::And,
        "||" => JsLogicalOp::Or,
        "??" => JsLogicalOp::NullishCoalescing,
        _ => panic!("Invalid logical operator: {}", op),
    };
    logical(operator, left, right)
}

/// Create a unary expression.
pub fn unary(op: JsUnaryOp, argument: JsExpr) -> JsExpr {
    JsExpr::Unary(JsUnaryExpression {
        operator: op,
        argument: Box::new(argument),
        prefix: true,
    })
}

/// Create a NOT expression.
pub fn not(expr: JsExpr) -> JsExpr {
    unary(JsUnaryOp::Not, expr)
}

/// Create a typeof expression.
pub fn type_of(expr: JsExpr) -> JsExpr {
    unary(JsUnaryOp::TypeOf, expr)
}

/// Create an update expression.
pub fn update(op: JsUpdateOp, argument: JsExpr, prefix: bool) -> JsExpr {
    JsExpr::Update(JsUpdateExpression {
        operator: op,
        argument: Box::new(argument),
        prefix,
    })
}

/// Create an increment expression.
pub fn increment(expr: JsExpr, prefix: bool) -> JsExpr {
    update(JsUpdateOp::Increment, expr, prefix)
}

/// Create a decrement expression.
pub fn decrement(expr: JsExpr, prefix: bool) -> JsExpr {
    update(JsUpdateOp::Decrement, expr, prefix)
}

/// Create an assignment expression.
pub fn assignment(op: JsAssignmentOp, left: JsExpr, right: JsExpr) -> JsExpr {
    JsExpr::Assignment(JsAssignmentExpression {
        operator: op,
        left: Box::new(left),
        right: Box::new(right),
    })
}

/// Create a simple assignment expression.
pub fn assign(left: JsExpr, right: JsExpr) -> JsExpr {
    assignment(JsAssignmentOp::Assign, left, right)
}

/// Create an assignment expression from an operator string.
pub fn assign_op(op: &str, left: JsExpr, right: JsExpr) -> JsExpr {
    let operator = match op {
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
        "|=" => JsAssignmentOp::BitOrAssign,
        "^=" => JsAssignmentOp::BitXorAssign,
        "&=" => JsAssignmentOp::BitAndAssign,
        "||=" => JsAssignmentOp::OrAssign,
        "&&=" => JsAssignmentOp::AndAssign,
        "??=" => JsAssignmentOp::NullishAssign,
        _ => JsAssignmentOp::Assign, // Default to simple assignment
    };
    assignment(operator, left, right)
}

/// Create a conditional (ternary) expression.
pub fn conditional(test: JsExpr, consequent: JsExpr, alternate: JsExpr) -> JsExpr {
    JsExpr::Conditional(JsConditionalExpression {
        test: Box::new(test),
        consequent: Box::new(consequent),
        alternate: Box::new(alternate),
    })
}

/// Create a sequence expression.
pub fn sequence(expressions: Vec<JsExpr>) -> JsExpr {
    JsExpr::Sequence(JsSequenceExpression { expressions })
}

/// Create an await expression.
pub fn await_expr(argument: JsExpr) -> JsExpr {
    JsExpr::Await(Box::new(argument))
}

// ============================================================================
// Statements
// ============================================================================

/// Create an expression statement.
#[inline]
pub fn stmt(expression: JsExpr) -> JsStatement {
    JsStatement::Expression(JsExpressionStatement {
        expression: Box::new(expression),
    })
}

/// Create a return statement.
pub fn return_stmt(argument: Option<JsExpr>) -> JsStatement {
    JsStatement::Return(JsReturnStatement {
        argument: argument.map(Box::new),
    })
}

/// Create a return statement with a value.
pub fn return_value(value: JsExpr) -> JsStatement {
    return_stmt(Some(value))
}

/// Create an if statement.
pub fn if_stmt(
    test: JsExpr,
    consequent: JsStatement,
    alternate: Option<JsStatement>,
) -> JsStatement {
    JsStatement::If(JsIfStatement {
        test: Box::new(test),
        consequent: Box::new(consequent),
        alternate: alternate.map(Box::new),
    })
}

/// Create a block statement.
pub fn block(body: Vec<JsStatement>) -> JsStatement {
    JsStatement::Block(JsBlockStatement::with_body(body))
}

/// Create a for statement.
pub fn for_stmt(
    init: Option<JsForInit>,
    test: Option<JsExpr>,
    update: Option<JsExpr>,
    body: JsStatement,
) -> JsStatement {
    JsStatement::For(JsForStatement {
        init,
        test: test.map(Box::new),
        update: update.map(Box::new),
        body: Box::new(body),
    })
}

/// Create a for-of statement.
pub fn for_of(left: JsForOfLeft, right: JsExpr, body: JsStatement, is_await: bool) -> JsStatement {
    JsStatement::ForOf(JsForOfStatement {
        left,
        right: Box::new(right),
        body: Box::new(body),
        is_await,
    })
}

/// Create a while statement.
pub fn while_stmt(test: JsExpr, body: JsStatement) -> JsStatement {
    JsStatement::While(JsWhileStatement {
        test: Box::new(test),
        body: Box::new(body),
    })
}

/// Create a do-while statement.
pub fn do_while(body: JsStatement, test: JsExpr) -> JsStatement {
    JsStatement::DoWhile(JsDoWhileStatement {
        body: Box::new(body),
        test: Box::new(test),
    })
}

/// Create a throw statement.
pub fn throw(expr: JsExpr) -> JsStatement {
    JsStatement::Throw(Box::new(expr))
}

/// Create a throw error statement.
pub fn throw_error(message: impl Into<CompactString>) -> JsStatement {
    throw(new_expr(id("Error"), vec![string(message)]))
}

/// Create a labeled statement.
pub fn labeled(label: impl Into<CompactString>, body: JsStatement) -> JsStatement {
    JsStatement::Labeled(JsLabeledStatement {
        label: label.into(),
        body: Box::new(body),
    })
}

/// Create a break statement.
pub fn break_stmt(label: Option<CompactString>) -> JsStatement {
    JsStatement::Break(label)
}

/// Create a continue statement.
pub fn continue_stmt(label: Option<CompactString>) -> JsStatement {
    JsStatement::Continue(label)
}

/// Create a debugger statement.
pub fn debugger() -> JsStatement {
    JsStatement::Debugger
}

/// Create an empty statement.
pub fn empty() -> JsStatement {
    JsStatement::Empty
}

// ============================================================================
// Declarations
// ============================================================================

/// Create a const declaration.
pub fn const_decl(name: impl Into<CompactString>, init: JsExpr) -> JsStatement {
    JsStatement::VariableDeclaration(JsVariableDeclaration {
        kind: JsVariableKind::Const,
        declarations: vec![JsVariableDeclarator {
            id: id_pattern(name),
            init: Some(Box::new(init)),
        }],
    })
}

/// Create a let declaration.
pub fn let_decl(name: impl Into<CompactString>, init: Option<JsExpr>) -> JsStatement {
    JsStatement::VariableDeclaration(JsVariableDeclaration {
        kind: JsVariableKind::Let,
        declarations: vec![JsVariableDeclarator {
            id: id_pattern(name),
            init: init.map(Box::new),
        }],
    })
}

/// Create a var declaration.
#[inline]
pub fn var_decl(name: impl Into<CompactString>, init: Option<JsExpr>) -> JsStatement {
    JsStatement::VariableDeclaration(JsVariableDeclaration {
        kind: JsVariableKind::Var,
        declarations: vec![JsVariableDeclarator {
            id: id_pattern(name),
            init: init.map(Box::new),
        }],
    })
}

/// Create a variable declaration with pattern.
pub fn var_decl_pattern(
    kind: JsVariableKind,
    pattern: JsPattern,
    init: Option<JsExpr>,
) -> JsStatement {
    JsStatement::VariableDeclaration(JsVariableDeclaration {
        kind,
        declarations: vec![JsVariableDeclarator {
            id: pattern,
            init: init.map(Box::new),
        }],
    })
}

/// Create a multi-variable declaration.
pub fn var_decl_multi(
    kind: JsVariableKind,
    declarations: Vec<(JsPattern, Option<JsExpr>)>,
) -> JsStatement {
    JsStatement::VariableDeclaration(JsVariableDeclaration {
        kind,
        declarations: declarations
            .into_iter()
            .map(|(id, init)| JsVariableDeclarator {
                id,
                init: init.map(Box::new),
            })
            .collect(),
    })
}

// ============================================================================
// Imports and Exports
// ============================================================================

/// Create a side-effect import.
pub fn import_side_effect(source: impl Into<CompactString>) -> JsStatement {
    JsStatement::Import(JsImportDeclaration {
        source: source.into(),
        specifiers: vec![JsImportSpecifier::SideEffect],
    })
}

/// Create a namespace import (import * as name from 'source').
pub fn import_namespace(
    name: impl Into<CompactString>,
    source: impl Into<CompactString>,
) -> JsStatement {
    JsStatement::Import(JsImportDeclaration {
        source: source.into(),
        specifiers: vec![JsImportSpecifier::Namespace(name.into())],
    })
}

/// Create a default import.
pub fn import_default(
    name: impl Into<CompactString>,
    source: impl Into<CompactString>,
) -> JsStatement {
    JsStatement::Import(JsImportDeclaration {
        source: source.into(),
        specifiers: vec![JsImportSpecifier::Default(name.into())],
    })
}

/// Create a named import.
pub fn import_named(
    specifiers: Vec<(impl Into<CompactString>, impl Into<CompactString>)>,
    source: impl Into<CompactString>,
) -> JsStatement {
    JsStatement::Import(JsImportDeclaration {
        source: source.into(),
        specifiers: specifiers
            .into_iter()
            .map(|(imported, local)| JsImportSpecifier::Named {
                imported: imported.into(),
                local: local.into(),
            })
            .collect(),
    })
}

/// Create an export default function declaration.
pub fn export_default_function(
    name: impl Into<CompactString>,
    params: Vec<JsPattern>,
    body: Vec<JsStatement>,
) -> JsStatement {
    JsStatement::ExportDefault(JsExportDefault {
        declaration: JsExportDefaultDeclaration::Function(JsFunctionDeclaration {
            id: Some(name.into()),
            params: params.into(),
            body: JsBlockStatement::with_body(body),
            is_async: false,
            is_generator: false,
        }),
    })
}

/// Create an export default expression.
pub fn export_default(expr: JsExpr) -> JsStatement {
    JsStatement::ExportDefault(JsExportDefault {
        declaration: JsExportDefaultDeclaration::Expression(Box::new(expr)),
    })
}

// ============================================================================
// Patterns
// ============================================================================

/// Create an array pattern.
pub fn array_pattern(elements: Vec<Option<JsPattern>>) -> JsPattern {
    JsPattern::Array(JsArrayPattern { elements })
}

/// Create an object pattern.
pub fn object_pattern(properties: Vec<JsObjectPatternProperty>) -> JsPattern {
    JsPattern::Object(JsObjectPattern { properties })
}

/// Create a rest pattern.
pub fn rest_pattern(argument: JsPattern) -> JsPattern {
    JsPattern::Rest(Box::new(argument))
}

/// Create an assignment pattern (default value).
pub fn assignment_pattern(left: JsPattern, right: JsExpr) -> JsPattern {
    JsPattern::Assignment(JsAssignmentPattern {
        left: Box::new(left),
        right: Box::new(right),
    })
}

/// Create an object pattern property.
pub fn object_prop_pattern(
    key: impl Into<CompactString>,
    value: JsPattern,
    shorthand: bool,
) -> JsObjectPatternProperty {
    JsObjectPatternProperty::Property {
        key: JsPropertyKey::Identifier(key.into()),
        value,
        computed: false,
        shorthand,
    }
}

// ============================================================================
// Svelte Runtime Helpers
// ============================================================================

/// Create a call to a Svelte runtime function ($.xxx).
pub fn svelte_call(method: &str, args: Vec<JsExpr>) -> JsExpr {
    call(member(id("$"), method), args)
}

/// Create $.template(html).
pub fn svelte_template(html: impl Into<CompactString>) -> JsExpr {
    svelte_call("template", vec![template_string(html)])
}

/// Create $.from_html(html) or $.from_html(html, flags).
pub fn svelte_from_html(html: impl Into<CompactString>, flags: Option<i32>) -> JsExpr {
    let mut args = vec![template_string(html)];
    if let Some(f) = flags {
        args.push(number(f as f64));
    }
    svelte_call("from_html", args)
}

/// Create $.first_child(node).
pub fn svelte_first_child(node: JsExpr) -> JsExpr {
    svelte_call("first_child", vec![node])
}

/// Create $.sibling(node) or $.sibling(node, count).
pub fn svelte_sibling(node: JsExpr, count: Option<i32>) -> JsExpr {
    let mut args = vec![node];
    if let Some(c) = count {
        args.push(number(c as f64));
    }
    svelte_call("sibling", args)
}

/// Create $.child(node) or $.child(node, true) for preserving whitespace.
pub fn svelte_child(node: JsExpr, preserve_whitespace: Option<bool>) -> JsExpr {
    let mut args = vec![node];
    if let Some(true) = preserve_whitespace {
        args.push(boolean(true));
    }
    svelte_call("child", args)
}

/// Create $.text() or $.text(content).
pub fn svelte_text(content: Option<JsExpr>) -> JsExpr {
    let args = content.map(|c| vec![c]).unwrap_or_default();
    svelte_call("text", args)
}

/// Create $.comment().
pub fn svelte_comment() -> JsExpr {
    svelte_call("comment", vec![])
}

/// Create $.append(anchor, node).
pub fn svelte_append(anchor: JsExpr, node: JsExpr) -> JsExpr {
    svelte_call("append", vec![anchor, node])
}

/// Create $.template_effect(fn).
pub fn svelte_template_effect(callback: JsExpr) -> JsExpr {
    svelte_call("template_effect", vec![callback])
}

/// Create $.template_effect(fn, values).
pub fn svelte_template_effect_with_values(callback: JsExpr, values: JsExpr) -> JsExpr {
    svelte_call("template_effect", vec![callback, values])
}

/// Create $.set_text(node, text).
pub fn svelte_set_text(node: JsExpr, text: JsExpr) -> JsExpr {
    svelte_call("set_text", vec![node, text])
}

/// Create $.get(source).
pub fn svelte_get(source: JsExpr) -> JsExpr {
    svelte_call("get", vec![source])
}

/// Create $.set(source, value).
pub fn svelte_set(source: JsExpr, value: JsExpr) -> JsExpr {
    svelte_call("set", vec![source, value])
}

/// Create $.set(source, value, true).
pub fn svelte_set_sync(source: JsExpr, value: JsExpr) -> JsExpr {
    svelte_call("set", vec![source, value, true_literal()])
}

/// Create $.event(event_name, element, handler).
pub fn svelte_event(
    event_name: impl Into<CompactString>,
    element: JsExpr,
    handler: JsExpr,
) -> JsExpr {
    svelte_call("event", vec![string(event_name), element, handler])
}

/// Create $.state(value).
pub fn svelte_state(value: JsExpr) -> JsExpr {
    svelte_call("state", vec![value])
}

/// Create $.proxy(value).
pub fn svelte_proxy(value: JsExpr) -> JsExpr {
    svelte_call("proxy", vec![value])
}

/// Create $.derived(() => expr).
pub fn svelte_derived(expr: JsExpr) -> JsExpr {
    svelte_call("derived", vec![thunk(expr)])
}

/// Create $.effect(fn).
pub fn svelte_effect(callback: JsExpr) -> JsExpr {
    svelte_call("effect", vec![callback])
}

/// Create $.push(props, runes).
pub fn svelte_push(props: JsExpr, runes: bool) -> JsExpr {
    svelte_call("push", vec![props, boolean(runes)])
}

/// Create $.pop().
pub fn svelte_pop() -> JsExpr {
    svelte_call("pop", vec![])
}

/// Create $.each(anchor, flags, () => collection, key_fn, (anchor, item, index) => { ... }).
pub fn svelte_each(
    anchor: JsExpr,
    flags: i32,
    collection: JsExpr,
    key_fn: JsExpr,
    callback: JsExpr,
) -> JsExpr {
    svelte_call(
        "each",
        vec![
            anchor,
            number(flags as f64),
            thunk(collection),
            key_fn,
            callback,
        ],
    )
}

/// Create $.await(anchor, () => promise, pending_fn, then_fn).
pub fn svelte_await(
    anchor: JsExpr,
    promise_getter: JsExpr,
    pending_fn: Option<JsExpr>,
    then_fn: JsExpr,
) -> JsExpr {
    svelte_call(
        "await",
        vec![
            anchor,
            promise_getter,
            pending_fn.unwrap_or_else(null),
            then_fn,
        ],
    )
}

/// Create $.if(anchor, () => condition, consequent_fn, alternate_fn).
pub fn svelte_if(
    anchor: JsExpr,
    condition_getter: JsExpr,
    consequent_fn: JsExpr,
    alternate_fn: Option<JsExpr>,
) -> JsExpr {
    let mut args = vec![anchor, condition_getter, consequent_fn];
    if let Some(alt) = alternate_fn {
        args.push(alt);
    }
    svelte_call("if", args)
}

/// Create $.element(anchor, tag, is_svg).
pub fn svelte_element(anchor: JsExpr, tag: JsExpr, is_svg: bool) -> JsExpr {
    svelte_call("element", vec![anchor, tag, boolean(is_svg)])
}

/// Create $.delegate(events).
pub fn svelte_delegate(events: Vec<String>) -> JsExpr {
    svelte_call(
        "delegate",
        vec![array(events.into_iter().map(string).collect())],
    )
}

/// Create $.bind_value(element, getter, setter).
pub fn svelte_bind_value(element: JsExpr, getter: JsExpr, setter: JsExpr) -> JsExpr {
    svelte_call("bind_value", vec![element, getter, setter])
}

/// Create $.bind_this(element, setter, getter).
pub fn svelte_bind_this(element: JsExpr, setter: JsExpr, getter: JsExpr) -> JsExpr {
    svelte_call("bind_this", vec![element, setter, getter])
}

/// Create $.prop(props, name, flags, fallback).
pub fn svelte_prop(
    props: JsExpr,
    name: impl Into<CompactString>,
    flags: i32,
    fallback: Option<JsExpr>,
) -> JsExpr {
    let mut args = vec![props, string(name), number(flags as f64)];
    if let Some(fb) = fallback {
        args.push(fb);
    }
    svelte_call("prop", args)
}

/// Create $.rest_props(props, exclude).
pub fn svelte_rest_props(props: JsExpr, exclude: Vec<CompactString>) -> JsExpr {
    svelte_call(
        "rest_props",
        vec![props, array(exclude.into_iter().map(string).collect())],
    )
}

/// Create $.update(source) or $.update(source, delta).
pub fn svelte_update(source: JsExpr, delta: Option<i32>) -> JsExpr {
    let mut args = vec![source];
    if let Some(d) = delta {
        args.push(number(d as f64));
    }
    svelte_call("update", args)
}

/// Create $.reset(element).
pub fn svelte_reset(element: JsExpr) -> JsExpr {
    svelte_call("reset", vec![element])
}

/// Create $.next().
pub fn svelte_next(count: Option<i32>) -> JsExpr {
    let args = if let Some(c) = count {
        vec![number(c as f64)]
    } else {
        vec![]
    };
    svelte_call("next", args)
}

/// Create $.attr(element, name, value).
pub fn svelte_attr(element: JsExpr, name: impl Into<CompactString>, value: JsExpr) -> JsExpr {
    svelte_call("attr", vec![element, string(name), value])
}

/// Create $.set_attribute(element, name, value).
pub fn svelte_set_attribute(
    element: JsExpr,
    name: impl Into<CompactString>,
    value: JsExpr,
) -> JsExpr {
    svelte_call("set_attribute", vec![element, string(name), value])
}

/// Create $.remove_input_defaults(element).
pub fn svelte_remove_input_defaults(element: JsExpr) -> JsExpr {
    svelte_call("remove_input_defaults", vec![element])
}

/// Create $.index (reference to the index key function).
pub fn svelte_index() -> JsExpr {
    member(id("$"), "index")
}

/// Create $.autofocus(element, value).
pub fn svelte_autofocus(element: JsExpr, value: bool) -> JsExpr {
    svelte_call("autofocus", vec![element, boolean(value)])
}

/// Create $.set_custom_element_data(element, name, value).
pub fn svelte_set_custom_element_data(
    element: JsExpr,
    name: impl Into<CompactString>,
    value: JsExpr,
) -> JsExpr {
    svelte_call(
        "set_custom_element_data",
        vec![element, string(name), value],
    )
}

/// Create $.html(node, fn).
pub fn svelte_html(node: JsExpr, getter: JsExpr) -> JsExpr {
    svelte_call("html", vec![node, getter])
}

/// Create $.set_class(element, flags, class_attr, class_binding, class_map, class_directives).
pub fn svelte_set_class(
    element: JsExpr,
    flags: JsExpr,
    class_attr: JsExpr,
    class_binding: JsExpr,
    class_map: JsExpr,
    class_directives: JsExpr,
) -> JsExpr {
    svelte_call(
        "set_class",
        vec![
            element,
            flags,
            class_attr,
            class_binding,
            class_map,
            class_directives,
        ],
    )
}

/// Create $.set_style(element, style_attr, style_binding, style_directives).
pub fn svelte_set_style(
    element: JsExpr,
    style_attr: JsExpr,
    style_binding: JsExpr,
    style_directives: JsExpr,
) -> JsExpr {
    svelte_call(
        "set_style",
        vec![element, style_attr, style_binding, style_directives],
    )
}

/// Create $.action(element, callback) or $.action(element, callback, argument_getter).
/// The callback is typically: ($$node) => action?.($$node)
/// If there's an argument, the argument_getter is a thunk: () => arg
pub fn svelte_action(element: JsExpr, callback: JsExpr, arg_getter: Option<JsExpr>) -> JsExpr {
    let mut args = vec![element, callback];
    if let Some(arg) = arg_getter {
        args.push(arg);
    }
    svelte_call("action", args)
}

/// Transition flag constants.
/// Corresponds to constants in `svelte/packages/svelte/src/constants.js`.
pub const TRANSITION_IN: u32 = 1;
pub const TRANSITION_OUT: u32 = 1 << 1; // 2
pub const TRANSITION_GLOBAL: u32 = 1 << 2; // 4

/// Create $.transition(flags, element, name_thunk) or $.transition(flags, element, name_thunk, expr_thunk).
///
/// * `flags` - Combination of TRANSITION_IN, TRANSITION_OUT, TRANSITION_GLOBAL
/// * `element` - The DOM element
/// * `name_thunk` - Thunk returning the transition function: () => slide
/// * `expr_thunk` - Optional thunk returning the expression: () => { duration: 300 }
pub fn svelte_transition(
    flags: u32,
    element: JsExpr,
    name_thunk: JsExpr,
    expr_thunk: Option<JsExpr>,
) -> JsExpr {
    let mut args = vec![number(flags as f64), element, name_thunk];
    if let Some(expr) = expr_thunk {
        args.push(expr);
    }
    svelte_call("transition", args)
}

// ============================================================================
// DOM Manipulation Helpers
// ============================================================================

/// Create element.textContent = value assignment.
pub fn set_text_content(element: JsExpr, value: JsExpr) -> JsExpr {
    assign(member(element, "textContent"), value)
}

/// Create option.value = option.__value = value assignment.
pub fn set_option_value(option: JsExpr, value: JsExpr) -> JsExpr {
    // option.value = option.__value = value
    assign(
        member(option.clone(), "value"),
        assign(member(option, "__value"), value),
    )
}

/// Create element.prop = value assignment for a property.
pub fn set_property(element: JsExpr, prop: impl Into<CompactString>, value: JsExpr) -> JsExpr {
    assign(member(element, prop), value)
}

// ============================================================================
// Program Building
// ============================================================================

/// Create a new program.
pub fn program(body: Vec<JsStatement>) -> JsProgram {
    JsProgram::with_body(body)
}

/// Create a raw JavaScript expression.
///
/// This creates a Raw node containing arbitrary JavaScript code.
/// Use with caution - the string should be valid JavaScript.
pub fn raw(code: impl Into<CompactString>) -> JsExpr {
    JsExpr::Raw(code.into())
}

/// Alias for `number` to match JavaScript builder API.
pub fn literal_number(value: f64) -> JsExpr {
    number(value)
}
