//! Regression tests for the SSR destructuring divergences
//! (baseballyama/rsvelte#2033, #2034).
//!
//! #2010 fixed the client lowering only. On the server, `_extract_paths` dropped a
//! computed key entirely (`obj[k]` → `obj`), spelled literal keys as strings
//! (`obj[0]` → `obj['0']`), skipped computed keys in the `$.exclude_from_object`
//! list, and neither dropped the `$.to_array` length nor emitted the leaf for an
//! array pattern ending in a rest element.
//!
//! Expected outputs below were taken from the official Svelte compiler.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_server(src: &str) -> String {
    let result = compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Server,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile");
    result.js.code
}

fn assert_contains(out: &str, needle: &str) {
    assert!(out.contains(needle), "expected `{needle}` in:\n{out}");
}

#[test]
fn derived_computed_and_literal_keys() {
    let out = compile_server(
        r#"<script>
	let obj = $state({});
	const k = 'x';
	let { a, [k]: c, 'weird-name': w, 0: n } = $derived(obj);
</script>
<p>{a}{c}{w}{n}</p>"#,
    );
    assert_contains(&out, "a = $.derived(() => obj.a)");
    assert_contains(&out, "c = $.derived(() => obj[k])");
    assert_contains(&out, "w = $.derived(() => obj['weird-name'])");
    assert_contains(&out, "n = $.derived(() => obj[0])");
}

#[test]
fn derived_computed_key_reads_are_visited() {
    let out = compile_server(
        r#"<script>
	let obj = $state({});
	let k = $derived('x');
	let { [k]: a, ...r } = $derived(obj);
</script>
<p>{a}{r.q}</p>"#,
    );
    assert_contains(&out, "a = $.derived(() => obj[k()])");
    assert_contains(
        &out,
        "r = $.derived(() => $.exclude_from_object(obj, [String(k())]))",
    );
}

#[test]
fn derived_non_identifier_base_keeps_the_key() {
    let out = compile_server(
        r#"<script>
	let obj = $state({});
	const k = 'x';
	let { [k]: c } = $derived({ ...obj });
</script>
<p>{c}</p>"#,
    );
    assert_contains(&out, "c = $.derived(() => $$d()[k])");
}

#[test]
fn derived_array_rest_drops_the_length_and_keeps_the_leaf() {
    let out = compile_server(
        r#"<script>
	let obj = $state([]);
	let [a, ...b] = $derived(obj);
</script>
<p>{a}{b.length}</p>"#,
    );
    assert_contains(&out, "$$derived_array = $.derived(() => $.to_array(obj))");
    assert!(
        !out.contains("$.to_array(obj, 1)"),
        "the rest was still counted as an element:\n{out}"
    );
    assert_contains(&out, "a = $.derived(() => $$derived_array()[0])");
    assert_contains(&out, "b = $.derived(() => $$derived_array().slice(1))");
}

#[test]
fn derived_array_hole_before_rest_keeps_the_index() {
    let out = compile_server(
        r#"<script>
	let obj = $state([]);
	let [, ...b] = $derived(obj);
</script>
<p>{b.length}</p>"#,
    );
    assert_contains(&out, "$$derived_array = $.derived(() => $.to_array(obj))");
    assert_contains(&out, "b = $.derived(() => $$derived_array().slice(1))");
}

#[test]
fn derived_nested_array_rest() {
    let out = compile_server(
        r#"<script>
	let obj = $state([]);
	let [a, ...[b, ...c]] = $derived(obj);
</script>
<p>{a}{b}{c.length}</p>"#,
    );
    assert_contains(&out, "$$derived_array = $.derived(() => $.to_array(obj))");
    assert_contains(
        &out,
        "$$derived_array_1 = $.derived(() => $.to_array($$derived_array().slice(1)))",
    );
    assert_contains(&out, "b = $.derived(() => $$derived_array_1()[0])");
    assert_contains(&out, "c = $.derived(() => $$derived_array_1().slice(1))");
}

#[test]
fn state_computed_and_literal_keys() {
    let out = compile_server(
        r#"<script>
	const k = 'x';
	let { [k]: a, 0: n, ...r } = $state({});
</script>
<p>{a}{n}{r.q}</p>"#,
    );
    assert_contains(&out, "a = tmp[k]");
    assert_contains(&out, "n = tmp[0]");
    // `create_state_declarators` is not re-visited upstream, so the key stays raw.
    assert_contains(&out, "r = $.exclude_from_object(tmp, [String(k), '0'])");
}
