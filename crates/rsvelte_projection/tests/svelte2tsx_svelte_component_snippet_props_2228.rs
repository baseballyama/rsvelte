//! `<svelte:component>` is an inline component upstream, so its direct
//! `{#snippet}` children are demoted to implicit props anchored by a
//! `$$prop_def` destructure — exactly like a named component's and
//! `<svelte:self>`'s. This demotion is unconditional: it applies alongside —
//! not instead of — `let:` / named-slot children, which keep their own block
//! scoping independently (#2171).

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
fn svelte_component_let_snippet_is_still_demoted_to_a_prop() {
    // Official demotes a `{#snippet}` child to a component prop even when `let:`
    // is present — the two transformations are independent and both apply (#2171).
    let code = convert(
        "<script>\n let C;\n</script>\n<svelte:component this={C} let:item>\n{#snippet foo(a)}<p>{a}</p>{/snippet}\n{item}\n</svelte:component>\n",
    );
    assert!(
        code.contains("const {foo} = $$_tnenopmoc_etlevs0.$$prop_def;"),
        "the let: path must still demote snippets, got:\n{code}"
    );
    assert!(
        code.contains("$$_tnenopmoc_etlevs0.$$slot_def.default;"),
        "the let: destructure must still be emitted, got:\n{code}"
    );
}

#[test]
fn svelte_component_named_slot_children_still_demote_snippets() {
    // A snippet sibling of a named-slot child is still demoted to a prop; the
    // named-slot child keeps its own `$$slot_def["x"]` block independently (#2171).
    let code = convert(
        "<script>\n let C;\n</script>\n<svelte:component this={C}>\n<div slot=\"x\" let:item>{item}</div>\n{#snippet foo(a)}<p>{a}</p>{/snippet}\n</svelte:component>\n",
    );
    assert!(
        code.contains("const {foo} = $$_tnenopmoc_etlevs0.$$prop_def;"),
        "the named-slot path must still demote snippets, got:\n{code}"
    );
    assert!(
        code.contains("$$_tnenopmoc_etlevs0.$$slot_def[\"x\"];"),
        "the named-slot destructure must still be emitted, got:\n{code}"
    );
}
