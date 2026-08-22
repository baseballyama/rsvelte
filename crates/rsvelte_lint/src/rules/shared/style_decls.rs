//! Shared style-attribute CSS model for the inline-`style` rule family
//! (`no-dupe-style-properties`, `no-shorthand-style-property-overrides`,
//! `prefer-style-directive`, `require-optimized-style-attribute`).
//!
//! Faithful port of upstream's `utils/css-utils/style-attribute.ts` pipeline:
//! the postcss tokenizer (`ignoreErrors`), the `template-tokenize` wrapper that
//! glues `{ … }` mustache spans into single `word` tokens, the
//! `postcss-safe-parser` declaration/comment parsing subset, and
//! `parseStyleAttributeValue`'s conversion that classifies each mustache tag as
//! an inline node or a prop/value/unknown interpolation of a declaration.
//!
//! All offsets are byte offsets; every length used for range arithmetic is the
//! byte length of the same source substring upstream measures in UTF-16 code
//! units, so the resulting spans coincide.

use std::collections::VecDeque;

use serde_json::Value;

use rsvelte_core::ast::template::{AttributeValue, AttributeValuePart};

fn source_offset(value: usize) -> u32 {
    u32::try_from(value).expect("source offsets are represented as u32")
}

// ── Tokenizer (postcss/lib/tokenize.js, ignoreErrors) ─────────────────────────

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum TokKind {
    Space,
    OpenSquare,
    CloseSquare,
    OpenCurly,
    CloseCurly,
    Colon,
    Semicolon,
    OpenParen,
    CloseParen,
    Brackets,
    Str,
    AtWord,
    Word,
    Comment,
}

#[derive(Clone, Debug)]
struct Tok {
    kind: TokKind,
    text: Vec<u8>,
    /// `token[2]` — start position.
    pos: Option<usize>,
    /// `token[3]` — inclusive end position.
    end: Option<usize>,
}

/// JS `a || b` over positions: `0` is falsy.
fn js_or(a: Option<usize>, b: Option<usize>) -> Option<usize> {
    a.filter(|&p| p != 0).or_else(|| b.filter(|&p| p != 0))
}

const fn is_css_space(b: u8) -> bool {
    matches!(b, b' ' | b'\n' | b'\t' | b'\r' | b'\x0c')
}

fn is_word_end(b: u8) -> bool {
    matches!(
        b,
        b'\t'
            | b'\n'
            | b'\x0c'
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
    )
}

fn is_at_end(b: u8) -> bool {
    matches!(
        b,
        b'\t'
            | b'\n'
            | b'\x0c'
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
}

/// `RE_BAD_BRACKET = /.[\r\n"'(/\\]/` — a class char at index ≥ 1 whose
/// predecessor is not a line terminator (JS `.` excludes `\r`/`\n`).
fn bad_bracket(content: &[u8]) -> bool {
    content.windows(2).any(|w| {
        !matches!(w[0], b'\r' | b'\n')
            && matches!(w[1], b'\r' | b'\n' | b'"' | b'\'' | b'(' | b'/' | b'\\')
    })
}

fn find_byte(hay: &[u8], needle: u8, from: usize) -> Option<usize> {
    if from >= hay.len() {
        return None;
    }
    hay[from..]
        .iter()
        .position(|&b| b == needle)
        .map(|i| from + i)
}

fn find_bytes2(hay: &[u8], a: u8, b: u8, from: usize) -> Option<usize> {
    let mut i = from;
    while i + 1 < hay.len() {
        if hay[i] == a && hay[i + 1] == b {
            return Some(i);
        }
        i += 1;
    }
    None
}

struct RawTokenizer<'s> {
    css: &'s [u8],
    pos: usize,
    /// JS `buffer`: pushed plain word tokens, popped by `(` for the `url(` check.
    buffer: Vec<Vec<u8>>,
    returned: Vec<Tok>,
    last_bad_paren: Option<usize>,
}

impl<'s> RawTokenizer<'s> {
    fn new(css: &'s [u8]) -> Self {
        Self {
            css,
            pos: 0,
            buffer: Vec::new(),
            returned: Vec::new(),
            last_bad_paren: None,
        }
    }

    fn end_of_file(&self) -> bool {
        self.returned.is_empty() && self.pos >= self.css.len()
    }

    fn back(&mut self, tok: Tok) {
        self.returned.push(tok);
    }

    fn slice(&self, start: usize, end: usize) -> Vec<u8> {
        let len = self.css.len();
        self.css[start.min(len)..end.min(len)].to_vec()
    }

