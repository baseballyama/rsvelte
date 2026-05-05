//! Output writers — translate a stream of `Diagnostic` records into the
//! shape `svelte-check` callers expect. Mirrors
//! `submodules/language-tools/packages/svelte-check/src/writers.ts`.
//!
//! v0.1 implements `human` and `machine` formats; the verbose variants
//! reuse the human/machine path with extra fields.

use std::fmt::Write;

use super::diagnostic::{Diagnostic, DiagnosticSeverity};

/// Output mode. Matches the values accepted by `--output` on the JS CLI.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum OutputFormat {
    Human,
    HumanVerbose,
    Machine,
    MachineVerbose,
}

impl OutputFormat {
    pub fn parse(s: &str) -> Option<Self> {
        Some(match s {
            "human" => OutputFormat::Human,
            "human-verbose" => OutputFormat::HumanVerbose,
            "machine" => OutputFormat::Machine,
            "machine-verbose" => OutputFormat::MachineVerbose,
            _ => return None,
        })
    }
}

/// Write a single diagnostic to `out` in the chosen format.
pub fn write_diagnostic(
    out: &mut String,
    diag: &Diagnostic,
    workspace_root: &std::path::Path,
    format: OutputFormat,
) {
    match format {
        OutputFormat::Human | OutputFormat::HumanVerbose => write_human(out, diag, workspace_root),
        OutputFormat::Machine | OutputFormat::MachineVerbose => {
            write_machine(out, diag, workspace_root, format)
        }
    }
}

fn write_human(out: &mut String, diag: &Diagnostic, workspace_root: &std::path::Path) {
    let rel = diag.file.strip_prefix(workspace_root).unwrap_or(&diag.file);
    let position = diag
        .range
        .map(|r| format!(":{}:{}", r.start.line, r.start.column))
        .unwrap_or_default();
    let _ = writeln!(
        out,
        "{} {}{} ({}): {}",
        diag.severity.label().to_uppercase(),
        rel.display(),
        position,
        diag.source,
        diag.message
    );
}

fn write_machine(
    out: &mut String,
    diag: &Diagnostic,
    workspace_root: &std::path::Path,
    format: OutputFormat,
) {
    // `<unix_ts> <severity> <abs_path>:<line>:<col> "<msg>" <source>`
    // The JS reference's machine format is line-oriented for grep-ability.
    let line = diag.range.map(|r| r.start.line).unwrap_or(1);
    let col = diag.range.map(|r| r.start.column).unwrap_or(1);
    let path = if matches!(format, OutputFormat::MachineVerbose) {
        diag.file.display().to_string()
    } else {
        diag.file
            .strip_prefix(workspace_root)
            .unwrap_or(&diag.file)
            .display()
            .to_string()
    };
    let escaped = diag.message.replace('"', "\\\"");
    let _ = writeln!(
        out,
        "{} {}:{}:{} \"{}\" {}",
        diag.severity.label().to_uppercase(),
        path,
        line,
        col,
        escaped,
        diag.source
    );
}

/// Summary line (`svelte-check found X errors and Y warnings`) printed
/// after all per-file output. Matches the JS reference's wording.
pub fn write_summary(out: &mut String, diagnostics: &[Diagnostic], files_checked: usize) {
    let errors = diagnostics
        .iter()
        .filter(|d| d.severity == DiagnosticSeverity::Error)
        .count();
    let warnings = diagnostics
        .iter()
        .filter(|d| d.severity == DiagnosticSeverity::Warning)
        .count();
    let _ = writeln!(
        out,
        "\nsvelte-check found {} {} and {} {} in {} {}",
        errors,
        if errors == 1 { "error" } else { "errors" },
        warnings,
        if warnings == 1 { "warning" } else { "warnings" },
        files_checked,
        if files_checked == 1 { "file" } else { "files" },
    );
}
