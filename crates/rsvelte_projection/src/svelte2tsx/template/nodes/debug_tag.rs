//! `{@debug …}` tags. Mirrors `htmlxtojsx_v2/nodes/DebugTag.ts`.

use crate::ast::template::DebugTag;
use crate::svelte2tsx::magic_string::MagicString;

use crate::svelte2tsx::template::utils::expr::{get_expression_range, get_expression_text};

/// Handle a debug tag: `{@debug identifiers}`.
///
/// `{@debug myfile}` → `;myfile;`
/// `{@debug a, b}` → `;a;b;`
///
/// Each identifier is left as an unchanged source chunk (with `;`
/// inserted before and after) so per-character source-map segments
/// resolve diagnostics to the user's identifier position, not the
/// `{@debug` anchor.
pub(crate) fn handle_debug_tag(tag: &DebugTag, source: &str, str: &mut MagicString<'_>) {
    if tag.start >= tag.end {
        return;
    }
    let mut idents: Vec<(u32, u32)> = Vec::with_capacity(tag.identifiers.len());
    for ident in &tag.identifiers {
        if let Some(range) = get_expression_range(ident) {
            idents.push(range);
        }
    }
    // Fall back to the previous one-shot rewrite when no identifiers
    // expose a usable span — keeps the synthesised path identical.
    if idents.is_empty() {
        let mut replacement = String::new();
        replacement.push(';');
        for ident in &tag.identifiers {
            let text = get_expression_text(ident, source);
            replacement.push_str(text);
            replacement.push(';');
        }
        str.overwrite(tag.start, tag.end, &replacement);
        return;
    }
    // Replace `{@debug ` with `;`, then between every identifier replace
    // the source separator (`,` plus optional whitespace) with `;`, then
    // replace the trailing `}` with `;`.
    let first_start = idents[0].0;
    str.overwrite(tag.start, first_start, ";");
    for window in idents.windows(2) {
        let prev_end = window[0].1;
        let next_start = window[1].0;
        if prev_end < next_start {
            str.overwrite(prev_end, next_start, ";");
        }
    }
    let last_end = idents.last().unwrap().1;
    if last_end < tag.end {
        str.overwrite(last_end, tag.end, ";");
    }
}
