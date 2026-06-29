//! SnippetBlock visitor.
//!
//! Analyzes {#snippet} blocks.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SnippetBlock.js`.

use rustc_hash::FxHashSet;

use super::VisitorContext;
use super::shared::fragment;
use super::shared::snippets::validate_snippet;
use super::shared::utils::validate_block_not_empty;
use crate::ast::js::Expression;
use crate::ast::template::{SnippetBlock, TemplateNode};
use crate::ast::typed_expr::JsNode;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a snippet block.
pub fn visit(block: &mut SnippetBlock, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Mark that we have control flow affecting sibling relationships
    // (snippets can be rendered at any point via @render)
    context.analysis.css.has_control_flow = true;
    context.analysis.css.has_opaque_elements = true;

    // Validate and register the snippet
    validate_snippet(block, context)?;

    // Validate block is not empty (warn if only whitespace)
    // Reference: SnippetBlock.js L14 - validate_block_not_empty(node.body, context)
    if let Some(warning) = validate_block_not_empty(Some(&block.body))? {
        context.emit_warning(warning);
    }

    // Note: snippet_shadowing_prop validation is done in component.rs since the path
    // is not properly maintained during visitor traversal.

    // Increment block depth for child analysis
    context.block_depth += 1;

    // Push fragment owner type for const_tag placement validation
    let snippet_name = super::shared::snippets::get_snippet_name(block).unwrap_or_default();
    context
        .fragment_owner_stack
        .push(super::FragmentOwnerType::SnippetBlock(
            context.scope,
            snippet_name,
        ));

    // Reset parent_element to None for snippet body analysis
    // Snippets create their own rendering context, so text node validation
    // should not check against the parent element of the snippet declaration site.
    // Reference: svelte/packages/svelte/src/compiler/phases/2-analyze/visitors/SnippetBlock.js L26
    let old_parent_element = context.parent_element.take();

    // Switch context.scope to the snippet body's scope for the duration of body
    // analysis. This ensures that render tags inside the snippet body use lexical
    // scope-chain lookup starting at the snippet's own scope, not the outer scope.
    // Without this, {@render y()} inside snippet x would look up `y` from the
    // outer component scope (finding the hoisted `y` binding) instead of the
    // snippet-local `y` — mirroring upstream's `context.next({ ...context.state })`
    // which zimmerframe drives into the snippet body carrying the correct scope.
    let old_scope = context.scope;
    if let Some(&snippet_scope_idx) = context.analysis.root.template_scope_map.get(&block.start) {
        context.scope = snippet_scope_idx;
    }

    // Direct children of the snippet body are direct children of a SnippetBlock,
    // which `validate_slot_attribute` treats specially (a `slot="…"` text attribute
    // there is allowed). Nested elements/blocks reset this flag.
    let was_direct_snippet = context.is_direct_child_of_snippet;
    context.is_direct_child_of_snippet = true;

    // Analyze the body
    fragment::analyze(&mut block.body, context)?;

    context.is_direct_child_of_snippet = was_direct_snippet;

    // Restore parent_element and scope
    context.parent_element = old_parent_element;
    context.scope = old_scope;

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

    // When a snippet can be hoisted, add its binding to the module scope declarations.
    // This allows exported snippets to pass the snippet_invalid_export validation,
    // which checks if the snippet binding exists in analysis.root.scope (module scope).
    // Reference: svelte/packages/svelte/src/compiler/phases/2-analyze/visitors/SnippetBlock.js L36-37
    //   const binding = context.state.scope.get(name);
    //   context.state.analysis.module.scope.declarations.set(name, binding);
    if can_hoist
        && let Some(name) = super::shared::snippets::get_snippet_name(block)
        && let Some(binding_idx) = context.analysis.root.find_binding_any_scope(&name)
    {
        context
            .analysis
            .root
            .scope
            .declarations
            .insert(name.clone(), binding_idx);
        // Track that this snippet was hoisted to module scope.
        // This is used by the snippet_invalid_export validation to distinguish
        // hoisted snippets (which are OK to export) from instance-level ones.
        context.analysis.template.hoisted_snippets.insert(name);
    }

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
    let mut param_names: FxHashSet<String> = snippet
        .parameters
        .iter()
        .flat_map(extract_all_param_names)
        .collect();

    // A snippet may render ITSELF recursively (`{#snippet S}…{@render S(…)}…`).
    // Such a self-reference must not block hoisting — mirrors upstream's
    // `visited` set, which marks the snippet binding and `continue`s. Treat the
    // snippet's own name as a local (hoistable) name.
    if let Some(self_name) = super::shared::snippets::get_snippet_name(snippet) {
        param_names.insert(self_name);
    }

    // Check if the body only references parameters and module-level bindings
    check_hoistable(&snippet.body.nodes, &param_names, context)
        // Also check parameter default values - they may reference instance-level state
        && check_params_hoistable(&snippet.parameters, &param_names, context)
}

