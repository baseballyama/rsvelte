//! The tokens of a component and the indentation each one expects, as offsets from a base token.
//!
//! Every construct describes itself with the same few statements ([`Layout::offset`],
//! [`Layout::list`], [`Layout::start`], [`Layout::ignore`]); a line is then checked against the
//! offset of its first token that has one.

use rsvelte_kernel::source::positions::{LineIndex, Span};
use rsvelte_lint_runner::finding::Fix;
use rsvelte_lint_runner::rule::{Report, Reporter};
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

    const fn len(&self) -> usize {
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
        self.lines.line_column(offset).line
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

#[derive(Clone, Copy, Debug)]
enum Rule {
    Normal { base: Token, offset: u32 },
    Align { base: Token, indent: u32 },
    Start { offset: u32 },
}

#[derive(Clone, Copy, Debug)]
struct Entry {
    rule: Rule,
    expected: Option<u32>,
}

/// What a node or token stands for in [`Layout::list`].
#[derive(Clone, Copy, Debug)]
pub(super) enum Item {
    Node(Span),
    Token(Token),
}

pub(super) struct Layout<'a> {
    pub tokens: Tokens<'a>,
    entries: Vec<Option<Entry>>,
    ignored: Vec<Span>,
    pub options: Options,
}

#[derive(Clone, Copy, Debug)]
pub(super) struct Options {
    pub character: char,
    pub size: u32,
    pub indent_script: bool,
    pub switch_case: u32,
    pub align_attributes_vertically: bool,
}

impl<'a> Layout<'a> {
    pub(super) fn new(tokens: Tokens<'a>, options: Options) -> Self {
        Self {
            entries: vec![None; tokens.len()],
            tokens,
            ignored: Vec::new(),
            options,
        }
    }

    /// `setOffsetToken`.
    pub(super) fn offset(&mut self, token: Option<Token>, offset: u32, base: Option<Token>) {
        if let (Some(token), Some(base)) = (token, base)
            && token != base
        {
            self.set(token, Rule::Normal { base, offset });
        }
    }

    pub(super) fn offset_all(
        &mut self,
        tokens: impl IntoIterator<Item = Token>,
        offset: u32,
        base: Option<Token>,
    ) {
        for token in tokens {
            self.offset(Some(token), offset, base);
        }
    }

    fn set(&mut self, token: Token, rule: Rule) {
        self.entries[token as usize] = Some(Entry {
            rule,
            expected: None,
        });
    }

    /// `setStartOffsetToken`.
    pub(super) fn start(&mut self, token: Option<Token>, offset: u32) {
        if let Some(token) = token {
            self.set(token, Rule::Start { offset });
        }
    }

    pub(super) fn ignore(&mut self, span: Span) {
        self.ignored.push(span);
    }

    fn first_of(&self, item: Item) -> Option<Token> {
        match item {
            Item::Node(span) => self.tokens.first(span),
            Item::Token(t) => Some(t),
        }
    }

    fn last_of(&self, item: Item) -> Option<Token> {
        match item {
            Item::Node(span) => self.tokens.last(span),
            Item::Token(t) => Some(t),
        }
    }

    /// `setOffsetElementList`: each element, and the tokens before it, `offset` from `base`'s
    /// first token; `last`'s first token at the base.
    pub(super) fn list(
        &mut self,
        elements: &[Option<Item>],
        base: Item,
        last: Option<Item>,
        offset: u32,
        align: bool,
    ) {
        let (Some(base_token), Some(mut prev)) = (self.first_of(base), self.last_of(base)) else {
            return;
        };
        let tokens = &self.tokens;
        let mut aligned = None;
        if align && let Some(first) = elements.iter().flatten().next() {
            let start = match *first {
                Item::Node(span) => span.start_offset,
                Item::Token(t) => tokens.span(t).start_offset,
            };
            if !tokens.begins_line(start) {
                let line = tokens.line(start);
                let line_start = tokens.lines.offset(line, 0).expect("an existing line");
                let leading = tokens.source[line_start as usize..]
                    .chars()
                    .take_while(|c| c.is_whitespace())
                    .map(char::len_utf16)
                    .sum::<usize>() as u32;
                aligned = Some(tokens.column(start) - leading);
            }
        }
        let put = |layout: &mut Self, token: Token| {
            if token == base_token {
                return;
            }
            let rule = aligned.map_or(
                Rule::Normal {
                    base: base_token,
                    offset,
                },
                |indent| Rule::Align {
                    base: base_token,
                    indent,
                },
            );
            layout.set(token, rule);
        };
        for element in elements.iter().flatten() {
            let first = match *element {
                Item::Node(span) => self.tokens.outer(span, self.tokens.span(prev).end_offset),
                Item::Token(t) => Some((t, t)),
            };
            let Some((first, last)) = first else {
                continue;
            };
            let first_start = self.tokens.span(first).start_offset;
            let mut t = prev + 1;
            while (t as usize) < self.entries.len() && self.tokens.span(t).end_offset <= first_start
            {
                put(self, t);
                t += 1;
            }
            put(self, first);
            prev = last;
        }
        if let Some(last) = last.and_then(|item| self.first_of(item)) {
            let last_start = self.tokens.span(last).start_offset;
            let mut t = prev + 1;
            while (t as usize) < self.entries.len() && self.tokens.span(t).end_offset <= last_start
            {
                put(self, t);
                t += 1;
            }
            self.offset(Some(last), 0, Some(base_token));
        }
    }

    fn expected(&self, token: Token) -> Option<u32> {
        let entry = self.entries[token as usize]?;
        if let Some(expected) = entry.expected {
            return Some(expected);
        }
        match entry.rule {
            Rule::Start { offset } => Some(offset * self.options.size),
            Rule::Normal { base, offset } => {
                Some(self.expected(base)? + offset * self.options.size)
            }
            Rule::Align { base, indent } => Some(self.expected(base)? + indent),
        }
    }

