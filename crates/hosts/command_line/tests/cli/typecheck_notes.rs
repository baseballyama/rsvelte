//! What `rsvelte typecheck` appends to TypeScript's message, as svelte-check does.

use crate::typecheck_events::check;

/// svelte-check appends "Possible causes" to a TS2345 that names
/// `ConstructorOfATypedSvelteComponent`, in a component only. svelte-check 4.7.8 reports these
/// messages.
#[test]
fn typecheck_notes_a_component_constructor_argument() {
    let tsconfig = (
        "tsconfig.json",
        r#"{"compilerOptions":{"strict":true,"module":"esnext","moduleResolution":"bundler",
"target":"esnext","types":[],"skipLibCheck":true,"allowJs":true,"checkJs":true},
"include":["src"]}"#,
    );
    let report = check(&[
        tsconfig,
        (
            "src/NoteTS.svelte",
            "<script lang=\"ts\">\n\tconst f = (c: ConstructorOfATypedSvelteComponent) => c;\n\t\
             const g = (c: string) => c;\n\tf(5);\n\tg(5);\n</script>\n",
        ),
        (
            "src/NoteJS.svelte",
            "<script>\n\t/** @param {ConstructorOfATypedSvelteComponent} c */\n\tfunction f(c) \
             {}\n\tf(5);\n</script>\n\n{f}\n",
        ),
        (
            "src/plain.ts",
            "declare function f(c: ConstructorOfATypedSvelteComponent): void;\nf(5);\nexport {};\n",
        ),
    ]);
    let noted = |at: &str| {
        format!(
            "src/{at}: error TS2345: Argument of type 'number' is not assignable to parameter of \
             type 'ConstructorOfATypedSvelteComponent'.\n\nPossible causes:\n- You use the \
             instance type of a component where you should use the constructor type\n- Type \
             definitions are missing for this Svelte Component. \n"
        )
    };
    let expected = [
        noted("NoteJS.svelte(4,4)"),
        noted("NoteTS.svelte(4,4)"),
        "src/NoteTS.svelte(5,4): error TS2345: Argument of type 'number' is not assignable to \
         parameter of type 'string'.\n"
            .to_owned(),
        "src/plain.ts(2,3): error TS2345: Argument of type 'number' is not assignable to \
         parameter of type 'ConstructorOfATypedSvelteComponent'.\n"
            .to_owned(),
    ]
    .concat();
    assert!(report.contains(&expected), "{report}");
}
