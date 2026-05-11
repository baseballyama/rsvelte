//! Top-level runner. Walks the workspace, runs the rsvelte compiler on
//! every `.svelte` file, and produces a flat list of diagnostics ready
//! for the writers in `writers.rs`.
//!
//! v0.1 only collects Svelte-side diagnostics (parse / analysis /
//! transform errors + compiler warnings). The TypeScript pipeline
//! (svelte2tsx → tsgo → diagnostic mapper) is the next milestone.

use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};

use crate::compiler::{CompileOptions, GenerateMode, compile};

use super::diagnostic::{Diagnostic, DiagnosticSeverity, Position, Range};
use super::kit_file::load_kit_files_settings;
use super::mapper::map_tsgo_diagnostics;
use super::overlay::{OverlayLayout, materialize_overlay_with_kit};
use super::tsgo::{TsgoError, find_compiler, run_tsgo};
use super::walker::find_relevant_files;

/// Per-warning override: promote to error or drop entirely. Mirrors
/// the JS reference's `--compiler-warnings code:error,code:ignore`.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum WarningOverride {
    Error,
    Ignore,
}

/// Diagnostic sources the run should keep. Mirrors the JS reference's
/// `--diagnostic-sources svelte,ts,css` filter.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum DiagnosticSource {
    Svelte,
    Ts,
    Css,
}

impl DiagnosticSource {
    pub fn as_str(self) -> &'static str {
        match self {
            DiagnosticSource::Svelte => "svelte",
            DiagnosticSource::Ts => "ts",
            DiagnosticSource::Css => "css",
        }
    }
    pub fn parse(s: &str) -> Option<Self> {
        Some(match s {
            "svelte" => DiagnosticSource::Svelte,
            "ts" | "js" => DiagnosticSource::Ts,
            "css" => DiagnosticSource::Css,
            _ => return None,
        })
    }
}

/// Inputs to a `svelte-check` run.
#[derive(Debug, Clone)]
pub struct RunOptions {
    /// Workspace root — `.svelte` files are searched under this directory.
    pub workspace: PathBuf,
    /// Path fragments to skip while walking (relative to the workspace root).
    pub ignore: Vec<String>,
    /// Whether to treat warnings as errors for exit-code purposes.
    pub fail_on_warnings: bool,
    /// When `true`, materialise `.tsx` shadow files + an overlay
    /// tsconfig under `<workspace>/.svelte-check/`. Used by the
    /// upcoming tsgo integration; on its own this only emits files
    /// without spawning a TypeScript compiler.
    pub emit_overlay: bool,
    /// Optional path to a project tsconfig.json the overlay should
    /// `extends`. None → write a self-contained overlay tsconfig.
    pub tsconfig: Option<PathBuf>,
    /// When `true`, also run `tsgo` (or `tsc`) against the overlay
    /// tsconfig and surface mapped TypeScript diagnostics on the
    /// original `.svelte` source. Implies `emit_overlay`.
    pub use_tsgo: bool,
    /// Compiler-warning overrides keyed by warning code (e.g.
    /// `css-unused-selector` → `Ignore`). Empty = pass all warnings
    /// through unchanged. Mirrors the JS `--compiler-warnings`.
    pub compiler_warnings: HashMap<String, WarningOverride>,
    /// Subset of diagnostic sources to surface. `None` = all sources.
    /// Mirrors the JS `--diagnostic-sources`.
    pub diagnostic_sources: Option<HashSet<DiagnosticSource>>,
    /// When `true`, the overlay reads/writes a `manifest.json` cache
    /// under `<cacheDir>/` and skips re-emitting `.tsx` shadows whose
    /// source `(mtime_ms, size)` hasn't changed since the previous run.
    /// Mirrors the JS reference's `--incremental` flag.
    pub incremental: bool,
}

impl Default for RunOptions {
    fn default() -> Self {
        Self {
            workspace: std::env::current_dir().unwrap_or_else(|_| PathBuf::from(".")),
            ignore: Vec::new(),
            fail_on_warnings: false,
            emit_overlay: false,
            tsconfig: None,
            use_tsgo: false,
            compiler_warnings: HashMap::new(),
            diagnostic_sources: None,
            incremental: false,
        }
    }
}

/// Result of a `svelte-check` run.
#[derive(Debug, Default)]
pub struct RunResult {
    pub diagnostics: Vec<Diagnostic>,
    pub files_checked: usize,
    /// `Some` only when `RunOptions::emit_overlay` was set; mainly used
    /// by the upcoming tsgo subprocess pipeline.
    pub overlay: Option<OverlayLayout>,
}

impl RunResult {
    pub fn error_count(&self) -> usize {
        self.diagnostics
            .iter()
            .filter(|d| d.severity == DiagnosticSeverity::Error)
            .count()
    }

