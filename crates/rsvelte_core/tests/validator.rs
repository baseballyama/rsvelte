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

use std::collections::BTreeSet;
use std::fs;
use std::path::{Path, PathBuf};

use common::{
    ExpectedValidatorError, FixtureCoverage, SkipReason, check_validator_error,
    get_svelte_test_samples, load_expected_validator_error, read_fixture_file, sample_name,
    validator_error_result,
};
use rsvelte_core::{CompileOptions, GenerateMode, ModuleCompileOptions, compile, compile_module};
use serde::Deserialize;

/// Grow-only fixture floor, measured against the pinned Svelte submodule: 334
/// samples, 2 of which opt out through `_config.js` (`skip: true` /
/// `warningFilter`). Never lower it.
const MIN_VALIDATOR_FIXTURES: usize = 332;

/// Get all validator test samples.
fn get_validator_samples() -> Vec<PathBuf> {
    get_svelte_test_samples("validator")
}

/// Position in source code.
#[derive(Debug, Deserialize, PartialEq, Eq)]
struct Position {
    line: u32,
    column: u32,
}

/// Expected warning from warnings.json.
#[derive(Debug, Deserialize)]
struct ExpectedWarning {
    code: String,
    message: String,
    start: Position,
    end: Position,
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
}

fn parse_test_config(sample_dir: &Path) -> TestConfig {
    let config_path = sample_dir.join("_config.js");
    let mut config = TestConfig {
        skip: false,
        runes: None,
        custom_element: false,
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

/// Mirrors upstream `test.ts`'s ordered `assert.deepEqual` over
/// `{code, message, start, end}` warning arrays.
fn warnings_match(
    actual: &[rsvelte_core::compiler::Warning],
    expected: &[ExpectedWarning],
) -> bool {
    if actual.len() != expected.len() {
        return false;
    }
    actual.iter().zip(expected.iter()).all(|(a, e)| {
        a.code == e.code
            && common::strip_error_link(&a.message) == e.message
            && a.start
                .as_ref()
                .is_some_and(|p| p.line as u32 == e.start.line && p.column as u32 == e.start.column)
            && a.end
                .as_ref()
                .is_some_and(|p| p.line as u32 == e.end.line && p.column as u32 == e.end.column)
    })
}

/// Run a single validator test.
fn run_validator_test(fixture: &ValidatorFixture) -> TestResult {
    let name = fixture.name.clone();
    let input = fixture.input.clone();
    let runes = fixture.runes;
    let custom_element = fixture.custom_element;

    // Use panic::catch_unwind to handle panics gracefully
    let result =
        std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| match fixture.input_type {
            InputType::Module => {
                let options = ModuleCompileOptions {
                    generate: GenerateMode::Client,
                    filename: Some(format!("{}/input.svelte.js", name)),
                    ..Default::default()
                };
                compile_module(&input, options)
            }
            InputType::Svelte => {
                let options = CompileOptions {
                    generate: GenerateMode::Client,
                    filename: Some(format!("{}/input.svelte", name)),
                    runes,
                    custom_element,
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

                    if warnings_match(&result.warnings, &fixture.expected_warnings) {
                        TestResult {
                            name: fixture.name.clone(),
                            passed: true,
                            error_message: None,
                            skipped: false,
                            warnings_matched: result.warnings.len(),
                            warnings_expected: expected_warnings_count,
                        }
                    } else {
                        let mut detail = format!(
                            "Expected {} warnings, got {}.\n",
                            expected_warnings_count,
                            result.warnings.len()
                        );
                        for w in &result.warnings {
                            let _ = writeln!(
                                detail,
                                "  actual:   [{}] {} @ {:?}..{:?}",
                                w.code,
                                common::strip_error_link(&w.message),
                                w.start.as_ref().map(|p| (p.line, p.column)),
                                w.end.as_ref().map(|p| (p.line, p.column)),
                            );
                        }
                        for w in &fixture.expected_warnings {
                            let _ = writeln!(
                                detail,
                                "  expected: [{}] {} @ {}:{}..{}:{}",
                                w.code,
                                w.message,
                                w.start.line,
                                w.start.column,
                                w.end.line,
                                w.end.column,
                            );
                        }
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

    let mut coverage = FixtureCoverage::new("validator", samples.len());
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

    let regressions: Vec<&str> = failing.difference(&known_set).copied().collect();
    let fixed: Vec<&str> = known_set.difference(&failing).copied().collect();

    if !fixed.is_empty() {
        println!(
            "\n{} ratchet entries now pass — shrink compatibility/validator-known-failures.json \
             (and compatibility/validator-known-failures.md):",
            fixed.len()
        );
        for id in &fixed {
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
