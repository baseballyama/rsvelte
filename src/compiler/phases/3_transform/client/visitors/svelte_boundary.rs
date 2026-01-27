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

            // Check for expression in Sequence
            if let AttributeValue::Sequence(parts) = &attr.value
                && let Some(AttributeValuePart::ExpressionTag(expr_tag)) = parts.first()
            {
                let expression = convert_expression(&expr_tag.expression, context);

                // Add as property
                props.push(JsObjectMember::Property(JsProperty {
                    key: JsPropertyKey::Identifier(attr.name.to_string()),
                    value: Box::new(expression),
                    kind: JsPropertyKind::Init,
                    computed: false,
                    shorthand: false,
                }));
            }

            // Check for direct expression value
            if let AttributeValue::Expression(expr_tag) = &attr.value {
                let expression = convert_expression(&expr_tag.expression, context);

                props.push(JsObjectMember::Property(JsProperty {
                    key: JsPropertyKey::Identifier(attr.name.to_string()),
                    value: Box::new(expression),
                    kind: JsPropertyKind::Init,
                    computed: false,
                    shorthand: false,
                }));
            }
        }
    }

    // Collect nodes for the boundary content
    let mut content_nodes: Vec<TemplateNode> = Vec::new();
    let mut hoisted_snippets: Vec<JsStatement> = Vec::new();

    // Process fragment children
    for child in &node.fragment.nodes {
        match child {
            TemplateNode::ConstTag(_) => {
                // Const tags are processed inline
                content_nodes.push(child.clone());
            }
            TemplateNode::SnippetBlock(snippet) => {
                // Check if this is a special boundary snippet (failed, pending)
                let snippet_name = get_snippet_name(&snippet.expression);
                if snippet_name == "failed" || snippet_name == "pending" {
                    // Process the snippet and hoist it
                    // Since snippet_block uses place_snippet_declaration which checks path length,
                    // we capture from all possible snippet locations
                    let saved_init = std::mem::take(&mut context.state.init);
                    let saved_instance = std::mem::take(&mut context.state.instance_level_snippets);
                    let saved_module = std::mem::take(&mut context.state.module_level_snippets);

                    snippet_block(snippet, context);

                    // Get the generated statement(s) from any of the snippet locations
                    let mut snippet_stmts = std::mem::take(&mut context.state.init);
                    snippet_stmts
                        .extend(std::mem::take(&mut context.state.instance_level_snippets));
                    snippet_stmts.extend(std::mem::take(&mut context.state.module_level_snippets));
                    context.state.init = saved_init;
                    context.state.instance_level_snippets = saved_instance;
                    context.state.module_level_snippets = saved_module;

                    hoisted_snippets.extend(snippet_stmts);

                    // Add to props with shorthand: { pending }
                    props.push(JsObjectMember::Property(JsProperty {
                        key: JsPropertyKey::Identifier(snippet_name.clone()),
                        value: Box::new(b::id(&snippet_name)),
                        kind: JsPropertyKind::Init,
                        computed: false,
                        shorthand: true,
                    }));
                } else {
                    // Regular snippet, include in content
                    content_nodes.push(child.clone());
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
    let content_block = fragment(&content_fragment, context);

    // Build the boundary call: $.boundary(node, props, ($$anchor) => { ... })
    let props_obj = b::object(props);

    let content_fn = b::arrow_block(vec![b::id_pattern("$$anchor")], content_block.body);

    let boundary_call = b::stmt(b::call(
        b::member_path("$.boundary"),
        vec![context.state.node.clone(), props_obj, content_fn],
    ));

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
    let Expression::Value(val) = expr;
    if let serde_json::Value::Object(obj) = val
        && obj.get("type").and_then(|v| v.as_str()) == Some("Identifier")
        && let Some(name) = obj.get("name").and_then(|v| v.as_str())
    {
        return name.to_string();
    }
    "snippet".to_string()
}
