//! Fragment visitor for client-side transformation.
//!
//! Corresponds to `Fragment.js` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/Fragment.js`.
//!
#![allow(clippy::collapsible_if)]
//! The Fragment visitor handles the transformation of Fragment nodes into client-side
//! JavaScript code. It creates a template block and processes its children.

use std::rc::Rc;

use crate::ast::template::{Fragment, TemplateNode};
use crate::compiler::phases::phase3_transform::client::transform_template::{
    Namespace, Template, transform_template,
};
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::client::visitors::shared::fragment::process_children;
use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::{
    build_render_statement, build_render_statement_with_memoizer,
};
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;
use crate::compiler::phases::phase3_transform::utils::{clean_nodes, infer_namespace};
use rustc_hash::{FxHashMap, FxHashSet};

// Constants from svelte/src/constants.js
const TEMPLATE_FRAGMENT: u32 = 1;
const TEMPLATE_USE_IMPORT_NODE: u32 = 2;

/// Convert string namespace to Namespace enum
fn parse_namespace(namespace: &str) -> Namespace {
    match namespace {
        "svg" => Namespace::Svg,
        "mathml" => Namespace::Mathml,
        _ => Namespace::Html,
    }
}

/// Visit a Fragment node and generate client-side code.
///
/// Creates a new block which looks roughly like this:
/// ```js
/// // hoisted:
/// const block_name = $.from_html(`...`);
///
/// // for the main block:
/// const id = block_name();
/// // init stuff and possibly render effect
/// $.append($$anchor, id);
/// ```
///
/// Adds the hoisted parts to `context.state.hoisted` and returns the statements of the main block.
///
/// # Arguments
///
/// * `node` - The Fragment node to transform
/// * `context` - The component transformation context
///
/// # Arguments
///
/// * `node` - The Fragment node to transform
/// * `context` - The component transformation context
/// * `is_root_fragment` - Whether this is a root-level fragment (e.g., component body)
///   that may need `$.next()` for text-first content. Nested fragments like IfBlock
///   consequent/alternate should pass `false`.
///
/// # Returns
///
/// Returns a block statement containing the transformed code.
pub fn fragment(
    node: &Fragment,
    context: &mut ComponentContext,
    is_root_fragment: bool,
) -> JsBlockStatement {
    // Get parent node from path or use the fragment itself
    let parent = context.path.last().copied();

    // Infer namespace for children.
    // When inside a <svelte:element> child context, skip inference since the
    // namespace is determined at runtime by $.element(), and we always want "html".
    let namespace = if context.state.metadata.svelte_element_child {
        context.state.metadata.namespace.clone()
    } else {
        infer_namespace(
            &context.state.metadata.namespace,
            parent,
            &node.nodes,
            context.state.analysis,
        )
    };

    // Clean and organize nodes
    let cleaned = clean_nodes(
        parent,
        &node.nodes,
        &context.path,
        &namespace,
        context.state.scope,
        context.state.analysis,
        context.state.preserve_whitespace,
        context.state.options.preserve_comments,
    );

    // Early return if no nodes
    if cleaned.hoisted.is_empty() && cleaned.trimmed.is_empty() {
        return JsBlockStatement { body: Vec::new() };
    }

    // Analyze trimmed nodes
    let is_single_element = cleaned.trimmed.len() == 1
        && matches!(*cleaned.trimmed[0], TemplateNode::RegularElement(_));

    let is_single_child_not_needing_template = cleaned.trimmed.len() == 1
        && matches!(
            *cleaned.trimmed[0],
            TemplateNode::SvelteFragment(_) | TemplateNode::TitleElement(_)
        );

    // Generate unique template name
    // TODO: Use scope.root.unique() when available - for now use memoizer
    // Generate unique template name (will be "root" if no conflicts)
    let template_name = context.state.memoizer.generate_id("root");

    // Initialize result containers
    let mut body: Vec<JsStatement> = Vec::new();
    let mut close: Option<JsStatement> = None;

    // Create new state for this fragment
    // Use Memoizer::with_parent_conflicts to inherit conflicts from the parent,
    // ensuring variable names don't collide between outer and inner scopes (e.g., nested IfBlocks)
    // Pre-allocate vectors with typical capacities to reduce allocations
    let state = ComponentClientTransformState {
        scope: context.state.scope,
        scopes: FxHashMap::default(),
        analysis: context.state.analysis,
        scope_root: context.state.scope_root,
        options: Rc::clone(&context.state.options),
        hoisted: Vec::with_capacity(4),
        template: Template::new(),
        init: Vec::with_capacity(8),
        update: Vec::with_capacity(4),
        after_update: Vec::with_capacity(2),
        consts: Vec::with_capacity(4),
        async_consts: None,
        let_directives: Vec::with_capacity(2),
        node: context.state.node.clone(),
        memoizer: Memoizer::with_parent_conflicts(&context.state.memoizer),
        transform: context.state.transform.clone(),
        events: FxHashSet::default(), // Start empty, merge back later
        metadata: ComponentMetadata {
            namespace: namespace.clone(),
            scoped: context.state.metadata.scoped,
            // Reset svelte_element_child flag for the new state - it was only
            // needed to prevent namespace inference at the immediate child level
            svelte_element_child: false,
        },
        in_constructor: false,
        in_derived: false,
        dev: context.state.options.dev,
        state_fields: FxHashMap::default(), // Not populated in client transform
        is_instance: context.state.is_instance,
        legacy_reactive_imports: Vec::new(), // Not currently used
        preserve_whitespace: context.state.preserve_whitespace,
        instance_level_snippets: Vec::with_capacity(2),
        module_level_snippets: Vec::with_capacity(2),
        snippet_names: context.state.snippet_names.clone(),
        in_direct_assignment_lhs: false,
        is_controlled_each: false,
        snippets: Vec::new(),
        // Root fragment starts at level 0; non-root fragments (e.g., inside {#if}/{#each})
        // start at level 1 so that snippets inside blocks are not hoisted to the root.
        // This matches the official compiler's `context.path.length === 1` check.
        template_nesting_level: if is_root_fragment { 0 } else { 1 },
        each_index_used: context.state.each_index_used.clone(),
        each_index_name: context.state.each_index_name.clone(),
        ancestor_each_index_names: context.state.ancestor_each_index_names.clone(),
        each_item_assign_or_mutate: context.state.each_item_assign_or_mutate.clone(),
        each_item_names: context.state.each_item_names.clone(),
        each_binding_context: context.state.each_binding_context.clone(),
        local_var_init_types: Vec::new(),
        destructure_array_counter: context.state.destructure_array_counter,
        needs_props_from_events: context.state.needs_props_from_events.clone(),
        hidden_let_bindings: context.state.hidden_let_bindings.clone(),
        blocker_map: context.state.blocker_map.clone(),
        extra_blocker_indices: Vec::new(),
        is_standalone: false,
        const_blocker_map: context.state.const_blocker_map.clone(),
    };

    // Swap context.state with our local state so that process_children uses it
    let saved_state = std::mem::replace(&mut context.state, state);

    // Process hoisted nodes
    for hoisted_node in &cleaned.hoisted {
        context.visit_node(hoisted_node.as_ref(), None);
    }

    // Handle different cases based on trimmed nodes
    if is_single_element {
        // Single element case
        if let TemplateNode::RegularElement(element) = &*cleaned.trimmed[0] {
            // Generate a unique identifier for the element
            let id_name = context.state.memoizer.generate_id(&element.name);
            let id = b::id(&id_name);

            // Visit the element with the id as the node
            let saved_node = std::mem::replace(&mut context.state.node, id.clone());
            context.visit_node(cleaned.trimmed[0].as_ref(), None);
            context.state.node = saved_node;

            // Determine flags
            let flags = if context.state.template.needs_import_node {
                Some(TEMPLATE_USE_IMPORT_NODE)
            } else {
                None
            };

            // Transform template
            let template_expr =
                transform_template(&mut context.state, parse_namespace(&namespace), flags, None);
            context
                .state
                .hoisted
                .push(b::var_decl(&template_name, Some(template_expr)));

            // Initialize element
            context.state.init.insert(
                0,
                b::var_decl(&id_name, Some(b::call(b::id(&template_name), vec![]))),
            );

            // Append to anchor
            close = Some(b::stmt(b::call(
                b::member_path("$.append"),
                vec![b::id("$$anchor"), id],
            )));
        }
    } else if is_single_child_not_needing_template {
        // Single child not needing template (SvelteFragment or TitleElement)
        context.visit_node(cleaned.trimmed[0].as_ref(), None);
    } else if cleaned.trimmed.len() == 1 && matches!(*cleaned.trimmed[0], TemplateNode::Text(_)) {
        // Single Text node case
        if let TemplateNode::Text(text) = &*cleaned.trimmed[0] {
            let id_name = context.state.memoizer.generate_id("text");
            let id = b::id(&id_name);

            context.state.init.insert(
                0,
                b::var_decl(
                    &id_name,
                    Some(b::call(
                        b::member_path("$.text"),
                        vec![b::string(text.data.to_string())],
                    )),
                ),
            );

            close = Some(b::stmt(b::call(
                b::member_path("$.append"),
                vec![b::id("$$anchor"), id],
            )));
        }
    } else if !cleaned.trimmed.is_empty() {
        // Multiple nodes case (also handles single non-Text nodes like IfBlock)
        let id_name = context.state.memoizer.generate_id("fragment");
        let id = b::id(&id_name);

        // Check for special case: text and expression tags only
        let use_space_template = cleaned
            .trimmed
            .iter()
            .any(|node| matches!(node.as_ref(), TemplateNode::ExpressionTag(_)))
            && cleaned.trimmed.iter().all(|node| {
                matches!(
                    node.as_ref(),
                    TemplateNode::Text(_) | TemplateNode::ExpressionTag(_)
                )
            });

        if use_space_template {
            // Special case — we can use `$.text` instead of creating a unique template
            let text_id_name = context.state.memoizer.generate_id("text");
            let text_id = b::id(&text_id_name);

            let text_id_clone = text_id.clone();
            process_children(
                &cleaned.trimmed,
                move |_is_text| text_id_clone.clone(),
                false,
                context,
            );

            context.state.init.insert(
                0,
                b::var_decl(
                    &text_id_name,
                    Some(b::call(b::member_path("$.text"), vec![])),
                ),
            );

            close = Some(b::stmt(b::call(
                b::member_path("$.append"),
                vec![b::id("$$anchor"), text_id],
            )));
        } else if cleaned.is_standalone {
            // No need to create a template, we can just use the existing block's anchor.
            // Set is_standalone on state so component/render-tag visitors know
            // they need to emit $.next() after $.async() wrapping.
            context.state.is_standalone = true;
            process_children(
                &cleaned.trimmed,
                |_is_text| b::id("$$anchor"),
                false,
                context,
            );
        } else {
            // Standard case with template
            let id_for_closure = id.clone();
            process_children(
                &cleaned.trimmed,
                move |is_text: bool| {
                    if is_text {
                        b::call(
                            b::member_path("$.first_child"),
                            vec![id_for_closure.clone(), b::literal(JsLiteral::Boolean(true))],
                        )
                    } else {
                        b::call(
                            b::member_path("$.first_child"),
                            vec![id_for_closure.clone()],
                        )
                    }
                },
                false,
                context,
            );

            let mut flags = TEMPLATE_FRAGMENT;
            if context.state.template.needs_import_node {
                flags |= TEMPLATE_USE_IMPORT_NODE;
            }

            // Check for special case: single comment
            // If the template has only one node and it's a comment, we can use $.comment()
            // instead of creating a unique template
            use crate::compiler::phases::phase3_transform::client::transform_template::types::Node;

            if context.state.template.nodes.len() == 1
                && matches!(context.state.template.nodes.first(), Some(Node::Comment(_)))
            {
                // Special case — we can use `$.comment` instead of creating a unique template
                context.state.init.insert(
                    0,
                    b::var_decl(&id_name, Some(b::call(b::member_path("$.comment"), vec![]))),
                );
            } else {
                // Standard template case
                let template_expr = transform_template(
                    &mut context.state,
                    parse_namespace(&namespace),
                    Some(flags),
                    None,
                );
                context
                    .state
                    .hoisted
                    .push(b::var_decl(&template_name, Some(template_expr)));
                context.state.init.insert(
                    0,
                    b::var_decl(&id_name, Some(b::call(b::id(&template_name), vec![]))),
                );
            }

            close = Some(b::stmt(b::call(
                b::member_path("$.append"),
                vec![b::id("$$anchor"), id],
            )));
        }
    }

    // Swap the state back and get the modified state
    let state = std::mem::replace(&mut context.state, saved_state);

    // Build the final body
    // Add snippets, let_directives, and consts (matches official Fragment.js line 154)
    body.extend(state.snippets);
    body.extend(
        state
            .let_directives
            .into_iter()
            .map(JsStatement::Expression),
    );
    body.extend(state.consts);

    // Handle async_consts
    if let Some(async_consts) = state.async_consts
        && !async_consts.thunks.is_empty()
    {
        // Use the id from async_consts (generated via scope.generate('promises'))
        // This matches the official: b.var(state.async_consts.id, b.call('$.run', ...))
        let id_name = match &async_consts.id {
            JsExpr::Identifier(name) => name.clone(),
            _ => "promises".to_string(),
        };
        body.push(b::var_decl(
            &id_name,
            Some(b::call(
                b::member_path("$.run"),
                vec![b::array(async_consts.thunks)],
            )),
        ));
    }

    // Skip over inserted comment if text_first (only for root fragments)
    // Nested fragments like IfBlock consequent/alternate don't need $.next()
    // because they handle their own templates independently.
    if is_root_fragment && cleaned.is_text_first {
        body.push(b::stmt(b::call(b::member_path("$.next"), vec![])));
    }

    body.extend(state.init);

    // Add render effect if there are updates
    if !state.update.is_empty() {
        // Compute blockers for the template_effect by scanning update statements
        // for identifiers that reference blocked variables.
        //
        // We collect all identifiers from the update statements and check them
        // against the blocker_map. The blocker_map maps variable names to their
        // promise indices from the instance script's async body transformation.
        //
        // Note: this can have false positives when snippet parameters share names
        // with blocked variables, but in practice this is rare and the extra
        // blocker doesn't cause correctness issues (just a minor performance cost).
        let blockers = {
            let map = state.blocker_map.borrow();
            let const_map = state.const_blocker_map.borrow();
            if map.is_empty() && state.extra_blocker_indices.is_empty() && const_map.is_empty() {
                None
            } else {
                let mut all_names = Vec::new();
                for stmt in &state.update {
                    collect_identifiers_from_statement(stmt, &mut all_names);
                }
                // Also scan memoized expressions for blocked identifiers.
                // Memoized values like `[() => checkedFactory()()]` are not in
                // state.update but still reference blocked variables.
                for memo_expr in state.memoizer.all_expressions() {
                    collect_ids_from_expr(&memo_expr, &mut all_names);
                }

                // Collect instance-level blocker indices from blocker_map
                let mut indices: Vec<usize> = Vec::new();
                for name in &all_names {
                    if let Some(&idx) = map.get(name.as_str())
                        && !indices.contains(&idx)
                    {
                        indices.push(idx);
                    }
                }
                // Include extra blocker indices from expressions that were evaluated
                // to literals at compile time but still reference blocker_map variables.
                for &idx in &state.extra_blocker_indices {
                    if !indices.contains(&idx) {
                        indices.push(idx);
                    }
                }
                indices.sort();

                // Collect const-tag-level blocker expressions from const_blocker_map
                let mut const_blocker_exprs: Vec<JsExpr> = Vec::new();
                for name in &all_names {
                    if let Some(blocker_expr) = const_map.get(name.as_str()) {
                        if !const_blocker_exprs
                            .iter()
                            .any(|b| format!("{:?}", b) == format!("{:?}", blocker_expr))
                        {
                            const_blocker_exprs.push(blocker_expr.clone());
                        }
                    }
                }

                // Combine instance-level and const-tag-level blockers
                let mut all_blocker_exprs: Vec<JsExpr> = indices
                    .into_iter()
                    .map(|idx| b::member_computed(b::id("$$promises"), b::number(idx as f64)))
                    .collect();
                all_blocker_exprs.extend(const_blocker_exprs);

                if all_blocker_exprs.is_empty() {
                    None
                } else {
                    Some(b::array(all_blocker_exprs))
                }
            }
        };

        // Check if we have memoized expressions
        if state.memoizer.has_memoized() {
            let params = state.memoizer.get_params();
            let sync_values = state.memoizer.sync_values();
            let async_values = state.memoizer.async_values();
            body.push(b::stmt(build_render_statement_with_memoizer(
                state.update,
                params,
                sync_values,
                async_values,
                blockers,
            )));
        } else if blockers.is_some() {
            body.push(b::stmt(build_render_statement_with_memoizer(
                state.update,
                vec![],
                None,
                None,
                blockers,
            )));
        } else {
            body.push(b::stmt(build_render_statement(state.update)));
        }
    }

    body.extend(state.after_update);

    // Add close statement (must be last)
    if let Some(close_stmt) = close {
        body.push(close_stmt);
    }

    // Update context state with hoisted statements
    context.state.hoisted.extend(state.hoisted);

    // Merge snippet declarations
    context
        .state
        .module_level_snippets
        .extend(state.module_level_snippets);
    context
        .state
        .instance_level_snippets
        .extend(state.instance_level_snippets);

    // Merge events back to parent for delegation
    context.state.events.extend(state.events);

    // Merge memoizer conflicts back to parent so sibling scopes also avoid collisions
    context.state.memoizer.merge_conflicts(&state.memoizer);

    JsBlockStatement { body }
}

