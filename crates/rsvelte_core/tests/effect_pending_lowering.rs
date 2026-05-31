//! Issue #462 (H-121 lowering part): `$effect.pending()` must lower to
//! `$.eager(() => $.pending())` — a thunk that *calls* `$.pending()` — matching
//! upstream, not a bare `$.eager($.pending)` reference.

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
fn effect_pending_lowers_to_eager_thunk() {
    let out = client_async("<script>const n = $effect.pending();</script>\n{n}");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("$.eager(() => $.pending())"),
        "wrong $effect.pending lowering: {out}"
    );
}
