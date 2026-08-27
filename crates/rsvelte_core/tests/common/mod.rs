//! Common utilities for fixture-based testing.
//!
//! This module provides utilities for loading and comparing test fixtures
//! generated from the official Svelte compiler.

#![allow(dead_code)]

use rsvelte_core::CompileError;
use rsvelte_core::compiler::AnalysisError;
use rsvelte_core::compiler::legacy::Utf8ToUtf16;
use rsvelte_core::error::ParseError;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::process::Command;
use std::sync::OnceLock;

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
        .join("../..")
        .join("submodules")
        .join("svelte")
}

/// Get path to fixtures directory for current Svelte commit.
pub fn fixtures_path() -> PathBuf {
    let commit = get_svelte_commit_hash();
    let short_hash = &commit[..12];
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../..")
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
            ║  Fixtures not found for Svelte commit: {short_hash}                 ║\n\
            ║                                                                  ║\n\
            ║  Please run:  pnpm run generate-fixtures                         ║\n\
            ║                                                                  ║\n\
            ║  This will generate expected outputs from the official Svelte    ║\n\
            ║  compiler for comparison with the Rust implementation.           ║\n\
            ╚══════════════════════════════════════════════════════════════════╝\n\n"
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

    assert!(
        manifest_commit == head_commit,
        "\n\n\
        ╔══════════════════════════════════════════════════════════════════╗\n\
        ║  Fixtures are stale.                                             ║\n\
        ║                                                                  ║\n\
        ║  Manifest commit: {manifest_commit:.12}                                   ║\n\
        ║  Svelte HEAD:     {head_commit:.12}                                   ║\n\
        ║                                                                  ║\n\
        ║  Run:  pnpm run generate-fixtures --force                        ║\n\
        ╚══════════════════════════════════════════════════════════════════╝\n\n"
    )
}

// ============================================================================
// Fixture loading
// ============================================================================

/// Read a fixture file with CRLF normalised to LF.
///
/// Windows checkouts default to `autocrlf=true`; without this every AST span
/// shifts by one byte per line and every text comparison diverges.
pub fn read_fixture_file(path: &std::path::Path) -> Option<String> {
    fs::read_to_string(path)
        .ok()
        .map(|s| s.replace("\r\n", "\n"))
}

/// Load expected output from fixture.
pub fn load_fixture_output(category: &str, sample: &str, file: &str) -> Option<String> {
    let path = fixtures_path().join(category).join(sample).join(file);

    read_fixture_file(&path)
}

/// Directory `get_fixture_samples` reads, i.e. generated by `generate-fixtures`.
pub fn fixture_samples_dir(category: &str) -> PathBuf {
    fixtures_path().join(category)
}

/// Directory `get_svelte_test_samples` reads, i.e. owned by the Svelte submodule.
pub fn svelte_samples_dir(category: &str) -> PathBuf {
    svelte_path()
        .join("packages/svelte/tests")
        .join(category)
        .join("samples")
}

/// Get all sample directories for a category from fixtures.
pub fn get_fixture_samples(category: &str) -> Vec<PathBuf> {
    let category_dir = fixture_samples_dir(category);

    if !category_dir.exists() {
        return Vec::new();
    }

    fs::read_dir(&category_dir)
        .ok()
        .map(|entries| {
            entries
                .filter_map(std::result::Result::ok)
                .filter(|e| e.file_type().is_ok_and(|t| t.is_dir()))
                .filter(|e| e.file_name().to_str().is_some_and(|s| !s.starts_with('_')))
                .map(|e| e.path())
                .collect()
        })
        .unwrap_or_default()
}

/// Get all sample directories for a category from Svelte test suite.
pub fn get_svelte_test_samples(category: &str) -> Vec<PathBuf> {
    let samples_dir = svelte_samples_dir(category);

    if !samples_dir.exists() {
        return Vec::new();
    }

    fs::read_dir(&samples_dir)
        .ok()
        .map(|entries| {
            entries
                .filter_map(std::result::Result::ok)
                .filter(|e| e.file_type().is_ok_and(|t| t.is_dir()))
                .filter(|e| e.file_name().to_str().is_some_and(|s| !s.starts_with('.')))
                .map(|e| e.path())
                .collect()
        })
        .unwrap_or_default()
}