/// Collect all identifier names from a JS statement.
/// Used for finding blocked variable references in template_effect callbacks.
pub fn collect_identifiers_from_statement(stmt: &JsStatement, names: &mut Vec<String>) {
    match stmt {
        JsStatement::Expression(expr_stmt) => {
            collect_ids_from_expr(&expr_stmt.expression, names);
        }
        JsStatement::Block(block_stmt) => {
            for s in &block_stmt.body {
                collect_identifiers_from_statement(s, names);
            }
        }
        JsStatement::VariableDeclaration(decl) => {
            for declarator in &decl.declarations {
                if let Some(init) = &declarator.init {
                    collect_ids_from_expr(init, names);
                }
            }
        }
        JsStatement::Return(ret) => {
            if let Some(expr) = &ret.argument {
                collect_ids_from_expr(expr, names);
            }
        }
        JsStatement::If(if_stmt) => {
            collect_ids_from_expr(&if_stmt.test, names);
            collect_identifiers_from_statement(&if_stmt.consequent, names);
            if let Some(alt) = &if_stmt.alternate {
                collect_identifiers_from_statement(alt, names);
            }
        }
        JsStatement::Raw(raw) => {
            // For raw statements, extract identifiers from the raw text
            // This is a best-effort approach - we look for identifiers that
            // might be blocked variables
            for word in raw.split(|c: char| !c.is_alphanumeric() && c != '_' && c != '$') {
                if !word.is_empty()
                    && word
                        .chars()
                        .next()
                        .is_some_and(|c| c.is_alphabetic() || c == '_' || c == '$')
                    && !names.contains(&word.to_string())
                {
                    names.push(word.to_string());
                }
            }
        }
        _ => {}
    }
}

