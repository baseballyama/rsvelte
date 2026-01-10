//! Visitor functions for printing AST nodes.
//!
//! This module contains visitor functions for each AST node type.
//! Each visitor is responsible for writing the appropriate source code
//! representation to the context.
//!
//! Reference: svelte/packages/svelte/src/compiler/print/index.js (lines 327-890)

use super::Context;
use super::helpers::{
    LINE_BREAK_THRESHOLD, expression_to_string, format_program, is_shorthand_identifier,
    is_void_element,
};
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

        // Add context="module" if it's a module script
        if matches!(module.context, crate::ast::ScriptContext::Module) {
            context.write(" context=\"module\"");
        }

        // Add other attributes (lang, etc.)
        for attr in &module.attributes {
            context.write(" ");
            visit_attribute_node(context, attr);
        }

        context.write(">");

        // Format and write script content
        let crate::ast::js::Expression::Value(program) = &module.content;
        let content = format_program(program);

        if !content.is_empty() {
            context.newline();
            context.indent();
            for line in content.lines() {
                context.write(line);
                context.newline();
            }
            context.dedent();
        }

        context.write("</script>");
        context.newline();
        context.newline();
    }

    // Visit instance script if present
    if let Some(ref instance) = root.instance {
        context.write("<script");

        // Add attributes (lang, etc.)
        for attr in &instance.attributes {
            context.write(" ");
            visit_attribute_node(context, attr);
        }

        context.write(">");

        // Format and write script content
        let crate::ast::js::Expression::Value(program) = &instance.content;
        let content = format_program(program);

        if !content.is_empty() {
            context.newline();
            context.indent();
            for line in content.lines() {
                context.write(line);
                context.newline();
            }
            context.dedent();
        }

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

        // Add attributes (lang, scoped, etc.)
        for attr in &css.attributes {
            context.write(" ");
            visit_json_attribute(context, attr);
        }

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
        TemplateNode::ExpressionTag(expr) => {
            context.write("{");
            context.write(&expression_to_string(&expr.expression));
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
        TemplateNode::HtmlTag(tag) => {
            context.write("{@html ");
            context.write(&expression_to_string(&tag.expression));
            context.write("}");
        }
        TemplateNode::ConstTag(tag) => {
            context.write("{@const ");
            context.write(&expression_to_string(&tag.declaration));
            context.write("}");
        }
        TemplateNode::DebugTag(tag) => {
            context.write("{@debug");
            for (i, ident) in tag.identifiers.iter().enumerate() {
                if i == 0 {
                    context.write(" ");
                } else {
                    context.write(", ");
                }
                context.write(&expression_to_string(ident));
            }
            context.write("}");
        }
        TemplateNode::RenderTag(tag) => {
            context.write("{@render ");
            context.write(&expression_to_string(&tag.expression));
            context.write("}");
        }
        TemplateNode::SvelteComponent(comp) => {
            visit_svelte_component(context, comp);
        }
        TemplateNode::SvelteElement(elem) => {
            visit_svelte_dynamic_element(context, elem);
        }
        TemplateNode::SvelteBody(elem)
        | TemplateNode::SvelteDocument(elem)
        | TemplateNode::SvelteFragment(elem)
        | TemplateNode::SvelteBoundary(elem)
        | TemplateNode::SvelteHead(elem)
        | TemplateNode::SvelteOptions(elem)
        | TemplateNode::SvelteSelf(elem)
        | TemplateNode::SvelteWindow(elem) => {
            visit_svelte_element(context, elem);
        }
        TemplateNode::TitleElement(elem) => {
            context.write("<svelte:title");
            let multiline_attributes = visit_attributes(context, &elem.attributes);
            if elem.fragment.nodes.is_empty() {
                if multiline_attributes {
                    context.write("/>");
                } else {
                    context.write(" />");
                }
            } else {
                context.write(">");
                visit_fragment(context, &elem.fragment);
                context.write("</svelte:title>");
            }
            context.newline();
        }
        TemplateNode::SlotElement(elem) => {
            context.write("<slot");
            let multiline_attributes = visit_attributes(context, &elem.attributes);
            if elem.fragment.nodes.is_empty() {
                if multiline_attributes {
                    context.write("/>");
                } else {
                    context.write(" />");
                }
            } else {
                context.write(">");
                visit_fragment(context, &elem.fragment);
                context.write("</slot>");
            }
            context.newline();
        }
        TemplateNode::AttachTag(tag) => {
            context.write("{@attach ");
            context.write(&expression_to_string(&tag.expression));
            context.write("}");
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

/// Visit an AttributeNode (for script tags).
///
/// # Arguments
///
/// * `context` - The context to write to
/// * `attr` - The attribute node to visit
fn visit_attribute_node(context: &mut Context, attr: &crate::ast::AttributeNode) {
    context.write(attr.name.as_str());
    match &attr.value {
        AttributeValue::True(_) => {
            // Boolean attribute, no value needed
        }
        AttributeValue::Expression(expr) => {
            context.write("={");
            context.write(&expression_to_string(&expr.expression));
            context.write("}");
        }
        AttributeValue::Sequence(parts) => {
            context.write("=\"");
            for part in parts {
                match part {
                    AttributeValuePart::Text(text) => {
                        context.write(&text.raw);
                    }
                    AttributeValuePart::ExpressionTag(expr) => {
                        context.write("{");
                        context.write(&expression_to_string(&expr.expression));
                        context.write("}");
                    }
                }
            }
            context.write("\"");
        }
    }
}

/// Visit a JSON attribute (for style tags).
///
/// # Arguments
///
/// * `context` - The context to write to
/// * `attr` - The attribute as JSON value
fn visit_json_attribute(context: &mut Context, attr: &serde_json::Value) {
    // Extract name and value from JSON
    if let Some(name) = attr.get("name").and_then(|n| n.as_str()) {
        context.write(name);

        // Check if it has a value
        if let Some(value) = attr.get("value") {
            if !value.is_null() && value.as_bool() != Some(true) {
                if let Some(val_str) = value.as_str() {
                    context.write("=\"");
                    context.write(val_str);
                    context.write("\"");
                }
            }
        }
    }
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
            visit_attribute_node(context, attr);
        }
        Attribute::SpreadAttribute(_spread) => {
            context.write("{.../* spread */}");
        }
        Attribute::BindDirective(dir) => {
            context.write("bind:");
            context.write(dir.name.as_str());

            // Shorthand detection: bind:value (expression is Identifier with name === "value")
            if !is_shorthand_identifier(&dir.expression, dir.name.as_str()) {
                context.write("={");
                context.write(&expression_to_string(&dir.expression));
                context.write("}");
            }
        }
        Attribute::OnDirective(dir) => {
            context.write("on:");
            context.write(dir.name.as_str());

            // Modifiers: on:click|preventDefault|stopPropagation
            for modifier in &dir.modifiers {
                context.write("|");
                context.write(modifier.as_str());
            }

            // Shorthand detection
            if let Some(ref expr) = dir.expression
                && !is_shorthand_identifier(expr, dir.name.as_str())
            {
                context.write("={");
                context.write(&expression_to_string(expr));
                context.write("}");
            }
        }
        Attribute::ClassDirective(dir) => {
            context.write("class:");
            context.write(dir.name.as_str());

            if !is_shorthand_identifier(&dir.expression, dir.name.as_str()) {
                context.write("={");
                context.write(&expression_to_string(&dir.expression));
                context.write("}");
            }
        }
        Attribute::StyleDirective(dir) => {
            context.write("style:");
            context.write(dir.name.as_str());

            // Modifiers: style:color|important
            for modifier in &dir.modifiers {
                context.write("|");
                context.write(modifier.as_str());
            }

            match &dir.value {
                AttributeValue::True(_) => {
                    // style:color (shorthand)
                }
                AttributeValue::Expression(expr) => {
                    context.write("={");
                    context.write(&expression_to_string(&expr.expression));
                    context.write("}");
                }
                AttributeValue::Sequence(parts) => {
                    context.write("=\"");
                    for part in parts {
                        match part {
                            AttributeValuePart::Text(text) => context.write(&text.raw),
                            AttributeValuePart::ExpressionTag(expr) => {
                                context.write("{");
                                context.write(&expression_to_string(&expr.expression));
                                context.write("}");
                            }
                        }
                    }
                    context.write("\"");
                }
            }
        }
        Attribute::TransitionDirective(dir) => {
            // intro, outro, or both
            let keyword = if dir.intro && dir.outro {
                "transition"
            } else if dir.intro {
                "in"
            } else {
                "out"
            };

            context.write(keyword);
            context.write(":");
            context.write(dir.name.as_str());

            // Modifiers: transition:fade|local
            for modifier in &dir.modifiers {
                context.write("|");
                context.write(modifier.as_str());
            }

            if let Some(ref expr) = dir.expression
                && !is_shorthand_identifier(expr, dir.name.as_str())
            {
                context.write("={");
                context.write(&expression_to_string(expr));
                context.write("}");
            }
        }
        Attribute::AnimateDirective(dir) => {
            context.write("animate:");
            context.write(dir.name.as_str());

            if let Some(ref expr) = dir.expression
                && !is_shorthand_identifier(expr, dir.name.as_str())
            {
                context.write("={");
                context.write(&expression_to_string(expr));
                context.write("}");
            }
        }
        Attribute::UseDirective(dir) => {
            context.write("use:");
            context.write(dir.name.as_str());

            if let Some(ref expr) = dir.expression
                && !is_shorthand_identifier(expr, dir.name.as_str())
            {
                context.write("={");
                context.write(&expression_to_string(expr));
                context.write("}");
            }
        }
        Attribute::LetDirective(dir) => {
            context.write("let:");
            context.write(dir.name.as_str());

            if let Some(ref expr) = dir.expression
                && !is_shorthand_identifier(expr, dir.name.as_str())
            {
                context.write("={");
                context.write(&expression_to_string(expr));
                context.write("}");
            }
        }
        Attribute::AttachTag(attach) => {
            context.write("{@attach ");
            context.write(&expression_to_string(&attach.expression));
            context.write("}");
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

/// Visit a svelte:component element.
fn visit_svelte_component(context: &mut Context, comp: &crate::ast::SvelteComponentElement) {
    context.write("<svelte:component this={");
    context.write(&expression_to_string(&comp.expression));
    context.write("}");

    let multiline_attributes = visit_attributes(context, &comp.attributes);

    if comp.fragment.nodes.is_empty() {
        if multiline_attributes {
            context.write("/>");
        } else {
            context.write(" />");
        }
    } else {
        context.write(">");
        visit_fragment(context, &comp.fragment);
        context.write("</svelte:component>");
    }

    context.newline();
}

/// Visit a svelte:element (dynamic element).
fn visit_svelte_dynamic_element(context: &mut Context, elem: &crate::ast::SvelteDynamicElement) {
    context.write("<svelte:element this={");
    context.write(&expression_to_string(&elem.tag));
    context.write("}");

    let multiline_attributes = visit_attributes(context, &elem.attributes);

    if elem.fragment.nodes.is_empty() {
        if multiline_attributes {
            context.write("/>");
        } else {
            context.write(" />");
        }
    } else {
        context.write(">");
        visit_fragment(context, &elem.fragment);
        context.write("</svelte:element>");
    }

    context.newline();
}

/// Visit a svelte: special element (body, document, head, window, fragment, boundary, self).
fn visit_svelte_element(context: &mut Context, elem: &crate::ast::SvelteElement) {
    context.write("<");
    context.write(elem.name.as_str());

    let multiline_attributes = visit_attributes(context, &elem.attributes);

    if elem.fragment.nodes.is_empty() {
        if multiline_attributes {
            context.write("/>");
        } else {
            context.write(" />");
        }
    } else {
        context.write(">");
        visit_fragment(context, &elem.fragment);
        context.write("</");
        context.write(elem.name.as_str());
        context.write(">");
    }

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