// ============================================================================
// Fixture coverage guards
// ============================================================================

/// Why a discovered sample directory did not yield a runnable fixture.
#[derive(Debug, Clone, Copy)]
pub enum SkipReason {
    /// Legitimate: the sample opts out via `_config.js`, sits on a suite's
    /// documented skip list, or upstream generated no expected output for it
    /// (the official compiler errors on the sample).
    Justified,
    /// A coverage hole: the loader looked for the named input file and it was
    /// not on disk. A single upstream rename silently zeroes out a whole
    /// category this way — `Sourcemaps 0/0` was exactly this.
    MissingInput(&'static str),
}

/// Directory name of a sample, for coverage diagnostics.
pub fn sample_name(sample_dir: &std::path::Path) -> &str {
    sample_dir
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("<unnamed>")
}

/// Ledger that turns "this suite measured nothing" into a red test.
///
/// libtest reports an early `return` as PASS, so a fixture suite that finds no
/// samples — or silently drops every sample it found — is indistinguishable
/// from a green run. Every discovered sample must be accounted for as either
/// run or justified-skipped, and the run count carries a grow-only floor.
pub struct FixtureCoverage {
    what: String,
    /// The directory the samples were discovered in. Required rather than
    /// optional: a `found == 0` message that cannot name its path can only
    /// list candidate causes, and this assertion is shared by suites rooted in
    /// two different trees, so no single wording is correct for all of them.
    searched: PathBuf,
    found: usize,
    ran: usize,
    justified: usize,
    missing: Vec<String>,
}

impl FixtureCoverage {
    pub fn new(what: impl Into<String>, searched: impl Into<PathBuf>, found: usize) -> Self {
        Self {
            what: what.into(),
            searched: searched.into(),
            found,
            ran: 0,
            justified: 0,
            missing: Vec::new(),
        }
    }

    /// Which of the two fixture trees `searched` lives under, and what to do
    /// about it being empty. `generate-fixtures` writes only `fixtures/`, so
    /// suggesting it for a submodule-rooted suite sends the reader to a command
    /// that is expensive here and cannot help.
    fn remedy(&self) -> String {
        let svelte_root = svelte_path();
        if self.searched.starts_with(&svelte_root) {
            let checked_out = fs::read_dir(&svelte_root).is_ok_and(|mut e| e.next().is_some());
            return if checked_out {
                format!(
                    "{} is checked out but that path is absent — the upstream fixture layout \
                     changed. Fix the lookup; do not lower the floor.",
                    svelte_root.display()
                )
            } else {
                format!(
                    "{} is empty, so the submodule is not checked out (a fresh `git worktree` \
                     does not populate submodules).\n  run: git submodule update --init --depth 1 \
                     submodules/svelte",
                    svelte_root.display()
                )
            };
        }
        format!(
            "that path is under the generated fixture tree ({}), which is written by \
             `generate-fixtures`.\n  run: pnpm run generate-fixtures",
            fixtures_path().display()
        )
    }

    /// Record a sample that was actually compared against its expected output.
    pub const fn ran(&mut self) {
        self.ran += 1;
    }

    /// Record final run / justified-skip counts in one go, for callers that
    /// already tally their own results and only report missing inputs inline.
    pub const fn tally(&mut self, ran: usize, justified: usize) {
        self.ran += ran;
        self.justified += justified;
    }

    /// Record a sample dropped for the given reason.
    pub fn skipped(&mut self, sample: &str, reason: SkipReason) {
        match reason {
            SkipReason::Justified => self.justified += 1,
            SkipReason::MissingInput(wanted) => {
                self.missing.push(format!("{sample} (no {wanted})"));
            }
        }
    }

