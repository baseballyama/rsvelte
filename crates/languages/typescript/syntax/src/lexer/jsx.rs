//! The tokens only JSX has, lexed on the parser's request.

use rsvelte_kernel::source::positions::Span;

use super::{LexedToken, Lexer, R, T, is_identifier_continue};

impl Lexer<'_> {
    /// JSX text from the current position up to the next `{` or `<`.
    pub(crate) const fn jsx_text(&mut self) -> LexedToken {
        let start = self.position;
        while self.position < self.end && !matches!(self.source_text[self.position], b'{' | b'<') {
            self.position += 1;
        }
        LexedToken {
            t: T::JsxText,
            span: Span::new(start as u32, self.position as u32),
            newline_before: false,
        }
    }

    /// The identifier `token` extended over the `-` and the identifier characters after it that
    /// a JSX name may have.
    pub(crate) fn jsx_identifier(&mut self, token: LexedToken) -> R<LexedToken> {
        self.position = token.span.end_offset as usize;
        while self.position < self.end && self.source_text[self.position] == b'-' {
            self.position += 1;
            if self.position < self.end && is_identifier_continue(self.source_text[self.position]) {
                self.ident_tail()?;
            }
        }
        Ok(LexedToken {
            span: Span::new(token.span.start_offset, self.position as u32),
            ..token
        })
    }

    /// A JSX attribute's quoted value, which has no escapes and may span lines; `None`, with only
    /// the trivia read, when the value is not quoted.
    pub(crate) fn jsx_string(&mut self, comments: &mut Vec<Span>) -> R<Option<LexedToken>> {
        let newline_before = self.skip_trivia(comments)?;
        let start = self.position;
        let quote = self.peek(0);
        if !matches!(quote, b'"' | b'\'') {
            return Ok(None);
        }
        self.position += 1;
        while self.position < self.end && self.source_text[self.position] != quote {
            self.position += 1;
        }
        if self.position >= self.end {
            return self.err("unterminated string", start);
        }
        self.position += 1;
        Ok(Some(LexedToken {
            t: T::String,
            span: Span::new(start as u32, self.position as u32),
            newline_before,
        }))
    }
}
