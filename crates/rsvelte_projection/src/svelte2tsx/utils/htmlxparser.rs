//! Source-level scanning that the Svelte parser cannot express — mirrors
//! `src/utils/htmlxparser.ts` in the JS reference: blanking `<style>` content so
//! the parser never CSS-parses it, and recovering `<script>` tags the HTML
//! parser swallowed.

use std::borrow::Cow;

use crate::ast::template::Root;

use super::super::magic_string::MagicString;
use super::super::svelte2tsx::slice_src;

/// Case-insensitive byte search: position of the first occurrence of
/// `needle` in `haystack[from..]` (absolute index). ASCII-only folding —
/// exactly what `to_ascii_lowercase` matching gave, without allocating a
/// lowercased copy of the whole source.
fn find_ci(haystack: &[u8], from: usize, needle: &[u8]) -> Option<usize> {
    if from > haystack.len() {
        return None;
    }
    assert!(!needle.is_empty());
    let last_start = haystack.len().checked_sub(needle.len())?;
    if from > last_start {
        return None;
    }

    let first_lower = needle[0].to_ascii_lowercase();
    let first_upper = needle[0].to_ascii_uppercase();
    let mut search = from;
    while search <= last_start {
        let candidates = &haystack[search..=last_start];
        let offset = if first_lower == first_upper {
            memchr::memchr(first_lower, candidates)
        } else {
            memchr::memchr2(first_lower, first_upper, candidates)
        }?;
        let candidate = search + offset;
        if haystack[candidate..candidate + needle.len()].eq_ignore_ascii_case(needle) {
            return Some(candidate);
        }
        search = candidate + 1;
    }
    None
}

/// Replace the content of every `<style …>…</style>` with spaces (newlines and
/// carriage returns preserved) so the parser never CSS-parses it. Works at the
/// BYTE level so the result is exactly the same length as `source` — every AST
/// offset still indexes the original source. Case-insensitive on the tag name.
pub(crate) fn blank_style_content(source: &str) -> Cow<'_, str> {
    let mut blanked = None;
    let sb = source.as_bytes();
    let mut search = 0usize;
    while let Some(tag_start) = find_ci(sb, search, b"<style") {
        // Must be the `<style` element, not e.g. `<styled`.
        let after = sb.get(tag_start + 6).copied();
        if !matches!(
            after,
            Some(b'>') | Some(b' ') | Some(b'\t') | Some(b'\n') | Some(b'\r') | Some(b'/') | None
        ) {
            search = tag_start + 6;
            continue;
        }
        let Some(gt) = find_ci(sb, tag_start, b">") else {
            break;
        };
        let content_start = gt + 1;
        // Self-closing `<style/>` → no content to blank.
        if content_start >= 2 && sb[content_start - 2] == b'/' {
            search = content_start;
            continue;
        }
        let Some(content_end) = find_ci(sb, content_start, b"</style") else {
            break;
        };
        if sb[content_start..content_end]
            .iter()
            .any(|byte| !matches!(byte, b'\n' | b'\r'))
        {
            let bytes = blanked.get_or_insert_with(|| sb.to_vec());
            for b in &mut bytes[content_start..content_end] {
                if *b != b'\n' && *b != b'\r' {
                    *b = b' ';
                }
            }
        }
        search = content_end;
    }
    blanked.map_or(Cow::Borrowed(source), |bytes| {
        Cow::Owned(String::from_utf8(bytes).expect("blanking style content preserves UTF-8"))
    })
}

