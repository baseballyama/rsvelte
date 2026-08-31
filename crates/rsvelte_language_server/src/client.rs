//! What the server keeps from `initialize`.

use lsp_types::{ClientInfo, PositionEncodingKind, Uri, WorkspaceFolder};
use serde::de::DeserializeOwned;
use serde_json::Value;

/// The `initialize` payload the server retains.
///
/// A client sends these once, while later features consume them for
/// workspace-relative configuration and `tsconfig` lookup.
///
/// Every field is read independently rather than through one
/// `InitializeParams` deserialization: a single value this build happens to
/// reject — a `rootUri` the URI parser refuses, an unknown `trace` — must not
/// cost us the rest of the payload, and must never leave the client waiting
/// for a response that never comes.
#[derive(Debug, Default)]
pub struct ClientState {
    pub root_uri: Option<Uri>,
    pub workspace_folders: Vec<WorkspaceFolder>,
    pub client_info: Option<ClientInfo>,
    pub position_encodings: Vec<PositionEncodingKind>,
    /// Whether the client answers `workspace/configuration`.
    pub pull_configuration: bool,
    /// `server.ts:191`: whether an incomplete completion list is narrowed here
    /// rather than left to the editor.
    pub filter_incomplete_completions: bool,
    /// Whether the client accepts `workspace/applyEdit` requests.
    pub apply_edit: bool,
    /// The one plugin setting upstream fixes into capabilities at initialize.
    pub document_highlight: bool,
    /// Whether the client folds whole lines only, and so cannot use the
    /// characters a folding range carries.
    pub line_folding_only: bool,
    /// Whether the client understands a tree of document symbols rather than a
    /// flat list.
    pub hierarchical_document_symbols: bool,
    /// Whether the client issues `textDocument/prepareRename`.
    pub rename_prepare: bool,
    /// Whether the client supports LSP 3.17 pull diagnostics.
    pub pull_diagnostics: bool,
    /// Whether the client accepts `workspace/diagnostic/refresh` requests.
    pub diagnostic_refresh: bool,
    /// Whether the client accepts dynamic watched-file registrations.
    pub dynamic_watched_files: bool,
    /// Semantic token types the client advertised, in client order.
    pub semantic_token_types: Vec<String>,
    /// Semantic token modifiers the client advertised, in client order.
    pub semantic_token_modifiers: Vec<String>,
    /// Whether project JavaScript such as `svelte.config.js` may be executed.
    pub is_trusted: bool,
    /// `HTMLCompletion.doesSupportMarkdown` (`htmlCompletion.js:554-563`): the
    /// documentation a completion item carries is Markdown only where the
    /// client asked for it, and plain text otherwise.
    pub markdown_documentation: bool,
    /// `HTMLHover.doesSupportMarkdown` (`htmlHover.js:242-251`): the same
    /// question asked of a different capability, so a client may answer the two
    /// differently.
    pub markdown_hover: bool,
}

