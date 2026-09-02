//! Whole-word / identifier scanning over raw source text.

#[inline]
pub const fn is_ascii_ident_byte(b: u8) -> bool {
    b.is_ascii_alphanumeric() || b == b'_' || b == b'$'
}

/// Conservative whole-word substring search. Returns `true` when `needle`
/// appears in `haystack` with non-identifier bytes on either side. Used as
/// a fast pre-filter before an expensive AST parse — false positives waste
/// a few microseconds, but false negatives must be impossible, which holds
/// because any real `import` or `await` statement contains those exact
/// bytes as a word.
pub fn contains_word(haystack: &[u8], needle: &[u8]) -> bool {
    if needle.is_empty() || haystack.len() < needle.len() {
        return false;
    }
    let finder = memchr::memmem::Finder::new(needle);
    let mut search = 0;
    while let Some(offset) = finder.find(&haystack[search..]) {
        let pos = search + offset;
        let before_ok = pos == 0 || !is_ascii_ident_byte(haystack[pos - 1]);
        let after = pos + needle.len();
        let after_ok = after == haystack.len() || !is_ascii_ident_byte(haystack[after]);
        if before_ok && after_ok {
            return true;
        }
        search = pos + 1;
    }
    false
}

/// Lex a string into ASCII-identifier tokens. Skips `//` and `/* */` comments
/// and string literals so identifiers inside literals aren't picked
/// up as references.
pub fn lexical_identifiers(text: &str) -> Vec<String> {
    let mut out = Vec::new();
    let bytes = text.as_bytes();
    let len = bytes.len();
    let mut i = 0usize;
    while i < len {
        let b = bytes[i];
        if b == b'/' && i + 1 < len {
            if bytes[i + 1] == b'/' {
                while i < len && bytes[i] != b'\n' {
                    i += 1;
                }
                continue;
            } else if bytes[i + 1] == b'*' {
                i += 2;
                while i + 1 < len && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                    i += 1;
                }
                i = (i + 2).min(len);
                continue;
            }
        }
        if b == b'\'' || b == b'"' || b == b'`' {
            let quote = b;
            i += 1;
            while i < len && bytes[i] != quote {
                if bytes[i] == b'\\' && i + 1 < len {
                    i += 2;
                    continue;
                }
                i += 1;
            }
            i = (i + 1).min(len);
            continue;
        }
        if is_ascii_ident_byte(b) && !b.is_ascii_digit() {
            let start = i;
            i += 1;
            while i < len && is_ascii_ident_byte(bytes[i]) {
                i += 1;
            }
            out.push(text[start..i].to_string());
            continue;
        }
        i += 1;
    }
    out
}

/// Extract identifiers that appear inside Svelte template expression blocks
/// (`{...}` / `{#...}` / `{:...}` / `{/...}` / `{@...}`).
///
/// This is intentionally more conservative than `lexical_identifiers`: it only
/// yields tokens found inside the `{ … }` delimiters of template tags, which
/// is roughly what periscopic's JS AST scope analysis would see as free
/// variables.  HTML attribute NAMES (e.g. the `state` in `data-state`) are
/// outside these delimiters and therefore not returned, preventing false
/// positives when checking `instance_script_loose_dollar_names`.
pub fn lexical_identifiers_in_expressions(text: &str) -> Vec<String> {
    let bytes = text.as_bytes();
    let len = bytes.len();
    let mut out = Vec::new();
    let mut i = 0usize;

    while i < len {
        if bytes[i] != b'{' {
            i += 1;
            continue;
        }
        // Found `{` — scan the delimited expression region.
        i += 1; // skip `{`
        let mut depth = 1usize;
        let expr_start = i;
        while i < len && depth > 0 {
            let b = bytes[i];
            match b {
                b'{' => {
                    depth += 1;
                    i += 1;
                }
                b'}' => {
                    depth -= 1;
                    i += 1;
                }
                b'\'' | b'"' | b'`' => {
                    let q = b;
                    i += 1;
                    while i < len && bytes[i] != q {
                        if bytes[i] == b'\\' && i + 1 < len {
                            i += 2;
                        } else {
                            i += 1;
                        }
                    }
                    if i < len {
                        i += 1;
                    }
                }
                b'/' if i + 1 < len && bytes[i + 1] == b'/' => {
                    while i < len && bytes[i] != b'\n' {
                        i += 1;
                    }
                }
                b'/' if i + 1 < len && bytes[i + 1] == b'*' => {
                    i += 2;
                    while i + 1 < len && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                        i += 1;
                    }
                    i = (i + 2).min(len);
                }
                _ => {
                    i += 1;
                }
            }
        }
        let expr_end = i.saturating_sub(1); // don't include the closing `}`
        // `text.get(..)` rather than direct slicing: on a (parser-rejected)
        // unterminated `{` whose body ends mid-multibyte-char, `expr_end` could
        // land off a char boundary — fall through instead of panicking.
        if expr_start < expr_end
            && let Some(expr_text) = text.get(expr_start..expr_end)
        {
            for tok in lexical_identifiers(expr_text) {
                out.push(tok);
            }
        }
    }
    out
}

/// Byte ranges of `source` that carry no JavaScript the official svelte2tsx
/// walkers ever see: an HTML comment, and — inside every `<script>` body and
/// every template `{ … }` expression — a JS comment, a string, a regex literal
/// and a template literal's text chunks.
///
/// Upstream needs no such set: `ComponentEvents` walks the TypeScript AST and
/// `Stores` is fed by the Svelte AST walk, so a token in a comment or a string
/// is not a node. A raw-text scan here has to be told.
pub fn opaque_source_ranges(source: &str) -> Vec<(u32, u32)> {
    collect_opaque_ranges(source, true)
}

