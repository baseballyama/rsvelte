//! A byte-oriented, pull-based lexer.
//!
//! It is `Copy`, so speculative lookahead (arrow-function
//! detection) is a struct copy, not a token buffer. Regex literals and template continuations are
//! context-dependent and are lexed on the parser's request.

use rsvelte_kernel::source::positions::Span;

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum T {
    Eof,
    Identifier,
    /// `#name` (private names are not supported beyond lexing).
    PrivateName,
    Number,
    String,
    /// A template literal part: from '`' or '}' up to '${' (not tail) or '`' (tail).
    Template {
        tail: bool,
    },
    Regex,
    LParen,
    RParen,
    LBrace,
    RBrace,
    LBracket,
    RBracket,
    Semi,
    Comma,
    Dot,
    Ellipsis,
    Question,
    QuestionDot,
    Colon,
    Arrow,
    At,
    /// Any operator; the text is the token's span.
    Op,
}

impl rsvelte_kernel::source::tokens::TokenKind for T {
    /// Comments and whitespace are not tokens here; they are [`crate::SyntaxTree::comments`] and
    /// the gaps.
    fn is_trivia(self) -> bool {
        false
    }
}

#[derive(Clone, Copy, Debug)]
pub struct LexedToken {
    pub t: T,
    pub span: Span,
    /// A line terminator appeared between the previous token and this one (for ASI).
    pub newline_before: bool,
}

#[derive(Clone, Copy, Debug)]
pub struct Lexer<'a> {
    source_text: &'a [u8],
    pub position: usize,
    end: usize,
}

#[derive(Debug)]
pub struct LexicalError {
    pub message: String,
    pub span: Span,
}

type R<T> = Result<T, LexicalError>;

const fn is_identifier_start(b: u8) -> bool {
    b.is_ascii_alphabetic() || b == b'_' || b == b'$' || b >= 0x80
}

const fn is_identifier_continue(b: u8) -> bool {
    is_identifier_start(b) || b.is_ascii_digit()
}

impl<'a> Lexer<'a> {
    #[must_use]
    pub const fn new(source_text: &'a str, start: usize, end: usize) -> Self {
        Lexer {
            source_text: source_text.as_bytes(),
            position: start,
            end,
        }
    }

    fn err<X>(&self, message: impl Into<String>, start_offset: usize) -> R<X> {
        Err(LexicalError {
            message: message.into(),
            span: Span::new(start_offset as u32, self.position.max(start_offset) as u32),
        })
    }

    #[inline]
    const fn peek(&self, offset: usize) -> u8 {
        let i = self.position + offset;
        if i < self.end { self.source_text[i] } else { 0 }
    }

    /// Skips whitespace and comments; returns whether a line terminator was crossed.
    fn skip_trivia(&mut self, comments: &mut Vec<Span>) -> R<bool> {
        let mut newline = false;
        while self.position < self.end {
            match self.source_text[self.position] {
                b'\n' => {
                    newline = true;
                    self.position += 1;
                }
                b' ' | b'\t' | b'\r' | 0x0B | 0x0C => self.position += 1,
                b'/' if self.peek(1) == b'/' => {
                    let start_offset = self.position;
                    while self.position < self.end && self.source_text[self.position] != b'\n' {
                        self.position += 1;
                    }
                    comments.push(Span::new(start_offset as u32, self.position as u32));
                }
                b'/' if self.peek(1) == b'*' => {
                    let start_offset = self.position;
                    self.position += 2;
                    loop {
                        if self.position + 1 >= self.end {
                            return self.err("unterminated comment", start_offset);
                        }
                        if self.source_text[self.position] == b'*'
                            && self.source_text[self.position + 1] == b'/'
                        {
                            self.position += 2;
                            break;
                        }
                        if self.source_text[self.position] == b'\n' {
                            newline = true;
                        }
                        self.position += 1;
                    }
                    comments.push(Span::new(start_offset as u32, self.position as u32));
                }
                0xE2 if self.peek(1) == 0x80 && matches!(self.peek(2), 0xA8 | 0xA9) => {
                    newline = true;
                    self.position += 3;
                }
                0xC2 if self.peek(1) == 0xA0 => self.position += 2,
                0xEF if self.peek(1) == 0xBB && self.peek(2) == 0xBF => self.position += 3,
                _ => break,
            }
        }
        Ok(newline)
    }

