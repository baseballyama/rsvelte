//! Fragment visitor for client-side transformation.
//!
//! Corresponds to `Fragment.js` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/Fragment.js`.
//!
//! The Fragment visitor handles the transformation of Fragment nodes into client-side
//! JavaScript code. It creates a template block and processes its children.

use crate::ast::template::{Fragment, TemplateNode};
use crate::compiler::phases::phase3_transform::client::transform_template::{
    Namespace, Template, transform_template,
};
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::client::visitors::shared::fragment::process_children;
use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::build_render_statement;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;
use crate::compiler::phases::phase3_transform::utils::{clean_nodes, infer_namespace};
use std::collections::HashMap;

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
/// # Returns
///
/// Returns a block statement containing the transformed code.
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
        context.state.preserve_whitespace,
        context.state.options.preserve_comments,
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
    // TODO: Use scope.root.unique() when available - for now use memoizer
    let template_name = format!("root_{}", context.state.memoizer.generate_id(""));

    // Initialize result containers
    let mut body: Vec<JsStatement> = Vec::new();
    let mut close: Option<JsStatement> = None;

    // Create new state for this fragment
    let state = ComponentClientTransformState {
        scope: context.state.scope,
        scopes: HashMap::new(),
        analysis: context.state.analysis,
        scope_root: context.state.scope_root,
        options: context.state.options.clone(),
        hoisted: Vec::new(),
        template: Template::new(),
        init: Vec::new(),
        update: Vec::new(),
        after_update: Vec::new(),
        consts: Vec::new(),
        async_consts: None,
        let_directives: Vec::new(),
        node: context.state.node.clone(),
        memoizer: Memoizer::new(),
        transform: context.state.transform.clone(),
        events: context.state.events.clone(),
        metadata: ComponentMetadata {
            namespace: namespace.clone(),
            scoped: context.state.metadata.scoped,
        },
        in_constructor: false,
        in_derived: false,
        dev: context.state.options.dev,
        state_fields: context.state.state_fields.clone(),
        is_instance: context.state.is_instance,
        legacy_reactive_imports: context.state.legacy_reactive_imports.clone(),
        preserve_whitespace: context.state.preserve_whitespace,
        instance_level_snippets: Vec::new(),
        module_level_snippets: Vec::new(),
    };

    // Swap context.state with our local state so that process_children uses it
    let saved_state = std::mem::replace(&mut context.state, state);

    // Process hoisted nodes
    for hoisted_node in &cleaned.hoisted {
        context.visit_node(hoisted_node, None);
    }

    // Handle different cases based on trimmed nodes
    if is_single_element {
        // Single element case
        if let TemplateNode::RegularElement(element) = &cleaned.trimmed[0] {
            // Generate a unique identifier for the element
            let id_name = context.state.memoizer.generate_id(&element.name);
            let id = b::id(&id_name);

            // Visit the element with the id as the node
            let saved_node = std::mem::replace(&mut context.state.node, id.clone());
            context.visit_node(&cleaned.trimmed[0], None);
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
        context.visit_node(&cleaned.trimmed[0], None);
    } else if cleaned.trimmed.len() == 1 && matches!(cleaned.trimmed[0], TemplateNode::Text(_)) {
        // Single Text node case
        if let TemplateNode::Text(text) = &cleaned.trimmed[0] {
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
            .any(|node| matches!(node, TemplateNode::ExpressionTag(_)))
            && cleaned
                .trimmed
                .iter()
                .all(|node| matches!(node, TemplateNode::Text(_) | TemplateNode::ExpressionTag(_)));

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
            // No need to create a template, we can just use the existing block's anchor
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
        body.push(b::var_decl(
            "__async_consts",
            Some(b::call(
                b::member_path("$.run"),
                vec![b::array(async_consts.thunks)],
            )),
        ));
    }

    // Skip over inserted comment if text_first
    if cleaned.is_text_first {
        body.push(b::stmt(b::call(b::member_path("$.next"), vec![])));
    }

    body.extend(state.init);

    // Add render effect if there are updates
    if !state.update.is_empty() {
        body.push(b::stmt(build_render_statement(state.update)));
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

    JsBlockStatement { body }
}
