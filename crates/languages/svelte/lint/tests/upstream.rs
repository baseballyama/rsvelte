//! eslint-plugin-svelte's own rule tests, copied byte for byte to `tests/upstream`, and this
//! crate's cases in the same layout (`tests/cases`, reports written by `oracle lint-cases`), read
//! the way upstream's runner (`tests/utils/utils.ts`, `loadTestCases`) reads them. Every case of a
//! rule this crate implements must pass; the others are counted.

#![expect(clippy::print_stderr, reason = "a test harness reports on stderr")]

use std::collections::BTreeMap;
use std::fmt::Write as _;
use std::path::{Path, PathBuf};
use std::process::ExitCode;
use std::sync::Arc;

use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::computation::task::Task;
use rsvelte_kernel::diagnostics::Severity;
use rsvelte_kernel::source::document::Document;
use rsvelte_lint_runner::finding::{Finding, apply_fix, apply_fixes};
use rsvelte_svelte_lint::computation::{SvelteConfiguration, SvelteKit};
use rsvelte_svelte_lint::project::{self, Location, SvelteKitProject};
use rsvelte_svelte_lint::{
    Configuration, Kit, LintSettings, SvelteConfig, Warning, WarningHandler,
};
use serde::Deserialize;
use serde::de::IgnoredAny;
use serde_json::value::RawValue;

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
        &mut counted,
        TYPED,
    ) + suite(
        "this crate's cases",
        Path::new(OWN),
        &upstream.versions,
        &mut BTreeMap::new(),
        &mut BTreeMap::new(),
        &[],
    );
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
/// pass.
fn suite(
    label: &str,
    root: &Path,
    versions: &BTreeMap<String, String>,
    deviations: &mut BTreeMap<String, Deviation>,
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

/// `listupInput` over each rule's `valid/` and `invalid/`. A rule is a directory with either.
fn cases(root: &Path) -> Vec<Case<'_>> {
    let mut out = Vec::new();
    let mut directories = vec![root.to_path_buf()];
    while let Some(directory) = directories.pop() {
        let valid = directory.join("valid");
        let invalid = directory.join("invalid");
        if valid.is_dir() || invalid.is_dir() {
            let rule = directory
                .strip_prefix(root)
                .expect("under the root")
                .to_str()
                .expect("UTF-8 path")
                .to_owned();
            for (path, is_invalid) in [(valid, false), (invalid, true)] {
                if path.is_dir() {
                    for input in inputs(&path) {
                        out.push(Case {
                            root,
                            rule: rule.clone(),
                            invalid: is_invalid,
                            input,
                        });
                    }
                }
            }
        } else {
            directories.extend(entries(&directory).into_iter().filter(|p| p.is_dir()));
        }
    }
    out.sort_by(|a, b| a.input.cmp(&b.input));
    out
}

fn inputs(directory: &Path) -> Vec<PathBuf> {
    let mut out = Vec::new();
    for path in entries(directory) {
        let name = path
            .file_name()
            .and_then(|n| n.to_str())
            .expect("UTF-8 name");
        if name.starts_with('_') {
            continue;
        }
        let base = &name[..name.len() - suffix(name).len()];
        if base.ends_with("input") || base.starts_with('+') {
            out.push(path);
        } else if path.is_dir() {
            out.extend(inputs(&path));
        }
    }
    out
}

fn entries(directory: &Path) -> Vec<PathBuf> {
    let mut out: Vec<PathBuf> = std::fs::read_dir(directory)
        .expect("readable directory")
        .map(|entry| entry.expect("readable entry").path())
        .collect();
    out.sort();
    out
}

/// `fileNameSuffix`: `.svelte.js` and `.svelte.ts` count as one extension.
fn suffix(name: &str) -> &str {
    if name.ends_with(".svelte.js") || name.ends_with(".svelte.ts") {
        return &name[name.len() - 10..];
    }
    // `path.extname`: a leading dot alone is not an extension.
    match name.rfind('.') {
        Some(at) if at > 0 => &name[at..],
        _ => "",
    }
}

