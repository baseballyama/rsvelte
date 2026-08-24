//! Regression test for #3192 — a binding named `$$props`.
//!
//! Upstream's `Identifier.js` (client and server alike) opens with
//! `if (node.name === '$$props') return b.id('$$sanitized_props')`, and
//! `is_reference` is true in binding positions too — so a *declaration* named
//! `$$props` is renamed just like a read. rsvelte emitted the name verbatim,
//! which is a different variable at runtime (the component's own props object).
//!
//! Reachable only since #3189 stopped rejecting `$$`-prefixed bindings.
//! Every expectation below is the official compiler's output for the same
//! source (`submodules/svelte`).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn code(src: &str, generate: GenerateMode) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

const SCRIPT_BINDING: &str = "<svelte:options runes />\n<script>function f($$props) { return $$props; }</script>\n<b>{f(1)}</b>";

#[test]
fn script_parameter_and_its_read_are_renamed_on_the_client() {
    let out = code(SCRIPT_BINDING, GenerateMode::Client);
    assert!(
        out.contains("function f($$sanitized_props)") && out.contains("return $$sanitized_props;"),
        "the parameter and its read must both be renamed:\n{out}"
    );
}

#[test]
fn script_parameter_and_its_read_are_renamed_on_the_server() {
    let out = code(SCRIPT_BINDING, GenerateMode::Server);
    assert!(
        out.contains("function f($$sanitized_props)") && out.contains("return $$sanitized_props;"),
        "the parameter and its read must both be renamed:\n{out}"
    );
}

#[test]
fn each_item_read_is_renamed() {
    // Upstream renames the READ but not the compiler-built each declaration,
    // which it never visits — so `$$props` survives in the callback signature.
    let src = "<svelte:options runes />\n{#each [1] as $$props}{$$props}{/each}";
    let out = code(src, GenerateMode::Client);
    assert!(
        out.contains("$.set_text(text, $$sanitized_props)"),
        "an each item named `$$props` must be read as `$$sanitized_props`:\n{out}"
    );
}

#[test]
fn snippet_parameter_read_is_renamed_and_not_read_wrapped() {
    // Wrong twice over before the fix: the binding was treated as an ordinary
    // snippet parameter and read-wrapped into `$$props()`.
    let src = "<svelte:options runes />\n{#snippet s($$props)}{$$props}{/snippet}\n{@render s(2)}";
    let out = code(src, GenerateMode::Client);
    assert!(
        out.contains("$.set_text(text, $$sanitized_props)"),
        "a snippet parameter named `$$props` must be read as `$$sanitized_props`:\n{out}"
    );
    assert!(
        !out.contains("$$props()"),
        "the rename short-circuits before the snippet read wrap:\n{out}"
    );
}

#[test]
fn an_unrelated_dollar_dollar_name_is_untouched() {
    // The control: the rename is keyed on the exact name.
    let src = "<svelte:options runes />\n<script>function f($$restProps) { return $$restProps; }</script>\n<b>{f(1)}</b>";
    let out = code(src, GenerateMode::Client);
    assert!(
        out.contains("function f($$restProps)") && out.contains("return $$restProps;"),
        "`$$restProps` must not be renamed:\n{out}"
    );
}
