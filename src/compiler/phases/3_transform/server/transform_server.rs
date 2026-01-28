//! Server-side code generation.
//!
//! Generates JavaScript code for server-side rendering (SSR).

use super::super::TransformError;
use super::super::js_ast::normalize_js;
use super::super::shared::{escape_attr, escape_html, is_void_element};
use crate::ast::template::{
    Attribute, AttributeNode, AttributeValue, AttributeValuePart, AwaitBlock, BindDirective,
    ClassDirective, Component, ConstTag, EachBlock, ExpressionTag, Fragment, HtmlTag, IfBlock,
    KeyBlock, RegularElement, RenderTag, Root, Script, SnippetBlock, StyleDirective,
    SvelteDynamicElement, SvelteElement, TemplateNode, Text,
};
use crate::compiler::CompileOptions;
use crate::compiler::phases::phase2_analyze::ComponentAnalysis;
use crate::compiler::phases::phase2_analyze::scope::BindingKind;

use rustc_hash::FxHashMap;

/// Check if a property name is a valid JavaScript identifier.
/// If not, it needs to be quoted in object literals.
fn is_valid_js_identifier(name: &str) -> bool {
    if name.is_empty() {
        return false;
    }

    let mut chars = name.chars();

    // First character must be a letter, underscore, or dollar sign
    let first = chars.next().unwrap();
    if !first.is_alphabetic() && first != '_' && first != '$' {
        return false;
    }

    // Subsequent characters can also include digits
    for c in chars {
        if !c.is_alphanumeric() && c != '_' && c != '$' {
            return false;
        }
    }

    true
}

/// Quote a property name if needed for JavaScript object literal syntax.
/// Returns the name as-is if it's a valid identifier, or quoted if it contains special characters.
fn quote_prop_name(name: &str) -> String {
    if is_valid_js_identifier(name) {
        name.to_string()
    } else {
        format!("'{}'", name)
    }
}

/// Collapse whitespace sequences (including newlines) to single spaces.
/// This matches the behavior of clean_nodes in the official compiler.
fn collapse_whitespace(s: &str) -> String {
    let trimmed = s.trim();
    let has_leading_ws = s.chars().next().is_some_and(|c| c.is_whitespace());
    let has_trailing_ws = s.chars().last().is_some_and(|c| c.is_whitespace());

    // Collapse internal whitespace sequences to single spaces
    let mut result = String::new();
    let mut in_whitespace = false;

    if has_leading_ws {
        result.push(' ');
    }

    for c in trimmed.chars() {
        if c.is_whitespace() {
            if !in_whitespace {
                result.push(' ');
                in_whitespace = true;
            }
        } else {
            result.push(c);
            in_whitespace = false;
        }
    }

    // Remove trailing space that was added if content ended with whitespace
    if in_whitespace && !has_trailing_ws {
        result.pop();
    } else if has_trailing_ws && !result.ends_with(' ') {
        result.push(' ');
    }

    result
}

/// Trim leading and trailing whitespace from output parts.
/// This trims whitespace from the first and last Html parts if they exist.
fn trim_output_parts(parts: &mut Vec<OutputPart>) {
    // Trim leading whitespace from first Html part
    if let Some(OutputPart::Html(html)) = parts.first_mut() {
        *html = html.trim_start().to_string();
        if html.is_empty() {
            parts.remove(0);
        }
    }

    // Trim trailing whitespace from last Html part
    if let Some(OutputPart::Html(html)) = parts.last_mut() {
        *html = html.trim_end().to_string();
        if html.is_empty() {
            parts.pop();
        }
    }
}

/// Transform a component analysis into server-side JavaScript.
///
/// # Arguments
///
/// * `analysis` - The component analysis from Phase 2
/// * `ast` - The parsed AST from Phase 1 (to avoid re-parsing)
/// * `_source` - The original source code (for backward compatibility)
/// * `_options` - Compile options
pub fn transform_server(
    analysis: &ComponentAnalysis,
    ast: &Root,
    _source: &str,
    _options: &CompileOptions,
) -> Result<String, TransformError> {
    let component_name = &analysis.name;

    // Use the AST's instance script directly (no re-parsing needed)
    let instance_script = ast.instance.as_ref().map(|s| s.as_ref());
    // Use the AST's module script (context="module")
    let module_script = ast.module.as_ref().map(|s| s.as_ref());

    let mut generator = ServerCodeGenerator::new(
        component_name.clone(),
        analysis.source.clone(),
        instance_script,
        module_script,
        Some(analysis),
    );

    // Use the AST fragment directly (no re-parsing needed)
    generator.generate_component(&ast.fragment)?;

    Ok(generator.build())
}

/// A snippet definition.
#[derive(Debug)]
struct SnippetDef {
    name: String,
    params: Vec<String>,
    body_parts: Vec<OutputPart>,
    /// Whether this snippet can be hoisted to module level
    can_hoist: bool,
}

/// Server-side code generator.
struct ServerCodeGenerator<'a> {
    component_name: String,
    source: String,
    output_parts: Vec<OutputPart>,
    instance_script: Option<&'a Script>,
    /// Module script (context="module") - executed at module level outside component
    module_script: Option<&'a Script>,
    /// Map of constant variable names to their values
    constant_vars: FxHashMap<String, String>,
    /// Snippet definitions to be generated at module level
    snippets: Vec<SnippetDef>,
    /// Component analysis from Phase 2
    analysis: Option<&'a ComponentAnalysis>,
    /// Whether the component uses store subscriptions (requires $$store_subs variable)
    uses_store_subs: bool,
}

/// A part of the output - either static HTML or dynamic code.
#[derive(Debug)]
enum OutputPart {
    Html(String),
    Expression(String),
    /// Raw expression that doesn't need escaping (e.g., $.attributes())
    RawExpression(String),
    /// Raw HTML expression - {@html expr}
    HtmlExpression(String),
    Component {
        name: String,
        props: Vec<String>,
        /// Spread expressions (e.g., `attrs` from `{...attrs}`)
        spreads: Vec<String>,
        has_prior_content: bool,
        children: Option<Vec<OutputPart>>,
        /// Snippets defined inside the component (name, params, body)
        snippets: Vec<(String, Vec<String>, Vec<OutputPart>)>,
        /// Slot names to add to $$slots
        slot_names: Vec<String>,
    },
    /// Component with bind directives - requires do/while settling
    ComponentWithBindings {
        name: String,
        props: Vec<String>,
        /// Spread expressions (e.g., `attrs` from `{...attrs}`)
        spreads: Vec<String>,
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
    /// If block - produces an if statement
    IfBlock {
        test_expr: String,
        consequent_body: Vec<OutputPart>,
        alternate_body: Option<Vec<OutputPart>>,
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
        pending_body: Vec<OutputPart>,
        then_body: Vec<OutputPart>,
        catch_param: String,
        catch_body: Vec<OutputPart>,
    },
    /// svelte:boundary - async error boundary
    SvelteBoundary {
        pending_body: Vec<OutputPart>,
    },
    /// Render tag call - calls a snippet function
    RenderCall(String),
    /// Const declaration - produces const variable
    ConstDeclaration(String),
}

impl<'a> ServerCodeGenerator<'a> {
    fn new(
        component_name: String,
        source: String,
        instance_script: Option<&'a Script>,
        module_script: Option<&'a Script>,
        analysis: Option<&'a ComponentAnalysis>,
    ) -> Self {
        // Extract constant variables from script
        let constant_vars = if let Some(script) = instance_script {
            let start = script.content.start().unwrap_or(0) as usize;
            let end = script.content.end().unwrap_or(0) as usize;
            if end > start && end <= source.len() {
                extract_constant_vars(&source[start..end])
            } else {
                FxHashMap::default()
            }
        } else {
            FxHashMap::default()
        };

        // Check if the analysis has any StoreSub bindings
        let uses_store_subs = analysis
            .map(|a| {
                a.root
                    .bindings
                    .iter()
                    .any(|b| matches!(b.kind, BindingKind::StoreSub))
            })
            .unwrap_or(false);

        Self {
            component_name,
            source,
            // Pre-allocate capacity based on typical component sizes
            // Average component has ~50-100 output parts
            output_parts: Vec::with_capacity(64),
            instance_script,
            module_script,
            constant_vars,
            // Most components have 0-5 snippets
            snippets: Vec::with_capacity(4),
            analysis,
            uses_store_subs,
        }
    }

    /// Transform store subscriptions in an expression.
    /// Converts `$store` to `$.store_get($$store_subs ??= {}, '$store', store)`.
    fn transform_store_refs(&self, expr: &str) -> String {
        if !self.uses_store_subs {
            return expr.to_string();
        }

        let analysis = match self.analysis {
            Some(a) => a,
            None => return expr.to_string(),
        };

        // Collect store subscription names from the analysis
        let store_sub_names: Vec<&str> = analysis
            .root
            .bindings
            .iter()
            .filter(|b| matches!(b.kind, BindingKind::StoreSub))
            .map(|b| b.name.as_str())
            .collect();

        if store_sub_names.is_empty() {
            return expr.to_string();
        }

        let mut result = expr.to_string();

        // Transform each store subscription
        for name in store_sub_names {
            // Skip if it doesn't start with $
            if !name.starts_with('$') {
                continue;
            }

            // Get the store variable name (without $)
            let store_name = &name[1..];

            // Replace $store with $.store_get($$store_subs ??= {}, '$store', store)
            // We need to be careful to only replace complete identifiers, not substrings
            result = replace_store_identifier(&result, name, store_name);
        }

        result
    }