    /// `min_ran` is a grow-only floor measured against the pinned Svelte
    /// submodule. Lower it only together with a documented skip-list entry —
    /// lowering it to make CI green defeats the whole guard.
    #[track_caller]
    pub fn assert(&self, min_ran: usize) {
        let what = &self.what;

        assert!(
            self.found > 0,
            "{what}: no sample directories under {}\n  {}",
            self.searched.display(),
            self.remedy()
        );

        assert!(
            self.missing.is_empty(),
            "{what}: {} of {} sample(s) were dropped because an expected input \
             file is missing — an upstream rename silently removes coverage \
             this way. Fix the lookup, do not relax the guard.\n  {}",
            self.missing.len(),
            self.found,
            self.missing.join("\n  ")
        );

        assert_eq!(
            self.ran + self.justified,
            self.found,
            "{what}: {} of {} sample(s) were dropped without being recorded as \
             run or justified-skipped. Some loader path returns early without \
             telling the coverage ledger.",
            self.found.saturating_sub(self.ran + self.justified),
            self.found
        );

        assert!(
            self.ran >= min_ran,
            "{what}: only {} fixture(s) ran, floor is {min_ran}. This floor is \
             grow-only — find the samples that stopped running; lower it only \
             alongside a documented skip-list entry, never to make CI green.",
            self.ran
        );
    }
}

// ============================================================================
// Runtime fixture compile options and skip lists
// ============================================================================

/// The compile options a runtime fixture's expected output was generated with.
///
/// Mirrors `scripts/fixtures/generate-fixtures.mjs::generateRuntimeFixture`, so
/// every runner that compares against those fixtures — `tests/runtime.rs`,
/// `tests/ssr.rs`, the devtools compatibility report, and `tests/audit_skipped.rs`
/// — must build its `CompileOptions` from here. Hand-rolled copies drift, and a
/// runner that compiles with different options than the fixture was generated
/// with can only report noise.
#[derive(Debug, Clone, Copy, Default)]
pub struct RuntimeFixtureOptions {
    pub r#async: bool,
    pub dev: bool,
    pub hmr: bool,
    /// The generator only passes `accessors` to the client compile.
    pub accessors: bool,
}

/// Read the fixture-generation options back out of a sample's `_config.js`.
pub fn runtime_fixture_options(category: &str, sample: &str) -> RuntimeFixtureOptions {
    if let Some(options) = fixture_compile_options(category, sample) {
        return RuntimeFixtureOptions {
            r#async: category == "runtime-runes"
                || options
                    .get("experimental")
                    .and_then(|v| v.get("async"))
                    .and_then(serde_json::Value::as_bool)
                    .unwrap_or(false),
            dev: options
                .get("dev")
                .and_then(serde_json::Value::as_bool)
                .unwrap_or(false),
            hmr: options
                .get("hmr")
                .and_then(serde_json::Value::as_bool)
                .unwrap_or(false),
            accessors: options
                .get("accessors")
                .and_then(serde_json::Value::as_bool)
                .unwrap_or(false),
        };
    }

    let config = fs::read_to_string(
        svelte_path()
            .join("packages/svelte/tests")
            .join(category)
            .join("samples")
            .join(sample)
            .join("_config.js"),
    )
    .unwrap_or_default();

    // `skip_no_async` / `skip_async` are runner mode markers, not compile options.
    let without_skip_markers = config
        .replace("skip_no_async", "")
        .replace("skip_async", "");

    RuntimeFixtureOptions {
        r#async: category == "runtime-runes" || without_skip_markers.contains("async: true"),
        dev: without_skip_markers.contains("dev: true"),
        hmr: config.contains("hmr: true"),
        // The official runner defaults runtime-legacy to `accessors: true`
        // (svelte/packages/svelte/tests/runtime-legacy/shared.ts).
        accessors: category == "runtime-legacy"
            && !config.contains("accessors: false")
            && !config.contains("accessors:false"),
    }
}

fn fixture_compile_options(
    category: &str,
    sample: &str,
) -> Option<serde_json::Map<String, serde_json::Value>> {
    let metadata = fs::read_to_string(
        runtime_fixtures_path()
            .join(category)
            .join(sample)
            .join("metadata.json"),
    )
    .ok()?;
    serde_json::from_str::<serde_json::Value>(&metadata)
        .ok()?
        .get("compileOptions")?
        .as_object()
        .cloned()
}

fn runtime_fixtures_path() -> &'static PathBuf {
    static PATH: OnceLock<PathBuf> = OnceLock::new();
    PATH.get_or_init(fixtures_path)
}

