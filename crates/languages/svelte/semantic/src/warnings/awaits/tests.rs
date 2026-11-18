use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::source::document::Document;
use rsvelte_svelte_syntax::Parsed;

use crate::{Lowered, Resolved};

/// The text of each `await` in `code` that suspends rendering.
fn suspending(code: &str) -> Vec<String> {
    let mut registry = Registry::new();
    crate::register(&mut registry);
    let document = Document::new("Test.svelte".to_owned(), code.to_owned()).expect("small");
    let context = DocumentContext::new(&document, registry.artifacts());
    let component = context.get::<Parsed>().as_ref().expect("parses");
    let lowered = context.get::<Lowered>().as_ref().expect("lowers");
    let resolution = context.get::<Resolved>().as_ref().expect("resolves");
    super::suspending_awaits(component, lowered, resolution)
        .into_iter()
        .map(|span| span.text(code).to_owned())
        .collect()
}

#[test]
fn awaits_suspend_at_the_top_of_the_instance_and_the_template_and_in_a_derived() {
    let cases: [(&str, &[&str]); 7] = [
        ("<p>{x}</p>", &[]),
        ("<p>{await x}</p>", &["await x"]),
        ("<button onclick={async () => await x}></button>", &[]),
        ("<script>let y = await x;</script>", &["await x"]),
        ("<script>async function f() { await x; }</script>", &[]),
        ("<script module>let y = await x;</script>", &[]),
        (
            "<script module>let y = $derived(await x);</script>",
            &["await x"],
        ),
    ];
    for (code, expected) in cases {
        assert_eq!(suspending(code), expected, "{code}");
    }
}
