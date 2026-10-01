//! The Vue single-file component as written.
//!
//! The template's nodes live in flat vectors and refer to each other by index; every JavaScript
//! expression (the `<script setup>` program and every template expression) lives in the one
//! [`SyntaxTree`] of the component, so a single scope analysis sees both.

use rsvelte_javascript::{NodeIdentifier, SyntaxTree};
use rsvelte_kernel::source::positions::Span;
use rsvelte_kernel::source::tokens::{TokenKind, Tokens};
use rsvelte_stylesheet::StyleSheet;

pub type TemplateNodeIdentifier = u32;

/// A slice of one of the side vectors (`children`, `attributes`).
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
pub enum TemplateNode {
    Text {
        span: Span,
    },
    Comment {
        span: Span,
        data: Span,
    },
    /// `{{ expression }}`.
    Interpolation {
        expression: NodeIdentifier,
        span: Span,
    },
    Element {
        name: Span,
        attributes: Range,
        children: Range,
        /// `<name …>` (or `<name … />`).
        start_tag: Span,
        /// Written `<name … />`.
        self_closing: bool,
        span: Span,
    },
}

impl TemplateNode {
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
pub struct Attribute {
    /// The whole name as written: `class`, `:href`, `@click`, `v-for`.
    pub name: Span,
    pub kind: AttributeKind,
    /// The value without its quotes.
    pub value: Option<Span>,
    pub quoted: bool,
    pub span: Span,
}

#[derive(Debug)]
pub enum AttributeKind {
    Static,
    Directive(Directive),
}

#[derive(Debug)]
pub struct Directive {
    pub name: DirectiveName,
    /// `href` in `:href`, `click` in `@click`.
    pub arg: Option<Span>,
    /// `trim` in `v-model.trim`, in order; only `v-model` and `v-on` take modifiers yet.
    pub modifiers: Box<[Span]>,
    pub exp: DirectiveExpression,
}

/// The directives the parser reads; any other is refused.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum DirectiveName {
    /// `v-bind` / `:`.
    Bind,
    /// `v-on` / `@`.
    On,
    If,
    ElseIf,
    Else,
    For,
    Model,
}

#[derive(Debug)]
pub enum DirectiveExpression {
    None,
    Expression(NodeIdentifier),
    For(LoopExpression),
}

/// `(item, index) in source`.
#[derive(Debug)]
pub struct LoopExpression {
    /// The aliases in order (value, key, index); each a binding pattern.
    pub parameters: Vec<NodeIdentifier>,
    pub source: NodeIdentifier,
}

/// An attribute of a block's start tag: name and unquoted value.
pub type TagAttributes = (Span, Option<Span>);

#[derive(Debug)]
pub struct Template {
    pub span: Span,
    pub attributes: Vec<TagAttributes>,
    /// Between the start tag and the end tag (compiler-sfc's `content`).
    pub content: Span,
    pub root: Range,
}

/// `<script setup>`.
#[derive(Debug)]
pub struct Script {
    pub span: Span,
    pub attributes: Vec<TagAttributes>,
    pub content: Span,
    pub program: NodeIdentifier,
}

#[derive(Debug)]
pub struct Style {
    pub span: Span,
    pub attributes: Vec<TagAttributes>,
    pub content: Span,
    pub sheet: StyleSheet,
    pub scoped: bool,
}

#[derive(Debug)]
pub struct SingleFileComponent {
    pub javascript: SyntaxTree,
    pub nodes: Vec<TemplateNode>,
    pub children: Vec<TemplateNodeIdentifier>,
    pub attributes: Vec<Attribute>,
    pub template: Option<Template>,
    pub script: Option<Script>,
    /// The script's program, or an empty one: scope analysis always has a root.
    pub program: NodeIdentifier,
    pub styles: Vec<Style>,
    /// `<script setup lang="ts">`: the script and every template expression are TypeScript.
    pub typescript: bool,
    /// The whole document as tokens; each style sheet is one [`TokenType::Stylesheet`] token.
    pub tokens: Tokens<TokenType>,
}

/// A token of a component.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum TokenType {
    Text,
    MarkupComment,
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
    AttributeName,
    /// `=`
    Eq,
    Quote,
    /// A static attribute's value.
    AttributeText,
    /// `{{`
    InterpolationOpen,
    /// `}}`
    InterpolationClose,
    /// The parentheses around a `v-for` alias list.
    ForParen,
    /// `in` or `of` in a `v-for` value.
    ForKeyword,
    JavaScript(rsvelte_javascript::lexer::T),
    JavaScriptComment,
    Whitespace,
    /// A style sheet's content, until the CSS parser records its own tokens.
    Stylesheet,
}

impl TokenKind for TokenType {
    fn is_trivia(self) -> bool {
        matches!(self, Self::Whitespace | Self::JavaScriptComment)
    }
}

impl SingleFileComponent {
    #[must_use]
    pub fn node(&self, identifier: TemplateNodeIdentifier) -> &TemplateNode {
        &self.nodes[identifier as usize]
    }

    #[must_use]
    pub fn children(&self, r: Range) -> &[TemplateNodeIdentifier] {
        r.get(&self.children)
    }

    #[must_use]
    pub fn attributes(&self, r: Range) -> &[Attribute] {
        r.get(&self.attributes)
    }

    /// The directive `name` of an element's attributes, with the attribute.
    #[must_use]
    pub fn directive(
        &self,
        attributes: Range,
        name: DirectiveName,
    ) -> Option<(&Attribute, &Directive)> {
        self.attributes(attributes)
            .iter()
            .find_map(|a| match &a.kind {
                AttributeKind::Directive(d) if d.name == name => Some((a, d)),
                _ => None,
            })
    }

    /// The root template's nodes; empty without a `<template>`.
    #[must_use]
    pub fn root(&self) -> &[TemplateNodeIdentifier] {
        self.template
            .as_ref()
            .map_or(&[], |t| self.children(t.root))
    }

    #[must_use]
    pub const fn heap_bytes(&self) -> usize {
        self.javascript.heap_bytes()
            + self.nodes.capacity() * size_of::<TemplateNode>()
            + self.children.capacity() * 4
            + self.attributes.capacity() * size_of::<Attribute>()
            + self.tokens.heap_bytes()
    }
}

/// `<script>`/`<style>`/`<template>` attribute `name`: `Some(value)` when present (`Some(None)` for
/// a bare attribute).
#[must_use]
pub fn tag_attribute<'s>(
    attributes: &[TagAttributes],
    source_text: &'s str,
    name: &str,
) -> Option<Option<&'s str>> {
    attributes
        .iter()
        .find(|(n, _)| n.text(source_text) == name)
        .map(|(_, v)| v.map(|v| v.text(source_text)))
}

// Pinned so a change to the surface tree's layout is a decision.
const _: () = assert!(
    size_of::<TemplateNode>() == 44,
    "`TemplateNode` is 44 bytes"
);
#[cfg(target_pointer_width = "64")]
const _: () = assert!(size_of::<Attribute>() == 96, "`Attribute` is 96 bytes");
