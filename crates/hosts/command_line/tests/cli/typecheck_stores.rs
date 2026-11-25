//! `rsvelte typecheck` of what svelte2tsx writes between its ignore comments: the declarations of
//! `$store` and of a component's snippets.

use crate::typecheck::Native;
use crate::typecheck_events::check;

const CHECK_JAVASCRIPT: (&str, &str) = (
    "tsconfig.json",
    r#"{"compilerOptions":{"strict":true,"module":"esnext","moduleResolution":"bundler",
"target":"esnext","types":[],"skipLibCheck":true,"allowJs":true,"checkJs":true},
"include":["src"]}"#,
);

/// A finding in the declaration of `$store` is dropped, except that the store is no store, which is
/// reported at each read. A finding on the store's name elsewhere stays. svelte-check 4.7.8 reports
/// these lines.
#[test]
fn typecheck_drops_findings_in_a_store_declaration() {
    let report = check(&[
        CHECK_JAVASCRIPT,
        (
            "src/values.ts",
            "export interface T {\n\ta: 1;\n}\nexport const n = 5;\n",
        ),
        (
            "src/Bom.svelte",
            "\u{feff}<script lang=\"ts\">\n\timport { n } from './values';\n</script>\n\n\
             é{$n}{$n}\n",
        ),
        (
            "src/Javascript.svelte",
            "<script>\n\tconst x = $x;\n</script>\n\n{x}\n",
        ),
        (
            "src/Missing.svelte",
            "<script lang=\"ts\">\n\timport { nope } from './values';\n</script>\n\n{$nope}\n",
        ),
        (
            "src/Self.svelte",
            "<script lang=\"ts\">\n\tconst x = $x;\n</script>\n\n{x}\n",
        ),
        (
            "src/Type.svelte",
            "<script lang=\"ts\">\n\timport type { T } from './values';\n</script>\n\n{$T}{T}\n",
        ),
    ]);
    // A copy keeps TypeScript's message but for the line about the content mapper's code.
    let first = "src/Bom.svelte(5,3): error TS2769: Cannot use 'n' as a store. 'n' needs to be an \
                 object with a subscribe method on it."
        .native();
    let copy: Vec<_> = (report.lines())
        .skip_while(|l| *l != first)
        .take_while({
            let mut first = true;
            move |l| std::mem::take(&mut first) || !l.starts_with("src")
        })
        .collect();
    assert_eq!(
        copy,
        [
            first.as_str(),
            "",
            "No overload matches this call.",
            "  The last overload gave the following error.",
            "    Argument of type 'number' is not assignable to parameter of type \
             'SvelteStore<any>'.",
        ]
    );
    let lines: Vec<_> = report.lines().filter(|l| l.starts_with("src")).collect();
    let store = "error TS2769: Cannot use 'n' as a store. 'n' needs to be an object with a \
                 subscribe method on it.";
    let self_reference = |name: &str, column: u32| {
        [
            format!(
                "src/{name}.svelte(2,{column}): error TS7022: 'x' implicitly has type 'any' \
                 because it does not have a type annotation and is referenced directly or \
                 indirectly in its own initializer."
            ),
            format!(
                "src/{name}.svelte(2,{}): error TS2448: Block-scoped variable '$x' used before \
                 its declaration.",
                column + 4
            ),
        ]
    };
    let mut expected = vec![
        format!("src/Bom.svelte(5,3): {store}"),
        format!("src/Bom.svelte(5,7): {store}"),
    ];
    expected.extend(self_reference("Javascript", 8));
    expected.push(
        "src/Missing.svelte(2,11): error TS2305: Module '\"./values\"' has no exported member \
         'nope'."
            .to_owned(),
    );
    expected.extend(self_reference("Self", 8));
    expected.push(
        "src/Type.svelte(5,6): error TS2693: 'T' only refers to a type, but is being used as a \
         value here."
            .to_owned(),
    );
    assert_eq!(
        lines,
        expected.iter().map(|l| l.native()).collect::<Vec<_>>()
    );
}

/// A finding in the declaration of a component's snippets is dropped, such as that the component is
/// none. A finding on the snippet's name elsewhere, and in its body, stays. svelte-check 4.7.8
/// drops the first and reports the others.
#[test]
fn typecheck_drops_findings_in_a_declaration_of_snippets() {
    let report = check(&[
        CHECK_JAVASCRIPT,
        (
            "src/Wrong.svelte",
            "<script lang=\"ts\">\n\tlet { foo }: { foo: number } = $props();\n</script>\n\n\
             {foo}\n",
        ),
        (
            "src/App.svelte",
            "<script lang=\"ts\">\n\timport Wrong from './Wrong.svelte';\n</script>\n\n\
             <Wrong>{#snippet foo()}a{/snippet}</Wrong>\n",
        ),
        (
            "src/Javascript.svelte",
            "<script>\n\tconst P = 5;\n</script>\n\n<P>{#snippet foo()}{missing}{/snippet}</P>\n",
        ),
        (
            "src/Number.svelte",
            "<script lang=\"ts\">\n\tconst P = 5;\n</script>\n\n\
             <P>{#snippet foo()}{missing}{/snippet}</P>\n",
        ),
    ]);
    assert!(!report.contains("check_unmapped"), "{report}");
    for line in [
        "src/App.svelte(5,18): error TS2322: Type '() => any' is not assignable to type 'number'.",
        "src/Javascript.svelte(5,21): error TS2304: Cannot find name 'missing'.",
        "src/Number.svelte(5,21): error TS2304: Cannot find name 'missing'.",
    ] {
        assert!(report.contains(&line.native()), "{line} in {report}");
    }
}
