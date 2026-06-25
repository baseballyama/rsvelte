//! Fast Svelte 5 formatter.
//!
//! Architecture: rsvelte parses the `.svelte` file, this crate walks the
//! resulting AST and formats each piece by delegating to the right engine:
//!
//! - `<script>` / `<script context="module">`: re-parse the body with
//!   `oxc_parser` and format via `oxc_formatter::Formatter`.
//! - `<style>`: TODO (verbatim for now).
//! - markup + `{expr}`: TODO (verbatim for now).
//!
//! The current skeleton only handles `<script>` bodies; the rest of the
//! source is passed through unchanged. Subsequent iterations will add
//! CSS formatting and markup Doc IR composition.

mod collapse;
mod doc;
mod error;
mod expression;
mod indent;
mod json;
mod markup;
mod options;
mod prettier_ignore;
mod reindent;
mod script;
mod sort_order;
mod style;

pub use error::FormatError;
pub use json::{JsonVariant, format_json_source};
pub use options::{FormatOptions, StyleFormatter};
pub use script::format_js_source;
pub use style::reindent;

// Re-exports so consumers don't need to depend on `oxc_formatter` directly.
pub use oxc_formatter::JsFormatOptions;
pub use oxc_formatter_core::{IndentStyle, IndentWidth, LineWidth};
pub use oxc_formatter_json::JsonFormatOptions;

use rsvelte_core::{ParseOptions, parse};

