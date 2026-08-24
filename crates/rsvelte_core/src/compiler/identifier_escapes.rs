//! Normalize `$`-prefixed identifiers written with unicode escapes.
//!
//! `\u0024state(1)` and `$st\u0061te(1)` are both the identifier `$state` to a
//! JS parser, and upstream decides what a rune is from the parsed name. rsvelte
//! answers the same question in a dozen places by comparing the rune's spelling
//! against the SOURCE BYTES — the runes-mode scan, the `$`-reference collector,
//! and every lowering pass — so an escaped rune was alternately ignored (left as
//! a `$state` reference that throws at import) and rejected
//! (`global_reference_invalid` on the `$st` the scanner could read).
//!
//! Rewriting the escape to the cooked name once, before anything reads the
//! source, is what makes those scans and the parser answer the same question.
//! The cooked name is right-aligned inside the escape's own span and padded with
//! leading spaces, so the token still ends where it did and every byte offset in
//! the file — script spans, CSS, template positions — is unchanged.
//!
//! Only `$`-prefixed names are rewritten. That is the whole population the rune
//! and store scans care about, and it keeps the pass away from escaped keywords,
//! which JS rejects and which normalizing would silently make legal.

use std::ops::Range;

use crate::compiler::phases::phase3_transform::shared::js_scan::skip_opaque;
use crate::compiler::utils::{is_js_ident_continue, is_js_ident_start};

/// Normalize a whole JS source (a `.svelte.js` / `.svelte.ts` module).
pub(crate) fn normalize_module_source(source: &str) -> Option<String> {
    if !may_have_escaped_dollar_identifier(source) {
        return None;
    }
    let mut out = source.to_string();
    normalize_range(source, 0..source.len(), &mut out).then_some(out)
}

/// Normalize the `<script>` bodies of a component, leaving markup and CSS alone.
///
/// The script spans come from a real parse: a `<script` found by text search can
/// sit inside a string or a comment, and rewriting markup text would change what
/// the component renders. The extra parse is reachable only from a source that
/// already spells a `$`-identifier with an escape.
pub(crate) fn normalize_component_source(source: &str, modern_ast: bool) -> Option<String> {
    if !may_have_escaped_dollar_identifier(source) {
        return None;
    }
    let ast = crate::compiler::parse_component(source, modern_ast).ok()?;
    let ranges: Vec<Range<usize>> = [ast.instance.as_ref(), ast.module.as_ref()]
        .into_iter()
        .flatten()
        .filter_map(|script| {
            let start = script.content.start()? as usize;
            let end = script.content.end()? as usize;
            (start < end && end <= source.len()).then_some(start..end)
        })
        .collect();
    if ranges.is_empty() {
        return None;
    }
    let mut out = source.to_string();
    let mut changed = false;
    for range in ranges {
        changed |= normalize_range(source, range, &mut out);
    }
    changed.then_some(out)
}

/// Rewrite every escaped `$`-identifier in `source[range]` into `out` (which
/// starts as a copy of `source`). Returns whether anything changed.
fn normalize_range(source: &str, range: Range<usize>, out: &mut String) -> bool {
    let bytes = source.as_bytes();
    let mut changed = false;
    let mut i = range.start;
    let mut prev: Option<u8> = None;
    while i < range.end {
        if let Some((next, is_comment)) = skip_opaque(bytes, i, prev) {
            if !is_comment {
                prev = Some(b'x');
            }
            i = next.min(range.end);
            continue;
        }
        if bytes[i] == b'\\' || starts_identifier(source, i) {
            // A private name binds to its `#`, so padding in front of it would
            // not parse; leave the (already illegal-to-escape) case alone.
            let after_hash = prev == Some(b'#');
            let (end, cooked) = read_identifier(source, i);
            if end > i {
                if !after_hash
                    && let Some(name) = cooked
                    && name.starts_with('$')
                    && name.len() <= end - i
                {
                    let pad = end - i - name.len();
                    out.replace_range(i..end, &format!("{:pad$}{name}", ""));
                    changed = true;
                }
                prev = Some(bytes[end - 1]);
                i = end;
                continue;
            }
        }
        if !bytes[i].is_ascii_whitespace() {
            prev = Some(bytes[i]);
        }
        i += 1;
    }
    changed
}

fn starts_identifier(source: &str, i: usize) -> bool {
    source[i..].chars().next().is_some_and(is_js_ident_start)
}