    #[allow(clippy::too_many_lines)]
    fn next_token(&mut self) -> Option<Tok> {
        if let Some(t) = self.returned.pop() {
            return Some(t);
        }
        let css = self.css;
        let length = css.len();
        if self.pos >= length {
            return None;
        }
        let pos = self.pos;
        let code = css[pos];

        let tok = match code {
            b'\n' | b' ' | b'\t' | b'\r' | b'\x0c' => {
                let mut next = pos;
                loop {
                    next += 1;
                    if next >= length || !is_css_space(css[next]) {
                        break;
                    }
                }
                self.pos = next - 1;
                Tok {
                    kind: TokKind::Space,
                    text: self.slice(pos, next),
                    pos: None,
                    end: None,
                }
            }
            b'[' | b']' | b'{' | b'}' | b':' | b';' | b')' => {
                let kind = match code {
                    b'[' => TokKind::OpenSquare,
                    b']' => TokKind::CloseSquare,
                    b'{' => TokKind::OpenCurly,
                    b'}' => TokKind::CloseCurly,
                    b':' => TokKind::Colon,
                    b';' => TokKind::Semicolon,
                    _ => TokKind::CloseParen,
                };
                Tok {
                    kind,
                    text: vec![code],
                    pos: Some(pos),
                    end: None,
                }
            }
            b'(' => {
                let prev = self.buffer.pop().unwrap_or_default();
                let n = css.get(pos + 1).copied();
                if prev == b"url"
                    && !matches!(n, Some(b'\'' | b'"') | None)
                    && !n.is_some_and(is_css_space)
                {
                    let mut next = pos;
                    loop {
                        let mut escaped = false;
                        match find_byte(css, b')', next + 1) {
                            Some(found) => next = found,
                            None => {
                                next = pos;
                                break;
                            }
                        }
                        let mut escape_pos = next;
                        while escape_pos > 0 && css[escape_pos - 1] == b'\\' {
                            escape_pos -= 1;
                            escaped = !escaped;
                        }
                        if !escaped {
                            break;
                        }
                    }
                    self.pos = next;
                    Tok {
                        kind: TokKind::Brackets,
                        text: self.slice(pos, next + 1),
                        pos: Some(pos),
                        end: Some(next),
                    }
                } else if self.last_bad_paren.is_some_and(|bad| pos <= bad) {
                    Tok {
                        kind: TokKind::OpenParen,
                        text: vec![b'('],
                        pos: Some(pos),
                        end: None,
                    }
                } else {
                    let found = find_byte(css, b')', pos + 1)
                        .map(|n| (n, self.slice(pos, n + 1)))
                        .filter(|(_, content)| !bad_bracket(content));
                    if let Some((next, content)) = found {
                        self.pos = next;
                        Tok {
                            kind: TokKind::Brackets,
                            text: content,
                            pos: Some(pos),
                            end: Some(next),
                        }
                    } else {
                        self.last_bad_paren = Some(find_byte(css, b')', pos + 1).unwrap_or(length));
                        Tok {
                            kind: TokKind::OpenParen,
                            text: vec![b'('],
                            pos: Some(pos),
                            end: None,
                        }
                    }
                }
            }
            b'\'' | b'"' => {
                let quote = code;
                let mut next = pos;
                loop {
                    let mut escaped = false;
                    match find_byte(css, quote, next + 1) {
                        Some(found) => next = found,
                        None => {
                            next = pos + 1;
                            break;
                        }
                    }
                    let mut escape_pos = next;
                    while escape_pos > 0 && css[escape_pos - 1] == b'\\' {
                        escape_pos -= 1;
                        escaped = !escaped;
                    }
                    if !escaped {
                        break;
                    }
                }
                self.pos = next;
                Tok {
                    kind: TokKind::Str,
                    text: self.slice(pos, next + 1),
                    pos: Some(pos),
                    end: Some(next),
                }
            }
            b'@' => {
                let next = match (pos + 1..length).find(|&i| is_at_end(css[i])) {
                    Some(m) => m - 1,
                    None => length - 1,
                };
                self.pos = next;
                Tok {
                    kind: TokKind::AtWord,
                    text: self.slice(pos, next + 1),
                    pos: Some(pos),
                    end: Some(next),
                }
            }
            b'\\' => {
                let mut next = pos;
                let mut escape = true;
                while next + 1 < length && css[next + 1] == b'\\' {
                    next += 1;
                    escape = !escape;
                }
                let code2 = css.get(next + 1).copied();
                if escape && !matches!(code2, Some(b'/' | b' ' | b'\n' | b'\t' | b'\r' | b'\x0c')) {
                    next += 1;
                    if css
                        .get(next)
                        .copied()
                        .is_some_and(|b| b.is_ascii_hexdigit())
                    {
                        while css
                            .get(next + 1)
                            .copied()
                            .is_some_and(|b| b.is_ascii_hexdigit())
                        {
                            next += 1;
                        }
                        if css.get(next + 1).copied() == Some(b' ') {
                            next += 1;
                        }
                    }
                }
                self.pos = next;
                Tok {
                    kind: TokKind::Word,
                    text: self.slice(pos, next + 1),
                    pos: Some(pos),
                    end: Some(next),
                }
            }
            _ => {
                if code == b'/' && css.get(pos + 1).copied() == Some(b'*') {
                    let next = match find_bytes2(css, b'*', b'/', pos + 2) {
                        Some(star) => star + 1,
                        None => length,
                    };
                    self.pos = next;
                    Tok {
                        kind: TokKind::Comment,
                        text: self.slice(pos, next + 1),
                        pos: Some(pos),
                        end: Some(next),
                    }
                } else {
                    let next = match (pos + 1..length).find(|&i| {
                        is_word_end(css[i])
                            || (css[i] == b'/' && css.get(i + 1).copied() == Some(b'*'))
                    }) {
                        Some(m) => m - 1,
                        None => length - 1,
                    };
                    let text = self.slice(pos, next + 1);
                    self.buffer.push(text.clone());
                    self.pos = next;
                    Tok {
                        kind: TokKind::Word,
                        text,
                        pos: Some(pos),
                        end: Some(next),
                    }
                }
            }
        };
        self.pos += 1;
        Some(tok)
    }
}

