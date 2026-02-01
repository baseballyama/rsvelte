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
    let mut started = false;

    // Visit svelte:options if present
    if let Some(ref options) = root.options {
        context.write("<svelte:options");

        for attr in &options.attributes {
            context.write(" ");
            visit_attribute_node(context, attr);
        }

        context.write(" />");
        started = true;
    }

    // Visit module script if present
    if let Some(ref module) = root.module {
        if started {
            context.newline();
            context.newline();
        }

        visit_script(context, module);
        started = true;
    }

    // Visit instance script if present
    if let Some(ref instance) = root.instance {
        if started {
            context.newline();
            context.newline();
        }

        visit_script(context, instance);
        started = true;
    }

    // Visit template fragment
    if !root.fragment.nodes.is_empty() {
        if started {
            context.newline();
            context.newline();
        }
        visit_fragment(context, &root.fragment);
        started = true;
    }

    // Visit CSS if present
    if let Some(ref css) = root.css {
        if started {
            context.newline();
            context.newline();
        }
        visit_css_stylesheet(context, css);
    }
}

/// Visit a script node.
fn visit_script(context: &mut Context, script: &crate::ast::Script) {
    context.write("<script");

    // Visit attributes using the Svelte attributes function
    visit_script_attributes(&script.attributes, context);

    context.write(">");

    // Format and write script content using block()
    let crate::ast::js::Expression::Value(program) = &script.content;
    let content = format_program(program);

    if !content.is_empty() {
        context.indent();
        context.newline();

        for line in content.lines() {
            context.write(line);
            context.newline();
        }

        context.dedent();
    }

    context.write("</script>");
}

/// Visit script attributes.
fn visit_script_attributes(attributes: &[crate::ast::AttributeNode], context: &mut Context) {
    if attributes.is_empty() {
        return;
    }

    // Measure total width of all attributes when rendered inline
    let mut child_context = context.child();

    for attr in attributes {
        child_context.write(" ");
        visit_attribute_node(&mut child_context, attr);
    }

    let multiline = child_context.measure() > LINE_BREAK_THRESHOLD;

    if multiline {
        context.indent();
        for attr in attributes {
            context.newline();
            visit_attribute_node(context, attr);
        }
        context.dedent();
        context.newline();
    } else {
        context.append(&child_context);
    }
}

/// Visit a fragment and generate its children.
///
/// This implements the Fragment visitor from the official Svelte printer,
/// which handles whitespace normalization and determines line breaks.
///
/// # Arguments
///
/// * `context` - The context to write to
/// * `fragment` - The fragment node
pub fn visit_fragment(context: &mut Context, fragment: &Fragment) {
    // Group nodes into sequences separated by whitespace
    let mut items: Vec<Vec<ProcessedNode>> = Vec::new();
    let mut sequence: Vec<ProcessedNode> = Vec::new();

    let nodes = &fragment.nodes;
    let num_nodes = nodes.len();

    for i in 0..num_nodes {
        let child_node = &nodes[i];

        if let TemplateNode::Text(text) = child_node {
            // Normalize whitespace in text
            let mut data = normalize_whitespace(&text.data);

            // Trim at fragment start
            if i == 0 {
                data = data.trim_start().to_string();
            }

            // Trim at fragment end
            if i == num_nodes - 1 {
                data = data.trim_end().to_string();
            }

            if data.is_empty() {
                continue;
            }

            let prev = if i > 0 { Some(&nodes[i - 1]) } else { None };
            let next = if i + 1 < num_nodes {
                Some(&nodes[i + 1])
            } else {
                None
            };

            // If data starts with space and prev is not ExpressionTag, flush
            if data.starts_with(' ') && prev.is_some() && !is_expression_tag(prev) {
                if !sequence.is_empty() {
                    items.push(sequence);
                    sequence = Vec::new();
                }
                data = data.trim_start().to_string();
            }

            if !data.is_empty() {
                sequence.push(ProcessedNode::Text(data.clone()));

                // If data ends with space and next is not ExpressionTag, flush
                if data.ends_with(' ') && next.is_some() && !is_expression_tag(next) {
                    items.push(sequence);
                    sequence = Vec::new();
                }
            }
        } else {
            sequence.push(ProcessedNode::Node(child_node));
        }
    }

    if !sequence.is_empty() {
        items.push(sequence);
    }

    // Measure and create child contexts
    let mut multiline = false;
    let mut width = 0;

    let child_contexts: Vec<Context> = items
        .iter()
        .map(|seq| {
            let mut child_context = context.child();

            for node in seq {
                match node {
                    ProcessedNode::Text(data) => {
                        child_context.write(data);
                    }
                    ProcessedNode::Node(n) => {
                        visit_template_node(&mut child_context, n);
                    }
                }
                multiline = multiline || child_context.multiline;
            }

            width += child_context.measure();
            child_context
        })
        .collect();

    multiline = multiline || width > LINE_BREAK_THRESHOLD;

    // Output child contexts with appropriate line breaks
    for i in 0..child_contexts.len() {
        let prev = &child_contexts[i];
        let next = if i + 1 < child_contexts.len() {
            Some(&child_contexts[i + 1])
        } else {
            None
        };

        context.append(prev);

        if let Some(next_ctx) = next {
            if prev.multiline || next_ctx.multiline {
                context.newline();
                context.newline();
            } else if multiline {
                context.newline();
            }
        }
    }
}