    fn save(&mut self, line: &[Token], expected: u32) {
        for &t in line {
            if let Some(entry) = &mut self.entries[t as usize] {
                entry.expected.get_or_insert(expected);
            }
        }
    }

    /// Checks every line against the expected indentation of its tokens.
    pub(super) fn check(mut self, reporter: &mut Reporter<'_>) {
        let ignored = self.ignored_tokens();
        let tokens = &self.tokens;
        let count = tokens.len() as Token;
        let mut lines: Vec<(Vec<Token>, Vec<Token>)> = Vec::new();
        let mut comments: Vec<Token> = Vec::new();
        let mut buffer: Vec<Token> = Vec::new();
        let mut current = 0;
        for t in 0..count {
            let line = tokens.line(tokens.span(t).start_offset);
            if line == current || buffer.is_empty() {
                buffer.push(t);
            } else {
                if buffer.iter().all(|&b| tokens.is_comment(b)) {
                    comments.push(buffer[0]);
                } else {
                    lines.push((std::mem::take(&mut comments), std::mem::take(&mut buffer)));
                }
                buffer = vec![t];
            }
            current = line;
        }
        if !buffer.is_empty() && !buffer.iter().all(|&b| tokens.is_comment(b)) {
            lines.push((comments, buffer));
        }
        let mut prev: Option<Token> = None;
        for (comments, line) in lines {
            self.line(&comments, &line, prev, &ignored, reporter);
            prev = line.last().copied();
        }
    }

    fn line(
        &mut self,
        comments: &[Token],
        line: &[Token],
        prev: Option<Token>,
        ignored: &[bool],
        reporter: &mut Reporter<'_>,
    ) {
        let first = line[0];
        let actual = self.tokens.column(self.tokens.span(first).start_offset);
        let mut expected = None;
        for &t in line {
            if ignored[t as usize] {
                break;
            }
            if let Some(e) = self.expected(t) {
                expected = Some(e);
                break;
            }
        }
        let Some(expected) = expected else {
            self.save(line, actual);
            return;
        };
        let least = line.iter().filter_map(|&t| self.expected(t)).min();
        self.save(line, least.unwrap_or(expected));
        let end_line = |t: Token| self.tokens.line(self.tokens.span(t).end_offset);
        let start_line = |t: Token| self.tokens.line(self.tokens.span(t).start_offset);
        let mut prev = prev;
        if let (Some(&comment), Some(&last)) = (comments.first(), comments.last()) {
            if prev.is_some_and(|p| end_line(p) < start_line(comment)) {
                self.validate(comment, expected, reporter);
            }
            prev = Some(last);
        }
        if prev.is_some_and(|p| end_line(p) < start_line(first)) {
            self.validate(first, expected, reporter);
        }
    }

    fn validate(&self, token: Token, expected: u32, reporter: &mut Reporter<'_>) {
        let tokens = &self.tokens;
        let start = tokens.span(token).start_offset;
        let line = tokens.line(start);
        let line_start = tokens.lines.offset(line, 0).expect("an existing line");
        let indent = &tokens.source[line_start as usize..start as usize];
        if !indent.trim().is_empty() {
            return;
        }
        let character = self.options.character;
        let actual = tokens.column(start);
        let unit = if character == '\t' { "tab" } else { "space" };
        let mismatched = indent.chars().any(|c| c != character);
        if actual != expected {
            let plural = |n: u32| if n == 1 { "" } else { "s" };
            let actual_unit = if mismatched { "whitespace" } else { unit };
            let message = format!(
                "Expected indentation of {expected} {unit}{} but found {actual} {actual_unit}{}.",
                plural(expected),
                plural(actual)
            );
            let span = Span::new(line_start, start);
            reporter.report(
                Report::range(message, span)
                    .message_id("unexpectedIndentation")
                    .fix(Fix::replace(
                        span,
                        character.to_string().repeat(expected as usize),
                    )),
            );
            return;
        }
        let mut at = line_start;
        for c in indent.chars() {
            let end = at + c.len_utf8() as u32;
            if c != character {
                let message = format!(
                    "Expected {} character, but found {} character.",
                    json_char(character),
                    json_char(c)
                );
                let span = Span::new(at, end);
                reporter.report(
                    Report::range(message, span)
                        .message_id("unexpectedChar")
                        .fix(Fix::replace(span, character.to_string())),
                );
            }
            at = end;
        }
    }

    /// Per token, whether an ignored range contains its start.
    fn ignored_tokens(&mut self) -> Vec<bool> {
        let mut out = vec![false; self.tokens.len()];
        self.ignored.sort_by_key(|s| s.start_offset);
        let mut reach = 0u32;
        let mut ranges = self.ignored.iter().peekable();
        let mut open: Option<u32> = None;
        for (t, flag) in out.iter_mut().enumerate() {
            let start = self.tokens.span(t as Token).start_offset;
            while let Some(range) = ranges.next_if(|r| r.start_offset <= start) {
                reach = reach.max(range.end_offset);
                open = Some(reach);
            }
            *flag = open.is_some_and(|end| start < end);
        }
        out
    }
}

/// `JSON.stringify` of one character.
fn json_char(c: char) -> String {
    match c {
        '\t' => "\"\\t\"".to_owned(),
        '\n' => "\"\\n\"".to_owned(),
        '\r' => "\"\\r\"".to_owned(),
        '\u{0c}' => "\"\\f\"".to_owned(),
        '\u{08}' => "\"\\b\"".to_owned(),
        c if (c as u32) < 0x20 => format!("\"\\u{:04x}\"", c as u32),
        c => format!("\"{c}\""),
    }
}
