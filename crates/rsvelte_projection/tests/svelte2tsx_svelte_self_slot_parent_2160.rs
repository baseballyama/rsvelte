//! Regression tests for #2160: `<svelte:self>` is an `InlineComponent` in
//! official svelte2tsx, so its children are slot consumers of THAT node —
//! named `slot=` children get a `$$slot_def["…"]` wrapper and default-slot
//! `let:` receivers get a `$$slot_def.default` destructure, both keyed on the
//! `$$_svelteselfN` instance. rsvelte performed no slot lowering at all there,
//! leaving `slot=` / `let:` as bogus props (`"slot":`a`,` / `"let:x":true,`)
//! and never declaring the instance const.
//!
//! Every expectation below is the byte-exact template body official svelte2tsx
//! (language-tools, parsing with svelte 5.56.8) emits for the same input.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn convert(src: &str) -> String {
    let opts = Svelte2TsxOptions {
        filename: "Input.svelte".to_string(),
        is_ts_file: false,
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

/// A default-slot `let:` receiver destructures from `<svelte:self>`'s own
/// `$$slot_def.default`, which forces the `const $$_svelteself0 = …` form.
#[test]
fn default_slot_let_child_forwards() {
    let code = convert("<svelte:self>\n\t<div let:x>{x}</div>\n</svelte:self>\n");
    assert_contains(
        &code,
        "{ const $$_svelteself0 = __sveltets_2_createComponentAny({children:() => { return __sveltets_2_any(0); },});",
    );
    assert_contains(
        &code,
        "\n\t {const {/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,x,} = $$_svelteself0.$$slot_def.default;$$_$$;{ svelteHTML.createElement(\"div\", { });x; }}\n",
    );
}

/// `<svelte:fragment let:x>` is an `Element` upstream, so it forwards the same way.
#[test]
fn default_slot_let_fragment_child_forwards() {
    let code =
        convert("<svelte:self>\n\t<svelte:fragment let:x>{x}</svelte:fragment>\n</svelte:self>\n");
    assert_contains(
        &code,
        "\n\t {const {/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,x,} = $$_svelteself0.$$slot_def.default;$$_$$;{ svelteHTML.createElement(\"svelte:fragment\", { });x; }}\n",
    );
}

/// A static `slot="a"` child is wrapped in `$$slot_def["a"]` and loses the
/// `slot` prop (which the wrapper consumed).
#[test]
fn named_slot_element_child_is_wrapped() {
    let code = convert("<svelte:self>\n\t<div slot=\"a\">hi</div>\n</svelte:self>\n");
    assert_contains(
        &code,
        "{ const $$_svelteself0 = __sveltets_2_createComponentAny({});",
    );
    assert_contains(
        &code,
        "\n\t {const {/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,} = $$_svelteself0.$$slot_def[\"a\"];$$_$$;{ svelteHTML.createElement(\"div\", { });  }}\n",
    );
    assert!(
        !code.contains("\"slot\":`a`"),
        "slot= must not stay a prop:\n{code}"
    );
}

/// Component-kind named-slot children (`<Child slot="a">`, `<svelte:self
/// slot="a">`) route through the same `$$slot_def["…"]` lowering.
#[test]
fn named_slot_component_children_are_wrapped() {
    let code = convert("<svelte:self>\n\t<Child slot=\"a\" />\n</svelte:self>\n");
    assert_contains(
        &code,
        "\n\t {const {/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,} = $$_svelteself0.$$slot_def[\"a\"];$$_$$;{ const $$_dlihC1C = __sveltets_2_ensureComponent(Child); new $$_dlihC1C({ target: __sveltets_2_any(), props: {  }});}}\n",
    );

    let nested = convert("<svelte:self>\n\t<svelte:self slot=\"a\" />\n</svelte:self>\n");
    assert_contains(
        &nested,
        "\n\t {const {/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,} = $$_svelteself0.$$slot_def[\"a\"];$$_$$;{ __sveltets_2_createComponentAny({  });}}\n",
    );
}

/// A named-slot child that also carries `let:` folds both into one wrapper,
/// while a sibling default-slot `let:` receiver keeps the `.default` key.
#[test]
fn named_and_default_slot_siblings() {
    let code = convert(
        "<svelte:self>\n\t<div slot=\"a\" let:x>{x}</div>\n\t<span let:y>{y}</span>\n</svelte:self>\n",
    );
    assert_contains(
        &code,
        "\n\t {const {/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,x,} = $$_svelteself0.$$slot_def[\"a\"];$$_$$;{ svelteHTML.createElement(\"div\", {  });x; }}\n",
    );
    assert_contains(
        &code,
        "\n\t {const {/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,y,} = $$_svelteself0.$$slot_def.default;$$_$$;{ svelteHTML.createElement(\"span\", { });y; }}\n",
    );
}

/// Control-flow blocks are transparent to the slot scope, so a block-nested
/// child still forwards.
#[test]
fn block_nested_children_forward() {
    let named = convert(
        "<svelte:self>\n\t{#if c}\n\t\t<div slot=\"a\">hi</div>\n\t{/if}\n</svelte:self>\n",
    );
    assert_contains(
        &named,
        "\n\t\t {const {/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,} = $$_svelteself0.$$slot_def[\"a\"];$$_$$;{ svelteHTML.createElement(\"div\", { });  }}\n",
    );

    let lets = convert(
        "<svelte:self>\n\t{#each items as item}\n\t\t<div let:x>{x}</div>\n\t{/each}\n</svelte:self>\n",
    );
    assert_contains(
        &lets,
        "\n\t\t {const {/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,x,} = $$_svelteself0.$$slot_def.default;$$_$$;{ svelteHTML.createElement(\"div\", { });x; }}\n",
    );
}

/// `<svelte:self>`'s OWN `let:` opens one `$$slot_def.default` block around
/// every child, and a named-slot child nests its own wrapper inside it — so
/// the closing tag emits both `}`s.
#[test]
fn own_let_wraps_named_slot_child() {
    let code = convert("<svelte:self let:z>\n\t{z}\n\t<div slot=\"a\">hi</div>\n</svelte:self>\n");
    assert_contains(
        &code,
        "{ const $$_svelteself0 = __sveltets_2_createComponentAny({ children:() => { return __sveltets_2_any(0); },});{const {/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,z,} = $$_svelteself0.$$slot_def.default;$$_$$;\n",
    );
    assert_contains(
        &code,
        "\n\t {const {/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,} = $$_svelteself0.$$slot_def[\"a\"];$$_$$;{ svelteHTML.createElement(\"div\", { });  }}\n }}\n",
    );
}

/// A `<svelte:self slot="a">` that is itself a slot parent keeps both
/// levels: the enclosing component's `$$slot_def["a"]` and its own
/// `$$slot_def["b"]`, keyed on the depth-numbered instance.
#[test]
fn svelte_self_is_both_slot_child_and_slot_parent() {
    let code = convert(
        "<Foo>\n\t<svelte:self slot=\"a\">\n\t\t<div slot=\"b\">hi</div>\n\t</svelte:self>\n</Foo>\n",
    );
    assert_contains(
        &code,
        "\n\t {const {/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,} = $$_ooF0.$$slot_def[\"a\"];$$_$$;{ const $$_svelteself1 = __sveltets_2_createComponentAny({ });\n",
    );
    assert_contains(
        &code,
        "\n\t\t {const {/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,} = $$_svelteself1.$$slot_def[\"b\"];$$_$$;{ svelteHTML.createElement(\"div\", { });  }}\n\t }}\n",
    );
}

/// Two named slots each get their own wrapper.
#[test]
fn two_named_slot_children() {
    let code = convert(
        "<svelte:self>\n\t<div slot=\"a\">A</div>\n\t<div slot=\"b\">B</div>\n</svelte:self>\n",
    );
    assert_contains(&code, "= $$_svelteself0.$$slot_def[\"a\"];");
    assert_contains(&code, "= $$_svelteself0.$$slot_def[\"b\"];");
}

/// Plain children still get no instance const and no slot block — the
/// lowering must stay opt-in.
#[test]
fn plain_children_get_no_slot_block() {
    let code = convert("<svelte:self>\n\thello\n</svelte:self>\n");
    assert_contains(
        &code,
        "{ __sveltets_2_createComponentAny({children:() => { return __sveltets_2_any(0); },});",
    );
    assert!(
        !code.contains("$$slot_def"),
        "unexpected slot block:\n{code}"
    );
}