// ── Dispatch functions: Expression → JsNode or JSON ──────────────────────────

/// Dispatch to JsNode or JSON version of expression_only_uses_params.
fn expr_only_uses_params(
    expr: &Expression,
    param_names: &FxHashSet<String>,
    context: &VisitorContext,
) -> bool {
    match expr {
        Expression::Typed(te) => expression_only_uses_params_node(&te.node, param_names, context),
        Expression::Lazy { .. } => panic!("Expression::Lazy must be resolved before analysis"),
    }
}

/// Dispatch to JsNode or JSON version of extract_pattern_names.
fn extract_pattern_names_for_expr(expr: &Expression) -> Option<Vec<String>> {
    // Use JSON-based approach for both variants to avoid arena dependency.
    // The Typed path converts to JSON once (cheap for pattern nodes).
    let json = expr.as_json();
    extract_pattern_names(json)
}

/// Dispatch to JsNode or JSON version of check_pattern_defaults_hoistable.
fn check_pattern_defaults_for_expr(
    expr: &Expression,
    param_names: &FxHashSet<String>,
    context: &VisitorContext,
) -> bool {
    match expr {
        Expression::Typed(te) => {
            check_pattern_defaults_hoistable_node(&te.node, param_names, context)
        }
        Expression::Lazy { .. } => panic!("Expression::Lazy must be resolved before analysis"),
    }
}

// ── JsNode-based implementations ─────────────────────────────────────────────

/// Check if an expression (as JsNode) only uses hoistable identifiers.
fn expression_only_uses_params_node(
    node: &JsNode,
    param_names: &FxHashSet<String>,
    context: &VisitorContext,
) -> bool {
    let arena = context.parse_arena;
    match node {
        JsNode::Identifier { name, .. } => {
            is_identifier_hoistable(name.as_str(), param_names, context)
        }

        JsNode::Literal { .. } => true,

        JsNode::CallExpression {
            callee, arguments, ..
        }
        | JsNode::NewExpression {
            callee, arguments, ..
        } => {
            if !expression_only_uses_params_node(arena.get_js_node(*callee), param_names, context) {
                return false;
            }
            for arg in arena.get_js_children(*arguments) {
                if !expression_only_uses_params_node(arg, param_names, context) {
                    return false;
                }
            }
            true
        }

        JsNode::MemberExpression {
            object,
            property,
            computed,
            ..
        } => {
            if !expression_only_uses_params_node(arena.get_js_node(*object), param_names, context) {
                return false;
            }
            if *computed
                && !expression_only_uses_params_node(
                    arena.get_js_node(*property),
                    param_names,
                    context,
                )
            {
                return false;
            }
            true
        }

        JsNode::BinaryExpression { left, right, .. }
        | JsNode::LogicalExpression { left, right, .. } => {
            if !expression_only_uses_params_node(arena.get_js_node(*left), param_names, context) {
                return false;
            }
            if !expression_only_uses_params_node(arena.get_js_node(*right), param_names, context) {
                return false;
            }
            true
        }

        JsNode::ConditionalExpression {
            test,
            consequent,
            alternate,
            ..
        } => {
            expression_only_uses_params_node(arena.get_js_node(*test), param_names, context)
                && expression_only_uses_params_node(
                    arena.get_js_node(*consequent),
                    param_names,
                    context,
                )
                && expression_only_uses_params_node(
                    arena.get_js_node(*alternate),
                    param_names,
                    context,
                )
        }

        JsNode::TemplateLiteral { expressions, .. } => {
            for e in arena.get_js_children(*expressions) {
                if !expression_only_uses_params_node(e, param_names, context) {
                    return false;
                }
            }
            true
        }

        JsNode::ArrayExpression { elements, .. } => {
            for e in elements.iter().flatten() {
                if !expression_only_uses_params_node(e, param_names, context) {
                    return false;
                }
            }
            true
        }

        JsNode::ObjectExpression { properties, .. } => {
            for prop in arena.get_js_children(*properties) {
                match prop {
                    JsNode::Property {
                        key,
                        value,
                        computed,
                        ..
                    } => {
                        if *computed
                            && !expression_only_uses_params_node(
                                arena.get_js_node(*key),
                                param_names,
                                context,
                            )
                        {
                            return false;
                        }
                        if !expression_only_uses_params_node(
                            arena.get_js_node(*value),
                            param_names,
                            context,
                        ) {
                            return false;
                        }
                    }
                    JsNode::SpreadElement { argument, .. }
                        if !expression_only_uses_params_node(
                            arena.get_js_node(*argument),
                            param_names,
                            context,
                        ) =>
                    {
                        return false;
                    }
                    _ => {}
                }
            }
            true
        }

        JsNode::SpreadElement { argument, .. } => {
            expression_only_uses_params_node(arena.get_js_node(*argument), param_names, context)
        }

        JsNode::UnaryExpression { argument, .. } | JsNode::UpdateExpression { argument, .. } => {
            expression_only_uses_params_node(arena.get_js_node(*argument), param_names, context)
        }

        JsNode::AssignmentExpression { left, right, .. } => {
            if !expression_only_uses_params_node(arena.get_js_node(*left), param_names, context) {
                return false;
            }
            if !expression_only_uses_params_node(arena.get_js_node(*right), param_names, context) {
                return false;
            }
            true
        }

        JsNode::SequenceExpression { expressions, .. } => {
            for e in arena.get_js_children(*expressions) {
                if !expression_only_uses_params_node(e, param_names, context) {
                    return false;
                }
            }
            true
        }

        JsNode::ArrowFunctionExpression { .. } | JsNode::FunctionExpression { .. } => true,

        _ => false,
    }
}

