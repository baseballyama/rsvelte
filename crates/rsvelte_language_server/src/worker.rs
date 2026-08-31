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

use std::collections::HashMap;
use std::fs;
use std::panic::{AssertUnwindSafe, catch_unwind};
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};
use std::thread::JoinHandle;

use crossbeam_channel::{Receiver, Sender, unbounded};
use lsp_server::RequestId;
use lsp_types::{
    CodeActionOrCommand, CodeLens, CompletionList, Diagnostic, DocumentSymbolResponse,
    FoldingRange, Hover, Location, Range, SelectionRange, TextEdit, Uri,
};
use serde_json::Value;

use crate::format::FormatSessions;
use crate::lint::LintConfigCache;
use crate::log;
use crate::settings::CompilerWarnings;
use crate::settings::FormatConfig;
use crate::tsgo_custom::{WorkspaceSource, find_file_references};
use crate::uri::path_to_uri;

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
        preprocessed: Option<PreprocessedAnalysis>,
        warnings: CompilerWarnings,
        svelte_diagnostics: bool,
        css_diagnostics: bool,
    },
    Format {
        id: RequestId,
        path: PathBuf,
        text: Arc<String>,
        range: Range,
        config: FormatConfig,
    },
    Compile {
        id: RequestId,
        path: PathBuf,
        text: Arc<String>,
        sourcemap: Option<Arc<String>>,
    },
    Complete {
        id: RequestId,
        path: PathBuf,
        text: Arc<String>,
        offset: usize,
        strict_mode: bool,
        markdown_documentation: bool,
    },
    Hover {
        id: RequestId,
        path: PathBuf,
        text: Arc<String>,
        offset: usize,
        markdown_hover: bool,
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
        preprocessed: Option<PreprocessedAnalysis>,
        warnings: CompilerWarnings,
        svelte_diagnostics: bool,
        css_diagnostics: bool,
    },
    FileReferences {
        id: RequestId,
        target: PathBuf,
        roots: Vec<PathBuf>,
        open_documents: Vec<FileReferenceSource>,
    },
    /// Drop the resolved `rsvelte-lint.json` / `.oxfmtrc` caches so the next
    /// job re-reads them from disk.
    ClearCaches,
}

