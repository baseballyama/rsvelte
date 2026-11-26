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
