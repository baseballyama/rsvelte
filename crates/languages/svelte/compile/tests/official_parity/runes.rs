use rsvelte_svelte_compile::Target;

use super::compile_at;

#[test]
fn a_rune_read_without_a_call_raises_upstreams_error_on_both_targets() {
    // From svelte 5.57.3, compiled with `runes: true`.
    for (source, expected) in [
        (
            "<script>const a = $state;</script>",
            Some(("rune_missing_parentheses", (18, 24))),
        ),
        (
            "<script module>void $state;</script>",
            Some(("rune_missing_parentheses", (20, 26))),
        ),
        (
            "<script>function f() { return $effect; }</script>",
            Some(("rune_missing_parentheses", (30, 37))),
        ),
        (
            "<script>let x = $state.frozen(1);</script>",
            Some(("rune_renamed", (16, 32))),
        ),
        (
            "<script>let x = $state.foo;</script>",
            Some(("rune_invalid_name", (12, 26))),
        ),
        (
            "<script>let x = $state[\"raw\"](1);</script>",
            Some(("rune_invalid_computed_property", (16, 29))),
        ),
        (
            "<script>$effect.active();</script>",
            Some(("rune_renamed", (8, 24))),
        ),
        (
            "<script>let x = $state.is(1, 2);</script>",
            Some(("rune_removed", (16, 31))),
        ),
        (
            "<p>{$derived}</p>",
            Some(("rune_missing_parentheses", (4, 12))),
        ),
        ("{$state.x}", Some(("rune_invalid_name", (0, 10)))),
        (
            "<script>let x = $state(1);</script>{$state.snapshot}",
            Some(("rune_missing_parentheses", (36, 51))),
        ),
        (
            "<script>let x = $props.id;</script>",
            Some(("rune_missing_parentheses", (16, 25))),
        ),
        ("<script>let x = ($state)(1);</script>{x}", None),
        (
            "<script>import { writable } from \"svelte/store\"; const state = writable(1);\
             </script>{$state}",
            None,
        ),
    ] {
        for target in [Target::Client, Target::Server] {
            let outcome = compile_at(source, target).err();
            let expected = expected.map(|(code, at)| (code.to_owned(), at));
            assert_eq!(outcome, expected, "{source} on {target:?}");
        }
    }
}

#[test]
fn a_scripts_error_comes_before_a_refusal_on_both_targets() {
    // From svelte 5.57.3, compiled with `runes: true`; the `let:` alone is refused.
    for (source, expected) in [
        (
            "<script>export let a = 1;</script><slot let:a />",
            ("legacy_export_invalid", (8, 25)),
        ),
        (
            "<script>const x = $state;</script><slot let:a />",
            ("rune_missing_parentheses", (18, 24)),
        ),
        ("<slot let:a />", ("unsupported", (0, 14))),
    ] {
        for target in [Target::Client, Target::Server] {
            let expected = Some((expected.0.to_owned(), expected.1));
            assert_eq!(
                compile_at(source, target).err(),
                expected,
                "{source} on {target:?}"
            );
        }
    }
}