/// runtime-runes fixtures still failing on the rsvelte port. Each entry is
/// audited by `tests/audit_skipped.rs`, which fails the build once a skipped
/// fixture starts passing. Remove an entry as soon as the port lands.
pub const RUNTIME_RUNES_SKIP_NAMES: &[&str] = &[];

/// runtime-legacy fixtures still failing on the rsvelte port.
pub const RUNTIME_LEGACY_SKIP_NAMES: &[&str] = &[];

/// hydration fixtures still failing on the rsvelte port.
pub const HYDRATION_SKIP_NAMES: &[&str] = &[];

/// server-side-rendering fixtures still failing on the rsvelte port.
pub const SSR_SKIP_NAMES: &[&str] = &[];

/// The documented skip list for a runtime-style fixture category.
pub fn runtime_skip_names(category: &str) -> &'static [&'static str] {
    match category {
        "runtime-runes" => RUNTIME_RUNES_SKIP_NAMES,
        "runtime-legacy" => RUNTIME_LEGACY_SKIP_NAMES,
        "hydration" => HYDRATION_SKIP_NAMES,
        "server-side-rendering" => SSR_SKIP_NAMES,
        _ => &[],
    }
}

// ============================================================================
// Normalization utilities
// ============================================================================

/// Canonicalize JavaScript code for comparison — see [`rsvelte_ast_equiv`] for
/// what counts as formatting and what counts as a difference.
///
/// Comments are excluded. The comparator's default is to compare the ones a
/// downstream tool acts on, and turning that on here fails 14 fixtures: rsvelte
/// drops the user's `JSDoc` / `@ts-expect-error` / `svelte-ignore` comments on the
/// server path, and keeps one on the client path that the official compiler
/// drops. That is a real gap, tracked separately in
/// `compatibility/ast-equivalence.md`, not something this suite can absorb one
/// fixture at a time.
///
/// # Panics
/// If the code does not parse. A compiler output that OXC cannot read is a bug
/// in its own right, and canonicalizing it as raw text would let the comparison
/// pass on a formatting coincidence.
pub fn canonicalize_js(code: &str) -> String {
    let options = rsvelte_ast_equiv::Options::default()
        .with_comments(rsvelte_ast_equiv::CommentPolicy::Ignore);
    rsvelte_ast_equiv::canonicalize_with(code, options)
        .unwrap_or_else(|failure| {
            panic!(
                "OXC could not parse the code being canonicalized: {failure}\nfirst 200 chars: {:?}",
                &code[..code.len().min(200)]
            )
        })
        .code
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
            eprintln!("=== {test_name} canonical diff ===");
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
        .map(str::trim)
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
#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub struct FixtureWarning {
    pub code: String,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub start: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub end: Option<serde_json::Value>,
}

/// Error structure for comparison.
#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
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
// Expected-error matching (shared by the gates and the compatibility report)
// ============================================================================

/// Does a rendered compiler error name the expected Svelte error code?
///
/// `\b<code>(_[a-z_]+)?\b` — the exact code or a more specific `snake_case`
/// sub-code (`element_invalid_closing_tag` → `…_autoclosed`), never an
/// unrelated code that merely contains the expected one as a substring.
pub fn error_code_matches(expected_code: &str, rendered: &[&str]) -> bool {
    if expected_code.is_empty() {
        return false;
    }
    let pattern = format!(r"\b{}(_[a-z_]+)?\b", regex::escape(expected_code));
    let Ok(re) = regex::Regex::new(&pattern) else {
        return false;
    };
    rendered.iter().any(|text| re.is_match(text))
}

/// Line/column pair as pinned by a validator fixture.
#[derive(Debug, Deserialize, PartialEq, Eq)]
pub struct ExpectedPosition {
    pub line: u32,
    pub column: u32,
}

/// One entry of a validator sample's `errors.json`.
#[derive(Debug, Deserialize)]
pub struct ExpectedValidatorError {
    pub code: String,
    pub message: String,
    #[serde(default)]
    pub start: Option<ExpectedPosition>,
    #[serde(default)]
    pub end: Option<ExpectedPosition>,
}

