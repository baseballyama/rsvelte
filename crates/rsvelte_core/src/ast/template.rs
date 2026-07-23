//! Template AST nodes for Svelte components.
//!
//! These types represent the parsed structure of a Svelte component's template.
//! Field ordering follows the principle of largest-first for optimal memory layout.

use std::borrow::Cow;

use compact_str::CompactString;
use indexmap::IndexSet;

/// Binding-index sets are keyed by `usize`; the default SipHash is needless here.
pub type BindingIndexSet = IndexSet<usize, rustc_hash::FxBuildHasher>;
use rustc_hash::FxHashSet;
use serde::Serialize;
use smallvec::SmallVec;

use super::css::StyleSheet;
use super::js::Expression;
use super::span::SourceLocation;

// =============================================================================
// Root
// =============================================================================

/// The root node of a Svelte component AST.
#[derive(Debug, Clone, Serialize)]
pub struct Root<'a> {
    /// CSS stylesheet, or null if none.
    pub css: Option<Box<StyleSheet>>,
    /// JS comments (for modern AST format, represented as empty array).
    #[serde(default)]
    pub js: Vec<serde_json::Value>,
    pub start: u32,
    pub end: u32,
    #[serde(rename = "type")]
    pub node_type: RootType,
    pub fragment: Fragment<'a>,
    /// Component options, or null if none.
    pub options: Option<Box<SvelteOptions<'a>>>,
    /// JS comments collected during parsing (Svelte 5.53+).
    /// Includes comments in element openers (between attributes) plus
    /// comments captured by the JS parser inside `{...}` expressions
    /// and `<script>` blocks.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub comments: Vec<JsComment>,
    /// Instance script, serialized only if present.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub instance: Option<Box<Script<'a>>>,
    /// Module script, serialized only if present.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub module: Option<Box<Script<'a>>>,
    /// Parser-level warnings (e.g., element_implicitly_closed).
    /// These are collected during parsing and forwarded to the analysis phase.
    #[serde(skip)]
    pub parse_warnings: Vec<ParseWarning>,
    /// Source text is NOT stored here anymore - pass it separately to print().
    /// This avoids cloning the entire source during parsing.
    #[serde(skip)]
    pub source: Option<()>,
    /// Arena for JsNode instances. Stores all expression sub-nodes contiguously.
    #[serde(skip)]
    pub arena: crate::ast::arena::ParseArena,
}

/// A JavaScript-style comment captured during parsing.
///
/// Mirrors Svelte 5's `AST.JSComment`. The `loc` field always carries
/// `{line, column, character}` (the test runner strips `character` before
/// comparing against acorn-style fixtures via `normalize_json`).
#[derive(Debug, Clone, Serialize)]
pub struct JsComment {
    #[serde(rename = "type")]
    pub kind: JsCommentKind,
    pub start: u32,
    pub end: u32,
    pub value: CompactString,
    pub loc: super::span::SourceLocation,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
pub enum JsCommentKind {
    Line,
    Block,
}

/// A warning emitted during parsing.
#[derive(Debug, Clone)]
pub struct ParseWarning {
    /// Warning code (e.g., "element_implicitly_closed")
    pub code: String,
    /// Warning message
    pub message: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize)]
pub enum RootType {
    #[default]
    Root,
}

// =============================================================================
// Fragment
// =============================================================================

/// Metadata for fragments.
#[derive(Debug, Clone, Default, Serialize)]
pub struct FragmentMetadata {
    /// Whether the fragment's scope is transparent (delegates to parent scopes).
    #[serde(default)]
    pub transparent: bool,
    /// Whether we need to traverse into the fragment during mount/hydrate.
    #[serde(default)]
    pub dynamic: bool,
}

/// A fragment is a container for template nodes.
#[derive(Debug, Clone, Default, Serialize)]
pub struct Fragment<'a> {
    #[serde(rename = "type")]
    pub node_type: FragmentType,
    pub nodes: Vec<TemplateNode<'a>>,
    /// Fragment metadata (used internally during analysis).
    #[serde(default, skip_serializing_if = "is_default_metadata")]
    pub metadata: FragmentMetadata,
}

