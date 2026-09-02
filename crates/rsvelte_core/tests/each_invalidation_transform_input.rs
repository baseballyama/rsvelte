//! `$.invalidate_inner_signals(() => (…))` names the bindings an each-item
//! mutation must invalidate, and each name goes through that binding's read
//! transform. A legacy reactive import's read expects the identifier already
//! swapped for its `$$_import_` alias — `program.rs` registers that swap as
//! `replacement_id` — and the each-block site passed the raw name instead, so
//! `settings` came out as `settings()`: a call on the module binding, which is
//! also exactly what a prop read looks like.
//!
//! The rows below vary the binding KIND behind one fixed each block, so a fix
//! that widens the swap to a kind that must not have it is visible as a moved
//! control. Every expected fragment was taken from the official Svelte compiler
//! (`submodules/svelte/packages/svelte/src/compiler/index.js`).

use rsvelte_core::compiler::CompileOptions;
use rsvelte_core::{GenerateMode, compile};

fn invalidation_lines(head: &str, body: &str) -> Vec<String> {
    let src = format!("<script>\n{head}\n</script>\n\n{body}\n");
    let js = compile(
        &src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    js.lines()
        .filter(|l| l.contains("invalidate_inner_signals"))
        .map(|l| l.trim().to_string())
        .collect()
}

const IMPORT: &str = "  import { settings } from './settings.js';";
const EACH: &str =
    "{#each settings.filters as filter, index}\n  <input bind:value={filter.match} />\n{/each}";
/// A write to a member of the import is what makes it a `$.reactive_import`.
const MUTATE: &str = "<input bind:value={settings.language} />\n";

#[test]
fn a_reactive_import_is_invalidated_through_its_import_alias() {
    assert_eq!(
        invalidation_lines(IMPORT, &format!("{MUTATE}\n{EACH}")),
        vec!["$.invalidate_inner_signals(() => ($$_import_settings()))"]
    );
}

/// The same alias inside a sequence: the inner each item resolves through a
/// different transform in the same argument list, so a swap applied to the
/// wrong element of the sequence is visible here and nowhere else.
#[test]
fn a_reactive_import_keeps_its_alias_beside_an_each_item() {
    let body = format!(
        "{MUTATE}\n{{#each settings.filters as filter}}\n  {{#each filter.rules as rule}}\n    <input bind:value={{rule.match}} />\n  {{/each}}\n{{/each}}"
    );
    assert_eq!(
        invalidation_lines(IMPORT, &body),
        vec!["$.invalidate_inner_signals(() => ($.get(filter), $$_import_settings()))"]
    );
}

/// The three kinds that must NOT be renamed. `exported-prop` is the control
/// that matters: `settings()` is what the defect produced, so a test that only
/// asserted "not the raw name" would have passed on the bug.
#[test]
fn the_other_binding_kinds_keep_their_own_read_transform() {
    for (head, body, expected) in [
        (
            IMPORT,
            EACH.to_string(),
            "$.invalidate_inner_signals(() => (settings))",
        ),
        (
            "  let settings = { filters: [], language: 'en' };",
            format!("{MUTATE}\n{EACH}"),
            "$.invalidate_inner_signals(() => ($.get(settings)))",
        ),
        (
            "  export let settings;",
            format!("{MUTATE}\n{EACH}"),
            "$.invalidate_inner_signals(() => (settings()))",
        ),
    ] {
        assert_eq!(
            invalidation_lines(head, &body),
            vec![expected],
            "head `{head}`"
        );
    }
}
