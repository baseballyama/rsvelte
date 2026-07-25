//! Runtime fixture tests for the Svelte compiler.
//!
//! These tests verify compiler output for runtime test cases:
//! - hydration
//! - runtime-browser
//! - runtime-legacy
//! - runtime-runes
//!
//! Run `npm run generate-fixtures` to generate the expected outputs.

mod common;

use std::fs;
use std::path::Path;

use common::{
    FixtureCoverage, RuntimeFixtureOptions, SkipReason, compare_js_with_debug as compare_js_debug,
    ensure_fixtures_exist, get_fixture_samples, load_fixture_output, runtime_fixture_options,
    runtime_skip_names, sample_name, svelte_path, write_actual_output,
};
use rsvelte_core::{CompileOptions, ExperimentalOptions, GenerateMode, compile, compiler::CssMode};

/// Grow-only fixture floors, measured against the pinned Svelte submodule.
/// The gap to the sample count is samples whose fixture holds only
/// `warnings.json` / `error.json` — the official compiler emitted no code for
/// them, so there is nothing to compare. Raise these when upstream adds
/// samples; never lower them.
const MIN_HYDRATION_FIXTURES: usize = 80;
const MIN_RUNTIME_BROWSER_FIXTURES: usize = 32;
const MIN_RUNTIME_LEGACY_FIXTURES: usize = 1206;
const MIN_RUNTIME_RUNES_FIXTURES: usize = 1009;

/// Load input from Svelte test suite.
fn load_input(category: &str, sample_name: &str) -> Option<String> {
    let input_path = svelte_path()
        .join("packages/svelte/tests")
        .join(category)
        .join("samples")
        .join(sample_name)
        .join("main.svelte");

    // Normalize CRLF→LF so byte offsets in compiled output match the
    // LF-authored expected fixtures regardless of how Git on Windows
    // (autocrlf=true) checked out the submodule.
    fs::read_to_string(&input_path)
        .ok()
        .map(|s| s.replace("\r\n", "\n"))
}

/// A runtime test fixture.
struct RuntimeFixture {
    name: String,
    input: String,
    expected_client_js: Option<String>,
    expected_server_js: Option<String>,
    /// The options the expected output was generated with.
    options: RuntimeFixtureOptions,
}

/// Load a runtime test fixture from fixtures directory.
fn load_runtime_fixture(category: &str, sample_dir: &Path) -> Result<RuntimeFixture, SkipReason> {
    let name = sample_dir
        .file_name()
        .and_then(|n| n.to_str())
        .ok_or(SkipReason::MissingInput("valid sample directory name"))?
        .to_string();

    let input = load_input(category, &name).ok_or(SkipReason::MissingInput("main.svelte"))?;

    let expected_client_js = load_fixture_output(category, &name, "client.js");
    let expected_server_js = load_fixture_output(category, &name, "server.js");

    // Neither output means the official compiler emitted no code for this
    // sample (the fixture holds only `warnings.json` / `error.json`).
    if expected_client_js.is_none() && expected_server_js.is_none() {
        return Err(SkipReason::Justified);
    }

    Ok(RuntimeFixture {
        options: runtime_fixture_options(category, &name),
        name,
        input,
        expected_client_js,
        expected_server_js,
    })
}

/// Test result for a single fixture.
#[derive(Debug)]
struct TestResult {
    name: String,
    client_passed: Option<bool>,
    server_passed: Option<bool>,
    client_error: Option<String>,
    server_error: Option<String>,
    skipped: bool,
}

impl TestResult {
    fn passed(&self) -> bool {
        self.skipped || (self.client_passed.unwrap_or(true) && self.server_passed.unwrap_or(true))
    }
}

/// Check if actual output writing is enabled via environment variable.
fn should_write_actual_output() -> bool {
    std::env::var("WRITE_ACTUAL_OUTPUT").is_ok()
}

