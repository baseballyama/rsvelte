//! Utility functions for parsing.

pub mod bracket;
pub mod entities;
mod entities_data;
pub mod fuzzymatch;
pub mod html;

// Re-export utilities for use by other parser modules
// These are library functions that may be used as the parser is extended
pub use bracket::find_matching_bracket;
#[allow(
    unused_imports,
    reason = "re-exported for structural parity with the upstream Svelte parser-utils module; not every helper is wired into the port yet"
)]
pub use entities::decode_html_entities;
#[allow(
    unused_imports,
    reason = "re-exported for structural parity with the upstream Svelte parser-utils module; not every helper is wired into the port yet"
)]
pub use fuzzymatch::fuzzymatch;
#[allow(
    unused_imports,
    reason = "re-exported for structural parity with the upstream Svelte parser-utils module; not every helper is wired into the port yet"
)]
pub use html::{decode_character_references, is_void_element, validate_code};

/// `str::trim` without the UTF-8 decode: template sources are ASCII at the
/// trimmed edges in practice, and only a non-ASCII edge falls back to `trim`.
pub trait TrimWs {
    fn trim_ws(&self) -> &str;
}

impl TrimWs for str {
    #[inline]
    fn trim_ws(&self) -> &str {
        const fn is_ascii_ws(b: u8) -> bool {
            matches!(b, b' ' | b'\t' | b'\n' | b'\r' | 0x0b | 0x0c)
        }
        let bytes = self.as_bytes();
        let mut start = 0;
        let mut end = bytes.len();
        while start < end && is_ascii_ws(bytes[start]) {
            start += 1;
        }
        while end > start && is_ascii_ws(bytes[end - 1]) {
            end -= 1;
        }
        // Only ASCII bytes were skipped, so both ends are char boundaries.
        let trimmed = &self[start..end];
        match (trimmed.as_bytes().first(), trimmed.as_bytes().last()) {
            (Some(&first), Some(&last)) if first >= 0x80 || last >= 0x80 => trimmed.trim(),
            _ => trimmed,
        }
    }
}

/// Returns `true` if `word` is a reserved JavaScript keyword.
///
/// Corresponds to `is_reserved()` in `svelte/packages/svelte/src/utils.js`.
/// Uses first-byte dispatch and match for O(1) lookup instead of linear scan.
pub fn is_reserved(word: &str) -> bool {
    matches!(
        word,
        "arguments"
            | "await"
            | "break"
            | "case"
            | "catch"
            | "class"
            | "const"
            | "continue"
            | "debugger"
            | "default"
            | "delete"
            | "do"
            | "else"
            | "enum"
            | "eval"
            | "export"
            | "extends"
            | "false"
            | "finally"
            | "for"
            | "function"
            | "if"
            | "implements"
            | "import"
            | "in"
            | "instanceof"
            | "interface"
            | "let"
            | "new"
            | "null"
            | "package"
            | "private"
            | "protected"
            | "public"
            | "return"
            | "static"
            | "super"
            | "switch"
            | "this"
            | "throw"
            | "true"
            | "try"
            | "typeof"
            | "var"
            | "void"
            | "while"
            | "with"
            | "yield"
    )
}
