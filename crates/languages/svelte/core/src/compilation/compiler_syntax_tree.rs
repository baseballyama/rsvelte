//! The component's HIR: the template as the compiler understands it rather than as it was written.
//!
//! Analysis and lowering read only this, so any frontend that builds it can be compiled. The
//! Svelte frontend builds it from the surface tree ([`crate::syntax::syntax_tree`]) in [`lower`];
//! source text is read only for names. What changes on the way:
//!
//! - an `{#if}…{:else if}…{:else}` chain is one node with its branches, not nested `If`s;
//! - a `bind:` directive is an attribute named by its property, with an [`AttributeValue::Bind`],
//!   and a `class:` directive one named by its class, with an [`AttributeValue::Class`]; an
//!   `{@attach}` tag and a spread are attributes with an empty name and an
//!   [`AttributeValue::Attach`] or [`AttributeValue::Spread`];
//! - every element knows its kind (regular, component, `<title>` in `<svelte:head>`, `<slot>`,
//!   `svelte:` meta tag), decided the way the Svelte parser decides it;
//! - an attribute value is classified (boolean, static text with character references decoded, one
//!   expression, shorthand, interpolated) instead of being a list of chunks;
//! - text is decoded;
//! - every node has a [`CompilerNodeIdentifier`], a parent, and its origin: the frontend's
//!   identifier of the node it was built from.
//!
//! JavaScript expressions stay in the component's one [`rsvelte_typescript::SyntaxTree`]; what a
//! name in them refers to is on [`crate::semantic::resolve::Resolution`], keyed by the same
//! [`NodeIdentifier`]s. Facts later layers add about HIR nodes (types, control flow) are side
//! tables over [`CompilerNodeIdentifier`].

use rsvelte_kernel::newtype_index;
use rsvelte_kernel::source::index::{IndexRange, IndexVector};
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript::NodeIdentifier;
use unicode_id_start as unicode_identifier_start;

use crate::syntax::syntax_tree::{
    self, Component, TemplateNode, TemplateNodeIdentifier, decode_text,
};

/// A chunk of an attribute value as written.
#[derive(Debug, Clone, Copy)]
pub enum Part {
    Text(Span),
    Expression {
        expression: NodeIdentifier,
        /// Braces included.
        span: Span,
    },
}

newtype_index!(
    pub struct CompilerNodeIdentifier;
);
newtype_index!(
    pub struct AttributeIdentifier;
);

#[derive(Debug)]
pub struct CompilerSyntaxTree {
    pub nodes: IndexVector<CompilerNodeIdentifier, Node>,
    pub attributes: IndexVector<AttributeIdentifier, Attribute>,
    /// The frontend's node each HIR node was built from. For Svelte, an `{#if}` chain's node
    /// points at its first `If`; each [`Branch`] carries its own.
    pub origin: IndexVector<CompilerNodeIdentifier, TemplateNodeIdentifier>,
    children: Vec<CompilerNodeIdentifier>,
    branches: Vec<Branch>,
    pub root: Children,
}

/// A slice of [`CompilerSyntaxTree`]'s child list.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Hash)]
pub struct Children {
    start: u32,
    len: u32,
}

#[derive(Debug)]
pub struct Node {
    pub kind: NodeKind,
    pub span: Span,
    /// The enclosing element or block; `None` at the top level.
    pub parent: Option<CompilerNodeIdentifier>,
}

#[derive(Debug)]
pub enum NodeKind {
    Text {
        raw: Span,
        /// Present only when decoding changed the text.
        decoded: Option<Box<str>>,
        /// The frontend spelled `decoded` itself (Vue's condensed text): `raw` is only where it
        /// came from, and the markup is `decoded` escaped.
        spelled: bool,
    },
    Comment {
        data: Span,
    },
    Expression {
        expression: NodeIdentifier,
    },
    Element(Element),
    If {
        branches: Branches,
        /// The final `{:else}`.
        otherwise: Option<Children>,
    },
    Each(Each),
}

/// `{#each collection as context, index (key)}…{:else}…{/each}`. The context and the index are
/// declared in a scope of their own, which the key and the body see and the collection and the
/// fallback do not.
#[derive(Debug)]
pub struct Each {
    pub collection: NodeIdentifier,
    /// A pattern node; `NodeIdentifier::NONE` when absent, as are `index` and `key`.
    pub context: NodeIdentifier,
    /// An identifier node.
    pub index: NodeIdentifier,
    pub key: NodeIdentifier,
    pub body: Children,
    pub fallback: Option<Children>,
}