#[derive(Clone)]
pub struct PreprocessedAnalysis {
    pub text: Arc<String>,
    pub map: Option<Arc<String>>,
    pub identity: bool,
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
    Compiled {
        id: RequestId,
        result: Option<Value>,
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
    FileReferences {
        id: RequestId,
        locations: Vec<Location>,
    },
}

pub struct FileReferenceSource {
    pub path: PathBuf,
    pub uri: Uri,
    pub text: String,
}

pub struct Worker {
    jobs: Option<Sender<Job>>,
    handle: Option<JoinHandle<()>>,
    stopping: Arc<AtomicBool>,
}

impl Worker {
    /// # Panics
    ///
    /// Panics if the analysis worker thread cannot be spawned.
    #[must_use]
    pub fn spawn(outcomes: Sender<Outcome>) -> Self {
        let (jobs, receiver) = unbounded();
        let stopping = Arc::new(AtomicBool::new(false));
        let worker_stopping = Arc::clone(&stopping);
        let handle = std::thread::Builder::new()
            .name("rsvelte-analysis".to_string())
            .stack_size(STACK_SIZE)
            .spawn(move || run(&receiver, &outcomes, &worker_stopping))
            .expect("spawn the analysis worker");
        Self {
            jobs: Some(jobs),
            handle: Some(handle),
            stopping,
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
        self.stopping.store(true, Ordering::Release);
        self.jobs.take();
        if let Some(handle) = self.handle.take() {
            let _ = handle.join();
        }
    }
}

fn run(jobs: &Receiver<Job>, outcomes: &Sender<Outcome>, stopping: &AtomicBool) {
    let mut lint_configs = LintConfigCache::default();
    let mut format_sessions = FormatSessions::default();

    for job in jobs {
        if stopping.load(Ordering::Acquire) {
            break;
        }
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
                preprocessed,
                warnings,
                svelte_diagnostics,
                css_diagnostics,
            } => {
                let config = lint_configs.get(path.parent().unwrap_or(Path::new(".")));
                let diagnostics = guard("lint", &path, || {
                    let mut diagnostics = if svelte_diagnostics {
                        lint_with_preprocessor(
                            &path,
                            &text,
                            preprocessed.as_ref(),
                            &config,
                            &warnings,
                        )
                    } else {
                        Vec::new()
                    };
                    if css_diagnostics {
                        diagnostics.extend(crate::css::diagnostics(&text));
                    }
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
                config,
            } => {
                let edits = format(&mut format_sessions, &path, &text, range, &config);
                Outcome::Formatted { id, edits }
            }
            Job::Compile {
                id,
                path,
                text,
                sourcemap,
            } => Outcome::Compiled {
                id,
                result: guard("compiled code", &path, || {
                    let options = rsvelte_core::CompileOptions {
                        filename: Some(path.display().to_string()),
                        sourcemap: sourcemap.as_deref().cloned(),
                        ..rsvelte_core::CompileOptions::default()
                    };
                    rsvelte_core::compile(&text, options).ok().map(|compiled| {
                        let map = |map: Option<String>| {
                            map.and_then(|map| serde_json::from_str(&map).ok())
                                .unwrap_or(Value::Null)
                        };
                        let css = compiled.css.map(|css| {
                            serde_json::json!({
                                "code": css.code,
                                "map": map(css.map),
                                "hasGlobal": css.has_global,
                            })
                        });
                        serde_json::json!({
                            "js": { "code": compiled.js.code, "map": map(compiled.js.map) },
                            "css": css,
                        })
                    })
                })
                .flatten(),
            },
            Job::Complete {
                id,
                path,
                text,
                offset,
                strict_mode,
                markdown_documentation,
            } => Outcome::Completed {
                id,
                list: guard("completion", &path, || {
                    crate::completions::completions_with_strict_mode(
                        &text,
                        offset,
                        strict_mode,
                        markdown_documentation,
                    )
                })
                .flatten(),
            },
            Job::Hover {
                id,
                path,
                text,
                offset,
                markdown_hover,
            } => Outcome::Hovered {
                id,
                hover: guard("hover", &path, || {
                    crate::hover::hover(&text, offset, markdown_hover)
                })
                .flatten(),
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
                preprocessed,
                warnings,
                svelte_diagnostics,
                css_diagnostics,
            } => {
                let config = lint_configs.get(path.parent().unwrap_or(Path::new(".")));
                let diagnostics = guard("pull diagnostics", &path, || {
                    let mut diagnostics = if svelte_diagnostics {
                        lint_with_preprocessor(
                            &path,
                            &text,
                            preprocessed.as_ref(),
                            &config,
                            &warnings,
                        )
                    } else {
                        Vec::new()
                    };
                    if css_diagnostics {
                        diagnostics.extend(crate::css::diagnostics(&text));
                    }
                    diagnostics
                })
                .unwrap_or_default();
                Outcome::PulledDiagnostics { id, diagnostics }
            }
            Job::FileReferences {
                id,
                target,
                roots,
                open_documents,
            } => Outcome::FileReferences {
                id,
                locations: file_references(&target, &roots, open_documents),
            },
        };
        if outcomes.send(outcome).is_err() {
            break;
        }
    }
}

fn lint_with_preprocessor(
    path: &Path,
    raw: &str,
    preprocessed: Option<&PreprocessedAnalysis>,
    config: &rsvelte_lint::LintConfig,
    warnings: &CompilerWarnings,
) -> Vec<Diagnostic> {
    let mut diagnostics = crate::lint::lint(path, raw, config)
        .iter()
        .filter_map(|diagnostic| {
            let compiler = diagnostic
                .code
                .as_deref()
                .is_some_and(crate::diagnostics::is_compiler_code);
            if compiler && preprocessed.is_some() {
                return None;
            }
            let diagnostic = crate::diagnostics::to_lsp(diagnostic, warnings)?;
            (!compiler || crate::diagnostics::keep_raw_compiler_diagnostic(&diagnostic, raw))
                .then_some(diagnostic)
        })
        .collect::<Vec<_>>();
    let Some(preprocessed) = preprocessed else {
        return diagnostics;
    };
    let processed_diagnostics = crate::lint::lint(path, &preprocessed.text, config);
    let mapped = processed_diagnostics
        .into_iter()
        .filter(|diagnostic| {
            diagnostic
                .code
                .as_deref()
                .is_some_and(crate::diagnostics::is_compiler_code)
        })
        .filter_map(|diagnostic| crate::diagnostics::to_lsp(&diagnostic, warnings))
        .filter_map(|diagnostic| {
            if preprocessed.identity {
                Some(diagnostic)
            } else {
                crate::diagnostics::map_preprocessed_diagnostic(
                    diagnostic,
                    preprocessed.map.as_deref()?,
                )
            }
        });
    diagnostics.extend(mapped);
    diagnostics
}

fn file_references(
    target: &Path,
    roots: &[PathBuf],
    open_documents: Vec<FileReferenceSource>,
) -> Vec<Location> {
    let mut sources = HashMap::<PathBuf, FileReferenceSource>::new();
    for root in roots {
        collect_source_directory(root, &mut sources);
    }
    for source in open_documents {
        sources.insert(source.path.clone(), source);
    }
    let sources = sources.into_values().collect::<Vec<_>>();
    let views = sources
        .iter()
        .map(|source| WorkspaceSource {
            path: &source.path,
            uri: &source.uri,
            text: &source.text,
        })
        .collect::<Vec<_>>();
    find_file_references(target, &views)
}

fn collect_source_directory(directory: &Path, sources: &mut HashMap<PathBuf, FileReferenceSource>) {
    let Ok(entries) = fs::read_dir(directory) else {
        return;
    };
    for entry in entries.flatten() {
        let path = entry.path();
        let Ok(file_type) = entry.file_type() else {
            continue;
        };
        if file_type.is_dir() {
            if matches!(
                entry.file_name().to_str(),
                Some("node_modules" | ".git" | ".rsvelte-language-server" | "target")
            ) {
                continue;
            }
            collect_source_directory(&path, sources);
            continue;
        }
        if !file_type.is_file()
            || !path
                .extension()
                .and_then(|extension| extension.to_str())
                .is_some_and(|extension| {
                    matches!(
                        extension,
                        "ts" | "tsx" | "mts" | "cts" | "js" | "jsx" | "mjs" | "cjs" | "svelte"
                    )
                })
        {
            continue;
        }
        let Ok(text) = fs::read_to_string(&path) else {
            continue;
        };
        let canonical = fs::canonicalize(&path).unwrap_or(path);
        let Some(uri) = path_to_uri(&canonical) else {
            continue;
        };
        sources.insert(
            canonical.clone(),
            FileReferenceSource {
                path: canonical,
                uri,
                text,
            },
        );
    }
}

fn format(
    sessions: &mut FormatSessions,
    path: &Path,
    text: &str,
    range: Range,
    config: &FormatConfig,
) -> Vec<TextEdit> {
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
    let formatted = formatted
        .and_then(|formatted| crate::format::apply_editor_config(&formatted, path, config));
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
