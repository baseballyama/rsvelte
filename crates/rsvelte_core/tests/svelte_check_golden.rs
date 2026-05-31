//! Golden-output tests for the `svelte-check` library against the JS
//! reference's own sanity fixtures.
//!
//! We point the runner at the two fixture workspaces that the upstream
//! `svelte-check` package uses for its own `test-sanity.js` smoke test:
//!
//!   * `submodules/language-tools/packages/svelte-check/test-success`
//!   * `submodules/language-tools/packages/svelte-check/test-error`
//!
//! Both fixtures contain valid Svelte syntax — every error in
//! `test-error` is a TypeScript type error that only surfaces once tsgo
//! (or `tsc`) walks the overlay. So the tests split in two:
//!
//!   * The Svelte-side assertions ("the Svelte compile is clean") run
//!     unconditionally and are the part this test always enforces.
//!   * The full TypeScript assertions only run when a `tsgo` / `tsc`
//!     binary can be located via `find_compiler` — otherwise they're
//!     skipped with a printed notice. This keeps the test portable on
//!     CI runners without a TS toolchain installed.
//!
//! Run with:
//!     cargo test --release --test svelte_check_golden -- --nocapture

use std::collections::HashSet;
use std::path::PathBuf;

use svelte_compiler_rust::svelte_check::diagnostic::DiagnosticSeverity;
use svelte_compiler_rust::svelte_check::tsgo::find_compiler;
use svelte_compiler_rust::svelte_check::{RunOptions, run};

fn fixture_root() -> Option<PathBuf> {
    let p = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..")
        .join("submodules")
        .join("language-tools")
        .join("packages")
        .join("svelte-check");
    if p.exists() { Some(p) } else { None }
}

/// One expected TypeScript-side error. Mirrors the entries in
/// `submodules/language-tools/packages/svelte-check/test-sanity.js`.
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
struct ExpectedTsError {
    /// Path relative to the workspace root, forward slashes.
    file: String,
    /// 0-indexed line, matching the `entry.start.line` field that the
    /// JS reference's machine-verbose output emits.
    line: u32,
    /// 0-indexed column.
    column: u32,
    /// TypeScript error code (`TS2307` → `2307`).
    code: u32,
}

fn expected_test_error_diagnostics() -> Vec<ExpectedTsError> {
    vec![
        ExpectedTsError {
            file: "Index.svelte".into(),
            line: 3,
            column: 21,
            code: 2307,
        },
        ExpectedTsError {
            file: "Index.svelte".into(),
            line: 5,
            column: 8,
            code: 2322,
        },
        ExpectedTsError {
            file: "Index.svelte".into(),
            line: 8,
            column: 4,
            code: 2367,
        },
        ExpectedTsError {
            file: "Index.svelte".into(),
            line: 11,
            column: 4,
            code: 2367,
        },
        ExpectedTsError {
            file: "Index.svelte".into(),
            line: 15,
            column: 1,
            code: 2741,
        },
        ExpectedTsError {
            file: "Jsdoc.svelte".into(),
            line: 9,
            column: 23,
            code: 2322,
        },
        ExpectedTsError {
            file: "src/routes/+page.ts".into(),
            line: 0,
            column: 13,
            code: 2322,
        },
    ]
}

#[test]
fn test_success_fixture_has_no_svelte_errors() {
    let Some(root) = fixture_root() else {
        eprintln!("Skipping: language-tools submodule not initialised");
        return;
    };
    let workspace = root.join("test-success");
    if !workspace.exists() {
        eprintln!(
            "Skipping: test-success fixture not found at {}",
            workspace.display()
        );
        return;
    }

    let opts = RunOptions {
        workspace: workspace.clone(),
        ..RunOptions::default()
    };
    let result = run(&opts);

    let svelte_errors: Vec<_> = result
        .diagnostics
        .iter()
        .filter(|d| d.source == "svelte" && d.severity == DiagnosticSeverity::Error)
        .collect();

    assert!(
        svelte_errors.is_empty(),
        "test-success fixture should compile cleanly, but the rsvelte compiler emitted errors:\n{:#?}",
        svelte_errors
    );
    assert!(
        result.files_checked >= 1,
        "expected at least one .svelte file under {}",
        workspace.display()
    );
}

#[test]
fn test_error_fixture_has_no_svelte_errors() {
    let Some(root) = fixture_root() else {
        eprintln!("Skipping: language-tools submodule not initialised");
        return;
    };
    let workspace = root.join("test-error");
    if !workspace.exists() {
        eprintln!(
            "Skipping: test-error fixture not found at {}",
            workspace.display()
        );
        return;
    }

    let opts = RunOptions {
        workspace: workspace.clone(),
        ..RunOptions::default()
    };
    let result = run(&opts);

    // All errors in this fixture are TypeScript type errors — the Svelte
    // side compiles cleanly. If rsvelte starts emitting Svelte-source
    // errors here, that's a real regression.
    let svelte_errors: Vec<_> = result
        .diagnostics
        .iter()
        .filter(|d| d.source == "svelte" && d.severity == DiagnosticSeverity::Error)
        .collect();
    assert!(
        svelte_errors.is_empty(),
        "test-error fixture: every error is supposed to come from TypeScript, \
         but the rsvelte Svelte compiler emitted these errors:\n{:#?}",
        svelte_errors
    );
}

