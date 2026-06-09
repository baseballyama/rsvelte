//! Runes-mode `{#await}` validation uses a fixed-size byte look-back window
//! before the `then`/`catch` value to detect a stray space (`{ :then`). A
//! multi-byte character straddling `value_start - 10` made that
//! `&source[start - 10..start]` slice land mid-character and panic with a
//! non-char-boundary slice error instead of compiling. Regression guard for
//! `char_boundary_lookback` (see `compiler::utils`).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn go(src: &str, mode: GenerateMode) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: mode,
            dev: false,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

// `$state(...)` forces runes mode (where the look-back validation runs); the
// 2-byte `é` in the promise expression sits in the 10-byte window before the
// `then`/`catch` binding so a fixed `start - 10` byte offset lands mid-`é`.
const THEN_SRC: &str = "<script>let c = $state(0)</script>{#await éaaa then v}{v}{/await}";
const CATCH_SRC: &str = "<script>let c = $state(0)</script>{#await éaa catch e}{e}{/await}";

#[test]
fn multibyte_before_then_binding_does_not_panic() {
    for mode in [GenerateMode::Client, GenerateMode::Server] {
        let out = go(THEN_SRC, mode);
        assert!(!out.contains("COMPILE_ERROR"), "{mode:?}: {out}");
    }
}

#[test]
fn multibyte_before_catch_binding_does_not_panic() {
    for mode in [GenerateMode::Client, GenerateMode::Server] {
        let out = go(CATCH_SRC, mode);
        assert!(!out.contains("COMPILE_ERROR"), "{mode:?}: {out}");
    }
}
