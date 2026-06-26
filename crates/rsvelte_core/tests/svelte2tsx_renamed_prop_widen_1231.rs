//! Regression tests for #1231: a renamed legacy prop with a default
//! (`let className = ""; export { className as class }`) must still get the
//! `__sveltets_2_any` coercion + `/*Ωignore_*Ω*/` markers when the declaration
//! carries a type — either a JSDoc `/** @type {T} */` (the common sveltestrap
//! shape) or a boolean-literal initializer. This mirrors official svelte2tsx's
//! `propTypeAssertToUserDefined`, which `addExport` invokes when the re-exported
//! local is a `let`. Without the widen, `let foo: string | undefined = undefined`
//! is narrowed to `undefined` and TS reports spurious "possibly undefined"
//! errors in the language server.

use rsvelte_core::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn convert(src: &str) -> String {
    let opts = Svelte2TsxOptions {
        filename: "Comp.svelte".to_string(),
        is_ts_file: false,
        emit_jsdoc: true,
        ..Default::default()
    };
    svelte2tsx(src, opts).expect("svelte2tsx ok").code
}

/// JSDoc `@type` on a renamed legacy prop with a string default → widen.
#[test]
fn jsdoc_typed_renamed_prop_with_default_is_widened() {
    let src = "<script>\n  /** @type {string} */\n  let className = \"\";\n  export { className as class };\n</script>\n";
    let code = convert(src);
    assert!(
        code.contains(
            "let className = \"\"/*\u{03A9}ignore_start\u{03A9}*/;className = __sveltets_2_any(className);/*\u{03A9}ignore_end\u{03A9}*/"
        ),
        "expected __sveltets_2_any widen with ignore markers, got:\n{code}"
    );
}

/// Boolean-literal default on a renamed legacy prop → widen (TS would otherwise
/// narrow to the `false` literal type).
#[test]
fn boolean_default_renamed_prop_is_widened() {
    let src = "<script>\n  let open = false;\n  export { open as isOpen };\n</script>\n";
    let code = convert(src);
    assert!(
        code.contains("open = __sveltets_2_any(open)"),
        "expected boolean-init renamed prop to be widened, got:\n{code}"
    );
}

/// A plain (untyped) string default on a renamed prop must NOT be widened —
/// official leaves `let className = ""` untouched here.
#[test]
fn plain_string_default_renamed_prop_is_not_widened() {
    let src = "<script>\n  let className = \"\";\n  export { className as class };\n</script>\n";
    let code = convert(src);
    assert!(
        !code.contains("__sveltets_2_any(className)"),
        "plain string default must not be widened, got:\n{code}"
    );
}