    pub fn warning_count(&self) -> usize {
        self.diagnostics
            .iter()
            .filter(|d| d.severity == DiagnosticSeverity::Warning)
            .count()
    }

    /// Process exit code per the JS reference: 1 if any errors, 1 also
    /// when `fail_on_warnings` and any warnings exist, 0 otherwise.
    pub fn exit_code(&self, fail_on_warnings: bool) -> i32 {
        if self.error_count() > 0 || (fail_on_warnings && self.warning_count() > 0) {
            1
        } else {
            0
        }
    }
}

/// Run rsvelte's compiler on every `.svelte` file under `options.workspace`
/// and collect the resulting diagnostics. tsgo / svelte2tsx integration
/// will plug in here in a follow-up.
pub fn run(options: &RunOptions) -> RunResult {
    let kit_settings = load_kit_files_settings(&options.workspace);
    let relevant = find_relevant_files(&options.workspace, &options.ignore, &kit_settings);
    let files = relevant.svelte;
    let kit_files = relevant.kit;
    let files_checked = files.len();
    let diagnostics = compile_files(&files);
    let mut result = RunResult {
        diagnostics,
        files_checked,
        overlay: None,
    };

    let need_overlay = options.emit_overlay || options.use_tsgo;
    if need_overlay {
        match materialize_overlay_with_kit(
            &options.workspace,
            &files,
            &kit_files,
            options.tsconfig.as_deref(),
            options.incremental,
            &kit_settings,
        ) {
            Ok(layout) => {
                if options.use_tsgo {
                    run_tsgo_phase(&layout, &options.workspace, &mut result.diagnostics);
                }
                result.overlay = Some(layout);
            }
            Err(e) => {
                // Surface the overlay error as a workspace-level
                // diagnostic so the user sees it in the same stream as
                // compile errors.
                result.diagnostics.push(Diagnostic {
                    file: options.workspace.clone(),
                    severity: DiagnosticSeverity::Error,
                    code: Some("overlay-error".into()),
                    message: format!("overlay generation failed: {e}"),
                    range: None,
                    source: "svelte",
                });
            }
        }
    }

    apply_filters(&mut result.diagnostics, options);

    result
}

/// Apply compiler-warnings + diagnostic-source filters in place.
fn apply_filters(diagnostics: &mut Vec<Diagnostic>, options: &RunOptions) {
    if !options.compiler_warnings.is_empty() {
        diagnostics.retain_mut(|d| {
            if d.severity != DiagnosticSeverity::Warning {
                return true;
            }
            let Some(code) = d.code.as_deref() else {
                return true;
            };
            match options.compiler_warnings.get(code) {
                Some(WarningOverride::Ignore) => false,
                Some(WarningOverride::Error) => {
                    d.severity = DiagnosticSeverity::Error;
                    true
                }
                None => true,
            }
        });
    }
    if let Some(allowed) = &options.diagnostic_sources {
        diagnostics.retain(|d| {
            DiagnosticSource::parse(d.source)
                .map(|s| allowed.contains(&s))
                .unwrap_or(true)
        });
    }
}

fn run_tsgo_phase(layout: &OverlayLayout, workspace: &Path, out: &mut Vec<Diagnostic>) {
    let binary = match find_compiler(workspace) {
        Ok(b) => b,
        Err(TsgoError::NotFound) => {
            out.push(Diagnostic {
                file: workspace.to_path_buf(),
                severity: DiagnosticSeverity::Warning,
                code: Some("tsgo-not-found".into()),
                message: "Skipping TypeScript diagnostics: no `tsgo` or `tsc` binary found. \
                     Install `@typescript/native-preview` or set `TSGO_BIN`."
                    .into(),
                range: None,
                source: "ts",
            });
            return;
        }
        Err(e) => {
            out.push(Diagnostic {
                file: workspace.to_path_buf(),
                severity: DiagnosticSeverity::Error,
                code: Some("tsgo-error".into()),
                message: format!("{e}"),
                range: None,
                source: "ts",
            });
            return;
        }
    };
    match run_tsgo(&binary, &layout.overlay_tsconfig, workspace) {
        Ok(raw) => {
            let mapped = map_tsgo_diagnostics(&raw, layout, workspace);
            out.extend(mapped);
        }
        Err(e) => {
            out.push(Diagnostic {
                file: workspace.to_path_buf(),
                severity: DiagnosticSeverity::Error,
                code: Some("tsgo-error".into()),
                message: format!("tsgo execution failed: {e}"),
                range: None,
                source: "ts",
            });
        }
    }
}

