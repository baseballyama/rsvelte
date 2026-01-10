//! Visitor functions for printing AST nodes.
//!
//! This module contains visitor functions for each AST node type.
//! Each visitor is responsible for writing the appropriate source code
//! representation to the context.
//!
//! Reference: svelte/packages/svelte/src/compiler/print/index.js (lines 327-890)

use super::Context;
use super::helpers::{LINE_BREAK_THRESHOLD, is_void_element};
use crate::ast::css::StyleSheet;
use crate::ast::{
    Attribute, AttributeValue, AttributeValuePart, Fragment, Root, TemplateNode, Text,
};

/// Visit the root node and generate source code.
///
/// # Arguments
///
/// * `context` - The context to write to
/// * `root` - The root AST node
pub fn visit_root(context: &mut Context, root: &Root) {
    // Visit module script if present
    if let Some(ref module) = root.module {
        context.write("<script");
        if matches!(module.context, crate::ast::ScriptContext::Module) {
            context.write(" context=\"module\"");
        }
        // TODO: Add lang attribute from attributes
        context.write(">");
        context.newline();

        // Write script content
        // TODO: Format using oxc_codegen
        context.write("/* module script content */");
        context.newline();

        context.write("</script>");
        context.newline();
        context.newline();
    }

    // Visit instance script if present
    if let Some(ref _instance) = root.instance {
        context.write("<script");
        // TODO: Add lang attribute from attributes
        context.write(">");
        context.newline();

        // Write script content
        // TODO: Format using oxc_codegen
        context.write("/* instance script content */");
        context.newline();

        context.write("</script>");
        context.newline();
        context.newline();
    }

    // Visit template fragment
    visit_fragment(context, &root.fragment);

    // Visit CSS if present
    if let Some(ref css) = root.css {
        context.newline();
        context.write("<style");
        // TODO: Add lang attribute if needed
        context.write(">");
        context.newline();

        // Write CSS content
        visit_css_stylesheet(context, css);

        context.write("</style>");
        context.newline();
    }
}

/// Visit a fragment and generate its children.
///
/// # Arguments
///
/// * `context` - The context to write to
/// * `fragment` - The fragment node
pub fn visit_fragment(context: &mut Context, fragment: &Fragment) {
    for node in &fragment.nodes {
        visit_template_node(context, node);
    }
}

/// Visit a template node and generate appropriate code.
///
/// # Arguments
///
/// * `context` - The context to write to
/// * `node` - The template node to visit
pub fn visit_template_node(context: &mut Context, node: &TemplateNode) {
    match node {
        TemplateNode::Text(text) => visit_text(context, text),
        TemplateNode::Comment(comment) => {
            context.write("<!--");
            context.write(&comment.data);
            context.write("-->");
        }
        TemplateNode::ExpressionTag(_expr) => {
            context.write("{");
            // TODO: Format expression using oxc_codegen
            context.write("/* expression */");
            context.write("}");
        }
        TemplateNode::RegularElement(element) => {
            visit_regular_element(context, element);
        }
        TemplateNode::Component(component) => {
            visit_component(context, component);
        }
        TemplateNode::IfBlock(if_block) => {
            visit_if_block(context, if_block);
        }
        TemplateNode::EachBlock(each_block) => {
            visit_each_block(context, each_block);
        }
        TemplateNode::AwaitBlock(await_block) => {
            visit_await_block(context, await_block);
        }
        TemplateNode::KeyBlock(key_block) => {
            visit_key_block(context, key_block);
        }
        TemplateNode::SnippetBlock(snippet) => {
            visit_snippet_block(context, snippet);
        }
        // TODO: Implement other node types
        _ => {
            context.write("<!-- TODO: Implement visitor -->");
        }
    }
}

/// Visit a text node.
///
/// # Arguments
///
/// * `context` - The context to write to
/// * `text` - The text node
fn visit_text(context: &mut Context, text: &Text) {
    // Use the raw text to preserve original formatting
    context.write(&text.raw);
}

/// Visit a regular element.
///
/// # Arguments
///
/// * `context` - The context to write to
/// * `element` - The element node
fn visit_regular_element(context: &mut Context, element: &crate::ast::RegularElement) {
    let name = &element.name;

    context.write("<");
    context.write(name.as_str());

    // Write attributes
    let multiline_attributes = visit_attributes(context, &element.attributes);

    let is_void = is_void_element(name.as_str());
    let is_self_closing = is_void || element.fragment.nodes.is_empty();

    if is_self_closing {
        if multiline_attributes {
            context.write("/>");
        } else {
            context.write(" />");
        }
    } else {
        context.write(">");

        // Visit children
        let mut content_context = context.child();
        visit_fragment(&mut content_context, &element.fragment);

        let multiline_content = content_context.measure() > LINE_BREAK_THRESHOLD;

        if multiline_content {
            context.newline();
            if !multiline_attributes && !content_context.multiline {
                context.indent();
            }
            context.append(&content_context);
            if !multiline_attributes && !content_context.multiline {
                context.dedent();
            }
            context.newline();
        } else {
            context.append(&content_context);
        }

        context.write("</");
        context.write(name.as_str());
        context.write(">");
    }

    // Add newline after element if needed
    if multiline_attributes || !is_self_closing {
        context.newline();
    }
}

