//! The type check of `rsvelte typecheck`, run in each workspace folder on the editor's texts.
//! After a change and a pause, the folder's project is checked again, and the editor gets the
//! errors of every file of it, as `rsvelte typecheck` prints them.

use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex, PoisonError};
use std::time::Duration;

use oxc_language_server::uri_utils::{file_path_to_uri, uri_to_file_path};
use rsvelte_kernel::diagnostics::{Diagnostic as Found, Severity};
use tokio::sync::Notify;
use tower_lsp_server::gen_lsp_types::{
    Code, Diagnostic, DiagnosticSeverity, DidChangeTextDocumentParams, DidChangeWatchedFilesParams,
    DidCloseTextDocumentParams, DidOpenTextDocumentParams, DidSaveTextDocumentParams,
    InitializeParams, InitializeResult, InitializedParams, Message, MessageType,
    TextDocumentContentChangeEvent, Uri, WorkspaceFolders,
};
use tower_lsp_server::jsonrpc::Result;
use tower_lsp_server::{Client, LanguageServer};

use crate::commands::typecheck::{self, Checked};
use crate::configuration;

/// How long the check waits after a change, so that typing checks once, not once per key.
const PAUSE: Duration = Duration::from_millis(200);

pub(super) struct TypeCheck {
    client: Client,
    state: Arc<State>,
}

#[derive(Default)]
struct State {
    folders: Mutex<Vec<Folder>>,
    /// The editor's text of each open document, by the document's real path, with its URI.
    open: Mutex<HashMap<PathBuf, (Uri, String)>>,
    /// The files that have errors in the editor now.
    shown: Mutex<HashSet<Uri>>,
    changed: Notify,
    /// The editor asked the server to shut down, so no check is wanted.
    stopped: AtomicBool,
}

/// A workspace folder, by the path the editor names it and by its real path.
#[derive(Clone)]
struct Folder {
    given: PathBuf,
    real: PathBuf,
}

impl TypeCheck {
    pub(super) fn new(client: Client) -> Self {
        Self {
            client,
            state: Arc::default(),
        }
    }

    fn edited(&self, uri: &Uri, text: Option<String>) {
        let Some(path) = uri_to_file_path(uri).and_then(|path| real(&path)) else {
            return;
        };
        let mut open = lock(&self.state.open);
        match text {
            Some(text) => {
                open.insert(path, (uri.clone(), text));
            }
            None => {
                open.remove(&path);
            }
        }
        drop(open);
        self.state.changed.notify_one();
    }
}

impl LanguageServer for TypeCheck {
    fn initialize(
        &self,
        params: InitializeParams,
    ) -> impl Future<Output = Result<InitializeResult>> + Send {
        #[expect(
            deprecated,
            reason = "a client without workspace folders sends only it"
        )]
        let root = params.root_uri.as_ref();
        let listed = match &params.workspace_folders_initialize_params.workspace_folders {
            Some(WorkspaceFolders::WorkspaceFolderList(folders)) => folders.as_slice(),
            _ => &[],
        };
        let mut folders = (listed.iter())
            .map(|folder| &folder.uri)
            .chain(root)
            .filter_map(|uri| {
                let given = uri_to_file_path(uri)?.into_owned();
                let real = real(&given)?;
                Some(Folder { given, real })
            })
            .collect::<Vec<_>>();
        folders.sort_by(|a, b| a.real.cmp(&b.real));
        folders.dedup_by(|a, b| a.real == b.real);
        *lock(&self.state.folders) = folders;
        // The router answers the editor with the lint's capabilities.
        std::future::ready(Ok(InitializeResult::default()))
    }

    async fn initialized(&self, _: InitializedParams) {
        tokio::spawn(check_on_change(
            self.client.clone(),
            Arc::clone(&self.state),
        ));
        self.state.changed.notify_one();
    }

    fn shutdown(&self) -> impl Future<Output = Result<()>> + Send {
        self.state.stopped.store(true, Ordering::Relaxed);
        self.state.changed.notify_one();
        std::future::ready(Ok(()))
    }

    async fn did_open(&self, params: DidOpenTextDocumentParams) {
        self.edited(&params.text_document.uri, Some(params.text_document.text));
    }

    fn did_change(&self, params: DidChangeTextDocumentParams) -> impl Future<Output = ()> + Send {
        // The lint takes the whole text on each change, and so does this check.
        if let Some(TextDocumentContentChangeEvent::TextDocumentContentChangeWholeDocument(
            change,
        )) = params.content_changes.into_iter().last()
        {
            let uri = &params.text_document.text_document_identifier.uri;
            self.edited(uri, Some(change.text));
        }
        std::future::ready(())
    }

    async fn did_save(&self, _: DidSaveTextDocumentParams) {
        self.state.changed.notify_one();
    }

    async fn did_close(&self, params: DidCloseTextDocumentParams) {
        // The file's text on the disk counts again.
        self.edited(&params.text_document.uri, None);
    }

    async fn did_change_watched_files(&self, _: DidChangeWatchedFilesParams) {
        self.state.changed.notify_one();
    }
}