/// One entry of a validator sample's `warnings.json`.
#[derive(Debug, Deserialize)]
pub struct ExpectedWarning {
    pub code: String,
    pub message: String,
    pub start: ExpectedPosition,
    pub end: ExpectedPosition,
}

/// Mirrors upstream `validator/test.ts`'s ordered `assert.deepEqual` over
/// `{code, message, start, end}` warning arrays.
pub fn validator_warnings_match(
    actual: &[rsvelte_core::compiler::Warning],
    expected: &[ExpectedWarning],
) -> bool {
    actual.len() == expected.len()
        && actual.iter().zip(expected.iter()).all(|(a, e)| {
            a.code == e.code
                && strip_error_link(&a.message) == e.message
                && a.start.as_ref().is_some_and(|p| {
                    p.line as u32 == e.start.line && p.column as u32 == e.start.column
                })
                && a.end
                    .as_ref()
                    .is_some_and(|p| p.line as u32 == e.end.line && p.column as u32 == e.end.column)
        })
}

/// Human-readable actual-vs-expected listing for a failed
/// [`validator_warnings_match`].
pub fn validator_warnings_detail(
    actual: &[rsvelte_core::compiler::Warning],
    expected: &[ExpectedWarning],
) -> String {
    use std::fmt::Write as _;
    let mut detail = format!(
        "Expected {} warnings, got {}.\n",
        expected.len(),
        actual.len()
    );
    for w in actual {
        let _ = writeln!(
            detail,
            "  actual:   [{}] {} @ {:?}..{:?}",
            w.code,
            strip_error_link(&w.message),
            w.start.as_ref().map(|p| (p.line, p.column)),
            w.end.as_ref().map(|p| (p.line, p.column)),
        );
    }
    for w in expected {
        let _ = writeln!(
            detail,
            "  expected: [{}] {} @ {}:{}..{}:{}",
            w.code, w.message, w.start.line, w.start.column, w.end.line, w.end.column,
        );
    }
    detail
}

/// Read the first entry of a validator sample's `errors.json`.
///
/// Typed on purpose: an entry without a `code` must be a hard parse failure,
/// not an empty expectation that every actual error satisfies.
pub fn load_expected_validator_error(
    errors_path: &std::path::Path,
) -> Result<Option<ExpectedValidatorError>, String> {
    if !errors_path.exists() {
        return Ok(None);
    }
    let content = read_fixture_file(errors_path)
        .ok_or_else(|| format!("unreadable {}", errors_path.display()))?;
    let errors: Vec<ExpectedValidatorError> = serde_json::from_str(&content)
        .map_err(|e| format!("malformed {}: {e}", errors_path.display()))?;
    Ok(errors.into_iter().next())
}

/// Upstream `validator/test.ts::strip_link` — drop the trailing
/// `https://svelte.dev/e/<code>` line the compiler appends to every message.
pub fn strip_error_link(message: &str) -> &str {
    match message.rsplit_once('\n') {
        Some((head, tail)) if tail.starts_with("https://svelte.dev/e/") => head,
        _ => message,
    }
}

/// The `(code, message, byte_span)` carried by an rsvelte compile failure,
/// when it has one. Raw OXC parse failures carry neither; macro-routed
/// validation errors may carry a code/message without a span yet.
pub fn svelte_error_parts(err: &CompileError) -> Option<(&str, &str, Option<(u32, u32)>)> {
    match err {
        CompileError::Parse(ParseError::SvelteError {
            code,
            message,
            span,
        }) => Some((code, message, Some((span.0 as u32, span.1 as u32)))),
        CompileError::Analysis(AnalysisError::ValidationWithCode {
            code,
            message,
            start,
            end,
        }) => {
            let span = match (start, end) {
                (Some(s), Some(e)) => Some((*s, *e)),
                _ => None,
            };
            Some((code, message, span))
        }
        _ => None,
    }
}

/// Codes whose upstream fixture fails inside OXC's JavaScript parser, before
/// rsvelte can attach a Svelte code — the rendered error is a bare parse
/// failure, so only the shape of the failure can be asserted.
fn untyped_error_matches(expected_code: &str, rendered: &str) -> bool {
    matches!(
        expected_code,
        "js_parse_error" | "typescript_invalid_feature" | "unexpected_reserved_word"
    ) && rendered.contains("Parse errors")
}

