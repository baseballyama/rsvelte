use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::Severity;
use rsvelte_kernel::source::document::Document;
use serde_json::value::RawValue;

/// The messages `svelte/max-lines-per-block` reports with `options`.
fn messages(source_text: &str, options: &str) -> Vec<String> {
    let mut registry = Registry::new();
    crate::register(&mut registry);
    let document =
        Document::new("test.svelte".to_owned(), source_text.to_owned()).expect("valid source");
    let context = DocumentContext::new(&document, registry.artifacts());
    let mut configuration = crate::Configuration::new(crate::LintSettings::default());
    let options = RawValue::from_string(options.to_owned()).expect("JSON options");
    configuration
        .rule(
            "svelte/max-lines-per-block",
            Severity::Error,
            &[options],
            &[],
        )
        .expect("a known rule");
    crate::lint(&context, &configuration)
        .expect("source parses")
        .iter()
        .map(|f| f.diagnostic.message.clone())
        .collect()
}

#[test]
fn lines_end_at_every_ecmascript_line_terminator() {
    let expected = ["<script> block has too many lines (3). Maximum allowed is 2."];
    for terminator in ["\n", "\r\n", "\r", "\u{2028}", "\u{2029}"] {
        let source = "<script>\nlet a;\nlet b;\nlet c;\n</script>\n".replace('\n', terminator);
        assert_eq!(
            messages(&source, r#"{"script":2}"#),
            expected,
            "{terminator:?}"
        );
    }
}

#[test]
fn a_line_of_u0085_is_not_blank() {
    let options = r#"{"script":1,"skipBlankLines":true}"#;
    assert_eq!(
        messages("<script>\nlet a;\n\u{85}\n</script>\n", options),
        ["<script> block has too many lines (2). Maximum allowed is 1."]
    );
    assert_eq!(
        messages("<script>\nlet a;\n\u{feff}\n</script>\n", options),
        [""; 0]
    );
}

#[test]
fn blank_text_that_ends_the_file_is_not_a_template() {
    let options = r#"{"template":1}"#;
    let report = |n: u32| {
        vec![format!(
            "template block has too many lines ({n}). Maximum allowed is 1."
        )]
    };
    assert_eq!(
        messages("<script>\nlet a;\n</script>\n\n\n", options),
        Vec::<String>::new()
    );
    assert_eq!(
        messages("\n\n<script>\nlet a;\n</script>\n", options),
        report(3)
    );
    assert_eq!(
        messages(
            "<script>\nlet a;\n</script>\n\n\n<style>\n</style>\n",
            options
        ),
        report(3)
    );
    assert_eq!(
        messages("<script>\nlet a;\n</script>\n\n<div></div>\n\n\n", options),
        report(5)
    );
    assert_eq!(
        messages("<script>\nlet a;\n</script>\n \n<!-- c -->\n", options),
        report(3)
    );
}