// ── template-tokenize wrapper: glue `{ … }` into single word tokens ───────────

struct TemplateTokenizer<'s> {
    inner: RawTokenizer<'s>,
}

impl<'s> TemplateTokenizer<'s> {
    fn new(css: &'s [u8]) -> Self {
        Self {
            inner: RawTokenizer::new(css),
        }
    }

    fn end_of_file(&self) -> bool {
        self.inner.end_of_file()
    }

    fn back(&mut self, tok: Tok) {
        self.inner.back(tok);
    }

    fn next_token(&mut self) -> Option<Tok> {
        let mut returned: Vec<Tok> = Vec::new();
        let mut last_pos: Option<usize> = None;
        let mut depth: i64 = 0;
        let mut token: Option<Tok>;

        loop {
            token = self.inner.next_token();
            let Some(t) = &token else { break };
            if t.kind != TokKind::Word {
                if t.kind == TokKind::OpenCurly {
                    depth += 1;
                } else if t.kind == TokKind::CloseCurly {
                    depth -= 1;
                }
            }
            if depth != 0 || !returned.is_empty() {
                last_pos = js_or(js_or(t.end, t.pos), last_pos);
                returned.push(t.clone());
            }
            if depth == 0 {
                break;
            }
        }

        if returned.is_empty() {
            token
        } else {
            let mut text = Vec::new();
            for t in &returned {
                text.extend_from_slice(&t.text);
            }
            Some(Tok {
                kind: TokKind::Word,
                text,
                pos: returned[0].pos,
                end: last_pos,
            })
        }
    }
}

// ── Parser (postcss-safe-parser subset) ───────────────────────────────────────

#[derive(Clone, Debug, Default)]
struct RawDecl {
    /// css-relative offset of the first word token (`source.start.offset`).
    start: usize,
    /// css-relative exclusive end (`source.end.offset`).
    end: usize,
    prop: Vec<u8>,
    between_len: usize,
    /// Clean value (postcss `raws.value?.value || node.value`).
    value: Vec<u8>,
    important: bool,
}

#[derive(Clone, Debug)]
enum RawNode {
    Decl(RawDecl),
    /// css-relative `[start, end)` where end is one past the final `/`.
    Comment {
        start: usize,
        end: usize,
    },
}

struct StyleParser<'s> {
    tok: TemplateTokenizer<'s>,
    nodes: Vec<RawNode>,
    /// A rule/at-rule reached the root — the whole parse converts to `None`.
    unconvertible: bool,
}

fn find_last_with_position(tokens: &[Tok]) -> Option<usize> {
    tokens.iter().rev().find_map(|t| js_or(t.end, t.pos))
}

fn concat_len(tokens: &[Tok]) -> usize {
    tokens.iter().map(|t| t.text.len()).sum()
}

impl<'s> StyleParser<'s> {
    fn parse(css: &'s [u8]) -> Option<Vec<RawNode>> {
        let mut p = Self {
            tok: TemplateTokenizer::new(css),
            nodes: Vec::new(),
            unconvertible: false,
        };
        while !p.tok.end_of_file() {
            let Some(token) = p.tok.next_token() else {
                break;
            };
            match token.kind {
                TokKind::Space | TokKind::Semicolon => {}
                TokKind::CloseCurly => {
                    // safe `unexpectedClose` — no node.
                }
                TokKind::Comment => p.comment(&token),
                TokKind::AtWord => {
                    // `atrule` creates an AtRule child; `convertChild` maps it
                    // to null, so the whole root converts to null.
                    p.unconvertible = true;
                    break;
                }
                TokKind::OpenCurly => {
                    // `emptyRule` — a Rule child; same null conversion.
                    p.unconvertible = true;
                    break;
                }
                _ => {
                    p.other(token);
                    if p.unconvertible {
                        break;
                    }
                }
            }
        }
        if p.unconvertible { None } else { Some(p.nodes) }
    }

    fn comment(&mut self, token: &Tok) {
        // safe-parser `comment`: end.offset = token[3] + 1.
        let start = token.pos.unwrap_or(0);
        let end = token.end.map_or(start + token.text.len(), |e| e + 1);
        self.nodes.push(RawNode::Comment { start, end });
    }

