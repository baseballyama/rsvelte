//! Server-side code generation.
//!
//! Generates JavaScript code for server-side rendering (SSR).

use super::TransformError;
use super::js_ast::normalize_js;
use crate::ast::template::{
    Attribute, AttributeNode, AttributeValue, AttributeValuePart, AwaitBlock, BindDirective,
    Component, EachBlock, ExpressionTag, Fragment, HtmlTag, IfBlock, KeyBlock, RegularElement,
    RenderTag, Script, SnippetBlock, SvelteDynamicElement, TemplateNode, Text,
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

use std::collections::HashMap;

/// A snippet definition.
#[derive(Debug)]
struct SnippetDef {
    name: String,
    params: Vec<String>,
    body_parts: Vec<OutputPart>,
}

/// Server-side code generator.
struct ServerCodeGenerator<'a> {
    component_name: String,
    source: String,
    output_parts: Vec<OutputPart>,
    instance_script: Option<&'a Script>,
    /// Map of constant variable names to their values
    constant_vars: HashMap<String, String>,
    /// Snippet definitions to be generated at module level
    snippets: Vec<SnippetDef>,
}

/// A part of the output - either static HTML or dynamic code.
#[derive(Debug)]
enum OutputPart {
    Html(String),
    Expression(String),
    /// Raw HTML expression - {@html expr}
    HtmlExpression(String),
    Component {
        name: String,
        props: Vec<String>,
        has_prior_content: bool,
        children: Option<Vec<OutputPart>>,
    },
    /// Component with bind directives - requires do/while settling
    ComponentWithBindings {
        name: String,
        props: Vec<String>,
        bindings: Vec<(String, String)>, // (prop_name, variable_name)
        #[allow(dead_code)]
        // Always true for component bindings - comment marker added via build_parts_with_prefix
        has_prior_content: bool,
        #[allow(dead_code)] // TODO: Handle children for components with bindings
        children: Option<Vec<OutputPart>>,
    },
    Comment,
    /// Each block - produces a for loop
    EachBlock {
        iterable: String,
        context_name: Option<String>,
        index_name: Option<String>,
        body: Vec<OutputPart>,
    },
    /// svelte:element - dynamic element
    SvelteElement {
        tag_expr: String,
    },
    /// Option element - produces $$renderer.option() call
    OptionElement {
        attrs: Vec<(String, String)>,
        body: Vec<OutputPart>,
    },
    /// Await block - produces $.await() call
    AwaitBlock {
        promise: String,
        then_param: String,
    },
}

impl<'a> ServerCodeGenerator<'a> {
    fn new(component_name: String, source: String, instance_script: Option<&'a Script>) -> Self {
        // Extract constant variables from script
        let constant_vars = if let Some(script) = instance_script {
            let start = script.content.start().unwrap_or(0) as usize;
            let end = script.content.end().unwrap_or(0) as usize;
            if end > start && end <= source.len() {
                extract_constant_vars(&source[start..end])
            } else {
                HashMap::new()
            }
        } else {
            HashMap::new()
        };

        Self {
            component_name,
            source,
            output_parts: Vec::new(),
            instance_script,
            constant_vars,
            snippets: Vec::new(),
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
            TemplateNode::SvelteElement(elem) => self.generate_svelte_element(elem),
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
            // Normalize leading/trailing whitespace (newlines -> spaces)
            let trimmed = data.trim();
            let has_leading_ws = data.chars().next().is_some_and(|c| c.is_whitespace());
            let has_trailing_ws = data.chars().last().is_some_and(|c| c.is_whitespace());

            let mut result = String::new();
            if has_leading_ws {
                result.push(' ');
            }
            result.push_str(&escape_html(trimmed));
            if has_trailing_ws {
                result.push(' ');
            }
            self.output_parts.push(OutputPart::Html(result));
        }
        Ok(())
    }

    fn generate_element(&mut self, element: &RegularElement) -> Result<(), TransformError> {
        let name = element.name.as_str();

        // Handle <option> element specially
        if name == "option" {
            return self.generate_option_element(element);
        }

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
            // First, filter out comments and find meaningful content boundaries
            let children: Vec<_> = element.fragment.nodes.iter().collect();

            // Find first and last non-whitespace, non-comment children
            let _first_content = children.iter().position(|c| {
                !matches!(c, TemplateNode::Text(t) if t.data.trim().is_empty())
                    && !matches!(c, TemplateNode::Comment(_))
            });
            let last_content = children.iter().rposition(|c| {
                !matches!(c, TemplateNode::Text(t) if t.data.trim().is_empty())
                    && !matches!(c, TemplateNode::Comment(_))
            });

            let mut has_output_content = false;
            let mut is_first_content = true;

            for (i, child) in children.iter().enumerate() {
                // Skip comments
                if matches!(child, TemplateNode::Comment(_)) {
                    continue;
                }

                // For text nodes, check if it should become a space
                if let TemplateNode::Text(text) = child {
                    let data = &text.data;
                    if data.trim().is_empty() {
                        // Whitespace-only text: add space only if between content elements
                        if has_output_content
                            && last_content.is_some()
                            && i < last_content.unwrap()
                            && !data.is_empty()
                        {
                            self.output_parts.push(OutputPart::Html(" ".to_string()));
                        }
                        continue;
                    }

                    // For first text node with content, strip leading whitespace
                    if is_first_content {
                        let trimmed = data.trim_start();
                        if !trimmed.is_empty() {
                            self.output_parts
                                .push(OutputPart::Html(escape_html(trimmed)));
                        }
                        has_output_content = true;
                        is_first_content = false;
                        continue;
                    }
                }

                self.generate_node(child, false)?;
                has_output_content = true;
                is_first_content = false;
            }

            // End tag
            self.output_parts
                .push(OutputPart::Html(format!("</{}>", name)));
        }