/// Collect identifiers from an expression (non-recursive across function boundaries).
fn collect_ids_from_expr(expr: &JsExpr, names: &mut Vec<String>) {
    match expr {
        JsExpr::Identifier(name) => {
            if !names.contains(name) {
                names.push(name.clone());
            }
        }
        JsExpr::Call(call) => {
            collect_ids_from_expr(&call.callee, names);
            for arg in &call.arguments {
                collect_ids_from_expr(arg, names);
            }
        }
        JsExpr::Member(member) => {
            collect_ids_from_expr(&member.object, names);
            match &member.property {
                JsMemberProperty::Expression(prop) => {
                    if member.computed {
                        collect_ids_from_expr(prop, names);
                    }
                }
                JsMemberProperty::Identifier(id) => {
                    // Only collect non-computed property names for $$props access
                    // (e.g., $$props.name -> "name") since those are actual variable references.
                    // Don't collect general property accesses like `obj.length` as they
                    // are not variable references and would cause false blocker matches.
                    if let JsExpr::Identifier(obj_name) = &*member.object {
                        if obj_name == "$$props" && !names.contains(id) {
                            names.push(id.clone());
                        }
                    }
                }
                JsMemberProperty::PrivateIdentifier(_) => {}
            }
        }
        JsExpr::Binary(bin) => {
            collect_ids_from_expr(&bin.left, names);
            collect_ids_from_expr(&bin.right, names);
        }
        JsExpr::Logical(log) => {
            collect_ids_from_expr(&log.left, names);
            collect_ids_from_expr(&log.right, names);
        }
        JsExpr::Unary(un) => {
            collect_ids_from_expr(&un.argument, names);
        }
        JsExpr::Conditional(cond) => {
            collect_ids_from_expr(&cond.test, names);
            collect_ids_from_expr(&cond.consequent, names);
            collect_ids_from_expr(&cond.alternate, names);
        }
        JsExpr::TemplateLiteral(tl) => {
            for e in &tl.expressions {
                collect_ids_from_expr(e, names);
            }
        }
        JsExpr::Sequence(seq) => {
            for e in &seq.expressions {
                collect_ids_from_expr(e, names);
            }
        }
        JsExpr::Array(arr) => {
            for e in arr.elements.iter().flatten() {
                collect_ids_from_expr(e, names);
            }
        }
        JsExpr::Object(obj) => {
            for member in &obj.properties {
                match member {
                    JsObjectMember::Property(prop) => {
                        collect_ids_from_expr(&prop.value, names);
                    }
                    JsObjectMember::SpreadElement(spread) => {
                        collect_ids_from_expr(spread, names);
                    }
                }
            }
        }
        JsExpr::Assignment(assign) => {
            collect_ids_from_expr(&assign.right, names);
        }
        JsExpr::Update(up) => {
            collect_ids_from_expr(&up.argument, names);
        }
        JsExpr::Await(inner) => {
            collect_ids_from_expr(inner, names);
        }
        JsExpr::Spread(inner) | JsExpr::Void(inner) => {
            collect_ids_from_expr(inner, names);
        }
        // Don't cross function boundaries
        JsExpr::Arrow(_) | JsExpr::Function(_) => {}
        _ => {}
    }
}