#[test]
fn test_error_fixture_emits_expected_ts_error_codes() {
    let Some(root) = fixture_root() else {
        eprintln!("Skipping: language-tools submodule not initialised");
        return;
    };
    let workspace = root.join("test-error");
    let tsconfig = workspace.join("tsconfig.json");
    if !workspace.exists() || !tsconfig.exists() {
        eprintln!("Skipping: test-error fixture not found");
        return;
    }
    if find_compiler(&workspace).is_err() {
        eprintln!(
            "Skipping: no `tsgo` / `tsc` binary on this machine \
             (set TSGO_BIN or install @typescript/native-preview to enable)"
        );
        return;
    }

    let opts = RunOptions {
        workspace: workspace.clone(),
        tsconfig: Some(tsconfig.clone()),
        use_tsgo: true,
        ..RunOptions::default()
    };
    let result = run(&opts);

    let ts_errors: Vec<_> = result
        .diagnostics
        .iter()
        .filter(|d| d.severity == DiagnosticSeverity::Error && d.source == "ts")
        .collect();

    let actual_codes: HashSet<u32> = ts_errors
        .iter()
        .filter_map(|d| {
            d.code
                .as_deref()
                .and_then(|c| c.trim_start_matches("TS").parse::<u32>().ok())
        })
        .collect();

    let expected_codes: HashSet<u32> = expected_test_error_diagnostics()
        .into_iter()
        .map(|e| e.code)
        .collect();

    let missing: Vec<u32> = expected_codes.difference(&actual_codes).copied().collect();
    assert!(
        missing.is_empty(),
        "TypeScript error codes for test-error fixture did not match the JS \
         reference. Missing codes (expected, not produced): {:?}\n\
         Actual codes produced: {:?}\n\
         Full diagnostics:\n{:#?}",
        missing,
        actual_codes,
        result.diagnostics,
    );

    // Sanity: TS2304 ("Cannot find name") shows up only when the
    // svelte2tsx shim integration is broken — every reference to
    // `__sveltets_2_*` in the overlay generates one. None of the
    // expected user-source errors are TS2304, so its presence is a
    // direct signal that the shim path regressed.
    assert!(
        !actual_codes.contains(&2304),
        "TS2304 'Cannot find name' errors leaked through — shim .d.ts \
         files probably aren't being included in the overlay tsconfig. \
         Full diagnostics:\n{:#?}",
        result.diagnostics,
    );

    // Wave 2 v0.6 sourcemap tightening: every TS diagnostic must now be
    // mapped back to a `.svelte` source file. A diagnostic pointing at
    // a `.tsx` (or `.svelte.tsx`) is a regression — either svelte2tsx
    // stopped emitting source maps, or the mapper failed to thread
    // them through to OverlayEntry / diagnostic remapping.
    let leaking: Vec<_> = ts_errors
        .iter()
        .filter(|d| {
            let s = d.file.to_string_lossy();
            s.ends_with(".tsx") || s.contains("/.svelte-check/")
        })
        .collect();
    assert!(
        leaking.is_empty(),
        "TS diagnostics leaked overlay `.tsx` paths instead of being \
         mapped back to `.svelte` sources. svelte2tsx source-map output \
         or mapper integration is broken. Offending:\n{:#?}",
        leaking,
    );

    // For every expected TS code, ensure there is at least one actual
    // diagnostic pointing at a file matching the JS reference's
    // expected file. We do not yet pin exact line/column because:
    //   (a) tsc and tsgo report slightly different positions for the
    //       same overlay (we may be running against either backend);
    //   (b) MagicString emits one source-map segment per generated
    //       line for unedited stretches, so template-area diagnostics
    //       interpolate within a wrapped helper call and can drift
    //       from the JS reference's column.
    // Tightening to exact positions requires both tsgo-only test mode
    // and per-character source-map segments. Tracked in the Wave 2
    // handover.
    let expected = expected_test_error_diagnostics();
    for exp in &expected {
        let hit = ts_errors.iter().any(|d| {
            d.file
                .to_string_lossy()
                .replace('\\', "/")
                .ends_with(&exp.file)
                && d.code.as_deref() == Some(format!("TS{}", exp.code).as_str())
        });
        assert!(
            hit,
            "expected diagnostic not found: TS{} in {} \
             (file/line/col tightening only checks file+code for now). \
             Actual ts errors:\n{:#?}",
            exp.code, exp.file, ts_errors,
        );
    }
}
