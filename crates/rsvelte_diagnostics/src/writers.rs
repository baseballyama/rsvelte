//! Output writers — translate a stream of `Diagnostic` records into the
//! shape `svelte-check` callers expect. Mirrors
//! `submodules/language-tools/packages/svelte-check/src/writers.ts`.
//!
//! `machine` / `machine-verbose` line-for-line mirror `MachineFriendlyWriter`; `human` / `human-verbose` remain a v0.1 approximation of `HumanFriendlyWriter`.

use std::fmt::Write;

use crate::{Diagnostic, DiagnosticSeverity, Range};

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

/// Diagnostic display threshold — mirrors the JS reference's
/// `--threshold` (`getThreshold` in `options.ts` + `createFilter` in
/// `index.ts`). It filters which diagnostics are *printed*; it never
/// changes the error/warning counts or the exit code, which the JS
/// reference always computes from the unfiltered diagnostic set.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum Threshold {
    /// Print warnings and errors (the JS default).
    #[default]
    Warning,
    /// Print errors only.
    Error,
}

impl Threshold {
    /// The JS reference only accepts `warning` / `error`; anything else
    /// warns and falls back to `warning`. `parse` returns `None` for the
    /// unknown case so the caller can emit that warning.
    pub fn parse(s: &str) -> Option<Self> {
        Some(match s {
            "warning" => Threshold::Warning,
            "error" => Threshold::Error,
            _ => return None,
        })
    }

    /// Whether a diagnostic of `severity` should be displayed. `error`
    /// keeps only errors; `warning` keeps errors and warnings (dropping
    /// info/hint, matching the JS `createFilter`).
    pub fn includes(self, severity: DiagnosticSeverity) -> bool {
        match self {
            Threshold::Error => severity == DiagnosticSeverity::Error,
            Threshold::Warning => matches!(
                severity,
                DiagnosticSeverity::Error | DiagnosticSeverity::Warning
            ),
        }
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
    // Upstream's `type` stays null for info/hint, so no line is logged at all.
    let severity = match diag.severity {
        DiagnosticSeverity::Error => "ERROR",
        DiagnosticSeverity::Warning => "WARNING",
        DiagnosticSeverity::Info | DiagnosticSeverity::Hint => return,
    };

    let rel = diag
        .file
        .strip_prefix(workspace_root)
        .unwrap_or(&diag.file)
        .display()
        .to_string();
    let (start, end) = zero_based_range(diag.range);

    if matches!(format, OutputFormat::MachineVerbose) {
        // Field order matches `JSON.stringify({ type, filename, start, end, message, code, codeDescription, source })`; an absent field is omitted rather than written as `null`, matching what `JSON.stringify` does to `undefined`.
        let mut json = String::from("{");
        let _ = write!(json, "\"type\":\"{severity}\",");
        let _ = write!(json, "\"filename\":{},", json_quoted(&rel));
        let _ = write!(
            json,
            "\"start\":{{\"line\":{},\"character\":{}}},",
            start.0, start.1
        );
        let _ = write!(
            json,
            "\"end\":{{\"line\":{},\"character\":{}}},",
            end.0, end.1
        );
        let _ = write!(json, "\"message\":{},", json_quoted(&diag.message));
        write_code_field(&mut json, diag);
        write_code_description_field(&mut json, diag, severity);
        let _ = write!(json, "\"source\":{}", json_quoted(diag.source));
        json.push('}');
        write_epoch_line(out, &json);
    } else {
        // 1-based line/col, matching `${start.line + 1}:${start.character + 1}`.
        let payload = format!(
            "{severity} {} {}:{} {}",
            json_quoted(&rel),
            start.0 + 1,
            start.1 + 1,
            json_quoted(&diag.message)
        );
        write_epoch_line(out, &payload);
    }
}

/// Converts rsvelte's 1-based-line/0-based-column `Range` to the 0-based-on-both-axes LSP shape `machine-verbose` needs; a missing range falls back to the file start.
fn zero_based_range(range: Option<Range>) -> ((u32, u32), (u32, u32)) {
    match range {
        Some(r) => (
            (r.start.line.saturating_sub(1), r.start.column),
            (r.end.line.saturating_sub(1), r.end.column),
        ),
        None => ((0, 0), (0, 0)),
    }
}

/// `code` is omitted entirely when absent, matching `JSON.stringify` dropping an `undefined` property.
fn write_code_field(json: &mut String, diag: &Diagnostic) {
    let Some(code) = diag.code.as_deref() else {
        return;
    };
    // Upstream's TS `code` is a bare number; rsvelte stores the CLI-facing `TS`-prefixed string, so strip it back off to match the JSON type.
    if diag.source == "ts"
        && let Some(num) = code.strip_prefix("TS").and_then(|n| n.parse::<u64>().ok())
    {
        let _ = write!(json, "\"code\":{num},");
        return;
    }
    let _ = write!(json, "\"code\":{},", json_quoted(code));
}

/// Mirrors `getDiagnostics.ts`'s `getCodeDescription`, which only fires for a Svelte-sourced, lowercase, `-`/`_`-bearing code — never for a bare TS number.
fn write_code_description_field(json: &mut String, diag: &Diagnostic, severity: &str) {
    if diag.source != "svelte" {
        return;
    }
    let Some(code) = diag.code.as_deref() else {
        return;
    };
    let starts_lowercase = code.chars().next().is_some_and(|c| c.is_ascii_lowercase());
    if !starts_lowercase || !(code.contains('-') || code.contains('_')) {
        return;
    }
    let anchor = code.replace('-', "_");
    let base = if severity == "ERROR" {
        "compiler-errors"
    } else {
        "compiler-warnings"
    };
    let href = json_quoted(&format!("https://svelte.dev/docs/svelte/{base}#{anchor}"));
    let _ = write!(json, "\"codeDescription\":{{\"href\":{href}}},");
}

/// Mirrors `JSON.stringify` on a plain string: non-ASCII passes through unescaped.
fn json_escape(s: &str) -> String {
    let mut out = String::with_capacity(s.len() + 2);
    for c in s.chars() {
        match c {
            '"' => out.push_str("\\\""),
            '\\' => out.push_str("\\\\"),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            '\t' => out.push_str("\\t"),
            c if (c as u32) < 0x20 => {
                let _ = write!(out, "\\u{:04x}", c as u32);
            }
            c => out.push(c),
        }
    }
    out
}

fn json_quoted(s: &str) -> String {
    format!("\"{}\"", json_escape(s))
}

fn epoch_ms() -> u128 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis())
        .unwrap_or(0)
}

