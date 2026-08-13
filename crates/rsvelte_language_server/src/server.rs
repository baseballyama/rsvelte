//! The LSP message loop.

use std::collections::HashMap;
use std::process::ExitCode;
use std::time::{Duration, Instant};

use anyhow::Result;
use crossbeam_channel::{Receiver, Sender, after, never, select, unbounded};
use lsp_server::{Connection, ErrorCode, Message, Notification, Request, RequestId, Response};
use lsp_types::{
    CancelParams, CodeActionKind, CodeActionOptions, CodeActionOrCommand, CodeActionParams,
    CodeActionProviderCapability, CompletionOptions, CompletionParams, ConfigurationItem,
    ConfigurationParams, DiagnosticOptions, DiagnosticServerCapabilities,
    DidChangeTextDocumentParams, DidChangeWorkspaceFoldersParams, DidCloseTextDocumentParams,
    DidOpenTextDocumentParams, DidSaveTextDocumentParams, DocumentDiagnosticParams,
    DocumentDiagnosticReport, DocumentFormattingParams, DocumentSymbolParams,
    DocumentSymbolResponse, FoldingRange, FoldingRangeParams, FoldingRangeProviderCapability,
    FullDocumentDiagnosticReport, HoverParams, HoverProviderCapability, NumberOrString, OneOf,
    PublishDiagnosticsParams, RelatedFullDocumentDiagnosticReport, SelectionRangeParams,
    SelectionRangeProviderCapability, ServerCapabilities, TextDocumentPositionParams,
    TextDocumentSyncCapability, TextDocumentSyncKind, TextDocumentSyncOptions,
    TextDocumentSyncSaveOptions, TextEdit, Uri, WorkspaceFoldersServerCapabilities,
};

use crate::client::ClientState;
use crate::completions::TRIGGER_CHARACTERS;
use crate::document::{Document, DocumentStore};
use crate::log;
use crate::settings::Settings;
use crate::uri::uri_to_path;
use crate::worker::{Job, Outcome, Worker};

pub const SERVER_NAME: &str = "rsvelte-language-server";
pub const VERSION: &str = env!("CARGO_PKG_VERSION");

/// How long a burst of edits is coalesced before re-linting.
const LINT_DEBOUNCE: Duration = Duration::from_millis(300);

/// The `rsvelte` configuration section this server pulls from the client.
const CONFIG_SECTION: &str = "rsvelte";

/// Serve the LSP over stdio until the client shuts the connection down.
///
/// **stdout belongs to the JSON-RPC session.** Anything printed there that is
/// not a framed message corrupts the stream with no way back, so no code
/// reachable from here may write to it — note that `rsvelte_fmt` does print to
/// stdout on its CLI paths, which is why only [`rsvelte_fmt::FormatSession`]
/// (which never does) is used.
///
/// # Errors
///
/// Returns an error when initializing or serving the JSON-RPC connection fails.
pub fn run_stdio() -> Result<ExitCode> {
    let (connection, io_threads) = Connection::stdio();
    let (id, params) = connection.initialize_start()?;
    let client = ClientState::from_initialize(&params);

    connection.initialize_finish(
        id,
        serde_json::json!({
            "capabilities": capabilities(&client),
            "serverInfo": { "name": SERVER_NAME, "version": VERSION },
        }),
    )?;

    let (results, outcomes) = unbounded();
    let code = Server::new(
        connection.sender.clone(),
        client,
        Worker::spawn(results),
        outcomes,
    )
    .run(&connection)?;

    // The writer thread ends only once every sender is gone, so the connection
    // (and the server's clone of it) must be dropped before joining.
    drop(connection);
    io_threads.join()?;
    Ok(code)
}

