//! The span of an element's start tag.
//!
//! Several rules report on svelte-eslint-parser's `SvelteStartTag`, which runs
//! from the `<` through the closing `>` — a node rsvelte's AST does not carry,
//! since the parser keeps only the element and its attributes.

use rsvelte_core::ast::template::Attribute;

const fn attr_end(a: &Attribute) -> u32 {
    match a {
        Attribute::Attribute(n) => n.end,
        Attribute::SpreadAttribute(n) => n.end,
        Attribute::AttachTag(n) => n.end,
        Attribute::BindDirective(n) => n.end,
        Attribute::OnDirective(n) => n.end,
        Attribute::ClassDirective(n) => n.end,
        Attribute::StyleDirective(n) => n.end,
        Attribute::TransitionDirective(n) => n.end,
        Attribute::AnimateDirective(n) => n.end,
        Attribute::UseDirective(n) => n.end,
        Attribute::LetDirective(n) => n.end,
    }
}

/// `(start, end)` of the start tag, `end` being just past its `>`.
///
/// The scan starts after the last attribute, so a `>` inside an attribute value
/// cannot be mistaken for the tag's own. `this_end` carries the virtual `this=`
/// of `<svelte:element>` / `<svelte:component>`, which the parser filters out of
/// `attributes`.
#[must_use]
pub fn start_tag_span(
    src: &str,
    el_start: u32,
    el_name_len: usize,
    attributes: &[Attribute],
    this_end: Option<u32>,
) -> Option<(u32, u32)> {
    let bytes = src.as_bytes();
    let name_end =
        el_start + 1 + u32::try_from(el_name_len).expect("element-name widths fit in u32");
    let scan_from = attributes
        .iter()
        .map(attr_end)
        .chain(this_end)
        .max()
        .unwrap_or(name_end)
        .max(name_end);
    let mut i = scan_from as usize;
    while i < bytes.len() {
        if bytes[i] == b'>' {
            return Some((
                el_start,
                u32::try_from(i + 1).expect("source offsets are represented as u32"),
            ));
        }
        i += 1;
    }
    None
}