    fn other(&mut self, start: Tok) {
        let mut end = false;
        let mut colon = false;
        let mut brackets: Vec<TokKind> = Vec::new();
        let custom = start.text.starts_with(b"--");

        let mut tokens: Vec<Tok> = Vec::new();
        let mut token = Some(start);
        while let Some(t) = token {
            let kind = t.kind;
            tokens.push(t);

            if kind == TokKind::OpenParen || kind == TokKind::OpenSquare {
                brackets.push(if kind == TokKind::OpenParen {
                    TokKind::CloseParen
                } else {
                    TokKind::CloseSquare
                });
            } else if custom && colon && kind == TokKind::OpenCurly {
                brackets.push(TokKind::CloseCurly);
            } else if brackets.is_empty() {
                if kind == TokKind::Semicolon {
                    if colon {
                        self.decl(tokens, custom);
                        return;
                    }
                    break;
                } else if kind == TokKind::OpenCurly {
                    // `rule` — null conversion for the root.
                    self.unconvertible = true;
                    return;
                } else if kind == TokKind::CloseCurly {
                    let backed = tokens.pop().expect("just pushed");
                    self.tok.back(backed);
                    end = true;
                    break;
                } else if kind == TokKind::Colon {
                    colon = true;
                }
            } else if Some(&kind) == brackets.last() {
                brackets.pop();
            }

            token = self.tok.next_token();
        }

        if self.tok.end_of_file() {
            end = true;
        }
        // Unclosed bracket: safe no-op.

        if end && colon {
            if !custom {
                while let Some(last) = tokens.last() {
                    if last.kind != TokKind::Space && last.kind != TokKind::Comment {
                        break;
                    }
                    let backed = tokens.pop().expect("checked non-empty");
                    self.tok.back(backed);
                }
            }
            self.decl(tokens, custom);
        }
        // else: safe `unknownWord` — the text becomes `spaces`, no node.
    }

    /// postcss `Parser#colon` with safe-parser's non-throwing `doubleColon`.
    fn colon_index(tokens: &[Tok]) -> Option<usize> {
        let mut brackets = 0i64;
        let mut prev: Option<&Tok> = None;
        for (i, t) in tokens.iter().enumerate() {
            if t.kind == TokKind::OpenParen {
                brackets += 1;
            }
            if t.kind == TokKind::CloseParen {
                brackets -= 1;
            }
            if brackets == 0 && t.kind == TokKind::Colon {
                match prev {
                    None => {
                        // safe `doubleColon` — continue scanning.
                    }
                    Some(p) if p.kind == TokKind::Word && p.text == b"progid" => {}
                    Some(_) => return Some(i),
                }
            }
            prev = Some(t);
        }
        None
    }

    /// safe-parser `precheckMissedSemicolon`: splits `prop: v prop2: v2` value
    /// tokens, emitting the second declaration recursively.
    fn precheck_missed_semicolon(&mut self, tokens: &mut Vec<Tok>) {
        let Some(colon) = Self::colon_index(tokens) else {
            return;
        };
        let mut next_start = colon as isize - 1;
        while next_start >= 0 {
            if tokens[usize::try_from(next_start).expect("non-negative")].kind == TokKind::Word {
                break;
            }
            next_start -= 1;
        }
        if next_start <= 0 {
            return;
        }
        let next_start = usize::try_from(next_start).expect("positive");
        let mut prev_end = next_start as isize - 1;
        while prev_end >= 0 {
            if tokens[usize::try_from(prev_end).expect("non-negative")].kind != TokKind::Space {
                prev_end += 1;
                break;
            }
            prev_end -= 1;
        }
        // Upstream's index can go to -1 here only when everything before the
        // word is space, which the caller's leading-space strip prevents.
        let prev_end = usize::try_from(prev_end.max(0)).expect("non-negative");

        let other: Vec<Tok> = tokens[next_start..].to_vec();
        tokens.truncate(prev_end);
        self.decl(other, false);
    }

