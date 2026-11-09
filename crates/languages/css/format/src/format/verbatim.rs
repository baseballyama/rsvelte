//! Whether prettier's postcss printer keeps a piece of CSS as written, after whitespace collapses
//! to one space. Each check accepts only shapes measured to stay unchanged; prettier rewrites the
//! rest (number forms, hex case, quotes, comma and parenthesis spacing, keyword case), which this
//! printer does not port yet.

/// A declaration value, whitespace already collapsed: words, numbers, lowercase hex colors,
/// double-quoted strings and lowercase function calls, between single spaces, `, `, ` / `,
/// ` + ` or ` - `, with an optional ` !important`.
pub(super) fn value(t: &str) -> bool {
    let body = t.strip_suffix(" !important").unwrap_or(t);
    // A top-level list breaks one item per line unless every item is one word.
    let mut depth = 0_u32;
    let (mut comma, mut spaced) = (false, false);
    let mut in_string = false;
    for (i, c) in body.bytes().enumerate() {
        match c {
            b'"' => in_string = !in_string,
            _ if in_string => {}
            b'(' => depth += 1,
            b')' => depth = depth.saturating_sub(1),
            b',' if depth == 0 => comma = true,
            b' ' | b'/' if depth == 0 && (i == 0 || body.as_bytes()[i - 1] != b',') => {
                spaced = true;
            }
            // `-webkit-box` and `-1px` are an operator and a word to prettier here.
            b'-' if depth == 0 && (i == 0 || body.as_bytes()[i - 1] == b' ') => spaced = true,
            _ => {}
        }
    }
    if comma && spaced {
        return false;
    }
    let mut p = Scan {
        b: body.as_bytes(),
        i: 0,
    };
    p.sequence(false) && p.i == p.b.len()
}

/// An at-rule's name or prelude: lowercase words, numbers, strings, `url(…)` and
/// `(feature: value)` groups between single spaces or `, `.
pub(super) fn prelude(t: &str) -> bool {
    if t.bytes().any(|c| c.is_ascii_uppercase()) {
        return false;
    }
    let mut p = Scan {
        b: t.as_bytes(),
        i: 0,
    };
    loop {
        let ok = if p.peek() == Some(b'(') {
            p.i += 1;
            p.word() && p.eat(b": ") && p.sequence(false) && p.eat(b")")
        } else {
            p.token()
        };
        if !ok {
            return false;
        }
        if p.i == p.b.len() {
            return true;
        }
        if !(p.eat(b", ") || p.eat(b" ")) {
            return false;
        }
    }
}

/// A cursor over collapsed CSS text.
struct Scan<'b> {
    b: &'b [u8],
    i: usize,
}

impl Scan<'_> {
    fn peek(&self) -> Option<u8> {
        self.b.get(self.i).copied()
    }

    fn eat(&mut self, s: &[u8]) -> bool {
        let found = self.b[self.i..].starts_with(s);
        if found {
            self.i += s.len();
        }
        found
    }

    /// Tokens and separators; inside a function `*` may also separate, spaced.
    fn sequence(&mut self, in_function: bool) -> bool {
        loop {
            let number = self.peek().is_some_and(|c| c.is_ascii_digit() || c == b'-');
            let start = self.i;
            if !self.token() {
                return false;
            }
            let was_number = number && self.b[start..self.i].iter().any(u8::is_ascii_digit);
            // `1px/2px`: an unspaced `/` stays between two numbers.
            if was_number
                && self.eat(b"/")
                && !(self.peek().is_some_and(|c| c.is_ascii_digit()) && self.token())
            {
                return false;
            }
            let separated = self.eat(b", ")
                || self.eat(b" / ")
                || self.eat(b" + ")
                || self.eat(b" - ")
                || (in_function && self.eat(b" * "))
                || (self.peek() == Some(b' ') && {
                    self.i += 1;
                    true
                });
            if !separated {
                return true;
            }
        }
    }

    /// One word, number, hex color, string or function call.
    fn token(&mut self) -> bool {
        match self.peek() {
            Some(b'"') => {
                let Some(end) = self.b[self.i + 1..].iter().position(|&c| c == b'"') else {
                    return false;
                };
                let inner = &self.b[self.i + 1..self.i + 1 + end];
                self.i += end + 2;
                !inner.iter().any(|&c| matches!(c, b'\\' | b'\''))
            }
            Some(b'#') => {
                self.i += 1;
                let start = self.i;
                while self
                    .peek()
                    .is_some_and(|c| c.is_ascii_lowercase() || c.is_ascii_digit())
                {
                    self.i += 1;
                }
                self.i > start && !self.peek().is_some_and(is_ident)
            }
            Some(c)
                if c.is_ascii_digit()
                    || (c == b'-' && self.b.get(self.i + 1).is_some_and(u8::is_ascii_digit)) =>
            {
                let digits = self.i + usize::from(c == b'-');
                match number(self.b, digits) {
                    Some(end) => {
                        self.i = end;
                        true
                    }
                    None => false,
                }
            }
            Some(_) => {
                let start = self.i;
                if !self.word() {
                    return false;
                }
                if self.peek() != Some(b'(') {
                    return true;
                }
                let name = &self.b[start..self.i];
                if name.iter().any(u8::is_ascii_uppercase) {
                    return false;
                }
                self.i += 1;
                if name == b"url" && self.peek() != Some(b'"') {
                    let begin = self.i;
                    while self.peek().is_some_and(|c| {
                        c.is_ascii_alphanumeric() || matches!(c, b'.' | b'/' | b':' | b'-' | b'_')
                    }) {
                        self.i += 1;
                    }
                    return self.i > begin && self.eat(b")");
                }
                self.sequence(true) && self.eat(b")")
            }
            None => false,
        }
    }

    /// `-{0,2}` and a name of letters, digits, `_` and `-`.
    fn word(&mut self) -> bool {
        let start = self.i;
        while self.peek() == Some(b'-') && self.i - start < 2 {
            self.i += 1;
        }
        if !self
            .peek()
            .is_some_and(|c| c.is_ascii_alphabetic() || c == b'_')
        {
            return false;
        }
        while self
            .peek()
            .is_some_and(|c| c.is_ascii_alphanumeric() || matches!(c, b'_' | b'-'))
        {
            self.i += 1;
        }
        true
    }
}

