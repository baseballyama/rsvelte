use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript::NodeIdentifier;
use rsvelte_typescript::parser::parse_parameters;

use super::identifier::{identifier_len, match_bracket};
use super::{ParseResult, Parser, javascript_error};

impl Parser<'_> {
    pub(super) fn pattern(&mut self) -> ParseResult<NodeIdentifier> {
        let start_offset = self.position;
        let mut len = match self.peek() {
            Some(b'{' | b'[') => {
                let close = if self.peek() == Some(b'{') {
                    b'}'
                } else {
                    b']'
                };
                match_bracket(
                    self.rest(),
                    self.source_text.as_bytes()[self.position],
                    close,
                )
                .ok_or_else(|| {
                    Diagnostic::error(
                        "parse_error",
                        "unterminated pattern",
                        Span::new(start_offset as u32, start_offset as u32),
                    )
                })?
            }
            _ => identifier_len(self.rest()),
        };
        if len == 0 {
            return self.err("expected an identifier or a destructuring pattern");
        }
        if self.typescript {
            len += self.type_annotation_len(start_offset + len);
        }
        let span = Span::new(start_offset as u32, (start_offset + len) as u32);
        let (tokens, comments) = (
            self.component.javascript.tokens.len(),
            self.component.javascript.comments.len(),
        );
        let parameters = parse_parameters(
            &mut self.component.javascript,
            self.source_text,
            span,
            self.typescript,
        )
        .map_err(javascript_error)?;
        let [pattern] = parameters[..] else {
            return Self::err_at(span, "expected one pattern");
        };
        self.javascript_region(span.start_offset, span.end_offset, tokens, comments);
        self.position = span.end_offset as usize;
        Ok(pattern)
    }

    fn type_annotation_len(&self, at: usize) -> usize {
        let rest = &self.source_text[at..];
        let trimmed = super::whitespace::trim_ascii_start(rest);
        if !trimmed.starts_with(':') {
            return 0;
        }
        let bytes = rest.as_bytes();
        let mut depth = 0i32;
        let mut i = rest.len() - trimmed.len() + 1;
        while i < bytes.len() {
            match bytes[i] {
                b'(' | b'[' | b'{' | b'<' => depth += 1,
                b')' | b']' | b'}' | b'>' if depth > 0 => depth -= 1,
                b'=' if depth > 0 || bytes.get(i + 1) == Some(&b'>') => {
                    i += 1;
                }
                b',' | b')' | b'}' | b'=' if depth == 0 => break,
                _ => {}
            }
            i += 1;
        }
        rest[..i]
            .trim_end_matches(|c: char| c.is_ascii_whitespace())
            .len()
    }
}