fn write_epoch_line(out: &mut String, payload: &str) {
    let _ = writeln!(out, "{} {}", epoch_ms(), payload);
}

/// Mirrors `MachineFriendlyWriter#start`; a no-op for every other format.
pub fn write_start(out: &mut String, workspace_root: &std::path::Path, format: OutputFormat) {
    if !matches!(format, OutputFormat::Machine | OutputFormat::MachineVerbose) {
        return;
    }
    let payload = format!(
        "START {}",
        json_quoted(&workspace_root.display().to_string())
    );
    write_epoch_line(out, &payload);
}

/// Mirrors `MachineFriendlyWriter#completion`; a no-op for every other format.
pub fn write_completion(
    out: &mut String,
    file_count: usize,
    error_count: usize,
    warning_count: usize,
    file_count_with_problems: usize,
    format: OutputFormat,
) {
    if !matches!(format, OutputFormat::Machine | OutputFormat::MachineVerbose) {
        return;
    }
    let payload = format!(
        "COMPLETED {file_count} FILES {error_count} ERRORS {warning_count} WARNINGS {file_count_with_problems} FILES_WITH_PROBLEMS"
    );
    write_epoch_line(out, &payload);
}

/// Computed over the full diagnostic set, not the threshold-filtered subset that gets printed — matching the JS reference's `fileCountWithProblems`.
pub fn count_files_with_problems(diagnostics: &[Diagnostic]) -> usize {
    let mut files = std::collections::HashSet::new();
    for d in diagnostics {
        if matches!(
            d.severity,
            DiagnosticSeverity::Error | DiagnosticSeverity::Warning
        ) {
            files.insert(&d.file);
        }
    }
    files.len()
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
    // `file=` is a command *property*; its value needs the stricter property
    // escaping (`:` and `,` on top of `%` / CR / LF), otherwise a path
    // containing those characters (e.g. a Windows drive `C:` or a comma) would
    // break the `key=value,key=value` parsing. line/col are integers. M-066.
    let file = escape_workflow_property(&rel.display().to_string());
    let _ = writeln!(
        out,
        "::{} file={},line={},col={}::{}",
        level, file, line, col, escaped
    );
}

/// Escape a GitHub Actions workflow-command **message** (the data after `::`).
/// Mirrors `@actions/core`'s `escapeData`.
/// <https://docs.github.com/actions/learn-github-actions/workflow-commands-for-github-actions>
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