impl Each {
    #[must_use]
    pub const fn context(&self) -> Option<NodeIdentifier> {
        some(self.context)
    }

    #[must_use]
    pub const fn index(&self) -> Option<NodeIdentifier> {
        some(self.index)
    }

    #[must_use]
    pub const fn key(&self) -> Option<NodeIdentifier> {
        some(self.key)
    }

    /// Upstream's `metadata.keyed`: a key other than the index itself.
    #[must_use]
    pub fn keyed(&self, javascript: &rsvelte_typescript::SyntaxTree) -> bool {
        let Some(key) = self.key() else {
            return false;
        };
        let is_index = matches!(
            javascript.kind(key),
            rsvelte_typescript::Kind::Identifier(_)
        ) && self.index().is_some_and(|i| {
            javascript.atom(i).is_some() && javascript.atom(i) == javascript.atom(key)
        });
        !is_index
    }
}

const fn some(identifier: NodeIdentifier) -> Option<NodeIdentifier> {
    if identifier.0 == NodeIdentifier::NONE.0 {
        None
    } else {
        Some(identifier)
    }
}

#[derive(Debug)]
pub struct Element {
    pub name: Span,
    pub kind: ElementKind,
    pub attributes: IndexRange<AttributeIdentifier>,
    pub children: Children,
    /// `<name …>` (or `<name … />`).
    pub start_tag: Span,
}

/// The Svelte parser's element node types.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ElementKind {
    Regular,
    Component,
    /// `<title>` whose nearest enclosing element is `<svelte:head>`.
    Title,
    /// `<slot>` outside a declarative shadow root.
    Slot,
    /// `svelte:…`; `None` for a name the compiler rejects.
    Metadata(Option<MetadataTag>),
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum MetadataTag {
    Head,
    Options,
    Window,
    Document,
    Body,
    Element,
    Component,
    SelfRef,
    Fragment,
    Boundary,
}

/// A slice of [`CompilerSyntaxTree`]'s branch list.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Branches {
    start: u32,
    len: u32,
}

#[derive(Debug)]
pub struct Branch {
    pub test: NodeIdentifier,
    pub body: Children,
    pub origin: TemplateNodeIdentifier,
}

/// An attribute name as the compiler reads it: as written, or as a frontend spells it in Svelte
/// (Vue's `@click` is Svelte's `onclick`).
#[derive(Debug, Clone)]
pub enum Name {
    Source(Span),
    Spelled { text: Box<str>, span: Span },
}

impl Name {
    #[must_use]
    pub fn text<'a>(&'a self, source_text: &'a str) -> &'a str {
        match self {
            Self::Source(span) => span.text(source_text),
            Self::Spelled { text, .. } => text,
        }
    }

    /// Where it was written.
    #[must_use]
    pub const fn span(&self) -> Span {
        match *self {
            Self::Source(span) | Self::Spelled { span, .. } => span,
        }
    }
}

#[derive(Debug)]
pub struct Attribute {
    pub name: Name,
    pub value: AttributeValue,
    pub span: Span,
    pub owner: CompilerNodeIdentifier,
    /// The frontend's identifier of the attribute; for Svelte, an index into the surface attribute
    /// list.
    pub origin: u32,
}

#[derive(Debug)]
pub enum AttributeValue {
    /// `<input disabled>`
    Boolean,
    /// Text only, character references decoded; `a=""` is `Static("")`.
    Static(Box<str>),
    /// `a={e}`, or `a="{e}"` with `quoted`.
    Expression {
        expression: NodeIdentifier,
        quoted: bool,
    },
    /// `{a}`
    Shorthand(NodeIdentifier),
    /// Text and expressions, or several expressions: `class="a {b}"`. Empty for `a=` followed by
    /// nothing, which is not the empty text `a=""`: the compiler sets it at runtime.
    Interpolated(Box<[Part]>),
    /// `bind:name={e}`: the attribute's name is the bound property.
    Bind(NodeIdentifier),
    /// `{@attach e}`: the attribute's name is empty.
    Attach(NodeIdentifier),
    /// `class:name={e}`: the attribute's name is the class.
    Class(NodeIdentifier),
    /// `{...e}`: the attribute's name is empty.
    Spread(NodeIdentifier),
}

