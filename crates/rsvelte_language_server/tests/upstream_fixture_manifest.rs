#[path = "support/upstream_fixtures.rs"]
mod upstream_fixtures;

use std::collections::{BTreeMap, BTreeSet, HashMap};
use std::fs;
use std::path::Path;
use std::str::FromStr;
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};

use anyhow::{Context, Result};
use lsp_types::{
    CodeActionOrCommand, Color, Diagnostic, DiagnosticSeverity, DocumentSymbolResponse,
    FoldingRangeKind, HoverContents, NumberOrString, Range, Uri,
};
use regex::Regex;
use rsvelte_diagnostics::{
    Diagnostic as LintDiagnostic, DiagnosticSeverity as LintSeverity, Position as LintPosition,
    Range as LintRange,
};
use rsvelte_language_server::{
    code_actions, completions, css, diagnostics,
    document::Document,
    extract, folding, format, hover, html_tags, lint, selection_ranges,
    settings::{FormatConfig, WarningLevel},
    symbols,
};
use rsvelte_projection::{ProjectionEngine, Svelte2TsxOptions};
use upstream_fixtures::{BehaviorCase, Manifest, files_below, repo_root};

#[test]
fn snapshot_fixture_inventory_is_complete_and_parseable() -> Result<()> {
    let manifest = Manifest::load()?;
    assert_eq!(manifest.schema_version, 1);
    let mut ids = BTreeSet::new();
    let mut total = 0;
    for suite in &manifest.snapshot_suites {
        assert!(suite.request.starts_with("textDocument/"));
        let fixtures = manifest.snapshot_fixtures(suite)?;
        assert_eq!(
            fixtures.len(),
            suite.fixture_count,
            "{} fixture count",
            suite.id
        );
        total += fixtures.len();
        for fixture in fixtures {
            assert!(ids.insert(format!("{}:{}", suite.id, fixture.id)));
            assert!(fixture.directory.is_dir());
            assert!(fixture.input.is_file());
            let expected = fs::read_to_string(&fixture.expected)?;
            let _: serde_json::Value = serde_json::from_str(&expected)
                .with_context(|| format!("invalid {}", fixture.expected.display()))?;
        }
    }
    assert_eq!(total, 127);
    Ok(())
}

#[test]
fn typescript_testfiles_are_reused_as_one_project_tree() -> Result<()> {
    let manifest = Manifest::load()?;
    let files = manifest.testfiles()?;
    assert_eq!(files.len(), manifest.testfiles.file_count);

    let mut extensions = BTreeMap::<String, usize>::new();
    for file in &files {
        let key = if file.file_name().is_some_and(|name| name == ".prettierrc") {
            "prettierrc".to_string()
        } else {
            file.extension()
                .context("testfile has neither an extension nor a declared special name")?
                .to_string_lossy()
                .to_string()
        };
        *extensions.entry(key).or_default() += 1;
    }
    assert_eq!(extensions, manifest.testfiles.extensions);
    assert_eq!(
        files
            .iter()
            .filter(|path| path
                .extension()
                .is_some_and(|extension| extension == "svelte"))
            .count(),
        manifest.testfiles.svelte_count
    );
    Ok(())
}

#[test]
fn fixture_walk_ignores_generated_and_dependency_directories() -> Result<()> {
    let nonce = SystemTime::now().duration_since(UNIX_EPOCH)?.as_nanos();
    let root = repo_root().join("target").join(format!(
        "upstream-fixture-walk-{}-{nonce}",
        std::process::id()
    ));
    fs::create_dir_all(root.join("fixtures/kept"))?;
    fs::create_dir_all(root.join("fixtures/.rsvelte-language-server/tsgo"))?;
    fs::create_dir_all(root.join("fixtures/node_modules/pkg"))?;
    fs::create_dir_all(root.join("fixtures/.git/objects"))?;
    fs::write(root.join("fixtures/kept/input.svelte"), "<p />")?;
    fs::write(
        root.join("fixtures/.rsvelte-language-server/tsgo/cache.json"),
        "{}",
    )?;
    fs::write(root.join("fixtures/node_modules/pkg/index.js"), "")?;
    fs::write(root.join("fixtures/.git/objects/object"), "")?;

    let files = files_below(&root.join("fixtures"));
    fs::remove_dir_all(&root)?;
    let files = files?;
    assert_eq!(files.len(), 1);
    assert!(files[0].ends_with("kept/input.svelte"));
    Ok(())
}

