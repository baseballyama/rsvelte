use oxc_formatter::JsFormatOptions;
use rsvelte_core::ast::template::Attribute;
use unicode_width::UnicodeWidthStr;

pub(super) fn indent_str(level: usize, js_opts: &JsFormatOptions) -> String {
    if js_opts.indent_style.is_tab() {
        "\t".repeat(level)
    } else {
        " ".repeat(level * js_opts.indent_width.value() as usize)
    }
}

/// Visual column width of an indent. For tabs, treat one tab as
/// `indent_width` visual columns (matches how most editors display
/// them).
pub(super) fn indent_visual_width(level: usize, js_opts: &JsFormatOptions) -> usize {
    level * js_opts.indent_width.value() as usize
}

/// Visual width of a rendered string, matching how `oxfmt` / prettier measure
/// line length: East Asian Wide and Fullwidth characters (CJK text, fullwidth
/// punctuation, …) count as two columns and combining marks as zero. Counting
/// bare `chars()` under-measured CJK-heavy open tags, so they never crossed
/// `printWidth` and never wrapped even when `oxfmt` would (#762).
pub(super) fn visual_width(s: &str) -> usize {
    UnicodeWidthStr::width(s)
}

// ─── source-scan helpers ────────────────────────────────────────────────

pub(super) fn attribute_span(attr: &Attribute) -> (u32, u32) {
    match attr {
        Attribute::Attribute(n) => (n.start, n.end),
        Attribute::SpreadAttribute(s) => (s.start, s.end),
        Attribute::AttachTag(a) => (a.start, a.end),
        Attribute::BindDirective(d) => (d.start, d.end),
        Attribute::OnDirective(d) => (d.start, d.end),
        Attribute::ClassDirective(d) => (d.start, d.end),
        Attribute::StyleDirective(d) => (d.start, d.end),
        Attribute::TransitionDirective(d) => (d.start, d.end),
        Attribute::AnimateDirective(d) => (d.start, d.end),
        Attribute::UseDirective(d) => (d.start, d.end),
        Attribute::LetDirective(d) => (d.start, d.end),
    }
}

/// Scan forward from after the last attribute (or just past `<tagname`
/// when there are none) and return the position **after** the `>` that
/// closes the opener.
pub(super) fn find_open_tag_end(
    source: &str,
    element_start: u32,
    attributes: &[Attribute],
) -> Option<u32> {
    let scan_from = if let Some(last) = attributes.last() {
        attribute_span(last).1 as usize
    } else {
        // Skip the leading `<` and consume tag-name chars.
        let bytes = source.as_bytes();
        let mut i = element_start as usize + 1;
        while i < bytes.len() && !matches!(bytes[i], b' ' | b'\t' | b'\n' | b'\r' | b'>' | b'/') {
            i += 1;
        }
        i
    };

    let bytes = source.as_bytes();
    let mut i = scan_from;
    while i < bytes.len() {
        // Skip over comments so a `>` inside `// …` / `/* … */` (which can
        // sit between the last attribute and the closing `>`) doesn't end
        // the open tag prematurely (#685).
        if bytes[i] == b'/' && bytes.get(i + 1) == Some(&b'/') {
            i += 2;
            while i < bytes.len() && bytes[i] != b'\n' {
                i += 1;
            }
            continue;
        }
        if bytes[i] == b'/' && bytes.get(i + 1) == Some(&b'*') {
            i += 2;
            while i < bytes.len() && !(bytes[i] == b'*' && bytes.get(i + 1) == Some(&b'/')) {
                i += 1;
            }
            i += 2;
            continue;
        }
        if bytes[i] == b'>' {
            return Some((i + 1) as u32);
        }
        i += 1;
    }
    None
}

pub(super) fn is_self_closing_inner(source: &str, open_tag_end: u32, last_attr_end: u32) -> bool {
    let bytes = source.as_bytes();
    if open_tag_end < 2 {
        return false;
    }
    let mut i = open_tag_end as usize - 2;
    loop {
        match bytes[i] {
            b' ' | b'\t' | b'\n' | b'\r' => {
                if i == 0 {
                    return false;
                }
                i -= 1;
            }
            b'/' => {
                // A `/` that is at or before the last attribute's end is part
                // of the attribute value (e.g. `href=/` in `<a href=/>`) and
                // does NOT indicate self-closing syntax.
                if last_attr_end > 0 && (i as u32) < last_attr_end {
                    return false;
                }
                return true;
            }
            _ => return false,
        }
    }
}