    /// # Errors
    ///
    /// [`LexicalError`] on an unexpected character, an unterminated comment, string or template, or
    /// an unsupported literal.
    pub fn next(&mut self, comments: &mut Vec<Span>) -> R<LexedToken> {
        let newline_before = self.skip_trivia(comments)?;
        let start_offset = self.position;
        let mk = |t, end_offset: usize| LexedToken {
            t,
            span: Span::new(start_offset as u32, end_offset as u32),
            newline_before,
        };
        if self.position >= self.end {
            return Ok(mk(T::Eof, start_offset));
        }
        let b = self.source_text[self.position];
        if is_identifier_start(b) || (b == b'\\' && self.peek(1) == b'u') {
            self.ident_tail()?;
            return Ok(mk(T::Identifier, self.position));
        }
        if b == b'#' && is_identifier_start(self.peek(1)) {
            self.position += 1;
            self.ident_tail()?;
            return Ok(mk(T::PrivateName, self.position));
        }
        if b.is_ascii_digit() || (b == b'.' && self.peek(1).is_ascii_digit()) {
            self.number()?;
            return Ok(mk(T::Number, self.position));
        }
        if b == b'"' || b == b'\'' {
            self.string(b)?;
            return Ok(mk(T::String, self.position));
        }
        if b == b'`' {
            self.position += 1;
            let tail = self.template_chars()?;
            return Ok(mk(T::Template { tail }, self.position));
        }
        if let Some((len, t)) = self.punct(b) {
            self.position += len;
            return Ok(mk(t, self.position));
        }
        self.position += 1;
        self.err(
            format!("unexpected character `{}`", b as char),
            start_offset,
        )
    }

    /// The longest punctuator at `position`, whose first byte is `b`, and its kind; decided on the
    /// bytes themselves, since a lexer that tries each operator in turn spends its time comparing.
    fn punct(&self, b: u8) -> Option<(usize, T)> {
        let (b1, b2, b3) = (self.peek(1), self.peek(2), self.peek(3));
        // `x`, `x=`, and, for a doubling operator, `xx` and `xx=`.
        let op = |doubles: bool| {
            let len = if doubles && b1 == b {
                if b2 == b'=' { 3 } else { 2 }
            } else if b1 == b'=' {
                2
            } else {
                1
            };
            (len, T::Op)
        };
        Some(match b {
            b'(' => (1, T::LParen),
            b')' => (1, T::RParen),
            b'{' => (1, T::LBrace),
            b'}' => (1, T::RBrace),
            b'[' => (1, T::LBracket),
            b']' => (1, T::RBracket),
            b';' => (1, T::Semi),
            b',' => (1, T::Comma),
            b':' => (1, T::Colon),
            b'@' => (1, T::At),
            b'.' if b1 == b'.' && b2 == b'.' => (3, T::Ellipsis),
            b'.' => (1, T::Dot),
            b'?' if b1 == b'?' => (if b2 == b'=' { 3 } else { 2 }, T::Op),
            // `?.` followed by a digit is a conditional with a decimal, not optional chaining.
            b'?' if b1 == b'.' && !b2.is_ascii_digit() => (2, T::QuestionDot),
            b'?' => (1, T::Question),
            b'=' if b1 == b'>' => (2, T::Arrow),
            b'=' | b'!' if b1 == b'=' => (if b2 == b'=' { 3 } else { 2 }, T::Op),
            b'=' | b'!' | b'~' => (1, T::Op),
            b'>' if b1 == b'>' && b2 == b'>' => (if b3 == b'=' { 4 } else { 3 }, T::Op),
            b'&' | b'|' | b'*' | b'<' | b'>' => op(true),
            // `++` and `--` take no `=`.
            b'+' | b'-' if b1 == b => (2, T::Op),
            b'+' | b'-' | b'/' | b'%' | b'^' => op(false),
            _ => return None,
        })
    }

    fn ident_tail(&mut self) -> R<()> {
        while self.position < self.end {
            let b = self.source_text[self.position];
            if b >= 0x80 {
                // Non-ASCII identifier chars are accepted as-is; separators are handled in trivia.
                let ch_len = match b {
                    0xC0..=0xDF => 2,
                    0xE0..=0xEF => 3,
                    _ => 4,
                };
                if b == 0xE2 && self.peek(1) == 0x80 && matches!(self.peek(2), 0xA8 | 0xA9) {
                    break;
                }
                if b == 0xC2 && self.peek(1) == 0xA0 {
                    break;
                }
                self.position += ch_len;
            } else if is_identifier_continue(b) {
                self.position += 1;
            } else if b == b'\\' {
                return self.err(
                    "unicode escapes in identifiers are not supported",
                    self.position,
                );
            } else {
                break;
            }
        }
        Ok(())
    }

