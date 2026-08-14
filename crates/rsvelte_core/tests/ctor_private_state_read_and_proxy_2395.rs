//! Regression tests for issue #2395 — a `$.set` injected for a `#private`
//! `$state` field inside a **constructor** got two things wrong:
//!
//!   * a logical assignment (`??= ||= &&=`) always appended the `, true` proxy
//!     flag, even for a `$state.raw` / `$derived` field. Upstream
//!     `AssignmentExpression.js` gates it on `field.type === '$state'`.
//!   * a compound assignment read the operand as `$.get(this.#n)`. Upstream
//!     `MemberExpression.js` reads a `$state` / `$state.raw` field as
//!     `this.#n.v` while `in_constructor`, and only falls back to `$.get`
//!     outside a constructor (or for a `$derived` field).
//!
//! Expectations pin the same lowering semantics as the official compiler.

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

const MIXED_FIELDS: &str = "export class R {
	#x = $state.raw({});
	#n = $state(0);
	#d = $derived(this.#n * 2);

	constructor(s) {
		this.#x ??= { a: s };
		this.#n ??= { a: s };
		this.#d ??= s;
		this.#x += 1;
		this.#n += 1;
		this.#n <<= 2;
	}

	m(s) {
		this.#x ??= { a: s };
		this.#n ??= { a: s };
		this.#x += 1;
		this.#n += 1;
		this.#n <<= 2;
	}
}
";

#[test]
fn constructor_logical_assignment_proxies_only_for_plain_state() {
    let out = client(MIXED_FIELDS);
    assert_has(&out, "$.set(this.#x, this.#x.v ?? { a: s });");
    assert_has(&out, "$.set(this.#n, this.#n.v ?? { a: s }, true);");
    assert_has(&out, "$.set(this.#d, $.get(this.#d) ?? s);");
}

#[test]
fn constructor_compound_assignment_reads_dot_v() {
    let out = client(MIXED_FIELDS);
    assert_has(&out, "$.set(this.#x, this.#x.v + 1);");
    assert_has(&out, "$.set(this.#n, this.#n.v + 1);");
    assert_has(&out, "$.set(this.#n, this.#n.v << 2);");
}

#[test]
fn method_bodies_still_read_through_get() {
    // `.v` is `in_constructor`-only: outside one, upstream keeps `$.get`.
    let out = client(MIXED_FIELDS);
    assert_has(&out, "$.set(this.#x, $.get(this.#x) ?? { a: s });");
    assert_has(&out, "$.set(this.#n, $.get(this.#n) ?? { a: s }, true);");
    assert_has(&out, "$.set(this.#x, $.get(this.#x) + 1);");
    assert_has(&out, "$.set(this.#n, $.get(this.#n) + 1);");
    assert_has(&out, "$.set(this.#n, $.get(this.#n) << 2);");
}

#[test]
fn a_function_nested_in_the_constructor_reads_through_get() {
    // Upstream `shared/function.js` clears `in_constructor` on entry to any
    // nested function, so `.v` must not leak into a callback body.
    let out = client(
        "export class R {
	#n = $state(0);

	constructor(s) {
		this.#n += 1;
		setTimeout(() => {
			this.#n += 2;
			this.#n ??= s;
		});
	}
}
",
    );
    assert_has(&out, "$.set(this.#n, this.#n.v + 1);");
    assert_has(&out, "$.set(this.#n, $.get(this.#n) + 2);");
    assert_has(&out, "$.set(this.#n, $.get(this.#n) ?? s, true);");
}

#[test]
fn a_plain_block_in_the_constructor_still_reads_dot_v() {
    // Only a *function* clears `in_constructor` — an `if` / `for` body does not.
    let out = client(
        "export class R {
	#n = $state(0);

	constructor(s) {
		if (s) {
			this.#n += 1;
		}
		for (const q of s) {
			this.#n <<= 1;
		}
	}
}
",
    );
    assert_has(&out, "$.set(this.#n, this.#n.v + 1);");
    assert_has(&out, "$.set(this.#n, this.#n.v << 1);");
}

#[test]
fn the_reported_repro_matches_official_semantics() {
    let out = client(
        "export class R {
	#x = $state.raw({});
	#n = $state(0);

	constructor(s) {
		this.#x ??= { a: s, b: s };
		this.#n += 1;
	}
}
",
    );
    assert_has(&out, "$.set(this.#x, this.#x.v ?? {");
    assert_has(&out, "a: s,");
    assert_has(&out, "b: s");
    assert_has(&out, "$.set(this.#n, this.#n.v + 1);");
    assert!(
        !out.contains("{ a: s, b: s }, true"),
        "a `$state.raw` logical assignment must not carry the proxy flag:\n{out}"
    );
    assert!(
        !out.contains("$.get(this.#n) + 1"),
        "a constructor compound read must not go through `$.get`:\n{out}"
    );
}
