//! What `PostCSS` makes of a style sheet or of a declaration list.
//!
//! The error its parser (or `postcss-scss`'s) throws, and the declarations `postcss-safe-parser`
//! keeps. Linters that report `PostCSS`'s verdicts read it here; compilation uses
//! [`crate::parse`].
//!
//! It follows the versions eslint-plugin-svelte 3.23.1 resolves in `tools/oracle`: postcss 8.5.32,
//! postcss-scss 4.0.9 and postcss-safe-parser 7.1.0.
//!
//! An inline style is tokenized as eslint-plugin-svelte's template tokenizer does: `PostCSS`'s
//! tokens, with each `{…}` (a mustache or a template's `${…}`) merged into one word.

use rsvelte_kernel::source::positions::Span;

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Dialect {
    /// `postcss`'s own parser.
    Css,
    /// `postcss-scss`.
    Scss,
}

/// An error `PostCSS` throws: its reason and where, relative to the parsed text.
#[derive(Clone, PartialEq, Eq, Debug)]
pub struct SyntaxError {
    pub reason: String,
    /// 1-based.
    pub line: u32,
    /// 1-based, in UTF-16 code units as `PostCSS` counts.
    pub column: u32,
}

/// The first error `PostCSS` (or `postcss-scss`) throws on `content`, if any.
///
/// # Errors
///
/// The [`SyntaxError`] the parser throws.
pub fn check(source: &str, content: Span, dialect: Dialect) -> Result<(), SyntaxError> {
    let mut parser = Parser::new(source, content, Mode::Strict(dialect));
    parser.parse().map_err(|Thrown { reason, offset }| {
        // One past a comma can fall inside the next character, one UTF-16 unit into it.
        let boundary = source.floor_char_boundary(offset as usize);
        let inside = u32::from(boundary != offset as usize);
        let text = &source[content.start_offset as usize..boundary];
        let line_start = text.rfind('\n').map_or(0, |at| at + 1);
        SyntaxError {
            reason,
            line: text.matches('\n').count() as u32 + 1,
            column: text[line_start..].encode_utf16().count() as u32 + 1 + inside,
        }
    })
}

/// A top-level node of an inline style, as `eslint-plugin-svelte` converts `postcss-safe-parser`'s
/// tree.
#[derive(Clone, Copy, Debug)]
pub enum InlineNode {
    Declaration(Declaration),
    Comment(Span),
    /// A hole outside every declaration and comment: its index in the holes given and its span.
    Hole {
        index: u32,
        span: Span,
    },
}

impl InlineNode {
    #[must_use]
    pub const fn span(&self) -> Span {
        match self {
            Self::Declaration(declaration) => declaration.span,
            Self::Comment(span) | Self::Hole { span, .. } => *span,
        }
    }
}

#[derive(Clone, Copy, Debug)]
pub struct Declaration {
    /// From the property to the end of the value, the `;` included.
    pub span: Span,
    pub property: Span,
    pub value: Span,
    pub important: bool,
    /// Holes in the property.
    pub property_holes: u32,
    /// Holes in the declaration outside its property and value.
    pub other_holes: u32,
}

/// The declarations, comments and holes of an inline style (`style="…"`), or `None` when it
/// holds a rule, an at-rule or a hole in a comment, which upstream does not convert.
#[must_use]
pub fn inline(source: &str, content: Span, holes: &[Span]) -> Option<Vec<InlineNode>> {
    let mut parser = Parser::new(source, content, Mode::Safe);
    parser.parse().ok()?;
    let mut out = Vec::with_capacity(parser.nodes.len() + holes.len());
    let mut pending = holes
        .iter()
        .enumerate()
        .map(|(index, &span)| (index as u32, span))
        .peekable();
    for node in &mut parser.nodes {
        let span = node.span();
        while let Some(&(index, hole)) = pending.peek() {
            if hole.end_offset <= span.start_offset {
                out.push(InlineNode::Hole { index, span: hole });
            } else if hole.start_offset < span.end_offset {
                let InlineNode::Declaration(declaration) = node else {
                    return None;
                };
                let at = hole.start_offset;
                if contains(declaration.property, at) {
                    declaration.property_holes += 1;
                } else if !contains(declaration.value, at) {
                    declaration.other_holes += 1;
                }
            } else {
                break;
            }
            pending.next();
        }
        out.push(*node);
    }
    out.extend(pending.map(|(index, span)| InlineNode::Hole { index, span }));
    Some(out)
}

