//! Overlay-directory manager — materialise `.tsx` shadow files for each
//! `.svelte` source so a TypeScript compiler (tsgo / tsc) can consume
//! them. Mirrors the `emitSvelteFiles` + `writeOverlayTsconfig`
//! choreography in
//! `submodules/language-tools/packages/svelte-check/src/incremental.ts`.
//!
//! Implementation choices for v0.2:
//! - Cache dir is `<workspace>/.svelte-check/`. v0.3 will swap this to
//!   `.svelte-kit/` when the workspace looks like a SvelteKit project.
//! - `.svelte` → `<cacheDir>/svelte/<rel>.svelte.tsx` plus a
//!   sibling `<rel>.svelte.d.ts` re-exporting the `.tsx`'s default and
//!   named exports (so import-by-name still resolves).
//! - The emitted overlay tsconfig EXTENDS the original tsconfig.json
//!   instead of duplicating compiler options.

use std::collections::BTreeMap;
use std::fs;
use std::io;
use std::path::{Path, PathBuf};

use super::kit_file::{self, AddedCode, KitFilesSettings};
use super::manifest::{self, Manifest, ManifestEntry, current_stats};
use crate::svelte2tsx::{
    RewriteExternalImportsOptions, Svelte2TsxMode, Svelte2TsxNamespace, Svelte2TsxOptions,
    SvelteVersion, svelte2tsx,
};

/// One emitted `.svelte` → `.tsx` shadow.
#[derive(Debug, Clone)]
pub struct OverlayEntry {
    pub source_path: PathBuf,
    pub tsx_path: PathBuf,
    pub dts_path: PathBuf,
    /// Inline source map produced by svelte2tsx, ready to be parsed
    /// later when mapping tsgo diagnostics back to `.svelte` positions.
    pub source_map: Option<String>,
}

/// One emitted SvelteKit `.ts` / `.js` shadow with injected type stubs.
/// The shadow lives at `<emit_dir>/<rel>` (same extension as source), so
/// downstream diagnostic mapping is a simple path strip — we don't need
/// a source map because every insertion is a pure positive shift.
#[derive(Debug, Clone)]
pub struct KitOverlayEntry {
    pub source_path: PathBuf,
    pub out_path: PathBuf,
    pub added_code: Vec<AddedCode>,
}

#[derive(Debug, Clone)]
pub struct OverlayLayout {
    pub workspace: PathBuf,
    pub cache_dir: PathBuf,
    pub emit_dir: PathBuf,
    pub overlay_tsconfig: PathBuf,
    pub entries: Vec<OverlayEntry>,
    pub kit_entries: Vec<KitOverlayEntry>,
}

#[derive(Debug)]
pub enum OverlayError {
    Io(io::Error),
    Svelte2Tsx { file: PathBuf, message: String },
}

impl From<io::Error> for OverlayError {
    fn from(value: io::Error) -> Self {
        OverlayError::Io(value)
    }
}

impl std::fmt::Display for OverlayError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            OverlayError::Io(e) => write!(f, "I/O error: {e}"),
            OverlayError::Svelte2Tsx { file, message } => {
                write!(f, "svelte2tsx failed on {}: {message}", file.display())
            }
        }
    }
}

impl std::error::Error for OverlayError {}

/// Build (or refresh) an overlay directory under `workspace` and emit
/// one `.tsx` per `.svelte` input. The original tsconfig path (when
/// supplied) is `extends`-ed by the overlay tsconfig — passing `None`
/// produces a self-contained tsconfig with sensible defaults.
pub fn materialize_overlay(
    workspace: &Path,
    files: &[PathBuf],
    tsconfig_path: Option<&Path>,
) -> Result<OverlayLayout, OverlayError> {
    materialize_overlay_with(workspace, files, tsconfig_path, false)
}

