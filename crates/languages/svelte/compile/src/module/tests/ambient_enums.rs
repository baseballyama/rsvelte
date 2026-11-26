//! An ambient enum in a `.svelte.ts` module, which TypeScript's emit removes before upstream reads
//! the module.

use super::*;

#[test]
fn a_typescript_module_drops_an_ambient_enum() {
    // TypeScript 6.0.3's emit, then svelte 5.59.1's `compileModule`, on both targets.
    for (source, client, server) in [
        (
            "declare enum E { A }\nexport let E = 1;\n",
            "exportletE=1;",
            "exportletE=1;",
        ),
        (
            "declare const enum E { A }\nexport let E = 1;\n",
            "exportletE=1;",
            "exportletE=1;",
        ),
        (
            "export declare enum E { A }\nexport function E() {}\n",
            "exportfunctionE(){}",
            "exportfunctionE(){}",
        ),
        (
            "declare enum E { A }\nexport const x = E.A;\n",
            "exportconstx=E.A;",
            "exportconstx=E.A;",
        ),
        (
            "declare enum E { A }\nexport const s = $state(E.A);\n",
            "exportconsts=$.proxy(E.A);",
            "exportconsts=E.A;",
        ),
    ] {
        assert_eq!(body(source, Target::Client), client, "{source:?}");
        assert_eq!(body(source, Target::Server), server, "{source:?}");
    }
}

#[test]
fn a_typescript_module_keeps_a_namespace_that_holds_an_ambient_enum() {
    // TypeScript 6.0.3's emit writes `var N; (function (N) {})(N || (N = {}));` for each, which
    // svelte 5.59.1 compiles; the lowering writes it in oxc's form.
    for source in [
        "namespace N { declare enum E { A } }\nexport const x = 1;\n",
        "namespace N { export declare const enum E { A } }\nexport const x = 1;\n",
    ] {
        for target in [Target::Client, Target::Server] {
            let body = body(source, target);
            assert!(
                body.starts_with("letN;(function(_N){})(N||(N={}));"),
                "{source:?}: {body}"
            );
        }
    }
    // A namespace of types only is not emitted.
    let source = "namespace N { export type T = 1; }\nexport const x = 1;\n";
    assert_eq!(body(source, Target::Client), "exportconstx=1;");
}
