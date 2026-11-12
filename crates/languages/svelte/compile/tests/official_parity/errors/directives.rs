//! Upstream's checks of `style:` modifiers, `animate:` placement, imports and rune names.

use rsvelte_svelte_compile::Target;

use super::super::compile_at;

/// A diagnostic's code and byte range.
type Error<'a> = Option<(&'a str, (u32, u32))>;

/// Each source's outcome, from svelte 5.57.3 compiled with `runes: true`, on both targets.
fn assert_outcomes(cases: &[(&str, Error<'_>)]) {
    for &(source, expected) in cases {
        for target in [Target::Client, Target::Server] {
            let outcome = compile_at(source, target).err();
            let expected = expected.map(|(code, at)| (code.to_owned(), at));
            assert_eq!(outcome, expected, "{source} on {target:?}");
        }
    }
}

#[test]
fn a_style_directive_takes_only_one_important_modifier() {
    assert_outcomes(&[
        ("<div style:color|important=\"red\"></div>", None),
        (
            "<div style:color|foo=\"red\"></div>",
            Some(("style_directive_invalid_modifier", (5, 26))),
        ),
        (
            "<div style:color|global=\"red\"></div>",
            Some(("style_directive_invalid_modifier", (5, 29))),
        ),
        (
            "<div style:color|important|important=\"red\"></div>",
            Some(("style_directive_invalid_modifier", (5, 42))),
        ),
    ]);
}

#[test]
fn an_animated_element_is_the_one_child_of_a_keyed_each() {
    assert_outcomes(&[
        (
            "{#each a as b (b)}<div animate:f></div>{:else}<p></p>{/each}",
            None,
        ),
        (
            "{#each a as b (b)}<!-- c -->{@const c = 1}  <div animate:f></div>{/each}",
            None,
        ),
        (
            "{#each a as b (b)}<svelte:element this=\"div\" animate:f></svelte:element>{/each}",
            None,
        ),
        (
            "<div animate:f></div>",
            Some(("animation_invalid_placement", (5, 14))),
        ),
        (
            "{#each a as b}<div animate:f></div>{/each}",
            Some(("animation_missing_key", (19, 28))),
        ),
        (
            "{#each a as b (b)}<div animate:f></div><p></p>{/each}",
            Some(("animation_invalid_placement", (23, 32))),
        ),
        (
            "{#each a as b (b)}{#if x}<div animate:f></div>{/if}{/each}",
            Some(("animation_invalid_placement", (30, 39))),
        ),
        (
            "{#each a as b (b)}<div animate:f animate:g></div>{/each}",
            Some(("animation_duplicate", (33, 42))),
        ),
    ]);
}

#[test]
fn an_import_runes_mode_forbids_raises_upstreams_error() {
    assert_outcomes(&[
        (
            "<script>import x from \"svelte/internal/client\";</script>",
            Some(("import_svelte_internal_forbidden", (8, 47))),
        ),
        (
            "<script>import x from \"svelte/internals\";</script>",
            Some(("import_svelte_internal_forbidden", (8, 41))),
        ),
        (
            concat!(
                "<script module>import x from \"svelte/internal\";</script>",
                "<script>import {beforeUpdate} from \"svelte\";</script>",
            ),
            Some(("import_svelte_internal_forbidden", (15, 47))),
        ),
        (
            "<script>import {onMount, beforeUpdate} from \"svelte\";</script>",
            Some(("runes_mode_invalid_import", (25, 37))),
        ),
        (
            "<script>import {afterUpdate as a} from \"svelte\";</script>",
            Some(("runes_mode_invalid_import", (16, 32))),
        ),
        (
            "<script>import \"svelte/internal\";</script>",
            Some(("import_svelte_internal_forbidden", (8, 33))),
        ),
        (
            "<script lang=\"ts\">import {type X, Y} from \"svelte/internal\";</script>",
            Some(("import_svelte_internal_forbidden", (18, 60))),
        ),
        // Types are erased before the analysis sees the import.
        (
            "<script lang=\"ts\">import type {X} from \"svelte/internal\";</script>",
            None,
        ),
        (
            "<script lang=\"ts\">import {type X} from \"svelte/internal\";</script>",
            None,
        ),
        (
            "<script lang=\"ts\">import {type beforeUpdate} from \"svelte\";</script>",
            None,
        ),
    ]);
}

#[test]
fn a_rune_is_called_by_a_name_svelte_knows() {
    assert_outcomes(&[
        (
            concat!(
                "<script>let a = $state.raw(1); let b = $derived.by(() => 1);",
                " $effect.pre(() => {}); $inspect(a).with(console.log);</script>",
            ),
            None,
        ),
        ("<script>let a = f($state);</script>", None),
        ("<script>let a = ($state)(1);</script>", None),
        (
            "<script>import { state } from \"./s\"; let a = $state;</script>",
            None,
        ),
        (
            "<script>let a = $state;</script>",
            Some(("rune_missing_parentheses", (16, 22))),
        ),
        (
            "<script>let a = $state.raw;</script>",
            Some(("rune_missing_parentheses", (16, 26))),
        ),
        (
            "<script>let a = new $state();</script>",
            Some(("rune_missing_parentheses", (20, 26))),
        ),
        ("{$state}", Some(("rune_missing_parentheses", (1, 7)))),
        ("{$state.foo}", Some(("rune_invalid_name", (0, 12)))),
        (
            "<script>$state.foo;</script>",
            Some(("rune_invalid_name", (8, 19))),
        ),
        (
            "<script>let a = $state.raw.foo;</script>",
            Some(("rune_invalid_name", (12, 30))),
        ),
        (
            "<script>let a = x[$state];</script>",
            Some(("rune_invalid_computed_property", (16, 25))),
        ),
        (
            "<script>let a = $effect.active();</script>",
            Some(("rune_renamed", (16, 32))),
        ),
        (
            "<script>let a = $state.frozen(1);</script>",
            Some(("rune_renamed", (16, 32))),
        ),
        (
            "<script>let a = $state.is(1);</script>",
            Some(("rune_removed", (16, 28))),
        ),
    ]);
}
