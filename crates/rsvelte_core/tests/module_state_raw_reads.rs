//! Regression test for `$state.raw` (and `$state.frozen`) reassigned variables
//! in `compileModule(generate:'client')`.
//!
//! Bug (baseballyama/rsvelte#143): `extract_local_reactive_vars`'s regex only
//! matched `$state(` and `$derived(` — not `$state.raw(` / `$state.frozen(`.
//! A reassigned `let x = $state.raw(initial)` got its declaration rewritten to
//! `let x = $.state(initial)` (correct), but reads (`x[key]`) and writes
//! (`x = next`) were left untransformed. Downstream consumers like
//! `@testing-library/svelte`'s `createProps()` then saw the reactive source
//! object instead of the underlying value — `currentProps[key]` returned
//! undefined for every key.

use rsvelte_core::GenerateMode;
use rsvelte_core::compile_module;
use rsvelte_core::compiler::ModuleCompileOptions;

fn compile_mod_client(src: &str) -> String {
    let result = compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("in.svelte.js".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile_module");
    result.js.code
}

#[test]
fn state_raw_reassigned_read_transformed_to_get() {
    let src = r#"let x = $state.raw({ label: 'BUTTON' });
function reassign(next) { x = next; }
export const value = (key) => x[key];
"#;
    let out = compile_mod_client(src);
    // Read must be rewritten to $.get(x)[key].
    assert!(
        out.contains("$.get(x)[key]"),
        "read `x[key]` should be rewritten to `$.get(x)[key]`. Got:\n{out}"
    );
    // Reassignment must be rewritten to $.set(x, next, ...).
    assert!(
        out.contains("$.set(x, next"),
        "reassignment `x = next` should be rewritten to `$.set(x, next, ...)`. Got:\n{out}"
    );
    // Declaration must still wrap in $.state(...).
    assert!(
        out.contains("$.state({ label: 'BUTTON' })"),
        "declaration should wrap in $.state(...). Got:\n{out}"
    );
}

#[test]
fn state_raw_property_assignment_uses_get() {
    // x[key] = value mutates the raw underlying object — the read side has
    // to go through $.get to grab the object, otherwise the assignment hits
    // the state source's own properties.
    let src = r#"let x = $state.raw({ a: 1 });
function setKey(key, value) { x[key] = value; }
function reassign(next) { x = next; }
"#;
    let out = compile_mod_client(src);
    assert!(
        out.contains("$.get(x)[key] = value"),
        "property assignment `x[key] = value` should become `$.get(x)[key] = value`. Got:\n{out}"
    );
}

// Note: `$state.frozen` was renamed to `$state.raw` in Svelte 5.x and the
// analyzer rejects the legacy spelling with `rune_renamed`, so it can't reach
// this transform path. The regex still accepts `.frozen` so that any source
// that survives an analyzer override (e.g. a downstream tool using
// `compile_module` directly without analysis) still produces the right
// rewrites — but there's no positive integration test for it.

#[test]
fn non_reassigned_state_raw_stays_unwrapped() {
    // No reassignment → the rune is stripped to its raw value, no $.state()
    // wrapper, and reads are plain property access (no $.get).
    let src = r#"let x = $state.raw({ a: 1 });
export const read = (key) => x[key];
"#;
    let out = compile_mod_client(src);
    assert!(
        !out.contains("$.state("),
        "non-reassigned $state.raw should not wrap in $.state(). Got:\n{out}"
    );
    assert!(
        !out.contains("$.get("),
        "non-reassigned $state.raw reads should be plain property access. Got:\n{out}"
    );
}
