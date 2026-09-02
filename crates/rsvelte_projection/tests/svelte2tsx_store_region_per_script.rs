//! A store-subscription ignore region is per `ImplicitStoreValues` INSTANCE,
//! and a component with a module script has two of them.
//!
//! `index.ts:202` builds a second `ImplicitStoreValues` for the module script,
//! seeded with the instance script's accessed stores but with its own
//! `importStatements`. Each one runs `attachStoreValueDeclarationOfImportsToRenderFn`,
//! which wraps ITS names in one `/*\u{03A9}ignore_start\u{03A9}*/ … /*\u{03A9}ignore_end\u{03A9}*/`
//! region and appends it at the render-function start — so the two scripts'
//! imports are two adjacent regions, the instance's first, because the instance
//! script is processed before the module script.
//!
//! rsvelte collected both scripts' import names into one list and emitted one
//! region. Two rows separate a faithful port from one that merely splits
//! adjacent regions: a name imported by BOTH scripts is declared in both
//! regions (the second instance is seeded with the accessed stores, not with
//! the first one's import list), and the instance region comes first even when
//! the module script is written second.
//!
//! The shape below abbreviates the emitted lines: `[` and `]` are the ignore
//! delimiters, `<n>` is `;let $n = __sveltets_2_store_get(n);`, and ` | ` joins
//! separate lines. Every expectation is the pinned `submodules/language-tools`
//! svelte2tsx's own output on the same source.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

/// The emitted store-subscription lines, with the ignore delimiters and the
/// declarations abbreviated.
fn store_shape(src: &str) -> String {
    let code = svelte2tsx(
        src,
        Svelte2TsxOptions {
            filename: "T.svelte".to_string(),
            is_ts_file: true,
            ..Default::default()
        },
    )
    .expect("svelte2tsx")
    .code;
    let lines: Vec<&str> = code
        .lines()
        .filter(|line| line.contains("__sveltets_2_store_get"))
        .collect();
    if lines.is_empty() {
        return "(none)".to_string();
    }
    let mut out = lines.join(" | ");
    out = out
        .replace("/*\u{03A9}ignore_start\u{03A9}*/", "[")
        .replace("/*\u{03A9}ignore_end\u{03A9}*/", "]");
    // `;let $n = __sveltets_2_store_get(n);` -> `<n>`
    let mut abbreviated = String::new();
    let mut rest = out.as_str();
    while let Some(at) = rest.find(";let $") {
        abbreviated.push_str(&rest[..at]);
        let after = &rest[at + ";let $".len()..];
        let name_end = after
            .find(' ')
            .expect("a store declaration has a space after its name");
        abbreviated.push('<');
        abbreviated.push_str(&after[..name_end]);
        abbreviated.push('>');
        let tail = &after[name_end..];
        let end = tail.find(");").expect("a store declaration ends with `);`");
        rest = &tail[end + 2..];
    }
    abbreviated.push_str(rest);
    abbreviated.trim().to_string()
}

