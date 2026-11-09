use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::Severity;
use rsvelte_kernel::source::document::Document;

/// How many times `svelte/no-inspect`, which runs only in runes mode, reports.
fn inspect_reports(source_text: &str) -> usize {
    let mut registry = Registry::new();
    crate::register(&mut registry);
    let document =
        Document::new("test.svelte".to_owned(), source_text.to_owned()).expect("valid source");
    let context = DocumentContext::new(&document, registry.artifacts());
    let mut configuration = crate::Configuration::new(crate::LintSettings::default());
    configuration
        .rule("svelte/no-inspect", Severity::Error, &[], &[])
        .expect("a known rule");
    crate::lint(&context, &configuration)
        .expect("source parses")
        .len()
}

#[test]
fn a_rune_named_in_the_template_alone_turns_runes_mode_on() {
    // ESLint with eslint-plugin-svelte reports this once: `hasRunesSymbol` walks the template.
    assert_eq!(inspect_reports("<p>{$inspect}</p>\n"), 1);
    assert_eq!(inspect_reports("<p>{inspect}</p>\n"), 0);
}

#[test]
fn a_boolean_svelte_options_runes_decides_before_the_symbols() {
    let source = "<svelte:options runes={false} />\n<p>{$inspect}</p>\n";
    assert_eq!(inspect_reports(source), 0);
    let source = "<svelte:options runes />\n<script>\n$inspect(1);\n</script>\n";
    assert_eq!(inspect_reports(source), 1);
}
