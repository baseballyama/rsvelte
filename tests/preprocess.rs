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

use std::fs;
use std::path::Path;

use common::get_svelte_test_samples;
use common::preprocess_fixtures::{build_preprocessors, filename_for};
use svelte_compiler_rust::compiler::preprocess::preprocess;

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

fn load_fixture(sample_dir: &Path) -> Option<PreprocessFixture> {
    let name = sample_dir.file_name()?.to_str()?.to_string();
    let input = fs::read_to_string(sample_dir.join("input.svelte")).ok()?;
    let expected_output = fs::read_to_string(sample_dir.join("output.svelte")).ok()?;
    let filename = filename_for(&name);
    Some(PreprocessFixture {
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

pub fn load_preprocess_fixtures() -> Vec<PreprocessFixture> {
    get_svelte_test_samples("preprocess")
        .into_iter()
        .filter_map(|d| load_fixture(d.as_path()))
        .collect()
}

#[test]
fn test_preprocess_fixtures() {
    let fixtures = load_preprocess_fixtures();
    if fixtures.is_empty() {
        panic!(
            "No preprocess fixtures found. Run `git submodule update --init --recursive` and `pnpm run generate-fixtures`."
        );
    }

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
