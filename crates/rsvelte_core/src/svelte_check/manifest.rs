//! Incremental-build manifest. Persisted at
//! `<cacheDir>/manifest.json` (alongside the overlay tsconfig) and used
//! by `super::overlay::materialize_overlay` to skip rewriting `.tsx`
//! shadows when the source `.svelte` hasn't changed since the last run.
//!
//! Mirrors `submodules/language-tools/packages/svelte-check/src/incremental.ts`:
//!   * `loadManifest` / `writeManifest` round-trip via relative paths so
//!     a checked-in or cached manifest stays portable across machines.
//!   * `pruneDeletedManifestEntries` drops entries whose source has been
//!     removed from disk (and unlinks the now-orphaned `.tsx` / `.d.ts`).
//!
//! The current cache key is `(mtime_ms, size)`, identical to the JS
//! reference. The version constant must be bumped whenever the on-disk
//! schema changes — readers treat unknown versions as "no cache".

use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::SystemTime;

use serde::{Deserialize, Serialize};

use super::diagnostic::{Diagnostic, DiagnosticSeverity, Range};

/// On-disk schema version. Bump on any breaking change.
pub const MANIFEST_VERSION: u32 = 1;

/// Sidecar cache of per-file `Diagnostic`s, persisted alongside the
/// overlay manifest at `<cacheDir>/warnings.json`. On the next
/// incremental run, files whose `(mtime_ms, size)` matches the cached
/// stats skip recompilation and emit the cached diagnostics directly,
/// so warnings persist across runs (matching the JS reference's
/// `--incremental` behaviour).
pub const WARNINGS_VERSION: u32 = 1;

/// One cached entry per `.svelte` source. Keyed in `Manifest::entries`
/// by the absolute path to the source `.svelte` file.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ManifestEntry {
    /// Absolute path to the original `.svelte` file.
    pub source_path: PathBuf,
    /// Absolute path to the emitted `.tsx` shadow.
    pub out_path: PathBuf,
    /// Absolute path to the emitted `.d.ts` re-export shim.
    pub dts_path: PathBuf,
    /// `mtime` of `source_path` in milliseconds since UNIX epoch (the
    /// fractional part is discarded — JS only persists `mtimeMs` to the
    /// integer ms anyway, and that's enough resolution for our needs).
    pub mtime_ms: i64,
    /// `len()` of `source_path`.
    pub size: u64,
    /// Was the `.svelte`'s `<script>` `lang="ts"` at the time of the
    /// last emit? Cached so we don't have to re-read the source file
    /// just to decide whether to pass `isTsFile=true` to svelte2tsx.
    pub is_ts_file: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Manifest {
    pub version: u32,
    /// Keyed by absolute source path while in memory; serialised with
    /// workspace-relative paths via [`save`] / [`load`] so the file is
    /// portable across machines.
    pub entries: HashMap<PathBuf, ManifestEntry>,
}

impl Manifest {
    pub fn empty() -> Self {
        Self {
            version: MANIFEST_VERSION,
            entries: HashMap::new(),
        }
    }
}

/// Load a manifest from disk, returning an empty manifest if the file
/// is missing, malformed, or stamped with a different schema version.
/// All paths are resolved to absolute via `workspace`.
pub fn load(manifest_path: &Path, workspace: &Path) -> Manifest {
    let Ok(text) = fs::read_to_string(manifest_path) else {
        return Manifest::empty();
    };
    #[derive(Deserialize)]
    struct OnDiskManifest {
        version: u32,
        #[serde(default)]
        entries: HashMap<String, OnDiskEntry>,
    }
    #[derive(Deserialize)]
    struct OnDiskEntry {
        #[serde(default)]
        source_path: String,
        #[serde(default)]
        out_path: String,
        #[serde(default)]
        dts_path: String,
        #[serde(default)]
        mtime_ms: i64,
        #[serde(default)]
        size: u64,
        #[serde(default)]
        is_ts_file: bool,
    }
    let parsed: OnDiskManifest = match serde_json::from_str(&text) {
        Ok(v) => v,
        Err(_) => return Manifest::empty(),
    };
    if parsed.version != MANIFEST_VERSION {
        return Manifest::empty();
    }
    let mut entries = HashMap::with_capacity(parsed.entries.len());
    for (key, raw) in parsed.entries {
        let key_abs = absolutize(workspace, Path::new(&key));
        entries.insert(
            key_abs,
            ManifestEntry {
                source_path: absolutize(workspace, Path::new(&raw.source_path)),
                out_path: absolutize(workspace, Path::new(&raw.out_path)),
                dts_path: absolutize(workspace, Path::new(&raw.dts_path)),
                mtime_ms: raw.mtime_ms,
                size: raw.size,
                is_ts_file: raw.is_ts_file,
            },
        );
    }
    Manifest {
        version: parsed.version,
        entries,
    }
}

