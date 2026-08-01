//! Regression tests for #2105: a component's default-slot `let:` forwarding is
//! driven by *which node kinds official svelte2tsx models as an `Element`* and
//! by the fact that control-flow blocks never push its element stack. rsvelte
//! only wrapped a direct `RegularElement` / `<svelte:fragment>` child, so
//! `<svelte:element>` / `<slot>` / block-nested elements silently dropped their
//! `let:` (emitting a bogus `"let:x": true` attribute instead), and a
//! `<style let:x>` produced an orphaned `$$slot_def` block.
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

/// `<svelte:element>` is an `Element` in official svelte2tsx, so its `let:`
/// destructures from the enclosing component's `$$slot_def.default`.
#[test]
fn svelte_element_child_forwards() {
    let code = convert("<Foo>\n\t<svelte:element this={tag} let:x>{x}</svelte:element>\n</Foo>\n");
    assert_contains(
        &code,
        "\n\t {const {/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,x,} = $$_ooF0.$$slot_def.default;$$_$$;{ svelteHTML.createElement(tag, {  });x; }}\n",
    );
}

/// So is `<slot>` — which additionally keeps the stripped `let:`'s gap inside
/// its (otherwise empty) props object.
#[test]
fn slot_element_child_forwards() {
    let code = convert("<Foo>\n\t<slot let:x>{x}</slot>\n</Foo>\n");
    assert_contains(
        &code,
        "\n\t {const {/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,x,} = $$_ooF0.$$slot_def.default;$$_$$;{ __sveltets_createSlot(\"default\", { });x; }}\n",
    );
}

/// Control-flow blocks are transparent to the slot scope (official never pushes
/// its `element` stack for them), so an `{#each}`-wrapped element still forwards
/// — and the component still needs the `const $$_inst = new …` form.
#[test]
fn each_wrapped_element_forwards() {
    let code =
        convert("<Foo>\n\t{#each items as item}\n\t\t<div let:x>{x}</div>\n\t{/each}\n</Foo>\n");
    assert_contains(&code, "const $$_ooF0 = new $$_ooF0C(");
    assert_contains(
        &code,
        "\n\t\t {const {/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,x,} = $$_ooF0.$$slot_def.default;$$_$$;{ svelteHTML.createElement(\"div\", { });x; }}\n",
    );
}

/// Both arms of an `{#if}` are in the same slot scope.
#[test]
fn if_else_wrapped_elements_forward() {
    let code = convert(
        "<Foo>\n\t{#if c}\n\t\t<div let:x>{x}</div>\n\t{:else}\n\t\t<span let:y>{y}</span>\n\t{/if}\n</Foo>\n",
    );
    assert_contains(
        &code,
        "\n\t\t {const {/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,x,} = $$_ooF0.$$slot_def.default;$$_$$;{ svelteHTML.createElement(\"div\", { });x; }}\n",
    );
    assert_contains(
        &code,
        "\n\t\t {const {/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,y,} = $$_ooF0.$$slot_def.default;$$_$$;{ svelteHTML.createElement(\"span\", { });y; }}\n",
    );
}

/// Nesting blocks does not end the scope either.
#[test]
fn nested_blocks_forward() {
    let code = convert(
        "<Foo>\n\t{#each a as b}\n\t\t{#key k}\n\t\t\t<svelte:element this={tag} let:x>{x}</svelte:element>\n\t\t{/key}\n\t{/each}\n</Foo>\n",
    );
    assert_contains(
        &code,
        "\n\t\t\t {const {/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,x,} = $$_ooF0.$$slot_def.default;$$_$$;{ svelteHTML.createElement(tag, {  });x; }}\n",
    );
}

/// A `<svelte:component>` parent shares the same lowering (#2103).
#[test]
fn svelte_component_each_wrapped_forwards() {
    let code = convert(
        "<svelte:component this={Foo}>\n\t{#each a as b}\n\t\t<div let:x>{x}</div>\n\t{/each}\n</svelte:component>\n",
    );
    assert_contains(
        &code,
        "const $$_tnenopmoc_etlevs0 = new $$_tnenopmoc_etlevs0C(",
    );
    assert_contains(
        &code,
        "\n\t\t {const {/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,x,} = $$_tnenopmoc_etlevs0.$$slot_def.default;$$_$$;{ svelteHTML.createElement(\"div\", { });x; }}\n",
    );
}

