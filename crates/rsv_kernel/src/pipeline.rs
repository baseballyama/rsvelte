//! Languages, tasks and the scheduler.
//!
//! A plugin (a language crate) registers its [`Language`]s, its artifacts and its [`Task`]s into a
//! [`Registry`]. [`run`] then processes documents in parallel: each document gets one [`Ctx`] on
//! one worker, and the selected tasks run on it back to back while its data is hot in cache.
//!
//! A [`ProjectTask`] is for results that depend on other documents (type checking): its per-document
//! half runs in the same parallel pass, on the same `Ctx`, and its project half runs once after.

use crate::db::{Artifact, ArtifactRegistry, Ctx};
use crate::diag::Diagnostic;
use crate::metrics;
use crate::source::MAX_SOURCE_LEN;
use rayon::prelude::*;
use std::any::Any;

/// Built only by [`Document::new`], which checks the size limit.
#[non_exhaustive]
pub struct Document {
    /// Path as the user knows it; also the `filename` that output may depend on.
    pub path: String,
    pub text: String,
    /// Id of the [`Language`] that claimed the document.
    pub lang: &'static str,
}

#[derive(Debug, PartialEq, Eq)]
pub enum DocumentError {
    NoLanguage,
    /// Byte length; positions are `u32` (see [`MAX_SOURCE_LEN`]).
    TooLarge(usize),
}

impl Document {
    pub fn new(path: String, text: String, lang: &'static str) -> Result<Document, DocumentError> {
        if text.len() >= MAX_SOURCE_LEN as usize {
            return Err(DocumentError::TooLarge(text.len()));
        }
        Ok(Document { path, text, lang })
    }
}

pub trait Language: Send + Sync {
    fn id(&self) -> &'static str;
    fn matches(&self, path: &str) -> bool;
}

pub trait Task: Send + Sync {
    /// Stable id, also the metrics phase name and the CLI's `--task`: `<language>.<task>/<variant>`
    /// (`svelte.compile/client`, `svelte.lint/default`).
    fn id(&self) -> &'static str;
    fn applies(&self, doc: &Document) -> bool;
    fn run(&self, ctx: &Ctx, out: &mut TaskOutput);
}

/// What a [`ProjectTask`] carries from a document's pass to the project pass. Owned: the
/// document's `Ctx` is gone by then.
pub type Part = Box<dyn Any + Send>;

pub trait ProjectTask: Send + Sync {
    fn id(&self) -> &'static str;
    fn applies(&self, doc: &Document) -> bool;
    /// On the document's worker. Returns `None` when the document is finished here (its output
    /// is already in `out`).
    fn prepare(&self, ctx: &Ctx, out: &mut TaskOutput) -> Option<Part>;
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
    languages: Vec<Box<dyn Language>>,
    tasks: Vec<Box<dyn Task>>,
    project_tasks: Vec<Box<dyn ProjectTask>>,
    artifacts: ArtifactRegistry,
}

impl Registry {
    pub fn new() -> Registry {
        Registry::default()
    }

    pub fn language(&mut self, l: impl Language + 'static) -> &mut Self {
        self.languages.push(Box::new(l));
        self
    }

    pub fn task(&mut self, t: impl Task + 'static) -> &mut Self {
        self.tasks.push(Box::new(t));
        self
    }

    pub fn project_task(&mut self, t: impl ProjectTask + 'static) -> &mut Self {
        self.project_tasks.push(Box::new(t));
        self
    }

    pub fn artifact<A: Artifact>(&mut self) -> &mut Self {
        self.artifacts.register::<A>();
        self
    }

    pub fn artifacts(&self) -> &ArtifactRegistry {
        &self.artifacts
    }