impl CompilerSyntaxTree {
    #[must_use]
    pub fn node(&self, identifier: CompilerNodeIdentifier) -> &Node {
        &self.nodes[identifier]
    }

    #[must_use]
    pub fn children(&self, c: Children) -> &[CompilerNodeIdentifier] {
        &self.children[c.start as usize..(c.start + c.len) as usize]
    }

    #[must_use]
    pub fn branches(&self, b: Branches) -> &[Branch] {
        &self.branches[b.start as usize..(b.start + b.len) as usize]
    }

    #[must_use]
    pub fn attributes(&self, r: IndexRange<AttributeIdentifier>) -> &[Attribute] {
        self.attributes.slice(r)
    }

    pub fn elements(&self) -> impl Iterator<Item = (CompilerNodeIdentifier, &Element)> {
        self.nodes
            .iter_enumerated()
            .filter_map(|(identifier, n)| match &n.kind {
                NodeKind::Element(el) => Some((identifier, el)),
                _ => None,
            })
    }

    #[must_use]
    pub const fn heap_bytes(&self) -> usize {
        self.nodes.capacity() * size_of::<Node>()
            + self.attributes.capacity() * size_of::<Attribute>()
            + self.origin.capacity() * size_of::<TemplateNodeIdentifier>()
            + self.children.capacity() * size_of::<CompilerNodeIdentifier>()
            + self.branches.capacity() * size_of::<Branch>()
    }
}

impl NodeKind {
    /// The text of a `Text` node, decoded.
    #[must_use]
    pub fn text<'a>(&'a self, source_text: &'a str) -> Option<&'a str> {
        match self {
            Self::Text { raw, decoded, .. } => {
                Some(decoded.as_deref().unwrap_or_else(|| raw.text(source_text)))
            }
            _ => None,
        }
    }
}

#[must_use]
pub fn lower(c: &Component, source_text: &str) -> CompilerSyntaxTree {
    let mut b = SurfaceBuilder {
        c,
        source_text,
        b: CompilerSyntaxTreeBuilder::new(source_text, c.nodes.len(), c.attributes.len()),
    };
    let root = b.list(c.children(c.root), None);
    b.b.finish(root)
}

/// Builds a [`CompilerSyntaxTree`] for a frontend.
///
/// A node is added before its children, so building a child can ask about its ancestors
/// ([`CompilerSyntaxTreeBuilder::element_kind`]); each child list is recorded once its nodes exist
/// ([`CompilerSyntaxTreeBuilder::children`]), which keeps every list contiguous.
#[derive(Debug)]
pub struct CompilerSyntaxTreeBuilder<'s> {
    source_text: &'s str,
    compiler_syntax_tree: CompilerSyntaxTree,
}

impl<'s> CompilerSyntaxTreeBuilder<'s> {
    #[must_use]
    pub fn new(source_text: &'s str, nodes: usize, attributes: usize) -> Self {
        CompilerSyntaxTreeBuilder {
            source_text,
            compiler_syntax_tree: CompilerSyntaxTree {
                nodes: IndexVector::with_capacity(nodes),
                attributes: IndexVector::with_capacity(attributes),
                origin: IndexVector::with_capacity(nodes),
                children: Vec::with_capacity(nodes),
                branches: Vec::new(),
                root: Children::default(),
            },
        }
    }

    /// Adds a node; an element or an `if` gets its kind from
    /// [`CompilerSyntaxTreeBuilder::set_kind`] once its children are built.
    pub fn node(
        &mut self,
        kind: NodeKind,
        span: Span,
        parent: Option<CompilerNodeIdentifier>,
        origin: TemplateNodeIdentifier,
    ) -> CompilerNodeIdentifier {
        self.compiler_syntax_tree.origin.push(origin);
        self.compiler_syntax_tree
            .nodes
            .push(Node { kind, span, parent })
    }

    pub fn set_kind(&mut self, identifier: CompilerNodeIdentifier, kind: NodeKind) {
        self.compiler_syntax_tree.nodes[identifier].kind = kind;
    }

    /// For a node whose extent is known only after its children (a chain of branches).
    pub fn set_span(&mut self, identifier: CompilerNodeIdentifier, span: Span) {
        self.compiler_syntax_tree.nodes[identifier].span = span;
    }