/// Same as [`materialize_overlay_with`] but also materialises SvelteKit
/// kit files (`+page.ts`, hooks, params) with addedCode-style type
/// augmentation. Kit files land at `<emit_dir>/<rel>` with their
/// original extension so the overlay tsconfig's `rootDirs` mapping
/// keeps module resolution intact.
pub fn materialize_overlay_with_kit(
    workspace: &Path,
    svelte_files: &[PathBuf],
    kit_files: &[PathBuf],
    tsconfig_path: Option<&Path>,
    incremental: bool,
    settings: &KitFilesSettings,
) -> Result<OverlayLayout, OverlayError> {
    let mut layout = materialize_overlay_with(workspace, svelte_files, tsconfig_path, incremental)?;
    layout.kit_entries = materialize_kit_files(workspace, &layout.emit_dir, kit_files, settings)?;
    Ok(layout)
}

/// Same as [`materialize_overlay`] but with an explicit `incremental`
/// flag. When `true`, we load `<cacheDir>/manifest.json`, prune entries
/// for files that have been deleted, and skip running svelte2tsx on
/// files whose `(mtime_ms, size)` matches the manifest (and whose
/// `.tsx` / `.d.ts` shadows still exist on disk). The source map for
/// skipped files is recovered from the sibling `.tsx.map` file written
/// on the previous run, so downstream diagnostic mapping still works.
pub fn materialize_overlay_with(
    workspace: &Path,
    files: &[PathBuf],
    tsconfig_path: Option<&Path>,
    incremental: bool,
) -> Result<OverlayLayout, OverlayError> {
    let cache_dir = workspace.join(".svelte-check");
    let emit_dir = cache_dir.join("svelte");
    fs::create_dir_all(&emit_dir)?;
    let manifest_path = cache_dir.join("manifest.json");

    let mut manifest = if incremental {
        manifest::load(&manifest_path, workspace)
    } else {
        Manifest::empty()
    };

    // Resolve every input to an absolute path up-front so we can use
    // it both as the manifest key and (later) for prune.
    let abs_files: Vec<PathBuf> = files
        .iter()
        .map(|p| {
            if p.is_absolute() {
                p.clone()
            } else {
                workspace.join(p)
            }
        })
        .collect();

    if incremental {
        manifest::prune_deleted(&mut manifest, &abs_files);
    }

    let mut entries = Vec::with_capacity(files.len());
    for abs_source in &abs_files {
        let rel = abs_source
            .strip_prefix(workspace)
            .unwrap_or(abs_source)
            .to_path_buf();
        let tsx_rel = append_extension(&rel, ".tsx");
        let dts_rel = append_extension(&rel, ".d.ts");
        let tsx_path = emit_dir.join(&tsx_rel);
        let dts_path = emit_dir.join(&dts_rel);
        let map_path = append_extension(&tsx_path, ".map");
        if let Some(parent) = tsx_path.parent() {
            fs::create_dir_all(parent)?;
        }

        let stats = current_stats(abs_source);
        let cached_entry = manifest.entries.get(abs_source);
        let stats_match = match (stats, cached_entry) {
            (Some((mtime, size)), Some(entry)) => {
                entry.mtime_ms == mtime
                    && entry.size == size
                    && entry.out_path == tsx_path
                    && entry.dts_path == dts_path
            }
            _ => false,
        };

        // `.tsx.map` is only persisted when svelte2tsx returned a non-empty
        // source map; we don't gate cache validity on it, so a workspace
        // that gained / lost source maps still hits the cache. On hit we
        // simply best-effort-read whatever sits at `map_path`.
        let can_skip = incremental && stats_match && tsx_path.exists() && dts_path.exists();

        let source_map = if can_skip {
            fs::read_to_string(&map_path).ok()
        } else {
            let source = fs::read_to_string(abs_source)?;
            let is_ts_file = looks_like_ts_svelte(&source);
            let opts = Svelte2TsxOptions {
                filename: abs_source.display().to_string(),
                is_ts_file,
                mode: Svelte2TsxMode::Ts,
                accessors: false,
                namespace: Svelte2TsxNamespace::Html,
                version: SvelteVersion::V5,
                runes: None,
                // emit_jsdoc=true is required so tsgo doesn't choke on
                // syntactic errors before reporting semantic ones (matches
                // the JS reference's comment).
                emit_jsdoc: true,
                rewrite_external_imports: Some(RewriteExternalImportsOptions {
                    source_path: abs_source.display().to_string(),
                    generated_path: tsx_path.display().to_string(),
                    workspace_path: workspace.display().to_string(),
                }),
            };
            let result = svelte2tsx(&source, opts).map_err(|e| OverlayError::Svelte2Tsx {
                file: abs_source.clone(),
                message: format!("{e}"),
            })?;
            fs::write(&tsx_path, &result.code)?;

            // `<name>.svelte.d.ts` re-exports default + named so module
            // resolution by `import Foo from './Foo.svelte'` still works.
            let import_basename = tsx_path
                .file_name()
                .and_then(|s| s.to_str())
                .unwrap_or("missing.tsx");
            let dts_content = format!(
                "export {{ default }} from \"./{0}\";\nexport * from \"./{0}\";\n",
                import_basename
            );
            fs::write(&dts_path, dts_content)?;
            // Persist the source map so the next incremental run can
            // recover it without re-running svelte2tsx.
            if let Some(map) = &result.map {
                let _ = fs::write(&map_path, map);
            } else {
                let _ = fs::remove_file(&map_path);
            }

            if let Some((mtime, size)) = stats {
                manifest.entries.insert(
                    abs_source.clone(),
                    ManifestEntry {
                        source_path: abs_source.clone(),
                        out_path: tsx_path.clone(),
                        dts_path: dts_path.clone(),
                        mtime_ms: mtime,
                        size,
                        is_ts_file,
                    },
                );
            }

            result.map
        };

        entries.push(OverlayEntry {
            source_path: abs_source.clone(),
            tsx_path,
            dts_path,
            source_map,
        });
    }

    let overlay_tsconfig = cache_dir.join("tsconfig.json");
    let tsconfig_json = build_overlay_tsconfig(&cache_dir, tsconfig_path, workspace);
    fs::write(&overlay_tsconfig, tsconfig_json)?;

    if incremental {
        let _ = manifest::save(&manifest_path, &manifest, workspace);
    }

    Ok(OverlayLayout {
        workspace: workspace.to_path_buf(),
        cache_dir,
        emit_dir,
        overlay_tsconfig,
        entries,
        kit_entries: Vec::new(),
    })
}

