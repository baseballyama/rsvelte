use rsvelte_svelte_syntax::parse::parse;

/// What svelte 5.59.1 reports, in bytes of each source: an identifier right after a number, or
/// digits a radix does not take, which acorn reads as a number of its own.
const AFTER_A_NUMBER: &[(&str, &str, u32)] = &[
    (
        "<script>let a = 1x;</script>",
        "Identifier directly after number",
        17,
    ),
    (
        "<script>let a = 1.5x;</script>",
        "Identifier directly after number",
        19,
    ),
    (
        "<script>let a = 1e5x;</script>",
        "Identifier directly after number",
        19,
    ),
    (
        "<script>let a = .5x;</script>",
        "Identifier directly after number",
        18,
    ),
    (
        "<script>let a = 0x1g;</script>",
        "Identifier directly after number",
        19,
    ),
    ("<script>let a = 0b12;</script>", "Unexpected token", 19),
    ("<script>let a = 0xfnx;</script>", "Unexpected token", 20),
    ("<script>let a = 0o19;</script>", "Unexpected token", 19),
    (
        "<script>let a = 1nx;</script>",
        "Identifier directly after number",
        18,
    ),
    (
        "<script>let a = 1_000x;</script>",
        "Identifier directly after number",
        21,
    ),
    (
        "<script>let a = 1$;</script>",
        "Identifier directly after number",
        17,
    ),
    (
        "<script>let a = 1é;</script>",
        "Identifier directly after number",
        17,
    ),
    (
        "<script>const f = (a) => 1x;</script>",
        "Identifier directly after number",
        26,
    ),
    (
        "<script>f(1x);</script>",
        "Identifier directly after number",
        11,
    ),
    (
        "<script>let 1x;</script>",
        "Identifier directly after number",
        13,
    ),
    (
        "<script>let a = [1x];</script>",
        "Identifier directly after number",
        18,
    ),
    ("{1x}", "Identifier directly after number", 2),
    ("<div a={1x}></div>", "Identifier directly after number", 9),
    ("{#if 1x}{/if}", "Identifier directly after number", 6),
    (
        "<script lang=\"ts\">let a = 1x;</script>",
        "Identifier directly after number",
        27,
    ),
    (
        "<script>let a = 1.x;</script>",
        "Identifier directly after number",
        18,
    ),
    (
        "<script>let a = 0b12x;</script>",
        "Identifier directly after number",
        20,
    ),
    ("<script>let a = 0b123;</script>", "Unexpected token", 19),
    (
        "<script>let a = 0x1gh;</script>",
        "Identifier directly after number",
        19,
    ),
    ("<script>let a = 1n2;</script>", "Unexpected token", 18),
    (
        "<script>let a = 1.5e3$x;</script>",
        "Identifier directly after number",
        21,
    ),
    (
        "<script>let a = 0b1é;</script>",
        "Identifier directly after number",
        19,
    ),
];

/// What svelte 5.59.1 reports for a digit a radix does not take in a template: acorn's number ends
/// before it, so the expression does, and the template fails there unless brackets are open.
const AFTER_A_NUMBER_IN_A_TEMPLATE: &[(&str, &str, &str, u32)] = &[
    ("<p>{0b12}</p>", "expected_token", "Expected token }", 7),
    ("<p>{1n2}</p>", "expected_token", "Expected token }", 6),
    ("{#if 0o19}{/if}", "expected_token", "Expected token }", 8),
    ("{@html 0b12}", "expected_token", "Expected token }", 10),
    (
        "<div a={0b12}></div>",
        "expected_token",
        "Expected token }",
        11,
    ),
    (
        "<div a=\"{1n2}\"></div>",
        "expected_token",
        "Expected token }",
        11,
    ),
    (
        "{#each 0b12 as x}{/each}",
        "expected_token",
        "Expected token }",
        10,
    ),
    ("<p>{0b12 + 1}</p>", "expected_token", "Expected token }", 7),
    ("<p>{(0b12)}</p>", "js_parse_error", "Unexpected token", 8),
    (
        "{@const x = 0b12}",
        "expected_token",
        "Expected token }",
        15,
    ),
    (
        "{#if true}{@const x = 1n2}{/if}",
        "expected_token",
        "Expected token }",
        24,
    ),
    ("<p>{a(0b12)}</p>", "js_parse_error", "Unexpected token", 9),
];

#[test]
fn acorn_reads_what_directly_follows_a_number() {
    let script = (AFTER_A_NUMBER.iter())
        .map(|&(source, message, at)| (source, "js_parse_error", message, at));
    for (source, code, message, at) in script.chain(AFTER_A_NUMBER_IN_A_TEMPLATE.iter().copied()) {
        let error = parse(source).expect_err(source);
        assert_eq!(error.code, code, "{source:?}");
        // A JavaScript syntax error is oxc's to word and place; a Svelte error is Svelte's.
        if code != "js_parse_error" {
            assert_eq!(error.message.lines().next(), Some(message), "{source:?}");
            assert_eq!(error.span.start_offset, at, "{source:?}");
        }
    }
}
