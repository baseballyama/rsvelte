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
        ("{(f)() = 1}", "Assigning to rvalue", 1),
        ("{((f))() = 1}", "Assigning to rvalue", 1),
        ("{(f)()++}", "Assigning to rvalue", 1),
        ("{(a) + 1 = 2}", "Assigning to rvalue", 1),
        ("{((a) + 1) = 2}", "Assigning to rvalue", 2),
        ("{(a)`t` = 1}", "Assigning to rvalue", 1),
        ("{(a, b) = 1}", "Assigning to rvalue", 2),
        ("{[(f)()] = x}", "Assigning to rvalue", 2),
        (
            "<script lang=\"ts\">((f)() as any) = 1</script>",
            "Assigning to rvalue",
            19,
        ),
        (
            "<script lang=\"ts\">(f)()! = 1</script>",
            "Assigning to rvalue",
            18,
        ),
        (
            "<script lang=\"ts\">(({}) as any) = x</script>",
            "Assigning to rvalue",
            18,
        ),
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
    ] {
        let error = parse(source).expect_err(source);
        assert_eq!(error.code, "js_parse_error", "{source:?}");
        assert_eq!(error.message.lines().next(), Some(message), "{source:?}");
        assert_eq!(error.span.start_offset, at, "{source:?}");
    }
}

#[test]
fn acorn_lexes_regular_expressions_and_escaped_names() {
    // What svelte 5.57.3 reports, in bytes of each source.
    for (source, message, at) in [
        (
            "{#if x}<p>a</p>{{/if}",
            "Unterminated regular expression",
            18,
        ),
        ("{{/if}</p>}", "Invalid regular expression flag", 3),
        ("{{/x/q}", "Invalid regular expression flag", 3),
        (
            "<script>let a\\u0020 = 1;</script>",
            "Invalid Unicode escape",
            13,
        ),
        (
            "<script>let \\u0020a = 1;</script>",
            "Invalid Unicode escape",
            12,
        ),
        (
            "<script lang=\"ts\">let a\\u0020 = 1;</script>",
            "Invalid Unicode escape",
            23,
        ),
        ("{a\\u0020}", "Invalid Unicode escape", 2),
        (
            "<script>let a\\u{20} = 1;</script>",
            "Invalid Unicode escape",
            13,
        ),
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

#[test]
fn an_optional_chain_target_is_its_own_error() {
    // What svelte 5.57.3 reports, in bytes of each source: `=` and compound assignment, `++` and
    // `--`, `for...in`, `for...of`, a pattern's element and rest, and casts around the chain.
    let optional = "Optional chaining cannot appear in left-hand side";
    for (source, at) in [
        ("{a?.b = 1}", 1),
        ("{(a?.b) = 1}", 2),
        ("{((a?.b)) = 1}", 3),
        ("{a?.b.c = 1}", 1),
        ("{a?.[0] = 1}", 1),
        ("{a?.() = 1}", 1),
        ("{a.b?.c = 1}", 1),
        ("{a?.b += 1}", 1),
        ("{a?.b++}", 1),
        ("{++a?.b}", 3),
        ("{[a?.b] = x}", 2),
        ("{({x: a?.b} = y)}", 6),
        ("{[...a?.b] = x}", 5),
        ("{({...a?.b} = y)}", 6),
        ("<script>a?.b = 1</script>", 8),
        ("<script>a?.b--</script>", 8),
        ("<script>for (a?.b in x);</script>", 13),
        ("<script>for (a?.b of x);</script>", 13),
        ("<script lang=\"ts\">a?.b = 1</script>", 18),
        ("<script lang=\"ts\">(a?.b)! = 1</script>", 19),
        ("<script lang=\"ts\">(a?.b as any) = 1</script>", 19),
        // A parenthesized object starts the chain, as it starts acorn's node.
        ("{(a)?.b = x}", 1),
        ("{((a))?.b = x}", 1),
        ("{(a).b?.c = x}", 1),
        ("{((a)?.b) = x}", 2),
        ("{(a)?.b++}", 1),
        ("{++(a)?.b}", 3),
        ("{[(a)?.b] = x}", 2),
        ("{({x: (a)?.b} = y)}", 6),
        ("{[...(a)?.b] = x}", 5),
        ("<script>[(a)?.b] = o</script>", 9),
        ("<script>for ((a)?.b of x);</script>", 13),
        ("<script>for ((a)?.b in x);</script>", 13),
        ("<script lang=\"ts\">((a)?.b)! = 1</script>", 19),
        ("<script lang=\"ts\">((a)?.b as any) = 1</script>", 19),
        ("<script lang=\"ts\">(a)?.b! = 1</script>", 18),
        ("<script lang=\"ts\">(<any>(a)?.b) = 1</script>", 24),
    ] {
        let error = parse(source).expect_err(source);
        assert_eq!(
            (
                error.message.lines().next().unwrap_or_default(),
                error.span.start_offset
            ),
            (optional, at),
            "{source}"
        );
    }
    // A member of a parenthesized chain is a target, and a call stays an rvalue.
    parse("{(a?.b).c = 1}").expect("a member of a parenthesized chain");
    let error = parse("{f() = 1}").expect_err("a call");
    assert_eq!(error.message.lines().next(), Some("Assigning to rvalue"));
}