        Ok(())
    }

    fn generate_option_element(&mut self, element: &RegularElement) -> Result<(), TransformError> {
        // Extract attributes as (name, value) pairs
        let mut attrs = Vec::new();
        for attr in &element.attributes {
            if let Attribute::Attribute(node) = attr {
                let name = node.name.to_string();
                match &node.value {
                    AttributeValue::True(_) => {
                        attrs.push((name, "true".to_string()));
                    }
                    AttributeValue::Sequence(parts) => {
                        let mut value = String::new();
                        for part in parts {
                            if let AttributeValuePart::Text(text) = part {
                                value.push_str(&text.data);
                            }
                        }
                        attrs.push((name, format!("'{}'", value)));
                    }
                    _ => {}
                }
            }
        }

        // Generate body parts
        let mut body_generator =
            ServerCodeGenerator::new(self.component_name.clone(), self.source.clone(), None);

        // Process children (skip leading/trailing whitespace)
        let children: Vec<_> = element.fragment.nodes.iter().collect();
        let len = children.len();

        let mut start_idx = 0;
        let mut end_idx = len;

        // Skip leading whitespace
        while start_idx < len {
            if let TemplateNode::Text(text) = children[start_idx] {
                if text.data.trim().is_empty() {
                    start_idx += 1;
                    continue;
                }
            }
            break;
        }

        // Skip trailing whitespace
        while end_idx > start_idx {
            if let TemplateNode::Text(text) = children[end_idx - 1] {
                if text.data.trim().is_empty() {
                    end_idx -= 1;
                    continue;
                }
            }
            break;
        }

        for node in children.iter().take(end_idx).skip(start_idx) {
            body_generator.generate_node(node, false)?;
        }

        self.output_parts.push(OutputPart::OptionElement {
            attrs,
            body: body_generator.output_parts,
        });

        Ok(())
    }

    fn generate_attribute(&mut self, attr: &Attribute) -> Result<Option<String>, TransformError> {
        match attr {
            Attribute::Attribute(node) => self.generate_attribute_node(node),
            Attribute::BindDirective(bind) => self.generate_bind_directive(bind),
            // Event handlers are not rendered on server
            Attribute::OnDirective(_) => Ok(None),
            _ => Ok(None),
        }
    }

    fn generate_bind_directive(
        &mut self,
        bind: &BindDirective,
    ) -> Result<Option<String>, TransformError> {
        let name = bind.name.as_str();
        let expr_start = bind.expression.start().unwrap_or(0) as usize;
        let expr_end = bind.expression.end().unwrap_or(0) as usize;

        if expr_end > expr_start && expr_end <= self.source.len() {
            let expr = self.source[expr_start..expr_end].trim().to_string();
            // For bind directives on server, output as $.attr() call
            Ok(Some(format!("${{$.attr('{}', {})}}", name, expr)))
        } else {
            Ok(None)
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
            AttributeValue::Expression(expr_tag) => {
                // Skip event handler attributes (onclick, onmousedown, etc.)
                if name.starts_with("on") {
                    return Ok(None);
                }
                // Generate $.attr() call for expression attributes
                let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                if expr_end > expr_start && expr_end <= self.source.len() {
                    let expr = self.source[expr_start..expr_end].trim().to_string();
                    Ok(Some(format!("${{$.attr('{}', {})}}", name, expr)))
                } else {
                    Ok(None)
                }
            }
        }
    }

    fn generate_expression_tag(&mut self, tag: &ExpressionTag) -> Result<(), TransformError> {
        let start = tag.start as usize;
        let end = tag.end as usize;

        if start + 1 < end && end <= self.source.len() {
            let expr_source = self.source[start + 1..end - 1].trim().to_string();

            // First, try constant variable lookup and folding
            let folded = self.try_fold_with_constants(&expr_source);

            match folded {
                ConstantFoldResult::Null => {
                    // Skip null expressions entirely
                }
                ConstantFoldResult::Constant(content) => {
                    // Output constant directly as HTML
                    self.output_parts.push(OutputPart::Html(content));
                }
                ConstantFoldResult::Dynamic => {
                    // Dynamic expression - needs escaping
                    self.output_parts.push(OutputPart::Expression(expr_source));
                }
            }
        }

        Ok(())
    }

    /// Try to fold an expression using known constant variables.
    fn try_fold_with_constants(&self, expr: &str) -> ConstantFoldResult {
        let trimmed = expr.trim();

        // First check if it's a simple variable that we know is constant
        if let Some(value) = self.constant_vars.get(trimmed) {
            return ConstantFoldResult::Constant(value.clone());
        }

        // Handle nullish coalescing with variable lookup
        if let Some(idx) = trimmed.find("??") {
            let left = trimmed[..idx].trim();
            let right = trimmed[idx + 2..].trim();

            // Try to fold left side with constants
            match self.try_fold_with_constants(left) {
                ConstantFoldResult::Null => {
                    // Left is null, evaluate right
                    return self.try_fold_with_constants(right);
                }
                ConstantFoldResult::Constant(val) => {
                    // Left is a non-null constant, use it
                    return ConstantFoldResult::Constant(val);
                }
                ConstantFoldResult::Dynamic => {
                    // Left is dynamic, can't fold
                }
            }
        }

        // Fall back to generic constant folding
        try_constant_fold_full(trimmed)
    }

    fn generate_component_usage(&mut self, component: &Component) -> Result<(), TransformError> {
        let comp_name = component.name.to_string();

        // Check if there's any prior content (HTML or expressions)
        let has_prior_content = self.output_parts.iter().any(|part| {
            matches!(part, OutputPart::Html(s) if !s.trim().is_empty())
                || matches!(part, OutputPart::Expression(_))
        });

        // Extract props and bindings
        let mut props = Vec::new();
        let mut bindings = Vec::new();

        for attr in &component.attributes {
            match attr {
                Attribute::Attribute(node) => {
                    let name = node.name.as_str();
                    if let AttributeValue::Expression(expr_tag) = &node.value {
                        // Get expression from ExpressionTag's expression field
                        let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                        let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                        if expr_end > expr_start && expr_end <= self.source.len() {
                            let expr_source = self.source[expr_start..expr_end].trim().to_string();
                            // Check if it's a shorthand property (name equals expression)
                            if expr_source == name {
                                props.push(name.to_string());
                            } else {
                                props.push(format!("{}: {}", name, expr_source));
                            }
                        }
                    }
                }
                Attribute::BindDirective(bind) => {
                    let prop_name = bind.name.as_str();
                    // Skip bind:this - it doesn't require do/while pattern on server
                    if prop_name == "this" {
                        continue;
                    }
                    let expr_start = bind.expression.start().unwrap_or(0) as usize;
                    let expr_end = bind.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let mut var_name = self.source[expr_start..expr_end].trim().to_string();
                        // Handle shorthand bindings where span might include "bind:"
                        if let Some(stripped) = var_name.strip_prefix("bind:") {
                            var_name = stripped.to_string();
                        }
                        bindings.push((prop_name.to_string(), var_name));
                    }
                }
                _ => {}
            }
        }

        // Check if component has children
        let children = self.generate_component_children(&component.fragment)?;

        // Use ComponentWithBindings if there are any bind directives
        if bindings.is_empty() {
            self.output_parts.push(OutputPart::Component {
                name: comp_name,
                props,
                has_prior_content,
                children,
            });
        } else {
            self.output_parts.push(OutputPart::ComponentWithBindings {
                name: comp_name,
                props,
                bindings,
                has_prior_content,
                children,
            });
        }

        Ok(())
    }

    fn generate_component_children(
        &mut self,
        fragment: &Fragment,
    ) -> Result<Option<Vec<OutputPart>>, TransformError> {
        // Filter out leading/trailing whitespace
        let children: Vec<_> = fragment.nodes.iter().collect();
        let len = children.len();

        if len == 0 {
            return Ok(None);
        }

        // Find first and last meaningful content
        let mut start_idx = 0;
        let mut end_idx = len;

        while start_idx < len {
            if let TemplateNode::Text(text) = children[start_idx] {
                if text.data.trim().is_empty() {
                    start_idx += 1;
                    continue;
                }
            }
            break;
        }

        while end_idx > start_idx {
            if let TemplateNode::Text(text) = children[end_idx - 1] {
                if text.data.trim().is_empty() {
                    end_idx -= 1;
                    continue;
                }
            }
            break;
        }

        // Check if there's any meaningful content
        if start_idx >= end_idx {
            return Ok(None);
        }

        // Generate body parts
        let mut body_generator =
            ServerCodeGenerator::new(self.component_name.clone(), self.source.clone(), None);

        // Add comment marker at start for proper placement
        body_generator.output_parts.push(OutputPart::Comment);

        let mut is_first = true;
        for node in children.iter().take(end_idx).skip(start_idx) {
            // For the first text node, normalize leading whitespace
            if is_first {
                if let TemplateNode::Text(text) = node {
                    // Normalize: trim leading whitespace, keep content
                    let normalized = text.data.trim_start();
                    if !normalized.is_empty() {
                        body_generator
                            .output_parts
                            .push(OutputPart::Html(escape_html(normalized)));
                    }
                    is_first = false;
                    continue;
                }
            }
            body_generator.generate_node(node, false)?;
            is_first = false;
        }

        Ok(Some(body_generator.output_parts))
    }

    fn generate_if_block(&mut self, _block: &IfBlock) -> Result<(), TransformError> {
        self.output_parts.push(OutputPart::Comment);
        Ok(())
    }

    fn generate_each_block(&mut self, block: &EachBlock) -> Result<(), TransformError> {
        // Get the iterable expression from the parser
        let start = block.expression.start().unwrap_or(0) as usize;
        let end = block.expression.end().unwrap_or(0) as usize;
        let iterable = if end > start && end <= self.source.len() {
            self.source[start..end].trim().to_string()
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
                None
            }
        } else {
            None
        };

        // Get optional index name from the parser
        let index_name = block.index.as_ref().map(|idx| idx.to_string());

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

    fn generate_await_block(&mut self, block: &AwaitBlock) -> Result<(), TransformError> {
        // Get the promise expression
        let expr_start = block.expression.start().unwrap_or(0) as usize;
        let expr_end = block.expression.end().unwrap_or(0) as usize;
        let promise_expr = if expr_end > expr_start && expr_end <= self.source.len() {
            self.source[expr_start..expr_end].trim().to_string()
        } else {
            "null".to_string()
        };

        // Get the then value variable name if present
        let then_param = if let Some(ref value) = block.value {
            let start = value.start().unwrap_or(0) as usize;
            let end = value.end().unwrap_or(0) as usize;
            if end > start && end <= self.source.len() {
                self.source[start..end].trim().to_string()
            } else {
                String::new()
            }
        } else {
            String::new()
        };

        self.output_parts.push(OutputPart::AwaitBlock {
            promise: promise_expr,
            then_param,
        });

        Ok(())
    }

    fn generate_key_block(&mut self, _block: &KeyBlock) -> Result<(), TransformError> {
        self.output_parts.push(OutputPart::Comment);
        Ok(())
    }

    fn generate_snippet_block(&mut self, block: &SnippetBlock) -> Result<(), TransformError> {
        // Extract snippet name from expression
        let name_start = block.expression.start().unwrap_or(0) as usize;
        let name_end = block.expression.end().unwrap_or(0) as usize;
        let name = if name_end > name_start && name_end <= self.source.len() {
            self.source[name_start..name_end].trim().to_string()
        } else {
            "snippet".to_string()
        };

        // Extract parameters
        let params: Vec<String> = block
            .parameters
            .iter()
            .map(|p| {
                let start = p.start().unwrap_or(0) as usize;
                let end = p.end().unwrap_or(0) as usize;
                if end > start && end <= self.source.len() {
                    self.source[start..end].trim().to_string()
                } else {
                    String::new()
                }
            })
            .filter(|s| !s.is_empty())
            .collect();

        // Generate body parts
        let mut body_generator =
            ServerCodeGenerator::new(self.component_name.clone(), self.source.clone(), None);

        // Add comment marker at start
        body_generator.output_parts.push(OutputPart::Comment);

        // Collect non-empty nodes
        let body_nodes: Vec<_> = block.body.nodes.iter().collect();
        let len = body_nodes.len();

        // Find first non-whitespace node
        let mut start_idx = 0;
        while start_idx < len {
            if let TemplateNode::Text(text) = body_nodes[start_idx] {
                if text.data.trim().is_empty() {
                    start_idx += 1;
                    continue;
                }
            }
            break;
        }

        // Find last non-whitespace node
        let mut end_idx = len;
        while end_idx > start_idx {
            if let TemplateNode::Text(text) = body_nodes[end_idx - 1] {
                if text.data.trim().is_empty() {
                    end_idx -= 1;
                    continue;
                }
            }
            break;
        }

        // Generate body content, trimming first text node
        for (i, node) in body_nodes
            .iter()
            .enumerate()
            .skip(start_idx)
            .take(end_idx - start_idx)
        {
            if i == start_idx {
                // First node - if it's text, trim it
                if let TemplateNode::Text(text) = node {
                    let trimmed = text.data.trim();
                    if !trimmed.is_empty() {
                        body_generator
                            .output_parts
                            .push(OutputPart::Html(escape_html(trimmed)));
                    }
                    continue;
                }
            }
            body_generator.generate_node(node, false)?;
        }

        // Store the snippet definition
        self.snippets.push(SnippetDef {
            name,
            params,
            body_parts: body_generator.output_parts,
        });

        Ok(())
    }

    fn generate_render_tag(&mut self, _tag: &RenderTag) -> Result<(), TransformError> {
        self.output_parts.push(OutputPart::Comment);
        Ok(())
    }

    fn generate_html_tag(&mut self, tag: &HtmlTag) -> Result<(), TransformError> {
        // Get the expression from HtmlTag
        let start = tag.expression.start().unwrap_or(0) as usize;
        let end = tag.expression.end().unwrap_or(0) as usize;

        if end > start && end <= self.source.len() {
            let expr = self.source[start..end].trim().to_string();
            self.output_parts.push(OutputPart::HtmlExpression(expr));
        } else {
            self.output_parts.push(OutputPart::Comment);
        }
        Ok(())
    }

    fn generate_svelte_element(
        &mut self,
        elem: &SvelteDynamicElement,
    ) -> Result<(), TransformError> {
        // Extract the tag expression from the source
        let start = elem.tag.start().unwrap_or(0) as usize;
        let end = elem.tag.end().unwrap_or(0) as usize;

        let tag_expr = if end > start && end <= self.source.len() {
            self.source[start..end].trim().to_string()
        } else {
            "null".to_string()
        };

        self.output_parts
            .push(OutputPart::SvelteElement { tag_expr });
        Ok(())
    }

    fn build(self) -> String {
        let body_code = Self::build_parts(&self.output_parts, 1);

        // Process script content if present
        let (props_param, script_code, hoisted_imports, needs_component_wrapper) =
            if let Some(script) = self.instance_script {
                let start = script.content.start().unwrap_or(0) as usize;
                let end = script.content.end().unwrap_or(0) as usize;
                let raw_script = if end > start && end <= self.source.len() {
                    self.source[start..end].to_string()
                } else {
                    String::new()
                };

                // Check if script uses $props()
                let uses_props = raw_script.contains("$props()");

                // Check if class fields use $state or $derived runes
                // This requires $$props and $$renderer.component() wrapper
                let has_class_state_fields = raw_script.contains("class ")
                    && (raw_script.contains("= $state(") || raw_script.contains("= $derived("));

                // Check if uses spread pattern: let props = $props() or let xxx = $props()
                // This requires $$renderer.component() wrapper with destructuring
                let uses_props_spread = detect_props_spread_pattern(&raw_script);

                // Extract imports and transform the rest
                let (imports, rest) = extract_imports(&raw_script);

                // Apply class field transformation for $derived fields
                let rest = transform_class_fields_server(&rest);

                let transformed = transform_script_content(&rest);

                if uses_props || has_class_state_fields {
                    (
                        ", $$props",
                        transformed,
                        imports,
                        uses_props_spread || has_class_state_fields,
                    )
                } else {
                    ("", transformed, imports, false)
                }
            } else {
                ("", String::new(), Vec::new(), false)
            };

        // Build hoisted imports section
        let imports_section = if hoisted_imports.is_empty() {
            String::new()
        } else {
            hoisted_imports.join("\n") + "\n"
        };

        // Build snippet functions
        let snippets_section = self.build_snippets();

        // Build the final output - handle empty body case
        let has_content = !script_code.is_empty() || !body_code.is_empty();

        let raw_output = if has_content {
            if needs_component_wrapper {
                // Wrap in $$renderer.component() with proper destructuring
                let inner_script = transform_props_spread(&script_code);
                let inner_body = Self::build_parts(&self.output_parts, 2);

                format!(
                    r#"import * as $ from 'svelte/internal/server';
{imports_section}{snippets_section}
export default function {component_name}($$renderer{props_param}) {{
	$$renderer.component(($$renderer) => {{
{inner_script}
{inner_body}	}});
}}"#,
                    imports_section = imports_section,
                    snippets_section = snippets_section,
                    component_name = self.component_name,
                    props_param = props_param,
                    inner_script = inner_script,
                    inner_body = inner_body
                )
            } else {
                let script_section = if script_code.is_empty() {
                    String::new()
                } else {
                    format!("{}\n", script_code)
                };

                format!(
                    r#"import * as $ from 'svelte/internal/server';
{imports_section}{snippets_section}
export default function {component_name}($$renderer{props_param}) {{
{script_section}{body_code}}}"#,
                    imports_section = imports_section,
                    snippets_section = snippets_section,
                    component_name = self.component_name,
                    props_param = props_param,
                    script_section = script_section,
                    body_code = body_code
                )
            }
        } else {
            // Empty body - use single line braces
            format!(
                r#"import * as $ from 'svelte/internal/server';
{imports_section}{snippets_section}
export default function {component_name}($$renderer{props_param}) {{}}"#,
                imports_section = imports_section,
                snippets_section = snippets_section,
                component_name = self.component_name,
                props_param = props_param,
            )
        };

        // Normalize the output through oxc parser/codegen
        match normalize_js(&raw_output) {
            Ok(normalized) => normalized,
            Err(_) => raw_output, // Fall back to raw output if parsing fails
        }
    }

    fn build_parts(parts: &[OutputPart], indent_level: usize) -> String {
        let mut body_code = String::new();
        let mut current_html = String::new();
        let indent = "\t".repeat(indent_level);

        let mut i = 0;
        while i < parts.len() {
            let part = &parts[i];
            match part {
                OutputPart::Html(html) => {
                    current_html.push_str(html);
                }
                OutputPart::Expression(expr) => {
                    current_html.push_str(&format!("${{$.escape({})}}", expr));
                }
                OutputPart::HtmlExpression(expr) => {
                    current_html.push_str(&format!("${{$.html({})}}", expr));
                }
                OutputPart::ComponentWithBindings {
                    name,
                    props,
                    bindings,
                    has_prior_content: _,
                    children: _, // TODO: Handle children for components with bindings
                } => {
                    // Don't flush whitespace-only HTML before component with bindings
                    // It will be absorbed into the do/while pattern
                    current_html.clear();

                    // Generate $$settled and $$inner_renderer
                    body_code.push_str(&format!("{}let $$settled = true;\n", indent));
                    body_code.push_str(&format!("{}let $$inner_renderer;\n\n", indent));

                    // Start $$render_inner function
                    body_code.push_str(&format!(
                        "{}function $$render_inner($$renderer) {{\n",
                        indent
                    ));

                    // Generate component call with getter/setter props
                    body_code.push_str(&format!("{}\t{}($$renderer, {{\n", indent, name));

                    // Regular props first
                    for prop in props {
                        body_code.push_str(&format!("{}\t\t{},\n", indent, prop));
                    }

                    // Generate getter/setter for each binding
                    for (prop_name, var_name) in bindings {
                        body_code.push_str(&format!("{}\t\tget {}() {{\n", indent, prop_name));
                        body_code.push_str(&format!("{}\t\t\treturn {};\n", indent, var_name));
                        body_code.push_str(&format!("{}\t\t}},\n\n", indent));
                        body_code
                            .push_str(&format!("{}\t\tset {}($$value) {{\n", indent, prop_name));
                        body_code.push_str(&format!("{}\t\t\t{} = $$value;\n", indent, var_name));
                        body_code.push_str(&format!("{}\t\t\t$$settled = false;\n", indent));
                        body_code.push_str(&format!("{}\t\t}}\n", indent));
                    }

                    body_code.push_str(&format!("{}\t}});\n", indent));

                    // Process remaining parts inside $$render_inner with comment marker
                    let remaining_parts = &parts[i + 1..];
                    if !remaining_parts.is_empty() {
                        // Build remaining parts with comment marker prefix
                        let inner_code = Self::build_parts_with_prefix(
                            remaining_parts,
                            indent_level + 1,
                            "<!---->",
                        );
                        body_code.push_str(&inner_code);
                    }

                    // Close $$render_inner function
                    body_code.push_str(&format!("{}}}\n\n", indent));

                    // Generate do/while loop
                    body_code.push_str(&format!("{}do {{\n", indent));
                    body_code.push_str(&format!("{}\t$$settled = true;\n", indent));
                    body_code.push_str(&format!(
                        "{}\t$$inner_renderer = $$renderer.copy();\n",
                        indent
                    ));
                    body_code.push_str(&format!("{}\t$$render_inner($$inner_renderer);\n", indent));
                    body_code.push_str(&format!("{}}} while (!$$settled);\n\n", indent));

                    // Subsume the inner renderer
                    body_code.push_str(&format!(
                        "{}$$renderer.subsume($$inner_renderer);\n",
                        indent
                    ));

                    // Skip remaining parts since they're already processed
                    i = parts.len();
                    continue;
                }
                OutputPart::Component {
                    name,
                    props,
                    has_prior_content,
                    children,
                } => {
                    // Flush current HTML
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    // Generate component call
                    if let Some(children_parts) = children {
                        // Component with children - multi-line format
                        body_code.push_str(&format!("{}{}($$renderer, {{\n", indent, name));

                        // Props
                        for prop in props {
                            body_code.push_str(&format!("{}\t{},\n", indent, prop));
                        }

                        // Children callback
                        body_code.push_str(&format!("{}\tchildren: ($$renderer) => {{\n", indent));
                        let children_code = Self::build_parts(children_parts, indent_level + 2);
                        body_code.push_str(&children_code);
                        body_code.push_str(&format!("{}\t}},\n", indent));

                        // Slots marker
                        body_code.push_str(&format!("{}\t$$slots: {{ default: true }}\n", indent));
                        body_code.push_str(&format!("{}}});\n", indent));
                    } else {
                        // No children - simple call
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
                OutputPart::SvelteElement { tag_expr } => {
                    // Flush current HTML before svelte:element
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    // Generate $.element call
                    body_code
                        .push_str(&format!("{}$.element($$renderer, {});\n", indent, tag_expr));
                }
                OutputPart::OptionElement { attrs, body } => {
                    // Flush current HTML before option element
                    if !current_html.is_empty() {
                        body_code.push_str(&format!(
                            "{}$$renderer.push(`{}`);\n\n",
                            indent, current_html
                        ));
                        current_html.clear();
                    }

                    // Generate $$renderer.option() call
                    let attrs_str = attrs
                        .iter()
                        .map(|(k, v)| format!("{}: {}", k, v))
                        .collect::<Vec<_>>()
                        .join(", ");

                    body_code.push_str(&format!(
                        "{}$$renderer.option({{ {} }}, ($$renderer) => {{\n",
                        indent, attrs_str
                    ));

                    // Body
                    let body_code_inner = Self::build_parts(body, indent_level + 1);
                    body_code.push_str(&body_code_inner);

                    // Close callback
                    body_code.push_str(&format!("{}}});\n", indent));
                }
                OutputPart::AwaitBlock {
                    promise,
                    then_param,
                } => {
                    // Flush current HTML before await block
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    // Generate $.await call
                    let pending_callback = "() => {}";
                    let then_callback = if then_param.is_empty() {
                        "() => {}".to_string()
                    } else {
                        format!("({}) => {{}}", then_param)
                    };

                    body_code.push_str(&format!(
                        "{}$.await($$renderer, {}, {}, {});\n",
                        indent, promise, pending_callback, then_callback
                    ));

                    // Add closing marker to the next push
                    current_html.push_str("<!--]-->");
                }
            }
            i += 1;
        }

        // Flush remaining HTML
        if !current_html.is_empty() {
            body_code.push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
        }

        body_code
    }

    /// Build output parts with an HTML prefix (for comment markers inside $$render_inner).
    fn build_parts_with_prefix(parts: &[OutputPart], indent_level: usize, prefix: &str) -> String {
        let mut body_code = String::new();
        let mut current_html = String::from(prefix);
        let indent = "\t".repeat(indent_level);

        let mut i = 0;
        while i < parts.len() {
            let part = &parts[i];
            match part {
                OutputPart::Html(html) => {
                    current_html.push_str(html);
                }
                OutputPart::Expression(expr) => {
                    current_html.push_str(&format!("${{$.escape({})}}", expr));
                }
                _ => {
                    // For other parts, flush and delegate to build_parts
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }
                    let remaining = &parts[i..];
                    let remaining_code = Self::build_parts(remaining, indent_level);
                    body_code.push_str(&remaining_code);
                    return body_code;
                }
            }
            i += 1;
        }

        // Flush remaining HTML
        if !current_html.is_empty() {
            body_code.push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
        }

        body_code
    }

    /// Build snippet function definitions.
    fn build_snippets(&self) -> String {
        if self.snippets.is_empty() {
            return String::new();
        }

        let mut result = String::new();

        for snippet in &self.snippets {
            // Generate function signature
            let params = if snippet.params.is_empty() {
                "$$renderer".to_string()
            } else {
                format!("$$renderer, {}", snippet.params.join(", "))
            };

            result.push_str(&format!("function {}({}) {{\n", snippet.name, params));

            // Generate body
            let body = Self::build_parts(&snippet.body_parts, 1);
            result.push_str(&body);

            result.push_str("}\n\n");
        }

        result
    }
}