    /// Tasks that run per document only (no project pass).
    pub fn document_task_ids(&self) -> Vec<&'static str> {
        self.tasks.iter().map(|t| t.id()).collect()
    }

    pub fn task_ids(&self) -> Vec<&'static str> {
        self.tasks
            .iter()
            .map(|t| t.id())
            .chain(self.project_tasks.iter().map(|t| t.id()))
            .collect()
    }

    pub fn language_of(&self, path: &str) -> Option<&'static str> {
        self.languages
            .iter()
            .find(|l| l.matches(path))
            .map(|l| l.id())
    }

    pub fn document(
        &self,
        path: impl Into<String>,
        text: impl Into<String>,
    ) -> Result<Document, DocumentError> {
        let path = path.into();
        let lang = self.language_of(&path).ok_or(DocumentError::NoLanguage)?;
        Document::new(path, text.into(), lang)
    }

    /// `Err` names the first id no registered task has.
    pub fn check_task_ids(&self, ids: &[&str]) -> Result<(), UnknownTask> {
        let known = self.task_ids();
        match ids.iter().find(|id| !known.contains(id)) {
            Some(id) => Err(UnknownTask {
                id: id.to_string(),
                known,
            }),
            None => Ok(()),
        }
    }

    fn selected(&self, ids: &[&str]) -> (Vec<&dyn Task>, Vec<&dyn ProjectTask>) {
        let wanted = |id: &str| ids.is_empty() || ids.contains(&id);
        (
            self.tasks
                .iter()
                .filter(|t| wanted(t.id()))
                .map(|t| t.as_ref())
                .collect(),
            self.project_tasks
                .iter()
                .filter(|t| wanted(t.id()))
                .map(|t| t.as_ref())
                .collect(),
        )
    }
}

#[derive(Debug, PartialEq, Eq)]
pub struct UnknownTask {
    pub id: String,
    pub known: Vec<&'static str>,
}

impl std::fmt::Display for UnknownTask {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "unknown task {}; known: {}",
            self.id,
            self.known.join(", ")
        )
    }
}

/// How tasks of one document share derived artifacts. `Isolated` exists to measure what sharing buys.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Sharing {
    Shared,
    Isolated,
}

pub struct RunOptions<'a> {
    /// Empty = every registered task.
    pub tasks: &'a [&'a str],
    pub sharing: Sharing,
    /// `None` = rayon's default (one worker per core).
    pub threads: Option<usize>,
}

pub struct DocResult {
    pub outputs: Vec<(&'static str, TaskOutput)>,
    /// Set when a task panicked; the document's other outputs are dropped.
    pub panic: Option<String>,
    /// (project task, index into `outputs`, part) until the project pass takes them.
    parts: Vec<(usize, usize, Part)>,
}

fn panic_message(e: Box<dyn Any + Send>) -> String {
    match e.downcast::<String>() {
        Ok(s) => *s,
        Err(e) => match e.downcast_ref::<&str>() {
            Some(s) => s.to_string(),
            None => "panicked with a payload that is not a string".to_string(),
        },
    }
}

fn run_document(
    reg: &Registry,
    doc: &Document,
    tasks: &[&dyn Task],
    project_tasks: &[&dyn ProjectTask],
    sharing: Sharing,
) -> DocResult {
    let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        let shared = std::cell::OnceCell::new();
        let shared = || shared.get_or_init(|| Ctx::new(doc, &reg.artifacts));
        let isolated = || Ctx::new(doc, &reg.artifacts);
        let mut outputs = Vec::new();
        let mut parts = Vec::new();
        for task in tasks.iter().filter(|t| t.applies(doc)) {
            let own;
            let ctx = match sharing {
                Sharing::Shared => shared(),
                Sharing::Isolated => {
                    own = isolated();
                    &own
                }
            };
            let mut out = TaskOutput::default();
            {
                let _p = metrics::phase(task.id());
                task.run(ctx, &mut out);
            }
            outputs.push((task.id(), out));
        }
        for (k, task) in project_tasks.iter().enumerate() {
            if !task.applies(doc) {
                continue;
            }
            let own;
            let ctx = match sharing {
                Sharing::Shared => shared(),
                Sharing::Isolated => {
                    own = isolated();
                    &own
                }
            };
            let mut out = TaskOutput::default();
            let part = {
                let _p = metrics::phase(task.id());
                task.prepare(ctx, &mut out)
            };
            if let Some(part) = part {
                parts.push((k, outputs.len(), part));
            }
            outputs.push((task.id(), out));
        }
        (outputs, parts)
    }));
    match result {
        Ok((outputs, parts)) => DocResult {
            outputs,
            panic: None,
            parts,
        },
        Err(e) => DocResult {
            outputs: Vec::new(),
            panic: Some(panic_message(e)),
            parts: Vec::new(),
        },
    }
}

