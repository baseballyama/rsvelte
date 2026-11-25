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

/// svelte2tsx's render function returns each slot's props again, a copy that maps nowhere, so
/// svelte-check reports a finding in a slot prop once, at the `<slot>`. svelte-check 4.7.8 reports
/// these four lines.
#[cfg(unix)]
#[test]
fn typecheck_reports_a_slot_prop_once() {
    let report = check(&[
        (
            "src/Named.svelte",
            "<script lang=\"ts\">\n\tlet { a }: { a: number } = $props();\n</script>\n\n\
             <slot name=\"x\" item={missing} />\n",
        ),
        (
            "src/Arithmetic.svelte",
            "<script lang=\"ts\">\n\tlet { n }: { n: number } = $props();\n</script>\n\n\
             <slot x={n * \"a\"} />\n",
        ),
        (
            "src/Keyed.svelte",
            "<script lang=\"ts\">\n\tlet { items }: { items: { id: number }[] } = $props();\n\
             </script>\n\n{#each items as item, i (item.id)}\n\
             \t<slot item={item.nope} index={i.toFixed(1).nope} />\n{/each}\n",
        ),
    ]);
    assert_eq!(
        report,
        "src/Arithmetic.svelte(5,14): error TS2363: The right-hand side of an arithmetic \
         operation must be of type 'any', 'number', 'bigint' or an enum type.\n\
         src/Keyed.svelte(6,19): error TS2339: Property 'nope' does not exist on type '{ id: \
         number; }'.\n\
         src/Keyed.svelte(6,45): error TS2339: Property 'nope' does not exist on type 'string'.\n\
         src/Named.svelte(5,22): error TS2304: Cannot find name 'missing'.\n\
         \nFound 4 errors in 3 files.\n"
    );
}

/// The return copies a `$bindable` prop's name, and a finding at that name in the script still
/// maps there and is reported. svelte-check 4.7.8 reports this line.
#[cfg(unix)]
#[test]
fn typecheck_reports_a_finding_at_a_name_the_return_copies() {
    let report = check(&[(
        "src/Bound.svelte",
        "<script lang=\"ts\">\n\tlet { nope = $bindable() }: { a: number } = $props();\n\
         </script>\n\n{nope}\n",
    )]);
    assert_eq!(
        report,
        "src/Bound.svelte(2,8): error TS2339: Property 'nope' does not exist on type \
         '$$ComponentProps'.\n\
         \nFound 1 error in 1 file.\n"
    );
}
