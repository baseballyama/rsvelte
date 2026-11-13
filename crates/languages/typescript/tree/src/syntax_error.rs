//! oxc's syntax errors as the document's diagnostics, keeping what acorn reports for each, for a
//! host that reports as acorn does.

use std::borrow::Cow;

use oxc_ast::{AstKind, AstType};
use oxc_ast_visit::Visit;
use oxc_diagnostics::OxcDiagnostic;
use oxc_parser::{Kind, Token};
use oxc_span::GetSpan;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;

/// A syntax error, and what acorn reports for it when oxc's code says.
#[derive(Clone, Debug)]
pub struct SyntaxError {
    pub diagnostic: Diagnostic,
    pub acorn: Option<Acorn>,
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
/// none. `text` is what oxc read, which the labels index.
pub fn syntax_error(
    errors: impl IntoIterator<Item = OxcDiagnostic>,
    text: &str,
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
        acorn: acorn(&error, text, &[], |_| {}).map(|acorn| acorn.shifted(shift)),
    }
}

/// [`syntax_error`] for an error of the analysis of a whole document, whose nodes `visit` hands
/// to [`Locator::enter`] in the order they were walked.
pub fn analysis_error(
    error: &OxcDiagnostic,
    text: &str,
    visit: impl FnOnce(&mut Locator),
) -> SyntaxError {
    let mut syntax_error = syntax_error([error.clone()], text, 0, 0);
    syntax_error.acorn = acorn(error, text, &[], visit);
    syntax_error
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

/// What acorn reports for `error`, in the part whose text is `text`, whose tokens are `tokens` and
/// whose tree `visit` walks; `None` for an error whose code does not say.
#[cold]
pub(crate) fn acorn(
    error: &OxcDiagnostic,
    text: &str,
    tokens: &[Token],
    visit: impl FnOnce(&mut Locator),
) -> Option<Acorn> {
    if error.code.scope.as_deref() != Some("TS") {
        return None;
    }
    let label = error.labels.first()?;
    let (start, end) = (label.offset(), label.offset() + label.len());
    let token = |after: u32, kind: Option<Kind>| {
        tokens
            .iter()
            .filter(|token| token.start() >= after)
            .find(|token| kind.is_none_or(|kind| token.kind() == kind))
            .map(Token::start)
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
        // An optional member: acorn reads the name and fails at the `?` oxc labels.
        "8009" if text.get(start as usize..end as usize) == Some("?") => {
            Some(fails("Unexpected token", start))
        }
        // A modifier: acorn reads it as the member's name and fails at the token after it.
        "8009" | "8012" => Some(fails("Unexpected token", token(end, None)?)),
        // A second modifier: acorn reads the first as the name and fails at this one.
        "1029" => Some(fails("Unexpected token", start)),
        // `()`: oxc labels both parentheses, and acorn fails at the closing one.
        "1109" => Some(fails("Unexpected token", end.checked_sub(1)?)),
        // oxc labels the slash, and acorn reports the body after it.
        "1161" => Some(fails("Unterminated regular expression", start + 1)),
        // oxc labels where the semicolon is missing, and acorn fails at the next token.
        "1005" => Some(fails("Unexpected token", token(start, None)?)),
        "1212" => Some(Acorn::Fails {
            message: Cow::Owned(error.message.to_string()),
            at: start,
        }),
        "1100" => Some(Acorn::Fails {
            message: Cow::Owned(format!(
                "Assigning to {} in strict mode",
                text.get(start as usize..end as usize)?
            )),
            at: start,
        }),
        "1101" => Some(fails("'with' in strict mode", start)),
        "2660" => Some(fails("'super' keyword outside a method", start)),
        // The lexer's errors: acorn reads a template's body and a regular expression's from the
        // byte after the opening, and a shorthand's initializer from its `=`.
        "1002" => Some(fails("Unterminated string constant", start)),
        "1160" => Some(fails("Unterminated template", start + 1)),
        "1010" => Some(fails("Unterminated comment", start)),
        "1499" => Some(fails(
            "Invalid regular expression flag",
            tokens
                .iter()
                .rev()
                .find(|token| token.start() <= start)?
                .start()
                + 1,
        )),
        "1312" => Some(fails(
            "Shorthand property assignments are valid only in destructuring patterns",
            token(start, Some(Kind::Eq))?,
        )),
        "17013" => Some(fails(
            "'new.target' can only be used in functions and class static block",
            start,
        )),
        "2524" => Some(fails("Await expression cannot be a default value", start)),
        "2523" => Some(fails("Yield expression cannot be a default value", start)),
        _ => early_error(error, number, text, (start, end), visit),
    }
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
        // A second declaration: oxc labels the first one first, and acorn fails at this one.
        "2300" => {
            let (at, name) = second()?;
            Some(Acorn::Fails {
                message: Cow::Owned(format!("Identifier '{name}' has already been declared")),
                at,
            })
        }
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
        // acorn-typescript reports an abstract member, and a binding pattern made optional, at
        // its start.
        "1244" | "1253" => Some(fails(
            "Abstract methods can only appear within an abstract class.",
            locate(start, end, Find::Member, visit)?.0,
        )),
        "1047" => Some(fails(
            "A binding pattern parameter cannot be optional in an implementation signature.",
            locate(start, end, Find::Rest, visit)?.0,
        )),
        "1347" => Some(fails(
            "Illegal 'use strict' directive in function with non-simple parameter list",
            locate(start, end, Find::Function, visit)?.0,
        )),
        // A jump to nowhere: acorn fails at its statement.
        "1104" | "1105" | "1107" | "1115" => match locate(start, end, Find::Jump, visit)? {
            (at, AstType::BreakStatement) => Some(fails("Unsyntactic break", at)),
            (at, _) => Some(fails("Unsyntactic continue", at)),
        },
        _ => None,
    }
}

