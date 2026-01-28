//! SnippetBlock visitor.
//!
//! Analyzes {#snippet} blocks.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SnippetBlock.js`.

use rustc_hash::FxHashSet;

use super::VisitorContext;
use super::shared::fragment;
use super::shared::snippets::validate_snippet;
use crate::ast::js::Expression;
use crate::ast::template::{SnippetBlock, TemplateNode};
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a snippet block.
pub fn visit(block: &mut SnippetBlock, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Mark that we have control flow affecting sibling relationships
    // (snippets can be rendered at any point via @render)
    context.analysis.css.has_control_flow = true;

    // Validate and register the snippet
    validate_snippet(block, context)?;

    // Increment block depth for child analysis
    context.block_depth += 1;

    // Analyze the body
    fragment::analyze(&mut block.body, context)?;

    // Decrement block depth
    context.block_depth -= 1;

    // Determine if the snippet can be hoisted to module level.
    // A snippet can be hoisted if:
    // 1. It's at the root level (block_depth == 0)
    // 2. It doesn't reference any instance-level state (only uses parameters or globals)
    //
    // Reference: svelte/packages/svelte/src/compiler/phases/2-analyze/visitors/SnippetBlock.js
    let is_root_level = context.block_depth == 0;

    // Check if the snippet body only references its own parameters (not instance state)
    let can_hoist = is_root_level && can_hoist_snippet(block);

    block.metadata.can_hoist = can_hoist;

    Ok(())
}

/// Check if a snippet can be hoisted to module level.
///
/// A snippet can be hoisted if it only references:
/// - Its own parameters
/// - Module-level imports
/// - Globals (console, Math, etc.)
///
/// A snippet CANNOT be hoisted if it references any instance-level state.
fn can_hoist_snippet(snippet: &SnippetBlock) -> bool {
    // Collect parameter names from the snippet
    let param_names: FxHashSet<String> = snippet
        .parameters
        .iter()
        .filter_map(extract_param_name)
        .collect();

    // Check if the body only references parameters (not instance state)
    check_hoistable(&snippet.body.nodes, &param_names)
}

/// Check if a list of template nodes can be hoisted.
fn check_hoistable(nodes: &[TemplateNode], param_names: &FxHashSet<String>) -> bool {
    for node in nodes {
        match node {
            // Static content - always OK
            TemplateNode::Text(_) | TemplateNode::Comment(_) => {}

            // Expression tags - check if they only reference parameters
            TemplateNode::ExpressionTag(tag) => {
                if !expression_only_uses_params(&tag.expression, param_names) {
                    return false;
                }
            }

            // These complex blocks prevent hoisting
            TemplateNode::HtmlTag(_)
            | TemplateNode::IfBlock(_)
            | TemplateNode::EachBlock(_)
            | TemplateNode::AwaitBlock(_)
            | TemplateNode::KeyBlock(_)
            | TemplateNode::Component(_)
            | TemplateNode::SvelteComponent(_)
            | TemplateNode::SvelteElement(_)
            | TemplateNode::SvelteSelf(_) => return false,

            // RenderTag - check the expression
            TemplateNode::RenderTag(tag) => {
                if !expression_only_uses_params(&tag.expression, param_names) {
                    return false;
                }
            }

            // Nested snippet - has its own scope, don't check internals
            TemplateNode::SnippetBlock(_) => {}

            // Regular elements - check attributes and children
            TemplateNode::RegularElement(elem) => {
                // Check for dynamic attributes
                for attr in &elem.attributes {
                    match attr {
                        crate::ast::template::Attribute::Attribute(a) => {
                            match &a.value {
                                crate::ast::template::AttributeValue::Sequence(parts) => {
                                    for p in parts {
                                        if let crate::ast::template::AttributeValuePart::ExpressionTag(
                                        tag,
                                    ) = p
                                        && !expression_only_uses_params(&tag.expression, param_names)
                                    {
                                        return false;
                                    }
                                    }
                                }
                                crate::ast::template::AttributeValue::Expression(tag) => {
                                    if !expression_only_uses_params(&tag.expression, param_names) {
                                        return false;
                                    }
                                }
                                _ => {}
                            }
                        }
                        crate::ast::template::Attribute::BindDirective(bind) => {
                            if !expression_only_uses_params(&bind.expression, param_names) {
                                return false;
                            }
                        }
                        crate::ast::template::Attribute::OnDirective(on) => {
                            if let Some(ref expr) = on.expression
                                && !expression_only_uses_params(expr, param_names)
                            {
                                return false;
                            }
                        }
                        _ => {}
                    }
                }
                // Check children
                if !check_hoistable(&elem.fragment.nodes, param_names) {
                    return false;
                }
            }

            // Other nodes - assume safe to hoist
            _ => {}
        }
    }
    true
}

