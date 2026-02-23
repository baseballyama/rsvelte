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

    // Reset parent_element to None for snippet body analysis
    // Snippets create their own rendering context, so text node validation
    // should not check against the parent element of the snippet declaration site.
    // Reference: svelte/packages/svelte/src/compiler/phases/2-analyze/visitors/SnippetBlock.js L26
    let old_parent_element = context.parent_element.take();

    // Analyze the body
    fragment::analyze(&mut block.body, context)?;

    // Restore parent_element
    context.parent_element = old_parent_element;

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
    // We pass the analysis context so we can look up bindings and check their scope level.
    // A binding at scope_index 0 (module scope) is safe for hoisting; instance-level bindings
    // (scope_index >= 1) prevent hoisting.
    let can_hoist = is_root_level && can_hoist_snippet(block, context);

    block.metadata.can_hoist = can_hoist;

    Ok(())
}

/// Check if a snippet can be hoisted to module level.
///
/// A snippet can be hoisted if it only references:
/// - Its own parameters
/// - Module-level bindings (imports, module script declarations) at scope_index 0
/// - Globals (console, Math, etc.)
/// - Other snippets that can also be hoisted
///
/// A snippet CANNOT be hoisted if it references any instance-level state.
///
/// This mirrors the official Svelte compiler's `can_hoist_snippet()` in
/// `2-analyze/visitors/SnippetBlock.js`, which checks scope.references and
/// binding.scope.function_depth to determine hoistability.
fn can_hoist_snippet(snippet: &SnippetBlock, context: &VisitorContext) -> bool {
    // Collect ALL parameter names from the snippet (including destructured names)
    let param_names: FxHashSet<String> = snippet
        .parameters
        .iter()
        .flat_map(extract_all_param_names)
        .collect();

    // Check if the body only references parameters and module-level bindings
    check_hoistable(&snippet.body.nodes, &param_names, context)
        // Also check parameter default values - they may reference instance-level state
        && check_params_hoistable(&snippet.parameters, &param_names, context)
}

/// Check if snippet parameter default values are hoistable.
/// Parameters with default values that reference instance-level state prevent hoisting.
fn check_params_hoistable(
    params: &[Expression],
    param_names: &FxHashSet<String>,
    context: &VisitorContext,
) -> bool {
    for param in params {
        let Expression::Value(val) = param;
        if let Some(obj) = val.as_object() {
            let param_type = obj.get("type").and_then(|v| v.as_str());
            if param_type == Some("AssignmentPattern")
                && let Some(right) = obj.get("right")
                && !expression_only_uses_params(
                    &Expression::Value(right.clone()),
                    param_names,
                    context,
                )
            {
                return false;
            } else if param_type == Some("ObjectPattern") || param_type == Some("ArrayPattern") {
                // Check default values inside destructuring patterns
                if !check_pattern_defaults_hoistable(val, param_names, context) {
                    return false;
                }
            }
        }
    }
    true
}

/// Check if default values inside a destructuring pattern are hoistable.
fn check_pattern_defaults_hoistable(
    val: &serde_json::Value,
    param_names: &FxHashSet<String>,
    context: &VisitorContext,
) -> bool {
    if let Some(obj) = val.as_object() {
        let val_type = obj.get("type").and_then(|v| v.as_str());
        match val_type {
            Some("ObjectPattern") => {
                if let Some(props) = obj.get("properties").and_then(|p| p.as_array()) {
                    for prop in props {
                        if let Some(prop_obj) = prop.as_object()
                            && let Some(value) = prop_obj.get("value")
                            && !check_pattern_defaults_hoistable(value, param_names, context)
                        {
                            return false;
                        }
                    }
                }
            }
            Some("ArrayPattern") => {
                if let Some(elements) = obj.get("elements").and_then(|e| e.as_array()) {
                    for elem in elements {
                        if !elem.is_null()
                            && !check_pattern_defaults_hoistable(elem, param_names, context)
                        {
                            return false;
                        }
                    }
                }
            }
            Some("AssignmentPattern") => {
                if let Some(right) = obj.get("right")
                    && !expression_only_uses_params(
                        &Expression::Value(right.clone()),
                        param_names,
                        context,
                    )
                {
                    return false;
                }
            }
            _ => {}
        }
    }
    true
}

