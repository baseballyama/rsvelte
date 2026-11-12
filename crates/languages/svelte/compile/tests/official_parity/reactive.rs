use rsvelte_svelte_compile::Target;

use super::compile_at;

#[test]
fn a_top_level_reactive_statement_is_legacy_reactive_statement_invalid_on_both_targets() {
    // From svelte 5.57.3, compiled with `runes: true`: raised before what the statement holds.
    for (source, expected) in [
        (
            "<script>let a = 1; $: b = a * 2;</script>",
            Some(("legacy_reactive_statement_invalid", (19, 32))),
        ),
        (
            "<script>$: x = $state(1, 2);</script>",
            Some(("legacy_reactive_statement_invalid", (8, 28))),
        ),
        ("<script module>$: x = 1;</script>", None),
        ("<script>function f() { $: x = 1; }</script>", None),
    ] {
        for target in [Target::Client, Target::Server] {
            let outcome = compile_at(source, target).err();
            let expected = expected.map(|(code, at)| (code.to_owned(), at));
            assert_eq!(outcome, expected, "{source} on {target:?}");
        }
    }
}
