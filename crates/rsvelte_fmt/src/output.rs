use std::io;
use std::path::Path;
use std::sync::atomic::{AtomicU64, Ordering};

use anyhow::{Context, Result};

use crate::status::Mode;

/// Write `data` to `path` atomically: stage it in a uniquely-named temp file in
/// the same directory, then `rename` it into place. A plain `fs::write`
/// truncates the target up front, so a crash or a concurrent reader can observe
/// a half-written (or empty) file; the rename swap is atomic and same-directory
/// (guaranteed same filesystem). Same approach as the `<style>` cache.
pub(crate) fn write_atomic(path: &Path, data: impl AsRef<[u8]>) -> io::Result<()> {
    let dir = path.parent().filter(|p| !p.as_os_str().is_empty());
    let dir = dir.unwrap_or_else(|| Path::new("."));
    let name = path
        .file_name()
        .map(|n| n.to_string_lossy())
        .unwrap_or_default();
    let tmp = dir.join(format!(".{name}.rsvelte-fmt-tmp{}", next_tmp_id()));
    if let Err(e) = std::fs::write(&tmp, data) {
        let _ = std::fs::remove_file(&tmp);
        return Err(e);
    }
    if let Err(e) = std::fs::rename(&tmp, path) {
        let _ = std::fs::remove_file(&tmp);
        return Err(e);
    }
    Ok(())
}

/// Process-unique temp-file suffix (PID high bits + a monotonic counter) so
/// concurrent atomic writes never collide on a staging path.
fn next_tmp_id() -> u64 {
    static COUNTER: AtomicU64 = AtomicU64::new(0);
    let n = COUNTER.fetch_add(1, Ordering::Relaxed);
    ((std::process::id() as u64) << 32) | n
}

/// Write `formatted` back to `path` (write mode) or report it (check mode).
/// Returns whether the file would change.
pub(crate) fn apply_output(path: &Path, source: &str, formatted: &str, mode: Mode) -> Result<bool> {
    if formatted == source {
        return Ok(false);
    }
    match mode {
        Mode::Write => {
            write_atomic(path, formatted).with_context(|| format!("writing {}", path.display()))?;
            Ok(true)
        }
        Mode::Check => {
            println!("would format {}", path.display());
            Ok(true)
        }
    }
}
