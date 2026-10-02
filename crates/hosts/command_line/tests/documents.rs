use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::pipeline::{Registry, RunOptions, Sharing, TaskOutput, run};
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript::{Parsed, Resolved};
use rsvelte_typescript_check::{TypeScriptDocument, TypeScriptView};

fn registry() -> Registry {
    let mut registry = Registry::new();
    rsvelte_typescript_compile::register(&mut registry);
    rsvelte_typescript_format::register(&mut registry);
    rsvelte_typescript_lint::register(&mut registry);
    rsvelte_typescript_check::register(&mut registry);
    registry
}

fn task(source: &str, identifier: &str) -> TaskOutput {
    task_at("input.ts", source, identifier)
}

fn task_at(path: &str, source: &str, identifier: &str) -> TaskOutput {
    let registry = registry();
    let document = registry.document(path, source).expect("valid text");
    let mut results = run(
        &registry,
        &[document],
        &RunOptions {
            tasks: &[identifier],
            sharing: Sharing::Shared,
            threads: Some(1),
        },
    )
    .expect("registered task");
    let mut result = results.pop().expect("one document");
    assert!(result.panic.is_none(), "{:?}", result.panic);
    result.outputs.pop().expect("one output").1
}

#[test]
fn javascript_and_typescript_extensions_select_shared_tasks() {
    let registry = registry();
    for (path, selected) in [
        ("input.ts", true),
        ("input.mts", true),
        ("input.cts", true),
        ("types.d.ts", true),
        ("input.js", true),
        ("input.mjs", true),
        ("input.cjs", true),
        ("input.jsx", false),
        ("input.tsx", false),
        ("input.svelte", false),
        ("README", false),
    ] {
        let document = registry.document(path, "").expect("valid text");
        assert_eq!(rsvelte_typescript::matches(&document), selected, "{path}");
        assert_eq!(
            registry.artifacts().provides::<TypeScriptView>(&document),
            selected,
            "{path}"
        );
        let result = run(
            &registry,
            &[document],
            &RunOptions {
                tasks: &[],
                sharing: Sharing::Shared,
                threads: Some(1),
            },
        )
        .expect("known tasks");
        assert_eq!(
            result[0].outputs.len(),
            if selected { 3 } else { 0 },
            "{path}"
        );
    }
}

#[test]
fn compilation_erases_types_and_keeps_runtime_statements() {
    let output = task(
        concat!(
            "import type { Props } from './props';\n",
            "interface Result { value: string }\n",
            "export const value: string = 'hello';"
        ),
        "ts.compile/default",
    );
    assert!(output.diagnostics.is_empty(), "{:?}", output.diagnostics);
    assert_eq!(output.files[0].text, "export const value = 'hello';\n");
}

#[test]
fn compilation_refuses_types_that_need_runtime_lowering() {
    for source in [
        "enum Color { Red }",
        "namespace Color { export const red = 1; }",
    ] {
        let output = task(source, "ts.compile/default");
        assert!(output.files.is_empty(), "{source}");
        assert_eq!(output.diagnostics[0].code, "compile_unsupported");
    }
}

#[test]
fn formatting_preserves_type_annotations() {
    let output = task("export const value:string='hello'", "ts.format/default");
    assert!(output.diagnostics.is_empty(), "{:?}", output.diagnostics);
    assert_eq!(
        output.files[0].text,
        "export const value: string = \"hello\";\n"
    );
}

#[test]
fn unsupported_formatting_produces_no_file() {
    let output = task("type Value = string | number;", "ts.format/default");
    assert!(
        output.files.is_empty(),
        "unsupported types must not be removed"
    );
    assert_eq!(output.diagnostics[0].code, "format_unsupported");
}

#[test]
fn lint_reports_unused_bindings_and_keeps_used_exports() {
    let output = task(
        "const unused: string = 'hello'; export const used: number = 1;",
        "ts.lint/default",
    );
    assert!(output.diagnostics.is_empty(), "{:?}", output.diagnostics);
    assert!(
        output.files[0]
            .text
            .contains("'unused' is assigned a value but never used."),
        "{}",
        output.files[0].text
    );
    assert!(
        !output.files[0].text.contains("'used' is"),
        "{}",
        output.files[0].text
    );
}

#[test]
fn invalid_source_is_reported_by_each_tree_task() {
    for identifier in ["ts.compile/default", "ts.format/default", "ts.lint/default"] {
        let output = task("const = ;", identifier);
        assert!(output.files.is_empty(), "{identifier}");
        assert_eq!(output.diagnostics[0].code, "parse_error");
    }
}

#[test]
fn parse_and_scope_facts_are_cached_in_one_document() {
    let registry = registry();
    let document = registry
        .document("input.ts", "export const value: number = 1;")
        .expect("valid text");
    let context = DocumentContext::new(&document, registry.artifacts());
    assert!(
        std::ptr::eq(context.get::<Parsed>(), context.get::<Parsed>()),
        "parsing must be shared"
    );
    assert!(
        std::ptr::eq(context.get::<Resolved>(), context.get::<Resolved>()),
        "scope facts must be shared"
    );
    assert_eq!(
        context
            .get::<Resolved>()
            .as_ref()
            .expect("valid parse")
            .bindings
            .len(),
        1
    );
}