/// Collect identifiers from a statement for component prop blocker detection.
///
/// This version enters getter/setter bodies (which are part of component props)
/// but does NOT enter arrow functions (which are children callbacks).
/// This matches the official Svelte compiler's memoizer.blockers() behavior,
/// which only tracks blockers from direct prop expressions.
pub fn collect_identifiers_from_statement_props(stmt: &JsStatement, names: &mut Vec<String>) {
    match stmt {
        JsStatement::Expression(expr_stmt) => {
            collect_ids_from_expr_props(&expr_stmt.expression, names);
        }
        JsStatement::Block(block_stmt) => {
            for s in &block_stmt.body {
                collect_identifiers_from_statement_props(s, names);
            }
        }
        JsStatement::VariableDeclaration(decl) => {
            for declarator in &decl.declarations {
                if let Some(init) = &declarator.init {
                    collect_ids_from_expr_props(init, names);
                }
            }
        }
        JsStatement::Return(ret) => {
            if let Some(expr) = &ret.argument {
                collect_ids_from_expr_props(expr, names);
            }
        }
        JsStatement::If(if_stmt) => {
            collect_ids_from_expr_props(&if_stmt.test, names);
            collect_identifiers_from_statement_props(&if_stmt.consequent, names);
            if let Some(alt) = &if_stmt.alternate {
                collect_identifiers_from_statement_props(alt, names);
            }
        }
        JsStatement::Raw(raw) => {
            for word in raw.split(|c: char| !c.is_alphanumeric() && c != '_' && c != '$') {
                if !word.is_empty()
                    && word
                        .chars()
                        .next()
                        .is_some_and(|c| c.is_alphabetic() || c == '_' || c == '$')
                    && !names.contains(&word.to_string())
                {
                    names.push(word.to_string());
                }
            }
        }
        _ => {}
    }
}

