//! Where a comment directive can legally live.
//!
//! eslint-plugin-svelte reads `eslint-disable*` directives from
//! `SvelteHTMLComment` AST nodes and takes its "re-enable everything" boundary
//! from `SvelteScriptElement` nodes (`rules/comment-directive.ts:202-212`), and
//! `ESLint` core reads its own directives from the script's JS comments. Text
//! that merely *looks* like either — inside an attribute value, a mustache, a
//! JS or CSS string, a CSS comment, or an HTML comment — is not a node and
//! contributes nothing. This module reproduces that by scanning the source once
//! into the spans that can carry a directive.

/// A byte span `[start, end)` whose text can carry a directive.
pub struct DirectiveRegion {
    pub start: u32,
    pub end: u32,
    /// `true` for an HTML `<!-- … -->` template comment, `false` for a JS
    /// comment inside a `<script>`. Only the former is a plugin directive; a JS
    /// comment is an `ESLint`-core directive, which the per-`<script>`
    /// enable-all boundary does not touch.
    pub html: bool,
}

/// The directive-bearing spans of `source`, plus `(element start, offset just
/// past the start tag's `>`)` for every real `<script …>` element.
///
/// `module` selects the `.svelte.(js|ts)` reading: the whole file is script, so
/// there is no template to scan and no start-tag boundary.
#[must_use]
pub fn scan(source: &str, module: bool) -> (Vec<DirectiveRegion>, Vec<(u32, u32)>) {
    let mut regions = Vec::new();
    let mut script_ends = Vec::new();
    if module {
        scan_js_comments(source, 0, source.len(), &mut regions);
        return (regions, script_ends);
    }
    let b = source.as_bytes();
    let mut i = 0usize;
    while i < b.len() {
        match b[i] {
            b'<' if b[i..].starts_with(b"<!--") => {
                let inner = i + 4;
                let end = find_ci(b, inner, b"-->").unwrap_or(b.len());
                push_region(&mut regions, inner, end, true);
                i = (end + 3).min(b.len());
            }
            b'<' => {
                let Some((name, name_end, is_end_tag)) = tag_name(source, i) else {
                    i += 1;
                    continue;
                };
                let Some(gt) = start_tag_gt(b, name_end) else {
                    break;
                };
                let self_closing = gt > 0 && b[gt - 1] == b'/';
                let content_start = gt + 1;
                if is_end_tag {
                    i = content_start;
                } else if name == "script" && !self_closing {
                    script_ends.push((offset(i), offset(content_start)));
                    let content_end = find_ci(b, content_start, b"</script").unwrap_or(b.len());
                    scan_js_comments(source, content_start, content_end, &mut regions);
                    i = content_end;
                } else if name == "style" && !self_closing {
                    // CSS comments are not JS comments and not HTML comments;
                    // neither compiler reads a directive out of one.
                    i = find_ci(b, content_start, b"</style").unwrap_or(b.len());
                } else {
                    i = content_start;
                }
            }
            b'{' => i = skip_mustache(b, i),
            _ => i += 1,
        }
    }
    (regions, script_ends)
}

fn offset(value: usize) -> u32 {
    u32::try_from(value).expect("source offsets are represented as u32")
}

fn push_region(out: &mut Vec<DirectiveRegion>, start: usize, end: usize, html: bool) {
    if start < end {
        out.push(DirectiveRegion {
            start: offset(start),
            end: offset(end),
            html,
        });
    }
}

/// The lowercased tag name at `<`, the byte index just past it, and whether the
/// tag is an end tag. `None` when `<` does not open a tag.
fn tag_name(source: &str, lt: usize) -> Option<(String, usize, bool)> {
    let b = source.as_bytes();
    let mut i = lt + 1;
    let is_end = b.get(i) == Some(&b'/');
    if is_end {
        i += 1;
    }
    if !b.get(i).is_some_and(u8::is_ascii_alphabetic) {
        return None;
    }
    let start = i;
    while i < b.len() && (b[i].is_ascii_alphanumeric() || b[i] == b'-' || b[i] == b':') {
        i += 1;
    }
    Some((source[start..i].to_ascii_lowercase(), i, is_end))
}

/// The index of the `>` ending a start tag begun before `from`, skipping quoted
/// attribute values and `{…}` attribute expressions.
fn start_tag_gt(b: &[u8], from: usize) -> Option<usize> {
    let mut i = from;
    while i < b.len() {
        match b[i] {
            b'>' => return Some(i),
            b'"' | b'\'' => {
                let quote = b[i];
                i += 1;
                while i < b.len() && b[i] != quote {
                    i += 1;
                }
                i += 1;
            }
            b'{' => i = skip_mustache(b, i),
            _ => i += 1,
        }
    }
    None
}

