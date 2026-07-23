//! Fast Svelte 5 formatter.
//!
//! Architecture: rsvelte parses the `.svelte` file, this crate walks the
//! resulting AST and formats each piece by delegating to the right engine:
//!
//! - `<script>` / `<script context="module">`: re-parse the body with
//!   `oxc_parser` and format via `oxc_formatter::Formatter`.
//! - `<style>`: formatted via the `oxc_formatter_css` engine (see
//!   `options::StyleFormatter`).
//! - markup + `{expr}`: normalized by the `markup` / `expression` passes and
//!   the `collapse` child-layout pass.

mod children;
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
mod scratch;
mod script;
mod sort_order;
mod style;
mod style_css;
mod tailwind_sort;

pub use error::FormatError;
pub use json::{JsonVariant, format_json_source};
pub use options::{ClassSorter, FormatOptions, StyleFormatter};
pub use script::format_js_source;
pub use sort_order::SortOrderSpec;
pub use style::reindent;
pub use style_css::{
    CssDialect, CssOptions, SingleQuote as CssSingleQuote, TrailingCommas as CssTrailingCommas,
    css_variant_from_lang, format_css_source, native_style_formatter,
};

// Re-exports so consumers don't need to depend on `oxc_formatter` directly.
pub use oxc_formatter::{JsFormatOptions, SortImportsOptions};
pub use oxc_formatter_core::{IndentStyle, IndentWidth, LineWidth};
pub use oxc_formatter_css::CssFormatOptions;
pub use oxc_formatter_json::JsonFormatOptions;

use rsvelte_core::{ParseOptions, parse};

/// Whether a text node's (decoded) data is insignificant whitespace.
///
/// Unlike `str::trim().is_empty()`, this treats only ASCII whitespace as
/// blank. U+00A0 (the decoded form of `&nbsp;`) and other non-ASCII Unicode
/// whitespace are significant content that prettier / oxfmt preserve, so a
/// text node whose only content is `&nbsp;` must NOT be collapsed away as an
/// empty fragment. Matches `trim().is_empty()` for every other input (empty
/// string and pure ASCII-whitespace both return `true`).
pub(crate) fn is_blank_text(s: &str) -> bool {
    s.chars()
        .all(|c| matches!(c, ' ' | '\t' | '\n' | '\r' | '\u{0b}' | '\u{0c}'))
}

/// Reusable scratch buffers for [`format_with_arenas`], letting a hot loop
/// over many files amortize the per-file allocations. Cleared (not freed) at
/// each `format_with_arenas` entry, so a worker thread reuses one instance's
/// capacity across every file it formats.
#[derive(Default)]
pub struct Arenas {
    edits: Vec<(u32, u32, String)>,
}

impl Arenas {
    pub fn new() -> Self {
        Self::default()
    }
}

/// Format a Svelte source string.
///
/// On success returns the formatted source. On failure returns the parse
/// or formatting error, leaving the source untouched.
pub fn format(source: &str, options: &FormatOptions) -> Result<String, FormatError> {
    format_with_arenas(source, options, &mut Arenas::new())
}

