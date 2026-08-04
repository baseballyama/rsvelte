//! Regression test for #2171 (gap 3): `<svelte:self>` used to emit its
//! `on:` directives via a bespoke inline loop that appended a trailing
//! space after each `$on(...)` call (`');  '` instead of `');'`), diverging
//! from official svelte2tsx's `InlineComponent.addEvent`, which joins calls
//! with no separator. `handle_component` already reused the shared
//! `build_on_calls` helper for this; `handle_svelte_self` now does too.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn convert(src: &str) -> String {
    let opts = Svelte2TsxOptions {
        filename: "Input.svelte".to_string(),
        is_ts_file: false,
        ..Default::default()
    };
    svelte2tsx(src, opts).expect("svelte2tsx ok").code
}

#[test]
fn svelte_self_on_call_has_no_trailing_space() {
    let code = convert("<script>\n let handler;\n</script>\n<svelte:self on:click={handler} />\n");
    assert!(
        code.contains(r#"$$_svelteself0.$on("click", handler);}"#),
        "expected no trailing space before the closing brace, got:\n{code}"
    );
    assert!(
        !code.contains(r#"handler); }"#),
        "found a trailing-space `$on` call, got:\n{code}"
    );
}

#[test]
fn svelte_self_forwarded_event_has_no_trailing_space() {
    let code = convert("<svelte:self on:click />\n");
    assert!(
        code.contains(r#"$$_svelteself0.$on("click", () => {});}"#),
        "expected no trailing space before the closing brace, got:\n{code}"
    );
}

#[test]
fn svelte_self_multiple_events_join_without_extra_spaces() {
    let code = convert(
        "<script>\n let a; let b;\n</script>\n<svelte:self on:click={a} on:keydown={b} />\n",
    );
    assert!(
        code.contains(r#"$$_svelteself0.$on("click", a);$$_svelteself0.$on("keydown", b);}"#),
        "expected consecutive $on calls joined with no extra space, got:\n{code}"
    );
}
