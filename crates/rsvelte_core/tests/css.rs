//! CSS scoping and transformation tests.
//!
//! These tests verify that the compiler correctly scopes CSS selectors
//! and generates the expected CSS output.
//!
//! Run `npm run generate-fixtures` to generate the expected outputs.

mod common;

use std::fs;
use std::path::Path;

use common::{
    canonicalize_css, ensure_fixtures_exist, get_fixture_samples, load_fixture_output, svelte_path,
    write_actual_output,
};
use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

/// Load input from Svelte test suite. Normalizes CRLF→LF so byte offsets
/// in the compiled output match LF-authored fixtures on Windows runners.
fn load_input(sample_name: &str) -> Option<String> {
    let input_path = svelte_path()
        .join("packages/svelte/tests/css/samples")
        .join(sample_name)
        .join("input.svelte");

    fs::read_to_string(&input_path)
        .ok()
        .map(|s| s.replace("\r\n", "\n"))
}

/// A CSS test fixture.
#[allow(dead_code)]
struct CssFixture {
    name: String,
    input: String,
    expected_css: Option<String>,
}

/// Load a CSS test fixture from fixtures directory.
fn load_css_fixture(sample_dir: &Path) -> Option<CssFixture> {
    let name = sample_dir.file_name()?.to_str()?.to_string();

    // Load input from Svelte test suite
    let input = load_input(&name)?;

    // Load expected CSS from fixtures
    let expected_css = load_fixture_output("css", &name, "css.css");

    Some(CssFixture {
        name,
        input,
        expected_css,
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

/// Fixtures whose expected CSS exercises pruning/scoping edge cases rsvelte
/// doesn't yet match. Mirrors the corresponding entries in
/// `tests/compatibility_report.rs` so `test_css` stops blocking unrelated work;
/// remove an entry as soon as the upstream behaviour is matched.
const CSS_SKIP_NAMES: &[&str] = &[];

/// Run a single CSS test with timeout.
fn run_css_test(fixture: &CssFixture) -> TestResult {
    if CSS_SKIP_NAMES.contains(&fixture.name.as_str()) {
        return TestResult {
            name: fixture.name.clone(),
            compiled: false,
            css_matches: None,
            error_message: None,
            skipped: true,
        };
    }

    let input = fixture.input.clone();

    // Use a channel to implement timeout
    let (tx, rx) = std::sync::mpsc::channel();

    std::thread::spawn(move || {
        let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
            // Use "input.svelte" to match the filename used by Svelte fixture generator
            let options = CompileOptions {
                generate: GenerateMode::Client,
                filename: Some("input.svelte".to_string()),
                css: CssMode::External,
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

                // Always write actual output for comparison
                write_actual_output("css", &fixture.name, "css.css", &actual_css);

                // Compare CSS if expected is provided
                if let Some(expected_css) = &fixture.expected_css {
                    let actual_normalized = canonicalize_css(&actual_css);
                    let expected_normalized = canonicalize_css(expected_css);

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
            Err(e) => {
                // Write error to actual output
                write_actual_output("css", &fixture.name, "error.txt", &format!("{:?}", e));

                TestResult {
                    name: fixture.name.clone(),
                    compiled: false,
                    css_matches: None,
                    error_message: Some(format!("Compilation error: {:?}", e)),
                    skipped: false,
                }
            }
        },
    }
}

#[test]
fn test_css() {
    ensure_fixtures_exist();

    let samples = get_fixture_samples("css");

    if samples.is_empty() {
        panic!("No CSS fixtures found. Run `npm run generate-fixtures` first.");
    }

    let fixtures: Vec<CssFixture> = samples
        .iter()
        .filter_map(|sample_dir| load_css_fixture(sample_dir.as_path()))
        .collect();

    // Note: this suite previously ran sequentially "to avoid hangs". The most
    // likely cause was unbounded `par_iter()` exhausting memory under bumpalo
    // arena retention across concurrent compiles. `common::test_thread_pool()`
    // exposes a bounded pool (default 4 threads) for callers that want to
    // re-enable parallelism here once the hypothesis is verified locally.
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
                let err_lines: Vec<_> = err.lines().take(500).collect();
                for line in err_lines {
                    println!("      {}", line);
                }
                if err.lines().count() > 500 {
                    println!("      ...");
                }
            }
        }
        if failed.len() > 50 {
            println!("  ... and {} more", failed.len() - 50);
        }
    }

    // Assert that all CSS tests pass
    let failed_count = failed.len();
    assert_eq!(failed_count, 0, "{} CSS tests failed", failed_count);
}

/// List all available CSS fixtures.
#[test]
fn list_css_fixtures() {
    ensure_fixtures_exist();

    println!("\n=== Available CSS Fixtures ===\n");

    let samples = get_fixture_samples("css");
    println!("CSS samples ({}):", samples.len());

    println!("\nFirst 30 samples:");
    for sample in samples.iter().take(30) {
        let name = sample.file_name().unwrap().to_str().unwrap();
        let has_expected_css = load_fixture_output("css", name, "css.css").is_some();
        let has_warnings = load_fixture_output("css", name, "warnings.json").is_some();

        let markers = match (has_expected_css, has_warnings) {
            (true, true) => "[css+warnings]",
            (true, false) => "[css]",
            (false, true) => "[warnings]",
            (false, false) => "",
        };

        println!("  - {} {}", name, markers);
    }

    if samples.len() > 30 {
        println!("  ... and {} more", samples.len() - 30);
    }
}
