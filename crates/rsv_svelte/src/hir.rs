//! The component's HIR: the template as the compiler understands it rather than as it was written.
//!
//! Built from the surface tree ([`crate::ast`]). Source text is read only for names and for the
//! one fact the surface tree does not record, whether an attribute was written as a shorthand
//! `{a}`. What changes on the way:
//!
//! - an `{#if}…{:else if}…{:else}` chain is one node with its branches, not nested `If`s;
//! - every element knows its kind (regular, component, `<title>` in `<svelte:head>`, `<slot>`,
//!   `svelte:` meta tag), decided the way the Svelte parser decides it;
//! - an attribute value is classified (boolean, static text with character references decoded, one
//!   expression, shorthand, interpolated) instead of being a list of chunks;
//! - text is decoded;
//! - every node has a [`HirId`], a parent, and its origin in the surface tree.
//!
//! JavaScript expressions stay in the component's one [`rsv_js::Ast`]; what a name in them refers
//! to is on [`crate::resolve::Resolution`], keyed by the same [`NodeId`]s. Facts later layers add
//! about HIR nodes (types, control flow) are side tables over [`HirId`].

use crate::ast::{self, Component, TId, TNode, decode_text};
use rsv_js::NodeId;
use rsv_kernel::idx::{IdxRange, IndexVec};
use rsv_kernel::newtype_index;
use rsv_kernel::source::Span;

newtype_index!(
    pub struct HirId;
);
newtype_index!(
    pub struct AttrId;
);

pub struct Hir {
    pub nodes: IndexVec<HirId, Node>,
    pub attrs: IndexVec<AttrId, Attribute>,
    /// The surface node each HIR node was built from. An `{#if}` chain's node points at its
    /// first `If`; each [`Branch`] carries its own.
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

pub struct Node {
    pub kind: NodeKind,
    pub span: Span,
    /// The enclosing element or block; `None` at the top level.
    pub parent: Option<HirId>,
}

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
}

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

pub struct Branch {
    pub test: NodeId,
    pub body: Children,
    pub origin: TId,
}

pub struct Attribute {
    pub name: Span,
    pub value: AttrValue,
    pub span: Span,
    pub owner: HirId,
    /// Index into the surface tree's attribute list.
    pub origin: u32,
}

pub enum AttrValue {
    /// `<input disabled>`
    Boolean,
    /// Text only, character references decoded; `a=""` is `Static("")`.
    Static(Box<str>),
    /// `a={e}`, or `a="{e}"` with `quoted`.
    Expression { expr: NodeId, quoted: bool },
    /// `{a}`
    Shorthand(NodeId),
    /// Text and expressions, or several expressions: `class="a {b}"`.
    Interpolated(Box<[ast::Part]>),
}

impl Hir {
    pub fn node(&self, id: HirId) -> &Node {
        &self.nodes[id]
    }

    pub fn children(&self, c: Children) -> &[HirId] {
        &self.kids[c.start as usize..(c.start + c.len) as usize]
    }

    pub fn branches(&self, b: Branches) -> &[Branch] {
        &self.branches[b.start as usize..(b.start + b.len) as usize]
    }

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

    pub fn heap_bytes(&self) -> usize {
        self.nodes.capacity() * size_of::<Node>()
            + self.attrs.capacity() * size_of::<Attribute>()
            + self.origin.capacity() * size_of::<TId>()
            + self.kids.capacity() * size_of::<HirId>()
            + self.branches.capacity() * size_of::<Branch>()
    }
}

impl NodeKind {
    /// The text of a `Text` node, decoded.
    pub fn text<'a>(&'a self, src: &'a str) -> Option<&'a str> {
        match self {
            NodeKind::Text { raw, decoded } => Some(decoded.as_deref().unwrap_or(raw.text(src))),
            _ => None,
        }
    }
}

pub fn lower(c: &Component, src: &str) -> Hir {
    let mut b = Builder {
        c,
        src,
        hir: Hir {
            nodes: IndexVec::with_capacity(c.nodes.len()),
            attrs: IndexVec::with_capacity(c.attrs.len()),
            origin: IndexVec::with_capacity(c.nodes.len()),
            kids: Vec::with_capacity(c.kids.len()),
            branches: Vec::new(),
            root: Children::default(),
        },
    };
    b.hir.root = b.list(c.children(c.root), None);
    b.hir
}

struct Builder<'a> {
    c: &'a Component,
    src: &'a str,
    hir: Hir,
}

