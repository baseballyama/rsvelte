//! oxc's syntax errors as the document's diagnostics, keeping what acorn reports for each, for a
//! host that reports as acorn does.

use std::borrow::Cow;

pub use locator::Locator;
use locator::{Find, Holder, Reading, locate};
use oxc_ast::AstType;
use oxc_diagnostics::OxcDiagnostic;
use oxc_parser::config::TokensParserConfig;
use oxc_parser::{Kind, Parser, Token};
use oxc_span::SourceType;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;

/// A syntax error, and what acorn reports for it when oxc's code says.
#[derive(Clone, Debug)]
pub struct SyntaxError {
    pub diagnostic: Diagnostic,
    pub acorn: Option<Acorn>,
    /// The number of tsc's diagnostic for it, when oxc gives one.
    pub typescript_code: Option<u32>,
    /// Where typescript-eslint throws it, when that is not where oxc labels it.
    pub typescript_eslint_at: Option<u32>,
}

/// What acorn, which knows no TypeScript, does with the text oxc rejected.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Acorn {
    /// Its expression ends before `at`, where TypeScript-only syntax starts; a program fails there
    /// with "Unexpected token".
    Stops(u32),
    /// It fails at `at` with `message`.
    Fails { message: Cow<'static, str>, at: u32 },
}

impl From<SyntaxError> for Diagnostic {
    fn from(error: SyntaxError) -> Self {
        error.diagnostic
    }
}

/// The first error, at the place oxc labels `shift` bytes later, or at `fallback` when it labels
/// none. `text` is what oxc read, which the labels index, and `tokens` what it read of it.
pub fn syntax_error(
    errors: impl IntoIterator<Item = OxcDiagnostic>,
    text: &str,
    tokens: &[Token],
    fallback: u32,
    shift: u32,
) -> SyntaxError {
    let fallback = fallback + shift;
    let Some(error) = errors.into_iter().next() else {
        return SyntaxError {
            diagnostic: Diagnostic::error(
                "parse_error",
                "invalid syntax",
                Span::new(fallback, fallback),
            ),
            acorn: None,
            typescript_code: None,
            typescript_eslint_at: None,
        };
    };
    let span = error.labels.first().map_or_else(
        || Span::new(fallback, fallback),
        |label| {
            let start = label.offset() + shift;
            Span::new(start, start + label.len())
        },
    );
    SyntaxError {
        diagnostic: Diagnostic::error("parse_error", error.message.to_string(), span),
        acorn: acorn(&error, text, (tokens, None), |_| {}).map(|acorn| acorn.shifted(shift)),
        typescript_code: typescript_code(&error),
        typescript_eslint_at: None,
    }
}

/// [`syntax_error`] for an error of the analysis of a whole document, whose nodes `visit` hands
/// to [`Locator::enter`] in the order they were walked.
pub fn analysis_error(
    error: &OxcDiagnostic,
    text: &str,
    visit: impl FnOnce(&mut Locator),
) -> SyntaxError {
    let mut syntax_error = syntax_error([error.clone()], text, &[], 0, 0);
    syntax_error.acorn = acorn(error, text, (&[], None), visit);
    syntax_error
}

/// The number of `error`'s tsc diagnostic.
pub(crate) fn typescript_code(error: &OxcDiagnostic) -> Option<u32> {
    if error.code.scope.as_deref() != Some("TS") {
        return None;
    }
    error.code.number.as_deref()?.parse().ok()
}

impl SyntaxError {
    /// Where acorn reports this error: where it stops, or oxc's place when its code does not say.
    #[must_use]
    pub const fn acorn_at(&self) -> u32 {
        match self.acorn {
            Some(Acorn::Stops(at) | Acorn::Fails { at, .. }) => at,
            None => self.diagnostic.span.start_offset,
        }
    }
}

impl Acorn {
    pub(crate) fn shifted(self, shift: u32) -> Self {
        match self {
            Self::Stops(at) => Self::Stops(at + shift),
            Self::Fails { message, at } => Self::Fails {
                message,
                at: at + shift,
            },
        }
    }
}

/// Whether a host reports `error`, in the part whose tree `visit` walks: not when its code is one
/// of `unchecked`, the rules the host's parser does not check, nor, for a host that reads
/// `as_acorn`, where acorn reads the text oxc rejects.
pub(crate) fn reported(
    error: &OxcDiagnostic,
    unchecked: &[&str],
    as_acorn: bool,
    visit: impl FnOnce(&mut Locator),
) -> bool {
    let number = (error.code.scope.as_deref() == Some("TS"))
        .then(|| error.code.number.as_deref())
        .flatten();
    number.is_none_or(|number| {
        let accepted = as_acorn && acorn_accepts(error, number, visit);
        !(unchecked.contains(&number) || accepted)
    })
}

