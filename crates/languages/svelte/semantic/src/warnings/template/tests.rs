use crate::warnings::tests::{compiled, compiled_with_errors, messages, texts};

#[test]
fn an_element_is_closed_by_the_next_tag_or_the_end_tag_around_it() {
    let source = "<ul><li>a<li>b</ul>\n<div><p></div>\n";
    let found: Vec<(String, String)> = compiled(source)
        .into_iter()
        .filter(|(c, ..)| c == "element_implicitly_closed")
        .map(|(_, text, message)| {
            (
                text,
                message[..message.find(',').expect("a comma")].to_owned(),
            )
        })
        .collect();
    let by = |tag: &str| format!("This element is implicitly closed by the following `{tag}`");
    assert_eq!(
        found,
        [
            ("<li>".to_owned(), by("<li>")),
            ("<li>".to_owned(), by("</ul>")),
            ("<p>".to_owned(), by("</div>")),
        ]
    );
}

#[test]
fn an_escape_in_a_string_can_spell_a_control_character() {
    let source = "<script>\n  let a = '\\u2067';\n</script>\n";
    assert_eq!(
        texts("bidirectional_control_characters", source),
        ["'\\u2067'"]
    );
}

#[test]
fn an_attribute_text_is_walked_where_upstream_counts_the_decoded_text() {
    // Upstream adds the index in the decoded `&a` to where `&amp;a` starts, so it points into the
    // entity.
    let source = "<b title=\"a\u{202e}b\">x</b><i title=\"&amp;a\u{202e}b\">y</i>\n";
    assert_eq!(
        texts("bidirectional_control_characters", source),
        ["\u{202e}", "m"]
    );
}

#[test]
fn a_special_element_reads_global_handlers_too() {
    let source = "<svelte:window {onresize} />\n";
    assert_eq!(
        texts("attribute_global_event_reference", source),
        ["{onresize}"]
    );
}

#[test]
fn svelte_component_this_is_not_an_attribute() {
    let source = "<script>\n  let A;\n</script>\n<svelte:component this=\"{A}\" b=\"{A}\" />\n";
    assert_eq!(texts("attribute_quoted", source), ["b=\"{A}\""]);
}

#[test]
fn a_block_turns_a_misplaced_element_into_a_warning() {
    let source = "<form>{#if a}<form></form>{/if}</form>\n<p>{#if a}<div></div>{/if}</p>\n";
    let found = messages(source);
    let codes: Vec<&str> = found.iter().map(|(c, _)| c.as_str()).collect();
    assert_eq!(
        codes,
        ["node_invalid_placement_ssr", "node_invalid_placement_ssr"]
    );
    assert!(
        found[0]
            .1
            .starts_with("`<form>` cannot be a child of `<form>`. When"),
        "{found:?}"
    );
    assert!(
        found[1]
            .1
            .starts_with("`<div>` cannot be a child of `<p>`. When"),
        "{found:?}"
    );
}

#[test]
fn a_spaced_raw_markup_tag_is_an_error_only_in_runes_mode() {
    let errors = |runes| compiled_with_errors("{ @html value}\n", runes).1;
    assert_eq!(errors(None), Vec::<String>::new());
    assert_eq!(errors(Some(true)), ["block_unexpected_character"]);
}

#[test]
fn a_const_tag_directly_in_svelte_self_is_misplaced() {
    let errors = |code: &str| compiled_with_errors(code, None).1;
    assert_eq!(
        errors("{#if true}<svelte:self>{@const a = 1}{a}</svelte:self>{/if}\n"),
        ["const_tag_invalid_placement"]
    );
}

#[test]
fn an_unparenthesized_sequence_attribute_is_an_error_in_runes_mode() {
    let errors = |code: &str| compiled_with_errors(code, Some(true)).1;
    let script = "<script>let { x, y } = $props();</script>\n";
    for markup in ["<span foo={x, y}></span>", "<Child foo={x, y} />"] {
        assert_eq!(
            errors(&format!("{script}{markup}\n")),
            ["attribute_invalid_sequence_expression"]
        );
    }
    assert_eq!(
        errors(&format!("{script}<span foo={{(x, y)}}></span>\n")),
        Vec::<String>::new()
    );
}

#[test]
fn two_transitions_in_one_direction_conflict() {
    let errors = |code: &str| compiled_with_errors(code, None).1;
    assert_eq!(
        errors("<div transition:fade in:fade>x</div>\n"),
        ["transition_conflict"]
    );
    assert_eq!(
        errors("<div in:fade in:fly>x</div>\n"),
        ["transition_duplicate"]
    );
    assert_eq!(
        errors("<div in:fade out:fly>x</div>\n"),
        Vec::<String>::new()
    );
}