/// Outcome of comparing an rsvelte compile failure with a validator fixture's
/// pinned error. The message verdict is separate from the code verdict so a
/// caller can honour [`VALIDATOR_MESSAGE_DIVERGENCES`] without weakening the
/// code check.
pub enum ValidatorErrorVerdict {
    Match,
    MessageMismatch(String),
    CodeMismatch(String),
    SpanMismatch(String),
}

/// Validator fixtures whose expected *message* is an acorn diagnostic that
/// OXC words differently. The code still has to match, and a fixture that
/// starts matching is reported as a stale entry — the list can only shrink.
pub const VALIDATOR_MESSAGE_DIVERGENCES: &[&str] = &[
    // acorn "Unexpected token" vs OXC "Identifier expected. 'case' is a reserved word …"
    "each-block-invalid-context-destructured",
    // acorn "Unexpected keyword 'case'" vs OXC "Expected `:` but found `}`"
    "each-block-invalid-context-destructured-object",
];

/// Compare a resolved `(line, column)` against the fixture's pinned position.
const fn position_matches(actual: (usize, usize), expected: &ExpectedPosition) -> bool {
    actual.0 as u32 == expected.line && actual.1 as u32 == expected.column
}

/// Compare an rsvelte compile failure against a validator fixture's pinned
/// error, upstream-style: exact code, exact message (minus the doc link), and
/// (when the fixture pins one) exact start/end position.
pub fn check_validator_error(
    expected: &ExpectedValidatorError,
    err: &CompileError,
    source: &str,
) -> ValidatorErrorVerdict {
    if let Some((code, message, span)) = svelte_error_parts(err) {
        if code != expected.code {
            return ValidatorErrorVerdict::CodeMismatch(format!(
                "Expected error code '{}', got '{}'",
                expected.code, code
            ));
        }
        let actual_message = strip_error_link(message);
        if actual_message != expected.message {
            return ValidatorErrorVerdict::MessageMismatch(format!(
                "Error message mismatch for '{}':\n  expected: {}\n  actual:   {}",
                expected.code, expected.message, actual_message
            ));
        }
        if let (Some(expected_start), Some(expected_end)) = (&expected.start, &expected.end) {
            match span {
                Some((start, end)) => {
                    let table = Utf8ToUtf16::new(source);
                    let (start_line, start_col, _) = table.position(start as usize);
                    let (end_line, end_col, _) = table.position(end as usize);
                    let start_ok = position_matches((start_line, start_col), expected_start);
                    let end_ok = position_matches((end_line, end_col), expected_end);
                    if !start_ok || !end_ok {
                        return ValidatorErrorVerdict::SpanMismatch(format!(
                            "Error span mismatch for '{}':\n  expected: {}:{}..{}:{}\n  actual:   {}:{}..{}:{}",
                            expected.code,
                            expected_start.line,
                            expected_start.column,
                            expected_end.line,
                            expected_end.column,
                            start_line,
                            start_col,
                            end_line,
                            end_col,
                        ));
                    }
                }
                None => {
                    return ValidatorErrorVerdict::SpanMismatch(format!(
                        "Error span mismatch for '{}': expected {}:{}..{}:{}, got no span",
                        expected.code,
                        expected_start.line,
                        expected_start.column,
                        expected_end.line,
                        expected_end.column,
                    ));
                }
            }
        }
        return ValidatorErrorVerdict::Match;
    }

    let rendered = format!("{err:?}");
    if untyped_error_matches(&expected.code, &rendered) {
        ValidatorErrorVerdict::Match
    } else {
        ValidatorErrorVerdict::CodeMismatch(format!(
            "Expected error code '{}', got: {rendered}",
            expected.code
        ))
    }
}

