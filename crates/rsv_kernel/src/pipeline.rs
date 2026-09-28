//! Languages, tasks and the scheduler.
//!
//! A plugin (a language crate) registers its [`Language`]s, its artifacts and its [`Task`]s into a
//! [`Registry`]. [`run`] then processes documents in parallel: each document gets one [`Ctx`] on
//! one worker, and the selected tasks run on it back to back while its data is hot in cache.

use crate::db::{Artifact, ArtifactRegistry, Ctx};
use crate::diag::Diagnostic;
use crate::metrics;
use crate::source::MAX_SOURCE_LEN;
use rayon::prelude::*;

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
    /// Stable id, also the metrics phase name (`svelte.compile.client`, `svelte.lint`, …).
    fn id(&self) -> &'static str;
    fn applies(&self, doc: &Document) -> bool;
    fn run(&self, ctx: &Ctx, out: &mut TaskOutput);
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

    pub fn artifact<A: Artifact>(&mut self) -> &mut Self {
        self.artifacts.register::<A>();
        self
    }

    pub fn artifacts(&self) -> &ArtifactRegistry {
        &self.artifacts
    }

    pub fn task_ids(&self) -> Vec<&'static str> {
        self.tasks.iter().map(|t| t.id()).collect()
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

    fn selected(&self, ids: &[&str]) -> Vec<&dyn Task> {
        self.tasks
            .iter()
            .filter(|t| ids.is_empty() || ids.contains(&t.id()))
            .map(|t| t.as_ref())
            .collect()
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
}

pub fn run_document(
    reg: &Registry,
    doc: &Document,
    tasks: &[&dyn Task],
    sharing: Sharing,
) -> DocResult {
    let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        let shared = Ctx::new(doc, &reg.artifacts);
        let mut outputs = Vec::new();
        for task in tasks.iter().filter(|t| t.applies(doc)) {
            let isolated;
            let ctx = match sharing {
                Sharing::Shared => &shared,
                Sharing::Isolated => {
                    isolated = Ctx::new(doc, &reg.artifacts);
                    &isolated
                }
            };
            let mut out = TaskOutput::default();
            {
                let _p = metrics::phase(task.id());
                task.run(ctx, &mut out);
            }
            outputs.push((task.id(), out));
        }
        outputs
    }));
    match result {
        Ok(outputs) => DocResult {
            outputs,
            panic: None,
        },
        Err(e) => DocResult {
            outputs: Vec::new(),
            panic: Some(
                e.downcast_ref::<String>()
                    .cloned()
                    .or_else(|| e.downcast_ref::<&str>().map(|s| s.to_string()))
                    .unwrap_or_default(),
            ),
        },
    }
}

pub fn run(reg: &Registry, docs: &[Document], opts: &RunOptions) -> Vec<DocResult> {
    let tasks = reg.selected(opts.tasks);
    let work = || {
        docs.par_iter()
            .map(|d| run_document(reg, d, &tasks, opts.sharing))
            .collect()
    };
    match opts.threads {
        Some(n) => rayon::ThreadPoolBuilder::new()
            .num_threads(n)
            .build()
            .expect("thread pool")
            .install(work),
        None => work(),
    }
}
