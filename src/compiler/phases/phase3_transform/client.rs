//! Client-side code generation.
//!
//! Generates JavaScript code for browser execution.

use super::TransformError;
use crate::ast::template::{
    Attribute, AttributeNode, AttributeValue, AttributeValuePart, AwaitBlock, Component, EachBlock,
    ExpressionTag, Fragment, HtmlTag, IfBlock, KeyBlock, RegularElement, RenderTag, SnippetBlock,
    TemplateNode, Text,
};
use crate::compiler::CompileOptions;
use crate::compiler::phases::phase2_analyze::ComponentAnalysis;

/// Transform a component analysis into client-side JavaScript.
pub fn transform_client(
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

    let mut generator = ClientCodeGenerator::new(component_name.clone(), analysis.source.clone());
    generator.generate_component(&ast.fragment)?;

    Ok(generator.build())
}

/// Information about a node that needs runtime code.
#[derive(Debug, Clone)]
#[allow(dead_code)]
struct NodeInfo {
    /// Variable name for this node
    var_name: String,
    /// Type of node
    node_type: NodeType,
    /// Expression code (for expressions and components)
    expression: Option<String>,
    /// Child index in parent (for navigation)
    child_index: usize,
}

#[derive(Debug, Clone)]
#[allow(dead_code)]
enum NodeType {
    Element(String), // tag name
    ExpressionInElement,
    Component(String), // component name
    Anchor,
}

/// Client-side code generator.
struct ClientCodeGenerator {
    component_name: String,
    source: String,
    html_parts: Vec<String>,
    nodes: Vec<NodeInfo>,
    has_expressions: bool,
    root_element_count: usize,
    current_var_index: usize,
    /// Counter for node variables (used for anchors/components)
    node_var_index: usize,
    /// Stack of parent element var names for tracking hierarchy
    element_stack: Vec<String>,
    /// Current child index within parent
    current_child_index: usize,
}

impl ClientCodeGenerator {
    fn new(component_name: String, source: String) -> Self {
        Self {
            component_name,
            source,
            html_parts: Vec::new(),
            nodes: Vec::new(),
            has_expressions: false,
            root_element_count: 0,
            current_var_index: 0,
            node_var_index: 0,
            element_stack: Vec::new(),
            current_child_index: 0,
        }
    }

    fn generate_component(&mut self, fragment: &Fragment) -> Result<(), TransformError> {
        // Count root elements
        self.root_element_count = fragment
            .nodes
            .iter()
            .filter(|n| !matches!(n, TemplateNode::Text(t) if t.data.trim().is_empty()))
            .count();

        // Generate HTML for the template
        for node in &fragment.nodes {
            self.generate_node(node, true)?; // root level nodes
        }

        Ok(())
    }

