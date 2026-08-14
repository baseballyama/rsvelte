//! Regression tests for issue #2138 — the legacy (non-runes) destructuring
//! *assignment* expansion (`({ a, ...rest } = obj)`).
//!
//! Upstream lowers it through `extract_paths` too (`visit_assignment_expression`
//! in `3-transform/shared/assignments.js`), so an object pattern with an
//! identifier right-hand side stays a plain sequence — the `$$value` IIFE is
//! reserved for `inserts.length > 0 || should_cache` — the rest reads
//! `$.exclude_from_object(<rhs>, [<keys>])`, and every key keeps upstream's
//! `b.literal(...)` / `b.call('String', key)` form.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Comp.svelte".to_string()),
            generate: GenerateMode::Client,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

fn flat(code: &str) -> String {
    code.chars().filter(|ch| !ch.is_whitespace()).collect()
}

#[test]
fn object_rest_with_identifier_rhs_is_a_sequence_not_an_iife() {
    let src = r#"<script>
	let a = 1, b = 2, rest = {};
	const obj = { a: 1, b: 2, c: 3 };
	function f() { ({ a, b, ...rest } = obj); }
</script>
<button onclick={f}>{a} {b} {JSON.stringify(rest)}</button>"#;
    let out = flat(&compile_client(src));
    assert!(
        out.contains(
            "$.set(a,obj.a),$.set(b,obj.b),$.set(rest,$.exclude_from_object(obj,['a','b']));"
        ),
        "in:\n{out}"
    );
    assert!(!out.contains("$$value"), "in:\n{out}");
}

/// Upstream caches the value in `$$value` only when it is not an identifier.
#[test]
fn object_rest_with_call_rhs_keeps_the_iife() {
    let src = r#"<script>
	let a = 1, rest = {};
	function get() { return { a: 1, c: 3 }; }
	function f() { ({ a, ...rest } = get()); }
</script>
<button onclick={f}>{a} {JSON.stringify(rest)}</button>"#;
    let out = flat(&compile_client(src));
    assert!(
        out.contains(
            "(($$value)=>{$.set(a,$$value.a);$.set(rest,$.exclude_from_object($$value,['a']));})(get());"
        ),
        "in:\n{out}"
    );
}

/// The key list is built with `b.literal(...)` (identifier and `Literal` keys
/// become string literals, any other computed key becomes `String(<expr>)`),
/// while the member reads keep bracket notation for the same keys. Getting
/// either wrong used to emit unparseable code (`obj.'b-c'`, `''b-c''`), which
/// made the downstream AST pass bail and drop every `$.set` in the statement.
#[test]
fn literal_and_computed_keys_are_lowered_like_upstream() {
    let src = r#"<script>
	const key = 'd';
	let a = 1, bc = 0, three = 0, dee = 0, rest = {};
	const obj = { a: 1 };
	function f() { ({ a, 'b-c': bc, 3: three, [key]: dee, ...rest } = obj); }
</script>
<button onclick={f}>{a} {bc} {three} {dee} {JSON.stringify(rest)}</button>"#;
    let out = flat(&compile_client(src));
    assert!(out.contains("$.set(bc,obj['b-c'])"), "in:\n{out}");
    assert!(out.contains("$.set(three,obj[3])"), "in:\n{out}");
    assert!(out.contains("$.set(dee,obj[key])"), "in:\n{out}");
    assert!(
        out.contains("$.set(rest,$.exclude_from_object(obj,['a','b-c','3',String(key)]))"),
        "in:\n{out}"
    );
}

#[test]
fn store_and_prop_targets_keep_their_setters_next_to_a_rest() {
    let store = r#"<script>
	import { writable } from 'svelte/store';
	const s1 = writable(0);
	let rest = {};
	const obj = { s1: 1, c: 2 };
	function f() { ({ s1: $s1, ...rest } = obj); }
</script>
<button onclick={f}>{$s1} {JSON.stringify(rest)}</button>"#;
    let out = flat(&compile_client(store));
    assert!(
        out.contains("$.store_set(s1,obj.s1),$.set(rest,$.exclude_from_object(obj,['s1']));"),
        "in:\n{out}"
    );

    let prop = r#"<script>
	export let a = 1;
	let rest = {};
	const obj = { a: 1, c: 2 };
	function f() { ({ a, ...rest } = obj); }
</script>
<button onclick={f}>{a} {JSON.stringify(rest)}</button>"#;
    let out = flat(&compile_client(prop));
    assert!(
        out.contains("a(obj.a),$.set(rest,$.exclude_from_object(obj,['a']));"),
        "in:\n{out}"
    );
}

/// A pattern default is `$.fallback(...)`, and a non-standalone destructure ends
/// the sequence with the right-hand side so the expression still has a value.
#[test]
fn defaults_and_non_standalone_destructures_match_upstream() {
    let src = r#"<script>
	let a = 1, rest = {};
	const obj = { c: 2 };
	function f() { ({ a = 5, ...rest } = obj); }
</script>
<button onclick={f}>{a} {JSON.stringify(rest)}</button>"#;
    let out = flat(&compile_client(src));
    assert!(
        out.contains("$.set(a,$.fallback(obj.a,5)),$.set(rest,$.exclude_from_object(obj,['a']));"),
        "in:\n{out}"
    );

    let src = r#"<script>
	let a = 1, rest = {};
	const obj = { a: 1, c: 2 };
	let out = null;
	function f() { out = ({ a, ...rest } = obj); }
</script>
<button onclick={f}>{a} {JSON.stringify(rest)} {JSON.stringify(out)}</button>"#;
    let out = flat(&compile_client(src));
    assert!(
        out.contains(
            "$.set(out,($.set(a,obj.a),$.set(rest,$.exclude_from_object(obj,['a'])),obj));"
        ),
        "in:\n{out}"
    );
}