fn capabilities(client: &ClientState) -> ServerCapabilities {
    ServerCapabilities {
        text_document_sync: Some(TextDocumentSyncCapability::Options(
            TextDocumentSyncOptions {
                open_close: Some(true),
                change: Some(TextDocumentSyncKind::INCREMENTAL),
                save: Some(TextDocumentSyncSaveOptions::Supported(true)),
                ..TextDocumentSyncOptions::default()
            },
        )),
        document_formatting_provider: Some(OneOf::Left(true)),
        completion_provider: Some(CompletionOptions {
            trigger_characters: Some(TRIGGER_CHARACTERS.map(str::to_string).to_vec()),
            ..CompletionOptions::default()
        }),
        hover_provider: Some(HoverProviderCapability::Simple(true)),
        code_action_provider: Some(CodeActionProviderCapability::Options(CodeActionOptions {
            code_action_kinds: Some(vec![CodeActionKind::QUICKFIX]),
            ..CodeActionOptions::default()
        })),
        folding_range_provider: Some(FoldingRangeProviderCapability::Simple(true)),
        selection_range_provider: Some(SelectionRangeProviderCapability::Simple(true)),
        document_symbol_provider: Some(OneOf::Left(true)),
        diagnostic_provider: client.pull_diagnostics.then(|| {
            DiagnosticServerCapabilities::Options(DiagnosticOptions {
                identifier: Some(SERVER_NAME.to_string()),
                inter_file_dependencies: false,
                workspace_diagnostics: false,
                ..DiagnosticOptions::default()
            })
        }),
        workspace: Some(lsp_types::WorkspaceServerCapabilities {
            workspace_folders: Some(WorkspaceFoldersServerCapabilities {
                supported: Some(true),
                change_notifications: Some(OneOf::Left(true)),
            }),
            ..lsp_types::WorkspaceServerCapabilities::default()
        }),
        ..ServerCapabilities::default()
    }
}

/// A client request whose answer is still being computed. The response is sent
/// when the worker reports back, so a handler never has to block the loop to
/// produce one.
enum Pending {
    Formatting,
    Completion,
    Hover,
    CodeAction,
    FoldingRange,
    SelectionRange,
    DocumentSymbol,
    DocumentDiagnostic,
}

/// A request this server sent to the client, keyed by the id the client will
/// echo back.
enum Outgoing {
    Configuration,
}

struct Server {
    sender: Sender<Message>,
    client: ClientState,
    settings: Settings,
    documents: DocumentStore,
    worker: Worker,
    outcomes: Receiver<Outcome>,
    /// Documents awaiting a lint, and when it comes due.
    scheduled: HashMap<String, Instant>,
    /// The content hash each document was last linted at.
    linted: HashMap<String, u64>,
    pending: HashMap<RequestId, Pending>,
    outgoing: HashMap<RequestId, Outgoing>,
    next_request_id: u32,
    shutdown_requested: bool,
    exiting: bool,
}

impl Server {
    fn new(
        sender: Sender<Message>,
        client: ClientState,
        worker: Worker,
        outcomes: Receiver<Outcome>,
    ) -> Self {
        Self {
            sender,
            client,
            settings: Settings::default(),
            documents: DocumentStore::default(),
            worker,
            outcomes,
            scheduled: HashMap::new(),
            linted: HashMap::new(),
            pending: HashMap::new(),
            outgoing: HashMap::new(),
            next_request_id: 0,
            shutdown_requested: false,
            exiting: false,
        }
    }

    fn run(&mut self, connection: &Connection) -> Result<ExitCode> {
        if self.client.pull_configuration {
            self.request_configuration();
        }
        // Cloned out of `self` so the handlers below can still borrow it.
        let outcomes = self.outcomes.clone();

        while !self.exiting {
            // Rearmed each turn: the debounce deadline moves with every edit.
            let timer = match self.scheduled.values().min() {
                Some(&deadline) => after(deadline.saturating_duration_since(Instant::now())),
                None => never(),
            };
            select! {
                recv(connection.receiver) -> message => match message {
                    Ok(Message::Request(request)) => self.on_request(request),
                    Ok(Message::Notification(notification)) => self.on_notification(notification),
                    Ok(Message::Response(response)) => self.on_response(response),
                    Err(_) => break,
                },
                recv(outcomes) -> outcome => match outcome {
                    Ok(outcome) => self.on_outcome(outcome),
                    Err(_) => break,
                },
                recv(timer) -> _ => self.run_scheduled_lints(),
            }
        }

        // A client that drops the connection or exits without shutting down
        // first is an abnormal end, per the protocol.
        Ok(if self.shutdown_requested {
            ExitCode::SUCCESS
        } else {
            ExitCode::FAILURE
        })
    }

