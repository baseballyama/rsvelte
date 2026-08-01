//! Regression tests for issue #2162 — a single-target destructuring
//! assignment (`({ a } = obj)`, no rest) loses its wrapping parentheses.
//!
//! Upstream's `visit_assignment_expression` (`3-transform/shared/assignments.js`)
//! always lowers a reactive destructuring assignment through
//! `b.sequence(assignments)` — a real ESTree `SequenceExpression`,
//! *unconditionally*, even for a single assignment — and esrap's
//! `SequenceExpression` printer always self-parenthesizes regardless of
//! element count, so a single-target collapse still prints as
//! `($.set(a, obj.a));`. rsvelte previously collapsed a single target to a
//! bare (non-sequence) expression, which a later reparse/print stage
//! correctly treats as a redundant, droppable paren (matching upstream's
//! *actual* behavior for a plain, user-written `(x = 1)` — those parens
//! really are dropped) — silently losing upstream's parens for the
//! destructuring case specifically.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_client(src: &str, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Comp.svelte".to_string()),
            generate: GenerateMode::Client,
            css: CssMode::External,
            dev,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

fn flat(code: &str) -> String {
    code.split_whitespace().collect::<Vec<_>>().join(" ")
}

const LEGACY_STATE_SRC: &str = r#"<script>
	let a = 1;
	const obj = { a: 1 };
	function f() {
		({ a } = obj);
	}
</script>
<button onclick={f}>{a}</button>"#;

#[test]
fn legacy_single_target_state_destructure_keeps_parens() {
    let out = flat(&compile_client(LEGACY_STATE_SRC, false));
    assert!(out.contains("($.set(a, obj.a));"), "in:\n{out}");
}

const RUNES_STATE_SRC: &str = r#"<script>
	let a = $state(1);
	const obj = { a: 1 };
	function f() {
		({ a } = obj);
	}
</script>
<button onclick={f}>{a}</button>"#;

#[test]
fn runes_single_target_state_destructure_keeps_parens() {
    let out = flat(&compile_client(RUNES_STATE_SRC, false));
    assert!(out.contains("($.set(a, obj.a, true));"), "in:\n{out}");
}

const RUNES_PROP_SRC: &str = r#"<script>
	let { foo = $bindable(1) } = $props();
	const obj = { foo: 1 };
	function f() {
		({ foo } = obj);
	}
</script>
<button onclick={f}>{foo}</button>"#;

#[test]
fn runes_single_target_prop_destructure_keeps_parens() {
    let out = flat(&compile_client(RUNES_PROP_SRC, false));
    assert!(out.contains("(foo(obj.foo));"), "in:\n{out}");
}

/// A plain, user-written redundant paren around a *non-destructuring*
/// assignment is NOT a `SequenceExpression` upstream, so it still loses its
/// parens — the destructuring case above must not overcorrect this one.
#[test]
fn plain_assignment_redundant_parens_still_drop() {
    let src = r#"<script>
	let x = 1;
	function f() {
		(x = 5);
	}
</script>
<button onclick={f}>{x}</button>"#;
    let out = flat(&compile_client(src, false));
    assert!(out.contains("$.set(x, 5);"), "in:\n{out}");
    assert!(!out.contains("($.set(x, 5));"), "in:\n{out}");
}

/// The marker text used internally to force the single-element
/// `SequenceExpression` rebuild must never leak into emitted output.
#[test]
fn marker_never_leaks_into_output() {
    for src in [LEGACY_STATE_SRC, RUNES_STATE_SRC, RUNES_PROP_SRC] {
        for dev in [false, true] {
            let out = compile_client(src, dev);
            assert!(!out.contains("rsvelte_seq"), "marker leaked in:\n{out}");
        }
    }
}

/// A multi-target destructure (real comma syntax) must keep working exactly
/// as before — it already round-trips through a genuine multi-element
/// `SequenceExpression`, so this is a no-op path for the #2162 fix.
#[test]
fn multi_target_state_destructure_is_unaffected() {
    let src = r#"<script>
	let a = 1, b = 2, rest = {};
	const obj = { a: 1, b: 2, c: 3 };
	function f() { ({ a, b, ...rest } = obj); }
</script>
<button onclick={f}>{a} {b} {JSON.stringify(rest)}</button>"#;
    let out = flat(&compile_client(src, false));
    assert!(
        out.contains(
            "( $.set(a, obj.a), $.set(b, obj.b), $.set(rest, $.exclude_from_object(obj, ['a', 'b'])) );"
        ),
        "in:\n{out}"
    );
}
