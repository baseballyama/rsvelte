//! oxc's syntax errors as the document's diagnostics, keeping oxc's code for a host that words
//! them as another parser does.

use oxc_allocator::Allocator;
use oxc_ast::ast::{TSAsExpression, TSSatisfiesExpression};
use oxc_ast_visit::{Visit, walk};
use oxc_diagnostics::{OxcCode, OxcDiagnostic};
use oxc_parser::config::TokensParserConfig;
use oxc_parser::{Parser, Token};
use oxc_span::{GetSpan, SourceType};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;

/// A syntax error, with oxc's code when its kind has one.
#[derive(Clone, Debug)]
pub struct SyntaxError {
    pub diagnostic: Diagnostic,
    pub code: Option<OxcCode>,
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
            code: None,
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
        code: error.code.is_some().then(|| error.code.clone()),
    }
}

/// Where a JavaScript parser that knows no TypeScript stops before `error`'s syntax.
///
/// That is the token after the operand of a type assertion, or after a modifier; `None` for any
/// other error. `expression` says whether `range` holds an expression or a program.
#[cold]
#[must_use]
pub fn javascript_stop(
    source_text: &str,
    error: &SyntaxError,
    range: Span,
    expression: bool,
    source_type: SourceType,
) -> Option<u32> {
    let code = error.code.as_ref()?;
    if code.scope.as_deref() != Some("TS") {
        return None;
    }
    let label = error.diagnostic.span;
    let assertion = match code.number.as_deref()? {
        // `as`, `satisfies`
        "8016" | "8037" => true,
        // A class member's or a parameter's modifier.
        "8009" | "8012" => false,
        _ => return None,
    };
    // The tree that holds the operand: the same text read as TypeScript.
    let allocator = Allocator::default();
    let text = &source_text[..range.end_offset as usize];
    let parser = Parser::new(&allocator, text, source_type.with_typescript(true))
        .with_config(TokensParserConfig);
    let mut operand = Operand {
        label: oxc_span::Span::new(label.start_offset, label.end_offset),
        end: None,
    };
    let tokens = if expression {
        let parsed = parser.parse_expression_at(range.start_offset).ok()?;
        operand.visit_expression(&parsed.expression);
        parsed.tokens
    } else {
        let parsed = parser.with_start(range.start_offset).parse();
        operand.visit_program(&parsed.program);
        parsed.tokens
    };
    let after = if assertion {
        operand.end?
    } else {
        label.end_offset
    };
    tokens
        .iter()
        .map(Token::start)
        .find(|&start| start >= after)
}

/// The end of the operand of the type assertion that `label` covers.
struct Operand {
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
