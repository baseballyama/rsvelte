use rsvelte_kernel::source::positions::Span;

use super::{P, ParseError, R, push, trim};
use crate::syntax_tree::{Declaration, Rule};

impl P<'_> {
    pub(super) fn body(&mut self) -> R<(Vec<Declaration>, Vec<Rule>)> {
        let mut declarations = Vec::new();
        let mut children = Vec::new();
        loop {
            self.skip_trivia()?;
            match self.peek() {
                Some(b'}') | None => return Ok((declarations, children)),
                Some(b';') => self.position += 1,
                Some(b'@') => push(&mut children, self.at_rule()?),
                Some(_) => {
                    let start = self.position;
                    let nested = self.b[self.value_end()?] == b'{';
                    if nested {
                        push(&mut children, self.style_rule()?);
                    } else {
                        let property_start = self.position;
                        while self
                            .peek()
                            .is_some_and(|c| !c.is_ascii_whitespace() && c != b':')
                        {
                            self.position += 1;
                        }
                        let property = self.span(property_start);
                        self.skip_trivia()?;
                        if self.peek() == Some(b':') {
                            self.position += 1;
                        }
                        let colon_end = self.position;
                        self.skip_trivia()?;
                        let value_start = self.position;
                        let value_end = self.value_end()?;
                        let sheet_end = std::mem::replace(&mut self.end, value_end);
                        let tokens = self.value_tokens(property);
                        self.end = sheet_end;
                        let tokens = tokens?;
                        let value = trim(self.source_text, self.span(value_start));
                        if value.is_empty() && !property.text(self.source_text).starts_with("--") {
                            return Err(ParseError {
                                code: "css_empty_declaration",
                                message: "Declaration cannot be empty".to_owned(),
                                span: Span::new(start as u32, colon_end as u32),
                            });
                        }
                        push(
                            &mut declarations,
                            Declaration {
                                span: Span::new(start as u32, value.end_offset),
                                property,
                                value,
                                tokens,
                            },
                        );
                        // A property scan past the value's end leaves Svelte at a `{`.
                        if !matches!(self.peek(), Some(b';' | b'}')) {
                            return Err(self.expected_token(";"));
                        }
                    }
                }
            }
        }
    }

    /// Where Svelte ends the value that starts here: at the first `;`, `{` or `}` outside a
    /// string and a `url(...)`, whatever brackets come before it.
    fn value_end(&self) -> R<usize> {
        let mut at = self.position;
        let mut quote = None;
        let mut in_url = false;
        // The last bytes of the value as Svelte collects it, which leaves comments out.
        let mut tail = [0u8; 3];
        while at < self.end {
            let c = self.b[at];
            let read = |tail: &mut [u8; 3], c: u8| *tail = [tail[1], tail[2], c];
            match c {
                b'\\' => {
                    read(&mut tail, c);
                    at += 1;
                    if at < self.end {
                        read(&mut tail, self.b[at]);
                    }
                }
                _ if Some(c) == quote => quote = None,
                b')' => in_url = false,
                b'"' | b'\'' if quote.is_none() => quote = Some(c),
                b'(' if &tail == b"url" => in_url = true,
                b';' | b'{' | b'}' if !in_url && quote.is_none() => return Ok(at),
                b'/' if !in_url && quote.is_none() && self.b.get(at + 1) == Some(&b'*') => {
                    let Some(i) = self.source_text[at + 2..self.end].find("*/") else {
                        return Err(ParseError {
                            code: "expected_token",
                            message: "Expected token */".to_owned(),
                            span: Span::new(self.end as u32, self.end as u32),
                        });
                    };
                    at += i + 4;
                    continue;
                }
                _ => {}
            }
            if c != b'\\' {
                read(&mut tail, c);
            }
            at += 1;
        }
        Err(ParseError {
            code: "unexpected_eof",
            message: "Unexpected end of input".to_owned(),
            span: Span::new(self.end as u32, self.end as u32),
        })
    }

    fn value_tokens(&mut self, property: Span) -> R<std::ops::Range<u32>> {
        let first = self.value_tokens.len() as u32;
        let text = property.text(self.source_text);
        let text = text
            .strip_prefix("-webkit-")
            .or_else(|| text.strip_prefix("-moz-"))
            .or_else(|| text.strip_prefix("-o-"))
            .unwrap_or(text);
        let collect =
            text.eq_ignore_ascii_case("animation") || text.eq_ignore_ascii_case("animation-name");
        while let Some(c) = self.peek() {
            match c {
                c if c.is_ascii_whitespace() => self.whitespace(),
                b';' | b'}' => break,
                b'/' if self.b.get(self.position + 1) == Some(&b'*') => self.skip_trivia()?,
                b'\'' | b'"' | b'(' | b'[' => {
                    let start = self.position;
                    self.position += 1;
                    if matches!(c, b'\'' | b'"') {
                        self.position = start;
                        self.string()?;
                    } else {
                        let close = if c == b'(' { b')' } else { b']' };
                        self.skip_balanced_until(&[close])?;
                        self.eat(close);
                    }
                    if collect {
                        self.value_tokens.push(self.span(start));
                    }
                }
                _ if c == b'\\' || self.ident_char(self.position) > 0 => {
                    let start = self.position;
                    self.ident();
                    if self.position == start {
                        self.position += 1;
                    }
                    if self.eat(b'(') {
                        self.skip_balanced_until(b")")?;
                        self.eat(b')');
                    }
                    if collect {
                        self.value_tokens.push(self.span(start));
                    }
                }
                _ => self.position += 1,
            }
        }
        Ok(first..self.value_tokens.len() as u32)
    }
}
