//! ExpressionStatement visitor.
//!
//! Analyzes expression statements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/ExpressionStatement.js`.

use super::VisitorContext;
use crate::ast::typed_expr::JsNode;
use crate::compiler::phases::phase2_analyze::{
    AnalysisError, BindingKind, DeclarationKind, warnings,
};
use serde_json::Value;

/// Visit an expression statement (typed JsNode path).
pub fn visit_typed(node: &JsNode, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    if let JsNode::ExpressionStatement { expression, .. } = node {
        let arena = context.parse_arena;
        let expr_node = arena.get_js_node(*expression);

        // Traverse into the child expression first (to handle rune calls like $effect)
        super::script::walk_js_node_typed(expr_node, context)?;

        // For the complex `new Component({ target: ... })` warning detection,
        // fall back to Value-based logic
        let is_new_expr = matches!(expr_node, JsNode::NewExpression { .. });
        if is_new_expr {
            let value = node.to_value();
            if let Some(expr_val) = value.get("expression") {
                check_legacy_component_creation(expr_val, context);
            }
        }
    }

    Ok(())
}

/// Check for legacy `new Component({ target: ... })` pattern and emit warning.
fn check_legacy_component_creation(expression: &Value, context: &mut VisitorContext) {
    if expression.get("type").and_then(|t| t.as_str()) != Some("NewExpression") {
        return;
    }

    let Some(callee) = expression.get("callee") else {
        return;
    };
    if callee.get("type").and_then(|t| t.as_str()) != Some("Identifier") {
        return;
    }
    let Some(args_array) = expression.get("arguments").and_then(|a| a.as_array()) else {
        return;
    };
    if args_array.len() != 1 {
        return;
    }
    let Some(arg) = args_array.first() else {
        return;
    };
    if arg.get("type").and_then(|t| t.as_str()) != Some("ObjectExpression") {
        return;
    }

    let has_target_property = arg
        .get("properties")
        .and_then(|p| p.as_array())
        .map(|props| {
            props.iter().any(|p| {
                p.get("type").and_then(|t| t.as_str()) == Some("Property")
                    && p.get("key")
                        .and_then(|k| k.get("type"))
                        .and_then(|t| t.as_str())
                        == Some("Identifier")
                    && p.get("key")
                        .and_then(|k| k.get("name"))
                        .and_then(|n| n.as_str())
                        == Some("target")
            })
        })
        .unwrap_or(false);

    if !has_target_property {
        return;
    }
    let Some(callee_name) = callee.get("name").and_then(|n| n.as_str()) else {
        return;
    };
    let Some(&binding_idx) = context.analysis.root.all_scopes
        [context.analysis.root.instance_scope_index]
        .declarations
        .get(callee_name)
        .or_else(|| context.analysis.root.scope.declarations.get(callee_name))
    else {
        return;
    };

    let binding = &context.analysis.root.bindings[binding_idx];
    if binding.kind != BindingKind::Normal || binding.declaration_kind != DeclarationKind::Import {
        return;
    }

    if let Some(ref initial_str) = binding.initial
        && let Ok(initial_json) = serde_json::from_str::<Value>(initial_str)
    {
        let is_svelte_import = initial_json
            .get("source")
            .and_then(|s| s.get("value"))
            .and_then(|v| v.as_str())
            .is_some_and(|src| src.ends_with(".svelte"));

        if is_svelte_import {
            let is_default_import = initial_json
                .get("specifiers")
                .and_then(|s| s.as_array())
                .is_some_and(|specs| {
                    specs.iter().any(|spec| {
                        spec.get("type").and_then(|t| t.as_str()) == Some("ImportDefaultSpecifier")
                            && spec
                                .get("local")
                                .and_then(|l| l.get("name"))
                                .and_then(|n| n.as_str())
                                == Some(callee_name)
                    })
                });

            if is_default_import {
                // Route through emit_warning so a `svelte-ignore` in scope can
                // suppress it (H-118).
                context.emit_warning(warnings::legacy_component_creation());
            }
        }
    }
}
