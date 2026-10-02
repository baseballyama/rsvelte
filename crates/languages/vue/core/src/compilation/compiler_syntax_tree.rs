//! The template's HIR: the tree compiler-core's `baseParse` returns, which its transforms read.
//!
//! Compilation and name resolution read only this, so any frontend that builds it can be compiled.
//! The Vue frontend builds it from the surface tree ([`crate::syntax_tree`]) in [`lower`]. What
//! changes on the way is what `baseParse` does beyond tokenizing:
//!
//! - text is decoded and its whitespace condensed (`condenseWhitespace`), and the whitespace-only
//!   text condensing removes is gone;
//! - every element has compiler-core's tag type ([`TagType`]);
//! - a static attribute's value is decoded; a directive is split into its name, argument, modifiers
//!   and expression, a `v-for` value into its aliases and source (`forParseResult`);
//! - a name may be spelled by a frontend instead of written (a Svelte frontend's `@click` for
//!   `onclick`, or the `template` of a `<template v-if>` it wraps around a block);
//! - every node has a [`CompilerNodeIdentifier`], a parent, and its origin: the frontend's
//!   identifier of the node it was built from.
//!
//! A `v-if` chain stays a run of sibling elements and a `v-for` stays a directive, as in
//! `baseParse`'s tree: compiler-core's structural transforms build those nodes while they
//! traverse, and when they do decides the helper order and the cache slots of the output.
//!
//! JavaScript expressions stay in the component's one [`rsvelte_typescript::SyntaxTree`], keyed by
//! [`NodeIdentifier`].

use rsvelte_kernel::newtype_index;
use rsvelte_kernel::source::index::{IndexRange, IndexVector};
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript::NodeIdentifier;

use crate::syntax_tree::{
    self, AttributeKind, DirectiveExpression, DirectiveName, SingleFileComponent, TemplateNode,
    TemplateNodeIdentifier,
};

newtype_index!(
    pub struct CompilerNodeIdentifier;
);
newtype_index!(
    pub struct PropertyIdentifier;
);

#[derive(Debug)]
pub struct CompilerSyntaxTree {
    pub nodes: IndexVector<CompilerNodeIdentifier, Node>,
    pub props: IndexVector<PropertyIdentifier, Property>,
    /// The frontend's node each HIR node was built from; for Vue, the surface node.
    pub origin: IndexVector<CompilerNodeIdentifier, TemplateNodeIdentifier>,
    children: Vec<CompilerNodeIdentifier>,
    pub root: Children,
}

/// A slice of [`CompilerSyntaxTree`]'s child list.
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
    pub parent: Option<CompilerNodeIdentifier>,
}

