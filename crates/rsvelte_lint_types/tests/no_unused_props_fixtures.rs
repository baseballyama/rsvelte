//! Fixture-driven typed oracle for `svelte/no-unused-props`: runs the REAL
//! eslint-plugin-svelte fixtures (including the type-checker-only ones the
//! corsa-free oracle skips) through the graph path + real `tsgo`, asserting
//! `(line, column, message)` parity with the sibling `*-errors.yaml`.
//!
//! Requires a discoverable `tsgo` binary and the `eslint-plugin-svelte`
//! submodule; FAILS (rather than skipping) when either is absent.
//! `pnpm run test:type-aware-lint` sets both up.

use std::path::{Path, PathBuf};

use rsvelte_lint::config::LintConfig;
use rsvelte_lint::rules::no_unused_props;
use rsvelte_lint_types::{CorsaTypeSession, lint_components_types, require_tsgo};
use serde::Deserialize;

/// Lower bound on the fixture count, so a moved/renamed upstream directory
/// surfaces as a failure instead of an empty-but-green run. Upstream had 76 at
/// eslint-plugin-svelte 32ba9159; the bound only has to catch collapse.
const MIN_FIXTURES: usize = 60;

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

fn fixture_root() -> PathBuf {
    let p = repo_root().join(
        "submodules/eslint-plugin-svelte/packages/eslint-plugin-svelte/tests/fixtures/rules/no-unused-props",
    );
    assert!(
        p.is_dir(),
        "no-unused-props fixtures missing at {} — run \
         `git submodule update --init --depth 1 submodules/eslint-plugin-svelte`",
        p.display()
    );
    p
}

/// Build a `LintConfig` enabling the rule at `warn` with the fixture's options
/// (from `<name>-config.json`'s `options[0]`, if present).
fn config_for(config_path: &Path) -> LintConfig {
    let options = std::fs::read_to_string(config_path)
        .ok()
        .and_then(|s| serde_json::from_str::<serde_json::Value>(&s).ok())
        .and_then(|v| v.get("options").and_then(|o| o.as_array()).cloned());

    let rule_value = options.and_then(|o| o.into_iter().next()).map_or_else(
        || serde_json::json!("warn"),
        |opt| serde_json::json!(["warn", opt]),
    );
    let cfg = serde_json::json!({ "rules": { "svelte/no-unused-props": rule_value } });
    LintConfig::from_json_str(&cfg.to_string()).expect("valid lint config")
}

