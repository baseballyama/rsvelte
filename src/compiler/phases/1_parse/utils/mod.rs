//! Utility functions for parsing.

pub mod bracket;
pub mod create;
pub mod entities;
mod entities_data;
pub mod fuzzymatch;
pub mod html;

// Re-export utilities for use by other parser modules
// These are library functions that may be used as the parser is extended
#[allow(unused_imports)]
pub use bracket::{find_matching_bracket, match_bracket};
#[allow(unused_imports)]
pub use create::{create_empty_fragment, create_fragment, create_fragment_with_node};
#[allow(unused_imports)]
pub use entities::decode_html_entities;
#[allow(unused_imports)]
pub use fuzzymatch::fuzzymatch;
#[allow(unused_imports)]
pub use html::{decode_character_references, is_void_element, validate_code};

/// JavaScript reserved words.
///
/// Corresponds to `RESERVED_WORDS` in `svelte/packages/svelte/src/utils.js`.
#[allow(dead_code)]
const RESERVED_WORDS: &[&str] = &[
    "arguments",
    "await",
    "break",
    "case",
    "catch",
    "class",
    "const",
    "continue",
    "debugger",
    "default",
    "delete",
    "do",
    "else",
    "enum",
    "eval",
    "export",
    "extends",
    "false",
    "finally",
    "for",
    "function",
    "if",
    "implements",
    "import",
    "in",
    "instanceof",
    "interface",
    "let",
    "new",
    "null",
    "package",
    "private",
    "protected",
    "public",
    "return",
    "static",
    "super",
    "switch",
    "this",
    "throw",
    "true",
    "try",
    "typeof",
    "var",
    "void",
    "while",
    "with",
    "yield",
];

/// Returns `true` if `word` is a reserved JavaScript keyword.
///
/// Corresponds to `is_reserved()` in `svelte/packages/svelte/src/utils.js`.
/// Uses first-byte dispatch and match for O(1) lookup instead of linear scan.
#[allow(dead_code)]
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
