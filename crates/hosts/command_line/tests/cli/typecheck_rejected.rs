//! What an import reads of a component svelte2tsx rejects.

use crate::typecheck::Native;
use crate::typecheck_events::check;

/// svelte-check reads such a component as its instance script, else its module script, which it
/// finds without Svelte's parse. svelte-check 4.7.8 reports these errors.
#[test]
fn typecheck_reads_a_rejected_component_as_its_script() {
    let tsconfig = (
        "tsconfig.json",
        r#"{"compilerOptions":{"strict":true,"module":"esnext","moduleResolution":"bundler",
"target":"esnext","types":[],"skipLibCheck":true,"allowJs":true},"include":["src"]}"#,
    );
    let report = check(&[
        tsconfig,
        (
            "src/A.svelte",
            "<script lang=\"ts\">\n\tlet { v }: { v?: number } = $props();\n\texport const y = \
             1;\n</script>\n\n<div {\n",
        ),
        (
            "src/B.svelte",
            "<script module lang=\"ts\">\n\texport const m = 1;\n</script>\n\n{v +}\n",
        ),
        (
            "src/C.svelte",
            "<script>\n\t// é 😀\n\texport const y = 1;\n</script>\n\n{v +}\n",
        ),
        (
            "src/P.svelte",
            "<script lang=\"ts\">\n\timport A, { y } from \"./A.svelte\";\n\timport B, { m } from \
             \"./B.svelte\";\n\timport C, { y as z } from \"./C.svelte\";\n\tconst s: string = \
             y;\n\tconst t: string = m;\n\tconst u: string = z;\n</script>\n\n<A /><B /><C \
             />{s}{t}{u}\n",
        ),
    ]);
    let root = report
        .split("Module '\"")
        .nth(1)
        .and_then(|rest| rest.split("src/A.svelte").next())
        .unwrap_or_else(|| panic!("{report}"));
    let no_default = |line: u32, name: &str| {
        format!(
            "src/P.svelte({line},9): error TS1192: Module '\"{root}src/{name}.svelte\"' has no \
             default export.\n"
        )
    };
    let number = |line: u32| {
        format!(
            "src/P.svelte({line},8): error TS2322: Type 'number' is not assignable to type \
             'string'.\n"
        )
    };
    let expected = [
        no_default(2, "A"),
        no_default(3, "B"),
        no_default(4, "C"),
        number(5),
        number(6),
        number(7),
    ]
    .concat();
    assert!(report.contains(&expected.native()), "{report}");
}

/// Such a script that neither imports nor exports, top-level `await` or not, is a global script in
/// svelte-check, whose names every file reads, here an empty file: an import of the component
/// reports TS2306 in both, and a read of its name TS2304 here where svelte-check 4.7.8 reads it as
/// `number`.
#[test]
fn typecheck_declares_no_global_for_a_rejected_component_s_script() {
    let tsconfig = (
        "tsconfig.json",
        r#"{"compilerOptions":{"strict":true,"module":"esnext","moduleResolution":"bundler",
"target":"esnext","types":[],"skipLibCheck":true,"allowJs":true},"include":["src"]}"#,
    );
    let report = check(&[
        tsconfig,
        (
            "src/R.svelte",
            "<script lang=\"ts\">\n\tlet tsx = 1;\n</script>\n\n<div {\n",
        ),
        (
            "src/T.svelte",
            "<script lang=\"ts\">\n\tconst t = await fetch(\"x\");\n</script>\n\n<div {\n",
        ),
        (
            "src/J.svelte",
            "<script>\n\tconst j = await fetch(\"x\");\n</script>\n\n<div {\n",
        ),
        (
            "src/P.svelte",
            "<script lang=\"ts\">\n\timport * as r from \"./R.svelte\";\n\timport * as t from \
             \"./T.svelte\";\n\timport * as j from \"./J.svelte\";\n\tconst s: string = \
             tsx;\n</script>\n\n{r}{s}{t}{j}\n",
        ),
    ]);
    for (line, name) in [(2, "R"), (3, "T"), (4, "J")] {
        let at = format!("src/P.svelte({line},21): error TS2306: File '").native();
        let not_a_module = (report.lines())
            .find(|found| found.starts_with(&at))
            .unwrap_or_else(|| panic!("{report}"));
        let end = format!("src/{name}.svelte' is not a module.");
        assert!(not_a_module.ends_with(&end), "{report}");
    }
    let unbound = "src/P.svelte(5,20): error TS2304: Cannot find name 'tsx'.\n";
    assert!(report.contains(&unbound.native()), "{report}");
}
