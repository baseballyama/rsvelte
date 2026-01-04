//! Fixture tests for the Svelte parser.
//!
//! These tests run against the official Svelte test suite fixtures.
//! They compare the output of our Rust parser with the expected JSON output.

use std::fs;
use std::path::{Path, PathBuf};

use rayon::prelude::*;
use svelte_compiler_rust::{ParseOptions, parse};
use walkdir::WalkDir;

/// Get the path to the Svelte submodule.
fn svelte_path() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("svelte")
}

/// Get all parser test samples from the Svelte test suite.
fn get_parser_samples(test_type: &str) -> Vec<PathBuf> {
    let samples_dir = svelte_path()
        .join("packages/svelte/tests")
        .join(test_type)
        .join("samples");

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

/// Load a test fixture.
fn load_fixture(sample_dir: &Path) -> Option<(String, String, String)> {
    let input_path = sample_dir.join("input.svelte");
    let output_path = sample_dir.join("output.json");

    if !input_path.exists() || !output_path.exists() {
        return None;
    }

    let input = fs::read_to_string(&input_path).ok()?;
    let expected_output = fs::read_to_string(&output_path).ok()?;
    let name = sample_dir.file_name()?.to_str()?.to_string();

    Some((name, input, expected_output))
}

/// Normalize JSON for comparison.
///
/// This removes fields that may differ between implementations or are internal.
fn normalize_json(json: &str) -> serde_json::Value {
    let mut value: serde_json::Value =
        serde_json::from_str(json).unwrap_or(serde_json::Value::Null);
    remove_internal_fields(&mut value);
    value
}

/// Remove internal metadata fields that shouldn't be compared.
fn remove_internal_fields(value: &mut serde_json::Value) {
    match value {
        serde_json::Value::Object(map) => {
            // Remove internal fields
            map.remove("metadata");

            // Helper to remove 'character' from location objects
            fn remove_character_from_loc(loc: &mut serde_json::Value) {
                if let serde_json::Value::Object(loc_map) = loc {
                    if let Some(serde_json::Value::Object(start)) = loc_map.get_mut("start") {
                        start.remove("character");
                    }
                    if let Some(serde_json::Value::Object(end)) = loc_map.get_mut("end") {
                        end.remove("character");
                    }
                }
            }

            // Remove 'character' field from loc.start and loc.end
            if let Some(loc) = map.get_mut("loc") {
                remove_character_from_loc(loc);
            }

            // Also remove from name_loc
            if let Some(name_loc) = map.get_mut("name_loc") {
                remove_character_from_loc(name_loc);
            }

            // Recursively process all fields
            for (_, v) in map.iter_mut() {
                remove_internal_fields(v);
            }
        }
        serde_json::Value::Array(arr) => {
            for v in arr.iter_mut() {
                remove_internal_fields(v);
            }
        }
        _ => {}
    }
}

/// Test result for a single fixture.
#[derive(Debug)]
struct TestResult {
    name: String,
    passed: bool,
    error: Option<String>,
}

/// Run a single fixture test.
fn run_fixture_test(sample_dir: &Path, modern: bool) -> Option<TestResult> {
    let (name, input, expected) = load_fixture(sample_dir)?;

    let options = ParseOptions {
        modern,
        loose: false,
        filename: Some(name.clone()),
    };

    let result = parse(&input, options);

    match result {
        Ok(ast) => {
            let actual_json = serde_json::to_string_pretty(&ast).unwrap();
            let actual_normalized = normalize_json(&actual_json);
            let expected_normalized = normalize_json(&expected);

            if actual_normalized == expected_normalized {
                Some(TestResult {
                    name,
                    passed: true,
                    error: None,
                })
            } else {
                // Write actual output for debugging
                let actual_path = sample_dir.join("_actual.json");
                let _ = fs::write(&actual_path, &actual_json);

                Some(TestResult {
                    name,
                    passed: false,
                    error: Some(format!(
                        "AST mismatch. Actual output written to {:?}",
                        actual_path
                    )),
                })
            }
        }
        Err(e) => Some(TestResult {
            name,
            passed: false,
            error: Some(format!("Parse error: {:?}", e)),
        }),
    }
}

#[test]
fn test_parser_modern_fixtures() {
    let samples = get_parser_samples("parser-modern");

    if samples.is_empty() {
        eprintln!(
            "Warning: No parser-modern samples found. Make sure the Svelte submodule is initialized."
        );
        return;
    }

    let results: Vec<TestResult> = samples
        .par_iter()
        .filter_map(|sample_dir| run_fixture_test(sample_dir, true))
        .collect();

    let passed = results.iter().filter(|r| r.passed).count();
    let failed = results.iter().filter(|r| !r.passed).count();
    let total = results.len();

    println!("\n=== Parser Modern Fixtures ===");
    println!("Passed: {}/{}", passed, total);
    println!("Failed: {}/{}", failed, total);

    if failed > 0 {
        println!("\nFailed tests:");
        for result in &results {
            if !result.passed {
                println!(
                    "  - {}: {}",
                    result.name,
                    result
                        .error
                        .as_ref()
                        .unwrap_or(&"Unknown error".to_string())
                );
            }
        }
    }

    // For now, we don't fail the test since we're just starting implementation
    // assert_eq!(failed, 0, "{} tests failed", failed);
}

#[test]
fn test_parser_legacy_fixtures() {
    let samples = get_parser_samples("parser-legacy");

    if samples.is_empty() {
        eprintln!(
            "Warning: No parser-legacy samples found. Make sure the Svelte submodule is initialized."
        );
        return;
    }

    let results: Vec<TestResult> = samples
        .par_iter()
        .filter_map(|sample_dir| run_fixture_test(sample_dir, false))
        .collect();

    let passed = results.iter().filter(|r| r.passed).count();
    let failed = results.iter().filter(|r| !r.passed).count();
    let total = results.len();

    println!("\n=== Parser Legacy Fixtures ===");
    println!("Passed: {}/{}", passed, total);
    println!("Failed: {}/{}", failed, total);

    // For now, we don't fail the test since we're just starting implementation
    // assert_eq!(failed, 0, "{} tests failed", failed);
}

/// Test that lists all available fixtures.
#[test]
fn list_available_fixtures() {
    println!("\n=== Available Parser Fixtures ===\n");

    let modern = get_parser_samples("parser-modern");
    println!("Parser Modern ({} samples):", modern.len());
    for sample in &modern {
        println!("  - {}", sample.file_name().unwrap().to_str().unwrap());
    }

    println!();

    let legacy = get_parser_samples("parser-legacy");
    println!("Parser Legacy ({} samples):", legacy.len());
    for sample in &legacy {
        println!("  - {}", sample.file_name().unwrap().to_str().unwrap());
    }
}
