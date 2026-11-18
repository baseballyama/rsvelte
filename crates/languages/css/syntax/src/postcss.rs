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
    Standard,
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
#[derive(Clone, Debug)]
pub enum InlineNode {
    Declaration(Declaration),
    Comment(Span),
    /// A hole outside every declaration and comment: its index in the holes given and its span.
    Hole {
        index: u32,
        span: Span,
    },
}

impl Declaration {
    /// `PostCSS`'s value: the text of [`Declaration::value`] unless it was cleaned.
    #[must_use]
    pub fn value_text<'a>(&'a self, source: &'a str) -> &'a str {
        self.cleaned_value
            .as_deref()
            .unwrap_or_else(|| self.value.text(source))
    }
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

#[derive(Clone, Debug)]
pub struct Declaration {
    /// From the property to the end of the value, the `;` included.
    pub span: Span,
    pub property: Span,
    /// The value as written.
    pub value: Span,
    /// `PostCSS`'s value when it differs from the text of `value`: comments next to a space
    /// dropped, and a last space.
    pub cleaned_value: Option<Box<str>>,
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
    for mut node in std::mem::take(&mut parser.nodes) {
        let span = node.span();
        while let Some(&(index, hole)) = pending.peek() {
            if hole.end_offset <= span.start_offset {
                out.push(InlineNode::Hole { index, span: hole });
            } else if hole.start_offset < span.end_offset {
                let InlineNode::Declaration(declaration) = &mut node else {
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
        out.push(node);
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
    /// Where the tokenizer records the end, which positions read: past a scss comma, and before
    /// a merged word's last spaces.
    recorded_end: u32,
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
            recorded_end: end as u32,
        }
    }

    fn back(&mut self, token: Token) {
        self.returned.push(token);
    }

    const fn end_of_file(&self) -> bool {
        self.returned.is_empty() && self.position >= self.end
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
            let mut last = Self::last_offset(token);
            while !self.end_of_file() {
                let Some(next) = self.next_token()? else {
                    break;
                };
                if next.kind == Kind::Word && next.start == last + 1 {
                    token.end = next.end;
                    last = Self::last_offset(next);
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
}

mod declaration;
mod tokenizer;

#[cfg(test)]
mod tests;
