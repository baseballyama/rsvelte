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
