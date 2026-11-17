use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_kernel::source::positions::Span;

use super::Parser;
use crate::syntax_tree::TokenType;

impl Parser<'_, '_> {
    pub(super) fn token(&mut self, kind: TokenType, start_offset: usize) {
        self.component
            .tokens
            .push(kind, Span::new(start_offset as u32, self.position as u32));
    }

    /// Text from `start_offset` to here as words and the whitespace between them, the way
    /// `svelte-eslint-parser` splits `HTMLText`: a rule asks which word starts a line.
    pub(super) fn words(&mut self, kind: TokenType, start_offset: usize) {
        let source_text = self.source_text;
        let text = &source_text[start_offset..self.position];
        let mut at = start_offset;
        let mut blank = None;
        for (i, c) in text.char_indices() {
            let is_blank = is_ecmascript_whitespace(c);
            if blank != Some(is_blank) {
                let start = start_offset + i;
                self.push_word(blank, at, start, kind);
                at = start;
                blank = Some(is_blank);
            }
        }
        self.push_word(blank, at, self.position, kind);
    }

    fn push_word(&mut self, blank: Option<bool>, start: usize, end: usize, kind: TokenType) {
        let kind = if blank == Some(true) {
            TokenType::Whitespace
        } else {
            kind
        };
        self.component
            .tokens
            .push(kind, Span::new(start as u32, end as u32));
    }

    pub(super) fn eat_token(&mut self, kind: TokenType, n: usize) {
        let start_offset = self.position;
        self.position += n;
        self.token(kind, start_offset);
    }

    pub(super) fn eat_word(&mut self, kind: TokenType, word: &str) -> bool {
        if !self.rest().starts_with(word) {
            return false;
        }
        self.eat_token(kind, word.len());
        true
    }

    /// The tokens and comments the builder recorded for the part from `start_offset` to
    /// `end_offset`, and the whitespace between them; the parser goes on after the last of them.
    /// A comment after the part (`{a /* c */}`) is one of them.
    pub(super) fn javascript_region(&mut self, start_offset: u32, end_offset: u32) {
        let recorded = self.builder.recorded();
        let end_offset = recorded.end().map_or(end_offset, |end| end.max(end_offset));
        let mut at = start_offset;
        for r in recorded.iter() {
            let tokens = &mut self.component.tokens;
            tokens.push(TokenType::Whitespace, Span::new(at, r.span.start_offset));
            let kind = (r.kind).map_or(TokenType::JavaScriptComment, TokenType::JavaScript);
            tokens.push(kind, r.span);
            at = r.span.end_offset;
        }
        (self.component.tokens).push(TokenType::Whitespace, Span::new(at, end_offset));
        self.position = end_offset as usize;
    }
}