/// Read the identifier token at `i`, returning its end offset and — when the
/// token carried at least one unicode escape and cooks to a legal identifier —
/// the cooked name. `end == i` means there is no identifier here.
fn read_identifier(source: &str, i: usize) -> (usize, Option<String>) {
    let mut at = i;
    let mut name = String::new();
    let mut escaped = false;
    let mut legal = true;
    while at < source.len() {
        let rest = &source[at..];
        if rest.starts_with('\\') {
            let Some((c, len)) = read_unicode_escape(rest) else {
                break;
            };
            escaped = true;
            legal &= if name.is_empty() {
                is_js_ident_start(c)
            } else {
                is_js_ident_continue(c)
            };
            name.push(c);
            at += len;
            continue;
        }
        let Some(c) = rest.chars().next() else { break };
        let ok = if name.is_empty() {
            is_js_ident_start(c)
        } else {
            is_js_ident_continue(c)
        };
        if !ok {
            break;
        }
        name.push(c);
        at += c.len_utf8();
    }
    if at == i {
        return (i, None);
    }
    (at, (escaped && legal).then_some(name))
}

/// Decode a `\uXXXX` / `\u{X…}` escape at the start of `rest`.
fn read_unicode_escape(rest: &str) -> Option<(char, usize)> {
    let bytes = rest.as_bytes();
    if bytes.get(1) != Some(&b'u') {
        return None;
    }
    if bytes.get(2) == Some(&b'{') {
        let close = rest.find('}')?;
        let code = u32::from_str_radix(rest.get(3..close)?, 16).ok()?;
        return Some((char::from_u32(code)?, close + 1));
    }
    let code = u32::from_str_radix(rest.get(2..6)?, 16).ok()?;
    // A lone surrogate is only an identifier character as half of a pair, which
    // no identifier needs; leaving it verbatim keeps the parser's verdict.
    Some((char::from_u32(code)?, 6))
}

/// Cheap prefilter: does any `\u` in `source` sit in an identifier whose cooked
/// name starts with `$`? Real Svelte sources carry no `\u` outside a string, so
/// this settles every compile without looking further.
fn may_have_escaped_dollar_identifier(source: &str) -> bool {
    let bytes = source.as_bytes();
    let mut from = 0usize;
    while let Some(rel) = memchr::memmem::find(&bytes[from..], b"\\u") {
        let at = from + rel;
        from = at + 2;
        // Walk to the token's start: identifier characters and earlier escapes.
        let mut start = at;
        while start > 0 {
            let head = &source[..start];
            if let Some(c) = head.chars().next_back()
                && is_js_ident_continue(c)
            {
                start -= c.len_utf8();
                continue;
            }
            if head.len() >= 6
                && let Some(prev) = head.len().checked_sub(6)
                && source.is_char_boundary(prev)
                && read_unicode_escape(&source[prev..]).is_some_and(|(_, len)| len == 6)
            {
                start = prev;
                continue;
            }
            break;
        }
        if read_identifier(source, start)
            .1
            .is_some_and(|name| name.starts_with('$'))
        {
            return true;
        }
    }
    false
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn an_escaped_dollar_becomes_the_cooked_name_in_place() {
        let out = normalize_module_source("export let a = \\u0024state(1);\n").unwrap();
        assert_eq!(out, "export let a =      $state(1);\n");
        assert_eq!(out.len(), "export let a = \\u0024state(1);\n".len());
    }

    #[test]
    fn an_escape_inside_the_name_keeps_the_call_adjacent() {
        let out = normalize_module_source("let a = $st\\u0061te(1);\n").unwrap();
        assert_eq!(out, "let a =      $state(1);\n");
    }

    #[test]
    fn a_non_dollar_identifier_is_left_alone() {
        assert!(normalize_module_source("export const \\u0058X = 1;\n").is_none());
    }

    #[test]
    fn an_escape_in_a_string_or_comment_is_text() {
        for src in [
            "const s = '\\u0024state';\n",
            "// \\u0024state\n",
            "/* \\u0024state */\n",
            "const s = `\\u0024state`;\n",
        ] {
            assert!(normalize_module_source(src).is_none(), "{src}");
        }
    }

    #[test]
    fn a_keyword_escape_is_not_normalized() {
        assert!(normalize_module_source("l\\u0065t x = 1;\n").is_none());
    }

    #[test]
    fn a_property_escape_cooks_but_stays_a_property() {
        let out = normalize_module_source("const a = o.\\u0024derived(1);\n").unwrap();
        assert_eq!(out, "const a = o.     $derived(1);\n");
    }

    #[test]
    fn a_braced_escape_is_decoded() {
        let out = normalize_module_source("let a = \\u{24}state(1);\n").unwrap();
        assert_eq!(out, "let a =      $state(1);\n");
    }

    #[test]
    fn only_the_script_body_of_a_component_is_rewritten() {
        let src = "<script>\n\tlet a = \\u0024state(1);\n</script>\n<p>\\u0024state</p>\n";
        let out = normalize_component_source(src, false).unwrap();
        assert!(out.contains("let a =      $state(1);"));
        assert!(out.contains("<p>\\u0024state</p>"));
        assert_eq!(out.len(), src.len());
    }
}
