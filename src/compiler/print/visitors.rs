//! Visitor functions for printing AST nodes.
//!
//! This module contains visitor functions for each AST node type.
//! Each visitor is responsible for writing the appropriate source code
//! representation to the context.
//!
//! Reference: svelte/packages/svelte/src/compiler/print/index.js (lines 327-890)

use super::Context;
use super::helpers::{
    LINE_BREAK_THRESHOLD, format_program, format_program_from_source,
    format_variable_declaration_from_source, is_shorthand_identifier, is_void_element,
    source_expression_to_string,
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
    // Visit svelte:options if present
    if let Some(ref options) = root.options {
        context.write("<svelte:options");

        for attr in &options.attributes {
            context.write(" ");
            visit_attribute_node(context, attr);
        }

        context.write(" />");
    }

    // Iterate through [module, instance, fragment, css] like the official
    let mut started = root.options.is_some();

    if let Some(ref module) = root.module {
        if started {
            context.margin();
            context.newline();
        }
        visit_script(context, module);
        started = true;
    }

    if let Some(ref instance) = root.instance {
        if started {
            context.margin();
            context.newline();
        }
        visit_script(context, instance);
        started = true;
    }

    // Always visit fragment (even if empty), matching the official behavior
    // which iterates [module, instance, fragment, css] and visits all non-null items.
    {
        if started {
            context.margin();
            context.newline();
        }
        visit_fragment(context, &root.fragment);
        started = true;
    }

    if let Some(ref css) = root.css {
        if started {
            context.margin();
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

    // Format and write script content.
    // Use source text for faithful reproduction when available.
    let content = if let Some(source) = context.source {
        format_program_from_source(&script.content, source)
    } else {
        let program = script.content.as_json();
        format_program(&program)
    };

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
/// which handles whitespace normalization, block element separation,
/// and determines line breaks.
///
/// # Arguments
///
/// * `context` - The context to write to
/// * `fragment` - The fragment node
pub fn visit_fragment(context: &mut Context, fragment: &Fragment) {
    // Group nodes into sequences separated by whitespace and block elements
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
                    items.push(std::mem::take(&mut sequence));
                }
                data = data.trim_start().to_string();
            }

            if !data.is_empty() {
                sequence.push(ProcessedNode::Text(data.clone()));

                // If data ends with space and next is not ExpressionTag, flush
                if data.ends_with(' ') && next.is_some() && !is_expression_tag(next) {
                    items.push(std::mem::take(&mut sequence));
                }
            }
        } else {
            // Check if this is a block element
            let is_block = is_block_element(child_node);

            if is_block && !sequence.is_empty() {
                items.push(std::mem::take(&mut sequence));
            }

            sequence.push(ProcessedNode::Node(child_node));

            if is_block {
                items.push(std::mem::take(&mut sequence));
            }
        }
    }

    items.push(sequence);

    // Filter out empty sequences and measure
    let mut multiline = false;
    let mut width = 0;

    let child_contexts: Vec<Context> = items
        .iter()
        .filter(|seq| !seq.is_empty())
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
                context.margin();
                context.newline();
            } else if multiline {
                context.newline();
            }
        }
    }
}

