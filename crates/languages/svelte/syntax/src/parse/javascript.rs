use oxc_ast::ast::Expression;
use oxc_span::GetSpan;
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_tree::ExpressionIdentifier;

use super::identifier::{identifier_len, is_reserved};
use super::{ParseResult, Parser, javascript_error};
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
        let (expression, next) = self
            .builder
            .read_expression_before(start_offset, limit, source_type)
            .map_err(javascript_error)?;
        self.javascript_region(start_offset, next);
        Ok(expression)
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
