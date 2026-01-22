//! Client-side transformation types and context.
//!
//! This module contains the core type definitions for the client-side
//! transformation phase (Phase 3).
//!
//! Corresponds to `ComponentContext` and `ComponentClientTransformState` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/types.js`.

use crate::ast::template::TemplateNode;
use crate::compiler::phases::phase2_analyze::scope::{Binding, Scope, ScopeRoot};
use crate::compiler::phases::phase2_analyze::types::ComponentAnalysis;
use crate::compiler::phases::phase3_transform::client::transform_template::Template;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;
use std::collections::{HashMap, HashSet};

/// Component transformation context.
///
/// This contains all the state and methods needed during the
/// transformation process. Corresponds to `ComponentContext` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/types.js`.
#[derive(Debug)]
pub struct ComponentContext<'a> {
    /// The current transformation state
    pub state: ComponentClientTransformState<'a>,

    /// The path of nodes being visited (for parent access)
    pub path: Vec<&'a TemplateNode>,

    /// Visit a node and return the transformed expression/statement
    pub visit:
        fn(&mut Self, &TemplateNode, Option<&ComponentClientTransformState<'a>>) -> TransformResult,
}

impl<'a> ComponentContext<'a> {
    /// Create a new component context.
    pub fn new(
        state: ComponentClientTransformState<'a>,
        visit: fn(
            &mut Self,
            &TemplateNode,
            Option<&ComponentClientTransformState<'a>>,
        ) -> TransformResult,
    ) -> Self {
        Self {
            state,
            path: Vec::new(),
            visit,
        }
    }

    /// Push a node onto the path stack.
    pub fn push_path(&mut self, node: &'a TemplateNode) {
        self.path.push(node);
    }

