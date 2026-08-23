//! oxc's `is_irregular_whitespace` admits `U+2000..=U+200B` and `U+0085`, while
//! ECMAScript `WhiteSpace` is the `Zs` category plus four fixed code points —
//! `U+200B` (ZWSP, `Cf` since Unicode 4.0.1) and `U+0085` (NEL, `Cc`) are in
//! neither `WhiteSpace` nor `LineTerminator`. acorn agrees with the spec and
//! rejects both, so upstream rejects a `<script>` that rsvelte compiled
//! (issue #3312; #2582 recorded the `U+0085` half as unreachable from rsvelte's
//! own code, which the `irregular_whitespaces` spans make reachable).
//!
//! Every verdict below was measured against the official compiler at
//! `svelte@5.56.8`, not recalled: `Unexpected character '<ch>'` with `start` ==
//! `end` at the offending character.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn diagnostic(
    src: &str,
    generate: GenerateMode,
) -> Option<(Option<String>, String, Option<(u32, u32)>)> {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .err()
    .map(|e| {
        let d = e.diagnostic();
        (d.code, d.message, d.span)
    })
}

/// The slots the issue names. Each returns a source with `c` spliced in; the
/// injected character is the only occurrence of `c`, so the test can locate it
/// rather than hard-coding an offset that a wording change would silently move.
const CODE_SLOTS: [fn(char) -> String; 5] = [
    |c| format!("<script>\n\tlet{c} x = 1;\n</script>\n"),
    |c| format!("<script>\n\tlet x{c} = 1;\n</script>\n"),
    |c| format!("<script>\n\tlet a = 1; let b = a{c} + 1;\n</script>\n"),
    |c| format!("<script>\n{c}let x = 1;\n</script>\n"),
    |c| format!("<script>\n\tlet x = 1;\n\t${c}: console.log(x);\n</script>\n"),
];

/// The two slots where the character is data, not source layout. Upstream
/// accepts all 17 characters here, so a fix that scans the source text instead
/// of the parser's own spans fails these and not the ones above.
const OPAQUE_SLOTS: [fn(char) -> String; 2] = [
    |c| format!("<script>\n\tlet x = \"a{c}b\";\n</script>\n"),
    |c| format!("<script>\n\t// a{c}b\n\tlet x = 1;\n</script>\n"),
];

/// oxc classifies these as irregular whitespace and ECMAScript does not accept
/// them at all.
const REJECTED: [char; 2] = ['\u{200b}', '\u{85}'];

/// The rest of oxc's irregular set. Every one is real ECMAScript `WhiteSpace`,
/// so the same filter that rejects the two above must leave all of these
/// accepted — including `U+200A`, whose only difference from `U+200B` is the
/// last digit of the code point.
const ACCEPTED: [char; 15] = [
    '\u{b}', '\u{c}', '\u{a0}', '\u{feff}', '\u{1680}', '\u{2000}', '\u{2001}', '\u{2005}',
    '\u{2009}', '\u{200a}', '\u{202f}', '\u{205f}', '\u{3000}', '\u{2028}', '\u{2029}',
];

#[test]
fn zwsp_and_nel_are_rejected_where_upstream_rejects_them() {
    for ch in REJECTED {
        for (i, slot) in CODE_SLOTS.iter().enumerate() {
            let src = slot(ch);
            let at = src
                .find(ch)
                .expect("the injected character is in the source") as u32;
            for generate in [GenerateMode::Client, GenerateMode::Server] {
                let Some((code, message, span)) = diagnostic(&src, generate) else {
                    panic!(
                        "U+{:04X} in slot {i} ({generate:?}) compiled; upstream rejects it",
                        ch as u32
                    );
                };
                assert_eq!(
                    code.as_deref(),
                    Some("js_parse_error"),
                    "U+{:04X} in slot {i} ({generate:?})",
                    ch as u32
                );
                assert_eq!(
                    message,
                    format!("Unexpected character '{ch}'\nhttps://svelte.dev/e/js_parse_error"),
                    "U+{:04X} in slot {i} ({generate:?})",
                    ch as u32
                );
                assert_eq!(
                    span,
                    Some((at, at)),
                    "U+{:04X} in slot {i} ({generate:?}) — upstream reports the character itself",
                    ch as u32
                );
            }
        }
    }
}

#[test]
fn a_string_or_comment_carrying_one_still_compiles() {
    for ch in REJECTED.iter().chain(ACCEPTED.iter()) {
        for (i, slot) in OPAQUE_SLOTS.iter().enumerate() {
            let src = slot(*ch);
            assert!(
                diagnostic(&src, GenerateMode::Client).is_none(),
                "U+{:04X} in opaque slot {i} was rejected; upstream accepts it",
                *ch as u32
            );
        }
    }
}

#[test]
fn real_js_whitespace_in_oxcs_irregular_set_still_compiles() {
    for ch in ACCEPTED {
        for (i, slot) in CODE_SLOTS.iter().enumerate() {
            let src = slot(ch);
            assert!(
                diagnostic(&src, GenerateMode::Client).is_none(),
                "U+{:04X} in slot {i} was rejected; it is ECMAScript whitespace",
                ch as u32
            );
        }
    }
}
