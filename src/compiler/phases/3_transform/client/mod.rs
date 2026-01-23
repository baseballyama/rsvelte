//! Client-side code generation.
//!
//! Generates JavaScript code for browser execution.

mod state;
pub mod transform_client;
pub mod transform_template;
pub mod types;
pub mod utils;
mod visitor;
pub mod visitors;

use state::{
    AwaitBlockInfo, BindThisComponent, ChildPart, ComponentWithBinding, ComponentWithChildren,
    DynamicAttribute, EachBlockInfo, EventHandler, HtmlTagInfo, IfBlockInfo, IfBlockPart, NodeInfo,
    NodeType, SnippetInfo, SpecialAttribute, SvelteElementInfo,
};

use super::TransformError;
use super::js_ast::{
    builders::{
        array, arrow, arrow_block, assign, boolean, call, const_decl, export_default_function,
        getter, id, id_pattern, if_stmt, import_namespace, import_side_effect, member, member_path,
        nullish, object, optional_call, program, prop, quasi, raw, return_value, set_text_content,
        setter, stmt, string, svelte_action, svelte_append, svelte_autofocus, svelte_await,
        svelte_bind_value, svelte_child, svelte_comment, svelte_each, svelte_element,
        svelte_first_child, svelte_from_html, svelte_get, svelte_html, svelte_index, svelte_next,
        svelte_remove_input_defaults, svelte_reset, svelte_set, svelte_set_attribute,
        svelte_set_class, svelte_set_custom_element_data, svelte_set_style, svelte_set_sync,
        svelte_set_text, svelte_sibling, svelte_template_effect,
        svelte_template_effect_with_values, svelte_text, template, thunk, var_decl,
    },
    generate,
    nodes::{
        JsBlockStatement, JsExpr, JsObjectMember, JsPattern, JsStatement, JsTemplateElement,
        JsTemplateLiteral,
    },
    normalize_js,
};
use super::shared::{escape_attr, escape_html, is_void_element};
use crate::ast::template::{
    Attribute, AttributeNode, AttributeValue, AttributeValuePart, AwaitBlock, ClassDirective,
    Component, EachBlock, ExpressionTag, Fragment, HtmlTag, IfBlock, KeyBlock, RegularElement,
    RenderTag, Root, SnippetBlock, StyleDirective, SvelteDynamicElement, TemplateNode, Text,
    UseDirective,
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

    // Extract module script content (for <script module> blocks)
    let module_script_content = analysis
        .module_script_content
        .as_ref()
        .map(|c| c.raw.clone());

    // Get CSS hash for scoping (if CSS exists)
    let css_hash = if analysis.css.has_css && !analysis.css.hash.is_empty() {
        Some(analysis.css.hash.clone())
    } else {
        None
    };

    // Extract analysis flags for code generation decisions
    let analysis_flags = AnalysisFlags {
        needs_context: analysis.needs_context,
        needs_props: analysis.needs_props,
        uses_props: analysis.uses_props,
        uses_rest_props: analysis.uses_rest_props,
        uses_slots: analysis.uses_slots,
        has_slot_names: !analysis.slot_names.is_empty(),
        has_reactive_statements: !analysis.reactive_statements.is_empty(),
        exports_count: analysis.exports.len(),
    };

    let mut generator = ClientCodeGenerator::new(
        component_name.clone(),
        analysis.source.clone(),
        script_content,
        uses_runes,
        css_hash,
        analysis_flags,
        module_script_content,
    );

    // Use the AST fragment directly (no re-parsing needed)
    generator.generate_component(&ast.fragment)?;

    // Detect if we need hierarchical navigation (for skip-static-subtree type components)
    // This is needed when dynamic content is nested inside containers
    let needs_hierarchical = has_nested_dynamic_content(&ast.fragment);

    if needs_hierarchical {
        // Reset counters for fresh code generation
        generator.reset_var_counters();
        Ok(generator.build_with_fragment(&ast.fragment))
    } else {
        Ok(generator.build())
    }
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
    /// Only contains primitive $state variables that need $.get() wrapping
    state_vars: Vec<String>,
    /// Proxy state variable names (object/array $state that become $.proxy())
    /// These don't need $.get() but their property access is still reactive
    proxy_state_vars: Vec<String>,
    /// Derived variable names (declared with $derived())
    /// These need $.get() wrapping when accessed
    #[allow(dead_code)]
    derived_vars: Vec<String>,
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
    /// If blocks for runtime code generation
    if_blocks: Vec<IfBlockInfo>,
    /// Counter for if block template variable names
    if_block_counter: usize,
    /// Whether template contains custom elements (elements with hyphens) or video elements
    has_custom_elements: bool,
    /// Read-only destructured props (accessed via $$props.propName, not $.prop())
    read_only_props: Vec<String>,
    /// Special attributes that need runtime handling (autofocus, muted, option value, custom element attrs)
    special_attrs: Vec<SpecialAttribute>,
    /// Current element name being processed (for tracking custom elements)
    current_element_name: Option<String>,
    /// Whether current element is a custom element (has hyphen or `is` attribute)
    current_element_is_custom: bool,
    /// CSS hash for scoping (e.g., "svelte-abc123")
    css_hash: Option<String>,
    // === Cursor-based navigation state ===
    /// Navigation statements collected during traversal
    #[allow(dead_code)]
    nav_stmts: Vec<JsStatement>,
    /// Template effect expressions: (text_var, expression)
    template_effects: Vec<(String, String)>,
    /// Binding statements to be added at the end (after navigation and event handlers)
    binding_statements: Vec<JsStatement>,
    /// Elements that need $.reset() after processing children
    #[allow(dead_code)]
    elements_needing_reset: Vec<String>,
    /// Text content before root-level expressions (for template_effect generation)
    root_text_before_expression: String,
    // === Analysis flags from Phase 2 ===
    /// Whether the component needs context ($.push/$.pop)
    analysis_needs_context: bool,
    /// Whether the component needs props
    analysis_needs_props: bool,
    /// Whether the component uses $$props
    analysis_uses_props: bool,
    /// Whether the component uses $$restProps
    analysis_uses_rest_props: bool,
    /// Whether the component uses $$slots
    analysis_uses_slots: bool,
    /// Whether the component has slot_names
    analysis_has_slot_names: bool,
    /// Whether the component has reactive_statements
    analysis_has_reactive_statements: bool,
    /// Number of exports (for component_returned_object)
    analysis_exports_count: usize,
    /// Module script content (from <script module> blocks)
    /// This is emitted at the module level, before the component function
    module_script_content: Option<String>,
}

/// Analysis flags from Phase 2 for code generation decisions
#[derive(Debug, Clone, Default)]
struct AnalysisFlags {
    needs_context: bool,
    needs_props: bool,
    uses_props: bool,
    uses_rest_props: bool,
    uses_slots: bool,
    has_slot_names: bool,
    has_reactive_statements: bool,
    exports_count: usize,
}

impl ClientCodeGenerator {
    fn new(
        component_name: String,
        source: String,
        script_content: String,
        uses_runes: bool,
        css_hash: Option<String>,
        analysis_flags: AnalysisFlags,
        module_script_content: Option<String>,
    ) -> Self {
        // Collect state variables from script content (primitive types only)
        let state_vars = collect_state_variables(&script_content);
        // Collect proxy state variables (object/array types)
        let proxy_state_vars = collect_proxy_state_variables(&script_content);
        // Collect derived variables
        let derived_vars = collect_derived_variables(&script_content);
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
            proxy_state_vars,
            derived_vars,
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
            if_blocks: Vec::new(),
            if_block_counter: 0,
            has_custom_elements: false,
            read_only_props,
            special_attrs: Vec::new(),
            current_element_name: None,
            current_element_is_custom: false,
            css_hash,
            nav_stmts: Vec::new(),
            template_effects: Vec::new(),
            binding_statements: Vec::new(),
            elements_needing_reset: Vec::new(),
            root_text_before_expression: String::new(),
            analysis_needs_context: analysis_flags.needs_context,
            analysis_needs_props: analysis_flags.needs_props,
            analysis_uses_props: analysis_flags.uses_props,
            analysis_uses_rest_props: analysis_flags.uses_rest_props,
            analysis_uses_slots: analysis_flags.uses_slots,
            analysis_has_slot_names: analysis_flags.has_slot_names,
            analysis_has_reactive_statements: analysis_flags.has_reactive_statements,
            analysis_exports_count: analysis_flags.exports_count,
            module_script_content,
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
            if let TemplateNode::Text(text) = nodes[start_idx]
                && text.data.trim().is_empty()
            {
                start_idx += 1;
                continue;
            }
            break;
        }

        // Capture text content before root-level expressions for template_effect generation
        // Look for pattern: Component/Element + Text + ExpressionTag
        for i in start_idx..nodes.len() {
            if let TemplateNode::Text(text) = nodes[i] {
                // Check if next node is an expression tag
                if i + 1 < nodes.len() && matches!(nodes[i + 1], TemplateNode::ExpressionTag(_)) {
                    // Found text before expression - normalize whitespace
                    // Convert newlines to spaces and collapse multiple whitespace
                    let normalized = text
                        .data
                        .chars()
                        .map(|c| if c.is_whitespace() { ' ' } else { c })
                        .collect::<String>();

                    // Collapse multiple spaces to single space
                    let mut result = String::new();
                    let mut prev_was_space = false;
                    for c in normalized.chars() {
                        if c == ' ' {
                            if !prev_was_space {
                                result.push(' ');
                                prev_was_space = true;
                            }
                        } else {
                            result.push(c);
                            prev_was_space = false;
                        }
                    }

                    self.root_text_before_expression = result.trim_end().to_string();
                    break;
                }
            }
        }