    /// Pop a node from the path stack.
    pub fn pop_path(&mut self) -> Option<&'a TemplateNode> {
        self.path.pop()
    }

    /// Get the current parent node.
    pub fn current_parent(&self) -> Option<&'a TemplateNode> {
        self.path.last().copied()
    }

    /// Visit a template node and transform it.
    ///
    /// This is the main entry point for visiting nodes during transformation.
    /// When `state_override` is provided, it temporarily replaces the context's
    /// state for the duration of the visit, allowing child visitors to use
    /// the overridden state (e.g., with a different `node` anchor).
    pub fn visit_node(
        &mut self,
        node: &TemplateNode,
        state_override: Option<&ComponentClientTransformState<'a>>,
    ) -> TransformResult {
        // If a state override is provided, temporarily swap it in
        let saved_state = if let Some(override_state) = state_override {
            let saved = std::mem::replace(&mut self.state, override_state.clone());
            Some(saved)
        } else {
            None
        };

        let result = match node {
            TemplateNode::Component(comp) => self.visit_component(comp),

            TemplateNode::SvelteComponent(comp) => self.visit_svelte_component(comp),

            TemplateNode::SvelteSelf(self_node) => self.visit_svelte_self(self_node),

            TemplateNode::ExpressionTag(expr) => self.visit_expression_tag(expr),

            TemplateNode::RegularElement(elem) => self.visit_regular_element(elem),

            TemplateNode::Text(text) => self.visit_text(text),

            TemplateNode::IfBlock(if_block) => self.visit_if_block(if_block),

            TemplateNode::EachBlock(each_block) => self.visit_each_block(each_block),

            TemplateNode::AwaitBlock(await_block) => self.visit_await_block(await_block),

            TemplateNode::KeyBlock(key_block) => self.visit_key_block(key_block),

            TemplateNode::SnippetBlock(snippet) => self.visit_snippet_block(snippet),

            TemplateNode::RenderTag(render) => self.visit_render_tag(render),

            TemplateNode::HtmlTag(html) => self.visit_html_tag(html),

            // Other node types - TODO: implement
            _ => TransformResult::None,
        };

        // Restore the original state if we swapped it
        if let Some(saved) = saved_state {
            self.state = saved;
        }

        result
    }

    // =========================================================================
    // Visitor methods for each node type
    // =========================================================================

    fn visit_component(&mut self, comp: &crate::ast::template::Component) -> TransformResult {
        // Use build_component from the shared utilities
        use crate::compiler::phases::phase3_transform::client::visitors::shared::component::{
            ComponentNode, build_component,
        };

        let component_name = comp.name.to_string();
        let stmt = build_component(ComponentNode::Component(comp.clone()), component_name, self);

        TransformResult::Statement(stmt)
    }

    fn visit_svelte_component(
        &mut self,
        _comp: &crate::ast::template::SvelteComponentElement,
    ) -> TransformResult {
        // TODO: Implement <svelte:component> transformation
        TransformResult::None
    }

    fn visit_svelte_self(
        &mut self,
        _self_node: &crate::ast::template::SvelteElement,
    ) -> TransformResult {
        // TODO: Implement <svelte:self> transformation
        TransformResult::None
    }

    fn visit_expression_tag(
        &mut self,
        _expr: &crate::ast::template::ExpressionTag,
    ) -> TransformResult {
        // TODO: Implement {expression} transformation
        TransformResult::None
    }

    fn visit_regular_element(
        &mut self,
        elem: &crate::ast::template::RegularElement,
    ) -> TransformResult {
        use crate::compiler::phases::phase3_transform::client::visitors::regular_element::visit_regular_element;
        visit_regular_element(elem, self)
    }

    fn visit_text(&mut self, text: &crate::ast::template::Text) -> TransformResult {
        use crate::compiler::phases::phase3_transform::client::visitors::text::visit_text;
        visit_text(text, self)
    }

    fn visit_if_block(&mut self, if_block: &crate::ast::template::IfBlock) -> TransformResult {
        use crate::compiler::phases::phase3_transform::client::visitors::if_block::if_block as visit_if_block_impl;
        visit_if_block_impl(if_block, self);
        TransformResult::None
    }

    fn visit_each_block(&mut self, each: &crate::ast::template::EachBlock) -> TransformResult {
        use crate::compiler::phases::phase3_transform::client::visitors::each_block::each_block as visit_each_block_impl;
        visit_each_block_impl(each, self);
        TransformResult::None
    }

    fn visit_await_block(
        &mut self,
        await_block: &crate::ast::template::AwaitBlock,
    ) -> TransformResult {
        use crate::compiler::phases::phase3_transform::client::visitors::await_block::await_block as visit_await_block_impl;
        visit_await_block_impl(await_block, self);
        TransformResult::None
    }

    fn visit_key_block(&mut self, _key: &crate::ast::template::KeyBlock) -> TransformResult {
        // TODO: Implement {#key} transformation
        TransformResult::None
    }

    fn visit_snippet_block(
        &mut self,
        snippet: &crate::ast::template::SnippetBlock,
    ) -> TransformResult {
        use crate::compiler::phases::phase3_transform::client::visitors::snippet_block::snippet_block as visit_snippet_block_impl;
        visit_snippet_block_impl(snippet, self);
        TransformResult::None
    }

    fn visit_render_tag(&mut self, _render: &crate::ast::template::RenderTag) -> TransformResult {
        // TODO: Implement {@render} transformation
        TransformResult::None
    }

    fn visit_html_tag(&mut self, _html: &crate::ast::template::HtmlTag) -> TransformResult {
        // TODO: Implement {@html} transformation
        TransformResult::None
    }

    pub fn visit_on_directive(
        &mut self,
        on_directive: &crate::ast::template::OnDirective,
    ) -> TransformResult {
        use crate::compiler::phases::phase3_transform::client::visitors::on_directive::on_directive as visit_on_directive_impl;
        let expr = visit_on_directive_impl(on_directive, self);
        TransformResult::Expression(expr)
    }

    /// Visit a BindDirective node.
    ///
    /// This handles bind: directives like bind:value, bind:checked, bind:this, etc.
    pub fn visit_bind_directive(
        &mut self,
        bind_directive: &crate::ast::template::BindDirective,
        parent: Option<&TemplateNode>,
    ) -> TransformResult {
        use crate::compiler::phases::phase3_transform::client::visitors::bind_directive::bind_directive as visit_bind_directive_impl;
        visit_bind_directive_impl(bind_directive, self, parent)
    }
}

