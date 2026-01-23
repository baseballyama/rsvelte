//! AST visitors for the analyze phase.
//!
//! Each visitor handles a specific AST node type and performs semantic analysis.
//!
//! Corresponds to Svelte's `2-analyze/visitors/` directory.

// Allow dead code for stub implementations that will be integrated later
#![allow(dead_code)]

pub mod shared;

// Script visitor
mod script;
pub use script::{visit_script, walk_js_node};

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
pub use component::visit as visit_component;
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
use super::types::{ComponentAnalysis, CssDomElement, DomStructure, SiblingCertainty};
use crate::ast::template::{Root, TemplateNode};

/// Context for AST visitor traversal.
/// Corresponds to AnalysisState in the official compiler.
pub struct VisitorContext<'a> {
    /// The current scope.
    pub scope: usize,
    /// The analysis being built.
    pub analysis: &'a mut ComponentAnalysis,
    /// The path of nodes from root to current (Svelte template nodes).
    pub path: Vec<&'a TemplateNode>,
    /// JavaScript AST node path (for expressions in scripts).
    /// This is a stack of serde_json::Value representing JS AST nodes.
    pub js_path: Vec<serde_json::Value>,
    /// Information about the current expression/directive/block value being analyzed.
    /// Set to Some(metadata) when visiting an expression, directive value, or block condition.
    pub expression: Option<*mut crate::ast::template::ExpressionMetadata>,
    /// Parent element name (for validation).
    /// Tag name of parent element. None if parent is svelte:element, #snippet, component or root.
    pub parent_element: Option<String>,
    /// Current function depth.
    pub function_depth: usize,
    /// Depth inside $derived(...) expressions (but not $derived.by(...)) or @const
    pub derived_function_depth: usize,
    /// Whether we have a $props() rune.
    pub has_props_rune: bool,
    /// Current component slots.
    pub component_slots: std::collections::HashSet<String>,
    /// AST type being analyzed ('instance', 'template', or 'module')
    pub ast_type: AstType,
    /// Current reactive statement being analyzed (for legacy mode)
    pub reactive_statement: Option<*mut super::types::ReactiveStatement>,
    /// State fields in the current class (for class body analysis)
    pub state_fields: std::collections::HashMap<String, super::types::StateField>,
    /// Stack of DOM element indices for tracking parent-child relationships.
    pub dom_element_stack: Vec<usize>,
    /// Depth inside regular elements (for placement validation).
    pub element_depth: usize,
    /// Depth inside control flow blocks (for placement validation).
    pub block_depth: usize,
    /// Depth inside component elements (for placement validation).
    pub component_depth: usize,
    /// Whether we've seen svelte:window.
    pub has_svelte_window: bool,
    /// Whether we've seen svelte:body.
    pub has_svelte_body: bool,
    /// Whether we've seen svelte:document.
    pub has_svelte_document: bool,
    /// Whether we've seen svelte:head.
    pub has_svelte_head: bool,
    /// Whether we've seen svelte:options.
    pub has_svelte_options: bool,
    /// First on: directive encountered (name for error message).
    /// Used for mixed_event_handler_syntaxes validation.
    pub event_directive_node: Option<String>,
    /// Whether any event attributes (onclick, etc.) have been used.
    /// Used for mixed_event_handler_syntaxes validation.
    pub uses_event_attributes: bool,
}

/// Type of AST being analyzed.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AstType {
    /// Instance script (<script>)
    Instance,
    /// Template (component body)
    Template,
    /// Module script (<script context="module">)
    Module,
}

impl<'a> VisitorContext<'a> {
    /// Create a new visitor context.
    pub fn new(analysis: &'a mut ComponentAnalysis) -> Self {
        Self {
            scope: 0,
            analysis,
            path: Vec::new(),
            js_path: Vec::new(),
            expression: None,
            parent_element: None,
            function_depth: 0,
            derived_function_depth: 0,
            has_props_rune: false,
            component_slots: std::collections::HashSet::new(),
            ast_type: AstType::Template,
            reactive_statement: None,
            state_fields: std::collections::HashMap::new(),
            dom_element_stack: Vec::new(),
            element_depth: 0,
            block_depth: 0,
            component_depth: 0,
            has_svelte_window: false,
            has_svelte_body: false,
            has_svelte_document: false,
            has_svelte_head: false,
            has_svelte_options: false,
            event_directive_node: None,
            uses_event_attributes: false,
        }
    }

