//! The Svelte surface tree.
//!
//! Template nodes live in flat vectors and refer to each other by index;
//! every JavaScript expression (script and template) lives in the one [`SyntaxTree`] of the
//! component, so a single scope analysis sees both.

use rsvelte_kernel::performance::buffer_pool;
use rsvelte_kernel::source::positions::Span;
use rsvelte_kernel::source::tokens::{TokenKind, Tokens};
use rsvelte_stylesheet::StyleSheet;
use rsvelte_typescript::{NodeIdentifier, SyntaxTree};

pub type TemplateNodeIdentifier = u32;

/// A slice of one of the side vectors (`children`, `attributes`, `parts`, `modifiers`,
/// `javascript_lists`).
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub struct Range {
    pub start: u32,
    pub len: u32,
}

impl Range {
    /// An absent child list, which is not the empty one: `{#await p}{:then}{/await}` has an empty
    /// `then` and no `catch`.
    pub const ABSENT: Self = Self {
        start: u32::MAX,
        len: 0,
    };

    pub fn get<T>(self, v: &[T]) -> &[T] {
        &v[self.start as usize..(self.start + self.len) as usize]
    }

    #[must_use]
    pub const fn present(self) -> Option<Self> {
        if self.start == u32::MAX {
            None
        } else {
            Some(self)
        }
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
        component: NodeIdentifier,
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
    /// `{#each expression as context, index (key)}…{:else}…{/each}`; an absent part is
    /// `NodeIdentifier::NONE`.
    Each {
        expression: NodeIdentifier,
        /// The pattern after `as`.
        context: NodeIdentifier,
        /// An identifier node in the component's [`SyntaxTree`], so scope analysis can declare it.
        index: NodeIdentifier,
        key: NodeIdentifier,
        body: Range,
        /// Meaningful only with `has_fallback`: `{:else}` with nothing after it is an empty
        /// fallback, not an absent one.
        fallback: Range,
        has_fallback: bool,
        span: Span,
    },
    /// `{#key expression}…{/key}`
    Key {
        expression: NodeIdentifier,
        body: Range,
        span: Span,
    },
    /// `{#await expression}…{:then value}…{:catch error}…{/await}`. `{#await p then v}` has no
    /// pending branch. An absent pattern is `NodeIdentifier::NONE`; an absent branch is
    /// [`Range::ABSENT`].
    Await {
        expression: NodeIdentifier,
        value: NodeIdentifier,
        error: NodeIdentifier,
        pending: Range,
        then: Range,
        catch: Range,
        span: Span,
    },
    /// `{#snippet name(parameters)}…{/snippet}`; the parameters are patterns in
    /// [`Component::javascript_lists`].
    Snippet {
        name: NodeIdentifier,
        parameters: Range,
        body: Range,
        span: Span,
    },
    /// `{@render expression}`, where the expression is a call or an optional call.
    Render {
        expression: NodeIdentifier,
        span: Span,
    },
    /// `{@html expression}`
    Html {
        expression: NodeIdentifier,
        span: Span,
    },
    /// `{@const pattern = expression}`, as the `const` declaration it stands for.
    Const {
        declaration: NodeIdentifier,
        span: Span,
    },
    /// `{@debug a, b}`; the identifiers are in [`Component::javascript_lists`].
    Debug {
        identifiers: Range,
        span: Span,
    },
    /// `{let …}` or `{const …}`: a variable declaration in the template.
    Declaration {
        declaration: NodeIdentifier,
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
            | Self::If { span, .. }
            | Self::Each { span, .. }
            | Self::Key { span, .. }
            | Self::Await { span, .. }
            | Self::Snippet { span, .. }
            | Self::Render { span, .. }
            | Self::Html { span, .. }
            | Self::Const { span, .. }
            | Self::Debug { span, .. }
            | Self::Declaration { span, .. } => span,
        }
    }
}