/// Runs every project task over the documents that prepared a part for it. Parts are grouped by
/// task in one pass, so the cost is the number of parts, not tasks × documents.
fn finish_projects(project_tasks: &[&dyn ProjectTask], results: &mut [DocResult]) {
    let mut by_task: Vec<Vec<(usize, usize, Part)>> =
        project_tasks.iter().map(|_| Vec::new()).collect();
    for (d, r) in results.iter_mut().enumerate() {
        for (k, o, part) in std::mem::take(&mut r.parts) {
            by_task[k].push((d, o, part));
        }
    }
    for (task, owned) in project_tasks.iter().zip(by_task) {
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
                let _p = metrics::phase(task.id());
                task.finish(parts, outs);
            }))
        };
        if let Err(e) = panicked {
            let msg = panic_message(e);
            for &(d, _) in &owners {
                results[d].panic = Some(msg.clone());
                results[d].outputs.clear();
            }
        }
    }
}

/// Runs the pipeline and hands each document's result to `sink` as soon as it is final, on
/// whichever worker finished it: a document is dropped from memory when its sink call returns,
/// so peak memory follows the working set, not the corpus. Documents waiting for a project pass
/// are held until it finishes.
pub fn run_each(
    reg: &Registry,
    docs: &[Document],
    opts: &RunOptions,
    sink: &(dyn Fn(usize, DocResult) + Sync),
) -> Result<(), UnknownTask> {
    reg.check_task_ids(opts.tasks)?;
    let (tasks, project_tasks) = reg.selected(opts.tasks);
    let work = || {
        let waiting = std::sync::Mutex::new(Vec::new());
        docs.par_iter().enumerate().for_each(|(i, d)| {
            let r = run_document(reg, d, &tasks, &project_tasks, opts.sharing);
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
        let (index, mut results): (Vec<usize>, Vec<DocResult>) = waiting.into_iter().unzip();
        finish_projects(&project_tasks, &mut results);
        for (i, r) in index.into_iter().zip(results) {
            sink(i, r);
        }
    };
    in_pool(opts.threads, work);
    Ok(())
}

/// [`run_each`], collected in document order.
pub fn run(
    reg: &Registry,
    docs: &[Document],
    opts: &RunOptions,
) -> Result<Vec<DocResult>, UnknownTask> {
    let slots: Vec<std::sync::Mutex<Option<DocResult>>> =
        docs.iter().map(|_| std::sync::Mutex::new(None)).collect();
    run_each(reg, docs, opts, &|i, r| {
        *slots[i].lock().expect("each slot is written once") = Some(r);
    })?;
    Ok(slots
        .into_iter()
        .map(|s| {
            s.into_inner()
                .expect("each slot is written once")
                .expect("every document reaches the sink")
        })
        .collect())
}

/// Pools are kept for the process, so repeated runs reuse their threads and those threads'
/// buffer pools, as runs on rayon's global pool do.
fn in_pool(threads: Option<usize>, work: impl FnOnce() + Send) {
    static POOLS: std::sync::Mutex<Vec<(usize, &'static rayon::ThreadPool)>> =
        std::sync::Mutex::new(Vec::new());
    let Some(n) = threads else {
        return work();
    };
    let pool = {
        let mut pools = POOLS.lock().expect("no panics under the lock");
        match pools.iter().find(|(m, _)| *m == n) {
            Some(&(_, p)) => p,
            None => {
                let p: &'static rayon::ThreadPool = Box::leak(Box::new(
                    rayon::ThreadPoolBuilder::new()
                        .num_threads(n)
                        .build()
                        .expect("thread pool"),
                ));
                pools.push((n, p));
                p
            }
        }
    };
    pool.install(work)
}

#[cfg(test)]
mod tests {
    use super::*;

    struct Lang;
    impl Language for Lang {
        fn id(&self) -> &'static str {
            "t"
        }
        fn matches(&self, path: &str) -> bool {
            path.ends_with(".t")
        }
    }

    struct Len;
    impl Artifact for Len {
        type Output = usize;
        const NAME: &'static str = "len";
        fn compute(ctx: &Ctx) -> usize {
            ctx.src().len()
        }
    }

    /// Each document's part is its length; the project half writes the total into every output.
    struct Total;
    impl ProjectTask for Total {
        fn id(&self) -> &'static str {
            "total"
        }
        fn applies(&self, _: &Document) -> bool {
            true
        }
        fn prepare(&self, ctx: &Ctx, out: &mut TaskOutput) -> Option<Part> {
            if ctx.src().is_empty() {
                out.file("txt", "empty".into());
                return None;
            }
            Some(Box::new(*ctx.get::<Len>()))
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
    fn a_project_task_sees_every_prepared_document_once() {
        let mut reg = Registry::new();
        reg.language(Lang).artifact::<Len>().project_task(Total);
        let docs: Vec<Document> = [("a.t", "ab"), ("b.t", ""), ("c.t", "cde")]
            .into_iter()
            .map(|(p, t)| reg.document(p, t).unwrap())
            .collect();
        let opts = RunOptions {
            tasks: &[],
            sharing: Sharing::Shared,
            threads: Some(2),
        };
        let texts: Vec<String> = run(&reg, &docs, &opts)
            .unwrap()
            .into_iter()
            .map(|r| r.outputs[0].1.files[0].text.clone())
            .collect();
        assert_eq!(texts, ["2/5", "empty", "3/5"]);
    }

    /// Like [`Total`], under another id and counting documents instead of bytes.
    struct Count;
    impl ProjectTask for Count {
        fn id(&self) -> &'static str {
            "count"
        }
        fn applies(&self, doc: &Document) -> bool {
            doc.path != "b.t"
        }
        fn prepare(&self, _: &Ctx, _: &mut TaskOutput) -> Option<Part> {
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
        fn id(&self) -> &'static str {
            "panics"
        }
        fn applies(&self, _: &Document) -> bool {
            true
        }
        fn run(&self, _: &Ctx, _: &mut TaskOutput) {
            std::panic::panic_any(42u8);
        }
    }

    fn setup() -> (Registry, Vec<Document>) {
        let mut reg = Registry::new();
        reg.language(Lang)
            .artifact::<Len>()
            .project_task(Total)
            .project_task(Count)
            .task(Panics);
        let docs = [("a.t", "ab"), ("b.t", "x"), ("c.t", "cde")]
            .into_iter()
            .map(|(p, t)| reg.document(p, t).unwrap())
            .collect();
        (reg, docs)
    }

    fn opts<'a>(tasks: &'a [&'a str]) -> RunOptions<'a> {
        RunOptions {
            tasks,
            sharing: Sharing::Shared,
            threads: Some(2),
        }
    }

    #[test]
    fn each_project_task_gets_only_its_own_parts() {
        let (reg, docs) = setup();
        let got: Vec<Vec<String>> = run(&reg, &docs, &opts(&["total", "count"]))
            .unwrap()
            .into_iter()
            .map(|r| {
                r.outputs
                    .iter()
                    .map(|(id, o)| format!("{id}={}", o.files[0].text))
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
    fn an_unknown_task_id_is_an_error() {
        let (reg, docs) = setup();
        let err = run(&reg, &docs, &opts(&["total", "totl"])).err().unwrap();
        assert_eq!(err.id, "totl");
    }

    #[test]
    fn a_panic_without_a_string_payload_still_says_so() {
        let (reg, docs) = setup();
        let r = run(&reg, &docs[..1], &opts(&["panics"])).unwrap();
        assert_eq!(
            r[0].panic.as_deref(),
            Some("panicked with a payload that is not a string")
        );
    }
}
