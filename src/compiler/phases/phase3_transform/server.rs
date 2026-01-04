//! Server-side code generation.
//!
//! Generates JavaScript code for server-side rendering (SSR).

use super::TransformError;
use crate::ast::template::{
    Attribute, AttributeNode, AttributeValue, AttributeValuePart, AwaitBlock, Component, EachBlock,
    ExpressionTag, Fragment, HtmlTag, IfBlock, KeyBlock, RegularElement, RenderTag, Script,
    SnippetBlock, TemplateNode, Text,
};
use crate::compiler::CompileOptions;
use crate::compiler::phases::phase2_analyze::ComponentAnalysis;

/// Transform a component analysis into server-side JavaScript.
pub fn transform_server(
    analysis: &ComponentAnalysis,
    _source: &str,
    _options: &CompileOptions,
) -> Result<String, TransformError> {
    let component_name = &analysis.name;

    // Parse the AST to generate template and code
    let ast = crate::parser::parse(
        &analysis.source,
        crate::ParseOptions {
            modern: true,
            loose: false,
            filename: None,
        },
    )
    .map_err(|e| TransformError::CodeGen(format!("Parse error: {:?}", e)))?;

    // Extract instance script if present
    let instance_script = ast.instance.as_ref().map(|s| s.as_ref());

    let mut generator = ServerCodeGenerator::new(
        component_name.clone(),
        analysis.source.clone(),
        instance_script,
    );
    generator.generate_component(&ast.fragment)?;

    Ok(generator.build())
}

/// Server-side code generator.
struct ServerCodeGenerator<'a> {
    component_name: String,
    source: String,
    output_parts: Vec<OutputPart>,
    instance_script: Option<&'a Script>,
}

/// A part of the output - either static HTML or dynamic code.
#[derive(Debug)]
enum OutputPart {
    Html(String),
    Expression(String),
    Component {
        name: String,
        props: Vec<String>,
        has_prior_content: bool,
    },
    Comment,
    /// Each block - produces a for loop
    EachBlock {
        iterable: String,
        context_name: Option<String>,
        index_name: Option<String>,
        body: Vec<OutputPart>,
    },
}

impl<'a> ServerCodeGenerator<'a> {
    fn new(component_name: String, source: String, instance_script: Option<&'a Script>) -> Self {
        Self {
            component_name,
            source,
            output_parts: Vec::new(),
            instance_script,
        }
    }

    fn generate_component(&mut self, fragment: &Fragment) -> Result<(), TransformError> {
        let nodes: Vec<_> = fragment.nodes.iter().collect();
        let len = nodes.len();

        for (i, node) in nodes.iter().enumerate() {
            // Skip leading/trailing whitespace-only text nodes at root level
            if let TemplateNode::Text(text) = node {
                if text.data.trim().is_empty() {
                    // Skip if it's the first or last node
                    if i == 0 || i == len - 1 {
                        continue;
                    }
                }
            }
            self.generate_node(node, true)?;
        }
        Ok(())
    }

    fn generate_node(&mut self, node: &TemplateNode, is_root: bool) -> Result<(), TransformError> {
        match node {
            TemplateNode::Text(text) => self.generate_text(text, is_root),
            TemplateNode::RegularElement(element) => self.generate_element(element),
            TemplateNode::ExpressionTag(tag) => self.generate_expression_tag(tag),
            TemplateNode::Component(component) => self.generate_component_usage(component),
            TemplateNode::IfBlock(block) => self.generate_if_block(block),
            TemplateNode::EachBlock(block) => self.generate_each_block(block),
            TemplateNode::AwaitBlock(block) => self.generate_await_block(block),
            TemplateNode::KeyBlock(block) => self.generate_key_block(block),
            TemplateNode::SnippetBlock(block) => self.generate_snippet_block(block),
            TemplateNode::RenderTag(tag) => self.generate_render_tag(tag),
            TemplateNode::HtmlTag(tag) => self.generate_html_tag(tag),
            _ => Ok(()),
        }
    }

