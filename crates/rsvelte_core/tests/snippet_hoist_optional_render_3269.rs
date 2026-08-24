//! An optional `{@render sn?.()}` inside a hoistable snippet must not block the
//! module-scope hoist (issue #3269). rsvelte's hoist walker had no arm for
//! `ChainExpression`, so the optional call fell through to the conservative
//! `_ => false` and the snippet stayed inside the component function — one
//! closure per instance instead of one per module. Every expectation here is
//! the official compiler's output for the same source.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compiled(src: &str, generate: GenerateMode, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("A.svelte".to_string()),
            generate,
            dev,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("must compile")
    .js
    .code
}

fn source(template: &str) -> String {
    format!("<script>\n\tlet flag = $state(true);\n</script>\n{template}\n")
}

/// A hoisted snippet is declared before `export default`.
fn is_hoisted(out: &str, needle: &str) -> bool {
    match (out.find(needle), out.find("export default")) {
        (Some(at), Some(default_at)) => at < default_at,
        _ => false,
    }
}

const OPTIONAL_INNER: &str = "{#snippet outer()}{#snippet sn()}<i>x</i>{/snippet}{@render sn?.()}{/snippet}{@render outer()}";

#[test]
fn an_optional_inner_render_still_hoists() {
    let server = compiled(&source(OPTIONAL_INNER), GenerateMode::Server, false);
    assert!(
        is_hoisted(&server, "function outer($$renderer)"),
        "the snippet has no component-state dependency, so it hoists:\n{server}"
    );
    // Dev wraps the same declaration in `$.wrap_snippet`.
    for (dev, needle) in [
        (false, "const outer = ($$anchor)"),
        (true, "const outer = $.wrap_snippet("),
    ] {
        let client = compiled(&source(OPTIONAL_INNER), GenerateMode::Client, dev);
        assert!(
            is_hoisted(&client, needle),
            "dev={dev}: the snippet hoists on the client too:\n{client}"
        );
    }
}

#[test]
fn an_optional_render_with_an_argument_still_hoists() {
    let template = "{#snippet outer()}{#snippet sn(v)}<i>{v}</i>{/snippet}{@render sn?.(1)}{/snippet}{@render outer()}";
    let server = compiled(&source(template), GenerateMode::Server, false);
    assert!(
        is_hoisted(&server, "function outer($$renderer)"),
        "an argument does not change the hoist decision:\n{server}"
    );
}

#[test]
fn a_state_dependency_still_blocks_the_hoist() {
    let template = "{#snippet outer()}{#snippet sn()}<i>{flag}</i>{/snippet}{@render sn?.()}{/snippet}{@render outer()}";
    let server = compiled(&source(template), GenerateMode::Server, false);
    assert!(
        !is_hoisted(&server, "function outer($$renderer)"),
        "reading component state must keep the snippet nested:\n{server}"
    );
}