/// Check if a template node is a "block element" that should get its own sequence.
/// Matches the official Svelte printer's is_block_element logic.
fn is_block_element(node: &TemplateNode) -> bool {
    matches!(
        node,
        TemplateNode::RegularElement(_)
            | TemplateNode::Component(_)
            | TemplateNode::SvelteHead(_)
            | TemplateNode::SvelteFragment(_)
            | TemplateNode::SvelteBoundary(_)
            | TemplateNode::SvelteDocument(_)
            | TemplateNode::SvelteSelf(_)
            | TemplateNode::SvelteWindow(_)
            | TemplateNode::SvelteComponent(_)
            | TemplateNode::SvelteElement(_)
            | TemplateNode::SlotElement(_)
            | TemplateNode::TitleElement(_)
    )
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
    let source = context.source;
    match node {
        TemplateNode::Text(text) => visit_text(context, text),
        TemplateNode::Comment(comment) => {
            context.write("<!--");
            context.write(&comment.data);
            context.write("-->");
        }
        TemplateNode::ExpressionTag(expr) => {
            context.write("{");
            context.write(&source_expression_to_string(&expr.expression, source));
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
            context.write(&source_expression_to_string(&tag.expression, source));
            context.write("}");
        }
        TemplateNode::ConstTag(tag) => {
            // Official: context.write('{@'); context.visit(node.declaration); context.write('}');
            // The declaration is a VariableDeclaration. In Svelte's AST, the span
            // doesn't include 'const' keyword. We need to generate "const x = expr;"
            // from the AST structure.
            context.write("{@");
            context.write(&format_variable_declaration_from_source(
                &tag.declaration,
                source,
            ));
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
                context.write(&source_expression_to_string(ident, source));
            }
            context.write("}");
        }
        TemplateNode::RenderTag(tag) => {
            context.write("{@render ");
            context.write(&source_expression_to_string(&tag.expression, source));
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
            context.write(&source_expression_to_string(&tag.expression, source));
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
///
/// The official implementation is simple:
/// 1. Write to a child context
/// 2. Call block() for content with allow_inline=true
/// 3. Append to parent context
///
/// No extra newlines before or after.
fn visit_base_element(
    context: &mut Context,
    name: &str,
    attributes: &[Attribute],
    fragment: &Fragment,
    this_expr: Option<&crate::ast::js::Expression>,
    is_component: bool,
) {
    let source = context.source;
    let mut child_context = context.child();

    child_context.write("<");
    child_context.write(name);

    // Handle 'this' attribute for svelte:component and svelte:element
    if let Some(expr) = this_expr {
        child_context.write(" this={");
        child_context.write(&source_expression_to_string(expr, source));
        child_context.write("}");
    }

    let multiline_attributes = visit_attributes(&mut child_context, attributes);
    let is_doctype_node = name.to_lowercase() == "!doctype";
    let is_void = is_void_element(name);
    let is_self_closing = is_void || (is_component && fragment.nodes.is_empty());

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
        block(&mut child_context, fragment, true);
        child_context.write("</");
        child_context.write(name);
        child_context.write(">");
    }

    context.append(&child_context);
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
    let source = context.source;
    context.write(attr.name.as_str());
    match &attr.value {
        AttributeValue::True(_) => {
            // Boolean attribute, no value needed
        }
        AttributeValue::Expression(expr) => {
            context.write("={");
            context.write(&source_expression_to_string(&expr.expression, source));
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
                        context.write(&source_expression_to_string(&expr.expression, source));
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
    let source = context.source;
    match attribute {
        Attribute::Attribute(attr) => {
            visit_attribute_node(context, attr);
        }
        Attribute::SpreadAttribute(spread) => {
            context.write("{...");
            context.write(&source_expression_to_string(&spread.expression, source));
            context.write("}");
        }
        Attribute::BindDirective(dir) => {
            context.write("bind:");
            context.write(dir.name.as_str());

            // Shorthand detection: bind:value (expression is Identifier with name === "value")
            if !is_shorthand_identifier(&dir.expression, dir.name.as_str()) {
                context.write("={");
                context.write(&source_expression_to_string(&dir.expression, source));
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
                context.write(&source_expression_to_string(expr, source));
                context.write("}");
            }
        }
        Attribute::ClassDirective(dir) => {
            context.write("class:");
            context.write(dir.name.as_str());

            if !is_shorthand_identifier(&dir.expression, dir.name.as_str()) {
                context.write("={");
                context.write(&source_expression_to_string(&dir.expression, source));
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
                    context.write(&source_expression_to_string(&expr.expression, source));
                    context.write("}");
                }
                AttributeValue::Sequence(parts) => {
                    context.write("=\"");
                    for part in parts {
                        match part {
                            AttributeValuePart::Text(text) => context.write(&text.raw),
                            AttributeValuePart::ExpressionTag(expr) => {
                                context.write("{");
                                context
                                    .write(&source_expression_to_string(&expr.expression, source));
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
                context.write(&source_expression_to_string(expr, source));
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
                context.write(&source_expression_to_string(expr, source));
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
                context.write(&source_expression_to_string(expr, source));
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
                context.write(&source_expression_to_string(expr, source));
                context.write("}");
            }
        }
        Attribute::AttachTag(attach) => {
            context.write("{@attach ");
            context.write(&source_expression_to_string(&attach.expression, source));
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
    let source = context.source;
    if if_block.elseif {
        context.write("{:else if ");
        context.write(&source_expression_to_string(&if_block.test, source));
        context.write("}");

        block(context, &if_block.consequent, false);
    } else {
        context.write("{#if ");
        context.write(&source_expression_to_string(&if_block.test, source));
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
    let source = context.source;
    context.write("{#each ");
    context.write(&source_expression_to_string(&each_block.expression, source));

    if let Some(ref ctx_pattern) = each_block.context {
        context.write(" as ");
        context.write(&source_expression_to_string(ctx_pattern, source));
    }

    if let Some(ref index) = each_block.index {
        context.write(", ");
        context.write(index.as_str());
    }

    if let Some(ref key) = each_block.key {
        context.write(" (");
        context.write(&source_expression_to_string(key, source));
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
    let source = context.source;
    context.write("{#await ");
    context.write(&source_expression_to_string(
        &await_block.expression,
        source,
    ));

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
                context.write(&source_expression_to_string(value, source));
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
                context.write(&source_expression_to_string(error, source));
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
    let source = context.source;
    context.write("{#key ");
    context.write(&source_expression_to_string(&key_block.expression, source));
    context.write("}");
    block(context, &key_block.fragment, false);
    context.write("{/key}");
}

/// Visit a snippet block.
fn visit_snippet_block(context: &mut Context, snippet: &crate::ast::SnippetBlock) {
    let source = context.source;
    context.write("{#snippet ");
    context.write(&source_expression_to_string(&snippet.expression, source));

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
        context.write(&source_expression_to_string(param, source));
    }

    context.write(")}");
    block(context, &snippet.body, false);
    context.write("{/snippet}");
}

/// Visit a svelte:component element.
fn visit_svelte_component(context: &mut Context, comp: &crate::ast::SvelteComponentElement) {
    let source = context.source;
    let mut child_context = context.child();

    child_context.write("<svelte:component this={");
    child_context.write(&source_expression_to_string(&comp.expression, source));
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
    let source = context.source;
    let mut child_context = context.child();

    child_context.write("<svelte:element this={");
    child_context.write(&source_expression_to_string(&elem.tag, source));
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

    // Try source-based approach: extract CSS content from source text and reformat.
    // This is more reliable than reconstructing from the CSS AST, which may have
    // parsing issues with @font-face declarations and keyframe percentage selectors.
    if let Some(source) = context.source {
        let css_content = extract_and_reformat_css(source, stylesheet);
        if let Some(css) = css_content {
            if !css.is_empty() {
                context.indent();
                context.newline();

                for line in css.lines() {
                    context.write(line);
                    context.newline();
                }

                context.dedent();
            }
            context.write("</style>");
            return;
        }
    }

    // Fallback: use CSS AST visitors
    if !stylesheet.children.is_empty() {
        context.indent();
        context.newline();

        let mut started = false;

        for child in &stylesheet.children {
            if started {
                context.margin();
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

/// Extract CSS content from source and reformat with proper indentation.
fn extract_and_reformat_css(source: &str, stylesheet: &StyleSheet) -> Option<String> {
    // The stylesheet content is between start and end positions.
    // But start/end include the <style> and </style> tags.
    // We need to find the content between > and </style>.
    let start = stylesheet.start as usize;
    let end = stylesheet.end as usize;

    if start >= end || end > source.len() {
        return None;
    }

    let tag_text = &source[start..end];

    // Find the end of the opening <style...> tag
    let content_start = tag_text.find('>')? + 1;
    // Find the start of the closing </style> tag
    let content_end = memchr::memmem::rfind(tag_text.as_bytes(), b"</style>")?;

    let css_content = &tag_text[content_start..content_end];

    // Split into top-level blocks by tracking brace depth
    let blocks = split_css_top_level_blocks(css_content);

    if blocks.is_empty() {
        return Some(String::new());
    }

    // Reformat each block with tab indentation
    let mut result_parts = Vec::new();
    for block in &blocks {
        let reformatted = reformat_css_block(block);
        if !reformatted.is_empty() {
            result_parts.push(reformatted);
        }
    }

    Some(result_parts.join("\n\n"))
}

/// Split CSS content into top-level blocks (rules, at-rules).
/// Returns trimmed block strings.
fn split_css_top_level_blocks(css: &str) -> Vec<String> {
    let mut blocks = Vec::new();
    let mut depth = 0;
    let mut current_start = 0;
    let mut in_block = false;
    let chars: Vec<char> = css.chars().collect();

    let mut i = 0;
    while i < chars.len() {
        match chars[i] {
            '{' => {
                if depth == 0 {
                    in_block = true;
                }
                depth += 1;
            }
            '}' => {
                depth -= 1;
                if depth == 0 && in_block {
                    // End of top-level block
                    let block_text: String = chars[current_start..=i].iter().collect();
                    let trimmed = block_text.trim().to_string();
                    if !trimmed.is_empty() {
                        blocks.push(trimmed);
                    }
                    current_start = i + 1;
                    in_block = false;
                }
            }
            _ => {}
        }
        i += 1;
    }

    // Handle any remaining text (shouldn't happen in valid CSS)
    let remaining: String = chars[current_start..].iter().collect();
    let trimmed = remaining.trim().to_string();
    if !trimmed.is_empty() {
        blocks.push(trimmed);
    }

    blocks
}

/// Reformat a single CSS block with tab indentation.
fn reformat_css_block(block: &str) -> String {
    // Check if this is an at-rule
    if block.starts_with('@') {
        return reformat_css_at_rule(block);
    }

    // Regular rule: selector { declarations }
    reformat_css_rule(block)
}

/// Reformat a CSS rule.
fn reformat_css_rule(block: &str) -> String {
    if let Some(brace_pos) = block.find('{') {
        let selector = block[..brace_pos].trim();
        let rest = &block[brace_pos + 1..];

        if let Some(close_pos) = rest.rfind('}') {
            let inner = rest[..close_pos].trim();

            // Format the selector: split multiple selectors by comma onto separate lines
            let formatted_selector = format_css_selector(selector);

            if inner.is_empty() {
                return format!("{} {{}}", formatted_selector);
            }

            // Check if inner contains nested blocks
            if inner.contains('{') {
                // Split declarations and nested blocks
                let parts = split_css_declarations_and_blocks(inner);
                let mut lines = vec![format!("{} {{", formatted_selector)];
                for part in &parts {
                    if part.contains('{') {
                        // It's a nested block
                        let reformatted = indent_lines(&reformat_css_block(part), "\t");
                        lines.push(reformatted);
                    } else {
                        // It's a declaration
                        let decl = part.trim();
                        if !decl.is_empty() {
                            let decl = decl.trim_end_matches(';').trim();
                            lines.push(format!("\t{};", decl));
                        }
                    }
                }
                lines.push("}".to_string());
                return lines.join("\n");
            }

            // Simple declarations
            let mut lines = vec![format!("{} {{", formatted_selector)];
            for decl in inner.split(';') {
                let decl = decl.trim();
                if !decl.is_empty() {
                    lines.push(format!("\t{};", decl));
                }
            }
            lines.push("}".to_string());
            return lines.join("\n");
        }
    }

    block.to_string()
}

/// Format CSS selector, splitting multiple selectors onto separate lines.
fn format_css_selector(selector: &str) -> String {
    // Split by commas that are not inside parentheses
    let parts = split_top_level_commas(selector);
    if parts.len() <= 1 {
        return selector.to_string();
    }

    parts
        .iter()
        .map(|s| s.trim().to_string())
        .collect::<Vec<_>>()
        .join(",\n")
}

/// Split a string by commas that are not inside parentheses.
fn split_top_level_commas(s: &str) -> Vec<&str> {
    let mut parts = Vec::new();
    let mut depth = 0;
    let mut start = 0;

    for (i, ch) in s.char_indices() {
        match ch {
            '(' => depth += 1,
            ')' => depth -= 1,
            ',' if depth == 0 => {
                parts.push(&s[start..i]);
                start = i + 1;
            }
            _ => {}
        }
    }
    parts.push(&s[start..]);
    parts
}

/// Split inner CSS content into declarations and nested blocks.
fn split_css_declarations_and_blocks(inner: &str) -> Vec<String> {
    let mut parts = Vec::new();
    let mut depth = 0;
    let mut current_start = 0;
    let chars: Vec<char> = inner.chars().collect();

    let mut i = 0;
    while i < chars.len() {
        match chars[i] {
            '{' => {
                depth += 1;
            }
            '}' => {
                depth -= 1;
                if depth == 0 {
                    // End of a nested block - collect everything from current_start
                    let block_text: String = chars[current_start..=i].iter().collect();
                    let trimmed = block_text.trim().to_string();
                    if !trimmed.is_empty() {
                        parts.push(trimmed);
                    }
                    current_start = i + 1;
                }
            }
            ';' if depth == 0 => {
                // End of a declaration
                let decl: String = chars[current_start..=i].iter().collect();
                let trimmed = decl.trim().to_string();
                if !trimmed.is_empty() {
                    parts.push(trimmed);
                }
                current_start = i + 1;
            }
            _ => {}
        }
        i += 1;
    }

    // Handle remaining text
    let remaining: String = chars[current_start..].iter().collect();
    let trimmed = remaining.trim().to_string();
    if !trimmed.is_empty() {
        parts.push(trimmed);
    }

    parts
}

/// Reformat a CSS at-rule.
fn reformat_css_at_rule(block: &str) -> String {
    if let Some(brace_pos) = block.find('{') {
        let prelude = block[..brace_pos].trim();
        let rest = &block[brace_pos + 1..];

        if let Some(close_pos) = rest.rfind('}') {
            let inner = rest[..close_pos].trim();

            if inner.is_empty() {
                return format!("{} {{}}", prelude);
            }

            let is_keyframes = prelude.starts_with("@keyframes");

            // Check if inner contains nested blocks (like @media, @keyframes)
            if inner.contains('{') {
                let nested_blocks = split_css_inner_blocks(inner);
                let mut lines = vec![format!("{} {{", prelude)];
                for nested in &nested_blocks {
                    let mut reformatted = reformat_css_block(nested);
                    // For keyframes, double the % in percentage selectors
                    if is_keyframes {
                        reformatted = double_keyframe_percentages(&reformatted);
                    }
                    lines.push(indent_lines(&reformatted, "\t"));
                }
                lines.push("}".to_string());
                return lines.join("\n");
            }

            // Simple declarations (like @font-face)
            let mut lines = vec![format!("{} {{", prelude)];
            for decl in inner.split(';') {
                let decl = decl.trim();
                if !decl.is_empty() {
                    lines.push(format!("\t{};", decl));
                }
            }
            lines.push("}".to_string());
            return lines.join("\n");
        }
    }

    // No block, just the at-rule (like @import)
    if !block.ends_with(';') {
        format!("{};", block)
    } else {
        block.to_string()
    }
}

/// Double percentage signs in keyframe selectors (e.g., "50%" -> "50%%").
/// This matches the official Svelte printer behavior where esrap's Percentage
/// visitor outputs "50%" but inside keyframes it becomes "50%%".
fn double_keyframe_percentages(text: &str) -> String {
    // Only double % in the prelude (before the {)
    if let Some(brace_pos) = text.find('{') {
        let prelude = &text[..brace_pos];
        let rest = &text[brace_pos..];

        // Check if prelude contains a percentage (digits followed by %)
        let doubled_prelude = prelude.replace('%', "%%");
        format!("{}{}", doubled_prelude, rest)
    } else {
        text.to_string()
    }
}

/// Split inner CSS content into blocks (at brace depth 0).
fn split_css_inner_blocks(inner: &str) -> Vec<String> {
    let mut blocks = Vec::new();
    let mut depth = 0;
    let mut current_start = 0;
    let chars: Vec<char> = inner.chars().collect();

    let mut i = 0;
    while i < chars.len() {
        match chars[i] {
            '{' => {
                depth += 1;
            }
            '}' => {
                depth -= 1;
                if depth == 0 {
                    let block_text: String = chars[current_start..=i].iter().collect();
                    let trimmed = block_text.trim().to_string();
                    if !trimmed.is_empty() {
                        blocks.push(trimmed);
                    }
                    current_start = i + 1;
                }
            }
            _ => {}
        }
        i += 1;
    }

    // Handle remaining declarations without braces
    let remaining: String = chars[current_start..].iter().collect();
    let trimmed = remaining.trim().to_string();
    if !trimmed.is_empty() {
        // These are standalone declarations, add them to the previous block
        // or create a new one
        blocks.push(trimmed);
    }

    blocks
}

/// Indent all lines of text by the given prefix.
fn indent_lines(text: &str, prefix: &str) -> String {
    text.lines()
        .map(|line| {
            if line.is_empty() {
                String::new()
            } else {
                format!("{}{}", prefix, line)
            }
        })
        .collect::<Vec<_>>()
        .join("\n")
}
