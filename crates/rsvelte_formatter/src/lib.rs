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
mod markup;
mod options;
mod prettier_ignore;
mod reindent;
mod script;
mod sort_order;
mod style;

pub use error::FormatError;
pub use options::{FormatOptions, StyleFormatter};

// Re-exports so consumers don't need to depend on `oxc_formatter` directly.
pub use oxc_formatter::JsFormatOptions;
pub use oxc_formatter_core::{IndentStyle, IndentWidth, LineWidth};

use rsvelte_core::{ParseOptions, parse};

/// Format a Svelte source string.
///
/// On success returns the formatted source. On failure returns the parse
/// or formatting error, leaving the source untouched.
pub fn format(source: &str, options: &FormatOptions) -> Result<String, FormatError> {
    let root = parse(source, ParseOptions::default()).map_err(FormatError::from_parse)?;

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
        if let Some(edit) = script::format_open_tag(source, script.start, script.end) {
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
        style::collect_style_edit(source, css, options, &mut edits)?;
    }
    // `<style>` elements nested in the markup (e.g. in `<svelte:head>` or a
    // wrapper element) aren't hoisted into `root.css`, so format them here.
    style::collect_nested_style_edits(source, &root.fragment, options, &mut edits)?;

    // Apply edits from the back so earlier offsets remain valid.
    edits.sort_by_key(|(start, _, _)| std::cmp::Reverse(*start));
    let mut out = source.to_string();
    for (start, end, new_text) in edits {
        out.replace_range(start as usize..end as usize, &new_text);
    }

    // Post-pass: collapse pure-text elements onto one line when they fit.
    out = collapse::collapse_pure_text_elements(&out, options)?;

    // Post-pass: reorder top-level sections into prettier's canonical order
    // (options → module script → instance script → markup → styles) and
    // normalize the blank lines between top-level units. This re-parses the
    // output, so skip it (using the already-parsed `root`) whenever there is
    // nothing it could change: a file with no sections, or a single section and
    // no markup, has only one top-level unit. Section order is preserved by
    // formatting, so the original root is a sound predicate.
    let section_count = [
        root.options.is_some(),
        root.module.is_some(),
        root.instance.is_some(),
        root.css.is_some(),
    ]
    .into_iter()
    .filter(|&p| p)
    .count();
    let has_markup = root.fragment.nodes.iter().any(|n| {
        !matches!(n, rsvelte_core::ast::template::TemplateNode::Text(t) if t.data.trim().is_empty())
    });
    if section_count > 1 || (section_count == 1 && has_markup) {
        out = sort_order::reorder_sections(&out);
    }

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
