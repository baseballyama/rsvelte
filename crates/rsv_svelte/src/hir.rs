//! The component's HIR: the template as the compiler understands it rather than as it was written.
//!
//! Analysis and lowering read only this, so any frontend that builds it can be compiled. The
//! Svelte frontend builds it from the surface tree ([`crate::ast`]) in [`lower`]; source text is
//! read only for names. What changes on the way:
//!
//! - an `{#if}…{:else if}…{:else}` chain is one node with its branches, not nested `If`s;
//! - a `bind:` directive is an attribute named by its property, with an [`AttrValue::Bind`];
//! - every element knows its kind (regular, component, `<title>` in `<svelte:head>`, `<slot>`,
//!   `svelte:` meta tag), decided the way the Svelte parser decides it;
//! - an attribute value is classified (boolean, static text with character references decoded, one
//!   expression, shorthand, interpolated) instead of being a list of chunks;
//! - text is decoded;
//! - every node has a [`HirId`], a parent, and its origin: the frontend's id of the node it was
//!   built from.
//!
//! JavaScript expressions stay in the component's one [`rsv_js::Ast`]; what a name in them refers
//! to is on [`crate::resolve::Resolution`], keyed by the same [`NodeId`]s. Facts later layers add
//! about HIR nodes (types, control flow) are side tables over [`HirId`].

use rsv_js::NodeId;
use rsv_kernel::idx::{IdxRange, IndexVec};
use rsv_kernel::newtype_index;
use rsv_kernel::source::Span;

use crate::ast::{self, Component, TId, TNode, decode_text};

/// A chunk of an attribute value as written.
#[derive(Debug, Clone, Copy)]
pub enum Part {
    Text(Span),
    Expr {
        expr: NodeId,
        /// Braces included.
        span: Span,
    },
}

newtype_index!(
    pub struct HirId;
);
newtype_index!(
    pub struct AttrId;
);

#[derive(Debug)]
pub struct Hir {
    pub nodes: IndexVec<HirId, Node>,
    pub attrs: IndexVec<AttrId, Attribute>,
    /// The frontend's node each HIR node was built from. For Svelte, an `{#if}` chain's node
    /// points at its first `If`; each [`Branch`] carries its own.
    pub origin: IndexVec<HirId, TId>,
    kids: Vec<HirId>,
    branches: Vec<Branch>,
    pub root: Children,
}

/// A slice of [`Hir`]'s child list.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub struct Children {
    start: u32,
    len: u32,
}

#[derive(Debug)]
pub struct Node {
    pub kind: NodeKind,
    pub span: Span,
    /// The enclosing element or block; `None` at the top level.
    pub parent: Option<HirId>,
}

#[derive(Debug)]
pub enum NodeKind {
    Text {
        raw: Span,
        /// Present only when decoding changed the text.
        decoded: Option<Box<str>>,
    },
    Comment {
        data: Span,
    },
    Expr {
        expr: NodeId,
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
    pub collection: NodeId,
    /// A pattern node; `NodeId::NONE` when absent, as are `index` and `key`.
    pub context: NodeId,
    /// An identifier node.
    pub index: NodeId,
    pub key: NodeId,
    pub body: Children,
    pub fallback: Option<Children>,
}

impl Each {
    #[must_use]
    pub const fn context(&self) -> Option<NodeId> {
        some(self.context)
    }

    #[must_use]
    pub const fn index(&self) -> Option<NodeId> {
        some(self.index)
    }

    #[must_use]
    pub const fn key(&self) -> Option<NodeId> {
        some(self.key)
    }

