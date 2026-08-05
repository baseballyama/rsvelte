use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn convert(src: &str) -> String {
    let opts = Svelte2TsxOptions {
        filename: "Input.svelte".to_string(),
        is_ts_file: false,
        ..Default::default()
    };
    svelte2tsx(src, opts).expect("svelte2tsx ok").code
}

fn assert_contains(src: &str, expected: &str) {
    let code = convert(src);
    assert!(
        code.contains(expected),
        "source {src:?}\nexpected fragment:\n{expected}\nactual:\n{code}"
    );
}

/// `legacy.js` strips the snippet body's surrounding whitespace nodes, so
/// `{#snippet foo()}  text  {/snippet}` keeps a single space around the body.
#[test]
fn snippet_body_surrounding_whitespace_is_removed() {
    assert_contains(
        "{#snippet foo(bar)}  text  {/snippet}\n",
        "=> { async ()/*\u{03A9}ignore_position\u{03A9}*/ => { };return __sveltets_2_any(0)};",
    );
    assert_contains(
        "{#snippet foo()}\n{/snippet}\n",
        "=> { async ()/*\u{03A9}ignore_position\u{03A9}*/ => {\n};return __sveltets_2_any(0)};",
    );
}

/// Upstream's `transform()` leaves one space in front of the moved name and a
/// second one only when something else remains before `}`.
#[test]
fn snippet_opener_gap_matches_upstream() {
    assert_contains("{#snippet foo(bar)}  text  {/snippet}\n", "=> { const foo");
    assert_contains("{#snippet foo()}  text  {/snippet}\n", "=> {  const foo");
    assert_contains("{#snippet foo() }  text  {/snippet}\n", "=> {  const foo");
    assert_contains("{#snippet foo(bar) }\n{/snippet}\n", "=> {  const foo");
}

#[test]
fn boundary_with_slot_attribute_uses_slot_def() {
    assert_contains(
        "<Comp>\n<svelte:boundary slot=\"a\">hi</svelte:boundary>\n</Comp>\n",
        "const $$_pmoC0 = new $$_pmoC0C({ target: __sveltets_2_any(), props: {children:() => { return __sveltets_2_any(0); },}});\n {const {/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,} = $$_pmoC0.$$slot_def[\"a\"];$$_$$;{ svelteHTML.createElement(\"svelte:boundary\", { });  }}\n Comp}",
    );
    assert_contains(
        "<Comp>\n<svelte:boundary slot=\"a\" let:x>hi</svelte:boundary>\n</Comp>\n",
        "{const {/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,x,} = $$_pmoC0.$$slot_def[\"a\"];$$_$$;{ svelteHTML.createElement(\"svelte:boundary\", {  });  }}",
    );
}

/// Without a static `slot=` the boundary stays a plain element — no instance
/// binding, no wrapper.
#[test]
fn boundary_without_slot_attribute_is_unchanged() {
    assert_contains(
        "<Comp>\n<svelte:boundary>hi</svelte:boundary>\n</Comp>\n",
        "new $$_pmoC0C({ target: __sveltets_2_any(), props: {children:() => { return __sveltets_2_any(0); },}});\n { svelteHTML.createElement(\"svelte:boundary\", {});  }\n Comp}",
    );
}
