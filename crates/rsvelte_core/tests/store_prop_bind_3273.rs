//! Regression test for #3273 — a store arriving as a **prop** and written
//! through `bind:`.
//!
//! `$.store_set` calls `.set` on what it is given, and a legacy prop is read
//! through a getter, so `$.store_set(x, …)` handed the getter function to a
//! store setter and threw `TypeError: store.set is not a function` on the first
//! input change. Upstream's `get_store()` is
//! `context.visit(b.id(name.slice(1)))`, so the store source is read like any
//! other reference to its binding: `x()` for a prop, the bare name for a local.
//!
//! Every expectation below is the official compiler's output for the same
//! source (`submodules/svelte`, client target, no dev).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

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
fn element_bind_to_prop_store_unwraps_the_getter() {
    let out = client("<script>export let x;</script>\n<input bind:value={$x} />");
    assert!(
        out.contains("$.bind_value(input, $x, ($$value) => $.store_set(x(), $$value))"),
        "prop store must be read through its getter:\n{out}"
    );
}

#[test]
fn element_bind_to_local_store_keeps_the_bare_name() {
    // The control: a local store is not read through a getter, so the bare name
    // is correct and must not gain a call.
    let out = client(
        "<script>import { writable } from 'svelte/store';\nconst y = writable(1);</script>\n<input bind:value={$y} />",
    );
    assert!(
        out.contains("$.bind_value(input, $y, ($$value) => $.store_set(y, $$value))"),
        "local store must keep the bare name:\n{out}"
    );
}

#[test]
fn group_and_size_binds_to_prop_store_unwrap_the_getter() {
    let out = client(
        "<script>export let x;</script>\n<input bind:group={$x} />\n<div bind:clientWidth={$x}></div>",
    );
    assert!(
        out.contains(
            "$.bind_group(binding_group, [], input, $x, ($$value) => $.store_set(x(), $$value))"
        ),
        "bind:group must read the prop store through its getter:\n{out}"
    );
    assert!(
        out.contains(
            "$.bind_element_size(div, 'clientWidth', ($$value) => $.store_set(x(), $$value))"
        ),
        "bind:clientWidth must read the prop store through its getter:\n{out}"
    );
}

#[test]
fn component_bind_to_prop_store_unwraps_the_getter() {
    let out = client(
        "<script>import Child from './Child.svelte';\nexport let x;</script>\n<Child bind:v={$x} />",
    );
    assert!(
        out.contains("$.store_set(x(), $$value)"),
        "component bind: must read the prop store through its getter:\n{out}"
    );
}

#[test]
fn template_member_mutation_of_a_prop_store_unwraps_the_getter() {
    // Same defect one builder over: `$.store_mutate` also `.set`s its first
    // argument, and the template path never applied the prop read transform.
    let out =
        client("<script>export let x;</script>\n<button onclick={() => { $x.k = 1; }}>go</button>");
    assert!(
        out.contains("$.store_mutate(x(), $.untrack($x).k = 1, $.untrack($x))"),
        "template member mutation must read the prop store through its getter:\n{out}"
    );
}
