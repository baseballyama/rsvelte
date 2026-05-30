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

mod error;
mod expression;
mod indent;
mod markup;
mod options;
mod script;

pub use error::FormatError;
pub use options::FormatOptions;

// Re-exports so consumers don't need to depend on `oxc_formatter` directly.
pub use oxc_formatter::JsFormatOptions;
pub use oxc_formatter_core::{IndentStyle, IndentWidth};

use svelte_compiler_rust::{ParseOptions, parse};

/// Format a Svelte source string.
///
/// On success returns the formatted source. On failure returns the parse
/// or formatting error, leaving the source untouched.
pub fn format(source: &str, options: &FormatOptions) -> Result<String, FormatError> {
    let root = parse(source, ParseOptions::default()).map_err(FormatError::from_parse)?;

    let mut edits: Vec<(u32, u32, String)> = Vec::new();

    for script in [root.instance.as_deref(), root.module.as_deref()]
        .into_iter()
        .flatten()
    {
        if let Some((start, end, formatted)) = script::format_script(source, script, options)? {
            edits.push((start, end, formatted));
        }
    }

    // Open-tag and close-tag rewrites first — they own the element-tag
    // spans including their attribute lists. The expression and indent
    // passes below target spans outside those rewritten regions.
    markup::collect_open_tag_edits(source, &root.fragment, options, &mut edits)?;
    expression::collect_template_edits(source, &root.fragment, options, &mut edits)?;
    indent::collect_indent_edits(source, &root.fragment, 0, options, &mut edits)?;

    // Apply edits from the back so earlier offsets remain valid.
    edits.sort_by_key(|(start, _, _)| std::cmp::Reverse(*start));
    let mut out = source.to_string();
    for (start, end, new_text) in edits {
        out.replace_range(start as usize..end as usize, &new_text);
    }
    Ok(out)
}
