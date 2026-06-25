//! Format standalone JSON / JSONC / JSON5 in-process via `oxc_formatter_json` —
//! the same engine `oxfmt` uses for these files, so the output is byte-identical
//! without the `oxfmt` subprocess (the JSON analogue of [`crate::format_js_source`]).
//!
//! Not handled here: `package.json`, which `oxfmt` additionally runs through
//! `sortPackageJson` (a key-ordering pass that lives in oxfmt, not oxc). Callers
//! keep delegating `package.json` to `oxfmt` to stay byte-identical.

use oxc_allocator::Allocator;
use oxc_formatter_json::{JsonFormatOptions, format as format_json};

use crate::error::FormatError;

pub use oxc_formatter_json::JsonVariant;

/// Format `source` as JSON of the given `variant` (`json` / `jsonc` / `json5`)
/// with `options`. `variant` overrides any value already on `options`. Returns a
/// parse error for input the JSON parser rejects (the caller falls back to
/// `oxfmt`, mirroring the native-JS path).
pub fn format_json_source(
    source: &str,
    variant: JsonVariant,
    options: &JsonFormatOptions,
) -> Result<String, FormatError> {
    let allocator = Allocator::default();
    let mut options = *options;
    options.variant = variant;
    let formatted = format_json(&allocator, source, options)
        .map_err(|d| FormatError::JsonParse(format!("{d:?}")))?;
    let code = formatted
        .print()
        .map_err(|e| FormatError::JsonParse(format!("{e:?}")))?
        .into_code();
    Ok(code)
}
