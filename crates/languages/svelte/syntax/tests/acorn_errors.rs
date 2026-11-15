//! Acorn's error for the oxc errors that tsc's codes name, where svelte reports it.

use rsvelte_svelte_syntax::parse::parse;

#[test]
fn acorn_reports_each_error_in_its_own_words_and_place() {
    // What svelte 5.57.3 reports, in bytes of each source.
    for (source, message, at) in [
        ("<script>let a = (</script>", "Unexpected token", 17),
        ("<script>let a = (  </script>", "Unexpected token", 19),
    ] {
        let error = parse(source).expect_err(source);
        assert_eq!(error.code, "js_parse_error", "{source:?}");
        assert_eq!(error.message.lines().next(), Some(message), "{source:?}");
        assert_eq!(error.span.start_offset, at, "{source:?}");
    }
}
