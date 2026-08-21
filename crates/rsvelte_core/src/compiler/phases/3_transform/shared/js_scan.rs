//! Minimal lexical skipping for the line-based class transforms.
//!
//! Those passes count brackets and hunt for statement terminators in raw text.
//! A `}`, `)` or `;` inside a comment, string, template or regex literal is
//! text, not code, and reading it as code truncated a value mid-comment and
//! spliced an injected `)` into the comment body (#907, #2253). Every such
//! scanner steps over opaque runs with `skip_opaque` first.

/// Iterator over the *code* bytes of `bytes`: every byte that is not inside a
/// string, template literal, regex literal or comment, as `(byte index, byte)`.
///
/// Multi-byte UTF-8 sequences are yielded byte by byte; every continuation byte
/// is `>= 0x80`, so a scanner matching ASCII delimiters is unaffected and the
/// indices stay valid `str` boundaries at the delimiters it does match.
pub(crate) fn code_bytes(bytes: &[u8]) -> CodeBytes<'_> {
    code_bytes_from(bytes, 0)
}

/// `code_bytes`, resuming at `start`. The byte at `start` is treated as the
/// first byte of a fresh token, so a `/` there reads as a regex literal.
pub(crate) fn code_bytes_from(bytes: &[u8], start: usize) -> CodeBytes<'_> {
    CodeBytes {
        bytes,
        i: start.min(bytes.len()),
        prev: None,
    }
}

pub(crate) struct CodeBytes<'a> {
    bytes: &'a [u8],
    i: usize,
    prev: Option<u8>,
}

impl Iterator for CodeBytes<'_> {
    type Item = (usize, u8);

    fn next(&mut self) -> Option<(usize, u8)> {
        while self.i < self.bytes.len() {
            if let Some((next, is_comment)) = skip_opaque(self.bytes, self.i, self.prev) {
                if !is_comment {
                    self.prev = Some(b'x');
                }
                self.i = next;
                continue;
            }
            let c = self.bytes[self.i];
            let at = self.i;
            self.i += 1;
            if !c.is_ascii_whitespace() {
                self.prev = Some(c);
            }
            return Some((at, c));
        }
        None
    }
}

/// Does a `/` following `prev` (the last significant code byte) open a regex
/// literal rather than a division?
fn slash_starts_regex(prev: Option<u8>) -> bool {
    !matches!(prev, Some(c) if c.is_ascii_alphanumeric()
        || matches!(c, b'_' | b'$' | b')' | b']' | b'}' | b'\'' | b'"' | b'`'))
}

/// Every ECMA-262 §12.7.2 reserved word that cannot end an expression, plus the
/// contextual `of` of a `for…of` head: a `/` after one of these opens a regex.
/// `this`, `super`, `true`, `false` and `null` are the reserved words left out —
/// they produce a value, so a `/` after them divides.
const KEYWORDS_BEFORE_REGEX: &[&[u8]] = &[
    b"await",
    b"break",
    b"case",
    b"catch",
    b"class",
    b"const",
    b"continue",
    b"debugger",
    b"default",
    b"delete",
    b"do",
    b"else",
    b"enum",
    b"export",
    b"extends",
    b"finally",
    b"for",
    b"function",
    b"if",
    b"import",
    b"in",
    b"instanceof",
    b"new",
    b"of",
    b"return",
    b"switch",
    b"throw",
    b"try",
    b"typeof",
    b"var",
    b"void",
    b"while",
    b"with",
    b"yield",
];

pub(crate) fn is_ident_byte(b: u8) -> bool {
    b.is_ascii_alphanumeric() || matches!(b, b'_' | b'$') || b >= 0x80
}

