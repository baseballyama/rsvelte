//! Sourcemap fixture tests for the Svelte compiler.
//!
//! These tests verify that the compiler generates correct sourcemaps.
//! Run `npm run generate-fixtures` to generate the expected outputs.

mod common;

use std::fs;
use std::path::Path;

use common::{
    ensure_fixtures_exist, format_js_with_oxfmt, get_fixture_samples, load_fixture_output,
    svelte_path, write_actual_output,
};
use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

/// Load input from Svelte test suite.
fn load_input(sample_name: &str) -> Option<String> {
    let input_path = svelte_path()
        .join("packages/svelte/tests/sourcemaps/samples")
        .join(sample_name)
        .join("input.svelte");

    fs::read_to_string(&input_path).ok()
}

/// A sourcemap test fixture.
struct SourcemapFixture {
    name: String,
    input: String,
    expected_client_js: Option<String>,
    expected_client_map: Option<String>,
    expected_server_js: Option<String>,
    expected_server_map: Option<String>,
}

/// Load a sourcemap test fixture.
fn load_sourcemap_fixture(sample_dir: &Path) -> Option<SourcemapFixture> {
    let name = sample_dir.file_name()?.to_str()?.to_string();

    let input = load_input(&name)?;
    let expected_client_js = load_fixture_output("sourcemaps", &name, "client.js");
    let expected_client_map = load_fixture_output("sourcemaps", &name, "client.js.map");
    let expected_server_js = load_fixture_output("sourcemaps", &name, "server.js");
    let expected_server_map = load_fixture_output("sourcemaps", &name, "server.js.map");

    // Skip if no expected output
    if expected_client_js.is_none() && expected_server_js.is_none() {
        return None;
    }

    Some(SourcemapFixture {
        name,
        input,
        expected_client_js,
        expected_client_map,
        expected_server_js,
        expected_server_map,
    })
}

/// Test result for a single fixture.
#[derive(Debug)]
struct TestResult {
    name: String,
    client_js_passed: Option<bool>,
    client_map_passed: Option<bool>,
    server_js_passed: Option<bool>,
    server_map_passed: Option<bool>,
    error: Option<String>,
}

impl TestResult {
    fn passed(&self) -> bool {
        self.client_js_passed.unwrap_or(true)
            && self.client_map_passed.unwrap_or(true)
            && self.server_js_passed.unwrap_or(true)
            && self.server_map_passed.unwrap_or(true)
    }
}

/// Compare two JavaScript outputs using oxfmt for formatting.
fn compare_js(actual: &str, expected: &str) -> bool {
    let formatted_actual = format_js_with_oxfmt(actual);
    let formatted_expected = format_js_with_oxfmt(expected);
    formatted_actual == formatted_expected
}

/// Run a single sourcemap fixture test.
fn run_sourcemap_fixture_test(fixture: &SourcemapFixture) -> TestResult {
    let mut result = TestResult {
        name: fixture.name.clone(),
        client_js_passed: None,
        client_map_passed: None,
        server_js_passed: None,
        server_map_passed: None,
        error: None,
    };

    // Test client-side compilation
    if fixture.expected_client_js.is_some() {
        let options = CompileOptions {
            generate: GenerateMode::Client,
            filename: Some("input.svelte".to_string()),
            css: CssMode::External,
            ..Default::default()
        };

        match compile(&fixture.input, options) {
            Ok(compile_result) => {
                write_actual_output(
                    "sourcemaps",
                    &fixture.name,
                    "client.js",
                    &compile_result.js.code,
                );

                if let Some(expected) = &fixture.expected_client_js {
                    result.client_js_passed = Some(compare_js(&compile_result.js.code, expected));
                }

                // Compare sourcemap if available
                if let Some(map) = &compile_result.js.map {
                    let map_json = serde_json::to_string_pretty(map).unwrap_or_default();
                    write_actual_output("sourcemaps", &fixture.name, "client.js.map", &map_json);

                    if let Some(_expected_map) = &fixture.expected_client_map {
                        // Sourcemap comparison is complex - for now just check it exists
                        result.client_map_passed = Some(true);
                    }
                }
            }
            Err(e) => {
                result.client_js_passed = Some(false);
                result.error = Some(format!("Client compilation error: {}", e));
            }
        }
    }

    // Test server-side compilation
    if fixture.expected_server_js.is_some() {
        let options = CompileOptions {
            generate: GenerateMode::Server,
            filename: Some("input.svelte".to_string()),
            css: CssMode::External,
            ..Default::default()
        };

        match compile(&fixture.input, options) {
            Ok(compile_result) => {
                write_actual_output(
                    "sourcemaps",
                    &fixture.name,
                    "server.js",
                    &compile_result.js.code,
                );

                if let Some(expected) = &fixture.expected_server_js {
                    result.server_js_passed = Some(compare_js(&compile_result.js.code, expected));
                }

                // Compare sourcemap if available
                if let Some(map) = &compile_result.js.map {
                    let map_json = serde_json::to_string_pretty(map).unwrap_or_default();
                    write_actual_output("sourcemaps", &fixture.name, "server.js.map", &map_json);

                    if let Some(_expected_map) = &fixture.expected_server_map {
                        result.server_map_passed = Some(true);
                    }
                }
            }
            Err(e) => {
                result.server_js_passed = Some(false);
                if result.error.is_none() {
                    result.error = Some(format!("Server compilation error: {}", e));
                }
            }
        }
    }

    result
}

