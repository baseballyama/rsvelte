use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::Severity;
use rsvelte_kernel::source::document::Document;
use serde_json::value::RawValue;

/// Where `svelte/block-lang` reports a missing `<script lang="ts">`.
fn missing_script_at(source_text: &str) -> Vec<u32> {
    let mut registry = Registry::new();
    crate::register(&mut registry);
    let document =
        Document::new("test.svelte".to_owned(), source_text.to_owned()).expect("valid source");
    let context = DocumentContext::new(&document, registry.artifacts());
    let mut configuration = crate::Configuration::new(crate::LintSettings::default());
    let options =
        RawValue::from_string(r#"{"enforceScriptPresent":true,"script":"ts"}"#.to_owned())
            .expect("JSON options");
    configuration
        .rule("svelte/block-lang", Severity::Error, &[options], &[])
        .expect("a known rule");
    crate::lint(&context, &configuration)
        .expect("source parses")
        .iter()
        .map(|f| f.diagnostic.span.start_offset)
        .collect()
}

#[test]
fn a_missing_block_is_reported_at_a_position_of_the_first_line() {
    // The second character of the first line, a character boundary.
    assert_eq!(missing_script_at("<div></div>\n"), [1]);
    assert_eq!(missing_script_at("日本\n"), [3]);
    // Without a second character, the end of the first line.
    assert_eq!(missing_script_at(""), [0]);
    assert_eq!(missing_script_at("\n<div></div>\n"), [0]);
    assert_eq!(missing_script_at("日\n<div></div>\n"), [3]);
}