/// Whether acorn reads the text oxc rejects with `error`, whose code is `number`, without failing.
#[cold]
fn acorn_accepts(error: &OxcDiagnostic, number: &str, visit: impl FnOnce(&mut Locator)) -> bool {
    let Some(label) = error.labels.first() else {
        return false;
    };
    let (start, end) = (label.offset(), label.offset() + label.len());
    match number {
        "1047" => optional_rest(start, end, visit) == Some(Ok(())),
        // acorn-typescript reads a class accessor without a body as a signature.
        "1005" => locate(start, end, Find::BodilessAccessor, visit).is_some(),
        // acorn-typescript checks no interface, and a type alias only against the types before it.
        "2300" => {
            let Some(second) = error.labels.get(1) else {
                return false;
            };
            let second = (second.offset(), second.offset() + second.len());
            let locator = redeclared((start, end), second, visit);
            match locator.found {
                Some((_, AstType::TSInterfaceDeclaration)) => true,
                Some((_, AstType::TSTypeAliasDeclaration)) => !locator.first_is_type,
                _ => false,
            }
        }
        _ => false,
    }
}

/// What acorn reports for `error`, in the part whose text is `text`, whose tokens are `tokens`,
/// followed by the token after the part that ended it, and whose tree `visit` walks; `None` for an
/// error whose code does not say, or that acorn accepts.
#[cold]
pub(crate) fn acorn(
    error: &OxcDiagnostic,
    text: &str,
    (tokens, next): (&[Token], Option<Token>),
    visit: impl FnOnce(&mut Locator),
) -> Option<Acorn> {
    let label = error.labels.first()?;
    let (start, end) = (label.offset(), label.offset() + label.len());
    let read = || tokens.iter().copied().chain(next);
    let kind_at = |at: u32| {
        let token = read().nth(tokens.partition_point(|token| token.start() < at))?;
        (token.start() == at).then(|| token.kind())
    };
    // A script is a module, so acorn reads every reserved word in a binding as an error of its own.
    let reserved = |at: u32| {
        let kind = kind_at(at)?;
        (kind == Kind::Enum || kind.is_future_reserved_keyword())
            .then(|| keyword(kind.to_str(), at))
    };
    if error.code.scope.as_deref() != Some("TS") {
        // oxc stops at `enum` in JavaScript, where acorn reads it as a reserved name.
        return reserved(start).filter(|_| kind_at(start) == Some(Kind::Enum));
    }
    let token = |after: u32, kind: Option<Kind>| {
        read()
            .filter(|token| token.start() >= after)
            .find(|token| kind.is_none_or(|kind| token.kind() == kind))
            .map(|token| token.start())
    };
    let number = error.code.number.as_deref()?;
    match number {
        // `as`, `satisfies`: oxc labels the whole assertion, and the operand's span leaves out
        // its parentheses, so acorn stops at the keyword after it.
        "8016" => token(
            locate(start, end, Find::OperandEnd, visit)?.0,
            Some(Kind::As),
        )
        .map(Acorn::Stops),
        "8037" => token(
            locate(start, end, Find::OperandEnd, visit)?.0,
            Some(Kind::Satisfies),
        )
        .map(Acorn::Stops),
        "8009" if text.get(start as usize..end as usize) == Some("?") => {
            Some(fails("Unexpected token", optional_member(start, read())))
        }
        // A parameter's modifier is a binding to acorn, so a reserved one fails where it starts.
        "8012" if reserved(start).is_some() => reserved(start),
        // A modifier: acorn reads it as the member's name and fails at the token after it. So it
        // does after a lone name that a token on its line follows, and after a declaration's
        // binding that has no initializer.
        "8009" | "8012" | "1434" | "1435" | "1155" | "1182" => {
            Some(fails("Unexpected token", token(end, None)?))
        }
        // `enum` where an expression belongs: acorn reads it as a reserved name.
        "1109" if kind_at(start) == Some(Kind::Enum) => reserved(start),
        // `()`: oxc labels both parentheses, and acorn fails at the closing one.
        "1109" if text.get(start as usize..end as usize)?.starts_with('(') => {
            Some(fails("Unexpected token", end.checked_sub(1)?))
        }
        // Modifiers out of order: acorn fails after the member's first word after `static`.
        "1029" => Some(fails(
            "Unexpected token",
            after_member_name(start, end, read(), visit)?,
        )),
        // A numeric enum member, a class's `implements`, a token where an expression or a type
        // belongs and JSX are where acorn fails.
        "2452" | "8005" | "1109" | "1110" | "17004" => Some(fails("Unexpected token", start)),
        // oxc labels the slash, and acorn reports the body after it.
        "1161" => Some(fails("Unterminated regular expression", start + 1)),
        // A missing token: acorn fails at the next token from where oxc labels it, or at the end.
        "1005" => Some(fails(
            "Unexpected token",
            missing(error, (text, start), read).unwrap_or(text.len() as u32),
        )),
        // An arrow function's type parameters, where acorn fails at the `<`.
        "8004" => Some(fails(
            "Unexpected token",
            read()
                .take_while(|token| token.start() < start)
                .last()?
                .start(),
        )),
        "2364" | "2701" | "2357" | "2406" | "2487" => {
            Some(fails("Assigning to rvalue", rvalue(start, read())?))
        }
        "1127" => unexpected_character(text, start, end),
        // A word reserved in strict code, which acorn names unescaped, as its token does; the
        // analysis passes no tokens.
        "1212" => Some(keyword(
            kind_at(start).map_or(text.get(start as usize..end as usize)?, |kind| {
                kind.to_str()
            }),
            start,
        )),
        "1049" => Some(fails("setter should have exactly one param", start)),
        "1473" | "1474" => Some(fails(
            "'import' and 'export' may only appear at the top level",
            start,
        )),
        // acorn-typescript reads `<>` and fails at the token after it, and an index signature's
        // second parameter at its comma.
        "1098" => Some(fails(
            "Type parameter list cannot be empty.",
            token(end, None)?,
        )),
        "1096" => Some(fails("Unexpected token", token(start, Some(Kind::Comma))?)),
        // The lexer's errors: acorn reads a template's body and a regular expression's from the
        // byte after the opening, and a shorthand's initializer from its `=`.
        "1002" => Some(fails("Unterminated string constant", start)),
        "1160" => Some(fails("Unterminated template", start + 1)),
        "1010" => Some(fails("Unterminated comment", start)),
        "1499" => Some(fails(
            "Invalid regular expression flag",
            read()
                .take_while(|token| token.start() <= start)
                .last()?
                .start()
                + 1,
        )),
        "1312" => Some(fails(
            "Shorthand property assignments are valid only in destructuring patterns",
            token(start, Some(Kind::Eq))?,
        )),
        _ => early_error(error, number, text, (start, end), visit),
    }
}

