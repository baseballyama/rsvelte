//! Common utilities for fixture-based testing.
//!
//! This module provides utilities for loading and comparing test fixtures
//! generated from the official Svelte compiler.

#![allow(dead_code)]

use regex::Regex;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::process::Command;

// ============================================================================
// Path utilities
// ============================================================================

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

// ============================================================================
// Fixture loading
// ============================================================================

/// Load expected output from fixture.
pub fn load_fixture_output(category: &str, sample: &str, file: &str) -> Option<String> {
    let path = fixtures_path().join(category).join(sample).join(file);

    fs::read_to_string(&path).ok()
}

/// Load metadata from fixture.
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
                .filter(|e| {
                    e.file_name()
                        .to_str()
                        .map(|s| !s.starts_with('_'))
                        .unwrap_or(false)
                })
                .map(|e| e.path())
                .collect()
        })
        .unwrap_or_default()
}

/// Get all sample directories for a category from Svelte test suite.
pub fn get_svelte_test_samples(category: &str) -> Vec<PathBuf> {
    let samples_dir = svelte_path()
        .join("packages/svelte/tests")
        .join(category)
        .join("samples");

    if !samples_dir.exists() {
        return Vec::new();
    }

    fs::read_dir(&samples_dir)
        .ok()
        .map(|entries| {
            entries
                .filter_map(|e| e.ok())
                .filter(|e| e.file_type().map(|t| t.is_dir()).unwrap_or(false))
                .filter(|e| {
                    e.file_name()
                        .to_str()
                        .map(|s| !s.starts_with('.'))
                        .unwrap_or(false)
                })
                .map(|e| e.path())
                .collect()
        })
        .unwrap_or_default()
}

// ============================================================================
// Normalization utilities
// ============================================================================

/// Format JavaScript code using oxfmt for comparison.
/// Falls back to basic normalization if oxfmt is not available or fails.
pub fn format_js_with_oxfmt(js: &str) -> String {
    use std::time::SystemTime;

    // Create a temporary file for oxfmt to process
    let temp_dir = std::env::temp_dir();
    let timestamp = SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    let temp_file = temp_dir.join(format!("svelte_test_{}.js", timestamp));

    // Write JS to temp file
    if fs::write(&temp_file, js).is_err() {
        // Fallback to basic normalization if file write fails
        return normalize_js(js);
    }

    // Try to format with oxfmt using npx
    let output = Command::new("npx")
        .args(["oxfmt", temp_file.to_str().unwrap(), "--write"])
        .output();

    let formatted = match output {
        Ok(result) if result.status.success() => {
            // Read the formatted output
            let formatted = fs::read_to_string(&temp_file).unwrap_or_else(|_| js.to_string());
            // Normalize blank lines after formatting
            // oxfmt preserves existing blank lines, so we need to remove them for consistent comparison
            normalize_blank_lines(&formatted)
        }
        _ => {
            // Fallback to basic normalization if oxfmt fails
            normalize_js(js)
        }
    };

    // Clean up temp file
    let _ = fs::remove_file(temp_file);

    formatted
}

/// Normalize blank lines in formatted code.
/// Removes all blank lines for consistent comparison.
/// oxfmt preserves existing blank lines but doesn't add them,
/// so we remove all blank lines to make tests pass regardless of
/// whether the code generator includes them or not.
fn normalize_blank_lines(code: &str) -> String {
    code.lines()
        .filter(|line| !line.trim().is_empty())
        .collect::<Vec<_>>()
        .join("\n")
}

