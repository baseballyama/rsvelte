use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::source::document::Document;
use rsvelte_svelte_syntax::Parsed;

use super::super::{Options, warnings};
use crate::{Analyzed, Lowered, Resolved};

/// The source text of each warning `svelte.compile` with `runes: true` emits, in order.
fn warned(code: &str) -> Vec<String> {
    let mut registry = Registry::new();
    crate::register(&mut registry);
    let document = Document::new("Test.svelte".to_owned(), code.to_owned()).expect("small");
    let context = DocumentContext::new(&document, registry.artifacts());
    let options = Options {
        runes: Some(true),
        custom_element: false,
    };
    let found = warnings(
        context.get::<Parsed>().as_ref().expect("parses"),
        context.get::<Lowered>().as_ref().expect("lowers"),
        context.get::<Resolved>().as_ref().expect("resolves"),
        context.get::<Analyzed>().as_ref(),
        code,
        "Test.svelte",
        options,
    );
    found
        .compiled()
        .map(|w| w.span.text(code).to_owned())
        .collect()
}

#[test]
fn a_component_visits_its_default_slot_before_its_named_slots() {
    let code = "<C>\n<b slot=\"x\"><p /></b>\n<em />\n<C><i slot=\"y\"><q /></i><s /></C>\n</C>";
    assert_eq!(warned(code), ["<em />", "<s />", "<q />", "<p />"]);
}

#[test]
fn the_default_children_on_both_sides_of_a_named_slot_come_first() {
    let code = "<C>\n<em />\n<b slot=\"x\"><p /></b>\n<i />\n</C>";
    assert_eq!(warned(code), ["<em />", "<i />", "<p />"]);
}
