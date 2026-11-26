//! `readWord1`: an escape in a name must be a `\u` escape of a character that may stand there.

use super::super::outcomes::{Outcome, assert_component_outcomes};

/// A component, and what svelte 5.59.1 raises in runes mode, in bytes of the source.
const COMPONENTS: &[(&str, Outcome<'_>)] = &[
    (
        "<script>let s = 'a\\ub'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 20)),
    ),
    (
        "<script>a\\u</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>a\\u = 1</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>class A { #\\u }</script>",
        Some(("js_parse_error", "Bad character escape sequence", 21)),
    ),
    (
        "{a\\u}",
        Some(("js_parse_error", "Bad character escape sequence", 4)),
    ),
    (
        "<script>let s = 'a\\u0b'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 20)),
    ),
    (
        "<script>a\\u0</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>a\\u0 = 1</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>class A { #\\u0 }</script>",
        Some(("js_parse_error", "Bad character escape sequence", 21)),
    ),
    (
        "{a\\u0}",
        Some(("js_parse_error", "Bad character escape sequence", 4)),
    ),
    (
        "<script>let s = 'a\\u00b'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 20)),
    ),
    (
        "<script>a\\u00</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>a\\u00 = 1</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>class A { #\\u00 }</script>",
        Some(("js_parse_error", "Bad character escape sequence", 21)),
    ),
    (
        "{a\\u00}",
        Some(("js_parse_error", "Bad character escape sequence", 4)),
    ),
    (
        "<script>a\\u000</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>a\\u000 = 1</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>class A { #\\u000 }</script>",
        Some(("js_parse_error", "Bad character escape sequence", 21)),
    ),
    (
        "{a\\u000}",
        Some(("js_parse_error", "Bad character escape sequence", 4)),
    ),
    (
        "<script>let s = 'a\\u000Gb'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 20)),
    ),
    (
        "<script>a\\u000G</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>a\\u000G = 1</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>class A { #\\u000G }</script>",
        Some(("js_parse_error", "Bad character escape sequence", 21)),
    ),
    (
        "{a\\u000G}",
        Some(("js_parse_error", "Bad character escape sequence", 4)),
    ),
    (
        "<script>let s = 'a\\u{}b'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 21)),
    ),
    (
        "<script>a\\u{}</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "<script>a\\u{} = 1</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "<script>class A { #\\u{} }</script>",
        Some(("js_parse_error", "Bad character escape sequence", 22)),
    ),
    (
        "{a\\u{}}",
        Some(("js_parse_error", "Bad character escape sequence", 5)),
    ),
    (
        "<script>let s = 'a\\u{b'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 21)),
    ),
    (
        "<script>a\\u{</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "<script>a\\u{ = 1</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "<script>class A { #\\u{ }</script>",
        Some(("js_parse_error", "Bad character escape sequence", 22)),
    ),
    (
        "{a\\u{}",
        Some(("js_parse_error", "Bad character escape sequence", 5)),
    ),
    (
        "<script>let s = 'a\\u{110000}b'</script>",
        Some(("js_parse_error", "Code point out of bounds", 21)),
    ),
    (
        "<script>a\\u{110000}</script>",
        Some(("js_parse_error", "Code point out of bounds", 12)),
    ),
    (
        "<script>a\\u{110000} = 1</script>",
        Some(("js_parse_error", "Code point out of bounds", 12)),
    ),
    (
        "<script>class A { #\\u{110000} }</script>",
        Some(("js_parse_error", "Code point out of bounds", 22)),
    ),
    (
        "{a\\u{110000}}",
        Some(("js_parse_error", "Code point out of bounds", 5)),
    ),
    (
        "<script>let s = 'a\\u{FFFFFFFFFF}b'</script>",
        Some(("js_parse_error", "Code point out of bounds", 21)),
    ),
    (
        "<script>a\\u{FFFFFFFFFF}</script>",
        Some(("js_parse_error", "Code point out of bounds", 12)),
    ),
    (
        "<script>a\\u{FFFFFFFFFF} = 1</script>",
        Some(("js_parse_error", "Code point out of bounds", 12)),
    ),
    (
        "<script>class A { #\\u{FFFFFFFFFF} }</script>",
        Some(("js_parse_error", "Code point out of bounds", 22)),
    ),
    (
        "{a\\u{FFFFFFFFFF}}",
        Some(("js_parse_error", "Code point out of bounds", 5)),
    ),
    (
        "<script>let s = 'a\\u{1_0}b'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 21)),
    ),
    (
        "<script>a\\u{1_0}</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "<script>a\\u{1_0} = 1</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "<script>class A { #\\u{1_0} }</script>",
        Some(("js_parse_error", "Bad character escape sequence", 22)),
    ),
    (
        "{a\\u{1_0}}",
        Some(("js_parse_error", "Bad character escape sequence", 5)),
    ),
    (
        "<script>let s = 'a\\u{ 1}b'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 21)),
    ),
    (
        "<script>a\\u{ 1}</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "<script>a\\u{ 1} = 1</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "<script>class A { #\\u{ 1} }</script>",
        Some(("js_parse_error", "Bad character escape sequence", 22)),
    ),
    (
        "{a\\u{ 1}}",
        Some(("js_parse_error", "Bad character escape sequence", 5)),
    ),
    (
        "<script>a\\uD800</script>",
        Some(("js_parse_error", "Invalid Unicode escape", 9)),
    ),
    (
        "<script>a\\uD800 = 1</script>",
        Some(("js_parse_error", "Invalid Unicode escape", 9)),
    ),
    (
        "<script>class A { #\\uD800 }</script>",
        Some(("js_parse_error", "Invalid Unicode escape", 19)),
    ),
    (
        "{a\\uD800}",
        Some(("js_parse_error", "Invalid Unicode escape", 2)),
    ),
    (
        "<script lang=\"ts\">let a\\u00: number</script>",
        Some(("js_parse_error", "Bad character escape sequence", 25)),
    ),
    (
        "<script lang=\"ts\">let a\\u{110000}: number</script>",
        Some(("js_parse_error", "Code point out of bounds", 26)),
    ),
];

#[test]
fn an_escape_in_a_name_is_read_as_acorn_reads_a_word() {
    assert_component_outcomes(COMPONENTS);
}