/// Normalize JavaScript code for comparison (optimized for performance).
/// This function performs lightweight normalization to compare the essential structure
/// of JavaScript code, ignoring formatting differences like quotes, whitespace, and semicolons.
pub fn normalize_js(js: &str) -> String {
    use regex::Regex;
    lazy_static::lazy_static! {
        // Normalize multiple spaces to single space
        static ref MULTI_SPACE: Regex = Regex::new(r"[ \t]+").unwrap();
        // Normalize space around operators and punctuation
        static ref SPACE_BEFORE_PUNC: Regex = Regex::new(r"\s+([,;:)\]}])").unwrap();
        static ref SPACE_AFTER_PUNC: Regex = Regex::new(r"([(\[{])\s+").unwrap();
        // Normalize "function ()" vs "function()" - remove space before opening paren after "function"
        static ref FUNCTION_SPACE_PAREN: Regex = Regex::new(r"function\s+\(").unwrap();
    }

    js.lines()
        .filter(|line| !line.trim().is_empty())
        .map(|line| {
            let mut normalized = line.trim().to_string();

            // Normalize quotes: double quotes to single quotes
            normalized = normalized.replace('"', "'");

            // Normalize tabs to spaces
            normalized = normalized.replace('\t', " ");

            // Normalize multiple spaces to single space
            normalized = MULTI_SPACE.replace_all(&normalized, " ").to_string();

            // Remove spaces before punctuation
            normalized = SPACE_BEFORE_PUNC.replace_all(&normalized, "$1").to_string();

            // Remove spaces after opening brackets
            normalized = SPACE_AFTER_PUNC.replace_all(&normalized, "$1").to_string();

            // Normalize "function ()" to "function()"
            normalized = FUNCTION_SPACE_PAREN
                .replace_all(&normalized, "function(")
                .to_string();

            // Remove trailing semicolons for comparison (optional based on style)
            normalized = normalized.trim_end_matches(';').to_string();

            normalized
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

// ============================================================================
// Warning/Error structures
// ============================================================================

/// Warning structure for comparison.
#[derive(Debug, Clone, Deserialize, Serialize, PartialEq)]
pub struct FixtureWarning {
    pub code: String,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub start: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub end: Option<serde_json::Value>,
}

/// Error structure for comparison.
#[derive(Debug, Clone, Deserialize, Serialize, PartialEq)]
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

// ============================================================================
// Actual output writing
// ============================================================================

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
pub fn write_actual_json<T: Serialize>(category: &str, sample: &str, file: &str, value: &T) {
    if let Ok(json) = serde_json::to_string_pretty(value) {
        write_actual_output(category, sample, file, &json);
    }
}

// ============================================================================
// Compatibility Report Structures
// ============================================================================

/// Test result status.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum TestStatus {
    Passed,
    Failed,
    Skipped,
    Error,
}

/// Result for a single test sample.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SampleResult {
    pub name: String,
    pub status: TestStatus,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub skip_reason: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<SampleDetails>,
}

/// Additional details for a test sample.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SampleDetails {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub client_passed: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub server_passed: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub css_passed: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub warnings_matched: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub errors_matched: Option<bool>,
}

/// Statistics for a test category.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct CategoryStats {
    pub total: usize,
    pub passed: usize,
    pub failed: usize,
    pub skipped: usize,
    pub errors: usize,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub client_passed: Option<usize>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub client_total: Option<usize>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub server_passed: Option<usize>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub server_total: Option<usize>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub css_passed: Option<usize>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub css_total: Option<usize>,
}

impl CategoryStats {
    /// Calculate pass percentage (excluding skipped tests).
    pub fn pass_percentage(&self) -> f64 {
        let run = self.total - self.skipped;
        if run == 0 {
            0.0
        } else {
            (self.passed as f64 / run as f64) * 100.0
        }
    }

    /// Get run count (total - skipped).
    pub fn run_count(&self) -> usize {
        self.total - self.skipped
    }
}

/// Results for a test category.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CategoryResult {
    pub category: String,
    pub stats: CategoryStats,
    pub samples: Vec<SampleResult>,
}

impl CategoryResult {
    pub fn new(category: &str) -> Self {
        Self {
            category: category.to_string(),
            stats: CategoryStats::default(),
            samples: Vec::new(),
        }
    }