fn is_default_metadata(metadata: &FragmentMetadata) -> bool {
    !metadata.transparent && !metadata.dynamic
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize)]
pub enum FragmentType {
    #[default]
    Fragment,
}

// =============================================================================
// Template Nodes
// =============================================================================

/// A node in the template AST.
///
/// Large variants are boxed to keep the enum small (~128 bytes instead of ~1056).
/// This improves cache efficiency for the common case (Text, Comment) and reduces
/// memory usage for `Vec<TemplateNode>` by ~8x.
#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type")]
pub enum TemplateNode<'a> {
    // Small variants (inline, <= 128 bytes)
    Text(Text<'a>),
    Comment(Comment),
    TitleElement(TitleElement<'a>),
    SlotElement(SlotElement<'a>),
    SvelteBody(SvelteElement<'a>),
    SvelteDocument(SvelteElement<'a>),
    SvelteFragment(SvelteElement<'a>),
    SvelteBoundary(SvelteElement<'a>),
    SvelteHead(SvelteElement<'a>),
    SvelteOptions(SvelteElement<'a>),
    SvelteSelf(SvelteElement<'a>),
    SvelteWindow(SvelteElement<'a>),
    // Large variants (boxed to reduce enum size)
    ExpressionTag(Box<ExpressionTag<'a>>),
    HtmlTag(Box<HtmlTag<'a>>),
    ConstTag(Box<ConstTag<'a>>),
    DeclarationTag(Box<DeclarationTag<'a>>),
    DebugTag(Box<DebugTag<'a>>),
    RenderTag(Box<RenderTag<'a>>),
    AttachTag(Box<AttachTag<'a>>),
    IfBlock(Box<IfBlock<'a>>),
    EachBlock(Box<EachBlock<'a>>),
    AwaitBlock(Box<AwaitBlock<'a>>),
    KeyBlock(Box<KeyBlock<'a>>),
    SnippetBlock(Box<SnippetBlock<'a>>),
    RegularElement(Box<RegularElement<'a>>),
    Component(Box<Component<'a>>),
    SvelteComponent(Box<SvelteComponentElement<'a>>),
    SvelteElement(Box<SvelteDynamicElement<'a>>),
}

impl<'a> AsRef<TemplateNode<'a>> for TemplateNode<'a> {
    fn as_ref(&self) -> &TemplateNode<'a> {
        self
    }
}

// =============================================================================
// Text and Comments
// =============================================================================

/// Static text node.
///
/// `raw`/`data` borrow directly from the source in the common case (a verbatim
/// slice, no HTML entities), so parsing a text node copies nothing. They become
/// owned only when a later phase rewrites the text (entity decoding, whitespace
/// trimming/merging) — hence `Cow`.
#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct Text<'a> {
    pub start: u32,
    pub end: u32,
    /// The original text with undecoded HTML entities.
    pub raw: Cow<'a, str>,
    /// Text with decoded HTML entities.
    pub data: Cow<'a, str>,
}

/// HTML comment node.
#[derive(Debug, Clone, Serialize)]
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
#[derive(Debug, Clone, Serialize)]
pub struct ExpressionTag<'a> {
    pub start: u32,
    pub end: u32,
    pub expression: Expression<'a>,
    /// Internal metadata populated during Phase 2 analysis (mirrors the
    /// `node.metadata.expression` field on the official compiler's
    /// `ExpressionTag`). Skipped from (de)serialisation so snapshot output
    /// is unchanged.
    #[serde(skip)]
    pub metadata: TagMetadata,
}

impl<'a> PartialEq for ExpressionTag<'a> {
    fn eq(&self, other: &Self) -> bool {
        // Metadata is derived from the AST and not part of structural identity.
        self.start == other.start && self.end == other.end && self.expression == other.expression
    }
}

/// An HTML template expression: `{@html expression}`.
#[derive(Debug, Clone, Serialize)]
pub struct HtmlTag<'a> {
    pub start: u32,
    pub end: u32,
    pub expression: Expression<'a>,
    /// Metadata (not serialized)
    #[serde(skip)]
    pub metadata: TagMetadata,
}

/// Metadata for tags (ConstTag, DebugTag).
#[derive(Debug, Clone, Default)]
pub struct TagMetadata {
    /// Expression metadata
    pub expression: ExpressionMetadata,
    /// Warning codes ignored via `<!-- svelte-ignore ... -->` comments preceding this node.
    pub ignored_codes: Vec<String>,
}

/// A const tag: `{@const declaration}`.
#[derive(Debug, Clone, Serialize)]
pub struct ConstTag<'a> {
    pub start: u32,
    pub end: u32,
    pub declaration: Expression<'a>,
    /// Metadata (not serialized)
    #[serde(skip)]
    pub metadata: TagMetadata,
}

/// A declaration tag: `{let x = expr}` / `{const x = expr}` (Svelte 5.56.0 #18282).
///
/// Similar to `{@const …}` but uses the `let` / `const` keyword as the tag
/// opener and supports mutable bindings (`let`). The `declaration` field stores
/// the parsed `VariableDeclaration` as an `Expression` for symmetry with the
/// rest of the AST.
#[derive(Debug, Clone, Serialize)]
pub struct DeclarationTag<'a> {
    pub start: u32,
    pub end: u32,
    /// The `VariableDeclaration` parsed from the tag body. Represented as an
    /// `Expression` for AST-walker uniformity; downstream visitors narrow to
    /// `VariableDeclaration` shape via `node_type()`.
    pub declaration: Expression<'a>,
    /// Metadata (not serialized).
    #[serde(skip)]
    pub metadata: TagMetadata,
}

/// A debug tag: `{@debug identifiers}`.
#[derive(Debug, Clone, Serialize)]
pub struct DebugTag<'a> {
    pub start: u32,
    pub end: u32,
    pub identifiers: Vec<Expression<'a>>,
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
#[derive(Debug, Clone, Serialize)]
pub struct RenderTag<'a> {
    pub start: u32,
    pub end: u32,
    pub expression: Expression<'a>,
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
#[derive(Debug, Clone, Serialize)]
pub struct AttachTag<'a> {
    pub start: u32,
    pub end: u32,
    pub expression: Expression<'a>,
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
#[derive(Debug, Clone, Serialize)]
pub struct IfBlock<'a> {
    pub elseif: bool,
    pub start: u32,
    pub end: u32,
    pub test: Expression<'a>,
    pub consequent: Fragment<'a>,
    pub alternate: Option<Fragment<'a>>,
    /// Metadata (not serialized)
    #[serde(skip)]
    pub metadata: IfBlockMetadata,
}

/// Metadata for EachBlock nodes.
#[derive(Debug, Clone, Default, Serialize)]
pub struct EachBlockMetadata {
    /// Whether this is a keyed each block
    pub keyed: bool,
    /// Expression metadata for the iterable expression
    pub expression: ExpressionMetadata,
    /// Transitive dependencies (for legacy reactivity).
    /// Uses IndexSet to preserve insertion order (matching JavaScript Set behavior).
    pub transitive_deps: BindingIndexSet,
    /// Whether the each block is controlled (has explicit key tracking)
    #[serde(default)]
    pub is_controlled: bool,
    /// Whether the each block contains group bindings
    #[serde(default)]
    pub contains_group_binding: bool,
    /// Generated unique index identifier name
    #[serde(skip_serializing_if = "Option::is_none")]
    pub index: Option<String>,
    /// The binding group name (e.g., "binding_group", "binding_group_1") assigned to this each block.
    /// Set when `contains_group_binding=true` by the analysis phase.
    /// Used by the transform phase to look up the correct group for $.bind_group().
    #[serde(skip_serializing_if = "Option::is_none")]
    pub binding_group_name: Option<String>,
}

/// An each block: `{#each items as item (key)}...{:else}...{/each}`.
#[derive(Debug, Clone, Serialize)]
pub struct EachBlock<'a> {
    pub start: u32,
    pub end: u32,
    pub expression: Expression<'a>,
    pub body: Fragment<'a>,
    /// Context pattern - serializes as null when None (required by tests)
    pub context: Option<Expression<'a>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fallback: Option<Fragment<'a>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub index: Option<CompactString>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub key: Option<Expression<'a>>,
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
#[derive(Debug, Clone, Serialize)]
pub struct AwaitBlock<'a> {
    pub start: u32,
    pub end: u32,
    pub expression: Expression<'a>,
    pub value: Option<Expression<'a>>,
    pub error: Option<Expression<'a>>,
    pub pending: Option<Fragment<'a>>,
    pub then: Option<Fragment<'a>>,
    pub catch: Option<Fragment<'a>>,
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
#[derive(Debug, Clone, Serialize)]
pub struct KeyBlock<'a> {
    pub start: u32,
    pub end: u32,
    pub expression: Expression<'a>,
    pub fragment: Fragment<'a>,
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
#[derive(Debug, Clone, Serialize)]
pub struct SnippetBlock<'a> {
    pub start: u32,
    pub end: u32,
    pub expression: Expression<'a>,
    #[serde(rename = "typeParams", skip_serializing_if = "Option::is_none")]
    pub type_params: Option<CompactString>,
    pub parameters: Vec<Expression<'a>>,
    pub body: Fragment<'a>,
    /// Metadata (not serialized)
    #[serde(skip)]
    pub metadata: SnippetBlockMetadata,
}

// =============================================================================
// Element Nodes
// =============================================================================

/// A regular HTML element.
#[derive(Debug, Clone, Serialize)]
pub struct RegularElement<'a> {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name_loc: Option<SourceLocation>,
    pub attributes: Vec<Attribute<'a>>,
    pub fragment: Fragment<'a>,
    /// Metadata populated during analysis (Phase 2)
    #[serde(skip)]
    pub metadata: RegularElementMetadata<'a>,
}

/// A Svelte component.
#[derive(Debug, Clone, Serialize)]
pub struct Component<'a> {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name_loc: Option<SourceLocation>,
    pub attributes: Vec<Attribute<'a>>,
    pub fragment: Fragment<'a>,
    /// Metadata populated during analysis (Phase 2)
    #[serde(skip)]
    pub metadata: ComponentNodeMetadata,
}

/// A title element.
#[derive(Debug, Clone, Serialize)]
pub struct TitleElement<'a> {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name_loc: Option<SourceLocation>,
    pub attributes: Vec<Attribute<'a>>,
    pub fragment: Fragment<'a>,
}

/// A slot element.
#[derive(Debug, Clone, Serialize)]
pub struct SlotElement<'a> {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name_loc: Option<SourceLocation>,
    pub attributes: Vec<Attribute<'a>>,
    pub fragment: Fragment<'a>,
}

/// A svelte: special element (body, document, head, window, fragment, boundary, self).
#[derive(Debug, Clone, Serialize)]
pub struct SvelteElement<'a> {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name_loc: Option<SourceLocation>,
    pub attributes: Vec<Attribute<'a>>,
    pub fragment: Fragment<'a>,
}

/// A svelte:component element.
#[derive(Debug, Clone, Serialize)]
pub struct SvelteComponentElement<'a> {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name_loc: Option<SourceLocation>,
    pub attributes: Vec<Attribute<'a>>,
    pub fragment: Fragment<'a>,
    pub expression: Expression<'a>,
    /// Warning codes ignored via `<!-- svelte-ignore ... -->` comments preceding this element.
    /// Set during Phase 2 analysis from preceding svelte-ignore comments.
    #[serde(skip)]
    pub ignored_codes: Vec<String>,
}

/// A svelte:element (dynamic element).
#[derive(Debug, Clone, Serialize)]
pub struct SvelteDynamicElement<'a> {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name_loc: Option<SourceLocation>,
    pub attributes: Vec<Attribute<'a>>,
    pub fragment: Fragment<'a>,
    pub tag: Expression<'a>,
    /// Metadata populated during analysis (Phase 2)
    #[serde(skip)]
    pub metadata: SvelteDynamicElementMetadata,
}

// =============================================================================
// Attributes and Directives
// =============================================================================

/// An attribute or directive on an element.
///
/// All variants are boxed to keep the enum small (~16 bytes instead of ~368).
/// This reduces memory for `Vec<Attribute>` on elements by ~23x.
#[derive(Debug, Clone)]
pub enum Attribute<'a> {
    Attribute(AttributeNode<'a>),
    SpreadAttribute(SpreadAttribute<'a>),
    AttachTag(AttachTag<'a>),
    // Directives
    BindDirective(BindDirective<'a>),
    OnDirective(OnDirective<'a>),
    ClassDirective(ClassDirective<'a>),
    StyleDirective(StyleDirective<'a>),
    TransitionDirective(TransitionDirective<'a>),
    AnimateDirective(AnimateDirective<'a>),
    UseDirective(UseDirective<'a>),
    LetDirective(LetDirective<'a>),
}

impl<'a> serde::Serialize for Attribute<'a> {
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

/// Metadata populated by Phase 2 analysis for `AttributeNode`.
///
/// Not serialised to snapshot output (the official compiler keeps these on a
/// `metadata` sidecar that is also internal). Phase 3 transforms can read
/// these flags to avoid re-walking the attribute value.
#[derive(Debug, Clone, Default)]
pub struct AttributeNodeMetadata {
    /// True when the `class={...}` attribute value is a non-trivial JS
    /// expression and so needs the runtime `$.clsx(...)` wrapper to flatten
    /// arrays / objects of class names.
    pub needs_clsx: bool,
    /// True when an `on*` event attribute is on a regular HTML element and
    /// the event name is delegated by the runtime (the parent `mount`/`hydrate`
    /// helper installs a single shared listener for it).
    pub delegated: bool,
}

/// A regular attribute: `name="value"` or `name={expression}`.
#[derive(Debug, Clone)]
pub struct AttributeNode<'a> {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    pub name_loc: Option<SourceLocation>,
    pub value: AttributeValue<'a>,
    /// Internal metadata. Always defaults on construction; populated during
    /// Phase 2 analysis. Skipped during (de)serialisation so snapshot output
    /// is unchanged.
    pub metadata: AttributeNodeMetadata,
}

impl<'a> serde::Serialize for AttributeNode<'a> {
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
#[derive(Debug, Clone, PartialEq)]
#[allow(clippy::large_enum_variant)]
pub enum AttributeValue<'a> {
    /// Boolean attribute (no value).
    True(bool),
    /// Expression value.
    Expression(ExpressionTag<'a>),
    /// Text or mixed content.
    Sequence(Vec<AttributeValuePart<'a>>),
}

impl<'a> serde::Serialize for AttributeValue<'a> {
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
///
/// `ExpressionTag` is much larger than `Text` because it carries an
/// `Expression` plus the metadata populated during analysis. Boxing it
/// would shrink the enum but require touching every match site;
/// `AttributeValuePart` instances are short-lived and stored in small
/// per-attribute vectors, so we accept the size disparity here.
#[derive(Debug, Clone, PartialEq)]
#[allow(clippy::large_enum_variant)]
pub enum AttributeValuePart<'a> {
    Text(Text<'a>),
    ExpressionTag(ExpressionTag<'a>),
}

impl<'a> serde::Serialize for AttributeValuePart<'a> {
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
                map.serialize_entry("raw", text.raw.as_ref())?;
                map.serialize_entry("data", text.data.as_ref())?;
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
#[derive(Debug, Clone)]
pub struct SpreadAttribute<'a> {
    pub start: u32,
    pub end: u32,
    pub expression: Expression<'a>,
}

impl<'a> serde::Serialize for SpreadAttribute<'a> {
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
#[derive(Debug, Clone)]
pub struct BindDirective<'a> {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    pub name_loc: Option<SourceLocation>,
    pub expression: Expression<'a>,
    pub modifiers: SmallVec<[CompactString; 2]>,
}

impl<'a> serde::Serialize for BindDirective<'a> {
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

/// Metadata populated during Phase 2 analysis for `on:` directives.
///
/// Skipped from (de)serialisation so snapshot output is unchanged.
#[derive(Debug, Clone, Default)]
pub struct OnDirectiveMetadata {
    /// Mirrors `node.metadata.expression` from the official compiler so
    /// Phase 3 can decide whether the handler needs `$.derived(...)`-style
    /// memoisation without re-walking the expression.
    pub expression: ExpressionMetadata,
}

/// An on directive: `on:event={handler}`.
#[derive(Debug, Clone)]
pub struct OnDirective<'a> {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    pub name_loc: Option<SourceLocation>,
    pub expression: Option<Expression<'a>>,
    pub modifiers: SmallVec<[CompactString; 2]>,
    /// Internal metadata, populated during Phase 2 analysis. Skipped during
    /// (de)serialisation so snapshot output is unchanged.
    pub metadata: OnDirectiveMetadata,
}

impl<'a> serde::Serialize for OnDirective<'a> {
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

/// Metadata populated during Phase 2 analysis for `class:` directives.
///
/// Skipped from (de)serialisation so snapshot output is unchanged.
#[derive(Debug, Clone, Default)]
pub struct ClassDirectiveMetadata {
    /// Mirrors `node.metadata.expression` from the official compiler so
    /// Phase 3 can decide whether the directive needs `$.derived(...)`-style
    /// memoisation without re-walking the expression.
    pub expression: ExpressionMetadata,
}

/// A class directive: `class:name={expression}`.
#[derive(Debug, Clone)]
pub struct ClassDirective<'a> {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    pub name_loc: Option<SourceLocation>,
    pub expression: Expression<'a>,
    /// Internal metadata, populated during Phase 2 analysis. Skipped during
    /// (de)serialisation so snapshot output is unchanged.
    pub metadata: ClassDirectiveMetadata,
}

impl<'a> serde::Serialize for ClassDirective<'a> {
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
#[derive(Debug, Clone)]
pub struct StyleDirective<'a> {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    pub name_loc: Option<SourceLocation>,
    pub value: AttributeValue<'a>,
    pub modifiers: SmallVec<[CompactString; 2]>,
}

impl<'a> serde::Serialize for StyleDirective<'a> {
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
#[derive(Debug, Clone)]
pub struct TransitionDirective<'a> {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    pub name_loc: Option<SourceLocation>,
    pub expression: Option<Expression<'a>>,
    pub modifiers: SmallVec<[CompactString; 2]>,
    pub intro: bool,
    pub outro: bool,
    pub metadata: Option<DirectiveMetadata<'a>>,
}

impl<'a> serde::Serialize for TransitionDirective<'a> {
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
#[derive(Debug, Clone, Serialize)]
pub struct DirectiveMetadata<'a> {
    /// Expression metadata (dependencies, blockers, etc.)
    pub expression: DirectiveExpressionMetadata<'a>,
}

/// Expression metadata for directives.
#[derive(Debug, Clone, Serialize, Default)]
pub struct DirectiveExpressionMetadata<'a> {
    /// Whether the expression contains await
    #[serde(default)]
    pub has_await: bool,
    /// Blocking dependencies (for async expressions)
    #[serde(default)]
    pub blockers: Vec<Expression<'a>>,
}

impl<'a> DirectiveExpressionMetadata<'a> {
    /// Check if the expression is async (has await or blockers).
    pub fn is_async(&self) -> bool {
        self.has_await || !self.blockers.is_empty()
    }

    /// Get the blocking dependencies.
    pub fn blockers(&self) -> &[Expression<'a>] {
        &self.blockers
    }
}

/// An animate directive: `animate:name`.
#[derive(Debug, Clone)]
pub struct AnimateDirective<'a> {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    pub name_loc: Option<SourceLocation>,
    pub expression: Option<Expression<'a>>,
    pub metadata: Option<DirectiveMetadata<'a>>,
}

impl<'a> serde::Serialize for AnimateDirective<'a> {
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
#[derive(Debug, Clone)]
pub struct UseDirective<'a> {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    pub name_loc: Option<SourceLocation>,
    pub expression: Option<Expression<'a>>,
}

impl<'a> serde::Serialize for UseDirective<'a> {
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
#[derive(Debug, Clone)]
pub struct LetDirective<'a> {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    pub name_loc: Option<SourceLocation>,
    pub expression: Option<Expression<'a>>,
}

impl<'a> serde::Serialize for LetDirective<'a> {
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
#[derive(Debug, Clone, Serialize)]
pub struct Script<'a> {
    #[serde(rename = "type")]
    pub node_type: ScriptType,
    pub start: u32,
    pub end: u32,
    pub context: ScriptContext,
    pub content: Expression<'a>, // Program (lazily parsed from raw_content)
    pub attributes: Vec<AttributeNode<'a>>,
    /// Raw script content for deferred parsing. Empty string means content was already parsed eagerly.
    #[serde(skip)]
    pub raw_content: String,
    /// Offset of raw_content in the source for position mapping.
    #[serde(skip)]
    pub content_offset: u32,
    /// Whether the script uses TypeScript.
    #[serde(skip)]
    pub is_typescript: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize)]
pub enum ScriptType {
    #[default]
    Script,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum ScriptContext {
    Default,
    Module,
}

/// Svelte component options from `<svelte:options>`.
#[derive(Debug, Clone, Default, Serialize)]
pub struct SvelteOptions<'a> {
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
    pub custom_element: Option<CustomElementOptions<'a>>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub attributes: Vec<AttributeNode<'a>>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum Namespace {
    Html,
    Svg,
    Mathml,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum CssOption {
    Injected,
}

/// Custom element options.
#[derive(Debug, Clone, Default, Serialize)]
pub struct CustomElementOptions<'a> {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tag: Option<CompactString>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub shadow: Option<ShadowMode>,
    /// `shadow` given as a ShadowRootInit object expression (upstream allows
    /// `shadow: { mode: 'open', ... }` and passes the AST straight through).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub shadow_object: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub props: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub extend: Option<Expression<'a>>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
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
    /// Bindings that this expression depends on (indices into analysis bindings).
    /// Uses IndexSet to preserve insertion order (matching JavaScript Set behavior),
    /// which determines the order of dependency tracking in invalidate_inner_signals().
    pub dependencies: BindingIndexSet,
    /// Bindings that this expression references (indices into analysis bindings).
    /// Uses IndexSet to preserve insertion order (matching JavaScript Set behavior).
    pub references: BindingIndexSet,
}

impl ExpressionMetadata {
    /// Get raw flags byte for direct copy to Phase 3 ExpressionMetadata.
    /// Bits 0-4 are: STATE, CALL, AWAIT, MEMBER_EXPRESSION, ASSIGNMENT.
    #[inline]
    pub fn raw_flags(&self) -> u8 {
        self.flags
    }

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

/// Metadata for RegularElement nodes, populated during Phase 2 analysis.
#[derive(Debug, Clone, Default)]
pub struct RegularElementMetadata<'a> {
    /// For option elements without an explicit value attribute but with a single expression child,
    /// the expression is used as the synthetic value. This stores a clone of that ExpressionTag.
    pub synthetic_value_node: Option<Box<ExpressionTag<'a>>>,
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
    /// Warning codes ignored via `<!-- svelte-ignore ... -->` comments preceding this element.
    /// Set during Phase 2 analysis from preceding svelte-ignore comments.
    pub ignored_codes: Vec<String>,
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
    /// Expression metadata for the tag expression (the `this` attribute value).
    /// Tracks has_await, has_call, etc. for async handling.
    pub expression: ExpressionMetadata,
    /// Whether this element has been matched by a CSS selector and needs the scoping class.
    /// Set during Phase 2 analysis by the CSS pruner/scoping pass.
    pub scoped: bool,
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
    /// Warning codes ignored via `<!-- svelte-ignore ... -->` comments preceding this component.
    /// Set during Phase 2 analysis from preceding svelte-ignore comments.
    pub ignored_codes: Vec<String>,
}
