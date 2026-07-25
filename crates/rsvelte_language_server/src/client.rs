//! What the server keeps from `initialize`.

use lsp_types::{ClientInfo, PositionEncodingKind, Uri, WorkspaceFolder};
use serde::de::DeserializeOwned;
use serde_json::Value;

/// The `initialize` payload the server holds on to. A client sends these once
/// and never again, so they are captured here even though the features that
/// consume them (workspace-relative config discovery, tsconfig lookup) land in
/// later milestones.
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
}

impl ClientState {
    pub fn from_initialize(params: &Value) -> Self {
        Self {
            root_uri: field(params.get("rootUri")),
            workspace_folders: field(params.get("workspaceFolders")).unwrap_or_default(),
            client_info: field(params.get("clientInfo")),
            position_encodings: field(params.pointer("/capabilities/general/positionEncodings"))
                .unwrap_or_default(),
            pull_configuration: params
                .pointer("/capabilities/workspace/configuration")
                .and_then(Value::as_bool)
                .unwrap_or(false),
        }
    }
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
                "workspace": { "configuration": true },
                "general": { "positionEncodings": ["utf-16"] },
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
}