#[derive(Debug)]
pub enum NodeKind {
    Text(Text),
    Comment {
        data: Span,
    },
    /// `{{ expression }}`.
    Interpolation {
        expression: NodeIdentifier,
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
    pub fn text<'a>(&'a self, source_text: &'a str) -> &'a str {
        self.cooked
            .as_deref()
            .unwrap_or_else(|| self.raw.text(source_text))
    }

    /// `raw` with its character references decoded.
    #[must_use]
    pub fn decoded(raw: Span, source_text: &str) -> Self {
        Self {
            raw,
            cooked: match rsvelte_markup::decode_text(raw.text(source_text)) {
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
    pub props: IndexRange<PropertyIdentifier>,
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
    pub fn text<'a>(&'a self, source_text: &'a str) -> &'a str {
        match self {
            Self::Source(span) => span.text(source_text),
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
pub struct Property {
    pub kind: PropertyKind,
    pub span: Span,
    /// The frontend's identifier of the attribute; for Vue, an index into the surface attribute
    /// list.
    pub origin: u32,
}

/// compiler-core's `AttributeNode` and `DirectiveNode`.
#[derive(Debug)]
pub enum PropertyKind {
    Attribute {
        name: Name,
        /// Decoded; `None` for a bare attribute.
        value: Option<Text>,
    },
    Directive(Directive),
}

#[derive(Debug)]
pub struct Directive {
    pub name: DirectiveName,
    /// `href` in `:href`, `click` in `@click`.
    pub arg: Option<Name>,
    /// `trim` in `v-model.trim`, in order.
    pub modifiers: Box<[Name]>,
    pub exp: DirectiveExpression,
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
    pub fn props(&self, r: IndexRange<PropertyIdentifier>) -> &[Property] {
        self.props.slice(r)
    }

    #[must_use]
    pub fn root(&self) -> &[CompilerNodeIdentifier] {
        self.children(self.root)
    }

    #[must_use]
    pub const fn heap_bytes(&self) -> usize {
        self.nodes.capacity() * size_of::<Node>()
            + self.props.capacity() * size_of::<Property>()
            + self.origin.capacity() * size_of::<TemplateNodeIdentifier>()
            + self.children.capacity() * size_of::<CompilerNodeIdentifier>()
    }
}

/// Builds a [`CompilerSyntaxTree`] for a frontend.
///
/// A node is added before its children, so a child's parent exists; each child list is recorded
/// once its nodes exist ([`CompilerSyntaxTreeBuilder::children`]), which keeps every list
/// contiguous.
#[derive(Debug)]
pub struct CompilerSyntaxTreeBuilder {
    compiler_syntax_tree: CompilerSyntaxTree,
}

impl CompilerSyntaxTreeBuilder {
    #[must_use]
    pub fn new(nodes: usize, props: usize) -> Self {
        Self {
            compiler_syntax_tree: CompilerSyntaxTree {
                nodes: IndexVector::with_capacity(nodes),
                props: IndexVector::with_capacity(props),
                origin: IndexVector::with_capacity(nodes),
                children: Vec::with_capacity(nodes),
                root: Children::default(),
            },
        }
    }

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

    /// Records the props of an element; returns their range.
    pub fn props(
        &mut self,
        props: impl IntoIterator<Item = Property>,
    ) -> IndexRange<PropertyIdentifier> {
        let first = self.compiler_syntax_tree.props.next_identifier();
        for p in props {
            self.compiler_syntax_tree.props.push(p);
        }
        IndexRange::new(first, self.compiler_syntax_tree.props.next_identifier())
    }

    pub fn children(&mut self, identifiers: &[CompilerNodeIdentifier]) -> Children {
        let start = self.compiler_syntax_tree.children.len() as u32;
        self.compiler_syntax_tree.children.extend(identifiers);
        Children {
            start,
            len: identifiers.len() as u32,
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

    /// The tag type `baseParse` gives an element (`onCloseTag`) with compiler-dom's options:
    /// `slot`, then a `<template>` with a structural directive (`isFragmentTemplate`), then
    /// `isComponent`.
    #[must_use]
    pub fn tag_type(
        &self,
        tag: &str,
        props: IndexRange<PropertyIdentifier>,
        source_text: &str,
    ) -> TagType {
        let props = self.compiler_syntax_tree.props(props);
        if tag == "slot" {
            return TagType::Slot;
        }
        let structural = props.iter().any(|p| match &p.kind {
            PropertyKind::Directive(d) => is_structural(d.name),
            PropertyKind::Attribute { .. } => false,
        });
        if tag == "template" && structural {
            return TagType::Template;
        }
        let is_vue_component = props.iter().any(|p| match &p.kind {
            PropertyKind::Attribute {
                name,
                value: Some(v),
            } => name.text(source_text) == "is" && v.text(source_text).starts_with("vue:"),
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
const fn is_structural(name: DirectiveName) -> bool {
    matches!(
        name,
        DirectiveName::If | DirectiveName::ElseIf | DirectiveName::Else | DirectiveName::For
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
    const MARKUP_TAGS: &str = "html,body,base,head,link,meta,style,title,address,article,aside,\
        footer,header,hgroup,h1,h2,h3,h4,h5,h6,nav,section,div,dd,dl,dt,figcaption,figure,\
        picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,\
        q,rp,rt,ruby,s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,\
        embed,object,param,source,canvas,script,noscript,del,ins,caption,column,colgroup,table,\
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
    [MARKUP_TAGS, SVG_TAGS, MATH_TAGS]
        .iter()
        .any(|list| list.split(',').any(|t| t == tag))
}

mod lower;
pub use lower::lower;

#[cfg(test)]
mod tests;
