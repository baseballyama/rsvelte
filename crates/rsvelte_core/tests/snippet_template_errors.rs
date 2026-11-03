//! `let_directive_snippet_conflict`, and a snippet parameter redeclared by the
//! snippet's own body.
//!
//! Every expectation is the official compiler's verdict for the same source,
//! prefixed with `PRELUDE`.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

const PRELUDE: &str = "<script>import Child from './C.svelte';</script>\n";

fn compile_error(markup: &str) -> Option<String> {
    let source = format!("{PRELUDE}{markup}");
    compile(
        &source,
        CompileOptions {
            filename: Some("Main.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .err()
    .map(|error| format!("{error:?}"))
}

#[track_caller]
fn assert_error(markup: &str, code: &str, start: u32, end: u32, message: &str) {
    let Some(text) = compile_error(markup) else {
        panic!("official rejects `{markup}` with {code}; rsvelte compiled it");
    };
    assert!(
        text.contains(&format!("\"{code}\"")),
        "code for `{markup}`:\n{text}"
    );
    assert!(
        text.contains(&format!("start: Some({start})"))
            || text.contains(&format!("({start}, {end})")),
        "start {start} for `{markup}`:\n{text}"
    );
    assert!(
        text.contains(&format!("end: Some({end})")) || text.contains(&format!("({start}, {end})")),
        "end {end} for `{markup}`:\n{text}"
    );
    assert!(text.contains(message), "message for `{markup}`:\n{text}");
}

#[track_caller]
fn assert_accepted(markup: &str) {
    if let Some(text) = compile_error(markup) {
        panic!("official accepts `{markup}`; rsvelte raised\n{text}");
    }
}

#[test]
fn let_directive_on_a_component_with_a_children_snippet() {
    assert_error(
        "<Child let:value>{#snippet children()}{value}{/snippet}</Child>",
        "let_directive_snippet_conflict",
        56,
        65,
        "Use snippet parameters instead (e.g. `{#snippet children({ value })}`)",
    );
    assert_error(
        "<Child let:value={{ a }}>{#snippet children()}{a}{/snippet}</Child>",
        "let_directive_snippet_conflict",
        56,
        73,
        "(e.g. `{#snippet children({ value: { a } })}`)",
    );
    assert_error(
        "<Child let:value={v}>{#snippet children()}{v}{/snippet}</Child>",
        "let_directive_snippet_conflict",
        56,
        69,
        "(e.g. `{#snippet children({ value: v })}`)",
    );
}

#[test]
fn an_empty_slot_name_does_not_exempt_the_directive() {
    assert_error(
        "<Child slot=\"\" let:value>{#snippet children()}{value}{/snippet}</Child>",
        "let_directive_snippet_conflict",
        64,
        73,
        "(e.g. `{#snippet children({ value })}`)",
    );
}

#[test]
fn svelte_component_is_checked_too() {
    assert_error(
        "<svelte:component this={Child} let:value>{#snippet children()}{value}{/snippet}</svelte:component>",
        "let_directive_snippet_conflict",
        80,
        89,
        "(e.g. `{#snippet children({ value })}`)",
    );
}

#[test]
fn only_a_direct_children_snippet_conflicts() {
    assert_accepted(
        "<Child let:value>{#if true}{#snippet children()}{value}{/snippet}{/if}</Child>",
    );
    assert_accepted("<Child let:value>{value}{#snippet foo()}x{/snippet}</Child>");
}

#[test]
fn a_snippet_body_cannot_redeclare_a_parameter() {
    let message = "has already been declared";
    assert_error(
        "{#snippet row(item)}{const item = 1}{item}{/snippet}",
        "declaration_duplicate",
        76,
        80,
        message,
    );
    assert_error(
        "{#snippet row(item)}{@const item = 1}{item}{/snippet}",
        "declaration_duplicate",
        77,
        81,
        message,
    );
    assert_error(
        "{#snippet row({ a })}{@const a = 1}{a}{/snippet}",
        "declaration_duplicate",
        78,
        79,
        message,
    );
    assert_error(
        "{#snippet row(x)}{#snippet x()}y{/snippet}{/snippet}",
        "declaration_duplicate",
        76,
        77,
        message,
    );
}

#[test]
fn a_nested_block_may_shadow_a_snippet_parameter() {
    assert_accepted("{#snippet row(item)}{#if item}{@const item = 1}{item}{/if}{/snippet}");
}
