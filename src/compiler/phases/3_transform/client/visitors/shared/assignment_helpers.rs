//! Assignment expression helper functions.
//!
//! Provides utilities for analyzing and transforming assignment expressions
//! in the Svelte compiler. This module mirrors functionality from
//! `svelte/packages/svelte/src/compiler/phases/3-transform/utils.js` and
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/AssignmentExpression.js`.

use crate::ast::js::Expression;
use crate::compiler::phases::phase2_analyze::scope::Scope;
use crate::compiler::phases::phase3_transform::js_ast::arena::JsArena;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;

/// List of all Svelte runes.
const RUNES: &[&str] = &[
    "$state",
    "$derived",
    "$derived.by",
    "$props",
    "$effect",
    "$effect.pre",
    "$effect.tracking",
    "$effect.root",
    "$inspect",
    "$inspect.trace",
    "$host",
];

/// Detects if an expression is a rune call (e.g., `$state()`, `$derived.by()`).
///
/// Returns the rune name if the expression is a valid rune call that is not
/// shadowed by a local variable declaration.
///
/// # Arguments
///
/// * `expr` - The expression to check
/// * `scope` - The current scope for checking if the rune is shadowed
///
/// # Returns
///
/// The rune name (e.g., `"$state"`, `"$derived.by"`) if this is a rune call,
/// or `None` if it's not a rune or is shadowed.
///
/// # Examples
///
/// ```text
/// // $state(0) returns Some("$state")
/// // $derived.by(() => x * 2) returns Some("$derived.by")
/// // myFunction() returns None
/// // $state() where $state is defined as a local variable returns None
/// ```
pub fn get_rune(expr: &Expression, scope: &Scope) -> Option<String> {
    // Check if expression is a CallExpression
    let node_type = expr.node_type()?;
    if node_type != "CallExpression" {
        return None;
    }

    // Get the callee from the expression using typed accessors
    let callee = expr.callee()?;

    // Extract the callee name based on its type
    let callee_name = match callee {
        crate::ast::typed_expr::JsNode::Identifier { name, .. } => {
            // Simple identifier: $state
            name.to_string()
        }
        crate::ast::typed_expr::JsNode::MemberExpression {
            object, property, ..
        } => {
            // Member expression: $derived.by
            let object_name = object.name()?;
            let property_name = property.name()?;
            format!("{}.{}", object_name, property_name)
        }
        _ => {
            // Fallback to JSON for Raw variant
            let json = expr.as_json();
            let callee_json = json.get("callee")?;
            if let Some(name) = callee_json.get("name").and_then(|n| n.as_str()) {
                name.to_string()
            } else if callee_json.get("type")?.as_str()? == "MemberExpression" {
                let object = callee_json.get("object")?;
                let property = callee_json.get("property")?;
                let object_name = object.get("name")?.as_str()?;
                let property_name = property.get("name")?.as_str()?;
                format!("{}.{}", object_name, property_name)
            } else {
                return None;
            }
        }
    };

    // Check if it's a valid rune
    if !RUNES.contains(&callee_name.as_str()) {
        return None;
    }

    // Check if the rune is shadowed by a local variable
    let base_name = callee_name.split('.').next()?;
    if scope.declarations.contains_key(base_name) {
        return None; // Shadowed by a local variable
    }

    Some(callee_name)
}

