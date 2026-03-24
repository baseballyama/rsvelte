//! State structures for client-side code generation.
//!
//! This module provides structured state management for the code generator,
//! replacing scattered fields with logical groupings.

#![allow(dead_code)]

use memchr::memmem;
use rustc_hash::FxHashMap;

/// Source context for the component being compiled.
#[derive(Debug)]
pub struct SourceContext {
    /// Component name (derived from filename)
    pub component_name: String,
    /// Original source code
    pub source: String,
    /// Extracted script content
    pub script_content: String,
    /// Whether the component uses runes ($state, $derived, etc.)
    pub uses_runes: bool,
}

impl SourceContext {
    /// Create a new source context.
    pub fn new(
        component_name: String,
        source: String,
        script_content: String,
        uses_runes: bool,
    ) -> Self {
        Self {
            component_name,
            source,
            script_content,
            uses_runes,
        }
    }
}

/// Template building state.
#[derive(Debug, Default)]
pub struct TemplateState {
    /// HTML parts being accumulated
    pub html_parts: Vec<String>,
    /// Whether template contains expressions
    pub has_expressions: bool,
    /// Number of root elements
    pub root_element_count: usize,
    /// Whether template contains custom elements (hyphenated names) or video
    pub has_custom_elements: bool,
}

impl TemplateState {
    /// Create a new template state.
    pub fn new() -> Self {
        Self::default()
    }

    /// Push HTML content to the template.
    pub fn push_html(&mut self, html: &str) {
        self.html_parts.push(html.to_string());
    }

    /// Get the combined HTML template string.
    pub fn get_html(&self) -> String {
        self.html_parts.join("")
    }
}

/// Navigation state for DOM traversal code generation.
#[derive(Debug, Default)]
pub struct NavigationState {
    /// Stack of parent element variable names
    pub element_stack: Vec<String>,
    /// Current child index within parent
    pub current_child_index: usize,
    /// Counter for node variables (anchors, components)
    pub node_var_index: usize,
}

impl NavigationState {
    /// Create a new navigation state.
    pub fn new() -> Self {
        Self::default()
    }

    /// Push an element onto the stack.
    pub fn push_element(&mut self, var_name: String) {
        self.element_stack.push(var_name);
    }

    /// Pop an element from the stack.
    pub fn pop_element(&mut self) -> Option<String> {
        self.element_stack.pop()
    }

    /// Get the current parent element variable name.
    pub fn current_parent(&self) -> Option<&String> {
        self.element_stack.last()
    }

    /// Generate a new node variable name.
    pub fn next_node_var(&mut self) -> String {
        let idx = self.node_var_index;
        self.node_var_index += 1;
        format!("node_{}", idx)
    }

    /// Reset child index.
    pub fn reset_child_index(&mut self) {
        self.current_child_index = 0;
    }

    /// Increment and return child index.
    pub fn next_child_index(&mut self) -> usize {
        let idx = self.current_child_index;
        self.current_child_index += 1;
        idx
    }
}

/// Variable tracking state.
#[derive(Debug, Default)]
pub struct VariableTracker {
    /// Counter for variable names per tag name
    pub var_name_counters: FxHashMap<String, usize>,
    /// State variable names (for $.get() and $.set())
    pub state_vars: Vec<String>,
    /// Constant variables (name -> value) for compile-time evaluation
    pub const_vars: FxHashMap<String, String>,
    /// Read-only destructured props (accessed via $$props.propName)
    pub read_only_props: Vec<String>,
}

impl VariableTracker {
    /// Create a new variable tracker.
    pub fn new() -> Self {
        Self::default()
    }

    /// Initialize with extracted variables from script content.
    pub fn from_script(script_content: &str) -> Self {
        Self {
            var_name_counters: FxHashMap::default(),
            state_vars: collect_state_variables(script_content),
            const_vars: collect_constant_variables(script_content),
            read_only_props: collect_read_only_props(script_content),
        }
    }

    /// Generate a unique variable name for a tag.
    pub fn next_var_name(&mut self, tag: &str) -> String {
        let counter = self.var_name_counters.entry(tag.to_string()).or_insert(0);
        let name = if *counter == 0 {
            tag.to_string()
        } else {
            format!("{}_{}", tag, counter)
        };
        *counter += 1;
        name
    }

    /// Check if a variable is a state variable.
    pub fn is_state_var(&self, name: &str) -> bool {
        self.state_vars.contains(&name.to_string())
    }

