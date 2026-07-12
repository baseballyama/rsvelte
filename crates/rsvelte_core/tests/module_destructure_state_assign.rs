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
    let src = r#"let count = $state(0);
let obj = $state({ a: 1 });
export function arr(a) { [count, obj] = a; }
"#;
    let out = compile_mod_client(src);
    assert!(
        out.contains("$.to_array($$value, 2)"),
        "array destructure must go through $.to_array. Got:\n{out}"
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
