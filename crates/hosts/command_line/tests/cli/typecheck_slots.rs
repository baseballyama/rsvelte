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

/// A runes component declares no slots: svelte2tsx reads its `$$slot_def` as `unknown`, and the
/// `children` the content passes moves past the `let:` it removes. svelte-check 4.7.8 reports
/// these lines.
#[test]
fn typecheck_reports_a_let_of_a_component_without_slots() {
    let leaf = "<script lang=\"ts\">\n\tlet { label = $bindable() }: { label: string } = \
                $props();\n</script>\n<p>{label}</p>\n";
    let user = |line: &str| {
        format!("<script lang=\"ts\">\n\timport Leaf from \"./Leaf.svelte\";\n</script>\n{line}\n")
    };
    let report = check(&[
        ("src/Leaf.svelte", leaf),
        ("src/L1.svelte", &user("<Leaf label=\"x\" let:x>{x}</Leaf>")),
        ("src/L2.svelte", &user("<Leaf label=\"x\" let:x />")),
        (
            "src/L3.svelte",
            &user("<Leaf label=\"x\"><div slot=\"s\" let:y>{y}</div></Leaf>"),
        ),
        (
            "src/L4.svelte",
            &user("<div><Leaf label=\"x\"   let:x={y}   >{y}</Leaf></div>"),
        ),
    ]);
    let children = "error TS2353: Object literal may only specify known properties, and \
                    'children' does not exist in type '$$ComponentProps'.";
    let unknown = |name: &str| format!("error TS18046: '{name}.$$slot_def' is of type 'unknown'.");
    assert_eq!(
        report,
        format!(
            "src/L1.svelte(4,16): {children}\n\
             src/L1.svelte(4,21): {}\n\
             src/L2.svelte(4,22): {}\n\
             src/L3.svelte(4,35): {}\n\
             src/L4.svelte(4,34): {children}\n\
             src/L4.svelte(4,32): {}\n\
             \nFound 6 errors in 4 files.\n",
            unknown("$$_faeL0"),
            unknown("$$_faeL0"),
            unknown("$$_faeL0"),
            unknown("$$_faeL1"),
        )
        .native()
    );
}

/// svelte2tsx reads `$$slot_def[name]` for every child that names the slot it fills, through any
/// blocks, with or without a `let:`, so an unknown name is reported at the start of its tag.
/// svelte-check 4.7.8 reports these lines, and the `slot` inside `{#await}` as misplaced.
#[test]
fn typecheck_reports_an_unknown_slot_name_of_every_filler() {
    let parent = "<script lang=\"ts\">\n\tlet { value }: { value: number } = $props();\n\
                  </script>\n<slot name=\"item\" item={value} />\n<slot />\n";
    let leaf = "<script lang=\"ts\">\n\tlet { label }: { label: string } = $props();\n\
                </script>\n<p>{label}</p>\n";
    let app = "<script lang=\"ts\">\n\timport Parent from \"./Parent.svelte\";\n\
               \timport Leaf from \"./Leaf.svelte\";\n</script>\n\
               <Parent value={1}><div slot=\"nope\"></div></Parent>\n\
               <Parent value={1}><Leaf slot=\"nope\" label=\"a\"></Leaf></Parent>\n\
               <Parent value={1}><svelte:fragment slot=\"nope\" /></Parent>\n\
               <Parent value={1}><div slot=\"item\"></div></Parent>\n\
               <Leaf label=\"x\"><div slot=\"s\"></div></Leaf>\n\
               <Parent value={1}>{#await Promise.resolve(1) then n}<div slot=\"nope\"></div>\
               {/await}</Parent>\n";
    let report = check(&[
        ("src/Parent.svelte", parent),
        ("src/Leaf.svelte", leaf),
        ("src/App.svelte", app),
    ]);
    let unknown = "error TS7053: Element implicitly has an 'any' type because expression of type \
                   '\"nope\"' can't be used to index type '{ item: { item: number; }; default: \
                   {}; }'.\n  Property 'nope' does not exist on type '{ item: { item: number; }; \
                   default: {}; }'.";
    assert_eq!(
        report,
        format!(
            "src/App.svelte(5,19): {unknown}\n\
             src/App.svelte(6,19): {unknown}\n\
             src/App.svelte(7,19): {unknown}\n\
             src/App.svelte(9,17): error TS18046: '$$_faeL0.$$slot_def' is of type 'unknown'.\n\
             src/App.svelte(10,53): {unknown}\n\
             \nFound 5 errors in 1 file.\n"
        )
        .native()
    );
}
