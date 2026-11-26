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

/// TypeScript 7.1 checks the parameters of an untyped JavaScript function as TypeScript does, so a
/// snippet with a parameter its `Snippet` type does not pass is TS2322. TypeScript 6.0.3 treats the
/// parameter as optional and reports only TS7006.
#[test]
fn typecheck_checks_a_javascript_snippet_s_parameters_as_typescript_7_does() {
    let config = typecheck_config(&rsvelte_test_harness::svelte_content_mapper());
    let project = Project::new(&[
        ("app/rsvelte.config.json", &config),
        (
            "app/tsconfig.json",
            r#"{"compilerOptions":{"strict":true,"module":"esnext","moduleResolution":"bundler",
"target":"esnext","types":[],"skipLibCheck":true,"allowJs":true,"checkJs":true},
"include":["src"]}"#,
        ),
        (
            "app/src/O.svelte",
            "<script lang=\"ts\">\n\timport type { Snippet } from \"svelte\";\n\
             \tlet { foo }: { foo?: Snippet } = $props();\n</script>\n\n<p>x</p>\n",
        ),
        (
            "app/src/App.svelte",
            "<script>\n\timport O from \"./O.svelte\";\n</script>\n\n\
             <O>{#snippet foo(q)}{q}{/snippet}</O>\n",
        ),
    ]);
    let output = project.rsvelte_in("app", &["typecheck"]);
    assert_eq!(
        format!("{}{}", text(&output.stdout), text(&output.stderr)),
        "src/App.svelte(5,14): error TS2322: Type '(q: any) => any' is not assignable to type \
         'Snippet<[]>'.\n  Target signature provides too few arguments. Expected 1 or more, but \
         got 0.\n\
         src/App.svelte(5,18): error TS7006: Parameter 'q' implicitly has an 'any' type.\n\
         \nFound 2 errors in 1 file.\n"
            .native()
    );
}
