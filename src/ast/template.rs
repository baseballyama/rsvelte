//! Template AST nodes for Svelte components.
//!
//! These types represent the parsed structure of a Svelte component's template.
//! Field ordering follows the principle of largest-first for optimal memory layout.

use compact_str::CompactString;
use rustc_hash::FxHashSet;
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
    /// CSS stylesheet, or null if none.
    pub css: Option<Box<StyleSheet>>,
    /// JS comments (for modern AST format, represented as empty array).
    #[serde(default)]
    pub js: Vec<serde_json::Value>,
    pub start: u32,
    pub end: u32,
    #[serde(rename = "type")]
    pub node_type: RootType,
    pub fragment: Fragment,
    /// Component options, or null if none.
    pub options: Option<Box<SvelteOptions>>,
    /// Instance script, serialized only if present.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub instance: Option<Box<Script>>,
    /// Module script, serialized only if present.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub module: Option<Box<Script>>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize)]
pub enum RootType {
    #[default]
    Root,
}

// =============================================================================
// Fragment
// =============================================================================

/// Metadata for fragments.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct FragmentMetadata {
    /// Whether the fragment's scope is transparent (delegates to parent scopes).
    #[serde(default)]
    pub transparent: bool,
    /// Whether we need to traverse into the fragment during mount/hydrate.
    #[serde(default)]
    pub dynamic: bool,
}

/// A fragment is a container for template nodes.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct Fragment {
    #[serde(rename = "type")]
    pub node_type: FragmentType,
    pub nodes: Vec<TemplateNode>,
    /// Fragment metadata (used internally during analysis).
    #[serde(default, skip_serializing_if = "is_default_metadata")]
    pub metadata: FragmentMetadata,
}

fn is_default_metadata(metadata: &FragmentMetadata) -> bool {
    !metadata.transparent && !metadata.dynamic
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
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
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
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
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

/// Metadata for tags (ConstTag, DebugTag).
#[derive(Debug, Clone, Default)]
pub struct TagMetadata {
    /// Expression metadata
    pub expression: ExpressionMetadata,
}

/// A const tag: `{@const declaration}`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConstTag {
    pub start: u32,
    pub end: u32,
    pub declaration: Expression,
    /// Metadata (not serialized)
    #[serde(skip)]
    pub metadata: TagMetadata,
}

/// A debug tag: `{@debug identifiers}`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DebugTag {
    pub start: u32,
    pub end: u32,
    pub identifiers: Vec<Expression>,
    /// Metadata (not serialized)
    #[serde(skip)]
    pub metadata: TagMetadata,
}

/// Metadata for RenderTag nodes.
#[derive(Debug, Clone, Default)]
pub struct RenderTagMetadata {
    /// Path from root to this node (for error reporting)
    pub path: Vec<String>,
    /// Whether this render tag is dynamic (callee is not a simple identifier or resolved snippet)
    pub dynamic: bool,
    /// Snippets that this render tag might call (indices into snippet blocks)
    pub snippets: FxHashSet<usize>,
    /// Expression metadata for the callee
    pub expression: ExpressionMetadata,
    /// Expression metadata for each argument
    pub arguments: Vec<ExpressionMetadata>,
}

/// A render tag: `{@render snippet(...)}`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RenderTag {
    pub start: u32,
    pub end: u32,
    pub expression: Expression,
    /// Metadata (not serialized)
    #[serde(skip)]
    pub metadata: RenderTagMetadata,
}

/// Metadata for AttachTag nodes.
#[derive(Debug, Clone, Default)]
pub struct AttachTagMetadata {
    /// Expression metadata for the expression
    pub expression: ExpressionMetadata,
}

/// An attach tag: `{@attach expression}`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttachTag {
    pub start: u32,
    pub end: u32,
    pub expression: Expression,
    /// Metadata (not serialized)
    #[serde(skip)]
    pub metadata: AttachTagMetadata,
}

// =============================================================================
// Block Nodes
// =============================================================================

/// Metadata for IfBlock nodes.
#[derive(Debug, Clone, Default)]
pub struct IfBlockMetadata {
    /// Expression metadata for the test expression
    pub expression: ExpressionMetadata,
}