/// `slash_starts_regex`, but reading the preceding *token* rather than the
/// preceding byte, so `return /re/` is a regex and not a division.
pub(crate) fn slash_starts_regex_at(bytes: &[u8], i: usize, prev: Option<u8>) -> bool {
    let mut end = i;
    while end > 0 && bytes[end - 1].is_ascii_whitespace() {
        end -= 1;
    }
    // The run has to end on the byte `prev` recorded; otherwise the caller
    // stepped over a comment or a literal and these bytes are its text, not code.
    let token_visible = end > 0 && Some(bytes[end - 1]) == prev;
    // Nothing but a postfix update puts `++` / `--` before a `/`, and it ends an
    // operand — but `+` and `-` alone do not, so the byte test says regex.
    if token_visible && end >= 2 && matches!(&bytes[end - 2..end], b"++" | b"--") {
        return false;
    }
    if slash_starts_regex(prev) {
        return true;
    }
    if !token_visible {
        return false;
    }
    let mut start = end;
    while start > 0 && is_ident_byte(bytes[start - 1]) {
        start -= 1;
    }
    // `obj.return` and `this.#in` are property names, not keywords.
    if start > 0 && matches!(bytes[start - 1], b'.' | b'#') {
        return false;
    }
    KEYWORDS_BEFORE_REGEX.contains(&&bytes[start..end])
}

/// If a string, template literal, regex literal or comment starts at `i`,
/// return `(byte just past it, was_a_comment)`. `prev` is the last significant
/// code byte, needed to tell a regex literal from a division.
pub(crate) fn skip_opaque(bytes: &[u8], i: usize, prev: Option<u8>) -> Option<(usize, bool)> {
    match bytes[i] {
        quote @ (b'\'' | b'"' | b'`') => {
            let mut j = i + 1;
            while j < bytes.len() {
                match bytes[j] {
                    b'\\' => j += 2,
                    b if b == quote => {
                        j += 1;
                        break;
                    }
                    _ => j += 1,
                }
            }
            Some((j.min(bytes.len()), false))
        }
        b'/' if bytes.get(i + 1) == Some(&b'/') => {
            let mut j = i + 2;
            while j < bytes.len() && bytes[j] != b'\n' {
                j += 1;
            }
            Some((j, true))
        }
        b'/' if bytes.get(i + 1) == Some(&b'*') => {
            let mut j = i + 2;
            while j + 1 < bytes.len() && !(bytes[j] == b'*' && bytes[j + 1] == b'/') {
                j += 1;
            }
            Some(((j + 2).min(bytes.len()), true))
        }
        b'/' if slash_starts_regex_at(bytes, i, prev) => {
            let mut j = i + 1;
            let mut in_class = false;
            while j < bytes.len() {
                match bytes[j] {
                    b'\\' => j += 2,
                    b'[' => {
                        in_class = true;
                        j += 1;
                    }
                    b']' if in_class => {
                        in_class = false;
                        j += 1;
                    }
                    b'/' if !in_class => {
                        j += 1;
                        break;
                    }
                    // An unterminated "regex" is really a division — leave the
                    // bytes to the caller rather than swallowing the line.
                    b'\n' => return None,
                    _ => j += 1,
                }
            }
            while j < bytes.len() && bytes[j].is_ascii_alphabetic() {
                j += 1;
            }
            Some((j.min(bytes.len()), false))
        }
        _ => None,
    }
}

/// Does `s` end with a `//` comment that no newline has closed?
///
/// Every pass that splices raw source into a wrapper appends its closing
/// delimiter after that text, and an open line comment swallows it.
pub(crate) fn ends_inside_line_comment(s: &str) -> bool {
    let bytes = s.as_bytes();
    let mut i = 0usize;
    let mut prev: Option<u8> = None;
    while i < bytes.len() {
        let line_comment = bytes[i] == b'/' && bytes.get(i + 1) == Some(&b'/');
        if let Some((next, is_comment)) = skip_opaque(bytes, i, prev) {
            if line_comment && next == bytes.len() {
                return true;
            }
            if !is_comment {
                prev = Some(b'x');
            }
            i = next;
            continue;
        }
        if !bytes[i].is_ascii_whitespace() {
            prev = Some(bytes[i]);
        }
        i += 1;
    }
    false
}

