//! `transform-client.js:201` unshifts the legacy `$.reactive_import(…)`
//! declarations onto the MODULE program's body, and `:513` then assembles the
//! output as `[...imports, ...module_level_snippets, ...body]` — so a hoisted
//! `{#snippet}` is emitted before them, not after. rsvelte placed them
//! immediately after the imports.
//!
//! A `$.reactive_import` is produced only in legacy mode and only for an
//! instance-script import whose binding is MUTATED (`theme.x = 1`); a
//! reassignment is a compile error, so that is not the shape that reaches it.
//!
//! Every expected order was taken from the official Svelte compiler
//! (`submodules/svelte/packages/svelte/src/compiler/index.js`).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// The order of the two module-level declarations, as `"snippet"` /
/// `"reactive_import"` in the order they appear.
fn declaration_order(src: &str) -> Vec<&'static str> {
    let js = compile(
        src,
        CompileOptions {
            filename: Some("M.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    js.lines()
        .map(str::trim)
        .filter_map(|l| {
            if l.starts_with("const s = ") {
                Some("snippet")
            } else if l.contains("$.reactive_import") {
                Some("reactive_import")
            } else {
                None
            }
        })
        .collect()
}

const MUTATED_IMPORT_AND_SNIPPET: &str = "<script>\n\timport { theme } from './t.js';\n\tfunction go() { theme.x = 1; }\n</script>\n{#snippet s()}<b>x</b>{/snippet}\n<button on:click={go}>{@render s()}</button>\n";

const TWO_MUTATED_IMPORTS_AND_SNIPPET: &str = "<script>\n\timport { theme } from './t.js';\n\timport { chords } from './c.js';\n\tfunction go() { theme.x = 1; chords.y = 2; }\n</script>\n{#snippet s()}<b>x</b>{/snippet}\n<button on:click={go}>{@render s()}</button>\n";

/// Neither declaration exists without the other's trigger, so each control has
/// exactly one of the two and cannot express an order at all.
const MUTATED_IMPORT_ONLY: &str = "<script>\n\timport { theme } from './t.js';\n\tfunction go() { theme.x = 1; }\n</script>\n<button on:click={go}>x</button>\n";

const SNIPPET_ONLY: &str = "<script>\n\timport { theme } from './t.js';\n</script>\n{#snippet s()}<b>{theme}</b>{/snippet}\n<button>{@render s()}</button>\n";

#[test]
fn a_hoisted_snippet_precedes_the_legacy_reactive_imports() {
    assert_eq!(
        declaration_order(MUTATED_IMPORT_AND_SNIPPET),
        ["snippet", "reactive_import"]
    );
    assert_eq!(
        declaration_order(TWO_MUTATED_IMPORTS_AND_SNIPPET),
        ["snippet", "reactive_import", "reactive_import"]
    );

    // Each half on its own still appears, so a fix that drops one of them
    // rather than reordering fails here.
    assert_eq!(declaration_order(MUTATED_IMPORT_ONLY), ["reactive_import"]);
    assert_eq!(declaration_order(SNIPPET_ONLY), ["snippet"]);
}
