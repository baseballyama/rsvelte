//! eslint-plugin-svelte's own rule tests, copied byte for byte to `tests/upstream`, and this
//! crate's cases in the same layout (`tests/cases`, reports written by `oracle lint-cases`), read
//! the way upstream's runner (`tests/utils/utils.ts`, `loadTestCases`) reads them. Every case of a
//! rule this crate implements must pass; the others are counted.

#![expect(clippy::print_stderr, reason = "a test harness reports on stderr")]

use std::collections::BTreeMap;
use std::fmt::Write as _;
use std::path::{Path, PathBuf};
use std::process::ExitCode;

use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::computation::task::Task;
use rsvelte_kernel::diagnostics::Severity;
use rsvelte_kernel::source::document::Document;
use rsvelte_lint_runner::finding::{Finding, apply_fix, apply_fixes};
use rsvelte_svelte_lint::computation::{SvelteConfiguration, SvelteKit};
use rsvelte_svelte_lint::project::{Location, SvelteKitProject};
use rsvelte_svelte_lint::{Configuration, Kit, LintSettings};
use serde::Deserialize;
use serde::de::IgnoredAny;
use serde_json::value::RawValue;

// A directory of its own, since `tests/upstream` holds the copied fixtures.
#[path = "upstream_runner/cases.rs"]
mod cases;
#[path = "upstream_runner/project.rs"]
mod project;

use cases::{cases, config, javascript_config, requirements_hold, sibling, suffix};
use project::{Project, conflicting_module_names, svelte_config};

const UPSTREAM: &str = concat!(
    env!("CARGO_MANIFEST_DIR"),
    "/tests/upstream/eslint-plugin-svelte"
);
const OWN: &str = concat!(env!("CARGO_MANIFEST_DIR"), "/tests/cases");
/// Cases whose expected output is an upstream bug this crate does not reproduce, by document: why,
/// and the reports (and fixed code) that are correct, which the case must then produce. Each is a
/// candidate issue for eslint-plugin-svelte.
const DEVIATIONS: &str = concat!(
    env!("CARGO_MANIFEST_DIR"),
    "/tests/upstream_deviations.json"
);
/// This crate's cases whose files hold its answer where `ESLint`'s is an upstream bug, by document:
/// why. `oracle lint-cases` never writes them and fails once `ESLint` agrees.
const OWN_DEVIATIONS: &str = concat!(env!("CARGO_MANIFEST_DIR"), "/tests/cases_deviations.json");
/// Rules whose upstream verdicts are counted but do not fail: the built-in type provider does not
/// follow `svelte-eslint-parser`'s virtual code. This crate's own cases of them must pass.
const TYPED: &[&str] = &["@typescript-eslint/no-unnecessary-condition"];
/// Cases that run and are counted but do not fail, by document, with why, under a label: a list
/// file per reason. A listed case that passes fails, so a list shrinks when its reason goes.
const COUNTED: &[(&str, &str)] = &[
    (
        concat!(env!("CARGO_MANIFEST_DIR"), "/tests/upstream_typed.json"),
        "typed",
    ),
    (
        concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/tests/upstream_preprocessor.json"
        ),
        "need a preprocessor",
    ),
    (
        concat!(env!("CARGO_MANIFEST_DIR"), "/tests/upstream_parser.json"),
        "need syntax the parser lacks",
    ),
    (
        concat!(env!("CARGO_MANIFEST_DIR"), "/tests/upstream_rejected.json"),
        "TypeScript rejects",
    ),
];

