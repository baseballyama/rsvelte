//! `rsvelte lsp`: a language server on standard input and output. It lints with oxlint's language
//! server and the Svelte plugin `rsvelte lint` runs, formats as `rsvelte format` writes, and type
//! checks as `rsvelte typecheck` does.

use std::path::{Path, PathBuf};
use std::process::ExitCode;
use std::sync::{Arc, OnceLock};

use oxc_language_server::uri_utils::uri_to_file_path;
use oxc_language_server::{
    Capabilities, CodeActionParams, DiagnosticResult, TextDocument, Tool, ToolBuildResult,
    ToolBuilder, ToolRestartChanges, WorkerManager,
};
use oxfmt::document::DocumentFormatter;
use oxlint::lsp::ServerLinterBuilder;
use tower_lsp_server::gen_lsp_types::{
    CodeActionResponse, Diagnostic, DiagnosticSeverity, DocumentFormattingProvider, Message,
    Pattern, ServerCapabilities, TextEdit, Uri, WorkspaceEdit,
};
use tower_lsp_server::jsonrpc::ErrorCode;

mod convert;
mod router;
mod rpc;
mod typecheck;

/// Serves the editor until it exits. `arguments` are the words after `lsp`.
pub(super) fn language_server(arguments: &[String]) -> ExitCode {
    for argument in arguments {
        match argument.as_str() {
            // What language clients add to say the server talks on standard input and output.
            "--stdio" => {}
            "-h" | "--help" => {
                print!("{}", super::help::LSP);
                return ExitCode::SUCCESS;
            }
            other => {
                return crate::usage(&format!("lsp takes no `{other}`; see `rsvelte lsp --help`"));
            }
        }
    }
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
    // `OXC_LOG` names what to log on standard error, as oxlint's and oxfmt's do.
    oxfmt::cli::init_tracing();
    let lint = ServerLinterBuilder::default()
        .with_hosts(vec![super::host_lint::svelte()])
        .with_host_config_loader(super::node_configuration::Node);
    runtime.block_on(async {
        // The lint and the format talk over a pipe in this process.
        let (router_end, server_end) = tokio::io::duplex(1 << 20);
        let (server_input, server_output) = tokio::io::split(server_end);
        tokio::spawn(oxc_language_server::run_server_on(
            server_input,
            server_output,
            "rsvelte".to_owned(),
            env!("CARGO_PKG_VERSION").to_owned(),
            WorkerManager::new(Arc::new(Builder { lint })),
        ));
        let (output, input) = tokio::io::split(router_end);
        let lint = router::Server {
            name: "lint",
            input: Box::new(input),
            output: Box::new(output),
        };
        let (router_end, server_end) = tokio::io::duplex(1 << 20);
        let (server_input, server_output) = tokio::io::split(server_end);
        let (service, socket) = tower_lsp_server::LspService::new(typecheck::TypeCheck::new);
        tokio::spawn(
            tower_lsp_server::Server::new(server_input, server_output, socket).serve(service),
        );
        let (output, input) = tokio::io::split(router_end);
        let typecheck = router::Server {
            name: "typecheck",
            input: Box::new(input),
            output: Box::new(output),
        };
        let servers = vec![lint, typecheck];
        router::serve(tokio::io::stdin(), tokio::io::stdout(), servers).await;
    });
    // The read of standard input that may still wait would hold a runtime that waits for it.
    runtime.shutdown_background();
    ExitCode::SUCCESS
}

/// oxlint's language server, as `rsvelte lint` runs oxlint, with the formatter beside it.
struct Builder {
    lint: ServerLinterBuilder,
}

impl ToolBuilder for Builder {
    fn server_capabilities(
        &self,
        capabilities: &mut ServerCapabilities,
        backend: &mut Capabilities,
    ) {
        self.lint.server_capabilities(capabilities, backend);
        capabilities.document_formatting_provider = Some(DocumentFormattingProvider::Bool(true));
    }

    fn build(&self, root_uri: &Uri, options: serde_json::Value) -> ToolBuildResult {
        let ToolBuildResult {
            tool,
            client_messages,
        } = ToolBuilder::build(&self.lint, root_uri, options);
        ToolBuildResult {
            tool: Box::new(Server {
                lint: tool,
                root: uri_to_file_path(root_uri).map(std::borrow::Cow::into_owned),
                formatter: OnceLock::new(),
            }),
            client_messages,
        }
    }

    fn shutdown(&self, root_uri: &Uri) {
        self.lint.shutdown(root_uri);
    }
}

