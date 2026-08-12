//! Shared loader for the pinned benchmark corpus.

#![allow(dead_code)]

use std::fs;
use std::path::PathBuf;

/// One benchmark input with a stable `CodSpeed` identity.
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

    pub const fn bytes(&self) -> u64 {
        self.source.len() as u64
    }
}

/// Absolute path to `<repo>/benches/corpus`.
pub fn corpus_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../..")
        .join("benches/corpus")
}

/// Load every `.svelte` fixture in deterministic filename order.
pub fn load() -> Vec<Sample> {
    let dir = corpus_dir();
    let mut entries: Vec<PathBuf> = fs::read_dir(&dir)
        .unwrap_or_else(|e| panic!("cannot read bench corpus at {}: {e}", dir.display()))
        .flatten()
        .map(|entry| entry.path())
        .filter(|path| path.extension().is_some_and(|ext| ext == "svelte"))
        .collect();
    entries.sort();

    let samples: Vec<Sample> = entries
        .into_iter()
        .map(|path| {
            let id = path
                .file_stem()
                .and_then(|stem| stem.to_str())
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
