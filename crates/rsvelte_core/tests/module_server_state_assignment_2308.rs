//! `compileModule(generate: 'server')` must leave assignments to `$state`
//! bindings verbatim — the server has no signals, so `runs = runs + 1` stays
//! `runs = runs + 1` and is never contracted to `runs += 1`.

use rsvelte_core::GenerateMode;
use rsvelte_core::compile_module;
use rsvelte_core::compiler::ModuleCompileOptions;

fn compile_mod_server(src: &str) -> String {
    let result = compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("in.svelte.js".to_string()),
            generate: GenerateMode::Server,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile_module");
    result.js.code
}

#[test]
fn plain_assignment_to_state_is_not_contracted() {
    let src = r#"export function t() {
	let runs = $state(0);
	let plain = 0;
	function f() {
		runs = runs + 1;
		plain = plain + 1;
		runs = runs - 2;
		runs = 1 + runs;
	}
	return f;
}
"#;
    let out = compile_mod_server(src);

    assert!(
        out.contains("runs = runs + 1"),
        "`runs = runs + 1` must stay verbatim. Got:\n{out}"
    );
    assert!(
        out.contains("runs = runs - 2"),
        "`runs = runs - 2` must stay verbatim. Got:\n{out}"
    );
    // Negative controls: the non-state binding and the right-operand form were
    // already correct and must not move.
    assert!(
        out.contains("plain = plain + 1"),
        "`plain = plain + 1` must stay verbatim. Got:\n{out}"
    );
    assert!(
        out.contains("runs = 1 + runs"),
        "`runs = 1 + runs` must stay verbatim. Got:\n{out}"
    );
    assert!(
        !out.contains("+=") && !out.contains("-="),
        "no assignment may be contracted. Got:\n{out}"
    );
    // No client signal plumbing may survive on the server module path.
    assert!(
        !out.contains("$.set(") && !out.contains("$.get("),
        "server modules must not emit `$.set` / `$.get` for state. Got:\n{out}"
    );
}

/// Regression pin, not a repro: this shape was already green before the fix,
/// because the client transform's `$.set` folded straight back to a compound
/// assignment. It only guards against the fix over-reaching in the other
/// direction.
#[test]
fn genuine_compound_assignment_to_state_is_preserved() {
    let src = r#"export function t() {
	let runs = $state(0);
	function f() {
		runs += 1;
		runs *= 2;
	}
	return f;
}
"#;
    let out = compile_mod_server(src);
    assert!(
        out.contains("runs += 1"),
        "`runs += 1` must stay verbatim. Got:\n{out}"
    );
    assert!(
        out.contains("runs *= 2"),
        "`runs *= 2` must stay verbatim. Got:\n{out}"
    );
}

// The pre-pass rewrites every unshadowed `$state` / `$state.raw` / `$state.eager`
// call, not only declarator initialisers — upstream's server `CallExpression`
// visitor does the same. The tests below fix the edges of that reach. Only
// `state_raw_and_state_eager_lower_like_state` fails before the fix; the rest
// are pins against over-reach and are green on both sides.

/// Pin: `$state.snapshot` is a member callee the pre-pass must not match.
#[test]
fn state_snapshot_is_not_stripped() {
    let src = r#"export function s() {
	let a = $state({ x: 1 });
	function snap() { return $state.snapshot(a); }
	return snap;
}
"#;
    let out = compile_mod_server(src);
    assert!(
        out.contains("$.snapshot(a)"),
        "`$state.snapshot` must lower to `$.snapshot`, not be stripped. Got:\n{out}"
    );
    assert!(
        out.contains("let a = { x: 1 }"),
        "the `$state` declarator must still lower. Got:\n{out}"
    );
}

/// Repro: `$state.eager(0)` was emitted verbatim on the server before the fix —
/// a call to an undefined `$state`.
#[test]
fn state_raw_and_state_eager_lower_like_state() {
    let src = r#"export function s() {
	let raw = $state.raw({ a: 1 });
	let eager = $state.eager(0);
	function f() {
		raw = { a: 2 };
		eager = eager + 1;
	}
	return f;
}
"#;
    let out = compile_mod_server(src);
    assert!(
        out.contains("let raw = { a: 1 }") && out.contains("let eager = 0"),
        "`$state.raw` / `$state.eager` must lower to the bare initializer. Got:\n{out}"
    );
    assert!(
        out.contains("eager = eager + 1"),
        "a plain assignment to `$state.eager` must stay verbatim. Got:\n{out}"
    );
    assert!(
        !out.contains("$state."),
        "no `$state.*` call may survive. Got:\n{out}"
    );
}

/// Pin: class fields are pre-lowered earlier, so the new pass must be a no-op here.
#[test]
fn class_field_state_still_lowers_to_a_plain_field() {
    let src = r#"export class Box {
	value = $state(0);
	bump() { this.value = this.value + 1; }
}
"#;
    let out = compile_mod_server(src);
    assert!(
        out.contains("value = 0"),
        "a class `$state` field must lower to a plain public field. Got:\n{out}"
    );
    assert!(
        out.contains("this.value = this.value + 1"),
        "the field assignment must stay verbatim. Got:\n{out}"
    );
    assert!(
        !out.contains("#value"),
        "the server must not privatize the field. Got:\n{out}"
    );
}

/// Pin: `$derived` keeps its signal on the server, so lowering `$state` around
/// it must not disturb the wrapping.
#[test]
fn derived_reading_a_state_binding_still_wraps() {
    let src = r#"export function s() {
	let a = $state(1);
	let b = $derived(a * 2);
	return () => b;
}
"#;
    let out = compile_mod_server(src);
    assert!(
        out.contains("let a = 1"),
        "the `$state` binding must lower to a plain variable. Got:\n{out}"
    );
    assert!(
        out.contains("$.derived(() => a * 2)"),
        "`$derived` must still wrap, reading the now-plain `a`. Got:\n{out}"
    );
}
