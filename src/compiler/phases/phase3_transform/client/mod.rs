//! Client-side code generation.
//!
//! Generates JavaScript code for browser execution.

mod state;
mod visitor;

use state::{
    AwaitBlockInfo, BindThisComponent, ChildPart, ComponentWithBinding, ComponentWithChildren,
    DynamicAttribute, EachBlockInfo, EventHandler, HtmlTagInfo, NodeInfo, NodeType, SnippetInfo,
    SpecialAttribute, SvelteElementInfo,
};

use super::TransformError;
use super::js_ast::{
    builders::{
        array, arrow, arrow_block, assign, boolean, call, const_decl, export_default_function,
        getter, id, id_pattern, import_namespace, import_side_effect, member, object, program,
        quasi, return_value, set_text_content, setter, stmt, string, svelte_append,
        svelte_autofocus, svelte_await, svelte_bind_value, svelte_child, svelte_each,
        svelte_element, svelte_first_child, svelte_from_html, svelte_get, svelte_html,
        svelte_index, svelte_next, svelte_remove_input_defaults, svelte_reset, svelte_set,
        svelte_set_attribute, svelte_set_custom_element_data, svelte_set_sync, svelte_set_text,
        svelte_sibling, svelte_template_effect, svelte_template_effect_with_values, svelte_text,
        template, thunk, var_decl,
    },
    generate,
    nodes::{JsExpr, JsPattern, JsStatement},
    normalize_js,
};
use crate::ast::template::{
    Attribute, AttributeNode, AttributeValue, AttributeValuePart, AwaitBlock, Component, EachBlock,
    ExpressionTag, Fragment, HtmlTag, IfBlock, KeyBlock, RegularElement, RenderTag, Root,
    SnippetBlock, SvelteDynamicElement, TemplateNode, Text,
};
use crate::compiler::CompileOptions;
use crate::compiler::phases::phase2_analyze::ComponentAnalysis;

/// Transform a component analysis into client-side JavaScript.
///
/// # Arguments
///
/// * `analysis` - The component analysis from Phase 2 (includes pre-extracted script content)
/// * `ast` - The parsed AST from Phase 1 (to avoid re-parsing)
/// * `_source` - The original source code (for backward compatibility)
/// * `_options` - Compile options
pub fn transform_client(
    analysis: &ComponentAnalysis,
    ast: &Root,
    _source: &str,
    _options: &CompileOptions,
) -> Result<String, TransformError> {
    let component_name = &analysis.name;

    // Use pre-extracted script content from analysis (avoids re-parsing)
    let (script_content, uses_runes) = if let Some(ref content) = analysis.instance_script_content {
        (content.raw.clone(), content.uses_runes)
    } else {
        (String::new(), false)
    };

    let mut generator = ClientCodeGenerator::new(
        component_name.clone(),
        analysis.source.clone(),
        script_content,
        uses_runes,
    );

    // Use the AST fragment directly (no re-parsing needed)
    generator.generate_component(&ast.fragment)?;

    Ok(generator.build())
}

use std::collections::HashMap;

/// Client-side code generator.
struct ClientCodeGenerator {
    component_name: String,
    source: String,
    script_content: String,
    uses_runes: bool,
    html_parts: Vec<String>,
    nodes: Vec<NodeInfo>,
    has_expressions: bool,
    root_element_count: usize,
    /// Counter for variable names per tag name
    var_name_counters: HashMap<String, usize>,
    /// Counter for node variables (used for anchors/components)
    node_var_index: usize,
    /// Stack of parent element var names for tracking hierarchy
    element_stack: Vec<String>,
    /// Current child index within parent
    current_child_index: usize,
    /// State variable names (for $.set() and $.get() transformations)
    state_vars: Vec<String>,
    /// Constant variables (name -> value) for compile-time evaluation
    const_vars: HashMap<String, String>,
    /// Each block counter for template variable names
    each_block_counter: usize,
    /// Each blocks collected for code generation
    each_blocks: Vec<EachBlockInfo>,
    /// Svelte:element blocks collected for code generation
    svelte_elements: Vec<SvelteElementInfo>,
    /// {@html} tags collected for code generation
    html_tags: Vec<HtmlTagInfo>,
    /// Components with bind:this directive (for special code generation)
    bind_this_components: Vec<BindThisComponent>,
    /// Components with children (for generating children callbacks)
    components_with_children: Vec<ComponentWithChildren>,
    /// Snippet blocks
    snippets: Vec<SnippetInfo>,
    /// Components with value bindings (for getter/setter generation)
    components_with_bindings: Vec<ComponentWithBinding>,
    /// Await blocks for runtime code generation
    await_blocks: Vec<AwaitBlockInfo>,
    /// Whether template contains custom elements (elements with hyphens) or video elements
    has_custom_elements: bool,
    /// Read-only destructured props (accessed via $$props.propName, not $.prop())
    read_only_props: Vec<String>,
    /// Special attributes that need runtime handling (autofocus, muted, option value, custom element attrs)
    special_attrs: Vec<SpecialAttribute>,
    /// Current element name being processed (for tracking custom elements)
    current_element_name: Option<String>,
}

impl ClientCodeGenerator {
    fn new(
        component_name: String,
        source: String,
        script_content: String,
        uses_runes: bool,
    ) -> Self {
        // Collect state variables from script content
        let state_vars = collect_state_variables(&script_content);
        // Collect constant variables (non-$state) with their values
        let const_vars = collect_constant_variables(&script_content);
        // Collect read-only destructured props
        let read_only_props = collect_read_only_props(&script_content);

        Self {
            component_name,
            source,
            script_content,
            uses_runes,
            html_parts: Vec::new(),
            nodes: Vec::new(),
            has_expressions: false,
            root_element_count: 0,
            var_name_counters: HashMap::new(),
            node_var_index: 0,
            element_stack: Vec::new(),
            current_child_index: 0,
            state_vars,
            const_vars,
            each_block_counter: 0,
            each_blocks: Vec::new(),
            svelte_elements: Vec::new(),
            html_tags: Vec::new(),
            bind_this_components: Vec::new(),
            components_with_children: Vec::new(),
            snippets: Vec::new(),
            components_with_bindings: Vec::new(),
            await_blocks: Vec::new(),
            has_custom_elements: false,
            read_only_props,
            special_attrs: Vec::new(),
            current_element_name: None,
        }
    }

    fn generate_component(&mut self, fragment: &Fragment) -> Result<(), TransformError> {
        // Count root elements (non-whitespace nodes)
        self.root_element_count = fragment
            .nodes
            .iter()
            .filter(|n| !matches!(n, TemplateNode::Text(t) if t.data.trim().is_empty()))
            .count();

        // Generate HTML for the template, skipping leading/trailing whitespace
        let nodes: Vec<_> = fragment.nodes.iter().collect();
        let len = nodes.len();

        // Find first non-whitespace node
        let mut start_idx = 0;
        while start_idx < len {
            if let TemplateNode::Text(text) = nodes[start_idx] {
                if text.data.trim().is_empty() {
                    start_idx += 1;
                    continue;
                }
            }
            break;
        }

        // Generate from first non-whitespace node
        for (i, node) in nodes.iter().enumerate().skip(start_idx) {
            // Add space separator between root elements (but not before first)
            if i > start_idx {
                if let TemplateNode::Text(text) = node {
                    if text.data.trim().is_empty() {
                        // Whitespace between elements - normalize to single space
                        self.html_parts.push(" ".to_string());
                        continue;
                    }
                }
            }
            self.generate_node(node, true)?;
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
            TemplateNode::SvelteElement(elem) => self.generate_svelte_element(elem),
            _ => Ok(()),
        }
    }

    fn generate_text(&mut self, text: &Text, is_root_level: bool) -> Result<(), TransformError> {
        let data = &text.data;

        if data.trim().is_empty() {
            // Whitespace-only text - always include as single space if not empty
            // This preserves spacing between sibling elements
            if !data.is_empty() {
                self.html_parts.push(" ".to_string());
            }
        } else if is_root_level {
            // At root level, include the text as-is
            self.html_parts.push(escape_html(data));
        } else {
            // Inside elements, include the text
            self.html_parts.push(escape_html(data));
        }
        Ok(())
    }

    fn generate_element(&mut self, element: &RegularElement) -> Result<(), TransformError> {
        let name = element.name.as_str();

        // Check for custom elements (elements with hyphens) or video elements
        // These require TEMPLATE_USE_IMPORT_NODE flag
        let is_custom_element = name.contains('-');
        if is_custom_element || name == "video" {
            self.has_custom_elements = true;
        }

        // Create variable name for this element
        let var_name = self.next_var_name(name);

        // Track current element for attribute processing
        self.current_element_name = Some(name.to_string());
        let child_index = self.current_child_index;

        // Check if this is an input element
        let is_input = name == "input" || name == "textarea" || name == "select";

        // Extract event handlers and bindings from attributes
        let mut event_handlers = Vec::new();
        let mut bindings = Vec::new();

        for attr in &element.attributes {
            match attr {
                Attribute::Attribute(node) => {
                    let attr_name = node.name.as_str();
                    // Check for event handlers (onclick, onmousedown, etc.)
                    if let Some(event_name) = attr_name.strip_prefix("on") {
                        if let AttributeValue::Expression(expr_tag) = &node.value {
                            let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                            let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                            if expr_end > expr_start && expr_end <= self.source.len() {
                                let expr_source =
                                    self.source[expr_start..expr_end].trim().to_string();
                                event_handlers.push((event_name.to_string(), expr_source));
                            }
                        }
                    }
                }
                Attribute::BindDirective(bind) => {
                    let bind_name = bind.name.as_str();
                    let expr = &bind.expression;
                    let expr_start = expr.start().unwrap_or(0) as usize;
                    let expr_end = expr.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let expr_source = self.source[expr_start..expr_end].trim().to_string();
                        bindings.push((bind_name.to_string(), expr_source));
                    }
                }
                _ => {}
            }
        }

        // Record element info (content_template will be set later if needed)
        self.nodes.push(NodeInfo {
            var_name: var_name.clone(),
            node_type: NodeType::Element(name.to_string()),
            expression: None,
            child_index,
            event_handlers,
            bindings,
            is_input,
            content_template: None,
        });

        // Check if element has any expression children
        let has_expressions = element.fragment.nodes.iter().any(|child| {
            matches!(
                child,
                TemplateNode::ExpressionTag(_)
                    | TemplateNode::IfBlock(_)
                    | TemplateNode::EachBlock(_)
                    | TemplateNode::AwaitBlock(_)
            )
        });

        // Start tag
        self.html_parts.push(format!("<{}", name));

        // Attributes (skip event handlers for now, they're handled at runtime)
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