/// Acorn's error at a reserved `word`.
fn keyword(word: &str, at: u32) -> Acorn {
    Acorn::Fails {
        message: Cow::Owned(format!("The keyword '{word}' is reserved")),
        at,
    }
}

/// Where acorn reports a target that cannot be assigned, which oxc labels from its outermost
/// parentheses at `start`: at the target inside them, or at them around an object or an array.
fn rvalue(start: u32, tokens: impl Iterator<Item = Token>) -> Option<u32> {
    let mut tokens = tokens.skip_while(|token| token.start() < start);
    let first = tokens.next()?;
    let inside = std::iter::once(first)
        .chain(tokens)
        .find(|token| token.kind() != Kind::LParen)?;
    let pattern = matches!(inside.kind(), Kind::LCurly | Kind::LBrack);
    Some(if pattern {
        first.start()
    } else {
        inside.start()
    })
}

/// What acorn reports for an error of the analysis, which oxc labels from `start` to `end` and
/// acorn reports at a node around that or at the second label.
fn early_error(
    error: &OxcDiagnostic,
    number: &str,
    text: &str,
    (start, end): (u32, u32),
    visit: impl FnOnce(&mut Locator),
) -> Option<Acorn> {
    let second = || {
        let label = error.labels.get(1)?;
        let (start, end) = (label.offset(), label.offset() + label.len());
        Some((start, text.get(start as usize..end as usize)?))
    };
    match number {
        "1101" => Some(fails("'with' in strict mode", start)),
        "2660" => Some(fails("'super' keyword outside a method", start)),
        // `super()` where it is not allowed: acorn first asks whether `super` is allowed at all.
        "2337" | "2335" => match locate(start, end, Find::SuperHome, visit) {
            None | Some((_, AstType::Function)) => {
                Some(fails("'super' keyword outside a method", start))
            }
            Some(_) => Some(fails(
                "super() call outside constructor of a subclass",
                start,
            )),
        },
        "17013" => Some(fails(
            "'new.target' can only be used in functions and class static block",
            start,
        )),
        "2524" => Some(fails("Await expression cannot be a default value", start)),
        "2523" => Some(fails("Yield expression cannot be a default value", start)),
        // A second declaration: oxc labels the first one first, and acorn fails at this one.
        "2300" => Some(redeclaration((start, end), second()?, visit)),
        "1114" => {
            let (at, name) = second()?;
            Some(Acorn::Fails {
                message: Cow::Owned(format!("Label '{name}' is already declared")),
                at,
            })
        }
        "2392" => Some(fails(
            "Duplicate constructor in the same class",
            second()?.0,
        )),
        "1117" => Some(fails("Redefinition of __proto__ property", second()?.0)),
        // acorn tells a name declared from a name assigned to.
        "1100" => {
            let name = text.get(start as usize..end as usize)?;
            let mut locator = Locator::new(start, end, Find::Binding);
            visit(&mut locator);
            let message = if locator.found.is_some() && locator.declares {
                format!("Binding {name} in strict mode")
            } else {
                format!("Assigning to {name} in strict mode")
            };
            Some(Acorn::Fails {
                message: Cow::Owned(message),
                at: start,
            })
        }
        // acorn reports a private name no class around declares in one message, inside a class
        // or outside one.
        "1111" | "18016" => Some(Acorn::Fails {
            message: Cow::Owned(format!(
                "Private field '{}' must be declared in an enclosing class",
                text.get(start as usize..end as usize)?
            )),
            at: start,
        }),
        "18037" | "18054" => Some(fails(
            "Cannot use await in class static initialization block",
            start,
        )),
        // acorn-typescript reports an abstract member at its start.
        "1244" | "1253" => Some(fails(
            "Abstract methods can only appear within an abstract class.",
            locate(start, end, Find::Member, visit)?.0,
        )),
        "1047" => optional_rest(start, end, visit)?.err(),
        "1347" => Some(fails(
            "Illegal 'use strict' directive in function with non-simple parameter list",
            locate(start, end, Find::Function, visit)?.0,
        )),
        // A jump to nowhere: acorn fails at its statement.
        "1104" | "1105" | "1107" | "1115" => match locate(start, end, Find::Jump, visit)? {
            (at, AstType::BreakStatement) => Some(fails("Unsyntactic break", at)),
            (at, _) => Some(fails("Unsyntactic continue", at)),
        },
        // A legacy octal: acorn reports a number at its start, and an escape at its backslash or
        // at the digit after it.
        "1121" | "1489" => Some(fails("Invalid number", start)),
        "1487" => Some(fails("Octal literal in strict mode", start)),
        "1488" => Some(fails("Invalid escape sequence", start + 1)),
        "1102" => Some(fails(
            "Deleting local variable in strict mode",
            locate(start, end, Find::Unary, visit)?.0,
        )),
        "18011" => Some(fails(
            "Private fields can not be deleted",
            locate(start, end, Find::Unary, visit)?.0,
        )),
        _ => None,
    }
}
/// Where acorn fails at an optional member whose `?` is at `start`: at the `?`, after the name it
/// reads, or at the name after `accessor`, which acorn reads as the name.
fn optional_member(start: u32, tokens: impl Iterator<Item = Token>) -> u32 {
    let (modifier, name) = tokens
        .take_while(|token| token.start() < start)
        .fold((None, None), |(_, previous), token| (previous, Some(token)));
    let accessor = modifier.is_some_and(|token: Token| token.kind() == Kind::Accessor);
    name.filter(|_| accessor).map_or(start, |name| name.start())
}

