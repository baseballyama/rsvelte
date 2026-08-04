//! Regression test for #2182: `resolve_slot_expression`
//! (`crates/rsvelte_projection/src/svelte2tsx/template/collect/pattern.rs`)
//! substituted identifiers inside a computed object key (`{ [x]: y }`), whereas
//! official svelte2tsx's `resolveExpression` (`nodes/slot.ts`) skips a key
//! position entirely via `isObjectKey` — which fires only when the `Identifier`
//! node sits directly in the key slot. A bare-identifier computed key
//! (`[item]`) is therefore left untouched, while a compound key expression
//! (`[item + 1]`) has its nested identifiers resolved normally, since the key
//! slot there is a `BinaryExpression`, not an `Identifier`.
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

/// A bare-identifier computed key is never substituted, but its value is.
#[test]
fn bare_identifier_computed_key_is_never_substituted() {
    let code = convert("{#each items as item}\n    <slot a={{ [item]: 1 }} />\n{/each}\n");
    assert_contains(&code, "slots: {'default': {a:{ [item]: 1 }}}");
}

/// A compound computed-key expression is not an `Identifier` in key position,
/// so official's `isObjectKey` never fires on it — its nested identifiers are
/// resolved exactly as if they weren't in key position at all.
#[test]
fn compound_computed_key_expression_resolves_normally() {
    let code = convert("{#each items as item}\n    <slot a={{ [item + 1]: 1 }} />\n{/each}\n");
    assert_contains(
        &code,
        "slots: {'default': {a:{ [__sveltets_2_unwrapArr(items) + 1]: 1 }}}",
    );
}

/// Key and value can reference the same in-scope name independently: the key
/// occurrence stays untouched, the value occurrence is resolved.
#[test]
fn bare_identifier_computed_key_and_matching_value() {
    let code = convert("{#each items as item}\n    <slot a={{ [item]: item }} />\n{/each}\n");
    assert_contains(
        &code,
        "slots: {'default': {a:{ [item]: __sveltets_2_unwrapArr(items) }}}",
    );
}

/// Multiple properties: a compound key resolves its identifier, a bare key
/// stays put, and both values resolve.
#[test]
fn mixed_bare_and_compound_computed_keys() {
    let code = convert(
        "{#each items as item}\n    <slot a={{ ['x' + item]: item, [item]: 2 }} />\n{/each}\n",
    );
    assert_contains(
        &code,
        "slots: {'default': {a:{ ['x' + __sveltets_2_unwrapArr(items)]: \
         __sveltets_2_unwrapArr(items), [item]: 2 }}}",
    );
}
