//! A `.svelte.ts` module, which TypeScript's emit hands svelte as JavaScript, so acorn-typescript
//! never reads it.

use super::*;

#[test]
fn a_typescript_module_is_read_without_acorn_typescripts_rules() {
    // TypeScript 6.0.3's emit, then svelte 5.59.1's `compileModule`, compiles each: acorn reads
    // only the JavaScript the emit leaves.
    for source in [
        "declare let static: number;",
        "declare function await(): void;",
        "declare namespace let {}",
        "declare type static = 1;",
        "export declare let private: number;",
        "declare class C { #x = 1 }",
        "declare namespace eval {}",
        "declare function f(eval: number): void;",
        "declare class interface {}",
        "class C { override m() {} }",
        "export declare global { }",
        "abstract class C { abstract accessor x = 1 }",
        "declare const x = f();",
        "declare let x = 1;",
        "declare namespace N { function f(await: number): void; }",
        "type await = 1;",
        "interface I { m(static: number): void }",
    ] {
        for target in [Target::Client, Target::Server] {
            let output = output("a.svelte.ts", source, target);
            assert_eq!(
                (output.files.len(), output.diagnostics.len()),
                (1, 0),
                "{target:?} {source:?}: {:?}",
                output.diagnostics
            );
        }
    }
}
