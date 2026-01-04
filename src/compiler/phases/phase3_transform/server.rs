//! Server-side code generation.
//!
//! Generates JavaScript code for server-side rendering (SSR).

use super::TransformError;
use crate::ast::template::{
    Attribute, AttributeNode, AttributeValue, AttributeValuePart, AwaitBlock, Component, EachBlock,
    ExpressionTag, Fragment, HtmlTag, IfBlock, KeyBlock, RegularElement, RenderTag, SnippetBlock,
    TemplateNode, Text,
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

    let mut generator = ServerCodeGenerator::new(component_name.clone(), analysis.source.clone());
    generator.generate_component(&ast.fragment)?;

    Ok(generator.build())
}

/// Server-side code generator.
struct ServerCodeGenerator {
    component_name: String,
    source: String,
    output_parts: Vec<OutputPart>,
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
}

impl ServerCodeGenerator {
    fn new(component_name: String, source: String) -> Self {
        Self {
            component_name,
            source,
            output_parts: Vec::new(),
        }
    }

    fn generate_component(&mut self, fragment: &Fragment) -> Result<(), TransformError> {
        for node in &fragment.nodes {
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
            if folded.starts_with('\'') && folded.ends_with('\'') {
                // It's a constant string like '0'
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

    fn generate_each_block(&mut self, _block: &EachBlock) -> Result<(), TransformError> {
        self.output_parts.push(OutputPart::Comment);
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
        let mut body_code = String::new();
        let mut current_html = String::new();

        for part in &self.output_parts {
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
                        body_code.push_str(&format!("\t$$renderer.push(`{}`);\n", current_html));
                        current_html.clear();
                    }
                    // Generate component call - always pass props object
                    if props.is_empty() {
                        body_code.push_str(&format!("\t{}($$renderer, {{}});\n", name));
                    } else {
                        body_code.push_str(&format!(
                            "\t{}($$renderer, {{ {} }});\n",
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
            }
        }

        // Flush remaining HTML
        if !current_html.is_empty() {
            body_code.push_str(&format!("\t$$renderer.push(`{}`);\n", current_html));
        }

        format!(
            r#"import * as $ from 'svelte/internal/server';

export default function {component_name}($$renderer) {{
{body_code}}}"#,
            component_name = self.component_name,
            body_code = body_code
        )
    }
}

/// Try to evaluate a pure expression at compile time.
fn try_constant_fold(expr: &str) -> String {
    let trimmed = expr.trim();

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
