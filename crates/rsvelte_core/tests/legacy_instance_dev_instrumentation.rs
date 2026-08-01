//! Regression test for legacy (non-runes) instance scripts skipping the dev
//! instrumentation pass (baseballyama/rsvelte#2116).
//!
//! Upstream runs one client visitor map over both modes, so
//! `visitors/BinaryExpression.js` and `visitors/AwaitExpression.js` apply to a
//! legacy component's instance script exactly as they do to a runes one. In
//! rsvelte both rewrites rode the `if analysis.runes` AST pass, so a legacy
//! component emitted bare operators and bare `await`s. The expectations below
//! are the official compiler's output.

use rsvelte_core::CompileOptions;
use rsvelte_core::GenerateMode;
use rsvelte_core::compile;

fn compile_client(src: &str, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Main.svelte".to_string()),
            generate: GenerateMode::Client,
            dev,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[track_caller]
fn assert_emits(src: &str, expected: &str) {
    let out = compile_client(src, true);
    assert!(out.contains(expected), "expected `{expected}`. Got:\n{out}");
}

#[track_caller]
fn assert_absent(src: &str, unexpected: &str) {
    let out = compile_client(src, false);
    assert!(
        !out.contains(unexpected),
        "unexpected `{unexpected}` in non-dev output. Got:\n{out}"
    );
}

#[test]
fn legacy_instance_equality_is_instrumented() {
    let src = "<script>\n\texport let a = 1;\n\texport let b = 2;\n\tlet c = a === b;\n\tlet d = a !== b;\n\tlet e = a == b;\n\tlet f = a != b;\n</script>\n\n<p>{c}{d}{e}{f}</p>";
    assert_emits(src, "$.strict_equals(a(), b());");
    assert_emits(src, "$.strict_equals(a(), b(), false);");
    assert_emits(src, "$.equals(a(), b());");
    assert_emits(src, "$.equals(a(), b(), false);");
}

#[test]
fn legacy_reactive_statement_body_is_instrumented() {
    // `$:` statements are lowered into `$.legacy_pre_effect(...)` before the
    // instrumentation runs; the helper body still has to be rewritten.
    let src = "<script>\n\texport let a = 1;\n\texport let b = 2;\n\t$: e = a !== b;\n</script>\n\n<p>{e}</p>";
    assert_emits(src, "$.set(e, $.strict_equals(a(), b(), false));");
}

#[test]
fn legacy_instance_await_is_instrumented() {
    let src = "<script>\n\tasync function load() {\n\t\tconst r = await fetch(\"/x\");\n\t\treturn r;\n\t}\n</script>\n\n<button on:click={load}>go</button>";
    assert_emits(src, "(await $.track_reactivity_loss(fetch(\"/x\")))()");
}

#[test]
fn legacy_nested_await_settles_innermost_first() {
    let src = "<script>\n\tasync function load() {\n\t\treturn await g(await h());\n\t}\n</script>\n\n<button on:click={load}>go</button>";
    assert_emits(
        src,
        "(await $.track_reactivity_loss(g((await $.track_reactivity_loss(h()))())))()",
    );
}

#[test]
fn legacy_await_operand_of_equality_settles_both() {
    let src = "<script>\n\tasync function load() {\n\t\treturn (await g()) === 1;\n\t}\n</script>\n\n<button on:click={load}>go</button>";
    assert_emits(
        src,
        "$.strict_equals((await $.track_reactivity_loss(g()))(), 1)",
    );
}

#[test]
fn legacy_svelte_ignore_suppresses_the_await_wrap() {
    let src = "<script>\n\tasync function load() {\n\t\t// svelte-ignore await_reactivity_loss\n\t\tconst r = await g();\n\t\treturn r;\n\t}\n</script>\n\n<button on:click={load}>go</button>";
    let out = compile_client(src, true);
    assert!(
        !out.contains("$.track_reactivity_loss"),
        "expected the ignore comment to suppress the wrap. Got:\n{out}"
    );
}

#[test]
fn non_dev_legacy_output_is_untouched() {
    let src = "<script>\n\texport let a = 1;\n\texport let b = 2;\n\tlet c = a === b;\n\tasync function load() {\n\t\treturn await fetch('/x');\n\t}\n</script>\n\n<p>{c}</p>";
    assert_absent(src, "$.strict_equals");
    assert_absent(src, "$.track_reactivity_loss");
}