    /// Add a sample result and update statistics.
    pub fn add_sample(&mut self, sample: SampleResult) {
        self.stats.total += 1;
        match sample.status {
            TestStatus::Passed => self.stats.passed += 1,
            TestStatus::Failed => self.stats.failed += 1,
            TestStatus::Skipped => self.stats.skipped += 1,
            TestStatus::Error => self.stats.errors += 1,
        }

        // Update detailed stats if available
        if let Some(details) = &sample.details {
            if let Some(passed) = details.client_passed {
                *self.stats.client_total.get_or_insert(0) += 1;
                if passed {
                    *self.stats.client_passed.get_or_insert(0) += 1;
                }
            }
            if let Some(passed) = details.server_passed {
                *self.stats.server_total.get_or_insert(0) += 1;
                if passed {
                    *self.stats.server_passed.get_or_insert(0) += 1;
                }
            }
            if let Some(passed) = details.css_passed {
                *self.stats.css_total.get_or_insert(0) += 1;
                if passed {
                    *self.stats.css_passed.get_or_insert(0) += 1;
                }
            }
        }

        self.samples.push(sample);
    }
}

/// Full compatibility report.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompatibilityReport {
    pub svelte_commit: String,
    pub svelte_short_hash: String,
    pub generated_at: String,
    pub categories: HashMap<String, CategoryResult>,
    pub summary: ReportSummary,
}

/// Summary statistics across all categories.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ReportSummary {
    pub total_tests: usize,
    pub total_passed: usize,
    pub total_failed: usize,
    pub total_skipped: usize,
    pub total_errors: usize,
    pub overall_percentage: f64,
    pub category_percentages: HashMap<String, f64>,
}

impl CompatibilityReport {
    /// Create a new report.
    pub fn new() -> Self {
        let commit = get_svelte_commit_hash();
        let short_hash = commit[..12].to_string();
        Self {
            svelte_commit: commit,
            svelte_short_hash: short_hash,
            generated_at: chrono::Utc::now().to_rfc3339(),
            categories: HashMap::new(),
            summary: ReportSummary::default(),
        }
    }

    /// Add a category result to the report.
    pub fn add_category(&mut self, result: CategoryResult) {
        let percentage = result.stats.pass_percentage();
        self.summary
            .category_percentages
            .insert(result.category.clone(), percentage);

        self.summary.total_tests += result.stats.total;
        self.summary.total_passed += result.stats.passed;
        self.summary.total_failed += result.stats.failed;
        self.summary.total_skipped += result.stats.skipped;
        self.summary.total_errors += result.stats.errors;

        self.categories.insert(result.category.clone(), result);
    }

    /// Finalize the report (calculate overall percentage).
    pub fn finalize(&mut self) {
        let run = self.summary.total_tests - self.summary.total_skipped;
        if run > 0 {
            self.summary.overall_percentage =
                (self.summary.total_passed as f64 / run as f64) * 100.0;
        }
    }

    /// Save the report to a JSON file.
    pub fn save_to_file(&self, path: &str) -> std::io::Result<()> {
        let json = serde_json::to_string_pretty(self)?;
        fs::write(path, json)
    }

    /// Get path to report file in fixtures directory.
    pub fn default_report_path() -> PathBuf {
        fixtures_path().join("compatibility-report.json")
    }
}

impl Default for CompatibilityReport {
    fn default() -> Self {
        Self::new()
    }
}

// ============================================================================
// Test category definitions
// ============================================================================

/// All supported test categories.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum TestCategory {
    ParserModern,
    ParserLegacy,
    Snapshot,
    Css,
    Validator,
    CompilerErrors,
    RuntimeRunes,
    RuntimeLegacy,
    RuntimeBrowser,
    Hydration,
    ServerSideRendering,
    Sourcemaps,
    Preprocess,
    Print,
    Migrate,
}