#[derive(Debug)]
pub struct Attribute {
    pub kind: AttributeKind,
    /// As written: `bind:value` for a binding, `on:click|once` for an event directive, empty for
    /// an `{@attach}` or a spread.
    pub name: Span,
    /// A directive's `|modifier` names, in [`Component::modifiers`].
    pub modifiers: Range,
    /// What the name of a `use:`, `transition:`, `in:`, `out:` or `animate:` directive refers to:
    /// an identifier or a member chain (`a.b`); `NodeIdentifier::NONE` for other attributes.
    pub target: NodeIdentifier,
    pub value: AttributeValue,
    pub span: Span,
    /// `a="…"` rather than `a={…}`; upstream keeps the two apart and a few rules differ.
    pub quoted: bool,
    /// Written `{a}` rather than `a={a}`, or `bind:a` rather than `bind:a={a}`.
    pub shorthand: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AttributeKind {
    Attribute,
    /// `bind:name={expression}`; the value is the one expression.
    Bind,
    /// `{@attach expression}`; the name is empty and the value is the one expression.
    Attach,
    /// `class:name={expression}`; the value is the one expression.
    Class,
    /// `{...expression}`; the name is empty and the value is the one expression.
    Spread,
    /// `on:name={handler}`; without a value the event is forwarded.
    On,
    /// `use:action={argument}`
    Use,
    /// `transition:name`, `in:name` or `out:name`, with the directions it runs in.
    Transition {
        intro: bool,
        outro: bool,
    },
    /// `animate:name={parameters}`
    Animate,
    /// `style:property={value}`, or text and expressions like an attribute's value.
    Style,
    /// `let:name={pattern}`
    Let,
}

impl AttributeKind {
    /// The length of the prefix before the directive's name, the `:` included.
    #[must_use]
    pub const fn prefix_len(self) -> Option<u32> {
        Some(match self {
            Self::Bind => "bind:".len() as u32,
            Self::Class => "class:".len() as u32,
            Self::On => "on:".len() as u32,
            Self::Use => "use:".len() as u32,
            Self::Transition {
                intro: true,
                outro: true,
            } => "transition:".len() as u32,
            Self::Transition { intro: true, .. } => "in:".len() as u32,
            Self::Transition { .. } => "out:".len() as u32,
            Self::Animate => "animate:".len() as u32,
            Self::Style => "style:".len() as u32,
            Self::Let => "let:".len() as u32,
            Self::Attribute | Self::Attach | Self::Spread => return None,
        })
    }
}

impl Attribute {
    /// The name after a directive's prefix and before its modifiers: `value` in `bind:value`,
    /// `click` in `on:click|once`.
    #[must_use]
    pub fn directive_name(&self, modifiers: &[Span]) -> Option<Span> {
        let prefix = self.kind.prefix_len()?;
        // The modifier's span starts after its `|`.
        let end_offset = self
            .modifiers
            .get(modifiers)
            .first()
            .map_or(self.name.end_offset, |first| first.start_offset - 1);
        Some(Span::new(self.name.start_offset + prefix, end_offset))
    }
}

#[derive(Debug, Clone, Copy)]
pub enum AttributeValue {
    /// `<input disabled>`
    True,
    /// Text and `{expression}` chunks; `{x}` and the shorthand `{x}` are one chunk.
    Parts(Range),
}

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
    /// The `|modifier` names of directives.
    pub modifiers: Vec<Span>,
    /// Lists of JavaScript nodes: snippet parameters and `{@debug}` identifiers.
    pub javascript_lists: Vec<NodeIdentifier>,
    pub root: Range,
    /// `<script module>`, whose program is in the same [`SyntaxTree`].
    pub module: Option<Script>,
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
    /// `if` in `{:else if`, `as` in `{#each … as …}`, `@attach` in `{@attach …}`.
    BlockKeyword,
    JavaScript(rsvelte_typescript::lexer::T),
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
        buffer_pool::give_keyed::<Self, _>(std::mem::take(&mut self.modifiers));
        buffer_pool::give_keyed::<Self, _>(std::mem::take(&mut self.javascript_lists));
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
    pub fn modifiers(&self, r: Range) -> &[Span] {
        r.get(&self.modifiers)
    }

    #[must_use]
    pub fn javascript_list(&self, r: Range) -> &[NodeIdentifier] {
        r.get(&self.javascript_lists)
    }

    #[must_use]
    pub const fn heap_bytes(&self) -> usize {
        self.javascript.heap_bytes()
            + self.nodes.capacity() * size_of::<TemplateNode>()
            + self.children.capacity() * 4
            + self.attributes.capacity() * size_of::<Attribute>()
            + self.parts.capacity() * size_of::<Part>()
            + self.modifiers.capacity() * size_of::<Span>()
            + self.javascript_lists.capacity() * size_of::<NodeIdentifier>()
            + self.tokens.heap_bytes()
    }
}

pub use super::character_references::{decode_attribute, decode_text};

// Pinned so a change to the surface tree's layout is a decision.
const _: () = assert!(
    size_of::<TemplateNode>() == 48,
    "`TemplateNode` is 48 bytes"
);
const _: () = assert!(size_of::<Attribute>() == 44, "`Attribute` is 44 bytes");
