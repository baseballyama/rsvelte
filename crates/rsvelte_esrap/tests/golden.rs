//! Conformance harness for the esrap port.
//!
//! The official Svelte compiler prints its output with esrap, so its committed
//! snapshot outputs (`tests/snapshot/samples/*/_expected/**/*.svelte.js`) are an
//! exact oracle for this crate: parse one with oxc, re-print it, and the bytes
//! must match. Coverage is incremental, so this test does not require every file
//! to round-trip — it reports two rates and ratchets a floor so coverage can
//! only grow:
//!
//! - **coverage** — files printed without hitting an unsupported node, and
//! - **exact** — files whose re-print is byte-identical to esrap's.
//!
//! Set `ESRAP_GOLDEN_VERBOSE=1` to print a sample of the remaining misses while
//! expanding visitor coverage.

use std::path::{Path, PathBuf};

use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_esrap::printer::Printer;
use rsvelte_esrap::{PrintOptions, command, context::Context};

/// The exact-match floor. Raise this as visitor coverage grows; CI fails if a
/// change drops below it, so the printer can only get more conformant.
const EXACT_FLOOR: usize = 0;

fn samples_dir() -> Option<PathBuf> {
    let dir = Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("../../submodules/svelte/packages/svelte/tests/snapshot/samples");
    dir.is_dir().then_some(dir)
}

fn collect_expected(dir: &Path) -> Vec<PathBuf> {
    let mut out = Vec::new();
    let mut stack = vec![dir.to_path_buf()];
    while let Some(d) = stack.pop() {
        let Ok(entries) = std::fs::read_dir(&d) else {
            continue;
        };
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                stack.push(path);
            } else if path.extension().is_some_and(|e| e == "js")
                && path.to_string_lossy().contains("_expected")
            {
                out.push(path);
            }
        }
    }
    out.sort();
    out
}

struct Reprint {
    output: String,
    missing: Option<String>,
}

fn reprint(source: &str) -> Option<Reprint> {
    let allocator = Allocator::default();
    let ret = Parser::new(&allocator, source, SourceType::mjs()).parse();
    if !ret.diagnostics.is_empty() {
        return None; // not parseable as a module — skip (e.g. TS-only constructs)
    }
    let opts = PrintOptions::default();
    let mut printer = Printer::new(&opts);
    let mut ctx = Context::new();
    printer.print_program(&ret.program, &mut ctx);
    Some(Reprint {
        output: command::print(&ctx.into_commands(), &opts.indent),
        missing: printer.missing.map(|m| m.0.to_string()),
    })
}

// `EXACT_FLOOR` is intentionally 0 today (visitor coverage is nascent), so the
// ratchet comparison is trivially true; the allow keeps the floor a single knob
// to raise as coverage lands rather than restructuring the guard.
#[allow(clippy::absurd_extreme_comparisons)]
#[test]
fn golden_roundtrip_ratchet() {
    let Some(dir) = samples_dir() else {
        eprintln!("snapshot samples not found (submodule not initialised); skipping golden test");
        return;
    };

    let files = collect_expected(&dir);
    let total = files.len();
    let mut parseable = 0usize;
    let mut covered = 0usize;
    let mut exact = 0usize;
    let mut miss_kinds: std::collections::BTreeMap<String, usize> = Default::default();
    let mut sample_diffs: Vec<String> = Vec::new();
    let verbose = std::env::var("ESRAP_GOLDEN_VERBOSE").is_ok();

    for path in &files {
        let Ok(source) = std::fs::read_to_string(path) else {
            continue;
        };
        let Some(result) = reprint(&source) else {
            continue;
        };
        parseable += 1;

        match &result.missing {
            Some(kind) => *miss_kinds.entry(kind.clone()).or_default() += 1,
            None => {
                covered += 1;
                if result.output == source {
                    exact += 1;
                } else if verbose && sample_diffs.len() < 5 {
                    sample_diffs.push(format!(
                        "DIFF {}\n  expected: {:?}\n  actual:   {:?}",
                        path.strip_prefix(&dir).unwrap_or(path).display(),
                        first_diff_window(&source, &result.output).0,
                        first_diff_window(&source, &result.output).1,
                    ));
                }
            }
        }
    }

    eprintln!(
        "esrap golden: {total} files | {parseable} parseable | {covered} covered (no unsupported node) | {exact} byte-exact"
    );
    if !miss_kinds.is_empty() {
        let mut kinds: Vec<_> = miss_kinds.iter().collect();
        kinds.sort_by(|a, b| b.1.cmp(a.1));
        eprintln!(
            "  top unsupported nodes: {:?}",
            &kinds[..kinds.len().min(10)]
        );
    }
    for d in &sample_diffs {
        eprintln!("{d}");
    }

    // Ratchet: once coverage produces byte-exact files, raise EXACT_FLOOR so a
    // regression fails CI. While the floor is 0 there is nothing to assert.
    if EXACT_FLOOR > 0 {
        assert!(
            exact >= EXACT_FLOOR,
            "esrap golden exact-match count {exact} dropped below floor {EXACT_FLOOR}"
        );
    }
}

/// A small window around the first byte difference, for readable diffs.
fn first_diff_window(a: &str, b: &str) -> (String, String) {
    let i = a
        .bytes()
        .zip(b.bytes())
        .position(|(x, y)| x != y)
        .unwrap_or(a.len().min(b.len()));
    let start = i.saturating_sub(20);
    let win = |s: &str| {
        let end = (i + 20).min(s.len());
        s.get(start..end).unwrap_or("").to_string()
    };
    (win(a), win(b))
}