/// Extract all names from a pattern (as JsNode).
fn extract_pattern_names_node(
    node: &JsNode,
    arena: &crate::ast::arena::ParseArena,
) -> Option<Vec<String>> {
    match node {
        JsNode::Identifier { name, .. } => Some(vec![name.to_string()]),

        JsNode::ObjectPattern { properties, .. } => {
            let mut names = Vec::new();
            for prop in arena.get_js_children(*properties) {
                match prop {
                    JsNode::Property { value, .. } => {
                        // If value is AssignmentPattern, extract from left
                        let value_node = arena.get_js_node(*value);
                        let actual = match value_node {
                            JsNode::AssignmentPattern { left, .. } => arena.get_js_node(*left),
                            other => other,
                        };
                        if let Some(inner_names) = extract_pattern_names_node(actual, arena) {
                            names.extend(inner_names);
                        }
                    }
                    JsNode::RestElement { argument, .. } => {
                        if let Some(inner_names) =
                            extract_pattern_names_node(arena.get_js_node(*argument), arena)
                        {
                            names.extend(inner_names);
                        }
                    }
                    _ => {}
                }
            }
            Some(names)
        }

        JsNode::ArrayPattern { elements, .. } => {
            let mut names = Vec::new();
            for e in elements.iter().flatten() {
                if let Some(inner_names) = extract_pattern_names_node(e, arena) {
                    names.extend(inner_names);
                }
            }
            Some(names)
        }

        JsNode::AssignmentPattern { left, .. } => {
            extract_pattern_names_node(arena.get_js_node(*left), arena)
        }

        JsNode::RestElement { argument, .. } => {
            extract_pattern_names_node(arena.get_js_node(*argument), arena)
        }

        _ => None,
    }
}

/// Check if default values inside a destructuring pattern (as JsNode) are hoistable.
fn check_pattern_defaults_hoistable_node(
    node: &JsNode,
    param_names: &FxHashSet<String>,
    context: &VisitorContext,
) -> bool {
    let arena = context.parse_arena;
    match node {
        JsNode::ObjectPattern { properties, .. } => {
            for prop in arena.get_js_children(*properties) {
                match prop {
                    JsNode::Property { value, .. }
                        if !check_pattern_defaults_hoistable_node(
                            arena.get_js_node(*value),
                            param_names,
                            context,
                        ) =>
                    {
                        return false;
                    }
                    _ => {}
                }
            }
            true
        }

        JsNode::ArrayPattern { elements, .. } => {
            for elem in elements {
                if let Some(e) = elem
                    && !check_pattern_defaults_hoistable_node(e, param_names, context)
                {
                    return false;
                }
            }
            true
        }

        JsNode::AssignmentPattern { right, .. } => {
            expression_only_uses_params_node(arena.get_js_node(*right), param_names, context)
        }

        _ => true,
    }
}

