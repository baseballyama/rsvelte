//! Regression tests for #4386 — a `UnaryExpression` default took the eager
//! `$.fallback(v, d)` arm where upstream takes the lazy `$.fallback(v, () => d, true)` one.
//!
//! Upstream decides with `is_simple_expression` (`utils/ast.js:442-469`), whose true-list is
//! `Literal | Identifier | ArrowFunctionExpression | FunctionExpression` with a recursion for
//! `ConditionalExpression` / `BinaryExpression` / `LogicalExpression`. There is no
//! `UnaryExpression` arm, so `-1` is not simple — rsvelte's port had one, and a unary operator
//! applied to a literal answered yes.
//!
//! Every expectation below was GENERATED from the official compiler
//! (`submodules/svelte/packages/svelte/src/compiler/index.js`, `VERSION === '5.57.0'`), not
//! written by hand: 11 of the 31 shapes are a unary or contain one, and the other 20 are the
//! controls that say the fix did not move the rest of the partition.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("x.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

fn fallback_line(code: &str) -> String {
    code.lines()
        .find(|l| l.contains("$.fallback("))
        .unwrap_or_else(|| panic!("no $.fallback in:\n{code}"))
        .trim()
        .to_string()
}

fn snippet_host(default: &str) -> String {
    format!(
        "<script>let x = 1; let f = () => 1; let o = {{ k: 1 }};</script>\n\
         {{#snippet s(p = {default})}}<span>{{p}}</span>{{/snippet}}\n\
         {{@render s()}}"
    )
}

fn each_host(default: &str) -> String {
    format!(
        "<script>let x = 1; let f = () => 1; let o = {{ k: 1 }}; let items = [{{}}];</script>\n\
         {{#each items as {{ a = {default} }}}}<span>{{a}}</span>{{/each}}"
    )
}

/// `(name, default, the line the official compiler emits)`.
#[rustfmt::skip]
const SNIPPET: &[(&str, &str, &str)] = &[
    ("num", "1", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), 1));"),
    ("exp", "1e3", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), 1e3));"),
    ("hex", "0x10", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), 0x10));"),
    ("float", "1.5", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), 1.5));"),
    ("bigint", "1n", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), 1n));"),
    ("str", "'a'", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), 'a'));"),
    ("bool", "true", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), true));"),
    ("nul", "null", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), null));"),
    ("undef", "undefined", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), undefined));"),
    ("regex", "/a/g", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), /a/g));"),
    ("arrow", "() => 1", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => 1));"),
    ("fnexpr", "function () {}", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), function () {}));"),
    ("cond", "x ? 1 : 2", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), x ? 1 : 2));"),
    ("bin", "1 + 2", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), 1 + 2));"),
    ("logic", "x || 1", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), x || 1));"),
    ("neg", "-1", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => -1, true));"),
    ("pos", "+1", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => +1, true));"),
    ("negf", "-1.5", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => -1.5, true));"),
    ("not", "!0", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => !0, true));"),
    ("bnot", "~0", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => ~0, true));"),
    ("void0", "void 0", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => void 0, true));"),
    ("typeof1", "typeof 1", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => typeof 1, true));"),
    ("minus_ident", "-x", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => -x, true));"),
    ("cond_unary", "x ? -1 : 2", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => x ? -1 : 2, true));"),
    ("bin_unary", "1 + -2", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => 1 + -2, true));"),
    ("logic_unary", "x || -1", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => x || -1, true));"),
    ("tmpl", "`a`", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => `a`, true));"),
    ("arr", "[]", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => [], true));"),
    ("call", "f()", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), f, true));"),
    ("member", "o.k", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => o.k, true));"),
    ("newexpr", "new Map()", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => new Map(), true));"),
];