/// Format a Svelte source string.
///
/// On success returns the formatted source. On failure returns the parse
/// or formatting error, leaving the source untouched.
pub fn format(source: &str, options: &FormatOptions) -> Result<String, FormatError> {
    // A plain `<script>` (no `lang="ts"`) may still contain TypeScript: oxfmt /
    // prettier-plugin-svelte parse Svelte `<script>` as TS by default, so e.g.
    // `import type { X }` or `let c: typeof C<any>` are valid input there. Try a
    // normal (JS) parse first; only when that fails retry forcing TS, so the vast
    // majority of components (valid JS, or already `lang="ts"`) are untouched and
    // cannot regress — only previously-erroring TS-in-plain-`<script>` files gain
    // formatting. The TS retry sets `is_typescript` on the scripts, so the
    // dialect detection below threads TS through every template expression too.
    let root = match parse(source, ParseOptions::default()) {
        Ok(root) => root,
        Err(_) => parse(
            source,
            ParseOptions {
                force_typescript: true,
                ..ParseOptions::default()
            },
        )
        .map_err(FormatError::from_parse)?,
    };

    let mut edits: Vec<(u32, u32, String)> = Vec::new();

    // A component is TypeScript if either `<script>` block declares
    // `lang="ts"`. Template `{expr}` / attribute / pattern source must then
    // be parsed in the same dialect as the script body, so `{value as
    // string}` and friends round-trip instead of erroring as JS (#682).
    // Thread the flag via a per-document clone — the shared `&FormatOptions`
    // is never mutated, so parallel `format()` calls stay independent.
    let typescript = [root.instance.as_deref(), root.module.as_deref()]
        .into_iter()
        .flatten()
        .any(|script| script.is_typescript);
    let ts_options;
    let options = if typescript && !options.typescript {
        ts_options = FormatOptions {
            typescript: true,
            ..options.clone()
        };
        &ts_options
    } else {
        options
    };

    for script in [root.instance.as_deref(), root.module.as_deref()]
        .into_iter()
        .flatten()
    {
        if let Some((start, end, formatted)) = script::format_script(source, script, options)? {
            edits.push((start, end, formatted));
        }
        if let Some(edit) = script::format_open_tag(source, script.start, script.end, options) {
            edits.push(edit);
        }
    }

    // Open-tag and close-tag rewrites first — they own the element-tag
    // spans including their attribute lists. The expression and indent
    // passes below target spans outside those rewritten regions.
    markup::collect_open_tag_edits(source, &root.fragment, 0, options, &mut edits)?;
    if let Some(opts) = &root.options {
        markup::collect_options_open_tag_edit(source, opts, options, &mut edits)?;
    }
    expression::collect_template_edits(source, &root.fragment, 0, options, &mut edits)?;
    indent::collect_indent_edits(source, &root.fragment, 0, options, &mut edits)?;
    if let Some(css) = &root.css {
        // Normalize the `<style …>` open tag (e.g. strip trailing space from
        // `<style >`) using the same routine that normalises `<script>` tags.
        if let Some(edit) = script::format_open_tag(source, css.start, css.end, options) {
            edits.push(edit);
        }
        style::collect_style_edit(source, css, options, &mut edits)?;
    }
    // `<style>` elements nested in the markup (e.g. in `<svelte:head>` or a
    // wrapper element) aren't hoisted into `root.css`, so format them here.
    style::collect_nested_style_edits(source, &root.fragment, options, &mut edits)?;

    // Snapshot the top-level section spans (options / module / instance script /
    // style) and remap them through the pending edits, so the reorder post-pass
    // can run on the formatted output WITHOUT re-parsing it. An edit never
    // straddles a top-level element boundary, so a boundary's new offset is its
    // original offset plus the net length change of every edit ending at or
    // before it. Only collect spans when reordering could change something
    // (more than one top-level unit); otherwise the pass is skipped entirely.
    let mut sections: Vec<(u8, u32, u32)> = Vec::new();
    if let Some(o) = &root.options {
        sections.push((sort_order::P_OPTIONS, o.start, o.end));
    }
    if let Some(m) = &root.module {
        sections.push((sort_order::P_MODULE, m.start, m.end));
    }
    if let Some(i) = &root.instance {
        sections.push((sort_order::P_INSTANCE, i.start, i.end));
    }
    if let Some(c) = &root.css {
        sections.push((sort_order::P_STYLE, c.start, c.end));
    }
    let has_markup = root.fragment.nodes.iter().any(|n| {
        !matches!(n, rsvelte_core::ast::template::TemplateNode::Text(t) if t.data.trim().is_empty())
    });
    let reorder_spans: Vec<(u8, usize, usize)> =
        if sections.len() > 1 || (sections.len() == 1 && has_markup) {
            let remap = |pos: u32| -> usize {
                let delta: isize = edits
                    .iter()
                    .filter(|(_, end, _)| *end <= pos)
                    .map(|(start, end, repl)| repl.len() as isize - (*end - *start) as isize)
                    .sum();
                (pos as isize + delta) as usize
            };
            sections
                .iter()
                .map(|&(p, s, e)| (p, remap(s), remap(e)))
                .collect()
        } else {
            Vec::new()
        };

    // Apply edits from the back so earlier offsets remain valid.
    edits.sort_by_key(|(start, _, _)| std::cmp::Reverse(*start));
    let mut out = source.to_string();
    // Track the range of the last applied non-zero-length edit so we can skip
    // any subsequent edit whose range overlaps it.  Two passes (markup.rs and
    // indent.rs) can both emit an edit for the same span — e.g. markup.rs
    // replaces trailing whitespace with `</tag>` at the same `[start, end)`
    // that indent.rs would normalise to `\n{indent}`.  Markup edits are pushed
    // first (lib.rs line 100 before line 105), so after the stable descending
    // sort they appear before indent edits with the same start.  The first one
    // wins; the second is skipped here to avoid a double-replace that would
    // clobber the first replacement.
    let mut last_applied: (u32, u32) = (u32::MAX, u32::MAX);
    for (start, end, new_text) in edits {
        let (la_s, la_e) = last_applied;
        let incoming_nonempty = end > start;
        let applied_nonempty = la_e > la_s;
        // Two non-zero-length edits overlap when their ranges intersect.
        // Zero-length inserts (start == end) never conflict with a range edit
        // because they don't consume any source bytes.
        let overlaps = applied_nonempty && incoming_nonempty && start < la_e && end > la_s;
        if overlaps {
            continue;
        }
        out.replace_range(start as usize..end as usize, &new_text);
        // Only update the guard for non-zero-length edits (range replacements).
        // Zero-length inserts don't "own" a range.
        if end > start {
            last_applied = (start, end);
        }
    }

    // Post-pass: reorder top-level sections into prettier's canonical order
    // (options → module script → instance script → markup → styles) and
    // normalize the blank lines between top-level units. Runs before collapse;
    // the two are orthogonal — collapse only touches inline elements inside the
    // markup fragment, never the section order.
    if !reorder_spans.is_empty() {
        out = sort_order::reorder_sections(&out, reorder_spans);
    }

    // Post-pass: collapse pure-text elements onto one line when they fit.
    out = collapse::collapse_pure_text_elements(&out, options)?;

    // Start the file at content: prettier / oxfmt strip leading blank lines and
    // indentation before the first node (e.g. a markdown code block that begins
    // with a blank line, or a leading newline before `<svelte:options>`).
    let lead = out.len() - out.trim_start_matches([' ', '\t', '\r', '\n']).len();
    if lead > 0 {
        out.drain(..lead);
    }

    // End the file with exactly one newline (prettier / oxfmt `insertFinalNewline`).
    let trimmed_len = out.trim_end_matches([' ', '\t', '\r', '\n']).len();
    out.truncate(trimmed_len);
    if !out.is_empty() {
        out.push('\n');
    }

    Ok(out)
}