    fn generate_text(&mut self, text: &Text, _is_root: bool) -> Result<(), TransformError> {
        let data = &text.data;

        if data.trim().is_empty() {
            // Whitespace-only text becomes a single space if not empty
            if !data.is_empty() {
                self.output_parts.push(OutputPart::Html(" ".to_string()));
            }
        } else {
            self.output_parts.push(OutputPart::Html(escape_html(data)));
        }
        Ok(())
    }

    fn generate_element(&mut self, element: &RegularElement) -> Result<(), TransformError> {
        let name = element.name.as_str();

        // Start tag
        let mut tag = format!("<{}", name);

        // Attributes
        for attr in &element.attributes {
            if let Some(attr_str) = self.generate_attribute(attr)? {
                tag.push_str(&attr_str);
            }
        }

        if is_void_element(name) {
            tag.push_str("/>");
            self.output_parts.push(OutputPart::Html(tag));
        } else {
            tag.push('>');
            self.output_parts.push(OutputPart::Html(tag));

            // Children - filter and process with position awareness
            let children: Vec<_> = element.fragment.nodes.iter().collect();
            let len = children.len();

            for (i, child) in children.iter().enumerate() {
                // For text nodes, check if it should become a space
                if let TemplateNode::Text(text) = child {
                    let data = &text.data;
                    if data.trim().is_empty() {
                        // Whitespace-only text: skip if first or last child, otherwise add space
                        if i > 0 && i < len - 1 && !data.is_empty() {
                            self.output_parts.push(OutputPart::Html(" ".to_string()));
                        }
                        continue;
                    }
                }
                self.generate_node(child, false)?;
            }

            // End tag
            self.output_parts
                .push(OutputPart::Html(format!("</{}>", name)));
        }

        Ok(())
    }

    fn generate_attribute(&mut self, attr: &Attribute) -> Result<Option<String>, TransformError> {
        match attr {
            Attribute::Attribute(node) => self.generate_attribute_node(node),
            _ => Ok(None),
        }
    }

    fn generate_attribute_node(
        &mut self,
        node: &AttributeNode,
    ) -> Result<Option<String>, TransformError> {
        let name = node.name.as_str();

        match &node.value {
            AttributeValue::True(_) => Ok(Some(format!(" {}", name))),
            AttributeValue::Sequence(parts) => {
                let mut value = String::new();
                for part in parts {
                    match part {
                        AttributeValuePart::Text(text) => {
                            value.push_str(&escape_attr(&text.data));
                        }
                        AttributeValuePart::ExpressionTag(_) => {
                            // TODO: Handle expression in attribute
                        }
                    }
                }
                Ok(Some(format!(" {}=\"{}\"", name, value)))
            }
            AttributeValue::Expression(_) => Ok(None),
        }
    }

    fn generate_expression_tag(&mut self, tag: &ExpressionTag) -> Result<(), TransformError> {
        let start = tag.start as usize;
        let end = tag.end as usize;

        if start + 1 < end && end <= self.source.len() {
            let expr_source = self.source[start + 1..end - 1].trim().to_string();

            // Try constant folding for pure expressions
            let folded = try_constant_fold(&expr_source);

            // If it's a constant, output directly; otherwise use $.escape()
            let is_single_quoted = folded.starts_with('\'') && folded.ends_with('\'');
            let is_double_quoted = folded.starts_with('"') && folded.ends_with('"');
            if is_single_quoted || is_double_quoted {
                // It's a constant string like '0' or " " - extract content without quotes
                let content = &folded[1..folded.len() - 1];
                self.output_parts
                    .push(OutputPart::Html(content.to_string()));
            } else {
                // Dynamic expression - needs escaping
                self.output_parts.push(OutputPart::Expression(expr_source));
            }
        }

        Ok(())
    }

