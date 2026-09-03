//! Normalising a class body so the line-based class-field lowering can see
//! every member.
//!
//! Both the client and server field transforms scan a class body line by line,
//! so any member sharing a physical line with a preceding one is invisible to
//! them and silently disappears from the output (issue #2087). Breaking those
//! members apart up front is what makes the scan total.

use memchr::memmem;

use crate::compiler::phases::phase1_parse::utils::{
    find_matching_bracket, is_js_whitespace, is_js_whitespace_byte,
};
use crate::compiler::phases::phase3_transform::shared::js_scan;
use crate::compiler::phases::phase3_transform::shared::js_scan::slash_starts_regex_at;
use crate::compiler::phases::phase3_transform::shared::substring::Substring;
use crate::compiler::utils::is_js_ident_continue;

/// Byte offset of the first character after `from` that is neither JavaScript
/// whitespace nor a line or block comment.
pub(crate) fn skip_ws_and_comments(s: &str, mut from: usize) -> usize {
    loop {
        let rest = &s[from..];
        let ws = rest.len() - rest.trim_start_matches(is_js_whitespace).len();
        from += ws;
        let rest = &s[from..];
        if let Some(inner) = rest.strip_prefix("/*") {
            match memmem::find(inner.as_bytes(), b"*/") {
                Some(end) => from += 2 + end + 2,
                None => return s.len(),
            }
        } else if rest.starts_with("//") {
            match memchr::memchr(b'\n', rest.as_bytes()) {
                Some(end) => from += end + 1,
                None => return s.len(),
            }
        } else {
            return from;
        }
    }
}

/// Whether `text` contains an assignment whose initializer starts with `rune`,
/// allowing any JavaScript whitespace and comments after `=`.
pub(crate) fn has_rune_after_eq(text: &str, rune: &str) -> bool {
    let Some(eq) = find_assignment_eq(text) else {
        return false;
    };
    let init = skip_ws_and_comments(text, eq + 1);
    text[init..]
        .strip_prefix(rune)
        .is_some_and(|after| after.starts_with('(') || after.starts_with('<'))
}

/// Byte offset of the first assignment `=` rather than one belonging to a
/// comparison or arrow token.
pub(crate) fn find_assignment_eq(s: &str) -> Option<usize> {
    let bytes = s.as_bytes();
    let mut from = 0;
    while let Some(rel) = memmem::find(&bytes[from..], b"=") {
        let i = from + rel;
        let prev = i.checked_sub(1).map(|p| bytes[p]);
        let next = bytes.get(i + 1).copied();
        if !matches!(prev, Some(b'=' | b'!' | b'<' | b'>')) && !matches!(next, Some(b'=' | b'>')) {
            return Some(i);
        }
        from = i + 1;
    }
    None
}

/// Whether an assignment has no initializer token yet because only JavaScript
/// whitespace and comments follow its `=`.
pub(crate) fn initializer_starts_later(text: &str) -> bool {
    find_assignment_eq(text).is_some_and(|eq| skip_ws_and_comments(text, eq + 1) == text.len())
}

/// Skip a `'`/`"` string literal starting at `i`, returning the index just past
/// its closing quote (or end of line / input for an unterminated literal).
fn skip_quoted(s: &str, i: usize) -> usize {
    let bytes = s.as_bytes();
    let quote = bytes[i];
    let mut j = i + 1;
    while j < bytes.len() {
        match bytes[j] {
            b'\\' => j += 2,
            b'\n' => return j,
            b if b == quote => return j + 1,
            _ => j += 1,
        }
    }
    bytes.len()
}

/// Skip a template literal starting at the backtick at `i`, returning the index
/// just past its closing backtick. `${…}` interpolations are skipped whole, so
/// braces / semicolons inside them are never seen as member boundaries.
fn skip_template(s: &str, i: usize) -> usize {
    let bytes = s.as_bytes();
    let mut j = i + 1;
    while j < bytes.len() {
        match bytes[j] {
            b'\\' => j += 2,
            b'`' => return j + 1,
            b'$' if bytes.get(j + 1) == Some(&b'{') => {
                j = find_matching_bracket(s, j + 2, '{')
                    .map(|e| e + 1)
                    .unwrap_or(bytes.len());
            }
            _ => j += 1,
        }
    }
    bytes.len()
}

