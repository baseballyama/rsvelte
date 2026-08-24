//! Which TypeScript legality rules does the parser raise?
//!
//! Upstream parses `lang="ts"` with `acorn-typescript`; rsvelte parses with OXC,
//! and the two disagree in BOTH directions. A rule OXC raises and acorn does not
//! is an over-rejection (rsvelte refuses a component that compiles); a rule acorn
//! raises and OXC does not is an under-rejection (rsvelte compiles a component
//! official refuses). A population of only one direction is blind to the other,
//! so every expectation here was read off `svelte.compile` at 5.56.9 and both
//! directions are present.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

const TARGETS: [GenerateMode; 2] = [GenerateMode::Client, GenerateMode::Server];

fn instance(decl: &str) -> String {
    format!("<script lang=\"ts\">\n{decl}\nlet k = 1;\n</script>\n{{k}}\n")
}

fn module_script(decl: &str) -> String {
    format!(
        "<script module lang=\"ts\">\n{decl}\n</script>\n<script lang=\"ts\">\nlet k = 1;\n</script>\n{{k}}\n"
    )
}

fn run(source: &str, generate: GenerateMode) -> Result<String, (Option<String>, String)> {
    let options = CompileOptions {
        generate,
        dev: false,
        filename: Some("C.svelte".to_string()),
        ..Default::default()
    };
    match compile(source, options) {
        Ok(result) => Ok(result.js.code),
        Err(e) => {
            let d = e.diagnostic();
            Err((d.code, d.message))
        }
    }
}

/// Both entry points, because a script and a `<script module>` are different
/// parse calls and a rule added to one is not added to the other.
fn for_each_host(decl: &str, mut check: impl FnMut(&str, GenerateMode, &str)) {
    for generate in TARGETS {
        for (host, source) in [
            ("instance", instance(decl)),
            ("module", module_script(decl)),
        ] {
            check(host, generate, &source);
        }
    }
}

fn assert_accepted(decl: &str) {
    for_each_host(decl, |host, generate, source| {
        if let Err((code, message)) = run(source, generate) {
            panic!("`{decl}` was rejected ({host}, {generate:?}): {code:?} {message}");
        }
    });
}

fn assert_rejected(decl: &str, expected_code: &str) {
    for_each_host(decl, |host, generate, source| match run(source, generate) {
        Ok(code) => {
            panic!("`{decl}` compiled ({host}, {generate:?}); expected `{expected_code}`:\n{code}")
        }
        Err((code, message)) => assert_eq!(
            code.as_deref(),
            Some(expected_code),
            "`{decl}` ({host}, {generate:?}) raised the wrong code: {message}"
        ),
    });
}

/// OXC raises TS1147 / TS1194 for an import or a re-export inside a namespace;
/// acorn-typescript has no such rule, so upstream parses these and then lets the
/// namespace strip judge the body.
#[test]
fn a_namespace_import_or_reexport_is_not_a_parse_error() {
    // Type-only: the strip empties it, so the namespace is empty and compiles.
    assert_accepted("namespace N { import type { A } from 'm'; }");
    assert_accepted("declare namespace N { import type { A } from 'm'; }");

    // Value forms survive the strip, so the namespace holds a non-type node.
    for decl in [
        "namespace N { import 'm'; }",
        "namespace N { import { A } from 'm'; }",
        "namespace N { import A from 'm'; }",
        "namespace N { import * as A from 'm'; }",
        "namespace N { import A = require('m'); }",
        "namespace N { export { A } from 'm'; }",
        "namespace N { export * from 'm'; }",
    ] {
        assert_rejected(decl, "typescript_invalid_feature");
    }
}

/// acorn wants an ambient declaration after `export declare`, and a global
/// augmentation is not one. OXC accepts it, so without this rule rsvelte
/// compiles a component official refuses.
#[test]
fn an_exported_global_augmentation_is_rejected() {
    assert_rejected("export declare global { interface W {} }", "js_parse_error");
}

/// The controls for the rule above: every other `export declare` form, and the
/// two spellings of a global augmentation that are legal. A rule that rejected
/// `export declare` generally, or `global` generally, would pass the test above
/// and fail these.
#[test]
fn every_other_export_declare_form_still_compiles() {
    for decl in [
        "export declare const c: number;",
        "export declare function f(): void;",
        "export declare class D {}",
        "export declare enum E { A }",
        "export declare namespace N { type T = 1; }",
        "export declare module 'm' { }",
        "declare global { interface W {} }",
        "namespace N { declare global { interface W {} } }",
    ] {
        assert_accepted(decl);
    }
}

/// The optional-rest rule is NOT reproduced (issue #3680): acorn rejects it in a
/// function or method with a body, while OXC records the marker on no AST node,
/// so the narrow rule cannot be derived from the tree. Pinned as the CURRENT
/// behaviour so the divergence stays visible instead of being forgotten.
#[test]
fn an_optional_rest_parameter_is_accepted_where_official_rejects_it() {
    for decl in [
        "function f(...p?: string[]) {}",
        "class C { m(...p?: string[]) {} }",
    ] {
        assert_accepted(decl);
    }

    // These two agree with official today and must keep doing so.
    assert_accepted("const g = (...p?: string[]) => {};");
    assert_accepted("declare function h(...p?: string[]): void;");
}

/// The rules OXC raises that acorn does not must stay suppressed. These are the
/// control for the suppression list: removing an entry makes one of these red.
#[test]
fn the_typescript_rules_acorn_does_not_check_still_compile() {
    for decl in [
        "function f(p?: string = 1) {}",
        "function f(p?: string, q: string) {}",
        "declare namespace N { declare const c: number; }",
        "class C { set a(v?: number) {} }",
        "class C { constructor(): void {} }",
        "class C { get a<T>(): number { return 1 } }",
        "class C { set a(v: number): void {} }",
        "declare function* g(): void;",
        "let a!: number = 1;",
        "class C { constructor(this: C) {} }",
        "type T = [a?: string, ...b?: number[]];",
    ] {
        assert_accepted(decl);
    }
}
