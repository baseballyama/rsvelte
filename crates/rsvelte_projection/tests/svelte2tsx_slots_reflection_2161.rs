//! Regression tests for #2161: the slots-reflection resolver
//! (`push_let_reflection_scope` / `resolve_slot_expression`, official
//! `SlotHandler.resolve*` + `TemplateScope`).
//!
//! Three gaps: a destructuring `let:`/`then`/`catch` context bound only its
//! directive name (so the leaf identifiers stayed unresolved), an identifier in
//! object-**key** position was substituted like a value, and the `{#await}`
//! opener padding was a constant where official derives it from a gap count.
//!
//! Every expectation below is byte-exact output of official svelte2tsx
//! (language-tools, parsing with svelte 5.56.8) for the same input.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn convert(src: &str) -> String {
    let opts = Svelte2TsxOptions {
        filename: "Input.svelte".to_string(),
        is_ts_file: false,
        ..Default::default()
    };
    svelte2tsx(src, opts).expect("svelte2tsx ok").code
}

fn assert_contains(code: &str, expected: &str) {
    assert!(
        code.contains(expected),
        "expected output to contain:\n{expected}\n\ngot:\n{code}"
    );
}

/// `let:whatever={{ bla }}` binds `bla`, not `whatever`, and official resolves
/// it through a destructuring arrow (`resolveDestructuringAssignmentForLet`).
#[test]
fn let_object_destructure_resolves_through_arrow() {
    let code = convert(
        "<Component let:name={n} let:thing let:whatever={{ bla }}>\n    <slot {n} {thing} {bla} />\n</Component>\n",
    );
    assert_contains(
        &code,
        "slots: {'default': {n:__sveltets_2_instanceOf(Component).$$slot_def['default'].name, \
         thing:__sveltets_2_instanceOf(Component).$$slot_def['default'].thing, \
         bla:(({ bla }) => bla)(__sveltets_2_instanceOf(Component).$$slot_def['default'].whatever)}}",
    );
}

/// Array patterns bind every leaf, each through its own arrow.
#[test]
fn let_array_destructure_resolves_every_leaf() {
    let code = convert(
        "<Component let:pair={[first, second]}>\n    <slot a={first} b={second} />\n</Component>\n",
    );
    assert_contains(
        &code,
        "slots: {'default': \
         {a:(([first, second]) => first)(__sveltets_2_instanceOf(Component).$$slot_def['default'].pair), \
         b:(([first, second]) => second)(__sveltets_2_instanceOf(Component).$$slot_def['default'].pair)}}",
    );
}

/// A renamed key (`{ a: renamed }`) binds the RHS only.
#[test]
fn let_renamed_key_destructure_binds_the_value() {
    let code =
        convert("<Component let:obj={{ a: renamed }}>\n    <slot v={renamed} />\n</Component>\n");
    assert_contains(
        &code,
        "slots: {'default': {v:(({ a: renamed }) => renamed)\
         (__sveltets_2_instanceOf(Component).$$slot_def['default'].obj)}}",
    );
}

/// An in-scope name used as an object KEY stays a key; only values (and the
/// appended shorthand value) are substituted.
#[test]
fn object_key_is_never_substituted() {
    let code = convert(
        "{#each items as item}\n    <slot a={item} b={{ item }} c={{ item: 'abc' }.item} \
         d={{ item: item }} e={$item} f=\"{$item}\" {...g} {...item}>Hello</slot>\n{/each}\n",
    );
    assert_contains(
        &code,
        "slots: {'default': {a:__sveltets_2_unwrapArr(items), b:{ item:__sveltets_2_unwrapArr(items) }, \
         c:{ item: 'abc' }.item, d:{ item: __sveltets_2_unwrapArr(items) }, e:$item, f:$item, ...g, \
         ...__sveltets_2_unwrapArr(items)}}",
    );
}

/// Nested objects/arrays keep the key/value split at every depth, and a member
/// property (`item.item`) is left alone.
#[test]
fn nested_object_shorthand_resolves_values_only() {
    let code = convert(
        "{#each items as item}\n    <slot a={{ x: { item }, y: [item], z: item.item }} />\n{/each}\n",
    );
    assert_contains(
        &code,
        "slots: {'default': {a:{ x: { item:__sveltets_2_unwrapArr(items) }, \
         y: [__sveltets_2_unwrapArr(items)], z: __sveltets_2_unwrapArr(items).item }}}",
    );
}

/// String and template literals are copied verbatim — their contents are not
/// identifiers, so they must never be substituted.
#[test]
fn string_literals_are_not_substituted() {
    let code = convert(
        "{#each items as item}\n    <slot a={'item'} b={`item`} c={\"item\"} d={item} />\n{/each}\n",
    );
    assert_contains(
        &code,
        "slots: {'default': {a:'item', b:`item`, c:\"item\", d:__sveltets_2_unwrapArr(items)}}",
    );
}

/// `{#await … then}` / `{:catch}` destructuring contexts resolve through the
/// same arrow, over `__sveltets_2_unwrapPromiseLike` / `__sveltets_2_any({})`.
#[test]
fn await_then_destructure_resolves_through_arrow() {
    let code = convert(
        "{#await promise2 then { b }}\n    <slot name=\"second\" a={b}>Hello</slot>\n{/await}\n",
    );
    assert_contains(
        &code,
        "slots: {'second': {a:(({ b }) => b)(__sveltets_2_unwrapPromiseLike(promise2))}}",
    );
}

#[test]
fn await_catch_binding_is_any() {
    let code = convert(
        "{#await promise then value}\n    <slot a={value}>Hello</slot>\n{:catch err}\n    \
         <slot name=\"err\" err={err}>Hello</slot>\n{/await}\n",
    );
    assert_contains(
        &code,
        "slots: {'default': {a:__sveltets_2_unwrapPromiseLike(promise)}, 'err': {err:__sveltets_2_any({})}}",
    );
}

#[test]
fn await_catch_destructure_resolves_through_arrow() {
    let code = convert(
        "{#await promise catch { message }}\n    <slot m={message}>Hello</slot>\n{/await}\n",
    );
    assert_contains(
        &code,
        "slots: {'default': {m:(({ message }) => message)(__sveltets_2_any({}))}}",
    );
}

/// Official re-assembles the block at `{/await}` and leaves one space per
/// collapsed source gap, so the opener padding grows with each clause: 2 for a
/// bare/pending-only block, +1 for `then`, +1 for `catch`.
#[test]
fn await_opener_padding_counts_clauses() {
    for (src, opener) in [
        (
            "{#await promise}{/await}\n",
            "async () => {  { await (promise);}",
        ),
        (
            "{#await promise}\n    <p>waiting</p>\n{/await}\n",
            "async () => {  { ",
        ),
        (
            "{#await promise then value}\n    <slot a={value} />\n{/await}\n",
            "async () => {   { const $$_value = await (promise);",
        ),
        (
            "{#await promise catch err}\n    <slot e={err} />\n{/await}\n",
            "async () => {   { try { await (promise);",
        ),
        (
            "{#await promise then value}\n    <slot a={value} />\n{:catch err}\n    <p>{err}</p>\n{/await}\n",
            "async () => {    { try { const $$_value = await (promise);",
        ),
        (
            "{#await promise}\n    <p>x</p>\n{:then value}\n    <slot a={value} />\n{:catch err}\n    <p>{err}</p>\n{/await}\n",
            "async () => {    { ",
        ),
    ] {
        assert_contains(&convert(src), opener);
    }
}
