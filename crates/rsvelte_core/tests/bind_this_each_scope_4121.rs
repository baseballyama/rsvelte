//! Which identifiers a `bind:this` turns into callback parameters is decided by the
//! DECLARATION's scope, not by the loop variable's name.
//!
//! Upstream's `build_bind_this` (`3-transform/client/visitors/shared/utils.js`) walks the
//! getter and, for each reference, compares the binding's own scope against the scope of
//! every `EachBlock` owner — `owner.type === 'EachBlock' && scope === binding.scope`. A
//! `{@const}` written directly in an each block therefore becomes a parameter, while the
//! same name declared one `{#if}` deeper does not, because that is a different scope.
//!
//! rsvelte matched on the name instead (`each_ctx.item_name` / `index_name` /
//! `destructured_update_paths`), so a `{@const}` never qualified however it was declared.
//!
//! The subject expression's SHAPE is the second axis. The collector walks it, so a
//! reference inside a `||` or a template literal is lost by any arm the walk lacks — and
//! upstream marks a name seen before asking whether the occurrence is a reference, so a
//! property key of the same name burns it for the value beside it.
//!
//! Upstream's two exclusions travel WITH the rule and are ported with it:
//! `is_state_source(binding)` and `binding.kind === 'derived'` are skipped, because those
//! are declaration tags whose signal — not whose value — has to be passed. Porting the
//! scope test without them turns the fix into an over-collection.
//!
//! The cases live in ONE component on purpose. A grid of one component per cell cannot
//! see a rule that depends on sibling blocks, and the collector is walked once per
//! `bind:this` against a stack of each-block contexts.
//!
//! Every expectation below was measured against the official compiler first.

use rsvelte_core::{CompileOptions, CssMode, GenerateMode, compile};

const SRC: &str = include_str!(
    "../../../compatibility/pattern-corpus/issues/4121-bind-this-each-scope-const.svelte"
);

fn bind_this_calls(dev: bool) -> Vec<String> {
    let js = compile(
        SRC,
        CompileOptions {
            filename: Some("C.svelte".into()),
            generate: GenerateMode::Client,
            dev,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("the component compiles")
    .js
    .code;
    js.lines()
        .filter(|l| l.contains("$.bind_this("))
        .map(|l| l.trim().to_string())
        .collect()
}

/// Official's output for every case, in source order.
const EXPECTED: [&str; 10] = [
    // declared directly in the each block's own scope
    "$.bind_this(span, ($$value, k) => els[k] = $$value, (k) => els?.[k], () => [$.get(k)]);",
    // declared one `{#if}` deeper: a different scope, so it stays a signal read
    "$.bind_this(span_1, ($$value) => els[$.get(k)] = $$value, () => els?.[$.get(k)]);",
    // declared in the each, used deeper: the DECLARATION's scope is what counts
    "$.bind_this(span_2, ($$value, k) => els[k] = $$value, (k) => els?.[k], () => [$.get(k)]);",
    // no each block at all
    "$.bind_this(span_3, ($$value) => els[$.get(k)] = $$value, () => els?.[$.get(k)]);",
    // the loop variables themselves, which already worked
    "$.bind_this(span_4, ($$value, i) => els[i] = $$value, (i) => els?.[i], () => [i]);",
    // the `$derived` is excluded by upstream's guard; the `{@const}` beside it is not
    "$.bind_this(span_5, ($$value, k) => els[k + $.get(total)] = $$value, (k) => els?.[k + $.get(total)], () => [$.get(k)]);",
    // the subject's shape is a second axis: the reference is inside a `||` ...
    "$.bind_this(span_6, ($$value, k) => els[k || 0] = $$value, (k) => els?.[k || 0], () => [$.get(k)]);",
    // ... and inside a template literal
    "$.bind_this(span_7, ($$value, k) => els[`k${k}`] = $$value, (k) => els?.[`k${k}`], () => [$.get(k)]);",
    // a property key of the same name is walked first and burns it, so nothing is collected
    "$.bind_this(span_8, ($$value) => els[({ k: $.get(k) }).k] = $$value, () => els?.[({ k: $.get(k) }).k]);",
    // a key spelled differently does not burn it
    "$.bind_this(span_9, ($$value, k) => els[({ kk: k }).kk] = $$value, (k) => els?.[({ kk: k }).kk], () => [$.get(k)]);",
];

#[test]
fn every_case_matches_official() {
    for dev in [false, true] {
        let calls = bind_this_calls(dev);
        assert_eq!(
            calls.len(),
            EXPECTED.len(),
            "dev={dev}: expected {} bind_this calls, got:\n{}",
            EXPECTED.len(),
            calls.join("\n")
        );
        for (i, (actual, expected)) in calls.iter().zip(EXPECTED).enumerate() {
            assert_eq!(actual, expected, "dev={dev}, case {i}");
        }
    }
}

/// The controls, stated separately so a failure names the direction. Collecting every
/// identifier in the getter would satisfy the first case and break these; collecting none
/// would do the reverse.
#[test]
fn a_declaration_outside_the_each_block_is_not_collected() {
    let calls = bind_this_calls(false);
    assert!(
        !calls[1].contains("(k) =>") && !calls[3].contains("(k) =>"),
        "a `{{@const}}` declared in an inner `{{#if}}`, or with no each block at all, must not \
         become a parameter; got:\n{}\n{}",
        calls[1],
        calls[3]
    );
}

#[test]
fn an_instance_scope_derived_is_not_collected() {
    let calls = bind_this_calls(false);
    assert!(
        calls[5].starts_with("$.bind_this(span_5, ($$value, k) =>")
            && calls[5].contains("$.get(total)"),
        "upstream skips `binding.kind === 'derived'`, so `total` stays a signal read and never \
         joins the parameter list; got:\n{}",
        calls[5]
    );
    assert!(
        calls[5].contains("() => [$.get(k)]"),
        "and the `{{@const}}` beside it is still collected; got:\n{}",
        calls[5]
    );
}

/// Upstream pushes the name onto `seen` BEFORE testing whether the occurrence is a
/// reference (`shared/utils.js`), so an identifier in a non-reference position burns the
/// name for every later one. The two cells differ only in how the key is spelled, which is
/// what separates this rule from "objects are not walked".
#[test]
fn a_property_key_burns_the_name_for_the_value_beside_it() {
    let calls = bind_this_calls(false);
    assert!(
        !calls[8].contains("(k) =>"),
        "the key `k` is walked first, so the value `k` must not be collected; got:\n{}",
        calls[8]
    );
    assert!(
        calls[9].contains("(k) =>") && calls[9].contains("() => [$.get(k)]"),
        "with the key spelled `kk` there is nothing to burn the name; got:\n{}",
        calls[9]
    );
}
