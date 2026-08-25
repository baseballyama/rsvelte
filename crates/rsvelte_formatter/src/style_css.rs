//! Format standalone CSS / SCSS / Less in-process via `oxc_formatter_css` —
//! the same engine `oxfmt` uses for these files, so the output is byte-identical
//! without the `oxfmt` subprocess (the CSS analogue of [`crate::format_js_source`]
//! and [`crate::format_json_source`]).
//!
//! Indented-syntax dialects (`sass`, `stylus`) are *not* brace-based CSS and
//! `oxc_formatter_css` cannot parse them; callers must keep those bodies verbatim
//! (see [`crate::style`]).

use std::sync::Arc;

use oxc_allocator::Allocator;
use oxc_formatter_core::LineWidth;
use oxc_formatter_css::{CssFormatOptions, CssVariant, format as format_css};

use crate::error::FormatError;
use crate::options::StyleFormatter;

pub use oxc_formatter_css::{
    CssFormatOptions as CssOptions, CssVariant as CssDialect, SingleQuote, TrailingCommas,
};

/// Map a `<style lang="...">` value / file extension to a [`CssVariant`].
///
/// Brace-based dialects only — `sass`/`stylus`/`styl` are handled upstream and
/// never reach here. Unknown values fall back to plain CSS.
#[must_use]
pub fn css_variant_from_lang(lang: &str) -> CssVariant {
    match lang.to_ascii_lowercase().as_str() {
        "scss" => CssVariant::Scss,
        "less" => CssVariant::Less,
        // `css`, `postcss`, and anything else brace-based print with the CSS
        // dialect (matching how `oxfmt` maps `.css`/`.pcss` → `parser: css`).
        _ => CssVariant::Css,
    }
}

/// Format `source` as CSS of the given `variant` with `options`. `variant`
/// overrides any value already on `options`.
///
/// Returns a parse error for input the CSS parser rejects. Callers choose whether
/// to preserve the input or fall back to an external formatter.
///
/// # Errors
///
/// Returns [`FormatError`] when the CSS parser or printer rejects `source`.
pub fn format_css_source(
    source: &str,
    variant: CssVariant,
    options: &CssFormatOptions,
) -> Result<String, FormatError> {
    let allocator = Allocator::default();
    let mut options = *options;
    options.variant = variant;
    let code = format_css(&allocator, source, options)
        .map_err(|d| FormatError::StyleFormat(format!("{d:?}")))?
        .print()
        .map_err(|e| FormatError::StyleFormat(format!("{e:?}")))?
        .into_code();
    Ok(code)
}

/// A [`StyleFormatter`] that formats every `<style>` body in-process.
///
/// It uses `oxc_formatter_css`, the same engine `oxfmt` uses for standalone CSS,
/// so output is byte-identical without a subprocess (and it runs in wasm, unlike
/// spawning `oxfmt`).
///
/// `base` supplies the indent / quote / EOL settings.
///
/// The callback narrows `line_width` to each block's column and picks the dialect
/// from its `lang`. A body this parser rejects round-trips unchanged. That can
/// differ from the embedded PostCSS oracle, which accepts some selector syntax
/// that `oxc_formatter_css` rejects.
#[must_use]
pub fn native_style_formatter(base: CssFormatOptions) -> StyleFormatter {
    Arc::new(
        move |body: &str, lang: &str, width: usize| -> Result<String, String> {
            let mut opts = base;
            let clamped = crate::formatter_width(width);
            opts.line_width = LineWidth::try_from(clamped).unwrap_or_default();
            format_css_source(body, css_variant_from_lang(lang), &opts)
                // The caller splices `\n{output}\n{indent}`, so a fallback that kept the
                // body's own leading newline would insert a blank line before the first rule.
                .map_or_else(|_| Ok(body.trim_start_matches('\n').to_string()), Ok)
        },
    )
}