/// Persist `manifest` to disk. All absolute paths in entries are
/// converted to workspace-relative POSIX strings so the manifest stays
/// portable. The parent directory is created if missing.
pub fn save(manifest_path: &Path, manifest: &Manifest, workspace: &Path) -> std::io::Result<()> {
    if let Some(parent) = manifest_path.parent() {
        fs::create_dir_all(parent)?;
    }
    #[derive(Serialize)]
    struct OnDiskManifest {
        version: u32,
        entries: HashMap<String, OnDiskEntry>,
    }
    #[derive(Serialize)]
    struct OnDiskEntry {
        source_path: String,
        out_path: String,
        dts_path: String,
        mtime_ms: i64,
        size: u64,
        is_ts_file: bool,
    }
    let mut out_entries: HashMap<String, OnDiskEntry> =
        HashMap::with_capacity(manifest.entries.len());
    for (key, entry) in &manifest.entries {
        out_entries.insert(
            relativize(workspace, key),
            OnDiskEntry {
                source_path: relativize(workspace, &entry.source_path),
                out_path: relativize(workspace, &entry.out_path),
                dts_path: relativize(workspace, &entry.dts_path),
                mtime_ms: entry.mtime_ms,
                size: entry.size,
                is_ts_file: entry.is_ts_file,
            },
        );
    }
    let body = OnDiskManifest {
        version: manifest.version,
        entries: out_entries,
    };
    let json = serde_json::to_string_pretty(&body).map_err(std::io::Error::other)?;
    fs::write(manifest_path, json)
}

/// Drop manifest entries whose source `.svelte` no longer appears in
/// `current_sources`, and unlink the now-orphaned `.tsx` / `.d.ts`
/// shadows so the cache directory doesn't grow without bound.
pub fn prune_deleted(manifest: &mut Manifest, current_sources: &[PathBuf]) {
    let live: std::collections::HashSet<&Path> =
        current_sources.iter().map(|p| p.as_path()).collect();
    let mut stale_keys = Vec::new();
    for key in manifest.entries.keys() {
        if !live.contains(key.as_path()) {
            stale_keys.push(key.clone());
        }
    }
    for key in stale_keys {
        if let Some(entry) = manifest.entries.remove(&key) {
            let _ = fs::remove_file(&entry.out_path);
            let _ = fs::remove_file(&entry.dts_path);
        }
    }
}

/// `(mtime_ms, size)` for `path`, or `None` when the file is missing or
/// inaccessible. Mirrors the JS reference's `fs.statSync(...).mtimeMs`
/// + `.size` cache key.
pub fn current_stats(path: &Path) -> Option<(i64, u64)> {
    let meta = fs::metadata(path).ok()?;
    let modified = meta.modified().ok()?;
    let ms = system_time_to_millis(modified);
    Some((ms, meta.len()))
}

fn system_time_to_millis(t: SystemTime) -> i64 {
    match t.duration_since(SystemTime::UNIX_EPOCH) {
        Ok(d) => d.as_millis() as i64,
        Err(e) => -(e.duration().as_millis() as i64),
    }
}

fn absolutize(workspace: &Path, path: &Path) -> PathBuf {
    if path.is_absolute() {
        path.to_path_buf()
    } else {
        workspace.join(path)
    }
}

fn relativize(workspace: &Path, path: &Path) -> String {
    let rel = path.strip_prefix(workspace).unwrap_or(path);
    rel.to_string_lossy().replace('\\', "/")
}

// =============================================================================
// Per-file diagnostic (warning) cache — `<cacheDir>/warnings.json`.
// =============================================================================

/// Cached diagnostics for a single source file. The `mtime_ms` / `size`
/// stats are compared against the live file at lookup time — a mismatch
/// invalidates the entry.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CachedDiagnostics {
    pub mtime_ms: i64,
    pub size: u64,
    pub diagnostics: Vec<SerializableDiagnostic>,
}