/// Helper enum for processed nodes in fragment
enum ProcessedNode<'a> {
    Text(String),
    Node(&'a TemplateNode),
}

/// Normalize whitespace in a string (replace sequences of whitespace with single space)
fn normalize_whitespace(s: &str) -> String {
    let mut result = String::new();
    let mut prev_was_whitespace = false;

    for c in s.chars() {
        if c.is_whitespace() {
            if !prev_was_whitespace {
                result.push(' ');
                prev_was_whitespace = true;
            }
        } else {
            result.push(c);
            prev_was_whitespace = false;
        }
    }

    result
}

/// Check if a node is an ExpressionTag
fn is_expression_tag(node: Option<&TemplateNode>) -> bool {
    matches!(node, Some(TemplateNode::ExpressionTag(_)))
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
            visit_base_element(
                context,
                "title",
                &elem.attributes,
                &elem.fragment,
                None,
                false,
            );
        }
        TemplateNode::SlotElement(elem) => {
            visit_base_element(
                context,
                "slot",
                &elem.attributes,
                &elem.fragment,
                None,
                false,
            );
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
    // Use data (official printer uses data, not raw)
    context.write(&text.data);
}

/// Visit a regular element using the base_element logic.
///
/// # Arguments
///
/// * `context` - The context to write to
/// * `element` - The element node
fn visit_regular_element(context: &mut Context, element: &crate::ast::RegularElement) {
    visit_base_element(
        context,
        element.name.as_str(),
        &element.attributes,
        &element.fragment,
        None,
        false,
    );
}

/// Base element visitor that handles the common logic for all element types.
/// This follows the official Svelte printer's base_element function.
fn visit_base_element(
    context: &mut Context,
    name: &str,
    attributes: &[Attribute],
    fragment: &Fragment,
    this_expr: Option<&crate::ast::js::Expression>,
    is_component: bool,
) {
    let mut child_context = context.child();

    child_context.write("<");
    child_context.write(name);

    // Handle 'this' attribute for svelte:component and svelte:element
    if let Some(expr) = this_expr {
        child_context.write(" this={");
        child_context.write(&expression_to_string(expr));
        child_context.write("}");
    }

    let multiline_attributes = visit_attributes(&mut child_context, attributes);
    let is_doctype_node = name.to_lowercase() == "!doctype";
    let is_void = is_void_element(name);
    let is_self_closing = is_void || (is_component && fragment.nodes.is_empty());
    let mut multiline_content = false;

    if is_doctype_node {
        child_context.write(">");
    } else if is_self_closing {
        if multiline_attributes {
            child_context.write("/>");
        } else {
            child_context.write(" />");
        }
    } else {
        child_context.write(">");

        // Process the element's content in a separate context for measurement
        let mut content_context = child_context.child();
        let allow_inline_content = child_context.measure() < LINE_BREAK_THRESHOLD;
        block(&mut content_context, fragment, allow_inline_content);

        // Determine if content should be formatted on multiple lines
        multiline_content = content_context.measure() > LINE_BREAK_THRESHOLD;

        if multiline_content {
            child_context.newline();

            // Only indent if attributes are inline and content itself isn't already multiline
            let should_indent = !multiline_attributes && !content_context.multiline;
            if should_indent {
                child_context.indent();
            }

            child_context.append(&content_context);

            if should_indent {
                child_context.dedent();
            }

            child_context.newline();
        } else {
            child_context.append(&content_context);
        }

        child_context.write("</");
        child_context.write(name);
        child_context.write(">");
    }

    let break_line_after = child_context.measure() > LINE_BREAK_THRESHOLD;

    if (multiline_content || multiline_attributes) && !context.empty() {
        context.newline();
    }

    context.append(&child_context);

    if is_self_closing {
        return;
    }
    if multiline_content || multiline_attributes || break_line_after {
        context.newline();
    }
}