/// An if block: `{#if condition}...{:else if}...{:else}...{/if}`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IfBlock {
    pub elseif: bool,
    pub start: u32,
    pub end: u32,
    pub test: Expression,
    pub consequent: Fragment,
    pub alternate: Option<Fragment>,
    /// Metadata (not serialized)
    #[serde(skip)]
    pub metadata: IfBlockMetadata,
}

/// Metadata for EachBlock nodes.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct EachBlockMetadata {
    /// Whether this is a keyed each block
    pub keyed: bool,
    /// Expression metadata for the iterable expression
    pub expression: ExpressionMetadata,
    /// Transitive dependencies (for legacy reactivity)
    pub transitive_deps: FxHashSet<usize>,
    /// Whether the each block is controlled (has explicit key tracking)
    #[serde(default)]
    pub is_controlled: bool,
    /// Whether the each block contains group bindings
    #[serde(default)]
    pub contains_group_binding: bool,
    /// Generated unique index identifier name
    #[serde(skip_serializing_if = "Option::is_none")]
    pub index: Option<String>,
    /// Whether any binding in the each block scope is updated (reassigned or mutated).
    #[serde(default)]
    pub context_mutated: bool,
}

/// An each block: `{#each items as item (key)}...{:else}...{/each}`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EachBlock {
    pub start: u32,
    pub end: u32,
    pub expression: Expression,
    pub body: Fragment,
    /// Context pattern - serializes as null when None (required by tests)
    pub context: Option<Expression>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fallback: Option<Fragment>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub index: Option<CompactString>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub key: Option<Expression>,
    /// Metadata (not serialized)
    #[serde(skip)]
    pub metadata: EachBlockMetadata,
}

/// Metadata for AwaitBlock nodes, populated during Phase 2 analysis.
#[derive(Debug, Clone, Default)]
pub struct AwaitBlockMetadata {
    /// Expression metadata for the promise expression
    pub expression: ExpressionMetadata,
}

/// An await block: `{#await promise}...{:then value}...{:catch error}...{/await}`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AwaitBlock {
    pub start: u32,
    pub end: u32,
    pub expression: Expression,
    pub value: Option<Expression>,
    pub error: Option<Expression>,
    pub pending: Option<Fragment>,
    pub then: Option<Fragment>,
    pub catch: Option<Fragment>,
    /// Metadata (not serialized)
    #[serde(skip)]
    pub metadata: AwaitBlockMetadata,
}

/// Metadata for KeyBlock nodes, populated during Phase 2 analysis.
#[derive(Debug, Clone, Default)]
pub struct KeyBlockMetadata {
    /// Expression metadata
    pub expression: ExpressionMetadata,
}

/// A key block: `{#key expression}...{/key}`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyBlock {
    pub start: u32,
    pub end: u32,
    pub expression: Expression,
    pub fragment: Fragment,
    /// Metadata (not serialized)
    #[serde(skip)]
    pub metadata: KeyBlockMetadata,
}

/// Metadata for SnippetBlock nodes, populated during Phase 2 analysis.
#[derive(Debug, Clone, Default)]
pub struct SnippetBlockMetadata {
    /// Whether this snippet can be hoisted to module level.
    /// A snippet can be hoisted if it doesn't reference any instance-level state.
    pub can_hoist: bool,
    /// The set of components/render tags that could render this snippet,
    /// used for CSS pruning (stored as indices into component/render tag arrays).
    pub sites: FxHashSet<usize>,
}

/// A snippet block: `{#snippet name(params)}...{/snippet}`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SnippetBlock {
    pub start: u32,
    pub end: u32,
    pub expression: Expression,
    #[serde(rename = "typeParams", skip_serializing_if = "Option::is_none")]
    pub type_params: Option<CompactString>,
    pub parameters: Vec<Expression>,
    pub body: Fragment,
    /// Metadata (not serialized)
    #[serde(skip)]
    pub metadata: SnippetBlockMetadata,
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
    /// Metadata populated during analysis (Phase 2)
    #[serde(skip)]
    pub metadata: RegularElementMetadata,
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
    /// Metadata populated during analysis (Phase 2)
    #[serde(skip)]
    pub metadata: ComponentNodeMetadata,
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
    /// Metadata populated during analysis (Phase 2)
    #[serde(skip)]
    pub metadata: SvelteDynamicElementMetadata,
}

