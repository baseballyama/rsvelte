//! Regression tests for issue #969.
//!
//! When an `import` statement shared a single physical line with subsequent
//! statements (e.g. `import { writable } from 'svelte/store'; const s = ...;`),
//! the line-based import extractor in both the server and client transforms
//! swallowed the whole line as one "import" string. As a result every
//! statement after the import was emitted verbatim and never lowered — so a
//! store auto-subscription write (`$s = true`) was left as an invalid
//! assignment instead of becoming `$.store_set(s, true)`.
//!
//! The fix splits the leading import statement off the line and routes the
//! remainder through the normal script-transform pipeline, matching the
//! official compiler (which re-prints every statement on its own line).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn server(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Server,
            ..Default::default()
        },
    )
    .expect("compile server")
    .js
    .code
}

fn client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile client")
    .js
    .code
}

// Single physical line: import + store declaration + store write + read.
const SINGLE_LINE_STORE: &str = "<script>import {writable} from 'svelte/store'; const s = writable(false); function g(){ $s = true; }</script><p>{$s}</p>";

#[test]
fn server_single_line_import_lowers_store_write() {
    let out = server(SINGLE_LINE_STORE);
    // The store write must become a `$.store_set` call, never an assignment
    // to a `$.store_get(...)` member (which is an invalid assignment target).
    assert!(
        out.contains("$.store_set(s, true)"),
        "expected `$.store_set(s, true)` in server output, got:\n{out}"
    );
    assert!(
        !out.contains("$.store_get($$store_subs ??= {}, '$s', s) ="),
        "store write must not compile to an assignment to `$.store_get(...)`:\n{out}"
    );
    // The trailing statements must not be swallowed into the import string.
    assert!(
        out.contains("const s = writable(false)"),
        "expected the `const s` declaration to survive, got:\n{out}"
    );
}

#[test]
fn client_single_line_import_lowers_store_write() {
    let out = client(SINGLE_LINE_STORE);
    assert!(
        out.contains("$.store_set(s, true)"),
        "expected `$.store_set(s, true)` in client output, got:\n{out}"
    );
    assert!(
        out.contains("const s = writable(false)"),
        "expected the `const s` declaration to survive, got:\n{out}"
    );
    // The import must not carry trailing code along with it.
    assert!(
        !out.contains("import { writable } from 'svelte/store'; const s"),
        "trailing statements must be split off the import line:\n{out}"
    );
}

// $derived override on the server: `x = 99` must become a setter call `x(99)`,
// never an assignment to a call expression (`x() = 99`).
#[test]
fn server_derived_override_is_setter_call() {
    let src = "<script>let a = $state(1); let x = $derived(a); function f() { x = 99; }</script>";
    let out = server(src);
    assert!(
        out.contains("x(99)"),
        "expected derived override to compile to `x(99)`, got:\n{out}"
    );
    assert!(
        !out.contains("x() = 99"),
        "derived override must not compile to `x() = 99`:\n{out}"
    );
}

// Two imports packed onto one physical line — both must be hoisted, not have
// the second swallowed into `rest` (regression from the print/formatting corpus).
const TWO_IMPORTS_ONE_LINE: &str = "<script>import { setLocale } from '$lib/x';import { m } from '$lib/y';</script><h1>{m.hi()}</h1>";

#[test]
fn server_two_imports_one_line_both_hoisted() {
    let out = server(TWO_IMPORTS_ONE_LINE);
    assert!(
        out.contains("import { setLocale } from '$lib/x'"),
        "first import missing:\n{out}"
    );
    assert!(
        out.contains("import { m } from '$lib/y'"),
        "second import missing/not hoisted:\n{out}"
    );
}

#[test]
fn client_two_imports_one_line_both_hoisted() {
    let out = client(TWO_IMPORTS_ONE_LINE);
    assert!(
        out.contains("import { setLocale } from '$lib/x'"),
        "first import missing:\n{out}"
    );
    assert!(
        out.contains("import { m } from '$lib/y'"),
        "second import missing/not hoisted:\n{out}"
    );
}
