//! Top-level runner. Walks the workspace, runs the rsvelte compiler on
//! every `.svelte` file, and produces a flat list of diagnostics ready
//! for the writers in `writers.rs`.
//!
//! v0.1 only collects Svelte-side diagnostics (parse / analysis /
//! transform errors + compiler warnings). The TypeScript pipeline
//! (svelte2tsx → tsgo → diagnostic mapper) is the next milestone.

use std::path::{Path, PathBuf};

use crate::compiler::{CompileOptions, GenerateMode, compile};

use super::diagnostic::{Diagnostic, DiagnosticSeverity, Position, Range};
use super::walker::find_svelte_files;

/// Inputs to a `svelte-check` run.
#[derive(Debug, Clone)]
pub struct RunOptions {
    /// Workspace root — `.svelte` files are searched under this directory.
    pub workspace: PathBuf,
    /// Path fragments to skip while walking (relative to the workspace root).
    pub ignore: Vec<String>,
    /// Whether to treat warnings as errors for exit-code purposes.
    pub fail_on_warnings: bool,
}

impl Default for RunOptions {
    fn default() -> Self {
        Self {
            workspace: std::env::current_dir().unwrap_or_else(|_| PathBuf::from(".")),
            ignore: Vec::new(),
            fail_on_warnings: false,
        }
    }
}

/// Result of a `svelte-check` run.
#[derive(Debug, Clone, Default)]
pub struct RunResult {
    pub diagnostics: Vec<Diagnostic>,
    pub files_checked: usize,
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
    let files = find_svelte_files(&options.workspace, &options.ignore);
    let mut result = RunResult {
        diagnostics: Vec::new(),
        files_checked: 0,
    };
    for file in &files {
        result.files_checked += 1;
        let source = match std::fs::read_to_string(file) {
            Ok(s) => s,
            Err(e) => {
                result.diagnostics.push(Diagnostic {
                    file: file.clone(),
                    severity: DiagnosticSeverity::Error,
                    code: Some("read-error".into()),
                    message: format!("could not read file: {e}"),
                    range: None,
                    source: "svelte",
                });
                continue;
            }
        };
        run_one_file(file, &source, &mut result.diagnostics);
    }
    result
}

fn run_one_file(file: &Path, source: &str, out: &mut Vec<Diagnostic>) {
    let opts = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some(file.display().to_string()),
        ..Default::default()
    };
    match compile(source, opts) {
        Ok(res) => {
            for w in res.warnings {
                out.push(Diagnostic {
                    file: file.to_path_buf(),
                    severity: DiagnosticSeverity::Warning,
                    code: Some(w.code),
                    message: w.message,
                    range: range_from_warning(w.start.as_ref(), w.end.as_ref()),
                    source: "svelte",
                });
            }
        }
        Err(e) => {
            out.push(Diagnostic {
                file: file.to_path_buf(),
                severity: DiagnosticSeverity::Error,
                code: Some("compile-error".into()),
                message: format!("{e}"),
                range: None,
                source: "svelte",
            });
        }
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
