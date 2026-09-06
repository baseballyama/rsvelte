//! Upstream's `scope.evaluate` resolves an Identifier through its binding's own
//! initializer (`phases/scope.js:303`), and `declare` passes the
//! **FunctionDeclaration node itself** as that initializer (`scope.js:673`).
//! `evaluate` then folds it in the same arm as an arrow or a function
//! expression (`scope.js:560-563`), so a name bound by `function h() {}` is a
//! known function exactly as one bound by `const h = () => {}` is, and the
//! dev-mode `$.assign` wrap is skipped for both.
//!
//! The enumeration is closed from the oracle's own `switch` rather than from
//! the shapes a report happened to name: the arm above is the only one that
//! separates a declaration kind from "no initializer at all". `ClassDeclaration`
//! and `ImportDeclaration` are also passed as `initial` upstream, and both fall
//! to `default` → `UNKNOWN` — the same answer a missing initializer gives — so
//! they need nothing here. The class row below is that control, and it expects
//! a **wrap**, which is what stops the table being satisfied by a predicate
//! that never wraps.

use rsvelte_core::{CompileOptions, GenerateMode, ModuleCompileOptions, compile, compile_module};

/// `(label, declarations, right-hand side, official wraps)`.
const CELLS: &[(&str, &str, &str, bool)] = &[
    ("inline fn-decl ref", "function h() {}", "h", false),
    (
        "binding <- fn decl",
        "function h() {}\nconst g = h;",
        "g",
        false,
    ),
    (
        "binding <- const arrow",
        "const h = () => {};\nconst g = h;",
        "g",
        false,
    ),
    (
        "binding <- const fnexpr",
        "const h = function () {};\nconst g = h;",
        "g",
        false,
    ),
    (
        "binding <- let arrow",
        "let h = () => {};\nconst g = h;",
        "g",
        false,
    ),
    ("inline arrow", "", "() => {}", false),
    ("binding <- literal", "const g = 1;", "g", false),
    (
        "binding <- class decl",
        "class C {}\nconst g = C;",
        "g",
        true,
    ),
    ("binding <- object", "const g = {};", "g", true),
];

fn client_dev(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("C.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

fn module_dev(source: &str) -> String {
    compile_module(
        source,
        ModuleCompileOptions {
            filename: Some("m.svelte.js".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .expect("compile_module")
    .js
    .code
}

#[test]
fn a_function_declaration_binding_folds_like_an_arrow() {
    for &(label, declarations, rhs, expected) in CELLS {
        let indented = declarations.replace('\n', "\n\t");
        let instance = format!(
            "<script lang=\"ts\">\n\tlet o = $state({{ a: 0, b: 0 }});\n\t{indented}\n\texport function go() {{ o.a = o.b = {rhs}; }}\n</script>\n{{o.a}}\n"
        );
        let module_block = format!(
            "<script module>\n\tlet o = $state({{ a: 0, b: 0 }});\n\t{indented}\n\texport function go() {{ o.a = o.b = {rhs}; }}\n</script>\n{{1}}\n"
        );
        let module_file = format!(
            "let o = $state({{ a: 0, b: 0 }});\n{declarations}\nexport function go() {{ o.a = o.b = {rhs}; }}\n"
        );

        for (host, code) in [
            ("instance script", client_dev(&instance)),
            ("<script module>", client_dev(&module_block)),
            (".svelte.js", module_dev(&module_file)),
        ] {
            assert_eq!(
                code.contains("$.assign("),
                expected,
                "`{label}` in the {host} host:\n{code}"
            );
        }
    }
    assert!(CELLS.iter().any(|c| c.3), "no cell expects a wrap");
    assert!(CELLS.iter().any(|c| !c.3), "no cell expects no wrap");
}