/// Extract parameter name from a parameter expression.
fn extract_param_name(param: &Expression) -> Option<String> {
    let Expression::Value(val) = param;
    if let serde_json::Value::Object(obj) = val
        && obj.get("type").and_then(|v| v.as_str()) == Some("Identifier")
    {
        return obj
            .get("name")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string());
    }
    None
}

/// Check if an expression only uses the given parameter names (and globals).
/// Returns true if the expression can be hoisted.
fn expression_only_uses_params(expr: &Expression, param_names: &FxHashSet<String>) -> bool {
    let Expression::Value(val) = expr;

    if let serde_json::Value::Object(obj) = val {
        let expr_type = obj.get("type").and_then(|v| v.as_str());

        match expr_type {
            // Identifier - must be a parameter or a known safe global
            Some("Identifier") => {
                if let Some(name) = obj.get("name").and_then(|v| v.as_str()) {
                    // Parameters are safe
                    if param_names.contains(name) {
                        return true;
                    }
                    // Some globals are safe
                    if matches!(
                        name,
                        "undefined"
                            | "null"
                            | "NaN"
                            | "Infinity"
                            | "console"
                            | "Math"
                            | "JSON"
                            | "Object"
                            | "Array"
                            | "String"
                            | "Number"
                            | "Boolean"
                    ) {
                        return true;
                    }
                    // Unknown identifiers might be instance state
                    return false;
                }
                true
            }

            // Literals are always safe
            Some("Literal")
            | Some("NumericLiteral")
            | Some("StringLiteral")
            | Some("BooleanLiteral")
            | Some("NullLiteral") => true,

            // Call expressions - check callee and arguments
            Some("CallExpression") => {
                if let Some(callee) = obj.get("callee") {
                    let callee_expr = Expression::Value(callee.clone());
                    if !expression_only_uses_params(&callee_expr, param_names) {
                        return false;
                    }
                }
                if let Some(args) = obj.get("arguments").and_then(|a| a.as_array()) {
                    for arg in args {
                        if !expression_only_uses_params(
                            &Expression::Value(arg.clone()),
                            param_names,
                        ) {
                            return false;
                        }
                    }
                }
                true
            }

            // Member expressions - check object and property
            Some("MemberExpression") => {
                if let Some(object) = obj.get("object")
                    && !expression_only_uses_params(&Expression::Value(object.clone()), param_names)
                {
                    return false;
                }
                // Computed properties need checking too
                if obj
                    .get("computed")
                    .and_then(|c| c.as_bool())
                    .unwrap_or(false)
                    && let Some(prop) = obj.get("property")
                    && !expression_only_uses_params(&Expression::Value(prop.clone()), param_names)
                {
                    return false;
                }
                true
            }

            // Binary/Logical expressions - check both sides
            Some("BinaryExpression") | Some("LogicalExpression") => {
                if let Some(left) = obj.get("left")
                    && !expression_only_uses_params(&Expression::Value(left.clone()), param_names)
                {
                    return false;
                }
                if let Some(right) = obj.get("right")
                    && !expression_only_uses_params(&Expression::Value(right.clone()), param_names)
                {
                    return false;
                }
                true
            }

            // Conditional expressions
            Some("ConditionalExpression") => {
                for key in &["test", "consequent", "alternate"] {
                    if let Some(e) = obj.get(*key)
                        && !expression_only_uses_params(&Expression::Value(e.clone()), param_names)
                    {
                        return false;
                    }
                }
                true
            }

            // Template literal - check expressions
            Some("TemplateLiteral") => {
                if let Some(exprs) = obj.get("expressions").and_then(|e| e.as_array()) {
                    for e in exprs {
                        if !expression_only_uses_params(&Expression::Value(e.clone()), param_names)
                        {
                            return false;
                        }
                    }
                }
                true
            }

            // Array/Object expressions - check elements/properties
            Some("ArrayExpression") => {
                if let Some(elements) = obj.get("elements").and_then(|e| e.as_array()) {
                    for elem in elements {
                        if !elem.is_null()
                            && !expression_only_uses_params(
                                &Expression::Value(elem.clone()),
                                param_names,
                            )
                        {
                            return false;
                        }
                    }
                }
                true
            }

            // Arrow/function expressions are self-contained - always safe
            Some("ArrowFunctionExpression") | Some("FunctionExpression") => true,

            // Unknown expression type - be conservative
            _ => false,
        }
    } else {
        // Not an object - probably a primitive
        true
    }
}

/// Alias for visit function.
pub fn visit_snippet_block(
    block: &mut SnippetBlock,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    visit(block, context)
}
