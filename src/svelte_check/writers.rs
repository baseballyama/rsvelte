//! Output writers — translate a stream of `Diagnostic` records into the
//! shape `svelte-check` callers expect. Mirrors
//! `submodules/language-tools/packages/svelte-check/src/writers.ts`.
//!
//! v0.1 implements `human` and `machine` formats; the verbose variants
//! reuse the human/machine path with extra fields.

use std::fmt::Write;

use super::diagnostic::{Diagnostic, DiagnosticSeverity};

/// Output mode. Matches the values accepted by `--output` on the JS CLI,
/// plus `github-actions` for CI-friendly workflow-command annotations.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum OutputFormat {
    Human,
    HumanVerbose,
    Machine,
    MachineVerbose,
    /// `::error file=…,line=…,col=…::message` — picked up by GitHub
    /// Actions and surfaced inline on PR diffs. Mirrors the JS
    /// reference's `--output github` once it lands; the rsvelte CLI
    /// uses the explicit `github-actions` name to avoid collisions
    /// with hypothetical future format names.
    GithubActions,
}

impl OutputFormat {
    pub fn parse(s: &str) -> Option<Self> {
        Some(match s {
            "human" => OutputFormat::Human,
            "human-verbose" => OutputFormat::HumanVerbose,
            "machine" => OutputFormat::Machine,
            "machine-verbose" => OutputFormat::MachineVerbose,
            "github" | "github-actions" => OutputFormat::GithubActions,
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
        OutputFormat::GithubActions => write_github_actions(out, diag, workspace_root),
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
    // The machine format is line-oriented (one diagnostic per line), so a
    // message carrying newlines must be encoded or it splits into several
    // un-parseable lines (H-098). Escape quotes and CR/LF.
    let escaped = diag
        .message
        .replace('"', "\\\"")
        .replace('\r', "\\r")
        .replace('\n', "\\n");
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

/// GitHub Actions workflow-command annotation:
///   `::<level> file=<path>,line=<L>,col=<C>::<message>`
/// where `<level>` is one of `error` / `warning` / `notice`. Newlines
/// inside the message are escaped per the GitHub spec
/// (`%0A` / `%0D` / `%25`).
fn write_github_actions(out: &mut String, diag: &Diagnostic, workspace_root: &std::path::Path) {
    let rel = diag.file.strip_prefix(workspace_root).unwrap_or(&diag.file);
    let level = match diag.severity {
        DiagnosticSeverity::Error => "error",
        DiagnosticSeverity::Warning => "warning",
        DiagnosticSeverity::Info | DiagnosticSeverity::Hint => "notice",
    };
    let line = diag.range.map(|r| r.start.line).unwrap_or(1);
    let col = diag.range.map(|r| r.start.column).unwrap_or(1);
    let mut message = format!("({}) {}", diag.source, diag.message);
    if let Some(code) = diag.code.as_deref() {
        message = format!("{message} [{code}]");
    }
    let escaped = escape_workflow_command(&message);
    let _ = writeln!(
        out,
        "::{} file={},line={},col={}::{}",
        level,
        rel.display(),
        line,
        col,
        escaped
    );
}

/// Escape characters with special meaning in GitHub Actions
/// workflow-command values per
/// <https://docs.github.com/actions/learn-github-actions/workflow-commands-for-github-actions>.
fn escape_workflow_command(value: &str) -> String {
    let mut out = String::with_capacity(value.len());
    for c in value.chars() {
        match c {
            '%' => out.push_str("%25"),
            '\r' => out.push_str("%0D"),
            '\n' => out.push_str("%0A"),
            _ => out.push(c),
        }
    }
    out
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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::svelte_check::diagnostic::{Position, Range};
    use std::path::{Path, PathBuf};

    fn diag(severity: DiagnosticSeverity, file: &str, line: u32, col: u32) -> Diagnostic {
        Diagnostic {
            file: PathBuf::from(file),
            severity,
            code: Some("css_unused_selector".into()),
            message: "Unused CSS selector \"foo\"".into(),
            range: Some(Range {
                start: Position { line, column: col },
                end: Position { line, column: col },
            }),
            source: "svelte",
        }
    }

    #[test]
    fn parse_recognises_github_actions_alias() {
        assert_eq!(
            OutputFormat::parse("github"),
            Some(OutputFormat::GithubActions)
        );
        assert_eq!(
            OutputFormat::parse("github-actions"),
            Some(OutputFormat::GithubActions)
        );
        assert_eq!(OutputFormat::parse("nope"), None);
    }

    #[test]
    fn github_actions_emits_workflow_command() {
        let workspace = Path::new("/work");
        let d = diag(DiagnosticSeverity::Error, "/work/src/Foo.svelte", 12, 3);
        let mut out = String::new();
        write_diagnostic(&mut out, &d, workspace, OutputFormat::GithubActions);
        assert!(
            out.starts_with("::error file=src/Foo.svelte,line=12,col=3::"),
            "{out}"
        );
        assert!(out.contains("[css_unused_selector]"), "{out}");
        assert!(out.contains("(svelte) Unused CSS selector"), "{out}");
    }

    #[test]
    fn github_actions_maps_severity_to_level() {
        let ws = Path::new("/work");
        let mut out = String::new();
        write_diagnostic(
            &mut out,
            &diag(DiagnosticSeverity::Warning, "/work/A.svelte", 1, 1),
            ws,
            OutputFormat::GithubActions,
        );
        assert!(out.starts_with("::warning "), "{out}");
        out.clear();
        write_diagnostic(
            &mut out,
            &diag(DiagnosticSeverity::Info, "/work/A.svelte", 1, 1),
            ws,
            OutputFormat::GithubActions,
        );
        assert!(out.starts_with("::notice "), "{out}");
    }

    #[test]
    fn github_actions_escapes_special_chars() {
        let escaped = escape_workflow_command("100% match\nnext line\rthird");
        assert_eq!(escaped, "100%25 match%0Anext line%0Dthird");
    }

    #[test]
    fn machine_output_is_single_line_for_multiline_message() {
        // H-098: a diagnostic message with newlines must not split the
        // line-oriented machine output into several un-parseable lines.
        let ws = Path::new("/work");
        let mut d = diag(DiagnosticSeverity::Error, "/work/A.svelte", 1, 1);
        d.message = "line one\nline two\rthird".into();
        let mut out = String::new();
        write_diagnostic(&mut out, &d, ws, OutputFormat::Machine);
        assert_eq!(
            out.matches('\n').count(),
            1,
            "machine output split across lines: {out:?}"
        );
        assert!(
            out.contains("line one\\nline two\\rthird"),
            "newlines not encoded: {out:?}"
        );
    }
}
