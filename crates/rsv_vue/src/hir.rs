//! The template's HIR: the tree compiler-core's `baseParse` returns, which its transforms read.
//!
//! Compilation and name resolution read only this, so any frontend that builds it can be compiled.
//! The Vue frontend builds it from the surface tree ([`crate::ast`]) in [`lower`]. What changes on
//! the way is what `baseParse` does beyond tokenizing:
//!
//! - text is decoded and its whitespace condensed (`condenseWhitespace`), and the whitespace-only
//!   text condensing removes is gone;
//! - every element has compiler-core's tag type ([`TagType`]);
//! - a static attribute's value is decoded; a directive is split into its name, argument, modifiers
//!   and expression, a `v-for` value into its aliases and source (`forParseResult`);
//! - a name may be spelled by a frontend instead of written (a Svelte frontend's `@click` for
//!   `onclick`, or the `template` of a `<template v-if>` it wraps around a block);
//! - every node has a [`HirId`], a parent, and its origin: the frontend's id of the node it was
//!   built from.
//!
//! A `v-if` chain stays a run of sibling elements and a `v-for` stays a directive, as in
//! `baseParse`'s tree: compiler-core's structural transforms build those nodes while they
//! traverse, and when they do decides the helper order and the cache slots of the output.
//!
//! JavaScript expressions stay in the component's one [`rsv_js::Ast`], keyed by [`NodeId`].

use rsv_js::NodeId;
use rsv_kernel::idx::{IdxRange, IndexVec};
use rsv_kernel::newtype_index;
use rsv_kernel::source::Span;

use crate::ast::{self, AttrKind, DirExp, DirName, Sfc, TId, TNode};

newtype_index!(
    pub struct HirId;
);
newtype_index!(
    pub struct PropId;
);

#[derive(Debug)]
pub struct Hir {
    pub nodes: IndexVec<HirId, Node>,
    pub props: IndexVec<PropId, Prop>,
    /// The frontend's node each HIR node was built from; for Vue, the surface node.
    pub origin: IndexVec<HirId, TId>,
    kids: Vec<HirId>,
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
    /// The enclosing element; `None` at the top level.
    pub parent: Option<HirId>,
}

#[derive(Debug)]
pub enum NodeKind {
    Text(Text),
    Comment {
        data: Span,
    },
    /// `{{ expr }}`.
    Interpolation {
        expr: NodeId,
    },
    Element(Element),
}

/// Text as compiler-core holds it: decoded, and for a text node condensed.
#[derive(Debug, Clone)]
pub struct Text {
    /// Where it was written.
    pub raw: Span,
    /// Present only when it differs from the written text.
    pub cooked: Option<Box<str>>,
}

impl Text {
    #[must_use]
    pub fn text<'a>(&'a self, src: &'a str) -> &'a str {
        self.cooked.as_deref().unwrap_or_else(|| self.raw.text(src))
    }

    /// `raw` with its character references decoded.
    #[must_use]
    pub fn decoded(raw: Span, src: &str) -> Self {
        Self {
            raw,
            cooked: match rsv_html::decode_text(raw.text(src)) {
                std::borrow::Cow::Borrowed(_) => None,
                std::borrow::Cow::Owned(s) => Some(s.into_boxed_str()),
            },
        }
    }
}

#[derive(Debug)]
pub struct Element {
    pub tag: Name,
    pub tag_type: TagType,
    pub props: IdxRange<PropId>,
    pub children: Children,
}

/// compiler-core's `ElementTypes`.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum TagType {
    Element,
    Component,
    Slot,
    /// A `<template>` with a structural directive: a fragment, not an element.
    Template,
}

/// A name as the compiler reads it: as written, or as a frontend spells it.
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

    /// Where it was written, or what a frontend built it from.
    #[must_use]
    pub const fn span(&self) -> Span {
        match *self {
            Self::Source(span) | Self::Spelled { span, .. } => span,
        }
    }
}

#[derive(Debug)]
pub struct Prop {
    pub kind: PropKind,
    pub span: Span,
    /// The frontend's id of the attribute; for Vue, an index into the surface attribute list.
    pub origin: u32,
}