    fn on_request(&mut self, request: Request) {
        if request.method == "shutdown" {
            self.shutdown_requested = true;
            self.respond(Response::new_ok(request.id, ()));
            return;
        }
        if self.shutdown_requested {
            self.respond(Response::new_err(
                request.id,
                ErrorCode::InvalidRequest as i32,
                "server is shutting down".to_string(),
            ));
            return;
        }
        match request.method.as_str() {
            "textDocument/formatting" => self.on_formatting(request),
            "textDocument/completion" => self.on_completion(request),
            "textDocument/hover" => self.on_hover(request),
            "textDocument/codeAction" => self.on_code_action(request),
            "textDocument/foldingRange" => self.on_folding_range(request),
            "textDocument/selectionRange" => self.on_selection_range(request),
            "textDocument/documentSymbol" => self.on_document_symbol(request),
            "textDocument/diagnostic" => self.on_document_diagnostic(request),
            _ => self.respond(Response::new_err(
                request.id,
                ErrorCode::MethodNotFound as i32,
                format!("unhandled method {}", request.method),
            )),
        }
    }

    fn on_formatting(&mut self, request: Request) {
        let id = request.id;
        let params = match serde_json::from_value::<DocumentFormattingParams>(request.params) {
            Ok(params) => params,
            Err(err) => {
                log::warn(format_args!("textDocument/formatting: {err}"));
                self.respond_no_edits(id);
                return;
            }
        };
        if !self.settings.format_enable {
            self.respond_no_edits(id);
            return;
        }
        let uri = params.text_document.uri;
        let Some(document) = self.documents.get(&uri) else {
            self.respond_no_edits(id);
            return;
        };
        let job = Job::Format {
            id: id.clone(),
            path: uri_to_path(uri.as_str()),
            text: document.shared_text(),
            range: document.full_range(),
        };
        self.pending.insert(id, Pending::Formatting);
        self.worker.submit(job);
    }

    fn on_document_diagnostic(&mut self, request: Request) {
        let id = request.id;
        let params = match serde_json::from_value::<DocumentDiagnosticParams>(request.params) {
            Ok(params) => params,
            Err(err) => {
                log::warn(format_args!("textDocument/diagnostic: {err}"));
                self.respond_diagnostic_report(id, Vec::new());
                return;
            }
        };
        let uri = params.text_document.uri;
        let Some(document) = self.documents.get(&uri) else {
            self.respond_diagnostic_report(id, Vec::new());
            return;
        };
        if !self.settings.lint_enable || !is_lint_target(document) {
            self.respond_diagnostic_report(id, Vec::new());
            return;
        }
        self.pending.insert(id.clone(), Pending::DocumentDiagnostic);
        self.worker.submit(Job::PullDiagnostics {
            id,
            path: uri_to_path(uri.as_str()),
            text: document.shared_text(),
            warnings: self.settings.compiler_warnings.clone(),
        });
    }

    fn on_completion(&mut self, request: Request) {
        let id = request.id;
        let params = match serde_json::from_value::<CompletionParams>(request.params) {
            Ok(params) => params.text_document_position,
            Err(err) => {
                log::warn(format_args!("textDocument/completion: {err}"));
                self.respond_nothing(id);
                return;
            }
        };
        if !self.settings.completion_enable {
            self.respond_nothing(id);
            return;
        }
        match self.locate(&params) {
            Some((path, text, offset)) => {
                self.pending.insert(id.clone(), Pending::Completion);
                self.worker.submit(Job::Complete {
                    id,
                    path,
                    text,
                    offset,
                });
            }
            None => self.respond_nothing(id),
        }
    }