/// Does `name` occur in `source` as a whole identifier token?
///
/// The rewrite passes only ever replace an identifier spelled exactly `name`,
/// so a substring hit inside a longer identifier (`count` in `counter`) can
/// never become an edit — but it still costs a parse plus a `SemanticBuilder`
/// build. Boundary characters are tested per `char`, so a multi-byte
/// identifier neighbour is not mistaken for a separator.
pub(crate) fn contains_identifier(source: &str, name: &str) -> bool {
    if name.is_empty() {
        return false;
    }
    let bytes = source.as_bytes();
    for at in memchr::memmem::find_iter(bytes, name.as_bytes()) {
        let end = at + name.len();
        if !source.is_char_boundary(at) || !source.is_char_boundary(end) {
            continue;
        }
        if source[..at].chars().next_back().is_some_and(is_ident_char) {
            continue;
        }
        if source[end..].chars().next().is_some_and(is_ident_char) {
            continue;
        }
        return true;
    }
    false
}

fn is_ident_char(c: char) -> bool {
    c.is_alphanumeric() || c == '_' || c == '$'
}

/// The first occurrence of a `$rune(`-shaped `needle` in `bytes` that names the
/// rune itself: code — outside every string, template literal, regex literal
/// and comment — and starting a fresh identifier.
///
/// "Is this text code" leaves two shapes that are code and still not the rune:
/// a property (`o.$derived(1)` is a method on `o`, and `o?.$derived(1)`
/// likewise) and the tail of a longer identifier (`x$derived(1)`). Upstream
/// confuses neither, because `get_rune` walks the callee node rather than the
/// bytes.
///
/// `needle` must contain no byte that can open an opaque run (`'`, `"`,
/// `` ` ``, `/`), so testing its first byte settles the whole match.
pub(crate) fn find_rune_call(bytes: &[u8], needle: &[u8]) -> Option<usize> {
    debug_assert!(
        !needle
            .iter()
            .any(|b| matches!(b, b'\'' | b'"' | b'`' | b'/')),
        "find_rune_call needs a needle that cannot open an opaque run"
    );
    let mut candidates = memchr::memmem::find_iter(bytes, needle);
    let mut candidate = candidates.next()?;
    let mut i = 0usize;
    let mut prev: Option<u8> = None;
    let mut before = PrevChars::default();
    while i < bytes.len() {
        if let Some((next, is_comment)) = skip_opaque(bytes, i, prev) {
            while candidate < next {
                candidate = candidates.next()?;
            }
            if !is_comment {
                prev = Some(b'x');
                before.push_opaque();
            }
            i = next;
            continue;
        }
        if i == candidate {
            if is_rune_call_at(bytes, candidate, needle, &before) {
                return Some(candidate);
            }
            candidate = candidates.next()?;
        }
        if !bytes[i].is_ascii_whitespace() {
            prev = Some(bytes[i]);
            before.push_code_byte(bytes, i);
        }
        i += 1;
    }
    None
}

/// Is the `needle` match at `at` the NAME of a method rather than a call of
/// one? `class C { $derived(v) { return v; } }` and `{ $derived(v) {} }` spell
/// the member exactly like a call, and the compiler used to rewrite the
/// declaration itself. A method name can only stand where a member can start,
/// and its parameter list is followed by the body's `{`; a rune call in that
/// position is followed by whatever ends the statement.
pub(crate) fn is_rune_call_at(bytes: &[u8], at: usize, needle: &[u8], before: &PrevChars) -> bool {
    before.starts_a_rune() && !is_method_definition(bytes, at, needle, before)
}

fn is_method_definition(bytes: &[u8], at: usize, needle: &[u8], before: &PrevChars) -> bool {
    if !before.could_start_a_member() {
        return false;
    }
    let Some(after_params) = end_of_parens(bytes, at + needle.len() - 1) else {
        return false;
    };
    next_code_byte(bytes, after_params) == Some(b'{')
}

/// The byte just past the `)` matching the `(` at `open`, or `None` when it is
/// unbalanced.
fn end_of_parens(bytes: &[u8], open: usize) -> Option<usize> {
    debug_assert_eq!(bytes.get(open), Some(&b'('));
    let mut depth = 0usize;
    let mut prev: Option<u8> = None;
    let mut i = open;
    while i < bytes.len() {
        if let Some((next, is_comment)) = skip_opaque(bytes, i, prev) {
            if !is_comment {
                prev = Some(b'x');
            }
            i = next;
            continue;
        }
        match bytes[i] {
            b'(' => depth += 1,
            b')' => {
                depth -= 1;
                if depth == 0 {
                    return Some(i + 1);
                }
            }
            _ => {}
        }
        if !bytes[i].is_ascii_whitespace() {
            prev = Some(bytes[i]);
        }
        i += 1;
    }
    None
}