/// compiler-core's `AttributeNode` and `DirectiveNode`.
#[derive(Debug)]
pub enum PropKind {
    Attribute {
        name: Name,
        /// Decoded; `None` for a bare attribute.
        value: Option<Text>,
    },
    Directive(Directive),
}

#[derive(Debug)]
pub struct Directive {
    pub name: DirName,
    /// `href` in `:href`, `click` in `@click`.
    pub arg: Option<Name>,
    /// `trim` in `v-model.trim`, in order.
    pub modifiers: Box<[Name]>,
    pub exp: DirExp,
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
    pub fn props(&self, r: IdxRange<PropId>) -> &[Prop] {
        self.props.slice(r)
    }

    #[must_use]
    pub fn root(&self) -> &[HirId] {
        self.children(self.root)
    }

    #[must_use]
    pub const fn heap_bytes(&self) -> usize {
        self.nodes.capacity() * size_of::<Node>()
            + self.props.capacity() * size_of::<Prop>()
            + self.origin.capacity() * size_of::<TId>()
            + self.kids.capacity() * size_of::<HirId>()
    }
}

/// Builds a [`Hir`] for a frontend.
///
/// A node is added before its children, so a child's parent exists; each child list is recorded
/// once its nodes exist ([`HirBuilder::children`]), which keeps every list contiguous.
#[derive(Debug)]
pub struct HirBuilder {
    hir: Hir,
}

impl HirBuilder {
    #[must_use]
    pub fn new(nodes: usize, props: usize) -> Self {
        Self {
            hir: Hir {
                nodes: IndexVec::with_capacity(nodes),
                props: IndexVec::with_capacity(props),
                origin: IndexVec::with_capacity(nodes),
                kids: Vec::with_capacity(nodes),
                root: Children::default(),
            },
        }
    }

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

    /// Records the props of an element; returns their range.
    pub fn props(&mut self, props: impl IntoIterator<Item = Prop>) -> IdxRange<PropId> {
        let first = self.hir.props.next_id();
        for p in props {
            self.hir.props.push(p);
        }
        IdxRange::new(first, self.hir.props.next_id())
    }

