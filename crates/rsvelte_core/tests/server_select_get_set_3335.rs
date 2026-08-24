//! On the server a `bind:x={get, set}` pair renders the **getter's result**:
//! upstream's `build_spread_object` and `build_element_attributes` both collapse
//! the `SequenceExpression` to `b.call(expressions[0])`. rsvelte had the collapse
//! only in the second, so `<select>` — the one host that goes through
//! `build_spread_object` — emitted the sequence whole. A sequence evaluates to
//! its LAST operand, so `$$renderer.select` was handed the **setter** as the
//! value to match options against: no option is ever marked `selected` and the
//! server markup disagrees with what the client hydrates to (issue #3335).
//!
//! Every expectation below was measured against the official compiler at
//! `svelte@5.56.8`, not recalled.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

const PAIR: &str = "{() => v, (nv) => v = nv}";

fn server_js(markup: &str) -> String {
    let source = format!("<script>\n\tlet v = 1;\n\tlet rest = {{}};\n</script>\n{markup}\n");
    compile(
        &source,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Server,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("the component compiles")
    .js
    .code
}

/// `<select>` is the host the defect lived on, and the four rows differ in what
/// else lands in the same object — a class, a spread, and the `multiple` flag —
/// because the collapse has to survive being merged with them.
#[test]
fn a_select_get_set_bind_renders_the_getters_result() {
    let cases = [
        (
            format!("<select bind:value={PAIR}><option>a</option></select>"),
            "$$renderer.select({ value: (() => v)() }, ($$renderer) => {",
        ),
        (
            format!("<select multiple bind:value={PAIR}><option>a</option></select>"),
            "$$renderer.select({ multiple: true, value: (() => v)() }, ($$renderer) => {",
        ),
        (
            format!("<select class=\"c\" bind:value={PAIR}><option>a</option></select>"),
            "$$renderer.select({ class: 'c', value: (() => v)() }, ($$renderer) => {",
        ),
        (
            format!("<select {{...rest}} bind:value={PAIR}><option>a</option></select>"),
            "$$renderer.select({ ...rest, value: (() => v)() }, ($$renderer) => {",
        ),
    ];

    for (markup, expected) in cases {
        let js = server_js(&markup);
        assert!(
            js.lines().any(|l| l.trim() == expected),
            "for {markup}\nexpected a line: {expected}\ngot:\n{js}"
        );
    }
}

/// The controls: hosts that already collapsed the sequence, through the other
/// builder. Without them the change is equally satisfied by "call the getter
/// everywhere, including where upstream does not".
#[test]
fn the_hosts_that_were_already_right_are_unchanged() {
    let cases = [
        (
            format!("<input type=\"text\" bind:value={PAIR} />"),
            "$.attr('value', (() => v)())",
        ),
        (
            format!("<input type=\"checkbox\" bind:checked={PAIR} />"),
            "$.attr('checked', (() => v)(), true)",
        ),
        (
            format!("<details bind:open={PAIR}></details>"),
            "$.attr('open', (() => v)(), true)",
        ),
    ];

    for (markup, expected) in cases {
        let js = server_js(&markup);
        assert!(
            js.contains(expected),
            "for {markup}\nexpected to contain: {expected}\ngot:\n{js}"
        );
    }
}

/// The sequence must not be emitted whole anywhere: a rendered `(nv) => v = nv`
/// is the setter reaching the renderer, which is the defect's signature and is
/// invisible to a test that only asserts the getter call is present.
#[test]
fn no_host_emits_the_setter_as_the_value() {
    for markup in [
        format!("<select bind:value={PAIR}><option>a</option></select>"),
        format!("<select multiple bind:value={PAIR}><option>a</option></select>"),
        format!("<select class=\"c\" bind:value={PAIR}><option>a</option></select>"),
        format!("<select {{...rest}} bind:value={PAIR}><option>a</option></select>"),
        format!("<input type=\"text\" bind:value={PAIR} />"),
        format!("<details bind:open={PAIR}></details>"),
    ] {
        let js = server_js(&markup);
        assert!(
            !js.contains("(nv) => v = nv"),
            "for {markup}\nthe setter reached the output:\n{js}"
        );
    }
}
