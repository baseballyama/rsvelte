//! The analysis worker.
//!
//! Linting and formatting run the Svelte compiler, which recurses once per
//! level of nested markup. Two hazards follow, and both are contained here
//! rather than on the message loop, which would take the whole session down
//! with it: deeply nested input needs far more stack than a thread is given by
//! default, and a rule that panics must cost at most its own document. This is
//! the same isolation contract `rsvelte-lint`'s CLI applies per file.
//!
//! The resolved-config caches live here too, so the loop never touches the
//! filesystem.

use std::panic::{AssertUnwindSafe, catch_unwind};
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::thread::JoinHandle;

use crossbeam_channel::{Receiver, Sender, unbounded};
use lsp_server::RequestId;
use lsp_types::{
    CodeActionOrCommand, CodeLens, CompletionList, Diagnostic, DocumentSymbolResponse,
    FoldingRange, Hover, Range, SelectionRange, TextEdit, Uri,
};
use serde_json::Value;

use crate::format::FormatSessions;
use crate::lint::LintConfigCache;
use crate::log;
use crate::settings::CompilerWarnings;

/// `rsvelte_core`'s own deeply-nested-AST tests reserve the same 256 MiB. It is
/// address space, not resident memory — pages are committed only as the
/// recursion actually reaches them.
const STACK_SIZE: usize = 256 * 1024 * 1024;

pub enum Job {
    Lint {
        key: String,
        uri: Uri,
        version: i32,
        path: PathBuf,
        text: Arc<String>,
        warnings: CompilerWarnings,
    },
    Format {
        id: RequestId,
        path: PathBuf,
        text: Arc<String>,
        range: Range,
    },
    Complete {
        id: RequestId,
        path: PathBuf,
        text: Arc<String>,
        offset: usize,
    },
    Hover {
        id: RequestId,
        path: PathBuf,
        text: Arc<String>,
        offset: usize,
    },
    CodeAction {
        id: RequestId,
        uri: Uri,
        path: PathBuf,
        text: Arc<String>,
        diagnostics: Vec<Diagnostic>,
        quickfix: bool,
        suggestions: bool,
        fix_all: bool,
    },
    CodeLens {
        id: RequestId,
        path: PathBuf,
        text: Arc<String>,
    },
    ExtractComponent {
        id: RequestId,
        uri: Uri,
        text: Arc<String>,
        range: Range,
        file_path: String,
    },
    FoldingRange {
        id: RequestId,
        path: PathBuf,
        text: Arc<String>,
        line_folding_only: bool,
    },
    SelectionRange {
        id: RequestId,
        path: PathBuf,
        text: Arc<String>,
        offsets: Vec<usize>,
    },
    DocumentSymbol {
        id: RequestId,
        uri: Uri,
        path: PathBuf,
        text: Arc<String>,
        hierarchical: bool,
    },
    PullDiagnostics {
        id: RequestId,
        path: PathBuf,
        text: Arc<String>,
        warnings: CompilerWarnings,
    },
    /// Drop the resolved `rsvelte-lint.json` / `.oxfmtrc` caches so the next
    /// job re-reads them from disk.
    ClearCaches,
}

pub enum Outcome {
    Diagnostics {
        key: String,
        uri: Uri,
        version: i32,
        diagnostics: Vec<Diagnostic>,
    },
    Formatted {
        id: RequestId,
        edits: Vec<TextEdit>,
    },
    Completed {
        id: RequestId,
        list: Option<CompletionList>,
    },
    Hovered {
        id: RequestId,
        hover: Option<Hover>,
    },
    CodeActions {
        id: RequestId,
        actions: Vec<CodeActionOrCommand>,
    },
    CodeLenses {
        id: RequestId,
        lenses: Vec<CodeLens>,
    },
    ExtractedComponent {
        id: RequestId,
        result: Value,
    },
    FoldingRanges {
        id: RequestId,
        ranges: Vec<FoldingRange>,
    },
    SelectionRanges {
        id: RequestId,
        ranges: Option<Vec<SelectionRange>>,
    },
    DocumentSymbols {
        id: RequestId,
        symbols: DocumentSymbolResponse,
    },
    PulledDiagnostics {
        id: RequestId,
        diagnostics: Vec<Diagnostic>,
    },
}

pub struct Worker {
    jobs: Option<Sender<Job>>,
    handle: Option<JoinHandle<()>>,
}

impl Worker {
    /// # Panics
    ///
    /// Panics if the analysis worker thread cannot be spawned.
    #[must_use]
    pub fn spawn(outcomes: Sender<Outcome>) -> Self {
        let (jobs, receiver) = unbounded();
        let handle = std::thread::Builder::new()
            .name("rsvelte-analysis".to_string())
            .stack_size(STACK_SIZE)
            .spawn(move || run(&receiver, &outcomes))
            .expect("spawn the analysis worker");
        Self {
            jobs: Some(jobs),
            handle: Some(handle),
        }
    }

    pub fn submit(&self, job: Job) {
        if let Some(jobs) = &self.jobs {
            let _ = jobs.send(job);
        }
    }
}

impl Drop for Worker {
    fn drop(&mut self) {
        // Closing the queue is what ends the loop; only then can the thread be
        // joined.
        self.jobs.take();
        if let Some(handle) = self.handle.take() {
            let _ = handle.join();
        }
    }
}

