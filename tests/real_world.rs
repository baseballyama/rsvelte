//! Real-world fixture tests for the Svelte compiler.
//!
//! These tests compile real-world .svelte files from immich and gradio
//! with rsvelte and compare the output against the official Svelte compiler.
//!
//! To generate fixtures:
//!   node scripts/generate-real-world-fixtures.mjs
//!
//! To run:
//!   cargo test --release --test real_world

mod common;

use std::fs;
use std::path::{Path, PathBuf};

use common::canonicalize_js;
use serde::Deserialize;
use svelte_compiler_rust::{CompileOptions, GenerateMode, compile};

/// Fixture directory path.
fn fixtures_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("tests")
        .join("real_world")
        .join("fixtures")
}

/// Options loaded from options.json.
#[derive(Debug, Deserialize)]
#[allow(dead_code)]
struct FixtureOptions {
    filename: String,
    css: Option<String>,
    dev: Option<bool>,
    category: Option<String>,
}

/// A single real-world fixture.
struct RealWorldFixture {
    name: String,
    dir: PathBuf,
    input: String,
    options: FixtureOptions,
    expected_client: Option<String>,
    expected_server: Option<String>,
}

/// Test result for a single fixture.
#[derive(Debug)]
struct TestResult {
    name: String,
    category: String,
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

/// Discover all fixture directories.
fn discover_fixtures() -> Vec<PathBuf> {
    let dir = fixtures_dir();
    if !dir.exists() {
        return Vec::new();
    }

    let mut fixtures: Vec<PathBuf> = fs::read_dir(&dir)
        .expect("Failed to read fixtures directory")
        .filter_map(|e| e.ok())
        .filter(|e| e.file_type().map(|t| t.is_dir()).unwrap_or(false))
        .filter(|e| {
            e.file_name()
                .to_str()
                .map(|s| !s.starts_with('.') && !s.starts_with('_'))
                .unwrap_or(false)
        })
        .map(|e| e.path())
        .collect();

    fixtures.sort();
    fixtures
}

/// Load a fixture from its directory.
fn load_fixture(dir: &Path) -> Option<RealWorldFixture> {
    let name = dir.file_name()?.to_str()?.to_string();

    let input_path = dir.join("input.svelte");
    let options_path = dir.join("options.json");
    let client_path = dir.join("expected_client.js");
    let server_path = dir.join("expected_server.js");

    let input = fs::read_to_string(&input_path).ok()?;
    let options_str = fs::read_to_string(&options_path).ok()?;
    let options: FixtureOptions = serde_json::from_str(&options_str).ok()?;

    let expected_client = fs::read_to_string(&client_path).ok().and_then(|s| {
        if s.starts_with("// COMPILE ERROR") {
            None
        } else {
            Some(s)
        }
    });

    let expected_server = fs::read_to_string(&server_path).ok().and_then(|s| {
        if s.starts_with("// COMPILE ERROR") {
            None
        } else {
            Some(s)
        }
    });

    Some(RealWorldFixture {
        name,
        dir: dir.to_path_buf(),
        input,
        options,
        expected_client,
        expected_server,
    })
}

/// Find the first differing line between two strings (after canonicalization).
fn first_diff_line(actual: &str, expected: &str) -> Option<String> {
    let actual_lines: Vec<&str> = actual.lines().collect();
    let expected_lines: Vec<&str> = expected.lines().collect();

    for (i, (a, e)) in actual_lines.iter().zip(expected_lines.iter()).enumerate() {
        if a != e {
            return Some(format!(
                "Line {} differs:\n  expected: {}\n  actual:   {}",
                i + 1,
                e,
                a
            ));
        }
    }

    if actual_lines.len() != expected_lines.len() {
        return Some(format!(
            "Line count differs: expected {} lines, got {} lines",
            expected_lines.len(),
            actual_lines.len()
        ));
    }

    None
}

/// Run a single fixture test.
fn run_fixture(fixture: &RealWorldFixture) -> TestResult {
    let category = fixture
        .options
        .category
        .clone()
        .unwrap_or_else(|| "unknown".to_string());

    let mut result = TestResult {
        name: fixture.name.clone(),
        category,
        client_passed: None,
        server_passed: None,
        client_error: None,
        server_error: None,
    };

    // Test client-side compilation
    if let Some(expected_client) = &fixture.expected_client {
        let client_options = CompileOptions {
            generate: GenerateMode::Client,
            filename: Some(fixture.options.filename.clone()),
            dev: fixture.options.dev.unwrap_or(false),
            enable_sourcemap: false,
            ..Default::default()
        };

        match compile(&fixture.input, client_options) {
            Ok(compile_result) => {
                let canonical_actual = canonicalize_js(&compile_result.js.code);
                let canonical_expected = canonicalize_js(expected_client);

                if canonical_actual == canonical_expected {
                    result.client_passed = Some(true);
                } else {
                    result.client_passed = Some(false);
                    let diff = first_diff_line(&canonical_actual, &canonical_expected)
                        .unwrap_or_else(|| "Unknown diff".to_string());
                    result.client_error = Some(format!("Client JS mismatch:\n{}", diff));

                    // Write actual output for debugging
                    let _ = fs::write(
                        fixture.dir.join("_actual_client.js"),
                        &compile_result.js.code,
                    );
                }
            }
            Err(e) => {
                result.client_passed = Some(false);
                result.client_error = Some(format!("Client compilation error: {}", e));
                let _ = fs::write(
                    fixture.dir.join("_actual_client.js"),
                    format!("// COMPILE ERROR: {:?}", e),
                );
            }
        }
    }

    // Test server-side compilation
    if let Some(expected_server) = &fixture.expected_server {
        let server_options = CompileOptions {
            generate: GenerateMode::Server,
            filename: Some(fixture.options.filename.clone()),
            dev: fixture.options.dev.unwrap_or(false),
            enable_sourcemap: false,
            ..Default::default()
        };

        match compile(&fixture.input, server_options) {
            Ok(compile_result) => {
                let canonical_actual = canonicalize_js(&compile_result.js.code);
                let canonical_expected = canonicalize_js(expected_server);

                if canonical_actual == canonical_expected {
                    result.server_passed = Some(true);
                } else {
                    result.server_passed = Some(false);
                    let diff = first_diff_line(&canonical_actual, &canonical_expected)
                        .unwrap_or_else(|| "Unknown diff".to_string());
                    result.server_error = Some(format!("Server JS mismatch:\n{}", diff));

                    // Write actual output for debugging
                    let _ = fs::write(
                        fixture.dir.join("_actual_server.js"),
                        &compile_result.js.code,
                    );
                }
            }
            Err(e) => {
                result.server_passed = Some(false);
                result.server_error = Some(format!("Server compilation error: {}", e));
                let _ = fs::write(
                    fixture.dir.join("_actual_server.js"),
                    format!("// COMPILE ERROR: {:?}", e),
                );
            }
        }
    }

    result
}

#[test]
fn test_real_world_fixtures() {
    let fixture_dirs = discover_fixtures();

    if fixture_dirs.is_empty() {
        // The generator currently expects target repos at hardcoded paths
        // (`/workspace/.real-world-tests/...`), so this fixture set is opt-in
        // for now. Print a hint and exit cleanly rather than failing CI.
        eprintln!(
            "\n\
            Skipping test_real_world_fixtures: no fixtures found.\n\
            To enable: node scripts/generate-real-world-fixtures.mjs\n"
        );
        return;
    }

    // Load all fixtures
    let fixtures: Vec<RealWorldFixture> = fixture_dirs
        .iter()
        .filter_map(|dir| load_fixture(dir))
        .collect();

    println!("\n=== Real-World Fixture Tests ===");
    println!("Discovered {} fixtures\n", fixtures.len());

    // Run all fixtures
    let results: Vec<TestResult> = fixtures.iter().map(run_fixture).collect();

    // Report results
    let mut passed = 0;
    let mut failed = 0;
    let mut failed_names: Vec<String> = Vec::new();

    // Group by category
    let mut categories: std::collections::BTreeMap<String, (usize, usize)> =
        std::collections::BTreeMap::new();

    for result in &results {
        let entry = categories.entry(result.category.clone()).or_insert((0, 0));

        if result.passed() {
            passed += 1;
            entry.0 += 1;
        } else {
            failed += 1;
            entry.1 += 1;
            failed_names.push(result.name.clone());

            // Print failure details
            if let Some(err) = &result.client_error {
                eprintln!("FAIL [client] {}: {}", result.name, err);
            }
            if let Some(err) = &result.server_error {
                eprintln!("FAIL [server] {}: {}", result.name, err);
            }
        }
    }

    println!("\n=== Results by Category ===");
    for (cat, (p, f)) in &categories {
        let total = p + f;
        let status = if *f == 0 { "PASS" } else { "FAIL" };
        println!("  {}: {}/{} [{}]", cat, p, total, status);
    }

    let total = passed + failed;
    println!(
        "\n=== Overall: {}/{} passed ({:.1}%) ===\n",
        passed,
        total,
        if total > 0 {
            (passed as f64 / total as f64) * 100.0
        } else {
            0.0
        }
    );

    if !failed_names.is_empty() {
        println!("Failed fixtures:");
        for name in &failed_names {
            println!("  - {}", name);
        }
        println!();
    }

    assert_eq!(
        failed, 0,
        "{} out of {} real-world fixtures failed. See output above for details.",
        failed, total
    );
}
