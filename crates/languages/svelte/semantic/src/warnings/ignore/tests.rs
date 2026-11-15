use crate::warnings::tests::{compiled, texts};

#[test]
fn a_legacy_code_before_the_style_is_reported_at_the_code() {
    let source =
        "<p class=\"a\"></p>\n<!-- svelte-ignore css-unused-selector -->\n<style>.b {}</style>\n";
    // Upstream reports it four bytes early; see `upstream_issues.md`. The selector is reported too.
    assert_eq!(texts("legacy_code", source), ["css-unused-selector"]);
    assert_eq!(texts("css_unused_selector", source), [".b"]);
}

#[test]
fn a_comment_in_a_default_slot_warns_once() {
    let source = "<script>\n  import C from './C.svelte';\n</script>\n<C>\n  <!-- svelte-ignore \
        a11y-autofocus -->\n  <div></div>\n  <input autofocus />\n</C>\n";
    // Upstream warns twice and ignores the later `<input>` too; see `upstream_issues.md`.
    assert_eq!(texts("legacy_code", source), ["a11y-autofocus"]);
    assert_eq!(texts("a11y_autofocus", source), ["autofocus"]);
}

#[test]
fn a_script_comment_ignores_a_local_state_reference() {
    for script in [
        "let count = $state(0);\n// svelte-ignore state_referenced_locally\nlet x = count;",
        "let count = $state(0);\nlet x = $derived(1);\n// svelte-ignore \
            state_referenced_locally\nconsole.log(count);",
        "let { a } = $props();\n// svelte-ignore state_referenced_locally\nconst b = a;",
        "let count = $state(0) as number;\n// svelte-ignore state_referenced_locally\nlet x = \
            count;",
    ] {
        let lang = if script.contains(" as ") {
            " lang=\"ts\""
        } else {
            ""
        };
        let code = format!("<script{lang}>\n{script}\n</script>\n{{x}}");
        assert_eq!(compiled(&code), [], "{script}");
    }
}
