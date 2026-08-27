//! Issue #3569: `StyleDirective` owns aggregate call, await, dependency, and
//! shorthand-state metadata that Phase 3 uses for memoisation and update
//! routing. Explicit-expression state remains with the client scope evaluator
//! until Phase 2 can represent its compile-time-known result exactly.

use rsvelte_core::{
    CompileOptions, ParseOptions,
    ast::{
        arena::SerializeArenaGuard,
        template::{Attribute, TemplateNode},
    },
    compiler::phases::analyze_component,
    parse,
};

fn style_flags(source: &str) -> (bool, bool, bool) {
    let mut root = parse(
        source,
        &oxc_allocator::Allocator::default(),
        ParseOptions::default(),
    )
    .expect("parse");
    // SAFETY: `root.arena` outlives the guard and analysis below.
    let _arena_guard = unsafe { SerializeArenaGuard::new(&raw const root.arena) };
    analyze_component(&mut root, source, &CompileOptions::default()).expect("analyze");

    let node = match &root.fragment.nodes[0] {
        TemplateNode::EachBlock(block) => &block.body.nodes[0],
        node => node,
    };
    let attributes = match node {
        TemplateNode::RegularElement(element) => &element.attributes,
        TemplateNode::SvelteElement(element) => &element.attributes,
        TemplateNode::SvelteBody(element) => &element.attributes,
        TemplateNode::SvelteWindow(element) => &element.attributes,
        TemplateNode::SvelteDocument(element) => &element.attributes,
        other => panic!("expected an element host, got {other:?}"),
    };
    let Some(Attribute::StyleDirective(directive)) = attributes
        .iter()
        .find(|attribute| matches!(attribute, Attribute::StyleDirective(_)))
    else {
        panic!("expected style directive");
    };

    let metadata = &directive.metadata.expression;
    (
        metadata.has_state(),
        metadata.has_call(),
        metadata.has_await(),
    )
}

#[test]
fn every_legal_host_populates_local_call_metadata() {
    for source in [
        "<script>function make() {}</script><div style:color={make()}></div>",
        "<script>function make() {}</script><svelte:element this=\"div\" style:color={make()} />",
        "<script>function make() {}</script><svelte:body style:color={make()} />",
        "<script>function make() {}</script><svelte:window style:color={make()} />",
        "<script>function make() {}</script><svelte:document style:color={make()} />",
    ] {
        assert_eq!(style_flags(source), (true, true, false), "{source}");
    }
}

#[test]
fn every_expression_chunk_contributes_to_the_aggregate() {
    let source = "<script>let color = $state(); function make() {}</script><div style:color=\"{color}-{make()}\"></div>";
    assert_eq!(style_flags(source), (true, true, false));
}

#[test]
fn global_call_is_not_promoted_to_an_impure_call() {
    assert_eq!(
        style_flags("<div style:color={globalThis.make()}></div>"),
        (false, false, false)
    );
}

#[test]
fn shorthand_uses_the_lexically_resolved_binding_kind() {
    assert_eq!(
        style_flags("{#each [1] as color}<div style:color></div>{/each}"),
        (true, false, false)
    );
    assert_eq!(
        style_flags("<script>let color = 'red';</script><div style:color></div>"),
        (false, false, false)
    );
}