    fn on_hover(&mut self, request: Request) {
        let id = request.id;
        let params = match serde_json::from_value::<HoverParams>(request.params) {
            Ok(params) => params.text_document_position_params,
            Err(err) => {
                log::warn(format_args!("textDocument/hover: {err}"));
                self.respond_nothing(id);
                return;
            }
        };
        if !self.settings.hover_enable {
            self.respond_nothing(id);
            return;
        }
        match self.locate(&params) {
            Some((path, text, offset)) => {
                self.pending.insert(id.clone(), Pending::Hover);
                self.worker.submit(Job::Hover {
                    id,
                    path,
                    text,
                    offset,
                });
            }
            None => self.respond_nothing(id),
        }
    }

    /// Resolve a position in an open component to what the worker needs. Only
    /// components have Svelte template syntax to answer for.
    fn locate(
        &self,
        params: &TextDocumentPositionParams,
    ) -> Option<(std::path::PathBuf, std::sync::Arc<String>, usize)> {
        let document = self.documents.get(&params.text_document.uri)?;
        if document.language_id != "svelte" {
            return None;
        }
        Some((
            uri_to_path(params.text_document.uri.as_str()),
            document.shared_text(),
            document.offset_at(params.position),
        ))
    }

    fn on_code_action(&mut self, request: Request) {
        let id = request.id;
        let params = match serde_json::from_value::<CodeActionParams>(request.params) {
            Ok(params) => params,
            Err(err) => {
                log::warn(format_args!("textDocument/codeAction: {err}"));
                self.respond_no_actions(id);
                return;
            }
        };
        let uri = params.text_document.uri;
        let Some(document) = self.documents.get(&uri) else {
            self.respond_no_actions(id);
            return;
        };
        // A client asking only for other kinds (organize imports, refactorings)
        // gets nothing rather than a quickfix it did not ask for.
        let wants_quickfix = params
            .context
            .only
            .as_ref()
            .is_none_or(|kinds| kinds.contains(&CodeActionKind::QUICKFIX));
        if params.context.diagnostics.is_empty() || !wants_quickfix {
            self.respond_no_actions(id);
            return;
        }
        let job = Job::CodeAction {
            id: id.clone(),
            path: uri_to_path(uri.as_str()),
            text: document.shared_text(),
            uri,
            diagnostics: params.context.diagnostics,
        };
        self.pending.insert(id, Pending::CodeAction);
        self.worker.submit(job);
    }

    fn on_folding_range(&mut self, request: Request) {
        let id = request.id;
        let params = match serde_json::from_value::<FoldingRangeParams>(request.params) {
            Ok(params) => params,
            Err(err) => {
                log::warn(format_args!("textDocument/foldingRange: {err}"));
                self.respond_no_ranges(id);
                return;
            }
        };
        if !self.settings.folding_range_enable {
            self.respond_no_ranges(id);
            return;
        }
        match self.component(&params.text_document.uri) {
            Some((path, text)) => {
                self.pending.insert(id.clone(), Pending::FoldingRange);
                self.worker.submit(Job::FoldingRange {
                    id,
                    path,
                    text,
                    line_folding_only: self.client.line_folding_only,
                });
            }
            None => self.respond_no_ranges(id),
        }
    }

    fn on_selection_range(&mut self, request: Request) {
        let id = request.id;
        let params = match serde_json::from_value::<SelectionRangeParams>(request.params) {
            Ok(params) => params,
            Err(err) => {
                log::warn(format_args!("textDocument/selectionRange: {err}"));
                self.respond_nothing(id);
                return;
            }
        };
        if !self.settings.selection_range_enable {
            self.respond_nothing(id);
            return;
        }
        let Some(document) = self.component_document(&params.text_document.uri) else {
            self.respond_nothing(id);
            return;
        };
        let offsets = params
            .positions
            .iter()
            .map(|&position| document.offset_at(position))
            .collect();
        let job = Job::SelectionRange {
            id: id.clone(),
            path: uri_to_path(params.text_document.uri.as_str()),
            text: document.shared_text(),
            offsets,
        };
        self.pending.insert(id, Pending::SelectionRange);
        self.worker.submit(job);
    }