/// The first code byte at or after `from`, skipping whitespace and comments.
fn next_code_byte(bytes: &[u8], from: usize) -> Option<u8> {
    let mut i = from;
    let prev: Option<u8> = None;
    while i < bytes.len() {
        if let Some((next, _)) = skip_opaque(bytes, i, prev) {
            // A string / regex here is not a `{`, which is all the caller asks.
            if bytes[i] != b'/' {
                return Some(bytes[i]);
            }
            i = next;
            continue;
        }
        if !bytes[i].is_ascii_whitespace() {
            return Some(bytes[i]);
        }
        i += 1;
    }
    None
}

/// A char that is neither an identifier char nor `.`, standing in for a
/// completed string / template / regex literal.
const OPAQUE_SENTINEL: char = '"';

/// The last two significant characters of a left-to-right code scan.
#[derive(Default)]
pub(crate) struct PrevChars {
    last: Option<char>,
    before_last: Option<char>,
}

impl PrevChars {
    /// Feed the character at `i` when it is a significant (non-whitespace) code
    /// byte; continuation bytes and whitespace are ignored.
    pub(crate) fn push_code_byte(&mut self, bytes: &[u8], i: usize) {
        if let Some(c) = char_at(bytes, i)
            && !is_js_whitespace(c)
        {
            self.push(c);
        }
    }

    /// Feed a completed string / template / regex literal.
    pub(crate) fn push_opaque(&mut self) {
        self.push(OPAQUE_SENTINEL);
    }

    fn push(&mut self, c: char) {
        self.before_last = self.last;
        self.last = Some(c);
    }

    /// Can a rune name start here? Not when the previous character continues an
    /// identifier, and not after the `.` of a member access — but `...` is a
    /// spread, whose operand may well be a rune call.
    pub(crate) fn starts_a_rune(&self) -> bool {
        match self.last {
            None => true,
            Some(c) if is_ident_char(c) => false,
            Some('.') => self.before_last == Some('.'),
            Some(_) => true,
        }
    }

    /// Could a class / object member start here? `get`, `set`, `async` and
    /// `static` end in identifier characters, so `starts_a_rune` has already
    /// rejected those; what is left is the start of a body, the end of the
    /// previous member, and the `*` of a generator.
    fn could_start_a_member(&self) -> bool {
        matches!(self.last, None | Some('{' | ';' | '}' | ',' | '*'))
    }
}

/// The `char` starting at `i`, or `None` when `i` is a continuation byte.
fn char_at(bytes: &[u8], i: usize) -> Option<char> {
    let lead = bytes[i];
    let len = match lead {
        0x00..=0x7F => 1,
        0xC0..=0xDF => 2,
        0xE0..=0xEF => 3,
        0xF0..=0xF7 => 4,
        _ => return None,
    };
    std::str::from_utf8(bytes.get(i..i + len)?)
        .ok()
        .and_then(|s| s.chars().next())
}

/// JS whitespace: `char::is_whitespace` plus the zero-width no-break space,
/// which the spec lists as whitespace and Unicode does not.
fn is_js_whitespace(c: char) -> bool {
    c.is_whitespace() || c == '\u{FEFF}'
}

#[cfg(test)]
mod tests {
    use super::{
        KEYWORDS_BEFORE_REGEX, contains_identifier, find_rune_call, skip_opaque,
        slash_starts_regex_at,
    };

