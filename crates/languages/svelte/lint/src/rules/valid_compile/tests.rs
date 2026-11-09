//! A style sheet that does not parse, which upstream's fixtures do not cover. Positions are where
//! `svelte`'s `compile` reports the same input's error; the code and message are rsvelte's.

use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::Severity;
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::LineIndex;

use crate::{Configuration, LintSettings};

/// Each finding's line, 1-based column and message.
fn lint(code: &str) -> Vec<(u32, u32, String)> {
    let mut registry = Registry::new();
    crate::register_artifacts(&mut registry);
    let mut configuration = Configuration::new(LintSettings::default());
    configuration
        .rule("svelte/valid-compile", Severity::Error, &[], &[])
        .expect("configures");
    let document = Document::new("test.svelte".to_owned(), code.to_owned()).expect("small");
    let context = DocumentContext::new(&document, registry.artifacts());
    let lines = LineIndex::new(code);
    crate::lint(&context, &configuration)
        .expect("parses")
        .into_iter()
        .map(|f| {
            let at = lines.line_column(f.diagnostic.span.start_offset);
            (at.line, at.column + 1, f.diagnostic.message)
        })
        .collect()
}

const BROKEN: &str = "<style>\n  .foo > {} \n</style>\n";

#[test]
fn reports_the_style_sheet_error_as_the_only_finding() {
    let found = lint(&format!("<p>x</p>\n{BROKEN}"));
    assert_eq!(found.len(), 1, "{found:?}");
    assert_eq!((found[0].0, found[0].1), (3, 10), "{found:?}");
    assert!(found[0].2.ends_with("(css_parse_error)"), "{found:?}");
}

#[test]
fn the_style_sheet_error_wins_over_an_earlier_analysis_error() {
    let found = lint(&format!(
        "<script>\n  let $x = 1;\n</script>\n<p>x</p>\n{BROKEN}"
    ));
    assert_eq!(found.len(), 1, "{found:?}");
    assert_eq!((found[0].0, found[0].1), (6, 10), "{found:?}");
}

#[test]
fn a_style_in_another_language_is_not_parsed() {
    let found = lint(&format!(
        "<p>x</p>\n{}",
        BROKEN.replace("<style>", "<style lang=\"scss\">")
    ));
    assert_eq!(found, []);
}