    fn generate_component(&mut self, fragment: &Fragment) -> Result<(), TransformError> {
        let nodes: Vec<_> = fragment.nodes.iter().collect();
        let len = nodes.len();

        // Find indices of first and last non-whitespace nodes
        let first_meaningful_idx = nodes
            .iter()
            .position(|n| !matches!(n, TemplateNode::Text(t) if t.data.trim().is_empty()));
        let last_meaningful_idx = nodes
            .iter()
            .rposition(|n| !matches!(n, TemplateNode::Text(t) if t.data.trim().is_empty()));

        // If the first meaningful node is a Text or ExpressionTag, add <!---->
        // to prevent text fusion during hydration
        let first_meaningful_node = first_meaningful_idx.map(|i| &nodes[i]);
        let needs_anchor = matches!(
            first_meaningful_node,
            Some(TemplateNode::Text(_)) | Some(TemplateNode::ExpressionTag(_))
        );

        if needs_anchor {
            self.output_parts
                .push(OutputPart::Html("<!---->".to_string()));
        }

        for (i, node) in nodes.iter().enumerate() {
            // Skip whitespace-only text at root level
            if let TemplateNode::Text(text) = node
                && text.data.trim().is_empty()
            {
                // Skip if before first meaningful content
                if first_meaningful_idx.is_some() && i < first_meaningful_idx.unwrap() {
                    continue;
                }
                // Skip if after last meaningful content
                if last_meaningful_idx.is_some() && i > last_meaningful_idx.unwrap() {
                    continue;
                }
                // Skip whitespace between snippets and other elements at root level
                // Check if previous node is a snippet
                if i > 0
                    && let TemplateNode::SnippetBlock(_) = nodes[i - 1]
                {
                    continue;
                }
                // Check if next node is a snippet
                if i + 1 < len
                    && let TemplateNode::SnippetBlock(_) = nodes[i + 1]
                {
                    continue;
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
            TemplateNode::SvelteBoundary(boundary) => self.generate_svelte_boundary(boundary),
            TemplateNode::ConstTag(tag) => self.generate_const_tag(tag),
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
            // Collapse all whitespace sequences (including newlines) to single spaces
            // This matches the behavior of clean_nodes in the official compiler
            let collapsed = collapse_whitespace(data);
            self.output_parts
                .push(OutputPart::Html(escape_html(&collapsed)));
        }
        Ok(())
    }

    fn generate_element(&mut self, element: &RegularElement) -> Result<(), TransformError> {
        let name = element.name.as_str();

        // Handle <option> element specially
        if name == "option" {
            return self.generate_option_element(element);
        }

        // Check if we have spread attributes
        let has_spread = element
            .attributes
            .iter()
            .any(|attr| matches!(attr, Attribute::SpreadAttribute(_)));

        // If we have spread attributes, use $.attributes() for the whole thing
        if has_spread {
            return self.generate_element_with_spread(element);
        }

        // Collect directives and base attributes
        let mut class_directives: Vec<&ClassDirective> = Vec::new();
        let mut style_directives: Vec<&StyleDirective> = Vec::new();
        let mut base_class: Option<String> = None;
        let mut base_style: Option<String> = None;

        for attr in &element.attributes {
            match attr {
                Attribute::ClassDirective(dir) => {
                    class_directives.push(dir);
                }
                Attribute::StyleDirective(dir) => {
                    style_directives.push(dir);
                }
                Attribute::Attribute(node) if node.name.as_str() == "class" => {
                    base_class = self.extract_attribute_text_value(node);
                }
                Attribute::Attribute(node) if node.name.as_str() == "style" => {
                    base_style = self.extract_attribute_text_value(node);
                }
                _ => {}
            }
        }

        // Start tag
        let mut tag = format!("<{}", name);

        // Attributes - handle class and style specially if directives exist
        for attr in &element.attributes {
            match attr {
                // Skip class/style directives - handled separately
                Attribute::ClassDirective(_) | Attribute::StyleDirective(_) => continue,
                // Skip class attribute if we have class directives
                Attribute::Attribute(node)
                    if node.name.as_str() == "class" && !class_directives.is_empty() =>
                {
                    continue;
                }
                // Skip style attribute if we have style directives
                Attribute::Attribute(node)
                    if node.name.as_str() == "style" && !style_directives.is_empty() =>
                {
                    continue;
                }
                _ => {
                    if let Some(attr_str) = self.generate_attribute(attr)? {
                        tag.push_str(&attr_str);
                    }
                }
            }
        }

        // Generate $.attr_class() if we have class directives
        if !class_directives.is_empty() {
            let attr_class_call =
                self.generate_attr_class_call(&class_directives, base_class.as_deref())?;
            tag.push_str(&attr_class_call);
        }

        // Generate $.attr_style() if we have style directives
        if !style_directives.is_empty() {
            let attr_style_call =
                self.generate_attr_style_call(&style_directives, base_style.as_deref())?;
            tag.push_str(&attr_style_call);
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

                    // For text nodes, strip leading/trailing whitespace and collapse internal whitespace
                    if is_first_content {
                        // First content: trim leading whitespace
                        // If this is also the last content, trim trailing too
                        let is_last = last_content.is_some() && i == last_content.unwrap();
                        let trimmed = if is_last {
                            // Both first and last - trim both sides
                            data.trim()
                        } else {
                            data.trim_start()
                        };
                        if !trimmed.is_empty() {
                            // Collapse internal whitespace
                            let collapsed = collapse_whitespace(trimmed);
                            self.output_parts
                                .push(OutputPart::Html(escape_html(&collapsed)));
                        }
                        has_output_content = true;
                        is_first_content = false;
                        continue;
                    }

                    // Check if this is the last content - trim trailing
                    if last_content.is_some() && i == last_content.unwrap() {
                        let trimmed = data.trim_end();
                        if !trimmed.is_empty() {
                            let collapsed = collapse_whitespace(trimmed);
                            self.output_parts
                                .push(OutputPart::Html(escape_html(&collapsed)));
                        }
                        has_output_content = true;
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

    /// Generate an element with spread attributes using $.attributes().
    fn generate_element_with_spread(
        &mut self,
        element: &RegularElement,
    ) -> Result<(), TransformError> {
        let name = element.name.as_str();

        // Build the object literal for $.attributes()
        let mut object_parts: Vec<String> = Vec::new();

        for attr in &element.attributes {
            match attr {
                Attribute::SpreadAttribute(spread) => {
                    // Get the spread expression from source
                    let expr_start = spread.expression.start().unwrap_or(0) as usize;
                    let expr_end = spread.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let expr = self.source[expr_start..expr_end].trim().to_string();
                        object_parts.push(format!("...{}", expr));
                    }
                }
                Attribute::Attribute(node) => {
                    // Skip event handlers
                    if node.name.starts_with("on") {
                        continue;
                    }
                    let attr_name = node.name.as_str();
                    let value = self.extract_attribute_value_as_string(node)?;
                    object_parts.push(format!("{}: {}", attr_name, value));
                }
                Attribute::BindDirective(bind) => {
                    let bind_name = bind.name.as_str();
                    let expr_start = bind.expression.start().unwrap_or(0) as usize;
                    let expr_end = bind.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let expr = self.source[expr_start..expr_end].trim().to_string();
                        object_parts.push(format!("{}: {}", bind_name, expr));
                    }
                }
                // Skip class/style directives and event handlers for now
                Attribute::ClassDirective(_) | Attribute::StyleDirective(_) => {}
                Attribute::OnDirective(_) => {}
                _ => {}
            }
        }

        let object_literal = format!("{{ {} }}", object_parts.join(", "));

        // Start tag with $.attributes() call
        let tag = format!("<{}", name);
        self.output_parts.push(OutputPart::Html(tag));

        // Add $.attributes() expression (raw, no escaping needed)
        self.output_parts.push(OutputPart::RawExpression(format!(
            "$.attributes({})",
            object_literal
        )));

        if is_void_element(name) {
            self.output_parts.push(OutputPart::Html("/>".to_string()));
        } else {
            self.output_parts.push(OutputPart::Html(">".to_string()));

            // Generate children
            for child in &element.fragment.nodes {
                if matches!(child, TemplateNode::Comment(_)) {
                    continue;
                }
                self.generate_node(child, false)?;
            }

            // End tag
            self.output_parts
                .push(OutputPart::Html(format!("</{}>", name)));
        }

        Ok(())
    }

    /// Extract attribute value as a string representation for code generation.
    fn extract_attribute_value_as_string(
        &self,
        node: &AttributeNode,
    ) -> Result<String, TransformError> {
        match &node.value {
            AttributeValue::True(_) => Ok("true".to_string()),
            AttributeValue::Sequence(parts) => {
                let mut value = String::new();
                for part in parts {
                    match part {
                        AttributeValuePart::Text(text) => {
                            value.push_str(&text.data);
                        }
                        AttributeValuePart::ExpressionTag(expr_tag) => {
                            // Extract expression from source
                            let start = expr_tag.expression.start().unwrap_or(0) as usize;
                            let end = expr_tag.expression.end().unwrap_or(0) as usize;
                            if end > start && end <= self.source.len() {
                                let expr = self.source[start..end].trim();
                                // If mixed with text, we need template literal, but for simple case just return
                                value.push_str(&format!("${{{}}}", expr));
                            }
                        }
                    }
                }
                // If it looks like it needs to be a template literal (has ${...})
                if value.contains("${") {
                    Ok(format!("`{}`", value))
                } else {
                    Ok(format!("'{}'", value))
                }
            }
            AttributeValue::Expression(expr_tag) => {
                let start = expr_tag.expression.start().unwrap_or(0) as usize;
                let end = expr_tag.expression.end().unwrap_or(0) as usize;
                if end > start && end <= self.source.len() {
                    Ok(self.source[start..end].trim().to_string())
                } else {
                    Ok("undefined".to_string())
                }
            }
        }
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
        let mut body_generator = ServerCodeGenerator::new(
            self.component_name.clone(),
            self.source.clone(),
            None,
            None,
            None,
        );

        // Process children (skip leading/trailing whitespace)
        let children: Vec<_> = element.fragment.nodes.iter().collect();
        let len = children.len();

        let mut start_idx = 0;
        let mut end_idx = len;

        // Skip leading whitespace
        while start_idx < len {
            if let TemplateNode::Text(text) = children[start_idx]
                && text.data.trim().is_empty()
            {
                start_idx += 1;
                continue;
            }
            break;
        }

        // Skip trailing whitespace
        while end_idx > start_idx {
            if let TemplateNode::Text(text) = children[end_idx - 1]
                && text.data.trim().is_empty()
            {
                end_idx -= 1;
                continue;
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

        // Skip bind:this - it's a client-only binding with no server representation
        if name == "this" {
            return Ok(None);
        }

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

                // Check if the expression is a literal - if so, inline it directly
                if let Some(literal_value) = self.extract_literal_value(&expr_tag.expression) {
                    // Inline literal values directly: href="#" instead of ${$.attr('href', '#')}
                    return Ok(Some(format!(
                        " {}=\"{}\"",
                        name,
                        escape_attr(&literal_value)
                    )));
                }

                // Generate $.attr() call for non-literal expression attributes
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

    /// Extract a literal string or number value from an Expression.
    /// Returns Some(string_value) if the expression is a Literal, None otherwise.
    fn extract_literal_value(&self, expr: &crate::ast::js::Expression) -> Option<String> {
        let json = expr.as_json();
        let expr_type = json.get("type").and_then(|t| t.as_str())?;

        if expr_type == "Literal" {
            // Check if it has a string value
            if let Some(value) = json.get("value") {
                match value {
                    serde_json::Value::String(s) => return Some(s.clone()),
                    serde_json::Value::Number(n) => return Some(n.to_string()),
                    serde_json::Value::Bool(b) => return Some(b.to_string()),
                    _ => {}
                }
            }
        }

        None
    }

    /// Extract a plain text value from an attribute.
    fn extract_attribute_text_value(&self, node: &AttributeNode) -> Option<String> {
        match &node.value {
            AttributeValue::Sequence(parts) => {
                let mut value = String::new();
                for part in parts {
                    if let AttributeValuePart::Text(text) = part {
                        value.push_str(&text.data);
                    }
                }
                Some(value)
            }
            AttributeValue::True(_) => None,
            AttributeValue::Expression(_) => None,
        }
    }

    /// Generate a $.attr_class() call for class directives.
    fn generate_attr_class_call(
        &self,
        directives: &[&ClassDirective],
        base_class: Option<&str>,
    ) -> Result<String, TransformError> {
        // Build the directives object
        let mut directive_props = Vec::new();
        for dir in directives {
            // Get the expression - if it's an Identifier with the same name, use shorthand
            let expr_start = dir.expression.start().unwrap_or(0) as usize;
            let expr_end = dir.expression.end().unwrap_or(0) as usize;

            let expr_value = if expr_end > expr_start && expr_end <= self.source.len() {
                self.source[expr_start..expr_end].trim().to_string()
            } else {
                dir.name.to_string()
            };

            directive_props.push(format!("'{}': {}", dir.name, expr_value));
        }

        let base = base_class.unwrap_or("");
        let directives_obj = format!("{{ {} }}", directive_props.join(", "));

        // Output: ${$.attr_class('base', void 0, { 'foo': foo })}
        Ok(format!(
            "${{$.attr_class('{}', void 0, {})}}",
            base, directives_obj
        ))
    }

    /// Generate a $.attr_style() call for style directives.
    fn generate_attr_style_call(
        &self,
        directives: &[&StyleDirective],
        base_style: Option<&str>,
    ) -> Result<String, TransformError> {
        // Separate normal and important properties
        let mut normal_props = Vec::new();
        let mut important_props = Vec::new();

        for dir in directives {
            let value = match &dir.value {
                AttributeValue::True(_) => {
                    // Shorthand: style:color means style:color={color}
                    dir.name.to_string()
                }
                AttributeValue::Sequence(parts) => {
                    // Static text value
                    let mut text_val = String::new();
                    for part in parts {
                        if let AttributeValuePart::Text(text) = part {
                            text_val.push_str(&text.data);
                        }
                    }
                    format!("'{}'", text_val)
                }
                AttributeValue::Expression(expr_tag) => {
                    let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                    let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        self.source[expr_start..expr_end].trim().to_string()
                    } else {
                        "undefined".to_string()
                    }
                }
            };

            // CSS custom properties (--var) keep their case, others get lowercased
            let prop_name = if dir.name.starts_with("--") {
                dir.name.to_string()
            } else {
                dir.name.to_lowercase().replace("_", "-")
            };

            // Only quote property names that contain special characters like hyphens
            let prop_str = if prop_name.contains('-') {
                format!("'{}': {}", prop_name, value)
            } else {
                format!("{}: {}", prop_name, value)
            };

            // Check for !important modifier
            if dir.modifiers.iter().any(|m| m.as_str() == "important") {
                important_props.push(prop_str);
            } else {
                normal_props.push(prop_str);
            }
        }

        let base = base_style.unwrap_or("");

        // Build the directives argument
        let directives_arg = if !important_props.is_empty() {
            // Array form: [{ normal }, { important }]
            format!(
                "[{{ {} }}, {{ {} }}]",
                normal_props.join(", "),
                important_props.join(", ")
            )
        } else {
            // Object form: { normal }
            format!("{{ {} }}", normal_props.join(", "))
        };

        // Output: ${$.attr_style('base', { color: 'red' })}
        Ok(format!("${{$.attr_style('{}', {})}}", base, directives_arg))
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
                    // Transform store subscriptions ($store -> $.store_get())
                    let transformed = self.transform_store_refs(&expr_source);
                    self.output_parts.push(OutputPart::Expression(transformed));
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
                || matches!(part, OutputPart::RawExpression(_))
        });

        // Extract props, spreads, and bindings
        // Pre-allocate based on typical attribute counts
        let attr_count = component.attributes.len();
        let mut props = Vec::with_capacity(attr_count);
        let mut spreads = Vec::with_capacity(2);
        let mut bindings = Vec::with_capacity(2);

        for attr in &component.attributes {
            match attr {
                Attribute::Attribute(node) => {
                    let name = node.name.as_str();
                    match &node.value {
                        AttributeValue::Expression(expr_tag) => {
                            // Get expression from ExpressionTag's expression field
                            let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                            let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                            if expr_end > expr_start && expr_end <= self.source.len() {
                                let expr_source =
                                    self.source[expr_start..expr_end].trim().to_string();
                                // Check if it's a shorthand property (name equals expression)
                                if expr_source == name && is_valid_js_identifier(name) {
                                    props.push(name.to_string());
                                } else {
                                    props.push(format!(
                                        "{}: {}",
                                        quote_prop_name(name),
                                        expr_source
                                    ));
                                }
                            }
                        }
                        AttributeValue::Sequence(parts) => {
                            // Handle text or mixed values like name="world"
                            let mut value_str = String::new();
                            for part in parts {
                                match part {
                                    crate::ast::template::AttributeValuePart::Text(text) => {
                                        value_str.push_str(&text.data);
                                    }
                                    crate::ast::template::AttributeValuePart::ExpressionTag(
                                        expr_tag,
                                    ) => {
                                        // For mixed values with expressions, extract from source
                                        let expr_start =
                                            expr_tag.expression.start().unwrap_or(0) as usize;
                                        let expr_end =
                                            expr_tag.expression.end().unwrap_or(0) as usize;
                                        if expr_end > expr_start && expr_end <= self.source.len() {
                                            value_str.push_str("${");
                                            value_str
                                                .push_str(self.source[expr_start..expr_end].trim());
                                            value_str.push('}');
                                        }
                                    }
                                }
                            }
                            if !value_str.is_empty() {
                                // Check if the value contains expressions
                                if value_str.contains("${") {
                                    props.push(format!(
                                        "{}: `{}`",
                                        quote_prop_name(name),
                                        value_str
                                    ));
                                } else {
                                    // Simple string value
                                    props.push(format!(
                                        "{}: '{}'",
                                        quote_prop_name(name),
                                        value_str
                                    ));
                                }
                            }
                        }
                        AttributeValue::True(_) => {
                            // Boolean attribute (e.g., disabled)
                            props.push(format!("{}: true", quote_prop_name(name)));
                        }
                    }
                }
                Attribute::SpreadAttribute(spread) => {
                    // Get the spread expression from source
                    let expr_start = spread.expression.start().unwrap_or(0) as usize;
                    let expr_end = spread.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let expr = self.source[expr_start..expr_end].trim().to_string();
                        spreads.push(expr);
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

        // Extract snippets from the component's fragment and process children
        let (children, snippets, slot_names) =
            self.generate_component_children_with_snippets(&component.fragment)?;

        // Use ComponentWithBindings if there are any bind directives
        if bindings.is_empty() {
            self.output_parts.push(OutputPart::Component {
                name: comp_name,
                props,
                spreads,
                has_prior_content,
                children,
                snippets,
                slot_names,
            });
        } else {
            self.output_parts.push(OutputPart::ComponentWithBindings {
                name: comp_name,
                props,
                spreads,
                bindings,
                has_prior_content,
                children,
            });
        }

        Ok(())
    }

    /// Generate component children, extracting snippets as props.
    /// Returns (children_parts, snippets, slot_names)
    #[allow(clippy::type_complexity)]
    fn generate_component_children_with_snippets(
        &mut self,
        fragment: &Fragment,
    ) -> Result<
        (
            Option<Vec<OutputPart>>,
            Vec<(String, Vec<String>, Vec<OutputPart>)>,
            Vec<String>,
        ),
        TransformError,
    > {
        // Pre-allocate based on typical usage patterns
        let node_count = fragment.nodes.len();
        let mut snippets: Vec<(String, Vec<String>, Vec<OutputPart>)> = Vec::with_capacity(4);
        let mut slot_names: Vec<String> = Vec::with_capacity(4);
        let mut non_snippet_nodes: Vec<&TemplateNode> = Vec::with_capacity(node_count);

        // Separate snippets from other children
        for node in &fragment.nodes {
            if let TemplateNode::SnippetBlock(snippet_block) = node {
                // Extract snippet name
                let name_start = snippet_block.expression.start().unwrap_or(0) as usize;
                let name_end = snippet_block.expression.end().unwrap_or(0) as usize;
                let snippet_name = if name_end > name_start && name_end <= self.source.len() {
                    self.source[name_start..name_end].trim().to_string()
                } else {
                    "snippet".to_string()
                };

                // Extract parameters
                let params: Vec<String> = snippet_block
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

                // Generate snippet body
                let body_parts = self.generate_snippet_body(&snippet_block.body)?;

                // Add to slot names
                let slot_name = if snippet_name == "children" {
                    "default".to_string()
                } else {
                    snippet_name.clone()
                };
                slot_names.push(slot_name);

                snippets.push((snippet_name, params, body_parts));
            } else {
                non_snippet_nodes.push(node);
            }
        }

        // Now process remaining children (non-snippets)
        let children = self.generate_children_from_nodes(&non_snippet_nodes)?;

        Ok((children, snippets, slot_names))
    }

    /// Generate snippet body parts
    fn generate_snippet_body(
        &mut self,
        fragment: &Fragment,
    ) -> Result<Vec<OutputPart>, TransformError> {
        let mut body_generator = ServerCodeGenerator::new(
            self.component_name.clone(),
            self.source.clone(),
            None,
            None,
            self.analysis,
        );

        // Collect non-empty nodes
        let body_nodes: Vec<_> = fragment.nodes.iter().collect();
        let len = body_nodes.len();

        // Find first non-whitespace node
        let mut start_idx = 0;
        while start_idx < len {
            if let TemplateNode::Text(text) = body_nodes[start_idx]
                && text.data.trim().is_empty()
            {
                start_idx += 1;
                continue;
            }
            break;
        }

        // Find last non-whitespace node
        let mut end_idx = len;
        while end_idx > start_idx {
            if let TemplateNode::Text(text) = body_nodes[end_idx - 1]
                && text.data.trim().is_empty()
            {
                end_idx -= 1;
                continue;
            }
            break;
        }

        // Generate body content
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

        Ok(body_generator.output_parts)
    }

    /// Generate children from a list of nodes (excluding snippets)
    fn generate_children_from_nodes(
        &mut self,
        nodes: &[&TemplateNode],
    ) -> Result<Option<Vec<OutputPart>>, TransformError> {
        let len = nodes.len();

        if len == 0 {
            return Ok(None);
        }

        // Find first and last meaningful content
        let mut start_idx = 0;
        let mut end_idx = len;

        while start_idx < len {
            if let TemplateNode::Text(text) = nodes[start_idx]
                && text.data.trim().is_empty()
            {
                start_idx += 1;
                continue;
            }
            break;
        }

        while end_idx > start_idx {
            if let TemplateNode::Text(text) = nodes[end_idx - 1]
                && text.data.trim().is_empty()
            {
                end_idx -= 1;
                continue;
            }
            break;
        }

        // Check if there's any meaningful content
        if start_idx >= end_idx {
            return Ok(None);
        }

        // Generate body parts
        let mut body_generator = ServerCodeGenerator::new(
            self.component_name.clone(),
            self.source.clone(),
            None,
            None,
            None,
        );

        // Check if first meaningful content is text/expression
        // If so, add <!---> anchor to prevent text fusion during hydration
        let first_content = nodes.get(start_idx);
        let needs_anchor = matches!(
            first_content,
            Some(TemplateNode::Text(_)) | Some(TemplateNode::ExpressionTag(_))
        );

        if needs_anchor {
            body_generator.output_parts.push(OutputPart::Comment);
        }

        let mut is_first = true;
        for node in nodes.iter().take(end_idx).skip(start_idx) {
            // For the first text node, normalize leading whitespace
            if is_first && let TemplateNode::Text(text) = node {
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
            body_generator.generate_node(node, false)?;
            is_first = false;
        }

        Ok(Some(body_generator.output_parts))
    }

    fn generate_if_block(&mut self, block: &IfBlock) -> Result<(), TransformError> {
        // Get the test expression from the source
        let start = block.test.start().unwrap_or(0) as usize;
        let end = block.test.end().unwrap_or(0) as usize;
        let test_expr = if end > start && end <= self.source.len() {
            self.source[start..end].trim().to_string()
        } else {
            "false".to_string()
        };

        // Generate consequent body parts
        let consequent_body = self.generate_if_branch_body(&block.consequent)?;

        // Generate alternate body parts if present
        let alternate_body = if let Some(ref alternate) = block.alternate {
            Some(self.generate_if_branch_body(alternate)?)
        } else {
            None
        };

        self.output_parts.push(OutputPart::IfBlock {
            test_expr,
            consequent_body,
            alternate_body,
        });

        Ok(())
    }

    /// Generate body parts for an if/else branch, handling nested IfBlocks for else-if chains.
    fn generate_if_branch_body(
        &mut self,
        fragment: &Fragment,
    ) -> Result<Vec<OutputPart>, TransformError> {
        // Check if this fragment contains only a single IfBlock (else-if case)
        let nodes: Vec<_> = fragment.nodes.iter().collect();

        // Filter out whitespace-only text nodes
        let meaningful_nodes: Vec<_> = nodes
            .iter()
            .filter(|n| {
                if let TemplateNode::Text(text) = n {
                    !text.data.trim().is_empty()
                } else {
                    true
                }
            })
            .collect();

        // If there's exactly one node and it's an IfBlock, this is an else-if chain
        if meaningful_nodes.len() == 1
            && let TemplateNode::IfBlock(nested_if) = meaningful_nodes[0]
        {
            // For else-if, we return a nested IfBlock OutputPart directly
            let nested_test_start = nested_if.test.start().unwrap_or(0) as usize;
            let nested_test_end = nested_if.test.end().unwrap_or(0) as usize;
            let nested_test_expr =
                if nested_test_end > nested_test_start && nested_test_end <= self.source.len() {
                    self.source[nested_test_start..nested_test_end]
                        .trim()
                        .to_string()
                } else {
                    "false".to_string()
                };

            let nested_consequent = self.generate_if_branch_body(&nested_if.consequent)?;
            let nested_alternate = if let Some(ref alt) = nested_if.alternate {
                Some(self.generate_if_branch_body(alt)?)
            } else {
                None
            };

            return Ok(vec![OutputPart::IfBlock {
                test_expr: nested_test_expr,
                consequent_body: nested_consequent,
                alternate_body: nested_alternate,
            }]);
        }

        // Standard case: generate body parts for the branch
        let len = nodes.len();
        let mut start_idx = 0;
        let mut end_idx = len;

        // Skip leading whitespace
        while start_idx < len {
            if let TemplateNode::Text(text) = nodes[start_idx]
                && text.data.trim().is_empty()
            {
                start_idx += 1;
                continue;
            }
            break;
        }

        // Skip trailing whitespace
        while end_idx > start_idx {
            if let TemplateNode::Text(text) = nodes[end_idx - 1]
                && text.data.trim().is_empty()
            {
                end_idx -= 1;
                continue;
            }
            break;
        }

        // Generate body parts
        let mut body_generator = ServerCodeGenerator::new(
            self.component_name.clone(),
            self.source.clone(),
            None,
            None,
            None,
        );

        for node in nodes.iter().take(end_idx).skip(start_idx) {
            body_generator.generate_node(node, false)?;
        }

        Ok(body_generator.output_parts)
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
            if let TemplateNode::Text(text) = body_nodes[start_idx]
                && text.data.trim().is_empty()
            {
                start_idx += 1;
                continue;
            }
            break;
        }

        // Skip trailing whitespace
        while end_idx > start_idx {
            if let TemplateNode::Text(text) = body_nodes[end_idx - 1]
                && text.data.trim().is_empty()
            {
                end_idx -= 1;
                continue;
            }
            break;
        }

        // Generate body parts
        let mut body_generator = ServerCodeGenerator::new(
            self.component_name.clone(),
            self.source.clone(),
            None,
            None,
            None,
        );

        // Check if first node is an expression - if so, add comment marker
        if start_idx < end_idx
            && let TemplateNode::ExpressionTag(_) = body_nodes[start_idx]
        {
            body_generator.output_parts.push(OutputPart::Comment);
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

        // Get the catch error variable name if present
        let catch_param = if let Some(ref error) = block.error {
            let start = error.start().unwrap_or(0) as usize;
            let end = error.end().unwrap_or(0) as usize;
            if end > start && end <= self.source.len() {
                self.source[start..end].trim().to_string()
            } else {
                String::new()
            }
        } else {
            String::new()
        };

        // Generate pending body
        let mut pending_body = if let Some(ref pending) = block.pending {
            let mut pending_generator = ServerCodeGenerator::new(
                self.component_name.clone(),
                self.source.clone(),
                self.instance_script,
                None,
                None,
            );
            for node in &pending.nodes {
                pending_generator.generate_node(node, false)?;
            }
            pending_generator.output_parts
        } else {
            Vec::new()
        };
        // Trim leading/trailing whitespace from await block bodies
        trim_output_parts(&mut pending_body);

        // Generate then body
        let mut then_body = if let Some(ref then) = block.then {
            let mut then_generator = ServerCodeGenerator::new(
                self.component_name.clone(),
                self.source.clone(),
                self.instance_script,
                None,
                None,
            );
            for node in &then.nodes {
                then_generator.generate_node(node, false)?;
            }
            then_generator.output_parts
        } else {
            Vec::new()
        };
        trim_output_parts(&mut then_body);

        // Generate catch body
        let mut catch_body = if let Some(ref catch) = block.catch {
            let mut catch_generator = ServerCodeGenerator::new(
                self.component_name.clone(),
                self.source.clone(),
                self.instance_script,
                None,
                None,
            );
            for node in &catch.nodes {
                catch_generator.generate_node(node, false)?;
            }
            catch_generator.output_parts
        } else {
            Vec::new()
        };
        trim_output_parts(&mut catch_body);

        self.output_parts.push(OutputPart::AwaitBlock {
            promise: promise_expr,
            then_param,
            pending_body,
            then_body,
            catch_param,
            catch_body,
        });

        Ok(())
    }

    fn generate_key_block(&mut self, _block: &KeyBlock) -> Result<(), TransformError> {
        self.output_parts.push(OutputPart::Comment);
        Ok(())
    }

    fn generate_const_tag(&mut self, tag: &ConstTag) -> Result<(), TransformError> {
        // Get the declaration from the source
        let start = tag.declaration.start().unwrap_or(0) as usize;
        let end = tag.declaration.end().unwrap_or(0) as usize;
        if end > start && end <= self.source.len() {
            let declaration_source = self.source[start..end].trim().to_string();
            self.output_parts
                .push(OutputPart::ConstDeclaration(declaration_source));
        }
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
        let mut body_generator = ServerCodeGenerator::new(
            self.component_name.clone(),
            self.source.clone(),
            None,
            None,
            None,
        );

        // Collect non-empty nodes
        let body_nodes: Vec<_> = block.body.nodes.iter().collect();
        let len = body_nodes.len();

        // Find first non-whitespace node
        let mut start_idx = 0;
        while start_idx < len {
            if let TemplateNode::Text(text) = body_nodes[start_idx]
                && text.data.trim().is_empty()
            {
                start_idx += 1;
                continue;
            }
            break;
        }

        // Find last non-whitespace node
        let mut end_idx = len;
        while end_idx > start_idx {
            if let TemplateNode::Text(text) = body_nodes[end_idx - 1]
                && text.data.trim().is_empty()
            {
                end_idx -= 1;
                continue;
            }
            break;
        }

        // Check if first node is text or expression tag - if so, we need hydration marker
        // Reference: svelte/packages/svelte/src/compiler/phases/3-transform/utils.js clean_nodes()
        // This prevents text from being fused with its surroundings during hydration
        let first_node = body_nodes.get(start_idx);
        let is_text_first = matches!(
            first_node,
            Some(TemplateNode::Text(_)) | Some(TemplateNode::ExpressionTag(_))
        );

        // Add hydration marker if first content is text
        if is_text_first {
            body_generator
                .output_parts
                .push(OutputPart::Html("<!---->".to_string()));
        }

        // Generate body content, trimming whitespace properly
        // Track previous non-output nodes (like ConstTag) to skip whitespace after them
        let mut prev_was_const_tag = false;
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
                    prev_was_const_tag = false;
                    continue;
                }
            }

            // Skip whitespace-only text nodes after ConstTag
            if prev_was_const_tag
                && let TemplateNode::Text(text) = node
                && text.data.trim().is_empty()
            {
                continue;
            }

            // Track if current node is a ConstTag
            prev_was_const_tag = matches!(node, TemplateNode::ConstTag(_));

            body_generator.generate_node(node, false)?;
        }

        // Determine if the snippet can be hoisted to module level
        // Use metadata.can_hoist from the analyze phase
        let can_hoist = block.metadata.can_hoist;

        // Store the snippet definition
        self.snippets.push(SnippetDef {
            name,
            params,
            body_parts: body_generator.output_parts,
            can_hoist,
        });

        Ok(())
    }

    fn generate_render_tag(&mut self, tag: &RenderTag) -> Result<(), TransformError> {
        use serde_json::Value;

        // Get the expression JSON
        let expr_json = tag.expression.as_json();
        let expr_type = expr_json
            .get("type")
            .and_then(|t: &Value| t.as_str())
            .unwrap_or("");

        let is_optional = expr_type == "ChainExpression";

        // Get the inner call for ChainExpression - clone to avoid lifetime issues
        let call_json: Value = if is_optional {
            match expr_json.get("expression") {
                Some(v) => v.clone(),
                None => return Ok(()),
            }
        } else {
            expr_json.clone()
        };

        let call_type = call_json
            .get("type")
            .and_then(|t: &Value| t.as_str())
            .unwrap_or("");
        if call_type != "CallExpression" {
            return Ok(());
        }

        // Get callee position
        let callee = match call_json.get("callee") {
            Some(c) => c,
            None => return Ok(()),
        };

        let c_start = callee
            .get("start")
            .and_then(|s: &Value| s.as_u64())
            .unwrap_or(0) as usize;
        let c_end = callee
            .get("end")
            .and_then(|s: &Value| s.as_u64())
            .unwrap_or(0) as usize;

        if c_end <= c_start || c_end > self.source.len() {
            return Ok(());
        }

        let callee_str = self.source[c_start..c_end].trim().to_string();

        // Get arguments
        let mut arg_strs = Vec::new();
        if let Some(args) = call_json
            .get("arguments")
            .and_then(|a: &Value| a.as_array())
        {
            for arg in args {
                let a_start = arg
                    .get("start")
                    .and_then(|s: &Value| s.as_u64())
                    .unwrap_or(0) as usize;
                let a_end = arg.get("end").and_then(|s: &Value| s.as_u64()).unwrap_or(0) as usize;
                if a_end > a_start && a_end <= self.source.len() {
                    arg_strs.push(self.source[a_start..a_end].trim().to_string());
                }
            }
        }

        // Build the call: snippet($$renderer, ...args) or snippet?.($$renderer, ...args)
        let call_str = if is_optional {
            if arg_strs.is_empty() {
                format!("{}?.($$renderer)", callee_str)
            } else {
                format!("{}?.($$renderer, {})", callee_str, arg_strs.join(", "))
            }
        } else if arg_strs.is_empty() {
            format!("{}($$renderer)", callee_str)
        } else {
            format!("{}($$renderer, {})", callee_str, arg_strs.join(", "))
        };

        // Add the render call
        self.output_parts.push(OutputPart::RenderCall(call_str));

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

    fn generate_svelte_boundary(&mut self, boundary: &SvelteElement) -> Result<(), TransformError> {
        // Look for pending attribute or pending snippet
        let pending_attribute = boundary
            .attributes
            .iter()
            .find(|attr| matches!(attr, Attribute::Attribute(a) if a.name == "pending"));

        let pending_snippet = boundary.fragment.nodes.iter().find_map(|node| {
            if let TemplateNode::SnippetBlock(snippet) = node {
                // Check if the snippet expression is named "pending"
                let json = snippet.expression.as_json();
                if json.get("type").and_then(|t| t.as_str()) == Some("Identifier")
                    && json.get("name").and_then(|n| n.as_str()) == Some("pending")
                {
                    return Some(snippet);
                }
            }
            None
        });

        // Generate pending body if we have a pending snippet or attribute
        let pending_body = if let Some(snippet) = pending_snippet {
            // Generate body from the pending snippet
            self.generate_fragment_body_parts(&snippet.body)?
        } else if pending_attribute.is_some() {
            // For pending attribute, we would need to call the attribute value as a function
            // For now, just generate empty body (the attribute case is less common)
            Vec::new()
        } else {
            // No pending - generate the main fragment content
            // But on server, we still wrap it in boundary markers
            self.generate_fragment_body_parts(&boundary.fragment)?
        };

        self.output_parts
            .push(OutputPart::SvelteBoundary { pending_body });
        Ok(())
    }

    /// Generate body parts from a fragment.
    fn generate_fragment_body_parts(
        &mut self,
        fragment: &Fragment,
    ) -> Result<Vec<OutputPart>, TransformError> {
        let mut body_generator = ServerCodeGenerator::new(
            self.component_name.clone(),
            self.source.clone(),
            None,
            None,
            self.analysis,
        );

        // Get the nodes and find meaningful content bounds
        let nodes: Vec<_> = fragment.nodes.iter().collect();
        let len = nodes.len();

        // Find first non-whitespace node
        let mut start_idx = 0;
        while start_idx < len {
            if let TemplateNode::Text(text) = nodes[start_idx]
                && text.data.trim().is_empty()
            {
                start_idx += 1;
                continue;
            }
            break;
        }

        // Find last non-whitespace node
        let mut end_idx = len;
        while end_idx > start_idx {
            if let TemplateNode::Text(text) = nodes[end_idx - 1]
                && text.data.trim().is_empty()
            {
                end_idx -= 1;
                continue;
            }
            break;
        }

        // Check if first meaningful content needs an anchor
        // If the first node is Text or ExpressionTag, add <!----> to prevent text fusion
        if start_idx < end_idx {
            let first_node = &nodes[start_idx];
            let needs_anchor = matches!(
                first_node,
                TemplateNode::Text(_) | TemplateNode::ExpressionTag(_)
            );
            if needs_anchor {
                body_generator
                    .output_parts
                    .push(OutputPart::Html("<!---->".to_string()));
            }
        }

        // Generate only the meaningful nodes
        for node in &nodes[start_idx..end_idx] {
            body_generator.generate_node(node, false)?;
        }

        Ok(body_generator.output_parts)
    }

    fn build(self) -> String {
        let body_code = Self::build_parts(&self.output_parts, 1);

        // Process module script content (context="module") if present
        // Module script runs at module level, outside the component function
        let (module_imports, module_code) = if let Some(script) = self.module_script {
            let start = script.content.start().unwrap_or(0) as usize;
            let end = script.content.end().unwrap_or(0) as usize;
            let raw_script = if end > start && end <= self.source.len() {
                self.source[start..end].to_string()
            } else {
                String::new()
            };

            // Extract imports and transform the rest
            let (imports, rest) = extract_imports(&raw_script);
            let transformed = transform_script_content(&rest);

            (imports, transformed)
        } else {
            (Vec::new(), String::new())
        };

        // Process instance script content if present
        let (props_param, script_code, hoisted_imports, needs_component_wrapper) =
            if let Some(script) = self.instance_script {
                let start = script.content.start().unwrap_or(0) as usize;
                let end = script.content.end().unwrap_or(0) as usize;
                let raw_script = if end > start && end <= self.source.len() {
                    self.source[start..end].to_string()
                } else {
                    String::new()
                };

                // First, remove $effect, $effect.pre, $effect.root, and $inspect.trace blocks
                // These are client-side only and should not appear in SSR output
                let raw_script = remove_effect_blocks(&raw_script);

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

                // Use needs_context from Phase 2 analysis
                // This is set when:
                // - Call to imported function (callee is not a "safe identifier")
                // - $bindable is used
                // - $effect or $effect.pre is used
                // - new expression is used (any constructor call)
                // - Member expression on unsafe identifier
                let needs_context = self.analysis.map(|a| a.needs_context).unwrap_or(false);

                // Store subscriptions require $$renderer.component() wrapper
                let needs_wrapper = uses_props_spread
                    || has_class_state_fields
                    || needs_context
                    || self.uses_store_subs;

                if uses_props || has_class_state_fields || needs_context || self.uses_store_subs {
                    (", $$props", transformed, imports, needs_wrapper)
                } else {
                    ("", transformed, imports, false)
                }
            } else {
                ("", String::new(), Vec::new(), false)
            };

        // Combine module imports and instance imports (module imports first)
        let all_imports: Vec<String> = module_imports.into_iter().chain(hoisted_imports).collect();

        // Build hoisted imports section
        let imports_section = if all_imports.is_empty() {
            String::new()
        } else {
            all_imports.join("\n") + "\n"
        };

        // Build module script section (placed after imports, before component function)
        let module_section = if module_code.trim().is_empty() {
            String::new()
        } else {
            format!("{}\n", module_code)
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
                // Build instance-level snippets (cannot be hoisted)
                let instance_snippets = self.build_instance_snippets(2);
                // Build $.bind_props() call (inside $$renderer.component())
                let bind_props_code = self.build_bind_props(2);

                // Add store subscription variable declaration and cleanup if needed
                let store_subs_decl = if self.uses_store_subs {
                    "\t\tvar $$store_subs;\n"
                } else {
                    ""
                };
                let store_subs_cleanup = if self.uses_store_subs {
                    "\n\t\tif ($$store_subs) $.unsubscribe_stores($$store_subs);\n"
                } else {
                    ""
                };

                format!(
                    r#"import * as $ from 'svelte/internal/server';
{imports_section}{module_section}{snippets_section}
export default function {component_name}($$renderer{props_param}) {{
	$$renderer.component(($$renderer) => {{
{store_subs_decl}{inner_script}
{instance_snippets}{inner_body}{bind_props_code}{store_subs_cleanup}	}});
}}"#,
                    imports_section = imports_section,
                    module_section = module_section,
                    snippets_section = snippets_section,
                    component_name = self.component_name,
                    props_param = props_param,
                    store_subs_decl = store_subs_decl,
                    inner_script = inner_script,
                    instance_snippets = instance_snippets,
                    inner_body = inner_body,
                    bind_props_code = bind_props_code,
                    store_subs_cleanup = store_subs_cleanup
                )
            } else {
                let script_section = if script_code.is_empty() {
                    String::new()
                } else {
                    format!("{}\n", script_code)
                };
                // Build instance-level snippets (cannot be hoisted)
                let instance_snippets = self.build_instance_snippets(1);
                // Build $.bind_props() call (at top level of component function)
                let bind_props_code = self.build_bind_props(1);

                format!(
                    r#"import * as $ from 'svelte/internal/server';
{imports_section}{module_section}{snippets_section}
export default function {component_name}($$renderer{props_param}) {{
{script_section}{instance_snippets}{body_code}{bind_props_code}}}"#,
                    imports_section = imports_section,
                    module_section = module_section,
                    snippets_section = snippets_section,
                    component_name = self.component_name,
                    props_param = props_param,
                    script_section = script_section,
                    instance_snippets = instance_snippets,
                    body_code = body_code,
                    bind_props_code = bind_props_code
                )
            }
        } else {
            // Empty body - use single line braces
            // Build $.bind_props() call even for empty body
            let bind_props_code = self.build_bind_props(1);
            if bind_props_code.is_empty() {
                format!(
                    r#"import * as $ from 'svelte/internal/server';
{imports_section}{module_section}{snippets_section}
export default function {component_name}($$renderer{props_param}) {{}}"#,
                    imports_section = imports_section,
                    module_section = module_section,
                    snippets_section = snippets_section,
                    component_name = self.component_name,
                    props_param = props_param,
                )
            } else {
                format!(
                    r#"import * as $ from 'svelte/internal/server';
{imports_section}{module_section}{snippets_section}
export default function {component_name}($$renderer{props_param}) {{
{bind_props_code}}}"#,
                    imports_section = imports_section,
                    module_section = module_section,
                    snippets_section = snippets_section,
                    component_name = self.component_name,
                    props_param = props_param,
                    bind_props_code = bind_props_code
                )
            }
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
                OutputPart::RawExpression(expr) => {
                    // Raw expressions don't need escaping (e.g., $.attributes())
                    current_html.push_str(&format!("${{{}}}", expr));
                }
                OutputPart::HtmlExpression(expr) => {
                    current_html.push_str(&format!("${{$.html({})}}", expr));
                }
                OutputPart::ComponentWithBindings {
                    name,
                    props,
                    spreads,
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

                    // Generate component call - use $.spread_props if spreads exist
                    if !spreads.is_empty() {
                        body_code.push_str(&format!(
                            "{}\t{}($$renderer, $.spread_props([\n",
                            indent, name
                        ));

                        // Add spread expressions first
                        for spread in spreads {
                            body_code.push_str(&format!("{}\t\t{},\n", indent, spread));
                        }

                        // Then add explicit props and bindings as an object
                        body_code.push_str(&format!("{}\t\t{{\n", indent));

                        for prop in props {
                            body_code.push_str(&format!("{}\t\t\t{},\n", indent, prop));
                        }

                        for (prop_name, var_name) in bindings {
                            body_code
                                .push_str(&format!("{}\t\t\tget {}() {{\n", indent, prop_name));
                            body_code
                                .push_str(&format!("{}\t\t\t\treturn {};\n", indent, var_name));
                            body_code.push_str(&format!("{}\t\t\t}},\n\n", indent));
                            body_code.push_str(&format!(
                                "{}\t\t\tset {}($$value) {{\n",
                                indent, prop_name
                            ));
                            body_code
                                .push_str(&format!("{}\t\t\t\t{} = $$value;\n", indent, var_name));
                            body_code.push_str(&format!("{}\t\t\t\t$$settled = false;\n", indent));
                            body_code.push_str(&format!("{}\t\t\t}}\n", indent));
                        }

                        body_code.push_str(&format!("{}\t\t}}\n", indent));
                        body_code.push_str(&format!("{}\t]));\n", indent));
                    } else {
                        // No spreads, use simple object literal
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
                            body_code.push_str(&format!(
                                "{}\t\tset {}($$value) {{\n",
                                indent, prop_name
                            ));
                            body_code
                                .push_str(&format!("{}\t\t\t{} = $$value;\n", indent, var_name));
                            body_code.push_str(&format!("{}\t\t\t$$settled = false;\n", indent));
                            body_code.push_str(&format!("{}\t\t}}\n", indent));
                        }

                        body_code.push_str(&format!("{}\t}});\n", indent));
                    }

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
                    spreads,
                    has_prior_content,
                    children,
                    snippets,
                    slot_names,
                } => {
                    // Flush current HTML
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    // Check if we have snippets or children
                    let has_snippets = !snippets.is_empty();
                    let has_children = children.is_some();
                    let has_spreads = !spreads.is_empty();

                    if has_snippets || has_children {
                        // Wrap in a block if we have snippets
                        if has_snippets {
                            body_code.push_str(&format!("{}{{\n", indent));

                            // Generate snippet function declarations inside the block
                            for (snippet_name, params, body_parts) in snippets {
                                let params_str = if params.is_empty() {
                                    "$$renderer".to_string()
                                } else {
                                    format!("$$renderer, {}", params.join(", "))
                                };
                                body_code.push_str(&format!(
                                    "{}\tfunction {}({}) {{\n",
                                    indent, snippet_name, params_str
                                ));
                                let snippet_body = Self::build_parts(body_parts, indent_level + 2);
                                body_code.push_str(&snippet_body);
                                body_code.push_str(&format!("{}\t}}\n\n", indent));
                            }

                            // Component call with snippets as props
                            body_code.push_str(&format!("{}\t{}($$renderer, {{ ", indent, name));

                            // Collect all props including snippet names
                            let mut all_props: Vec<String> = props.clone();
                            for (snippet_name, _, _) in snippets {
                                all_props.push(snippet_name.clone());
                            }

                            // Build $$slots object
                            let slots_str = slot_names
                                .iter()
                                .map(|s| format!("{}: true", s))
                                .collect::<Vec<_>>()
                                .join(", ");

                            if all_props.is_empty() {
                                body_code.push_str(&format!("$$slots: {{ {} }} }});\n", slots_str));
                            } else {
                                body_code.push_str(&format!(
                                    "{}, $$slots: {{ {} }} }});\n",
                                    all_props.join(", "),
                                    slots_str
                                ));
                            }

                            // Close the block
                            body_code.push_str(&format!("{}}}\n", indent));
                        } else if let Some(children_parts) = children {
                            // Component with children only (no snippets) - multi-line format
                            body_code.push_str(&format!("{}{}($$renderer, {{\n", indent, name));

                            // Props
                            for prop in props {
                                body_code.push_str(&format!("{}\t{},\n", indent, prop));
                            }

                            // Children callback
                            body_code
                                .push_str(&format!("{}\tchildren: ($$renderer) => {{\n", indent));
                            let children_code = Self::build_parts(children_parts, indent_level + 2);
                            body_code.push_str(&children_code);
                            body_code.push_str(&format!("{}\t}},\n", indent));

                            // Slots marker
                            body_code
                                .push_str(&format!("{}\t$$slots: {{ default: true }}\n", indent));
                            body_code.push_str(&format!("{}}});\n", indent));
                        }
                    } else if has_spreads {
                        // Has spread attributes - use $.spread_props
                        let spread_args: Vec<String> = spreads.clone();
                        body_code.push_str(&format!(
                            "{}{}($$renderer, $.spread_props([{}]));\n",
                            indent,
                            name,
                            spread_args.join(", ")
                        ));
                    } else {
                        // No children, no snippets, no spreads - simple call
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

                    // Check if there's content after this component
                    let has_content_after = parts[i + 1..].iter().any(|p| {
                        matches!(
                            p,
                            OutputPart::Html(h) if !h.trim().is_empty()
                        ) || matches!(
                            p,
                            OutputPart::Expression(_)
                                | OutputPart::RawExpression(_)
                                | OutputPart::HtmlExpression(_)
                                | OutputPart::Component { .. }
                                | OutputPart::EachBlock { .. }
                                | OutputPart::IfBlock { .. }
                                | OutputPart::AwaitBlock { .. }
                                | OutputPart::SvelteBoundary { .. }
                                | OutputPart::RenderCall(_)
                        )
                    });

                    // Add marker if there's content either before or after the component
                    if *has_prior_content || has_content_after {
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
                    // Add block marker to current HTML and flush together
                    current_html.push_str("<!--[-->");
                    body_code.push_str(&format!(
                        "{}$$renderer.push(`{}`);\n\n",
                        indent, current_html
                    ));
                    current_html.clear();

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

                    // Add closing marker to current_html to combine with subsequent content
                    current_html.push_str("<!--]-->");
                }
                OutputPart::IfBlock {
                    test_expr,
                    consequent_body,
                    alternate_body,
                } => {
                    // Flush current HTML before if block
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    // Generate the if block with proper markers
                    let if_code = Self::build_if_statement(
                        test_expr,
                        consequent_body,
                        alternate_body,
                        indent_level,
                    );
                    body_code.push_str(&if_code);

                    // Add closing marker to current_html to combine with subsequent content
                    current_html.push_str("<!--]-->");
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
                    pending_body,
                    then_body,
                    catch_param,
                    catch_body,
                } => {
                    // Flush current HTML before await block
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    // Generate $.await call with proper callbacks
                    body_code.push_str(&format!("{}$.await(\n", indent));
                    body_code.push_str(&format!("{}\t$$renderer,\n", indent));
                    body_code.push_str(&format!("{}\t{},\n", indent, promise));

                    // Pending callback
                    if pending_body.is_empty() {
                        body_code.push_str(&format!("{}\t() => {{}},\n", indent));
                    } else {
                        body_code.push_str(&format!("{}\t() => {{\n", indent));
                        let pending_code = Self::build_parts(pending_body, indent_level + 2);
                        body_code.push_str(&pending_code);
                        body_code.push_str(&format!("{}\t}},\n", indent));
                    }

                    // Then callback
                    if then_body.is_empty() {
                        if then_param.is_empty() {
                            body_code.push_str(&format!("{}\t() => {{}}", indent));
                        } else {
                            body_code.push_str(&format!("{}\t({}) => {{}}", indent, then_param));
                        }
                    } else {
                        if then_param.is_empty() {
                            body_code.push_str(&format!("{}\t() => {{\n", indent));
                        } else {
                            body_code.push_str(&format!("{}\t({}) => {{\n", indent, then_param));
                        }
                        let then_code = Self::build_parts(then_body, indent_level + 2);
                        body_code.push_str(&then_code);
                        body_code.push_str(&format!("{}\t}}", indent));
                    }

                    // Catch callback (only if catch block exists)
                    if !catch_body.is_empty() || !catch_param.is_empty() {
                        body_code.push_str(",\n");
                        if catch_body.is_empty() {
                            if catch_param.is_empty() {
                                body_code.push_str(&format!("{}\t() => {{}}", indent));
                            } else {
                                body_code
                                    .push_str(&format!("{}\t({}) => {{}}", indent, catch_param));
                            }
                        } else {
                            if catch_param.is_empty() {
                                body_code.push_str(&format!("{}\t() => {{\n", indent));
                            } else {
                                body_code
                                    .push_str(&format!("{}\t({}) => {{\n", indent, catch_param));
                            }
                            let catch_code = Self::build_parts(catch_body, indent_level + 2);
                            body_code.push_str(&catch_code);
                            body_code.push_str(&format!("{}\t}}", indent));
                        }
                    }

                    body_code.push('\n');
                    body_code.push_str(&format!("{});\n", indent));

                    // Add closing marker to the next push
                    current_html.push_str("<!--]-->");
                }
                OutputPart::SvelteBoundary { pending_body } => {
                    // Add boundary marker to current HTML and flush together
                    // On server, we render the pending state (using block_open_else marker)
                    // block_open_else = <!--[!-->
                    // block_close = <!--]-->
                    current_html.push_str("<!--[!-->");
                    body_code.push_str(&format!(
                        "{}$$renderer.push(`{}`);\n\n",
                        indent, current_html
                    ));
                    current_html.clear();

                    // Render the pending body in a block (always add block even if empty)
                    body_code.push_str(&format!("{}{{\n", indent));
                    if !pending_body.is_empty() {
                        let pending_code = Self::build_parts(pending_body, indent_level + 1);
                        body_code.push_str(&pending_code);
                    }
                    body_code.push_str(&format!("{}}}\n\n", indent));

                    // Add closing marker to current_html to combine with subsequent content
                    current_html.push_str("<!--]-->");
                }
                OutputPart::RenderCall(call_str) => {
                    // Flush current HTML before render call
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    // Generate the snippet function call
                    body_code.push_str(&format!("{}{};\n", indent, call_str));
                }
                OutputPart::ConstDeclaration(declaration) => {
                    // Flush current HTML before const declaration
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    // Generate the const declaration
                    body_code.push_str(&format!("{}const {};\n", indent, declaration));
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
                OutputPart::RawExpression(expr) => {
                    // Raw expressions don't need escaping (e.g., $.attributes())
                    current_html.push_str(&format!("${{{}}}", expr));
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

    /// Build an if statement with proper block markers.
    /// Handles nested IfBlocks for else-if chains.
    fn build_if_statement(
        test_expr: &str,
        consequent_body: &[OutputPart],
        alternate_body: &Option<Vec<OutputPart>>,
        indent_level: usize,
    ) -> String {
        let mut code = String::new();
        let indent = "\t".repeat(indent_level);

        // Start the if statement
        code.push_str(&format!("{}if ({}) {{\n", indent, test_expr));

        // Add opening marker for consequent (BLOCK_OPEN = <!--[-->)
        code.push_str(&format!("{}\t$$renderer.push(`<!--[-->`);\n", indent));

        // Generate consequent body
        let consequent_code = Self::build_parts(consequent_body, indent_level + 1);
        code.push_str(&consequent_code);

        // Close consequent block
        code.push_str(&format!("{}}}", indent));

        // Handle alternate (else/else-if)
        if let Some(alt_body) = alternate_body {
            // Check if the alternate is another IfBlock (else-if chain)
            if alt_body.len() == 1
                && let OutputPart::IfBlock {
                    test_expr: nested_test,
                    consequent_body: nested_consequent,
                    alternate_body: nested_alternate,
                } = &alt_body[0]
            {
                // else-if case
                code.push_str(&format!(" else if ({}) {{\n", nested_test));

                // Add opening marker for else-if (still BLOCK_OPEN = <!--[-->)
                code.push_str(&format!("{}\t$$renderer.push(`<!--[-->`);\n", indent));

                // Generate nested consequent body
                let nested_code = Self::build_parts(nested_consequent, indent_level + 1);
                code.push_str(&nested_code);

                // Close nested block and handle deeper nesting
                code.push_str(&format!("{}}}", indent));

                // Recursively handle the rest of the else-if chain
                if let Some(deeper_alt) = nested_alternate {
                    let deeper_code = Self::build_alternate_chain(deeper_alt, indent_level);
                    code.push_str(&deeper_code);
                } else {
                    // No more alternates, add the final else with BLOCK_OPEN_ELSE
                    code.push_str(" else {\n");
                    code.push_str(&format!("{}\t$$renderer.push(`<!--[!-->`);\n", indent));
                    code.push_str(&format!("{}}}", indent));
                }

                return code;
            }

            // Regular else case (not else-if)
            code.push_str(" else {\n");

            // Add opening marker for else (BLOCK_OPEN_ELSE = <!--[!-->)
            code.push_str(&format!("{}\t$$renderer.push(`<!--[!-->`);\n", indent));

            // Generate alternate body
            let alternate_code = Self::build_parts(alt_body, indent_level + 1);
            code.push_str(&alternate_code);

            // Close else block
            code.push_str(&format!("{}}}", indent));
        } else {
            // No alternate - add empty else with BLOCK_OPEN_ELSE
            code.push_str(" else {\n");
            code.push_str(&format!("{}\t$$renderer.push(`<!--[!-->`);\n", indent));
            code.push_str(&format!("{}}}", indent));
        }

        code
    }

    /// Build the alternate chain for else-if/else.
    fn build_alternate_chain(alt_body: &[OutputPart], indent_level: usize) -> String {
        let mut code = String::new();
        let indent = "\t".repeat(indent_level);

        // Check if this is another IfBlock
        if alt_body.len() == 1
            && let OutputPart::IfBlock {
                test_expr: nested_test,
                consequent_body: nested_consequent,
                alternate_body: nested_alternate,
            } = &alt_body[0]
        {
            // else-if case
            code.push_str(&format!(" else if ({}) {{\n", nested_test));
            code.push_str(&format!("{}\t$$renderer.push(`<!--[-->`);\n", indent));

            let nested_code = Self::build_parts(nested_consequent, indent_level + 1);
            code.push_str(&nested_code);
            code.push_str(&format!("{}}}", indent));

            // Handle deeper nesting
            if let Some(deeper_alt) = nested_alternate {
                let deeper_code = Self::build_alternate_chain(deeper_alt, indent_level);
                code.push_str(&deeper_code);
            } else {
                // Final else
                code.push_str(" else {\n");
                code.push_str(&format!("{}\t$$renderer.push(`<!--[!-->`);\n", indent));
                code.push_str(&format!("{}}}", indent));
            }

            return code;
        }

        // Regular else case
        code.push_str(" else {\n");
        code.push_str(&format!("{}\t$$renderer.push(`<!--[!-->`);\n", indent));

        let alternate_code = Self::build_parts(alt_body, indent_level + 1);
        code.push_str(&alternate_code);

        code.push_str(&format!("{}}}", indent));
        code
    }

    /// Build snippet function definitions that can be hoisted to module level.
    fn build_snippets(&self) -> String {
        let hoisted: Vec<_> = self.snippets.iter().filter(|s| s.can_hoist).collect();
        if hoisted.is_empty() {
            return String::new();
        }

        let mut result = String::new();

        for snippet in hoisted {
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

    /// Build snippet function definitions that cannot be hoisted (instance-level).
    fn build_instance_snippets(&self, indent_level: usize) -> String {
        let instance: Vec<_> = self.snippets.iter().filter(|s| !s.can_hoist).collect();
        if instance.is_empty() {
            return String::new();
        }

        let indent = "\t".repeat(indent_level);
        let mut result = String::new();

        for snippet in instance {
            // Generate function signature
            let params = if snippet.params.is_empty() {
                "$$renderer".to_string()
            } else {
                format!("$$renderer, {}", snippet.params.join(", "))
            };

            result.push_str(&format!(
                "{}function {}({}) {{\n",
                indent, snippet.name, params
            ));

            // Generate body
            let body = Self::build_parts(&snippet.body_parts, indent_level + 1);
            result.push_str(&body);

            result.push_str(&format!("{}}}\n\n", indent));
        }

        result
    }

    /// Build the $.bind_props() call if there are bindable props or exports.
    /// This propagates values of bound props upwards if they're undefined in the parent and have a value.
    fn build_bind_props(&self, indent_level: usize) -> String {
        let analysis = match self.analysis {
            Some(a) => a,
            None => return String::new(),
        };

        let indent = "\t".repeat(indent_level);
        let mut props: Vec<String> = Vec::new();

        // Collect bindable props from the instance scope
        // binding.kind === 'bindable_prop' && !name.startsWith('$$')
        for binding in &analysis.root.bindings {
            if binding.kind == BindingKind::BindableProp && !binding.name.starts_with("$$") {
                // Use prop_alias if available, otherwise use name
                // b.init(binding.prop_alias ?? name, b.id(name))
                let prop_entry = if let Some(ref alias) = binding.prop_alias {
                    if alias != &binding.name {
                        format!("{}: {}", alias, binding.name)
                    } else {
                        binding.name.clone()
                    }
                } else {
                    binding.name.clone()
                };
                props.push(prop_entry);
            }
        }

        // Collect exports
        // for (const { name, alias } of analysis.exports)
        for export in &analysis.exports {
            let prop_entry = if let Some(ref alias) = export.alias {
                if alias != &export.name {
                    format!("{}: {}", alias, export.name)
                } else {
                    export.name.clone()
                }
            } else {
                export.name.clone()
            };
            props.push(prop_entry);
        }

        if props.is_empty() {
            return String::new();
        }

        // Generate: $.bind_props($$props, { name1, name2, ... });
        format!(
            "{}$.bind_props($$props, {{ {} }});\n",
            indent,
            props.join(", ")
        )
    }
}

/// Detect if script uses patterns that require $$renderer.component() wrapper with $$slots/$$events exclusion.
///
/// This detects two cases:
/// 1. `let props = $props()` - simple identifier assignment (needs `let { $$slots, $$events, ...props } = $$props`)
/// 2. `let { ...rest } = $props()` or `let { x, ...rest } = $props()` - ObjectPattern with RestElement
///
/// In both cases, we need to wrap in $$renderer.component() and inject $$slots, $$events exclusion.
fn detect_props_spread_pattern(script: &str) -> bool {
    for line in script.lines() {
        let trimmed = line.trim();
        if (trimmed.starts_with("let ") || trimmed.starts_with("const "))
            && trimmed.contains("= $props()")
        {
            // Find the assignment `= $props()` part
            if let Some(props_idx) = trimmed.find("= $props()") {
                let left = &trimmed[..props_idx].trim();
                let pattern = left
                    .strip_prefix("let ")
                    .or_else(|| left.strip_prefix("const "))
                    .map(|s| s.trim())
                    .unwrap_or(left);

                // Case 1: Simple identifier (let props = $props())
                if !pattern.contains('{') && !pattern.contains('[') {
                    return true;
                }

                // Case 2: ObjectPattern with RestElement (let { ...rest } = $props())
                if pattern.starts_with('{') && pattern.contains("...") {
                    return true;
                }
            }
        }
    }
    false
}

/// Check if the script calls any imported function.
/// This triggers needs_context in the Svelte compiler.
/// NOTE: Currently disabled due to false positives. Needs AST-based approach.
#[allow(dead_code)]
fn check_calls_imported_function(script: &str, imports: &[String]) -> bool {
    // Extract imported identifiers from import statements
    let mut imported_names: Vec<String> = Vec::new();

    for import_line in imports {
        // Parse import { foo, bar } from 'module'
        // or import foo from 'module'
        // or import * as foo from 'module'

        let trimmed = import_line.trim();

        // Handle: import { foo, bar as baz } from 'module'
        if let Some(start) = trimmed.find('{') {
            if let Some(end) = trimmed.find('}') {
                let names_part = &trimmed[start + 1..end];
                for name in names_part.split(',') {
                    let name = name.trim();
                    // Handle "foo as bar" -> use "bar"
                    if let Some(as_idx) = name.find(" as ") {
                        imported_names.push(name[as_idx + 4..].trim().to_string());
                    } else {
                        imported_names.push(name.to_string());
                    }
                }
            }
        }
        // Handle: import foo from 'module'
        else if trimmed.starts_with("import ") && !trimmed.contains('*') {
            // Extract default import name
            let rest = &trimmed[7..]; // After "import "
            if let Some(from_idx) = rest.find(" from ") {
                let name = rest[..from_idx].trim();
                if !name.is_empty() && !name.starts_with('{') {
                    imported_names.push(name.to_string());
                }
            }
        }
        // Handle: import * as foo from 'module'
        else if let Some(star_idx) = trimmed.find("* as ") {
            let rest = &trimmed[star_idx + 5..];
            if let Some(from_idx) = rest.find(" from ") {
                let name = rest[..from_idx].trim();
                if !name.is_empty() {
                    imported_names.push(name.to_string());
                }
            }
        }
    }

    // Check if any imported name is called in the script
    for name in &imported_names {
        // Look for patterns like "name(" which indicate a function call
        let call_pattern = format!("{}(", name);
        if script.contains(&call_pattern) {
            return true;
        }
        // Also check for method calls like "name.method("
        let method_pattern = format!("{}.", name);
        if script.contains(&method_pattern) {
            return true;
        }
    }

    false
}

/// Check if the script uses the `new` operator.
/// This triggers needs_context in the Svelte compiler.
/// NOTE: Currently disabled due to false positives. Needs AST-based approach.
#[allow(dead_code)]
fn check_uses_new_operator(script: &str) -> bool {
    // Look for "new " followed by an identifier
    // Be careful not to match inside strings or comments
    let mut in_string = false;
    let mut string_char = ' ';
    let mut in_line_comment = false;
    let mut in_block_comment = false;
    let mut prev_char = ' ';

    let script_bytes = script.as_bytes();
    let len = script_bytes.len();
    let mut i = 0;

    while i < len {
        let c = script_bytes[i] as char;

        // Handle comments
        if !in_string {
            if !in_block_comment && c == '/' && i + 1 < len && script_bytes[i + 1] == b'/' {
                in_line_comment = true;
                i += 2;
                continue;
            }
            if !in_line_comment && c == '/' && i + 1 < len && script_bytes[i + 1] == b'*' {
                in_block_comment = true;
                i += 2;
                continue;
            }
            if in_line_comment && c == '\n' {
                in_line_comment = false;
                i += 1;
                continue;
            }
            if in_block_comment && c == '*' && i + 1 < len && script_bytes[i + 1] == b'/' {
                in_block_comment = false;
                i += 2;
                continue;
            }
        }

        if in_line_comment || in_block_comment {
            i += 1;
            continue;
        }

        // Handle strings
        if (c == '"' || c == '\'' || c == '`') && prev_char != '\\' {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
        }

        if in_string {
            prev_char = c;
            i += 1;
            continue;
        }

        // Look for "new " pattern
        if i + 4 <= len && &script[i..i + 4] == "new " {
            // Check that this is not part of a larger identifier
            // (preceded by a non-identifier character)
            let before_ok = i == 0 || !is_identifier_char(script_bytes[i - 1] as char);
            if before_ok {
                return true;
            }
        }

        prev_char = c;
        i += 1;
    }

    false
}

/// Check if a character is valid in an identifier.
#[allow(dead_code)]
fn is_identifier_char(c: char) -> bool {
    c.is_alphanumeric() || c == '_' || c == '$'
}

/// Transform script code to use proper destructuring for props spread pattern.
///
/// Handles two cases:
/// 1. `let props = $$props` -> `let { $$slots, $$events, ...props } = $$props`
/// 2. `let { ...rest } = $$props` -> `let { $$slots, $$events, ...rest } = $$props`
/// 3. `let { x, y, ...rest } = $$props` -> `let { $$slots, $$events, x, y, ...rest } = $$props`
fn transform_props_spread(script: &str) -> String {
    let mut result = String::new();

    for line in script.lines() {
        let trimmed = line.trim();

        if (trimmed.starts_with("let ") || trimmed.starts_with("const "))
            && trimmed.contains("= $$props")
        {
            // Find the assignment `= $$props` part (not default value `=`)
            if let Some(props_idx) = trimmed.find("= $$props") {
                let left = trimmed[..props_idx].trim();
                let pattern = if let Some(stripped) = left.strip_prefix("let ") {
                    stripped.trim()
                } else if let Some(stripped) = left.strip_prefix("const ") {
                    stripped.trim()
                } else {
                    left
                };

                // Case 1: Simple identifier (let props = $$props)
                if !pattern.starts_with('{') {
                    result.push_str(&format!(
                        "\t\tlet {{ $$slots, $$events, ...{} }} = $$props;\n",
                        pattern
                    ));
                    continue;
                }

                // Case 2 & 3: ObjectPattern with RestElement
                // Parse the pattern: { x, y, ...rest } or { ...rest }
                if pattern.starts_with('{') && pattern.ends_with('}') {
                    let inner = &pattern[1..pattern.len() - 1].trim();

                    // Check if there's a rest element
                    if let Some(rest_idx) = inner.find("...") {
                        // Extract the rest element name
                        let rest_part = &inner[rest_idx..];
                        let rest_name = rest_part.trim_start_matches("...").trim();

                        // Extract other properties (before the rest element)
                        let other_props = inner[..rest_idx].trim().trim_end_matches(',').trim();

                        // Preserve const vs let from original
                        let decl_keyword = if trimmed.starts_with("const ") {
                            "const"
                        } else {
                            "let"
                        };

                        if other_props.is_empty() {
                            // Case 2: Only rest element: { ...rest }
                            // Output: { $$slots, $$events, ...rest }
                            result.push_str(&format!(
                                "\t\t{} {{ $$slots, $$events, ...{} }} = $$props;\n",
                                decl_keyword, rest_name
                            ));
                        } else {
                            // Case 3: Props with rest element: { x, y, ...rest }
                            // JS implementation inserts $$slots, $$events BEFORE the rest element
                            // Output: { x, y, $$slots, $$events, ...rest }
                            result.push_str(&format!(
                                "\t\t{} {{ {}, $$slots, $$events, ...{} }} = $$props;\n",
                                decl_keyword, other_props, rest_name
                            ));
                        }
                        continue;
                    }
                }

                // Fallback: keep original line
                result.push_str(&format!("\t\t{}\n", trimmed));
                continue;
            }
        }

        if !trimmed.is_empty() {
            result.push_str(&format!("\t\t{}\n", trimmed));
        }
    }

    if result.ends_with('\n') {
        result.pop();
    }

    result
}

/// Extract constant variable bindings from script content.
fn extract_constant_vars(script: &str) -> FxHashMap<String, String> {
    let mut constants = FxHashMap::default();

    for line in script.lines() {
        let trimmed = line.trim();

        if trimmed.contains("$state") || trimmed.contains("$derived") || trimmed.contains("$props")
        {
            continue;
        }

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
    Null,
    Constant(String),
    Dynamic,
}

/// Full constant folding with result type.
fn try_constant_fold_full(expr: &str) -> ConstantFoldResult {
    let trimmed = expr.trim();

    if trimmed == "null" || trimmed == "undefined" {
        return ConstantFoldResult::Null;
    }

    if let Ok(n) = trimmed.parse::<i64>() {
        return ConstantFoldResult::Constant(n.to_string());
    }
    if let Ok(n) = trimmed.parse::<f64>() {
        return ConstantFoldResult::Constant(n.to_string());
    }

    if (trimmed.starts_with('\'') && trimmed.ends_with('\''))
        || (trimmed.starts_with('"') && trimmed.ends_with('"'))
    {
        let content = &trimmed[1..trimmed.len() - 1];
        return ConstantFoldResult::Constant(content.to_string());
    }

    if let Some(idx) = trimmed.find("??") {
        let left = trimmed[..idx].trim();
        let right = trimmed[idx + 2..].trim();

        match try_constant_fold_full(left) {
            ConstantFoldResult::Null => {
                return try_constant_fold_full(right);
            }
            ConstantFoldResult::Constant(val) => {
                return ConstantFoldResult::Constant(val);
            }
            ConstantFoldResult::Dynamic => {}
        }
    }

    if trimmed.starts_with("Math.")
        && let Some(result) = eval_math_expr(trimmed)
    {
        return ConstantFoldResult::Constant(result);
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

/// Extract import statements from script content.
fn extract_imports(script: &str) -> (Vec<String>, String) {
    let mut imports = Vec::new();
    let mut rest = String::new();

    for line in script.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("import ") || trimmed.starts_with("import{") {
            imports.push(trimmed.to_string());
        } else {
            rest.push_str(line);
            rest.push('\n');
        }
    }

    if rest.ends_with('\n') {
        rest.pop();
    }

    // Strip export statements without declarations (e.g., `export { name }`)
    // These should be removed in server-side rendering
    let rest = strip_export_specifiers(&rest);

    (imports, rest)
}

/// Strip `export { ... }` statements (exports without declarations) from script content.
/// These are handled by the compiler via analysis.exports and should not appear in the output.
///
/// Handles:
/// - Single-line: `export { name }`
/// - Multi-line: `export {\n  name\n}`
/// - With aliases: `export { name as alias }`
fn strip_export_specifiers(script: &str) -> String {
    let mut result = String::new();
    let chars: Vec<char> = script.chars().collect();
    let len = chars.len();
    let mut i = 0;

    while i < len {
        // Look for "export" keyword
        if i + 6 <= len {
            let potential: String = chars[i..i + 6].iter().collect();
            if potential == "export" {
                // Check if this is followed by whitespace/newline and then `{`
                // (not `export let`, `export const`, `export function`, etc.)
                let mut j = i + 6;

                // Skip whitespace
                while j < len && (chars[j] == ' ' || chars[j] == '\t' || chars[j] == '\n') {
                    j += 1;
                }

                if j < len && chars[j] == '{' {
                    // This is `export { ... }` - find the closing brace
                    let mut depth = 1;
                    let start = j + 1;
                    let mut end = start;

                    while end < len && depth > 0 {
                        match chars[end] {
                            '{' => depth += 1,
                            '}' => depth -= 1,
                            _ => {}
                        }
                        if depth > 0 {
                            end += 1;
                        }
                    }

                    // Skip past the closing brace and any trailing whitespace/newline
                    if end < len {
                        end += 1; // skip '}'
                    }

                    // Skip trailing whitespace and newline
                    while end < len && (chars[end] == ' ' || chars[end] == '\t') {
                        end += 1;
                    }
                    if end < len && chars[end] == '\n' {
                        end += 1;
                    }

                    // Skip this entire export block
                    i = end;
                    continue;
                }
            }
        }

        result.push(chars[i]);
        i += 1;
    }

    result
}

/// Transform script content for server-side rendering.
fn transform_script_content(script: &str) -> String {
    let script = script.replace("$props()", "$$props");
    // Note: Order matters - check $state.raw before $state to avoid partial matches
    let script = transform_rune_call_multiline(&script, "$state.raw(");
    let script = transform_rune_call_multiline(&script, "$state(");
    let script = transform_rune_call_multiline(&script, "$derived.by(");
    let script = transform_rune_call_multiline(&script, "$derived(");

    let mut result = String::new();
    let lines: Vec<&str> = script.lines().collect();

    for line in lines {
        let trimmed = line.trim();

        if result.is_empty() && trimmed.is_empty() {
            continue;
        }

        let line = format_js_line(line);
        let line = add_statement_semicolon(&line);

        if line.starts_with('\t') {
            result.push_str(&line);
        } else if trimmed.is_empty() {
            // Empty line
        } else {
            result.push('\t');
            result.push_str(trimmed);
        }
        result.push('\n');
    }

    if result.ends_with('\n') {
        result.pop();
    }

    result
}

fn format_js_line(line: &str) -> String {
    let mut result = String::new();
    let chars: Vec<char> = line.chars().collect();
    let mut i = 0;
    let mut in_string = false;
    let mut string_char = ' ';

    while i < chars.len() {
        let c = chars[i];

        if (c == '"' || c == '\'' || c == '`') && (i == 0 || chars[i - 1] != '\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
        }

        if in_string {
            result.push(c);
            i += 1;
            continue;
        }

        if c == '=' {
            let next = chars.get(i + 1).copied();
            let prev = if !result.is_empty() {
                result.chars().last()
            } else {
                None
            };

            if next == Some('=')
                || next == Some('>')
                || prev == Some('=')
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
                result.push(c);
            } else {
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

fn transform_rune_call_multiline(script: &str, prefix: &str) -> String {
    let mut result = String::new();
    let chars: Vec<char> = script.chars().collect();
    let prefix_chars: Vec<char> = prefix.chars().collect();
    let prefix_len = prefix_chars.len();
    let mut i = 0;

    // Check if this is $derived.by - needs special handling (IIFE)
    let is_derived_by = prefix == "$derived.by(";

    while i < chars.len() {
        if i + prefix_len <= chars.len() {
            let potential: String = chars[i..i + prefix_len].iter().collect();
            if potential == prefix {
                let mut depth = 1;
                let start = i + prefix_len;
                let mut end = start;
                let mut in_string = false;
                let mut string_char = ' ';

                while end < chars.len() && depth > 0 {
                    let c = chars[end];

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

                let inner: String = chars[start..end].iter().collect();
                let trimmed_inner = inner.trim();

                if trimmed_inner.is_empty() {
                    // $state() with no arguments -> void 0
                    result.push_str("void 0");
                } else if is_derived_by {
                    // $derived.by(fn) -> (fn)() - wrap in IIFE to call the function
                    result.push('(');
                    result.push_str(&inner);
                    result.push_str(")()");
                } else {
                    result.push_str(&inner);
                }

                i = end + 1;
                continue;
            }
        }

        result.push(chars[i]);
        i += 1;
    }

    result
}

fn add_statement_semicolon(line: &str) -> String {
    let trimmed = line.trim();

    if trimmed.is_empty() {
        return line.to_string();
    }

    if trimmed.ends_with(';')
        || trimmed.ends_with('{')
        || trimmed.ends_with('}')
        || trimmed.ends_with(',')
    {
        return line.to_string();
    }

    if (trimmed.starts_with("const ") || trimmed.starts_with("let ") || trimmed.starts_with("var "))
        && trimmed.ends_with(')')
    {
        return format!("{};", line);
    }

    line.to_string()
}

/// Transform class fields with $derived runes for server-side.
/// Output order matches official Svelte compiler:
/// 1. Non-$derived fields ($state, etc.)
/// 2. $derived fields (private field + getter/setter)
/// 3. Methods
fn transform_class_fields_server(script: &str) -> String {
    if !script.contains("class ") || !script.contains("$derived") {
        return script.to_string();
    }

    let Some(class_pos) = script.find("class ") else {
        return script.to_string();
    };

    let after_class = &script[class_pos..];
    let Some(brace_pos) = after_class.find('{') else {
        return script.to_string();
    };

    let class_header = &after_class[..brace_pos + 1];

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

    #[derive(Debug)]
    struct DerivedField {
        name: String,
        is_private: bool,
        value: String,
    }

    let mut derived_fields: Vec<DerivedField> = Vec::new();
    let mut field_lines: Vec<String> = Vec::new(); // Non-$derived fields
    let mut method_lines: Vec<String> = Vec::new(); // Methods
    let mut constructor_lines: Vec<String> = Vec::new();
    let mut in_constructor = false;
    let mut constructor_depth = 0;
    let mut in_method = false;
    let mut method_depth = 0;
    let mut current_method: Vec<String> = Vec::new();

    for line in class_body.lines() {
        let trimmed = line.trim();

        // Handle constructor
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

        // Handle methods (including getters and setters)
        if in_method {
            current_method.push(trimmed.to_string());
            for c in trimmed.chars() {
                match c {
                    '{' => method_depth += 1,
                    '}' => {
                        method_depth -= 1;
                        if method_depth == 0 {
                            in_method = false;
                            method_lines.append(&mut current_method);
                        }
                    }
                    _ => {}
                }
            }
            continue;
        }

        // Detect method start: name(...) { or get name() { or set name(...)
        let is_method_start = (trimmed.contains('(') && trimmed.contains('{'))
            && !trimmed.contains('=')
            && !trimmed.starts_with("//")
            && !trimmed.starts_with("/*");

        if is_method_start {
            in_method = true;
            method_depth = 0;
            current_method.clear();
            current_method.push(trimmed.to_string());
            for c in trimmed.chars() {
                match c {
                    '{' => method_depth += 1,
                    '}' => {
                        method_depth -= 1;
                        if method_depth == 0 {
                            in_method = false;
                            method_lines.append(&mut current_method);
                        }
                    }
                    _ => {}
                }
            }
            continue;
        }

        // Handle $derived fields
        if trimmed.contains("= $derived(") || trimmed.contains("=$derived(") {
            let is_private = trimmed.starts_with('#');
            if let Some(eq_pos) = trimmed.find('=') {
                let name = trimmed[..eq_pos].trim().trim_start_matches('#').to_string();

                let derived_pattern = "$derived(";
                if let Some(derived_pos) = trimmed.find(derived_pattern) {
                    let value_start = derived_pos + derived_pattern.len();
                    let after_paren = &trimmed[value_start..];

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

        // Non-$derived fields (like $state fields or regular fields)
        if !trimmed.is_empty() {
            field_lines.push(trimmed.to_string());
        }
    }

    if derived_fields.is_empty() {
        return script.to_string();
    }

    let mut new_class_body = String::new();

    // 1. Output non-$derived fields first
    for line in &field_lines {
        new_class_body.push_str(&format!("\t\t{}\n", line));
    }

    // 2. Output $derived fields (private field + getter/setter)
    for field in &derived_fields {
        let private_name = format!("#{}", field.name);

        // If the value starts with '{', wrap it in parentheses to avoid
        // it being interpreted as a block statement instead of an object literal
        let value_str = field.value.trim();
        let wrapped_value = if value_str.starts_with('{') {
            format!("({})", value_str)
        } else {
            value_str.to_string()
        };

        new_class_body.push_str(&format!(
            "\t\t{} = $.derived(() => {});\n",
            private_name, wrapped_value
        ));

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

    // 3. Output methods
    for line in &method_lines {
        new_class_body.push('\n');
        new_class_body.push_str(&format!("\t\t{}\n", line));
    }

    // 4. Output constructor if present
    if !constructor_lines.is_empty() {
        new_class_body.push('\n');
        for line in &constructor_lines {
            new_class_body.push_str(&format!("\t\t{}\n", line));
        }
    }

    let before_class = &script[..class_pos];
    let after_class_body = &script[class_body_end + 1..];

    format!(
        "{}{}\n{}\t}}{}",
        before_class, class_header, new_class_body, after_class_body
    )
}

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

/// Remove $effect, $effect.pre, $effect.root, $inspect, and $inspect.trace blocks from script.
/// These are client-side only runes and should not appear in SSR output.
fn remove_effect_blocks(script: &str) -> String {
    let mut result = script.to_string();

    // List of effect-related runes to remove (order matters - check longer patterns first)
    let effect_runes = [
        "$effect.root(",
        "$effect.pre(",
        "$effect(",
        "$inspect.trace(",
        "$inspect(",
    ];

    for rune in effect_runes {
        result = remove_rune_statement(&result, rune);
    }

    result
}

/// Remove a complete statement containing a rune call.
/// For example: `$effect(() => { ... });` becomes empty.
fn remove_rune_statement(script: &str, rune_prefix: &str) -> String {
    let mut result = String::new();
    let chars: Vec<char> = script.chars().collect();
    let prefix_chars: Vec<char> = rune_prefix.chars().collect();
    let prefix_len = prefix_chars.len();
    let mut i = 0;

    while i < chars.len() {
        // Check if we're at the start of a rune call
        if i + prefix_len <= chars.len() {
            let potential: String = chars[i..i + prefix_len].iter().collect();
            if potential == rune_prefix {
                // Check if this is preceded only by whitespace/newlines on the current line
                // (i.e., it's a statement, not part of an expression)
                let is_statement = is_statement_start(&result);

                if is_statement {
                    // Find the matching closing paren
                    let start = i + prefix_len;
                    let mut depth = 1;
                    let mut end = start;
                    let mut in_string = false;
                    let mut string_char = ' ';

                    while end < chars.len() && depth > 0 {
                        let c = chars[end];

                        // Handle string literals
                        if (c == '"' || c == '\'' || c == '`')
                            && (end == 0 || chars[end - 1] != '\\')
                        {
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

                    // Skip past the closing paren
                    end += 1;

                    // Handle method chaining like $inspect(...).with(...)
                    // If followed by .with(, skip that too
                    if end + 5 <= chars.len() {
                        let potential_with: String = chars[end..end + 5].iter().collect();
                        if potential_with == ".with" {
                            end += 5; // Skip ".with"
                            // Skip optional whitespace but not newlines
                            while end < chars.len() && (chars[end] == ' ' || chars[end] == '\t') {
                                end += 1;
                            }
                            // If there's an opening paren, find matching close
                            if end < chars.len() && chars[end] == '(' {
                                end += 1;
                                let mut with_depth = 1;
                                let mut with_in_string = false;
                                let mut with_string_char = ' ';

                                while end < chars.len() && with_depth > 0 {
                                    let c = chars[end];
                                    if (c == '"' || c == '\'' || c == '`')
                                        && (end == 0 || chars[end - 1] != '\\')
                                    {
                                        if !with_in_string {
                                            with_in_string = true;
                                            with_string_char = c;
                                        } else if c == with_string_char {
                                            with_in_string = false;
                                        }
                                    }
                                    if !with_in_string {
                                        match c {
                                            '(' => with_depth += 1,
                                            ')' => with_depth -= 1,
                                            _ => {}
                                        }
                                    }
                                    if with_depth > 0 {
                                        end += 1;
                                    }
                                }
                                // Skip past the closing paren of .with()
                                end += 1;
                            }
                        }
                    }

                    // Skip optional semicolon and trailing whitespace on the same line
                    while end < chars.len() && (chars[end] == ';' || chars[end] == ' ') {
                        end += 1;
                    }

                    // Skip trailing newline if present
                    if end < chars.len() && chars[end] == '\n' {
                        end += 1;
                    }

                    // Remove leading whitespace/tabs on this line from result
                    while result.ends_with(' ') || result.ends_with('\t') {
                        result.pop();
                    }

                    i = end;
                    continue;
                }
            }
        }

        result.push(chars[i]);
        i += 1;
    }

    result
}

/// Check if we're at the start of a statement (preceded only by whitespace on current line).
fn is_statement_start(preceding: &str) -> bool {
    // Check what's on the current line before this position
    if let Some(last_newline) = preceding.rfind('\n') {
        let line_content = &preceding[last_newline + 1..];
        line_content.chars().all(|c| c.is_whitespace())
    } else {
        // Start of file/string - check if all preceding is whitespace
        preceding.chars().all(|c| c.is_whitespace())
    }
}

/// Replace store identifier in an expression with $.store_get() call.
/// For example: `$store` becomes `$.store_get($$store_subs ??= {}, '$store', store)`.
/// This handles the identifier carefully to avoid replacing substrings.
fn replace_store_identifier(expr: &str, store_ref: &str, store_name: &str) -> String {
    let mut result = String::with_capacity(expr.len() * 2);
    let chars: Vec<char> = expr.chars().collect();
    let store_ref_chars: Vec<char> = store_ref.chars().collect();
    let store_ref_len = store_ref_chars.len();
    let mut i = 0;

    while i < chars.len() {
        // Check if we're at the start of the store reference
        if i + store_ref_len <= chars.len() {
            let mut matches = true;
            for (j, ref_char) in store_ref_chars.iter().enumerate() {
                if chars[i + j] != *ref_char {
                    matches = false;
                    break;
                }
            }

            if matches {
                // Check if this is a complete identifier (not part of a larger identifier)
                let prev_is_ident = if i > 0 {
                    is_js_identifier_char(chars[i - 1])
                } else {
                    false
                };
                let next_is_ident = if i + store_ref_len < chars.len() {
                    is_js_identifier_char(chars[i + store_ref_len])
                } else {
                    false
                };

                // Only replace if it's a standalone identifier
                if !prev_is_ident && !next_is_ident {
                    // Replace with $.store_get() call
                    result.push_str(&format!(
                        "$.store_get($$store_subs ??= {{}}, '{}', {})",
                        store_ref, store_name
                    ));
                    i += store_ref_len;
                    continue;
                }
            }
        }

        result.push(chars[i]);
        i += 1;
    }

    result
}

/// Check if a character is a valid JavaScript identifier character.
fn is_js_identifier_char(c: char) -> bool {
    c.is_alphanumeric() || c == '_' || c == '$'
}
