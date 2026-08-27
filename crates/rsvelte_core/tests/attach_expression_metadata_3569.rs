//! Issue #3569: `AttachTag` owns expression metadata populated by Phase 2, so
//! Phase 3 must not maintain a second implementation of the same decisions.

use rsvelte_core::{
    CompileOptions, ParseOptions,
    ast::{
        arena::SerializeArenaGuard,
        template::{Attribute, TemplateNode},
    },
    compiler::phases::analyze_component,
    parse,
};

fn attach_flags(source: &str) -> (bool, bool) {
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
        TemplateNode::SvelteBody(element) => &element.attributes,
        other => panic!("expected an element host, got {other:?}"),
    };
    let Some(Attribute::AttachTag(attach)) = attributes.last() else {
        panic!("expected attach tag");
    };

    (
        attach.metadata.expression.has_state(),
        attach.metadata.expression.has_call(),
    )
}

#[test]
fn every_legal_host_populates_local_call_metadata() {
    for source in [
        "<script>function make() {}</script><div {@attach make()}></div>",
        "<script>function make() {}</script><Widget {@attach make()} />",
        "<script>function make() {}</script><svelte:component this={Widget} {@attach make()} />",
        "<script>function make() {}</script><svelte:element this=\"div\" {@attach make()} />",
        "<script>function make() {}</script><svelte:body {@attach make()} />",
    ] {
        assert_eq!(attach_flags(source), (true, true), "{source}");
    }
}

#[test]
fn global_call_is_not_promoted_to_an_impure_call() {
    let source = "<div {@attach globalThis.make()}></div>";
    assert_eq!(attach_flags(source), (false, false));
}

#[test]
fn state_reference_does_not_invent_a_call() {
    let source = "<script>let attachment = $state();</script><div {@attach attachment}></div>";
    assert_eq!(attach_flags(source), (true, false));
}

#[test]
fn call_initialized_binding_is_reactive_without_inventing_a_call_at_the_read() {
    let source =
        "<script>const attachment = make_attachment();</script><div {@attach attachment}></div>";
    assert_eq!(attach_flags(source), (true, false));
}

#[test]
fn legacy_props_member_is_reactive_without_a_scope_binding() {
    let source = "<div {@attach $$props.attach}></div>";
    assert_eq!(attach_flags(source), (true, false));
}

#[test]
fn runes_prop_binding_is_reactive_without_inventing_a_call() {
    let source = "<script>let { attach } = $props();</script><div {@attach attach}></div>";
    assert_eq!(attach_flags(source), (true, false));
}
