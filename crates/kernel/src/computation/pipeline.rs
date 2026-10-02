//! Tasks and the scheduler.
//!
//! A plugin registers its artifacts and [`Task`]s into a [`Registry`]. [`run`] then processes
//! documents in parallel: each document gets one [`DocumentContext`] on
//! one worker, and the selected tasks run on it back to back while its data is hot in cache.
//!
//! A [`FinishTask`] is for results that depend on other documents (type checking): its
//! per-document half runs in the same parallel pass, on the same `DocumentContext`, and its project
//! half runs once after.

use std::any::Any;

#[cfg(not(target_arch = "wasm32"))]
use rayon::prelude::*;

use crate::computation::database::{Artifact, ArtifactRegistry, DocumentContext, Facet};
use crate::diagnostics::diagnostic::Diagnostic;
use crate::performance::measurement;
use crate::source::positions::MAXIMUM_SOURCE_LENGTH;

/// Built only by [`Document::new`], which checks the size limit.
#[non_exhaustive]
#[derive(Debug)]
pub struct Document {
    /// Path as the user knows it; also the `filename` that output may depend on.
    pub path: String,
    pub text: String,
}

#[derive(Debug, PartialEq, Eq)]
pub enum DocumentError {
    /// Byte length; positions are `u32` (see [`MAXIMUM_SOURCE_LENGTH`]).
    TooLarge(usize),
}

impl Document {
    /// # Errors
    ///
    /// [`DocumentError::TooLarge`] if `text` is [`MAXIMUM_SOURCE_LENGTH`] bytes or longer.
    pub fn new(path: String, text: String) -> Result<Self, DocumentError> {
        if text.len() >= MAXIMUM_SOURCE_LENGTH as usize {
            return Err(DocumentError::TooLarge(text.len()));
        }
        Ok(Self { path, text })
    }
}

pub trait Task: Send + Sync {
    /// Stable identifier, also the metrics phase name and the CLI's `--task`:
    /// `<plugin>.<task>/<variant>` (`svelte.compile/client`, `svelte.lint/default`).
    fn identifier(&self) -> &'static str;
    fn applies(&self, document: &Document) -> bool;
    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput);
}

/// What a [`FinishTask`] carries from a document's pass to the project pass. Owned: the
/// document's `DocumentContext` is gone by then.
pub type Part = Box<dyn Any + Send>;

pub trait FinishTask: Send + Sync {
    fn identifier(&self) -> &'static str;
    fn applies(&self, document: &Document) -> bool;
    /// On the document's worker. Returns `None` when the document is finished here (its output
    /// is already in `out`).
    fn prepare(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) -> Option<Part>;
    /// Once, over every document `prepare` returned a part for; `parts[i]` belongs to `outs[i]`.
    fn finish(&self, parts: Vec<Part>, outs: Vec<&mut TaskOutput>);
}

#[derive(Default, Debug)]
pub struct TaskOutput {
    pub files: Vec<OutputFile>,
    pub diagnostics: Vec<Diagnostic>,
}

#[derive(Debug)]
pub struct OutputFile {
    /// Relative name the task gives the output (`client.js`, `formatted.svelte`, …).
    pub name: String,
    pub text: String,
}

impl TaskOutput {
    pub fn file(&mut self, name: impl Into<String>, text: String) {
        self.files.push(OutputFile {
            name: name.into(),
            text,
        });
    }
}

#[derive(Default)]
pub struct Registry {
    tasks: Vec<Box<dyn Task>>,
    finish_tasks: Vec<Box<dyn FinishTask>>,
    artifacts: ArtifactRegistry,
}

impl std::fmt::Debug for Registry {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Registry")
            .field("artifacts", &self.artifacts)
            .finish_non_exhaustive()
    }
}

impl Registry {
    #[must_use]
    pub fn new() -> Self {
        Self::default()
    }

    /// # Panics
    ///
    /// If another document or finish task uses the same identifier.
    pub fn task(&mut self, t: impl Task + 'static) -> &mut Self {
        self.assert_new_task_identifier(t.identifier());
        self.tasks.push(Box::new(t));
        self
    }