/// Collect identifiers from an expression for component prop blocker detection.
/// Enters getter/setter function bodies and arrow function bodies generally,
/// but skips arrow functions that are the value of `children` or `$$slots` properties.
/// This mirrors the official Svelte compiler's memoizer which tracks blockers from
/// direct prop expressions but not from children callbacks.
fn collect_ids_from_expr_props(expr: &JsExpr, names: &mut Vec<String>) {
    match expr {
        JsExpr::Identifier(name) => {
            if !names.contains(name) {
                names.push(name.clone());
            }
        }
        JsExpr::Call(call) => {
            collect_ids_from_expr_props(&call.callee, names);
            for arg in &call.arguments {
                collect_ids_from_expr_props(arg, names);
            }
        }
        JsExpr::Member(member) => {
            collect_ids_from_expr_props(&member.object, names);
            match &member.property {
                JsMemberProperty::Expression(prop) => {
                    if member.computed {
                        collect_ids_from_expr_props(prop, names);
                    }
                }
                JsMemberProperty::Identifier(id) => {
                    if !names.contains(id) {
                        names.push(id.clone());
                    }
                }
                JsMemberProperty::PrivateIdentifier(_) => {}
            }
        }
        JsExpr::Binary(bin) => {
            collect_ids_from_expr_props(&bin.left, names);
            collect_ids_from_expr_props(&bin.right, names);
        }
        JsExpr::Logical(log) => {
            collect_ids_from_expr_props(&log.left, names);
            collect_ids_from_expr_props(&log.right, names);
        }
        JsExpr::Unary(un) => {
            collect_ids_from_expr_props(&un.argument, names);
        }
        JsExpr::Conditional(cond) => {
            collect_ids_from_expr_props(&cond.test, names);
            collect_ids_from_expr_props(&cond.consequent, names);
            collect_ids_from_expr_props(&cond.alternate, names);
        }
        JsExpr::TemplateLiteral(tl) => {
            for e in &tl.expressions {
                collect_ids_from_expr_props(e, names);
            }
        }
        JsExpr::Sequence(seq) => {
            for e in &seq.expressions {
                collect_ids_from_expr_props(e, names);
            }
        }
        JsExpr::Array(arr) => {
            for e in arr.elements.iter().flatten() {
                collect_ids_from_expr_props(e, names);
            }
        }
        JsExpr::Object(obj) => {
            for member in &obj.properties {
                match member {
                    JsObjectMember::Property(prop) => {
                        // Check if this property is named "children" or "$$slots" -
                        // skip their arrow/function values as children handle their own async
                        let prop_name = match &prop.key {
                            JsPropertyKey::Identifier(name) => Some(name.as_str()),
                            JsPropertyKey::Literal(JsLiteral::String(name)) => Some(name.as_str()),
                            _ => None,
                        };
                        let is_children_prop = matches!(prop_name, Some("children" | "$$slots"));

                        if is_children_prop {
                            // Skip children/$$slots callback values entirely
                        } else if matches!(prop.kind, JsPropertyKind::Get | JsPropertyKind::Set) {
                            // For getters/setters, enter the function body to find references
                            if let JsExpr::Function(func) = &*prop.value {
                                for stmt in &func.body.body {
                                    collect_identifiers_from_statement_props(stmt, names);
                                }
                            }
                        } else {
                            // For regular properties, recurse (entering arrow bodies)
                            collect_ids_from_expr_props(&prop.value, names);
                        }
                    }
                    JsObjectMember::SpreadElement(spread) => {
                        collect_ids_from_expr_props(spread, names);
                    }
                }
            }
        }
        JsExpr::Assignment(assign) => {
            collect_ids_from_expr_props(&assign.right, names);
        }
        JsExpr::Update(up) => {
            collect_ids_from_expr_props(&up.argument, names);
        }
        JsExpr::Await(inner) => {
            collect_ids_from_expr_props(inner, names);
        }
        JsExpr::Spread(inner) | JsExpr::Void(inner) => {
            collect_ids_from_expr_props(inner, names);
        }
        // Enter arrow and function bodies (unlike the shallow version)
        JsExpr::Arrow(arrow) => match &arrow.body {
            JsArrowBody::Expression(body_expr) => {
                collect_ids_from_expr_props(body_expr, names);
            }
            JsArrowBody::Block(block) => {
                for s in &block.body {
                    collect_identifiers_from_statement_props(s, names);
                }
            }
        },
        JsExpr::Function(func) => {
            for s in &func.body.body {
                collect_identifiers_from_statement_props(s, names);
            }
        }
        _ => {}
    }
}

