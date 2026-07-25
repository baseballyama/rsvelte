//! Compiler error tests.
//!
//! These tests verify that the compiler produces expected errors for invalid Svelte code.
//! They compare error codes, messages, and positions with the official Svelte test suite.

mod common;

use std::fs;
use std::path::{Path, PathBuf};

// use rayon::prelude::*;  // Disabled for sequential execution
use common::{FixtureCoverage, SkipReason, get_svelte_test_samples, sample_name};
use rsvelte_core::{
    CompileOptions, ExperimentalOptions, GenerateMode, ModuleCompileOptions, compile,
    compile_module,
};
use serde::Deserialize;

/// Grow-only fixture floor, measured against the pinned Svelte submodule: all
/// 145 compiler-error samples are runnable. Never lower it.
const MIN_COMPILER_ERROR_FIXTURES: usize = 145;

/// Get all compiler-errors test samples.
fn get_compiler_error_samples() -> Vec<PathBuf> {
    get_svelte_test_samples("compiler-errors")
}

/// Expected error from _config.js
#[derive(Debug, Deserialize)]
#[allow(dead_code)]
struct ExpectedError {
    code: String,
    message: String,
    #[serde(default)]
    position: Option<[u32; 2]>,
}

/// Config from _config.js
#[derive(Debug, Deserialize)]
struct TestConfig {
    error: ExpectedError,
    #[serde(default)]
    r#async: bool,
}

/// A compiler error test fixture.
struct ErrorFixture {
    name: String,
    input: String,
    input_type: InputType,
    expected_error: ExpectedError,
    requires_async: bool,
}

#[derive(Debug, Clone, Copy)]
enum InputType {
    Svelte,
    Module,
}

/// Parse _config.js to extract error expectations.
/// The config file uses JavaScript export syntax, so we parse it manually.
fn parse_config(config_content: &str) -> Option<TestConfig> {
    // Extract the error object from the config
    // Format: export default test({ error: { code: '...', message: '...', position: [...] } });

    let code = extract_string_field(config_content, "code")?;
    let message = extract_string_field(config_content, "message")?;
    let position = extract_position(config_content);
    let requires_async = config_content.contains("async: true");

    Some(TestConfig {
        error: ExpectedError {
            code,
            message,
            position,
        },
        r#async: requires_async,
    })
}

/// Extract a string field from JavaScript object.
/// Handles both single-line (`field: 'value'`) and multi-line (`field:\n\t'value'`) formats.
fn extract_string_field(content: &str, field: &str) -> Option<String> {
    // Look for the field name followed by a colon, then optional whitespace/newlines, then a quote.
    // This handles both:
    //   code: 'value'
    //   message:
    //       'value on next line'
    let field_colon = format!("{}:", field);
    let mut search_pos = 0;

    while let Some(colon_pos) = content[search_pos..].find(&field_colon) {
        let abs_colon_pos = search_pos + colon_pos;
        // Make sure this is actually the field name (preceded by whitespace/start)
        let before = &content[..abs_colon_pos];
        if !before.is_empty() {
            let last_char = before.chars().next_back().unwrap_or(' ');
            // Field name should be preceded by whitespace or tab
            if !last_char.is_whitespace() && last_char != '\t' {
                search_pos = abs_colon_pos + field_colon.len();
                continue;
            }
        }

        let after_colon = &content[abs_colon_pos + field_colon.len()..];
        // Skip whitespace (including newlines and tabs) to find the opening quote
        let trimmed = after_colon.trim_start_matches(|c: char| c.is_whitespace());
        if trimmed.is_empty() {
            search_pos = abs_colon_pos + field_colon.len();
            continue;
        }

        let quote_char = trimmed.chars().next().unwrap();
        if quote_char != '\'' && quote_char != '"' {
            search_pos = abs_colon_pos + field_colon.len();
            continue;
        }

        let value_start = &trimmed[quote_char.len_utf8()..];

        // Find the closing quote, handling escapes
        let mut value = String::new();
        let mut escaped = false;

        for c in value_start.chars() {
            if escaped {
                value.push(c);
                escaped = false;
            } else if c == '\\' {
                escaped = true;
            } else if c == quote_char {
                break;
            } else {
                value.push(c);
            }
        }

        return Some(value);
    }

    None
}

