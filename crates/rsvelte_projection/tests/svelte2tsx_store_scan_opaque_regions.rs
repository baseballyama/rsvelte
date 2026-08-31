//! `$name` is a store reference only where official's walker can SEE an
//! identifier.
//!
//! Upstream resolves store auto-subscriptions from the TypeScript AST of the
//! instance script plus the template's expressions, so a `$name` that is CSS, a
//! string's contents, a template literal's text, or an import specifier's
//! imported name is never a reference. rsvelte resolves them from a byte scan
//! over the whole source, and the scan saw all four — one
//! `import { $getSelection as getSelection }` produced
//! `let $getSelection = __sveltets_2_store_get(getSelection);`, a SCSS
//! `@mixin m($color)` made a `color` prop a store, and `'./$types.js'` made a
//! neighbouring `const types` one.
//!
//! Every expectation below is the official tool's own output, measured on the
//! same source with `{isTsFile: true, mode: 'ts', namespace: 'html',
//! version: '5'}` — the options `svelte2tsx-compile.mjs` uses.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

/// The store names `__sveltets_2_store_get(...)` is called with, sorted.
fn store_gets(src: &str) -> Vec<String> {
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
    let mut found: Vec<String> = code
        .match_indices("__sveltets_2_store_get(")
        .map(|(at, needle)| {
            let rest = &code[at + needle.len()..];
            let end = rest.find(')').unwrap_or(rest.len());
            rest[..end].to_string()
        })
        .collect();
    found.sort();
    found
}

#[test]
fn a_dollar_name_in_an_opaque_region_is_not_a_store() {
    let mut failures = Vec::new();
    for (name, src) in [
        (
            "aliased import specifier",
            "<script lang=\"ts\">\n\timport { $getSelection as getSelection } from 'lexical';\n\tgetSelection();\n</script>\n<p>x</p>",
        ),
        (
            "bare import specifier",
            "<script lang=\"ts\">\n\timport { $getSelection } from 'lexical';\n\t$getSelection();\n</script>\n<p>x</p>",
        ),
        (
            "module specifier string",
            "<script lang=\"ts\">\n\timport type { LayoutData } from './$types.js';\n\tconst types = 1;\n\tlet d: LayoutData;\n</script>\n<p>{types}{d}</p>",
        ),
        (
            "string literal",
            "<script lang=\"ts\">\n\tconst types = 1;\n\tconst p = 'a/$types';\n</script>\n<p>{types}{p}</p>",
        ),
        (
            "template literal text",
            "<script lang=\"ts\">\n\tconst types = 1;\n\tconst p = `a/$types`;\n</script>\n<p>{types}{p}</p>",
        ),
        (
            "scss variable",
            "<script lang=\"ts\">\n\tlet { color } = $props();\n</script>\n<p>{color}</p>\n<style lang=\"scss\">\n\t@mixin m($color) { color: $color; }\n</style>",
        ),
    ] {
        let found = store_gets(src);
        if !found.is_empty() {
            failures.push(format!("{name}: {found:?}"));
        }
    }
    // Collected rather than asserted per row: each row is a different opaque
    // region, and a fix for one must not report as a pass for the rest.
    assert!(failures.is_empty(), "{failures:#?}");
}

/// CONTROL — the same mechanisms must not swallow a real subscription. Each row
/// is a `$name` official DOES resolve, sitting next to or inside the construct
/// the rows above exclude.
#[test]
fn a_real_store_reference_still_subscribes() {
    let mut failures = Vec::new();
    for (name, src, expected) in [
        (
            "plain script read",
            "<script lang=\"ts\">\n\timport { count } from './s';\n\tconst v = $count;\n</script>\n<p>{v}</p>",
            "count",
        ),
        (
            "template-only read",
            "<script lang=\"ts\">\n\timport { navigating } from './s';\n</script>\n{#if !!$navigating}x{/if}",
            "navigating",
        ),
        (
            // A `${…}` interpolation is code; only the literal's text chunks are
            // opaque, so excluding the whole template literal would lose this.
            "template literal interpolation",
            "<script lang=\"ts\">\n\timport { count } from './s';\n\tconst p = `v=${$count}`;\n</script>\n<p>{p}</p>",
            "count",
        ),
        (
            // The style blanker must find the `<style>` element, not the first
            // `<style` byte pair: written inside a script comment there is no
            // closing tag, and blanking to EOF ate the template's own read.
            "a `<style>` written inside a script comment",
            "<script lang=\"ts\">\n\timport { navigating } from './s';\n\t// a literal <style> in a comment\n</script>\n{#if !!$navigating}x{/if}",
            "navigating",
        ),
        (
            // `$` continues a JS identifier, so the store is `app$`, not `app`.
            // Reading `app` instead made the neighbouring `const app` a store —
            // and a `\w`-only probe cannot see the difference, because it drops
            // the `$` from BOTH sides.
            "a `$`-suffixed identifier is one name",
            "<script lang=\"ts\">\n\timport { app$ } from './s';\n\tconst app = $app$;\n</script>\n<p>{app}</p>",
            "app$",
        ),
    ] {
        let found = store_gets(src);
        if found != vec![expected.to_string()] {
            failures.push(format!("{name}: expected [{expected}], got {found:?}"));
        }
    }
    assert!(failures.is_empty(), "{failures:#?}");
}
