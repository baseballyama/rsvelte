//! A comment written between a declarator's `=` and its rune call belongs
//! *inside* whatever the rune lowers to, not ahead of the declaration.
//!
//! Upstream never leaves it outside, and the four rune forms put it in four
//! different slots because of how `VariableDeclaration.js` builds them:
//!
//! | rune | built as | where esrap flushes the comment |
//! |---|---|---|
//! | `$state` / `$state.raw` | `b.id('$.state', init.callee.loc)` — the callee inherits the source `loc` | before `$.state`, i.e. just inside `$.tag(` |
//! | `$state({…})` non-reactive | `b.call('$.proxy', value)` — plain string callee, no `loc` | before the argument, inside `$.proxy(` |
//! | `$derived(expr)` | `b.call('$.derived', b.thunk(expr))` — the arrow has no `loc`, its body does | inside the synthesized thunk's empty parameter parens |
//! | `$derived.by(fn)` | `b.call('$.derived', fn)` — the argument is the user's own located function | before that argument |
//!
//! The rule under all four is one thing: the comment prints just before the
//! first node of the OUTPUT that still carries a source range at or after it.
//! Every expectation here is the pinned official compiler's own output.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(script: &str, template: &str, dev: bool) -> String {
    let source = format!("<script>\n\t{script}\n</script>\n\n{template}\n");
    compile(
        &source,
        CompileOptions {
            generate: GenerateMode::Client,
            dev,
            ..Default::default()
        },
    )
    .expect("compile failed")
    .js
    .code
}

/// `a` is reassigned from the template, so every shape below that names it
/// lowers to a real state source rather than being folded to a constant.
const COUNTER: &str = "<button onclick={() => a++}>{a}</button>";

#[track_caller]
fn assert_contains(code: &str, needle: &str) {
    assert!(
        code.contains(needle),
        "expected to find\n  {needle}\nin:\n{code}"
    );
}

#[test]
fn state_lead_comment_goes_inside_the_dev_tag_call() {
    let script = "let a = /* c */ $state(0);";
    assert_contains(
        &client(script, COUNTER, false),
        "let a = /* c */ $.state(0);",
    );
    assert_contains(
        &client(script, COUNTER, true),
        "let a = $.tag(/* c */ $.state(0), 'a');",
    );
}

#[test]
fn state_raw_lead_comment_goes_inside_the_dev_tag_call() {
    let script = "let a = /* c */ $state.raw(0);";
    assert_contains(
        &client(script, COUNTER, false),
        "let a = /* c */ $.state(0);",
    );
    assert_contains(
        &client(script, COUNTER, true),
        "let a = $.tag(/* c */ $.state(0), 'a');",
    );
}

/// A proxied state source still leads with `$.state(`, so the comment sits at
/// the tag call's opening paren rather than descending into `$.proxy(`.
#[test]
fn proxied_state_lead_comment_stays_ahead_of_the_state_call() {
    let script = "let a = /* c */ $state({ n: 0 });";
    let template = "<button onclick={() => (a = { n: 1 })}>{a.n}</button>";
    assert_contains(
        &client(script, template, false),
        "let a = /* c */ $.state($.proxy({ n: 0 }));",
    );
    assert_contains(
        &client(script, template, true),
        "let a = $.tag(/* c */ $.state($.proxy({ n: 0 })), 'a');",
    );
}

/// The discriminating row for the `$.proxy` slot: with no `$.state` wrapper the
/// only located node left is the argument, so the comment moves inside the
/// proxy call. A rule that always put it after the tag's `(` would print
/// `$.tag_proxy(/* c */ $.proxy({ n: 0 }), 'o')` here.
#[test]
fn non_reactive_proxy_lead_comment_goes_before_the_argument() {
    let script = "let a = $state(0);\n\tlet o = /* c */ $state({ n: 0 });";
    let template = "<button onclick={() => a++}>{a}</button>{o.n}";
    assert_contains(
        &client(script, template, false),
        "let o = $.proxy(/* c */ { n: 0 });",
    );
    assert_contains(
        &client(script, template, true),
        "let o = $.tag_proxy($.proxy(/* c */ { n: 0 }), 'o');",
    );
}

