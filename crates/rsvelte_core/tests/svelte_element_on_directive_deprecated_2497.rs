//! Regression test: in runes mode, `event_directive_deprecated` must fire for an
//! `on:` directive on **both** `<button on:click>` and `<svelte:element on:click>`.
//!
//! Upstream `2-analyze/visitors/OnDirective.js` warns when the parent is either
//! `RegularElement` or `SvelteElement` (components are the only exclusion). rsvelte
//! raised the warning from the parent element visitor, and only `regular_element.rs`
//! did so — `<svelte:element this={tag} on:click={…}>` produced no warning at all.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn warning_codes(src: &str, runes: Option<bool>) -> Vec<String> {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            runes,
            ..Default::default()
        },
    )
    .expect("compile")
    .warnings
    .iter()
    .map(|w| w.code.clone())
    .collect()
}

fn count(codes: &[String]) -> usize {
    codes
        .iter()
        .filter(|c| *c == "event_directive_deprecated")
        .count()
}

const RUNES_SCRIPT: &str = "<script>let count = $state(0); let tag = $state('button');</script>";

#[test]
fn regular_element_warns() {
    let src = format!("{RUNES_SCRIPT}<button on:click={{() => count++}}>{{count}}</button>");
    let codes = warning_codes(&src, Some(true));
    assert_eq!(count(&codes), 1, "got: {codes:?}");
}

#[test]
fn svelte_element_warns() {
    let src = format!(
        "{RUNES_SCRIPT}<svelte:element this={{tag}} on:click={{() => count++}}>{{count}}</svelte:element>"
    );
    let codes = warning_codes(&src, Some(true));
    assert_eq!(count(&codes), 1, "got: {codes:?}");
}

#[test]
fn both_parents_warn_once_each() {
    let src = format!(
        "{RUNES_SCRIPT}<button on:click={{() => count++}}>a</button><svelte:element this={{tag}} on:click={{() => count++}}>b</svelte:element>"
    );
    let codes = warning_codes(&src, Some(true));
    assert_eq!(count(&codes), 2, "got: {codes:?}");
}

#[test]
fn component_does_not_warn() {
    let src = "<script>import Button from './Button.svelte'; let count = $state(0);</script><Button on:click={() => count++}>a</Button>";
    let codes = warning_codes(src, Some(true));
    assert_eq!(count(&codes), 0, "got: {codes:?}");
}

#[test]
fn legacy_mode_does_not_warn() {
    let src = "<script>let tag = 'button';</script><svelte:element this={tag} on:click={() => {}}>b</svelte:element>";
    let codes = warning_codes(src, Some(false));
    assert_eq!(count(&codes), 0, "got: {codes:?}");
}
