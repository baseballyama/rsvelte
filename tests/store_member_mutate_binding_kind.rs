//! Regression tests for legacy store member mutations across binding kinds
//! (correctness review C-014).
//!
//! Bug: `$store.x = …` rewrote the subscription identifier but always passed
//! the bare store name as the first `$.store_mutate(...)` argument. For a store
//! sourced from a **prop**, the official compiler reads the source via the prop
//! getter (`store()`), so the bare name passed a stale / wrong reference.
//!
//! Fix: the store source is now read like any other reference to its binding —
//! `store()` for a prop, the bare name for plain / `$state` / reactive-import
//! stores — matching `get_store()` in the official compiler.

use svelte_compiler_rust::{CompileOptions, GenerateMode, compile};

fn client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[test]
fn plain_store_member_mutate_uses_bare_name() {
    let src = "<script>\nimport { writable } from 'svelte/store';\nconst obj = writable({ a: 1 });\nfunction f() { $obj.a = 2; }\n</script>";
    let out = client(src);
    assert!(
        out.contains("$.store_mutate(obj, $.untrack($obj).a = 2, $.untrack($obj))"),
        "plain store should mutate via the bare name:\n{out}"
    );
}

#[test]
fn prop_store_member_mutate_uses_getter() {
    // The store source is a prop, so its current value is read via the getter
    // `obj()` — matching the official compiler's `$.store_mutate(obj(), …)`.
    let src = "<script>\nexport let obj;\nfunction f() { $obj.a = 2; }\n</script>";
    let out = client(src);
    assert!(
        out.contains("$.store_mutate(obj(), $.untrack($obj).a = 2, $.untrack($obj))"),
        "prop store should mutate via the getter `obj()`:\n{out}"
    );
    assert!(
        !out.contains("$.store_mutate(obj, "),
        "prop store must not pass the bare name:\n{out}"
    );
}

#[test]
fn state_store_member_mutate_uses_bare_name() {
    let src = "<script>\nimport { writable } from 'svelte/store';\nlet obj = $state(writable({ a: 1 }));\nfunction f() { $obj.a = 2; }\n</script>";
    let out = client(src);
    assert!(
        out.contains("$.store_mutate(obj, $.untrack($obj).a = 2, $.untrack($obj))"),
        "state-held store should mutate via the bare name:\n{out}"
    );
}
