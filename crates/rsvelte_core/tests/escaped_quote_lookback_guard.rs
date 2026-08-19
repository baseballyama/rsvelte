//! Repo-wide guard: no scanner may decide "is this quote escaped?" with a
//! one-character lookback.
//!
//! `bytes[i - 1] != b'\\'` answers a different question than "is this quote
//! escaped": in `'\\'` the closing quote follows a *complete* `\\` escape and is
//! not escaped at all, so the scanner never closes the string and swallows
//! whatever follows. The correct predicate counts the run of preceding
//! backslashes and calls the byte escaped iff that run has odd length —
//! `rsvelte_core::compiler::utils::is_escaped` / `is_escaped_char`.
//!
//! Fixing the sites one at a time only removes the instances; this test removes
//! the *shape*, so a new scanner cannot reintroduce the class silently. Each
//! entry in `ALLOWED` is a use of the same spelling that is not a lookback and
//! needs a reason to stay.

use std::path::{Path, PathBuf};

/// Lines that spell one of the needles without being an escape lookback.
/// Keyed by repo-relative path plus the exact trimmed line.
const ALLOWED: &[(&str, &str)] = &[
    (
        "crates/rsvelte_core/src/compiler/phases/3_transform/js_ast/codegen.rs",
        r#"if b >= 0x20 && b != b'"' && b != b'\\' {"#,
    ),
    // A forward scan over the CURRENT character, not a lookback: the loop it
    // guards consumes `\\` as one two-character escape before the next
    // iteration, so the shape this test exists to remove cannot occur there.
    (
        "crates/rsvelte_lint/src/rules/consistent_selector_style.rs",
        r"if chars[i] != '\\' {",
    ),
];

/// A minimum file count, so a walk that silently reaches nothing fails instead
/// of reporting a clean tree.
const MIN_FILES_SCANNED: usize = 900;

fn repo_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .and_then(Path::parent)
        .expect("crates/<crate> has a grandparent")
        .to_path_buf()
}

/// True when a line tests a character against a backslash literal, which is the
/// only spelling a one-character lookback can take.
fn mentions_a_backslash_comparison(line: &str) -> bool {
    let trimmed = line.trim_start();
    if trimmed.starts_with("//") || trimmed.starts_with("*") {
        return false;
    }
    line.contains(r"!= '\\'") || line.contains(r"!= b'\\'")
}

fn collect_rs_files(dir: &Path, out: &mut Vec<PathBuf>) {
    let Ok(entries) = std::fs::read_dir(dir) else {
        return;
    };
    for entry in entries.flatten() {
        let path = entry.path();
        let name = entry.file_name();
        let name = name.to_string_lossy();
        if path.is_dir() {
            if name == "target" || name == "node_modules" || name == ".git" {
                continue;
            }
            collect_rs_files(&path, out);
        } else if name.ends_with(".rs") {
            out.push(path);
        }
    }
}

#[test]
fn no_scanner_tests_for_an_escaped_quote_with_a_one_character_lookback() {
    let root = repo_root();
    let mut files = Vec::new();
    for sub in ["crates", "apps"] {
        collect_rs_files(&root.join(sub), &mut files);
    }
    files.sort();

    let this_file = Path::new(file!())
        .file_name()
        .map(|n| n.to_string_lossy().into_owned())
        .unwrap_or_default();

    let mut scanned = 0usize;
    let mut violations = Vec::new();
    for path in &files {
        if path
            .file_name()
            .is_some_and(|n| n.to_string_lossy() == this_file)
        {
            continue;
        }
        let Ok(text) = std::fs::read_to_string(path) else {
            continue;
        };
        scanned += 1;
        let rel = path
            .strip_prefix(&root)
            .unwrap_or(path)
            .to_string_lossy()
            .replace('\\', "/");
        for (n, line) in text.lines().enumerate() {
            if !mentions_a_backslash_comparison(line) {
                continue;
            }
            let trimmed = line.trim();
            if ALLOWED
                .iter()
                .any(|(f, l)| *f == rel.as_str() && *l == trimmed)
            {
                continue;
            }
            violations.push(format!("{rel}:{}: {trimmed}", n + 1));
        }
    }

    assert!(
        scanned >= MIN_FILES_SCANNED,
        "only {scanned} Rust files scanned (expected at least {MIN_FILES_SCANNED}); \
         the walk is broken, so an empty result means nothing"
    );
    assert!(
        violations.is_empty(),
        "{} site(s) compare a character against a backslash outside \
         `compiler::utils::is_escaped`/`is_escaped_char`. A one-character lookback \
         misreads `'\\\\'`, where the closing quote follows a complete escape. Use the \
         helper, or add the line to ALLOWED with a reason if it is not a lookback:\n{}",
        violations.len(),
        violations.join("\n")
    );
}

/// Positive control: the detector must fire on the shape it exists to forbid,
/// and stay quiet on a doc comment describing it.
#[test]
fn the_detector_fires_on_the_forbidden_shape() {
    assert!(mentions_a_backslash_comparison(
        r"        if c == quote && (i == 0 || bytes[i - 1] != b'\\') {"
    ));
    assert!(mentions_a_backslash_comparison(
        r"            if c == q && (i == 0 || chars[i - 1] != '\\') {"
    ));
    assert!(!mentions_a_backslash_comparison(
        r"/// `bytes[i - 1] != b'\\'` is a different test."
    ));
    assert!(!mentions_a_backslash_comparison(
        r"        if c == quote && !is_escaped(bytes, i) {"
    ));
}