    /// Upstream's `metadata.keyed`: a key other than the index itself.
    #[must_use]
    pub fn keyed(&self, js: &rsv_js::Ast) -> bool {
        let Some(key) = self.key() else {
            return false;
        };
        let is_index = matches!(js.kind(key), rsv_js::Kind::Ident(_))
            && self
                .index()
                .is_some_and(|i| js.atom(i).is_some() && js.atom(i) == js.atom(key));
        !is_index
    }
}

const fn some(id: NodeId) -> Option<NodeId> {
    if id.0 == NodeId::NONE.0 {
        None
    } else {
        Some(id)
    }
}

#[derive(Debug)]
pub struct Element {
    pub name: Span,
    pub kind: ElementKind,
    pub attrs: IdxRange<AttrId>,
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
    Meta(Option<MetaTag>),
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum MetaTag {
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

/// A slice of [`Hir`]'s branch list.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Branches {
    start: u32,
    len: u32,
}

#[derive(Debug)]
pub struct Branch {
    pub test: NodeId,
    pub body: Children,
    pub origin: TId,
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
    pub fn text<'a>(&'a self, src: &'a str) -> &'a str {
        match self {
            Self::Source(span) => span.text(src),
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
    pub value: AttrValue,
    pub span: Span,
    pub owner: HirId,
    /// The frontend's id of the attribute; for Svelte, an index into the surface attribute list.
    pub origin: u32,
}

#[derive(Debug)]
pub enum AttrValue {
    /// `<input disabled>`
    Boolean,
    /// Text only, character references decoded; `a=""` is `Static("")`.
    Static(Box<str>),
    /// `a={e}`, or `a="{e}"` with `quoted`.
    Expression { expr: NodeId, quoted: bool },
    /// `{a}`
    Shorthand(NodeId),
    /// Text and expressions, or several expressions: `class="a {b}"`. Empty for `a=` followed by
    /// nothing, which is not the empty text `a=""`: the compiler sets it at runtime.
    Interpolated(Box<[Part]>),
    /// `bind:name={e}`: the attribute's name is the bound property.
    Bind(NodeId),
}

impl Hir {
    #[must_use]
    pub fn node(&self, id: HirId) -> &Node {
        &self.nodes[id]
    }

    #[must_use]
    pub fn children(&self, c: Children) -> &[HirId] {
        &self.kids[c.start as usize..(c.start + c.len) as usize]
    }

    #[must_use]
    pub fn branches(&self, b: Branches) -> &[Branch] {
        &self.branches[b.start as usize..(b.start + b.len) as usize]
    }

    #[must_use]
    pub fn attrs(&self, r: IdxRange<AttrId>) -> &[Attribute] {
        self.attrs.slice(r)
    }

    pub fn elements(&self) -> impl Iterator<Item = (HirId, &Element)> {
        self.nodes
            .iter_enumerated()
            .filter_map(|(id, n)| match &n.kind {
                NodeKind::Element(el) => Some((id, el)),
                _ => None,
            })
    }

    #[must_use]
    pub const fn heap_bytes(&self) -> usize {
        self.nodes.capacity() * size_of::<Node>()
            + self.attrs.capacity() * size_of::<Attribute>()
            + self.origin.capacity() * size_of::<TId>()
            + self.kids.capacity() * size_of::<HirId>()
            + self.branches.capacity() * size_of::<Branch>()
    }
}

impl NodeKind {
    /// The text of a `Text` node, decoded.
    #[must_use]
    pub fn text<'a>(&'a self, src: &'a str) -> Option<&'a str> {
        match self {
            Self::Text { raw, decoded } => {
                Some(decoded.as_deref().unwrap_or_else(|| raw.text(src)))
            }
            _ => None,
        }
    }
}

#[must_use]
pub fn lower(c: &Component, src: &str) -> Hir {
    let mut b = SurfaceBuilder {
        c,
        src,
        b: HirBuilder::new(src, c.nodes.len(), c.attrs.len()),
    };
    let root = b.list(c.children(c.root), None);
    b.b.finish(root)
}

/// Builds a [`Hir`] for a frontend.
///
/// A node is added before its children, so building a child can ask about its ancestors
/// ([`HirBuilder::element_kind`]); each child list is recorded once its nodes exist
/// ([`HirBuilder::children`]), which keeps every list contiguous.
#[derive(Debug)]
pub struct HirBuilder<'s> {
    src: &'s str,
    hir: Hir,
}

impl<'s> HirBuilder<'s> {
    #[must_use]
    pub fn new(src: &'s str, nodes: usize, attrs: usize) -> Self {
        HirBuilder {
            src,
            hir: Hir {
                nodes: IndexVec::with_capacity(nodes),
                attrs: IndexVec::with_capacity(attrs),
                origin: IndexVec::with_capacity(nodes),
                kids: Vec::with_capacity(nodes),
                branches: Vec::new(),
                root: Children::default(),
            },
        }
    }