/// Check if a list of template nodes can be hoisted.
fn check_hoistable(
    nodes: &[TemplateNode],
    param_names: &FxHashSet<String>,
    context: &VisitorContext,
) -> bool {
    for node in nodes {
        match node {
            // Static content - always OK
            TemplateNode::Text(_) | TemplateNode::Comment(_) => {}

            // Expression tags - check if they only reference parameters
            TemplateNode::ExpressionTag(tag) => {
                if !expression_only_uses_params(&tag.expression, param_names, context) {
                    return false;
                }
            }

            // HtmlTag - check its expression
            TemplateNode::HtmlTag(html_tag) => {
                if !expression_only_uses_params(&html_tag.expression, param_names, context) {
                    return false;
                }
            }

            // Dynamic components and SvelteSelf prevent hoisting
            TemplateNode::SvelteComponent(_)
            | TemplateNode::SvelteElement(_)
            | TemplateNode::SvelteSelf(_) => return false,

            // Components - check attributes/props for instance-level references
            TemplateNode::Component(comp) => {
                // Check if the component name itself is module-level
                // For member expressions like "object.property", extract the root identifier
                let comp_name = &comp.name;
                let root_name = comp_name.split('.').next().unwrap_or(comp_name);
                if !is_identifier_hoistable(root_name, param_names, context) {
                    return false;
                }
                // Check component attributes for instance-level references
                for attr in &comp.attributes {
                    if !check_attribute_hoistable(attr, param_names, context) {
                        return false;
                    }
                }
                // Check children
                if !check_hoistable(&comp.fragment.nodes, param_names, context) {
                    return false;
                }
            }

            // IfBlock - check test expression and all branches
            TemplateNode::IfBlock(if_block) => {
                if !expression_only_uses_params(&if_block.test, param_names, context) {
                    return false;
                }
                if !check_hoistable(&if_block.consequent.nodes, param_names, context) {
                    return false;
                }
                if let Some(ref alt) = if_block.alternate
                    && !check_hoistable(&alt.nodes, param_names, context)
                {
                    return false;
                }
            }

            // EachBlock - check iterable expression and body
            TemplateNode::EachBlock(each_block) => {
                if !expression_only_uses_params(&each_block.expression, param_names, context) {
                    return false;
                }
                let mut inner_params = param_names.clone();
                if let Some(ref ctx) = each_block.context {
                    let Expression::Value(val) = ctx;
                    if let Some(names) = extract_pattern_names(val) {
                        for n in names {
                            inner_params.insert(n);
                        }
                    }
                }
                if let Some(ref index) = each_block.index {
                    inner_params.insert(index.to_string());
                }
                if !check_hoistable(&each_block.body.nodes, &inner_params, context) {
                    return false;
                }
                if let Some(ref fallback) = each_block.fallback
                    && !check_hoistable(&fallback.nodes, param_names, context)
                {
                    return false;
                }
            }

            // AwaitBlock - check promise expression and all branches
            TemplateNode::AwaitBlock(await_block) => {
                if !expression_only_uses_params(&await_block.expression, param_names, context) {
                    return false;
                }
                if let Some(ref pending) = await_block.pending
                    && !check_hoistable(&pending.nodes, param_names, context)
                {
                    return false;
                }
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
                    if !check_hoistable(&then_block.nodes, &inner_params, context) {
                        return false;
                    }
                }
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
                    if !check_hoistable(&catch_block.nodes, &inner_params, context) {
                        return false;
                    }
                }
            }

            // KeyBlock - check key expression and body
            TemplateNode::KeyBlock(key_block) => {
                if !expression_only_uses_params(&key_block.expression, param_names, context) {
                    return false;
                }
                if !check_hoistable(&key_block.fragment.nodes, param_names, context) {
                    return false;
                }
            }

            // RenderTag - check the expression
            TemplateNode::RenderTag(tag) => {
                if !expression_only_uses_params(&tag.expression, param_names, context) {
                    return false;
                }
            }

            // Nested snippet - has its own scope, don't check internals
            TemplateNode::SnippetBlock(_) => {}

            // Regular elements - check attributes and children
            TemplateNode::RegularElement(elem) => {
                for attr in &elem.attributes {
                    if !check_attribute_hoistable(attr, param_names, context) {
                        return false;
                    }
                }
                if !check_hoistable(&elem.fragment.nodes, param_names, context) {
                    return false;
                }
            }

            // Other nodes - assume safe to hoist
            _ => {}
        }
    }
    true
}