    fn generate_component_usage(&mut self, component: &Component) -> Result<(), TransformError> {
        let comp_name = component.name.to_string();

        // Check if there's any prior content (HTML or expressions)
        let has_prior_content = self.output_parts.iter().any(|part| {
            matches!(part, OutputPart::Html(s) if !s.trim().is_empty())
                || matches!(part, OutputPart::Expression(_))
        });

        // Extract props
        let mut props = Vec::new();
        for attr in &component.attributes {
            if let Attribute::Attribute(node) = attr {
                let name = node.name.as_str();
                if let AttributeValue::Expression(expr_tag) = &node.value {
                    let start = expr_tag.start as usize;
                    let end = expr_tag.end as usize;
                    if start + 1 < end && end <= self.source.len() {
                        let expr_source = self.source[start + 1..end - 1].trim().to_string();
                        props.push(format!("{}: {}", name, expr_source));
                    }
                }
            }
        }

        self.output_parts.push(OutputPart::Component {
            name: comp_name,
            props,
            has_prior_content,
        });

        Ok(())
    }

    fn generate_if_block(&mut self, _block: &IfBlock) -> Result<(), TransformError> {
        self.output_parts.push(OutputPart::Comment);
        Ok(())
    }

    fn generate_each_block(&mut self, block: &EachBlock) -> Result<(), TransformError> {
        // Get the iterable expression
        let start = block.expression.start().unwrap_or(0) as usize;
        let end = block.expression.end().unwrap_or(0) as usize;
        let iterable = if end > start && end <= self.source.len() {
            let raw = self.source[start..end].trim();
            // If no context and expression contains ", identifier", strip the index part
            if block.context.is_none() && raw.contains(", ") {
                if let Some(comma_pos) = raw.rfind(", ") {
                    raw[..comma_pos].trim().to_string()
                } else {
                    raw.to_string()
                }
            } else {
                raw.to_string()
            }
        } else {
            "[]".to_string()
        };

        // Get the context variable name (None if no "as" clause)
        let context_name = if let Some(ref context) = block.context {
            let ctx_start = context.start().unwrap_or(0) as usize;
            let ctx_end = context.end().unwrap_or(0) as usize;
            if ctx_end > ctx_start && ctx_end <= self.source.len() {
                Some(self.source[ctx_start..ctx_end].trim().to_string())
            } else {
                Some("item".to_string())
            }
        } else {
            None
        };

        // Get optional index name
        // If no context but expression had ", identifier", extract the index name
        let index_name = if let Some(ref idx) = block.index {
            Some(idx.to_string())
        } else if block.context.is_none() {
            // Check if expression source had a comma - extract index from there
            let raw_start = block.expression.start().unwrap_or(0) as usize;
            let raw_end = block.expression.end().unwrap_or(0) as usize;
            if raw_end > raw_start && raw_end <= self.source.len() {
                let raw = self.source[raw_start..raw_end].trim();
                if let Some(comma_pos) = raw.rfind(", ") {
                    let idx_part = raw[comma_pos + 2..].trim();
                    if !idx_part.is_empty()
                        && idx_part.chars().all(|c| c.is_alphanumeric() || c == '_')
                    {
                        Some(idx_part.to_string())
                    } else {
                        None
                    }
                } else {
                    None
                }
            } else {
                None
            }
        } else {
            None
        };

        // Filter body nodes - skip leading/trailing whitespace
        let body_nodes: Vec<_> = block.body.nodes.iter().collect();
        let len = body_nodes.len();

        // Determine indices to process (skip leading/trailing whitespace)
        let mut start_idx = 0;
        let mut end_idx = len;

        // Skip leading whitespace
        while start_idx < len {
            if let TemplateNode::Text(text) = body_nodes[start_idx] {
                if text.data.trim().is_empty() {
                    start_idx += 1;
                    continue;
                }
            }
            break;
        }

        // Skip trailing whitespace
        while end_idx > start_idx {
            if let TemplateNode::Text(text) = body_nodes[end_idx - 1] {
                if text.data.trim().is_empty() {
                    end_idx -= 1;
                    continue;
                }
            }
            break;
        }

        // Generate body parts
        let mut body_generator =
            ServerCodeGenerator::new(self.component_name.clone(), self.source.clone(), None);

        // Check if first node is an expression - if so, add comment marker
        if start_idx < end_idx {
            if let TemplateNode::ExpressionTag(_) = body_nodes[start_idx] {
                body_generator.output_parts.push(OutputPart::Comment);
            }
        }

        for node in body_nodes.iter().take(end_idx).skip(start_idx) {
            body_generator.generate_node(node, false)?;
        }

        self.output_parts.push(OutputPart::EachBlock {
            iterable,
            context_name,
            index_name,
            body: body_generator.output_parts,
        });

        Ok(())
    }

