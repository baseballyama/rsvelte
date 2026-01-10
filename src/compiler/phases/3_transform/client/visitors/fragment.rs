//! Fragment visitor for client-side transformation.
//!
//! Corresponds to `Fragment` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/Fragment.js`.
//!
//! The Fragment visitor handles the transformation of Fragment nodes into client-side
//! JavaScript code. It creates a template block and processes its children.

use crate::ast::template::{Fragment, TemplateNode};
use crate::compiler::phases::phase3_transform::client::transform_template::{
    Node, Template, transform_template,
};
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::build_render_statement;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;
use crate::compiler::phases::phase3_transform::utils::{clean_nodes, infer_namespace};
use std::collections::HashMap;

// Constants from svelte/src/constants.js
const TEMPLATE_FRAGMENT: u32 = 1;
const TEMPLATE_USE_IMPORT_NODE: u32 = 2;

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
/// # Returns
///
/// Returns a block statement containing the transformed code.
///
/// # Implementation
///
/// The JavaScript implementation:
/// ```javascript
/// export function Fragment(node, context) {
///     const parent = context.path.at(-1) ?? node;
///     const namespace = infer_namespace(context.state.metadata.namespace, parent, node.nodes);
///     const { hoisted, trimmed, is_standalone, is_text_first } = clean_nodes(
///         parent, node.nodes, context.path, namespace, context.state,
///         context.state.preserve_whitespace, context.state.options.preserveComments
///     );
///
///     if (hoisted.length === 0 && trimmed.length === 0) {
///         return b.block([]);
///     }
///
///     const is_single_element = trimmed.length === 1 && trimmed[0].type === 'RegularElement';
///     const is_single_child_not_needing_template =
///         trimmed.length === 1 &&
///         (trimmed[0].type === 'SvelteFragment' || trimmed[0].type === 'TitleElement');
///     const template_name = context.state.scope.root.unique('root');
///
///     let body = [];
///     let close = undefined;
///
///     const state = {
///         ...context.state,
///         init: [], consts: [], let_directives: [], update: [], after_update: [],
///         memoizer: new Memoizer(), template: new Template(),
///         transform: { ...context.state.transform },
///         metadata: { namespace, bound_contenteditable: context.state.metadata.bound_contenteditable },
///         async_consts: undefined
///     };
///
///     for (const node of hoisted) {
///         context.visit(node, state);
///     }
///
///     // ... handle different cases (single element, single child, text, multiple nodes) ...
///
///     body.push(...state.let_directives, ...state.consts);
///
///     if (state.async_consts && state.async_consts.thunks.length > 0) {
///         body.push(b.var(state.async_consts.id, b.call('$.run', b.array(state.async_consts.thunks))));
///     }
///
///     if (is_text_first) {
///         body.push(b.stmt(b.call('$.next')));
///     }
///
///     body.push(...state.init);
///
///     if (state.update.length > 0) {
///         body.push(build_render_statement(state));
///     }
///
///     body.push(...state.after_update);
///
///     if (close !== undefined) {
///         body.push(close);
///     }
///
///     return b.block(body);
/// }
/// ```
pub fn fragment(node: &Fragment, context: &mut ComponentContext) -> JsBlockStatement {
    // Get parent node from path or use the fragment itself
    let parent = context.path.last().copied();

    // Infer namespace for children
    let namespace = infer_namespace(
        &context.state.metadata.namespace,
        parent,
        &node.nodes,
        context.state.analysis,
    );

    // Clean and organize nodes
    let cleaned = clean_nodes(
        parent,
        &node.nodes,
        &context.path,
        &namespace,
        context.state.scope,
        context.state.analysis,
        false, // preserve_whitespace - TODO: get from state
        false, // preserve_comments - TODO: get from options
    );

    // Early return if no nodes
    if cleaned.hoisted.is_empty() && cleaned.trimmed.is_empty() {
        return JsBlockStatement { body: Vec::new() };
    }

    // Analyze trimmed nodes
    let is_single_element =
        cleaned.trimmed.len() == 1 && matches!(cleaned.trimmed[0], TemplateNode::RegularElement(_));

    let is_single_child_not_needing_template = cleaned.trimmed.len() == 1
        && matches!(
            cleaned.trimmed[0],
            TemplateNode::SvelteFragment(_) | TemplateNode::TitleElement(_)
        );

    // Generate unique template name
    // TODO: Use scope.generate() when available
    let template_name = "root".to_string();

    // Initialize result containers
    let mut body: Vec<JsStatement> = Vec::new();
    let mut close: Option<JsStatement> = None;

    // Create new state for this fragment
    let mut state = ComponentClientTransformState {
        scope: context.state.scope,
        scopes: HashMap::new(),
        analysis: context.state.analysis,
        scope_root: context.state.scope_root,
        template: TemplateBuilder::new(),
        init: Vec::new(),
        update: Vec::new(),
        after_update: Vec::new(),
        node: context.state.node.clone(),
        memoizer: Memoizer::new(),
        transform: context.state.transform.clone(),
        let_directives: Vec::new(),
        events: context.state.events.clone(),
        metadata: ComponentMetadata {
            namespace: namespace.clone(),
            scoped: context.state.metadata.scoped,
        },
        in_constructor: false,
        in_derived: false,
        dev: context.state.dev,
        state_fields: context.state.state_fields.clone(),
        is_instance: context.state.is_instance,
        legacy_reactive_imports: context.state.legacy_reactive_imports.clone(),
    };

    // Process hoisted nodes
    for hoisted_node in &cleaned.hoisted {
        context.visit_node(hoisted_node, Some(&state));
    }

    // Handle different cases based on trimmed nodes
    // TODO: Phase 3 client-side code generation is incomplete
    // The following code needs refactoring to match current ComponentClientTransformState API
    /*
    if is_single_element {
        // Single element case
        if let TemplateNode::RegularElement(element) = &cleaned.trimmed[0] {
            // Generate a unique identifier for the element
            let id_name = state.memoizer.generate_id(&element.name);
            let id = b::id(&id_name);

            // Visit the element with the id as the node
            state.node = id.clone();
            context.visit_node(&cleaned.trimmed[0], Some(&state));

            // Determine flags
            let flags = 0u32; // TODO: Determine appropriate flags

            // Transform template
            // TODO: Need mutable reference to state
            // let template_expr = transform_template(&mut state, namespace.clone(), Some(flags), None);

            // Hoist template variable
            context
                .state
                .init
                .push(b::var_decl(&template_name, template_expr));

            // Initialize element
            state.init.insert(
                0,
                b::var_decl(&id_name, Some(b::call(b::id(&template_name), vec![]))),
            );

            // Append to anchor
            close = Some(b::stmt(b::call(
                b::member_path("$.append"),
                vec![b::id("$$anchor"), id],
            )));
        }
    } else */ if is_single_child_not_needing_template {
        // Single child not needing template (SvelteFragment or TitleElement)
        context.visit_node(&cleaned.trimmed[0], Some(&state));
    }

    // TODO: Phase 3 client-side code generation is incomplete
    // The following code needs major refactoring to work with current API
    /*
    else if cleaned.trimmed.len() == 1 {
        // Check if it's a single Text node
        if let TemplateNode::Text(text) = &cleaned.trimmed[0] {
            let id_name = context
                .state
                .scope_root
                .generate_unique_name("text".to_string());
            let id = b::id(&id_name);

            state.init.insert(
                0,
                b::var_decl(
                    &id_name,
                    b::call(b::member_path("$.text"), vec![b::string(&text.data)]),
                ),
            );

            close = Some(b::stmt(b::call(
                b::member_path("$.append"),
                vec![b::id("$$anchor"), id],
            )));
        }
    } else if !cleaned.trimmed.is_empty() {
        // Multiple nodes case
        let id_name = context
            .state
            .scope_root
            .generate_unique_name("fragment".to_string());
        let id = b::id(&id_name);

        // Check for special case: text and expression tags only
        let use_space_template = cleaned
            .trimmed
            .iter()
            .any(|node| matches!(node, TemplateNode::ExpressionTag(_)))
            && cleaned
                .trimmed
                .iter()
                .all(|node| matches!(node, TemplateNode::Text(_) | TemplateNode::ExpressionTag(_)));

        if use_space_template {
            // Special case — we can use `$.text` instead of creating a unique template
            let text_id_name = context
                .state
                .scope_root
                .generate_unique_name("text".to_string());
            let text_id = b::id(&text_id_name);

            // Process children
            // TODO: Implement process_children
            // process_children(&cleaned.trimmed, || text_id.clone(), false, context, &mut state);

            state.init.insert(
                0,
                b::var_decl(&text_id_name, b::call(b::member_path("$.text"), vec![])),
            );

            close = Some(b::stmt(b::call(
                b::member_path("$.append"),
                vec![b::id("$$anchor"), text_id],
            )));
        } else if cleaned.is_standalone {
            // No need to create a template, we can just use the existing block's anchor
            // TODO: Implement process_children
            // process_children(&cleaned.trimmed, || b::id("$$anchor"), false, context, &mut state);
        } else {
            // Standard case with template
            // TODO: Implement process_children
            // let expression = |is_text: bool| {
            //     if is_text {
            //         b::call(b::member_path("$.first_child"), vec![id.clone(), b::bool(true)])
            //     } else {
            //         b::call(b::member_path("$.first_child"), vec![id.clone()])
            //     }
            // };
            // process_children(&cleaned.trimmed, expression, false, context, &mut state);

            let mut flags = TEMPLATE_FRAGMENT;
            if state.template.needs_import_node {
                flags |= TEMPLATE_USE_IMPORT_NODE;
            }

            // Check for special case: single comment
            if state.template.nodes.len() == 1 {
                if let Some(Node::Comment(_)) = state.template.nodes.first() {
                    state.init.insert(
                        0,
                        b::var_decl(&id_name, Some(b::call(b::member_path("$.comment"), vec![]))),
                    );
                } else {
                    // Standard template case
                    let template_expr = transform_template(&state, &namespace, flags);
                    context
                        .state
                        .init
                        .push(b::var_decl(&template_name, template_expr));
                    state.init.insert(
                        0,
                        b::var_decl(&id_name, b::call(b::id(&template_name), vec![])),
                    );
                }
            } else {
                // Standard template case
                let template_expr = transform_template(&state, &namespace, flags);
                context
                    .state
                    .init
                    .push(b::var_decl(&template_name, template_expr));
                state.init.insert(
                    0,
                    b::var_decl(&id_name, b::call(b::id(&template_name), vec![])),
                );
            }

            close = Some(b::stmt(b::call(
                b::member_path("$.append"),
                vec![b::id("$$anchor"), id],
            )));
        }
    }
    */

    // Build the body
    body.extend(state.let_directives.into_iter().map(JsStatement::Expression));
    // body.extend(state.consts); // TODO: Add consts when implemented

    // Handle async_consts
    // TODO: Implement async_consts handling
    // if let Some(ref async_consts) = state.async_consts {
    //     if !async_consts.thunks.is_empty() {
    //         body.push(b::var_decl(
    //             &async_consts.id,
    //             b::call(b::member_path("$.run"), vec![b::array(async_consts.thunks.clone())]),
    //         ));
    //     }
    // }

    // Skip over inserted comment if text is first
    if cleaned.is_text_first {
        body.push(b::stmt(b::call(b::member_path("$.next"), vec![])));
    }

    body.extend(state.init);

    // Add render statement if there are updates
    if !state.update.is_empty() {
        body.push(build_render_statement(state.update));
    }

    body.extend(state.after_update);

    // Add close statement (must be last)
    if let Some(close_stmt) = close {
        body.push(close_stmt);
    }

    JsBlockStatement { body }
}
