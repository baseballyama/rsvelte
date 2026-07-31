//! Regression test for `$.to_array` arity when a destructured `$derived` array
//! pattern ends in a rest element (baseballyama/rsvelte#2014).
//!
//! rsvelte always passed a length. Upstream omits it for a pattern with a rest
//! element — the iterable must be drained completely, and a fixed length truncates
//! it. The count was also wrong on its own terms, since the rest was counted as an
//! element.
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
fn rest_element_drops_the_length() {
    let out = compile_client(
        r#"<script>
	let obj = $state([]);
	let [a, ...b] = $derived(obj);
</script>
<p>{a}{b}</p>"#,
    );
    assert!(
        out.contains("$$array = $.derived(() => $.to_array(obj))"),
        "expected `$.to_array(obj)` with no length. Got:\n{out}"
    );
    assert!(
        !out.contains("$.to_array(obj, 2)"),
        "the rest was still counted as an element:\n{out}"
    );
    assert!(
        out.contains("b = $.derived(() => $.get($$array).slice(1))"),
        "the rest read is unchanged. Got:\n{out}"
    );
}

#[test]
fn rest_only_pattern_drops_the_length() {
    let out = compile_client(
        r#"<script>
	let obj = $state([]);
	let [...b] = $derived(obj);
</script>
<p>{b}</p>"#,
    );
    assert!(
        out.contains("$$array = $.derived(() => $.to_array(obj))"),
        "expected `$.to_array(obj)`. Got:\n{out}"
    );
}

#[test]
fn rest_element_over_rest_props() {
    let out = compile_client(
        r#"<script>
	let props = $props();
	let [a, ...b] = $derived(props);
</script>
<p>{a}{b}</p>"#,
    );
    assert!(
        out.contains("$$array = $.derived(() => $.to_array(props))"),
        "expected `$.to_array(props)`. Got:\n{out}"
    );
}

#[test]
fn nested_array_pattern_with_a_rest_element() {
    let out = compile_client(
        r#"<script>
	let obj = $state({});
	let { list: [a, ...b] } = $derived(obj);
</script>
<p>{a}{b}</p>"#,
    );
    assert!(
        out.contains("$$array = $.derived(() => $.to_array(obj.list))"),
        "the nested helper needs the same treatment. Got:\n{out}"
    );
}

#[test]
fn pattern_without_a_rest_element_keeps_the_length() {
    let out = compile_client(
        r#"<script>
	let obj = $state([]);
	let [a, b] = $derived(obj);
</script>
<p>{a}{b}</p>"#,
    );
    assert!(
        out.contains("$$array = $.derived(() => $.to_array(obj, 2))"),
        "a rest-free pattern already matched the official compiler. Got:\n{out}"
    );
}
