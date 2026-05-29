//! Runtime fixture tests for the Svelte compiler.
//!
//! These tests verify compiler output for runtime test cases:
//! - hydration
//! - runtime-browser
//! - runtime-legacy
//! - runtime-runes
//!
//! Run `npm run generate-fixtures` to generate the expected outputs.

mod common;

use std::fs;
use std::path::Path;

use common::{
    compare_js_with_debug as compare_js_debug, ensure_fixtures_exist, get_fixture_samples,
    load_fixture_output, svelte_path, write_actual_output,
};
use svelte_compiler_rust::{
    CompileOptions, ExperimentalOptions, GenerateMode, compile, compiler::CssMode,
};

/// Load input from Svelte test suite.
fn load_input(category: &str, sample_name: &str) -> Option<String> {
    let input_path = svelte_path()
        .join("packages/svelte/tests")
        .join(category)
        .join("samples")
        .join(sample_name)
        .join("main.svelte");

    // Normalize CRLF→LF so byte offsets in compiled output match the
    // LF-authored expected fixtures regardless of how Git on Windows
    // (autocrlf=true) checked out the submodule.
    fs::read_to_string(&input_path)
        .ok()
        .map(|s| s.replace("\r\n", "\n"))
}

/// Check if a test requires unsupported compile options by reading _config.js
fn requires_unsupported_options(category: &str, sample_name: &str) -> bool {
    let config_path = svelte_path()
        .join("packages/svelte/tests")
        .join(category)
        .join("samples")
        .join(sample_name)
        .join("_config.js");

    if let Ok(config) = fs::read_to_string(&config_path) {
        {
            let config_without_skip = config
                .replace("skip_no_async", "")
                .replace("skip_async", "");
            if config_without_skip.contains("async: true") {
                return true;
            }
        }
        if config.contains("hmr: true") {
            return true;
        }
        if config.contains("compileOptions") && config.contains("preserveComments") {
            return true;
        }
    }
    false
}

/// Read the `accessors` setting from a test's _config.js.
///
/// The official Svelte test runner defaults to `accessors: true` for runtime-legacy tests
/// (see svelte/packages/svelte/tests/runtime-legacy/shared.ts line 224):
///   accessors: 'accessors' in config ? config.accessors : true
///
/// Returns `true` if `accessors` should be enabled (default true unless `accessors: false` in config).
fn get_accessors_option(category: &str, sample_name: &str) -> bool {
    if category != "runtime-legacy" {
        return false;
    }

    let config_path = svelte_path()
        .join("packages/svelte/tests")
        .join(category)
        .join("samples")
        .join(sample_name)
        .join("_config.js");

    if let Ok(config) = fs::read_to_string(&config_path) {
        // Check for explicit `accessors: false`
        if config.contains("accessors: false") || config.contains("accessors:false") {
            return false;
        }
    }
    // Default: true for runtime-legacy (matches official test runner behavior)
    true
}

/// A runtime test fixture.
struct RuntimeFixture {
    name: String,
    input: String,
    expected_client_js: Option<String>,
    expected_server_js: Option<String>,
    requires_unsupported_options: bool,
    /// Whether to use accessors=true in CompileOptions.
    /// Defaults to true for runtime-legacy (matches official test runner behavior).
    #[allow(dead_code)]
    accessors: bool,
}

