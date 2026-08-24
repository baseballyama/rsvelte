//! A regex literal is opaque, so `/\$mystore/` names no store. Phase 2's
//! `$`-reference collector had string and comment state but no regex state, so
//! the literal's body was scanned as code — and because the name then became a
//! store, phase 3 rewrote the literal itself to `/\$mystore()/`, silently
//! changing what the user's regex matches.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_to(src: &str, generate: GenerateMode) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate,
            dev: false,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

fn client(src: &str) -> String {
    compile_to(src, GenerateMode::Client)
}

fn server(src: &str) -> String {
    compile_to(src, GenerateMode::Server)
}

/// `(label, source, the literal that must survive byte for byte)`. Every one of
/// these compiles on the official compiler with no store anywhere.
const REGEX_CASES: &[(&str, &str, &str)] = &[
    (
        "prop",
        "<script>\n\tconst re = /\\$mystore/;\n\texport let mystore;\n</script>\n<b>{mystore}</b>\n",
        "/\\$mystore/",
    ),
    (
        "no-binding",
        "<script>\n\tconst re = /\\$nowhere/;\n\tlet count = 0;\n</script>\n<b>{count}</b>\n",
        "/\\$nowhere/",
    ),
    (
        "runes",
        "<script>\n\tconst re = /\\$mystore/;\n\tlet { mystore } = $props();\n</script>\n<b>{mystore}</b>\n",
        "/\\$mystore/",
    ),
    (
        "after-return",
        "<script>\n\texport let mystore;\n\tfunction f() { return /\\$mystore/; }\n</script>\n<b>{mystore}{f()}</b>\n",
        "/\\$mystore/",
    ),
    (
        "in-template-literal",
        "<script>\n\texport let mystore;\n\tconst s = `${/\\$mystore/.source}`;\n</script>\n<b>{mystore}{s}</b>\n",
        "/\\$mystore/",
    ),
    (
        // A `/` inside a character class does not close the literal.
        "char-class-slash",
        "<script>\n\texport let mystore;\n\tconst re = /[/]\\$mystore/;\n</script>\n<b>{mystore}</b>\n",
        "/[/]\\$mystore/",
    ),
    (
        // An escaped `/` does not close it either.
        "escaped-slash",
        "<script>\n\texport let mystore;\n\tconst re = /a\\/b\\$mystore/;\n</script>\n<b>{mystore}</b>\n",
        "/a\\/b\\$mystore/",
    ),
    (
        "module-script",
        "<script module>\n\texport const re = /\\$mystore/;\n</script>\n<script>\n\texport let mystore;\n</script>\n<b>{mystore}</b>\n",
        "/\\$mystore/",
    ),
    (
        // A division earlier in the script must not shift the decision for a
        // later `/`: each is answered from its own preceding token.
        "after-a-division",
        "<script>\n\texport let mystore;\n\tlet a = 6, b = 2;\n\tlet c = a / b;\n\tconst re = /\\$mystore/;\n</script>\n<b>{mystore}{c}</b>\n",
        "/\\$mystore/",
    ),
];

#[test]
fn a_dollar_name_inside_a_regex_literal_is_not_a_store() {
    for (label, src, _) in REGEX_CASES {
        for (mode, out) in [("client", client(src)), ("server", server(src))] {
            assert!(!out.contains("COMPILE_ERROR"), "{label}/{mode}: {out}");
            assert!(
                !out.contains("setup_stores"),
                "{label}/{mode}: regex body became a store subscription:\n{out}"
            );
            assert!(
                !out.contains("store_get"),
                "{label}/{mode}: regex body became a store read:\n{out}"
            );
        }
    }
}

#[test]
fn the_regex_literal_survives_byte_for_byte() {
    for (label, src, literal) in REGEX_CASES {
        for (mode, out) in [("client", client(src)), ("server", server(src))] {
            assert!(
                out.contains(literal),
                "{label}/{mode}: `{literal}` was rewritten:\n{out}"
            );
        }
    }
}

/// The opposite direction: skipping too much would lose a real subscription.
/// `$other` is spelled only inside the regex, `$s` only outside it.
#[test]
fn a_real_store_beside_a_regex_still_subscribes() {
    let src = "<script>\n\timport { readable } from 'svelte/store';\n\tconst re = /\\$other/;\n\tconst s = readable(1);\n</script>\n<b>{$s}</b>\n";
    let out = client(src);
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("store_get"), "the real store was lost:\n{out}");
    assert!(
        !out.contains("'$other'"),
        "the regex body still became a store:\n{out}"
    );
    assert!(out.contains("/\\$other/"), "literal rewritten:\n{out}");
}

/// A `/` that is division must stay division — the guard reads the preceding
/// token, and reading it wrong would swallow the rest of the script.
#[test]
fn division_is_not_read_as_a_regex_literal() {
    for (label, src) in [
        (
            "ascii",
            "<script>\n\texport let mystore;\n\tlet a = 6, b = 2;\n\tlet c = a / b / 1;\n</script>\n<b>{mystore}{c}</b>\n",
        ),
        (
            // The preceding token is not ASCII, and JS spells no operator
            // outside ASCII — so a non-ASCII code char is an identifier char.
            "non-ascii-identifier",
            "<script>\n\texport let mystore;\n\tlet \u{65e5}\u{672c} = 6;\n\tlet c = \u{65e5}\u{672c} / 2;\n</script>\n<b>{mystore}{c}</b>\n",
        ),
    ] {
        for (mode, out) in [("client", client(src)), ("server", server(src))] {
            assert!(!out.contains("COMPILE_ERROR"), "{label}/{mode}: {out}");
            assert!(
                out.contains("/ 2") || out.contains("/ b"),
                "{label}/{mode}: the division was swallowed:\n{out}"
            );
        }
    }
}