/// Checks each folder after each change, until the editor asks the server to shut down.
async fn check_on_change(client: Client, state: Arc<State>) {
    while !state.stopped.load(Ordering::Relaxed) {
        state.changed.notified().await;
        // A change in the pause joins this check.
        tokio::time::sleep(PAUSE).await;
        if state.stopped.load(Ordering::Relaxed) {
            return;
        }
        let folders = lock(&state.folders).clone();
        let open = lock(&state.open).clone();
        let checked = tokio::task::spawn_blocking(move || {
            (folders.iter())
                .map(|folder| check(folder, &open))
                .collect::<Vec<_>>()
        })
        .await;
        let checked = match checked {
            Ok(checked) => checked,
            Err(panic) => {
                let message = format!("rsvelte typecheck panicked: {panic}");
                client.log_message(MessageType::Error, message).await;
                continue;
            }
        };
        let mut now = HashMap::new();
        for found in checked {
            match found {
                Ok(found) => now.extend(found),
                Err(error) => {
                    let message = format!("rsvelte typecheck: {error}");
                    client.log_message(MessageType::Warning, message).await;
                }
            }
        }
        let cleared: Vec<Uri> = (lock(&state.shown).iter())
            .filter(|uri| !now.contains_key(*uri))
            .cloned()
            .collect();
        *lock(&state.shown) = now.keys().cloned().collect();
        for uri in cleared {
            client.publish_diagnostics(uri, Vec::new(), None).await;
        }
        // In the same order each time, so an editor's list does not shuffle.
        let mut now: Vec<_> = now.into_iter().collect();
        now.sort_by(|(a, _), (b, _)| a.as_str().cmp(b.as_str()));
        for (uri, diagnostics) in now {
            client.publish_diagnostics(uri, diagnostics, None).await;
        }
    }
}

/// The errors of each file of the project in `folder` that has any, by the file's URI, as
/// `rsvelte typecheck` run in `folder` finds them in the editor's texts.
fn check(
    folder: &Folder,
    open: &HashMap<PathBuf, (Uri, String)>,
) -> std::result::Result<HashMap<Uri, Vec<Diagnostic>>, String> {
    let installation = super::super::installation(super::super::TYPECHECK);
    let (reg, _) = crate::configured_registry(
        &configuration::Options::default(),
        &[],
        installation,
        &folder.given,
    )?;
    let text = |path: &Path| {
        let path = real(path)?;
        open.get(&path).map(|(_, text)| text.clone())
    };
    let mut found = HashMap::new();
    match typecheck::check(&reg, super::super::TYPECHECK, &text)? {
        Checked::Files(files) => {
            for (document, result) in files {
                let diagnostics: Vec<_> = (result.outputs.iter())
                    .flat_map(|(_, output)| {
                        (output.diagnostics.iter())
                            .chain(output.findings.iter().map(|finding| &finding.diagnostic))
                    })
                    .map(|d| diagnostic(&document.text, d))
                    .chain(result.panic.as_deref().map(panicked))
                    .collect();
                let path = document.file_path();
                if let (false, Some(uri)) = (diagnostics.is_empty(), uri_of(path, folder, open)) {
                    found.insert(uri, diagnostics);
                }
            }
        }
        Checked::Problems(problems) => {
            for (path, problem) in problems {
                let text = std::fs::read_to_string(&path)
                    .map_err(|e| format!("{}: {e}", path.display()))?;
                if let Some(uri) = uri_of(&path, folder, open) {
                    found
                        .entry(uri)
                        .or_insert_with(Vec::new)
                        .push(diagnostic(&text, &problem));
                }
            }
        }
    }
    Ok(found)
}

/// The URI the editor knows `path` by: an open document's, else the path below the folder as the
/// editor names the folder, else the file's own.
fn uri_of(path: &Path, folder: &Folder, open: &HashMap<PathBuf, (Uri, String)>) -> Option<Uri> {
    let real = real(path);
    if let Some((uri, _)) = real.as_ref().and_then(|real| open.get(real)) {
        return Some(uri.clone());
    }
    let inside = (real
        .as_deref()
        .unwrap_or(path)
        .strip_prefix(&folder.real)
        .ok())
    .map(|below| folder.given.join(below));
    file_path_to_uri(inside.as_deref().unwrap_or(path))
}

/// `found` in `text`, as the editor places it. TypeScript counts positions after a byte order
/// mark, as an editor does, while a span counts it.
fn diagnostic(text: &str, found: &Found) -> Diagnostic {
    let after_mark = text.strip_prefix('\u{feff}').unwrap_or(text);
    let mark = (text.len() - after_mark.len()) as u32;
    let lines = super::convert::lines(after_mark);
    let at = |offset: u32| offset.saturating_sub(mark);
    let span = rsvelte_kernel::source::positions::Span::new(
        at(found.span.start_offset),
        at(found.span.end_offset),
    );
    let (source, code) = found
        .code
        .strip_prefix("TS")
        .and_then(|n| n.parse().ok())
        .map_or_else(
            || ("rsvelte", Code::String(found.code.to_string())),
            |n| ("ts", Code::Int(n)),
        );
    Diagnostic {
        range: super::convert::range(&lines, span),
        severity: Some(match found.severity {
            Severity::Error => DiagnosticSeverity::Error,
            Severity::Warning => DiagnosticSeverity::Warning,
        }),
        code: Some(code),
        source: Some(source.to_owned()),
        message: Message::String(found.message.clone()),
        ..Diagnostic::default()
    }
}

/// The report of a check that panicked on a file, as `rsvelte typecheck` prints it.
fn panicked(panic: &str) -> Diagnostic {
    Diagnostic {
        severity: Some(DiagnosticSeverity::Error),
        source: Some("rsvelte".to_owned()),
        message: Message::String(format!("rsvelte panicked: {panic}")),
        ..Diagnostic::default()
    }
}

/// `path` as the checker names it, by its real path, such as `/private/var` for `/var`.
fn real(path: &Path) -> Option<PathBuf> {
    rsvelte_kernel::source::paths::canonicalize(path).ok()
}

fn lock<T>(mutex: &Mutex<T>) -> std::sync::MutexGuard<'_, T> {
    mutex.lock().unwrap_or_else(PoisonError::into_inner)
}