/// One workspace folder: oxlint's linter of it, and what `rsvelte format` would load when run in
/// it.
struct Server {
    lint: Box<dyn Tool>,
    /// `None` for a root that is no directory on disk.
    root: Option<PathBuf>,
    formatter: OnceLock<Result<DocumentFormatter, String>>,
}

impl Server {
    fn formatter(&self) -> &Result<DocumentFormatter, String> {
        self.formatter.get_or_init(|| {
            (self.root.as_ref()).map_or_else(
                || Err("the workspace folder is not a directory".to_owned()),
                |root| DocumentFormatter::new(root, super::format::hosts()),
            )
        })
    }

    /// `text`, the document at `path`, formatted; `None` when it stays as it is. A text that does
    /// not format, such as one that does not parse, stays: the lint reports its parse error, and
    /// an error here would be shown on each save.
    fn format(&self, path: &Path, text: &str) -> Result<Option<String>, String> {
        let formatter = self.formatter().as_ref().map_err(Clone::clone)?;
        Ok(formatter.format(path, text).ok().flatten())
    }

    /// Every tool starts again, as a new run of the commands would, with its watched files.
    fn restart(
        builder: &dyn ToolBuilder,
        root_uri: &Uri,
        options: serde_json::Value,
    ) -> ToolRestartChanges {
        let ToolBuildResult {
            tool,
            client_messages,
        } = builder.build(root_uri, options.clone());
        ToolRestartChanges {
            watch_patterns: Some(tool.get_watcher_patterns(options)),
            tool: Some(tool),
            client_messages,
        }
    }
}

impl Tool for Server {
    fn handle_configuration_change(
        &self,
        builder: &dyn ToolBuilder,
        root_uri: &Uri,
        old_options_json: &serde_json::Value,
        new_options_json: serde_json::Value,
    ) -> ToolRestartChanges {
        if *old_options_json == new_options_json {
            return ToolRestartChanges {
                tool: None,
                watch_patterns: None,
                client_messages: Vec::new(),
            };
        }
        Self::restart(builder, root_uri, new_options_json)
    }

    fn get_watcher_patterns(&self, options: serde_json::Value) -> Vec<Pattern> {
        let mut patterns = self.lint.get_watcher_patterns(options);
        patterns.extend(
            DocumentFormatter::configuration_files()
                .into_iter()
                .map(|name| format!("**/{name}")),
        );
        patterns
    }

    fn handle_watched_file_change(
        &self,
        builder: &dyn ToolBuilder,
        _changed_uri: &Uri,
        root_uri: &Uri,
        options: serde_json::Value,
    ) -> ToolRestartChanges {
        // The client sends only the patterns this server watches.
        Self::restart(builder, root_uri, options)
    }

    fn execute_command(
        &self,
        command: &str,
        arguments: Vec<serde_json::Value>,
    ) -> Result<Option<WorkspaceEdit>, ErrorCode> {
        guarded(
            |_| Err(ErrorCode::InternalError),
            || self.lint.execute_command(command, arguments),
        )
    }

    fn get_code_actions_or_commands(
        &self,
        parameters: CodeActionParams,
    ) -> Vec<CodeActionResponse> {
        guarded(
            |_| Vec::new(),
            || self.lint.get_code_actions_or_commands(parameters),
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
        let uri = document.uri.clone();
        guarded(failed(uri), || self.lint.run_diagnostic(document))
    }

    fn run_diagnostic_on_change(&self, document: TextDocument<'_>) -> DiagnosticResult {
        let uri = document.uri.clone();
        guarded(failed(uri), || self.lint.run_diagnostic_on_change(document))
    }

    fn run_diagnostic_on_save(&self, document: TextDocument<'_>) -> DiagnosticResult {
        let uri = document.uri.clone();
        guarded(failed(uri), || self.lint.run_diagnostic_on_save(document))
    }

    fn remove_uri_cache(&self, uri: &Uri) {
        self.lint.remove_uri_cache(uri);
    }
}

/// The report of a lint that panicked: an error at the start of `uri`, since an error answer would
/// be shown on each change.
fn failed(uri: Uri) -> impl FnOnce(&str) -> DiagnosticResult {
    move |panic| {
        let diagnostic = Diagnostic {
            severity: Some(DiagnosticSeverity::Error),
            source: Some("rsvelte".to_owned()),
            message: Message::String(format!("rsvelte panicked: {panic}")),
            ..Diagnostic::default()
        };
        Ok(vec![(uri, vec![diagnostic])])
    }
}

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
