//! Fixture tests for the Svelte compiler.
//!
//! These tests run against fixtures generated from the official Svelte compiler.
//! Run `npm run generate-fixtures` to generate the expected outputs.

mod common;

use std::fs;
use std::path::Path;

use common::{
    compare_js, ensure_fixtures_exist, get_fixture_samples, load_fixture_output, svelte_path,
    write_actual_output,
};
use rayon::prelude::*;
use svelte_compiler_rust::{CompileOptions, ExperimentalOptions, GenerateMode, compile};

/// Load input from Svelte test suite.
fn load_input(sample_name: &str) -> Option<String> {
    let input_path = svelte_path()
        .join("packages/svelte/tests/snapshot/samples")
        .join(sample_name)
        .join("index.svelte");

    fs::read_to_string(&input_path).ok()
}

/// Check if a test requires unsupported compile options by reading _config.js
fn requires_unsupported_options(_sample_name: &str) -> bool {
    // All options are now supported (async, hmr, fragments)
    false
}

/// Check if a test requires experimental.async by reading _config.js
fn requires_async(sample_name: &str) -> bool {
    let config_path = svelte_path()
        .join("packages/svelte/tests/snapshot/samples")
        .join(sample_name)
        .join("_config.js");

    if let Ok(config) = fs::read_to_string(&config_path) {
        return config.contains("async: true");
    }
    false
}

/// Check if a test requires HMR by reading _config.js. The fixture generator
/// propagates `compileOptions.hmr` to the official compiler, so the test
/// runner must mirror it or the regenerated fixture diffs against our output.
fn requires_hmr(sample_name: &str) -> bool {
    let config_path = svelte_path()
        .join("packages/svelte/tests/snapshot/samples")
        .join(sample_name)
        .join("_config.js");

    if let Ok(config) = fs::read_to_string(&config_path) {
        return config.contains("hmr: true");
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
    /// Indicates if this test requires experimental.async
    requires_async: bool,
    /// Indicates if this test requires HMR mode (matches the fixture generator's propagation)
    requires_hmr: bool,
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
        requires_async: requires_async(&name),
        requires_hmr: requires_hmr(&name),
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
        // Use "{sample_name}/index.svelte" to match the filename used by Svelte fixture generator
        // This is required for correct component naming (e.g., "Bind_component_snippet" instead of "Index")
        let client_options = CompileOptions {
            generate: GenerateMode::Client,
            filename: Some(format!("{}/index.svelte", fixture.name)),
            experimental: ExperimentalOptions {
                r#async: fixture.requires_async,
            },
            hmr: fixture.requires_hmr,
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
        // Use "{sample_name}/index.svelte" to match the filename used by Svelte fixture generator
        // This is required for correct component naming (e.g., "Bind_component_snippet" instead of "Index")
        let server_options = CompileOptions {
            generate: GenerateMode::Server,
            filename: Some(format!("{}/index.svelte", fixture.name)),
            experimental: ExperimentalOptions {
                r#async: fixture.requires_async,
            },
            hmr: fixture.requires_hmr,
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

/// Test that compiled output has real tab characters, not literal \t.
#[test]
fn test_compile_output_has_real_tabs() {
    // Use the actual skip-static-subtree input
    let input_path = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("svelte/packages/svelte/tests/snapshot/samples/skip-static-subtree/index.svelte");
    let input = std::fs::read_to_string(&input_path).expect("Failed to read input file");
    println!("Input path: {:?}", input_path);
    println!("Input length: {}", input.len());

    let options = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some("test/index.svelte".to_string()),
        ..Default::default()
    };

    let result = compile(&input, options).expect("compilation should succeed");
    let code = &result.js.code;

    // Check for tabs
    let has_real_tab = code.chars().any(|c| c == '\t');
    let has_literal_backslash_t = code.contains(r"\t");

    println!("Generated code:\n{}", code);
    println!("\nHas real tab: {}", has_real_tab);
    println!("Has literal backslash-t: {}", has_literal_backslash_t);

    // Print character codes around the function body
    if let Some(pos) = code.find("$$props) {") {
        let after_brace = &code[pos + "$$props) {".len()..];
        println!("\nFirst 20 chars after function brace:");
        for (i, c) in after_brace.chars().take(20).enumerate() {
            println!("  char[{}]: {:?} (0x{:x})", i, c, c as u32);
        }
    }

    assert!(
        has_real_tab,
        "Compiled output should contain real tab characters (0x09)"
    );
    assert!(
        !has_literal_backslash_t,
        "Compiled output should not contain literal \\t"
    );
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
