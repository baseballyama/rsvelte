//! Validator tests.
//!
//! These tests verify that the compiler produces expected warnings for Svelte code.
//! They compare warning codes, messages, and positions with the official Svelte test suite.

use std::fmt::Write as _;
mod common;

// NOTE: Validator runs sequentially. Previous attempts at `par_iter()` hung;
// leading hypothesis is bumpalo arena retention causing memory pressure on
// small CI runners. `common::test_thread_pool()` provides a bounded pool ready
// for use once the hypothesis is verified locally.

use std::collections::{BTreeMap, BTreeSet};
use std::fs;
use std::path::{Path, PathBuf};

use common::{
    ExpectedValidatorError, ExpectedWarning, FixtureCoverage, SkipReason, check_validator_error,
    get_svelte_test_samples, load_expected_validator_error, read_fixture_file, sample_name,
    svelte_samples_dir, validator_error_result, validator_warnings_detail,
    validator_warnings_match,
};
use rsvelte_core::{CompileOptions, GenerateMode, ModuleCompileOptions, compile, compile_module};

/// Grow-only fixture floor, measured against the pinned Svelte submodule: 334
/// samples, 2 of which opt out through `_config.js` (`skip: true` /
/// `warningFilter`). Never lower it.
const MIN_VALIDATOR_FIXTURES: usize = 332;

/// Get all validator test samples.
fn get_validator_samples() -> Vec<PathBuf> {
    get_svelte_test_samples("validator")
}

/// A validator test fixture.
struct ValidatorFixture {
    name: String,
    input: String,
    input_type: InputType,
    expected_warnings: Vec<ExpectedWarning>,
    expected_error: Option<ExpectedValidatorError>,
    /// Compile option: runes mode (None = auto-detect, Some(true) = forced on, Some(false) = forced off)
    runes: Option<bool>,
    /// Compile option: custom element mode
    custom_element: bool,
    /// Compile option: dev mode
    dev: bool,
}

#[derive(Debug, Clone, Copy)]
enum InputType {
    Svelte,
    Module,
}

/// Extract compile options from _config.js.
struct TestConfig {
    skip: bool,
    runes: Option<bool>,
    custom_element: bool,
    dev: bool,
}

fn parse_test_config(sample_dir: &Path) -> TestConfig {
    let config_path = sample_dir.join("_config.js");
    let mut config = TestConfig {
        skip: false,
        runes: None,
        custom_element: false,
        dev: false,
    };

    if config_path.exists()
        && let Ok(content) = fs::read_to_string(&config_path)
    {
        // Check for skip: true in the config
        if content.contains("skip: true") || content.contains("skip:true") {
            config.skip = true;
            return config;
        }
        // Skip tests that require special compile options we don't support yet
        if content.contains("warningFilter") {
            config.skip = true;
            return config;
        }

        // Extract runes option from compileOptions
        // Patterns: `runes: false`, `runes: true`
        if content.contains("runes: false") || content.contains("runes:false") {
            config.runes = Some(false);
        } else if content.contains("runes: true") || content.contains("runes:true") {
            config.runes = Some(true);
        }

        // Extract customElement option from compileOptions
        if content.contains("customElement: true") || content.contains("customElement:true") {
            config.custom_element = true;
        }

        if content.contains("dev: true") || content.contains("dev:true") {
            config.dev = true;
        }
    }

    config
}