#[test]
fn derived_lead_comment_goes_into_the_synthesized_thunk_parens() {
    let script = "let a = $state(0);\n\tlet d = /* c */ $derived(a * 2);";
    let template = "<button onclick={() => a++}>{a}</button>{d}";
    assert_contains(
        &client(script, template, false),
        "let d = $.derived((/* c */) => $.get(a) * 2);",
    );
    assert_contains(
        &client(script, template, true),
        "let d = $.tag($.derived((/* c */) => $.get(a) * 2), 'd');",
    );
}

#[test]
fn derived_object_lead_comment_goes_into_the_synthesized_thunk_parens() {
    let script = "let a = $state(0);\n\tlet d = /* c */ $derived({ n: a });";
    let template = "<button onclick={() => a++}>{a}</button>{d.n}";
    assert_contains(
        &client(script, template, false),
        "let d = $.derived((/* c */) => ({ n: $.get(a) }));",
    );
}

/// `$derived.by` hands its argument through unchanged, so there is no
/// synthesized arrow to park the comment in and it lands before the user's own
/// function instead.
#[test]
fn derived_by_lead_comment_goes_before_the_user_function() {
    let script = "let a = $state(0);\n\tlet d = /* c */ $derived.by(() => a * 2);";
    let template = "<button onclick={() => a++}>{a}</button>{d}";
    assert_contains(
        &client(script, template, false),
        "let d = $.derived(/* c */ () => $.get(a) * 2);",
    );
    assert_contains(
        &client(script, template, true),
        "let d = $.tag($.derived(/* c */ () => $.get(a) * 2), 'd');",
    );
}

/// A `//` comment cannot be followed by code on the same line, so the closing
/// paren esrap writes after it starts a line of its own.
#[test]
fn a_line_comment_breaks_the_thunk_parens_across_lines() {
    let script = "let a = $state(0);\n\tlet d = // c\n\t\t$derived(a * 2);";
    let template = "<button onclick={() => a++}>{a}</button>{d}";
    assert_contains(
        &client(script, template, false),
        "let d = $.derived((// c\n\t) => $.get(a) * 2);",
    );
}

/// Control: a comment before the binding NAME is not part of the run adjacent
/// to the call, and upstream leaves it where the source put it.
#[test]
fn a_comment_before_the_binding_name_does_not_move() {
    let script = "let /* c */ a = $state(0);";
    assert_contains(
        &client(script, COUNTER, false),
        "let /* c */ a = $.state(0);",
    );
    assert_contains(
        &client(script, COUNTER, true),
        "let /* c */ a = $.tag($.state(0), 'a');",
    );
}

/// Control: a comment already inside the rune's parens reaches the same slot,
/// and must not be moved a second time or duplicated.
#[test]
fn a_comment_inside_the_rune_parens_is_unchanged() {
    let script = "let a = $state(/* c */ 0);";
    assert_contains(
        &client(script, COUNTER, false),
        "let a = $.state(/* c */ 0);",
    );
    assert_contains(
        &client(script, COUNTER, true),
        "let a = $.tag($.state(/* c */ 0), 'a');",
    );
}

/// Control: a declarator that lowers to its bare argument has no wrapper for
/// the comment to move into, so it stays ahead of the initializer.
#[test]
fn a_folded_declarator_keeps_its_lead_comment_outside() {
    let script = "let a = $state(0);\n\tlet o = /* c */ $state(1);";
    let template = "<button onclick={() => a++}>{a}</button>{o}";
    assert_contains(&client(script, template, false), "let o = /* c */ 1;");
    assert_contains(&client(script, template, true), "let o = /* c */ 1;");
}
