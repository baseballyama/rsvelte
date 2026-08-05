//! Validator/a11y diagnostics whose message bodies used to diverge from the
//! official compiler (argument order, articles, list joining and wording).

use rsvelte_core::{CompileOptions, compile};

fn messages(src: &str) -> Vec<String> {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            ..Default::default()
        },
    )
    .expect("compile failed")
    .warnings
    .into_iter()
    .map(|w| w.message.lines().next().unwrap_or_default().to_string())
    .collect()
}

fn assert_message(src: &str, expected: &str) {
    let msgs = messages(src);
    assert!(msgs.iter().any(|m| m == expected), "{msgs:?}");
}

#[test]
fn interactive_element_to_noninteractive_role_names_element_first() {
    assert_message(
        "<a href=\"test\" role=\"article\">link</a>",
        "`<a>` cannot have role 'article'",
    );
}

#[test]
fn noninteractive_element_to_interactive_role_names_element_first() {
    assert_message(
        "<h1 role=\"tab\">x</h1>",
        "Non-interactive element `<h1>` cannot have interactive role 'tab'",
    );
}

#[test]
fn unknown_aria_attribute_suggestion_is_a_sentence() {
    assert_message(
        "<input type=\"image\" aria-labeledby=\"foo\">",
        "Unknown aria attribute 'aria-labeledby'. Did you mean 'labelledby'?",
    );
}

#[test]
fn missing_attribute_lists_candidates_without_oxford_comma() {
    assert_message(
        "<input type=\"image\" aria-labeledby=\"foo\">",
        "`<input type=\"image\">` element should have an alt, aria-label or aria-labelledby attribute",
    );
}

#[test]
fn aria_tokenlist_values_are_quoted_and_joined_with_or() {
    assert_message(
        "<div aria-relevant=\"foobar\"></div>",
        "The value of 'aria-relevant' must be a space-separated list of one or more of \"additions\", \"all\", \"removals\" or \"text\"",
    );
}

#[test]
fn aria_token_values_are_quoted_and_joined_with_or() {
    assert_message(
        "<div aria-sort=\"foobar\"></div>",
        "The value of 'aria-sort' must be exactly one of \"ascending\", \"descending\", \"none\" or \"other\"",
    );
}

#[test]
fn invalid_placement_under_the_direct_parent_says_child() {
    let msgs = messages("<div><form>{#if foo}<form><input /></form>{/if}</form></div>");
    assert!(
        msgs.iter()
            .any(|m| m.starts_with("`<form>` cannot be a child of `<form>`.")),
        "{msgs:?}"
    );
}

#[test]
fn invalid_placement_under_a_grandparent_says_descendant() {
    let msgs = messages("<div><form>{#if foo}<div><form><input /></form></div>{/if}</form></div>");
    assert!(
        msgs.iter()
            .any(|m| m.starts_with("`<form>` cannot be a descendant of `<form>`.")),
        "{msgs:?}"
    );
}

#[test]
fn module_level_reactive_declaration_says_only_exist() {
    assert_message(
        "<script module>\n\tlet num = 2;\n\tlet square;\n\t$: square = num * num;\n</script>",
        "Reactive declarations only exist at the top level of the instance script",
    );
}