/// Serializable mirror of `Diagnostic`. `source` is owned (`String`) so
/// the type can round-trip via serde; the live `Diagnostic` uses
/// `&'static str` since runtime always picks from a known set.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SerializableDiagnostic {
    pub file: PathBuf,
    pub severity: DiagnosticSeverity,
    pub code: Option<String>,
    pub message: String,
    pub range: Option<Range>,
    pub source: String,
}

impl SerializableDiagnostic {
    pub fn from_live(d: &Diagnostic) -> Self {
        Self {
            file: d.file.clone(),
            severity: d.severity,
            code: d.code.clone(),
            message: d.message.clone(),
            range: d.range,
            source: d.source.to_string(),
        }
    }

    /// Restore as a live `Diagnostic`. `source` is interned back to a
    /// `&'static str` via the known set of sources — anything outside
    /// the set falls back to `"svelte"` (the safe default — these are
    /// rsvelte compile warnings, not foreign diagnostics).
    pub fn into_live(self) -> Diagnostic {
        let source: &'static str = match self.source.as_str() {
            "ts" => "ts",
            "css" => "css",
            _ => "svelte",
        };
        Diagnostic {
            file: self.file,
            severity: self.severity,
            code: self.code,
            message: self.message,
            range: self.range,
            source,
        }
    }
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct WarningCache {
    pub version: u32,
    /// Keyed by absolute source path in memory; serialised with
    /// workspace-relative paths via [`save_warnings`].
    pub entries: HashMap<PathBuf, CachedDiagnostics>,
}

impl WarningCache {
    pub fn empty() -> Self {
        Self {
            version: WARNINGS_VERSION,
            entries: HashMap::new(),
        }
    }
}

pub fn load_warnings(path: &Path, workspace: &Path) -> WarningCache {
    let Ok(text) = fs::read_to_string(path) else {
        return WarningCache::empty();
    };
    #[derive(Deserialize)]
    struct OnDisk {
        version: u32,
        #[serde(default)]
        entries: HashMap<String, OnDiskEntry>,
    }
    #[derive(Deserialize)]
    struct OnDiskEntry {
        mtime_ms: i64,
        size: u64,
        #[serde(default)]
        diagnostics: Vec<OnDiskDiagnostic>,
    }
    #[derive(Deserialize)]
    struct OnDiskDiagnostic {
        file: String,
        severity: DiagnosticSeverity,
        #[serde(default)]
        code: Option<String>,
        message: String,
        #[serde(default)]
        range: Option<Range>,
        source: String,
    }
    let parsed: OnDisk = match serde_json::from_str(&text) {
        Ok(v) => v,
        Err(_) => return WarningCache::empty(),
    };
    if parsed.version != WARNINGS_VERSION {
        return WarningCache::empty();
    }
    let mut entries = HashMap::with_capacity(parsed.entries.len());
    for (key, raw) in parsed.entries {
        let key_abs = absolutize(workspace, Path::new(&key));
        let diagnostics = raw
            .diagnostics
            .into_iter()
            .map(|d| SerializableDiagnostic {
                file: absolutize(workspace, Path::new(&d.file)),
                severity: d.severity,
                code: d.code,
                message: d.message,
                range: d.range,
                source: d.source,
            })
            .collect();
        entries.insert(
            key_abs,
            CachedDiagnostics {
                mtime_ms: raw.mtime_ms,
                size: raw.size,
                diagnostics,
            },
        );
    }
    WarningCache {
        version: parsed.version,
        entries,
    }
}

pub fn save_warnings(path: &Path, cache: &WarningCache, workspace: &Path) -> std::io::Result<()> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    #[derive(Serialize)]
    struct OnDisk<'a> {
        version: u32,
        entries: HashMap<String, OnDiskEntry<'a>>,
    }
    #[derive(Serialize)]
    struct OnDiskEntry<'a> {
        mtime_ms: i64,
        size: u64,
        diagnostics: Vec<OnDiskDiagnostic<'a>>,
    }
    #[derive(Serialize)]
    struct OnDiskDiagnostic<'a> {
        file: String,
        severity: DiagnosticSeverity,
        #[serde(skip_serializing_if = "Option::is_none")]
        code: Option<&'a str>,
        message: &'a str,
        #[serde(skip_serializing_if = "Option::is_none")]
        range: Option<Range>,
        source: &'a str,
    }
    let mut out_entries: HashMap<String, OnDiskEntry> = HashMap::with_capacity(cache.entries.len());
    for (key, entry) in &cache.entries {
        let diags = entry
            .diagnostics
            .iter()
            .map(|d| OnDiskDiagnostic {
                file: relativize(workspace, &d.file),
                severity: d.severity,
                code: d.code.as_deref(),
                message: &d.message,
                range: d.range,
                source: &d.source,
            })
            .collect();
        out_entries.insert(
            relativize(workspace, key),
            OnDiskEntry {
                mtime_ms: entry.mtime_ms,
                size: entry.size,
                diagnostics: diags,
            },
        );
    }
    let body = OnDisk {
        version: cache.version,
        entries: out_entries,
    };
    let json = serde_json::to_string_pretty(&body).map_err(std::io::Error::other)?;
    fs::write(path, json)
}