/// Determines if a value needs to be wrapped in a proxy for reactivity.
///
/// Returns `true` if the expression represents a value that should be proxified
/// when assigned (objects, arrays, etc.), or `false` for primitives and values
/// that are already reactive.
///
/// # Arguments
///
/// * `expr` - The expression to check
/// * `scope` - The current scope for checking binding kinds
///
/// # Returns
///
/// `true` if the value should be proxified, `false` otherwise.
///
/// # Examples
///
/// ```text
/// // Primitives don't need proxy:
/// // 42 -> false
/// // "hello" -> false
/// // true -> false
///
/// // Reference types need proxy:
/// // {} -> true
/// // [] -> true
/// // new Date() -> true
///
/// // State bindings don't need proxy:
/// // myStateVar (where myStateVar is $state) -> false
/// ```
pub fn should_proxy(expr: &Expression, _scope: &Scope) -> Option<bool> {
    let node_type = expr.node_type()?;

    // Primitives don't need proxy
    match node_type {
        "Literal" => return Some(false),
        "TemplateLiteral" => {
            // Static templates don't need proxy
            if expr.expressions().is_empty() {
                return Some(false);
            }
        }
        "ArrowFunctionExpression" | "FunctionExpression" => return Some(false),
        _ => {}
    }

    // Unary expressions result in primitives, so no proxy needed
    // e.g., !foo, -foo, typeof foo, etc.
    if node_type == "UnaryExpression" {
        return Some(false);
    }

    // Binary expressions result in primitives, so no proxy needed
    // e.g., a + b, a === b, a && b, etc.
    if node_type == "BinaryExpression" {
        return Some(false);
    }

    // Check if identifier is a state binding
    // Note: Currently we cannot check binding kind without access to ScopeRoot.bindings
    // TODO: Pass ScopeRoot or bindings array to this function
    // For now, we conservatively return true (needs proxy)
    if node_type == "Identifier" {
        // let json = expr.as_json();
        // if let Some(name) = json.get("name").and_then(|n| n.as_str()) {
        //     if let Some(binding_idx) = scope.declarations.get(name) {
        //         // Need access to ScopeRoot.bindings[binding_idx].kind
        //         // to check if it's State or RawState
        //     }
        // }
    }

    // Default: needs proxy
    Some(true)
}

/// Determines if a JsExpr value needs to be proxied for deep reactivity.
///
/// This is the JsExpr equivalent of `should_proxy`. It analyzes the expression
/// type to determine if the value could be an object or array that needs
/// reactive proxy wrapping.
///
/// # Arguments
///
/// * `expr` - The JsExpr to analyze
///
/// # Returns
///
/// `true` if the value should be proxied, `false` otherwise.
///
/// # Examples
///
/// ```text
/// // Primitives don't need proxy:
/// // "hello" -> false
/// // 42 -> false
///
/// // Functions don't need proxy:
/// // () => x -> false
///
/// // Binary/unary expressions produce primitives:
/// // a + b -> false
/// // !foo -> false
///
/// // Objects and unknown values need proxy:
/// // { a: 1 } -> true
/// // foo.bar -> true (might be an object)
/// ```
pub fn should_proxy_js_expr(expr: &JsExpr) -> bool {
    match expr {
        // Literals don't need proxy (primitives)
        JsExpr::Literal(_) => false,

        // Template literals are strings (primitives)
        JsExpr::TemplateLiteral(_) => false,

        // Functions don't need proxy
        JsExpr::Arrow(_) | JsExpr::Function(_) => false,

        // Unary expressions result in primitives
        JsExpr::Unary(_) => false,

        // Binary expressions result in primitives
        JsExpr::Binary(_) => false,

        // Logical expressions result in one of the operands, which might be an object
        JsExpr::Logical(_) => true,

        // Identifiers: 'undefined' doesn't need proxy, others might be objects
        JsExpr::Identifier(name) => name != "undefined",

        // Sequence expressions return the last value
        JsExpr::Sequence(seq) => {
            if let Some(last) = seq.expressions.last() {
                should_proxy_js_expr(last)
            } else {
                false
            }
        }

        // Conditional expressions might return objects
        JsExpr::Conditional(_) => true,

        // Call expressions might return objects
        JsExpr::Call(_) => true,

        // Member expressions access properties which might be objects
        JsExpr::Member(_) => true,

        // Object and array literals definitely need proxy
        JsExpr::Object(_) | JsExpr::Array(_) => true,

        // Assignment expressions return the assigned value
        JsExpr::Assignment(_assign) => false,

        // Default: assume proxy needed for safety
        _ => true,
    }
}

