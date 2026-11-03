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

/// Upstream rebuilds the loop and the call without positions, so esrap prints
/// the iterable's comments inside `$.for_await_track_reactivity_loss(…)`:
/// every comment after `left`, then every comment starting on the iterable's
/// last line. Expected outputs are the official compiler's (5.57.3), minus the
/// version banner.
const COMMENT_PLACEMENT: &[(&str, &str, &str)] = &[
    (
        "leading_after_of",
        "export async function f(xs, use) {\n\tfor await (const x of /* it */ xs) {}\n\tafter();\n}\n",
        "import * as $ from 'svelte/internal/client';\n\nexport async function f(xs, use) {\n\tfor await (const x of $.for_await_track_reactivity_loss(/* it */ xs)) {}\n\n\tafter();\n}",
    ),
    (
        "leading_before_of",
        "export async function f(xs, use) {\n\tfor await (const x /* c */ of xs) {}\n\tafter();\n}\n",
        "import * as $ from 'svelte/internal/client';\n\nexport async function f(xs, use) {\n\tfor await (const x of $.for_await_track_reactivity_loss(/* c */ xs)) {}\n\n\tafter();\n}",
    ),
    (
        "leading_on_its_own_line",
        "export async function f(xs, use) {\n\tfor await (const x of /* it */\n\t\txs) {}\n\tafter();\n}\n",
        "import * as $ from 'svelte/internal/client';\n\nexport async function f(xs, use) {\n\tfor await (const x of $.for_await_track_reactivity_loss(\n\t\t/* it */\n\t\txs\n\t)) {}\n\n\tafter();\n}",
    ),
    (
        "jsdoc_cast",
        "export async function f(xs, use) {\n\tfor await (const x of /** @type {any} */ (xs)) {}\n\tafter();\n}\n",
        "import * as $ from 'svelte/internal/client';\n\nexport async function f(xs, use) {\n\tfor await (const x of $.for_await_track_reactivity_loss(/** @type {any} */ (xs))) {}\n\n\tafter();\n}",
    ),
    (
        "trailing_before_paren",
        "export async function f(xs, use) {\n\tfor await (const x of xs /* t */) {}\n\tafter();\n}\n",
        "import * as $ from 'svelte/internal/client';\n\nexport async function f(xs, use) {\n\tfor await (const x of $.for_await_track_reactivity_loss(xs /* t */)) {}\n\n\tafter();\n}",
    ),
    (
        "trailing_line_before_paren",
        "export async function f(xs, use) {\n\tfor await (const x of xs // t\n\t) {}\n\tafter();\n}\n",
        "import * as $ from 'svelte/internal/client';\n\nexport async function f(xs, use) {\n\tfor await (const x of $.for_await_track_reactivity_loss(xs // t\n\t)) {}\n\n\tafter();\n}",
    ),
    (
        "trailing_before_body",
        "export async function f(xs, use) {\n\tfor await (const x of xs) /* b */ {}\n\tafter();\n}\n",
        "import * as $ from 'svelte/internal/client';\n\nexport async function f(xs, use) {\n\tfor await (const x of $.for_await_track_reactivity_loss(xs /* b */)) {}\n\n\tafter();\n}",
    ),
    (
        "block_body_first_line",
        "export async function f(xs, use) {\n\tfor await (const x of xs) { // first\n\t\tuse(x);\n\t}\n\tafter();\n}\n",
        "import * as $ from 'svelte/internal/client';\n\nexport async function f(xs, use) {\n\tfor await (const x of $.for_await_track_reactivity_loss(xs // first\n\t)) {\n\t\t// first\n\t\tuse(x);\n\t}\n\n\tafter();\n}",
    ),
    (
        "statement_body_tail",
        "export async function f(xs, use) {\n\tfor await (const x of xs) use(x); // tail\n\tafter();\n}\n",
        "import * as $ from 'svelte/internal/client';\n\nexport async function f(xs, use) {\n\tfor await (const x of $.for_await_track_reactivity_loss(xs // tail\n\t)) use(x);\n\n\tafter();\n}",
    ),
    (
        "nested_blocks",
        "export async function f(xs, use) {\n\tfor await (const x of /* o */ xs) { for await (const y of /* i */ x) { use(y); } }\n\tafter();\n}\n",
        "import * as $ from 'svelte/internal/client';\n\nexport async function f(xs, use) {\n\tfor await (const x of $.for_await_track_reactivity_loss(/* o */ xs /* i */)) {\n\t\tfor await (const y of $.for_await_track_reactivity_loss(/* i */ x)) {\n\t\t\tuse(y);\n\t\t}\n\t}\n\n\tafter();\n}",
    ),
    (
        "trailing_on_next_line",
        "export async function f(xs, use) {\n\tfor await (const x of xs\n\t/* t */) {}\n\tafter();\n}\n",
        "import * as $ from 'svelte/internal/client';\n\nexport async function f(xs, use) {\n\tfor await (const x of $.for_await_track_reactivity_loss(xs)) /* t */ {}\n\n\tafter();\n}",
    ),
];

#[test]
fn iterable_comments_land_inside_the_wrapper() {
    let mut failures = Vec::new();
    for &(name, src, expected) in COMMENT_PLACEMENT {
        let out = compile_svelte_js(src, true, true);
        let body = out.split_once('\n').map_or("", |(_, rest)| rest);
        if body != expected {
            failures.push(format!(
                "{name}:\n--- expected\n{expected}\n--- got\n{body}"
            ));
        }
    }
    assert!(failures.is_empty(), "{}", failures.join("\n\n"));
}

#[test]
fn runes_instance_iterable_comments_land_inside_the_wrapper() {
    assert_contains(
        &compile_component(
            "<script>\n\tlet n = $state(0);\n\tasync function f(xs) {\n\t\tfor await (const x of /* it */ xs) { // first\n\t\t\tn += x;\n\t\t}\n\t}\n</script>\n<button onclick={() => f([])}>{n}</button>\n",
            true,
            true,
        ),
        "\t\tfor await (const x of $.for_await_track_reactivity_loss(/* it */ xs // first\n\t\t)) {",
    );
}

/// The body leaves `n` alone: a legacy body the text pipeline rewrites is
/// reprinted before this pass runs, which moves `// first` off the iterable's
/// line first.
#[test]
fn legacy_instance_iterable_comments_land_inside_the_wrapper() {
    assert_contains(
        &compile_component(
            "<script>\n\texport let n = 0;\n\tasync function f(xs, use) {\n\t\tfor await (const x of /* it */ xs) { // first\n\t\t\tuse(x);\n\t\t}\n\t}\n</script>\n<button onclick={() => f([], console.log)}>{n}</button>\n",
            true,
            true,
        ),
        "\t\tfor await (const x of $.for_await_track_reactivity_loss(/* it */ xs // first\n\t\t)) {",
    );
}

/// Two statement bodies end on the same byte here, so both loops see the same
/// trailing comment; it must neither be spliced twice nor dropped.
#[test]
fn nested_statement_bodies_sharing_an_end_keep_the_comment() {
    let out = compile_svelte_js(
        "export async function f(xs, use) {\n\tfor await (const x of xs) for await (const y of /* i */ x) use(y); // t\n}\n",
        true,
        true,
    );
    assert_eq!(
        out.matches("$.for_await_track_reactivity_loss(").count(),
        2,
        "{out}"
    );
    assert_contains(&out, "// t");
    assert_contains(&out, "/* i */");
}
