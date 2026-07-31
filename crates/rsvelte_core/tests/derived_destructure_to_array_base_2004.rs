//! Regression test for `let [a, b] = $derived(props)` where `props` is a
//! `$props()` rest binding (baseballyama/rsvelte#2004).
//!
//! `process_derived_array_pattern` built the `$.to_array(...)` helper from
//! `member_base` — the base used for *member reads* (`$$props.x`) — so it emitted
//! `$.to_array($$props, 2)`. `props` is `$.rest_props($$props, rest_excludes)`, so
//! the two are not interchangeable: `$$props` still carries the excluded keys.
//!
//! Expected outputs below were taken from the official Svelte compiler.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_client(src: &str) -> String {
    let result = compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile");
    result.js.code
}

#[test]
fn array_pattern_over_rest_props_uses_the_binding() {
    let out = compile_client(
        r#"<script>
	let props = $props();
	let [a, b] = $derived(props);
</script>
<p>{a}{b}</p>"#,
    );
    assert!(
        out.contains("$$array = $.derived(() => $.to_array(props, 2))"),
        "expected `$.to_array(props, 2)`. Got:\n{out}"
    );
    assert!(
        !out.contains("$.to_array($$props"),
        "still iterates the raw `$$props`:\n{out}"
    );
    assert!(
        out.contains("a = $.derived(() => $.get($$array)[0])"),
        "element reads are unchanged. Got:\n{out}"
    );
}

#[test]
fn array_pattern_over_plain_state_is_unchanged() {
    let out = compile_client(
        r#"<script>
	let obj = $state([]);
	let [a, b] = $derived(obj);
</script>
<p>{a}{b}</p>"#,
    );
    assert!(
        out.contains("$$array = $.derived(() => $.to_array(obj, 2))"),
        "a plain base already matched the official compiler. Got:\n{out}"
    );
}

#[test]
fn object_pattern_member_reads_still_use_dollar_props() {
    // The `member_base` rewrite is only wrong for array patterns — named member
    // reads must keep reading `$$props`.
    let out = compile_client(
        r#"<script>
	let props = $props();
	let { a, ...r } = $derived(props);
</script>
<p>{a}{r}</p>"#,
    );
    assert!(
        out.contains("a = $.derived(() => $$props.a)"),
        "expected the named member to read `$$props`. Got:\n{out}"
    );
    assert!(
        out.contains("$.exclude_from_object(props,"),
        "expected the rest to subtract from `props`. Got:\n{out}"
    );
}

#[test]
fn nested_array_under_a_named_key_still_reads_dollar_props() {
    // A nested array pattern consumes `$$props.list`, a *member* of the binding,
    // so the member rewrite still applies there.
    let out = compile_client(
        r#"<script>
	let props = $props();
	let { list: [a, b] } = $derived(props);
</script>
<p>{a}{b}</p>"#,
    );
    assert!(
        out.contains("$$array = $.derived(() => $.to_array($$props.list, 2))"),
        "expected `$.to_array($$props.list, 2)`. Got:\n{out}"
    );
}