/// Does `s` end with the standalone keyword `kw` (not the tail of a longer identifier)?
fn ends_with_keyword(s: &str, kw: &str) -> bool {
    s.ends_with(kw) && !s[..s.len() - kw.len()].ends_with(is_js_ident_continue)
}

/// Only the tail of the source before a `{` can be its header; bounding the
/// window keeps the header checks O(1) per brace on large class bodies.
fn header_window(prefix: &str) -> &str {
    const MAX: usize = 512;
    if prefix.len() <= MAX {
        return prefix;
    }
    let mut start = prefix.len() - MAX;
    while !prefix.is_char_boundary(start) {
        start += 1;
    }
    &prefix[start..]
}

/// Does the source immediately preceding a `{` make it the opening brace of a
/// class body — `class {`, `class Foo {`, `class Foo extends Bar {` — rather
/// than a method body, block statement or object literal?
fn brace_opens_class_body(prefix: &str) -> bool {
    let mut p = header_window(prefix).trim_end();
    if ends_with_keyword(p, "class") {
        return true;
    }
    // `extends <expr>` between the (optional) name and the brace.
    let mut search = p.len();
    while let Some(idx) = p[..search].rfind_sub("extends") {
        if ends_with_keyword(&p[..idx + 7], "extends")
            && !p[idx + 7..].starts_with(is_js_ident_continue)
        {
            p = p[..idx].trim_end();
            break;
        }
        search = idx;
    }
    if ends_with_keyword(p, "class") {
        return true;
    }
    // Optional class name.
    let p = p.trim_end_matches(is_js_ident_continue).trim_end();
    ends_with_keyword(p, "class")
}

/// Does the source immediately preceding a `{` make it the opening brace of a
/// `constructor(…)` body? Constructor bodies carry rune declarations
/// (`this.x = $state(…)`) that are scanned line by line as well.
fn brace_opens_constructor_body(prefix: &str) -> bool {
    let p = header_window(prefix).trim_end();
    if !p.ends_with(')') {
        return false;
    }
    let bytes = p.as_bytes();
    let mut depth = 0i32;
    let mut i = p.len();
    while i > 0 {
        i -= 1;
        match bytes[i] {
            b')' => depth += 1,
            b'(' => {
                depth -= 1;
                if depth == 0 {
                    return ends_with_keyword(p[..i].trim_end(), "constructor");
                }
            }
            _ => {}
        }
    }
    false
}

/// Where a class declaration or expression begins in a script: the offset of
/// the `class` keyword and the offset of the `{` that opens its body.
pub(crate) struct ClassHeader {
    pub(crate) keyword: usize,
    pub(crate) body_brace: usize,
    /// Offset just past the `extends` keyword, when the header has one. The
    /// superclass expression runs from there to `body_brace`.
    pub(crate) heritage_start: Option<usize>,
}