    /// Records the attributes of the element `owner` will be; returns their range.
    pub fn attributes(
        &mut self,
        attributes: impl IntoIterator<Item = Attribute>,
    ) -> IndexRange<AttributeIdentifier> {
        let first = self.compiler_syntax_tree.attributes.next_identifier();
        for a in attributes {
            self.compiler_syntax_tree.attributes.push(a);
        }
        IndexRange::new(
            first,
            self.compiler_syntax_tree.attributes.next_identifier(),
        )
    }

    pub fn children(&mut self, identifiers: &[CompilerNodeIdentifier]) -> Children {
        let start = self.compiler_syntax_tree.children.len() as u32;
        self.compiler_syntax_tree.children.extend(identifiers);
        Children {
            start,
            len: identifiers.len() as u32,
        }
    }

    pub fn branches(&mut self, branches: impl IntoIterator<Item = Branch>) -> Branches {
        let start = self.compiler_syntax_tree.branches.len() as u32;
        self.compiler_syntax_tree.branches.extend(branches);
        Branches {
            start,
            len: self.compiler_syntax_tree.branches.len() as u32 - start,
        }
    }

    /// Sets the children of an element added with no children yet.
    ///
    /// # Panics
    ///
    /// If `identifier` is not an element.
    pub fn set_element_children(&mut self, identifier: CompilerNodeIdentifier, children: Children) {
        let NodeKind::Element(el) = &mut self.compiler_syntax_tree.nodes[identifier].kind else {
            panic!("{identifier:?} is not an element")
        };
        el.children = children;
    }

    #[must_use]
    pub fn finish(mut self, root: Children) -> CompilerSyntaxTree {
        self.compiler_syntax_tree.root = root;
        self.compiler_syntax_tree
    }

    /// Upstream `element` (phases/1-parse/state/element.js): `meta_tags`, then
    /// `regex_valid_component_name`, then `<title>` under `<svelte:head>`, then `<slot>`.
    #[must_use]
    pub fn element_kind(&self, name: &str, parent: Option<CompilerNodeIdentifier>) -> ElementKind {
        if let Some(meta) = name.strip_prefix("svelte:") {
            return ElementKind::Metadata(meta_tag(meta));
        }
        if is_component_name(name) {
            return ElementKind::Component;
        }
        if name == "title" && self.parent_is_head(parent) {
            return ElementKind::Title;
        }
        if name == "slot" && !self.parent_is_shadowroot_template(parent) {
            return ElementKind::Slot;
        }
        ElementKind::Regular
    }

    /// Blocks and elements other than regular elements and components are transparent.
    fn parent_is_head(&self, mut at: Option<CompilerNodeIdentifier>) -> bool {
        while let Some(identifier) = at {
            if let NodeKind::Element(el) = &self.compiler_syntax_tree.nodes[identifier].kind {
                match el.kind {
                    ElementKind::Metadata(Some(MetadataTag::Head)) => return true,
                    ElementKind::Regular | ElementKind::Component => return false,
                    _ => {}
                }
            }
            at = self.compiler_syntax_tree.nodes[identifier].parent;
        }
        false
    }

    fn parent_is_shadowroot_template(&self, mut at: Option<CompilerNodeIdentifier>) -> bool {
        while let Some(identifier) = at {
            if let NodeKind::Element(el) = &self.compiler_syntax_tree.nodes[identifier].kind
                && el.kind == ElementKind::Regular
                && self
                    .compiler_syntax_tree
                    .attributes(el.attributes)
                    .iter()
                    .any(|a| a.name.text(self.source_text) == "shadowrootmode")
            {
                return true;
            }
            at = self.compiler_syntax_tree.nodes[identifier].parent;
        }
        false
    }
}

/// The Svelte frontend: the surface tree as written, to the HIR.
struct SurfaceBuilder<'a> {
    c: &'a Component,
    source_text: &'a str,
    b: CompilerSyntaxTreeBuilder<'a>,
}

