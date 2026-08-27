//! Issue #3569: `SpreadAttribute` owns the expression metadata that Phase 3
//! uses for memoisation decisions.

use rsvelte_core::{
    CompileOptions, ParseOptions,
    ast::{
        arena::SerializeArenaGuard,
        template::{Attribute, TemplateNode},
    },
    compiler::phases::analyze_component,
    parse,
};

fn spread_flags(source: &str) -> (bool, bool) {
    let mut root = parse(
        source,
        &oxc_allocator::Allocator::default(),
        ParseOptions::default(),
    )
    .expect("parse");
    // SAFETY: `root.arena` outlives the guard and analysis below.
    let _arena_guard = unsafe { SerializeArenaGuard::new(&raw const root.arena) };
    analyze_component(&mut root, source, &CompileOptions::default()).expect("analyze");

    let attributes = match &root.fragment.nodes[0] {
        TemplateNode::RegularElement(element) => &element.attributes,
        TemplateNode::Component(component) => &component.attributes,
        TemplateNode::SvelteComponent(component) => &component.attributes,
        TemplateNode::SvelteElement(element) => &element.attributes,
        TemplateNode::SlotElement(element) => &element.attributes,
        other => panic!("expected an element host, got {other:?}"),
    };
    let Some(Attribute::SpreadAttribute(spread)) = attributes.last() else {
        panic!("expected spread attribute");
    };

    (
        spread.metadata.expression.has_state(),
        spread.metadata.expression.has_call(),
    )
}

fn css_dynamic_flags(source: &str) -> (bool, bool) {
    let mut root = parse(
        source,
        &oxc_allocator::Allocator::default(),
        ParseOptions::default(),
    )
    .expect("parse");
    // SAFETY: `root.arena` outlives the guard and analysis below.
    let _arena_guard = unsafe { SerializeArenaGuard::new(&raw const root.arena) };
    let analysis =
        analyze_component(&mut root, source, &CompileOptions::default()).expect("analyze");

    (
        analysis.css.has_dynamic_classes,
        analysis.css.has_dynamic_ids,
    )
}

#[test]
fn every_legal_host_populates_local_call_metadata() {
    for source in [
        "<script>function make() {}</script><div {...make()}></div>",
        "<script>function make() {}</script><Widget {...make()} />",
        "<script>function make() {}</script><svelte:component this={Widget} {...make()} />",
        "<script>function make() {}</script><svelte:element this=\"div\" {...make()} />",
        "<script>function make() {}</script><slot {...make()} />",
    ] {
        assert_eq!(spread_flags(source), (true, true), "{source}");
    }
}

#[test]
fn global_call_is_not_promoted_to_an_impure_call() {
    assert_eq!(
        spread_flags("<div {...globalThis.make()}></div>"),
        (false, false)
    );
}

#[test]
fn state_reference_does_not_invent_a_call() {
    let source = "<script>let props = $state();</script><div {...props}></div>";
    assert_eq!(spread_flags(source), (true, false));
}

#[test]
fn only_dom_spreads_make_css_attributes_dynamic() {
    assert_eq!(css_dynamic_flags("<div {...props}></div>"), (true, true));
    assert_eq!(
        css_dynamic_flags("<svelte:element this=\"div\" {...props} />"),
        (true, true)
    );
    assert_eq!(css_dynamic_flags("<Widget {...props} />"), (false, false));
    assert_eq!(
        css_dynamic_flags("<svelte:component this={Widget} {...props} />"),
        (false, false)
    );
    assert_eq!(css_dynamic_flags("<slot {...props} />"), (false, false));
}

#[test]
fn const_tag_object_rest_is_reactive() {
    let source = concat!(
        "<script>let props = $state({});</script>",
        "<Widget>{@const { ...rest } = props}<Inner {...rest} /></Widget>",
    );
    let mut root = parse(
        source,
        &oxc_allocator::Allocator::default(),
        ParseOptions::default(),
    )
    .expect("parse");
    // SAFETY: `root.arena` outlives the guard and analysis below.
    let _arena_guard = unsafe { SerializeArenaGuard::new(&raw const root.arena) };
    analyze_component(&mut root, source, &CompileOptions::default()).expect("analyze");

    let TemplateNode::Component(outer) = &root.fragment.nodes[0] else {
        panic!("expected outer component");
    };
    let inner = outer
        .fragment
        .nodes
        .iter()
        .find_map(|node| match node {
            TemplateNode::Component(component) => Some(component),
            _ => None,
        })
        .expect("inner component");
    let Some(Attribute::SpreadAttribute(spread)) = inner.attributes.last() else {
        panic!("expected spread attribute");
    };

    assert!(spread.metadata.expression.has_state());
    assert!(!spread.metadata.expression.has_call());
}
