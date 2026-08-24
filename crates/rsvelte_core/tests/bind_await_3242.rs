//! `await` in a `bind:` expression must be rejected the way upstream rejects it
//! (issue #3242).
//!
//! Upstream's `BindDirective` visitor installs `state.expression` for the bind
//! expression — and, for a `{get, set}` pair, for the get/set function *bodies*,
//! deliberately jumping across the function that would otherwise reset it
//! (`BindDirective.js` L157-170). rsvelte installed nothing, so every `await`
//! reachable from a bind expression compiled.
//!
//! The host axis is part of the test: the check lives below upstream's
//! `parent.type` block, so every host must reach it.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

const SCRIPT: &str = "<script>\n\timport C from './C.svelte';\n\tlet v = $state('a');\n\tlet o = $state({ k: 1 });\n\tlet tag = $state('div');\n\tlet n = $state(0);\n\tconst p = Promise.resolve(1);\n</script>\n";

fn compile_err(markup: &str) -> Option<String> {
    let src = format!("{SCRIPT}{markup}");
    compile(
        &src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .err()
    .map(|e| format!("{e:?}"))
}

/// Upstream reports `experimental_async` (the await gate fires at the await node
/// before `BindDirective` gets to its own `illegal_await_expression` check).
#[test]
fn await_in_a_get_set_pair_is_rejected_on_every_host() {
    for markup in [
        "<input bind:value={() => v, async (nv) => { await p; }} />",
        "<input bind:value={async () => await p, (nv) => (v = nv)} />",
        "<select bind:value={() => v, async (nv) => { await p; }}><option value=\"a\">a</option></select>",
        "<textarea bind:value={() => v, async (nv) => { await p; }}></textarea>",
        "<C bind:value={() => v, async (nv) => { await p; }} />",
        "<svelte:component this={C} bind:value={() => v, async (nv) => { await p; }} />",
        "{#if n}<svelte:self bind:value={() => v, async (nv) => { await p; }} />{/if}",
        "<svelte:element this={tag} bind:this={() => v, async (nv) => { await p; }}>x</svelte:element>",
    ] {
        let err = compile_err(markup).unwrap_or_else(|| panic!("{markup} must not compile"));
        assert!(
            err.contains("experimental_async"),
            "expected experimental_async for {markup}, got: {err}"
        );
    }
}

/// The plain (non-pair) form takes the same gate.
#[test]
fn await_in_a_plain_bind_expression_is_rejected() {
    for markup in [
        "<input bind:value={o[await p]} />",
        "<C bind:value={o[await p]} />",
        "<svelte:element this={tag} bind:this={o[await p]}>x</svelte:element>",
    ] {
        let err = compile_err(markup).unwrap_or_else(|| panic!("{markup} must not compile"));
        assert!(
            err.contains("experimental_async"),
            "expected experimental_async for {markup}, got: {err}"
        );
    }
}

/// The control that separates "an await below the bind" from "an await below a
/// function below the bind": upstream resets `state.expression` on function
/// entry, so only the get/set function's own body suspends. Rejecting these
/// would be an over-rejection.
#[test]
fn await_inside_a_nested_function_still_compiles() {
    for markup in [
        "<input bind:value={() => v, (nv) => { const f = async () => { await p; }; f(); }} />",
        "<C bind:value={() => v, (nv) => { const f = async () => { await p; }; f(); }} />",
        "<input bind:value={() => v, (nv) => (v = nv)} />",
        "<button onclick={async () => { await p; }}>x</button>",
    ] {
        assert!(
            compile_err(markup).is_none(),
            "{markup} should compile, got: {:?}",
            compile_err(markup)
        );
    }
}