    #[allow(clippy::too_many_lines)]
    fn decl(&mut self, mut tokens: Vec<Tok>, custom: bool) {
        // safe-parser guard.
        if tokens.len() <= 1 || !tokens.iter().any(|t| t.kind == TokKind::Word) {
            return;
        }

        // Reserve the slot now: `init` pushes the node before the missed-
        // semicolon recursion pushes the follow-up declaration.
        let idx = self.nodes.len();
        self.nodes.push(RawNode::Decl(RawDecl::default()));

        let last = tokens.last().expect("len checked").clone();
        if last.kind == TokKind::Semicolon {
            tokens.pop();
        }
        let Some(end_off) = js_or(last.end, last.pos).or_else(|| find_last_with_position(&tokens))
        else {
            // Upstream would throw converting an undefined offset → null root.
            self.unconvertible = true;
            return;
        };
        let end = end_off + 1;

        let mut start_i = 0usize;
        while tokens[start_i].kind != TokKind::Word {
            // safe `unknownWord` for a trailing non-word is a no-op.
            start_i += 1;
            if start_i >= tokens.len() {
                // Unreachable given the some-word guard; mirror the thrown
                // TypeError → null root.
                self.unconvertible = true;
                return;
            }
        }
        let decl_start = tokens[start_i].pos.unwrap_or(0);

        let prop_i = start_i;
        while start_i < tokens.len() {
            let k = tokens[start_i].kind;
            if k == TokKind::Colon || k == TokKind::Space || k == TokKind::Comment {
                break;
            }
            start_i += 1;
        }
        let mut prop: Vec<u8> = Vec::new();
        for t in &tokens[prop_i..start_i] {
            prop.extend_from_slice(&t.text);
        }

        let between_start = start_i;
        while start_i < tokens.len() {
            let t = &tokens[start_i];
            start_i += 1;
            if t.kind == TokKind::Colon {
                break;
            }
            // safe `unknownWord` for stray words: no-op.
        }
        let mut between_len = concat_len(&tokens[between_start..start_i]);

        if matches!(prop.first(), Some(b'_' | b'*')) {
            // The dropped hack char moves to `raws.before`; `source.start`
            // stays put, so the prop range keeps its original origin.
            prop.remove(0);
        }

        let first_spaces_start = start_i;
        while start_i < tokens.len() {
            let k = tokens[start_i].kind;
            if k != TokKind::Space && k != TokKind::Comment {
                break;
            }
            start_i += 1;
        }
        let mut first_spaces: Vec<Tok> = tokens[first_spaces_start..start_i].to_vec();
        let mut vtokens: Vec<Tok> = tokens.split_off(start_i);

        self.precheck_missed_semicolon(&mut vtokens);

        let mut important = false;
        let mut i = vtokens.len();
        while i > 0 {
            i -= 1;
            let lower: Vec<u8> = vtokens[i].text.to_ascii_lowercase();
            if lower == b"!important" {
                important = true;
                vtokens.truncate(i);
                while vtokens.last().is_some_and(|t| t.kind == TokKind::Space) {
                    vtokens.pop();
                }
                break;
            } else if lower == b"important" {
                let mut cache = vtokens.clone();
                let mut s: Vec<u8> = Vec::new();
                let mut j = i as isize;
                while j > 0 {
                    let kind = cache[usize::try_from(j).expect("positive")].kind;
                    if trim_ascii(&s).starts_with(b"!") && kind != TokKind::Space {
                        break;
                    }
                    let popped = cache.pop().expect("non-empty while j > 0");
                    let mut joined = popped.text;
                    joined.extend_from_slice(&s);
                    s = joined;
                    j -= 1;
                }
                if trim_ascii(&s).starts_with(b"!") {
                    important = true;
                    vtokens = cache;
                }
            }
            let kind = vtokens.get(i).map_or(TokKind::Word, |t| t.kind);
            if kind != TokKind::Space && kind != TokKind::Comment {
                break;
            }
        }

        let has_word = vtokens
            .iter()
            .any(|t| t.kind != TokKind::Space && t.kind != TokKind::Comment);
        if has_word {
            between_len += concat_len(&first_spaces);
            first_spaces.clear();
        }
        let mut value_tokens = first_spaces;
        value_tokens.append(&mut vtokens);
        let value = clean_value(&value_tokens, custom);

        self.nodes[idx] = RawNode::Decl(RawDecl {
            start: decl_start,
            end,
            prop,
            between_len,
            value,
            important,
        });
    }
}

fn trim_ascii(s: &[u8]) -> &[u8] {
    let start = s.iter().position(|b| !b.is_ascii_whitespace());
    let Some(start) = start else { return &[] };
    let end = s
        .iter()
        .rposition(|b| !b.is_ascii_whitespace())
        .expect("non-empty");
    &s[start..=end]
}

/// postcss `Parser#raw` — the "clean" value string.
fn clean_value(tokens: &[Tok], custom: bool) -> Vec<u8> {
    let mut value = Vec::new();
    let len = tokens.len();
    for (i, t) in tokens.iter().enumerate() {
        if t.kind == TokKind::Space && i == len - 1 && !custom {
            // trailing space is raw-only
        } else if t.kind == TokKind::Comment {
            let prev_safe = i == 0 || tokens[i - 1].kind == TokKind::Space;
            let next_safe = i == len - 1 || tokens[i + 1].kind == TokKind::Space;
            if !prev_safe && !next_safe {
                if value.last() == Some(&b',') {
                    // raw-only
                } else {
                    value.extend_from_slice(&t.text);
                }
            }
        } else {
            value.extend_from_slice(&t.text);
        }
    }
    value
}

// ── Converted model (`parseStyleAttributeValue`) ──────────────────────────────

#[derive(Clone, Debug)]
pub struct StyleDecl {
    pub start: u32,
    pub end: u32,
    pub prop_name: String,
    pub prop_start: u32,
    pub prop_end: u32,
    /// Clean value text (`raws.value?.value || node.value`).
    pub value_text: String,
    pub value_start: u32,
    pub value_end: u32,
    pub important: bool,
    pub prop_interpolations: Vec<(u32, u32)>,
    pub value_interpolations: Vec<(u32, u32)>,
    pub unknown_interpolations: Vec<(u32, u32)>,
}

#[derive(Clone, Copy, Debug)]
pub struct StyleInline<'a> {
    pub start: u32,
    pub end: u32,
    pub expr: &'a Value,
}

#[derive(Clone, Debug)]
pub enum StyleNode<'a> {
    Decl(StyleDecl),
    Comment { start: u32, end: u32 },
    Inline(StyleInline<'a>),
}