#[test]
fn ts_independent_unit_sources_have_native_behavior_cases() -> Result<()> {
    let manifest = Manifest::load()?;
    let upstream = manifest.upstream_root();
    let source = repo_root().join("crates/rsvelte_language_server/src");
    let it_call = Regex::new(r"\bit\s*\(")?;
    let it_name = Regex::new(r#"\bit\s*\(\s*(?:'([^']*)'|"([^"]*)"|`([^`]*)`)"#)?;
    let cases = manifest
        .behavior_cases
        .iter()
        .map(|case| (case.id.as_str(), case))
        .collect::<HashMap<_, _>>();
    let mut total = 0;
    let mut ported = 0;
    let mut unported = 0;
    for suite in &manifest.unit_suites {
        assert_eq!(
            suite.disposition,
            "native-adapted",
            "{}",
            suite.path.display()
        );
        assert!(!suite.providers.is_empty(), "{}", suite.path.display());
        let test_source = fs::read_to_string(upstream.join(&suite.path))?;
        let count = it_call.find_iter(&test_source).count();
        assert_eq!(count, suite.it_call_sites, "{}", suite.path.display());
        assert_eq!(
            suite.ported_behavior_cases + suite.unported_it_call_sites,
            suite.it_call_sites,
            "{}",
            suite.path.display()
        );
        let suite_cases = manifest
            .behavior_cases
            .iter()
            .filter(|case| case.upstream_suite == suite.path)
            .collect::<Vec<_>>();
        assert_eq!(
            suite_cases.len(),
            suite.ported_behavior_cases,
            "{}",
            suite.path.display()
        );
        let callsite_names = it_name
            .captures_iter(&test_source)
            .map(|captures| {
                captures
                    .iter()
                    .skip(1)
                    .flatten()
                    .next()
                    .expect("it call has a name")
                    .as_str()
                    .to_string()
            })
            .fold(BTreeMap::<String, usize>::new(), |mut names, name| {
                *names.entry(name).or_default() += 1;
                names
            });
        let behavior_names =
            suite_cases
                .iter()
                .fold(BTreeMap::<String, usize>::new(), |mut names, case| {
                    let name = case
                        .upstream_test
                        .split_once(" [")
                        .map_or(case.upstream_test.as_str(), |(name, _)| name)
                        .to_string();
                    *names.entry(name).or_default() += 1;
                    names
                });
        assert_eq!(behavior_names, callsite_names, "{}", suite.path.display());
        for case in suite_cases {
            assert!(cases.contains_key(case.id.as_str()));
            assert!(!case.upstream_test.trim().is_empty());
            assert_eq!(
                case.native_expected.is_some(),
                case.difference_reason.is_some(),
                "{}",
                case.id
            );
            if let Some(reason) = &case.difference_reason {
                assert!(!reason.trim().is_empty(), "{}", case.id);
                assert_ne!(
                    case.native_expected.as_ref(),
                    Some(&case.expected),
                    "{}",
                    case.id
                );
            }
        }
        total += count;
        ported += suite.ported_behavior_cases;
        unported += suite.unported_it_call_sites;
        for module in &suite.rsvelte_modules {
            assert!(
                source.join(module).is_file(),
                "missing adapter owner {}",
                module.display()
            );
        }
    }
    assert_eq!(manifest.unit_suites.len(), 11);
    assert_eq!(total, manifest.unit_coverage.upstream_it_call_sites);
    assert_eq!(ported, manifest.unit_coverage.ported_behavior_cases);
    assert_eq!(unported, manifest.unit_coverage.unported_it_call_sites);
    assert_eq!(manifest.behavior_cases.len(), ported);
    let known_differences = manifest
        .behavior_cases
        .iter()
        .filter(|case| case.native_expected.is_some())
        .count();
    assert_eq!(
        known_differences,
        manifest.unit_coverage.known_difference_cases
    );
    assert_eq!(
        ported - known_differences,
        manifest.unit_coverage.exact_behavior_cases
    );
    Ok(())
}

#[test]
fn ported_unit_cases_assert_native_provider_responses() -> Result<()> {
    let manifest = Manifest::load()?;
    for case in &manifest.behavior_cases {
        run_behavior_case(case).with_context(|| case.id.clone())?;
    }
    Ok(())
}

fn run_behavior_case(case: &BehaviorCase) -> Result<()> {
    match case.id.as_str() {
        "svelte-document-text" => {
            let document = Document::new(
                Uri::from_str("file:///App.svelte")?,
                "svelte".to_string(),
                1,
                case.source.clone(),
            );
            assert_eq!(document.text(), case.source);
            assert_eq!(case.expected["text_equals_source"], true);
        }
        "document-compile-filename" => {
            let path = Path::new(
                case.params["path"]
                    .as_str()
                    .context("path must be a string")?,
            );
            let diagnostics =
                lint::lint(path, &case.source, &rsvelte_lint::LintConfig::recommended());
            assert!(!diagnostics.is_empty());
            assert!(diagnostics.iter().all(|diagnostic| diagnostic.file == path));
            assert_eq!(path.to_str(), case.expected["diagnostic_file"].as_str());
        }
        id if id.starts_with("document-map-") => {
            let (source, offset) = source_at_marker(case)?;
            let artifact =
                ProjectionEngine::new().project(&source, Svelte2TsxOptions::default())?;
            let mappings = artifact
                .exact_mappings
                .context("projection did not expose exact mappings")?;
            let source_offset = u32::try_from(offset)?;
            let generated = mappings.source_to_generated(source_offset);
            if case
                .native_expected
                .as_ref()
                .is_some_and(|expected| expected["mapped"] == false)
            {
                assert!(generated.is_empty(), "{}", case.id);
            } else {
                assert!(!generated.is_empty(), "{}", case.id);
                assert!(
                    generated
                        .into_iter()
                        .all(|offset| mappings.generated_to_source(offset) == Some(source_offset)),
                    "{}",
                    case.id
                );
            }
            assert_eq!(case.expected["roundtrip"], true);
        }
        "svelte-plugin-warning" => {
            assert_eq!(
                compiler_diagnostic_codes(&case.source),
                expected_strings(case, "codes")?
            );
        }
        "plugin-diagnostic-error" | "plugin-diagnostic-untrusted" => {
            let actual = compiler_diagnostic_codes(&case.source);
            if let Some(native_expected) = &case.native_expected {
                let native: Vec<String> = serde_json::from_value(native_expected["codes"].clone())?;
                assert_eq!(actual, native);
                assert_ne!(actual, expected_strings(case, "codes")?);
            } else {
                assert_eq!(actual, expected_strings(case, "codes")?);
            }
        }
        id if id.starts_with("plugin-format-") => {
            let config = FormatConfig {
                sort_order: None,
                strict_mode: None,
                allow_shorthand: None,
                bracket_new_line: None,
                indent_script_and_style: None,
                print_width: None,
                single_quote: None,
            };
            let output = format::apply_editor_config(
                &case.source,
                Path::new("/tmp/rsvelte-upstream-fixture/App.svelte"),
                &config,
            )?;
            let needle = case
                .native_expected
                .as_ref()
                .and_then(|expected| expected["contains"].as_str())
                .context("native format expectation must contain text")?;
            assert!(output.contains(needle), "{}: {output:?}", case.id);
        }
        "plugin-cancel-completion" => {
            let (source, offset) = source_at_marker(case)?;
            let actual = completions::completions(&source, offset)
                .context("no synchronous completion response")?
                .items
                .into_iter()
                .map(|item| item.label)
                .collect::<Vec<_>>();
            let native: Vec<String> = serde_json::from_value(
                case.native_expected
                    .as_ref()
                    .context("native expectation")?["labels"]
                    .clone(),
            )?;
            assert_eq!(actual, native);
            assert!(case.expected["labels"].is_null());
        }
        "plugin-cancel-code-action" => {
            let range: Range = serde_json::from_value(case.params["range"].clone())?;
            let code = case.params["diagnostic_code"]
                .as_str()
                .context("diagnostic_code must be a string")?;
            let diagnostic = Diagnostic {
                range,
                severity: Some(DiagnosticSeverity::WARNING),
                code: Some(NumberOrString::String(code.to_string())),
                source: Some("svelte".to_string()),
                ..Diagnostic::default()
            };
            let uri = Uri::from_str("file:///App.svelte")?;
            let actual = action_titles(code_actions::quickfixes(&case.source, &uri, &[diagnostic]));
            let native: Vec<String> = serde_json::from_value(
                case.native_expected
                    .as_ref()
                    .context("native expectation")?["titles"]
                    .clone(),
            )?;
            assert_eq!(actual, native);
            assert!(expected_strings(case, "titles")?.is_empty());
        }
        "svelte-diagnostic-filter" => {
            let code = case.params["diagnostic_code"]
                .as_str()
                .context("diagnostic_code must be a string")?;
            let message = case.params["message"]
                .as_str()
                .context("message must be a string")?;
            let diagnostic = Diagnostic {
                range: Range::default(),
                severity: Some(DiagnosticSeverity::WARNING),
                code: Some(NumberOrString::String(code.to_string())),
                source: Some("svelte".to_string()),
                message: message.to_string(),
                ..Diagnostic::default()
            };
            assert_eq!(
                diagnostics::keep_raw_compiler_diagnostic(&diagnostic, &case.source),
                case.expected["keep"]
                    .as_bool()
                    .context("keep must be a boolean")?
            );
        }
        "diagnostics-filter-namespace" => {
            let diagnostic = Diagnostic {
                range: Range::default(),
                severity: Some(DiagnosticSeverity::WARNING),
                code: case.params["diagnostic_code"]
                    .as_str()
                    .map(|code| NumberOrString::String(code.to_string())),
                source: Some("svelte".to_string()),
                message: case.params["message"]
                    .as_str()
                    .unwrap_or_default()
                    .to_string(),
                ..Diagnostic::default()
            };
            assert_eq!(
                diagnostics::keep_raw_compiler_diagnostic(&diagnostic, &case.source),
                case.expected["keep"].as_bool().context("keep boolean")?
            );
        }
        id if id.starts_with("diagnostics-preprocess-") => {
            let actual = diagnostics::preprocess_failure(
                case.params["message"]
                    .as_str()
                    .context("preprocess message")?,
            );
            let native = case
                .native_expected
                .as_ref()
                .context("native expectation")?;
            assert_eq!(severity_name(actual.severity), native["severity"].as_str());
            assert_eq!(actual.source.as_deref(), native["source"].as_str());
            assert!(
                actual.message.contains(
                    native["message_contains"]
                        .as_str()
                        .context("message substring")?
                ),
                "{}",
                case.id
            );
        }
        id if id.starts_with("diagnostics-convert-") => {
            let diagnostic = lint_diagnostic(case)?;
            let mut levels = HashMap::new();
            if let Some(code) = case.params["code"].as_str() {
                match case.params["warning_level"].as_str() {
                    Some("ignore") => {
                        levels.insert(code.to_string(), WarningLevel::Ignore);
                    }
                    Some("error") => {
                        levels.insert(code.to_string(), WarningLevel::Error);
                    }
                    _ => {}
                }
            }
            let actual = diagnostics::to_lsp(&diagnostic, &Arc::new(levels));
            if case.expected.get("response").is_some() && case.expected["response"].is_null() {
                assert!(actual.is_none(), "{}", case.id);
            } else {
                let actual = actual.context("no converted diagnostic")?;
                let expected = case.native_expected.as_ref().unwrap_or(&case.expected);
                if let Some(code) = expected["code"].as_str() {
                    assert_eq!(actual.code, Some(NumberOrString::String(code.to_string())));
                }
                if let Some(severity) = expected["severity"].as_str() {
                    assert_eq!(severity_name(actual.severity), Some(severity));
                }
                if !expected["range"].is_null() {
                    let range: Range = serde_json::from_value(expected["range"].clone())?;
                    assert_eq!(actual.range, range, "{}", case.id);
                }
            }
        }
        id if id.starts_with("html-smoke-") => {
            let adapter = case.params["adapter"].as_str().context("HTML adapter")?;
            let expected = case.native_expected.as_ref().unwrap_or(&case.expected);
            match adapter {
                "hover" => {
                    let (source, offset) = source_at_marker(case)?;
                    let response = hover::hover(&source, offset);
                    assert_response(response.is_some(), expected, case)?;
                }
                "completion" => {
                    let (source, offset) = source_at_marker(case)?;
                    let response = completions::completions(&source, offset);
                    assert_response(response.is_some(), expected, case)?;
                    if let Some(labels) = expected["labels_contain"].as_array() {
                        let actual = response
                            .context("expected completion response")?
                            .items
                            .into_iter()
                            .map(|item| item.label)
                            .collect::<BTreeSet<_>>();
                        for label in labels {
                            let label = label.as_str().context("completion label")?;
                            assert!(actual.contains(label), "{}: missing {label}", case.id);
                        }
                    }
                }
                "linked" => {
                    let (source, offset) = source_at_marker(case)?;
                    let response = html_tags::linked_ranges(&source, offset);
                    assert_response(response.is_some(), expected, case)?;
                    if let Some(count) = expected["count"].as_u64() {
                        assert_eq!(
                            response.context("linked response")?.ranges.len(),
                            count as usize,
                            "{}",
                            case.id
                        );
                    }
                }
                "highlight" => {
                    let (source, offset) = source_at_marker(case)?;
                    assert_eq!(
                        html_tags::highlights(&source, offset).len(),
                        expected["count"].as_u64().context("highlight count")? as usize,
                        "{}",
                        case.id
                    );
                }
                "fold" => {
                    let mut actual = folding::folding_ranges(&case.source, true)
                        .into_iter()
                        .map(|range| [range.start_line, range.end_line])
                        .collect::<Vec<_>>();
                    actual.sort_unstable();
                    let ranges: Vec<[u32; 2]> = serde_json::from_value(expected["ranges"].clone())?;
                    assert_eq!(actual, ranges, "{}", case.id);
                }
                other => anyhow::bail!("unknown HTML adapter {other}"),
            }
        }
        "svelte-code-action-ignore" => {
            let range: Range = serde_json::from_value(case.params["range"].clone())?;
            let code = case.params["diagnostic_code"]
                .as_str()
                .context("diagnostic_code must be a string")?;
            let diagnostic = Diagnostic {
                range,
                severity: Some(DiagnosticSeverity::WARNING),
                code: Some(NumberOrString::String(code.to_string())),
                source: Some("svelte".to_string()),
                ..Diagnostic::default()
            };
            let uri = Uri::from_str("file:///App.svelte")?;
            let titles = code_actions::quickfixes(&case.source, &uri, &[diagnostic])
                .into_iter()
                .map(|action| match action {
                    CodeActionOrCommand::CodeAction(action) => action.title,
                    CodeActionOrCommand::Command(command) => command.title,
                })
                .collect::<Vec<_>>();
            assert_eq!(titles, expected_strings(case, "titles")?);
        }
        id if id.starts_with("code-action-extract-") => {
            let source = behavior_source(case)?;
            let range: Range = serde_json::from_value(case.params["range"].clone())?;
            let path = case.params["path"]
                .as_str()
                .context("extract path must be a string")?;
            let uri = case.params["uri"]
                .as_str()
                .unwrap_or("file:///tmp/App.svelte");
            let result = extract::component(&source, uri, range, path);
            if let Some(error) = case.expected["error"].as_str() {
                assert_eq!(result.unwrap_err(), error);
            } else {
                let edit = result.map_err(anyhow::Error::msg)?;
                if let Some(replacement) = case.expected["replacement"].as_str() {
                    assert_eq!(
                        edit["documentChanges"][0]["edits"][0]["newText"],
                        replacement
                    );
                }
                if let Some(needles) = case.expected["created_contains"].as_array() {
                    let created = edit["documentChanges"][2]["edits"][0]["newText"]
                        .as_str()
                        .context("created component text")?;
                    for needle in needles {
                        let needle = needle.as_str().context("created text needle")?;
                        assert!(created.contains(needle), "{}: missing {needle:?}", case.id);
                    }
                }
            }
        }
        id if id.starts_with("code-action-") => {
            let source = behavior_source(case)?;
            let range: Range = serde_json::from_value(case.params["range"].clone())?;
            let severity = match case.params["severity"].as_str() {
                Some("error") => Some(DiagnosticSeverity::ERROR),
                Some("warning") => Some(DiagnosticSeverity::WARNING),
                _ => None,
            };
            let diagnostic = Diagnostic {
                range,
                severity,
                code: case.params["diagnostic_code"]
                    .as_str()
                    .map(|code| NumberOrString::String(code.to_string())),
                source: case.params["diagnostic_source"]
                    .as_str()
                    .map(str::to_string),
                ..Diagnostic::default()
            };
            let uri = Uri::from_str("file:///App.svelte")?;
            let actual = action_titles(code_actions::quickfixes(&source, &uri, &[diagnostic]));
            if let Some(native_expected) = &case.native_expected {
                let native: Vec<String> =
                    serde_json::from_value(native_expected["titles"].clone())?;
                assert_eq!(actual, native, "{}", case.id);
                assert_ne!(actual, expected_strings(case, "titles")?, "{}", case.id);
            } else {
                assert_eq!(actual, expected_strings(case, "titles")?, "{}", case.id);
            }
        }
        "svelte-block-completions" => {
            let (source, offset) = source_at_marker(case)?;
            let labels = completions::completions(&source, offset)
                .context("no completion response")?
                .items
                .into_iter()
                .map(|item| item.label)
                .collect::<Vec<_>>();
            assert_eq!(labels, expected_strings(case, "labels")?);
        }
        "completion-component-doc" => {
            let (source, offset) = source_at_marker(case)?;
            let response = completions::completions(&source, offset)
                .context("no component documentation completion response")?;
            assert_eq!(
                response
                    .items
                    .first()
                    .and_then(|item| item.insert_text.as_deref()),
                case.expected["first_insert_text"].as_str()
            );
        }
        id if id.starts_with("completion-") => {
            let (source, offset) = source_at_marker(case)?;
            let actual = completions::completions(&source, offset).map(|list| {
                list.items
                    .into_iter()
                    .map(|item| item.label)
                    .collect::<Vec<_>>()
            });
            let official: Option<Vec<String>> =
                serde_json::from_value(case.expected["labels"].clone())?;
            if let Some(native_expected) = &case.native_expected {
                if native_expected["response"] == "nonempty" {
                    assert!(actual.as_ref().is_some_and(|labels| !labels.is_empty()));
                    assert_ne!(actual, official);
                } else {
                    let native: Option<Vec<String>> =
                        serde_json::from_value(native_expected["labels"].clone())?;
                    assert_eq!(actual, native);
                    assert_ne!(actual, official);
                }
            } else {
                assert_eq!(actual, official);
            }
        }
        "svelte-if-hover" => {
            let (source, offset) = source_at_marker(case)?;
            let response = hover::hover(&source, offset).context("no hover response")?;
            let HoverContents::Markup(markup) = response.contents else {
                anyhow::bail!("hover response was not markup");
            };
            let needle = case.expected["markdown_contains"]
                .as_str()
                .context("markdown_contains must be a string")?;
            assert!(markup.value.contains(needle), "{}", markup.value);
        }
        id if id.starts_with("hover-") => {
            let official = case.expected["markdown_contains"].as_str();
            let actual = hover_markdown(&case.source)?;
            if let Some(native_expected) = &case.native_expected {
                let native = native_expected["markdown_contains"]
                    .as_str()
                    .context("native markdown expectation must be a string")?;
                assert_eq!(
                    actual.as_deref().map(|value| value.contains(native)),
                    Some(true)
                );
                assert!(official.is_none());
            } else {
                assert_markdown(actual.as_deref(), official);
            }
            if let Some(samples) = case.params["samples"].as_array() {
                for sample in samples {
                    let source = sample["source"]
                        .as_str()
                        .context("hover sample source must be a string")?;
                    assert_markdown(
                        hover_markdown(source)?.as_deref(),
                        sample["markdown_contains"].as_str(),
                    );
                }
            }
        }
        "svelte-element-selection" => {
            let (source, offset) = source_at_marker(case)?;
            let mut selection = selection_ranges::selection_ranges(&source, &[offset])
                .context("no selection response")?
                .into_iter()
                .next()
                .context("empty selection response")?;
            let mut actual = vec![selection.range];
            while let Some(parent) = selection.parent {
                selection = *parent;
                actual.push(selection.range);
            }
            let official: Vec<Range> = serde_json::from_value(case.expected["ranges"].clone())?;
            if let Some(native_expected) = &case.native_expected {
                let native: Vec<Range> = serde_json::from_value(native_expected["ranges"].clone())?;
                assert_eq!(actual, native);
                assert_ne!(actual, official);
            } else {
                assert_eq!(actual, official);
            }
        }
        id if id.starts_with("selection-") => {
            let actual = selection_range_chain(&case.source)?;
            let official: Option<Vec<Range>> =
                serde_json::from_value(case.expected["ranges"].clone())?;
            if let Some(native_expected) = &case.native_expected {
                let native: Option<Vec<Range>> =
                    serde_json::from_value(native_expected["ranges"].clone())?;
                assert_eq!(actual, native, "{}", case.id);
                assert_ne!(actual, official, "{}", case.id);
            } else {
                assert_eq!(actual, official, "{}", case.id);
            }
            if let Some(samples) = case.params["samples"].as_array() {
                for sample in samples {
                    let source = sample["source"]
                        .as_str()
                        .context("selection sample must be a string")?;
                    let expected = if sample.get("native_ranges").is_some() {
                        serde_json::from_value(sample["native_ranges"].clone())?
                    } else {
                        official.clone()
                    };
                    assert_eq!(selection_range_chain(source)?, expected, "{}", case.id);
                }
            }
        }
        "html-document-highlight" => {
            let (source, offset) = source_at_marker(case)?;
            let actual = html_tags::highlights(&source, offset)
                .into_iter()
                .map(|highlight| highlight.range)
                .collect::<Vec<_>>();
            let expected: Vec<Range> = serde_json::from_value(case.expected["ranges"].clone())?;
            assert_eq!(actual, expected, "{}", case.id);
        }
        "html-folding" => {
            let mut actual = folding::folding_ranges(&case.source, true)
                .into_iter()
                .map(|range| [range.start_line, range.end_line])
                .collect::<Vec<_>>();
            actual.sort_unstable();
            let expected: Vec<[u32; 2]> =
                serde_json::from_value(case.expected["line_ranges"].clone())?;
            assert_eq!(actual, expected);
        }
        id if id.starts_with("fold-") => {
            let mut actual = folding::folding_ranges(&case.source, true)
                .into_iter()
                .map(|range| {
                    let kind = if range.kind == Some(FoldingRangeKind::Comment) {
                        Some("comment".to_string())
                    } else if range.kind == Some(FoldingRangeKind::Region) {
                        Some("region".to_string())
                    } else {
                        None
                    };
                    (range.start_line, range.end_line, kind)
                })
                .collect::<Vec<_>>();
            actual.sort_by_key(|range| range.0);
            let official: Vec<(u32, u32, Option<String>)> =
                serde_json::from_value(case.expected["ranges"].clone())?;
            if let Some(native_expected) = &case.native_expected {
                let native: Vec<(u32, u32, Option<String>)> =
                    serde_json::from_value(native_expected["ranges"].clone())?;
                assert_eq!(actual, native, "{}", case.id);
                assert_ne!(actual, official, "{}", case.id);
            } else {
                assert_eq!(actual, official, "{}", case.id);
            }
        }
        id if id.starts_with("css-smoke-") => {
            let expected = case.native_expected.as_ref().unwrap_or(&case.expected);
            match case.params["adapter"].as_str() {
                Some("hover") => {
                    let (source, offset) = source_at_marker(case)?;
                    assert_response(css::hover(&source, offset).is_some(), expected, case)?;
                }
                Some("completion") => {
                    let (source, offset) = source_at_marker(case)?;
                    assert_response(css::completions(&source, offset).is_some(), expected, case)?;
                }
                Some("diagnostics") => {
                    assert_eq!(
                        css::diagnostics(&case.source).len(),
                        expected["count"],
                        "{}",
                        case.id
                    );
                }
                Some("color-services") => {
                    let color = Color {
                        red: 0.0,
                        green: 0.0,
                        blue: 255.0,
                        alpha: 1.0,
                    };
                    let labels = css::color_presentations(color)
                        .into_iter()
                        .map(|presentation| presentation.label)
                        .collect::<Vec<_>>();
                    let expected_labels: Vec<String> =
                        serde_json::from_value(expected["presentation_labels"].clone())?;
                    assert_eq!(labels, expected_labels, "{}", case.id);
                    if let Some(count) = expected["document_color_count"].as_u64() {
                        assert_eq!(
                            css::colors(&case.source).len(),
                            count as usize,
                            "{}",
                            case.id
                        );
                    }
                }
                Some("symbols") => {
                    let uri = Uri::from_str("file:///hello.svelte")?;
                    let names = match symbols::document_symbols(&case.source, &uri, false) {
                        DocumentSymbolResponse::Flat(symbols) => symbols
                            .into_iter()
                            .map(|symbol| symbol.name)
                            .collect::<Vec<_>>(),
                        DocumentSymbolResponse::Nested(_) => {
                            anyhow::bail!("flat document symbols returned a tree")
                        }
                    };
                    let expected: Vec<String> = serde_json::from_value(expected["names"].clone())?;
                    assert_eq!(names, expected, "{}", case.id);
                }
                Some("selection") => {
                    let (source, offset) = source_at_marker(case)?;
                    let spans = css::selection_spans(&source, offset);
                    if expected.get("spans").is_some() {
                        let expected: Vec<(u32, u32)> =
                            serde_json::from_value(expected["spans"].clone())?;
                        assert_eq!(spans, expected, "{}", case.id);
                    } else {
                        assert_eq!(spans.len(), expected["count"], "{}", case.id);
                    }
                }
                Some("fold") => {
                    let actual = folding::folding_ranges(&case.source, true)
                        .into_iter()
                        .map(|range| {
                            let kind = (range.kind == Some(FoldingRangeKind::Region))
                                .then_some("region".to_string());
                            (range.start_line, range.end_line, kind)
                        })
                        .collect::<Vec<_>>();
                    let expected: Vec<(u32, u32, Option<String>)> =
                        serde_json::from_value(expected["ranges"].clone())?;
                    assert_eq!(actual, expected, "{}", case.id);
                }
                Some("highlight") => {
                    let (source, offset) = source_at_marker(case)?;
                    assert_eq!(
                        html_tags::highlights(&source, offset).len(),
                        expected["count"],
                        "{}",
                        case.id
                    );
                }
                adapter => anyhow::bail!("unsupported CSS adapter {adapter:?}"),
            }
        }
        id if id.starts_with("css-id-") => {
            let (source, offset) = source_at_marker(case)?;
            let actual = css::completions(&source, offset).map(|response| {
                response
                    .items
                    .into_iter()
                    .map(|item| item.label)
                    .collect::<Vec<_>>()
            });
            let expected = case.native_expected.as_ref().unwrap_or(&case.expected);
            let labels: Option<Vec<String>> = serde_json::from_value(expected["labels"].clone())?;
            assert_eq!(actual, labels, "{}", case.id);
        }
        "css-unknown-property" => {
            let actual = css::diagnostics(&case.source)
                .into_iter()
                .filter_map(|diagnostic| diagnostic.code)
                .map(|code| match code {
                    NumberOrString::String(code) => code,
                    NumberOrString::Number(code) => code.to_string(),
                })
                .collect::<Vec<_>>();
            let official = expected_strings(case, "codes")?;
            if let Some(native_expected) = &case.native_expected {
                let native: Vec<String> = serde_json::from_value(native_expected["codes"].clone())?;
                assert_eq!(actual, native);
                assert_ne!(actual, official);
            } else {
                assert_eq!(actual, official);
            }
        }
        "css-selector-completion" => {
            let (source, offset) = source_at_marker(case)?;
            let response = css::completions(&source, offset);
            if case.native_expected.is_some() {
                assert!(response.is_none());
                assert!(!expected_strings(case, "labels")?.is_empty());
            } else {
                let labels = response
                    .context("no CSS completion response")?
                    .items
                    .into_iter()
                    .map(|item| item.label)
                    .collect::<Vec<_>>();
                assert_eq!(labels, expected_strings(case, "labels")?);
            }
        }
        id => anyhow::bail!("behavior case {id} has no native adapter"),
    }
    assert!(!case.method.trim().is_empty());
    Ok(())
}

fn compiler_diagnostic_codes(source: &str) -> Vec<String> {
    let config = rsvelte_lint::LintConfig::recommended();
    let warnings = Default::default();
    lint::lint(Path::new("App.svelte"), source, &config)
        .iter()
        .filter_map(|diagnostic| diagnostics::to_lsp(diagnostic, &warnings))
        .filter_map(|diagnostic| diagnostic.code)
        .filter_map(|code| match code {
            NumberOrString::String(code) if diagnostics::is_compiler_code(&code) => Some(code),
            _ => None,
        })
        .collect()
}

fn source_at_marker(case: &BehaviorCase) -> Result<(String, usize)> {
    let offset = case.source.find('¦').context("source has no marker")?;
    let mut source = case.source.clone();
    source.replace_range(offset..offset + '¦'.len_utf8(), "");
    Ok((source, offset))
}

fn hover_markdown(marked_source: &str) -> Result<Option<String>> {
    let offset = marked_source.find('¦').context("source has no marker")?;
    let mut source = marked_source.to_string();
    source.replace_range(offset..offset + '¦'.len_utf8(), "");
    Ok(
        hover::hover(&source, offset).map(|response| match response.contents {
            HoverContents::Markup(markup) => markup.value,
            other => format!("{other:?}"),
        }),
    )
}

fn selection_range_chain(marked_source: &str) -> Result<Option<Vec<Range>>> {
    let offset = marked_source.find('¦').context("source has no marker")?;
    let mut source = marked_source.to_string();
    source.replace_range(offset..offset + '¦'.len_utf8(), "");
    let Some(mut selection) = selection_ranges::selection_ranges(&source, &[offset])
        .and_then(|ranges| ranges.into_iter().next())
    else {
        return Ok(None);
    };
    let mut ranges = vec![selection.range];
    while let Some(parent) = selection.parent {
        selection = *parent;
        ranges.push(selection.range);
    }
    Ok(Some(ranges))
}

fn assert_markdown(actual: Option<&str>, expected_contains: Option<&str>) {
    match expected_contains {
        Some(needle) => assert!(actual.is_some_and(|value| value.contains(needle))),
        None => assert_eq!(actual, None),
    }
}

fn expected_strings(case: &BehaviorCase, key: &str) -> Result<Vec<String>> {
    serde_json::from_value(case.expected[key].clone()).context("expected string array")
}

fn action_titles(actions: Vec<CodeActionOrCommand>) -> Vec<String> {
    actions
        .into_iter()
        .map(|action| match action {
            CodeActionOrCommand::CodeAction(action) => action.title,
            CodeActionOrCommand::Command(command) => command.title,
        })
        .collect()
}

fn behavior_source(case: &BehaviorCase) -> Result<String> {
    match &case.fixture {
        Some(path) => fs::read_to_string(
            repo_root()
                .join("submodules/language-tools/packages/language-server/test/plugins")
                .join(path),
        )
        .with_context(|| format!("could not read {}", path.display())),
        None => Ok(case.source.clone()),
    }
}

fn lint_diagnostic(case: &BehaviorCase) -> Result<LintDiagnostic> {
    let severity = match case.params["severity"].as_str() {
        Some("error") => LintSeverity::Error,
        Some("warning") => LintSeverity::Warning,
        other => anyhow::bail!("unsupported lint severity {other:?}"),
    };
    let range = case.params.get("range").map(|range| {
        let position = |value: &serde_json::Value| LintPosition {
            line: value["line"].as_u64().unwrap_or_default() as u32,
            column: value["column"].as_u64().unwrap_or_default() as u32,
        };
        LintRange {
            start: position(&range["start"]),
            end: position(&range["end"]),
        }
    });
    Ok(LintDiagnostic {
        file: Path::new("App.svelte").to_path_buf(),
        severity,
        code: case.params["code"].as_str().map(str::to_string),
        message: case.params["message"]
            .as_str()
            .unwrap_or_default()
            .to_string(),
        range,
        source: "svelte",
    })
}

fn severity_name(severity: Option<DiagnosticSeverity>) -> Option<&'static str> {
    match severity {
        Some(DiagnosticSeverity::ERROR) => Some("error"),
        Some(DiagnosticSeverity::WARNING) => Some("warning"),
        _ => None,
    }
}