/// Locate the first `class` declaration or expression in `source`.
///
/// Both offsets come from the lexical scan, so a `class ` inside a comment or a
/// string cannot start a "class header" and turn the function that follows into
/// a class body (#2986), and an `{` inside a comment or inside the `extends`
/// clause's arguments cannot be mistaken for the body brace.
pub(crate) fn find_class_header(source: &str) -> Option<ClassHeader> {
    let bytes = source.as_bytes();
    // Start of the identifier run in progress, and the significant code byte
    // that preceded it (`obj.class` and `this.#class` are property names).
    let mut run_start: Option<usize> = None;
    let mut run_prev: Option<u8> = None;
    let mut prev_sig: Option<u8> = None;
    // One past the previously yielded byte: a run interrupted by a comment or a
    // literal is two identifiers, not one.
    let mut prev_end = 0usize;
    let mut keyword: Option<usize> = None;
    let mut seen_after_keyword = false;
    let mut nesting = 0i32;
    let mut angle = 0i32;
    let mut heritage_start: Option<usize> = None;
    let mut pending_bodies = 0u32;
    let mut skip_depth = 0i32;
    // One past the last byte of a multi-byte JS whitespace character, whose
    // continuation bytes `is_ident_byte` would otherwise read as identifier.
    let mut whitespace_until = 0usize;

    for (i, byte) in js_scan::code_bytes(bytes) {
        if skip_depth > 0 {
            match byte {
                b'{' => skip_depth += 1,
                b'}' => skip_depth -= 1,
                _ => {}
            }
            run_start = None;
            prev_end = i + 1;
            prev_sig = Some(byte);
            continue;
        }
        // `class\u{a0}Foo` separates two tokens exactly as `class Foo` does, and
        // `\u{b}` is JS whitespace that `is_ascii_whitespace` excludes (#3470).
        let is_whitespace = if i < whitespace_until {
            true
        } else if byte.is_ascii() {
            is_js_whitespace_byte(byte)
        } else if !source.is_char_boundary(i) {
            false
        } else {
            match source[i..].chars().next() {
                Some(c) if is_js_whitespace(c) => {
                    whitespace_until = i + c.len_utf8();
                    true
                }
                _ => false,
            }
        };
        if let Some(start) = run_start
            && (i != prev_end || is_whitespace || !js_scan::is_ident_byte(byte))
        {
            run_start = None;
            let word = &bytes[start..prev_end];
            let is_property = matches!(run_prev, Some(b'.') | Some(b'#'));
            if keyword.is_none() && word == b"class" && !is_property {
                keyword = Some(start);
                seen_after_keyword = false;
                nesting = 0;
                angle = 0;
                heritage_start = None;
                pending_bodies = 0;
            } else if keyword.is_some() && nesting == 0 && angle == 0 && !is_property {
                if word == b"class" || (word == b"function" && heritage_start.is_some()) {
                    // A heritage is a LeftHandSideExpression, so its primary can
                    // be a class OR a function expression; either one's body
                    // brace precedes the class body's.
                    pending_bodies += 1;
                } else if word == b"extends" && heritage_start.is_none() {
                    heritage_start = Some(prev_end);
                }
            }
        }
        prev_end = i + 1;

        if is_whitespace {
            continue;
        }
        if js_scan::is_ident_byte(byte) {
            if run_start.is_none() {
                run_start = Some(i);
                run_prev = prev_sig;
                // A name, `extends`, `implements` — the keyword is a real one.
                seen_after_keyword = true;
            }
            prev_sig = Some(byte);
            continue;
        }
        prev_sig = Some(byte);

        let Some(start) = keyword else { continue };
        if !seen_after_keyword {
            // `class {` is the only punctuation that can follow the keyword; a
            // `:` (object key), `(` (method name) or `?` (optional member) means
            // this `class` was a property name after all.
            if byte == b'{' {
                return Some(ClassHeader {
                    keyword: start,
                    body_brace: i,
                    heritage_start: None,
                });
            }
            keyword = None;
            continue;
        }
        match byte {
            b'(' | b'[' => nesting += 1,
            b')' | b']' => nesting -= 1,
            // Only a TypeScript type parameter list can bracket a class header.
            b'<' if nesting == 0 => angle += 1,
            b'>' if nesting == 0 && angle > 0 => angle -= 1,
            b'{' if nesting == 0 && angle == 0 => {
                if pending_bodies > 0 {
                    pending_bodies -= 1;
                    skip_depth = 1;
                } else if heritage_start
                    .is_some_and(|start| skip_ws_and_comments(source, start) == i)
                {
                    // Nothing but whitespace since `extends`, so this brace is
                    // that primary's own object literal and the class body's is
                    // the one after it.
                    skip_depth = 1;
                } else {
                    return Some(ClassHeader {
                        keyword: start,
                        body_brace: i,
                        heritage_start,
                    });
                }
            }
            // No class header contains a statement terminator.
            b';' if nesting == 0 => {
                keyword = None;
                heritage_start = None;
                pending_bodies = 0;
            }
            _ => {}
        }
    }
    None
}

