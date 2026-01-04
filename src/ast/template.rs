//! Template AST nodes for Svelte components.
//!
//! These types represent the parsed structure of a Svelte component's template.
//! Field ordering follows the principle of largest-first for optimal memory layout.

use compact_str::CompactString;
use serde::{Deserialize, Serialize};

use super::css::StyleSheet;
use super::js::Expression;
use super::span::SourceLocation;

// =============================================================================
// Root
// =============================================================================

/// The root node of a Svelte component AST.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Root {
    #[serde(rename = "type")]
    pub node_type: RootType,
    pub start: u32,
    pub end: u32,
    pub fragment: Fragment,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub options: Option<Box<SvelteOptions>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub css: Option<Box<StyleSheet>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub instance: Option<Box<Script>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub module: Option<Box<Script>>,
    /// JS comments (for modern AST format, represented as empty array)
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub js: Vec<()>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize)]
pub enum RootType {
    #[default]
    Root,
}

// =============================================================================
// Fragment
// =============================================================================

/// A fragment is a container for template nodes.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct Fragment {
    #[serde(rename = "type")]
    pub node_type: FragmentType,
    pub nodes: Vec<TemplateNode>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize)]
pub enum FragmentType {
    #[default]
    Fragment,
}

// =============================================================================
// Template Nodes
// =============================================================================

/// A node in the template AST.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum TemplateNode {
    Text(Text),
    Comment(Comment),
    ExpressionTag(ExpressionTag),
    HtmlTag(HtmlTag),
    ConstTag(ConstTag),
    DebugTag(DebugTag),
    RenderTag(RenderTag),
    AttachTag(AttachTag),
    // Blocks
    IfBlock(IfBlock),
    EachBlock(EachBlock),
    AwaitBlock(AwaitBlock),
    KeyBlock(KeyBlock),
    SnippetBlock(SnippetBlock),
    // Elements
    RegularElement(RegularElement),
    Component(Component),
    TitleElement(TitleElement),
    SlotElement(SlotElement),
    SvelteBody(SvelteElement),
    SvelteComponent(SvelteComponentElement),
    SvelteDocument(SvelteElement),
    SvelteElement(SvelteDynamicElement),
    SvelteFragment(SvelteElement),
    SvelteBoundary(SvelteElement),
    SvelteHead(SvelteElement),
    SvelteOptions(SvelteElement),
    SvelteSelf(SvelteElement),
    SvelteWindow(SvelteElement),
}

// =============================================================================
// Text and Comments
// =============================================================================

/// Static text node.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Text {
    pub start: u32,
    pub end: u32,
    /// The original text with undecoded HTML entities.
    pub raw: CompactString,
    /// Text with decoded HTML entities.
    pub data: CompactString,
}

/// HTML comment node.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Comment {
    pub start: u32,
    pub end: u32,
    /// The contents of the comment.
    pub data: CompactString,
}

// =============================================================================
// Expression Tags
// =============================================================================

/// A reactive template expression: `{expression}`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExpressionTag {
    pub start: u32,
    pub end: u32,
    pub expression: Expression,
}

/// An HTML template expression: `{@html expression}`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HtmlTag {
    pub start: u32,
    pub end: u32,
    pub expression: Expression,
}

/// A const tag: `{@const declaration}`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConstTag {
    pub start: u32,
    pub end: u32,
    pub declaration: Expression,
}

/// A debug tag: `{@debug identifiers}`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DebugTag {
    pub start: u32,
    pub end: u32,
    pub identifiers: Vec<Expression>,
}

/// A render tag: `{@render snippet(...)}`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RenderTag {
    pub start: u32,
    pub end: u32,
    pub expression: Expression,
}

/// An attach tag: `{@attach expression}`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttachTag {
    pub start: u32,
    pub end: u32,
    pub expression: Expression,
}

// =============================================================================
// Block Nodes
// =============================================================================

/// An if block: `{#if condition}...{:else if}...{:else}...{/if}`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IfBlock {
    pub start: u32,
    pub end: u32,
    pub elseif: bool,
    pub test: Expression,
    pub consequent: Fragment,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub alternate: Option<Fragment>,
}

/// An each block: `{#each items as item (key)}...{:else}...{/each}`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EachBlock {
    pub start: u32,
    pub end: u32,
    pub expression: Expression,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub context: Option<Expression>,
    pub body: Fragment,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fallback: Option<Fragment>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub index: Option<CompactString>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub key: Option<Expression>,
}

/// An await block: `{#await promise}...{:then value}...{:catch error}...{/await}`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AwaitBlock {
    pub start: u32,
    pub end: u32,
    pub expression: Expression,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<Expression>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<Expression>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pending: Option<Fragment>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub then: Option<Fragment>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub catch: Option<Fragment>,
}

/// A key block: `{#key expression}...{/key}`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyBlock {
    pub start: u32,
    pub end: u32,
    pub expression: Expression,
    pub fragment: Fragment,
}

/// A snippet block: `{#snippet name(params)}...{/snippet}`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SnippetBlock {
    pub start: u32,
    pub end: u32,
    pub expression: Expression,
    pub parameters: Vec<Expression>,
    pub body: Fragment,
}

