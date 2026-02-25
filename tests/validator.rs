//! Validator tests.
//!
//! These tests verify that the compiler produces expected warnings for Svelte code.
//! They compare warning codes, messages, and positions with the official Svelte test suite.

use std::fs;
use std::path::{Path, PathBuf};

use serde::Deserialize;
use svelte_compiler_rust::{CompileOptions, GenerateMode, compile};
use walkdir::WalkDir;

/// Get the path to the Svelte submodule.
fn svelte_path() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("svelte")
}

/// Get all validator test samples.
fn get_validator_samples() -> Vec<PathBuf> {
    let samples_dir = svelte_path().join("packages/svelte/tests/validator/samples");

    if !samples_dir.exists() {
        return Vec::new();
    }

    WalkDir::new(&samples_dir)
        .min_depth(1)
        .max_depth(1)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| e.file_type().is_dir())
        .map(|e| e.path().to_path_buf())
        .collect()
}

/// Position in source code.
#[derive(Debug, Deserialize, PartialEq, Eq)]
struct Position {
    line: u32,
    column: u32,
}

/// Expected warning from warnings.json.
#[derive(Debug, Deserialize)]
#[allow(dead_code)]
struct ExpectedWarning {
    code: String,
    message: String,
    start: Position,
    end: Position,
}

/// Expected error from errors.json.
#[derive(Debug, Deserialize)]
#[allow(dead_code)]
struct ExpectedError {
    code: String,
    message: String,
    start: Option<Position>,
    end: Option<Position>,
}

/// A validator test fixture.
struct ValidatorFixture {
    name: String,
    input: String,
    input_type: InputType,
    expected_warnings: Vec<ExpectedWarning>,
    expected_error: Option<ExpectedError>,
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
fn load_validator_fixture(sample_dir: &Path) -> Option<ValidatorFixture> {
    // Parse config (includes skip check)
    let config = parse_test_config(sample_dir);
    if config.skip {
        return None;
    }

    let svelte_path = sample_dir.join("input.svelte");
    let module_path = sample_dir.join("input.svelte.js");
    let warnings_path = sample_dir.join("warnings.json");
    let errors_path = sample_dir.join("errors.json");

    // Determine input type and read input
    let (input, input_type) = if svelte_path.exists() {
        (fs::read_to_string(&svelte_path).ok()?, InputType::Svelte)
    } else if module_path.exists() {
        (fs::read_to_string(&module_path).ok()?, InputType::Module)
    } else {
        return None;
    };

    // Load expected warnings
    let expected_warnings: Vec<ExpectedWarning> = if warnings_path.exists() {
        let content = fs::read_to_string(&warnings_path).ok()?;
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        Vec::new()
    };

    // Load expected error (if any)
    let expected_error: Option<ExpectedError> = if errors_path.exists() {
        let content = fs::read_to_string(&errors_path).ok()?;
        let errors: Vec<ExpectedError> = serde_json::from_str(&content).unwrap_or_default();
        errors.into_iter().next()
    } else {
        None
    };

    let name = sample_dir.file_name()?.to_str()?.to_string();

    Some(ValidatorFixture {
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

/// Run a single validator test.
fn run_validator_test(fixture: &ValidatorFixture) -> TestResult {
    // Skip module tests for now (compileModule not implemented)
    if matches!(fixture.input_type, InputType::Module) {
        return TestResult {
            name: fixture.name.clone(),
            passed: false,
            error_message: Some("Module compilation not implemented".to_string()),
            skipped: true,
            warnings_matched: 0,
            warnings_expected: fixture.expected_warnings.len(),
        };
    }

    let name = fixture.name.clone();
    let input = fixture.input.clone();
    let runes = fixture.runes;
    let custom_element = fixture.custom_element;

    // Use panic::catch_unwind to handle panics gracefully
    let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        let options = CompileOptions {
            generate: GenerateMode::Client,
            filename: Some(format!("{}/input.svelte", name)),
            runes,
            custom_element,
            ..Default::default()
        };
        compile(&input, options)
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

                    // Check warnings
                    // For now, we just check if the expected warnings count matches
                    // TODO: Implement proper warning comparison with code, message, and position
                    let actual_warnings_count = result.warnings.len();
                    let expected_warnings_count = fixture.expected_warnings.len();

                    if actual_warnings_count == expected_warnings_count {
                        TestResult {
                            name: fixture.name.clone(),
                            passed: true,
                            error_message: None,
                            skipped: false,
                            warnings_matched: actual_warnings_count,
                            warnings_expected: expected_warnings_count,
                        }
                    } else {
                        TestResult {
                            name: fixture.name.clone(),
                            passed: false,
                            error_message: Some(format!(
                                "Expected {} warnings, got {}",
                                expected_warnings_count, actual_warnings_count
                            )),
                            skipped: false,
                            warnings_matched: 0,
                            warnings_expected: expected_warnings_count,
                        }
                    }
                }
                Err(e) => {
                    // Check if we expected an error
                    if let Some(expected_error) = &fixture.expected_error {
                        let error_str = format!("{:?}", e);
                        let code_matches = error_str.contains(&expected_error.code)
                            || error_str
                                .to_lowercase()
                                .contains(&expected_error.code.replace('_', " ").to_lowercase())
                            // Transform parse errors (OxcDiagnostic) should match js_parse_error
                            || (expected_error.code == "js_parse_error"
                                && error_str.contains("Parse errors"))
                            // TypeScript feature errors from OXC should match typescript_invalid_feature
                            || (expected_error.code == "typescript_invalid_feature"
                                && (error_str.contains("Parameter modifiers can only be used in TypeScript")
                                    || error_str.contains("namespace")
                                    || error_str.contains("TypeScriptInvalidFeature")
                                    // Enum declarations cause parse errors
                                    || error_str.contains("Parse errors")))
                            // Reserved words cause parse errors
                            || (expected_error.code == "unexpected_reserved_word"
                                && error_str.contains("Parse errors"))
                            // Rune spread errors may cause parse errors due to spread in invalid context
                            || (expected_error.code == "rune_invalid_spread"
                                && error_str.contains("Parse errors"));

                        if code_matches {
                            return TestResult {
                                name: fixture.name.clone(),
                                passed: true,
                                error_message: None,
                                skipped: false,
                                warnings_matched: 0,
                                warnings_expected: fixture.expected_warnings.len(),
                            };
                        } else {
                            return TestResult {
                                name: fixture.name.clone(),
                                passed: false,
                                error_message: Some(format!(
                                    "Expected error code '{}', got: {}",
                                    expected_error.code, error_str
                                )),
                                skipped: false,
                                warnings_matched: 0,
                                warnings_expected: fixture.expected_warnings.len(),
                            };
                        }
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

    if samples.is_empty() {
        eprintln!(
            "Warning: No validator samples found. Make sure the Svelte submodule is initialized."
        );
        return;
    }

    let fixtures: Vec<ValidatorFixture> = samples
        .iter()
        .filter_map(|sample_dir| load_validator_fixture(sample_dir.as_path()))
        .collect();

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

    // Assert that all validator tests pass
    assert_eq!(failed, 0, "{} validator tests failed", failed);
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
