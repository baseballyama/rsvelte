//! Regression test for computed / quoted keys in a destructured `$derived`
//! (baseballyama/rsvelte#2001).
//!
//! The key text was spliced into a static member access (`base.<key>`) regardless
//! of whether it was computed or a literal, emitting `obj.[k]` / `obj.'weird-name'`
//! — neither parses. Computed keys were also dropped from the rest's
//! `$.exclude_from_object` key list instead of becoming `String(<key>)`.
//!
//! Expected member accesses below were taken from the official Svelte compiler.

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
fn computed_key_uses_bracket_notation() {
    let out = compile_client(
        r#"<script>
	let obj = $state({});
	const k = 'x';
	let { a, [k]: c } = $derived(obj);
</script>
<p>{a}{c}</p>"#,
    );
    assert!(
        out.contains("c = $.derived(() => obj[k])"),
        "expected a computed member read. Got:\n{out}"
    );
    assert!(!out.contains("obj.[k]"), "still emits `obj.[k]`:\n{out}");
}

#[test]
fn computed_key_is_excluded_from_rest_at_runtime() {
    let out = compile_client(
        r#"<script>
	let obj = $state({});
	const k = 'x';
	let { a, [k]: c, ...r } = $derived(obj);
</script>
<p>{a}{c}{r}</p>"#,
    );
    // Upstream pushes `String(<key expr>)` for a computed key so the rest
    // subtracts it at runtime.
    assert!(
        out.contains(r#"$.exclude_from_object(obj, ['a', String(k)])"#),
        "expected the computed key in the exclusion list. Got:\n{out}"
    );
}

#[test]
fn computed_expression_key_is_stringified() {
    let out = compile_client(
        r#"<script>
	let obj = $state({});
	const k = 'x';
	let { [k + 1]: c, ...r } = $derived(obj);
</script>
<p>{c}{r}</p>"#,
    );
    assert!(
        out.contains("c = $.derived(() => obj[k + 1])"),
        "expected the whole key expression inside the brackets. Got:\n{out}"
    );
    assert!(
        out.contains(r#"$.exclude_from_object(obj, [String(k + 1)])"#),
        "expected `String(k + 1)` in the exclusion list. Got:\n{out}"
    );
}

#[test]
fn quoted_key_uses_bracket_notation() {
    let out = compile_client(
        r#"<script>
	let obj = $state({});
	let { a, 'weird-name': w, ...r } = $derived(obj);
</script>
<p>{a}{w}{r}</p>"#,
    );
    assert!(
        out.contains("w = $.derived(() => obj['weird-name'])"),
        "expected a bracketed literal member read. Got:\n{out}"
    );
    assert!(
        !out.contains("obj.'weird-name'"),
        "still emits `obj.'weird-name'`:\n{out}"
    );
    // A `Literal` key stays a plain string in the exclusion list — no `String(...)`.
    assert!(
        out.contains(r#"$.exclude_from_object(obj, ['a', 'weird-name'])"#),
        "expected the literal key in the exclusion list. Got:\n{out}"
    );
}

#[test]
fn numeric_key_uses_bracket_notation() {
    let out = compile_client(
        r#"<script>
	let obj = $state({});
	let { a, 0: z, ...r } = $derived(obj);
</script>
<p>{a}{z}{r}</p>"#,
    );
    assert!(
        out.contains("z = $.derived(() => obj[0])"),
        "expected `obj[0]`, not `obj.0`. Got:\n{out}"
    );
    assert!(
        out.contains(r#"$.exclude_from_object(obj, ['a', '0'])"#),
        "expected the numeric key stringified in the exclusion list. Got:\n{out}"
    );
}

#[test]
fn computed_string_literal_key_stays_a_literal() {
    let out = compile_client(
        r#"<script>
	let obj = $state({});
	let { ['lit']: c, ...r } = $derived(obj);
</script>
<p>{c}{r}</p>"#,
    );
    assert!(
        out.contains("c = $.derived(() => obj['lit'])"),
        "expected `obj['lit']`. Got:\n{out}"
    );
    assert!(
        out.contains(r#"$.exclude_from_object(obj, ['lit'])"#),
        "a computed `Literal` key must not be wrapped in `String(...)`. Got:\n{out}"
    );
}

#[test]
fn computed_key_reads_the_rest_prop_binding_not_dollar_props() {
    // Upstream's rest-prop rewrite only retargets *static* member reads, so
    // `props[k]` keeps `props` while `props.a` becomes `$$props.a`.
    let out = compile_client(
        r#"<script>
	let props = $props();
	const k = 'x';
	let { a, [k]: c, ...r } = $derived(props);
</script>
<p>{a}{c}{r}</p>"#,
    );
    assert!(
        out.contains("a = $.derived(() => $$props.a)"),
        "expected the static key to read `$$props`. Got:\n{out}"
    );
    assert!(
        out.contains("c = $.derived(() => props[k])"),
        "expected the computed key to read `props`. Got:\n{out}"
    );
}

#[test]
fn quoted_key_reads_the_rest_prop_binding_not_dollar_props() {
    let out = compile_client(
        r#"<script>
	let props = $props();
	let { a, 'weird-name': w } = $derived(props);
</script>
<p>{a}{w}</p>"#,
    );
    assert!(
        out.contains("w = $.derived(() => props['weird-name'])"),
        "expected the literal key to read `props`. Got:\n{out}"
    );
}

#[test]
fn computed_key_with_default_wraps_the_bracket_access() {
    let out = compile_client(
        r#"<script>
	let obj = $state({});
	const k = 'x';
	let { [k]: c = 5 } = $derived(obj);
</script>
<p>{c}</p>"#,
    );
    assert!(
        out.contains("c = $.derived(() => $.fallback(obj[k], 5))"),
        "expected the fallback to wrap the computed read. Got:\n{out}"
    );
}

#[test]
fn nested_computed_key_after_static_key() {
    let out = compile_client(
        r#"<script>
	let obj = $state({});
	const k = 'x';
	let { n: { [k]: c, ...r } } = $derived(obj);
</script>
<p>{c}{r}</p>"#,
    );
    assert!(
        out.contains("c = $.derived(() => obj.n[k])"),
        "expected `obj.n[k]`. Got:\n{out}"
    );
    assert!(
        out.contains(r#"$.exclude_from_object(obj.n, [String(k)])"#),
        "expected the nested rest to subtract the computed key. Got:\n{out}"
    );
}

#[test]
fn computed_key_holding_a_nested_array_pattern() {
    let out = compile_client(
        r#"<script>
	let obj = $state({});
	const k = 'x';
	let { [k]: [c, d] } = $derived(obj);
</script>
<p>{c}{d}</p>"#,
    );
    assert!(
        out.contains("$$array = $.derived(() => $.to_array(obj[k], 2))"),
        "expected the array helper to read the computed member. Got:\n{out}"
    );
}