    /// Check if currently inside an element or block (for placement validation).
    pub fn is_inside_element_or_block(&self) -> bool {
        self.element_depth > 0 || self.block_depth > 0 || self.component_depth > 0
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

    /// Emit a warning during analysis.
    pub fn emit_warning(&mut self, warning: super::warnings::AnalysisWarning) {
        self.analysis.warnings.push(warning);
    }

    /// Get the current expression being analyzed.
    ///
    /// Returns a mutable reference to the ExpressionMetadata if we're currently
    /// analyzing an expression, or None otherwise.
    ///
    /// This is used by visitors to track metadata about the current expression,
    /// such as whether it contains calls, state references, or assignments.
    pub fn current_expression(&mut self) -> Option<&mut crate::ast::template::ExpressionMetadata> {
        self.expression.and_then(|ptr| unsafe { ptr.as_mut() })
    }
}

/// Analyze the template portion of the AST.
pub fn analyze_template(
    ast: &mut Root,
    analysis: &mut ComponentAnalysis,
) -> Result<(), AnalysisError> {
    let mut context = VisitorContext::new(analysis);
    fragment::analyze(&mut ast.fragment, &mut context)?;

    // Build sibling relationships for CSS sibling combinator detection
    build_sibling_relationships(&mut context.analysis.css.dom_structure);

    // Check for mixed event handler syntaxes (on:event and onevent mixed)
    if let Some(ref event_name) = context.event_directive_node
        && context.uses_event_attributes
    {
        return Err(super::errors::mixed_event_handler_syntaxes(event_name));
    }

    Ok(())
}

/// Visit a template node and dispatch to the appropriate visitor.
pub fn visit_node(
    node: &mut TemplateNode,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
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

/// Build sibling relationships for CSS sibling combinator detection.
/// This populates possible_prev_adjacent, possible_next_adjacent,
/// possible_prev_general, and possible_next_general fields in CssDomElement.
fn build_sibling_relationships(dom_structure: &mut DomStructure) {
    // Group elements by their parent
    let mut parent_children: std::collections::HashMap<Option<usize>, Vec<usize>> =
        std::collections::HashMap::new();

    for (idx, element) in dom_structure.elements.iter().enumerate() {
        parent_children
            .entry(element.parent_idx)
            .or_default()
            .push(idx);
    }

    // For each parent, build sibling relationships among its children
    for children_indices in parent_children.values() {
        if children_indices.len() < 2 {
            continue; // No siblings if only one child
        }

        // Build adjacent sibling relationships (+ combinator)
        for i in 0..children_indices.len() {
            let current_idx = children_indices[i];

            // Previous adjacent sibling
            if i > 0 {
                let prev_idx = children_indices[i - 1];
                dom_structure.elements[current_idx]
                    .possible_prev_adjacent
                    .push((prev_idx, SiblingCertainty::Definite));
            }

            // Next adjacent sibling
            if i < children_indices.len() - 1 {
                let next_idx = children_indices[i + 1];
                dom_structure.elements[current_idx]
                    .possible_next_adjacent
                    .push((next_idx, SiblingCertainty::Definite));
            }
        }

        // Build general sibling relationships (~ combinator)
        for i in 0..children_indices.len() {
            let current_idx = children_indices[i];

            // All previous siblings
            for &prev_idx in children_indices.iter().take(i) {
                dom_structure.elements[current_idx]
                    .possible_prev_general
                    .push((prev_idx, SiblingCertainty::Definite));
            }

            // All next siblings
            for &next_idx in children_indices.iter().skip(i + 1) {
                dom_structure.elements[current_idx]
                    .possible_next_general
                    .push((next_idx, SiblingCertainty::Definite));
            }
        }
    }
}
