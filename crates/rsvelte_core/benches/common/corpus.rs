//! Loader for the pinned, in-repo benchmark corpus at `<repo>/benches/corpus/`.
//!
//! The corpus is committed to the repo (never read from the `svelte`
//! submodule) so the benchmark workload is byte-identical on every branch and
//! survives submodule bumps — a precondition for CodSpeed's per-benchmark
//! regression diff to mean anything. See `benches/corpus/README.md`.
//!
//! This module is included into each bench via `#[path = "common/corpus.rs"]`
//! so it is not itself picked up as a Cargo bench target.

// Each bench includes this module separately and uses a different subset of
// the API (e.g. `parser` doesn't touch the synthetic / assert helpers), so
// per-bench dead-code warnings are expected and benign.
#![allow(dead_code)]

use std::fs;
use std::path::PathBuf;

/// One benchmark input with a **stable** identity.
pub struct Sample {
    /// Stable benchmark ID (corpus filename stem, or a synthetic name).
    /// CodSpeed history is keyed on this — keep it stable.
    pub id: String,
    pub source: String,
}

impl Sample {
    pub fn synthetic(id: &str, source: String) -> Self {
        Self {
            id: id.to_string(),
            source,
        }
    }

    pub fn bytes(&self) -> u64 {
        self.source.len() as u64
    }

    /// Assert the sample parses — fail loudly if a corpus fixture goes stale,
    /// so the workload never silently shrinks via skipped inputs.
    pub fn assert_parses(&self) {
        use rsvelte_core::compiler::phases::phase1_parse::{ParseOptions, parse};
        let opts = ParseOptions {
            modern: true,
            loose: false,
            ..Default::default()
        };
        assert!(
            parse(&self.source, opts).is_ok(),
            "bench corpus sample `{}` failed to parse",
            self.id
        );
    }

    /// Assert the sample compiles (client mode) — same intent as
    /// [`assert_parses`], one level deeper.
    pub fn assert_compiles(&self) {
        use rsvelte_core::{CompileOptions, GenerateMode, compile};
        assert!(
            compile(
                &self.source,
                CompileOptions {
                    generate: GenerateMode::Client,
                    ..Default::default()
                },
            )
            .is_ok(),
            "bench corpus sample `{}` failed to compile",
            self.id
        );
    }
}

/// Absolute path to the pinned corpus directory (`<repo>/benches/corpus`).
fn corpus_dir() -> PathBuf {
    // CARGO_MANIFEST_DIR is the crate root (`crates/<crate>`); the corpus
    // lives two levels up at the repo root.
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../..")
        .join("benches/corpus")
}

/// Load every `.svelte` file from the pinned corpus in deterministic order
/// (sorted by filename — the numeric prefix gives a stable, reviewable order).
///
/// Panics if the corpus is missing or empty: a benchmark with no inputs is a
/// silent no-op, which is exactly the failure mode this redesign removes.
pub fn load() -> Vec<Sample> {
    let dir = corpus_dir();
    let mut entries: Vec<PathBuf> = fs::read_dir(&dir)
        .unwrap_or_else(|e| panic!("cannot read bench corpus at {}: {e}", dir.display()))
        .flatten()
        .map(|e| e.path())
        .filter(|p| p.extension().is_some_and(|ext| ext == "svelte"))
        .collect();

    entries.sort();

    let samples: Vec<Sample> = entries
        .into_iter()
        .map(|path| {
            let id = path
                .file_stem()
                .and_then(|s| s.to_str())
                .expect("corpus filename is valid UTF-8")
                .to_string();
            let source = fs::read_to_string(&path)
                .unwrap_or_else(|e| panic!("cannot read corpus file {}: {e}", path.display()));
            Sample { id, source }
        })
        .collect();

    assert!(
        !samples.is_empty(),
        "bench corpus at {} is empty",
        dir.display()
    );

    samples
}