    /// # Panics
    ///
    /// If another document or finish task uses the same identifier.
    pub fn finish_task(&mut self, t: impl FinishTask + 'static) -> &mut Self {
        self.assert_new_task_identifier(t.identifier());
        self.finish_tasks.push(Box::new(t));
        self
    }

    fn assert_new_task_identifier(&self, identifier: &str) {
        assert!(
            self.tasks.iter().all(|t| t.identifier() != identifier)
                && self
                    .finish_tasks
                    .iter()
                    .all(|t| t.identifier() != identifier),
            "task `{identifier}` is registered twice"
        );
    }

    pub fn artifact<A: Artifact>(&mut self) -> &mut Self {
        self.artifacts.register::<A>();
        self
    }

    /// See [`ArtifactRegistry::provide`].
    pub fn provide<F: Facet>(
        &mut self,
        identifier: &'static str,
        applies: impl Fn(&Document) -> bool + Send + Sync + 'static,
        provider: impl Fn(&DocumentContext<'_>) -> F::Output + Send + Sync + 'static,
    ) -> &mut Self {
        self.artifacts.provide::<F>(identifier, applies, provider);
        self
    }

    #[must_use]
    pub const fn artifacts(&self) -> &ArtifactRegistry {
        &self.artifacts
    }

    /// Tasks that run per document only (no project pass).
    #[must_use]
    pub fn document_task_identifiers(&self) -> Vec<&'static str> {
        self.tasks.iter().map(|t| t.identifier()).collect()
    }

    pub fn wrap_document_tasks(&mut self, mut wrap: impl FnMut(Box<dyn Task>) -> Box<dyn Task>) {
        self.tasks = std::mem::take(&mut self.tasks)
            .into_iter()
            .map(&mut wrap)
            .collect();
    }

    #[must_use]
    pub fn task_identifiers(&self) -> Vec<&'static str> {
        self.tasks
            .iter()
            .map(|t| t.identifier())
            .chain(self.finish_tasks.iter().map(|t| t.identifier()))
            .collect()
    }

    /// # Errors
    ///
    /// [`DocumentError::TooLarge`] if `text` is [`MAXIMUM_SOURCE_LENGTH`] bytes or longer.
    pub fn document(
        &self,
        path: impl Into<String>,
        text: impl Into<String>,
    ) -> Result<Document, DocumentError> {
        Document::new(path.into(), text.into())
    }

    /// # Errors
    ///
    /// [`UnknownTask`] naming the first identifier no registered task has.
    pub fn check_task_identifiers(&self, identifiers: &[&str]) -> Result<(), UnknownTask> {
        let known = self.task_identifiers();
        identifiers
            .iter()
            .find(|identifier| !known.contains(identifier))
            .map_or(Ok(()), |identifier| {
                Err(UnknownTask {
                    identifier: identifier.to_string(),
                    known,
                })
            })
    }

    fn selected(&self, identifiers: &[&str]) -> (Vec<&dyn Task>, Vec<&dyn FinishTask>) {
        let wanted = |identifier: &str| identifiers.is_empty() || identifiers.contains(&identifier);
        (
            self.tasks
                .iter()
                .filter(|t| wanted(t.identifier()))
                .map(AsRef::as_ref)
                .collect(),
            self.finish_tasks
                .iter()
                .filter(|t| wanted(t.identifier()))
                .map(AsRef::as_ref)
                .collect(),
        )
    }
}

#[derive(Debug, PartialEq, Eq)]
pub struct UnknownTask {
    pub identifier: String,
    pub known: Vec<&'static str>,
}

impl std::fmt::Display for UnknownTask {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "unknown task {}; known: {}",
            self.identifier,
            self.known.join(", ")
        )
    }
}

/// How tasks of one document share derived artifacts. `Isolated` exists to measure what sharing
/// buys.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Sharing {
    Shared,
    Isolated,
}

#[derive(Debug)]
pub struct RunOptions<'a> {
    /// Empty = every registered task.
    pub tasks: &'a [&'a str],
    pub sharing: Sharing,
    /// `None` = rayon's default (one worker per core).
    pub threads: Option<usize>,
}

