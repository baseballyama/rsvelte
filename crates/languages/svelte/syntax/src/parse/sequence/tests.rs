use crate::parse::parse;

#[test]
fn a_block_or_a_tag_fails_where_only_an_expression_goes() {
    // Each source's error from svelte 5.59.1: its code, where it is, and its message.
    for (source, code, at, message) in [
        (
            "<textarea>\n\t{#each fruits as fruit}\n\t\t{fruit}\n\t{/each}\n</textarea>",
            "block_invalid_placement",
            12,
            "{#each ...} block cannot be inside <textarea>",
        ),
        (
            "<textarea>\n\t{@html fruit}\n</textarea>",
            "tag_invalid_placement",
            12,
            "{@html ...} tag cannot be inside <textarea>",
        ),
        (
            "<textarea>{a}{@const x = 1}</textarea>",
            "tag_invalid_placement",
            13,
            "{@const ...} tag cannot be inside <textarea>",
        ),
        (
            "<textarea>{#IF x}</textarea>",
            "block_invalid_placement",
            10,
            "{# ...} block cannot be inside <textarea>",
        ),
        (
            r#"<div style="{#if condition}a{/if}"></div>"#,
            "block_invalid_placement",
            12,
            "{#if ...} block cannot be in attribute value",
        ),
        (
            r#"<div style="{@html text}"></div>"#,
            "tag_invalid_placement",
            12,
            "{@html ...} tag cannot be in attribute value",
        ),
        (
            "<div style={#if c}a{/if}></div>",
            "block_invalid_placement",
            11,
            "{#if ...} block cannot be in attribute value",
        ),
    ] {
        let error = parse(source).expect_err(source);
        assert_eq!(
            (
                error.code.as_ref(),
                error.span.start_offset,
                error.span.end_offset
            ),
            (code, at, at),
            "{source}"
        );
        assert!(
            error.message.starts_with(message),
            "{source}: {}",
            error.message
        );
    }
}
