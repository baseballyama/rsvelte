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

/// svelte2tsx copies a start tag's comments with the attribute beside them, reads the `this` of
/// `<svelte:component>` as no attribute, and counts a snippet's elements from its start.
/// svelte-check 4.7.8 reports these lines.
#[test]
fn typecheck_places_a_let_by_the_start_tag_svelte2tsx_moves() {
    let leaf = "<script lang=\"ts\">\n\tlet { label = $bindable() }: { label: string } = \
                $props();\n</script>\n<p>{label}</p>\n";
    let user = |line: &str| {
        format!("<script lang=\"ts\">\n\timport Leaf from \"./Leaf.svelte\";\n</script>\n{line}\n")
    };
    let report = check(&[
        ("src/Leaf.svelte", leaf),
        (
            "src/K1.svelte",
            &user("<Leaf label=\"x\" /* c */ let:x>{x}</Leaf>"),
        ),
        (
            "src/K2.svelte",
            &user("<Leaf label=\"x\" // c\n\tlet:x>{x}</Leaf>"),
        ),
        (
            "src/K3.svelte",
            &user("<svelte:component this={Leaf} label=\"x\" let:y>{y}</svelte:component>"),
        ),
        (
            "src/K4.svelte",
            &user(
                "<div>{#snippet s()}<Leaf label=\"x\" let:x>{x}</Leaf>{/snippet}{@render \
                 s()}</div>",
            ),
        ),
        (
            "src/K5.svelte",
            &user("<Leaf /* a */ label=\"x\">text</Leaf>"),
        ),
        (
            "src/K6.svelte",
            &user("<Leaf label=\"x\" /* c */>text</Leaf>"),
        ),
    ]);
    let children = "error TS2353: Object literal may only specify known properties, and \
                    'children' does not exist in type '$$ComponentProps'.";
    let unknown = |name: &str| format!("error TS18046: '{name}.$$slot_def' is of type 'unknown'.");
    let leaf = unknown("$$_faeL0");
    let component = unknown("$$_tnenopmoc_etlevs0");
    assert_eq!(
        report,
        format!(
            "src/K1.svelte(4,25): {children}\n\
             src/K1.svelte(4,29): {leaf}\n\
             src/K2.svelte(5,1): {children}\n\
             src/K2.svelte(5,6): {leaf}\n\
             src/K3.svelte(4,19): {children}\n\
             src/K3.svelte(4,45): {component}\n\
             src/K4.svelte(4,35): {children}\n\
             src/K4.svelte(4,40): {leaf}\n\
             src/K5.svelte(4,21): {children}\n\
             src/K6.svelte(4,16): {children}\n\
             \nFound 10 errors in 6 files.\n"
        )
        .native()
    );
}

/// svelte-check 4.7.8 drops this TS18046, see `DIVERGENCES.md` in the check crate.
#[test]
fn typecheck_reports_a_let_before_a_comment_that_ends_the_tag() {
    let leaf = "<script lang=\"ts\">\n\tlet { label }: { label: string } = $props();\n</script>\n\
                {label}\n";
    let user = "<script lang=\"ts\">\n\timport Leaf from \"./Leaf.svelte\";\n</script>\n\
                <Leaf label=\"x\" let:x /* t */>{x}</Leaf>\n";
    let report = check(&[("src/Leaf.svelte", leaf), ("src/App.svelte", user)]);
    assert_eq!(
        report,
        "src/App.svelte(4,16): error TS2353: Object literal may only specify known properties, and \
         'children' does not exist in type '$$ComponentProps'.\n\
         src/App.svelte(4,22): error TS18046: '$$_faeL0.$$slot_def' is of type 'unknown'.\n\
         \nFound 2 errors in 1 file.\n"
            .native()
    );
}