/// Collect identifiers from a statement, traversing INTO arrow and function bodies.
///
/// Unlike `collect_identifiers_from_statement` which stops at function boundaries,
/// this version crosses into arrow/function bodies. This is needed for component
/// async wrapping where blocked variables appear inside patterns like `() => $.get(X)`.
pub fn collect_identifiers_from_statement_deep(stmt: &JsStatement, names: &mut Vec<String>) {
    match stmt {
        JsStatement::Expression(expr_stmt) => {
            collect_ids_from_expr_deep(&expr_stmt.expression, names);
        }
        JsStatement::Block(block_stmt) => {
            for s in &block_stmt.body {
                collect_identifiers_from_statement_deep(s, names);
            }
        }
        JsStatement::VariableDeclaration(decl) => {
            for declarator in &decl.declarations {
                if let Some(init) = &declarator.init {
                    collect_ids_from_expr_deep(init, names);
                }
            }
        }
        JsStatement::Return(ret) => {
            if let Some(expr) = &ret.argument {
                collect_ids_from_expr_deep(expr, names);
            }
        }
        JsStatement::If(if_stmt) => {
            collect_ids_from_expr_deep(&if_stmt.test, names);
            collect_identifiers_from_statement_deep(&if_stmt.consequent, names);
            if let Some(alt) = &if_stmt.alternate {
                collect_identifiers_from_statement_deep(alt, names);
            }
        }
        JsStatement::Raw(raw) => {
            for word in raw.split(|c: char| !c.is_alphanumeric() && c != '_' && c != '$') {
                if !word.is_empty()
                    && word
                        .chars()
                        .next()
                        .is_some_and(|c| c.is_alphabetic() || c == '_' || c == '$')
                    && !names.contains(&word.to_string())
                {
                    names.push(word.to_string());
                }
            }
        }
        _ => {}
    }
}

