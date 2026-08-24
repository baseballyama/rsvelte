//! Regression tests for issue #2467 — a private `$state` field written through a
//! receiver other than `this` (`const inst = this; inst.#n …`) inside a class
//! **constructor**.
//!
//! Upstream keys the private-field path off `PrivateIdentifier`, never off the
//! receiver — `AssignmentExpression.js:81` tests
//! `left.property.type === 'PrivateIdentifier'` and `MemberExpression.js:11` the
//! same — so `inst.#n` must compile exactly like `this.#n`. rsvelte handled the
//! two receivers in different code, and the non-`this` side modelled less. Each
//! gap gets its own test so a partial regression is attributable:
//!
//!   1. `logical_and_shift_*` — logical (`??= &&= ||=`) and bitwise/shift
//!      compounds were in neither allowlist, so the assignment was never
//!      rewritten and the read-wrapping pass turned the *left-hand side* into a
//!      call, emitting the unparseable `$.get(inst.#n) ??= s`.
//!   2. `plain_assignment_keeps_the_proxy_flag` — the `, true` proxy flag was
//!      never emitted for a non-`this` receiver. This one is silent: the output
//!      parses and runs, it just loses proxying.
//!   3. `constructor_reads_use_dot_v` — reads went through `$.get` where
//!      upstream uses `.v` while `in_constructor`.
//!
//! Expectations are the official compiler's own bytes, obtained by compiling the
//! same source with `submodules/svelte`.

use rsvelte_core::compiler::ModuleCompileOptions;
use rsvelte_core::{GenerateMode, compile_module};

fn client(src: &str) -> String {
    compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("A.svelte.js".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile_module should succeed")
    .js
    .code
}

fn assert_has(out: &str, needle: &str) {
    assert!(out.contains(needle), "expected `{needle}` in:\n{out}");
}

/// The output has to actually parse. A bracket-balance check would not catch
/// `$.get(q) ??= s`, which is balanced but assigns to a call expression.
fn assert_parses(out: &str) {
    if let Err(e) = rsvelte_ast_equiv::canonicalize(out) {
        panic!("emitted module does not parse ({e:?}):\n{out}");
    }
}

// ── gap 1: the parse failure ────────────────────────────────────────────────

const LOGICAL_AND_SHIFT: &str = "export class R {
	#x = $state.raw({});
	#n = $state(0);
	#d = $derived(this.#n * 2);

	constructor(s) {
		const inst = this;
		inst.#n ??= s;
		inst.#n &&= s;
		inst.#n ||= s;
		inst.#x ??= s;
		inst.#d ??= s;
		inst.#n <<= 2;
	}
}
";

#[test]
fn logical_and_shift_compounds_are_rewritten_not_left_as_assignment_targets() {
    let out = client(LOGICAL_AND_SHIFT);
    assert_parses(&out);
    assert!(
        !out.contains("$.get(inst.#n) ??="),
        "the LHS must not be rewritten into a call expression:\n{out}"
    );
    assert_has(&out, "inst.#n.v ?? $.set(inst.#n, s, true);");
    assert_has(&out, "inst.#n.v && $.set(inst.#n, s, true);");
    assert_has(&out, "inst.#n.v || $.set(inst.#n, s, true);");
    assert_has(&out, "$.set(inst.#n, inst.#n.v << 2);");
}

#[test]
fn logical_compound_proxies_only_for_plain_state() {
    // Same gate as `this`: `$state.raw` and `$derived` must not carry `, true`,
    // and a `$derived` field reads through `$.get` even in a constructor.
    let out = client(LOGICAL_AND_SHIFT);
    assert_has(&out, "inst.#x.v ?? $.set(inst.#x, s);");
    assert_has(&out, "$.get(inst.#d) ?? $.set(inst.#d, s);");
}

// ── gap 2: the silent proxy loss ────────────────────────────────────────────