// =============================================================================
// Attributes and Directives
// =============================================================================

/// An attribute or directive on an element.
#[derive(Debug, Clone, Deserialize)]
#[serde(untagged)]
pub enum Attribute {
    Attribute(AttributeNode),
    SpreadAttribute(SpreadAttribute),
    AttachTag(AttachTag),
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

impl serde::Serialize for Attribute {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeMap;
        match self {
            Attribute::Attribute(node) => node.serialize(serializer),
            Attribute::SpreadAttribute(spread) => spread.serialize(serializer),
            Attribute::AttachTag(attach) => {
                // AttachTag needs type field when serialized as Attribute
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "AttachTag")?;
                map.serialize_entry("start", &attach.start)?;
                map.serialize_entry("end", &attach.end)?;
                map.serialize_entry("expression", &attach.expression)?;
                map.end()
            }
            Attribute::BindDirective(bind) => bind.serialize(serializer),
            Attribute::OnDirective(on) => on.serialize(serializer),
            Attribute::ClassDirective(class) => class.serialize(serializer),
            Attribute::StyleDirective(style) => style.serialize(serializer),
            Attribute::TransitionDirective(transition) => transition.serialize(serializer),
            Attribute::AnimateDirective(animate) => animate.serialize(serializer),
            Attribute::UseDirective(use_dir) => use_dir.serialize(serializer),
            Attribute::LetDirective(let_dir) => let_dir.serialize(serializer),
        }
    }
}

/// A regular attribute: `name="value"` or `name={expression}`.
#[derive(Debug, Clone, Deserialize)]
pub struct AttributeNode {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name_loc: Option<SourceLocation>,
    pub value: AttributeValue,
}

impl serde::Serialize for AttributeNode {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeMap;
        let mut map = serializer.serialize_map(None)?;
        map.serialize_entry("type", "Attribute")?;
        map.serialize_entry("start", &self.start)?;
        map.serialize_entry("end", &self.end)?;
        map.serialize_entry("name", self.name.as_str())?;
        if let Some(ref name_loc) = self.name_loc {
            map.serialize_entry("name_loc", name_loc)?;
        }
        map.serialize_entry("value", &self.value)?;
        map.end()
    }
}

/// The value of an attribute.
#[derive(Debug, Clone, PartialEq, Deserialize)]
#[serde(untagged)]
pub enum AttributeValue {
    /// Boolean attribute (no value).
    True(bool),
    /// Expression value.
    Expression(ExpressionTag),
    /// Text or mixed content.
    Sequence(Vec<AttributeValuePart>),
}

impl serde::Serialize for AttributeValue {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeMap;
        match self {
            AttributeValue::True(b) => b.serialize(serializer),
            AttributeValue::Expression(expr_tag) => {
                let mut map = serializer.serialize_map(Some(4))?;
                map.serialize_entry("type", "ExpressionTag")?;
                map.serialize_entry("start", &expr_tag.start)?;
                map.serialize_entry("end", &expr_tag.end)?;
                map.serialize_entry("expression", &expr_tag.expression)?;
                map.end()
            }
            AttributeValue::Sequence(parts) => parts.serialize(serializer),
        }
    }
}

/// A part of an attribute value (text or expression).
#[derive(Debug, Clone, PartialEq, Deserialize)]
#[serde(untagged)]
pub enum AttributeValuePart {
    Text(Text),
    ExpressionTag(ExpressionTag),
}

impl serde::Serialize for AttributeValuePart {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeMap;
        match self {
            AttributeValuePart::Text(text) => {
                let mut map = serializer.serialize_map(Some(5))?;
                map.serialize_entry("start", &text.start)?;
                map.serialize_entry("end", &text.end)?;
                map.serialize_entry("type", "Text")?;
                map.serialize_entry("raw", text.raw.as_str())?;
                map.serialize_entry("data", text.data.as_str())?;
                map.end()
            }
            AttributeValuePart::ExpressionTag(expr_tag) => {
                let mut map = serializer.serialize_map(Some(4))?;
                map.serialize_entry("type", "ExpressionTag")?;
                map.serialize_entry("start", &expr_tag.start)?;
                map.serialize_entry("end", &expr_tag.end)?;
                map.serialize_entry("expression", &expr_tag.expression)?;
                map.end()
            }
        }
    }
}