    /// Check if a variable is a constant.
    pub fn is_const_var(&self, name: &str) -> bool {
        self.const_vars.contains_key(name)
    }

    /// Get a constant variable's value.
    pub fn get_const_value(&self, name: &str) -> Option<&String> {
        self.const_vars.get(name)
    }

    /// Check if a prop is read-only.
    pub fn is_read_only_prop(&self, name: &str) -> bool {
        self.read_only_props.contains(&name.to_string())
    }
}

/// Collect state variable names from script content.
fn collect_state_variables(script_content: &str) -> Vec<String> {
    let mut state_vars = Vec::new();

    for line in script_content.lines() {
        let trimmed = line.trim();

        // Match patterns like: let x = $state(...) or const x = $state(...)
        if let Some(rest) = trimmed.strip_prefix("let ") {
            if let Some(name) = extract_state_var_name(rest) {
                state_vars.push(name);
            }
        } else if let Some(rest) = trimmed.strip_prefix("const ")
            && let Some(name) = extract_state_var_name(rest)
        {
            state_vars.push(name);
        }
    }

    state_vars
}

/// Extract variable name if initialized with $state().
fn extract_state_var_name(decl: &str) -> Option<String> {
    let parts: Vec<&str> = decl.splitn(2, '=').collect();
    if parts.len() != 2 {
        return None;
    }

    let name = parts[0].trim();
    let value = parts[1].trim();

    if value.starts_with("$state(") {
        Some(name.to_string())
    } else {
        None
    }
}

/// Collect constant variables from script content.
fn collect_constant_variables(script_content: &str) -> FxHashMap<String, String> {
    let mut const_vars = FxHashMap::default();

    for line in script_content.lines() {
        let trimmed = line.trim();

        // Match const declarations that are NOT $state/$derived
        if let Some(rest) = trimmed.strip_prefix("const ")
            && let Some((name, value)) = extract_const_var(rest)
        {
            const_vars.insert(name, value);
        }
    }

    const_vars
}

/// Extract constant variable name and value.
fn extract_const_var(decl: &str) -> Option<(String, String)> {
    let parts: Vec<&str> = decl.splitn(2, '=').collect();
    if parts.len() != 2 {
        return None;
    }

    let name = parts[0].trim().to_string();
    let value = parts[1].trim().trim_end_matches(';').to_string();

    // Skip runes
    if value.starts_with("$state(")
        || value.starts_with("$derived(")
        || value.starts_with("$props(")
    {
        return None;
    }

    Some((name, value))
}

/// Collect read-only destructured props.
fn collect_read_only_props(script_content: &str) -> Vec<String> {
    let mut props = Vec::new();

    for line in script_content.lines() {
        let trimmed = line.trim();

        // Match patterns like: let { prop1, prop2 } = $props()
        if memmem::find(trimmed.as_bytes(), b"$props()").is_some()
            && trimmed.contains('{')
            && let Some(start) = trimmed.find('{')
            && let Some(end) = trimmed.find('}')
        {
            let props_str = &trimmed[start + 1..end];
            for prop in props_str.split(',') {
                let prop = prop.trim();
                // Handle default values: prop = default
                let prop_name = prop.split('=').next().unwrap_or(prop).trim();
                if !prop_name.is_empty() && !prop_name.starts_with("...") {
                    props.push(prop_name.to_string());
                }
            }
        }
    }

    props
}

/// Information about a node that needs runtime code.
#[derive(Debug, Clone)]
pub struct NodeInfo {
    /// Variable name for this node
    pub var_name: String,
    /// Type of node
    pub node_type: NodeType,
    /// Expression code (for expressions and components)
    pub expression: Option<String>,
    /// Child index in parent (for navigation)
    pub child_index: usize,
    /// Event handlers: (event_name, handler_expression, is_directive)
    /// When is_directive is true, the event came from `on:click` syntax and should use $.event()
    /// When is_directive is false, the event came from `onclick` attribute and can use delegation
    pub event_handlers: Vec<(String, String, bool)>,
    /// Bindings: (binding_name, value_expression)
    pub bindings: Vec<(String, String)>,
    /// Whether this is an input element
    pub is_input: bool,
    /// Whether this is a custom element (has hyphen or `is` attribute)
    pub is_custom_element: bool,
    /// Content template for element's text content
    pub content_template: Option<String>,
    /// Whether this element has spread attributes
    pub has_spread: bool,
    /// Spread expressions (for $.attribute_effect)
    pub spread_props: Vec<String>,
    /// All attribute values: (name, value_expression) - includes event handlers when has_spread
    pub attribute_values: Vec<(String, String)>,
}

