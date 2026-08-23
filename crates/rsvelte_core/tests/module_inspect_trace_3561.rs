//! Regression tests for #3561 — a `.svelte.(js|ts)` module had no dev lowering
//! for `$inspect.trace(…)`, so the rune reached the client output and the
//! module threw `ReferenceError: $inspect is not defined` on import.
//!
//! Upstream splits the work across two phases:
//!
//! - phase 2 (`visitors/CallExpression.js`) stores a `tracing` thunk on the
//!   scope — `() => <arg>` when the rune was given one, else
//!   `() => '<label> (<file>:<line>:<col>)'`;
//! - phase 3 (`client/visitors/BlockStatement.js`) turns the function body into
//!   `{ return $.trace(<tracing>, () => { …rest… }); }`, with `await` and an
//!   `async` thunk when the function is async.
//!
//! Because the label is computed in phase 2, its position is the SOURCE's. The
//! port therefore builds the thunks from the module source as the user wrote
//! it and pairs them by walk order with the sites found in the (already
//! partially rewritten) text the edit pass runs on — the two walks have to
//! agree on the count or nothing is emitted.
//!
//! `get_function_label`'s fallbacks are the interesting half, and each row
//! below is a different one: a declaration's own `id`, a named function
//! expression's `id` (NOT the `const` it is assigned to), the `const` for an
//! anonymous one, the callee text + `(...)` for an IIFE, and `'trace'` for a
//! class method, which upstream's parent list does not cover.
//!
//! Every expectation is the byte-exact output of the official compiler
//! (Svelte v5.56.9).

use rsvelte_core::{GenerateMode, ModuleCompileOptions, compile_module};

fn compile_mod(body: &str, generate: GenerateMode, dev: bool) -> String {
    let src = format!("let base = $state(1);\n{body}\n");
    compile_module(
        &src,
        ModuleCompileOptions {
            filename: Some("m.svelte.js".to_string()),
            generate,
            dev,
            ..Default::default()
        },
    )
    .expect("compile_module")
    .js
    .code
}

/// The defect: in client dev the rune must LOWER, not survive.
#[test]
fn the_rune_never_reaches_the_output() {
    for body in [
        "export function go() {\n\t$inspect.trace();\n\treturn base;\n}",
        "export const go = () => {\n\t$inspect.trace();\n\treturn base;\n};",
        "export class C {\n\tm() {\n\t\t$inspect.trace();\n\t\treturn base;\n\t}\n}",
    ] {
        let code = compile_mod(body, GenerateMode::Client, true);
        assert!(!code.contains("$inspect"), "for {body:?} in:\n{code}");
        assert!(code.contains("$.trace("), "for {body:?} in:\n{code}");
        assert!(
            code.contains("import 'svelte/internal/flags/tracing';"),
            "for {body:?} in:\n{code}"
        );
    }
}

/// One row per `get_function_label` fallback.
#[test]
fn the_label_comes_from_the_immediate_parent() {
    for (body, expected) in [
        (
            "export function go() {\n\t$inspect.trace();\n\treturn base;\n}",
            "return $.trace(() => 'go (m.svelte.js:2:7)', () => {",
        ),
        (
            "function go() {\n\t$inspect.trace();\n\treturn base;\n}\nexport { go };",
            "return $.trace(() => 'go (m.svelte.js:2:0)', () => {",
        ),
        (
            "export const go = () => {\n\t$inspect.trace();\n\treturn base;\n};",
            "return $.trace(() => 'go (m.svelte.js:2:18)', () => {",
        ),
        (
            "export const go = function () {\n\t$inspect.trace();\n\treturn base;\n};",
            "return $.trace(() => 'go (m.svelte.js:2:18)', () => {",
        ),
        // A named function expression answers with its OWN name, not the const's.
        (
            "export const go = function inner() {\n\t$inspect.trace();\n\treturn base;\n};",
            "return $.trace(() => 'inner (m.svelte.js:2:18)', () => {",
        ),
        // A class method is not in upstream's parent list, so it falls back to
        // the rune's own name — and its position is the parameter list's `(`.
        (
            "export class C {\n\tm() {\n\t\t$inspect.trace();\n\t\treturn base;\n\t}\n}",
            "return $.trace(() => 'trace (m.svelte.js:3:2)', () => {",
        ),
        (
            "export class C {\n\tget v() {\n\t\t$inspect.trace();\n\t\treturn base;\n\t}\n}",
            "return $.trace(() => 'trace (m.svelte.js:3:6)', () => {",
        ),
        (
            "export function outer() {\n\tfunction inner() {\n\t\t$inspect.trace();\n\t\treturn base;\n\t}\n\treturn inner();\n}",
            "return $.trace(() => 'inner (m.svelte.js:3:1)', () => {",
        ),
    ] {
        let code = compile_mod(body, GenerateMode::Client, true);
        assert!(code.contains(expected), "for {body:?} in:\n{code}");
    }
}