    fn number(&mut self) -> R<()> {
        let start_offset = self.position;
        if self.source_text[self.position] == b'0'
            && matches!(self.peek(1) | 0x20, b'x' | b'o' | b'b')
        {
            self.position += 2;
            while self.position < self.end
                && (self.source_text[self.position].is_ascii_hexdigit()
                    || self.source_text[self.position] == b'_')
            {
                self.position += 1;
            }
        } else {
            while self.position < self.end
                && (self.source_text[self.position].is_ascii_digit()
                    || self.source_text[self.position] == b'_')
            {
                self.position += 1;
            }
            if self.peek(0) == b'.' {
                self.position += 1;
                while self.position < self.end
                    && (self.source_text[self.position].is_ascii_digit()
                        || self.source_text[self.position] == b'_')
                {
                    self.position += 1;
                }
            }
            if self.peek(0) | 0x20 == b'e' {
                self.position += 1;
                if matches!(self.peek(0), b'+' | b'-') {
                    self.position += 1;
                }
                while self.position < self.end && self.source_text[self.position].is_ascii_digit() {
                    self.position += 1;
                }
            }
        }
        if self.peek(0) == b'n' {
            self.position += 1;
            return self.err("bigint literals are not supported", start_offset);
        }
        if self.position < self.end && is_identifier_start(self.source_text[self.position]) {
            return self.err("identifier directly after number", start_offset);
        }
        Ok(())
    }

    fn string(&mut self, q: u8) -> R<()> {
        let start_offset = self.position;
        self.position += 1;
        while self.position < self.end {
            match self.source_text[self.position] {
                b'\\' => self.position += 2,
                b'\n' => return self.err("unterminated string", start_offset),
                c if c == q => {
                    self.position += 1;
                    return Ok(());
                }
                _ => self.position += 1,
            }
        }
        self.err("unterminated string", start_offset)
    }

    /// Reads template characters up to and including a backtick (returns true) or `${` (returns
    /// false).
    fn template_chars(&mut self) -> R<bool> {
        let start_offset = self.position;
        while self.position < self.end {
            match self.source_text[self.position] {
                b'\\' => self.position += 2,
                b'`' => {
                    self.position += 1;
                    return Ok(true);
                }
                b'$' if self.peek(1) == b'{' => {
                    self.position += 2;
                    return Ok(false);
                }
                _ => self.position += 1,
            }
        }
        self.err("unterminated template literal", start_offset)
    }

    /// Continues a template after the `}` closing a substitution; `position` must be just past the
    /// `}`.
    ///
    /// # Errors
    ///
    /// [`LexicalError`] if the template is not terminated.
    pub fn template_continue(&mut self, rbrace: Span) -> R<LexedToken> {
        self.position = rbrace.end_offset as usize;
        let tail = self.template_chars()?;
        Ok(LexedToken {
            t: T::Template { tail },
            span: Span::new(rbrace.start_offset, self.position as u32),
            newline_before: false,
        })
    }

    /// Re-lexes a `/` or `/=` token at `slash` as a regular expression literal.
    ///
    /// # Errors
    ///
    /// [`LexicalError`] if the literal is not terminated before the end of its line.
    pub fn regex(&mut self, slash: Span) -> R<LexedToken> {
        let start_offset = slash.start_offset as usize;
        self.position = start_offset + 1;
        let mut in_class = false;
        loop {
            if self.position >= self.end || self.source_text[self.position] == b'\n' {
                return self.err("unterminated regular expression", start_offset);
            }
            match self.source_text[self.position] {
                b'\\' => self.position += 2,
                b'[' => {
                    in_class = true;
                    self.position += 1;
                }
                b']' => {
                    in_class = false;
                    self.position += 1;
                }
                b'/' if !in_class => {
                    self.position += 1;
                    break;
                }
                _ => self.position += 1,
            }
        }
        while self.position < self.end && is_identifier_continue(self.source_text[self.position]) {
            self.position += 1;
        }
        Ok(LexedToken {
            t: T::Regex,
            span: Span::new(start_offset as u32, self.position as u32),
            newline_before: false,
        })
    }
}