    /// Adds a node; an element or an `if` gets its kind from [`HirBuilder::set_kind`] once its
    /// children are built.
    pub fn node(
        &mut self,
        kind: NodeKind,
        span: Span,
        parent: Option<HirId>,
        origin: TId,
    ) -> HirId {
        self.hir.origin.push(origin);
        self.hir.nodes.push(Node { kind, span, parent })
    }

    pub fn set_kind(&mut self, id: HirId, kind: NodeKind) {
        self.hir.nodes[id].kind = kind;
    }

    /// For a node whose extent is known only after its children (a chain of branches).
    pub fn set_span(&mut self, id: HirId, span: Span) {
        self.hir.nodes[id].span = span;
    }

    /// Records the attributes of the element `owner` will be; returns their range.
    pub fn attributes(&mut self, attrs: impl IntoIterator<Item = Attribute>) -> IdxRange<AttrId> {
        let first = self.hir.attrs.next_id();
        for a in attrs {
            self.hir.attrs.push(a);
        }
        IdxRange::new(first, self.hir.attrs.next_id())
    }

    pub fn children(&mut self, ids: &[HirId]) -> Children {
        let start = self.hir.kids.len() as u32;
        self.hir.kids.extend(ids);
        Children {
            start,
            len: ids.len() as u32,
        }
    }

    pub fn branches(&mut self, branches: impl IntoIterator<Item = Branch>) -> Branches {
        let start = self.hir.branches.len() as u32;
        self.hir.branches.extend(branches);
        Branches {
            start,
            len: self.hir.branches.len() as u32 - start,
        }
    }

    /// Sets the children of an element added with no children yet.
    ///
    /// # Panics
    ///
    /// If `id` is not an element.
    pub fn set_element_children(&mut self, id: HirId, children: Children) {
        let NodeKind::Element(el) = &mut self.hir.nodes[id].kind else {
            panic!("{id:?} is not an element")
        };
        el.children = children;
    }

    #[must_use]
    pub fn finish(mut self, root: Children) -> Hir {
        self.hir.root = root;
        self.hir
    }

    /// Upstream `element` (phases/1-parse/state/element.js): `meta_tags`, then
    /// `regex_valid_component_name`, then `<title>` under `<svelte:head>`, then `<slot>`.
    #[must_use]
    pub fn element_kind(&self, name: &str, parent: Option<HirId>) -> ElementKind {
        if let Some(meta) = name.strip_prefix("svelte:") {
            return ElementKind::Meta(meta_tag(meta));
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
    fn parent_is_head(&self, mut at: Option<HirId>) -> bool {
        while let Some(id) = at {
            if let NodeKind::Element(el) = &self.hir.nodes[id].kind {
                match el.kind {
                    ElementKind::Meta(Some(MetaTag::Head)) => return true,
                    ElementKind::Regular | ElementKind::Component => return false,
                    _ => {}
                }
            }
            at = self.hir.nodes[id].parent;
        }
        false
    }

    fn parent_is_shadowroot_template(&self, mut at: Option<HirId>) -> bool {
        while let Some(id) = at {
            if let NodeKind::Element(el) = &self.hir.nodes[id].kind
                && el.kind == ElementKind::Regular
                && self
                    .hir
                    .attrs(el.attrs)
                    .iter()
                    .any(|a| a.name.text(self.src) == "shadowrootmode")
            {
                return true;
            }
            at = self.hir.nodes[id].parent;
        }
        false
    }
}

/// The Svelte frontend: the surface tree as written, to the HIR.
struct SurfaceBuilder<'a> {
    c: &'a Component,
    src: &'a str,
    b: HirBuilder<'a>,
}

impl SurfaceBuilder<'_> {
    fn list(&mut self, list: &[TId], parent: Option<HirId>) -> Children {
        let ids: Vec<HirId> = list.iter().map(|&t| self.node(t, parent)).collect();
        self.b.children(&ids)
    }

