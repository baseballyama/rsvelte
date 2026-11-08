//! What a task is: per-document work over shared artifacts, and the output it leaves.
//!
//! A [`FinishTask`] is for results that depend on other documents (type checking): its
//! per-document half runs in the same parallel pass, on the same `DocumentContext`, and its project
//! half runs once after.

use std::any::Any;

use crate::computation::database::{ArtifactRegistry, DocumentContext};
use crate::diagnostics::Diagnostic;
use crate::source::document::Document;

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
    /// `artifacts` lets a task select the documents a facet is provided for, whichever plugin
    /// provides it.
    fn applies(&self, document: &Document, artifacts: &ArtifactRegistry) -> bool;
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
