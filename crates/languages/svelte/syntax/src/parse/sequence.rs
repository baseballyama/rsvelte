use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_kernel::source::positions::Span;

use super::{ParseResult, Parser};
use crate::syntax_tree::{Part, TokenType};

#[cfg(test)]
mod tests;

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
        self.block_or_tag_in_sequence("in attribute value")?;
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

    /// Upstream `read_sequence`'s errors for a block or a tag right after a `{` where only an
    /// expression may go, at the `{`.
    pub(super) fn block_or_tag_in_sequence(&self, location: &str) -> ParseResult<()> {
        let after = &self.rest()[1..];
        let (kind, code) = match after.as_bytes().first() {
            Some(b'#') => ("block", "block_invalid_placement"),
            Some(b'@') => ("tag", "tag_invalid_placement"),
            _ => return Ok(()),
        };
        let name_len = after[1..]
            .bytes()
            .take_while(u8::is_ascii_lowercase)
            .count();
        let (sigil, name) = (&after[..1], &after[1..=name_len]);
        let at = self.position as u32;
        Self::err_at(
            Span::new(at, at),
            code,
            format!("{{{sigil}{name} ...}} {kind} cannot be {location}"),
        )
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
