//! The LSP message loop.

use std::collections::HashMap;
use std::path::Path;
use std::time::{Duration, Instant};

use anyhow::Result;
use crossbeam_channel::{RecvTimeoutError, Sender};
use lsp_server::{Connection, ErrorCode, Message, Notification, Request, RequestId, Response};
use lsp_types::{
    ConfigurationItem, ConfigurationParams, DidChangeTextDocumentParams,
    DidCloseTextDocumentParams, DidOpenTextDocumentParams, DidSaveTextDocumentParams,
    DocumentFormattingParams, InitializeParams, OneOf, PublishDiagnosticsParams,
    ServerCapabilities, TextDocumentSyncCapability, TextDocumentSyncKind, TextDocumentSyncOptions,
    TextDocumentSyncSaveOptions, TextEdit, Uri,
};

use crate::document::{Document, DocumentStore};
use crate::format::FormatSessions;
use crate::lint::LintConfigCache;
use crate::settings::Settings;
use crate::uri::uri_to_path;

pub const SERVER_NAME: &str = "rsvelte-language-server";
pub const VERSION: &str = env!("CARGO_PKG_VERSION");

/// How long a burst of edits is coalesced before re-linting.
const LINT_DEBOUNCE: Duration = Duration::from_millis(300);

/// The `rsvelte` configuration section this server pulls from the client.
const CONFIG_SECTION: &str = "rsvelte";

/// Serve the LSP over stdio until the client shuts the connection down.
pub fn run_stdio() -> Result<()> {
    let (connection, io_threads) = Connection::stdio();
    let (id, params) = connection.initialize_start()?;
    let params: InitializeParams = serde_json::from_value(params)?;
    let pull_configuration = params
        .capabilities
        .workspace
        .as_ref()
        .and_then(|w| w.configuration)
        .unwrap_or(false);

    connection.initialize_finish(
        id,
        serde_json::json!({
            "capabilities": capabilities(),
            "serverInfo": { "name": SERVER_NAME, "version": VERSION },
        }),
    )?;

    Server::new(connection.sender.clone(), pull_configuration).run(&connection)?;
    // The writer thread ends only once every sender is gone, so the connection
    // (and the server's clone of it) must be dropped before joining.
    drop(connection);
    io_threads.join()?;
    Ok(())
}

fn capabilities() -> ServerCapabilities {
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
        ..ServerCapabilities::default()
    }
}

struct Server {
    sender: Sender<Message>,
    pull_configuration: bool,
    settings: Settings,
    documents: DocumentStore,
    format_sessions: FormatSessions,
    lint_configs: LintConfigCache,
    /// Documents awaiting a lint, and when it comes due.
    scheduled: HashMap<String, Instant>,
    /// The content hash each document was last linted at.
    linted: HashMap<String, u64>,
    config_request: Option<RequestId>,
    next_request_id: u32,
}

impl Server {
    fn new(sender: Sender<Message>, pull_configuration: bool) -> Self {
        Self {
            sender,
            pull_configuration,
            settings: Settings::default(),
            documents: DocumentStore::default(),
            format_sessions: FormatSessions::default(),
            lint_configs: LintConfigCache::default(),
            scheduled: HashMap::new(),
            linted: HashMap::new(),
            config_request: None,
            next_request_id: 0,
        }
    }

    fn run(&mut self, connection: &Connection) -> Result<()> {
        if self.pull_configuration {
            self.request_configuration();
        }
        loop {
            let message = match self.scheduled.values().min().copied() {
                Some(deadline) => {
                    let Some(wait) = deadline.checked_duration_since(Instant::now()) else {
                        self.run_scheduled_lints();
                        continue;
                    };
                    match connection.receiver.recv_timeout(wait) {
                        Ok(message) => message,
                        Err(RecvTimeoutError::Timeout) => {
                            self.run_scheduled_lints();
                            continue;
                        }
                        Err(RecvTimeoutError::Disconnected) => break,
                    }
                }
                None => match connection.receiver.recv() {
                    Ok(message) => message,
                    Err(_) => break,
                },
            };

            match message {
                Message::Request(request) => {
                    if connection.handle_shutdown(&request)? {
                        return Ok(());
                    }
                    self.on_request(request);
                }
                Message::Notification(notification) => self.on_notification(notification),
                Message::Response(response) => self.on_response(response),
            }
        }
        Ok(())
    }

    // ── Requests ────────────────────────────────────────────────────────