/// Load a validator test fixture.
fn load_validator_fixture(sample_dir: &Path) -> Result<ValidatorFixture, SkipReason> {
    // Parse config (includes skip check)
    let config = parse_test_config(sample_dir);
    if config.skip {
        return Err(SkipReason::Justified);
    }

    let svelte_path = sample_dir.join("input.svelte");
    let module_path = sample_dir.join("input.svelte.js");
    let warnings_path = sample_dir.join("warnings.json");
    let errors_path = sample_dir.join("errors.json");

    // Determine input type and read input
    let (input, input_type) = if svelte_path.exists() {
        (
            read_fixture_file(&svelte_path)
                .ok_or(SkipReason::MissingInput("readable input.svelte"))?,
            InputType::Svelte,
        )
    } else if module_path.exists() {
        (
            read_fixture_file(&module_path)
                .ok_or(SkipReason::MissingInput("readable input.svelte.js"))?,
            InputType::Module,
        )
    } else {
        return Err(SkipReason::MissingInput("input.svelte / input.svelte.js"));
    };

    // Load expected warnings
    let expected_warnings: Vec<ExpectedWarning> = if warnings_path.exists() {
        let content = read_fixture_file(&warnings_path)
            .ok_or(SkipReason::MissingInput("readable warnings.json"))?;
        // A malformed warnings.json must fail loudly, not silently become "expect
        // zero warnings" — that would make the fixture pass trivially either way.
        serde_json::from_str(&content).unwrap_or_else(|e| {
            panic!(
                "{}: warnings.json is not valid JSON: {e}",
                warnings_path.display()
            )
        })
    } else {
        Vec::new()
    };

    let expected_error = load_expected_validator_error(&errors_path)
        .unwrap_or_else(|e| panic!("{}: {e}", sample_dir.display()));

    let name = sample_name(sample_dir).to_string();

    Ok(ValidatorFixture {
        name,
        input,
        input_type,
        expected_warnings,
        expected_error,
        runes: config.runes,
        custom_element: config.custom_element,
        dev: config.dev,
    })
}

/// Test result for a single fixture.
#[derive(Debug)]
#[allow(dead_code)]
struct TestResult {
    name: String,
    passed: bool,
    error_message: Option<String>,
    skipped: bool,
    warnings_matched: usize,
    warnings_expected: usize,
}

/// Run a single validator test.
fn run_validator_test(fixture: &ValidatorFixture) -> TestResult {
    let input = fixture.input.clone();
    let runes = fixture.runes;
    let custom_element = fixture.custom_element;
    let dev = fixture.dev;

    // No `filename`: upstream's `tests/validator/test.ts` passes only
    // `generate` plus the sample's own options, so diagnostics that branch on
    // the unset-filename sentinel (`svelte_self_deprecated`) must see it unset.
    let result =
        std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| match fixture.input_type {
            InputType::Module => {
                let options = ModuleCompileOptions {
                    generate: GenerateMode::Client,
                    dev,
                    ..Default::default()
                };
                compile_module(&input, options)
            }
            InputType::Svelte => {
                let options = CompileOptions {
                    generate: GenerateMode::Client,
                    runes,
                    custom_element,
                    dev,
                    ..Default::default()
                };
                compile(&input, options)
            }
        }));

    match result {
        Err(_) => TestResult {
            name: fixture.name.clone(),
            passed: false,
            error_message: Some("Compilation panicked".to_string()),
            skipped: false,
            warnings_matched: 0,
            warnings_expected: fixture.expected_warnings.len(),
        },
        Ok(compile_result) => {
            match compile_result {
                Ok(result) => {
                    // Check if we expected an error but got success
                    if let Some(expected_error) = &fixture.expected_error {
                        return TestResult {
                            name: fixture.name.clone(),
                            passed: false,
                            error_message: Some(format!(
                                "Expected error '{}' but compilation succeeded",
                                expected_error.code
                            )),
                            skipped: false,
                            warnings_matched: 0,
                            warnings_expected: fixture.expected_warnings.len(),
                        };
                    }

                    // Check warnings: upstream compares the full ordered array
                    // (code, stripped message, start/end position), not just a count.
                    let expected_warnings_count = fixture.expected_warnings.len();

                    if validator_warnings_match(&result.warnings, &fixture.expected_warnings) {
                        TestResult {
                            name: fixture.name.clone(),
                            passed: true,
                            error_message: None,
                            skipped: false,
                            warnings_matched: result.warnings.len(),
                            warnings_expected: expected_warnings_count,
                        }
                    } else {
                        let detail =
                            validator_warnings_detail(&result.warnings, &fixture.expected_warnings);
                        TestResult {
                            name: fixture.name.clone(),
                            passed: false,
                            error_message: Some(detail),
                            skipped: false,
                            warnings_matched: 0,
                            warnings_expected: expected_warnings_count,
                        }
                    }
                }
                Err(e) => {
                    // Check if we expected an error
                    if let Some(expected_error) = &fixture.expected_error {
                        let verdict = check_validator_error(expected_error, &e, &input);
                        return match validator_error_result(&fixture.name, verdict) {
                            Ok(()) => TestResult {
                                name: fixture.name.clone(),
                                passed: true,
                                error_message: None,
                                skipped: false,
                                warnings_matched: 0,
                                warnings_expected: fixture.expected_warnings.len(),
                            },
                            Err(detail) => TestResult {
                                name: fixture.name.clone(),
                                passed: false,
                                error_message: Some(detail),
                                skipped: false,
                                warnings_matched: 0,
                                warnings_expected: fixture.expected_warnings.len(),
                            },
                        };
                    }

                    // Unexpected error
                    TestResult {
                        name: fixture.name.clone(),
                        passed: false,
                        error_message: Some(format!("Unexpected compilation error: {:?}", e)),
                        skipped: false,
                        warnings_matched: 0,
                        warnings_expected: fixture.expected_warnings.len(),
                    }
                }
            }
        }
    }
}