/// Type of node for code generation.
#[derive(Debug, Clone)]
pub enum NodeType {
    /// DOM element with tag name
    Element(String),
    /// Expression inside an element
    ExpressionInElement,
    /// Component with name
    Component(String),
    /// Anchor node
    Anchor,
    /// Await block
    AwaitBlock,
    /// Expression at root level
    RootExpression,
}

/// Information about an each block.
#[derive(Debug, Clone)]
pub struct EachBlockInfo {
    /// Template variable name (e.g., "root_1")
    pub template_var: Option<String>,
    /// HTML for the template
    pub template_html: Option<String>,
    /// Iterable expression
    pub iterable: String,
    /// Context variable name (the item)
    pub context_name: Option<String>,
    /// Index variable name
    pub index_name: Option<String>,
    /// Whether the body contains only text/expressions (no elements)
    pub is_text_only: bool,
    /// Body expressions for text-only each blocks
    pub body_expressions: Vec<String>,
    /// Body element tag name for element-based each blocks
    pub body_element: Option<String>,
    /// Dynamic attributes to set at runtime
    pub dynamic_attributes: Vec<DynamicAttribute>,
    /// Event handlers to attach
    pub event_handlers: Vec<EventHandler>,
}

/// Dynamic attribute in an each block.
#[derive(Debug, Clone)]
pub struct DynamicAttribute {
    /// Attribute name
    pub name: String,
    /// Expression value
    pub expr: String,
}

/// Event handler in an each block.
#[derive(Debug, Clone)]
pub struct EventHandler {
    /// Event name
    pub event: String,
    /// Handler expression
    pub handler: String,
}

/// Transition information for elements in if blocks.
#[derive(Debug, Clone)]
pub struct TransitionInfo {
    /// Transition flags (TRANSITION_IN | TRANSITION_OUT | TRANSITION_GLOBAL)
    pub flags: u32,
    /// Transition name (e.g., "slide", "fade")
    pub name: String,
    /// Optional expression for transition parameters
    pub expression: Option<String>,
}

/// Information about a svelte:element.
#[derive(Debug, Clone)]
pub struct SvelteElementInfo {
    /// Tag expression
    pub tag_expr: String,
}

/// Information about an {@html} tag.
#[derive(Debug, Clone)]
pub struct HtmlTagInfo {
    /// Expression to render
    pub expression: String,
}

/// Information about a component with bind:this.
#[derive(Debug, Clone)]
pub struct BindThisComponent {
    /// Component name (e.g., "Foo")
    pub component_name: String,
    /// The variable being bound to (e.g., "foo")
    pub bind_var: String,
}

/// A part of component children content.
#[derive(Debug, Clone)]
pub enum ChildPart {
    Text(String),
    Expression(String),
    /// Nested component: (component_name, props_string, nested_children)
    Component(String, String, Vec<ChildPart>),
}

/// Information about a component with children.
#[derive(Debug, Clone)]
pub struct ComponentWithChildren {
    /// Component name (e.g., "Button")
    pub component_name: String,
    /// Props string (comma-separated key: value pairs)
    pub props: String,
    /// Children content parts (text and expressions)
    pub children_parts: Vec<ChildPart>,
}

/// A parameter for a snippet function.
#[derive(Debug, Clone)]
pub struct SnippetParameter {
    /// Parameter name
    pub name: String,
    /// Whether this parameter has a default value
    pub has_default: bool,
}

/// Content part in a snippet body.
#[derive(Debug, Clone)]
pub enum SnippetBodyPart {
    /// Static text
    Text(String),
    /// Expression that needs to be evaluated (parameter name)
    Expression(String),
    /// Element with tag name, template var, template HTML, and children
    Element {
        tag: String,
        template_var: String,
        template_html: String,
        children: Vec<SnippetBodyPart>,
    },
}

/// Information about a snippet.
#[derive(Debug, Clone)]
pub struct SnippetInfo {
    /// Snippet name
    pub name: String,
    /// Snippet parameters (name = $.noop for each)
    pub parameters: Vec<SnippetParameter>,
    /// Template variable name (e.g., "root_1")
    pub template_var: Option<String>,
    /// Template HTML (e.g., "<p> </p>")
    pub template_html: Option<String>,
    /// Body parts for generating dynamic content
    pub body_parts: Vec<SnippetBodyPart>,
    /// Whether the snippet can be hoisted (doesn't reference instance state)
    pub can_hoist: bool,
}

