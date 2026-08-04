//! `<svelte:component>` is an inline component upstream, so its direct
//! `{#snippet}` children are demoted to implicit props anchored by a
//! `$$prop_def` destructure — exactly like a named component's and
//! `<svelte:self>`'s. The `let:` / named-slot paths keep their own block
//! scoping and must not demote.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn convert(src: &str) -> String {
    let opts = Svelte2TsxOptions {
        filename: "Input.svelte".to_string(),
        is_ts_file: false,
        ..Default::default()
    };
    svelte2tsx(src, opts).expect("svelte2tsx ok").code
}

#[test]
fn svelte_component_snippet_children_become_props() {
    let code = convert(
        "<script>\n let C;\n</script>\n<svelte:component this={C}>\n{#snippet foo(a)}<p>{a}</p>{/snippet}\n</svelte:component>\n",
    );
    assert!(
        code.contains(".$$prop_def;"),
        "expected the snippet to be demoted to a prop, got:\n{code}"
    );
    assert!(
        code.contains("const {foo}"),
        "expected the snippet name in the $$prop_def destructure, got:\n{code}"
    );
    assert!(
        !code.contains("const foo"),
        "the snippet must not stay a standalone const, got:\n{code}"
    );
}

#[test]
fn svelte_component_multiple_snippet_children_become_props() {
    let code = convert(
        "<script>\n let C;\n</script>\n<svelte:component this={C}>\n{#snippet foo(a)}{a}{/snippet}\n{#snippet bar()}b{/snippet}\n</svelte:component>\n",
    );
    assert!(
        code.contains("const {foo, bar}"),
        "expected both snippets in the $$prop_def destructure, got:\n{code}"
    );
}

#[test]
fn svelte_component_slot_lets_keep_the_slot_path() {
    // `let:` scoping owns the children, so snippets stay plain block children.
    let code = convert(
        "<script>\n let C;\n</script>\n<svelte:component this={C} let:item>\n{#snippet foo(a)}<p>{a}</p>{/snippet}\n{item}\n</svelte:component>\n",
    );
    assert!(
        !code.contains("$$prop_def"),
        "the let: path must not demote snippets, got:\n{code}"
    );
}

#[test]
fn svelte_component_named_slot_children_keep_the_slot_path() {
    let code = convert(
        "<script>\n let C;\n</script>\n<svelte:component this={C}>\n<div slot=\"x\" let:item>{item}</div>\n{#snippet foo(a)}<p>{a}</p>{/snippet}\n</svelte:component>\n",
    );
    assert!(
        !code.contains("$$prop_def"),
        "the named-slot path must not demote snippets, got:\n{code}"
    );
}