/// Detect if script uses the spread pattern for $props(): `let props = $props()`
/// This requires a different transformation with $$renderer.component() wrapper.
fn detect_props_spread_pattern(script: &str) -> bool {
    // Look for patterns like "let props = $props()" or "let xxx = $props()"
    for line in script.lines() {
        let trimmed = line.trim();
        if (trimmed.starts_with("let ") || trimmed.starts_with("const "))
            && trimmed.contains("= $props()")
        {
            // Check if it's a simple assignment (not destructuring)
            // e.g., "let props = $props()" not "let { a, b } = $props()"
            let parts: Vec<&str> = trimmed.splitn(2, '=').collect();
            if parts.len() == 2 {
                let left = parts[0].trim();
                // If left side is just "let varname" (no braces), it's a spread pattern
                if !left.contains('{') && !left.contains('[') {
                    return true;
                }
            }
        }
    }
    false
}

/// Transform script code to use proper destructuring for props spread pattern.
/// Converts `let props = $$props` to `let { $$slots, $$events, ...props } = $$props`
fn transform_props_spread(script: &str) -> String {
    let mut result = String::new();

    for line in script.lines() {
        let trimmed = line.trim();

        // Check for `let xxx = $$props` pattern
        if (trimmed.starts_with("let ") || trimmed.starts_with("const "))
            && trimmed.contains("= $$props")
        {
            // Extract the variable name
            let parts: Vec<&str> = trimmed.splitn(2, '=').collect();
            if parts.len() == 2 {
                let left = parts[0].trim();
                // Remove let/const prefix to get var name
                let var_name = if let Some(stripped) = left.strip_prefix("let ") {
                    stripped.trim()
                } else if let Some(stripped) = left.strip_prefix("const ") {
                    stripped.trim()
                } else {
                    left
                };

                // Transform to destructuring pattern
                result.push_str(&format!(
                    "\t\tlet {{ $$slots, $$events, ...{} }} = $$props;\n",
                    var_name
                ));
                continue;
            }
        }

        // Keep other lines with adjusted indentation (add extra tab for wrapper)
        if !trimmed.is_empty() {
            result.push_str(&format!("\t\t{}\n", trimmed));
        }
    }

    // Remove trailing newline
    if result.ends_with('\n') {
        result.pop();
    }

    result
}