/// Information about a component with value binding for code generation.
#[derive(Debug, Clone)]
pub struct ComponentWithBinding {
    /// Component name (e.g., "TextInput")
    pub component_name: String,
    /// The binding name (e.g., "value")
    pub bind_name: String,
    /// The variable being bound to (e.g., "value")
    pub bind_var: String,
}

/// Information about a standalone component (component as only non-hoisted child).
/// This is used when a component is the only child of a fragment (aside from hoisted nodes
/// like snippets), and has no children itself. In this case, no template wrapper is needed.
#[derive(Debug, Clone)]
pub struct StandaloneComponent {
    /// Component name (e.g., "Counter")
    pub component_name: String,
    /// Props as key-value pairs (name, expression)
    /// For getters, the expression is wrapped in a getter during codegen
    pub props: Vec<(String, String, bool)>, // (name, value, is_reactive)
}

/// Part of an await block content (pending, then, or catch).
#[derive(Debug, Clone)]
pub enum AwaitBlockPart {
    /// Static text
    Text(String),
    /// Expression to evaluate
    Expression(String),
    /// Element template
    Element {
        tag: String,
        template_var: String,
        template_html: String,
        dynamic_attrs: Vec<DynamicAttribute>,
        event_handlers: Vec<EventHandler>,
        children: Vec<AwaitBlockPart>,
    },
}

/// Information about an await block for client-side code generation.
#[derive(Debug, Clone)]
pub struct AwaitBlockInfo {
    /// Promise expression (e.g., "promise")
    pub promise_expr: String,
    /// Then value variable name (e.g., "counter")
    pub then_value: Option<String>,
    /// Catch error variable name (e.g., "error")
    pub catch_value: Option<String>,
    /// Pending block parts (if present)
    pub pending_parts: Vec<AwaitBlockPart>,
    /// Pending block template var (for element content)
    pub pending_template_var: Option<String>,
    /// Pending block template HTML
    pub pending_template_html: Option<String>,
    /// Then block parts (if present)
    pub then_parts: Vec<AwaitBlockPart>,
    /// Then block template var (for element content)
    pub then_template_var: Option<String>,
    /// Then block template HTML
    pub then_template_html: Option<String>,
    /// Catch block parts (if present)
    pub catch_parts: Vec<AwaitBlockPart>,
    /// Catch block template var (for element content)
    pub catch_template_var: Option<String>,
    /// Catch block template HTML
    pub catch_template_html: Option<String>,
    /// Whether the expression is wrapped in $.get() (for derived/state values)
    pub needs_get_wrapper: bool,
}

/// Information about an if block for client-side code generation.
#[derive(Debug, Clone)]
pub struct IfBlockInfo {
    /// The condition expression (e.g., "first || derivedSecond")
    pub condition: String,
    /// Whether this is an elseif (part of a chain)
    pub is_elseif: bool,
    /// Template variable for consequent branch (e.g., "root_1")
    pub consequent_template_var: Option<String>,
    /// HTML for consequent template
    pub consequent_template_html: Option<String>,
    /// Content parts in consequent (for text-based rendering)
    pub consequent_parts: Vec<IfBlockPart>,
    /// Alternate template variable (if there's an else branch)
    pub alternate_template_var: Option<String>,
    /// HTML for alternate template
    pub alternate_template_html: Option<String>,
    /// Content parts in alternate (for text-based rendering)
    pub alternate_parts: Vec<IfBlockPart>,
    /// Whether the consequent is text-only (no elements)
    pub consequent_text_only: bool,
    /// Whether the alternate is text-only (no elements)
    pub alternate_text_only: bool,
}

/// A part of if block content.
#[derive(Debug, Clone)]
pub enum IfBlockPart {
    /// Static text
    Text(String),
    /// Expression to evaluate
    Expression(String),
    /// Element template
    Element {
        tag: String,
        template_var: String,
        template_html: String,
        dynamic_attrs: Vec<DynamicAttribute>,
        event_handlers: Vec<EventHandler>,
        children: Vec<IfBlockPart>,
        transitions: Vec<TransitionInfo>,
    },
    /// Nested if block
    NestedIfBlock(Box<IfBlockInfo>),
}

