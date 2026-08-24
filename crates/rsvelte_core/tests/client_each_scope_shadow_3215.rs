//! The client each-block visitor never carried the each block's own Phase-2
//! scope while building the body, so `get_binding` resolved an item name that
//! shadows an instance binding to the OUTER one (#3215). That decides
//! `is_defined`, which decides the `?? ''` guard on a concatenated
//! interpolation, and the constant fold in the `{:else}` fallback.
//!
//! Every expectation here is the official compiler's output for the same source.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

const PRELUDE: &str = "<script>\n\tlet n = 7;\n\tlet items = [1, 2];\n</script>\n";

fn client(body: &str) -> String {
    compile(
        &format!("{PRELUDE}{body}"),
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

#[test]
fn a_shadowing_each_item_keeps_the_nullish_guard() {
    // The outer `let n = 7` is a non-updated literal, so it evaluates as
    // defined and needs no guard; the item does not.
    let out = client("{#each items as n}<b title=\"v{n}\">x</b>{/each}");
    assert!(
        out.contains("$.set_attribute(b, 'title', `v${$.get(n) ?? ''}`)"),
        "{out}"
    );

    let out = client("{#each items as n}<b>v{n}</b>{/each}");
    assert!(
        out.contains("$.set_text(text, `v${$.get(n) ?? ''}`)"),
        "{out}"
    );
}

#[test]
fn the_else_fallback_resolves_to_the_each_binding() {
    // Upstream visits the fallback with the each scope, so the read is the
    // (unbound) item rather than the instance literal.
    let out = client("{#each items as n}<b>{n}</b>{:else}<i>{n}</i>{/each}");
    assert!(
        out.contains("$.template_effect(() => $.set_text(text_1, n))"),
        "{out}"
    );
    assert!(!out.contains("nodeValue = '7'"), "{out}");
}

#[test]
fn a_non_shadowing_read_still_folds() {
    // The negative control: an instance read from inside an each body must
    // still constant-fold, and an each INDEX is always a number, so it keeps
    // reading bare with no guard.
    let out = client("{#each items as q}<b title=\"v{n}\">x</b>{/each}");
    assert!(out.contains("$.set_attribute(b, 'title', 'v7')"), "{out}");

    let out = client("{#each items as _, n}<b title=\"v{n}\">x</b>{/each}");
    assert!(
        out.contains("$.set_attribute(b, 'title', `v${n}`)"),
        "{out}"
    );
}
