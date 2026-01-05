//! Server-side rendering (SSR) compilation tests.
//!
//! These tests verify that the compiler can successfully compile Svelte components
//! in server mode. Note: Full SSR rendering tests require JavaScript runtime execution
//! and are not yet implemented.

use std::fs;
use std::path::{Path, PathBuf};

use svelte_compiler_rust::{CompileOptions, GenerateMode, compile};
use walkdir::WalkDir;

/// Get the path to the Svelte submodule.
fn svelte_path() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("svelte")
}

/// Get all SSR test samples.
fn get_ssr_samples() -> Vec<PathBuf> {
    let samples_dir = svelte_path().join("packages/svelte/tests/server-side-rendering/samples");

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

/// An SSR test fixture.
#[allow(dead_code)]
struct SsrFixture {
    name: String,
    input: String,
    expected_html: Option<String>, // For future HTML comparison
    requires_async: bool,
}

/// Load an SSR test fixture.
fn load_ssr_fixture(sample_dir: &Path) -> Option<SsrFixture> {
    let main_path = sample_dir.join("main.svelte");
    let expected_path = sample_dir.join("_expected.html");

    if !main_path.exists() {
        return None;
    }

    let input = fs::read_to_string(&main_path).ok()?;
    let expected_html = fs::read_to_string(&expected_path).ok();
    let name = sample_dir.file_name()?.to_str()?.to_string();

    // Check if this is an async test
    let requires_async = name.starts_with("async");

    Some(SsrFixture {
        name,
        input,
        expected_html,
        requires_async,
    })
}

/// Test result for a single fixture.
#[derive(Debug)]
#[allow(dead_code)]
struct TestResult {
    name: String,
    compiled: bool,
    error_message: Option<String>,
    skipped: bool,
    js_size: usize, // For future size comparison
}

/// Run a single SSR compilation test.
fn run_ssr_test(fixture: &SsrFixture) -> TestResult {
    // Skip async tests
    if fixture.requires_async {
        return TestResult {
            name: fixture.name.clone(),
            compiled: false,
            error_message: Some("Async SSR not supported".to_string()),
            skipped: true,
            js_size: 0,
        };
    }

    let name = fixture.name.clone();
    let input = fixture.input.clone();

    // Use panic::catch_unwind to handle panics gracefully
    let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        let options = CompileOptions {
            generate: GenerateMode::Server,
            filename: Some(format!("{}/main.svelte", name)),
            ..Default::default()
        };
        compile(&input, options)
    }));

    match result {
        Err(_) => TestResult {
            name: fixture.name.clone(),
            compiled: false,
            error_message: Some("Compilation panicked".to_string()),
            skipped: false,
            js_size: 0,
        },
        Ok(compile_result) => match compile_result {
            Ok(result) => TestResult {
                name: fixture.name.clone(),
                compiled: true,
                error_message: None,
                skipped: false,
                js_size: result.js.code.len(),
            },
            Err(e) => TestResult {
                name: fixture.name.clone(),
                compiled: false,
                error_message: Some(format!("Compilation error: {:?}", e)),
                skipped: false,
                js_size: 0,
            },
        },
    }
}

#[test]
fn test_ssr_compilation() {
    let samples = get_ssr_samples();

    if samples.is_empty() {
        eprintln!("Warning: No SSR samples found. Make sure the Svelte submodule is initialized.");
        return;
    }

    let fixtures: Vec<SsrFixture> = samples
        .iter()
        .filter_map(|sample_dir| load_ssr_fixture(sample_dir))
        .collect();

    // Run sequentially to avoid hangs
    println!("Running {} SSR compilation tests...", fixtures.len());
    let results: Vec<TestResult> = fixtures
        .iter()
        .enumerate()
        .map(|(i, f)| {
            eprint!("\r[{}/{}] Testing {}...", i + 1, fixtures.len(), f.name);
            run_ssr_test(f)
        })
        .collect();
    eprintln!();

    // Count results
    let total = results.len();
    let skipped = results.iter().filter(|r| r.skipped).count();
    let run_count = total - skipped;
    let compiled = results.iter().filter(|r| r.compiled).count();
    let failed = run_count - compiled;

    println!("\n=== SSR Compilation Tests ===");
    println!(
        "Total: {}/{} compiled successfully ({} skipped)",
        compiled, run_count, skipped
    );

    if failed > 0 {
        println!("\nFailed tests (first 20):");
        for result in results
            .iter()
            .filter(|r| !r.compiled && !r.skipped)
            .take(20)
        {
            println!("  - {}", result.name);
            if let Some(err) = &result.error_message {
                println!("      {}", err);
            }
        }
        if failed > 20 {
            println!("  ... and {} more", failed - 20);
        }
    }

    if skipped > 0 {
        println!("\nSkipped: {} tests (async SSR not supported)", skipped);
    }
}

/// List all available SSR fixtures.
#[test]
fn list_ssr_fixtures() {
    println!("\n=== Available SSR Fixtures ===\n");

    let samples = get_ssr_samples();
    println!("SSR samples ({}):", samples.len());

    let async_count = samples
        .iter()
        .filter(|s| {
            s.file_name()
                .unwrap()
                .to_str()
                .unwrap()
                .starts_with("async")
        })
        .count();

    println!("  Async tests: {}", async_count);
    println!("  Sync tests: {}", samples.len() - async_count);

    println!("\nFirst 20 samples:");
    for sample in samples.iter().take(20) {
        let name = sample.file_name().unwrap().to_str().unwrap();
        let has_expected = sample.join("_expected.html").exists();
        let has_config = sample.join("_config.js").exists();

        let markers = match (has_expected, has_config) {
            (true, true) => "[expected+config]",
            (true, false) => "[expected]",
            (false, true) => "[config]",
            (false, false) => "",
        };

        println!("  - {} {}", name, markers);
    }

    if samples.len() > 20 {
        println!("  ... and {} more", samples.len() - 20);
    }
}