    fn generate_await_block(&mut self, _block: &AwaitBlock) -> Result<(), TransformError> {
        self.output_parts.push(OutputPart::Comment);
        Ok(())
    }

    fn generate_key_block(&mut self, _block: &KeyBlock) -> Result<(), TransformError> {
        self.output_parts.push(OutputPart::Comment);
        Ok(())
    }

    fn generate_snippet_block(&mut self, _block: &SnippetBlock) -> Result<(), TransformError> {
        Ok(())
    }

    fn generate_render_tag(&mut self, _tag: &RenderTag) -> Result<(), TransformError> {
        self.output_parts.push(OutputPart::Comment);
        Ok(())
    }

    fn generate_html_tag(&mut self, _tag: &HtmlTag) -> Result<(), TransformError> {
        self.output_parts.push(OutputPart::Comment);
        Ok(())
    }

    fn build(self) -> String {
        let body_code = Self::build_parts(&self.output_parts, 1);

        // Process script content if present
        let (props_param, script_code) = if let Some(script) = self.instance_script {
            let start = script.content.start().unwrap_or(0) as usize;
            let end = script.content.end().unwrap_or(0) as usize;
            let raw_script = if end > start && end <= self.source.len() {
                self.source[start..end].to_string()
            } else {
                String::new()
            };

            // Check if script uses $props()
            let uses_props = raw_script.contains("$props()");

            // Transform the script content
            let transformed = transform_script_content(&raw_script);

            if uses_props {
                (", $$props", transformed)
            } else {
                ("", transformed)
            }
        } else {
            ("", String::new())
        };

        // Build the final output
        let script_section = if script_code.is_empty() {
            String::new()
        } else {
            format!("{}\n", script_code)
        };

        format!(
            r#"import * as $ from 'svelte/internal/server';

export default function {component_name}($$renderer{props_param}) {{
{script_section}{body_code}}}"#,
            component_name = self.component_name,
            props_param = props_param,
            script_section = script_section,
            body_code = body_code
        )
    }

    fn build_parts(parts: &[OutputPart], indent_level: usize) -> String {
        let mut body_code = String::new();
        let mut current_html = String::new();
        let indent = "\t".repeat(indent_level);

        for part in parts {
            match part {
                OutputPart::Html(html) => {
                    current_html.push_str(html);
                }
                OutputPart::Expression(expr) => {
                    current_html.push_str(&format!("${{$.escape({})}}", expr));
                }
                OutputPart::Component {
                    name,
                    props,
                    has_prior_content,
                } => {
                    // Flush current HTML
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }
                    // Generate component call - always pass props object
                    if props.is_empty() {
                        body_code.push_str(&format!("{}{}($$renderer, {{}});\n", indent, name));
                    } else {
                        body_code.push_str(&format!(
                            "{}{}($$renderer, {{ {} }});\n",
                            indent,
                            name,
                            props.join(", ")
                        ));
                    }
                    // Add comment marker only if there was prior HTML content
                    if *has_prior_content {
                        current_html.push_str("<!---->");
                    }
                }
                OutputPart::Comment => {
                    current_html.push_str("<!---->");
                }
                OutputPart::EachBlock {
                    iterable,
                    context_name,
                    index_name,
                    body,
                } => {
                    // Flush current HTML before block
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    // Opening marker
                    body_code.push_str(&format!("{}$$renderer.push(`<!--[-->`);\n\n", indent));

                    // Array variable
                    let index_var = index_name.as_deref().unwrap_or("$$index");
                    body_code.push_str(&format!(
                        "{}const each_array = $.ensure_array_like({});\n\n",
                        indent, iterable
                    ));

                    // For loop
                    body_code.push_str(&format!(
                        "{}for (let {} = 0, $$length = each_array.length; {} < $$length; {}++) {{\n",
                        indent, index_var, index_var, index_var
                    ));

                    // Context variable (only if there's a context)
                    if let Some(ctx_name) = context_name {
                        body_code.push_str(&format!(
                            "{}\tlet {} = each_array[{}];\n\n",
                            indent, ctx_name, index_var
                        ));
                    }

                    // Body
                    let body_code_inner = Self::build_parts(body, indent_level + 1);
                    body_code.push_str(&body_code_inner);

                    // Close for loop
                    body_code.push_str(&format!("{}}}\n\n", indent));

                    // Closing marker
                    body_code.push_str(&format!("{}$$renderer.push(`<!--]-->`);\n", indent));
                }
            }
        }

