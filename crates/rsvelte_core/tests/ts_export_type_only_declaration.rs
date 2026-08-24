//! An `export` whose declaration the TypeScript strip empties is not a component
//! export, and a dotted namespace behaves as its desugaring.
//!
//! `ts_namespace_3244.rs` covers which namespace *bodies* are legal. This file
//! covers the wrapper: upstream's `ExportNamedDeclaration` visitor visits the
//! declaration and only then decides the export is `b.empty`, so an export the
//! visit emptied never reaches `process_legacy_exports` and never adds a
//! `$$props` parameter.
//!
//! Every expectation was read off the official compiler (`submodules/svelte` @
//! `20b341f10048`, `VERSION === '5.56.9'`) except the dotted-name rows, which
//! upstream answers with a raw `TypeError`; those pin rsvelte's deliberate choice
//! to behave as the desugaring `namespace N { namespace M { … } }`, which
//! upstream does compile. See
//! `upstream_issues/3568-svelte-dotted-namespace-crash.md`.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn run(src: &str, generate: GenerateMode, dev: bool) -> Result<String, String> {
    compile(
        src,
        CompileOptions {
            generate,
            dev,
            name: Some("C".to_string()),
            filename: Some("C.svelte".to_string()),
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .map_err(|e| e.diagnostic().code.unwrap_or_else(|| "<uncoded>".into()))
}

fn instance(body: &str, generate: GenerateMode, dev: bool) -> Result<String, String> {
    run(
        &format!("<script lang=\"ts\">\n{body}\nlet k = 1;\n</script>\n{{k}}\n"),
        generate,
        dev,
    )
}

fn module_script(body: &str, generate: GenerateMode, dev: bool) -> Result<String, String> {
    run(
        &format!(
            "<script module lang=\"ts\">\n{body}\n</script>\n<script lang=\"ts\">\nlet k = 1;\n</script>\n{{k}}\n"
        ),
        generate,
        dev,
    )
}

const TARGETS: [(GenerateMode, bool); 4] = [
    (GenerateMode::Client, false),
    (GenerateMode::Client, true),
    (GenerateMode::Server, false),
    (GenerateMode::Server, true),
];

/// Accepted through both entry points that carry a `<script lang="ts">`, on
/// every target, with no TypeScript left in the output.
fn assert_accepted(body: &str) {
    for (generate, dev) in TARGETS {
        for (label, out) in [
            ("instance", instance(body, generate, dev)),
            ("module-script", module_script(body, generate, dev)),
        ] {
            let code = out.unwrap_or_else(|code| {
                panic!("`{body}` rejected with `{code}` ({label}, {generate:?}, dev={dev})")
            });
            assert!(
                !code.contains("namespace"),
                "`{body}` leaked TS text ({label}, {generate:?}, dev={dev}):\n{code}"
            );
        }
    }
}

fn assert_rejected(body: &str, expected: &str) {
    for (generate, dev) in TARGETS {
        for (label, out) in [
            ("instance", instance(body, generate, dev)),
            ("module-script", module_script(body, generate, dev)),
        ] {
            match out {
                Ok(code) => panic!(
                    "`{body}` compiled ({label}, {generate:?}, dev={dev}); expected `{expected}`:\n{code}"
                ),
                Err(code) => {
                    assert_eq!(
                        code, expected,
                        "`{body}` ({label}, {generate:?}, dev={dev})"
                    )
                }
            }
        }
    }
}

/// Official emits `function C($$anchor)` / `function C($$renderer)` for each of
/// these. A `$$props` parameter would change the component's calling signature.
///
/// Production only: in dev BOTH compilers emit `$$props` regardless, so a matrix
/// that varies only `dev` cannot tell these apart.
#[test]
fn an_exported_type_only_declaration_adds_no_props_parameter() {
    for body in [
        "export namespace N { type T = 1; }",
        "export namespace N { interface I {} }",
        "export namespace N { export type T = 1; }",
        "export namespace N { }",
        "export module N { type T = 1; }",
        "export declare namespace N { const a: number }",
        "export type T = 1;",
        "export interface I {}",
        "export declare const c: number;",
        "export declare function f(): void;",
        "export declare class D {}",
        // The specifier half of the same visitor: a list that filters to
        // nothing — including one written with none — is `b.empty` upstream.
        "export {};",
        "const q = 1;\nexport { type q };",
    ] {
        let client = instance(body, GenerateMode::Client, false)
            .unwrap_or_else(|code| panic!("`{body}` rejected with `{code}`"));
        assert!(
            client.contains("function C($$anchor)"),
            "`{body}` produced a props parameter:\n{client}"
        );
        let server = instance(body, GenerateMode::Server, false)
            .unwrap_or_else(|code| panic!("`{body}` rejected with `{code}`"));
        assert!(
            server.contains("function C($$renderer)"),
            "`{body}` produced a props parameter on the server:\n{server}"
        );
    }
}

/// The control: a real value export still needs the parameter, and a `let` still
/// becomes a bindable prop. Without this, emptying every export would pass the
/// test above.
#[test]
fn a_real_export_keeps_its_props_parameter() {
    for body in [
        "export let v = 1;",
        "export const kk = 1;",
        "export function fn() {}",
        "export class Cls {}",
        "const w = 1;\nexport { w };",
        "const w = 1;\nexport { w as renamed };",
    ] {
        let client = instance(body, GenerateMode::Client, false)
            .unwrap_or_else(|code| panic!("`{body}` rejected with `{code}`"));
        assert!(
            client.contains("function C($$anchor, $$props)"),
            "`{body}` lost its props parameter:\n{client}"
        );
        let server = instance(body, GenerateMode::Server, false)
            .unwrap_or_else(|code| panic!("`{body}` rejected with `{code}`"));
        assert!(
            server.contains("function C($$renderer, $$props)"),
            "`{body}` lost its props parameter on the server:\n{server}"
        );
    }
}

/// A `let` beside a type-only export still reaches `$.prop`, so emptying the
/// type-only one does not empty its neighbour.
#[test]
fn a_type_only_export_beside_a_real_one_keeps_the_real_one() {
    let code = instance(
        "export namespace N { type T = 1; }\nexport let v = 1;",
        GenerateMode::Client,
        false,
    )
    .expect("compile");
    assert!(
        code.contains("function C($$anchor, $$props)"),
        "the real export lost its parameter:\n{code}"
    );
    assert!(
        code.contains("$.prop("),
        "no prop accessor emitted:\n{code}"
    );
}

/// Upstream crashes with a raw `TypeError` on every dotted spelling. rsvelte
/// treats `namespace N.M { … }` as `namespace N { namespace M { … } }`, which
/// upstream does compile — so the type-only body strips…
#[test]
fn a_dotted_namespace_strips_when_its_body_is_type_only() {
    assert_accepted("namespace N.M { type T = 1; }");
    assert_accepted("namespace N.M.O { type T = 1; }");
    assert_accepted("namespace N.M { }");
    assert_accepted("export namespace N.M { type T = 1; }");
}

/// …and a value in it is rejected exactly as the un-dotted spelling is. Before
/// the desugaring, the dotted body was dropped at parse and this compiled.
#[test]
fn a_dotted_namespace_with_a_value_is_rejected() {
    assert_rejected("namespace N.M { let x = 1; }", "typescript_invalid_feature");
    assert_rejected(
        "namespace N.M.O { let x = 1; }",
        "typescript_invalid_feature",
    );
    // `namespace N { namespace M { enum E { A } } }` — the desugared form — is
    // `typescript_invalid_feature` upstream too, raised from the enum.
    assert_rejected(
        "namespace N.M { enum E { A } }",
        "typescript_invalid_feature",
    );
}
