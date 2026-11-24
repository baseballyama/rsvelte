//! `rsvelte typecheck` of a `<slot>` prop that reads a name the template declares, which
//! svelte2tsx unpacks to the value the name comes from.

use crate::typecheck_events::check;

/// The components of the first test: one per kind of name, and the consumer.
const NAMES: &[(&str, &str)] = &[
    (
        "src/Each.svelte",
        "<script lang=\"ts\">\n\
        \tlet { items }: { items: number[] } = $props();\n\
        </script>\n\
        {#each items as item, index}<slot {item} {index} list={[item]} obj={{ item }} \
        />{/each}\n",
    ),
    (
        "src/Keyed.svelte",
        "<script lang=\"ts\">\n\
        \tlet { items }: { items: number[] } = $props();\n\
        </script>\n\
        {#each items as item, i (item)}<slot {item} {i} />{/each}\n",
    ),
    (
        "src/Destructured.svelte",
        "<script lang=\"ts\">\n\
        \tlet { rows }: { rows: { a: number; b: string }[] } = $props();\n\
        </script>\n\
        {#each rows as { a, b: [c] }}<slot {a} {c} />{/each}\n",
    ),
    (
        "src/Nested.svelte",
        "<script lang=\"ts\">\n\
        \tlet { rows }: { rows: number[][] } = $props();\n\
        </script>\n\
        {#each rows as row}{#each row as cell}<slot {row} {cell} />{/each}{/each}\n",
    ),
    (
        "src/Await.svelte",
        "<script lang=\"ts\">\n\
        \tlet { load }: { load: Promise<number> } = $props();\n\
        </script>\n\
        {#await load then loaded}<slot {loaded} />{:catch err}<slot name=\"failed\" {err} \
        />{/await}\n",
    ),
    (
        "src/Const.svelte",
        "<script lang=\"ts\">\n\
        \tlet { items }: { items: number[] } = $props();\n\
        </script>\n\
        {#each items as item}{@const d = item}<slot {d} e={d} />{/each}\n",
    ),
    (
        "src/Shadow.svelte",
        "<script lang=\"ts\">\n\
        \tlet { items }: { items: number[] } = $props();\n\
        \tlet index = 'text';\n\
        </script>\n\
        {#each items as item, index}<slot {index} />{/each}\n",
    ),
    (
        "src/Inner.svelte",
        "<script lang=\"ts\">\n\
        \tlet v = 1;\n\
        </script>\n\
        <slot {v} /><slot name=\"named\" w={'s'} />\n",
    ),
    (
        "src/Forward.svelte",
        "<script lang=\"ts\">\n\
        \timport Inner from './Inner.svelte';\n\
        </script>\n\
        <Inner let:v><slot {v} /><div slot=\"named\" let:w><slot name=\"n\" {w} \
        /></div></Inner>\n",
    ),
    (
        "src/App.svelte",
        "<script lang=\"ts\">\n\
        \timport Each from './Each.svelte';\n\
        \timport Keyed from './Keyed.svelte';\n\
        \timport Destructured from './Destructured.svelte';\n\
        \timport Nested from './Nested.svelte';\n\
        \timport Await from './Await.svelte';\n\
        \timport Const from './Const.svelte';\n\
        \timport Shadow from './Shadow.svelte';\n\
        \timport Forward from './Forward.svelte';\n\
        </script>\n\
        <Each items={[1]} let:item let:index let:list \
        let:obj>{item.foo}{index.foo}{list.foo}{obj.foo}</Each>\n\
        <Keyed items={[1]} let:item let:i>{item.foo}{i.foo}</Keyed>\n\
        <Destructured rows={[]} let:a let:c>{a.foo}{c.foo}</Destructured>\n\
        <Nested rows={[]} let:row let:cell>{row.foo}{cell.foo}</Nested>\n\
        <Await load={Promise.resolve(1)} let:loaded>{loaded.foo}<svelte:fragment \
        slot=\"failed\" let:err>{err.foo}</svelte:fragment></Await>\n\
        <Const items={[1]} let:d let:e>{d.foo}{e.foo}</Const>\n\
        <Shadow items={[1]} let:index>{index.foo}</Shadow>\n\
        <Forward let:v>{v.foo}<svelte:fragment slot=\"n\" \
        let:w>{w.foo}</svelte:fragment></Forward>\n",
    ),
];