    pub fn children(&mut self, ids: &[HirId]) -> Children {
        let start = self.hir.kids.len() as u32;
        self.hir.kids.extend(ids);
        Children {
            start,
            len: ids.len() as u32,
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

    /// The tag type `baseParse` gives an element (`onCloseTag`) with compiler-dom's options:
    /// `slot`, then a `<template>` with a structural directive (`isFragmentTemplate`), then
    /// `isComponent`.
    #[must_use]
    pub fn tag_type(&self, tag: &str, props: IdxRange<PropId>, src: &str) -> TagType {
        let props = self.hir.props(props);
        if tag == "slot" {
            return TagType::Slot;
        }
        let structural = props.iter().any(|p| match &p.kind {
            PropKind::Directive(d) => is_structural(d.name),
            PropKind::Attribute { .. } => false,
        });
        if tag == "template" && structural {
            return TagType::Template;
        }
        let is_vue_component = props.iter().any(|p| match &p.kind {
            PropKind::Attribute {
                name,
                value: Some(v),
            } => name.text(src) == "is" && v.text(src).starts_with("vue:"),
            _ => false,
        });
        if tag == "component"
            || tag.starts_with(|c: char| c.is_ascii_uppercase())
            || is_core_component(tag)
            || matches!(
                tag,
                "Transition" | "transition" | "TransitionGroup" | "transition-group"
            )
            || !is_native_tag(tag)
            || is_vue_component
        {
            return TagType::Component;
        }
        TagType::Element
    }
}

/// compiler-core's `specialTemplateDir` without `slot`, which the parser does not read.
const fn is_structural(name: DirName) -> bool {
    matches!(
        name,
        DirName::If | DirName::ElseIf | DirName::Else | DirName::For
    )
}

/// compiler-core `isCoreComponent`.
fn is_core_component(tag: &str) -> bool {
    matches!(
        tag,
        "Teleport"
            | "teleport"
            | "Suspense"
            | "suspense"
            | "KeepAlive"
            | "keep-alive"
            | "BaseTransition"
            | "base-transition"
    )
}

/// `@vue/shared`'s `HTML_TAGS`, `SVG_TAGS` and `MATH_TAGS`: compiler-dom's `isNativeTag`.
fn is_native_tag(tag: &str) -> bool {
    const HTML_TAGS: &str = "html,body,base,head,link,meta,style,title,address,article,aside,\
        footer,header,hgroup,h1,h2,h3,h4,h5,h6,nav,section,div,dd,dl,dt,figcaption,figure,\
        picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,\
        q,rp,rt,ruby,s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,\
        embed,object,param,source,canvas,script,noscript,del,ins,caption,col,colgroup,table,\
        thead,tbody,td,th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,\
        option,output,progress,select,textarea,details,dialog,menu,summary,template,blockquote,\
        iframe,tfoot";
    const SVG_TAGS: &str = "svg,animate,animateMotion,animateTransform,circle,clipPath,\
        color-profile,defs,desc,discard,ellipse,feBlend,feColorMatrix,feComponentTransfer,\
        feComposite,feConvolveMatrix,feDiffuseLighting,feDisplacementMap,feDistantLight,\
        feDropShadow,feFlood,feFuncA,feFuncB,feFuncG,feFuncR,feGaussianBlur,feImage,feMerge,\
        feMergeNode,feMorphology,feOffset,fePointLight,feSpecularLighting,feSpotLight,feTile,\
        feTurbulence,filter,foreignObject,g,hatch,hatchpath,image,line,linearGradient,marker,\
        mask,mesh,meshgradient,meshpatch,meshrow,metadata,mpath,path,pattern,polygon,polyline,\
        radialGradient,rect,set,solidcolor,stop,switch,symbol,text,textPath,title,tspan,unknown,\
        use,view";
    const MATH_TAGS: &str = "annotation,annotation-xml,maction,maligngroup,malignmark,math,\
        menclose,merror,mfenced,mfrac,mfraction,mglyph,mi,mlabeledtr,mlongdiv,mmultiscripts,mn,\
        mo,mover,mpadded,mphantom,mprescripts,mroot,mrow,ms,mscarries,mscarry,msgroup,msline,\
        mspace,msqrt,msrow,mstack,mstyle,msub,msubsup,msup,mtable,mtd,mtext,mtr,munder,\
        munderover,none,semantics";
    [HTML_TAGS, SVG_TAGS, MATH_TAGS]
        .iter()
        .any(|list| list.split(',').any(|t| t == tag))
}

/// The Vue frontend: the template as written, to the HIR. `None` without a `<template>`.
#[must_use]
pub fn lower(c: &Sfc, src: &str) -> Option<Hir> {
    let t = c.template.as_ref()?;
    let mut b = SurfaceBuilder {
        c,
        src,
        b: HirBuilder::new(c.nodes.len(), c.attrs.len()),
        in_pre: 0,
    };
    let root = b.list(c.children(t.root), None, Whitespace::Condense, false);
    Some(b.b.finish(root))
}

struct SurfaceBuilder<'a> {
    c: &'a Sfc,
    src: &'a str,
    b: HirBuilder,
    /// Open `<pre>` elements (`inPre`).
    in_pre: u32,
}

/// How `baseParse` treats the text of a child list.
#[derive(Clone, Copy, PartialEq, Eq)]
enum Whitespace {
    /// `condenseWhitespace`.
    Condense,
    /// Inside a `<pre>`: line endings normalized, nothing removed.
    Pre,
    /// A `<textarea>` or `<title>`, whose content the tokenizer reads as RCDATA: as written.
    Rcdata,
}

impl SurfaceBuilder<'_> {
    /// A child list as `onCloseTag` leaves it: whitespace treated per `ws`, then a leading newline
    /// dropped when `ignore_newline` (`isIgnoreNewlineTag`).
    fn list(
        &mut self,
        list: &[TId],
        parent: Option<HirId>,
        ws: Whitespace,
        ignore_newline: bool,
    ) -> Children {
        let (c, src) = (self.c, self.src);
        // `None` once condensing removes the text; upstream reads its neighbours in the list it
        // is filtering.
        let mut kept: Vec<Option<(TId, Option<Text>)>> = list
            .iter()
            .map(|&t| {
                let text = match c.node(t) {
                    TNode::Text { span } => Some(Text::decoded(*span, src)),
                    _ => None,
                };
                Some((t, text))
            })
            .collect();
        for i in 0..kept.len() {
            let Some((_, Some(text))) = &kept[i] else {
                continue;
            };
            let content = text.text(src);
            let condensed = if ws == Whitespace::Rcdata {
                continue;
            } else if ws == Whitespace::Pre {
                content.replace("\r\n", "\n")
            } else if content.bytes().all(is_whitespace) {
                let neighbour = |j: Option<usize>| {
                    j.and_then(|j| kept.get(j))
                        .and_then(|k| k.as_ref())
                        .map(|&(t, _)| c.node(t))
                };
                let remove = match (neighbour(i.checked_sub(1)), neighbour(Some(i + 1))) {
                    (None, _)
                    | (_, None)
                    | (
                        Some(TNode::Comment { .. }),
                        Some(TNode::Comment { .. } | TNode::Element { .. }),
                    )
                    | (Some(TNode::Element { .. }), Some(TNode::Comment { .. })) => true,
                    (Some(TNode::Element { .. }), Some(TNode::Element { .. })) => {
                        content.contains(['\n', '\r'])
                    }
                    _ => false,
                };
                if remove {
                    kept[i] = None;
                    continue;
                }
                " ".to_owned()
            } else {
                condense(content)
            };
            let raw = text.raw;
            let cooked = (condensed != raw.text(src)).then(|| condensed.into_boxed_str());
            if let Some((_, slot)) = &mut kept[i] {
                *slot = Some(Text { raw, cooked });
            }
        }
        if ignore_newline && let Some(Some((_, Some(text)))) = kept.first_mut() {
            let content = text.text(src);
            if let Some(rest) = content
                .strip_prefix("\r\n")
                .or_else(|| content.strip_prefix('\n'))
            {
                let rest = rest.to_owned().into_boxed_str();
                text.cooked = Some(rest);
            }
        }
        let ids: Vec<HirId> = kept
            .into_iter()
            .flatten()
            .map(|(t, text)| match text {
                Some(text) => self
                    .b
                    .node(NodeKind::Text(text), c.node(t).span(), parent, t),
                None => self.node(t, parent),
            })
            .collect();
        self.b.children(&ids)
    }

