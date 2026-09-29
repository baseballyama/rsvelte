//! The Svelte surface tree.
//!
//! Template nodes live in flat vectors and refer to each other by index;
//! every JavaScript expression (script and template) lives in the one [`Ast`] of the component, so
//! a single scope analysis sees both.

use std::borrow::Cow;

use rsv_css::StyleSheet;
use rsv_js::{Ast, NodeId};
use rsv_kernel::source::Span;
use rsv_kernel::token::{TokenKind, Tokens};

pub type TId = u32;

/// A slice of one of the side vectors (`kids`, `attrs`, `parts`).
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
    Expr {
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
    If {
        test: NodeId,
        cons: Range,
        /// An `{:else if}` branch is an alternate holding one `If` with `elseif` set.
        alt: Option<Range>,
        elseif: bool,
        span: Span,
    },
}

impl TNode {
    #[must_use]
    pub const fn span(&self) -> Span {
        match *self {
            Self::Text { span }
            | Self::Comment { span, .. }
            | Self::Expr { span, .. }
            | Self::Element { span, .. }
            | Self::If { span, .. } => span,
        }
    }
}

#[derive(Debug)]
pub struct Attr {
    pub name: Span,
    pub value: AttrValue,
    pub span: Span,
    /// `a="…"` rather than `a={…}`; upstream keeps the two apart and a few rules differ.
    pub quoted: bool,
    /// Written `{a}` rather than `a={a}`.
    pub shorthand: bool,
}

#[derive(Debug, Clone, Copy)]
pub enum AttrValue {
    /// `<input disabled>`
    True,
    /// Text and `{expression}` chunks; `{x}` and the shorthand `{x}` are one chunk.
    Parts(Range),
}

#[derive(Debug, Clone, Copy)]
pub enum Part {
    Text(Span),
    Expr {
        expr: NodeId,
        /// Braces included.
        span: Span,
    },
}

/// An attribute of a `<script>` or `<style>` start tag: name and quoted value.
pub type TagAttr = (Span, Option<Span>);

#[derive(Debug)]
pub struct Script {
    pub span: Span,
    pub attrs: Vec<TagAttr>,
    pub content: Span,
    pub program: NodeId,
    pub ts: bool,
}

#[derive(Debug)]
pub struct Style {
    pub span: Span,
    pub attrs: Vec<TagAttr>,
    pub sheet: StyleSheet,
}

#[derive(Debug)]
pub struct Component {
    pub js: Ast,
    pub nodes: Vec<TNode>,
    pub kids: Vec<TId>,
    pub attrs: Vec<Attr>,
    pub parts: Vec<Part>,
    pub root: Range,
    pub instance: Option<Script>,
    /// The instance script's program, or an empty one: scope analysis always has a root.
    pub program: NodeId,
    pub style: Option<Style>,
    /// Every template expression, in document order; roots for scope analysis.
    pub template_exprs: Vec<NodeId>,
    /// The whole document as tokens: markup, the JavaScript parser's tokens and comments, and the
    /// whitespace between them. The style sheet is one [`Tk::Css`] token.
    pub tokens: Tokens<Tk>,
}

/// A token of a component. Punctuation is split the way the parser reads it: `{#if`, `{:else`
/// and `{/if` are one [`Tk::BlockOpen`] each, the `}` that ends them a [`Tk::MustacheClose`].
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
    AttrName,
    /// `=`
    Eq,
    Quote,
    /// The text chunks of an attribute value.
    AttrText,
    /// `{`
    MustacheOpen,
    /// `}`
    MustacheClose,
    BlockOpen,
    /// `if` in `{:else if`.
    BlockKeyword,
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

impl Component {
    #[must_use]
    pub fn node(&self, id: TId) -> &TNode {
        &self.nodes[id as usize]
    }

    #[must_use]
    pub fn children(&self, r: Range) -> &[TId] {
        r.get(&self.kids)
    }

    /// `{#if a}…{:else if b}…{:else}…{/if}` as the `If` nodes `[a, b]`: an `{:else if}` is an `If`
    /// that is the only child of the previous one's `alt`.
    #[must_use]
    pub fn if_branches(&self, id: TId) -> Vec<TId> {
        let mut branches = vec![id];
        let mut last = id;
        while let TNode::If { alt: Some(a), .. } = self.node(last) {
            match self.children(*a) {
                [only] if matches!(self.node(*only), TNode::If { elseif: true, .. }) => {
                    branches.push(*only);
                    last = *only;
                }
                _ => break,
            }
        }
        branches
    }

    #[must_use]
    pub fn attrs(&self, r: Range) -> &[Attr] {
        r.get(&self.attrs)
    }

    #[must_use]
    pub fn parts(&self, r: Range) -> &[Part] {
        r.get(&self.parts)
    }

    #[must_use]
    pub const fn heap_bytes(&self) -> usize {
        self.js.heap_bytes()
            + self.nodes.capacity() * size_of::<TNode>()
            + self.kids.capacity() * 4
            + self.attrs.capacity() * size_of::<Attr>()
            + self.parts.capacity() * size_of::<Part>()
            + self.tokens.heap_bytes()
    }
}

/// The value of a text node or attribute chunk: character references decoded.
#[must_use]
pub fn decode_text(raw: &str) -> Cow<'_, str> {
    if !raw.contains('&') {
        return Cow::Borrowed(raw);
    }
    let mut out = String::with_capacity(raw.len());
    let mut rest = raw;
    while let Some(i) = rest.find('&') {
        out.push_str(&rest[..i]);
        rest = &rest[i..];
        if let Some((c, len)) = decode_reference(rest) {
            out.push(c);
            rest = &rest[len..];
        } else {
            out.push('&');
            rest = &rest[1..];
        }
    }
    out.push_str(rest);
    Cow::Owned(out)
}

/// Named references beyond these are not decoded yet (they stay as written).
const NAMED: &[(&str, char)] = &[
    ("amp", '&'),
    ("lt", '<'),
    ("gt", '>'),
    ("quot", '"'),
    ("apos", '\''),
    ("nbsp", '\u{a0}'),
];

fn decode_reference(s: &str) -> Option<(char, usize)> {
    let end = s.find(';')?;
    let body = &s[1..end];
    let c = if let Some(num) = body.strip_prefix('#') {
        let code = match num.strip_prefix(['x', 'X']) {
            Some(hex) => u32::from_str_radix(hex, 16).ok()?,
            None => num.parse().ok()?,
        };
        char::from_u32(code)?
    } else {
        NAMED.iter().find(|(n, _)| *n == body)?.1
    };
    Some((c, end + 1))
}
