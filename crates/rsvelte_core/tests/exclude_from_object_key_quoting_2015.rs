//! Regression test for `$.exclude_from_object` key quoting
//! (baseballyama/rsvelte#2015).
//!
//! Both the member access and the rebuilt key list must carry the decoded value;
//! the printer is then responsible for consistent quoting and escaping.

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
fn identifier_keys_are_single_quoted() {
    let out = compile_client(
        r#"<script>
	let obj = $state({});
	let { a, b, ...r } = $derived(obj);
</script>
<p>{a}{b}{r}</p>"#,
    );
    assert!(
        out.contains(r#"$.exclude_from_object(obj, ['a', 'b'])"#),
        "expected single-quoted keys. Got:\n{out}"
    );
}

#[test]
fn double_quoted_key_is_normalised() {
    let out = compile_client(
        r#"<script>
	let obj = $state({});
	let { "weird-name": w, ...r } = $derived(obj);
</script>
<p>{w}{r}</p>"#,
    );
    assert!(
        out.contains(r#"w = $.derived(() => obj['weird-name'])"#),
        "the member access is normalized. Got:\n{out}"
    );
    assert!(
        out.contains(r#"$.exclude_from_object(obj, ['weird-name'])"#),
        "the key list is always single-quoted. Got:\n{out}"
    );
}

#[test]
fn apostrophe_in_a_double_quoted_key_is_escaped() {
    let out = compile_client(
        r#"<script>
	let obj = $state({});
	let { "it's": v, ...r } = $derived(obj);
</script>
<p>{v}{r}</p>"#,
    );
    assert!(
        out.contains(r#"v = $.derived(() => obj['it\'s'])"#),
        "the member access is escaped. Got:\n{out}"
    );
    assert!(
        out.contains(r#"$.exclude_from_object(obj, ['it\'s'])"#),
        "a naive quote swap would produce an unterminated literal. Got:\n{out}"
    );
}

#[test]
fn apostrophe_in_a_single_quoted_key_stays_escaped() {
    let out = compile_client(
        r#"<script>
	let obj = $state({});
	let { 'it\'s': v, ...r } = $derived(obj);
</script>
<p>{v}{r}</p>"#,
    );
    assert!(
        out.contains(r#"$.exclude_from_object(obj, ['it\'s'])"#),
        "expected the escape to survive. Got:\n{out}"
    );
}

#[test]
fn double_quote_inside_a_single_quoted_key_needs_no_escape() {
    let out = compile_client(
        r#"<script>
	let obj = $state({});
	let { 'a"b': v, ...r } = $derived(obj);
</script>
<p>{v}{r}</p>"#,
    );
    assert!(
        out.contains(r#"$.exclude_from_object(obj, ['a"b'])"#),
        "expected the double quote left bare. Got:\n{out}"
    );
}

#[test]
fn backslash_and_newline_escapes_survive() {
    let out = compile_client(
        r#"<script>
	let obj = $state({});
	let { "a\nb": v, "c\\d": w, ...r } = $derived(obj);
</script>
<p>{v}{w}{r}</p>"#,
    );
    assert!(
        out.contains(r#"$.exclude_from_object(obj, ['a\nb', 'c\\d'])"#),
        "expected `\\n` and `\\\\` re-emitted. Got:\n{out}"
    );
}

#[test]
fn unicode_escapes_are_decoded() {
    // The AST carries the decoded value, so the printer emits `'aAb'`.
    let out = compile_client(
        r#"<script>
	let obj = $state({});
	let { "a\u0041b": v, ...r } = $derived(obj);
</script>
<p>{v}{r}</p>"#,
    );
    assert!(
        out.contains(r#"v = $.derived(() => obj['aAb'])"#),
        "the member access carries the decoded value. Got:\n{out}"
    );
    assert!(
        out.contains(r#"$.exclude_from_object(obj, ['aAb'])"#),
        "the key list carries the decoded value. Got:\n{out}"
    );
}

#[test]
fn computed_literal_keys_are_normalised_too() {
    let out = compile_client(
        r#"<script>
	let obj = $state({});
	let { ["lit"]: c, [0]: z, ...r } = $derived(obj);
</script>
<p>{c}{z}{r}</p>"#,
    );
    assert!(
        out.contains(r#"$.exclude_from_object(obj, ['lit', '0'])"#),
        "expected both computed literals decoded and single-quoted. Got:\n{out}"
    );
}

#[test]
fn state_rest_follows_the_same_rule() {
    let out = compile_client(
        r#"<script>
	let { 'it\'s': v, ...r } = $state({});
</script>
<p>{v}{r}</p>"#,
    );
    assert!(
        out.contains(r#"v = $.proxy(tmp['it\'s'])"#),
        "the member access keeps the source quoting. Got:\n{out}"
    );
    assert!(
        out.contains(r#"r = $.proxy($.exclude_from_object(tmp, ['it\'s']))"#),
        "expected the escaped single-quoted key. Got:\n{out}"
    );
}

#[test]
fn state_rest_decodes_unicode_escapes() {
    let out = compile_client(
        r#"<script>
	let { "a\u0041b": v, ...r } = $state({});
</script>
<p>{v}{r}</p>"#,
    );
    assert!(
        out.contains(r#"$.exclude_from_object(tmp, ['aAb'])"#),
        "expected the decoded value. Got:\n{out}"
    );
}