    fn node(&mut self, t: TId, parent: Option<HirId>) -> HirId {
        let (c, src) = (self.c, self.src);
        let surface = c.node(t);
        let placeholder = NodeKind::Comment {
            data: Span::default(),
        };
        let id = self.b.node(placeholder, surface.span(), parent, t);
        let kind = match *surface {
            TNode::Text { span } => text(span, src),
            TNode::Comment { data, .. } => NodeKind::Comment { data },
            TNode::Expr { expr, .. } => NodeKind::Expr { expr },
            TNode::Element {
                name,
                attrs,
                children,
                start_tag,
                ..
            } => {
                let kind = self.b.element_kind(name.text(src), parent);
                let attributes =
                    self.b
                        .attributes(c.attrs(attrs).iter().enumerate().map(|(i, a)| Attribute {
                            name: Name::Source(a.bind_property().unwrap_or(a.name)),
                            value: attr_value(c, src, a),
                            span: a.span,
                            owner: id,
                            origin: attrs.start + i as u32,
                        }));
                // `element_kind` of a descendant reads this node's kind and attributes.
                self.b.set_kind(
                    id,
                    NodeKind::Element(Element {
                        name,
                        kind,
                        attrs: attributes,
                        children: Children::default(),
                        start_tag,
                    }),
                );
                let children = self.list(c.children(children), Some(id));
                self.b.set_element_children(id, children);
                return id;
            }
            TNode::Each {
                expr,
                context,
                index,
                key,
                body,
                fallback,
                has_fallback,
                ..
            } => {
                let body = self.list(c.children(body), Some(id));
                let fallback = has_fallback.then(|| self.list(c.children(fallback), Some(id)));
                NodeKind::Each(Each {
                    collection: expr,
                    context,
                    index,
                    key,
                    body,
                    fallback,
                })
            }
            TNode::If { .. } => {
                let chain = c.if_branches(t);
                let mut branches = Vec::with_capacity(chain.len());
                for &b in &chain {
                    let TNode::If { test, cons, .. } = *c.node(b) else {
                        unreachable!("if_branches returns If nodes")
                    };
                    branches.push(Branch {
                        test,
                        body: self.list(c.children(cons), Some(id)),
                        origin: b,
                    });
                }
                let last = *chain.last().expect("a chain has its own node");
                let TNode::If { alt, .. } = *c.node(last) else {
                    unreachable!("if_branches returns If nodes")
                };
                let otherwise = alt.map(|a| self.list(c.children(a), Some(id)));
                NodeKind::If {
                    branches: self.b.branches(branches),
                    otherwise,
                }
            }
        };
        self.b.set_kind(id, kind);
        id
    }
}

/// A text node of `raw`, with its decoded text when decoding changes it.
#[must_use]
pub fn text(raw: Span, src: &str) -> NodeKind {
    NodeKind::Text {
        raw,
        decoded: match decode_text(raw.text(src)) {
            std::borrow::Cow::Borrowed(_) => None,
            std::borrow::Cow::Owned(s) => Some(s.into_boxed_str()),
        },
    }
}

fn meta_tag(name: &str) -> Option<MetaTag> {
    Some(match name {
        "head" => MetaTag::Head,
        "options" => MetaTag::Options,
        "window" => MetaTag::Window,
        "document" => MetaTag::Document,
        "body" => MetaTag::Body,
        "element" => MetaTag::Element,
        "component" => MetaTag::Component,
        "self" => MetaTag::SelfRef,
        "fragment" => MetaTag::Fragment,
        "boundary" => MetaTag::Boundary,
        _ => return None,
    })
}

fn attr_value(c: &Component, src: &str, a: &ast::Attr) -> AttrValue {
    let parts = match a.value {
        ast::AttrValue::True => return AttrValue::Boolean,
        ast::AttrValue::Parts(r) => c.parts(r),
    };
    match parts {
        [Part::Expr { expr, .. }] if a.kind == ast::AttrKind::Bind => AttrValue::Bind(*expr),
        [Part::Expr { expr, .. }] if a.shorthand => AttrValue::Shorthand(*expr),
        [Part::Expr { expr, .. }] => AttrValue::Expression {
            expr: *expr,
            quoted: a.quoted,
        },
        [_, ..] if parts.iter().all(|p| matches!(p, Part::Text(_))) => AttrValue::Static(
            parts
                .iter()
                .map(|p| match p {
                    Part::Text(s) => decode_text(s.text(src)),
                    Part::Expr { .. } => unreachable!("all text"),
                })
                .collect::<String>()
                .into_boxed_str(),
        ),
        _ => AttrValue::Interpolated(parts.into()),
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
        c == '$' || c == '\u{200c}' || c == '\u{200d}' || unicode_id_start::is_id_continue(c)
    };
    let mut chars = name.chars();
    let Some(first) = chars.next() else {
        return false;
    };
    let rest = chars.as_str();
    if is_uppercase_letter(first) && rest.chars().all(|c| continues(c) || c == '.') {
        return true;
    }
    if !unicode_id_start::is_id_start(first) {
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
            .any(|&(lo, hi)| (lo..=hi).contains(&c))
}

// Pinned so a change to a node's layout is a decision: one `Node` per HIR node, one `Attribute`
// per attribute of every component.
const _: () = assert!(size_of::<Node>() == 56, "`Node` is 56 bytes");
const _: () = assert!(size_of::<Attribute>() == 64, "`Attribute` is 64 bytes");
const _: () = assert!(
    size_of::<Option<HirId>>() == 4,
    "`Option<HirId>` is 4 bytes"
);

#[cfg(test)]
mod tests {
    use super::*;

    fn hir(src: &str) -> (Component, Hir) {
        let c = crate::parse::parse(src).expect("parses");
        let h = lower(&c, src);
        (c, h)
    }

    #[test]
    fn an_else_if_chain_is_one_node_with_its_branches() {
        let src = "{#if a}A{:else if b}B{:else if c}C{:else}D{/if}";
        let (_, h) = hir(src);
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
                h.node(*t).kind.text(src).unwrap()
            })
            .collect();
        assert_eq!(bodies, ["A", "B", "C"]);
        let [d] = h.children(otherwise.expect("an else")) else {
            panic!()
        };
        assert_eq!(h.node(*d).kind.text(src), Some("D"));
        assert_eq!(h.node(*d).parent, Some(*top));
    }