const fn fails(message: &'static str, at: u32) -> Acorn {
    Acorn::Fails {
        message: Cow::Borrowed(message),
        at,
    }
}

/// What acorn reports about a node around oxc's label, found as the tree is walked.
#[derive(Debug)]
pub struct Locator {
    label: oxc_span::Span,
    find: Find,
    found: Option<(u32, AstType)>,
}

#[derive(Clone, Copy, Debug)]
enum Find {
    /// The end of the operand of the type assertion that is the label.
    OperandEnd,
    /// The start of the innermost function around the label.
    Function,
    /// The start of the class member around the label.
    Member,
    /// The start of the rest parameter around the label.
    Rest,
    /// The `break` or `continue` statement around the label.
    Jump,
}

impl Locator {
    /// Takes in a node of the walk, outer nodes before inner ones.
    pub fn enter(&mut self, kind: AstKind<'_>) {
        let around = kind.span().contains_inclusive(self.label);
        let found = match (self.find, kind) {
            (Find::OperandEnd, AstKind::TSAsExpression(it)) if it.span == self.label => {
                it.expression.span().end
            }
            (Find::OperandEnd, AstKind::TSSatisfiesExpression(it)) if it.span == self.label => {
                it.expression.span().end
            }
            (Find::Function, AstKind::Function(_) | AstKind::ArrowFunctionExpression(_))
            | (
                Find::Member,
                AstKind::MethodDefinition(_)
                | AstKind::PropertyDefinition(_)
                | AstKind::AccessorProperty(_),
            )
            | (Find::Rest, AstKind::FormalParameterRest(_))
            | (Find::Jump, AstKind::BreakStatement(_) | AstKind::ContinueStatement(_))
                if around =>
            {
                kind.span().start
            }
            _ => return,
        };
        self.found = Some((found, kind.ty()));
    }
}

impl<'a> Visit<'a> for Locator {
    fn enter_node(&mut self, kind: AstKind<'a>) {
        self.enter(kind);
    }
}

/// What `find` finds around `start..end` in the tree `visit` walks.
fn locate(
    start: u32,
    end: u32,
    find: Find,
    visit: impl FnOnce(&mut Locator),
) -> Option<(u32, AstType)> {
    let mut locator = Locator {
        label: oxc_span::Span::new(start, end),
        find,
        found: None,
    };
    visit(&mut locator);
    locator.found
}
