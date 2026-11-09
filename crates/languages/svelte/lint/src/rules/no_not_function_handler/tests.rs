use super::super::testing::lint;

fn reports(source_text: &str) -> Vec<String> {
    lint("svelte/no-not-function-handler", "[]", source_text).0
}

// Upstream follows the declarator to its whole initializer and reports "object" and "array",
// though `h` is 1.
#[test]
fn a_destructured_name_is_not_its_initializer() {
    for script in ["const { h } = { h: 1 };", "const [h] = [1];"] {
        let source_text =
            format!("<script lang=\"ts\">{script}</script><button onclick={{h}}></button>");
        assert_eq!(reports(&source_text), Vec::<String>::new(), "{script}");
    }
}

// Upstream does not follow a `{@const}` declaration, which is as constant as a script's.
#[test]
fn a_const_tag_is_followed() {
    assert_eq!(
        reports("{#if 1}{@const h = 1}<button onclick={h}></button>{/if}"),
        ["1:39 Unexpected number value in event handler."]
    );
}
