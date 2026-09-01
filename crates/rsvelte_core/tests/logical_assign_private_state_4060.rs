//! A logical compound assignment to a private `$state` field, in a class whose
//! members carry JSDoc.
//!
//! `#4060`: `compileModule` lowered `this.#promise ??= this.#run()` to
//! `$.get(this.#promise) ??= this.#run()` — the read wrap landed on the
//! assignment target, so the output assigned into a call expression and no JS
//! parser accepted it. Rolldown rejected it with "Cannot assign to this
//! expression", which failed `vite build` for every SvelteKit app importing the
//! remote-functions runtime.
//!
//! Upstream splits the logical compounds in `AssignmentExpression.js`: the
//! operator short-circuits around the whole `$.set`, so the setter runs only
//! when it assigns.
//!
//! The trigger is the JSDoc on the surrounding members, not the assignment —
//! delete those comment blocks and the same class compiles correctly, which is
//! why the repro is a measured reduction of the real Kit file rather than a
//! hand-written snippet. Reducing it under a predicate that only demanded one
//! invalid line deleted two of the three operators and the control, so the
//! predicate this file was reduced under required all four to survive.
//!
//! Both directions are pinned. A test that only asserted the absence of
//! `$.get(...) ??=` is satisfied by never rewriting anything, so each target
//! also asserts the form that must be produced, and the public `$state.raw`
//! field — which upstream leaves as a compound assignment through its accessor
//! pair, and which was already correct when the private fields were not — is
//! the in-file control.

use rsvelte_core::{GenerateMode, ModuleCompileOptions, compile_module};

const SRC: &str = include_str!(
    "../../../compatibility/pattern-corpus/issues/4060-logical-assign-private-state-jsdoc-members.svelte.js"
);

fn module(generate: GenerateMode, dev: bool) -> String {
    compile_module(
        SRC,
        ModuleCompileOptions {
            filename: Some("instance.svelte.js".into()),
            generate,
            dev,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

/// Every `<op>=` this file exercises, in the form a private-field lowering must
/// never emit: the read wrap on the left of a compound assignment.
const INVALID: [&str; 3] = [
    "$.get(this.#promise) ??=",
    "$.get(this.#or) ||=",
    "$.get(this.#and) &&=",
];

#[test]
fn a_logical_compound_on_a_private_state_field_splits_into_a_short_circuit() {
    for (label, dev) in [("client", false), ("client-dev", true)] {
        let out = module(GenerateMode::Client, dev);
        assert!(!out.contains("COMPILE_ERROR"), "{label}: {out}");

        for (op, expected) in [
            // `$state.raw` — no proxy flag, because only `$state` proxies.
            (
                "??=",
                "void untrack(() => $.get(this.#promise) ?? $.set(this.#promise, this.#run()));",
            ),
            (
                "||=",
                "void untrack(() => $.get(this.#or) || $.set(this.#or, this.#run()));",
            ),
            // `$state` under a non-coercive operator, so the value is proxied.
            (
                "&&=",
                "void untrack(() => $.get(this.#and) && $.set(this.#and, this.#run(), true));",
            ),
        ] {
            assert!(
                out.contains(expected),
                "{label}: `{op}` on a private state field did not split into a \
                 short-circuited `$.set`; expected\n  {expected}\ngot\n{out}"
            );
        }

        for invalid in INVALID {
            assert!(
                !out.contains(invalid),
                "{label}: emitted `{invalid}` — a compound assignment into a call \
                 expression, which is not JavaScript:\n{out}"
            );
        }
    }
}

#[test]
fn a_public_state_field_keeps_its_compound_assignment() {
    // The control. A public field is reached through the accessor pair upstream
    // generates, so its compound assignment is left alone on every target — and
    // it was already correct while the private fields above were not, so it
    // separates "the lowering was fixed" from "the lowering stopped running".
    for (label, out) in [
        ("client", module(GenerateMode::Client, false)),
        ("client-dev", module(GenerateMode::Client, true)),
        ("server", module(GenerateMode::Server, false)),
    ] {
        assert!(!out.contains("COMPILE_ERROR"), "{label}: {out}");
        // Substring, not the whole statement: whether the arrow body keeps the
        // source's parentheses is decided by the sibling private-field rewrites,
        // so pinning them here would make this control move with the defect it
        // exists to stay still for. Byte-exactness is the corpus gate's job.
        assert!(
            out.contains("this.plain ??= this.#run()"),
            "{label}: the public field's compound assignment was rewritten:\n{out}"
        );
    }
}

#[test]
fn the_server_target_leaves_every_private_compound_untouched() {
    // The second control: the server never wraps a read, so the source form
    // survives verbatim. Asserting only the absence of `$.get(...) ??=` here
    // would pass on an empty output.
    let out = module(GenerateMode::Server, false);
    assert!(!out.contains("COMPILE_ERROR"), "server: {out}");

    for expected in [
        "void untrack(() => this.#promise ??= this.#run());",
        "void untrack(() => this.#or ||= this.#run());",
        "void untrack(() => this.#and &&= this.#run());",
    ] {
        assert!(
            out.contains(expected),
            "server: expected\n  {expected}\ngot\n{out}"
        );
    }
    assert!(
        !out.contains("$.set("),
        "server: emitted a client setter:\n{out}"
    );
}
