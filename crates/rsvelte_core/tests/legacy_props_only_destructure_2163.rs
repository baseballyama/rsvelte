//! Regression tests for issue #2163 — a legacy destructuring *assignment* whose
//! targets are only props.
//!
//! Upstream's `visit_assignment_expression`
//! (`3-transform/shared/assignments.js`) routes every path returned by
//! `extract_paths` through the ordinary assignment lowering, so a prop target
//! (`a = …` → `a(…)`) makes the destructure just as much a candidate for the
//! sequence / IIFE expansion as a `$state` or store target. rsvelte only counted
//! state and store targets, so a props-only pattern was left verbatim and the
//! prop-read pass then wrapped the pattern's binding positions
//! (`({ a(), b() } = obj)`, not even valid JavaScript).

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

/// Collapse the sequence expression the printer spreads over several lines so a
/// single `assert!` can pin the whole lowering.
fn flat(code: &str) -> String {
    code.split_whitespace().collect::<Vec<_>>().join(" ")
}

#[test]
fn object_pattern_of_props_becomes_a_sequence_of_setter_calls() {
    let src = r#"<script>
	export let a = 1;
	export let b = 2;
	const obj = { a: 3, b: 4 };
	function f() { ({ a, b } = obj); }
</script>
<button onclick={f}>{a} {b}</button>"#;
    let out = flat(&compile_client(src));
    assert!(out.contains("a(obj.a), b(obj.b);"), "in:\n{out}");
    assert!(!out.contains("} = obj"), "in:\n{out}");
}

#[test]
fn array_pattern_of_props_uses_the_to_array_iife() {
    let src = r#"<script>
	export let a = 1;
	export let b = 2;
	const arr = [3, 4];
	function f() { [a, b] = arr; }
</script>
<button onclick={f}>{a} {b}</button>"#;
    let out = flat(&compile_client(src));
    assert!(
        out.contains(
            "((arr) => { var $$array = $.to_array(arr, 2); a($$array[0]); b($$array[1]); })(arr);"
        ),
        "in:\n{out}"
    );
}

/// A rest target is an ordinary extracted path, so a props-only pattern with a
/// rest still stays a plain sequence.
#[test]
fn rest_target_of_a_props_only_pattern_keeps_the_sequence() {
    let src = r#"<script>
	export let a = 1;
	export let rest = {};
	const obj = { a: 3, b: 4 };
	function f() { ({ a, ...rest } = obj); }
</script>
<button onclick={f}>{a} {JSON.stringify(rest)}</button>"#;
    let out = flat(&compile_client(src));
    assert!(
        out.contains("a(obj.a), rest($.exclude_from_object(obj, ['a']));"),
        "in:\n{out}"
    );
}

/// Literal / numeric / computed keys and pattern defaults go through the same
/// shared helpers the state path uses.
#[test]
fn literal_computed_keys_and_defaults_of_props_only_patterns() {
    let src = r#"<script>
	const key = 'd';
	export let a = 1;
	export let bc = 0;
	export let three = 0;
	export let dee = 0;
	const obj = { a: 1 };
	function f() { ({ a = 5, 'b-c': bc, 3: three, [key]: dee } = obj); }
</script>
<button onclick={f}>{a} {bc} {three} {dee}</button>"#;
    let out = flat(&compile_client(src));
    assert!(out.contains("a($.fallback(obj.a, 5))"), "in:\n{out}");
    assert!(out.contains("bc(obj['b-c'])"), "in:\n{out}");
    assert!(out.contains("three(obj[3])"), "in:\n{out}");
    assert!(out.contains("dee(obj[key])"), "in:\n{out}");
}

/// A props-only destructure in a `$:` statement takes the same expansion.
#[test]
fn props_only_destructure_in_a_reactive_statement() {
    let src = r#"<script>
	export let a = 1;
	export let b = 2;
	export let src = { a: 3, b: 4 };
	$: ({ a, b } = src);
</script>
<p>{a} {b}</p>"#;
    let out = flat(&compile_client(src));
    // `src` is a prop, so the visited right-hand side is a call — upstream then
    // caches it in `$$value`.
    assert!(
        out.contains("(($$value) => { a($$value.a); b($$value.b); })(src());"),
        "in:\n{out}"
    );
}

/// Mixing a prop target with a `$state` one keeps both lowerings side by side.
#[test]
fn mixed_prop_and_state_targets_are_both_lowered() {
    let src = r#"<script>
	export let a = 1;
	let s = 0;
	const obj = { a: 3, s: 4 };
	function f() { ({ a, s } = obj); }
</script>
<button onclick={f}>{a} {s}</button>"#;
    let out = flat(&compile_client(src));
    assert!(out.contains("a(obj.a), $.set(s, obj.s);"), "in:\n{out}");
}
