//! Which declaration kinds lose their `export` modifier in an instance script?
//!
//! Upstream removes it for an ALLOW-LIST — `processInstanceScriptContent` reaches
//! `handleVariableStatement` (VariableStatement), `handleExportFunctionOrClass`
//! (FunctionDeclaration / ClassDeclaration) and `handleExportDeclaration` — and
//! keeps it for every other kind. rsvelte had written the same decision as a
//! DENY-list of two type forms, so a namespace, enum, module or `import =` lost
//! an `export` upstream keeps.
//!
//! Every expectation below was read off `svelte2tsx@0.7.61` (the pinned
//! `submodules/language-tools`), including the ones that produce output no
//! TypeScript compiler accepts (`export namespace` lands inside `$$render()`).
//! Byte equality is the goal, so upstream's output is the oracle, not a judgement
//! about what the TSX ought to say.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn instance(decl: &str) -> String {
    format!("<script lang=\"ts\">\n{decl}\nlet k = 1;\n</script>\n{{k}}\n")
}

fn module_script(decl: &str) -> String {
    format!(
        "<script module lang=\"ts\">\n{decl}\n</script>\n<script lang=\"ts\">\nlet k = 1;\n</script>\n{{k}}\n"
    )
}

fn project(source: &str) -> String {
    svelte2tsx(
        source,
        Svelte2TsxOptions {
            filename: "C.svelte".into(),
            is_ts_file: true,
            ..Default::default()
        },
    )
    .expect("svelte2tsx")
    .code
}

#[track_caller]
fn assert_keeps_export(decl: &str) {
    for (host, source) in [
        ("instance", instance(decl)),
        ("module", module_script(decl)),
    ] {
        let code = project(&source);
        assert!(
            code.contains(decl),
            "`{decl}` lost its `export` ({host}):\n{code}"
        );
    }
}

#[track_caller]
fn assert_instance_strips_export(decl: &str) {
    let stripped = decl.strip_prefix("export ").expect("an export decl");
    let code = project(&instance(decl));
    assert!(
        !code.contains(decl) && code.contains(stripped),
        "`{decl}` kept its `export` (instance):\n{code}"
    );
    // The module host is a real module export and always keeps it.
    let module = project(&module_script(decl));
    assert!(
        module.contains(decl),
        "`{decl}` lost its `export` (module):\n{module}"
    );
}

/// The kinds outside upstream's allow-list. `export namespace` is #3257's own
/// case; the rest are the same decision reached through other declaration kinds,
/// so a fix that special-cased `namespace` alone would leave them red.
#[test]
fn a_declaration_outside_the_allow_list_keeps_its_export() {
    for decl in [
        "export namespace N { type T = 1; }",
        "export declare module 'm' { }",
        "export enum E { A }",
        "export const enum E { A }",
        "export interface I { a: number }",
        "export type T = 1;",
        "export import ie = require('m');",
    ] {
        assert_keeps_export(decl);
    }
}

/// The controls: the three kinds upstream DOES strip. A fix that simply stopped
/// stripping would pass the test above and fail this one.
#[test]
fn a_variable_function_or_class_still_loses_its_export() {
    for decl in [
        "export let v = 1;",
        "export const kk = 1;",
        "export function fn() {}",
        "export class Cls {}",
        // `declare` does not change the node kind: these are still a
        // VariableStatement, a FunctionDeclaration and a ClassDeclaration.
        "export declare const c: number;",
        "export declare function f(): void;",
        "export declare class D {}",
    ] {
        assert_instance_strips_export(decl);
    }
}

/// A namespace with no `export` of its own must be untouched in both hosts — the
/// fix must not start adding or removing anything here.
#[test]
fn a_plain_namespace_is_unchanged() {
    for decl in ["namespace N { type T = 1; }", "declare module 'm' { }"] {
        assert_keeps_export(decl);
    }
}
