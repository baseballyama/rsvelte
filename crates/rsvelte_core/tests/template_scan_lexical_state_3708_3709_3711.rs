//! Regression tests for #3708, #3709 and #3711 — three hosts of one class:
//! where a template expression is judged to END, against the lexical states a
//! `}` or a newline can hide in.
//!
//! * **#3708** the spread and shorthand attribute readers found their closing
//!   `}` with a bare depth counter — "Fast byte-level brace scanning" — so a
//!   `}` inside a string, regex, template literal or comment ended the
//!   attribute and the remainder reached the JS parser as a truncated slice.
//! * **#3709** the `{#each}` and `{#await}` head scans had string arms (and the
//!   each one a comment arm) but **no regex arm**, so `{#each [/}/.source] as n}`
//!   was `block_unclosed`. The `{#await}` scan had no comment arm either.
//! * **#3711** `find_string_end` bounded a `'`/`"` search at the first `\n`,
//!   which a LINE CONTINUATION legitimately crosses.
//!
//! All three are over-rejections — documents the official compiler accepts —
//! so no comparison of accepted programs and no collected corpus could see
//! them. The controls are the other direction of each scan, because a `/` that
//! is division and a `\` that escapes a quote are what a fix like this breaks.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compiles(src: &str) -> Result<String, String> {
    compile(
        src,
        CompileOptions {
            filename: Some("X.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .map_err(|e| format!("{e:?}"))
}

const HEAD: &str = "<script>\n\tconst obj = { a: 1 };\n</script>\n";

/// Every host × every lexical state that can hide a `}`. The product is the
/// test: each host reaches a different scan, and a fix to one says nothing
/// about the others — which is how three of these shipped together.
#[test]
fn a_closing_brace_inside_a_literal_does_not_end_the_expression() {
    // A regex is never the FIRST token of a template expression: `{/` opens a
    // block CLOSING tag, and official rejects `{/}/.source}` for that reason
    // too (asserted below). So the regex rows carry a leading operand, which is
    // also the shape a real file has.
    const EXPRS: [&str; 7] = [
        "obj.a + /}/.source",
        "obj.a + /[}]/.source",
        "obj.a + /\\}/.source",
        "\"}\"",
        "'}'",
        "`}`",
        "`${\"}\"}`",
    ];
    let hosts: [(&str, fn(&str) -> String); 6] = [
        ("spread", |e| format!("<div {{...{{ t: {e} }}}}></div>")),
        ("each", |e| {
            format!("{{#each [{e}] as n}}<span>{{n}}</span>{{/each}}")
        }),
        ("each-key", |e| {
            format!("{{#each [1] as n ({e})}}<span>{{n}}</span>{{/each}}")
        }),
        ("await", |e| {
            format!("{{#await Promise.resolve({e})}}p{{:then v}}<span>{{v}}</span>{{/await}}")
        }),
        ("tag", |e| format!("{{{e}}}")),
        ("attribute", |e| format!("<div title={{{e}}}></div>")),
    ];
    for (name, wrap) in hosts {
        for expr in EXPRS {
            let src = format!("{HEAD}{}\n", wrap(expr));
            compiles(&src).unwrap_or_else(|e| panic!("{name} / {expr}: {e}"));
        }
    }
}

/// The boundary the regex arm must NOT cross. `{/` in markup position is a
/// block closing tag, so a leading regex is a parse error for the official
/// compiler as well — a fix that made this compile would be an over-acceptance,
/// which is the direction the rest of this file cannot see.
#[test]
fn a_leading_slash_is_still_a_block_close() {
    let err = compiles(&format!("{HEAD}<p>{{/}}/.source}}</p>\n")).expect_err("a leading regex");
    assert!(err.contains("block_unexpected_close"), "{err}");
}

/// A `{#await}` head is the one scan that had no comment arm at all.
#[test]
fn a_comment_in_an_await_head_does_not_end_it() {
    for body in [
        "{#await Promise.resolve(obj.a) /* } */}p{:then v}<span>{v}</span>{/await}",
        "{#await Promise.resolve(obj.a) // }\n}p{:then v}<span>{v}</span>{/await}",
    ] {
        compiles(&format!("{HEAD}{body}\n")).unwrap_or_else(|e| panic!("{body:?}: {e}"));
    }
}

/// The backslash escapes the newline, so the string runs on. `'a\nb'` — an
/// escape rather than a real newline — and the template literal are the
/// controls that name the real newline, not the backslash, as what broke it.
#[test]
fn a_line_continuation_does_not_end_a_string() {
    const HOSTS: [&str; 6] = [
        "{'a\\\nb'.length}",
        "{\"a\\\nb\".length}",
        "<div title={'a\\\nb'}></div>",
        "{#if 'a\\\nb'.length}y{/if}",
        "{@html 'a\\\nb'}",
        "{#if true}{@const c = 'a\\\nb'}<span>{c}</span>{/if}",
    ];
    for body in HOSTS {
        compiles(&format!("{HEAD}{body}\n")).unwrap_or_else(|e| panic!("{body:?}: {e}"));
    }
    for control in ["{'a\\nb'.length}", "{`a\\\nb`.length}"] {
        compiles(&format!("{HEAD}{control}\n")).unwrap_or_else(|e| panic!("{control:?}: {e}"));
    }
}

/// The direction a regex-aware scan breaks: a `/` that is division. `++` before
/// one is the case a bare "what precedes it" test gets wrong, because `+` alone
/// does not end an operand and `++` does.
#[test]
fn a_division_is_still_a_division() {
    let hosts: [(&str, fn(&str) -> String); 4] = [
        ("spread", |e| format!("<div {{...{{ t: {e} }}}}></div>")),
        ("each", |e| {
            format!("{{#each [{e}] as n}}<span>{{n}}</span>{{/each}}")
        }),
        ("await", |e| {
            format!("{{#await Promise.resolve({e})}}p{{:then v}}<span>{{v}}</span>{{/await}}")
        }),
        ("tag", |e| format!("{{{e}}}")),
    ];
    const EXPRS: [&str; 3] = [
        "obj.a / 2",
        "(() => { let z = 1; z++; return z / 2; })()",
        "obj.a / 2 + /x/.source.length",
    ];
    for (name, wrap) in hosts {
        for expr in EXPRS {
            let src = format!("{HEAD}{}\n", wrap(expr));
            compiles(&src).unwrap_or_else(|e| panic!("{name} / {expr}: {e}"));
        }
    }
}

/// The escapes that decide where a string ends. `'\\'` is the one that broke a
/// sibling scanner: the backslash is itself escaped, so the quote after it
/// closes the string.
#[test]
fn the_escape_shapes_are_unchanged() {
    for expr in ["'a\\'b'.length", "'\\\\'.length", "\"a\\\"b\".length"] {
        let src = format!("{HEAD}{{{expr}}}\n");
        compiles(&src).unwrap_or_else(|e| panic!("{expr:?}: {e}"));
    }
}

/// A shorthand attribute reaches the second of the two replaced scans, and an
/// empty one still has to raise its own error rather than run off the input.
#[test]
fn the_shorthand_attribute_reader_is_unchanged() {
    compiles(&format!("{HEAD}<div {{obj}}></div>\n")).expect("a shorthand attribute");
    let err = compiles(&format!("{HEAD}<div {{}}></div>\n")).expect_err("empty shorthand");
    assert!(err.contains("attribute_empty_shorthand"), "{err}");
}