/// [`format`] over caller-owned scratch buffers. A loop formatting many files
/// keeps one [`Arenas`] and passes it each call, reusing its capacity instead
/// of reallocating per file.
pub fn format_with_arenas(
    source: &str,
    options: &FormatOptions,
    arenas: &mut Arenas,
) -> Result<String, FormatError> {
    // Free the previous file's throwaway expression/script parses; this file's
    // parses reuse the same arena chunk (see `scratch`).
    scratch::reset();
    // Drop the previous file's memoized expression results.
    expression::clear_expr_memo();

    // A plain `<script>` (no `lang="ts"`) may still contain TypeScript: oxfmt /
    // prettier-plugin-svelte parse Svelte `<script>` as TS by default, so e.g.
    // `import type { X }` or `let c: typeof C<any>` are valid input there. Try a
    // normal (JS) parse first; only when that fails retry forcing TS, so the vast
    // majority of components (valid JS, or already `lang="ts"`) are untouched and
    // cannot regress — only previously-erroring TS-in-plain-`<script>` files gain
    // formatting. The TS retry sets `is_typescript` on the scripts, so the
    // dialect detection below threads TS through every template expression too.
    // A `<style lang="scss|less|postcss|…">` body is not plain CSS, so parsing it
    // as CSS would abort the whole-file parse (`css_expected_identifier` on `//`
    // comments, `$variables`, maps, …). prettier-plugin-svelte treats these as
    // opaque preprocessor input and leaves them untouched; mirror that by skipping
    // the CSS parse for non-CSS `lang` blocks (the body is left verbatim below).
    let parse_options = ParseOptions {
        skip_non_css_lang_style: true,
        // The formatter reformats every expression by re-parsing its source
        // span with oxc and reads only node spans/structure from the Svelte
        // AST — never the typed expression `loc` objects — so skip building
        // them (and the per-parse line-offset table they need).
        skip_expression_loc: true,
        ..ParseOptions::default()
    };
    let root = match parse(source, &rsvelte_core::Allocator::default(), parse_options) {
        Ok(root) => root,
        Err(_) => parse(
            source,
            &rsvelte_core::Allocator::default(),
            ParseOptions {
                force_typescript: true,
                ..parse_options
            },
        )
        .map_err(FormatError::from_parse)?,
    };

    // Reuse the arena's edit buffer: take it out (leaving the arena empty),
    // refill it below, and hand it back before returning on the success path.
    let mut edits: Vec<(u32, u32, String)> = std::mem::take(&mut arenas.edits);
    edits.clear();

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
    // Install `root.arena` as the serialize arena for the template walk: a
    // `{@const}`'s `VariableDeclaration` carries its declarators as arena
    // children (allocated into `root.arena` at parse time), so `push_const_tag`
    // reads the first declarator's span via `decl.as_json()`. Without the arena
    // installed, `to_value` falls back to an empty thread-local deser arena and
    // the declarations come back empty.
    rsvelte_core::ast::arena::with_serialize_arena(&root.arena, || {
        expression::collect_template_edits(source, &root.fragment, 0, options, &mut edits)
    })?;
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
    let so = &options.sort_order;
    let mut sections: Vec<(u8, u32, u32)> = Vec::new();
    if let Some(o) = &root.options {
        sections.push((so.options, o.start, o.end));
    }
    if let Some(m) = &root.module {
        sections.push((so.module, m.start, m.end));
    }
    if let Some(i) = &root.instance {
        sections.push((so.instance, i.start, i.end));
    }
    if let Some(c) = &root.css {
        sections.push((so.style, c.start, c.end));
    }
    let has_markup = root.fragment.nodes.iter().any(|n| {
        !matches!(n, rsvelte_core::ast::template::TemplateNode::Text(t) if crate::is_blank_text(t.data.as_str()))
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

    let mut out = apply_edits(source, &mut edits);
    // Return the drained buffer to the arena so its capacity is reused.
    arenas.edits = edits;

    // Post-pass: reorder top-level sections into prettier's canonical order
    // (options → module script → instance script → markup → styles) and
    // normalize the blank lines between top-level units. Runs before collapse;
    // the two are orthogonal — collapse only touches inline elements inside the
    // markup fragment, never the section order.
    if !reorder_spans.is_empty() {
        out = sort_order::reorder_sections(&out, reorder_spans, so.markup, so.reorder);
    }

    // Post-pass: collapse pure-text elements onto one line when they fit. Skip
    // its full re-parse when the source tree has no element a collapse pass could
    // reflow (checked here so the cheap gate reuses this parse instead of paying
    // collapse's own).
    let has_collapse_candidate = collapse::fragment_has_collapse_candidate(&root.fragment);
    out = collapse::collapse_pure_text_elements(&out, options, has_collapse_candidate)?;

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

/// Splice the collected edits into `source` in one forward pass, draining
/// `edits` (left empty for buffer reuse).
///
/// Edits are `(start, end, replacement)` in original-source byte offsets. The
/// overlap and ordering rules the edit passes depend on:
///
/// - Two intersecting non-zero-length edits: the larger-start one wins, the
///   other is dropped. In practice only markup.rs vs indent.rs on an identical
///   span collide today.
/// - At a shared start, a zero-length insert is spliced **before** a surviving
///   range edit (insert-then-replace) — e.g. indent.rs's `\n{indent}` lands
///   before markup.rs's rewritten open tag. This is decided explicitly here,
///   not left to the old back-to-front loop's incidental behaviour (which, for
///   this exact shape, dropped the insert and consumed a source byte). The
///   corpus doesn't currently produce this shape, so making it explicit leaves
///   every corpus output byte-identical; the unit tests below lock in the
///   intended semantics.
/// - Multiple inserts at one position keep the order the old apply produced
///   (last-pushed first).
fn apply_edits(source: &str, edits: &mut Vec<(u32, u32, String)>) -> String {
    // Select survivors in descending-start order so the overlap tie-break
    // matches the historical back-to-front `replace_range` loop.
    edits.sort_by_key(|(start, _, _)| std::cmp::Reverse(*start));
    let mut last_applied: (u32, u32) = (u32::MAX, u32::MAX);
    let mut survivors: Vec<(u32, u32, String)> = Vec::with_capacity(edits.len());
    for (start, end, new_text) in edits.drain(..) {
        let (la_s, la_e) = last_applied;
        let incoming_nonempty = end > start;
        let applied_nonempty = la_e > la_s;
        // Two non-zero-length edits overlap when their ranges intersect. A
        // zero-length insert consumes no bytes, so it never conflicts and never
        // owns a range (it leaves `last_applied` untouched).
        let overlaps = applied_nonempty && incoming_nonempty && start < la_e && end > la_s;
        if overlaps {
            continue;
        }
        if end > start {
            last_applied = (start, end);
        }
        survivors.push((start, end, new_text));
    }

    // `reverse` turns the descending-start survivors into ascending start with
    // same-start edits in reverse push order (what the old loop produced for
    // coincident inserts). The stable re-sort then pins the one deliberate
    // rule: at a shared start a zero-length insert precedes the range edit.
    survivors.reverse();
    survivors.sort_by_key(|(start, end, _)| (*start, u8::from(*end > *start)));

    let out_cap = source.len() + survivors.iter().map(|(_, _, t)| t.len()).sum::<usize>();
    let mut out = String::with_capacity(out_cap);
    let mut cursor = 0usize;
    for (start, end, new_text) in &survivors {
        let (s, e) = (*start as usize, *end as usize);
        // Emit the untouched gap before this edit, then its replacement. A
        // zero-length insert (e == s) leaves the cursor put, so a range edit
        // sharing that start still emits immediately after the insert.
        if s > cursor {
            out.push_str(&source[cursor..s]);
            cursor = s;
        }
        out.push_str(new_text);
        if e > cursor {
            cursor = e;
        }
    }
    out.push_str(&source[cursor..]);
    out
}

#[cfg(test)]
mod tests {
    use super::apply_edits;

    fn apply(source: &str, mut edits: Vec<(u32, u32, String)>) -> String {
        apply_edits(source, &mut edits)
    }

    fn e(start: u32, end: u32, text: &str) -> (u32, u32, String) {
        (start, end, text.to_string())
    }

    #[test]
    fn insert_before_surviving_range_at_shared_start() {
        // indent.rs's zero-length `\n{indent}` insert and markup.rs's open-tag
        // rewrite both anchored at one node start: the insert must land before
        // the rewritten tag (insert-then-replace), deterministically regardless
        // of which pass pushed first.
        let src = "abcXXXXyz"; // bytes [3, 7) == "XXXX"
        let expected = "abc\n  RWyz";
        assert_eq!(apply(src, vec![e(3, 7, "RW"), e(3, 3, "\n  ")]), expected);
        assert_eq!(apply(src, vec![e(3, 3, "\n  "), e(3, 7, "RW")]), expected);
    }

    #[test]
    fn insert_at_range_end_stays_after() {
        // A zero-length insert at a range edit's END emits after the range —
        // the already-correct touching case, locked in here.
        let src = "abcXXXXyz";
        assert_eq!(apply(src, vec![e(3, 7, "RW"), e(7, 7, "!")]), "abcRW!yz");
        assert_eq!(apply(src, vec![e(7, 7, "!"), e(3, 7, "RW")]), "abcRW!yz");
    }

    #[test]
    fn multiple_inserts_at_one_position_keep_reverse_push_order() {
        // Matches the old back-to-front apply: the last-pushed insert prints
        // first (each `replace_range` at the same offset prepends).
        assert_eq!(apply("abcd", vec![e(2, 2, "1"), e(2, 2, "2")]), "ab21cd");
    }

    #[test]
    fn overlapping_ranges_larger_start_wins() {
        // The overlap rule drops the smaller-start edit of an intersecting pair.
        assert_eq!(apply("abcdef", vec![e(1, 4, "X"), e(2, 5, "Y")]), "abYf");
    }

    #[test]
    fn disjoint_edits_splice_in_order() {
        assert_eq!(
            apply("hello world", vec![e(0, 5, "HELLO"), e(6, 11, "WORLD")]),
            "HELLO WORLD"
        );
    }
}
