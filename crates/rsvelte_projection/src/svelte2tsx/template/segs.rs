//! Structured bake: segments.
//!
//! An element-opener bake (`<button class={cls} on:click={handler}>` →
//! `{ svelteHTML.createElement("button", {"class":cls,"onclick":handler,});`)
//! used to be a single `str.overwrite(el.start, opening_tag_end, &opener)`.
//! That collapses every original byte (including the user's expression
//! source) into a single edited chunk, which can only emit one source-map
//! segment for the whole opener — diagnostics on `cls` or `handler` map
//! back to the start of the opener instead of the exact column.
//!
//! The [`Seg`] enum below lets a producer return a list of (generated text,
//! preserved source range) chunks. [`emit_segmented_overwrite`] then splits
//! the wholesale overwrite into per-gap overwrites, leaving each `Seg::Src`
//! range untouched so its unedited chunk still emits per-character
//! mappings via `MagicString::generate_mappings`.
//!
//! Mirrors the JS reference's behaviour where every attribute / directive
//! expression is `prependLeft`/`appendRight` around the source span,
//! preserving the expression chunk inline.

use crate::svelte2tsx::magic_string::MagicString;
use crate::svelte2tsx::svelte2tsx::slice_src;
use std::fmt::{self, Write as _};

/// A piece of the structured bake output. `Lit` is generated text; `Src`
/// names a source byte range that should be kept as-is.
#[derive(Debug, Clone)]
pub(super) enum Seg {
    Lit(String),
    Src(u32, u32),
}

/// Push a literal segment, merging with the previous Lit when adjacent.
pub(super) fn segs_push_lit(segs: &mut Vec<Seg>, s: &str) {
    if s.is_empty() {
        return;
    }
    if let Some(Seg::Lit(last)) = segs.last_mut() {
        last.push_str(s);
    } else {
        segs.push(Seg::Lit(s.to_string()));
    }
}

/// Push formatted literal text without creating a temporary `String`.
pub(super) fn segs_push_fmt(segs: &mut Vec<Seg>, args: fmt::Arguments<'_>) {
    if let Some(Seg::Lit(last)) = segs.last_mut() {
        let _ = last.write_fmt(args);
    } else {
        let text = fmt::format(args);
        if !text.is_empty() {
            segs.push(Seg::Lit(text));
        }
    }
}

/// Push a source-range segment, with sanity checks against zero-length.
pub(super) fn segs_push_src(segs: &mut Vec<Seg>, start: u32, end: u32) {
    if start >= end {
        return;
    }
    segs.push(Seg::Src(start, end));
}

/// Flatten segments back into a string. Used by callers that still want
/// the wholesale bake (e.g. `build_attributes_string_with_tag`'s legacy
/// String API for the component path during the staged refactor).
pub(super) fn segs_to_string(segs: &[Seg], source: &str) -> String {
    let mut out = String::new();
    for seg in segs {
        match seg {
            Seg::Lit(s) => out.push_str(s),
            Seg::Src(s, e) => out.push_str(slice_src(source, *s as usize, *e as usize)),
        }
    }
    out
}

/// Returns true when no `Src` is present and every `Lit` is empty.
pub(super) fn segs_is_empty(segs: &[Seg]) -> bool {
    segs.iter().all(|s| match s {
        Seg::Lit(t) => t.is_empty(),
        Seg::Src(_, _) => false,
    })
}

/// Trim leading whitespace from the very first textual position in `segs`
/// (across leading whitespace-only `Lit` segments). Returns the resulting
/// vector with its head normalized — used by the element-opener leading
/// whitespace bookkeeping.
pub(super) fn segs_trim_start(segs: &mut Vec<Seg>) {
    while let Some(first) = segs.first_mut() {
        match first {
            Seg::Lit(s) => {
                let trimmed = s.trim_start_matches(|c: char| c.is_whitespace());
                if trimmed.is_empty() {
                    segs.remove(0);
                    continue;
                }
                if trimmed.len() != s.len() {
                    *s = trimmed.to_string();
                }
                break;
            }
            Seg::Src(_, _) => break,
        }
    }
}

/// Reorder-safe pre-pass for [`emit_segmented_overwrite`], which requires
/// `Seg::Src` ranges to appear in ascending source order (a MagicString can
/// only overwrite left-to-right). When a later segment references an earlier
/// source position — e.g. a `class:` / `style:` directive expression that #750
/// hoisted into the opener *suffix*, emitted *after* a following shorthand
/// attribute's preserved chunk (`<div style:color={b} {onclick}>`, #779) — bake
/// that out-of-order `Src` into a literal substring so the output stays valid
/// TSX. The common in-order case is left untouched, preserving the per-character
/// source mapping; only the rare hoisted-then-overtaken expression loses its
/// independent mapping (it becomes baked text in the suffix statement).
pub(super) fn bake_out_of_order_src(segs: Vec<Seg>, source: &str) -> Vec<Seg> {
    let mut last_end: u32 = 0;
    let mut out: Vec<Seg> = Vec::with_capacity(segs.len());
    for seg in segs {
        match seg {
            Seg::Src(s, e) if s >= last_end && s < e => {
                last_end = e;
                out.push(Seg::Src(s, e));
            }
            Seg::Src(s, e) => {
                let text = source.get(s as usize..e as usize).unwrap_or("").to_string();
                out.push(Seg::Lit(text));
            }
            lit => out.push(lit),
        }
    }
    out
}

