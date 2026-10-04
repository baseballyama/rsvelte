use super::*;

mod plugins;

fn matches_t(document: &Document) -> bool {
    std::path::Path::new(&document.path)
        .extension()
        .is_some_and(|ext| ext.eq_ignore_ascii_case("t"))
}

#[test]
fn documents_do_not_need_a_plugin_or_an_extension() {
    let reg = Registry::new();
    for path in ["README", "file.unknown", ""] {
        let document = reg.document(path, "hello").expect("valid text");
        assert_eq!(document.path, path);
        assert_eq!(document.text, "hello");
    }
}

struct Selected {
    identifier: &'static str,
    matches: fn(&Document) -> bool,
}

impl Task for Selected {
    fn identifier(&self) -> &'static str {
        self.identifier
    }

    fn applies(&self, document: &Document) -> bool {
        (self.matches)(document)
    }

    fn run(&self, _: &DocumentContext<'_>, out: &mut TaskOutput) {
        out.file("txt", self.identifier.into());
    }
}

#[test]
fn tasks_choose_documents_independently_by_path_or_content() {
    let mut reg = Registry::new();
    reg.task(Selected {
        identifier: "path",
        matches: matches_t,
    })
    .task(Selected {
        identifier: "content",
        matches: |document| document.text == "yes",
    });
    let docs = [
        ("a.t", "yes"),
        ("b.t", "no"),
        ("README", "yes"),
        ("other", "no"),
    ]
    .into_iter()
    .map(|(p, t)| reg.document(p, t).expect("valid text"))
    .collect::<Vec<_>>();
    for (sharing, threads) in [Sharing::Shared, Sharing::Isolated]
        .into_iter()
        .flat_map(|sharing| [Some(1), Some(2)].map(|threads| (sharing, threads)))
    {
        let options = RunOptions {
            tasks: &[],
            sharing,
            threads,
        };
        let result = run(&reg, &docs, &options).expect("known tasks");
        let identifiers: Vec<Vec<_>> = result
            .iter()
            .map(|r| {
                r.outputs
                    .iter()
                    .map(|(identifier, _)| *identifier)
                    .collect()
            })
            .collect();
        assert_eq!(
            identifiers,
            [
                vec!["path", "content"],
                vec!["path"],
                vec!["content"],
                vec![]
            ]
        );
        let seen = std::sync::Mutex::new(Vec::new());
        run_each(&reg, &docs, &options, &|i, r| {
            seen.lock().expect("test lock").push((
                i,
                r.outputs
                    .into_iter()
                    .map(|(identifier, _)| identifier)
                    .collect::<Vec<_>>(),
            ));
        })
        .expect("known tasks");
        let mut seen = seen.into_inner().expect("test lock");
        seen.sort_unstable_by_key(|(i, _)| *i);
        assert_eq!(
            seen.into_iter()
                .map(|(_, identifiers)| identifiers)
                .collect::<Vec<_>>(),
            identifiers
        );
    }
}

struct Len;
impl Artifact for Len {
    type Output = usize;

    const NAME: &'static str = "len";

    fn compute(context: &DocumentContext<'_>) -> usize {
        context.source_text().len()
    }
}

/// Each document's part is its length; the project half writes the total into every output.
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
            out.file("txt", "empty".into());
            return None;
        }
        Some(Box::new(*context.get::<Len>()))
    }

    fn finish(&self, parts: Vec<Part>, outs: Vec<&mut TaskOutput>) {
        let lens: Vec<usize> = parts.into_iter().map(|p| *p.downcast().unwrap()).collect();
        let total: usize = lens.iter().sum();
        for (len, out) in lens.iter().zip(outs) {
            out.file("txt", format!("{len}/{total}"));
        }
    }
}

#[test]
fn a_finish_task_sees_every_prepared_document_once() {
    let mut reg = Registry::new();
    reg.artifact::<Len>().finish_task(Total);
    let docs: Vec<Document> = [("a.t", "ab"), ("b.t", ""), ("c.t", "cde")]
        .into_iter()
        .map(|(p, t)| reg.document(p, t).unwrap())
        .collect();
    let options = RunOptions {
        tasks: &[],
        sharing: Sharing::Shared,
        threads: Some(2),
    };
    let texts: Vec<String> = run(&reg, &docs, &options)
        .unwrap()
        .into_iter()
        .map(|r| r.outputs[0].1.files[0].text.clone())
        .collect();
    assert_eq!(texts, ["2/5", "empty", "3/5"]);
}