    fn generate_node(
        &mut self,
        node: &TemplateNode,
        is_root_level: bool,
    ) -> Result<(), TransformError> {
        match node {
            TemplateNode::Text(text) => self.generate_text(text, is_root_level),
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

    fn generate_text(&mut self, text: &Text, is_root_level: bool) -> Result<(), TransformError> {
        let data = &text.data;

        if data.trim().is_empty() {
            // Whitespace-only text
            if is_root_level && !data.is_empty() {
                // At root level, normalize whitespace to single space
                self.html_parts.push(" ".to_string());
            }
            // Inside elements, skip whitespace-only text
        } else {
            // Non-whitespace text - escape and include
            self.html_parts.push(escape_html(data));
        }
        Ok(())
    }

    fn generate_element(&mut self, element: &RegularElement) -> Result<(), TransformError> {
        let name = element.name.as_str();

        // Create variable name for this element
        let var_name = self.next_var_name(name);
        let child_index = self.current_child_index;

        // Record element info
        self.nodes.push(NodeInfo {
            var_name: var_name.clone(),
            node_type: NodeType::Element(name.to_string()),
            expression: None,
            child_index,
        });

        // Start tag
        self.html_parts.push(format!("<{}", name));

        // Attributes
        for attr in &element.attributes {
            self.generate_attribute(attr)?;
        }

        // Void elements
        if is_void_element(name) {
            self.html_parts.push("/>".to_string());
        } else {
            self.html_parts.push(">".to_string());

            // Push element onto stack for tracking expressions
            self.element_stack.push(var_name);
            let saved_child_index = self.current_child_index;
            self.current_child_index = 0;

            // Children
            for child in &element.fragment.nodes {
                self.generate_node(child, false)?; // not root level
                self.current_child_index += 1;
            }

            // Pop element from stack
            self.element_stack.pop();
            self.current_child_index = saved_child_index;

            // End tag
            self.html_parts.push(format!("</{}>", name));
        }

        Ok(())
    }

    fn next_var_name(&mut self, hint: &str) -> String {
        let name = if self.current_var_index == 0 {
            hint.to_string()
        } else {
            format!("{}_{}", hint, self.current_var_index)
        };
        self.current_var_index += 1;
        name
    }

    fn next_node_var(&mut self) -> String {
        let name = if self.node_var_index == 0 {
            "node".to_string()
        } else {
            format!("node_{}", self.node_var_index)
        };
        self.node_var_index += 1;
        name
    }

    fn generate_attribute(&mut self, attr: &Attribute) -> Result<(), TransformError> {
        match attr {
            Attribute::Attribute(node) => {
                self.generate_attribute_node(node)?;
            }
            Attribute::SpreadAttribute(_) => {
                // Spread attributes are handled at runtime
                self.has_expressions = true;
            }
            _ => {
                // Other directives (bind:, on:, class:, etc.) are handled separately
                self.has_expressions = true;
            }
        }
        Ok(())
    }

    fn generate_attribute_node(&mut self, node: &AttributeNode) -> Result<(), TransformError> {
        let name = node.name.as_str();

        match &node.value {
            AttributeValue::True(_) => {
                self.html_parts.push(format!(" {}", name));
            }
            AttributeValue::Sequence(parts) => {
                self.html_parts.push(format!(" {}=\"", name));
                for part in parts {
                    match part {
                        AttributeValuePart::Text(text) => {
                            self.html_parts.push(escape_attr(&text.data));
                        }
                        AttributeValuePart::ExpressionTag(_) => {
                            // TODO: Handle expression in attribute
                            self.has_expressions = true;
                        }
                    }
                }
                self.html_parts.push("\"".to_string());
            }
            AttributeValue::Expression(_) => {
                // TODO: Handle expression attribute
                self.has_expressions = true;
            }
        }

        Ok(())
    }

    fn generate_expression_tag(&mut self, tag: &ExpressionTag) -> Result<(), TransformError> {
        // Expression tags mark that we have dynamic content
        self.has_expressions = true;

        // Extract the expression source code (without the { } delimiters)
        let start = tag.start as usize;
        let end = tag.end as usize;

        if start + 1 < end && end <= self.source.len() {
            let expr_source = self.source[start + 1..end - 1].trim().to_string();

            // Record this expression for runtime code generation
            let var_name = if let Some(parent) = self.element_stack.last() {
                parent.clone()
            } else {
                format!("node_{}", self.current_var_index)
            };

            self.nodes.push(NodeInfo {
                var_name,
                node_type: NodeType::ExpressionInElement,
                expression: Some(expr_source),
                child_index: self.current_child_index,
            });
        }

        // Don't output anything in template - the element will be empty
        Ok(())
    }

    fn generate_component_usage(&mut self, component: &Component) -> Result<(), TransformError> {
        // Components are rendered as comment placeholders
        self.html_parts.push("<!>".to_string());

        let comp_name = component.name.to_string();
        let var_name = self.next_node_var();

        // Extract props from attributes
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

        let expression = if props.is_empty() {
            None
        } else {
            Some(props.join(", "))
        };

        self.nodes.push(NodeInfo {
            var_name,
            node_type: NodeType::Component(comp_name),
            expression,
            child_index: self.current_child_index,
        });

        Ok(())
    }

    fn generate_if_block(&mut self, _block: &IfBlock) -> Result<(), TransformError> {
        // Control blocks need anchor comments
        self.html_parts.push("<!>".to_string());
        Ok(())
    }

    fn generate_each_block(&mut self, _block: &EachBlock) -> Result<(), TransformError> {
        self.html_parts.push("<!>".to_string());
        Ok(())
    }

    fn generate_await_block(&mut self, _block: &AwaitBlock) -> Result<(), TransformError> {
        self.html_parts.push("<!>".to_string());
        Ok(())
    }

    fn generate_key_block(&mut self, _block: &KeyBlock) -> Result<(), TransformError> {
        self.html_parts.push("<!>".to_string());
        Ok(())
    }

    fn generate_snippet_block(&mut self, _block: &SnippetBlock) -> Result<(), TransformError> {
        // Snippets don't render directly
        Ok(())
    }

    fn generate_render_tag(&mut self, _tag: &RenderTag) -> Result<(), TransformError> {
        self.html_parts.push("<!>".to_string());
        Ok(())
    }

    fn generate_html_tag(&mut self, _tag: &HtmlTag) -> Result<(), TransformError> {
        self.html_parts.push("<!>".to_string());
        Ok(())
    }

    fn build(self) -> String {
        let html = self.html_parts.join("");
        let is_fragment = self.root_element_count > 1;

        // For now, always include legacy flag
        // TODO: Detect runes mode and exclude legacy flag when runes are used
        let imports = "import 'svelte/internal/disclose-version';\nimport 'svelte/internal/flags/legacy';\nimport * as $ from 'svelte/internal/client';";

        // Generate runtime code for expressions
        let runtime_code = self.generate_runtime_code(is_fragment);

        if is_fragment {
            // Multiple root elements - use fragment pattern
            format!(
                r#"{imports}

var root = $.from_html(`{html}`, 1);

export default function {component_name}($$anchor) {{
	var fragment = root();
{runtime_code}	$.append($$anchor, fragment);
}}"#,
                imports = imports,
                html = html,
                component_name = self.component_name,
                runtime_code = runtime_code
            )
        } else {
            // Single root element
            let root_var = determine_root_var(&html);
            format!(
                r#"{imports}

var root = $.from_html(`{html}`);

export default function {component_name}($$anchor) {{
	var {root_var} = root();
{runtime_code}	$.append($$anchor, {root_var});
}}"#,
                imports = imports,
                html = html,
                component_name = self.component_name,
                root_var = root_var,
                runtime_code = runtime_code
            )
        }
    }

    fn generate_runtime_code(&self, is_fragment: bool) -> String {
        let mut code = String::new();
        let root_var = if is_fragment { "fragment" } else { "node" };

        // Find elements that have expressions
        let mut elements_with_expr: Vec<(&NodeInfo, Vec<&NodeInfo>)> = Vec::new();

        let mut i = 0;
        while i < self.nodes.len() {
            if let NodeType::Element(_) = &self.nodes[i].node_type {
                let elem = &self.nodes[i];
                let mut exprs = Vec::new();

                // Look for expressions that belong to this element
                for j in (i + 1)..self.nodes.len() {
                    if let NodeType::Element(_) = &self.nodes[j].node_type {
                        break;
                    }
                    if let NodeType::ExpressionInElement = &self.nodes[j].node_type {
                        if self.nodes[j].var_name == elem.var_name {
                            exprs.push(&self.nodes[j]);
                        }
                    }
                }

                if !exprs.is_empty() {
                    elements_with_expr.push((elem, exprs));
                }
            }
            i += 1;
        }

        // Generate navigation and assignment code
        let mut prev_var: Option<&str> = None;
        for (idx, (elem, exprs)) in elements_with_expr.iter().enumerate() {
            let var = &elem.var_name;

            // Navigation code
            if idx == 0 {
                code.push_str(&format!("\tvar {} = $.first_child({});\n\n", var, root_var));
            } else if let Some(prev) = prev_var {
                // Offset is 2 because of text nodes (spaces) between elements
                code.push_str(&format!("\tvar {} = $.sibling({}, 2);\n\n", var, prev));
            }

            // Expression assignment
            for expr_info in exprs {
                if let Some(expr) = &expr_info.expression {
                    let folded = try_constant_fold(expr);
                    code.push_str(&format!("\t{}.textContent = {};\n\n", var, folded));
                }
            }

            prev_var = Some(var);
        }

        // Handle components at the end
        for node in &self.nodes {
            if let NodeType::Component(name) = &node.node_type {
                if prev_var.is_some() {
                    code.push_str(&format!(
                        "\tvar {} = $.sibling({}, 2);\n\n",
                        node.var_name,
                        prev_var.unwrap()
                    ));
                }
                if let Some(expr) = &node.expression {
                    code.push_str(&format!("\t{}({}, {{ {} }});\n", name, node.var_name, expr));
                } else {
                    code.push_str(&format!("\t{}({});\n", name, node.var_name));
                }
            }
        }

        code
    }
}

/// Determine the root variable name from the HTML.
fn determine_root_var(html: &str) -> String {
    // Extract the first element name from HTML
    if let Some(start) = html.find('<') {
        let rest = &html[start + 1..];
        if let Some(end) = rest.find(|c: char| c.is_whitespace() || c == '>' || c == '/') {
            let name = &rest[..end];
            if !name.is_empty() && !name.starts_with('!') {
                return name.to_string();
            }
        }
    }
    "node".to_string()
}

/// Try to evaluate a pure expression at compile time.
/// Returns the evaluated value as a string if possible, otherwise returns the original expression.
fn try_constant_fold(expr: &str) -> String {
    // Simple pattern matching for common pure expressions
    let trimmed = expr.trim();

    // Check for Math.max/Math.min with constant arguments
    if trimmed.starts_with("Math.") {
        if let Some(result) = eval_math_expr(trimmed) {
            return format!("'{}'", result);
        }
    }

    // Return original expression if we can't evaluate it
    expr.to_string()
}

/// Evaluate simple Math expressions with constant arguments.
fn eval_math_expr(expr: &str) -> Option<String> {
    // Handle nested Math.max/Math.min
    // Pattern: Math.max(a, Math.min(b, c))
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
    // Split by comma, handling nested calls
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

    // Try direct number parsing
    if let Ok(n) = trimmed.parse::<i64>() {
        return Some(n);
    }

    // Try nested Math calls
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_constant_folding() {
        assert_eq!(try_constant_fold("Math.max(0, Math.min(0, 100))"), "'0'");
        assert_eq!(try_constant_fold("Math.min(5, 10)"), "'5'");
        assert_eq!(try_constant_fold("Math.max(5, 10)"), "'10'");
        assert_eq!(try_constant_fold("location.href"), "location.href");
    }
}
