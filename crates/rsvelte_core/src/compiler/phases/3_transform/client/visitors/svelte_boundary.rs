//! SvelteBoundary visitor for client-side transformation.
//!
//! Handles `<svelte:boundary>` elements for async error boundaries.
//!
//! Corresponds to `SvelteBoundary.js` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/SvelteBoundary.js`.

use crate::ast::js::Expression;
use crate::ast::template::{
    Attribute, AttributeValue, AttributeValuePart, SvelteElement, TemplateNode,
};
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;
use crate::compiler::phases::phase3_transform::client::visitors::fragment::fragment;
use crate::compiler::phases::phase3_transform::client::visitors::snippet_block::snippet_block;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;

/// Visit a SvelteBoundary node and generate client-side code.
///
/// Generates code like:
/// ```js
/// const pending = ($$anchor) => { ... };
/// $.boundary(node, { pending }, ($$anchor) => {
///     // content
/// });
/// ```
pub fn svelte_boundary(node: &SvelteElement, context: &mut ComponentContext) {
    // Build props object for boundary options
    let mut props: Vec<JsObjectMember> = Vec::new();

    // Process attributes (onerror, failed, pending, etc.)
    for attribute in &node.attributes {
        if let Attribute::Attribute(attr) = attribute {
            if matches!(attr.value, AttributeValue::True(_)) {
                // Skip boolean-only attributes
                continue;
            }

            // Extract the expression from the attribute value
            let orig_expression = if let AttributeValue::Sequence(parts) = &attr.value
                && let Some(AttributeValuePart::ExpressionTag(expr_tag)) = parts.first()
            {
                Some(&expr_tag.expression)
            } else if let AttributeValue::Expression(expr_tag) = &attr.value {
                Some(&expr_tag.expression)
            } else {
                None
            };

            if let Some(orig_expr) = orig_expression {
                // Check if the expression has reactive state
                // This mirrors the official Svelte compiler: chunk.metadata.expression.has_state
                let has_state =
                    super::shared::utils::expression_has_reactive_state(orig_expr, context);

                // Convert expression and apply transforms (e.g., onerror -> $.get(onerror))
                let expression = convert_expression(orig_expr, context);
                let transformed =
                    super::shared::utils::apply_transforms_to_expression(&expression, context);

                if has_state {
                    // Use getter for reactive values: get onerror() { return $.get(onerror); }
                    props.push(b::getter(
                        &context.arena,
                        attr.name.as_str(),
                        vec![b::return_value(&context.arena, transformed)],
                    ));
                } else {
                    // Use init for static values
                    props.push(b::prop(&context.arena, attr.name.as_str(), transformed));
                }
            }
        }
    }

    // Collect nodes for the boundary content
    let mut content_nodes: Vec<TemplateNode> = Vec::new();
    let mut hoisted_snippets: Vec<JsStatement> = Vec::new();

    let use_async = context.state.options.experimental_async;

    // In async mode, check if there are const tags OR declaration tags (needed to
    // decide snippet hoisting). Mirrors upstream SvelteBoundary.js which tracks
    // both `has_const` (ConstTag, `{@const}`) and `has_declaration` (DeclarationTag,
    // `{const x = …}` / `{let x = …}`) and keeps non-special snippets inside the
    // boundary callback when either is present (so the snippet can reference them).
    let has_const = use_async
        && node.fragment.nodes.iter().any(|n| {
            matches!(
                n,
                TemplateNode::ConstTag(_) | TemplateNode::DeclarationTag(_)
            )
        });

    // In non-async mode, visit boundary-level `{@const}` tags FIRST, capturing
    // their generated declarations. Upstream SvelteBoundary.js: "const tags
    // need to live inside the boundary, but might also be referenced in
    // hoisted snippets. to resolve this we cheat: we duplicate const tags
    // inside snippets". The visit also registers the `$.get(...)` read
    // transform for each const name, so snippet bodies reference `$.get(foo)`
    // instead of folding or emitting a bare identifier.
    let mut const_tags: Vec<JsStatement> = Vec::new();
    if !use_async {
        for child in &node.fragment.nodes {
            if let TemplateNode::ConstTag(_) = child {
                let saved_consts = std::mem::take(&mut context.state.consts);
                context.visit_node(child, None);
                let generated = std::mem::replace(&mut context.state.consts, saved_consts);
                const_tags.extend(generated);
            }
        }
    }
    // Only variable declarations are duplicated into hoisted snippet bodies
    // (upstream filters `node.type === 'VariableDeclaration'`; the dev-mode
    // eager `$.get(...)` statements stay in the boundary content only).
    let snippet_const_tags: Vec<JsStatement> = const_tags
        .iter()
        .filter(|s| matches!(s, JsStatement::VariableDeclaration(_)))
        .cloned()
        .collect();

    // Process fragment children
    for child in &node.fragment.nodes {
        match child {
            TemplateNode::ConstTag(_) => {
                // In async mode, const tags live inside the boundary content.
                // In non-async mode they were already visited above (and their
                // declarations are unshifted into the content block below).
                if use_async {
                    content_nodes.push(child.clone());
                }
            }
            TemplateNode::DeclarationTag(_) => {
                // Declaration tags always stay in the boundary content
                // (upstream does not duplicate them into snippets).
                content_nodes.push(child.clone());
            }
            TemplateNode::SnippetBlock(snippet) => {
                let snippet_name = get_snippet_name(&snippet.expression);
                let is_special = snippet_name == "failed" || snippet_name == "pending";

                // In async mode with const tags, regular (non-failed/pending) snippets
                // stay in the fragment because they may reference const tags.
                // This matches the official compiler's SvelteBoundary.js behavior.
                if use_async && has_const && !is_special {
                    content_nodes.push(child.clone());
                } else {
                    // Hoist the snippet (either it's failed/pending, or non-async mode)
                    // Duplicate the boundary-level const declarations at the top
                    // of the snippet body (consumed by `snippet_block`).
                    context.state.snippet_body_prepend = snippet_const_tags.clone();
                    let saved_init = std::mem::take(&mut context.state.init);
                    let saved_instance = std::mem::take(&mut context.state.instance_level_snippets);
                    let saved_module = std::mem::take(&mut context.state.module_level_snippets);
                    let saved_snippets = std::mem::take(&mut context.state.snippets);

                    snippet_block(snippet, context);

                    // Get the generated statement(s) from any of the snippet locations
                    let mut snippet_stmts = std::mem::take(&mut context.state.init);
                    snippet_stmts
                        .extend(std::mem::take(&mut context.state.instance_level_snippets));
                    snippet_stmts.extend(std::mem::take(&mut context.state.module_level_snippets));
                    snippet_stmts.extend(std::mem::take(&mut context.state.snippets));
                    context.state.init = saved_init;
                    context.state.instance_level_snippets = saved_instance;
                    context.state.module_level_snippets = saved_module;
                    context.state.snippets = saved_snippets;

                    hoisted_snippets.extend(snippet_stmts);

                    if is_special {
                        // Add to props with shorthand: { pending }
                        props.push(JsObjectMember::Property(JsProperty {
                            key: JsPropertyKey::Identifier(snippet_name.clone().into()),
                            value: context.arena.alloc_expr(b::id(&snippet_name)),
                            kind: JsPropertyKind::Init,
                            computed: false,
                            shorthand: true,
                            method: false,
                        }));
                    }
                }
            }
            _ => {
                // Regular nodes go into the boundary content
                content_nodes.push(child.clone());
            }
        }
    }

    // Create a fragment for the content
    let content_fragment = crate::ast::template::Fragment {
        nodes: content_nodes,
        ..Default::default()
    };

    // Visit the content fragment
    // Boundary content needs is_root_fragment=true because SvelteBoundary is in the
    // is_text_first parent type list. The boundary callback creates a new scope with
    // $$anchor, so it needs $.next() when the first child is text/expression.
    //
    // When async mode is active and snippets are kept in the fragment (not hoisted),
    // we need to capture any instance_level_snippets that fragment() would merge to
    // the parent and instead prepend them to the content block body. This ensures
    // snippets like `greet` end up inside the boundary callback.
    let saved_instance_snippets = if use_async && has_const {
        Some(std::mem::take(&mut context.state.instance_level_snippets))
    } else {
        None
    };

    let content_block = fragment(&content_fragment, context, true);

    // Collect any instance-level snippets that were generated inside the boundary
    // content and should stay inside the callback.
    let mut content_body = content_block.body;

    // Non-async: the boundary-level const declarations (visited in the
    // pre-pass) live at the top of the boundary content block (upstream
    // `block.body.unshift(...const_tags)`).
    if !const_tags.is_empty() {
        let mut new_body = const_tags;
        new_body.extend(content_body);
        content_body = new_body;
    }
    if let Some(saved) = saved_instance_snippets {
        // The new instance_level_snippets were added by fragment() merging.
        // Take them and prepend to the boundary callback body.
        let new_snippets: Vec<JsStatement> = context
            .state
            .instance_level_snippets
            .drain(saved.len()..)
            .collect();
        if !new_snippets.is_empty() {
            let mut new_body = new_snippets;
            new_body.extend(content_body);
            content_body = new_body;
        }
    }

    // Build the boundary call: $.boundary(node, props, ($$anchor) => { ... })
    let props_obj = b::object(props);

    let content_fn = b::arrow_block(vec![b::id_pattern("$$anchor")], content_body);

    let boundary_call = b::stmt(
        &context.arena,
        b::call(
            &context.arena,
            b::member_path(&context.arena, "$.boundary"),
            vec![context.state.node.clone(), props_obj, content_fn],
        ),
    );

    // Add a comment node to the template
    context.state.template.push_comment(None);

    // Build final statement with hoisted snippets
    if hoisted_snippets.is_empty() {
        context.state.init.push(boundary_call);
    } else {
        // Wrap in block with hoisted snippets first
        let mut block_body = hoisted_snippets;
        block_body.push(boundary_call);
        context
            .state
            .init
            .push(JsStatement::Block(JsBlockStatement { body: block_body }));
    }
}

/// Extract the name from a snippet expression.
///
/// The expression is expected to be an Identifier node.
fn get_snippet_name(expr: &Expression) -> String {
    if let Some(name) = expr.identifier_name() {
        return name.to_string();
    }
    "snippet".to_string()
}