/// Snippet info for boundary: (params, body_parts, template_var, template_html)
pub type BoundarySnippetInfo = (
    Vec<SnippetParameter>,
    Vec<SnippetBodyPart>,
    Option<String>,
    Option<String>,
);

/// Information about a svelte:boundary for client-side code generation.
#[derive(Debug, Clone)]
pub struct BoundaryInfo {
    /// onerror attribute expression (if present)
    pub onerror: Option<String>,
    /// Whether onerror has state (needs getter)
    pub onerror_has_state: bool,
    /// pending snippet info (if present)
    pub pending_snippet: Option<BoundarySnippetInfo>,
    /// failed snippet info (if present)
    pub failed_snippet: Option<BoundarySnippetInfo>,
    /// Children parts (content inside boundary, excluding pending/failed snippets)
    pub children_parts: Vec<BoundaryChildPart>,
    /// Template vars needed for children (for from_html declarations)
    pub children_template_vars: Vec<(String, String)>,
}

/// A part of boundary children content.
#[derive(Debug, Clone)]
pub enum BoundaryChildPart {
    /// Static text
    Text(String),
    /// Expression to evaluate
    Expression(String),
    /// Component call: (component_name, props_string)
    Component(String, String),
    /// Element with template
    Element {
        tag: String,
        template_var: String,
        template_html: String,
        children: Vec<BoundaryChildPart>,
    },
    /// Const tag declaration
    ConstTag(String),
}

/// Special attribute that needs runtime handling.
#[derive(Debug, Clone)]
pub enum SpecialAttribute {
    /// autofocus attribute - needs $.autofocus(element, true)
    Autofocus {
        /// Variable name of the element
        var_name: String,
    },
    /// muted attribute on source/video - needs element.muted = true
    Muted {
        /// Variable name of the element
        var_name: String,
    },
    /// value attribute on option - needs option.value = option.__value = 'value'
    OptionValue {
        /// Variable name of the option element
        var_name: String,
        /// The value
        value: String,
    },
    /// Attribute on custom element - needs $.set_custom_element_data()
    CustomElementData {
        /// Variable name of the element
        var_name: String,
        /// Attribute name
        attr_name: String,
        /// Attribute value
        attr_value: String,
    },
    /// Expression attribute on custom element - needs $.set_custom_element_data() with expression
    CustomElementDataExpr {
        /// Variable name of the element
        var_name: String,
        /// Attribute name
        attr_name: String,
        /// Expression value (raw JS code)
        expr_value: String,
    },
}

/// Feature collector for various block types.
#[derive(Debug, Default)]
pub struct FeatureCollector {
    /// Collected nodes for runtime code
    pub nodes: Vec<NodeInfo>,
    /// Each blocks
    pub each_blocks: Vec<EachBlockInfo>,
    /// Each block counter
    pub each_block_counter: usize,
    /// Svelte:element blocks
    pub svelte_elements: Vec<SvelteElementInfo>,
    /// {@html} tags
    pub html_tags: Vec<HtmlTagInfo>,
    /// Components with bind:this
    pub bind_this_components: Vec<BindThisComponent>,
    /// Components with children
    pub components_with_children: Vec<ComponentWithChildren>,
    /// Snippets
    pub snippets: Vec<SnippetInfo>,
    /// Components with bindings
    pub components_with_bindings: Vec<ComponentWithBinding>,
    /// Await blocks
    pub await_blocks: Vec<AwaitBlockInfo>,
    /// Boundary blocks
    pub boundaries: Vec<BoundaryInfo>,
    /// Special attributes that need runtime handling
    pub special_attrs: Vec<SpecialAttribute>,
}

impl FeatureCollector {
    /// Create a new feature collector.
    pub fn new() -> Self {
        Self::default()
    }

    /// Add a node.
    pub fn add_node(&mut self, node: NodeInfo) {
        self.nodes.push(node);
    }

    /// Add an each block and return its index.
    pub fn add_each_block(&mut self, block: EachBlockInfo) -> usize {
        let idx = self.each_block_counter;
        self.each_block_counter += 1;
        self.each_blocks.push(block);
        idx
    }

    /// Add a svelte:element.
    pub fn add_svelte_element(&mut self, info: SvelteElementInfo) {
        self.svelte_elements.push(info);
    }

