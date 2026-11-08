//! Statement order inside a server fragment's upstream `state.init`. Every
//! expected order below was read off the official compiler (5.57.3) output for
//! the same source; only the listed lines are compared, so an unrelated residue
//! (a missing `async_block` wrapper) does not mask the order.

use rsvelte_core::{CompileOptions, ExperimentalOptions, GenerateMode, compile};

const SCRIPT: &str = "<script>\n\timport Child from './Child.svelte';\n\tlet open = $state(null);\n\tlet tag = $state('div');\n\tlet p = $state(Promise.resolve(1));\n</script>\n\n";

fn server(markup: &str, dev: bool, r#async: bool) -> String {
    let source = format!("{SCRIPT}{markup}\n");
    compile(
        &source,
        CompileOptions {
            generate: GenerateMode::Server,
            dev,
            experimental: ExperimentalOptions { r#async },
            ..Default::default()
        },
    )
    .unwrap_or_else(|error| panic!("compile failed: {error:?}"))
    .js
    .code
}

#[track_caller]
fn assert_order(code: &str, lines: &[&str]) {
    let mut at = 0;
    for line in lines {
        let Some(found) = code[at..].find(line) else {
            panic!("`{line}` missing or out of order (expected order {lines:#?}):\n{code}");
        };
        at += found + line.len();
    }
}

#[test]
fn title_precedes_a_bind_pushed_by_a_later_sibling() {
    let code = server(
        "<svelte:head><title>{open}</title><Child bind:value={() => open, (v) => (open = v)} /></svelte:head>",
        false,
        false,
    );
    assert_order(
        &code,
        &[
            "$$renderer.title(",
            "var bind_get = () => open;",
            "Child($$renderer",
        ],
    );
}

#[test]
fn title_keeps_source_order_among_hoisted_nodes() {
    let code = server(
        "<svelte:head>{#if open}<title>{open}</title>{@const t = open}<Child bind:value={() => t, (v) => (open = v)} />{/if}</svelte:head>",
        false,
        false,
    );
    assert_order(
        &code,
        &[
            "$$renderer.title(",
            "const t = open;",
            "var bind_get = () => t;",
        ],
    );
}

#[test]
fn snippet_in_a_transparent_element_follows_an_earlier_bind() {
    let code = server(
        "<Child bind:value={() => open, (v) => (open = v)} /><div>{#snippet s()}<p>{open}</p>{/snippet}{@render s()}</div>",
        true,
        false,
    );
    assert_order(
        &code,
        &[
            "var bind_get = () => open;",
            "$.prevent_snippet_stringification(s);",
            "Child($$renderer",
        ],
    );
}

#[test]
fn snippet_in_bound_content_goes_to_the_element_init() {
    let code = server(
        "<Child bind:value={() => open, (v) => (open = v)} /><div contenteditable bind:innerHTML={open}>{#snippet s()}<p>{open}</p>{/snippet}{@render s()}</div>",
        false,
        false,
    );
    // The snippet is not declared inside the `else` body.
    assert_order(
        &code,
        &[
            "function s(",
            "var bind_get",
            "} else {\n\t\t\ts($$renderer);",
        ],
    );
}

#[test]
fn element_async_const_lets_precede_its_binds() {
    let code = server(
        "<div>{const x = await p}<Child bind:value={() => x, (v) => (open = v)} /></div>",
        false,
        true,
    );
    assert_order(
        &code,
        &[
            "let x;",
            "var bind_get = () => x;",
            "var bind_set",
            "var promises = $$renderer.run(",
        ],
    );
}

#[test]
fn async_const_let_follows_an_earlier_snippet() {
    let code = server(
        "{#if open}{#snippet s()}<i>{open}</i>{/snippet}{@const a = await p}<Child bind:value={() => a, (v) => (open = v)} />{@render s()}{/if}",
        true,
        true,
    );
    assert_order(
        &code,
        &[
            "$.prevent_snippet_stringification(s);",
            "function s(",
            "let a;",
            "var bind_get = () => a;",
            "var promises = $$renderer.run(",
        ],
    );
}

#[test]
fn async_attribute_element_with_declarations_keeps_its_own_block() {
    let code = server(
        "<div title={await p}>{const x = await p}<Child bind:value={() => x, (v) => (open = v)} /></div>",
        false,
        true,
    );
    assert_order(
        &code,
        &[
            "$$renderer.child(async ($$renderer) => {",
            "const $$0 = (await $.save(p))();",
            "{\n\t\t\t\tlet x;",
            "var bind_get = () => x;",
            "var promises = $$renderer.run(",
            "$$renderer.push(`<div",
        ],
    );
}
