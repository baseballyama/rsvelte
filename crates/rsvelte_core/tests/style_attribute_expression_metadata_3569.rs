//! Issue #3569: each expression inside a regular `style=` attribute carries
//! Phase 2 call, await, member, and dependency metadata consumed by the client
//! style transform. State routing remains with the client scope evaluator until
//! Phase 2 can represent its compile-time-known result exactly.

use rsvelte_core::{
    CompileOptions, ParseOptions,
    ast::{
        arena::SerializeArenaGuard,
        template::{Attribute, AttributeValue, AttributeValuePart, TemplateNode},
    },
    compiler::phases::analyze_component,
    parse,
};

fn style_flags(source: &str) -> Vec<(bool, bool, bool)> {
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
        TemplateNode::SvelteElement(element) => &element.attributes,
        other => panic!("expected an element host, got {other:?}"),
    };
    let Some(Attribute::Attribute(attribute)) = attributes.last() else {
        panic!("expected regular style attribute");
    };
    assert_eq!(attribute.name.as_str(), "style");

    let metadata = match &attribute.value {
        AttributeValue::Expression(tag) => vec![&tag.metadata.expression],
        AttributeValue::Sequence(parts) => parts
            .iter()
            .filter_map(|part| match part {
                AttributeValuePart::ExpressionTag(tag) => Some(&tag.metadata.expression),
                AttributeValuePart::Text(_) => None,
            })
            .collect(),
        AttributeValue::True(_) => panic!("expected style expression"),
    };

    metadata
        .into_iter()
        .map(|metadata| {
            (
                metadata.has_state(),
                metadata.has_call(),
                metadata.has_member_expression(),
            )
        })
        .collect()
}

#[test]
fn every_transformed_host_populates_local_call_metadata() {
    for source in [
        "<script>function make() {}</script><div style={make()}></div>",
        "<script>function make() {}</script><svelte:element this=\"div\" style={make()} />",
    ] {
        assert_eq!(style_flags(source), vec![(true, true, false)], "{source}");
    }
}

#[test]
fn every_expression_chunk_keeps_its_own_metadata() {
    let source = "<script>let color = $state(); function make() {}</script><div style=\"color:{color};width:{make().width}px\"></div>";
    assert_eq!(
        style_flags(source),
        vec![(true, false, false), (true, true, true)]
    );
}

#[test]
fn global_call_is_not_promoted_to_an_impure_call() {
    assert_eq!(
        style_flags("<div style={globalThis.make()}></div>"),
        vec![(false, false, true)]
    );
}
