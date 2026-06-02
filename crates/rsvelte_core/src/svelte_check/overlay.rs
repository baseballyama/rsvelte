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

/// svelte2tsx shim declarations, vendored from
/// `submodules/language-tools/packages/svelte2tsx/svelte-{shims,jsx}-v4.d.ts`
/// (MIT, sveltejs/language-tools). They declare the ambient globals the
/// `.tsx` shadows reference (`svelteHTML`, `__sveltets_2_*`, the JSX
/// namespace). The JS reference resolves these from the installed
/// `svelte2tsx` package; rsvelte ships a standalone binary with no such
/// dependency in the consumer's `node_modules`, so we embed them and
/// write them into the cache dir at runtime instead. Keep byte-identical
/// to upstream — tsgo consumes them verbatim.
const SHIM_SVELTE_SHIMS_V4: &str = include_str!("shims/svelte-shims-v4.d.ts");
const SHIM_SVELTE_JSX_V4: &str = include_str!("shims/svelte-jsx-v4.d.ts");

/// Filenames the shims are written under inside the cache dir. Names
/// match upstream so diagnostics / `isSvelteShim`-style checks line up.
const SHIM_FILES: &[(&str, &str)] = &[
    ("svelte-shims-v4.d.ts", SHIM_SVELTE_SHIMS_V4),
    ("svelte-jsx-v4.d.ts", SHIM_SVELTE_JSX_V4),
];

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

    // Materialise the svelte2tsx shims into the cache dir so the overlay
    // tsconfig can reference them by a stable relative path regardless of
    // what's installed in the consumer's node_modules.
    for (name, contents) in SHIM_FILES {
        fs::write(cache_dir.join(name), contents)?;
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

fn build_overlay_tsconfig(cache_dir: &Path, original: Option<&Path>, _workspace: &Path) -> String {
    let mut obj: BTreeMap<&str, serde_json::Value> = BTreeMap::new();
    if let Some(orig) = original {
        let rel = path_relative(cache_dir, orig);
        obj.insert("extends", serde_json::Value::String(rel));
    }
    let mut compiler_opts = serde_json::Map::new();
    compiler_opts.insert("noEmit".into(), true.into());
    compiler_opts.insert("allowArbitraryExtensions".into(), true.into());
    // The `.tsx` shadows svelte2tsx emits must be processed with a JSX
    // backend or tsgo / tsc rejects every `.svelte` → `.tsx` import with
    // TS6142 ("'--jsx' is not set"). `preserve` matches what svelte2tsx's
    // output is written against. The overlay tsconfig is isolated, so this
    // never leaks into the user's real build.
    compiler_opts.insert("jsx".into(), "preserve".into());
    // rootDirs: virtually overlay the emitted `.tsx`/kit shadows
    // (`<cacheDir>/svelte`) on top of the project's own rootDirs. We must
    // MERGE — not replace — the base rootDirs, otherwise frameworks that
    // rely on them (SvelteKit maps generated `$types` via
    // `rootDirs: ["..", "./types"]`) lose resolution and every
    // `import ... from './$types'` fails with TS2307. The base value is
    // inherited through `extends`, but a child `compilerOptions.rootDirs`
    // overrides arrays wholesale, so we resolve the chain ourselves.
    let mut root_dirs_abs = original
        .map(resolve_root_dirs_abs)
        .filter(|v| !v.is_empty())
        .unwrap_or_else(|| vec![cache_dir.to_path_buf()]);
    root_dirs_abs.push(cache_dir.join("svelte"));
    let mut root_dirs: Vec<String> = root_dirs_abs
        .iter()
        .map(|p| path_relative(cache_dir, p))
        .collect();
    root_dirs.dedup();
    compiler_opts.insert(
        "rootDirs".into(),
        serde_json::Value::Array(
            root_dirs
                .into_iter()
                .map(serde_json::Value::String)
                .collect(),
        ),
    );
    obj.insert("compilerOptions", serde_json::Value::Object(compiler_opts));

    // Inherited config-file specs: read the user's effective
    // `include` / `exclude` / `files` (resolved through the `extends`
    // chain) and merge them into the overlay, rebased so paths resolve
    // from the overlay dir. Without this the overlay's
    // `include = ["./svelte/**/*"]` blocks every plain `.ts` / `.js`
    // file in the project from being type-checked — and, crucially,
    // project ambient declaration files (`src/app.d.ts`, SvelteKit's
    // generated `ambient.d.ts`) never enter the program, so their
    // `declare global` / `namespace App` augmentations are invisible to
    // `--tsgo` (false TS2304 / TS2307 on a clean SvelteKit project).
    let user_specs = original
        .map(|p| read_tsconfig_specs(p, cache_dir))
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

    // Reference the svelte2tsx shim `.d.ts` files we materialised into the
    // cache dir (see `SHIM_FILES`). Without these, tsgo / tsc trips on
    // every reference to `__sveltets_2_with_any_event` / `svelteHTML` etc
    // that svelte2tsx emits into the `.tsx` shadow. Equivalent to
    // `resolveSvelte2tsxShims` in the JS reference, except we embed the
    // shims rather than resolving them from `node_modules/svelte2tsx`
    // (which a standalone rsvelte install has no reason to provide).
    //
    // We always set `files` so any `.svelte` entries listed in the base
    // tsconfig (TS rejects arbitrary extensions in `files` even with
    // `allowArbitraryExtensions` → TS6054) get overridden out. Non-
    // `.svelte` entries from the user's `files` are forwarded.
    let mut files_entries: Vec<String> = SHIM_FILES
        .iter()
        .map(|(name, _)| format!("./{name}"))
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

/// Resolve the user's effective `include` / `exclude` / `files` and
/// rebase each onto `cache_dir` (the overlay dir). Each key is resolved
/// independently through the `extends` chain — SvelteKit projects keep
/// these in the generated `./.svelte-kit/tsconfig.json`, not the root
/// tsconfig, so reading only the directly-passed file forwarded nothing
/// and project ambient files never entered the program.
fn read_tsconfig_specs(tsconfig_path: &Path, cache_dir: &Path) -> InheritedSpecs {
    let rebased = |key: &str| -> Vec<String> {
        resolve_config_specs(tsconfig_path, key)
            .map(|(specs, base)| {
                specs
                    .iter()
                    .map(|s| rebase_spec(s, &base, cache_dir))
                    .collect()
            })
            .unwrap_or_default()
    };

    let include = rebased("include");
    let exclude = rebased("exclude");
    let files = resolve_config_specs(tsconfig_path, "files")
        .map(|(specs, base)| {
            specs
                .iter()
                .filter(|s| !s.ends_with(".svelte"))
                .map(|s| rebase_spec(s, &base, cache_dir))
                .collect()
        })
        .unwrap_or_default();

    InheritedSpecs {
        include,
        exclude,
        files,
    }
}

/// Walk the `extends` chain from `tsconfig_path` and return the
/// `(specs, base_dir)` for the nearest config that defines `key`
/// (`include` / `exclude` / `files`). Mirrors TypeScript: a config that
/// sets the key shadows its parent's value wholesale; a config that
/// omits it inherits from the config it extends. `base_dir` is the
/// directory of the *defining* config so its relative specs rebase
/// correctly. Only relative-path `extends` are followed (see
/// [`resolve_root_dirs_abs`] for the rationale).
fn resolve_config_specs(tsconfig_path: &Path, key: &str) -> Option<(Vec<String>, PathBuf)> {
    let mut current = Some(tsconfig_path.to_path_buf());
    // Guard against pathological `extends` cycles.
    let mut hops = 0;
    while let Some(file) = current {
        hops += 1;
        if hops > 32 {
            break;
        }
        let Ok(raw) = fs::read_to_string(&file) else {
            break;
        };
        let stripped = strip_jsonc_comments(&raw);
        let Ok(parsed) = serde_json::from_str::<serde_json::Value>(&stripped) else {
            break;
        };
        let dir = file.parent().unwrap_or(Path::new(".")).to_path_buf();

        if let Some(arr) = parsed.get(key).and_then(|v| v.as_array()) {
            let specs = arr
                .iter()
                .filter_map(|v| v.as_str().map(|s| s.to_string()))
                .collect();
            return Some((specs, dir));
        }

        match parsed.get("extends").and_then(|v| v.as_str()) {
            Some(ext) if ext.starts_with('.') => current = Some(resolve_extends_path(&dir, ext)),
            _ => break,
        }
    }
    None
}

/// Resolve a relative `extends` target (`"./.svelte-kit/tsconfig.json"`,
/// `"../tsconfig.base"`, `"./configs"`) to a concrete tsconfig path: a
/// directory gains `/tsconfig.json`, an extension-less file gains
/// `.json`, mirroring TypeScript's resolution.
fn resolve_extends_path(dir: &Path, ext: &str) -> PathBuf {
    let mut next = dir.join(ext);
    if next.is_dir() {
        next = next.join("tsconfig.json");
    } else if next.extension().is_none() {
        next.set_extension("json");
    }
    next
}

/// True if a single path segment carries a glob metacharacter.
fn is_glob_segment(seg: &str) -> bool {
    seg.contains(['*', '?', '{', '}', '[', ']'])
}

/// Rebase a tsconfig `include` / `exclude` / `files` spec (relative to
/// `base_dir`, the dir of the config that declared it) onto `cache_dir`
/// (the overlay dir), POSIX-style.
///
/// The leading non-glob directory prefix is split off and rebased
/// lexically; the glob tail (`**/*.ts`, …) is re-appended verbatim. This
/// is the fix for the previous `path_relative(cache_dir, base.join(spec))`
/// approach, which fed `**` into path resolution as if it were a real
/// directory component and produced garbage like `../../../../src/**/*.ts`.
fn rebase_spec(spec: &str, base_dir: &Path, cache_dir: &Path) -> String {
    let segs: Vec<&str> = spec.split(['/', '\\']).filter(|s| !s.is_empty()).collect();
    let split_at = segs
        .iter()
        .position(|s| is_glob_segment(s))
        .unwrap_or(segs.len());
    let prefix = segs[..split_at].join("/");
    let tail = segs[split_at..].join("/");

    let prefix_path = if prefix.is_empty() {
        base_dir.to_path_buf()
    } else {
        base_dir.join(&prefix)
    };
    // Absolutise both ends before the lexical diff: at runtime `cache_dir`
    // and the config dirs are relative to the CWD (the CLI is invoked with
    // `--tsconfig ./tsconfig.json`), and a lexical relative path between two
    // relative inputs is meaningless. We anchor on the CWD rather than
    // `canonicalize` so glob prefixes that don't exist on disk still rebase.
    let rel_prefix = relative_lexical(&absolutize(cache_dir), &absolutize(&prefix_path));

    if tail.is_empty() {
        rel_prefix
    } else if rel_prefix == "." {
        tail
    } else {
        format!("{rel_prefix}/{tail}")
    }
}

/// Make `path` absolute by anchoring relative paths on the current working
/// directory, then normalise `.`/`..` lexically. No filesystem access
/// beyond reading the CWD, so it works for not-yet-created paths.
fn absolutize(path: &Path) -> PathBuf {
    let joined = if path.is_absolute() {
        path.to_path_buf()
    } else {
        std::env::current_dir()
            .unwrap_or_else(|_| PathBuf::from("."))
            .join(path)
    };
    normalize_abs(&joined)
}

/// Lexically normalise `.` / `..` in a path without touching the
/// filesystem — needed because the directory prefix of a glob (or a
/// path under a not-yet-created dir) can't be `canonicalize`d.
fn normalize_abs(path: &Path) -> PathBuf {
    use std::path::Component;
    let mut out = PathBuf::new();
    for comp in path.components() {
        match comp {
            Component::CurDir => {}
            Component::ParentDir => {
                let last = out.components().next_back();
                if matches!(last, Some(Component::Normal(_))) {
                    out.pop();
                } else if !matches!(last, Some(Component::RootDir) | Some(Component::Prefix(_))) {
                    out.push("..");
                }
                // At the root, `..` is a no-op.
            }
            other => out.push(other.as_os_str()),
        }
    }
    out
}

/// POSIX relative path from `from_dir` to `to_path`, computed lexically
/// (no `canonicalize`), so it is correct for paths that don't exist on
/// disk. Unlike [`path_relative`], this never resolves symlinks — which
/// is what we want for tsconfig specs (TypeScript interprets them
/// lexically relative to the config location).
fn relative_lexical(from_dir: &Path, to_path: &Path) -> String {
    use std::path::Component;
    let from = normalize_abs(from_dir);
    let to = normalize_abs(to_path);
    let collect = |p: &Path| -> Vec<String> {
        p.components()
            .filter(|c| !matches!(c, Component::RootDir | Component::Prefix(_)))
            .map(|c| c.as_os_str().to_string_lossy().into_owned())
            .collect()
    };
    let from_parts = collect(&from);
    let to_parts = collect(&to);
    let mut i = 0;
    while i < from_parts.len() && i < to_parts.len() && from_parts[i] == to_parts[i] {
        i += 1;
    }
    let mut parts: Vec<String> = Vec::new();
    for _ in i..from_parts.len() {
        parts.push("..".into());
    }
    parts.extend(to_parts[i..].iter().cloned());
    if parts.is_empty() {
        ".".into()
    } else {
        parts.join("/")
    }
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

/// Resolve a tsconfig's effective `rootDirs` to absolute paths, following
/// the `extends` chain. Returns the entries from the nearest config that
/// defines `rootDirs` (a child `compilerOptions.rootDirs` replaces the
/// parent's wholesale, mirroring TypeScript), each resolved relative to
/// the directory of the file that defined it. Empty when no config in the
/// chain sets `rootDirs`.
///
/// Only relative-path `extends` are followed (the common case, incl.
/// SvelteKit's `./.svelte-kit/tsconfig.json`); a bare package-name
/// `extends` stops the walk — we'd need full node resolution to chase it,
/// and the caller falls back to a sensible default.
fn resolve_root_dirs_abs(tsconfig_path: &Path) -> Vec<PathBuf> {
    let mut current = Some(tsconfig_path.to_path_buf());
    // Guard against pathological `extends` cycles.
    let mut hops = 0;
    while let Some(file) = current {
        hops += 1;
        if hops > 32 {
            break;
        }
        let Ok(raw) = fs::read_to_string(&file) else {
            break;
        };
        let stripped = strip_jsonc_comments(&raw);
        let Ok(parsed) = serde_json::from_str::<serde_json::Value>(&stripped) else {
            break;
        };
        let dir = file.parent().unwrap_or(Path::new("."));

        if let Some(arr) = parsed
            .get("compilerOptions")
            .and_then(|c| c.get("rootDirs"))
            .and_then(|v| v.as_array())
        {
            return arr
                .iter()
                .filter_map(|v| v.as_str())
                .map(|s| dir.join(s))
                .collect();
        }

        // Not defined here — follow a relative `extends`.
        match parsed.get("extends").and_then(|v| v.as_str()) {
            Some(ext) if ext.starts_with('.') => current = Some(resolve_extends_path(dir, ext)),
            _ => break,
        }
    }
    Vec::new()
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

    /// Regression test for the `--tsgo` overlay (the 154-error bug): the
    /// generated tsconfig must (1) set `jsx: "preserve"` so `.tsx` shadows
    /// type-check, (2) reference the embedded svelte2tsx shims under
    /// `files`, and (3) MERGE the project's `rootDirs` (resolved through
    /// the `extends` chain) with the overlay's `./svelte` rather than
    /// replacing them — otherwise SvelteKit's `$types` resolution breaks.
    #[test]
    fn overlay_tsconfig_has_jsx_shims_and_merged_rootdirs() {
        let tmp = std::env::temp_dir().join(format!("svc_overlay_tsgo_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(tmp.join("src")).unwrap();
        // A SvelteKit-style two-level config: the project tsconfig extends
        // a generated one that owns `rootDirs`.
        fs::create_dir_all(tmp.join(".svelte-kit")).unwrap();
        fs::write(
            tmp.join(".svelte-kit/tsconfig.json"),
            r#"{ "compilerOptions": { "rootDirs": ["..", "./types"] } }"#,
        )
        .unwrap();
        fs::write(
            tmp.join("tsconfig.json"),
            r#"{ "extends": "./.svelte-kit/tsconfig.json" }"#,
        )
        .unwrap();
        fs::write(tmp.join("src/App.svelte"), "<div>hi</div>").unwrap();

        let files = vec![tmp.join("src/App.svelte")];
        let tsconfig = tmp.join("tsconfig.json");
        let layout = materialize_overlay(&tmp, &files, Some(&tsconfig)).unwrap();

        // Shims were written into the cache dir.
        assert!(layout.cache_dir.join("svelte-shims-v4.d.ts").exists());
        assert!(layout.cache_dir.join("svelte-jsx-v4.d.ts").exists());

        let cfg: serde_json::Value =
            serde_json::from_str(&fs::read_to_string(&layout.overlay_tsconfig).unwrap()).unwrap();

        // (1) jsx backend set.
        assert_eq!(cfg["compilerOptions"]["jsx"], serde_json::json!("preserve"));

        // (2) shims referenced via `files`.
        let files_arr: Vec<String> = cfg["files"]
            .as_array()
            .unwrap()
            .iter()
            .map(|v| v.as_str().unwrap().to_string())
            .collect();
        assert!(
            files_arr
                .iter()
                .any(|f| f.ends_with("svelte-shims-v4.d.ts"))
        );
        assert!(files_arr.iter().any(|f| f.ends_with("svelte-jsx-v4.d.ts")));

        // (3) rootDirs merged: the overlay's own `./svelte`, the project
        // root, AND the inherited `./types` are all present — not just
        // `[".", "./svelte"]`.
        let root_dirs: Vec<String> = cfg["compilerOptions"]["rootDirs"]
            .as_array()
            .unwrap()
            .iter()
            .map(|v| v.as_str().unwrap().to_string())
            .collect();
        assert!(
            root_dirs.iter().any(|d| d.ends_with("svelte")),
            "overlay svelte dir missing: {root_dirs:?}"
        );
        assert!(
            root_dirs.iter().any(|d| d.ends_with("types")),
            "inherited SvelteKit `types` rootDir was clobbered: {root_dirs:?}"
        );

        let _ = fs::remove_dir_all(&tmp);
    }

    /// `rebase_spec` must rebase the non-glob directory prefix and keep
    /// the glob tail verbatim — the old `path_relative(join(spec))` path
    /// fed `**` into path resolution and produced `../../../../src/...`.
    #[test]
    fn rebase_spec_handles_globs_and_extends_base() {
        let cache = Path::new("/w/.svelte-check");
        // include declared in the SvelteKit-generated config, relative to
        // `.svelte-kit/`.
        assert_eq!(
            rebase_spec("../src/**/*.ts", Path::new("/w/.svelte-kit"), cache),
            "../src/**/*.ts"
        );
        // exact ambient file in the generated config.
        assert_eq!(
            rebase_spec("./ambient.d.ts", Path::new("/w/.svelte-kit"), cache),
            "../.svelte-kit/ambient.d.ts"
        );
        // exact file relative to the project root.
        assert_eq!(
            rebase_spec("src/app.d.ts", Path::new("/w"), cache),
            "../src/app.d.ts"
        );
        // a spec that is glob from its first segment.
        assert_eq!(
            rebase_spec("**/*.ts", Path::new("/w/src"), cache),
            "../src/**/*.ts"
        );
    }

    /// Regression test for the "project ambient `.d.ts` invisible to
    /// `--tsgo`" gap: a SvelteKit project keeps `include` in the generated
    /// `./.svelte-kit/tsconfig.json`, not the root tsconfig. The overlay
    /// must resolve `include` through the `extends` chain and forward it
    /// (correctly rebased) so `src/app.d.ts` enters the program.
    #[test]
    fn overlay_forwards_project_include_through_extends_chain() {
        let tmp = std::env::temp_dir().join(format!("svc_overlay_inc_fwd_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(tmp.join("src")).unwrap();
        fs::create_dir_all(tmp.join(".svelte-kit")).unwrap();
        // The generated config owns include + rootDirs; the root tsconfig
        // only extends it (no include of its own).
        fs::write(
            tmp.join(".svelte-kit/tsconfig.json"),
            r#"{
                "compilerOptions": { "rootDirs": ["..", "./types"] },
                "include": ["../src/**/*.ts", "../src/**/*.svelte", "./ambient.d.ts"]
            }"#,
        )
        .unwrap();
        fs::write(
            tmp.join("tsconfig.json"),
            r#"{ "extends": "./.svelte-kit/tsconfig.json" }"#,
        )
        .unwrap();
        fs::write(tmp.join("src/app.d.ts"), "declare global {}\nexport {};\n").unwrap();
        fs::write(tmp.join("src/App.svelte"), "<div>hi</div>").unwrap();

        let files = vec![tmp.join("src/App.svelte")];
        let tsconfig = tmp.join("tsconfig.json");
        let layout = materialize_overlay(&tmp, &files, Some(&tsconfig)).unwrap();

        let cfg: serde_json::Value =
            serde_json::from_str(&fs::read_to_string(&layout.overlay_tsconfig).unwrap()).unwrap();
        let include: Vec<String> = cfg["include"]
            .as_array()
            .unwrap()
            .iter()
            .map(|v| v.as_str().unwrap().to_string())
            .collect();

        // The overlay's own shadow glob is still there …
        assert!(
            include.iter().any(|i| i == "./svelte/**/*"),
            "overlay shadow include missing: {include:?}"
        );
        // … plus the project's include, forwarded through `extends` and
        // rebased *without* glob mangling.
        assert!(
            include.iter().any(|i| i == "../src/**/*.ts"),
            "extends-chain include not forwarded / mis-rebased: {include:?}"
        );
        assert!(
            include.iter().any(|i| i == "../.svelte-kit/ambient.d.ts"),
            "exact ambient include not forwarded: {include:?}"
        );
        // No mangled `../../../..`-style prefix leaked in.
        assert!(
            !include.iter().any(|i| i.contains("../../../")),
            "glob rebase produced a mangled path: {include:?}"
        );

        let _ = fs::remove_dir_all(&tmp);
    }
}
