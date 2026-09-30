//! A byte-oriented, pull-based lexer.
//!
//! It is `Copy`, so speculative lookahead (arrow-function
//! detection) is a struct copy, not a token buffer. Regex literals and template continuations are
//! context-dependent and are lexed on the parser's request.

use rsv_kernel::source::Span;

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum T {
    Eof,
    Ident,
    /// `#name` (private names are not supported beyond lexing).
    PrivateName,
    Num,
    Str,
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

impl rsv_kernel::token::TokenKind for T {
    /// Comments and whitespace are not tokens here; they are [`crate::Ast::comments`] and the gaps.
    fn is_trivia(self) -> bool {
        false
    }
}

#[derive(Clone, Copy, Debug)]
pub struct Tok {
    pub t: T,
    pub span: Span,
    /// A line terminator appeared between the previous token and this one (for ASI).
    pub nl_before: bool,
}

#[derive(Clone, Copy, Debug)]
pub struct Lexer<'a> {
    src: &'a [u8],
    pub pos: usize,
    end: usize,
}

#[derive(Debug)]
pub struct LexError {
    pub message: String,
    pub span: Span,
}

type R<T> = Result<T, LexError>;

const fn is_id_start(b: u8) -> bool {
    b.is_ascii_alphabetic() || b == b'_' || b == b'$' || b >= 0x80
}

const fn is_id_continue(b: u8) -> bool {
    is_id_start(b) || b.is_ascii_digit()
}

impl<'a> Lexer<'a> {
    #[must_use]
    pub const fn new(src: &'a str, start: usize, end: usize) -> Self {
        Lexer {
            src: src.as_bytes(),
            pos: start,
            end,
        }
    }

    fn err<X>(&self, message: impl Into<String>, lo: usize) -> R<X> {
        Err(LexError {
            message: message.into(),
            span: Span::new(lo as u32, self.pos.max(lo) as u32),
        })
    }

    #[inline]
    const fn peek(&self, off: usize) -> u8 {
        let i = self.pos + off;
        if i < self.end { self.src[i] } else { 0 }
    }

    /// Skips whitespace and comments; returns whether a line terminator was crossed.
    fn skip_trivia(&mut self, comments: &mut Vec<Span>) -> R<bool> {
        let mut nl = false;
        while self.pos < self.end {
            match self.src[self.pos] {
                b'\n' => {
                    nl = true;
                    self.pos += 1;
                }
                b' ' | b'\t' | b'\r' | 0x0B | 0x0C => self.pos += 1,
                b'/' if self.peek(1) == b'/' => {
                    let lo = self.pos;
                    while self.pos < self.end && self.src[self.pos] != b'\n' {
                        self.pos += 1;
                    }
                    comments.push(Span::new(lo as u32, self.pos as u32));
                }
                b'/' if self.peek(1) == b'*' => {
                    let lo = self.pos;
                    self.pos += 2;
                    loop {
                        if self.pos + 1 >= self.end {
                            return self.err("unterminated comment", lo);
                        }
                        if self.src[self.pos] == b'*' && self.src[self.pos + 1] == b'/' {
                            self.pos += 2;
                            break;
                        }
                        if self.src[self.pos] == b'\n' {
                            nl = true;
                        }
                        self.pos += 1;
                    }
                    comments.push(Span::new(lo as u32, self.pos as u32));
                }
                0xE2 if self.peek(1) == 0x80 && matches!(self.peek(2), 0xA8 | 0xA9) => {
                    nl = true;
                    self.pos += 3;
                }
                0xC2 if self.peek(1) == 0xA0 => self.pos += 2,
                0xEF if self.peek(1) == 0xBB && self.peek(2) == 0xBF => self.pos += 3,
                _ => break,
            }
        }
        Ok(nl)
    }

    /// # Errors
    ///
    /// [`LexError`] on an unexpected character, an unterminated comment, string or template, or an
    /// unsupported literal.
    pub fn next(&mut self, comments: &mut Vec<Span>) -> R<Tok> {
        let nl_before = self.skip_trivia(comments)?;
        let lo = self.pos;
        let mk = |t, hi: usize| Tok {
            t,
            span: Span::new(lo as u32, hi as u32),
            nl_before,
        };
        if self.pos >= self.end {
            return Ok(mk(T::Eof, lo));
        }
        let b = self.src[self.pos];
        if is_id_start(b) || (b == b'\\' && self.peek(1) == b'u') {
            self.ident_tail()?;
            return Ok(mk(T::Ident, self.pos));
        }
        if b == b'#' && is_id_start(self.peek(1)) {
            self.pos += 1;
            self.ident_tail()?;
            return Ok(mk(T::PrivateName, self.pos));
        }
        if b.is_ascii_digit() || (b == b'.' && self.peek(1).is_ascii_digit()) {
            self.number()?;
            return Ok(mk(T::Num, self.pos));
        }
        if b == b'"' || b == b'\'' {
            self.string(b)?;
            return Ok(mk(T::Str, self.pos));
        }
        if b == b'`' {
            self.pos += 1;
            let tail = self.template_chars()?;
            return Ok(mk(T::Template { tail }, self.pos));
        }
        if let Some((len, t)) = self.punct(b) {
            self.pos += len;
            return Ok(mk(t, self.pos));
        }
        self.pos += 1;
        self.err(format!("unexpected character `{}`", b as char), lo)
    }