/// The index just past the `}` closing the mustache begun at `open`.
fn skip_mustache(b: &[u8], open: usize) -> usize {
    let mut i = open + 1;
    let mut depth = 1u32;
    while i < b.len() {
        match b[i] {
            b'{' => {
                depth += 1;
                i += 1;
            }
            b'}' => {
                depth -= 1;
                i += 1;
                if depth == 0 {
                    return i;
                }
            }
            b'\'' | b'"' | b'`' => i = skip_string(b, i),
            b'/' if b.get(i + 1) == Some(&b'/') => i = skip_line_comment(b, i),
            b'/' if b.get(i + 1) == Some(&b'*') => i = skip_block_comment(b, i),
            _ => i += 1,
        }
    }
    i
}

/// The index just past the closing quote of the string literal at `open`.
fn skip_string(b: &[u8], open: usize) -> usize {
    let quote = b[open];
    let mut i = open + 1;
    while i < b.len() {
        if b[i] == b'\\' {
            i += 2;
            continue;
        }
        if b[i] == quote {
            return i + 1;
        }
        i += 1;
    }
    i
}

fn skip_line_comment(b: &[u8], open: usize) -> usize {
    let mut i = open + 2;
    while i < b.len() && b[i] != b'\n' {
        i += 1;
    }
    i
}

fn skip_block_comment(b: &[u8], open: usize) -> usize {
    let mut i = open + 2;
    while i + 1 < b.len() {
        if b[i] == b'*' && b[i + 1] == b'/' {
            return i + 2;
        }
        i += 1;
    }
    b.len()
}

/// Record every JS comment in `[from, to)` as a directive region.
fn scan_js_comments(source: &str, from: usize, to: usize, out: &mut Vec<DirectiveRegion>) {
    let b = source.as_bytes();
    let to = to.min(b.len());
    let mut i = from;
    while i < to {
        match b[i] {
            b'\'' | b'"' | b'`' => i = skip_string(b, i).min(to),
            b'/' if b.get(i + 1) == Some(&b'/') => {
                let end = skip_line_comment(b, i).min(to);
                push_region(out, i + 2, end, false);
                i = end;
            }
            b'/' if b.get(i + 1) == Some(&b'*') => {
                let end = skip_block_comment(b, i);
                let terminated = end < b.len() || b.ends_with(b"*/");
                let inner_end = if terminated { end - 2 } else { end };
                push_region(out, i + 2, inner_end.min(to), false);
                i = end.min(to);
            }
            _ => i += 1,
        }
    }
}

/// The index of the first ASCII-case-insensitive occurrence of `needle` at or
/// after `from`.
fn find_ci(b: &[u8], from: usize, needle: &[u8]) -> Option<usize> {
    if needle.is_empty() || b.len() < needle.len() {
        return None;
    }
    (from..=b.len() - needle.len()).find(|&k| b[k..k + needle.len()].eq_ignore_ascii_case(needle))
}

/// The region containing `abs`, if any.
#[must_use]
pub fn region_at(regions: &[DirectiveRegion], abs: u32) -> Option<&DirectiveRegion> {
    regions.iter().find(|r| r.start <= abs && abs < r.end)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn texts(source: &str) -> Vec<(String, bool)> {
        scan(source, false)
            .0
            .into_iter()
            .map(|r| (source[r.start as usize..r.end as usize].to_string(), r.html))
            .collect()
    }

    #[test]
    fn html_comment_is_a_region() {
        assert_eq!(texts("<!-- a --><p>b</p>"), vec![(" a ".to_string(), true)]);
    }

    #[test]
    fn attribute_value_and_mustache_are_not() {
        assert!(texts(r#"<div title="<!-- a -->"></div>"#).is_empty());
        assert!(texts(r#"<p>{"<!-- a -->"}</p>"#).is_empty());
    }

    #[test]
    fn style_content_is_not() {
        assert!(texts("<style>/* <!-- a --> */</style>").is_empty());
    }

    #[test]
    fn js_comment_is_a_region_but_a_js_string_is_not() {
        assert_eq!(
            texts("<script>const s = \"<!-- a -->\"; // b\n</script>"),
            vec![(" b".to_string(), false)]
        );
    }

    #[test]
    fn only_real_script_tags_are_boundaries() {
        assert!(scan("<!-- <script> --><p>a</p>", false).1.is_empty());
        assert!(scan("<div title=\"<script>\"></div>", false).1.is_empty());
        assert!(scan("<style>/* <script> */</style>", false).1.is_empty());
        assert_eq!(scan("<script>let a;</script>", false).1, vec![(0, 8)]);
    }

    #[test]
    fn module_mode_reads_js_comments_at_top_level() {
        let src = "// eslint-disable a\nconst x = { y: 1 };\n";
        let regions = scan(src, true).0;
        assert_eq!(regions.len(), 1);
        assert_eq!(
            &src[regions[0].start as usize..regions[0].end as usize],
            " eslint-disable a"
        );
    }
}