/// Result of visiting a node.
#[derive(Debug, Clone)]
pub enum TransformResult {
    /// An expression was produced
    Expression(JsExpr),
    /// A statement was produced
    Statement(JsStatement),
    /// A block statement was produced
    Block(JsBlockStatement),
    /// No output was produced
    None,
}

/// Compile options for transformation.
///
/// Corresponds to `ValidatedCompileOptions` in Svelte's types (simplified).
#[derive(Debug, Clone)]
pub struct TransformOptions {
    /// Development mode
    pub dev: bool,

    /// Fragments mode (html or tree)
    pub fragments: FragmentsMode,

    /// Whether to preserve whitespace
    pub preserve_whitespace: bool,

    /// Whether to preserve comments
    pub preserve_comments: bool,
}

impl Default for TransformOptions {
    fn default() -> Self {
        Self {
            dev: false,
            fragments: FragmentsMode::Html,
            preserve_whitespace: false,
            preserve_comments: false,
        }
    }
}

/// Fragments mode.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FragmentsMode {
    Html,
    Tree,
}

/// Async const declarations.
#[derive(Debug, Clone)]
pub struct AsyncConsts {
    pub id: JsExpr,
    pub thunks: Vec<JsExpr>,
}

/// Client-side transformation state.
///
/// Corresponds to `ComponentClientTransformState` in Svelte's types.
#[derive(Debug, Clone)]
pub struct ComponentClientTransformState<'a> {
    /// Current scope
    pub scope: &'a Scope,

    /// Scopes mapped to their corresponding nodes (for each blocks, etc.)
    pub scopes: HashMap<String, &'a Scope>,

    /// Analysis results
    pub analysis: &'a ComponentAnalysis,

    /// Root scope with all bindings
    pub scope_root: &'a ScopeRoot,

    /// Compile options
    pub options: TransformOptions,

    /// Hoisted statements (declarations that go at the top level)
    pub hoisted: Vec<JsStatement>,

    /// Template building state
    pub template: Template,

    /// Initialization statements (run once)
    pub init: Vec<JsStatement>,

    /// Update statements (run on state changes)
    pub update: Vec<JsStatement>,

    /// After-update statements (run after DOM updates)
    pub after_update: Vec<JsStatement>,

    /// Transformed {@const} declarations
    pub consts: Vec<JsStatement>,

    /// Transformed async {@const} declarations (if any)
    pub async_consts: Option<AsyncConsts>,

    /// Transformed let: directives
    pub let_directives: Vec<JsExpressionStatement>,

    /// Current node being processed (usually an anchor)
    pub node: JsExpr,

    /// Memoizer for expressions
    pub memoizer: Memoizer,

    /// Transform rules for identifiers
    pub transform: HashMap<String, IdentifierTransform>,

    /// Delegated events
    pub events: HashSet<String>,

    /// Metadata about the component
    pub metadata: ComponentMetadata,

    /// Whether we're inside a class constructor
    pub in_constructor: bool,

    /// Whether we're inside a $derived expression
    pub in_derived: bool,

    /// Whether we're in development mode (deprecated, use options.dev)
    pub dev: bool,

    /// State fields in class components (maps field name to field info)
    pub state_fields: HashMap<String, StateField>,

    /// Whether the current context belongs to the instance scope
    pub is_instance: bool,

    /// Imports that should be re-evaluated in legacy mode following a mutation
    pub legacy_reactive_imports: Vec<JsStatement>,

    /// Whether to preserve whitespace (deprecated, use options.preserve_whitespace)
    pub preserve_whitespace: bool,

    /// Snippets hoisted to the instance level (within the component function).
    /// These are snippets that reference instance-level state and can't be hoisted to module level.
    pub instance_level_snippets: Vec<JsStatement>,

    /// Snippets hoisted to the module level (outside the component function).
    /// These are snippets that don't reference instance-level state and can be safely hoisted.
    pub module_level_snippets: Vec<JsStatement>,
}