fn materialize_kit_files(
    workspace: &Path,
    emit_dir: &Path,
    kit_files: &[PathBuf],
    settings: &KitFilesSettings,
) -> Result<Vec<KitOverlayEntry>, OverlayError> {
    let mut out = Vec::with_capacity(kit_files.len());
    for source in kit_files {
        let abs = if source.is_absolute() {
            source.clone()
        } else {
            workspace.join(source)
        };
        let rel = abs.strip_prefix(workspace).unwrap_or(&abs).to_path_buf();
        let out_path = emit_dir.join(&rel);
        if let Some(parent) = out_path.parent() {
            fs::create_dir_all(parent)?;
        }
        let raw = fs::read_to_string(&abs)?;
        let Some(adds) = kit_file::build_added_code(&abs, &raw, settings) else {
            // Not a kit file we recognise (or nothing to augment) —
            // drop a verbatim copy so module resolution still works.
            fs::write(&out_path, &raw)?;
            out.push(KitOverlayEntry {
                source_path: abs,
                out_path,
                added_code: Vec::new(),
            });
            continue;
        };
        let augmented = kit_file::apply_added_code(&raw, &adds);
        fs::write(&out_path, &augmented)?;
        out.push(KitOverlayEntry {
            source_path: abs,
            out_path,
            added_code: adds,
        });
    }
    Ok(out)
}

/// Append a literal extension (`".tsx"`, `".d.ts"`) to a relative path
/// without losing the original `.svelte` suffix — the overlay's module
/// resolution depends on the JS reference's `Foo.svelte.tsx` /
/// `Foo.svelte.d.ts` naming pattern.
fn append_extension(rel: &Path, extra: &str) -> PathBuf {
    let mut s = rel.as_os_str().to_owned();
    s.push(extra);
    PathBuf::from(s)
}