    fn on_document_symbol(&mut self, request: Request) {
        let id = request.id;
        let params = match serde_json::from_value::<DocumentSymbolParams>(request.params) {
            Ok(params) => params,
            Err(err) => {
                log::warn(format_args!("textDocument/documentSymbol: {err}"));
                self.respond_no_symbols(id);
                return;
            }
        };
        if !self.settings.document_symbol_enable {
            self.respond_no_symbols(id);
            return;
        }
        let uri = params.text_document.uri;
        match self.component(&uri) {
            Some((path, text)) => {
                self.pending.insert(id.clone(), Pending::DocumentSymbol);
                self.worker.submit(Job::DocumentSymbol {
                    id,
                    uri,
                    path,
                    text,
                    hierarchical: self.client.hierarchical_document_symbols,
                });
            }
            None => self.respond_no_symbols(id),
        }
    }

    /// An open component, as the worker needs it. Only components have Svelte
    /// template structure to report.
    fn component(&self, uri: &Uri) -> Option<(std::path::PathBuf, std::sync::Arc<String>)> {
        let document = self.component_document(uri)?;
        Some((uri_to_path(uri.as_str()), document.shared_text()))
    }

    fn component_document(&self, uri: &Uri) -> Option<&Document> {
        let document = self.documents.get(uri)?;
        (document.language_id == "svelte").then_some(document)
    }

    fn on_notification(&mut self, notification: Notification) {
        let method = notification.method.clone();
        match method.as_str() {
            "$/cancelRequest" => {
                match serde_json::from_value::<CancelParams>(notification.params) {
                    Ok(params) => self.cancel_request(params.id),
                    Err(err) => log::warn(format_args!("{method}: {err}")),
                }
            }
            "workspace/didChangeWorkspaceFolders" => {
                match serde_json::from_value::<DidChangeWorkspaceFoldersParams>(notification.params)
                {
                    Ok(params) => self
                        .client
                        .update_workspace_folders(params.event.added, &params.event.removed),
                    Err(err) => log::warn(format_args!("{method}: {err}")),
                }
            }
            "textDocument/didOpen" => {
                match serde_json::from_value::<DidOpenTextDocumentParams>(notification.params) {
                    Ok(params) => {
                        let doc = params.text_document;
                        let key = doc.uri.as_str().to_string();
                        self.documents
                            .open(doc.uri, doc.language_id, doc.version, doc.text);
                        if !self.client.pull_diagnostics {
                            self.schedule_lint(key, Duration::ZERO);
                        }
                    }
                    Err(err) => log::warn(format_args!("{method}: {err}")),
                }
            }
            "textDocument/didChange" => {
                match serde_json::from_value::<DidChangeTextDocumentParams>(notification.params) {
                    Ok(params) => {
                        let key = params.text_document.uri.as_str().to_string();
                        if let Some(document) = self.documents.get_mut(&params.text_document.uri) {
                            document.apply(params.text_document.version, &params.content_changes);
                            if !self.client.pull_diagnostics {
                                self.schedule_lint(key, LINT_DEBOUNCE);
                            }
                        }
                    }
                    Err(err) => log::warn(format_args!("{method}: {err}")),
                }
            }
            "textDocument/didSave" => {
                match serde_json::from_value::<DidSaveTextDocumentParams>(notification.params) {
                    Ok(params) => {
                        if !self.client.pull_diagnostics {
                            self.schedule_lint(
                                params.text_document.uri.as_str().to_string(),
                                Duration::ZERO,
                            );
                        }
                    }
                    Err(err) => log::warn(format_args!("{method}: {err}")),
                }
            }
            "textDocument/didClose" => {
                match serde_json::from_value::<DidCloseTextDocumentParams>(notification.params) {
                    Ok(params) => {
                        let uri = params.text_document.uri;
                        self.scheduled.remove(uri.as_str());
                        self.linted.remove(uri.as_str());
                        let version = self.documents.close(&uri).map_or(0, |d| d.version);
                        if !self.client.pull_diagnostics {
                            self.publish(uri, version, Vec::new());
                        }
                    }
                    Err(err) => log::warn(format_args!("{method}: {err}")),
                }
            }
            "workspace/didChangeConfiguration" => {
                // A `rsvelte-lint.json` / `.oxfmtrc` edit reaches the server as
                // a configuration change too, so the resolved-config caches are
                // dropped along with the client settings.
                self.worker.submit(Job::ClearCaches);
                if self.client.pull_configuration {
                    self.request_configuration();
                } else {
                    self.settings = Settings::default();
                    if !self.client.pull_diagnostics {
                        self.relint_open_documents();
                    }
                }
            }
            "exit" => self.exiting = true,
            _ => {}
        }
    }

