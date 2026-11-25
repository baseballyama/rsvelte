//! `rsvelte typecheck` prints what its TypeScript 7 checker prints, where TypeScript 6, the
//! checker of svelte-check 4.7.8, prints otherwise (`DIVERGENCES.md` of `rsvelte_svelte_check`).

use crate::typecheck::{Native, Project, text, typecheck_config};

/// TypeScript 7.1 keeps a spread's properties in source order, and lists only the last overload
/// a call does not match. TypeScript 6.0.3 prints `{ b: string; a: number; }` and each overload.
#[test]
fn typecheck_prints_what_typescript_7_prints() {
    let config = typecheck_config(&rsvelte_test_harness::svelte_content_mapper());
    let project = Project::new(&[
        ("app/rsvelte.config.json", &config),
        (
            "app/tsconfig.json",
            r#"{"compilerOptions":{"strict":true,"module":"esnext","types":[]},"include":["src"]}"#,
        ),
        (
            "app/src/spread.ts",
            "declare function t<T>(): { [K in keyof T]: T[K] };\n\
             const events = { ...t<{ a: number }>(), ...t<{ b: string }>() };\n\
             export const n: number = events;\n",
        ),
        (
            "app/src/overload.ts",
            "declare function f(x: string): void;\n\
             declare function f(x: string | null): void;\n\
             f(1);\n",
        ),
    ]);
    let output = project.rsvelte_in("app", &["typecheck"]);
    assert_eq!(
        format!("{}{}", text(&output.stdout), text(&output.stderr)),
        "src/overload.ts(3,3): error TS2769: No overload matches this call.\n  The last overload \
         gave the following error.\n    Argument of type 'number' is not assignable to parameter \
         of type 'string'.\n\
         src/spread.ts(3,14): error TS2322: Type '{ a: number; b: string; }' is not assignable \
         to type 'number'.\n\
         \nFound 2 errors in 2 files.\n"
            .native()
    );
}
