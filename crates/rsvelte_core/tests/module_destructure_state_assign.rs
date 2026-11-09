//! Regression tests for destructuring assignments to `$state` variables in
//! `compileModule(generate:'client')` — issue baseballyama/rsvelte#1438.
//!
//! The module (`.svelte.js`) client path previously handled only line-leading
//! *array* destructures (`[a, b] = expr`) via a fragile text handler, so an
//! object-pattern destructure — or an array destructure inside a function body
//! — was left untransformed. The read-wrap pass then wrapped the pattern's LHS
//! identifiers as `$.get(name)`, producing invalid targets such as
//! `({ issues: $.get(raw_issues) = [] } = …)` ("Cannot assign to this
//! expression"), which broke `vite build` for SvelteKit remote functions
//! (`@sveltejs/kit`'s `form.svelte.js`).
//!
//! The module path now reuses the same AST-faithful
//! `transform_destructure_assignments` the instance-script path uses (run on
//! the raw source before read-wrapping), mirroring upstream
//! `visit_assignment_expression` in `shared/assignments.js`.

use rsvelte_core::GenerateMode;
use rsvelte_core::compile_module;
use rsvelte_core::compiler::ModuleCompileOptions;

fn compile_mod_client(src: &str) -> String {
    compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("in.svelte.js".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile_module")
    .js
    .code
}

#[test]
fn object_pattern_with_default_lowers_to_set() {
    // Mirrors @sveltejs/kit form.svelte.js.
    let src = r#"let raw_issues = $state([]);
let result = $state(undefined);
export function apply(response) {
  ({ issues: raw_issues = [], result } = response._ ?? {});
}
"#;
    let out = compile_mod_client(src);
    assert!(
        out.contains("$.set(raw_issues, $.fallback($$value.issues, () => [], true), true)"),
        "object destructure default must lower to $.set + $.fallback. Got:\n{out}"
    );
    assert!(
        out.contains("$.set(result, $$value.result, true)"),
        "object destructure shorthand must lower to $.set. Got:\n{out}"
    );
    // The invalid read-wrapped assignment target must be gone.
    assert!(
        !out.contains("$.get(raw_issues) ="),
        "invalid `$.get(...)` assignment target remains:\n{out}"
    );
}

#[test]
fn array_pattern_inside_function_body_lowers_to_set() {
    // The old line-leading text handler missed mid-line array destructures.
    // The RHS is a plain identifier (`a`), so upstream uses it verbatim as the
    // IIFE parameter / `$.to_array` base (`should_cache = false`) rather than a
    // cached `$$value`.
    let src = r#"let count = $state(0);
let obj = $state({ a: 1 });
export function arr(a) { [count, obj] = a; }
"#;
    let out = compile_mod_client(src);
    assert!(
        out.contains("((a) => {") && out.contains("$.to_array(a, 2)"),
        "identifier RHS must name the IIFE param after the RHS. Got:\n{out}"
    );
    assert!(
        out.contains("$.set(count, $$array[0], true)")
            && out.contains("$.set(obj, $$array[1], true)"),
        "array destructure targets must lower to $.set. Got:\n{out}"
    );
    assert!(
        !out.contains("[$.get(count)"),
        "invalid `$.get(...)` array assignment target remains:\n{out}"
    );
}

#[test]
fn non_identifier_rhs_caches_in_dollar_value() {
    // A non-identifier RHS (`should_cache = true`) is cached in `$$value`.
    let src = r#"let count = $state(0);
let obj = $state({ a: 1 });
export function arr(o) { [count, obj] = o.pair ?? []; }
"#;
    let out = compile_mod_client(src);
    assert!(
        out.contains("(($$value) => {") && out.contains("$.to_array($$value, 2)"),
        "non-identifier RHS must cache in `$$value`. Got:\n{out}"
    );
}

#[test]
fn array_temp_counter_starts_at_zero() {
    // `$$array` (not `$$array_1`) for the first array pattern — the per-compile
    // counter must be reset in the module path too.
    let src = r#"let b = $state(0);
export function f(o) { [b] = o; }
"#;
    let out = compile_mod_client(src);
    assert!(
        out.contains("var $$array = $.to_array"),
        "first `$$array` temp must not be suffixed. Got:\n{out}"
    );
    assert!(
        !out.contains("$$array_1"),
        "counter leaked from a prior compile:\n{out}"
    );
}

// Expected lines are upstream's `compileModule` output for the same input.
#[test]
fn destructured_state_declarator_uses_are_signals() {
    let out = compile_mod_client(
        "let { a, b } = $state({ a: 1, b: 2 });\nb = 5;\nexport const sum = () => a + b;\n",
    );
    assert!(out.contains("$.set(b, 5);"), "{out}");
    assert!(
        out.contains("export const sum = () => a + $.get(b);"),
        "{out}"
    );

    let out = compile_mod_client(
        "let [x, y] = $state.raw([1, 2]);\nexport function f() { y = [9]; return y; }\n",
    );
    assert!(out.contains("$.set(y, [9]);"), "{out}");
    assert!(out.contains("return $.get(y);"), "{out}");

    let out = compile_mod_client(
        "let [x, y] = $state([1, 2]);\nexport function f(y) { y = 2; return y; }\nexport function g() { y += 1; }\n",
    );
    assert!(
        out.contains("\ty = 2;"),
        "a parameter shadows the state name:\n{out}"
    );
    assert!(out.contains("$.set(y, $.get(y) + 1);"), "{out}");
}

// A same-named import, `$state.snapshot` local or non-reassigned `$state`
// local (`$.proxy`) is a plain value, so it keeps the bare form. Expected lines
// are upstream's `compileModule` output for the same input.
#[test]
fn same_named_plain_values_are_not_signals() {
    let out = compile_mod_client(
        "import { y } from \"./other.js\";\nexport function f() { let [y] = $state([1]); y = 2; return y; }\nexport const g = () => y;\n",
    );
    assert!(out.contains("$.set(y, 2);"), "{out}");
    assert!(out.contains("export const g = () => y;"), "{out}");

    let out = compile_mod_client(
        "let a = $state(0);\nexport function f() { a = 1; return a; }\nexport function g(o) { let a = $state.snapshot(o); a = 5; return a; }\n",
    );
    assert!(out.contains("$.set(a, 1);"), "{out}");
    assert!(
        out.contains("let a = $.snapshot(o);\n\n\ta = 5;\n\n\treturn a;"),
        "{out}"
    );

    let out = compile_mod_client(
        "export function f() { let a = $state([1]); return a; }\nexport function g() { let a = $state([1]); a = 2; return a; }\n",
    );
    assert!(
        out.contains("let a = $.proxy([1]);\n\n\treturn a;"),
        "{out}"
    );
    assert!(out.contains("$.set(a, 2);\n\n\treturn $.get(a);"), "{out}");
}

// Declarators the `let x = $state(…)` text scan does not match.
#[test]
fn unscanned_flat_state_declarators_are_signals() {
    let out = compile_mod_client(
        "let z = 0, w = $state(1);\nexport function f() { w = 2; return w + z; }\n",
    );
    assert!(
        out.contains("$.set(w, 2);\n\n\treturn $.get(w) + z;"),
        "{out}"
    );

    let out = compile_mod_client(
        "let w /* c */ = $state(1);\nexport function f() { w = 2; return w; }\n",
    );
    assert!(out.contains("$.set(w, 2);\n\n\treturn $.get(w);"), "{out}");
}
