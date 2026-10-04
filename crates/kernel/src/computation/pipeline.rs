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
use crate::computation::plugins::{Plugin, PluginError, Plugins};
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

/// Tasks read shared artifacts and produce separate output; they do not modify the input.
pub trait Task: Send + Sync {
    /// Opaque name used for task selection and measurement.
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
    /// Relative name chosen by the task.
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
    plugins: Plugins,
}

impl std::fmt::Debug for Registry {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Registry")
            .field("artifacts", &self.artifacts)
            .field("plugins", &self.plugins)
            .finish_non_exhaustive()
    }
}

impl Registry {
    #[must_use]
    pub fn new() -> Self {
        Self::default()
    }

    pub fn plugin(&mut self, plugin: &'static Plugin) -> &mut Self {
        self.plugins.register(plugin);
        self
    }

    #[must_use]
    pub fn plugins(&self) -> impl ExactSizeIterator<Item = &'static Plugin> + '_ {
        self.plugins.declarations()
    }

    /// # Errors
    ///
    /// Invalid declarations, missing or incompatible dependencies, or a dependency cycle.
    pub fn validate_plugins(&self) -> Result<(), PluginError> {
        self.plugins.validate()
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

#[derive(Debug, PartialEq, Eq)]
pub enum RunError {
    Plugins(PluginError),
    UnknownTask(UnknownTask),
}

impl std::fmt::Display for RunError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Plugins(error) => error.fmt(f),
            Self::UnknownTask(error) => error.fmt(f),
        }
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
/// [`RunError`] if plugins are invalid or a selected task is unknown; nothing runs then.
///
/// # Panics
///
/// If a worker thread pool of `options.threads` threads cannot be built.
pub fn run_each(
    reg: &Registry,
    docs: &[Document],
    options: &RunOptions<'_>,
    sink: &(dyn Fn(usize, DocumentResult) + Sync),
) -> Result<(), RunError> {
    reg.validate_plugins().map_err(RunError::Plugins)?;
    reg.check_task_identifiers(options.tasks)
        .map_err(RunError::UnknownTask)?;
    let (tasks, finish_tasks) = reg.selected(options.tasks);
    let work = || {
        let waiting = std::sync::Mutex::new(Vec::new());
        let visit = |(i, d)| {
            let r = run_document(reg, d, &tasks, &finish_tasks, options.sharing);
            if r.parts.is_empty() {
                sink(i, r);
            } else {
                waiting
                    .lock()
                    .expect("no panics under the lock")
                    .push((i, r));
            }
        };
        #[cfg(not(target_arch = "wasm32"))]
        if options.threads == Some(1) {
            docs.iter().enumerate().for_each(visit);
        } else {
            docs.par_iter().enumerate().for_each(visit);
        }
        #[cfg(target_arch = "wasm32")]
        docs.iter().enumerate().for_each(visit);
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
/// [`RunError`] if plugins are invalid or a selected task is unknown; nothing runs then.
///
/// # Panics
///
/// If a worker thread pool of `options.threads` threads cannot be built.
pub fn run(
    reg: &Registry,
    docs: &[Document],
    options: &RunOptions<'_>,
) -> Result<Vec<DocumentResult>, RunError> {
    reg.validate_plugins().map_err(RunError::Plugins)?;
    reg.check_task_identifiers(options.tasks)
        .map_err(RunError::UnknownTask)?;
    let (tasks, finish_tasks) = reg.selected(options.tasks);
    // Ordered collection avoids the per-output locks a sink would need.
    let mut results = Vec::new();
    in_pool(options.threads, || {
        let compile = |d| run_document(reg, d, &tasks, &finish_tasks, options.sharing);
        #[cfg(not(target_arch = "wasm32"))]
        {
            results = if options.threads == Some(1) {
                docs.iter().map(compile).collect()
            } else {
                docs.par_iter().map(compile).collect()
            };
        }
        #[cfg(target_arch = "wasm32")]
        {
            results = docs.iter().map(compile).collect();
        }
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
    if threads == Some(1) {
        return work();
    }
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
mod tests;
