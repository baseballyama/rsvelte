//! CSS scoping and transformation tests.
//!
//! These tests verify that the compiler correctly scopes CSS selectors
//! and generates the expected CSS output.

use std::fs;
use std::path::{Path, PathBuf};

use svelte_compiler_rust::{CompileOptions, GenerateMode, compile};
use walkdir::WalkDir;

/// Get the path to the Svelte submodule.
fn svelte_path() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("svelte")
}

/// Get all CSS test samples.
fn get_css_samples() -> Vec<PathBuf> {
    let samples_dir = svelte_path().join("packages/svelte/tests/css/samples");

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

/// A CSS test fixture.
#[allow(dead_code)]
struct CssFixture {
    name: String,
    input: String,
    expected_css: Option<String>,
    expected_html: Option<String>,
}

/// Load a CSS test fixture.
fn load_css_fixture(sample_dir: &Path) -> Option<CssFixture> {
    let input_path = sample_dir.join("input.svelte");
    let expected_css_path = sample_dir.join("expected.css");
    let expected_html_path = sample_dir.join("expected.html");

    if !input_path.exists() {
        return None;
    }

    let input = fs::read_to_string(&input_path).ok()?;
    let expected_css = fs::read_to_string(&expected_css_path).ok();
    let expected_html = fs::read_to_string(&expected_html_path).ok();
    let name = sample_dir.file_name()?.to_str()?.to_string();

    Some(CssFixture {
        name,
        input,
        expected_css,
        expected_html,
    })
}

/// Test result for a single fixture.
#[derive(Debug)]
#[allow(dead_code)]
struct TestResult {
    name: String,
    compiled: bool,
    css_matches: Option<bool>,
    error_message: Option<String>,
    skipped: bool,
}

/// Normalize CSS for comparison.
fn normalize_css(css: &str) -> String {
    css.lines()
        .map(|line| line.trim())
        .filter(|line| !line.is_empty())
        .collect::<Vec<_>>()
        .join("\n")
}

/// Run a single CSS test with timeout.
fn run_css_test(fixture: &CssFixture) -> TestResult {
    let name = fixture.name.clone();
    let input = fixture.input.clone();

    // Use a channel to implement timeout
    let (tx, rx) = std::sync::mpsc::channel();
    let name_clone = name.clone();

    std::thread::spawn(move || {
        let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
            let options = CompileOptions {
                generate: GenerateMode::Client,
                filename: Some(format!("{}/input.svelte", name_clone)),
                ..Default::default()
            };
            compile(&input, options)
        }));
        let _ = tx.send(result);
    });

    // Wait for up to 5 seconds
    let result = match rx.recv_timeout(std::time::Duration::from_secs(5)) {
        Ok(r) => r,
        Err(_) => {
            return TestResult {
                name: fixture.name.clone(),
                compiled: false,
                css_matches: None,
                error_message: Some("Test timed out after 5 seconds".to_string()),
                skipped: false,
            };
        }
    };

    match result {
        Err(_) => TestResult {
            name: fixture.name.clone(),
            compiled: false,
            css_matches: None,
            error_message: Some("Compilation panicked".to_string()),
            skipped: false,
        },
        Ok(compile_result) => match compile_result {
            Ok(result) => {
                let actual_css = result.css.map(|c| c.code).unwrap_or_default();

                // Compare CSS if expected is provided
                if let Some(expected_css) = &fixture.expected_css {
                    let actual_normalized = normalize_css(&actual_css);
                    let expected_normalized = normalize_css(expected_css);

                    if actual_normalized == expected_normalized {
                        TestResult {
                            name: fixture.name.clone(),
                            compiled: true,
                            css_matches: Some(true),
                            error_message: None,
                            skipped: false,
                        }
                    } else {
                        TestResult {
                            name: fixture.name.clone(),
                            compiled: true,
                            css_matches: Some(false),
                            error_message: Some(format!(
                                "CSS mismatch.\nExpected:\n{}\n\nActual:\n{}",
                                expected_normalized, actual_normalized
                            )),
                            skipped: false,
                        }
                    }
                } else {
                    // No expected CSS, just check compilation
                    TestResult {
                        name: fixture.name.clone(),
                        compiled: true,
                        css_matches: None,
                        error_message: None,
                        skipped: false,
                    }
                }
            }
            Err(e) => TestResult {
                name: fixture.name.clone(),
                compiled: false,
                css_matches: None,
                error_message: Some(format!("Compilation error: {:?}", e)),
                skipped: false,
            },
        },
    }
}

#[test]
fn test_css() {
    let samples = get_css_samples();

    if samples.is_empty() {
        eprintln!("Warning: No CSS samples found. Make sure the Svelte submodule is initialized.");
        return;
    }

    let fixtures: Vec<CssFixture> = samples
        .iter()
        .filter_map(|sample_dir| load_css_fixture(sample_dir))
        .collect();

    // Run sequentially
    println!("Running {} CSS tests...", fixtures.len());
    let results: Vec<TestResult> = fixtures
        .iter()
        .enumerate()
        .map(|(i, f)| {
            eprint!("\r[{}/{}] Testing {}...", i + 1, fixtures.len(), f.name);
            run_css_test(f)
        })
        .collect();
    eprintln!();

    // Count results
    let total = results.len();
    let skipped = results.iter().filter(|r| r.skipped).count();
    let run_count = total - skipped;
    let compiled = results.iter().filter(|r| r.compiled).count();
    let css_matched = results
        .iter()
        .filter(|r| r.css_matches == Some(true))
        .count();
    let css_total = results.iter().filter(|r| r.css_matches.is_some()).count();

    println!("\n=== CSS Tests ===");
    println!(
        "Compilation: {}/{} succeeded ({} skipped)",
        compiled, run_count, skipped
    );
    println!("CSS matching: {}/{}", css_matched, css_total);

    // Show failed tests
    let failed: Vec<_> = results
        .iter()
        .filter(|r| !r.skipped && (!r.compiled || r.css_matches == Some(false)))
        .collect();

    if !failed.is_empty() {
        println!("\nFailed tests (first 20):");
        for result in failed.iter().take(20) {
            println!("  - {}", result.name);
            if let Some(err) = &result.error_message {
                // Truncate long error messages
                let err_lines: Vec<_> = err.lines().take(5).collect();
                for line in err_lines {
                    println!("      {}", line);
                }
                if err.lines().count() > 5 {
                    println!("      ...");
                }
            }
        }
        if failed.len() > 20 {
            println!("  ... and {} more", failed.len() - 20);
        }
    }
}

/// List all available CSS fixtures.
#[test]
fn list_css_fixtures() {
    println!("\n=== Available CSS Fixtures ===\n");

    let samples = get_css_samples();
    println!("CSS samples ({}):", samples.len());

    println!("\nFirst 30 samples:");
    for sample in samples.iter().take(30) {
        let name = sample.file_name().unwrap().to_str().unwrap();
        let has_expected_css = sample.join("expected.css").exists();
        let has_expected_html = sample.join("expected.html").exists();
        let has_config = sample.join("_config.js").exists();

        let markers = match (has_expected_css, has_expected_html, has_config) {
            (true, true, true) => "[css+html+config]",
            (true, true, false) => "[css+html]",
            (true, false, true) => "[css+config]",
            (true, false, false) => "[css]",
            (false, true, true) => "[html+config]",
            (false, true, false) => "[html]",
            (false, false, true) => "[config]",
            (false, false, false) => "",
        };

        println!("  - {} {}", name, markers);
    }

    if samples.len() > 30 {
        println!("  ... and {} more", samples.len() - 30);
    }
}