/// A spread attribute: `{...props}`.
#[derive(Debug, Clone, Deserialize)]
pub struct SpreadAttribute {
    pub start: u32,
    pub end: u32,
    pub expression: Expression,
}

impl serde::Serialize for SpreadAttribute {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeMap;
        let mut map = serializer.serialize_map(None)?;
        map.serialize_entry("type", "SpreadAttribute")?;
        map.serialize_entry("start", &self.start)?;
        map.serialize_entry("end", &self.end)?;
        map.serialize_entry("expression", &self.expression)?;
        map.end()
    }
}

/// A bind directive: `bind:name={expression}`.
#[derive(Debug, Clone, Deserialize)]
pub struct BindDirective {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    pub name_loc: Option<SourceLocation>,
    pub expression: Expression,
    pub modifiers: Vec<CompactString>,
}

impl serde::Serialize for BindDirective {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeMap;
        let mut map = serializer.serialize_map(None)?;
        map.serialize_entry("start", &self.start)?;
        map.serialize_entry("end", &self.end)?;
        map.serialize_entry("type", "BindDirective")?;
        map.serialize_entry("name", self.name.as_str())?;
        if let Some(ref name_loc) = self.name_loc {
            map.serialize_entry("name_loc", name_loc)?;
        }
        map.serialize_entry("expression", &self.expression)?;
        map.serialize_entry("modifiers", &self.modifiers)?;
        map.end()
    }
}

/// An on directive: `on:event={handler}`.
#[derive(Debug, Clone, Deserialize)]
pub struct OnDirective {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    pub name_loc: Option<SourceLocation>,
    pub expression: Option<Expression>,
    pub modifiers: Vec<CompactString>,
}

impl serde::Serialize for OnDirective {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeMap;
        let mut map = serializer.serialize_map(None)?;
        map.serialize_entry("type", "OnDirective")?;
        map.serialize_entry("start", &self.start)?;
        map.serialize_entry("end", &self.end)?;
        map.serialize_entry("name", self.name.as_str())?;
        if let Some(ref name_loc) = self.name_loc {
            map.serialize_entry("name_loc", name_loc)?;
        }
        if let Some(ref expression) = self.expression {
            map.serialize_entry("expression", expression)?;
        }
        map.serialize_entry("modifiers", &self.modifiers)?;
        map.end()
    }
}

/// A class directive: `class:name={expression}`.
#[derive(Debug, Clone, Deserialize)]
pub struct ClassDirective {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    pub name_loc: Option<SourceLocation>,
    pub expression: Expression,
}

impl serde::Serialize for ClassDirective {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeMap;
        let mut map = serializer.serialize_map(None)?;
        map.serialize_entry("type", "ClassDirective")?;
        map.serialize_entry("start", &self.start)?;
        map.serialize_entry("end", &self.end)?;
        map.serialize_entry("name", self.name.as_str())?;
        if let Some(ref name_loc) = self.name_loc {
            map.serialize_entry("name_loc", name_loc)?;
        }
        map.serialize_entry("expression", &self.expression)?;
        map.end()
    }
}

/// A style directive: `style:property={expression}`.
#[derive(Debug, Clone, Deserialize)]
pub struct StyleDirective {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    pub name_loc: Option<SourceLocation>,
    pub value: AttributeValue,
    pub modifiers: Vec<CompactString>,
}

impl serde::Serialize for StyleDirective {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeMap;
        let mut map = serializer.serialize_map(None)?;
        map.serialize_entry("type", "StyleDirective")?;
        map.serialize_entry("start", &self.start)?;
        map.serialize_entry("end", &self.end)?;
        map.serialize_entry("name", self.name.as_str())?;
        if let Some(ref name_loc) = self.name_loc {
            map.serialize_entry("name_loc", name_loc)?;
        }
        map.serialize_entry("value", &self.value)?;
        map.serialize_entry("modifiers", &self.modifiers)?;
        map.end()
    }
}

