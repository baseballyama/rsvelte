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

#[test]
fn acorn_reads_what_directly_follows_a_number() {
    for &(source, message, at) in AFTER_A_NUMBER {
        let error = parse(source).expect_err(source);
        assert_eq!(error.code, "js_parse_error", "{source:?}");
        assert_eq!(error.message.lines().next(), Some(message), "{source:?}");
        assert_eq!(error.span.start_offset, at, "{source:?}");
    }
}