/// Given the offset just past a member terminator, return the offset at which a
/// line break must be inserted and the offset of the next member's first byte —
/// or `None` when nothing else shares the line.
fn member_break_at(s: &str, pos: usize) -> Option<(usize, usize)> {
    let line_end = s[pos..].find('\n').map_or(s.len(), |p| pos + p);
    let mut cut = pos;
    loop {
        let rest = &s[cut..line_end];
        let trimmed = rest.trim_start();
        // Nothing else on this line, a trailing `//` comment, or a terminator
        // still to come — no member is hiding behind this boundary.
        if trimmed.is_empty()
            || trimmed.starts_with("//")
            || trimmed.starts_with([';', ',', ')', ']', '}'])
        {
            return None;
        }
        // A `/* … */` comment trailing the member that just ended stays with it.
        if let Some(inner) = trimmed.strip_prefix("/*") {
            cut = line_end - inner.len() + inner.find_sub("*/")? + 2;
            continue;
        }
        return Some((cut, line_end - trimmed.len()));
    }
}

/// Is everything from `start` up to the next newline (or the end of `s`) blank?
fn rest_of_line_is_blank(s: &str, start: usize) -> bool {
    s[start..]
        .split('\n')
        .next()
        .is_none_or(|l| l.trim().is_empty())
}

/// The run of spaces / tabs that opens the line beginning at `line_start`.
fn leading_indent(s: &str, line_start: usize) -> &str {
    let rest = &s[line_start..];
    let len = rest
        .find(|c: char| !matches!(c, ' ' | '\t'))
        .unwrap_or(rest.len());
    &rest[..len]
}

/// Break class-body members that share a physical source line onto separate
/// lines, so the line-based member scan sees exactly one member per line.
///
/// Without this, `class A { n = $state(1); d = $derived(this.n) }` parses the
/// first field and silently discards the rest of the line — the `$derived`
/// backing field and its accessors never reach the output (issue #2087).
///
/// A boundary that is already followed by a line break (or only by a trailing
/// `//` comment) is left alone, so conventionally formatted source is returned
/// byte-for-byte unchanged.
pub(crate) fn split_class_members_onto_lines(class_body: &str) -> std::borrow::Cow<'_, str> {
    let bytes = class_body.as_bytes();
    let mut out = String::new();
    // Everything before `copied` has already been flushed into `out`.
    let mut copied = 0usize;
    let mut line_start = 0usize;
    let mut prev_non_ws: Option<u8> = None;
    let mut i = 0usize;
    // A `(`/`[` region is scanned rather than skipped, because a class body can
    // sit inside one — `new (class { … })()`. Nothing in it terminates a member.
    let mut group_depth = 0i32;

    while i < bytes.len() {
        let b = bytes[i];
        // A boundary is the offset just past a member terminator: a top-level
        // `;`, or the `}` closing a top-level member body.
        let mut boundary: Option<usize> = None;
        match b {
            b'\n' => {
                line_start = i + 1;
                i += 1;
                continue;
            }
            b'\'' | b'"' => {
                i = skip_quoted(class_body, i);
                prev_non_ws = Some(b'"');
                continue;
            }
            b'`' => {
                i = skip_template(class_body, i);
                prev_non_ws = Some(b'`');
                continue;
            }
            b'/' if bytes.get(i + 1) == Some(&b'/') => {
                i = memmem::find(&bytes[i..], b"\n").map_or(bytes.len(), |p| i + p);
                continue;
            }
            b'/' if bytes.get(i + 1) == Some(&b'*') => {
                i = memmem::find(&bytes[i + 2..], b"*/").map_or(bytes.len(), |p| i + p + 4);
                continue;
            }
            b'/' if slash_starts_regex_at(bytes, i, prev_non_ws) => {
                let mut j = i + 1;
                while j < bytes.len() {
                    match bytes[j] {
                        b'\\' => j += 2,
                        b'[' => {
                            // A `/` inside a character class does not end the regex.
                            j += 1;
                            while j < bytes.len() && bytes[j] != b']' {
                                j += if bytes[j] == b'\\' { 2 } else { 1 };
                            }
                            j += 1;
                        }
                        b'/' | b'\n' => break,
                        _ => j += 1,
                    }
                }
                i = (j + 1).min(bytes.len());
                prev_non_ws = Some(b'/');
                continue;
            }
            b'(' | b'[' => {
                group_depth += 1;
                prev_non_ws = Some(b);
                i += 1;
            }
            b')' | b']' => {
                group_depth = (group_depth - 1).max(0);
                prev_non_ws = Some(b);
                i += 1;
            }
            b'{' => {
                let close = find_matching_bracket(class_body, i + 1, b as char);
                let end = close.map_or(bytes.len(), |e| e + 1);
                // Only a `}` closing a member body ends a member; `)` / `]` do not.
                if group_depth == 0 {
                    boundary = Some(end);
                }
                // A nested class body needs the same one-member-per-line
                // shape, and its braces must not share a line with members
                // either — the outer scan reads them as plain source lines.
                // A constructor body is scanned line by line as well.
                if let Some(inner_end) = close.filter(|&e| e > i + 1)
                    && (brace_opens_class_body(&class_body[..i])
                        || brace_opens_constructor_body(&class_body[..i]))
                {
                    let inner_start = i + 1;
                    let inner = &class_body[inner_start..inner_end];
                    let indent = leading_indent(class_body, line_start);
                    let mut rebuilt = String::new();
                    if !rest_of_line_is_blank(inner, 0) {
                        rebuilt.push('\n');
                        rebuilt.push_str(indent);
                        rebuilt.push('\t');
                    }
                    rebuilt.push_str(&split_class_members_onto_lines(inner));
                    if !inner
                        .rsplit('\n')
                        .next()
                        .is_none_or(|l| l.trim().is_empty())
                    {
                        rebuilt.push('\n');
                        rebuilt.push_str(indent);
                    }
                    if rebuilt != inner {
                        out.push_str(&class_body[copied..inner_start]);
                        out.push_str(&rebuilt);
                        copied = inner_end;
                    }
                }
                prev_non_ws = Some(bytes[end.saturating_sub(1)]);
                i = end;
            }
            b';' => {
                if group_depth == 0 {
                    boundary = Some(i + 1);
                }
                prev_non_ws = Some(b';');
                i += 1;
            }
            _ => {
                if !b.is_ascii_whitespace() {
                    prev_non_ws = Some(b);
                }
                i += 1;
            }
        }

        let Some(pos) = boundary else { continue };
        let Some((cut, next)) = member_break_at(class_body, pos) else {
            continue;
        };
        out.push_str(&class_body[copied..cut]);
        out.push('\n');
        out.push_str(leading_indent(class_body, line_start));
        copied = next;
        i = next;
    }

    if copied == 0 {
        return std::borrow::Cow::Borrowed(class_body);
    }
    out.push_str(&class_body[copied..]);
    std::borrow::Cow::Owned(out)
}