/// Check if an attribute is hoistable.
fn check_attribute_hoistable(
    attr: &crate::ast::template::Attribute,
    param_names: &FxHashSet<String>,
    context: &VisitorContext,
) -> bool {
    match attr {
        crate::ast::template::Attribute::Attribute(a) => match &a.value {
            crate::ast::template::AttributeValue::Sequence(parts) => {
                for p in parts {
                    if let crate::ast::template::AttributeValuePart::ExpressionTag(tag) = p
                        && !expression_only_uses_params(&tag.expression, param_names, context)
                    {
                        return false;
                    }
                }
                true
            }
            crate::ast::template::AttributeValue::Expression(tag) => {
                expression_only_uses_params(&tag.expression, param_names, context)
            }
            _ => true,
        },
        crate::ast::template::Attribute::BindDirective(bind) => {
            expression_only_uses_params(&bind.expression, param_names, context)
        }
        crate::ast::template::Attribute::OnDirective(on) => {
            if let Some(ref expr) = on.expression {
                expression_only_uses_params(expr, param_names, context)
            } else {
                true
            }
        }
        crate::ast::template::Attribute::SpreadAttribute(spread) => {
            expression_only_uses_params(&spread.expression, param_names, context)
        }
        _ => true,
    }
}

/// Extract ALL parameter names from a parameter expression (including destructured names).
fn extract_all_param_names(param: &Expression) -> Vec<String> {
    let Expression::Value(val) = param;
    extract_pattern_names(val).unwrap_or_default()
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

/// Check if an identifier is safe for hoisting.
///
/// An identifier is safe if:
/// 1. It's a snippet parameter
/// 2. It's a well-known global
/// 3. It has a binding at scope_index 0 (module level - imports, module script declarations)
/// 4. It has no binding at all (assumed to be a global)
///
/// An identifier prevents hoisting if it has a binding at scope_index >= 1 (instance level).
fn is_identifier_hoistable(
    name: &str,
    param_names: &FxHashSet<String>,
    context: &VisitorContext,
) -> bool {
    if param_names.contains(name) {
        return true;
    }

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
            | "Map"
            | "Set"
            | "WeakMap"
            | "WeakSet"
            | "Promise"
            | "Error"
            | "TypeError"
            | "RangeError"
            | "Date"
            | "RegExp"
            | "Symbol"
            | "parseInt"
            | "parseFloat"
            | "isNaN"
            | "isFinite"
            | "globalThis"
            | "window"
            | "document"
            | "navigator"
            | "setTimeout"
            | "clearTimeout"
            | "setInterval"
            | "clearInterval"
            | "requestAnimationFrame"
            | "fetch"
            | "URL"
            | "Event"
            | "CustomEvent"
            | "HTMLElement"
            | "Element"
            | "Node"
            | "Proxy"
            | "Reflect"
            | "queueMicrotask"
            | "structuredClone"
    ) {
        return true;
    }

    // Look up the binding in the analysis
    if let Some(binding_idx) = context.analysis.root.find_binding_any_scope(name) {
        let binding = &context.analysis.root.bindings[binding_idx];
        // scope_index 0 = module scope (imports, module script declarations) - safe
        // scope_index >= 1 = instance scope or deeper - prevents hoisting
        // Exception: imports are always safe (they're essentially module-level)
        // This matches the official compiler's check:
        //   if (binding.kind === 'normal' && binding.declaration_kind === 'import') continue;
        if binding.scope_index == 0 {
            return true;
        }
        // Imports at instance scope are still safe for hoisting
        // This matches the official compiler's check:
        //   if (binding.kind === 'normal' && binding.declaration_kind === 'import') continue;
        matches!(
            binding.declaration_kind,
            crate::compiler::phases::phase2_analyze::scope::DeclarationKind::Import
        )
    } else {
        // No binding found - assume it's a global, safe to hoist
        true
    }
}

