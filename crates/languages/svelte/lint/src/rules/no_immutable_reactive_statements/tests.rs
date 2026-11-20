use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::Severity;
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::LineIndex;
use rsvelte_typescript_semantic::globals::{Declared, Setting};

use crate::{Configuration, LintSettings};

/// The `line:column` of each finding on a TypeScript component whose script is `script`, with
/// `Foo` configured as `foo`.
fn reports(script: &str, foo: Option<Setting>) -> Vec<String> {
    let code = format!("<script lang=\"ts\">\n{script}\n</script>\n{{b}}\n");
    let mut registry = Registry::new();
    crate::register_artifacts(&mut registry);
    let mut configuration = Configuration::new(LintSettings::default());
    configuration.declare_globals(Declared::with_settings(foo.map(|setting| ("Foo", setting))));
    configuration
        .rule(
            "svelte/no-immutable-reactive-statements",
            Severity::Error,
            &[],
            &[],
        )
        .expect("configures");
    let document = Document::new("Input.svelte".to_owned(), code.clone()).expect("small");
    let context = DocumentContext::new(&document, registry.artifacts());
    let lines = LineIndex::new(&code);
    crate::lint(&context, &configuration)
        .expect("parses")
        .into_iter()
        .map(|finding| {
            let at = lines.line_column(finding.diagnostic.span.start_offset);
            format!("{}:{}", at.line, at.column + 1)
        })
        .collect()
}

#[test]
fn a_type_reference_no_global_declares_makes_the_statement_reactive() {
    // ESLint 10.14.0, eslint-plugin-svelte 3.23.1, @typescript-eslint/parser 8.72.1, runes off.
    let cases: &[(&str, Option<Setting>, Option<&str>)] = &[
        ("const a = 1;\n$: b = a as unknown as Foo;", None, None),
        (
            "const a = 1;\n$: b = a as unknown as Array<Foo>;",
            None,
            None,
        ),
        ("const a = 1;\n$: b = a as unknown as Foo.Bar;", None, None),
        ("const a = 1;\n$: b = a satisfies Foo;", None, None),
        (
            "const a = 1;\n$: b = a as unknown as typeof foo;",
            None,
            None,
        ),
        ("const a = 1;\n$: b = a as unknown as $$Props;", None, None),
        (
            "const a = 1;\n$: b = a as unknown as Foo;",
            Some(Setting::Off),
            None,
        ),
        (
            "const a = 1;\n$: b = a as unknown as Foo;",
            Some(Setting::Readonly),
            Some("3:8"),
        ),
        (
            "/* global Foo */\nconst a = 1;\n$: b = a as unknown as Foo;",
            None,
            Some("4:8"),
        ),
        (
            "const a = 1;\n$: b = a as unknown as Partial<{}>;",
            None,
            Some("3:8"),
        ),
        (
            "/* global Partial:off */\nconst a = 1;\n$: b = a as unknown as Partial<{}>;",
            None,
            Some("4:8"),
        ),
        (
            "const a = 1;\n$: b = a as unknown as typeof Math;",
            None,
            Some("3:8"),
        ),
        ("const a = 1;\n$: b = (PropertyKey, a);", None, None),
        (
            "type T = number;\nconst a = 1;\n$: b = a as T;",
            None,
            Some("4:8"),
        ),
        (
            "interface I {}\nconst a = 1;\n$: b = a as unknown as I;",
            None,
            Some("4:8"),
        ),
        (
            "const x = 1;\nconst a = 1;\n$: b = a as unknown as typeof x;",
            None,
            Some("4:8"),
        ),
        (
            "let x = 1;\nx = 2;\nconst a = 1;\n$: b = a as unknown as typeof x;",
            None,
            None,
        ),
    ];
    for &(script, foo, at) in cases {
        let expected: Vec<String> = at.map(str::to_owned).into_iter().collect();
        assert_eq!(reports(script, foo), expected, "{script}");
    }
}
