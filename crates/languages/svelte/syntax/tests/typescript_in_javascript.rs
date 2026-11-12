//! TypeScript-only syntax in a JavaScript component fails where acorn stops: at the token after
//! an assertion's operand or after a modifier.

use rsvelte_svelte_syntax::parse::parse;

#[test]
fn acorn_stops_at_typescript_only_syntax() {
    for (source, code, at) in [
        // The template reads the operand and expects its `}` at `as`.
        ("<p>{a as T}</p>", "expected_token", "as T"),
        ("<p>{a satisfies T}</p>", "expected_token", "satisfies T"),
        // Inside brackets the operand alone does not parse.
        ("<p>{(a as T)}</p>", "js_parse_error", "as T)"),
        (
            "<script>let x = f(a) as T;</script>",
            "js_parse_error",
            "as T;",
        ),
        (
            "<script>class A { private x = 1 }</script>",
            "js_parse_error",
            "x = 1",
        ),
        (
            "<script>class A { constructor(public x) {} }</script>",
            "js_parse_error",
            "x) {}",
        ),
    ] {
        let error = parse(source).expect_err(source);
        assert_eq!(error.code, code, "{source}");
        let at = source.find(at).expect("the stop") as u32;
        assert_eq!(error.span.start_offset, at, "{source}: {error:?}");
    }
}

#[test]
fn an_each_block_reads_up_to_its_as() {
    let source = "{#each true, items as item}<p>{item}</p>{/each}";
    parse(source).expect("the expression is `true, items`");
}
