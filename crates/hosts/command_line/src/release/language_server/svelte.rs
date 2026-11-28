//! The editor features that read a component's markup, on the editor's text of each open
//! component.

use std::collections::HashMap;
use std::sync::{Arc, Mutex, PoisonError};

use rsvelte_svelte_editor::folding::{self, FoldingKind};
use tower_lsp_server::LanguageServer;
use tower_lsp_server::gen_lsp_types::{
    DidChangeTextDocumentParams, DidCloseTextDocumentParams, DidOpenTextDocumentParams,
    FoldingRange, FoldingRangeKind, FoldingRangeParams, InitializeParams, InitializeResult,
    ServerCapabilities, TextDocumentContentChangeEvent, Uri,
};
use tower_lsp_server::jsonrpc::Result;

/// The requests this server answers, on components alone.
pub(super) const METHODS: &[&str] = &["textDocument/foldingRange"];

/// The capabilities that tell the editor the server answers [`METHODS`].
pub(super) const CAPABILITIES: &[&str] = &["foldingRangeProvider"];

#[derive(Default)]
pub(super) struct Svelte {
    /// The editor's text of each open document.
    open: Mutex<HashMap<Uri, Arc<str>>>,
}

impl Svelte {
    fn edited(&self, uri: Uri, text: Option<String>) {
        let mut open = self.open.lock().unwrap_or_else(PoisonError::into_inner);
        match text {
            Some(text) => open.insert(uri, text.into()),
            None => open.remove(&uri),
        };
    }
}

impl LanguageServer for Svelte {
    fn initialize(
        &self,
        _: InitializeParams,
    ) -> impl Future<Output = Result<InitializeResult>> + Send {
        std::future::ready(Ok(InitializeResult {
            capabilities: ServerCapabilities {
                folding_range_provider: Some(true.into()),
                ..ServerCapabilities::default()
            },
            ..InitializeResult::default()
        }))
    }

    fn shutdown(&self) -> impl Future<Output = Result<()>> + Send {
        std::future::ready(Ok(()))
    }

    async fn did_open(
        &self,
        DidOpenTextDocumentParams { text_document }: DidOpenTextDocumentParams,
    ) {
        self.edited(text_document.uri, Some(text_document.text));
    }

    fn did_change(
        &self,
        DidChangeTextDocumentParams {
            text_document,
            content_changes,
        }: DidChangeTextDocumentParams,
    ) -> impl Future<Output = ()> + Send {
        // The lint takes the whole text on each change, so the editor sends it whole.
        if let Some(TextDocumentContentChangeEvent::TextDocumentContentChangeWholeDocument(
            change,
        )) = content_changes.into_iter().last()
        {
            self.edited(
                text_document.text_document_identifier.uri,
                Some(change.text),
            );
        }
        std::future::ready(())
    }

    async fn did_close(
        &self,
        DidCloseTextDocumentParams { text_document }: DidCloseTextDocumentParams,
    ) {
        self.edited(text_document.uri, None);
    }

    fn folding_range(
        &self,
        FoldingRangeParams { text_document, .. }: FoldingRangeParams,
    ) -> impl Future<Output = Result<Option<Vec<FoldingRange>>>> + Send {
        let text = (self.open.lock().unwrap_or_else(PoisonError::into_inner))
            .get(&text_document.uri)
            .cloned();
        std::future::ready(Ok(text.and_then(|text| folds(&text))))
    }
}

/// Where `text` folds; `None` where it does not parse, until it parses again.
fn folds(text: &str) -> Option<Vec<FoldingRange>> {
    let component = rsvelte_svelte_syntax::parse::parse_reading_scripts_as_typescript(text).ok()?;
    let ranges = folding::folding_ranges(&component, text).into_iter();
    Some(ranges.map(range).collect())
}

/// `folded` as the protocol's range, which folds whole lines, as every editor can.
fn range(folded: folding::FoldingRange) -> FoldingRange {
    FoldingRange {
        start_line: folded.start_line,
        start_character: None,
        end_line: folded.end_line,
        end_character: None,
        kind: folded.kind.map(|kind| match kind {
            FoldingKind::Comment => FoldingRangeKind::Comment,
            FoldingKind::Region => FoldingRangeKind::Region,
        }),
        collapsed_text: None,
    }
}