impl Builder<'_> {
    /// Children are built first and their ids appended afterwards, so a list is contiguous even
    /// though building each child appends its own children.
    fn list(&mut self, list: &[TId], parent: Option<HirId>) -> Children {
        let ids: Vec<HirId> = list.iter().map(|&t| self.node(t, parent)).collect();
        let start = self.hir.kids.len() as u32;
        self.hir.kids.extend(&ids);
        Children {
            start,
            len: ids.len() as u32,
        }
    }

    fn node(&mut self, t: TId, parent: Option<HirId>) -> HirId {
        let (c, src) = (self.c, self.src);
        let surface = c.node(t);
        let id = self.hir.nodes.push(Node {
            kind: NodeKind::Comment {
                data: Span::default(),
            },
            span: surface.span(),
            parent,
        });
        self.hir.origin.push(t);
        let kind = match *surface {
            TNode::Text { span } => {
                let text = decode_text(span.text(src));
                NodeKind::Text {
                    raw: span,
                    decoded: match text {
                        std::borrow::Cow::Borrowed(_) => None,
                        std::borrow::Cow::Owned(s) => Some(s.into_boxed_str()),
                    },
                }
            }
            TNode::Comment { data, .. } => NodeKind::Comment { data },
            TNode::Expr { expr, .. } => NodeKind::Expr { expr },
            TNode::Element {
                name,
                attrs,
                children,
                start_tag,
                ..
            } => {
                let kind = self.element_kind(name, parent);
                let first = self.hir.attrs.next_id();
                for (i, a) in c.attrs(attrs).iter().enumerate() {
                    self.hir.attrs.push(Attribute {
                        name: a.name,
                        value: attr_value(c, src, a),
                        span: a.span,
                        owner: id,
                        origin: attrs.start + i as u32,
                    });
                }
                let attrs = IdxRange::new(first, self.hir.attrs.next_id());
                // `element_kind` of a descendant reads this node's kind and attributes.
                self.hir.nodes[id].kind = NodeKind::Element(Element {
                    name,
                    kind,
                    attrs,
                    children: Children::default(),
                    start_tag,
                });
                let children = self.list(c.children(children), Some(id));
                let NodeKind::Element(el) = &mut self.hir.nodes[id].kind else {
                    unreachable!("set above")
                };
                el.children = children;
                return id;
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
                let start = self.hir.branches.len() as u32;
                let len = branches.len() as u32;
                self.hir.branches.extend(branches);
                NodeKind::If {
                    branches: Branches { start, len },
                    otherwise,
                }
            }
        };
        self.hir.nodes[id].kind = kind;
        id
    }

    /// Upstream `element` (phases/1-parse/state/element.js): `meta_tags`, then
    /// `regex_valid_component_name`, then `<title>` under `<svelte:head>`, then `<slot>`.
    fn element_kind(&self, name: Span, parent: Option<HirId>) -> ElementKind {
        let name = name.text(self.src);
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
    // The parser gives a shorthand `{a}` the braces' span and `a=…` the name's start.
    let shorthand = src.as_bytes()[a.span.lo as usize] == b'{';
    match parts {
        [ast::Part::Expr { expr, .. }] if shorthand => AttrValue::Shorthand(*expr),
        [ast::Part::Expr { expr, .. }] => AttrValue::Expression {
            expr: *expr,
            quoted: a.quoted,
        },
        _ if parts.iter().all(|p| matches!(p, ast::Part::Text(_))) => AttrValue::Static(
            parts
                .iter()
                .map(|p| match p {
                    ast::Part::Text(s) => decode_text(s.text(src)),
                    ast::Part::Expr { .. } => unreachable!("all text"),
                })
                .collect::<String>()
                .into_boxed_str(),
        ),
        _ => AttrValue::Interpolated(parts.into()),
    }
}

/// Upstream `regex_valid_component_name`:
/// `^(?:\p{Lu}[$‌‍\p{ID_Continue}.]*|\p{ID_Start}[$‌‍\p{ID_Continue}]*(?:\.[$‌‍\p{ID_Continue}]+)+)$`
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
    let head = segments.next().expect("split yields at least one piece");
    let mut members = 0;
    for seg in segments {
        if seg.is_empty() || !seg.chars().all(continues) {
            return false;
        }
        members += 1;
    }
    members > 0 && head.chars().all(continues)
}

/// `\p{Lu}`: Rust's `is_uppercase` is the Uppercase property, which adds Other_Uppercase.
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
        let src = "<p a b=\"x&amp;y\" c={e} d=\"{e}\" {e} f=\"x{e}\" g=\"\"></p>";
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
                "static \"\""
            ]
        );
    }

    #[test]
    fn element_kinds_follow_the_svelte_parser() {
        let src = "<svelte:head><title>t</title></svelte:head><div><title>u</title></div>\
                   <Foo/><a.b/><slot/><template shadowrootmode=\"open\"><slot/></template><svelte:nope/>";
        let (_, h) = hir(src);
        let got: Vec<(String, ElementKind)> = h
            .elements()
            .map(|(_, el)| (el.name.text(src).to_owned(), el.kind))
            .collect();
        use ElementKind::*;
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
