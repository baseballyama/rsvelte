use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{Part, TokenType};

use super::{ParseResult, Parser};

impl Parser<'_> {
    pub(super) fn sequence(&mut self, quote: Option<u8>) -> ParseResult<()> {
        loop {
            let rest = self.rest();
            let len = quote.map_or_else(
                || unquoted_text_len(rest.as_bytes()),
                |quote| memchr::memchr2(quote, b'{', rest.as_bytes()).unwrap_or(rest.len()),
            );
            if len > 0 {
                let start_offset = self.position;
                self.position += len;
                self.component.parts.push(Part::Text(Span::new(
                    start_offset as u32,
                    self.position as u32,
                )));
                self.token(TokenType::AttributeText, start_offset);
            }
            match self.peek() {
                None => return self.err("unexpected end of input"),
                Some(b'{') => self.attribute_expression()?,
                Some(_) => return Ok(()),
            }
        }
    }

    fn attribute_expression(&mut self) -> ParseResult<()> {
        let after = super::whitespace::trim_ascii_start(&self.rest()[1..]);
        if after.starts_with('#') || after.starts_with('@') {
            return self.err("blocks and tags are not allowed in an attribute value");
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

fn unquoted_text_len(bytes: &[u8]) -> usize {
    bytes
        .iter()
        .enumerate()
        .find_map(|(index, &byte)| {
            (matches!(
                byte,
                b'{' | b' '
                    | b'\t'
                    | b'\n'
                    | b'\r'
                    | 0x0C
                    | b'"'
                    | b'\''
                    | b'='
                    | b'<'
                    | b'>'
                    | b'`'
            ) || (byte == b'/' && bytes.get(index + 1) == Some(&b'>')))
            .then_some(index)
        })
        .unwrap_or(bytes.len())
}
