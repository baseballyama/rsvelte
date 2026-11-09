//! The component's code tokens, and where they sit in lines.

use rsvelte_kernel::source::positions::{LineIndex, Span};
use rsvelte_svelte::syntax::syntax_tree::{Component, TokenType};
use rsvelte_typescript::lexer::T;

/// The index of a token in [`Tokens`].
pub(super) type Token = u32;

/// The component's tokens without whitespace: words, punctuation, comments.
pub(super) struct Tokens<'a> {
    pub source: &'a str,
    pub lines: &'a LineIndex,
    spans: Vec<Span>,
    kinds: Vec<TokenType>,
}

impl<'a> Tokens<'a> {
    pub(super) fn new(component: &Component, source: &'a str, lines: &'a LineIndex) -> Self {
        let (spans, kinds) = component
            .tokens
            .iter()
            .filter(|t| t.kind != TokenType::Whitespace)
            .map(|t| (t.span, t.kind))
            .unzip();
        Self {
            source,
            lines,
            spans,
            kinds,
        }
    }

    pub(super) const fn len(&self) -> usize {
        self.spans.len()
    }

    pub(super) const fn count(&self) -> Token {
        self.spans.len() as Token
    }

    pub(super) fn span(&self, t: Token) -> Span {
        self.spans[t as usize]
    }

    pub(super) fn kind(&self, t: Token) -> TokenType {
        self.kinds[t as usize]
    }

    pub(super) fn text(&self, t: Token) -> &'a str {
        self.span(t).text(self.source)
    }

    pub(super) fn is_comment(&self, t: Token) -> bool {
        self.kind(t) == TokenType::JavaScriptComment
    }

    pub(super) fn is(&self, t: Token, kind: T) -> bool {
        self.kind(t) == TokenType::JavaScript(kind)
    }

    /// Punctuation as `ESLint` sees it: JavaScript punctuators and the markup's brackets.
    pub(super) fn is_punctuator(&self, t: Token) -> bool {
        match self.kind(t) {
            TokenType::JavaScript(kind) => !matches!(
                kind,
                T::Identifier
                    | T::PrivateName
                    | T::Number
                    | T::String
                    | T::Template { .. }
                    | T::Regex
                    | T::BigInt
            ),
            TokenType::TagOpen
            | TokenType::EndTagOpen
            | TokenType::TagEnd
            | TokenType::SelfClose
            | TokenType::Eq
            | TokenType::Quote
            | TokenType::MustacheOpen
            | TokenType::MustacheClose => true,
            _ => false,
        }
    }

    pub(super) fn line(&self, offset: u32) -> u32 {
        self.lines.line(offset)
    }

    pub(super) fn column(&self, offset: u32) -> u32 {
        self.lines.line_column(offset).column
    }

    /// The first token starting at or after `offset`, comments included.
    fn index_at(&self, offset: u32) -> usize {
        self.spans.partition_point(|s| s.start_offset < offset)
    }

    fn code_from(&self, mut i: usize) -> Option<Token> {
        while i < self.len() {
            if !self.is_comment(i as Token) {
                return Some(i as Token);
            }
            i += 1;
        }
        None
    }

    fn code_before(&self, mut i: usize) -> Option<Token> {
        while i > 0 {
            i -= 1;
            if !self.is_comment(i as Token) {
                return Some(i as Token);
            }
        }
        None
    }

    /// `getFirstToken`: the first token inside `span`, comments skipped.
    pub(super) fn first(&self, span: Span) -> Option<Token> {
        self.code_from(self.index_at(span.start_offset))
            .filter(|&t| self.span(t).end_offset <= span.end_offset)
    }

    /// `getLastToken`.
    pub(super) fn last(&self, span: Span) -> Option<Token> {
        let end = self
            .spans
            .partition_point(|s| s.end_offset <= span.end_offset);
        self.code_before(end)
            .filter(|&t| self.span(t).start_offset >= span.start_offset)
    }

    /// `getLastToken` with a filter.
    pub(super) fn last_matching(&self, span: Span, f: impl Fn(Token) -> bool) -> Option<Token> {
        let end = self
            .spans
            .partition_point(|s| s.end_offset <= span.end_offset);
        (0..end as Token)
            .rev()
            .take_while(|&t| self.span(t).start_offset >= span.start_offset)
            .find(|&t| !self.is_comment(t) && f(t))
    }

    /// `getTokenBefore` of a position.
    pub(super) fn before_offset(&self, offset: u32) -> Option<Token> {
        self.code_before(self.spans.partition_point(|s| s.end_offset <= offset))
    }

    /// `getTokenAfter` of a position.
    pub(super) fn after_offset(&self, offset: u32) -> Option<Token> {
        self.code_from(self.index_at(offset))
    }

    pub(super) fn before(&self, t: Token) -> Option<Token> {
        self.code_before(t as usize)
    }

    pub(super) fn after(&self, t: Token) -> Option<Token> {
        self.code_from(t as usize + 1)
    }

    /// `getTokenBefore` with a filter.
    pub(super) fn before_matching(&self, offset: u32, f: impl Fn(Token) -> bool) -> Option<Token> {
        let end = self.spans.partition_point(|s| s.end_offset <= offset);
        (0..end as Token)
            .rev()
            .find(|&t| !self.is_comment(t) && f(t))
    }

    /// `getTokenAfter` with a filter.
    pub(super) fn after_matching(&self, offset: u32, f: impl Fn(Token) -> bool) -> Option<Token> {
        (self.index_at(offset) as Token..self.len() as Token).find(|&t| !self.is_comment(t) && f(t))
    }

    /// `getTokensBetween`, comments skipped.
    pub(super) fn between(&self, a: Token, b: Token) -> impl Iterator<Item = Token> + '_ {
        (a + 1..b).filter(|&t| !self.is_comment(t))
    }

    /// `getTokens` of a span, comments skipped.
    pub(super) fn within(&self, span: Span) -> impl Iterator<Item = Token> + '_ {
        (self.index_at(span.start_offset) as Token..self.len() as Token)
            .take_while(move |&t| self.span(t).end_offset <= span.end_offset)
            .filter(|&t| !self.is_comment(t))
    }

    /// `getFirstAndLastTokens`: the outermost parentheses around `span` that start at or after
    /// `border`.
    pub(super) fn outer(&self, span: Span, border: u32) -> Option<(Token, Token)> {
        let (mut first, mut last) = (self.first(span)?, self.last(span)?);
        while let (Some(left), Some(right)) = (self.before(first), self.after(last)) {
            if !(self.is(left, T::LParen)
                && self.is(right, T::RParen)
                && border <= self.span(left).start_offset)
            {
                break;
            }
            (first, last) = (left, right);
        }
        Some((first, last))
    }

    /// `isBeginningOfLine`: no code token before `span` on its line.
    pub(super) fn begins_line(&self, offset: u32) -> bool {
        self.before_offset(offset)
            .is_none_or(|prev| self.line(self.span(prev).end_offset) < self.line(offset))
    }
}
