//! `rsvelte lsp`: a language server on standard input and output. For the text in the editor, it
//! reports what `rsvelte lint` reports, applies the fixes `rsvelte lint` would, and formats as
//! `rsvelte format` writes.

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::process::ExitCode;
use std::sync::{Arc, Mutex, OnceLock, PoisonError};

use oxc_language_server::uri_utils::uri_to_file_path;
use oxc_language_server::{
    Capabilities, CodeActionParams, DiagnosticMode, DiagnosticResult, TextDocument, Tool,
    ToolBuildResult, ToolBuilder, ToolRestartChanges, WorkerManager,
};
use oxfmt::document::DocumentFormatter;
use rsvelte_kernel::computation::pipeline::DocumentResult;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::source::document::Document;
use rsvelte_lint_runner::finding::PARSE_ERROR;
use tower_lsp_server::gen_lsp_types::{
    CodeActionKind, CodeActionOptions, CodeActionProvider, CodeActionResponse, DiagnosticOptions,
    DiagnosticProvider, DocumentFormattingProvider, Pattern, ServerCapabilities, TextEdit, Uri,
};

use super::{LINT, installation};
use crate::configuration::{self, discover};
use crate::{commands, configured_registry, install};

mod actions;
mod convert;

/// The kind of the action that applies every fix, which `editor.codeActionsOnSave` names.
const FIX_ALL: CodeActionKind = CodeActionKind::new("source.fixAll.rsvelte");

/// Serves the editor until it exits. `config` holds the `--config` options.
pub(super) fn language_server(config: configuration::Options) -> ExitCode {
    let runtime = match tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
    {
        Ok(runtime) => runtime,
        Err(error) => {
            eprintln!("rsvelte lsp: {error}");
            return ExitCode::FAILURE;
        }
    };
    let builder = Arc::new(Builder { config });
    runtime.block_on(oxc_language_server::run_server(
        "rsvelte".to_owned(),
        env!("CARGO_PKG_VERSION").to_owned(),
        WorkerManager::new(builder),
    ));
    ExitCode::SUCCESS
}

struct Builder {
    config: configuration::Options,
}

impl ToolBuilder for Builder {
    fn server_capabilities(
        &self,
        capabilities: &mut ServerCapabilities,
        backend: &mut Capabilities,
    ) {
        capabilities.code_action_provider =
            Some(CodeActionProvider::CodeActionOptions(CodeActionOptions {
                code_action_kinds: Some(vec![CodeActionKind::QuickFix, FIX_ALL]),
                ..CodeActionOptions::default()
            }));
        capabilities.document_formatting_provider = Some(DocumentFormattingProvider::Bool(true));
        // Pulled diagnostics go stale when a configuration changes unless the client can be told.
        backend.diagnostic_mode = if backend.pull_diagnostics && backend.refresh_diagnostics {
            DiagnosticMode::Pull
        } else {
            DiagnosticMode::Push
        };
        capabilities.diagnostic_provider = (backend.diagnostic_mode == DiagnosticMode::Pull)
            .then(|| DiagnosticProvider::DiagnosticOptions(DiagnosticOptions::default()));
    }

    fn build(&self, root_uri: &Uri, _options: serde_json::Value) -> ToolBuildResult {
        ToolBuildResult {
            tool: Box::new(Server {
                root: uri_to_file_path(root_uri).map(std::borrow::Cow::into_owned),
                config: self.config.clone(),
                registries: Mutex::new(HashMap::new()),
                formatter: OnceLock::new(),
            }),
            client_messages: Vec::new(),
        }
    }
}

/// The lint plugins of one configuration, or why they do not install.
type Installed = Arc<Result<Registry, String>>;

/// One workspace folder: what `rsvelte lint` and `rsvelte format` would load when run in it.
struct Server {
    /// `None` for a root that is no directory on disk.
    root: Option<PathBuf>,
    config: configuration::Options,
    /// The lint plugins installed for each configuration file, `None` for none.
    registries: Mutex<HashMap<Option<PathBuf>, Installed>>,
    formatter: OnceLock<Result<DocumentFormatter, String>>,
}

