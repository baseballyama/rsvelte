//! oxc's syntax errors as the document's diagnostics, keeping what acorn reports for each, for a
//! host that reports as acorn does.

use std::borrow::Cow;

use oxc_ast::ast::{TSAsExpression, TSSatisfiesExpression};
use oxc_ast_visit::{Visit, walk};
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
    visit: impl FnOnce(&mut Operand),
) -> Option<Acorn> {
    if error.code.scope.as_deref() != Some("TS") {
        return None;
    }
    let label = error.labels.first()?;
    let (start, end) = (label.offset(), label.offset() + label.len());
    let fails = |message: &'static str, at: u32| {
        Some(Acorn::Fails {
            message: Cow::Borrowed(message),
            at,
        })
    };
    let token = |after: u32, kind: Option<Kind>| {
        tokens
            .iter()
            .filter(|token| token.start() >= after)
            .find(|token| kind.is_none_or(|kind| token.kind() == kind))
            .map(Token::start)
    };
    match error.code.number.as_deref()? {
        // `as`, `satisfies`: oxc labels the whole assertion, and the operand's span leaves out
        // its parentheses, so acorn stops at the keyword after it.
        "8016" => token(operand_end(start, end, visit)?, Some(Kind::As)).map(Acorn::Stops),
        "8037" => token(operand_end(start, end, visit)?, Some(Kind::Satisfies)).map(Acorn::Stops),
        // An optional member: acorn reads the name and fails at the `?` oxc labels.
        "8009" if text.get(start as usize..end as usize) == Some("?") => {
            fails("Unexpected token", start)
        }
        // A modifier: acorn reads it as the member's name and fails at the token after it.
        "8009" | "8012" => fails("Unexpected token", token(end, None)?),
        // A second modifier: acorn reads the first as the name and fails at this one.
        "1029" => fails("Unexpected token", start),
        // `()`: oxc labels both parentheses, and acorn fails at the closing one.
        "1109" => fails("Unexpected token", end.checked_sub(1)?),
        // oxc labels the slash, and acorn reports the body after it.
        "1161" => fails("Unterminated regular expression", start + 1),
        // oxc labels where the semicolon is missing, and acorn fails at the next token.
        "1005" => fails("Unexpected token", token(start, None)?),
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
        "1101" => fails("'with' in strict mode", start),
        "2660" => fails("'super' keyword outside a method", start),
        "2524" => fails("Await expression cannot be a default value", start),
        "2523" => fails("Yield expression cannot be a default value", start),
        _ => None,
    }
}

/// The end of the operand of the type assertion oxc labels from `start` to `end`.
fn operand_end(start: u32, end: u32, visit: impl FnOnce(&mut Operand)) -> Option<u32> {
    let mut operand = Operand {
        label: oxc_span::Span::new(start, end),
        end: None,
    };
    visit(&mut operand);
    operand.end
}

/// The end of the operand of the type assertion that `label` covers.
pub(crate) struct Operand {
    label: oxc_span::Span,
    end: Option<u32>,
}

impl<'a> Visit<'a> for Operand {
    fn visit_ts_as_expression(&mut self, it: &TSAsExpression<'a>) {
        if it.span == self.label {
            self.end = Some(it.expression.span().end);
        }
        walk::walk_ts_as_expression(self, it);
    }

    fn visit_ts_satisfies_expression(&mut self, it: &TSSatisfiesExpression<'a>) {
        if it.span == self.label {
            self.end = Some(it.expression.span().end);
        }
        walk::walk_ts_satisfies_expression(self, it);
    }
}
