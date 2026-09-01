//! A `{:catch X}` binding's read transform deliberately leaks out of its block.
//!
//! This reproduces an upstream defect. `AwaitBlock.js` gives `then_context` a COPY of
//! `state.transform` and gives `catch_context` the parent's own object, so
//! `create_derived_block_argument`'s write survives the block and every later read of
//! that name is rewritten. The emitted `$.get(code)` sits outside the callback that
//! binds `code`, so the compiled component throws `ReferenceError: code is not defined`
//! when it renders — measured by mounting official's own output under jsdom. We match it
//! because byte equality with the official compiler is the goal; when upstream scopes
//! `catch_context` this test goes red, and that is when to follow.
//!
//! The `then` rows are the control: they must stay scoped, or "we conform" would be
//! indistinguishable from "we lost the scoping everywhere".
//!
//! Report: `upstream_issues/4111-svelte-await-catch-binding-transform-leaks-out-of-the-block.md`

use rsvelte_core::{CompileOptions, CssMode, GenerateMode, compile};

fn client(body: &str) -> String {
    let src = format!(
        "<script>\n\tlet {{ code }} = $props();\n\tconst p = Promise.resolve(1);\n</script>\n\n{body}\n"
    );
    compile(
        &src,
        CompileOptions {
            filename: Some("C.svelte".into()),
            generate: GenerateMode::Client,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

/// The read that follows the block — official emits `$.get(code)` for the catch arm.
fn trailing_read(code: &str) -> String {
    let line = code
        .lines()
        .find(|l| l.contains("set_text(text_1,"))
        .unwrap_or_else(|| panic!("no trailing read in:\n{code}"));
    line.trim().to_string()
}

#[test]
fn a_catch_binding_leaks_its_transform_past_the_block() {
    let out = client("{#await p catch code}{code}{/await}\n{code}");
    let read = trailing_read(&out);
    assert!(
        read.contains("$.get(code)"),
        "the catch binding's transform must still leak (upstream does); got: {read}"
    );
}

#[test]
fn a_destructured_catch_binding_leaks_too() {
    let out = client("{#await p catch { code }}{code}{/await}\n{code}");
    let read = trailing_read(&out);
    assert!(
        read.contains("$.get(code)"),
        "both arms of create_derived_block_argument write the same object; got: {read}"
    );
}

#[test]
fn a_then_binding_stays_scoped() {
    let out = client("{#await p then code}{code}{/await}\n{code}");
    let read = trailing_read(&out);
    assert!(
        read.contains("$$props.code") && !read.contains("$.get(code)"),
        "then copies the transform, so the trailing read is the prop; got: {read}"
    );
}

#[test]
fn a_destructured_then_binding_stays_scoped() {
    let out = client("{#await p then { code }}{code}{/await}\n{code}");
    let read = trailing_read(&out);
    assert!(
        read.contains("$$props.code") && !read.contains("$.get(code)"),
        "then copies the transform for the destructured form too; got: {read}"
    );
}

#[test]
fn a_non_colliding_catch_binding_leaves_the_prop_alone() {
    let out = client("{#await p catch err}{err}{/await}\n{code}");
    let read = trailing_read(&out);
    assert!(
        read.contains("$$props.code"),
        "the leak is keyed on the name; an unrelated one must not touch the prop; got: {read}"
    );
}