/// The template-expression half of [`opaque_source_ranges`], for a scan whose
/// script half is already answered from the parsed program.
pub fn template_opaque_ranges(source: &str) -> Vec<(u32, u32)> {
    collect_opaque_ranges(source, false)
}

fn collect_opaque_ranges(source: &str, include_scripts: bool) -> Vec<(u32, u32)> {
    let mut ranges = Vec::new();
    let mut markup_gaps: Vec<(usize, usize)> = Vec::new();
    let mut gap_start = 0usize;
    for region in super::htmlxparser::verbatim_regions(source) {
        markup_gaps.push((gap_start, region.start as usize));
        gap_start = region.end as usize;
        if !include_scripts {
            continue;
        }
        match region.kind {
            0 => ranges.push((region.start, region.end)),
            1 => push_js_opaque(source, region.content, &mut ranges),
            _ => {}
        }
    }
    markup_gaps.push((gap_start, source.len()));
    for (start, end) in markup_gaps {
        let Some(markup) = source.get(start..end) else {
            continue;
        };
        for expression in template_expression_ranges(markup) {
            push_js_opaque(
                source,
                (
                    u32::try_from(start + expression.0).unwrap_or(u32::MAX),
                    u32::try_from(start + expression.1).unwrap_or(u32::MAX),
                ),
                &mut ranges,
            );
        }
    }
    ranges.sort_unstable();
    ranges
}

fn push_js_opaque(source: &str, span: (u32, u32), out: &mut Vec<(u32, u32)>) {
    let (start, end) = (span.0 as usize, span.1 as usize);
    let Some(slice) = source.get(start..end) else {
        return;
    };
    for (run_start, run_end) in
        rsvelte_core::compiler::phases::phase3_transform::shared::js_scan::opaque_runs(
            slice.as_bytes(),
        )
    {
        out.push((
            u32::try_from(start + run_start).unwrap_or(u32::MAX),
            u32::try_from(start + run_end).unwrap_or(u32::MAX),
        ));
    }
}

/// Byte ranges of the `{ … }` expression regions in a run of template markup.
fn template_expression_ranges(text: &str) -> Vec<(usize, usize)> {
    let bytes = text.as_bytes();
    let mut out = Vec::new();
    let mut i = 0usize;
    while i < bytes.len() {
        if bytes[i] != b'{' {
            i += 1;
            continue;
        }
        // The parser's own matcher, which steps over comments, strings AND regex
        // literals: a regex holding an odd number of quotes otherwise pairs them
        // as string delimiters and the scan runs past the real `}`.
        match crate::compiler::phases::phase1_parse::utils::bracket::find_matching_bracket(
            text,
            i + 1,
            '{',
        ) {
            Some(close) => {
                if i + 1 < close {
                    out.push((i + 1, close));
                }
                i = close + 1;
            }
            None => i += 1,
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn contains_word_checks_every_match_and_identifier_boundary() {
        assert!(contains_word(b"await", b"await"));
        assert!(contains_word(b"x;await()", b"await"));
        assert!(contains_word(b"xawait await", b"await"));
        assert!(!contains_word(b"xawait", b"await"));
        assert!(!contains_word(b"awaited", b"await"));
        assert!(!contains_word(b"$await _await", b"await"));
        assert!(!contains_word(b"", b"await"));
        assert!(!contains_word(b"await", b""));
    }

    #[test]
    fn contains_word_matches_identifier_boundaries_for_every_byte() {
        for needle in [b"await".as_slice(), b"import", b"function"] {
            let mut haystack = [0; 10];
            haystack[1..needle.len() + 1].copy_from_slice(needle);
            for before in u8::MIN..=u8::MAX {
                haystack[0] = before;
                for after in u8::MIN..=u8::MAX {
                    haystack[needle.len() + 1] = after;
                    assert_eq!(
                        contains_word(&haystack[..needle.len() + 2], needle),
                        !is_ascii_ident_byte(before) && !is_ascii_ident_byte(after),
                        "needle={needle:?}, before={before}, after={after}"
                    );
                }
            }
        }
    }

    #[test]
    fn lexical_identifiers_in_expressions_only_reads_brace_blocks() {
        // Identifiers inside `{...}` are returned; HTML attribute names like
        // `data-state` (outside braces) are not — avoids false hoist-blocks.
        let got = lexical_identifiers_in_expressions("<div data-state={open}>{value}</div>");
        assert!(got.contains(&"open".to_string()), "{got:?}");
        assert!(got.contains(&"value".to_string()), "{got:?}");
        assert!(
            !got.contains(&"state".to_string()),
            "attr name skipped: {got:?}"
        );
        assert!(
            !got.contains(&"data".to_string()),
            "attr name skipped: {got:?}"
        );
        // Strings inside an expression are skipped; nested braces are balanced.
        let got2 = lexical_identifiers_in_expressions("{ f({ a: 'literal' }) }");
        assert!(got2.contains(&"f".to_string()), "{got2:?}");
        assert!(got2.contains(&"a".to_string()), "{got2:?}");
        assert!(
            !got2.contains(&"literal".to_string()),
            "string skipped: {got2:?}"
        );
    }

    #[test]
    fn lexical_identifiers_in_expressions_no_panic_on_unterminated_brace() {
        // Defensive: an unterminated `{` ending mid-multibyte must not panic.
        let _ = lexical_identifiers_in_expressions("{ x = \u{1F600}");
        let _ = lexical_identifiers_in_expressions("{\u{30A2}");
    }
}
