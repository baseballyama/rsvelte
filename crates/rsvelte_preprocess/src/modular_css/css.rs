//! Minimal CSS scanner shared by the native modular-css processor — splits a
//! stylesheet into rules / `@value` / `@import` / other, and a rule body into
//! declarations, preserving the source text and indentation needed to re-emit
//! output byte-for-byte like `@modular-css/processor`.

/// Advance past a `/* … */` comment or a string literal at `i`; else `None`.
pub fn skip_trivia(s: &str, i: usize) -> Option<usize> {
    let b = s.as_bytes();
    if i + 1 < b.len() && b[i] == b'/' && b[i + 1] == b'*' {
        let mut j = i + 2;
        while j + 1 < b.len() && !(b[j] == b'*' && b[j + 1] == b'/') {
            j += 1;
        }
        return Some((j + 2).min(b.len()));
    }
    if b[i] == b'"' || b[i] == b'\'' {
        let q = b[i];
        let mut j = i + 1;
        while j < b.len() {
            if b[j] == b'\\' {
                j += 2;
                continue;
            }
            if b[j] == q {
                return Some(j + 1);
            }
            j += 1;
        }
        return Some(b.len());
    }
    None
}

fn find_matching_brace(s: &str, open: usize) -> usize {
    let b = s.as_bytes();
    let mut depth = 0i32;
    let mut i = open;
    while i < b.len() {
        if let Some(n) = skip_trivia(s, i) {
            i = n;
            continue;
        }
        match b[i] {
            b'{' => depth += 1,
            b'}' => {
                depth -= 1;
                if depth == 0 {
                    return i;
                }
            }
            _ => {}
        }
        i += 1;
    }
    b.len()
}

/// A top-level item in a stylesheet.
///
/// `Value` / `Other` carry their source for completeness; the current consumer
/// only acts on `Rule`, so their payloads may be unread.
#[derive(Debug)]
#[allow(dead_code)]
pub enum Item<'a> {
    /// `@value name: value;` — `(name, value)`.
    Value(&'a str, &'a str),
    /// A style rule — `(selector, body_inner)`.
    Rule(&'a str, &'a str),
    /// Anything else (comments, `@import`, at-rules) preserved verbatim.
    Other(&'a str),
}

/// Split a stylesheet into top-level items.
pub fn parse_items(s: &str) -> Vec<Item<'_>> {
    let b = s.as_bytes();
    let mut items = Vec::new();
    let mut i = 0;
    while i < s.len() {
        if let Some(n) = skip_trivia(s, i) {
            i = n;
            continue;
        }
        if b[i].is_ascii_whitespace() {
            i += 1;
            continue;
        }

        // Scan a statement to a top-level `{` or `;`.
        let start = i;
        let mut j = i;
        let mut delim = b';';
        while j < s.len() {
            if let Some(n) = skip_trivia(s, j) {
                j = n;
                continue;
            }
            match b[j] {
                b'{' | b';' => {
                    delim = b[j];
                    break;
                }
                _ => j += 1,
            }
        }

        if delim == b'{' && j < s.len() {
            let close = find_matching_brace(s, j);
            let prelude = s[start..j].trim();
            if prelude.starts_with('@') {
                items.push(Item::Other(&s[start..(close + 1).min(s.len())]));
            } else {
                items.push(Item::Rule(prelude, &s[j + 1..close]));
            }
            i = close + 1;
        } else {
            let stmt = s[start..j.min(s.len())].trim();
            if let Some(rest) = stmt.strip_prefix("@value") {
                if let Some((name, value)) = rest.trim().split_once(':') {
                    items.push(Item::Value(name.trim(), value.trim()));
                } else {
                    items.push(Item::Other(&s[start..j.min(s.len())]));
                }
            } else if !stmt.is_empty() {
                items.push(Item::Other(&s[start..j.min(s.len())]));
            }
            i = (j + 1).min(s.len());
        }
    }
    items
}

/// A declaration inside a rule body.
#[derive(Debug)]
pub struct Decl {
    /// The full leading whitespace before the declaration (since the previous
    /// `;` / `{`), used to re-emit the body with original formatting.
    pub before: String,
    /// The declaration text, from the first non-whitespace char through `;`.
    pub text: String,
    /// Property name (text before the first `:`), trimmed.
    pub prop: String,
}

impl Decl {
    /// The indentation portion of `before` (whitespace after the last newline).
    pub fn indent(&self) -> &str {
        match self.before.rfind('\n') {
            Some(i) => &self.before[i + 1..],
            None => &self.before,
        }
    }
}

/// Parse a rule body into declarations + the closing whitespace (before `}`).
pub fn parse_body(inner: &str) -> (Vec<Decl>, String) {
    let b = inner.as_bytes();
    let mut decls = Vec::new();
    let mut i = 0;
    let mut last_end = 0;
    while i < inner.len() {
        if let Some(n) = skip_trivia(inner, i) {
            i = n;
            continue;
        }
        if b[i] == b';' {
            let raw = &inner[last_end..i + 1];
            push_decl(raw, &mut decls);
            last_end = i + 1;
        }
        i += 1;
    }
    // Trailing content after the last `;` is the closing whitespace (or a final
    // declaration without a semicolon).
    let tail = &inner[last_end..];
    if tail.trim().is_empty() {
        (decls, tail.to_string())
    } else {
        push_decl(tail, &mut decls);
        (decls, String::new())
    }
}

fn push_decl(raw: &str, decls: &mut Vec<Decl>) {
    let trimmed_start = raw.len() - raw.trim_start().len();
    let before = raw[..trimmed_start].to_string();
    let text = raw.trim().to_string();
    if text.is_empty() {
        return;
    }
    let prop = text.split(':').next().unwrap_or("").trim().to_string();
    decls.push(Decl { before, text, prop });
}
