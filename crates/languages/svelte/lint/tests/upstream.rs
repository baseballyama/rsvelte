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
use rsvelte_kernel::diagnostics::Severity;
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::finding::{Finding, apply_fix, apply_fixes};
use rsvelte_svelte_lint::{Configuration, Kit, KitFiles, LintSettings, SvelteConfig};
use rsvelte_typescript::parser::parse_program;
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};
use serde::Deserialize;
use serde::de::IgnoredAny;
use serde_json::value::RawValue;

const UPSTREAM: &str = concat!(
    env!("CARGO_MANIFEST_DIR"),
    "/tests/upstream/eslint-plugin-svelte"
);
const OWN: &str = concat!(env!("CARGO_MANIFEST_DIR"), "/tests/cases");
/// Cases whose expected output is an upstream bug this crate does not reproduce, by document,
/// with why. Each is a candidate issue for eslint-plugin-svelte.
const DEVIATIONS: &str = concat!(
    env!("CARGO_MANIFEST_DIR"),
    "/tests/upstream_deviations.json"
);
/// Rules whose verdicts are counted but do not fail: type-aware rules do not follow
/// `svelte-eslint-parser`'s virtual code.
const TYPED: &[&str] = &["@typescript-eslint/no-unnecessary-condition"];
/// Cases whose verdict depends on a type fact no provider gives this crate yet, by document,
/// with the fact. They run and are counted, but do not fail.
const TYPED_CASES: &str = concat!(env!("CARGO_MANIFEST_DIR"), "/tests/upstream_typed.json");

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

#[derive(Deserialize, PartialEq, Eq, Debug)]
struct ExpectedError {
    message: String,
    line: u32,
    column: u32,
    suggestions: Option<Vec<ExpectedSuggestion>>,
}

/// `loadTestCases` keeps a suggestion's `desc` and `output` alone.
#[derive(Deserialize, PartialEq, Eq, Debug)]
struct ExpectedSuggestion {
    desc: String,
    output: String,
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
    let mut deviations: BTreeMap<String, String> =
        serde_json::from_str(&read(Path::new(DEVIATIONS))).expect("deviations are an object");
    let mut typed: BTreeMap<String, String> =
        serde_json::from_str(&read(Path::new(TYPED_CASES))).expect("typed cases are an object");
    let mut failed = suite(
        &label,
        Path::new(UPSTREAM),
        &upstream.versions,
        &mut deviations,
        &mut typed,
    ) + suite(
        "this crate's cases",
        Path::new(OWN),
        &upstream.versions,
        &mut BTreeMap::new(),
        &mut BTreeMap::new(),
    );
    for (document, reason) in &deviations {
        failed += 1;
        eprintln!("UNKNOWN DEVIATION {document}: no case of an implemented rule ({reason})");
    }
    failed += conflicting_module_names();
    for (document, reason) in &typed {
        failed += 1;
        eprintln!("UNKNOWN TYPED CASE {document}: no case of an implemented rule ({reason})");
    }
    if failed == 0 {
        ExitCode::SUCCESS
    } else {
        ExitCode::FAILURE
    }
}