#[test]
fn type_check_view_keeps_all_source_and_maps_utf8_offsets() {
    let registry = registry();
    let source = "export const message: string = '日本語';\n";
    let document = registry.document("input.ts", source).expect("valid text");
    let context = DocumentContext::new(&document, registry.artifacts());
    let view = context
        .facet::<TypeScriptView>()
        .expect("provided")
        .as_ref()
        .expect("valid view");
    let TypeScriptDocument::Checked {
        projection,
        map_back,
        ..
    } = view
    else {
        panic!("TypeScript is checked")
    };
    assert_eq!(projection.out, source);
    let start = source.find("日本語").expect("test text") as u32;
    let span = Span::new(start, start + "日本語".len() as u32);
    assert_eq!(map_back(projection, span), Some(span));
    let end = source.len() as u32;
    assert_eq!(
        map_back(projection, Span::new(end, end)),
        Some(Span::new(end, end))
    );
}

#[test]
fn type_check_view_does_not_depend_on_the_subset_parser() {
    let registry = registry();
    let source = "abstract class Value { abstract get(): string; }";
    let document = registry.document("input.ts", source).expect("valid text");
    let context = DocumentContext::new(&document, registry.artifacts());
    let view = context
        .facet::<TypeScriptView>()
        .expect("provided")
        .as_ref()
        .expect("valid view");
    let TypeScriptDocument::Checked { projection, .. } = view else {
        panic!("TypeScript is checked")
    };
    assert_eq!(projection.out, source);
    assert!(
        context.get::<Parsed>().is_err(),
        "positive control: this syntax exceeds the parser subset"
    );
}

#[test]
fn the_shared_checker_selects_standalone_typescript() {
    let mut registry = registry();
    registry.finish_task(rsvelte_typescript_check::Check {
        identifier: "ts.check/default",
        matches: rsvelte_typescript::matches,
        tsc: None,
    });
    let document = registry
        .document("input.ts", "const value: number = 1;")
        .expect("valid text");
    let results = run(
        &registry,
        &[document],
        &RunOptions {
            tasks: &["ts.check/default"],
            sharing: Sharing::Shared,
            threads: Some(1),
        },
    )
    .expect("known task");
    assert!(results[0].panic.is_none(), "{:?}", results[0].panic);
    assert_eq!(
        results[0].outputs[0].1.diagnostics[0].code,
        "check_unconfigured"
    );
}

#[test]
fn javascript_uses_its_own_syntax_mode_in_shared_tasks() {
    for path in ["input.js", "input.mjs", "input.cjs"] {
        let compiled = task_at(
            path,
            "export const value = a < b > (c);",
            "ts.compile/default",
        );
        assert!(
            compiled.diagnostics.is_empty(),
            "{path}: {:?}",
            compiled.diagnostics
        );
        assert_eq!(
            compiled.files[0].text, "export const value = a < b > c;\n",
            "{path}"
        );
        let formatted = task_at(path, "export const value=a<b>(c)", "ts.format/default");
        assert!(
            formatted.diagnostics.is_empty(),
            "{path}: {:?}",
            formatted.diagnostics
        );
        assert_eq!(
            formatted.files[0].text, "export const value = a < b > c;\n",
            "{path}"
        );
        assert_eq!(formatted.files[0].name, "js", "{path}");
        let linted = task_at(
            path,
            "const unused = 1; export const used = 2;",
            "ts.lint/default",
        );
        assert!(
            linted.diagnostics.is_empty(),
            "{path}: {:?}",
            linted.diagnostics
        );
        assert!(
            linted.files[0]
                .text
                .contains("'unused' is assigned a value but never used."),
            "{path}"
        );
        assert!(!linted.files[0].text.contains("'used' is"), "{path}");
        for identifier in ["ts.compile/default", "ts.format/default", "ts.lint/default"] {
            let invalid = task_at(path, "const value: number = 1;", identifier);
            assert!(invalid.files.is_empty(), "{path}: {identifier}");
            assert_eq!(
                invalid.diagnostics[0].code, "parse_error",
                "{path}: {identifier}"
            );
        }
    }
    let compiled = task("export const value = a < b > (c);", "ts.compile/default");
    assert_eq!(compiled.files[0].text, "export const value = a(c);\n");
}

#[test]
fn javascript_type_checking_is_explicitly_unchecked() {
    let mut registry = registry();
    registry.finish_task(rsvelte_typescript_check::Check {
        identifier: "ts.check/default",
        matches: rsvelte_typescript::matches,
        tsc: None,
    });
    for path in ["input.js", "input.mjs", "input.cjs"] {
        let document = registry
            .document(path, "export const value = 1;")
            .expect("valid text");
        let context = DocumentContext::new(&document, registry.artifacts());
        assert!(
            matches!(
                context.facet::<TypeScriptView>(),
                Some(Ok(TypeScriptDocument::Unchecked))
            ),
            "{path}"
        );
        let results = run(
            &registry,
            std::slice::from_ref(&document),
            &RunOptions {
                tasks: &["ts.check/default"],
                sharing: Sharing::Shared,
                threads: Some(1),
            },
        )
        .expect("known task");
        assert!(results[0].panic.is_none(), "{path}");
        let output = &results[0].outputs[0].1;
        assert!(
            output.diagnostics.is_empty(),
            "{path}: {:?}",
            output.diagnostics
        );
        assert_eq!(output.files[0].text, "[]\n", "{path}");
    }
}