/// The offset of the `class` keyword in a top-level `export default class …`,
/// read from code bytes only so the words cannot come from a comment or string.
fn export_default_class_keyword(bytes: &[u8]) -> Option<usize> {
    // The three keywords must be consecutive identifier runs.
    const WORDS: [&[u8]; 3] = [b"export", b"default", b"class"];
    let mut matched = 0usize;
    let mut run_start: Option<usize> = None;
    let mut prev_end = 0usize;
    for (i, byte) in js_scan::code_bytes(bytes) {
        if let Some(start) = run_start
            && (i != prev_end || !js_scan::is_ident_byte(byte))
        {
            run_start = None;
            let word = &bytes[start..prev_end];
            if word == WORDS[matched] {
                matched += 1;
                if matched == WORDS.len() {
                    return Some(start);
                }
            } else {
                matched = 0;
            }
        }
        prev_end = i + 1;
        if js_scan::is_ident_byte(byte) {
            if run_start.is_none() {
                run_start = Some(i);
            }
        } else if !byte.is_ascii_whitespace() {
            matched = 0;
        }
    }
    if let Some(start) = run_start
        && matched + 1 == WORDS.len()
        && &bytes[start..prev_end] == WORDS[matched]
    {
        return Some(start);
    }
    None
}

/// Terminate a module's `export default class … }` with the `;` upstream prints:
/// esrap emits the default export's class through its expression path, so the
/// statement ends in `};` even for a plain class with no runes.
pub(crate) fn terminate_export_default_class(code: &str) -> Option<String> {
    let bytes = code.as_bytes();
    let keyword = export_default_class_keyword(bytes)?;
    let header = find_class_header(&code[keyword..])?;
    let brace = keyword + header.body_brace;
    let mut depth = 0i32;
    let mut close = None;
    for (i, byte) in js_scan::code_bytes_from(bytes, brace) {
        match byte {
            b'{' => depth += 1,
            b'}' => {
                depth -= 1;
                if depth == 0 {
                    close = Some(i);
                    break;
                }
            }
            _ => {}
        }
    }
    let close = close?;
    // A `;` the source already wrote lands as its own statement; upstream folds
    // it into the class's terminator instead of printing an empty statement.
    let next_code = js_scan::code_bytes_from(bytes, close + 1)
        .find(|(_, b)| !b.is_ascii_whitespace())
        .filter(|(_, b)| *b == b';')
        .map(|(i, _)| i);
    if next_code == Some(close + 1) {
        return None;
    }
    let tail = next_code.map_or(close + 1, |i| i + 1);
    let mut out = String::with_capacity(code.len() + 1);
    out.push_str(&code[..=close]);
    out.push(';');
    out.push_str(&code[tail..]);
    Some(out)
}

