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

/// svelte2tsx's render function returns each slot's props again, a copy that maps nowhere, so
/// svelte-check reports a finding in a slot prop once, at the `<slot>`. svelte-check 4.7.8 reports
/// these four lines.
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
            .native()
    );
}

/// The return copies a `$bindable` prop's name, and a finding at that name in the script still
/// maps there and is reported. svelte-check 4.7.8 reports this line.
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
            .native()
    );
}

/// A `let:` of a component without slots, forwarded through a slot: the copy of the slot's props
/// in the render function's return reports nothing. svelte-check 4.7.8 reports this line.
#[test]
fn typecheck_reports_a_forwarded_let_of_a_component_without_slots() {
    let leaf = "<script lang=\"ts\">\n\tlet { label }: { label: string } = $props();\n</script>\n\
                {label}\n";
    let user = "<script lang=\"ts\">\n\timport Leaf from \"./Leaf.svelte\";\n</script>\n\
                <Leaf label=\"x\" let:x><slot q={x} /></Leaf>\n";
    let report = check(&[("src/Leaf.svelte", leaf), ("src/App.svelte", user)]);
    assert_eq!(
        report,
        "src/App.svelte(4,21): error TS18046: '$$_faeL0.$$slot_def' is of type 'unknown'.\n\
         \nFound 1 error in 1 file.\n"
            .native()
    );
}

/// svelte2tsx steps by characters in a start tag, where the whitespace may be U+3000 or U+00A0.
/// svelte-check 4.7.8 reports these lines.
#[test]
fn typecheck_places_findings_by_characters_in_a_start_tag() {
    let leaf = "<script lang=\"ts\">\n\tlet { label }: { label: string } = $props();\n</script>\n\
                {label}\n";
    let user = |line: &str| {
        format!("<script lang=\"ts\">\n\timport Leaf from \"./Leaf.svelte\";\n</script>\n{line}\n")
    };
    let report = check(&[
        ("src/Leaf.svelte", leaf),
        ("src/S1.svelte", &user("<Leaf\u{3000}label=\"x\">t</Leaf>")),
        (
            "src/S2.svelte",
            &user("<Leaf\u{a0}label=\"x\"\u{3000}let:x>{x}</Leaf>"),
        ),
        (
            "src/S3.svelte",
            &user("<Leaf label=\"x\" let:x\u{3000}>{x}</Leaf>"),
        ),
        (
            "src/S4.svelte",
            &user(
                "<Leaf\u{3000}\u{3000}label=\"x\"\u{3000}\u{3000}let:x\u{3000}\u{3000}>{x}</Leaf>",
            ),
        ),
        ("src/S5.svelte", &user("<Leaf\u{3000}>t</Leaf>")),
        (
            "src/S6.svelte",
            &user("<Leaf /* \u{1d49c} */\u{3000}label=\"\u{1d49c}\" let:x>{x}</Leaf>"),
        ),
    ]);
    let children = "error TS2353: Object literal may only specify known properties, and \
                    'children' does not exist in type '$$ComponentProps'.";
    let unknown = "error TS18046: '$$_faeL0.$$slot_def' is of type 'unknown'.";
    assert_eq!(
        report,
        format!(
            "src/S1.svelte(4,13): {children}\n\
             src/S2.svelte(4,16): {children}\n\
             src/S2.svelte(4,21): {unknown}\n\
             src/S3.svelte(4,16): {children}\n\
             src/S3.svelte(4,22): {unknown}\n\
             src/S4.svelte(4,7): {children}\n\
             src/S4.svelte(4,24): {unknown}\n\
             src/S5.svelte(4,5): {children}\n\
             src/S6.svelte(4,26): {children}\n\
             src/S6.svelte(4,31): {unknown}\n\
             \nFound 10 errors in 6 files.\n"
        )
        .native()
    );
}
