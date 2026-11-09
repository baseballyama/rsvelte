use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_kernel::source::positions::Span;
use rsvelte_kernel::source::tokens::Tokens;
use rsvelte_svelte_syntax::syntax_tree::TokenType;

use super::Parser;

impl Parser<'_> {
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

    pub(super) fn javascript_region(
        &mut self,
        start_offset: u32,
        end_offset: u32,
        tokens_from: usize,
        comments_from: usize,
    ) {
        let javascript = &self.component.javascript;
        let tokens = &mut self.component.tokens;
        if comments_from == javascript.comments.len() {
            append_javascript_region(
                tokens,
                start_offset,
                end_offset,
                javascript
                    .tokens
                    .since(tokens_from)
                    .iter()
                    .map(|token| (TokenType::JavaScript(token.kind), token.span)),
            );
        } else {
            append_javascript_region(
                tokens,
                start_offset,
                end_offset,
                javascript
                    .recorded_since(tokens_from, comments_from)
                    .map(|(kind, span)| {
                        (
                            kind.map_or(TokenType::JavaScriptComment, TokenType::JavaScript),
                            span,
                        )
                    }),
            );
        }
    }
}

fn append_javascript_region(
    tokens: &mut Tokens<TokenType>,
    start_offset: u32,
    end_offset: u32,
    recorded: impl Iterator<Item = (TokenType, Span)>,
) {
    let mut at = start_offset;
    for (kind, span) in recorded {
        tokens.push(TokenType::Whitespace, Span::new(at, span.start_offset));
        tokens.push(kind, span);
        at = span.end_offset;
    }
    tokens.push(TokenType::Whitespace, Span::new(at, end_offset));
}
