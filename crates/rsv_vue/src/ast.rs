//! The Vue single-file component as written.
//!
//! The template's nodes live in flat vectors and refer to each other by index; every JavaScript
//! expression (the `<script setup>` program and every template expression) lives in the one
//! [`Ast`] of the component, so a single scope analysis sees both.

use rsv_css::StyleSheet;
use rsv_js::{Ast, NodeId};
use rsv_kernel::source::Span;
use rsv_kernel::token::{TokenKind, Tokens};

pub type TId = u32;

/// A slice of one of the side vectors (`kids`, `attrs`).
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub struct Range {
    pub start: u32,
    pub len: u32,
}

impl Range {
    pub fn get<T>(self, v: &[T]) -> &[T] {
        &v[self.start as usize..(self.start + self.len) as usize]
    }
}

#[derive(Debug)]
pub enum TNode {
    Text {
        span: Span,
    },
    Comment {
        span: Span,
        data: Span,
    },
    /// `{{ expr }}`.
    Interpolation {
        expr: NodeId,
        span: Span,
    },
    Element {
        name: Span,
        attrs: Range,
        children: Range,
        /// `<name …>` (or `<name … />`).
        start_tag: Span,
        /// Written `<name … />`.
        self_closing: bool,
        span: Span,
    },
}

impl TNode {
    #[must_use]
    pub const fn span(&self) -> Span {
        match *self {
            Self::Text { span }
            | Self::Comment { span, .. }
            | Self::Interpolation { span, .. }
            | Self::Element { span, .. } => span,
        }
    }
}

#[derive(Debug)]
pub struct Attr {
    /// The whole name as written: `class`, `:href`, `@click`, `v-for`.
    pub name: Span,
    pub kind: AttrKind,
    /// The value without its quotes.
    pub value: Option<Span>,
    pub quoted: bool,
    pub span: Span,
}

#[derive(Debug)]
pub enum AttrKind {
    Static,
    Directive(Directive),
}

#[derive(Debug)]
pub struct Directive {
    pub name: DirName,
    /// `href` in `:href`, `click` in `@click`.
    pub arg: Option<Span>,
    pub exp: DirExp,
}

/// The directives the parser reads; any other is refused.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum DirName {
    /// `v-bind` / `:`.
    Bind,
    /// `v-on` / `@`.
    On,
    If,
    ElseIf,
    Else,
    For,
}

#[derive(Debug)]
pub enum DirExp {
    None,
    Expr(NodeId),
    For(ForExp),
}

/// `(item, index) in source`.
#[derive(Debug)]
pub struct ForExp {
    /// The aliases in order (value, key, index); each a binding pattern.
    pub params: Vec<NodeId>,
    pub source: NodeId,
}

/// An attribute of a block's start tag: name and unquoted value.
pub type TagAttr = (Span, Option<Span>);

#[derive(Debug)]
pub struct Template {
    pub span: Span,
    pub attrs: Vec<TagAttr>,
    /// Between the start tag and the end tag (compiler-sfc's `content`).
    pub content: Span,
    pub root: Range,
}

/// `<script setup>`.
#[derive(Debug)]
pub struct Script {
    pub span: Span,
    pub attrs: Vec<TagAttr>,
    pub content: Span,
    pub program: NodeId,
}

#[derive(Debug)]
pub struct Style {
    pub span: Span,
    pub attrs: Vec<TagAttr>,
    pub content: Span,
    pub sheet: StyleSheet,
    pub scoped: bool,
}

#[derive(Debug)]
pub struct Sfc {
    pub js: Ast,
    pub nodes: Vec<TNode>,
    pub kids: Vec<TId>,
    pub attrs: Vec<Attr>,
    pub template: Option<Template>,
    pub script: Option<Script>,
    /// The script's program, or an empty one: scope analysis always has a root.
    pub program: NodeId,
    pub styles: Vec<Style>,
    /// `<script setup lang="ts">`: the script and every template expression are TypeScript.
    pub ts: bool,
    /// The whole document as tokens; each style sheet is one [`Tk::Css`] token.
    pub tokens: Tokens<Tk>,
}

/// A token of a component.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Tk {
    Text,
    HtmlComment,
    /// `<`
    TagOpen,
    /// `</`
    EndTagOpen,
    TagName,
    /// `>`
    TagEnd,
    /// `/>`
    SelfClose,
    /// A static attribute's name or a directive's whole name (`:href`, `v-for`).
    AttrName,
    /// `=`
    Eq,
    Quote,
    /// A static attribute's value.
    AttrText,
    /// `{{`
    InterpolationOpen,
    /// `}}`
    InterpolationClose,
    /// The parentheses around a `v-for` alias list.
    ForParen,
    /// `in` or `of` in a `v-for` value.
    ForKeyword,
    Js(rsv_js::lexer::T),
    JsComment,
    Whitespace,
    /// A style sheet's content, until the CSS parser records its own tokens.
    Css,
}

impl TokenKind for Tk {
    fn is_trivia(self) -> bool {
        matches!(self, Self::Whitespace | Self::JsComment)
    }
}

impl Sfc {
    #[must_use]
    pub fn node(&self, id: TId) -> &TNode {
        &self.nodes[id as usize]
    }

    #[must_use]
    pub fn children(&self, r: Range) -> &[TId] {
        r.get(&self.kids)
    }

    #[must_use]
    pub fn attrs(&self, r: Range) -> &[Attr] {
        r.get(&self.attrs)
    }

    /// The directive `name` of an element's attributes, with the attribute.
    #[must_use]
    pub fn directive(&self, attrs: Range, name: DirName) -> Option<(&Attr, &Directive)> {
        self.attrs(attrs).iter().find_map(|a| match &a.kind {
            AttrKind::Directive(d) if d.name == name => Some((a, d)),
            _ => None,
        })
    }

    /// The root template's nodes; empty without a `<template>`.
    #[must_use]
    pub fn root(&self) -> &[TId] {
        self.template
            .as_ref()
            .map_or(&[], |t| self.children(t.root))
    }

    #[must_use]
    pub const fn heap_bytes(&self) -> usize {
        self.js.heap_bytes()
            + self.nodes.capacity() * size_of::<TNode>()
            + self.kids.capacity() * 4
            + self.attrs.capacity() * size_of::<Attr>()
            + self.tokens.heap_bytes()
    }
}

/// `<script>`/`<style>`/`<template>` attribute `name`: `Some(value)` when present (`Some(None)` for
/// a bare attribute).
#[must_use]
pub fn tag_attr<'s>(attrs: &[TagAttr], src: &'s str, name: &str) -> Option<Option<&'s str>> {
    attrs
        .iter()
        .find(|(n, _)| n.text(src) == name)
        .map(|(_, v)| v.map(|v| v.text(src)))
}

// Pinned so a change to the surface tree's layout is a decision.
const _: () = assert!(size_of::<TNode>() == 44, "`TNode` is 44 bytes");
const _: () = assert!(size_of::<Attr>() == 80, "`Attr` is 80 bytes");
