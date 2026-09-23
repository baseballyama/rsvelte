//! An each block's fallback is walked before its body, so a store first read
//! in the fallback gets its getter declared first.
//!
//! sveltejs/svelte#18803 moved `visit(node.fallback)` ahead of the body in
//! `scope.js`'s `EachBlock`. `scope_builder.rs` follows it; the store-reference
//! collector in `store_subscriptions.rs` is a second port of the same walk and
//! did not, which reversed two `const $store = …` lines against the oracle.
//! Expectations below are the 5.57.1 oracle's output for these two inputs.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            runes: None,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

fn getter_order(out: &str) -> Vec<String> {
    out.lines()
        .filter(|line| line.trim_start().starts_with("const $") && line.contains("store_get"))
        .map(|line| line.trim().to_string())
        .collect()
}

#[test]
fn a_store_read_only_in_the_fallback_is_declared_first() {
    let out = client(
        "<script>import { a, b } from './stores.js'; export let options = [];</script>\n\
         {#each options as option}<span>{$a} {option}</span>{:else}<span>{$b}</span>{/each}",
    );
    assert_eq!(
        getter_order(&out),
        vec![
            "const $b = () => $.store_get(b, '$b', $$stores);".to_string(),
            "const $a = () => $.store_get(a, '$a', $$stores);".to_string(),
        ],
        "got:\n{out}"
    );
}

#[test]
fn without_a_fallback_the_body_order_is_unchanged() {
    let out = client(
        "<script>import { a, b } from './stores.js'; export let options = [];</script>\n\
         {#each options as option}<span>{$a} {$b}</span>{/each}",
    );
    assert_eq!(
        getter_order(&out),
        vec![
            "const $a = () => $.store_get(a, '$a', $$stores);".to_string(),
            "const $b = () => $.store_get(b, '$b', $$stores);".to_string(),
        ],
        "got:\n{out}"
    );
}