        // Generate from first non-whitespace node
        for (i, node) in nodes.iter().enumerate().skip(start_idx) {
            // Add space separator between root elements (but not before first)
            if i > start_idx
                && let TemplateNode::Text(text) = node
                && text.data.trim().is_empty()
            {
                // Whitespace between elements - normalize to single space
                self.html_parts.push(" ".to_string());
                continue;
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

    fn generate_text(&mut self, text: &Text, _is_root_level: bool) -> Result<(), TransformError> {
        let data = &text.data;

        if data.trim().is_empty() {
            // Whitespace-only text - always include as single space if not empty
            // This preserves spacing between sibling elements
            if !data.is_empty() {
                self.html_parts.push(" ".to_string());
            }
        } else {
            // Text has non-whitespace content
            // Normalize whitespace: collapse leading/trailing whitespace to nothing,
            // and normalize internal whitespace to single spaces
            // This matches the official Svelte compiler's behavior
            let normalized = normalize_text_whitespace(data);
            self.html_parts.push(escape_html(&normalized));
        }
        Ok(())
    }

    fn generate_element(&mut self, element: &RegularElement) -> Result<(), TransformError> {
        let name = element.name.as_str();

        // Check for custom elements (elements with hyphens OR with `is` attribute) or video elements
        // These require TEMPLATE_USE_IMPORT_NODE flag
        let is_custom_element = name.contains('-')
            || element
                .attributes
                .iter()
                .any(|attr| matches!(attr, Attribute::Attribute(a) if a.name == "is"));
        if is_custom_element || name == "video" {
            self.has_custom_elements = true;
        }

        // Create variable name for this element
        let var_name = self.next_var_name(name);

        // Track current element for attribute processing
        self.current_element_name = Some(name.to_string());
        self.current_element_is_custom = is_custom_element;
        let child_index = self.current_child_index;

        // Check if this is an input element
        let is_input = name == "input" || name == "textarea" || name == "select";

        // Extract event handlers, bindings, and check for spread attributes
        let mut event_handlers = Vec::new();
        let mut bindings = Vec::new();
        let mut spread_props = Vec::new();
        let mut attribute_values: Vec<(String, String)> = Vec::new();
        let mut has_spread = false;

        for attr in &element.attributes {
            match attr {
                Attribute::Attribute(node) => {
                    let attr_name = node.name.as_str();
                    // Check for event handlers (onclick, onmousedown, etc.)
                    if let Some(event_name) = attr_name.strip_prefix("on")
                        && let AttributeValue::Expression(expr_tag) = &node.value
                    {
                        let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                        let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                        if expr_end > expr_start && expr_end <= self.source.len() {
                            let expr_source = self.source[expr_start..expr_end].trim().to_string();
                            event_handlers.push((event_name.to_string(), expr_source.clone()));
                            // Also add to attribute_values for spread handling
                            attribute_values.push((attr_name.to_string(), expr_source));
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
                Attribute::SpreadAttribute(spread) => {
                    has_spread = true;
                    let expr = &spread.expression;
                    let expr_start = expr.start().unwrap_or(0) as usize;
                    let expr_end = expr.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let expr_source = self.source[expr_start..expr_end].trim().to_string();
                        spread_props.push(expr_source);
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
            is_custom_element,
            content_template: None,
            has_spread,
            spread_props,
            attribute_values,
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

        // Check if element has class: directive (dynamic class)
        let has_class_directive = element
            .attributes
            .iter()
            .any(|attr| matches!(attr, Attribute::ClassDirective(_)));

        // Add CSS scoping class if present, but skip if element has class: directive
        // (class: directive elements get the class at runtime via $.set_class)
        if let Some(ref hash) = self.css_hash
            && !has_class_directive
        {
            self.html_parts.push(format!(" class=\"{}\"", hash));
        }

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
                            // Check if expression contains any state variable (primitive or proxy)
                            return self.state_vars.iter().any(|sv| expr.contains(sv))
                                || self.proxy_state_vars.iter().any(|sv| expr.contains(sv));
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
                                    // Transform state variable references in the expression
                                    let transformed =
                                        transform_state_in_expr(expr, &self.state_vars);
                                    content_parts.push(format!("${{{} ?? ''}}", transformed));
                                }
                            }
                            _ => {}
                        }
                        self.current_child_index += 1;
                    }

                    // Update the element's NodeInfo with the content template
                    if !content_parts.is_empty()
                        && let Some(last_node) = self.nodes.last_mut()
                        && matches!(last_node.node_type, NodeType::Element(_))
                    {
                        let combined = content_parts.join("");
                        let trimmed = combined.trim().to_string();
                        if !trimmed.is_empty() {
                            last_node.content_template = Some(trimmed);
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
                                if let Some(func_name) = expr.strip_suffix("()")
                                    && func_name.chars().all(|c| c.is_alphanumeric() || c == '_')
                                {
                                    func_names.push(func_name.to_string());
                                }
                            }
                        }
                    }

                    if func_names.len() >= 2 {
                        // Multiple function call expressions - add space placeholder
                        self.html_parts.push(" ".to_string());

                        // Store function names for template_effect generation
                        // The element needs $.child(), $.reset(), and special template_effect
                        if let Some(last_node) = self.nodes.last_mut()
                            && matches!(last_node.node_type, NodeType::Element(_))
                        {
                            // Build template with $N placeholders
                            let template_parts: Vec<String> = func_names
                                .iter()
                                .enumerate()
                                .map(|(i, _)| format!("${{${} ?? ''}}", i))
                                .collect();
                            // Store as special content_template with function array marker
                            // Format: "FUNC_ARRAY:fn1,fn2:template"
                            let template = template_parts.join("");
                            last_node.content_template =
                                Some(format!("FUNC_ARRAY:{}:{}", func_names.join(","), template));
                        }
                    } else {
                        // Single or non-function expressions - check if any are reactive
                        let mut has_reactive_expression = false;
                        for child in &element.fragment.nodes {
                            if let TemplateNode::ExpressionTag(tag) = child {
                                let expr_start = tag.start as usize;
                                let expr_end = tag.end as usize;
                                if expr_start + 1 < expr_end && expr_end <= self.source.len() {
                                    let expr = self.source[expr_start + 1..expr_end - 1].trim();
                                    if self.is_expression_reactive(expr) {
                                        has_reactive_expression = true;
                                        break;
                                    }
                                }
                            }
                        }
                        // Only add space placeholder if expression is reactive
                        // Reactive expressions need a text node to update via $.set_text()
                        if has_reactive_expression {
                            self.html_parts.push(" ".to_string());
                        }
                        // Track the expressions
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
                // Skip leading/trailing whitespace-only text nodes and comments
                let children: Vec<_> = element.fragment.nodes.iter().collect();

                // Helper to check if a node is "real content" (not whitespace text, not comment)
                let is_real_content = |c: &TemplateNode| {
                    !matches!(c, TemplateNode::Comment(_))
                        && !matches!(c, TemplateNode::Text(t) if t.data.trim().is_empty())
                };

                // Find first and last real content children (ignoring comments and whitespace)
                let first_content = children.iter().position(|c| is_real_content(c));
                let last_content = children.iter().rposition(|c| is_real_content(c));

                // If there's no real content (only whitespace/comments), skip all children
                // This handles the case of empty elements like <div>\n</div>
                if first_content.is_none() {
                    // No real content - don't add any children
                    // (element will be rendered as <div></div>)
                } else {
                    for (i, child) in children.iter().enumerate() {
                        // Skip comments entirely (they don't appear in HTML output)
                        if matches!(child, TemplateNode::Comment(_)) {
                            self.current_child_index += 1;
                            continue;
                        }
                        // Skip leading whitespace
                        if let Some(first) = first_content
                            && i < first
                        {
                            self.current_child_index += 1;
                            continue;
                        }
                        // Skip trailing whitespace
                        if let Some(last) = last_content
                            && i > last
                        {
                            self.current_child_index += 1;
                            continue;
                        }
                        // Skip whitespace-only text between comment and real content
                        if let TemplateNode::Text(t) = child
                            && t.data.trim().is_empty()
                        {
                            // Check if there's only one real content child
                            let real_content_count =
                                children.iter().filter(|c| is_real_content(c)).count();
                            if real_content_count == 1 {
                                self.current_child_index += 1;
                                continue;
                            }
                        }
                        self.generate_node(child, false)?;
                        self.current_child_index += 1;
                    }
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

    /// Reset variable name counters for fresh code generation.
    /// Called before build_with_fragment to start variable naming from scratch.
    fn reset_var_counters(&mut self) {
        self.var_name_counters.clear();
        self.node_var_index = 0;
        self.template_effects.clear();
    }

    /// Collect children parts from a list of template nodes, handling nested components.
    fn collect_children_parts(&self, nodes: &[TemplateNode]) -> Vec<ChildPart> {
        let mut parts = Vec::new();

        for node in nodes {
            match node {
                TemplateNode::Text(text) => {
                    let data = text.data.as_str();
                    // Skip whitespace-only text nodes between components
                    if !data.trim().is_empty() {
                        parts.push(ChildPart::Text(data.to_string()));
                    }
                }
                TemplateNode::ExpressionTag(tag) => {
                    let expr_start = tag.start as usize;
                    let expr_end = tag.end as usize;
                    if expr_start + 1 < expr_end && expr_end <= self.source.len() {
                        let expr = self.source[expr_start + 1..expr_end - 1].trim().to_string();
                        parts.push(ChildPart::Expression(expr));
                    }
                }
                TemplateNode::Component(comp) => {
                    // Extract component name
                    let comp_name = comp.name.to_string();

                    // Extract props
                    let mut props = Vec::new();
                    for attr in &comp.attributes {
                        match attr {
                            Attribute::Attribute(node) => {
                                let name = node.name.as_str();
                                if let AttributeValue::Expression(expr_tag) = &node.value {
                                    let expr_start =
                                        expr_tag.expression.start().unwrap_or(0) as usize;
                                    let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                                    if expr_end > expr_start && expr_end <= self.source.len() {
                                        let expr_source =
                                            self.source[expr_start..expr_end].trim().to_string();
                                        if expr_source == name {
                                            props.push(name.to_string());
                                        } else {
                                            let transformed_expr = transform_arrow_function_expr(
                                                &expr_source,
                                                &self.state_vars,
                                            );
                                            props.push(format!("{}: {}", name, transformed_expr));
                                        }
                                    }
                                }
                            }
                            Attribute::OnDirective(on_dir) => {
                                // Handle on:click etc.
                                let event_name = on_dir.name.as_str();
                                if let Some(expr) = &on_dir.expression {
                                    let expr_start = expr.start().unwrap_or(0) as usize;
                                    let expr_end = expr.end().unwrap_or(0) as usize;
                                    if expr_end > expr_start && expr_end <= self.source.len() {
                                        let expr_source =
                                            self.source[expr_start..expr_end].trim().to_string();
                                        // on:event becomes $$events.event
                                        props.push(format!(
                                            "$$events: {{ {}: {} }}",
                                            event_name, expr_source
                                        ));
                                    }
                                }
                            }
                            _ => {}
                        }
                    }

                    // Recursively collect children
                    let nested_children = self.collect_children_parts(&comp.fragment.nodes);

                    parts.push(ChildPart::Component(
                        comp_name,
                        props.join(", "),
                        nested_children,
                    ));
                }
                _ => {
                    // Other node types (if blocks, each blocks, etc.) - skip for now
                    // TODO: Add support for other block types
                }
            }
        }

        parts
    }

    /// Check if an expression is reactive (contains props/state variables).
    /// Reactive expressions need $.template_effect for updates.
    /// Pure expressions can use direct textContent assignment.
    fn is_expression_reactive(&self, expr: &str) -> bool {
        // Check if expression contains any read-only prop
        for prop in &self.read_only_props {
            // Check for the prop as a word boundary (not part of another identifier)
            if expr.contains(prop.as_str()) {
                // More precise check: ensure it's a standalone identifier
                let pattern = format!(r"\b{}\b", regex::escape(prop));
                if regex::Regex::new(&pattern)
                    .map(|re| re.is_match(expr))
                    .unwrap_or(false)
                {
                    return true;
                }
            }
        }
        // Check if expression contains any state variable (primitive types)
        for var in &self.state_vars {
            if expr.contains(var.as_str()) {
                let pattern = format!(r"\b{}\b", regex::escape(var));
                if regex::Regex::new(&pattern)
                    .map(|re| re.is_match(expr))
                    .unwrap_or(false)
                {
                    return true;
                }
            }
        }
        // Check if expression contains any proxy state variable (object/array types)
        // Property access on proxy objects is still reactive (e.g., counter.count)
        for var in &self.proxy_state_vars {
            if expr.contains(var.as_str()) {
                let pattern = format!(r"\b{}\b", regex::escape(var));
                if regex::Regex::new(&pattern)
                    .map(|re| re.is_match(expr))
                    .unwrap_or(false)
                {
                    return true;
                }
            }
        }
        false
    }

    // =========================================================================
    // Cursor-based navigation helpers
    // =========================================================================

    /// Check if a node needs runtime handling (is "dynamic").
    /// A node is dynamic if we need to generate runtime code for it.
    fn is_node_dynamic(&self, node: &TemplateNode) -> bool {
        match node {
            // Text nodes are always static - they are just content in the template
            TemplateNode::Text(_) => false,
            // Expression tags need $.set_text at runtime
            TemplateNode::ExpressionTag(_) => true,
            // HTML tags need $.html() at runtime
            TemplateNode::HtmlTag(_) => true,
            TemplateNode::RenderTag(_) => true,
            // Control flow blocks are dynamic
            TemplateNode::IfBlock(_) => true,
            TemplateNode::EachBlock(_) => true,
            TemplateNode::AwaitBlock(_) => true,
            TemplateNode::KeyBlock(_) => true,
            // Components are dynamic
            TemplateNode::Component(_) => true,
            TemplateNode::RegularElement(elem) => {
                // Element is dynamic if:
                // 1. It has dynamic expressions in direct children
                let has_expressions = elem.fragment.nodes.iter().any(|n| {
                    matches!(
                        n,
                        TemplateNode::ExpressionTag(_)
                            | TemplateNode::HtmlTag(_)
                            | TemplateNode::IfBlock(_)
                            | TemplateNode::EachBlock(_)
                            | TemplateNode::AwaitBlock(_)
                    )
                });
                // 2. It has special attributes that need runtime handling
                let has_special_attrs = elem.attributes.iter().any(|attr| {
                    matches!(attr, Attribute::BindDirective(_))
                        || matches!(attr, Attribute::ClassDirective(_))
                        || matches!(attr, Attribute::StyleDirective(_))
                        || matches!(attr, Attribute::UseDirective(_))
                        || matches!(attr, Attribute::TransitionDirective(_))
                        || matches!(attr, Attribute::AnimateDirective(_))
                        || matches!(attr, Attribute::OnDirective(_))
                        || matches!(attr, Attribute::Attribute(a) if
                            a.name == "autofocus"
                            || a.name.starts_with("on")  // Event handlers (onclick, onmousedown, etc.)
                            || (a.name == "muted" && (elem.name == "source" || elem.name == "video"))
                            || (a.name == "value" && elem.name == "option")
                        )
                });
                // 3. It is a custom element (needs $.set_custom_element_data)
                // Custom elements have hyphens in name OR have `is` attribute
                let is_custom_element = elem.name.contains('-')
                    || elem
                        .attributes
                        .iter()
                        .any(|attr| matches!(attr, Attribute::Attribute(a) if a.name == "is"));
                // 4. It is an input element (needs $.remove_input_defaults)
                let is_input = matches!(elem.name.as_str(), "input" | "textarea" | "select");
                // 5. It has dynamic children that we need to traverse to
                let has_dynamic_descendants = self.has_dynamic_descendants(&elem.fragment.nodes);

                has_expressions
                    || has_special_attrs
                    || is_custom_element
                    || is_input
                    || has_dynamic_descendants
            }
            TemplateNode::SvelteElement(_) => true,
            _ => false,
        }
    }

    /// Check if a list of nodes contains any dynamic descendants we need to traverse to.
    fn has_dynamic_descendants(&self, nodes: &[TemplateNode]) -> bool {
        has_dynamic_descendants_helper(nodes)
    }

    /// Check if an element has only pure (non-reactive) expressions as children.
    /// Pure expressions can use direct textContent assignment instead of $.template_effect.
    #[allow(dead_code)]
    fn has_only_pure_expressions(&self, elem: &RegularElement) -> bool {
        // Check if element has any expression children that are all pure (not reactive)
        let mut has_any_expression = false;

        for child in &elem.fragment.nodes {
            match child {
                TemplateNode::ExpressionTag(tag) => {
                    has_any_expression = true;
                    // Extract the expression and check if it's reactive
                    let expr_start = tag.start as usize;
                    let expr_end = tag.end as usize;
                    if expr_start + 1 < expr_end && expr_end <= self.source.len() {
                        let expr = self.source[expr_start + 1..expr_end - 1].trim();
                        if self.is_expression_reactive(expr) {
                            // Found a reactive expression - not all pure
                            return false;
                        }
                    }
                }
                TemplateNode::Text(t) => {
                    // Whitespace text is OK, but non-whitespace text means not just expressions
                    if !t.data.trim().is_empty() {
                        return false;
                    }
                }
                // Any other node type means not just pure expressions
                _ => return false,
            }
        }

        // Only return true if we had at least one expression and they were all pure
        has_any_expression
    }

    /// Process children of an element using cursor-based navigation.
    /// Returns (statements, has_dynamic, trailing_skipped).
    /// trailing_skipped only counts non-whitespace trailing nodes (since whitespace is stripped).
    fn process_children_cursor(
        &mut self,
        parent_var: &str,
        children: &[TemplateNode],
    ) -> (Vec<JsStatement>, bool, i32) {
        let mut stmts: Vec<JsStatement> = Vec::new();
        let mut prev_var: Option<String> = None;
        let mut skipped: i32 = 0;
        let mut has_dynamic = false;
        let mut is_first_child = true;
        // Track trailing non-whitespace nodes for $.next() generation
        let mut trailing_non_ws: i32 = 0;
        let mut last_dynamic_idx: Option<usize> = None;

        // Find first and last non-whitespace indices (matching template generation)
        let first_non_ws = children
            .iter()
            .position(|n| !matches!(n, TemplateNode::Text(t) if t.data.trim().is_empty()));
        let last_non_ws = children
            .iter()
            .rposition(|n| !matches!(n, TemplateNode::Text(t) if t.data.trim().is_empty()));

        for (idx, child) in children.iter().enumerate() {
            // Skip leading whitespace (not in template HTML)
            if let Some(first) = first_non_ws
                && idx < first
            {
                continue;
            }
            // Skip trailing whitespace (not in template HTML)
            if let Some(last) = last_non_ws
                && idx > last
            {
                continue;
            }
            if self.is_node_dynamic(child) {
                has_dynamic = true;

                // Generate navigation to this node
                let var_name = match child {
                    TemplateNode::RegularElement(elem) => self.next_var_name(&elem.name),
                    TemplateNode::ExpressionTag(_) => "text".to_string(),
                    TemplateNode::HtmlTag(_) => self.next_node_var(),
                    TemplateNode::Component(c) => self.next_var_name(&c.name.to_lowercase()),
                    _ => self.next_node_var(),
                };

                let nav_expr = if let Some(ref prev) = prev_var {
                    // Subsequent dynamic child: $.sibling(prev, skipped)
                    let skip_count = if skipped > 1 { Some(skipped) } else { None };
                    svelte_sibling(id(prev), skip_count)
                } else {
                    // First dynamic child: $.child(parent, preserve_whitespace?)
                    // Use preserve_whitespace=true when there's a text placeholder (space)
                    // This happens when an element like <h1>{title}</h1> becomes <h1> </h1>
                    let preserve_whitespace =
                        is_first_child && matches!(child, TemplateNode::Text(_));
                    // For expression tags that are first children, also check if there's
                    // whitespace in the template placeholder
                    let preserve = if matches!(child, TemplateNode::ExpressionTag(_)) {
                        // Expression at start of element - check if template has space placeholder
                        true
                    } else {
                        preserve_whitespace
                    };
                    svelte_child(id(parent_var), if preserve { Some(true) } else { None })
                };

                stmts.push(var_decl(&var_name, Some(nav_expr)));

                // Handle specific node types
                match child {
                    TemplateNode::ExpressionTag(tag) => {
                        // Extract expression and add to template effects
                        let expr_start = tag.start as usize;
                        let expr_end = tag.end as usize;
                        if expr_start + 1 < expr_end && expr_end <= self.source.len() {
                            let expr = self.source[expr_start + 1..expr_end - 1].trim();
                            let transformed =
                                transform_read_only_props(expr, &self.read_only_props);
                            self.template_effects.push((var_name.clone(), transformed));
                        }
                    }
                    TemplateNode::HtmlTag(tag) => {
                        // Generate $.html(node, () => expr)
                        let expr_start = tag.expression.start().unwrap_or(0) as usize;
                        let expr_end = tag.expression.end().unwrap_or(0) as usize;
                        if expr_end > expr_start && expr_end <= self.source.len() {
                            let expr = self.source[expr_start..expr_end].trim();
                            let transformed =
                                transform_read_only_props(expr, &self.read_only_props);
                            stmts.push(stmt(svelte_html(id(&var_name), thunk(id(&transformed)))));
                        }
                    }
                    TemplateNode::RegularElement(elem) => {
                        // Recursively process this element's children
                        let (child_stmts, child_has_dynamic, _trailing) =
                            self.process_children_cursor(&var_name, &elem.fragment.nodes);
                        stmts.extend(child_stmts);

                        // Add $.reset() if this element had dynamic children
                        // Note: $.next() is NOT used inside elements, only at root level
                        if child_has_dynamic {
                            stmts.push(stmt(svelte_reset(id(&var_name))));
                        }

                        // Handle special attributes for this element
                        self.generate_special_attr_stmts(&var_name, elem, &mut stmts);
                    }
                    _ => {}
                }

                prev_var = Some(var_name);
                last_dynamic_idx = Some(idx);
                skipped = 1;
                trailing_non_ws = 0; // Reset trailing count after dynamic node
                is_first_child = false;
            } else {
                // Static node - just count it
                skipped += 1;
                // Count trailing nodes (only after we've seen a dynamic node)
                if last_dynamic_idx.is_some() {
                    trailing_non_ws += 1;
                }
                is_first_child = false;
            }
        }

        // Return trailing count (nodes after last dynamic, not counting the dynamic node itself)
        (stmts, has_dynamic, trailing_non_ws)
    }

    /// Generate statements for special attributes of an element.
    fn generate_special_attr_stmts(
        &mut self,
        var_name: &str,
        elem: &RegularElement,
        stmts: &mut Vec<JsStatement>,
    ) {
        // Custom elements have hyphens in name OR have `is` attribute
        let is_custom = elem.name.contains('-')
            || elem
                .attributes
                .iter()
                .any(|attr| matches!(attr, Attribute::Attribute(a) if a.name == "is"));
        let is_input_element =
            elem.name == "input" || elem.name == "textarea" || elem.name == "select";

        // Collect class:, style:, use:, bind: directives, and event handlers
        let mut class_directives: Vec<&ClassDirective> = Vec::new();
        let mut style_directives: Vec<&StyleDirective> = Vec::new();
        let mut use_directives: Vec<&UseDirective> = Vec::new();
        let mut bind_directives: Vec<&crate::ast::template::BindDirective> = Vec::new();
        let mut event_handlers: Vec<(String, String)> = Vec::new();

        for attr in &elem.attributes {
            match attr {
                Attribute::UseDirective(dir) => {
                    use_directives.push(dir);
                }
                Attribute::BindDirective(dir) => {
                    bind_directives.push(dir);
                }
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
                        continue;
                    }

                    match attr_name {
                        "autofocus" => {
                            stmts.push(stmt(svelte_autofocus(id(var_name), true)));
                        }
                        "muted" if elem.name == "source" || elem.name == "video" => {
                            stmts.push(stmt(assign(member(id(var_name), "muted"), boolean(true))));
                        }
                        "value" if elem.name == "option" => {
                            if let AttributeValue::Sequence(parts) = &node.value {
                                let value: String = parts
                                    .iter()
                                    .filter_map(|p| {
                                        if let AttributeValuePart::Text(t) = p {
                                            Some(t.data.to_string())
                                        } else {
                                            None
                                        }
                                    })
                                    .collect();
                                let inner = assign(member(id(var_name), "__value"), string(&value));
                                stmts.push(stmt(assign(member(id(var_name), "value"), inner)));
                            }
                        }
                        // Skip `is` attribute - it stays in template (customized built-in elements API)
                        "is" => {}
                        _ if is_custom => {
                            // Custom element attribute (except `is`)
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
                                    .collect(),
                                _ => continue,
                            };
                            stmts.push(stmt(svelte_set_custom_element_data(
                                id(var_name),
                                attr_name,
                                string(&attr_value),
                            )));
                        }
                        _ => {}
                    }
                }
                Attribute::ClassDirective(dir) => {
                    class_directives.push(dir);
                }
                Attribute::StyleDirective(dir) => {
                    style_directives.push(dir);
                }
                _ => {}
            }
        }

        // Generate $.set_class if there are class: directives
        if !class_directives.is_empty() {
            // Build class_directives object: { foo: true, bar: expr, ... }
            let mut class_props: Vec<JsObjectMember> = Vec::new();
            for dir in class_directives {
                let class_name = dir.name.to_string();
                // Extract expression value
                let expr_start = dir.expression.start().unwrap_or(0) as usize;
                let expr_end = dir.expression.end().unwrap_or(0) as usize;
                let expr_value = if expr_end > expr_start && expr_end <= self.source.len() {
                    let expr_str = self.source[expr_start..expr_end].trim();
                    id(expr_str)
                } else {
                    boolean(true)
                };
                class_props.push(prop(&class_name, expr_value));
            }

            // Generate: $.set_class(element, 1, '', null, {}, { foo: true, ... })
            stmts.push(stmt(svelte_set_class(
                id(var_name),
                id("1"),             // flags
                string(""),          // class_attr
                id("null"),          // class_binding
                object(vec![]),      // class_map
                object(class_props), // class_directives
            )));
        }

        // Generate $.set_style if there are style: directives
        if !style_directives.is_empty() {
            // Build style_directives object: { color: 'red', ... }
            let mut style_props: Vec<JsObjectMember> = Vec::new();
            for dir in style_directives {
                let style_name = dir.name.to_string();
                // Extract value
                let style_value = match &dir.value {
                    AttributeValue::Sequence(parts) => {
                        let mut value_str = String::new();
                        for part in parts {
                            match part {
                                AttributeValuePart::Text(t) => {
                                    value_str.push_str(&t.data);
                                }
                                AttributeValuePart::ExpressionTag(tag) => {
                                    let expr_start = tag.start as usize;
                                    let expr_end = tag.end as usize;
                                    if expr_start + 1 < expr_end && expr_end <= self.source.len() {
                                        value_str.push_str(
                                            self.source[expr_start + 1..expr_end - 1].trim(),
                                        );
                                    }
                                }
                            }
                        }
                        string(&value_str)
                    }
                    _ => string(""),
                };
                style_props.push(prop(&style_name, style_value));
            }

            // Generate: $.set_style(element, '', {}, { color: 'red', ... })
            stmts.push(stmt(svelte_set_style(
                id(var_name),
                string(""),          // style_attr
                object(vec![]),      // style_binding
                object(style_props), // style_directives
            )));
        }

        // Generate $.action() for use: directives
        for use_dir in use_directives {
            let action_name = use_dir.name.to_string();

            // Build the callback: ($$node) => action?.($$node)
            // or ($$node, $$action_arg) => action?.($$node, $$action_arg) if there's an expression
            let has_arg = use_dir.expression.is_some();
            let params = if has_arg {
                vec![id_pattern("$$node"), id_pattern("$$action_arg")]
            } else {
                vec![id_pattern("$$node")]
            };

            // Build the call: action?.($$node) or action?.($$node, $$action_arg)
            let call_args = if has_arg {
                vec![id("$$node"), id("$$action_arg")]
            } else {
                vec![id("$$node")]
            };

            // Create the optional call expression: action?.(...)
            let callback_body = optional_call(id(&action_name), call_args);

            let callback = arrow(params, callback_body);

            // Build the argument getter if there's an expression
            let arg_getter = if let Some(ref expr) = use_dir.expression {
                let expr_start = expr.start().unwrap_or(0) as usize;
                let expr_end = expr.end().unwrap_or(0) as usize;
                if expr_end > expr_start && expr_end <= self.source.len() {
                    let expr_str = self.source[expr_start..expr_end].trim();
                    Some(thunk(id(expr_str)))
                } else {
                    None
                }
            } else {
                None
            };

            stmts.push(stmt(svelte_action(id(var_name), callback, arg_getter)));
        }

        // Generate event handlers
        for (event_name, handler) in event_handlers {
            let transformed = transform_state_assignments(&handler, &self.state_vars);
            let prop_name = format!("__{}", event_name);
            stmts.push(stmt(assign(
                member(id(var_name), &prop_name),
                id(&transformed),
            )));
        }

        // Generate $.bind_value() for bind: directives
        // Note: $.remove_input_defaults() is added separately in the main loop right after navigation
        if !bind_directives.is_empty() && is_input_element {
            // Collect bind statements to be added at the end
            for bind_dir in bind_directives {
                let bind_name = bind_dir.name.as_str();
                let expr_start = bind_dir.expression.start().unwrap_or(0) as usize;
                let expr_end = bind_dir.expression.end().unwrap_or(0) as usize;

                if expr_end > expr_start && expr_end <= self.source.len() {
                    let bind_var = self.source[expr_start..expr_end].trim().to_string();

                    if bind_name == "value" {
                        // Generate: $.bind_value(element, () => $.get(var), ($$value) => $.set(var, $$value))
                        let bind_stmt = stmt(svelte_bind_value(
                            id(var_name),
                            thunk(svelte_get(id(&bind_var))),
                            arrow(
                                vec![id_pattern("$$value")],
                                svelte_set(id(&bind_var), id("$$value")),
                            ),
                        ));
                        self.binding_statements.push(bind_stmt);
                    }
                }
            }
        }
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
        // Use the tracked flag which already accounts for both hyphen and `is` attribute
        let is_custom_element = self.current_element_is_custom;
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
            // Skip the `is` attribute - it stays in the template (part of customized built-in elements API)
            "is" => {
                // Let it fall through to normal attribute handling below
            }
            _ if is_custom_element => {
                // All OTHER attributes on custom elements need $.set_custom_element_data()
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
            let raw_expr = self.source[start + 1..end - 1].trim();
            // Transform state variable references in the expression
            let expr_source = transform_state_in_expr(raw_expr, &self.state_vars);

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
                    is_custom_element: false,
                    content_template: None,
                    has_spread: false,
                    spread_props: Vec::new(),
                    attribute_values: Vec::new(),
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
                    is_custom_element: false,
                    content_template: None,
                    has_spread: false,
                    spread_props: Vec::new(),
                    attribute_values: Vec::new(),
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
        if let Some(bind_var) = bind_this_var
            && !has_other_attrs
            && bind_value_var.is_none()
        {
            // Don't add template placeholder - component will be called directly
            self.bind_this_components.push(BindThisComponent {
                component_name: comp_name,
                bind_var,
            });
            return Ok(());
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
            // Collect children content recursively (handles nested components)
            let children_parts = self.collect_children_parts(&component.fragment.nodes);

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
            is_custom_element: false,
            content_template: None,
            has_spread: false,
            spread_props: Vec::new(),
            attribute_values: Vec::new(),
        });

        Ok(())
    }

    fn generate_if_block(&mut self, block: &IfBlock) -> Result<(), TransformError> {
        // Control blocks need anchor comments
        self.html_parts.push("<!>".to_string());

        // Extract the condition expression
        let test_start = block.test.start().unwrap_or(0) as usize;
        let test_end = block.test.end().unwrap_or(0) as usize;
        let condition = if test_end > test_start && test_end <= self.source.len() {
            self.source[test_start..test_end].trim().to_string()
        } else {
            "true".to_string()
        };

        // Process consequent (the "then" branch)
        let (
            consequent_parts,
            consequent_template_var,
            consequent_template_html,
            consequent_text_only,
        ) = self.process_if_block_branch(&block.consequent)?;

        // Process alternate (the "else" branch) if present
        let (alternate_parts, alternate_template_var, alternate_template_html, alternate_text_only) =
            if let Some(ref alternate) = block.alternate {
                self.process_if_block_branch(alternate)?
            } else {
                (Vec::new(), None, None, true)
            };

        // Store the if block info for code generation
        self.if_blocks.push(IfBlockInfo {
            condition: condition.clone(),
            is_elseif: block.elseif,
            consequent_template_var,
            consequent_template_html,
            consequent_parts,
            alternate_template_var,
            alternate_template_html,
            alternate_parts,
            consequent_text_only,
            alternate_text_only,
        });

        Ok(())
    }

    /// Process a branch of an if block (consequent or alternate) and return its parts.
    #[allow(clippy::type_complexity)]
    fn process_if_block_branch(
        &mut self,
        fragment: &Fragment,
    ) -> Result<(Vec<IfBlockPart>, Option<String>, Option<String>, bool), TransformError> {
        let mut parts = Vec::new();
        let nodes = &fragment.nodes;

        // Skip leading and trailing whitespace
        let mut start_idx = 0;
        let mut end_idx = nodes.len();

        while start_idx < end_idx {
            if let TemplateNode::Text(text) = &nodes[start_idx]
                && text.data.trim().is_empty()
            {
                start_idx += 1;
                continue;
            }
            break;
        }

        while end_idx > start_idx {
            if let TemplateNode::Text(text) = &nodes[end_idx - 1]
                && text.data.trim().is_empty()
            {
                end_idx -= 1;
                continue;
            }
            break;
        }

        // Check if the branch contains elements
        let has_elements = nodes[start_idx..end_idx]
            .iter()
            .any(|node| matches!(node, TemplateNode::RegularElement(_)));

        if has_elements {
            // Generate a template for element-based content
            self.if_block_counter += 1;
            let template_var = format!("root_{}", self.if_block_counter);

            // Build template HTML and parts
            let mut template_html = String::new();

            for node in &nodes[start_idx..end_idx] {
                match node {
                    TemplateNode::RegularElement(elem) => {
                        let elem_html = self.build_element_template_html(elem);
                        template_html.push_str(&elem_html);
                        parts.push(IfBlockPart::Element {
                            tag: elem.name.to_string(),
                            template_var: template_var.clone(),
                            template_html: elem_html,
                            dynamic_attrs: Vec::new(),
                            event_handlers: Vec::new(),
                            children: self.collect_element_children_parts(elem),
                        });
                    }
                    TemplateNode::Text(text) => {
                        let trimmed = text.data.trim();
                        if !trimmed.is_empty() {
                            template_html.push_str(trimmed);
                            parts.push(IfBlockPart::Text(trimmed.to_string()));
                        }
                    }
                    TemplateNode::ExpressionTag(tag) => {
                        // Add placeholder for expressions
                        template_html.push(' ');
                        let expr_start = tag.start as usize;
                        let expr_end = tag.end as usize;
                        if expr_start + 1 < expr_end && expr_end <= self.source.len() {
                            let expr = self.source[expr_start + 1..expr_end - 1].trim().to_string();
                            parts.push(IfBlockPart::Expression(expr));
                        }
                    }
                    TemplateNode::IfBlock(nested_block) => {
                        // Add comment placeholder for nested if block
                        template_html.push_str("<!>");
                        // Process the nested if block recursively
                        let nested_info = self.process_nested_if_block(nested_block)?;
                        parts.push(IfBlockPart::NestedIfBlock(Box::new(nested_info)));
                    }
                    _ => {}
                }
            }

            Ok((parts, Some(template_var), Some(template_html), false))
        } else {
            // Text-only content (or content with nested blocks but no elements)
            for node in &nodes[start_idx..end_idx] {
                match node {
                    TemplateNode::Text(text) => {
                        let trimmed = text.data.trim();
                        if !trimmed.is_empty() {
                            parts.push(IfBlockPart::Text(trimmed.to_string()));
                        }
                    }
                    TemplateNode::ExpressionTag(tag) => {
                        let expr_start = tag.start as usize;
                        let expr_end = tag.end as usize;
                        if expr_start + 1 < expr_end && expr_end <= self.source.len() {
                            let expr = self.source[expr_start + 1..expr_end - 1].trim().to_string();
                            parts.push(IfBlockPart::Expression(expr));
                        }
                    }
                    TemplateNode::IfBlock(nested_block) => {
                        // Process the nested if block recursively
                        let nested_info = self.process_nested_if_block(nested_block)?;
                        parts.push(IfBlockPart::NestedIfBlock(Box::new(nested_info)));
                    }
                    _ => {}
                }
            }

            // Check if we have any nested if blocks - if so, it's not text-only
            let has_nested_blocks = parts
                .iter()
                .any(|p| matches!(p, IfBlockPart::NestedIfBlock(_)));
            Ok((parts, None, None, !has_nested_blocks))
        }
    }

    /// Process a nested if block and return its IfBlockInfo.
    fn process_nested_if_block(&mut self, block: &IfBlock) -> Result<IfBlockInfo, TransformError> {
        // Extract the condition expression
        let test_start = block.test.start().unwrap_or(0) as usize;
        let test_end = block.test.end().unwrap_or(0) as usize;
        let condition = if test_end > test_start && test_end <= self.source.len() {
            self.source[test_start..test_end].trim().to_string()
        } else {
            "true".to_string()
        };

        // Process consequent (the "then" branch)
        let (
            consequent_parts,
            consequent_template_var,
            consequent_template_html,
            consequent_text_only,
        ) = self.process_if_block_branch(&block.consequent)?;

        // Process alternate (the "else" branch) if present
        let (alternate_parts, alternate_template_var, alternate_template_html, alternate_text_only) =
            if let Some(ref alternate) = block.alternate {
                self.process_if_block_branch(alternate)?
            } else {
                (Vec::new(), None, None, true)
            };

        Ok(IfBlockInfo {
            condition,
            is_elseif: block.elseif,
            consequent_template_var,
            consequent_template_html,
            consequent_parts,
            alternate_template_var,
            alternate_template_html,
            alternate_parts,
            consequent_text_only,
            alternate_text_only,
        })
    }

    /// Build the HTML template string for an element.
    fn build_element_template_html(&self, elem: &RegularElement) -> String {
        let elem_name = &elem.name;
        let mut html = format!("<{}", elem_name);

        // Add CSS scoping class if present
        if let Some(ref hash) = self.css_hash {
            html.push_str(&format!(" class=\"{}\"", hash));
        }

        // Add static attributes
        for attr in &elem.attributes {
            if let Attribute::Attribute(attr_node) = attr {
                match &attr_node.value {
                    AttributeValue::Sequence(parts)
                        if parts
                            .iter()
                            .all(|p| matches!(p, AttributeValuePart::Text(_))) =>
                    {
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
                        html.push_str(&format!(r#" {}="{}""#, attr_node.name, value));
                    }
                    AttributeValue::True(_) => {
                        html.push_str(&format!(" {}", attr_node.name));
                    }
                    _ => {}
                }
            }
        }

        html.push('>');

        // Add static text content from children
        for child in &elem.fragment.nodes {
            if let TemplateNode::Text(text) = child {
                let trimmed = text.data.trim();
                if !trimmed.is_empty() {
                    html.push_str(trimmed);
                }
            }
        }

        // Close tag (unless void element)
        if !is_void_element(elem_name) {
            html.push_str(&format!("</{}>", elem_name));
        }

        html
    }

    /// Collect children parts from an element for if block processing.
    fn collect_element_children_parts(&self, elem: &RegularElement) -> Vec<IfBlockPart> {
        let mut parts = Vec::new();

        for child in &elem.fragment.nodes {
            match child {
                TemplateNode::Text(text) => {
                    let trimmed = text.data.trim();
                    if !trimmed.is_empty() {
                        parts.push(IfBlockPart::Text(trimmed.to_string()));
                    }
                }
                TemplateNode::ExpressionTag(tag) => {
                    let expr_start = tag.start as usize;
                    let expr_end = tag.end as usize;
                    if expr_start + 1 < expr_end && expr_end <= self.source.len() {
                        let expr = self.source[expr_start + 1..expr_end - 1].trim().to_string();
                        parts.push(IfBlockPart::Expression(expr));
                    }
                }
                _ => {}
            }
        }

        parts
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
            if let TemplateNode::Text(text) = body_nodes[start_idx]
                && text.data.trim().is_empty()
            {
                start_idx += 1;
                continue;
            }
            break;
        }

        while end_idx > start_idx {
            if let TemplateNode::Text(text) = body_nodes[end_idx - 1]
                && text.data.trim().is_empty()
            {
                end_idx -= 1;
                continue;
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

                    // Add CSS scoping class if present
                    if let Some(ref hash) = self.css_hash {
                        template_html.push_str(&format!(" class=\"{}\"", hash));
                    }

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

                    // Check for static text content and expressions
                    let mut has_expressions = false;
                    let mut static_text = String::new();
                    let mut expressions: Vec<String> = Vec::new();

                    for child in &elem.fragment.nodes {
                        match child {
                            TemplateNode::Text(text) => {
                                let trimmed = text.data.trim();
                                if !trimmed.is_empty() {
                                    static_text.push_str(trimmed);
                                }
                            }
                            TemplateNode::ExpressionTag(tag) => {
                                has_expressions = true;
                                let expr_start = tag.start as usize;
                                let expr_end = tag.end as usize;
                                if expr_start + 1 < expr_end && expr_end <= self.source.len() {
                                    let expr = self.source[expr_start + 1..expr_end - 1]
                                        .trim()
                                        .to_string();
                                    expressions.push(expr);
                                }
                            }
                            _ => {}
                        }
                    }

                    // Check if all expressions only reference the index variable (non-reactive)
                    let expressions_only_index = if has_expressions {
                        if let Some(ref idx_name) = each_info.index_name {
                            expressions.iter().all(|expr| expr == idx_name)
                        } else {
                            false
                        }
                    } else {
                        false
                    };

                    if !has_expressions && !static_text.is_empty() {
                        // Pure static text content
                        template_html.push_str(&static_text);
                    } else if has_expressions && !expressions_only_index {
                        // Reactive expressions - add space placeholder
                        template_html.push(' ');
                    }
                    // If expressions_only_index, no placeholder needed (we'll use textContent)

                    template_html.push_str(&format!("</{elem_name}>"));
                    each_info.template_html = Some(template_html);

                    // Handle expressions
                    if has_expressions {
                        if expressions_only_index {
                            // Index-only expressions: build a template literal for static assignment
                            // Build template content: "text ${index}"
                            let mut template_parts = Vec::new();
                            for child in &elem.fragment.nodes {
                                match child {
                                    TemplateNode::Text(text) => {
                                        // Preserve text as-is (including whitespace)
                                        template_parts.push(text.data.to_string());
                                    }
                                    TemplateNode::ExpressionTag(tag) => {
                                        let expr_start = tag.start as usize;
                                        let expr_end = tag.end as usize;
                                        if expr_start + 1 < expr_end
                                            && expr_end <= self.source.len()
                                        {
                                            let expr =
                                                self.source[expr_start + 1..expr_end - 1].trim();
                                            template_parts.push(format!("${{{}}}", expr));
                                        }
                                    }
                                    _ => {}
                                }
                            }
                            // Trim leading/trailing whitespace from the combined template
                            let combined = template_parts.join("");
                            let trimmed = combined.trim();
                            each_info
                                .body_expressions
                                .push(format!("TEMPLATE:{}", trimmed));
                        } else {
                            // Reactive expressions - store for $.child + $.template_effect
                            for expr in expressions {
                                each_info.body_expressions.push(expr);
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

        // Add comment marker in the template for the each block anchor
        // The runtime uses this comment as an anchor point for the dynamic content
        self.html_parts.push("<!>".to_string());

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
            is_custom_element: false,
            content_template: then_value,
            has_spread: false,
            spread_props: Vec::new(),
            attribute_values: Vec::new(),
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
        if self.can_use_simple_ast()
            && !html.is_empty()
            && let Ok(output) = self.build_simple_component_ast(&html, is_fragment)
        {
            return output;
        }

        // Extract imports from script content
        let (script_imports, script_rest) = extract_imports(&self.script_content);

        // Check if script uses $props()
        let script_uses_props = self.script_content.contains("$props()");

        // Check if script uses legacy mode with export let (requires $$props and $.push/$.pop)
        let has_legacy_export_let = script_rest.lines().any(|line| {
            let trimmed = line.trim();
            trimmed.starts_with("export let ") || trimmed.starts_with("export let\t")
        });

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
                && let Some(eq_pos) = trimmed.find('=')
            {
                let before_eq = trimmed[..eq_pos].trim();
                if let Some(var_name) = before_eq.split_whitespace().last() {
                    return Some(var_name.to_string());
                }
            }
            None
        });
        let uses_props_identifier = props_identifier_name.is_some();

        // Calculate should_inject_context and should_inject_props based on analysis flags
        // Reference: transform-client.js lines 365-369 and 393-399
        //
        // should_inject_context = dev || needs_context || reactive_statements.size > 0 || component_returned_object.length > 0
        // should_inject_props = should_inject_context || needs_props || uses_props || uses_rest_props || uses_slots || slot_names.size > 0
        //
        // For specific patterns (props_identifier, class_state_fields, legacy_export_let), we need context
        let should_inject_context = self.analysis_needs_context
            || self.analysis_has_reactive_statements
            || self.analysis_exports_count > 0
            || uses_props_identifier
            || has_class_state_fields
            || has_legacy_export_let;

        let should_inject_props = should_inject_context
            || self.analysis_needs_props
            || self.analysis_uses_props
            || self.analysis_uses_rest_props
            || self.analysis_uses_slots
            || self.analysis_has_slot_names
            || script_uses_props;

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

        // Build module script section (for <script module> blocks)
        // This code is emitted at the module level, after imports but before the component
        let module_script = self.build_module_script_section();

        // Transform remaining script content for client-side
        // First, transform the script based on patterns
        let transformed_script = if uses_props_identifier {
            // Transform with props identifier pattern
            let props_name = props_identifier_name.as_ref().unwrap();
            self.transform_script_content_with_props_identifier(&script_rest, props_name)
        } else if has_legacy_export_let {
            // Legacy mode: transform export let to $.prop() calls
            self.transform_legacy_script_content(&script_rest)
        } else {
            // Normal transformation
            self.transform_script_content(&script_rest)
        };

        // Then, prepend $.push() if should_inject_context is true
        // Reference: transform-client.js line 434: component_block.body.unshift(b.stmt(b.call('$.push', ...push_args)))
        let script_code = if should_inject_context {
            let runes_arg = if has_legacy_export_let {
                "false"
            } else if self.uses_runes {
                "true"
            } else {
                "false"
            };
            if transformed_script.trim().is_empty() {
                format!("\t$.push($$props, {});\n", runes_arg)
            } else {
                format!(
                    "\t$.push($$props, {});\n\n{}",
                    runes_arg, transformed_script
                )
            }
        } else {
            transformed_script
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

        // Determine function signature based on should_inject_props
        // Reference: transform-client.js line 516
        let fn_params = if should_inject_props {
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

        // Generate if block templates (for branches with elements)
        // Use recursive collection to include nested if block templates
        let if_templates: String = self.collect_all_if_block_templates();

        // Generate if block code (using AST-based generation)
        let if_code = self.generate_if_block_code_via_ast();
        let has_if_blocks = !self.if_blocks.is_empty();

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

                // Use the captured text content before the expression
                // (captured during generate_component with proper whitespace normalization)
                let text_before = &self.root_text_before_expression;

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
{hoisted_imports}{module_script}{snippets_code}var root = $.from_html(`<!> `, 1);

export default function {component_name}({fn_params}) {{
{script_code}	var fragment = root();
{component_binding_code}{expression_code}	$.append($$anchor, fragment);
}}"#,
                system_imports = system_imports,
                hoisted_imports = hoisted_imports,
                module_script = module_script,
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
{hoisted_imports}{module_script}
export default function {component_name}({fn_params}) {{
{script_code}	{comp_name}($$anchor, {{
		{props_with_children}
	}});
}}"#,
                system_imports = system_imports,
                hoisted_imports = hoisted_imports,
                module_script = module_script,
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
{hoisted_imports}{module_script}
export default function {component_name}({fn_params}) {{
{script_code}	var fragment = $.comment();
	var node = $.first_child(fragment);
{svelte_element_code}	$.append($$anchor, fragment);
}}{delegation_code}"#,
                system_imports = system_imports,
                hoisted_imports = hoisted_imports,
                module_script = module_script,
                component_name = self.component_name,
                fn_params = fn_params,
                script_code = script_code,
                svelte_element_code = svelte_element_code,
                delegation_code = delegation_code
            )
        } else if has_each_blocks
            && (html.is_empty() || html.trim().is_empty() || html.trim() == "<!>")
        {
            // Only each blocks, no other HTML (or only the each block anchor comment)
            format!(
                r#"{system_imports}
{hoisted_imports}{module_script}
{each_templates}export default function {component_name}({fn_params}) {{
{script_code}	var fragment = $.comment();
	var node = $.first_child(fragment);
{each_code}
	$.append($$anchor, fragment);
}}{delegation_code}"#,
                system_imports = system_imports,
                hoisted_imports = hoisted_imports,
                module_script = module_script,
                each_templates = each_templates,
                component_name = self.component_name,
                fn_params = fn_params,
                script_code = script_code,
                each_code = each_code,
                delegation_code = delegation_code
            )
        } else if has_if_blocks && !has_html {
            // Only if blocks, no HTML content
            format!(
                r#"{system_imports}
{hoisted_imports}{module_script}
{if_templates}export default function {component_name}({fn_params}) {{
{script_code}	var fragment = $.comment();
	var node = $.first_child(fragment);
{if_code}
	$.append($$anchor, fragment);
}}{delegation_code}"#,
                system_imports = system_imports,
                hoisted_imports = hoisted_imports,
                module_script = module_script,
                if_templates = if_templates,
                component_name = self.component_name,
                fn_params = fn_params,
                script_code = script_code,
                if_code = if_code,
                delegation_code = delegation_code
            )
        } else if !has_html && runtime_code.is_empty() && !has_each_blocks && !has_if_blocks {
            // No HTML template - just script code
            let pop_code = if should_inject_context {
                "\n\t$.pop();\n"
            } else {
                ""
            };
            if script_code.is_empty() {
                format!(
                    r#"{system_imports}
{hoisted_imports}{module_script}
export default function {component_name}({fn_params}) {{}}{delegation_code}"#,
                    system_imports = system_imports,
                    hoisted_imports = hoisted_imports,
                    module_script = module_script,
                    component_name = self.component_name,
                    fn_params = fn_params,
                    delegation_code = delegation_code
                )
            } else {
                format!(
                    r#"{system_imports}
{hoisted_imports}{module_script}
export default function {component_name}({fn_params}) {{
{script_code}{pop_code}}}{delegation_code}"#,
                    system_imports = system_imports,
                    hoisted_imports = hoisted_imports,
                    module_script = module_script,
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
            let pop_code = if should_inject_context {
                "\t$.pop();\n"
            } else {
                ""
            };
            // Add $.next(count) for static fragments (no runtime_code)
            // This skips over the root elements that don't need runtime handling
            let next_code = if runtime_code.trim().is_empty()
                && self.root_element_count > 0
                && !has_if_blocks
            {
                format!("\t$.next({});\n", self.root_element_count)
            } else {
                String::new()
            };

            // Handle fragments with if blocks (need node navigation)
            let if_node_code = if has_if_blocks {
                // Find the position of the if block in the fragment
                // Count non-whitespace nodes before the if block
                let skip_count = self.root_element_count; // Simplified: skip all previous elements
                format!(
                    "\tvar node = $.sibling($.first_child(fragment), {});\n\n",
                    skip_count
                )
            } else {
                String::new()
            };

            // Handle fragments with each blocks (need node navigation and $.each call)
            let (each_node_code, each_block_code) = if has_each_blocks {
                // Navigate to the each block anchor (comment marker)
                // This is after the previous elements
                let skip_count = self.root_element_count + 1; // +1 for whitespace
                let node_code = if runtime_code.trim().is_empty() {
                    // No runtime code yet, navigate from first_child
                    format!(
                        "\tvar node = $.sibling($.first_child(fragment), {});\n\n",
                        skip_count
                    )
                } else {
                    // Already have navigation, continue from last element
                    // Find last element var name from runtime_code
                    let vars: Vec<_> = runtime_code
                        .lines()
                        .filter_map(|line| {
                            let trimmed = line.trim();
                            if trimmed.starts_with("var ") && trimmed.contains("= $.first_child") {
                                trimmed.split_whitespace().nth(1).map(|s| s.to_string())
                            } else {
                                None
                            }
                        })
                        .collect();
                    let last_var = vars
                        .last()
                        .cloned()
                        .unwrap_or_else(|| "fragment".to_string());
                    format!("\tvar node = $.sibling({}, 2);\n\n", last_var)
                };
                let block_code = each_code.clone();
                (node_code, block_code)
            } else {
                (String::new(), String::new())
            };

            format!(
                r#"{system_imports}
{hoisted_imports}{module_script}{snippets_code}{each_templates}{if_templates}var root = $.from_html(`{html}`, {template_flags});

export default function {component_name}({fn_params}) {{
{script_code}	var fragment = root();
{runtime_code}{if_node_code}{if_code}{each_node_code}{each_block_code}{next_code}	$.append($$anchor, fragment);
{pop_code}}}{delegation_code}"#,
                system_imports = system_imports,
                hoisted_imports = hoisted_imports,
                module_script = module_script,
                snippets_code = snippets_code,
                each_templates = each_templates,
                if_templates = if_templates,
                html = html,
                template_flags = template_flags,
                component_name = self.component_name,
                fn_params = fn_params,
                script_code = script_code,
                runtime_code = runtime_code,
                if_node_code = if_node_code,
                if_code = if_code,
                each_node_code = each_node_code,
                each_block_code = each_block_code,
                next_code = next_code,
                pop_code = pop_code,
                delegation_code = delegation_code
            )
        } else {
            // Single root element
            let root_var = determine_root_var(&html);
            let pop_code = if should_inject_context {
                "\t$.pop();\n"
            } else {
                ""
            };

            // Handle single element with if blocks
            let if_node_code = if has_if_blocks {
                format!("\tvar node = $.sibling({}, 2);\n\n", root_var)
            } else {
                String::new()
            };

            format!(
                r#"{system_imports}
{hoisted_imports}{module_script}{snippets_code}{if_templates}var root = $.from_html(`{html}`);

export default function {component_name}({fn_params}) {{
{script_code}	var {root_var} = root();
{runtime_code}{if_node_code}{if_code}	$.append($$anchor, {root_var});
{pop_code}}}{delegation_code}"#,
                system_imports = system_imports,
                hoisted_imports = hoisted_imports,
                module_script = module_script,
                snippets_code = snippets_code,
                if_templates = if_templates,
                html = html,
                component_name = self.component_name,
                fn_params = fn_params,
                script_code = script_code,
                root_var = root_var,
                runtime_code = runtime_code,
                if_node_code = if_node_code,
                if_code = if_code,
                pop_code = pop_code,
                delegation_code = delegation_code
            )
        };

        // Normalize the output through oxc parser/codegen
        match normalize_js(&raw_output) {
            Ok(normalized) => normalized,
            Err(_) => raw_output, // Fall back to raw output if parsing fails
        }
    }

    /// Build with cursor-based navigation using the fragment.
    fn build_with_fragment(mut self, fragment: &Fragment) -> String {
        // Reset variable counters since generate_component() may have incremented them
        self.reset_var_counters();

        let html = self.html_parts.join("");
        let is_fragment = self.root_element_count > 1;

        // Extract imports from script content
        let (script_imports, script_rest) = extract_imports(&self.script_content);

        // Check if script uses $props()
        let script_uses_props = self.script_content.contains("$props()");

        // Check if script uses legacy mode with export let
        let has_legacy_export_let = script_rest.lines().any(|line| {
            let trimmed = line.trim();
            trimmed.starts_with("export let ") || trimmed.starts_with("export let\t")
        });

        // Calculate should_inject_context and should_inject_props (same as build())
        let should_inject_context = self.analysis_needs_context
            || self.analysis_has_reactive_statements
            || self.analysis_exports_count > 0
            || has_legacy_export_let;

        let should_inject_props = should_inject_context
            || self.analysis_needs_props
            || self.analysis_uses_props
            || self.analysis_uses_rest_props
            || self.analysis_uses_slots
            || self.analysis_has_slot_names
            || script_uses_props;

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

        // Build module script section (for <script module> blocks)
        let module_script = self.build_module_script_section();

        // Transform remaining script content for client-side
        let transformed_script = if has_legacy_export_let {
            self.transform_legacy_script_content(&script_rest)
        } else {
            self.transform_script_content(&script_rest)
        };

        // Prepend $.push() if should_inject_context is true
        let script_code = if should_inject_context {
            let runes_arg = if has_legacy_export_let {
                "false"
            } else if self.uses_runes {
                "true"
            } else {
                "false"
            };
            if transformed_script.trim().is_empty() {
                format!("\t$.push($$props, {});\n", runes_arg)
            } else {
                format!(
                    "\t$.push($$props, {});\n\n{}",
                    runes_arg, transformed_script
                )
            }
        } else {
            transformed_script
        };

        // Determine root variable name
        let root_var = if is_fragment {
            "fragment".to_string()
        } else {
            determine_root_var(&html)
        };

        // Generate runtime code using cursor-based navigation
        let runtime_code = self.generate_cursor_based_runtime_code(fragment, &root_var);

        // Determine function signature based on should_inject_props
        let fn_params = if should_inject_props {
            "$$anchor, $$props"
        } else {
            "$$anchor"
        };

        // Collect delegated events from fragment
        let delegated_events = self.collect_delegated_events_from_fragment(fragment);
        let delegation_code = if delegated_events.is_empty() {
            String::new()
        } else {
            let events_str = delegated_events
                .iter()
                .map(|e| format!("\"{}\"", e))
                .collect::<Vec<_>>()
                .join(", ");
            format!("\n$.delegate([{}]);", events_str)
        };

        // Check if there's any HTML content
        let has_html = !html.is_empty();

        // Template flags:
        // TEMPLATE_FRAGMENT = 1 (for fragments with multiple roots)
        // TEMPLATE_USE_IMPORT_NODE = 2 (for custom elements)
        // Both = 3
        let template_flags = if is_fragment {
            if self.has_custom_elements {
                ", 3"
            } else {
                ", 1"
            }
        } else if self.has_custom_elements {
            ", 2"
        } else {
            ""
        };

        // Add $.pop() if should_inject_context is true
        let pop_code = if should_inject_context {
            "\t$.pop();\n"
        } else {
            ""
        };

        // Generate each block templates (for bodies with elements)
        // These are populated during generate_cursor_based_runtime_code when EachBlocks are processed
        let each_templates: String = self
            .each_blocks
            .iter()
            .filter_map(|each| {
                if let (Some(var), Some(html)) = (&each.template_var, &each.template_html) {
                    Some(format!("var {} = $.from_html(`{}`);\n", var, html))
                } else {
                    None
                }
            })
            .collect();

        let raw_output = if has_html {
            format!(
                r#"{system_imports}
{hoisted_imports}{module_script}{each_templates}var root = $.from_html(`{html}`{template_flags});

export default function {component_name}({fn_params}) {{
{script_code}	var {root_var} = root();
{runtime_code}	$.append($$anchor, {root_var});
{pop_code}}}{delegation_code}"#,
                system_imports = system_imports,
                hoisted_imports = hoisted_imports,
                module_script = module_script,
                each_templates = each_templates,
                html = html,
                template_flags = template_flags,
                component_name = self.component_name,
                fn_params = fn_params,
                script_code = script_code,
                root_var = root_var,
                runtime_code = runtime_code,
                pop_code = pop_code,
                delegation_code = delegation_code,
            )
        } else {
            // No HTML - just export the function
            format!(
                r#"{system_imports}
{hoisted_imports}{module_script}
export default function {component_name}({fn_params}) {{
{script_code}{pop_code}}}"#,
                system_imports = system_imports,
                hoisted_imports = hoisted_imports,
                module_script = module_script,
                component_name = self.component_name,
                fn_params = fn_params,
                script_code = script_code,
                pop_code = pop_code,
            )
        };

        match normalize_js(&raw_output) {
            Ok(normalized) => normalized,
            Err(_) => raw_output,
        }
    }

    /// Generate children callback for component with children.
    /// Creates: ($$anchor, $$slotProps) => { ... }
    fn generate_children_callback(&self, children_parts: &[ChildPart]) -> String {
        // Check if children is a single component (standalone case)
        let has_only_components = children_parts
            .iter()
            .all(|p| matches!(p, ChildPart::Component(..)));

        if has_only_components && !children_parts.is_empty() {
            // Standalone component(s) - no template needed
            let mut body = String::new();
            for part in children_parts {
                if let ChildPart::Component(name, props, nested) = part {
                    body.push_str(&self.generate_component_call(name, props, nested, 3));
                }
            }
            format!(
                "($$anchor, $$slotProps) => {{\n{}\t\t}}",
                body.trim_end_matches('\n')
            )
        } else {
            // Mixed content or text/expressions only
            let mut content_parts = Vec::new();
            let mut has_expressions = false;
            let mut has_components = false;

            for part in children_parts {
                match part {
                    ChildPart::Text(text) => {
                        // Normalize internal whitespace but preserve trailing space if present
                        let trimmed_start = text.trim_start();
                        let trimmed_end = text.trim_end();
                        let has_trailing_space = text.len() > trimmed_end.len();

                        // Normalize internal whitespace
                        let normalized = trimmed_start
                            .split_whitespace()
                            .collect::<Vec<_>>()
                            .join(" ");

                        if !normalized.is_empty() {
                            // Add trailing space back if it was present (for text followed by expression)
                            if has_trailing_space {
                                content_parts.push(format!("{} ", normalized));
                            } else {
                                content_parts.push(normalized);
                            }
                        }
                    }
                    ChildPart::Expression(expr) => {
                        has_expressions = true;
                        let transformed = transform_state_in_expr(expr, &self.state_vars);
                        content_parts.push(format!("${{{} ?? ''}}", transformed));
                    }
                    ChildPart::Component(..) => {
                        has_components = true;
                    }
                }
            }

            if has_components {
                // Has mixed content with components - generate component calls
                let mut body = String::new();
                for part in children_parts {
                    if let ChildPart::Component(name, props, nested) = part {
                        body.push_str(&self.generate_component_call(name, props, nested, 3));
                    }
                }
                format!(
                    "($$anchor, $$slotProps) => {{\n{}\t\t}}",
                    body.trim_end_matches('\n')
                )
            } else if has_expressions {
                let content_template = content_parts.join("").trim_end().to_string();
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
    }

    /// Generate a component call string for nested components.
    fn generate_component_call(
        &self,
        name: &str,
        props: &str,
        nested_children: &[ChildPart],
        indent: usize,
    ) -> String {
        let indent_str = "\t".repeat(indent);

        if nested_children.is_empty() {
            // Component without children
            if props.is_empty() {
                format!("{}{name}($$anchor);\n", indent_str)
            } else {
                format!("{}{name}($$anchor, {{ {props} }});\n", indent_str)
            }
        } else {
            // Component with children - recursively generate children callback
            let children_cb = self.generate_children_callback(nested_children);
            if props.is_empty() {
                format!(
                    "{}{name}($$anchor, {{\n{}\tchildren: {},\n{}\t$$slots: {{ default: true }}\n{}}});\n",
                    indent_str, indent_str, children_cb, indent_str, indent_str
                )
            } else {
                format!(
                    "{}{name}($$anchor, {{\n{}\t{props},\n{}\tchildren: {},\n{}\t$$slots: {{ default: true }}\n{}}});\n",
                    indent_str, indent_str, indent_str, children_cb, indent_str, indent_str
                )
            }
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

    /// Build the module script section for output.
    ///
    /// Module script content (from `<script module>` blocks) is emitted at the module level,
    /// after imports but before the component function.
    ///
    /// This follows the JS implementation in transform-client.js lines 504-512:
    /// - Module body is walked and transformed
    /// - Imports are hoisted to the top
    /// - Module-level code appears before the component function
    fn build_module_script_section(&self) -> String {
        if let Some(ref content) = self.module_script_content {
            if content.trim().is_empty() {
                return String::new();
            }

            // Process the module script content
            let mut result = String::new();

            for line in content.lines() {
                let trimmed = line.trim();

                // Skip empty lines at the start
                if trimmed.is_empty() && result.is_empty() {
                    continue;
                }

                // Skip import statements (they're already hoisted separately)
                if trimmed.starts_with("import ") {
                    continue;
                }

                // Add the line with proper indentation preserved
                result.push_str(line);
                result.push('\n');
            }

            // Trim trailing whitespace and add final newline if we have content
            let result = result.trim_end();
            if result.is_empty() {
                String::new()
            } else {
                format!("{}\n\n", result)
            }
        } else {
            String::new()
        }
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

            // Skip lines that are already part of class transformation or contain runes
            // Also skip getter/setter definitions and other class syntax
            if trimmed.contains("$.state(")
                || trimmed.contains("$.derived(")
                || trimmed.contains("$.get(")
                || trimmed.contains("$.set(")
                || trimmed.contains("$state(")
                || trimmed.contains("$derived(")
                || trimmed.starts_with("get ")
                || trimmed.starts_with("set ")
                || trimmed.starts_with("return ")
                || trimmed.starts_with("class ")
                || trimmed.starts_with("#")
                || trimmed == "}"
                || trimmed == "{"
                || trimmed.starts_with("constructor")
            {
                // Transform the runes first, then skip further processing
                let transformed = transform_client_runes_with_skip_and_state(
                    trimmed,
                    &skip_state_vars,
                    &self.state_vars,
                );
                result.push('\t');
                result.push_str(&transformed);
                result.push('\n');
                continue;
            }

            // Transform runes (with skipping for FUNC_ARRAY pattern)
            // Pass state_vars to wrap state variable reads with $.get() inside $derived()
            let mut transformed = transform_client_runes_with_skip_and_state(
                trimmed,
                &skip_state_vars,
                &self.state_vars,
            );

            // Transform state variable assignments to $.set()
            transformed = transform_state_assignments(&transformed, &self.state_vars);

            // Transform derived variable reads to $.get()
            // Derived variables always need $.get() when accessed (outside their declaration)
            transformed =
                wrap_derived_var_reads(&transformed, &self.derived_vars, &self.state_vars);

            result.push('\t');
            result.push_str(&transformed);
            result.push('\n');
        }

        result
    }

    /// Transform legacy script content (with export let and $: reactive statements).
    /// Converts:
    /// - `export let x = value` to `let x = $.prop($$props, 'x', 12, value)`
    /// - `$: statement` to `$.legacy_pre_effect(() => deps, () => statement)`
    fn transform_legacy_script_content(&self, script: &str) -> String {
        if script.is_empty() {
            return String::new();
        }

        let mut result = String::new();
        let mut in_reactive_statement = false;
        let mut has_reactive_statements = false;
        let mut reactive_block_depth = 0;
        let mut accumulated_reactive = String::new();

        let lines: Vec<&str> = script.lines().collect();
        let mut i = 0;

        while i < lines.len() {
            let line = lines[i];
            let trimmed = line.trim();

            // Skip empty lines at the start
            if trimmed.is_empty() && result.is_empty() {
                i += 1;
                continue;
            }

            // Handle export let declarations
            if trimmed.starts_with("export let ") {
                let transformed = transform_export_let(trimmed);
                result.push('\t');
                result.push_str(&transformed);
                result.push('\n');
                i += 1;
                continue;
            }

            // Handle $: reactive statements
            if let Some(stripped) = trimmed.strip_prefix("$:") {
                has_reactive_statements = true;
                let after_label = stripped.trim();

                // Check if this is a single-line or multi-line statement
                if after_label.starts_with("if ") {
                    // It's an if statement - may be multi-line
                    in_reactive_statement = true;
                    accumulated_reactive.clear();
                    accumulated_reactive.push_str(after_label);
                    reactive_block_depth = count_braces(after_label);

                    // Check if the block is complete on this line
                    if reactive_block_depth == 0
                        && after_label.contains('{')
                        && after_label.contains('}')
                    {
                        // Single-line if statement
                        let transformed = transform_reactive_statement(&accumulated_reactive);
                        result.push_str(&transformed);
                        result.push('\n');
                        in_reactive_statement = false;
                        accumulated_reactive.clear();
                    }
                } else if after_label.contains('{') {
                    // Multi-line block
                    in_reactive_statement = true;
                    accumulated_reactive.clear();
                    accumulated_reactive.push_str(after_label);
                    reactive_block_depth = count_braces(after_label);
                } else {
                    // Single-line reactive statement
                    let transformed = transform_reactive_statement(after_label);
                    result.push_str(&transformed);
                    result.push('\n');
                }
                i += 1;
                continue;
            }

            // Continue accumulating multi-line reactive statement
            if in_reactive_statement {
                accumulated_reactive.push('\n');
                accumulated_reactive.push_str(trimmed);
                reactive_block_depth += count_braces(trimmed);

                if reactive_block_depth <= 0 {
                    // Block is complete
                    let transformed = transform_reactive_statement(&accumulated_reactive);
                    result.push_str(&transformed);
                    result.push('\n');
                    in_reactive_statement = false;
                    accumulated_reactive.clear();
                }
                i += 1;
                continue;
            }

            // Regular line - pass through with standard transformation
            if !trimmed.is_empty() {
                result.push('\t');
                result.push_str(trimmed);
                result.push('\n');
            }
            i += 1;
        }

        // Add $.legacy_pre_effect_reset() after all reactive statements
        if has_reactive_statements {
            result.push_str("\t$.legacy_pre_effect_reset();\n");
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
        // Collect from regular nodes - only include delegatable events
        for node in &self.nodes {
            for (event_name, _) in &node.event_handlers {
                if is_delegated_event_name(event_name) && !events.contains(event_name) {
                    events.push(event_name.clone());
                }
            }
        }
        // Collect from each blocks - only include delegatable events
        for each in &self.each_blocks {
            for handler in &each.event_handlers {
                if is_delegated_event_name(&handler.event) && !events.contains(&handler.event) {
                    events.push(handler.event.clone());
                }
            }
        }
        events
    }

    /// Collect delegated events from fragment
    fn collect_delegated_events_from_fragment(&self, fragment: &Fragment) -> Vec<String> {
        let mut events: Vec<String> = Vec::new();
        Self::collect_events_from_nodes(&fragment.nodes, &mut events);
        events
    }

    /// Recursively collect event names from nodes
    /// Only collects events that are delegatable (click, input, change, etc.)
    fn collect_events_from_nodes(nodes: &[TemplateNode], events: &mut Vec<String>) {
        for node in nodes {
            match node {
                TemplateNode::RegularElement(elem) => {
                    // Collect events from this element's attributes - only delegatable events
                    for attr in &elem.attributes {
                        if let Attribute::Attribute(node) = attr {
                            let attr_name = node.name.as_str();
                            if let Some(event_name) = attr_name.strip_prefix("on")
                                && is_delegated_event_name(event_name)
                                && !events.contains(&event_name.to_string())
                            {
                                events.push(event_name.to_string());
                            }
                        }
                    }
                    // Recursively process children
                    Self::collect_events_from_nodes(&elem.fragment.nodes, events);
                }
                TemplateNode::IfBlock(block) => {
                    Self::collect_events_from_nodes(&block.consequent.nodes, events);
                    if let Some(ref alt) = block.alternate {
                        Self::collect_events_from_nodes(&alt.nodes, events);
                    }
                }
                TemplateNode::EachBlock(block) => {
                    Self::collect_events_from_nodes(&block.body.nodes, events);
                    if let Some(ref fallback) = block.fallback {
                        Self::collect_events_from_nodes(&fallback.nodes, events);
                    }
                }
                TemplateNode::AwaitBlock(block) => {
                    if let Some(ref pending) = block.pending {
                        Self::collect_events_from_nodes(&pending.nodes, events);
                    }
                    if let Some(ref then_block) = block.then {
                        Self::collect_events_from_nodes(&then_block.nodes, events);
                    }
                    if let Some(ref catch_block) = block.catch {
                        Self::collect_events_from_nodes(&catch_block.nodes, events);
                    }
                }
                TemplateNode::KeyBlock(block) => {
                    Self::collect_events_from_nodes(&block.fragment.nodes, events);
                }
                TemplateNode::SnippetBlock(block) => {
                    Self::collect_events_from_nodes(&block.body.nodes, events);
                }
                _ => {}
            }
        }
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
            let mut stmts = vec![var_decl("fragment", Some(call(id("root"), vec![])))];
            // Add $.next(count) for static fragments to skip over root elements
            if self.root_element_count > 0 {
                stmts.push(stmt(svelte_next(Some(self.root_element_count as i32))));
            }
            stmts.push(stmt(svelte_append(id("$$anchor"), id("fragment"))));
            stmts
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
            || !self.if_blocks.is_empty()
        {
            return false;
        }

        // Must have no script content (instance or module)
        if !self.script_content.is_empty() {
            return false;
        }

        // Must have no module script content
        if self.module_script_content.is_some() {
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
        if !template_parts.is_empty()
            && let Some((_, Some(_))) = template_parts.last()
        {
            quasis.push(quasi("", true));
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
                        || node.is_custom_element
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
                    if node.has_spread {
                        // When there's a spread, use $.attribute_effect to combine all attrs and events
                        let mut handler_decls = Vec::new();
                        let mut obj_props = Vec::new();

                        // Add spread props first
                        for spread_expr in &node.spread_props {
                            obj_props.push(format!("...{}", spread_expr));
                        }

                        // Add event handlers
                        for (attr_name, handler) in &node.attribute_values {
                            if attr_name.starts_with("on") {
                                let transformed =
                                    transform_state_assignments(handler, &self.state_vars);
                                // Check if it's an arrow function or function expression
                                let is_function = transformed.trim().starts_with("(")
                                    || transformed.trim().starts_with("function");
                                if is_function {
                                    // Give it a stable ID
                                    let handler_id = if handler_decls.is_empty() {
                                        "event_handler".to_string()
                                    } else {
                                        format!("event_handler_{}", handler_decls.len())
                                    };
                                    handler_decls
                                        .push(format!("var {} = {}", handler_id, transformed));
                                    obj_props.push(format!("{}: {}", attr_name, handler_id));
                                } else {
                                    obj_props.push(format!("{}: {}", attr_name, transformed));
                                }
                            }
                        }

                        // Add handler declarations
                        for decl in handler_decls {
                            statements.push(stmt(raw(decl)));
                        }

                        // Build the $.attribute_effect call
                        let obj_literal = format!("{{ {} }}", obj_props.join(", "));
                        statements.push(stmt(raw(format!(
                            "$.attribute_effect({}, () => ({}))",
                            var, obj_literal
                        ))));
                    } else {
                        // No spread - use delegated pattern for supported events
                        for (event_name, handler) in &node.event_handlers {
                            let transformed =
                                transform_state_assignments(handler, &self.state_vars);

                            if is_delegated_event_name(event_name) {
                                // Delegated event: element.__click = handler
                                let prop_name = format!("__{}", event_name);
                                statements.push(stmt(assign(
                                    member(id(var), &prop_name),
                                    id(&transformed),
                                )));
                            } else {
                                // Non-delegated event: $.event('eventname', element, handler)
                                statements.push(stmt(super::js_ast::builders::svelte_event(
                                    event_name.as_str(),
                                    id(var),
                                    id(&transformed),
                                )));
                            }
                        }
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
                            // Check if content uses any state variable (primitive or proxy)
                            let is_reactive = self
                                .state_vars
                                .iter()
                                .any(|sv| content_template.contains(sv))
                                || self
                                    .proxy_state_vars
                                    .iter()
                                    .any(|sv| content_template.contains(sv));

                            if is_reactive {
                                let text_var = "text";
                                statements
                                    .push(var_decl(text_var, Some(svelte_child(id(var), None))));
                                statements.push(stmt(svelte_reset(id(var))));
                                // For proxy state vars, don't wrap in $.get() - just use directly
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

                        // Check if any expression uses state variables (reactive)
                        let is_reactive = combined.iter().any(|expr| {
                            self.state_vars.iter().any(|sv| expr.contains(sv))
                                || self.proxy_state_vars.iter().any(|sv| expr.contains(sv))
                        });

                        match combined.len() {
                            1 => {
                                let expr = &combined[0];
                                if is_reactive {
                                    // Reactive: use $.child + $.reset + $.template_effect
                                    let text_var = "text";
                                    statements.push(var_decl(
                                        text_var,
                                        Some(svelte_child(id(var), Some(true))),
                                    ));
                                    statements.push(stmt(svelte_reset(id(var))));
                                    // Use 1-argument form: $.template_effect(() => $.set_text(text, expr))
                                    statements.push(stmt(svelte_template_effect(thunk(
                                        svelte_set_text(id(text_var), id(expr)),
                                    ))));
                                } else {
                                    // Static: use textContent assignment
                                    statements.push(stmt(set_text_content(id(var), id(expr))));
                                }
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
                                    if is_reactive {
                                        // Reactive: use $.child + $.reset + $.template_effect
                                        let text_var = "text";
                                        statements.push(var_decl(
                                            text_var,
                                            Some(svelte_child(id(var), Some(true))),
                                        ));
                                        statements.push(stmt(svelte_reset(id(var))));
                                        // Use 1-argument form: $.template_effect(() => $.set_text(text, expr))
                                        statements.push(stmt(svelte_template_effect(thunk(
                                            svelte_set_text(id(text_var), id(last)),
                                        ))));
                                    } else {
                                        statements.push(stmt(set_text_content(id(var), id(last))));
                                    }
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

    /// Generate runtime code using cursor-based navigation.
    /// This processes the AST fragment directly with cursor tracking.
    fn generate_cursor_based_runtime_code(
        &mut self,
        fragment: &Fragment,
        root_var: &str,
    ) -> String {
        let mut stmts: Vec<JsStatement> = Vec::new();

        // Find the first non-whitespace node (same as generate_component does for HTML)
        let start_idx = fragment
            .nodes
            .iter()
            .position(|n| !matches!(n, TemplateNode::Text(t) if t.data.trim().is_empty()))
            .unwrap_or(0);

        let non_whitespace_nodes: Vec<&TemplateNode> = fragment
            .nodes
            .iter()
            .skip(start_idx)
            .filter(|n| !matches!(n, TemplateNode::Text(t) if t.data.trim().is_empty()))
            .collect();

        // If there's exactly one root element, process it specially
        if non_whitespace_nodes.len() == 1
            && let TemplateNode::RegularElement(elem) = non_whitespace_nodes[0]
        {
            // Root element is already assigned to root_var by `var root_var = root()`
            // Generate event handlers for root element first
            self.generate_special_attr_stmts(root_var, elem, &mut stmts);

            // Then process its children
            let (child_stmts, has_dynamic, _trailing) =
                self.process_children_cursor(root_var, &elem.fragment.nodes);
            stmts.extend(child_stmts);

            if has_dynamic {
                stmts.push(stmt(svelte_reset(id(root_var))));
            }

            return self.statements_to_string(&stmts);
        }

        // Multiple root nodes or non-element root - use standard navigation
        let mut prev_var: Option<String> = None;
        let mut skipped: i32 = 0;

        // Process root-level nodes (skipping leading whitespace)
        for node in fragment.nodes.iter().skip(start_idx) {
            // Skip whitespace-only text nodes (these are normalized to spaces in HTML)
            if let TemplateNode::Text(t) = node
                && t.data.trim().is_empty()
            {
                skipped += 1;
                continue;
            }

            if self.is_node_dynamic(node) {
                // Generate navigation
                let var_name = match node {
                    TemplateNode::RegularElement(elem) => self.next_var_name(&elem.name),
                    TemplateNode::ExpressionTag(_) => "text".to_string(),
                    TemplateNode::HtmlTag(_) => self.next_node_var(),
                    // Components use node/node_N as anchor variable name
                    TemplateNode::Component(_) => self.next_node_var(),
                    _ => self.next_node_var(),
                };

                let nav_expr = if let Some(ref prev) = prev_var {
                    // Subsequent dynamic node: $.sibling(prev, skipped)
                    let skip_count = if skipped > 1 { Some(skipped) } else { None };
                    svelte_sibling(id(prev), skip_count)
                } else {
                    // First dynamic node at root level
                    if skipped > 0 {
                        // $.sibling($.first_child(root), skipped)
                        svelte_sibling(svelte_first_child(id(root_var)), Some(skipped))
                    } else {
                        // $.first_child(root)
                        svelte_first_child(id(root_var))
                    }
                };

                stmts.push(var_decl(&var_name, Some(nav_expr)));

                // Process this node
                match node {
                    TemplateNode::RegularElement(elem) => {
                        // Check if this is an input element with bind directives
                        let is_input_element =
                            matches!(elem.name.as_str(), "input" | "textarea" | "select");
                        let has_bind_directive = elem
                            .attributes
                            .iter()
                            .any(|attr| matches!(attr, Attribute::BindDirective(_)));

                        // Add $.remove_input_defaults() right after the navigation statement
                        if is_input_element && has_bind_directive {
                            stmts.push(stmt(svelte_remove_input_defaults(id(&var_name))));
                        }

                        // Process children with cursor navigation
                        let (child_stmts, has_dynamic_children, trailing) =
                            self.process_children_cursor(&var_name, &elem.fragment.nodes);
                        stmts.extend(child_stmts);

                        // Add $.next() if there are trailing static nodes
                        if trailing > 1 {
                            stmts.push(stmt(svelte_next(Some(trailing))));
                        }

                        // Add $.reset() if this element had dynamic children
                        if has_dynamic_children {
                            stmts.push(stmt(svelte_reset(id(&var_name))));
                        }

                        // Generate special attribute statements
                        self.generate_special_attr_stmts(&var_name, elem, &mut stmts);
                    }
                    TemplateNode::ExpressionTag(tag) => {
                        let expr_start = tag.start as usize;
                        let expr_end = tag.end as usize;
                        if expr_start + 1 < expr_end && expr_end <= self.source.len() {
                            let expr = self.source[expr_start + 1..expr_end - 1].trim();
                            let transformed =
                                transform_read_only_props(expr, &self.read_only_props);
                            self.template_effects.push((var_name.clone(), transformed));
                        }
                    }
                    TemplateNode::HtmlTag(tag) => {
                        let expr_start = tag.expression.start().unwrap_or(0) as usize;
                        let expr_end = tag.expression.end().unwrap_or(0) as usize;
                        if expr_end > expr_start && expr_end <= self.source.len() {
                            let expr = self.source[expr_start..expr_end].trim();
                            let transformed =
                                transform_read_only_props(expr, &self.read_only_props);
                            stmts.push(stmt(svelte_html(id(&var_name), thunk(id(&transformed)))));
                        }
                    }
                    TemplateNode::Component(comp) => {
                        // Generate: ComponentName(anchor, { prop: value, ... })
                        let comp_name = comp.name.as_str();

                        // Build props object from attributes
                        let mut props: Vec<JsObjectMember> = Vec::new();
                        for attr in &comp.attributes {
                            if let Attribute::Attribute(a) = attr {
                                let prop_name = a.name.to_string();
                                let prop_value = match &a.value {
                                    AttributeValue::True(_) => boolean(true),
                                    AttributeValue::Expression(expr_tag) => {
                                        // Extract expression from the tag
                                        let start =
                                            expr_tag.expression.start().unwrap_or(0) as usize;
                                        let end = expr_tag.expression.end().unwrap_or(0) as usize;
                                        if end > start && end <= self.source.len() {
                                            id(self.source[start..end].trim())
                                        } else {
                                            boolean(true)
                                        }
                                    }
                                    AttributeValue::Sequence(parts) => {
                                        // Check if it's an expression or static text
                                        let mut expr_str = String::new();
                                        for part in parts {
                                            match part {
                                                AttributeValuePart::Text(t) => {
                                                    expr_str.push_str(&t.data);
                                                }
                                                AttributeValuePart::ExpressionTag(e) => {
                                                    let start =
                                                        e.expression.start().unwrap_or(0) as usize;
                                                    let end =
                                                        e.expression.end().unwrap_or(0) as usize;
                                                    if end > start && end <= self.source.len() {
                                                        expr_str.push_str(
                                                            self.source[start..end].trim(),
                                                        );
                                                    }
                                                }
                                            }
                                        }
                                        if expr_str.is_empty() {
                                            string("")
                                        } else {
                                            id(&expr_str)
                                        }
                                    }
                                };
                                props.push(prop(prop_name, prop_value));
                            }
                        }

                        // Build props object
                        let props_obj = if props.is_empty() {
                            None
                        } else {
                            Some(object(props))
                        };

                        // Generate component call: ComponentName(anchor, { props })
                        let comp_call = if let Some(props_obj) = props_obj {
                            call(id(comp_name), vec![id(&var_name), props_obj])
                        } else {
                            call(id(comp_name), vec![id(&var_name)])
                        };
                        stmts.push(stmt(comp_call));
                    }
                    TemplateNode::EachBlock(block) => {
                        // Generate $.each() call for the each block
                        let each_stmts =
                            self.generate_each_block_inline(&var_name, block, fragment);
                        stmts.extend(each_stmts);
                    }
                    TemplateNode::IfBlock(block) => {
                        // Generate $.if() call for the if block
                        let if_stmts = self.generate_if_block_inline(&var_name, block);
                        stmts.extend(if_stmts);
                    }
                    _ => {}
                }

                prev_var = Some(var_name);
                skipped = 1;
            } else {
                skipped += 1;
            }
        }

        // Handle trailing static nodes at root level
        // Svelte navigates to the first trailing static ELEMENT, then $.next() for the rest
        if let Some(ref prev) = prev_var
            && skipped > 1
        {
            // Collect nodes after the last dynamic element
            let mut nodes_after_last_dynamic: Vec<&TemplateNode> = Vec::new();
            let mut last_dynamic_idx = 0;

            for (i, node) in fragment.nodes.iter().skip(start_idx).enumerate() {
                if self.is_node_dynamic(node) {
                    last_dynamic_idx = i;
                }
            }

            // Collect trailing nodes
            for (i, node) in fragment.nodes.iter().skip(start_idx).enumerate() {
                if i > last_dynamic_idx {
                    nodes_after_last_dynamic.push(node);
                }
            }

            // Find first static element in trailing nodes
            let mut trailing_element: Option<&RegularElement> = None;
            let mut count_to_element: i32 = 0;
            let mut remaining_count: i32 = 0;
            let mut found_element = false;

            for node in &nodes_after_last_dynamic {
                if !matches!(node, TemplateNode::Text(t) if t.data.trim().is_empty()) {
                    if let TemplateNode::RegularElement(elem) = node {
                        if !found_element {
                            trailing_element = Some(elem);
                            found_element = true;
                        } else {
                            remaining_count += 1;
                        }
                    } else {
                        remaining_count += 1;
                    }
                } else if !found_element {
                    count_to_element += 1;
                } else {
                    remaining_count += 1;
                }
            }

            // Include the whitespace before the first trailing element
            count_to_element += 1; // Add 1 for the sibling count from prev

            if let Some(elem) = trailing_element {
                // Navigate to the first trailing element
                let elem_var = self.next_var_name(&elem.name);
                let skip_count = if count_to_element > 1 {
                    Some(count_to_element)
                } else {
                    None
                };
                stmts.push(var_decl(
                    &elem_var,
                    Some(svelte_sibling(id(prev), skip_count)),
                ));
                // Then $.next() for remaining
                if remaining_count > 0 {
                    stmts.push(stmt(svelte_next(Some(remaining_count))));
                }
            } else {
                // No trailing elements, just skip all
                stmts.push(stmt(svelte_next(Some(skipped))));
            }
        }

        // Add binding statements (e.g., $.bind_value) collected during traversal
        stmts.extend(std::mem::take(&mut self.binding_statements));

        // Generate $.template_effect for collected expressions
        if !self.template_effects.is_empty() {
            if self.template_effects.len() == 1 {
                let (var_name, expr) = &self.template_effects[0];
                stmts.push(stmt(svelte_template_effect(thunk(svelte_set_text(
                    id(var_name),
                    id(expr),
                )))));
            } else {
                let mut effect_body: Vec<JsStatement> = Vec::new();
                for (var_name, expr) in &self.template_effects {
                    effect_body.push(stmt(svelte_set_text(id(var_name), id(expr))));
                }
                stmts.push(stmt(svelte_template_effect(arrow_block(
                    vec![],
                    effect_body,
                ))));
            }
        }

        self.statements_to_string(&stmts)
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

                // Handle dynamic text content
                if !each.body_expressions.is_empty() {
                    // Check if first expression is a pre-built template (for index-only expressions)
                    let first_expr = &each.body_expressions[0];
                    if let Some(template_content) = first_expr.strip_prefix("TEMPLATE:") {
                        // Static template content - use direct textContent assignment
                        // p.textContent = `index: ${i}`;
                        let template_lit = template(vec![quasi(template_content, true)], vec![]);
                        body_stmts.push(stmt(set_text_content(id(elem_var), template_lit)));
                    } else {
                        // Dynamic expressions - use $.child + $.reset + $.template_effect pattern
                        // var text = $.child(elem, true);
                        body_stmts.push(var_decl(
                            "text",
                            Some(svelte_child(id(elem_var), Some(true))),
                        ));

                        // $.reset(elem);
                        body_stmts.push(stmt(svelte_reset(id(elem_var))));

                        // Build the template effect expression
                        // Wrap context variable references in $.get() for reactivity
                        let context_name = each.context_name.as_deref().unwrap_or("$$item");
                        let expr_parts: Vec<String> = each
                            .body_expressions
                            .iter()
                            .map(|expr| {
                                // Check if expression matches context variable and wrap in $.get()
                                if expr == context_name {
                                    format!("$.get({})", expr)
                                } else {
                                    expr.clone()
                                }
                            })
                            .collect();

                        // For a single expression, use direct $.get call
                        // For multiple expressions, use template literal
                        if expr_parts.len() == 1 {
                            // $.template_effect(() => $.set_text(text, $.get(x)));
                            body_stmts.push(stmt(svelte_template_effect(thunk(svelte_set_text(
                                id("text"),
                                id(&expr_parts[0]),
                            )))));
                        } else {
                            // Multiple expressions - use template literal
                            let template_str = expr_parts
                                .iter()
                                .map(|e| format!("${{{}}}", e))
                                .collect::<Vec<_>>()
                                .join("");
                            body_stmts.push(stmt(svelte_template_effect(thunk(svelte_set_text(
                                id("text"),
                                template(vec![quasi(&template_str, true)], vec![]),
                            )))));
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

            // Each block flags:
            // EACH_ITEM_REACTIVE = 1, EACH_INDEX_REACTIVE = 2, EACH_IS_CONTROLLED = 4,
            // EACH_IS_ANIMATED = 8, EACH_ITEM_IMMUTABLE = 16
            // For literal arrays without reactive state, flags should be 0
            // TODO: Calculate flags based on expression metadata (has_state, is_keyed, etc.)
            let flags = 0;

            // $.each(node, flags, () => iterable, $.index, (params) => { body });
            let each_call = svelte_each(
                id("node"),
                flags,
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

    /// Generate each block code inline for cursor-based navigation.
    /// This is called during generate_cursor_based_runtime_code when an EachBlock is encountered.
    fn generate_each_block_inline(
        &mut self,
        anchor_var: &str,
        block: &EachBlock,
        _fragment: &Fragment,
    ) -> Vec<JsStatement> {
        let mut stmts: Vec<JsStatement> = Vec::new();

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
                self.source[ctx_start..ctx_end].trim().to_string()
            } else {
                "$$item".to_string()
            }
        } else {
            "$$item".to_string()
        };

        // Get optional index name
        let index_name = block.index.as_ref().map(|idx| idx.to_string());

        // Analyze body nodes to determine structure
        let body_nodes: Vec<_> = block.body.nodes.iter().collect();

        // Skip leading/trailing whitespace
        let mut start_idx = 0;
        let mut end_idx = body_nodes.len();

        while start_idx < end_idx {
            if let TemplateNode::Text(text) = body_nodes[start_idx]
                && text.data.trim().is_empty()
            {
                start_idx += 1;
                continue;
            }
            break;
        }

        while end_idx > start_idx {
            if let TemplateNode::Text(text) = body_nodes[end_idx - 1]
                && text.data.trim().is_empty()
            {
                end_idx -= 1;
                continue;
            }
            break;
        }

        // Check if body contains elements
        let has_elements = body_nodes[start_idx..end_idx]
            .iter()
            .any(|node| matches!(node, TemplateNode::RegularElement(_)));

        // Build callback parameters
        let mut callback_params: Vec<JsPattern> = vec![id_pattern("$$anchor")];
        callback_params.push(id_pattern(&context_name));
        if let Some(ref idx) = index_name {
            callback_params.push(id_pattern(idx));
        }

        // Generate callback body based on whether body has elements or just text/expressions
        let callback_body = if has_elements {
            // Find the first element and build template for it
            let mut body_stmts: Vec<JsStatement> = Vec::new();

            for node in &body_nodes[start_idx..end_idx] {
                if let TemplateNode::RegularElement(elem) = node {
                    let elem_name = elem.name.as_str();

                    // Build the template HTML
                    let mut template_html = format!("<{}", elem_name);

                    // Add CSS scoping class if present
                    if let Some(ref hash) = self.css_hash {
                        template_html.push_str(&format!(" class=\"{}\"", hash));
                    }

                    // Add static attributes
                    for attr in &elem.attributes {
                        if let Attribute::Attribute(attr_node) = attr {
                            // Skip event handlers and dynamic attributes
                            if attr_node.name.starts_with("on") {
                                continue;
                            }
                            match &attr_node.value {
                                AttributeValue::Sequence(parts)
                                    if parts
                                        .iter()
                                        .all(|p| matches!(p, AttributeValuePart::Text(_))) =>
                                {
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
                                        .push_str(&format!(" {}=\"{}\"", attr_node.name, value));
                                }
                                AttributeValue::True(_) => {
                                    template_html.push_str(&format!(" {}", attr_node.name));
                                }
                                _ => {}
                            }
                        }
                    }

                    // Check if element has expression children (for text placeholder)
                    let has_expressions = elem
                        .fragment
                        .nodes
                        .iter()
                        .any(|n| matches!(n, TemplateNode::ExpressionTag(_)));

                    // Check if all expressions only reference the index variable (non-reactive)
                    // If so, we can use static textContent assignment instead of $.template_effect
                    let expressions_only_index = if has_expressions {
                        if let Some(ref idx_name) = index_name {
                            elem.fragment.nodes.iter().all(|n| {
                                if let TemplateNode::ExpressionTag(tag) = n {
                                    let expr_start = tag.start as usize;
                                    let expr_end = tag.end as usize;
                                    if expr_start + 1 < expr_end && expr_end <= self.source.len() {
                                        let expr = self.source[expr_start + 1..expr_end - 1].trim();
                                        // Check if expression is just the index variable
                                        expr == idx_name
                                    } else {
                                        false
                                    }
                                } else {
                                    true // Text nodes are ok
                                }
                            })
                        } else {
                            false
                        }
                    } else {
                        false
                    };

                    // If expressions only use index variable, no placeholder needed
                    if has_expressions && !expressions_only_index {
                        template_html.push_str("> </");
                    } else {
                        template_html.push_str("></");
                    }
                    template_html.push_str(elem_name);
                    template_html.push('>');

                    // Store the template for later emission
                    self.each_block_counter += 1;
                    let template_var = format!("root_{}", self.each_block_counter);

                    // Store template info for hoisting
                    self.each_blocks.push(EachBlockInfo {
                        template_var: Some(template_var.clone()),
                        template_html: Some(template_html),
                        iterable: iterable.clone(),
                        context_name: Some(context_name.clone()),
                        index_name: index_name.clone(),
                        is_text_only: false,
                        body_expressions: Vec::new(),
                        body_element: Some(elem_name.to_string()),
                        dynamic_attributes: Vec::new(),
                        event_handlers: Vec::new(),
                    });

                    // var p = root_N();
                    body_stmts.push(var_decl(elem_name, Some(call(id(&template_var), vec![]))));

                    // Check for expression children
                    if has_expressions {
                        if expressions_only_index {
                            // Static case: expressions only use index variable
                            // Build template literal from all children: `text ${index} text`
                            let mut quasis_strs: Vec<String> = Vec::new();
                            let mut expressions: Vec<JsExpr> = Vec::new();
                            let mut current_text = String::new();

                            for child in &elem.fragment.nodes {
                                match child {
                                    TemplateNode::Text(text) => {
                                        current_text.push_str(&text.data);
                                    }
                                    TemplateNode::ExpressionTag(tag) => {
                                        // Push accumulated text as quasi
                                        quasis_strs.push(current_text.clone());
                                        current_text.clear();

                                        // Get the expression
                                        let expr_start = tag.start as usize;
                                        let expr_end = tag.end as usize;
                                        if expr_start + 1 < expr_end
                                            && expr_end <= self.source.len()
                                        {
                                            let expr =
                                                self.source[expr_start + 1..expr_end - 1].trim();
                                            expressions.push(id(expr));
                                        }
                                    }
                                    _ => {}
                                }
                            }
                            // Push final text
                            quasis_strs.push(current_text);

                            // Build quasis
                            let quasis: Vec<JsTemplateElement> = quasis_strs
                                .iter()
                                .enumerate()
                                .map(|(i, s)| JsTemplateElement {
                                    raw: s.clone(),
                                    cooked: s.clone(),
                                    tail: i == quasis_strs.len() - 1,
                                })
                                .collect();

                            // p.textContent = `text ${index}`;
                            let template_lit = JsExpr::TemplateLiteral(JsTemplateLiteral {
                                quasis,
                                expressions,
                            });
                            body_stmts.push(stmt(set_text_content(id(elem_name), template_lit)));
                        } else {
                            // Dynamic case: use $.child + $.template_effect
                            // var text = $.child(p, true);
                            body_stmts.push(var_decl(
                                "text",
                                Some(svelte_child(id(elem_name), Some(true))),
                            ));

                            // $.reset(p);
                            body_stmts.push(stmt(svelte_reset(id(elem_name))));

                            // Build template effect for expressions
                            for child in &elem.fragment.nodes {
                                if let TemplateNode::ExpressionTag(tag) = child {
                                    let expr_start = tag.start as usize;
                                    let expr_end = tag.end as usize;
                                    if expr_start + 1 < expr_end && expr_end <= self.source.len() {
                                        let expr = self.source[expr_start + 1..expr_end - 1].trim();
                                        // $.template_effect(() => $.set_text(text, $.get(x)));
                                        let get_call = call(member_path("$.get"), vec![id(expr)]);
                                        body_stmts.push(stmt(svelte_template_effect(thunk(
                                            svelte_set_text(id("text"), get_call),
                                        ))));
                                    }
                                }
                            }
                        }
                    }

                    // $.append($$anchor, p);
                    body_stmts.push(stmt(svelte_append(id("$$anchor"), id(elem_name))));

                    break; // Only process first element
                }
            }

            body_stmts
        } else {
            // Text-only body - collect expressions
            let mut body_expressions = Vec::new();
            for node in &body_nodes[start_idx..end_idx] {
                if let TemplateNode::ExpressionTag(tag) = node {
                    let expr_start = tag.start as usize;
                    let expr_end = tag.end as usize;
                    if expr_start + 1 < expr_end && expr_end <= self.source.len() {
                        let expr = self.source[expr_start + 1..expr_end - 1].trim().to_string();
                        body_expressions.push(expr);
                    }
                } else if let TemplateNode::Text(text) = node {
                    let trimmed = text.data.trim();
                    if !trimmed.is_empty() {
                        body_expressions.push(format!("'{}'", trimmed));
                    }
                }
            }

            let expr_parts: Vec<String> = body_expressions
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
        };

        // Build iterable expression - wrap in thunk
        let iterable_str = if iterable.trim().starts_with('{') {
            format!("({})", iterable)
        } else {
            iterable
        };

        // Calculate flags
        // EACH_ITEM_REACTIVE = 1, EACH_INDEX_REACTIVE = 2, EACH_IS_CONTROLLED = 4,
        // EACH_IS_ANIMATED = 8, EACH_ITEM_IMMUTABLE = 16
        // For literal arrays without reactive state, flags should be 0
        // TODO: Calculate flags based on expression metadata (has_state, is_keyed, etc.)
        let flags = 0;

        // $.each(anchor, flags, () => iterable, $.index, (params) => { body });
        let each_call = svelte_each(
            id(anchor_var),
            flags,
            id(&iterable_str),
            svelte_index(),
            arrow_block(callback_params, callback_body),
        );

        stmts.push(stmt(each_call));

        stmts
    }

    /// Generate if block code inline for cursor-based navigation.
    /// This is called during generate_cursor_based_runtime_code when an IfBlock is encountered.
    fn generate_if_block_inline(&self, anchor_var: &str, block: &IfBlock) -> Vec<JsStatement> {
        let mut stmts: Vec<JsStatement> = Vec::new();

        // Extract the condition expression
        let test_start = block.test.start().unwrap_or(0) as usize;
        let test_end = block.test.end().unwrap_or(0) as usize;
        let condition = if test_end > test_start && test_end <= self.source.len() {
            self.source[test_start..test_end].trim().to_string()
        } else {
            "true".to_string()
        };

        // Build consequent callback
        let consequent_body = self.build_if_branch_body(&block.consequent);
        let consequent_fn = arrow_block(vec![id_pattern("$$anchor")], consequent_body);

        // Build alternate callback if present
        let alternate_fn = if let Some(ref alternate) = block.alternate {
            let alternate_body = self.build_if_branch_body(alternate);
            Some(arrow_block(vec![id_pattern("$$anchor")], alternate_body))
        } else {
            None
        };

        // $.if(anchor, () => condition, ($$anchor) => { ... }, ($$anchor) => { ... })
        let mut if_args = vec![id(anchor_var), thunk(id(&condition)), consequent_fn];

        if let Some(alt_fn) = alternate_fn {
            if_args.push(alt_fn);
        }

        let if_call = call(member_path("$.if"), if_args);
        stmts.push(stmt(if_call));

        stmts
    }

    /// Build the body statements for an if block branch.
    fn build_if_branch_body(&self, fragment: &Fragment) -> Vec<JsStatement> {
        let mut body: Vec<JsStatement> = Vec::new();

        // Skip whitespace
        let nodes: Vec<_> = fragment
            .nodes
            .iter()
            .filter(|n| !matches!(n, TemplateNode::Text(t) if t.data.trim().is_empty()))
            .collect();

        if nodes.is_empty() {
            body.push(stmt(svelte_next(None)));
            return body;
        }

        // Check if we have elements
        let has_elements = nodes
            .iter()
            .any(|n| matches!(n, TemplateNode::RegularElement(_)));

        if has_elements {
            // For now, generate a simple text placeholder for element-based branches
            // Full implementation would generate proper templates
            body.push(stmt(svelte_next(None)));
            body.push(var_decl(
                "text",
                Some(svelte_text(Some(string("TODO: element branch")))),
            ));
            body.push(stmt(svelte_append(id("$$anchor"), id("text"))));
        } else {
            // Text/expression only
            let mut text_parts: Vec<String> = Vec::new();

            for node in &nodes {
                match node {
                    TemplateNode::Text(t) => {
                        let trimmed = t.data.trim();
                        if !trimmed.is_empty() {
                            text_parts.push(trimmed.to_string());
                        }
                    }
                    TemplateNode::ExpressionTag(tag) => {
                        let expr_start = tag.start as usize;
                        let expr_end = tag.end as usize;
                        if expr_start + 1 < expr_end && expr_end <= self.source.len() {
                            let expr = self.source[expr_start + 1..expr_end - 1].trim();
                            text_parts.push(format!("${{{} ?? ''}}", expr));
                        }
                    }
                    _ => {}
                }
            }

            let content = text_parts.join("");
            if content.contains("${") {
                // Has expressions - use template effect
                body.push(stmt(svelte_next(None)));
                body.push(var_decl("text", Some(svelte_text(None))));
                body.push(stmt(svelte_template_effect(thunk(svelte_set_text(
                    id("text"),
                    template(vec![quasi(&content, true)], vec![]),
                )))));
                body.push(stmt(svelte_append(id("$$anchor"), id("text"))));
            } else {
                // Just static text
                body.push(stmt(svelte_next(None)));
                body.push(var_decl("text", Some(svelte_text(Some(string(&content))))));
                body.push(stmt(svelte_append(id("$$anchor"), id("text"))));
            }
        }

        body
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

    /// Generate if block code as AST statements.
    ///
    /// Generates code like:
    /// ```javascript
    /// {
    ///     var consequent = ($$anchor) => {
    ///         var fragment = root_1();
    ///         // ... content processing
    ///         $.append($$anchor, fragment);
    ///     };
    ///
    ///     $.if(node, ($$render) => {
    ///         if (condition) $$render(consequent);
    ///     });
    /// }
    /// ```
    fn generate_if_block_code_ast(&self) -> Vec<JsStatement> {
        self.if_blocks
            .iter()
            .enumerate()
            .flat_map(|(idx, if_block)| {
                let mut block_stmts: Vec<JsStatement> = Vec::new();

                // Generate consequent function
                let consequent_id = format!(
                    "consequent{}",
                    if idx == 0 {
                        "".to_string()
                    } else {
                        format!("_{}", idx)
                    }
                );
                let consequent_body = self.generate_if_branch_body(if_block, true);
                block_stmts.push(var_decl(
                    &consequent_id,
                    Some(arrow_block(vec![id_pattern("$$anchor")], consequent_body)),
                ));

                // Generate alternate function if present
                let alternate_id = if !if_block.alternate_parts.is_empty()
                    || if_block.alternate_template_var.is_some()
                {
                    let alt_id = format!(
                        "alternate{}",
                        if idx == 0 {
                            "".to_string()
                        } else {
                            format!("_{}", idx)
                        }
                    );
                    let alternate_body = self.generate_if_branch_body(if_block, false);
                    block_stmts.push(var_decl(
                        &alt_id,
                        Some(arrow_block(vec![id_pattern("$$anchor")], alternate_body)),
                    ));
                    Some(alt_id)
                } else {
                    None
                };

                // Transform the condition expression (wrap state vars in $.get())
                let transformed_condition = self.transform_if_condition(&if_block.condition);

                // Build the render callback: ($$render) => { if (condition) $$render(consequent); [else $$render(alternate, false)] }
                let render_call_consequent = stmt(call(id("$$render"), vec![id(&consequent_id)]));
                let render_call_alternate = alternate_id
                    .as_ref()
                    .map(|alt_id| stmt(call(id("$$render"), vec![id(alt_id), boolean(false)])));

                let if_statement = if_stmt(
                    raw(&transformed_condition),
                    render_call_consequent,
                    render_call_alternate,
                );

                let render_callback = arrow_block(vec![id_pattern("$$render")], vec![if_statement]);

                // Build $.if() call
                let mut if_args = vec![id("node"), render_callback];

                // Add true for elseif (affects transition behavior)
                if if_block.is_elseif {
                    if_args.push(boolean(true));
                }

                block_stmts.push(stmt(call(member_path("$.if"), if_args)));

                // Wrap in a block statement
                vec![JsStatement::Block(JsBlockStatement { body: block_stmts })]
            })
            .collect()
    }

    /// Generate the body statements for an if block branch (consequent or alternate).
    fn generate_if_branch_body(
        &self,
        if_block: &IfBlockInfo,
        is_consequent: bool,
    ) -> Vec<JsStatement> {
        let parts = if is_consequent {
            &if_block.consequent_parts
        } else {
            &if_block.alternate_parts
        };
        let template_var = if is_consequent {
            &if_block.consequent_template_var
        } else {
            &if_block.alternate_template_var
        };
        let is_text_only = if is_consequent {
            if_block.consequent_text_only
        } else {
            if_block.alternate_text_only
        };

        let mut body: Vec<JsStatement> = Vec::new();

        if let Some(tpl_var) = template_var {
            // Element-based branch
            body.push(var_decl("fragment_1", Some(call(id(tpl_var), vec![]))));

            // Process parts for text updates
            let mut text_idx = 0;
            let mut has_expressions = false;
            let mut template_effect_parts: Vec<(String, String)> = Vec::new();

            for part in parts {
                match part {
                    IfBlockPart::Text(_) => {
                        text_idx += 1;
                    }
                    IfBlockPart::Expression(expr) => {
                        has_expressions = true;
                        let text_var = format!("text_{}", text_idx + 1);
                        let transformed_expr = self.transform_expression_for_template(expr);
                        template_effect_parts.push((text_var, transformed_expr));
                        text_idx += 1;
                    }
                    IfBlockPart::Element { children, .. } => {
                        // Process element children
                        for child in children {
                            match child {
                                IfBlockPart::Expression(expr) => {
                                    has_expressions = true;
                                    let text_var = format!("text_{}", text_idx + 1);
                                    let transformed_expr =
                                        self.transform_expression_for_template(expr);
                                    template_effect_parts.push((text_var, transformed_expr));
                                    text_idx += 1;
                                }
                                IfBlockPart::Text(_) => {
                                    text_idx += 1;
                                }
                                IfBlockPart::Element { .. } | IfBlockPart::NestedIfBlock(_) => {
                                    // Nested elements or if blocks don't affect text indexing
                                }
                            }
                        }
                    }
                    IfBlockPart::NestedIfBlock(_) => {
                        // Nested if blocks are handled separately
                        // They use their own template/comment placeholder
                    }
                }
            }

            // Generate text variable declarations for navigating to text nodes
            if has_expressions && !template_effect_parts.is_empty() {
                // Add navigation: var text_1 = $.first_child(fragment_1)
                let first_text_var = &template_effect_parts[0].0;
                body.push(var_decl(
                    first_text_var,
                    Some(svelte_first_child(id("fragment_1"))),
                ));

                // Add sibling navigation for additional text nodes
                let mut prev_var = first_text_var.clone();
                for (text_var, _) in template_effect_parts.iter().skip(1) {
                    body.push(var_decl(
                        text_var,
                        Some(svelte_sibling(id(&prev_var), Some(2))),
                    ));
                    prev_var = text_var.clone();
                }

                // Generate $.template_effect for updating text
                let effect_body: Vec<JsStatement> = template_effect_parts
                    .iter()
                    .map(|(text_var, expr)| {
                        stmt(svelte_set_text(
                            id(text_var),
                            template(
                                vec![quasi("", false), quasi("", true)],
                                vec![nullish(raw(expr), string(""))],
                            ),
                        ))
                    })
                    .collect();

                body.push(stmt(svelte_template_effect(arrow_block(
                    vec![],
                    effect_body,
                ))));
            }

            body.push(stmt(svelte_append(id("$$anchor"), id("fragment_1"))));
        } else if is_text_only && !parts.is_empty() {
            // Text-only branch
            body.push(var_decl("text", Some(svelte_text(None))));

            // Build template expression from parts
            let mut quasis: Vec<super::js_ast::nodes::JsTemplateElement> = Vec::new();
            let mut expressions: Vec<JsExpr> = Vec::new();

            for (i, part) in parts.iter().enumerate() {
                match part {
                    IfBlockPart::Text(text) => {
                        let is_last = i == parts.len() - 1;
                        quasis.push(quasi(text, is_last && expressions.is_empty()));
                    }
                    IfBlockPart::Expression(expr) => {
                        // Add empty quasi before expression if this is the first part
                        if quasis.is_empty() {
                            quasis.push(quasi("", false));
                        }
                        let transformed = self.transform_expression_for_template(expr);
                        expressions.push(nullish(raw(&transformed), string("")));
                        // Add quasi after expression
                        let is_last = i == parts.len() - 1;
                        quasis.push(quasi("", is_last));
                    }
                    _ => {}
                }
            }

            // If we only have text (no expressions), create a simple set
            if expressions.is_empty() {
                let text_content: String = parts
                    .iter()
                    .filter_map(|p| {
                        if let IfBlockPart::Text(t) = p {
                            Some(t.as_str())
                        } else {
                            None
                        }
                    })
                    .collect::<Vec<_>>()
                    .join(" ");
                body.push(stmt(assign(
                    member(id("text"), "nodeValue"),
                    string(&text_content),
                )));
            } else {
                // Use template effect for reactive updates
                let template_expr = template(quasis, expressions);
                body.push(stmt(svelte_template_effect(arrow(
                    vec![],
                    svelte_set_text(id("text"), template_expr),
                ))));
            }

            body.push(stmt(svelte_append(id("$$anchor"), id("text"))));
        } else if parts.is_empty() {
            // Empty branch - just append a comment or do nothing
            body.push(stmt(svelte_next(None)));
        } else {
            // Branch with only nested blocks (no template var, not text-only)
            // This happens when the branch contains only nested if blocks

            // Check if we have nested if blocks
            let has_nested_blocks = parts
                .iter()
                .any(|p| matches!(p, IfBlockPart::NestedIfBlock(_)));

            if has_nested_blocks {
                // Create a comment fragment to anchor the nested blocks
                body.push(var_decl("fragment_1", Some(svelte_comment())));
                body.push(var_decl(
                    "node_1",
                    Some(svelte_first_child(id("fragment_1"))),
                ));

                // Generate code for each nested if block
                for part in parts {
                    if let IfBlockPart::NestedIfBlock(nested_info) = part {
                        let nested_stmts = self.generate_nested_if_block_code(nested_info);
                        body.extend(nested_stmts);
                    }
                }

                body.push(stmt(svelte_append(id("$$anchor"), id("fragment_1"))));
            } else {
                // No nested blocks, just output $.next()
                body.push(stmt(svelte_next(None)));
            }
        }

        body
    }

    /// Generate code for a nested if block.
    fn generate_nested_if_block_code(&self, nested_info: &IfBlockInfo) -> Vec<JsStatement> {
        let mut block_stmts: Vec<JsStatement> = Vec::new();

        // Generate consequent function for nested block
        let consequent_id = "consequent";
        let consequent_body = self.generate_if_branch_body(nested_info, true);
        block_stmts.push(var_decl(
            consequent_id,
            Some(arrow_block(vec![id_pattern("$$anchor")], consequent_body)),
        ));

        // Generate alternate function if present
        let alternate_id = if !nested_info.alternate_parts.is_empty()
            || nested_info.alternate_template_var.is_some()
        {
            let alt_id = "alternate";
            let alternate_body = self.generate_if_branch_body(nested_info, false);
            block_stmts.push(var_decl(
                alt_id,
                Some(arrow_block(vec![id_pattern("$$anchor")], alternate_body)),
            ));
            Some(alt_id.to_string())
        } else {
            None
        };

        // Transform the condition expression (wrap state vars in $.get())
        let transformed_condition = self.transform_if_condition(&nested_info.condition);

        // Build the render callback
        let render_call_consequent = stmt(call(id("$$render"), vec![id(consequent_id)]));
        let render_call_alternate = alternate_id
            .as_ref()
            .map(|alt_id| stmt(call(id("$$render"), vec![id(alt_id), boolean(false)])));

        let if_statement = if_stmt(
            raw(&transformed_condition),
            render_call_consequent,
            render_call_alternate,
        );

        let render_callback = arrow_block(vec![id_pattern("$$render")], vec![if_statement]);

        // Build $.if() call with node_1 as anchor
        let mut if_args = vec![id("node_1"), render_callback];

        // Add true for elseif (affects transition behavior)
        if nested_info.is_elseif {
            if_args.push(boolean(true));
        }

        block_stmts.push(stmt(call(member_path("$.if"), if_args)));

        // Wrap in a block statement
        vec![JsStatement::Block(JsBlockStatement { body: block_stmts })]
    }

    /// Transform condition expression, wrapping state variables in $.get().
    fn transform_if_condition(&self, condition: &str) -> String {
        let mut result = condition.to_string();

        // Wrap state variables in $.get()
        for var in &self.state_vars {
            // Use word boundary matching to avoid partial replacements
            let pattern = format!(r"\b{}\b", regex::escape(var));
            if let Ok(re) = regex::Regex::new(&pattern) {
                result = re
                    .replace_all(&result, format!("$.get({})", var))
                    .to_string();
            }
        }

        // Wrap derived variables in $.get()
        for var in &self.derived_vars {
            let pattern = format!(r"\b{}\b", regex::escape(var));
            if let Ok(re) = regex::Regex::new(&pattern) {
                result = re
                    .replace_all(&result, format!("$.get({})", var))
                    .to_string();
            }
        }

        result
    }

    /// Transform expression for use in template, wrapping state vars in $.get().
    fn transform_expression_for_template(&self, expr: &str) -> String {
        self.transform_if_condition(expr)
    }

    /// Generate if block code using AST builders and return as string.
    fn generate_if_block_code_via_ast(&self) -> String {
        let statements = self.generate_if_block_code_ast();
        self.statements_to_string(&statements)
    }

    /// Collect all templates from if blocks recursively, including nested if blocks.
    fn collect_all_if_block_templates(&self) -> String {
        let mut templates = Vec::new();
        for if_block in &self.if_blocks {
            self.collect_templates_from_if_block(if_block, &mut templates);
        }
        templates.join("")
    }

    /// Recursively collect templates from a single IfBlockInfo.
    fn collect_templates_from_if_block(&self, if_block: &IfBlockInfo, templates: &mut Vec<String>) {
        // Collect templates from the current if block
        if let (Some(var), Some(html)) = (
            &if_block.consequent_template_var,
            &if_block.consequent_template_html,
        ) {
            templates.push(format!("var {} = $.from_html(`{}`);\n\n", var, html));
        }
        if let (Some(var), Some(html)) = (
            &if_block.alternate_template_var,
            &if_block.alternate_template_html,
        ) {
            templates.push(format!("var {} = $.from_html(`{}`);\n\n", var, html));
        }

        // Recursively collect templates from nested if blocks in consequent_parts
        self.collect_templates_from_parts(&if_block.consequent_parts, templates);

        // Recursively collect templates from nested if blocks in alternate_parts
        self.collect_templates_from_parts(&if_block.alternate_parts, templates);
    }

    /// Recursively collect templates from IfBlockParts (looking for nested if blocks).
    fn collect_templates_from_parts(&self, parts: &[IfBlockPart], templates: &mut Vec<String>) {
        for part in parts {
            match part {
                IfBlockPart::NestedIfBlock(nested) => {
                    self.collect_templates_from_if_block(nested, templates);
                }
                IfBlockPart::Element { children, .. } => {
                    // Also check children of elements for nested if blocks
                    self.collect_templates_from_parts(children, templates);
                }
                _ => {}
            }
        }
    }
}

/// Helper function to check if nodes contain dynamic descendants.
fn has_dynamic_descendants_helper(nodes: &[TemplateNode]) -> bool {
    for node in nodes {
        match node {
            TemplateNode::ExpressionTag(_)
            | TemplateNode::HtmlTag(_)
            | TemplateNode::IfBlock(_)
            | TemplateNode::EachBlock(_)
            | TemplateNode::AwaitBlock(_)
            | TemplateNode::KeyBlock(_)
            | TemplateNode::Component(_)
            | TemplateNode::RenderTag(_) => return true,
            TemplateNode::RegularElement(elem) => {
                // Check for special attributes that need runtime handling
                let has_special = elem.attributes.iter().any(|attr| {
                    matches!(attr, Attribute::BindDirective(_))
                        || matches!(attr, Attribute::ClassDirective(_))
                        || matches!(attr, Attribute::StyleDirective(_))
                        || matches!(attr, Attribute::UseDirective(_))
                        || matches!(attr, Attribute::TransitionDirective(_))
                        || matches!(attr, Attribute::AnimateDirective(_))
                        || matches!(attr, Attribute::OnDirective(_))
                        || matches!(attr, Attribute::Attribute(a) if
                            a.name == "autofocus"
                            || a.name.starts_with("on")
                            || (a.name == "muted" && (elem.name == "source" || elem.name == "video"))
                            || (a.name == "value" && elem.name == "option")
                        )
                });
                let is_custom = elem.name.contains('-');
                let is_input = matches!(elem.name.as_str(), "input" | "textarea" | "select");
                if has_special || is_custom || is_input {
                    return true;
                }
                // Check descendants recursively
                if has_dynamic_descendants_helper(&elem.fragment.nodes) {
                    return true;
                }
            }
            _ => {}
        }
    }
    false
}

/// Check if this component requires hierarchical DOM navigation.
/// This is a heuristic to detect skip-static-subtree patterns.
fn has_nested_dynamic_content(fragment: &Fragment) -> bool {
    // Check for specific patterns that require hierarchical navigation:
    // 1. HtmlTag ({@html ...}) inside an element at any depth
    // 2. Custom elements with attributes inside containers
    // 3. Multiple nested levels of elements with dynamic content
    // 4. Elements with special directives (use:, class:, style:, bind:, etc.)

    fn check_needs_hierarchical(nodes: &[TemplateNode], depth: usize) -> bool {
        for node in nodes {
            match node {
                TemplateNode::HtmlTag(_) => {
                    // {@html} inside an element needs hierarchical nav
                    if depth > 0 {
                        return true;
                    }
                }
                TemplateNode::RegularElement(elem) => {
                    // Check if element has special attributes that need runtime handling
                    let has_event_handlers = elem.attributes.iter().any(
                        |attr| matches!(attr, Attribute::Attribute(a) if a.name.starts_with("on")),
                    );

                    let has_special_directives = elem.attributes.iter().any(|attr| {
                        matches!(
                            attr,
                            Attribute::ClassDirective(_)
                                | Attribute::StyleDirective(_)
                                | Attribute::UseDirective(_)
                                | Attribute::TransitionDirective(_)
                                | Attribute::AnimateDirective(_)
                                | Attribute::OnDirective(_)
                                | Attribute::BindDirective(_)
                        )
                    });

                    let has_child_elements = elem
                        .fragment
                        .nodes
                        .iter()
                        .any(|child| matches!(child, TemplateNode::RegularElement(_)));

                    // If element has special attributes/directives at depth > 0, use hierarchical nav
                    if depth > 0 && (has_event_handlers || has_special_directives) {
                        return true;
                    }

                    // If element has special directives at any depth, use hierarchical nav
                    // (actions, transitions, animations need element references)
                    if has_special_directives {
                        return true;
                    }

                    // If element has event handlers and child elements, use hierarchical nav
                    if has_event_handlers && has_child_elements {
                        return true;
                    }

                    // Check children at increased depth
                    if check_needs_hierarchical(&elem.fragment.nodes, depth + 1) {
                        return true;
                    }
                }
                _ => {}
            }
        }
        false
    }

    check_needs_hierarchical(&fragment.nodes, 0)
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
    if trimmed.starts_with("Math.")
        && let Some(result) = eval_math_expr(trimmed)
    {
        return format!("'{}'", result);
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

/// Normalize whitespace in text content.
///
/// This function normalizes text following the Svelte compiler's whitespace handling:
/// - Trim leading and trailing whitespace
/// - Collapse internal whitespace sequences (newlines, tabs, multiple spaces) into single spaces
///
/// # Arguments
///
/// * `text` - The text content to normalize
///
/// # Returns
///
/// The normalized text with whitespace handled according to Svelte's rules.
fn normalize_text_whitespace(text: &str) -> String {
    // First, trim leading and trailing whitespace
    let trimmed = text.trim();

    // Then collapse internal whitespace sequences to single spaces
    let mut result = String::with_capacity(trimmed.len());
    let mut prev_was_whitespace = false;

    for c in trimmed.chars() {
        if c.is_whitespace() {
            if !prev_was_whitespace {
                result.push(' ');
                prev_was_whitespace = true;
            }
            // Skip additional consecutive whitespace
        } else {
            result.push(c);
            prev_was_whitespace = false;
        }
    }

    result
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
/// `state_vars` are used to wrap state variable references inside $derived() with $.get().
fn transform_client_runes_with_skip_and_state(
    line: &str,
    skip_state_vars: &[String],
    state_vars: &[String],
) -> String {
    let mut result = line.to_string();

    // Transform $state.raw(x) to $.state(x)
    if result.contains("$state.raw(") {
        result = result.replace("$state.raw(", "$.state(");
    }

    // Transform $state.frozen(x) to $.state(x)
    if result.contains("$state.frozen(") {
        result = result.replace("$state.frozen(", "$.state(");
    }

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
    // Also wrap state variables inside the expression with $.get()
    if let Some(pos) = result.find("$derived(")
        && (result[..pos].contains("let ") || result[..pos].contains("const "))
    {
        // Find the content inside $derived(...)
        let derived_start = pos + 9; // after "$derived("
        if let Some(content_end) = find_matching_paren(&result[derived_start..]) {
            let content = &result[derived_start..derived_start + content_end];
            // Wrap in arrow function if not already a function
            let trimmed = content.trim();
            if !trimmed.starts_with("()") && !trimmed.starts_with("function") {
                // Wrap state variables inside the derived expression with $.get()
                let wrapped_content = wrap_state_vars_in_expr(content, state_vars);
                let new_derived = format!("$.derived(() => {})", wrapped_content);
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

    // Transform $effect(x) to $.user_effect(x)
    if result.contains("$effect(") {
        result = result.replace("$effect(", "$.user_effect(");
    }

    // Transform $props() destructuring to $.prop() calls
    // e.g., let { tag = "hr" } = $props(); → let tag = $.prop($$props, 'tag', 3, 'hr');
    if result.contains("$props()")
        && let Some(transformed) = transform_props_destructuring(&result)
    {
        return transformed;
    }

    result
}

/// Backwards compatible wrapper for transform_client_runes_with_skip_and_state without state vars
#[allow(dead_code)]
fn transform_client_runes_with_skip(line: &str, skip_state_vars: &[String]) -> String {
    transform_client_runes_with_skip_and_state(line, skip_state_vars, &[])
}

/// Transform runes for client-side usage.
/// Converts `$state(x)` to `$.state(x)` or `$.proxy(x)`, `$derived(x)` to `$.derived(() => x)`, etc.
fn transform_client_runes(line: &str) -> String {
    transform_client_runes_with_skip_and_state(line, &[], &[])
}

/// Transform `export let x = value` to `let x = $.prop($$props, 'x', 12, value)`.
/// Flag 12 = 8 (writable) + 4 (bindable)
fn transform_export_let(line: &str) -> String {
    let trimmed = line.trim();

    // Pattern: export let name = value; or export let name;
    if !trimmed.starts_with("export let ") {
        return line.to_string();
    }

    let rest = trimmed[11..].trim(); // After "export let "

    // Check for semicolon and remove it for processing
    let rest = rest.trim_end_matches(';').trim();

    // Parse: name = value or just name
    if let Some(eq_pos) = rest.find('=') {
        let name = rest[..eq_pos].trim();
        let value = rest[eq_pos + 1..].trim();
        format!("let {} = $.prop($$props, '{}', 12, {});", name, name, value)
    } else {
        // No default value
        let name = rest;
        format!("let {} = $.prop($$props, '{}', 12);", name, name)
    }
}

/// Transform a reactive statement `if (cond) { body }` to
/// `$.legacy_pre_effect(() => ($.deep_read_state(deps)), () => { ... })`
fn transform_reactive_statement(stmt: &str) -> String {
    let trimmed = stmt.trim();

    // Extract dependencies (variables referenced in the condition/expression)
    let deps = extract_reactive_dependencies(trimmed);

    // Build the dependency expression
    let dep_expr = if deps.is_empty() {
        "".to_string()
    } else {
        deps.iter()
            .map(|d| format!("$.deep_read_state({}())", d))
            .collect::<Vec<_>>()
            .join(", ")
    };

    // Transform the statement body - convert var references to function calls
    let transformed_body = transform_reactive_body(trimmed);

    // Build the $.legacy_pre_effect call
    if deps.is_empty() {
        format!(
            "\t$.legacy_pre_effect(() => {{\n\t\t{}\n\t}});",
            transformed_body
        )
    } else {
        // Note: the dependency expression needs extra parentheses: () => (expr)
        format!(
            "\t$.legacy_pre_effect(() => ({}), () => {{\n\t\t{}\n\t}});",
            dep_expr, transformed_body
        )
    }
}

/// Extract variable dependencies from a reactive statement.
/// For `if (offsetWidth) { toggle = true; }`, returns ["offsetWidth"].
fn extract_reactive_dependencies(stmt: &str) -> Vec<String> {
    let mut deps = Vec::new();

    // Look for the condition in if statements
    if stmt.starts_with("if ") || stmt.starts_with("if(") {
        // Find the condition between ( and )
        if let Some(start) = stmt.find('(') {
            let rest = &stmt[start + 1..];
            if let Some(end) = rest.find(')') {
                let cond = &rest[..end].trim();
                // The condition itself is a dependency
                // For simple cases like `if (offsetWidth)`, the var is the condition
                let var = cond.trim();
                if is_valid_identifier(var) {
                    deps.push(var.to_string());
                }
            }
        }
    }

    deps
}

/// Transform the body of a reactive statement, converting variable references to function calls.
/// For `if (offsetWidth) { toggle = true; }`, returns `if (offsetWidth()) { toggle(true); }`.
fn transform_reactive_body(stmt: &str) -> String {
    let mut result = stmt.to_string();

    // Transform if statement condition: `if (var)` -> `if (var())`
    if (result.starts_with("if ") || result.starts_with("if("))
        && let Some(start) = result.find('(')
    {
        let after_paren = &result[start + 1..];
        if let Some(end) = after_paren.find(')') {
            let cond = after_paren[..end].trim();
            if is_valid_identifier(cond) && !cond.ends_with("()") {
                // Add () to make it a function call
                let new_cond = format!("{}()", cond);
                // Reconstruct: "if (" + new_cond + ")" + rest
                let rest_after_close = &after_paren[end + 1..];
                result = format!("if ({}){}", new_cond, rest_after_close);
            }
        }
    }

    // Transform assignments like `toggle = true` to `toggle(true)`
    // This is a simplified transformation - real implementation needs proper parsing
    result = transform_reactive_assignments(&result);

    result
}

/// Transform assignments in reactive body to function calls.
/// `toggle = true` -> `toggle(true)`
fn transform_reactive_assignments(body: &str) -> String {
    let mut result = body.to_string();

    // Look for patterns like `var = value` and transform to `var(value)`
    // This is a simple regex-like approach
    let re = regex::Regex::new(r"(\w+)\s*=\s*([^;{}]+)").unwrap();

    for cap in re.captures_iter(body) {
        let full_match = cap.get(0).unwrap().as_str();
        let var_name = cap.get(1).unwrap().as_str();
        let value = cap.get(2).unwrap().as_str().trim();

        // Skip if this is a comparison (==, ===, !=, !==)
        if body.contains(&format!("{} ==", var_name))
            || body.contains(&format!("{}==", var_name))
            || body.contains(&format!("{} !=", var_name))
            || body.contains(&format!("{}!=", var_name))
        {
            continue;
        }

        // Skip if already a function call
        if value.is_empty() {
            continue;
        }

        // Transform: var = value -> var(value)
        let replacement = format!("{}({})", var_name, value);
        result = result.replace(full_match, &replacement);
    }

    result
}

/// Count opening and closing braces to track block depth.
fn count_braces(s: &str) -> i32 {
    let open = s.chars().filter(|&c| c == '{').count() as i32;
    let close = s.chars().filter(|&c| c == '}').count() as i32;
    open - close
}

/// Check if a string is a valid JavaScript identifier.
fn is_valid_identifier(s: &str) -> bool {
    if s.is_empty() {
        return false;
    }
    let first = s.chars().next().unwrap();
    if !first.is_alphabetic() && first != '_' && first != '$' {
        return false;
    }
    s.chars()
        .all(|c| c.is_alphanumeric() || c == '_' || c == '$')
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

/// Collect variable names declared with $state() for primitive types only.
/// Object/array state variables use $.proxy() and don't need $.get() wrapping.
fn collect_state_variables(script: &str) -> Vec<String> {
    let mut vars = Vec::new();

    for line in script.lines() {
        let trimmed = line.trim();
        // Match patterns like: let varname = $state(...), $state.raw(...), $state.frozen(...), etc.
        if trimmed.contains("$state(")
            || trimmed.contains("$state.raw(")
            || trimmed.contains("$state.frozen(")
        {
            // Extract variable name between let/const and =
            if let Some(eq_pos) = trimmed.find('=') {
                let before_eq = trimmed[..eq_pos].trim();
                // Get the last word before = (the variable name)
                if let Some(var_name) = before_eq.split_whitespace().last() {
                    // Check if this is an object or array state (uses $.proxy(), not $.state())
                    // Skip these as they don't need $.get() wrapping
                    // Note: $state.raw() and $state.frozen() are always treated as needing $.get() wrapping
                    let state_pos = if let Some(pos) = trimmed.find("$state.raw(") {
                        Some((pos, 11)) // "$state.raw(" is 11 characters
                    } else if let Some(pos) = trimmed.find("$state.frozen(") {
                        Some((pos, 14)) // "$state.frozen(" is 14 characters
                    } else {
                        trimmed.find("$state(").map(|pos| (pos, 7)) // "$state(" is 7 characters
                    };

                    if let Some((pos, offset)) = state_pos {
                        let after_state = &trimmed[pos + offset..];
                        let content_start = after_state.trim_start();
                        // Object literals start with { or [ - these become $.proxy()
                        // But $state.raw() and $state.frozen() are always primitives even if they hold arrays/objects
                        let is_raw_or_frozen =
                            trimmed.contains("$state.raw(") || trimmed.contains("$state.frozen(");
                        if !is_raw_or_frozen
                            && (content_start.starts_with('{') || content_start.starts_with('['))
                        {
                            continue;
                        }
                    }
                    vars.push(var_name.to_string());
                }
            }
        }
    }

    vars
}

/// Collect variable names declared with $state() for object/array types (proxy).
/// These use $.proxy() and are reactive but don't need $.get() wrapping.
fn collect_proxy_state_variables(script: &str) -> Vec<String> {
    let mut vars = Vec::new();

    for line in script.lines() {
        let trimmed = line.trim();
        // Match patterns like: let varname = $state({...}) or let varname = $state([...])
        if trimmed.contains("$state(") {
            // Extract variable name between let/const and =
            if let Some(eq_pos) = trimmed.find('=') {
                let before_eq = trimmed[..eq_pos].trim();
                // Get the last word before = (the variable name)
                if let Some(var_name) = before_eq.split_whitespace().last() {
                    // Check if this is an object or array state (uses $.proxy())
                    if let Some(state_pos) = trimmed.find("$state(") {
                        let after_state = &trimmed[state_pos + 7..]; // after "$state("
                        let content_start = after_state.trim_start();
                        // Object literals start with { or [ - these become $.proxy()
                        if content_start.starts_with('{') || content_start.starts_with('[') {
                            vars.push(var_name.to_string());
                        }
                    }
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
        if (trimmed.starts_with("let ") || trimmed.starts_with("const "))
            && trimmed.contains(" = ")
            && let Some(eq_pos) = trimmed.find(" = ")
        {
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

    vars
}

/// Collect read-only destructured props from script content.
/// These are props that are destructured from $props() without defaults
/// and are not reassigned in the script.
fn collect_read_only_props(script: &str) -> Vec<String> {
    let mut props = Vec::new();

    for line in script.lines() {
        let trimmed = line.trim();

        // Match legacy export let patterns: export let varname = value;
        if let Some(stripped) = trimmed.strip_prefix("export let ") {
            let rest = stripped.trim();
            let rest = rest.trim_end_matches(';').trim();
            // Parse: name = value or just name
            let name = if let Some(eq_pos) = rest.find('=') {
                rest[..eq_pos].trim()
            } else {
                rest
            };
            if !name.is_empty() {
                props.push(name.to_string());
            }
            continue;
        }

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
        if let (Some(brace_start), Some(brace_end)) = (trimmed.find('{'), trimmed.find('}'))
            && brace_end > brace_start
        {
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

/// Collect variable names declared with $derived().
/// These variables need $.get() wrapping when accessed.
fn collect_derived_variables(script: &str) -> Vec<String> {
    let mut vars = Vec::new();

    for line in script.lines() {
        let trimmed = line.trim();

        // Match patterns like: let varname = $derived(...)
        if trimmed.contains("$derived(") {
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
                if body.contains(&compound_pattern)
                    && let Some(eq_pos) = body.find(&compound_pattern)
                {
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

            // Handle simple assignment: count = expr
            let assignment_pattern = format!("{} = ", var);
            if body.contains(&assignment_pattern)
                && let Some(eq_pos) = body.find(&assignment_pattern)
            {
                let value = &body[eq_pos + assignment_pattern.len()..];
                // Transform state vars in the value part
                let transformed_value = transform_state_in_expr(value.trim(), state_vars);
                return format!("{} $.set({}, {}, true)", params, var, transformed_value);
            }
        }
    }

    expr.to_string()
}

/// Transform state variable accesses in an expression.
/// e.g., `plusOne(count)` becomes `plusOne($.get(count))`
/// Also handles simple variable access: `count` becomes `$.get(count)`
/// Also handles expressions like `count === 1` → `$.get(count) === 1`
///
/// NOTE: Does NOT wrap state variables followed by `.` (property access)
/// because object state variables are already reactive proxies.
/// e.g., `counter.count` stays as `counter.count`, not `$.get(counter).count`
fn transform_state_in_expr(expr: &str, state_vars: &[String]) -> String {
    let mut result = expr.to_string();

    for var in state_vars {
        // Use a more robust approach: find all occurrences of the variable
        // that are not part of a larger identifier (word boundaries)
        let mut new_result = String::new();
        let chars: Vec<char> = result.chars().collect();
        let var_chars: Vec<char> = var.chars().collect();
        let mut i = 0;

        while i < chars.len() {
            // Check if we're at the start of the variable name
            if i + var_chars.len() <= chars.len() {
                let potential_match: String = chars[i..i + var_chars.len()].iter().collect();
                if potential_match == *var {
                    // Check if it's a whole word (not part of a larger identifier)
                    let before_ok = i == 0 || !is_identifier_char(chars[i - 1]);
                    let after_ok = i + var_chars.len() >= chars.len()
                        || !is_identifier_char(chars[i + var_chars.len()]);

                    if before_ok && after_ok {
                        // Check if followed by `.` (property access) - don't wrap object states
                        let followed_by_dot =
                            i + var_chars.len() < chars.len() && chars[i + var_chars.len()] == '.';

                        // Check if preceded by `.` (member access) - don't wrap
                        // Pattern: this.a or obj.field - these are property accesses
                        let preceded_by_dot = i > 0 && chars[i - 1] == '.';

                        // Check if already wrapped in $.get()
                        let already_wrapped = if i >= 6 {
                            let prefix: String = chars[i - 6..i].iter().collect();
                            prefix == "$.get("
                        } else {
                            false
                        };

                        // Check if this is the first argument of $.set() - don't wrap
                        // Pattern: $.set(varname, ...) - varname should not be wrapped
                        let in_set_first_arg = if i >= 6 {
                            let prefix: String = chars[i - 6..i].iter().collect();
                            prefix == "$.set("
                        } else {
                            false
                        };

                        if !already_wrapped
                            && !followed_by_dot
                            && !preceded_by_dot
                            && !in_set_first_arg
                        {
                            new_result.push_str(&format!("$.get({})", var));
                            i += var_chars.len();
                            continue;
                        }
                    }
                }
            }
            new_result.push(chars[i]);
            i += 1;
        }

        result = new_result;
    }

    result
}

/// Check if a character can be part of a JavaScript identifier
fn is_identifier_char(c: char) -> bool {
    c.is_alphanumeric() || c == '_' || c == '$'
}

/// Wrap state variable references with $.get() in an expression.
/// This is used for wrapping state vars inside $derived() arrow functions.
/// e.g., `count * 2` becomes `$.get(count) * 2`
fn wrap_state_vars_in_expr(expr: &str, state_vars: &[String]) -> String {
    transform_state_in_expr(expr, state_vars)
}

/// Wrap derived variable reads with $.get() when used (not in declaration).
///
/// This transforms code like:
/// - `console.log('init ' + double)` -> `console.log('init ' + $.get(double))`
///
/// Also wraps state variable reads in contexts like user_effect callbacks.
fn wrap_derived_var_reads(line: &str, derived_vars: &[String], state_vars: &[String]) -> String {
    let mut result = line.to_string();

    // Don't process lines that are state or derived variable declarations
    // (let varname = $.state(...) or let varname = $.derived(...) should not wrap the varname)
    // Check for state variable declarations
    for var in state_vars {
        let declaration_patterns = [
            format!("let {} =", var),
            format!("const {} =", var),
            format!("var {} =", var),
        ];

        if declaration_patterns.iter().any(|p| result.contains(p)) {
            // This is a state declaration line, don't wrap ANY state vars on this line
            return result;
        }
    }

    // Don't process lines that are derived variable declarations
    // (let varname = $.derived(...) should not wrap the varname on the left side)
    for var in derived_vars {
        // Check if this is a declaration of this derived variable
        let declaration_patterns = [
            format!("let {} =", var),
            format!("const {} =", var),
            format!("var {} =", var),
        ];

        let is_declaration = declaration_patterns.iter().any(|p| result.contains(p));

        if is_declaration {
            // For declaration lines, only wrap state vars inside the $.derived() expression
            // (This is already handled by transform_client_runes_with_skip_and_state)
            continue;
        }

        // Wrap this derived variable with $.get()
        result = transform_state_in_expr(&result, std::slice::from_ref(var));
    }

    // Also wrap state variable reads that weren't already wrapped
    // This handles cases inside $.user_effect callbacks
    result = transform_state_in_expr(&result, state_vars);

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

/// Wrap reactive variable reads with $.get() inside $.derived() and $.user_effect().
/// This transforms code like:
/// - `$.derived(() => count * 2)` -> `$.derived(() => $.get(count) * 2)`
/// - `$.user_effect(() => { console.log(count); })` -> `$.user_effect(() => { console.log($.get(count)); })`
#[allow(dead_code)]
fn wrap_reactive_reads_with_get(
    line: &str,
    state_vars: &[String],
    derived_vars: &[String],
) -> String {
    // Only process lines that contain reactive functions
    if !line.contains("$.derived(") && !line.contains("$.user_effect(") {
        return line.to_string();
    }

    let mut result = line.to_string();

    // Combine all reactive variables
    let all_vars: Vec<&String> = state_vars.iter().chain(derived_vars.iter()).collect();

    // For each variable, try to wrap it with $.get()
    for var_name in all_vars {
        // Skip empty variable names
        if var_name.is_empty() {
            continue;
        }

        // Create a regex pattern to match the variable name
        // We need to ensure it's a whole word (not part of another identifier)
        // and not already wrapped with $.get()
        let patterns = vec![
            // Pattern: variable at start of expression or after operator
            format!(r"([\(\s\+\-\*\/\%\&\|\^\<\>\=\!\,\:]){}([^\w])", var_name),
            // Pattern: variable at end of expression or before operator
            format!(r"([^\w]){}([\s\+\-\*\/\%\&\|\^\<\>\=\!\,\)\;\:])", var_name),
        ];

        for _pattern in &patterns {
            // Simple replacement approach: look for the variable name with boundaries
            // This is a simplified implementation that handles common cases
            let search = format!(" {} ", var_name);
            let replace = format!(" $.get({}) ", var_name);
            result = result.replace(&search, &replace);

            let search = format!("({})", var_name);
            let replace = format!("($.get({}))", var_name);
            result = result.replace(&search, &replace);

            let search = format!("({} ", var_name);
            let replace = format!("($.get({}) ", var_name);
            result = result.replace(&search, &replace);

            let search = format!(" {})", var_name);
            let replace = format!(" $.get({}))", var_name);
            result = result.replace(&search, &replace);

            // Handle operators
            for op in &["+", "-", "*", "/", "%", "<", ">", "==", "===", "!=", "!=="] {
                let search = format!("{} {} ", var_name, op);
                let replace = format!("$.get({}) {} ", var_name, op);
                result = result.replace(&search, &replace);

                let search = format!(" {} {}", op, var_name);
                let replace = format!(" {} $.get({})", op, var_name);
                result = result.replace(&search, &replace);
            }
        }
    }

    // Clean up: remove double wrapping if it occurred
    result = result.replace("$.get($.get(", "$.get(");
    result = result.replace(")))", "))");

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
        else if (trimmed.contains("= $derived(") || trimmed.contains("=$derived("))
            && let Some(field) = parse_state_field(trimmed, "$derived")
        {
            fields.push(field);
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

/// Determines if an event should use delegated event handling.
///
/// Delegated events are attached to the document and use event delegation
/// for better performance with many event handlers.
///
/// This list matches Svelte's DELEGATED_EVENTS in src/utils.js.
fn is_delegated_event_name(event_name: &str) -> bool {
    matches!(
        event_name,
        "beforeinput"
            | "click"
            | "change"
            | "dblclick"
            | "contextmenu"
            | "focusin"
            | "focusout"
            | "input"
            | "keydown"
            | "keyup"
            | "mousedown"
            | "mousemove"
            | "mouseout"
            | "mouseover"
            | "mouseup"
            | "pointerdown"
            | "pointermove"
            | "pointerout"
            | "pointerover"
            | "pointerup"
            | "touchend"
            | "touchmove"
            | "touchstart"
    )
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

    #[test]
    fn test_collect_derived_variables() {
        let script = r#"
let count = $state(0);

$effect(() => {
    let double = $derived(count * 2)

    console.log('init ' + double);

    return function() {
        console.log('cleanup ' + double);
    };
})
"#;
        let vars = collect_derived_variables(script);
        assert_eq!(vars, vec!["double"]);
    }

    #[test]
    fn test_collect_state_variables() {
        let script = r#"
let count = $state(0);

$effect(() => {
    let double = $derived(count * 2)
    console.log(count);
})
"#;
        let vars = collect_state_variables(script);
        assert_eq!(vars, vec!["count"]);
    }

    #[test]
    fn test_transform_derived_with_state_wrapping() {
        // Test that $derived wraps state vars with $.get()
        let line = "let double = $derived(count * 2)";
        let state_vars = vec!["count".to_string()];
        let result = transform_client_runes_with_skip_and_state(line, &[], &state_vars);
        assert_eq!(result, "let double = $.derived(() => $.get(count) * 2)");
    }

    #[test]
    fn test_wrap_derived_var_reads() {
        // Test that derived var reads are wrapped with $.get()
        let line = "console.log('init ' + double);";
        let derived_vars = vec!["double".to_string()];
        let state_vars: Vec<String> = vec![];
        let result = wrap_derived_var_reads(line, &derived_vars, &state_vars);
        assert_eq!(result, "console.log('init ' + $.get(double));");
    }

    #[test]
    fn test_is_delegated_event_name() {
        // Delegatable events
        assert!(is_delegated_event_name("click"));
        assert!(is_delegated_event_name("input"));
        assert!(is_delegated_event_name("change"));
        assert!(is_delegated_event_name("keydown"));
        assert!(is_delegated_event_name("keyup"));
        assert!(is_delegated_event_name("mousedown"));
        assert!(is_delegated_event_name("mouseup"));
        assert!(is_delegated_event_name("mousemove"));
        assert!(is_delegated_event_name("mouseover"));
        assert!(is_delegated_event_name("mouseout"));
        assert!(is_delegated_event_name("dblclick"));
        assert!(is_delegated_event_name("contextmenu"));
        assert!(is_delegated_event_name("focusin"));
        assert!(is_delegated_event_name("focusout"));
        assert!(is_delegated_event_name("pointerdown"));
        assert!(is_delegated_event_name("pointerup"));
        assert!(is_delegated_event_name("pointermove"));
        assert!(is_delegated_event_name("pointerover"));
        assert!(is_delegated_event_name("pointerout"));
        assert!(is_delegated_event_name("touchstart"));
        assert!(is_delegated_event_name("touchmove"));
        assert!(is_delegated_event_name("touchend"));
        assert!(is_delegated_event_name("beforeinput"));

        // Non-delegatable events
        assert!(!is_delegated_event_name("scroll"));
        assert!(!is_delegated_event_name("focus"));
        assert!(!is_delegated_event_name("blur"));
        assert!(!is_delegated_event_name("load"));
        assert!(!is_delegated_event_name("resize"));
        assert!(!is_delegated_event_name("submit"));
    }

    #[test]
    fn test_nested_if_block_template_collection() {
        use crate::CompileOptions;
        use crate::compile;

        let source = r#"<script>
	import { slide } from 'svelte/transition';
	let showText = $state(false);
	let show = $state(true);
</script>

<button onclick={() => showText = !showText}>
	Toggle
</button>

{#if showText}
	{#if show}
		<div transition:slide>
			Should not transition out
		</div>
	{/if}
{/if}"#;

        let options = CompileOptions {
            generate: crate::GenerateMode::Client,
            ..Default::default()
        };

        let result = compile(source, options).unwrap();
        let js = result.js.code;

        // Check that nested template is defined (root_1 or root_2)
        assert!(
            js.contains("var root_1 = $.from_html(") || js.contains("var root_2 = $.from_html("),
            "Should have nested if block template. Generated JS:\n{}",
            js
        );
        // Check that the nested template is defined before being used
        let root_1_def = js.find("var root_1");
        let root_1_use = js.find("root_1()");
        if let (Some(def), Some(usage)) = (root_1_def, root_1_use) {
            assert!(
                def < usage,
                "root_1 should be defined before being used. Def at {}, use at {}",
                def,
                usage
            );
        }
    }
}