/// Load a runtime test fixture from fixtures directory.
fn load_runtime_fixture(category: &str, sample_dir: &Path) -> Option<RuntimeFixture> {
    let name = sample_dir.file_name()?.to_str()?.to_string();

    let input = load_input(category, &name)?;

    let expected_client_js = load_fixture_output(category, &name, "client.js");
    let expected_server_js = load_fixture_output(category, &name, "server.js");

    if expected_client_js.is_none() && expected_server_js.is_none() {
        return None;
    }

    Some(RuntimeFixture {
        name: name.clone(),
        input,
        expected_client_js,
        expected_server_js,
        requires_unsupported_options: requires_unsupported_options(category, &name),
        accessors: get_accessors_option(category, &name),
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
    skipped: bool,
}

impl TestResult {
    fn passed(&self) -> bool {
        self.skipped || (self.client_passed.unwrap_or(true) && self.server_passed.unwrap_or(true))
    }
}

/// Check if actual output writing is enabled via environment variable.
fn should_write_actual_output() -> bool {
    std::env::var("WRITE_ACTUAL_OUTPUT").is_ok()
}

/// Fixtures that started failing on `main` after the Svelte submodule upgrades
/// in #322 / #335 and aren't tied to a particular ecosystem-ci change. Tracked
/// separately so the runtime suite stops blocking unrelated work; remove an
/// entry as soon as the upstream behaviour is matched.
const RUNTIME_RUNES_SKIP_NAMES: &[&str] = &[
    // async-overlap-multiple-5..7 still fail on the client side (the SSR
    // `$.save` predicate port (this PR) unblocked -1..4). -5..7 use
    // `let b = $derived(await delay(...))` in the instance script and hit a
    // separate async-blocker cluster.
    // Svelte 5.55.9 cluster (upstream `a5df6616e` "fix: avoid unnecessary
    // stringify in server attributes"). The `<div title=...>` snapshot path
    // is handled; the runes fixtures below also hit code paths that aren't
    // ported yet (attribute parts, async-await codegen). Mirrors the
    // entries in `tests/compatibility_report.rs`.
    //
    // `async-await` was unblocked by the 5.55.9 `000c594e0` `{#await await
    // ...}` async-batching port; the remaining two still fail on orthogonal
    // axes ($derived(await ...) → `(await $.save($.async_derived(...)))()`
    // lowering, etc.).
];

/// runtime-legacy fixtures still failing on the rsvelte port. Each cluster is
/// labelled with the upstream commit responsible. Remove an entry once the
/// underlying port lands.
const RUNTIME_LEGACY_SKIP_NAMES: &[&str] = &[];

/// hydration fixtures still failing. All HtmlTag is_controlled fixtures now pass
/// post-port (Svelte 5.53.8 upstream `0206a2019`).
const HYDRATION_SKIP_NAMES: &[&str] = &[];

/// Run a single runtime fixture test.
fn run_runtime_fixture_test(category: &str, fixture: &RuntimeFixture) -> TestResult {
    let mut result = TestResult {
        name: fixture.name.clone(),
        client_passed: None,
        server_passed: None,
        client_error: None,
        server_error: None,
        skipped: false,
    };

    if fixture.requires_unsupported_options {
        result.skipped = true;
        return result;
    }

    if category == "runtime-runes" && RUNTIME_RUNES_SKIP_NAMES.contains(&fixture.name.as_str()) {
        result.skipped = true;
        return result;
    }

    if category == "runtime-legacy" && RUNTIME_LEGACY_SKIP_NAMES.contains(&fixture.name.as_str()) {
        result.skipped = true;
        return result;
    }

    if category == "hydration" && HYDRATION_SKIP_NAMES.contains(&fixture.name.as_str()) {
        result.skipped = true;
        return result;
    }

    let write_output = should_write_actual_output();

    // Enable experimental.async for runtime-runes tests (matches fixture generation)
    let use_async = category == "runtime-runes";

    // Test client-side compilation
    if let Some(expected_client) = &fixture.expected_client_js {
        let client_options = CompileOptions {
            generate: GenerateMode::Client,
            filename: Some("main.svelte".to_string()),
            css: CssMode::External,
            experimental: ExperimentalOptions { r#async: use_async },
            accessors: fixture.accessors,
            ..Default::default()
        };

        match compile(&fixture.input, client_options) {
            Ok(compile_result) => {
                let passed =
                    compare_js_debug(&compile_result.js.code, expected_client, &fixture.name);

                if write_output {
                    write_actual_output(
                        category,
                        &fixture.name,
                        "client.js",
                        &compile_result.js.code,
                    );
                }

                if passed {
                    result.client_passed = Some(true);
                } else {
                    result.client_passed = Some(false);
                    result.client_error = Some("Client JS mismatch".to_string());
                }
            }
            Err(e) => {
                result.client_passed = Some(false);
                result.client_error = Some(format!("Client compilation error: {}", e));

                if write_output {
                    write_actual_output(
                        category,
                        &fixture.name,
                        "client_error.txt",
                        &format!("{:?}", e),
                    );
                }
            }
        }
    }

    // Test server-side compilation
    if let Some(expected_server) = &fixture.expected_server_js {
        let server_options = CompileOptions {
            generate: GenerateMode::Server,
            filename: Some("main.svelte".to_string()),
            css: CssMode::External,
            experimental: ExperimentalOptions { r#async: use_async },
            // Let runes mode be auto-detected from source (matches official compiler behavior)
            ..Default::default()
        };

        match compile(&fixture.input, server_options) {
            Ok(compile_result) => {
                let passed =
                    compare_js_debug(&compile_result.js.code, expected_server, &fixture.name);

                if write_output {
                    write_actual_output(
                        category,
                        &fixture.name,
                        "server.js",
                        &compile_result.js.code,
                    );
                }

                if passed {
                    result.server_passed = Some(true);
                } else {
                    result.server_passed = Some(false);
                    result.server_error = Some("Server JS mismatch".to_string());
                }
            }
            Err(e) => {
                result.server_passed = Some(false);
                result.server_error = Some(format!("Server compilation error: {}", e));

                if write_output {
                    write_actual_output(
                        category,
                        &fixture.name,
                        "server_error.txt",
                        &format!("{:?}", e),
                    );
                }
            }
        }
    }

    result
}

/// Run tests for a specific runtime category.
fn run_runtime_tests(category: &str) {
    use rayon::prelude::*;

    ensure_fixtures_exist();

    let samples = get_fixture_samples(category);

    if samples.is_empty() {
        println!("No {} fixtures found.", category);
        return;
    }

    // Limit parallelism to avoid memory explosion
    // (845 tests * many parallel threads can consume excessive memory)
    let pool = rayon::ThreadPoolBuilder::new()
        .num_threads(4)
        .build()
        .expect("Failed to build thread pool");

    // Load fixtures sequentially (fast, low memory)
    let fixtures: Vec<RuntimeFixture> = samples
        .iter()
        .filter_map(|sample_dir| load_runtime_fixture(category, sample_dir.as_path()))
        .collect();

    if fixtures.is_empty() {
        println!("No {} fixtures with expected output found.", category);
        return;
    }

    // Run tests with limited parallelism (4 threads max)
    let results: Vec<TestResult> = pool.install(|| {
        fixtures
            .par_iter()
            .map(|f| run_runtime_fixture_test(category, f))
            .collect()
    });

    let total = results.len();
    let skipped = results.iter().filter(|r| r.skipped).count();
    let run_count = total - skipped;
    let passed = results.iter().filter(|r| r.passed() && !r.skipped).count();
    let failed = run_count - passed;

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

    println!("\n=== {} Tests ===", category);
    println!(
        "Total: {}/{} passed ({} skipped)",
        passed, run_count, skipped
    );
    println!("  Client: {}/{}", client_passed, client_total);
    println!("  Server: {}/{}", server_passed, server_total);

    if failed > 0 {
        println!("\nFailed tests (ALL {}):", failed);
        for result in results.iter().filter(|r| !r.passed() && !r.skipped) {
            let client_status = match result.client_passed {
                Some(true) => "OK",
                Some(false) => {
                    if result
                        .client_error
                        .as_deref()
                        .unwrap_or("")
                        .contains("compilation error")
                    {
                        "COMPILE_ERROR"
                    } else {
                        "MISMATCH"
                    }
                }
                None => "N/A",
            };
            let server_status = match result.server_passed {
                Some(true) => "OK",
                Some(false) => {
                    if result
                        .server_error
                        .as_deref()
                        .unwrap_or("")
                        .contains("compilation error")
                    {
                        "COMPILE_ERROR"
                    } else {
                        "MISMATCH"
                    }
                }
                None => "N/A",
            };
            println!(
                "  FAIL|{}|client={}|server={}",
                result.name, client_status, server_status
            );
        }
    }

    assert_eq!(failed, 0, "{} {} tests failed", failed, category);
}

#[test]
fn test_hydration() {
    run_runtime_tests("hydration");
}

#[test]
fn test_runtime_browser() {
    run_runtime_tests("runtime-browser");
}

#[test]
fn test_runtime_legacy() {
    run_runtime_tests("runtime-legacy");
}

#[test]
fn test_runtime_runes() {
    run_runtime_tests("runtime-runes");
}

/// List all available runtime fixtures.
#[test]
fn list_runtime_fixtures() {
    ensure_fixtures_exist();

    for category in &[
        "hydration",
        "runtime-browser",
        "runtime-legacy",
        "runtime-runes",
    ] {
        let samples = get_fixture_samples(category);
        println!("\n=== {} Fixtures ({}) ===", category, samples.len());

        for sample in samples.iter().take(10) {
            let name = sample.file_name().unwrap().to_str().unwrap();
            let has_client = load_fixture_output(category, name, "client.js").is_some();
            let has_server = load_fixture_output(category, name, "server.js").is_some();

            let modes = match (has_client, has_server) {
                (true, true) => "[client, server]",
                (true, false) => "[client]",
                (false, true) => "[server]",
                (false, false) => "[none]",
            };

            println!("  - {} {}", name, modes);
        }

        if samples.len() > 10 {
            println!("  ... and {} more", samples.len() - 10);
        }
    }
}
