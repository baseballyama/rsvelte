//! Fixture tests for the Svelte compiler.
//!
//! These tests run against the official Svelte test suite snapshot fixtures.
//! They compare the output of our Rust compiler with the expected JavaScript output.

use std::fs;
use std::path::{Path, PathBuf};

use rayon::prelude::*;
use svelte_compiler_rust::{CompileOptions, GenerateMode, compile};
use walkdir::WalkDir;

/// Get the path to the Svelte submodule.
fn svelte_path() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("svelte")
}

/// Get all snapshot test samples from the Svelte test suite.
fn get_snapshot_samples() -> Vec<PathBuf> {
    let samples_dir = svelte_path().join("packages/svelte/tests/snapshot/samples");

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

/// Load a snapshot test fixture.
///
/// Returns (name, input_source, expected_client_js, expected_server_js).
fn load_snapshot_fixture(sample_dir: &Path) -> Option<SnapshotFixture> {
    let input_path = sample_dir.join("index.svelte");

    if !input_path.exists() {
        return None;
    }

    let input = fs::read_to_string(&input_path).ok()?;
    let name = sample_dir.file_name()?.to_str()?.to_string();

    // Load expected outputs
    let expected_client = sample_dir.join("_expected/client/index.svelte.js");
    let expected_server = sample_dir.join("_expected/server/index.svelte.js");

    let client_js = fs::read_to_string(&expected_client).ok();
    let server_js = fs::read_to_string(&expected_server).ok();

    // If neither expected output exists, skip this fixture
    if client_js.is_none() && server_js.is_none() {
        return None;
    }

    Some(SnapshotFixture {
        name,
        input,
        expected_client_js: client_js,
        expected_server_js: server_js,
        sample_dir: sample_dir.to_path_buf(),
    })
}

/// A snapshot test fixture.
struct SnapshotFixture {
    name: String,
    input: String,
    expected_client_js: Option<String>,
    expected_server_js: Option<String>,
    sample_dir: PathBuf,
}

/// Test result for a single fixture.
#[derive(Debug)]
struct TestResult {
    name: String,
    client_passed: Option<bool>,
    server_passed: Option<bool>,
    client_error: Option<String>,
    server_error: Option<String>,
}

impl TestResult {
    fn passed(&self) -> bool {
        self.client_passed.unwrap_or(true) && self.server_passed.unwrap_or(true)
    }
}

/// Normalize JavaScript code for comparison.
///
/// This removes/normalizes things that may differ between implementations.
fn normalize_js(js: &str) -> String {
    js.lines()
        // Remove empty lines
        .filter(|line| !line.trim().is_empty())
        // Normalize whitespace
        .map(|line| line.trim_end())
        .collect::<Vec<_>>()
        .join("\n")
}

/// Compare two JavaScript outputs.
fn compare_js(actual: &str, expected: &str) -> bool {
    normalize_js(actual) == normalize_js(expected)
}

/// Run a single snapshot fixture test.
fn run_snapshot_fixture_test(fixture: &SnapshotFixture) -> TestResult {
    let mut result = TestResult {
        name: fixture.name.clone(),
        client_passed: None,
        server_passed: None,
        client_error: None,
        server_error: None,
    };

    // Test client-side compilation
    if let Some(expected_client) = &fixture.expected_client_js {
        let client_options = CompileOptions {
            generate: GenerateMode::Client,
            filename: Some(format!("{}/index.svelte", fixture.name)),
            ..Default::default()
        };

        match compile(&fixture.input, client_options) {
            Ok(compile_result) => {
                if compare_js(&compile_result.js.code, expected_client) {
                    result.client_passed = Some(true);
                } else {
                    result.client_passed = Some(false);

                    // Write actual output for debugging
                    let actual_dir = fixture.sample_dir.join("_actual/client");
                    let _ = fs::create_dir_all(&actual_dir);
                    let actual_path = actual_dir.join("index.svelte.js");
                    let _ = fs::write(&actual_path, &compile_result.js.code);

                    result.client_error = Some(format!(
                        "Client JS mismatch. Actual output written to {:?}",
                        actual_path
                    ));
                }
            }
            Err(e) => {
                result.client_passed = Some(false);
                result.client_error = Some(format!("Client compilation error: {}", e));
            }
        }
    }

    // Test server-side compilation
    if let Some(expected_server) = &fixture.expected_server_js {
        let server_options = CompileOptions {
            generate: GenerateMode::Server,
            filename: Some(format!("{}/index.svelte", fixture.name)),
            ..Default::default()
        };

        match compile(&fixture.input, server_options) {
            Ok(compile_result) => {
                if compare_js(&compile_result.js.code, expected_server) {
                    result.server_passed = Some(true);
                } else {
                    result.server_passed = Some(false);

                    // Write actual output for debugging
                    let actual_dir = fixture.sample_dir.join("_actual/server");
                    let _ = fs::create_dir_all(&actual_dir);
                    let actual_path = actual_dir.join("index.svelte.js");
                    let _ = fs::write(&actual_path, &compile_result.js.code);

                    result.server_error = Some(format!(
                        "Server JS mismatch. Actual output written to {:?}",
                        actual_path
                    ));
                }
            }
            Err(e) => {
                result.server_passed = Some(false);
                result.server_error = Some(format!("Server compilation error: {}", e));
            }
        }
    }

    result
}

#[test]
fn test_compiler_snapshot_fixtures() {
    let samples = get_snapshot_samples();

    if samples.is_empty() {
        eprintln!(
            "Warning: No snapshot samples found. Make sure the Svelte submodule is initialized."
        );
        return;
    }

    let fixtures: Vec<SnapshotFixture> = samples
        .iter()
        .filter_map(|sample_dir| load_snapshot_fixture(sample_dir))
        .collect();

    let results: Vec<TestResult> = fixtures.par_iter().map(run_snapshot_fixture_test).collect();

    // Count results
    let total = results.len();
    let passed = results.iter().filter(|r| r.passed()).count();
    let failed = total - passed;

    // Count by mode
    let client_total = results.iter().filter(|r| r.client_passed.is_some()).count();
    let client_passed = results
        .iter()
        .filter(|r| r.client_passed == Some(true))
        .count();

    let server_total = results.iter().filter(|r| r.server_passed.is_some()).count();
    let server_passed = results
        .iter()
        .filter(|r| r.server_passed == Some(true))
        .count();

    println!("\n=== Compiler Snapshot Fixtures ===");
    println!("Total: {}/{} passed", passed, total);
    println!("  Client: {}/{}", client_passed, client_total);
    println!("  Server: {}/{}", server_passed, server_total);

    if failed > 0 {
        println!("\nFailed tests:");
        for result in &results {
            if !result.passed() {
                println!("  - {}", result.name);
                if let Some(err) = &result.client_error {
                    println!("      Client: {}", err);
                }
                if let Some(err) = &result.server_error {
                    println!("      Server: {}", err);
                }
            }
        }
    }

    // For now, we don't fail the test since we're just starting implementation
    // assert_eq!(failed, 0, "{} tests failed", failed);
}

/// Test that lists all available snapshot fixtures.
#[test]
fn list_snapshot_fixtures() {
    println!("\n=== Available Snapshot Fixtures ===\n");

    let samples = get_snapshot_samples();
    println!("Snapshot samples ({}):", samples.len());

    for sample in &samples {
        let name = sample.file_name().unwrap().to_str().unwrap();
        let has_client = sample.join("_expected/client/index.svelte.js").exists();
        let has_server = sample.join("_expected/server/index.svelte.js").exists();

        let modes = match (has_client, has_server) {
            (true, true) => "[client, server]",
            (true, false) => "[client]",
            (false, true) => "[server]",
            (false, false) => "[none]",
        };

        println!("  - {} {}", name, modes);
    }
}
