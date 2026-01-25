//! Fragment processing utilities for client-side transformation.
//!
//! Corresponds to fragment.js in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/fragment.js`.

use crate::ast::template::{Attribute, ExpressionTag, RegularElement, TemplateNode, Text};
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::build_template_chunk;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;

/// NON_STATIC_PROPERTIES - properties that cannot be set statically
const NON_STATIC_PROPERTIES: &[&str] = &["autofocus", "muted", "defaultValue", "defaultChecked"];

/// Check if a property cannot be set statically.
fn cannot_be_set_statically(name: &str) -> bool {
    NON_STATIC_PROPERTIES.contains(&name)
}

/// Check if node is a custom element.
fn is_custom_element_node(node: &RegularElement) -> bool {
    node.name.contains('-')
        || node.attributes.iter().any(|attr| {
            if let Attribute::Attribute(a) = attr {
                a.name == "is"
            } else {
                false
            }
        })
}

/// Check if attribute is an event attribute.
fn is_event_attribute(attr: &Attribute) -> bool {
    if let Attribute::Attribute(a) = attr {
        a.name.starts_with("on")
    } else {
        false
    }
}

/// Check if attribute is a text attribute (single text value).
fn is_text_attribute(attr: &Attribute) -> bool {
    if let Attribute::Attribute(a) = attr {
        match &a.value {
            crate::ast::template::AttributeValue::Sequence(parts) => {
                parts.len() == 1
                    && matches!(parts[0], crate::ast::template::AttributeValuePart::Text(_))
            }
            _ => false,
        }
    } else {
        false
    }
}

/// Recursively check if any child nodes contain dynamic content or special attributes.
fn has_dynamic_children(nodes: &[TemplateNode]) -> bool {
    for node in nodes {
        match node {
            TemplateNode::ExpressionTag(_) => return true,
            TemplateNode::HtmlTag(_) => return true,
            TemplateNode::RenderTag(_) => return true,
            TemplateNode::IfBlock(_) => return true,
            TemplateNode::EachBlock(_) => return true,
            TemplateNode::AwaitBlock(_) => return true,
            TemplateNode::KeyBlock(_) => return true,
            TemplateNode::SnippetBlock(_) => return true,
            TemplateNode::Component(_) => return true,
            TemplateNode::SvelteComponent(_) => return true,
            TemplateNode::SvelteElement(_) => return true,
            TemplateNode::SvelteSelf(_) => return true,
            TemplateNode::RegularElement(elem) => {
                // Check if this child element has special attributes that need runtime handling
                if is_custom_element_node(elem) {
                    return true;
                }

                // Check for attributes that cannot be set statically (need runtime code)
                // Note: img loading does NOT need runtime code - it can be static in template
                for attr in &elem.attributes {
                    if let Attribute::Attribute(a) = attr {
                        if cannot_be_set_statically(&a.name) {
                            return true;
                        }
                        // option value needs special handling
                        if elem.name == "option" && a.name == "value" {
                            return true;
                        }
                    }
                }

                // Recursively check children
                if has_dynamic_children(&elem.fragment.nodes) {
                    return true;
                }
            }
            _ => {}
        }
    }
    false
}

/// Check if a node is a static element.
///
/// A static element is one that can be rendered in the template without
/// needing any runtime updates.
fn is_static_element(node: &TemplateNode, _state: &ComponentClientTransformState) -> bool {
    match node {
        TemplateNode::RegularElement(elem) => {
            // Dynamic fragment means we can't be static
            if elem.fragment.metadata.dynamic {
                return false;
            }

            // Check if any child is an ExpressionTag (which means dynamic content)
            // This is a workaround for metadata.dynamic not being set correctly in Phase 2
            if has_dynamic_children(&elem.fragment.nodes) {
                return false;
            }

            // Custom elements are not static (we set attributes through properties)
            if is_custom_element_node(elem) {
                return false;
            }

            // Check each attribute
            for attribute in &elem.attributes {
                match attribute {
                    Attribute::Attribute(attr) => {
                        // Event attributes make it non-static
                        if is_event_attribute(attribute) {
                            return false;
                        }

                        // Some properties cannot be set statically
                        if cannot_be_set_statically(&attr.name) {
                            return false;
                        }

                        // dir attribute needs runtime handling
                        if attr.name == "dir" {
                            return false;
                        }

                        // Special handling for input/textarea value and checked
                        if ["input", "textarea"].contains(&elem.name.as_str())
                            && ["value", "checked"].contains(&attr.name.as_str())
                        {
                            return false;
                        }

                        // option value needs runtime handling
                        if elem.name == "option" && attr.name == "value" {
                            return false;
                        }

                        // img loading needs to be applied after appending to DOM
                        if elem.name == "img" && attr.name == "loading" {
                            return false;
                        }

                        // Must be a text attribute or boolean
                        if !matches!(attr.value, crate::ast::template::AttributeValue::True(_))
                            && !is_text_attribute(attribute)
                        {
                            return false;
                        }
                    }
                    // Non-attribute directives make it non-static
                    _ => return false,
                }
            }

            true
        }
        _ => false,
    }
}