    fn cancel_request(&mut self, id: NumberOrString) {
        let id = match id {
            NumberOrString::Number(id) => RequestId::from(id),
            NumberOrString::String(id) => RequestId::from(id),
        };
        if self.pending.remove(&id).is_some() {
            self.respond(Response::new_err(
                id,
                ErrorCode::RequestCanceled as i32,
                "request cancelled by client".to_string(),
            ));
        }
    }

    fn on_response(&mut self, response: Response) {
        let Some(outgoing) = self.outgoing.remove(&response.id) else {
            log::warn(format_args!("response to unknown request {}", response.id));
            return;
        };
        match outgoing {
            Outgoing::Configuration => {
                self.settings = match response.response_result {
                    Ok(value) => value
                        .as_array()
                        .and_then(|items| items.first())
                        .map(Settings::from_json)
                        .unwrap_or_default(),
                    Err(err) => {
                        log::warn(format_args!(
                            "workspace/configuration failed: {}",
                            err.message
                        ));
                        Settings::default()
                    }
                };
                if !self.client.pull_diagnostics {
                    self.relint_open_documents();
                }
            }
        }
    }

    fn on_outcome(&mut self, outcome: Outcome) {
        match outcome {
            Outcome::Formatted { id, edits } => {
                // A request that is no longer pending was cancelled or already
                // answered; its result is simply dropped.
                if self.pending.remove(&id).is_some() {
                    self.respond(Response::new_ok(id, edits));
                }
            }
            Outcome::Completed { id, list } => {
                if self.pending.remove(&id).is_some() {
                    self.respond(Response::new_ok(id, list));
                }
            }
            Outcome::Hovered { id, hover } => {
                if self.pending.remove(&id).is_some() {
                    self.respond(Response::new_ok(id, hover));
                }
            }
            Outcome::CodeActions { id, actions } => {
                if self.pending.remove(&id).is_some() {
                    self.respond(Response::new_ok(id, actions));
                }
            }
            Outcome::FoldingRanges { id, ranges } => {
                if self.pending.remove(&id).is_some() {
                    self.respond(Response::new_ok(id, ranges));
                }
            }
            Outcome::SelectionRanges { id, ranges } => {
                if self.pending.remove(&id).is_some() {
                    self.respond(Response::new_ok(id, ranges));
                }
            }
            Outcome::DocumentSymbols { id, symbols } => {
                if self.pending.remove(&id).is_some() {
                    self.respond(Response::new_ok(id, symbols));
                }
            }
            Outcome::PulledDiagnostics { id, diagnostics } => {
                if self.pending.remove(&id).is_some() {
                    self.respond_diagnostic_report(id, diagnostics);
                }
            }
            Outcome::Diagnostics {
                key,
                uri,
                version,
                diagnostics,
            } => {
                if self.documents.get_by_key(&key).is_some() {
                    self.publish(uri, version, diagnostics);
                }
            }
        }
    }

    fn request_configuration(&mut self) {
        self.next_request_id += 1;
        let id = RequestId::from(format!("rsvelte-configuration-{}", self.next_request_id));
        self.outgoing.insert(id.clone(), Outgoing::Configuration);
        self.send(Request::new(
            id,
            "workspace/configuration".to_string(),
            ConfigurationParams {
                items: vec![ConfigurationItem {
                    scope_uri: None,
                    section: Some(CONFIG_SECTION.to_string()),
                }],
            },
        ));
    }

