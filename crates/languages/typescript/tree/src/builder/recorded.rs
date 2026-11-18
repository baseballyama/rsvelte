use oxc_ast::ast::Comment;
use oxc_parser::{Kind, Token};
use rsvelte_kernel::source::positions::Span;

/// A token or a comment of the part a [`super::Builder`] read last.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Recorded {
    /// The token's kind; `None` for a comment.
    pub kind: Option<Kind>,
    pub span: Span,
}

/// The tokens and comments of the part a [`super::Builder`] read last, where oxc left them in
/// the arena, `shift` bytes before the document's.
#[derive(Clone, Copy, Debug)]
pub struct Part<'a> {
    pub(super) tokens: &'a [Token],
    pub(super) comments: &'a [Comment],
    pub(super) shift: u32,
}

impl<'a> Part<'a> {
    /// The tokens and comments in document order.
    pub fn iter(self) -> impl Iterator<Item = Recorded> + 'a {
        let shift = self.shift;
        let mut comments = self.comments.iter().peekable();
        let mut tokens = self.tokens.iter().peekable();
        std::iter::from_fn(move || {
            let comment_first = match (tokens.peek(), comments.peek()) {
                (Some(token), Some(comment)) => comment.span.start < token.start(),
                (None, Some(_)) => true,
                (_, None) => false,
            };
            Some(if comment_first {
                let comment = comments.next()?;
                Recorded {
                    kind: None,
                    span: shifted(comment.span.start, comment.span.end, shift),
                }
            } else {
                let token = tokens.next()?;
                Recorded {
                    kind: Some(token.kind()),
                    span: shifted(token.start(), token.end(), shift),
                }
            })
        })
    }

    /// Where the last of them ends.
    #[must_use]
    pub fn end(self) -> Option<u32> {
        let token = self.tokens.last().map(Token::end);
        let comment = self.comments.last().map(|comment| comment.span.end);
        token.max(comment).map(|end| end + self.shift)
    }
}

const fn shifted(start: u32, end: u32, shift: u32) -> Span {
    Span::new(start + shift, end + shift)
}