/// Decodes a quoted JS string literal's escapes; `None` when the body contains no backslash
/// (the value is then the source bytes between the quotes).
pub fn decode_string(raw_body: &str) -> Option<String> {
    if !raw_body.contains('\\') {
        return None;
    }
    let mut out = String::with_capacity(raw_body.len());
    let mut chars = raw_body.chars().peekable();
    while let Some(c) = chars.next() {
        if c != '\\' {
            out.push(c);
            continue;
        }
        match chars.next() {
            Some('n') => out.push('\n'),
            Some('t') => out.push('\t'),
            Some('r') => out.push('\r'),
            Some('b') => out.push('\u{8}'),
            Some('f') => out.push('\u{c}'),
            Some('v') => out.push('\u{b}'),
            Some('0') if !chars.peek().is_some_and(char::is_ascii_digit) => out.push('\0'),
            Some('x') => {
                let h: String = chars.by_ref().take(2).collect();
                out.push(
                    u32::from_str_radix(&h, 16)
                        .ok()
                        .and_then(char::from_u32)
                        .unwrap_or('\u{fffd}'),
                );
            }
            Some('u') => {
                let code = if chars.peek() == Some(&'{') {
                    chars.next();
                    let h: String = chars.by_ref().take_while(|&c| c != '}').collect();
                    u32::from_str_radix(&h, 16).ok()
                } else {
                    let h: String = chars.by_ref().take(4).collect();
                    u32::from_str_radix(&h, 16).ok()
                };
                out.push(code.and_then(char::from_u32).unwrap_or('\u{fffd}'));
            }
            Some('\r') => {
                if chars.peek() == Some(&'\n') {
                    chars.next();
                }
            }
            Some('\n' | '\u{2028}' | '\u{2029}') | None => {}
            Some(other) => out.push(other),
        }
    }
    Some(out)
}

#[cfg(test)]
mod tests {
    use super::*;

    /// The operators, longest first: the table the dispatch in [`Lexer::punct`] replaces.
    const OPS: &[&str] = &[
        ">>>=", "...", "===", "!==", "**=", "<<=", ">>=", ">>>", "&&=", "||=", "??=", "=>", "==",
        "!=", "<=", ">=", "&&", "||", "??", "?.", "++", "--", "+=", "-=", "*=", "/=", "%=", "&=",
        "|=", "^=", "<<", ">>", "**", "{", "}", "(", ")", "[", "]", ";", ",", "<", ">", "+", "-",
        "*", "/", "%", "&", "|", "^", "!", "~", "?", ":", "=", ".", "@",
    ];

    fn by_table(s: &[u8]) -> Option<(usize, T)> {
        for op in OPS {
            if s.starts_with(op.as_bytes()) {
                if *op == "?." && s.get(2).is_some_and(u8::is_ascii_digit) {
                    continue;
                }
                let t = match *op {
                    "(" => T::LParen,
                    ")" => T::RParen,
                    "{" => T::LBrace,
                    "}" => T::RBrace,
                    "[" => T::LBracket,
                    "]" => T::RBracket,
                    ";" => T::Semi,
                    "," => T::Comma,
                    "." => T::Dot,
                    "..." => T::Ellipsis,
                    "?" => T::Question,
                    "?." => T::QuestionDot,
                    ":" => T::Colon,
                    "=>" => T::Arrow,
                    "@" => T::At,
                    _ => T::Op,
                };
                return Some((op.len(), t));
            }
        }
        None
    }

    /// Every string of up to four bytes over the operators' bytes, a digit, a letter and
    /// whitespace: the dispatch agrees with the table on each.
    #[test]
    fn punctuators_are_the_longest_match_of_the_operator_table() {
        fn all(s: &mut Vec<u8>, alphabet: &[u8], checked: &mut usize) {
            if let Some(&b) = s.first() {
                let source_text = std::str::from_utf8(s).expect("ASCII");
                let got = Lexer::new(source_text, 0, source_text.len()).punct(b);
                assert_eq!(got, by_table(s), "{source_text:?}");
                *checked += 1;
            }
            if s.len() < 4 {
                for &c in alphabet {
                    s.push(c);
                    all(s, alphabet, checked);
                    s.pop();
                }
            }
        }
        let mut alphabet: Vec<u8> = OPS
            .iter()
            .flat_map(|o| o.bytes())
            .chain(*b"0a \n")
            .collect();
        alphabet.sort_unstable();
        alphabet.dedup();
        let mut checked = 0;
        all(&mut Vec::new(), &alphabet, &mut checked);
        assert_eq!(
            checked,
            (1..=4).map(|n| alphabet.len().pow(n)).sum::<usize>()
        );
    }
}
