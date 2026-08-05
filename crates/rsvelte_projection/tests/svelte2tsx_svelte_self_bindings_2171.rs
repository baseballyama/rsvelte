//! `<svelte:self>` is an inline component upstream, so its `bind:` directives
//! and `{#snippet}` children must be transformed exactly like a named
//! component's: two-way bindings become plain props plus a `$$bindings` marker,
//! `bind:this` assigns the instance, and direct snippet children are demoted to
//! props anchored by a `$$prop_def` destructure.

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
fn svelte_self_two_way_binding_emits_bindings_marker() {
    let code = convert("<script>\n let x;\n</script>\n<svelte:self bind:value={x} />\n");
    assert!(
        !code.contains("\"bind:value\""),
        "binding must not use the DOM element form, got:\n{code}"
    );
    assert!(
        code.contains("value:x,"),
        "expected the binding as a plain component prop, got:\n{code}"
    );
    assert!(
        code.contains("() => x = __sveltets_2_any(null);"),
        "expected the setter type-widener, got:\n{code}"
    );
    assert!(
        code.contains("$$_svelteself0.$$bindings = 'value';"),
        "expected the $$bindings marker, got:\n{code}"
    );
}

#[test]
fn svelte_self_bind_this_assigns_the_instance() {
    let code = convert("<script>\n let el;\n</script>\n<svelte:self bind:this={el} />\n");
    assert!(
        !code.contains("\"bind:this\"") && !code.contains("this:el"),
        "bind:this must not become a prop, got:\n{code}"
    );
    assert!(
        code.contains("el = $$_svelteself0;"),
        "expected the instance assignment, got:\n{code}"
    );
}

#[test]
fn svelte_self_shorthand_binding_keeps_the_marker() {
    let code = convert("<script>\n let value;\n</script>\n<svelte:self bind:value />\n");
    assert!(
        code.contains("$$_svelteself0.$$bindings = 'value';"),
        "expected the $$bindings marker for the shorthand form, got:\n{code}"
    );
}

#[test]
fn svelte_self_snippet_children_become_props() {
    let code = convert("<svelte:self>\n{#snippet foo(a)}<p>{a}</p>{/snippet}\n</svelte:self>\n");
    assert!(
        code.contains("const {foo} = $$_svelteself0.$$prop_def;"),
        "expected the snippet to be demoted to a prop, got:\n{code}"
    );
}

#[test]
fn svelte_self_let_snippet_is_still_demoted_to_a_prop() {
    // Official demotes a `{#snippet}` child to a component prop even when `let:`
    // is present — the two transformations are independent and both apply (#2171).
    let code = convert(
        "<svelte:self let:item>\n{#snippet foo(a)}<p>{a}</p>{/snippet}\n{item}\n</svelte:self>\n",
    );
    assert!(
        code.contains("const {foo} = $$_svelteself0.$$prop_def;"),
        "the let: path must still demote snippets, got:\n{code}"
    );
    assert!(
        code.contains("$$_svelteself0.$$slot_def.default;"),
        "the let: destructure must still be emitted, got:\n{code}"
    );
}

#[test]
fn named_component_let_snippet_is_demoted_to_a_prop() {
    // Not a `<svelte:self>`-only gap: any inline component's `{#snippet}` child
    // is demoted to a prop even with `let:` present, mirroring official (#2171).
    let code = convert("<Foo let:item>\n{#snippet foo(a)}<p>{a}</p>{/snippet}\n{item}\n</Foo>\n");
    assert!(
        code.contains("const {foo} = $$_ooF0.$$prop_def;"),
        "the let: path must still demote snippets, got:\n{code}"
    );
    assert!(
        code.contains("$$_ooF0.$$slot_def.default;"),
        "the let: destructure must still be emitted, got:\n{code}"
    );
}
