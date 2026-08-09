//! `$.async_derived(thunk, label, location)` — the two dev arguments upstream's
//! `3-transform/client/visitors/VariableDeclaration.js` passes and rsvelte used
//! to drop (issue #2540).
//!
//! Dropping them is not a lost label: the runtime gates `await_waterfall` on
//! `location !== undefined`, so the warning could never fire and
//! `svelte-ignore await_waterfall` suppressed something that never ran. Both
//! the presence and the ABSENCE of the location argument are load-bearing —
//! upstream keeps the label and drops only the location when the declaration is
//! ignored, so this file pins all three shapes.
//!
//! Expected strings are the official compiler's, read off
//! `submodules/svelte` at the pinned version.

use rsvelte_core::{CompileOptions, ExperimentalOptions, GenerateMode, compile, compiler::CssMode};

fn client(source: &str, dev: bool) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("src/Foo.svelte".to_string()),
            generate: GenerateMode::Client,
            dev,
            css: CssMode::External,
            experimental: ExperimentalOptions { r#async: true },
            ..Default::default()
        },
    )
    .unwrap_or_else(|e| panic!("compile failed: {e:?}"))
    .js
    .code
}

/// `locate_node` runs the filename through `sanitize_location`, which inserts a
/// zero-width space after every `/`.
const FILE: &str = "src/\u{200b}Foo.svelte";

fn component(declaration: &str) -> String {
    format!(
        "<script>\n\tlet {{ p }} = $props();\n\t{declaration}\n</script>\n\n<p>{{typeof a}}</p>\n"
    )
}

fn assert_contains(output: &str, needle: &str) {
    assert!(
        output.contains(needle),
        "expected output to contain:\n  {needle}\ngot:\n{output}"
    );
}

#[test]
fn identifier_declaration_carries_label_and_location() {
    let output = client(&component("const a = $derived(await p);"), true);
    assert_contains(
        &output,
        &format!(
            "$.async_derived(async () => (await $.track_reactivity_loss($$props.p))(), 'a', '{FILE}:3:11')"
        ),
    );
}

#[test]
fn svelte_ignore_drops_the_location_but_keeps_the_label() {
    let output = client(
        &component("// svelte-ignore await_waterfall\n\tconst a = $derived(await p);"),
        true,
    );
    assert_contains(
        &output,
        "$.async_derived(async () => (await $.track_reactivity_loss($$props.p))(), 'a')",
    );
    assert!(
        !output.contains(FILE),
        "an ignored declaration must carry no location:\n{output}"
    );
}

/// A `svelte-ignore` for a different code must not disarm this one — the
/// failure mode of a check that looks for any ignore comment.
#[test]
fn an_unrelated_svelte_ignore_keeps_the_location() {
    let output = client(
        &component("// svelte-ignore state_referenced_locally\n\tconst a = $derived(await p);"),
        true,
    );
    assert_contains(
        &output,
        &format!("(await $.track_reactivity_loss($$props.p))(), 'a', '{FILE}:4:11')"),
    );
}

#[test]
fn non_dev_carries_neither_argument() {
    let output = client(&component("const a = $derived(await p);"), false);
    assert_contains(&output, "$.async_derived(() => $$props.p)");
    assert!(
        !output.contains(FILE),
        "a production build must carry no location:\n{output}"
    );
}

#[test]
fn destructured_declarations_use_the_pattern_label() {
    let object = client(&component("const { a, b } = $derived(await p);"), true);
    assert_contains(&object, &format!("'[$derived object]', '{FILE}:3:18')"));

    let array = client(&component("const [a, b] = $derived(await p);"), true);
    assert_contains(&array, &format!("'[$derived iterable]', '{FILE}:3:16')"));
}

/// Each declarator gets its own location, so a per-declaration lookup that
/// answers once for the whole statement is visible here.
#[test]
fn each_declarator_in_one_statement_gets_its_own_location() {
    let output = client(
        "<script>\n\tlet { p, q } = $props();\n\tconst a = $derived(await p), b = $derived(await q);\n</script>\n\n<p>{typeof a}{typeof b}</p>\n",
        true,
    );
    assert_contains(&output, &format!("'a', '{FILE}:3:11')"));
    assert_contains(&output, &format!("'b', '{FILE}:3:34')"));
}
