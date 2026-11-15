//! acorn names the character no token starts, which oxc reports as TS1127.

use rsvelte_svelte_syntax::parse::parse;

#[test]
fn acorn_names_the_character_it_cannot_read() {
    // What svelte 5.57.3 reports, in bytes of each source.
    for (source, message, at) in [
        (
            "<script>const 💡 = 1;</script>",
            "Unexpected character '💡'",
            14,
        ),
        (
            "<script>a\u{1}b;</script>",
            "Unexpected character '\u{1}'",
            9,
        ),
        // After `#`, acorn names the character that follows it.
        (
            "<script>class A { # x }</script>",
            "Unexpected character ' '",
            19,
        ),
    ] {
        let error = parse(source).expect_err(source);
        assert_eq!(
            (
                &*error.code,
                error.message.lines().next(),
                error.span.start_offset
            ),
            ("js_parse_error", Some(message), at),
            "{source:?}"
        );
    }
}