/// Remove embedded `<script>` tags that are NOT the top-level instance / module
/// script (they sit inside attribute values or template-literal expressions).
/// Overwriting their range with `""` truncates any attribute whose source span
/// covers the range; the joined content is returned for injection into the
/// `$$render()` body when the file has no top-level script.
pub(crate) fn remove_orphan_scripts(ast: &Root, source: &str, str: &mut MagicString<'_>) -> String {
    let orphan_scripts = find_orphan_scripts(ast, source);
    // Remove orphan scripts from the MagicString (must happen BEFORE
    // process_template_inplace so the overwrite is in place when the template
    // emits Seg::Src ranges that span the orphan range).
    for &(s, e, _) in &orphan_scripts {
        str.overwrite(s, e, "");
    }
    // Collect content for injection into $$render() body. Only matters when
    // there is no top-level instance/module script (the "no script" path below).
    orphan_scripts
        .iter()
        .map(|(_, _, content)| content.as_str())
        .collect::<Vec<_>>()
        .join("\n")
}

/// Blank out `<style>` tags (CSS is not relevant for TSX type checking). First
/// blanks any style tag the parser captured in `ast.css`, then always runs a
/// fallback scanner to catch style tags the parser did not capture (e.g.,
/// `<style global>`, `<style lang="...">`).
pub(crate) fn blank_style_tags(ast: &Root, source: &str, str: &mut MagicString<'_>) {
    let mut blanked_style_ranges: Vec<(usize, usize)> = Vec::new();
    if let Some(ref css) = ast.css
        && css.start < css.end
    {
        // Only blank the CSS range when the close tag is well-formed (exact
        // `</style>` with no whitespace before `>`). When the close tag is
        // malformed (e.g. `</style   >`), the official svelte2tsx regex does
        // not match the style tag and it is left as raw text in the output.
        // Mirror that: skip blanking so the raw `<style>…</style   >` text
        // appears verbatim in the async template body.
        let has_proper_style_close = {
            let slice = slice_src(source, css.start as usize, css.end as usize);
            slice
                .as_bytes()
                .windows(8)
                .any(|w| w.eq_ignore_ascii_case(b"</style>"))
        };
        if has_proper_style_close {
            // Also blank any trailing whitespace after the style tag
            let mut blank_end = css.end;
            let bytes = source.as_bytes();
            while (blank_end as usize) < bytes.len() {
                let b = bytes[blank_end as usize];
                if b == b' ' || b == b'\t' || b == b'\n' || b == b'\r' {
                    blank_end += 1;
                } else {
                    break;
                }
            }
            str.overwrite(css.start, blank_end, "");
            blanked_style_ranges.push((css.start as usize, blank_end as usize));
        }
    }
    {
        // Fallback: scan source for <style tags that the parser didn't
        // capture in ast.css (e.g., <style global>, <style lang="...">).
        // Blank them out by finding the matching </style>.
        // Exclude positions inside script tags to avoid matching <style>
        // inside template literals or string content.
        let script_ranges: Vec<(usize, usize)> = {
            let mut ranges = Vec::new();
            if let Some(ref inst) = ast.instance {
                ranges.push((inst.start as usize, inst.end as usize));
            }
            if let Some(ref module) = ast.module {
                ranges.push((module.start as usize, module.end as usize));
            }
            ranges
        };
        let is_inside_script =
            |pos: usize| -> bool { script_ranges.iter().any(|&(s, e)| pos >= s && pos < e) };
        let is_already_blanked = |pos: usize| -> bool {
            blanked_style_ranges
                .iter()
                .any(|&(s, e)| pos >= s && pos < e)
        };

        // Direct case-sensitive substring search over the original source.
        // The previous implementation called `source.to_lowercase()` once
        // per call, allocating a full copy of the source for case-
        // insensitive matching. Svelte HTML is lowercase in practice
        // (the parser only recognises lowercase tags), so the lowercase
        // copy is unnecessary overhead.
        let bytes = source.as_bytes();
        let mut search_from = 0;
        while let Some(rel) = source[search_from..].find("<style") {
            let abs_start = search_from + rel;
            if is_inside_script(abs_start) {
                search_from = abs_start + 1;
                continue;
            }
            if is_already_blanked(abs_start) {
                search_from = abs_start + 1;
                continue;
            }
            let after_tag = abs_start + 6;
            if after_tag < bytes.len() {
                let next_ch = bytes[after_tag];
                if (next_ch == b' '
                    || next_ch == b'>'
                    || next_ch == b'\n'
                    || next_ch == b'\r'
                    || next_ch == b'\t'
                    || next_ch == b'/')
                    && let Some(close_off) = source[abs_start..].find("</style>")
                {
                    let abs_end = abs_start + close_off + 8; // 8 = len("</style>")
                    let mut blank_end = abs_end as u32;
                    while (blank_end as usize) < bytes.len() {
                        let b = bytes[blank_end as usize];
                        if b == b' ' || b == b'\t' || b == b'\n' || b == b'\r' {
                            blank_end += 1;
                        } else {
                            break;
                        }
                    }
                    str.overwrite(abs_start as u32, blank_end, "");
                    search_from = abs_end;
                    continue;
                }
            }
            search_from = abs_start + 1;
        }
    }
}

