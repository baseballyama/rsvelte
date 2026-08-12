//! `{@const …}` tags. Mirrors `htmlxtojsx_v2/nodes/ConstTag.ts`.

use crate::ast::template::ConstTag;
use crate::svelte2tsx::magic_string::MagicString;

/// Handle a const tag: `{@const declaration}`.
///
/// The const declaration is emitted as a regular `const` statement.
pub fn handle_const_tag(tag: &ConstTag, source: &str, str: &mut MagicString<'_>) {
    if tag.start >= tag.end {
        return;
    }

    // Mirror upstream svelte2tsx `handleConstTag`: overwrite `{@const ` →
    // `const ` up to `constTag.expression.start` (the pattern id) and the
    // closing `}` → `;` from `constTag.expression.end` (the initializer end).
    // The declaration's AST offsets are unreliable here — the template-expression
    // arena isn't resolved in the svelte2tsx parse path (so `as_json()` has no
    // declarator children), and since Svelte 5.56.4 the `VariableDeclaration`
    // `start` points at the `const` keyword (part of `@const`), which would
    // duplicate it (`const const area = …`). Derive the id start and initializer
    // end from the source text instead.
    if let Some((id_start, init_end)) = const_tag_spans(source, tag.start, tag.end) {
        // Overwrite `{@const ` prefix with `const `
        if tag.start < id_start {
            str.overwrite(tag.start, id_start, "const ");
        }
        // Overwrite trailing `}` (and any whitespace before it) with `;`
        if init_end < tag.end {
            str.overwrite(init_end, tag.end, ";");
        }
    } else {
        str.overwrite(tag.start, tag.end, " ");
    }
}

/// Byte offsets of a `{@const …}` tag's pattern id start and initializer end,
/// derived from the source between `tag_start` (`{`) and `tag_end` (past `}`).
/// The id start is the first non-whitespace byte after the `@const` keyword; the
/// initializer end is the last non-whitespace byte before the closing `}`.
pub fn const_tag_spans(source: &str, tag_start: u32, tag_end: u32) -> Option<(u32, u32)> {
    let bytes = source.as_bytes();
    let (lo, hi) = (tag_start as usize, tag_end as usize);
    if hi > bytes.len() || lo >= hi {
        return None;
    }
    // Skip `{`, `@`, the `const` keyword, then any whitespace → pattern id start.
    let inner = &source[lo..hi];
    let at = inner.find("@const")? + "@const".len();
    let mut i = lo + at;
    while i < hi && bytes[i].is_ascii_whitespace() {
        i += 1;
    }
    let id_start = i;
    // Scan back from the closing `}` over whitespace → initializer end.
    let mut j = hi.saturating_sub(1); // the `}` (tag_end is one past it)
    while j > id_start && bytes[j] != b'}' {
        j -= 1;
    }
    // j is now at `}`; step back over whitespace to the initializer's last byte.
    let mut end = j;
    while end > id_start && bytes[end - 1].is_ascii_whitespace() {
        end -= 1;
    }
    if id_start >= end {
        return None;
    }
    Some((
        u32::try_from(id_start).expect("template offset fits in u32"),
        u32::try_from(end).expect("template offset fits in u32"),
    ))
}
