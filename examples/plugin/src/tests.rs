use rsvelte_kernel::computation::pipeline::{RunOptions, Sharing, run};

use super::*;

#[test]
fn counts_elements_reports_parse_errors_and_skips_other_languages() {
    let mut registry = Registry::new();
    rsvelte_svelte_format::register(&mut registry);
    register(&mut registry);
    let documents = [
        registry
            .document("App.svelte", "<main><p>Hello</p></main>")
            .expect("valid size"),
        registry
            .document("Broken.svelte", "<p>")
            .expect("valid size"),
        registry
            .document("Style.svelte", "<p></p><style>a {</style>")
            .expect("valid size"),
        registry
            .document("Other.vue", "<p>Hello</p>")
            .expect("valid size"),
    ];
    let results = run(
        &registry,
        &documents,
        &RunOptions {
            tasks: &["svelte.format/default", "example.count_elements/default"],
            sharing: Sharing::Shared,
            threads: None,
        },
    )
    .expect("registered tasks");
    assert!(results.iter().all(|result| result.panic.is_none()));
    let (_, counted) = &results[0].outputs[1];
    assert_eq!(counted.files[0].text, "2");
    assert!(counted.diagnostics.is_empty());
    let (_, broken) = &results[1].outputs[1];
    assert!(broken.files.is_empty());
    assert_eq!(broken.diagnostics.len(), 1);
    let (_, style) = &results[2].outputs[1];
    assert_eq!(style.diagnostics.len(), 1);
    assert!(results[3].outputs.is_empty());
}