/// Collect start positions of every `RegularElement` named `"script"` anywhere
/// in the fragment tree (including inside `{#if}`, `{#each}`, `<svelte:head>`,
/// nested elements, etc.).
fn collect_script_element_starts(
    fragment: &crate::ast::template::Fragment,
    out: &mut std::collections::HashSet<u32>,
) {
    use crate::ast::template::TemplateNode as N;
    for node in &fragment.nodes {
        match node {
            N::RegularElement(e) => {
                if e.name == "script" {
                    out.insert(e.start);
                }
                collect_script_element_starts(&e.fragment, out);
            }
            N::Component(c) => collect_script_element_starts(&c.fragment, out),
            N::SvelteComponent(c) => collect_script_element_starts(&c.fragment, out),
            N::SvelteElement(e) => collect_script_element_starts(&e.fragment, out),
            N::TitleElement(e) => collect_script_element_starts(&e.fragment, out),
            N::SlotElement(e) => collect_script_element_starts(&e.fragment, out),
            N::SvelteHead(e)
            | N::SvelteFragment(e)
            | N::SvelteBody(e)
            | N::SvelteWindow(e)
            | N::SvelteDocument(e)
            | N::SvelteBoundary(e)
            | N::SvelteOptions(e)
            | N::SvelteSelf(e) => collect_script_element_starts(&e.fragment, out),
            N::IfBlock(b) => {
                collect_script_element_starts(&b.consequent, out);
                if let Some(alt) = &b.alternate {
                    collect_script_element_starts(alt, out);
                }
            }
            N::EachBlock(b) => {
                collect_script_element_starts(&b.body, out);
                if let Some(fb) = &b.fallback {
                    collect_script_element_starts(fb, out);
                }
            }
            N::KeyBlock(b) => collect_script_element_starts(&b.fragment, out),
            N::SnippetBlock(b) => collect_script_element_starts(&b.body, out),
            N::AwaitBlock(b) => {
                if let Some(f) = &b.pending {
                    collect_script_element_starts(f, out);
                }
                if let Some(f) = &b.then {
                    collect_script_element_starts(f, out);
                }
                if let Some(f) = &b.catch {
                    collect_script_element_starts(f, out);
                }
            }
            _ => {}
        }
    }
}

