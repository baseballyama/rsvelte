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
    // The template's JavaScript syntax errors fail the parse whatever rules run.
    assert_eq!(
        computed,
        [
            "svelte.lint.configuration",
            "svelte.parse",
            "svelte.resolve",
            "svelte.compiler_syntax_tree"
        ]
    );
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

/// Svelte's parser reads the template's expressions, so their syntax errors stop `ESLint` as the
/// markup's do; a name the template declares twice is the analysis's `declaration_duplicate`.
#[test]
fn a_syntax_error_in_the_template_fails_the_parse() {
    let report = |source: &str| {
        let document =
            Document::new("App.svelte".to_owned(), source.to_owned()).expect("a small document");
        lint_with("svelte/valid-compile", &document, |_| {}).0
    };
    let json = report("{#await p catch [eval]}x{/await}\n");
    assert_eq!(json["findings"].as_array().map(Vec::len), Some(1), "{json}");
    assert!(json["findings"][0]["rule"].is_null(), "{json}");
    assert_eq!(json["findings"][0]["start"]["column"].as_u64(), Some(17));
    let twice = report("{#snippet s()}a{/snippet}\n{#snippet s()}b{/snippet}\n");
    assert_eq!(
        twice["rules"][0].as_str(),
        Some("svelte/valid-compile"),
        "{twice}"
    );
}

/// svelte-eslint-parser reads a script the compiler rejects as TypeScript, so the rules see a
/// generic arrow function while valid-compile reports the compiler's error.
#[test]
fn the_rules_read_a_script_the_compiler_rejects_as_typescript() {
    let mut configuration = Configuration::new(LintSettings::default());
    for rule in ["svelte/valid-compile", "no-unused-vars"] {
        configuration
            .rule(rule, Severity::Error, &[], &[])
            .expect("a built-in rule");
    }
    let mut registry = Registry::new();
    register_with_configuration(&mut registry, configuration);
    let document = Document::new(
        "App.svelte".to_owned(),
        "<script>const y = <string>() => 1;</script><p>{y}</p>".to_owned(),
    )
    .expect("a small document");
    let context = DocumentContext::new(&document, registry.artifacts());
    let mut out = TaskOutput::default();
    Lint { modules: false }.run(&context, &mut out);
    let json: serde_json::Value =
        serde_json::from_str(&out.files[0].text).expect("the report is JSON");
    let findings: Vec<_> = (json["findings"].as_array().expect("findings").iter())
        .map(|f| (f["rule"].as_str(), f["start"]["column"].as_u64()))
        .collect();
    assert_eq!(
        findings,
        [
            (Some("svelte/valid-compile"), Some(19)),
            (Some("no-unused-vars"), Some(20))
        ]
    );
}

/// What typescript-eslint throws at a script's end depends on the code of the template's
/// expressions, so lint refuses the script rather than guess.
#[test]
fn an_error_at_a_scripts_end_is_refused() {
    let mut registry = Registry::new();
    register_with_configuration(&mut registry, Configuration::new(LintSettings::default()));
    let document = Document::new(
        "App.svelte".to_owned(),
        "<script>const a = </script><p>{1}</p>".to_owned(),
    )
    .expect("a small document");
    let context = DocumentContext::new(&document, registry.artifacts());
    let mut out = TaskOutput::default();
    Lint { modules: false }.run(&context, &mut out);
    assert_eq!((out.files.len(), out.diagnostics.len()), (0, 1));
}

/// Upstream's `svelte/indent` throws on this enum; this crate indents it as in a TypeScript script.
#[test]
fn an_enum_in_a_plain_script_is_indented() {
    let document = Document::new(
        "App.svelte".to_owned(),
        "<script>\n\tenum E { A }\n</script>\n".to_owned(),
    )
    .expect("a small document");
    let (json, _) = lint_with("svelte/indent", &document, |_| {});
    assert_eq!(json["findings"].as_array().map(Vec::len), Some(1), "{json}");
    assert_eq!(json["findings"][0]["start"]["line"].as_u64(), Some(2));
}