/// The same defaults in the other host that reaches `build_fallback_expression`. `arrow` is
/// absent because that cell diverges for an unrelated reason, pinned below.
#[rustfmt::skip]
const EACH: &[(&str, &str, &str)] = &[
    ("num", "1", "let a = $.derived_safe_equal(() => $.fallback($.get($$item).a, 1));"),
    ("exp", "1e3", "let a = $.derived_safe_equal(() => $.fallback($.get($$item).a, 1e3));"),
    ("hex", "0x10", "let a = $.derived_safe_equal(() => $.fallback($.get($$item).a, 0x10));"),
    ("float", "1.5", "let a = $.derived_safe_equal(() => $.fallback($.get($$item).a, 1.5));"),
    ("bigint", "1n", "let a = $.derived_safe_equal(() => $.fallback($.get($$item).a, 1n));"),
    ("str", "'a'", "let a = $.derived_safe_equal(() => $.fallback($.get($$item).a, 'a'));"),
    ("bool", "true", "let a = $.derived_safe_equal(() => $.fallback($.get($$item).a, true));"),
    ("nul", "null", "let a = $.derived_safe_equal(() => $.fallback($.get($$item).a, null));"),
    ("undef", "undefined", "let a = $.derived_safe_equal(() => $.fallback($.get($$item).a, undefined));"),
    ("regex", "/a/g", "let a = $.derived_safe_equal(() => $.fallback($.get($$item).a, /a/g));"),
    ("fnexpr", "function () {}", "let a = $.derived_safe_equal(() => $.fallback($.get($$item).a, function () {}));"),
    ("cond", "x ? 1 : 2", "let a = $.derived_safe_equal(() => $.fallback($.get($$item).a, x ? 1 : 2));"),
    ("bin", "1 + 2", "let a = $.derived_safe_equal(() => $.fallback($.get($$item).a, 1 + 2));"),
    ("logic", "x || 1", "let a = $.derived_safe_equal(() => $.fallback($.get($$item).a, x || 1));"),
    ("neg", "-1", "let a = $.derived_safe_equal(() => $.fallback($.get($$item).a, () => -1, true));"),
    ("pos", "+1", "let a = $.derived_safe_equal(() => $.fallback($.get($$item).a, () => +1, true));"),
    ("negf", "-1.5", "let a = $.derived_safe_equal(() => $.fallback($.get($$item).a, () => -1.5, true));"),
    ("not", "!0", "let a = $.derived_safe_equal(() => $.fallback($.get($$item).a, () => !0, true));"),
    ("bnot", "~0", "let a = $.derived_safe_equal(() => $.fallback($.get($$item).a, () => ~0, true));"),
    ("void0", "void 0", "let a = $.derived_safe_equal(() => $.fallback($.get($$item).a, () => void 0, true));"),
    ("typeof1", "typeof 1", "let a = $.derived_safe_equal(() => $.fallback($.get($$item).a, () => typeof 1, true));"),
    ("minus_ident", "-x", "let a = $.derived_safe_equal(() => $.fallback($.get($$item).a, () => -x, true));"),
    ("cond_unary", "x ? -1 : 2", "let a = $.derived_safe_equal(() => $.fallback($.get($$item).a, () => x ? -1 : 2, true));"),
    ("bin_unary", "1 + -2", "let a = $.derived_safe_equal(() => $.fallback($.get($$item).a, () => 1 + -2, true));"),
    ("logic_unary", "x || -1", "let a = $.derived_safe_equal(() => $.fallback($.get($$item).a, () => x || -1, true));"),
    ("tmpl", "`a`", "let a = $.derived_safe_equal(() => $.fallback($.get($$item).a, () => `a`, true));"),
    ("arr", "[]", "let a = $.derived_safe_equal(() => $.fallback($.get($$item).a, () => [], true));"),
    ("call", "f()", "let a = $.derived_safe_equal(() => $.fallback($.get($$item).a, f, true));"),
    ("member", "o.k", "let a = $.derived_safe_equal(() => $.fallback($.get($$item).a, () => o.k, true));"),
    ("newexpr", "new Map()", "let a = $.derived_safe_equal(() => $.fallback($.get($$item).a, () => new Map(), true));"),
];

/// A row is lazy when the oracle passed the `true` flag.
fn is_lazy(expected: &str) -> bool {
    expected.contains(", true));")
}

#[test]
fn a_snippet_parameter_default_takes_the_arm_upstream_takes() {
    for (name, default, expected) in SNIPPET {
        let line = fallback_line(&client(&snippet_host(default)));
        assert_eq!(
            &line, expected,
            "snippet host, default `{default}` ({name})"
        );
    }
}

#[test]
fn an_each_destructuring_default_takes_the_arm_upstream_takes() {
    for (name, default, expected) in EACH {
        let line = fallback_line(&client(&each_host(default)));
        assert_eq!(&line, expected, "each host, default `{default}` ({name})");
    }
}

/// Without this the tables above are satisfied by a predicate that answers one way for
/// everything: both arms have to be reachable, and the unary rows have to be on the lazy side.
#[test]
fn the_table_exercises_both_arms_and_puts_the_unary_rows_on_the_lazy_one() {
    assert!(SNIPPET.iter().any(|(_, _, e)| is_lazy(e)), "no lazy row");
    assert!(SNIPPET.iter().any(|(_, _, e)| !is_lazy(e)), "no eager row");
    assert!(EACH.iter().any(|(_, _, e)| is_lazy(e)), "no lazy row");
    assert!(EACH.iter().any(|(_, _, e)| !is_lazy(e)), "no eager row");

    // Every row whose default spells a unary operator is lazy. The eager rows above are the
    // other direction: a predicate that answered "not simple" for everything would satisfy
    // this loop and fail them.
    let unary = |d: &str| {
        d.starts_with('-')
            || d.starts_with('+')
            || d.starts_with('!')
            || d.starts_with('~')
            || d.starts_with("void ")
            || d.starts_with("typeof ")
            || d.contains(" -")
    };
    for (name, default, expected) in SNIPPET {
        if unary(default) {
            assert!(
                is_lazy(expected),
                "unary row `{default}` ({name}) is not lazy"
            );
        }
    }
}

/// A concise-body arrow in an `{#each}` destructure comes back with a BLOCK body, so the
/// default function returns `undefined`. That is #4417 and a different mechanism; it is pinned
/// here so fixing it turns this row red rather than passing unnoticed.
#[test]
fn the_each_host_concise_arrow_default_is_still_wrong() {
    let line = fallback_line(&client(&each_host("() => 1")));
    assert_eq!(
        line, "let a = $.derived_safe_equal(() => $.fallback($.get($$item).a, () => {",
        "#4417 changed: official emits `, () => 1));` on one line"
    );
}