impl Server {
    /// The lint plugins `rsvelte lint` would install for the file at `path`: with the
    /// configuration file found from its directory, as when run there.
    fn registry(&self, path: &Path) -> Installed {
        let file = if self.config.names_file() {
            Ok(None)
        } else {
            discover(path.parent().unwrap_or(path)).map_err(|error| error.to_string())
        };
        let file = match file {
            Ok(file) => file,
            Err(error) => return Arc::new(Err(error)),
        };
        let mut registries = (self.registries.lock()).unwrap_or_else(PoisonError::into_inner);
        let entry = registries.entry(file.clone()).or_insert_with(|| {
            let installed = match file {
                Some(file) => {
                    configured_registry(&self.config.with_file(file), &[], installation(LINT))
                }
                // None found from the file's directory: the defaults, not a file found from the
                // cwd.
                None if !self.config.names_file() => install(None, &[], installation(LINT)),
                None => configured_registry(&self.config, &[], installation(LINT)),
            };
            Arc::new(installed.map(|(registry, _)| registry))
        });
        let installed = Arc::clone(entry);
        drop(registries);
        installed
    }

    /// The lint of the text `text` of the file at `path`, or why there is none.
    fn lint(&self, path: &Path, text: &str) -> Linted {
        // `rsvelte lint` never reaches a dependency's files, and an editor opens them to read.
        let below = (self.root.as_deref()).and_then(|root| path.strip_prefix(root).ok());
        if below
            .unwrap_or(path)
            .components()
            .any(|c| c.as_os_str() == "node_modules")
        {
            return Linted::Skipped;
        }
        let registry = self.registry(path);
        let registry = match registry.as_ref() {
            Ok(registry) => registry,
            Err(error) => return Linted::Failed(format!("rsvelte.config: {error}")),
        };
        let document = match commands::files::document(path.to_owned(), text.to_owned()) {
            Ok(document) => document,
            Err(error) => return Linted::Failed(error),
        };
        if !registry.applies(LINT, &document) {
            return Linted::Skipped;
        }
        let results = commands::files::run(registry, std::slice::from_ref(&document), LINT);
        results.map_or_else(
            |_| Linted::Failed("the lint tasks do not run".to_owned()),
            |mut results| Linted::Ran(document, results.remove(0)),
        )
    }

    fn formatter(&self) -> &Result<DocumentFormatter, String> {
        self.formatter.get_or_init(|| {
            (self.root.as_ref()).map_or_else(
                || Err("the workspace folder is not a directory".to_owned()),
                |root| DocumentFormatter::new(root, super::format::hosts()),
            )
        })
    }
}

/// What [`Server::lint`] found.
enum Linted {
    Ran(Document, DocumentResult),
    /// No lint task reads the file.
    Skipped,
    Failed(String),
}

impl Tool for Server {
    fn handle_configuration_change(
        &self,
        _builder: &dyn ToolBuilder,
        _root_uri: &Uri,
        _old_options_json: &serde_json::Value,
        _new_options_json: serde_json::Value,
    ) -> ToolRestartChanges {
        unchanged()
    }

    fn get_watcher_patterns(&self, _options: serde_json::Value) -> Vec<Pattern> {
        let names = (READ.iter().copied()).chain(DocumentFormatter::configuration_files());
        names.map(|name| format!("**/{name}")).collect()
    }

    fn handle_watched_file_change(
        &self,
        builder: &dyn ToolBuilder,
        _changed_uri: &Uri,
        root_uri: &Uri,
        options: serde_json::Value,
    ) -> ToolRestartChanges {
        // The client sends only the patterns this server watches. Every registry and the formatter
        // start again, as a new run of the commands would.
        let ToolBuildResult {
            tool,
            client_messages,
        } = builder.build(root_uri, options);
        ToolRestartChanges {
            tool: Some(tool),
            watch_patterns: None,
            client_messages,
        }
    }

    fn get_code_actions_or_commands(
        &self,
        parameters: CodeActionParams,
    ) -> Vec<CodeActionResponse> {
        let (Some(text), Some(path)) = (&parameters.text, uri_to_file_path(&parameters.uri)) else {
            return Vec::new();
        };
        guarded(
            |_| Vec::new(),
            || actions::actions(self, &path, text, &parameters),
        )
    }