impl<'a> ComponentClientTransformState<'a> {
    /// Create a new component client transform state.
    pub fn new(
        scope: &'a Scope,
        scope_root: &'a ScopeRoot,
        analysis: &'a ComponentAnalysis,
        node: JsExpr,
    ) -> Self {
        Self {
            scope,
            scopes: HashMap::new(),
            analysis,
            scope_root,
            options: TransformOptions::default(),
            hoisted: Vec::new(),
            template: Template::new(),
            init: Vec::new(),
            update: Vec::new(),
            after_update: Vec::new(),
            consts: Vec::new(),
            async_consts: None,
            let_directives: Vec::new(),
            node,
            memoizer: Memoizer::new(),
            transform: HashMap::new(),
            events: HashSet::new(),
            metadata: ComponentMetadata::default(),
            in_constructor: false,
            in_derived: false,
            dev: false,
            state_fields: HashMap::new(),
            is_instance: false,
            legacy_reactive_imports: Vec::new(),
            preserve_whitespace: false,
            instance_level_snippets: Vec::new(),
            module_level_snippets: Vec::new(),
        }
    }

    /// Get a binding by name from the current scope.
    pub fn get_binding(&self, name: &str) -> Option<&Binding> {
        let index = self.scope.declarations.get(name)?;
        self.scope_root.bindings.get(*index)
    }
}

/// Transform rule for an identifier.
#[derive(Debug, Clone)]
pub struct IdentifierTransform {
    /// How to read the identifier
    pub read: Option<fn(JsExpr) -> JsExpr>,

    /// How to assign to the identifier
    ///
    /// Parameters:
    /// - identifier: The identifier being assigned to
    /// - value: The value being assigned
    /// - needs_proxy: Whether the value needs to be proxified
    pub assign: Option<fn(JsExpr, JsExpr, bool) -> JsExpr>,

    /// How to handle mutations to the identifier
    ///
    /// Parameters:
    /// - identifier: The identifier being mutated
    /// - mutation_expr: The mutation expression (e.g., `obj.prop = value`)
    pub mutate: Option<fn(JsExpr, JsExpr) -> JsExpr>,
}

/// Component metadata.
#[derive(Debug, Default, Clone)]
pub struct ComponentMetadata {
    /// Namespace (html, svg, mathml)
    pub namespace: String,

    /// Whether the element is scoped
    pub scoped: bool,
}

/// Template builder.
///
/// Accumulates HTML template parts during traversal.
#[derive(Debug, Default, Clone)]
pub struct TemplateBuilder {
    /// HTML parts being accumulated
    parts: Vec<String>,

    /// Element stack for tracking open elements
    element_stack: Vec<String>,
}

impl TemplateBuilder {
    /// Create a new template builder.
    pub fn new() -> Self {
        Self::default()
    }

    /// Push an opening element tag.
    pub fn push_element(&mut self, tag: &str, _start: u32) {
        self.parts.push(format!("<{}>", tag));
        self.element_stack.push(tag.to_string());
    }

    /// Pop the last opened element and close it.
    pub fn pop_element(&mut self) {
        if let Some(tag) = self.element_stack.pop() {
            self.parts.push(format!("</{}>", tag));
        }
    }

    /// Push a comment placeholder.
    pub fn push_comment(&mut self) {
        self.parts.push("<!---->".to_string());
    }

    /// Set a property on the current element.
    pub fn set_prop(&mut self, name: &str, value: &str) {
        // This should be called before the element is closed
        if !self.element_stack.is_empty()
            // Insert before the last '>'
            && let Some(last) = self.parts.last_mut()
            && last.ends_with('>')
        {
            last.pop(); // Remove the '>'
            last.push_str(&format!(" {}=\"{}\"", name, value));
            last.push('>');
        }
    }

    /// Get the combined HTML template string.
    pub fn get_html(&self) -> String {
        self.parts.join("")
    }

    /// Push raw HTML content.
    pub fn push_raw(&mut self, html: &str) {
        self.parts.push(html.to_string());
    }
}

/// Memoizer for expressions.
///
/// Tracks expressions that should be memoized to avoid redundant computation.
#[derive(Debug, Default, Clone)]
pub struct Memoizer {
    /// Counter for generating unique memoization variable names
    counter: usize,

    /// Map from expression hash to memoized variable name
    memos: HashMap<String, String>,
}