/// Extract constant variable bindings from script content.
/// A constant is a `let` or `const` with a simple string/number literal value
/// that doesn't use $state(), $derived(), or other runes.
fn extract_constant_vars(script: &str) -> HashMap<String, String> {
    let mut constants = HashMap::new();

    for line in script.lines() {
        let trimmed = line.trim();

        // Skip lines with runes - these are reactive
        if trimmed.contains("$state") || trimmed.contains("$derived") || trimmed.contains("$props")
        {
            continue;
        }

        // Look for `let name = 'value'` or `const name = 'value'` patterns
        let decl_start = if trimmed.starts_with("let ") {
            Some(4)
        } else if trimmed.starts_with("const ") {
            Some(6)
        } else {
            None
        };

        if let Some(start) = decl_start {
            let rest = &trimmed[start..];
            if let Some(eq_idx) = rest.find('=') {
                let name = rest[..eq_idx].trim();
                let value = rest[eq_idx + 1..].trim().trim_end_matches(';');

                // Only extract simple string literals
                if (value.starts_with('\'') && value.ends_with('\''))
                    || (value.starts_with('"') && value.ends_with('"'))
                {
                    let content = &value[1..value.len() - 1];
                    constants.insert(name.to_string(), content.to_string());
                }
            }
        }
    }

    constants
}

