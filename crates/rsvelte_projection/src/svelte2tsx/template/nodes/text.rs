//! Text nodes. Mirrors `htmlxtojsx_v2/nodes/Text.ts`.

use crate::ast::template::Text;
use crate::svelte2tsx::magic_string::MagicString;

/// Handle a text node.
///
/// Text nodes in svelte2tsx have their non-whitespace characters removed
/// (replaced with empty). Whitespace characters are kept as-is.
/// If the result is empty but the original text had content, at least 1
/// space is preserved (to prevent hover artifacts in the language server).
pub(crate) fn handle_text(text: &Text, _source: &str, str: &mut MagicString<'_>) {
    handle_text_trimmed(text, str, false, false);
}

/// `handle_text` for a node whose `data` the Svelte-4 AST conversion trimmed.
///
/// `legacy.js::remove_surrounding_whitespace_nodes` strips the leading /
/// trailing whitespace off the first / last `Text` child of a
/// `<svelte:boundary>` or a `{#snippet}` body without moving its `start`/`end`,
/// so svelte2tsx blanks the whole source range but computes the replacement
/// from the trimmed data.
pub(crate) fn handle_text_trimmed(
    text: &Text,
    str: &mut MagicString<'_>,
    trim_start: bool,
    trim_end: bool,
) {
    if text.start >= text.end {
        return;
    }
    let mut data: &str = &text.data;
    if trim_start {
        data = data.trim_start();
    }
    if trim_end {
        data = data.trim_end();
    }
    // Mirror JS reference (`htmlxtojsx_v2/nodes/Text.ts`) exactly: it inspects
    // `node.data` — the *decoded* inner text (HTML entities resolved, e.g.
    // `&nbsp;` → U+00A0) — and emits `node.data.replace(/\S/g, '')`, i.e. it
    // strips every non-whitespace character and keeps the whitespace as-is.
    // If nothing survives but the data was non-empty, a single space is kept
    // (so hovering over text doesn't surface the containing tag's info).
    //
    // Using `node.data` rather than the raw source range is essential: the raw
    // range for `&nbsp;` is the literal `&nbsp;`, which is invalid JS and made
    // oxfmt reject the whole output. The decoded U+00A0 is a JS whitespace
    // character, so it formats away cleanly like any other whitespace.
    if data.is_empty() {
        return;
    }
    let mut replacement: String = data.chars().filter(|c| c.is_whitespace()).collect();
    if replacement.is_empty() {
        replacement = " ".to_string();
    }
    str.overwrite(text.start, text.end, &replacement);
}