#[test]
fn plain_assignment_keeps_the_proxy_flag() {
    // The quiet one: this output parsed and ran before the fix, it just dropped
    // proxying, so no gate that only checks parseability would have caught it.
    let out = client(
        "export class R {
	#x = $state.raw({});
	#n = $state(0);

	constructor(s) {
		const inst = this;
		inst.#n = { a: s };
		inst.#x = { a: s };
		inst.#n = 5;
	}
}
",
    );
    assert_has(&out, "$.set(inst.#n, { a: s }, true);");
    // `$state.raw` never proxies, and a primitive RHS is not proxy-able.
    assert_has(&out, "$.set(inst.#x, { a: s });");
    assert_has(&out, "$.set(inst.#n, 5);");
}

// ── gap 3: the in-constructor read form ─────────────────────────────────────

#[test]
fn constructor_reads_use_dot_v() {
    let out = client(
        "export class R {
	#x = $state.raw({});
	#n = $state(0);

	constructor(s) {
		const inst = this;
		inst.#n += 1;
		const a = inst.#n;
		const b = inst.#x.foo;
		const c = inst.#n?.bar;
		log(inst.#n);
	}
}
",
    );
    assert_has(&out, "$.set(inst.#n, inst.#n.v + 1);");
    assert_has(&out, "const a = inst.#n.v;");
    assert_has(&out, "const b = inst.#x.v.foo;");
    assert_has(&out, "const c = inst.#n.v?.bar;");
    assert_has(&out, "log(inst.#n.v);");
}

// ── controls: these must NOT change ─────────────────────────────────────────

#[test]
fn method_bodies_still_read_through_get() {
    // `.v` is `in_constructor`-only. This control passes on `origin/main`, so it
    // fails only if a fix is applied too widely.
    let out = client(
        "export class R {
	#n = $state(0);

	m(s) {
		const inst = this;
		inst.#n += 1;
		inst.#n ??= s;
		inst.#n = { a: s };
		const a = inst.#n;
	}
}
",
    );
    assert_has(&out, "$.set(inst.#n, $.get(inst.#n) + 1);");
    assert_has(&out, "$.get(inst.#n) ?? $.set(inst.#n, s, true);");
    assert_has(&out, "$.set(inst.#n, { a: s }, true);");
    assert_has(&out, "const a = $.get(inst.#n);");
}

#[test]
fn a_function_nested_in_the_constructor_reads_through_get() {
    // Upstream `shared/function.js` clears `in_constructor` on entry to any
    // nested function, so `.v` must not leak into a callback.
    let out = client(
        "export class R {
	#n = $state(0);

	constructor(s) {
		const inst = this;
		inst.#n += 1;
		setTimeout(() => {
			inst.#n += 2;
			inst.#n ??= s;
			const a = inst.#n;
		});
	}
}
",
    );
    assert_has(&out, "$.set(inst.#n, inst.#n.v + 1);");
    assert_has(&out, "$.set(inst.#n, $.get(inst.#n) + 2);");
    assert_has(&out, "$.get(inst.#n) ?? $.set(inst.#n, s, true);");
    assert_has(&out, "const a = $.get(inst.#n);");
}

#[test]
fn a_plain_block_in_the_constructor_still_reads_dot_v() {
    // An `if` / `for` body is not a function and keeps `in_constructor`.
    let out = client(
        "export class R {
	#n = $state(0);

	constructor(s) {
		const inst = this;
		if (s) {
			inst.#n += 1;
		}
		for (const q of s) {
			inst.#n <<= 1;
		}
	}
}
",
    );
    assert_has(&out, "$.set(inst.#n, inst.#n.v + 1);");
    assert_has(&out, "$.set(inst.#n, inst.#n.v << 1);");
}

#[test]
fn a_constructor_declared_field_keeps_its_initializer() {
    // The `this.#c = $state(0)` initializer must stay an initializer and must
    // not be wrapped into `$.set(this.#c, $.state(0))`, while writes through an
    // alias are still rewritten.
    let out = client(
        "export class R {
	#c;
	#n = $state(0);

	constructor(s) {
		this.#c = $state(0);
		const inst = this;
		inst.#c += 2;
	}
}
",
    );
    assert_parses(&out);
    assert_has(&out, "this.#c = $.state(0);");
    assert!(
        !out.contains("$.set(this.#c, $.state("),
        "the initializer must not be wrapped:\n{out}"
    );
    assert_has(&out, "$.set(inst.#c, inst.#c.v + 2);");
}