/// Check if an expression only uses hoistable identifiers.
fn expression_only_uses_params(
    expr: &Expression,
    param_names: &FxHashSet<String>,
    context: &VisitorContext,
) -> bool {
    let Expression::Value(val) = expr;

    if let serde_json::Value::Object(obj) = val {
        let expr_type = obj.get("type").and_then(|v| v.as_str());

        match expr_type {
            Some("Identifier") => {
                if let Some(name) = obj.get("name").and_then(|v| v.as_str()) {
                    return is_identifier_hoistable(name, param_names, context);
                }
                true
            }

            Some("Literal")
            | Some("NumericLiteral")
            | Some("StringLiteral")
            | Some("BooleanLiteral")
            | Some("NullLiteral") => true,

            Some("CallExpression") => {
                if let Some(callee) = obj.get("callee")
                    && !expression_only_uses_params(
                        &Expression::Value(callee.clone()),
                        param_names,
                        context,
                    )
                {
                    return false;
                }
                if let Some(args) = obj.get("arguments").and_then(|a| a.as_array()) {
                    for arg in args {
                        if !expression_only_uses_params(
                            &Expression::Value(arg.clone()),
                            param_names,
                            context,
                        ) {
                            return false;
                        }
                    }
                }
                true
            }

            Some("MemberExpression") => {
                if let Some(object) = obj.get("object")
                    && !expression_only_uses_params(
                        &Expression::Value(object.clone()),
                        param_names,
                        context,
                    )
                {
                    return false;
                }
                if obj
                    .get("computed")
                    .and_then(|c| c.as_bool())
                    .unwrap_or(false)
                    && let Some(prop) = obj.get("property")
                    && !expression_only_uses_params(
                        &Expression::Value(prop.clone()),
                        param_names,
                        context,
                    )
                {
                    return false;
                }
                true
            }

            Some("BinaryExpression") | Some("LogicalExpression") => {
                if let Some(left) = obj.get("left")
                    && !expression_only_uses_params(
                        &Expression::Value(left.clone()),
                        param_names,
                        context,
                    )
                {
                    return false;
                }
                if let Some(right) = obj.get("right")
                    && !expression_only_uses_params(
                        &Expression::Value(right.clone()),
                        param_names,
                        context,
                    )
                {
                    return false;
                }
                true
            }

            Some("ConditionalExpression") => {
                for key in &["test", "consequent", "alternate"] {
                    if let Some(e) = obj.get(*key)
                        && !expression_only_uses_params(
                            &Expression::Value(e.clone()),
                            param_names,
                            context,
                        )
                    {
                        return false;
                    }
                }
                true
            }

            Some("TemplateLiteral") => {
                if let Some(exprs) = obj.get("expressions").and_then(|e| e.as_array()) {
                    for e in exprs {
                        if !expression_only_uses_params(
                            &Expression::Value(e.clone()),
                            param_names,
                            context,
                        ) {
                            return false;
                        }
                    }
                }
                true
            }

            Some("ArrayExpression") => {
                if let Some(elements) = obj.get("elements").and_then(|e| e.as_array()) {
                    for elem in elements {
                        if !elem.is_null()
                            && !expression_only_uses_params(
                                &Expression::Value(elem.clone()),
                                param_names,
                                context,
                            )
                        {
                            return false;
                        }
                    }
                }
                true
            }

            Some("ObjectExpression") => {
                if let Some(props) = obj.get("properties").and_then(|p| p.as_array()) {
                    for prop in props {
                        if let Some(prop_obj) = prop.as_object() {
                            if prop_obj
                                .get("computed")
                                .and_then(|c| c.as_bool())
                                .unwrap_or(false)
                                && let Some(key) = prop_obj.get("key")
                                && !expression_only_uses_params(
                                    &Expression::Value(key.clone()),
                                    param_names,
                                    context,
                                )
                            {
                                return false;
                            }
                            if let Some(value) = prop_obj.get("value")
                                && !expression_only_uses_params(
                                    &Expression::Value(value.clone()),
                                    param_names,
                                    context,
                                )
                            {
                                return false;
                            }
                        }
                    }
                }
                true
            }

            Some("SpreadElement") => {
                if let Some(arg) = obj.get("argument") {
                    return expression_only_uses_params(
                        &Expression::Value(arg.clone()),
                        param_names,
                        context,
                    );
                }
                true
            }

            Some("UnaryExpression") | Some("UpdateExpression") => {
                if let Some(arg) = obj.get("argument") {
                    return expression_only_uses_params(
                        &Expression::Value(arg.clone()),
                        param_names,
                        context,
                    );
                }
                true
            }

            Some("AssignmentExpression") => {
                if let Some(left) = obj.get("left")
                    && !expression_only_uses_params(
                        &Expression::Value(left.clone()),
                        param_names,
                        context,
                    )
                {
                    return false;
                }
                if let Some(right) = obj.get("right")
                    && !expression_only_uses_params(
                        &Expression::Value(right.clone()),
                        param_names,
                        context,
                    )
                {
                    return false;
                }
                true
            }

            Some("SequenceExpression") => {
                if let Some(exprs) = obj.get("expressions").and_then(|e| e.as_array()) {
                    for e in exprs {
                        if !expression_only_uses_params(
                            &Expression::Value(e.clone()),
                            param_names,
                            context,
                        ) {
                            return false;
                        }
                    }
                }
                true
            }

            Some("ArrowFunctionExpression") | Some("FunctionExpression") => true,

            _ => false,
        }
    } else {
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