    fn on_request(&mut self, request: Request) {
        match request.method.as_str() {
            "textDocument/formatting" => {
                let edits = match serde_json::from_value::<DocumentFormattingParams>(request.params)
                {
                    Ok(params) => self.format(&params.text_document.uri),
                    Err(_) => Vec::new(),
                };
                self.send(Response::new_ok(request.id, edits));
            }
            _ => self.send(Response::new_err(
                request.id,
                ErrorCode::MethodNotFound as i32,
                format!("unhandled method {}", request.method),
            )),
        }
    }

    fn format(&mut self, uri: &Uri) -> Vec<TextEdit> {
        if !self.settings.format_enable {
            return Vec::new();
        }
        let Some(document) = self.documents.get(uri) else {
            return Vec::new();
        };
        let path = uri_to_path(uri.as_str());
        let source = document.text();
        let range = document.full_range();

        let Ok(session) = self.format_sessions.get(&path) else {
            return Vec::new();
        };
        // Formatting is never an error: a failure yields no edits.
        let Ok(formatted) = session.format(source, &path) else {
            return Vec::new();
        };
        if formatted == source {
            return Vec::new();
        }
        vec![TextEdit {
            range,
            new_text: formatted,
        }]
    }

    // ── Notifications ───────────────────────────────────────────────────

    fn on_notification(&mut self, notification: Notification) {
        match notification.method.as_str() {
            "textDocument/didOpen" => {
                if let Ok(params) =
                    serde_json::from_value::<DidOpenTextDocumentParams>(notification.params)
                {
                    let doc = params.text_document;
                    let key = doc.uri.as_str().to_string();
                    self.documents
                        .open(doc.uri, doc.language_id, doc.version, doc.text);
                    self.schedule_lint(key, Duration::ZERO);
                }
            }
            "textDocument/didChange" => {
                if let Ok(params) =
                    serde_json::from_value::<DidChangeTextDocumentParams>(notification.params)
                {
                    let key = params.text_document.uri.as_str().to_string();
                    if let Some(document) = self.documents.get_mut(&params.text_document.uri) {
                        document.apply(params.text_document.version, &params.content_changes);
                        self.schedule_lint(key, LINT_DEBOUNCE);
                    }
                }
            }
            "textDocument/didSave" => {
                if let Ok(params) =
                    serde_json::from_value::<DidSaveTextDocumentParams>(notification.params)
                {
                    self.schedule_lint(
                        params.text_document.uri.as_str().to_string(),
                        Duration::ZERO,
                    );
                }
            }
            "textDocument/didClose" => {
                if let Ok(params) =
                    serde_json::from_value::<DidCloseTextDocumentParams>(notification.params)
                {
                    let uri = params.text_document.uri;
                    self.scheduled.remove(uri.as_str());
                    self.linted.remove(uri.as_str());
                    self.documents.close(&uri);
                    self.publish(uri, Vec::new());
                }
            }
            "workspace/didChangeConfiguration" => {
                if self.pull_configuration {
                    self.request_configuration();
                } else {
                    self.settings = Settings::default();
                    self.relint_open_documents();
                }
            }
            _ => {}
        }
    }

    fn on_response(&mut self, response: Response) {
        if self.config_request.as_ref() != Some(&response.id) {
            return;
        }
        self.config_request = None;
        self.settings = response
            .response_result
            .ok()
            .and_then(|value| value.as_array()?.first().map(Settings::from_json))
            .unwrap_or_default();
        self.relint_open_documents();
    }

    fn request_configuration(&mut self) {
        self.next_request_id += 1;
        let id = RequestId::from(format!("rsvelte-configuration-{}", self.next_request_id));
        self.config_request = Some(id.clone());
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

    // ── Diagnostics ─────────────────────────────────────────────────────

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
        let hash = document.content_hash();
        // A burst of edits that cancel out leaves the text — and therefore the
        // diagnostics already on screen — unchanged.
        if self.linted.get(key) == Some(&hash) {
            return;
        }
        self.linted.insert(key.to_string(), hash);

        if !self.settings.lint_enable || !is_lint_target(document) {
            self.publish(uri, Vec::new());
            return;
        }

        let path = uri_to_path(key);
        let config = self
            .lint_configs
            .get(path.parent().unwrap_or(Path::new(".")));
        let source = self
            .documents
            .get_by_key(key)
            .map(Document::text)
            .unwrap_or_default();
        let diagnostics = crate::lint::lint(&path, source, &config)
            .iter()
            .map(crate::diagnostics::to_lsp)
            .collect();
        self.publish(uri, diagnostics);
    }

    fn publish(&self, uri: Uri, diagnostics: Vec<lsp_types::Diagnostic>) {
        self.send(Notification::new(
            "textDocument/publishDiagnostics".to_string(),
            PublishDiagnosticsParams {
                uri,
                diagnostics,
                version: None,
            },
        ));
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