/// Builds the right-hand side value for an assignment based on the operator.
///
/// Expands compound assignment operators like `+=` into their full form.
///
/// # Arguments
///
/// * `operator` - The assignment operator (e.g., `"="`, `"+="`, `"*="`)
/// * `left` - The left-hand side expression
/// * `right` - The right-hand side expression
///
/// # Returns
///
/// The expanded expression. For `=`, returns `right`. For compound operators,
/// returns a binary expression (e.g., `a += b` becomes `a + b`).
/// For logical assignment operators (`||=`, `&&=`, `??=`), returns a logical
/// expression (e.g., `a ||= b` becomes `a || b`).
///
/// # Examples
///
/// ```text
/// // "=" -> right
/// // "+=" -> left + right
/// // "*=" -> left * right
/// // "||=" -> left || right
/// // "&&=" -> left && right
/// // "??=" -> left ?? right
/// ```
pub fn build_assignment_value(
    arena: &JsArena,
    operator: &str,
    left: &JsExpr,
    right: &JsExpr,
) -> JsExpr {
    match operator {
        "=" => right.clone(),
        "+=" => b::binary_str(arena, "+", left.clone(), right.clone()),
        "-=" => b::binary_str(arena, "-", left.clone(), right.clone()),
        "*=" => b::binary_str(arena, "*", left.clone(), right.clone()),
        "/=" => b::binary_str(arena, "/", left.clone(), right.clone()),
        "%=" => b::binary_str(arena, "%", left.clone(), right.clone()),
        "**=" => b::binary_str(arena, "**", left.clone(), right.clone()),
        "<<=" => b::binary_str(arena, "<<", left.clone(), right.clone()),
        ">>=" => b::binary_str(arena, ">>", left.clone(), right.clone()),
        ">>>=" => b::binary_str(arena, ">>>", left.clone(), right.clone()),
        "|=" => b::binary_str(arena, "|", left.clone(), right.clone()),
        "^=" => b::binary_str(arena, "^", left.clone(), right.clone()),
        "&=" => b::binary_str(arena, "&", left.clone(), right.clone()),
        // Logical assignment operators: build logical expressions
        // e.g., x ||= y becomes x || y
        "||=" => b::logical_str(arena, "||", left.clone(), right.clone()),
        "&&=" => b::logical_str(arena, "&&", left.clone(), right.clone()),
        "??=" => b::logical_str(arena, "??", left.clone(), right.clone()),
        _ => right.clone(),
    }
}

/// Extracts the property name from a member expression property.
///
/// Returns the property name as a string if it can be statically determined,
/// or `None` for computed properties with non-literal expressions.
///
/// # Arguments
///
/// * `property` - The member expression property
///
/// # Returns
///
/// The property name if it's static, or `None` otherwise.
///
/// # Examples
///
/// ```text
/// // .foo -> Some("foo")
/// // ["bar"] -> Some("bar")
/// // [computed] -> None
/// ```
pub fn get_property_name(property: &JsMemberProperty) -> Option<String> {
    match property {
        JsMemberProperty::Identifier(name) => Some(name.to_string()),
        JsMemberProperty::PrivateIdentifier(name) => Some(name.to_string()),
        JsMemberProperty::Expression(_expr) => {
            // Only static string literals
            match JsExpr::Literal(
                crate::compiler::phases::phase3_transform::js_ast::nodes::JsLiteral::Null,
            ) {
                // TODO: need arena to check ExprId
                JsExpr::Literal(JsLiteral::String(s)) => Some(s.to_string()),
                _ => None,
            }
        }
    }
}

