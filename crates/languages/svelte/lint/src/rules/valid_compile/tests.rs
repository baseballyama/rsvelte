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

/// Each finding's code, line and 0-based column, as `svelte`'s `compile` prints its warnings.
fn codes(code: &str) -> Vec<(String, u32, u32)> {
    let mut found: Vec<_> = lint(code)
        .into_iter()
        .map(|(line, column, message)| {
            let code = message
                .rsplit_once('(')
                .expect("a code")
                .1
                .trim_end_matches(')')
                .to_owned();
            (code, line, column - 1)
        })
        .collect();
    found.sort_by_key(|a| (a.1, a.2));
    found
}

#[test]
fn checks_attributes_as_the_compiler_does() {
    let code = "<div tabindex></div>
<div tabindex=\"1\"></div>
<div tabindex=\"+2e0\"></div>
<div tabindex=\"abc\"></div>
<div tabindex={3}></div>
<td scope=\"row\"></td>
<th scope=\"row\"></th>
<svelte:element this={\"td\"} scope=\"x\" accesskey=\"k\"></svelte:element>
<svelte:element this=\"{tag}\"></svelte:element>
<svelte:element this=\"td\"></svelte:element>
<div ACCESSKEY=\"a\" TabIndex=\"0x1\"></div>
";
    let expected = [
        ("a11y_no_noninteractive_tabindex", 1, 0),
        ("a11y_positive_tabindex", 1, 5),
        ("a11y_no_noninteractive_tabindex", 2, 0),
        ("a11y_positive_tabindex", 2, 5),
        ("a11y_no_noninteractive_tabindex", 3, 0),
        ("a11y_positive_tabindex", 3, 5),
        ("a11y_no_noninteractive_tabindex", 5, 0),
        ("a11y_misplaced_scope", 6, 4),
        ("a11y_accesskey", 8, 38),
        ("svelte_element_invalid_this", 10, 16),
        ("a11y_accesskey", 11, 5),
        ("a11y_positive_tabindex", 11, 19),
    ];
    let expected: Vec<_> = expected
        .iter()
        .map(|&(code, line, column)| (code.to_owned(), line, column))
        .collect();
    assert_eq!(codes(code), expected);
}

#[test]
fn codes_separated_by_wide_spaces() {
    let found = codes(
        "<!-- svelte-ignore a11y_autofocus\u{3000}a11y_accesskey\u{a0}x -->\n<div accesskey=\"x\"></div>\n",
    );
    assert_eq!(found, []);
}

/// Seconds to lint `code`. A file of 16000 warnings takes well under one when no per-warning
/// work scans the whole file, and tens when it does.
fn seconds(code: String, comment_directive: bool) -> f64 {
    let mut registry = Registry::new();
    crate::register_artifacts(&mut registry);
    let mut configuration = Configuration::new(LintSettings::default());
    configuration
        .rule("svelte/valid-compile", Severity::Error, &[], &[])
        .expect("configures");
    if comment_directive {
        configuration
            .rule("svelte/comment-directive", Severity::Error, &[], &[])
            .expect("configures");
    }
    let document = Document::new("test.svelte".to_owned(), code).expect("small");
    let context = DocumentContext::new(&document, registry.artifacts());
    assert!(context.get::<rsvelte_svelte::Warned>().is_some());
    let started = std::time::Instant::now();
    crate::lint(&context, &configuration).expect("parses");
    started.elapsed().as_secs_f64()
}

const MANY: usize = 16000;

#[test]
fn many_ignored_warnings_take_linear_time() {
    let code = "<!-- svelte-ignore a11y_missing_attribute -->\n<img src=\"x\">\n".repeat(MANY);
    let seconds = seconds(code, false);
    assert!(seconds < 5.0, "{seconds}");
}

#[test]
fn many_line_directives_take_linear_time() {
    let code =
        "<!-- eslint-disable-next-line svelte/valid-compile -->\n<img src=\"x\">\n".repeat(MANY);
    let seconds = seconds(code, true);
    assert!(seconds < 5.0, "{seconds}");
}

#[test]
fn many_ignored_script_warnings_take_linear_time() {
    let mut lets = String::new();
    for i in 0..MANY {
        lets.push_str("// svelte-ignore export_let_unused\nexport let a");
        lets.push_str(&i.to_string());
        lets.push_str(";\n");
    }
    let seconds = seconds(format!("<script>\n{lets}</script>\n"), false);
    assert!(seconds < 5.0, "{seconds}");
}
