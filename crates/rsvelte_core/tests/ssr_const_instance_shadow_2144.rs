//! A `{@const}` / `{const}` that shadows an INSTANCE-script binding must hide
//! it for both SSR folding and the derived/store read-wrap.
//!
//! Issue #2144: `constant_vars` is keyed by name alone, so an instance
//! `let doubled = $derived(count * 2)` folded into the table kept folding
//! `{doubled}` reads inside `{#if …}{@const doubled = …}` to the OUTER value;
//! and `read_wrap` resolved the same read against the instance scope, emitting
//! the outer accessor call `doubled()`. #2132 fixed the sibling-template-scope
//! axis only — the instance-script axis needed the same scope chain.

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

const INSTANCE: &str =
    "<script>\n\tlet count = $state(4);\n\tlet doubled = $derived(count * 2);\n</script>\n";

/// The issue's accessor repro: the `{@const}` value is not foldable, so the
/// read stays `$.escape(doubled)` — NOT the outer `$derived` accessor call.
#[test]
fn const_tag_shadowing_derived_reads_bare() {
    let source =
        format!("{INSTANCE}{{#if count}}{{@const doubled = () => 'x'}}<p>{{doubled}}</p>{{/if}}");
    assert_contains_all(&source, &["$.escape(doubled)"]);
    assert_contains_none(&source, &["$.escape(doubled())", "<p>8</p>"]);
}

/// The issue's literal repro: the fold must use the SHADOWING const's value.
#[test]
fn const_tag_shadowing_derived_folds_to_inner_value() {
    let source = format!("{INSTANCE}{{#if count}}{{@const doubled = 7}}<p>{{doubled}}</p>{{/if}}");
    assert_contains_all(&source, &["<p>7</p>"]);
    assert_contains_none(&source, &["<p>8</p>", "$.escape(doubled)"]);
}

/// …and the shadow must not outlive the fragment: the read after `{/if}` folds
/// to the instance `$derived` again.
#[test]
fn shadow_does_not_leak_past_the_block() {
    let source = format!(
        "{INSTANCE}{{#if count}}{{@const doubled = 7}}<p>{{doubled}}</p>{{/if}}<span>{{doubled}}</span>"
    );
    assert_contains_all(&source, &["<p>7</p>", "<span>8</span>"]);
}

/// A `{@const}` shadowing an un-updated `$state` binding (the other source of
/// name-keyed `constant_vars` entries).
#[test]
fn const_tag_shadowing_state_reads_bare() {
    let source = "<script>\n\tlet count = $state(3);\n</script>\n{#if true}{@const count = () => 9}<p>{count}</p>{/if}<span>{count}</span>";
    assert_contains_all(source, &["$.escape(count)", "<span>3</span>"]);
    assert_contains_none(source, &["<p>3</p>"]);
}

/// Attribute position goes through the same read-wrap, so it must not emit the
/// outer accessor call either.
#[test]
fn const_tag_shadow_applies_to_attributes() {
    let source = format!(
        "{INSTANCE}{{#if count}}{{@const doubled = () => 1}}<p title={{doubled}}>x</p>{{/if}}"
    );
    assert_contains_all(&source, &["$.attr('title', doubled)"]);
    assert_contains_none(&source, &["doubled()"]);
}

/// A destructuring `{@const}` binds through a pattern; every bound name shadows.
#[test]
fn destructured_const_tag_shadows() {
    let source = format!(
        "{INSTANCE}{{#if count}}{{@const {{ doubled }} = {{ doubled: () => 1 }}}}<p>{{doubled}}</p>{{/if}}"
    );
    assert_contains_all(&source, &["$.escape(doubled)"]);
    assert_contains_none(&source, &["<p>8</p>"]);
}

/// The shadow is nested-scope aware: an element inside the block sees it too.
#[test]
fn shadow_reaches_nested_element_children() {
    let source = format!(
        "{INSTANCE}{{#if count}}{{@const doubled = () => 1}}<div><p>{{doubled}}</p></div>{{/if}}<span>{{doubled}}</span>"
    );
    assert_contains_all(
        &source,
        &["<div><p>${$.escape(doubled)}</p></div>", "<span>8</span>"],
    );
}

/// Other block types create the same scope: `{#key}` and `{#each}`.
#[test]
fn key_and_each_blocks_shadow_too() {
    let key =
        format!("{INSTANCE}{{#key count}}{{@const doubled = () => 1}}<p>{{doubled}}</p>{{/key}}");
    assert_contains_all(&key, &["$.escape(doubled)"]);
    assert_contains_none(&key, &["<p>8</p>"]);

    let each = format!(
        "{INSTANCE}{{#each [1] as i}}{{@const doubled = () => i}}<p>{{doubled}}</p>{{/each}}<span>{{doubled}}</span>"
    );
    assert_contains_all(&each, &["$.escape(doubled)", "<span>8</span>"]);
}

/// A `{let x = $derived(…)}` declaration tag declares a LOCAL derived — its
/// reads still take the getter call, so the shadow must not swallow them.
#[test]
fn local_derived_declaration_tag_still_calls_its_getter() {
    let source =
        "<div>\n\t{let dt = $derived(Date.parse('2026-10-01T00:00:00Z'))}\n\t{typeof dt}\n</div>";
    assert_contains_all(source, &["typeof dt()"]);
}
