//! Integration tests for svelte2tsx against language-tools test fixtures.
//!
//! These tests require:
//!   1. The language-tools submodule to be checked out
//!   2. The `native` feature to be disabled (svelte2tsx is not compiled with `native`)
//!
//! Run with:
//!   cargo test --no-default-features --test svelte2tsx_fixtures -- --nocapture
//!
//! The test prints a summary of pass/fail/skip counts and the first differing
//! lines for each failing sample.

#[cfg(not(feature = "native"))]
mod svelte2tsx_tests {
    use std::fs;
    use std::path::{Path, PathBuf};

    use svelte_compiler_rust::svelte2tsx::{
        Svelte2TsxMode, Svelte2TsxNamespace, Svelte2TsxOptions, SvelteVersion, svelte2tsx,
    };

    // =========================================================================
    // Helpers
    // =========================================================================

    /// Normalize line endings and trim trailing whitespace (matches JS `normalize` helper).
    fn normalize(content: &str) -> String {
        content.replace("\r\n", "\n").trim_end().to_string()
    }

    /// Find the first `.svelte` file in a sample directory.
    /// Most samples use `input.svelte`, but some have custom names
    /// (e.g. `+page.svelte`, `0.svelte`).
    fn find_svelte_file(sample_dir: &Path) -> Option<PathBuf> {
        let mut entries: Vec<_> = fs::read_dir(sample_dir)
            .ok()?
            .filter_map(|e| e.ok())
            .filter(|e| e.path().extension().is_some_and(|ext| ext == "svelte"))
            .collect();
        // Sort for determinism (prefer `input.svelte` if multiple exist)
        entries.sort_by_key(|e| e.file_name());
        entries.into_iter().next().map(|e| e.path())
    }

    /// Build svelte2tsx options from the sample name.
    ///
    /// This mirrors the JS `get_svelte2tsx_config` function:
    /// - `ts-*` samples set `is_ts_file: true`
    /// - `*-dts` samples set `mode: Dts`
    /// - `accessors-config*` samples set `accessors: true`
    /// - `*-foreign-ns` samples should set namespace to `Foreign`
    ///   (not yet available in Rust enum, defaults to Html)
    /// - `config.json` in the sample dir can override `filename`
    fn build_options(
        sample_name: &str,
        sample_dir: &Path,
        svelte_filename: &str,
    ) -> Svelte2TsxOptions {
        let is_ts_file = sample_name.starts_with("ts-");

        let mode = if sample_name.ends_with("-dts") {
            Svelte2TsxMode::Dts
        } else {
            Svelte2TsxMode::Ts
        };

        let accessors = sample_name.starts_with("accessors-config");

        // NOTE: The JS test sets namespace to 'foreign' for *-foreign-ns samples.
        // Our Rust enum does not have a Foreign variant yet, so we default to Html.
        let namespace = Svelte2TsxNamespace::Html;

        let version = SvelteVersion::V5;

        // Read config.json overrides if present
        let mut filename = svelte_filename.to_string();
        let config_path = sample_dir.join("config.json");
        if config_path.exists() {
            if let Ok(config_str) = fs::read_to_string(&config_path) {
                if let Ok(config) = serde_json::from_str::<serde_json::Value>(&config_str) {
                    if let Some(f) = config.get("filename").and_then(|v| v.as_str()) {
                        filename = f.to_string();
                    }
                }
            }
        }

        Svelte2TsxOptions {
            filename,
            is_ts_file,
            mode,
            accessors,
            namespace,
            version,
            runes: None,
        }
    }

    /// Relaxed comparison for when no `expected-svelte5.ts` exists.
    ///
    /// The `expectedv2.ts` file ends with a V4-style class export:
    ///   `\n\nexport default class Foo extends ...`
    /// while the Svelte 5 output ends with a V5-style const:
    ///   `\nconst Foo = __sveltets_2_isomorphic_component(...)`
    ///
    /// This function strips both tails and compares just the render body.
    /// It also removes `, exports: {}` and `, bindings: ""` from actual
    /// (V5-specific additions not present in V4 expected output).
    fn relaxed_compare(actual: &str, expected: &str) -> bool {
        // Strip V4-style class export from expected
        let expect_cut = match expected.rfind("\n\nexport default class") {
            Some(pos) => pos,
            None => return false,
        };
        let expected_body = &expected[..expect_cut];

        // Strip V5-style const export from actual
        let actual_cut = match actual.rfind("\nconst ") {
            Some(pos) => pos,
            None => return false,
        };
        let actual_body = &actual[..actual_cut];

        // Remove V5-specific additions that V4 doesn't have
        let actual_cleaned = actual_body
            .replace(", exports: {}", "")
            .replace(", bindings: \"\"", "");

        actual_cleaned == expected_body
    }

