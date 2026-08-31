//! The LSP message loop.

use std::collections::{HashMap, HashSet};
use std::ffi::OsString;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::ExitCode;
use std::sync::Arc;
use std::time::{Duration, Instant};

use anyhow::Result;
use crossbeam_channel::{Receiver, Sender, after, never, select, unbounded};
use lsp_server::{Connection, ErrorCode, Message, Notification, Request, RequestId, Response};
use lsp_types::{
    CallHierarchyServerCapability, CancelParams, CodeActionKind, CodeActionOptions,
    CodeActionOrCommand, CodeActionParams, CodeActionProviderCapability, CodeLens, CodeLensOptions,
    CodeLensParams, ColorPresentationParams, ColorProviderCapability, CompletionOptions,
    CompletionOptionsCompletionItem, CompletionParams, ConfigurationItem, ConfigurationParams,
    DiagnosticOptions, DiagnosticServerCapabilities, DidChangeTextDocumentParams,
    DidChangeWatchedFilesParams, DidChangeWorkspaceFoldersParams, DidCloseTextDocumentParams,
    DidOpenTextDocumentParams, DidSaveTextDocumentParams, DocumentColorParams,
    DocumentDiagnosticParams, DocumentDiagnosticReport, DocumentFormattingParams,
    DocumentHighlightParams, DocumentSymbolParams, DocumentSymbolResponse, ExecuteCommandOptions,
    ExecuteCommandParams, FoldingRange, FoldingRangeParams, FoldingRangeProviderCapability,
    FullDocumentDiagnosticReport, HoverParams, HoverProviderCapability,
    ImplementationProviderCapability, LinkedEditingRangeParams,
    LinkedEditingRangeServerCapabilities, NumberOrString, OneOf, Position, PositionEncodingKind,
    PublishDiagnosticsParams, RelatedFullDocumentDiagnosticReport, RenameOptions, RenameParams,
    SaveOptions, SelectionRangeParams, SelectionRangeProviderCapability, SemanticTokenModifier,
    SemanticTokenType, SemanticTokensFullOptions, SemanticTokensLegend, SemanticTokensOptions,
    SemanticTokensServerCapabilities, ServerCapabilities, SignatureHelpOptions,
    TextDocumentPositionParams, TextDocumentSyncCapability, TextDocumentSyncKind,
    TextDocumentSyncOptions, TextDocumentSyncSaveOptions, TextEdit,
    TypeDefinitionProviderCapability, Uri, WorkspaceFoldersServerCapabilities,
};

use rsvelte_projection::is_typescript_component;

use crate::client::ClientState;
use crate::completions::TRIGGER_CHARACTERS;
use crate::document::{Document, DocumentStore};
use crate::log;
use crate::preprocess_sidecar::{
    PreprocessEvent, PreprocessInput, PreprocessSidecar, PreprocessSidecarConfig,
    find_preprocess_config,
};
use crate::settings::Settings;
use crate::text::LineIndex;
use crate::tsgo_client::{OpenBuffer, TsgoClient, TsgoConfig, TsgoEvent};
use crate::tsgo_code_actions::{
    TsgoCodeActionContext, document_has_parser_error, rewrite_code_action_response,
};
use crate::tsgo_completion::{
    CompletionAction, CompletionRewriteContext, CompletionSite, adopt_upstream_completion_data,
    adopt_upstream_item_data, completion_action, restore_tsgo_completion_data,
    rewrite_completion_item_for_context, rewrite_completion_response_for_context,
    rewrite_visible_tsgo_response, upstream_completion_data_site,
};
use crate::tsgo_component_info::{
    ComponentCompletionSite, ComponentInfoAction, ComponentInfoQuery, ComponentInfoRequestId,
    component_completion_site, generated_component_ranges,
};
use crate::tsgo_custom::{
    CodeLensKind, ComponentReference, ShadowUriPair, WillRenameMapping, code_lens_kind,
    component_probe_position, component_reference_code_lens, filter_component_references,
    prepare_code_lenses, resolve_code_lens, rewrite_will_rename_params, rewrite_will_rename_result,
};
use crate::tsgo_overlay::TsgoOverlay;
use crate::tsgo_rename::{
    PrepareRenamePlan, RenameDocument, merge_workspace_edits, prepare_rename_plan,
    rewrite_prepare_response, rewrite_workspace_edit,
};
use crate::tsgo_response::{
    RequestDocumentContext, TsgoResponseMapper, empty_completion_list, normalize_definition_result,
    normalize_hover_result, tsgo_unmapped_result, widen_hover_range_over_string_quotes,
};
use crate::uri::{path_to_uri, uri_to_path};
use crate::worker::{FileReferenceSource, Job, Outcome, PreprocessedAnalysis, Worker};

pub const SERVER_NAME: &str = "rsvelte-language-server";
pub const VERSION: &str = env!("CARGO_PKG_VERSION");

/// How long a burst of edits is coalesced before re-linting.
const LINT_DEBOUNCE: Duration = Duration::from_millis(300);

/// The `rsvelte` configuration section this server pulls from the client.
const CONFIG_SECTION: &str = "rsvelte";
const SVELTE_CONFIG_SECTION: &str = "svelte";
const JS_TS_CONFIG_SECTION: &str = "js/ts";
const TYPESCRIPT_CONFIG_SECTION: &str = "typescript";
const JAVASCRIPT_CONFIG_SECTION: &str = "javascript";
const EDITOR_CONFIG_SECTION: &str = "editor";

const TSGO_SEMANTIC_TOKEN_TYPES: &[&str] = &[
    "namespace",
    "class",
    "enum",
    "interface",
    "struct",
    "typeParameter",
    "type",
    "parameter",
    "variable",
    "property",
    "enumMember",
    "decorator",
    "event",
    "function",
    "method",
    "macro",
    "label",
    "comment",
    "string",
    "keyword",
    "number",
    "regexp",
    "operator",
];
const TSGO_SEMANTIC_TOKEN_MODIFIERS: &[&str] = &[
    "declaration",
    "definition",
    "readonly",
    "static",
    "deprecated",
    "abstract",
    "async",
    "modification",
    "documentation",
    "defaultLibrary",
    "local",
];

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
    let (connection, io_threads) = crate::transport::stdio();
    let (id, params) = connection.initialize_start()?;
    let client = ClientState::from_initialize(&params);
    let tsgo = TsgoRuntime::start(&client, &params);

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
        tsgo,
        params,
    )
    .run(&connection)?;

    // The writer thread ends only once every sender is gone, so the connection
    // (and the server's clone of it) must be dropped before joining.
    drop(connection);
    io_threads.join()?;
    Ok(code)
}