    /// Decide the LAST `/` in `src`, with `prev` tracked exactly as `code_bytes`
    /// tracks it — a comment leaves it alone, a literal collapses to a sentinel.
    fn decide(src: &str) -> bool {
        let bytes = src.as_bytes();
        let at = src.rfind('/').expect("no slash in the probe");
        let mut prev = None;
        let mut i = 0;
        while i < at {
            if let Some((next, is_comment)) = skip_opaque(bytes, i, prev) {
                if !is_comment {
                    prev = Some(b'x');
                }
                i = next;
                continue;
            }
            if !bytes[i].is_ascii_whitespace() {
                prev = Some(bytes[i]);
            }
            i += 1;
        }
        slash_starts_regex_at(bytes, at, prev)
    }

    #[test]
    fn every_keyword_that_cannot_end_an_expression_opens_a_regex() {
        for kw in KEYWORDS_BEFORE_REGEX {
            let kw = std::str::from_utf8(kw).unwrap();
            assert!(
                decide(&format!("x = {kw} /")),
                "`{kw} /` read as a division"
            );
            assert!(
                decide(&format!("x = {kw}\n\t/")),
                "`{kw}` then a newline read as a division"
            );
        }
    }

    #[test]
    fn a_keyword_that_can_end_an_expression_still_divides() {
        for kw in ["this", "super", "true", "false", "null"] {
            assert!(!decide(&format!("x = {kw} /")), "`{kw} /` read as a regex");
        }
    }

    #[test]
    fn a_division_is_still_a_division() {
        assert!(!decide("a = b / c /"));
        assert!(!decide("n++ /"));
        assert!(!decide("n-- /"));
        assert!(!decide("f(x) /"));
        assert!(!decide("arr[0] /"));
        assert!(!decide("1 /"));
    }

    #[test]
    fn a_run_ending_in_a_keyword_is_not_the_keyword() {
        assert!(!decide("preturn /"));
        assert!(!decide("$in /"));
        assert!(!decide("_of /"));
        assert!(!decide("日本語typeof /"));
    }

    #[test]
    fn a_property_named_like_a_keyword_still_divides() {
        assert!(!decide("obj.in /"));
        assert!(!decide("obj.return /"));
        assert!(!decide("this.#in /"));
    }

    /// The run ending at the slash is the tail of a comment the caller already
    /// stepped over, so it is text and the recorded `prev` is the real token.
    #[test]
    fn a_comment_ending_in_a_keyword_does_not_open_a_regex() {
        assert!(!decide("x = v // return\n/"));
        assert!(!decide("x = v /* return */ /"));
    }

    /// `skip_opaque` is the only caller, so the decision has to reach it.
    #[test]
    fn skip_opaque_steps_over_a_regex_after_a_keyword() {
        let src = "return /[;}]/.test(s);";
        let at = src.find('/').unwrap();
        let (end, is_comment) = skip_opaque(src.as_bytes(), at, Some(b'n')).expect("not opaque");
        assert!(!is_comment);
        assert_eq!(&src[at..end], "/[;}]/");
    }

    #[test]
    fn skip_opaque_leaves_a_division_alone() {
        let src = "total / 2; // halve";
        let at = src.find('/').unwrap();
        assert!(skip_opaque(src.as_bytes(), at, Some(b'l')).is_none());
    }

    #[test]
    fn whole_token_matches() {
        assert!(contains_identifier("let count = 1;", "count"));
        assert!(contains_identifier("count", "count"));
        assert!(contains_identifier("obj.count += 1", "count"));
        assert!(contains_identifier("{ count }", "count"));
        assert!(contains_identifier("`${count}`", "count"));
    }

    #[test]
    fn substring_of_longer_identifier_does_not_match() {
        assert!(!contains_identifier("let counter = 1;", "count"));
        assert!(!contains_identifier("discount = 1;", "count"));
        assert!(!contains_identifier("$count2", "count"));
        assert!(!contains_identifier("a_count_b", "count"));
    }

    #[test]
    fn dollar_prefixed_store_names_need_the_dollar() {
        assert!(contains_identifier("$store;", "$store"));
        assert!(!contains_identifier("$store;", "store"));
    }

    #[test]
    fn non_ascii_neighbours_are_read_as_chars() {
        assert!(!contains_identifier("日count", "count"));
        assert!(!contains_identifier("count日", "count"));
        assert!(contains_identifier("「count」", "count"));
    }

    #[test]
    fn later_occurrence_still_matches() {
        assert!(contains_identifier("counter; count;", "count"));
    }

