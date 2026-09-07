//! An `{#each}` destructuring default that is a concise-body arrow (#4417).
//!
//! Phase 1's ESTree serializer keeps a concise arrow body inside the
//! `BlockStatement`/`ExpressionStatement` wrapper oxc used to synthesise, and
//! records the real form in `expression: true` beside it. The client's typed
//! converter read the body and not the flag, so it re-emitted the wrapper:
//! `() => 1` became `() => { 1; }`, a function that returns `undefined`, and
//! `() => ({ a: 1 })` became a block holding a labelled statement.
//!
//! The axis is the arrow's **body form** crossed with the host, not "arrow
//! defaults": a block-bodied arrow and a function expression must be untouched,
//! which is what separates honouring the flag from unwrapping every block. The
//! `{#snippet}` rows agreed before the fix and are the third host, so a change
//! that reaches only the each-block port has a witness.
//!
//! There is deliberately no `compatibility/pattern-corpus` repro: the fmt gate
//! shares that manifest, and its oracle **throws** on any `{#each}` pattern
//! default that is an arrow — `unknown node type: ArrowFunctionExpression`,
//! recorded as `upstream_issues/oxfmt-each-pattern-default-unknown-node-type.md`
//! — so a corpus file carrying the shape this fix is about would only add an
//! `fmt-oracle-excluded` entry. This grid is the gate.
//!
//! Every expectation is read out of `svelte.compile({ generate: 'client' })` at
//! `VERSION === '5.57.0'`.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// `(name, the default's source, the whole `$.fallback` line official emits)`.
///
/// A cell whose expectation ends mid-arrow is one where official breaks the
/// line — the prefix is still the whole of what precedes the break, so a body
/// form that changed would move it.
#[rustfmt::skip]
const CELLS: &[(&str, &str, &str)] = &[
    ("each_obj::concise", "() => 1", "\t\tlet a = $.derived_safe_equal(() => $.fallback($.get($$item).a, () => 1));"),
    ("each_obj::concise_param", "(z) => z", "\t\tlet a = $.derived_safe_equal(() => $.fallback($.get($$item).a, (z) => z));"),
    ("each_obj::concise_obj", "() => ({ a: 1 })", "\t\tlet a = $.derived_safe_equal(() => $.fallback($.get($$item).a, () => ({ a: 1 })));"),
    ("each_obj::concise_async", "async () => 1", "\t\tlet a = $.derived_safe_equal(() => $.fallback($.get($$item).a, async () => 1));"),
    ("each_obj::concise_call", "() => f()", "\t\tlet a = $.derived_safe_equal(() => $.fallback($.get($$item).a, () => f()));"),
    ("each_obj::concise_str", "() => 'a'", "\t\tlet a = $.derived_safe_equal(() => $.fallback($.get($$item).a, () => 'a'));"),
    ("each_obj::concise_arrow", "() => () => 1", "\t\tlet a = $.derived_safe_equal(() => $.fallback($.get($$item).a, () => () => 1));"),
    ("each_obj::block", "() => { return 1; }", "\t\tlet a = $.derived_safe_equal(() => $.fallback($.get($$item).a, () => {"),
    ("each_obj::fn_expr", "function () { return 1; }", "\t\tlet a = $.derived_safe_equal(() => $.fallback($.get($$item).a, function () {"),
    ("each_obj::literal", "1", "\t\tlet a = $.derived_safe_equal(() => $.fallback($.get($$item).a, 1));"),
    ("each_arr::concise", "() => 1", "\t\tlet a = $.derived_safe_equal(() => $.fallback($.get($$array)[0], () => 1));"),
    ("each_arr::concise_param", "(z) => z", "\t\tlet a = $.derived_safe_equal(() => $.fallback($.get($$array)[0], (z) => z));"),
    ("each_arr::concise_obj", "() => ({ a: 1 })", "\t\tlet a = $.derived_safe_equal(() => $.fallback($.get($$array)[0], () => ({ a: 1 })));"),
    ("each_arr::concise_async", "async () => 1", "\t\tlet a = $.derived_safe_equal(() => $.fallback($.get($$array)[0], async () => 1));"),
    ("each_arr::concise_call", "() => f()", "\t\tlet a = $.derived_safe_equal(() => $.fallback($.get($$array)[0], () => f()));"),
    ("each_arr::concise_str", "() => 'a'", "\t\tlet a = $.derived_safe_equal(() => $.fallback($.get($$array)[0], () => 'a'));"),
    ("each_arr::concise_arrow", "() => () => 1", "\t\tlet a = $.derived_safe_equal(() => $.fallback($.get($$array)[0], () => () => 1));"),
    ("each_arr::block", "() => { return 1; }", "\t\tlet a = $.derived_safe_equal(() => $.fallback($.get($$array)[0], () => {"),
    ("each_arr::fn_expr", "function () { return 1; }", "\t\tlet a = $.derived_safe_equal(() => $.fallback($.get($$array)[0], function () {"),
    ("each_arr::literal", "1", "\t\tlet a = $.derived_safe_equal(() => $.fallback($.get($$array)[0], 1));"),
    ("snippet::concise", "() => 1", "\tlet a = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => 1));"),
    ("snippet::concise_param", "(z) => z", "\tlet a = $.derived_safe_equal(() => $.fallback($$arg0?.(), (z) => z));"),
    ("snippet::concise_obj", "() => ({ a: 1 })", "\tlet a = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => ({ a: 1 })));"),
    ("snippet::concise_async", "async () => 1", "\tlet a = $.derived_safe_equal(() => $.fallback($$arg0?.(), async () => 1));"),
    ("snippet::concise_call", "() => f()", "\t\tlet a = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => f()));"),
    ("snippet::concise_str", "() => 'a'", "\tlet a = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => 'a'));"),
    ("snippet::concise_arrow", "() => () => 1", "\tlet a = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => () => 1));"),
    ("snippet::block", "() => { return 1; }", "\tlet a = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => {"),
    ("snippet::fn_expr", "function () { return 1; }", "\tlet a = $.derived_safe_equal(() => $.fallback($$arg0?.(), function () {"),
    ("snippet::literal", "1", "\tlet a = $.derived_safe_equal(() => $.fallback($$arg0?.(), 1));"),
];

