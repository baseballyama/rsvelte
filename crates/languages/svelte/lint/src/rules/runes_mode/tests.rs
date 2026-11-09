use super::super::testing::lint;

/// Whether the component is in runes mode, seen through a rule that reports only there.
fn runes(script: &str) -> bool {
    let source_text =
        format!("<script lang=\"ts\">{script}</script>\n{{#if 1}}{{@const x = 1}}{{x}}{{/if}}");
    !lint("svelte/no-at-const-tags", "[]", &source_text)
        .0
        .is_empty()
}

#[test]
fn a_rune_named_in_code_turns_runes_mode_on() {
    assert!(runes("let o = $state(1);"));
    assert!(!runes("let o = 1;"));
}

// Upstream skips a rune named in an annotation, a return type or type arguments, but counts one in
// `as T`, a type alias or an interface, which name no rune either.
#[test]
fn a_rune_named_in_a_type_does_not() {
    for script in [
        "let o: $state;",
        "function f(): $state {}",
        "let o = f<$state>();",
        "let o = 1 as $state;",
        "type T = $state;",
        "interface I { a: $state }",
    ] {
        assert!(!runes(script), "{script}");
    }
}