    /// The longest punctuator at `pos`, whose first byte is `b`, and its kind; decided on the
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
        while self.pos < self.end {
            let b = self.src[self.pos];
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
                self.pos += ch_len;
            } else if is_id_continue(b) {
                self.pos += 1;
            } else if b == b'\\' {
                return self.err("unicode escapes in identifiers are not supported", self.pos);
            } else {
                break;
            }
        }
        Ok(())
    }

    fn number(&mut self) -> R<()> {
        let lo = self.pos;
        if self.src[self.pos] == b'0' && matches!(self.peek(1) | 0x20, b'x' | b'o' | b'b') {
            self.pos += 2;
            while self.pos < self.end
                && (self.src[self.pos].is_ascii_hexdigit() || self.src[self.pos] == b'_')
            {
                self.pos += 1;
            }
        } else {
            while self.pos < self.end
                && (self.src[self.pos].is_ascii_digit() || self.src[self.pos] == b'_')
            {
                self.pos += 1;
            }
            if self.peek(0) == b'.' {
                self.pos += 1;
                while self.pos < self.end
                    && (self.src[self.pos].is_ascii_digit() || self.src[self.pos] == b'_')
                {
                    self.pos += 1;
                }
            }
            if self.peek(0) | 0x20 == b'e' {
                self.pos += 1;
                if matches!(self.peek(0), b'+' | b'-') {
                    self.pos += 1;
                }
                while self.pos < self.end && self.src[self.pos].is_ascii_digit() {
                    self.pos += 1;
                }
            }
        }
        if self.peek(0) == b'n' {
            self.pos += 1;
            return self.err("bigint literals are not supported", lo);
        }
        if self.pos < self.end && is_id_start(self.src[self.pos]) {
            return self.err("identifier directly after number", lo);
        }
        Ok(())
    }

    fn string(&mut self, q: u8) -> R<()> {
        let lo = self.pos;
        self.pos += 1;
        while self.pos < self.end {
            match self.src[self.pos] {
                b'\\' => self.pos += 2,
                b'\n' => return self.err("unterminated string", lo),
                c if c == q => {
                    self.pos += 1;
                    return Ok(());
                }
                _ => self.pos += 1,
            }
        }
        self.err("unterminated string", lo)
    }

    /// Reads template characters up to and including a backtick (returns true) or `${` (returns
    /// false).
    fn template_chars(&mut self) -> R<bool> {
        let lo = self.pos;
        while self.pos < self.end {
            match self.src[self.pos] {
                b'\\' => self.pos += 2,
                b'`' => {
                    self.pos += 1;
                    return Ok(true);
                }
                b'$' if self.peek(1) == b'{' => {
                    self.pos += 2;
                    return Ok(false);
                }
                _ => self.pos += 1,
            }
        }
        self.err("unterminated template literal", lo)
    }

    /// Continues a template after the `}` closing a substitution; `pos` must be just past the `}`.
    ///
    /// # Errors
    ///
    /// [`LexError`] if the template is not terminated.
    pub fn template_continue(&mut self, rbrace: Span) -> R<Tok> {
        self.pos = rbrace.hi as usize;
        let tail = self.template_chars()?;
        Ok(Tok {
            t: T::Template { tail },
            span: Span::new(rbrace.lo, self.pos as u32),
            nl_before: false,
        })
    }

    /// Re-lexes a `/` or `/=` token at `slash` as a regular expression literal.
    ///
    /// # Errors
    ///
    /// [`LexError`] if the literal is not terminated before the end of its line.
    pub fn regex(&mut self, slash: Span) -> R<Tok> {
        let lo = slash.lo as usize;
        self.pos = lo + 1;
        let mut in_class = false;
        loop {
            if self.pos >= self.end || self.src[self.pos] == b'\n' {
                return self.err("unterminated regular expression", lo);
            }
            match self.src[self.pos] {
                b'\\' => self.pos += 2,
                b'[' => {
                    in_class = true;
                    self.pos += 1;
                }
                b']' => {
                    in_class = false;
                    self.pos += 1;
                }
                b'/' if !in_class => {
                    self.pos += 1;
                    break;
                }
                _ => self.pos += 1,
            }
        }
        while self.pos < self.end && is_id_continue(self.src[self.pos]) {
            self.pos += 1;
        }
        Ok(Tok {
            t: T::Regex,
            span: Span::new(lo as u32, self.pos as u32),
            nl_before: false,
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
                let src = std::str::from_utf8(s).expect("ASCII");
                let got = Lexer::new(src, 0, src.len()).punct(b);
                assert_eq!(got, by_table(s), "{src:?}");
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