/// Quick lexical sniff for `<script lang="ts">` so the v0.2 overlay can
/// pass the right `is_ts_file` to svelte2tsx without re-parsing.
fn looks_like_ts_svelte(source: &str) -> bool {
    let lower = source.to_ascii_lowercase();
    lower.contains("lang=\"ts\"") || lower.contains("lang='ts'") || lower.contains("lang=ts")
}

fn build_overlay_tsconfig(cache_dir: &Path, original: Option<&Path>, workspace: &Path) -> String {
    let mut obj: BTreeMap<&str, serde_json::Value> = BTreeMap::new();
    if let Some(orig) = original {
        let rel = path_relative(cache_dir, orig);
        obj.insert("extends", serde_json::Value::String(rel));
    }
    let mut compiler_opts = serde_json::Map::new();
    compiler_opts.insert("noEmit".into(), true.into());
    compiler_opts.insert("allowArbitraryExtensions".into(), true.into());
    compiler_opts.insert("rootDirs".into(), serde_json::json!([".", "./svelte"]));
    obj.insert("compilerOptions", serde_json::Value::Object(compiler_opts));

    // Inherited config-file specs: read the user's tsconfig.json (if
    // any) and merge its `include` / `exclude` / `files` arrays into
    // the overlay, rebased so paths are resolved from the overlay dir
    // (one level deeper than the original tsconfig dir). Without this
    // the overlay's `include = ["./svelte/**/*"]` blocks every plain
    // `.ts` / `.js` file in the project from being type-checked.
    let user_specs = original
        .and_then(|p| read_tsconfig_specs(p, cache_dir))
        .unwrap_or_default();

    let mut include_value = vec!["./svelte/**/*".to_string()];
    include_value.extend(user_specs.include);
    obj.insert(
        "include",
        serde_json::Value::Array(
            include_value
                .into_iter()
                .map(serde_json::Value::String)
                .collect(),
        ),
    );
    if !user_specs.exclude.is_empty() {
        obj.insert(
            "exclude",
            serde_json::Value::Array(
                user_specs
                    .exclude
                    .into_iter()
                    .map(serde_json::Value::String)
                    .collect(),
            ),
        );
    }

    // Pull the svelte2tsx shim `.d.ts` files into the overlay's `files`
    // array. Without these, tsgo / tsc trips on every reference to
    // `__sveltets_2_with_any_event` etc that svelte2tsx emits into the
    // `.tsx` shadow. Mirrors `resolveSvelte2tsxShims` in the JS
    // reference (`incremental.ts:1108`).
    //
    // We always set `files` so any `.svelte` entries listed in the base
    // tsconfig (TS rejects arbitrary extensions in `files` even with
    // `allowArbitraryExtensions` → TS6054) get overridden out. Non-
    // `.svelte` entries from the user's `files` are forwarded.
    let shim_paths = resolve_svelte2tsx_shims(workspace);
    let mut files_entries: Vec<String> = shim_paths
        .iter()
        .map(|p| path_relative(cache_dir, p))
        .collect();
    files_entries.extend(user_specs.files);
    files_entries.sort();
    files_entries.dedup();
    let files_value = serde_json::Value::Array(
        files_entries
            .into_iter()
            .map(serde_json::Value::String)
            .collect(),
    );
    obj.insert("files", files_value);
    serde_json::to_string_pretty(&obj).unwrap_or_else(|_| "{}".into())
}

#[derive(Debug, Default)]
struct InheritedSpecs {
    /// User `include` patterns rebased to be relative to the overlay
    /// dir (POSIX, forward slashes).
    include: Vec<String>,
    /// User `exclude` patterns, rebased.
    exclude: Vec<String>,
    /// User `files` entries minus any `.svelte` paths (which would
    /// trigger TS6054 since the overlay's `allowArbitraryExtensions`
    /// only applies to module resolution, not to the `files` array).
    files: Vec<String>,
}