impl TestCategory {
    /// Get all test categories.
    pub fn all() -> &'static [TestCategory] {
        &[
            TestCategory::ParserModern,
            TestCategory::ParserLegacy,
            TestCategory::Snapshot,
            TestCategory::Css,
            TestCategory::Validator,
            TestCategory::CompilerErrors,
            TestCategory::RuntimeRunes,
            TestCategory::RuntimeLegacy,
            TestCategory::RuntimeBrowser,
            TestCategory::Hydration,
            TestCategory::ServerSideRendering,
            TestCategory::Sourcemaps,
            TestCategory::Preprocess,
            TestCategory::Print,
            TestCategory::Migrate,
        ]
    }

    /// Get the directory name for this category in Svelte tests.
    pub fn svelte_dir(&self) -> &'static str {
        match self {
            TestCategory::ParserModern => "parser-modern",
            TestCategory::ParserLegacy => "parser-legacy",
            TestCategory::Snapshot => "snapshot",
            TestCategory::Css => "css",
            TestCategory::Validator => "validator",
            TestCategory::CompilerErrors => "compiler-errors",
            TestCategory::RuntimeRunes => "runtime-runes",
            TestCategory::RuntimeLegacy => "runtime-legacy",
            TestCategory::RuntimeBrowser => "runtime-browser",
            TestCategory::Hydration => "hydration",
            TestCategory::ServerSideRendering => "server-side-rendering",
            TestCategory::Sourcemaps => "sourcemaps",
            TestCategory::Preprocess => "preprocess",
            TestCategory::Print => "print",
            TestCategory::Migrate => "migrate",
        }
    }

    /// Get the main input file name for this category.
    pub fn main_file(&self) -> &'static str {
        match self {
            TestCategory::ParserModern
            | TestCategory::ParserLegacy
            | TestCategory::Css
            | TestCategory::Validator
            | TestCategory::Sourcemaps
            | TestCategory::Preprocess
            | TestCategory::Print => "input.svelte",
            TestCategory::Snapshot => "index.svelte",
            TestCategory::CompilerErrors
            | TestCategory::RuntimeRunes
            | TestCategory::RuntimeLegacy
            | TestCategory::RuntimeBrowser
            | TestCategory::Hydration
            | TestCategory::ServerSideRendering => "main.svelte",
            TestCategory::Migrate => "input.svelte",
        }
    }

    /// Get human-readable display name.
    pub fn display_name(&self) -> &'static str {
        match self {
            TestCategory::ParserModern => "Parser (Modern)",
            TestCategory::ParserLegacy => "Parser (Legacy)",
            TestCategory::Snapshot => "Compiler Snapshot",
            TestCategory::Css => "CSS Scoping",
            TestCategory::Validator => "Validator",
            TestCategory::CompilerErrors => "Compiler Errors",
            TestCategory::RuntimeRunes => "Runtime (Runes)",
            TestCategory::RuntimeLegacy => "Runtime (Legacy)",
            TestCategory::RuntimeBrowser => "Runtime (Browser)",
            TestCategory::Hydration => "Hydration",
            TestCategory::ServerSideRendering => "Server-Side Rendering",
            TestCategory::Sourcemaps => "Sourcemaps",
            TestCategory::Preprocess => "Preprocess",
            TestCategory::Print => "Print",
            TestCategory::Migrate => "Migrate",
        }
    }

    /// Check if this category is currently implemented.
    pub fn is_implemented(&self) -> bool {
        matches!(
            self,
            TestCategory::ParserModern
                | TestCategory::ParserLegacy
                | TestCategory::Snapshot
                | TestCategory::Css
                | TestCategory::Validator
                | TestCategory::CompilerErrors
                | TestCategory::RuntimeRunes
                | TestCategory::RuntimeLegacy
                | TestCategory::RuntimeBrowser
                | TestCategory::Hydration
                | TestCategory::ServerSideRendering
                | TestCategory::Sourcemaps
        )
    }

    /// Get the number of test samples in this category.
    pub fn sample_count(&self) -> usize {
        get_svelte_test_samples(self.svelte_dir()).len()
    }
}

impl std::fmt::Display for TestCategory {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.svelte_dir())
    }
}
