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
    context.analysis.css.has_opaque_elements = true;

    // Validate and register the snippet
    validate_snippet(block, context)?;

    // Note: snippet_shadowing_prop validation is done in component.rs since the path
    // is not properly maintained during visitor traversal.

    // Increment block depth for child analysis
    context.block_depth += 1;

    // Push fragment owner type for const_tag placement validation
    context
        .fragment_owner_stack
        .push(super::FragmentOwnerType::SnippetBlock);

    // Analyze the body
    fragment::analyze(&mut block.body, context)?;

    // Pop fragment owner type
    context.fragment_owner_stack.pop();

    // Decrement block depth
    context.block_depth -= 1;

    // Determine if the snippet can be hoisted to module level.
    // A snippet can be hoisted if:
    // 1. It's at the root level of the template (directly inside root Fragment)
    // 2. It doesn't reference any instance-level state (only uses parameters or globals)
    //
    // Reference: svelte/packages/svelte/src/compiler/phases/2-analyze/visitors/SnippetBlock.js
    // The official compiler checks: context.path.length === 1 && context.path[0].type === 'Fragment'
    // This means the snippet must be directly inside the root fragment, not inside any:
    // - Regular elements (like <div>, <svg>)
    // - Control flow blocks (like {#if}, {#each})
    // - Component elements
    let is_root_level =
        context.element_depth == 0 && context.block_depth == 0 && context.component_depth == 0;

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

            // HtmlTag, dynamic components, and regular components prevent hoisting
            // They may reference instance state directly or in props
            TemplateNode::HtmlTag(_)
            | TemplateNode::Component(_)
            | TemplateNode::SvelteComponent(_)
            | TemplateNode::SvelteElement(_)
            | TemplateNode::SvelteSelf(_) => return false,

            // IfBlock - check test expression and all branches
            TemplateNode::IfBlock(if_block) => {
                // Check the test expression
                if !expression_only_uses_params(&if_block.test, param_names) {
                    return false;
                }
                // Check consequent
                if !check_hoistable(&if_block.consequent.nodes, param_names) {
                    return false;
                }
                // Check alternate (may be else or elseif)
                // IfBlock's alternate contains either a Fragment (else) or another IfBlock (elseif)
                if let Some(ref alt) = if_block.alternate {
                    // Check if the alternate contains an IfBlock (elseif case)
                    if !check_hoistable(&alt.nodes, param_names) {
                        return false;
                    }
                }
            }

            // EachBlock - check iterable expression and body
            TemplateNode::EachBlock(each_block) => {
                // Check the iterable expression
                if !expression_only_uses_params(&each_block.expression, param_names) {
                    return false;
                }
                // The loop variable is a new binding within the each block's scope,
                // so we need to add it to the allowed names for the body
                let mut inner_params = param_names.clone();
                if let Some(ref context) = each_block.context {
                    let Expression::Value(val) = context;
                    if let Some(names) = extract_pattern_names(val) {
                        for n in names {
                            inner_params.insert(n);
                        }
                    }
                }
                // Add index to allowed names if present
                if let Some(ref index) = each_block.index {
                    inner_params.insert(index.to_string());
                }
                // Check body
                if !check_hoistable(&each_block.body.nodes, &inner_params) {
                    return false;
                }
                // Check fallback
                if let Some(ref fallback) = each_block.fallback
                    && !check_hoistable(&fallback.nodes, param_names)
                {
                    return false;
                }
            }

            // AwaitBlock - check promise expression and all branches
            TemplateNode::AwaitBlock(await_block) => {
                // Check the promise expression
                if !expression_only_uses_params(&await_block.expression, param_names) {
                    return false;
                }
                // Check pending
                if let Some(ref pending) = await_block.pending
                    && !check_hoistable(&pending.nodes, param_names)
                {
                    return false;
                }
                // Check then block (value is a new binding)
                if let Some(ref then_block) = await_block.then {
                    let mut inner_params = param_names.clone();
                    if let Some(ref value) = await_block.value {
                        let Expression::Value(val) = value;
                        if let Some(name) = extract_pattern_names(val) {
                            for n in name {
                                inner_params.insert(n);
                            }
                        }
                    }
                    if !check_hoistable(&then_block.nodes, &inner_params) {
                        return false;
                    }
                }
                // Check catch block (error is a new binding)
                if let Some(ref catch_block) = await_block.catch {
                    let mut inner_params = param_names.clone();
                    if let Some(ref error) = await_block.error {
                        let Expression::Value(val) = error;
                        if let Some(name) = extract_pattern_names(val) {
                            for n in name {
                                inner_params.insert(n);
                            }
                        }
                    }
                    if !check_hoistable(&catch_block.nodes, &inner_params) {
                        return false;
                    }
                }
            }

            // KeyBlock - check key expression and body
            TemplateNode::KeyBlock(key_block) => {
                // Check the key expression
                if !expression_only_uses_params(&key_block.expression, param_names) {
                    return false;
                }
                // Check body
                if !check_hoistable(&key_block.fragment.nodes, param_names) {
                    return false;
                }
            }

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
    extract_pattern_names(val).and_then(|names| names.into_iter().next())
}

/// Extract all names from a pattern (Identifier, ObjectPattern, ArrayPattern).
fn extract_pattern_names(val: &serde_json::Value) -> Option<Vec<String>> {
    if let serde_json::Value::Object(obj) = val {
        let expr_type = obj.get("type").and_then(|v| v.as_str())?;

        match expr_type {
            "Identifier" => {
                let name = obj.get("name").and_then(|v| v.as_str())?.to_string();
                Some(vec![name])
            }
            "ObjectPattern" => {
                let mut names = Vec::new();
                if let Some(props) = obj.get("properties").and_then(|p| p.as_array()) {
                    for prop in props {
                        if let Some(prop_obj) = prop.as_object() {
                            if prop_obj.get("type").and_then(|v| v.as_str()) == Some("Property") {
                                if let Some(value) = prop_obj.get("value") {
                                    // Handle AssignmentPattern (default values)
                                    let actual_value = if value.get("type").and_then(|v| v.as_str())
                                        == Some("AssignmentPattern")
                                    {
                                        value.get("left")
                                    } else {
                                        Some(value)
                                    };
                                    if let Some(v) = actual_value
                                        && let Some(inner_names) = extract_pattern_names(v)
                                    {
                                        names.extend(inner_names);
                                    }
                                }
                            } else if prop_obj.get("type").and_then(|v| v.as_str())
                                == Some("RestElement")
                                && let Some(arg) = prop_obj.get("argument")
                                && let Some(inner_names) = extract_pattern_names(arg)
                            {
                                names.extend(inner_names);
                            }
                        }
                    }
                }
                Some(names)
            }
            "ArrayPattern" => {
                let mut names = Vec::new();
                if let Some(elements) = obj.get("elements").and_then(|e| e.as_array()) {
                    for elem in elements {
                        if !elem.is_null()
                            && let Some(inner_names) = extract_pattern_names(elem)
                        {
                            names.extend(inner_names);
                        }
                    }
                }
                Some(names)
            }
            "AssignmentPattern" => {
                // Extract from the left side of the assignment
                if let Some(left) = obj.get("left") {
                    return extract_pattern_names(left);
                }
                None
            }
            "RestElement" => {
                if let Some(arg) = obj.get("argument") {
                    return extract_pattern_names(arg);
                }
                None
            }
            _ => None,
        }
    } else {
        None
    }
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
