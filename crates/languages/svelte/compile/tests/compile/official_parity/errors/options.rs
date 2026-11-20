//! Upstream's checks of `<svelte:options>` and of the attributes and children of the global
//! elements.

use super::directives::assert_outcomes;

#[test]
fn svelte_options_raises_upstreams_errors_before_its_children() {
    assert_outcomes(&[
        ("<svelte:options css=\"injected\" />", None),
        ("<svelte:options namespace=\"svg\" />", None),
        (
            "<svelte:options preserveWhitespace=\"true\"> </svelte:options>",
            Some(("svelte_options_invalid_attribute_value", (16, 41))),
        ),
        (
            "<svelte:options css />",
            Some(("svelte_options_invalid_attribute_value", (16, 19))),
        ),
        (
            "<svelte:options namespace=\"http://www.w3.org/1999/xhtml\" />",
            Some(("svelte_options_invalid_attribute_value", (16, 56))),
        ),
        (
            "<svelte:options runes={1} />",
            Some(("svelte_options_invalid_attribute_value", (16, 25))),
        ),
        (
            "<svelte:options foo />",
            Some(("svelte_options_unknown_attribute", (16, 19))),
        ),
        (
            "<svelte:options tag=\"a-b\" />",
            Some(("svelte_options_deprecated_tag", (16, 25))),
        ),
        (
            "<svelte:options on:click={f} />",
            Some(("svelte_options_invalid_attribute", (16, 28))),
        ),
        (
            "<svelte:options runes>x{y}</svelte:options>",
            Some(("svelte_meta_invalid_content", (22, 26))),
        ),
        // The parser reads the options before the analysis meets `<svelte:window>`.
        (
            "<svelte:window>x</svelte:window><svelte:options foo />",
            Some(("svelte_options_unknown_attribute", (48, 51))),
        ),
    ]);
}

#[test]
fn a_global_element_takes_only_event_attributes() {
    assert_outcomes(&[
        ("<svelte:window onresize={f} />", None),
        (
            "<svelte:window a=\"1\" bind:foo={x} />",
            Some(("illegal_element_attribute", (15, 20))),
        ),
        (
            "<svelte:body {...a} />",
            Some(("svelte_body_illegal_attribute", (13, 19))),
        ),
        (
            "<svelte:document a />",
            Some(("illegal_element_attribute", (17, 18))),
        ),
    ]);
}

#[test]
fn the_scripts_are_analyzed_before_the_template_and_after_the_options() {
    assert_outcomes(&[
        (
            "<script>export let b;</script><svelte:body cols=\"3\" />",
            Some(("legacy_export_invalid", (8, 21))),
        ),
        (
            "<svelte:body cols=\"3\" /><script>export let b;</script>",
            Some(("legacy_export_invalid", (32, 45))),
        ),
        (
            "<script>export let b;</script><svelte:options foo />",
            Some(("svelte_options_unknown_attribute", (46, 49))),
        ),
    ]);
}
