use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::pipeline::{
    Document, Registry, RunOptions, Sharing, Task, TaskOutput, run,
};
use rsvelte_svelte::Parsed;

#[derive(Debug)]
struct ReplacementLint;

impl Task for ReplacementLint {
    fn identifier(&self) -> &'static str {
        "svelte.lint/default"
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_svelte::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        match context.get::<Parsed>() {
            Ok(component) => out.file("lint.txt", component.nodes.len().to_string()),
            Err(diagnostic) => out.diagnostics.push(diagnostic.clone()),
        }
    }
}

#[test]
fn core_registers_facts_without_selecting_tools() {
    let mut registry = Registry::new();
    rsvelte_svelte::register(&mut registry);
    rsvelte_vue::register(&mut registry);
    rsvelte_typescript::register(&mut registry);
    assert!(registry.document_task_identifiers().is_empty());
    for path in ["App.svelte", "App.vue", "app.ts"] {
        let document = registry.document(path, "").expect("valid source size");
        assert!(
            !registry
                .artifacts()
                .provides::<rsvelte_typescript_check::TypeScriptView>(&document)
        );
    }
}

#[test]
fn a_replacement_lint_runs_beside_the_selected_formatter() {
    let mut registry = Registry::new();
    rsvelte_svelte_format::register(&mut registry);
    registry.task(ReplacementLint);
    let document = registry
        .document("App.svelte", "<p>Hello</p>")
        .expect("valid source size");
    let context = DocumentContext::new(&document, registry.artifacts());
    let parsed = context.get::<Parsed>();
    assert!(std::ptr::eq(parsed, context.get::<Parsed>()));
    let node_count = parsed.as_ref().expect("valid component").nodes.len();
    drop(context);
    let results = run(
        &registry,
        &[document],
        &RunOptions {
            tasks: &["svelte.format/default", "svelte.lint/default"],
            sharing: Sharing::Shared,
            threads: Some(1),
        },
    )
    .expect("selected tasks are registered");
    let result = &results[0];
    assert!(result.panic.is_none());
    assert_eq!(result.outputs.len(), 2);
    assert_eq!(result.outputs[0].1.files[0].text, "<p>Hello</p>\n");
    assert_eq!(result.outputs[1].1.files[0].name, "lint.txt");
    assert_eq!(result.outputs[1].1.files[0].text, node_count.to_string());
}