impl StyleNode<'_> {
    pub const fn start(&self) -> u32 {
        match self {
            Self::Decl(d) => d.start,
            Self::Comment { start, .. } => *start,
            Self::Inline(i) => i.start,
        }
    }
    pub const fn end(&self) -> u32 {
        match self {
            Self::Decl(d) => d.end,
            Self::Comment { end, .. } => *end,
            Self::Inline(i) => i.end,
        }
    }
}

#[derive(Clone, Debug)]
pub struct StyleRoot<'a> {
    pub nodes: Vec<StyleNode<'a>>,
}

impl StyleDecl {
    fn add_interpolation(&mut self, start: u32, end: u32) {
        if self.prop_start <= start && start < self.prop_end {
            self.prop_interpolations.push((start, end));
        } else if self.value_start <= start && start < self.value_end {
            self.value_interpolations.push((start, end));
        } else {
            self.unknown_interpolations.push((start, end));
        }
    }
}

fn convert_root<'a>(
    raw_nodes: Vec<RawNode>,
    interps: Vec<StyleInline<'a>>,
    start_offset: u32,
) -> Option<StyleRoot<'a>> {
    let mut deque: VecDeque<StyleInline<'a>> = interps.into();
    let mut nodes: Vec<StyleNode<'a>> = Vec::new();

    for raw in raw_nodes {
        let mut conv = match raw {
            RawNode::Comment { start, end } => StyleNode::Comment {
                start: start_offset + source_offset(start),
                end: start_offset + source_offset(end),
            },
            RawNode::Decl(d) => {
                let start = start_offset + source_offset(d.start);
                let end = start_offset + source_offset(d.end);
                let prop_end = start + source_offset(d.prop.len());
                let value_start = prop_end + source_offset(d.between_len);
                let value_end = value_start + source_offset(d.value.len());
                StyleNode::Decl(StyleDecl {
                    start,
                    end,
                    prop_name: String::from_utf8_lossy(&d.prop).into_owned(),
                    prop_start: start,
                    prop_end,
                    value_text: String::from_utf8_lossy(&d.value).into_owned(),
                    value_start,
                    value_end,
                    important: d.important,
                    prop_interpolations: Vec::new(),
                    value_interpolations: Vec::new(),
                    unknown_interpolations: Vec::new(),
                })
            }
        };

        while let Some(first) = deque.front().copied() {
            if first.end <= conv.start() {
                nodes.push(StyleNode::Inline(first));
                deque.pop_front();
                continue;
            }
            if first.start < conv.end() {
                match &mut conv {
                    StyleNode::Decl(d) => d.add_interpolation(first.start, first.end),
                    // Interpolation inside a comment: upstream IgnoreError.
                    StyleNode::Comment { .. } => return None,
                    StyleNode::Inline(_) => unreachable!("inline nodes are not converted"),
                }
                deque.pop_front();
                continue;
            }
            break;
        }

        nodes.push(conv);
    }

    nodes.extend(deque.into_iter().map(StyleNode::Inline));

    Some(StyleRoot { nodes })
}

/// Port of `parseStyleAttributeValue`: parse a `style` attribute's value into
/// a `StyleRoot`, or `None` when the value is empty or the CSS is
/// unconvertible (at-rule / rule / interpolation inside a comment).
pub fn parse_style_attr<'a>(value: &'a AttributeValue<'a>, source: &str) -> Option<StyleRoot<'a>> {
    let mut interps: Vec<StyleInline<'a>> = Vec::new();
    let (start, end) = match value {
        AttributeValue::True(_) => return None,
        AttributeValue::Expression(tag) => {
            interps.push(StyleInline {
                start: tag.start,
                end: tag.end,
                expr: tag.expression.as_json(),
            });
            (tag.start, tag.end)
        }
        AttributeValue::Sequence(parts) => {
            let first = parts.first()?;
            let last = parts.last()?;
            for part in parts {
                if let AttributeValuePart::ExpressionTag(tag) = part {
                    interps.push(StyleInline {
                        start: tag.start,
                        end: tag.end,
                        expr: tag.expression.as_json(),
                    });
                }
            }
            let range = |p: &AttributeValuePart| match p {
                AttributeValuePart::Text(t) => (t.start, t.end),
                AttributeValuePart::ExpressionTag(t) => (t.start, t.end),
            };
            (range(first).0, range(last).1)
        }
    };
    let css = source.as_bytes().get(start as usize..end as usize)?;
    let raw_nodes = StyleParser::parse(css)?;
    convert_root(raw_nodes, interps, start)
}

fn node_u32(node: &Value, key: &str) -> Option<u32> {
    node.get(key)
        .and_then(Value::as_u64)
        .and_then(|v| u32::try_from(v).ok())
}

