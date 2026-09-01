//! Upstream registers the each-block context's `assign` / `mutate` transforms as
//! `b.sequence([mutation, ...sequence])`, so a `bind:` write to the item is always
//! a sequence — parenthesised even when `sequence` is empty — and carries
//! `$.invalidate_store($$stores, '$name')` when the collection is a store
//! subscription. rsvelte reached that rule only from the legacy
//! `build_each_block_getter_setter`; a runes component's generated
//! `set value($$value)` emitted the bare assignment.
//!
//! Which rows move under ablation is recorded per test, because the two legacy
//! rows pass without the fix and would otherwise read as covering it.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compiles")
    .js
    .code
}

/// Ablating the fix turns this row red.
#[test]
fn a_runes_store_collection_invalidates_the_store_from_the_component_setter() {
    let code = client(
        "<script>\n\
         \timport { services } from './stores.js';\n\
         \tlet n = $state(0);\n\
         </script>\n\n\
         {#each $services.list as service}\n\
         \t<Toggle bind:value={service.value} />\n\
         {/each}\n\
         {n}\n",
    );
    assert!(
        code.contains("$.invalidate_store($$stores, '$services')"),
        "expected the setter to invalidate the store:\n{code}"
    );
}

/// Ablating the fix turns this row red. Without it a fix that appends
/// `$.invalidate_store` unconditionally, or one that skips the sequence when
/// there is no store, both look correct above.
#[test]
fn a_runes_plain_collection_still_parenthesises_the_write() {
    let code = client(
        "<script>\n\
         \tlet plain = $state([{ value: 1 }]);\n\
         </script>\n\n\
         {#each plain as item}\n\
         \t<Toggle bind:value={item.value} />\n\
         {/each}\n",
    );
    assert!(
        code.contains("($.get(item).value = $$value);"),
        "expected a one-element sequence and no invalidation:\n{code}"
    );
    assert!(
        !code.contains("invalidate_store"),
        "a non-store collection has nothing to invalidate:\n{code}"
    );
}

/// The transform upstream registers is keyed on the each-block CONTEXT binding,
/// so a write to something else inside the same block is an ordinary assignment.
/// Ablating the fix leaves this row green — it is the control that pins what the
/// fix must NOT do.
#[test]
fn a_write_that_is_not_the_each_item_is_left_alone() {
    let code = client(
        "<script>\n\
         \timport { services } from './stores.js';\n\
         \tlet outer = $state({ value: 1 });\n\
         </script>\n\n\
         {#each $services.list as service}\n\
         \t<Other bind:value={outer.value} />\n\
         {/each}\n",
    );
    assert!(
        code.contains("outer.value = $$value;"),
        "expected a bare assignment for a non-item root:\n{code}"
    );
    assert!(
        !code.contains("invalidate_store"),
        "a non-item write must not invalidate the collection's store:\n{code}"
    );
}

/// Legacy mode reaches the same upstream rule through a different rsvelte path
/// (`build_each_block_getter_setter`), which already agreed. Ablating the fix
/// leaves these two rows green: they are a regression guard on the other path,
/// not evidence about this one.
#[test]
fn a_legacy_store_collection_keeps_its_invalidation() {
    let code = client(
        "<script>\n\
         \timport { services } from './stores.js';\n\
         </script>\n\n\
         {#each $services.list as service}\n\
         \t<Toggle bind:value={service.value} />\n\
         {/each}\n",
    );
    assert!(
        code.contains("$.invalidate_store($$stores, '$services')"),
        "expected the legacy path to keep invalidating the store:\n{code}"
    );
}

#[test]
fn a_legacy_plain_collection_keeps_its_inner_signal_invalidation() {
    let code = client(
        "<script>\n\
         \texport let plain = [];\n\
         </script>\n\n\
         {#each plain as item}\n\
         \t<Toggle bind:value={item.value} />\n\
         {/each}\n",
    );
    assert!(
        code.contains("$.invalidate_inner_signals"),
        "expected the legacy path to keep invalidating inner signals:\n{code}"
    );
}