    fn node(&mut self, t: TId, parent: Option<HirId>) -> HirId {
        let (c, src) = (self.c, self.src);
        let surface = c.node(t);
        let kind = match *surface {
            TNode::Text { .. } => unreachable!("`list` adds text"),
            TNode::Comment { data, .. } => NodeKind::Comment { data },
            TNode::Interpolation { expr, .. } => NodeKind::Interpolation { expr },
            TNode::Element {
                name,
                attrs,
                children,
                ..
            } => {
                let props = self.b.props(
                    c.attrs(attrs)
                        .iter()
                        .enumerate()
                        .map(|(i, a)| prop(src, a, attrs.start + i as u32)),
                );
                let tag_type = self.b.tag_type(name.text(src), props, src);
                let id = self.b.node(
                    NodeKind::Element(Element {
                        tag: Name::Source(name),
                        tag_type,
                        props,
                        children: Children::default(),
                    }),
                    surface.span(),
                    parent,
                    t,
                );
                let tag = name.text(src);
                let pre = tag == "pre";
                self.in_pre += u32::from(pre);
                let ws = if self.in_pre > 0 {
                    Whitespace::Pre
                } else if matches!(tag, "textarea" | "title") {
                    Whitespace::Rcdata
                } else {
                    Whitespace::Condense
                };
                let ignore_newline = matches!(tag, "pre" | "textarea");
                let children = self.list(c.children(children), Some(id), ws, ignore_newline);
                self.in_pre -= u32::from(pre);
                self.b.set_element_children(id, children);
                return id;
            }
        };
        self.b.node(kind, surface.span(), parent, t)
    }
}

