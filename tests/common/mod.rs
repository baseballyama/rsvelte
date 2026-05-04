//! Common utilities for fixture-based testing.
//!
//! This module provides utilities for loading and comparing test fixtures
//! generated from the official Svelte compiler.

#![allow(dead_code)]

use oxc_allocator::Allocator;
use oxc_codegen::{Codegen, CodegenOptions, CommentOptions, LegalComment};
use oxc_parser::Parser;
use oxc_span::SourceType;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::process::Command;

pub mod preprocess_fixtures;

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
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("submodules")
        .join("svelte")
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
            ║  Please run:  pnpm run generate-fixtures                         ║\n\
            ║                                                                  ║\n\
            ║  This will generate expected outputs from the official Svelte    ║\n\
            ║  compiler for comparison with the Rust implementation.           ║\n\
            ╚══════════════════════════════════════════════════════════════════╝\n\n",
            short_hash
        );
    }

    ensure_fixtures_fresh();
}

/// Verify the fixture manifest matches the current Svelte submodule commit.
///
/// `fixtures_path()` already includes the short commit hash, so a stale tree
/// from an older HEAD usually appears as "fixtures missing". This catches the
/// remaining failure modes:
///   * partial generation (manifest written but for a different commit)
///   * manual editing of fixtures/ dir layout
///   * symlinked fixtures pointing somewhere unexpected
///
/// On mismatch we panic with an actionable error before any test compares the
/// wrong expected output (which would otherwise produce a misleading "passed"
/// or a hard-to-debug "expected vs actual" diff).
pub fn ensure_fixtures_fresh() {
    let manifest_path = fixtures_path().join("manifest.json");
    let Ok(content) = fs::read_to_string(&manifest_path) else {
        // Manifest missing but fixtures dir exists — treat as stale.
        let short_hash = get_svelte_commit_hash();
        let short_hash = &short_hash[..12];
        panic!(
            "\n\n\
            Fixture manifest missing at: {}\n\
            Run:  pnpm run generate-fixtures\n\
            (Svelte HEAD: {})\n\n",
            manifest_path.display(),
            short_hash
        );
    };

    let manifest: serde_json::Value = match serde_json::from_str(&content) {
        Ok(v) => v,
        Err(e) => panic!(
            "\n\nFixture manifest at {} is malformed: {}\n\
            Run:  pnpm run generate-fixtures --force\n\n",
            manifest_path.display(),
            e
        ),
    };

    let manifest_commit = manifest
        .get("commitHash")
        .and_then(|v| v.as_str())
        .unwrap_or("");
    let head_commit = get_svelte_commit_hash();

    if manifest_commit != head_commit {
        panic!(
            "\n\n\
            ╔══════════════════════════════════════════════════════════════════╗\n\
            ║  Fixtures are stale.                                             ║\n\
            ║                                                                  ║\n\
            ║  Manifest commit: {:.12}                                   ║\n\
            ║  Svelte HEAD:     {:.12}                                   ║\n\
            ║                                                                  ║\n\
            ║  Run:  pnpm run generate-fixtures --force                        ║\n\
            ╚══════════════════════════════════════════════════════════════════╝\n\n",
            manifest_commit, head_commit
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

/// Canonicalize JavaScript code using OXC parse→codegen for comparison.
///
/// Both expected (svelte) and actual (rsvelte) outputs are parsed into OXC AST
/// and then serialized with identical codegen options. This normalizes ONLY
/// formatting (whitespace, semicolons, quotes, parentheses) while preserving
/// all semantic differences.
///
/// Any difference in the canonicalized output represents a real code difference
/// (not just formatting) that should be investigated and fixed.
pub fn canonicalize_js(code: &str) -> String {
    let allocator = Allocator::new();
    let source_type = SourceType::mjs();
    let parsed = Parser::new(&allocator, code, source_type).parse();

    if parsed.panicked {
        eprintln!(
            "WARNING: OXC parse panicked during canonicalization, using raw code (first 100 chars: {:?})",
            &code[..code.len().min(100)]
        );
        return code.to_string();
    }

    let options = CodegenOptions {
        single_quote: true,
        comments: CommentOptions {
            normal: false,
            jsdoc: false,
            annotation: true,
            legal: LegalComment::None,
        },
        ..Default::default()
    };
    let result = Codegen::new()
        .with_options(options)
        .build(&parsed.program)
        .code;
    result.trim().to_string()
}

// ============================================================================
// Comparison helpers
// ============================================================================

/// Compare two JavaScript outputs using OXC parse→codegen canonicalization.
///
/// This normalizes only formatting (whitespace, semicolons, quotes,
/// parentheses) while preserving all semantic differences. Any returned
/// `false` represents a real code difference, not a stylistic one.
pub fn compare_js(actual: &str, expected: &str) -> bool {
    canonicalize_js(actual) == canonicalize_js(expected)
}

/// Same as [`compare_js`] but emits debug output via env vars when comparison
/// fails. Recognized env vars:
///   * `DEBUG_TEST=<name>` — print canonical expected/actual for the named test
///   * `DEBUG_ALL=1` — print canonical expected/actual for any failing test
///   * `DEBUG_RAW=<name>` — also write raw + canonical inputs to /tmp/debug_*
pub fn compare_js_with_debug(actual: &str, expected: &str, test_name: &str) -> bool {
    let canonical_actual = canonicalize_js(actual);
    let canonical_expected = canonicalize_js(expected);
    let passed = canonical_actual == canonical_expected;

    if !passed {
        let target_match = std::env::var("DEBUG_TEST").ok().as_deref() == Some(test_name);
        let debug_all = std::env::var("DEBUG_ALL").is_ok();
        if target_match || debug_all {
            eprintln!("=== {} canonical diff ===", test_name);
            eprintln!("{}", format_diff(&canonical_expected, &canonical_actual));
        }

        if std::env::var("DEBUG_RAW").ok().as_deref() == Some(test_name) {
            let _ = fs::write("/tmp/debug_raw_exp.js", expected);
            let _ = fs::write("/tmp/debug_raw_act.js", actual);
            let _ = fs::write("/tmp/debug_canonical_exp.js", &canonical_expected);
            let _ = fs::write("/tmp/debug_canonical_act.js", &canonical_actual);
            eprintln!(
                "DEBUG: wrote raw/canonical files to /tmp/debug_raw_*.js and /tmp/debug_canonical_*.js"
            );
        }
    }

    passed
}

/// Compare two source maps for semantic equality.
///
/// Both inputs are JSON. We compare only the fields that affect downstream
/// behavior:
///   * `version` (must agree; almost always 3)
///   * `mappings` (the encoded VLQ string — the load-bearing part)
///   * `sources` after normalizing to a forward-slash path basename so absolute
///     workspace paths don't cause false positives
///   * `names`
///
/// Fields like `file`, `sourceRoot`, and `sourcesContent` differ legitimately
/// between compilers and are ignored. Any returned `false` represents a real
/// mappings mismatch worth investigating.
pub fn compare_sourcemaps(actual: &str, expected: &str) -> bool {
    fn normalize(value: &str) -> Option<serde_json::Value> {
        let parsed: serde_json::Value = serde_json::from_str(value).ok()?;
        let obj = parsed.as_object()?;

        let version = obj
            .get("version")
            .cloned()
            .unwrap_or(serde_json::Value::Null);
        let mappings = obj
            .get("mappings")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string();
        let names = obj
            .get("names")
            .cloned()
            .unwrap_or(serde_json::Value::Array(vec![]));

        let sources: Vec<String> = obj
            .get("sources")
            .and_then(|v| v.as_array())
            .map(|arr| {
                arr.iter()
                    .map(|s| {
                        s.as_str()
                            .map(|p| {
                                // Strip drive letters / leading slashes so absolute
                                // workspace paths compare equal to relative ones.
                                p.replace('\\', "/")
                                    .rsplit_once('/')
                                    .map(|(_, last)| last.to_string())
                                    .unwrap_or_else(|| p.to_string())
                            })
                            .unwrap_or_default()
                    })
                    .collect()
            })
            .unwrap_or_default();

        Some(serde_json::json!({
            "version": version,
            "mappings": mappings,
            "names": names,
            "sources": sources,
        }))
    }

    match (normalize(actual), normalize(expected)) {
        (Some(a), Some(b)) => a == b,
        _ => false,
    }
}

/// Render a unified diff suitable for test failure output. Lines beginning
/// with `-` are expected, `+` are actual.
pub fn format_diff(expected: &str, actual: &str) -> String {
    use similar::{ChangeTag, TextDiff};

    let diff = TextDiff::from_lines(expected, actual);
    let mut out = String::new();
    for change in diff.iter_all_changes() {
        let prefix = match change.tag() {
            ChangeTag::Delete => "- ",
            ChangeTag::Insert => "+ ",
            ChangeTag::Equal => "  ",
        };
        out.push_str(prefix);
        out.push_str(change.value());
        if !change.value().ends_with('\n') {
            out.push('\n');
        }
    }
    out
}

/// Canonicalize CSS code for comparison.
///
/// Normalizes only formatting (whitespace) without any semantic changes.
/// No hash normalization — CSS hashes are deterministic and should be identical
/// for the same input file.
pub fn canonicalize_css(code: &str) -> String {
    code.lines()
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

// ============================================================================
// Generic test runner helpers
// ============================================================================

/// Outcome of a single fixture test, generic over a per-suite details payload.
///
/// Existing test files keep their bespoke `TestResult` for now; new suites and
/// future migrations should prefer this so the shared `summarize_results`
/// helper can render them uniformly.
#[derive(Debug, Clone)]
pub struct GenericTestResult<D> {
    pub name: String,
    pub passed: bool,
    pub skipped: bool,
    pub error: Option<String>,
    pub details: D,
}

impl<D: Default> GenericTestResult<D> {
    pub fn skipped(name: impl Into<String>, reason: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            passed: false,
            skipped: true,
            error: Some(reason.into()),
            details: D::default(),
        }
    }
}

/// Aggregate counts produced by `summarize_results`.
#[derive(Debug, Clone, Default)]
pub struct TestSummary {
    pub total: usize,
    pub run: usize,
    pub passed: usize,
    pub failed: usize,
    pub skipped: usize,
}

impl TestSummary {
    pub fn pass_percentage(&self) -> f64 {
        if self.run == 0 {
            0.0
        } else {
            (self.passed as f64 / self.run as f64) * 100.0
        }
    }

    /// Print a one-shot summary line in the format every existing suite uses.
    pub fn print(&self, suite: &str) {
        println!("\n=== {} ===", suite);
        println!(
            "Total: {}/{} passed ({} skipped, {:.1}%)",
            self.passed,
            self.run,
            self.skipped,
            self.pass_percentage(),
        );
    }
}

/// Trait that turns a sample directory into a strongly-typed fixture.
///
/// Implementing this on a per-suite struct lets callers write
/// `load_all_fixtures::<MyFixture>("validator")` instead of hand-rolling the
/// `read_dir → filter → load` boilerplate that's currently duplicated across
/// every test file.
pub trait FixtureLoader: Sized {
    /// Load this fixture from a sample directory. Return `None` if the
    /// directory should be skipped (missing inputs, opt-out via _config, etc.).
    fn load(sample_dir: &std::path::Path) -> Option<Self>;
}

/// Build a bounded rayon thread pool for fixture-driven test runs.
///
/// We previously saw three suites (`compiler-errors`, `css`, `validator`) hang
/// under the default unbounded `par_iter()`. Each fixture compile spins up an
/// OXC parser + bumpalo arenas, and at ~hundreds of fixtures × N CPU cores the
/// resulting peak memory exceeds what a typical CI runner has free, the
/// machine starts swapping, and the run looks like a hang. Capping concurrency
/// keeps memory bounded.
///
/// `RAYON_NUM_THREADS` (or the `RUST_TEST_THREADS` we already set in
/// `package.json`) overrides the default, so callers running locally with lots
/// of RAM can crank it up.
pub fn test_thread_pool() -> rayon::ThreadPool {
    let env_threads = std::env::var("RAYON_NUM_THREADS")
        .ok()
        .and_then(|s| s.parse::<usize>().ok())
        .filter(|n| *n > 0);

    let num_threads = env_threads.unwrap_or(4);

    rayon::ThreadPoolBuilder::new()
        .num_threads(num_threads)
        .build()
        .expect("Failed to build test thread pool")
}

#[cfg(test)]
mod tests {
    use super::*;

    // ============================================================================
    // canonicalize_js — semantic-preservation tests
    // ============================================================================
    //
    // `compare_js` is the only JS comparator the active test suites use. It calls
    // `canonicalize_js` (OXC parse → OXC codegen) on both sides and compares the
    // result. Anything that survives codegen counts as a real semantic difference
    // — the regex-based `normalize_*` helpers that used to live here have been
    // retired. These tests assert the canonicalizer's contract: formatting
    // differences (whitespace, trailing semicolons, single vs double quotes,
    // optional parens around literals/identifiers) collapse, but everything that
    // would actually run differently at runtime stays distinct.

    #[test]
    fn test_canonicalize_js_numeric_literals() {
        // Different number literals that compute to the same value normalise the
        // same — these are pure formatting / radix differences.
        assert_eq!(
            canonicalize_js("let x = .5;"),
            canonicalize_js("let x = 0.5;")
        );
        assert_eq!(
            canonicalize_js("let x = 1e3;"),
            canonicalize_js("let x = 1000;")
        );
        assert_eq!(
            canonicalize_js("let x = 1.5e2;"),
            canonicalize_js("let x = 150;")
        );
    }

    #[test]
    fn test_canonicalize_js_new_class_parens() {
        // Optional outer parens around the class expression in a `new` are pure
        // formatting.
        assert_eq!(
            canonicalize_js("let x = new (class Foo { constructor() {} })();"),
            canonicalize_js("let x = new class Foo { constructor() {} }();"),
        );
    }

    #[test]
    fn test_canonicalize_js_var_let_const() {
        // var / let / const have different scoping and rebinding semantics — the
        // canonicalizer must preserve them.
        assert_ne!(canonicalize_js("var x = 1;"), canonicalize_js("let x = 1;"));
        assert_ne!(
            canonicalize_js("let x = 1;"),
            canonicalize_js("const x = 1;")
        );
    }

    #[test]
    fn test_canonicalize_js_void_0_undefined() {
        // `void 0` evaluates to `undefined` but the literal text differs and so
        // does the AST shape; downstream consumers (e.g. minifiers, DOM matchers)
        // can tell them apart, so we must too.
        assert_ne!(
            canonicalize_js("let x = void 0;"),
            canonicalize_js("let x = undefined;"),
        );
    }

    #[test]
    fn test_canonicalize_js_comments() {
        // Plain `//` and `/* */` comments are stripped (formatting-only). This is
        // the one explicit lossy normalisation `canonicalize_js` performs and is
        // documented above the function. It does NOT extend to annotation
        // comments like `/* @__PURE__ */`, which OXC keeps.
        assert_eq!(
            canonicalize_js("let x = 1; // comment\nlet y = 2;"),
            canonicalize_js("let x = 1;\nlet y = 2;")
        );
        assert_eq!(
            canonicalize_js("/* block */ let x = 1;"),
            canonicalize_js("let x = 1;")
        );
    }

    #[test]
    fn test_canonicalize_js_identifier_renames_are_real_diffs() {
        // The dead `normalize_generated_var_names` regex used to collapse
        // `node_1` → `node`. That would silently mask real bugs (e.g. a generator
        // that points at the wrong DOM node). Verify the canonicalizer keeps
        // these distinct.
        assert_ne!(
            canonicalize_js("var node_1 = $.first_child(fragment);"),
            canonicalize_js("var node = $.first_child(fragment);")
        );
        assert_ne!(
            canonicalize_js("$.set_text(text_1, x);"),
            canonicalize_js("$.set_text(text, x);")
        );
        assert_ne!(
            canonicalize_js("$.set($$index_1, 0);"),
            canonicalize_js("$.set($$index, 0);")
        );
    }

    #[test]
    fn test_canonicalize_js_html_template_whitespace_is_a_real_diff() {
        // The dead `normalize_html_whitespace` regex used to strip whitespace
        // between HTML tags inside `$.from_html(...)` template literals. That is
        // a real DOM difference — `<div> hello</div>` renders with a leading
        // space, `<div>hello</div>` does not — so the canonicalizer must keep
        // these distinct.
        assert_ne!(
            canonicalize_js("var root = $.from_html(`<div> hello</div>`);"),
            canonicalize_js("var root = $.from_html(`<div>hello</div>`);"),
        );
        assert_ne!(
            canonicalize_js("var root = $.from_html(`<p> </p>`);"),
            canonicalize_js("var root = $.from_html(`<p></p>`);"),
        );
    }

    #[test]
    fn test_canonicalize_js_string_content_is_a_real_diff() {
        // String literal contents, including spacing inside class names, must
        // stay distinct.
        assert_ne!(
            canonicalize_js("$.set_class(div, 'svelte-abc');"),
            canonicalize_js("$.set_class(div, 'svelte-xyz');"),
        );
        assert_ne!(
            canonicalize_js("$.set_text(text, 'hello world');"),
            canonicalize_js("$.set_text(text, 'helloworld');"),
        );
    }

    #[test]
    fn test_canonicalize_js_argument_order_is_a_real_diff() {
        // Argument re-ordering changes runtime behaviour — keep distinct.
        assert_ne!(canonicalize_js("foo(a, b);"), canonicalize_js("foo(b, a);"));
        assert_ne!(
            canonicalize_js("$.set_attribute(el, 'x', 'y');"),
            canonicalize_js("$.set_attribute(el, 'y', 'x');"),
        );
    }

    #[test]
    fn test_canonicalize_js_call_targets_are_real_diffs() {
        // Different callees → different runtime behaviour.
        assert_ne!(
            canonicalize_js("$.event(...args);"),
            canonicalize_js("$.delegated(...args);")
        );
        assert_ne!(
            canonicalize_js("$.set(x, 1);"),
            canonicalize_js("$.update(x);")
        );
    }

    #[test]
    fn test_canonicalize_js_strict_vs_loose_equality_is_real_diff() {
        assert_ne!(canonicalize_js("a === b"), canonicalize_js("a == b"));
        assert_ne!(canonicalize_js("a !== b"), canonicalize_js("a != b"));
    }

    #[test]
    fn test_canonicalize_js_extra_or_missing_statements_are_real_diffs() {
        // A missing line of generated code is a real bug — keep distinct.
        assert_ne!(
            canonicalize_js("$.push(); $.pop();"),
            canonicalize_js("$.push();"),
        );
        assert_ne!(
            canonicalize_js("$.delegate(['click']);"),
            canonicalize_js(""),
        );
    }

    #[test]
    fn test_canonicalize_js_object_member_order_is_real_diff() {
        // Object literal property order is observable by `Object.keys` and by
        // any consumer that iterates via `for...in`.
        assert_ne!(
            canonicalize_js("let o = { a: 1, b: 2 };"),
            canonicalize_js("let o = { b: 2, a: 1 };"),
        );
    }

    #[test]
    fn test_canonicalize_js_quote_and_semicolon_are_formatting() {
        // Pure formatting — quotes / trailing semicolons / extra parens around
        // simple literals collapse.
        assert_eq!(
            canonicalize_js(r#"let x = "hi";"#),
            canonicalize_js("let x = 'hi'"),
        );
        assert_eq!(canonicalize_js("(null)?.foo"), canonicalize_js("null?.foo"));
    }
}
