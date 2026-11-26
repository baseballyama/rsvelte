//! `readHexChar`: a string's `\x` or `\uXXXX` without its hex digits is a "Bad character escape
//! sequence" at the digits.

use super::super::outcomes::{Outcome, assert_component_outcomes};

/// A component, and what svelte 5.59.1 raises in runes mode, in bytes of the source.
const COMPONENTS: &[(&str, Outcome<'_>)] = &[
    (
        "<script>'\\x'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>\"\\x\"</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>let s = 'a\\xb'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 20)),
    ),
    (
        "<script>'a' + '\\x'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 17)),
    ),
    (
        "<script>'\\x' @</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "{'\\x'}",
        Some(("js_parse_error", "Bad character escape sequence", 4)),
    ),
    (
        "{1 '\\x'}",
        Some(("js_parse_error", "Bad character escape sequence", 6)),
    ),
    (
        "<p title={'\\x'}></p>",
        Some(("js_parse_error", "Bad character escape sequence", 13)),
    ),
    (
        "<script>'\\x0'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>\"\\x0\"</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>'a' + '\\x0'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 17)),
    ),
    (
        "<script>'\\x0' @</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "{'\\x0'}",
        Some(("js_parse_error", "Bad character escape sequence", 4)),
    ),
    (
        "{1 '\\x0'}",
        Some(("js_parse_error", "Bad character escape sequence", 6)),
    ),
    (
        "<p title={'\\x0'}></p>",
        Some(("js_parse_error", "Bad character escape sequence", 13)),
    ),
    (
        "<script>'\\xG1'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>\"\\xG1\"</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>let s = 'a\\xG1b'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 20)),
    ),
    (
        "<script>'a' + '\\xG1'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 17)),
    ),
    (
        "<script>'\\xG1' @</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "{'\\xG1'}",
        Some(("js_parse_error", "Bad character escape sequence", 4)),
    ),
    (
        "{1 '\\xG1'}",
        Some(("js_parse_error", "Bad character escape sequence", 6)),
    ),
    (
        "<p title={'\\xG1'}></p>",
        Some(("js_parse_error", "Bad character escape sequence", 13)),
    ),
    (
        "<script>'\\x0G'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>\"\\x0G\"</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>let s = 'a\\x0Gb'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 20)),
    ),
    (
        "<script>'a' + '\\x0G'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 17)),
    ),
    (
        "<script>'\\x0G' @</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "{'\\x0G'}",
        Some(("js_parse_error", "Bad character escape sequence", 4)),
    ),
    (
        "{1 '\\x0G'}",
        Some(("js_parse_error", "Bad character escape sequence", 6)),
    ),
    (
        "<p title={'\\x0G'}></p>",
        Some(("js_parse_error", "Bad character escape sequence", 13)),
    ),
    (
        "<script>'\\u'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>\"\\u\"</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>'a' + '\\u'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 17)),
    ),
    (
        "<script>'\\u' @</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>\\u</script>",
        Some(("js_parse_error", "Bad character escape sequence", 10)),
    ),
    (
        "<script>let a = 1 \\u</script>",
        Some(("js_parse_error", "Bad character escape sequence", 20)),
    ),
    (
        "<script>let \\u = 1</script>",
        Some(("js_parse_error", "Bad character escape sequence", 14)),
    ),
    (
        "<script>o.\\u</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "{'\\u'}",
        Some(("js_parse_error", "Bad character escape sequence", 4)),
    ),
    (
        "{1 '\\u'}",
        Some(("js_parse_error", "Bad character escape sequence", 6)),
    ),
    (
        "{\\u}",
        Some(("js_parse_error", "Bad character escape sequence", 3)),
    ),
    (
        "<p title={'\\u'}></p>",
        Some(("js_parse_error", "Bad character escape sequence", 13)),
    ),
    (
        "<script>'\\u0'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>\"\\u0\"</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>'a' + '\\u0'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 17)),
    ),
    (
        "<script>'\\u0' @</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>\\u0</script>",
        Some(("js_parse_error", "Bad character escape sequence", 10)),
    ),
    (
        "<script>let a = 1 \\u0</script>",
        Some(("js_parse_error", "Bad character escape sequence", 20)),
    ),
    (
        "<script>let \\u0 = 1</script>",
        Some(("js_parse_error", "Bad character escape sequence", 14)),
    ),
    (
        "<script>o.\\u0</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "{'\\u0'}",
        Some(("js_parse_error", "Bad character escape sequence", 4)),
    ),
    (
        "{1 '\\u0'}",
        Some(("js_parse_error", "Bad character escape sequence", 6)),
    ),
    (
        "{\\u0}",
        Some(("js_parse_error", "Bad character escape sequence", 3)),
    ),
    (
        "<p title={'\\u0'}></p>",
        Some(("js_parse_error", "Bad character escape sequence", 13)),
    ),
    (
        "<script>'\\u00'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>\"\\u00\"</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>'a' + '\\u00'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 17)),
    ),
    (
        "<script>'\\u00' @</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>\\u00</script>",
        Some(("js_parse_error", "Bad character escape sequence", 10)),
    ),
    (
        "<script>let a = 1 \\u00</script>",
        Some(("js_parse_error", "Bad character escape sequence", 20)),
    ),
    (
        "<script>let \\u00 = 1</script>",
        Some(("js_parse_error", "Bad character escape sequence", 14)),
    ),
    (
        "<script>o.\\u00</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "{'\\u00'}",
        Some(("js_parse_error", "Bad character escape sequence", 4)),
    ),
    (
        "{1 '\\u00'}",
        Some(("js_parse_error", "Bad character escape sequence", 6)),
    ),
    (
        "{\\u00}",
        Some(("js_parse_error", "Bad character escape sequence", 3)),
    ),
    (
        "<p title={'\\u00'}></p>",
        Some(("js_parse_error", "Bad character escape sequence", 13)),
    ),
    (
        "<script>'\\u000'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>\"\\u000\"</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>'a' + '\\u000'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 17)),
    ),
    (
        "<script>'\\u000' @</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>\\u000</script>",
        Some(("js_parse_error", "Bad character escape sequence", 10)),
    ),
    (
        "<script>let a = 1 \\u000</script>",
        Some(("js_parse_error", "Bad character escape sequence", 20)),
    ),
    (
        "<script>let \\u000 = 1</script>",
        Some(("js_parse_error", "Bad character escape sequence", 14)),
    ),
    (
        "<script>o.\\u000</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "{'\\u000'}",
        Some(("js_parse_error", "Bad character escape sequence", 4)),
    ),
    (
        "{1 '\\u000'}",
        Some(("js_parse_error", "Bad character escape sequence", 6)),
    ),
    (
        "{\\u000}",
        Some(("js_parse_error", "Bad character escape sequence", 3)),
    ),
    (
        "<p title={'\\u000'}></p>",
        Some(("js_parse_error", "Bad character escape sequence", 13)),
    ),
    (
        "<script>'\\u000G'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>\"\\u000G\"</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>'a' + '\\u000G'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 17)),
    ),
    (
        "<script>'\\u000G' @</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>\\u000G</script>",
        Some(("js_parse_error", "Bad character escape sequence", 10)),
    ),
    (
        "<script>let a = 1 \\u000G</script>",
        Some(("js_parse_error", "Bad character escape sequence", 20)),
    ),
    (
        "<script>let \\u000G = 1</script>",
        Some(("js_parse_error", "Bad character escape sequence", 14)),
    ),
    (
        "<script>o.\\u000G</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "{'\\u000G'}",
        Some(("js_parse_error", "Bad character escape sequence", 4)),
    ),
    (
        "{1 '\\u000G'}",
        Some(("js_parse_error", "Bad character escape sequence", 6)),
    ),
    (
        "{\\u000G}",
        Some(("js_parse_error", "Bad character escape sequence", 3)),
    ),
    (
        "<p title={'\\u000G'}></p>",
        Some(("js_parse_error", "Bad character escape sequence", 13)),
    ),
    (
        "<script>\\uD800</script>",
        Some(("js_parse_error", "Invalid Unicode escape", 8)),
    ),
    (
        "<script>let a = 1 \\uD800</script>",
        Some(("js_parse_error", "Invalid Unicode escape", 18)),
    ),
    (
        "<script>let \\uD800 = 1</script>",
        Some(("js_parse_error", "Invalid Unicode escape", 12)),
    ),
    (
        "<script>o.\\uD800</script>",
        Some(("js_parse_error", "Invalid Unicode escape", 10)),
    ),
    (
        "{\\uD800}",
        Some(("js_parse_error", "Invalid Unicode escape", 1)),
    ),
    (
        "<script>/*é*/\r\n'\\u00'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 19)),
    ),
    (
        "<script>/*😀*/\r\n\\u00</script>",
        Some(("js_parse_error", "Bad character escape sequence", 20)),
    ),
    (
        "<script lang=\"ts\">'\\u00'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 21)),
    ),
    (
        "<script>/*é*/\r\n'\\x0'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 19)),
    ),
    (
        "<script lang=\"ts\">'\\x0'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 21)),
    ),
];

#[test]
fn a_string_escape_without_its_hex_digits_is_a_bad_escape() {
    assert_component_outcomes(COMPONENTS);
}
