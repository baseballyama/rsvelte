//! Standalone svelte2tsx fixture runner. The actual logic lives in
//! `tests/common/svelte2tsx.rs` so the same code drives the compatibility
//! checks without making the lower-level compiler crate depend on projection.
//!
//! Run with:
//!   cargo test --test svelte2tsx_fixtures -- --nocapture
//!
//! Prints per-sample status and a final pass-rate summary.
//!
//! Ratchet baseline: `compatibility/svelte2tsx-fixtures-known-failures.json`
//! (checked in, may only shrink). The test fails when a sample NOT in the
//! baseline fails (a regression). When previously-known failures now pass, a
//! reminder to shrink the baseline is printed:
//!   UPDATE_S2TSX_FIXTURES_BASELINE=1 cargo test --test svelte2tsx_fixtures
//! `STRICT_S2TSX_FIXTURES=1` ignores the baseline: any failure fails.

mod common;

use std::collections::BTreeSet;
use std::path::{Path, PathBuf};

use common::TestStatus;
use common::svelte2tsx::iter_svelte2tsx_outcomes;

/// Grow-only coverage floor: the number of samples that must actually be
/// compared, measured against the pinned `language-tools` submodule. Absolute on
/// purpose — a floor expressed as a fraction of what the run happened to find
/// shrinks together with its own numerator, so it cannot detect the erosion it
/// exists to detect. Never lower it without saying why.
const MIN_S2TSX_FIXTURES: u32 = 254;

fn baseline_path() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("../..")
        .join("compatibility/svelte2tsx-fixtures-known-failures.json")
}

fn read_baseline() -> BTreeSet<String> {
    if std::env::var("STRICT_S2TSX_FIXTURES").is_ok() {
        return BTreeSet::new();
    }
    let path = baseline_path();
    let Ok(text) = std::fs::read_to_string(&path) else {
        return BTreeSet::new();
    };
    serde_json::from_str::<Vec<String>>(&text)
        .unwrap_or_else(|e| panic!("{} is not a JSON string array: {e}", path.display()))
        .into_iter()
        .collect()
}

/// Mirrors the `.mjs` gates' `JSON.stringify(list, null, '\t')` layout so all
/// ratchet files in `compatibility/` stay diff-comparable.
fn write_baseline(names: &BTreeSet<String>) {
    let path = baseline_path();
    let body = if names.is_empty() {
        "[]".to_string()
    } else {
        let rows: Vec<String> = names
            .iter()
            .map(|n| format!("\t{}", serde_json::to_string(n).expect("name serializes")))
            .collect();
        format!("[\n{}\n]", rows.join(",\n"))
    };
    std::fs::write(&path, body + "\n").expect("baseline is writable");
    println!(
        "\n[s2tsx-fixtures] baseline updated: {} known failures -> {}",
        names.len(),
        path.display()
    );
}

#[test]
fn test_svelte2tsx_fixtures() {
    let outcomes = match iter_svelte2tsx_outcomes() {
        Some(o) => o,
        None => {
            // Only a job that promised this submodule may fail on its absence.
            assert!(
                std::env::var_os("RSVELTE_REQUIRE_PREREQS").is_none(),
                "submodules/language-tools is not checked out in a job that \
                 declares RSVELTE_REQUIRE_PREREQS — every svelte2tsx fixture \
                 assertion would be silently skipped."
            );
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
    let mut failing: BTreeSet<String> = BTreeSet::new();

    for outcome in &outcomes {
        match outcome.status {
            TestStatus::Passed => {
                passed += 1;
                println!("PASS: {}", outcome.name);
            }
            TestStatus::Failed => {
                failed += 1;
                failing.insert(outcome.name.clone());
                let msg = outcome.message.clone().unwrap_or_default();
                failures.push(format!("FAIL: {}\n{}", outcome.name, msg));
            }
            TestStatus::Skipped => {
                skipped += 1;
            }
            TestStatus::Error => {
                failed += 1;
                failing.insert(outcome.name.clone());
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
    assert!(
        total_tested >= MIN_S2TSX_FIXTURES,
        "[s2tsx-fixtures] only {total_tested} fixtures were compared, below the floor \
         of {MIN_S2TSX_FIXTURES} ({} discovered, {skipped} skipped) — the ratchet below \
         cannot see a regression in a fixture that never ran, so this is coverage \
         erosion, not a passing run. Either the language-tools fixture layout changed \
         or samples are being skipped; if upstream legitimately removed fixtures, lower \
         the floor deliberately and say why.",
        outcomes.len(),
    );
    println!(
        "\nPass rate: {:.1}% ({}/{})",
        (passed as f64 / total_tested as f64) * 100.0,
        passed,
        total_tested
    );

    if std::env::var("UPDATE_S2TSX_FIXTURES_BASELINE").is_ok() {
        write_baseline(&failing);
        return;
    }

    let baseline = read_baseline();
    let regressions: Vec<&String> = failing.difference(&baseline).collect();
    let fixed_known: Vec<&String> = baseline.difference(&failing).collect();

    if !fixed_known.is_empty() {
        println!(
            "\n[s2tsx-fixtures] 🎉 {} known failures now PASS — shrink the baseline:",
            fixed_known.len()
        );
        for name in &fixed_known {
            println!("  - {name}");
        }
        println!("  UPDATE_S2TSX_FIXTURES_BASELINE=1 cargo test --test svelte2tsx_fixtures");
    }

    assert!(
        regressions.is_empty(),
        "\n[s2tsx-fixtures] ❌ {} NEW failures (not in \
         compatibility/svelte2tsx-fixtures-known-failures.json):\n{}\n\
         Fix them, or — only with a written justification in \
         compatibility/svelte2tsx-fixtures-known-failures.md — record them with\n  \
         UPDATE_S2TSX_FIXTURES_BASELINE=1 cargo test --test svelte2tsx_fixtures\n\
         Re-run with `-- --nocapture` to see the diffs.",
        regressions.len(),
        regressions
            .iter()
            .map(|n| format!("  - {n}"))
            .collect::<Vec<_>>()
            .join("\n"),
    );

    if failing.is_empty() {
        println!("\n[s2tsx-fixtures] ✅ all fixtures pass");
    } else {
        println!(
            "\n[s2tsx-fixtures] ✅ no regressions ({} known failures remain)",
            failing.len()
        );
    }
}
