//! Regression test for `let { b = q ? 1 : 2 } = $derived(props)`
//! (baseballyama/rsvelte#1973).
//!
//! The property splitter cut each destructured property at the *first* `:`, so a
//! ternary default value (or a string literal containing a colon) was mistaken for
//! a `key: value` rename and the else-branch became the declaration id — emitting
//! `2 = $.derived(() => $$props.b = q ? 1)`, which does not even parse.
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
fn shorthand_ternary_default() {
    let out = compile_client(
        r#"<script>
	let props = $props();
	let q = true;
	let { a, b = q ? 1 : 2 } = $derived(props);
</script>
<p>{a}{b}</p>"#,
    );
    assert!(
        out.contains("b = $.derived(() => $.fallback($$props.b, q ? 1 : 2))"),
        "expected the ternary to stay the fallback default. Got:\n{out}"
    );
    assert!(
        !out.contains("$$props.b = q ? 1"),
        "the ternary's `:` was still read as the key separator:\n{out}"
    );
}

#[test]
fn renamed_property_ternary_default() {
    let out = compile_client(
        r#"<script>
	let props = $props();
	let q = true;
	let { a, b: bb = q ? 1 : 2 } = $derived(props);
</script>
<p>{a}{bb}</p>"#,
    );
    assert!(
        out.contains("bb = $.derived(() => $.fallback($$props.b, q ? 1 : 2))"),
        "expected `bb` to read `b` with the ternary fallback. Got:\n{out}"
    );
}

#[test]
fn nested_pattern_ternary_default() {
    let out = compile_client(
        r#"<script>
	let props = $props();
	let q = true;
	let { a, n: { b = q ? 1 : 2 } } = $derived(props);
</script>
<p>{a}{b}</p>"#,
    );
    assert!(
        out.contains("b = $.derived(() => $.fallback($$props.n.b, q ? 1 : 2))"),
        "expected the nested shorthand default to become a fallback. Got:\n{out}"
    );
}

#[test]
fn derived_by_ternary_default() {
    let out = compile_client(
        r#"<script>
	let props = $props();
	let q = true;
	let { a, b = q ? 1 : 2 } = $derived.by(() => props);
</script>
<p>{a}{b}</p>"#,
    );
    assert!(
        out.contains("b = $.derived(() => $.fallback($.get($$d).b, q ? 1 : 2))"),
        "expected the `$derived.by` destructure to read through `$$d`. Got:\n{out}"
    );
}

#[test]
fn string_default_containing_colon() {
    let out = compile_client(
        r#"<script>
	let props = $props();
	let { a, b = 'x:y' } = $derived(props);
</script>
<p>{a}{b}</p>"#,
    );
    assert!(
        out.contains("b = $.derived(() => $.fallback($$props.b, 'x:y'))"),
        "a `:` inside a string default must not split the property. Got:\n{out}"
    );
}

#[test]
fn array_element_ternary_default() {
    let out = compile_client(
        r#"<script>
	let props = $props();
	let q = true;
	let [a, b = q ? 1 : 2] = $derived(props);
</script>
<p>{a}{b}</p>"#,
    );
    assert!(
        out.contains("b = $.derived(() => $.fallback($.get($$array)[1], q ? 1 : 2))"),
        "expected the array element default to become a fallback. Got:\n{out}"
    );
}

#[test]
fn non_simple_ternary_default_is_thunked() {
    // `is_simple_expression` recurses into a ternary's operands, so a member
    // access in a branch forces the lazy `() => …, true` fallback form.
    let out = compile_client(
        r#"<script>
	let props = $props();
	let q = true;
	let o = {};
	let { a, b = q ? o.x : 2 } = $derived(props);
</script>
<p>{a}{b}</p>"#,
    );
    assert!(
        out.contains("b = $.derived(() => $.fallback($$props.b, () => q ? o.x : 2, true))"),
        "expected the non-simple ternary to be thunked. Got:\n{out}"
    );
}
