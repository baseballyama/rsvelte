//! JavaScript AST builder functions.
//!
//! These functions provide a convenient API for constructing JavaScript AST nodes,
//! similar to Svelte's `builders.js`.

use super::arena::JsArena;
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
pub fn undefined(arena: &JsArena) -> JsExpr {
    JsExpr::Void(arena.alloc_expr(number(0.0)))
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
    let JsExpr::Call(call) = arena.get_expr(*body_expr_id) else {
        return expr;
    };

    // Don't optimize optional calls: () => func?.() cannot become func
    // because func might be undefined, and calling undefined() would crash
    if call.optional {
        return expr;
    }

    // Callee must be an identifier, or a member expression on the `$` namespace.
    let callee_is_static = match arena.get_expr(call.callee) {
        JsExpr::Identifier(_) => true,
        JsExpr::Member(m) => {
            matches!(arena.get_expr(m.object), JsExpr::Identifier(name) if name == "$")
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

        let JsExpr::Identifier(arg_name) = &call.arguments[i] else {
            return expr;
        };

        if param_name != arg_name {
            return expr;
        }
    }

    // Optimization applies: return just the callee
    arena.get_expr(call.callee).clone()
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
        | JsExpr::Raw(_)
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
pub fn apply_save_wrapping(arena: &JsArena, expr: JsExpr) -> JsExpr {
    // Only process if there are await expressions
    if !has_await_expression_arena(arena, &expr) {
        return expr;
    }
    apply_save_recursive(arena, expr, true)
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
pub fn call(arena: &JsArena, callee: JsExpr, arguments: Vec<JsExpr>) -> JsExpr {
    JsExpr::Call(JsCallExpression {
        callee: arena.alloc_expr(callee),
        arguments,
        optional: false,
    })
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

/// Create an optional call expression.
pub fn optional_call(arena: &JsArena, callee: JsExpr, arguments: Vec<JsExpr>) -> JsExpr {
    JsExpr::Call(JsCallExpression {
        callee: arena.alloc_expr(callee),
        arguments,
        optional: true,
    })
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

/// Create a unary expression.
pub fn unary(arena: &JsArena, op: JsUnaryOp, argument: JsExpr) -> JsExpr {
    JsExpr::Unary(JsUnaryExpression {
        operator: op,
        argument: arena.alloc_expr(argument),
        prefix: true,
    })
}

/// Create a NOT expression.
pub fn not(arena: &JsArena, expr: JsExpr) -> JsExpr {
    unary(arena, JsUnaryOp::Not, expr)
}

/// Create a typeof expression.
pub fn type_of(arena: &JsArena, expr: JsExpr) -> JsExpr {
    unary(arena, JsUnaryOp::TypeOf, expr)
}

/// Create an update expression.
pub fn update(arena: &JsArena, op: JsUpdateOp, argument: JsExpr, prefix: bool) -> JsExpr {
    JsExpr::Update(JsUpdateExpression {
        operator: op,
        argument: arena.alloc_expr(argument),
        prefix,
    })
}

/// Create an increment expression.
pub fn increment(arena: &JsArena, expr: JsExpr, prefix: bool) -> JsExpr {
    update(arena, JsUpdateOp::Increment, expr, prefix)
}

/// Create a decrement expression.
pub fn decrement(arena: &JsArena, expr: JsExpr, prefix: bool) -> JsExpr {
    update(arena, JsUpdateOp::Decrement, expr, prefix)
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

/// Create a for statement.
pub fn for_stmt(
    arena: &JsArena,
    init: Option<JsForInit>,
    test: Option<JsExpr>,
    update: Option<JsExpr>,
    body: JsStatement,
) -> JsStatement {
    JsStatement::For(JsForStatement {
        init,
        test: test.map(|t| arena.alloc_expr(t)),
        update: update.map(|u| arena.alloc_expr(u)),
        body: arena.alloc_stmt(body),
    })
}

/// Create a for-of statement.
pub fn for_of(
    arena: &JsArena,
    left: JsForOfLeft,
    right: JsExpr,
    body: JsStatement,
    is_await: bool,
) -> JsStatement {
    JsStatement::ForOf(JsForOfStatement {
        left,
        right: arena.alloc_expr(right),
        body: arena.alloc_stmt(body),
        is_await,
        is_for_in: false,
    })
}

/// Create a while statement.
pub fn while_stmt(arena: &JsArena, test: JsExpr, body: JsStatement) -> JsStatement {
    JsStatement::While(JsWhileStatement {
        test: arena.alloc_expr(test),
        body: arena.alloc_stmt(body),
    })
}

/// Create a do-while statement.
pub fn do_while(arena: &JsArena, body: JsStatement, test: JsExpr) -> JsStatement {
    JsStatement::DoWhile(JsDoWhileStatement {
        body: arena.alloc_stmt(body),
        test: arena.alloc_expr(test),
    })
}

/// Create a throw statement.
pub fn throw(arena: &JsArena, expr: JsExpr) -> JsStatement {
    JsStatement::Throw(arena.alloc_expr(expr))
}

/// Create a throw error statement.
pub fn throw_error(arena: &JsArena, message: impl Into<CompactString>) -> JsStatement {
    let new_error = new_expr(arena, id("Error"), vec![string(message)]);
    throw(arena, new_error)
}

/// Create a labeled statement.
pub fn labeled(arena: &JsArena, label: impl Into<CompactString>, body: JsStatement) -> JsStatement {
    JsStatement::Labeled(JsLabeledStatement {
        label: label.into(),
        body: arena.alloc_stmt(body),
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
pub fn const_decl(arena: &JsArena, name: impl Into<CompactString>, init: JsExpr) -> JsStatement {
    JsStatement::VariableDeclaration(JsVariableDeclaration {
        kind: JsVariableKind::Const,
        declarations: vec![JsVariableDeclarator {
            id: id_pattern(name),
            init: Some(arena.alloc_expr(init)),
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
        }],
    })
}

/// Create a multi-variable declaration.
pub fn var_decl_multi(
    arena: &JsArena,
    kind: JsVariableKind,
    declarations: Vec<(JsPattern, Option<JsExpr>)>,
) -> JsStatement {
    JsStatement::VariableDeclaration(JsVariableDeclaration {
        kind,
        declarations: declarations
            .into_iter()
            .map(|(id, init)| JsVariableDeclarator {
                id,
                init: init.map(|e| arena.alloc_expr(e)),
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
pub fn export_default(arena: &JsArena, expr: JsExpr) -> JsStatement {
    JsStatement::ExportDefault(JsExportDefault {
        declaration: JsExportDefaultDeclaration::Expression(arena.alloc_expr(expr)),
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
pub fn assignment_pattern(arena: &JsArena, left: JsPattern, right: JsExpr) -> JsPattern {
    JsPattern::Assignment(JsAssignmentPattern {
        left: Box::new(left),
        right: arena.alloc_expr(right),
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
pub fn svelte_call(arena: &JsArena, method: &str, args: Vec<JsExpr>) -> JsExpr {
    let callee = member(arena, id("$"), method);
    call(arena, callee, args)
}

/// Create $.template(html).
pub fn svelte_template(arena: &JsArena, html: impl Into<CompactString>) -> JsExpr {
    svelte_call(arena, "template", vec![template_string(html)])
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

/// Create $.first_child(node).
pub fn svelte_first_child(arena: &JsArena, node: JsExpr) -> JsExpr {
    svelte_call(arena, "first_child", vec![node])
}

/// Create $.sibling(node) or $.sibling(node, count).
pub fn svelte_sibling(arena: &JsArena, node: JsExpr, count: Option<i32>) -> JsExpr {
    let mut args = vec![node];
    if let Some(c) = count {
        args.push(number(c as f64));
    }
    svelte_call(arena, "sibling", args)
}

/// Create $.child(node) or $.child(node, true) for preserving whitespace.
pub fn svelte_child(arena: &JsArena, node: JsExpr, preserve_whitespace: Option<bool>) -> JsExpr {
    let mut args = vec![node];
    if let Some(true) = preserve_whitespace {
        args.push(boolean(true));
    }
    svelte_call(arena, "child", args)
}

/// Create $.text() or $.text(content).
pub fn svelte_text(arena: &JsArena, content: Option<JsExpr>) -> JsExpr {
    let args = content.map(|c| vec![c]).unwrap_or_default();
    svelte_call(arena, "text", args)
}

/// Create $.comment().
pub fn svelte_comment(arena: &JsArena) -> JsExpr {
    svelte_call(arena, "comment", vec![])
}

/// Create $.append(anchor, node).
pub fn svelte_append(arena: &JsArena, anchor: JsExpr, node: JsExpr) -> JsExpr {
    svelte_call(arena, "append", vec![anchor, node])
}

/// Create $.template_effect(fn).
pub fn svelte_template_effect(arena: &JsArena, callback: JsExpr) -> JsExpr {
    svelte_call(arena, "template_effect", vec![callback])
}

/// Create $.template_effect(fn, values).
pub fn svelte_template_effect_with_values(
    arena: &JsArena,
    callback: JsExpr,
    values: JsExpr,
) -> JsExpr {
    svelte_call(arena, "template_effect", vec![callback, values])
}

/// Create $.set_text(node, text).
pub fn svelte_set_text(arena: &JsArena, node: JsExpr, text: JsExpr) -> JsExpr {
    svelte_call(arena, "set_text", vec![node, text])
}

/// Create $.get(source).
pub fn svelte_get(arena: &JsArena, source: JsExpr) -> JsExpr {
    svelte_call(arena, "get", vec![source])
}

/// Create $.set(source, value).
pub fn svelte_set(arena: &JsArena, source: JsExpr, value: JsExpr) -> JsExpr {
    svelte_call(arena, "set", vec![source, value])
}

/// Create $.set(source, value, true).
pub fn svelte_set_sync(arena: &JsArena, source: JsExpr, value: JsExpr) -> JsExpr {
    svelte_call(arena, "set", vec![source, value, true_literal()])
}

/// Create $.event(event_name, element, handler).
pub fn svelte_event(
    arena: &JsArena,
    event_name: impl Into<CompactString>,
    element: JsExpr,
    handler: JsExpr,
) -> JsExpr {
    svelte_call(arena, "event", vec![string(event_name), element, handler])
}

/// Create $.state(value).
pub fn svelte_state(arena: &JsArena, value: JsExpr) -> JsExpr {
    svelte_call(arena, "state", vec![value])
}

/// Create $.proxy(value).
pub fn svelte_proxy(arena: &JsArena, value: JsExpr) -> JsExpr {
    svelte_call(arena, "proxy", vec![value])
}

/// Create $.derived(() => expr).
pub fn svelte_derived(arena: &JsArena, expr: JsExpr) -> JsExpr {
    let thunked = thunk(arena, expr);
    svelte_call(arena, "derived", vec![thunked])
}

/// Create $.effect(fn).
pub fn svelte_effect(arena: &JsArena, callback: JsExpr) -> JsExpr {
    svelte_call(arena, "effect", vec![callback])
}

/// Create $.push(props, runes).
pub fn svelte_push(arena: &JsArena, props: JsExpr, runes: bool) -> JsExpr {
    svelte_call(arena, "push", vec![props, boolean(runes)])
}

/// Create $.pop().
pub fn svelte_pop(arena: &JsArena) -> JsExpr {
    svelte_call(arena, "pop", vec![])
}

/// Create $.each(anchor, flags, () => collection, key_fn, (anchor, item, index) => { ... }).
pub fn svelte_each(
    arena: &JsArena,
    anchor: JsExpr,
    flags: i32,
    collection: JsExpr,
    key_fn: JsExpr,
    callback: JsExpr,
) -> JsExpr {
    let thunked = thunk(arena, collection);
    svelte_call(
        arena,
        "each",
        vec![anchor, number(flags as f64), thunked, key_fn, callback],
    )
}

/// Create $.await(anchor, () => promise, pending_fn, then_fn).
pub fn svelte_await(
    arena: &JsArena,
    anchor: JsExpr,
    promise_getter: JsExpr,
    pending_fn: Option<JsExpr>,
    then_fn: JsExpr,
) -> JsExpr {
    svelte_call(
        arena,
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
    arena: &JsArena,
    anchor: JsExpr,
    condition_getter: JsExpr,
    consequent_fn: JsExpr,
    alternate_fn: Option<JsExpr>,
) -> JsExpr {
    let mut args = vec![anchor, condition_getter, consequent_fn];
    if let Some(alt) = alternate_fn {
        args.push(alt);
    }
    svelte_call(arena, "if", args)
}

/// Create $.element(anchor, tag, is_svg).
pub fn svelte_element(arena: &JsArena, anchor: JsExpr, tag: JsExpr, is_svg: bool) -> JsExpr {
    svelte_call(arena, "element", vec![anchor, tag, boolean(is_svg)])
}

/// Create $.delegate(events).
pub fn svelte_delegate(arena: &JsArena, events: Vec<String>) -> JsExpr {
    svelte_call(
        arena,
        "delegate",
        vec![array(events.into_iter().map(string).collect())],
    )
}

/// Create $.bind_value(element, getter, setter).
pub fn svelte_bind_value(
    arena: &JsArena,
    element: JsExpr,
    getter: JsExpr,
    setter: JsExpr,
) -> JsExpr {
    svelte_call(arena, "bind_value", vec![element, getter, setter])
}

/// Create $.bind_this(element, setter, getter).
pub fn svelte_bind_this(
    arena: &JsArena,
    element: JsExpr,
    setter: JsExpr,
    getter: JsExpr,
) -> JsExpr {
    svelte_call(arena, "bind_this", vec![element, setter, getter])
}

/// Create $.prop(props, name, flags, fallback).
pub fn svelte_prop(
    arena: &JsArena,
    props: JsExpr,
    name: impl Into<CompactString>,
    flags: i32,
    fallback: Option<JsExpr>,
) -> JsExpr {
    let mut args = vec![props, string(name), number(flags as f64)];
    if let Some(fb) = fallback {
        args.push(fb);
    }
    svelte_call(arena, "prop", args)
}

/// Create $.rest_props(props, exclude).
pub fn svelte_rest_props(arena: &JsArena, props: JsExpr, exclude: Vec<CompactString>) -> JsExpr {
    svelte_call(
        arena,
        "rest_props",
        vec![props, array(exclude.into_iter().map(string).collect())],
    )
}

/// Create $.update(source) or $.update(source, delta).
pub fn svelte_update(arena: &JsArena, source: JsExpr, delta: Option<i32>) -> JsExpr {
    let mut args = vec![source];
    if let Some(d) = delta {
        args.push(number(d as f64));
    }
    svelte_call(arena, "update", args)
}

/// Create $.reset(element).
pub fn svelte_reset(arena: &JsArena, element: JsExpr) -> JsExpr {
    svelte_call(arena, "reset", vec![element])
}

/// Create $.next().
pub fn svelte_next(arena: &JsArena, count: Option<i32>) -> JsExpr {
    let args = if let Some(c) = count {
        vec![number(c as f64)]
    } else {
        vec![]
    };
    svelte_call(arena, "next", args)
}

/// Create $.attr(element, name, value).
pub fn svelte_attr(
    arena: &JsArena,
    element: JsExpr,
    name: impl Into<CompactString>,
    value: JsExpr,
) -> JsExpr {
    svelte_call(arena, "attr", vec![element, string(name), value])
}

/// Create $.set_attribute(element, name, value).
pub fn svelte_set_attribute(
    arena: &JsArena,
    element: JsExpr,
    name: impl Into<CompactString>,
    value: JsExpr,
) -> JsExpr {
    svelte_call(arena, "set_attribute", vec![element, string(name), value])
}

/// Create $.remove_input_defaults(element).
pub fn svelte_remove_input_defaults(arena: &JsArena, element: JsExpr) -> JsExpr {
    svelte_call(arena, "remove_input_defaults", vec![element])
}

/// Create $.index (reference to the index key function).
pub fn svelte_index(arena: &JsArena) -> JsExpr {
    member(arena, id("$"), "index")
}

/// Create $.autofocus(element, value).
pub fn svelte_autofocus(arena: &JsArena, element: JsExpr, value: bool) -> JsExpr {
    svelte_call(arena, "autofocus", vec![element, boolean(value)])
}

/// Create $.set_custom_element_data(element, name, value).
pub fn svelte_set_custom_element_data(
    arena: &JsArena,
    element: JsExpr,
    name: impl Into<CompactString>,
    value: JsExpr,
) -> JsExpr {
    svelte_call(
        arena,
        "set_custom_element_data",
        vec![element, string(name), value],
    )
}

/// Create $.html(node, fn).
pub fn svelte_html(arena: &JsArena, node: JsExpr, getter: JsExpr) -> JsExpr {
    svelte_call(arena, "html", vec![node, getter])
}

/// Create $.set_class(element, flags, class_attr, class_binding, class_map, class_directives).
pub fn svelte_set_class(
    arena: &JsArena,
    element: JsExpr,
    flags: JsExpr,
    class_attr: JsExpr,
    class_binding: JsExpr,
    class_map: JsExpr,
    class_directives: JsExpr,
) -> JsExpr {
    svelte_call(
        arena,
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
    arena: &JsArena,
    element: JsExpr,
    style_attr: JsExpr,
    style_binding: JsExpr,
    style_directives: JsExpr,
) -> JsExpr {
    svelte_call(
        arena,
        "set_style",
        vec![element, style_attr, style_binding, style_directives],
    )
}

/// Create $.action(element, callback) or $.action(element, callback, argument_getter).
pub fn svelte_action(
    arena: &JsArena,
    element: JsExpr,
    callback: JsExpr,
    arg_getter: Option<JsExpr>,
) -> JsExpr {
    let mut args = vec![element, callback];
    if let Some(arg) = arg_getter {
        args.push(arg);
    }
    svelte_call(arena, "action", args)
}

/// Transition flag constants.
/// Corresponds to constants in `svelte/packages/svelte/src/constants.js`.
pub const TRANSITION_IN: u32 = 1;
pub const TRANSITION_OUT: u32 = 1 << 1; // 2
pub const TRANSITION_GLOBAL: u32 = 1 << 2; // 4

/// Create $.transition(flags, element, name_thunk) or $.transition(flags, element, name_thunk, expr_thunk).
pub fn svelte_transition(
    arena: &JsArena,
    flags: u32,
    element: JsExpr,
    name_thunk: JsExpr,
    expr_thunk: Option<JsExpr>,
) -> JsExpr {
    let mut args = vec![number(flags as f64), element, name_thunk];
    if let Some(expr) = expr_thunk {
        args.push(expr);
    }
    svelte_call(arena, "transition", args)
}

// ============================================================================
// DOM Manipulation Helpers
// ============================================================================

/// Create element.textContent = value assignment.
pub fn set_text_content(arena: &JsArena, element: JsExpr, value: JsExpr) -> JsExpr {
    let m = member(arena, element, "textContent");
    assign(arena, m, value)
}

/// Create option.value = option.__value = value assignment.
pub fn set_option_value(arena: &JsArena, option: JsExpr, value: JsExpr) -> JsExpr {
    // option.value = option.__value = value
    let inner_member = member(arena, option.clone(), "__value");
    let inner_assign = assign(arena, inner_member, value);
    let outer_member = member(arena, option, "value");
    assign(arena, outer_member, inner_assign)
}

/// Create element.prop = value assignment for a property.
pub fn set_property(
    arena: &JsArena,
    element: JsExpr,
    prop: impl Into<CompactString>,
    value: JsExpr,
) -> JsExpr {
    let m = member(arena, element, prop);
    assign(arena, m, value)
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
    fn chain_without_await_is_false() {
        let arena = JsArena::new();
        let inner_call = call(&arena, id("b"), vec![id("x")]);
        let chain = JsExpr::Chain(JsChainExpression {
            expression: arena.alloc_expr(inner_call),
        });
        assert!(!js_expr_has_await(&arena, &chain));
    }
}
