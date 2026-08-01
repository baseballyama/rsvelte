//! Regression tests for #2136: `has_named_slot_children` (and the parallel
//! `is_named_slot` check in `process_component_children_with_slots`) never
//! matched `SvelteComponent` (`<svelte:component>`) or `SvelteSelf`
//! (`<svelte:self>`) children, so a `<svelte:component slot="a">` /
//! `<svelte:self slot="a">` child of a component was never wrapped in the
//! parent's `$$slot_def["a"]` block — unlike official svelte2tsx, which
//! models both as `InlineComponent` and forwards them exactly like a named
//! `<Component slot="a">` child. Found while fixing #2103 (PR #2135).
//!
//! Every expectation below is the byte-exact template body official svelte2tsx
//! (language-tools, parsing with svelte 5.56.8) emits for the same input.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn convert(src: &str) -> String {
    let opts = Svelte2TsxOptions {
        filename: "Input.svelte".to_string(),
        is_ts_file: false,
        emit_jsdoc: true,
        ..Default::default()
    };
    svelte2tsx(src, opts).expect("svelte2tsx ok").code
}

fn assert_contains(code: &str, expected: &str) {
    assert!(
        code.contains(expected),
        "expected output to contain:\n{expected}\n\ngot:\n{code}"
    );
}

/// The issue's exact repro: a `<svelte:component slot="a">` child of a
/// component is wrapped in the parent's `$$slot_def["a"]` block.
#[test]
fn svelte_component_named_slot_child_is_wrapped() {
    let code = convert("<Outer><svelte:component this={Inner} slot=\"a\" /></Outer>\n");
    assert_contains(
        &code,
        "{const {/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,} = $$_retuO0.$$slot_def[\"a\"];$$_$$;{ const $$_tnenopmoc_etlevs1C = __sveltets_2_ensureComponent(Inner); new $$_tnenopmoc_etlevs1C({ target: __sveltets_2_any(), props: {   }});}} Outer}",
    );
}

/// A `<svelte:component slot="a" let:x>` child's own `let:` is destructured
/// from the PARENT's `$$slot_def["a"]` (not the dynamic component's own
/// `$$slot_def.default`), same as a named component's `let:` would be.
#[test]
fn svelte_component_named_slot_child_with_let() {
    let code = convert(
        "<Outer><svelte:component this={Inner} slot=\"a\" let:x>{x}</svelte:component></Outer>\n",
    );
    assert_contains(
        &code,
        "{const {/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,x,} = $$_retuO0.$$slot_def[\"a\"];$$_$$;{ const $$_tnenopmoc_etlevs1C = __sveltets_2_ensureComponent(Inner); new $$_tnenopmoc_etlevs1C({ target: __sveltets_2_any(), props: {   children:() => { return __sveltets_2_any(0); },}});x; }} Outer}",
    );
}

/// Same bug, `<svelte:self>` flavor: official models it as an `InlineComponent`
/// too, so it forwards through the identical lowering.
#[test]
fn svelte_self_named_slot_child_is_wrapped() {
    let code = convert(
        "<script>\n import Outer from './Outer.svelte';\n</script>\n<Outer><svelte:self slot=\"a\" /></Outer>\n",
    );
    assert_contains(
        &code,
        "{const {/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,} = $$_retuO0.$$slot_def[\"a\"];$$_$$;{ __sveltets_2_createComponentAny({  });}} Outer}",
    );
}

#[test]
fn svelte_self_named_slot_child_with_let() {
    let code = convert(
        "<script>\n import Outer from './Outer.svelte';\n</script>\n<Outer><svelte:self slot=\"a\" let:x>{x}</svelte:self></Outer>\n",
    );
    assert_contains(
        &code,
        "{const {/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,x,} = $$_retuO0.$$slot_def[\"a\"];$$_$$;{ __sveltets_2_createComponentAny({  children:() => { return __sveltets_2_any(0); },});x; }} Outer}",
    );
}

/// A `slot="a"` target nested inside a control-flow block (`{#if}`) still
/// routes to the parent's `$$slot_def["a"]`, mirroring the existing
/// `Component` self-detection path (`handle_component`'s `saved_outer_slot`
/// check) that `handle_svelte_component` now shares.
#[test]
fn svelte_component_named_slot_child_nested_in_if_block() {
    let code =
        convert("<Outer>{#if true}<svelte:component this={Inner} slot=\"a\" />{/if}</Outer>\n");
    assert_contains(
        &code,
        "if(true){ {const {/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,} = $$_retuO0.$$slot_def[\"a\"];$$_$$;{ const $$_tnenopmoc_etlevs1C = __sveltets_2_ensureComponent(Inner); new $$_tnenopmoc_etlevs1C({ target: __sveltets_2_any(), props: {   }});}}} Outer}",
    );
}

/// A `slot="a"` attribute on `<svelte:component>` OUTSIDE of a component
/// parent (official's `element.parent instanceof InlineComponent` guard) is
/// NOT slot routing — it stays a plain `"slot":` prop, same as official. This
/// guards the `drop_slot` conditional the fix threads through
/// `build_component_props_string`.
#[test]
fn svelte_component_slot_attr_outside_component_stays_a_prop() {
    let code = convert("<div><svelte:component this={Inner} slot=\"a\" /></div>\n");
    assert_contains(&code, "\"slot\":`a`,");
    assert!(
        !code.contains("$$slot_def"),
        "no enclosing component means no slot routing, got:\n{code}"
    );
}

/// Plain (non-slotted) `<svelte:component>` / `<svelte:self>` children are
/// unaffected — no spurious `$$slot_def` wrapping.
#[test]
fn plain_children_get_no_slot_block() {
    let code = convert("<Outer><svelte:component this={Inner} /></Outer>\n");
    assert!(
        !code.contains("$$slot_def"),
        "children without slot= must not open a slot block, got:\n{code}"
    );
}
