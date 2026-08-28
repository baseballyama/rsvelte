//! Lint-local output: a SARIF 2.1.0 writer and an `rsvelte-lint` summary line,
//! layered on top of the shared `svelte_check` writers.
//!
//! SARIF is a whole-document JSON format (it needs every result before it can
//! emit `results[]`), which doesn't fit the streaming `write_diagnostic` API —
//! so it lives here rather than in `rsvelte_core`, keeping the `svelte_check`
//! writers untouched. The summary line is also local so it can say
//! `rsvelte-lint found …` instead of `svelte-check found …`.

use std::collections::{BTreeMap, BTreeSet};
use std::fmt::Write as _;
use std::path::Path;

use rsvelte_diagnostics::{Diagnostic, DiagnosticSeverity};
use rsvelte_diagnostics::{OutputFormat, write_diagnostic};
use serde_json::{Value, json};

use crate::registry::all_rules;

/// CLI output format: the shared `svelte_check` formats plus SARIF.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum LintFormat {
    Core(OutputFormat),
    Sarif,
}

impl LintFormat {
    pub fn parse(s: &str) -> Option<Self> {
        if s == "sarif" {
            Some(Self::Sarif)
        } else {
            OutputFormat::parse(s).map(LintFormat::Core)
        }
    }
}

/// Render all diagnostics into the chosen format, returning the full output.
#[must_use]
pub fn render(
    diagnostics: &[Diagnostic],
    workspace_root: &Path,
    files_checked: usize,
    format: LintFormat,
    tool_version: &str,
) -> String {
    match format {
        LintFormat::Sarif => write_sarif(diagnostics, workspace_root, tool_version),
        LintFormat::Core(f) => {
            let mut out = String::new();
            for d in diagnostics {
                write_diagnostic(&mut out, d, workspace_root, f);
            }
            // The summary is only meaningful for the human-readable formats; the
            // machine / github-actions formats stay line-oriented.
            if matches!(f, OutputFormat::Human | OutputFormat::HumanVerbose) {
                write_summary(&mut out, diagnostics, files_checked);
            }
            out
        }
    }
}

/// `rsvelte-lint found X errors and Y warnings in N files`.
fn write_summary(out: &mut String, diagnostics: &[Diagnostic], files_checked: usize) {
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
        "\nrsvelte-lint found {} {} and {} {} in {} {}",
        errors,
        if errors == 1 { "error" } else { "errors" },
        warnings,
        if warnings == 1 { "warning" } else { "warnings" },
        files_checked,
        if files_checked == 1 { "file" } else { "files" },
    );
}

const fn sarif_level(severity: DiagnosticSeverity) -> &'static str {
    match severity {
        DiagnosticSeverity::Error => "error",
        DiagnosticSeverity::Warning => "warning",
        DiagnosticSeverity::Info | DiagnosticSeverity::Hint => "note",
    }
}

/// `render` for findings that still carry their `fix` / `suggestions` payload.
///
/// Only SARIF can express the payload; the line-oriented formats print the same
/// text either way, so they share `render`'s path.
#[cfg(feature = "native")]
#[must_use]
pub fn render_messages(
    messages: &[crate::diagnostic::LintMessage],
    workspace_root: &Path,
    files_checked: usize,
    format: LintFormat,
    tool_version: &str,
) -> String {
    let diagnostics: Vec<Diagnostic> = messages.iter().map(|m| m.diagnostic.clone()).collect();
    match format {
        LintFormat::Sarif => {
            let payloads: Vec<Payload> = messages
                .iter()
                .map(|m| Payload {
                    fix: m.fix.as_ref(),
                    suggestions: &m.suggestions,
                    omit_end: m.omit_end,
                })
                .collect();
            let refs: Vec<Option<&Payload>> = payloads.iter().map(Some).collect();
            sarif_document(&diagnostics, &refs, workspace_root, tool_version)
        }
        LintFormat::Core(_) => render(
            &diagnostics,
            workspace_root,
            files_checked,
            format,
            tool_version,
        ),
    }
}

/// Build a SARIF 2.1.0 document for the diagnostics.
#[must_use]
pub fn write_sarif(
    diagnostics: &[Diagnostic],
    workspace_root: &Path,
    tool_version: &str,
) -> String {
    let empty: Vec<Option<&Payload>> = vec![None; diagnostics.len()];
    sarif_document(diagnostics, &empty, workspace_root, tool_version)
}

/// The `--fix` / suggestion payload SARIF carries alongside a result.
///
/// SARIF's own `fixes[]` cannot express "offered but never auto-applied", so
/// both live under `properties` with byte offsets into the file's UTF-8 source
/// rather than SARIF regions — the form a differential comparison needs.
pub struct Payload<'a> {
    pub fix: Option<&'a crate::diagnostic::Fix>,
    pub suggestions: &'a [crate::diagnostic::Suggestion],
    pub omit_end: bool,
}

fn edits_json(fix: &crate::diagnostic::Fix) -> Value {
    Value::Array(
        fix.edits
            .iter()
            .map(|e| json!({ "start": e.start, "end": e.end, "text": e.new_text }))
            .collect(),
    )
}

