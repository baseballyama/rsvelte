//! SSR constant folding must resolve a `{@const}` through the render position's
//! LEXICAL SCOPE CHAIN, not through a flat "every template scope" union.
//!
//! Issue #2059: two sibling fragments each declaring `{@const x = …}` are
//! unrelated scopes, so each read folds to its own value. Before the server
//! visitors threaded `state.scope` (upstream `set_scope`), both bindings were
//! candidates for every read — first producing the NEIGHBOUR's value, then (once
//! the alternate scope joined the candidate set) bailing out of folding entirely
//! and emitting `$.escape(x)` where official emits the literal.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

#[track_caller]
fn ssr(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            generate: GenerateMode::Server,
            ..Default::default()
        },
    )
    .expect("component should compile")
    .js
    .code
}

#[track_caller]
fn assert_contains_all(source: &str, needles: &[&str]) {
    let code = ssr(source);
    for needle in needles {
        assert!(
            code.contains(needle),
            "expected {needle:?} in SSR output:\n{code}"
        );
    }
}

#[track_caller]
fn assert_contains_none(source: &str, needles: &[&str]) {
    let code = ssr(source);
    for needle in needles {
        assert!(
            !code.contains(needle),
            "did not expect {needle:?} in SSR output:\n{code}"
        );
    }
}

/// The issue's repro: an `{:else}` arm and a following `{#key}` block each
/// declare `x`. Official folds each branch to its own constant.
#[test]
fn sibling_const_tags_fold_to_their_own_value() {
    let source =
        "{#if a}<p>A</p>{:else}{@const x = 1}<p>{x}</p>{/if}{#key k}{@const x = 2}<p>{x}</p>{/key}";
    assert_contains_all(source, &["<p>1</p>", "<p>2</p>"]);
    assert_contains_none(source, &["$.escape(x)"]);
}

/// The `{#each}`-adjacent variant from the issue (the each block's `{@const}`
/// must not veto the `{:else}` fold, and vice versa).
#[test]
fn each_adjacent_const_tags_fold_to_their_own_value() {
    let source = "{#if a}<p>A</p>{:else}{@const x = 1}<p>{x}</p>{/if}{#each items as item}{@const x = 2}<p>{x}</p>{/each}";
    assert_contains_all(source, &["<p>1</p>", "<p>2</p>"]);
    assert_contains_none(source, &["$.escape(x)"]);
}

/// Both arms of one `{#if}` are separate scopes too.
#[test]
fn if_consequent_and_alternate_consts_are_independent() {
    let source = "{#if a}{@const x = 'yes'}<p>{x}</p>{:else}{@const x = 'no'}<p>{x}</p>{/if}";
    assert_contains_all(source, &["<p>yes</p>", "<p>no</p>"]);
    assert_contains_none(source, &["$.escape(x)"]);
}

/// An inner `{@const}` SHADOWS the enclosing fragment's same-named one: the
/// nearest declaration on the chain wins (upstream `scope.get(name)`), rather
/// than the two merging into an ambiguous value set.
#[test]
fn inner_const_shadows_outer_const() {
    let source = "{#key k}{@const x = 1}<p>{x}</p>{#key k2}{@const x = 2}<p>{x}</p>{/key}{/key}";
    assert_contains_all(source, &["<p>1</p>", "<p>2</p>"]);
    assert_contains_none(source, &["$.escape(x)"]);
}

/// `<svelte:boundary>` children are their own scope too.
#[test]
fn boundary_scoped_consts_do_not_cross_siblings() {
    let source = "<svelte:boundary>{@const x = 1}<p>{x}</p></svelte:boundary><svelte:boundary>{@const x = 2}<p>{x}</p></svelte:boundary>";
    assert_contains_all(source, &["<p>1</p>", "<p>2</p>"]);
    assert_contains_none(source, &["$.escape(x)"]);
}

/// A snippet body's `{@const}` must not be substituted into a sibling snippet.
#[test]
fn snippet_consts_do_not_cross_snippets() {
    let source = "{#snippet a()}{@const x = 1}<p>{x}</p>{/snippet}{#snippet b()}{@const x = 2}<p>{x}</p>{/snippet}{@render a()}{@render b()}";
    assert_contains_all(source, &["<p>1</p>", "<p>2</p>"]);
    assert_contains_none(source, &["$.escape(x)"]);
}

/// A read OUTSIDE any of the declaring fragments resolves to no binding at all,
/// so it stays dynamic instead of folding to an arbitrary sibling's value.
#[test]
fn read_outside_the_declaring_scope_stays_dynamic() {
    let source = "{#key k}{@const x = 1}<p>{x}</p>{/key}<p>{x}</p>";
    let code = ssr(source);
    assert!(
        code.contains("<p>1</p>"),
        "in-scope read should fold:\n{code}"
    );
    assert!(
        code.contains("$.escape(x)"),
        "out-of-scope read should stay dynamic:\n{code}"
    );
}
