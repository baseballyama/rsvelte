//! Content-addressed cache for formatted `<style>` blocks.
//!
//! Delegating inline CSS to `oxfmt` is the dominant cost of formatting a real
//! `.svelte` tree (staging temp files + the oxfmt round-trip — see #703). Most
//! `<style>` bodies are already in canonical form on a re-run (or unchanged
//! between runs), so re-formatting them is wasted work.
//!
//! This cache stores each formatted result keyed by a hash of everything that
//! determines the output — the oxfmt version, the resolved `.oxfmtrc` bytes,
//! the `<style>` language, and the exact body. On a hit we reuse the stored
//! bytes and skip oxfmt entirely; on a miss we format and write the result.
//! Because the key covers every determinant, a hit is byte-identical to what
//! oxfmt would produce, so output parity is preserved. Any change to the body,
//! language, config, or oxfmt version yields a different key (a clean miss),
//! and stale entries are simply never looked up again.

use std::hash::{Hash, Hasher};
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU64, Ordering};

/// Everything needed to look up / store formatted `<style>` bodies for one run.
pub(crate) struct StyleCache {
    dir: PathBuf,
    /// Stable per-run prefix mixed into every key: `oxfmt` version + the
    /// resolved config bytes. Computed once so per-block keying is cheap.
    salt: Vec<u8>,
}

impl StyleCache {
    /// Build the cache context for a run, or `None` when caching is disabled
    /// (no resolvable cache dir, or `RSVELTE_FMT_NO_CACHE` is set). `config`
    /// is the resolved `.oxfmtrc` path forced onto every oxfmt invocation; its
    /// bytes go into the key so a config change invalidates cleanly.
    pub(crate) fn new(oxfmt: &Path, config: Option<&Path>) -> Option<Self> {
        if env_disabled() {
            return None;
        }
        let dir = cache_dir()?;

        let mut salt = Vec::new();
        // oxfmt identity — different engines can format the same CSS differently,
        // so a version change must invalidate. Fingerprint the binary by
        // path+size+mtime (spawn-free; an npm reinstall of a new version changes
        // size/mtime), falling back to `oxfmt --version` only when the path
        // can't be stat'd (a bare `$PATH` command).
        salt.extend_from_slice(&oxfmt_fingerprint(oxfmt));
        salt.push(0);
        // Resolved config bytes (or empty when none). Read failures fall back
        // to empty, which only over-shares between "no config" and an unreadable
        // config — both deterministic for this run.
        if let Some(c) = config
            && let Ok(bytes) = std::fs::read(c)
        {
            salt.extend_from_slice(&bytes);
        }
        salt.push(0);

        Some(StyleCache { dir, salt })
    }

    /// Look up the formatted form of `(body, lang, width)`. Returns the cached
    /// bytes on a hit, `None` on a miss. The width is part of the key because the
    /// same body wraps differently when narrowed to a different column.
    pub(crate) fn get(&self, body: &str, lang: &str, width: usize) -> Option<String> {
        let key = self.key(body, lang, width);
        std::fs::read_to_string(self.path_for(&key)).ok()
    }

    /// Store `formatted` as the canonical form of `(body, lang, width)`.
    /// Best-effort: any I/O error is ignored (the cache is purely an optimization).
    pub(crate) fn put(&self, body: &str, lang: &str, width: usize, formatted: &str) {
        let key = self.key(body, lang, width);
        let path = self.path_for(&key);
        if let Some(parent) = path.parent()
            && std::fs::create_dir_all(parent).is_err()
        {
            return;
        }
        // Atomic write: a torn read of a partially-written entry would corrupt
        // output, so write to a unique temp file and rename into place.
        let tmp = path.with_extension(format!("tmp{}", next_tmp_id()));
        if std::fs::write(&tmp, formatted.as_bytes()).is_ok()
            && std::fs::rename(&tmp, &path).is_err()
        {
            let _ = std::fs::remove_file(&tmp);
        }
    }