fn assert_response(actual: bool, expected: &serde_json::Value, case: &BehaviorCase) -> Result<()> {
    match expected["response"].as_str() {
        Some("some") => assert!(actual, "{}", case.id),
        Some("none") => assert!(!actual, "{}", case.id),
        other => anyhow::bail!("invalid response expectation {other:?}"),
    }
    Ok(())
}

#[test]
fn exclusions_are_explicit_and_point_at_real_upstream_skips() -> Result<()> {
    let manifest = Manifest::load()?;
    assert_eq!(manifest.exclusions.len(), 2);
    let tsgo_runner = fs::read_to_string(
        manifest
            .upstream_root()
            .join("typescript-go/features/diagnostics/index.test.ts"),
    )?;
    for exclusion in &manifest.exclusions {
        assert!(!exclusion.reason.trim().is_empty());
        assert!(!exclusion.upstream_evidence.trim().is_empty());
        let suite = manifest
            .snapshot_suites
            .iter()
            .find(|suite| suite.id == exclusion.suite)
            .context("exclusion names an unknown suite")?;
        let fixture = manifest
            .snapshot_fixtures(suite)?
            .into_iter()
            .find(|fixture| fixture.id == exclusion.fixture.to_string_lossy())
            .context("exclusion names an unknown fixture")?;
        assert!(manifest.is_excluded(&fixture));
        assert!(tsgo_runner.contains(&format!("/fixtures/{}", fixture.id)));
    }
    Ok(())
}