fn prop(src: &str, a: &ast::Attr, origin: u32) -> Prop {
    let kind = match &a.kind {
        AttrKind::Static => PropKind::Attribute {
            name: Name::Source(a.name),
            value: a.value.map(|v| Text::decoded(v, src)),
        },
        AttrKind::Directive(d) => PropKind::Directive(Directive {
            name: d.name,
            arg: d.arg.map(Name::Source),
            modifiers: d.modifiers.iter().copied().map(Name::Source).collect(),
            exp: match &d.exp {
                DirExp::None => DirExp::None,
                DirExp::Expr(e) => DirExp::Expr(*e),
                DirExp::For(f) => DirExp::For(ast::ForExp {
                    params: f.params.clone(),
                    source: f.source,
                }),
            },
        }),
    };
    Prop {
        kind,
        span: a.span,
        origin,
    }
}

const fn is_whitespace(b: u8) -> bool {
    matches!(b, b' ' | b'\n' | b'\t' | b'\x0c' | b'\r')
}

/// compiler-core `condense`: each whitespace run becomes one space.
fn condense(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let mut prev_ws = false;
    for c in s.chars() {
        if u8::try_from(c).is_ok_and(is_whitespace) {
            if !prev_ws {
                out.push(' ');
            }
            prev_ws = true;
        } else {
            out.push(c);
            prev_ws = false;
        }
    }
    out
}

// Pinned so a change to a node's layout is a decision.
const _: () = assert!(size_of::<Node>() == 64, "`Node` is 64 bytes");
const _: () = assert!(size_of::<Prop>() == 104, "`Prop` is 104 bytes");

#[cfg(test)]
mod tests {
    use rsv_kernel::idx::Idx;

    use super::*;

    fn hir(src: &str) -> (Sfc, Hir) {
        let c = crate::parse::parse(src).expect("parses");
        let h = lower(&c, src).expect("a template");
        (c, h)
    }

    #[test]
    fn text_is_decoded_and_condensed_as_base_parse_does() {
        let src = "<template>\n  <p>a  &amp;\n b</p>\n  <p>x</p> <b>y</b>\n</template>";
        let (_, h) = hir(src);
        let texts: Vec<&str> = h
            .nodes
            .iter()
            .filter_map(|n| match &n.kind {
                NodeKind::Text(t) => Some(t.text(src)),
                _ => None,
            })
            .collect();
        assert_eq!(texts, ["a & b", "x", " ", "y"]);
        assert_eq!(
            h.root().len(),
            4,
            "the runs holding a newline between elements are gone, the space is not"
        );
    }

    #[test]
    fn tag_types_follow_base_parse() {
        let b = HirBuilder::new(0, 0);
        let none = IdxRange::new(PropId::new(0), PropId::new(0));
        let got: Vec<TagType> = ["div", "slot", "template", "component", "foo", "Transition"]
            .iter()
            .map(|t| b.tag_type(t, none, ""))
            .collect();
        assert_eq!(
            got,
            [
                TagType::Element,
                TagType::Slot,
                TagType::Element,
                TagType::Component,
                TagType::Component,
                TagType::Component
            ]
        );
    }

    #[test]
    fn directives_are_split_and_every_node_points_back() {
        let src =
            "<template><li v-for=\"(x, i) in xs\" :key=\"i\" @click=\"f\">{{ x }}</li></template>";
        let (c, h) = hir(src);
        for (id, n) in h.nodes.iter_enumerated() {
            assert_eq!(c.node(h.origin[id]).span(), n.span, "{id:?}");
        }
        let NodeKind::Element(el) = &h.node(h.root()[0]).kind else {
            panic!("an element")
        };
        let got: Vec<(DirName, &str)> = h
            .props(el.props)
            .iter()
            .map(|p| match &p.kind {
                PropKind::Directive(d) => (d.name, d.arg.as_ref().map_or("", |a| a.text(src))),
                PropKind::Attribute { .. } => panic!("only directives"),
            })
            .collect();
        assert_eq!(
            got,
            [
                (DirName::For, ""),
                (DirName::Bind, "key"),
                (DirName::On, "click")
            ]
        );
    }
}