fn run(jobs: &Receiver<Job>, outcomes: &Sender<Outcome>) {
    let mut lint_configs = LintConfigCache::default();
    let mut format_sessions = FormatSessions::default();

    for job in jobs {
        let outcome = match job {
            Job::ClearCaches => {
                lint_configs.clear();
                format_sessions.clear();
                continue;
            }
            Job::Lint {
                key,
                uri,
                version,
                path,
                text,
                warnings,
            } => {
                let config = lint_configs.get(path.parent().unwrap_or(Path::new(".")));
                let diagnostics = guard("lint", &path, || {
                    let mut diagnostics: Vec<_> = crate::lint::lint(&path, &text, &config)
                        .iter()
                        .filter_map(|d| crate::diagnostics::to_lsp(d, &warnings))
                        .collect();
                    diagnostics.extend(crate::css::diagnostics(&text));
                    diagnostics
                })
                .unwrap_or_default();
                Outcome::Diagnostics {
                    key,
                    uri,
                    version,
                    diagnostics,
                }
            }
            Job::Format {
                id,
                path,
                text,
                range,
            } => {
                let edits = format(&mut format_sessions, &path, &text, range);
                Outcome::Formatted { id, edits }
            }
            Job::Complete {
                id,
                path,
                text,
                offset,
            } => Outcome::Completed {
                id,
                list: guard("completion", &path, || {
                    crate::completions::completions(&text, offset)
                })
                .flatten(),
            },
            Job::Hover {
                id,
                path,
                text,
                offset,
            } => Outcome::Hovered {
                id,
                hover: guard("hover", &path, || crate::hover::hover(&text, offset)).flatten(),
            },
            Job::CodeAction {
                id,
                uri,
                path,
                text,
                diagnostics,
                quickfix,
                suggestions,
                fix_all,
            } => {
                let config = lint_configs.get(path.parent().unwrap_or(Path::new(".")));
                let actions = guard("code action", &path, || {
                    let mut actions = if quickfix {
                        crate::code_actions::quickfixes(&text, &uri, &diagnostics)
                    } else {
                        Vec::new()
                    };
                    actions.extend(crate::code_actions::lint_actions(
                        &text,
                        &path,
                        &uri,
                        &config,
                        &diagnostics,
                        quickfix,
                        suggestions,
                        fix_all,
                    ));
                    actions
                })
                .unwrap_or_default();
                Outcome::CodeActions { id, actions }
            }
            Job::CodeLens { id, path, text } => Outcome::CodeLenses {
                id,
                lenses: guard("code lens", &path, || {
                    crate::code_lens::code_lenses(&text, &path)
                })
                .unwrap_or_default(),
            },
            Job::ExtractComponent {
                id,
                uri,
                text,
                range,
                file_path,
            } => Outcome::ExtractedComponent {
                id,
                result: guard("extract component", Path::new(uri.as_str()), || {
                    crate::extract::component(&text, uri.as_str(), range, &file_path)
                })
                .unwrap_or_else(|| Err("Invalid selection range".to_string()))
                .unwrap_or_else(Value::String),
            },
            Job::FoldingRange {
                id,
                path,
                text,
                line_folding_only,
            } => Outcome::FoldingRanges {
                id,
                ranges: guard("folding range", &path, || {
                    crate::folding::folding_ranges(&text, line_folding_only)
                })
                .unwrap_or_default(),
            },
            Job::SelectionRange {
                id,
                path,
                text,
                offsets,
            } => Outcome::SelectionRanges {
                id,
                ranges: guard("selection range", &path, || {
                    crate::selection_ranges::selection_ranges(&text, &offsets)
                })
                .flatten(),
            },
            Job::DocumentSymbol {
                id,
                uri,
                path,
                text,
                hierarchical,
            } => Outcome::DocumentSymbols {
                id,
                symbols: guard("document symbol", &path, || {
                    crate::symbols::document_symbols(&text, &uri, hierarchical)
                })
                .unwrap_or_else(|| DocumentSymbolResponse::Nested(Vec::new())),
            },
            Job::PullDiagnostics {
                id,
                path,
                text,
                warnings,
            } => {
                let config = lint_configs.get(path.parent().unwrap_or(Path::new(".")));
                let diagnostics = guard("pull diagnostics", &path, || {
                    let mut diagnostics: Vec<_> = crate::lint::lint(&path, &text, &config)
                        .iter()
                        .filter_map(|d| crate::diagnostics::to_lsp(d, &warnings))
                        .collect();
                    diagnostics.extend(crate::css::diagnostics(&text));
                    diagnostics
                })
                .unwrap_or_default();
                Outcome::PulledDiagnostics { id, diagnostics }
            }
        };
        if outcomes.send(outcome).is_err() {
            break;
        }
    }
}

fn format(sessions: &mut FormatSessions, path: &Path, text: &str, range: Range) -> Vec<TextEdit> {
    let session = match sessions.get(path) {
        Ok(session) => session,
        Err(err) => {
            log::warn(format_args!(
                "no formatter config for {}: {err:#}",
                path.display()
            ));
            return Vec::new();
        }
    };
    // Formatting is never an error to the client: a failure yields no edits.
    let Some(formatted) = guard("format", path, || session.format(text, path)) else {
        return Vec::new();
    };
    match formatted {
        Ok(formatted) if formatted != text => vec![TextEdit {
            range,
            new_text: formatted,
        }],
        Ok(_) => Vec::new(),
        Err(err) => {
            log::warn(format_args!(
                "format failed for {}: {err:#}",
                path.display()
            ));
            Vec::new()
        }
    }
}

/// Run one analysis, turning a panic into "no result" instead of the loss of
/// every other document's diagnostics.
fn guard<T>(what: &str, path: &Path, run: impl FnOnce() -> T) -> Option<T> {
    if let Ok(value) = catch_unwind(AssertUnwindSafe(run)) {
        Some(value)
    } else {
        log::warn(format_args!("{what} panicked on {}", path.display()));
        None
    }
}