#[derive(Deserialize)]
struct Upstream {
    versions: BTreeMap<String, String>,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct CaseConfig {
    #[serde(default)]
    options: Vec<Box<RawValue>>,
    #[serde(rename = "languageOptions")]
    language_options: Option<LanguageOptions>,
    settings: Option<CaseSettings>,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct CaseSettings {
    svelte: Option<Box<RawValue>>,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct LanguageOptions {
    #[serde(rename = "parserOptions")]
    parser_options: Option<ParserOptions>,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct ParserOptions {
    #[serde(rename = "svelteConfig")]
    svelte_config: Option<CaseSvelteConfig>,
    /// The parser of `<script>`; this crate has one parser for JavaScript and TypeScript.
    #[serde(rename = "parser")]
    _parser: Option<IgnoredAny>,
    /// `globalReturn`, which changes nothing a rule reports.
    #[serde(rename = "ecmaFeatures")]
    _ecma_features: Option<IgnoredAny>,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct CaseSvelteConfig {
    kit: Option<Kit>,
}

#[derive(Clone, Deserialize, PartialEq, Eq, Debug)]
struct ExpectedError {
    message: String,
    line: u32,
    column: u32,
    suggestions: Option<Vec<ExpectedSuggestion>>,
}

/// `loadTestCases` keeps a suggestion's `desc` and `output` alone.
#[derive(Clone, Deserialize, PartialEq, Eq, Debug)]
struct ExpectedSuggestion {
    desc: String,
    output: String,
}

/// An upstream case this crate answers differently, and the answer it must give.
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Deviation {
    reason: String,
    /// The correct reports, in `errors.yaml`'s shape.
    errors: Vec<ExpectedError>,
    /// The correct fixed code, when it is not upstream's.
    output: Option<String>,
}

struct Case<'a> {
    root: &'a Path,
    rule: String,
    invalid: bool,
    input: PathBuf,
}

enum Verdict {
    NotImplemented,
    Pass,
    Fail(String),
    /// The case needs something this harness does not model (named in the reason).
    Unmeasured(String),
}

fn main() -> ExitCode {
    let upstream: Upstream =
        serde_json::from_str(&read(&Path::new(UPSTREAM).join("UPSTREAM.json")))
            .expect("UPSTREAM.json is valid");
    let label = format!(
        "eslint-plugin-svelte {}",
        upstream.versions["eslint-plugin-svelte"]
    );
    let mut deviations: BTreeMap<String, Deviation> =
        serde_json::from_str(&read(Path::new(DEVIATIONS))).expect("deviations are an object");
    let mut own_deviations: BTreeMap<String, String> =
        serde_json::from_str(&read(Path::new(OWN_DEVIATIONS))).expect("deviations are an object");
    let mut counted: BTreeMap<String, (&'static str, String)> = BTreeMap::new();
    for (file, label) in COUNTED {
        let list: BTreeMap<String, String> =
            serde_json::from_str(&read(Path::new(file))).expect("a counted list is an object");
        for (document, reason) in list {
            assert!(
                !deviations.contains_key(&document),
                "{document} is both a deviation and {label}"
            );
            let previous = counted.insert(document.clone(), (*label, reason));
            assert!(previous.is_none(), "{document} is in two counted lists");
        }
    }
    let mut failed = suite(
        &label,
        Path::new(UPSTREAM),
        &upstream.versions,
        &mut deviations,
        &mut BTreeMap::new(),
        &mut counted,
        TYPED,
    ) + suite(
        "this crate's cases",
        Path::new(OWN),
        &upstream.versions,
        &mut BTreeMap::new(),
        &mut own_deviations,
        &mut BTreeMap::new(),
        &[],
    );
    for (document, reason) in &own_deviations {
        failed += 1;
        eprintln!("UNKNOWN DEVIATION {document}: no case of an implemented rule ({reason})");
    }
    for (document, deviation) in &deviations {
        failed += 1;
        eprintln!(
            "UNKNOWN DEVIATION {document}: no case of an implemented rule ({})",
            deviation.reason
        );
    }
    failed += conflicting_module_names(&mut counted);
    for (document, (label, reason)) in &counted {
        failed += 1;
        eprintln!("UNKNOWN {label} {document}: no case of an implemented rule ({reason})");
    }
    if failed == 0 {
        ExitCode::SUCCESS
    } else {
        ExitCode::FAILURE
    }
}

/// Runs one fixture tree and returns how many cases of implemented rules not in `typed` did not
/// pass. A case in `kept` holds this crate's answer in its own files and counts as a deviation.
fn suite(
    label: &str,
    root: &Path,
    versions: &BTreeMap<String, String>,
    deviations: &mut BTreeMap<String, Deviation>,
    kept: &mut BTreeMap<String, String>,
    counted: &mut BTreeMap<String, (&'static str, String)>,
    typed: &[&str],
) -> usize {
    let cases = cases(root);
    let mut by_rule: BTreeMap<&str, Counts> = BTreeMap::new();
    let (mut skipped, mut failed, mut not_implemented) = (0, 0, 0);
    for case in &cases {
        if !requirements_hold(&case.input, versions) {
            skipped += 1;
            continue;
        }
        let verdict = run(case, None);
        if matches!(verdict, Verdict::NotImplemented) {
            not_implemented += 1;
            continue;
        }
        let document = case.document();
        let deviation = deviations.remove(&document);
        let own = kept.remove(&document).is_some();
        let lenient = typed.contains(&case.rule.as_str());
        let counts = by_rule.entry(&case.rule).or_default();
        counts.total += 1;
        if let Some((label, reason)) = counted.remove(&document) {
            if matches!(verdict, Verdict::Pass) {
                counts.fail += 1;
                failed += 1;
                eprintln!("STALE {label} {document}: passes, but is listed ({reason})");
            } else {
                *counts.counted.entry(label).or_default() += 1;
                eprintln!("COUNTED {document}: {label} ({reason})");
            }
            continue;
        }
        match (verdict, deviation) {
            (Verdict::NotImplemented, _) => unreachable!("counted above"),
            (Verdict::Pass, None) if own => counts.deviation += 1,
            (Verdict::Pass, None) => counts.pass += 1,
            (Verdict::Pass, Some(deviation)) => {
                counts.fail += 1;
                failed += 1;
                eprintln!(
                    "STALE DEVIATION {document}: matches upstream, but is listed ({})",
                    deviation.reason
                );
            }
            (Verdict::Fail(_) | Verdict::Unmeasured(_), Some(deviation)) => {
                match run(case, Some(&deviation)) {
                    Verdict::Pass => counts.deviation += 1,
                    Verdict::Fail(detail) | Verdict::Unmeasured(detail) => {
                        counts.fail += 1;
                        failed += 1;
                        eprintln!("FAIL {document}: not the deviation's answer: {detail}");
                    }
                    Verdict::NotImplemented => unreachable!("implemented above"),
                }
            }
            (Verdict::Fail(detail), None) => {
                counts.fail += 1;
                if !lenient {
                    failed += 1;
                }
                eprintln!("FAIL {document}: {detail}");
            }
            (Verdict::Unmeasured(reason), None) => {
                counts.unmeasured += 1;
                if !lenient {
                    failed += 1;
                }
                eprintln!("UNMEASURED {document}: {reason}");
            }
        }
    }
    let rules: std::collections::BTreeSet<&str> = cases.iter().map(|c| c.rule.as_str()).collect();
    eprintln!(
        "{label}: {} cases of {} rules; {skipped} need another version, \
         {not_implemented} are of rules not implemented",
        cases.len(),
        rules.len(),
    );
    for (rule, c) in &by_rule {
        let note = if typed.contains(rule) {
            " (typed: not required)"
        } else {
            ""
        };
        let counted = c.counted.iter().fold(String::new(), |mut out, (label, n)| {
            write!(out, ", {n} {label}").expect("a String takes any text");
            out
        });
        eprintln!(
            "  {rule}: {} of {} pass, {} fail, {} unmeasured, {} deviate{counted}{note}",
            c.pass, c.total, c.fail, c.unmeasured, c.deviation
        );
    }
    assert!(
        !by_rule.is_empty(),
        "{label}: no implemented rule has a case"
    );
    failed
}

#[derive(Default)]
struct Counts {
    pass: usize,
    fail: usize,
    unmeasured: usize,
    deviation: usize,
    /// Cases of a counted list that do not pass, by its label.
    counted: BTreeMap<&'static str, usize>,
    total: usize,
}

impl Case<'_> {
    /// The document's path: the input's, from the fixture root.
    fn document(&self) -> String {
        self.input
            .strip_prefix(self.root)
            .expect("under the root")
            .to_str()
            .expect("UTF-8 path")
            .to_owned()
    }
}

/// The case's verdict against upstream's expectation, or against `deviation`'s when given.
fn run(case: &Case<'_>, deviation: Option<&Deviation>) -> Verdict {
    let name = format!("svelte/{}", case.rule);
    if rsvelte_svelte_lint::definition(&name, &[]).is_none() {
        return Verdict::NotImplemented;
    }
    let directory = case.input.parent().expect("a parent");
    let mut javascript = None;
    let config = match config(&case.input, directory) {
        Some(path) if path.extension().is_some_and(|e| e == "json") => {
            serde_json::from_str::<CaseConfig>(&read(&path)).expect("a case configuration")
        }
        Some(path) => match javascript_config(&path, case.root) {
            Some(config) => {
                javascript = Some(config);
                CaseConfig {
                    options: Vec::new(),
                    language_options: None,
                    settings: None,
                }
            }
            None => return Verdict::Unmeasured("a JavaScript configuration".to_owned()),
        },
        None => CaseConfig {
            options: Vec::new(),
            language_options: None,
            settings: None,
        },
    };
    let settings: LintSettings = config
        .settings
        .and_then(|s| s.svelte)
        .map(|raw| serde_json::from_str(raw.get()).expect("svelte settings"))
        .unwrap_or_default();
    let svelte_config = match svelte_config(case, config.language_options, javascript) {
        Ok(svelte_config) => svelte_config,
        Err(why) => return Verdict::Unmeasured(format!("a svelte.config.js {why}")),
    };
    let mut configuration = Configuration::new(settings);
    if let Err(error) = configuration.rule(&name, Severity::Error, &config.options, &[]) {
        return Verdict::Fail(format!("the options do not configure the rule: {error}"));
    }
    let source = read(&case.input);
    // Upstream's tests run from its package, and a message that names the file names it from
    // there. Where the file is comes from the project facts, not from this name.
    let name = format!("tests/fixtures/rules/{}", case.document());
    let project = if case.root == Path::new(UPSTREAM) {
        // The nearest `package.json` is upstream's package.
        Project {
            svelte_config: Ok(svelte_config.unwrap_or_default()),
            kit: SvelteKitProject {
                version: Some("2".to_owned()),
                location: Location::InProject(name.clone()),
            },
        }
    } else {
        Project::on_disk(&case.input, svelte_config)
    };
    let document = Document::new(name, source.clone()).expect("a fixture is small");
    let findings = match lint(&document, &configuration, project) {
        Ok(findings) => findings,
        Err(error) => return Verdict::Fail(format!("the input does not lint: {}", error.message)),
    };
    compare(case, source, &findings, deviation)
}

/// The findings against the case's `errors.yaml` and `output` file, or the deviation's answer.
fn compare(
    case: &Case<'_>,
    source: String,
    findings: &[Finding],
    deviation: Option<&Deviation>,
) -> Verdict {
    let expected: Vec<ExpectedError> = match deviation {
        Some(deviation) => deviation.errors.clone(),
        None if case.invalid => serde_saphyr::from_str(&read(&sibling(&case.input, "errors.yaml")))
            .expect("errors.yaml is valid"),
        None => Vec::new(),
    };
    let lines = rsvelte_kernel::source::positions::LineIndex::with_breaks(
        &source,
        rsvelte_kernel::source::positions::LineBreaks::Ecmascript,
    );
    let actual: Vec<ExpectedError> = findings
        .iter()
        .map(|f| {
            let at = lines.line_column(f.diagnostic.span.start_offset);
            ExpectedError {
                message: f.diagnostic.message.clone(),
                line: at.line,
                column: at.column + 1,
                suggestions: (!f.suggestions.is_empty()).then(|| {
                    f.suggestions
                        .iter()
                        .map(|s| ExpectedSuggestion {
                            desc: s.message.clone(),
                            output: apply_fix(&source, &s.fix),
                        })
                        .collect()
                }),
            }
        })
        .collect();
    // `suggestions: null` and `[]` both expect none.
    let expected: Vec<ExpectedError> = expected
        .into_iter()
        .map(|e| ExpectedError {
            suggestions: e.suggestions.filter(|s| !s.is_empty()),
            ..e
        })
        .collect();
    if actual != expected {
        return Verdict::Fail(format!("expected {expected:#?}, found {actual:#?}"));
    }
    // RuleTester: an `output` file holds the fixed code; without one the rule must not fix.
    let name = case
        .input
        .file_name()
        .and_then(|n| n.to_str())
        .expect("UTF-8 name");
    let output = sibling(&case.input, &format!("output.{}", &suffix(name)[1..]));
    let fixed = apply_fixes(&source, findings);
    let wanted = match deviation.and_then(|d| d.output.clone()) {
        Some(correct) => correct,
        None if case.invalid && output.exists() => read(&output),
        None => source,
    };
    if fixed == wanted {
        Verdict::Pass
    } else {
        Verdict::Fail(format!("expected the fixed code\n{wanted}\nfound\n{fixed}"))
    }
}

/// The findings, or the parse error.
fn lint(
    document: &Document,
    configuration: &Configuration,
    project: Project,
) -> Result<Vec<Finding>, rsvelte_kernel::diagnostics::Diagnostic> {
    let mut registry = Registry::new();
    rsvelte_svelte_lint::register_artifacts(&mut registry);
    // The product lints only the documents its task takes.
    let task = rsvelte_svelte_lint::Lint {
        modules: configuration.lints_modules(),
    };
    if !task.applies(document) {
        return Ok(Vec::new());
    }
    let Project { svelte_config, kit } = project;
    registry.provide::<SvelteConfiguration>("test", |_| true, move |_| svelte_config.clone());
    registry.provide::<SvelteKit>("test", |_| true, move |_| kit.clone());
    let context = DocumentContext::new(document, registry.artifacts());
    rsvelte_svelte_lint::lint(&context, configuration)
}

fn read(path: &Path) -> String {
    std::fs::read_to_string(path).unwrap_or_else(|e| panic!("{}: {e}", path.display()))
}
