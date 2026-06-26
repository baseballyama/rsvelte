//! Loader for the pinned, in-repo benchmark corpus at `<repo>/benches/corpus/`.
//!
//! Mirrors `crates/rsvelte_core/benches/common/corpus.rs` but without the
//! compiler-side `assert_parses` / `assert_compiles` helpers (this crate does
//! not depend on `rsvelte_core`). The corpus is committed to the repo so the
//! formatter benchmark workload stays identical across `svelte` submodule
//! bumps — see `benches/corpus/README.md`.
//!
//! Included via `#[path = "common/corpus.rs"]` so it is not itself a Cargo
//! bench target.

#![allow(dead_code)]

use std::fs;
use std::path::PathBuf;

/// One benchmark input with a **stable** identity (corpus filename stem or a
/// synthetic name). CodSpeed history is keyed on `id` — keep it stable.
pub struct Sample {
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
}

fn corpus_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../..")
        .join("benches/corpus")
}

/// Load every `.svelte` file from the pinned corpus in deterministic
/// (filename-sorted) order. Panics if the corpus is missing or empty.
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
