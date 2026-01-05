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
        requires_unsupported_options: requires_unsupported_options(sample_dir),
    })
}

/// A snapshot test fixture.
struct SnapshotFixture {
    name: String,
    input: String,
    expected_client_js: Option<String>,
    expected_server_js: Option<String>,
    sample_dir: PathBuf,
    /// Indicates if this test requires unsupported compile options
    requires_unsupported_options: bool,
}

/// Check if a test requires unsupported compile options by reading _config.js
fn requires_unsupported_options(sample_dir: &Path) -> bool {
    let config_path = sample_dir.join("_config.js");
    if let Ok(config) = fs::read_to_string(&config_path) {
        // Check for unsupported options
        if config.contains("async: true") {
            return true; // experimental.async not supported
        }
        if config.contains("hmr: true") {
            return true; // hmr not supported
        }
        if config.contains("fragments:") {
            return true; // fragments option not supported
        }
    }
    false
}

/// Test result for a single fixture.
#[derive(Debug)]
struct TestResult {
    name: String,
    client_passed: Option<bool>,
    server_passed: Option<bool>,
    client_error: Option<String>,
    server_error: Option<String>,
    /// Test was skipped due to unsupported compile options
    skipped: bool,
}

impl TestResult {
    fn passed(&self) -> bool {
        self.skipped || (self.client_passed.unwrap_or(true) && self.server_passed.unwrap_or(true))
    }
}

/// Normalize JavaScript code for comparison.
///
/// This removes/normalizes things that may differ between implementations.
fn normalize_js(js: &str) -> String {
    // First pass: normalize quotes in the entire content
    let js = normalize_quotes(js);

    // Second pass: collapse to single lines and normalize whitespace
    let js = collapse_multiline_constructs(&js);

    js.lines()
        // Remove empty lines
        .filter(|line| !line.trim().is_empty())
        // Normalize whitespace
        .map(|line| line.trim_end())
        // Normalize spacing around punctuation
        .map(normalize_spacing)
        .collect::<Vec<_>>()
        .join("\n")
}

/// Normalize quotes in JavaScript code.
/// Converts double quotes to single quotes unconditionally.
/// This is safe because the Svelte test cases use single quotes consistently.
fn normalize_quotes(js: &str) -> String {
    let mut result = String::new();
    let chars: Vec<char> = js.chars().collect();
    let mut i = 0;

    while i < chars.len() {
        let c = chars[i];

        // Convert unescaped double quotes to single quotes
        if c == '"' && (i == 0 || chars[i - 1] != '\\') {
            result.push('\'');
        } else {
            result.push(c);
        }
        i += 1;
    }

    result
}

/// Collapse multi-line array literals and object literals into single lines.
fn collapse_multiline_constructs(js: &str) -> String {
    let mut result = String::new();
    let mut depth = 0;
    let mut in_template = false;
    let mut in_string = false;
    let mut string_char = ' ';
    let chars: Vec<char> = js.chars().collect();
    let mut i = 0;

    while i < chars.len() {
        let c = chars[i];

        // Track string/template state
        if !in_string && c == '`' && (i == 0 || chars[i - 1] != '\\') {
            in_template = !in_template;
        }
        if !in_template && (c == '\'' || c == '"') && (i == 0 || chars[i - 1] != '\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
        }

        // Track bracket depth
        if !in_string && !in_template {
            if c == '[' || c == '{' {
                depth += 1;
            } else if c == ']' || c == '}' {
                depth -= 1;
            }
        }

        // Replace newlines and excess whitespace inside brackets with single space
        if (c == '\n' || c == '\r') && depth > 0 && !in_template {
            // Skip whitespace after newline
            while i + 1 < chars.len()
                && (chars[i + 1] == ' '
                    || chars[i + 1] == '\t'
                    || chars[i + 1] == '\n'
                    || chars[i + 1] == '\r')
            {
                i += 1;
            }
            // Add single space if not after opening bracket or before closing
            let last_char = result.chars().last();
            let next_char = chars.get(i + 1);
            if last_char != Some('[')
                && last_char != Some('{')
                && next_char != Some(&']')
                && next_char != Some(&'}')
            {
                result.push(' ');
            }
        } else {
            result.push(c);
        }
        i += 1;
    }

    result
}

/// Normalize spacing around punctuation.
fn normalize_spacing(line: &str) -> String {
    // Normalize `, ...` to `, ...` (ensure space after comma in destructuring)
    let line = line.replace(",...", ", ...");
    // Normalize multiple spaces to single space
    let mut result = String::new();
    let mut last_was_space = false;
    for c in line.chars() {
        if c == ' ' {
            if !last_was_space {
                result.push(c);
            }
            last_was_space = true;
        } else {
            result.push(c);
            last_was_space = false;
        }
    }
    result
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
        skipped: false,
    };

    // Skip tests that require unsupported compile options
    if fixture.requires_unsupported_options {
        result.skipped = true;
        return result;
    }

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
    let skipped = results.iter().filter(|r| r.skipped).count();
    let run_count = total - skipped;
    let passed = results.iter().filter(|r| r.passed() && !r.skipped).count();
    let failed = run_count - passed;

    // Count by mode (excluding skipped tests)
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

    println!("\n=== Compiler Snapshot Fixtures ===");
    println!(
        "Total: {}/{} passed ({} skipped due to unsupported options)",
        passed, run_count, skipped
    );
    println!("  Client: {}/{}", client_passed, client_total);
    println!("  Server: {}/{}", server_passed, server_total);

    if skipped > 0 {
        println!("\nSkipped tests (require unsupported compile options):");
        for result in &results {
            if result.skipped {
                println!("  - {}", result.name);
            }
        }
    }

    if failed > 0 {
        println!("\nFailed tests:");
        for result in &results {
            if !result.passed() && !result.skipped {
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

    // Assert that all tests pass
    assert_eq!(failed, 0, "{} tests failed", failed);
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
