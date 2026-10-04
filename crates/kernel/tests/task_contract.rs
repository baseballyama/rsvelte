use std::sync::atomic::{AtomicUsize, Ordering};

use rsvelte_kernel::computation::database::{Artifact, DocumentContext};
use rsvelte_kernel::computation::pipeline::{
    Document, Registry, RunOptions, Sharing, Task, TaskOutput, run,
};
use rsvelte_kernel::{Diagnostic, Span};

static COMPUTATIONS: AtomicUsize = AtomicUsize::new(0);

struct SourceData;

impl Artifact for SourceData {
    type Output = Vec<usize>;

    const NAME: &'static str = "source-data";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        COMPUTATIONS.fetch_add(1, Ordering::Relaxed);
        vec![context.source_text().len()]
    }
}

struct DerivedData;

impl Artifact for DerivedData {
    type Output = Vec<usize>;

    const NAME: &'static str = "derived-data";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        context.get::<SourceData>().iter().map(|n| n * 2).collect()
    }
}

#[derive(Debug)]
struct Produce;

impl Task for Produce {
    fn identifier(&self) -> &'static str {
        "produce"
    }

    fn applies(&self, _: &Document) -> bool {
        true
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        out.file("result", context.get::<DerivedData>()[0].to_string());
        out.diagnostics.push(Diagnostic::warning(
            "first-code",
            "First report",
            Span::new(0, 1),
        ));
        out.diagnostics.push(Diagnostic::error(
            "second-code",
            "Second report",
            Span::new(1, 2),
        ));
    }
}

#[derive(Debug)]
struct Observe;

impl Task for Observe {
    fn identifier(&self) -> &'static str {
        "observe"
    }

    fn applies(&self, _: &Document) -> bool {
        true
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        assert_eq!(
            context.source_text(),
            "input",
            "input must remain unchanged"
        );
        assert_eq!(
            context.get::<SourceData>(),
            &[5],
            "source data must remain unchanged"
        );
        assert_eq!(
            context.get::<DerivedData>(),
            &[10],
            "derived data must be shared"
        );
        out.file("observed", context.source_text().into());
    }
}

#[test]
fn tasks_share_input_and_derived_data_and_report_independent_codes() {
    let mut registry = Registry::new();
    registry
        .artifact::<SourceData>()
        .artifact::<DerivedData>()
        .task(Produce)
        .task(Observe);
    let documents = [registry
        .document("source", "input")
        .expect("valid document")];
    let results = run(
        &registry,
        &documents,
        &RunOptions {
            tasks: &[],
            sharing: Sharing::Shared,
            threads: Some(1),
        },
    )
    .expect("registered tasks");
    assert!(results[0].panic.is_none());
    assert_eq!(COMPUTATIONS.load(Ordering::Relaxed), 1);
    assert_eq!(documents[0].text, "input");
    let outputs = &results[0].outputs;
    assert_eq!(outputs[0].1.files[0].text, "10");
    assert_eq!(outputs[1].1.files[0].text, "input");
    let codes: Vec<_> = outputs[0]
        .1
        .diagnostics
        .iter()
        .map(|diagnostic| diagnostic.code.as_ref())
        .collect();
    assert_eq!(codes, ["first-code", "second-code"]);
    assert!(outputs[1].1.diagnostics.is_empty());
}
