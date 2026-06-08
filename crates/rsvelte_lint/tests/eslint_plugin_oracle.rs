//! Compat oracle (design doc §F): drive the real eslint-plugin-svelte fixtures
//! through the ported native rules.
//!
//! The two parsers compute columns differently (svelte-eslint-parser maps a
//! virtual TS program back to source), so asserting byte-exact `messageId` +
//! range parity across engines is fragile. This oracle instead asserts the two
//! robust, high-signal properties:
//!
//! - every `valid/` fixture produces **zero** findings for the rule (no false
//!   positives), and
//! - every `invalid/` fixture produces **at least one** finding (no false
//!   negatives).
//!
//! Exact message text and counts are pinned by the per-rule unit tests in
//! `src/rules/*` and `src/runner.rs`. Fixtures that exercise features the port
//! doesn't cover yet are listed in `SKIP` with a reason.
//!
//! The test skips gracefully when the `eslint-plugin-svelte` submodule isn't
//! checked out, mirroring the repo's other submodule-gated tests.

use std::path::{Path, PathBuf};

use rsvelte_core::{CompileOptions, svelte_check::diagnostic::Diagnostic};
use rsvelte_lint::{LintConfig, Severity, lint_source};
use serde_json::Value;

/// (fixture rule dir, our rule code).
const RULES: &[(&str, &str)] = &[
    ("no-at-html-tags", "svelte/no-at-html-tags"),
    ("require-each-key", "svelte/require-each-key"),
    ("no-at-debug-tags", "svelte/no-at-debug-tags"),
    ("no-dupe-else-if-blocks", "svelte/no-dupe-else-if-blocks"),
    (
        "no-dupe-style-properties",
        "svelte/no-dupe-style-properties",
    ),
    (
        "no-object-in-text-mustaches",
        "svelte/no-object-in-text-mustaches",
    ),
    ("button-has-type", "svelte/button-has-type"),
    (
        "no-restricted-html-elements",
        "svelte/no-restricted-html-elements",
    ),
];

/// Fixture path substrings to skip, each with the porting gap it exercises.
const SKIP: &[&str] = &[
    // Duplicate property detection inside a ternary *interpolation* (the plugin
    // collapses both branches); the port treats interpolations as opaque.
    "no-dupe-style-properties/invalid/ternary01",
];

fn fixture_root() -> Option<PathBuf> {
    let p = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../..")
        .join("submodules/eslint-plugin-svelte/packages/eslint-plugin-svelte/tests/fixtures/rules");
    if p.exists() { Some(p) } else { None }
}

fn is_skipped(path: &Path) -> bool {
    let s = path.to_string_lossy().replace('\\', "/");
    SKIP.iter().any(|frag| s.contains(frag))
}

/// Recursively collect `*-input.svelte` fixture inputs under `dir`.
fn collect_inputs(dir: &Path, out: &mut Vec<PathBuf>) {
    let Ok(entries) = std::fs::read_dir(dir) else {
        return;
    };
    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_dir() {
            collect_inputs(&path, out);
        } else if path
            .file_name()
            .and_then(|n| n.to_str())
            .is_some_and(|n| n.ends_with("-input.svelte"))
        {
            out.push(path);
        }
    }
}

/// Load a fixture's `options` array from `<case>-config.json` or the directory
/// `_config.json`, applying the first one found.
fn load_options(input: &Path) -> Option<Value> {
    let base = input.to_str()?.strip_suffix("-input.svelte")?;
    let candidates = [
        PathBuf::from(format!("{base}-config.json")),
        input.parent()?.join("_config.json"),
    ];
    for p in candidates {
        if let Ok(txt) = std::fs::read_to_string(&p)
            && let Ok(v) = serde_json::from_str::<Value>(&txt)
            && let Some(opts) = v.get("options")
        {
            return Some(opts.clone());
        }
    }
    None
}

fn findings_for(source: &str, code: &str, options: Option<Value>) -> Vec<Diagnostic> {
    let mut cfg = LintConfig::empty().with_override(code, Severity::Error);
    if let Some(opts) = options {
        cfg = cfg.with_options(code, opts);
    }
    lint_source(
        source,
        &PathBuf::from("Fixture.svelte"),
        &CompileOptions::default(),
        &cfg,
    )
    .into_iter()
    .filter(|d| d.code.as_deref() == Some(code))
    .collect()
}

#[test]
fn oracle_no_false_positives_or_negatives() {
    let Some(root) = fixture_root() else {
        eprintln!("Skipping oracle: eslint-plugin-svelte submodule not checked out");
        return;
    };

    let mut checked = 0usize;
    for (dir, code) in RULES {
        let rule_dir = root.join(dir);
        if !rule_dir.exists() {
            continue;
        }
        for (kind, expect_findings) in [("valid", false), ("invalid", true)] {
            let mut inputs = Vec::new();
            collect_inputs(&rule_dir.join(kind), &mut inputs);
            for input in inputs {
                if is_skipped(&input) {
                    continue;
                }
                let Ok(source) = std::fs::read_to_string(&input) else {
                    continue;
                };
                let options = load_options(&input);
                let findings = findings_for(&source, code, options);
                checked += 1;
                if expect_findings {
                    assert!(
                        !findings.is_empty(),
                        "false negative: {} expected ≥1 {code} finding\n{source}",
                        input.display(),
                    );
                } else {
                    assert!(
                        findings.is_empty(),
                        "false positive: {} expected 0 {code} findings, got {:?}\n{source}",
                        input.display(),
                        findings.iter().map(|d| &d.message).collect::<Vec<_>>(),
                    );
                }
            }
        }
    }
    assert!(
        checked > 0,
        "oracle ran no fixtures — directory layout changed?"
    );
    eprintln!(
        "oracle checked {checked} fixtures across {} rules",
        RULES.len()
    );
}