/// Runs one fixture tree and returns how many cases of implemented rules did not pass.
fn suite(
    label: &str,
    root: &Path,
    versions: &BTreeMap<String, String>,
    deviations: &mut BTreeMap<String, String>,
    typed_cases: &mut BTreeMap<String, String>,
) -> usize {
    let cases = cases(root);
    let mut by_rule: BTreeMap<&str, Counts> = BTreeMap::new();
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
        let document = case.document();
        let deviation = deviations.remove(&document);
        let typed = TYPED.contains(&case.rule.as_str());
        let counts = by_rule.entry(&case.rule).or_default();
        counts.total += 1;
        if let Some(fact) = typed_cases.remove(&document) {
            counts.typed += 1;
            match verdict {
                Verdict::Pass => {
                    counts.typed_pass += 1;
                    eprintln!("TYPED PASS {document} (needs {fact})");
                }
                Verdict::Fail(detail) => {
                    eprintln!("TYPED FAIL {document} (needs {fact}): {detail}");
                }
                Verdict::Unmeasured(reason) => {
                    eprintln!("TYPED UNMEASURED {document} (needs {fact}): {reason}");
                }
                Verdict::NotImplemented => unreachable!("counted above"),
            }
            continue;
        }
        match (verdict, deviation) {
            (Verdict::NotImplemented, _) => unreachable!("counted above"),
            (Verdict::Pass, None) => counts.pass += 1,
            (Verdict::Pass, Some(reason)) => {
                counts.fail += 1;
                failed += 1;
                eprintln!("STALE DEVIATION {document}: passes, but is listed ({reason})");
            }
            (Verdict::Fail(_) | Verdict::Unmeasured(_), Some(_)) => counts.deviation += 1,
            (Verdict::Fail(detail), None) => {
                counts.fail += 1;
                if !typed {
                    failed += 1;
                }
                eprintln!("FAIL {document}: {detail}");
            }
            (Verdict::Unmeasured(reason), None) => {
                counts.unmeasured += 1;
                if !typed {
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
        let typed = if TYPED.contains(rule) {
            " (typed: not required)"
        } else {
            ""
        };
        eprintln!(
            "  {rule}: {} of {} pass, {} fail, {} unmeasured, {} deviate, \
             {} typed (not required, {} pass){typed}",
            c.pass, c.total, c.fail, c.unmeasured, c.deviation, c.typed, c.typed_pass
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
    /// Cases in [`TYPED_CASES`], and how many of them pass.
    typed: usize,
    typed_pass: usize,
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

fn run(case: &Case<'_>) -> Verdict {
    let name = format!("svelte/{}", case.rule);
    if rsvelte_svelte_lint::definition(&name, &[]).is_none() {
        return Verdict::NotImplemented;
    }
    let directory = case.input.parent().expect("a parent");
    let config = match config(&case.input, directory) {
        Some(path) if path.extension().is_some_and(|e| e == "json") => {
            serde_json::from_str::<CaseConfig>(&read(&path)).expect("a case configuration")
        }
        Some(_) => return Verdict::Unmeasured("a JavaScript configuration".to_owned()),
        None => CaseConfig {
            options: Vec::new(),
            language_options: None,
            settings: None,
        },
    };
    let mut settings: LintSettings = config
        .settings
        .and_then(|s| s.svelte)
        .map(|raw| serde_json::from_str(raw.get()).expect("svelte settings"))
        .unwrap_or_default();
    settings.svelte_config = match svelte_config(case, config.language_options) {
        Ok(svelte_config) => svelte_config,
        Err(why) => return Verdict::Unmeasured(format!("a svelte.config.js {why}")),
    };
    let mut configuration = Configuration::new(settings);
    if let Err(error) = configuration.rule(&name, Severity::Error, &config.options, &[]) {
        return Verdict::Fail(format!("the options do not configure the rule: {error}"));
    }
    let source = read(&case.input);
    // The path from the upstream package's root, which is where upstream's tests run.
    let document = Document::new(
        format!("tests/fixtures/rules/{}", case.document()),
        source.clone(),
    )
    .expect("a fixture is small");
    let findings = match lint(&document, &configuration) {
        Ok(findings) => findings,
        Err(error) => return Verdict::Fail(format!("the input does not lint: {}", error.message)),
    };
    let expected: Vec<ExpectedError> = if case.invalid {
        serde_saphyr::from_str(&read(&sibling(&case.input, "errors.yaml")))
            .expect("errors.yaml is valid")
    } else {
        Vec::new()
    };
    let lines = rsvelte_kernel::source::positions::LineIndex::new(&source);
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
    let fixed = apply_fixes(&source, &findings);
    let wanted = if case.invalid && output.exists() {
        read(&output)
    } else {
        source
    };
    if fixed == wanted {
        Verdict::Pass
    } else {
        Verdict::Fail(format!("expected the fixed code\n{wanted}\nfound\n{fixed}"))
    }
}

/// The cases of `no-conflicting-module-names`, which upstream writes in
/// `tests/src/rules/no-conflicting-module-names.ts` rather than as fixtures: the rule looks at the
/// files beside the document, so each case lints a real file of the fixture directory, at its
/// absolute path as upstream's do.
fn conflicting_module_names() -> usize {
    const RULE: &str = "svelte/no-conflicting-module-names";
    if rsvelte_svelte_lint::definition(RULE, &[]).is_none() {
        return 0;
    }
    let root = Path::new(UPSTREAM).join("no-conflicting-module-names");
    let component = |module: &str| {
        format!(
            "The module `{module}` has the same name as this component. TypeScript resolves the \
             import `./Foo.svelte` to that module, not to this component. Rename `{module}`."
        )
    };
    let module = "This module has the same name as the component `Foo.svelte`. TypeScript \
                  resolves the import `./Foo.svelte` to this module, not to the component. \
                  Rename this file.";
    // (file, the code when the file does not exist, the expected message)
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
    let mut configuration = Configuration::new(LintSettings::default());
    configuration
        .rule(RULE, Severity::Error, &[], &[])
        .expect("the rule takes no options");
    let mut failed = 0;
    for (file, code, expected) in &cases {
        let path = root.join(file);
        let source = code.map_or_else(|| read(&path), str::to_owned);
        let document = Document::new(path.to_str().expect("UTF-8 path").to_owned(), source)
            .expect("a case is small");
        let actual: Vec<(String, u32)> = match lint(&document, &configuration) {
            Ok(findings) => findings
                .iter()
                .map(|f| (f.diagnostic.message.clone(), f.diagnostic.span.start_offset))
                .collect(),
            Err(error) => vec![(format!("does not lint: {}", error.message), 0)],
        };
        // Upstream expects line 1, column 1.
        let expected: Vec<(String, u32)> = expected.iter().map(|m| (m.clone(), 0)).collect();
        if actual != expected {
            failed += 1;
            eprintln!(
                "FAIL no-conflicting-module-names/{file}: expected {expected:?}, found {actual:?}"
            );
        }
    }
    eprintln!(
        "  no-conflicting-module-names (inline cases): {} of {} pass",
        cases.len() - failed,
        cases.len()
    );
    failed
}

/// `svelte-eslint-parser`'s `svelteConfig` option, else what it reads from the nearest file; the
/// host gives rsvelte the same as [`LintSettings::svelte_config`].
fn svelte_config(
    case: &Case<'_>,
    language_options: Option<LanguageOptions>,
) -> Result<Option<SvelteConfig>, String> {
    if let Some(c) = language_options
        .and_then(|l| l.parser_options)
        .and_then(|p| p.svelte_config)
    {
        return Ok(Some(SvelteConfig { kit: c.kit }));
    }
    svelte_config_file(&case.input, case.root)
        .map(|file| read_svelte_config(&file))
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

/// What `svelte-eslint-parser` takes from a `svelte.config.js`: it evaluates `export default`
/// without running it, keeping `kit.files` when that is static. This reads object literals and
/// literals; a config it would evaluate through anything else is refused.
fn read_svelte_config(path: &Path) -> Result<SvelteConfig, String> {
    let source = read(path);
    let mut tree = SyntaxTree::new();
    let end = u32::try_from(source.len()).map_err(|e| e.to_string())?;
    let program = parse_program(&mut tree, &source, Span::new(0, end), false)
        .map_err(|e| format!("does not parse: {}", e.message))?;
    let Kind::Program(statements) = tree.kind(program) else {
        unreachable!("a program")
    };
    let Some(config) = statements.iter().find_map(|&s| match tree.kind(s) {
        Kind::ExportDefault(declaration) => Some(declaration),
        _ => None,
    }) else {
        return Ok(SvelteConfig::default());
    };
    let Some(kit) = property(&tree, &source, config, "kit")? else {
        return Ok(SvelteConfig::default());
    };
    let routes = match property(&tree, &source, kit, "files")? {
        Some(files) => match property(&tree, &source, files, "routes")? {
            Some(routes) if matches!(tree.kind(routes), Kind::String) => {
                Some(tree.str_value(routes, &source).to_owned())
            }
            Some(_) => return Err("has a `routes` that is not a string".to_owned()),
            None => None,
        },
        None => None,
    };
    Ok(SvelteConfig {
        kit: Some(Kit {
            files: KitFiles { routes },
        }),
    })
}

/// The value of property `key` of an object literal; the last one wins, as in JavaScript.
fn property(
    tree: &SyntaxTree,
    source: &str,
    object: NodeIdentifier,
    key: &str,
) -> Result<Option<NodeIdentifier>, String> {
    let Kind::Object(properties) = tree.kind(object) else {
        return Err("is not object literals".to_owned());
    };
    let mut found = None;
    for &p in properties {
        let Kind::Property {
            key: name,
            value,
            computed: false,
            method: false,
            getter: false,
            setter: false,
            ..
        } = tree.kind(p)
        else {
            return Err("has a property this harness does not evaluate".to_owned());
        };
        let name = match tree.kind(name) {
            Kind::Identifier(atom) => tree.atoms.get(atom),
            Kind::String => tree.str_value(name, source),
            _ => return Err("has a key this harness does not evaluate".to_owned()),
        };
        if name == key {
            found = Some(value);
        }
    }
    Ok(found)
}

/// The findings, or the parse error.
fn lint(
    document: &Document,
    configuration: &Configuration,
) -> Result<Vec<Finding>, rsvelte_kernel::diagnostics::Diagnostic> {
    let mut registry = Registry::new();
    rsvelte_svelte_lint::register_artifacts(&mut registry);
    let context = DocumentContext::new(document, registry.artifacts());
    rsvelte_svelte_lint::lint(&context, configuration)
}

fn read(path: &Path) -> String {
    std::fs::read_to_string(path).unwrap_or_else(|e| panic!("{}: {e}", path.display()))
}
