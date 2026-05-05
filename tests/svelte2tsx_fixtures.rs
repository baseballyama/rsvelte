//! Standalone svelte2tsx fixture runner. The actual logic lives in
//! `tests/common/svelte2tsx.rs` so the same code drives the compatibility
//! report dashboard's svelte2tsx category.
//!
//! Run with:
//!   cargo test --test svelte2tsx_fixtures -- --nocapture
//!
//! Prints per-sample status and a final pass-rate summary.

mod common;

use common::TestStatus;
use common::svelte2tsx::iter_svelte2tsx_outcomes;

#[test]
fn test_svelte2tsx_fixtures() {
    let outcomes = match iter_svelte2tsx_outcomes() {
        Some(o) => o,
        None => {
            eprintln!("Skipping: language-tools submodule not available");
            return;
        }
    };

    let mut passed = 0u32;
    let mut failed = 0u32;
    let mut skipped = 0u32;
    let mut error_count = 0u32;
    let mut panic_count = 0u32;
    let mut failures: Vec<String> = Vec::new();

    for outcome in &outcomes {
        match outcome.status {
            TestStatus::Passed => {
                passed += 1;
                println!("PASS: {}", outcome.name);
            }
            TestStatus::Failed => {
                failed += 1;
                let msg = outcome.message.clone().unwrap_or_default();
                failures.push(format!("FAIL: {}\n{}", outcome.name, msg));
            }
            TestStatus::Skipped => {
                skipped += 1;
            }
            TestStatus::Error => {
                failed += 1;
                let msg = outcome.message.clone().unwrap_or_default();
                if msg.starts_with("PANIC:") {
                    panic_count += 1;
                    failures.push(format!("PANIC: {} - {}", outcome.name, msg));
                } else {
                    error_count += 1;
                    failures.push(format!("ERROR: {} - {}", outcome.name, msg));
                }
            }
        }
    }

    println!("\n=== svelte2tsx Fixture Results ===");
    println!("Passed:  {}", passed);
    println!(
        "Failed:  {} (errors: {}, panics: {})",
        failed, error_count, panic_count
    );
    println!("Skipped: {}", skipped);
    println!("Total:   {}", passed + failed + skipped);

    if !failures.is_empty() {
        println!("\nFailure names:");
        for err in &failures {
            if let Some(first_line) = err.lines().next() {
                println!("  {}", first_line);
            }
        }
        println!("\nDetailed failures:");
        for err in failures.iter().take(50) {
            println!("  {}", err);
        }
        if failures.len() > 50 {
            println!("  ... and {} more", failures.len() - 50);
        }
    }

    let total_tested = passed + failed;
    if total_tested > 0 {
        println!(
            "\nPass rate: {:.1}% ({}/{})",
            (passed as f64 / total_tested as f64) * 100.0,
            passed,
            total_tested
        );
    }
}