/// Collect identifiers from an expression, crossing into arrow/function bodies.
fn collect_ids_from_expr_deep(expr: &JsExpr, names: &mut Vec<String>) {
    match expr {
        JsExpr::Identifier(name) => {
            if !names.contains(name) {
                names.push(name.clone());
            }
        }
        JsExpr::Call(call) => {
            collect_ids_from_expr_deep(&call.callee, names);
            for arg in &call.arguments {
                collect_ids_from_expr_deep(arg, names);
            }
        }
        JsExpr::Member(member) => {
            collect_ids_from_expr_deep(&member.object, names);
            match &member.property {
                JsMemberProperty::Expression(prop) => {
                    if member.computed {
                        collect_ids_from_expr_deep(prop, names);
                    }
                }
                JsMemberProperty::Identifier(id) => {
                    if !names.contains(id) {
                        names.push(id.clone());
                    }
                }
                JsMemberProperty::PrivateIdentifier(_) => {}
            }
        }
        JsExpr::Binary(bin) => {
            collect_ids_from_expr_deep(&bin.left, names);
            collect_ids_from_expr_deep(&bin.right, names);
        }
        JsExpr::Logical(log) => {
            collect_ids_from_expr_deep(&log.left, names);
            collect_ids_from_expr_deep(&log.right, names);
        }
        JsExpr::Unary(un) => {
            collect_ids_from_expr_deep(&un.argument, names);
        }
        JsExpr::Conditional(cond) => {
            collect_ids_from_expr_deep(&cond.test, names);
            collect_ids_from_expr_deep(&cond.consequent, names);
            collect_ids_from_expr_deep(&cond.alternate, names);
        }
        JsExpr::TemplateLiteral(tl) => {
            for e in &tl.expressions {
                collect_ids_from_expr_deep(e, names);
            }
        }
        JsExpr::Sequence(seq) => {
            for e in &seq.expressions {
                collect_ids_from_expr_deep(e, names);
            }
        }
        JsExpr::Array(arr) => {
            for e in arr.elements.iter().flatten() {
                collect_ids_from_expr_deep(e, names);
            }
        }
        JsExpr::Object(obj) => {
            for member in &obj.properties {
                match member {
                    JsObjectMember::Property(prop) => {
                        collect_ids_from_expr_deep(&prop.value, names);
                    }
                    JsObjectMember::SpreadElement(spread) => {
                        collect_ids_from_expr_deep(spread, names);
                    }
                }
            }
        }
        JsExpr::Assignment(assign) => {
            collect_ids_from_expr_deep(&assign.right, names);
        }
        JsExpr::Update(up) => {
            collect_ids_from_expr_deep(&up.argument, names);
        }
        JsExpr::Await(inner) => {
            collect_ids_from_expr_deep(inner, names);
        }
        JsExpr::Spread(inner) | JsExpr::Void(inner) => {
            collect_ids_from_expr_deep(inner, names);
        }
        // Cross into arrow and function bodies
        JsExpr::Arrow(arrow) => match &arrow.body {
            JsArrowBody::Expression(body_expr) => {
                collect_ids_from_expr_deep(body_expr, names);
            }
            JsArrowBody::Block(block) => {
                for s in &block.body {
                    collect_identifiers_from_statement_deep(s, names);
                }
            }
        },
        JsExpr::Function(func) => {
            for s in &func.body.body {
                collect_identifiers_from_statement_deep(s, names);
            }
        }
        _ => {}
    }
}

/// Collect identifiers that appear as arguments to `$.get()` calls in a statement.
///
/// This is used for blocker detection in template_effect. Only identifiers accessed
/// via `$.get(name)` are considered blocker candidates, because blocker variables
/// (from instance script async body) are always accessed through `$.get()`.
/// Other identifiers (snippet parameters, local variables) use different access
/// patterns and should not be treated as blockers.
pub fn collect_get_arg_identifiers_from_statement(stmt: &JsStatement, names: &mut Vec<String>) {
    match stmt {
        JsStatement::Expression(expr_stmt) => {
            collect_get_arg_ids_from_expr(&expr_stmt.expression, names);
        }
        JsStatement::Block(block_stmt) => {
            for s in &block_stmt.body {
                collect_get_arg_identifiers_from_statement(s, names);
            }
        }
        JsStatement::VariableDeclaration(decl) => {
            for declarator in &decl.declarations {
                if let Some(init) = &declarator.init {
                    collect_get_arg_ids_from_expr(init, names);
                }
            }
        }
        JsStatement::Return(ret) => {
            if let Some(expr) = &ret.argument {
                collect_get_arg_ids_from_expr(expr, names);
            }
        }
        JsStatement::If(if_stmt) => {
            collect_get_arg_ids_from_expr(&if_stmt.test, names);
            collect_get_arg_identifiers_from_statement(&if_stmt.consequent, names);
            if let Some(alt) = &if_stmt.alternate {
                collect_get_arg_identifiers_from_statement(alt, names);
            }
        }
        _ => {}
    }
}

/// Collect identifiers from `$.get(name)` call patterns in an expression.
fn collect_get_arg_ids_from_expr(expr: &JsExpr, names: &mut Vec<String>) {
    match expr {
        JsExpr::Call(call) => {
            // Check if this is a $.get(name) call
            if is_dollar_get_call(call) {
                if let Some(JsExpr::Identifier(arg_name)) = call.arguments.first() {
                    if !names.contains(arg_name) {
                        names.push(arg_name.clone());
                    }
                }
            }
            // Always recurse into callee and arguments to find nested $.get() calls
            collect_get_arg_ids_from_expr(&call.callee, names);
            for arg in &call.arguments {
                collect_get_arg_ids_from_expr(arg, names);
            }
        }
        JsExpr::Binary(bin) => {
            collect_get_arg_ids_from_expr(&bin.left, names);
            collect_get_arg_ids_from_expr(&bin.right, names);
        }
        JsExpr::Logical(log) => {
            collect_get_arg_ids_from_expr(&log.left, names);
            collect_get_arg_ids_from_expr(&log.right, names);
        }
        JsExpr::Unary(un) => {
            collect_get_arg_ids_from_expr(&un.argument, names);
        }
        JsExpr::Conditional(cond) => {
            collect_get_arg_ids_from_expr(&cond.test, names);
            collect_get_arg_ids_from_expr(&cond.consequent, names);
            collect_get_arg_ids_from_expr(&cond.alternate, names);
        }
        JsExpr::TemplateLiteral(tl) => {
            for e in &tl.expressions {
                collect_get_arg_ids_from_expr(e, names);
            }
        }
        JsExpr::Sequence(seq) => {
            for e in &seq.expressions {
                collect_get_arg_ids_from_expr(e, names);
            }
        }
        JsExpr::Array(arr) => {
            for e in arr.elements.iter().flatten() {
                collect_get_arg_ids_from_expr(e, names);
            }
        }
        JsExpr::Object(obj) => {
            for member in &obj.properties {
                match member {
                    JsObjectMember::Property(prop) => {
                        collect_get_arg_ids_from_expr(&prop.value, names);
                    }
                    JsObjectMember::SpreadElement(spread) => {
                        collect_get_arg_ids_from_expr(spread, names);
                    }
                }
            }
        }
        JsExpr::Member(member) => {
            collect_get_arg_ids_from_expr(&member.object, names);
        }
        JsExpr::Assignment(assign) => {
            collect_get_arg_ids_from_expr(&assign.right, names);
        }
        JsExpr::Spread(inner) | JsExpr::Void(inner) => {
            collect_get_arg_ids_from_expr(inner, names);
        }
        // Don't cross function boundaries
        JsExpr::Arrow(_) | JsExpr::Function(_) => {}
        _ => {}
    }
}

