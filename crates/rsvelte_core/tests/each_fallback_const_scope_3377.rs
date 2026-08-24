//! An `{#each}`'s `{:else}` fallback is its own scope, and its body is not.
//!
//! Upstream's `EachBlock` scope visitor walks the body's *nodes* with the each
//! scope (`for (const child of node.body.nodes) visit(child, { scope })`) but
//! visits the fallback as a whole `Fragment` (`if (node.fallback) visit(node.fallback,
//! { scope })`). Only the second reaches the `Fragment` visitor, which is what calls
//! `scope.child(...)`. So a declaration naming the each item is a **duplicate** in the
//! body and a **shadow** in the fallback, and rsvelte had them sharing one scope.
//!
//! That single mismatch produced two visible defects, which is why both directions are
//! pinned here: an over-rejection (rsvelte refused a component official accepts) and a
//! silent output difference (two unused parameters on the each *body* callback — a
//! sibling the declaration is not even in).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

const HEAD: &str =
    "<script>\n\tlet items = $state([1]);\n\tlet other = $state([2]);\n</script>\n\n";

fn try_compile(template: &str, generate: GenerateMode) -> Result<String, String> {
    compile(
        &format!("{HEAD}{template}\n"),
        CompileOptions {
            generate,
            ..Default::default()
        },
    )
    .map(|result| result.js.code)
    .map_err(|err| format!("{err:?}"))
}

#[track_caller]
fn client(template: &str) -> String {
    try_compile(template, GenerateMode::Client).expect("compile should succeed")
}

// --- the over-rejection half -------------------------------------------------------

/// The each item is not in scope in the fallback, so naming a `{@const}` after it
/// shadows rather than collides. rsvelte used to reject this with
/// `declaration_duplicate`; official compiles it.
#[test]
fn a_fallback_const_may_reuse_the_item_name() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        try_compile(
            "{#each items as it}x{:else}{@const it = 1}{/each}",
            generate,
        )
        .expect("a fallback `{@const}` may shadow the item name");
    }
}

/// Same for the index binding.
#[test]
fn a_fallback_const_may_reuse_the_index_name() {
    try_compile(
        "{#each items as it, i}x{:else}{@const i = 1}{/each}",
        GenerateMode::Client,
    )
    .expect("a fallback `{@const}` may shadow the index name");
}

/// Control, and the reason the two above are not just "stop checking for duplicates":
/// in the BODY the item really is in scope, so the same declaration is still a
/// duplicate — upstream rejects it there at the same position.
#[test]
fn a_body_const_reusing_the_item_name_is_still_a_duplicate() {
    let err = try_compile(
        "{#each items as it}{@const it = 1}x{/each}",
        GenerateMode::Client,
    )
    .expect_err("a body `{@const}` naming the item is a duplicate");
    assert!(
        err.contains("declaration_duplicate"),
        "expected declaration_duplicate, got: {err}"
    );
}

// --- the silent-output half --------------------------------------------------------

/// The body callback takes only the parameters it uses. A declaration in the fallback
/// used to leak into the each scope and push `$$index, $$array` onto the *body*
/// callback, which is a sibling the declaration is not in.
#[track_caller]
fn assert_body_callback_params(template: &str, expected: &str) {
    let code = client(template);
    assert!(
        code.contains(expected),
        "expected body callback `{expected}` in:\n{code}"
    );
    assert!(
        !code.contains("$$index, $$array"),
        "the body callback must not take parameters nothing uses:\n{code}"
    );
}

#[test]
fn a_fallback_const_shadowing_the_collection_leaves_the_body_callback_alone() {
    assert_body_callback_params(
        "{#each items as it}x{:else}{@const items = 1}{/each}",
        "($$anchor, it) =>",
    );
}

/// The name does not have to be the collection's. Any script-scope binding reproduced
/// it, which is what says the trigger is the declaration reaching the each scope rather
/// than anything about the collection expression.
#[test]
fn a_fallback_const_shadowing_an_unrelated_binding_leaves_the_body_callback_alone() {
    assert_body_callback_params(
        "{#each items as it}x{:else}{@const other = 1}{/each}",
        "($$anchor, it) =>",
    );
}

/// Nor does it have to be a `{@const}`: a `{#snippet}` in the fallback declares a name
/// the same way, so a fix keyed on `ConstTag` would have missed this.
#[test]
fn a_fallback_snippet_shadowing_the_collection_leaves_the_body_callback_alone() {
    assert_body_callback_params(
        "{#each items as it}x{:else}{#snippet items()}y{/snippet}{@render items()}{/each}",
        "($$anchor, it) =>",
    );
}

#[test]
fn a_keyed_each_is_unaffected_too() {
    assert_body_callback_params(
        "{#each items as it (it)}x{:else}{@const items = 1}{/each}",
        "($$anchor, it) =>",
    );
}

/// Control: a fallback declaration whose name collides with nothing never reproduced
/// the divergence, so it is what keeps the two tests above honest — if the body
/// callback lost its parameters for every each block, this would fail too.
#[test]
fn a_non_colliding_fallback_const_is_unchanged() {
    assert_body_callback_params(
        "{#each items as it}x{:else}{@const fresh = 1}{/each}",
        "($$anchor, it) =>",
    );
}

// --- the fallback's own scope still resolves ---------------------------------------

/// The new scope must not hide the fallback's own declarations from the server's
/// constant fold: `{@const items = 1}` still folds to `1` where the fallback reads it.
/// Without this, "give the fallback a scope" would pass every test above while
/// silently un-folding the branch it created.
#[test]
fn a_fallback_const_still_folds_in_its_own_branch() {
    let code = try_compile(
        "{#each items as it}x{:else}{@const items = 1}<i>{items}</i>{/each}",
        GenerateMode::Server,
    )
    .expect("compile should succeed");
    assert!(
        code.contains("<i>1</i>"),
        "the fallback's own `{{@const}}` must still fold in its branch:\n{code}"
    );
}