/// Run a single runtime fixture test.
fn run_runtime_fixture_test(category: &str, fixture: &RuntimeFixture) -> TestResult {
    let mut result = TestResult {
        name: fixture.name.clone(),
        client_passed: None,
        server_passed: None,
        client_error: None,
        server_error: None,
        skipped: false,
    };

    if runtime_skip_names(category).contains(&fixture.name.as_str()) {
        result.skipped = true;
        return result;
    }

    let write_output = should_write_actual_output();

    // Test client-side compilation
    if let Some(expected_client) = &fixture.expected_client_js {
        let client_options = CompileOptions {
            generate: GenerateMode::Client,
            filename: Some("main.svelte".to_string()),
            css: CssMode::External,
            experimental: ExperimentalOptions {
                r#async: fixture.options.r#async,
            },
            hmr: fixture.options.hmr,
            accessors: fixture.options.accessors,
            ..Default::default()
        };

        match compile(&fixture.input, client_options) {
            Ok(compile_result) => {
                let passed =
                    compare_js_debug(&compile_result.js.code, expected_client, &fixture.name);

                if write_output {
                    write_actual_output(
                        category,
                        &fixture.name,
                        "client.js",
                        &compile_result.js.code,
                    );
                }

                if passed {
                    result.client_passed = Some(true);
                } else {
                    result.client_passed = Some(false);
                    result.client_error = Some("Client JS mismatch".to_string());
                }
            }
            Err(e) => {
                result.client_passed = Some(false);
                result.client_error = Some(format!("Client compilation error: {}", e));

                if write_output {
                    write_actual_output(
                        category,
                        &fixture.name,
                        "client_error.txt",
                        &format!("{:?}", e),
                    );
                }
            }
        }
    }

    // Test server-side compilation
    if let Some(expected_server) = &fixture.expected_server_js {
        let server_options = CompileOptions {
            generate: GenerateMode::Server,
            filename: Some("main.svelte".to_string()),
            css: CssMode::External,
            experimental: ExperimentalOptions {
                r#async: fixture.options.r#async,
            },
            hmr: fixture.options.hmr,
            // Let runes mode be auto-detected from source (matches official compiler behavior)
            ..Default::default()
        };

        match compile(&fixture.input, server_options) {
            Ok(compile_result) => {
                let passed =
                    compare_js_debug(&compile_result.js.code, expected_server, &fixture.name);

                if write_output {
                    write_actual_output(
                        category,
                        &fixture.name,
                        "server.js",
                        &compile_result.js.code,
                    );
                }

                if passed {
                    result.server_passed = Some(true);
                } else {
                    result.server_passed = Some(false);
                    result.server_error = Some("Server JS mismatch".to_string());
                }
            }
            Err(e) => {
                result.server_passed = Some(false);
                result.server_error = Some(format!("Server compilation error: {}", e));

                if write_output {
                    write_actual_output(
                        category,
                        &fixture.name,
                        "server_error.txt",
                        &format!("{:?}", e),
                    );
                }
            }
        }
    }

    result
}