#[test]
fn test_validator() {
    let samples = get_validator_samples();

    let mut coverage =
        FixtureCoverage::new("validator", svelte_samples_dir("validator"), samples.len());
    let mut fixtures: Vec<ValidatorFixture> = Vec::new();
    for sample_dir in &samples {
        match load_validator_fixture(sample_dir.as_path()) {
            Ok(fixture) => {
                coverage.ran();
                fixtures.push(fixture);
            }
            Err(reason) => coverage.skipped(sample_name(sample_dir), reason),
        }
    }
    coverage.assert(MIN_VALIDATOR_FIXTURES);

    // Run sequentially to avoid hangs
    println!("Running {} validator tests...", fixtures.len());
    let results: Vec<TestResult> = fixtures
        .iter()
        .enumerate()
        .map(|(i, f)| {
            eprint!("\r[{}/{}] Testing {}...", i + 1, fixtures.len(), f.name);
            run_validator_test(f)
        })
        .collect();
    eprintln!();

    // Count results
    let total = results.len();
    let skipped = results.iter().filter(|r| r.skipped).count();
    let run_count = total - skipped;
    let passed = results.iter().filter(|r| r.passed).count();
    let failed = run_count - passed;

    println!("\n=== Validator Tests ===");
    println!(
        "Total: {}/{} passed ({} skipped)",
        passed, run_count, skipped
    );

    if failed > 0 {
        println!("\nFailed tests (all {}):", failed);
        for result in results.iter().filter(|r| !r.passed && !r.skipped) {
            println!("  - {}", result.name);
            if let Some(err) = &result.error_message {
                println!("      {}", err);
            }
        }
    }

    if skipped > 0 {
        println!(
            "\nSkipped: {} tests (module compilation not implemented)",
            skipped
        );
    }

    // Shrink-only ratchet: warnings/errors are now compared by full
    // upstream-parity shape (code/message/span), not just count, so any
    // divergence must be either fixed or justified here rather than
    // silently accepted by loosening the assertion above.
    let known: Vec<String> = load_ratchet("validator-known-failures.json");
    let known_set: BTreeSet<&str> = known.iter().map(String::as_str).collect();
    let failing: BTreeSet<&str> = results
        .iter()
        .filter(|r| !r.passed && !r.skipped)
        .map(|r| r.name.as_str())
        .collect();

    let ran: BTreeSet<&str> = results
        .iter()
        .filter(|r| !r.skipped)
        .map(|r| r.name.as_str())
        .collect();

    let regressions: Vec<&str> = failing.difference(&known_set).copied().collect();
    // "Not failing" is two states, and only one of them is good news: a listed id
    // that no longer names a runnable fixture was never measured at all.
    let fixed: Vec<&str> = known_set
        .difference(&failing)
        .copied()
        .filter(|id| ran.contains(id))
        .collect();
    let unmeasured: Vec<&str> = known_set.difference(&ran).copied().collect();

    println!(
        "\nRatchet: {} listed, {} of them ran, {} failing overall, {} regressions, \
         {} stale, {} unmeasured",
        known_set.len(),
        known_set.len() - unmeasured.len(),
        failing.len(),
        regressions.len(),
        fixed.len(),
        unmeasured.len()
    );

    if !fixed.is_empty() {
        println!(
            "\n❌ {} ratchet entries already pass — the ratchet is stale; shrink \
             compatibility/validator-known-failures.json (and \
             compatibility/validator-known-failures.md):",
            fixed.len()
        );
        for id in &fixed {
            println!("  {id}");
        }
    }

    if !unmeasured.is_empty() {
        println!(
            "\n❌ {} ratchet entries name no runnable fixture — they are NOT passing, they \
             are unmeasured. Deleting them hides whatever removed the fixture:",
            unmeasured.len()
        );
        for id in &unmeasured {
            println!("  {id}");
        }
    }

    if !regressions.is_empty() {
        println!(
            "\n{} validator failures not in compatibility/validator-known-failures.json:",
            regressions.len()
        );
        for id in &regressions {
            println!("  {id}");
        }
    }

    assert!(
        regressions.is_empty(),
        "{} validator regressions (not in compatibility/validator-known-failures.json)",
        regressions.len()
    );
    // A stale entry suppresses *everything* about its fixture, not just the divergence
    // its justification names, so an entry that already passes must go in the change
    // that made it pass — matching `sourcemaps_gate.rs`.
    assert!(
        fixed.is_empty(),
        "{} stale entries in compatibility/validator-known-failures.json (they already pass)",
        fixed.len()
    );
    assert!(
        unmeasured.is_empty(),
        "{} entr(ies) in compatibility/validator-known-failures.json name no runnable fixture \
         — they are unmeasured, not fixed: {unmeasured:?}",
        unmeasured.len()
    );
}