/// Result of constant folding.
enum ConstantFoldResult {
    /// Expression is null/undefined - should be omitted
    Null,
    /// Expression is a constant value (content without quotes)
    Constant(String),
    /// Expression cannot be folded - needs runtime evaluation
    Dynamic,
}

/// Full constant folding with result type.
fn try_constant_fold_full(expr: &str) -> ConstantFoldResult {
    let trimmed = expr.trim();

    // Handle null literal
    if trimmed == "null" || trimmed == "undefined" {
        return ConstantFoldResult::Null;
    }

    // Handle number literals
    if let Ok(n) = trimmed.parse::<i64>() {
        return ConstantFoldResult::Constant(n.to_string());
    }
    if let Ok(n) = trimmed.parse::<f64>() {
        return ConstantFoldResult::Constant(n.to_string());
    }

    // Check for string literals - these can be output directly
    if (trimmed.starts_with('\'') && trimmed.ends_with('\''))
        || (trimmed.starts_with('"') && trimmed.ends_with('"'))
    {
        // Extract content without quotes
        let content = &trimmed[1..trimmed.len() - 1];
        return ConstantFoldResult::Constant(content.to_string());
    }

    // Handle nullish coalescing: X ?? Y
    if let Some(idx) = trimmed.find("??") {
        let left = trimmed[..idx].trim();
        let right = trimmed[idx + 2..].trim();

        // Recursively fold left side
        match try_constant_fold_full(left) {
            ConstantFoldResult::Null => {
                // Left is null, evaluate right
                return try_constant_fold_full(right);
            }
            ConstantFoldResult::Constant(val) => {
                // Left is a non-null constant, use it
                return ConstantFoldResult::Constant(val);
            }
            ConstantFoldResult::Dynamic => {
                // Left is dynamic, can't fold
            }
        }
    }

    // Handle Math functions
    if trimmed.starts_with("Math.") {
        if let Some(result) = eval_math_expr(trimmed) {
            return ConstantFoldResult::Constant(result);
        }
    }

    ConstantFoldResult::Dynamic
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

/// Extract import statements from script content.
/// Returns (imports, rest) where imports is a Vec of import statements
/// and rest is the remaining script content.
fn extract_imports(script: &str) -> (Vec<String>, String) {
    let mut imports = Vec::new();
    let mut rest = String::new();

    for line in script.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("import ") || trimmed.starts_with("import{") {
            // This is an import statement - add to imports (without indentation)
            imports.push(trimmed.to_string());
        } else {
            // Regular line - keep in rest
            rest.push_str(line);
            rest.push('\n');
        }
    }

    // Trim trailing newline
    if rest.ends_with('\n') {
        rest.pop();
    }

    (imports, rest)
}

