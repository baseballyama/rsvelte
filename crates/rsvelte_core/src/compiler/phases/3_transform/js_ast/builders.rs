//! JavaScript AST builder functions.
//!
//! These functions provide a convenient API for constructing JavaScript AST nodes,
//! similar to Svelte's `builders.js`.

use super::arena::JsArena;
use super::nodes::*;
use compact_str::CompactString;
use smallvec::smallvec;

/// Upstream's `regex_is_valid_identifier` — `/^[a-zA-Z_$][a-zA-Z_$0-9]*$/`.
/// Deliberately ASCII-only: a prop named with a non-ASCII letter is a legal JS
/// identifier but upstream still emits it as a quoted key, and matching that is
/// the point.
pub fn is_valid_identifier(s: &str) -> bool {
    let mut chars = s.chars();
    match chars.next() {
        Some(c) if c == '_' || c == '$' || c.is_ascii_alphabetic() => {}
        _ => return false,
    }
    chars.all(|c| c == '_' || c == '$' || c.is_ascii_alphanumeric())
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
pub fn undefined(arena: &JsArena) -> JsExpr {
    JsExpr::Void(arena.alloc_expr(number(0.0)))
}

/// Create the `true` literal.
pub fn true_literal() -> JsExpr {
    boolean(true)
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
pub fn prop(arena: &JsArena, key: impl Into<CompactString>, value: JsExpr) -> JsObjectMember {
    let key_str: CompactString = key.into();
    let property_key = if is_valid_js_identifier(&key_str) {
        JsPropertyKey::Identifier(key_str)
    } else {
        JsPropertyKey::Literal(JsLiteral::String(key_str))
    };
    JsObjectMember::Property(JsProperty {
        key: property_key,
        value: arena.alloc_expr(value),
        kind: JsPropertyKind::Init,
        computed: false,
        shorthand: false,
        method: false,
    })
}

/// Create a shorthand object property.
pub fn prop_shorthand(arena: &JsArena, name: impl Into<CompactString>) -> JsObjectMember {
    let name: CompactString = name.into();
    let value_expr = id(name.clone());
    JsObjectMember::Property(JsProperty {
        key: JsPropertyKey::Identifier(name),
        value: arena.alloc_expr(value_expr),
        kind: JsPropertyKind::Init,
        computed: false,
        shorthand: true,
        method: false,
    })
}

/// Create a computed property.
pub fn prop_computed(arena: &JsArena, key: JsExpr, value: JsExpr) -> JsObjectMember {
    JsObjectMember::Property(JsProperty {
        key: JsPropertyKey::Computed(arena.alloc_expr(key)),
        value: arena.alloc_expr(value),
        kind: JsPropertyKind::Init,
        computed: true,
        shorthand: false,
        method: false,
    })
}

/// Create a method shorthand property: `name(params) { body }`.
pub fn prop_method(
    arena: &JsArena,
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
    let func_expr = JsExpr::Function(JsFunctionExpression {
        id: None,
        params: params.into(),
        body: JsBlockStatement::with_body(body),
        is_async: false,
        is_generator: false,
    });
    JsObjectMember::Property(JsProperty {
        key,
        value: arena.alloc_expr(func_expr),
        kind: JsPropertyKind::Init,
        computed: false,
        shorthand: false,
        method: true,
    })
}

/// Create a getter property.
/// If the name is not a valid identifier (e.g., contains hyphens), uses a string literal key.
pub fn getter(
    arena: &JsArena,
    name: impl Into<CompactString>,
    body: Vec<JsStatement>,
) -> JsObjectMember {
    let name_str: CompactString = name.into();
    let key = if is_valid_identifier(&name_str) {
        JsPropertyKey::Identifier(name_str)
    } else {
        JsPropertyKey::Literal(JsLiteral::String(name_str))
    };
    let func_expr = JsExpr::Function(JsFunctionExpression {
        id: None,
        params: smallvec![],
        body: JsBlockStatement::with_body(body),
        is_async: false,
        is_generator: false,
    });
    JsObjectMember::Property(JsProperty {
        key,
        value: arena.alloc_expr(func_expr),
        kind: JsPropertyKind::Get,
        computed: false,
        shorthand: false,
        method: false,
    })
}

/// Create a setter property.
/// If the name is not a valid identifier (e.g., contains hyphens), uses a string literal key.
pub fn setter(
    arena: &JsArena,
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
    let func_expr = JsExpr::Function(JsFunctionExpression {
        id: None,
        params: smallvec![id_pattern(param)],
        body: JsBlockStatement::with_body(body),
        is_async: false,
        is_generator: false,
    });
    JsObjectMember::Property(JsProperty {
        key,
        value: arena.alloc_expr(func_expr),
        kind: JsPropertyKind::Set,
        computed: false,
        shorthand: false,
        method: false,
    })
}

/// Create a setter property whose parameter has a default value, e.g.
/// `set foo($$value = "world") { ... }`.
/// If the name is not a valid identifier (e.g., contains hyphens), uses a string literal key.
pub fn setter_with_default(
    arena: &JsArena,
    name: impl Into<CompactString>,
    param: impl Into<CompactString>,
    default: JsExpr,
    body: Vec<JsStatement>,
) -> JsObjectMember {
    let name_str: CompactString = name.into();
    let key = if is_valid_identifier(&name_str) {
        JsPropertyKey::Identifier(name_str)
    } else {
        JsPropertyKey::Literal(JsLiteral::String(name_str))
    };
    let func_expr = JsExpr::Function(JsFunctionExpression {
        id: None,
        params: smallvec![JsPattern::Assignment(JsAssignmentPattern {
            left: Box::new(id_pattern(param)),
            right: arena.alloc_expr(default),
        })],
        body: JsBlockStatement::with_body(body),
        is_async: false,
        is_generator: false,
    });
    JsObjectMember::Property(JsProperty {
        key,
        value: arena.alloc_expr(func_expr),
        kind: JsPropertyKind::Set,
        computed: false,
        shorthand: false,
        method: false,
    })
}

/// Create a spread element in an object.
pub fn spread(arena: &JsArena, expr: JsExpr) -> JsObjectMember {
    JsObjectMember::SpreadElement(arena.alloc_expr(expr))
}

/// Create a spread expression.
pub fn spread_expr(arena: &JsArena, expr: JsExpr) -> JsExpr {
    JsExpr::Spread(arena.alloc_expr(expr))
}

// ============================================================================
// Functions
// ============================================================================

/// Create an arrow function with expression body.
#[inline]
pub fn arrow(arena: &JsArena, params: Vec<JsPattern>, body: JsExpr) -> JsExpr {
    JsExpr::Arrow(JsArrowFunction {
        params: params.into(),
        body: JsArrowBody::Expression(arena.alloc_expr(body)),
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
///
/// Mirrors Svelte 5.53.13's `arrow(params, body, async = true)` optimization
/// (upstream commit `32a48ed17`): `async () => await x` collapses to
/// `() => x` when `x` itself contains no awaits. This avoids an unnecessary
/// async wrapper for `Memoizer.async_values()` entries that just dereference
/// a plain promise.
pub fn async_arrow(arena: &JsArena, params: Vec<JsPattern>, body: JsExpr) -> JsExpr {
    if let JsExpr::Await(inner_id) = &body
        && !has_await_expression_arena(arena, arena.get_expr(*inner_id))
    {
        let inner_clone = arena.get_expr(*inner_id).clone();
        return arrow(arena, params, inner_clone);
    }
    JsExpr::Arrow(JsArrowFunction {
        params: params.into(),
        body: JsArrowBody::Expression(arena.alloc_expr(body)),
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
pub fn thunk(arena: &JsArena, expr: JsExpr) -> JsExpr {
    let arrow_expr = arrow(arena, vec![], expr);
    unthunk(arena, arrow_expr)
}

/// Optimize `(arg) => func(arg)` to `func` and `() => func()` to `func`.
/// Also optimizes `async () => await x()` to `() => x()` when x has no nested awaits.
///
/// Corresponds to `unthunk` in Svelte's builders.js.
pub fn unthunk(arena: &JsArena, expr: JsExpr) -> JsExpr {
    // Only optimize arrow functions
    let JsExpr::Arrow(arrow_fn) = &expr else {
        return expr;
    };

    // Body must be an expression (not a block)
    let JsArrowBody::Expression(body_expr_id) = &arrow_fn.body else {
        return expr;
    };

    // optimize `async () => await x()`, but not `async () => await x(await y)`
    if arrow_fn.is_async {
        if let JsExpr::Await(inner_id) = arena.get_expr(*body_expr_id)
            && !has_await_expression_arena(arena, arena.get_expr(*inner_id))
        {
            let inner_clone = arena.get_expr(*inner_id).clone();
            // Recursively unthunk the non-async version
            let new_arrow = self::arrow(arena, arrow_fn.params.to_vec(), inner_clone);
            return unthunk(arena, new_arrow);
        }
        return expr;
    }

    // Body must be a call expression
    let JsExpr::Call(call) = unspanned(arena, arena.get_expr(*body_expr_id)) else {
        return expr;
    };

    // Don't optimize optional calls: () => func?.() cannot become func
    // because func might be undefined, and calling undefined() would crash
    if call.optional {
        return expr;
    }

    // Callee must be an identifier, or a member expression on the `$` namespace.
    let callee_is_static = match unspanned(arena, arena.get_expr(call.callee)) {
        // A read transform's getter callee is opaque so it is not re-read; it is
        // still a plain identifier for the purpose of dropping the arrow.
        JsExpr::Identifier(_) | JsExpr::OpaqueIdentifier(_) => true,
        JsExpr::Member(m) => {
            matches!(unspanned(arena, arena.get_expr(m.object)), JsExpr::Identifier(name) if name == "$")
        }
        _ => false,
    };
    if !callee_is_static {
        return expr;
    }

    // Check that params match arguments exactly
    if arrow_fn.params.len() != call.arguments.len() {
        return expr;
    }

    // Check each param matches corresponding argument
    for (i, param) in arrow_fn.params.iter().enumerate() {
        let JsPattern::Identifier(param_name) = param else {
            return expr;
        };

        let JsExpr::Identifier(arg_name) = unspanned(arena, &call.arguments[i]) else {
            return expr;
        };

        if param_name != arg_name {
            return expr;
        }
    }

    // Optimization applies: return just the callee
    arena.get_expr(call.callee).clone()
}

fn unspanned<'a>(arena: &'a JsArena, mut expr: &'a JsExpr) -> &'a JsExpr {
    while let JsExpr::Spanned(inner, _, _) = expr {
        expr = arena.get_expr(*inner);
    }
    expr
}

/// Check if a JsExpr contains any AwaitExpression (not crossing function boundaries).
/// Arena-aware version.
fn has_await_expression_arena(arena: &JsArena, expr: &JsExpr) -> bool {
    match expr {
        JsExpr::Await(_) => true,
        // Don't traverse into function boundaries
        JsExpr::Arrow(_) | JsExpr::Function(_) => false,
        // Recursively check sub-expressions
        JsExpr::Call(call) => {
            has_await_expression_arena(arena, arena.get_expr(call.callee))
                || call
                    .arguments
                    .iter()
                    .any(|a| has_await_expression_arena(arena, a))
        }
        JsExpr::Member(member) => {
            has_await_expression_arena(arena, arena.get_expr(member.object))
                || matches!(&member.property, super::nodes::JsMemberProperty::Expression(e) if has_await_expression_arena(arena, arena.get_expr(*e)))
        }
        JsExpr::Binary(bin) => {
            has_await_expression_arena(arena, arena.get_expr(bin.left))
                || has_await_expression_arena(arena, arena.get_expr(bin.right))
        }
        JsExpr::Logical(log) => {
            has_await_expression_arena(arena, arena.get_expr(log.left))
                || has_await_expression_arena(arena, arena.get_expr(log.right))
        }
        JsExpr::Unary(un) => has_await_expression_arena(arena, arena.get_expr(un.argument)),
        JsExpr::Update(up) => has_await_expression_arena(arena, arena.get_expr(up.argument)),
        JsExpr::Conditional(cond) => {
            has_await_expression_arena(arena, arena.get_expr(cond.test))
                || has_await_expression_arena(arena, arena.get_expr(cond.consequent))
                || has_await_expression_arena(arena, arena.get_expr(cond.alternate))
        }
        JsExpr::Sequence(seq) => seq
            .expressions
            .iter()
            .any(|e| has_await_expression_arena(arena, e)),
        JsExpr::Assignment(assign) => {
            has_await_expression_arena(arena, arena.get_expr(assign.right))
        }
        JsExpr::Array(arr) => arr.elements.iter().any(|e| {
            e.as_ref()
                .is_some_and(|ex| has_await_expression_arena(arena, ex))
        }),
        JsExpr::Object(obj) => obj.properties.iter().any(|p| match p {
            super::nodes::JsObjectMember::Property(prop) => {
                has_await_expression_arena(arena, arena.get_expr(prop.value))
            }
            super::nodes::JsObjectMember::SpreadElement(e) => {
                has_await_expression_arena(arena, arena.get_expr(*e))
            }
        }),
        JsExpr::TemplateLiteral(tmpl) => tmpl
            .expressions
            .iter()
            .any(|e| has_await_expression_arena(arena, e)),
        JsExpr::TaggedTemplate(tt) => {
            has_await_expression_arena(arena, arena.get_expr(tt.tag))
                || tt
                    .quasi
                    .expressions
                    .iter()
                    .any(|e| has_await_expression_arena(arena, e))
        }
        JsExpr::New(new_expr) => {
            has_await_expression_arena(arena, arena.get_expr(new_expr.callee))
                || new_expr
                    .arguments
                    .iter()
                    .any(|a| has_await_expression_arena(arena, a))
        }
        JsExpr::Yield(y) => y
            .argument
            .as_ref()
            .is_some_and(|a| has_await_expression_arena(arena, arena.get_expr(*a))),
        JsExpr::Spread(e) => has_await_expression_arena(arena, arena.get_expr(*e)),
        JsExpr::Void(e) => has_await_expression_arena(arena, arena.get_expr(*e)),
        // Optional-chaining wrapper — recurse into the chained expression so
        // `a?.b(await x)` / `a?.[await x]` are detected. H-069.
        JsExpr::Chain(chain) => has_await_expression_arena(arena, arena.get_expr(chain.expression)),
        // Span wrapper carries an inner expression for source maps — recurse so
        // wrapping an awaiting expression doesn't hide the await. H-069.
        JsExpr::Spanned(inner, _, _) => has_await_expression_arena(arena, arena.get_expr(*inner)),
        // Genuine leaves with no sub-expression to traverse. Class bodies are
        // function-boundary / non-async scopes, so they can't surface a
        // top-level await. The match is exhaustive (no `_`) so a future
        // `JsExpr` variant fails to compile until it is handled here.
        JsExpr::Identifier(_)
        | JsExpr::Literal(_)
        | JsExpr::This
        | JsExpr::Super
        | JsExpr::MetaProperty(_, _)
        | JsExpr::ImportExpression { .. }
        | JsExpr::Raw(_)
        | JsExpr::OpaqueIdentifier(_)
        | JsExpr::Class(_) => false,
    }
}

/// Check if a JsExpr contains an await expression (not crossing function boundaries).
/// Public version of the internal function for use in visitors.
pub fn js_expr_has_await(arena: &JsArena, expr: &JsExpr) -> bool {
    has_await_expression_arena(arena, expr)
}

/// Strip the top-level `await` from a JsExpr.
///
/// If the expression is `JsExpr::Await(inner_id)`, returns the inner expression.
/// Otherwise returns the original expression unchanged.
pub fn strip_await(arena: &JsArena, expr: JsExpr) -> JsExpr {
    match expr {
        // SAFETY: this handle's node is moved out exactly once here, with no other live
        // reference into its arena slot; the arena is single-threaded (`!Sync`).
        JsExpr::Await(inner_id) => unsafe { arena.take_expr(inner_id) },
        other => other,
    }
}

/// Wrap an expression in the `$.save()` pattern.
///
/// Turns `await expr` into `(await $.save(expr))()`.
///
/// Corresponds to the `save()` function in
/// `svelte/packages/svelte/src/compiler/utils/ast.js:637`.
pub fn save(arena: &JsArena, expression: JsExpr) -> JsExpr {
    // (await $.save(expression))()
    let inner_call = call(arena, member_path(arena, "$.save"), vec![expression]);
    let await_expr = JsExpr::Await(arena.alloc_expr(inner_call));
    call(arena, await_expr, vec![])
}

/// Apply `$.save()` wrapping with the expression NOT in tail position.
///
/// This is used when the expression is inside a const declaration within an
/// async arrow body (not the final return value), so ALL await expressions
/// should be wrapped with `$.save()`.
pub fn apply_save_wrapping_non_tail(arena: &JsArena, expr: JsExpr) -> JsExpr {
    if !has_await_expression_arena(arena, &expr) {
        return expr;
    }
    apply_save_recursive(arena, expr, false)
}

/// Recursively apply save wrapping.
///
/// `is_tail` indicates whether this expression is in "tail position"
/// (the last evaluated sub-expression). Await expressions in tail
/// position do NOT need `$.save()` wrapping.
fn apply_save_recursive(arena: &JsArena, expr: JsExpr, is_tail: bool) -> JsExpr {
    match expr {
        JsExpr::Await(inner_id) => {
            if is_tail {
                // Tail position: leave as plain `await X`
                // SAFETY: this handle's node is moved out exactly once here, with no other live
                // reference into its arena slot; the arena is single-threaded (`!Sync`).
                let inner = unsafe { arena.take_expr(inner_id) };
                let transformed = apply_save_recursive(arena, inner, true);
                JsExpr::Await(arena.alloc_expr(transformed))
            } else {
                // Non-tail position: wrap as `(await $.save(X))()`
                // SAFETY: this handle's node is moved out exactly once here, with no other live
                // reference into its arena slot; the arena is single-threaded (`!Sync`).
                let inner = unsafe { arena.take_expr(inner_id) };
                save(arena, inner)
            }
        }

        JsExpr::Binary(bin) => {
            // SAFETY: this handle's node is moved out exactly once here, with no other live
            // reference into its arena slot; the arena is single-threaded (`!Sync`).
            let left = unsafe { arena.take_expr(bin.left) };
            // SAFETY: this handle's node is moved out exactly once here, with no other live
            // reference into its arena slot; the arena is single-threaded (`!Sync`).
            let right = unsafe { arena.take_expr(bin.right) };
            let left = apply_save_recursive(arena, left, false);
            let right = apply_save_recursive(arena, right, is_tail);
            JsExpr::Binary(JsBinaryExpression {
                operator: bin.operator,
                left: arena.alloc_expr(left),
                right: arena.alloc_expr(right),
            })
        }

        JsExpr::Logical(log) => {
            // SAFETY: this handle's node is moved out exactly once here, with no other live
            // reference into its arena slot; the arena is single-threaded (`!Sync`).
            let left = unsafe { arena.take_expr(log.left) };
            // SAFETY: this handle's node is moved out exactly once here, with no other live
            // reference into its arena slot; the arena is single-threaded (`!Sync`).
            let right = unsafe { arena.take_expr(log.right) };
            let left = apply_save_recursive(arena, left, false);
            let right = apply_save_recursive(arena, right, is_tail);
            JsExpr::Logical(JsLogicalExpression {
                operator: log.operator,
                left: arena.alloc_expr(left),
                right: arena.alloc_expr(right),
            })
        }

        JsExpr::Assignment(assign) => {
            // SAFETY: this handle's node is moved out exactly once here, with no other live
            // reference into its arena slot; the arena is single-threaded (`!Sync`).
            let left = unsafe { arena.take_expr(assign.left) };
            // SAFETY: this handle's node is moved out exactly once here, with no other live
            // reference into its arena slot; the arena is single-threaded (`!Sync`).
            let right = unsafe { arena.take_expr(assign.right) };
            let left = apply_save_recursive(arena, left, false);
            let right = apply_save_recursive(arena, right, is_tail);
            JsExpr::Assignment(JsAssignmentExpression {
                operator: assign.operator,
                left: arena.alloc_expr(left),
                right: arena.alloc_expr(right),
            })
        }

        JsExpr::Call(call_expr) => {
            // SAFETY: this handle's node is moved out exactly once here, with no other live
            // reference into its arena slot; the arena is single-threaded (`!Sync`).
            let callee = unsafe { arena.take_expr(call_expr.callee) };
            let callee = apply_save_recursive(arena, callee, false);
            let len = call_expr.arguments.len();
            let arguments: Vec<JsExpr> = call_expr
                .arguments
                .into_iter()
                .enumerate()
                .map(|(i, arg)| {
                    let arg_is_tail = is_tail && i == len - 1;
                    apply_save_recursive(arena, arg, arg_is_tail)
                })
                .collect();
            JsExpr::Call(JsCallExpression {
                callee: arena.alloc_expr(callee),
                arguments,
                optional: call_expr.optional,
            })
        }

        JsExpr::New(new_expr) => {
            // SAFETY: this handle's node is moved out exactly once here, with no other live
            // reference into its arena slot; the arena is single-threaded (`!Sync`).
            let callee = unsafe { arena.take_expr(new_expr.callee) };
            let callee = apply_save_recursive(arena, callee, false);
            let len = new_expr.arguments.len();
            let arguments: Vec<JsExpr> = new_expr
                .arguments
                .into_iter()
                .enumerate()
                .map(|(i, arg)| {
                    let arg_is_tail = is_tail && i == len - 1;
                    apply_save_recursive(arena, arg, arg_is_tail)
                })
                .collect();
            JsExpr::New(JsNewExpression {
                callee: arena.alloc_expr(callee),
                arguments,
            })
        }

        JsExpr::Array(arr) => {
            let len = arr.elements.len();
            let elements: Vec<Option<JsExpr>> = arr
                .elements
                .into_iter()
                .enumerate()
                .map(|(i, elem)| {
                    elem.map(|e| {
                        let elem_is_tail = is_tail && i == len - 1;
                        apply_save_recursive(arena, e, elem_is_tail)
                    })
                })
                .collect();
            JsExpr::Array(JsArrayExpression { elements })
        }

        JsExpr::Conditional(cond) => {
            // SAFETY: this handle's node is moved out exactly once here, with no other live
            // reference into its arena slot; the arena is single-threaded (`!Sync`).
            let test = unsafe { arena.take_expr(cond.test) };
            // SAFETY: this handle's node is moved out exactly once here, with no other live
            // reference into its arena slot; the arena is single-threaded (`!Sync`).
            let consequent = unsafe { arena.take_expr(cond.consequent) };
            // SAFETY: this handle's node is moved out exactly once here, with no other live
            // reference into its arena slot; the arena is single-threaded (`!Sync`).
            let alternate = unsafe { arena.take_expr(cond.alternate) };
            let test = apply_save_recursive(arena, test, false);
            let consequent = apply_save_recursive(arena, consequent, is_tail);
            let alternate = apply_save_recursive(arena, alternate, is_tail);
            JsExpr::Conditional(JsConditionalExpression {
                test: arena.alloc_expr(test),
                consequent: arena.alloc_expr(consequent),
                alternate: arena.alloc_expr(alternate),
            })
        }

        JsExpr::Member(member) => {
            let object_is_tail = if member.computed { false } else { is_tail };
            // SAFETY: this handle's node is moved out exactly once here, with no other live
            // reference into its arena slot; the arena is single-threaded (`!Sync`).
            let object = unsafe { arena.take_expr(member.object) };
            let object = apply_save_recursive(arena, object, object_is_tail);
            let property = match member.property {
                JsMemberProperty::Expression(e_id) => {
                    // SAFETY: this handle's node is moved out exactly once here, with no other live
                    // reference into its arena slot; the arena is single-threaded (`!Sync`).
                    let e = unsafe { arena.take_expr(e_id) };
                    let transformed = apply_save_recursive(arena, e, is_tail);
                    JsMemberProperty::Expression(arena.alloc_expr(transformed))
                }
                other => other,
            };
            JsExpr::Member(JsMemberExpression {
                object: arena.alloc_expr(object),
                property,
                computed: member.computed,
                optional: member.optional,
            })
        }

        JsExpr::Sequence(seq) => {
            let len = seq.expressions.len();
            let expressions: Vec<JsExpr> = seq
                .expressions
                .into_iter()
                .enumerate()
                .map(|(i, e)| {
                    let e_is_tail = is_tail && i == len - 1;
                    apply_save_recursive(arena, e, e_is_tail)
                })
                .collect();
            JsExpr::Sequence(JsSequenceExpression { expressions })
        }

        JsExpr::TemplateLiteral(tmpl) => {
            let len = tmpl.expressions.len();
            let expressions: Vec<JsExpr> = tmpl
                .expressions
                .into_iter()
                .enumerate()
                .map(|(i, e)| {
                    let e_is_tail = is_tail && i == len - 1;
                    apply_save_recursive(arena, e, e_is_tail)
                })
                .collect();
            JsExpr::TemplateLiteral(JsTemplateLiteral {
                quasis: tmpl.quasis,
                expressions,
            })
        }

        JsExpr::TaggedTemplate(tt) => {
            // SAFETY: this handle's node is moved out exactly once here, with no other live
            // reference into its arena slot; the arena is single-threaded (`!Sync`).
            let tag = unsafe { arena.take_expr(tt.tag) };
            let tag = apply_save_recursive(arena, tag, false);
            let len = tt.quasi.expressions.len();
            let expressions: Vec<JsExpr> = tt
                .quasi
                .expressions
                .into_iter()
                .enumerate()
                .map(|(i, e)| {
                    let e_is_tail = is_tail && i == len - 1;
                    apply_save_recursive(arena, e, e_is_tail)
                })
                .collect();
            JsExpr::TaggedTemplate(JsTaggedTemplate {
                tag: arena.alloc_expr(tag),
                quasi: JsTemplateLiteral {
                    quasis: tt.quasi.quasis,
                    expressions,
                },
            })
        }

        JsExpr::Object(obj) => {
            let len = obj.properties.len();
            let properties: Vec<JsObjectMember> = obj
                .properties
                .into_iter()
                .enumerate()
                .map(|(i, prop)| {
                    let prop_is_tail = is_tail && i == len - 1;
                    match prop {
                        JsObjectMember::Property(p) => {
                            let key = match p.key {
                                JsPropertyKey::Computed(e_id) => {
                                    // SAFETY: this handle's node is moved out exactly once here, with no other live
                                    // reference into its arena slot; the arena is single-threaded (`!Sync`).
                                    let e = unsafe { arena.take_expr(e_id) };
                                    let transformed = apply_save_recursive(arena, e, false);
                                    JsPropertyKey::Computed(arena.alloc_expr(transformed))
                                }
                                other => other,
                            };
                            // SAFETY: this handle's node is moved out exactly once here, with no other live
                            // reference into its arena slot; the arena is single-threaded (`!Sync`).
                            let value = unsafe { arena.take_expr(p.value) };
                            let value = apply_save_recursive(arena, value, prop_is_tail);
                            JsObjectMember::Property(JsProperty {
                                key,
                                value: arena.alloc_expr(value),
                                kind: p.kind,
                                computed: p.computed,
                                shorthand: p.shorthand,
                                method: p.method,
                            })
                        }
                        JsObjectMember::SpreadElement(e_id) => {
                            // SAFETY: this handle's node is moved out exactly once here, with no other live
                            // reference into its arena slot; the arena is single-threaded (`!Sync`).
                            let e = unsafe { arena.take_expr(e_id) };
                            let transformed = apply_save_recursive(arena, e, prop_is_tail);
                            JsObjectMember::SpreadElement(arena.alloc_expr(transformed))
                        }
                    }
                })
                .collect();
            JsExpr::Object(JsObjectExpression { properties })
        }

        JsExpr::Unary(un) => {
            // SAFETY: this handle's node is moved out exactly once here, with no other live
            // reference into its arena slot; the arena is single-threaded (`!Sync`).
            let argument = unsafe { arena.take_expr(un.argument) };
            let argument = apply_save_recursive(arena, argument, false);
            JsExpr::Unary(JsUnaryExpression {
                operator: un.operator,
                argument: arena.alloc_expr(argument),
                prefix: un.prefix,
            })
        }

        JsExpr::Update(up) => {
            // SAFETY: this handle's node is moved out exactly once here, with no other live
            // reference into its arena slot; the arena is single-threaded (`!Sync`).
            let argument = unsafe { arena.take_expr(up.argument) };
            let argument = apply_save_recursive(arena, argument, false);
            JsExpr::Update(JsUpdateExpression {
                operator: up.operator,
                argument: arena.alloc_expr(argument),
                prefix: up.prefix,
            })
        }

        JsExpr::Spread(inner_id) => {
            // SAFETY: this handle's node is moved out exactly once here, with no other live
            // reference into its arena slot; the arena is single-threaded (`!Sync`).
            let inner = unsafe { arena.take_expr(inner_id) };
            let transformed = apply_save_recursive(arena, inner, is_tail);
            JsExpr::Spread(arena.alloc_expr(transformed))
        }

        JsExpr::Void(inner_id) => {
            // SAFETY: this handle's node is moved out exactly once here, with no other live
            // reference into its arena slot; the arena is single-threaded (`!Sync`).
            let inner = unsafe { arena.take_expr(inner_id) };
            let transformed = apply_save_recursive(arena, inner, false);
            JsExpr::Void(arena.alloc_expr(transformed))
        }

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

/// Create an async thunk.
///
/// Wraps expression in `async () => expr` and applies unthunk optimization:
/// `async () => await x()` becomes `() => x()` (when x has no nested awaits).
///
/// Corresponds to Svelte's `thunk(expression, true)`.
///
/// Note: The `$.save()` or `$.track_reactivity_loss()` wrapping is applied
/// at the expression level (in the AwaitExpression visitor / expression converter),
/// NOT here. This matches the reference Svelte compiler behavior.
pub fn async_thunk(arena: &JsArena, expr: JsExpr) -> JsExpr {
    let async_arrow_expr = async_arrow(arena, vec![], expr);
    unthunk(arena, async_arrow_expr)
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

// ============================================================================
// Calls and Member Access
// ============================================================================

/// Create a call expression.
#[inline]
pub fn call(arena: &JsArena, callee: JsExpr, arguments: Vec<JsExpr>) -> JsExpr {
    JsExpr::Call(JsCallExpression {
        callee: arena.alloc_expr(callee),
        arguments,
        optional: false,
    })
}

/// Create the getter call a read transform produces (`x` -> `x()`).
///
/// A source-level `x()` and a transform-produced `x()` are the same shape, so the
/// callee is marked opaque: without it a second `apply_transforms_to_expression`
/// pass over an already-transformed subtree reads the binding twice (`x()()`).
#[inline]
pub fn getter_call(arena: &JsArena, node: JsExpr) -> JsExpr {
    let callee = match node {
        JsExpr::Identifier(ref name) => JsExpr::OpaqueIdentifier(name.clone()),
        _ => node,
    };
    call(arena, callee, vec![])
}

/// Create a call expression with trailing undefined/false arguments stripped.
///
/// This matches the behavior of the official Svelte compiler's `b.call()` function
/// which removes trailing falsy arguments but keeps internal ones as `void 0`.
#[inline]
pub fn call_trimmed(arena: &JsArena, callee: JsExpr, arguments: Vec<JsExpr>) -> JsExpr {
    let mut args = arguments;

    // Remove trailing undefined/void expressions
    while let Some(last) = args.last() {
        let is_falsy = match last {
            JsExpr::Identifier(name) if name == "undefined" => true,
            JsExpr::Void(_) => true,
            JsExpr::Unary(unary) => {
                // Check for `void 0` pattern
                matches!(unary.operator, JsUnaryOp::Void)
                    && matches!(arena.get_expr(unary.argument), JsExpr::Literal(JsLiteral::Number(n)) if *n == 0.0)
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
        callee: arena.alloc_expr(callee),
        arguments: args,
        optional: false,
    })
}

/// Create an optional call expression `callee?.(args…)`.
///
/// Mirrors upstream `b.maybe_call`, which returns a `ChainExpression` wrapping
/// the optional `CallExpression` (not a bare optional call). The `ChainExpression`
/// wrapper is what makes esrap parenthesize when the chain is used as the object
/// of a *non-optional* member access — e.g. snippet destructuring builds
/// `($$arg0?.()).href` (the parens stop `.href` from joining the optional chain
/// and short-circuiting). Every other optional chain in the IR is likewise a
/// `JsExpr::Chain`, so this keeps the representation consistent.
pub fn optional_call(arena: &JsArena, callee: JsExpr, arguments: Vec<JsExpr>) -> JsExpr {
    let call = JsExpr::Call(JsCallExpression {
        callee: arena.alloc_expr(callee),
        arguments,
        optional: true,
    });
    JsExpr::Chain(JsChainExpression {
        expression: arena.alloc_expr(call),
    })
}

/// Close an optional chain by wrapping it in a `ChainExpression`, so a member
/// access built on top of it stays *outside* the chain (upstream keeps the
/// source `ChainExpression` node, which is what makes esrap parenthesize).
/// Non-chains and already-wrapped chains are returned unchanged.
pub fn close_optional_chain(arena: &JsArena, expr: JsExpr) -> JsExpr {
    fn is_open_chain(arena: &JsArena, expr: &JsExpr) -> bool {
        match expr {
            JsExpr::Member(m) => m.optional || is_open_chain(arena, arena.get_expr(m.object)),
            JsExpr::Call(c) => c.optional || is_open_chain(arena, arena.get_expr(c.callee)),
            _ => false,
        }
    }

    if is_open_chain(arena, &expr) {
        JsExpr::Chain(JsChainExpression {
            expression: arena.alloc_expr(expr),
        })
    } else {
        expr
    }
}

/// Create a new expression.
pub fn new_expr(arena: &JsArena, callee: JsExpr, arguments: Vec<JsExpr>) -> JsExpr {
    JsExpr::New(JsNewExpression {
        callee: arena.alloc_expr(callee),
        arguments,
    })
}

/// Create a member expression with identifier property.
#[inline]
pub fn member(arena: &JsArena, object: JsExpr, property: impl Into<CompactString>) -> JsExpr {
    JsExpr::Member(JsMemberExpression {
        object: arena.alloc_expr(object),
        property: JsMemberProperty::Identifier(property.into()),
        computed: false,
        optional: false,
    })
}

/// Create a computed member expression.
pub fn member_computed(arena: &JsArena, object: JsExpr, property: JsExpr) -> JsExpr {
    JsExpr::Member(JsMemberExpression {
        object: arena.alloc_expr(object),
        property: JsMemberProperty::Expression(arena.alloc_expr(property)),
        computed: true,
        optional: false,
    })
}

/// Create an optional member expression.
pub fn optional_member(
    arena: &JsArena,
    object: JsExpr,
    property: impl Into<CompactString>,
) -> JsExpr {
    JsExpr::Member(JsMemberExpression {
        object: arena.alloc_expr(object),
        property: JsMemberProperty::Identifier(property.into()),
        computed: false,
        optional: true,
    })
}

/// Create a member path from a dot-separated string (e.g., "$.template").
#[inline]
pub fn member_path(arena: &JsArena, path: &str) -> JsExpr {
    // Fast path for common "$.xxx" pattern (avoids Vec allocation)
    if let Some(rest) = path.strip_prefix("$.")
        && !rest.contains('.')
    {
        return member(arena, id("$"), rest);
    }

    // General case
    let mut parts = path.split('.');
    let mut expr = id(parts.next().unwrap());
    for part in parts {
        expr = member(arena, expr, part);
    }
    expr
}

// ============================================================================
// Operators
// ============================================================================

/// Create a binary expression.
pub fn binary(arena: &JsArena, op: impl Into<JsBinaryOp>, left: JsExpr, right: JsExpr) -> JsExpr {
    JsExpr::Binary(JsBinaryExpression {
        operator: op.into(),
        left: arena.alloc_expr(left),
        right: arena.alloc_expr(right),
    })
}

/// Create a binary expression from an operator string.
pub fn binary_str(arena: &JsArena, op: &str, left: JsExpr, right: JsExpr) -> JsExpr {
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
            return logical_str(arena, op, left, right);
        }
        _ => JsBinaryOp::Add, // Default to addition
    };
    binary(arena, operator, left, right)
}

/// Create a logical expression.
pub fn logical(arena: &JsArena, op: JsLogicalOp, left: JsExpr, right: JsExpr) -> JsExpr {
    JsExpr::Logical(JsLogicalExpression {
        operator: op,
        left: arena.alloc_expr(left),
        right: arena.alloc_expr(right),
    })
}

/// Create an AND expression.
pub fn and(arena: &JsArena, left: JsExpr, right: JsExpr) -> JsExpr {
    logical(arena, JsLogicalOp::And, left, right)
}

/// Create an OR expression.
pub fn or(arena: &JsArena, left: JsExpr, right: JsExpr) -> JsExpr {
    logical(arena, JsLogicalOp::Or, left, right)
}

/// Create a nullish coalescing expression.
pub fn nullish(arena: &JsArena, left: JsExpr, right: JsExpr) -> JsExpr {
    logical(arena, JsLogicalOp::NullishCoalescing, left, right)
}

/// Create a logical expression from an operator string.
pub fn logical_str(arena: &JsArena, op: &str, left: JsExpr, right: JsExpr) -> JsExpr {
    let operator = match op {
        "&&" => JsLogicalOp::And,
        "||" => JsLogicalOp::Or,
        "??" => JsLogicalOp::NullishCoalescing,
        _ => panic!("Invalid logical operator: {}", op),
    };
    logical(arena, operator, left, right)
}

/// Create an update expression.
pub fn update(arena: &JsArena, op: JsUpdateOp, argument: JsExpr, prefix: bool) -> JsExpr {
    JsExpr::Update(JsUpdateExpression {
        operator: op,
        argument: arena.alloc_expr(argument),
        prefix,
    })
}

/// Create an assignment expression.
pub fn assignment(arena: &JsArena, op: JsAssignmentOp, left: JsExpr, right: JsExpr) -> JsExpr {
    JsExpr::Assignment(JsAssignmentExpression {
        operator: op,
        left: arena.alloc_expr(left),
        right: arena.alloc_expr(right),
    })
}

/// Create a simple assignment expression.
pub fn assign(arena: &JsArena, left: JsExpr, right: JsExpr) -> JsExpr {
    assignment(arena, JsAssignmentOp::Assign, left, right)
}

/// Create an assignment expression from an operator string.
pub fn assign_op(arena: &JsArena, op: &str, left: JsExpr, right: JsExpr) -> JsExpr {
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
    assignment(arena, operator, left, right)
}

/// Create a conditional (ternary) expression.
pub fn conditional(arena: &JsArena, test: JsExpr, consequent: JsExpr, alternate: JsExpr) -> JsExpr {
    JsExpr::Conditional(JsConditionalExpression {
        test: arena.alloc_expr(test),
        consequent: arena.alloc_expr(consequent),
        alternate: arena.alloc_expr(alternate),
    })
}

/// Create a sequence expression.
pub fn sequence(expressions: Vec<JsExpr>) -> JsExpr {
    JsExpr::Sequence(JsSequenceExpression { expressions })
}

/// Create an await expression.
pub fn await_expr(arena: &JsArena, argument: JsExpr) -> JsExpr {
    JsExpr::Await(arena.alloc_expr(argument))
}

// ============================================================================
// Statements
// ============================================================================

/// Create an expression statement.
#[inline]
pub fn stmt(arena: &JsArena, expression: JsExpr) -> JsStatement {
    JsStatement::Expression(JsExpressionStatement {
        expression: arena.alloc_expr(expression),
        comment_anchor: None,
    })
}

/// Create a return statement.
pub fn return_stmt(arena: &JsArena, argument: Option<JsExpr>) -> JsStatement {
    JsStatement::Return(JsReturnStatement {
        argument: argument.map(|a| arena.alloc_expr(a)),
    })
}

/// Create a return statement with a value.
pub fn return_value(arena: &JsArena, value: JsExpr) -> JsStatement {
    return_stmt(arena, Some(value))
}

/// Create an if statement.
pub fn if_stmt(
    arena: &JsArena,
    test: JsExpr,
    consequent: JsStatement,
    alternate: Option<JsStatement>,
) -> JsStatement {
    JsStatement::If(JsIfStatement {
        test: arena.alloc_expr(test),
        consequent: arena.alloc_stmt(consequent),
        alternate: alternate.map(|a| arena.alloc_stmt(a)),
    })
}

/// Create a block statement.
pub fn block(body: Vec<JsStatement>) -> JsStatement {
    JsStatement::Block(JsBlockStatement::with_body(body))
}

/// Create a debugger statement.
pub fn debugger() -> JsStatement {
    JsStatement::Debugger
}

// ============================================================================
// Declarations
// ============================================================================

/// Create a const declaration.
pub fn const_decl(arena: &JsArena, name: impl Into<CompactString>, init: JsExpr) -> JsStatement {
    JsStatement::VariableDeclaration(JsVariableDeclaration {
        kind: JsVariableKind::Const,
        declarations: vec![JsVariableDeclarator {
            id: id_pattern(name),
            init: Some(arena.alloc_expr(init)),
            comment_anchor: None,
        }],
    })
}

/// Create a let declaration.
pub fn let_decl(
    arena: &JsArena,
    name: impl Into<CompactString>,
    init: Option<JsExpr>,
) -> JsStatement {
    JsStatement::VariableDeclaration(JsVariableDeclaration {
        kind: JsVariableKind::Let,
        declarations: vec![JsVariableDeclarator {
            id: id_pattern(name),
            init: init.map(|e| arena.alloc_expr(e)),
            comment_anchor: None,
        }],
    })
}

/// Create a var declaration.
#[inline]
pub fn var_decl(
    arena: &JsArena,
    name: impl Into<CompactString>,
    init: Option<JsExpr>,
) -> JsStatement {
    JsStatement::VariableDeclaration(JsVariableDeclaration {
        kind: JsVariableKind::Var,
        declarations: vec![JsVariableDeclarator {
            id: id_pattern(name),
            init: init.map(|e| arena.alloc_expr(e)),
            comment_anchor: None,
        }],
    })
}

/// `var name = init;` whose identifier carries the original-source offset
/// upstream stamps on it (`b.var(b.id(name, element.name_loc), …)`). See
/// [`JsVariableDeclarator::comment_anchor`].
pub fn var_decl_anchored(
    arena: &JsArena,
    name: impl Into<CompactString>,
    init: Option<JsExpr>,
    comment_anchor: Option<u32>,
) -> JsStatement {
    let name = name.into();
    JsStatement::VariableDeclaration(JsVariableDeclaration {
        kind: JsVariableKind::Var,
        declarations: vec![JsVariableDeclarator {
            id: match comment_anchor {
                Some(start) => JsPattern::SpannedIdentifier {
                    end: start.saturating_add(name.len() as u32),
                    name,
                    start,
                },
                None => id_pattern(name),
            },
            init: init.map(|e| arena.alloc_expr(e)),
            comment_anchor,
        }],
    })
}

/// Create a variable declaration with pattern.
pub fn var_decl_pattern(
    arena: &JsArena,
    kind: JsVariableKind,
    pattern: JsPattern,
    init: Option<JsExpr>,
) -> JsStatement {
    JsStatement::VariableDeclaration(JsVariableDeclaration {
        kind,
        declarations: vec![JsVariableDeclarator {
            id: pattern,
            init: init.map(|e| arena.alloc_expr(e)),
            comment_anchor: None,
        }],
    })
}

// ============================================================================
// Imports and Exports
// ============================================================================

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

// ============================================================================
// Svelte Runtime Helpers
// ============================================================================

/// Create a call to a Svelte runtime function ($.xxx).
pub fn svelte_call(arena: &JsArena, method: &str, args: Vec<JsExpr>) -> JsExpr {
    let callee = member(arena, id("$"), method);
    call(arena, callee, args)
}

/// Create $.from_html(html) or $.from_html(html, flags).
pub fn svelte_from_html(
    arena: &JsArena,
    html: impl Into<CompactString>,
    flags: Option<i32>,
) -> JsExpr {
    let mut args = vec![template_string(html)];
    if let Some(f) = flags {
        args.push(number(f as f64));
    }
    svelte_call(arena, "from_html", args)
}

/// Create $.append(anchor, node).
pub fn svelte_append(arena: &JsArena, anchor: JsExpr, node: JsExpr) -> JsExpr {
    svelte_call(arena, "append", vec![anchor, node])
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

#[cfg(test)]
mod await_walker_tests {
    use super::*;

    fn awaited(arena: &JsArena, name: &str) -> JsExpr {
        JsExpr::Await(arena.alloc_expr(id(name)))
    }

    #[test]
    fn detects_await_inside_optional_chain() {
        // `b(await x)` wrapped in a Chain (optional-chaining) node. H-069: the
        // walker previously treated Chain as a leaf and missed the await.
        let arena = JsArena::new();
        let inner_call = call(&arena, id("b"), vec![awaited(&arena, "x")]);
        let chain = JsExpr::Chain(JsChainExpression {
            expression: arena.alloc_expr(inner_call),
        });
        assert!(js_expr_has_await(&arena, &chain));
    }

    #[test]
    fn detects_await_inside_spanned_wrapper() {
        // A Spanned wrapper (source-map carrier) must not hide an inner await.
        let arena = JsArena::new();
        let spanned = JsExpr::Spanned(arena.alloc_expr(awaited(&arena, "x")), 0, 7);
        assert!(js_expr_has_await(&arena, &spanned));
    }

    #[test]
    fn unthunks_a_spanned_call() {
        let arena = JsArena::new();
        let callee = JsExpr::Spanned(arena.alloc_expr(id("get_list")), 0, 8);
        let call_expr = call(&arena, callee, vec![]);
        let spanned_call = JsExpr::Spanned(arena.alloc_expr(call_expr), 0, 10);

        assert!(matches!(thunk(&arena, spanned_call), JsExpr::Spanned(..)));
    }

    #[test]
    fn chain_without_await_is_false() {
        let arena = JsArena::new();
        let inner_call = call(&arena, id("b"), vec![id("x")]);
        let chain = JsExpr::Chain(JsChainExpression {
            expression: arena.alloc_expr(inner_call),
        });
        assert!(!js_expr_has_await(&arena, &chain));
    }
}
