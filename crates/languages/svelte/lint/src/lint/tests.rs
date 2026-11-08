use rsvelte_kernel::computation::pipeline::{RunOptions, Sharing, run};

use super::*;

const SOURCE: &str = "<script>let unused = 1;</script>\n<button>x</button>\n";

#[test]
fn verify_finds_what_the_task_reports() {
    let found = verify(SOURCE, &Configuration::default(), "A.svelte").expect("parses");
    assert!(
        found.iter().any(|d| d.code == "svelte/button-has-type"),
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
    for d in &found {
        assert!(json.contains(&format!("\"{}\"", d.code)), "{json}");
    }
}

#[test]
fn verify_reports_a_parse_error() {
    let error = verify("<p>{</p>", &Configuration::default(), "A.svelte").expect_err("broken");
    assert_ne!(error.message, "");
}
