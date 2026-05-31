//! FunctionDeclaration visitor.
//!
//! Analyzes function declarations.
//!
//! Corresponds to Svelte's `2-analyze/visitors/FunctionDeclaration.js`.

use super::VisitorContext;
use super::shared::utils::validate_identifier_name;
use crate::ast::typed_expr::JsNode;
use crate::compiler::phases::phase2_analyze::AnalysisError;
use serde_json::Value;

/// Visit a function declaration.
///
/// Validates the function identifier name in runes mode and processes the function body.
///
/// # Arguments
///
/// * `node` - The FunctionDeclaration AST node
/// * `context` - The visitor context
pub fn visit(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // In runes mode, validate the function name
    if context.analysis.runes
        && let Some(id) = node.get("id")
        && !id.is_null()
        && let Some(name) = id.get("name").and_then(|n| n.as_str())
    {
        // Look up the binding for this function name
        if let Some(binding_idx) = context.analysis.root.scope.declarations.get(name) {
            let binding = &context.analysis.root.bindings[*binding_idx];
            validate_identifier_name(binding, Some(context.function_depth))?;
        }
    }

    // Increment function depth
    context.function_depth += 1;

    // Look up the scope for this function body from the function_scope_map
    // This enables is_safe_identifier to correctly resolve lexical scoping
    let body_start: Option<u32> = node
        .get("body")
        .and_then(|b| b.get("start"))
        .and_then(|s| s.as_u64())
        .map(|s| s as u32);
    let saved_scope = context.scope;
    if let Some(start) = body_start
        && let Some(&scope_idx) = context.analysis.root.function_scope_map.get(&start)
    {
        context.scope = scope_idx;
    }

    // Visit function body
    let result = if let Some(body) = node.get("body") {
        super::script::walk_js_node(body, context)
    } else {
        Ok(())
    };

    // Decrement function depth and restore scope
    context.function_depth -= 1;
    context.scope = saved_scope;

    result
}

/// Visit a function declaration (typed JsNode path).
pub fn visit_typed(node: &JsNode, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    if let JsNode::FunctionDeclaration { id, body, .. } = node {
        let arena = context.parse_arena;

        // In runes mode, validate the function name
        if context.analysis.runes
            && let Some(id_ref) = id
            && let JsNode::Identifier { name, .. } = arena.get_js_node(*id_ref)
            && let Some(binding_idx) = context.analysis.root.scope.declarations.get(name.as_str())
        {
            let binding = &context.analysis.root.bindings[*binding_idx];
            validate_identifier_name(binding, Some(context.function_depth))?;
        }

        // Increment function depth
        context.function_depth += 1;

        // Look up the scope for this function body from the function_scope_map
        let body_start: Option<u32> = body.and_then(|b| arena.get_js_node(b).start());
        let saved_scope = context.scope;
        if let Some(start) = body_start
            && let Some(&scope_idx) = context.analysis.root.function_scope_map.get(&start)
        {
            context.scope = scope_idx;
        }

        // Visit function body
        let result = if let Some(body_id) = body {
            let body_node = arena.get_js_node(*body_id);
            super::script::walk_js_node_typed(body_node, context)
        } else {
            Ok(())
        };

        // For function bodies containing arrow functions whose body was serialized
        // as JsNode::Raw(Value) during parsing, the Value may have corrupt nested
        // nodes (JsNodeIds resolved incorrectly during to_value()). The walker above
        // may miss NewExpression nodes nested inside arrow function bodies.
        // Scan the source text as a fallback to detect `new ` keyword usage.
        if !context.analysis.needs_context
            && let Some(body_id) = body
        {
            let body_node = arena.get_js_node(*body_id);
            if let (Some(start), Some(end)) = (body_node.start(), body_node.end()) {
                let start = start as usize;
                let end = (end as usize).min(context.analysis.source.len());
                if start < end {
                    let body_src = &context.analysis.source[start..end];
                    // Check for `new ` keyword - indicates NewExpression
                    if body_src.contains("new ") {
                        context.analysis.needs_context = true;
                    }
                }
            }
        }

        // Decrement function depth and restore scope
        context.function_depth -= 1;
        context.scope = saved_scope;

        result
    } else {
        Ok(())
    }
}