impl ClientState {
    #[must_use]
    pub fn from_initialize(params: &Value) -> Self {
        Self {
            root_uri: field(params.get("rootUri")),
            workspace_folders: field(params.get("workspaceFolders")).unwrap_or_default(),
            client_info: field(params.get("clientInfo")),
            position_encodings: field(params.pointer("/capabilities/general/positionEncodings"))
                .unwrap_or_default(),
            pull_configuration: flag(params, "/capabilities/workspace/configuration"),
            apply_edit: flag(params, "/capabilities/workspace/applyEdit"),
            document_highlight: params
                .pointer(
                    "/initializationOptions/configuration/svelte/plugin/svelte/documentHighlight/enable",
                )
                .and_then(Value::as_bool)
                .unwrap_or(true),
            line_folding_only: flag(
                params,
                "/capabilities/textDocument/foldingRange/lineFoldingOnly",
            ),
            hierarchical_document_symbols: flag(
                params,
                "/capabilities/textDocument/documentSymbol/hierarchicalDocumentSymbolSupport",
            ),
            rename_prepare: flag(params, "/capabilities/textDocument/rename/prepareSupport"),
            pull_diagnostics: params
                .pointer("/capabilities/textDocument/diagnostic")
                .is_some(),
            diagnostic_refresh: flag(params, "/capabilities/workspace/diagnostics/refreshSupport"),
            dynamic_watched_files: flag(
                params,
                "/capabilities/workspace/didChangeWatchedFiles/dynamicRegistration",
            ),
            semantic_token_types: field(
                params.pointer("/capabilities/textDocument/semanticTokens/tokenTypes"),
            )
            .unwrap_or_default(),
            semantic_token_modifiers: field(
                params.pointer("/capabilities/textDocument/semanticTokens/tokenModifiers"),
            )
            .unwrap_or_default(),
            filter_incomplete_completions: !params
                .pointer("/initializationOptions/dontFilterIncompleteCompletions")
                .and_then(Value::as_bool)
                .unwrap_or(false),
            is_trusted: params
                .pointer("/initializationOptions/isTrusted")
                .and_then(Value::as_bool)
                .unwrap_or(true),
            markdown_documentation: params.get("capabilities").is_none_or(|_| {
                params
                    .pointer("/capabilities/textDocument/completion/completionItem/documentationFormat")
                    .and_then(Value::as_array)
                    .is_some_and(|formats| formats.iter().any(|format| format == "markdown"))
            }),
            markdown_hover: params.get("capabilities").is_none_or(|_| {
                params
                    .pointer("/capabilities/textDocument/hover/contentFormat")
                    .and_then(Value::as_array)
                    .is_some_and(|formats| formats.iter().any(|format| format == "markdown"))
            }),
        }
    }

    /// Apply the LSP workspace-folder delta, preserving the client order for
    /// all folders that remain.
    pub fn update_workspace_folders(
        &mut self,
        added: Vec<WorkspaceFolder>,
        removed: &[WorkspaceFolder],
    ) {
        self.workspace_folders
            .retain(|folder| !removed.iter().any(|removed| removed.uri == folder.uri));
        for folder in added {
            if !self
                .workspace_folders
                .iter()
                .any(|current| current.uri == folder.uri)
            {
                self.workspace_folders.push(folder);
            }
        }
    }
}

fn flag(params: &Value, pointer: &str) -> bool {
    params
        .pointer(pointer)
        .and_then(Value::as_bool)
        .unwrap_or(false)
}