    #[test]
    fn attribute_values_are_classified() {
        let src = "<p a b=\"x&amp;y\" c={e} d=\"{e}\" {e} f=\"x{e}\" g=\"\" h=></p>";
        let (_, h) = hir(src);
        let (_, el) = h.elements().next().expect("an element");
        let got: Vec<String> = h
            .attrs(el.attrs)
            .iter()
            .map(|a| match &a.value {
                AttrValue::Boolean => "boolean".into(),
                AttrValue::Static(v) => format!("static {v:?}"),
                AttrValue::Expression { quoted, .. } => format!("expression quoted={quoted}"),
                AttrValue::Shorthand(_) => "shorthand".into(),
                AttrValue::Interpolated(p) => format!("interpolated {}", p.len()),
                AttrValue::Bind(_) => "bind".into(),
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
        let src = "<svelte:head><title>t</title></svelte:head><div><title>u</title></div>\
                   <Foo/><a.b/><slot/>\
                   <template shadowrootmode=\"open\"><slot/></template><svelte:nope/>";
        let (_, h) = hir(src);
        let got: Vec<(String, ElementKind)> = h
            .elements()
            .map(|(_, el)| (el.name.text(src).to_owned(), el.kind))
            .collect();
        let want = [
            ("svelte:head", Meta(Some(MetaTag::Head))),
            ("title", Title),
            ("div", Regular),
            ("title", Regular),
            ("Foo", Component),
            ("a.b", Component),
            ("slot", Slot),
            ("template", Regular),
            ("slot", Regular),
            ("svelte:nope", Meta(None)),
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
        let src = "<p>a</p>{#if x}<b/>{/if}";
        let (c, h) = hir(src);
        for (id, n) in h.nodes.iter_enumerated() {
            assert_eq!(c.node(h.origin[id]).span(), n.span, "{id:?}");
        }
    }
}