/// Like [`Total`], under another identifier and counting documents instead of bytes.
struct Count;
impl FinishTask for Count {
    fn identifier(&self) -> &'static str {
        "count"
    }

    fn applies(&self, document: &Document) -> bool {
        document.path != "b.t"
    }

    fn prepare(&self, _: &DocumentContext<'_>, _: &mut TaskOutput) -> Option<Part> {
        Some(Box::new(()))
    }

    fn finish(&self, parts: Vec<Part>, outs: Vec<&mut TaskOutput>) {
        let n = parts.len();
        for out in outs {
            out.file("n", n.to_string());
        }
    }
}

struct Panics;
impl Task for Panics {
    fn identifier(&self) -> &'static str {
        "panics"
    }

    fn applies(&self, _: &Document) -> bool {
        true
    }

    fn run(&self, _: &DocumentContext<'_>, _: &mut TaskOutput) {
        std::panic::panic_any(42u8);
    }
}

struct FinishPanics;
impl FinishTask for FinishPanics {
    fn identifier(&self) -> &'static str {
        "project-panics"
    }

    fn applies(&self, _: &Document) -> bool {
        true
    }

    fn prepare(&self, _: &DocumentContext<'_>, _: &mut TaskOutput) -> Option<Part> {
        Some(Box::new(()))
    }

    fn finish(&self, _: Vec<Part>, _: Vec<&mut TaskOutput>) {
        panic!("project failed");
    }
}

fn setup() -> (Registry, Vec<Document>) {
    let mut reg = Registry::new();
    reg.artifact::<Len>()
        .finish_task(Total)
        .finish_task(Count)
        .task(Panics);
    let docs = [("a.t", "ab"), ("b.t", "x"), ("c.t", "cde")]
        .into_iter()
        .map(|(p, t)| reg.document(p, t).unwrap())
        .collect();
    (reg, docs)
}

fn options<'a>(tasks: &'a [&'a str]) -> RunOptions<'a> {
    RunOptions {
        tasks,
        sharing: Sharing::Shared,
        threads: Some(2),
    }
}

#[test]
fn each_finish_task_gets_only_its_own_parts() {
    let (reg, docs) = setup();
    let got: Vec<Vec<String>> = run(&reg, &docs, &options(&["total", "count"]))
        .unwrap()
        .into_iter()
        .map(|r| {
            r.outputs
                .iter()
                .map(|(identifier, o)| format!("{identifier}={}", o.files[0].text))
                .collect()
        })
        .collect();
    assert_eq!(
        got,
        [
            vec!["total=2/6", "count=2"],
            vec!["total=1/6"],
            vec!["total=3/6", "count=2"]
        ]
    );
}

#[test]
fn a_panicking_finish_task_does_not_break_the_next_finish_task() {
    let mut reg = Registry::new();
    reg.finish_task(FinishPanics).finish_task(Count);
    let docs = ["a.t", "c.t"]
        .into_iter()
        .map(|p| reg.document(p, "x").unwrap())
        .collect::<Vec<_>>();
    let got = run(&reg, &docs, &options(&[])).expect("known tasks");
    assert!(
        got.iter()
            .all(|r| { r.panic.as_deref() == Some("project failed") && r.outputs.is_empty() })
    );
}

#[test]
fn an_unknown_task_identifier_is_an_error() {
    let (reg, docs) = setup();
    let err = run(&reg, &docs, &options(&["total", "totl"]))
        .err()
        .unwrap();
    let RunError::UnknownTask(err) = err else {
        panic!("expected an unknown task");
    };
    assert_eq!(err.identifier, "totl");
}

#[test]
fn a_panic_without_a_string_payload_still_says_so() {
    let (reg, docs) = setup();
    let r = run(&reg, &docs[..1], &options(&["panics"])).unwrap();
    assert_eq!(
        r[0].panic.as_deref(),
        Some("panicked with a payload that is not a string")
    );
}

/// A plugin can describe its documents.
struct Describe;
impl Facet for Describe {
    type Output = String;

    const NAME: &'static str = "describe";
}

/// Written against the facet only: it names no language and no artifact.
struct Report;
impl Task for Report {
    fn identifier(&self) -> &'static str {
        "report"
    }

    fn applies(&self, _: &Document) -> bool {
        true
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        let first = context.facet::<Describe>().cloned();
        let again = context.facet::<Describe>().cloned();
        assert_eq!(first, again);
        out.file("txt", first.unwrap_or_else(|| "unanswered".into()));
    }
}