    #[test]
    fn find_rune_call_skips_every_opaque_carrier() {
        for carrier in [
            "// $derived(",
            "/* $derived( */",
            "const c = '$derived(';",
            "const c = `$derived(`;",
            "const c = /$derived(x)/;",
        ] {
            let src = format!("{carrier}\nlet x = $derived(1);\n");
            let at = find_rune_call(src.as_bytes(), b"$derived(").expect("the real call");
            assert_eq!(
                &src[at..at + 9],
                "$derived(",
                "{carrier}: matched the wrong offset"
            );
            assert!(at > carrier.len(), "{carrier}: matched inside the carrier");
        }
    }

    #[test]
    fn find_rune_call_reports_none_when_every_occurrence_is_text() {
        assert!(find_rune_call(b"const c = '$state(';\n", b"$state(").is_none());
    }

    #[test]
    fn find_rune_call_is_not_fooled_by_a_division_before_the_call() {
        let src = "const r = a / b;\nlet x = $state(r);\n";
        let at = find_rune_call(src.as_bytes(), b"$state(").expect("the real call");
        assert_eq!(&src[at..at + 7], "$state(");
    }

    /// A rune name after a member access is a property, whatever precedes the
    /// `.` — and a rune name after an identifier character is one identifier.
    #[test]
    fn a_property_or_an_identifier_tail_is_not_the_rune() {
        for src in [
            "const a = o.$derived(1);",
            "const a = o?.$derived(1);",
            "const a = o.p.$derived(1);",
            "const a = o\n\t.$derived(1);",
            "const a = o. /* c */ $derived(1);",
            "const a = f().$derived(1);",
            "const a = arr[0].$derived(1);",
            "const a = x$derived(1);",
            "const a = 日本$derived(1);",
        ] {
            assert!(
                find_rune_call(src.as_bytes(), b"$derived(").is_none(),
                "{src}: read a property / identifier tail as the rune"
            );
        }
    }

    /// The two shapes whose previous character is `.` or a non-ASCII space and
    /// which ARE the rune.
    #[test]
    fn a_spread_operand_and_a_wide_space_still_find_the_rune() {
        for src in [
            "const a = [...$derived(1)];",
            "const a =\u{3000}$derived(1);",
            "const a = \u{feff}$derived(1);",
        ] {
            assert!(
                find_rune_call(src.as_bytes(), b"$derived(").is_some(),
                "{src}: lost the rune"
            );
        }
    }

    /// A member spelled like a rune call is a declaration, not a call.
    #[test]
    fn a_method_named_like_a_rune_is_not_the_rune() {
        for src in [
            "class C { $derived(v) { return v; } }",
            "class C {\n\t$derived(v) {\n\t\treturn v;\n\t}\n}",
            "class C { m() {} ; $derived(v) { return v; } }",
            "const o = { a: 1, $derived(v) { return v; } };",
            "class C { *$derived(v) { yield v; } }",
        ] {
            assert!(
                find_rune_call(src.as_bytes(), b"$derived(").is_none(),
                "{src}: read a method declaration as the rune"
            );
        }
    }

    /// …but a call in the same lexical neighbourhood still is one.
    #[test]
    fn a_statement_position_call_is_still_the_rune() {
        for src in [
            "let s = $state(1);\n$inspect(s);",
            "{\n\t$inspect(s);\n}",
            "let x = $derived(a);",
            "f(1, $derived(a));",
        ] {
            let needle: &[u8] = if src.contains("$inspect(") {
                b"$inspect("
            } else {
                b"$derived("
            };
            assert!(
                find_rune_call(src.as_bytes(), needle).is_some(),
                "{src}: lost the rune"
            );
        }
    }

    /// A property occurrence must not stop the scan before a later real call.
    #[test]
    fn a_property_before_the_real_call_is_skipped_not_fatal() {
        let src = "const a = o.$state(1);\nlet b = $state(2);\n";
        let at = find_rune_call(src.as_bytes(), b"$state(").expect("the real call");
        assert_eq!(&src[at - 8..at + 7], "let b = $state(");
    }
}