/// Block helper function - processes content and handles inline vs multiline formatting.
fn block(context: &mut Context, fragment: &Fragment, allow_inline: bool) {
    let mut child_context = context.child();
    visit_fragment(&mut child_context, fragment);

    if child_context.empty() {
        return;
    }

    if allow_inline && !child_context.multiline {
        context.append(&child_context);
    } else {
        context.indent();
        context.newline();
        context.append(&child_context);
        context.dedent();
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
        if let Some(value) = attr.get("value")
            && !value.is_null()
            && value.as_bool() != Some(true)
            && let Some(val_str) = value.as_str()
        {
            context.write("=\"");
            context.write(val_str);
            context.write("\"");
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
        Attribute::SpreadAttribute(spread) => {
            context.write("{...");
            context.write(&expression_to_string(&spread.expression));
            context.write("}");
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
    visit_base_element(
        context,
        component.name.as_str(),
        &component.attributes,
        &component.fragment,
        None,
        true, // is_component = true means empty fragment = self-closing
    );
}

/// Visit an if block.
fn visit_if_block(context: &mut Context, if_block: &crate::ast::IfBlock) {
    if if_block.elseif {
        context.write("{:else if ");
        context.write(&expression_to_string(&if_block.test));
        context.write("}");

        block(context, &if_block.consequent, false);
    } else {
        context.write("{#if ");
        context.write(&expression_to_string(&if_block.test));
        context.write("}");

        block(context, &if_block.consequent, false);
    }

    // Visit alternate (else/elseif)
    if let Some(ref alternate) = if_block.alternate {
        // Check if alternate is a single elseif block
        let is_elseif = alternate.nodes.len() == 1
            && matches!(&alternate.nodes[0], TemplateNode::IfBlock(ib) if ib.elseif);

        if is_elseif {
            // Just visit the elseif block directly
            visit_fragment(context, alternate);
        } else {
            context.write("{:else}");
            block(context, alternate, false);
        }
    }

    if !if_block.elseif {
        context.write("{/if}");
    }
}

/// Visit an each block.
fn visit_each_block(context: &mut Context, each_block: &crate::ast::EachBlock) {
    context.write("{#each ");
    context.write(&expression_to_string(&each_block.expression));

    if let Some(ref ctx_pattern) = each_block.context {
        context.write(" as ");
        context.write(&expression_to_string(ctx_pattern));
    }

    if let Some(ref index) = each_block.index {
        context.write(", ");
        context.write(index.as_str());
    }

    if let Some(ref key) = each_block.key {
        context.write(" (");
        context.write(&expression_to_string(key));
        context.write(")");
    }

    context.write("}");

    block(context, &each_block.body, false);

    if let Some(ref fallback) = each_block.fallback {
        context.write("{:else}");
        block(context, fallback, false);
    }

    context.write("{/each}");
}

/// Visit an await block.
fn visit_await_block(context: &mut Context, await_block: &crate::ast::AwaitBlock) {
    context.write("{#await ");
    context.write(&expression_to_string(&await_block.expression));

    if await_block.pending.is_some() {
        context.write("}");
        if let Some(ref pending) = await_block.pending {
            block(context, pending, false);
        }
        context.write("{:");
    } else {
        context.write(" ");
    }

    if let Some(ref then_block) = await_block.then {
        if await_block.value.is_some() {
            context.write("then ");
            if let Some(ref value) = await_block.value {
                context.write(&expression_to_string(value));
            }
        } else {
            context.write("then");
        }
        context.write("}");

        block(context, then_block, false);

        if await_block.catch.is_some() {
            context.write("{:");
        }
    }

    if let Some(ref catch_block) = await_block.catch {
        if await_block.error.is_some() {
            context.write("catch ");
            if let Some(ref error) = await_block.error {
                context.write(&expression_to_string(error));
            }
        } else {
            context.write("catch");
        }
        context.write("}");

        block(context, catch_block, false);
    }

    context.write("{/await}");
}

/// Visit a key block.
fn visit_key_block(context: &mut Context, key_block: &crate::ast::KeyBlock) {
    context.write("{#key ");
    context.write(&expression_to_string(&key_block.expression));
    context.write("}");
    block(context, &key_block.fragment, false);
    context.write("{/key}");
}

/// Visit a snippet block.
fn visit_snippet_block(context: &mut Context, snippet: &crate::ast::SnippetBlock) {
    context.write("{#snippet ");
    context.write(&expression_to_string(&snippet.expression));

    if let Some(ref type_params) = snippet.type_params {
        context.write("<");
        context.write(type_params.as_str());
        context.write(">");
    }

    context.write("(");

    for (i, param) in snippet.parameters.iter().enumerate() {
        if i > 0 {
            context.write(", ");
        }
        context.write(&expression_to_string(param));
    }

    context.write(")}");
    block(context, &snippet.body, false);
    context.write("{/snippet}");
}

/// Visit a svelte:component element.
fn visit_svelte_component(context: &mut Context, comp: &crate::ast::SvelteComponentElement) {
    let mut child_context = context.child();

    child_context.write("<svelte:component this={");
    child_context.write(&expression_to_string(&comp.expression));
    child_context.write("}");

    let multiline_attributes = visit_attributes(&mut child_context, &comp.attributes);

    if comp.fragment.nodes.is_empty() {
        if multiline_attributes {
            child_context.write("/>");
        } else {
            child_context.write(" />");
        }
    } else {
        child_context.write(">");
        block(&mut child_context, &comp.fragment, true);
        child_context.write("</svelte:component>");
    }

    context.append(&child_context);
}

/// Visit a svelte:element (dynamic element).
fn visit_svelte_dynamic_element(context: &mut Context, elem: &crate::ast::SvelteDynamicElement) {
    let mut child_context = context.child();

    child_context.write("<svelte:element this={");
    child_context.write(&expression_to_string(&elem.tag));
    child_context.write("}");

    let multiline_attributes = visit_attributes(&mut child_context, &elem.attributes);

    if elem.fragment.nodes.is_empty() {
        if multiline_attributes {
            child_context.write("/>");
        } else {
            child_context.write(" />");
        }
    } else {
        child_context.write(">");
        block(&mut child_context, &elem.fragment, false);
        child_context.write("</svelte:element>");
    }

    context.append(&child_context);
}

/// Visit a svelte: special element (body, document, head, window, fragment, boundary, self).
fn visit_svelte_element(context: &mut Context, elem: &crate::ast::SvelteElement) {
    visit_base_element(
        context,
        elem.name.as_str(),
        &elem.attributes,
        &elem.fragment,
        None,
        false, // not a component, so uses normal void/empty logic
    );
}

/// Visit a CSS stylesheet and generate CSS code.
///
/// # Arguments
///
/// * `context` - The context to write to
/// * `stylesheet` - The stylesheet node
fn visit_css_stylesheet(context: &mut Context, stylesheet: &StyleSheet) {
    context.write("<style");

    // Add attributes (lang, scoped, etc.)
    for attr in &stylesheet.attributes {
        context.write(" ");
        visit_json_attribute(context, attr);
    }

    context.write(">");

    if !stylesheet.children.is_empty() {
        context.indent();
        context.newline();

        let mut started = false;

        for child in &stylesheet.children {
            if started {
                context.newline();
                context.newline();
            }

            super::css_visitors::visit_css_node(context, child);
            started = true;
        }

        context.dedent();
        context.newline();
    }

    context.write("</style>");
}
