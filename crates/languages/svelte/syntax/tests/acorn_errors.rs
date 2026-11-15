//! Acorn's error for the oxc errors that tsc's codes name, where svelte reports it.

use rsvelte_svelte_syntax::parse::parse;

#[test]
fn acorn_reports_each_error_in_its_own_words_and_place() {
    // What svelte 5.57.3 reports, in bytes of each source.
    for (source, message, at) in [
        ("<script>let f; ++f();</script>", "Assigning to rvalue", 17),
        (
            "<script>let f; (f())++;</script>",
            "Assigning to rvalue",
            16,
        ),
        (
            "<script>let f, x; for ((f()) in x);</script>",
            "Assigning to rvalue",
            24,
        ),
        (
            "<script>let f, x; for (((f())) of x);</script>",
            "Assigning to rvalue",
            25,
        ),
        (
            "<script>let f, x; ({...f()} = x);</script>",
            "Assigning to rvalue",
            23,
        ),
        (
            "<script>let a; ((a + 1)) = 2;</script>",
            "Assigning to rvalue",
            17,
        ),
        (
            "<script>let x; (({})) = x;</script>",
            "Assigning to rvalue",
            15,
        ),
        ("{(a + 1) = 2}", "Assigning to rvalue", 2),
        ("{++(f())}", "Assigning to rvalue", 4),
        ("{f()++}", "Assigning to rvalue", 1),
        (
            "<script>let v = <T,>(a) => a;</script>",
            "Unexpected token",
            16,
        ),
        ("{<div/>}", "Unexpected token", 1),
        ("<script>let a = (</script>", "Unexpected token", 17),
        ("<script>let a = (  </script>", "Unexpected token", 19),
        (
            "{#snippet row(c?: number = 5)}<p>{c}</p>{/snippet}",
            "Unexpected token",
            16,
        ),
        ("{#snippet row(a, c?)}{/snippet}", "Unexpected token", 19),
        (
            "<script>let v = (c?) => 0;</script>",
            "Unexpected token",
            19,
        ),
        ("<script>function f(a?) {}</script>", "Unexpected token", 20),
        (
            "<script>class C { accessor x?: number; }</script>",
            "Unexpected token",
            27,
        ),
        (
            "<script>class K { m(a?) {} }</script>",
            "Unexpected token",
            21,
        ),
        (
            "{#if x}<p>a</p>{{/if}",
            "Unterminated regular expression",
            18,
        ),
        ("{{/if}</p>}", "Invalid regular expression flag", 3),
        ("{{/x/q}", "Invalid regular expression flag", 3),
        ("{{/x/gg}", "Duplicate regular expression flag", 3),
        ("{{/x/uv}", "Invalid regular expression flag", 3),
        ("{{/x/g}", "Unexpected token", 2),
        ("{{a, /[/]/z}", "Invalid regular expression flag", 6),
        (
            "<script>let o = {/x\n};</script>",
            "Unterminated regular expression",
            18,
        ),
    ] {
        let error = parse(source).expect_err(source);
        assert_eq!(error.code, "js_parse_error", "{source:?}");
        assert_eq!(error.message.lines().next(), Some(message), "{source:?}");
        assert_eq!(error.span.start_offset, at, "{source:?}");
    }
}
