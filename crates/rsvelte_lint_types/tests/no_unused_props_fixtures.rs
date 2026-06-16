//! Fixture-driven typed oracle for `svelte/no-unused-props`: runs the REAL
//! eslint-plugin-svelte fixtures (including the type-checker-only ones the
//! corsa-free oracle skips) through the graph path + real `tsgo`, asserting
//! `(line, column, message)` parity with the sibling `*-errors.yaml`.
//!
//! Gated on a discoverable `tsgo` binary and the `eslint-plugin-svelte`
//! submodule; no-ops with a notice when either is absent.

use std::path::{Path, PathBuf};

use rsvelte_lint::config::LintConfig;
use rsvelte_lint::line_index::LineIndex;
use rsvelte_lint::rules::no_unused_props;
use rsvelte_lint_types::{CorsaTypeBackend, resolve_tsgo};
use serde::Deserialize;

#[derive(Debug, Deserialize)]
struct ExpectedError {
    message: String,
    line: u32,
    column: u32,
}

fn repo_root() -> PathBuf {
    // crates/rsvelte_lint_types → repo root
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap()
        .parent()
        .unwrap()
        .to_path_buf()
}

fn fixture_root() -> Option<PathBuf> {
    let p = repo_root().join(
        "submodules/eslint-plugin-svelte/packages/eslint-plugin-svelte/tests/fixtures/rules/no-unused-props",
    );
    p.is_dir().then_some(p)
}

/// Build a `LintConfig` enabling the rule at `warn` with the fixture's options
/// (from `<name>-config.json`'s `options[0]`, if present).
fn config_for(config_path: &Path) -> LintConfig {
    let options = std::fs::read_to_string(config_path)
        .ok()
        .and_then(|s| serde_json::from_str::<serde_json::Value>(&s).ok())
        .and_then(|v| v.get("options").and_then(|o| o.as_array()).cloned());

    let rule_value = match options.and_then(|o| o.into_iter().next()) {
        Some(opt) => serde_json::json!(["warn", opt]),
        None => serde_json::json!("warn"),
    };
    let cfg = serde_json::json!({ "rules": { "svelte/no-unused-props": rule_value } });
    LintConfig::from_json_str(&cfg.to_string()).expect("valid lint config")
}

/// Run one fixture through the typed graph path; returns `(line, column1, message)`
/// tuples (column is 1-based to match the fixtures).
fn run_fixture(input: &Path, tsgo: &Path) -> Vec<(u32, u32, String)> {
    let source = std::fs::read_to_string(input).unwrap();
    let stem = input.file_stem().unwrap().to_string_lossy();
    let stem = stem.strip_suffix("-input").unwrap_or(&stem);

    let dir = std::env::temp_dir().join(format!(
        "rsvelte-nup-{}-{}",
        std::process::id(),
        stem.replace(['/', '.'], "_")
    ));
    std::fs::create_dir_all(&dir).unwrap();
    // Copy sibling shared-types.ts so imported-type fixtures resolve.
    if let Some(parent) = input.parent() {
        let shared = parent.join("shared-types.ts");
        if shared.is_file() {
            let _ = std::fs::copy(&shared, dir.join("shared-types.ts"));
        }
    }
    let svelte_path = dir.join(format!("{stem}.svelte"));
    std::fs::write(&svelte_path, &source).unwrap();

    let config_path = input.with_file_name(format!("{stem}-config.json"));
    let cfg = config_for(&config_path);

    let mut backend = CorsaTypeBackend::new(&source, &svelte_path, tsgo).expect("backend");
    let diags = no_unused_props::diagnostics_typed(&source, &svelte_path, &cfg, &mut backend);
    drop(backend);
    let _ = std::fs::remove_dir_all(&dir);

    let li = LineIndex::new(&source);
    let mut out: Vec<(u32, u32, String)> = diags
        .into_iter()
        .filter_map(|d| {
            let r = d.range?;
            // Diagnostic columns are 0-based UTF-16; fixtures are 1-based.
            Some((r.start.line, r.start.column + 1, d.message))
        })
        .collect();
    let _ = &li;
    out.sort();
    out
}

fn expected_for(input: &Path) -> Vec<(u32, u32, String)> {
    let stem = input.file_stem().unwrap().to_string_lossy();
    let stem = stem.strip_suffix("-input").unwrap_or(&stem);
    let yaml = input.with_file_name(format!("{stem}-errors.yaml"));
    let Ok(text) = std::fs::read_to_string(&yaml) else {
        return Vec::new();
    };
    let errs: Vec<ExpectedError> = serde_yaml::from_str(&text).unwrap_or_default();
    let mut out: Vec<(u32, u32, String)> = errs
        .into_iter()
        .map(|e| (e.line, e.column, e.message))
        .collect();
    out.sort();
    out
}

fn collect_inputs(dir: &Path) -> Vec<PathBuf> {
    let mut v = Vec::new();
    if let Ok(entries) = std::fs::read_dir(dir) {
        for e in entries.flatten() {
            let p = e.path();
            if p.extension().and_then(|x| x.to_str()) == Some("svelte")
                && p.file_stem()
                    .and_then(|s| s.to_str())
                    .is_some_and(|s| s.ends_with("-input"))
            {
                v.push(p);
            }
        }
    }
    v.sort();
    v
}

#[test]
fn no_unused_props_typed_oracle() {
    let Some(tsgo) = resolve_tsgo(Path::new(env!("CARGO_MANIFEST_DIR"))) else {
        eprintln!("SKIP no_unused_props_typed_oracle: no tsgo binary found");
        return;
    };
    let Some(root) = fixture_root() else {
        eprintln!("SKIP no_unused_props_typed_oracle: eslint-plugin-svelte submodule absent");
        return;
    };

    let mut failures = Vec::new();
    let mut checked = 0;
    for kind in ["invalid", "valid"] {
        for input in collect_inputs(&root.join(kind)) {
            let name = format!("{kind}/{}", input.file_stem().unwrap().to_string_lossy());
            let actual = run_fixture(&input, &tsgo);
            let expected = expected_for(&input);
            checked += 1;
            if actual != expected {
                failures.push(format!(
                    "  {name}\n    expected: {expected:?}\n    actual:   {actual:?}"
                ));
            }
        }
    }

    assert!(
        failures.is_empty(),
        "{}/{} no-unused-props fixtures diverged:\n{}",
        failures.len(),
        checked,
        failures.join("\n")
    );
    eprintln!("no_unused_props_typed_oracle: {checked} fixtures OK");
}