        // Flush remaining HTML
        if !current_html.is_empty() {
            body_code.push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
        }

        body_code
    }
}

/// Try to evaluate a pure expression at compile time.
fn try_constant_fold(expr: &str) -> String {
    let trimmed = expr.trim();

    // Check for string literals - these can be output directly
    if (trimmed.starts_with('\'') && trimmed.ends_with('\''))
        || (trimmed.starts_with('"') && trimmed.ends_with('"'))
    {
        // It's already a string literal, return as-is (with quotes as marker)
        return trimmed.to_string();
    }

    if trimmed.starts_with("Math.") {
        if let Some(result) = eval_math_expr(trimmed) {
            return format!("'{}'", result);
        }
    }

    expr.to_string()
}

fn eval_math_expr(expr: &str) -> Option<String> {
    if expr.starts_with("Math.max(") && expr.ends_with(')') {
        let inner = &expr[9..expr.len() - 1];
        return eval_math_max_min(inner);
    }
    if expr.starts_with("Math.min(") && expr.ends_with(')') {
        let inner = &expr[9..expr.len() - 1];
        return eval_math_max_min_op(inner, false);
    }
    None
}

fn eval_math_max_min(args: &str) -> Option<String> {
    let parts = split_args(args);
    if parts.len() != 2 {
        return None;
    }

    let a = parse_numeric_expr(&parts[0])?;
    let b = parse_numeric_expr(&parts[1])?;

    Some(a.max(b).to_string())
}

fn eval_math_max_min_op(args: &str, is_max: bool) -> Option<String> {
    let parts = split_args(args);
    if parts.len() != 2 {
        return None;
    }

    let a = parse_numeric_expr(&parts[0])?;
    let b = parse_numeric_expr(&parts[1])?;

    let result = if is_max { a.max(b) } else { a.min(b) };
    Some(result.to_string())
}

fn split_args(s: &str) -> Vec<String> {
    let mut parts = Vec::new();
    let mut current = String::new();
    let mut depth = 0;

    for c in s.chars() {
        match c {
            '(' => {
                depth += 1;
                current.push(c);
            }
            ')' => {
                depth -= 1;
                current.push(c);
            }
            ',' if depth == 0 => {
                parts.push(current.trim().to_string());
                current = String::new();
            }
            _ => current.push(c),
        }
    }
    if !current.is_empty() {
        parts.push(current.trim().to_string());
    }
    parts
}

fn parse_numeric_expr(s: &str) -> Option<i64> {
    let trimmed = s.trim();

    if let Ok(n) = trimmed.parse::<i64>() {
        return Some(n);
    }

    if trimmed.starts_with("Math.min(") && trimmed.ends_with(')') {
        let inner = &trimmed[9..trimmed.len() - 1];
        let parts = split_args(inner);
        if parts.len() == 2 {
            let a = parse_numeric_expr(&parts[0])?;
            let b = parse_numeric_expr(&parts[1])?;
            return Some(a.min(b));
        }
    }
    if trimmed.starts_with("Math.max(") && trimmed.ends_with(')') {
        let inner = &trimmed[9..trimmed.len() - 1];
        let parts = split_args(inner);
        if parts.len() == 2 {
            let a = parse_numeric_expr(&parts[0])?;
            let b = parse_numeric_expr(&parts[1])?;
            return Some(a.max(b));
        }
    }

    None
}

/// Escape HTML special characters.
fn escape_html(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
}