const fn contains(span: Span, at: u32) -> bool {
    span.start_offset <= at && at < span.end_offset
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
enum Mode {
    Strict(Dialect),
    /// `postcss-safe-parser` over the template tokenizer of `eslint-plugin-svelte`.
    Safe,
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
enum Kind {
    Space,
    Word,
    String,
    AtWord,
    Brackets,
    Comment,
    /// `postcss-scss`'s `// …`.
    InlineComment,
    Open(u8),
    Close(u8),
    Colon,
    Semicolon,
}

#[derive(Clone, Copy, Debug)]
struct Token {
    kind: Kind,
    start: u32,
    end: u32,
}

struct Thrown {
    reason: String,
    offset: u32,
}

type R<T> = Result<T, Thrown>;

fn thrown<T>(reason: impl Into<String>, offset: u32) -> R<T> {
    Err(Thrown {
        reason: reason.into(),
        offset,
    })
}

struct Parser<'a> {
    source: &'a str,
    b: &'a [u8],
    position: usize,
    end: usize,
    returned: Vec<Token>,
    /// Words the tokenizer read; each `(` takes the last one, which decides `url(`.
    words: Vec<Token>,
    mode: Mode,
    /// The start of each open block, innermost last.
    blocks: Vec<u32>,
    /// Top-level nodes, in safe mode.
    nodes: Vec<InlineNode>,
    /// The last search for `)` and for a bad bracket character: where it began and what it
    /// found. Later searches start further on, so they reuse it and each stays linear.
    close_search: Option<(usize, Option<usize>)>,
    bad_search: Option<(usize, Option<usize>)>,
    /// `PostCSS` 8.5's `lastBadParen`: every `(` up to the `)` of a bad bracket is a lone `(`.
    last_bad_paren: Option<usize>,
}

/// `String.prototype.trim`: JavaScript's whitespace and line terminators.
fn js_trim(text: &str) -> &str {
    text.trim_matches(|c: char| {
        matches!(
            c,
            '\t' | '\n' | '\u{b}' | '\u{c}' | '\r' | ' ' | '\u{a0}' | '\u{1680}' | '\u{2000}'
                ..='\u{200a}'
                    | '\u{2028}'
                    | '\u{2029}'
                    | '\u{202f}'
                    | '\u{205f}'
                    | '\u{3000}'
                    | '\u{feff}'
        )
    })
}

const fn is_space(c: u8) -> bool {
    matches!(c, b' ' | b'\n' | b'\t' | b'\r' | 0x0C)
}

impl<'a> Parser<'a> {
    const fn new(source: &'a str, content: Span, mode: Mode) -> Self {
        Self {
            source,
            b: source.as_bytes(),
            position: content.start_offset as usize,
            end: content.end_offset as usize,
            returned: Vec::new(),
            words: Vec::new(),
            mode,
            blocks: Vec::new(),
            nodes: Vec::new(),
            close_search: None,
            bad_search: None,
            last_bad_paren: None,
        }
    }

    const fn strict(&self) -> bool {
        matches!(self.mode, Mode::Strict(_))
    }

    const fn scss(&self) -> bool {
        matches!(self.mode, Mode::Strict(Dialect::Scss))
    }

    fn text(&self, token: Token) -> &'a str {
        &self.source[token.start as usize..token.end as usize]
    }

    fn byte(&self, at: usize) -> Option<u8> {
        (at < self.end).then(|| self.b[at])
    }

    /// The first `at >= from` where `found` holds.
    fn find(&self, from: usize, found: impl Fn(usize) -> bool) -> Option<usize> {
        (from..self.end).find(|&at| found(at))
    }

    /// The next unescaped `quote` after `from`.
    fn closing(&self, from: usize, quote: u8) -> Option<usize> {
        let mut at = from;
        loop {
            let next = self.find(at + 1, |i| self.b[i] == quote)?;
            let backslashes = self.b[..next]
                .iter()
                .rev()
                .take_while(|&&c| c == b'\\')
                .count();
            if backslashes % 2 == 0 {
                return Some(next);
            }
            at = next;
        }
    }

    const fn token(&mut self, kind: Kind, start: usize, end: usize) -> Token {
        self.position = end;
        Token {
            kind,
            start: start as u32,
            end: end as u32,
        }
    }

    fn back(&mut self, token: Token) {
        self.returned.push(token);
    }

    const fn end_of_file(&self) -> bool {
        self.returned.is_empty() && self.position >= self.end
    }

    /// The next token; in safe mode, a `{…}` with what it holds is one word.
    fn next_token(&mut self) -> R<Option<Token>> {
        let token = self.raw_token()?;
        if self.strict() {
            return Ok(token);
        }
        let depth = |token: Token| match token.kind {
            Kind::Open(b'{') => 1,
            Kind::Close(b'}') => -1,
            _ => 0,
        };
        let Some(first) = token.filter(|&t| depth(t) != 0) else {
            return Ok(token);
        };
        // A stray `}` takes the depth below zero, so the word runs on as upstream's does.
        let mut open = depth(first);
        let mut end = first.end;
        while open != 0
            && let Some(next) = self.raw_token()?
        {
            open += depth(next);
            end = next.end;
        }
        Ok(Some(Token {
            kind: Kind::Word,
            start: first.start,
            end,
        }))
    }

    #[expect(
        clippy::too_many_lines,
        reason = "one arm per token kind, as `PostCSS` reads them"
    )]
    fn raw_token(&mut self) -> R<Option<Token>> {
        if let Some(token) = self.returned.pop() {
            return Ok(Some(token));
        }
        let pos = self.position;
        let Some(c) = self.byte(pos) else {
            return Ok(None);
        };
        let scss = self.scss();
        let ignore = !self.strict();
        let next = self.byte(pos + 1);
        Ok(Some(match c {
            c if is_space(c) => {
                let end = (pos..self.end)
                    .find(|&i| !is_space(self.b[i]))
                    .unwrap_or(self.end);
                self.token(Kind::Space, pos, end)
            }
            b'[' | b'{' => self.token(Kind::Open(c), pos, pos + 1),
            b']' | b'}' | b')' => self.token(Kind::Close(c), pos, pos + 1),
            b':' => self.token(Kind::Colon, pos, pos + 1),
            b';' => self.token(Kind::Semicolon, pos, pos + 1),
            b',' if scss => self.token(Kind::Word, pos, pos + 1),
            b'(' => {
                let url = self.words.pop().is_some_and(|w| self.text(w) == "url");
                if url && scss && !matches!(next, Some(b'\'' | b'"')) {
                    let mut depth = 1;
                    let mut at = pos + 1;
                    while at < self.end {
                        match self.b[at] {
                            b'(' => depth += 1,
                            b')' => {
                                depth -= 1;
                                if depth == 0 {
                                    break;
                                }
                            }
                            _ => {}
                        }
                        at += 1;
                    }
                    self.token(Kind::Brackets, pos, (at + 1).min(self.end))
                } else if url
                    && !scss
                    && next.is_none_or(|n| !is_space(n) && n != b'\'' && n != b'"')
                {
                    match self.closing(pos, b')') {
                        Some(close) => self.token(Kind::Brackets, pos, close + 1),
                        None if ignore => self.token(Kind::Brackets, pos, pos + 1),
                        None => return thrown("Unclosed bracket", pos as u32),
                    }
                } else if !scss && self.last_bad_paren.is_some_and(|bad| pos <= bad) {
                    self.token(Kind::Open(b'('), pos, pos + 1)
                } else {
                    let close = self.next_close(pos + 1);
                    match close {
                        Some(close) if self.next_bad(pos + 1).is_none_or(|bad| bad > close) => {
                            self.token(Kind::Brackets, pos, close + 1)
                        }
                        _ => {
                            self.last_bad_paren = Some(close.unwrap_or(self.end));
                            self.token(Kind::Open(b'('), pos, pos + 1)
                        }
                    }
                }
            }
            b'\'' | b'"' => {
                let close = if scss {
                    self.scss_string(pos, c)?
                } else {
                    self.closing(pos, c)
                };
                match close {
                    Some(close) => self.token(Kind::String, pos, close + 1),
                    None if ignore => {
                        let end = if pos + 1 < self.end {
                            self.char_end(pos + 1)
                        } else {
                            self.end
                        };
                        self.token(Kind::String, pos, end)
                    }
                    None => return thrown("Unclosed string", pos as u32),
                }
            }
            b'@' => {
                let end = (pos + 1..self.end)
                    .find(|&i| {
                        matches!(
                            self.b[i],
                            b'\t'
                                | b'\n'
                                | 0x0C
                                | b'\r'
                                | b' '
                                | b'"'
                                | b'#'
                                | b'\''
                                | b'('
                                | b')'
                                | b'/'
                                | b';'
                                | b'['
                                | b'\\'
                                | b']'
                                | b'{'
                                | b'}'
                        )
                    })
                    .unwrap_or(self.end);
                self.token(Kind::AtWord, pos, end.max(pos + 1))
            }
            b'\\' => {
                let mut at = pos;
                let mut escape = true;
                while self.byte(at + 1) == Some(b'\\') {
                    at += 1;
                    escape = !escape;
                }
                if escape
                    && let Some(n) = self.byte(at + 1)
                    && n != b'/'
                    && !is_space(n)
                {
                    at += 1;
                    if n.is_ascii_hexdigit() {
                        while self.byte(at + 1).is_some_and(|h| h.is_ascii_hexdigit()) {
                            at += 1;
                        }
                        if self.byte(at + 1) == Some(b' ') {
                            at += 1;
                        }
                    }
                }
                let end = self.char_end(at);
                self.token(Kind::Word, pos, end)
            }
            b'#' if scss && next == Some(b'{') => {
                let end = self.interpolation(pos, pos)?;
                self.token(Kind::Word, pos, end + 1)
            }
            b'/' if next == Some(b'*') => {
                let close = self.find(pos + 2, |i| self.b[i..].starts_with(b"*/"));
                match close {
                    Some(close) => self.token(Kind::Comment, pos, close + 2),
                    None if ignore => self.token(Kind::Comment, pos, self.end),
                    None => return thrown("Unclosed comment", pos as u32),
                }
            }
            b'/' if scss && next == Some(b'/') => {
                let end = (pos + 1..self.end)
                    .find(|&i| matches!(self.b[i], b'\n' | 0x0C | b'\r'))
                    .unwrap_or(self.end);
                self.token(Kind::InlineComment, pos, end)
            }
            _ => {
                let end = self.word_end(pos + 1);
                let token = self.token(Kind::Word, pos, end);
                self.words.push(token);
                token
            }
        }))
    }

    /// The end of the character at `at`, which may be multibyte.
    fn char_end(&self, at: usize) -> usize {
        self.source[at..self.end]
            .chars()
            .next()
            .map_or(at + 1, |c| at + c.len_utf8())
    }

    fn word_end(&self, from: usize) -> usize {
        let scss = self.scss();
        (from..self.end)
            .find(|&i| {
                let c = self.b[i];
                matches!(
                    c,
                    b'\t'
                        | b'\n'
                        | 0x0C
                        | b'\r'
                        | b' '
                        | b'!'
                        | b'"'
                        | b'#'
                        | b'\''
                        | b'('
                        | b')'
                        | b':'
                        | b';'
                        | b'@'
                        | b'['
                        | b'\\'
                        | b']'
                        | b'{'
                        | b'}'
                ) || (c == b',' && scss)
                    || (c == b'/' && self.byte(i + 1) == Some(b'*'))
            })
            .unwrap_or(self.end)
    }

    /// The first `)` at or after `from`.
    fn next_close(&mut self, from: usize) -> Option<usize> {
        if let Some((start, found)) = self.close_search
            && start <= from
            && found.is_none_or(|at| at >= from)
        {
            return found;
        }
        let found = self.find(from, |i| self.b[i] == b')');
        self.close_search = Some((from, found));
        found
    }

    /// The first character at or after `from` that `/.[\r\n"'(/\\]/` matches in a bracket: one
    /// of those after any character but a line terminator.
    fn next_bad(&mut self, from: usize) -> Option<usize> {
        if let Some((start, found)) = self.bad_search
            && start <= from
            && found.is_none_or(|at| at >= from)
        {
            return found;
        }
        let found = (from.max(1)..self.end).find(|&i| {
            matches!(
                self.b[i],
                b'\r' | b'\n' | b'"' | b'\'' | b'(' | b'/' | b'\\'
            ) && !matches!(self.b[i - 1], b'\n' | b'\r')
                && !(i >= 3 && matches!(&self.b[i - 3..i], [0xE2, 0x80, 0xA8 | 0xA9]))
        });
        self.bad_search = Some((from, found));
        found
    }

    /// `postcss-scss`'s string: `#{…}` inside it is skipped whole.
    fn scss_string(&self, pos: usize, quote: u8) -> R<Option<usize>> {
        let mut at = pos;
        let mut escaped = false;
        loop {
            at += 1;
            if at >= self.end {
                return Ok(None);
            }
            let c = self.b[at];
            if !escaped && c == quote {
                return Ok(Some(at));
            } else if c == b'\\' {
                escaped = !escaped;
            } else if escaped {
                escaped = false;
            } else if c == b'#' && self.byte(at + 1) == Some(b'{') {
                at = self.interpolation(pos, at)?;
            }
        }
    }

    /// The `}` that closes the `#{` at `at`; `token` is where the token starts, for the error.
    fn interpolation(&self, token: usize, at: usize) -> R<usize> {
        let mut depth = 1;
        let mut quote = None;
        let mut escaped = false;
        let mut next = at;
        while depth > 0 {
            next += 1;
            let Some(c) = self.byte(next) else {
                return thrown("Unclosed interpolation", token as u32);
            };
            if let Some(q) = quote {
                if !escaped && c == q {
                    quote = None;
                    escaped = false;
                } else if c == b'\\' {
                    escaped = !escaped;
                } else if escaped {
                    escaped = false;
                }
            } else if c == b'\'' || c == b'"' {
                quote = Some(c);
            } else if c == b'}' {
                depth -= 1;
            } else if c == b'#' && self.byte(next + 1) == Some(b'{') {
                depth += 1;
            }
        }
        Ok(next)
    }

    // Parser.

    fn parse(&mut self) -> R<()> {
        while !self.end_of_file() {
            let Some(token) = self.next_token()? else {
                break;
            };
            match token.kind {
                Kind::Space | Kind::Semicolon => {}
                Kind::Close(b'}') => self.close(token)?,
                Kind::Comment | Kind::InlineComment => self.comment(token),
                Kind::AtWord => self.at_rule(token)?,
                Kind::Open(b'{') => self.open(token.start)?,
                _ => self.other(token)?,
            }
        }
        if let Some(&start) = self.blocks.last()
            && self.strict()
        {
            return thrown("Unclosed block", start);
        }
        Ok(())
    }

    /// A block opens: a rule's or an at-rule's. Upstream converts neither in an inline style.
    fn open(&mut self, start: u32) -> R<()> {
        if self.strict() {
            self.blocks.push(start);
            Ok(())
        } else {
            thrown("", start)
        }
    }

    fn close(&mut self, token: Token) -> R<()> {
        if self.blocks.pop().is_none() && self.strict() {
            return thrown("Unexpected }", token.start);
        }
        Ok(())
    }

    fn comment(&mut self, token: Token) {
        if self.blocks.is_empty() && !self.strict() {
            self.nodes
                .push(InlineNode::Comment(Span::new(token.start, token.end)));
        }
    }

    fn at_rule(&mut self, mut token: Token) -> R<()> {
        if !self.strict() {
            return thrown("", token.start);
        }
        if self.scss() {
            let mut last = self.last_offset(token);
            while !self.end_of_file() {
                let Some(next) = self.next_token()? else {
                    break;
                };
                if next.kind == Kind::Word && next.start == last + 1 {
                    token.end = next.end;
                    last = self.last_offset(next);
                } else {
                    self.back(next);
                    break;
                }
            }
        }
        if token.end - token.start == 1 {
            return thrown("At-rule without name", token.start);
        }
        let mut brackets: Vec<u8> = Vec::new();
        while !self.end_of_file() {
            let Some(next) = self.next_token()? else {
                break;
            };
            match next.kind {
                Kind::Open(b'(') => brackets.push(b')'),
                Kind::Open(b'[') => brackets.push(b']'),
                Kind::Open(b'{') if !brackets.is_empty() => brackets.push(b'}'),
                Kind::Close(c) if brackets.last() == Some(&c) => {
                    brackets.pop();
                }
                _ => {}
            }
            if brackets.is_empty() {
                match next.kind {
                    Kind::Semicolon => break,
                    Kind::Open(b'{') => return self.open(token.start),
                    Kind::Close(b'}') => return self.close(next),
                    _ => {}
                }
            }
        }
        Ok(())
    }

    fn other(&mut self, start: Token) -> R<()> {
        let custom_property = self.text(start).starts_with("--");
        let mut tokens = Vec::new();
        let mut colon = false;
        let mut end = false;
        let mut brackets: Vec<u8> = Vec::new();
        let mut bracket = None;
        let mut token = Some(start);
        while let Some(current) = token {
            tokens.push(current);
            match current.kind {
                Kind::Open(c @ (b'(' | b'[')) => {
                    bracket.get_or_insert(current);
                    brackets.push(if c == b'(' { b')' } else { b']' });
                }
                Kind::Open(b'{') if custom_property && colon => {
                    bracket.get_or_insert(current);
                    brackets.push(b'}');
                }
                kind if brackets.is_empty() => match kind {
                    Kind::Semicolon if colon => return self.declaration(&tokens, custom_property),
                    Kind::Semicolon => break,
                    Kind::Open(b'{') => return self.rule(tokens),
                    Kind::Close(b'}') => {
                        let close = tokens.pop().expect("the token just pushed");
                        self.back(close);
                        end = true;
                        break;
                    }
                    Kind::Colon => colon = true,
                    _ => {}
                },
                Kind::Close(c) if brackets.last() == Some(&c) => {
                    brackets.pop();
                    if brackets.is_empty() {
                        bracket = None;
                    }
                }
                _ => {}
            }
            token = self.next_token()?;
        }
        if self.end_of_file() {
            end = true;
        }
        if let Some(bracket) = bracket
            && self.strict()
        {
            return thrown("Unclosed bracket", bracket.start);
        }
        if end && colon {
            if !custom_property {
                while let Some(last) = tokens.last()
                    && matches!(last.kind, Kind::Space | Kind::Comment | Kind::InlineComment)
                {
                    let last = tokens.pop().expect("a last token");
                    self.back(last);
                }
            }
            self.declaration(&tokens, custom_property)
        } else {
            self.unknown_word(&tokens)
        }
    }

    fn unknown_word(&self, tokens: &[Token]) -> R<()> {
        if self.strict() {
            return thrown(
                format!("Unknown word {}", self.text(tokens[0])),
                tokens[0].start,
            );
        }
        Ok(())
    }

    fn rule(&mut self, mut tokens: Vec<Token>) -> R<()> {
        let open = tokens.pop().expect("a rule ends with `{`");
        if self.scss()
            && let Some(start) = self.nested_declaration(&tokens)?
        {
            return self.open(start);
        }
        let start = tokens.first().map_or(open.start, |t| t.start);
        self.open(start)
    }

    /// `postcss-scss`'s nested property (`font: 12px {`): where its block starts, or `None` for a
    /// rule. Only its missed-semicolon check throws.
    fn nested_declaration(&self, tokens: &[Token]) -> R<Option<u32>> {
        let mut colon = None;
        let mut depth = 0i32;
        for (i, token) in tokens.iter().enumerate() {
            match token.kind {
                Kind::Space if self.text(*token).contains('\n') => break,
                Kind::Open(b'(') => depth += 1,
                Kind::Close(b')') => depth -= 1,
                Kind::Colon if depth == 0 => {
                    colon = Some(i);
                    break;
                }
                _ => {}
            }
        }
        let Some(colon) = colon else {
            return Ok(None);
        };
        let mut value = tokens[colon + 1..]
            .iter()
            .filter(|t| !matches!(t.kind, Kind::Comment | Kind::InlineComment))
            .map(|t| self.text(*t));
        let mut blank = true;
        let mut first = None;
        for text in value.by_ref() {
            first = first.or_else(|| text.bytes().next());
            if !js_trim(text).is_empty() {
                blank = false;
                break;
            }
        }
        if blank
            || first.is_some_and(|c| c == b'#' || c == b':' || c == b'-' || c.is_ascii_alphabetic())
        {
            return Ok(None);
        }
        // Upstream reads the property from the first word, wherever the colon was.
        let Some(word) = tokens.iter().position(|t| t.kind == Kind::Word) else {
            // Upstream throws a `TypeError` here; read it as a rule.
            return Ok(None);
        };
        let start = tokens[word].start;
        let rest = &tokens[word..];
        let property_end = rest
            .iter()
            .position(|t| {
                matches!(
                    t.kind,
                    Kind::Colon | Kind::Space | Kind::Comment | Kind::InlineComment
                )
            })
            .unwrap_or(rest.len());
        let rest = &rest[property_end..];
        let rest = rest
            .iter()
            .position(|t| t.kind == Kind::Colon)
            .map_or(&[][..], |at| &rest[at + 1..]);
        let first_value = rest
            .iter()
            .position(|t| !matches!(t.kind, Kind::Space | Kind::Comment | Kind::InlineComment))
            .unwrap_or(rest.len());
        let rest = &rest[first_value..];
        let rest = &rest[..self.nested_important(rest)];
        if self.raw_value(rest, false).contains(':') {
            self.missed_semicolon(rest)?;
        }
        Ok(Some(start))
    }

    /// How many tokens stay once a nested property's `!important` is removed: `postcss-scss`
    /// matches it case-sensitively and never at the first token.
    fn nested_important(&self, tokens: &[Token]) -> usize {
        for i in (1..tokens.len()).rev() {
            let token = tokens[i];
            let text = self.text(token);
            if text == "!important" {
                let mut cut = i;
                while cut > 0 && tokens[cut - 1].kind == Kind::Space {
                    cut -= 1;
                }
                return cut;
            }
            if text == "important" {
                let mut cut = tokens.len();
                let mut text = String::new();
                for j in (1..=i).rev() {
                    if js_trim(&text).starts_with('!') && tokens[j].kind != Kind::Space {
                        break;
                    }
                    cut -= 1;
                    text.insert_str(0, self.text(tokens[cut]));
                }
                if js_trim(&text).starts_with('!') {
                    return cut;
                }
            }
            if !matches!(
                token.kind,
                Kind::Space | Kind::Comment | Kind::InlineComment
            ) {
                break;
            }
        }
        tokens.len()
    }

    /// `a: b c: d` in safe mode is two declarations, each read in turn, not one inside the other.
    fn declaration(&mut self, tokens: &[Token], custom_property: bool) -> R<()> {
        let mut next = Some(tokens);
        let mut custom_property = custom_property;
        while let Some(tokens) = next {
            next = self.one_declaration(tokens, custom_property)?;
            custom_property = false;
        }
        Ok(())
    }

    /// Reads one declaration; returns the tokens `postcss-safe-parser` splits off after it.
    fn one_declaration<'t>(
        &mut self,
        tokens: &'t [Token],
        custom_property: bool,
    ) -> R<Option<&'t [Token]>> {
        if !self.strict() && (tokens.len() < 2 || !tokens.iter().any(|t| t.kind == Kind::Word)) {
            return Ok(None);
        }
        let last = *tokens.last().expect("a declaration has tokens");
        let tokens = if last.kind == Kind::Semicolon {
            &tokens[..tokens.len() - 1]
        } else {
            tokens
        };
        let end = if last.kind == Kind::Space {
            tokens
                .iter()
                .rev()
                .find(|t| t.kind != Kind::Space)
                .map_or(last.end, |t| t.end)
        } else {
            last.end
        };
        let mut rest = tokens;
        while rest[0].kind != Kind::Word {
            if rest.len() == 1 {
                return self.unknown_word(rest).map(|()| None);
            }
            rest = &rest[1..];
        }
        let start = rest[0].start;
        let (property, after_colon, rest) = self.property(rest)?;
        let first_value = rest
            .iter()
            .position(|t| !matches!(t.kind, Kind::Space | Kind::Comment | Kind::InlineComment))
            .unwrap_or(rest.len());
        let (first_spaces, mut value) = (&rest[..first_value], &rest[first_value..]);
        let split = if self.strict() {
            None
        } else {
            self.split_missed_semicolon(value)?.map(|(before, after)| {
                value = before;
                after
            })
        };
        let (kept, important) = self.important(value);
        let value = &value[..kept];
        let has_word = value
            .iter()
            .any(|t| !matches!(t.kind, Kind::Space | Kind::Comment | Kind::InlineComment));
        if self.strict() {
            if !custom_property && self.raw_value(value, custom_property).contains(':') {
                self.missed_semicolon(value)?;
            }
            return Ok(None);
        }
        let value_span = if has_word {
            let last = value
                .iter()
                .rposition(|t| t.kind != Kind::Space)
                .expect("a value with a word");
            Span::new(value[0].start, value[last].end)
        } else {
            match (
                first_spaces.first().or_else(|| value.first()),
                value.last().or_else(|| first_spaces.last()),
            ) {
                (Some(first), Some(last)) => Span::new(first.start, last.end),
                _ => Span::new(after_colon, after_colon),
            }
        };
        let declaration = InlineNode::Declaration(Declaration {
            span: Span::new(start, end),
            property,
            value: value_span,
            important,
            property_holes: 0,
            other_holes: 0,
        });
        self.nodes.push(declaration);
        Ok(split)
    }

    /// The property from the first word, where its value starts, and the tokens after the `:`.
    fn property<'t>(&self, tokens: &'t [Token]) -> R<(Span, u32, &'t [Token])> {
        let start = tokens[0].start;
        let property_end = tokens
            .iter()
            .position(|t| {
                matches!(
                    t.kind,
                    Kind::Colon | Kind::Space | Kind::Comment | Kind::InlineComment
                )
            })
            .unwrap_or(tokens.len());
        let mut property = Span::new(start, tokens[property_end - 1].end);
        if matches!(self.b[start as usize], b'_' | b'*') {
            property.start_offset += 1;
        }
        let mut rest = &tokens[property_end..];
        let mut after_colon = property.end_offset;
        while let Some((&token, after)) = rest.split_first() {
            rest = after;
            after_colon = token.end;
            if token.kind == Kind::Colon {
                break;
            }
            if token.kind == Kind::Word
                && self
                    .text(token)
                    .bytes()
                    .any(|c| c.is_ascii_alphanumeric() || c == b'_')
            {
                self.unknown_word(&[token])?;
            }
        }
        Ok((property, after_colon, rest))
    }

    /// `postcss-safe-parser`'s `precheckMissedSemicolon`: the value of `a: b c: d` splits into
    /// `b` and the declaration `c: d`.
    fn split_missed_semicolon<'t>(
        &self,
        tokens: &'t [Token],
    ) -> R<Option<(&'t [Token], &'t [Token])>> {
        let Some(colon) = self.colon(tokens)? else {
            return Ok(None);
        };
        let Some(next_start) = tokens[..colon].iter().rposition(|t| t.kind == Kind::Word) else {
            return Ok(None);
        };
        if next_start == 0 {
            return Ok(None);
        }
        let previous_end = tokens[..next_start]
            .iter()
            .rposition(|t| t.kind != Kind::Space)
            .map_or(0, |i| i + 1);
        Ok(Some((&tokens[..previous_end], &tokens[next_start..])))
    }

    /// How many tokens stay once a trailing `!important` is removed, and whether there was one.
    fn important(&self, tokens: &[Token]) -> (usize, bool) {
        let mut kept = tokens.len();
        let mut important = false;
        for i in (0..tokens.len()).rev() {
            let token = tokens[i];
            let text = self.text(token);
            if text.eq_ignore_ascii_case("!important") {
                let mut cut = i;
                while cut > 0 && tokens[cut - 1].kind == Kind::Space {
                    cut -= 1;
                }
                return (cut, true);
            }
            if text.eq_ignore_ascii_case("important") {
                // As upstream, the text before is rebuilt from the end; its cost matches upstream's.
                let mut cut = kept;
                let mut text = String::new();
                for j in (1..=i).rev() {
                    if text.trim().starts_with('!') && tokens[j].kind != Kind::Space {
                        break;
                    }
                    cut -= 1;
                    text.insert_str(0, self.text(tokens[cut]));
                }
                if text.trim().starts_with('!') {
                    kept = cut;
                    important = true;
                }
            }
            if !matches!(
                token.kind,
                Kind::Space | Kind::Comment | Kind::InlineComment
            ) {
                break;
            }
        }
        (kept, important)
    }

    /// `Parser#raw`'s cleaned value: comments next to nothing or spaces, and a last space, dropped.
    fn raw_value(&self, tokens: &[Token], custom_property: bool) -> String {
        let mut value = String::new();
        let neighbour_is_safe = |i: Option<&Token>| i.is_none_or(|t| t.kind == Kind::Space);
        for (i, token) in tokens.iter().enumerate() {
            match token.kind {
                Kind::Space if i == tokens.len() - 1 && !custom_property => {}
                Kind::Comment | Kind::InlineComment => {
                    let before = i.checked_sub(1).and_then(|p| tokens.get(p));
                    if !neighbour_is_safe(before)
                        && !neighbour_is_safe(tokens.get(i + 1))
                        && !value.ends_with(',')
                    {
                        value.push_str(self.text(*token));
                    }
                }
                _ => value.push_str(self.text(*token)),
            }
        }
        value
    }

    /// `Parser#colon`: the first `:` outside parentheses, after something.
    fn colon(&self, tokens: &[Token]) -> R<Option<usize>> {
        let mut depth = 0i32;
        let mut previous: Option<Token> = None;
        for (i, &token) in tokens.iter().enumerate() {
            match token.kind {
                Kind::Open(b'(') => depth += 1,
                Kind::Close(b')') => depth -= 1,
                _ => {}
            }
            if depth == 0 && token.kind == Kind::Colon {
                match previous {
                    None if self.strict() => return thrown("Double colon", token.start),
                    None => {}
                    Some(p) if p.kind == Kind::Word && self.text(p) == "progid" => continue,
                    Some(_) => return Ok(Some(i)),
                }
            }
            previous = Some(token);
        }
        Ok(None)
    }

    fn missed_semicolon(&self, tokens: &[Token]) -> R<()> {
        let Some(colon) = self.colon(tokens)? else {
            return Ok(());
        };
        let mut found = 0;
        let mut token = tokens[colon];
        for j in (0..colon).rev() {
            token = tokens[j];
            if token.kind != Kind::Space {
                found += 1;
                if found == 2 {
                    break;
                }
            }
        }
        let offset = if token.kind == Kind::Word {
            self.last_offset(token) + 1
        } else {
            token.start
        };
        thrown("Missed semicolon", offset)
    }

    /// Where a token's last character is, as the tokenizer records it: `postcss-scss` records
    /// one past a comma.
    fn last_offset(&self, token: Token) -> u32 {
        if self.scss() && token.kind == Kind::Word && self.text(token) == "," {
            token.end
        } else {
            token.end - 1
        }
    }
}

#[cfg(test)]
mod tests;
