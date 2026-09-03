//! The namespace strip has to reach the innermost block through BOTH body
//! shapes. A dotted `namespace A.B { … }` nests another `TSModuleDeclaration`
//! where a plain one holds a `TSModuleBlock`, and a fix that reaches one host
//! looks exactly like a fix that reaches both — so each host gets its own cell.
//!
//! (Upstream reads `node.body.body` unconditionally and throws a raw
//! `TypeError` on the dotted form; see
//! `upstream_issues/3568-svelte-dotted-namespace-crash.md`. rsvelte keeps
//! stripping, which is what these cells pin.)

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

/// `Ok` when the namespace erased cleanly, otherwise the diagnostic's `Debug`
/// form, which carries the code.
fn compile_result(body: &str) -> Result<(), String> {
    let source = format!("<script lang=\"ts\">\n{body}\nlet k = 1;\n</script>\n{{k}}\n");
    compile(
        &source,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .map(|_| ())
    .map_err(|e| format!("{e:?}"))
}

#[test]
fn a_type_only_namespace_compiles_through_both_body_shapes() {
    for body in [
        "namespace N { type T = 1; }",
        "namespace N.M { type T = 1; }",
        "namespace N.M.O { type T = 1; }",
        "namespace N { namespace M { type T = 1; } }",
        "declare global { type T = 1; }",
        "declare module \"x\" { type T = 1; }",
        "namespace N { }",
    ] {
        assert!(
            compile_result(body).is_ok(),
            "expected a type-only namespace to compile: {body}"
        );
    }
}

/// This is the discriminating half. Deleting the dotted descent from
/// `strip_ts_module_declaration_typed` leaves the compile-through test above
/// green — a namespace that erases to nothing erases to nothing either way —
/// and fails exactly the three dotted cells here.
#[test]
fn a_non_type_namespace_is_rejected_through_both_body_shapes() {
    for body in [
        "namespace N { let x = 1; }",
        "namespace N.M { let x = 1; }",
        "namespace N.M.O { let x = 1; }",
        "namespace N { namespace M { let x = 1; } }",
    ] {
        let error = compile_result(body).expect_err(&format!(
            "expected a non-type namespace to be rejected: {body}"
        ));
        assert!(
            error.contains("typescript_invalid_feature"),
            "wrong code for {body}: {error}"
        );
    }
}
