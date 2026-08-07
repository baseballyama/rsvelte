//! Preprocess tests.
//!
//! The official Svelte preprocess fixtures define their preprocessor functions
//! in `_config.js` modules. Rather than embedding a JS engine, this runner
//! hand-ports each fixture's preprocessor closures into Rust (in
//! `tests/common/preprocess_fixtures.rs`) so we can drive the rsvelte
//! `preprocess` API directly. The closures are kept as faithful to the JS
//! originals as practical — string replacements stay textual, attribute
//! reads use the same keys, and assertions on attribute shape are
//! re-implemented as Rust panics.

mod common;

use std::path::Path;

use common::preprocess_fixtures::{build_preprocessors, filename_for};
use common::{
    FixtureCoverage, SkipReason, get_svelte_test_samples, read_fixture_file, sample_name,
    svelte_samples_dir,
};
use rsvelte_core::compiler::preprocess::preprocess;

/// Grow-only fixture floor, measured against the pinned Svelte submodule: all
/// 19 preprocess samples are runnable. Never lower it.
const MIN_PREPROCESS_FIXTURES: usize = 19;

#[derive(Debug, Clone)]
pub struct PreprocessFixture {
    pub name: String,
    pub input: String,
    pub expected_output: String,
    pub filename: Option<String>,
}

#[derive(Debug)]
pub struct PreprocessResult {
    pub name: String,
    pub passed: bool,
    pub error: Option<String>,
}

fn load_fixture(sample_dir: &Path) -> Result<PreprocessFixture, SkipReason> {
    let name = sample_name(sample_dir).to_string();
    let input = read_fixture_file(&sample_dir.join("input.svelte"))
        .ok_or(SkipReason::MissingInput("input.svelte"))?;
    let expected_output = read_fixture_file(&sample_dir.join("output.svelte"))
        .ok_or(SkipReason::MissingInput("output.svelte"))?;
    let filename = filename_for(&name);
    Ok(PreprocessFixture {
        name,
        input,
        expected_output,
        filename,
    })
}

pub fn run_preprocess_fixture(fixture: &PreprocessFixture) -> PreprocessResult {
    let preprocessors = match build_preprocessors(&fixture.name) {
        Some(g) => g,
        None => {
            return PreprocessResult {
                name: fixture.name.clone(),
                passed: false,
                error: Some(format!(
                    "no Rust preprocessor wired up for {}",
                    fixture.name
                )),
            };
        }
    };

    let runtime = match tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
    {
        Ok(rt) => rt,
        Err(e) => {
            return PreprocessResult {
                name: fixture.name.clone(),
                passed: false,
                error: Some(format!("tokio runtime build failed: {}", e)),
            };
        }
    };

    let result = runtime.block_on(preprocess(
        fixture.input.clone(),
        preprocessors,
        fixture.filename.clone(),
    ));

    match result {
        Ok(processed) => {
            if processed.code == fixture.expected_output {
                PreprocessResult {
                    name: fixture.name.clone(),
                    passed: true,
                    error: None,
                }
            } else {
                PreprocessResult {
                    name: fixture.name.clone(),
                    passed: false,
                    error: Some(format!(
                        "Output mismatch.\nExpected:\n{}\n\nActual:\n{}",
                        fixture.expected_output, processed.code
                    )),
                }
            }
        }
        Err(e) => PreprocessResult {
            name: fixture.name.clone(),
            passed: false,
            error: Some(format!("preprocess error: {:?}", e)),
        },
    }
}

pub fn load_preprocess_fixtures() -> (Vec<PreprocessFixture>, FixtureCoverage) {
    let samples = get_svelte_test_samples("preprocess");
    let mut coverage = FixtureCoverage::new(
        "preprocess",
        svelte_samples_dir("preprocess"),
        samples.len(),
    );
    let mut fixtures = Vec::new();

    for sample_dir in &samples {
        match load_fixture(sample_dir.as_path()) {
            Ok(fixture) => {
                coverage.ran();
                fixtures.push(fixture);
            }
            Err(reason) => coverage.skipped(sample_name(sample_dir), reason),
        }
    }

    (fixtures, coverage)
}

#[test]
fn test_preprocess_fixtures() {
    let (fixtures, coverage) = load_preprocess_fixtures();
    coverage.assert(MIN_PREPROCESS_FIXTURES);

    println!("Running {} preprocess tests...", fixtures.len());
    let results: Vec<PreprocessResult> = fixtures.iter().map(run_preprocess_fixture).collect();

    let passed = results.iter().filter(|r| r.passed).count();
    let failed = results.len() - passed;

    println!("\n=== Preprocess Tests ===");
    println!("Total: {}/{} passed", passed, results.len());

    if failed > 0 {
        println!("\nFailed tests:");
        for r in results.iter().filter(|r| !r.passed) {
            println!("  - {}", r.name);
            if let Some(err) = &r.error {
                for line in err.lines().take(20) {
                    println!("      {}", line);
                }
            }
        }
        panic!("{} preprocess tests failed", failed);
    }
}