/// Grow-only floor, measured against the pinned Svelte submodule: 165 of the 334
/// samples reach the message comparison. Never lower it.
const MIN_MESSAGE_COMPARISONS: usize = 165;

/// Grow-only floor on the raw number of warning *messages* compared. `compared`
/// counts fixtures, and a fixture where both sides emit zero warnings reaches the
/// comparison while comparing nothing — so the fixture count alone can hold while
/// every text comparison disappears.
const MIN_MESSAGE_TEXTS: usize = 546;

/// Why a fixture never reached the warning-message comparison.
#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Debug)]
enum NotComparable {
    /// Upstream's `_config.js` opts the sample out (`skip` / `warningFilter`).
    OptedOut,
    /// The sample carries no readable input.
    NoInput,
    /// No generated `warnings.json` — the official run left no oracle.
    NoOracle,
    /// Official rejected this input and so did rsvelte: there is nothing to compare.
    BothRejected,
    /// rsvelte panicked.
    Panicked,
    /// rsvelte rejected an input official accepted.
    RsvelteRejected,
    /// rsvelte accepted an input official rejected.
    RsvelteAccepted,
    /// The two sides disagree on how many warnings were emitted.
    CountDiffers,
    /// The two sides disagree on which codes were emitted, or on their order.
    CodesDiffer,
}

impl NotComparable {
    /// Structural causes are properties of the fixture. Everything else is an
    /// rsvelte divergence that also silently removes the fixture from this gate.
    fn is_structural(self) -> bool {
        matches!(self, Self::OptedOut | Self::NoInput | Self::BothRejected)
    }

    fn label(self) -> &'static str {
        match self {
            Self::OptedOut => "opted out by upstream _config.js",
            Self::NoInput => "no readable input file",
            Self::NoOracle => "no generated warnings.json oracle",
            Self::BothRejected => "both compilers reject the input",
            Self::Panicked => "rsvelte panicked",
            Self::RsvelteRejected => "rsvelte rejects an input official accepts",
            Self::RsvelteAccepted => "rsvelte accepts an input official rejects",
            Self::CountDiffers => "warning counts disagree",
            Self::CodesDiffer => "warning codes disagree",
        }
    }
}

