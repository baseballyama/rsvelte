//! The editor features that read a component's markup, such as folding and symbols, on the editor's
//! text of each open component.

use std::collections::HashMap;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex, PoisonError};

use rsvelte_kernel::source::positions::LineIndex;
use rsvelte_svelte_editor::folding::{self, FoldingKind};
use rsvelte_svelte_editor::symbols::{self, Symbol};
use rsvelte_svelte_syntax::syntax_tree::Component;
use tower_lsp_server::LanguageServer;
use tower_lsp_server::gen_lsp_types::{
    BaseSymbolInformation, DidChangeTextDocumentParams, DidCloseTextDocumentParams,
    DidOpenTextDocumentParams, DocumentSymbol, DocumentSymbolParams, DocumentSymbolResponse,
    FoldingRange, FoldingRangeKind, FoldingRangeParams, InitializeParams, InitializeResult,
    Location, ServerCapabilities, SymbolInformation, SymbolKind, TextDocumentContentChangeEvent,
    Uri,
};
use tower_lsp_server::jsonrpc::Result;

/// The requests this server answers, on components alone.
pub(super) const METHODS: &[&str] = &["textDocument/foldingRange", "textDocument/documentSymbol"];

/// The capabilities that tell the editor the server answers [`METHODS`].
pub(super) const CAPABILITIES: &[&str] = &["foldingRangeProvider", "documentSymbolProvider"];

#[derive(Default)]
pub(super) struct Svelte {
    /// The editor's text of each open document.
    open: Mutex<HashMap<Uri, Arc<str>>>,
    /// The editor shows symbols in the symbols they are in, rather than in a list.
    nested_symbols: AtomicBool,
}

impl Svelte {
    fn edited(&self, uri: Uri, text: Option<String>) {
        let mut open = self.open.lock().unwrap_or_else(PoisonError::into_inner);
        match text {
            Some(text) => open.insert(uri, text.into()),
            None => open.remove(&uri),
        };
    }

    /// What `read` makes of the open component `uri`; `None` where it is not open or does not
    /// parse, until it parses again.
    fn answer<T>(&self, uri: &Uri, read: impl FnOnce(&Component, &str) -> T) -> Option<T> {
        let text = (self.open.lock().unwrap_or_else(PoisonError::into_inner))
            .get(uri)
            .cloned()?;
        let component =
            rsvelte_svelte_syntax::parse::parse_reading_scripts_as_typescript(&text).ok()?;
        Some(read(&component, &text))
    }
}

impl LanguageServer for Svelte {
    fn initialize(
        &self,
        InitializeParams { capabilities, .. }: InitializeParams,
    ) -> impl Future<Output = Result<InitializeResult>> + Send {
        let nested = (capabilities
            .text_document
            .and_then(|text| text.document_symbol))
        .and_then(|symbols| symbols.hierarchical_document_symbol_support);
        self.nested_symbols
            .store(nested == Some(true), Ordering::Relaxed);
        std::future::ready(Ok(InitializeResult {
            capabilities: ServerCapabilities {
                folding_range_provider: Some(true.into()),
                document_symbol_provider: Some(true.into()),
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
        let folds = self.answer(&text_document.uri, |component, text| {
            let ranges = folding::folding_ranges(component, text).into_iter();
            ranges.map(range).collect()
        });
        std::future::ready(Ok(folds))
    }

    fn document_symbol(
        &self,
        DocumentSymbolParams { text_document, .. }: DocumentSymbolParams,
    ) -> impl Future<Output = Result<Option<DocumentSymbolResponse>>> + Send {
        let nested = self.nested_symbols.load(Ordering::Relaxed);
        let uri = &text_document.uri;
        let symbols = self.answer(uri, |component, text| {
            let symbols = symbols::symbols(component, text);
            let lines = super::convert::lines(text);
            if nested {
                DocumentSymbolResponse::from(nest(&lines, symbols))
            } else {
                let mut listed = Vec::new();
                list(&lines, uri, symbols, None, &mut listed);
                DocumentSymbolResponse::from(listed)
            }
        });
        std::future::ready(Ok(symbols))
    }
}

/// `symbols` with the symbols in each, as fields, the kind the official server gives elements.
fn nest(lines: &LineIndex, symbols: Vec<Symbol>) -> Vec<DocumentSymbol> {
    (symbols.into_iter())
        .map(
            |Symbol {
                 name,
                 span,
                 children,
             }| {
                let range = super::convert::range(lines, span);
                DocumentSymbol::new(
                    name,
                    None,
                    SymbolKind::Field,
                    None,
                    None,
                    range,
                    range,
                    (!children.is_empty()).then(|| nest(lines, children)),
                )
            },
        )
        .collect()
}

/// `symbols` and the symbols in them, each after the one it is in, which names it.
fn list(
    lines: &LineIndex,
    uri: &Uri,
    symbols: Vec<Symbol>,
    container: Option<&str>,
    listed: &mut Vec<SymbolInformation>,
) {
    for Symbol {
        name,
        span,
        children,
    } in symbols
    {
        let location = Location::new(uri.clone(), super::convert::range(lines, span));
        let base = BaseSymbolInformation::new(
            name.clone(),
            SymbolKind::Field,
            None,
            Some(container.unwrap_or_default().to_owned()),
        );
        listed.push(SymbolInformation::new(None, location, base));
        list(lines, uri, children, Some(&name), listed);
    }
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

#[cfg(test)]
mod tests;
