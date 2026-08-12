//! Normalising a class body so the line-based class-field lowering can see
//! every member.
//!
//! Both the client and server field transforms scan a class body line by line,
//! so any member sharing a physical line with a preceding one is invisible to
//! them and silently disappears from the output (issue #2087). Breaking those
//! members apart up front is what makes the scan total.

use memchr::memmem;

use crate::compiler::phases::phase1_parse::utils::find_matching_bracket;
use crate::compiler::phases::phase3_transform::shared::js_scan::slash_starts_regex_at;
use crate::compiler::utils::is_js_ident_continue;

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
    while let Some(idx) = p[..search].rfind("extends") {
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
            cut = line_end - inner.len() + inner.find("*/")? + 2;
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
            b'(' | b'[' | b'{' => {
                let close = find_matching_bracket(class_body, i + 1, b as char);
                let end = close.map_or(bytes.len(), |e| e + 1);
                // Only a `}` closing a member body ends a member; `)` / `]` do not.
                if b == b'{' {
                    boundary = Some(end);
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
                }
                prev_non_ws = Some(bytes[end.saturating_sub(1)]);
                i = end;
            }
            b';' => {
                boundary = Some(i + 1);
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

#[cfg(test)]
mod tests {
    use super::{brace_opens_class_body, split_class_members_onto_lines};

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