/// Read the user's tsconfig.json (JSONC: comments allowed) and pluck
/// the `include` / `exclude` / `files` arrays. Each path is rebased
/// from `tsconfig_dir` (the location of the original tsconfig) onto
/// `cache_dir` (the overlay dir, one level deeper). Returns `None`
/// when the file can't be read or the JSON shape isn't recognised —
/// in that case the overlay falls back to "shim files only", which
/// matches the pre-rebase behaviour.
fn read_tsconfig_specs(tsconfig_path: &Path, cache_dir: &Path) -> Option<InheritedSpecs> {
    let raw = fs::read_to_string(tsconfig_path).ok()?;
    let stripped = strip_jsonc_comments(&raw);
    let parsed: serde_json::Value = serde_json::from_str(&stripped).ok()?;
    let tsconfig_dir = tsconfig_path.parent()?;

    let rebase = |spec: &str| -> String {
        // tsconfig globs are relative to tsconfig_dir; we want them
        // relative to cache_dir. Resolve to absolute first via a
        // best-effort join (specs may contain `**` etc — that's a
        // pattern, not a real path component, but for the prefix walk
        // path_relative does it's fine).
        let abs = tsconfig_dir.join(spec);
        path_relative(cache_dir, &abs)
    };

    let extract = |key: &str| -> Vec<String> {
        parsed
            .get(key)
            .and_then(|v| v.as_array())
            .map(|arr| {
                arr.iter()
                    .filter_map(|v| v.as_str().map(|s| s.to_string()))
                    .collect::<Vec<_>>()
            })
            .unwrap_or_default()
    };

    let include = extract("include").into_iter().map(|s| rebase(&s)).collect();
    let exclude = extract("exclude").into_iter().map(|s| rebase(&s)).collect();
    let files = extract("files")
        .into_iter()
        .filter(|s| !s.ends_with(".svelte"))
        .map(|s| rebase(&s))
        .collect();
    Some(InheritedSpecs {
        include,
        exclude,
        files,
    })
}

/// Strip `//` line comments and `/* ... */` block comments from a
/// string while leaving JSON string literals intact. Tsconfig is
/// canonically JSONC, but `serde_json` only accepts strict JSON.
/// Tracks string state so that `"// not a comment"` survives.
fn strip_jsonc_comments(src: &str) -> String {
    let mut out = String::with_capacity(src.len());
    let bytes = src.as_bytes();
    let mut i = 0;
    let mut in_string = false;
    let mut escape = false;
    while i < bytes.len() {
        let c = bytes[i];
        if in_string {
            out.push(c as char);
            if escape {
                escape = false;
            } else if c == b'\\' {
                escape = true;
            } else if c == b'"' {
                in_string = false;
            }
            i += 1;
            continue;
        }
        if c == b'"' {
            in_string = true;
            out.push(c as char);
            i += 1;
            continue;
        }
        if c == b'/' && i + 1 < bytes.len() {
            match bytes[i + 1] {
                b'/' => {
                    // Line comment to end of line.
                    while i < bytes.len() && bytes[i] != b'\n' {
                        i += 1;
                    }
                    continue;
                }
                b'*' => {
                    // Block comment until `*/`.
                    i += 2;
                    while i + 1 < bytes.len() && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                        i += 1;
                    }
                    i = (i + 2).min(bytes.len());
                    continue;
                }
                _ => {}
            }
        }
        out.push(c as char);
        i += 1;
    }
    out
}

