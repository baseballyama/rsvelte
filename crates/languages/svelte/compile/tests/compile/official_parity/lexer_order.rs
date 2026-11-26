//! acorn throws as it reads a token, before its parser looks at it: an error inside the token the
//! parser fails at, a legacy octal number or escape, which strict code forbids, before the place
//! the parser fails, and an `@` acorn does not read, also as the token after a template expression.

use rsvelte_svelte_compile::{ModuleCompileOptions, compile_module};

use super::outcomes::{Outcome, assert_component_outcomes};

mod scripts;

/// A component whose template holds the token, and what svelte 5.59.1 raises in runes mode.
const TEMPLATES: &[(&str, Outcome<'_>)] = &[
    (
        "{1@}",
        Some(("js_parse_error", "Unexpected character '@'", 2)),
    ),
    (
        "<p>{1@}</p>",
        Some(("js_parse_error", "Unexpected character '@'", 5)),
    ),
    (
        "<p a={1@}></p>",
        Some(("js_parse_error", "Unexpected character '@'", 7)),
    ),
    (
        "{#if 1@}{/if}",
        Some(("js_parse_error", "Unexpected character '@'", 6)),
    ),
    (
        "{#each 1@ as x}{/each}",
        Some(("js_parse_error", "Unexpected character '@'", 8)),
    ),
    ("{1 01}", Some(("js_parse_error", "Invalid number", 3))),
    (
        "{1 1_}",
        Some((
            "js_parse_error",
            "Numeric separator is not allowed at the last of digits",
            4,
        )),
    ),
    ("{a b@}", Some(("expected_token", "Expected token }", 3))),
    (
        "{@const q = 01.5}",
        Some(("js_parse_error", "Invalid number", 12)),
    ),
    ("{08}", Some(("js_parse_error", "Invalid number", 1))),
    (
        "{1 @ 2}",
        Some(("js_parse_error", "Unexpected character '@'", 3)),
    ),
    ("{\"@\"}", None),
    ("{`08`}", None),
    (
        "{/* 08 */ 1 1}",
        Some(("expected_token", "Expected token }", 12)),
    ),
    ("{1}@", None),
    (
        "<p>é\r\n{1 1_}</p>",
        Some((
            "js_parse_error",
            "Numeric separator is not allowed at the last of digits",
            11,
        )),
    ),
    ("{(08)}", Some(("js_parse_error", "Invalid number", 2))),
    ("{1 08}", Some(("js_parse_error", "Invalid number", 3))),
    (
        "{'\\08'}",
        Some(("js_parse_error", "Octal literal in strict mode", 2)),
    ),
    (
        "{1 '\\08'}",
        Some(("js_parse_error", "Octal literal in strict mode", 4)),
    ),
    (
        "{@}",
        Some((
            "expected_tag",
            "Expected 'html', 'render', 'attach', 'const', or 'debug'",
            2,
        )),
    ),
    ("{0b12}", Some(("expected_token", "Expected token }", 4))),
];

/// A `.svelte.js` module, and what svelte 5.59.1's `compileModule` raises.
const MODULES: &[(&str, Outcome<'_>)] = &[
    (
        "let a = 1 1_;",
        Some((
            "js_parse_error",
            "Numeric separator is not allowed at the last of digits",
            11,
        )),
    ),
    (
        "let a = 01.5;",
        Some(("js_parse_error", "Invalid number", 8)),
    ),
    (
        "1@",
        Some(("js_parse_error", "Unexpected character '@'", 1)),
    ),
    (
        "let a = 08; b@",
        Some(("js_parse_error", "Invalid number", 8)),
    ),
    ("1 1; 08", Some(("js_parse_error", "Unexpected token", 2))),
    ("08", Some(("js_parse_error", "Invalid number", 0))),
    (
        "'\\08'",
        Some(("js_parse_error", "Octal literal in strict mode", 1)),
    ),
    (
        "let s = `08 @`; 1 1",
        Some(("js_parse_error", "Unexpected token", 18)),
    ),
    (
        "let x = \"é\";\r\nlet a = 1 1_;",
        Some((
            "js_parse_error",
            "Numeric separator is not allowed at the last of digits",
            26,
        )),
    ),
];

#[test]
fn acorn_throws_where_its_lexer_reads_a_token_it_rejects() {
    assert_component_outcomes(scripts::SCRIPTS);
    assert_component_outcomes(TEMPLATES);
}

#[test]
fn a_module_throws_where_acorn_reads_a_token_it_rejects() {
    for &(source, expected) in MODULES {
        let outcome = compile_module(source, &ModuleCompileOptions::default());
        let raised = outcome.err().map(|error| {
            let message = error.message.lines().next().map(str::to_owned);
            (error.code.to_string(), message, error.span.start_offset)
        });
        let expected =
            expected.map(|(code, message, at)| (code.to_owned(), Some(message.to_owned()), at));
        assert_eq!(raised, expected, "{source:?}");
    }
}
