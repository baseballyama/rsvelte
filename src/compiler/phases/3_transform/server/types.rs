//! Server-specific types for code generation.
//!
//! This module contains types used during server-side code generation.

/// A part of the output - either static HTML or dynamic code.
#[derive(Debug, Clone)]
pub enum OutputPart {
    /// Static HTML content
    Html(String),
    /// Dynamic expression that needs escaping
    Expression(String),
    /// Raw HTML expression - {@html expr}
    HtmlExpression(String),
    /// Component invocation
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
        has_prior_content: bool,
        children: Option<Vec<OutputPart>>,
    },
    /// HTML comment marker
    Comment,
    /// Each block - produces a for loop
    EachBlock {
        iterable: String,
        context_name: Option<String>,
        index_name: Option<String>,
        body: Vec<OutputPart>,
    },
    /// svelte:element - dynamic element
    SvelteElement { tag_expr: String },
    /// Option element - produces $$renderer.option() call
    OptionElement {
        attrs: Vec<(String, String)>,
        body: Vec<OutputPart>,
    },
    /// Await block - produces $.await() call
    AwaitBlock { promise: String, then_param: String },
}

/// A snippet definition.
#[derive(Debug, Clone)]
pub struct SnippetDef {
    pub name: String,
    pub params: Vec<String>,
    pub body_parts: Vec<OutputPart>,
}

/// Result of constant folding.
#[derive(Debug, Clone)]
pub enum ConstantFoldResult {
    /// Expression is null/undefined - should be omitted
    Null,
    /// Expression is a constant value (content without quotes)
    Constant(String),
    /// Expression cannot be folded - needs runtime evaluation
    Dynamic,
}