/// The rows whose body form the fix must NOT change.
const CONTROLS: &[&str] = &["block", "fn_expr", "literal"];

fn host(name: &str, default_src: &str) -> String {
    let (kind, _) = name.split_once("::").expect("name is <host>::<default>");
    match kind {
        "each_obj" => format!(
            "<script>let items = [{{}}]; let f = () => 1;</script>{{#each items as {{ a = {default_src} }}}}<span>{{a}}</span>{{/each}}"
        ),
        "each_arr" => format!(
            "<script>let items = [[]]; let f = () => 1;</script>{{#each items as [a = {default_src}]}}<span>{{a}}</span>{{/each}}"
        ),
        "snippet" => format!(
            "<script>let f = () => 1;</script>{{#snippet s(a = {default_src})}}<span>{{a}}</span>{{/snippet}}{{@render s()}}"
        ),
        other => panic!("unknown host {other}"),
    }
}

fn fallback_line(source: &str) -> String {
    let code = compile(
        source,
        CompileOptions {
            filename: Some("X.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compiles")
    .js
    .code;
    code.lines()
        .filter(|line| line.contains("$.fallback("))
        .collect::<Vec<_>>()
        .join(" \u{23ce} ")
}

#[test]
fn every_cell_matches_the_oracle() {
    let mut mismatched = Vec::new();
    for (name, default_src, expected) in CELLS {
        let actual = fallback_line(&host(name, default_src));
        if actual != *expected {
            mismatched.push(format!("{name}\n  want {expected:?}\n  got  {actual:?}"));
        }
    }
    assert!(mismatched.is_empty(), "{}", mismatched.join("\n"));
}

/// A concise body must not be re-emitted as a block, on every host that has one.
#[test]
fn a_concise_body_stays_concise() {
    let mut checked = 0;
    for (name, default_src, _) in CELLS {
        let (_, default_name) = name.split_once("::").expect("name is <host>::<default>");
        if !default_name.starts_with("concise") {
            continue;
        }
        let line = fallback_line(&host(name, default_src));
        assert!(
            !line.trim_end().ends_with("=> {"),
            "{name}: a concise body was re-emitted as a block: {line:?}"
        );
        checked += 1;
    }
    assert_eq!(
        checked, 21,
        "the concise rows are the population under test"
    );
}

/// The block-bodied arrow, the function expression and the literal decide
/// whether the fix honours `expression` or simply unwraps every block.
#[test]
fn a_real_block_body_is_untouched() {
    let mut checked = 0;
    for (name, default_src, expected) in CELLS {
        let (_, default_name) = name.split_once("::").expect("name is <host>::<default>");
        if !CONTROLS.contains(&default_name) {
            continue;
        }
        assert_eq!(fallback_line(&host(name, default_src)), *expected, "{name}");
        checked += 1;
    }
    assert_eq!(checked, CONTROLS.len() * 3);
}

/// The default is a function, so it has to still BE one — a concise body that
/// lost its expression would compile and return `undefined`.
#[test]
fn the_concise_default_returns_its_expression() {
    let line = fallback_line(&host("each_obj::concise", "() => 1"));
    assert!(line.contains("() => 1"), "{line:?}");
    let object = fallback_line(&host("each_obj::concise_obj", "() => ({ a: 1 })"));
    assert!(object.contains("() => ({ a: 1 })"), "{object:?}");
}
