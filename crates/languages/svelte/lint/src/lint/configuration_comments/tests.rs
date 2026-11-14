use rsvelte_kernel::diagnostics::Severity;

use super::*;
use crate::lint::verify;

fn read(text: &str) -> Vec<String> {
    let comment = Span::new(0, u32::try_from(text.len()).expect("short"));
    settings(&[comment], text)
        .into_iter()
        .map(|(name, setting)| match setting {
            Setting::Off => format!("{name} off"),
            Setting::On(severity, options) => {
                let options: Vec<&str> = options.iter().flatten().map(|o| o.get()).collect();
                format!("{name} {severity:?} {options:?}")
            }
        })
        .collect()
}

#[test]
fn a_comment_reads_as_eslint_parses_json_like_text() {
    assert_eq!(
        read(r#"/* eslint svelte/prefer-const: ["warn", { "destructuring": "all" }] */"#),
        [r#"svelte/prefer-const Warning ["{ \"destructuring\": \"all\" }"]"#]
    );
    assert_eq!(
        read(r#"/* eslint "no-unused-vars": 2, svelte/indent: "off" */"#),
        ["no-unused-vars Error []", "svelte/indent off"]
    );
    // Without commas: a name before `:` is quoted, and the first `]` before a `"` gets one.
    assert_eq!(
        read(r#"/* eslint a: [1, 2] "b": 0 -- why */"#),
        ["a Warning [\"2\"]", "b off"]
    );
    assert_eq!(read(r#"/* eslint a: ["warn"] */"#), ["a Warning []"]);
}

#[test]
fn a_comment_that_is_not_a_configuration_sets_nothing() {
    assert_eq!(read("/* eslint-disable a */"), [""; 0]);
    assert_eq!(read("// eslint a: 2"), [""; 0]);
    assert_eq!(read("/* eslint a: 3 */"), [""; 0]);
    assert_eq!(read("/* eslint a: [} */"), [""; 0]);
    assert_eq!(read("/* eslintx a: 2 */"), [""; 0]);
}

#[test]
fn a_comment_sets_a_rule_for_its_file() {
    let mut configuration = Configuration::new(crate::LintSettings::default());
    configuration
        .rule("svelte/prefer-const", Severity::Error, &[], &[])
        .expect("known");
    let names = |source: &str| -> Vec<String> {
        verify(source, &configuration, "A.svelte")
            .expect("parses")
            .into_iter()
            .map(|f| format!("{} {:?}", f.diagnostic.code, f.diagnostic.severity))
            .collect()
    };
    let source = "<script>\n\tlet { p, q } = {};\n\tp = 1;\n</script>\n";
    assert_eq!(names(source), ["svelte/prefer-const Error"]);
    let all = r#"<script>/* eslint svelte/prefer-const: ["warn", { "destructuring": "all" }] */"#;
    assert_eq!(names(&source.replacen("<script>", all, 1)), [""; 0]);
    let warn = "<script>/* eslint svelte/prefer-const: 1 */";
    assert_eq!(
        names(&source.replacen("<script>", warn, 1)),
        ["svelte/prefer-const Warning"]
    );
    let off = "<script>/* eslint svelte/prefer-const: \"off\" */";
    assert_eq!(names(&source.replacen("<script>", off, 1)), [""; 0]);
    let on = "<script>/* eslint svelte/button-has-type: 2 */";
    assert_eq!(
        names(&format!(
            "{}<button></button>\n",
            source.replacen("<script>", on, 1)
        )),
        ["svelte/prefer-const Error", "svelte/button-has-type Error"]
    );
}
