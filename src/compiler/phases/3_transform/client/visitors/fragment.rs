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
use crate::compiler::phases::phase3_transform::utils::ParentRef;
use crate::compiler::phases::phase3_transform::utils::{clean_nodes, infer_namespace};
use rustc_hash::FxHashMap;

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
    let parent = ParentRef::from_option(context.path.last().copied());

    // Infer namespace for children.
    // When inside a <svelte:element> child context, skip inference since the
    // namespace is determined at runtime by $.element(), and we always want "html".
    let namespace: String = if context.state.metadata.svelte_element_child {
        context.state.metadata.namespace.clone()
    } else {
        infer_namespace(
            &context.state.metadata.namespace,
            parent,
            &node.nodes,
            context.state.analysis,
        )
        .to_string()
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
        parse_arena: context.state.parse_arena,
        scope: context.state.scope,
        scopes: FxHashMap::default(),
        analysis: context.state.analysis,
        scope_root: context.state.scope_root,
        options: Rc::clone(&context.state.options),
        hoisted: Vec::new(),
        template: Template::new(),
        init: Vec::new(),
        update: Vec::new(),
        after_update: Vec::new(),
        consts: Vec::new(),
        async_consts: None,
        let_directives: Vec::new(),
        node: context.state.node.clone(),
        memoizer: Memoizer::with_parent_conflicts(&context.state.memoizer),
        transform: context.state.transform.clone(),
        events: indexmap::IndexSet::default(), // Start empty, merge back later
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
        instance_level_snippets: Vec::new(),
        module_level_snippets: Vec::new(),
        snippet_names: context.state.snippet_names.clone(),
        in_direct_assignment_lhs: false,
        in_bind_directive: false,
        in_event_attribute_handler: false,
        event_handler_arrow_body_level: 0,
        is_controlled_each: false,
        snippets: Vec::new(),
        // Root fragment starts at level 0; non-root fragments (e.g., inside {#if}/{#each})
        // start at level 1 so that snippets inside blocks are not hoisted to the root.
        // This matches the official compiler's `context.path.length === 1` check.
        template_nesting_level: if is_root_fragment { 0 } else { 1 },
        in_control_flow_block: context.state.in_control_flow_block,
        each_index_used: context.state.each_index_used.clone(),
        each_index_name: context.state.each_index_name.clone(),
        ancestor_each_index_names: context.state.ancestor_each_index_names.clone(),
        each_item_assign_or_mutate: context.state.each_item_assign_or_mutate.clone(),
        each_item_names: context.state.each_item_names.clone(),
        each_binding_context: context.state.each_binding_context.clone(),
        local_var_init_types: Vec::new(),
        destructure_array_counter: context.state.destructure_array_counter.clone(),
        needs_props_from_events: context.state.needs_props_from_events.clone(),
        hidden_let_bindings: context.state.hidden_let_bindings.clone(),
        shadowed_prop_names: context.state.shadowed_prop_names.clone(),
        blocker_map: context.state.blocker_map.clone(),
        extra_blocker_indices: Vec::new(),
        is_standalone: false,
        const_blocker_map: context.state.const_blocker_map.clone(),
        needs_mutation_validation: context.state.needs_mutation_validation.clone(),
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
            let template_expr = transform_template(
                &context.arena,
                &mut context.state,
                parse_namespace(&namespace),
                flags,
                None,
            );
            context.state.hoisted.push(b::var_decl(
                &context.arena,
                &template_name,
                Some(template_expr),
            ));

            // Initialize element
            context.state.init.insert(
                0,
                b::var_decl(
                    &context.arena,
                    &id_name,
                    Some(b::call(&context.arena, b::id(&template_name), vec![])),
                ),
            );

            // Append to anchor
            close = Some(b::stmt(
                &context.arena,
                b::call(
                    &context.arena,
                    b::member_path(&context.arena, "$.append"),
                    vec![b::id("$$anchor"), id],
                ),
            ));
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
                    &context.arena,
                    &id_name,
                    Some(b::call(
                        &context.arena,
                        b::member_path(&context.arena, "$.text"),
                        vec![b::string(text.data.to_string())],
                    )),
                ),
            );

            close = Some(b::stmt(
                &context.arena,
                b::call(
                    &context.arena,
                    b::member_path(&context.arena, "$.append"),
                    vec![b::id("$$anchor"), id],
                ),
            ));
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
                    &context.arena,
                    &text_id_name,
                    Some(b::call(
                        &context.arena,
                        b::member_path(&context.arena, "$.text"),
                        vec![],
                    )),
                ),
            );

            close = Some(b::stmt(
                &context.arena,
                b::call(
                    &context.arena,
                    b::member_path(&context.arena, "$.append"),
                    vec![b::id("$$anchor"), text_id],
                ),
            ));
        } else if cleaned.is_standalone && !context.state.options.hmr {
            // No need to create a template, we can just use the existing block's anchor.
            // When HMR is enabled, we always need a fragment wrapper because $.hmr()
            // uses block/branch effects that need a stable anchor node.
            // Reference: utils.js line 288 checks `!state.options.hmr`
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
            // SAFETY: Extract arena ref before the closure to avoid moving context
            let arena_ref: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena =
                unsafe { &*(&context.arena as *const _) };
            process_children(
                &cleaned.trimmed,
                move |is_text: bool| {
                    if is_text {
                        b::call(
                            arena_ref,
                            b::member_path(arena_ref, "$.first_child"),
                            vec![id_for_closure.clone(), b::literal(JsLiteral::Boolean(true))],
                        )
                    } else {
                        b::call(
                            arena_ref,
                            b::member_path(arena_ref, "$.first_child"),
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
                    b::var_decl(
                        &context.arena,
                        &id_name,
                        Some(b::call(
                            &context.arena,
                            b::member_path(&context.arena, "$.comment"),
                            vec![],
                        )),
                    ),
                );
            } else {
                // Standard template case
                let template_expr = transform_template(
                    &context.arena,
                    &mut context.state,
                    parse_namespace(&namespace),
                    Some(flags),
                    None,
                );
                context.state.hoisted.push(b::var_decl(
                    &context.arena,
                    &template_name,
                    Some(template_expr),
                ));
                context.state.init.insert(
                    0,
                    b::var_decl(
                        &context.arena,
                        &id_name,
                        Some(b::call(&context.arena, b::id(&template_name), vec![])),
                    ),
                );
            }

            close = Some(b::stmt(
                &context.arena,
                b::call(
                    &context.arena,
                    b::member_path(&context.arena, "$.append"),
                    vec![b::id("$$anchor"), id],
                ),
            ));
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
            _ => "promises".into(),
        };
        body.push(b::var_decl(
            &context.arena,
            id_name.clone(),
            Some(b::call(
                &context.arena,
                b::member_path(&context.arena, "$.run"),
                vec![b::array(async_consts.thunks)],
            )),
        ));
    }

    // Skip over inserted comment if text_first (only for root fragments)
    // Nested fragments like IfBlock consequent/alternate don't need $.next()
    // because they handle their own templates independently.
    if is_root_fragment && cleaned.is_text_first {
        body.push(b::stmt(
            &context.arena,
            b::call(
                &context.arena,
                b::member_path(&context.arena, "$.next"),
                vec![],
            ),
        ));
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
                    collect_identifiers_from_statement(stmt, &context.arena, &mut all_names);
                }
                // Also scan memoized expressions for blocked identifiers.
                // Memoized values like `[() => checkedFactory()()]` are not in
                // state.update but still reference blocked variables.
                for memo_expr in state.memoizer.all_expressions() {
                    collect_ids_from_expr(&memo_expr, &context.arena, &mut all_names);
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

                // Collect const-tag-level blocker expressions from const_blocker_map.
                // Use pointer identity to deduplicate (same source pointer = same expression).
                let mut const_blocker_exprs: Vec<JsExpr> = Vec::new();
                let mut seen_ptrs: Vec<*const JsExpr> = Vec::new();
                for name in &all_names {
                    if let Some(blocker_expr) = const_map.get(name.as_str()) {
                        let ptr = blocker_expr as *const JsExpr;
                        if !seen_ptrs.contains(&ptr) {
                            seen_ptrs.push(ptr);
                            const_blocker_exprs.push(blocker_expr.clone());
                        }
                    }
                }

                // Combine instance-level and const-tag-level blockers
                let mut all_blocker_exprs: Vec<JsExpr> = indices
                    .into_iter()
                    .map(|idx| {
                        b::member_computed(
                            &context.arena,
                            b::id("$$promises"),
                            b::number(idx as f64),
                        )
                    })
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
            let sync_values = state.memoizer.sync_values(&context.arena);
            let async_values = state.memoizer.async_values(&context.arena);
            body.push(b::stmt(
                &context.arena,
                build_render_statement_with_memoizer(
                    &context.arena,
                    state.update,
                    params,
                    sync_values,
                    async_values,
                    blockers,
                ),
            ));
        } else if blockers.is_some() {
            body.push(b::stmt(
                &context.arena,
                build_render_statement_with_memoizer(
                    &context.arena,
                    state.update,
                    vec![],
                    None,
                    None,
                    blockers,
                ),
            ));
        } else {
            body.push(b::stmt(
                &context.arena,
                build_render_statement(&context.arena, state.update),
            ));
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
pub fn collect_identifiers_from_statement(
    stmt: &JsStatement,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    names: &mut Vec<compact_str::CompactString>,
) {
    match stmt {
        JsStatement::Expression(expr_stmt) => {
            collect_ids_from_expr(arena.get_expr(expr_stmt.expression), arena, names);
        }
        JsStatement::Block(block_stmt) => {
            for s in &block_stmt.body {
                collect_identifiers_from_statement(s, arena, names);
            }
        }
        JsStatement::VariableDeclaration(decl) => {
            for declarator in &decl.declarations {
                if let Some(init) = declarator.init {
                    collect_ids_from_expr(arena.get_expr(init), arena, names);
                }
            }
        }
        JsStatement::Return(ret) => {
            if let Some(expr) = ret.argument {
                collect_ids_from_expr(arena.get_expr(expr), arena, names);
            }
        }
        JsStatement::If(if_stmt) => {
            collect_ids_from_expr(arena.get_expr(if_stmt.test), arena, names);
            collect_identifiers_from_statement(arena.get_stmt(if_stmt.consequent), arena, names);
            if let Some(alt) = if_stmt.alternate {
                collect_identifiers_from_statement(arena.get_stmt(alt), arena, names);
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
                    && !names.iter().any(|n| n.as_str() == word)
                {
                    names.push(word.into());
                }
            }
        }
        _ => {}
    }
}

/// Collect identifiers from an expression (non-recursive across function boundaries).
fn collect_ids_from_expr(
    expr: &JsExpr,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    names: &mut Vec<compact_str::CompactString>,
) {
    match expr {
        JsExpr::Identifier(name) => {
            if !names.contains(name) {
                names.push(name.clone());
            }
        }
        JsExpr::Call(call) => {
            collect_ids_from_expr(arena.get_expr(call.callee), arena, names);
            for arg in &call.arguments {
                collect_ids_from_expr(arg, arena, names);
            }
        }
        JsExpr::Member(member) => {
            collect_ids_from_expr(arena.get_expr(member.object), arena, names);
            match &member.property {
                JsMemberProperty::Expression(prop) => {
                    if member.computed {
                        collect_ids_from_expr(arena.get_expr(*prop), arena, names);
                    }
                }
                JsMemberProperty::Identifier(id) => {
                    // Only collect non-computed property names for $$props access
                    // (e.g., $$props.name -> "name") since those are actual variable references.
                    // Don't collect general property accesses like `obj.length` as they
                    // are not variable references and would cause false blocker matches.
                    if let JsExpr::Identifier(obj_name) = arena.get_expr(member.object) {
                        if obj_name == "$$props" && !names.contains(id) {
                            names.push(id.clone());
                        }
                    }
                }
                JsMemberProperty::PrivateIdentifier(_) => {}
            }
        }
        JsExpr::Binary(bin) => {
            collect_ids_from_expr(arena.get_expr(bin.left), arena, names);
            collect_ids_from_expr(arena.get_expr(bin.right), arena, names);
        }
        JsExpr::Logical(log) => {
            collect_ids_from_expr(arena.get_expr(log.left), arena, names);
            collect_ids_from_expr(arena.get_expr(log.right), arena, names);
        }
        JsExpr::Unary(un) => {
            collect_ids_from_expr(arena.get_expr(un.argument), arena, names);
        }
        JsExpr::Conditional(cond) => {
            collect_ids_from_expr(arena.get_expr(cond.test), arena, names);
            collect_ids_from_expr(arena.get_expr(cond.consequent), arena, names);
            collect_ids_from_expr(arena.get_expr(cond.alternate), arena, names);
        }
        JsExpr::TemplateLiteral(tl) => {
            for e in &tl.expressions {
                collect_ids_from_expr(e, arena, names);
            }
        }
        JsExpr::Sequence(seq) => {
            for e in &seq.expressions {
                collect_ids_from_expr(e, arena, names);
            }
        }
        JsExpr::Array(arr) => {
            for e in arr.elements.iter().flatten() {
                collect_ids_from_expr(e, arena, names);
            }
        }
        JsExpr::Object(obj) => {
            for member in &obj.properties {
                match member {
                    JsObjectMember::Property(prop) => {
                        collect_ids_from_expr(arena.get_expr(prop.value), arena, names);
                    }
                    JsObjectMember::SpreadElement(spread) => {
                        collect_ids_from_expr(arena.get_expr(*spread), arena, names);
                    }
                }
            }
        }
        JsExpr::Assignment(assign) => {
            collect_ids_from_expr(arena.get_expr(assign.right), arena, names);
        }
        JsExpr::Update(up) => {
            collect_ids_from_expr(arena.get_expr(up.argument), arena, names);
        }
        JsExpr::Await(inner) => {
            collect_ids_from_expr(arena.get_expr(*inner), arena, names);
        }
        JsExpr::Spread(inner) | JsExpr::Void(inner) => {
            collect_ids_from_expr(arena.get_expr(*inner), arena, names);
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
pub fn collect_identifiers_from_statement_props(
    stmt: &JsStatement,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    names: &mut Vec<compact_str::CompactString>,
) {
    match stmt {
        JsStatement::Expression(expr_stmt) => {
            collect_ids_from_expr_props(arena.get_expr(expr_stmt.expression), arena, names);
        }
        JsStatement::Block(block_stmt) => {
            for s in &block_stmt.body {
                collect_identifiers_from_statement_props(s, arena, names);
            }
        }
        JsStatement::VariableDeclaration(decl) => {
            for declarator in &decl.declarations {
                if let Some(init) = declarator.init {
                    collect_ids_from_expr_props(arena.get_expr(init), arena, names);
                }
            }
        }
        JsStatement::Return(ret) => {
            if let Some(expr) = ret.argument {
                collect_ids_from_expr_props(arena.get_expr(expr), arena, names);
            }
        }
        JsStatement::If(if_stmt) => {
            collect_ids_from_expr_props(arena.get_expr(if_stmt.test), arena, names);
            collect_identifiers_from_statement_props(
                arena.get_stmt(if_stmt.consequent),
                arena,
                names,
            );
            if let Some(alt) = if_stmt.alternate {
                collect_identifiers_from_statement_props(arena.get_stmt(alt), arena, names);
            }
        }
        JsStatement::Raw(raw) => {
            for word in raw.split(|c: char| !c.is_alphanumeric() && c != '_' && c != '$') {
                if !word.is_empty()
                    && word
                        .chars()
                        .next()
                        .is_some_and(|c| c.is_alphabetic() || c == '_' || c == '$')
                    && !names.iter().any(|n| n.as_str() == word)
                {
                    names.push(word.into());
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
fn collect_ids_from_expr_props(
    expr: &JsExpr,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    names: &mut Vec<compact_str::CompactString>,
) {
    match expr {
        JsExpr::Identifier(name) => {
            if !names.contains(name) {
                names.push(name.clone());
            }
        }
        JsExpr::Call(call) => {
            collect_ids_from_expr_props(arena.get_expr(call.callee), arena, names);
            for arg in &call.arguments {
                collect_ids_from_expr_props(arg, arena, names);
            }
        }
        JsExpr::Member(member) => {
            collect_ids_from_expr_props(arena.get_expr(member.object), arena, names);
            match &member.property {
                JsMemberProperty::Expression(prop) => {
                    if member.computed {
                        collect_ids_from_expr_props(arena.get_expr(*prop), arena, names);
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
            collect_ids_from_expr_props(arena.get_expr(bin.left), arena, names);
            collect_ids_from_expr_props(arena.get_expr(bin.right), arena, names);
        }
        JsExpr::Logical(log) => {
            collect_ids_from_expr_props(arena.get_expr(log.left), arena, names);
            collect_ids_from_expr_props(arena.get_expr(log.right), arena, names);
        }
        JsExpr::Unary(un) => {
            collect_ids_from_expr_props(arena.get_expr(un.argument), arena, names);
        }
        JsExpr::Conditional(cond) => {
            collect_ids_from_expr_props(arena.get_expr(cond.test), arena, names);
            collect_ids_from_expr_props(arena.get_expr(cond.consequent), arena, names);
            collect_ids_from_expr_props(arena.get_expr(cond.alternate), arena, names);
        }
        JsExpr::TemplateLiteral(tl) => {
            for e in &tl.expressions {
                collect_ids_from_expr_props(e, arena, names);
            }
        }
        JsExpr::Sequence(seq) => {
            for e in &seq.expressions {
                collect_ids_from_expr_props(e, arena, names);
            }
        }
        JsExpr::Array(arr) => {
            for e in arr.elements.iter().flatten() {
                collect_ids_from_expr_props(e, arena, names);
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
                            if let JsExpr::Function(func) = arena.get_expr(prop.value) {
                                for stmt in &func.body.body {
                                    collect_identifiers_from_statement_props(stmt, arena, names);
                                }
                            }
                        } else {
                            // For regular properties, recurse (entering arrow bodies)
                            collect_ids_from_expr_props(arena.get_expr(prop.value), arena, names);
                        }
                    }
                    JsObjectMember::SpreadElement(spread) => {
                        collect_ids_from_expr_props(arena.get_expr(*spread), arena, names);
                    }
                }
            }
        }
        JsExpr::Assignment(assign) => {
            collect_ids_from_expr_props(arena.get_expr(assign.right), arena, names);
        }
        JsExpr::Update(up) => {
            collect_ids_from_expr_props(arena.get_expr(up.argument), arena, names);
        }
        JsExpr::Await(inner) => {
            collect_ids_from_expr_props(arena.get_expr(*inner), arena, names);
        }
        JsExpr::Spread(inner) | JsExpr::Void(inner) => {
            collect_ids_from_expr_props(arena.get_expr(*inner), arena, names);
        }
        // Enter arrow and function bodies (unlike the shallow version)
        JsExpr::Arrow(arrow) => match &arrow.body {
            JsArrowBody::Expression(body_expr) => {
                collect_ids_from_expr_props(arena.get_expr(*body_expr), arena, names);
            }
            JsArrowBody::Block(block) => {
                for s in &block.body {
                    collect_identifiers_from_statement_props(s, arena, names);
                }
            }
        },
        JsExpr::Function(func) => {
            for s in &func.body.body {
                collect_identifiers_from_statement_props(s, arena, names);
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
pub fn collect_identifiers_from_statement_deep(
    stmt: &JsStatement,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    names: &mut Vec<compact_str::CompactString>,
) {
    match stmt {
        JsStatement::Expression(expr_stmt) => {
            collect_ids_from_expr_deep(arena.get_expr(expr_stmt.expression), arena, names);
        }
        JsStatement::Block(block_stmt) => {
            for s in &block_stmt.body {
                collect_identifiers_from_statement_deep(s, arena, names);
            }
        }
        JsStatement::VariableDeclaration(decl) => {
            for declarator in &decl.declarations {
                if let Some(init) = declarator.init {
                    collect_ids_from_expr_deep(arena.get_expr(init), arena, names);
                }
            }
        }
        JsStatement::Return(ret) => {
            if let Some(expr) = ret.argument {
                collect_ids_from_expr_deep(arena.get_expr(expr), arena, names);
            }
        }
        JsStatement::If(if_stmt) => {
            collect_ids_from_expr_deep(arena.get_expr(if_stmt.test), arena, names);
            collect_identifiers_from_statement_deep(
                arena.get_stmt(if_stmt.consequent),
                arena,
                names,
            );
            if let Some(alt) = if_stmt.alternate {
                collect_identifiers_from_statement_deep(arena.get_stmt(alt), arena, names);
            }
        }
        JsStatement::Raw(raw) => {
            for word in raw.split(|c: char| !c.is_alphanumeric() && c != '_' && c != '$') {
                if !word.is_empty()
                    && word
                        .chars()
                        .next()
                        .is_some_and(|c| c.is_alphabetic() || c == '_' || c == '$')
                    && !names.iter().any(|n| n.as_str() == word)
                {
                    names.push(word.into());
                }
            }
        }
        _ => {}
    }
}

/// Collect identifiers from an expression, crossing into arrow/function bodies.
fn collect_ids_from_expr_deep(
    expr: &JsExpr,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    names: &mut Vec<compact_str::CompactString>,
) {
    match expr {
        JsExpr::Identifier(name) => {
            if !names.contains(name) {
                names.push(name.clone());
            }
        }
        JsExpr::Call(call) => {
            collect_ids_from_expr_deep(arena.get_expr(call.callee), arena, names);
            for arg in &call.arguments {
                collect_ids_from_expr_deep(arg, arena, names);
            }
        }
        JsExpr::Member(member) => {
            collect_ids_from_expr_deep(arena.get_expr(member.object), arena, names);
            match &member.property {
                JsMemberProperty::Expression(prop) => {
                    if member.computed {
                        collect_ids_from_expr_deep(arena.get_expr(*prop), arena, names);
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
            collect_ids_from_expr_deep(arena.get_expr(bin.left), arena, names);
            collect_ids_from_expr_deep(arena.get_expr(bin.right), arena, names);
        }
        JsExpr::Logical(log) => {
            collect_ids_from_expr_deep(arena.get_expr(log.left), arena, names);
            collect_ids_from_expr_deep(arena.get_expr(log.right), arena, names);
        }
        JsExpr::Unary(un) => {
            collect_ids_from_expr_deep(arena.get_expr(un.argument), arena, names);
        }
        JsExpr::Conditional(cond) => {
            collect_ids_from_expr_deep(arena.get_expr(cond.test), arena, names);
            collect_ids_from_expr_deep(arena.get_expr(cond.consequent), arena, names);
            collect_ids_from_expr_deep(arena.get_expr(cond.alternate), arena, names);
        }
        JsExpr::TemplateLiteral(tl) => {
            for e in &tl.expressions {
                collect_ids_from_expr_deep(e, arena, names);
            }
        }
        JsExpr::Sequence(seq) => {
            for e in &seq.expressions {
                collect_ids_from_expr_deep(e, arena, names);
            }
        }
        JsExpr::Array(arr) => {
            for e in arr.elements.iter().flatten() {
                collect_ids_from_expr_deep(e, arena, names);
            }
        }
        JsExpr::Object(obj) => {
            for member in &obj.properties {
                match member {
                    JsObjectMember::Property(prop) => {
                        collect_ids_from_expr_deep(arena.get_expr(prop.value), arena, names);
                    }
                    JsObjectMember::SpreadElement(spread) => {
                        collect_ids_from_expr_deep(arena.get_expr(*spread), arena, names);
                    }
                }
            }
        }
        JsExpr::Assignment(assign) => {
            collect_ids_from_expr_deep(arena.get_expr(assign.right), arena, names);
        }
        JsExpr::Update(up) => {
            collect_ids_from_expr_deep(arena.get_expr(up.argument), arena, names);
        }
        JsExpr::Await(inner) => {
            collect_ids_from_expr_deep(arena.get_expr(*inner), arena, names);
        }
        JsExpr::Spread(inner) | JsExpr::Void(inner) => {
            collect_ids_from_expr_deep(arena.get_expr(*inner), arena, names);
        }
        // Cross into arrow and function bodies
        JsExpr::Arrow(arrow) => match &arrow.body {
            JsArrowBody::Expression(body_expr) => {
                collect_ids_from_expr_deep(arena.get_expr(*body_expr), arena, names);
            }
            JsArrowBody::Block(block) => {
                for s in &block.body {
                    collect_identifiers_from_statement_deep(s, arena, names);
                }
            }
        },
        JsExpr::Function(func) => {
            for s in &func.body.body {
                collect_identifiers_from_statement_deep(s, arena, names);
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
pub fn collect_get_arg_identifiers_from_statement(
    stmt: &JsStatement,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    names: &mut Vec<compact_str::CompactString>,
) {
    match stmt {
        JsStatement::Expression(expr_stmt) => {
            collect_get_arg_ids_from_expr(arena.get_expr(expr_stmt.expression), arena, names);
        }
        JsStatement::Block(block_stmt) => {
            for s in &block_stmt.body {
                collect_get_arg_identifiers_from_statement(s, arena, names);
            }
        }
        JsStatement::VariableDeclaration(decl) => {
            for declarator in &decl.declarations {
                if let Some(init) = &declarator.init {
                    collect_get_arg_ids_from_expr(arena.get_expr(*init), arena, names);
                }
            }
        }
        JsStatement::Return(ret) => {
            if let Some(expr) = &ret.argument {
                collect_get_arg_ids_from_expr(arena.get_expr(*expr), arena, names);
            }
        }
        JsStatement::If(if_stmt) => {
            collect_get_arg_ids_from_expr(arena.get_expr(if_stmt.test), arena, names);
            collect_get_arg_identifiers_from_statement(
                arena.get_stmt(if_stmt.consequent),
                arena,
                names,
            );
            if let Some(alt) = if_stmt.alternate {
                collect_get_arg_identifiers_from_statement(arena.get_stmt(alt), arena, names);
            }
        }
        _ => {}
    }
}

/// Collect identifiers from `$.get(name)` call patterns in an expression.
fn collect_get_arg_ids_from_expr(
    expr: &JsExpr,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    names: &mut Vec<compact_str::CompactString>,
) {
    match expr {
        JsExpr::Call(call) => {
            // Check if this is a $.get(name) call
            if is_dollar_get_call(call, arena) {
                if let Some(JsExpr::Identifier(arg_name)) = call.arguments.first() {
                    if !names.contains(arg_name) {
                        names.push(arg_name.clone());
                    }
                }
            }
            // Always recurse into callee and arguments to find nested $.get() calls
            collect_get_arg_ids_from_expr(arena.get_expr(call.callee), arena, names);
            for arg in &call.arguments {
                collect_get_arg_ids_from_expr(arg, arena, names);
            }
        }
        JsExpr::Binary(bin) => {
            collect_get_arg_ids_from_expr(arena.get_expr(bin.left), arena, names);
            collect_get_arg_ids_from_expr(arena.get_expr(bin.right), arena, names);
        }
        JsExpr::Logical(log) => {
            collect_get_arg_ids_from_expr(arena.get_expr(log.left), arena, names);
            collect_get_arg_ids_from_expr(arena.get_expr(log.right), arena, names);
        }
        JsExpr::Unary(un) => {
            collect_get_arg_ids_from_expr(arena.get_expr(un.argument), arena, names);
        }
        JsExpr::Conditional(cond) => {
            collect_get_arg_ids_from_expr(arena.get_expr(cond.test), arena, names);
            collect_get_arg_ids_from_expr(arena.get_expr(cond.consequent), arena, names);
            collect_get_arg_ids_from_expr(arena.get_expr(cond.alternate), arena, names);
        }
        JsExpr::TemplateLiteral(tl) => {
            for e in &tl.expressions {
                collect_get_arg_ids_from_expr(e, arena, names);
            }
        }
        JsExpr::Sequence(seq) => {
            for e in &seq.expressions {
                collect_get_arg_ids_from_expr(e, arena, names);
            }
        }
        JsExpr::Array(arr) => {
            for e in arr.elements.iter().flatten() {
                collect_get_arg_ids_from_expr(e, arena, names);
            }
        }
        JsExpr::Object(obj) => {
            for member in &obj.properties {
                match member {
                    JsObjectMember::Property(prop) => {
                        collect_get_arg_ids_from_expr(arena.get_expr(prop.value), arena, names);
                    }
                    JsObjectMember::SpreadElement(spread) => {
                        collect_get_arg_ids_from_expr(arena.get_expr(*spread), arena, names);
                    }
                }
            }
        }
        JsExpr::Member(member) => {
            collect_get_arg_ids_from_expr(arena.get_expr(member.object), arena, names);
        }
        JsExpr::Assignment(assign) => {
            collect_get_arg_ids_from_expr(arena.get_expr(assign.right), arena, names);
        }
        JsExpr::Spread(inner) | JsExpr::Void(inner) => {
            collect_get_arg_ids_from_expr(arena.get_expr(*inner), arena, names);
        }
        // Don't cross function boundaries
        JsExpr::Arrow(_) | JsExpr::Function(_) => {}
        _ => {}
    }
}

/// Check if a call expression is a `$.get(...)` call.
fn is_dollar_get_call(
    call: &JsCallExpression,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
) -> bool {
    if let JsExpr::Member(member) = arena.get_expr(call.callee) {
        if let JsExpr::Identifier(obj) = arena.get_expr(member.object) {
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
pub fn collect_props_member_names_from_statement(
    stmt: &JsStatement,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    names: &mut Vec<compact_str::CompactString>,
) {
    match stmt {
        JsStatement::Expression(expr_stmt) => {
            collect_props_member_names_from_expr(
                arena.get_expr(expr_stmt.expression),
                arena,
                names,
            );
        }
        JsStatement::Block(block_stmt) => {
            for s in &block_stmt.body {
                collect_props_member_names_from_statement(s, arena, names);
            }
        }
        JsStatement::VariableDeclaration(decl) => {
            for declarator in &decl.declarations {
                if let Some(init) = &declarator.init {
                    collect_props_member_names_from_expr(arena.get_expr(*init), arena, names);
                }
            }
        }
        JsStatement::Return(ret) => {
            if let Some(expr) = &ret.argument {
                collect_props_member_names_from_expr(arena.get_expr(*expr), arena, names);
            }
        }
        JsStatement::If(if_stmt) => {
            collect_props_member_names_from_expr(arena.get_expr(if_stmt.test), arena, names);
            collect_props_member_names_from_statement(
                arena.get_stmt(if_stmt.consequent),
                arena,
                names,
            );
            if let Some(alt) = if_stmt.alternate {
                collect_props_member_names_from_statement(arena.get_stmt(alt), arena, names);
            }
        }
        _ => {}
    }
}

/// Collect property names from `$$props.XXX` member access patterns in an expression.
fn collect_props_member_names_from_expr(
    expr: &JsExpr,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    names: &mut Vec<compact_str::CompactString>,
) {
    match expr {
        JsExpr::Member(member) => {
            // Check if this is $$props.XXX
            if let JsExpr::Identifier(obj) = arena.get_expr(member.object) {
                if obj == "$$props" {
                    if let JsMemberProperty::Identifier(prop_name) = &member.property {
                        if !names.contains(prop_name) {
                            names.push(prop_name.clone());
                        }
                    }
                }
            }
            // Recurse into object
            collect_props_member_names_from_expr(arena.get_expr(member.object), arena, names);
            if let JsMemberProperty::Expression(prop_expr) = &member.property {
                if member.computed {
                    collect_props_member_names_from_expr(arena.get_expr(*prop_expr), arena, names);
                }
            }
        }
        JsExpr::Call(call) => {
            collect_props_member_names_from_expr(arena.get_expr(call.callee), arena, names);
            for arg in &call.arguments {
                collect_props_member_names_from_expr(arg, arena, names);
            }
        }
        JsExpr::Binary(bin) => {
            collect_props_member_names_from_expr(arena.get_expr(bin.left), arena, names);
            collect_props_member_names_from_expr(arena.get_expr(bin.right), arena, names);
        }
        JsExpr::Logical(log) => {
            collect_props_member_names_from_expr(arena.get_expr(log.left), arena, names);
            collect_props_member_names_from_expr(arena.get_expr(log.right), arena, names);
        }
        JsExpr::Unary(un) => {
            collect_props_member_names_from_expr(arena.get_expr(un.argument), arena, names);
        }
        JsExpr::Conditional(cond) => {
            collect_props_member_names_from_expr(arena.get_expr(cond.test), arena, names);
            collect_props_member_names_from_expr(arena.get_expr(cond.consequent), arena, names);
            collect_props_member_names_from_expr(arena.get_expr(cond.alternate), arena, names);
        }
        JsExpr::TemplateLiteral(tl) => {
            for e in &tl.expressions {
                collect_props_member_names_from_expr(e, arena, names);
            }
        }
        JsExpr::Sequence(seq) => {
            for e in &seq.expressions {
                collect_props_member_names_from_expr(e, arena, names);
            }
        }
        JsExpr::Array(arr) => {
            for e in arr.elements.iter().flatten() {
                collect_props_member_names_from_expr(e, arena, names);
            }
        }
        JsExpr::Object(obj) => {
            for member in &obj.properties {
                match member {
                    JsObjectMember::Property(prop) => {
                        collect_props_member_names_from_expr(
                            arena.get_expr(prop.value),
                            arena,
                            names,
                        );
                    }
                    JsObjectMember::SpreadElement(spread) => {
                        collect_props_member_names_from_expr(arena.get_expr(*spread), arena, names);
                    }
                }
            }
        }
        JsExpr::Assignment(assign) => {
            collect_props_member_names_from_expr(arena.get_expr(assign.right), arena, names);
        }
        JsExpr::Spread(inner) | JsExpr::Void(inner) => {
            collect_props_member_names_from_expr(arena.get_expr(*inner), arena, names);
        }
        // Don't cross function boundaries
        JsExpr::Arrow(_) | JsExpr::Function(_) => {}
        _ => {}
    }
}
