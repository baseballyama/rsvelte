//! `rsvelte typecheck` of a text `slot` attribute, which svelte2tsx reads as the slot an element
//! fills when its parent element is a component, and as a property otherwise.

use crate::typecheck_events::check;

/// A parent component, a leaf, and each place a leaf with `slot` can be.
const PLACES: &[(&str, &str)] = &[
    (
        "src/Parent.svelte",
        "<script lang=\"ts\">\n\
        \tlet { value }: { value: number } = $props();\n\
        </script>\n\
        <slot name=\"item\" item={value} />\n\
        <slot />\n",
    ),
    (
        "src/Leaf.svelte",
        "<script lang=\"ts\">\n\
        \tlet { label }: { label: string } = $props();\n\
        </script>\n\
        <p>{label}</p>\n",
    ),
    (
        "src/App.svelte",
        "<script lang=\"ts\">\n\
        \timport Parent from './Parent.svelte';\n\
        \timport Leaf from './Leaf.svelte';\n\
        </script>\n\
        <Parent value={1}><Leaf slot=\"item\" label=\"x\" /></Parent>\n\
        <Parent value={1}><Leaf slot=\"item\" let:item label={String(item)} /></Parent>\n\
        <Leaf slot=\"item\" label=\"x\" />\n\
        <Parent value={1}>{#if true}<Leaf slot=\"item\" label=\"x\" />{/if}</Parent>\n\
        <Parent value={1}><div><Leaf slot=\"item\" label=\"x\" /></div></Parent>\n\
        <Parent value={1}>{#snippet s()}<Leaf slot=\"item\" label=\"x\" />{/snippet}</Parent>\n\
        <Parent value={1}><Leaf slot=\"i{1}\" label=\"x\" /></Parent>\n\
        <Parent value={1}><Parent value={2} slot=\"item\"><Leaf slot=\"item\" label=\"x\" \
        /></Parent></Parent>\n\
        <Parent value={1}>{#each [1] as n}<Leaf slot=\"item\" label={String(n)} \
        />{/each}</Parent>\n\
        <div><Leaf slot=\"item\" label=\"x\" /></div>\n\
        <Parent value={1}><Parent value={2} slot=\"item\">{#snippet u()}<Leaf slot=\"item\" \
        label=\"x\" />{/snippet}</Parent></Parent>\n\
        <Parent value={1}>{#if true}{#snippet t()}<Leaf slot=\"item\" label=\"x\" \
        />{/snippet}{/if}</Parent>\n\
        <Parent value={1}><svelte:fragment slot=\"item\"><Leaf slot=\"item\" label=\"x\" \
        /></svelte:fragment></Parent>\n",
    ),
];

/// svelte2tsx drops a text `slot` when the nearest element around it is a component, through
/// blocks and on a component as on an element. Inside a snippet, a plain element, or with an
/// expression or more than one part, `slot` stays a property. svelte-check 4.7.8 reports these
/// ten lines.
#[cfg(unix)]
#[test]
fn typecheck_passes_slot_as_a_property_only_outside_a_component() {
    let report = check(PLACES);
    assert_eq!(
        report,
        "src/App.svelte(7,7): error TS2353: Object literal may only specify known properties, \
        and '\"slot\"' does not exist in type '$$ComponentProps'.\n\
         src/App.svelte(9,30): error TS2353: Object literal may only specify known properties, \
         and '\"slot\"' does not exist in type '$$ComponentProps'.\n\
         src/App.svelte(10,29): error TS2353: Object literal may only specify known properties, \
         and 's' does not exist in type '__sveltets_2_PropsWithChildren<$$ComponentProps, { \
         item: { item: number; }; default: {}; }>'.\n\
         src/App.svelte(10,39): error TS2353: Object literal may only specify known properties, \
         and '\"slot\"' does not exist in type '$$ComponentProps'.\n\
         src/App.svelte(11,25): error TS2353: Object literal may only specify known properties, \
         and '\"slot\"' does not exist in type '$$ComponentProps'.\n\
         src/App.svelte(14,12): error TS2353: Object literal may only specify known properties, \
         and '\"slot\"' does not exist in type '$$ComponentProps'.\n\
         src/App.svelte(15,59): error TS2353: Object literal may only specify known properties, \
         and 'u' does not exist in type '__sveltets_2_PropsWithChildren<$$ComponentProps, { \
         item: { item: number; }; default: {}; }>'.\n\
         src/App.svelte(15,69): error TS2353: Object literal may only specify known properties, \
         and '\"slot\"' does not exist in type '$$ComponentProps'.\n\
         src/App.svelte(16,49): error TS2353: Object literal may only specify known properties, \
         and '\"slot\"' does not exist in type '$$ComponentProps'.\n\
         src/App.svelte(17,54): error TS2353: Object literal may only specify known properties, \
         and '\"slot\"' does not exist in type '$$ComponentProps'.\n\
         \nFound 10 errors in 1 file.\n",
    );
}