/// typescript-eslint reads every module as TypeScript, and lets checker errors through.
#[test]
fn a_module_is_read_as_typescript_eslint_reads_it() {
    let report = |source: &str| {
        let document =
            Document::new("a.svelte.js".to_owned(), source.to_owned()).expect("a small document");
        lint_with("svelte/no-svelte-internal", &document, |_| {}).0
    };
    let json = report("import 'svelte/internal';\nclass C { private #a = 1; }\n");
    assert_eq!(json["findings"].as_array().map(Vec::len), Some(1), "{json}");
    assert_eq!(
        json["findings"][0]["rule"].as_str(),
        Some("svelte/no-svelte-internal")
    );
    let json = report("foo(a b);\n");
    assert!(json["findings"][0]["rule"].is_null(), "{json}");
    assert_eq!(
        json["findings"][0]["message"].as_str(),
        Some("Parsing error: ',' expected.")
    );
}

/// Svelte lets these TypeScript grammar errors pass; typescript-eslint throws them at the
/// declaration.
#[test]
fn a_grammar_error_svelte_lets_pass_fails_the_parse() {
    for (source, message, column) in [
        (
            "<script lang=\"ts\">\nlet x!: number = 1;\n</script>\n",
            "Parsing error: Declarations with initializers cannot also have definite assignment \
             assertions.",
            4,
        ),
        (
            "<script lang=\"ts\">\ndeclare function* g(): void;\n</script>\n",
            "Parsing error: Generators are not allowed in an ambient context.",
            0,
        ),
    ] {
        let document =
            Document::new("App.svelte".to_owned(), source.to_owned()).expect("a small document");
        let (json, _) = lint_with("svelte/valid-compile", &document, |_| {});
        let finding = &json["findings"][0];
        assert_eq!(finding["message"].as_str(), Some(message), "{source}");
        assert_eq!(finding["start"]["line"].as_u64(), Some(2), "{source}");
        assert_eq!(
            finding["start"]["column"].as_u64(),
            Some(column),
            "{source}"
        );
    }
}

/// tsc's scanner rejects what the compiler rejects only in its analysis, in its own words.
#[test]
fn a_legacy_octal_or_a_source_import_fails_the_parse() {
    for (script, message, column) in [
        ("let e = '\\8';", "Escape sequence '\\8' is not allowed.", 9),
        (
            "let e = 'abc\\251def';",
            "Octal escape sequences are not allowed. Use the syntax '\\xa9'.",
            12,
        ),
        (
            "let e = 0755;",
            "Octal literals are not allowed. Use the syntax '0o755'.",
            8,
        ),
        ("import source w from './w.js';", "'=' expected.", 14),
    ] {
        let source = format!("<script>\n{script}\n</script>\n<b>x</b>\n");
        let document = Document::new("App.svelte".to_owned(), source).expect("a small document");
        let (json, _) = lint_with("svelte/valid-compile", &document, |_| {});
        let finding = &json["findings"][0];
        let expected = format!("Parsing error: {message}");
        assert_eq!(finding["message"].as_str(), Some(&*expected), "{script}");
        assert_eq!(
            finding["start"]["column"].as_u64(),
            Some(column),
            "{script}"
        );
    }
}

/// typescript-eslint throws on an abstract property's initializer at the initializer.
#[test]
fn an_abstract_initializer_fails_the_parse_at_the_initializer() {
    for (path, source, column) in [
        ("a.svelte.js", "class K {\n\tabstract a = 1;\n}\n", 14),
        (
            "App.svelte",
            "<script>\nclass K {\n\tabstract a = 1;\n}\n</script>\n<p>{K}</p>\n",
            14,
        ),
    ] {
        let document = Document::new(path.to_owned(), source.to_owned()).expect("a small document");
        let (json, _) = lint_with("svelte/no-svelte-internal", &document, |_| {});
        let finding = &json["findings"][0];
        assert_eq!(
            finding["message"].as_str(),
            Some("Parsing error: Abstract property cannot have an initializer."),
            "{path}"
        );
        assert_eq!(finding["start"]["column"].as_u64(), Some(column), "{path}");
    }
}

