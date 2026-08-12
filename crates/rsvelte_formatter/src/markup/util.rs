use oxc_formatter::JsFormatOptions;
use rsvelte_core::ast::template::Attribute;

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

// ─── source-scan helpers ────────────────────────────────────────────────

pub(super) const fn attribute_span(attr: &Attribute) -> (u32, u32) {
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
    let scan_from = attributes.last().map_or_else(
        || {
            // Skip the leading `<` and consume tag-name chars.
            let bytes = source.as_bytes();
            let mut i = element_start as usize + 1;
            while i < bytes.len() && !matches!(bytes[i], b' ' | b'\t' | b'\n' | b'\r' | b'>' | b'/')
            {
                i += 1;
            }
            i
        },
        |last| attribute_span(last).1 as usize,
    );

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
            return Some(crate::source_offset(i + 1));
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
                if last_attr_end > 0 && (crate::source_offset(i)) < last_attr_end {
                    return false;
                }
                return true;
            }
            _ => return false,
        }
    }
}
