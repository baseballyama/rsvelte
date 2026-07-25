//! Assignment expression helper functions.
//!
//! Provides utilities for analyzing and transforming assignment expressions
//! in the Svelte compiler. This module mirrors functionality from
//! `svelte/packages/svelte/src/compiler/phases/3-transform/utils.js` and
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/AssignmentExpression.js`.

use crate::compiler::phases::phase3_transform::js_ast::arena::JsArena;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;

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
}
