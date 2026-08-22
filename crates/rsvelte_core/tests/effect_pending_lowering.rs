//! Issue #462 (H-121 lowering part): `$effect.pending()` lowers to
//! `$.eager($.pending)`.
//!
//! Upstream builds `b.call('$.eager', b.thunk(b.call('$.pending')))`, and
//! `thunk` runs `unthunk`, which drops the arrow around a zero-argument call of
//! an identifier — so the argument is the bare reference, not a thunk that calls
//! it. This file used to assert the opposite, with a doc comment stating it
//! matched upstream; nothing measured that claim until the runes grid did.
//!
//! The subject is a class field rather than a `const`: upstream's client
//! `VariableDeclaration` drops a declarator initialized by `$effect.pending()`
//! outright (issue #3173), so a declarator shows nothing about the lowering.

use rsvelte_core::{CompileOptions, ExperimentalOptions, GenerateMode, compile};

fn client_async(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
            dev: false,
            experimental: ExperimentalOptions { r#async: true },
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

#[test]
fn effect_pending_lowers_to_a_bare_eager_reference() {
    let out = client_async("<script>class K { n = $effect.pending(); }</script>\n{new K().n}");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("$.eager($.pending)"),
        "wrong $effect.pending lowering: {out}"
    );
}

#[test]
fn effect_pending_in_a_template_expression_lowers_the_same_way() {
    let out = client_async("<script>let o = $state(1);</script>\n{$effect.pending()}{o}");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("$.eager($.pending)"),
        "wrong $effect.pending lowering: {out}"
    );
}