/// A transition directive: `transition:name`, `in:name`, `out:name`.
#[derive(Debug, Clone, Deserialize)]
pub struct TransitionDirective {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    pub name_loc: Option<SourceLocation>,
    pub expression: Option<Expression>,
    pub modifiers: Vec<CompactString>,
    pub intro: bool,
    pub outro: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<DirectiveMetadata>,
}

impl serde::Serialize for TransitionDirective {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeMap;
        let mut map = serializer.serialize_map(None)?;
        map.serialize_entry("type", "TransitionDirective")?;
        map.serialize_entry("start", &self.start)?;
        map.serialize_entry("end", &self.end)?;
        map.serialize_entry("name", self.name.as_str())?;
        if let Some(ref name_loc) = self.name_loc {
            map.serialize_entry("name_loc", name_loc)?;
        }
        if let Some(ref expression) = self.expression {
            map.serialize_entry("expression", expression)?;
        }
        map.serialize_entry("modifiers", &self.modifiers)?;
        map.serialize_entry("intro", &self.intro)?;
        map.serialize_entry("outro", &self.outro)?;
        if let Some(ref metadata) = self.metadata {
            map.serialize_entry("metadata", metadata)?;
        }
        map.end()
    }
}

/// Metadata for directives (animate, transition, etc.).
///
/// Contains information about the directive's expression dependencies.
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct DirectiveMetadata {
    /// Expression metadata (dependencies, blockers, etc.)
    pub expression: DirectiveExpressionMetadata,
}

/// Expression metadata for directives.
#[derive(Debug, Clone, Deserialize, Serialize, Default)]
pub struct DirectiveExpressionMetadata {
    /// Whether the expression contains await
    #[serde(default)]
    pub has_await: bool,
    /// Blocking dependencies (for async expressions)
    #[serde(default)]
    pub blockers: Vec<Expression>,
}

impl DirectiveExpressionMetadata {
    /// Check if the expression is async (has await or blockers).
    pub fn is_async(&self) -> bool {
        self.has_await || !self.blockers.is_empty()
    }

    /// Get the blocking dependencies.
    pub fn blockers(&self) -> &[Expression] {
        &self.blockers
    }
}

/// An animate directive: `animate:name`.
#[derive(Debug, Clone, Deserialize)]
pub struct AnimateDirective {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    pub name_loc: Option<SourceLocation>,
    pub expression: Option<Expression>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<DirectiveMetadata>,
}

impl serde::Serialize for AnimateDirective {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeMap;
        let mut map = serializer.serialize_map(None)?;
        map.serialize_entry("type", "AnimateDirective")?;
        map.serialize_entry("start", &self.start)?;
        map.serialize_entry("end", &self.end)?;
        map.serialize_entry("name", self.name.as_str())?;
        if let Some(ref name_loc) = self.name_loc {
            map.serialize_entry("name_loc", name_loc)?;
        }
        if let Some(ref expression) = self.expression {
            map.serialize_entry("expression", expression)?;
        }
        if let Some(ref metadata) = self.metadata {
            map.serialize_entry("metadata", metadata)?;
        }
        map.end()
    }
}

/// A use directive: `use:action`.
#[derive(Debug, Clone, Deserialize)]
pub struct UseDirective {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    pub name_loc: Option<SourceLocation>,
    pub expression: Option<Expression>,
}

impl serde::Serialize for UseDirective {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeMap;
        let mut map = serializer.serialize_map(None)?;
        map.serialize_entry("type", "UseDirective")?;
        map.serialize_entry("start", &self.start)?;
        map.serialize_entry("end", &self.end)?;
        map.serialize_entry("name", self.name.as_str())?;
        if let Some(ref name_loc) = self.name_loc {
            map.serialize_entry("name_loc", name_loc)?;
        }
        if let Some(ref expression) = self.expression {
            map.serialize_entry("expression", expression)?;
        }
        map.end()
    }
}

/// A let directive: `let:item`.
#[derive(Debug, Clone, Deserialize)]
pub struct LetDirective {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    pub name_loc: Option<SourceLocation>,
    pub expression: Option<Expression>,
}

