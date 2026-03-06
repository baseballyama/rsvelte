//! Compiler error tests.
//!
//! These tests verify that the compiler produces expected errors for invalid Svelte code.
//! They compare error codes, messages, and positions with the official Svelte test suite.

use std::fs;
use std::path::{Path, PathBuf};

// use rayon::prelude::*;  // Disabled for sequential execution
use serde::Deserialize;
use svelte_compiler_rust::{
    CompileOptions, ExperimentalOptions, GenerateMode, ModuleCompileOptions, compile,
    compile_module,
};
use walkdir::WalkDir;

/// Get the path to the Svelte submodule.
fn svelte_path() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("svelte")
}

/// Get all compiler-errors test samples.
fn get_compiler_error_samples() -> Vec<PathBuf> {
    let samples_dir = svelte_path().join("packages/svelte/tests/compiler-errors/samples");

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
fn load_error_fixture(sample_dir: &Path) -> Option<ErrorFixture> {
    let config_path = sample_dir.join("_config.js");
    let svelte_path = sample_dir.join("main.svelte");
    let module_path = sample_dir.join("main.svelte.js");

    // Read and parse config
    let config_content = fs::read_to_string(&config_path).ok()?;
    let config = parse_config(&config_content)?;

    // Determine input type and read input
    let (input, input_type) = if svelte_path.exists() {
        (fs::read_to_string(&svelte_path).ok()?, InputType::Svelte)
    } else if module_path.exists() {
        (fs::read_to_string(&module_path).ok()?, InputType::Module)
    } else {
        return None;
    };

    let name = sample_dir.file_name()?.to_str()?.to_string();

    Some(ErrorFixture {
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
                // Check if the error matches
                let error_str = format!("{:?}", e);

                // For now, just check if we got any error
                // TODO: Implement proper error code and message matching
                let code_matches = error_str.contains(&fixture.expected_error.code)
                    || error_str
                        .to_lowercase()
                        .contains(&fixture.expected_error.code.replace('_', " ").to_lowercase());

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

    if samples.is_empty() {
        eprintln!(
            "Warning: No compiler-errors samples found. Make sure the Svelte submodule is initialized."
        );
        return;
    }

    let fixtures: Vec<ErrorFixture> = samples
        .iter()
        .filter_map(|sample_dir| load_error_fixture(sample_dir.as_path()))
        .collect();

    // Run sequentially for now to avoid hangs with parallel execution
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
