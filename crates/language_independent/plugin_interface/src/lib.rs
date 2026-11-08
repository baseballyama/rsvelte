//! How a host installs a plugin without knowing what it is: the plugin reads its own options,
//! learns which of its tasks will run, and records the external programs it will run.

use std::collections::{BTreeMap, BTreeSet};
use std::path::{Path, PathBuf};
use std::sync::Arc;

use rsvelte_kernel::computation::pipeline::Registry;
use serde::de::DeserializeOwned;
use serde_json::value::RawValue;

mod functions;

pub use functions::{
    CallError, Contract, Function, FunctionReference, FunctionResolver, NoFunctions, TextContract,
    TextFunction,
};

/// A plugin as a host installs it.
#[derive(Debug)]
pub struct Extension {
    /// The plugin's identifier, which is also the key of its options.
    pub identifier: &'static str,
    /// Registers the plugin's artifacts and tasks, configured from `settings`.
    pub install: fn(&mut Registry, &mut Settings) -> Result<(), CallError>,
}

/// Which tasks a run will run, as the host's user chose them.
#[derive(Clone, Debug)]
pub enum Selection {
    /// The tasks the user named.
    Named(Vec<String>),
    /// None was named, so every task runs.
    Every,
    /// None was named, so every per-document task runs, and no project pass.
    DocumentTasks,
}

/// Whether a task runs per document only, or also in a project pass.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum TaskKind {
    Document,
    Finish,
}

/// An external program a plugin will run, as a measurement report names it.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Tool {
    pub command: String,
    pub version: String,
}

/// A plugin's options and the directory relative paths in them are relative to.
#[derive(Debug)]
pub struct Options<T> {
    pub value: T,
    pub base: PathBuf,
}

/// What a host gives every plugin it installs.
#[derive(Debug)]
pub struct Settings {
    options: BTreeMap<String, (Box<RawValue>, PathBuf)>,
    read: BTreeSet<String>,
    functions: Arc<dyn FunctionResolver>,
    selection: Selection,
    tools: Vec<Tool>,
}

impl Settings {
    #[must_use]
    pub fn new(selection: Selection, functions: Arc<dyn FunctionResolver>) -> Self {
        Self {
            options: BTreeMap::new(),
            read: BTreeSet::new(),
            functions,
            selection,
            tools: Vec::new(),
        }
    }

    /// Sets plugin `identifier`'s options, replacing earlier ones; relative paths in them are
    /// relative to `base`.
    pub fn set(&mut self, identifier: String, options: Box<RawValue>, base: PathBuf) {
        self.options.insert(identifier, (options, base));
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
    ) -> Result<Option<Options<T>>, CallError> {
        let Some((raw, base)) = self.options.get(identifier) else {
            return Ok(None);
        };
        let value = serde_json::from_str(raw.get())
            .map_err(|error| CallError(format!("options of `{identifier}`: {error}")))?;
        let base = base.clone();
        self.read.insert(identifier.to_owned());
        Ok(Some(Options { value, base }))
    }

    /// Resolves the function references in options.
    #[must_use]
    pub fn functions(&self) -> &dyn FunctionResolver {
        &*self.functions
    }

    /// Whether the run will run task `identifier`.
    #[must_use]
    pub fn runs(&self, identifier: &str, kind: TaskKind) -> bool {
        match &self.selection {
            Selection::Named(names) => names.iter().any(|name| name == identifier),
            Selection::Every => true,
            Selection::DocumentTasks => kind == TaskKind::Document,
        }
    }

    /// The error for a task that will run but is missing `what`, said once for the run instead of
    /// on every document.
    #[must_use]
    pub fn missing(&self, task: &str, what: &str) -> CallError {
        let why = match self.selection {
            Selection::Named(_) => "",
            Selection::Every | Selection::DocumentTasks => {
                "; it runs because no task was named, and naming the tasks to run leaves it out"
            }
        };
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
        if !self.tools.iter().any(|tool| tool.command == command) {
            let version = version()?;
            self.tools.push(Tool { command, version });
        }
        Ok(())
    }

    #[must_use]
    pub fn tools(&self) -> &[Tool] {
        &self.tools
    }

    /// Options no installed plugin read: a misspelled or unavailable plugin.
    pub fn unread(&self) -> impl Iterator<Item = &str> {
        self.options
            .keys()
            .filter(|identifier| !self.read.contains(*identifier))
            .map(String::as_str)
    }
}

/// Installs `extensions` in order, then refuses options none of them read.
///
/// # Errors
///
/// A plugin's installation failed, or options name no installed plugin that reads them.
pub fn install(
    registry: &mut Registry,
    extensions: &[&Extension],
    settings: &mut Settings,
) -> Result<(), CallError> {
    for extension in extensions {
        (extension.install)(registry, settings)?;
    }
    let unread: Vec<&str> = settings.unread().collect();
    if unread.is_empty() {
        Ok(())
    } else {
        Err(CallError(format!(
            "no installed plugin reads the options of {}",
            unread
                .iter()
                .map(|identifier| format!("`{identifier}`"))
                .collect::<Vec<_>>()
                .join(", ")
        )))
    }
}

/// Where a program named in options is.
///
/// A path is relative to `base`, and made absolute since programs may run in another directory.
/// A bare name is looked for in `node_modules/.bin` of
/// `base` and its parents first, as package managers run a project's tools, then in `PATH`.
///
/// # Errors
///
/// `base` cannot be made absolute.
pub fn program_path(value: &str, base: &Path) -> std::io::Result<PathBuf> {
    let path = Path::new(value);
    if path.components().count() > 1 {
        return std::path::absolute(base.join(path));
    }
    let base = std::path::absolute(base)?;
    let installed = base
        .ancestors()
        .map(|d| d.join("node_modules/.bin").join(path))
        .find(|candidate| candidate.is_file());
    Ok(installed.unwrap_or_else(|| path.to_owned()))
}