fn field<T: DeserializeOwned>(value: Option<&Value>) -> Option<T> {
    serde_json::from_value(value?.clone()).ok()
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    /// Completion and hover ask the same question of two different
    /// capabilities, so a client may answer them differently.
    #[test]
    fn the_two_markdown_capabilities_are_read_separately() {
        let state =
            |capabilities| ClientState::from_initialize(&json!({ "capabilities": capabilities }));
        let both = state(json!({ "textDocument": {
            "completion": { "completionItem": { "documentationFormat": ["markdown"] } },
            "hover": { "contentFormat": ["markdown"] },
        }}));
        assert!(both.markdown_documentation && both.markdown_hover);
        let completion_only = state(json!({ "textDocument": {
            "completion": { "completionItem": { "documentationFormat": ["markdown"] } },
        }}));
        assert!(completion_only.markdown_documentation && !completion_only.markdown_hover);
        let hover_only =
            state(json!({ "textDocument": { "hover": { "contentFormat": ["markdown"] } } }));
        assert!(!hover_only.markdown_documentation && hover_only.markdown_hover);
        assert!(!state(json!({})).markdown_hover);
        // No `capabilities` at all is upstream's "assume markdown" arm.
        let absent = ClientState::from_initialize(&json!({}));
        assert!(absent.markdown_documentation && absent.markdown_hover);
    }

    #[test]
    fn reads_the_fields_the_server_keeps() {
        let state = ClientState::from_initialize(&json!({
            "rootUri": "file:///home/u/app",
            "workspaceFolders": [{ "uri": "file:///home/u/app", "name": "app" }],
            "clientInfo": { "name": "Visual Studio Code", "version": "1.99.0" },
            "initializationOptions": {
                "isTrusted": false,
                "configuration": { "svelte": { "plugin": { "svelte": {
                    "documentHighlight": { "enable": false }
                }}}}
            },
            "capabilities": {
                "workspace": {
                    "configuration": true,
                    "didChangeWatchedFiles": { "dynamicRegistration": true },
                    "diagnostics": { "refreshSupport": true },
                },
                "general": { "positionEncodings": ["utf-16"] },
                "textDocument": {
                    "foldingRange": { "lineFoldingOnly": true },
                    "documentSymbol": { "hierarchicalDocumentSymbolSupport": true },
                    "semanticTokens": {
                        "tokenTypes": ["namespace", "class"],
                        "tokenModifiers": ["declaration", "readonly"]
                    },
                },
            },
        }));
        assert_eq!(
            state.root_uri.as_ref().map(|u| u.as_str()),
            Some("file:///home/u/app")
        );
        assert_eq!(state.workspace_folders.len(), 1);
        assert_eq!(
            state.client_info.as_ref().map(|c| c.name.as_str()),
            Some("Visual Studio Code")
        );
        assert_eq!(state.position_encodings.len(), 1);
        assert!(state.pull_configuration);
        assert!(!state.apply_edit);
        assert!(!state.document_highlight);
        assert!(state.line_folding_only);
        assert!(state.hierarchical_document_symbols);
        assert!(!state.pull_diagnostics);
        assert!(state.diagnostic_refresh);
        assert!(state.dynamic_watched_files);
        assert_eq!(state.semantic_token_types, ["namespace", "class"]);
        assert_eq!(state.semantic_token_modifiers, ["declaration", "readonly"]);
        assert!(!state.is_trusted);
    }

    #[test]
    fn structure_capabilities_default_to_off() {
        let state = ClientState::from_initialize(&json!({
            "capabilities": { "textDocument": { "foldingRange": {} } },
        }));
        assert!(!state.line_folding_only);
        assert!(!state.apply_edit);
        assert!(state.document_highlight);
        assert!(!state.hierarchical_document_symbols);
        assert!(!state.pull_diagnostics);
        assert!(!state.diagnostic_refresh);
        assert!(!state.dynamic_watched_files);
        assert!(state.is_trusted);
    }

    #[test]
    fn one_unparsable_field_does_not_cost_the_others() {
        // A `rootUri` this URI parser rejects, and a `trace` outside the enum.
        let state = ClientState::from_initialize(&json!({
            "rootUri": "not a uri",
            "trace": "bogus",
            "capabilities": { "workspace": { "configuration": true } },
        }));
        assert!(state.root_uri.is_none());
        assert!(state.pull_configuration);
    }

    #[test]
    fn an_empty_payload_yields_defaults() {
        let state = ClientState::from_initialize(&json!({}));
        assert!(state.root_uri.is_none());
        assert!(state.workspace_folders.is_empty());
        assert!(!state.pull_configuration);
        assert_eq!(ClientState::from_initialize(&Value::Null).root_uri, None);
    }

    #[test]
    fn updates_workspace_folders_from_lsp_deltas() {
        let mut state = ClientState::from_initialize(&json!({
            "workspaceFolders": [
                { "uri": "file:///workspace/a", "name": "a" },
                { "uri": "file:///workspace/b", "name": "b" },
            ],
        }));
        let added: Vec<WorkspaceFolder> = serde_json::from_value(json!([
            { "uri": "file:///workspace/c", "name": "c" },
            { "uri": "file:///workspace/a", "name": "duplicate" },
        ]))
        .unwrap();
        let removed: Vec<WorkspaceFolder> = serde_json::from_value(json!([
            { "uri": "file:///workspace/b", "name": "b" },
        ]))
        .unwrap();
        state.update_workspace_folders(added, &removed);
        assert_eq!(
            state
                .workspace_folders
                .iter()
                .map(|folder| folder.uri.as_str())
                .collect::<Vec<_>>(),
            ["file:///workspace/a", "file:///workspace/c"]
        );
    }
}
