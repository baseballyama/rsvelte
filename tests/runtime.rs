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
    ensure_fixtures_exist, get_fixture_samples, load_fixture_output, normalize_js, svelte_path,
    write_actual_output,
};
use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

/// Load input from Svelte test suite.
fn load_input(category: &str, sample_name: &str) -> Option<String> {
    let input_path = svelte_path()
        .join("packages/svelte/tests")
        .join(category)
        .join("samples")
        .join(sample_name)
        .join("main.svelte");

    fs::read_to_string(&input_path).ok()
}

/// Check if a test requires unsupported compile options by reading _config.js
fn requires_unsupported_options(category: &str, sample_name: &str) -> bool {
    let config_path = svelte_path()
        .join("packages/svelte/tests")
        .join(category)
        .join("samples")
        .join(sample_name)
        .join("_config.js");

    if let Ok(config) = fs::read_to_string(&config_path) {
        if config.contains("async: true") {
            return true;
        }
        if config.contains("hmr: true") {
            return true;
        }
        if config.contains("compileOptions") && config.contains("preserveComments") {
            return true;
        }
    }
    false
}

/// A runtime test fixture.
struct RuntimeFixture {
    name: String,
    input: String,
    expected_client_js: Option<String>,
    expected_server_js: Option<String>,
    requires_unsupported_options: bool,
}

/// Load a runtime test fixture from fixtures directory.
fn load_runtime_fixture(category: &str, sample_dir: &Path) -> Option<RuntimeFixture> {
    let name = sample_dir.file_name()?.to_str()?.to_string();

    let input = load_input(category, &name)?;

    let expected_client_js = load_fixture_output(category, &name, "client.js");
    let expected_server_js = load_fixture_output(category, &name, "server.js");

    if expected_client_js.is_none() && expected_server_js.is_none() {
        return None;
    }

    Some(RuntimeFixture {
        name: name.clone(),
        input,
        expected_client_js,
        expected_server_js,
        requires_unsupported_options: requires_unsupported_options(category, &name),
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

/// Compare two JavaScript outputs using lightweight normalization.
/// This is much faster than using oxfmt and suitable for comparing essential code structure.
fn compare_js(actual: &str, expected: &str) -> bool {
    let normalized_actual = normalize_js(actual);
    let normalized_expected = normalize_js(expected);
    normalized_actual == normalized_expected
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

    if fixture.requires_unsupported_options {
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
            // Let runes mode be auto-detected from source (matches official compiler behavior)
            ..Default::default()
        };

        match compile(&fixture.input, client_options) {
            Ok(compile_result) => {
                let passed = compare_js(&compile_result.js.code, expected_client);

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
            // Let runes mode be auto-detected from source (matches official compiler behavior)
            ..Default::default()
        };

        match compile(&fixture.input, server_options) {
            Ok(compile_result) => {
                let passed = compare_js(&compile_result.js.code, expected_server);

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
fn run_runtime_tests(category: &str) {
    use rayon::prelude::*;

    ensure_fixtures_exist();

    let samples = get_fixture_samples(category);

    if samples.is_empty() {
        println!("No {} fixtures found.", category);
        return;
    }

    let fixtures: Vec<RuntimeFixture> = samples
        .par_iter()
        .filter_map(|sample_dir| load_runtime_fixture(category, sample_dir.as_path()))
        .collect();

    if fixtures.is_empty() {
        println!("No {} fixtures with expected output found.", category);
        return;
    }

    // Run tests in parallel for better performance
    let results: Vec<TestResult> = fixtures
        .par_iter()
        .map(|f| run_runtime_fixture_test(category, f))
        .collect();

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
        println!("\nFailed tests (first 10):");
        for result in results
            .iter()
            .filter(|r| !r.passed() && !r.skipped)
            .take(10)
        {
            println!("  - {}", result.name);
            if let Some(err) = &result.client_error {
                println!("      Client: {}", err);
            }
            if let Some(err) = &result.server_error {
                println!("      Server: {}", err);
            }
        }
        if failed > 10 {
            println!("  ... and {} more", failed - 10);
        }
    }

    assert_eq!(failed, 0, "{} {} tests failed", failed, category);
}

#[test]
fn test_hydration() {
    run_runtime_tests("hydration");
}

#[test]
fn test_runtime_browser() {
    run_runtime_tests("runtime-browser");
}

#[test]
fn test_runtime_legacy() {
    run_runtime_tests("runtime-legacy");
}

#[test]
fn test_runtime_runes() {
    run_runtime_tests("runtime-runes");
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
