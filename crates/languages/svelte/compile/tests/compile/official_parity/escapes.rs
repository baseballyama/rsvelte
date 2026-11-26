//! acorn's lexer rejects a bad escape in a string or a name as it reads it, in its own words: `\x`
//! and `\u` are read by `readHexChar` and `readCodePoint`, and a name's escape by `readWord1`.

use rsvelte_svelte_compile::{ModuleCompileOptions, compile_module};

use super::outcomes::{Outcome, assert_component_outcomes};

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
        "<script>let s = 'a\\ub'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 20)),
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
        "<script>a\\u</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>a\\u = 1</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>o.\\u</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "<script>class A { #\\u }</script>",
        Some(("js_parse_error", "Bad character escape sequence", 21)),
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
        "{a\\u}",
        Some(("js_parse_error", "Bad character escape sequence", 4)),
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
        "<script>let s = 'a\\u0b'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 20)),
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
        "<script>a\\u0</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>a\\u0 = 1</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>o.\\u0</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "<script>class A { #\\u0 }</script>",
        Some(("js_parse_error", "Bad character escape sequence", 21)),
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
        "{a\\u0}",
        Some(("js_parse_error", "Bad character escape sequence", 4)),
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
        "<script>let s = 'a\\u00b'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 20)),
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
        "<script>a\\u00</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>a\\u00 = 1</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>o.\\u00</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "<script>class A { #\\u00 }</script>",
        Some(("js_parse_error", "Bad character escape sequence", 21)),
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
        "{a\\u00}",
        Some(("js_parse_error", "Bad character escape sequence", 4)),
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
        "<script>a\\u000</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>a\\u000 = 1</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>o.\\u000</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "<script>class A { #\\u000 }</script>",
        Some(("js_parse_error", "Bad character escape sequence", 21)),
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
        "{a\\u000}",
        Some(("js_parse_error", "Bad character escape sequence", 4)),
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
        "<script>let s = 'a\\u000Gb'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 20)),
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
        "<script>a\\u000G</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>a\\u000G = 1</script>",
        Some(("js_parse_error", "Bad character escape sequence", 11)),
    ),
    (
        "<script>o.\\u000G</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "<script>class A { #\\u000G }</script>",
        Some(("js_parse_error", "Bad character escape sequence", 21)),
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
        "{a\\u000G}",
        Some(("js_parse_error", "Bad character escape sequence", 4)),
    ),
    (
        "<p title={'\\u000G'}></p>",
        Some(("js_parse_error", "Bad character escape sequence", 13)),
    ),
    (
        "<script>'\\u{}'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "<script>\"\\u{}\"</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "<script>let s = 'a\\u{}b'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 21)),
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
        "<script>a\\u{}</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "<script>a\\u{} = 1</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "<script>o.\\u{}</script>",
        Some(("js_parse_error", "Bad character escape sequence", 13)),
    ),
    (
        "<script>class A { #\\u{} }</script>",
        Some(("js_parse_error", "Bad character escape sequence", 22)),
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
        "{a\\u{}}",
        Some(("js_parse_error", "Bad character escape sequence", 5)),
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
        "<script>let s = 'a\\u{b'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 21)),
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
        "<script>a\\u{</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "<script>a\\u{ = 1</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "<script>o.\\u{</script>",
        Some(("js_parse_error", "Bad character escape sequence", 13)),
    ),
    (
        "<script>class A { #\\u{ }</script>",
        Some(("js_parse_error", "Bad character escape sequence", 22)),
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
        "{a\\u{}",
        Some(("js_parse_error", "Bad character escape sequence", 5)),
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
        "<script>let s = 'a\\u{110000}b'</script>",
        Some(("js_parse_error", "Code point out of bounds", 21)),
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
        "<script>a\\u{110000}</script>",
        Some(("js_parse_error", "Code point out of bounds", 12)),
    ),
    (
        "<script>a\\u{110000} = 1</script>",
        Some(("js_parse_error", "Code point out of bounds", 12)),
    ),
    (
        "<script>o.\\u{110000}</script>",
        Some(("js_parse_error", "Code point out of bounds", 13)),
    ),
    (
        "<script>class A { #\\u{110000} }</script>",
        Some(("js_parse_error", "Code point out of bounds", 22)),
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
        "{a\\u{110000}}",
        Some(("js_parse_error", "Code point out of bounds", 5)),
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
        "<script>let s = 'a\\u{FFFFFFFFFF}b'</script>",
        Some(("js_parse_error", "Code point out of bounds", 21)),
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
        "<script>a\\u{FFFFFFFFFF}</script>",
        Some(("js_parse_error", "Code point out of bounds", 12)),
    ),
    (
        "<script>a\\u{FFFFFFFFFF} = 1</script>",
        Some(("js_parse_error", "Code point out of bounds", 12)),
    ),
    (
        "<script>o.\\u{FFFFFFFFFF}</script>",
        Some(("js_parse_error", "Code point out of bounds", 13)),
    ),
    (
        "<script>class A { #\\u{FFFFFFFFFF} }</script>",
        Some(("js_parse_error", "Code point out of bounds", 22)),
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
        "{a\\u{FFFFFFFFFF}}",
        Some(("js_parse_error", "Code point out of bounds", 5)),
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
        "<script>let s = 'a\\u{1_0}b'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 21)),
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
        "<script>a\\u{1_0}</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "<script>a\\u{1_0} = 1</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "<script>o.\\u{1_0}</script>",
        Some(("js_parse_error", "Bad character escape sequence", 13)),
    ),
    (
        "<script>class A { #\\u{1_0} }</script>",
        Some(("js_parse_error", "Bad character escape sequence", 22)),
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
        "{a\\u{1_0}}",
        Some(("js_parse_error", "Bad character escape sequence", 5)),
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
        "<script>let s = 'a\\u{ 1}b'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 21)),
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
        "<script>a\\u{ 1}</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "<script>a\\u{ 1} = 1</script>",
        Some(("js_parse_error", "Bad character escape sequence", 12)),
    ),
    (
        "<script>o.\\u{ 1}</script>",
        Some(("js_parse_error", "Bad character escape sequence", 13)),
    ),
    (
        "<script>class A { #\\u{ 1} }</script>",
        Some(("js_parse_error", "Bad character escape sequence", 22)),
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
        "{a\\u{ 1}}",
        Some(("js_parse_error", "Bad character escape sequence", 5)),
    ),
    (
        "<p title={'\\u{ 1}'}></p>",
        Some(("js_parse_error", "Bad character escape sequence", 14)),
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
        "<script>a\\uD800</script>",
        Some(("js_parse_error", "Invalid Unicode escape", 9)),
    ),
    (
        "<script>a\\uD800 = 1</script>",
        Some(("js_parse_error", "Invalid Unicode escape", 9)),
    ),
    (
        "<script>o.\\uD800</script>",
        Some(("js_parse_error", "Invalid Unicode escape", 10)),
    ),
    (
        "<script>class A { #\\uD800 }</script>",
        Some(("js_parse_error", "Invalid Unicode escape", 19)),
    ),
    (
        "{\\uD800}",
        Some(("js_parse_error", "Invalid Unicode escape", 1)),
    ),
    (
        "{a\\uD800}",
        Some(("js_parse_error", "Invalid Unicode escape", 2)),
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
        "<script lang=\"ts\">let a\\u00: number</script>",
        Some(("js_parse_error", "Bad character escape sequence", 25)),
    ),
    (
        "<script>/*é*/\r\n'\\x0'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 19)),
    ),
    (
        "<script lang=\"ts\">'\\x0'</script>",
        Some(("js_parse_error", "Bad character escape sequence", 21)),
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
    (
        "<script lang=\"ts\">let a\\u{110000}: number</script>",
        Some(("js_parse_error", "Code point out of bounds", 26)),
    ),
];

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
fn acorn_rejects_a_bad_escape_in_its_own_words() {
    assert_component_outcomes(COMPONENTS);
}

#[test]
fn a_module_rejects_a_bad_escape_in_acorns_words() {
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
