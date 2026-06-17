//! Port of esrap's own sample-snapshot suite (`submodules/esrap/test/esrap.test.js`).
//!
//! For every directory under `submodules/esrap/test/samples/`, esrap parses
//! `input.<ext>` and asserts the printed `code` equals the committed
//! `expected.<ext>` snapshot (which esrap itself produced from the acorn
//! baseline). We reproduce that here: parse with oxc, print with
//! `rsvelte_esrap`, and assert byte-identity against the same `expected.<ext>`.
//!
//! The comparison mirrors esrap's snapshot normalization
//! (`code.trim().replace(/^\t+$/gm, '').replaceAll('\r', '')`).
//!
//! Coverage is ratcheted: [`KNOWN_FAILURES`] lists the samples not yet
//! byte-identical. A listed sample that now matches, or an unlisted sample that
//! mismatches, fails the suite — so the list can only shrink. The end state is
//! an empty list (total coverage). The suite no-ops with a notice when the
//! `esrap` submodule is absent (mirroring the other corpus suites).

/// Samples not yet byte-identical. Drive this to empty.
const KNOWN_FAILURES: &[&str] = &[
    "jsx-basic",
    // oxc preserves explicit `ParenthesizedExpression` nodes that acorn (esrap's
    // baseline) elides, so esrap's redundant-paren stripping around an
    // `as`/`satisfies` operand (`(0 as number) + 1` → `0 as number + 1`,
    // `() => ({ x }) as const` → `() => ({ x } as const)`) can't be reproduced
    // without dropping source parens — a printer-wide change the golden corpus
    // depends on not making.
    "ts-arrow-as-const-object",
    "ts-as-precedence",
];

use std::path::{Path, PathBuf};

use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;

fn samples_dir() -> Option<PathBuf> {
    let dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("../../submodules/esrap/test/samples");
    dir.is_dir().then_some(dir)
}

/// esrap's snapshot normalization: trim, blank out whitespace-only lines, drop `\r`.
fn normalize(s: &str) -> String {
    let no_cr = s.replace('\r', "");
    let blanked: Vec<String> = no_cr
        .lines()
        .map(|line| {
            if !line.is_empty() && line.chars().all(|c| c == '\t') {
                String::new()
            } else {
                line.to_string()
            }
        })
        .collect();
    blanked.join("\n").trim().to_string()
}

struct Sample {
    name: String,
    source: String,
    expected: String,
    source_type: SourceType,
}

fn collect_samples(dir: &Path) -> Vec<Sample> {
    let mut dirs: Vec<PathBuf> = std::fs::read_dir(dir)
        .unwrap()
        .flatten()
        .map(|e| e.path())
        .filter(|p| p.is_dir())
        .collect();
    dirs.sort();

    let mut out = Vec::new();
    for d in dirs {
        let name = d.file_name().unwrap().to_string_lossy().to_string();
        if name.contains("large-file") || name.starts_with('.') {
            continue;
        }
        let ts_mode = name.starts_with("ts-") || name.starts_with("tsx-");
        let jsx_mode = name.starts_with("jsx-") || name.starts_with("tsx-");
        let ext = format!(
            "{}{}",
            if ts_mode { "ts" } else { "js" },
            if jsx_mode { "x" } else { "" }
        );

        // The `with` sample ships an `input.json` (a pre-built AST) because
        // `with` is a syntax error in modules; the equivalent script source is
        // re-parsed here.
        let input_path = d.join(format!("input.{ext}"));
        let (source, source_type) = if input_path.exists() {
            let st = SourceType::default()
                .with_module(true)
                .with_typescript(ts_mode)
                .with_jsx(jsx_mode);
            (std::fs::read_to_string(&input_path).unwrap(), st)
        } else if d.join("input.json").exists() && name == "with" {
            (
                "with (foo) bar();".to_string(),
                SourceType::default().with_script(true),
            )
        } else {
            continue;
        };

        let expected_path = d.join(format!("expected.{ext}"));
        if !expected_path.exists() {
            continue;
        }
        let expected = std::fs::read_to_string(&expected_path).unwrap();
        out.push(Sample {
            name,
            source,
            expected,
            source_type,
        });
    }
    out
}

#[test]
fn esrap_samples_match() {
    let Some(dir) = samples_dir() else {
        eprintln!("[esrap_samples] submodules/esrap absent — skipping");
        return;
    };

    let verbose = std::env::var("ESRAP_SAMPLES_VERBOSE").is_ok();
    let only = std::env::var("ESRAP_SAMPLES_ONLY").ok();

    let mut unexpected_fail = Vec::new();
    let mut unexpected_pass = Vec::new();
    let mut passed = 0;
    let samples = collect_samples(&dir);
    let total = samples.len();

    for sample in &samples {
        if let Some(only) = &only
            && &sample.name != only
        {
            continue;
        }
        let known = KNOWN_FAILURES.contains(&sample.name.as_str());
        let alloc = Allocator::default();
        let ret = Parser::new(&alloc, &sample.source, sample.source_type).parse();
        let matched = if !ret.diagnostics.is_empty() {
            if verbose {
                eprintln!(
                    "[parse-error] {}: {}",
                    sample.name,
                    ret.diagnostics
                        .first()
                        .map(|d| d.message.to_string())
                        .unwrap_or_default()
                );
            }
            false
        } else {
            let out = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
                rsvelte_esrap::print(&ret.program, &sample.source)
            }));
            match out {
                Ok(s) => {
                    let m = normalize(&s) == normalize(&sample.expected);
                    if !m && verbose {
                        eprintln!(
                            "===== {} =====\n--- expected ---\n{}\n--- got ---\n{}\n",
                            sample.name, sample.expected, s
                        );
                    }
                    m
                }
                Err(_) => {
                    if verbose {
                        eprintln!("[panic] {}", sample.name);
                    }
                    false
                }
            }
        };

        if matched {
            passed += 1;
            if known {
                unexpected_pass.push(sample.name.clone());
            }
        } else if !known {
            unexpected_fail.push(sample.name.clone());
        }
    }

    eprintln!(
        "[esrap_samples] {passed}/{total} matched ({} known-failing)",
        KNOWN_FAILURES.len()
    );

    use std::fmt::Write as _;
    let mut msg = String::new();
    if !unexpected_fail.is_empty() {
        let _ = writeln!(
            msg,
            "newly-failing (fix or add to KNOWN_FAILURES): {unexpected_fail:?}"
        );
    }
    if !unexpected_pass.is_empty() {
        let _ = writeln!(
            msg,
            "now passing — remove from KNOWN_FAILURES: {unexpected_pass:?}"
        );
    }
    assert!(msg.is_empty(), "{msg}");
}
