//! Regression test for #3714 — a double-quoted object property key inside a
//! template expression came out single-quoted on the client.
//!
//! esrap prints a literal from its `raw`, so the source's quote spelling is part
//! of the output. The value in the same object kept its spelling and the server
//! target was right, which is what located the defect in the client's own
//! `convert_property_key` rather than in the printer.
//!
//! No gate here can see this class: every corpus comparison normalizes with
//! oxfmt, which rewrites single quotes to double.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn emit(src: &str, generate: GenerateMode) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("X.svelte".to_string()),
            generate,
            ..Default::default()
        },
    )
    .expect("compiles")
    .js
    .code
}

fn wrap(expr: &str) -> String {
    format!("<script>\n\tconst v = 1;\n</script>\n<div class={{String({expr})}}></div>\n")
}

/// The key's shape does not matter — this is not about when a key needs quoting.
#[test]
fn a_double_quoted_key_stays_double_quoted() {
    for key in ["a-b", "ab", "1"] {
        let code = emit(&wrap(&format!("{{ \"{key}\": 1 }}")), GenerateMode::Client);
        assert!(
            code.contains(&format!("\"{key}\": 1")),
            "key {key:?} was re-quoted:\n{code}"
        );
    }
    // Nested one level deeper, which is a second call into the same converter.
    let code = emit(&wrap("{ x: { \"a-b\": 1 } }"), GenerateMode::Client);
    assert!(code.contains("\"a-b\": 1"), "{code}");
}

/// The control that names the dropped `raw` rather than the key position: both
/// spellings reach the identical code, and only the one whose `raw` differs from
/// the re-quoted form can show a difference. An escape in each spelling is here
/// because `raw` is copied verbatim and a wrong `value`/`raw` pairing shows up
/// nowhere else.
#[test]
fn a_single_quoted_key_and_every_escape_are_unchanged() {
    for (expr, expected) in [
        ("{ 'a-b': 1 }", "'a-b': 1"),
        ("{ 'a\\'b': 1 }", "'a\\'b': 1"),
        ("{ \"a\\\"b\": 1 }", "\"a\\\"b\": 1"),
        ("{ a: \"double-value\" }", "a: \"double-value\""),
        ("{ [\"computed\"]: 1 }", "[\"computed\"]: 1"),
    ] {
        let code = emit(&wrap(expr), GenerateMode::Client);
        assert!(
            code.contains(expected),
            "{expr} -> expected {expected:?}:\n{code}"
        );
    }
}

/// The server never went through the client converter, so it was already right
/// and must stay right — the positive control for the two-ports reading.
#[test]
fn the_server_target_is_unchanged() {
    let code = emit(&wrap("{ \"a-b\": 1 }"), GenerateMode::Server);
    assert!(code.contains("\"a-b\": 1"), "{code}");
}