/// Run tests for a specific runtime category.
fn run_runtime_tests(category: &str, min_fixtures: usize) {
    use rayon::prelude::*;

    ensure_fixtures_exist();

    let samples = get_fixture_samples(category);

    // Limit parallelism to avoid memory explosion
    // (845 tests * many parallel threads can consume excessive memory)
    let pool = rayon::ThreadPoolBuilder::new()
        .num_threads(4)
        .build()
        .expect("Failed to build thread pool");

    // Load fixtures sequentially (fast, low memory)
    let mut coverage = FixtureCoverage::new(category, samples.len());
    let mut fixtures: Vec<RuntimeFixture> = Vec::new();
    for sample_dir in &samples {
        match load_runtime_fixture(category, sample_dir.as_path()) {
            Ok(fixture) => {
                coverage.ran();
                fixtures.push(fixture);
            }
            Err(reason) => coverage.skipped(sample_name(sample_dir), reason),
        }
    }
    coverage.assert(min_fixtures);

    // Run tests with limited parallelism (4 threads max)
    let results: Vec<TestResult> = pool.install(|| {
        fixtures
            .par_iter()
            .map(|f| run_runtime_fixture_test(category, f))
            .collect()
    });

    let total = results.len();
    let skipped = results.iter().filter(|r| r.skipped).count();
    let run_count = total - skipped;
    let passed = results.iter().filter(|r| r.passed() && !r.skipped).count();
    let failed = run_count - passed;

    let client_total = results
        .iter()
        .filter(|r| !r.skipped && r.client_passed.is_some())
        .count();
    let client_passed = results
        .iter()
        .filter(|r| !r.skipped && r.client_passed == Some(true))
        .count();

    let server_total = results
        .iter()
        .filter(|r| !r.skipped && r.server_passed.is_some())
        .count();
    let server_passed = results
        .iter()
        .filter(|r| !r.skipped && r.server_passed == Some(true))
        .count();

    println!("\n=== {} Tests ===", category);
    println!(
        "Total: {}/{} passed ({} skipped)",
        passed, run_count, skipped
    );
    println!("  Client: {}/{}", client_passed, client_total);
    println!("  Server: {}/{}", server_passed, server_total);

    if failed > 0 {
        println!("\nFailed tests (ALL {}):", failed);
        for result in results.iter().filter(|r| !r.passed() && !r.skipped) {
            let client_status = match result.client_passed {
                Some(true) => "OK",
                Some(false) => {
                    if result
                        .client_error
                        .as_deref()
                        .unwrap_or("")
                        .contains("compilation error")
                    {
                        "COMPILE_ERROR"
                    } else {
                        "MISMATCH"
                    }
                }
                None => "N/A",
            };
            let server_status = match result.server_passed {
                Some(true) => "OK",
                Some(false) => {
                    if result
                        .server_error
                        .as_deref()
                        .unwrap_or("")
                        .contains("compilation error")
                    {
                        "COMPILE_ERROR"
                    } else {
                        "MISMATCH"
                    }
                }
                None => "N/A",
            };
            println!(
                "  FAIL|{}|client={}|server={}",
                result.name, client_status, server_status
            );
        }
    }

    assert_eq!(failed, 0, "{} {} tests failed", failed, category);
}

#[test]
fn test_hydration() {
    run_runtime_tests("hydration", MIN_HYDRATION_FIXTURES);
}

#[test]
fn test_runtime_browser() {
    run_runtime_tests("runtime-browser", MIN_RUNTIME_BROWSER_FIXTURES);
}

#[test]
fn test_runtime_legacy() {
    run_runtime_tests("runtime-legacy", MIN_RUNTIME_LEGACY_FIXTURES);
}

#[test]
fn test_runtime_runes() {
    run_runtime_tests("runtime-runes", MIN_RUNTIME_RUNES_FIXTURES);
}

/// List all available runtime fixtures.
#[test]
fn list_runtime_fixtures() {
    ensure_fixtures_exist();

    for category in &[
        "hydration",
        "runtime-browser",
        "runtime-legacy",
        "runtime-runes",
    ] {
        let samples = get_fixture_samples(category);
        println!("\n=== {} Fixtures ({}) ===", category, samples.len());

        for sample in samples.iter().take(10) {
            let name = sample.file_name().unwrap().to_str().unwrap();
            let has_client = load_fixture_output(category, name, "client.js").is_some();
            let has_server = load_fixture_output(category, name, "server.js").is_some();

            let modes = match (has_client, has_server) {
                (true, true) => "[client, server]",
                (true, false) => "[client]",
                (false, true) => "[server]",
                (false, false) => "[none]",
            };

            println!("  - {} {}", name, modes);
        }

        if samples.len() > 10 {
            println!("  ... and {} more", samples.len() - 10);
        }
    }
}
