//! The configuration loaders' integration tests, in one binary.

use std::path::PathBuf;
use std::sync::atomic::{AtomicUsize, Ordering};

mod backends;
mod isolation;

/// A fresh temporary directory, removed when dropped.
struct Directory(PathBuf);

impl Directory {
    fn new() -> Self {
        static NEXT: AtomicUsize = AtomicUsize::new(0);
        let path = std::env::temp_dir().join(format!(
            "rsvelte-config-{}-{}",
            std::process::id(),
            NEXT.fetch_add(1, Ordering::Relaxed)
        ));
        std::fs::create_dir_all(&path).expect("create test directory");
        Self(path)
    }

    fn write(&self, filename: &str, text: &str) -> PathBuf {
        let path = self.0.join(filename);
        std::fs::write(&path, text).expect("write test input");
        path
    }
}

impl Drop for Directory {
    fn drop(&mut self) {
        std::fs::remove_dir_all(&self.0).expect("remove test directory");
    }
}
