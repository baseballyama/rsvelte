use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::pipeline::{RunOptions, Sharing, run};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::source::document::Document;
use rsvelte_typescript_check::{TypeScriptDocument, TypeScriptView};

#[test]
fn projection_and_typecheck_can_be_registered_together() {
    let mut registry = Registry::new();
    rsvelte_svelte_typescript_projection::register(&mut registry);
    crate::register(&mut registry, &crate::Configuration::default());
    let document = Document::new(
        "App.svelte".to_owned(),
        "<script lang=\"ts\">let x: number = 1;</script><p>{x}</p>".to_owned(),
    )
    .unwrap();
    let results = run(
        &registry,
        &[document],
        &RunOptions {
            tasks: &[rsvelte_svelte_typescript_projection::TASK, super::TASK],
            sharing: Sharing::Shared,
            threads: Some(1),
        },
    )
    .unwrap();
    assert!(
        results[0].panic.is_none(),
        "both capabilities must share artifacts without a conflict"
    );
    let projection = &results[0].outputs[0].1;
    assert!(
        projection.diagnostics.is_empty(),
        "projection must need no checker configuration"
    );
    assert_eq!(
        projection.files.len(),
        2,
        "the task must provide TypeScript and its source map"
    );
    assert_eq!(
        results[0].outputs[1].1.diagnostics[0].code,
        "check_unconfigured"
    );
}

/// svelte-check reads a component svelte2tsx rejects as TypeScript by its script elements, which
/// it finds without Svelte's parse: an import of each JavaScript one reports TS7016 in
/// svelte-check 4.7.8, and of each TypeScript one TS1192 or TS2306.
#[test]
fn a_rejected_component_is_javascript_as_its_script_elements_say() {
    let mut registry = Registry::new();
    rsvelte_svelte_typescript_projection::register(&mut registry);
    crate::register(&mut registry, &crate::Configuration::default());
    let cells = [
        (
            "<script lang=\"ts\">\n\texport let v: number = 1;\n</script>\n\n{v +}\n",
            false,
        ),
        (
            "<script lang=\"ts\">\n\tlet { v }: { v: number } = $props();\n</script>\n\n{v +}\n",
            false,
        ),
        (
            "{v +}\n\n<script lang=\"ts\">\n\tlet { v }: { v: number } = $props();\n</script>\n",
            false,
        ),
        ("<script>\n\texport let v = 1;\n</script>\n\n{v +}\n", true),
        (
            "<!-- <script lang=\"ts\"></script> -->\n<script>\n\tlet { v } = $props();\n</script>\n\n{v +}\n",
            true,
        ),
    ];
    for (source, expected) in cells {
        let document = Document::new("App.svelte", source).expect("valid text");
        let context = DocumentContext::new(&document, registry.artifacts());
        let view = context.facet::<TypeScriptView>().expect("provided");
        let Ok(TypeScriptDocument::Rejected { javascript, .. }) = view else {
            panic!("svelte2tsx rejects {source:?}: {view:?}");
        };
        assert_eq!(*javascript, expected, "{source:?}");
    }
}
