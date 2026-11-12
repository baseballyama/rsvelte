use oxc_ast::ast::FormalParameter;
use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_tree::PatternIdentifier;

use super::identifier::match_bracket;
use super::{ParseResult, Parser, javascript_error};

impl<'a> Parser<'a, '_> {
    pub(super) fn pattern(&mut self) -> ParseResult<PatternIdentifier> {
        let pattern = self.read_pattern()?;
        Ok(self.builder.keep_pattern(pattern))
    }

    /// The pattern here and its type annotation, for a caller that takes it apart.
    pub(super) fn read_pattern(&mut self) -> ParseResult<FormalParameter<'a>> {
        let start_offset = self.position;
        let mut len = match self.peek() {
            Some(b'{' | b'[') => {
                let close = if self.peek() == Some(b'{') {
                    b'}'
                } else {
                    b']'
                };
                match match_bracket(
                    self.rest(),
                    self.source_text.as_bytes()[self.position],
                    close,
                ) {
                    Ok(len) => len,
                    Err(why) => return self.unmatched(why),
                }
            }
            _ => self.binding_name_len()?,
        };
        if len == 0 {
            return self.err(
                "expected_pattern",
                "Expected identifier or destructure pattern",
            );
        }
        if self.typescript {
            len += self.type_annotation_len(start_offset + len);
        }
        let span = Span::new(start_offset as u32, (start_offset + len) as u32);
        let source_type = self.source_type();
        let pattern = self
            .builder
            .read_pattern(span, source_type)
            .map_err(javascript_error)?;
        self.javascript_region(span.start_offset, span.end_offset);
        Ok(pattern)
    }

    fn type_annotation_len(&self, at: usize) -> usize {
        let rest = &self.source_text[at..];
        let trimmed = super::whitespace::trim_whitespace_start(rest);
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
        rest[..i].trim_end_matches(is_ecmascript_whitespace).len()
    }
}