impl SurfaceBuilder<'_> {
    fn list(
        &mut self,
        list: &[TemplateNodeIdentifier],
        parent: Option<CompilerNodeIdentifier>,
    ) -> Children {
        let identifiers: Vec<CompilerNodeIdentifier> =
            list.iter().map(|&t| self.node(t, parent)).collect();
        self.b.children(&identifiers)
    }

    fn node(
        &mut self,
        t: TemplateNodeIdentifier,
        parent: Option<CompilerNodeIdentifier>,
    ) -> CompilerNodeIdentifier {
        let (c, source_text) = (self.c, self.source_text);
        let surface = c.node(t);
        let placeholder = NodeKind::Comment {
            data: Span::default(),
        };
        let identifier = self.b.node(placeholder, surface.span(), parent, t);
        let kind = match *surface {
            TemplateNode::Text { span } => text(span, source_text),
            TemplateNode::Comment { data, .. } => NodeKind::Comment { data },
            TemplateNode::Expression { expression, .. } => NodeKind::Expression { expression },
            TemplateNode::Element {
                name,
                attributes,
                children,
                start_tag,
                ..
            } => {
                let kind = self.b.element_kind(name.text(source_text), parent);
                let attributes =
                    self.b
                        .attributes(c.attributes(attributes).iter().enumerate().map(|(i, a)| {
                            Attribute {
                                name: Name::Source(a.directive_name().unwrap_or(a.name)),
                                value: attribute_value(c, source_text, a),
                                span: a.span,
                                owner: identifier,
                                origin: attributes.start + i as u32,
                            }
                        }));
                // `element_kind` of a descendant reads this node's kind and attributes.
                self.b.set_kind(
                    identifier,
                    NodeKind::Element(Element {
                        name,
                        kind,
                        attributes,
                        children: Children::default(),
                        start_tag,
                    }),
                );
                let children = self.list(c.children(children), Some(identifier));
                self.b.set_element_children(identifier, children);
                return identifier;
            }
            TemplateNode::Each {
                expression,
                context,
                index,
                key,
                body,
                fallback,
                has_fallback,
                ..
            } => {
                let body = self.list(c.children(body), Some(identifier));
                let fallback =
                    has_fallback.then(|| self.list(c.children(fallback), Some(identifier)));
                NodeKind::Each(Each {
                    collection: expression,
                    context,
                    index,
                    key,
                    body,
                    fallback,
                })
            }
            TemplateNode::If { .. } => {
                let chain = c.if_branches(t);
                let mut branches = Vec::with_capacity(chain.len());
                for &b in &chain {
                    let TemplateNode::If {
                        test, consequent, ..
                    } = *c.node(b)
                    else {
                        unreachable!("if_branches returns If nodes")
                    };
                    branches.push(Branch {
                        test,
                        body: self.list(c.children(consequent), Some(identifier)),
                        origin: b,
                    });
                }
                let last = *chain.last().expect("a chain has its own node");
                let TemplateNode::If { alternate, .. } = *c.node(last) else {
                    unreachable!("if_branches returns If nodes")
                };
                let otherwise = alternate.map(|a| self.list(c.children(a), Some(identifier)));
                NodeKind::If {
                    branches: self.b.branches(branches),
                    otherwise,
                }
            }
        };
        self.b.set_kind(identifier, kind);
        identifier
    }
}

/// A text node of `raw`, with its decoded text when decoding changes it.
#[must_use]
pub fn text(raw: Span, source_text: &str) -> NodeKind {
    NodeKind::Text {
        raw,
        decoded: match decode_text(raw.text(source_text)) {
            std::borrow::Cow::Borrowed(_) => None,
            std::borrow::Cow::Owned(s) => Some(s.into_boxed_str()),
        },
        spelled: false,
    }
}

/// A text node whose text a frontend spelled; `from` is where it was written.
#[must_use]
pub const fn spelled_text(from: Span, text: Box<str>) -> NodeKind {
    NodeKind::Text {
        raw: from,
        decoded: Some(text),
        spelled: true,
    }
}

fn meta_tag(name: &str) -> Option<MetadataTag> {
    Some(match name {
        "head" => MetadataTag::Head,
        "options" => MetadataTag::Options,
        "window" => MetadataTag::Window,
        "document" => MetadataTag::Document,
        "body" => MetadataTag::Body,
        "element" => MetadataTag::Element,
        "component" => MetadataTag::Component,
        "self" => MetadataTag::SelfRef,
        "fragment" => MetadataTag::Fragment,
        "boundary" => MetadataTag::Boundary,
        _ => return None,
    })
}