    fn run_format(&self, document: TextDocument<'_>) -> Result<Vec<TextEdit>, String> {
        let (Some(text), Some(path)) = (&document.text, uri_to_file_path(document.uri)) else {
            return Ok(Vec::new());
        };
        let formatted = guarded(
            |panic| Err(format!("rsvelte panicked: {panic}")),
            || self.format(&path, text),
        )?;
        Ok(formatted
            .and_then(|formatted| convert::edit(text, &formatted))
            .into_iter()
            .collect())
    }

    fn run_diagnostic(&self, document: TextDocument<'_>) -> DiagnosticResult {
        Ok(self.diagnose(&document).into_iter().collect())
    }

    fn run_diagnostic_on_change(&self, document: TextDocument<'_>) -> DiagnosticResult {
        self.run_diagnostic(document)
    }

    fn run_diagnostic_on_save(&self, document: TextDocument<'_>) -> DiagnosticResult {
        self.run_diagnostic(document)
    }
}

impl Server {
    /// The diagnostics of `document`, `None` for a document that is no file. Never an error: the
    /// client would show one on each change.
    fn diagnose(
        &self,
        document: &TextDocument<'_>,
    ) -> Option<(Uri, Vec<tower_lsp_server::gen_lsp_types::Diagnostic>)> {
        let path = uri_to_file_path(document.uri)?;
        let disk;
        let text = if let Some(text) = &document.text {
            text.as_ref()
        } else {
            // Saved and closed: what is on disk is what `rsvelte lint` reads.
            disk = std::fs::read_to_string(&path).ok()?;
            disk.as_str()
        };
        let diagnostics = guarded(
            |panic| vec![convert::failure(format!("rsvelte panicked: {panic}"))],
            || match self.lint(&path, text) {
                Linted::Ran(linted, result) => convert::diagnostics(&linted, &result),
                Linted::Skipped => Vec::new(),
                Linted::Failed(error) => vec![convert::failure(error)],
            },
        );
        Some((document.uri.clone(), diagnostics))
    }

    /// `text`, the document at `path`, formatted; `None` when it stays as it is. A text that does
    /// not parse stays: its parse error is among its diagnostics, and an error here would be
    /// shown on each save.
    fn format(&self, path: &Path, text: &str) -> Result<Option<String>, String> {
        let formatter = self.formatter().as_ref().map_err(Clone::clone)?;
        match formatter.format(path, text) {
            Err(error) if self.parses(path, text) => Err(error),
            Err(_) => Ok(None),
            result => result,
        }
    }

    /// Whether the lint of `text` finds no parse error.
    fn parses(&self, path: &Path, text: &str) -> bool {
        let Linted::Ran(_, result) = self.lint(path, text) else {
            return true;
        };
        !(result.outputs.iter())
            .flat_map(|(_, out)| {
                (out.diagnostics.iter()).chain(out.findings.iter().map(|f| &f.diagnostic))
            })
            .any(|diagnostic| diagnostic.code == PARSE_ERROR)
    }
}

/// The names of the files that change what the lint reads, besides oxfmt's: `rsvelte.config`, and
/// the facts plugins read about a project, which a registry keeps.
const READ: &[&str] = &[
    "rsvelte.config.{json,js,mjs,cjs,ts,mts,cts}",
    "package.json",
    "svelte.config.{js,mjs,cjs,ts,mts,cts}",
];

/// `work` on a thread the runtime may block, or `fallback` of its panic's message: a panic would
/// otherwise end the server, which runs every request in one task.
fn guarded<T>(fallback: impl FnOnce(&str) -> T, work: impl FnOnce() -> T) -> T {
    let result = tokio::task::block_in_place(|| {
        std::panic::catch_unwind(std::panic::AssertUnwindSafe(work))
    });
    result.unwrap_or_else(|panic| {
        let message = (panic.downcast_ref::<String>().map(String::as_str))
            .or_else(|| panic.downcast_ref::<&str>().copied())
            .unwrap_or("a payload that is not a string");
        fallback(message)
    })
}

fn unchanged() -> ToolRestartChanges {
    ToolRestartChanges {
        tool: None,
        watch_patterns: None,
        client_messages: Vec::new(),
    }
}