/// Escape a GitHub Actions workflow-command **property** value. Mirrors
/// `@actions/core`'s `escapeProperty`, which escapes `:` and `,` on top of the
/// message escapes so they can't terminate the property / property list.
fn escape_workflow_property(value: &str) -> String {
    let mut out = String::with_capacity(value.len());
    for c in value.chars() {
        match c {
            '%' => out.push_str("%25"),
            '\r' => out.push_str("%0D"),
            '\n' => out.push_str("%0A"),
            ':' => out.push_str("%3A"),
            ',' => out.push_str("%2C"),
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
    use crate::{Position, Range};
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
    fn github_actions_property_escapes_colon_and_comma() {
        // M-066: property values additionally escape `:` and `,` (matching
        // `@actions/core`'s escapeProperty) so they can't terminate the list.
        assert_eq!(escape_workflow_property("a,b:c%\r\n"), "a%2Cb%3Ac%25%0D%0A");
    }

    #[test]
    fn github_actions_escapes_comma_in_file_path() {
        let ws = Path::new("/work");
        // A path with a comma must not break the `file=...,line=...` parsing.
        let d = diag(DiagnosticSeverity::Error, "/work/sub,dir/Foo.svelte", 1, 2);
        let mut out = String::new();
        write_diagnostic(&mut out, &d, ws, OutputFormat::GithubActions);
        assert!(
            out.starts_with("::error file=sub%2Cdir/Foo.svelte,line=1,col=2::"),
            "comma in path not escaped: {out}"
        );
    }

    #[test]
    fn threshold_parses_and_filters_like_the_js_reference() {
        assert_eq!(Threshold::parse("warning"), Some(Threshold::Warning));
        assert_eq!(Threshold::parse("error"), Some(Threshold::Error));
        assert_eq!(Threshold::parse("hint"), None);
        assert_eq!(Threshold::default(), Threshold::Warning);

        // `error` keeps only errors.
        assert!(Threshold::Error.includes(DiagnosticSeverity::Error));
        assert!(!Threshold::Error.includes(DiagnosticSeverity::Warning));
        assert!(!Threshold::Error.includes(DiagnosticSeverity::Info));

        // `warning` keeps errors + warnings, drops info/hint.
        assert!(Threshold::Warning.includes(DiagnosticSeverity::Error));
        assert!(Threshold::Warning.includes(DiagnosticSeverity::Warning));
        assert!(!Threshold::Warning.includes(DiagnosticSeverity::Info));
        assert!(!Threshold::Warning.includes(DiagnosticSeverity::Hint));
    }

    /// Strip the epoch-ms prefix every `machine` / `machine-verbose` line
    /// carries, returning the payload after the first space.
    fn strip_epoch(line: &str) -> &str {
        line.split_once(' ').map(|(_, rest)| rest).unwrap_or(line)
    }

    #[test]
    fn machine_verbose_emits_upstream_shaped_json() {
        // Verified byte-for-byte (modulo the epoch) against the real `svelte-check` binary for this exact diagnostic shape.
        let ws = Path::new("/work");
        let d = diag(DiagnosticSeverity::Error, "/work/src/Foo.svelte", 12, 3);
        let mut out = String::new();
        write_diagnostic(&mut out, &d, ws, OutputFormat::MachineVerbose);
        let line = out.trim_end();
        let (epoch, payload) = line.split_once(' ').expect("epoch-ms prefix");
        assert!(epoch.parse::<u128>().is_ok(), "not an epoch prefix: {line}");
        assert_eq!(
            payload,
            "{\"type\":\"ERROR\",\"filename\":\"src/Foo.svelte\",\"start\":{\"line\":11,\"character\":3},\
             \"end\":{\"line\":11,\"character\":3},\"message\":\"Unused CSS selector \\\"foo\\\"\",\
             \"code\":\"css_unused_selector\",\"codeDescription\":{\"href\":\"https://svelte.dev/docs/svelte/\
             compiler-errors#css_unused_selector\"},\"source\":\"svelte\"}"
        );
    }

    #[test]
    fn machine_verbose_code_description_uses_warnings_anchor_for_warnings() {
        let ws = Path::new("/work");
        let d = diag(DiagnosticSeverity::Warning, "/work/A.svelte", 1, 1);
        let mut out = String::new();
        write_diagnostic(&mut out, &d, ws, OutputFormat::MachineVerbose);
        assert!(
            strip_epoch(out.trim_end()).contains(
                "\"codeDescription\":{\"href\":\"https://svelte.dev/docs/svelte/compiler-warnings#css_unused_selector\"}"
            ),
            "{out}"
        );
    }

    #[test]
    fn machine_verbose_ts_diagnostics_never_get_a_code_description() {
        let ws = Path::new("/work");
        let mut d = diag(DiagnosticSeverity::Error, "/work/src/foo.ts", 1, 1);
        d.source = "ts";
        d.code = Some("TS2322".into());
        let mut out = String::new();
        write_diagnostic(&mut out, &d, ws, OutputFormat::MachineVerbose);
        assert!(
            !strip_epoch(out.trim_end()).contains("codeDescription"),
            "{out}"
        );
    }

    #[test]
    fn machine_verbose_ts_code_is_a_json_number() {
        let ws = Path::new("/work");
        let mut d = diag(DiagnosticSeverity::Error, "/work/src/foo.ts", 1, 1);
        d.source = "ts";
        d.code = Some("TS2322".into());
        let mut out = String::new();
        write_diagnostic(&mut out, &d, ws, OutputFormat::MachineVerbose);
        assert!(
            strip_epoch(out.trim_end()).contains("\"code\":2322,"),
            "{out}"
        );
    }

    #[test]
    fn machine_verbose_omits_code_when_absent() {
        let ws = Path::new("/work");
        let mut d = diag(DiagnosticSeverity::Error, "/work/A.svelte", 1, 1);
        d.code = None;
        let mut out = String::new();
        write_diagnostic(&mut out, &d, ws, OutputFormat::MachineVerbose);
        let payload = strip_epoch(out.trim_end());
        assert!(!payload.contains("\"code\""), "{payload}");
        assert!(payload.contains("\"source\":\"svelte\""), "{payload}");
    }

    #[test]
    fn machine_verbose_missing_range_falls_back_to_file_start() {
        let ws = Path::new("/work");
        let mut d = diag(DiagnosticSeverity::Error, "/work/A.svelte", 1, 1);
        d.range = None;
        let mut out = String::new();
        write_diagnostic(&mut out, &d, ws, OutputFormat::MachineVerbose);
        let payload = strip_epoch(out.trim_end());
        assert!(
            payload.contains("\"start\":{\"line\":0,\"character\":0}"),
            "{payload}"
        );
        assert!(
            payload.contains("\"end\":{\"line\":0,\"character\":0}"),
            "{payload}"
        );
    }

    #[test]
    fn machine_terse_format_is_epoch_prefixed_and_one_based() {
        let ws = Path::new("/work");
        let d = diag(DiagnosticSeverity::Warning, "/work/src/Foo.svelte", 12, 3);
        let mut out = String::new();
        write_diagnostic(&mut out, &d, ws, OutputFormat::Machine);
        let line = out.trim_end();
        let (epoch, payload) = line.split_once(' ').expect("epoch-ms prefix");
        assert!(epoch.parse::<u128>().is_ok(), "not an epoch prefix: {line}");
        assert_eq!(
            payload,
            "WARNING \"src/Foo.svelte\" 12:4 \"Unused CSS selector \\\"foo\\\"\""
        );
    }

    #[test]
    fn machine_formats_drop_info_and_hint_diagnostics() {
        let ws = Path::new("/work");
        for severity in [DiagnosticSeverity::Info, DiagnosticSeverity::Hint] {
            let d = diag(severity, "/work/A.svelte", 1, 1);
            let mut out = String::new();
            write_diagnostic(&mut out, &d, ws, OutputFormat::MachineVerbose);
            assert!(out.is_empty(), "{severity:?}: {out}");
            let mut out = String::new();
            write_diagnostic(&mut out, &d, ws, OutputFormat::Machine);
            assert!(out.is_empty(), "{severity:?}: {out}");
        }
    }

    #[test]
    fn write_start_emits_json_quoted_workspace_path() {
        let ws = Path::new("/work/app");
        let mut out = String::new();
        write_start(&mut out, ws, OutputFormat::MachineVerbose);
        let payload = strip_epoch(out.trim_end());
        assert_eq!(payload, "START \"/work/app\"");

        // No-op for formats other than machine / machine-verbose.
        let mut out = String::new();
        write_start(&mut out, ws, OutputFormat::GithubActions);
        assert!(out.is_empty());
    }

    #[test]
    fn write_completion_emits_expected_counts() {
        let mut out = String::new();
        write_completion(&mut out, 5, 2, 1, 3, OutputFormat::Machine);
        let payload = strip_epoch(out.trim_end());
        assert_eq!(
            payload,
            "COMPLETED 5 FILES 2 ERRORS 1 WARNINGS 3 FILES_WITH_PROBLEMS"
        );

        let mut out = String::new();
        write_completion(&mut out, 5, 2, 1, 3, OutputFormat::HumanVerbose);
        assert!(out.is_empty());
    }

    #[test]
    fn count_files_with_problems_ignores_info_and_hint_and_dedupes() {
        let diags = vec![
            diag(DiagnosticSeverity::Error, "/work/A.svelte", 1, 1),
            diag(DiagnosticSeverity::Warning, "/work/A.svelte", 2, 1),
            diag(DiagnosticSeverity::Info, "/work/B.svelte", 1, 1),
            diag(DiagnosticSeverity::Error, "/work/C.svelte", 1, 1),
        ];
        assert_eq!(count_files_with_problems(&diags), 2);
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