/// Escape attribute value special characters.
fn escape_attr(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('"', "&quot;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
}

/// Check if an element is a void element.
fn is_void_element(name: &str) -> bool {
    matches!(
        name,
        "area"
            | "base"
            | "br"
            | "col"
            | "embed"
            | "hr"
            | "img"
            | "input"
            | "link"
            | "meta"
            | "param"
            | "source"
            | "track"
            | "wbr"
    )
}

/// Transform script content for server-side rendering.
/// - Replaces `$props()` with `$$props`
/// - Replaces `$state(x)` with `x`
fn transform_script_content(script: &str) -> String {
    let mut result = String::new();
    let lines: Vec<&str> = script.lines().collect();

    for line in lines {
        let trimmed = line.trim();

        // Skip empty lines at the start
        if result.is_empty() && trimmed.is_empty() {
            continue;
        }

        // Transform $props() to $$props
        let line = line.replace("$props()", "$$props");

        // Transform $state(x) to x - simple regex-like replacement
        let line = transform_state_calls(&line);

        // Basic formatting fixes
        let line = format_js_line(&line);

        // Don't add extra indentation if line already has proper indentation
        // Just ensure at least one tab at the start
        if line.starts_with('\t') {
            result.push_str(&line);
        } else if trimmed.is_empty() {
            // Empty line - just add a blank line
        } else {
            result.push('\t');
            result.push_str(&line);
        }
        result.push('\n');
    }

    // Remove trailing newline
    if result.ends_with('\n') {
        result.pop();
    }

    result
}

/// Basic formatting for JS lines - add spaces around operators
fn format_js_line(line: &str) -> String {
    let mut result = String::new();
    let chars: Vec<char> = line.chars().collect();
    let mut i = 0;
    let mut in_string = false;
    let mut string_char = ' ';

    while i < chars.len() {
        let c = chars[i];

        // Track string state
        if (c == '"' || c == '\'' || c == '`') && (i == 0 || chars[i - 1] != '\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
        }

        // Don't modify content inside strings
        if in_string {
            result.push(c);
            i += 1;
            continue;
        }

        // Add space around = in assignments (but not == or ===)
        if c == '=' {
            let next = chars.get(i + 1).copied();
            let prev = if !result.is_empty() {
                result.chars().last()
            } else {
                None
            };

            // Check if this is == or ===
            if next == Some('=') {
                result.push(c);
            } else if prev == Some('=')
                || prev == Some('!')
                || prev == Some('<')
                || prev == Some('>')
            {
                // Part of ==, !=, <=, >=
                result.push(c);
            } else {
                // Regular assignment - ensure spaces
                if prev != Some(' ') {
                    result.push(' ');
                }
                result.push(c);
                if next != Some(' ') && next.is_some() {
                    result.push(' ');
                }
            }
            i += 1;
            continue;
        }

        // Add space before { in function declarations
        if c == '{' {
            let prev = if !result.is_empty() {
                result.chars().last()
            } else {
                None
            };
            if prev == Some(')') {
                result.push(' ');
            }
            result.push(c);
            i += 1;
            continue;
        }

        result.push(c);
        i += 1;
    }

    result
}

/// Transform $state(expr) calls to just the expression.
fn transform_state_calls(line: &str) -> String {
    let mut result = String::new();
    let chars: Vec<char> = line.chars().collect();
    let mut i = 0;

    while i < chars.len() {
        // Check for $state(
        if i + 7 <= chars.len() {
            let potential: String = chars[i..i + 7].iter().collect();
            if potential == "$state(" {
                // Find the matching closing paren
                let mut depth = 1;
                let start = i + 7;
                let mut end = start;

                while end < chars.len() && depth > 0 {
                    match chars[end] {
                        '(' => depth += 1,
                        ')' => depth -= 1,
                        _ => {}
                    }
                    if depth > 0 {
                        end += 1;
                    }
                }

                // Extract the inner expression
                let inner: String = chars[start..end].iter().collect();
                result.push_str(&inner);
                i = end + 1; // Skip past the closing paren
                continue;
            }
        }

        result.push(chars[i]);
        i += 1;
    }

    result
}
