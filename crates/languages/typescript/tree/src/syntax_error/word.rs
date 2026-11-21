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

/// How oxc's tree reads a word, which is how acorn reads it.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub(super) enum Read {
    /// As a name, which acorn checks with `checkUnreserved`.
    Name,
    /// As a token of its own, or unknown, where oxc left no tree.
    Token,
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
    let (home, name) = home(start, end, tokens, visit);
    let (word, read) = match (name, token) {
        (Some(name), _) => (name, Read::Name),
        (None, token) => (token?, Read::Token),
    };
    (coded || word.escaped || read == Read::Name)
        .then(|| misused_word(word, read, home, start))
        .flatten()
}

/// What acorn reports for `word`, read as `read` in `home`: `checkUnreserved`'s error for a name,
/// or its tokenizer's for a keyword written with an escape; `None` where that depends on a `home`
/// that is unknown, or acorn reads the word as a plain name.
fn misused_word(word: Word, read: Read, home: Option<Home>, at: u32) -> Option<Acorn> {
    let Word { kind, escaped } = word;
    let message = match kind {
        Kind::Await => Cow::Borrowed(match home? {
            Home::Function { is_async: true, .. } => {
                "Cannot use 'await' as identifier inside an async function"
            }
            Home::StaticBlock => "Cannot use await in class static initialization block",
            Home::TopLevel | Home::Function { .. } | Home::Initializer => {
                "Cannot use keyword 'await' outside an async function"
            }
        }),
        Kind::Yield => Cow::Borrowed(match home? {
            Home::Function {
                is_generator: true, ..
            } => "Cannot use 'yield' as identifier inside a generator",
            Home::TopLevel | Home::Function { .. } | Home::StaticBlock | Home::Initializer => {
                "The keyword 'yield' is reserved"
            }
        }),
        Kind::Enum => return Some(keyword(kind.to_str(), at)),
        _ if kind.is_strict_mode_contextual_keyword() => return Some(keyword(kind.to_str(), at)),
        _ if escaped && kind.is_reserved_keyword() => Cow::Owned(match read {
            Read::Name => format!("Unexpected keyword '{}'", kind.to_str()),
            Read::Token => format!("Escape sequence in keyword {}", kind.to_str()),
        }),
        _ => return None,
    };
    Some(Acorn::Fails { message, at })
}

/// Where acorn reads the word oxc labels `start..end`, and the name oxc's tree reads there. A
/// part oxc could not read has no tree, and there only a name outside every bracket and arrow
/// before it is known to be at the top level.
fn home(
    start: u32,
    end: u32,
    tokens: impl Iterator<Item = Token>,
    visit: impl FnOnce(&mut Locator),
) -> (Option<Home>, Option<Word>) {
    let mut locator = Locator::new(start, end, Find::Home);
    visit(&mut locator);
    if locator.walked {
        return (Some(locator.home.unwrap_or(Home::TopLevel)), locator.word);
    }
    let (depth, arrow) = tokens.take_while(|token| token.start() < start).fold(
        (0_i32, false),
        |(depth, arrow), token| match token.kind() {
            Kind::LCurly | Kind::LParen | Kind::LBrack | Kind::TemplateHead => (depth + 1, arrow),
            Kind::RCurly | Kind::RParen | Kind::RBrack | Kind::TemplateTail => (depth - 1, arrow),
            Kind::Arrow if depth == 0 => (depth, true),
            Kind::Semicolon if depth == 0 => (depth, false),
            _ => (depth, arrow),
        },
    );
    ((depth == 0 && !arrow).then_some(Home::TopLevel), None)
}

/// Acorn's error at a reserved `word`.
pub(super) fn keyword(word: &str, at: u32) -> Acorn {
    Acorn::Fails {
        message: Cow::Owned(format!("The keyword '{word}' is reserved")),
        at,
    }
}