/// `inputFile.replace(/(input|\+.+)(?:\.[a-z]+)+$/u, replacement)`.
fn sibling(input: &Path, replacement: &str) -> PathBuf {
    let text = input.to_str().expect("UTF-8 path");
    let extensions = |rest: &str| {
        rest.starts_with('.')
            && rest[1..]
                .split('.')
                .all(|part| !part.is_empty() && part.bytes().all(|b| b.is_ascii_lowercase()))
    };
    let last_dot = text.rfind('.');
    let at = (0..text.len())
        .find(|&i| {
            text.is_char_boundary(i)
                && ((text[i..].starts_with("input") && extensions(&text[i + 5..]))
                    || (text[i..].starts_with('+')
                        && last_dot.is_some_and(|dot| dot >= i + 2 && extensions(&text[dot..]))))
        })
        .expect("an input file name");
    PathBuf::from(format!("{}{replacement}", &text[..at]))
}

fn requirements_hold(input: &Path, versions: &BTreeMap<String, String>) -> bool {
    let mut file = sibling(input, "requirements.json");
    if !file.exists() {
        file = input.with_file_name("_requirements.json");
    }
    if !file.exists() {
        return true;
    }
    let requirements: BTreeMap<String, String> =
        serde_json::from_str(&read(&file)).expect("requirements are a JSON object of strings");
    requirements
        .iter()
        .filter(|(package, _)| package.as_str() != "FIXME")
        .all(|(package, range)| {
            let version = semver::Version::parse(
                versions
                    .get(package)
                    .unwrap_or_else(|| panic!("UPSTREAM.json has no version of {package}")),
            )
            .expect("a version");
            // node-semver: `||` separates alternatives, spaces separate comparators.
            range.split("||").any(|alternative| {
                let comparators = alternative
                    .split_whitespace()
                    .collect::<Vec<_>>()
                    .join(", ");
                semver::VersionReq::parse(&comparators)
                    .unwrap_or_else(|e| panic!("{package} {range}: {e}"))
                    .matches(&version)
            })
        })
}