// =============================================================================
// Element Nodes
// =============================================================================

/// A regular HTML element.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RegularElement {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name_loc: Option<SourceLocation>,
    pub attributes: Vec<Attribute>,
    pub fragment: Fragment,
}

/// A Svelte component.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Component {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name_loc: Option<SourceLocation>,
    pub attributes: Vec<Attribute>,
    pub fragment: Fragment,
}

/// A title element.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TitleElement {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name_loc: Option<SourceLocation>,
    pub attributes: Vec<Attribute>,
    pub fragment: Fragment,
}

/// A slot element.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SlotElement {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name_loc: Option<SourceLocation>,
    pub attributes: Vec<Attribute>,
    pub fragment: Fragment,
}

/// A svelte: special element (body, document, head, window, fragment, boundary, self).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SvelteElement {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name_loc: Option<SourceLocation>,
    pub attributes: Vec<Attribute>,
    pub fragment: Fragment,
}

/// A svelte:component element.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SvelteComponentElement {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name_loc: Option<SourceLocation>,
    pub attributes: Vec<Attribute>,
    pub fragment: Fragment,
    pub expression: Expression,
}

/// A svelte:element (dynamic element).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SvelteDynamicElement {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name_loc: Option<SourceLocation>,
    pub attributes: Vec<Attribute>,
    pub fragment: Fragment,
    pub tag: Expression,
}

// =============================================================================
// Attributes and Directives
// =============================================================================

/// An attribute or directive on an element.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum Attribute {
    Attribute(AttributeNode),
    SpreadAttribute(SpreadAttribute),
    // Directives
    BindDirective(BindDirective),
    OnDirective(OnDirective),
    ClassDirective(ClassDirective),
    StyleDirective(StyleDirective),
    TransitionDirective(TransitionDirective),
    AnimateDirective(AnimateDirective),
    UseDirective(UseDirective),
    LetDirective(LetDirective),
}

/// A regular attribute: `name="value"` or `name={expression}`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttributeNode {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name_loc: Option<SourceLocation>,
    pub value: AttributeValue,
}

/// The value of an attribute.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum AttributeValue {
    /// Boolean attribute (no value).
    True(bool),
    /// Expression value.
    Expression(ExpressionTag),
    /// Text or mixed content.
    Sequence(Vec<AttributeValuePart>),
}

/// A part of an attribute value (text or expression).
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum AttributeValuePart {
    Text(Text),
    ExpressionTag(ExpressionTag),
}

/// A spread attribute: `{...props}`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpreadAttribute {
    pub start: u32,
    pub end: u32,
    pub expression: Expression,
}

/// A bind directive: `bind:name={expression}`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BindDirective {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name_loc: Option<SourceLocation>,
    pub expression: Expression,
}

/// An on directive: `on:event={handler}`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OnDirective {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name_loc: Option<SourceLocation>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expression: Option<Expression>,
    pub modifiers: Vec<CompactString>,
}

/// A class directive: `class:name={expression}`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClassDirective {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name_loc: Option<SourceLocation>,
    pub expression: Expression,
}

/// A style directive: `style:property={expression}`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StyleDirective {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name_loc: Option<SourceLocation>,
    pub value: AttributeValue,
    pub modifiers: Vec<CompactString>,
}

/// A transition directive: `transition:name`, `in:name`, `out:name`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransitionDirective {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name_loc: Option<SourceLocation>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expression: Option<Expression>,
    pub modifiers: Vec<CompactString>,
    pub intro: bool,
    pub outro: bool,
}

/// An animate directive: `animate:name`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnimateDirective {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name_loc: Option<SourceLocation>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expression: Option<Expression>,
}

/// A use directive: `use:action`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UseDirective {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name_loc: Option<SourceLocation>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expression: Option<Expression>,
}

/// A let directive: `let:item`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LetDirective {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name_loc: Option<SourceLocation>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expression: Option<Expression>,
}

// =============================================================================
// Script and Options
// =============================================================================

/// A script block.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Script {
    pub start: u32,
    pub end: u32,
    pub context: ScriptContext,
    pub content: Expression, // Program
    pub attributes: Vec<AttributeNode>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ScriptContext {
    Default,
    Module,
}

/// Svelte component options from `<svelte:options>`.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct SvelteOptions {
    pub start: u32,
    pub end: u32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub runes: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub immutable: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub accessors: Option<bool>,
    #[serde(rename = "preserveWhitespace", skip_serializing_if = "Option::is_none")]
    pub preserve_whitespace: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub namespace: Option<Namespace>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub css: Option<CssOption>,
    #[serde(rename = "customElement", skip_serializing_if = "Option::is_none")]
    pub custom_element: Option<CustomElementOptions>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub attributes: Vec<AttributeNode>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Namespace {
    Html,
    Svg,
    Mathml,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum CssOption {
    Injected,
}

/// Custom element options.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct CustomElementOptions {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tag: Option<CompactString>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub shadow: Option<ShadowMode>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub props: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub extend: Option<Expression>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ShadowMode {
    Open,
    None,
}