/// The token acorn fails at where oxc finds one missing at `start`. In a parenthesized expression
/// acorn reads an optional parameter's `?` as a conditional, so it fails at the token after it.
fn missing<I: Iterator<Item = Token>>(
    error: &OxcDiagnostic,
    (text, start): (&str, u32),
    read: impl Fn() -> I,
) -> Option<u32> {
    let question = read()
        .find(|token| token.start() == start)
        .is_some_and(|token| token.kind() == Kind::Question);
    let conditional = question
        && error.labels.get(1).is_some_and(|open| {
            let before = read().take_while(|token| token.start() < open.offset());
            before
                .last()
                .is_none_or(|token| !token.kind().is_identifier_name())
        });
    if !conditional {
        return read()
            .find(|token| token.start() >= start)
            .map(|token| token.start());
    }
    read()
        .find(|token| token.start() > start)
        .map(|token| token.start())
        .or_else(|| token_after(text, start + 1))
}

/// The start of the first token from `at`, which oxc stopped before reading.
#[cold]
fn token_after(text: &str, at: u32) -> Option<u32> {
    crate::scratch::with_scratch_arena(|allocator| {
        let parser =
            Parser::new(allocator, text, SourceType::mjs()).with_config(TokensParserConfig);
        let tokens = match parser.parse_expression_at(at) {
            Ok(parsed) => parsed.tokens,
            Err(error) => error.tokens,
        };
        tokens.first().map(Token::start)
    })
}

