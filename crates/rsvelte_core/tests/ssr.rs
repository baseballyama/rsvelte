//! Server-side rendering fixture tests for the Svelte compiler.
//!
//! These tests verify server-side compilation output against fixtures.
//! Run `npm run generate-fixtures` to generate the expected outputs.

mod common;

use std::fs;
use std::path::Path;

use common::{
    FixtureCoverage, SkipReason, compare_js, ensure_fixtures_exist, get_fixture_samples,
    load_fixture_output, sample_name, svelte_path, write_actual_output,
};
use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

/// Grow-only fixture floor, measured against the pinned Svelte submodule.
/// 126 samples are generated; 27 of them hold only an `error.json` because the
/// official compiler errors on them, leaving 99 with comparable server output.
const MIN_SSR_FIXTURES: usize = 99;

/// Load input from Svelte test suite. Normalizes CRLF→LF so byte offsets
/// in the compiled output match LF-authored fixtures on Windows runners.
fn load_input(sample_name: &str) -> Option<String> {
    let input_path = svelte_path()
        .join("packages/svelte/tests/server-side-rendering/samples")
        .join(sample_name)
        .join("main.svelte");

    fs::read_to_string(&input_path)
        .ok()
        .map(|s| s.replace("\r\n", "\n"))
}

/// Check if a test requires unsupported compile options.
fn requires_unsupported_options(sample_name: &str) -> bool {
    let config_path = svelte_path()
        .join("packages/svelte/tests/server-side-rendering/samples")
        .join(sample_name)
        .join("_config.js");

    if let Ok(config) = fs::read_to_string(&config_path)
        && config.contains("async: true")
    {
        return true;
    }
    false
}

/// An SSR test fixture.
struct SsrFixture {
    name: String,
    input: String,
    expected_server_js: Option<String>,
    requires_unsupported_options: bool,
}

/// Load an SSR test fixture.
fn load_ssr_fixture(sample_dir: &Path) -> Result<SsrFixture, SkipReason> {
    let name = sample_dir
        .file_name()
        .and_then(|n| n.to_str())
        .ok_or(SkipReason::MissingInput("valid sample directory name"))?
        .to_string();

    let input = load_input(&name).ok_or(SkipReason::MissingInput("main.svelte"))?;

    // No `server.js` means the official compiler errored on this sample and
    // the fixture holds only `error.json` — nothing to compare.
    let expected_server_js = load_fixture_output("server-side-rendering", &name, "server.js")
        .ok_or(SkipReason::Justified)?;

    Ok(SsrFixture {
        name: name.clone(),
        input,
        expected_server_js: Some(expected_server_js),
        requires_unsupported_options: requires_unsupported_options(&name),
    })
}

/// Test result for a single fixture.
#[derive(Debug)]
struct TestResult {
    name: String,
    passed: Option<bool>,
    error: Option<String>,
    skipped: bool,
}

/// Fixtures whose expected SSR output exercises infrastructure rsvelte doesn't
/// yet implement. Mirrors the corresponding entries in `tests/compatibility_report.rs`
/// so `test_ssr` stops blocking unrelated work; remove an entry as soon as the
/// upstream behaviour is matched.
const SSR_SKIP_NAMES: &[&str] = &[];

/// Run a single SSR fixture test.
fn run_ssr_fixture_test(fixture: &SsrFixture) -> TestResult {
    if fixture.requires_unsupported_options {
        return TestResult {
            name: fixture.name.clone(),
            passed: None,
            error: None,
            skipped: true,
        };
    }

    if SSR_SKIP_NAMES.contains(&fixture.name.as_str()) {
        return TestResult {
            name: fixture.name.clone(),
            passed: None,
            error: None,
            skipped: true,
        };
    }

    let options = CompileOptions {
        generate: GenerateMode::Server,
        filename: Some("main.svelte".to_string()),
        css: CssMode::External,
        ..Default::default()
    };

    match compile(&fixture.input, options) {
        Ok(compile_result) => {
            write_actual_output(
                "server-side-rendering",
                &fixture.name,
                "server.js",
                &compile_result.js.code,
            );

            if let Some(expected) = &fixture.expected_server_js {
                if compare_js(&compile_result.js.code, expected) {
                    TestResult {
                        name: fixture.name.clone(),
                        passed: Some(true),
                        error: None,
                        skipped: false,
                    }
                } else {
                    TestResult {
                        name: fixture.name.clone(),
                        passed: Some(false),
                        error: Some("Server JS mismatch".to_string()),
                        skipped: false,
                    }
                }
            } else {
                TestResult {
                    name: fixture.name.clone(),
                    passed: Some(true),
                    error: None,
                    skipped: false,
                }
            }
        }
        Err(e) => {
            write_actual_output(
                "server-side-rendering",
                &fixture.name,
                "server_error.txt",
                &format!("{:?}", e),
            );

            TestResult {
                name: fixture.name.clone(),
                passed: Some(false),
                error: Some(format!("Compilation error: {}", e)),
                skipped: false,
            }
        }
    }
}

#[test]
fn test_ssr() {
    use rayon::prelude::*;

    ensure_fixtures_exist();

    let samples = get_fixture_samples("server-side-rendering");

    let mut coverage = FixtureCoverage::new("server-side-rendering", samples.len());
    let mut fixtures: Vec<SsrFixture> = Vec::new();
    for sample_dir in &samples {
        match load_ssr_fixture(sample_dir.as_path()) {
            Ok(fixture) => {
                coverage.ran();
                fixtures.push(fixture);
            }
            Err(reason) => coverage.skipped(sample_name(sample_dir), reason),
        }
    }
    coverage.assert(MIN_SSR_FIXTURES);

    // Run tests in parallel for better performance
    let results: Vec<TestResult> = fixtures.par_iter().map(run_ssr_fixture_test).collect();

    let total = results.len();
    let skipped = results.iter().filter(|r| r.skipped).count();
    let run_count = total - skipped;
    let passed = results
        .iter()
        .filter(|r| !r.skipped && r.passed == Some(true))
        .count();
    let failed = run_count - passed;

    println!("\n=== SSR Tests ===");
    println!(
        "Total: {}/{} passed ({} skipped)",
        passed, run_count, skipped
    );

    if failed > 0 {
        println!("\nFailed tests:");
        for result in results
            .iter()
            .filter(|r| !r.skipped && r.passed != Some(true))
        {
            println!("  - {}", result.name);
            if let Some(err) = &result.error {
                println!("      {}", err);
            }
        }
    }

    assert_eq!(failed, 0, "{} SSR tests failed", failed);
}

/// List all available SSR fixtures.
#[test]
fn list_ssr_fixtures() {
    ensure_fixtures_exist();

    let samples = get_fixture_samples("server-side-rendering");
    println!("\n=== SSR Fixtures ({}) ===", samples.len());

    for sample in samples.iter().take(20) {
        let name = sample.file_name().unwrap().to_str().unwrap();
        let has_server = load_fixture_output("server-side-rendering", name, "server.js").is_some();
        let has_error = load_fixture_output("server-side-rendering", name, "error.json").is_some();

        let markers = match (has_server, has_error) {
            (true, false) => "[server]",
            (false, true) => "[error]",
            (true, true) => "[server+error]",
            (false, false) => "[none]",
        };

        println!("  - {} {}", name, markers);
    }

    if samples.len() > 20 {
        println!("  ... and {} more", samples.len() - 20);
    }
}