/// Collect (start, end) ranges of every `HtmlTag` (`{@html}`) node anywhere
/// in the fragment tree. A `<script>` inside a HtmlTag expression is NOT an
/// orphan — it's already handled by the `{@html}` output.
fn collect_html_tag_ranges(fragment: &crate::ast::template::Fragment, out: &mut Vec<(u32, u32)>) {
    use crate::ast::template::TemplateNode as N;
    for node in &fragment.nodes {
        match node {
            N::HtmlTag(h) => {
                out.push((h.start, h.end));
            }
            N::RegularElement(e) => collect_html_tag_ranges(&e.fragment, out),
            N::Component(c) => collect_html_tag_ranges(&c.fragment, out),
            N::SvelteComponent(c) => collect_html_tag_ranges(&c.fragment, out),
            N::SvelteElement(e) => collect_html_tag_ranges(&e.fragment, out),
            N::TitleElement(e) => collect_html_tag_ranges(&e.fragment, out),
            N::SlotElement(e) => collect_html_tag_ranges(&e.fragment, out),
            N::SvelteHead(e)
            | N::SvelteFragment(e)
            | N::SvelteBody(e)
            | N::SvelteWindow(e)
            | N::SvelteDocument(e)
            | N::SvelteBoundary(e)
            | N::SvelteOptions(e)
            | N::SvelteSelf(e) => collect_html_tag_ranges(&e.fragment, out),
            N::IfBlock(b) => {
                collect_html_tag_ranges(&b.consequent, out);
                if let Some(alt) = &b.alternate {
                    collect_html_tag_ranges(alt, out);
                }
            }
            N::EachBlock(b) => {
                collect_html_tag_ranges(&b.body, out);
                if let Some(fb) = &b.fallback {
                    collect_html_tag_ranges(fb, out);
                }
            }
            N::KeyBlock(b) => collect_html_tag_ranges(&b.fragment, out),
            N::SnippetBlock(b) => collect_html_tag_ranges(&b.body, out),
            N::AwaitBlock(b) => {
                if let Some(f) = &b.pending {
                    collect_html_tag_ranges(f, out);
                }
                if let Some(f) = &b.then {
                    collect_html_tag_ranges(f, out);
                }
                if let Some(f) = &b.catch {
                    collect_html_tag_ranges(f, out);
                }
            }
            _ => {}
        }
    }
}

/// Find "orphan" `<script>…</script>` occurrences in `source` that the Svelte
/// parser did NOT recognise as a real Script (instance/module) or as a
/// `RegularElement` named `"script"`. These are typically `<script>` tags
/// embedded inside attribute values (e.g. `href="</noscript><script>…"`) or
/// inside template-literal expressions that the HTML parser terminated early.
///
/// Returns a list of `(start, end, inner_content)` triples, where `start`/`end`
/// are byte offsets in `source` and `inner_content` is the raw text between
/// `<script…>` and `</script>`.
fn only_has_top_level_script_candidates(ast: &Root, source: &str) -> bool {
    only_has_script_candidates_in_ranges(
        source,
        ast.instance
            .as_ref()
            .map(|script| (script.start, script.end)),
        ast.module.as_ref().map(|script| (script.start, script.end)),
    )
}

fn only_has_script_candidates_in_ranges(
    source: &str,
    instance: Option<(u32, u32)>,
    module: Option<(u32, u32)>,
) -> bool {
    let bytes = source.as_bytes();
    let mut search = 0;

    while search < bytes.len() {
        let Some(relative_start) = memchr::memchr(b'<', &bytes[search..]) else {
            break;
        };
        let tag_start = search + relative_start;
        search = tag_start + 1;
        let Some(tag) = bytes.get(tag_start..tag_start + 7) else {
            continue;
        };
        if !tag.eq_ignore_ascii_case(b"<script") {
            continue;
        }

        let after = bytes.get(tag_start + 7).copied();
        search = tag_start + 7;
        if !matches!(
            after,
            Some(b'>') | Some(b' ') | Some(b'\t') | Some(b'\n') | Some(b'\r') | Some(b'/') | None
        ) {
            continue;
        }

        let tag_start = tag_start as u32;
        if ![instance, module]
            .into_iter()
            .flatten()
            .any(|(start, end)| tag_start == start || (tag_start > start && tag_start < end))
        {
            return false;
        }
    }

    true
}

