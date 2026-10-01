//! The Svelte surface tree.
//!
//! Template nodes live in flat vectors and refer to each other by index;
//! every JavaScript expression (script and template) lives in the one [`SyntaxTree`] of the
//! component, so a single scope analysis sees both.

use rsvelte_javascript::{NodeIdentifier, SyntaxTree};
use rsvelte_kernel::performance::buffer_pool;
use rsvelte_kernel::source::positions::Span;
use rsvelte_kernel::source::tokens::{TokenKind, Tokens};
use rsvelte_stylesheet::StyleSheet;

pub type TemplateNodeIdentifier = u32;

/// A slice of one of the side vectors (`children`, `attributes`, `parts`).
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
    Expression {
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
    If {
        test: NodeIdentifier,
        consequent: Range,
        /// An `{:else if}` branch is an alternate holding one `If` with `elseif` set.
        alternate: Option<Range>,
        elseif: bool,
        span: Span,
    },
}

impl TemplateNode {
    #[must_use]
    pub const fn span(&self) -> Span {
        match *self {
            Self::Text { span }
            | Self::Comment { span, .. }
            | Self::Expression { span, .. }
            | Self::Element { span, .. }
            | Self::If { span, .. } => span,
        }
    }
}

#[derive(Debug)]
pub struct Attribute {
    pub name: Span,
    pub value: AttributeValue,
    pub span: Span,
    /// `a="…"` rather than `a={…}`; upstream keeps the two apart and a few rules differ.
    pub quoted: bool,
    /// Written `{a}` rather than `a={a}`.
    pub shorthand: bool,
}

#[derive(Debug, Clone, Copy)]
pub enum AttributeValue {
    /// `<input disabled>`
    True,
    /// Text and `{expression}` chunks; `{x}` and the shorthand `{x}` are one chunk.
    Parts(Range),
}

pub use crate::compilation::compiler_syntax_tree::Part;

/// An attribute of a `<script>` or `<style>` start tag: name and quoted value.
pub type TagAttributes = (Span, Option<Span>);

#[derive(Debug)]
pub struct Script {
    pub span: Span,
    pub attributes: Vec<TagAttributes>,
    pub content: Span,
    pub program: NodeIdentifier,
    pub typescript: bool,
}

#[derive(Debug)]
pub struct Style {
    pub span: Span,
    pub attributes: Vec<TagAttributes>,
    pub sheet: StyleSheet,
}

#[derive(Debug)]
pub struct Component {
    pub javascript: SyntaxTree,
    pub nodes: Vec<TemplateNode>,
    pub children: Vec<TemplateNodeIdentifier>,
    pub attributes: Vec<Attribute>,
    pub parts: Vec<Part>,
    pub root: Range,
    pub instance: Option<Script>,
    /// The instance script's program, or an empty one: scope analysis always has a root.
    pub program: NodeIdentifier,
    pub style: Option<Style>,
    /// Every template expression, in document order; roots for scope analysis.
    pub template_expressions: Vec<NodeIdentifier>,
    /// The whole document as tokens: markup, the JavaScript parser's tokens and comments, and the
    /// whitespace between them. The style sheet is one [`TokenType::Stylesheet`] token.
    pub tokens: Tokens<TokenType>,
}

/// A token of a component. Punctuation is split the way the parser reads it: `{#if`, `{:else`
/// and `{/if` are one [`TokenType::BlockOpen`] each, the `}` that ends them a
/// [`TokenType::MustacheClose`].
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
    AttributeName,
    /// `=`
    Eq,
    Quote,
    /// The text chunks of an attribute value.
    AttributeText,
    /// `{`
    MustacheOpen,
    /// `}`
    MustacheClose,
    BlockOpen,
    /// `if` in `{:else if`.
    BlockKeyword,
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

/// The template's columns go back to the thread's [`buffer_pool`] for the next document, as the
/// script's do.
impl Drop for Component {
    fn drop(&mut self) {
        buffer_pool::give_keyed::<Self, _>(std::mem::take(&mut self.nodes));
        buffer_pool::give_keyed::<Self, _>(std::mem::take(&mut self.children));
        buffer_pool::give_keyed::<Self, _>(std::mem::take(&mut self.attributes));
        buffer_pool::give_keyed::<Self, _>(std::mem::take(&mut self.parts));
        buffer_pool::give_keyed::<Self, _>(std::mem::take(&mut self.template_expressions));
    }
}

impl Component {
    #[must_use]
    pub fn node(&self, identifier: TemplateNodeIdentifier) -> &TemplateNode {
        &self.nodes[identifier as usize]
    }

    #[must_use]
    pub fn children(&self, r: Range) -> &[TemplateNodeIdentifier] {
        r.get(&self.children)
    }

    /// `{#if a}…{:else if b}…{:else}…{/if}` as the `If` nodes `[a, b]`: an `{:else if}` is an `If`
    /// that is the only child of the previous one's `alternate`.
    #[must_use]
    pub fn if_branches(&self, identifier: TemplateNodeIdentifier) -> Vec<TemplateNodeIdentifier> {
        let mut branches = vec![identifier];
        let mut last = identifier;
        while let TemplateNode::If {
            alternate: Some(a), ..
        } = self.node(last)
        {
            match self.children(*a) {
                [only] if matches!(self.node(*only), TemplateNode::If { elseif: true, .. }) => {
                    branches.push(*only);
                    last = *only;
                }
                _ => break,
            }
        }
        branches
    }

    #[must_use]
    pub fn attributes(&self, r: Range) -> &[Attribute] {
        r.get(&self.attributes)
    }

    #[must_use]
    pub fn parts(&self, r: Range) -> &[Part] {
        r.get(&self.parts)
    }

    #[must_use]
    pub const fn heap_bytes(&self) -> usize {
        self.javascript.heap_bytes()
            + self.nodes.capacity() * size_of::<TemplateNode>()
            + self.children.capacity() * 4
            + self.attributes.capacity() * size_of::<Attribute>()
            + self.parts.capacity() * size_of::<Part>()
            + self.tokens.heap_bytes()
    }
}

pub use rsvelte_markup::decode_text;

// Pinned so a change to the surface tree's layout is a decision.
const _: () = assert!(
    size_of::<TemplateNode>() == 44,
    "`TemplateNode` is 44 bytes"
);
const _: () = assert!(size_of::<Attribute>() == 32, "`Attribute` is 32 bytes");