/// Locate the svelte2tsx shim `.d.ts` files needed by the overlay's
/// `.tsx` shadows. Walks up from `workspace` looking for the first
/// `node_modules/svelte2tsx/<shim>.d.ts` along the chain — same
/// resolution shape Node uses, so both flat and nested install layouts
/// (npm, pnpm hoisted, workspaces) work. Returns an empty Vec when no
/// shims can be found; the overlay still works in that case but tsgo /
/// tsc will surface "Cannot find name '__sveltets_*'" diagnostics.
fn resolve_svelte2tsx_shims(workspace: &Path) -> Vec<PathBuf> {
    const SHIM_NAMES: &[&str] = &["svelte-shims-v4.d.ts", "svelte-jsx-v4.d.ts"];

    // Roots to check. We canonicalize so callers passing a relative
    // path still get sensible parent-walk behaviour.
    let start = workspace
        .canonicalize()
        .unwrap_or_else(|_| workspace.to_path_buf());
    let mut candidates: Vec<PathBuf> = Vec::new();
    let mut cursor: Option<&Path> = Some(start.as_path());
    while let Some(dir) = cursor {
        // Installed via pnpm/npm: workspace symlink lands here once
        // language-tools has been `pnpm install`-ed.
        candidates.push(dir.join("node_modules/svelte2tsx"));
        // Workspace source layout: the shims are checked into the
        // language-tools repo, so they're usable even without an
        // install step. Lets CI find them when only the submodule was
        // pulled down (no `pnpm install` for language-tools).
        candidates.push(dir.join("packages/svelte2tsx"));
        cursor = dir.parent();
    }

    let mut out: Vec<PathBuf> = Vec::new();
    for shim in SHIM_NAMES {
        for root in &candidates {
            let path = root.join(shim);
            if path.exists() {
                out.push(path);
                break;
            }
        }
    }
    out
}

