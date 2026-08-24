//! Upstream svelte2tsx throws `new Error(message)` and re-throws the svelte
//! compiler's own error, so nothing it surfaces names the error's kind or code.
//! The expected strings are official svelte2tsx's `e.message` for the same
//! source, byte for byte.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn message(source: &str) -> String {
    svelte2tsx(source, Svelte2TsxOptions::default())
        .expect_err("official rejects this source")
        .to_string()
}

#[test]
fn a_template_error_is_the_bare_sentence_official_throws() {
    assert_eq!(
        message("<div><svelte:head><title>t</title></svelte:head></div>"),
        "`<svelte:head>` tags cannot be inside elements or blocks\nhttps://svelte.dev/e/svelte_meta_invalid_placement"
    );
    assert_eq!(
        message("<svelte:window /><svelte:window />"),
        "A component can only have one `<svelte:window>` element\nhttps://svelte.dev/e/svelte_meta_duplicate"
    );
    assert_eq!(
        message("<svelte:element />"),
        "`<svelte:element>` must have a 'this' attribute with a value\nhttps://svelte.dev/e/svelte_element_missing_this"
    );
    assert_eq!(
        message("{@debug user.name}"),
        "{@debug ...} arguments must be identifiers, not arbitrary expressions\nhttps://svelte.dev/e/debug_tag_invalid_arguments"
    );
}

#[test]
fn a_parse_error_carries_the_docs_link_and_not_the_code() {
    assert_eq!(
        message("<div>"),
        "`<div>` was left open\nhttps://svelte.dev/e/element_unclosed"
    );
}

#[test]
fn a_script_error_is_the_bare_sentence_official_throws() {
    assert_eq!(
        message("<script context=\"module\">\ninterface $$Props {\n  name: string;\n}\n</script>"),
        "$$Props can only be declared in the instance script"
    );
}
