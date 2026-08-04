//! Regression test for issue #2166.
//!
//! Official svelte2tsx's instance-script walk (`processInstanceScriptContent.ts`)
//! is fully recursive, so `is$$SlotsDeclaration` / `is$$EventsDeclaration` /
//! `is$$PropsDeclaration` fire on a `$$Slots` / `$$Events` / `$$Props`
//! interface or type alias at any nesting depth. rsvelte's Pass 1 loop only
//! visited top-level statements, so a declaration nested inside a function
//! body was missed and the corresponding flag never set.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn code_of(src: &str, is_ts_file: bool) -> String {
    let opts = Svelte2TsxOptions {
        filename: "Input.svelte".to_string(),
        is_ts_file,
        ..Default::default()
    };
    svelte2tsx(src, opts).expect("svelte2tsx").code
}

#[test]
fn a_slots_interface_declared_inside_a_function_is_still_detected() {
    // Official walks the whole instance script, not just its top level, so a
    // nested `interface $$Slots` still replaces the computed slots shape.
    let code = code_of(
        concat!(
            "<script lang=\"ts\">\n",
            "  function setup() {\n",
            "    interface $$Slots {\n",
            "      default: {};\n",
            "    }\n",
            "  }\n",
            "</script>\n",
            "\n<slot name=\"named\" />\n",
        ),
        true,
    );

    assert!(
        code.contains("{} as unknown as $$Slots"),
        "expected the nested $$Slots interface to be detected, got: {code}"
    );
}

#[test]
fn an_events_type_alias_declared_inside_a_function_is_still_detected() {
    // A nested `type $$Events` must still suppress the computed `events:` value
    // in favor of the user's own type, same as a top-level declaration would.
    let code = code_of(
        concat!(
            "<script lang=\"ts\">\n",
            "  function setup() {\n",
            "    type $$Events = {\n",
            "      hi: CustomEvent<boolean>;\n",
            "    };\n",
            "  }\n",
            "</script>\n",
        ),
        true,
    );

    assert!(
        code.contains("$$Events"),
        "expected the nested $$Events type alias to be detected, got: {code}"
    );
}

#[test]
fn a_props_interface_declared_inside_a_function_is_still_detected() {
    // `uses_dollar_props_type` gates whether an untyped `$$props`/`$$restProps`
    // usage widens the props type — a nested `$$Props` must suppress that too.
    let with_nested_props = code_of(
        concat!(
            "<script lang=\"ts\">\n",
            "  function setup() {\n",
            "    interface $$Props {\n",
            "      name: string;\n",
            "    }\n",
            "  }\n",
            "  console.log($$props);\n",
            "</script>\n",
        ),
        true,
    );
    let without_props_type = code_of(
        concat!(
            "<script lang=\"ts\">\n",
            "  console.log($$props);\n",
            "</script>\n",
        ),
        true,
    );

    assert_ne!(
        with_nested_props, without_props_type,
        "expected the nested $$Props interface to change how $$props is typed"
    );
}
