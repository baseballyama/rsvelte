//! Regression test: `<svelte:options immutable>` in runes mode emits the
//! `options_deprecated_immutable` warning (issue #481, M-061). The warning was
//! defined but never emitted.

use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn warnings(src: &str) -> Vec<String> {
    let r = compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("compile");
    r.warnings.into_iter().map(|w| w.code).collect()
}

#[test]
fn immutable_option_warns_in_runes_mode() {
    let src = "<svelte:options immutable />\n<script>let x = $state(0);</script>{x}";
    assert!(
        warnings(src)
            .iter()
            .any(|c| c == "options_deprecated_immutable"),
        "expected options_deprecated_immutable in runes mode"
    );
}

#[test]
fn immutable_option_silent_in_legacy_mode() {
    let src = "<svelte:options immutable />\n<div>hi</div>";
    assert!(
        !warnings(src)
            .iter()
            .any(|c| c == "options_deprecated_immutable"),
        "legacy mode must not warn (matches upstream)"
    );
}