/// Check if snippet parameter default values are hoistable.
/// Parameters with default values that reference instance-level state prevent hoisting.
fn check_params_hoistable(
    params: &[Expression],
    param_names: &FxHashSet<String>,
    context: &VisitorContext,
) -> bool {
    let arena = context.parse_arena;
    for param in params {
        match param {
            Expression::Typed(te) => match &te.node {
                JsNode::AssignmentPattern { right, .. }
                    if !expression_only_uses_params_node(
                        arena.get_js_node(*right),
                        param_names,
                        context,
                    ) =>
                {
                    return false;
                }
                JsNode::ObjectPattern { .. } | JsNode::ArrayPattern { .. }
                    if !check_pattern_defaults_hoistable_node(&te.node, param_names, context) =>
                {
                    return false;
                }
                _ => {}
            },
            Expression::Lazy { .. } => panic!("Expression::Lazy must be resolved before analysis"),
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
    // `{@const x = …}` declarations create local bindings that are in scope for the
    // whole fragment. A later reference to `x` is therefore local (declared inside
    // the snippet, function_depth >= snippet), NOT an instance-level reference, so
    // it must not block hoisting — mirrors upstream `can_hoist_snippet`'s
    // `binding.scope.function_depth >= scope.function_depth` skip. (Each const's
    // own initializer is still checked individually in the ConstTag arm below.)
    let mut local_params = param_names.clone();
    for node in nodes {
        if let TemplateNode::ConstTag(tag) = node {
            let json = tag.declaration.as_json();
            if let Some(obj) = json.as_object()
                && obj.get("type").and_then(|t| t.as_str()) == Some("VariableDeclaration")
                && let Some(decls) = obj.get("declarations").and_then(|d| d.as_array())
            {
                for d in decls {
                    if let Some(id) = d.get("id")
                        && let Some(names) = extract_pattern_names(id)
                    {
                        for n in names {
                            local_params.insert(n);
                        }
                    }
                }
            }
        }
    }
    let param_names = &local_params;

    for node in nodes {
        match node {
            // Static content - always OK
            TemplateNode::Text(_) | TemplateNode::Comment(_) => {}

            // Expression tags - check if they only reference parameters
            TemplateNode::ExpressionTag(tag)
                if !expr_only_uses_params(&tag.expression, param_names, context) =>
            {
                return false;
            }

            // HtmlTag - check its expression
            TemplateNode::HtmlTag(html_tag)
                if !expr_only_uses_params(&html_tag.expression, param_names, context) =>
            {
                return false;
            }

            // `<svelte:component this={expr} …>` is hoistable when its `this`
            // expression, attributes, and children only reference hoistable names
            // (e.g. `this={item.expanded ? FolderOpen : Folder}` where `item` is a
            // param and the components are imports). Mirrors upstream's reference-based
            // `can_hoist_snippet`, which does not blanket-reject dynamic components.
            TemplateNode::SvelteComponent(comp) => {
                if !expr_only_uses_params(&comp.expression, param_names, context) {
                    return false;
                }
                for attr in &comp.attributes {
                    if !check_attribute_hoistable(attr, param_names, context) {
                        return false;
                    }
                }
                if !check_hoistable(&comp.fragment.nodes, param_names, context) {
                    return false;
                }
            }

            // `<svelte:element>` (runtime tag) and `<svelte:self>` (recursive)
            // conservatively prevent hoisting (not exercised by the in-scope fixtures).
            TemplateNode::SvelteElement(_) | TemplateNode::SvelteSelf(_) => return false,

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
                if !expr_only_uses_params(&if_block.test, param_names, context) {
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
                if !expr_only_uses_params(&each_block.expression, param_names, context) {
                    return false;
                }
                let mut inner_params = param_names.clone();
                if let Some(ref ctx) = each_block.context
                    && let Some(names) = extract_pattern_names_for_expr(ctx)
                {
                    for n in names {
                        inner_params.insert(n);
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
                if !expr_only_uses_params(&await_block.expression, param_names, context) {
                    return false;
                }
                if let Some(ref pending) = await_block.pending
                    && !check_hoistable(&pending.nodes, param_names, context)
                {
                    return false;
                }
                if let Some(ref then_block) = await_block.then {
                    let mut inner_params = param_names.clone();
                    if let Some(ref value) = await_block.value
                        && let Some(name) = extract_pattern_names_for_expr(value)
                    {
                        for n in name {
                            inner_params.insert(n);
                        }
                    }
                    if !check_hoistable(&then_block.nodes, &inner_params, context) {
                        return false;
                    }
                }
                if let Some(ref catch_block) = await_block.catch {
                    let mut inner_params = param_names.clone();
                    if let Some(ref error) = await_block.error
                        && let Some(name) = extract_pattern_names_for_expr(error)
                    {
                        for n in name {
                            inner_params.insert(n);
                        }
                    }
                    if !check_hoistable(&catch_block.nodes, &inner_params, context) {
                        return false;
                    }
                }
            }

            // KeyBlock - check key expression and body
            TemplateNode::KeyBlock(key_block) => {
                if !expr_only_uses_params(&key_block.expression, param_names, context) {
                    return false;
                }
                if !check_hoistable(&key_block.fragment.nodes, param_names, context) {
                    return false;
                }
            }

            // RenderTag - check the expression
            TemplateNode::RenderTag(tag)
                if !expr_only_uses_params(&tag.expression, param_names, context) =>
            {
                return false;
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

            // ConstTag - check every initializer of `{@const x = expr}` (parsed as a
            // VariableDeclaration with one declarator). The pattern names are not
            // added to `param_names` since the const itself shouldn't be
            // hoistable if it depends on instance-level state — mirrors the
            // official compiler's `scope.references` walk: a
            // `{@const _a = await gate('a')}` references `gate`, so the snippet
            // must not be hoisted.
            TemplateNode::ConstTag(tag) => {
                let json = tag.declaration.as_json();
                if let Some(obj) = json.as_object()
                    && obj.get("type").and_then(|t| t.as_str()) == Some("VariableDeclaration")
                    && let Some(decls) = obj.get("declarations").and_then(|d| d.as_array())
                {
                    for d in decls {
                        if let Some(init) = d.get("init")
                            && !init.is_null()
                            && !expression_only_uses_params(init, param_names, context)
                        {
                            return false;
                        }
                    }
                }
            }

            // RenderTag — already handled above when the expression check fails.
            // The non-guarded fall-through here ensures a render tag without
            // instance-level references is treated as safe.

            // <svelte:boundary>, <svelte:fragment>, <svelte:head>, <svelte:body>,
            // <svelte:document>, <svelte:window> — recurse into attributes and
            // body. (<svelte:self>, <svelte:element>, <svelte:component> already
            // bail out above because they have dynamic targets.)
            TemplateNode::SvelteBoundary(elem)
            | TemplateNode::SvelteFragment(elem)
            | TemplateNode::SvelteHead(elem)
            | TemplateNode::SvelteBody(elem)
            | TemplateNode::SvelteDocument(elem)
            | TemplateNode::SvelteWindow(elem) => {
                for attr in &elem.attributes {
                    if !check_attribute_hoistable(attr, param_names, context) {
                        return false;
                    }
                }
                if !check_hoistable(&elem.fragment.nodes, param_names, context) {
                    return false;
                }
            }

            // <title> — recurse into attributes and body
            TemplateNode::TitleElement(elem) => {
                for attr in &elem.attributes {
                    if !check_attribute_hoistable(attr, param_names, context) {
                        return false;
                    }
                }
                if !check_hoistable(&elem.fragment.nodes, param_names, context) {
                    return false;
                }
            }

            // <slot> — recurse into attributes and body
            TemplateNode::SlotElement(elem) => {
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
                        && !expr_only_uses_params(&tag.expression, param_names, context)
                    {
                        return false;
                    }
                }
                true
            }
            crate::ast::template::AttributeValue::Expression(tag) => {
                expr_only_uses_params(&tag.expression, param_names, context)
            }
            _ => true,
        },
        crate::ast::template::Attribute::BindDirective(bind) => {
            expr_only_uses_params(&bind.expression, param_names, context)
        }
        crate::ast::template::Attribute::OnDirective(on) => {
            if let Some(ref expr) = on.expression {
                expr_only_uses_params(expr, param_names, context)
            } else {
                true
            }
        }
        crate::ast::template::Attribute::SpreadAttribute(spread) => {
            expr_only_uses_params(&spread.expression, param_names, context)
        }
        _ => true,
    }
}

/// Extract ALL parameter names from a parameter expression (including destructured names).
fn extract_all_param_names(param: &Expression) -> Vec<String> {
    extract_pattern_names_for_expr(param).unwrap_or_default()
}

/// Extract all names from a pattern (Identifier, ObjectPattern, ArrayPattern) - JSON version.
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

    // A reference to another snippet that itself can be hoisted is fine — the
    // referenced snippet will live at module scope too. Mirrors upstream's
    // recursive `can_hoist_snippet(snippet_scope, …)` for `SnippetBlock` bindings.
    // (`hoisted_snippets` is populated as snippets are analyzed in document order,
    // so this resolves references to already-analyzed earlier snippets.)
    if context.analysis.template.hoisted_snippets.contains(name) {
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
        // Store subscriptions ($store) are instance-level even though they live in
        // scope 0 as synthetic bindings, because the subscription setup is done
        // inside the component function. So they cannot be hoisted.
        if matches!(
            binding.kind,
            crate::compiler::phases::phase2_analyze::scope::BindingKind::StoreSub
        ) {
            return false;
        }
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

/// Check if an expression only uses hoistable identifiers - JSON version.
fn expression_only_uses_params(
    val: &serde_json::Value,
    param_names: &FxHashSet<String>,
    context: &VisitorContext,
) -> bool {
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

            Some("CallExpression") | Some("NewExpression") => {
                if let Some(callee) = obj.get("callee")
                    && !expression_only_uses_params(callee, param_names, context)
                {
                    return false;
                }
                if let Some(args) = obj.get("arguments").and_then(|a| a.as_array()) {
                    for arg in args {
                        if !expression_only_uses_params(arg, param_names, context) {
                            return false;
                        }
                    }
                }
                true
            }

            Some("MemberExpression") => {
                if let Some(object) = obj.get("object")
                    && !expression_only_uses_params(object, param_names, context)
                {
                    return false;
                }
                if obj
                    .get("computed")
                    .and_then(|c| c.as_bool())
                    .unwrap_or(false)
                    && let Some(prop) = obj.get("property")
                    && !expression_only_uses_params(prop, param_names, context)
                {
                    return false;
                }
                true
            }

            Some("BinaryExpression") | Some("LogicalExpression") => {
                if let Some(left) = obj.get("left")
                    && !expression_only_uses_params(left, param_names, context)
                {
                    return false;
                }
                if let Some(right) = obj.get("right")
                    && !expression_only_uses_params(right, param_names, context)
                {
                    return false;
                }
                true
            }

            Some("ConditionalExpression") => {
                for key in &["test", "consequent", "alternate"] {
                    if let Some(e) = obj.get(*key)
                        && !expression_only_uses_params(e, param_names, context)
                    {
                        return false;
                    }
                }
                true
            }

            Some("TemplateLiteral") => {
                if let Some(exprs) = obj.get("expressions").and_then(|e| e.as_array()) {
                    for e in exprs {
                        if !expression_only_uses_params(e, param_names, context) {
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
                            && !expression_only_uses_params(elem, param_names, context)
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
                                && !expression_only_uses_params(key, param_names, context)
                            {
                                return false;
                            }
                            if let Some(value) = prop_obj.get("value")
                                && !expression_only_uses_params(value, param_names, context)
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
                    return expression_only_uses_params(arg, param_names, context);
                }
                true
            }

            Some("UnaryExpression") | Some("UpdateExpression") => {
                if let Some(arg) = obj.get("argument") {
                    return expression_only_uses_params(arg, param_names, context);
                }
                true
            }

            Some("AssignmentExpression") => {
                if let Some(left) = obj.get("left")
                    && !expression_only_uses_params(left, param_names, context)
                {
                    return false;
                }
                if let Some(right) = obj.get("right")
                    && !expression_only_uses_params(right, param_names, context)
                {
                    return false;
                }
                true
            }

            Some("SequenceExpression") => {
                if let Some(exprs) = obj.get("expressions").and_then(|e| e.as_array()) {
                    for e in exprs {
                        if !expression_only_uses_params(e, param_names, context) {
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

/// Check if default values inside a destructuring pattern are hoistable - JSON version.
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
                    && !expression_only_uses_params(right, param_names, context)
                {
                    return false;
                }
            }
            _ => {}
        }
    }
    true
}

/// Alias for visit function.
pub fn visit_snippet_block(
    block: &mut SnippetBlock,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    visit(block, context)
}
