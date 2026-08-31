//! Upstream's `use_text_content` fast path (`client/visitors/RegularElement.js:346`)
//! asks only whether every `ExpressionTag` among the children is free of state,
//! await and blockers. rsvelte also let an expression through when it folded to a
//! literal — and `void <anything>` folds to `undefined` however reactive the
//! operand is, so `<em>x{void p}</em>` took the fast path and the element lost
//! its text-node placeholder.
//!
//! The rows below are the official compiler's output. `void 1` / `void s` are
//! the negative controls that separate "the expression folds" from "the
//! expression reads state": they fold too, and they must keep the fast path.

use rsvelte_core::{CompileOptions, CssMode, GenerateMode, compile};

fn client(body: &str) -> String {
    let source =
        format!("<script>\n\tlet {{ p }} = $props();\n\tlet s = $state(1);\n</script>\n\n{body}");
    compile(
        &source,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .unwrap_or_else(|e| panic!("{body}: {e:?}"))
    .js
    .code
}

/// The `$.from_html` template literal, and the first statement that puts text
/// into the element — the two halves the defect moved together.
fn template_and_text_op(body: &str) -> (String, String) {
    let code = client(body);
    let template = code
        .lines()
        .find(|l| l.contains("$.from_html("))
        .unwrap_or("(no template)")
        .trim()
        .to_string();
    let op = code
        .lines()
        .find(|l| l.contains("textContent") || l.contains("nodeValue") || l.contains("set_text"))
        .unwrap_or("(none)")
        .trim()
        .to_string();
    (template, op)
}

fn assert_row(body: &str, template: &str, op: &str) {
    let (t, o) = template_and_text_op(body);
    assert_eq!(t, template, "template for {body}");
    assert_eq!(o, op, "text op for {body}");
}

#[test]
fn a_void_over_a_reactive_operand_keeps_the_text_node() {
    // `void p` is constant, but `p` is a prop — upstream asks about the read,
    // not about the value, so the element keeps its placeholder and the constant
    // is assigned once rather than inlined into the template.
    assert_row(
        "<em>x{void p}</em>",
        "var root = $.from_html(`<em> </em>`);",
        "text.nodeValue = 'x';",
    );
    assert_row(
        "<em>{void p}</em>",
        "var root = $.from_html(`<em> </em>`);",
        "text.nodeValue = '';",
    );
    assert_row(
        "<em>{void p}y</em>",
        "var root = $.from_html(`<em> </em>`);",
        "text.nodeValue = 'y';",
    );
    assert_row(
        "<em>x{void p}y</em>",
        "var root = $.from_html(`<em> </em>`);",
        "text.nodeValue = 'xy';",
    );
}

#[test]
fn a_void_over_a_non_reactive_operand_still_takes_the_fast_path() {
    // Both of these fold exactly as `void p` does. If the rule were "does it
    // fold", these would be indistinguishable from the four rows above.
    assert_row(
        "<em>x{void 1}</em>",
        "var root = $.from_html(`<em></em>`);",
        "em.textContent = 'x';",
    );
    assert_row(
        "<em>x{void s}</em>",
        "var root = $.from_html(`<em></em>`);",
        "em.textContent = 'x';",
    );
}

#[test]
fn the_neighbouring_shapes_are_unchanged() {
    // A reactive read that does not fold; a fold over a non-reactive `$state`
    // that is never written; plain literals; and static text.
    assert_row(
        "<em>x{!p}</em>",
        "var root = $.from_html(`<em> </em>`);",
        "$.template_effect(() => $.set_text(text, `x${!$$props.p}`));",
    );
    assert_row(
        "<em>x{p}</em>",
        "var root = $.from_html(`<em> </em>`);",
        "$.template_effect(() => $.set_text(text, `x${$$props.p ?? ''}`));",
    );
    assert_row(
        "<em>x{-s}</em>",
        "var root = $.from_html(`<em></em>`);",
        "em.textContent = 'x-1';",
    );
    assert_row(
        "<em>x{1}</em>",
        "var root = $.from_html(`<em></em>`);",
        "em.textContent = 'x1';",
    );
    assert_row(
        "<em>x</em>",
        "var root = $.from_html(`<em>x</em>`);",
        "(none)",
    );
}
