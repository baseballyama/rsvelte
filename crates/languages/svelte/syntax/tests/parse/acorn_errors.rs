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

#[test]
fn a_target_is_read_where_acorn_reads_it() {
    // What svelte 5.57.3 reports, in bytes of each source: `await`, `yield` and `new.target` are
    // what the function around them makes them, in a target and in a pattern's element.
    for (source, at) in [
        ("<script>async function f() { (await x) = 1; }</script>", 30),
        ("<script>function* g() { (yield x) = 1; }</script>", 25),
        ("<script>function* g() { (yield) = 1; }</script>", 25),
        ("<script>function f() { (new.target) = 1; }</script>", 24),
        ("<script>async function f() { (await x)++; }</script>", 30),
        (
            "<script>async function f() { for ((await x) of o); }</script>",
            35,
        ),
        (
            "<script>const f = async () => { (await x) = 1 };</script>",
            33,
        ),
        (
            "<script>async function f() { ((await x))() = 1; }</script>",
            29,
        ),
        (
            "<script>function* g() { [(yield), (f())] = o; }</script>",
            25,
        ),
        (
            "<script>async function f() { [(await x), (f())] = o; }</script>",
            30,
        ),
        ("<script>function* g() { [(yield x)] = o; }</script>", 25),
        ("<script>(await x) = 1;</script>", 9),
        (
            "<script>function f() { [(new.target), (g())] = o; }</script>",
            24,
        ),
        (
            "<script>class A { x = () => { (new.target) = 1; } }</script>",
            31,
        ),
        (
            "<script>async function* g() { (yield await x) = 1; }</script>",
            31,
        ),
        ("<script>[(f())(), x] = o;</script>", 9),
        (
            "<script lang=\"ts\">async function f() { (await x as any) = 1; }</script>",
            40,
        ),
        (
            "<script lang=\"ts\">function* g() { ((yield) as any) = 1; }</script>",
            36,
        ),
        (
            "<script>class A { static { [(f()), (g())] = o; } }</script>",
            28,
        ),
        ("<script>class A { static { (f()) = 1; } }</script>", 28),
        (
            concat!(
                "<script>async function f() { (await x) = 1; } ",
                "async function g() { (await y) = 1; }</script>",
            ),
            30,
        ),
        ("<script>({ async m() { (await x) = 1; } })</script>", 24),
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
}

/// What svelte 5.59.1 reports: a for statement's head and a method with a return type are where
/// `await` and `yield` mean what the function around them makes them.
const READ_WHERE_ACORN_READS: &[(bool, &str, &str, u32)] = &[
    (
        false,
        "async function f() { for await ([(f())] of o); }",
        "Assigning to rvalue",
        41,
    ),
    (
        false,
        "async function f() { for ([(await x)] of o); }",
        "Assigning to rvalue",
        35,
    ),
    (
        false,
        "async function f() { for ([a = await x, (f())] of o); }",
        "Assigning to rvalue",
        48,
    ),
    (
        false,
        "async function f() { for ([a = await x, (f())] in o); }",
        "Assigning to rvalue",
        48,
    ),
    (
        false,
        "async function f() { for await ([a = await x, (f())] of o); }",
        "Assigning to rvalue",
        54,
    ),
    (
        false,
        "function* g() { for ([(yield)] of o); }",
        "Assigning to rvalue",
        30,
    ),
    (
        false,
        "function* g() { for ([(yield), (f())] of o); }",
        "Assigning to rvalue",
        30,
    ),
    (
        false,
        "function* g() { for ([(yield)] in o); }",
        "Assigning to rvalue",
        30,
    ),
    (
        true,
        "const o2 = { *m(): Generator<number> { for ([(yield), (f())] of o); } };",
        "Assigning to rvalue",
        63,
    ),
    (
        true,
        "const o2 = { async m(): Promise<void> { for ([(await x)] of o); } };",
        "Assigning to rvalue",
        64,
    ),
    (
        true,
        "const o2 = { get m(): number { for ([(await x)] of o); return 1; } };",
        "Cannot use keyword 'await' outside an async function",
        56,
    ),
    (
        true,
        "class C { get m(): number { for ([(await x)] of o); return 1; } }",
        "Cannot use keyword 'await' outside an async function",
        53,
    ),
    (
        true,
        "const o2 = { get m(): number { [(f()), (g())] = o; return 1; } };",
        "Assigning to rvalue",
        50,
    ),
    (
        false,
        concat!(
            "async function f0() { for ([(await a), (await b)] of o); } ",
            "async function f1() { for ([(await a), (await b)] of o); }",
        ),
        "Assigning to rvalue",
        36,
    ),
    (
        false,
        "async function f() { for ([(await a), (await b), (await c)] of o); }",
        "Assigning to rvalue",
        35,
    ),
    (
        false,
        "async function f() { for ([(await a), (f())] of o); } for ((y()) of o);",
        "Assigning to rvalue",
        35,
    ),
    (
        false,
        "switch (a) { case 1: (f()) = 1; }",
        "Assigning to rvalue",
        30,
    ),
    (
        false,
        "async function f() { switch (a) { case 1: [(await x), (g())] = o; } }",
        "Assigning to rvalue",
        51,
    ),
    (
        false,
        "x = [async () => 1, (await y) = 1];",
        "Assigning to rvalue",
        29,
    ),
    (
        false,
        "async () => [(await x), (g())] = o;",
        "Assigning to rvalue",
        21,
    ),
];

#[test]
fn a_target_in_a_loop_head_or_a_typed_method_is_read_where_acorn_reads_it() {
    for &(typescript, script, message, at) in READ_WHERE_ACORN_READS {
        let open = if typescript {
            "<script lang=\"ts\">"
        } else {
            "<script>"
        };
        let source = format!("{open}{script}</script>");
        let error = parse(&source).expect_err(&source);
        let read = error.message.lines().next().unwrap_or_default();
        assert_eq!((read, error.span.start_offset), (message, at), "{source}");
    }
}

#[test]
fn many_unassignable_targets_are_located_in_time_linear_in_their_number() {
    // Each function's target is an error that stops oxc, so finding the function around the first
    // one reads the program again: once, not once per target after it.
    let script = |n: usize| {
        let functions = (0..n).map(|i| format!("async function f{i}() {{ (await x) = 1; }}\n"));
        format!("<script>\n{}</script>", functions.collect::<String>())
    };
    let seconds = |source: &str| {
        let started = std::time::Instant::now();
        let error = parse(source).expect_err("an unassignable target");
        let elapsed = started.elapsed().as_secs_f64();
        // The control: the error is the first target's, at the node inside its parentheses, which
        // only the function around it places.
        assert_eq!(
            (error.message.lines().next(), error.span.start_offset),
            (Some("Assigning to rvalue"), 32)
        );
        elapsed
    };
    let (short, long) = (script(1000), script(4000));
    let (mut short_time, mut long_time) = (f64::MAX, f64::MAX);
    for _ in 0..3 {
        short_time = short_time.min(seconds(&short));
        long_time = long_time.min(seconds(&long));
    }
    // Four times the targets take about four times as long; re-reading per target, sixteen.
    assert!(
        long_time < 8.0 * short_time,
        "1000 took {short_time} s, 4000 took {long_time} s"
    );
}