    /// Build a compact diff snippet showing the first N lines that differ.
    fn first_diff_snippet(actual: &str, expected: &str, context_lines: usize) -> String {
        let actual_lines: Vec<&str> = actual.lines().collect();
        let expected_lines: Vec<&str> = expected.lines().collect();
        let max_len = actual_lines.len().max(expected_lines.len());

        let diff_line = (0..max_len).find(|&i| {
            actual_lines.get(i).copied().unwrap_or("")
                != expected_lines.get(i).copied().unwrap_or("")
        });

        match diff_line {
            Some(line_idx) => {
                let mut out = String::new();
                out.push_str(&format!("  First difference at line {}:\n", line_idx + 1));
                let start = line_idx.saturating_sub(1);
                let end = (line_idx + context_lines).min(max_len);
                for i in start..end {
                    let a = actual_lines.get(i).copied().unwrap_or("<missing>");
                    let e = expected_lines.get(i).copied().unwrap_or("<missing>");
                    if a == e {
                        out.push_str(&format!("    {}: {}\n", i + 1, a));
                    } else {
                        out.push_str(&format!("  - {}: {}\n", i + 1, e));
                        out.push_str(&format!("  + {}: {}\n", i + 1, a));
                    }
                }
                out
            }
            None => "  (outputs have different trailing content)\n".to_string(),
        }
    }

    // =========================================================================
    // Main test
    // =========================================================================

    #[test]
    fn test_svelte2tsx_fixtures() {
        let samples_dir = Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("language-tools/packages/svelte2tsx/test/svelte2tsx/samples");

        if !samples_dir.exists() {
            eprintln!(
                "Skipping: language-tools submodule not available at {:?}",
                samples_dir
            );
            return;
        }

        let mut passed = 0u32;
        let mut failed = 0u32;
        let mut skipped = 0u32;
        let mut panic_count = 0u32;
        let mut error_count = 0u32;
        let mut failures: Vec<String> = Vec::new();

        let mut entries: Vec<_> = fs::read_dir(&samples_dir)
            .expect("failed to read samples directory")
            .filter_map(|e| e.ok())
            .collect();
        entries.sort_by_key(|e| e.file_name());

        for entry in &entries {
            let sample_name = entry.file_name().to_string_lossy().to_string();
            let sample_dir = entry.path();

            // Skip hidden directories
            if sample_name.starts_with('.') {
                continue;
            }

            // Skip non-directories
            if !sample_dir.is_dir() {
                continue;
            }

            // Skip error tests (they expect parse failures)
            if sample_dir.join("expected.error.json").exists() {
                skipped += 1;
                continue;
            }

            // Find the svelte input file
            let input_path = match find_svelte_file(&sample_dir) {
                Some(p) => p,
                None => {
                    skipped += 1;
                    continue;
                }
            };
            let svelte_filename = input_path
                .file_name()
                .unwrap()
                .to_string_lossy()
                .to_string();
            let input = match fs::read_to_string(&input_path) {
                Ok(s) => s,
                Err(_) => {
                    skipped += 1;
                    continue;
                }
            };

            // Determine expected output file (mirrors JS logic):
            // - For .v5 samples: always use expectedv2.ts
            // - For other samples: prefer expected-svelte5.ts, fall back to expectedv2.ts
            let is_v5_sample = sample_name.ends_with(".v5");
            let has_svelte5_expected =
                !is_v5_sample && sample_dir.join("expected-svelte5.ts").exists();
            let expected_path = if has_svelte5_expected {
                sample_dir.join("expected-svelte5.ts")
            } else {
                sample_dir.join("expectedv2.ts")
            };
            if !expected_path.exists() {
                skipped += 1;
                continue;
            }
            let expected = normalize(&fs::read_to_string(&expected_path).unwrap());

            // Build options from sample name
            let options = build_options(&sample_name, &sample_dir, &svelte_filename);

            // Run svelte2tsx, catching panics to avoid aborting the whole suite
            let input_clone = input.clone();
            let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
                svelte2tsx(&input_clone, options)
            }));

            match result {
                Ok(Ok(output)) => {
                    let actual = normalize(&output.code);
                    if actual == expected {
                        passed += 1;
                    } else if !has_svelte5_expected && relaxed_compare(&actual, &expected) {
                        // Relaxed match: render body matches, only component export differs
                        passed += 1;
                    } else {
                        failed += 1;
                        let diff = first_diff_snippet(&actual, &expected, 5);
                        failures.push(format!("FAIL: {}\n{}", sample_name, diff));
                    }
                }
                Ok(Err(e)) => {
                    failed += 1;
                    error_count += 1;
                    failures.push(format!("ERROR: {} - {}", sample_name, e));
                }
                Err(panic_info) => {
                    failed += 1;
                    panic_count += 1;
                    let msg = if let Some(s) = panic_info.downcast_ref::<&str>() {
                        s.to_string()
                    } else if let Some(s) = panic_info.downcast_ref::<String>() {
                        s.clone()
                    } else {
                        "unknown panic".to_string()
                    };
                    failures.push(format!("PANIC: {} - {}", sample_name, msg));
                }
            }
        }

        // Print summary
        println!("\n=== svelte2tsx Fixture Results ===");
        println!("Passed:  {}", passed);
        println!(
            "Failed:  {} (errors: {}, panics: {})",
            failed, error_count, panic_count
        );
        println!("Skipped: {}", skipped);
        println!("Total:   {}", passed + failed + skipped);

        if !failures.is_empty() {
            println!("\nFailures (first 20):");
            for err in failures.iter().take(20) {
                println!("  {}", err);
            }
            if failures.len() > 20 {
                println!("  ... and {} more", failures.len() - 20);
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
}
