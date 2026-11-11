//! `PostCSS`'s tokenizer, with `postcss-scss`'s and the template tokenizer's changes.

use super::{Kind, Parser, R, Token, thrown};

impl Parser<'_> {
    /// The next token; in safe mode, a `{…}` with what it holds is one word.
    pub(super) fn next_token(&mut self) -> R<Option<Token>> {
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
        let mut recorded_end = first.recorded_end;
        while open != 0
            && let Some(next) = self.raw_token()?
        {
            open += depth(next);
            end = next.end;
            // A space has no position, so the word's recorded end stays at the token before it.
            if next.kind != Kind::Space {
                recorded_end = next.recorded_end;
            }
        }
        Ok(Some(Token {
            kind: Kind::Word,
            start: first.start,
            end,
            recorded_end,
        }))
    }

    #[expect(
        clippy::too_many_lines,
        reason = "one arm per token kind, as `PostCSS` reads them"
    )]
    pub(super) fn raw_token(&mut self) -> R<Option<Token>> {
        if let Some(token) = self.returned.pop() {
            return Ok(Some(token));
        }
        let position = self.position;
        let Some(c) = self.byte(position) else {
            return Ok(None);
        };
        let scss = self.scss();
        let ignore = !self.strict();
        let next = self.byte(position + 1);
        Ok(Some(match c {
            c if is_space(c) => {
                let end = (position..self.end)
                    .find(|&i| !is_space(self.b[i]))
                    .unwrap_or(self.end);
                self.token(Kind::Space, position, end)
            }
            b'[' | b'{' => self.token(Kind::Open(c), position, position + 1),
            b']' | b'}' | b')' => self.token(Kind::Close(c), position, position + 1),
            b':' => self.token(Kind::Colon, position, position + 1),
            b';' => self.token(Kind::Semicolon, position, position + 1),
            b',' if scss => {
                let mut comma = self.token(Kind::Word, position, position + 1);
                comma.recorded_end += 1;
                comma
            }
            b'(' => {
                let url = self.words.pop().is_some_and(|w| self.text(w) == "url");
                if url && scss && !matches!(next, Some(b'\'' | b'"')) {
                    let mut depth = 1;
                    let mut at = position + 1;
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
                    self.token(Kind::Brackets, position, (at + 1).min(self.end))
                } else if url
                    && !scss
                    && next.is_none_or(|n| !is_space(n) && n != b'\'' && n != b'"')
                {
                    match self.closing(position, b')') {
                        Some(close) => self.token(Kind::Brackets, position, close + 1),
                        None if ignore => self.token(Kind::Brackets, position, position + 1),
                        None => return thrown("Unclosed bracket", position as u32),
                    }
                } else if !scss && self.last_bad_paren.is_some_and(|bad| position <= bad) {
                    self.token(Kind::Open(b'('), position, position + 1)
                } else {
                    let close = self.next_close(position + 1);
                    match close {
                        Some(close)
                            if self.next_bad(position + 1).is_none_or(|bad| bad > close) =>
                        {
                            self.token(Kind::Brackets, position, close + 1)
                        }
                        _ => {
                            self.last_bad_paren = Some(close.unwrap_or(self.end));
                            self.token(Kind::Open(b'('), position, position + 1)
                        }
                    }
                }
            }
            b'\'' | b'"' => {
                let close = if scss {
                    self.scss_string(position, c)?
                } else {
                    self.closing(position, c)
                };
                match close {
                    Some(close) => self.token(Kind::String, position, close + 1),
                    None if ignore => {
                        let end = if position + 1 < self.end {
                            self.char_end(position + 1)
                        } else {
                            self.end
                        };
                        self.token(Kind::String, position, end)
                    }
                    None => return thrown("Unclosed string", position as u32),
                }
            }
            b'@' => {
                let end = (position + 1..self.end)
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
                self.token(Kind::AtWord, position, end.max(position + 1))
            }
            b'\\' => {
                let mut at = position;
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
                self.token(Kind::Word, position, end)
            }
            b'#' if scss && next == Some(b'{') => {
                let end = self.interpolation(position, position)?;
                self.token(Kind::Word, position, end + 1)
            }
            b'/' if next == Some(b'*') => {
                let close = self.find(position + 2, |i| self.b[i..].starts_with(b"*/"));
                match close {
                    Some(close) => self.token(Kind::Comment, position, close + 2),
                    None if ignore => self.token(Kind::Comment, position, self.end),
                    None => return thrown("Unclosed comment", position as u32),
                }
            }
            b'/' if scss && next == Some(b'/') => {
                let end = (position + 1..self.end)
                    .find(|&i| matches!(self.b[i], b'\n' | 0x0C | b'\r'))
                    .unwrap_or(self.end);
                self.token(Kind::InlineComment, position, end)
            }
            _ => {
                let end = self.word_end(position + 1);
                let token = self.token(Kind::Word, position, end);
                self.words.push(token);
                token
            }
        }))
    }

    /// The end of the character at `at`, which may be multibyte.
    pub(super) fn char_end(&self, at: usize) -> usize {
        self.source[at..self.end]
            .chars()
            .next()
            .map_or(at + 1, |c| at + c.len_utf8())
    }

    pub(super) fn word_end(&self, from: usize) -> usize {
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
    pub(super) fn next_close(&mut self, from: usize) -> Option<usize> {
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
    pub(super) fn next_bad(&mut self, from: usize) -> Option<usize> {
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
    pub(super) fn scss_string(&self, position: usize, quote: u8) -> R<Option<usize>> {
        let mut at = position;
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
                at = self.interpolation(position, at)?;
            }
        }
    }

    /// The `}` that closes the `#{` at `at`; `token` is where the token starts, for the error.
    pub(super) fn interpolation(&self, token: usize, at: usize) -> R<usize> {
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
}

const fn is_space(c: u8) -> bool {
    matches!(c, b' ' | b'\n' | b'\t' | b'\r' | 0x0C)
}
