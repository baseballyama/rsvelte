use oxc_ast::ast::Expression;
use oxc_span::GetSpan;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_tree::{ExpressionIdentifier, SyntaxError, javascript_stop};

use super::identifier::{identifier_len, is_reserved};
use super::{ParseResult, Parser, javascript_error, svelte_error};
use crate::syntax_tree::TokenType;

impl<'a> Parser<'a, '_> {
    pub(super) fn close_mustache(&mut self) -> ParseResult<()> {
        self.skip_ws();
        if self.peek() != Some(b'}') {
            return self.expected_token("}");
        }
        self.eat_token(TokenType::MustacheClose, 1);
        Ok(())
    }

    pub(super) fn expression(&mut self) -> ParseResult<ExpressionIdentifier> {
        let expression = self.read_expression()?;
        Ok(self.builder.keep_expression(expression))
    }

    /// The expression here, for a caller that takes it apart.
    pub(super) fn read_expression(&mut self) -> ParseResult<Expression<'a>> {
        self.skip_ws();
        self.read_expression_before(self.source_text.len() as u32)
    }

    /// The expression here, read as if the component ended at `limit`.
    pub(super) fn read_expression_before(&mut self, limit: u32) -> ParseResult<Expression<'a>> {
        let start_offset = self.position as u32;
        let source_type = self.source_type();
        let range = Span::new(start_offset, limit);
        let (expression, next) =
            match self
                .builder
                .read_expression_before(start_offset, limit, source_type)
            {
                Ok(read) => read,
                Err(error) => {
                    let stop = javascript_stop(self.source_text, &error, range, true, source_type)
                        .ok_or_else(|| javascript_error(error.into()))?;
                    // Acorn's expression ends where it stops, and the template goes on from there.
                    let truncated =
                        (self.builder).read_expression_before(start_offset, stop, source_type);
                    // Inside brackets the operand alone does not parse, and acorn fails at the
                    // stop.
                    let Ok((expression, _)) = truncated else {
                        return Err(unexpected_token(stop));
                    };
                    (expression, stop)
                }
            };
        self.javascript_region(start_offset, next);
        Ok(expression)
    }

    /// Upstream's error for `error` in `range`: Acorn stops at TypeScript-only syntax.
    #[cold]
    pub(super) fn javascript_failure(
        &self,
        error: SyntaxError,
        range: Span,
        expression: bool,
    ) -> Diagnostic {
        let source_type = self.source_type();
        javascript_stop(self.source_text, &error, range, expression, source_type)
            .map_or_else(|| javascript_error(error.into()), unexpected_token)
    }

    pub(super) fn identifier(&mut self) -> ParseResult<ExpressionIdentifier> {
        let start_offset = self.position;
        let len = self.binding_name_len()?;
        if len == 0 {
            return self.err("expected_identifier", "Expected an identifier");
        }
        let span = Span::new(start_offset as u32, (start_offset + len) as u32);
        self.expression_in(span)
    }

    /// The length of the name here, which upstream `read_identifier` refuses to be a reserved word.
    pub(super) fn binding_name_len(&self) -> ParseResult<usize> {
        let len = identifier_len(self.rest());
        let word = &self.rest()[..len];
        if is_reserved(word) {
            return self.err(
                "unexpected_reserved_word",
                format_args!("'{word}' is a reserved word in JavaScript and cannot be used here"),
            );
        }
        Ok(len)
    }

    /// The expression that is all of `span`.
    pub(super) fn expression_in(&mut self, span: Span) -> ParseResult<ExpressionIdentifier> {
        self.position = span.start_offset as usize;
        let expression = self.read_expression_before(span.end_offset)?;
        if expression.span().end != span.end_offset {
            return Self::err_at(span, "parse_error", "expected one expression");
        }
        Ok(self.builder.keep_expression(expression))
    }
}

/// Acorn's error at a token it cannot read.
#[cold]
fn unexpected_token(at: u32) -> Diagnostic {
    svelte_error("js_parse_error", "Unexpected token", Span::new(at, at))
}
