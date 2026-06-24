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

/// Canonical priority of each section. Markup is priority 3. The caller
/// (`lib.rs`) tags each section span with one of these.
pub(crate) const P_OPTIONS: u8 = 0;
pub(crate) const P_MODULE: u8 = 1;
pub(crate) const P_INSTANCE: u8 = 2;
const P_MARKUP: u8 = 3;
pub(crate) const P_STYLE: u8 = 4;

/// A top-level unit in source order: a section (with any attached leading
/// comment) or a markup run.
struct Unit {
    priority: u8,
    text: String,
}

/// Reassemble the top-level sections of `out` in canonical order with exactly
/// one blank line between each top-level unit.
///
/// `sections` is the list of `(priority, start, end)` byte spans of the
/// non-markup sections (options / module / instance script / style) **in `out`'s
/// coordinates** — the caller remaps them from the parsed source through the
/// applied edits, so this pass never re-parses. Markup is everything else.
pub(crate) fn reorder_sections(out: &str, mut sections: Vec<(u8, usize, usize)>) -> String {
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
        let section_text = out[start..end].trim();

        // A comment run glued to the section (no other markup between the last
        // `-->` and the opening tag) is the section's leading comment and travels
        // with it. This is the whole gap when it is comment-only, or just the
        // trailing comment run when markup precedes it (e.g.
        // `</div>\n<!-- … -->\n<style>` — the comment leads `<style>`, not the
        // markup). The preceding markup, if any, stays a markup unit.
        let (markup_part, comment_run): (&str, &str) = if gap_trim.is_empty() {
            ("", "")
        } else if is_comment_only(gap) {
            ("", gap_trim)
        } else {
            split_trailing_comment_run(gap).unwrap_or((gap_trim, ""))
        };

        if !markup_part.is_empty() {
            units.push(Unit {
                priority: P_MARKUP,
                text: markup_part.to_string(),
            });
        }

        if comment_run.is_empty() {
            units.push(Unit {
                priority,
                text: section_text.to_string(),
            });
        } else {
            // Preserve the separator between the comment and the section as in
            // the source: a blank line (`\n\n`) if the source had one between the
            // last `-->` and the opening tag, a single newline otherwise.
            let after_comment_offset = gap.rfind("-->").map_or(0, |i| i + 3);
            let after_comment = &gap[after_comment_offset..];
            let separator = if after_comment.contains("\n\n") || after_comment.contains("\r\n\r\n")
            {
                "\n\n"
            } else {
                "\n"
            };
            units.push(Unit {
                priority,
                text: format!("{comment_run}{separator}{section_text}"),
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

/// Split a gap that ends with a run of HTML comments glued to the following
/// section into `(markup_before, trailing_comment_run)`.
///
/// The trailing comment run is everything after the last non-comment,
/// non-whitespace character — i.e. the comments (and whitespace) that sit
/// directly before the section with no intervening markup. Returns `None` when
/// there is no markup before it (the comment-only path handles that) or no
/// trailing comment at all. UTF-8 safe: markup may contain multi-byte text.
fn split_trailing_comment_run(gap: &str) -> Option<(&str, &str)> {
    let mut last_markup_end = 0usize;
    let mut base = 0usize; // byte offset of `rest` within `gap`
    let mut rest = gap;
    loop {
        match rest.find("<!--") {
            Some(open) => {
                // Characters before this comment are markup-or-whitespace; record
                // the byte offset just past the last non-whitespace one.
                if let Some(p) = rest[..open].rfind(|c: char| !c.is_whitespace()) {
                    let ch_len = rest[p..].chars().next().map_or(1, char::len_utf8);
                    last_markup_end = base + p + ch_len;
                }
                let after_open = open + 4;
                match rest[after_open..].find("-->") {
                    Some(close) => {
                        let consumed = after_open + close + 3;
                        base += consumed;
                        rest = &rest[consumed..];
                    }
                    // Unterminated comment — treat the remainder as markup.
                    None => {
                        last_markup_end = gap.len();
                        break;
                    }
                }
            }
            None => {
                if let Some(p) = rest.rfind(|c: char| !c.is_whitespace()) {
                    let ch_len = rest[p..].chars().next().map_or(1, char::len_utf8);
                    last_markup_end = base + p + ch_len;
                }
                break;
            }
        }
    }
    let markup = gap[..last_markup_end].trim();
    let comment_run = gap[last_markup_end..].trim();
    if markup.is_empty() || comment_run.is_empty() {
        None
    } else {
        Some((markup, comment_run))
    }
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
