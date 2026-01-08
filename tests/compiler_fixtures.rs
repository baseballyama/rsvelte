//! Fixture tests for the Svelte compiler.
//!
//! These tests run against fixtures generated from the official Svelte compiler.
//! Run `npm run generate-fixtures` to generate the expected outputs.

mod common;

use std::fs;
use std::path::Path;

use common::{
    ensure_fixtures_exist, get_fixture_samples, load_fixture_output, svelte_path,
    write_actual_output,
};
use rayon::prelude::*;
use svelte_compiler_rust::{CompileOptions, GenerateMode, compile};

/// Load input from Svelte test suite.
fn load_input(sample_name: &str) -> Option<String> {
    let input_path = svelte_path()
        .join("packages/svelte/tests/snapshot/samples")
        .join(sample_name)
        .join("index.svelte");

    fs::read_to_string(&input_path).ok()
}

/// Check if a test requires unsupported compile options by reading _config.js
fn requires_unsupported_options(sample_name: &str) -> bool {
    let config_path = svelte_path()
        .join("packages/svelte/tests/snapshot/samples")
        .join(sample_name)
        .join("_config.js");

    if let Ok(config) = fs::read_to_string(&config_path) {
        // Check for unsupported options
        if config.contains("async: true") {
            return true; // experimental.async not supported
        }
        // hmr: true and fragments: are now supported (output matches expected)
    }
    false
}

/// A snapshot test fixture.
struct SnapshotFixture {
    name: String,
    input: String,
    expected_client_js: Option<String>,
    expected_server_js: Option<String>,
    /// Indicates if this test requires unsupported compile options
    requires_unsupported_options: bool,
}

/// Load a snapshot test fixture from fixtures directory.
fn load_snapshot_fixture(sample_dir: &Path) -> Option<SnapshotFixture> {
    let name = sample_dir.file_name()?.to_str()?.to_string();

    // Load input from Svelte test suite
    let input = load_input(&name)?;

    // Load expected outputs from fixtures
    let expected_client_js = load_fixture_output("snapshot", &name, "client.js");
    let expected_server_js = load_fixture_output("snapshot", &name, "server.js");

    // If neither expected output exists, skip this fixture
    if expected_client_js.is_none() && expected_server_js.is_none() {
        return None;
    }

    Some(SnapshotFixture {
        name: name.clone(),
        input,
        expected_client_js,
        expected_server_js,
        requires_unsupported_options: requires_unsupported_options(&name),
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
    /// Test was skipped due to unsupported compile options
    skipped: bool,
}

impl TestResult {
    fn passed(&self) -> bool {
        self.skipped || (self.client_passed.unwrap_or(true) && self.server_passed.unwrap_or(true))
    }
}

/// Normalize JavaScript code for comparison.
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
            // Add single space only if needed
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
        // Use "index.svelte" to match the filename used by Svelte fixture generator
        let client_options = CompileOptions {
            generate: GenerateMode::Client,
            filename: Some("index.svelte".to_string()),
            ..Default::default()
        };

        match compile(&fixture.input, client_options) {
            Ok(compile_result) => {
                // Always write actual output for comparison
                write_actual_output(
                    "snapshot",
                    &fixture.name,
                    "client.js",
                    &compile_result.js.code,
                );

                if compare_js(&compile_result.js.code, expected_client) {
                    result.client_passed = Some(true);
                } else {
                    result.client_passed = Some(false);
                    result.client_error = Some("Client JS mismatch".to_string());
                }
            }
            Err(e) => {
                result.client_passed = Some(false);
                result.client_error = Some(format!("Client compilation error: {}", e));
                write_actual_output(
                    "snapshot",
                    &fixture.name,
                    "client_error.txt",
                    &format!("{:?}", e),
                );
            }
        }
    }

    // Test server-side compilation
    if let Some(expected_server) = &fixture.expected_server_js {
        // Use "index.svelte" to match the filename used by Svelte fixture generator
        let server_options = CompileOptions {
            generate: GenerateMode::Server,
            filename: Some("index.svelte".to_string()),
            ..Default::default()
        };

        match compile(&fixture.input, server_options) {
            Ok(compile_result) => {
                // Always write actual output for comparison
                write_actual_output(
                    "snapshot",
                    &fixture.name,
                    "server.js",
                    &compile_result.js.code,
                );

                if compare_js(&compile_result.js.code, expected_server) {
                    result.server_passed = Some(true);
                } else {
                    result.server_passed = Some(false);
                    result.server_error = Some("Server JS mismatch".to_string());
                }
            }
            Err(e) => {
                result.server_passed = Some(false);
                result.server_error = Some(format!("Server compilation error: {}", e));
                write_actual_output(
                    "snapshot",
                    &fixture.name,
                    "server_error.txt",
                    &format!("{:?}", e),
                );
            }
        }
    }

    result
}

#[test]
fn test_compiler_snapshot_fixtures() {
    ensure_fixtures_exist();

    let samples = get_fixture_samples("snapshot");

    if samples.is_empty() {
        panic!("No snapshot fixtures found. Run `npm run generate-fixtures` first.");
    }

    let fixtures: Vec<SnapshotFixture> = samples
        .iter()
        .filter_map(|sample_dir| load_snapshot_fixture(sample_dir.as_path()))
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
    ensure_fixtures_exist();

    println!("\n=== Available Snapshot Fixtures ===\n");

    let samples = get_fixture_samples("snapshot");
    println!("Snapshot samples ({}):", samples.len());

    for sample in &samples {
        let name = sample.file_name().unwrap().to_str().unwrap();
        let has_client = load_fixture_output("snapshot", name, "client.js").is_some();
        let has_server = load_fixture_output("snapshot", name, "server.js").is_some();

        let modes = match (has_client, has_server) {
            (true, true) => "[client, server]",
            (true, false) => "[client]",
            (false, true) => "[server]",
            (false, false) => "[none]",
        };

        println!("  - {} {}", name, modes);
    }
}
