//! Regression test for issue #2039 — the dev `$.add_svelte_meta` call around a
//! `<svelte:self>` instantiation carried `1, 0` instead of the element's real
//! position, because the `SvelteSelf` arm discarded the node's start offset.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_dev(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Comp.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[test]
fn position_follows_the_element_on_its_own_line() {
    let out = compile_dev("{#if depth > 1}\n\t<svelte:self depth={depth - 1}/>\n{/if}");
    assert!(out.contains("'component', Comp, 2, 1,"), "in:\n{out}");
    assert!(
        !out.contains("Comp, 1, 0,"),
        "placeholder position in:\n{out}"
    );
}

#[test]
fn position_follows_the_element_on_a_shared_line() {
    let out = compile_dev("{#if depth > 1}<svelte:self depth={depth - 1}/>{/if}");
    assert!(out.contains("'component', Comp, 1, 15,"), "in:\n{out}");
}

/// The tag name is still reported as `svelte:self`, not the component's name.
#[test]
fn the_component_tag_is_unchanged() {
    let out = compile_dev("{#if x}\n\t<svelte:self />\n{/if}");
    assert!(
        out.contains("{ componentTag: 'svelte:self' }"),
        "in:\n{out}"
    );
}

/// An ordinary component was already correct — guard against regressing it.
#[test]
fn a_plain_component_keeps_its_position() {
    let out = compile_dev("<script>import Input from './Input.svelte';</script>\n<Input />");
    assert!(out.contains("'component', Comp, 2, 0,"), "in:\n{out}");
}
