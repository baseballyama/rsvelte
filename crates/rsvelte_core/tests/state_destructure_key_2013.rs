//! Regression test for computed / quoted keys in a destructured `$state(...)`
//! (baseballyama/rsvelte#2013).
//!
//! The key was resolved to its *cooked value* and spliced into a static member
//! access, so `'weird-name'` became the subtraction `tmp.weird - name`. Computed
//! and numeric keys bailed out of the AST path and out of the text fallback too,
//! leaving `let { a, [k]: c } = $state({})` in the output verbatim.
//!
//! Assertions allow the configured code generator to normalize quote style.

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
fn single_quoted_key_uses_bracket_notation() {
    let out = compile_client(
        r#"<script>
	let { a, 'weird-name': w } = $state({});
</script>
<p>{a}{w}</p>"#,
    );
    assert!(
        out.contains("w = $.proxy(tmp['weird-name'])"),
        "expected a bracketed literal member read. Got:\n{out}"
    );
    assert!(
        !out.contains("tmp.weird - name"),
        "the key was still spliced into a static member access:\n{out}"
    );
}

#[test]
fn double_quoted_key_uses_bracket_notation() {
    let out = compile_client(
        r#"<script>
	let { a, "weird-name": w } = $state({});
</script>
<p>{a}{w}</p>"#,
    );
    assert!(
        out.contains("w = $.proxy(tmp['weird-name'])"),
        "expected a bracketed literal member read. Got:\n{out}"
    );
}

#[test]
fn key_containing_an_apostrophe() {
    let out = compile_client(
        r#"<script>
	let { "it's": v } = $state({});
</script>
<p>{v}</p>"#,
    );
    assert!(
        out.contains(r#"v = $.proxy(tmp['it\'s'])"#),
        "expected the apostrophe key to stay escaped. Got:\n{out}"
    );
}

#[test]
fn numeric_key_uses_bracket_notation() {
    let out = compile_client(
        r#"<script>
	let { a, 0: z } = $state({});
</script>
<p>{a}{z}</p>"#,
    );
    assert!(
        out.contains("z = $.proxy(tmp[0])"),
        "expected `tmp[0]`, not `tmp.0`. Got:\n{out}"
    );
    assert!(
        !out.contains("= $state({})"),
        "the declaration was still left untransformed:\n{out}"
    );
}

#[test]
fn computed_key_is_transformed_at_all() {
    let out = compile_client(
        r#"<script>
	const k = 'x';
	let { a, [k]: c } = $state({});
</script>
<p>{a}{c}</p>"#,
    );
    assert!(
        out.contains("c = $.proxy(tmp[k])"),
        "expected `tmp[k]`. Got:\n{out}"
    );
    assert!(
        !out.contains("= $state({})"),
        "the declaration was still left untransformed:\n{out}"
    );
}

#[test]
fn computed_expression_key() {
    let out = compile_client(
        r#"<script>
	const k = 'x';
	let { [k + 1]: c } = $state({});
</script>
<p>{c}</p>"#,
    );
    assert!(
        out.contains("c = $.proxy(tmp[k + 1])"),
        "expected the whole key expression inside the brackets. Got:\n{out}"
    );
}

#[test]
fn computed_string_literal_key() {
    let out = compile_client(
        r#"<script>
	let { ['lit']: c } = $state({});
</script>
<p>{c}</p>"#,
    );
    assert!(
        out.contains("c = $.proxy(tmp['lit'])"),
        "expected `tmp['lit']`, not `tmp.lit`. Got:\n{out}"
    );
}

#[test]
fn quoted_key_with_a_default() {
    let out = compile_client(
        r#"<script>
	let { 'weird-name': w = 5 } = $state({});
</script>
<p>{w}</p>"#,
    );
    assert!(
        out.contains("w = $.proxy($.fallback(tmp['weird-name'], 5))"),
        "expected the fallback to wrap the bracketed read. Got:\n{out}"
    );
}

#[test]
fn plain_identifier_keys_are_unchanged() {
    let out = compile_client(
        r#"<script>
	let { a, b: bb } = $state({});
</script>
<p>{a}{bb}</p>"#,
    );
    assert!(
        out.contains("a = $.proxy(tmp.a)") && out.contains("bb = $.proxy(tmp.b)"),
        "identifier keys must keep dot notation. Got:\n{out}"
    );
}