/// Upstream `getInlineStyle`: parse the CSS inside a string or template
/// literal expression (spans are absolute source offsets).
pub fn inline_style_of_expr<'a>(expr: &'a Value, source: &str) -> Option<StyleRoot<'a>> {
    let ty = expr.get("type").and_then(Value::as_str)?;
    let start = node_u32(expr, "start")?;
    let end = node_u32(expr, "end")?;
    if end <= start + 1 {
        return None;
    }
    let css = source
        .as_bytes()
        .get(start as usize + 1..end as usize - 1)?;

    match ty {
        "Literal" if expr.get("value").is_some_and(Value::is_string) => {
            let raw_nodes = StyleParser::parse(css)?;
            convert_root(raw_nodes, Vec::new(), start + 1)
        }
        "TemplateLiteral" => {
            let quasis = expr.get("quasis").and_then(Value::as_array)?;
            let exprs = expr.get("expressions").and_then(Value::as_array)?;
            let mut interps = Vec::new();
            for (i, e) in exprs.iter().enumerate() {
                // `[quasis[i].range[1] - 2, quasis[i+1].range[0] + 1]` in
                // TS-ESTree terms — with acorn-style content spans this is
                // `[quasis[i].end, quasis[i+1].start]`, the `${ … }` span.
                let s = node_u32(quasis.get(i)?, "end")?;
                let e_end = node_u32(quasis.get(i + 1)?, "start")?;
                interps.push(StyleInline {
                    start: s,
                    end: e_end,
                    expr: e,
                });
            }
            let raw_nodes = StyleParser::parse(css)?;
            convert_root(raw_nodes, interps, start + 1)
        }
        _ => None,
    }
}

/// Upstream `extractExpressions`: the string/template literals reachable
/// through conditional and logical branches.
pub fn extract_string_like<'a>(expr: &'a Value, out: &mut Vec<&'a Value>) {
    match expr.get("type").and_then(Value::as_str) {
        Some("Literal") if expr.get("value").is_some_and(Value::is_string) => {
            out.push(expr);
        }
        Some("TemplateLiteral") => out.push(expr),
        Some("ConditionalExpression") => {
            if let Some(c) = expr.get("consequent") {
                extract_string_like(c, out);
            }
            if let Some(a) = expr.get("alternate") {
                extract_string_like(a, out);
            }
        }
        Some("LogicalExpression") => {
            if let Some(l) = expr.get("left") {
                extract_string_like(l, out);
            }
            if let Some(r) = expr.get("right") {
                extract_string_like(r, out);
            }
        }
        _ => {}
    }
}

/// Upstream `getAllInlineStyles`: every parseable inline style root under an
/// interpolation expression, in extraction order.
pub fn all_inline_styles<'a>(expr: &'a Value, source: &str) -> Vec<StyleRoot<'a>> {
    let mut literals = Vec::new();
    extract_string_like(expr, &mut literals);
    literals
        .into_iter()
        .filter_map(|lit| inline_style_of_expr(lit, source))
        .collect()
}

// ── Decl-set iteration (no-dupe / no-shorthand) ───────────────────────────────

/// One property-declaration occurrence: name plus the prop-name span
/// (`child.prop.loc` / a `style:` directive's key-name span upstream).
#[derive(Clone, Debug)]
pub struct DeclOccurrence {
    pub prop: String,
    pub start: u32,
    pub end: u32,
}

