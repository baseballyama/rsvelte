use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::computation::task::{Task, TaskOutput};
use rsvelte_kernel::diagnostics::Severity;
use rsvelte_kernel::source::document::Document;

use super::{Lint, register_with_configuration};
use crate::computation::SameNamedFile;
use crate::{Configuration, LintSettings};

/// `ESLint` ends a line at a lone CR and at U+2028, so the trailing space after `b` is on line 3.
#[test]
fn positions_count_ecmascript_lines() {
    let mut configuration = Configuration::new(LintSettings::default());
    configuration
        .rule("svelte/no-trailing-spaces", Severity::Error, &[], &[])
        .expect("a built-in rule");
    let mut registry = Registry::new();
    register_with_configuration(&mut registry, configuration);
    let document = Document::new("App.svelte".to_owned(), "<p>\ra\u{2028}b \n</p>".to_owned())
        .expect("a small document");
    let context = DocumentContext::new(&document, registry.artifacts());
    let mut out = TaskOutput::default();
    Lint { modules: false }.run(&context, &mut out);
    let json: serde_json::Value =
        serde_json::from_str(&out.files[0].text).expect("the report is JSON");
    let start = &json["findings"][0]["start"];
    assert_eq!(
        (start["line"].as_u64(), start["column"].as_u64()),
        (Some(3), Some(2))
    );
}

/// Lints `document` with only `rule` on, after `extra` registers more, and returns the report and
/// what the document computed.
fn lint_with(
    rule: &str,
    document: &Document,
    extra: impl FnOnce(&mut Registry),
) -> (serde_json::Value, Vec<&'static str>) {
    let mut configuration = Configuration::new(LintSettings::default());
    configuration
        .rule(rule, Severity::Error, &[], &[])
        .expect("a built-in rule");
    let mut registry = Registry::new();
    register_with_configuration(&mut registry, configuration);
    extra(&mut registry);
    let context = DocumentContext::new(document, registry.artifacts());
    let mut out = TaskOutput::default();
    Lint { modules: true }.run(&context, &mut out);
    let json = serde_json::from_str(&out.files[0].text).expect("the report is JSON");
    (json, context.computed())
}

#[test]
fn a_host_answers_the_same_named_file() {
    let document = Document::new("/nowhere/Foo.svelte".to_owned(), "<p></p>".to_owned())
        .expect("a small document");
    let (json, computed) = lint_with("svelte/no-conflicting-module-names", &document, |r| {
        r.provide::<SameNamedFile>("host", |_| true, |_| Some("Foo.svelte.ts".to_owned()));
    });
    assert_eq!(json["findings"].as_array().map(Vec::len), Some(1));
    assert!(!computed.contains(&"svelte.lint.same_named_file_on_disk"));
}

#[test]
fn other_rules_do_not_look_for_a_same_named_file() {
    let document = Document::new("Foo.svelte".to_owned(), "<button></button>".to_owned())
        .expect("a small document");
    let (_, computed) = lint_with("svelte/button-has-type", &document, |_| {});
    assert_eq!(computed, ["svelte.lint.configuration", "svelte.parse"]);
}

#[test]
fn a_jsx_module_is_linted() {
    let document = Document::new(
        "/nowhere/Foo.svelte.tsx".to_owned(),
        "export const a = <div class=\"b\">{c as number}</div>;".to_owned(),
    )
    .expect("a small document");
    assert!(Lint { modules: true }.applies(&document));
    let (json, _) = lint_with("svelte/no-conflicting-module-names", &document, |r| {
        r.provide::<SameNamedFile>("host", |_| true, |_| Some("Foo.svelte".to_owned()));
    });
    assert_eq!(json["findings"].as_array().map(Vec::len), Some(1), "{json}");
}
