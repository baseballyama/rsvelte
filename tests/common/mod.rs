//! Common utilities for fixture-based testing.
//!
//! This module provides utilities for loading and comparing test fixtures
//! generated from the official Svelte compiler.

#![allow(dead_code)]

use regex::Regex;
use std::fs;
use std::path::PathBuf;
use std::process::Command;

/// Get the Svelte submodule commit hash.
pub fn get_svelte_commit_hash() -> String {
    let output = Command::new("git")
        .args(["rev-parse", "HEAD"])
        .current_dir(svelte_path())
        .output()
        .expect("Failed to get git commit hash");

    String::from_utf8_lossy(&output.stdout).trim().to_string()
}

/// Get path to the Svelte submodule.
pub fn svelte_path() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("svelte")
}

/// Get path to fixtures directory for current Svelte commit.
pub fn fixtures_path() -> PathBuf {
    let commit = get_svelte_commit_hash();
    let short_hash = &commit[..12];
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("fixtures")
        .join(short_hash)
}

/// Check if fixtures exist for current Svelte commit.
pub fn fixtures_exist() -> bool {
    fixtures_path().exists()
}

/// Ensure fixtures exist, panicking with helpful message if not.
pub fn ensure_fixtures_exist() {
    if !fixtures_exist() {
        let commit = get_svelte_commit_hash();
        let short_hash = &commit[..12];
        panic!(
            "\n\n\
            ╔══════════════════════════════════════════════════════════════════╗\n\
            ║  Fixtures not found for Svelte commit: {}                 ║\n\
            ║                                                                  ║\n\
            ║  Please run:  npm run generate-fixtures                          ║\n\
            ║                                                                  ║\n\
            ║  This will generate expected outputs from the official Svelte    ║\n\
            ║  compiler for comparison with the Rust implementation.           ║\n\
            ╚══════════════════════════════════════════════════════════════════╝\n\n",
            short_hash
        );
    }
}

/// Load expected output from fixture.
pub fn load_fixture_output(category: &str, sample: &str, file: &str) -> Option<String> {
    let path = fixtures_path().join(category).join(sample).join(file);

    fs::read_to_string(&path).ok()
}

/// Load metadata from fixture.
#[allow(dead_code)]
pub fn load_fixture_metadata(category: &str, sample: &str) -> Option<serde_json::Value> {
    let content = load_fixture_output(category, sample, "metadata.json")?;
    serde_json::from_str(&content).ok()
}

/// Get all sample directories for a category from fixtures.
pub fn get_fixture_samples(category: &str) -> Vec<PathBuf> {
    let category_dir = fixtures_path().join(category);

    if !category_dir.exists() {
        return Vec::new();
    }

    fs::read_dir(&category_dir)
        .ok()
        .map(|entries| {
            entries
                .filter_map(|e| e.ok())
                .filter(|e| e.file_type().map(|t| t.is_dir()).unwrap_or(false))
                .map(|e| e.path())
                .collect()
        })
        .unwrap_or_default()
}

/// Normalize JavaScript code for comparison.
pub fn normalize_js(js: &str) -> String {
    js.lines()
        .filter(|line| !line.trim().is_empty())
        .map(|line| line.trim_end())
        .map(|line| {
            // Normalize double quotes to single quotes
            line.replace('"', "'")
        })
        .collect::<Vec<_>>()
        .join("\n")
}

/// Normalize CSS for comparison (replace hashes with placeholder).
pub fn normalize_css(css: &str) -> String {
    let hash_re = Regex::new(r"svelte-[a-z0-9]+").unwrap();
    let normalized = hash_re.replace_all(css, "svelte-xyz");

    normalized
        .lines()
        .map(|line| line.trim())
        .filter(|line| !line.is_empty())
        .collect::<Vec<_>>()
        .join("\n")
}

/// Normalize JSON for AST comparison.
pub fn normalize_json(value: &mut serde_json::Value) {
    remove_internal_fields(value);
}

fn remove_internal_fields(value: &mut serde_json::Value) {
    match value {
        serde_json::Value::Object(map) => {
            // Remove internal fields
            map.remove("metadata");

            // Helper to remove 'character' from location objects
            fn remove_character_from_loc(loc: &mut serde_json::Value) {
                if let serde_json::Value::Object(loc_map) = loc {
                    if let Some(serde_json::Value::Object(start)) = loc_map.get_mut("start") {
                        start.remove("character");
                    }
                    if let Some(serde_json::Value::Object(end)) = loc_map.get_mut("end") {
                        end.remove("character");
                    }
                }
            }

            // Remove 'character' field from loc.start and loc.end
            if let Some(loc) = map.get_mut("loc") {
                remove_character_from_loc(loc);
            }

            // Also remove from name_loc
            if let Some(name_loc) = map.get_mut("name_loc") {
                remove_character_from_loc(name_loc);
            }

            // Recursively process all fields
            for (_, v) in map.iter_mut() {
                remove_internal_fields(v);
            }
        }
        serde_json::Value::Array(arr) => {
            for v in arr.iter_mut() {
                remove_internal_fields(v);
            }
        }
        _ => {}
    }
}

/// Warning structure for comparison.
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, PartialEq)]
pub struct FixtureWarning {
    pub code: String,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub start: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub end: Option<serde_json::Value>,
}

/// Error structure for comparison.
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, PartialEq)]
pub struct FixtureError {
    pub code: String,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub start: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub end: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub position: Option<serde_json::Value>,
}

/// Load warnings from fixture.
pub fn load_fixture_warnings(category: &str, sample: &str) -> Vec<FixtureWarning> {
    load_fixture_output(category, sample, "warnings.json")
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default()
}

/// Load errors from fixture.
pub fn load_fixture_errors(category: &str, sample: &str) -> Vec<FixtureError> {
    load_fixture_output(category, sample, "errors.json")
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default()
}

/// Load single error from fixture (for compiler-errors tests).
pub fn load_fixture_error(category: &str, sample: &str) -> Option<FixtureError> {
    load_fixture_output(category, sample, "error.json").and_then(|s| serde_json::from_str(&s).ok())
}

/// Get path to actual output directory for a sample.
pub fn actual_output_path(category: &str, sample: &str) -> PathBuf {
    fixtures_path().join(category).join(sample).join("_actual")
}

/// Write actual output to fixture directory for comparison.
pub fn write_actual_output(category: &str, sample: &str, file: &str, content: &str) {
    let actual_dir = actual_output_path(category, sample);
    let _ = fs::create_dir_all(&actual_dir);
    let _ = fs::write(actual_dir.join(file), content);
}

/// Write actual JSON output to fixture directory.
pub fn write_actual_json<T: serde::Serialize>(category: &str, sample: &str, file: &str, value: &T) {
    if let Ok(json) = serde_json::to_string_pretty(value) {
        write_actual_output(category, sample, file, &json);
    }
}
