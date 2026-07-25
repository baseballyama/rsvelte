//! Document formatting, run in process through `rsvelte_fmt`'s pipeline.

use std::collections::HashMap;
use std::path::{Path, PathBuf};

use anyhow::Result;
use rsvelte_fmt::FormatSession;

/// Formatting sessions keyed by the document's directory. Building one
/// discovers the project's oxfmt config (a walk to the filesystem root plus a
/// parse), so it is reused across every document that shares a directory.
#[derive(Default)]
pub struct FormatSessions {
    by_dir: HashMap<PathBuf, FormatSession>,
}

impl FormatSessions {
    pub fn get(&mut self, path: &Path) -> Result<&FormatSession> {
        let dir = path.parent().unwrap_or(Path::new(".")).to_path_buf();
        if !self.by_dir.contains_key(&dir) {
            self.by_dir
                .insert(dir.clone(), FormatSession::resolve(path)?);
        }
        Ok(&self.by_dir[&dir])
    }

    pub fn clear(&mut self) {
        self.by_dir.clear();
    }
}
