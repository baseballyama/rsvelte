use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_kernel::source::positions::Span;

use super::{ParseResult, Parser};
use crate::syntax_tree::{Part, TokenType};

impl Parser<'_, '_> {
    pub(super) fn sequence(&mut self, quote: Option<u8>) -> ParseResult<()> {
        loop {
            let rest = self.rest();
            let len = quote.map_or_else(
                || unquoted_text_len(rest),
                |quote| memchr::memchr2(quote, b'{', rest.as_bytes()).unwrap_or(rest.len()),
            );
            if len > 0 {
                let start_offset = self.position;
                self.position += len;
                self.component.parts.push(Part::Text(Span::new(
                    start_offset as u32,
                    self.position as u32,
                )));
                self.words(TokenType::AttributeText, start_offset);
            }
            match self.peek() {
                None => return self.unexpected_eof(),
                Some(b'{') => self.attribute_expression()?,
                Some(_) => return Ok(()),
            }
        }
    }

    fn attribute_expression(&mut self) -> ParseResult<()> {
        let after = super::whitespace::trim_whitespace_start(&self.rest()[1..]);
        if after.starts_with('#') || after.starts_with('@') {
            return self.err(
                "parse_error",
                "blocks and tags are not allowed in an attribute value",
            );
        }
        let start_offset = self.position;
        self.eat_token(TokenType::MustacheOpen, 1);
        let expression = self.expression()?;
        self.close_mustache()?;
        self.component.parts.push(Part::Expression {
            expression,
            span: Span::new(start_offset as u32, self.position as u32),
        });
        Ok(())
    }
}

/// Up to upstream's `regex_invalid_unquoted_attribute_value`, ``/(\/>|[\s"'=<>`])/``, or a `{`.
fn unquoted_text_len(text: &str) -> usize {
    text.char_indices()
        .find(|&(index, c)| {
            is_ecmascript_whitespace(c)
                || matches!(c, '{' | '"' | '\'' | '=' | '<' | '>' | '`')
                || (c == '/' && text[index + 1..].starts_with('>'))
        })
        .map_or(text.len(), |(index, _)| index)
}
