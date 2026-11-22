//! What acorn reports where it reads a keyword as a name, or meets one written with an escape.

use std::borrow::Cow;

use oxc_parser::{Kind, Token};

use super::Acorn;
use super::locator::{Find, Locator};

/// A word as acorn's tokenizer reads it.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub(super) struct Word {
    /// The keyword the word spells, or [`Kind::Ident`].
    pub(super) kind: Kind,
    /// Whether it is written with an escape.
    pub(super) escaped: bool,
}

impl Word {
    pub(super) fn named(name: &str, span: oxc_span::Span) -> Self {
        // An escape is longer than the character it writes.
        let escaped = span.size() as usize != name.len();
        Self {
            kind: Kind::match_keyword(name),
            escaped,
        }
    }
}

impl From<Token> for Word {
    fn from(token: Token) -> Self {
        Self {
            kind: token.kind(),
            escaped: token.escaped(),
        }
    }
}

/// Where acorn reads a name, which decides what it reports for `await` and `yield` there: the
/// innermost function, class static block or class field initializer around it.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub(super) enum Home {
    /// Outside every function and class static block.
    TopLevel,
    /// In a function, or an arrow function, which is never a generator.
    Function {
        is_async: bool,
        is_generator: bool,
    },
    StaticBlock,
    /// A class field's initializer, which acorn reads as the body of a plain function.
    Initializer,
}

impl Home {
    /// Whether acorn reads `await` here as the keyword.
    const fn awaits(self) -> bool {
        matches!(self, Self::TopLevel | Self::Function { is_async: true, .. })
    }

    /// Whether acorn reads `yield` here as the keyword.
    const fn yields(self) -> bool {
        matches!(
            self,
            Self::Function {
                is_generator: true,
                ..
            }
        )
    }
}

/// How acorn reads a word.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub(super) enum Read {
    /// As a name, which acorn checks with `checkUnreserved`.
    Name,
    /// As a token of its own, where oxc's tree reads no name or oxc left no tree.
    Token,
    /// As an expression, which `=>` then ends: a keyword where it is one, such as `await` where
    /// acorn can await.
    Expression,
    /// As an expression in a list that acorn then checks as an arrow's parameters.
    Parameter,
}

/// What acorn reports for the word oxc labels `start..end`, by the name oxc's tree reads there or
/// the token at `start`: an analysis reads no tokens, and oxc labels a whole `await` expression.
/// An error without a TypeScript code, which may be about anything at the word, is about the word
/// only where it is escaped, or is `await` or `yield` read as a name.
pub(super) fn misused(
    start: u32,
    end: u32,
    tokens: impl Iterator<Item = Token> + Clone,
    visit: impl FnOnce(&mut Locator),
    coded: bool,
) -> Option<Acorn> {
    let token = (tokens.clone())
        .find(|token| token.start() >= start)
        .filter(|token| token.start() == start)
        .map(Word::from);
    if !coded
        && !token
            .is_some_and(|token| token.escaped || matches!(token.kind, Kind::Await | Kind::Yield))
    {
        return None;
    }
    let next = (tokens.clone())
        .find(|token| token.start() >= end)
        .map(|token| token.start());
    let (home, named) = home(start, end, tokens, visit);
    let (word, read) = match (named, token) {
        (Some(named), _) => named,
        (None, token) => (token?, Read::Token),
    };
    (coded || word.escaped || named.is_some())
        .then(|| misused_word(word, read, home, (start, next)))
        .flatten()
}

