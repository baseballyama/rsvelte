//! A `class:` directive whose value is the identifier of the same name reaches
//! `$.attributes` untransformed on the server.
//!
//! This reproduces an upstream defect. `prepare_element_spread` passes such a directive
//! through as `b.id(name)` with no read transform, so a `$derived` arrives as the derived
//! *function* — always truthy — and SSR emits the class unconditionally. Upstream's own
//! client emits `$.get(active)` and is correct; only the server port diverges. We match it
//! because byte equality with the official compiler is the goal; when upstream transforms
//! the value this test goes red, and that is when to follow.
//!
//! The condition is on the EXPRESSION, not on the syntax: `class:active={active}` satisfies
//! `expression.type === 'Identifier' && expression.name === directive.name` just as the
//! shorthand does, and both diverged before the fix. Keying on "was it written shorthand"
//! would leave the explicit form wrong.
//!
//! The no-spread rows are the control. Upstream's `build_attr_class` has no such arm, so a
//! `class:` directive without a spread on the same element still transforms; conforming
//! there would be a regression rather than a match.
//!
//! Report: `upstream_issues/4117-svelte-class-shorthand-reaches-attributes-untransformed.md`

use rsvelte_core::{CompileOptions, CssMode, GenerateMode, compile};

fn server(markup: &str) -> String {
    let src = format!(
        "<script>\n\tlet {{ to }} = $props();\n\tlet active = $derived(to === \"x\");\n\tlet rest = {{ id: 'r' }};\n</script>\n{markup}\n<style>\n\t.active {{ color: red }}\n</style>\n"
    );
    compile(
        &src,
        CompileOptions {
            filename: Some("C.svelte".into()),
            generate: GenerateMode::Server,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

fn attributes_call(code: &str) -> String {
    code.lines()
        .find(|l| l.contains("$.attributes("))
        .unwrap_or_else(|| panic!("no $.attributes call in:\n{code}"))
        .trim()
        .to_string()
}

#[test]
fn a_shorthand_beside_a_spread_is_passed_uncalled() {
    let call = attributes_call(&server("<a class:active {...rest}>t</a>"));
    assert!(
        call.contains("{ active }") && !call.contains("active()"),
        "upstream passes the derived uncalled here; got: {call}"
    );
}

#[test]
fn an_explicit_self_named_value_beside_a_spread_is_passed_uncalled() {
    let call = attributes_call(&server("<a class:active={active} {...rest}>t</a>"));
    assert!(
        call.contains("{ active }") && !call.contains("active()"),
        "the rule is keyed on the expression, not the syntax; got: {call}"
    );
}

#[test]
fn a_differently_named_value_beside_a_spread_is_still_transformed() {
    let src = "<a class:on={active} {...rest}>t</a>";
    let call = attributes_call(&server(src));
    assert!(
        call.contains("active()"),
        "the identifier's name differs from the directive's, so upstream transforms it; got: {call}"
    );
}

#[test]
fn a_shorthand_without_a_spread_is_still_transformed() {
    let out = server("<a class:active>t</a>");
    assert!(
        out.contains("active()"),
        "upstream's build_attr_class has no shorthand arm; got:\n{out}"
    );
}