fn capabilities(client: &ClientState) -> ServerCapabilities {
    let mut code_action_kinds = vec![
        CodeActionKind::QUICKFIX,
        CodeActionKind::SOURCE_ORGANIZE_IMPORTS,
        CodeActionKind::from(crate::tsgo_code_actions::SORT_IMPORTS_KIND),
        CodeActionKind::from(crate::tsgo_code_actions::ADD_MISSING_IMPORTS_KIND),
        CodeActionKind::from(crate::tsgo_code_actions::REMOVE_UNUSED_IMPORTS_KIND),
        CodeActionKind::SOURCE_FIX_ALL,
        CodeActionKind::from(crate::code_actions::FIX_ALL_KIND),
    ];
    if client.apply_edit {
        code_action_kinds.insert(1, CodeActionKind::REFACTOR);
    }
    ServerCapabilities {
        // The editor-facing protocol stays on the LSP default. The tsgo child
        // is negotiated separately to UTF-8 so all internal mapping is byte-based.
        position_encoding: Some(PositionEncodingKind::UTF16),
        text_document_sync: Some(TextDocumentSyncCapability::Options(
            TextDocumentSyncOptions {
                open_close: Some(true),
                change: Some(TextDocumentSyncKind::INCREMENTAL),
                save: Some(TextDocumentSyncSaveOptions::SaveOptions(SaveOptions {
                    include_text: Some(false),
                })),
                ..TextDocumentSyncOptions::default()
            },
        )),
        document_formatting_provider: Some(OneOf::Left(true)),
        completion_provider: Some(CompletionOptions {
            trigger_characters: Some(TRIGGER_CHARACTERS.map(str::to_string).to_vec()),
            resolve_provider: Some(true),
            completion_item: Some(CompletionOptionsCompletionItem {
                label_details_support: Some(true),
            }),
            ..CompletionOptions::default()
        }),
        hover_provider: Some(HoverProviderCapability::Simple(true)),
        signature_help_provider: Some(SignatureHelpOptions {
            trigger_characters: Some(vec!["(".to_string(), ",".to_string(), "<".to_string()]),
            retrigger_characters: Some(vec![")".to_string()]),
            ..SignatureHelpOptions::default()
        }),
        definition_provider: Some(OneOf::Left(true)),
        type_definition_provider: Some(TypeDefinitionProviderCapability::Simple(true)),
        implementation_provider: Some(ImplementationProviderCapability::Simple(true)),
        references_provider: Some(OneOf::Left(true)),
        code_action_provider: Some(CodeActionProviderCapability::Options(CodeActionOptions {
            code_action_kinds: Some(code_action_kinds),
            ..CodeActionOptions::default()
        })),
        code_lens_provider: Some(CodeLensOptions {
            resolve_provider: Some(true),
        }),
        execute_command_provider: client.apply_edit.then(|| ExecuteCommandOptions {
            commands: vec![crate::extract::COMMAND.to_string()],
            ..ExecuteCommandOptions::default()
        }),
        folding_range_provider: Some(FoldingRangeProviderCapability::Simple(true)),
        selection_range_provider: Some(SelectionRangeProviderCapability::Simple(true)),
        document_symbol_provider: Some(OneOf::Left(true)),
        linked_editing_range_provider: Some(LinkedEditingRangeServerCapabilities::Simple(true)),
        document_highlight_provider: Some(OneOf::Left(client.document_highlight)),
        workspace_symbol_provider: Some(OneOf::Left(true)),
        rename_provider: Some(if client.rename_prepare {
            OneOf::Right(RenameOptions {
                prepare_provider: Some(true),
                work_done_progress_options: Default::default(),
            })
        } else {
            OneOf::Left(true)
        }),
        inlay_hint_provider: Some(OneOf::Left(true)),
        // tsgo narrows its own legend to the token names the editor advertised,
        // and its token data indexes that narrowed legend. The same filter has
        // to run here or every index past a dropped entry names the wrong type.
        semantic_tokens_provider: Some(SemanticTokensServerCapabilities::SemanticTokensOptions(
            SemanticTokensOptions {
                legend: SemanticTokensLegend {
                    token_types: TSGO_SEMANTIC_TOKEN_TYPES
                        .iter()
                        .filter(|token| {
                            client
                                .semantic_token_types
                                .iter()
                                .any(|supported| supported == **token)
                        })
                        .map(|token| SemanticTokenType::new(token))
                        .collect(),
                    token_modifiers: TSGO_SEMANTIC_TOKEN_MODIFIERS
                        .iter()
                        .filter(|modifier| {
                            client
                                .semantic_token_modifiers
                                .iter()
                                .any(|supported| supported == **modifier)
                        })
                        .map(|modifier| SemanticTokenModifier::new(modifier))
                        .collect(),
                },
                range: Some(true),
                full: Some(SemanticTokensFullOptions::Bool(true)),
                ..SemanticTokensOptions::default()
            },
        )),
        call_hierarchy_provider: Some(CallHierarchyServerCapability::Simple(true)),
        color_provider: Some(ColorProviderCapability::Simple(true)),
        diagnostic_provider: client.pull_diagnostics.then(|| {
            DiagnosticServerCapabilities::Options(DiagnosticOptions {
                identifier: Some(SERVER_NAME.to_string()),
                // A component's diagnostics come from a TypeScript program, so
                // editing one file can change another file's report.
                inter_file_dependencies: true,
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
    Completion { tsgo_fallback: Request },
    Hover { tsgo_fallback: Request },
    CodeAction { tsgo_fallback: Request },
    CodeLens { tsgo_fallback: Request },
    ExtractComponent,
    CompiledCode,
    FoldingRange { tsgo_fallback: Request },
    SelectionRange,
    DocumentSymbol { tsgo_fallback: Request },
    DocumentDiagnostic { tsgo_fallback: Request },
    FileReferences,
}

struct PendingTsgoRequest {
    method: String,
    document: Option<RequestDocumentContext>,
    fallback_result: Option<serde_json::Value>,
    completion_site: Option<CompletionSite>,
    rename: Option<PendingRename>,
    code_action_diagnostic_codes: Vec<u32>,
    push_diagnostics: Option<(Uri, i32)>,
    component_site: Option<ComponentCompletionSite>,
    component_references: Option<Uri>,
    file_rename: Option<PendingFileRename>,
    code_lens_resolve: Option<PendingCodeLensResolve>,
    /// The source document and position an adopted completion `data` names.
    completion_site_data: Option<(String, serde_json::Value)>,
}

struct PendingComponentQuery {
    query: ComponentInfoQuery,
    site: ComponentCompletionSite,
    result: serde_json::Value,
}

enum PendingRename {
    Prepare(PrepareRenamePlan),
    Primary {
        plan: PrepareRenamePlan,
        new_name: String,
    },
    Followup {
        editor_id: RequestId,
    },
}

struct RenameAggregate {
    plan: PrepareRenamePlan,
    new_name: String,
    edits: Vec<serde_json::Value>,
    remaining: usize,
}

struct PendingFileRename {
    old_source: Uri,
    old_shadow: Uri,
    new_source: Uri,
    new_shadow: Uri,
}

struct PendingCodeLensResolve {
    lens: serde_json::Value,
    kind: CodeLensKind,
    source_uri: Uri,
}

/// A request this server sent to the client, keyed by the id the client will
/// echo back.
enum Outgoing {
    Configuration,
    WatchedFilesRegistration,
    DiagnosticRefresh,
    ApplyEdit { command_id: RequestId },
    Tsgo { child_id: RequestId },
}

struct TsgoRuntime {
    client: TsgoClient,
    overlays: Vec<TsgoOverlay>,
    generation: Option<u64>,
}

struct PreprocessRuntime {
    client: PreprocessSidecar,
    generation: Option<u64>,
}

struct PreprocessDocumentState {
    version: i32,
    text: Arc<String>,
    map: Option<Arc<String>>,
    identity: bool,
}

impl TsgoRuntime {
    fn start(editor: &ClientState, initialize_params: &serde_json::Value) -> Option<Self> {
        let mut roots = editor
            .workspace_folders
            .iter()
            .map(|folder| uri_to_path(folder.uri.as_str()))
            .collect::<Vec<_>>();
        if roots.is_empty()
            && let Some(root) = &editor.root_uri
        {
            roots.push(uri_to_path(root.as_str()));
        }
        roots.retain(|root| root.is_dir());
        roots.sort();
        roots.dedup();
        let primary = roots.first()?.clone();

        let mut overlays = Vec::new();
        for root in &roots {
            match TsgoOverlay::build(root, None) {
                Ok(overlay) => {
                    for route in overlay.unresolved_shadow_routes() {
                        log::warn(format_args!(
                            "tsgo shadow is not resolvable: {} -> {}",
                            route.source_path.display(),
                            route.shadow_path.display()
                        ));
                    }
                    overlays.push(overlay);
                }
                Err(error) => log::warn(format_args!(
                    "could not prepare tsgo overlay for {}: {error}",
                    root.display()
                )),
            }
        }
        if overlays.is_empty() {
            return None;
        }

        let binary = match rsvelte_check::tsgo::find_compiler(&primary, true) {
            Ok(binary) => binary,
            Err(error) => {
                log::warn(format_args!(
                    "TypeScript language features unavailable: {error}"
                ));
                return None;
            }
        };
        let mut config = TsgoConfig::new(PathBuf::from(binary.program));
        config.args_prefix = binary.args_prefix.into_iter().map(OsString::from).collect();
        config.current_dir = Some(primary);
        config.root_uri = editor.root_uri.clone();
        config.workspace_folders = editor.workspace_folders.clone();
        config.editor_initialize_params = initialize_params.clone();
        let client = match TsgoClient::spawn(config) {
            Ok(client) => client,
            Err(error) => {
                log::warn(format_args!("could not start tsgo supervisor: {error}"));
                return None;
            }
        };
        for shadow in overlays.iter().flat_map(TsgoOverlay::eager_shadows) {
            let _ = client.open_buffer(OpenBuffer::new(
                shadow.shadow_uri.clone(),
                shadow.language_id.clone(),
                shadow.version,
                shadow.text.clone(),
            ));
        }
        Some(Self {
            client,
            overlays,
            generation: None,
        })
    }

    fn overlay_for_source_mut(&mut self, source: &Path) -> Option<&mut TsgoOverlay> {
        let source = fs::canonicalize(source).unwrap_or_else(|_| source.to_path_buf());
        self.overlays
            .iter_mut()
            .filter(|overlay| source.starts_with(overlay.workspace()))
            .max_by_key(|overlay| overlay.workspace().components().count())
    }

    fn overlay_for_source(&self, source: &Path) -> Option<&TsgoOverlay> {
        let source = fs::canonicalize(source).unwrap_or_else(|_| source.to_path_buf());
        self.overlays
            .iter()
            .filter(|overlay| source.starts_with(overlay.workspace()))
            .max_by_key(|overlay| overlay.workspace().components().count())
    }

    fn completion_document_context(
        &self,
        params: &serde_json::Value,
    ) -> Option<RequestDocumentContext> {
        let file_name = params
            .get("data")?
            .get("fileName")?
            .as_str()
            .map(Path::new)?;
        let mapper = TsgoResponseMapper::for_overlays(&self.overlays);
        for overlay in &self.overlays {
            let Some(source) = overlay.source_for_shadow(file_name) else {
                continue;
            };
            let Some(shadow) = overlay.shadow_for_source(source) else {
                continue;
            };
            let uri = &shadow.source_uri;
            if let Some(context) = mapper.document_context(uri) {
                return Some(context);
            }
        }
        None
    }
}

struct Server {
    sender: Sender<Message>,
    client: ClientState,
    settings: Settings,
    js_ts_settings: serde_json::Value,
    typescript_settings: serde_json::Value,
    javascript_settings: serde_json::Value,
    editor_settings: serde_json::Value,
    documents: DocumentStore,
    worker: Worker,
    outcomes: Receiver<Outcome>,
    /// Documents awaiting a lint, and when it comes due.
    scheduled: HashMap<String, Instant>,
    /// The content hash each document was last linted at.
    linted: HashMap<String, u64>,
    pending: HashMap<RequestId, Pending>,
    pending_tsgo: HashMap<RequestId, PendingTsgoRequest>,
    /// tsgo's own completion `data`, by entry name, for the sites whose items
    /// currently carry upstream's `{name, uri, position}` payload instead.
    completion_data: HashMap<String, HashMap<String, serde_json::Value>>,
    /// Insertion order of `completion_data`, oldest first.
    completion_order: Vec<String>,
    rename_aggregates: HashMap<RequestId, RenameAggregate>,
    component_queries: HashMap<RequestId, PendingComponentQuery>,
    component_query_requests: HashMap<RequestId, (RequestId, ComponentInfoRequestId)>,
    outgoing: HashMap<RequestId, Outgoing>,
    next_request_id: u32,
    tsgo: Option<TsgoRuntime>,
    preprocess: Option<PreprocessRuntime>,
    preprocess_events: Receiver<PreprocessEvent>,
    preprocess_event_sender: Sender<PreprocessEvent>,
    preprocess_failures: HashMap<PathBuf, (i32, String)>,
    preprocess_documents: HashMap<PathBuf, PreprocessDocumentState>,
    preprocess_dependencies: HashMap<PathBuf, HashSet<PathBuf>>,
    watched_preprocess_directories: HashSet<PathBuf>,
    initialize_params: serde_json::Value,
    shutdown_requested: bool,
    exiting: bool,
}

impl Server {
    fn new(
        sender: Sender<Message>,
        client: ClientState,
        worker: Worker,
        outcomes: Receiver<Outcome>,
        tsgo: Option<TsgoRuntime>,
        initialize_params: serde_json::Value,
    ) -> Self {
        let (preprocess_event_sender, preprocess_events) = unbounded();
        let settings = if client.pull_configuration {
            Settings::default()
        } else {
            Settings::from_sections(
                initialize_params
                    .pointer("/initializationOptions/configuration/rsvelte")
                    .unwrap_or(&serde_json::Value::Null),
                initialize_params
                    .pointer("/initializationOptions/configuration/svelte")
                    .unwrap_or(&serde_json::Value::Null),
            )
        };
        Self {
            sender,
            client,
            settings,
            js_ts_settings: serde_json::Value::Null,
            typescript_settings: serde_json::Value::Null,
            javascript_settings: serde_json::Value::Null,
            editor_settings: serde_json::Value::Null,
            documents: DocumentStore::default(),
            worker,
            outcomes,
            scheduled: HashMap::new(),
            linted: HashMap::new(),
            pending: HashMap::new(),
            pending_tsgo: HashMap::new(),
            completion_data: HashMap::new(),
            completion_order: Vec::new(),
            rename_aggregates: HashMap::new(),
            component_queries: HashMap::new(),
            component_query_requests: HashMap::new(),
            outgoing: HashMap::new(),
            next_request_id: 0,
            tsgo,
            preprocess: None,
            preprocess_events,
            preprocess_event_sender,
            preprocess_failures: HashMap::new(),
            preprocess_documents: HashMap::new(),
            preprocess_dependencies: HashMap::new(),
            watched_preprocess_directories: HashSet::new(),
            initialize_params,
            shutdown_requested: false,
            exiting: false,
        }
    }

    fn run(&mut self, connection: &Connection) -> Result<ExitCode> {
        if self.client.pull_configuration {
            self.request_configuration();
        } else {
            self.ensure_preprocess_runtime();
        }
        if self.client.dynamic_watched_files {
            self.register_watched_files();
        }
        // Cloned out of `self` so the handlers below can still borrow it.
        let outcomes = self.outcomes.clone();
        let preprocess_events = self.preprocess_events.clone();
        let tsgo_events = self
            .tsgo
            .as_ref()
            .map(|runtime| runtime.client.events().clone())
            .unwrap_or_else(never);

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
                recv(tsgo_events) -> event => match event {
                    Ok(event) => self.on_tsgo_event(event),
                    Err(_) => self.tsgo = None,
                },
                recv(preprocess_events) -> event => match event {
                    Ok(event) => self.on_preprocess_event(event),
                    Err(_) => self.preprocess = None,
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
            "textDocument/codeLens" => self.on_code_lens(request),
            "workspace/executeCommand" => self.on_execute_command(request),
            "textDocument/foldingRange" => self.on_folding_range(request),
            "textDocument/selectionRange" => self.on_selection_range(request),
            "textDocument/documentSymbol" => self.on_document_symbol(request),
            "textDocument/linkedEditingRange" => self.on_linked_editing_range(request),
            "textDocument/documentHighlight" => self.on_document_highlight(request),
            "html/tag" => self.on_tag_close(request),
            "textDocument/documentColor" => self.on_document_color(request),
            "textDocument/colorPresentation" => self.on_color_presentation(request),
            "textDocument/diagnostic" => self.on_document_diagnostic(request),
            "completionItem/resolve"
            | "textDocument/definition"
            | "textDocument/typeDefinition"
            | "textDocument/implementation"
            | "textDocument/references"
            | "textDocument/signatureHelp"
            | "textDocument/inlayHint"
            | "textDocument/semanticTokens/full"
            | "textDocument/semanticTokens/range"
            | "textDocument/prepareCallHierarchy"
            | "callHierarchy/incomingCalls"
            | "callHierarchy/outgoingCalls"
            | "workspace/symbol"
            | "workspaceSymbol/resolve" => self.forward_tsgo_request(request),
            "textDocument/prepareRename" => self.on_prepare_rename(request),
            "textDocument/rename" => self.on_rename(request),
            "$/getFileReferences" => self.on_get_file_references(request),
            "$/getComponentReferences" => self.on_get_component_references(request),
            "$/getEditsForFileRename" => self.on_get_edits_for_file_rename(request),
            "$/getCompiledCode" => self.on_get_compiled_code(request),
            "codeLens/resolve" => self.on_resolve_code_lens(request),
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
            config: self.settings.format_config.clone(),
        };
        self.pending.insert(id, Pending::Formatting);
        self.worker.submit(job);
    }

    fn on_get_compiled_code(&mut self, request: Request) {
        let id = request.id;
        let Some(uri) = custom_request_uri(&request.params) else {
            self.respond_nothing(id);
            return;
        };
        let Some(document) = self.component_document(&uri) else {
            self.respond_nothing(id);
            return;
        };
        let path = uri_to_path(uri.as_str());
        let canonical = fs::canonicalize(&path).unwrap_or_else(|_| path.clone());
        let processed = self
            .preprocess_documents
            .get(&canonical)
            .filter(|processed| processed.version == document.version);
        let (text, sourcemap) = processed.map_or_else(
            || (document.shared_text(), None),
            |processed| {
                (
                    Arc::clone(&processed.text),
                    processed.map.as_ref().map(Arc::clone),
                )
            },
        );
        self.pending.insert(id.clone(), Pending::CompiledCode);
        self.worker.submit(Job::Compile {
            id,
            path,
            text,
            sourcemap,
        });
    }

    fn on_document_diagnostic(&mut self, request: Request) {
        let tsgo_fallback = request.clone();
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
            self.forward_tsgo_request(tsgo_fallback);
            return;
        };
        if !self.settings.lint_enable || !is_lint_target(document) {
            self.forward_tsgo_request(tsgo_fallback);
            return;
        }
        self.pending
            .insert(id.clone(), Pending::DocumentDiagnostic { tsgo_fallback });
        self.worker.submit(Job::PullDiagnostics {
            id,
            path: uri_to_path(uri.as_str()),
            text: document.shared_text(),
            preprocessed: self.preprocessed_analysis(&uri_to_path(uri.as_str()), document.version),
            warnings: self.settings.compiler_warnings.clone(),
            svelte_diagnostics: self.settings.svelte.enable && self.settings.svelte.diagnostics,
            css_diagnostics: self.settings.css.enable && self.settings.css.diagnostics,
        });
    }

    fn on_completion(&mut self, request: Request) {
        let tsgo_fallback = request.clone();
        let id = request.id;
        let params = match serde_json::from_value::<CompletionParams>(request.params) {
            Ok(params) => params.text_document_position,
            Err(err) => {
                log::warn(format_args!("textDocument/completion: {err}"));
                self.respond(Response::new_ok(id, empty_completion_list()));
                return;
            }
        };
        // `rsvelte.completion.enable` has no upstream counterpart, so
        // `PluginHost.ts:298` — which is about every plugin declining — does not
        // govern a server the user configured not to answer at all.
        if !self.settings.completion_enable {
            self.respond_nothing(id);
            return;
        }
        if !self.settings.native_completion_enabled() {
            self.forward_tsgo_request(tsgo_fallback);
            return;
        }
        match self.locate(&params) {
            Some((path, text, offset)) => {
                self.pending
                    .insert(id.clone(), Pending::Completion { tsgo_fallback });
                self.worker.submit(Job::Complete {
                    id,
                    path,
                    text,
                    offset,
                    strict_mode: self.settings.format_config.strict_mode.unwrap_or(false),
                    markdown_documentation: self.client.markdown_documentation,
                });
            }
            None => self.forward_tsgo_request(tsgo_fallback),
        }
    }

    fn on_hover(&mut self, request: Request) {
        let tsgo_fallback = request.clone();
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
        if !self.settings.native_hover_enabled() {
            self.forward_tsgo_request(tsgo_fallback);
            return;
        }
        match self.locate(&params) {
            Some((path, text, offset)) => {
                self.pending
                    .insert(id.clone(), Pending::Hover { tsgo_fallback });
                self.worker.submit(Job::Hover {
                    id,
                    path,
                    text,
                    offset,
                    markdown_hover: self.client.markdown_hover,
                });
            }
            None => self.forward_tsgo_request(tsgo_fallback),
        }
    }

    fn on_prepare_rename(&mut self, request: Request) {
        let Ok(params) =
            serde_json::from_value::<TextDocumentPositionParams>(request.params.clone())
        else {
            self.respond_nothing(request.id);
            return;
        };
        let path = uri_to_path(params.text_document.uri.as_str());
        if !is_svelte_document("", &path) {
            self.forward_tsgo_request(request);
            return;
        }
        let Some(plan) = self.svelte_rename_plan(&params) else {
            self.respond_nothing(request.id);
            return;
        };
        self.forward_rename_request(request.id, "textDocument/prepareRename", &plan, None);
    }

    fn on_rename(&mut self, request: Request) {
        let Ok(params) = serde_json::from_value::<RenameParams>(request.params.clone()) else {
            self.respond_nothing(request.id);
            return;
        };
        let position = params.text_document_position.clone();
        let path = uri_to_path(position.text_document.uri.as_str());
        if !is_svelte_document("", &path) {
            self.forward_tsgo_request(request);
            return;
        }
        let Some(plan) = self.svelte_rename_plan(&position) else {
            self.respond_nothing(request.id);
            return;
        };
        self.forward_rename_request(
            request.id,
            "textDocument/rename",
            &plan,
            Some(params.new_name),
        );
    }

    fn svelte_rename_plan(&self, params: &TextDocumentPositionParams) -> Option<PrepareRenamePlan> {
        let runtime = self.tsgo.as_ref()?;
        let source_path = uri_to_path(params.text_document.uri.as_str());
        let canonical_source =
            fs::canonicalize(&source_path).unwrap_or_else(|_| source_path.clone());
        let source = self.documents.get(&params.text_document.uri)?.text();
        let overlay = runtime
            .overlays
            .iter()
            .filter(|overlay| canonical_source.starts_with(overlay.workspace()))
            .max_by_key(|overlay| overlay.workspace().components().count())?;
        let shadow = overlay.shadow_for_source(&source_path)?;
        let document = RenameDocument {
            source_uri: &shadow.source_uri,
            shadow_uri: &shadow.shadow_uri,
            source_text: source,
            generated_text: &shadow.text,
            projection_map: overlay.projection_map(&source_path)?,
            source_map: overlay.source_map(&source_path),
            parser_error: document_has_parser_error(source),
        };
        Some(prepare_rename_plan(document, params.position))
    }

    fn forward_rename_request(
        &mut self,
        id: RequestId,
        method: &str,
        plan: &PrepareRenamePlan,
        new_name: Option<String>,
    ) {
        let Some((uri, position, _)) = plan.request() else {
            self.respond_nothing(id);
            return;
        };
        let Some(runtime) = &self.tsgo else {
            self.respond_nothing(id);
            return;
        };
        let mut params = serde_json::json!({
            "textDocument": { "uri": uri },
            "position": position,
        });
        if let Some(name) = &new_name {
            params["newName"] = serde_json::Value::String(name.clone());
        }
        let rename = match new_name {
            Some(new_name) => PendingRename::Primary {
                plan: plan.clone(),
                new_name,
            },
            None => PendingRename::Prepare(plan.clone()),
        };
        let pending = PendingTsgoRequest {
            method: method.to_string(),
            document: None,
            fallback_result: None,
            completion_site: None,
            rename: Some(rename),
            code_action_diagnostic_codes: Vec::new(),
            push_diagnostics: None,
            component_site: None,
            component_references: None,
            file_rename: None,
            code_lens_resolve: None,
            completion_site_data: None,
        };
        let child = Request::new(id.clone(), method.to_string(), params);
        if let Err(error) = runtime.client.forward(child.into()) {
            log::warn(format_args!("could not forward rename to tsgo: {error}"));
            self.respond_nothing(id);
            return;
        }
        self.pending_tsgo.insert(id, pending);
    }

    fn on_get_file_references(&mut self, request: Request) {
        let Some(uri) = custom_request_uri(&request.params) else {
            self.respond(Response::new_ok(
                request.id,
                Vec::<lsp_types::Location>::new(),
            ));
            return;
        };
        let roots = self
            .tsgo
            .as_ref()
            .map(|runtime| {
                runtime
                    .overlays
                    .iter()
                    .map(|overlay| overlay.workspace().to_path_buf())
                    .collect()
            })
            .unwrap_or_default();
        let open_documents = self
            .documents
            .iter()
            .map(|document| {
                let path = uri_to_path(document.uri.as_str());
                FileReferenceSource {
                    path: fs::canonicalize(&path).unwrap_or(path),
                    uri: document.uri.clone(),
                    text: document.text().to_string(),
                }
            })
            .collect();
        let id = request.id;
        self.pending.insert(id.clone(), Pending::FileReferences);
        self.worker.submit(Job::FileReferences {
            id,
            target: uri_to_path(uri.as_str()),
            roots,
            open_documents,
        });
    }

    fn on_get_component_references(&mut self, request: Request) {
        let Some(source_uri) = custom_request_uri(&request.params) else {
            self.respond(Response::new_ok(
                request.id,
                Vec::<lsp_types::Location>::new(),
            ));
            return;
        };
        let source_path = uri_to_path(source_uri.as_str());
        let Some(runtime) = &self.tsgo else {
            self.respond(Response::new_ok(
                request.id,
                Vec::<lsp_types::Location>::new(),
            ));
            return;
        };
        let Some(shadow) = runtime
            .overlays
            .iter()
            .find_map(|overlay| overlay.shadow_for_source(&source_path))
        else {
            self.respond(Response::new_ok(
                request.id,
                Vec::<lsp_types::Location>::new(),
            ));
            return;
        };
        let Some(position) = component_probe_position(&shadow.text) else {
            self.respond(Response::new_ok(
                request.id,
                Vec::<lsp_types::Location>::new(),
            ));
            return;
        };
        let mapper = TsgoResponseMapper::for_overlays(&runtime.overlays);
        let document = mapper.document_context(&source_uri);
        let child = Request::new(
            request.id.clone(),
            "textDocument/references".to_string(),
            serde_json::json!({
                "textDocument": { "uri": shadow.shadow_uri },
                "position": position,
                "context": { "includeDeclaration": false },
            }),
        );
        let pending = PendingTsgoRequest {
            method: "textDocument/references".to_string(),
            document,
            fallback_result: None,
            completion_site: None,
            rename: None,
            code_action_diagnostic_codes: Vec::new(),
            push_diagnostics: None,
            component_site: None,
            component_references: Some(source_uri),
            file_rename: None,
            code_lens_resolve: None,
            completion_site_data: None,
        };
        if runtime.client.forward(child.into()).is_ok() {
            self.pending_tsgo.insert(request.id, pending);
        } else {
            self.respond(Response::new_ok(
                request.id,
                Vec::<lsp_types::Location>::new(),
            ));
        }
    }

    fn on_get_edits_for_file_rename(&mut self, request: Request) {
        if !self.settings.svelte.enable || !self.settings.svelte.rename {
            self.respond_nothing(request.id);
            return;
        }
        let Some(old_uri) = request
            .params
            .get("oldUri")
            .and_then(serde_json::Value::as_str)
            .and_then(|uri| uri.parse::<Uri>().ok())
        else {
            self.respond_nothing(request.id);
            return;
        };
        let Some(new_uri) = request
            .params
            .get("newUri")
            .and_then(serde_json::Value::as_str)
            .and_then(|uri| uri.parse::<Uri>().ok())
        else {
            self.respond_nothing(request.id);
            return;
        };
        let Some(runtime) = &self.tsgo else {
            self.respond_nothing(request.id);
            return;
        };
        let old_path = uri_to_path(old_uri.as_str());
        let new_path = uri_to_path(new_uri.as_str());
        let Some((old_shadow, new_shadow)) = runtime.overlays.iter().find_map(|overlay| {
            let old_shadow = overlay.shadow_for_source(&old_path)?.shadow_uri.clone();
            let new_shadow = overlay.prospective_shadow_uri(&new_path).ok()?;
            Some((old_shadow, new_shadow))
        }) else {
            self.forward_tsgo_request(Request::new(
                request.id,
                "workspace/willRenameFiles".to_string(),
                serde_json::json!({
                    "files": [{ "oldUri": old_uri, "newUri": new_uri }]
                }),
            ));
            return;
        };
        let mapping = WillRenameMapping {
            old: ShadowUriPair {
                source_uri: &old_uri,
                shadow_uri: &old_shadow,
            },
            new: ShadowUriPair {
                source_uri: &new_uri,
                shadow_uri: &new_shadow,
            },
        };
        let mut params = serde_json::json!({
            "files": [{ "oldUri": old_uri, "newUri": new_uri }]
        });
        rewrite_will_rename_params(&mut params, &[mapping]);
        let child = Request::new(
            request.id.clone(),
            "workspace/willRenameFiles".to_string(),
            params,
        );
        let pending = PendingTsgoRequest {
            method: "workspace/willRenameFiles".to_string(),
            document: None,
            fallback_result: None,
            completion_site: None,
            rename: None,
            code_action_diagnostic_codes: Vec::new(),
            push_diagnostics: None,
            component_site: None,
            component_references: None,
            file_rename: Some(PendingFileRename {
                old_source: old_uri,
                old_shadow,
                new_source: new_uri,
                new_shadow,
            }),
            code_lens_resolve: None,
            completion_site_data: None,
        };
        if runtime.client.forward(child.into()).is_ok() {
            self.pending_tsgo.insert(request.id, pending);
        } else {
            self.respond_nothing(request.id);
        }
    }

    fn on_linked_editing_range(&mut self, request: Request) {
        let id = request.id;
        if !self.settings.html.enable || !self.settings.html.linked_editing {
            self.respond_nothing(id);
            return;
        }
        let params = match serde_json::from_value::<LinkedEditingRangeParams>(request.params) {
            Ok(params) => params.text_document_position_params,
            Err(err) => {
                log::warn(format_args!("textDocument/linkedEditingRange: {err}"));
                self.respond_nothing(id);
                return;
            }
        };
        let Some((_, text, offset)) = self.locate(&params) else {
            self.respond_nothing(id);
            return;
        };
        self.respond(Response::new_ok(
            id,
            crate::html_tags::linked_ranges(text.as_str(), offset),
        ));
    }

    fn on_document_highlight(&mut self, request: Request) {
        let tsgo_fallback = request.clone();
        let id = request.id;
        if !self.settings.svelte.enable || !self.settings.svelte.document_highlight {
            self.respond(Response::new_ok(
                id,
                Vec::<lsp_types::DocumentHighlight>::new(),
            ));
            return;
        }
        let params = match serde_json::from_value::<DocumentHighlightParams>(request.params) {
            Ok(params) => params.text_document_position_params,
            Err(err) => {
                log::warn(format_args!("textDocument/documentHighlight: {err}"));
                self.respond(Response::new_ok(
                    id,
                    Vec::<lsp_types::DocumentHighlight>::new(),
                ));
                return;
            }
        };
        let highlights = self
            .locate(&params)
            .map_or_else(Vec::new, |(_, text, offset)| {
                crate::html_tags::highlights(text.as_str(), offset)
            });
        if highlights.is_empty() {
            self.forward_tsgo_request(tsgo_fallback);
        } else {
            self.respond(Response::new_ok(id, highlights));
        }
    }

    fn on_tag_close(&mut self, request: Request) {
        let id = request.id;
        if !self.settings.html.enable || !self.settings.html.tag_complete {
            self.respond_nothing(id);
            return;
        }
        let Ok(params) = serde_json::from_value::<TextDocumentPositionParams>(request.params)
        else {
            self.respond_nothing(id);
            return;
        };
        let completion = self
            .locate(&params)
            .and_then(|(_, text, offset)| crate::html_tags::close_tag(&text, offset));
        self.respond(Response::new_ok(id, completion));
    }

    fn on_document_color(&mut self, request: Request) {
        let id = request.id;
        if !self.settings.css.enable || !self.settings.css.document_colors {
            self.respond(Response::new_ok(
                id,
                Vec::<lsp_types::ColorInformation>::new(),
            ));
            return;
        }
        let Ok(params) = serde_json::from_value::<DocumentColorParams>(request.params) else {
            self.respond(Response::new_ok(
                id,
                Vec::<lsp_types::ColorInformation>::new(),
            ));
            return;
        };
        let colors = self
            .documents
            .get(&params.text_document.uri)
            .map_or_else(Vec::new, |document| crate::css::colors(document.text()));
        self.respond(Response::new_ok(id, colors));
    }

    fn on_color_presentation(&mut self, request: Request) {
        let id = request.id;
        if !self.settings.css.enable || !self.settings.css.color_presentations {
            self.respond(Response::new_ok(
                id,
                Vec::<lsp_types::ColorPresentation>::new(),
            ));
            return;
        }
        let Ok(params) = serde_json::from_value::<ColorPresentationParams>(request.params) else {
            self.respond(Response::new_ok(
                id,
                Vec::<lsp_types::ColorPresentation>::new(),
            ));
            return;
        };
        self.respond(Response::new_ok(
            id,
            crate::css::color_presentations(params.color),
        ));
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
        let tsgo_fallback = request.clone();
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
        let Some(document) = self.component_document(&uri) else {
            self.forward_tsgo_request(tsgo_fallback);
            return;
        };
        if !self.settings.svelte.enable || !self.settings.svelte.code_actions {
            self.forward_tsgo_request(tsgo_fallback);
            return;
        }
        let only = params.context.only.as_ref();
        let job = Job::CodeAction {
            id: id.clone(),
            path: uri_to_path(uri.as_str()),
            text: document.shared_text(),
            uri,
            diagnostics: params.context.diagnostics,
            quickfix: only.is_none_or(|kinds| kinds.contains(&CodeActionKind::QUICKFIX)),
            suggestions: only.is_none_or(|kinds| kinds.contains(&CodeActionKind::REFACTOR_REWRITE)),
            fix_all: only.is_none_or(|kinds| {
                kinds.contains(&CodeActionKind::from(crate::code_actions::FIX_ALL_KIND))
            }),
        };
        self.pending
            .insert(id, Pending::CodeAction { tsgo_fallback });
        self.worker.submit(job);
    }

    fn on_code_lens(&mut self, request: Request) {
        let tsgo_fallback = request.clone();
        let id = request.id;
        let Ok(params) = serde_json::from_value::<CodeLensParams>(request.params) else {
            return self.respond_no_lenses(id);
        };
        if !self.settings.runes_legacy_mode_code_lens_enable {
            return self.forward_tsgo_request(tsgo_fallback);
        }
        let Some((path, text)) = self.component(&params.text_document.uri) else {
            return self.forward_tsgo_request(tsgo_fallback);
        };
        self.pending
            .insert(id.clone(), Pending::CodeLens { tsgo_fallback });
        self.worker.submit(Job::CodeLens { id, path, text });
    }

    fn on_resolve_code_lens(&mut self, request: Request) {
        let id = request.id;
        let lens = request.params;
        let Some(kind) = code_lens_kind(&lens) else {
            self.respond(Response::new_ok(id, lens));
            return;
        };
        let Some(source_uri) = lens
            .pointer("/data/uri")
            .and_then(serde_json::Value::as_str)
            .and_then(|uri| uri.parse::<Uri>().ok())
        else {
            self.respond(Response::new_ok(id, lens));
            return;
        };
        let Some(runtime) = &self.tsgo else {
            self.respond(Response::new_ok(id, lens));
            return;
        };
        let source_path = uri_to_path(source_uri.as_str());
        let component_lens = kind == CodeLensKind::Reference
            && source_path
                .extension()
                .is_some_and(|extension| extension == "svelte")
            && lens
                .pointer("/range/start/line")
                .and_then(serde_json::Value::as_u64)
                == Some(0)
            && lens
                .pointer("/range/start/character")
                .and_then(serde_json::Value::as_u64)
                == Some(0)
            && lens
                .pointer("/range/end/line")
                .and_then(serde_json::Value::as_u64)
                == Some(0)
            && lens
                .pointer("/range/end/character")
                .and_then(serde_json::Value::as_u64)
                == Some(1);
        let method = match kind {
            CodeLensKind::Reference => "textDocument/references",
            CodeLensKind::Implementation => "textDocument/implementation",
        };
        let mapper = TsgoResponseMapper::for_overlays(&runtime.overlays);
        let document = mapper.document_context(&source_uri);
        let mut params = serde_json::json!({
            "textDocument": { "uri": source_uri },
            "position": lens.pointer("/range/start").cloned().unwrap_or_default(),
        });
        if kind == CodeLensKind::Reference {
            params["context"] = serde_json::json!({ "includeDeclaration": false });
        }
        if component_lens {
            let Some(shadow) = runtime
                .overlays
                .iter()
                .find_map(|overlay| overlay.shadow_for_source(&source_path))
            else {
                self.respond(Response::new_ok(id, lens));
                return;
            };
            let Some(position) = component_probe_position(&shadow.text) else {
                self.respond(Response::new_ok(id, lens));
                return;
            };
            params["textDocument"]["uri"] =
                serde_json::Value::String(shadow.shadow_uri.as_str().to_string());
            params["position"] = serde_json::to_value(position).unwrap_or_default();
        } else {
            let mapper = TsgoResponseMapper::for_overlays_with_default_document(
                &runtime.overlays,
                document.clone(),
            );
            if !mapper.map_request(method, &mut params) {
                self.respond(Response::new_ok(id, lens));
                return;
            }
        }
        let child = Request::new(id.clone(), method.to_string(), params);
        let pending = PendingTsgoRequest {
            method: method.to_string(),
            document,
            fallback_result: None,
            completion_site: None,
            rename: None,
            code_action_diagnostic_codes: Vec::new(),
            push_diagnostics: None,
            component_site: None,
            component_references: component_lens.then(|| source_uri.clone()),
            file_rename: None,
            code_lens_resolve: Some(PendingCodeLensResolve {
                lens,
                kind,
                source_uri,
            }),
            completion_site_data: None,
        };
        if runtime.client.forward(child.into()).is_ok() {
            self.pending_tsgo.insert(id, pending);
        } else if let Some(resolve) = pending.code_lens_resolve {
            self.respond(Response::new_ok(id, resolve.lens));
        }
    }

    fn on_execute_command(&mut self, request: Request) {
        let id = request.id;
        let Ok(params) = serde_json::from_value::<ExecuteCommandParams>(request.params) else {
            return self.respond_nothing(id);
        };
        if params.command != crate::extract::COMMAND {
            return self.respond_nothing(id);
        }
        if !self.settings.svelte.enable || !self.settings.svelte.code_actions {
            return self.respond_nothing(id);
        }
        let Some(args) = params.arguments.into_iter().nth(1) else {
            return self.respond_nothing(id);
        };
        let Some(uri) = args
            .get("uri")
            .and_then(serde_json::Value::as_str)
            .and_then(|uri| uri.parse::<Uri>().ok())
        else {
            return self.respond_nothing(id);
        };
        let Some(document) = self.component_document(&uri) else {
            return self.respond_nothing(id);
        };
        let text = document.shared_text();
        let Some(range) = args
            .get("range")
            .cloned()
            .and_then(|value| serde_json::from_value(value).ok())
        else {
            return self.respond_nothing(id);
        };
        let file_path = args
            .get("filePath")
            .and_then(serde_json::Value::as_str)
            .unwrap_or_default()
            .to_string();
        self.pending.insert(id.clone(), Pending::ExtractComponent);
        self.worker.submit(Job::ExtractComponent {
            id,
            uri,
            text,
            range,
            file_path,
        });
    }

    fn on_folding_range(&mut self, request: Request) {
        let tsgo_fallback = request.clone();
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
                self.pending
                    .insert(id.clone(), Pending::FoldingRange { tsgo_fallback });
                self.worker.submit(Job::FoldingRange {
                    id,
                    path,
                    text,
                    line_folding_only: self.client.line_folding_only,
                });
            }
            None => self.forward_tsgo_request(tsgo_fallback),
        }
    }

    fn on_selection_range(&mut self, request: Request) {
        let tsgo_fallback = request.clone();
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
        if !(self.settings.svelte.enable && self.settings.svelte.selection_range
            || self.settings.css.enable && self.settings.css.selection_range)
        {
            self.forward_tsgo_request(tsgo_fallback);
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
        let tsgo_fallback = request.clone();
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
        if !(self.settings.html.enable && self.settings.html.document_symbols
            || self.settings.css.enable && self.settings.css.document_symbols)
        {
            self.forward_tsgo_request(tsgo_fallback);
            return;
        }
        let uri = params.text_document.uri;
        match self.component(&uri) {
            Some((path, text)) => {
                self.pending
                    .insert(id.clone(), Pending::DocumentSymbol { tsgo_fallback });
                self.worker.submit(Job::DocumentSymbol {
                    id,
                    uri,
                    path,
                    text,
                    hierarchical: self.client.hierarchical_document_symbols,
                });
            }
            None => self.forward_tsgo_request(tsgo_fallback),
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
                let child_notification = notification.clone();
                match serde_json::from_value::<DidChangeWorkspaceFoldersParams>(notification.params)
                {
                    Ok(params) => {
                        self.update_tsgo_workspace_folders(
                            &params.event.added,
                            &params.event.removed,
                        );
                        self.client
                            .update_workspace_folders(params.event.added, &params.event.removed);
                        self.ensure_tsgo_runtime();
                        self.restart_preprocessing();
                        if let Some(runtime) = &self.tsgo {
                            let workspace_folders = self.client.workspace_folders.clone();
                            let root_uri = workspace_folders
                                .is_empty()
                                .then(|| self.client.root_uri.clone())
                                .flatten();
                            let current_dir = self
                                .client
                                .workspace_folders
                                .first()
                                .map(|folder| uri_to_path(folder.uri.as_str()))
                                .or_else(|| {
                                    self.client
                                        .root_uri
                                        .as_ref()
                                        .map(|root| uri_to_path(root.as_str()))
                                })
                                .filter(|path| path.is_dir());
                            let _ = runtime.client.update_workspace(
                                root_uri,
                                workspace_folders,
                                current_dir,
                            );
                            let _ = runtime.client.forward(child_notification.into());
                        }
                    }
                    Err(err) => log::warn(format_args!("{method}: {err}")),
                }
            }
            "workspace/didChangeWatchedFiles" => {
                let child_notification = notification.clone();
                match serde_json::from_value::<DidChangeWatchedFilesParams>(notification.params) {
                    Ok(params) => {
                        let project_changed = params
                            .changes
                            .iter()
                            .any(|change| is_project_config(&change.uri));
                        let dependency_changed = params.changes.iter().any(|change| {
                            let path = uri_to_path(change.uri.as_str());
                            let path = fs::canonicalize(&path).unwrap_or(path);
                            self.preprocess_dependencies
                                .values()
                                .any(|dependencies| dependencies.contains(&path))
                        });
                        if project_changed || dependency_changed {
                            self.invalidate_project_config();
                            self.rebuild_tsgo_overlays();
                            self.restart_preprocessing();
                        } else {
                            self.refresh_tsgo_overlays();
                        }
                        if let Some(runtime) = &self.tsgo {
                            let _ = runtime.client.forward(child_notification.into());
                        }
                    }
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
                        self.sync_tsgo_document(&key);
                        let preprocessing = self.queue_preprocess_document(&key);
                        if !self.client.pull_diagnostics && !preprocessing {
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
                        let mut changed = false;
                        if let Some(document) = self.documents.get_mut(&params.text_document.uri) {
                            document.apply(params.text_document.version, &params.content_changes);
                            changed = true;
                        }
                        self.sync_tsgo_document(&key);
                        let preprocessing = self.queue_preprocess_document(&key);
                        if changed && !self.client.pull_diagnostics && !preprocessing {
                            self.schedule_lint(key, LINT_DEBOUNCE);
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
                        self.close_tsgo_document(&uri);
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
                self.invalidate_project_config();
                if self.client.pull_configuration {
                    self.request_configuration();
                } else {
                    let preprocessing_was_enabled = self.settings.preprocess_enable;
                    let settings = notification.params.get("settings");
                    self.settings = Settings::from_sections(
                        settings
                            .and_then(|settings| settings.get("rsvelte"))
                            .unwrap_or(&serde_json::Value::Null),
                        settings
                            .and_then(|settings| settings.get("svelte"))
                            .unwrap_or(&serde_json::Value::Null),
                    );
                    if preprocessing_was_enabled && !self.settings.preprocess_enable {
                        self.preprocess = None;
                        self.preprocess_failures.clear();
                        self.preprocess_documents.clear();
                        self.preprocess_dependencies.clear();
                        self.rebuild_tsgo_overlays();
                    } else {
                        self.ensure_preprocess_runtime();
                    }
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
        let native = self.pending.remove(&id).is_some();
        let tsgo = self.pending_tsgo.remove(&id).is_some();
        let rename = self.rename_aggregates.remove(&id).is_some();
        let component = self.component_queries.remove(&id);
        let child_component_ids = self
            .component_query_requests
            .iter()
            .filter(|(_, (editor_id, _))| editor_id == &id)
            .map(|(child_id, _)| child_id.clone())
            .collect::<Vec<_>>();
        for child_id in child_component_ids {
            self.component_query_requests.remove(&child_id);
            if let Some(runtime) = &self.tsgo {
                let _ = runtime.client.forward(
                    Notification::new(
                        "$/cancelRequest".to_string(),
                        serde_json::json!({ "id": child_id }),
                    )
                    .into(),
                );
            }
        }
        if let Some(component) = &component
            && let Some(runtime) = &self.tsgo
        {
            let _ = runtime
                .client
                .close_buffer(component.query.query_uri().clone());
        }
        let child_rename_ids = self
            .pending_tsgo
            .iter()
            .filter_map(|(child_id, pending)| match &pending.rename {
                Some(PendingRename::Followup { editor_id }) if editor_id == &id => {
                    Some(child_id.clone())
                }
                _ => None,
            })
            .collect::<Vec<_>>();
        for child_id in child_rename_ids {
            self.pending_tsgo.remove(&child_id);
            if let Some(runtime) = &self.tsgo {
                let _ = runtime.client.forward(
                    Notification::new(
                        "$/cancelRequest".to_string(),
                        serde_json::json!({ "id": child_id }),
                    )
                    .into(),
                );
            }
        }
        if tsgo && let Some(runtime) = &self.tsgo {
            let _ = runtime.client.forward(
                Notification::new(
                    "$/cancelRequest".to_string(),
                    serde_json::json!({ "id": id }),
                )
                .into(),
            );
        }
        if native || tsgo || rename || component.is_some() {
            self.respond(Response::new_err(
                id,
                ErrorCode::RequestCanceled as i32,
                "request cancelled by client".to_string(),
            ));
        }
    }

    fn forward_tsgo_request(&mut self, request: Request) {
        self.forward_tsgo_request_with_fallback(request, None);
    }

    fn forward_tsgo_request_with_fallback(
        &mut self,
        mut request: Request,
        fallback_result: Option<serde_json::Value>,
    ) {
        if !self.settings.tsgo_method_enabled(&request.method) {
            self.respond(Response::new_ok(
                request.id,
                fallback_result.unwrap_or_else(|| tsgo_unmapped_result(&request.method)),
            ));
            return;
        }
        let Ok(completion_site_data) = self.completion_data_site(&mut request) else {
            // Without tsgo's payload the child rejects the request outright; the
            // unresolved item is still a valid response to the editor.
            self.respond(Response::new_ok(request.id, request.params));
            return;
        };
        let completion_site = self.completion_site(&request);
        if completion_site == Some(CompletionSite::BlockMarker)
            && fallback_result.is_none()
            && self.is_opening_block_completion(&request)
        {
            // An unfinished unknown `{#...` now makes the compiler reject the
            // projection. Preserve the pre-diagnostic completion response when
            // the native provider also has nothing to offer.
            self.respond(Response::new_ok(request.id, empty_completion_list()));
            return;
        }
        let component_site = self.component_completion_site(&request);
        let code_action_diagnostic_codes = code_action_diagnostic_codes(&request);
        let Some(runtime) = &self.tsgo else {
            self.respond(Response::new_ok(
                request.id,
                fallback_result.unwrap_or_else(|| tsgo_unmapped_result(&request.method)),
            ));
            return;
        };
        let initial = TsgoResponseMapper::for_overlays_request(&runtime.overlays, &request.params);
        let document = initial
            .default_document()
            .cloned()
            .or_else(|| runtime.completion_document_context(&request.params));
        let mapper = TsgoResponseMapper::for_overlays_with_default_document(
            &runtime.overlays,
            document.clone(),
        );
        if !mapper.map_request(&request.method, &mut request.params) {
            self.respond(Response::new_ok(
                request.id,
                fallback_result.unwrap_or_else(|| tsgo_unmapped_result(&request.method)),
            ));
            return;
        }
        let pending = PendingTsgoRequest {
            method: request.method.clone(),
            document,
            fallback_result,
            completion_site,
            rename: None,
            code_action_diagnostic_codes,
            push_diagnostics: None,
            component_site,
            component_references: None,
            file_rename: None,
            code_lens_resolve: None,
            completion_site_data,
        };
        let id = request.id.clone();
        if let Err(error) = runtime.client.forward(request.into()) {
            log::warn(format_args!("could not forward request to tsgo: {error}"));
            self.respond(Response::new_ok(
                id,
                pending
                    .fallback_result
                    .unwrap_or_else(|| tsgo_unmapped_result(&pending.method)),
            ));
            return;
        }
        self.pending_tsgo.insert(id, pending);
    }

    fn pull_and_publish_tsgo_diagnostics(
        &mut self,
        uri: Uri,
        version: i32,
        native: Vec<lsp_types::Diagnostic>,
    ) {
        if !self.settings.tsgo_method_enabled("textDocument/diagnostic") {
            self.publish(uri, version, native);
            return;
        }
        let native_fallback = native.clone();
        let fallback = serde_json::to_value(diagnostic_report(native)).ok();
        let Some(runtime) = &self.tsgo else {
            self.publish(uri, version, native_fallback);
            return;
        };
        let mut params = serde_json::json!({ "textDocument": { "uri": uri } });
        let mapper = TsgoResponseMapper::for_overlays_request(&runtime.overlays, &params);
        let document = mapper.default_document().cloned();
        if !mapper.map_request("textDocument/diagnostic", &mut params) {
            self.publish(uri, version, native_fallback);
            return;
        }
        self.next_request_id += 1;
        let id = RequestId::from(format!(
            "rsvelte-tsgo-push-diagnostics-{}",
            self.next_request_id
        ));
        let request = Request::new(id.clone(), "textDocument/diagnostic".to_string(), params);
        let pending = PendingTsgoRequest {
            method: "textDocument/diagnostic".to_string(),
            document,
            fallback_result: fallback,
            completion_site: None,
            rename: None,
            code_action_diagnostic_codes: Vec::new(),
            push_diagnostics: Some((uri.clone(), version)),
            component_site: None,
            component_references: None,
            file_rename: None,
            code_lens_resolve: None,
            completion_site_data: None,
        };
        if runtime.client.forward(request.into()).is_ok() {
            self.pending_tsgo.insert(id, pending);
        } else {
            self.publish(uri, version, native_fallback);
        }
    }

    /// The source site a completion request is for. On a resolve, the item the
    /// editor sends back carries upstream's payload, so tsgo's own `data` has
    /// to go back on it first — everything downstream reads `data.fileName`.
    /// `Err` means the payload is unrecoverable and the child must not be asked.
    fn completion_data_site(
        &mut self,
        request: &mut Request,
    ) -> Result<Option<(String, serde_json::Value)>, ()> {
        match request.method.as_str() {
            "textDocument/completion" => Ok(request
                .params
                .pointer("/textDocument/uri")
                .and_then(serde_json::Value::as_str)
                .map(str::to_string)
                .zip(request.params.get("position").cloned())),
            "completionItem/resolve" => {
                let Some(site) = upstream_completion_data_site(&request.params) else {
                    return Ok(None);
                };
                let key = completion_data_key(&site.0, &site.1);
                if self
                    .completion_data
                    .get(&key)
                    .is_some_and(|stash| restore_tsgo_completion_data(&mut request.params, stash))
                {
                    Ok(Some(site))
                } else {
                    Err(())
                }
            }
            _ => Ok(None),
        }
    }

    fn remember_completion_data(&mut self, key: String, stash: HashMap<String, serde_json::Value>) {
        // Keep the most recent sites rather than dropping the current one: a
        // resolve arrives right after the completion it belongs to.
        while self.completion_order.len() >= 8 {
            let oldest = self.completion_order.remove(0);
            self.completion_data.remove(&oldest);
        }
        self.completion_order.retain(|entry| entry != &key);
        self.completion_order.push(key.clone());
        self.completion_data.insert(key, stash);
    }

    fn completion_site(&self, request: &Request) -> Option<CompletionSite> {
        if request.method != "textDocument/completion" {
            return None;
        }
        let uri = request
            .params
            .pointer("/textDocument/uri")?
            .as_str()?
            .parse::<Uri>()
            .ok()?;
        let position = serde_json::from_value(request.params.get("position")?.clone()).ok()?;
        let document = self.documents.get(&uri)?;
        if document.language_id != "svelte" {
            return Some(CompletionSite::Script);
        }
        let text = document.text();
        let offset = document.offset_at(position);
        if crate::context::EmbeddedRegions::new(text).contains(offset) {
            return Some(if inside_element_body(text, offset, "style") {
                CompletionSite::Style
            } else {
                CompletionSite::Script
            });
        }
        // A `<script>` / `<style>` start tag is not an `Element` in the Svelte
        // AST — the block is hoisted to `instance` / `module` / `css` — so
        // upstream's `svelteNode?.type === 'Element'` guard never fires there.
        let start_tag = crate::context::start_tag_context(text, offset);
        if let crate::context::StartTag::Attribute(attribute) = &start_tag
            // An attribute value's `Text` has an `Attribute` parent, which is
            // not in upstream's raw-text bail list, and `svelteNodeAt` answers
            // `Text` rather than the element, so neither guard fires.
            && attribute.in_value
        {
            return Some(CompletionSite::Unguarded);
        }
        if let Some((element_tag, in_tag_name)) = match &start_tag {
            crate::context::StartTag::Attribute(attribute) => Some((attribute.element_tag, false)),
            crate::context::StartTag::Bare { element_tag } => Some((*element_tag, false)),
            crate::context::StartTag::TagName { element_tag } => Some((*element_tag, true)),
            crate::context::StartTag::None => None,
        } {
            if is_embedded_tag(element_tag) {
                return Some(CompletionSite::Unguarded);
            }
            return Some(
                if element_tag.starts_with(|character: char| character.is_ascii_uppercase()) {
                    CompletionSite::ComponentStartTag {
                        // Upstream answers nothing at a component's own name;
                        // narrowing is the shape that reproduces it.
                        at_whitespace: in_tag_name
                            || might_be_at_start_tag_whitespace(text, offset),
                    }
                } else {
                    CompletionSite::ElementStartTag
                },
            );
        }
        let before = text.get(..offset)?;
        // `CompletionProvider.ts:204-214` tests the WORD at the cursor, which
        // `getWordAtPosition` grows left while the character is neither
        // whitespace nor `.` — so `{#i` is a block marker and `{#if cond` is
        // not, because its word is `cond`.
        let word_start = before
            .char_indices()
            .rev()
            .find(|(_, character)| character.is_whitespace() || *character == '.')
            .map_or(0, |(index, character)| index + character.len_utf8());
        let word = before.get(word_start..)?;
        if let Some(rest) = word.strip_prefix('{')
            && rest.starts_with(['#', '@', ':', '/'])
        {
            return Some(CompletionSite::BlockMarker);
        }
        let brace = before.rfind('{');
        let close = before.rfind('}');
        if brace > close {
            return Some(CompletionSite::TemplateExpression);
        }
        Some(CompletionSite::RawTemplateText)
    }

    fn is_opening_block_completion(&self, request: &Request) -> bool {
        let uri = request
            .params
            .pointer("/textDocument/uri")
            .and_then(serde_json::Value::as_str)
            .and_then(|uri| uri.parse::<Uri>().ok());
        let position = request
            .params
            .get("position")
            .cloned()
            .and_then(|position| serde_json::from_value(position).ok());
        let (Some(uri), Some(position)) = (uri, position) else {
            return false;
        };
        let Some(document) = self.documents.get(&uri) else {
            return false;
        };
        let offset = document.offset_at(position);
        let Some(before) = document.text().get(..offset) else {
            return false;
        };
        before
            .rfind('{')
            .and_then(|brace| before.get(brace + 1..))
            .is_some_and(|marker| marker.trim_start().starts_with('#'))
    }

    fn component_completion_site(&self, request: &Request) -> Option<ComponentCompletionSite> {
        if request.method != "textDocument/completion" {
            return None;
        }
        let params = serde_json::from_value::<CompletionParams>(request.params.clone()).ok()?;
        let document = self
            .documents
            .get(&params.text_document_position.text_document.uri)?;
        if document.language_id != "svelte" {
            return None;
        }
        component_completion_site(
            document.text(),
            params.text_document_position.position,
            params.context.as_ref(),
            document_has_parser_error(document.text()),
        )
        .ok()
    }

    fn invalidate_project_config(&mut self) {
        self.worker.submit(Job::ClearCaches);
        if !self.client.pull_diagnostics {
            self.relint_open_documents();
        }
    }

    fn sync_tsgo_document(&mut self, key: &str) {
        let Some(document) = self.documents.get_by_key(key) else {
            return;
        };
        let uri = document.uri.clone();
        let language_id = document.language_id.clone();
        let version = document.version;
        let text = document.text().to_string();
        let path = uri_to_path(uri.as_str());
        let path = fs::canonicalize(&path).unwrap_or(path);
        let Some(runtime) = &mut self.tsgo else {
            return;
        };
        if is_svelte_document(&language_id, &path) {
            let Some(overlay) = runtime.overlay_for_source_mut(&path) else {
                return;
            };
            match overlay.open_or_update(&path, &text, version) {
                Ok(shadow) => {
                    let _ = runtime.client.change_buffer(OpenBuffer::new(
                        shadow.shadow_uri,
                        shadow.language_id,
                        shadow.version,
                        shadow.text,
                    ));
                }
                Err(error) => log::warn(format_args!(
                    "could not update tsgo shadow for {}: {error}",
                    path.display()
                )),
            }
        } else if is_typescript_or_javascript(&language_id, &path) {
            let Some(overlay) = runtime.overlay_for_source_mut(&path) else {
                return;
            };
            match overlay.open_plain(&path, &text, version, &language_id) {
                Ok(shadow) => {
                    let _ = runtime.client.change_buffer(OpenBuffer::new(
                        shadow.shadow_uri,
                        shadow.language_id,
                        shadow.version,
                        shadow.text,
                    ));
                }
                Err(error) => log::warn(format_args!(
                    "could not route TypeScript buffer {}: {error}",
                    path.display()
                )),
            }
        }
    }

    fn close_tsgo_document(&mut self, uri: &Uri) {
        let Some(document) = self.documents.get(uri) else {
            return;
        };
        let language_id = document.language_id.clone();
        let path = uri_to_path(uri.as_str());
        let path = fs::canonicalize(&path).unwrap_or(path);
        if is_svelte_document(&language_id, &path) {
            let mut closed_source = None;
            if let Some(runtime) = &mut self.tsgo
                && let Some(overlay) = runtime.overlay_for_source_mut(&path)
            {
                let shadow_uri = overlay
                    .shadow_for_source(&path)
                    .map(|shadow| shadow.shadow_uri.clone());
                match overlay.close(&path) {
                    Ok(Some(shadow)) => {
                        closed_source = overlay
                            .source_text(&path)
                            .map(|text| (shadow.version, text.to_string()));
                        let _ = runtime.client.change_buffer(OpenBuffer::new(
                            shadow.shadow_uri,
                            shadow.language_id,
                            shadow.version,
                            shadow.text,
                        ));
                    }
                    Ok(None) => {
                        if let Some(shadow_uri) = shadow_uri {
                            let _ = runtime.client.close_buffer(shadow_uri);
                        }
                    }
                    Err(error) => log::warn(format_args!(
                        "could not close tsgo shadow for {}: {error}",
                        path.display()
                    )),
                }
            }
            self.preprocess_failures.remove(&path);
            self.preprocess_documents.remove(&path);
            self.preprocess_dependencies.remove(&path);
            if let Some((version, text)) = closed_source {
                let _ = self.queue_preprocess_path(path, version, text);
            } else if let Some(runtime) = &self.preprocess {
                let _ = runtime.client.remove(path);
            }
        } else if is_typescript_or_javascript(&language_id, &path) {
            let Some(runtime) = &mut self.tsgo else {
                return;
            };
            let Some(overlay) = runtime.overlay_for_source_mut(&path) else {
                return;
            };
            match overlay.close_plain(&path) {
                Ok(Some(shadow_uri)) => {
                    let _ = runtime.client.close_buffer(shadow_uri);
                }
                Ok(None) => {}
                Err(error) => log::warn(format_args!(
                    "could not close TypeScript route {}: {error}",
                    path.display()
                )),
            }
        }
    }

    fn refresh_tsgo_overlays(&mut self) {
        let Some(runtime) = &mut self.tsgo else {
            return;
        };
        for overlay in &mut runtime.overlays {
            match overlay.refresh() {
                Ok(update) => {
                    for shadow in update.opened_or_changed {
                        let _ = runtime.client.change_buffer(OpenBuffer::new(
                            shadow.shadow_uri,
                            shadow.language_id,
                            shadow.version,
                            shadow.text,
                        ));
                    }
                    for uri in update.closed {
                        let _ = runtime.client.close_buffer(uri);
                    }
                }
                Err(error) => log::warn(format_args!(
                    "could not refresh tsgo overlay for {}: {error}",
                    overlay.workspace().display()
                )),
            }
        }
    }

    fn rebuild_tsgo_overlays(&mut self) {
        let Some(runtime) = &mut self.tsgo else {
            return;
        };
        let roots = runtime
            .overlays
            .iter()
            .map(|overlay| overlay.workspace().to_path_buf())
            .collect::<Vec<_>>();
        let mut rebuilt = Vec::with_capacity(roots.len());
        for root in roots {
            match TsgoOverlay::build(&root, None) {
                Ok(overlay) => rebuilt.push(overlay),
                Err(error) => log::warn(format_args!(
                    "could not rebuild tsgo overlay for {}: {error}",
                    root.display()
                )),
            }
        }
        if rebuilt.is_empty() {
            return;
        }
        for shadow in runtime.overlays.iter().flat_map(TsgoOverlay::open_shadows) {
            let _ = runtime.client.close_buffer(shadow.shadow_uri.clone());
        }
        runtime.overlays = rebuilt;
        for shadow in runtime.overlays.iter().flat_map(TsgoOverlay::eager_shadows) {
            let _ = runtime.client.open_buffer(OpenBuffer::new(
                shadow.shadow_uri.clone(),
                shadow.language_id.clone(),
                shadow.version,
                shadow.text.clone(),
            ));
        }
        let open = self
            .documents
            .iter()
            .map(|document| document.uri.as_str().to_string())
            .collect::<Vec<_>>();
        for key in open {
            self.sync_tsgo_document(&key);
        }
        self.abort_tsgo_requests("TypeScript project configuration changed");
        if let Some(runtime) = &mut self.tsgo {
            runtime.generation = None;
            let _ = runtime.client.restart();
        }
    }

    fn update_tsgo_workspace_folders(
        &mut self,
        added: &[lsp_types::WorkspaceFolder],
        removed: &[lsp_types::WorkspaceFolder],
    ) {
        let Some(runtime) = &mut self.tsgo else {
            return;
        };
        for folder in removed {
            let path = uri_to_path(folder.uri.as_str());
            let path = fs::canonicalize(&path).unwrap_or(path);
            if let Some(index) = runtime
                .overlays
                .iter()
                .position(|overlay| overlay.workspace() == path)
            {
                let overlay = runtime.overlays.remove(index);
                for shadow in overlay.open_shadows() {
                    let _ = runtime.client.close_buffer(shadow.shadow_uri.clone());
                }
            }
        }
        for folder in added {
            let path = uri_to_path(folder.uri.as_str());
            let path = fs::canonicalize(&path).unwrap_or(path);
            if runtime
                .overlays
                .iter()
                .any(|overlay| overlay.workspace() == path)
            {
                continue;
            }
            match TsgoOverlay::build(&path, None) {
                Ok(overlay) => {
                    for shadow in overlay.eager_shadows() {
                        let _ = runtime.client.open_buffer(OpenBuffer::new(
                            shadow.shadow_uri.clone(),
                            shadow.language_id.clone(),
                            shadow.version,
                            shadow.text.clone(),
                        ));
                    }
                    runtime.overlays.push(overlay);
                }
                Err(error) => log::warn(format_args!(
                    "could not prepare tsgo overlay for {}: {error}",
                    path.display()
                )),
            }
        }
    }

    fn ensure_tsgo_runtime(&mut self) {
        if self.tsgo.is_some() {
            return;
        }
        let Some(runtime) = TsgoRuntime::start(&self.client, &self.initialize_params) else {
            return;
        };
        let _ = runtime.client.update_configuration(
            self.js_ts_settings.clone(),
            self.editor_settings.clone(),
            self.typescript_settings.clone(),
            self.javascript_settings.clone(),
        );
        self.tsgo = Some(runtime);
        let open = self
            .documents
            .iter()
            .map(|document| document.uri.as_str().to_string())
            .collect::<Vec<_>>();
        for key in open {
            self.sync_tsgo_document(&key);
        }
    }

    fn ensure_preprocess_runtime(&mut self) {
        if !self.client.is_trusted || !self.settings.preprocess_enable {
            self.preprocess = None;
            self.preprocess_failures.clear();
            self.preprocess_documents.clear();
            self.preprocess_dependencies.clear();
            return;
        }
        if self.preprocess.is_some() {
            return;
        }
        let inputs = self.preprocess_inputs();
        if inputs.is_empty() {
            return;
        }
        let client = match PreprocessSidecar::spawn(
            PreprocessSidecarConfig::default(),
            self.preprocess_event_sender.clone(),
        ) {
            Ok(client) => client,
            Err(error) => {
                log::warn(format_args!(
                    "could not start preprocess supervisor: {error}"
                ));
                return;
            }
        };
        for input in inputs {
            let _ = client.preprocess(input);
        }
        self.preprocess = Some(PreprocessRuntime {
            client,
            generation: None,
        });
    }

    fn preprocess_inputs(&self) -> Vec<PreprocessInput> {
        let mut inputs = HashMap::<PathBuf, PreprocessInput>::new();
        if let Some(runtime) = &self.tsgo {
            for overlay in &runtime.overlays {
                for shadow in overlay.eager_shadows() {
                    let filename = uri_to_path(shadow.source_uri.as_str());
                    if find_preprocess_config(&filename, overlay.workspace()).is_none() {
                        continue;
                    }
                    let Some(text) = overlay.source_text(&filename) else {
                        continue;
                    };
                    inputs.insert(
                        filename.clone(),
                        PreprocessInput {
                            workspace: overlay.workspace().to_path_buf(),
                            filename,
                            version: shadow.version,
                            text: text.to_string(),
                        },
                    );
                }
            }
        }
        for document in self.documents.iter() {
            let filename = uri_to_path(document.uri.as_str());
            let Some(workspace) = self.preprocess_workspace_for_path(&filename) else {
                continue;
            };
            if find_preprocess_config(&filename, &workspace).is_none() {
                continue;
            }
            inputs.insert(
                filename.clone(),
                PreprocessInput {
                    workspace,
                    filename,
                    version: document.version,
                    text: document.text().to_string(),
                },
            );
        }
        inputs.into_values().collect()
    }

    fn queue_preprocess_document(&mut self, key: &str) -> bool {
        self.ensure_preprocess_runtime();
        let Some(document) = self.documents.get_by_key(key) else {
            return false;
        };
        let filename = uri_to_path(document.uri.as_str());
        let filename = fs::canonicalize(&filename).unwrap_or(filename);
        self.preprocess_failures.remove(&filename);
        self.preprocess_documents.remove(&filename);
        self.queue_preprocess_path(filename, document.version, document.text().to_string())
    }

    fn queue_preprocess_path(&mut self, filename: PathBuf, version: i32, text: String) -> bool {
        let Some(workspace) = self.preprocess_workspace_for_path(&filename) else {
            return false;
        };
        if find_preprocess_config(&filename, &workspace).is_none() {
            if let Some(runtime) = &self.preprocess {
                let _ = runtime.client.remove(filename);
            }
            return false;
        }
        if let Some(runtime) = &self.preprocess {
            return runtime
                .client
                .preprocess(PreprocessInput {
                    workspace,
                    filename,
                    version,
                    text,
                })
                .is_ok();
        }
        false
    }

    fn preprocess_workspace_for_path(&self, path: &Path) -> Option<PathBuf> {
        if let Some(runtime) = &self.tsgo
            && let Some(overlay) = runtime
                .overlays
                .iter()
                .filter(|overlay| path.starts_with(overlay.workspace()))
                .max_by_key(|overlay| overlay.workspace().components().count())
        {
            return Some(overlay.workspace().to_path_buf());
        }
        self.client
            .workspace_folders
            .iter()
            .map(|folder| uri_to_path(folder.uri.as_str()))
            .chain(
                self.client
                    .root_uri
                    .iter()
                    .map(|root| uri_to_path(root.as_str())),
            )
            .filter(|workspace| path.starts_with(workspace))
            .max_by_key(|workspace| workspace.components().count())
    }

    fn register_preprocess_dependencies(
        &mut self,
        filename: &Path,
        config_path: Option<&Path>,
        dependencies: &[PathBuf],
    ) {
        let base = config_path
            .and_then(Path::parent)
            .or_else(|| filename.parent())
            .unwrap_or(Path::new("."));
        let dependencies = dependencies
            .iter()
            .map(|dependency| {
                let dependency = if dependency.is_absolute() {
                    dependency.clone()
                } else {
                    base.join(dependency)
                };
                fs::canonicalize(&dependency).unwrap_or(dependency)
            })
            .collect::<HashSet<_>>();
        self.preprocess_dependencies
            .insert(filename.to_path_buf(), dependencies.clone());
        if !self.client.dynamic_watched_files {
            return;
        }
        let candidate_directories = dependencies
            .into_iter()
            .filter_map(|dependency| {
                self.preprocess_workspace_for_path(&dependency)?;
                dependency.parent().map(Path::to_path_buf)
            })
            .collect::<Vec<_>>();
        let watch_directories = candidate_directories
            .into_iter()
            .filter(|directory| {
                self.watched_preprocess_directories
                    .insert(directory.clone())
            })
            .collect::<Vec<_>>();
        let watchers = watch_directories
            .into_iter()
            .filter_map(|directory| {
                let base_uri = path_to_uri(&directory)?;
                Some(serde_json::json!({
                    "globPattern": {
                        "baseUri": base_uri,
                        "pattern": "*",
                    }
                }))
            })
            .collect::<Vec<_>>();
        if watchers.is_empty() {
            return;
        }
        self.next_request_id += 1;
        let id = RequestId::from(format!(
            "rsvelte-preprocess-dependencies-{}",
            self.next_request_id
        ));
        self.outgoing
            .insert(id.clone(), Outgoing::WatchedFilesRegistration);
        self.send(Request::new(
            id,
            "client/registerCapability".to_string(),
            serde_json::json!({
                "registrations": [{
                    "id": format!("rsvelte-preprocess-dependencies-{}", self.next_request_id),
                    "method": "workspace/didChangeWatchedFiles",
                    "registerOptions": { "watchers": watchers },
                }],
            }),
        ));
    }

    fn restart_preprocessing(&mut self) {
        self.preprocess_failures.clear();
        self.preprocess_documents.clear();
        self.preprocess_dependencies.clear();
        self.preprocess = None;
        self.ensure_preprocess_runtime();
    }

    fn on_preprocess_event(&mut self, event: PreprocessEvent) {
        match event {
            PreprocessEvent::Ready { generation } => {
                if let Some(runtime) = &mut self.preprocess {
                    runtime.generation = Some(generation);
                }
            }
            PreprocessEvent::Result(output) => {
                if self
                    .preprocess
                    .as_ref()
                    .and_then(|runtime| runtime.generation)
                    != Some(output.generation)
                {
                    return;
                }
                let filename = fs::canonicalize(&output.filename).unwrap_or(output.filename);
                let original = self
                    .documents
                    .iter()
                    .find(|document| {
                        let path = uri_to_path(document.uri.as_str());
                        fs::canonicalize(&path).unwrap_or(path) == filename
                    })
                    .filter(|document| document.version == output.version)
                    .map(|document| document.text().to_string())
                    .or_else(|| {
                        self.tsgo.as_ref().and_then(|runtime| {
                            let overlay = runtime.overlay_for_source(&filename)?;
                            overlay
                                .shadow_for_source(&filename)
                                .filter(|shadow| shadow.version == output.version)
                                .and_then(|_| overlay.source_text(&filename).map(str::to_string))
                        })
                    });
                let Some(original) = original else {
                    return;
                };
                self.preprocess_failures.remove(&filename);
                if output.has_preprocessor {
                    self.preprocess_documents.insert(
                        filename.clone(),
                        PreprocessDocumentState {
                            version: output.version,
                            text: Arc::new(output.code.clone()),
                            map: output.map.clone().map(Arc::new),
                            identity: original == output.code,
                        },
                    );
                } else {
                    self.preprocess_documents.remove(&filename);
                }
                self.register_preprocess_dependencies(
                    &filename,
                    output.config_path.as_deref(),
                    &output.dependencies,
                );
                let mut projection_error = None;
                if let Some(runtime) = &mut self.tsgo
                    && let Some(overlay) = runtime.overlay_for_source_mut(&filename)
                {
                    match overlay.open_or_update_preprocessed(
                        &filename,
                        &original,
                        &output.code,
                        output.map.as_deref(),
                        output.version,
                    ) {
                        Ok(shadow) => {
                            let _ = runtime.client.change_buffer(OpenBuffer::new(
                                shadow.shadow_uri,
                                shadow.language_id,
                                shadow.version,
                                shadow.text,
                            ));
                        }
                        Err(error) => projection_error = Some(error.to_string()),
                    }
                }
                let open_key = self
                    .documents
                    .iter()
                    .find(|document| {
                        let path = uri_to_path(document.uri.as_str());
                        fs::canonicalize(&path).unwrap_or(path) == filename
                            && document.version == output.version
                    })
                    .map(|document| document.uri.as_str().to_string());
                if let Some(error) = projection_error {
                    let message = format!("could not project preprocessed document: {error}");
                    log::warn(format_args!("{}: {message}", filename.display()));
                    self.preprocess_documents.remove(&filename);
                    self.preprocess_failures
                        .insert(filename, (output.version, message));
                    if let Some(key) = open_key {
                        self.refresh_document_diagnostics(key);
                    }
                    return;
                }
                if let Some(key) = open_key {
                    self.refresh_document_diagnostics(key);
                }
            }
            PreprocessEvent::Failed {
                generation,
                filename,
                version,
                message,
            } => {
                if self
                    .preprocess
                    .as_ref()
                    .and_then(|runtime| runtime.generation)
                    != Some(generation)
                {
                    return;
                }
                log::warn(format_args!("preprocessing failed: {message}"));
                if let (Some(filename), Some(version)) = (filename, version) {
                    let filename = fs::canonicalize(&filename).unwrap_or(filename);
                    self.preprocess_failures
                        .insert(filename.clone(), (version, message));
                    self.preprocess_documents.remove(&filename);
                    self.preprocess_dependencies.remove(&filename);
                    if let Some(runtime) = &mut self.tsgo
                        && let Some(overlay) = runtime.overlay_for_source_mut(&filename)
                        && let Some(original) = self
                            .documents
                            .iter()
                            .find(|document| {
                                let path = uri_to_path(document.uri.as_str());
                                fs::canonicalize(&path).unwrap_or(path) == filename
                                    && document.version == version
                            })
                            .map(|document| document.text().to_string())
                            .or_else(|| overlay.source_text(&filename).map(str::to_string))
                    {
                        match overlay.open_or_update(&filename, &original, version) {
                            Ok(shadow) => {
                                let _ = runtime.client.change_buffer(OpenBuffer::new(
                                    shadow.shadow_uri,
                                    shadow.language_id,
                                    shadow.version,
                                    shadow.text,
                                ));
                            }
                            Err(error) => log::warn(format_args!(
                                "could not restore raw shadow for {}: {error}",
                                filename.display()
                            )),
                        }
                    }
                    let open_key = self
                        .documents
                        .iter()
                        .find(|document| {
                            let path = uri_to_path(document.uri.as_str());
                            fs::canonicalize(&path).unwrap_or(path) == filename
                                && document.version == version
                        })
                        .map(|document| document.uri.as_str().to_string());
                    if let Some(key) = open_key {
                        self.refresh_document_diagnostics(key);
                    }
                }
            }
            PreprocessEvent::Crashed {
                generation,
                status,
                error,
            } => {
                if let Some(runtime) = &mut self.preprocess
                    && runtime.generation == Some(generation)
                {
                    runtime.generation = None;
                }
                log::warn(format_args!(
                    "preprocess sidecar crashed ({status:?}): {error}"
                ));
            }
            PreprocessEvent::CircuitOpen {
                generation,
                crashes,
                error,
            } => {
                if let Some(runtime) = &mut self.preprocess
                    && runtime.generation == Some(generation)
                {
                    runtime.generation = None;
                }
                log::warn(format_args!(
                    "preprocess sidecar restart circuit opened after {crashes} crashes: {error}"
                ));
                for input in self.preprocess_inputs() {
                    self.preprocess_documents.remove(&input.filename);
                    self.preprocess_failures
                        .insert(input.filename.clone(), (input.version, error.clone()));
                    let open_key = self
                        .documents
                        .iter()
                        .find(|document| {
                            let path = uri_to_path(document.uri.as_str());
                            fs::canonicalize(&path).unwrap_or(path) == input.filename
                                && document.version == input.version
                        })
                        .map(|document| document.uri.as_str().to_string());
                    if let Some(key) = open_key {
                        self.refresh_document_diagnostics(key);
                    }
                }
            }
        }
    }

    fn on_response(&mut self, mut response: Response) {
        let Some(outgoing) = self.outgoing.remove(&response.id) else {
            log::warn(format_args!("response to unknown request {}", response.id));
            return;
        };
        match outgoing {
            Outgoing::Configuration => {
                let preprocessing_was_enabled = self.settings.preprocess_enable;
                self.settings = match response.response_result {
                    Ok(value) => {
                        let items = value.as_array();
                        self.js_ts_settings = items
                            .and_then(|items| items.get(2))
                            .cloned()
                            .unwrap_or(serde_json::Value::Null);
                        self.typescript_settings = items
                            .and_then(|items| items.get(3))
                            .cloned()
                            .unwrap_or(serde_json::Value::Null);
                        self.javascript_settings = items
                            .and_then(|items| items.get(4))
                            .cloned()
                            .unwrap_or(serde_json::Value::Null);
                        self.editor_settings = items
                            .and_then(|items| items.get(5))
                            .cloned()
                            .unwrap_or(serde_json::Value::Null);
                        Settings::from_sections(
                            items
                                .and_then(|items| items.first())
                                .unwrap_or(&serde_json::Value::Null),
                            items
                                .and_then(|items| items.get(1))
                                .unwrap_or(&serde_json::Value::Null),
                        )
                    }
                    Err(err) => {
                        log::warn(format_args!(
                            "workspace/configuration failed: {}",
                            err.message
                        ));
                        Settings::default()
                    }
                };
                if let Some(runtime) = &self.tsgo
                    && let Err(error) = runtime.client.update_configuration(
                        self.js_ts_settings.clone(),
                        self.editor_settings.clone(),
                        self.typescript_settings.clone(),
                        self.javascript_settings.clone(),
                    )
                {
                    log::warn(format_args!("could not update tsgo settings: {error}"));
                }
                if preprocessing_was_enabled && !self.settings.preprocess_enable {
                    self.preprocess = None;
                    self.preprocess_failures.clear();
                    self.preprocess_documents.clear();
                    self.preprocess_dependencies.clear();
                    self.rebuild_tsgo_overlays();
                } else {
                    self.ensure_preprocess_runtime();
                }
                if !self.client.pull_diagnostics {
                    self.relint_open_documents();
                }
            }
            Outgoing::WatchedFilesRegistration => {}
            Outgoing::DiagnosticRefresh => {}
            Outgoing::ApplyEdit { command_id } => {
                self.respond(Response::new_ok(command_id, serde_json::Value::Null));
            }
            Outgoing::Tsgo { child_id } => {
                response.id = child_id;
                if let Some(runtime) = &self.tsgo {
                    let _ = runtime.client.forward(response.into());
                }
            }
        }
    }

    fn on_tsgo_event(&mut self, event: TsgoEvent) {
        match event {
            TsgoEvent::Ready {
                generation,
                capabilities: _,
            } => {
                if let Some(runtime) = &mut self.tsgo {
                    runtime.generation = Some(generation);
                }
            }
            TsgoEvent::Message {
                generation,
                message,
            } => {
                if self
                    .tsgo
                    .as_ref()
                    .is_some_and(|runtime| runtime.generation == Some(generation))
                {
                    self.on_tsgo_message(message);
                }
            }
            TsgoEvent::Crashed {
                generation,
                status,
                error,
            } => {
                if let Some(runtime) = &mut self.tsgo {
                    runtime.generation = None;
                }
                log::warn(format_args!(
                    "tsgo generation {generation} crashed ({status:?}): {error}"
                ));
                self.abort_tsgo_requests("TypeScript service restarted before answering");
            }
        }
    }

    fn abort_tsgo_requests(&mut self, message: &str) {
        let stale_child_requests = self
            .outgoing
            .iter()
            .filter_map(|(id, outgoing)| {
                matches!(outgoing, Outgoing::Tsgo { .. }).then_some(id.clone())
            })
            .collect::<Vec<_>>();
        for id in stale_child_requests {
            self.outgoing.remove(&id);
            self.send(Notification::new(
                "$/cancelRequest".to_string(),
                serde_json::json!({ "id": id }),
            ));
        }
        for (id, pending) in std::mem::take(&mut self.pending_tsgo) {
            if let Some((uri, version)) = pending.push_diagnostics {
                let diagnostics = pending
                    .fallback_result
                    .and_then(|report| report.get("items").cloned())
                    .and_then(|items| serde_json::from_value(items).ok())
                    .unwrap_or_default();
                self.publish(uri, version, diagnostics);
                continue;
            }
            if matches!(pending.rename, Some(PendingRename::Followup { .. })) {
                continue;
            }
            if let Some(fallback) = pending.fallback_result {
                self.respond(Response::new_ok(id, fallback));
            } else {
                self.respond(Response::new_err(
                    id,
                    ErrorCode::InternalError as i32,
                    message.to_string(),
                ));
            }
        }
        for (id, _) in std::mem::take(&mut self.rename_aggregates) {
            self.respond(Response::new_err(
                id,
                ErrorCode::InternalError as i32,
                message.to_string(),
            ));
        }
        self.component_query_requests.clear();
        for (id, pending) in std::mem::take(&mut self.component_queries) {
            if let Some(runtime) = &self.tsgo {
                let _ = runtime
                    .client
                    .close_buffer(pending.query.query_uri().clone());
            }
            self.respond(Response::new_err(
                id,
                ErrorCode::InternalError as i32,
                message.to_string(),
            ));
        }
    }

    fn on_tsgo_message(&mut self, message: Message) {
        match message {
            Message::Response(mut response) => {
                if self.on_component_query_response(response.clone()) {
                    return;
                }
                let Some(pending) = self.pending_tsgo.remove(&response.id) else {
                    log::warn(format_args!(
                        "response to unknown tsgo request {}",
                        response.id
                    ));
                    return;
                };
                if let Some(rename) = pending.rename {
                    self.on_tsgo_rename_response(response, rename);
                    return;
                }
                let PendingTsgoRequest {
                    method,
                    document,
                    fallback_result,
                    completion_site,
                    rename: _,
                    code_action_diagnostic_codes,
                    push_diagnostics,
                    component_site,
                    component_references,
                    file_rename,
                    code_lens_resolve,
                    completion_site_data,
                } = pending;
                let source_path = document
                    .as_ref()
                    .map(|document| uri_to_path(document.source_uri().as_str()));
                let source_uri = document
                    .as_ref()
                    .map(|document| document.source_uri().clone());
                let completion_context =
                    CompletionRewriteContext::new(source_path.as_deref(), true);
                let mut adopted_completion_data = None;
                if let Ok(result) = &mut response.response_result {
                    // Upstream never carries tsgo's enclosing-declaration span:
                    // `LocationLink.create(uri, defLocation.range, defLocation.range, …)`.
                    // Collapsing it before the mapping also keeps a link whose
                    // enclosing statement merely touches an `Ωignore` region.
                    if method == "textDocument/definition" {
                        normalize_definition_result(result);
                    }
                    if let Some(runtime) = &self.tsgo {
                        let mut mapper = TsgoResponseMapper::for_overlays_with_default_document(
                            &runtime.overlays,
                            document,
                        );
                        if let Some(rename) = &file_rename {
                            let _ = mapper.add_uri_alias(
                                rename.new_source.clone(),
                                rename.new_shadow.clone(),
                                &rename.old_source,
                            );
                        }
                        mapper.map_response(&method, result);
                    }
                    match method.as_str() {
                        "textDocument/completion" => {
                            let mut strip_commits = false;
                            rewrite_completion_response_for_context(result, completion_context);
                            // `CompletionProvider.ts:451`: a document svelte2tsx
                            // rejected is answered from a fragment, so the list
                            // is incomplete and `PluginHost.ts:285-296` narrows
                            // it here rather than leaving it to the editor.
                            if let Some(path) = source_path.as_deref()
                                && self
                                    .tsgo
                                    .as_ref()
                                    .and_then(|runtime| runtime.overlay_for_source(path))
                                    .is_some_and(|overlay| overlay.parser_error(path).is_some())
                            {
                                // `CompletionProvider.ts:785-789`: outside a
                                // `<script>` such a response carries no commit
                                // characters at all — applied after the adopt
                                // below, which installs the default set.
                                strip_commits =
                                    completion_site_data.as_ref().is_some_and(|(_, position)| {
                                        !position_is_in_script(
                                            source_uri
                                                .as_ref()
                                                .and_then(|uri| self.documents.get(uri))
                                                .map_or("", Document::text),
                                            position,
                                        )
                                    });
                                let prefix = self
                                    .client
                                    .filter_incomplete_completions
                                    .then(|| {
                                        source_uri
                                            .as_ref()
                                            .and_then(|uri| self.documents.get(uri))
                                            .zip(completion_site_data.as_ref())
                                            .map(|(document, (_, position))| {
                                                incomplete_completion_filter(
                                                    document.text(),
                                                    position,
                                                )
                                            })
                                    })
                                    .flatten();
                                mark_completion_list_incomplete(result, prefix.as_deref());
                            }
                            if let Some((uri, position)) = &completion_site_data {
                                adopted_completion_data = Some((
                                    completion_data_key(uri, position),
                                    adopt_upstream_completion_data(result, uri, position),
                                ));
                            }
                            if let Some(site) = completion_site {
                                let (count, first_is_member) = completion_result_shape(result);
                                if !matches!(
                                    completion_action(site, count, first_is_member),
                                    CompletionAction::Forward
                                ) {
                                    *result = empty_completion_list();
                                }
                            }
                            if strip_commits {
                                strip_commit_characters(result);
                            }
                        }
                        "completionItem/resolve" => {
                            rewrite_completion_item_for_context(result, completion_context);
                            if let Some((uri, position)) = &completion_site_data {
                                adopt_upstream_item_data(result, uri, position);
                            }
                        }
                        "textDocument/codeAction" => {
                            if let Some(uri) = source_uri.as_ref()
                                && let Some(source) = self.documents.get(uri)
                                && is_svelte_document(
                                    &source.language_id,
                                    &uri_to_path(uri.as_str()),
                                )
                            {
                                let parser_error = document_has_parser_error(source.text());
                                let context = TsgoCodeActionContext::new(uri, source.text())
                                    .with_parser_error(parser_error)
                                    .with_default_script_language(
                                        (self.settings.svelte.default_script_language != "none")
                                            .then_some(
                                                self.settings
                                                    .svelte
                                                    .default_script_language
                                                    .as_str(),
                                            ),
                                    )
                                    .with_diagnostic_codes(&code_action_diagnostic_codes);
                                rewrite_code_action_response(result, &context);
                            }
                        }
                        "textDocument/codeLens" => {
                            if let Some(uri) = source_uri.as_ref() {
                                prepare_code_lenses(result, uri);
                                if self.component_reference_code_lens_enabled(uri)
                                    && let Some(lenses) = result.as_array_mut()
                                {
                                    lenses.push(component_reference_code_lens(uri));
                                }
                            }
                        }
                        "textDocument/hover" => {
                            normalize_hover_result(result);
                            if let Some(document) =
                                source_uri.as_ref().and_then(|uri| self.documents.get(uri))
                            {
                                widen_hover_range_over_string_quotes(result, document.text());
                            }
                        }
                        _ => {}
                    }
                    rewrite_visible_tsgo_response(result);
                    if component_references.is_some() {
                        let locations =
                            serde_json::from_value::<Vec<lsp_types::Location>>(result.clone())
                                .unwrap_or_default();
                        let texts = locations
                            .iter()
                            .map(|location| {
                                self.documents
                                    .get(&location.uri)
                                    .map(|document| document.text().to_string())
                                    .or_else(|| {
                                        fs::read_to_string(uri_to_path(location.uri.as_str())).ok()
                                    })
                            })
                            .collect::<Vec<_>>();
                        let references =
                            locations.into_iter().zip(&texts).map(|(location, text)| {
                                ComponentReference {
                                    location,
                                    source_text: text.as_deref(),
                                    is_definition: false,
                                    is_generated: false,
                                }
                            });
                        *result = serde_json::to_value(filter_component_references(references))
                            .unwrap_or_else(|_| serde_json::Value::Array(Vec::new()));
                    }
                    if let Some(file_rename) = &file_rename {
                        let mapping = WillRenameMapping {
                            old: ShadowUriPair {
                                source_uri: &file_rename.old_source,
                                shadow_uri: &file_rename.old_shadow,
                            },
                            new: ShadowUriPair {
                                source_uri: &file_rename.new_source,
                                shadow_uri: &file_rename.new_shadow,
                            },
                        };
                        let owned_pairs = self
                            .tsgo
                            .as_ref()
                            .map(|runtime| {
                                runtime
                                    .overlays
                                    .iter()
                                    .flat_map(TsgoOverlay::eager_shadows)
                                    .map(|shadow| {
                                        (shadow.source_uri.clone(), shadow.shadow_uri.clone())
                                    })
                                    .collect::<Vec<_>>()
                            })
                            .unwrap_or_default();
                        let pairs = owned_pairs
                            .iter()
                            .map(|(source, shadow)| ShadowUriPair {
                                source_uri: source,
                                shadow_uri: shadow,
                            })
                            .collect::<Vec<_>>();
                        rewrite_will_rename_result(result, &[mapping], &pairs);
                    }
                    if let Some(mut resolve) = code_lens_resolve {
                        let locations = locations_from_tsgo_result(result);
                        resolve_code_lens(
                            &mut resolve.lens,
                            resolve.kind,
                            &resolve.source_uri,
                            locations,
                        );
                        *result = resolve.lens;
                    }
                    if method == "textDocument/foldingRange" {
                        drop_degenerate_folding_ranges(result, self.client.line_folding_only);
                    }
                    if let Some(fallback) = fallback_result {
                        merge_tsgo_result(&method, result, fallback);
                    }
                } else if let Some(fallback) = fallback_result {
                    response.response_result = Ok(fallback);
                }
                // tsgo answers `null` where it has nothing; upstream's plugins do
                // too, but `PluginHost.getCompletions` still returns the
                // `CompletionList.create([], false)` its signature promises.
                if method == "textDocument/completion"
                    && let Ok(result) = &mut response.response_result
                    && result.is_null()
                {
                    *result = empty_completion_list();
                }
                if let Some((key, stash)) = adopted_completion_data {
                    self.remember_completion_data(key, stash);
                }
                if let Some((uri, version)) = push_diagnostics {
                    let diagnostics = response
                        .response_result
                        .as_ref()
                        .ok()
                        .and_then(|result| result.get("items"))
                        .cloned()
                        .and_then(|items| serde_json::from_value(items).ok())
                        .unwrap_or_default();
                    self.publish(uri, version, diagnostics);
                    return;
                }
                if method == "textDocument/completion"
                    && let (Some(site), Some(uri), Ok(result)) = (
                        component_site,
                        source_uri.as_ref(),
                        response.response_result.as_ref(),
                    )
                    && self.start_component_query(response.id.clone(), uri, site, result.clone())
                {
                    return;
                }
                self.respond(response);
            }
            Message::Notification(mut notification) => {
                if let Some(runtime) = &self.tsgo {
                    let mapper = TsgoResponseMapper::for_overlays(&runtime.overlays);
                    if !mapper.map_child_params(&notification.method, &mut notification.params) {
                        return;
                    }
                }
                self.send(notification);
            }
            Message::Request(mut request) => {
                if let Some(runtime) = &self.tsgo {
                    let mapper = TsgoResponseMapper::for_overlays_request(
                        &runtime.overlays,
                        &request.params,
                    );
                    if !mapper.map_child_params(&request.method, &mut request.params) {
                        let _ = runtime.client.forward(
                            Response::new_err(
                                request.id,
                                ErrorCode::InvalidParams as i32,
                                "could not map generated request coordinates".to_string(),
                            )
                            .into(),
                        );
                        return;
                    }
                }
                let child_id = request.id.clone();
                self.next_request_id += 1;
                let editor_id =
                    RequestId::from(format!("rsvelte-tsgo-child-{}", self.next_request_id));
                request.id = editor_id.clone();
                self.outgoing.insert(editor_id, Outgoing::Tsgo { child_id });
                self.send(request);
            }
        }
    }

    fn start_component_query(
        &mut self,
        editor_id: RequestId,
        source_uri: &Uri,
        site: ComponentCompletionSite,
        result: serde_json::Value,
    ) -> bool {
        let Some(runtime) = self.tsgo.as_ref() else {
            return false;
        };
        let source_path = uri_to_path(source_uri.as_str());
        let Some((shadow_uri, generated_text, generated_range, version)) = runtime
            .overlays
            .iter()
            .filter_map(|overlay| {
                let shadow = overlay.shadow_for_source(&source_path)?;
                let ranges = generated_component_ranges(
                    overlay.projection_map(&source_path)?,
                    &site,
                    &shadow.text,
                );
                Some((
                    shadow.shadow_uri.clone(),
                    shadow.text.clone(),
                    ranges.into_iter().next_back()?,
                    shadow.version.saturating_add(10_000),
                ))
            })
            .next()
        else {
            return false;
        };
        let Ok(query) = ComponentInfoQuery::new(
            &shadow_uri,
            generated_text,
            generated_range,
            site.component_expression(),
            version,
        ) else {
            return false;
        };
        self.component_queries.insert(
            editor_id.clone(),
            PendingComponentQuery {
                query,
                site,
                result,
            },
        );
        self.drive_component_query(&editor_id);
        true
    }

    fn component_reference_code_lens_enabled(&self, uri: &Uri) -> bool {
        let Some(document) = self.documents.get(uri) else {
            return false;
        };
        if !is_svelte_document(&document.language_id, &uri_to_path(uri.as_str()))
            || document_has_parser_error(document.text())
        {
            return false;
        }
        let language = if is_typescript_component(document.text()) {
            &self.typescript_settings
        } else {
            &self.javascript_settings
        };
        let mut enabled = true;
        for layer in [&self.editor_settings, language, &self.js_ts_settings] {
            if let Some(value) = layer
                .pointer("/referencesCodeLens/enabled")
                .and_then(serde_json::Value::as_bool)
            {
                enabled = value;
            }
        }
        enabled
    }

    fn on_component_query_response(&mut self, response: Response) -> bool {
        let Some((editor_id, query_id)) = self.component_query_requests.remove(&response.id) else {
            return false;
        };
        let Some(mut pending) = self.component_queries.remove(&editor_id) else {
            return true;
        };
        match response.response_result {
            Ok(result) => {
                let _ = pending.query.accept_response(query_id, result);
            }
            Err(_) => {
                let _ = pending.query.accept_error(query_id);
            }
        }
        self.component_queries.insert(editor_id.clone(), pending);
        self.drive_component_query(&editor_id);
        true
    }

    fn drive_component_query(&mut self, editor_id: &RequestId) {
        let Some(mut pending) = self.component_queries.remove(editor_id) else {
            return;
        };
        loop {
            let Some(action) = pending.query.next_action() else {
                self.component_queries.insert(editor_id.clone(), pending);
                return;
            };
            match action {
                ComponentInfoAction::Open {
                    uri,
                    language_id,
                    version,
                    text,
                } => {
                    if let Some(runtime) = &self.tsgo {
                        let _ = runtime.client.open_buffer(OpenBuffer::new(
                            uri,
                            language_id,
                            version,
                            text,
                        ));
                    }
                }
                ComponentInfoAction::Change { uri, version, text } => {
                    if let Some(runtime) = &self.tsgo {
                        let _ = runtime.client.change_buffer(OpenBuffer::new(
                            uri,
                            "typescriptreact",
                            version,
                            text,
                        ));
                    }
                }
                ComponentInfoAction::Request { id, method, params } => {
                    self.next_request_id += 1;
                    let child_id = RequestId::from(format!(
                        "rsvelte-tsgo-component-info-{}",
                        self.next_request_id
                    ));
                    let request = Request::new(child_id.clone(), method.to_string(), params);
                    let sent = self
                        .tsgo
                        .as_ref()
                        .is_some_and(|runtime| runtime.client.forward(request.into()).is_ok());
                    if sent {
                        self.component_query_requests
                            .insert(child_id, (editor_id.clone(), id));
                        self.component_queries.insert(editor_id.clone(), pending);
                        return;
                    }
                    let _ = pending.query.accept_error(id);
                }
                ComponentInfoAction::Close { uri } => {
                    if let Some(runtime) = &self.tsgo {
                        let _ = runtime.client.close_buffer(uri);
                    }
                }
                ComponentInfoAction::Complete(info) => {
                    let manual = info.completion_items(&pending.site);
                    append_component_completions(
                        &mut pending.result,
                        manual,
                        pending.site.was_colon_triggered(),
                    );
                    self.respond(Response::new_ok(editor_id.clone(), pending.result));
                    return;
                }
            }
        }
    }

    fn on_tsgo_rename_response(&mut self, mut response: Response, pending: PendingRename) {
        match pending {
            PendingRename::Prepare(plan) => {
                if let Ok(result) = response.response_result {
                    let rewritten = self
                        .tsgo
                        .as_ref()
                        .and_then(|runtime| {
                            let documents = rename_documents(&runtime.overlays);
                            rewrite_prepare_response(&plan, result, &documents)
                        })
                        .unwrap_or(serde_json::Value::Null);
                    response.response_result = Ok(rewritten);
                }
                self.respond(response);
            }
            PendingRename::Primary { plan, new_name } => {
                let Ok(result) = response.response_result else {
                    self.respond(response);
                    return;
                };
                let Some(runtime) = self.tsgo.as_ref() else {
                    self.respond_nothing(response.id);
                    return;
                };
                let documents = rename_documents(&runtime.overlays);
                let rewritten = rewrite_workspace_edit(&plan, &result, &documents, &new_name, true);
                if rewritten.followups.is_empty() {
                    self.respond(Response::new_ok(response.id, rewritten.edit));
                    return;
                }
                let editor_id = response.id;
                let remaining = rewritten.followups.len();
                let mut requests = Vec::with_capacity(remaining);
                for followup in rewritten.followups {
                    self.next_request_id += 1;
                    let child_id = RequestId::from(format!(
                        "rsvelte-tsgo-rename-followup-{}",
                        self.next_request_id
                    ));
                    let request = Request::new(
                        child_id.clone(),
                        "textDocument/rename".to_string(),
                        serde_json::json!({
                            "textDocument": { "uri": followup.uri },
                            "position": followup.position,
                            "newName": followup.new_name,
                        }),
                    );
                    let child_pending = PendingTsgoRequest {
                        method: "textDocument/rename".to_string(),
                        document: None,
                        fallback_result: None,
                        completion_site: None,
                        rename: Some(PendingRename::Followup {
                            editor_id: editor_id.clone(),
                        }),
                        code_action_diagnostic_codes: Vec::new(),
                        push_diagnostics: None,
                        component_site: None,
                        component_references: None,
                        file_rename: None,
                        code_lens_resolve: None,
                        completion_site_data: None,
                    };
                    requests.push((child_id, request, child_pending));
                }
                self.rename_aggregates.insert(
                    editor_id.clone(),
                    RenameAggregate {
                        plan,
                        new_name,
                        edits: vec![rewritten.edit],
                        remaining,
                    },
                );
                for (child_id, request, child_pending) in requests {
                    if let Some(runtime) = &self.tsgo
                        && runtime.client.forward(request.into()).is_ok()
                    {
                        self.pending_tsgo.insert(child_id, child_pending);
                    } else {
                        self.finish_rename_followup(&editor_id, None);
                    }
                }
            }
            PendingRename::Followup { editor_id } => {
                let edit = response.response_result.ok().and_then(|result| {
                    let aggregate = self.rename_aggregates.get(&editor_id)?;
                    let runtime = self.tsgo.as_ref()?;
                    let documents = rename_documents(&runtime.overlays);
                    Some(
                        rewrite_workspace_edit(
                            &aggregate.plan,
                            &result,
                            &documents,
                            &aggregate.new_name,
                            false,
                        )
                        .edit,
                    )
                });
                self.finish_rename_followup(&editor_id, edit);
            }
        }
    }

    fn finish_rename_followup(&mut self, editor_id: &RequestId, edit: Option<serde_json::Value>) {
        let Some(aggregate) = self.rename_aggregates.get_mut(editor_id) else {
            return;
        };
        if let Some(edit) = edit {
            aggregate.edits.push(edit);
        }
        aggregate.remaining = aggregate.remaining.saturating_sub(1);
        if aggregate.remaining != 0 {
            return;
        }
        let aggregate = self
            .rename_aggregates
            .remove(editor_id)
            .expect("aggregate existed above");
        self.respond(Response::new_ok(
            editor_id.clone(),
            merge_workspace_edits(aggregate.edits),
        ));
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
            Outcome::Compiled { id, result } => {
                if matches!(self.pending.remove(&id), Some(Pending::CompiledCode)) {
                    self.respond(Response::new_ok(id, result));
                }
            }
            Outcome::Completed { id, list } => {
                if let Some(Pending::Completion { tsgo_fallback }) = self.pending.remove(&id) {
                    let fallback = list.and_then(|list| serde_json::to_value(list).ok());
                    self.forward_tsgo_request_with_fallback(tsgo_fallback, fallback);
                }
            }
            Outcome::Hovered { id, hover } => {
                if let Some(Pending::Hover { tsgo_fallback }) = self.pending.remove(&id) {
                    if hover.is_some() {
                        self.respond(Response::new_ok(id, hover));
                    } else {
                        self.forward_tsgo_request(tsgo_fallback);
                    }
                }
            }
            Outcome::CodeActions { id, actions } => {
                if let Some(Pending::CodeAction { tsgo_fallback }) = self.pending.remove(&id) {
                    self.forward_tsgo_request_with_fallback(
                        tsgo_fallback,
                        serde_json::to_value(actions).ok(),
                    );
                }
            }
            Outcome::CodeLenses { id, lenses } => {
                if let Some(Pending::CodeLens { tsgo_fallback }) = self.pending.remove(&id) {
                    self.forward_tsgo_request_with_fallback(
                        tsgo_fallback,
                        serde_json::to_value(lenses).ok(),
                    );
                }
            }
            Outcome::ExtractedComponent { id, result } => {
                if !matches!(self.pending.remove(&id), Some(Pending::ExtractComponent)) {
                    return;
                }
                if let Some(message) = result.as_str() {
                    self.send(Notification::new(
                        "window/showMessage".to_string(),
                        serde_json::json!({ "type": 1, "message": message }),
                    ));
                    self.respond(Response::new_ok(id, serde_json::Value::Null));
                } else if self.client.apply_edit {
                    self.next_request_id += 1;
                    let apply_id =
                        RequestId::from(format!("rsvelte-apply-edit-{}", self.next_request_id));
                    self.outgoing
                        .insert(apply_id.clone(), Outgoing::ApplyEdit { command_id: id });
                    self.send(Request::new(
                        apply_id,
                        "workspace/applyEdit".to_string(),
                        serde_json::json!({ "edit": result }),
                    ));
                } else {
                    self.respond(Response::new_ok(id, serde_json::Value::Null));
                }
            }
            Outcome::FoldingRanges { id, ranges } => {
                if let Some(Pending::FoldingRange { tsgo_fallback }) = self.pending.remove(&id) {
                    self.forward_tsgo_request_with_fallback(
                        tsgo_fallback,
                        serde_json::to_value(ranges).ok(),
                    );
                }
            }
            Outcome::SelectionRanges { id, ranges } => {
                if self.pending.remove(&id).is_some() {
                    self.respond(Response::new_ok(id, ranges));
                }
            }
            Outcome::DocumentSymbols { id, symbols } => {
                if let Some(Pending::DocumentSymbol { tsgo_fallback }) = self.pending.remove(&id) {
                    self.forward_tsgo_request_with_fallback(
                        tsgo_fallback,
                        serde_json::to_value(symbols).ok(),
                    );
                }
            }
            Outcome::PulledDiagnostics {
                id,
                mut diagnostics,
            } => {
                if let Some(Pending::DocumentDiagnostic { tsgo_fallback }) =
                    self.pending.remove(&id)
                {
                    if let Some(uri) = text_document_request_uri(&tsgo_fallback)
                        && let Some((_, message)) = {
                            let path = uri_to_path(uri.as_str());
                            let path = fs::canonicalize(&path).unwrap_or(path);
                            self.preprocess_failures.get(&path)
                        }
                    {
                        diagnostics.push(crate::diagnostics::preprocess_failure(message));
                    }
                    self.forward_tsgo_request_with_fallback(
                        tsgo_fallback,
                        serde_json::to_value(diagnostic_report(diagnostics)).ok(),
                    );
                }
            }
            Outcome::FileReferences { id, locations } => {
                if matches!(self.pending.remove(&id), Some(Pending::FileReferences)) {
                    self.respond(Response::new_ok(id, locations));
                }
            }
            Outcome::Diagnostics {
                key,
                uri,
                version,
                mut diagnostics,
            } => {
                if self.documents.get_by_key(&key).is_some() {
                    if let Some((failed_version, message)) = {
                        let path = uri_to_path(uri.as_str());
                        let path = fs::canonicalize(&path).unwrap_or(path);
                        self.preprocess_failures.get(&path)
                    } && *failed_version == version
                    {
                        diagnostics.push(crate::diagnostics::preprocess_failure(message));
                    }
                    self.pull_and_publish_tsgo_diagnostics(uri, version, diagnostics);
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
                items: [
                    CONFIG_SECTION,
                    SVELTE_CONFIG_SECTION,
                    JS_TS_CONFIG_SECTION,
                    TYPESCRIPT_CONFIG_SECTION,
                    JAVASCRIPT_CONFIG_SECTION,
                    EDITOR_CONFIG_SECTION,
                ]
                .into_iter()
                .map(|section| ConfigurationItem {
                    scope_uri: None,
                    section: Some(section.to_string()),
                })
                .collect(),
            },
        ));
    }

    fn register_watched_files(&mut self) {
        self.next_request_id += 1;
        let id = RequestId::from(format!("rsvelte-watch-files-{}", self.next_request_id));
        self.outgoing
            .insert(id.clone(), Outgoing::WatchedFilesRegistration);
        self.send(Request::new(
            id,
            "client/registerCapability".to_string(),
            serde_json::json!({
                "registrations": [{
                    "id": "rsvelte-project-configs",
                    "method": "workspace/didChangeWatchedFiles",
                    "registerOptions": {
                        "watchers": project_config_names().iter().map(|name| serde_json::json!({
                            "globPattern": format!("**/{name}"),
                        })).collect::<Vec<_>>(),
                    },
                }],
            }),
        ));
    }

    fn schedule_lint(&mut self, key: String, delay: Duration) {
        self.scheduled.insert(key, Instant::now() + delay);
    }

    fn refresh_document_diagnostics(&mut self, key: String) {
        self.linted.remove(&key);
        if !self.client.pull_diagnostics {
            self.schedule_lint(key, Duration::ZERO);
            return;
        }
        if !self.client.diagnostic_refresh
            || self
                .outgoing
                .values()
                .any(|outgoing| matches!(outgoing, Outgoing::DiagnosticRefresh))
        {
            return;
        }
        self.next_request_id += 1;
        let id = RequestId::from(format!(
            "rsvelte-diagnostic-refresh-{}",
            self.next_request_id
        ));
        self.outgoing
            .insert(id.clone(), Outgoing::DiagnosticRefresh);
        self.send(Request::new(
            id,
            "workspace/diagnostic/refresh".to_string(),
            serde_json::Value::Null,
        ));
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
        let language_id = document.language_id.clone();
        let version = document.version;
        let hash = document.content_hash();
        // A burst of edits that cancel out leaves the text — and therefore the
        // diagnostics already on screen — unchanged.
        if self.linted.get(key) == Some(&hash) {
            return;
        }
        self.linted.insert(key.to_string(), hash);

        if !self.settings.lint_enable || !is_lint_target(document) {
            let path = uri_to_path(key);
            if is_svelte_document(&language_id, &path)
                || is_typescript_or_javascript(&language_id, &path)
            {
                self.pull_and_publish_tsgo_diagnostics(uri, version, Vec::new());
            } else {
                self.publish(uri, version, Vec::new());
            }
            return;
        }
        self.worker.submit(Job::Lint {
            key: key.to_string(),
            uri,
            version,
            path: uri_to_path(key),
            text: document.shared_text(),
            preprocessed: self.preprocessed_analysis(&uri_to_path(key), version),
            warnings: self.settings.compiler_warnings.clone(),
            svelte_diagnostics: self.settings.svelte.enable && self.settings.svelte.diagnostics,
            css_diagnostics: self.settings.css.enable && self.settings.css.diagnostics,
        });
    }

    fn preprocessed_analysis(&self, path: &Path, version: i32) -> Option<PreprocessedAnalysis> {
        let path = fs::canonicalize(path).unwrap_or_else(|_| path.to_path_buf());
        let state = self.preprocess_documents.get(&path)?;
        if state.version != version {
            return None;
        }
        Some(PreprocessedAnalysis {
            text: Arc::clone(&state.text),
            map: state.map.as_ref().map(Arc::clone),
            identity: state.identity,
        })
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
        self.respond(Response::new_ok(id, diagnostic_report(diagnostics)));
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

    fn respond_no_lenses(&self, id: RequestId) {
        self.respond(Response::new_ok(id, Vec::<CodeLens>::new()));
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

fn diagnostic_report(diagnostics: Vec<lsp_types::Diagnostic>) -> DocumentDiagnosticReport {
    DocumentDiagnosticReport::Full(RelatedFullDocumentDiagnosticReport {
        related_documents: None,
        full_document_diagnostic_report: FullDocumentDiagnosticReport {
            result_id: None,
            items: diagnostics,
        },
    })
}

fn inside_element_body(text: &str, offset: usize, tag: &str) -> bool {
    let before = text.get(..offset).unwrap_or(text);
    let open = before.rfind(&format!("<{tag}"));
    let close = before.rfind(&format!("</{tag}"));
    open > close && open.is_some_and(|start| before[start..].contains('>'))
}

fn rename_documents(overlays: &[TsgoOverlay]) -> Vec<RenameDocument<'_>> {
    let mut documents = Vec::new();
    for overlay in overlays {
        for shadow in overlay.eager_shadows() {
            let source_path = uri_to_path(shadow.source_uri.as_str());
            let Some(source_text) = overlay.source_text(&source_path) else {
                continue;
            };
            let Some(projection_map) = overlay.projection_map(&source_path) else {
                continue;
            };
            documents.push(RenameDocument {
                source_uri: &shadow.source_uri,
                shadow_uri: &shadow.shadow_uri,
                source_text,
                generated_text: &shadow.text,
                projection_map,
                source_map: overlay.source_map(&source_path),
                parser_error: false,
            });
        }
    }
    documents
}

fn custom_request_uri(params: &serde_json::Value) -> Option<Uri> {
    params
        .as_str()
        .or_else(|| params.get("uri").and_then(serde_json::Value::as_str))?
        .parse()
        .ok()
}

fn text_document_request_uri(request: &Request) -> Option<Uri> {
    request
        .params
        .pointer("/textDocument/uri")
        .cloned()
        .and_then(|uri| serde_json::from_value(uri).ok())
}

/// Svelte components plus the `.svelte.js` / `.svelte.ts` module dialect.
fn is_lint_target(document: &Document) -> bool {
    if document.language_id == "svelte" {
        return true;
    }
    let uri = document.uri.as_str();
    uri.ends_with(".svelte.js") || uri.ends_with(".svelte.ts")
}

fn is_svelte_document(language_id: &str, path: &Path) -> bool {
    language_id == "svelte"
        || path
            .extension()
            .is_some_and(|extension| extension == "svelte")
}

fn is_typescript_or_javascript(language_id: &str, path: &Path) -> bool {
    if matches!(
        language_id,
        "typescript" | "typescriptreact" | "javascript" | "javascriptreact"
    ) {
        return true;
    }
    path.extension().is_some_and(|extension| {
        matches!(
            extension.to_str(),
            Some("ts" | "tsx" | "mts" | "cts" | "js" | "jsx" | "mjs" | "cjs")
        )
    })
}

fn is_project_config(uri: &Uri) -> bool {
    project_config_names()
        .iter()
        .any(|name| uri.as_str().rsplit('/').next() == Some(name))
}

/// `FoldingRangeProvider.ts:54-56`: a client that folds by line has no use for a
/// range inside one line, and an inverted range is never emitted.
fn drop_degenerate_folding_ranges(result: &mut serde_json::Value, line_folding_only: bool) {
    let Some(ranges) = result.as_array_mut() else {
        return;
    };
    ranges.retain(|range| {
        let line = |key| range.get(key).and_then(serde_json::Value::as_u64);
        match (line("startLine"), line("endLine")) {
            (Some(start), Some(end)) if line_folding_only => start < end,
            (Some(start), Some(end)) => start <= end,
            _ => true,
        }
    });
}

/// `PluginHost.ts:287-293`: the word the cursor sits in, looking back at most
/// 20 UTF-16 units, lowercased. Nobody types an import name longer than that
/// and still expects perfect autocompletion.
fn incomplete_completion_filter(text: &str, position: &serde_json::Value) -> String {
    let Ok(position) = serde_json::from_value::<Position>(position.clone()) else {
        return String::new();
    };
    let offset = LineIndex::new(text).offset(text, position);
    let before = text.get(..offset).unwrap_or(text);
    let units = before.encode_utf16().collect::<Vec<_>>();
    let window = String::from_utf16_lossy(&units[units.len().saturating_sub(20)..]);
    let start = window
        .char_indices()
        .filter(|(_, character)| !(character.is_ascii_alphanumeric() || *character == '_'))
        .map(|(index, character)| index + character.len_utf8())
        .next_back()
        .unwrap_or(0);
    window[start..].to_lowercase()
}

/// `isInScript` (`plugins/typescript/utils.ts`): whether the cursor sits in an
/// instance or module `<script>` body.
fn position_is_in_script(text: &str, position: &serde_json::Value) -> bool {
    let Ok(position) = serde_json::from_value::<Position>(position.clone()) else {
        return false;
    };
    let offset = LineIndex::new(text).offset(text, position);
    crate::context::EmbeddedRegions::new(text).in_script(offset)
}

/// `CompletionProvider.ts:828-830`: with `checkCommitCharacters` off every item
/// answers `undefined`, so the field is absent rather than empty.
fn strip_commit_characters(result: &mut serde_json::Value) {
    let items = match result {
        serde_json::Value::Array(items) => items,
        other => {
            let Some(items) = other
                .get_mut("items")
                .and_then(serde_json::Value::as_array_mut)
            else {
                return;
            };
            items
        }
    };
    for item in items {
        if let Some(object) = item.as_object_mut() {
            object.remove("commitCharacters");
        }
    }
}

/// `CompletionProvider.ts:451` and `PluginHost.ts:286-297`: the list a rejected
/// document produces is incomplete, and the server narrows it itself because
/// not every editor filters client-side.
fn mark_completion_list_incomplete(result: &mut serde_json::Value, filter: Option<&str>) {
    if let Some(items) = result.as_array() {
        *result = serde_json::json!({ "isIncomplete": true, "items": items });
    }
    if let Some(object) = result.as_object_mut() {
        object.insert("isIncomplete".to_string(), serde_json::Value::Bool(true));
    }
    let Some(filter) = filter.filter(|filter| !filter.is_empty()) else {
        return;
    };
    if let Some(items) = result
        .get_mut("items")
        .and_then(serde_json::Value::as_array_mut)
    {
        items.retain(|item| {
            item.get("label")
                .and_then(serde_json::Value::as_str)
                .is_some_and(|label| label.to_lowercase().contains(filter))
        });
    }
}

fn merge_tsgo_result(method: &str, result: &mut serde_json::Value, fallback: serde_json::Value) {
    if result.is_null() {
        *result = fallback;
        return;
    }
    match method {
        "textDocument/completion" => {
            let mut fallback = fallback;
            // `PluginHost.ts:278-281` ORs the flag over every contributing
            // plugin; hardcoding it says the list is exhaustive when tsgo has
            // just said it is not.
            let incomplete = [&*result, &fallback].into_iter().any(|list| {
                list.get("isIncomplete")
                    .and_then(serde_json::Value::as_bool)
                    .unwrap_or(false)
            });
            let fallback_items = fallback
                .get_mut("items")
                .and_then(serde_json::Value::as_array_mut);
            let result_items = result
                .get_mut("items")
                .and_then(serde_json::Value::as_array_mut);
            if let (Some(fallback_items), Some(result_items)) = (fallback_items, result_items) {
                fallback_items.append(result_items);
                if let Some(object) = fallback.as_object_mut() {
                    object.insert(
                        "isIncomplete".to_string(),
                        serde_json::Value::Bool(incomplete),
                    );
                }
                *result = fallback;
            }
        }
        "textDocument/codeAction"
        | "textDocument/codeLens"
        | "textDocument/foldingRange"
        | "textDocument/documentSymbol" => {
            if let (Some(result_items), Some(mut fallback_items)) =
                (result.as_array_mut(), fallback.as_array().cloned())
            {
                fallback_items.append(result_items);
                *result = serde_json::Value::Array(fallback_items);
            }
        }
        "textDocument/diagnostic" => {
            let mut fallback = fallback;
            let fallback_items = fallback
                .get_mut("items")
                .and_then(serde_json::Value::as_array_mut);
            let result_items = result
                .get_mut("items")
                .and_then(serde_json::Value::as_array_mut);
            if let (Some(fallback_items), Some(result_items)) = (fallback_items, result_items) {
                fallback_items.append(result_items);
                *result = fallback;
            }
        }
        _ => {}
    }
}

/// The cache key for one completion site.
fn completion_data_key(uri: &str, position: &serde_json::Value) -> String {
    format!("{uri}|{position}")
}

fn completion_result_shape(result: &serde_json::Value) -> (usize, bool) {
    let items = result
        .get("items")
        .and_then(serde_json::Value::as_array)
        .or_else(|| result.as_array());
    let count = items.map_or(0, Vec::len);
    let first_is_member = items
        .and_then(|items| items.first())
        .and_then(|item| item.get("kind"))
        .and_then(serde_json::Value::as_u64)
        .is_some_and(|kind| matches!(kind, 5 | 10));
    (count, first_is_member)
}

fn locations_from_tsgo_result(result: &serde_json::Value) -> Vec<lsp_types::Location> {
    let Some(items) = result.as_array() else {
        return Vec::new();
    };
    items
        .iter()
        .filter_map(|item| {
            serde_json::from_value::<lsp_types::Location>(item.clone())
                .ok()
                .or_else(|| {
                    let uri = item
                        .get("targetUri")
                        .cloned()
                        .and_then(|uri| serde_json::from_value(uri).ok())?;
                    let range = item
                        .get("targetSelectionRange")
                        .or_else(|| item.get("targetRange"))
                        .cloned()
                        .and_then(|range| serde_json::from_value(range).ok())?;
                    Some(lsp_types::Location { uri, range })
                })
        })
        .collect()
}

fn append_component_completions(
    result: &mut serde_json::Value,
    manual: Vec<lsp_types::CompletionItem>,
    replace: bool,
) {
    let manual = manual
        .into_iter()
        .filter_map(|item| serde_json::to_value(item).ok())
        .collect::<Vec<_>>();
    if replace {
        *result = serde_json::json!({ "isIncomplete": false, "items": manual });
        return;
    }
    if let Some(items) = result
        .get_mut("items")
        .and_then(serde_json::Value::as_array_mut)
    {
        items.splice(0..0, manual);
    } else if let Some(items) = result.as_array_mut() {
        items.splice(0..0, manual);
    } else {
        *result = serde_json::json!({ "isIncomplete": false, "items": manual });
    }
}

fn code_action_diagnostic_codes(request: &Request) -> Vec<u32> {
    if request.method != "textDocument/codeAction" {
        return Vec::new();
    }
    request
        .params
        .pointer("/context/diagnostics")
        .and_then(serde_json::Value::as_array)
        .into_iter()
        .flatten()
        .filter_map(|diagnostic| {
            let code = diagnostic.get("code")?;
            code.as_u64()
                .and_then(|code| u32::try_from(code).ok())
                .or_else(|| code.as_str()?.trim_start_matches("TS").parse::<u32>().ok())
        })
        .collect()
}

const fn project_config_names() -> &'static [&'static str] {
    &[
        "rsvelte-lint.json",
        ".rsvelte-lintrc.json",
        ".oxfmtrc.json",
        ".oxfmtrc.jsonc",
        "oxfmt.config.ts",
        "oxfmt.config.mts",
        "tsconfig.json",
        "jsconfig.json",
        "svelte.config.js",
        "svelte.config.mjs",
        "svelte.config.cjs",
        "svelte.config.ts",
        "svelte.config.mts",
        "vite.config.js",
        "vite.config.mjs",
        "vite.config.cjs",
        "vite.config.ts",
        "vite.config.mts",
    ]
}

/// Whether a start tag opens a block the Svelte parser hoists out of the
/// template rather than keeping as an element.
fn is_embedded_tag(tag: &str) -> bool {
    tag.eq_ignore_ascii_case("script") || tag.eq_ignore_ascii_case("style")
}

/// `CompletionProvider.ts:497-501`, which tests `/\s[\s>/]/` against the two
/// characters straddling the cursor — narrower than "nothing typed yet".
fn might_be_at_start_tag_whitespace(text: &str, offset: usize) -> bool {
    let before = text.get(..offset).and_then(|text| text.chars().next_back());
    let at = text.get(offset..).and_then(|text| text.chars().next());
    before.is_some_and(char::is_whitespace)
        && at.is_some_and(|character| character.is_whitespace() || matches!(character, '>' | '/'))
}

#[cfg(test)]
mod folding_tests {
    use super::drop_degenerate_folding_ranges;

    fn kept(line_folding_only: bool) -> Vec<u64> {
        let mut result = serde_json::json!([
            { "startLine": 0, "endLine": 3 },
            { "startLine": 1, "endLine": 1 },
            { "startLine": 5, "endLine": 4 },
            { "startLine": 6 }
        ]);
        drop_degenerate_folding_ranges(&mut result, line_folding_only);
        result
            .as_array()
            .unwrap()
            .iter()
            .map(|range| range["startLine"].as_u64().unwrap())
            .collect()
    }

    /// `FoldingRangeProvider.ts:54-56` keeps a single-line range only when the
    /// client folds by character; an inverted range is dropped either way, and a
    /// range with no `endLine` is not this filter's business.
    #[test]
    fn a_single_line_range_survives_only_a_character_folding_client() {
        assert_eq!(kept(true), [0, 6]);
        assert_eq!(kept(false), [0, 1, 6]);
    }
}

#[cfg(test)]
mod start_tag_tests {
    use super::might_be_at_start_tag_whitespace;

    fn at(text: &str, needle: &str) -> bool {
        might_be_at_start_tag_whitespace(text, text.find(needle).unwrap() + needle.len())
    }

    #[test]
    fn only_whitespace_before_an_empty_slot_counts() {
        assert!(at("<Comp >", "<Comp "));
        assert!(at("<Comp />", "<Comp "));
        assert!(at("<Comp  a>", "<Comp "));
        // A name is being typed, so the slot is not empty.
        assert!(!at("<Comp a>", "<Comp "));
        // Nothing before the cursor is whitespace.
        assert!(!at("<Comp a >", "<Comp a"));
    }
}

#[cfg(test)]
mod merge_tsgo_result_tests {
    use super::merge_tsgo_result;
    use serde_json::json;

    fn merged_is_incomplete(tsgo: bool, ours: bool) -> bool {
        let mut result = json!({ "isIncomplete": tsgo, "items": [{ "label": "a" }] });
        merge_tsgo_result(
            "textDocument/completion",
            &mut result,
            json!({ "isIncomplete": ours, "items": [{ "label": "b" }] }),
        );
        assert_eq!(result["items"].as_array().unwrap().len(), 2);
        result["isIncomplete"].as_bool().unwrap()
    }

    // `PluginHost.ts:278-281` ORs the flag over the contributing plugins, so a
    // constant — in either direction — is wrong on one of these four rows.
    #[test]
    fn is_incomplete_is_ored_over_both_contributors() {
        assert!(!merged_is_incomplete(false, false));
        assert!(merged_is_incomplete(true, false));
        assert!(merged_is_incomplete(false, true));
        assert!(merged_is_incomplete(true, true));
    }
}
