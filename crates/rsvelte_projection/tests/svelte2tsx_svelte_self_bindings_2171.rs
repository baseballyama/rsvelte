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
fn svelte_self_slot_lets_keep_the_slot_path() {
    // `let:` scoping owns the children, so snippets stay plain block children.
    let code = convert(
        "<svelte:self let:item>\n{#snippet foo(a)}<p>{a}</p>{/snippet}\n{item}\n</svelte:self>\n",
    );
    assert!(
        !code.contains("$$prop_def"),
        "the let: path must not demote snippets, got:\n{code}"
    );
}