/// What acorn reports for `word`, read as `read` in `home`, at `at` or at the token after it:
/// `checkUnreserved`'s error for a name, its tokenizer's for a keyword written with an escape, or
/// the error of the expression `await` or `yield` starts; `None` where that depends on a `home`
/// or a token that is unknown, or acorn reads the word as a plain name.
fn misused_word(
    word: Word,
    read: Read,
    home: Option<Home>,
    (at, next): (u32, Option<u32>),
) -> Option<Acorn> {
    let Word { kind, escaped } = word;
    let unexpected_next = || {
        Some(Acorn::Fails {
            message: Cow::Borrowed("Unexpected token"),
            at: next?,
        })
    };
    let as_keyword = (!escaped).then_some(read);
    let message = match (kind, as_keyword) {
        // An `await` expression's operand is missing where acorn meets the next token.
        (Kind::Await, Some(Read::Expression | Read::Parameter)) if home?.awaits() => {
            return unexpected_next();
        }
        // A `yield` expression ends at `=>`, or is checked as a parameter's default value.
        (Kind::Yield, Some(Read::Expression)) if home?.yields() => return unexpected_next(),
        (Kind::Yield, Some(Read::Parameter)) if home?.yields() => {
            Cow::Borrowed("Yield expression cannot be a default value")
        }
        (Kind::Await, _) => Cow::Borrowed(match home? {
            Home::Function { is_async: true, .. } => {
                "Cannot use 'await' as identifier inside an async function"
            }
            Home::StaticBlock => "Cannot use await in class static initialization block",
            Home::TopLevel | Home::Function { .. } | Home::Initializer => {
                "Cannot use keyword 'await' outside an async function"
            }
        }),
        (Kind::Yield, _) => Cow::Borrowed(match home? {
            Home::Function {
                is_generator: true, ..
            } => "Cannot use 'yield' as identifier inside a generator",
            Home::TopLevel | Home::Function { .. } | Home::StaticBlock | Home::Initializer => {
                "The keyword 'yield' is reserved"
            }
        }),
        (Kind::Enum, _) => return Some(keyword(kind.to_str(), at)),
        _ if kind.is_strict_mode_contextual_keyword() => return Some(keyword(kind.to_str(), at)),
        _ if escaped && kind.is_reserved_keyword() => Cow::Owned(match read {
            Read::Name => format!("Unexpected keyword '{}'", kind.to_str()),
            Read::Token => format!("Escape sequence in keyword {}", kind.to_str()),
            // acorn's expression reader meets a keyword that starts no expression.
            Read::Expression | Read::Parameter => "Unexpected token".to_owned(),
        }),
        _ => return None,
    };
    Some(Acorn::Fails { message, at })
}

/// Where acorn reads the word oxc labels `start..end`, and the name oxc's tree reads there. A
/// part oxc could not read has no tree. There a name is known to be at the top level when it is
/// outside every bracket and arrow before it, or when nothing before it can start a function:
/// `function`, `class`, `=>`, or a `{` after a `)` that closes inside brackets or right before it,
/// which is how a method's body opens, with or without a return type.
pub(super) fn home(
    start: u32,
    end: u32,
    tokens: impl Iterator<Item = Token>,
    visit: impl FnOnce(&mut Locator),
) -> (Option<Home>, Option<(Word, Read)>) {
    #[derive(Clone, Copy, Default)]
    struct Before {
        depth: i32,
        arrow: bool,
        function: bool,
        previous: Option<Kind>,
        closed_inside: bool,
    }
    let mut locator = Locator::new(start, end, Find::Home);
    visit(&mut locator);
    if locator.walked {
        return (Some(locator.home.unwrap_or(Home::TopLevel)), locator.word);
    }
    let before = tokens.take_while(|token| token.start() < start).fold(
        Before::default(),
        |before, token| {
            let kind = token.kind();
            let opens_body = kind == Kind::LCurly
                && (before.closed_inside || before.previous == Some(Kind::RParen));
            let depth = match kind {
                Kind::LCurly | Kind::LParen | Kind::LBrack | Kind::TemplateHead => before.depth + 1,
                Kind::RCurly | Kind::RParen | Kind::RBrack | Kind::TemplateTail => before.depth - 1,
                _ => before.depth,
            };
            Before {
                depth,
                arrow: match kind {
                    Kind::Arrow if depth == 0 => true,
                    Kind::Semicolon if depth == 0 => false,
                    _ => before.arrow,
                },
                function: before.function
                    || opens_body
                    || matches!(kind, Kind::Function | Kind::Arrow | Kind::Class),
                previous: Some(kind),
                closed_inside: before.closed_inside || (kind == Kind::RParen && depth > 0),
            }
        },
    );
    let top_level = (before.depth == 0 && !before.arrow) || !before.function;
    (top_level.then_some(Home::TopLevel), None)
}

/// Acorn's error at a reserved `word`.
pub(super) fn keyword(word: &str, at: u32) -> Acorn {
    Acorn::Fails {
        message: Cow::Owned(format!("The keyword '{word}' is reserved")),
        at,
    }
}
