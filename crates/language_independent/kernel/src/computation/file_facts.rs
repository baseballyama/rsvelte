//! Facts about files outside the documents, such as a project's `package.json`: each is read once
//! and shared by every document of a run.
//!
//! A [`FileFact`] is read from one path and depends on nothing but that path and what lies below
//! it. [`FileFacts`] keeps each answer by fact and path. A one-shot run never drops one; a
//! long-running host keeps the store and calls [`FileFacts::invalidate`] for each path that
//! changes, which drops exactly the answers that could have read it.
//!
//! Unlike a [`DocumentContext`](crate::computation::database::DocumentContext), the store is
//! shared across worker threads: two documents asking for one fact at once wait for one read.

use std::any::{Any, TypeId as TypeIdentifier};
use std::path::{Path, PathBuf};
use std::sync::{Arc, OnceLock, PoisonError, RwLock};

use rustc_hash::FxHashMap;

use crate::performance::measurement;

/// A fact read from the file system at one path.
pub trait FileFact: 'static {
    type Output: Send + Sync + 'static;
    /// Also the metrics phase name.
    const NAME: &'static str;
    /// Reads the fact. It must read nothing but `path` and what lies below it, since a change
    /// anywhere else keeps the answer.
    fn read(path: &Path) -> Self::Output;
}

type Answer = Arc<dyn Any + Send + Sync>;
/// A slot the first asker fills while later askers of the same fact and path wait on it.
type Slot = Arc<OnceLock<Answer>>;

/// The answers of [`FileFact`]s, by fact and then by path.
#[derive(Default)]
pub struct FileFacts {
    facts: RwLock<FxHashMap<TypeIdentifier, FxHashMap<PathBuf, Slot>>>,
}

impl std::fmt::Debug for FileFacts {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("FileFacts").finish_non_exhaustive()
    }
}

impl FileFacts {
    /// `F` at `path`, read on the first request after the store was made or `path` invalidated.
    ///
    /// # Panics
    ///
    /// Never: a slot of `F` only ever holds `F::Output`.
    pub fn get<F: FileFact>(&self, path: &Path) -> Arc<F::Output> {
        let fact = TypeIdentifier::of::<F>();
        let known = self
            .facts
            .read()
            .unwrap_or_else(PoisonError::into_inner)
            .get(&fact)
            .and_then(|paths| paths.get(path))
            .cloned();
        let slot = known.unwrap_or_else(|| {
            Arc::clone(
                self.facts
                    .write()
                    .unwrap_or_else(PoisonError::into_inner)
                    .entry(fact)
                    .or_default()
                    .entry(path.to_owned())
                    .or_default(),
            )
        });
        // The read runs outside the map's lock, so facts of other paths do not wait for it.
        Arc::clone(slot.get_or_init(|| {
            let _p = measurement::phase(F::NAME);
            Arc::new(F::read(path))
        }))
        .downcast()
        .expect("a file fact's slot holds its own output type")
    }

    /// Drops every answer that could have read `changed`: those at `changed`, below it (it was a
    /// directory) and at a directory that holds it. Returns how many it dropped.
    pub fn invalidate(&self, changed: &Path) -> usize {
        self.facts
            .write()
            .unwrap_or_else(PoisonError::into_inner)
            .values_mut()
            .map(|paths| {
                let before = paths.len();
                paths.retain(|path, _| !path.starts_with(changed) && !changed.starts_with(path));
                before - paths.len()
            })
            .sum()
    }
}

#[cfg(test)]
mod tests;