fn sarif_document(
    diagnostics: &[Diagnostic],
    payloads: &[Option<&Payload>],
    workspace_root: &Path,
    tool_version: &str,
) -> String {
    // Native rule docs, for `tool.driver.rules[].shortDescription`.
    let docs: BTreeMap<String, &'static str> = all_rules()
        .iter()
        .map(|r| (r.meta().name.to_string(), r.meta().docs))
        .collect();

    // Collect the distinct rule ids actually present, in stable order.
    let mut rule_ids = BTreeSet::new();
    for d in diagnostics {
        if let Some(code) = &d.code {
            rule_ids.insert(code.clone());
        }
    }
    let rules: Vec<Value> = rule_ids
        .iter()
        .map(|id| {
            let mut rule = json!({ "id": id });
            if let Some(doc) = docs.get(id) {
                rule["shortDescription"] = json!({ "text": doc });
            }
            rule
        })
        .collect();

    let results: Vec<Value> = diagnostics
        .iter()
        .zip(payloads.iter().chain(std::iter::repeat(&None)))
        .map(|(d, p)| sarif_result(d, *p, workspace_root))
        .collect();

    let doc = json!({
        "$schema": "https://json.schemastore.org/sarif-2.1.0.json",
        "version": "2.1.0",
        "runs": [{
            "tool": { "driver": {
                "name": "rsvelte-lint",
                "informationUri": "https://github.com/baseballyama/rsvelte",
                "version": tool_version,
                "rules": rules,
            }},
            "results": results,
        }],
    });
    serde_json::to_string_pretty(&doc).unwrap_or_else(|_| "{}".to_string())
}

fn sarif_result(d: &Diagnostic, payload: Option<&Payload>, workspace_root: &Path) -> Value {
    let rel = d.file.strip_prefix(workspace_root).unwrap_or(&d.file);
    let uri = rel.to_string_lossy().replace('\\', "/");

    let mut location = json!({
        "physicalLocation": {
            "artifactLocation": { "uri": uri }
        }
    });
    if let Some(r) = d.range {
        // SARIF lines and columns are both 1-indexed. Our lines are already
        // 1-indexed; columns are 0-indexed → +1.
        let mut region = json!({
            "startLine": r.start.line.max(1),
            "startColumn": r.start.column + 1,
        });
        if !payload.is_some_and(|p| p.omit_end) {
            region["endLine"] = json!(r.end.line.max(1));
            region["endColumn"] = json!(r.end.column + 1);
        }
        location["physicalLocation"]["region"] = region;
    }

    let mut result = json!({
        "level": sarif_level(d.severity),
        "message": { "text": d.message },
        "locations": [location],
    });
    if let Some(code) = &d.code {
        result["ruleId"] = json!(code);
    }
    if let Some(p) = payload {
        let mut props = serde_json::Map::new();
        if let Some(fix) = p.fix {
            props.insert(
                "fix".into(),
                json!({ "message": fix.message, "edits": edits_json(fix) }),
            );
        }
        if !p.suggestions.is_empty() {
            props.insert(
                "suggestions".into(),
                Value::Array(
                    p.suggestions
                        .iter()
                        .map(|sg| json!({ "desc": sg.desc, "edits": edits_json(&sg.fix) }))
                        .collect(),
                ),
            );
        }
        if !props.is_empty() {
            result["properties"] = Value::Object(props);
        }
    }
    result
}

#[cfg(test)]
mod tests {
    use super::*;
    use rsvelte_diagnostics::{Position, Range};
    use std::path::PathBuf;

    fn diag() -> Diagnostic {
        Diagnostic {
            file: PathBuf::from("/work/src/Foo.svelte"),
            severity: DiagnosticSeverity::Error,
            code: Some("svelte/no-at-html-tags".into()),
            message: "`{@html}` can lead to XSS attack.".into(),
            range: Some(Range {
                start: Position { line: 5, column: 3 },
                end: Position { line: 5, column: 9 },
            }),
            source: "svelte",
        }
    }

    #[test]
    fn sarif_is_valid_json_with_one_indexed_region() {
        let out = write_sarif(&[diag()], Path::new("/work"), "0.1.0");
        let v: Value = serde_json::from_str(&out).unwrap();
        let result = &v["runs"][0]["results"][0];
        assert_eq!(result["ruleId"], "svelte/no-at-html-tags");
        assert_eq!(result["level"], "error");
        let region = &result["locations"][0]["physicalLocation"]["region"];
        assert_eq!(region["startLine"], 5);
        assert_eq!(region["startColumn"], 4); // 3 (0-indexed) + 1
        let uri = &v["runs"][0]["results"][0]["locations"][0]["physicalLocation"]["artifactLocation"]
            ["uri"];
        assert_eq!(uri, "src/Foo.svelte");
    }

    #[test]
    fn sarif_lists_rules_present() {
        let out = write_sarif(&[diag()], Path::new("/work"), "0.1.0");
        let v: Value = serde_json::from_str(&out).unwrap();
        let rules = v["runs"][0]["tool"]["driver"]["rules"].as_array().unwrap();
        assert!(rules.iter().any(|r| r["id"] == "svelte/no-at-html-tags"));
    }

    #[cfg(feature = "native")]
    #[test]
    fn sarif_omits_end_for_a_bare_upstream_location() {
        let message = crate::diagnostic::LintMessage {
            diagnostic: diag(),
            span: None,
            omit_end: true,
            help: None,
            fix: None,
            suggestions: Vec::new(),
        };
        let out = render_messages(
            &[message],
            Path::new("/work"),
            1,
            LintFormat::Sarif,
            "0.1.0",
        );
        let v: Value = serde_json::from_str(&out).unwrap();
        let region = &v["runs"][0]["results"][0]["locations"][0]["physicalLocation"]["region"];
        assert_eq!(region["startLine"], 5);
        assert_eq!(region["startColumn"], 4);
        assert!(region.get("endLine").is_none());
        assert!(region.get("endColumn").is_none());
    }

    #[test]
    fn parse_accepts_sarif_and_core() {
        assert_eq!(LintFormat::parse("sarif"), Some(LintFormat::Sarif));
        assert!(matches!(
            LintFormat::parse("human"),
            Some(LintFormat::Core(_))
        ));
        assert_eq!(LintFormat::parse("nope"), None);
    }
}
