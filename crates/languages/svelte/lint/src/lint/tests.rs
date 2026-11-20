use rsvelte_kernel::computation::pipeline::{RunOptions, Sharing, run};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::source::document::{Document, DocumentError};
use rsvelte_kernel::source::positions::Span;

use super::*;
use crate::rule::JavaScriptComment;

/// Lints one source, as `ESLint`'s `Linter.verify(code, config, filename)` does with
/// `eslint-plugin-svelte`. `filename` is where rules that look at the path read it.
pub(super) fn verify(
    source_text: &str,
    configuration: &Configuration,
    filename: &str,
) -> Result<Vec<Finding>, Diagnostic> {
    let mut registry = Registry::new();
    crate::register(&mut registry);
    let document = Document::new(filename.to_owned(), source_text.to_owned()).map_err(
        |DocumentError::TooLarge(n)| {
            Diagnostic::error(
                "svelte.lint.too_large",
                format!("the source is {n} bytes, too long for 32-bit positions"),
                Span::new(0, 0),
            )
        },
    )?;
    lint(
        &DocumentContext::new(&document, registry.artifacts()),
        configuration,
    )
}

/// `text` as one whole JavaScript comment, `//` or `/* */`.
pub(super) fn comment(text: &str) -> JavaScriptComment {
    let end = u32::try_from(text.len()).expect("short");
    let block = text.starts_with("/*");
    let value = Span::new(2, if block { end - 2 } else { end });
    JavaScriptComment {
        span: Span::new(0, end),
        value,
        block,
    }
}

const SOURCE: &str = "<script>let unused = 1;</script>\n<button>x</button>\n";

#[test]
fn verify_finds_what_the_task_reports() {
    let found = verify(SOURCE, &Configuration::default(), "A.svelte").expect("parses");
    assert!(
        found
            .iter()
            .any(|f| f.diagnostic.code == "svelte/button-has-type"),
        "{found:?}"
    );
    let mut registry = Registry::new();
    crate::register(&mut registry);
    let document = registry.document("A.svelte", SOURCE).expect("small");
    let result = run(
        &registry,
        &[document],
        &RunOptions {
            tasks: &["svelte.lint/default"],
            sharing: Sharing::Shared,
            threads: Some(1),
        },
    )
    .expect("valid plugins")
    .remove(0);
    let (_, output) = result.outputs.into_iter().next().expect("the task ran");
    let json = &output.files[0].text;
    for f in &found {
        assert!(
            json.contains(&format!("\"{}\"", f.diagnostic.code)),
            "{json}"
        );
    }
}

#[test]
fn verify_reports_a_parse_error() {
    let error = verify("<p>{</p>", &Configuration::default(), "A.svelte").expect_err("broken");
    assert_ne!(error.message, "");
}