/// Compile every `.svelte` file in `files` and return diagnostics in
/// stable input order. The compile step is pure CPU and trivially
/// parallel; with the `native` feature we fan out across rayon's
/// global pool, otherwise we fall back to sequential iteration.
fn compile_files(files: &[PathBuf]) -> Vec<Diagnostic> {
    #[cfg(feature = "rayon")]
    {
        use rayon::prelude::*;
        files
            .par_iter()
            .flat_map_iter(|file| diagnostics_for_file(file).into_iter())
            .collect()
    }
    #[cfg(not(feature = "rayon"))]
    {
        files
            .iter()
            .flat_map(|file| diagnostics_for_file(file).into_iter())
            .collect()
    }
}

fn diagnostics_for_file(file: &Path) -> Vec<Diagnostic> {
    let source = match std::fs::read_to_string(file) {
        Ok(s) => s,
        Err(e) => {
            return vec![Diagnostic {
                file: file.to_path_buf(),
                severity: DiagnosticSeverity::Error,
                code: Some("read-error".into()),
                message: format!("could not read file: {e}"),
                range: None,
                source: "svelte",
            }];
        }
    };
    let opts = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some(file.display().to_string()),
        ..Default::default()
    };
    match compile(&source, opts) {
        Ok(res) => res
            .warnings
            .into_iter()
            .map(|w| Diagnostic {
                file: file.to_path_buf(),
                severity: DiagnosticSeverity::Warning,
                code: Some(w.code),
                message: w.message,
                range: range_from_warning(w.start.as_ref(), w.end.as_ref()),
                source: "svelte",
            })
            .collect(),
        Err(e) => vec![Diagnostic {
            file: file.to_path_buf(),
            severity: DiagnosticSeverity::Error,
            code: Some("compile-error".into()),
            message: format!("{e}"),
            range: None,
            source: "svelte",
        }],
    }
}

fn range_from_warning(
    start: Option<&crate::compiler::Position>,
    end: Option<&crate::compiler::Position>,
) -> Option<Range> {
    let start = start?;
    let end_pos = end.unwrap_or(start);
    Some(Range {
        start: Position {
            line: start.line as u32,
            // Compiler positions are 0-indexed columns; LSP uses 0-index too.
            column: start.column as u32,
        },
        end: Position {
            line: end_pos.line as u32,
            column: end_pos.column as u32,
        },
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn diag(severity: DiagnosticSeverity, code: &str, source: &'static str) -> Diagnostic {
        Diagnostic {
            file: PathBuf::from("Foo.svelte"),
            severity,
            code: Some(code.into()),
            message: "msg".into(),
            range: None,
            source,
        }
    }

    #[test]
    fn compiler_warnings_ignore_drops_warning_keeps_error() {
        let mut diags = vec![
            diag(DiagnosticSeverity::Warning, "css-unused-selector", "svelte"),
            diag(DiagnosticSeverity::Error, "css-unused-selector", "svelte"),
            diag(DiagnosticSeverity::Warning, "a11y-foo", "svelte"),
        ];
        let mut overrides = HashMap::new();
        overrides.insert("css-unused-selector".into(), WarningOverride::Ignore);
        let opts = RunOptions {
            compiler_warnings: overrides,
            ..RunOptions::default()
        };
        apply_filters(&mut diags, &opts);
        assert_eq!(diags.len(), 2);
        assert_eq!(diags[0].severity, DiagnosticSeverity::Error);
        assert_eq!(diags[1].code.as_deref(), Some("a11y-foo"));
    }

    #[test]
    fn compiler_warnings_error_promotes_warning() {
        let mut diags = vec![diag(DiagnosticSeverity::Warning, "a11y-foo", "svelte")];
        let mut overrides = HashMap::new();
        overrides.insert("a11y-foo".into(), WarningOverride::Error);
        let opts = RunOptions {
            compiler_warnings: overrides,
            ..RunOptions::default()
        };
        apply_filters(&mut diags, &opts);
        assert_eq!(diags.len(), 1);
        assert_eq!(diags[0].severity, DiagnosticSeverity::Error);
    }

    #[test]
    fn diagnostic_sources_filter_keeps_only_listed() {
        let mut diags = vec![
            diag(DiagnosticSeverity::Warning, "x", "svelte"),
            diag(DiagnosticSeverity::Error, "x", "ts"),
            diag(DiagnosticSeverity::Warning, "x", "css"),
        ];
        let mut allowed = HashSet::new();
        allowed.insert(DiagnosticSource::Svelte);
        allowed.insert(DiagnosticSource::Ts);
        let opts = RunOptions {
            diagnostic_sources: Some(allowed),
            ..RunOptions::default()
        };
        apply_filters(&mut diags, &opts);
        let sources: Vec<_> = diags.iter().map(|d| d.source).collect();
        assert_eq!(sources, vec!["svelte", "ts"]);
    }
}