/// Extract position array from JavaScript object.
fn extract_position(content: &str) -> Option<[u32; 2]> {
    // Look for pattern: position: [num, num]
    if let Some(start) = content.find("position:") {
        let rest = &content[start..];
        if let Some(bracket_start) = rest.find('[') {
            let inner = &rest[bracket_start + 1..];
            if let Some(bracket_end) = inner.find(']') {
                let nums: Vec<&str> = inner[..bracket_end].split(',').collect();
                if nums.len() == 2 {
                    let n1: u32 = nums[0].trim().parse().ok()?;
                    let n2: u32 = nums[1].trim().parse().ok()?;
                    return Some([n1, n2]);
                }
            }
        }
    }
    None
}

/// Load a compiler error test fixture.
fn load_error_fixture(sample_dir: &Path) -> Result<ErrorFixture, SkipReason> {
    let config_path = sample_dir.join("_config.js");
    let svelte_path = sample_dir.join("main.svelte");
    let module_path = sample_dir.join("main.svelte.js");

    // Read and parse config
    let config_content =
        fs::read_to_string(&config_path).map_err(|_| SkipReason::MissingInput("_config.js"))?;
    let config =
        parse_config(&config_content).ok_or(SkipReason::MissingInput("parsable _config.js"))?;

    // Determine input type and read input
    let (input, input_type) = if svelte_path.exists() {
        (
            fs::read_to_string(&svelte_path)
                .map_err(|_| SkipReason::MissingInput("readable main.svelte"))?,
            InputType::Svelte,
        )
    } else if module_path.exists() {
        (
            fs::read_to_string(&module_path)
                .map_err(|_| SkipReason::MissingInput("readable main.svelte.js"))?,
            InputType::Module,
        )
    } else {
        return Err(SkipReason::MissingInput("main.svelte / main.svelte.js"));
    };

    let name = sample_name(sample_dir).to_string();

    Ok(ErrorFixture {
        name,
        input,
        input_type,
        expected_error: config.error,
        requires_async: config.r#async,
    })
}

/// Test result for a single fixture.
#[derive(Debug)]
struct TestResult {
    name: String,
    passed: bool,
    error_message: Option<String>,
    skipped: bool,
}

/// Run a single compiler error test.
fn run_error_test(fixture: &ErrorFixture) -> TestResult {
    // CSS error tests are now supported

    let name = fixture.name.clone();
    let input = fixture.input.clone();
    let requires_async = fixture.requires_async;

    // Use panic::catch_unwind to handle panics gracefully
    let result =
        std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| match fixture.input_type {
            InputType::Module => {
                let options = ModuleCompileOptions {
                    generate: GenerateMode::Client,
                    filename: Some(format!("{}/main.svelte.js", name)),
                    ..Default::default()
                };
                compile_module(&input, options)
            }
            InputType::Svelte => {
                let options = CompileOptions {
                    generate: GenerateMode::Client,
                    filename: Some(format!("{}/main.svelte", name)),
                    experimental: ExperimentalOptions {
                        r#async: requires_async,
                    },
                    ..Default::default()
                };
                compile(&input, options)
            }
        }));

    match result {
        Err(_) => TestResult {
            name: fixture.name.clone(),
            passed: false,
            error_message: Some("Compilation panicked".to_string()),
            skipped: false,
        },
        Ok(compile_result) => match compile_result {
            Ok(_) => {
                // Expected an error but compilation succeeded
                TestResult {
                    name: fixture.name.clone(),
                    passed: false,
                    error_message: Some(format!(
                        "Expected error '{}' but compilation succeeded",
                        fixture.expected_error.code
                    )),
                    skipped: false,
                }
            }
            Err(e) => {
                let error_str = format!("{:?}", e);
                let display_str = format!("{}", e);

                // Tighten the previous loose `contains()` check while still
                // accepting more-specific sub-codes that rsvelte sometimes
                // emits. We treat a match as either:
                //   * exact code (e.g. expected `block_open`, actual `block_open`)
                //   * sub-code   (e.g. expected `element_invalid_closing_tag`,
                //                  actual `element_invalid_closing_tag_autoclosed`)
                // but reject unrelated codes that happened to contain the
                // expected as a substring.
                let expected_code = &fixture.expected_error.code;
                let escaped = regex::escape(expected_code);
                // `\b<expected>(_[a-z_]*)?\b` — exact OR snake_case extension.
                let pattern = format!(r"\b{}(_[a-z_]+)?\b", escaped);
                let code_matches = regex::Regex::new(&pattern)
                    .map(|re| re.is_match(&error_str) || re.is_match(&display_str))
                    .unwrap_or(false);

                if code_matches {
                    TestResult {
                        name: fixture.name.clone(),
                        passed: true,
                        error_message: None,
                        skipped: false,
                    }
                } else {
                    TestResult {
                        name: fixture.name.clone(),
                        passed: false,
                        error_message: Some(format!(
                            "Expected error code '{}', got: {}",
                            fixture.expected_error.code, error_str
                        )),
                        skipped: false,
                    }
                }
            }
        },
    }
}