/// Drop cache entries whose source `.svelte` no longer appears in
/// `current_sources`. Unlike the manifest, we don't unlink artifacts —
/// the cache itself is the only sidecar.
pub fn prune_warnings(cache: &mut WarningCache, current_sources: &[PathBuf]) {
    let live: std::collections::HashSet<&Path> =
        current_sources.iter().map(|p| p.as_path()).collect();
    cache.entries.retain(|k, _| live.contains(k.as_path()));
}

#[cfg(test)]
mod tests {
    use super::*;

    fn entry(name: &str, mtime: i64, size: u64) -> ManifestEntry {
        ManifestEntry {
            source_path: PathBuf::from(format!("src/{name}.svelte")),
            out_path: PathBuf::from(format!(".svelte-check/svelte/{name}.svelte.tsx")),
            dts_path: PathBuf::from(format!(".svelte-check/svelte/{name}.svelte.d.ts")),
            mtime_ms: mtime,
            size,
            is_ts_file: false,
        }
    }

    #[test]
    fn round_trips_via_relative_paths() {
        let tmp = std::env::temp_dir().join(format!("svc_manifest_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(&tmp).unwrap();

        let mut manifest = Manifest::empty();
        let abs = tmp.join("src/Foo.svelte");
        manifest.entries.insert(
            abs.clone(),
            ManifestEntry {
                source_path: abs.clone(),
                out_path: tmp.join(".svelte-check/svelte/Foo.svelte.tsx"),
                dts_path: tmp.join(".svelte-check/svelte/Foo.svelte.d.ts"),
                mtime_ms: 12345,
                size: 67,
                is_ts_file: true,
            },
        );

        let path = tmp.join("manifest.json");
        save(&path, &manifest, &tmp).unwrap();
        let body = fs::read_to_string(&path).unwrap();
        // Stored entries use forward-slash relative paths, not absolute.
        assert!(body.contains("\"src/Foo.svelte\""));
        assert!(!body.contains(tmp.to_string_lossy().as_ref()));

        let round = load(&path, &tmp);
        assert_eq!(round.version, MANIFEST_VERSION);
        let got = round.entries.get(&abs).expect("absolute key restored");
        assert_eq!(got.size, 67);
        assert_eq!(got.mtime_ms, 12345);
        assert!(got.is_ts_file);
    }

    #[test]
    fn load_returns_empty_on_missing_file() {
        let path = std::env::temp_dir().join("does-not-exist-manifest.json");
        let _ = fs::remove_file(&path);
        let m = load(&path, Path::new("."));
        assert!(m.entries.is_empty());
    }

    #[test]
    fn load_returns_empty_on_version_mismatch() {
        let tmp = std::env::temp_dir().join(format!("svc_manifest_v_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(&tmp).unwrap();
        let path = tmp.join("manifest.json");
        fs::write(&path, r#"{"version":9999,"entries":{}}"#).unwrap();
        let m = load(&path, &tmp);
        assert!(m.entries.is_empty());
        assert_eq!(m.version, MANIFEST_VERSION);
    }

    #[test]
    fn prune_deletes_missing_sources_and_unlinks_artifacts() {
        let tmp = std::env::temp_dir().join(format!("svc_manifest_p_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(tmp.join(".svelte-check/svelte")).unwrap();

        let alive = tmp.join("Alive.svelte");
        fs::write(&alive, "ok").unwrap();
        let dead_out = tmp.join(".svelte-check/svelte/Dead.svelte.tsx");
        let dead_dts = tmp.join(".svelte-check/svelte/Dead.svelte.d.ts");
        fs::write(&dead_out, "tsx").unwrap();
        fs::write(&dead_dts, "dts").unwrap();

        let mut manifest = Manifest::empty();
        let alive_entry = ManifestEntry {
            source_path: alive.clone(),
            out_path: tmp.join(".svelte-check/svelte/Alive.svelte.tsx"),
            dts_path: tmp.join(".svelte-check/svelte/Alive.svelte.d.ts"),
            ..entry("Alive", 0, 0)
        };
        let dead_entry = ManifestEntry {
            source_path: tmp.join("Dead.svelte"),
            out_path: dead_out.clone(),
            dts_path: dead_dts.clone(),
            ..entry("Dead", 0, 0)
        };
        manifest.entries.insert(alive.clone(), alive_entry);
        manifest.entries.insert(tmp.join("Dead.svelte"), dead_entry);

        prune_deleted(&mut manifest, std::slice::from_ref(&alive));
        assert!(manifest.entries.contains_key(&alive));
        assert!(!manifest.entries.contains_key(&tmp.join("Dead.svelte")));
        assert!(!dead_out.exists(), "orphan .tsx should have been unlinked");
        assert!(!dead_dts.exists(), "orphan .d.ts should have been unlinked");
    }

    #[test]
    fn warnings_cache_round_trips_via_relative_paths() {
        let tmp = std::env::temp_dir().join(format!("svc_warnings_round_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(&tmp).unwrap();

        let abs = tmp.join("src/Foo.svelte");
        let mut cache = WarningCache::empty();
        cache.entries.insert(
            abs.clone(),
            CachedDiagnostics {
                mtime_ms: 99,
                size: 100,
                diagnostics: vec![SerializableDiagnostic {
                    file: abs.clone(),
                    severity: DiagnosticSeverity::Warning,
                    code: Some("a11y_alt_text".into()),
                    message: "img missing alt".into(),
                    range: Some(Range {
                        start: super::super::diagnostic::Position { line: 1, column: 2 },
                        end: super::super::diagnostic::Position { line: 1, column: 5 },
                    }),
                    source: "svelte".into(),
                }],
            },
        );
        let path = tmp.join("warnings.json");
        save_warnings(&path, &cache, &tmp).unwrap();
        let body = fs::read_to_string(&path).unwrap();
        assert!(
            body.contains("\"src/Foo.svelte\""),
            "key should be relative: {body}"
        );

        let round = load_warnings(&path, &tmp);
        let entry = round.entries.get(&abs).expect("entry restored");
        assert_eq!(entry.mtime_ms, 99);
        assert_eq!(entry.diagnostics.len(), 1);
        assert_eq!(entry.diagnostics[0].code.as_deref(), Some("a11y_alt_text"));
        // Restored diagnostic's `source` is interned back to a known
        // &'static str.
        let live = entry.diagnostics[0].clone().into_live();
        assert_eq!(live.source, "svelte");
    }

    #[test]
    fn warnings_cache_load_rejects_version_mismatch() {
        let tmp = std::env::temp_dir().join(format!("svc_warnings_ver_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(&tmp).unwrap();
        let path = tmp.join("warnings.json");
        fs::write(&path, r#"{"version":9999,"entries":{}}"#).unwrap();
        let cache = load_warnings(&path, &tmp);
        assert!(cache.entries.is_empty());
        assert_eq!(cache.version, WARNINGS_VERSION);
    }

    #[test]
    fn warnings_cache_prune_drops_missing_sources() {
        let tmp = std::env::temp_dir().join(format!("svc_warnings_prune_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(&tmp).unwrap();
        let alive = tmp.join("Alive.svelte");
        let dead = tmp.join("Dead.svelte");

        let mut cache = WarningCache::empty();
        let mk = |p: &Path| CachedDiagnostics {
            mtime_ms: 0,
            size: 0,
            diagnostics: vec![SerializableDiagnostic {
                file: p.to_path_buf(),
                severity: DiagnosticSeverity::Warning,
                code: None,
                message: "x".into(),
                range: None,
                source: "svelte".into(),
            }],
        };
        cache.entries.insert(alive.clone(), mk(&alive));
        cache.entries.insert(dead.clone(), mk(&dead));

        prune_warnings(&mut cache, std::slice::from_ref(&alive));
        assert!(cache.entries.contains_key(&alive));
        assert!(!cache.entries.contains_key(&dead));
    }
}
