//! What a run can do: the plugins, artifacts, facets, and tasks registered for it.
//!
//! A plugin registers its artifacts and tasks into a [`Registry`];
//! [`run`](crate::computation::pipeline::run) then runs the selected tasks over documents.

use std::any::{Any, TypeId};
use std::collections::HashMap;

use crate::computation::database::{Artifact, ArtifactRegistry, DocumentContext, Facet};
use crate::computation::plugins::{Plugin, PluginError, Plugins};
use crate::computation::task::{FinishTask, Task};
use crate::source::document::{Document, DocumentError};

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
    /// [`DocumentError::TooLarge`] if `text` is
    /// [`MAXIMUM_SOURCE_LENGTH`](crate::source::positions::MAXIMUM_SOURCE_LENGTH) bytes or longer.
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
