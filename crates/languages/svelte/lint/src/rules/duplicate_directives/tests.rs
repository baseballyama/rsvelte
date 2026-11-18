use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::Severity;
use rsvelte_kernel::source::document::Document;

use crate::{Configuration, LintSettings};

fn messages(code: &str) -> Vec<String> {
    let mut registry = Registry::new();
    crate::register_artifacts(&mut registry);
    let mut configuration = Configuration::new(LintSettings::default());
    configuration
        .rule("svelte/no-dupe-on-directives", Severity::Error, &[], &[])
        .expect("configures");
    let document = Document::new("test.svelte".to_owned(), code.to_owned()).expect("small");
    let context = DocumentContext::new(&document, registry.artifacts());
    crate::lint(&context, &configuration)
        .expect("parses")
        .into_iter()
        .map(|f| f.diagnostic.message)
        .collect()
}

// The oracle names lines 5 and 4: a lone CR ends a line for `ESLint`.
#[test]
fn a_lone_cr_ends_the_line_a_message_names() {
    let code = "<script>\r\tlet h = () => {};\r</script>\r<b on:click={h}\ron:click={h}>x</b>\r";
    assert_eq!(
        messages(code),
        [
            "This `on:click` directive is the same and duplicate directives in L5.",
            "This `on:click` directive is the same and duplicate directives in L4.",
        ]
    );
}