/// `<style>` is deleted wholesale by official's `handleStyleTag`, which also
/// wipes the `$$slot_def` block its `let:` produced — only the instance const
/// (a side effect of naming the component) survives.
#[test]
fn style_child_gets_no_block() {
    let code = convert("<Foo>\n\t<style let:x></style>\n</Foo>\n");
    assert_contains(&code, "const $$_ooF0 = new $$_ooF0C(");
    assert!(
        !code.contains("$$slot_def"),
        "a `<style let:x>` must leave no orphaned slot block, got:\n{code}"
    );
}

/// …and it must not consume the *next* sibling's leading gap on its way out.
#[test]
fn style_child_does_not_steal_sibling_gap() {
    let code = convert("<Foo>\n\t<style let:x></style>\n\t<div let:y>{y}</div>\n</Foo>\n");
    assert_contains(
        &code,
        "\n\t\n\t {const {/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,y,} = $$_ooF0.$$slot_def.default;$$_$$;{ svelteHTML.createElement(\"div\", { });y; }}\n",
    );
}

/// A `{#snippet}` body is NOT in the component's slot scope (official resets
/// `element` to `undefined` there), so its `let:` stays a plain attribute.
#[test]
fn snippet_body_is_not_forwarded() {
    let code =
        convert("<Foo let:z>\n\t{#snippet s()}\n\t\t<div let:y>{y}</div>\n\t{/snippet}\n</Foo>\n");
    assert_contains(
        &code,
        "{ svelteHTML.createElement(\"div\", {\"let:y\":true,});y; }",
    );
}

/// An element inside another element owns its own slot scope, so only the outer
/// one forwards.
#[test]
fn nested_element_owns_its_scope() {
    let code = convert(
        "<Foo>\n\t<svelte:fragment let:x>\n\t\t<div let:y>{x}{y}</div>\n\t</svelte:fragment>\n</Foo>\n",
    );
    assert_contains(
        &code,
        "\n\t {const {/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,x,} = $$_ooF0.$$slot_def.default;$$_$$;{ svelteHTML.createElement(\"svelte:fragment\", { });\n\t\t { svelteHTML.createElement(\"div\", {\"let:y\":true,});x;y; }\n\t }}\n",
    );
}

/// `<svelte:boundary>` is an `Element` too.
#[test]
fn boundary_child_forwards() {
    let code = convert("<Foo>\n\t<svelte:boundary let:x>{x}</svelte:boundary>\n</Foo>\n");
    assert_contains(
        &code,
        "\n\t {const {/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,x,} = $$_ooF0.$$slot_def.default;$$_$$;{ svelteHTML.createElement(\"svelte:boundary\", { });x; }}\n",
    );
}

/// A static `slot=` retargets the destructure at the NAMED slot (official's
/// `addSlotName` replaces the `default` key) and is dropped from the props.
#[test]
fn block_nested_named_slot_keys_the_block() {
    let code = convert(
        "<Foo>\n\t{#each a as b}\n\t\t<svelte:fragment slot=\"s\" let:x>{x}</svelte:fragment>\n\t{/each}\n</Foo>\n",
    );
    assert_contains(
        &code,
        "\n\t\t {const {/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,x,} = $$_ooF0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"svelte:fragment\", {  });x; }}\n",
    );
}

/// A `let:` outside any component stays a deprecated plain attribute.
#[test]
fn let_outside_a_component_stays_an_attribute() {
    let code = convert("<div let:x>{x}</div>\n");
    assert_contains(
        &code,
        "{ svelteHTML.createElement(\"div\", {\"let:x\":true,});",
    );
    assert!(!code.contains("$$slot_def"), "got:\n{code}");
}