/// Processes an array of template nodes, joining sibling text/expression nodes
/// (e.g. `{a} b {c}`) into a single update function. Along the way it creates
/// corresponding template node references these updates are applied to.
///
/// # Arguments
///
/// * `nodes` - The child nodes to process
/// * `initial` - Function to generate anchor expression (argument: is_text)
/// * `is_element` - Whether parent is an element
/// * `context` - Component context
///
/// Corresponds to `process_children` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/fragment.js`.
pub fn process_children<F>(
    nodes: &[TemplateNode],
    initial: F,
    is_element: bool,
    context: &mut ComponentContext,
) where
    F: FnMut(bool) -> JsExpr,
{
    let within_bound_contenteditable = false; // TODO: implement bound_contenteditable tracking
    let mut prev: Box<dyn FnMut(bool) -> JsExpr> = Box::new(initial);
    let mut skipped = 0usize;

    // Sequence of Text/ExpressionTag nodes
    let mut sequence: Vec<TextOrExpr> = Vec::new();

    // Helper: get node with proper sibling navigation
    let get_node = |is_text: bool,
                    prev_fn: &mut Box<dyn FnMut(bool) -> JsExpr>,
                    skip_count: usize|
     -> JsExpr {
        if skip_count == 0 {
            return prev_fn(is_text);
        }

        let prev_expr = prev_fn(false);
        let mut args = vec![prev_expr];

        if is_text || skip_count != 1 {
            args.push(b::number(skip_count as f64));
        }

        if is_text {
            args.push(b::boolean(true));
        }

        b::call(b::member_path("$.sibling"), args)
    };

    // Helper: flush a single node
    let flush_node = |is_text: bool,
                      name: &str,
                      _loc: Option<&str>,
                      prev_fn: &mut Box<dyn FnMut(bool) -> JsExpr>,
                      skip_count: &mut usize,
                      ctx: &mut ComponentContext|
     -> JsExpr {
        let expression = get_node(is_text, prev_fn, *skip_count);
        let id: JsExpr;

        if let JsExpr::Identifier(_) = expression {
            id = expression.clone();
        } else {
            // Generate a unique identifier
            let id_name = ctx.state.memoizer.generate_id(name);
            id = b::id(&id_name);
            ctx.state.init.push(b::var_decl(&id_name, Some(expression)));
        }

        // Update prev to return this id
        let id_for_closure = id.clone();
        *prev_fn = Box::new(move |_is_text: bool| id_for_closure.clone());
        *skip_count = 1; // the next node is `$.sibling(id)`

        id
    };

    // Helper: flush a sequence of Text/ExpressionTag nodes
    let flush_sequence = |seq: Vec<TextOrExpr>,
                          prev_fn: &mut Box<dyn FnMut(bool) -> JsExpr>,
                          skip_count: &mut usize,
                          ctx: &mut ComponentContext| {
        // If all nodes are text, just push to template
        if seq.iter().all(|n| matches!(n, TextOrExpr::Text(_))) {
            *skip_count += 1;
            let text_nodes: Vec<Text> = seq
                .into_iter()
                .filter_map(|n| {
                    if let TextOrExpr::Text(t) = n {
                        Some(t)
                    } else {
                        None
                    }
                })
                .collect();
            ctx.state.template.push_text(text_nodes);
            return;
        }

        // Mixed text/expression sequence - push placeholder
        ctx.state.template.push_text(vec![Text {
            data: " ".into(),
            raw: " ".into(),
            start: 0,
            end: 0,
        }]);

        let result = build_template_chunk(&seq, ctx);

        // is_text is true when the sequence has exactly one element.
        // This is for standalone `{expression}` - in case no text node
        // was created during SSR (empty expression), we need special handling.
        // For multiple expressions like `{a}{b}`, is_text should be false.
        let is_text = seq.len() == 1;
        let id = flush_node(is_text, "text", None, prev_fn, skip_count, ctx);

        let update = b::stmt(b::call(
            b::member_path("$.set_text"),
            vec![id.clone(), result.value.clone()],
        ));

        if result.has_state && !within_bound_contenteditable {
            ctx.state.update.push(update);
        } else {
            ctx.state
                .init
                .push(b::stmt(b::assign(b::member(id, "nodeValue"), result.value)));
        }
    };

    // Main loop
    for node in nodes {
        match node {
            TemplateNode::Text(text) => {
                sequence.push(TextOrExpr::Text(text.clone()));
            }
            TemplateNode::ExpressionTag(expr) => {
                sequence.push(TextOrExpr::Expr(expr.clone()));
            }
            _ => {
                // Flush any pending sequence
                if !sequence.is_empty() {
                    flush_sequence(sequence, &mut prev, &mut skipped, context);
                    sequence = Vec::new();
                }

                if is_static_element(node, &context.state) {
                    // Push the static element to the template
                    push_static_element_to_template(node, &mut context.state.template);
                    skipped += 1;
                } else if let TemplateNode::EachBlock(each) = node {
                    // Special case: single EachBlock in element can be controlled
                    if nodes.len() == 1 && is_element && !each.metadata.expression.is_async() {
                        // Mark as controlled (would need to modify node, skipping for now)
                        // each.metadata.is_controlled = true;
                        // Visit without changing node
                        let result = context.visit_node(node, None);
                        // Add the result to init if it's a statement or block
                        match result {
                            crate::compiler::phases::phase3_transform::client::types::TransformResult::Statement(stmt) => {
                                context.state.init.push(stmt);
                            }
                            crate::compiler::phases::phase3_transform::client::types::TransformResult::Block(block) => {
                                context.state.init.push(JsStatement::Block(block));
                            }
                            _ => {}
                        }
                    } else {
                        let name = "node";
                        let id = flush_node(false, name, None, &mut prev, &mut skipped, context);
                        // Save original node and temporarily replace it
                        let saved_node = std::mem::replace(&mut context.state.node, id);
                        let result = context.visit_node(node, None);
                        // Add the result to init if it's a statement or block
                        match result {
                            crate::compiler::phases::phase3_transform::client::types::TransformResult::Statement(stmt) => {
                                context.state.init.push(stmt);
                            }
                            crate::compiler::phases::phase3_transform::client::types::TransformResult::Block(block) => {
                                context.state.init.push(JsStatement::Block(block));
                            }
                            _ => {}
                        }
                        context.state.node = saved_node;
                    }
                } else {
                    // Get node name for identifier
                    let name = if let TemplateNode::RegularElement(elem) = node {
                        elem.name.as_str()
                    } else {
                        "node"
                    };

                    let id = flush_node(false, name, None, &mut prev, &mut skipped, context);
                    // Save original node and temporarily replace it
                    let saved_node = std::mem::replace(&mut context.state.node, id);
                    let result = context.visit_node(node, None);
                    // Add the result to init if it's a statement or block
                    match result {
                        crate::compiler::phases::phase3_transform::client::types::TransformResult::Statement(stmt) => {
                            context.state.init.push(stmt);
                        }
                        crate::compiler::phases::phase3_transform::client::types::TransformResult::Block(block) => {
                            context.state.init.push(JsStatement::Block(block));
                        }
                        _ => {}
                    }
                    context.state.node = saved_node;
                }
            }
        }
    }

    // Flush any remaining sequence
    if !sequence.is_empty() {
        flush_sequence(sequence, &mut prev, &mut skipped, context);
    }

    // If there are trailing static text nodes/elements, traverse to the last one
    if skipped > 1 {
        skipped -= 1;
        let mut args = vec![];
        if skipped != 1 {
            args.push(b::number(skipped as f64));
        }
        context
            .state
            .init
            .push(b::stmt(b::call(b::member_path("$.next"), args)));
    }
}