            if has_expressions {
                // Element has expressions - check for static text mixed with expressions
                // E.g., "clicks: {count}" needs a space placeholder
                // But "{expr}" alone does not need a placeholder

                // Check if there's meaningful static text
                let has_static_text = element.fragment.nodes.iter().any(|child| {
                    if let TemplateNode::Text(t) = child {
                        t.data.trim().chars().any(|c| c.is_alphanumeric())
                    } else {
                        false
                    }
                });

                // Check if any expressions involve state variables (reactive)
                let has_reactive = element.fragment.nodes.iter().any(|child| {
                    if let TemplateNode::ExpressionTag(tag) = child {
                        let expr_start = tag.start as usize;
                        let expr_end = tag.end as usize;
                        if expr_start + 1 < expr_end && expr_end <= self.source.len() {
                            let expr = self.source[expr_start + 1..expr_end - 1].trim();
                            // Check if expression contains any state variable
                            return self.state_vars.iter().any(|sv| expr.contains(sv));
                        }
                    }
                    false
                });

                if has_static_text {
                    // Has mixed content
                    // Only add space placeholder if content is reactive
                    if has_reactive {
                        self.html_parts.push(" ".to_string());
                    }

                    // Build the content template by combining all children
                    let mut content_parts: Vec<String> = Vec::new();

                    for child in &element.fragment.nodes {
                        match child {
                            TemplateNode::Text(text) => {
                                let data = &text.data;
                                if !data.trim().is_empty() {
                                    content_parts.push(data.to_string());
                                } else if !content_parts.is_empty() && !data.is_empty() {
                                    content_parts.push(" ".to_string());
                                }
                            }
                            TemplateNode::ExpressionTag(tag) => {
                                let expr_start = tag.start as usize;
                                let expr_end = tag.end as usize;
                                if expr_start + 1 < expr_end && expr_end <= self.source.len() {
                                    let expr = self.source[expr_start + 1..expr_end - 1].trim();
                                    content_parts.push(format!("${{{} ?? ''}}", expr));
                                }
                            }
                            _ => {}
                        }
                        self.current_child_index += 1;
                    }

                    // Update the element's NodeInfo with the content template
                    if !content_parts.is_empty() {
                        if let Some(last_node) = self.nodes.last_mut() {
                            if matches!(last_node.node_type, NodeType::Element(_)) {
                                let combined = content_parts.join("");
                                let trimmed = combined.trim().to_string();
                                if !trimmed.is_empty() {
                                    last_node.content_template = Some(trimmed);
                                }
                            }
                        }
                    }
                } else {
                    // Expression-only content (no static text)
                    // Check if these are function call expressions (e.g., {text1()}{text2()})
                    let mut func_names: Vec<String> = Vec::new();
                    for child in &element.fragment.nodes {
                        if let TemplateNode::ExpressionTag(tag) = child {
                            let expr_start = tag.start as usize;
                            let expr_end = tag.end as usize;
                            if expr_start + 1 < expr_end && expr_end <= self.source.len() {
                                let expr = self.source[expr_start + 1..expr_end - 1].trim();
                                // Check if it's a function call: identifier()
                                if let Some(func_name) = expr.strip_suffix("()") {
                                    if func_name.chars().all(|c| c.is_alphanumeric() || c == '_') {
                                        func_names.push(func_name.to_string());
                                    }
                                }
                            }
                        }
                    }

                    if func_names.len() >= 2 {
                        // Multiple function call expressions - add space placeholder
                        self.html_parts.push(" ".to_string());

                        // Store function names for template_effect generation
                        // The element needs $.child(), $.reset(), and special template_effect
                        if let Some(last_node) = self.nodes.last_mut() {
                            if matches!(last_node.node_type, NodeType::Element(_)) {
                                // Build template with $N placeholders
                                let template_parts: Vec<String> = func_names
                                    .iter()
                                    .enumerate()
                                    .map(|(i, _)| format!("${{${} ?? ''}}", i))
                                    .collect();
                                // Store as special content_template with function array marker
                                // Format: "FUNC_ARRAY:fn1,fn2:template"
                                let template = template_parts.join("");
                                last_node.content_template = Some(format!(
                                    "FUNC_ARRAY:{}:{}",
                                    func_names.join(","),
                                    template
                                ));
                            }
                        }
                    } else {
                        // Single or non-function expressions - track individually
                        for child in &element.fragment.nodes {
                            if let TemplateNode::ExpressionTag(tag) = child {
                                self.generate_expression_tag(tag)?;
                            }
                            self.current_child_index += 1;
                        }
                    }
                }
            } else {
                // No expressions - include static children in template
                // Skip leading/trailing whitespace-only text nodes
                let children: Vec<_> = element.fragment.nodes.iter().collect();

                // Find first and last non-whitespace children
                let first_content = children
                    .iter()
                    .position(|c| !matches!(c, TemplateNode::Text(t) if t.data.trim().is_empty()));
                let last_content = children
                    .iter()
                    .rposition(|c| !matches!(c, TemplateNode::Text(t) if t.data.trim().is_empty()));

                for (i, child) in children.iter().enumerate() {
                    // Skip leading whitespace
                    if let Some(first) = first_content {
                        if i < first {
                            self.current_child_index += 1;
                            continue;
                        }
                    }
                    // Skip trailing whitespace
                    if let Some(last) = last_content {
                        if i > last {
                            self.current_child_index += 1;
                            continue;
                        }
                    }
                    self.generate_node(child, false)?;
                    self.current_child_index += 1;
                }
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
        // Sanitize the hint: replace hyphens with underscores for valid JS identifiers
        let sanitized = hint.replace('-', "_");
        let count = self.var_name_counters.entry(sanitized.clone()).or_insert(0);
        let name = if *count == 0 {
            sanitized
        } else {
            format!("{}_{}", sanitized, count)
        };
        *count += 1;
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
        let attr_name = node.name.as_str();
        let element_name = self.current_element_name.clone().unwrap_or_default();

        // Check for special attributes that need runtime handling
        let is_custom_element = element_name.contains('-');
        let is_option = element_name == "option";
        let is_source_or_video = element_name == "source" || element_name == "video";

        // Get the current element's variable name (last node added)
        let var_name = self
            .nodes
            .last()
            .map(|n| n.var_name.clone())
            .unwrap_or_else(|| element_name.clone());

        // Check if this is a special attribute that should be handled at runtime
        match attr_name {
            "autofocus" => {
                // autofocus needs $.autofocus(element, true)
                self.special_attrs
                    .push(SpecialAttribute::Autofocus { var_name });
                return Ok(()); // Skip adding to template
            }
            "muted" if is_source_or_video => {
                // muted on source/video needs element.muted = true
                self.special_attrs
                    .push(SpecialAttribute::Muted { var_name });
                return Ok(()); // Skip adding to template
            }
            "value" if is_option => {
                // value on option needs option.value = option.__value = 'value'
                if let AttributeValue::Sequence(parts) = &node.value {
                    let value = parts
                        .iter()
                        .filter_map(|p| {
                            if let AttributeValuePart::Text(t) = p {
                                Some(t.data.to_string())
                            } else {
                                None
                            }
                        })
                        .collect::<String>();
                    self.special_attrs
                        .push(SpecialAttribute::OptionValue { var_name, value });
                    return Ok(()); // Skip adding to template
                }
            }
            _ if is_custom_element => {
                // All attributes on custom elements need $.set_custom_element_data()
                let attr_value = match &node.value {
                    AttributeValue::True(_) => "true".to_string(),
                    AttributeValue::Sequence(parts) => parts
                        .iter()
                        .filter_map(|p| {
                            if let AttributeValuePart::Text(t) = p {
                                Some(t.data.to_string())
                            } else {
                                None
                            }
                        })
                        .collect::<String>(),
                    AttributeValue::Expression(_) => {
                        self.has_expressions = true;
                        return Ok(()); // Expression attributes handled separately
                    }
                };
                self.special_attrs
                    .push(SpecialAttribute::CustomElementData {
                        var_name,
                        attr_name: attr_name.to_string(),
                        attr_value,
                    });
                return Ok(()); // Skip adding to template
            }
            _ => {}
        }

        // Normal attribute - add to template
        match &node.value {
            AttributeValue::True(_) => {
                self.html_parts.push(format!(" {}", attr_name));
            }
            AttributeValue::Sequence(parts) => {
                self.html_parts.push(format!(" {}=\"", attr_name));
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

            // Check if this is a root-level expression (no parent element)
            if self.element_stack.is_empty() {
                // Root-level expression - needs its own text node
                // Count existing root expressions to get correct index
                let root_expr_count = self
                    .nodes
                    .iter()
                    .filter(|n| matches!(n.node_type, NodeType::RootExpression))
                    .count();
                let var_name = format!("text_{}", root_expr_count + 1);
                self.nodes.push(NodeInfo {
                    var_name,
                    node_type: NodeType::RootExpression,
                    expression: Some(expr_source),
                    child_index: self.current_child_index,
                    event_handlers: Vec::new(),
                    bindings: Vec::new(),
                    is_input: false,
                    content_template: None,
                });
            } else {
                // Expression inside an element
                let var_name = self.element_stack.last().unwrap().clone();
                self.nodes.push(NodeInfo {
                    var_name,
                    node_type: NodeType::ExpressionInElement,
                    expression: Some(expr_source),
                    child_index: self.current_child_index,
                    event_handlers: Vec::new(),
                    bindings: Vec::new(),
                    is_input: false,
                    content_template: None,
                });
            }
        }

        // Don't output anything in template - the element will be empty
        Ok(())
    }

    fn generate_component_usage(&mut self, component: &Component) -> Result<(), TransformError> {
        let comp_name = component.name.to_string();

        // Check for bind directives
        let mut bind_this_var: Option<String> = None;
        let mut bind_value_var: Option<(String, String)> = None; // (binding_name, var_name)
        let mut has_other_attrs = false;

        for attr in &component.attributes {
            match attr {
                Attribute::BindDirective(bind) => {
                    let expr_start = bind.expression.start().unwrap_or(0) as usize;
                    let expr_end = bind.expression.end().unwrap_or(0) as usize;
                    let var_name = if expr_end > expr_start && expr_end <= self.source.len() {
                        let extracted = self.source[expr_start..expr_end].trim().to_string();
                        // For shorthand bindings like `bind:value`, the extracted text might
                        // contain "bind:" or other directive syntax. In that case, use the
                        // directive name as the variable name.
                        if extracted.contains(':') || extracted.is_empty() {
                            bind.name.to_string()
                        } else {
                            extracted
                        }
                    } else {
                        // Fallback: use directive name for shorthand bindings
                        bind.name.to_string()
                    };

                    if bind.name == "this" {
                        bind_this_var = Some(var_name);
                    } else {
                        // Other bindings like bind:value
                        bind_value_var = Some((bind.name.to_string(), var_name));
                    }
                }
                Attribute::Attribute(_) => has_other_attrs = true,
                _ => {}
            }
        }

        // If component has only bind:this and no other attributes, use special handling
        if let Some(bind_var) = bind_this_var {
            if !has_other_attrs && bind_value_var.is_none() {
                // Don't add template placeholder - component will be called directly
                self.bind_this_components.push(BindThisComponent {
                    component_name: comp_name,
                    bind_var,
                });
                return Ok(());
            }
        }

        // If component has bind:value (or similar), track it for getter/setter generation
        if let Some((bind_name, bind_var)) = bind_value_var {
            self.components_with_bindings.push(ComponentWithBinding {
                component_name: comp_name.clone(),
                bind_name,
                bind_var,
            });
            // Add template placeholder
            self.html_parts.push("<!>".to_string());
            return Ok(());
        }

        // Extract props from attributes first (needed for all cases)
        let mut props = Vec::new();
        for attr in &component.attributes {
            if let Attribute::Attribute(node) = attr {
                let name = node.name.as_str();
                if let AttributeValue::Expression(expr_tag) = &node.value {
                    // Use the expression's span, not the ExpressionTag's span
                    let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                    let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let expr_source = self.source[expr_start..expr_end].trim().to_string();
                        // Check for shorthand property (name equals expression)
                        if expr_source == name {
                            props.push(name.to_string());
                        } else {
                            // Transform arrow function expressions with state variable assignments
                            let transformed_expr =
                                transform_arrow_function_expr(&expr_source, &self.state_vars);
                            props.push(format!("{}: {}", name, transformed_expr));
                        }
                    }
                }
            }
        }

        // Check if component has children - handle separately
        let has_children = component
            .fragment
            .nodes
            .iter()
            .any(|n| !matches!(n, TemplateNode::Text(t) if t.data.trim().is_empty()));

        if has_children {
            // Collect children content
            let mut children_parts = Vec::new();
            for node in &component.fragment.nodes {
                match node {
                    TemplateNode::Text(text) => {
                        let data = text.data.as_str();
                        if !data.is_empty() {
                            children_parts.push(ChildPart::Text(data.to_string()));
                        }
                    }
                    TemplateNode::ExpressionTag(tag) => {
                        let expr_start = tag.start as usize;
                        let expr_end = tag.end as usize;
                        if expr_start + 1 < expr_end && expr_end <= self.source.len() {
                            let expr = self.source[expr_start + 1..expr_end - 1].trim().to_string();
                            children_parts.push(ChildPart::Expression(expr));
                        }
                    }
                    _ => {}
                }
            }

            if !children_parts.is_empty() {
                // Store component with children for special code generation
                self.components_with_children.push(ComponentWithChildren {
                    component_name: comp_name.clone(),
                    props: props.join(", "),
                    children_parts,
                });
                // Don't add to nodes or html - will be generated separately
                return Ok(());
            }
        }

        // For components without children, use template placeholder
        self.html_parts.push("<!>".to_string());

        let var_name = self.next_node_var();

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
            event_handlers: Vec::new(),
            bindings: Vec::new(),
            is_input: false,
            content_template: None,
        });

        Ok(())
    }

    fn generate_if_block(&mut self, _block: &IfBlock) -> Result<(), TransformError> {
        // Control blocks need anchor comments
        self.html_parts.push("<!>".to_string());
        Ok(())
    }

    fn generate_each_block(&mut self, block: &EachBlock) -> Result<(), TransformError> {
        // Get the iterable expression
        let start = block.expression.start().unwrap_or(0) as usize;
        let end = block.expression.end().unwrap_or(0) as usize;
        let iterable = if end > start && end <= self.source.len() {
            self.source[start..end].trim().to_string()
        } else {
            "[]".to_string()
        };

        // Get the context variable name
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

        // Get optional index name
        let index_name = block.index.as_ref().map(|idx| idx.to_string());

        // Analyze body nodes to determine structure
        let body_nodes: Vec<_> = block.body.nodes.iter().collect();

        // Skip leading/trailing whitespace
        let mut start_idx = 0;
        let mut end_idx = body_nodes.len();

        while start_idx < end_idx {
            if let TemplateNode::Text(text) = body_nodes[start_idx] {
                if text.data.trim().is_empty() {
                    start_idx += 1;
                    continue;
                }
            }
            break;
        }

        while end_idx > start_idx {
            if let TemplateNode::Text(text) = body_nodes[end_idx - 1] {
                if text.data.trim().is_empty() {
                    end_idx -= 1;
                    continue;
                }
            }
            break;
        }

        // Check if body contains elements or just text/expressions
        let has_elements = body_nodes[start_idx..end_idx]
            .iter()
            .any(|node| matches!(node, TemplateNode::RegularElement(_)));

        let mut each_info = EachBlockInfo {
            template_var: None,
            template_html: None,
            iterable,
            context_name,
            index_name,
            is_text_only: !has_elements,
            body_expressions: Vec::new(),
            body_element: None,
            dynamic_attributes: Vec::new(),
            event_handlers: Vec::new(),
        };

        if has_elements {
            // Generate separate template for body element
            self.each_block_counter += 1;
            let template_var = format!("root_{}", self.each_block_counter);

            // Find the first element in the body
            for node in &body_nodes[start_idx..end_idx] {
                if let TemplateNode::RegularElement(elem) = node {
                    let elem_name = elem.name.as_str();
                    each_info.body_element = Some(elem_name.to_string());
                    each_info.template_var = Some(template_var.clone());

                    // Build the template with static attributes and text content
                    let mut template_html = format!("<{elem_name}");

                    // Collect static and dynamic attributes
                    let mut dynamic_attrs = Vec::new();
                    let mut event_handlers = Vec::new();

                    for attr in &elem.attributes {
                        if let Attribute::Attribute(attr_node) = attr {
                            let attr_name = attr_node.name.as_str();

                            // Check for event handlers (on* attributes)
                            if let Some(event_name) = attr_name.strip_prefix("on") {
                                if let AttributeValue::Expression(expr_tag) = &attr_node.value {
                                    let expr_start =
                                        expr_tag.expression.start().unwrap_or(0) as usize;
                                    let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                                    if expr_end > expr_start && expr_end <= self.source.len() {
                                        let handler =
                                            self.source[expr_start..expr_end].trim().to_string();
                                        // Strip TypeScript non-null assertions (!)
                                        let handler = handler.replace(")!", ")");
                                        event_handlers.push(EventHandler {
                                            event: event_name.to_string(),
                                            handler,
                                        });
                                    }
                                }
                                continue;
                            }

                            // Handle static attributes (text values or True)
                            match &attr_node.value {
                                AttributeValue::Sequence(parts) => {
                                    // Check if all parts are text (no expressions)
                                    let all_text = parts
                                        .iter()
                                        .all(|p| matches!(p, AttributeValuePart::Text(_)));
                                    if all_text && !parts.is_empty() {
                                        let value: String = parts
                                            .iter()
                                            .filter_map(|p| {
                                                if let AttributeValuePart::Text(t) = p {
                                                    Some(t.data.as_str())
                                                } else {
                                                    None
                                                }
                                            })
                                            .collect();
                                        template_html
                                            .push_str(&format!(r#" {}="{}""#, attr_name, value));
                                    }
                                }
                                AttributeValue::Expression(expr_tag) => {
                                    // Dynamic attribute
                                    let expr_start =
                                        expr_tag.expression.start().unwrap_or(0) as usize;
                                    let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                                    if expr_end > expr_start && expr_end <= self.source.len() {
                                        let expr =
                                            self.source[expr_start..expr_end].trim().to_string();
                                        dynamic_attrs.push(DynamicAttribute {
                                            name: attr_name.to_string(),
                                            expr,
                                        });
                                    }
                                }
                                AttributeValue::True(_) => {
                                    // Boolean attribute
                                    template_html.push_str(&format!(" {}", attr_name));
                                }
                            }
                        }
                    }
                    template_html.push('>');

                    each_info.dynamic_attributes = dynamic_attrs;
                    each_info.event_handlers = event_handlers;

                    // Check for static text content
                    let mut has_only_static_text = true;
                    let mut static_text = String::new();
                    for child in &elem.fragment.nodes {
                        match child {
                            TemplateNode::Text(text) => {
                                let trimmed = text.data.trim();
                                if !trimmed.is_empty() {
                                    static_text.push_str(trimmed);
                                }
                            }
                            TemplateNode::ExpressionTag(_) => {
                                has_only_static_text = false;
                            }
                            _ => {}
                        }
                    }

                    if has_only_static_text && !static_text.is_empty() {
                        template_html.push_str(&static_text);
                    }

                    template_html.push_str(&format!("</{elem_name}>"));
                    each_info.template_html = Some(template_html);

                    // Check for dynamic expressions inside the element - build text template
                    if !has_only_static_text {
                        let mut text_parts = Vec::new();
                        for child in &elem.fragment.nodes {
                            if let TemplateNode::ExpressionTag(tag) = child {
                                let expr_start = tag.start as usize;
                                let expr_end = tag.end as usize;
                                if expr_start + 1 < expr_end && expr_end <= self.source.len() {
                                    let expr = self.source[expr_start + 1..expr_end - 1]
                                        .trim()
                                        .to_string();
                                    text_parts.push(format!("${{{}}}", expr));
                                }
                            } else if let TemplateNode::Text(text) = child {
                                let data = &text.data;
                                if !data.is_empty() {
                                    text_parts.push(data.to_string());
                                }
                            }
                        }
                        if !text_parts.is_empty() {
                            let combined = text_parts.join("");
                            let trimmed = combined.trim().to_string();
                            if !trimmed.is_empty() {
                                each_info
                                    .body_expressions
                                    .push(format!("TEMPLATE:{}", trimmed));
                            }
                        }
                    }
                    break;
                }
            }
        } else {
            // Text-only body - collect expressions
            for node in &body_nodes[start_idx..end_idx] {
                if let TemplateNode::ExpressionTag(tag) = node {
                    let expr_start = tag.start as usize;
                    let expr_end = tag.end as usize;
                    if expr_start + 1 < expr_end && expr_end <= self.source.len() {
                        let expr = self.source[expr_start + 1..expr_end - 1].trim().to_string();
                        each_info.body_expressions.push(expr);
                    }
                } else if let TemplateNode::Text(text) = node {
                    let trimmed = text.data.trim();
                    if !trimmed.is_empty() {
                        each_info.body_expressions.push(format!("'{}'", trimmed));
                    }
                }
            }
        }

        self.each_blocks.push(each_info);

        // Don't output anything in the template - the each block uses $.comment()
        Ok(())
    }

    fn generate_await_block(&mut self, block: &AwaitBlock) -> Result<(), TransformError> {
        // Extract promise expression
        let expr_start = block.expression.start().unwrap_or(0) as usize;
        let expr_end = block.expression.end().unwrap_or(0) as usize;
        let promise_expr = if expr_end > expr_start && expr_end <= self.source.len() {
            self.source[expr_start..expr_end].trim().to_string()
        } else {
            "null".to_string()
        };

        // Extract then value variable name (e.g., "counter" from "{#await promise then counter}")
        let then_value = if let Some(ref value) = block.value {
            let val_start = value.start().unwrap_or(0) as usize;
            let val_end = value.end().unwrap_or(0) as usize;
            if val_end > val_start && val_end <= self.source.len() {
                Some(self.source[val_start..val_end].trim().to_string())
            } else {
                None
            }
        } else {
            None
        };

        // Store await block info
        self.await_blocks.push(AwaitBlockInfo {
            promise_expr: promise_expr.clone(),
            then_value: then_value.clone(),
        });

        // Track await block as a node for navigation
        self.node_var_index += 1;
        let var_name = "node".to_string();
        self.nodes.push(NodeInfo {
            var_name,
            node_type: NodeType::AwaitBlock,
            expression: Some(promise_expr),
            child_index: self.current_child_index,
            event_handlers: Vec::new(),
            bindings: Vec::new(),
            is_input: false,
            content_template: then_value,
        });

        self.html_parts.push("<!>".to_string());
        Ok(())
    }

    fn generate_key_block(&mut self, _block: &KeyBlock) -> Result<(), TransformError> {
        self.html_parts.push("<!>".to_string());
        Ok(())
    }

    fn generate_snippet_block(&mut self, block: &SnippetBlock) -> Result<(), TransformError> {
        // Extract snippet name from expression
        let name_start = block.expression.start().unwrap_or(0) as usize;
        let name_end = block.expression.end().unwrap_or(0) as usize;
        let name = if name_end > name_start && name_end <= self.source.len() {
            self.source[name_start..name_end].trim().to_string()
        } else {
            return Ok(());
        };

        // Extract body content (for now just text)
        let mut body_text = String::new();
        for node in &block.body.nodes {
            if let TemplateNode::Text(text) = node {
                let trimmed = text.data.trim();
                if !trimmed.is_empty() {
                    body_text = trimmed.to_string();
                }
            }
        }

        // Store snippet info
        self.snippets.push(SnippetInfo { name, body_text });

        Ok(())
    }

    fn generate_render_tag(&mut self, _tag: &RenderTag) -> Result<(), TransformError> {
        self.html_parts.push("<!>".to_string());
        Ok(())
    }

    fn generate_html_tag(&mut self, tag: &HtmlTag) -> Result<(), TransformError> {
        // Add placeholder in template
        self.html_parts.push("<!>".to_string());

        // Extract the expression
        let expr_start = tag.expression.start().unwrap_or(0) as usize;
        let expr_end = tag.expression.end().unwrap_or(0) as usize;
        let expression = if expr_end > expr_start && expr_end <= self.source.len() {
            let raw_expr = self.source[expr_start..expr_end].trim().to_string();
            // Transform read-only props to $$props.propName
            transform_read_only_props(&raw_expr, &self.read_only_props)
        } else {
            String::new()
        };

        // Store the html tag info for runtime code generation
        if !expression.is_empty() {
            self.html_tags.push(HtmlTagInfo { expression });
        }

        Ok(())
    }

    fn generate_svelte_element(
        &mut self,
        elem: &SvelteDynamicElement,
    ) -> Result<(), TransformError> {
        // svelte:element generates a comment placeholder like other control blocks
        // The actual element is created at runtime via $.element()

        // Extract the tag expression
        let tag_start = elem.tag.start().unwrap_or(0) as usize;
        let tag_end = elem.tag.end().unwrap_or(0) as usize;
        let tag_expr = if tag_end > tag_start && tag_end <= self.source.len() {
            self.source[tag_start..tag_end].trim().to_string()
        } else {
            "null".to_string()
        };

        // Store the svelte:element info
        self.svelte_elements.push(SvelteElementInfo { tag_expr });

        // Don't output anything in the template - $.element() handles it
        Ok(())
    }

    fn build(self) -> String {
        let html = self.html_parts.join("");
        let is_fragment = self.root_element_count > 1;
        let has_each_blocks = !self.each_blocks.is_empty();

        // Try simple AST-based generation for basic cases
        if self.can_use_simple_ast() && !html.is_empty() {
            if let Ok(output) = self.build_simple_component_ast(&html, is_fragment) {
                return output;
            }
        }

        // Extract imports from script content
        let (script_imports, script_rest) = extract_imports(&self.script_content);

        // Check if script uses $props()
        let uses_props = self.script_content.contains("$props()");

        // Check if class fields use $state or $derived runes
        // This requires $$props and $.push/$.pop wrapper
        let has_class_state_fields = self.script_content.contains("class ")
            && (self.script_content.contains("= $state(")
                || self.script_content.contains("= $derived("));

        // Check if $props() is used as identifier (not destructured)
        // Pattern: let props = $props() or const props = $props()
        // Also extract the variable name used
        let props_identifier_name: Option<String> = self.script_content.lines().find_map(|line| {
            let trimmed = line.trim();
            if (trimmed.starts_with("let ") || trimmed.starts_with("const "))
                && !trimmed.contains('{')
                && trimmed.contains("= $props()")
            {
                if let Some(eq_pos) = trimmed.find('=') {
                    let before_eq = trimmed[..eq_pos].trim();
                    if let Some(var_name) = before_eq.split_whitespace().last() {
                        return Some(var_name.to_string());
                    }
                }
            }
            None
        });
        let uses_props_identifier = props_identifier_name.is_some();

        // Generate system imports based on runes mode
        let system_imports = if self.uses_runes {
            "import 'svelte/internal/disclose-version';\nimport * as $ from 'svelte/internal/client';"
        } else {
            "import 'svelte/internal/disclose-version';\nimport 'svelte/internal/flags/legacy';\nimport * as $ from 'svelte/internal/client';"
        };

        // Build hoisted imports section
        let hoisted_imports = if script_imports.is_empty() {
            String::new()
        } else {
            format!("{}\n", script_imports.join("\n"))
        };

        // Transform remaining script content for client-side
        let script_code = if uses_props_identifier {
            // Wrap with $.push/$.pop for props identifier pattern
            let props_name = props_identifier_name.as_ref().unwrap();
            let transformed =
                self.transform_script_content_with_props_identifier(&script_rest, props_name);
            format!("\t$.push($$props, true);\n\n{}", transformed)
        } else if has_class_state_fields {
            // Wrap with $.push/$.pop for class with state fields
            let transformed = self.transform_script_content(&script_rest);
            format!("\t$.push($$props, true);\n\n{}", transformed)
        } else {
            self.transform_script_content(&script_rest)
        };

        // Determine root variable name
        let root_var = if is_fragment {
            "fragment".to_string()
        } else {
            determine_root_var(&html)
        };

        // Generate runtime code for expressions (using AST-based generation)
        let runtime_code = self.generate_runtime_code_via_ast(&root_var);

        // Collect delegated events
        let delegated_events = self.collect_delegated_events();
        let delegation_code = if delegated_events.is_empty() {
            String::new()
        } else {
            let events_str = delegated_events
                .iter()
                .map(|e| format!("'{}'", e))
                .collect::<Vec<_>>()
                .join(", ");
            format!("\n\n$.delegate([{}]);", events_str)
        };

        // Determine function signature based on $props usage or class state fields
        let fn_params = if uses_props || has_class_state_fields {
            "$$anchor, $$props"
        } else {
            "$$anchor"
        };

        // Check if there's any HTML content
        let has_html = !html.is_empty();

        // Generate each block templates (for bodies with elements)
        let each_templates: String = self
            .each_blocks
            .iter()
            .filter_map(|each| {
                if let (Some(var), Some(html)) = (&each.template_var, &each.template_html) {
                    Some(format!("var {} = $.from_html(`{}`);\n\n", var, html))
                } else {
                    None
                }
            })
            .collect();

        // Generate each block code (using AST-based generation)
        let each_code = self.generate_each_block_code_via_ast();

        // Generate svelte:element code (using AST-based generation)
        let has_svelte_elements = !self.svelte_elements.is_empty();
        let svelte_element_code = self.generate_svelte_element_code_via_ast();

        // Generate hoisted snippet code (using AST-based generation)
        let snippets_code = self.generate_snippets_code_via_ast();

        // Check for bind:this only components (special case)
        let has_bind_this_only =
            !self.bind_this_components.is_empty() && html.is_empty() && self.nodes.is_empty();

        // Check for component with children only (special case)
        let has_component_with_children =
            !self.components_with_children.is_empty() && html.is_empty() && self.nodes.is_empty();

        // Check for component with bindings (like bind:value)
        let has_component_with_binding = !self.components_with_bindings.is_empty();

        // Generate component binding code (using AST-based generation)
        let component_binding_code = self.generate_component_binding_code_via_ast();

        let raw_output = if has_component_with_binding && !snippets_code.is_empty() {
            // Component with binding + snippets + root-level expressions
            // Template is just `<!> ` for the component placeholder + space for text node
            // Check if we have root-level expressions in nodes
            let has_root_expressions = self
                .nodes
                .iter()
                .any(|n| matches!(n.node_type, NodeType::RootExpression));

            let expression_code = if has_root_expressions {
                // Get the expression from the first root-level expression node
                let expr = self
                    .nodes
                    .iter()
                    .find(|n| matches!(n.node_type, NodeType::RootExpression))
                    .and_then(|n| n.expression.as_ref())
                    .cloned()
                    .unwrap_or_default();

                // Extract any text before the expression from html (but remove the component placeholder)
                // The text includes whitespace normalization
                let text_before = html
                    .replace("<!>", "")
                    .replace('\n', " ")
                    .trim_end()
                    .to_string();

                // Wrap expression in $.get() if it's a state variable
                let wrapped_expr = if self.state_vars.contains(&expr) {
                    format!("$.get({})", expr)
                } else {
                    expr
                };

                format!(
                    "\tvar text_1 = $.sibling(node);\n\n\t$.template_effect(() => $.set_text(text_1, `{} ${{{} ?? ''}}`));\n",
                    text_before, wrapped_expr
                )
            } else {
                String::new()
            };

            format!(
                r#"{system_imports}
{hoisted_imports}{snippets_code}var root = $.from_html(`<!> `, 1);

export default function {component_name}({fn_params}) {{
{script_code}	var fragment = root();
{component_binding_code}{expression_code}	$.append($$anchor, fragment);
}}"#,
                system_imports = system_imports,
                hoisted_imports = hoisted_imports,
                snippets_code = snippets_code,
                component_name = self.component_name,
                fn_params = fn_params,
                script_code = script_code,
                component_binding_code = component_binding_code,
                expression_code = expression_code
            )
        } else if has_component_with_children {
            // Component with children - no template needed, generate children callback
            let comp = &self.components_with_children[0];
            let children_code = self.generate_children_callback(&comp.children_parts);
            let props_with_children = if comp.props.is_empty() {
                format!(
                    "children: {},\n\n\t\t$$slots: {{ default: true }}",
                    children_code
                )
            } else {
                format!(
                    "{},\n\n\t\tchildren: {},\n\n\t\t$$slots: {{ default: true }}",
                    comp.props, children_code
                )
            };
            format!(
                r#"{system_imports}
{hoisted_imports}
export default function {component_name}({fn_params}) {{
{script_code}	{comp_name}($$anchor, {{
		{props_with_children}
	}});
}}"#,
                system_imports = system_imports,
                hoisted_imports = hoisted_imports,
                component_name = self.component_name,
                fn_params = fn_params,
                script_code = script_code,
                comp_name = comp.component_name,
                props_with_children = props_with_children
            )
        } else if has_bind_this_only {
            // Component with only bind:this - no template needed
            let bind_comp = &self.bind_this_components[0];
            let legacy_prop = if self.uses_runes {
                ""
            } else {
                ", { $$legacy: true }"
            };
            format!(
                r#"{system_imports}

export default function {component_name}($$anchor) {{
	$.bind_this({comp_name}($$anchor{legacy_prop}), ($$value) => {bind_var} = $$value, () => {bind_var});
}}"#,
                system_imports = system_imports,
                component_name = self.component_name,
                comp_name = bind_comp.component_name,
                legacy_prop = legacy_prop,
                bind_var = bind_comp.bind_var
            )
        } else if has_svelte_elements && (html.is_empty() || html.trim().is_empty()) {
            // Only svelte:element, no other HTML
            format!(
                r#"{system_imports}
{hoisted_imports}
export default function {component_name}({fn_params}) {{
{script_code}	var fragment = $.comment();
	var node = $.first_child(fragment);
{svelte_element_code}	$.append($$anchor, fragment);
}}{delegation_code}"#,
                system_imports = system_imports,
                hoisted_imports = hoisted_imports,
                component_name = self.component_name,
                fn_params = fn_params,
                script_code = script_code,
                svelte_element_code = svelte_element_code,
                delegation_code = delegation_code
            )
        } else if has_each_blocks && (html.is_empty() || html.trim().is_empty()) {
            // Only each blocks, no other HTML
            format!(
                r#"{system_imports}
{hoisted_imports}
{each_templates}export default function {component_name}({fn_params}) {{
{script_code}	var fragment = $.comment();
	var node = $.first_child(fragment);
{each_code}
	$.append($$anchor, fragment);
}}{delegation_code}"#,
                system_imports = system_imports,
                hoisted_imports = hoisted_imports,
                each_templates = each_templates,
                component_name = self.component_name,
                fn_params = fn_params,
                script_code = script_code,
                each_code = each_code,
                delegation_code = delegation_code
            )
        } else if !has_html && runtime_code.is_empty() && !has_each_blocks {
            // No HTML template - just script code
            let pop_code = if uses_props_identifier || has_class_state_fields {
                "\n\t$.pop();\n"
            } else {
                ""
            };
            if script_code.is_empty() {
                format!(
                    r#"{system_imports}
{hoisted_imports}
export default function {component_name}({fn_params}) {{}}{delegation_code}"#,
                    system_imports = system_imports,
                    hoisted_imports = hoisted_imports,
                    component_name = self.component_name,
                    fn_params = fn_params,
                    delegation_code = delegation_code
                )
            } else {
                format!(
                    r#"{system_imports}
{hoisted_imports}
export default function {component_name}({fn_params}) {{
{script_code}{pop_code}}}{delegation_code}"#,
                    system_imports = system_imports,
                    hoisted_imports = hoisted_imports,
                    component_name = self.component_name,
                    fn_params = fn_params,
                    script_code = script_code,
                    pop_code = pop_code,
                    delegation_code = delegation_code
                )
            }
        } else if is_fragment {
            // Multiple root elements - use fragment pattern
            // Template flags:
            // - TEMPLATE_FRAGMENT = 1 (always for fragments)
            // - TEMPLATE_USE_IMPORT_NODE = 2 (for custom elements/video)
            let template_flags = if self.has_custom_elements { 3 } else { 1 };
            format!(
                r#"{system_imports}
{hoisted_imports}{snippets_code}var root = $.from_html(`{html}`, {template_flags});

export default function {component_name}({fn_params}) {{
{script_code}	var fragment = root();
{runtime_code}	$.append($$anchor, fragment);
}}{delegation_code}"#,
                system_imports = system_imports,
                hoisted_imports = hoisted_imports,
                snippets_code = snippets_code,
                html = html,
                template_flags = template_flags,
                component_name = self.component_name,
                fn_params = fn_params,
                script_code = script_code,
                runtime_code = runtime_code,
                delegation_code = delegation_code
            )
        } else {
            // Single root element
            let root_var = determine_root_var(&html);
            format!(
                r#"{system_imports}
{hoisted_imports}{snippets_code}var root = $.from_html(`{html}`);

export default function {component_name}({fn_params}) {{
{script_code}	var {root_var} = root();
{runtime_code}	$.append($$anchor, {root_var});
}}{delegation_code}"#,
                system_imports = system_imports,
                hoisted_imports = hoisted_imports,
                snippets_code = snippets_code,
                html = html,
                component_name = self.component_name,
                fn_params = fn_params,
                script_code = script_code,
                root_var = root_var,
                runtime_code = runtime_code,
                delegation_code = delegation_code
            )
        };

        // Normalize the output through oxc parser/codegen
        match normalize_js(&raw_output) {
            Ok(normalized) => normalized,
            Err(_) => raw_output, // Fall back to raw output if parsing fails
        }
    }

    /// Generate children callback for component with children.
    /// Creates: ($$anchor, $$slotProps) => { $.next(); var text = $.text(); ... }
    fn generate_children_callback(&self, children_parts: &[ChildPart]) -> String {
        // Build the content template from children parts
        let mut content_parts = Vec::new();
        let mut has_expressions = false;

        for part in children_parts {
            match part {
                ChildPart::Text(text) => {
                    // Normalize whitespace in text - collapse multiple whitespace to single space
                    let normalized = text.split_whitespace().collect::<Vec<_>>().join(" ");
                    if !normalized.is_empty() {
                        // Add trailing space if this is followed by an expression
                        content_parts.push(format!("{} ", normalized));
                    }
                }
                ChildPart::Expression(expr) => {
                    has_expressions = true;
                    // Wrap state variable access in $.get()
                    let transformed = transform_state_in_expr(expr, &self.state_vars);
                    content_parts.push(format!("${{{} ?? ''}}", transformed));
                }
            }
        }

        // Remove trailing space if present
        let content_template = content_parts.join("").trim_end().to_string();

        if has_expressions {
            // Generate callback with template_effect
            format!(
                r#"($$anchor, $$slotProps) => {{
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, `{}`));
			$.append($$anchor, text);
		}}"#,
                content_template
            )
        } else {
            // Static content only
            format!(
                r#"($$anchor, $$slotProps) => {{
			$.next();

			var text = $.text('{}');

			$.append($$anchor, text);
		}}"#,
                content_parts.join("")
            )
        }
    }

    /// Legacy string-based svelte:element code generation.
    #[allow(dead_code)]
    fn generate_svelte_element_code(&self) -> String {
        let mut code = String::new();

        for elem in &self.svelte_elements {
            code.push_str(&format!("\n\t$.element(node, {}, false);\n", elem.tag_expr));
        }

        code
    }

    /// Legacy string-based snippet code generation.
    #[allow(dead_code)]
    fn generate_snippets_code(&self) -> String {
        let mut code = String::new();

        for snippet in &self.snippets {
            code.push_str(&format!(
                r#"const {} = ($$anchor) => {{
	$.next();

	var text = $.text('{}');

	$.append($$anchor, text);
}};

"#,
                snippet.name, snippet.body_text
            ));
        }

        code
    }

    /// Legacy string-based component binding code generation.
    #[allow(dead_code)]
    fn generate_component_binding_code(&self) -> String {
        let mut code = String::new();

        for comp in &self.components_with_bindings {
            code.push_str(&format!(
                r#"	var node = $.first_child(fragment);

	{}(node, {{
		get {}() {{
			return $.get({});
		}},

		set {}($$value) {{
			$.set({}, $$value, true);
		}}
	}});

"#,
                comp.component_name, comp.bind_name, comp.bind_var, comp.bind_name, comp.bind_var
            ));
        }

        code
    }

    /// Generate code for await blocks.
    #[allow(dead_code)]
    fn generate_await_block_code(&self) -> String {
        let mut code = String::new();

        for await_block in &self.await_blocks {
            // Wrap promise expression in $.get() if it's a derived value
            let promise_getter = format!("() => $.get({})", await_block.promise_expr);

            // Generate then callback
            let then_callback = if let Some(ref then_val) = await_block.then_value {
                format!("($$anchor, {}) => {{}}", then_val)
            } else {
                "($$anchor) => {}".to_string()
            };

            code.push_str(&format!(
                "\t$.await(node, {}, null, {});\n\n",
                promise_getter, then_callback
            ));
        }

        code
    }

    /// Legacy string-based each block code generation.
    /// Use generate_each_block_code_via_ast instead.
    #[allow(dead_code)]
    fn generate_each_block_code(&self) -> String {
        let mut code = String::new();

        for each in &self.each_blocks {
            let iterable = &each.iterable;

            // Determine callback parameters
            let callback_params = if let Some(ref ctx) = each.context_name {
                if let Some(ref idx) = each.index_name {
                    format!("$$anchor, {}, {}", ctx, idx)
                } else {
                    format!("$$anchor, {}", ctx)
                }
            } else if let Some(ref idx) = each.index_name {
                format!("$$anchor, $$item, {}", idx)
            } else {
                "$$anchor, $$item".to_string()
            };

            // Key function ($.index for both indexed and non-indexed each blocks in basic cases)
            let key_fn = "$.index";

            // Generate callback body
            let callback_body = if each.is_text_only {
                // Text-only body
                let expr_parts: Vec<String> = each
                    .body_expressions
                    .iter()
                    .map(|expr| {
                        if expr.starts_with('\'') || expr.starts_with('"') {
                            // Literal string - extract content
                            expr[1..expr.len() - 1].to_string()
                        } else {
                            format!("${{{} ?? ''}}", expr)
                        }
                    })
                    .collect();
                let template_str = expr_parts.join("");

                format!(
                    r#"
		$.next();
		var text = $.text();
		$.template_effect(() => $.set_text(text, `{}`));
		$.append($$anchor, text);"#,
                    template_str
                )
            } else if let Some(ref template_var) = each.template_var {
                // Element-based body
                let elem_var = each.body_element.as_deref().unwrap_or("elem");

                // Build text content for element
                let content = if each.body_expressions.is_empty() {
                    String::new()
                } else {
                    // Check if we have a pre-built template (starts with TEMPLATE:)
                    if let Some(first) = each.body_expressions.first() {
                        if let Some(template_content) = first.strip_prefix("TEMPLATE:") {
                            format!("\n\t\t{}.textContent = `{}`;", elem_var, template_content)
                        } else {
                            let expr_parts: Vec<String> = each
                                .body_expressions
                                .iter()
                                .map(|expr| {
                                    if expr.starts_with('\'') || expr.starts_with('"') {
                                        expr[1..expr.len() - 1].to_string()
                                    } else {
                                        format!("${{{}}}", expr)
                                    }
                                })
                                .collect();
                            format!(
                                "\n\t\t{}.textContent = `{}`;",
                                elem_var,
                                expr_parts.join("")
                            )
                        }
                    } else {
                        String::new()
                    }
                };

                // Build dynamic attributes code
                let mut dynamic_code = String::new();
                for attr in &each.dynamic_attributes {
                    dynamic_code.push_str(&format!(
                        "\n\t\t$.set_attribute({}, '{}', {});",
                        elem_var, attr.name, attr.expr
                    ));
                }

                // Build event handlers code
                for handler in &each.event_handlers {
                    dynamic_code.push_str(&format!(
                        "\n\t\t{}.__{} = {};",
                        elem_var, handler.event, handler.handler
                    ));
                }

                format!(
                    r#"
		var {} = {}();{}{}
		$.append($$anchor, {});
	"#,
                    elem_var, template_var, dynamic_code, content, elem_var
                )
            } else {
                String::new()
            };

            // Wrap object literal in parentheses to avoid it being parsed as a block
            let iterable_expr = if iterable.trim().starts_with('{') {
                format!("({})", iterable)
            } else {
                iterable.clone()
            };

            code.push_str(&format!(
                r#"
	$.each(node, 0, () => {}, {}, ({}) => {{{}}});
"#,
                iterable_expr, key_fn, callback_params, callback_body
            ));
        }

        code
    }

    /// Transform script content for client-side usage.
    /// Converts runes like `$state(x)` to `$.state(x)`.
    fn transform_script_content(&self, script: &str) -> String {
        if script.is_empty() {
            return String::new();
        }

        // First, transform class fields with $state and $derived
        let script = transform_class_fields_client(script);

        // Detect state variables that should be skipped (used in FUNC_ARRAY pattern)
        let skip_state_vars = self.detect_func_array_state_vars(&script);

        let mut result = String::new();

        for line in script.lines() {
            let trimmed = line.trim();

            // Skip empty lines
            if trimmed.is_empty() {
                continue;
            }

            // Skip lines that are already part of class transformation (have $.state or $.derived)
            if trimmed.contains("$.state(")
                || trimmed.contains("$.derived(")
                || trimmed.contains("$.get(")
                || trimmed.contains("$.set(")
            {
                result.push('\t');
                result.push_str(trimmed);
                result.push('\n');
                continue;
            }

            // Transform runes (with skipping for FUNC_ARRAY pattern)
            let mut transformed = transform_client_runes_with_skip(trimmed, &skip_state_vars);

            // Transform state variable assignments to $.set()
            transformed = transform_state_assignments(&transformed, &self.state_vars);

            result.push('\t');
            result.push_str(&transformed);
            result.push('\n');
        }

        result
    }

    /// Detect state variables that are only accessed through wrapper functions
    /// that are used in FUNC_ARRAY pattern templates.
    fn detect_func_array_state_vars(&self, script: &str) -> Vec<String> {
        // Check if any node has FUNC_ARRAY pattern
        let func_array_funcs: Vec<String> = self
            .nodes
            .iter()
            .filter_map(|n| n.content_template.as_ref())
            .filter_map(|t| t.strip_prefix("FUNC_ARRAY:"))
            .flat_map(|rest| {
                if let Some(colon_pos) = rest.find(':') {
                    rest[..colon_pos]
                        .split(',')
                        .map(|s| s.to_string())
                        .collect::<Vec<_>>()
                } else {
                    Vec::new()
                }
            })
            .collect();

        if func_array_funcs.is_empty() {
            return Vec::new();
        }

        // For each function in the FUNC_ARRAY, find state variables it returns
        let mut skip_vars = Vec::new();

        for func_name in &func_array_funcs {
            // Look for function definition that returns a state variable
            // Pattern: function funcName(){ return stateVar; } or function funcName() { return stateVar; }
            let pattern1 = format!("function {}()", func_name);
            let pattern2 = format!("function {}(){{", func_name);

            let func_pos = script.find(&pattern1).or_else(|| script.find(&pattern2));

            if let Some(pos) = func_pos {
                // Find the return statement
                let rest = &script[pos..];
                if let Some(return_pos) = rest.find("return ") {
                    let after_return = &rest[return_pos + 7..];
                    // Extract the identifier being returned
                    let end = after_return
                        .find(|c: char| !c.is_alphanumeric() && c != '_')
                        .unwrap_or(after_return.len());
                    let returned_var = after_return[..end].trim();

                    // Check if this is a state variable
                    if self.state_vars.contains(&returned_var.to_string()) {
                        skip_vars.push(returned_var.to_string());
                    }
                }
            }
        }

        skip_vars
    }

    /// Transform script content when $props() is used as an identifier.
    /// Transforms `props.a` to `$$props.a` for static property access (but not assignments or dynamic access).
    fn transform_script_content_with_props_identifier(
        &self,
        script: &str,
        props_var: &str,
    ) -> String {
        if script.is_empty() {
            return String::new();
        }

        let mut result = String::new();

        for line in script.lines() {
            let trimmed = line.trim();

            // Skip empty lines
            if trimmed.is_empty() {
                continue;
            }

            // Transform runes
            let mut transformed = transform_client_runes(trimmed);

            // Transform state variable assignments to $.set()
            transformed = transform_state_assignments(&transformed, &self.state_vars);

            // Transform props.X to $$props.X for static property access (but not assignments)
            // props.a -> $$props.a
            // props.a.b -> $$props.a.b
            // props.a = true -> props.a = true (keep as is, it's assignment)
            // props[a] -> props[a] (keep as is, it's dynamic)
            transformed = transform_props_access(&transformed, props_var);

            result.push('\t');
            result.push_str(&transformed);
            result.push('\n');
        }

        result
    }

    /// Collect all event types that need delegation
    fn collect_delegated_events(&self) -> Vec<String> {
        let mut events: Vec<String> = Vec::new();
        // Collect from regular nodes
        for node in &self.nodes {
            for (event_name, _) in &node.event_handlers {
                if !events.contains(event_name) {
                    events.push(event_name.clone());
                }
            }
        }
        // Collect from each blocks
        for each in &self.each_blocks {
            for handler in &each.event_handlers {
                if !events.contains(&handler.event) {
                    events.push(handler.event.clone());
                }
            }
        }
        events
    }

    // =========================================================================
    // AST-based code generation methods
    // =========================================================================

    /// Build system imports using AST builders.
    fn build_system_imports(&self) -> Vec<JsStatement> {
        let mut imports = vec![import_side_effect("svelte/internal/disclose-version")];

        if !self.uses_runes {
            imports.push(import_side_effect("svelte/internal/flags/legacy"));
        }

        imports.push(import_namespace("$", "svelte/internal/client"));
        imports
    }

    /// Build template variable declaration using AST.
    /// Returns: var root = $.from_html(`<html>`) or var root = $.from_html(`<html>`, 1)
    fn build_template_decl(&self, html: &str, is_fragment: bool) -> JsStatement {
        let flags = if is_fragment { Some(1) } else { None };
        var_decl("root", Some(svelte_from_html(html, flags)))
    }

    /// Build the component function params based on $props usage.
    #[allow(dead_code)]
    fn build_fn_params(&self, uses_props: bool) -> Vec<JsPattern> {
        let mut params = vec![id_pattern("$$anchor")];
        if uses_props {
            params.push(id_pattern("$$props"));
        }
        params
    }

    /// Build a simple component using AST builders.
    /// Handles the case: single element, no script, no expressions, no events.
    fn build_simple_component_ast(
        &self,
        html: &str,
        is_fragment: bool,
    ) -> Result<String, TransformError> {
        let root_var = determine_root_var(html);

        // Build the program
        let mut body: Vec<JsStatement> = Vec::new();

        // Add system imports
        body.extend(self.build_system_imports());

        // Add template declaration
        body.push(self.build_template_decl(html, is_fragment));

        // Build function body
        let fn_body = if is_fragment {
            vec![
                var_decl("fragment", Some(call(id("root"), vec![]))),
                stmt(svelte_append(id("$$anchor"), id("fragment"))),
            ]
        } else {
            vec![
                var_decl(&root_var, Some(call(id("root"), vec![]))),
                stmt(svelte_append(id("$$anchor"), id(&root_var))),
            ]
        };

        // Add export default function
        body.push(export_default_function(
            &self.component_name,
            vec![id_pattern("$$anchor")],
            fn_body,
        ));

        let prog = program(body);
        generate(&prog).map_err(TransformError::CodeGen)
    }

    /// Check if component can use simple AST-based generation.
    fn can_use_simple_ast(&self) -> bool {
        // Must have no special features
        if !self.each_blocks.is_empty()
            || !self.svelte_elements.is_empty()
            || !self.bind_this_components.is_empty()
            || !self.components_with_children.is_empty()
            || !self.snippets.is_empty()
            || !self.components_with_bindings.is_empty()
            || !self.await_blocks.is_empty()
        {
            return false;
        }

        // Must have no script content
        if !self.script_content.is_empty() {
            return false;
        }

        // All nodes must be simple elements (no runtime code needed)
        self.nodes.iter().all(|node| {
            matches!(node.node_type, NodeType::Element(_))
                && node.event_handlers.is_empty()
                && node.bindings.is_empty()
                && node.expression.is_none()
                && node.content_template.is_none()
        })
    }

    // =========================================================================
    // Navigation and runtime code AST builders
    // =========================================================================

    /// Build a navigation statement: var name = $.first_child(parent)
    #[allow(dead_code)]
    fn build_first_child_stmt(&self, var_name: &str, parent: &str) -> JsStatement {
        var_decl(var_name, Some(svelte_first_child(id(parent))))
    }

    /// Build a sibling navigation statement: var name = $.sibling(prev, count)
    #[allow(dead_code)]
    fn build_sibling_stmt(&self, var_name: &str, prev: &str, count: Option<i32>) -> JsStatement {
        var_decl(var_name, Some(svelte_sibling(id(prev), count)))
    }

    /// Build an event handler assignment: element.__event = handler
    #[allow(dead_code)]
    fn build_event_handler_stmt(
        &self,
        element: &str,
        event_name: &str,
        handler: JsExpr,
    ) -> JsStatement {
        let prop_name = format!("__{}", event_name);
        stmt(assign(member(id(element), &prop_name), handler))
    }

    /// Build a remove_input_defaults call: $.remove_input_defaults(element)
    #[allow(dead_code)]
    fn build_remove_input_defaults_stmt(&self, element: &str) -> JsStatement {
        stmt(svelte_remove_input_defaults(id(element)))
    }

    /// Build a template_effect with set_text: $.template_effect(() => $.set_text(node, `...`))
    #[allow(dead_code)]
    fn build_template_effect_set_text(
        &self,
        text_var: &str,
        template_parts: Vec<(String, Option<JsExpr>)>, // (text, optional_expr)
    ) -> JsStatement {
        // Build template literal
        let mut quasis = Vec::new();
        let mut expressions = Vec::new();

        for (i, (text, expr_opt)) in template_parts.iter().enumerate() {
            let is_tail = i == template_parts.len() - 1 && expr_opt.is_none();
            quasis.push(quasi(text, is_tail));
            if let Some(expr) = expr_opt {
                expressions.push(expr.clone());
            }
        }

        // Add final quasi if needed
        if !template_parts.is_empty() {
            if let Some((_, Some(_))) = template_parts.last() {
                quasis.push(quasi("", true));
            }
        }

        let template_lit = template(quasis, expressions);
        let set_text_call = call(
            member(id("$"), "set_text"),
            vec![id(text_var), template_lit],
        );
        let callback = thunk(set_text_call);
        stmt(svelte_template_effect(callback))
    }

    /// Build a component binding with getter/setter pattern
    #[allow(dead_code)]
    fn build_component_binding_stmt(
        &self,
        component_name: &str,
        anchor: &str,
        bind_name: &str,
        bind_var: &str,
    ) -> JsStatement {
        // Component(anchor, {
        //     get bindName() { return $.get(bindVar); },
        //     set bindName($$value) { $.set(bindVar, $$value, true); }
        // })
        let get_body = vec![super::js_ast::nodes::JsStatement::Return(
            super::js_ast::nodes::JsReturnStatement {
                argument: Some(Box::new(svelte_get(id(bind_var)))),
            },
        )];
        let set_body = vec![stmt(svelte_set_sync(id(bind_var), id("$$value")))];

        let props = object(vec![
            getter(bind_name, get_body),
            setter(bind_name, "$$value", set_body),
        ]);

        stmt(call(id(component_name), vec![id(anchor), props]))
    }

    /// Build $.delegate([...events]) statement
    #[allow(dead_code)]
    fn build_delegate_stmt(&self, events: &[String]) -> JsStatement {
        let events_array = array(events.iter().map(String::as_str).map(string).collect());
        stmt(call(member(id("$"), "delegate"), vec![events_array]))
    }

    /// Build reactive text content pattern:
    /// var text = $.child(element);
    /// $.reset(element);
    /// $.template_effect(() => $.set_text(text, `template`));
    #[allow(dead_code)]
    fn build_reactive_text_content(
        &self,
        element_var: &str,
        text_var: &str,
        template_expr: JsExpr,
    ) -> Vec<JsStatement> {
        vec![
            var_decl(text_var, Some(svelte_child(id(element_var), None))),
            stmt(svelte_reset(id(element_var))),
            stmt(svelte_template_effect(thunk(svelte_set_text(
                id(text_var),
                template_expr,
            )))),
        ]
    }

    /// Build static text content assignment: element.textContent = 'value';
    #[allow(dead_code)]
    fn build_static_text_content(&self, element_var: &str, value: &str) -> JsStatement {
        stmt(set_text_content(id(element_var), string(value)))
    }

    /// Build a $.bind_value statement
    #[allow(dead_code)]
    fn build_bind_value_stmt(&self, element: &str, bind_var: &str) -> JsStatement {
        stmt(svelte_bind_value(
            id(element),
            thunk(svelte_get(id(bind_var))),
            arrow(
                vec![id_pattern("$$value")],
                svelte_set(id(bind_var), id("$$value")),
            ),
        ))
    }

    /// Build $.await() statement
    #[allow(dead_code)]
    fn build_await_stmt(
        &self,
        anchor_var: &str,
        promise_expr: &str,
        then_value: Option<&str>,
    ) -> JsStatement {
        let promise_getter = thunk(svelte_get(id(promise_expr)));
        let then_callback = if let Some(val) = then_value {
            arrow_block(vec![id_pattern("$$anchor"), id_pattern(val)], vec![])
        } else {
            arrow_block(vec![id_pattern("$$anchor")], vec![])
        };
        stmt(svelte_await(
            id(anchor_var),
            promise_getter,
            None,
            then_callback,
        ))
    }

    /// Build runtime code as AST statements.
    /// Returns Vec<JsStatement> instead of String.
    #[allow(dead_code)]
    fn generate_runtime_code_ast(&self, root_var: &str) -> Vec<JsStatement> {
        let mut statements: Vec<JsStatement> = Vec::new();
        let is_fragment = root_var == "fragment";
        let mut bindings_stmts: Vec<JsStatement> = Vec::new();
        let mut template_effect_parts: Vec<(String, String)> = Vec::new();
        let mut prev_var: Option<String> = None;
        let mut first_nav = true;

        // Build a map of elements to their expressions
        let mut element_expressions: HashMap<String, Vec<&NodeInfo>> = HashMap::new();
        for node in &self.nodes {
            if let NodeType::ExpressionInElement = &node.node_type {
                element_expressions
                    .entry(node.var_name.clone())
                    .or_default()
                    .push(node);
            }
        }

        // Process all nodes in order
        for node in &self.nodes {
            match &node.node_type {
                NodeType::Element(_) => {
                    let var = &node.var_name;
                    let is_root_element = var == root_var;

                    let exprs = element_expressions.get(var).cloned().unwrap_or_default();
                    let has_exprs = !exprs.is_empty();

                    let needs_runtime = has_exprs
                        || !node.event_handlers.is_empty()
                        || !node.bindings.is_empty()
                        || node.is_input
                        || node.content_template.is_some();

                    if !needs_runtime {
                        continue;
                    }

                    // Navigation code
                    if !is_root_element {
                        if first_nav || (is_fragment && prev_var.is_none()) {
                            statements.push(var_decl(var, Some(svelte_first_child(id(root_var)))));
                            first_nav = false;
                        } else if let Some(ref prev) = prev_var {
                            statements.push(var_decl(var, Some(svelte_sibling(id(prev), Some(2)))));
                        }
                    }

                    // Remove input defaults
                    if node.is_input {
                        statements.push(stmt(svelte_remove_input_defaults(id(var))));
                    }

                    // Event handlers
                    for (event_name, handler) in &node.event_handlers {
                        let transformed = transform_state_assignments(handler, &self.state_vars);
                        let prop_name = format!("__{}", event_name);
                        statements
                            .push(stmt(assign(member(id(var), &prop_name), id(&transformed))));
                    }

                    // Content template handling
                    if let Some(content_template) = &node.content_template {
                        if let Some(rest) = content_template.strip_prefix("FUNC_ARRAY:") {
                            if let Some(colon_pos) = rest.find(':') {
                                let func_names: Vec<&str> = rest[..colon_pos].split(',').collect();
                                let template_str = &rest[colon_pos + 1..];

                                let text_var = "text";
                                statements
                                    .push(var_decl(text_var, Some(svelte_child(id(var), None))));
                                statements.push(stmt(svelte_reset(id(var))));

                                // Build params: ($0, $1, ...)
                                let params: Vec<JsPattern> = func_names
                                    .iter()
                                    .enumerate()
                                    .map(|(i, _)| id_pattern(format!("${}", i)))
                                    .collect();

                                // Build function array
                                let func_array = array(func_names.iter().map(|n| id(*n)).collect());

                                // Build template effect
                                let template_lit =
                                    template(vec![quasi(template_str, true)], vec![]);
                                let callback =
                                    arrow(params, svelte_set_text(id(text_var), template_lit));
                                statements.push(stmt(svelte_template_effect_with_values(
                                    callback, func_array,
                                )));
                            }
                        } else {
                            let is_reactive = self
                                .state_vars
                                .iter()
                                .any(|sv| content_template.contains(sv));

                            if is_reactive {
                                let text_var = "text";
                                statements
                                    .push(var_decl(text_var, Some(svelte_child(id(var), None))));
                                statements.push(stmt(svelte_reset(id(var))));
                                let template_str =
                                    wrap_state_vars_in_get(content_template, &self.state_vars);
                                template_effect_parts.push((text_var.to_string(), template_str));
                            } else {
                                let evaluated =
                                    evaluate_constant_template(content_template, &self.const_vars);
                                statements
                                    .push(stmt(set_text_content(id(var), string(&evaluated))));
                            }
                        }
                    } else if has_exprs {
                        let combined: Vec<String> = exprs
                            .iter()
                            .filter_map(|e| e.expression.as_ref())
                            .map(|expr| {
                                // First try constant folding
                                let folded = try_constant_fold(expr);
                                // Then transform read-only props to $$props.propName
                                transform_read_only_props(&folded, &self.read_only_props)
                            })
                            .collect();

                        match combined.len() {
                            1 => {
                                statements.push(stmt(set_text_content(id(var), id(&combined[0]))));
                            }
                            n if n > 1 => {
                                let all_literals = combined.iter().all(|s| {
                                    (s.starts_with('\'') && s.ends_with('\''))
                                        || (s.starts_with('"') && s.ends_with('"'))
                                });

                                if all_literals {
                                    let combined_str: String = combined
                                        .iter()
                                        .map(|s| {
                                            if s.len() >= 2 {
                                                &s[1..s.len() - 1]
                                            } else {
                                                s.as_str()
                                            }
                                        })
                                        .collect();
                                    statements.push(stmt(set_text_content(
                                        id(var),
                                        string(&combined_str),
                                    )));
                                } else if let Some(last) = combined.last() {
                                    statements.push(stmt(set_text_content(id(var), id(last))));
                                }
                            }
                            _ => {}
                        }
                    }

                    // Bindings
                    for (bind_name, bind_expr) in &node.bindings {
                        if bind_name == "value" {
                            bindings_stmts.push(self.build_bind_value_stmt(var, bind_expr));
                        }
                    }

                    prev_var = Some(var.clone());
                }
                NodeType::ExpressionInElement => {
                    // Handled as part of the element above
                }
                NodeType::AwaitBlock => {
                    let var = &node.var_name;

                    if let Some(ref prev) = prev_var {
                        statements.push(var_decl(var, Some(svelte_sibling(id(prev), Some(2)))));
                    } else if first_nav {
                        statements.push(var_decl(var, Some(svelte_first_child(id(root_var)))));
                        first_nav = false;
                    }

                    if let Some(ref promise_expr) = node.expression {
                        let then_val = node.content_template.as_deref();
                        statements.push(self.build_await_stmt(var, promise_expr, then_val));
                    }

                    prev_var = Some(var.clone());
                }
                NodeType::RootExpression => {
                    let var = &node.var_name;

                    if let Some(ref prev) = prev_var {
                        statements.push(var_decl(var, Some(svelte_sibling(id(prev), None))));
                    }

                    if let Some(ref expr) = node.expression {
                        let template_str = format!(" ${{{} ?? ''}}", expr);
                        template_effect_parts.push((var.clone(), template_str));
                    }

                    prev_var = Some(var.clone());
                }
                NodeType::Component(name) => {
                    if let Some(ref prev) = prev_var {
                        statements.push(var_decl(
                            &node.var_name,
                            Some(svelte_sibling(id(prev), Some(2))),
                        ));
                    }

                    let call_expr = if let Some(ref expr) = node.expression {
                        // Parse the expression as object properties
                        call(
                            id(name),
                            vec![id(&node.var_name), id(format!("{{ {} }}", expr))],
                        )
                    } else {
                        call(id(name), vec![id(&node.var_name)])
                    };
                    statements.push(stmt(call_expr));
                    prev_var = Some(node.var_name.clone());
                }
                NodeType::Anchor => {}
            }
        }

        // Add bindings after all navigation
        statements.extend(bindings_stmts);

        // Generate special attribute runtime code
        for attr in &self.special_attrs {
            match attr {
                SpecialAttribute::Autofocus { var_name } => {
                    // $.autofocus(element, true)
                    statements.push(stmt(svelte_autofocus(id(var_name), true)));
                }
                SpecialAttribute::Muted { var_name } => {
                    // element.muted = true
                    statements.push(stmt(assign(member(id(var_name), "muted"), boolean(true))));
                }
                SpecialAttribute::OptionValue { var_name, value } => {
                    // option.value = option.__value = 'value'
                    let inner_assign = assign(member(id(var_name), "__value"), string(value));
                    statements.push(stmt(assign(member(id(var_name), "value"), inner_assign)));
                }
                SpecialAttribute::CustomElementData {
                    var_name,
                    attr_name,
                    attr_value,
                } => {
                    // $.set_custom_element_data(element, 'attr', 'value')
                    statements.push(stmt(svelte_set_custom_element_data(
                        id(var_name),
                        attr_name,
                        string(attr_value),
                    )));
                }
            }
        }

        // Generate {@html} runtime code
        for (i, html_tag) in self.html_tags.iter().enumerate() {
            let var_name = if i == 0 {
                "node".to_string()
            } else {
                format!("node_{}", i)
            };
            // $.html(node, () => expression)
            statements.push(stmt(svelte_html(
                id(&var_name),
                thunk(id(&html_tag.expression)),
            )));
        }

        // Generate combined template_effect
        match template_effect_parts.len() {
            0 => {}
            1 => {
                let (var_name, template_str) = &template_effect_parts[0];
                let template_lit = template(vec![quasi(template_str, true)], vec![]);
                statements.push(stmt(svelte_template_effect(thunk(svelte_set_text(
                    id(var_name),
                    template_lit,
                )))));
            }
            _ => {
                let mut effect_body: Vec<JsStatement> = Vec::new();
                for (var_name, template_str) in &template_effect_parts {
                    let template_lit = template(vec![quasi(template_str, true)], vec![]);
                    effect_body.push(stmt(svelte_set_text(id(var_name), template_lit)));
                }
                statements.push(stmt(svelte_template_effect(arrow_block(
                    vec![],
                    effect_body,
                ))));
            }
        }

        statements
    }

    /// Convert AST statements to a formatted string.
    /// This is used to integrate AST-based generation with the existing string-based build() method.
    fn statements_to_string(&self, statements: &[JsStatement]) -> String {
        if statements.is_empty() {
            return String::new();
        }

        // Create a program with just these statements
        let prog = program(statements.to_vec());

        // Generate code
        match generate(&prog) {
            Ok(code) => {
                // Add tab indentation to each line and ensure proper formatting
                code.lines()
                    .map(|line| {
                        if line.trim().is_empty() {
                            String::new()
                        } else {
                            format!("\t{}", line)
                        }
                    })
                    .collect::<Vec<_>>()
                    .join("\n")
                    + "\n"
            }
            Err(_) => String::new(),
        }
    }

    /// Generate runtime code using AST builders and return as string.
    /// This is a drop-in replacement for generate_runtime_code.
    fn generate_runtime_code_via_ast(&self, root_var: &str) -> String {
        let statements = self.generate_runtime_code_ast(root_var);
        self.statements_to_string(&statements)
    }

    /// Generate each block code as AST statements.
    fn generate_each_block_code_ast(&self) -> Vec<JsStatement> {
        let mut statements: Vec<JsStatement> = Vec::new();

        for each in &self.each_blocks {
            // Build callback parameters
            let mut callback_params: Vec<JsPattern> = vec![id_pattern("$$anchor")];
            if let Some(ref ctx) = each.context_name {
                callback_params.push(id_pattern(ctx));
            } else {
                callback_params.push(id_pattern("$$item"));
            }
            if let Some(ref idx) = each.index_name {
                callback_params.push(id_pattern(idx));
            }

            // Build callback body
            let callback_body = if each.is_text_only {
                // Text-only body
                let expr_parts: Vec<String> = each
                    .body_expressions
                    .iter()
                    .map(|expr| {
                        if expr.starts_with('\'') || expr.starts_with('"') {
                            expr[1..expr.len() - 1].to_string()
                        } else {
                            format!("${{{} ?? ''}}", expr)
                        }
                    })
                    .collect();
                let template_str = expr_parts.join("");

                vec![
                    stmt(svelte_next(None)),
                    var_decl("text", Some(svelte_text(None))),
                    stmt(svelte_template_effect(thunk(svelte_set_text(
                        id("text"),
                        template(vec![quasi(&template_str, true)], vec![]),
                    )))),
                    stmt(svelte_append(id("$$anchor"), id("text"))),
                ]
            } else if let Some(ref template_var) = each.template_var {
                // Element-based body
                let elem_var = each.body_element.as_deref().unwrap_or("elem");
                let mut body_stmts: Vec<JsStatement> = Vec::new();

                // var elem = template_var();
                body_stmts.push(var_decl(elem_var, Some(call(id(template_var), vec![]))));

                // Dynamic attributes
                for attr in &each.dynamic_attributes {
                    body_stmts.push(stmt(svelte_set_attribute(
                        id(elem_var),
                        &attr.name,
                        id(&attr.expr),
                    )));
                }

                // Event handlers
                for handler in &each.event_handlers {
                    let prop_name = format!("__{}", handler.event);
                    body_stmts.push(stmt(assign(
                        member(id(elem_var), &prop_name),
                        id(&handler.handler),
                    )));
                }

                // Text content
                if !each.body_expressions.is_empty() {
                    if let Some(first) = each.body_expressions.first() {
                        if let Some(template_content) = first.strip_prefix("TEMPLATE:") {
                            body_stmts.push(stmt(set_text_content(
                                id(elem_var),
                                template(vec![quasi(template_content, true)], vec![]),
                            )));
                        } else {
                            let expr_parts: Vec<String> = each
                                .body_expressions
                                .iter()
                                .map(|expr| {
                                    if expr.starts_with('\'') || expr.starts_with('"') {
                                        expr[1..expr.len() - 1].to_string()
                                    } else {
                                        format!("${{{}}}", expr)
                                    }
                                })
                                .collect();
                            body_stmts.push(stmt(set_text_content(
                                id(elem_var),
                                template(vec![quasi(expr_parts.join(""), true)], vec![]),
                            )));
                        }
                    }
                }

                // $.append($$anchor, elem);
                body_stmts.push(stmt(svelte_append(id("$$anchor"), id(elem_var))));

                body_stmts
            } else {
                vec![]
            };

            // Build iterable expression
            let iterable_str = if each.iterable.trim().starts_with('{') {
                format!("({})", each.iterable)
            } else {
                each.iterable.clone()
            };

            // $.each(node, 0, () => iterable, $.index, (params) => { body });
            let each_call = svelte_each(
                id("node"),
                0,
                id(&iterable_str),
                svelte_index(),
                arrow_block(callback_params, callback_body),
            );

            statements.push(stmt(each_call));
        }

        statements
    }

    /// Generate each block code using AST builders and return as string.
    fn generate_each_block_code_via_ast(&self) -> String {
        let statements = self.generate_each_block_code_ast();
        self.statements_to_string(&statements)
    }

    /// Generate svelte:element code as AST statements.
    fn generate_svelte_element_code_ast(&self) -> Vec<JsStatement> {
        self.svelte_elements
            .iter()
            .map(|elem| stmt(svelte_element(id("node"), id(&elem.tag_expr), false)))
            .collect()
    }

    /// Generate svelte:element code using AST builders and return as string.
    fn generate_svelte_element_code_via_ast(&self) -> String {
        let statements = self.generate_svelte_element_code_ast();
        self.statements_to_string(&statements)
    }

    /// Generate snippets code as AST statements.
    fn generate_snippets_code_ast(&self) -> Vec<JsStatement> {
        self.snippets
            .iter()
            .map(|snippet| {
                let body = vec![
                    stmt(svelte_next(None)),
                    var_decl("text", Some(svelte_text(Some(string(&snippet.body_text))))),
                    stmt(svelte_append(id("$$anchor"), id("text"))),
                ];
                const_decl(
                    &snippet.name,
                    arrow_block(vec![id_pattern("$$anchor")], body),
                )
            })
            .collect()
    }

    /// Generate snippets code using AST builders and return as string.
    fn generate_snippets_code_via_ast(&self) -> String {
        let statements = self.generate_snippets_code_ast();
        if statements.is_empty() {
            return String::new();
        }
        let prog = program(statements);
        match generate(&prog) {
            Ok(code) => code + "\n",
            Err(_) => String::new(),
        }
    }

    /// Generate component binding code as AST statements.
    fn generate_component_binding_code_ast(&self) -> Vec<JsStatement> {
        self.components_with_bindings
            .iter()
            .flat_map(|comp| {
                let get_body = vec![return_value(svelte_get(id(&comp.bind_var)))];
                let set_body = vec![stmt(svelte_set_sync(id(&comp.bind_var), id("$$value")))];
                let props = object(vec![
                    getter(&comp.bind_name, get_body),
                    setter(&comp.bind_name, "$$value", set_body),
                ]);
                vec![
                    var_decl("node", Some(svelte_first_child(id("fragment")))),
                    stmt(call(id(&comp.component_name), vec![id("node"), props])),
                ]
            })
            .collect()
    }

    /// Generate component binding code using AST builders and return as string.
    fn generate_component_binding_code_via_ast(&self) -> String {
        let statements = self.generate_component_binding_code_ast();
        self.statements_to_string(&statements)
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

    // Check for nullish coalescing with constant left side
    if let Some(idx) = trimmed.find("??") {
        let left = trimmed[..idx].trim();
        // If left side is a non-null literal, use it directly
        if let Ok(n) = left.parse::<i64>() {
            return format!("'{}'", n);
        }
        if left.starts_with('"') || left.starts_with('\'') {
            // String literal - not null, use it
            return left.to_string();
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

/// Extract imports from script content.
fn extract_imports(script: &str) -> (Vec<String>, String) {
    let mut imports = Vec::new();
    let mut rest = String::new();

    for line in script.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("import ") {
            imports.push(trimmed.to_string());
        } else if !trimmed.is_empty() {
            rest.push_str(line);
            rest.push('\n');
        }
    }

    (imports, rest)
}

/// Transform runes for client-side usage.
/// Converts `$state(x)` to `$.state(x)` or `$.proxy(x)`, `$derived(x)` to `$.derived(() => x)`, etc.
/// If `skip_state_vars` contains variable names, those $state() calls will be transformed to just the value.
fn transform_client_runes_with_skip(line: &str, skip_state_vars: &[String]) -> String {
    let mut result = line.to_string();

    // Transform $state(x) to $.state(x) for primitives or $.proxy(x) for objects
    if let Some(pos) = result.find("$state(") {
        // Check if this is a declaration
        if result[..pos].contains("let ") || result[..pos].contains("const ") {
            // Extract variable name
            let before_eq = result[..pos].trim();
            let var_name = before_eq
                .split_whitespace()
                .last()
                .unwrap_or("")
                .trim_end_matches('=')
                .trim();

            // Check if we should skip this state variable
            if skip_state_vars.contains(&var_name.to_string()) {
                // Just extract the value from $state(value)
                let state_start = pos + 7; // after "$state("
                if let Some(content_end) = find_matching_paren(&result[state_start..]) {
                    let content = &result[state_start..state_start + content_end];
                    // Replace $state(value) with just value
                    result = format!(
                        "{}{}{}",
                        &result[..pos],
                        content,
                        &result[state_start + content_end + 1..]
                    );
                }
            } else {
                // Find the content inside $state(...)
                let state_start = pos + 7; // after "$state("
                if let Some(content_end) = find_matching_paren(&result[state_start..]) {
                    let content = &result[state_start..state_start + content_end];
                    let trimmed_content = content.trim();
                    // Check if it's an object literal
                    if trimmed_content.starts_with('{') || trimmed_content.starts_with('[') {
                        result = result.replacen("$state(", "$.proxy(", 1);
                    } else {
                        result = result.replacen("$state(", "$.state(", 1);
                    }
                } else {
                    result = result.replacen("$state(", "$.state(", 1);
                }
            }
        }
    }

    // Transform $derived(x) to $.derived(() => x)
    if let Some(pos) = result.find("$derived(") {
        if result[..pos].contains("let ") || result[..pos].contains("const ") {
            // Find the content inside $derived(...)
            let derived_start = pos + 9; // after "$derived("
            if let Some(content_end) = find_matching_paren(&result[derived_start..]) {
                let content = &result[derived_start..derived_start + content_end];
                // Wrap in arrow function if not already a function
                let trimmed = content.trim();
                if !trimmed.starts_with("()") && !trimmed.starts_with("function") {
                    let new_derived = format!("$.derived(() => {})", content);
                    result = format!(
                        "{}{}{}",
                        &result[..pos],
                        new_derived,
                        &result[derived_start + content_end + 1..]
                    );
                } else {
                    result = result.replacen("$derived(", "$.derived(", 1);
                }
            } else {
                result = result.replacen("$derived(", "$.derived(", 1);
            }
        }
    }

    // Transform $effect(x) to $.effect(x)
    if result.contains("$effect(") {
        result = result.replace("$effect(", "$.effect(");
    }

    // Transform $props() destructuring to $.prop() calls
    // e.g., let { tag = "hr" } = $props(); → let tag = $.prop($$props, 'tag', 3, 'hr');
    if result.contains("$props()") {
        if let Some(transformed) = transform_props_destructuring(&result) {
            return transformed;
        }
    }

    result
}

/// Transform runes for client-side usage.
/// Converts `$state(x)` to `$.state(x)` or `$.proxy(x)`, `$derived(x)` to `$.derived(() => x)`, etc.
fn transform_client_runes(line: &str) -> String {
    transform_client_runes_with_skip(line, &[])
}

/// Transform $props() usage.
/// Handles:
/// 1. Destructuring: `let { tag = "hr" } = $props()` → `let tag = $.prop($$props, 'tag', 3, 'hr')`
/// 2. Identifier: `let props = $props()` → `let props = $.rest_props($$props, ['$$slots', '$$events', '$$legacy'])`
fn transform_props_destructuring(line: &str) -> Option<String> {
    let trimmed = line.trim();

    // Check for identifier pattern: let/const props = $props()
    if (trimmed.starts_with("let ") || trimmed.starts_with("const "))
        && !trimmed.contains('{')
        && trimmed.contains("= $props()")
    {
        // Pattern: let props = $props();
        if let Some(eq_pos) = trimmed.find('=') {
            let before_eq = trimmed[..eq_pos].trim();
            if let Some(var_name) = before_eq.split_whitespace().last() {
                return Some(format!(
                    "let {} = $.rest_props($$props, ['$$slots', '$$events', '$$legacy']);",
                    var_name
                ));
            }
        }
        return None;
    }

    // Match pattern: let { prop = default } = $props();
    // or: let { prop1, prop2 = default } = $props();

    // Check for destructuring pattern (handle spaces like "let { " or "let{ ")
    let is_let_destructure = trimmed.starts_with("let {") || trimmed.starts_with("let{");
    let is_const_destructure = trimmed.starts_with("const {") || trimmed.starts_with("const{");

    if !is_let_destructure && !is_const_destructure {
        return None;
    }

    // Find the destructuring pattern
    let brace_start = trimmed.find('{')?;
    let brace_end = trimmed.find('}')?;

    if brace_end <= brace_start {
        return None;
    }

    let pattern = &trimmed[brace_start + 1..brace_end].trim();

    // Parse the destructured properties
    let mut props: Vec<(String, Option<String>)> = Vec::new();

    for part in pattern.split(',') {
        let part = part.trim();
        if part.is_empty() {
            continue;
        }

        if let Some(eq_pos) = part.find('=') {
            // Property with default value
            let name = part[..eq_pos].trim().to_string();
            let default = part[eq_pos + 1..].trim().to_string();
            props.push((name, Some(default)));
        } else {
            // Property without default
            props.push((part.to_string(), None));
        }
    }

    if props.is_empty() {
        return None;
    }

    // Generate $.prop() calls only for props with defaults
    // Read-only props (no defaults) are accessed via $$props.propName directly
    let mut declarations: Vec<String> = Vec::new();

    for (name, default) in props {
        if let Some(def) = default {
            // Convert default value quotes to single quotes for consistency
            let def_normalized = def.replace('"', "'");
            declarations.push(format!(
                "let {} = $.prop($$props, '{}', 3, {});",
                name, name, def_normalized
            ));
        }
        // Read-only props (no default) don't need $.prop() declarations
        // They will be accessed via $$props.propName in the template
    }

    // If no declarations (all props are read-only), return empty string to remove the line
    if declarations.is_empty() {
        return Some(String::new());
    }

    Some(declarations.join("\n\t"))
}

/// Find the position of the matching closing parenthesis.
fn find_matching_paren(s: &str) -> Option<usize> {
    let mut depth = 1;
    let mut in_string = false;
    let mut string_char = ' ';
    let mut in_template = false;

    for (i, c) in s.chars().enumerate() {
        if !in_string && !in_template {
            match c {
                '(' => depth += 1,
                ')' => {
                    depth -= 1;
                    if depth == 0 {
                        return Some(i);
                    }
                }
                '\'' | '"' => {
                    in_string = true;
                    string_char = c;
                }
                '`' => in_template = true,
                _ => {}
            }
        } else if in_string && c == string_char && (i == 0 || s.as_bytes()[i - 1] != b'\\') {
            in_string = false;
        } else if in_template && c == '`' && (i == 0 || s.as_bytes()[i - 1] != b'\\') {
            in_template = false;
        }
    }

    None
}

/// Collect variable names declared with $state().
fn collect_state_variables(script: &str) -> Vec<String> {
    let mut vars = Vec::new();

    for line in script.lines() {
        let trimmed = line.trim();
        // Match patterns like: let varname = $state(...) or const varname = $state(...)
        if trimmed.contains("$state(") {
            // Extract variable name between let/const and =
            if let Some(eq_pos) = trimmed.find('=') {
                let before_eq = trimmed[..eq_pos].trim();
                // Get the last word before = (the variable name)
                if let Some(var_name) = before_eq.split_whitespace().last() {
                    vars.push(var_name.to_string());
                }
            }
        }
    }

    vars
}

/// Collect constant variables (let/const without $state) with their values.
fn collect_constant_variables(script: &str) -> HashMap<String, String> {
    let mut vars = HashMap::new();

    for line in script.lines() {
        let trimmed = line.trim();

        // Skip lines with $state, $derived, $effect, $props
        if trimmed.contains("$state")
            || trimmed.contains("$derived")
            || trimmed.contains("$effect")
            || trimmed.contains("$props")
        {
            continue;
        }

        // Match patterns like: let varname = 'value' or const varname = 'value'
        if (trimmed.starts_with("let ") || trimmed.starts_with("const ")) && trimmed.contains(" = ")
        {
            if let Some(eq_pos) = trimmed.find(" = ") {
                let before_eq = trimmed[..eq_pos].trim();
                let after_eq = trimmed[eq_pos + 3..].trim().trim_end_matches(';');

                // Get the last word before = (the variable name)
                if let Some(var_name) = before_eq.split_whitespace().last() {
                    // Check if value is a string literal
                    if (after_eq.starts_with('\'') && after_eq.ends_with('\''))
                        || (after_eq.starts_with('"') && after_eq.ends_with('"'))
                    {
                        // Extract the string value without quotes
                        let value = &after_eq[1..after_eq.len() - 1];
                        vars.insert(var_name.to_string(), value.to_string());
                    }
                }
            }
        }
    }

    vars
}

/// Collect read-only destructured props from script content.
/// These are props that are destructured from $props() without defaults
/// and are not reassigned in the script.
fn collect_read_only_props(script: &str) -> Vec<String> {
    let mut props = Vec::new();

    for line in script.lines() {
        let trimmed = line.trim();

        // Match patterns like: let { prop1, prop2 } = $props();
        let is_let_destructure = trimmed.starts_with("let {") || trimmed.starts_with("let{");
        let is_const_destructure = trimmed.starts_with("const {") || trimmed.starts_with("const{");

        if !is_let_destructure && !is_const_destructure {
            continue;
        }

        if !trimmed.contains("$props()") {
            continue;
        }

        // Find the destructuring pattern
        if let (Some(brace_start), Some(brace_end)) = (trimmed.find('{'), trimmed.find('}')) {
            if brace_end > brace_start {
                let pattern = trimmed[brace_start + 1..brace_end].trim();

                // Parse the destructured properties
                for part in pattern.split(',') {
                    let part = part.trim();
                    if part.is_empty() {
                        continue;
                    }

                    // Check if has default value
                    if part.contains('=') {
                        // Has default value - not read-only, needs $.prop()
                        continue;
                    }

                    // No default - could be read-only if not reassigned
                    props.push(part.to_string());
                }
            }
        }
    }

    // Check if any of the props are reassigned in the script
    let reassigned: Vec<String> = props
        .iter()
        .filter(|prop| {
            // Check for reassignment patterns
            for line in script.lines() {
                let trimmed = line.trim();
                // Skip the original destructuring line
                if trimmed.contains("$props()") {
                    continue;
                }
                // Check for direct assignment: propName =
                if trimmed.starts_with(&format!("{} =", prop))
                    || trimmed.contains(&format!(" {} =", prop))
                {
                    return true;
                }
                // Check for compound assignment: propName +=, propName -=, etc.
                if trimmed.starts_with(&format!("{} +=", prop))
                    || trimmed.starts_with(&format!("{} -=", prop))
                    || trimmed.starts_with(&format!("{} *=", prop))
                    || trimmed.starts_with(&format!("{} /=", prop))
                {
                    return true;
                }
                // Check for increment/decrement: propName++, propName--
                if trimmed.starts_with(&format!("{}++", prop))
                    || trimmed.starts_with(&format!("{}--", prop))
                {
                    return true;
                }
            }
            false
        })
        .cloned()
        .collect();

    // Return only the props that are not reassigned
    props
        .into_iter()
        .filter(|p| !reassigned.contains(p))
        .collect()
}

/// Evaluate a content template by replacing constant variable references with their values.
/// Handles patterns like `Hello, ${null ?? ''}${name ?? ''}!` -> `Hello, world!`
fn evaluate_constant_template(template: &str, const_vars: &HashMap<String, String>) -> String {
    let mut result = template.to_string();

    // Find all ${...} expressions and try to evaluate them
    loop {
        let start = result.find("${");
        if start.is_none() {
            break;
        }
        let start = start.unwrap();

        // Find matching }
        let rest = &result[start + 2..];
        let mut depth = 1;
        let mut end_pos = 0;
        for (i, c) in rest.chars().enumerate() {
            match c {
                '{' => depth += 1,
                '}' => {
                    depth -= 1;
                    if depth == 0 {
                        end_pos = i;
                        break;
                    }
                }
                _ => {}
            }
        }

        if depth != 0 {
            break;
        }

        let expr = &rest[..end_pos];
        let full_expr = &result[start..start + 2 + end_pos + 1];

        // Evaluate the expression
        if let Some(value) = evaluate_constant_expr(expr, const_vars) {
            result = result.replace(full_expr, &value);
        } else {
            // Can't evaluate - move past this expression
            break;
        }
    }

    result
}

/// Evaluate a constant expression.
fn evaluate_constant_expr(expr: &str, const_vars: &HashMap<String, String>) -> Option<String> {
    let trimmed = expr.trim();

    // Handle null
    if trimmed == "null" {
        return Some(String::new());
    }

    // Handle nullish coalescing: var ?? fallback
    if let Some(nul_pos) = trimmed.find("??") {
        let left = trimmed[..nul_pos].trim();
        let right = trimmed[nul_pos + 2..].trim();

        // Evaluate left side
        if left == "null" {
            // Left is null, evaluate right
            return evaluate_constant_expr(right, const_vars);
        }

        // Check if left is a constant variable
        if let Some(value) = const_vars.get(left) {
            return Some(value.clone());
        }

        // Try evaluating left as expression
        if let Some(value) = evaluate_constant_expr(left, const_vars) {
            if !value.is_empty() {
                return Some(value);
            }
            // Left evaluates to empty, try right
            return evaluate_constant_expr(right, const_vars);
        }

        return None;
    }

    // Check if it's a constant variable
    if let Some(value) = const_vars.get(trimmed) {
        return Some(value.clone());
    }

    // Check for string literal
    if (trimmed.starts_with('\'') && trimmed.ends_with('\''))
        || (trimmed.starts_with('"') && trimmed.ends_with('"'))
    {
        return Some(trimmed[1..trimmed.len() - 1].to_string());
    }

    None
}

/// Transform props.X to $$props.X for static property access that is NOT an assignment.
/// Rules:
/// - props.a -> $$props.a (reading)
/// - props.a.b -> $$props.a.b (reading nested)
/// - props.a = x -> props.a = x (assignment, keep as is)
/// - props[a] -> props[a] (dynamic access, keep as is)
fn transform_props_access(line: &str, props_var: &str) -> String {
    // Pattern for static property access: props.something
    // We need to be careful not to transform:
    // - props[a] (dynamic access)
    // - props.a = x (assignment)

    // Find all occurrences of props.X where X is a valid identifier
    let dot_pattern = format!("{}.", props_var);

    let mut idx = 0;
    let mut output = String::new();
    let bytes = line.as_bytes();

    while idx < line.len() {
        if line[idx..].starts_with(&dot_pattern) {
            // Check if this is at the start of the line or after a non-identifier char
            let is_word_start = idx == 0 || !bytes[idx - 1].is_ascii_alphanumeric();

            if is_word_start {
                // Find the property access
                let after_dot = idx + dot_pattern.len();
                let prop_end = line[after_dot..]
                    .find(|c: char| !c.is_ascii_alphanumeric() && c != '_')
                    .map(|p| after_dot + p)
                    .unwrap_or(line.len());

                let prop_name = &line[after_dot..prop_end];

                // Check what comes after the property name
                let rest = &line[prop_end..];
                let is_assignment = rest.trim_start().starts_with('=')
                    && !rest.trim_start().starts_with("==")
                    && !rest.trim_start().starts_with("=>");

                // Only transform if NOT an assignment
                if !is_assignment && !prop_name.is_empty() {
                    output.push_str("$$props.");
                    output.push_str(prop_name);
                    idx = prop_end;
                    continue;
                }
            }
        }

        output.push(bytes[idx] as char);
        idx += 1;
    }

    output
}

/// Wrap state variable references in $.get() inside template expressions.
/// Transforms `${count ?? ''}` to `${$.get(count) ?? ''}`.
fn wrap_state_vars_in_get(template: &str, state_vars: &[String]) -> String {
    let mut result = template.to_string();

    for var in state_vars {
        // Pattern: ${var ?? ''} -> ${$.get(var) ?? ''}
        // Pattern: ${var} -> ${$.get(var)}
        // Need to be careful not to match partial variable names

        // Replace ${var ??  with ${$.get(var) ??
        let pattern1 = format!("${{{} ??", var);
        let replacement1 = format!("${{$.get({}) ??", var);
        result = result.replace(&pattern1, &replacement1);

        // Replace ${var} with ${$.get(var)}
        let pattern2 = format!("${{{}}}", var);
        let replacement2 = format!("${{$.get({})}}", var);
        result = result.replace(&pattern2, &replacement2);
    }

    result
}

/// Transform state variable assignments to use $.set().
/// Converts `varname = value` to `$.set(varname, value)` for state variables.
/// Transform arrow function expressions that contain state variable assignments.
/// e.g., `() => count += 1` becomes `() => $.set(count, $.get(count) + 1)`
fn transform_arrow_function_expr(expr: &str, state_vars: &[String]) -> String {
    // Check if this is an arrow function with simple body (no braces)
    if !expr.contains("=>") {
        return expr.to_string();
    }

    // Split into params and body
    if let Some(arrow_pos) = expr.find("=>") {
        let params = &expr[..arrow_pos + 2];
        let body = expr[arrow_pos + 2..].trim();

        // Check if body contains state variable assignment
        for var in state_vars {
            // Handle compound assignments: count += 1
            for (op, js_op) in &[
                (" += ", " + "),
                (" -= ", " - "),
                (" *= ", " * "),
                (" /= ", " / "),
            ] {
                let compound_pattern = format!("{}{}", var, op);
                if body.contains(&compound_pattern) {
                    if let Some(eq_pos) = body.find(&compound_pattern) {
                        let value = &body[eq_pos + compound_pattern.len()..];
                        return format!(
                            "{} $.set({}, $.get({}){}{})",
                            params,
                            var,
                            var,
                            js_op,
                            value.trim()
                        );
                    }
                }
            }

            // Handle simple assignment: count = expr
            let assignment_pattern = format!("{} = ", var);
            if body.contains(&assignment_pattern) {
                if let Some(eq_pos) = body.find(&assignment_pattern) {
                    let value = &body[eq_pos + assignment_pattern.len()..];
                    // Transform state vars in the value part
                    let transformed_value = transform_state_in_expr(value.trim(), state_vars);
                    return format!("{} $.set({}, {}, true)", params, var, transformed_value);
                }
            }
        }
    }

    expr.to_string()
}

/// Transform state variable accesses in an expression.
/// e.g., `plusOne(count)` becomes `plusOne($.get(count))`
/// Also handles simple variable access: `count` becomes `$.get(count)`
fn transform_state_in_expr(expr: &str, state_vars: &[String]) -> String {
    let mut result = expr.to_string();
    for var in state_vars {
        // Simple case: expression is exactly the variable name
        if expr.trim() == var {
            return format!("$.get({})", var);
        }

        // Check if the variable appears as a function argument: funcName(var)
        let in_parens = format!("({})", var);
        if result.contains(&in_parens) {
            result = result.replace(&in_parens, &format!("($.get({}))", var));
        }
    }
    result
}

fn transform_state_assignments(line: &str, state_vars: &[String]) -> String {
    let mut result = line.to_string();

    for var in state_vars {
        // Transform varname++ to $.update(varname)
        let inc_pattern = format!("{}++", var);
        if result.contains(&inc_pattern) {
            result = result.replace(&inc_pattern, &format!("$.update({})", var));
        }

        // Transform varname-- to $.update(varname, -1)
        let dec_pattern = format!("{}--", var);
        if result.contains(&dec_pattern) {
            result = result.replace(&dec_pattern, &format!("$.update({}, -1)", var));
        }

        // Transform compound assignments: varname += value to $.set(varname, $.get(varname) + value)
        for (op, js_op) in &[
            (" += ", " + "),
            (" -= ", " - "),
            (" *= ", " * "),
            (" /= ", " / "),
        ] {
            let compound_pattern = format!("{}{}", var, op);
            if result.contains(&compound_pattern) {
                // Check if this is not a declaration or property access
                let before_var = if let Some(pos) = result.find(&compound_pattern) {
                    result[..pos].trim()
                } else {
                    ""
                };

                if before_var.ends_with("let")
                    || before_var.ends_with("const")
                    || before_var.ends_with("var")
                    || before_var.ends_with('.')
                {
                    continue;
                }

                if let Some(eq_pos) = result.find(&compound_pattern) {
                    let before = &result[..eq_pos];
                    let after = &result[eq_pos + compound_pattern.len()..];

                    let (value, suffix) = match after.strip_suffix(';') {
                        Some(stripped) => (stripped, ";"),
                        None => (after, ""),
                    };

                    result = format!(
                        "{}$.set({}, $.get({}){}{}){}",
                        before,
                        var,
                        var,
                        js_op,
                        value.trim(),
                        suffix
                    );
                }
            }
        }

        // Pattern: varname = value (standalone assignment, not in a declaration)
        // We need to match "varname = " but not "let varname = " or "const varname = "
        let assignment_pattern = format!("{} = ", var);

        if result.contains(&assignment_pattern) {
            // Check if this is not a declaration
            let before_var = if let Some(pos) = result.find(&assignment_pattern) {
                result[..pos].trim()
            } else {
                ""
            };

            // Skip if it's a declaration
            if before_var.ends_with("let")
                || before_var.ends_with("const")
                || before_var.ends_with("var")
            {
                continue;
            }

            // Skip if it's a property access (e.g., obj.varname = )
            if before_var.ends_with('.') {
                continue;
            }

            // Find the value part after " = "
            if let Some(eq_pos) = result.find(&assignment_pattern) {
                let before = &result[..eq_pos];
                let after = &result[eq_pos + assignment_pattern.len()..];

                // Handle semicolon at end
                let (value, suffix) = match after.strip_suffix(';') {
                    Some(stripped) => (stripped, ";"),
                    None => (after, ""),
                };

                result = format!("{}$.set({}, {}){}", before, var, value.trim(), suffix);
            }
        }
    }

    result
}

/// Represents a class field with $state or $derived rune.
#[derive(Debug, Clone)]
struct ClassStateField {
    /// Field name (without # prefix)
    name: String,
    /// Whether this is a private field (starts with #)
    is_private: bool,
    /// The rune type: "$state" or "$derived"
    rune_type: String,
    /// The initial value/expression
    value: String,
}

/// Transform class fields with $state and $derived runes for client-side.
/// Converts:
/// - `a = $state(0)` -> `#a = $.state(0)` + getter/setter
/// - `#b = $state()` -> `#b = $.state()` (private field, no getter/setter)
/// - `foo = $derived({...})` -> `#foo = $.derived(() => ({...}))` + getter/setter
fn transform_class_fields_client(script: &str) -> String {
    // Check if script contains a class with $state or $derived fields
    if !script.contains("class ") || (!script.contains("$state") && !script.contains("$derived")) {
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

    // Parse class fields with $state and $derived
    let mut fields: Vec<ClassStateField> = Vec::new();
    let mut constructor_content = String::new();
    let mut constructor_start = None;

    // Find constructor first
    if let Some(ctor_pos) = class_body.find("constructor(") {
        // Find the opening brace
        let after_ctor = &class_body[ctor_pos..];
        if let Some(brace_pos) = after_ctor.find('{') {
            let ctor_body_start = ctor_pos + brace_pos + 1;
            let mut depth = 1;
            let mut ctor_body_end = ctor_body_start;

            for (i, c) in class_body[ctor_body_start..].char_indices() {
                match c {
                    '{' => depth += 1,
                    '}' => {
                        depth -= 1;
                        if depth == 0 {
                            ctor_body_end = ctor_body_start + i;
                            break;
                        }
                    }
                    _ => {}
                }
            }

            constructor_start = Some(ctor_pos);
            constructor_content = class_body[ctor_body_start..ctor_body_end].to_string();
        }
    }

    // Parse field definitions (before constructor)
    let fields_section = if let Some(ctor_start) = constructor_start {
        &class_body[..ctor_start]
    } else {
        class_body
    };

    // Parse each line for field definitions
    for line in fields_section.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }

        // Check for $state field: name = $state(...) or #name = $state(...)
        if trimmed.contains("= $state(") || trimmed.contains("=$state(") {
            if let Some(field) = parse_state_field(trimmed, "$state") {
                fields.push(field);
            }
        }
        // Check for $derived field: name = $derived(...) or #name = $derived(...)
        else if trimmed.contains("= $derived(") || trimmed.contains("=$derived(") {
            if let Some(field) = parse_state_field(trimmed, "$derived") {
                fields.push(field);
            }
        }
    }

    if fields.is_empty() {
        return script.to_string();
    }

    // Build transformed class body
    let mut new_class_body = String::new();

    for field in &fields {
        // All fields become private with # prefix
        let private_name = format!("#{}", field.name);

        if field.rune_type == "$state" {
            // Transform $state: #name = $.state(value)
            new_class_body.push_str(&format!(
                "\t\t{} = $.state({});\n",
                private_name, field.value
            ));

            // Add getter/setter only for public fields
            if !field.is_private {
                new_class_body.push('\n');
                new_class_body.push_str(&format!(
                    "\t\tget {}() {{\n\t\t\treturn $.get(this.{});\n\t\t}}\n",
                    field.name, private_name
                ));
                new_class_body.push('\n');
                new_class_body.push_str(&format!(
                    "\t\tset {}(value) {{\n\t\t\t$.set(this.{}, value, true);\n\t\t}}\n",
                    field.name, private_name
                ));
            }
        } else if field.rune_type == "$derived" {
            // Transform $derived: #name = $.derived(() => (value))
            // Need to wrap the value in an arrow function
            let wrapped_value = format!("() => ({})", field.value);
            new_class_body.push_str(&format!(
                "\t\t{} = $.derived({});\n",
                private_name, wrapped_value
            ));

            // Add getter/setter only for public fields
            if !field.is_private {
                new_class_body.push('\n');
                new_class_body.push_str(&format!(
                    "\t\tget {}() {{\n\t\t\treturn $.get(this.{});\n\t\t}}\n",
                    field.name, private_name
                ));
                new_class_body.push('\n');
                new_class_body.push_str(&format!(
                    "\t\tset {}(value) {{\n\t\t\t$.set(this.{}, value);\n\t\t}}\n",
                    field.name, private_name
                ));
            }
        }
    }

    // Add constructor with transformed assignments
    if constructor_start.is_some() {
        new_class_body.push('\n');
        new_class_body.push_str("\t\tconstructor() {\n");

        // Transform constructor content
        for line in constructor_content.lines() {
            let trimmed = line.trim();
            if trimmed.is_empty() {
                continue;
            }

            // Check for private field assignment: this.#name = value
            // Need to transform to $.set(this.#name, value)
            let transformed_line = transform_constructor_assignment(trimmed, &fields);
            new_class_body.push_str(&format!("\t\t\t{}\n", transformed_line));
        }

        new_class_body.push_str("\t\t}\n");
    }

    // Build the final result
    let before_class = &script[..class_pos];
    let after_class_body = &script[class_body_end + 1..]; // Skip closing brace

    format!(
        "{}{}\n{}\t}}{}",
        before_class, class_header, new_class_body, after_class_body
    )
}

/// Parse a state field definition.
fn parse_state_field(line: &str, rune_type: &str) -> Option<ClassStateField> {
    let trimmed = line.trim().trim_end_matches(';');

    // Check if starts with # (private field)
    let is_private = trimmed.starts_with('#');

    // Find the field name
    let name_end = trimmed.find('=').or_else(|| trimmed.find(" ="))?;
    let name = trimmed[..name_end]
        .trim()
        .trim_start_matches('#')
        .to_string();

    // Find the rune call
    let rune_pattern = format!("{}(", rune_type);
    let rune_start = trimmed.find(&rune_pattern)?;
    let value_start = rune_start + rune_pattern.len();

    // Find matching closing paren
    let after_paren = &trimmed[value_start..];
    let value_end = find_matching_paren(after_paren)?;
    let value = after_paren[..value_end].to_string();

    Some(ClassStateField {
        name,
        is_private,
        rune_type: rune_type.to_string(),
        value,
    })
}

/// Transform constructor assignments for private state fields.
/// `this.#b = 2` -> `$.set(this.#b, 2)`
fn transform_constructor_assignment(line: &str, fields: &[ClassStateField]) -> String {
    let trimmed = line.trim();

    // Check for private field assignment: this.#name = value
    if trimmed.starts_with("this.#") && trimmed.contains('=') {
        // Find which private field this is
        for field in fields {
            if field.is_private {
                let pattern = format!("this.#{} =", field.name);
                let pattern_nospace = format!("this.#{}=", field.name);

                if trimmed.starts_with(&pattern) || trimmed.starts_with(&pattern_nospace) {
                    // Extract the value after =
                    let eq_pos = trimmed.find('=').unwrap();
                    let value = trimmed[eq_pos + 1..].trim().trim_end_matches(';');
                    return format!("$.set(this.#{}, {});", field.name, value);
                }
            }
        }
    }

    trimmed.to_string()
}

/// Transform read-only prop references in an expression.
/// Converts `propName` to `$$props.propName` when the prop is read-only.
fn transform_read_only_props(expr: &str, read_only_props: &[String]) -> String {
    if read_only_props.is_empty() {
        return expr.to_string();
    }

    let mut result = expr.to_string();

    for prop in read_only_props {
        // Simple case: exact match (expression is just the prop name)
        if result == *prop {
            return format!("$$props.{}", prop);
        }

        // More complex case: prop is used within an expression
        // We need to be careful not to replace substrings (e.g., "title" in "subtitle")
        // Use word boundary matching
        let patterns = vec![
            // At start of expression followed by non-identifier char
            format!("^{}(?![a-zA-Z0-9_])", regex_escape(prop)),
            // After non-identifier char
            format!("(?<![a-zA-Z0-9_]){}(?![a-zA-Z0-9_])", regex_escape(prop)),
        ];

        for pattern in patterns {
            if let Ok(re) = regex::Regex::new(&pattern) {
                result = re
                    .replace_all(&result, format!("$$props.{}", prop))
                    .to_string();
            }
        }
    }

    result
}

/// Escape special regex characters in a string.
fn regex_escape(s: &str) -> String {
    let special_chars = [
        '\\', '.', '+', '*', '?', '(', ')', '[', ']', '{', '}', '^', '$', '|',
    ];
    let mut result = String::new();
    for c in s.chars() {
        if special_chars.contains(&c) {
            result.push('\\');
        }
        result.push(c);
    }
    result
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
