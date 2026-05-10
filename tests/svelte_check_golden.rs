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
use std::path::{Path, PathBuf};

use svelte_compiler_rust::svelte_check::diagnostic::DiagnosticSeverity;
use svelte_compiler_rust::svelte_check::tsgo::find_compiler;
use svelte_compiler_rust::svelte_check::{RunOptions, run};

fn fixture_root() -> Option<PathBuf> {
    let p = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
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
fn test_error_fixture_emits_expected_ts_errors() {
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

    let mut actual: HashSet<ExpectedTsError> = HashSet::new();
    for d in &result.diagnostics {
        if d.severity != DiagnosticSeverity::Error || d.source != "ts" {
            continue;
        }
        let Some(code_str) = d.code.as_deref() else {
            continue;
        };
        let trimmed = code_str.trim_start_matches("TS");
        let Ok(code) = trimmed.parse::<u32>() else {
            continue;
        };
        let Some(range) = d.range else {
            continue;
        };
        let rel = relative_to_workspace(&workspace, &d.file);
        actual.insert(ExpectedTsError {
            file: rel,
            line: range.start.line,
            column: range.start.column,
            code,
        });
    }

    let expected: HashSet<ExpectedTsError> =
        expected_test_error_diagnostics().into_iter().collect();

    let missing: Vec<_> = expected.difference(&actual).collect();
    let unexpected: Vec<_> = actual.difference(&expected).collect();

    assert!(
        missing.is_empty() && unexpected.is_empty(),
        "TypeScript diagnostics for test-error did not match the JS reference.\n\
         missing (expected, not produced):\n{:#?}\n\
         unexpected (produced, not expected):\n{:#?}\n\
         full actual diagnostics:\n{:#?}",
        missing,
        unexpected,
        result.diagnostics,
    );
}

fn relative_to_workspace(workspace: &Path, file: &Path) -> String {
    let stripped = file.strip_prefix(workspace).unwrap_or(file);
    stripped.to_string_lossy().replace('\\', "/")
}