    fn schedule_lint(&mut self, key: String, delay: Duration) {
        self.scheduled.insert(key, Instant::now() + delay);
    }

    /// Re-lint everything after the settings changed — the results may differ
    /// even though no document did, so the content-hash guard is reset.
    fn relint_open_documents(&mut self) {
        self.linted.clear();
        let keys: Vec<String> = self
            .documents
            .iter()
            .map(|d| d.uri.as_str().to_string())
            .collect();
        for key in keys {
            self.schedule_lint(key, Duration::ZERO);
        }
    }

    fn run_scheduled_lints(&mut self) {
        let now = Instant::now();
        let due: Vec<String> = self
            .scheduled
            .iter()
            .filter(|&(_, &deadline)| deadline <= now)
            .map(|(key, _)| key.clone())
            .collect();
        for key in due {
            self.scheduled.remove(&key);
            self.lint(&key);
        }
    }

    fn lint(&mut self, key: &str) {
        let Some(document) = self.documents.get_by_key(key) else {
            return;
        };
        let uri = document.uri.clone();
        let version = document.version;
        let hash = document.content_hash();
        // A burst of edits that cancel out leaves the text — and therefore the
        // diagnostics already on screen — unchanged.
        if self.linted.get(key) == Some(&hash) {
            return;
        }
        self.linted.insert(key.to_string(), hash);

        if !self.settings.lint_enable || !is_lint_target(document) {
            self.publish(uri, version, Vec::new());
            return;
        }
        self.worker.submit(Job::Lint {
            key: key.to_string(),
            uri,
            version,
            path: uri_to_path(key),
            text: document.shared_text(),
            warnings: self.settings.compiler_warnings.clone(),
        });
    }

    fn publish(&self, uri: Uri, version: i32, diagnostics: Vec<lsp_types::Diagnostic>) {
        self.send(Notification::new(
            "textDocument/publishDiagnostics".to_string(),
            PublishDiagnosticsParams {
                uri,
                diagnostics,
                version: Some(version),
            },
        ));
    }

    fn respond_diagnostic_report(&self, id: RequestId, diagnostics: Vec<lsp_types::Diagnostic>) {
        let report = DocumentDiagnosticReport::Full(RelatedFullDocumentDiagnosticReport {
            related_documents: None,
            full_document_diagnostic_report: FullDocumentDiagnosticReport {
                result_id: None,
                items: diagnostics,
            },
        });
        self.respond(Response::new_ok(id, report));
    }

    fn respond_no_edits(&self, id: RequestId) {
        self.respond(Response::new_ok(id, Vec::<TextEdit>::new()));
    }

    /// A request with nothing to offer is answered with `null`, not an error.
    fn respond_nothing(&self, id: RequestId) {
        self.respond(Response::new_ok(id, serde_json::Value::Null));
    }

    fn respond_no_actions(&self, id: RequestId) {
        self.respond(Response::new_ok(id, Vec::<CodeActionOrCommand>::new()));
    }

    fn respond_no_ranges(&self, id: RequestId) {
        self.respond(Response::new_ok(id, Vec::<FoldingRange>::new()));
    }

    fn respond_no_symbols(&self, id: RequestId) {
        self.respond(Response::new_ok(
            id,
            DocumentSymbolResponse::Nested(Vec::new()),
        ));
    }

    fn respond(&self, response: Response) {
        self.send(response);
    }

    fn send(&self, message: impl Into<Message>) {
        let _ = self.sender.send(message.into());
    }
}

/// Svelte components plus the `.svelte.js` / `.svelte.ts` module dialect.
fn is_lint_target(document: &Document) -> bool {
    if document.language_id == "svelte" {
        return true;
    }
    let uri = document.uri.as_str();
    uri.ends_with(".svelte.js") || uri.ends_with(".svelte.ts")
}
