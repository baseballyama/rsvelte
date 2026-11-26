//! What a run can do: the plugins, artifacts, facets, and tasks registered for it.
//!
//! A plugin registers its artifacts and tasks into a [`Registry`];
//! [`run`](crate::computation::pipeline::run) then runs the selected tasks over documents.

use std::any::{Any, TypeId};
use std::collections::HashMap;

use crate::computation::database::{Artifact, ArtifactRegistry, DocumentContext, Facet};
use crate::computation::plugins::{Plugin, PluginError, Plugins};
use crate::computation::task::{FinishTask, Task};
use crate::diagnostics::Diagnostic;
use crate::source::document::Document;

#[derive(Default)]
pub struct Registry {
    tasks: Vec<Box<dyn Task>>,
    finish_tasks: Vec<Box<dyn FinishTask>>,
    artifacts: ArtifactRegistry,
    plugins: Plugins,
    contributions: HashMap<TypeId, Box<dyn Any + Send + Sync>>,
}

/// A list one plugin owns and other plugins add to, such as a linter's rules. The owner reads it
/// when it installs, so contributors install first.
pub trait Contribution: 'static {
    type Item: Send + Sync + 'static;
}

/// How a task names the files of the project it checks, as the project's own tool selects them,
/// for a host given a project instead of files: the task, and the function that names them.
#[derive(Debug)]
pub struct ProjectFiles;

/// Names the files of a project from the installed plugins.
pub type ProjectFilesFn = Box<dyn Fn(&Registry) -> Result<Project, String> + Send + Sync>;

/// The files of a project, and what is wrong with the configuration that selects them.
#[derive(Debug, Default)]
pub struct Project {
    pub files: Vec<std::path::PathBuf>,
    /// Errors in the configuration, each in the file that has it, such as a `tsconfig.json`. The
    /// project's own tool reports only these when there are any, instead of checking the files.
    pub problems: Vec<(std::path::PathBuf, Diagnostic)>,
}

impl Contribution for ProjectFiles {
    type Item = (&'static str, ProjectFilesFn);
}

/// Files that tasks read with other text than the disk's, such as a package's types a checker
/// rewrites.
///
/// A host reads every document through [`Registry::read`], so the document, its positions and
/// what the task reads have one text.
#[derive(Debug)]
pub struct ReplacedFiles;

#[derive(Debug)]
pub struct ReplacedFile {
    /// The tasks that read the file replaced.
    pub tasks: &'static [&'static str],
    /// The file's real path.
    pub path: std::path::PathBuf,
    pub text: String,
}

impl Contribution for ReplacedFiles {
    type Item = ReplacedFile;
}

impl std::fmt::Debug for Registry {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Registry")
            .field("artifacts", &self.artifacts)
            .field("plugins", &self.plugins)
            .field("contributions", &self.contributions.len())
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

    /// The text `tasks` read `file` with: the disk's, unless a task among them replaces it.
    ///
    /// # Errors
    ///
    /// `file` cannot be read.
    pub fn read(&self, file: &std::path::Path, tasks: &[&str]) -> std::io::Result<String> {
        // Only a file the tasks may read replaced needs its real path, which costs a lookup of
        // each directory of it. The real path ends in the file's own name unless the file is a
        // link, and a replaced file's real path ends in its name.
        let name = file.file_name();
        let named = |replaced: &ReplacedFile| name.is_none() || replaced.path.file_name() == name;
        let may_be_replaced = self.replaced(tasks).next().is_some()
            && (self.replaced(tasks).any(named) || std::fs::symlink_metadata(file)?.is_symlink());
        if !may_be_replaced {
            return std::fs::read_to_string(file);
        }
        let real = crate::source::paths::canonicalize(file)?;
        self.replacement(&real, tasks)
            .map_or_else(|| std::fs::read_to_string(file), |text| Ok(text.to_owned()))
    }

    /// The text a task among `tasks` reads the file at the real path `real` with in place of the
    /// disk's, if one replaces it.
    #[must_use]
    pub fn replacement(&self, real: &std::path::Path, tasks: &[&str]) -> Option<&str> {
        (self.replaced(tasks))
            .find(|replaced| replaced.path == real)
            .map(|replaced| replaced.text.as_str())
    }

    fn replaced(&self, tasks: &[&str]) -> impl Iterator<Item = &ReplacedFile> {
        (self.contributions::<ReplacedFiles>().iter())
            .filter(move |replaced| replaced.tasks.iter().any(|task| tasks.contains(task)))
    }

    /// The files of the project that the tasks among `tasks` check, each once, in the order the
    /// tasks name them, with the problems of each task's configuration.
    ///
    /// # Errors
    ///
    /// No task among `tasks` names a project's files, or one fails to.
    pub fn project_files(&self, tasks: &[&str]) -> Result<Project, String> {
        let mut named = false;
        let mut project = Project::default();
        let mut seen = std::collections::HashSet::new();
        for (task, project_files) in self
            .contributions::<ProjectFiles>()
            .iter()
            .filter(|(task, _)| tasks.contains(task))
        {
            named = true;
            let own = project_files(self).map_err(|e| format!("{task}: {e}"))?;
            for file in own.files {
                if seen.insert(file.clone()) {
                    project.files.push(file);
                }
            }
            project.problems.extend(own.problems);
        }
        if !named {
            return Err(format!("no task among {tasks:?} names a project's files"));
        }
        Ok(project)
    }

    /// Registers artifact `A`; its `Debug` is how a host shows it.
    pub fn artifact<A: Artifact>(&mut self) -> &mut Self
    where
        A::Output: std::fmt::Debug,
    {
        self.artifacts.register::<A>();
        self
    }

    /// See `ArtifactRegistry::provide`.
    pub fn provide<F: Facet>(
        &mut self,
        identifier: &'static str,
        applies: impl Fn(&Document) -> bool + Send + Sync + 'static,
        provider: impl Fn(&DocumentContext<'_>) -> F::Output + Send + Sync + 'static,
    ) -> &mut Self {
        self.artifacts.provide::<F>(identifier, applies, provider);
        self
    }

    /// # Panics
    ///
    /// Never: the list of `C` only ever holds `C::Item`.
    pub fn contribute<C: Contribution>(&mut self, item: C::Item) -> &mut Self {
        self.contributions
            .entry(TypeId::of::<C>())
            .or_insert_with(|| Box::new(Vec::<C::Item>::new()))
            .downcast_mut::<Vec<C::Item>>()
            .expect("a contribution list holds its own items")
            .push(item);
        self
    }

    /// Items added to `C`, in the order plugins added them.
    ///
    /// # Panics
    ///
    /// Never: the list of `C` only ever holds `C::Item`.
    #[must_use]
    pub fn contributions<C: Contribution>(&self) -> &[C::Item] {
        self.contributions
            .get(&TypeId::of::<C>())
            .map_or(&[], |items| {
                items
                    .downcast_ref::<Vec<C::Item>>()
                    .expect("a contribution list holds its own items")
            })
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

    /// Whether a document task named in `identifiers` runs on `document`, so a host can skip
    /// reading a file that no such task reads.
    #[must_use]
    pub fn applies(&self, identifiers: &[&str], document: &Document) -> bool {
        self.selected(identifiers)
            .0
            .iter()
            .any(|task| task.applies(document))
    }

    /// The registered tasks named in `identifiers`; all of them when it is empty.
    pub(crate) fn selected(&self, identifiers: &[&str]) -> (Vec<&dyn Task>, Vec<&dyn FinishTask>) {
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

#[cfg(test)]
mod tests;

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
