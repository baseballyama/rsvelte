//! The SSR constant-fold harvests `$derived(<expr>)` declarations by scanning the
//! instance script for the literal text `$derived(`, on the premise that a derived
//! value is read-only and so safe to inline. In explicit legacy mode `$derived` is a
//! store subscription, not a rune, so the declared value is the call's RESULT and the
//! premise is false — rsvelte inlined the ARGUMENT and froze the rendered value.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_server(src: &str, runes: Option<bool>) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Server,
            dev: false,
            runes,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

const LEGACY: &str =
    "<svelte:options runes={false} />\n<script>\n\tlet x = $derived(1);\n</script>\n\n<p>{x}</p>\n";

#[test]
fn a_legacy_derived_is_not_folded_into_the_template() {
    let out = compile_server(LEGACY, None);
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("$.escape(x)"), "{out}");
    assert!(!out.contains("<p>1</p>"), "{out}");
}

#[test]
fn the_compile_option_alone_reaches_the_same_branch() {
    let src = "<script>\n\tlet x = $derived(1);\n</script>\n\n<p>{x}</p>\n";
    let out = compile_server(src, Some(false));
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("$.escape(x)"), "{out}");
    assert!(!out.contains("<p>1</p>"), "{out}");
}

/// The positive control: the same declaration in runes mode IS a rune, and upstream
/// folds it, so the fix must not be a blanket "never fold".
#[test]
fn a_runes_mode_derived_is_still_folded() {
    let src = "<script>\n\tlet x = $derived(1);\n</script>\n\n<p>{x}</p>\n";
    let out = compile_server(src, None);
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("<p>1</p>"), "{out}");
    assert!(!out.contains("$.escape(x)"), "{out}");
}

/// The store the subscription resolves to must still be read at runtime — a fold
/// that merely stopped inlining the argument while dropping the call would also
/// satisfy the assertions above.
#[test]
fn the_declaration_still_subscribes_to_the_store() {
    let src = "<svelte:options runes={false} />\n<script>\n\timport { writable } from 'svelte/store';\n\n\tconst derived = writable((f) => f);\n\tlet x = $derived(1);\n</script>\n\n<p>{x}</p>\n";
    let out = compile_server(src, None);
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("let x = $.store_get($$store_subs ??= {}, '$derived', derived)(1);"),
        "{out}"
    );
}
