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
pub use html::{is_void_element, validate_code};

/// Upstream's `String.prototype.trim` without the UTF-8 decode, so the trimmed
/// set is JS whitespace rather than Unicode `White_Space` — the two differ on
/// `U+0085` and `U+FEFF`. Only a non-ASCII edge pays for the decode.
pub trait TrimWs {
    fn trim_ws(&self) -> &str;
    fn trim_start_ws(&self) -> &str;
    fn trim_end_ws(&self) -> &str;
}

impl TrimWs for str {
    #[inline]
    fn trim_ws(&self) -> &str {
        self.trim_start_ws().trim_end_ws()
    }

    #[inline]
    fn trim_start_ws(&self) -> &str {
        let bytes = self.as_bytes();
        let mut start = 0;
        while start < bytes.len() && super::parser::is_js_whitespace_byte(bytes[start]) {
            start += 1;
        }
        // Only ASCII bytes were skipped, so `start` is a char boundary.
        let rest = &self[start..];
        match rest.as_bytes().first() {
            Some(&b) if b >= 0x80 => rest.trim_start_matches(super::parser::is_js_whitespace),
            _ => rest,
        }
    }

    #[inline]
    fn trim_end_ws(&self) -> &str {
        let bytes = self.as_bytes();
        let mut end = bytes.len();
        while end > 0 && super::parser::is_js_whitespace_byte(bytes[end - 1]) {
            end -= 1;
        }
        let head = &self[..end];
        match head.as_bytes().last() {
            Some(&b) if b >= 0x80 => head.trim_end_matches(super::parser::is_js_whitespace),
            _ => head,
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
