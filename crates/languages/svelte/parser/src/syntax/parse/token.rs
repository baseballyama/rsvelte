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
