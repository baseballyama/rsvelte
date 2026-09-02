//! `compileModule`'s proxy decision is upstream's deny-list, not an allow-list.
//!
//! Upstream `should_proxy` (`3-transform/client/utils.js`) returns `false` for a
//! closed set of node types and `true` for everything else. The module port
//! asked a text sniff that only proxied shapes it recognised, so a sequence, a
//! tagged template, a parenthesised object and the dev-instrumented spellings of
//! `await` / `===` all lost their `$.proxy` — output that parses, runs and is
//! not reactive.
//!
//! Every expected string is the official compiler's output for the same source.
//! The rows that already passed are kept: flipping a default is a change in the
//! direction of over-proxying, so the cells that must NOT move are the witnesses.

use rsvelte_core::compiler::ModuleCompileOptions;
use rsvelte_core::{GenerateMode, compile_module};

fn module(src: &str, dev: bool) -> String {
    compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("M.svelte.js".to_string()),
            generate: GenerateMode::Client,
            dev,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

fn decl(arg: &str, dev: bool) -> String {
    module(
        &format!("export async function f(x) {{ let s = $state({arg}); return s; }}\n"),
        dev,
    )
}

fn assign(arg: &str, dev: bool) -> String {
    module(
        &format!(
            "let s = $state(0);\nexport async function i(x) {{ s = {arg}; }}\nexport function g() {{ return s; }}\n"
        ),
        dev,
    )
}

#[track_caller]
fn has(out: &str, expected: &str) {
    assert!(out.contains(expected), "expected `{expected}`. Got:\n{out}");
}

#[track_caller]
fn lacks(out: &str, unexpected: &str) {
    assert!(
        !out.contains(unexpected),
        "did not expect `{unexpected}`. Got:\n{out}"
    );
}

#[test]
fn a_sequence_expression_is_proxied_at_both_sites_in_both_modes() {
    has(&decl("(0, {})", true), "$.tag_proxy($.proxy((0, {})), 's')");
    has(&decl("(0, {})", false), "let s = $.proxy((0, {}));");
    has(&assign("(0, {})", true), "$.set(s, (0, {}), true);");
    has(&assign("(0, {})", false), "$.set(s, (0, {}), true);");
}

#[test]
fn a_tagged_template_is_proxied_at_both_sites_in_both_modes() {
    has(&decl("x`t`", true), "$.tag_proxy($.proxy(x`t`), 's')");
    has(&decl("x`t`", false), "let s = $.proxy(x`t`);");
    has(&assign("x`t`", true), "$.set(s, x`t`, true);");
    has(&assign("x`t`", false), "$.set(s, x`t`, true);");
}

#[test]
fn a_parenthesised_object_is_proxied() {
    has(&decl("({})", true), "$.tag_proxy($.proxy({}), 's')");
    has(&decl("({})", false), "let s = $.proxy({});");
}

/// The dev instrumentation rewrites `await x` to `(await
/// $.track_reactivity_loss(x))()` before the decision runs, so the sniff's
/// `starts_with("await ")` no longer matched — which is why these two rows are
/// dev-only while the sequence and tagged-template rows above are not.
#[test]
fn a_dev_instrumented_await_is_still_proxied() {
    has(
        &decl("await x", true),
        "$.tag_proxy($.proxy((await $.track_reactivity_loss(x))()), 's')",
    );
    has(
        &assign("await x", true),
        "$.set(s, (await $.track_reactivity_loss(x))(), true);",
    );
    // prod has no rewrite and already agreed.
    has(&decl("await x", false), "let s = $.proxy(await x);");
}

/// Same shape one operator over: dev turns `x === 1` into a `$.strict_equals`
/// call, which upstream proxies, while prod keeps a `BinaryExpression`, which it
/// does not. Both directions in one pair.
#[test]
fn a_dev_equality_is_proxied_and_a_prod_equality_is_not() {
    has(
        &decl("x === 1", true),
        "$.tag_proxy($.proxy($.strict_equals(x, 1)), 's')",
    );
    let prod = decl("x === 1", false);
    has(&prod, "let s = x === 1;");
    lacks(&prod, "$.proxy");
}

/// The deny-list itself. Flipping the default is a change toward proxying, so
/// each of these is a cell that must not move — they were passing before the
/// fix and are the only rows that can report an over-reach.
#[test]
fn every_deny_list_shape_is_still_not_proxied() {
    for arg in [
        "1",
        "'x'",
        "1n",
        "/a/g",
        "true",
        "null",
        "undefined",
        "`t`",
        "!x",
        "typeof x",
        "void 0",
        "-x",
        "x + 1",
        "x instanceof Map",
        "() => 1",
        "function () {}",
        "(1)",
    ] {
        for dev in [true, false] {
            let out = decl(arg, dev);
            assert!(
                !out.contains("$.proxy"),
                "`{arg}` (dev={dev}) must not be proxied. Got:\n{out}"
            );
        }
    }
}

#[test]
fn every_proxied_shape_is_still_proxied() {
    for arg in [
        "{}",
        "[1]",
        "new Map()",
        "x ? 1 : {}",
        "x()",
        "x || {}",
        "x ?? {}",
        "x?.y",
        "class {}",
    ] {
        for dev in [true, false] {
            let out = decl(arg, dev);
            assert!(
                out.contains("$.proxy"),
                "`{arg}` (dev={dev}) must be proxied. Got:\n{out}"
            );
        }
    }
}

/// The three assignment sites pass `dev: false`. That is right for the opposite
/// reason to the declaration site: a declarator's initializer reaches upstream
/// already rewritten (so dev `x === 1` IS proxied there), while an assignment's
/// RHS does not (so the same source is NOT proxied here). The text sniff read
/// the post-edit text and got the assignment case wrong; the node reading gets
/// it right. These cells pin both directions of that asymmetry.
#[test]
fn an_assignment_whose_node_and_text_disagree_still_matches_upstream() {
    // Upstream sees a `BinaryExpression` here — an assignment's RHS is NOT the
    // rewritten node, unlike a declarator's — so it does not proxy, which is
    // what `dev: false` at these sites reproduces.
    has(&assign("x === 1", true), "$.set(s, $.strict_equals(x, 1));");
    has(&assign("x === 1", false), "$.set(s, x === 1);");
    has(
        &assign("x !== 1", true),
        "$.set(s, $.strict_equals(x, 1, false));",
    );
    has(
        &assign("(0, x === 1)", true),
        "$.set(s, (0, $.strict_equals(x, 1)), true);",
    );
    has(
        &assign("(0, x === 1)", false),
        "$.set(s, (0, x === 1), true);",
    );
}

/// An inner assignment is rewritten to a `$.set(...)` call in the text while the
/// node stays an `AssignmentExpression`; upstream proxies either way, and this
/// pins that the two readings do not part company.
#[test]
fn an_inner_assignment_is_proxied_from_the_node() {
    let src = "let s = $state(0);\nlet inner = $state(0);\nexport function i() { s = (inner = 1); }\nexport function g() { return [s, inner]; }\n";
    has(&module(src, true), "$.set(s, $.set(inner, 1), true);");
    has(&module(src, false), "$.set(s, $.set(inner, 1), true);");
}

/// A module-level `const` whose initializer is a literal or `undefined` is still
/// over-proxied at an assignment site: upstream resolves the identifier through
/// `binding.initial`, and that recursion lives in `ident_rhs_needs_proxy`, not in
/// the predicate this change replaces. Pinned so the remaining half of #4212 has
/// a witness rather than being rediscovered.
#[test]
fn a_const_initialised_to_a_literal_is_still_over_proxied_at_an_assignment() {
    let out = module(
        "let s = $state(0);\nconst c = 1;\nexport function i() { s = c; }\nexport function g() { return s; }\n",
        false,
    );
    has(&out, "$.set(s, c, true);");
}
