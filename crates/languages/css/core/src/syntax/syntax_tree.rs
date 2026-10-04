use rsvelte_kernel::newtype_index;
use rsvelte_kernel::source::interning::{Atom, Interner};
use rsvelte_kernel::source::positions::Span;
use rustc_hash::FxHashMap;

mod simple_list;
pub use simple_list::{Iter as SimpleIter, SimpleList};

newtype_index!(
    pub struct RuleIdentifier;
);

#[derive(Debug, Default)]
pub struct StyleSheet {
    /// The text between the tags of the embedding element.
    pub content: Span,
    pub rules: Box<[Rule]>,
    pub comments: Vec<Span>,
    pub whitespace: Box<[Span]>,
    pub comment_closers: Vec<Span>,
    pub selector_count: u32,
    pub relative_count: u32,
    pub value_tokens: Vec<Span>,
    pub rule_count: usize,
    pub atoms: Interner,
    pub escaped: FxHashMap<Span, Atom>,
}

impl StyleSheet {
    #[must_use]
    pub fn text<'a>(&'a self, span: Span, source: &'a str) -> &'a str {
        self.escaped
            .get(&span)
            .map_or_else(|| span.text(source), |atom| self.atoms.get(*atom))
    }
}

#[derive(Debug)]
pub struct Rule {
    pub identifier: Option<RuleIdentifier>,
    pub parent: Option<RuleIdentifier>,
    /// From the start of the prelude to the closing brace (or `;` for a block-less at-rule).
    pub span: Span,
    pub kind: RuleKind,
    pub declarations: Box<[Declaration]>,
    /// Rules nested in an at-rule block (e.g. `@media`).
    pub children: Box<[Self]>,
}

#[derive(Debug)]
pub enum RuleKind {
    Keyframe {
        prelude: Span,
        block: Span,
    },
    Style {
        selectors: Box<[ComplexSelector]>,
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
pub struct Declaration {
    pub span: Span,
    pub property: Span,
    pub value: Span,
    pub tokens: std::ops::Range<u32>,
}

#[derive(Debug)]
pub struct ComplexSelector {
    pub id: u32,
    pub span: Span,
    pub comma: Option<Span>,
    pub parts: Box<[RelativeSelector]>,
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
    pub parent_rule: Option<RuleIdentifier>,
    pub implicit_parent: bool,
    pub global: bool,
    pub id: u32,
    /// `None` for the first compound of a complex selector.
    pub combinator: Option<Combinator>,
    pub span: Span,
    pub simple: SimpleList,
}

#[derive(Debug)]
pub enum Simple {
    NamespacedType {
        span: Span,
        name: Span,
    },
    Nesting(Span),
    Type(Span),
    Universal(Span),
    Class {
        span: Span,
        name: Span,
    },
    Identifier {
        span: Span,
        name: Span,
    },
    Attribute {
        span: Span,
        name: Span,
        matcher: Option<(AttributeOperator, Span)>,
        insensitive: Option<bool>,
    },
    PseudoClass {
        span: Span,
        name: Span,
        arguments: Option<Span>,
        selectors: Box<[ComplexSelector]>,
    },
    PseudoElement {
        span: Span,
        name: Span,
    },
}

#[derive(Debug, Clone, Copy)]
pub enum AttributeOperator {
    Equal,
    Includes,
    Dash,
    Prefix,
    Suffix,
    Substring,
}

impl AttributeOperator {
    #[must_use]
    pub fn matches(self, text: &str, value: &str, insensitive: bool) -> bool {
        let equal = |left: &str, right: &str| {
            if insensitive {
                left.eq_ignore_ascii_case(right)
            } else {
                left == right
            }
        };
        let prefix = |text: &str| text.get(..value.len()).is_some_and(|s| equal(s, value));
        let suffix = |text: &str| {
            text.len()
                .checked_sub(value.len())
                .and_then(|at| text.get(at..))
                .is_some_and(|s| equal(s, value))
        };
        match self {
            Self::Equal => equal(text, value),
            Self::Includes => {
                !value.is_empty() && text.split_ascii_whitespace().any(|word| equal(word, value))
            }
            Self::Dash => {
                equal(text, value)
                    || (prefix(text) && text.as_bytes().get(value.len()) == Some(&b'-'))
            }
            Self::Prefix => !value.is_empty() && prefix(text),
            Self::Suffix => !value.is_empty() && suffix(text),
            Self::Substring => {
                !value.is_empty()
                    && if insensitive {
                        text.as_bytes()
                            .windows(value.len())
                            .any(|part| part.eq_ignore_ascii_case(value.as_bytes()))
                    } else {
                        text.contains(value)
                    }
            }
        }
    }
}

impl Simple {
    #[must_use]
    pub fn is_global_block(&self, source: &str) -> bool {
        matches!(
            self,
            Self::PseudoClass {
                arguments: None,
                ..
            }
        ) && self.is_pseudo(source, &["global"])
    }

    #[must_use]
    pub fn is_pseudo(&self, source: &str, names: &[&str]) -> bool {
        match self {
            Self::PseudoClass { name, .. } => names.contains(&name.text(source)),
            _ => false,
        }
    }

    #[must_use]
    pub fn has_nesting(&self) -> bool {
        match self {
            Self::Nesting(_) => true,
            Self::PseudoClass { selectors, .. } => selectors.iter().any(|selector| {
                selector
                    .parts
                    .iter()
                    .any(|part| part.simple.iter().any(Self::has_nesting))
            }),
            _ => false,
        }
    }

    #[must_use]
    pub const fn span(&self) -> Span {
        match *self {
            Self::Type(s) | Self::Universal(s) | Self::Nesting(s) => s,
            Self::Class { span, .. }
            | Self::NamespacedType { span, .. }
            | Self::Identifier { span, .. }
            | Self::Attribute { span, .. }
            | Self::PseudoClass { span, .. }
            | Self::PseudoElement { span, .. } => span,
        }
    }
}
