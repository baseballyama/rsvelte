//! Regression tests for issue #2078 — the legacy (non-runes) `tmp`-based
//! destructuring expansion.
//!
//! Upstream builds it with `extract_paths`, so an object rest reads
//! `$.exclude_from_object(tmp, [<keys>])` (never `tmp.rest`), every path keeps
//! its `$.mutable_source` / `$.tag` wrapping when the binding is state, and the
//! whole expansion stays a single chained declaration.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_client(src: &str, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Comp.svelte".to_string()),
            generate: GenerateMode::Client,
            dev,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

const OBJECT_REST: &str = r#"<script>
	let { a, b, ...rest } = { a: 1, b: 2, c: 3 };
	function f() {
		a++;
		rest = { ...rest, z: 1 };
	}
</script>
<button onclick={f}>{a} {b} {JSON.stringify(rest)}</button>"#;

#[test]
fn state_object_rest_uses_exclude_from_object_and_mutable_source() {
    let out = compile_client(OBJECT_REST, false);
    assert!(
        out.contains("rest = $.mutable_source($.exclude_from_object(tmp, ['a', 'b']))"),
        "in:\n{out}"
    );
    assert!(!out.contains("rest = tmp.rest"), "in:\n{out}");
}

#[test]
fn state_object_rest_is_labelled_in_dev() {
    let out = compile_client(OBJECT_REST, true);
    assert!(
        out.contains(
            "rest = $.tag($.mutable_source($.exclude_from_object(tmp, ['a', 'b'])), 'rest')"
        ),
        "in:\n{out}"
    );
}

#[test]
fn non_state_object_rest_stays_a_plain_exclude_from_object() {
    let src = r#"<script>
	let { a, ...rest } = { a: 1, c: 3 };
	function f() {
		a++;
	}
</script>
<button onclick={f}>{a} {JSON.stringify(rest)}</button>"#;
    let out = compile_client(src, false);
    assert!(
        out.contains("rest = $.exclude_from_object(tmp, ['a'])"),
        "in:\n{out}"
    );
}

/// Upstream's key list is built with `b.literal(...)`: identifier and literal
/// keys become string literals, any other computed key becomes `String(<expr>)`.
/// The member reads keep bracket notation for the same non-identifier keys.
#[test]
fn computed_and_literal_keys_are_lowered_like_upstream() {
    let src = r#"<script>
	const key = 'd';
	let { a, 'b-c': bc, 3: three, [key]: dee, e = 7, ...rest } = { a: 1 };
	function f() {
		bc++;
		rest = {};
	}
</script>
<button onclick={f}>{a} {bc} {three} {dee} {e} {JSON.stringify(rest)}</button>"#;
    let out = compile_client(src, false);
    assert!(
        out.contains(
            "rest = $.mutable_source($.exclude_from_object(tmp, ['a', 'b-c', '3', String(key), 'e']))"
        ),
        "in:\n{out}"
    );
    assert!(
        out.contains("bc = $.mutable_source(tmp['b-c'])"),
        "in:\n{out}"
    );
    assert!(out.contains("three = tmp[3]"), "in:\n{out}");
    assert!(out.contains("dee = tmp[key]"), "in:\n{out}");
    assert!(out.contains("e = $.fallback(tmp.e, 7)"), "in:\n{out}");
}

#[test]
fn array_pattern_default_becomes_a_fallback() {
    let src = r#"<script>
	let [a = 9, b] = [1, 2];
	function f() {
		a++;
	}
</script>
<button onclick={f}>{a} {b}</button>"#;
    let out = compile_client(src, false);
    assert!(
        out.contains("a = $.mutable_source($.fallback($.get($$array)[0], 9))"),
        "in:\n{out}"
    );
}

/// The later declarators read the `tmp` / `$$array` helpers declared beside
/// them, so the expansion must not be split into one statement per declarator.
#[test]
fn array_expansion_stays_one_chained_declaration() {
    let src = r#"<script>
	let [a, b, ...rest] = [1, 2, 3];
	function f() {
		a++;
	}
</script>
<button onclick={f}>{a} {b} {JSON.stringify(rest)}</button>"#;
    let out = compile_client(src, false);
    assert!(out.contains("let tmp = [1, 2, 3],"), "in:\n{out}");
    assert!(!out.contains("let $$array"), "in:\n{out}");
    assert!(out.contains("rest = $.get($$array).slice(2)"), "in:\n{out}");
}