impl serde::Serialize for LetDirective {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeMap;
        let mut map = serializer.serialize_map(None)?;
        map.serialize_entry("type", "LetDirective")?;
        map.serialize_entry("start", &self.start)?;
        map.serialize_entry("end", &self.end)?;
        map.serialize_entry("name", self.name.as_str())?;
        if let Some(ref name_loc) = self.name_loc {
            map.serialize_entry("name_loc", name_loc)?;
        }
        if let Some(ref expression) = self.expression {
            map.serialize_entry("expression", expression)?;
        }
        map.end()
    }
}

// =============================================================================
// Script and Options
// =============================================================================

/// A script block.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Script {
    #[serde(rename = "type")]
    pub node_type: ScriptType,
    pub start: u32,
    pub end: u32,
    pub context: ScriptContext,
    pub content: Expression, // Program
    pub attributes: Vec<AttributeNode>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize)]
pub enum ScriptType {
    #[default]
    Script,
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

// =============================================================================
// Component Metadata (populated during analysis)
// =============================================================================

// Bit flags for ExpressionMetadata
const FLAG_HAS_STATE: u8 = 1 << 0;
const FLAG_HAS_CALL: u8 = 1 << 1;
const FLAG_HAS_AWAIT: u8 = 1 << 2;
const FLAG_HAS_MEMBER_EXPRESSION: u8 = 1 << 3;
const FLAG_HAS_ASSIGNMENT: u8 = 1 << 4;

/// Metadata for JavaScript expressions, tracking dependencies and state.
/// Uses bit-packing for boolean flags to reduce memory footprint.
#[derive(Debug, Clone, Default)]
pub struct ExpressionMetadata {
    /// Bit-packed flags for has_state, has_call, has_await, has_member_expression, has_assignment
    flags: u8,
    /// Bindings that this expression depends on (indices into analysis bindings)
    pub dependencies: FxHashSet<usize>,
    /// Bindings that this expression references (indices into analysis bindings)
    pub references: FxHashSet<usize>,
}

impl ExpressionMetadata {
    /// Whether the expression contains state ($state, $derived, etc.)
    #[inline]
    pub fn has_state(&self) -> bool {
        self.flags & FLAG_HAS_STATE != 0
    }

    /// Set whether the expression contains state
    #[inline]
    pub fn set_has_state(&mut self, v: bool) {
        if v {
            self.flags |= FLAG_HAS_STATE;
        } else {
            self.flags &= !FLAG_HAS_STATE;
        }
    }

    /// Whether the expression involves a call expression
    #[inline]
    pub fn has_call(&self) -> bool {
        self.flags & FLAG_HAS_CALL != 0
    }

    /// Set whether the expression involves a call expression
    #[inline]
    pub fn set_has_call(&mut self, v: bool) {
        if v {
            self.flags |= FLAG_HAS_CALL;
        } else {
            self.flags &= !FLAG_HAS_CALL;
        }
    }

    /// Whether the expression contains `await`
    #[inline]
    pub fn has_await(&self) -> bool {
        self.flags & FLAG_HAS_AWAIT != 0
    }

    /// Set whether the expression contains `await`
    #[inline]
    pub fn set_has_await(&mut self, v: bool) {
        if v {
            self.flags |= FLAG_HAS_AWAIT;
        } else {
            self.flags &= !FLAG_HAS_AWAIT;
        }
    }

    /// Whether the expression includes a member expression
    #[inline]
    pub fn has_member_expression(&self) -> bool {
        self.flags & FLAG_HAS_MEMBER_EXPRESSION != 0
    }

    /// Set whether the expression includes a member expression
    #[inline]
    pub fn set_has_member_expression(&mut self, v: bool) {
        if v {
            self.flags |= FLAG_HAS_MEMBER_EXPRESSION;
        } else {
            self.flags &= !FLAG_HAS_MEMBER_EXPRESSION;
        }
    }

    /// Whether the expression includes an assignment or an update
    #[inline]
    pub fn has_assignment(&self) -> bool {
        self.flags & FLAG_HAS_ASSIGNMENT != 0
    }

    /// Set whether the expression includes an assignment or an update
    #[inline]
    pub fn set_has_assignment(&mut self, v: bool) {
        if v {
            self.flags |= FLAG_HAS_ASSIGNMENT;
        } else {
            self.flags &= !FLAG_HAS_ASSIGNMENT;
        }
    }

