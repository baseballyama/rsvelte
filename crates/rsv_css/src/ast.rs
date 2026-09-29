use rsv_kernel::source::Span;

#[derive(Debug, Default)]
pub struct StyleSheet {
    /// The text between the tags of the embedding element.
    pub content: Span,
    pub rules: Vec<Rule>,
}

#[derive(Debug)]
pub struct Rule {
    /// From the start of the prelude to the closing brace (or `;` for a block-less at-rule).
    pub span: Span,
    pub kind: RuleKind,
    pub decls: Vec<Decl>,
    /// Rules nested in an at-rule block (e.g. `@media`).
    pub children: Vec<Self>,
}

#[derive(Debug)]
pub enum RuleKind {
    Style {
        selectors: Vec<ComplexSelector>,
        /// `{ … }`, braces included.
        block: Span,
    },
    At {
        name: Span,
        prelude: Span,
        block: Option<Span>,
    },
}

#[derive(Debug)]
pub struct Decl {
    pub span: Span,
    pub property: Span,
    pub value: Span,
}

#[derive(Debug)]
pub struct ComplexSelector {
    pub span: Span,
    pub parts: Vec<RelativeSelector>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Combinator {
    Descendant,
    Child,
    NextSibling,
    SubsequentSibling,
}

#[derive(Debug)]
pub struct RelativeSelector {
    /// `None` for the first compound of a complex selector.
    pub combinator: Option<Combinator>,
    pub span: Span,
    pub simple: Vec<Simple>,
}

#[derive(Debug)]
pub enum Simple {
    Type(Span),
    Universal(Span),
    Class {
        span: Span,
        name: Span,
    },
    Id {
        span: Span,
        name: Span,
    },
    Attribute {
        span: Span,
        name: Span,
    },
    PseudoClass {
        span: Span,
        name: Span,
        args: Option<Span>,
    },
    PseudoElement {
        span: Span,
        name: Span,
    },
}

impl Simple {
    #[must_use]
    pub const fn span(&self) -> Span {
        match *self {
            Self::Type(s) | Self::Universal(s) => s,
            Self::Class { span, .. }
            | Self::Id { span, .. }
            | Self::Attribute { span, .. }
            | Self::PseudoClass { span, .. }
            | Self::PseudoElement { span, .. } => span,
        }
    }
}
