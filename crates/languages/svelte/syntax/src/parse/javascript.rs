use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_syntax::NodeIdentifier;
use rsvelte_typescript_syntax::parser::{parse_expression, parse_expression_prefix, reserved};

use super::identifier::identifier_len;
use super::{ParseResult, Parser, javascript_error};
use crate::syntax_tree::TokenType;

impl Parser<'_> {
    pub(super) fn close_mustache(&mut self) -> ParseResult<()> {
        self.skip_ws();
        if self.peek() != Some(b'}') {
            return self.err("expected `}`");
        }
        self.eat_token(TokenType::MustacheClose, 1);
        Ok(())
    }

    pub(super) fn expression(&mut self) -> ParseResult<NodeIdentifier> {
        self.skip_ws();
        self.expression_until(self.source_text.len() as u32)
    }

    pub(super) fn expression_until(&mut self, limit: u32) -> ParseResult<NodeIdentifier> {
        let (tokens, comments) = (
            self.component.javascript.tokens.len(),
            self.component.javascript.comments.len(),
        );
        let start_offset = self.position as u32;
        let (expression, next) = parse_expression_prefix(
            &mut self.component.javascript,
            self.source_text,
            self.position as u32,
            limit,
            self.typescript,
        )
        .map_err(javascript_error)?;
        self.javascript_region(start_offset, next, tokens, comments);
        self.position = next as usize;
        self.component.template_expressions.push(expression);
        Ok(expression)
    }

    pub(super) fn identifier(&mut self) -> ParseResult<NodeIdentifier> {
        let start_offset = self.position;
        let len = self.binding_name_len()?;
        if len == 0 {
            return self.err("expected an identifier");
        }
        let span = Span::new(start_offset as u32, (start_offset + len) as u32);
        self.javascript_at(span)
    }

    /// The length of the name here, which upstream `read_identifier` refuses to be a reserved word.
    pub(super) fn binding_name_len(&self) -> ParseResult<usize> {
        let len = identifier_len(self.rest());
        let word = &self.rest()[..len];
        if reserved(word).is_some() {
            return Err(Diagnostic::error(
                "unexpected_reserved_word",
                format!(
                    "'{word}' is a reserved word in JavaScript and cannot be used here\n\
                     https://svelte.dev/e/unexpected_reserved_word"
                ),
                Span::new(self.position as u32, self.position as u32),
            ));
        }
        Ok(len)
    }

    pub(super) fn javascript_at(&mut self, span: Span) -> ParseResult<NodeIdentifier> {
        let (tokens, comments) = (
            self.component.javascript.tokens.len(),
            self.component.javascript.comments.len(),
        );
        let expression = parse_expression(
            &mut self.component.javascript,
            self.source_text,
            span,
            self.typescript,
        )
        .map_err(javascript_error)?;
        self.javascript_region(span.start_offset, span.end_offset, tokens, comments);
        self.position = span.end_offset as usize;
        Ok(expression)
    }
}
