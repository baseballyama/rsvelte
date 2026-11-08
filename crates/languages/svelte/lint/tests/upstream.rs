//! eslint-plugin-svelte's own rule tests, copied byte for byte to `tests/upstream`, and this
//! crate's cases in the same layout (`tests/cases`, reports written by `oracle lint-cases`), read
//! the way upstream's runner (`tests/utils/utils.ts`, `loadTestCases`) reads them. Every case of a
//! rule this crate implements must pass; the others are counted.

#![expect(clippy::print_stderr, reason = "a test harness reports on stderr")]

use std::collections::BTreeMap;
use std::path::{Path, PathBuf};
use std::process::ExitCode;

use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::computation::task::{Task, TaskOutput};
use rsvelte_kernel::diagnostics::Severity;
use rsvelte_kernel::source::document::Document;
use rsvelte_markup::button_type::Allowed;
use rsvelte_svelte_lint::{Configuration, Lint, RuleConfiguration};
use serde::Deserialize;
use serde::de::IgnoredAny;
use serde_json::value::RawValue;

const UPSTREAM: &str = concat!(
    env!("CARGO_MANIFEST_DIR"),
    "/tests/upstream/eslint-plugin-svelte"
);
const OWN: &str = concat!(env!("CARGO_MANIFEST_DIR"), "/tests/cases");