/// Each of these fails the parse where `line:column` says.
fn assert_parse_error(source: &str, message: &str, (line, column): (u64, u64)) {
    let document =
        Document::new("App.svelte".to_owned(), source.to_owned()).expect("a small document");
    let (json, _) = lint_with("svelte/no-svelte-internal", &document, |_| {});
    let finding = &json["findings"][0];
    assert_eq!(finding["message"].as_str(), Some(message), "{source}");
    assert_eq!(finding["start"]["line"].as_u64(), Some(line), "{source}");
    assert_eq!(
        finding["start"]["column"].as_u64(),
        Some(column),
        "{source}"
    );
}

/// acorn rejects two parameters of the same name as it parses the template.
#[test]
fn a_parameter_clash_in_the_template_fails_the_parse() {
    assert_parse_error(
        "<script>\n\tlet c = 0;\n</script>\n\n{#if ((a, a) => a)(c, 1)}<b>y</b>{/if}\n",
        "Parsing error: Argument name clash\nhttps://svelte.dev/e/js_parse_error",
        (5, 10),
    );
}

/// tsc's parser rejects a private name in an optional chain, which acorn and oxc read.
#[test]
fn a_private_name_in_an_optional_chain_fails_the_parse() {
    assert_parse_error(
        "<script>\nclass K {\n\t#v = 1;\n\tf(o) { return o?.a.#v; }\n}\n</script>\n<p>{K}</p>\n",
        "Parsing error: An optional chain cannot contain private identifiers.",
        (4, 20),
    );
}

/// typescript-eslint throws an ambient initializer of a variable, not of a class property.
#[test]
fn an_ambient_initializer_fails_the_parse_only_on_a_variable() {
    let document = Document::new(
        "a.svelte.js".to_owned(),
        "declare let x = 1;\nclass K {\n\tdeclare a = 1;\n}\n".to_owned(),
    )
    .expect("a small document");
    let (json, _) = lint_with("svelte/no-svelte-internal", &document, |_| {});
    let finding = &json["findings"][0];
    assert_eq!(
        finding["message"].as_str(),
        Some("Parsing error: Initializers are not permitted in ambient contexts.")
    );
    assert_eq!(finding["start"]["column"].as_u64(), Some(12));
    let document = Document::new(
        "a.svelte.js".to_owned(),
        "class K {\n\tdeclare a = 1;\n}\nexport { K };\n".to_owned(),
    )
    .expect("a small document");
    let (json, _) = lint_with("svelte/no-svelte-internal", &document, |_| {});
    assert_eq!(json["findings"].as_array().map(Vec::len), Some(0), "{json}");
}

/// With no template expression after the script, TypeScript expects an open `}` at the end.
#[test]
fn an_open_brace_at_a_scripts_end_is_expected_at_the_documents_end() {
    assert_parse_error(
        "<script>\n\tlet a = {\n</script>\n\n<b>x</b>\n",
        "Parsing error: '}' expected.",
        (6, 0),
    );
}

/// tsc reports a name or an expression missing at the end of the file right after the last token.
#[test]
fn a_missing_node_at_a_scripts_end_is_reported_after_the_last_token() {
    assert_parse_error(
        "<script>\n  let a = (\n</script>\n",
        "Parsing error: Expression expected.",
        (2, 11),
    );
    assert_parse_error(
        "<script>class A { b() { return true; } } new A().</script>",
        "Parsing error: Identifier expected.",
        (1, 49),
    );
    assert_parse_error(
        "<script>const a = </script><p></p>",
        "Parsing error: Expression expected.",
        (1, 17),
    );
}
