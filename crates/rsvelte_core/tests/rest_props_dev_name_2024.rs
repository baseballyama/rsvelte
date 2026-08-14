//! Regression tests for issue #2024 — in `dev: true`, `$.rest_props` takes a
//! third argument so unknown-prop warnings can name the binding.
//!
//! The argument is the *rest binding's own name*, not the component name:
//! upstream passes `declarator.id.name` for `let props = $props()` and
//! `property.argument.name` for `let { …, ...rest } = $props()`.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_client(src: &str, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Accordion.svelte".to_string()),
            generate: GenerateMode::Client,
            dev,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[test]
fn identifier_form_passes_the_binding_name_in_dev() {
    let src = "<script>let Accordion = $props();</script><p>{Accordion.x}</p>";
    let dev = compile_client(src, true);
    assert!(
        dev.contains("$.rest_props($$props, rest_excludes, 'Accordion')"),
        "missing the dev name argument in:\n{dev}"
    );
}

#[test]
fn rest_element_passes_its_own_name_in_dev() {
    let src = "<script>let { a, ...restProps } = $props();</script><p>{a}{restProps.x}</p>";
    let dev = compile_client(src, true);
    assert!(
        dev.contains("$.rest_props($$props, rest_excludes, 'restProps')"),
        "missing the dev name argument in:\n{dev}"
    );
}

/// The name follows the binding, not the file, so a renamed rest changes it.
#[test]
fn renamed_rest_element_uses_the_local_name() {
    let src = "<script>let { a, ...others } = $props();</script><p>{a}{others.x}</p>";
    let dev = compile_client(src, true);
    assert!(
        dev.contains("$.rest_props($$props, rest_excludes, 'others')"),
        "wrong dev name argument in:\n{dev}"
    );
}

#[test]
fn production_keeps_the_two_argument_form() {
    for src in [
        "<script>let Accordion = $props();</script><p>{Accordion.x}</p>",
        "<script>let { a, ...restProps } = $props();</script><p>{a}{restProps.x}</p>",
    ] {
        let out = compile_client(src, false);
        assert!(
            out.contains("$.rest_props($$props, rest_excludes)"),
            "production picked up a dev argument in:\n{out}"
        );
    }
}

/// The exclude array is hoisted into a module-scope `Set` by a text pass that
/// used to require `])` to close the call; the third argument must not defeat it.
#[test]
fn the_exclude_set_is_still_hoisted_in_dev() {
    let src = "<script>let { a, ...rest } = $props();</script><p>{a}{rest.x}</p>";
    let dev = compile_client(src, true);
    let exclude = dev
        .find("var rest_excludes = new Set([")
        .expect("exclude set");
    let component = dev.find("export default function").expect("component");
    assert!(
        exclude < component
            && ["'$$slots'", "'$$events'", "'$$legacy'", "'a'"]
                .iter()
                .all(|name| dev[exclude..component].contains(name)),
        "the exclude array was not hoisted in:\n{dev}"
    );
}
