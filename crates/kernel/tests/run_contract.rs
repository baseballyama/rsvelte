use std::sync::Mutex;
use std::sync::atomic::{AtomicUsize, Ordering};

use rsvelte_kernel::computation::database::{Artifact, DocumentContext};
use rsvelte_kernel::computation::pipeline::{
    Document, DocumentResult, FinishTask, Part, Registry, RunOptions, Sharing, Task, TaskOutput,
    run, run_each,
};
use rsvelte_kernel::{Diagnostic, Span};

struct Length;

impl Artifact for Length {
    type Output = usize;

    const NAME: &'static str = "length";

    fn compute(context: &DocumentContext<'_>) -> usize {
        context.source_text().len()
    }
}

struct Echo;

impl Task for Echo {
    fn identifier(&self) -> &'static str {
        "echo"
    }

    fn applies(&self, document: &Document) -> bool {
        !document.text.is_empty()
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        out.file("echo", context.source_text().into());
        out.diagnostics
            .push(Diagnostic::warning("echo-code", "Echoed", Span::new(0, 0)));
    }
}

struct PanicsOnBoom;

impl Task for PanicsOnBoom {
    fn identifier(&self) -> &'static str {
        "panics-on-boom"
    }

    fn applies(&self, document: &Document) -> bool {
        document.text == "boom"
    }

    fn run(&self, _: &DocumentContext<'_>, _: &mut TaskOutput) {
        panic!("boom");
    }
}

/// Each document's part is its length; the project half writes `length/total`.
struct Total;

impl FinishTask for Total {
    fn identifier(&self) -> &'static str {
        "total"
    }

    fn applies(&self, _: &Document) -> bool {
        true
    }

    fn prepare(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) -> Option<Part> {
        if context.source_text().is_empty() {
            out.file("total", "empty".into());
            return None;
        }
        Some(Box::new(*context.get::<Length>()))
    }

    fn finish(&self, parts: Vec<Part>, outs: Vec<&mut TaskOutput>) {
        let lengths: Vec<usize> = parts
            .into_iter()
            .map(|p| *p.downcast().expect("a length"))
            .collect();
        let total: usize = lengths.iter().sum();
        for (length, out) in lengths.iter().zip(outs) {
            out.file("total", format!("{length}/{total}"));
        }
    }
}

type Summary = (Option<String>, Vec<(&'static str, Vec<String>)>);

fn summary(result: DocumentResult) -> Summary {
    let outputs = result
        .outputs
        .into_iter()
        .map(|(identifier, out)| {
            let mut lines: Vec<String> = out
                .files
                .into_iter()
                .map(|f| format!("{}={}", f.name, f.text))
                .collect();
            lines.extend(out.diagnostics.iter().map(|d| {
                let code: &str = d.code.as_ref();
                format!("diagnostic={code}")
            }));
            (identifier, lines)
        })
        .collect();
    (result.panic, outputs)
}

fn registry() -> Registry {
    let mut registry = Registry::new();
    registry
        .artifact::<Length>()
        .task(Echo)
        .task(PanicsOnBoom)
        .finish_task(Total);
    registry
}

fn documents(registry: &Registry) -> Vec<Document> {
    [("a", "ab"), ("b", ""), ("c", "boom"), ("d", "cde")]
        .into_iter()
        .map(|(p, t)| registry.document(p, t).expect("valid document"))
        .collect()
}

#[test]
fn run_and_run_each_agree_for_every_sharing_and_thread_count() {
    let registry = registry();
    let documents = documents(&registry);
    let expected: Vec<Summary> = vec![
        (
            None,
            vec![
                (
                    "echo",
                    vec!["echo=ab".into(), "diagnostic=echo-code".into()],
                ),
                ("total", vec!["total=2/5".into()]),
            ],
        ),
        (None, vec![("total", vec!["total=empty".into()])]),
        (Some("boom".into()), vec![]),
        (
            None,
            vec![
                (
                    "echo",
                    vec!["echo=cde".into(), "diagnostic=echo-code".into()],
                ),
                ("total", vec!["total=3/5".into()]),
            ],
        ),
    ];
    for sharing in [Sharing::Shared, Sharing::Isolated] {
        for threads in [Some(1), Some(2), None] {
            let options = RunOptions {
                tasks: &[],
                sharing,
                threads,
            };
            let collected: Vec<Summary> = run(&registry, &documents, &options)
                .expect("known tasks")
                .into_iter()
                .map(summary)
                .collect();
            assert_eq!(collected, expected, "run, {sharing:?}, {threads:?}");

            let seen = Mutex::new(Vec::new());
            run_each(&registry, &documents, &options, &|i, r| {
                seen.lock().expect("test lock").push((i, summary(r)));
            })
            .expect("known tasks");
            let mut seen = seen.into_inner().expect("test lock");
            seen.sort_unstable_by_key(|(i, _)| *i);
            let indices: Vec<usize> = seen.iter().map(|(i, _)| *i).collect();
            assert_eq!(indices, [0, 1, 2, 3], "one sink call per document");
            let streamed: Vec<Summary> = seen.into_iter().map(|(_, s)| s).collect();
            assert_eq!(streamed, expected, "run_each, {sharing:?}, {threads:?}");
        }
    }
}

static SHARED_COMPUTATIONS: AtomicUsize = AtomicUsize::new(0);
static ISOLATED_COMPUTATIONS: AtomicUsize = AtomicUsize::new(0);

struct Counted<const ISOLATED: bool>;

impl<const ISOLATED: bool> Artifact for Counted<ISOLATED> {
    type Output = ();

    const NAME: &'static str = "counted";

    fn compute(_: &DocumentContext<'_>) {
        let counter = if ISOLATED {
            &ISOLATED_COMPUTATIONS
        } else {
            &SHARED_COMPUTATIONS
        };
        counter.fetch_add(1, Ordering::Relaxed);
    }
}

struct Reads<const ISOLATED: bool>(&'static str);

impl<const ISOLATED: bool> Task for Reads<ISOLATED> {
    fn identifier(&self) -> &'static str {
        self.0
    }

    fn applies(&self, _: &Document) -> bool {
        true
    }

    fn run(&self, context: &DocumentContext<'_>, _: &mut TaskOutput) {
        context.get::<Counted<ISOLATED>>();
    }
}

fn count<const ISOLATED: bool>(sharing: Sharing, counter: &AtomicUsize) -> usize {
    let mut registry = Registry::new();
    registry
        .artifact::<Counted<ISOLATED>>()
        .task(Reads::<ISOLATED>("first"))
        .task(Reads::<ISOLATED>("second"));
    let documents: Vec<Document> = ["a", "b"]
        .into_iter()
        .map(|p| registry.document(p, "x").expect("valid document"))
        .collect();
    run(
        &registry,
        &documents,
        &RunOptions {
            tasks: &[],
            sharing,
            threads: Some(1),
        },
    )
    .expect("known tasks");
    counter.load(Ordering::Relaxed)
}

#[test]
fn shared_computes_an_artifact_once_per_document_and_isolated_once_per_task() {
    assert_eq!(
        count::<false>(Sharing::Shared, &SHARED_COMPUTATIONS),
        2,
        "two documents"
    );
    assert_eq!(
        count::<true>(Sharing::Isolated, &ISOLATED_COMPUTATIONS),
        4,
        "two documents times two tasks"
    );
}