fn attribute_value(c: &Component, source_text: &str, a: &syntax_tree::Attribute) -> AttributeValue {
    let parts = match a.value {
        syntax_tree::AttributeValue::True => return AttributeValue::Boolean,
        syntax_tree::AttributeValue::Parts(r) => c.parts(r),
    };
    match parts {
        [Part::Expression { expression, .. }] if a.kind == syntax_tree::AttributeKind::Bind => {
            AttributeValue::Bind(*expression)
        }
        [Part::Expression { expression, .. }] if a.kind == syntax_tree::AttributeKind::Attach => {
            AttributeValue::Attach(*expression)
        }
        [Part::Expression { expression, .. }] if a.kind == syntax_tree::AttributeKind::Class => {
            AttributeValue::Class(*expression)
        }
        [Part::Expression { expression, .. }] if a.kind == syntax_tree::AttributeKind::Spread => {
            AttributeValue::Spread(*expression)
        }
        [Part::Expression { expression, .. }] if a.shorthand => {
            AttributeValue::Shorthand(*expression)
        }
        [Part::Expression { expression, .. }] => AttributeValue::Expression {
            expression: *expression,
            quoted: a.quoted,
        },
        [_, ..] if parts.iter().all(|p| matches!(p, Part::Text(_))) => AttributeValue::Static(
            parts
                .iter()
                .map(|p| match p {
                    Part::Text(s) => decode_text(s.text(source_text)),
                    Part::Expression { .. } => unreachable!("all text"),
                })
                .collect::<String>()
                .into_boxed_str(),
        ),
        _ => AttributeValue::Interpolated(parts.into()),
    }
}

/// Upstream `regex_valid_component_name`, split at its alternation (ZWNJ and ZWJ escaped):
///
/// ```text
/// ^(?:\p{Lu}[$\u{200C}\u{200D}\p{ID_Continue}.]*
///   |\p{ID_Start}[$\u{200C}\u{200D}\p{ID_Continue}]*(?:\.[$\u{200C}\u{200D}\p{ID_Continue}]+)+)$
/// ```
#[must_use]
pub fn is_component_name(name: &str) -> bool {
    let continues = |c: char| {
        c == '$'
            || c == '\u{200c}'
            || c == '\u{200d}'
            || unicode_identifier_start::is_id_continue(c)
    };
    let mut chars = name.chars();
    let Some(first) = chars.next() else {
        return false;
    };
    let rest = chars.as_str();
    if is_uppercase_letter(first) && rest.chars().all(|c| continues(c) || c == '.') {
        return true;
    }
    if !unicode_identifier_start::is_id_start(first) {
        return false;
    }
    let mut segments = rest.split('.');
    let Some(head) = segments.next() else {
        return false;
    };
    let mut members = 0;
    for seg in segments {
        if seg.is_empty() || !seg.chars().all(continues) {
            return false;
        }
        members += 1;
    }
    members > 0 && head.chars().all(continues)
}

/// `\p{Lu}`: Rust's `is_uppercase` is the Uppercase property, which adds `Other_Uppercase`.
fn is_uppercase_letter(c: char) -> bool {
    const OTHER_UPPERCASE: &[(char, char)] = &[
        ('\u{2160}', '\u{216f}'),
        ('\u{24b6}', '\u{24cf}'),
        ('\u{1f130}', '\u{1f149}'),
        ('\u{1f150}', '\u{1f169}'),
        ('\u{1f170}', '\u{1f189}'),
    ];
    c.is_uppercase()
        && !OTHER_UPPERCASE
            .iter()
            .any(|&(start_offset, end_offset)| (start_offset..=end_offset).contains(&c))
}

// Pinned so a change to a node's layout is a decision: one `Node` per HIR node, one `Attribute`
// per attribute of every component.
#[cfg(target_pointer_width = "64")]
const _: () = assert!(size_of::<Node>() == 56, "`Node` is 56 bytes");
#[cfg(target_pointer_width = "64")]
const _: () = assert!(size_of::<Attribute>() == 64, "`Attribute` is 64 bytes");
const _: () = assert!(
    size_of::<Option<CompilerNodeIdentifier>>() == 4,
    "`Option<CompilerNodeIdentifier>` is 4 bytes"
);

#[cfg(test)]
mod tests {
    use super::*;

    fn compiler_syntax_tree(source_text: &str) -> (Component, CompilerSyntaxTree) {
        let c = crate::syntax::parse::parse(source_text).expect("parses");
        let h = lower(&c, source_text);
        (c, h)
    }