/// Apply a list of segments to a MagicString, overwriting `[start, end)`
/// while preserving every `Seg::Src(s, e)` chunk as an unedited region —
/// the cornerstone of the structured bake. The unedited chunks survive
/// MagicString's per-character `generate_mappings` pass intact, so
/// diagnostics inside `<Component a={x} />` resolve to the exact column.
///
/// Invariants on `segments` (debug-asserted):
/// - `Src(s, e)` ranges appear in strictly increasing order.
/// - Each `Src(s, e)` lies within `[range_start, range_end]`.
pub(super) fn emit_segmented_overwrite(
    str: &mut MagicString,
    range_start: u32,
    range_end: u32,
    segments: &[Seg],
) {
    if range_start >= range_end {
        // Degenerate: still attach the pending literal at the boundary so
        // injected text doesn't get dropped. Use append_left to mimic the
        // current append-on-empty-range behaviour.
        let mut pending = String::new();
        for seg in segments {
            if let Seg::Lit(s) = seg {
                pending.push_str(s);
            }
            // Src segments inside a zero-length range are impossible — skip.
        }
        if !pending.is_empty() {
            str.append_left(range_start, &pending);
        }
        return;
    }

    let mut pending = String::new();
    let mut cursor = range_start;
    for seg in segments {
        match seg {
            Seg::Lit(s) => pending.push_str(s),
            Seg::Src(s, e) => {
                debug_assert!(
                    *s >= cursor && *e <= range_end && *s < *e,
                    "emit_segmented_overwrite: bad Src ({}, {}) for cursor {} range_end {}",
                    s,
                    e,
                    cursor,
                    range_end
                );
                if cursor < *s {
                    str.overwrite(cursor, *s, &pending);
                    pending.clear();
                } else if !pending.is_empty() {
                    // cursor == *s — overwrite would be empty range; use
                    // prepend_right so the literal lands before the
                    // preserved source chunk.
                    str.prepend_right(*s, &pending);
                    pending.clear();
                }
                cursor = *e;
            }
        }
    }
    if cursor < range_end {
        str.overwrite(cursor, range_end, &pending);
    } else if !pending.is_empty() {
        str.append_left(range_end, &pending);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn formatted_literal_appends_to_existing_segment() {
        let mut segs = vec![Seg::Lit("prefix".to_string())];

        segs_push_fmt(&mut segs, format_args!(":{}={}", "name", 42));

        assert_eq!(segs.len(), 1);
        assert!(matches!(&segs[0], Seg::Lit(text) if text == "prefix:name=42"));
    }

    #[test]
    fn formatted_literal_creates_segment_after_source() {
        let mut segs = vec![Seg::Src(2, 4)];

        segs_push_fmt(&mut segs, format_args!("\"{}\":{},", "value", true));

        assert_eq!(segs.len(), 2);
        assert!(matches!(&segs[1], Seg::Lit(text) if text == "\"value\":true,"));
    }

    #[test]
    fn test_emit_segmented_overwrite_preserves_src_chunk() {
        // Source: `<X attr={EXPR}>`. We bake `<X attr=` and `>` as
        // generated text and keep EXPR (positions 9..13) as a `Src`
        // chunk. The result must round-trip the original expression
        // text — that is the load-bearing invariant for source-map
        // fidelity in svelte-check.
        let source = "<X attr={WXYZ}>tail";
        let mut s = MagicString::new(source);
        let segs = vec![
            Seg::Lit("OPEN(".to_string()),
            Seg::Src(9, 13),
            Seg::Lit(")".to_string()),
        ];
        emit_segmented_overwrite(&mut s, 0, 15, &segs);
        assert_eq!(s.to_string(), "OPEN(WXYZ)tail");
    }

    #[test]
    fn test_emit_segmented_overwrite_handles_leading_src() {
        // Edge case: cursor lines up with the start of a Src chunk —
        // `prepend_right` must place the pending literal before it.
        let source = "ABCDE";
        let mut s = MagicString::new(source);
        let segs = vec![
            Seg::Lit("[".to_string()),
            Seg::Src(0, 3),
            Seg::Lit("]".to_string()),
        ];
        emit_segmented_overwrite(&mut s, 0, 5, &segs);
        // 'D' and 'E' (positions 3..5) are cleared by the final
        // overwrite of pending = "]" over [3, 5).
        assert_eq!(s.to_string(), "[ABC]");
    }

    #[test]
    fn test_emit_segmented_overwrite_empty_segments() {
        // Empty/literal-only segment lists collapse to a normal wholesale
        // overwrite — the structured bake is a strict superset.
        let source = "ABCDE";
        let mut s = MagicString::new(source);
        emit_segmented_overwrite(&mut s, 1, 4, &[Seg::Lit("xyz".to_string())]);
        assert_eq!(s.to_string(), "AxyzE");
    }
}