#[derive(Debug)]
pub struct DocumentResult {
    pub outputs: Vec<(&'static str, TaskOutput)>,
    /// Set when a task panicked; the document's other outputs are dropped.
    pub panic: Option<String>,
    /// (finish task, index into `outputs`, part) until the project pass takes them.
    parts: Vec<(usize, usize, Part)>,
}

fn panic_message(e: Box<dyn Any + Send>) -> String {
    match e.downcast::<String>() {
        Ok(s) => *s,
        Err(e) => e.downcast_ref::<&str>().map_or_else(
            || "panicked with a payload that is not a string".to_owned(),
            ToString::to_string,
        ),
    }
}

fn run_document(
    reg: &Registry,
    document: &Document,
    tasks: &[&dyn Task],
    finish_tasks: &[&dyn FinishTask],
    sharing: Sharing,
) -> DocumentResult {
    let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        let shared = std::cell::OnceCell::new();
        let shared = || shared.get_or_init(|| DocumentContext::new(document, &reg.artifacts));
        let isolated = || DocumentContext::new(document, &reg.artifacts);
        let mut outputs = Vec::new();
        let mut parts = Vec::new();
        for task in tasks.iter().filter(|t| t.applies(document)) {
            let own;
            let context = match sharing {
                Sharing::Shared => shared(),
                Sharing::Isolated => {
                    own = isolated();
                    &own
                }
            };
            let mut out = TaskOutput::default();
            {
                let _p = measurement::phase(task.identifier());
                task.run(context, &mut out);
            }
            outputs.push((task.identifier(), out));
        }
        for (k, task) in finish_tasks.iter().enumerate() {
            if !task.applies(document) {
                continue;
            }
            let own;
            let context = match sharing {
                Sharing::Shared => shared(),
                Sharing::Isolated => {
                    own = isolated();
                    &own
                }
            };
            let mut out = TaskOutput::default();
            let part = {
                let _p = measurement::phase(task.identifier());
                task.prepare(context, &mut out)
            };
            if let Some(part) = part {
                parts.push((k, outputs.len(), part));
            }
            outputs.push((task.identifier(), out));
        }
        (outputs, parts)
    }));
    match result {
        Ok((outputs, parts)) => DocumentResult {
            outputs,
            panic: None,
            parts,
        },
        Err(e) => DocumentResult {
            outputs: Vec::new(),
            panic: Some(panic_message(e)),
            parts: Vec::new(),
        },
    }
}

/// Runs every finish task over the documents that prepared a part for it. Parts are grouped by
/// task in one pass, so the cost is the number of parts, not tasks × documents.
fn run_finish_tasks(finish_tasks: &[&dyn FinishTask], results: &mut [DocumentResult]) {
    let mut by_task: Vec<Vec<(usize, usize, Part)>> =
        finish_tasks.iter().map(|_| Vec::new()).collect();
    for (d, r) in results.iter_mut().enumerate() {
        for (k, o, part) in std::mem::take(&mut r.parts) {
            by_task[k].push((d, o, part));
        }
    }
    for (task, owned) in finish_tasks.iter().zip(by_task) {
        if owned.is_empty() {
            continue;
        }
        let owners: Vec<(usize, usize)> = owned.iter().map(|&(d, o, _)| (d, o)).collect();
        let parts: Vec<Part> = owned.into_iter().map(|(_, _, p)| p).collect();
        let panicked = {
            let mut by_doc: Vec<Vec<Option<&mut TaskOutput>>> = results
                .iter_mut()
                .map(|r| r.outputs.iter_mut().map(|(_, o)| Some(o)).collect())
                .collect();
            let outs: Vec<&mut TaskOutput> = owners
                .iter()
                .map(|&(d, o)| by_doc[d][o].take().expect("one part per task output"))
                .collect();
            std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
                let _p = measurement::phase(task.identifier());
                task.finish(parts, outs);
            }))
        };
        if let Err(e) = panicked {
            let msg = panic_message(e);
            for &(d, _) in &owners {
                results[d].panic.get_or_insert_with(|| msg.clone());
            }
        }
    }
    for result in results.iter_mut().filter(|r| r.panic.is_some()) {
        result.outputs.clear();
    }
}

