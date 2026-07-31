//! Regression test for a `...rest` element in a destructured `$state(...)`
//! (baseballyama/rsvelte#2012).
//!
//! The rest branch read a property literally named after the rest binding
//! (`tmp.r`) instead of subtracting the consumed keys, so `r` was `undefined` at
//! runtime.
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
fn rest_subtracts_the_consumed_keys() {
    let out = compile_client(
        r#"<script>
	let { a, b, ...r } = $state({});
</script>
<p>{a}{b}{r}</p>"#,
    );
    assert!(
        out.contains("r = $.proxy($.exclude_from_object(tmp, ['a', 'b']))"),
        "expected `$.exclude_from_object`. Got:\n{out}"
    );
    assert!(
        !out.contains("$.proxy(tmp.r)"),
        "the rest still read a property named after itself:\n{out}"
    );
}

#[test]
fn rest_uses_the_source_key_not_the_renamed_binding() {
    let out = compile_client(
        r#"<script>
	let { a: aa, 'weird-name': w, ...r } = $state({});
</script>
<p>{aa}{w}{r}</p>"#,
    );
    assert!(
        out.contains("r = $.proxy($.exclude_from_object(tmp, ['a', 'weird-name']))"),
        "expected the source-side keys in the exclusion list. Got:\n{out}"
    );
}

#[test]
fn numeric_key_is_stringified() {
    let out = compile_client(
        r#"<script>
	let { a, 0: z, ...r } = $state({});
</script>
<p>{a}{z}{r}</p>"#,
    );
    assert!(
        out.contains("r = $.proxy($.exclude_from_object(tmp, ['a', '0']))"),
        "expected the numeric key as a string. Got:\n{out}"
    );
}

#[test]
fn computed_key_is_subtracted_at_runtime() {
    let out = compile_client(
        r#"<script>
	const k = 'x';
	let { a, [k]: c, ...r } = $state({});
</script>
<p>{a}{c}{r}</p>"#,
    );
    assert!(
        out.contains("r = $.proxy($.exclude_from_object(tmp, ['a', String(k)]))"),
        "expected `String(k)` in the exclusion list. Got:\n{out}"
    );
}

#[test]
fn computed_literal_key_stays_a_literal() {
    let out = compile_client(
        r#"<script>
	let { ['lit']: c, ...r } = $state({});
</script>
<p>{c}{r}</p>"#,
    );
    assert!(
        out.contains("r = $.proxy($.exclude_from_object(tmp, ['lit']))"),
        "a computed `Literal` key must not be wrapped in `String(...)`. Got:\n{out}"
    );
}

#[test]
fn apostrophe_in_a_key_is_escaped() {
    let out = compile_client(
        r#"<script>
	let { "it's": v, ...r } = $state({});
</script>
<p>{v}{r}</p>"#,
    );
    assert!(
        out.contains(r#"r = $.proxy($.exclude_from_object(tmp, ['it\'s']))"#),
        "expected the apostrophe escaped in the single-quoted key. Got:\n{out}"
    );
}

#[test]
fn rest_only_pattern_gets_an_empty_key_list() {
    let out = compile_client(
        r#"<script>
	let { ...r } = $state({});
</script>
<p>{r}</p>"#,
    );
    assert!(
        out.contains("r = $.proxy($.exclude_from_object(tmp, []))"),
        "expected an empty exclusion list. Got:\n{out}"
    );
}

#[test]
fn state_raw_rest_skips_the_proxy_wrap() {
    let out = compile_client(
        r#"<script>
	let { a, ...r } = $state.raw({});
</script>
<p>{a}{r}</p>"#,
    );
    assert!(
        out.contains("r = $.exclude_from_object(tmp, ['a'])"),
        "expected the bare call for `$state.raw`. Got:\n{out}"
    );
}

#[test]
fn reassigned_rest_keeps_the_state_wrap() {
    let out = compile_client(
        r#"<script>
	let { a, ...r } = $state({});
	function f() { r = {}; }
</script>
<p>{a}{r}</p><button onclick={f}>x</button>"#,
    );
    assert!(
        out.contains("r = $.state($.proxy($.exclude_from_object(tmp, ['a'])))"),
        "expected the exclusion inside the `$.state($.proxy(...))` wrap. Got:\n{out}"
    );
}
