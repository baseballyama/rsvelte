//! Top-level section ordering (`svelteSortOrder`).
//!
//! prettier-plugin-svelte prints a component's top-level sections in a fixed
//! canonical order regardless of their source order (its default
//! `svelteSortOrder = "options-scripts-markup-styles"`):
//!
//! ```text
//! <svelte:options/>
//! <script context="module">…</script>
//! <script>…</script>
//! …markup…
//! <style>…</style>
//! ```
//!
//! rsvelte formats every section in place, preserving source order, so a file
//! that writes e.g. `<style>` before its markup, or `<script>` after it, ends
//! up ordered differently from the oracle. This pass runs last, on the already
//! formatted output, and reassembles the sections in canonical order.
//!
//! Leading comments travel with the node that follows them (prettier attaches a
//! comment to the next node): a comment-only run directly preceding a section
//! (options / scripts / style) is that section's leading comment and moves with
//! it; a run containing any markup is itself markup.
//!
//! prettier-plugin-svelte / oxfmt always insert exactly one blank line between
//! adjacent top-level units (sections + markup runs). This pass normalises those
//! gaps even when the sections are already in canonical order.
//!
//! Exception: a comment that immediately precedes a section (no blank line
//! between the `-->` and the opening tag in the source) is kept without an
//! intervening blank line — the blank line only appears before the comment,
//! separating it from the previous unit.

use rsvelte_core::{ParseOptions, parse};

/// Canonical priority of each section. Markup is priority 3.
const P_OPTIONS: u8 = 0;
const P_MODULE: u8 = 1;
const P_INSTANCE: u8 = 2;
const P_MARKUP: u8 = 3;
const P_STYLE: u8 = 4;

/// A top-level unit in source order: a section (with any attached leading
/// comment) or a markup run.
struct Unit {
    priority: u8,
    text: String,
}

/// Reassemble `out`'s top-level sections in canonical order with exactly one
/// blank line between each top-level unit. Returns `out` unchanged when it
/// cannot be re-parsed.
pub(crate) fn reorder_sections(out: &str) -> String {
    let Ok(root) = parse(out, ParseOptions::default()) else {
        return out.to_string();
    };

    // Anchored (non-markup) sections, sorted by source position.
    let mut sections: Vec<(u8, usize, usize)> = Vec::new();
    if let Some(o) = &root.options {
        sections.push((P_OPTIONS, o.start as usize, o.end as usize));
    }
    if let Some(m) = &root.module {
        sections.push((P_MODULE, m.start as usize, m.end as usize));
    }
    if let Some(i) = &root.instance {
        sections.push((P_INSTANCE, i.start as usize, i.end as usize));
    }
    if let Some(c) = &root.css {
        sections.push((P_STYLE, c.start as usize, c.end as usize));
    }
    if sections.is_empty() {
        return out.to_string();
    }
    sections.sort_by_key(|&(_, start, _)| start);

    // Build units in source order. A comment-only gap before a section is that
    // section's leading comment; any other non-empty gap is a markup unit.
    let mut units: Vec<Unit> = Vec::new();
    let mut cursor = 0usize;
    for &(priority, start, end) in &sections {
        let gap = &out[cursor..start];
        let gap_trim = gap.trim();
        if !gap_trim.is_empty() && is_comment_only(gap) {
            // The gap is a comment-only block — it becomes the leading comment
            // of this section.  Preserve the separator between the comment and
            // the section as it appears in the source: a blank line (`\n\n`)
            // if the source had one, a single newline otherwise.
            let after_comment_offset = gap.rfind("-->").map_or(0, |i| i + 3);
            let after_comment = &gap[after_comment_offset..];
            let separator = if after_comment.contains("\n\n") || after_comment.contains("\r\n\r\n")
            {
                "\n\n"
            } else {
                "\n"
            };
            let section_text = out[start..end].trim();
            units.push(Unit {
                priority,
                text: format!("{gap_trim}{separator}{section_text}"),
            });
        } else {
            if !gap_trim.is_empty() {
                units.push(Unit {
                    priority: P_MARKUP,
                    text: gap_trim.to_string(),
                });
            }
            let section_text = out[start..end].trim();
            units.push(Unit {
                priority,
                text: section_text.to_string(),
            });
        }
        cursor = cursor.max(end);
    }
    if cursor < out.len() {
        let trailing = out[cursor..].trim();
        if !trailing.is_empty() {
            units.push(Unit {
                priority: P_MARKUP,
                text: trailing.to_string(),
            });
        }
    }

    // Check whether the file is already in canonical (non-decreasing priority)
    // order.
    let is_canonical = units.windows(2).all(|w| w[0].priority <= w[1].priority);

    if !is_canonical {
        // `slice::sort_by_key` is stable, so equal-priority units (e.g. two
        // markup runs that a section split) keep their source order.
        units.sort_by_key(|u| u.priority);
    }

    // Merge consecutive markup units: when two markup runs end up adjacent after
    // sorting (e.g. `<script-foo>` and `<style-foo>` both land between `<script>`
    // and `<style>`), prettier / oxfmt renders them as a single markup block with
    // a single newline between them, not a blank line.
    let units = {
        let mut merged: Vec<Unit> = Vec::with_capacity(units.len());
        for unit in units {
            if unit.priority == P_MARKUP
                && merged.last().is_some_and(|last| last.priority == P_MARKUP)
            {
                let last = merged.last_mut().expect("checked above");
                last.text.push('\n');
                last.text.push_str(&unit.text);
            } else {
                merged.push(unit);
            }
        }
        merged
    };

    // Reassemble with exactly one blank line between every pair of adjacent
    // units. prettier / oxfmt always insert one blank line between top-level
    // sections (options / scripts / markup / style).
    let mut result = units
        .into_iter()
        .map(|u| u.text)
        .collect::<Vec<_>>()
        .join("\n\n");
    if !result.is_empty() {
        result.push('\n');
    }
    result
}

/// Whether `s` contains only HTML comments and whitespace.
fn is_comment_only(s: &str) -> bool {
    let mut rest = s.trim();
    while let Some(open) = rest.find("<!--") {
        if !rest[..open].trim().is_empty() {
            return false;
        }
        let after = &rest[open + 4..];
        let Some(close) = after.find("-->") else {
            return false;
        };
        rest = after[close + 3..].trim_start();
    }
    rest.is_empty()
}