/// Check if a call expression is a `$.get(...)` call.
fn is_dollar_get_call(call: &JsCallExpression) -> bool {
    if let JsExpr::Member(member) = &*call.callee {
        if let JsExpr::Identifier(obj) = &*member.object {
            if obj == "$" {
                if let JsMemberProperty::Identifier(prop) = &member.property {
                    return prop == "get";
                }
            }
        }
    }
    false
}

/// Collect property names from `$$props.XXX` member access patterns in a statement.
///
/// This is used to detect blocked variables accessed through $$props destructuring.
/// For example, `$$props.name` yields "name" which can be checked against the blocker_map.
pub fn collect_props_member_names_from_statement(stmt: &JsStatement, names: &mut Vec<String>) {
    match stmt {
        JsStatement::Expression(expr_stmt) => {
            collect_props_member_names_from_expr(&expr_stmt.expression, names);
        }
        JsStatement::Block(block_stmt) => {
            for s in &block_stmt.body {
                collect_props_member_names_from_statement(s, names);
            }
        }
        JsStatement::VariableDeclaration(decl) => {
            for declarator in &decl.declarations {
                if let Some(init) = &declarator.init {
                    collect_props_member_names_from_expr(init, names);
                }
            }
        }
        JsStatement::Return(ret) => {
            if let Some(expr) = &ret.argument {
                collect_props_member_names_from_expr(expr, names);
            }
        }
        JsStatement::If(if_stmt) => {
            collect_props_member_names_from_expr(&if_stmt.test, names);
            collect_props_member_names_from_statement(&if_stmt.consequent, names);
            if let Some(alt) = &if_stmt.alternate {
                collect_props_member_names_from_statement(alt, names);
            }
        }
        _ => {}
    }
}

/// Collect property names from `$$props.XXX` member access patterns in an expression.
fn collect_props_member_names_from_expr(expr: &JsExpr, names: &mut Vec<String>) {
    match expr {
        JsExpr::Member(member) => {
            // Check if this is $$props.XXX
            if let JsExpr::Identifier(obj) = &*member.object {
                if obj == "$$props" {
                    if let JsMemberProperty::Identifier(prop_name) = &member.property {
                        if !names.contains(prop_name) {
                            names.push(prop_name.clone());
                        }
                    }
                }
            }
            // Recurse into object
            collect_props_member_names_from_expr(&member.object, names);
            if let JsMemberProperty::Expression(prop_expr) = &member.property {
                if member.computed {
                    collect_props_member_names_from_expr(prop_expr, names);
                }
            }
        }
        JsExpr::Call(call) => {
            collect_props_member_names_from_expr(&call.callee, names);
            for arg in &call.arguments {
                collect_props_member_names_from_expr(arg, names);
            }
        }
        JsExpr::Binary(bin) => {
            collect_props_member_names_from_expr(&bin.left, names);
            collect_props_member_names_from_expr(&bin.right, names);
        }
        JsExpr::Logical(log) => {
            collect_props_member_names_from_expr(&log.left, names);
            collect_props_member_names_from_expr(&log.right, names);
        }
        JsExpr::Unary(un) => {
            collect_props_member_names_from_expr(&un.argument, names);
        }
        JsExpr::Conditional(cond) => {
            collect_props_member_names_from_expr(&cond.test, names);
            collect_props_member_names_from_expr(&cond.consequent, names);
            collect_props_member_names_from_expr(&cond.alternate, names);
        }
        JsExpr::TemplateLiteral(tl) => {
            for e in &tl.expressions {
                collect_props_member_names_from_expr(e, names);
            }
        }
        JsExpr::Sequence(seq) => {
            for e in &seq.expressions {
                collect_props_member_names_from_expr(e, names);
            }
        }
        JsExpr::Array(arr) => {
            for e in arr.elements.iter().flatten() {
                collect_props_member_names_from_expr(e, names);
            }
        }
        JsExpr::Object(obj) => {
            for member in &obj.properties {
                match member {
                    JsObjectMember::Property(prop) => {
                        collect_props_member_names_from_expr(&prop.value, names);
                    }
                    JsObjectMember::SpreadElement(spread) => {
                        collect_props_member_names_from_expr(spread, names);
                    }
                }
            }
        }
        JsExpr::Assignment(assign) => {
            collect_props_member_names_from_expr(&assign.right, names);
        }
        JsExpr::Spread(inner) | JsExpr::Void(inner) => {
            collect_props_member_names_from_expr(inner, names);
        }
        // Don't cross function boundaries
        JsExpr::Arrow(_) | JsExpr::Function(_) => {}
        _ => {}
    }
}
