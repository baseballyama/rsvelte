//! A byte-oriented, pull-based lexer. It is `Copy`, so speculative lookahead (arrow-function
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

#[derive(Clone, Copy, Debug)]
pub struct Tok {
    pub t: T,
    pub span: Span,
    /// A line terminator appeared between the previous token and this one (for ASI).
    pub nl_before: bool,
}

#[derive(Clone, Copy)]
pub struct Lexer<'a> {
    src: &'a [u8],
    pub pos: usize,
    end: usize,
}

pub struct LexError {
    pub message: String,
    pub span: Span,
}

type R<T> = Result<T, LexError>;

fn is_id_start(b: u8) -> bool {
    b.is_ascii_alphabetic() || b == b'_' || b == b'$' || b >= 0x80
}

fn is_id_continue(b: u8) -> bool {
    is_id_start(b) || b.is_ascii_digit()
}

const OPS: &[&str] = &[
    ">>>=", "...", "===", "!==", "**=", "<<=", ">>=", ">>>", "&&=", "||=", "??=", "=>", "==", "!=",
    "<=", ">=", "&&", "||", "??", "?.", "++", "--", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=",
    "<<", ">>", "**", "{", "}", "(", ")", "[", "]", ";", ",", "<", ">", "+", "-", "*", "/", "%",
    "&", "|", "^", "!", "~", "?", ":", "=", ".", "@",
];

impl<'a> Lexer<'a> {
    pub fn new(src: &'a str, start: usize, end: usize) -> Lexer<'a> {
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
    fn peek(&self, off: usize) -> u8 {
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
                b' ' | b'\t' | b'\r' | 0x0b | 0x0c => self.pos += 1,
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
                0xe2 if self.peek(1) == 0x80 && matches!(self.peek(2), 0xa8 | 0xa9) => {
                    nl = true;
                    self.pos += 3;
                }
                0xc2 if self.peek(1) == 0xa0 => self.pos += 2,
                0xef if self.peek(1) == 0xbb && self.peek(2) == 0xbf => self.pos += 3,
                _ => break,
            }
        }
        Ok(nl)
    }

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
        for op in OPS {
            if self.src[self.pos..self.end].starts_with(op.as_bytes()) {
                // `?.` followed by a digit is a conditional with a decimal, not optional chaining.
                if *op == "?." && self.peek(2).is_ascii_digit() {
                    continue;
                }
                self.pos += op.len();
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
                return Ok(mk(t, self.pos));
            }
        }
        self.pos += 1;
        self.err(format!("unexpected character `{}`", b as char), lo)
    }

    fn ident_tail(&mut self) -> R<()> {
        while self.pos < self.end {
            let b = self.src[self.pos];
            if b >= 0x80 {
                // Non-ASCII identifier chars are accepted as-is; separators are handled in trivia.
                let ch_len = match b {
                    0xc0..=0xdf => 2,
                    0xe0..=0xef => 3,
                    _ => 4,
                };
                if b == 0xe2 && self.peek(1) == 0x80 && matches!(self.peek(2), 0xa8 | 0xa9) {
                    break;
                }
                if b == 0xc2 && self.peek(1) == 0xa0 {
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

    /// Reads template characters up to and including '`' (returns true) or '${' (returns false).
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
            Some('\n') | Some('\u{2028}') | Some('\u{2029}') => {}
            Some(other) => out.push(other),
            None => {}
        }
    }
    Some(out)
}
