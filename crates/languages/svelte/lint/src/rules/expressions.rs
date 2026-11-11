//! `ESLint`'s `equalTokens`: two expressions are the same when their tokens are, kind and text,
//! whatever the whitespace and comments between.

use rsvelte_kernel::source::positions::Span;
use rsvelte_kernel::source::tokens::TokenKind;
use rsvelte_svelte_syntax::syntax_tree::Component;

/// Whether the component's tokens in `a` and in `b` are the same, kind and text.
pub(super) fn equal_tokens(component: &Component, source: &str, a: Span, b: Span) -> bool {
    let tokens = |span| {
        component
            .tokens
            .within(span)
            .iter()
            .filter(|t| !t.kind.is_trivia())
    };
    tokens(a).count() == tokens(b).count()
        && tokens(a)
            .zip(tokens(b))
            .all(|(a, b)| a.kind == b.kind && a.span.text(source) == b.span.text(source))
}