/// One compound selector as written, between combinators.
pub(super) fn compound(t: &str) -> bool {
    // `--y:{…}` reads as a rule whose selector is `--y:`; prettier prints a custom property.
    if t.contains(['\'', '\\', '\t', '\n', '\r', '\x0C']) || t.contains("  ") || t.starts_with("--")
    {
        return false;
    }
    let b = t.as_bytes();
    // A selector word read as a number gets its unit rewritten (`1q` prints `1Q`).
    if b.first().is_some_and(u8::is_ascii_digit)
        || b.first() == Some(&b'-') && b.get(1).is_some_and(u8::is_ascii_digit)
    {
        return false;
    }
    let mut i = 0;
    while i < b.len() {
        let prev = i.checked_sub(1).map(|j| b[j]);
        match b[i] {
            b':' => {
                let start = i + usize::from(b.get(i + 1) == Some(&b':')) + 1;
                let mut end = start;
                while end < b.len() && is_ident(b[end]) {
                    if b[end].is_ascii_uppercase() {
                        return false;
                    }
                    end += 1;
                }
                if end == start {
                    return false;
                }
                if t[start..end].starts_with("nth-") && b.get(end) == Some(&b'(') {
                    let Some(close) = t[end..].find(')') else {
                        return false;
                    };
                    if !nth(&t[end + 1..end + close]) {
                        return false;
                    }
                    i = end + close + 1;
                    continue;
                }
                i = end;
                continue;
            }
            b'[' => {
                let Some(close) = t[i..].find(']') else {
                    return false;
                };
                if !attribute(&t[i + 1..i + close]) {
                    return false;
                }
                i += close + 1;
                continue;
            }
            b',' if b.get(i + 1) != Some(&b' ') || prev == Some(b' ') => return false,
            b'>' | b'+' | b'~' => return false,
            b'(' if b.get(i + 1) == Some(&b' ') => return false,
            b')' if prev == Some(b' ') => return false,
            _ => {}
        }
        i += 1;
    }
    true
}

/// A keyframe selector: prettier lowercases it and puts each of a list on its own line.
pub(super) fn keyframe(t: &str) -> bool {
    !t.contains(',') && !t.bytes().any(|c| c.is_ascii_uppercase()) && value(t)
}

const fn is_ident(c: u8) -> bool {
    c.is_ascii_alphanumeric() || c == b'_' || c == b'-' || c >= 0x80
}

/// The end of a number and its unit that prettier prints as written: no leading or trailing
/// zero, no exponent, a lowercase unit.
fn number(b: &[u8], mut i: usize) -> Option<usize> {
    if b[i] == b'0' && b.get(i + 1).is_some_and(u8::is_ascii_digit) {
        return None;
    }
    while i < b.len() && b[i].is_ascii_digit() {
        i += 1;
    }
    if b.get(i) == Some(&b'.') {
        i += 1;
        let start = i;
        while i < b.len() && b[i].is_ascii_digit() {
            i += 1;
        }
        if i == start || b[i - 1] == b'0' {
            return None;
        }
    }
    if matches!(b.get(i), Some(b'e' | b'E'))
        && b.get(i + 1)
            .is_some_and(|c| c.is_ascii_digit() || matches!(c, b'+' | b'-'))
    {
        return None;
    }
    // Prettier prints the `q` unit as `Q`.
    let unit = i;
    while i < b.len() && (is_ident(b[i]) || b[i] == b'%') {
        if b[i].is_ascii_uppercase() || b[i] == b'.' {
            return None;
        }
        i += 1;
    }
    (b.get(i) != Some(&b'.') && &b[unit..i] != b"q").then_some(i)
}

/// The inside of `[…]`: a name, or a name, an operator and a double-quoted value.
fn attribute(t: &str) -> bool {
    let (name, value) = t.find('=').map_or((t, None), |at| {
        let op = t[..at].trim_end_matches(['~', '|', '^', '$', '*']);
        (op, Some(&t[at + 1..]))
    });
    !name.is_empty()
        && name.bytes().all(is_ident)
        && value.is_none_or(|v| {
            v.len() >= 2
                && v.starts_with('"')
                && v.ends_with('"')
                && !v[1..v.len() - 1].contains(['"', '\\'])
        })
}

/// An `:nth-*()` argument prettier keeps: a keyword, an integer, or `An + B` spaced.
fn nth(t: &str) -> bool {
    let digits = |s: &str| !s.is_empty() && s.bytes().all(|c| c.is_ascii_digit());
    if matches!(t, "odd" | "even") || digits(t) {
        return true;
    }
    let (a, b) = match t.split_once(" + ").or_else(|| t.split_once(" - ")) {
        Some((a, b)) => (a, Some(b)),
        None => (t, None),
    };
    let a = a.strip_prefix('-').unwrap_or(a);
    a.strip_suffix('n')
        .is_some_and(|k| k.is_empty() || digits(k))
        && b.is_none_or(digits)
}

#[cfg(test)]
mod tests;
