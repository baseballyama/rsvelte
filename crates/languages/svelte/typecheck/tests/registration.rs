use rsvelte_kernel::computation::pipeline::{Document, Registry, RunOptions, Sharing, run};

#[test]
fn projection_and_typecheck_can_be_registered_together() {
    let mut registry = Registry::new();
    rsvelte_svelte_typescript_projection::register(&mut registry);
    rsvelte_svelte_typecheck::register(
        &mut registry,
        &rsvelte_svelte_typecheck::Configuration::default(),
    );
    let document = Document::new(
        "App.svelte".to_owned(),
        "<script lang=\"ts\">let x: number = 1;</script><p>{x}</p>".to_owned(),
    )
    .unwrap();
    let results = run(
        &registry,
        &[document],
        &RunOptions {
            tasks: &[
                "svelte.typescript_projection/default",
                "svelte.check/default",
            ],
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