    /// Returns true if the expression is async (contains await or has blockers).
    pub fn is_async(&self) -> bool {
        self.has_await()
        // TODO: also check for blockers when binding blocker support is added
        // For now, just check has_await
    }

    /// Returns true if the expression has blocker dependencies.
    pub fn has_blockers(&self) -> bool {
        // TODO: check if any dependencies have blockers
        // For now, return false
        false
    }
}

// Custom Serialize implementation for backward compatibility
impl Serialize for ExpressionMetadata {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeStruct;
        let mut state = serializer.serialize_struct("ExpressionMetadata", 7)?;
        state.serialize_field("has_state", &self.has_state())?;
        state.serialize_field("has_call", &self.has_call())?;
        state.serialize_field("has_await", &self.has_await())?;
        state.serialize_field("has_member_expression", &self.has_member_expression())?;
        state.serialize_field("has_assignment", &self.has_assignment())?;
        state.serialize_field("dependencies", &self.dependencies)?;
        state.serialize_field("references", &self.references)?;
        state.end()
    }
}

// Custom Deserialize implementation for backward compatibility
impl<'de> Deserialize<'de> for ExpressionMetadata {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        #[derive(Deserialize)]
        struct ExpressionMetadataHelper {
            #[serde(default)]
            has_state: bool,
            #[serde(default)]
            has_call: bool,
            #[serde(default)]
            has_await: bool,
            #[serde(default)]
            has_member_expression: bool,
            #[serde(default)]
            has_assignment: bool,
            #[serde(default)]
            dependencies: FxHashSet<usize>,
            #[serde(default)]
            references: FxHashSet<usize>,
        }

        let helper = ExpressionMetadataHelper::deserialize(deserializer)?;
        let mut result = ExpressionMetadata {
            flags: 0,
            dependencies: helper.dependencies,
            references: helper.references,
        };
        result.set_has_state(helper.has_state);
        result.set_has_call(helper.has_call);
        result.set_has_await(helper.has_await);
        result.set_has_member_expression(helper.has_member_expression);
        result.set_has_assignment(helper.has_assignment);
        Ok(result)
    }
}

/// Metadata for RegularElement nodes, populated during Phase 2 analysis.
#[derive(Debug, Clone, Default)]
pub struct RegularElementMetadata {
    /// For option elements without an explicit value attribute but with a single expression child,
    /// the expression is used as the synthetic value. This stores a clone of that ExpressionTag.
    pub synthetic_value_node: Option<Box<ExpressionTag>>,
    /// Whether this element is scoped (has CSS class hash applied)
    pub scoped: bool,
    /// Whether this element has spread attributes
    pub has_spread: bool,
    /// Whether this element is in the SVG namespace.
    /// Set during Phase 2 analysis based on element name and ancestor context.
    /// Elements like 'a' and 'title' are SVG only when inside an SVG ancestor.
    pub svg: bool,
    /// Whether this element is in the MathML namespace.
    /// Set during Phase 2 analysis based on element name.
    pub mathml: bool,
}

/// Metadata for SvelteDynamicElement nodes (<svelte:element>), populated during Phase 2 analysis.
#[derive(Debug, Clone, Default)]
pub struct SvelteDynamicElementMetadata {
    /// Whether this element is in the SVG namespace.
    /// Set during Phase 2 analysis based on xmlns attribute, ancestor context, or component namespace.
    pub svg: bool,
    /// Whether this element is in the MathML namespace.
    /// Set during Phase 2 analysis based on xmlns attribute, ancestor context, or component namespace.
    pub mathml: bool,
}

/// Metadata for Component nodes, populated during Phase 2 analysis.
#[derive(Debug, Clone, Default)]
pub struct ComponentNodeMetadata {
    /// Whether this is a dynamic component (e.g., <svelte:component>)
    pub dynamic: bool,
    /// Path from root to this node (for error reporting)
    pub path: Vec<String>,
    /// Snippets that this component might render (indices into snippet blocks)
    pub snippets: FxHashSet<usize>,
    /// Expression metadata for component name resolution
    pub expression: ExpressionMetadata,
}