/// Visit attributes and return whether they were formatted on multiple lines.
///
/// # Arguments
///
/// * `context` - The context to write to
/// * `attributes` - The attributes to visit
///
/// # Returns
///
/// Returns true if attributes were formatted on multiple lines
fn visit_attributes(context: &mut Context, attributes: &[Attribute]) -> bool {
    if attributes.is_empty() {
        return false;
    }

    // Measure total width
    let mut measure_context = context.child();
    for attr in attributes {
        measure_context.write(" ");
        visit_attribute(&mut measure_context, attr);
    }

    let multiline = measure_context.measure() > LINE_BREAK_THRESHOLD;

    if multiline {
        context.indent();
        for attr in attributes {
            context.newline();
            visit_attribute(context, attr);
        }
        context.dedent();
        context.newline();
    } else {
        context.append(&measure_context);
    }

    multiline
}

/// Visit a single attribute.
///
/// # Arguments
///
/// * `context` - The context to write to
/// * `attribute` - The attribute to visit
fn visit_attribute(context: &mut Context, attribute: &Attribute) {
    match attribute {
        Attribute::Attribute(attr) => {
            context.write(attr.name.as_str());
            match &attr.value {
                AttributeValue::True(_) => {
                    // Boolean attribute, no value needed
                }
                AttributeValue::Expression(_expr) => {
                    context.write("={/* expr */}");
                }
                AttributeValue::Sequence(parts) => {
                    context.write("=\"");
                    for part in parts {
                        match part {
                            AttributeValuePart::Text(text) => {
                                context.write(&text.raw);
                            }
                            AttributeValuePart::ExpressionTag(_) => {
                                context.write("{/* expr */}");
                            }
                        }
                    }
                    context.write("\"");
                }
            }
        }
        Attribute::SpreadAttribute(_spread) => {
            context.write("{.../* spread */}");
        }
        Attribute::BindDirective(_bind) => {
            context.write("bind:/* TODO */");
        }
        Attribute::OnDirective(_on) => {
            context.write("on/* TODO */");
        }
        Attribute::ClassDirective(_class) => {
            context.write("class:/* TODO */");
        }
        Attribute::StyleDirective(_style) => {
            context.write("style:/* TODO */");
        }
        Attribute::TransitionDirective(_transition) => {
            context.write("transition:/* TODO */");
        }
        Attribute::AnimateDirective(_animate) => {
            context.write("animate:/* TODO */");
        }
        Attribute::UseDirective(_use_dir) => {
            context.write("use:/* TODO */");
        }
        Attribute::LetDirective(_let_dir) => {
            context.write("let:/* TODO */");
        }
        Attribute::AttachTag(_attach) => {
            context.write("<!-- TODO: AttachTag -->");
        }
    }
}

/// Visit a component.
fn visit_component(context: &mut Context, component: &crate::ast::Component) {
    context.write("<");
    context.write(component.name.as_str());

    let multiline_attributes = visit_attributes(context, &component.attributes);
    let is_self_closing = component.fragment.nodes.is_empty();

    if is_self_closing {
        if multiline_attributes {
            context.write("/>");
        } else {
            context.write(" />");
        }
    } else {
        context.write(">");
        visit_fragment(context, &component.fragment);
        context.write("</");
        context.write(component.name.as_str());
        context.write(">");
    }

    context.newline();
}

/// Visit an if block.
fn visit_if_block(context: &mut Context, if_block: &crate::ast::IfBlock) {
    context.write("{#if ");
    context.write("/* test */");
    context.write("}");
    context.newline();
    visit_fragment(context, &if_block.consequent);

    // Visit elseif and else blocks
    if let Some(ref alternate) = if_block.alternate {
        context.write("{:else}");
        context.newline();
        visit_fragment(context, alternate);
    }

    context.write("{/if}");
    context.newline();
}

/// Visit an each block.
fn visit_each_block(context: &mut Context, each_block: &crate::ast::EachBlock) {
    context.write("{#each ");
    context.write("/* expression */");
    context.write(" as ");
    context.write("/* context */");
    context.write("}");
    context.newline();
    visit_fragment(context, &each_block.body);
    context.write("{/each}");
    context.newline();
}

/// Visit an await block.
fn visit_await_block(context: &mut Context, await_block: &crate::ast::AwaitBlock) {
    context.write("{#await ");
    context.write("/* expression */");
    context.write("}");
    context.newline();
    if let Some(ref pending) = await_block.pending {
        visit_fragment(context, pending);
    }
    context.write("{/await}");
    context.newline();
}

/// Visit a key block.
fn visit_key_block(context: &mut Context, key_block: &crate::ast::KeyBlock) {
    context.write("{#key ");
    context.write("/* expression */");
    context.write("}");
    context.newline();
    visit_fragment(context, &key_block.fragment);
    context.write("{/key}");
    context.newline();
}

/// Visit a snippet block.
fn visit_snippet_block(context: &mut Context, snippet: &crate::ast::SnippetBlock) {
    context.write("{#snippet ");
    // TODO: Format snippet expression properly
    context.write("/* snippet expression */");
    context.write("}");
    context.newline();
    visit_fragment(context, &snippet.body);
    context.write("{/snippet}");
    context.newline();
}

/// Visit a CSS stylesheet and generate CSS code.
///
/// # Arguments
///
/// * `context` - The context to write to
/// * `stylesheet` - The stylesheet node
fn visit_css_stylesheet(context: &mut Context, stylesheet: &StyleSheet) {
    // Visit each child (Rule or Atrule)
    for child in &stylesheet.children {
        super::css_visitors::visit_css_node(context, child);
        context.newline();
    }
}