/// An `{#each}` item, an `{:then}` value and a component's `let:` type the prop, destructured
/// or nested; an index, an error and a `{@const}` are any, unless a script name of that name is
/// what svelte2tsx's copy reads. svelte-check 4.7.8 reports these twelve lines.
#[cfg(unix)]
#[test]
fn typecheck_types_a_slot_prop_by_the_template_name_it_reads() {
    let report = check(NAMES);
    assert_eq!(
        report,
        "src/App.svelte(11,61): error TS2339: Property 'foo' does not exist on type 'number'.\n\
         src/App.svelte(11,82): error TS2339: Property 'foo' does not exist on type 'number[]'.\n\
         src/App.svelte(11,91): error TS2339: Property 'foo' does not exist on type '{ item: \
         number; }'.\n\
         src/App.svelte(12,41): error TS2339: Property 'foo' does not exist on type 'number'.\n\
         src/App.svelte(13,40): error TS2339: Property 'foo' does not exist on type 'number'.\n\
         src/App.svelte(13,47): error TS2339: Property 'foo' does not exist on type 'string'.\n\
         src/App.svelte(14,41): error TS2339: Property 'foo' does not exist on type 'number[]'.\n\
         src/App.svelte(14,51): error TS2339: Property 'foo' does not exist on type 'number'.\n\
         src/App.svelte(15,53): error TS2339: Property 'foo' does not exist on type 'number'.\n\
         src/App.svelte(17,38): error TS2339: Property 'foo' does not exist on type 'string'.\n\
         src/App.svelte(18,19): error TS2339: Property 'foo' does not exist on type 'number'.\n\
         src/App.svelte(18,58): error TS2339: Property 'foo' does not exist on type 'string'.\n\
         \nFound 12 errors in 1 file.\n",
    );
}

/// svelte2tsx's scope of a block's names lasts to the block's end: its `{:else}` and pending
/// branch read them too. svelte-check 4.7.8 reports these four lines, and none outside them.
#[cfg(unix)]
#[test]
fn typecheck_reads_a_block_name_in_the_blocks_other_branches() {
    let report = check(&[
        (
            "src/Fallback.svelte",
            "<script lang=\"ts\">\n\
            \tlet { items, p }: { items: number[]; p: Promise<number> } = $props();\n\
            </script>\n\
            {#each items as item}<span></span>{:else}<slot {item} />{/each}\n\
            {#await p}<slot name=\"pending\" {v} />{:then v}{v}{/await}\n",
        ),
        (
            "src/App.svelte",
            "<script lang=\"ts\">\n\
            \timport Fallback from './Fallback.svelte';\n\
            </script>\n\
            <Fallback items={[1]} p={Promise.resolve(1)} let:item>{item.foo}<svelte:fragment \
            slot=\"pending\" let:v>{v.foo}</svelte:fragment></Fallback>\n",
        ),
    ]);
    assert_eq!(
        report,
        "src/Fallback.svelte(4,49): error TS2552: Cannot find name 'item'. Did you mean 'items'?\n\
         src/Fallback.svelte(5,33): error TS18004: No value exists in scope for the shorthand \
         property 'v'. Either declare one or provide an initializer.\n\
         src/App.svelte(4,61): error TS2339: Property 'foo' does not exist on type 'number'.\n\
         src/App.svelte(4,106): error TS2339: Property 'foo' does not exist on type 'number'.\n\
         \nFound 4 errors in 2 files.\n",
    );
}
