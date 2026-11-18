//! Upstream's `declaration_duplicate` for the template's declarations and the instance's imports.

use super::directives::assert_outcomes;

#[test]
fn a_name_declared_again_in_its_scope_is_a_duplicate() {
    assert_outcomes(&[
        (
            "{#each items as it}{#if x}{@const it = 1}{/if}{/each}",
            None,
        ),
        (
            "<script>let foo = 1;</script>{#if x}{let foo = 2}{/if}",
            None,
        ),
        (
            concat!(
                "<script module lang=\"ts\">class Foo {}</script><script lang=\"ts\">",
                "import type { Foo } from \"./t\"; import { type Bar } from \"./t\";</script>",
            ),
            None,
        ),
        (
            "{#each items as it}{@const it = 1}x{/each}",
            Some(("declaration_duplicate", (27, 29))),
        ),
        (
            "{#each items as item}{@const a = item}{@const a = item}{/each}",
            Some(("declaration_duplicate", (46, 47))),
        ),
        (
            "<script>let foo = 1;</script>{let foo = 2}",
            Some(("declaration_duplicate", (34, 37))),
        ),
        (
            "{#snippet row(item)}{@const item = 1}{item}{/snippet}",
            Some(("declaration_duplicate", (28, 32))),
        ),
        // Upstream declares the value after it walks the branch, so the value is the duplicate.
        (
            "{#await p then v}{@const v = 1}{v}{/await}",
            Some(("declaration_duplicate", (15, 16))),
        ),
        (
            concat!(
                "<script module>import { a } from \"./a\";</script>",
                "<script>import { a } from \"./a\";</script>{a}",
            ),
            Some(("declaration_duplicate", (65, 66))),
        ),
    ]);
}

const CHILD: &str = "<script>import Child from \"./C.svelte\"; function act() {}</script>";

#[test]
fn a_fragment_takes_attributes_and_let_directives_only() {
    let cases = [
        (
            "<Child><svelte:fragment slot=\"s\" foo=\"x\" let:a>{a}</svelte:fragment></Child>",
            None,
        ),
        (
            "<Child><svelte:fragment slot=\"s\" use:act></svelte:fragment></Child>",
            Some(("svelte_fragment_invalid_attribute", (99, 106))),
        ),
        (
            "<Child><svelte:fragment slot=\"s\" {...o}></svelte:fragment></Child>",
            Some(("svelte_fragment_invalid_attribute", (99, 105))),
        ),
        (
            "<Child let:value>{#snippet children()}{value}{/snippet}</Child>",
            Some(("let_directive_snippet_conflict", (73, 82))),
        ),
        // An empty slot name is no slot.
        (
            "<Child slot=\"\" let:value>{#snippet children()}{value}{/snippet}</Child>",
            Some(("let_directive_snippet_conflict", (81, 90))),
        ),
    ]
    .map(|(markup, expected)| (format!("{CHILD}{markup}"), expected));
    let cases: Vec<_> = cases.iter().map(|(s, e)| (s.as_str(), *e)).collect();
    assert_outcomes(&cases);
}
