//! Regression tests for #2103: `<svelte:component>` children must take the same
//! slot lowering as a named component's — `handle_svelte_component` used to walk
//! them with `process_fragment_inplace`, so a default-slot `let:` receiver
//! (`<div let:x>` / `<svelte:fragment let:x>`) got no `$$slot_def.default`
//! destructuring prologue and `x` resolved as an undeclared identifier.
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

/// The issue's repro: a `<div let:x>` default-slot child destructures from the
/// `<svelte:component>` instance's `$$slot_def.default`.
#[test]
fn default_slot_let_element_child_forwards() {
    let code = convert("<svelte:component this={Foo}><div let:x>{x}</div></svelte:component>\n");
    assert_contains(
        &code,
        "const $$_tnenopmoc_etlevs0 = new $$_tnenopmoc_etlevs0C({ target: __sveltets_2_any(), props: { children:() => { return __sveltets_2_any(0); },}}); {const {/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,x,} = $$_tnenopmoc_etlevs0.$$slot_def.default;$$_$$;{ svelteHTML.createElement(\"div\", { });x; }} }",
    );
}

/// Same for the `<svelte:fragment let:x>` idiom, including the leading gap the
/// block-open steals from the wrapped node's own indent.
#[test]
fn default_slot_let_fragment_child_forwards() {
    let code = convert(
        "<svelte:component this={Foo}>\n\t<svelte:fragment let:x>{x}</svelte:fragment>\n</svelte:component>\n",
    );
    assert_contains(
        &code,
        "\n\t {const {/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,x,} = $$_tnenopmoc_etlevs0.$$slot_def.default;$$_$$;{ svelteHTML.createElement(\"svelte:fragment\", { });x; }}\n }",
    );
}

/// The component's OWN `let:` block (emitted with the opener) and a child's
/// forwarded block nest, and both close before the component block.
#[test]
fn component_let_and_child_let_nest() {
    let code = convert(
        "<svelte:component this={Foo} let:y>\n\t<div let:x>{x}{y}</div>\n</svelte:component>\n",
    );
    assert_contains(
        &code,
        "}});{const {/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,y,} = $$_tnenopmoc_etlevs0.$$slot_def.default;$$_$$;\n\t {const {/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,x,} = $$_tnenopmoc_etlevs0.$$slot_def.default;$$_$$;{ svelteHTML.createElement(\"div\", { });x;y; }}\n }}",
    );
}

/// A `<svelte:fragment slot="a" let:x>` child now gets its `$$slot_def["a"]`
/// wrapper (previously it kept a plain `"slot":`a`,` attribute instead).
#[test]
fn named_slot_fragment_child_is_wrapped() {
    let code = convert(
        "<svelte:component this={Foo}>\n\t<svelte:fragment slot=\"a\" let:x>{x}</svelte:fragment>\n</svelte:component>\n",
    );
    assert_contains(
        &code,
        "\n\t {const {/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,x,} = $$_tnenopmoc_etlevs0.$$slot_def[\"a\"];$$_$$;{ svelteHTML.createElement(\"svelte:fragment\", {  });x; }}\n }",
    );
}

/// Named-slot and default-slot siblings each get their own block.
#[test]
fn named_and_default_slot_siblings() {
    let code = convert(
        "<svelte:component this={Foo}>\n\t<div slot=\"a\" let:x>{x}</div>\n\t<span let:y>{y}</span>\n</svelte:component>\n",
    );
    assert_contains(
        &code,
        "\n\t {const {/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,x,} = $$_tnenopmoc_etlevs0.$$slot_def[\"a\"];$$_$$;{ svelteHTML.createElement(\"div\", {  });x; }}\n\t {const {/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,y,} = $$_tnenopmoc_etlevs0.$$slot_def.default;$$_$$;{ svelteHTML.createElement(\"span\", { });y; }}\n }",
    );
}

/// A COMPONENT child's `let:` still binds from its OWN slot def (the #1232
/// rule): routing `<svelte:component>` children through the slot path must not
/// re-forward them onto the dynamic component's instance.
#[test]
fn component_child_let_still_binds_from_its_own_slot_def() {
    let code =
        convert("<svelte:component this={Foo}>\n\t<Bar let:x>{x}</Bar>\n</svelte:component>\n");
    assert_contains(&code, "$$_raB1.$$slot_def.default");
    assert!(
        !code.contains("$$_tnenopmoc_etlevs0.$$slot_def"),
        "the dynamic component must not carry Bar's let: bindings, got:\n{code}"
    );
}

/// Plain default-slot children keep the untouched walk — no spurious block.
#[test]
fn plain_children_get_no_slot_block() {
    let code = convert("<svelte:component this={Foo}>\n\t<div>hello</div>\n</svelte:component>\n");
    assert!(
        !code.contains("$$slot_def"),
        "children without let:/slot= must not open a slot block, got:\n{code}"
    );
}
