use rsvelte_kernel::source::positions::Span;

use super::first_error;

fn error(sheet: &str) -> Option<(String, String)> {
    let parsed =
        rsvelte_stylesheet_syntax::parse(sheet, Span::new(0, sheet.len() as u32)).expect("parses");
    first_error(&parsed.rules, sheet).map(|e| (e.code.to_string(), e.span.text(sheet).to_owned()))
}

// Svelte 5 raises each one at this text.
#[test]
fn a_misplaced_global_or_nesting_selector_is_its_error() {
    for (sheet, code, text) in [
        (
            ".x > :global { }",
            "css_global_block_invalid_combinator",
            "> :global",
        ),
        (
            ":global.x { }",
            "css_global_block_invalid_modifier_start",
            ".x",
        ),
        (
            ".x:global { }",
            "css_global_block_invalid_modifier",
            ":global",
        ),
        (
            ":global { opacity: 1; }",
            "css_global_block_invalid_declaration",
            "opacity: 1",
        ),
        (
            ":is(:global) { }",
            "css_global_block_invalid_placement",
            ":global",
        ),
        (
            ".wrap :global(.injected) .a { }",
            "css_global_invalid_placement",
            ":global(.injected)",
        ),
        (
            ".a:is(&) { }",
            "css_nesting_selector_invalid_placement",
            "&",
        ),
        (
            ":global { &.a { } }",
            "css_global_block_invalid_modifier_start",
            "&",
        ),
        ("> a { }", "css_selector_invalid", ">"),
    ] {
        assert_eq!(
            error(sheet),
            Some((code.to_owned(), text.to_owned())),
            "{sheet}"
        );
    }
}

#[test]
fn a_global_or_nesting_selector_in_its_place_is_no_error() {
    for sheet in [
        ".x :global { }",
        "div :global.x { }",
        ":global .a { & .b { } }",
        ".a { & > .b { } }",
        ":global(.a) .b { }",
        ".a:global(2n) { }",
        ".a { > .b { } }",
    ] {
        assert_eq!(error(sheet), None, "{sheet}");
    }
}