#[cfg(test)]
mod tests {
    use super::{
        brace_opens_class_body, find_assignment_eq, find_class_header, has_rune_after_eq,
        initializer_starts_later, split_class_members_onto_lines,
    };

    #[test]
    fn rune_initializer_separator_uses_js_whitespace_and_comments() {
        for separator in [
            "",
            " ",
            "  ",
            "\t",
            "\n\t",
            " /* c */ ",
            " // c\n\t",
            "\u{a0}",
            "\u{feff}",
        ] {
            let field = format!("d ={separator}$derived(1)");
            assert!(has_rune_after_eq(&field, "$derived"), "{field:?}");
        }
    }

    #[test]
    fn deferred_initializer_accepts_comments_but_not_a_value() {
        for text in ["d =", "d =\t", "d = /* c */", "d = // c"] {
            assert!(initializer_starts_later(text), "{text:?}");
        }
        assert!(!initializer_starts_later("d = 1"));
    }

    #[test]
    fn comparisons_and_arrows_are_not_assignments() {
        for text in [
            "x == $derived(1)",
            "x === $derived(1)",
            "x != $derived(1)",
            "x <= $derived(1)",
            "x >= $derived(1)",
            "x => $derived(1)",
        ] {
            assert_eq!(find_assignment_eq(text), None, "{text:?}");
            assert!(!has_rune_after_eq(text, "$derived"), "{text:?}");
        }
    }

    #[test]
    fn conventionally_formatted_class_body_is_not_resplit() {
        for body in [
            "\n\tvalue = 1;\n\tother = 2;\n",
            "\n\tfoo() {\n\t\treturn 1;\n\t}\n\n\tbar = 2;\n",
            "\n\tx = { a: 1 };\n\tf = () => {\n\t\treturn 1;\n\t};\n",
            "\n\tre = /[};]+/g;\n\ttpl = `a;${b({ c: 1 })};d`;\n",
            "\n\tn = 1; // trailing comment\n",
        ] {
            assert!(
                matches!(
                    split_class_members_onto_lines(body),
                    std::borrow::Cow::Borrowed(_)
                ),
                "body was rewritten:\n{body}"
            );
        }
    }

    #[test]
    fn same_line_members_are_split() {
        assert_eq!(
            split_class_members_onto_lines("\tn = $state(1); d = $derived(n * 2);\n"),
            "\tn = $state(1);\n\td = $derived(n * 2);\n"
        );
        assert_eq!(
            split_class_members_onto_lines("\tfoo() { return 1 } d = $derived(1);\n"),
            "\tfoo() { return 1 }\n\td = $derived(1);\n"
        );
        // A `;` inside a string / template / regex / nested block is not a boundary.
        assert_eq!(
            split_class_members_onto_lines("\ts = 'a; b'; t = `c;${d};e`; u = /;/;\n"),
            "\ts = 'a; b';\n\tt = `c;${d};e`;\n\tu = /;/;\n"
        );
    }

