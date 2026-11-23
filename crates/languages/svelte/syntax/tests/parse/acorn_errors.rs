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

#[test]
fn a_destructuring_pattern_fails_at_its_first_parenthesized_element() {
    // What svelte 5.57.3 reports, in bytes: acorn checks the pattern as a whole before its
    // elements, at the first element whose operand is parenthesized and is no simple target.
    for (source, at) in [
        ("{[(a?.b)] = o}", 2),
        ("{[(f())] = o}", 2),
        ("{[(a + 1)] = o}", 2),
        ("{[(this)] = o}", 2),
        ("{[(a.b())] = o}", 2),
        ("{[(f()) + 1] = o}", 2),
        ("{[a?.b, (c?.d)] = o}", 8),
        ("{[f(), (a?.b)] = o}", 7),
        ("{[x, ((a?.b))] = o}", 5),
        ("{[...(a?.b)] = o}", 5),
        ("{({ ...(a?.b) } = o)}", 7),
        ("{({ x: (a?.b) } = o)}", 7),
        ("{({ [k]: (f()) } = o)}", 9),
        ("{[[(f())]] = o}", 3),
        ("{({ a: [(f())] } = o)}", 8),
        ("{[[a?.b], (f())] = o}", 10),
        ("{x = [(f())] = o}", 6),
        ("{(a, [(f())] = o)}", 6),
        ("<script>[(a?.b)] = o</script>", 9),
        ("<script lang=\"ts\">[(a?.b)] = o</script>", 19),
        // A `for` head's target is checked as a whole too, and an arrow function's parameter
        // list is a parenthesized operand. An assignment element clears what the elements before
        // it recorded, and a subscript clears what its own operand did.
        ("<script>for ([(a?.b)] of o);</script>", 14),
        ("<script>for ([a?.b, (f())] of o);</script>", 20),
        ("<script>for ({ x: (f()) } of o);</script>", 18),
        ("<script>for ([[(f())]] of o);</script>", 15),
        ("<script>for ([(f())] in o);</script>", 14),
        ("<script>[(a) => 1, (f())] = o</script>", 9),
        ("<script>[x, (a) => b, (g())] = o</script>", 12),
        ("<script>[(a) => 1] = o</script>", 9),
        ("<script>[(f()), x = 1] = o</script>", 10),
        ("<script>[x = 1, (f())] = o</script>", 16),
        ("<script>[(f()).x, (g())] = o</script>", 18),
        ("<script>[(g()), [a] = x] = o</script>", 10),
        ("<script>[[(f())] = x] = o</script>", 10),
        ("<script>[(g()), [(f())] = x] = o</script>", 17),
        ("<script>[{a = 1}, (f())] = o</script>", 18),
        ("<script>[(f()), {a = 1}] = o</script>", 9),
        ("<script>[!(f())] = o</script>", 9),
        ("<script>[(f())++, x] = o</script>", 10),
        ("<script>[(f()) + 1] = o</script>", 9),
        ("<script>[(a?.b)?.c, (f())] = o</script>", 20),
        ("<script>[async (a) => 1, (f())] = o</script>", 25),
        ("<script>({a: (f()), ...(g())} = o)</script>", 13),
        ("<script>[...(f())] = o</script>", 12),
        ("<script>for await ([(f())] of o);</script>", 20),
        ("<script>[(f()) ? a : b] = o</script>", 9),
        ("<script>[[(a)], (f())] = o</script>", 16),
        ("<script>[(a), (f())] = o</script>", 14),
    ] {
        let error = parse(source).expect_err(source);
        assert_eq!(
            (
                error.message.lines().next().unwrap_or_default(),
                error.span.start_offset
            ),
            ("Assigning to rvalue", at),
            "{source}"
        );
    }
    // A simple target, a subscript after the parentheses and a default record nothing.
    for source in [
        "{[(a)] = o}",
        "{[(a.b)] = o}",
        "{[(f().x)] = o}",
        "{[(f()).x] = o}",
        "{[x = (f())] = o}",
        "{({ a = (f()) } = o)}",
        "<script>for ([(f())].x of o);</script>",
    ] {
        parse(source).expect(source);
    }
    // Outside a pattern, acorn reports the target inside the parentheses, an optional chain in its
    // own words.
    let error = parse("{[a?.b] = o}").expect_err("an element's own error");
    assert_eq!(
        error.message.lines().next(),
        Some("Optional chaining cannot appear in left-hand side")
    );
    assert_eq!(
        parse("{(f()) = 1}")
            .expect_err("no pattern")
            .span
            .start_offset,
        2
    );
}

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
