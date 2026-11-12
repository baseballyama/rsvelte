//! oxc's syntax errors as the document's diagnostics, keeping where a parser that knows no
//! TypeScript stops for a host that reports as one does.

use oxc_ast::ast::{TSAsExpression, TSSatisfiesExpression};
use oxc_ast_visit::{Visit, walk};
use oxc_diagnostics::OxcDiagnostic;
use oxc_parser::{Kind, Token};
use oxc_span::GetSpan;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;

/// A syntax error, and where a JavaScript parser stops when the error is TypeScript-only syntax.
#[derive(Clone, Debug)]
pub struct SyntaxError {
    pub diagnostic: Diagnostic,
    /// The token after an assertion's operand or after a modifier.
    pub stop: Option<u32>,
}

impl From<SyntaxError> for Diagnostic {
    fn from(error: SyntaxError) -> Self {
        error.diagnostic
    }
}

/// The first error, at the place oxc labels `shift` bytes later, or at `fallback` when it labels
/// none.
pub fn syntax_error(
    errors: impl IntoIterator<Item = OxcDiagnostic>,
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
            stop: None,
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
        stop: None,
    }
}

/// Where a parser that knows no TypeScript stops before `error`'s syntax, in the part whose
/// tree `visit` walks and whose tokens are `tokens`.
#[cold]
pub(crate) fn javascript_stop(
    error: &OxcDiagnostic,
    tokens: &[Token],
    visit: impl FnOnce(&mut Operand),
) -> Option<u32> {
    if error.code.scope.as_deref() != Some("TS") {
        return None;
    }
    let label = error.labels.first()?;
    let start = label.offset();
    let label = oxc_span::Span::new(start, start + label.len());
    let (after, keyword) = match error.code.number.as_deref()? {
        // `as`, `satisfies`: oxc labels the whole assertion, and the operand's span leaves out
        // its parentheses, so the stop is the keyword after it.
        "8016" => (operand_end(label, visit)?, Some(Kind::As)),
        "8037" => (operand_end(label, visit)?, Some(Kind::Satisfies)),
        // A class member's or a parameter's modifier: oxc labels the modifier.
        "8009" | "8012" => (label.end, None),
        _ => return None,
    };
    tokens
        .iter()
        .filter(|token| token.start() >= after)
        .find(|token| keyword.is_none_or(|keyword| token.kind() == keyword))
        .map(Token::start)
}

fn operand_end(label: oxc_span::Span, visit: impl FnOnce(&mut Operand)) -> Option<u32> {
    let mut operand = Operand { label, end: None };
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