/// What acorn does with a rest element whose `?` is `question..end`: `Ok` where it reads one.
fn optional_rest(
    question: u32,
    end: u32,
    visit: impl FnOnce(&mut Locator),
) -> Option<Result<(), Acorn>> {
    let mut locator = Locator::new(question, end, Find::OptionalRest);
    visit(&mut locator);
    let around = locator.rest;
    let (rest, holder) = around.rest?;
    let unexpected = |at| Err(fails("Unexpected token", at));
    Some(match (holder, around.reading) {
        // acorn reads an object pattern's rest as a name, which ends before the `?`.
        (Holder::Object, _) => unexpected(question),
        (_, Reading::Type) | (Holder::Parameters, Reading::Arrow { is_async: false }) => Ok(()),
        (_, Reading::Arrow { .. }) => unexpected(question),
        (_, Reading::Binding) if around.ambient => Ok(()),
        (_, Reading::Binding) => Err(fails(
            "A binding pattern parameter cannot be optional in an implementation signature.",
            rest.start,
        )),
    })
}

/// acorn names the character it cannot read, which after `#` is the one oxc's label `start..end`
/// ends with.
fn unexpected_character(text: &str, start: u32, end: u32) -> Option<Acorn> {
    let label = text.get(start as usize..end as usize)?;
    // An escape in a name, which oxc labels from its `\`: acorn expects a `u` after it.
    if let Some(escape) = label.strip_prefix('\\') {
        return (!escape.starts_with('u'))
            .then(|| fails("Expecting Unicode escape sequence \\uXXXX", start + 1));
    }
    let at = start + u32::from(label.starts_with('#'));
    let character = text.get(at as usize..)?.chars().next()?;
    Some(Acorn::Fails {
        message: Cow::Owned(format!("Unexpected character '{character}'")),
        at,
    })
}

/// Where acorn fails at modifiers out of order labeled `start..end`: the token after the member's
/// first word after `static`, or the label outside a class member.
fn after_member_name(
    start: u32,
    end: u32,
    tokens: impl Iterator<Item = Token>,
    visit: impl FnOnce(&mut Locator),
) -> Option<u32> {
    let Some((member, _)) = locate(start, end, Find::Member, visit) else {
        return Some(start);
    };
    let mut words = tokens
        .skip_while(|token| token.start() < member)
        .skip_while(|token| token.kind() == Kind::Static);
    words.nth(1).map(|token| token.start())
}

/// What acorn reports for `name` declared again at `at`, which oxc first labels at `first`.
/// acorn-typescript checks a type alias only against the types before it.
fn redeclaration(
    first: (u32, u32),
    (at, name): (u32, &str),
    visit: impl FnOnce(&mut Locator),
) -> Acorn {
    let locator = redeclared(first, (at, at + name.len() as u32), visit);
    let message = match (locator.found, locator.first_is_type) {
        (Some((_, AstType::FormalParameters)), _) => return fails("Argument name clash", at),
        (Some((_, AstType::TSTypeAliasDeclaration)), true) => {
            format!("type '{name}' has already been declared.")
        }
        _ => format!("Identifier '{name}' has already been declared"),
    };
    Acorn::Fails {
        message: Cow::Owned(message),
        at,
    }
}

/// The walk for a name oxc labels at `first` and declares again at `second`.
fn redeclared(first: (u32, u32), second: (u32, u32), visit: impl FnOnce(&mut Locator)) -> Locator {
    let first = oxc_span::Span::new(first.0, first.1);
    let mut locator = Locator::new(second.0, second.1, Find::Redeclared(first));
    visit(&mut locator);
    locator
}

const fn fails(message: &'static str, at: u32) -> Acorn {
    Acorn::Fails {
        message: Cow::Borrowed(message),
        at,
    }
}

mod locator;
mod typescript_eslint;

pub(crate) use typescript_eslint::typescript_eslint_at;
pub use typescript_eslint::{
    TYPESCRIPT_ESLINT_CHECKS, TYPESCRIPT_ESLINT_UNCHECKED, typescript_eslint_error,
};

#[cfg(test)]
mod tests;
