//! Client-side transformation types and context.
//!
//! This module contains the core type definitions for the client-side
//! transformation phase (Phase 3).
//!
//! Corresponds to `ComponentContext` and `ComponentClientTransformState` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/types.js`.

use crate::ast::template::TemplateNode;
use crate::compiler::phases::phase2_analyze::scope::Scope;
use crate::compiler::phases::phase2_analyze::types::ComponentAnalysis;
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
    pub fn visit_node(
        &mut self,
        node: &TemplateNode,
        state_override: Option<&ComponentClientTransformState<'a>>,
    ) -> TransformResult {
        // Use the provided state or the context's state
        let _state = state_override.unwrap_or(&self.state);

        match node {
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
        }
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
        _elem: &crate::ast::template::RegularElement,
    ) -> TransformResult {
        // TODO: Implement regular element transformation
        TransformResult::None
    }

    fn visit_text(&mut self, _text: &crate::ast::template::Text) -> TransformResult {
        // TODO: Implement text node transformation
        TransformResult::None
    }

    fn visit_if_block(&mut self, _if_block: &crate::ast::template::IfBlock) -> TransformResult {
        // TODO: Implement {#if} transformation
        TransformResult::None
    }

    fn visit_each_block(&mut self, _each: &crate::ast::template::EachBlock) -> TransformResult {
        // TODO: Implement {#each} transformation
        TransformResult::None
    }

    fn visit_await_block(
        &mut self,
        _await_block: &crate::ast::template::AwaitBlock,
    ) -> TransformResult {
        // TODO: Implement {#await} transformation
        TransformResult::None
    }

    fn visit_key_block(&mut self, _key: &crate::ast::template::KeyBlock) -> TransformResult {
        // TODO: Implement {#key} transformation
        TransformResult::None
    }

    fn visit_snippet_block(
        &mut self,
        _snippet: &crate::ast::template::SnippetBlock,
    ) -> TransformResult {
        // TODO: Implement {#snippet} transformation
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

    /// Template building state
    pub template: TemplateBuilder,

    /// Initialization statements (run once)
    pub init: Vec<JsStatement>,

    /// Update statements (run on state changes)
    pub update: Vec<JsStatement>,

    /// After-update statements (run after DOM updates)
    pub after_update: Vec<JsStatement>,

    /// Current node being processed (usually an anchor)
    pub node: JsExpr,

    /// Memoizer for expressions
    pub memoizer: Memoizer,

    /// Transform rules for identifiers
    pub transform: HashMap<String, IdentifierTransform>,

    /// Let directives in the current scope
    pub let_directives: Vec<JsExpressionStatement>,

    /// Delegated events
    pub events: HashSet<String>,

    /// Metadata about the component
    pub metadata: ComponentMetadata,
}

impl<'a> ComponentClientTransformState<'a> {
    /// Create a new component client transform state.
    pub fn new(scope: &'a Scope, analysis: &'a ComponentAnalysis, node: JsExpr) -> Self {
        Self {
            scope,
            scopes: HashMap::new(),
            analysis,
            template: TemplateBuilder::new(),
            init: Vec::new(),
            update: Vec::new(),
            after_update: Vec::new(),
            node,
            memoizer: Memoizer::new(),
            transform: HashMap::new(),
            let_directives: Vec::new(),
            events: HashSet::new(),
            metadata: ComponentMetadata::default(),
        }
    }
}

/// Transform rule for an identifier.
#[derive(Debug, Clone)]
pub struct IdentifierTransform {
    /// How to read the identifier
    pub read: Option<fn(JsExpr) -> JsExpr>,

    /// How to assign to the identifier
    pub assign: Option<fn(JsExpr, JsExpr) -> JsExpr>,
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
}

impl ExpressionMetadata {
    /// Create a new expression metadata.
    pub fn new() -> Self {
        Self::default()
    }

    /// Check if the expression has any blocking dependencies.
    pub fn has_blockers(&self) -> bool {
        // TODO: Implement blocker detection
        false
    }
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