/// POSIX-style relative path from `from_dir` to `to_path` (so the
/// generated tsconfig is consumable on every platform).
fn path_relative(from_dir: &Path, to_path: &Path) -> String {
    use std::path::Component;
    let from_abs = from_dir
        .canonicalize()
        .unwrap_or_else(|_| from_dir.to_path_buf());
    let to_abs = to_path
        .canonicalize()
        .unwrap_or_else(|_| to_path.to_path_buf());
    let mut from_parts: Vec<&std::ffi::OsStr> = from_abs
        .components()
        .filter(|c| !matches!(c, Component::RootDir | Component::Prefix(_)))
        .map(|c| c.as_os_str())
        .collect();
    let mut to_parts: Vec<&std::ffi::OsStr> = to_abs
        .components()
        .filter(|c| !matches!(c, Component::RootDir | Component::Prefix(_)))
        .map(|c| c.as_os_str())
        .collect();
    while !from_parts.is_empty() && !to_parts.is_empty() && from_parts[0] == to_parts[0] {
        from_parts.remove(0);
        to_parts.remove(0);
    }
    let mut parts: Vec<String> = Vec::new();
    for _ in 0..from_parts.len() {
        parts.push("..".into());
    }
    for p in &to_parts {
        parts.push(p.to_string_lossy().into_owned());
    }
    if parts.is_empty() {
        ".".into()
    } else {
        parts.join("/")
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::io::Write;

    #[test]
    fn materialises_tsx_and_dts_per_svelte_file() {
        let tmp = std::env::temp_dir().join(format!("svc_overlay_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(tmp.join("src/components")).unwrap();
        fs::File::create(tmp.join("src/components/Hello.svelte"))
            .unwrap()
            .write_all(b"<div>hi</div>")
            .unwrap();
        fs::File::create(tmp.join("src/App.svelte"))
            .unwrap()
            .write_all(b"<script>let x = 0;</script>{x}")
            .unwrap();

        let files = vec![
            tmp.join("src/components/Hello.svelte"),
            tmp.join("src/App.svelte"),
        ];
        let layout = materialize_overlay(&tmp, &files, None).unwrap();

        // Layout sanity
        assert!(layout.cache_dir.ends_with(".svelte-check"));
        assert!(layout.overlay_tsconfig.exists());
        assert_eq!(layout.entries.len(), 2);

        for entry in &layout.entries {
            assert!(entry.tsx_path.exists(), "{:?}", entry.tsx_path);
            assert!(entry.dts_path.exists(), "{:?}", entry.dts_path);
            // .tsx mirrors source relative path under emit_dir/svelte
            let rel = entry
                .tsx_path
                .strip_prefix(&layout.emit_dir)
                .expect("tsx under emit_dir");
            assert!(rel.to_string_lossy().ends_with(".svelte.tsx"));
        }

        // Overlay tsconfig parses as JSON and includes our svelte folder.
        let cfg: serde_json::Value =
            serde_json::from_str(&fs::read_to_string(&layout.overlay_tsconfig).unwrap()).unwrap();
        assert_eq!(
            cfg["compilerOptions"]["allowArbitraryExtensions"],
            serde_json::Value::Bool(true)
        );

        let _ = fs::remove_dir_all(&tmp);
    }

    #[test]
    fn incremental_skips_unchanged_files() {
        let tmp = std::env::temp_dir().join(format!("svc_overlay_inc_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(tmp.join("src")).unwrap();
        let svelte_path = tmp.join("src/App.svelte");
        fs::File::create(&svelte_path)
            .unwrap()
            .write_all(b"<script>let x = 0;</script>{x}")
            .unwrap();

        let files = vec![svelte_path.clone()];

        // Cold cache: produces tsx + dts + manifest. (`.tsx.map` is only
        // written when svelte2tsx returns a source map — currently a
        // future-proofing pathway, not exercised here.)
        let layout1 = materialize_overlay_with(&tmp, &files, None, true).unwrap();
        let entry = &layout1.entries[0];
        assert!(entry.tsx_path.exists());
        assert!(entry.dts_path.exists());
        let manifest_path = layout1.cache_dir.join("manifest.json");
        assert!(manifest_path.exists(), "manifest should be written");

        // Mutate the .tsx so we can detect whether the cache-hit path
        // re-emits or not. If incremental works, the file stays as we
        // wrote it.
        fs::write(&entry.tsx_path, "// intentionally broken").unwrap();

        // Warm cache, source unchanged → should not re-emit.
        let layout2 = materialize_overlay_with(&tmp, &files, None, true).unwrap();
        let entry2 = &layout2.entries[0];
        assert_eq!(
            fs::read_to_string(&entry2.tsx_path).unwrap(),
            "// intentionally broken",
            "incremental run re-emitted an unchanged file"
        );

        // Bump mtime by overwriting the source. Now the cache must
        // miss and re-emit.
        std::thread::sleep(std::time::Duration::from_millis(10));
        fs::write(&svelte_path, b"<script>let y = 1;</script>{y}").unwrap();
        let layout3 = materialize_overlay_with(&tmp, &files, None, true).unwrap();
        let entry3 = &layout3.entries[0];
        let regenerated = fs::read_to_string(&entry3.tsx_path).unwrap();
        assert_ne!(
            regenerated, "// intentionally broken",
            "incremental run should have re-emitted after the source changed"
        );

        let _ = fs::remove_dir_all(&tmp);
    }

    #[test]
    fn incremental_prunes_deleted_sources() {
        let tmp = std::env::temp_dir().join(format!("svc_overlay_prune_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(tmp.join("src")).unwrap();
        let kept = tmp.join("src/Kept.svelte");
        let removed = tmp.join("src/Removed.svelte");
        fs::write(&kept, "<div />").unwrap();
        fs::write(&removed, "<span />").unwrap();

        let layout1 =
            materialize_overlay_with(&tmp, &[kept.clone(), removed.clone()], None, true).unwrap();
        let removed_tsx = layout1
            .entries
            .iter()
            .find(|e| e.source_path == removed)
            .map(|e| e.tsx_path.clone())
            .unwrap();
        let removed_dts = layout1
            .entries
            .iter()
            .find(|e| e.source_path == removed)
            .map(|e| e.dts_path.clone())
            .unwrap();
        assert!(removed_tsx.exists());
        assert!(removed_dts.exists());

        // Source removed from disk and from input list → second pass
        // should unlink the orphaned overlay artefacts.
        fs::remove_file(&removed).unwrap();
        let _ = materialize_overlay_with(&tmp, std::slice::from_ref(&kept), None, true).unwrap();
        assert!(!removed_tsx.exists(), "stale .tsx should have been pruned");
        assert!(!removed_dts.exists(), "stale .d.ts should have been pruned");

        let _ = fs::remove_dir_all(&tmp);
    }
}
