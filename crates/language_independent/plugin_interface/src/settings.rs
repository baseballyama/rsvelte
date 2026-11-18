use std::path::PathBuf;
use std::sync::Arc;

use serde::de::DeserializeOwned;
use serde_json::value::RawValue;

use crate::options::OptionStore;
use crate::tools::Tools;
use crate::{CallError, FunctionResolver, PluginOptions, Selection, TaskKind, Tool};

/// What a host gives every plugin it installs.
#[derive(Debug)]
pub struct Settings {
    options: OptionStore,
    functions: Arc<dyn FunctionResolver>,
    selection: Selection,
    tools: Tools,
    file_system: bool,
}

impl Settings {
    #[must_use]
    pub fn new(selection: Selection, functions: Arc<dyn FunctionResolver>) -> Self {
        Self {
            options: OptionStore::default(),
            functions,
            selection,
            tools: Tools::default(),
            file_system: true,
        }
    }

    /// For a host without files, such as a page: plugins answer what they would read from the
    /// files around a document without them.
    #[must_use]
    pub const fn without_file_system(mut self) -> Self {
        self.file_system = false;
        self
    }

    /// Whether the host reads the files around a document.
    #[must_use]
    pub const fn has_file_system(&self) -> bool {
        self.file_system
    }

    /// Sets plugin `identifier`'s options, replacing earlier ones; relative paths in them are
    /// relative to `base`.
    pub fn set(&mut self, identifier: String, options: Box<RawValue>, base: PathBuf) {
        self.options.set(identifier, options, base);
    }

    /// Plugin `identifier`'s options, decoded; `None` when none were given. Any plugin may read
    /// another's, such as the options of a service it uses.
    ///
    /// # Errors
    ///
    /// The options do not decode as `T`.
    pub fn options<T: DeserializeOwned>(
        &mut self,
        identifier: &str,
    ) -> Result<Option<PluginOptions<T>>, CallError> {
        self.options.decode(identifier)
    }

    /// Resolves the function references in options.
    #[must_use]
    pub fn functions(&self) -> &dyn FunctionResolver {
        &*self.functions
    }

    /// Whether the run will run task `identifier`.
    #[must_use]
    pub fn runs(&self, identifier: &str, kind: TaskKind) -> bool {
        self.selection.runs(identifier, kind)
    }

    /// The error for a task that will run but is missing `what`, said once for the run instead of
    /// on every document.
    #[must_use]
    pub fn missing(&self, task: &str, what: &str) -> CallError {
        let why = self.selection.unnamed_reason();
        CallError(format!("{task} needs {what}{why}"))
    }

    /// Records a program the run will run, asking its version once however many plugins run it.
    ///
    /// # Errors
    ///
    /// `version` failed: the program is missing or unusable.
    pub fn tool(
        &mut self,
        command: String,
        version: impl FnOnce() -> Result<String, CallError>,
    ) -> Result<(), CallError> {
        self.tools.record(command, version)
    }

    /// The programs recorded so far, in the order plugins recorded them.
    #[must_use]
    pub fn tools(&self) -> &[Tool] {
        self.tools.as_slice()
    }

    /// Options no installed plugin read: a misspelled or unavailable plugin.
    pub(crate) fn unread(&self) -> impl Iterator<Item = &str> {
        self.options.unread()
    }
}
