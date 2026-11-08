use rsvelte_kernel::computation::pipeline::{RunOptions, Sharing, run};

use super::*;

fn task_output(source_text: &str) -> TaskOutput {
    let mut registry = Registry::new();
    register(&mut registry);
    let document = registry.document("A.svelte", source_text).expect("small");
    let result = run(
        &registry,
        &[document],
        &RunOptions {
            tasks: &["svelte.format/default"],
            sharing: Sharing::Shared,
            threads: Some(1),
        },
    )
    .expect("valid plugins")
    .remove(0);
    result.outputs.into_iter().next().expect("the task ran").1
}

#[test]
fn format_gives_what_the_task_writes() {
    let source_text = "<script>let a=1</script>\n<p   class='x'>{a}</p>\n";
    let output = task_output(source_text);
    assert_eq!(output.files.len(), 1);
    assert_eq!(format(source_text).expect("formats"), output.files[0].text);
}

#[test]
fn format_reports_what_the_task_reports() {
    let source_text = "<p>{</p>";
    let output = task_output(source_text);
    let error = format(source_text).expect_err("does not parse");
    let reported = output.diagnostics.first().expect("the task reports it");
    assert_eq!(
        (&error.code, &error.message, error.span),
        (&reported.code, &reported.message, reported.span)
    );
}
