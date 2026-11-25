//! `rsvelte typecheck` of a component's slots, as svelte2tsx types them for `let:`.

use crate::typecheck::Native;
use crate::typecheck_events::check;

/// A generic component's slot props are of the generics its props infer, as a component's
/// without generics are. svelte-check 4.7.8 reports these four lines.
#[test]
fn typecheck_types_the_slot_props_of_a_generic_component() {
    let slot = |generics: &str, value: &str| {
        format!(
            "<script lang=\"ts\"{generics}>\n\tlet {{ value }}: {{ value: {value} }} = \
             $props();\n</script>\n<slot item={{value}} />\n"
        )
    };
    let generic = slot(" generics=\"T\"", "T");
    let plain = slot("", "number");
    let app = "<script lang=\"ts\">\n\timport GenericSlot from './GenericSlot.svelte';\n\
        \timport PlainSlot from './PlainSlot.svelte';\n</script>\n\
        <GenericSlot value={1} let:item>{item.foo}</GenericSlot>\n\
        <GenericSlot value=\"x\" let:item>{item.toFixed()}</GenericSlot>\n\
        <GenericSlot value={1} let:other>{other}</GenericSlot>\n\
        <PlainSlot value={1} let:item>{item.foo}</PlainSlot>\n";
    let report = check(&[
        ("src/GenericSlot.svelte", &generic),
        ("src/PlainSlot.svelte", &plain),
        ("src/App.svelte", app),
    ]);
    assert_eq!(
        report,
        "src/App.svelte(5,39): error TS2339: Property 'foo' does not exist on type 'number'.\n\
         src/App.svelte(6,39): error TS2551: Property 'toFixed' does not exist on type 'string'. \
         Did you mean 'fixed'?\n\
         src/App.svelte(7,28): error TS2339: Property 'other' does not exist on type '{ item: \
         number; }'.\n\
         src/App.svelte(8,37): error TS2339: Property 'foo' does not exist on type 'number'.\n\
         \nFound 4 errors in 1 file.\n"
            .native()
    );
}
