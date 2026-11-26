use std::path::{Path, PathBuf};
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
    /// Whether the host reports the programs a run runs, with their versions.
    tool_versions: bool,
    file_system: bool,
    programs: Option<PathBuf>,
}

impl Settings {
    #[must_use]
    pub fn new(selection: Selection, functions: Arc<dyn FunctionResolver>) -> Self {
        Self {
            options: OptionStore::default(),
            functions,
            selection,
            tools: Tools::default(),
            tool_versions: false,
            file_system: true,
            programs: None,
        }
    }

    /// For a host without files, such as a page: plugins answer what they would read from the
    /// files around a document without them.
    #[must_use]
    pub const fn without_file_system(mut self) -> Self {
        self.file_system = false;
        self
    }

    /// For a host that reports the programs a run runs, as a measurement does: [`Self::tool`] asks
    /// each one's version.
    #[must_use]
    pub const fn with_tool_versions(mut self) -> Self {
        self.tool_versions = true;
        self
    }

    /// The directory of the programs installed with the host, such as a content mapper.
    #[must_use]
    pub fn with_programs(mut self, directory: PathBuf) -> Self {
        self.programs = Some(directory);
        self
    }

    /// The directory of the programs installed with the host; `None` when it installs none.
    #[must_use]
    pub fn programs(&self) -> Option<&Path> {
        self.programs.as_deref()
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

    /// Records a program the run will run, asking its version once however many plugins run it,
    /// where the host reports the programs. Otherwise it records nothing, since asking costs a
    /// start of the program, and a program that cannot run fails where the run starts it.
    ///
    /// # Errors
    ///
    /// `version` failed: the program is missing or unusable.
    pub fn tool(
        &mut self,
        command: String,
        version: impl FnOnce() -> Result<String, CallError>,
    ) -> Result<(), CallError> {
        if !self.tool_versions {
            return Ok(());
        }
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