/// `getConfig`: the first of these that exists.
fn config(input: &Path, directory: &Path) -> Option<PathBuf> {
    [
        sibling(input, "config.json"),
        directory.join("_config.json"),
        sibling(input, "config.js"),
        directory.join("_config.js"),
        sibling(input, "config.cjs"),
        directory.join("_config.cjs"),
    ]
    .into_iter()
    .find(|path| path.exists())
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
    let project = if case.root == Path::new(UPSTREAM) {
        Project {
            svelte_config: Ok(svelte_config.unwrap_or_default()),
            // Upstream's tests run from its package, whose `package.json` is the nearest.
            kit: SvelteKitProject {
                version: Some("2".to_owned()),
                location: Location::InProject(format!("tests/fixtures/rules/{}", case.document())),
            },
        }
    } else {
        Project::on_disk(&case.input, svelte_config)
    };
    let document = Document::new(
        case.input.to_str().expect("UTF-8 path").to_owned(),
        source.clone(),
    )
    .expect("a fixture is small");
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

/// The `svelte.config.js` of a case's `_config.cjs` (`languageOptions.parserOptions.svelteConfig`),
/// as the Rust its JavaScript amounts to; the host builds the same from a project's
/// `svelte.config.js`. `None` for a configuration not written here.
fn javascript_config(path: &Path, root: &Path) -> Option<SvelteConfig> {
    let relative = path.strip_prefix(root).ok()?.to_str()?;
    let drop_missing_attribute = || {
        Some(WarningHandler(Arc::new(|warning: Warning| {
            (warning.code != "a11y_missing_attribute" && warning.code != "a11y-missing-attribute")
                .then_some(warning)
        })))
    };
    let on_warning = match relative {
        // `onwarn(warning, handler) { if (warning.code === 'a11y_missing_attribute' ||
        // warning.code === 'a11y-missing-attribute') return; handler(warning); }`, and
        // `warningFilter: (warning) => warning.code !== 'a11y_missing_attribute' && warning.code
        // !== 'a11y-missing-attribute'`.
        "valid-compile/valid/svelte-config-onwarn/_config.cjs"
        | "valid-compile/invalid/svelte-config-onwarn/_config.cjs"
        | "valid-compile/valid/svelte-config-warning-filter/_config.cjs"
        | "valid-compile/invalid/svelte-config-warning-filter/_config.cjs" => {
            drop_missing_attribute()
        }
        // `onwarn(warning, handler) { handler({ ...warning, message: warning.message, code: 'foo' }); }`
        "valid-compile/invalid/svelte-config-custom-warn/_config.cjs" => {
            Some(WarningHandler(Arc::new(|warning: Warning| {
                Some(Warning {
                    code: "foo".to_owned(),
                    ..warning
                })
            })))
        }
        // `compilerOptions: { experimental: { async: true } }`
        "valid-compile/valid/svelte-config-experimental-async/_config.cjs" => {
            return Some(SvelteConfig {
                experimental_async: true,
                ..SvelteConfig::default()
            });
        }
        _ => return None,
    };
    Some(SvelteConfig {
        on_warning,
        ..SvelteConfig::default()
    })
}

/// The cases of `no-conflicting-module-names`, which upstream writes in
/// `tests/src/rules/no-conflicting-module-names.ts` rather than as fixtures: the rule looks at the
/// files beside the document, so each case lints a real file of the fixture directory, at its
/// absolute path as upstream's do.
fn conflicting_module_names(counted: &mut BTreeMap<String, (&'static str, String)>) -> usize {
    const RULE: &str = "svelte/no-conflicting-module-names";
    if rsvelte_svelte_lint::definition(RULE, &[]).is_none() {
        return 0;
    }
    let root = Path::new(UPSTREAM).join("no-conflicting-module-names");
    let cases = conflicting_module_names_cases();
    let mut configuration = Configuration::new(LintSettings::default());
    configuration
        .rule(RULE, Severity::Error, &[], &[])
        .expect("the rule takes no options");
    let (mut failed, mut waiting) = (0, 0);
    for (file, code, expected) in &cases {
        let document_name = format!("no-conflicting-module-names/{file}");
        let path = root.join(file);
        let source = code.map_or_else(|| read(&path), str::to_owned);
        let document = Document::new(path.to_str().expect("UTF-8 path").to_owned(), source)
            .expect("a case is small");
        let project = Project::on_disk(&path, None);
        let actual: Vec<(String, u32)> = match lint(&document, &configuration, project) {
            Ok(findings) => findings
                .iter()
                .map(|f| (f.diagnostic.message.clone(), f.diagnostic.span.start_offset))
                .collect(),
            Err(error) => vec![(format!("does not lint: {}", error.message), 0)],
        };
        // Upstream expects line 1, column 1.
        let expected: Vec<(String, u32)> = expected.iter().map(|m| (m.clone(), 0)).collect();
        let pass = actual == expected;
        if let Some((label, reason)) = counted.remove(&document_name) {
            if pass {
                failed += 1;
                eprintln!("STALE {label} {document_name}: passes, but is listed ({reason})");
            } else {
                waiting += 1;
                eprintln!("COUNTED {document_name}: {label} ({reason})");
            }
        } else if !pass {
            failed += 1;
            eprintln!("FAIL {document_name}: expected {expected:?}, found {actual:?}");
        }
    }
    eprintln!(
        "  no-conflicting-module-names (inline cases): {} of {} pass, {failed} fail, {waiting} \
         counted",
        cases.len() - failed - waiting,
        cases.len()
    );
    failed
}

/// Upstream's inline cases of `no-conflicting-module-names`: the file, the code when the file
/// does not exist, and the expected message.
fn conflicting_module_names_cases() -> Vec<(String, Option<&'static str>, Option<String>)> {
    let component = |module: &str| {
        format!(
            "The module `{module}` has the same name as this component. TypeScript resolves the \
             import `./Foo.svelte` to that module, not to this component. Rename `{module}`."
        )
    };
    let module = "This module has the same name as the component `Foo.svelte`. TypeScript \
                  resolves the import `./Foo.svelte` to this module, not to the component. \
                  Rename this file.";
    let mut cases: Vec<(String, Option<&str>, Option<String>)> = vec![
        ("valid/no-sibling/Foo.svelte".to_owned(), None, None),
        ("valid/different-module/Foo.svelte".to_owned(), None, None),
        (
            "valid/declaration-sibling/Foo.svelte".to_owned(),
            None,
            None,
        ),
        (
            "valid/declaration-sibling-d-svelte/Bar.svelte".to_owned(),
            None,
            None,
        ),
        (
            "does-not-exist/Foo.svelte".to_owned(),
            Some("<p>virtual</p>"),
            None,
        ),
        (
            "valid/different-module/foo-state.svelte.ts".to_owned(),
            None,
            None,
        ),
        (
            "valid/declaration-sibling/Foo.svelte.d.ts".to_owned(),
            None,
            None,
        ),
        (
            "valid/declaration-sibling-d-svelte/Bar.d.svelte.ts".to_owned(),
            None,
            None,
        ),
        (
            "does-not-exist/Foo.svelte.ts".to_owned(),
            Some("export const value = 1;"),
            None,
        ),
    ];
    let extensions = ["ts", "tsx", "js", "jsx", "mts", "cts", "mjs", "cjs"];
    for extension in extensions {
        cases.push((
            format!("invalid/{extension}/Foo.svelte"),
            None,
            Some(component(&format!("Foo.svelte.{extension}"))),
        ));
    }
    for extension in extensions {
        cases.push((
            format!("invalid/{extension}/Foo.svelte.{extension}"),
            None,
            Some(module.to_owned()),
        ));
    }
    cases
}

/// `svelte-eslint-parser`'s `svelteConfig` option, else what it reads from the nearest file; the
/// host gives rsvelte the same per document (`SvelteConfiguration`).
fn svelte_config(
    case: &Case<'_>,
    language_options: Option<LanguageOptions>,
    javascript: Option<SvelteConfig>,
) -> Result<Option<SvelteConfig>, String> {
    if let Some(c) = language_options
        .and_then(|l| l.parser_options)
        .and_then(|p| p.svelte_config)
    {
        return Ok(Some(SvelteConfig {
            kit: c.kit,
            ..SvelteConfig::default()
        }));
    }
    if javascript.is_some() {
        return Ok(javascript);
    }
    svelte_config_file(&case.input, case.root)
        .map(|file| rsvelte_svelte_lint::svelte_config::parse(&read(&file)))
        .transpose()
}

/// A `svelte.config.js` that `svelte-eslint-parser` would load for the input: in its directory or
/// one above it, up to the fixture root (upstream's repository has none above its fixtures).
fn svelte_config_file(input: &Path, root: &Path) -> Option<PathBuf> {
    input
        .ancestors()
        .skip(1)
        .take_while(|directory| directory.starts_with(root) && *directory != root)
        .map(|directory| directory.join("svelte.config.js"))
        .find(|path| path.exists())
}

/// What a host knows of the document's project, as upstream's run of the case sees it.
struct Project {
    svelte_config: Result<SvelteConfig, String>,
    kit: SvelteKitProject,
}

impl Project {
    /// What `ESLint` finds around the file on disk, after a `svelte.config.js` the case gives.
    fn on_disk(input: &Path, svelte_config: Option<SvelteConfig>) -> Self {
        Self {
            svelte_config: svelte_config.map_or_else(|| project::svelte_config_near(input), Ok),
            kit: project::svelte_kit_project(input),
        }
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
