//! Dev-mode `for await (… of X)` instrumentation.
//!
//! Upstream's `visitors/ForOfStatement.js` wraps an awaited loop's iterable in
//! `$.for_await_track_reactivity_loss(X)` when `dev` and `experimental.async`
//! are both on. rsvelte only instrumented `AwaitExpression`, so awaited
//! `for…of` loops stayed bare in every script kind. The expectations below are
//! the official compiler's output.

use rsvelte_core::compiler::ModuleCompileOptions;
use rsvelte_core::{CompileOptions, ExperimentalOptions, GenerateMode, compile, compile_module};

fn compile_component(src: &str, dev: bool, r#async: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Main.svelte".to_string()),
            generate: GenerateMode::Client,
            dev,
            experimental: ExperimentalOptions { r#async },
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

fn compile_svelte_js(src: &str, dev: bool, r#async: bool) -> String {
    compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("store.svelte.js".to_string()),
            generate: GenerateMode::Client,
            dev,
            experimental: ExperimentalOptions { r#async },
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

const WRAPPED: &str = "for await (const x of $.for_await_track_reactivity_loss(gen())) {";

#[track_caller]
fn assert_contains(out: &str, expected: &str) {
    assert!(out.contains(expected), "expected `{expected}`. Got:\n{out}");
}

#[track_caller]
fn assert_absent(out: &str, unexpected: &str) {
    assert!(
        !out.contains(unexpected),
        "unexpected `{unexpected}`. Got:\n{out}"
    );
}

const MODULE_LOOP: &str =
    "export async function run() {\n\tfor await (const x of gen()) {\n\t\tuse(x);\n\t}\n}\n";

#[test]
fn svelte_js_module_loop_is_instrumented() {
    assert_contains(&compile_svelte_js(MODULE_LOOP, true, true), WRAPPED);
}

#[test]
fn prod_leaves_the_loop_bare() {
    assert_absent(
        &compile_svelte_js(MODULE_LOOP, false, true),
        "for_await_track_reactivity_loss",
    );
}

#[test]
fn without_experimental_async_the_loop_stays_bare() {
    assert_absent(
        &compile_svelte_js(MODULE_LOOP, true, false),
        "for_await_track_reactivity_loss",
    );
}

#[test]
fn svelte_ignore_suppresses_the_loop_wrap() {
    let src = "export async function run() {\n\t// svelte-ignore await_reactivity_loss\n\tfor await (const x of gen()) {\n\t\tuse(x);\n\t}\n}\n";
    assert_absent(
        &compile_svelte_js(src, true, true),
        "for_await_track_reactivity_loss",
    );
}

#[test]
fn a_plain_for_of_is_never_wrapped() {
    let src = "export function run() {\n\tfor (const x of gen()) {\n\t\tuse(x);\n\t}\n}\n";
    assert_absent(
        &compile_svelte_js(src, true, true),
        "for_await_track_reactivity_loss",
    );
}

#[test]
fn the_wrap_is_applied_exactly_once() {
    let out = compile_svelte_js(MODULE_LOOP, true, true);
    assert_eq!(
        out.matches("$.for_await_track_reactivity_loss").count(),
        1,
        "got:\n{out}"
    );
}

#[test]
fn script_module_loop_is_instrumented() {
    let src = format!("<script module>\n{MODULE_LOOP}</script>\n\n<p>hi</p>");
    assert_contains(&compile_component(&src, true, true), WRAPPED);
}

#[test]
fn runes_instance_loop_is_instrumented() {
    let src = "<script>\n\tlet a = $state(0);\n\tasync function f() {\n\t\tfor await (const x of gen()) {\n\t\t\tuse(x);\n\t\t}\n\t}\n</script>\n";
    assert_contains(&compile_component(src, true, true), WRAPPED);
}

#[test]
fn legacy_instance_loop_is_instrumented() {
    let src = "<script>\n\texport let a;\n\tasync function f() {\n\t\tfor await (const x of gen()) {\n\t\t\tuse(x);\n\t\t}\n\t}\n</script>\n";
    assert_contains(&compile_component(src, true, true), WRAPPED);
}

/// The iterable is instrumented as an `await` first, then the loop wraps the
/// settled expression — the nesting the fixed-point splice has to converge on.
#[test]
fn an_awaited_iterable_gets_both_wraps() {
    let src = "export async function run() {\n\tfor await (const x of await gen()) {\n\t\tuse(x);\n\t}\n}\n";
    assert_contains(
        &compile_svelte_js(src, true, true),
        "$.for_await_track_reactivity_loss((await $.track_reactivity_loss(gen()))())",
    );
}
