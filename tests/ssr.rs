//! Server-side rendering fixture tests for the Svelte compiler.
//!
//! These tests verify server-side compilation output against fixtures.
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
fn load_input(sample_name: &str) -> Option<String> {
    let input_path = svelte_path()
        .join("packages/svelte/tests/server-side-rendering/samples")
        .join(sample_name)
        .join("main.svelte");

    fs::read_to_string(&input_path).ok()
}

/// Check if a test requires unsupported compile options.
fn requires_unsupported_options(sample_name: &str) -> bool {
    let config_path = svelte_path()
        .join("packages/svelte/tests/server-side-rendering/samples")
        .join(sample_name)
        .join("_config.js");

    if let Ok(config) = fs::read_to_string(&config_path)
        && config.contains("async: true")
    {
        return true;
    }
    false
}

/// An SSR test fixture.
struct SsrFixture {
    name: String,
    input: String,
    expected_server_js: Option<String>,
    requires_unsupported_options: bool,
}

/// Load an SSR test fixture.
fn load_ssr_fixture(sample_dir: &Path) -> Option<SsrFixture> {
    let name = sample_dir.file_name()?.to_str()?.to_string();

    let input = load_input(&name)?;
    let expected_server_js = load_fixture_output("server-side-rendering", &name, "server.js");

    // Skip if no expected output
    expected_server_js.as_ref()?;

    Some(SsrFixture {
        name: name.clone(),
        input,
        expected_server_js,
        requires_unsupported_options: requires_unsupported_options(&name),
    })
}

/// Test result for a single fixture.
#[derive(Debug)]
struct TestResult {
    name: String,
    passed: Option<bool>,
    error: Option<String>,
    skipped: bool,
}

/// Compare two JavaScript outputs using lightweight normalization.
/// This is much faster than using oxfmt and suitable for comparing essential code structure.
fn compare_js(actual: &str, expected: &str) -> bool {
    let normalized_actual = normalize_js(actual);
    let normalized_expected = normalize_js(expected);
    normalized_actual == normalized_expected
}

/// Run a single SSR fixture test.
fn run_ssr_fixture_test(fixture: &SsrFixture) -> TestResult {
    if fixture.requires_unsupported_options {
        return TestResult {
            name: fixture.name.clone(),
            passed: None,
            error: None,
            skipped: true,
        };
    }

    let options = CompileOptions {
        generate: GenerateMode::Server,
        filename: Some("main.svelte".to_string()),
        css: CssMode::External,
        ..Default::default()
    };

    match compile(&fixture.input, options) {
        Ok(compile_result) => {
            write_actual_output(
                "server-side-rendering",
                &fixture.name,
                "server.js",
                &compile_result.js.code,
            );

            if let Some(expected) = &fixture.expected_server_js {
                if compare_js(&compile_result.js.code, expected) {
                    TestResult {
                        name: fixture.name.clone(),
                        passed: Some(true),
                        error: None,
                        skipped: false,
                    }
                } else {
                    TestResult {
                        name: fixture.name.clone(),
                        passed: Some(false),
                        error: Some("Server JS mismatch".to_string()),
                        skipped: false,
                    }
                }
            } else {
                TestResult {
                    name: fixture.name.clone(),
                    passed: Some(true),
                    error: None,
                    skipped: false,
                }
            }
        }
        Err(e) => {
            write_actual_output(
                "server-side-rendering",
                &fixture.name,
                "server_error.txt",
                &format!("{:?}", e),
            );

            TestResult {
                name: fixture.name.clone(),
                passed: Some(false),
                error: Some(format!("Compilation error: {}", e)),
                skipped: false,
            }
        }
    }
}

#[test]
fn test_ssr() {
    use rayon::prelude::*;

    ensure_fixtures_exist();

    let samples = get_fixture_samples("server-side-rendering");

    if samples.is_empty() {
        println!("No SSR fixtures found. Run `npm run generate-fixtures` first.");
        return;
    }

    let fixtures: Vec<SsrFixture> = samples
        .iter()
        .filter_map(|sample_dir| load_ssr_fixture(sample_dir.as_path()))
        .collect();

    if fixtures.is_empty() {
        println!("No SSR fixtures with expected output found.");
        return;
    }

    // Run tests in parallel for better performance
    let results: Vec<TestResult> = fixtures.par_iter().map(run_ssr_fixture_test).collect();

    let total = results.len();
    let skipped = results.iter().filter(|r| r.skipped).count();
    let run_count = total - skipped;
    let passed = results
        .iter()
        .filter(|r| !r.skipped && r.passed == Some(true))
        .count();
    let failed = run_count - passed;

    println!("\n=== SSR Tests ===");
    println!(
        "Total: {}/{} passed ({} skipped)",
        passed, run_count, skipped
    );

    if failed > 0 {
        println!("\nFailed tests:");
        for result in results
            .iter()
            .filter(|r| !r.skipped && r.passed != Some(true))
        {
            println!("  - {}", result.name);
            if let Some(err) = &result.error {
                println!("      {}", err);
            }
        }
    }

    assert_eq!(failed, 0, "{} SSR tests failed", failed);
}

/// List all available SSR fixtures.
#[test]
fn list_ssr_fixtures() {
    ensure_fixtures_exist();

    let samples = get_fixture_samples("server-side-rendering");
    println!("\n=== SSR Fixtures ({}) ===", samples.len());

    for sample in samples.iter().take(20) {
        let name = sample.file_name().unwrap().to_str().unwrap();
        let has_server = load_fixture_output("server-side-rendering", name, "server.js").is_some();
        let has_error = load_fixture_output("server-side-rendering", name, "error.json").is_some();

        let markers = match (has_server, has_error) {
            (true, false) => "[server]",
            (false, true) => "[error]",
            (true, true) => "[server+error]",
            (false, false) => "[none]",
        };

        println!("  - {} {}", name, markers);
    }

    if samples.len() > 20 {
        println!("  ... and {} more", samples.len() - 20);
    }
}