    /// Add an {@html} tag.
    pub fn add_html_tag(&mut self, info: HtmlTagInfo) {
        self.html_tags.push(info);
    }

    /// Add a bind:this component.
    pub fn add_bind_this(&mut self, info: BindThisComponent) {
        self.bind_this_components.push(info);
    }

    /// Add a component with children.
    pub fn add_component_with_children(&mut self, info: ComponentWithChildren) {
        self.components_with_children.push(info);
    }

    /// Add a snippet.
    pub fn add_snippet(&mut self, info: SnippetInfo) {
        self.snippets.push(info);
    }

    /// Add a component with binding.
    pub fn add_component_binding(&mut self, info: ComponentWithBinding) {
        self.components_with_bindings.push(info);
    }

    /// Add an await block.
    pub fn add_await_block(&mut self, info: AwaitBlockInfo) {
        self.await_blocks.push(info);
    }

    /// Add a boundary block.
    pub fn add_boundary(&mut self, info: BoundaryInfo) {
        self.boundaries.push(info);
    }

    /// Check if there are any each blocks.
    pub fn has_each_blocks(&self) -> bool {
        !self.each_blocks.is_empty()
    }

    /// Check if there are any await blocks.
    pub fn has_await_blocks(&self) -> bool {
        !self.await_blocks.is_empty()
    }

    /// Check if there are any boundary blocks.
    pub fn has_boundaries(&self) -> bool {
        !self.boundaries.is_empty()
    }

    /// Add a special attribute.
    pub fn add_special_attr(&mut self, attr: SpecialAttribute) {
        self.special_attrs.push(attr);
    }

    /// Check if there are any special attributes.
    pub fn has_special_attrs(&self) -> bool {
        !self.special_attrs.is_empty()
    }
}

/// Combined transform state for code generation.
#[derive(Debug)]
pub struct TransformState {
    /// Source context
    pub source: SourceContext,
    /// Template building state
    pub template: TemplateState,
    /// Navigation state
    pub navigation: NavigationState,
    /// Variable tracking
    pub variables: VariableTracker,
    /// Feature collection
    pub features: FeatureCollector,
}

impl TransformState {
    /// Create a new transform state.
    pub fn new(
        component_name: String,
        source: String,
        script_content: String,
        uses_runes: bool,
    ) -> Self {
        Self {
            source: SourceContext::new(component_name, source, script_content.clone(), uses_runes),
            template: TemplateState::new(),
            navigation: NavigationState::new(),
            variables: VariableTracker::from_script(&script_content),
            features: FeatureCollector::new(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_collect_state_variables() {
        let script = r#"
            let count = $state(0);
            const name = $state("test");
            let normal = 42;
        "#;
        let vars = collect_state_variables(script);
        assert_eq!(vars, vec!["count", "name"]);
    }

    #[test]
    fn test_collect_constant_variables() {
        let script = r#"
            const PI = 3.14;
            const count = $state(0);
            const NAME = "test";
        "#;
        let vars = collect_constant_variables(script);
        assert_eq!(vars.get("PI"), Some(&"3.14".to_string()));
        assert_eq!(vars.get("NAME"), Some(&"\"test\"".to_string()));
        assert!(!vars.contains_key("count"));
    }

    #[test]
    fn test_collect_read_only_props() {
        let script = r#"
            let { foo, bar = 1 } = $props();
        "#;
        let props = collect_read_only_props(script);
        assert!(props.contains(&"foo".to_string()));
        assert!(props.contains(&"bar".to_string()));
    }

    #[test]
    fn test_variable_tracker() {
        let mut tracker = VariableTracker::new();

        assert_eq!(tracker.next_var_name("div"), "div");
        assert_eq!(tracker.next_var_name("div"), "div_1");
        assert_eq!(tracker.next_var_name("span"), "span");
        assert_eq!(tracker.next_var_name("div"), "div_2");
    }

    #[test]
    fn test_navigation_state() {
        let mut nav = NavigationState::new();

        nav.push_element("root".to_string());
        nav.push_element("child".to_string());
        assert_eq!(nav.current_parent(), Some(&"child".to_string()));

        nav.pop_element();
        assert_eq!(nav.current_parent(), Some(&"root".to_string()));

        assert_eq!(nav.next_child_index(), 0);
        assert_eq!(nav.next_child_index(), 1);
        nav.reset_child_index();
        assert_eq!(nav.next_child_index(), 0);
    }
}