/// Warning message text, ratcheted independently of `validator-known-failures.json`.
///
/// That ratchet is per-fixture and all-or-nothing, so a fixture listed for a
/// missing span stops being watched for its message text as well — three wrong
/// messages shipped behind position justifications exactly that way.
///
/// The oracle is the *generated* fixture (official run on this same input), not
/// the sample's checked-in `warnings.json`: upstream committed those under a
/// different filename, so a message interpolating the filename diverges
/// spuriously against it.
#[test]
fn validator_warning_messages_match_official() {
    common::ensure_fixtures_exist();

    let known: BTreeSet<String> = load_ratchet("validator-message-known-failures.json")
        .into_iter()
        .collect();
    let declared_incomparable: BTreeSet<String> =
        load_ratchet("validator-message-not-comparable.json")
            .into_iter()
            .collect();

    let mut compared: BTreeSet<String> = BTreeSet::new();
    let mut texts = 0usize;
    let mut incomparable: BTreeMap<String, NotComparable> = BTreeMap::new();
    let mut diverged: BTreeSet<String> = BTreeSet::new();
    let mut detail = String::new();

    for sample_dir in get_validator_samples() {
        let name = sample_name(&sample_dir).to_string();
        let fixture = match load_validator_fixture(sample_dir.as_path()) {
            Ok(fixture) => fixture,
            Err(SkipReason::Justified) => {
                incomparable.insert(name, NotComparable::OptedOut);
                continue;
            }
            Err(_) => {
                incomparable.insert(name, NotComparable::NoInput);
                continue;
            }
        };

        let Some(raw) = common::load_fixture_output("validator", &name, "warnings.json") else {
            incomparable.insert(name, NotComparable::NoOracle);
            continue;
        };
        let Ok(expected) = serde_json::from_str::<Vec<ExpectedWarning>>(&raw) else {
            panic!("{name}: generated warnings.json is not valid JSON");
        };

        let input = fixture.input.clone();
        let compiled =
            std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| match fixture.input_type {
                InputType::Module => compile_module(
                    &input,
                    ModuleCompileOptions {
                        generate: GenerateMode::Client,
                        filename: Some(format!("{}/input.svelte.js", name)),
                        dev: fixture.dev,
                        ..Default::default()
                    },
                ),
                InputType::Svelte => compile(
                    &input,
                    CompileOptions {
                        generate: GenerateMode::Client,
                        filename: Some(format!("{}/input.svelte", name)),
                        runes: fixture.runes,
                        custom_element: fixture.custom_element,
                        dev: fixture.dev,
                        ..Default::default()
                    },
                ),
            }));
        let official_rejects = fixture.expected_error.is_some();
        let result = match compiled {
            Err(_) => {
                incomparable.insert(name, NotComparable::Panicked);
                continue;
            }
            Ok(Err(_)) if official_rejects => {
                incomparable.insert(name, NotComparable::BothRejected);
                continue;
            }
            Ok(Err(_)) => {
                incomparable.insert(name, NotComparable::RsvelteRejected);
                continue;
            }
            Ok(Ok(_)) if official_rejects => {
                incomparable.insert(name, NotComparable::RsvelteAccepted);
                continue;
            }
            Ok(Ok(result)) => result,
        };

        // Codes and counts are the other ratchets' business; only compare text
        // where the two sides already agree on which warnings were emitted.
        if result.warnings.len() != expected.len() {
            incomparable.insert(name, NotComparable::CountDiffers);
            continue;
        }
        if !result
            .warnings
            .iter()
            .zip(expected.iter())
            .all(|(a, e)| a.code == e.code)
        {
            incomparable.insert(name, NotComparable::CodesDiffer);
            continue;
        }

        compared.insert(name.clone());
        for (a, e) in result.warnings.iter().zip(expected.iter()) {
            texts += 1;
            let actual = common::strip_error_link(&a.message);
            let want = common::strip_error_link(&e.message);
            if actual != want && diverged.insert(name.clone()) {
                let _ = write!(
                    detail,
                    "\n  {name} [{}]\n    rsvelte:  {actual}\n    official: {want}",
                    a.code
                );
            }
        }
    }

    // Raw counts, never a rate: "0 divergences" and "0 comparisons" print the same
    // percentage, and only one of them is good news.
    let mut by_cause: BTreeMap<NotComparable, Vec<&str>> = BTreeMap::new();
    for (name, cause) in &incomparable {
        by_cause.entry(*cause).or_default().push(name.as_str());
    }
    println!(
        "\n=== Validator warning messages ===\n{} fixture(s) compared, {} message(s) compared, \
         {} not comparable",
        compared.len(),
        texts,
        incomparable.len()
    );
    for (cause, names) in &by_cause {
        println!("  {:>3}  {} ({names:?})", names.len(), cause.label());
    }

    // A fixture that stops being comparable for a non-structural reason has left this
    // gate entirely; it is neither passing nor failing here, so it must be declared.
    let undeclared_incomparable: Vec<String> = incomparable
        .iter()
        .filter(|(name, cause)| !cause.is_structural() && !declared_incomparable.contains(*name))
        .map(|(name, cause)| format!("{name} ({})", cause.label()))
        .collect();
    let declared_but_comparable: Vec<&String> = declared_incomparable
        .iter()
        .filter(|n| !incomparable.contains_key(*n) || incomparable[*n].is_structural())
        .collect();

    let new_failures: Vec<&String> = diverged.iter().filter(|n| !known.contains(*n)).collect();
    // Three states, not two: a listed entry that stopped diverging either matches
    // now (delete it) or stopped being compared at all (a regression that deleting
    // the entry would bury).
    let now_matching: Vec<&String> = known
        .iter()
        .filter(|n| compared.contains(*n) && !diverged.contains(*n))
        .collect();
    let no_longer_comparable: Vec<String> = known
        .iter()
        .filter(|n| !compared.contains(*n))
        .map(|n| {
            let cause = incomparable
                .get(n)
                .map_or("the fixture no longer exists", |c| c.label());
            format!("{n} ({cause})")
        })
        .collect();

    // Named fixtures before aggregate floors: both fire on the same regression, and
    // only the first message says which fixture left.
    assert!(
        undeclared_incomparable.is_empty(),
        "{} fixture(s) dropped out of the warning-message comparison for a non-structural \
         reason and are not in compatibility/validator-message-not-comparable.json: \
         {undeclared_incomparable:?}",
        undeclared_incomparable.len()
    );
    assert!(
        new_failures.is_empty(),
        "{} validator warning message(s) diverge from official and are not in \
         compatibility/validator-message-known-failures.json: {new_failures:?}\n{detail}",
        new_failures.len()
    );
    assert!(
        no_longer_comparable.is_empty(),
        "{} entr(ies) in compatibility/validator-message-known-failures.json no longer reach \
         the message comparison: {no_longer_comparable:?}. This is a REGRESSION, not a fix — \
         deleting the entry would permanently hide whatever stopped the comparison.",
        no_longer_comparable.len()
    );
    assert!(
        now_matching.is_empty(),
        "{} entr(ies) in compatibility/validator-message-known-failures.json now match — \
         remove them (and their justification in the paired .md): {now_matching:?}",
        now_matching.len()
    );
    assert!(
        declared_but_comparable.is_empty(),
        "{} entr(ies) in compatibility/validator-message-not-comparable.json are comparable \
         again — remove them (and their justification in the paired .md): \
         {declared_but_comparable:?}",
        declared_but_comparable.len()
    );
    assert!(
        compared.len() >= MIN_MESSAGE_COMPARISONS,
        "only {} fixture(s) reached message comparison, floor is \
         {MIN_MESSAGE_COMPARISONS}. This floor is grow-only — if the comparison stopped \
         running, fix it rather than lowering the floor.",
        compared.len()
    );
    assert!(
        texts >= MIN_MESSAGE_TEXTS,
        "only {texts} warning message(s) were compared, floor is {MIN_MESSAGE_TEXTS}. \
         This floor is grow-only."
    );
}