/// Resolve a verdict for `sample`, honouring the documented message
/// divergences and flagging entries that have become stale.
pub fn validator_error_result(sample: &str, verdict: ValidatorErrorVerdict) -> Result<(), String> {
    let known = VALIDATOR_MESSAGE_DIVERGENCES.contains(&sample);
    match verdict {
        ValidatorErrorVerdict::Match if known => Err(format!(
            "'{sample}' now matches upstream — remove it from VALIDATOR_MESSAGE_DIVERGENCES"
        )),
        ValidatorErrorVerdict::Match => Ok(()),
        ValidatorErrorVerdict::MessageMismatch(_) if known => Ok(()),
        ValidatorErrorVerdict::MessageMismatch(detail)
        | ValidatorErrorVerdict::CodeMismatch(detail)
        | ValidatorErrorVerdict::SpanMismatch(detail) => Err(detail),
    }
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
    pub const fn run_count(&self) -> usize {
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
    pub const fn all() -> &'static [Self] {
        &[
            Self::ParserModern,
            Self::ParserLegacy,
            Self::Snapshot,
            Self::Css,
            Self::Validator,
            Self::CompilerErrors,
            Self::RuntimeRunes,
            Self::RuntimeLegacy,
            Self::RuntimeBrowser,
            Self::Hydration,
            Self::ServerSideRendering,
            Self::Sourcemaps,
            Self::Preprocess,
            Self::Print,
            Self::Migrate,
        ]
    }

    /// Get the directory name for this category in Svelte tests.
    pub const fn svelte_dir(&self) -> &'static str {
        match self {
            Self::ParserModern => "parser-modern",
            Self::ParserLegacy => "parser-legacy",
            Self::Snapshot => "snapshot",
            Self::Css => "css",
            Self::Validator => "validator",
            Self::CompilerErrors => "compiler-errors",
            Self::RuntimeRunes => "runtime-runes",
            Self::RuntimeLegacy => "runtime-legacy",
            Self::RuntimeBrowser => "runtime-browser",
            Self::Hydration => "hydration",
            Self::ServerSideRendering => "server-side-rendering",
            Self::Sourcemaps => "sourcemaps",
            Self::Preprocess => "preprocess",
            Self::Print => "print",
            Self::Migrate => "migrate",
        }
    }

    /// Get the main input file name for this category.
    pub const fn main_file(&self) -> &'static str {
        match self {
            Self::ParserModern
            | Self::ParserLegacy
            | Self::Css
            | Self::Validator
            | Self::Sourcemaps
            | Self::Preprocess
            | Self::Print => "input.svelte",
            Self::Snapshot => "index.svelte",
            Self::CompilerErrors
            | Self::RuntimeRunes
            | Self::RuntimeLegacy
            | Self::RuntimeBrowser
            | Self::Hydration
            | Self::ServerSideRendering => "main.svelte",
            Self::Migrate => "input.svelte",
        }
    }

    /// Get human-readable display name.
    pub const fn display_name(&self) -> &'static str {
        match self {
            Self::ParserModern => "Parser (Modern)",
            Self::ParserLegacy => "Parser (Legacy)",
            Self::Snapshot => "Compiler Snapshot",
            Self::Css => "CSS Scoping",
            Self::Validator => "Validator",
            Self::CompilerErrors => "Compiler Errors",
            Self::RuntimeRunes => "Runtime (Runes)",
            Self::RuntimeLegacy => "Runtime (Legacy)",
            Self::RuntimeBrowser => "Runtime (Browser)",
            Self::Hydration => "Hydration",
            Self::ServerSideRendering => "Server-Side Rendering",
            Self::Sourcemaps => "Sourcemaps",
            Self::Preprocess => "Preprocess",
            Self::Print => "Print",
            Self::Migrate => "Migrate",
        }
    }

    /// Check if this category is currently implemented.
    pub const fn is_implemented(&self) -> bool {
        matches!(
            self,
            Self::ParserModern
                | Self::ParserLegacy
                | Self::Snapshot
                | Self::Css
                | Self::Validator
                | Self::CompilerErrors
                | Self::RuntimeRunes
                | Self::RuntimeLegacy
                | Self::RuntimeBrowser
                | Self::Hydration
                | Self::ServerSideRendering
                | Self::Sourcemaps
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
        println!("\n=== {suite} ===");
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

// The canonicalizer's contract — which differences are formatting and which are
// real — is tested once, next to the implementation, in `rsvelte_ast_equiv`.
