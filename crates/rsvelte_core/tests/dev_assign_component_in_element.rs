//! Upstream exempts a component-prop arrow from the dev `$.assign` wrap only
//! when the component itself is a `Fragment` child
//! (`path.at(-2) === 'Component' && path.at(-3) === 'Fragment'`,
//! `AssignmentExpression.js`). An element's children are the one container it
//! does not visit through a `Fragment` node, so a component nested in an
//! element keeps the wrap.
//!
//! The corpus gates compile with `dev: false`, so nothing else covers this.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_client_dev(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Main.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

const SCRIPT: &str =
    "<script>\n\timport Foo from './Foo.svelte';\n\tlet obj = $state({ p: 0 });\n</script>\n";

#[test]
fn a_component_directly_in_a_fragment_keeps_its_arrow_bare() {
    let out = compile_client_dev(&format!("{SCRIPT}<Foo onX={{(e) => (obj.p = e.v)}} />\n"));
    assert!(!out.contains("$.assign("), "got:\n{out}");
}

#[test]
fn a_component_nested_in_an_element_is_wrapped() {
    let out = compile_client_dev(&format!(
        "{SCRIPT}<div><Foo onX={{(e) => (obj.p = e.v)}} /></div>\n"
    ));
    assert!(out.contains("$.assign("), "got:\n{out}");
}

#[test]
fn a_block_inside_an_element_is_a_fragment_again() {
    let out = compile_client_dev(&format!(
        "{SCRIPT}<div>{{#if obj.p}}<Foo onX={{(e) => (obj.p = e.v)}} />{{/if}}</div>\n"
    ));
    assert!(!out.contains("$.assign("), "got:\n{out}");
}

#[test]
fn slot_content_inside_an_element_is_a_fragment_again() {
    let out = compile_client_dev(&format!(
        "{SCRIPT}<div><Foo><Foo onX={{(e) => (obj.p = e.v)}} /></Foo></div>\n"
    ));
    assert!(!out.contains("$.assign("), "got:\n{out}");
}

#[test]
fn a_legacy_on_directive_follows_the_same_rule() {
    let bare = compile_client_dev(&format!("{SCRIPT}<Foo on:x={{(e) => (obj.p = e.v)}} />\n"));
    assert!(!bare.contains("$.assign("), "got:\n{bare}");

    let wrapped = compile_client_dev(&format!(
        "{SCRIPT}<div><Foo on:x={{(e) => (obj.p = e.v)}} /></div>\n"
    ));
    assert!(wrapped.contains("$.assign("), "got:\n{wrapped}");
}