#[test]
fn each_script_gets_its_own_store_subscription_region() {
    let mut failures = Vec::new();
    for (label, src, expected) in [
        (
            "two imports, two modules",
            "<script lang=\"ts\">\n\timport { columns } from './a';\n\timport { canWrite } from './b';\n</script>\n<p>{$columns}{$canWrite}</p>",
            "[<columns><canWrite>]",
        ),
        (
            "two imports, one module",
            "<script lang=\"ts\">\n\timport { a, b } from './a';\n</script>\n<p>{$a}{$b}</p>",
            "[<a><b>]",
        ),
        (
            "one import",
            "<script lang=\"ts\">\n\timport { a } from './a';\n</script>\n<p>{$a}</p>",
            "[<a>]",
        ),
        (
            "two local lets",
            "<script lang=\"ts\">\n\tlet a = 1;\n\tlet b = 2;\n</script>\n<p>{$a}{$b}</p>",
            "let a = 1[<a>]; | \tlet b = 2[<b>];",
        ),
        (
            "one let, two declarators",
            "<script lang=\"ts\">\n\tlet a = 1, b = 2;\n</script>\n<p>{$a}{$b}</p>",
            "let a = 1, b = 2[<a>][<b>];",
        ),
        (
            "module + instance import",
            "<script lang=\"ts\" module>\n\timport { columns } from './a';\n</script>\n<script lang=\"ts\">\n\timport { canWrite } from './b';\n</script>\n<p>{$columns}{$canWrite}</p>",
            "[<canWrite>][<columns>]",
        ),
        (
            "module only",
            "<script lang=\"ts\" module>\n\timport { columns } from './a';\n</script>\n<p>{$columns}</p>",
            "async () => {[<columns>]",
        ),
        (
            "instance only",
            "<script lang=\"ts\">\n\timport { canWrite } from './b';\n</script>\n<p>{$canWrite}</p>",
            "[<canWrite>]",
        ),
        (
            "module 2 + instance 1",
            "<script lang=\"ts\" module>\n\timport { m1 } from './a';\n\timport { m2 } from './b';\n</script>\n<script lang=\"ts\">\n\timport { i1 } from './c';\n</script>\n<p>{$m1}{$m2}{$i1}</p>",
            "[<i1>][<m1><m2>]",
        ),
        (
            "context=module spelling",
            "<script lang=\"ts\" context=\"module\">\n\timport { columns } from './a';\n</script>\n<script lang=\"ts\">\n\timport { canWrite } from './b';\n</script>\n<p>{$columns}{$canWrite}</p>",
            "[<canWrite>][<columns>]",
        ),
        (
            "module import + instance let",
            "<script lang=\"ts\" module>\n\timport { columns } from './a';\n</script>\n<script lang=\"ts\">\n\tlet canWrite = 1;\n</script>\n<p>{$columns}{$canWrite}</p>",
            "[<columns>] | \tlet canWrite = 1[<canWrite>];",
        ),
        (
            "same name imported in both",
            "<script lang=\"ts\" module>\n\timport { a } from './a';\n</script>\n<script lang=\"ts\">\n\timport { a } from './a';\n</script>\n<p>{$a}</p>",
            "[<a>][<a>]",
        ),
        (
            "module import unused in template",
            "<script lang=\"ts\" module>\n\timport { m } from './a';\n</script>\n<script lang=\"ts\">\n\timport { i } from './b';\n</script>\n<p>{$i}</p>",
            "[<i>]",
        ),
        (
            "instance import unused",
            "<script lang=\"ts\" module>\n\timport { m } from './a';\n</script>\n<script lang=\"ts\">\n\timport { i } from './b';\n</script>\n<p>{$m}</p>",
            "[<m>]",
        ),
        (
            "module store used only in module",
            "<script lang=\"ts\" module>\n\timport { m } from './a';\n\tconst x = $m;\n</script>\n<script lang=\"ts\">\n\timport { i } from './b';\n</script>\n<p>{$i}</p>",
            "[<i>]",
        ),
        (
            "two instance, two module",
            "<script lang=\"ts\" module>\n\timport { m1 } from './a';\n\timport { m2 } from './b';\n</script>\n<script lang=\"ts\">\n\timport { i1 } from './c';\n\timport { i2 } from './d';\n</script>\n<p>{$m1}{$m2}{$i1}{$i2}</p>",
            "[<i1><i2>][<m1><m2>]",
        ),
        (
            "module first in file order",
            "<script lang=\"ts\">\n\timport { i1 } from './c';\n</script>\n<script lang=\"ts\" module>\n\timport { m1 } from './a';\n</script>\n<p>{$m1}{$i1}</p>",
            "[<i1>][<m1>]",
        ),
    ] {
        let actual = store_shape(src);
        if actual != expected {
            failures.push(format!("{label}: expected {expected:?}, got {actual:?}"));
        }
    }
    assert!(failures.is_empty(), "{}", failures.join("\n"));
}