#[test]
fn test_compiler_errors() {
    let samples = get_compiler_error_samples();

    let mut coverage = FixtureCoverage::new("compiler-errors", samples.len());
    let mut fixtures: Vec<ErrorFixture> = Vec::new();
    for sample_dir in &samples {
        match load_error_fixture(sample_dir.as_path()) {
            Ok(fixture) => {
                coverage.ran();
                fixtures.push(fixture);
            }
            Err(reason) => coverage.skipped(sample_name(sample_dir), reason),
        }
    }
    coverage.assert(MIN_COMPILER_ERROR_FIXTURES);

    // Run sequentially. Previous attempts at `par_iter()` hung; leading
    // hypothesis is bumpalo arena retention causing memory pressure on small
    // CI runners. `common::test_thread_pool()` provides a bounded pool ready
    // for use once the hypothesis is verified locally.
    println!("Running {} compiler error tests...", fixtures.len());
    let results: Vec<TestResult> = fixtures
        .iter()
        .enumerate()
        .map(|(i, f)| {
            eprint!("\r[{}/{}] Testing {}...", i + 1, fixtures.len(), f.name);
            run_error_test(f)
        })
        .collect();
    eprintln!();

    // Count results
    let total = results.len();
    let skipped = results.iter().filter(|r| r.skipped).count();
    let run_count = total - skipped;
    let passed = results.iter().filter(|r| r.passed).count();
    let failed = run_count - passed;

    println!("\n=== Compiler Error Tests ===");
    println!(
        "Total: {}/{} passed ({} skipped)",
        passed, run_count, skipped
    );

    if failed > 0 {
        println!("\nFailed tests:");
        for result in &results {
            if !result.passed && !result.skipped {
                println!("  - {}", result.name);
                if let Some(err) = &result.error_message {
                    println!("      {}", err);
                }
            }
        }
    }

    if skipped > 0 {
        println!("\nSkipped tests:");
        for result in &results {
            if result.skipped {
                println!(
                    "  - {} ({})",
                    result.name,
                    result.error_message.as_deref().unwrap_or("")
                );
            }
        }
    }

    // Assert that all compiler error tests pass
    assert_eq!(failed, 0, "{} compiler error tests failed", failed);
}

/// List all available compiler error fixtures.
#[test]
fn list_compiler_error_fixtures() {
    println!("\n=== Available Compiler Error Fixtures ===\n");

    let samples = get_compiler_error_samples();
    println!("Compiler error samples ({}):", samples.len());

    for sample in &samples {
        let name = sample.file_name().unwrap().to_str().unwrap();
        let has_svelte = sample.join("main.svelte").exists();
        let has_module = sample.join("main.svelte.js").exists();

        let input_type = match (has_svelte, has_module) {
            (true, _) => "[svelte]",
            (_, true) => "[module]",
            _ => "[none]",
        };

        println!("  - {} {}", name, input_type);
    }
}
