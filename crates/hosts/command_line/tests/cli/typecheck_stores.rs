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

/// A JavaScript component reads `$store` with svelte2tsx's getter, as a TypeScript one does: a
/// value that is no store is reported at each read, and a store keeps its value's type.
/// svelte-check 4.7.8 reports these lines.
#[test]
fn typecheck_reads_a_store_of_a_javascript_component_as_svelte2tsx_does() {
    let report = check(&[
        CHECK_JAVASCRIPT,
        (
            "src/values.ts",
            "import { writable } from 'svelte/store';\nexport const num = 5;\n\
             export const str: string = '';\nexport const w = writable(1);\n",
        ),
        (
            "src/custom.js",
            "export const custom = { subscribe(run) { run(1); return () => {}; } };\n",
        ),
        (
            "src/Number.svelte",
            "<script>\n\timport { num } from './values';\n</script>\n\n{$num}\n",
        ),
        (
            "src/Assign.svelte",
            "<script>\n\timport { str } from './values';\n</script>\n\n\
             <button onclick={() => { $str = 2; }}>x</button>\n",
        ),
        (
            "src/Before.svelte",
            "<script>\n\tconst y = $x;\n\tconst x = 1;\n</script>\n\n{y}\n",
        ),
        (
            "src/Custom.svelte",
            "<script>\n\timport { custom } from './custom.js';\n\t/** @type {{ a: 1 }} */\n\
             \tconst c = $custom;\n</script>\n\n{c}\n",
        ),
        (
            "src/Store.svelte",
            "<script>\n\timport { w } from './values';\n\t/** @type {string} */\n\
             \tconst s = $w;\n</script>\n\n{s}\n",
        ),
    ]);
    let lines: Vec<_> = report.lines().filter(|l| l.starts_with("src")).collect();
    let store = |name: &str| {
        format!(
            "error TS2769: Cannot use '{name}' as a store. '{name}' needs to be an object with a \
             subscribe method on it."
        )
    };
    let expected = [
        format!("src/Assign.svelte(5,26): {}", store("str")),
        "src/Before.svelte(2,12): error TS2448: Block-scoped variable '$x' used before its \
         declaration."
            .to_owned(),
        format!("src/Before.svelte(2,12): {}", store("x")),
        "src/custom.js(1,35): error TS7006: Parameter 'run' implicitly has an 'any' type."
            .to_owned(),
        format!("src/Number.svelte(5,2): {}", store("num")),
        "src/Store.svelte(4,8): error TS2322: Type 'number' is not assignable to type 'string'."
            .to_owned(),
    ];
    assert_eq!(
        lines,
        expected.iter().map(|l| l.native()).collect::<Vec<_>>()
    );
}

/// svelte2tsx declares `$x` for a default or named import `x` and not for a namespace import, which
/// has no name of its own, in either script. So `$ns` is a name TypeScript cannot find, even when
/// the module would make a store. svelte-check 4.7.8 reports these lines.
#[test]
fn typecheck_reads_a_namespace_import_as_a_name_that_is_not_declared() {
    let mut files = vec![
        CHECK_JAVASCRIPT,
        (
            "src/s.ts",
            "import { writable } from 'svelte/store';\nexport const num = 5;\n\
             export const w = writable(1);\nexport default writable(2);\n",
        ),
        (
            "src/storeish.ts",
            "export function subscribe(run: (v: number) => void) {\n\trun(1);\n\treturn () => {};\n\
             }\n",
        ),
    ];
    let mut sources = Vec::new();
    for (lang, suffix) in [(" lang=\"ts\"", "TS"), ("", "JS")] {
        let component = |name: &str, head: &str, body: &str, template: &str| {
            (
                format!("src/{name}{suffix}.svelte"),
                format!("{head}<script{lang}>\n\t{body}\n</script>\n\n{template}\n"),
            )
        };
        let module = format!("<script module{lang}>\n\timport * as mns from './s';\n</script>\n\n");
        sources.extend([
            component("Ns", "", "import * as ns from './s';", "{$ns}"),
            component("Store", "", "import * as st from './storeish';", "{$st}"),
            component(
                "DefaultNs",
                "",
                "import dw, * as ns2 from './s';",
                "{$dw}{$ns2}",
            ),
            component("Module", &module, "", "{$mns}"),
        ]);
    }
    files.extend(
        sources
            .iter()
            .map(|(path, text)| (path.as_str(), text.as_str())),
    );
    let report = check(&files);
    let lines: Vec<_> = report.lines().filter(|l| l.starts_with("src")).collect();
    let mut expected = Vec::new();
    for suffix in ["JS", "TS"] {
        expected.extend([
            format!(
                "src/DefaultNs{suffix}.svelte(5,7): error TS2552: Cannot find name '$ns2'. Did you \
                 mean 'ns2'?"
            ),
            format!(
                "src/Module{suffix}.svelte(9,2): error TS2552: Cannot find name '$mns'. Did you \
                 mean 'mns'?"
            ),
            format!("src/Ns{suffix}.svelte(5,2): error TS2304: Cannot find name '$ns'."),
            format!("src/Store{suffix}.svelte(5,2): error TS2304: Cannot find name '$st'."),
        ]);
    }
    expected.sort();
    assert_eq!(
        lines,
        expected.iter().map(|l| l.native()).collect::<Vec<_>>()
    );
}
