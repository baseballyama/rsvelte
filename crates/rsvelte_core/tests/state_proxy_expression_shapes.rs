//! Upstream's `should_proxy` returns `false` only for the shapes it enumerates
//! (a literal, a `void`/`typeof`/unary result, a known-primitive call, …) and
//! proxies **everything else**. rsvelte's `expression_needs_proxy` is a text
//! sniff that returns `true` only for the shapes IT enumerates, so the two have
//! opposite defaults and every predicate rsvelte is missing flips the answer
//! the other way.
//!
//! Optional chaining was such a shape: the member and call predicates split
//! `p?.x` at the `.` and read `p?` as the object, which matches neither, so a
//! `$state(p?.x)` lost its `$.proxy`. Both directions are checked below, and
//! the shapes that must NOT be proxied are the half a whitelist gets right by
//! accident — ablate the fix and only the `?.` rows move.
//!
//! Every expected shape was taken from the official Svelte compiler
//! (`submodules/svelte/packages/svelte/src/compiler/index.js`).

use rsvelte_core::compiler::ModuleCompileOptions;
use rsvelte_core::{GenerateMode, compile_module};

/// The `this.#a = …` initializer emitted for a constructor assigning `$state(expr)`.
fn state_initializer(expr: &str) -> String {
    let src = format!(
        "export class S {{\n  a;\n  constructor(p, f) {{\n    this.a = $state({expr});\n  }}\n}}\n"
    );
    let js = compile_module(
        &src,
        ModuleCompileOptions {
            filename: Some("Test.svelte.js".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    js.lines()
        .map(str::trim)
        .find(|l| l.starts_with("this.#a = "))
        .unwrap_or_else(|| panic!("no `this.#a =` line for `{expr}` in:\n{js}"))
        .to_string()
}

#[test]
fn an_optional_chain_is_proxied_like_the_plain_chain_it_mirrors() {
    // Each pair is the same access written with and without `?.`; upstream
    // proxies both, so a rule that reads one and not the other is the defect.
    for (plain, optional) in [
        ("p.x", "p?.x"),
        ("p.x.y", "p?.x?.y"),
        ("p.x()", "p?.x?.()"),
        ("p.x.y.toString()", "p?.x?.y.toString()"),
        ("p[0]", "p?.[0]"),
    ] {
        for expr in [plain, optional] {
            assert_eq!(
                state_initializer(expr),
                format!("this.#a = $.state($.proxy({expr}));"),
                "`{expr}` must be proxied"
            );
        }
    }
}

#[test]
fn a_ternary_spelled_with_a_leading_dot_number_keeps_its_value() {
    // `?.5` is a ternary whose consequent is `.5`, not an optional chain, so
    // the rewrite must leave those two characters alone. Measured on both
    // arms: this line is byte-identical with and without the rewrite, and it
    // is the only shape in the grid for which that is true.
    //
    // Official proxies it (`$.state($.proxy(p ? .5 : 1))`) and rsvelte does
    // not — a SEPARATE, pre-existing gap that predates this rewrite and is
    // measured out of scope below, so this test pins the value rather than
    // the proxy.
    assert_eq!(
        state_initializer("p ?.5 : 1"),
        "this.#a = $.state(p ? .5 : 1);"
    );

    // The same ternary with a space is recognised, which is what makes the
    // no-space spelling a spacing defect rather than a missing ternary rule.
    assert_eq!(
        state_initializer("p ? .5 : 1"),
        "this.#a = $.state($.proxy(p ? .5 : 1));"
    );
    assert_eq!(
        state_initializer("p ? 1 : 2"),
        "this.#a = $.state($.proxy(p ? 1 : 2));"
    );
}

#[test]
fn the_shapes_upstream_refuses_to_proxy_stay_unproxied() {
    // The negative half: a whitelist gets these right by accident, so they are
    // the control that the rewrite did not simply start proxying everything.
    for expr in ["1", "\"s\"", "null", "undefined", "true"] {
        assert_eq!(
            state_initializer(expr),
            format!("this.#a = $.state({expr});"),
            "`{expr}` must not be proxied"
        );
    }
}

#[test]
fn the_shapes_that_already_proxied_still_proxy() {
    for expr in ["f(p)", "[1, 2]", "{ a: 1 }", "p.x ?? 1", "p?.x ?? 1"] {
        let got = state_initializer(expr);
        assert!(
            got.contains("$.proxy("),
            "`{expr}` must still be proxied, got `{got}`"
        );
    }
}

/// Whether the `$.set(v, …)` emitted for a `$state` assignment in a
/// `.svelte.js` module carries the third (proxy) argument.
///
/// Counting top-level arguments rather than matching a line: both compilers
/// break the call across lines when the right-hand side is multi-line, so a
/// line-shaped test reports "no `$.set` at all" for a cell that has one.
fn assign_set_is_proxied(rhs: &str) -> bool {
    let src = format!(
        "let other = {{}}, o = {{ p: 1 }}, c = true, a = 1, b = 2, backend = {{ init: () => ({{}}) }};\n\
         let v = $state(0);\n\
         export async function go() {{\n\tv = {rhs};\n}}\n"
    );
    let js = compile_module(
        &src,
        ModuleCompileOptions {
            filename: Some("Test.svelte.js".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;

    let open = js
        .match_indices("$.set(")
        .map(|(i, _)| i + "$.set(".len())
        .find(|&i| {
            let rest = js[i..].trim_start();
            rest.strip_prefix('v')
                .is_some_and(|r| r.trim_start().starts_with(','))
        })
        .unwrap_or_else(|| panic!("no `$.set(v` call for `{rhs}` in:\n{js}"));

    let mut depth = 0usize;
    let mut args = 1usize;
    let mut string: Option<char> = None;
    let mut escaped = false;
    for c in js[open..].chars() {
        if let Some(q) = string {
            if escaped {
                escaped = false;
            } else if c == '\\' {
                escaped = true;
            } else if c == q {
                string = None;
            }
            continue;
        }
        match c {
            '\'' | '"' | '`' => string = Some(c),
            '(' | '[' | '{' => depth += 1,
            ')' | ']' | '}' if depth == 0 => break,
            ')' | ']' | '}' => depth -= 1,
            ',' if depth == 0 => args += 1,
            _ => {}
        }
    }
    args >= 3
}

#[test]
fn a_parenthesized_right_hand_side_is_decided_by_what_the_parens_hold() {
    // acorn builds no `ParenthesizedExpression`, so upstream decides on the
    // inside. Measured one cell per row against
    // `submodules/svelte/.../compiler/index.js` 5.56.10 in this same module
    // host: the `true` rows are the ones the text sniff answered `false` for
    // (17 of 24 cells), and the `false` rows are the negative controls -- they
    // pass today and a "a leading `(` proxies" rule would break every one.
    for (rhs, proxied) in [
        ("(await backend.init())", true),
        ("(other)", true),
        ("({ a: 1 })", true),
        ("(new Map())", true),
        ("(o.p)", true),
        ("(c ? a : b)", true),
        ("(a, o)", true),
        ("((backend.init()))", true),
        ("(1)", false),
        ("('s')", false),
        ("(`t`)", false),
        ("((x) => x)", false),
        ("(!a)", false),
        ("(a + b)", false),
        // An arrow whose parameter list is parenthesized opens with a paren
        // group that does NOT enclose the expression, so it reaches the
        // call/member rule below. Both spellings, because the multi-line one is
        // what a real module carries and the single-line one is what a grid
        // written by hand carries.
        ("(x) => x", false),
        (
            "(event) =>\n\t\tevent.type === 'click'\n\t\t\t? 'clicked'\n\t\t\t: 'other'",
            false,
        ),
        ("async (x) => x", false),
    ] {
        assert_eq!(assign_set_is_proxied(rhs), proxied, "`{rhs}`");
    }
}

#[test]
fn a_call_or_member_on_a_parenthesized_base_is_still_proxied() {
    // The shape the dev-mode await instrumentation produces: it rewrites
    // `v = await p()` into `v = (await $.track_reactivity_loss(p()))()`, so the
    // proxy decision reaches a callee no identifier-led predicate can read.
    // That is why this row diverged only under `dev: true` while the same
    // source was byte-equal in production.
    for rhs in [
        "(await backend.init())()",
        "(() => 1)()",
        "(function () { return 1; })()",
        "(o).p",
        "(o)[0]",
        "(backend.init()).x",
        "(o)?.p",
        "(o)?.[0]",
    ] {
        assert!(assign_set_is_proxied(rhs), "`{rhs}`");
    }
}

#[test]
fn a_trailing_comma_is_not_a_sequence_expression() {
    // A class field whose `$state(...)` call is written across lines arrives with
    // the source's trailing comma inside the argument text. `a,` is not a
    // `SequenceExpression`, so the initializer is decided by what precedes it.
    // The host matters: the assignment path never sees a trailing comma, so a
    // grid written only on `v = <rhs>` cannot reach this at all.
    for (src, proxied) in [
        (
            "export class C {\n\th = $state(\n\t\t(e) =>\n\t\t\te.type === 'click'\n\t\t\t\t? 'a'\n\t\t\t\t: 'b',\n\t);\n}\n",
            false,
        ),
        (
            "export class C {\n\th = $state(\n\t\t(e) =>\n\t\t\te.type === 'click'\n\t\t\t\t? 'a'\n\t\t\t\t: 'b'\n\t);\n}\n",
            false,
        ),
        (
            "export class C {\n\th = $state(\n\t\t{ a: 1 },\n\t);\n}\n",
            true,
        ),
        (
            "export class C {\n\th = $state(\n\t\t(a, o),\n\t);\n}\n",
            true,
        ),
    ] {
        let js = compile_module(
            src,
            ModuleCompileOptions {
                filename: Some("Test.svelte.js".to_string()),
                generate: GenerateMode::Client,
                ..Default::default()
            },
        )
        .expect("compile")
        .js
        .code;
        assert_eq!(js.contains("$.proxy("), proxied, "{src}\n-> {js}");
    }
}
