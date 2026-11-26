//! `readCodePoint`: a string's `\u{…}` is a bad escape without hex digits and its closing brace,
//! and "Code point out of bounds" above U+10FFFF.

use super::super::outcomes::{Outcome, assert_component_outcomes};

/// A component, and what svelte 5.59.1 raises in runes mode, in bytes of the source.
const COMPONENTS: &[(&str, Outcome<'_>)] = &[
    (
        "<script>'\\u{}'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "<script>\"\\u{}\"</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "<script>'a' + '\\u{}'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 18)),
    ),
    (
        "<script>'\\u{}' @</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "<script>\\u{}</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>let a = 1 \\u{}</script>",
        Some(("js_parse_error", "Bad character escape sequence", 21)),
    ),
    (
        "<script>let \\u{} = 1</script>",
        Some(("js_parse_error", "Bad character escape sequence", 15)),
    ),
    (
        "<script>o.\\u{}</script>",
        Some(("js_parse_error", "Bad character escape sequence", 13)),
    ),
    (
        "{'\\u{}'}",
        Some(("js_parse_error", "Bad character escape sequence", 5)),
    ),
    (
        "{1 '\\u{}'}",
        Some(("js_parse_error", "Bad character escape sequence", 7)),
    ),
    (
        "{\\u{}}",
        Some(("js_parse_error", "Bad character escape sequence", 4)),
    ),
    (
        "<p title={'\\u{}'}></p>",
        Some(("js_parse_error", "Bad character escape sequence", 14)),
    ),
    (
        "<script>'\\u{'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "<script>\"\\u{\"</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "<script>'a' + '\\u{'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 18)),
    ),
    (
        "<script>'\\u{' @</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "<script>\\u{</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>let a = 1 \\u{</script>",
        Some(("js_parse_error", "Bad character escape sequence", 21)),
    ),
    (
        "<script>let \\u{ = 1</script>",
        Some(("js_parse_error", "Bad character escape sequence", 15)),
    ),
    (
        "<script>o.\\u{</script>",
        Some(("js_parse_error", "Bad character escape sequence", 13)),
    ),
    (
        "{'\\u{'}",
        Some(("js_parse_error", "Bad character escape sequence", 5)),
    ),
    (
        "{1 '\\u{'}",
        Some(("js_parse_error", "Bad character escape sequence", 7)),
    ),
    (
        "{\\u{}",
        Some(("js_parse_error", "Bad character escape sequence", 4)),
    ),
    (
        "<p title={'\\u{'}></p>",
        Some(("js_parse_error", "Bad character escape sequence", 14)),
    ),
    (
        "<script>'\\u{110000}'</script>",
        Some(("js_parse_error", "Code point out of bounds", 12)),
    ),
    (
        "<script>\"\\u{110000}\"</script>",
        Some(("js_parse_error", "Code point out of bounds", 12)),
    ),
    (
        "<script>'a' + '\\u{110000}'</script>",
        Some(("js_parse_error", "Code point out of bounds", 18)),
    ),
    (
        "<script>'\\u{110000}' @</script>",
        Some(("js_parse_error", "Code point out of bounds", 12)),
    ),
    (
        "<script>\\u{110000}</script>",
        Some(("js_parse_error", "Code point out of bounds", 11)),
    ),
    (
        "<script>let a = 1 \\u{110000}</script>",
        Some(("js_parse_error", "Code point out of bounds", 21)),
    ),
    (
        "<script>let \\u{110000} = 1</script>",
        Some(("js_parse_error", "Code point out of bounds", 15)),
    ),
    (
        "<script>o.\\u{110000}</script>",
        Some(("js_parse_error", "Code point out of bounds", 13)),
    ),
    (
        "{'\\u{110000}'}",
        Some(("js_parse_error", "Code point out of bounds", 5)),
    ),
    (
        "{1 '\\u{110000}'}",
        Some(("js_parse_error", "Code point out of bounds", 7)),
    ),
    (
        "{\\u{110000}}",
        Some(("js_parse_error", "Code point out of bounds", 4)),
    ),
    (
        "<p title={'\\u{110000}'}></p>",
        Some(("js_parse_error", "Code point out of bounds", 14)),
    ),
    (
        "<script>'\\u{FFFFFFFFFF}'</script>",
        Some(("js_parse_error", "Code point out of bounds", 12)),
    ),
    (
        "<script>\"\\u{FFFFFFFFFF}\"</script>",
        Some(("js_parse_error", "Code point out of bounds", 12)),
    ),
    (
        "<script>'a' + '\\u{FFFFFFFFFF}'</script>",
        Some(("js_parse_error", "Code point out of bounds", 18)),
    ),
    (
        "<script>'\\u{FFFFFFFFFF}' @</script>",
        Some(("js_parse_error", "Code point out of bounds", 12)),
    ),
    (
        "<script>\\u{FFFFFFFFFF}</script>",
        Some(("js_parse_error", "Code point out of bounds", 11)),
    ),
    (
        "<script>let a = 1 \\u{FFFFFFFFFF}</script>",
        Some(("js_parse_error", "Code point out of bounds", 21)),
    ),
    (
        "<script>let \\u{FFFFFFFFFF} = 1</script>",
        Some(("js_parse_error", "Code point out of bounds", 15)),
    ),
    (
        "<script>o.\\u{FFFFFFFFFF}</script>",
        Some(("js_parse_error", "Code point out of bounds", 13)),
    ),
    (
        "{'\\u{FFFFFFFFFF}'}",
        Some(("js_parse_error", "Code point out of bounds", 5)),
    ),
    (
        "{1 '\\u{FFFFFFFFFF}'}",
        Some(("js_parse_error", "Code point out of bounds", 7)),
    ),
    (
        "{\\u{FFFFFFFFFF}}",
        Some(("js_parse_error", "Code point out of bounds", 4)),
    ),
    (
        "<p title={'\\u{FFFFFFFFFF}'}></p>",
        Some(("js_parse_error", "Code point out of bounds", 14)),
    ),
    (
        "<script>'\\u{1_0}'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "<script>\"\\u{1_0}\"</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "<script>'a' + '\\u{1_0}'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 18)),
    ),
    (
        "<script>'\\u{1_0}' @</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "<script>\\u{1_0}</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>let a = 1 \\u{1_0}</script>",
        Some(("js_parse_error", "Bad character escape sequence", 21)),
    ),
    (
        "<script>let \\u{1_0} = 1</script>",
        Some(("js_parse_error", "Bad character escape sequence", 15)),
    ),
    (
        "<script>o.\\u{1_0}</script>",
        Some(("js_parse_error", "Bad character escape sequence", 13)),
    ),
    (
        "{'\\u{1_0}'}",
        Some(("js_parse_error", "Bad character escape sequence", 5)),
    ),
    (
        "{1 '\\u{1_0}'}",
        Some(("js_parse_error", "Bad character escape sequence", 7)),
    ),
    (
        "{\\u{1_0}}",
        Some(("js_parse_error", "Bad character escape sequence", 4)),
    ),
    (
        "<p title={'\\u{1_0}'}></p>",
        Some(("js_parse_error", "Bad character escape sequence", 14)),
    ),
    (
        "<script>'\\u{ 1}'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "<script>\"\\u{ 1}\"</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "<script>'a' + '\\u{ 1}'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 18)),
    ),
    (
        "<script>'\\u{ 1}' @</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "<script>\\u{ 1}</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>let a = 1 \\u{ 1}</script>",
        Some(("js_parse_error", "Bad character escape sequence", 21)),
    ),
    (
        "<script>let \\u{ 1} = 1</script>",
        Some(("js_parse_error", "Bad character escape sequence", 15)),
    ),
    (
        "<script>o.\\u{ 1}</script>",
        Some(("js_parse_error", "Bad character escape sequence", 13)),
    ),
    (
        "{'\\u{ 1}'}",
        Some(("js_parse_error", "Bad character escape sequence", 5)),
    ),
    (
        "{1 '\\u{ 1}'}",
        Some(("js_parse_error", "Bad character escape sequence", 7)),
    ),
    (
        "{\\u{ 1}}",
        Some(("js_parse_error", "Bad character escape sequence", 4)),
    ),
    (
        "<p title={'\\u{ 1}'}></p>",
        Some(("js_parse_error", "Bad character escape sequence", 14)),
    ),
    (
        "<script>/*é*/\r\n'\\u{110000}'</script>",
        Some(("js_parse_error", "Code point out of bounds", 20)),
    ),
    (
        "<script>/*😀*/\r\n\\u{110000}</script>",
        Some(("js_parse_error", "Code point out of bounds", 21)),
    ),
    (
        "<script lang=\"ts\">'\\u{110000}'</script>",
        Some(("js_parse_error", "Code point out of bounds", 22)),
    ),
];

#[test]
fn a_braced_escape_is_read_as_acorn_reads_a_code_point() {
    assert_component_outcomes(COMPONENTS);
}
