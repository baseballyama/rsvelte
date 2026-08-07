//! Sourcemap fixture tests for the Svelte compiler.
//!
//! This file checks the *generated code* for the `sourcemaps` samples. Map
//! correctness is checked by `tests/sourcemaps_gate.rs`; the `_actual/*.map`
//! artifacts written here are for debugging only.
//! Run `npm run generate-fixtures` to generate the expected outputs.

mod common;

use std::fs;
use std::path::Path;

use common::{
    FixtureCoverage, SkipReason, compare_js, ensure_fixtures_exist, fixture_samples_dir,
    get_fixture_samples, load_fixture_output, sample_name, svelte_path, write_actual_output,
};
use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

/// Grow-only fixture floor, measured against the pinned Svelte submodule: all
/// 29 sourcemap samples have comparable output. Never lower it.
const MIN_SOURCEMAP_FIXTURES: usize = 29;

/// Load input from Svelte test suite. Normalizes CRLF→LF so byte offsets
/// in the compiled output match LF-authored fixtures on Windows runners.
fn load_input(sample_name: &str) -> Option<String> {
    let input_path = svelte_path()
        .join("packages/svelte/tests/sourcemaps/samples")
        .join(sample_name)
        .join("input.svelte");

    fs::read_to_string(&input_path)
        .ok()
        .map(|s| s.replace("\r\n", "\n"))
}

/// `js.map` is already a JSON string; re-serializing it with `serde_json` would
/// wrap it in another layer of quotes and escapes. Pretty-print the parsed value
/// so the `_actual` artifacts are readable JSON.
fn pretty_map(map: &str) -> String {
    match serde_json::from_str::<serde_json::Value>(map) {
        Ok(value) => serde_json::to_string_pretty(&value).unwrap_or_else(|_| map.to_string()),
        Err(_) => map.to_string(),
    }
}

/// A sourcemap test fixture.
struct SourcemapFixture {
    name: String,
    input: String,
    expected_client_js: Option<String>,
    expected_server_js: Option<String>,
}

/// Load a sourcemap test fixture.
fn load_sourcemap_fixture(sample_dir: &Path) -> Result<SourcemapFixture, SkipReason> {
    let name = sample_dir
        .file_name()
        .and_then(|n| n.to_str())
        .ok_or(SkipReason::MissingInput("valid sample directory name"))?
        .to_string();

    let input = load_input(&name).ok_or(SkipReason::MissingInput("input.svelte"))?;
    let expected_client_js = load_fixture_output("sourcemaps", &name, "client.js");
    let expected_server_js = load_fixture_output("sourcemaps", &name, "server.js");

    // Neither output means the official compiler emitted no code for this sample.
    if expected_client_js.is_none() && expected_server_js.is_none() {
        return Err(SkipReason::Justified);
    }

    Ok(SourcemapFixture {
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
    client_js_passed: Option<bool>,
    server_js_passed: Option<bool>,
    error: Option<String>,
}

impl TestResult {
    fn passed(&self) -> bool {
        self.client_js_passed.unwrap_or(true) && self.server_js_passed.unwrap_or(true)
    }
}

/// Run a single sourcemap fixture test.
fn run_sourcemap_fixture_test(fixture: &SourcemapFixture) -> TestResult {
    let mut result = TestResult {
        name: fixture.name.clone(),
        client_js_passed: None,
        server_js_passed: None,
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
                    let map_json = pretty_map(map);
                    write_actual_output("sourcemaps", &fixture.name, "client.js.map", &map_json);
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
                    let map_json = pretty_map(map);
                    write_actual_output("sourcemaps", &fixture.name, "server.js.map", &map_json);
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
    use rayon::prelude::*;

    ensure_fixtures_exist();

    let samples = get_fixture_samples("sourcemaps");

    let mut coverage = FixtureCoverage::new(
        "sourcemaps",
        fixture_samples_dir("sourcemaps"),
        samples.len(),
    );
    let mut fixtures: Vec<SourcemapFixture> = Vec::new();
    for sample_dir in &samples {
        match load_sourcemap_fixture(sample_dir.as_path()) {
            Ok(fixture) => {
                coverage.ran();
                fixtures.push(fixture);
            }
            Err(reason) => coverage.skipped(sample_name(sample_dir), reason),
        }
    }
    coverage.assert(MIN_SOURCEMAP_FIXTURES);

    // Run tests in parallel for better performance
    let results: Vec<TestResult> = fixtures
        .par_iter()
        .map(run_sourcemap_fixture_test)
        .collect();

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
    println!("  Client JS:  {}/{}", client_js_passed, client_js_total);
    println!("  Server JS:  {}/{}", server_js_passed, server_js_total);
    println!("  Maps:       verified by tests/sourcemaps_gate.rs");

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