/// Runs the pipeline and hands each document's result to `sink` as soon as it is final.
///
/// The sink runs on whichever worker finished the document: a document is dropped from memory
/// when its sink call returns, so peak memory follows the working set, not the corpus. Documents
/// waiting for a project pass are held until it finishes.
///
/// # Errors
///
/// [`UnknownTask`] if `options.tasks` names a task that is not registered; nothing runs then.
///
/// # Panics
///
/// If a worker thread pool of `options.threads` threads cannot be built.
pub fn run_each(
    reg: &Registry,
    docs: &[Document],
    options: &RunOptions<'_>,
    sink: &(dyn Fn(usize, DocumentResult) + Sync),
) -> Result<(), UnknownTask> {
    reg.check_task_identifiers(options.tasks)?;
    let (tasks, finish_tasks) = reg.selected(options.tasks);
    let work = || {
        let waiting = std::sync::Mutex::new(Vec::new());
        #[cfg(not(target_arch = "wasm32"))]
        let documents = docs.par_iter();
        #[cfg(target_arch = "wasm32")]
        let documents = docs.iter();
        documents.enumerate().for_each(|(i, d)| {
            let r = run_document(reg, d, &tasks, &finish_tasks, options.sharing);
            if r.parts.is_empty() {
                sink(i, r);
            } else {
                waiting
                    .lock()
                    .expect("no panics under the lock")
                    .push((i, r));
            }
        });
        let mut waiting = waiting.into_inner().expect("no panics under the lock");
        waiting.sort_unstable_by_key(|(i, _)| *i);
        let (index, mut results): (Vec<usize>, Vec<DocumentResult>) = waiting.into_iter().unzip();
        run_finish_tasks(&finish_tasks, &mut results);
        for (i, r) in index.into_iter().zip(results) {
            sink(i, r);
        }
    };
    in_pool(options.threads, work);
    Ok(())
}

/// [`run_each`], collected in document order.
///
/// # Errors
///
/// [`UnknownTask`] if `options.tasks` names a task that is not registered; nothing runs then.
///
/// # Panics
///
/// If a worker thread pool of `options.threads` threads cannot be built.
pub fn run(
    reg: &Registry,
    docs: &[Document],
    options: &RunOptions<'_>,
) -> Result<Vec<DocumentResult>, UnknownTask> {
    reg.check_task_identifiers(options.tasks)?;
    let (tasks, finish_tasks) = reg.selected(options.tasks);
    // Collected in order by rayon rather than through `run_each`'s sink: a slot per document
    // would need a lock, and macOS's mutex allocates on first use where Linux's does not, which
    // would make the allocation counters depend on the platform.
    let mut results = Vec::new();
    in_pool(options.threads, || {
        #[cfg(not(target_arch = "wasm32"))]
        let documents = docs.par_iter();
        #[cfg(target_arch = "wasm32")]
        let documents = docs.iter();
        results = documents
            .map(|d| run_document(reg, d, &tasks, &finish_tasks, options.sharing))
            .collect();
        run_finish_tasks(&finish_tasks, &mut results);
    });
    Ok(results)
}

/// The last requested pool is kept for the process, so repeated runs reuse its threads and those
/// threads' buffer pools, as runs on rayon's global pool do.
#[cfg(not(target_arch = "wasm32"))]
fn in_pool(threads: Option<usize>, work: impl FnOnce() + Send) {
    static POOL: std::sync::Mutex<Option<(usize, std::sync::Arc<rayon::ThreadPool>)>> =
        std::sync::Mutex::new(None);
    let Some(n) = threads else {
        return work();
    };
    let pool = {
        let mut cached = POOL.lock().expect("no panics under the lock");
        if let Some((_, pool)) = cached.as_ref().filter(|(threads, _)| *threads == n) {
            std::sync::Arc::clone(pool)
        } else {
            let pool = std::sync::Arc::new(
                rayon::ThreadPoolBuilder::new()
                    .num_threads(n)
                    .build()
                    .expect("thread pool"),
            );
            *cached = Some((n, std::sync::Arc::clone(&pool)));
            pool
        }
    };
    pool.install(work);
}

#[cfg(target_arch = "wasm32")]
fn in_pool(_: Option<usize>, work: impl FnOnce() + Send) {
    work();
}

#[cfg(test)]
mod tests {
    use super::*;

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
        for sharing in [Sharing::Shared, Sharing::Isolated] {
            let options = RunOptions {
                tasks: &[],
                sharing,
                threads: Some(2),
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
}
