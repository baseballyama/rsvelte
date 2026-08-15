//! A `grass` filesystem that records the files it loads.
//!
//! `grass` resolves `@use` / `@import` internally and reports nothing about it,
//! so the only way to learn which partials a block depends on — and therefore
//! which files a watcher has to watch — is to observe the reads.

use std::io;
use std::path::{Path, PathBuf};
use std::sync::Mutex;

#[derive(Debug, Default)]
pub(crate) struct RecordingFs {
    loaded: Mutex<Vec<PathBuf>>,
}

impl RecordingFs {
    /// The files loaded so far, absolute where the path could be resolved,
    /// sorted and deduplicated.
    pub(crate) fn dependencies(&self) -> Vec<String> {
        let Ok(loaded) = self.loaded.lock() else {
            return Vec::new();
        };
        let mut paths: Vec<String> = loaded
            .iter()
            .map(|path| path.to_string_lossy().into_owned())
            .collect();
        paths.sort();
        paths.dedup();
        paths
    }
}

impl grass::Fs for RecordingFs {
    fn is_dir(&self, path: &Path) -> bool {
        path.is_dir()
    }

    fn is_file(&self, path: &Path) -> bool {
        path.is_file()
    }

    fn read(&self, path: &Path) -> io::Result<Vec<u8>> {
        let contents = std::fs::read(path)?;
        if let Ok(mut loaded) = self.loaded.lock() {
            loaded.push(std::fs::canonicalize(path).unwrap_or_else(|_| path.to_path_buf()));
        }
        Ok(contents)
    }

    fn canonicalize(&self, path: &Path) -> io::Result<PathBuf> {
        std::fs::canonicalize(path)
    }
}