/// Helper enum for Text or ExpressionTag sequences.
#[derive(Debug, Clone)]
pub enum TextOrExpr {
    Text(Text),
    Expr(ExpressionTag),
}

/// Push a static element and its children to the template.
fn push_static_element_to_template(node: &TemplateNode, template: &mut Template) {
    match node {
        TemplateNode::RegularElement(elem) => {
            // Push the element opening tag
            template.push_element(elem.name.to_string(), elem.start);

            // Add attributes
            for attr in &elem.attributes {
                if let Attribute::Attribute(a) = attr {
                    let value = match &a.value {
                        crate::ast::template::AttributeValue::True(_) => None,
                        crate::ast::template::AttributeValue::Sequence(parts) => {
                            let mut val = String::new();
                            for part in parts {
                                if let crate::ast::template::AttributeValuePart::Text(t) = part {
                                    val.push_str(&t.data);
                                }
                            }
                            Some(val)
                        }
                        _ => None,
                    };
                    template.set_prop(a.name.to_string(), value);
                }
            }

            // Recursively add children
            for child in &elem.fragment.nodes {
                push_static_element_to_template(child, template);
            }

            // Close the element
            template.pop_element();
        }
        TemplateNode::Text(text) => {
            template.push_text(vec![text.clone()]);
        }
        TemplateNode::Comment(comment) => {
            template.push_comment(Some(comment.data.to_string()));
        }
        _ => {}
    }
}

use crate::compiler::phases::phase3_transform::client::transform_template::template::Template;