impl Memoizer {
    /// Create a new memoizer.
    pub fn new() -> Self {
        Self::default()
    }

    /// Add an expression to be memoized.
    ///
    /// # Arguments
    ///
    /// * `expression` - The expression to memoize
    /// * `has_call` - Whether the expression contains a function call
    /// * `has_await` - Whether the expression contains await
    /// * `has_state` - Whether the expression references reactive state
    /// * `force_wrap` - Force wrapping even for simple expressions
    ///
    /// # Returns
    ///
    /// Returns the memoized expression (which might be the original if no memoization is needed).
    pub fn add(
        &mut self,
        expression: JsExpr,
        has_call: bool,
        has_await: bool,
        has_state: bool,
        force_wrap: bool,
    ) -> JsExpr {
        // For now, simple implementation that doesn't actually memoize
        // In full implementation, this would generate $.memoize() calls

        // If the expression is simple and doesn't need memoization, return as-is
        if !has_call && !has_await && !has_state && !force_wrap {
            return expression;
        }

        // TODO: Implement actual memoization logic
        // For now, just return the expression
        expression
    }

    /// Generate a unique identifier with a given base name.
    ///
    /// # Arguments
    ///
    /// * `base` - The base name for the identifier (e.g., "text", "div", "fragment")
    ///
    /// # Returns
    ///
    /// A unique identifier like "text", "text_2", "text_3", etc.
    pub fn generate_id(&mut self, base: &str) -> String {
        self.counter += 1;
        if self.counter == 1 {
            base.to_string()
        } else {
            format!("{}_{}", base, self.counter)
        }
    }

    /// Reset the memoizer state.
    pub fn reset(&mut self) {
        self.counter = 0;
        self.memos.clear();
    }
}

/// Expression metadata for analysis.
///
/// Tracks dependencies, side effects, and other properties
/// needed for transformation.
#[derive(Debug, Clone, Default)]
pub struct ExpressionMetadata {
    /// Whether the expression contains a call
    pub has_call: bool,

    /// Whether the expression contains await
    pub has_await: bool,

    /// Whether the expression references reactive state
    pub has_state: bool,

    /// Whether the expression contains a member expression
    pub has_member_expression: bool,

    /// Whether the expression contains an assignment
    pub has_assignment: bool,

    /// Whether the expression is dynamic (needs reactive tracking)
    pub dynamic: bool,

    /// Blocking dependencies (for async expressions)
    pub blockers: Vec<JsExpr>,
}

impl ExpressionMetadata {
    /// Create a new expression metadata.
    pub fn new() -> Self {
        Self::default()
    }

    /// Check if the expression has any blocking dependencies.
    pub fn has_blockers(&self) -> bool {
        !self.blockers.is_empty()
    }

    /// Check if the expression is async (has await or blockers).
    pub fn is_async(&self) -> bool {
        self.has_await || self.has_blockers()
    }

    /// Get the blocking dependencies as a JS array expression.
    pub fn blockers(&self) -> JsExpr {
        use crate::compiler::phases::phase3_transform::js_ast::builders as b;
        b::array(self.blockers.clone())
    }
}

/// State field in a class component.
///
/// Represents a field declared with $state, $derived, or similar runes.
#[derive(Debug, Clone)]
pub struct StateField {
    /// The AST node where this field is declared
    pub node: JsAssignmentExpression,

    /// The key used to access this field (private or public identifier)
    pub key: JsExpr,

    /// The type of state field ($state, $derived, etc.)
    pub field_type: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_template_builder() {
        let mut builder = TemplateBuilder::new();
        builder.push_element("div", 0);
        builder.push_comment();
        builder.pop_element();

        let html = builder.get_html();
        assert_eq!(html, "<div><!----></div>");
    }

    #[test]
    fn test_memoizer_simple_expression() {
        let mut memoizer = Memoizer::new();
        let expr = JsExpr::Literal(JsLiteral::String("test".to_string()));

        let result = memoizer.add(expr.clone(), false, false, false, false);

        // Should return the same expression for simple cases
        match result {
            JsExpr::Literal(JsLiteral::String(s)) => assert_eq!(s, "test"),
            _ => panic!("Expected string literal"),
        }
    }
}