fn compatibility_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../compatibility")
}

fn load_ratchet(file: &str) -> Vec<String> {
    let path = compatibility_dir().join(file);
    let text = fs::read_to_string(&path)
        .unwrap_or_else(|e| panic!("failed to read {}: {e}", path.display()));
    serde_json::from_str(&text)
        .unwrap_or_else(|e| panic!("failed to parse {}: {e}", path.display()))
}

/// List all available validator fixtures.
#[test]
fn list_validator_fixtures() {
    println!("\n=== Available Validator Fixtures ===\n");

    let samples = get_validator_samples();
    println!("Validator samples ({}):", samples.len());

    for sample in samples.iter().take(30) {
        let name = sample.file_name().unwrap().to_str().unwrap();
        let has_svelte = sample.join("input.svelte").exists();
        let has_module = sample.join("input.svelte.js").exists();
        let has_warnings = sample.join("warnings.json").exists();
        let has_errors = sample.join("errors.json").exists();

        let input_type = match (has_svelte, has_module) {
            (true, _) => "[svelte]",
            (_, true) => "[module]",
            _ => "[none]",
        };

        let expected = match (has_warnings, has_errors) {
            (true, true) => "[warnings+errors]",
            (true, false) => "[warnings]",
            (false, true) => "[errors]",
            (false, false) => "[none]",
        };

        println!("  - {} {} {}", name, input_type, expected);
    }

    if samples.len() > 30 {
        println!("  ... and {} more", samples.len() - 30);
    }
}