    /// 128-bit content key as hex (two SipHashes with distinct salts —
    /// collision probability is astronomically small for content addressing,
    /// and a key only needs to be stable within a single binary build).
    fn key(&self, body: &str, lang: &str, width: usize) -> String {
        let h0 = hash_parts(0xA5, &self.salt, lang, body, width);
        let h1 = hash_parts(0x5A, &self.salt, lang, body, width);
        format!("{h0:016x}{h1:016x}")
    }

    /// Shard by the first two hex chars to keep any single directory small.
    fn path_for(&self, key: &str) -> PathBuf {
        self.dir.join(&key[..2]).join(key)
    }
}

fn hash_parts(salt_byte: u8, run_salt: &[u8], lang: &str, body: &str, width: usize) -> u64 {
    let mut h = std::collections::hash_map::DefaultHasher::new();
    // `Hash` for slices/strings writes a length prefix, so the parts are
    // unambiguously delimited (no concatenation collisions).
    salt_byte.hash(&mut h);
    run_salt.hash(&mut h);
    lang.hash(&mut h);
    body.hash(&mut h);
    width.hash(&mut h);
    h.finish()
}

/// `true` when the user opted out via `RSVELTE_FMT_NO_CACHE`.
fn env_disabled() -> bool {
    std::env::var_os("RSVELTE_FMT_NO_CACHE")
        .map(|v| !v.is_empty() && v != "0")
        .unwrap_or(false)
}

/// Resolve the cache root, honoring `RSVELTE_FMT_CACHE_DIR`, then the platform
/// cache conventions. Returns `None` only when no location can be derived
/// (caching is then disabled).
fn cache_dir() -> Option<PathBuf> {
    fn non_empty(key: &str) -> Option<PathBuf> {
        std::env::var_os(key)
            .filter(|v| !v.is_empty())
            .map(PathBuf::from)
    }
    if let Some(d) = non_empty("RSVELTE_FMT_CACHE_DIR") {
        return Some(d.join("styles"));
    }
    if let Some(d) = non_empty("XDG_CACHE_HOME") {
        return Some(d.join("rsvelte-fmt").join("styles"));
    }
    if let Some(d) = non_empty("LOCALAPPDATA") {
        return Some(d.join("rsvelte-fmt").join("cache").join("styles"));
    }
    let home = non_empty("HOME").or_else(|| non_empty("USERPROFILE"))?;
    Some(home.join(".cache").join("rsvelte-fmt").join("styles"))
}

/// Fingerprint the oxfmt engine so a version change invalidates the cache.
///
/// Prefer a spawn-free stat of the binary (path + size + mtime) — `fs::metadata`
/// follows the `node_modules/.bin/oxfmt` symlink to its real target, whose size
/// and mtime change when a new version is installed. Only when the path can't be
/// stat'd (e.g. a bare `oxfmt` resolved via `$PATH`) do we fall back to the
/// `oxfmt --version` spawn, since otherwise the key couldn't detect an upgrade.
fn oxfmt_fingerprint(oxfmt: &Path) -> Vec<u8> {
    let mut fp = oxfmt.to_string_lossy().into_owned().into_bytes();
    if let Ok(md) = std::fs::metadata(oxfmt) {
        fp.extend_from_slice(&md.len().to_le_bytes());
        if let Ok(mtime) = md.modified()
            && let Ok(dur) = mtime.duration_since(std::time::UNIX_EPOCH)
        {
            fp.extend_from_slice(&dur.as_nanos().to_le_bytes());
        }
        return fp;
    }
    // Path not directly stat-able — spawn `--version` as a fallback.
    if let Ok(out) = crate::oxfmt_command(oxfmt).arg("--version").output()
        && out.status.success()
    {
        fp.extend_from_slice(out.stdout.trim_ascii());
    }
    fp
}

fn next_tmp_id() -> u64 {
    static COUNTER: AtomicU64 = AtomicU64::new(0);
    let n = COUNTER.fetch_add(1, Ordering::Relaxed);
    ((std::process::id() as u64) << 32) | n
}
