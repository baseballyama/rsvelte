//! Upstream's `AssignmentExpression` visitor is one entry in the client visitor
//! map, so a module script reaches the same `$.assign` rule as an instance one:
//! `dev && path.at(-1) !== 'ExpressionStatement' && is_non_coercive_operator(op)
//! && !scope.evaluate(right).is_primitive`, with a `MemberExpression` left whose
//! root resolves to a binding (`AssignmentExpression.js:189-193`, `:117`).
//!
//! rsvelte ran that collector only over a settled *instance* script, so every
//! module script emitted a bare assignment. Three entry points share the code —
//! `.svelte.js`, `.svelte.ts` and a component's `<script module>`, the last of
//! which is `compile()` rather than `compileModule()` — and a fix that reaches
//! one leaves the others green, so there is one cell per entry point.
//!
//! The controls are the four conditions of that guard plus the root's binding.
//! Removing the binding check alone makes every `global root` row emit
//! `$.assign(globalThis, …)`, measured on all three entry points.
//!
//! Every expectation is the official compiler's own output for the same source.

use rsvelte_core::{CompileOptions, GenerateMode, ModuleCompileOptions, compile, compile_module};

fn assigns(code: &str) -> Vec<String> {
    code.lines()
        .filter(|line| line.contains("$.assign"))
        .map(|line| line.trim().to_string())
        .collect()
}

fn module(filename: &str, source: &str) -> Vec<String> {
    let out = compile_module(
        source,
        ModuleCompileOptions {
            filename: Some(filename.to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .unwrap_or_else(|err| panic!("{filename}: {err:?}"));
    assigns(&out.js.code)
}

fn component(source: &str) -> Vec<String> {
    let out = compile(
        source,
        CompileOptions {
            filename: Some("C.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .unwrap_or_else(|err| panic!("{source}: {err:?}"));
    assigns(&out.js.code)
}

/// One cell per entry point. `<script module>` is the one that is not
/// `compileModule` at all, which is why its position is the `.svelte` file's.
#[test]
fn all_three_module_entry_points_wrap_a_member_assignment_in_value_position() {
    assert_eq!(
        module(
            "M.svelte.js",
            "export function f(o) { return (o.q = {}); }\n"
        ),
        ["return $.assign(o, 'q', '=', {}, 'M.svelte.js:1:31');"]
    );
    assert_eq!(
        module(
            "M.svelte.ts",
            "export function f(o) { return (o.q = {}); }\n"
        ),
        ["return $.assign(o, 'q', '=', {}, 'M.svelte.ts:1:31');"]
    );
    assert_eq!(
        component(
            "<script module>\nexport function f(o) { return (o.q = {}); }\n</script>\n<p>x</p>\n"
        ),
        ["return $.assign(o, 'q', '=', {}, 'C.svelte:2:31');"]
    );
}

/// A module's top level is not exempt. This row exists because a grid that held
/// the right-hand side at a literal reported it as `0` on both sides — the
/// primitive test, not the position, is what silences that shape.
#[test]
fn a_module_top_level_assignment_in_value_position_is_wrapped_too() {
    assert_eq!(
        module(
            "M.svelte.js",
            "const o = {};\nexport const z = (o.q = {});\n"
        ),
        ["export const z = $.assign(o, 'q', '=', {}, 'M.svelte.js:2:18');"]
    );
}

/// The computed-key form takes the property expression rather than a string
/// literal, so it is a separate branch of the same builder.
#[test]
fn a_computed_member_passes_its_key_expression() {
    assert_eq!(
        module(
            "M.svelte.js",
            "export function f(o, k) { return (o[k] = {}); }\n"
        ),
        ["return $.assign(o, k, '=', {}, 'M.svelte.js:1:34');"]
    );
}

/// Each condition of upstream's guard, one row each: a whole-statement
/// assignment, a primitive value, and a coercing operator are all left alone.
/// A pass added without them wraps all three.
#[test]
fn each_condition_of_the_guard_still_silences_the_wrap() {
    let empty: [String; 0] = [];
    assert_eq!(
        module("M.svelte.js", "export function f(o) { o.q = {}; }\n"),
        empty
    );
    assert_eq!(
        module(
            "M.svelte.js",
            "export function f(o) { return (o.q = 1); }\n"
        ),
        empty
    );
    assert_eq!(
        module(
            "M.svelte.js",
            "export function f(o) { return (o.q += {}); }\n"
        ),
        empty
    );
}

/// Upstream's `if (!binding) return null`: a chain rooted at a global is not
/// instrumented. This is the row that fails when the resolution guard is
/// dropped — measured, dropping it emits `$.assign(globalThis, 'q', …)` on every
/// entry point, which is why the module pass passes an EMPTY set of component
/// bindings rather than no guard: a module's whole program is the fragment, so
/// its own resolver already answers for every name it declares.
#[test]
fn a_chain_rooted_at_a_global_is_not_instrumented_in_a_module() {
    let empty: [String; 0] = [];
    assert_eq!(
        module(
            "M.svelte.js",
            "export function f() { return (globalThis.q = {}); }\n"
        ),
        empty
    );
    assert_eq!(
        component(
            "<script module>\nexport function f() { return (globalThis.q = {}); }\n</script>\n<p>x</p>\n"
        ),
        empty
    );
}