#[derive(Deserialize)]
struct Upstream {
    versions: BTreeMap<String, String>,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct CaseConfig {
    options: Option<Box<RawValue>>,
    #[serde(rename = "languageOptions")]
    language_options: Option<IgnoredAny>,
    settings: Option<IgnoredAny>,
}

#[derive(Deserialize, PartialEq, Eq, Debug)]
struct ExpectedError {
    message: String,
    line: u32,
    column: u32,
    suggestions: Option<Vec<IgnoredSuggestion>>,
}

#[derive(Deserialize, PartialEq, Eq, Debug)]
struct IgnoredSuggestion {
    desc: String,
    output: String,
}

#[derive(Deserialize)]
struct Report {
    findings: Vec<Finding>,
}

#[derive(Deserialize)]
struct Finding {
    message: String,
    start: Position,
}

#[derive(Deserialize)]
struct Position {
    line: u32,
    column: u32,
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
    let failed = suite(&label, Path::new(UPSTREAM), &upstream.versions)
        + suite("this crate's cases", Path::new(OWN), &upstream.versions);
    if failed == 0 {
        ExitCode::SUCCESS
    } else {
        ExitCode::FAILURE
    }
}

/// Runs one fixture tree and returns how many cases of implemented rules did not pass.
fn suite(label: &str, root: &Path, versions: &BTreeMap<String, String>) -> usize {
    let cases = cases(root);
    let mut by_rule: BTreeMap<&str, [usize; 4]> = BTreeMap::new();
    let (mut skipped, mut failed, mut not_implemented) = (0, 0, 0);
    for case in &cases {
        if !requirements_hold(&case.input, versions) {
            skipped += 1;
            continue;
        }
        let verdict = run(case);
        if matches!(verdict, Verdict::NotImplemented) {
            not_implemented += 1;
            continue;
        }
        let counts = by_rule.entry(&case.rule).or_default();
        match verdict {
            Verdict::NotImplemented => unreachable!("counted above"),
            Verdict::Pass => counts[0] += 1,
            Verdict::Fail(detail) => {
                counts[1] += 1;
                failed += 1;
                eprintln!("FAIL {}: {detail}", case.document());
            }
            Verdict::Unmeasured(reason) => {
                counts[2] += 1;
                failed += 1;
                eprintln!("UNMEASURED {}: {reason}", case.document());
            }
        }
        counts[3] += 1;
    }
    let rules: std::collections::BTreeSet<&str> = cases.iter().map(|c| c.rule.as_str()).collect();
    eprintln!(
        "{label}: {} cases of {} rules; {skipped} need another version, \
         {not_implemented} are of rules not implemented",
        cases.len(),
        rules.len(),
    );
    for (rule, [pass, fail, unmeasured, total]) in &by_rule {
        eprintln!("  {rule}: {pass} of {total} pass, {fail} fail, {unmeasured} unmeasured");
    }
    assert!(
        !by_rule.is_empty(),
        "{label}: no implemented rule has a case"
    );
    failed
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

/// The rule as this crate configures it from the case's options.
fn rule(name: &str, options: Option<&RawValue>) -> RuleConfiguration {
    #[derive(Deserialize)]
    #[serde(deny_unknown_fields)]
    struct ButtonHasType {
        button: Option<bool>,
        submit: Option<bool>,
        reset: Option<bool>,
    }
    let severity = Severity::Error;
    match name {
        "button-has-type" => {
            let [options]: [ButtonHasType; 1] = options.map_or(
                [ButtonHasType {
                    button: None,
                    submit: None,
                    reset: None,
                }],
                |raw| serde_json::from_str(raw.get()).expect("button-has-type options"),
            );
            RuleConfiguration::ButtonHasType {
                severity,
                allowed: Allowed {
                    button: options.button.unwrap_or(true),
                    submit: options.submit.unwrap_or(true),
                    reset: options.reset.unwrap_or(true),
                },
            }
        }
        "valid-each-key" => {
            assert!(options.is_none(), "valid-each-key takes no options");
            RuleConfiguration::ValidEachKey(severity)
        }
        _ => unreachable!("{name} is not in IMPLEMENTED"),
    }
}

/// Rules this crate implements, by eslint-plugin-svelte's name.
const IMPLEMENTED: &[&str] = &["button-has-type", "valid-each-key"];

fn run(case: &Case<'_>) -> Verdict {
    if !IMPLEMENTED.contains(&case.rule.as_str()) {
        return Verdict::NotImplemented;
    }
    let directory = case.input.parent().expect("a parent");
    let parsed = match config(&case.input, directory) {
        Some(path) if path.extension().is_some_and(|e| e == "json") => {
            Some(serde_json::from_str::<CaseConfig>(&read(&path)).expect("a case configuration"))
        }
        Some(_) => return Verdict::Unmeasured("a JavaScript configuration".to_owned()),
        None => None,
    };
    if let Some(c) = &parsed
        && (c.language_options.is_some() || c.settings.is_some())
    {
        return Verdict::Unmeasured("languageOptions or settings".to_owned());
    }
    let name = case
        .input
        .file_name()
        .and_then(|n| n.to_str())
        .expect("UTF-8 name");
    if !name.ends_with(".svelte") {
        return Verdict::Unmeasured(format!("a {} input", suffix(name)));
    }
    let configuration = Configuration::new(vec![rule(
        &case.rule,
        parsed.as_ref().and_then(|c| c.options.as_deref()),
    )])
    .expect("one rule");
    let Some(report) = lint(case, configuration) else {
        return Verdict::Fail("the input does not lint".to_owned());
    };
    let report: Report = serde_json::from_str(&report).expect("the lint report is valid");
    let expected: Vec<ExpectedError> = if case.invalid {
        serde_saphyr::from_str(&read(&sibling(&case.input, "errors.yaml")))
            .expect("errors.yaml is valid")
    } else {
        Vec::new()
    };
    if expected.iter().any(|e| e.suggestions.is_some()) {
        return Verdict::Fail("suggestions are not implemented".to_owned());
    }
    let output = sibling(&case.input, &format!("output.{}", &suffix(name)[1..]));
    if output.exists() && read(&output) != read(&case.input) {
        return Verdict::Fail("fixes are not implemented".to_owned());
    }
    let actual: Vec<ExpectedError> = report
        .findings
        .into_iter()
        .map(|f| ExpectedError {
            message: f.message,
            line: f.start.line,
            column: f.start.column,
            suggestions: None,
        })
        .collect();
    if actual == expected {
        Verdict::Pass
    } else {
        Verdict::Fail(format!("expected {expected:?}, found {actual:?}"))
    }
}

/// The task's `lint.json`, or `None` when the input does not parse.
fn lint(case: &Case<'_>, configuration: Configuration) -> Option<String> {
    let mut registry = Registry::new();
    rsvelte_svelte_lint::register_with_configuration(&mut registry, configuration);
    let document = Document::new(case.document(), read(&case.input)).ok()?;
    let context = DocumentContext::new(&document, registry.artifacts());
    let mut output = TaskOutput::default();
    Lint.run(&context, &mut output);
    if !output.diagnostics.is_empty() {
        return None;
    }
    output.files.into_iter().next().map(|file| file.text)
}

fn read(path: &Path) -> String {
    std::fs::read_to_string(path).unwrap_or_else(|e| panic!("{}: {e}", path.display()))
}
