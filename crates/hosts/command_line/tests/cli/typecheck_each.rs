//! `rsvelte typecheck` of an `{#each}` block, which svelte2tsx writes as a `for…of` over its item.

use crate::typecheck::Native;
use crate::typecheck_events::check;

/// Under `noUnusedLocals`, each unused name of the block is TS6133 at that name: the item, the
/// index, which svelte2tsx declares in the loop's body, and the item of a nested block.
/// svelte-check 4.7.8 reports these lines.
#[test]
fn typecheck_reports_each_unused_name_of_an_each_block() {
    let tsconfig = (
        "tsconfig.json",
        r#"{"compilerOptions":{"strict":true,"module":"esnext","moduleResolution":"bundler",
"target":"esnext","types":[],"skipLibCheck":true,"allowJs":true,"checkJs":true,
"noUnusedLocals":true},"include":["src"]}"#,
    );
    let blocks = [
        ("Item", "{#each [1] as x}b{/each}"),
        ("ItemIndex", "{#each [1] as x, i}b{/each}"),
        ("KeyedIndex", "{#each [1] as x, i (i)}b{/each}"),
        ("NoItemIndex", "{#each [1], i}b{/each}"),
        (
            "Nested",
            "{#each [[1]] as row}{#each row as cell}b{/each}{/each}",
        ),
    ];
    let mut sources = Vec::new();
    for (lang, suffix) in [(" lang=\"ts\"", "TS"), ("", "JS")] {
        for (name, block) in blocks {
            sources.push((
                format!("src/{name}{suffix}.svelte"),
                format!("<script{lang}>\n\tlet a = 1;\n</script>\n\n{{a}}{block}\n"),
            ));
        }
    }
    let mut files = vec![tsconfig];
    files.extend(
        sources
            .iter()
            .map(|(path, text)| (path.as_str(), text.as_str())),
    );
    let report = check(&files);
    let lines: Vec<_> = report.lines().filter(|l| l.starts_with("src")).collect();
    let unused =
        |name: &str| format!("error TS6133: '{name}' is declared but its value is never read.");
    let mut expected = Vec::new();
    for suffix in ["JS", "TS"] {
        expected.extend([
            format!("src/Item{suffix}.svelte(5,18): {}", unused("x")),
            format!("src/ItemIndex{suffix}.svelte(5,18): {}", unused("x")),
            format!("src/ItemIndex{suffix}.svelte(5,21): {}", unused("i")),
            format!("src/KeyedIndex{suffix}.svelte(5,18): {}", unused("x")),
            format!("src/Nested{suffix}.svelte(5,38): {}", unused("cell")),
            format!("src/NoItemIndex{suffix}.svelte(5,16): {}", unused("i")),
        ]);
    }
    expected.sort();
    assert_eq!(
        lines,
        expected.iter().map(|l| l.native()).collect::<Vec<_>>()
    );
}