/// Transform script content for server-side rendering.
/// - Replaces `$props()` with `$$props`
/// - Replaces `$state(x)` with `x`
/// - Replaces `$derived(x)` with `x`
/// - Replaces `$derived.by(x)` with `x`
fn transform_script_content(script: &str) -> String {
    // First, transform the entire script to handle multi-line patterns
    let script = script.replace("$props()", "$$props");

    // Transform $state(x) to x - handles multi-line patterns
    let script = transform_rune_call_multiline(&script, "$state(");

    // Transform $derived.by(x) to x - must come before $derived(
    let script = transform_rune_call_multiline(&script, "$derived.by(");

    // Transform $derived(x) to x
    let script = transform_rune_call_multiline(&script, "$derived(");

    // Now process line by line for formatting
    let mut result = String::new();
    let lines: Vec<&str> = script.lines().collect();

    for line in lines {
        let trimmed = line.trim();

        // Skip empty lines at the start
        if result.is_empty() && trimmed.is_empty() {
            continue;
        }

        // Basic formatting fixes
        let line = format_js_line(line);

        // Add semicolons to statements that need them (ASI fix)
        let line = add_statement_semicolon(&line);

        // Normalize indentation to tabs
        if line.starts_with('\t') {
            result.push_str(&line);
        } else if trimmed.is_empty() {
            // Empty line - just add a blank line
        } else {
            // Strip leading spaces and add tab
            result.push('\t');
            result.push_str(trimmed);
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

        // Add space around = in assignments (but not == or ===, +=, -=, *=, /=, =>)
        if c == '=' {
            let next = chars.get(i + 1).copied();
            let prev = if !result.is_empty() {
                result.chars().last()
            } else {
                None
            };

            // Check if this is == or === or =>
            if next == Some('=') || next == Some('>') {
                result.push(c);
            } else if prev == Some('=')
                || prev == Some('!')
                || prev == Some('<')
                || prev == Some('>')
                || prev == Some('+')
                || prev == Some('-')
                || prev == Some('*')
                || prev == Some('/')
                || prev == Some('%')
                || prev == Some('&')
                || prev == Some('|')
                || prev == Some('^')
            {
                // Part of ==, !=, <=, >=, +=, -=, *=, /=, %=, &=, |=, ^=
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

/// Transform rune calls that may span multiple lines.
/// Handles patterns like $state(x), $derived(x), $derived.by(x).
fn transform_rune_call_multiline(script: &str, prefix: &str) -> String {
    let mut result = String::new();
    let chars: Vec<char> = script.chars().collect();
    let prefix_chars: Vec<char> = prefix.chars().collect();
    let prefix_len = prefix_chars.len();
    let mut i = 0;

    while i < chars.len() {
        // Check for the prefix
        if i + prefix_len <= chars.len() {
            let potential: String = chars[i..i + prefix_len].iter().collect();
            if potential == prefix {
                // Find the matching closing paren
                let mut depth = 1;
                let start = i + prefix_len;
                let mut end = start;
                let mut in_string = false;
                let mut string_char = ' ';

                while end < chars.len() && depth > 0 {
                    let c = chars[end];

                    // Track string state to avoid counting parens inside strings
                    if (c == '"' || c == '\'' || c == '`') && (end == 0 || chars[end - 1] != '\\') {
                        if !in_string {
                            in_string = true;
                            string_char = c;
                        } else if c == string_char {
                            in_string = false;
                        }
                    }

                    if !in_string {
                        match c {
                            '(' => depth += 1,
                            ')' => depth -= 1,
                            _ => {}
                        }
                    }
                    if depth > 0 {
                        end += 1;
                    }
                }

                // Extract the inner expression
                let inner: String = chars[start..end].iter().collect();
                let trimmed_inner = inner.trim();

                // Check if this is a class field pattern: `= $rune()`
                // When inner is empty, check if we need to remove the `= ` before it
                if trimmed_inner.is_empty() {
                    // Look back to see if there's " = " before the rune call
                    let result_trimmed = result.trim_end();
                    if result_trimmed.ends_with('=') {
                        // Remove the trailing " = " or "= "
                        while result.ends_with('=') || result.ends_with(' ') {
                            result.pop();
                        }
                    }
                } else {
                    result.push_str(&inner);
                }

                i = end + 1; // Skip past the closing paren
                continue;
            }
        }

        result.push(chars[i]);
        i += 1;
    }

    result
}

/// Add semicolons to statements that need them (ASI fix).
/// This is a heuristic approach for common patterns.
fn add_statement_semicolon(line: &str) -> String {
    let trimmed = line.trim();

    // Skip empty lines
    if trimmed.is_empty() {
        return line.to_string();
    }

    // Lines that already have proper termination
    if trimmed.ends_with(';')
        || trimmed.ends_with('{')
        || trimmed.ends_with('}')
        || trimmed.ends_with(',')
    {
        return line.to_string();
    }

    // Lines that look like statements needing semicolons:
    // - Variable declarations: const/let/var ... ending with )
    // - Assignments ending with )
    if (trimmed.starts_with("const ") || trimmed.starts_with("let ") || trimmed.starts_with("var "))
        && trimmed.ends_with(')')
    {
        return format!("{};", line);
    }

    line.to_string()
}

/// Transform class fields with $derived runes for server-side.
/// Server-side:
/// - `$state` fields are transformed to plain values (already handled by transform_rune_call_multiline)
/// - `$derived` fields become private fields with getter/setter
fn transform_class_fields_server(script: &str) -> String {
    // Check if script contains a class with $derived fields
    if !script.contains("class ") || !script.contains("$derived") {
        return script.to_string();
    }

    // Find the class body
    let Some(class_pos) = script.find("class ") else {
        return script.to_string();
    };

    // Find the opening brace of the class
    let after_class = &script[class_pos..];
    let Some(brace_pos) = after_class.find('{') else {
        return script.to_string();
    };

    let class_header = &after_class[..brace_pos + 1];

    // Find matching closing brace
    let class_body_start = class_pos + brace_pos + 1;
    let mut brace_depth = 1;
    let mut class_body_end = class_body_start;

    for (i, c) in script[class_body_start..].char_indices() {
        match c {
            '{' => brace_depth += 1,
            '}' => {
                brace_depth -= 1;
                if brace_depth == 0 {
                    class_body_end = class_body_start + i;
                    break;
                }
            }
            _ => {}
        }
    }

    let class_body = &script[class_body_start..class_body_end];

    // Parse class fields with $derived
    #[derive(Debug)]
    struct DerivedField {
        name: String,
        is_private: bool,
        value: String,
    }

    let mut derived_fields: Vec<DerivedField> = Vec::new();
    let mut other_lines: Vec<String> = Vec::new();
    let mut constructor_lines: Vec<String> = Vec::new();
    let mut in_constructor = false;
    let mut constructor_depth = 0;

    for line in class_body.lines() {
        let trimmed = line.trim();

        // Track constructor
        if trimmed.contains("constructor(") {
            in_constructor = true;
            constructor_lines.push(trimmed.to_string());
            if trimmed.contains('{') {
                constructor_depth = 1;
            }
            continue;
        }

        if in_constructor {
            constructor_lines.push(trimmed.to_string());
            for c in trimmed.chars() {
                match c {
                    '{' => constructor_depth += 1,
                    '}' => {
                        constructor_depth -= 1;
                        if constructor_depth == 0 {
                            in_constructor = false;
                        }
                    }
                    _ => {}
                }
            }
            continue;
        }

        // Check for $derived field
        if trimmed.contains("= $derived(") || trimmed.contains("=$derived(") {
            // Parse the field
            let is_private = trimmed.starts_with('#');
            if let Some(eq_pos) = trimmed.find('=') {
                let name = trimmed[..eq_pos].trim().trim_start_matches('#').to_string();

                // Find the derived value
                let derived_pattern = "$derived(";
                if let Some(derived_pos) = trimmed.find(derived_pattern) {
                    let value_start = derived_pos + derived_pattern.len();
                    let after_paren = &trimmed[value_start..];

                    // Find matching closing paren
                    if let Some(value_end) = find_matching_paren_server(after_paren) {
                        let value = after_paren[..value_end].to_string();
                        derived_fields.push(DerivedField {
                            name,
                            is_private,
                            value,
                        });
                        continue;
                    }
                }
            }
        }

        // Other lines
        if !trimmed.is_empty() {
            other_lines.push(trimmed.to_string());
        }
    }

    if derived_fields.is_empty() {
        return script.to_string();
    }

    // Build transformed class body
    let mut new_class_body = String::new();

    // Add non-derived fields first
    for line in &other_lines {
        new_class_body.push_str(&format!("\t\t{}\n", line));
    }

    // Add derived fields with getter/setter
    for field in &derived_fields {
        let private_name = format!("#{}", field.name);

        // Private field with $.derived
        new_class_body.push_str(&format!(
            "\t\t{} = $.derived(() => ({}));\n",
            private_name, field.value
        ));

        // Add getter/setter only for public fields
        if !field.is_private {
            new_class_body.push('\n');
            new_class_body.push_str(&format!(
                "\t\tget {}() {{\n\t\t\treturn this.{}();\n\t\t}}\n",
                field.name, private_name
            ));
            new_class_body.push('\n');
            new_class_body.push_str(&format!(
                "\t\tset {}($$value) {{\n\t\t\treturn this.{}($$value);\n\t\t}}\n",
                field.name, private_name
            ));
        }
    }

    // Add constructor
    if !constructor_lines.is_empty() {
        new_class_body.push('\n');
        for line in &constructor_lines {
            new_class_body.push_str(&format!("\t\t{}\n", line));
        }
    }

    // Build the final result
    let before_class = &script[..class_pos];
    let after_class_body = &script[class_body_end + 1..]; // Skip closing brace

    format!(
        "{}{}\n{}\t}}{}",
        before_class, class_header, new_class_body, after_class_body
    )
}

/// Find matching parenthesis (for server-side parsing)
fn find_matching_paren_server(s: &str) -> Option<usize> {
    let mut depth = 1;
    for (i, c) in s.char_indices() {
        match c {
            '(' | '{' | '[' => depth += 1,
            ')' | '}' | ']' => {
                depth -= 1;
                if depth == 0 {
                    return Some(i);
                }
            }
            _ => {}
        }
    }
    None
}
