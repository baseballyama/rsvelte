//! `{@attach …}` tags. Mirrors `htmlxtojsx_v2/nodes/AttachTag.ts`.

use crate::ast::template::AttachTag;
use crate::svelte2tsx::magic_string::MagicString;

use crate::svelte2tsx::template::segs::{Seg, segs_push_lit, segs_push_src};
use crate::svelte2tsx::template::utils::expr::{get_expression_range, get_expression_text};

/// Handle an attach tag: `{@attach expression}`.
pub fn handle_attach_tag(tag: &AttachTag, str: &mut MagicString<'_>) {
    if tag.start >= tag.end {
        return;
    }
    // Attach tags are removed in TSX output
    str.overwrite(tag.start, tag.end, "");
}

/// Structured-bake variant of the `@attach` tag's inline emission.
pub fn format_attach_tag_segments(attach: &AttachTag, source: &str) -> Vec<Seg> {
    let mut out = Vec::new();
    segs_push_lit(&mut out, "[Symbol(\"@attach\")]:");
    if let Some((s, e)) = get_expression_range(&attach.expression) {
        segs_push_src(&mut out, s, e);
    } else {
        segs_push_lit(&mut out, get_expression_text(&attach.expression, source));
    }
    segs_push_lit(&mut out, ",");
    out
}
