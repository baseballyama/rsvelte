//! Regression test: a call-only `<title>` expression must bind its memo
//! parameter (issue #476, H-157).
//!
//! Bug: `<svelte:head><title>{foo()}</title></svelte:head>` memoised `foo()` as
//! `$0` but, because `has_state` was false, fell through to the plain
//! `$.effect(() => { title = $0 ?? '' })` form — leaving `$0` unbound (undefined).
//! It must use `$.deferred_template_effect(($0) => …, [() => foo()])` like upstream.

use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_js(src: &str) -> String {
    let result = compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            runes: Some(true),
            ..Default::default()
        },
    )
    .expect("compile");
    result.js.code
}

#[test]
fn call_only_title_binds_memo_param() {
    let src = r#"<script>function foo() { return 'x'; }</script>
<svelte:head><title>{foo()}</title></svelte:head>"#;
    let out = compile_js(src);
    assert!(
        out.contains("deferred_template_effect"),
        "call-only title should use deferred_template_effect, got:\n{out}"
    );
    // The memo parameter must be bound by the callback arrow.
    assert!(
        out.contains("($0)"),
        "memo parameter $0 must be bound, got:\n{out}"
    );
    // And supplied as a thunk in the deps array.
    assert!(
        out.contains("() => foo()"),
        "memoised call should be passed as a thunk, got:\n{out}"
    );
}