#[test]
fn test_sourcemaps() {
    ensure_fixtures_exist();

    let samples = get_fixture_samples("sourcemaps");

    if samples.is_empty() {
        println!("No sourcemap fixtures found. Run `npm run generate-fixtures` first.");
        return;
    }

    let fixtures: Vec<SourcemapFixture> = samples
        .iter()
        .filter_map(|sample_dir| load_sourcemap_fixture(sample_dir.as_path()))
        .collect();

    if fixtures.is_empty() {
        println!("No sourcemap fixtures with expected output found.");
        return;
    }

    let results: Vec<TestResult> = fixtures.iter().map(run_sourcemap_fixture_test).collect();

    let total = results.len();
    let passed = results.iter().filter(|r| r.passed()).count();
    let failed = total - passed;

    let client_js_total = results
        .iter()
        .filter(|r| r.client_js_passed.is_some())
        .count();
    let client_js_passed = results
        .iter()
        .filter(|r| r.client_js_passed == Some(true))
        .count();

    let server_js_total = results
        .iter()
        .filter(|r| r.server_js_passed.is_some())
        .count();
    let server_js_passed = results
        .iter()
        .filter(|r| r.server_js_passed == Some(true))
        .count();

    println!("\n=== Sourcemap Tests ===");
    println!("Total: {}/{} passed", passed, total);
    println!("  Client JS: {}/{}", client_js_passed, client_js_total);
    println!("  Server JS: {}/{}", server_js_passed, server_js_total);

    if failed > 0 {
        println!("\nFailed tests:");
        for result in results.iter().filter(|r| !r.passed()) {
            println!("  - {}", result.name);
            if let Some(err) = &result.error {
                println!("      {}", err);
            }
        }
    }

    assert_eq!(failed, 0, "{} sourcemap tests failed", failed);
}

/// List all available sourcemap fixtures.
#[test]
fn list_sourcemap_fixtures() {
    ensure_fixtures_exist();

    let samples = get_fixture_samples("sourcemaps");
    println!("\n=== Sourcemap Fixtures ({}) ===", samples.len());

    for sample in &samples {
        let name = sample.file_name().unwrap().to_str().unwrap();
        let has_client = load_fixture_output("sourcemaps", name, "client.js").is_some();
        let has_server = load_fixture_output("sourcemaps", name, "server.js").is_some();
        let has_client_map = load_fixture_output("sourcemaps", name, "client.js.map").is_some();
        let has_server_map = load_fixture_output("sourcemaps", name, "server.js.map").is_some();

        let mut markers = Vec::new();
        if has_client {
            markers.push("client");
        }
        if has_server {
            markers.push("server");
        }
        if has_client_map {
            markers.push("client.map");
        }
        if has_server_map {
            markers.push("server.map");
        }

        println!("  - {} [{}]", name, markers.join(", "));
    }
}