/// Run one fixture through the typed graph path; returns `(line, column1, message)`
/// tuples (column is 1-based to match the fixtures).
fn run_fixture(input: &Path, session: &CorsaTypeSession) -> Vec<(u32, u32, String)> {
    let source = std::fs::read_to_string(input).unwrap();
    let stem = input.file_stem().unwrap().to_string_lossy();
    let stem = stem.strip_suffix("-input").unwrap_or(&stem);

    // `invalid/` and `valid/` hold same-named fixtures, so the enclosing
    // directory has to be part of the temp path: a warm worker serves the
    // second one from the first one's cached project.
    let kind = input.parent().and_then(|p| p.file_name()).map_or_else(
        || "fixture".to_string(),
        |n| n.to_string_lossy().into_owned(),
    );
    let dir = std::env::temp_dir().join(format!(
        "rsvelte-nup-{}-{kind}-{}",
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

    let mut backend = session.backend(&source, &svelte_path).expect("backend");
    let diags = no_unused_props::diagnostics_typed(&source, &svelte_path, &cfg, &mut backend);
    drop(backend);
    let _ = std::fs::remove_dir_all(&dir);

    let mut out: Vec<(u32, u32, String)> = diags
        .into_iter()
        .filter_map(|d| {
            let r = d.range?;
            // Diagnostic columns are 0-based UTF-16; fixtures are 1-based.
            Some((r.start.line, r.start.column + 1, d.message))
        })
        .collect();
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
    // Not `unwrap_or_default`: an unparseable expectations file would silently
    // become "expects nothing" and pass.
    let errs: Vec<ExpectedError> =
        serde_yaml::from_str(&text).unwrap_or_else(|e| panic!("malformed {}: {e}", yaml.display()));
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
    let tsgo = require_tsgo(Path::new(env!("CARGO_MANIFEST_DIR")));
    let root = fixture_root();
    let session = CorsaTypeSession::new(&tsgo, &std::env::temp_dir()).expect("worker should start");

    let mut failures = Vec::new();
    let mut checked = 0;
    for kind in ["invalid", "valid"] {
        for input in collect_inputs(&root.join(kind)) {
            let name = format!("{kind}/{}", input.file_stem().unwrap().to_string_lossy());
            let actual = run_fixture(&input, &session);
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
        checked >= MIN_FIXTURES,
        "typed oracle ran only {checked} fixtures (expected >= {MIN_FIXTURES}) \
         — upstream directory layout changed?"
    );
    assert!(
        failures.is_empty(),
        "{}/{} no-unused-props fixtures diverged:\n{}",
        failures.len(),
        checked,
        failures.join("\n")
    );
    eprintln!("no_unused_props_typed_oracle: {checked} fixtures OK");
}

/// The batch entry point puts every component in ONE program; a component that
/// silently failed to enter it would answer `any` and report nothing, which is
/// indistinguishable from "no findings" without comparing to the per-component
/// path.
#[test]
fn batch_program_matches_per_component() {
    let tsgo = require_tsgo(Path::new(env!("CARGO_MANIFEST_DIR")));
    let root = fixture_root();
    let batch_root = std::env::temp_dir().join(format!("rsvelte-nup-batch-{}", std::process::id()));
    std::fs::create_dir_all(&batch_root).unwrap();

    let mut components = Vec::new();
    let mut expected = Vec::new();
    for kind in ["invalid", "valid"] {
        for input in collect_inputs(&root.join(kind)) {
            let stem = input.file_stem().unwrap().to_string_lossy();
            let stem = stem.strip_suffix("-input").unwrap_or(&stem).to_string();
            // One config per batch, so only default-config fixtures qualify.
            if input
                .with_file_name(format!("{stem}-config.json"))
                .is_file()
            {
                continue;
            }
            let dir = batch_root.join(format!("{kind}-{stem}"));
            std::fs::create_dir_all(&dir).unwrap();
            if let Some(parent) = input.parent() {
                let shared = parent.join("shared-types.ts");
                if shared.is_file() {
                    let _ = std::fs::copy(&shared, dir.join("shared-types.ts"));
                }
            }
            let source = std::fs::read_to_string(&input).unwrap();
            let svelte_path = dir.join(format!("{stem}.svelte"));
            std::fs::write(&svelte_path, &source).unwrap();
            components.push((svelte_path, source));
            expected.push((format!("{kind}/{stem}"), expected_for(&input)));
        }
    }
    assert!(
        components.len() >= 20,
        "batch test ran only {} fixtures — upstream layout changed?",
        components.len()
    );
    // Without a fixture that must report, an all-empty batch would pass.
    assert!(
        expected.iter().any(|(_, want)| !want.is_empty()),
        "batch test selected no fixture with an expected finding"
    );

    let cfg = config_for(Path::new("this-file-does-not-exist.json"));
    let results = lint_components_types(&components, &cfg, &tsgo, &batch_root)
        .expect("batch session should start");
    let _ = std::fs::remove_dir_all(&batch_root);

    let mut failures = Vec::new();
    for ((name, want), (_, diags)) in expected.iter().zip(&results) {
        let mut got: Vec<(u32, u32, String)> = diags
            .iter()
            .filter_map(|d| {
                let r = d.range?;
                Some((r.start.line, r.start.column + 1, d.message.clone()))
            })
            .collect();
        got.sort();
        if &got != want {
            failures.push(format!(
                "  {name}\n    expected: {want:?}\n    actual:   {got:?}"
            ));
        }
    }
    assert!(
        failures.is_empty(),
        "{}/{} batched fixtures diverged from the per-component path:\n{}",
        failures.len(),
        results.len(),
        failures.join("\n")
    );
}