    #[test]
    fn an_else_if_chain_is_one_node_with_its_branches() {
        let source_text = "{#if a}A{:else if b}B{:else if c}C{:else}D{/if}";
        let (_, h) = compiler_syntax_tree(source_text);
        let [top] = h.children(h.root) else {
            panic!("one top-level node")
        };
        let NodeKind::If {
            branches,
            otherwise,
        } = h.node(*top).kind
        else {
            panic!("an if")
        };
        let bodies: Vec<&str> = h
            .branches(branches)
            .iter()
            .map(|b| {
                let [t] = h.children(b.body) else { panic!() };
                h.node(*t).kind.text(source_text).unwrap()
            })
            .collect();
        assert_eq!(bodies, ["A", "B", "C"]);
        let [d] = h.children(otherwise.expect("an else")) else {
            panic!()
        };
        assert_eq!(h.node(*d).kind.text(source_text), Some("D"));
        assert_eq!(h.node(*d).parent, Some(*top));
    }

    #[test]
    fn attribute_values_are_classified() {
        let source_text = "<p a b=\"x&amp;y\" c={e} d=\"{e}\" {e} f=\"x{e}\" g=\"\" h=></p>";
        let (_, h) = compiler_syntax_tree(source_text);
        let (_, el) = h.elements().next().expect("an element");
        let got: Vec<String> = h
            .attributes(el.attributes)
            .iter()
            .map(|a| match &a.value {
                AttributeValue::Boolean => "boolean".into(),
                AttributeValue::Static(v) => format!("static {v:?}"),
                AttributeValue::Expression { quoted, .. } => format!("expression quoted={quoted}"),
                AttributeValue::Shorthand(_) => "shorthand".into(),
                AttributeValue::Interpolated(p) => format!("interpolated {}", p.len()),
                AttributeValue::Bind(_) => "bind".into(),
                AttributeValue::Attach(_) => "attach".into(),
                AttributeValue::Class(_) => "class".into(),
                AttributeValue::Spread(_) => "spread".into(),
            })
            .collect();
        assert_eq!(
            got,
            [
                "boolean",
                "static \"x&y\"",
                "expression quoted=false",
                "expression quoted=true",
                "shorthand",
                "interpolated 2",
                "static \"\"",
                "interpolated 0"
            ]
        );
    }

    #[test]
    fn element_kinds_follow_the_svelte_parser() {
        use ElementKind::*;
        let source_text = "<svelte:head><title>t</title></svelte:head><div><title>u</title></div>\
                   <Foo/><a.b/><slot/>\
                   <template shadowrootmode=\"open\"><slot/></template><svelte:nope/>";
        let (_, h) = compiler_syntax_tree(source_text);
        let got: Vec<(String, ElementKind)> = h
            .elements()
            .map(|(_, el)| (el.name.text(source_text).to_owned(), el.kind))
            .collect();
        let want = [
            ("svelte:head", Metadata(Some(MetadataTag::Head))),
            ("title", Title),
            ("div", Regular),
            ("title", Regular),
            ("Foo", Component),
            ("a.b", Component),
            ("slot", Slot),
            ("template", Regular),
            ("slot", Regular),
            ("svelte:nope", Metadata(None)),
        ];
        let want: Vec<(String, ElementKind)> =
            want.iter().map(|(n, k)| (n.to_string(), *k)).collect();
        assert_eq!(got, want);
    }

    #[test]
    fn component_names_match_the_upstream_pattern() {
        for (name, want) in [
            ("Foo", true),
            ("Foo.bar", true),
            ("foo.bar", true),
            ("Ärger", true),
            ("foo", false),
            ("foo.", false),
            ("_x.y", false),
            ("x-y", false),
            ("\u{2160}", false),
        ] {
            assert_eq!(is_component_name(name), want, "{name}");
        }
    }

    #[test]
    fn every_node_points_back_to_its_surface_node() {
        let source_text = "<p>a</p>{#if x}<b/>{/if}";
        let (c, h) = compiler_syntax_tree(source_text);
        for (identifier, n) in h.nodes.iter_enumerated() {
            assert_eq!(
                c.node(h.origin[identifier]).span(),
                n.span,
                "{identifier:?}"
            );
        }
    }
}
