//! acorn reads a radix number up to the first digit its radix does not take, so `0b12` is `0b1`
//! and then `2`. Its parser fails at that shorter number where it takes no number, and at the
//! digit where it does.

use rsvelte_svelte_compile::{ModuleCompileOptions, compile_module};

use super::outcomes::{Outcome, assert_component_outcomes};

/// A component, and what svelte 5.59.1 raises in runes mode, in bytes of the source.
const COMPONENTS: &[(&str, Outcome<'_>)] = &[
    (
        "<script>1 0b12</script>",
        Some(("js_parse_error", "Unexpected token", 10)),
    ),
    (
        "<script>a 0b12</script>",
        Some(("js_parse_error", "Unexpected token", 10)),
    ),
    (
        "<script>(a) 0b12</script>",
        Some(("js_parse_error", "Unexpected token", 12)),
    ),
    (
        "<script>[a] 0b12</script>",
        Some(("js_parse_error", "Unexpected token", 12)),
    ),
    (
        "<script>\"s\" 0b12</script>",
        Some(("js_parse_error", "Unexpected token", 12)),
    ),
    (
        "<script>a /*c*/ 0b12</script>",
        Some(("js_parse_error", "Unexpected token", 16)),
    ),
    (
        "<script>a /*\n*/ 0b12</script>",
        Some(("js_parse_error", "Unexpected token", 19)),
    ),
    (
        "<script>a\n0b12</script>",
        Some(("js_parse_error", "Unexpected token", 13)),
    ),
    (
        "<script>a\r\n0b12</script>",
        Some(("js_parse_error", "Unexpected token", 14)),
    ),
    (
        "<script>a 0b12</script>",
        Some(("js_parse_error", "Unexpected token", 15)),
    ),
    (
        "<script>x = 0b12</script>",
        Some(("js_parse_error", "Unexpected token", 15)),
    ),
    (
        "<script>f(0b12)</script>",
        Some(("js_parse_error", "Unexpected token", 13)),
    ),
    (
        "<script>f(1, 0b12)</script>",
        Some(("js_parse_error", "Unexpected token", 16)),
    ),
    (
        "<script>a + 0b12</script>",
        Some(("js_parse_error", "Unexpected token", 15)),
    ),
    (
        "<script>let a = 1 0b12</script>",
        Some(("js_parse_error", "Unexpected token", 18)),
    ),
    (
        "<script>return 0b12</script>",
        Some(("js_parse_error", "'return' outside of function", 8)),
    ),
    (
        "<script>0b12</script>",
        Some(("js_parse_error", "Unexpected token", 11)),
    ),
    ("{1 0b12}", Some(("expected_token", "Expected token }", 3))),
    ("{a 0b12}", Some(("expected_token", "Expected token }", 3))),
    ("{a\n0b12}", Some(("expected_token", "Expected token }", 3))),
    ("{0b12}", Some(("expected_token", "Expected token }", 4))),
    ("{(0b12)}", Some(("js_parse_error", "Unexpected token", 5))),
    (
        "<p title={a 0b12}></p>",
        Some(("expected_token", "Expected token }", 12)),
    ),
    (
        "{#if a 0b12}{/if}",
        Some(("expected_token", "Expected token }", 7)),
    ),
    (
        "<script lang=\"ts\">let a = 1 0b12;</script>",
        Some(("js_parse_error", "Unexpected token", 28)),
    ),
    (
        "<script>/*é😀*/ a 0b12</script>",
        Some(("js_parse_error", "Unexpected token", 21)),
    ),
    (
        "<script>1 0b1n2</script>",
        Some(("js_parse_error", "Unexpected token", 10)),
    ),
    (
        "<script>a 0b1n2</script>",
        Some(("js_parse_error", "Unexpected token", 10)),
    ),
    (
        "<script>(a) 0b1n2</script>",
        Some(("js_parse_error", "Unexpected token", 12)),
    ),
    (
        "<script>[a] 0b1n2</script>",
        Some(("js_parse_error", "Unexpected token", 12)),
    ),
    (
        "<script>\"s\" 0b1n2</script>",
        Some(("js_parse_error", "Unexpected token", 12)),
    ),
    (
        "<script>a /*c*/ 0b1n2</script>",
        Some(("js_parse_error", "Unexpected token", 16)),
    ),
    (
        "<script>a /*\n*/ 0b1n2</script>",
        Some(("js_parse_error", "Unexpected token", 20)),
    ),
    (
        "<script>a\n0b1n2</script>",
        Some(("js_parse_error", "Unexpected token", 14)),
    ),
    (
        "<script>a\r\n0b1n2</script>",
        Some(("js_parse_error", "Unexpected token", 15)),
    ),
    (
        "<script>a 0b1n2</script>",
        Some(("js_parse_error", "Unexpected token", 16)),
    ),
    (
        "<script>x = 0b1n2</script>",
        Some(("js_parse_error", "Unexpected token", 16)),
    ),
    (
        "<script>f(0b1n2)</script>",
        Some(("js_parse_error", "Unexpected token", 14)),
    ),
    (
        "<script>f(1, 0b1n2)</script>",
        Some(("js_parse_error", "Unexpected token", 17)),
    ),
    (
        "<script>a + 0b1n2</script>",
        Some(("js_parse_error", "Unexpected token", 16)),
    ),
    (
        "<script>let a = 1 0b1n2</script>",
        Some(("js_parse_error", "Unexpected token", 18)),
    ),
    (
        "<script>return 0b1n2</script>",
        Some(("js_parse_error", "'return' outside of function", 8)),
    ),
    (
        "<script>0b1n2</script>",
        Some(("js_parse_error", "Unexpected token", 12)),
    ),
    ("{1 0b1n2}", Some(("expected_token", "Expected token }", 3))),
    ("{a 0b1n2}", Some(("expected_token", "Expected token }", 3))),
    (
        "{a\n0b1n2}",
        Some(("expected_token", "Expected token }", 3)),
    ),
    ("{0b1n2}", Some(("expected_token", "Expected token }", 5))),
    ("{(0b1n2)}", Some(("js_parse_error", "Unexpected token", 6))),
    (
        "<p title={a 0b1n2}></p>",
        Some(("expected_token", "Expected token }", 12)),
    ),
    (
        "{#if a 0b1n2}{/if}",
        Some(("expected_token", "Expected token }", 7)),
    ),
    (
        "<script lang=\"ts\">let a = 1 0b1n2;</script>",
        Some(("js_parse_error", "Unexpected token", 28)),
    ),
    (
        "<script>/*é😀*/ a 0b1n2</script>",
        Some(("js_parse_error", "Unexpected token", 21)),
    ),
    (
        "<script>1 0o78</script>",
        Some(("js_parse_error", "Unexpected token", 10)),
    ),
    (
        "<script>a 0o78</script>",
        Some(("js_parse_error", "Unexpected token", 10)),
    ),
    (
        "<script>(a) 0o78</script>",
        Some(("js_parse_error", "Unexpected token", 12)),
    ),
    (
        "<script>[a] 0o78</script>",
        Some(("js_parse_error", "Unexpected token", 12)),
    ),
    (
        "<script>\"s\" 0o78</script>",
        Some(("js_parse_error", "Unexpected token", 12)),
    ),
    (
        "<script>a /*c*/ 0o78</script>",
        Some(("js_parse_error", "Unexpected token", 16)),
    ),
    (
        "<script>a /*\n*/ 0o78</script>",
        Some(("js_parse_error", "Unexpected token", 19)),
    ),
    (
        "<script>a\n0o78</script>",
        Some(("js_parse_error", "Unexpected token", 13)),
    ),
    (
        "<script>a\r\n0o78</script>",
        Some(("js_parse_error", "Unexpected token", 14)),
    ),
    (
        "<script>a 0o78</script>",
        Some(("js_parse_error", "Unexpected token", 15)),
    ),
    (
        "<script>x = 0o78</script>",
        Some(("js_parse_error", "Unexpected token", 15)),
    ),
    (
        "<script>f(0o78)</script>",
        Some(("js_parse_error", "Unexpected token", 13)),
    ),
    (
        "<script>f(1, 0o78)</script>",
        Some(("js_parse_error", "Unexpected token", 16)),
    ),
    (
        "<script>a + 0o78</script>",
        Some(("js_parse_error", "Unexpected token", 15)),
    ),
    (
        "<script>let a = 1 0o78</script>",
        Some(("js_parse_error", "Unexpected token", 18)),
    ),
    (
        "<script>return 0o78</script>",
        Some(("js_parse_error", "'return' outside of function", 8)),
    ),
    (
        "<script>0o78</script>",
        Some(("js_parse_error", "Unexpected token", 11)),
    ),
    ("{1 0o78}", Some(("expected_token", "Expected token }", 3))),
    ("{a 0o78}", Some(("expected_token", "Expected token }", 3))),
    ("{a\n0o78}", Some(("expected_token", "Expected token }", 3))),
    ("{0o78}", Some(("expected_token", "Expected token }", 4))),
    ("{(0o78)}", Some(("js_parse_error", "Unexpected token", 5))),
    (
        "<p title={a 0o78}></p>",
        Some(("expected_token", "Expected token }", 12)),
    ),
    (
        "{#if a 0o78}{/if}",
        Some(("expected_token", "Expected token }", 7)),
    ),
    (
        "<script lang=\"ts\">let a = 1 0o78;</script>",
        Some(("js_parse_error", "Unexpected token", 28)),
    ),
    (
        "<script>/*é😀*/ a 0o78</script>",
        Some(("js_parse_error", "Unexpected token", 21)),
    ),
    (
        "<script>1 0b12x</script>",
        Some(("js_parse_error", "Unexpected token", 10)),
    ),
    (
        "<script>a 0b12x</script>",
        Some(("js_parse_error", "Unexpected token", 10)),
    ),
    (
        "<script>(a) 0b12x</script>",
        Some(("js_parse_error", "Unexpected token", 12)),
    ),
    (
        "<script>[a] 0b12x</script>",
        Some(("js_parse_error", "Unexpected token", 12)),
    ),
    (
        "<script>\"s\" 0b12x</script>",
        Some(("js_parse_error", "Unexpected token", 12)),
    ),
    (
        "<script>a /*c*/ 0b12x</script>",
        Some(("js_parse_error", "Unexpected token", 16)),
    ),
    (
        "<script>a /*\n*/ 0b12x</script>",
        Some(("js_parse_error", "Identifier directly after number", 20)),
    ),
    (
        "<script>a\n0b12x</script>",
        Some(("js_parse_error", "Identifier directly after number", 14)),
    ),
    (
        "<script>a\r\n0b12x</script>",
        Some(("js_parse_error", "Identifier directly after number", 15)),
    ),
    (
        "<script>a 0b12x</script>",
        Some(("js_parse_error", "Identifier directly after number", 16)),
    ),
    (
        "<script>x = 0b12x</script>",
        Some(("js_parse_error", "Identifier directly after number", 16)),
    ),
    (
        "<script>f(0b12x)</script>",
        Some(("js_parse_error", "Identifier directly after number", 14)),
    ),
    (
        "<script>f(1, 0b12x)</script>",
        Some(("js_parse_error", "Identifier directly after number", 17)),
    ),
    (
        "<script>a + 0b12x</script>",
        Some(("js_parse_error", "Identifier directly after number", 16)),
    ),
    (
        "<script>let a = 1 0b12x</script>",
        Some(("js_parse_error", "Unexpected token", 18)),
    ),
    (
        "<script>return 0b12x</script>",
        Some(("js_parse_error", "'return' outside of function", 8)),
    ),
    (
        "<script>0b12x</script>",
        Some(("js_parse_error", "Identifier directly after number", 12)),
    ),
    ("{1 0b12x}", Some(("expected_token", "Expected token }", 3))),
    ("{a 0b12x}", Some(("expected_token", "Expected token }", 3))),
    (
        "{a\n0b12x}",
        Some(("expected_token", "Expected token }", 3)),
    ),
    (
        "{0b12x}",
        Some(("js_parse_error", "Identifier directly after number", 5)),
    ),
    (
        "{(0b12x)}",
        Some(("js_parse_error", "Identifier directly after number", 6)),
    ),
    (
        "<p title={a 0b12x}></p>",
        Some(("expected_token", "Expected token }", 12)),
    ),
    (
        "{#if a 0b12x}{/if}",
        Some(("expected_token", "Expected token }", 7)),
    ),
    (
        "<script lang=\"ts\">let a = 1 0b12x;</script>",
        Some(("js_parse_error", "Unexpected token", 28)),
    ),
    (
        "<script>/*é😀*/ a 0b12x</script>",
        Some(("js_parse_error", "Unexpected token", 21)),
    ),
    (
        "<script>1 0b1.5</script>",
        Some(("js_parse_error", "Unexpected token", 10)),
    ),
    (
        "<script>a 0b1.5</script>",
        Some(("js_parse_error", "Unexpected token", 10)),
    ),
    (
        "<script>[a] 0b1.5</script>",
        Some(("js_parse_error", "Unexpected token", 12)),
    ),
    (
        "<script>\"s\" 0b1.5</script>",
        Some(("js_parse_error", "Unexpected token", 12)),
    ),
    (
        "<script>a /*c*/ 0b1.5</script>",
        Some(("js_parse_error", "Unexpected token", 16)),
    ),
    (
        "<script>a /*\n*/ 0b1.5</script>",
        Some(("js_parse_error", "Unexpected token", 19)),
    ),
    (
        "<script>a\n0b1.5</script>",
        Some(("js_parse_error", "Unexpected token", 13)),
    ),
    (
        "<script>a\r\n0b1.5</script>",
        Some(("js_parse_error", "Unexpected token", 14)),
    ),
    (
        "<script>a 0b1.5</script>",
        Some(("js_parse_error", "Unexpected token", 15)),
    ),
    (
        "<script>x = 0b1.5</script>",
        Some(("js_parse_error", "Unexpected token", 15)),
    ),
    (
        "<script>f(0b1.5)</script>",
        Some(("js_parse_error", "Unexpected token", 13)),
    ),
    (
        "<script>f(1, 0b1.5)</script>",
        Some(("js_parse_error", "Unexpected token", 16)),
    ),
    (
        "<script>a + 0b1.5</script>",
        Some(("js_parse_error", "Unexpected token", 15)),
    ),
    (
        "<script>let a = 1 0b1.5</script>",
        Some(("js_parse_error", "Unexpected token", 18)),
    ),
    (
        "<script>0b1.5</script>",
        Some(("js_parse_error", "Unexpected token", 11)),
    ),
    ("{1 0b1.5}", Some(("expected_token", "Expected token }", 3))),
    ("{a 0b1.5}", Some(("expected_token", "Expected token }", 3))),
    (
        "{a\n0b1.5}",
        Some(("expected_token", "Expected token }", 3)),
    ),
    ("{0b1.5}", Some(("expected_token", "Expected token }", 4))),
    ("{(0b1.5)}", Some(("js_parse_error", "Unexpected token", 5))),
    (
        "<p title={a 0b1.5}></p>",
        Some(("expected_token", "Expected token }", 12)),
    ),
    (
        "{#if a 0b1.5}{/if}",
        Some(("expected_token", "Expected token }", 7)),
    ),
    (
        "<script lang=\"ts\">let a = 1 0b1.5;</script>",
        Some(("js_parse_error", "Unexpected token", 28)),
    ),
    (
        "<script>/*é😀*/ a 0b1.5</script>",
        Some(("js_parse_error", "Unexpected token", 21)),
    ),
];

/// A `.svelte.js` module, and what svelte 5.59.1's `compileModule` raises.
const MODULES: &[(&str, Outcome<'_>)] = &[
    (
        "let a = 1 0b12;",
        Some(("js_parse_error", "Unexpected token", 10)),
    ),
    (
        "export const b = 0b12;",
        Some(("js_parse_error", "Unexpected token", 20)),
    ),
    (
        "let a = 1 0b1n2;",
        Some(("js_parse_error", "Unexpected token", 10)),
    ),
    (
        "export const b = 0b1n2;",
        Some(("js_parse_error", "Unexpected token", 21)),
    ),
    (
        "let a = 1 0o78;",
        Some(("js_parse_error", "Unexpected token", 10)),
    ),
    (
        "export const b = 0o78;",
        Some(("js_parse_error", "Unexpected token", 20)),
    ),
    (
        "let a = 1 0b12x;",
        Some(("js_parse_error", "Unexpected token", 10)),
    ),
    (
        "export const b = 0b12x;",
        Some(("js_parse_error", "Identifier directly after number", 21)),
    ),
    (
        "let a = 1 0b1.5;",
        Some(("js_parse_error", "Unexpected token", 10)),
    ),
    (
        "export const b = 0b1.5;",
        Some(("js_parse_error", "Unexpected token", 20)),
    ),
];

#[test]
fn acorn_stops_at_a_shorter_number_where_its_parser_takes_none() {
    assert_component_outcomes(COMPONENTS);
}

#[test]
fn a_module_stops_at_a_shorter_number_where_its_parser_takes_none() {
    for &(source, expected) in MODULES {
        let outcome = compile_module(source, &ModuleCompileOptions::default());
        let raised = outcome.err().map(|error| super::outcomes::raised(&error));
        let expected =
            expected.map(|(code, message, at)| super::outcomes::official(code, message, at));
        assert_eq!(raised, expected, "{source:?}");
    }
}
