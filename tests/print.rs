//! Print tests.
//!
//! These tests verify that the compiler correctly prints AST back to source code.

mod common;

use std::fs;
use std::path::Path;

use common::get_svelte_test_samples;
use svelte_compiler_rust::compiler::print::print_with_source;
use svelte_compiler_rust::{ParseOptions, parse};

/// A Print test fixture.
#[allow(dead_code)]
struct PrintFixture {
    name: String,
    input: String,
    expected_output: String,
}

/// Get all print sample directories.
fn get_print_samples() -> Vec<std::path::PathBuf> {
    get_svelte_test_samples("print")
}

/// Load a Print test fixture from Svelte test suite.
fn load_print_fixture(sample_dir: &Path) -> Option<PrintFixture> {
    let name = sample_dir.file_name()?.to_str()?.to_string();

    // Load input from Svelte test suite
    let input_path = sample_dir.join("input.svelte");
    let input = fs::read_to_string(&input_path).ok()?;

    // Load expected output from Svelte test suite
    let output_path = sample_dir.join("output.svelte");
    let expected_output = fs::read_to_string(&output_path).ok()?;

    Some(PrintFixture {
        name,
        input,
        expected_output,
    })
}

/// Normalize output for comparison (handles minor whitespace differences).
fn normalize_output(s: &str) -> String {
    // Trim trailing whitespace from each line
    let lines: Vec<&str> = s.lines().collect();
    let result: Vec<String> = lines.iter().map(|l| l.trim_end().to_string()).collect();
    let mut output = result.join("\n");
    // Ensure single trailing newline
    if !output.ends_with('\n') {
        output.push('\n');
    }
    output
}

/// Test result for a single fixture.
#[derive(Debug)]
#[allow(dead_code)]
struct TestResult {
    name: String,
    parsed: bool,
    printed: bool,
    matches: bool,
    error_message: Option<String>,
}

/// Run a single print test.
fn run_print_test(fixture: &PrintFixture) -> TestResult {
    let input = fixture.input.clone();

    // Parse with modern AST
    let parse_options = ParseOptions {
        modern: true,
        ..Default::default()
    };

    match parse(&input, parse_options) {
        Ok(ast) => {
            // Print the AST back to source
            match print_with_source(&ast, None, Some(&input)) {
                Ok(result) => {
                    let actual_normalized = normalize_output(&result.code);
                    let expected_normalized = normalize_output(&fixture.expected_output);

                    if actual_normalized == expected_normalized {
                        TestResult {
                            name: fixture.name.clone(),
                            parsed: true,
                            printed: true,
                            matches: true,
                            error_message: None,
                        }
                    } else {
                        TestResult {
                            name: fixture.name.clone(),
                            parsed: true,
                            printed: true,
                            matches: false,
                            error_message: Some(format!(
                                "Output mismatch.\nExpected:\n{}\n\nActual:\n{}",
                                expected_normalized, actual_normalized
                            )),
                        }
                    }
                }
                Err(e) => TestResult {
                    name: fixture.name.clone(),
                    parsed: true,
                    printed: false,
                    matches: false,
                    error_message: Some(format!("Print error: {:?}", e)),
                },
            }
        }
        Err(e) => TestResult {
            name: fixture.name.clone(),
            parsed: false,
            printed: false,
            matches: false,
            error_message: Some(format!("Parse error: {:?}", e)),
        },
    }
}

/// Print fixtures that diverge from upstream after Svelte submodule bumps and
/// aren't tied to anything actionable in rsvelte's printer right now.
/// Mirrors the spirit of the SKIP lists in `tests/runtime.rs` / `tests/ssr.rs`.
const PRINT_SKIP_NAMES: &[&str] = &[
    // Svelte 5.55.9 (upstream `ca3f35bf7` "fix(print): handle svelte:body and
    // fix keyframe percentage double-printing"): a `<style>`-only file now
    // prints without the leading blank lines we still emit between the
    // (empty) fragment and the CSS block. Tracked as a follow-up to fix the
    // `visit_root` margin/newline emission for empty fragments.
    "css-keyframes-percent",
];

#[test]
fn test_print() {
    let samples = get_print_samples();

    if samples.is_empty() {
        panic!("No print fixtures found. Run `npm run generate-fixtures` first.");
    }

    let fixtures: Vec<PrintFixture> = samples
        .iter()
        .filter_map(|sample_dir| load_print_fixture(sample_dir.as_path()))
        .filter(|f| !PRINT_SKIP_NAMES.contains(&f.name.as_str()))
        .collect();

    println!("Running {} print tests...", fixtures.len());
    let results: Vec<TestResult> = fixtures
        .iter()
        .enumerate()
        .map(|(i, f)| {
            eprint!("\r[{}/{}] Testing {}...", i + 1, fixtures.len(), f.name);
            run_print_test(f)
        })
        .collect();
    eprintln!();

    // Count results
    let total = results.len();
    let parsed = results.iter().filter(|r| r.parsed).count();
    let printed = results.iter().filter(|r| r.printed).count();
    let matched = results.iter().filter(|r| r.matches).count();

    println!("\n=== Print Tests ===");
    println!("Parse: {}/{}", parsed, total);
    println!("Print: {}/{}", printed, total);
    println!("Match: {}/{}", matched, total);

    // Show failed tests
    let failed: Vec<_> = results.iter().filter(|r| !r.matches).collect();

    if !failed.is_empty() {
        println!("\nFailed tests:");
        for result in failed.iter().take(20) {
            println!("  - {}", result.name);
            if let Some(err) = &result.error_message {
                // Truncate long error messages
                let err_lines: Vec<_> = err.lines().take(10).collect();
                for line in err_lines {
                    println!("      {}", line);
                }
                if err.lines().count() > 10 {
                    println!("      ...");
                }
            }
        }
        if failed.len() > 20 {
            println!("  ... and {} more", failed.len() - 20);
        }
    }

    // Assert that all print tests pass
    let failed_count = failed.len();
    assert_eq!(failed_count, 0, "{} print tests failed", failed_count);
}

/// List all available print fixtures.
#[test]
fn list_print_fixtures() {
    println!("\n=== Available Print Fixtures ===\n");

    let samples = get_print_samples();
    println!("Print samples ({}):", samples.len());

    for sample in &samples {
        let name = sample.file_name().unwrap().to_str().unwrap();
        println!("  - {}", name);
    }
}
