//! A bad escape in a string or a name, which acorn's lexer rejects as it reads it, as oxc's does.

mod code_points;
mod hex;
mod names;

use rsvelte_svelte_compile::{ModuleCompileOptions, compile_module};

use super::outcomes::Outcome;

/// A `.svelte.js` module, and what svelte 5.59.1's `compileModule` raises.
const MODULES: &[(&str, Outcome<'_>)] = &[
    (
        "export const s = '\\x';",
        Some(("js_parse_error", "Bad character escape sequence", 20)),
    ),
    (
        "export const s = '\\x0';",
        Some(("js_parse_error", "Bad character escape sequence", 20)),
    ),
    (
        "export const s = '\\xG1';",
        Some(("js_parse_error", "Bad character escape sequence", 20)),
    ),
    (
        "export const s = '\\x0G';",
        Some(("js_parse_error", "Bad character escape sequence", 20)),
    ),
    (
        "export const s = '\\u';",
        Some(("js_parse_error", "Bad character escape sequence", 20)),
    ),
    (
        "export const a\\u = 1;",
        Some(("js_parse_error", "Bad character escape sequence", 16)),
    ),
    (
        "export const s = '\\u0';",
        Some(("js_parse_error", "Bad character escape sequence", 20)),
    ),
    (
        "export const a\\u0 = 1;",
        Some(("js_parse_error", "Bad character escape sequence", 16)),
    ),
    (
        "export const s = '\\u00';",
        Some(("js_parse_error", "Bad character escape sequence", 20)),
    ),
    (
        "export const a\\u00 = 1;",
        Some(("js_parse_error", "Bad character escape sequence", 16)),
    ),
    (
        "export const s = '\\u000';",
        Some(("js_parse_error", "Bad character escape sequence", 20)),
    ),
    (
        "export const a\\u000 = 1;",
        Some(("js_parse_error", "Bad character escape sequence", 16)),
    ),
    (
        "export const s = '\\u000G';",
        Some(("js_parse_error", "Bad character escape sequence", 20)),
    ),
    (
        "export const a\\u000G = 1;",
        Some(("js_parse_error", "Bad character escape sequence", 16)),
    ),
    (
        "export const s = '\\u{}';",
        Some(("js_parse_error", "Bad character escape sequence", 21)),
    ),
    (
        "export const a\\u{} = 1;",
        Some(("js_parse_error", "Bad character escape sequence", 17)),
    ),
    (
        "export const s = '\\u{';",
        Some(("js_parse_error", "Bad character escape sequence", 21)),
    ),
    (
        "export const a\\u{ = 1;",
        Some(("js_parse_error", "Bad character escape sequence", 17)),
    ),
    (
        "export const s = '\\u{110000}';",
        Some(("js_parse_error", "Code point out of bounds", 21)),
    ),
    (
        "export const a\\u{110000} = 1;",
        Some(("js_parse_error", "Code point out of bounds", 17)),
    ),
    (
        "export const s = '\\u{FFFFFFFFFF}';",
        Some(("js_parse_error", "Code point out of bounds", 21)),
    ),
    (
        "export const a\\u{FFFFFFFFFF} = 1;",
        Some(("js_parse_error", "Code point out of bounds", 17)),
    ),
    (
        "export const s = '\\u{1_0}';",
        Some(("js_parse_error", "Bad character escape sequence", 21)),
    ),
    (
        "export const a\\u{1_0} = 1;",
        Some(("js_parse_error", "Bad character escape sequence", 17)),
    ),
    (
        "export const s = '\\u{ 1}';",
        Some(("js_parse_error", "Bad character escape sequence", 21)),
    ),
    (
        "export const a\\u{ 1} = 1;",
        Some(("js_parse_error", "Bad character escape sequence", 17)),
    ),
    (
        "export const a\\uD800 = 1;",
        Some(("js_parse_error", "Invalid Unicode escape", 14)),
    ),
];

#[test]
fn a_module_rejects_a_bad_escape() {
    for &(source, expected) in MODULES {
        let outcome = compile_module(source, &ModuleCompileOptions::default());
        let raised = outcome.err().map(|error| super::outcomes::raised(&error));
        let expected =
            expected.map(|(code, message, at)| super::outcomes::official(code, message, at));
        assert_eq!(raised, expected, "{source:?}");
    }
}
