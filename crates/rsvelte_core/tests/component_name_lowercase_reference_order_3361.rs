//! Regression coverage for #3361: upstream completes scope reference collection
//! before analysis visitors run, so `component_name_lowercase` cannot depend on
//! whether a reference appears before or after the lowercase element.

use rsvelte_core::{CompileOptions, compile};

fn warning_codes(template: &str) -> Vec<String> {
    let source = format!("<script>import foo from './Foo.svelte';</script>\n{template}");
    compile(
        &source,
        CompileOptions {
            filename: Some("ReferenceOrder.svelte".to_string()),
            ..Default::default()
        },
    )
    .expect("compile")
    .warnings
    .into_iter()
    .map(|warning| warning.code)
    .collect()
}

fn has_lowercase_warning(template: &str) -> bool {
    warning_codes(template)
        .iter()
        .any(|code| code == "component_name_lowercase")
}

#[test]
fn later_reference_suppresses_lowercase_component_warning() {
    assert!(!has_lowercase_warning("<foo />\n{foo}"));
}

#[test]
fn earlier_reference_still_suppresses_lowercase_component_warning() {
    assert!(!has_lowercase_warning("{foo}\n<foo />"));
}

#[test]
fn unused_import_still_reports_lowercase_component_warning() {
    assert!(has_lowercase_warning("<foo />"));
}