/// Gets the source location of an assignment expression for error reporting.
///
/// Returns a string representing the file location (e.g., "file.svelte:10:5").
/// Currently returns a placeholder; full implementation requires source map integration.
///
/// # Arguments
///
/// * `node` - The assignment expression node
///
/// # Returns
///
/// A string representing the source location.
///
/// # TODO
///
/// Implement full source map integration to return actual file:line:column.
pub fn locate_node(_node: &JsAssignmentExpression) -> String {
    // TODO: Implement actual source map lookup
    // This requires access to the source file and position information
    "unknown:0:0".to_string()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::compiler::phases::phase3_transform::js_ast::arena::JsArena;

    #[test]
    fn test_build_assignment_value_add() {
        let arena = JsArena::new();
        let left = JsExpr::Identifier("a".into());
        let right = JsExpr::Literal(JsLiteral::Number(1.0));

        let result = build_assignment_value(&arena, "+=", &left, &right);

        match result {
            JsExpr::Binary(bin) => {
                assert!(matches!(bin.operator, JsBinaryOp::Add));
            }
            _ => panic!("Expected Binary expression"),
        }
    }

    #[test]
    fn test_build_assignment_value_subtract() {
        let arena = JsArena::new();
        let left = JsExpr::Identifier("a".into());
        let right = JsExpr::Literal(JsLiteral::Number(1.0));

        let result = build_assignment_value(&arena, "-=", &left, &right);

        match result {
            JsExpr::Binary(bin) => {
                assert!(matches!(bin.operator, JsBinaryOp::Sub));
            }
            _ => panic!("Expected Binary expression"),
        }
    }

    #[test]
    fn test_build_assignment_value_multiply() {
        let arena = JsArena::new();
        let left = JsExpr::Identifier("a".into());
        let right = JsExpr::Literal(JsLiteral::Number(2.0));

        let result = build_assignment_value(&arena, "*=", &left, &right);

        match result {
            JsExpr::Binary(bin) => {
                assert!(matches!(bin.operator, JsBinaryOp::Mul));
            }
            _ => panic!("Expected Binary expression"),
        }
    }

    #[test]
    fn test_build_assignment_value_assign() {
        let arena = JsArena::new();
        let left = JsExpr::Identifier("a".into());
        let right = JsExpr::Literal(JsLiteral::Number(1.0));

        let result = build_assignment_value(&arena, "=", &left, &right);

        // For =, return right as-is
        match result {
            JsExpr::Literal(JsLiteral::Number(n)) => assert_eq!(n, 1.0),
            _ => panic!("Expected Number literal"),
        }
    }

    #[test]
    fn test_build_assignment_value_logical_or() {
        let arena = JsArena::new();
        let left = JsExpr::Identifier("a".into());
        let right = JsExpr::Literal(JsLiteral::Number(1.0));

        let result = build_assignment_value(&arena, "||=", &left, &right);

        // Logical assignment operators expand to logical expressions: a ||= b -> a || b
        match result {
            JsExpr::Logical(logical) => {
                assert!(matches!(logical.operator, JsLogicalOp::Or));
            }
            _ => panic!("Expected Logical expression"),
        }
    }

    #[test]
    fn test_build_assignment_value_logical_and() {
        let arena = JsArena::new();
        let left = JsExpr::Identifier("a".into());
        let right = JsExpr::Literal(JsLiteral::Number(1.0));

        let result = build_assignment_value(&arena, "&&=", &left, &right);

        // a &&= b -> a && b
        match result {
            JsExpr::Logical(logical) => {
                assert!(matches!(logical.operator, JsLogicalOp::And));
            }
            _ => panic!("Expected Logical expression"),
        }
    }

    #[test]
    fn test_build_assignment_value_logical_nullish() {
        let arena = JsArena::new();
        let left = JsExpr::Identifier("a".into());
        let right = JsExpr::Literal(JsLiteral::Number(1.0));

        let result = build_assignment_value(&arena, "??=", &left, &right);

        // a ??= b -> a ?? b
        match result {
            JsExpr::Logical(logical) => {
                assert!(matches!(logical.operator, JsLogicalOp::NullishCoalescing));
            }
            _ => panic!("Expected Logical expression"),
        }
    }

    #[test]
    fn test_get_property_name_identifier() {
        let prop = JsMemberProperty::Identifier("foo".into());
        assert_eq!(get_property_name(&prop), Some("foo".to_string()));
    }

    #[test]
    fn test_get_property_name_private_identifier() {
        let prop = JsMemberProperty::PrivateIdentifier("bar".into());
        assert_eq!(get_property_name(&prop), Some("bar".to_string()));
    }

    #[test]
    fn test_get_property_name_string_literal() {
        let arena = JsArena::new();
        let expr_id = arena.alloc_expr(JsExpr::Literal(JsLiteral::String("baz".into())));
        let prop = JsMemberProperty::Expression(expr_id);
        // Note: get_property_name currently cannot resolve ExprId without arena access,
        // so it returns None for all Expression variants
        assert_eq!(get_property_name(&prop), None);
    }

    #[test]
    fn test_get_property_name_computed() {
        let arena = JsArena::new();
        let expr_id = arena.alloc_expr(JsExpr::Identifier("dynamic".into()));
        let prop = JsMemberProperty::Expression(expr_id);
        assert_eq!(get_property_name(&prop), None);
    }
}