fn find_orphan_scripts(ast: &Root, source: &str) -> Vec<(u32, u32, String)> {
    if only_has_top_level_script_candidates(ast, source) {
        return Vec::new();
    }

    // 1. Collect known "legitimate" script start positions and their full ranges.
    let mut known_starts: std::collections::HashSet<u32> = std::collections::HashSet::default();
    // Also collect ranges of instance/module scripts so we can skip `<script>`
    // occurrences inside their string literals / template content.
    let mut known_ranges: Vec<(u32, u32)> = Vec::new();
    if let Some(inst) = &ast.instance {
        known_starts.insert(inst.start);
        known_ranges.push((inst.start, inst.end));
    }
    if let Some(module) = &ast.module {
        known_starts.insert(module.start);
        known_ranges.push((module.start, module.end));
    }
    collect_script_element_starts(&ast.fragment, &mut known_starts);

    // 2. Collect HtmlTag ranges — a <script> inside {@html …} is not orphan.
    let mut html_tag_ranges: Vec<(u32, u32)> = Vec::new();
    collect_html_tag_ranges(&ast.fragment, &mut html_tag_ranges);

    // 3. Scan the source for `<script` occurrences (case-insensitive, without
    // allocating a lowercased copy of the whole source).
    let bytes = source.as_bytes();
    let mut result: Vec<(u32, u32, String)> = Vec::new();
    let mut search: usize = 0;

    while search < source.len() {
        let Some(abs) = find_ci(bytes, search, b"<script") else {
            break;
        };
        let tag_start = abs as u32;

        // Require a proper tag boundary after `<script` (6 bytes for "script").
        let after_pos = tag_start as usize + 7; // skip '<' + "script"
        let next_byte = bytes.get(after_pos).copied();
        if !matches!(
            next_byte,
            Some(b'>') | Some(b' ') | Some(b'\t') | Some(b'\n') | Some(b'\r') | Some(b'/') | None
        ) {
            search = tag_start as usize + 7;
            continue;
        }

        // Skip if this is a recognised script/element node (exact start match).
        if known_starts.contains(&tag_start) {
            search = tag_start as usize + 7;
            continue;
        }

        // Skip if the tag start falls INSIDE an instance/module script range
        // (e.g. `<script>` text inside a string literal in the script body).
        if known_ranges
            .iter()
            .any(|&(s, e)| tag_start > s && tag_start < e)
        {
            search = tag_start as usize + 7;
            continue;
        }

        // Skip if the tag start falls inside a {@html …} range.
        if html_tag_ranges
            .iter()
            .any(|&(s, e)| tag_start > s && tag_start < e)
        {
            search = tag_start as usize + 7;
            continue;
        }

        // Find the matching `</script>` (case-insensitive).
        let Some(close_abs) = find_ci(bytes, tag_start as usize, b"</script>") else {
            break; // unterminated — skip
        };
        let close_rel = close_abs - tag_start as usize;
        let tag_end = tag_start + close_rel as u32 + 9; // 9 = len("</script>")

        // Extract the inner content: everything between `>` of the open tag and
        // `<` of `</script>`.
        let open_gt = slice_src(source, tag_start as usize, tag_end as usize)
            .find('>')
            .map(|p| tag_start as usize + p + 1)
            .unwrap_or(tag_start as usize + 8); // fallback: after "<script>"
        let inner = source[open_gt..tag_start as usize + close_rel].to_string();

        result.push((tag_start, tag_end, inner));
        search = tag_end as usize;
    }

    result
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::compiler::phases::phase1_parse::{self, ParseOptions};

    fn parse(source: &str) -> Root<'_> {
        phase1_parse::parse_script_ts(
            source,
            ParseOptions {
                modern: true,
                ..Default::default()
            },
        )
        .expect("fixture should parse")
    }

    fn can_skip(source: &str) -> bool {
        only_has_top_level_script_candidates(&parse(source), source)
    }

    fn orphans(source: &str) -> Vec<(u32, u32, String)> {
        find_orphan_scripts(&parse(source), source)
    }

    #[test]
    fn case_insensitive_search_preserves_utf8_byte_offsets() {
        let source = "前😀<STYLE>色</StYlE>後";
        let open = source.find("<STYLE>").unwrap();
        let close = source.find("</StYlE>").unwrap();

        assert_eq!(find_ci(source.as_bytes(), 0, b"<style"), Some(open));
        assert_eq!(
            find_ci(source.as_bytes(), open + 1, b"</style>"),
            Some(close)
        );
        assert_eq!(find_ci(source.as_bytes(), close + 1, b"<style"), None);
    }

    #[test]
    fn search_skips_partial_candidates_and_honors_start_offset() {
        let source = "<stale><StYlInG><style lang=\"scss\">";
        let expected = source.find("<style lang").unwrap();

        assert_eq!(find_ci(source.as_bytes(), 0, b"<style"), Some(expected));
        assert_eq!(find_ci(source.as_bytes(), expected + 1, b"<style"), None);
        assert_eq!(find_ci(source.as_bytes(), 0, b">"), source.find('>'));
        assert_eq!(
            find_ci(source.as_bytes(), source.len() + 1, b"<style"),
            None
        );
    }

    #[test]
    fn style_blanking_keeps_unicode_offsets_and_line_endings() {
        let source = "前<STYLE lang=\"x\">色 {\r\n color: red;\n}</StYlE>後";
        let blanked = blank_style_content(source);

        assert_eq!(blanked.len(), source.len());
        assert!(blanked.starts_with("前<STYLE lang=\"x\">"));
        assert!(blanked.ends_with("</StYlE>後"));
        assert_eq!(
            blanked
                .bytes()
                .enumerate()
                .filter_map(|(index, byte)| matches!(byte, b'\r' | b'\n').then_some((index, byte)))
                .collect::<Vec<_>>(),
            source
                .bytes()
                .enumerate()
                .filter_map(|(index, byte)| matches!(byte, b'\r' | b'\n').then_some((index, byte)))
                .collect::<Vec<_>>()
        );
        assert!(!blanked.contains("color"));
    }

    #[test]
    fn style_blanking_borrows_unchanged_sources() {
        for source in [
            "",
            "<main>Hello</main>",
            "<styled>content</styled>",
            "<style />",
            "<style>unterminated",
            "<style></style>",
            "<style>\r\n</style>",
        ] {
            assert!(matches!(blank_style_content(source), Cow::Borrowed(_)));
        }
        assert!(matches!(
            blank_style_content("<style>content</style>"),
            Cow::Owned(_)
        ));
    }

    #[test]
    fn orphan_script_fast_path_accepts_templates_without_script_candidates() {
        assert!(can_skip("<main><h1>Hello</h1><scripted /></main>"));
    }

    #[test]
    fn orphan_script_fast_path_accepts_top_level_scripts_and_inner_candidates() {
        let source = r#"<script context="module">
const module_marker = "<SCRIPT data-marker>";
</script>
<script>
const instance_marker = `<script data-marker>`;
</script>
<main>Hello</main>"#;
        assert!(can_skip(source));
    }

    #[test]
    fn orphan_script_fast_path_defers_uppercase_and_nested_scripts() {
        let uppercase = "<SCRIPT>console.log('upper')</SCRIPT>";
        let nested = "<main><script>console.log('nested')</script></main>";
        assert!(!can_skip(uppercase));
        assert!(!can_skip(nested));
        assert_eq!(orphans(uppercase)[0].2, "console.log('upper')");
        assert!(orphans(nested).is_empty());
    }

    #[test]
    fn orphan_script_fast_path_defers_raw_html_and_comments() {
        let raw_html = r#"{@html "<script>raw</script>"}"#;
        let comment = "<!-- <script>comment</script> -->";
        assert!(!can_skip(raw_html));
        assert!(!can_skip(comment));
        assert!(orphans(raw_html).is_empty());
        assert_eq!(orphans(comment)[0].2, "comment");
    }

    #[test]
    fn orphan_script_fast_path_defers_attribute_and_malformed_candidates() {
        assert!(!only_has_script_candidates_in_ranges(
            r#"<noscript><a href="</noscript><script>orphan</script>">link</a>"#,
            None,
            None,
        ));
        assert!(!only_has_script_candidates_in_ranges(
            r#"<div data-script="<script data-x>">value</div>"#,
            None,
            None,
        ));
        assert!(!only_has_script_candidates_in_ranges("<script", None, None,));
    }
}