    #[test]
    fn regex_after_keyword_does_not_hide_the_following_member() {
        assert_eq!(
            split_class_members_onto_lines(
                "\tmethod() { return /[//]/.test(value); } next = $state(1);\n"
            ),
            "\tmethod() { return /[//]/.test(value); }\n\tnext = $state(1);\n"
        );
    }

    /// `find_class_header` returns the offsets; these tests state them as the
    /// header text they delimit, which is what the caller splices.
    fn header_of(source: &str) -> Option<&str> {
        find_class_header(source).map(|h| &source[h.keyword..=h.body_brace])
    }

    #[test]
    fn class_header_is_located_lexically() {
        for (source, header) in [
            ("class Foo {}", "class Foo {"),
            ("const C = class {};", "class {"),
            ("export class Foo extends Bar {}", "class Foo extends Bar {"),
            (
                "class Foo extends mixin({ a: 1 }) {}",
                "class Foo extends mixin({ a: 1 }) {",
            ),
            (
                "class Foo<T extends { a: string }> {}",
                "class Foo<T extends { a: string }> {",
            ),
            (
                "abstract class Foo implements Bar {}",
                "class Foo implements Bar {",
            ),
            ("class/*c*/Foo{}", "class/*c*/Foo{"),
            // Any run of JS whitespace separates the keyword from the name.
            ("class\tFoo {}", "class\tFoo {"),
            ("class\n\tFoo {}", "class\n\tFoo {"),
            ("class  Foo {}", "class  Foo {"),
            ("class\u{a0}Foo {}", "class\u{a0}Foo {"),
            ("class\u{feff}Foo {}", "class\u{feff}Foo {"),
            ("class\u{b}Foo {}", "class\u{b}Foo {"),
            ("class\u{c}Foo {}", "class\u{c}Foo {"),
            ("class\u{3000}Foo {}", "class\u{3000}Foo {"),
            (
                "class Foo extends\u{a0}Bar {}",
                "class Foo extends\u{a0}Bar {",
            ),
            // A non-ASCII byte that is NOT whitespace stays part of its
            // identifier: `ωclass` is one name, so the header is the real one
            // below it and not the tail of that name.
            ("const \u{3c9}class = 1;\nclass Foo {}", "class Foo {"),
            ("const caf\u{e9}class = 1;\nclass Bar {}", "class Bar {"),
            // A comment or a string mentioning the keyword is text, not code.
            ("// we avoid class here\nclass Foo {}", "class Foo {"),
            ("const s = 'class name';\nclass Foo {}", "class Foo {"),
            ("/* class Foo { */\nclass Bar {}", "class Bar {"),
            ("const r = /class /;\nclass Foo {}", "class Foo {"),
            // `class` as a property name is not a class.
            ("f({ class: 'a' });\nclass Foo {}", "class Foo {"),
            ("f({ class() {} });\nclass Foo {}", "class Foo {"),
            ("el.class = 'a';\nclass Foo {}", "class Foo {"),
            ("this.#class = 1;\nclass Foo {}", "class Foo {"),
            ("let superclass = 1;\nclass Foo {}", "class Foo {"),
        ] {
            assert_eq!(header_of(source), Some(header), "{source:?}");
        }
    }

    #[test]
    fn no_class_header_where_there_is_no_class() {
        for source in [
            "// we avoid class here\nexport const make = () => {};",
            "const label = 'class name';\nexport const make = () => {};",
            "const styles = { class: 'a' };",
            "el.classList.add('x');",
            "const superclass = Base;",
        ] {
            assert!(header_of(source).is_none(), "{source:?}");
        }
    }

    #[test]
    fn brace_opens_class_body_recognises_class_headers() {
        for prefix in [
            "class ",
            "\tclass Foo ",
            "x = class ",
            "class Foo extends Bar ",
            "x = class extends mixin(Base) ",
        ] {
            assert!(brace_opens_class_body(prefix), "{prefix:?}");
        }
        for prefix in [
            "\tfoo() ",
            "\tif (x) ",
            "\tx = ",
            "\tsubclass ",
            "\tclassy Foo ",
        ] {
            assert!(!brace_opens_class_body(prefix), "{prefix:?}");
        }
    }
}
