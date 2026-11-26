//! Components whose script acorn rejects as it reads a token, and the controls around them.

use super::Outcome;

/// A component, and what svelte 5.59.1 raises in runes mode, in bytes of the source.
pub(super) const SCRIPTS: &[(&str, Outcome<'_>)] = &[
    (
        "<script>let a = 01.5;</script>",
        Some(("js_parse_error", "Invalid number", 16)),
    ),
    (
        "<script>let a = 1 1_;</script>",
        Some((
            "js_parse_error",
            "Numeric separator is not allowed at the last of digits",
            19,
        )),
    ),
    (
        "<script>let a = 1 1e;</script>",
        Some(("js_parse_error", "Invalid number", 18)),
    ),
    (
        "<script>let a = 1 01;</script>",
        Some(("js_parse_error", "Invalid number", 18)),
    ),
    (
        "<script>a.1_</script>",
        Some((
            "js_parse_error",
            "Numeric separator is not allowed at the last of digits",
            11,
        )),
    ),
    (
        "<script>1@</script>",
        Some(("js_parse_error", "Unexpected character '@'", 9)),
    ),
    (
        "<script>a = 1 @</script>",
        Some(("js_parse_error", "Unexpected character '@'", 14)),
    ),
    (
        "<script>let a=08+08x;</script>",
        Some(("js_parse_error", "Invalid number", 14)),
    ),
    (
        "<script>(08); let b = 1_;</script>",
        Some(("js_parse_error", "Invalid number", 9)),
    ),
    (
        "<script>let a = b 1_;</script>",
        Some((
            "js_parse_error",
            "Numeric separator is not allowed at the last of digits",
            19,
        )),
    ),
    (
        "<script>let a = 1 08;</script>",
        Some(("js_parse_error", "Invalid number", 18)),
    ),
    (
        "<script>let a = 1 .5_;</script>",
        Some((
            "js_parse_error",
            "Numeric separator is not allowed at the last of digits",
            20,
        )),
    ),
    (
        "<script>let a = (1 @);</script>",
        Some(("js_parse_error", "Unexpected character '@'", 19)),
    ),
    (
        "<script>let a = 08; b@</script>",
        Some(("js_parse_error", "Invalid number", 16)),
    ),
    (
        "<script>let a = 08; let b = 1 1_;</script>",
        Some(("js_parse_error", "Invalid number", 16)),
    ),
    (
        "<script>let a = 01; let b = 2 2;</script>",
        Some(("js_parse_error", "Invalid number", 16)),
    ),
    (
        "<script>08; 1 1</script>",
        Some(("js_parse_error", "Invalid number", 8)),
    ),
    (
        "<script>'\\08'; 1 1</script>",
        Some(("js_parse_error", "Octal literal in strict mode", 9)),
    ),
    (
        "<script>1#</script>",
        Some(("js_parse_error", "Unexpected character '𐀀'", 10)),
    ),
    (
        "<script>1 #;</script>",
        Some(("js_parse_error", "Unexpected character ';'", 11)),
    ),
    (
        "<script>let a = 1 0x;</script>",
        Some(("js_parse_error", "Expected number in radix 16", 20)),
    ),
    (
        "<script>let a = 1 0b2;</script>",
        Some(("js_parse_error", "Expected number in radix 2", 20)),
    ),
    (
        "<script>let a = 1 2x;</script>",
        Some(("js_parse_error", "Identifier directly after number", 19)),
    ),
    (
        "<script>let a = 1 a@;</script>",
        Some(("js_parse_error", "Unexpected token", 18)),
    ),
    (
        "<script>let a = 1 0n;</script>",
        Some(("js_parse_error", "Unexpected token", 18)),
    ),
    (
        "<script>let a = 1 01n;</script>",
        Some(("js_parse_error", "Invalid number", 18)),
    ),
    (
        "<script>let a = 1 1n_;</script>",
        Some(("js_parse_error", "Identifier directly after number", 20)),
    ),
    (
        "<script>1 1; 08</script>",
        Some(("js_parse_error", "Unexpected token", 10)),
    ),
    (
        "<script>1 1; @</script>",
        Some(("js_parse_error", "Unexpected token", 10)),
    ),
    (
        "<script>1 1; 0b12</script>",
        Some(("js_parse_error", "Unexpected token", 10)),
    ),
    (
        "<script>1 1 08</script>",
        Some(("js_parse_error", "Unexpected token", 10)),
    ),
    (
        "<script>1 1 @</script>",
        Some(("js_parse_error", "Unexpected token", 10)),
    ),
    (
        "<script>1 1 0b12</script>",
        Some(("js_parse_error", "Unexpected token", 10)),
    ),
    (
        "<script>1 1 1_</script>",
        Some(("js_parse_error", "Unexpected token", 10)),
    ),
    (
        "<script>1 1 '\\08'</script>",
        Some(("js_parse_error", "Unexpected token", 10)),
    ),
    (
        "<script>a b; 01</script>",
        Some(("js_parse_error", "Unexpected token", 10)),
    ),
    (
        "<script>let = 1; 01</script>",
        Some(("js_parse_error", "The keyword 'let' is reserved", 8)),
    ),
    (
        "<script>08</script>",
        Some(("js_parse_error", "Invalid number", 8)),
    ),
    (
        "<script>let a = 08;</script>",
        Some(("js_parse_error", "Invalid number", 16)),
    ),
    (
        "<script>'\\08'</script>",
        Some(("js_parse_error", "Octal literal in strict mode", 9)),
    ),
    ("<script>'\\0'</script>", None),
    (
        "<script>'\\8'</script>",
        Some(("js_parse_error", "Invalid escape sequence", 10)),
    ),
    (
        "<script>0b12</script>",
        Some(("js_parse_error", "Unexpected token", 11)),
    ),
    (
        "<script>let a = 0b12x;</script>",
        Some(("js_parse_error", "Identifier directly after number", 20)),
    ),
    (
        "<script>@</script>",
        Some(("js_parse_error", "Unexpected character '@'", 8)),
    ),
    (
        "<script>a@b</script>",
        Some(("js_parse_error", "Unexpected character '@'", 9)),
    ),
    (
        "<script>let a = 1_;</script>",
        Some((
            "js_parse_error",
            "Numeric separator is not allowed at the last of digits",
            17,
        )),
    ),
    ("<script>let a = 1 // 08\n;</script>", None),
    ("<script>0.8</script>", None),
    (
        "<script>00</script>",
        Some(("js_parse_error", "Invalid number", 8)),
    ),
    ("<script>0</script>", None),
    (
        "<script>08.5</script>",
        Some(("js_parse_error", "Invalid number", 8)),
    ),
    ("<script>0e1</script>", None),
    (
        "<script>08e1</script>",
        Some(("js_parse_error", "Invalid number", 8)),
    ),
    (
        "<script>0_8</script>",
        Some((
            "js_parse_error",
            "Numeric separator is not allowed in legacy octal numeric literals",
            9,
        )),
    ),
    (
        "<script>let s = '08 @ 0b12'; 1 1</script>",
        Some(("js_parse_error", "Unexpected token", 31)),
    ),
    (
        "<script>let s = `08 @ ${1} 0b12`; 1 1</script>",
        Some(("js_parse_error", "Unexpected token", 36)),
    ),
    (
        "<script>/* 08 @ 0b12 */ 1 1</script>",
        Some(("js_parse_error", "Unexpected token", 26)),
    ),
    (
        "<script>// 08 @ 0b12\n1 1</script>",
        Some(("js_parse_error", "Unexpected token", 23)),
    ),
    (
        "<script>let r = /08@0b12/; 1 1</script>",
        Some(("js_parse_error", "Unexpected token", 29)),
    ),
    (
        "<script>let r = /[@]/; 1 1</script>",
        Some(("js_parse_error", "Unexpected token", 25)),
    ),
    (
        "<script>let s = '\\08'; 1 1</script>",
        Some(("js_parse_error", "Octal literal in strict mode", 17)),
    ),
    (
        "<script>let s = `\\08`; 1 1</script>",
        Some((
            "js_parse_error",
            "Bad escape sequence in untagged template literal",
            17,
        )),
    ),
    (
        "<script>let s = String.raw`\\08`; 1 1</script>",
        Some(("js_parse_error", "Unexpected token", 35)),
    ),
    (
        "<script>let s = `${08}`;</script>",
        Some(("js_parse_error", "Invalid number", 19)),
    ),
    (
        "<script>`${1 @}`</script>",
        Some(("js_parse_error", "Unexpected character '@'", 13)),
    ),
    (
        "<script>let x = \"é\";\r\nlet a = 1 1_;</script>",
        Some((
            "js_parse_error",
            "Numeric separator is not allowed at the last of digits",
            34,
        )),
    ),
    (
        "<script>let x = \"é\";\r\nlet a = 01.5;</script>",
        Some(("js_parse_error", "Invalid number", 31)),
    ),
    (
        "<script>let x = \"😀\";\r\n1@</script>",
        Some(("js_parse_error", "Unexpected character '@'", 26)),
    ),
    (
        "<script>let é = 1;\r\nlet a = 08; b@</script>",
        Some(("js_parse_error", "Invalid number", 29)),
    ),
    (
        "<script lang=\"ts\">let a = 1 1_;</script>",
        Some((
            "js_parse_error",
            "Numeric separator is not allowed at the last of digits",
            29,
        )),
    ),
    (
        "<script lang=\"ts\">let a = 01.5;</script>",
        Some(("js_parse_error", "Invalid number", 26)),
    ),
    (
        "<script lang=\"ts\">1@</script>",
        Some(("js_parse_error", "Unexpected token", 19)),
    ),
    (
        "<script lang=\"ts\">let a = 08; b@</script>",
        Some(("js_parse_error", "Invalid number", 26)),
    ),
    (
        "<script lang=\"ts\">1 1; 08</script>",
        Some(("js_parse_error", "Unexpected token", 20)),
    ),
    (
        "<script lang=\"ts\">08</script>",
        Some(("js_parse_error", "Invalid number", 18)),
    ),
    (
        "<script lang=\"ts\">'\\08'</script>",
        Some(("js_parse_error", "Octal literal in strict mode", 19)),
    ),
    (
        "<script lang=\"ts\">let a: number = 1 1_;</script>",
        Some((
            "js_parse_error",
            "Numeric separator is not allowed at the last of digits",
            37,
        )),
    ),
    (
        "<script lang=\"ts\">let a = <T,>(x: T) => x; 08; 1 1</script>",
        Some(("js_parse_error", "Invalid number", 43)),
    ),
    (
        "<script lang=\"ts\">1#</script>",
        Some(("js_parse_error", "Unexpected character '𐀀'", 20)),
    ),
    (
        "<script lang=\"ts\">let s = `08 @`; 1 1</script>",
        Some(("js_parse_error", "Unexpected token", 36)),
    ),
    (
        "<script lang=\"ts\">let x = \"é\";\r\nlet a = 1 1_;</script>",
        Some((
            "js_parse_error",
            "Numeric separator is not allowed at the last of digits",
            44,
        )),
    ),
    (
        "<script>'\\01'</script>",
        Some(("js_parse_error", "Octal literal in strict mode", 9)),
    ),
    (
        "<script>'\\1'</script>",
        Some(("js_parse_error", "Octal literal in strict mode", 9)),
    ),
    (
        "<script>'\\7'</script>",
        Some(("js_parse_error", "Octal literal in strict mode", 9)),
    ),
    (
        "<script>'\\00'</script>",
        Some(("js_parse_error", "Octal literal in strict mode", 9)),
    ),
    (
        "<script>\"\\08\"</script>",
        Some(("js_parse_error", "Octal literal in strict mode", 9)),
    ),
    (
        "<script>`\\08`</script>",
        Some((
            "js_parse_error",
            "Bad escape sequence in untagged template literal",
            9,
        )),
    ),
    (
        "<script>`\\1`</script>",
        Some((
            "js_parse_error",
            "Bad escape sequence in untagged template literal",
            9,
        )),
    ),
    ("<script>x`\\08`</script>", None),
    (
        "<script>a#</script>",
        Some(("js_parse_error", "Unexpected character '𐀀'", 10)),
    ),
    (
        "<script>1 #x</script>",
        Some(("js_parse_error", "Unexpected token", 10)),
    ),
    (
        "<script>class A { #x; m() { 1 #x } }</script>",
        Some(("js_parse_error", "Unexpected token", 30)),
    ),
    (
        "<script>1#\\u{0041}</script>",
        Some(("js_parse_error", "Unexpected token", 9)),
    ),
    (
        "<script>@x class A {}</script>",
        Some(("js_parse_error", "Unexpected character '@'", 8)),
    ),
    (
        "<script>08 @</script>",
        Some(("js_parse_error", "Invalid number", 8)),
    ),
    (
        "<script>a\n@</script>",
        Some(("js_parse_error", "Unexpected character '@'", 10)),
    ),
    (
        "<script>1 1e</script>",
        Some(("js_parse_error", "Invalid number", 10)),
    ),
    (
        "<script>1e</script>",
        Some(("js_parse_error", "Invalid number", 8)),
    ),
    (
        "<script>1 0x</script>",
        Some(("js_parse_error", "Expected number in radix 16", 12)),
    ),
    (
        "<script>1.e</script>",
        Some(("js_parse_error", "Invalid number", 8)),
    ),
    (
        "<script>1\n0b12</script>",
        Some(("js_parse_error", "Unexpected token", 13)),
    ),
    (
        "<script>(0b12)</script>",
        Some(("js_parse_error", "Unexpected token", 12)),
    ),
    (
        "<script>x = 0b12</script>",
        Some(("js_parse_error", "Unexpected token", 15)),
    ),
    (
        "<script>1 0x1g</script>",
        Some(("js_parse_error", "Identifier directly after number", 13)),
    ),
    (
        "<script>0b1_2</script>",
        Some((
            "js_parse_error",
            "Numeric separator is not allowed at the last of digits",
            11,
        )),
    ),
    (
        "<script>1 0b1_2</script>",
        Some((
            "js_parse_error",
            "Numeric separator is not allowed at the last of digits",
            13,
        )),
    ),
];