/// The IIFE row is separate because the label is the callee's SOURCE TEXT, and
/// oxc keeps the `ParenthesizedExpression` that acorn — and so upstream — never
/// sees. Reading the callee without unwrapping it answered `'trace'`.
#[test]
fn an_iife_is_labelled_with_its_own_source_text() {
    let code = compile_mod(
        "export const v = (function () {\n\t$inspect.trace();\n\treturn base;\n})();",
        GenerateMode::Client,
        true,
    );
    assert!(
        code.contains(
            "return $.trace(() => 'function () {\\n\t$inspect.trace();\\n\treturn base;\\n}(...) (m.svelte.js:2:18)', () => {"
        ),
        "in:\n{code}"
    );
}

/// An argument replaces the generated label outright — `b.thunk(arguments[0])`
/// rather than `b.thunk(b.literal(label + ' ' + loc))`.
#[test]
fn an_explicit_argument_replaces_the_label() {
    let code = compile_mod(
        "export function go() {\n\t$inspect.trace('lbl');\n\treturn base;\n}",
        GenerateMode::Client,
        true,
    );
    assert!(
        code.contains("return $.trace(() => 'lbl', () => {"),
        "in:\n{code}"
    );
}

/// An async function awaits the call and hands `$.trace` an async thunk.
#[test]
fn an_async_function_awaits_the_trace() {
    for (body, expected) in [
        (
            "export async function go() {\n\t$inspect.trace();\n\treturn base;\n}",
            "return await $.trace(() => 'go (m.svelte.js:2:7)', async () => {",
        ),
        (
            "export const go = async () => {\n\t$inspect.trace();\n\treturn base;\n};",
            "return await $.trace(() => 'go (m.svelte.js:2:18)', async () => {",
        ),
    ] {
        let code = compile_mod(body, GenerateMode::Client, true);
        assert!(code.contains(expected), "for {body:?} in:\n{code}");
    }
}

/// The generated `await` is not the user's, and the dev await instrumentation
/// runs to a fixed point over the same text — so it saw `await $.trace(…)` on
/// its second iteration and wrapped it in `$.track_reactivity_loss`. The
/// source's own `await` still must be wrapped, which is the other half.
#[test]
fn the_generated_await_is_not_instrumented() {
    let code = compile_mod(
        "export async function go() {\n\t$inspect.trace();\n\tconst v = await Promise.resolve(base);\n\treturn v;\n}",
        GenerateMode::Client,
        true,
    );
    assert!(
        code.contains("return await $.trace(() => 'go (m.svelte.js:2:7)', async () => {"),
        "in:\n{code}"
    );
    assert!(
        code.contains("const v = (await $.track_reactivity_loss(Promise.resolve(base)))();"),
        "in:\n{code}"
    );
    assert!(
        !code.contains("$.track_reactivity_loss($.trace"),
        "in:\n{code}"
    );
}

/// The three cells that must NOT lower — upstream emits `$.trace` only for
/// client + dev, and removes the rune everywhere else. Without these the fix
/// reads as "lower it wherever you find it".
#[test]
fn only_client_dev_lowers() {
    let body = "export function go() {\n\t$inspect.trace();\n\treturn base;\n}";
    for (generate, dev) in [
        (GenerateMode::Client, false),
        (GenerateMode::Server, true),
        (GenerateMode::Server, false),
    ] {
        let code = compile_mod(body, generate, dev);
        assert!(
            !code.contains("$.trace("),
            "({generate:?} dev={dev}):\n{code}"
        );
        assert!(
            !code.contains("$inspect"),
            "({generate:?} dev={dev}):\n{code}"
        );
    }
}

/// The placement rule is upstream's, and it is a compile ERROR rather than a
/// silent pass-through: the call must lead a function body.
#[test]
fn the_call_must_be_the_first_statement_of_a_function_body() {
    let src = "let base = $state(1);\nexport function go() {\n\tconst q = 1;\n\t$inspect.trace();\n\treturn base + q;\n}\n";
    let err = compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("m.svelte.js".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .expect_err("expected inspect_trace_invalid_placement");
    assert!(
        format!("{err:?}").contains("inspect_trace_invalid_placement"),
        "{err:?}"
    );
}
