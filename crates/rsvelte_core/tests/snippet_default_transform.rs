//! Regression test: a snippet parameter default that reads reactive state must
//! be transformed (issue #479, M-068).
//!
//! Bug: `build_fallback_args` ran `convert_expression` but not
//! `apply_transforms_to_expression`, so a default like `{#snippet foo(x = count)}`
//! emitted the bare `count` instead of `$.get(count)` inside `$.fallback(...)`.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

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
fn snippet_default_wraps_reactive_read() {
    // `count` is reassigned, so it stays reactive ($.state) rather than being
    // demoted to a plain `let`; its read in the default must be `$.get(count)`.
    let src = r#"<script>let count = $state(5);</script>
<button onclick={() => count++}>{count}</button>
{#snippet foo(x = count)}{x}{/snippet}
{@render foo()}"#;
    let out = compile_js(src);
    assert!(
        out.contains("$.fallback($$arg0?.(), $.get(count))"),
        "snippet default should wrap the reactive read as $.get(count), got:\n{out}"
    );
}