#[test]
fn a_facet_is_answered_by_a_matching_provider_once() {
    static CALLS: std::sync::atomic::AtomicUsize = std::sync::atomic::AtomicUsize::new(0);
    let mut reg = Registry::new();
    reg.artifact::<Len>()
        .task(Report)
        .provide::<Describe>("t", matches_t, |context| {
            CALLS.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
            format!("{} bytes", context.get::<Len>())
        });
    let docs = [
        reg.document("a.t", "abc").unwrap(),
        reg.document("b.o", "abcd").unwrap(),
    ];
    assert!(reg.artifacts().provides::<Describe>(&docs[0]));
    assert!(!reg.artifacts().provides::<Describe>(&docs[1]));
    let options = RunOptions {
        tasks: &[],
        sharing: Sharing::Shared,
        threads: Some(1),
    };
    let got: Vec<String> = run(&reg, &docs, &options)
        .unwrap()
        .into_iter()
        .map(|r| r.outputs[0].1.files[0].text.clone())
        .collect();
    assert_eq!(got, ["3 bytes", "unanswered"]);
    assert_eq!(CALLS.load(std::sync::atomic::Ordering::Relaxed), 1);
}

#[test]
fn facet_providers_choose_documents_by_path_or_content() {
    let mut reg = Registry::new();
    reg.task(Report)
        .provide::<Describe>("extension", matches_t, |_| "path".into())
        .provide::<Describe>(
            "content",
            |document| document.text == "special",
            |_| "content".into(),
        );
    let docs = [("a.t", ""), ("README", "special"), ("b.unknown", "")]
        .into_iter()
        .map(|(p, t)| reg.document(p, t).expect("valid text"))
        .collect::<Vec<_>>();
    let result = run(&reg, &docs, &options(&[])).expect("known tasks");
    let texts: Vec<_> = result
        .iter()
        .map(|r| r.outputs[0].1.files[0].text.as_str())
        .collect();
    assert_eq!(texts, ["path", "content", "unanswered"]);
}

#[test]
#[should_panic(expected = "multiple providers handle facet `describe`")]
fn overlapping_facet_providers_do_not_silently_pick_the_first() {
    let mut reg = Registry::new();
    reg.provide::<Describe>("one", matches_t, |_| String::new())
        .provide::<Describe>("two", matches_t, |_| String::new());
    let document = reg.document("a.t", "").expect("valid text");
    let context = DocumentContext::new(&document, reg.artifacts());
    let _answer = context.facet::<Describe>();
}

#[test]
#[should_panic(expected = "provides facet `describe` twice")]
fn provider_identifiers_are_unique_per_facet() {
    let mut reg = Registry::new();
    reg.provide::<Describe>("t", matches_t, |_| String::new())
        .provide::<Describe>("t", matches_t, |_| String::new());
}

#[test]
#[should_panic(expected = "task `panics` is registered twice")]
fn task_identifiers_are_unique_across_document_and_finish_tasks() {
    struct SameIdentifier;
    impl FinishTask for SameIdentifier {
        fn identifier(&self) -> &'static str {
            "panics"
        }

        fn applies(&self, _: &Document) -> bool {
            false
        }

        fn prepare(&self, _: &DocumentContext<'_>, _: &mut TaskOutput) -> Option<Part> {
            None
        }

        fn finish(&self, _: Vec<Part>, _: Vec<&mut TaskOutput>) {}
    }

    let mut reg = Registry::new();
    reg.task(Panics).finish_task(SameIdentifier);
}
