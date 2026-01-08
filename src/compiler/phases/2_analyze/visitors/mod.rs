//! AST visitors for the analyze phase.
//!
//! Each visitor handles a specific AST node type and performs semantic analysis.
//!
//! Corresponds to Svelte's `2-analyze/visitors/` directory.

// Allow dead code for stub implementations that will be integrated later
#![allow(dead_code)]

pub mod shared;

// Template visitors
mod component;
mod fragment;
mod regular_element;
mod slot_element;
mod svelte_body;
mod svelte_boundary;
mod svelte_component;
mod svelte_document;
mod svelte_element;
mod svelte_fragment;
mod svelte_head;
mod svelte_options;
mod svelte_self;
mod svelte_window;
mod text;
mod title_element;

// Block visitors
mod await_block;
mod each_block;
mod if_block;
mod key_block;
mod snippet_block;

// Tag visitors
mod attach_tag;
mod const_tag;
mod debug_tag;
mod expression_tag;
mod html_tag;
mod render_tag;

// Directive visitors
mod animate_directive;
mod bind_directive;
mod class_directive;
mod let_directive;
mod on_directive;
mod style_directive;
mod transition_directive;
mod use_directive;

// Attribute visitors
mod attribute;
mod spread_attribute;

// JavaScript visitors
mod arrow_function_expression;
mod assignment_expression;
mod await_expression;
mod call_expression;
mod class_body;
mod class_declaration;
mod export_default_declaration;
mod export_named_declaration;
mod export_specifier;
mod expression_statement;
mod function_declaration;
mod function_expression;
mod identifier;
mod import_declaration;
mod labeled_statement;
mod literal;
mod member_expression;
mod new_expression;
mod property_definition;
mod spread_element;
mod tagged_template_expression;
mod template_element;
mod update_expression;
mod variable_declarator;

// Re-exports
pub use await_block::visit_await_block;
pub use component::visit_component;
pub use each_block::visit_each_block;
pub use expression_tag::visit_expression_tag;
pub use fragment::visit_fragment;
pub use if_block::visit_if_block;
pub use key_block::visit_key_block;
pub use regular_element::visit_regular_element;
pub use render_tag::visit_render_tag;
pub use snippet_block::visit_snippet_block;
pub use text::visit_text;

use super::AnalysisError;
use super::types::{ComponentAnalysis, CssDomElement};
use crate::ast::template::{Root, TemplateNode};

/// Context for AST visitor traversal.
pub struct VisitorContext<'a> {
    /// The current scope.
    pub scope: usize,
    /// The analysis being built.
    pub analysis: &'a mut ComponentAnalysis,
    /// The path of nodes from root to current.
    pub path: Vec<&'a TemplateNode>,
    /// Parent element name (for validation).
    pub parent_element: Option<String>,
    /// Current function depth.
    pub function_depth: usize,
    /// Whether we have a $props() rune.
    pub has_props_rune: bool,
    /// Current component slots.
    pub component_slots: std::collections::HashSet<String>,
    /// Stack of DOM element indices for tracking parent-child relationships.
    pub dom_element_stack: Vec<usize>,
}

impl<'a> VisitorContext<'a> {
    /// Create a new visitor context.
    pub fn new(analysis: &'a mut ComponentAnalysis) -> Self {
        Self {
            scope: 0,
            analysis,
            path: Vec::new(),
            parent_element: None,
            function_depth: 0,
            has_props_rune: false,
            component_slots: std::collections::HashSet::new(),
            dom_element_stack: Vec::new(),
        }
    }

    /// Add a DOM element to the structure and return its index.
    pub fn add_dom_element(&mut self, element: CssDomElement) -> usize {
        let idx = self.analysis.css.dom_structure.elements.len();
        self.analysis.css.dom_structure.elements.push(element);
        idx
    }

    /// Get the current parent element index (if any).
    pub fn current_parent_idx(&self) -> Option<usize> {
        self.dom_element_stack.last().copied()
    }
}

/// Analyze the template portion of the AST.
pub fn analyze_template(ast: &Root, analysis: &mut ComponentAnalysis) -> Result<(), AnalysisError> {
    let mut context = VisitorContext::new(analysis);
    fragment::analyze(&ast.fragment, &mut context)?;
    Ok(())
}

/// Visit a template node and dispatch to the appropriate visitor.
pub fn visit_node(node: &TemplateNode, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    match node {
        TemplateNode::Text(text) => text::visit(text, context),
        TemplateNode::RegularElement(element) => regular_element::visit(element, context),
        TemplateNode::Component(component) => component::visit(component, context),
        TemplateNode::SvelteElement(element) => svelte_element::visit(element, context),
        TemplateNode::SvelteComponent(component) => svelte_component::visit(component, context),
        TemplateNode::SvelteSelf(self_) => svelte_self::visit(self_, context),
        TemplateNode::SvelteFragment(fragment) => svelte_fragment::visit(fragment, context),
        TemplateNode::SvelteHead(head) => svelte_head::visit(head, context),
        TemplateNode::SvelteBody(body) => svelte_body::visit(body, context),
        TemplateNode::SvelteWindow(window) => svelte_window::visit(window, context),
        TemplateNode::SvelteDocument(document) => svelte_document::visit(document, context),
        TemplateNode::SvelteBoundary(boundary) => svelte_boundary::visit(boundary, context),
        TemplateNode::SlotElement(slot) => slot_element::visit(slot, context),
        TemplateNode::TitleElement(title) => title_element::visit(title, context),
        TemplateNode::IfBlock(block) => if_block::visit(block, context),
        TemplateNode::EachBlock(block) => each_block::visit(block, context),
        TemplateNode::AwaitBlock(block) => await_block::visit(block, context),
        TemplateNode::KeyBlock(block) => key_block::visit(block, context),
        TemplateNode::SnippetBlock(block) => snippet_block::visit(block, context),
        TemplateNode::ExpressionTag(tag) => expression_tag::visit(tag, context),
        TemplateNode::HtmlTag(tag) => html_tag::visit(tag, context),
        TemplateNode::ConstTag(tag) => const_tag::visit(tag, context),
        TemplateNode::DebugTag(tag) => debug_tag::visit(tag, context),
        TemplateNode::RenderTag(tag) => render_tag::visit(tag, context),
        TemplateNode::AttachTag(tag) => attach_tag::visit(tag, context),
        TemplateNode::SvelteOptions(options) => svelte_options::visit(options, context),
        TemplateNode::Comment(_) => Ok(()), // Comments don't need analysis
    }
}
