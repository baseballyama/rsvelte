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
    /// Whether the client folds whole lines only, and so cannot use the
    /// characters a folding range carries.
    pub line_folding_only: bool,
    /// Whether the client understands a tree of document symbols rather than a
    /// flat list.
    pub hierarchical_document_symbols: bool,
    /// Whether the client supports LSP 3.17 pull diagnostics.
    pub pull_diagnostics: bool,
    /// Whether the client accepts dynamic watched-file registrations.
    pub dynamic_watched_files: bool,
    /// Semantic token types the client advertised, in client order.
    pub semantic_token_types: Vec<String>,
    /// Semantic token modifiers the client advertised, in client order.
    pub semantic_token_modifiers: Vec<String>,
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
            line_folding_only: flag(
                params,
                "/capabilities/textDocument/foldingRange/lineFoldingOnly",
            ),
            hierarchical_document_symbols: flag(
                params,
                "/capabilities/textDocument/documentSymbol/hierarchicalDocumentSymbolSupport",
            ),
            pull_diagnostics: params
                .pointer("/capabilities/textDocument/diagnostic")
                .is_some(),
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

    #[test]
    fn reads_the_fields_the_server_keeps() {
        let state = ClientState::from_initialize(&json!({
            "rootUri": "file:///home/u/app",
            "workspaceFolders": [{ "uri": "file:///home/u/app", "name": "app" }],
            "clientInfo": { "name": "Visual Studio Code", "version": "1.99.0" },
            "capabilities": {
                "workspace": {
                    "configuration": true,
                    "didChangeWatchedFiles": { "dynamicRegistration": true },
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
        assert!(state.line_folding_only);
        assert!(state.hierarchical_document_symbols);
        assert!(!state.pull_diagnostics);
        assert!(state.dynamic_watched_files);
        assert_eq!(state.semantic_token_types, ["namespace", "class"]);
        assert_eq!(state.semantic_token_modifiers, ["declaration", "readonly"]);
    }

    #[test]
    fn structure_capabilities_default_to_off() {
        let state = ClientState::from_initialize(&json!({
            "capabilities": { "textDocument": { "foldingRange": {} } },
        }));
        assert!(!state.line_folding_only);
        assert!(!state.hierarchical_document_symbols);
        assert!(!state.pull_diagnostics);
        assert!(!state.dynamic_watched_files);
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