/// Upstream `iterateStyleDeclSetFromAttrs`: the ordered declaration *sets*
/// contributed by `style:` directives and `style="…"` attributes. Declarations
/// inside one set never conflict with each other.
pub fn style_decl_sets(
    attributes: &[rsvelte_core::ast::template::Attribute<'_>],
    source: &str,
) -> Vec<Vec<DeclOccurrence>> {
    use rsvelte_core::ast::template::Attribute;

    let mut sets = Vec::new();
    for attr in attributes {
        match attr {
            Attribute::StyleDirective(d) => {
                let name_start = d.start + source_offset("style:".len());
                sets.push(vec![DeclOccurrence {
                    prop: d.name.to_string(),
                    start: name_start,
                    end: name_start + source_offset(d.name.len()),
                }]);
            }
            Attribute::Attribute(node) if node.name.as_str() == "style" => {
                if let Some(root) = parse_style_attr(&node.value, source) {
                    sets.extend(sets_from_style_root(&root, source));
                }
            }
            _ => {}
        }
    }
    sets
}

/// Upstream `iterateStyleDeclSetFromStyleRoot`.
fn sets_from_style_root(root: &StyleRoot<'_>, source: &str) -> Vec<Vec<DeclOccurrence>> {
    let mut sets = Vec::new();
    for child in &root.nodes {
        match child {
            StyleNode::Decl(d) => sets.push(vec![DeclOccurrence {
                prop: d.prop_name.clone(),
                start: d.prop_start,
                end: d.prop_end,
            }]),
            StyleNode::Inline(inline) => {
                let mut decls = Vec::new();
                collect_inline_decls(inline.expr, source, &mut decls);
                sets.push(decls);
            }
            StyleNode::Comment { .. } => {}
        }
    }
    sets
}

fn collect_inline_decls(expr: &Value, source: &str, out: &mut Vec<DeclOccurrence>) {
    for root in all_inline_styles(expr, source) {
        for set in sets_from_style_root(&root, source) {
            out.extend(set);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn parse_css(css: &str) -> Option<Vec<RawNode>> {
        StyleParser::parse(css.as_bytes())
    }

    fn decls(nodes: &[RawNode]) -> Vec<&RawDecl> {
        nodes
            .iter()
            .filter_map(|n| match n {
                RawNode::Decl(d) => Some(d),
                RawNode::Comment { .. } => None,
            })
            .collect()
    }

    #[test]
    fn parses_two_decls_with_spans() {
        let nodes = parse_css("background: green; color: red").unwrap();
        let ds = decls(&nodes);
        assert_eq!(ds.len(), 2);
        assert_eq!(ds[0].prop, b"background");
        assert_eq!(ds[0].start, 0);
        assert_eq!(ds[0].end, 18); // includes the `;`
        assert_eq!(ds[0].between_len, 2); // `: `
        assert_eq!(ds[0].value, b"green");
        assert_eq!(ds[1].prop, b"color");
        assert_eq!(ds[1].start, 19);
    }

    #[test]
    fn quoted_semicolon_is_opaque() {
        let nodes = parse_css("content: 'x; color: red'").unwrap();
        let ds = decls(&nodes);
        assert_eq!(ds.len(), 1);
        assert_eq!(ds[0].prop, b"content");
        assert_eq!(ds[0].value, b"'x; color: red'");
    }

    #[test]
    fn comment_is_a_node_and_hides_nothing() {
        let nodes = parse_css("margin: 0; /* a: 1; */ margin: 1").unwrap();
        assert_eq!(nodes.len(), 3);
        assert!(matches!(nodes[1], RawNode::Comment { start: 11, end: 22 }));
        let ds = decls(&nodes);
        assert_eq!(ds[0].prop, b"margin");
        assert_eq!(ds[1].prop, b"margin");
        assert_eq!(ds[1].start, 23);
    }

    #[test]
    fn comment_inside_value_is_not_a_node() {
        let nodes = parse_css("color: /* mid; tricky */ red").unwrap();
        assert_eq!(nodes.len(), 1);
        let ds = decls(&nodes);
        assert_eq!(ds[0].prop, b"color");
    }

    #[test]
    fn important_variants() {
        for css in [
            "color: red !important",
            "color: red !IMPORTANT",
            "color: red ! important",
        ] {
            let nodes = parse_css(css).unwrap();
            let ds = decls(&nodes);
            assert!(ds[0].important, "{css}");
            assert_eq!(ds[0].value, b"red", "{css}");
        }
        let nodes = parse_css("color: red").unwrap();
        assert!(!decls(&nodes)[0].important);
    }

    #[test]
    fn missed_semicolon_splits_two_decls() {
        let nodes = parse_css("color: red background: blue").unwrap();
        let ds = decls(&nodes);
        assert_eq!(ds.len(), 2);
        assert_eq!(ds[0].prop, b"color");
        assert_eq!(ds[1].prop, b"background");
        assert_eq!(ds[1].start, 11);
    }

    #[test]
    fn at_rule_is_unconvertible() {
        assert!(parse_css("@media x { a: b }").is_none());
    }

    #[test]
    fn empty_value_decl() {
        let nodes = parse_css("color:; background: blue").unwrap();
        let ds = decls(&nodes);
        assert_eq!(ds.len(), 2);
        assert_eq!(ds[0].prop, b"color");
        assert_eq!(ds[0].value, b"");
    }

    #[test]
    fn mustache_glues_into_prop() {
        let nodes = parse_css("{cond ? 'a: b' : ''} color: red;").unwrap();
        let ds = decls(&nodes);
        assert_eq!(ds.len(), 1);
        assert_eq!(ds[0].prop, b"{cond ? 'a: b' : ''}");
        assert_eq!(ds[0].value, b"red");
    }

    #[test]
    fn standalone_mustache_produces_no_nodes() {
        let nodes = parse_css("{styles}").unwrap();
        assert!(nodes.is_empty());
    }

    #[test]
    fn url_with_semicolon_is_opaque() {
        let nodes = parse_css("background: url(a;b.png)").unwrap();
        let ds = decls(&nodes);
        assert_eq!(ds.len(), 1);
        assert_eq!(ds[0].prop, b"background");
    }

    #[test]
    fn trailing_comment_after_decl_is_a_node() {
        let nodes = parse_css("color: red; /* trail */").unwrap();
        assert_eq!(nodes.len(), 2);
        assert!(matches!(nodes[1], RawNode::Comment { start: 12, .. }));
    }

    #[test]
    fn template_element_spans_are_acorn_style() {
        // `[quasis[i].end, quasis[i+1].start]` must be the `${ … }` span.
        let src = "`a${x}b`;";
        let program = rsvelte_core::compiler::phases::parse_module_to_estree(src, false);
        let stmt = &program["body"][0]["expression"];
        assert_eq!(stmt["type"], "TemplateLiteral");
        let q0_end = stmt["quasis"][0]["end"].as_u64().unwrap();
        let q1_start = stmt["quasis"][1]["start"].as_u64().unwrap();
        assert_eq!(&src[q0_end as usize..q1_start as usize], "${x}");
    }
}
