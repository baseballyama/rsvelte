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
use std::fmt::Write as _;
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
    materialize_kit_types(workspace, &layout.emit_dir, kit_files)?;
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

    // Resolver used to re-point tsconfig-alias `.svelte` imports at their
    // shadow `.tsx` (see `rewrite_aliased_svelte_imports`). Built once and
    // reused across files; `None` when there is no project tsconfig (a
    // self-contained overlay has no path aliases to resolve).
    let svelte_resolver = build_svelte_import_resolver(tsconfig_path);

    let mut entries = Vec::with_capacity(files.len());
    for abs_source in &abs_files {
        let rel = safe_relative(abs_source, workspace);
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
            // A sibling companion module (`Foo.svelte.ts` / `Foo.svelte.js`
            // next to `Foo.svelte`) collides with the component shadow on the
            // same TypeScript basename: `import X from './Foo.svelte'` and
            // `import { y } from './Foo.svelte.js'` both resolve to the single
            // `Foo.svelte.{ts,tsx,d.ts}` family. Rather than emit a competing
            // `Foo.svelte.ts` (which would win the `.svelte`-strip fallback and
            // hide the component's default export), fold the companion's named
            // exports into the component shadow so the one resolvable module
            // exposes both the component default and the companion's exports.
            let mut tsx_code = result.code.clone();
            if let Some(spec) = companion_reexport_specifier(abs_source, &tsx_path) {
                let _ = writeln!(tsx_code, "\nexport * from \"{spec}\";");
            }
            // Re-point tsconfig-alias `.svelte` imports (`$lib/Foo.svelte`) at
            // their shadow `.tsx`. Relative `.svelte` imports already resolve to
            // shadows via the overlay's `rootDirs`, but TS applies `rootDirs`
            // ONLY to relative specifiers — an aliased import lands on the raw
            // source `.svelte` (no shadow there → unresolved `any` / spurious
            // `TS1192`). oxc_resolver honours the project tsconfig
            // `paths`/`baseUrl`, so we resolve each alias and rewrite it to a
            // concrete shadow-relative path that tsgo resolves directly.
            if let Some(resolver) = svelte_resolver.as_ref() {
                tsx_code = rewrite_aliased_svelte_imports(
                    &tsx_code, abs_source, &tsx_path, workspace, &emit_dir, resolver,
                );
            }
            fs::write(&tsx_path, &tsx_code)?;

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

    // External (workspace-sibling) `.svelte` packages reachable via node_modules
    // symlinks: emit shadows into per-package cache mirrors and collect the
    // (real-dir, mirror-dir) `rootDirs` pairs that bridge them (#782).
    let external = discover_external_svelte_packages(workspace, &cache_dir);
    let mut ext_root_dir_pairs: Vec<(PathBuf, PathBuf)> = Vec::with_capacity(external.len());
    for pkg in &external {
        emit_external_shadows(pkg)?;
        ext_root_dir_pairs.push((pkg.real_dir.clone(), pkg.mirror_dir.clone()));
    }

    let overlay_tsconfig = cache_dir.join("tsconfig.json");
    let tsconfig_json = build_overlay_tsconfig(
        &cache_dir,
        tsconfig_path,
        workspace,
        &ext_root_dir_pairs,
        incremental,
    );
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

/// An external (out-of-workspace) package — typically a workspace sibling
/// symlinked into `node_modules` — whose `.svelte` files are referenced by the
/// project under check. Its shadows are emitted under `<cache>/ext/<id>/` and
/// bridged to the real source dir via a `rootDirs` pair, so a cross-package
/// `import { x } from '@scope/pkg/…'` resolves to the component's real module
/// (its `<script module>` named exports + default) instead of the ambient
/// `*.svelte` wildcard (default-only) — the #782 false "has no exported member".
struct ExternalPackage {
    /// Canonical (symlink-resolved) source dir of the package.
    real_dir: PathBuf,
    /// Cache mirror dir that holds the emitted shadows.
    mirror_dir: PathBuf,
    svelte_files: Vec<PathBuf>,
}

/// Discover workspace-sibling packages reachable through the project's
/// `node_modules` symlinks (pnpm / npm / yarn link a monorepo package's real
/// source dir into `node_modules/<name>`). Registry deps — whose realpath stays
/// inside a `node_modules` store — and in-workspace targets are skipped; only
/// packages that actually contain `.svelte` files are returned. Each gets a
/// distinct `<cache>/ext/<n>` mirror dir.
fn discover_external_svelte_packages(workspace: &Path, cache_dir: &Path) -> Vec<ExternalPackage> {
    let nm = workspace.join("node_modules");
    let mut candidates: Vec<PathBuf> = Vec::new();
    if let Ok(rd) = fs::read_dir(&nm) {
        for e in rd.flatten() {
            let name = e.file_name();
            let name = name.to_string_lossy();
            if name == ".bin" || name == ".pnpm" || name == ".cache" {
                continue;
            }
            let p = e.path();
            if name.starts_with('@') {
                // Scoped: descend one level (`@scope/<pkg>`).
                if let Ok(scoped) = fs::read_dir(&p) {
                    for se in scoped.flatten() {
                        candidates.push(se.path());
                    }
                }
            } else {
                candidates.push(p);
            }
        }
    }
    let ws_real = fs::canonicalize(workspace).unwrap_or_else(|_| workspace.to_path_buf());
    let mut out: Vec<ExternalPackage> = Vec::new();
    let mut seen: std::collections::HashSet<PathBuf> = std::collections::HashSet::new();
    for cand in candidates {
        // Resolve symlinks: workspace deps point at the package's real source.
        let Ok(real) = fs::canonicalize(&cand) else {
            continue;
        };
        // A registry dep's realpath stays inside a `node_modules` store — its
        // own `.d.ts` ships with it, so don't shadow it.
        if real.components().any(|c| c.as_os_str() == "node_modules") {
            continue;
        }
        // In-workspace targets are already covered by the primary overlay.
        if real.starts_with(&ws_real) {
            continue;
        }
        if !seen.insert(real.clone()) {
            continue;
        }
        let svelte_files = super::walker::find_svelte_files(&real, &[]);
        if svelte_files.is_empty() {
            continue;
        }
        let mirror_dir = cache_dir.join("ext").join(out.len().to_string());
        out.push(ExternalPackage {
            real_dir: real,
            mirror_dir,
            svelte_files,
        });
    }
    out
}

/// Symlink `<dst>` → `<src>` (a directory), cross-platform.
fn symlink_dir(src: &Path, dst: &Path) -> std::io::Result<()> {
    #[cfg(unix)]
    {
        std::os::unix::fs::symlink(src, dst)
    }
    #[cfg(windows)]
    {
        std::os::windows::fs::symlink_dir(src, dst)
    }
    #[cfg(not(any(unix, windows)))]
    {
        let _ = (src, dst);
        Ok(())
    }
}

/// Emit `.tsx` + `.d.ts` shadows for one external package's `.svelte` files into
/// its cache mirror, preserving each file's path relative to the package root.
/// Non-incremental (external packages change rarely and are bounded by the
/// dependency set).
fn emit_external_shadows(pkg: &ExternalPackage) -> Result<(), OverlayError> {
    // Mirror the package's own `node_modules` into the shadow dir so the
    // shadow's bare-package imports (`import type { X } from 'sortablejs'`,
    // incl. its `@types/*` declarations) resolve from the SAME context as the
    // real package. The shadows live under `<cache>/ext/<n>/`, where TS's
    // walk-up would otherwise reach the *workspace* `node_modules` and miss a
    // dependency present only in the external package's tree — silently
    // degrading the imported type to `any` (and poisoning `ComponentProps<…>`
    // in every consumer). A symlink keeps resolution identical to in-place
    // checking without copying or rewriting specifiers.
    let real_nm = pkg.real_dir.join("node_modules");
    let mirror_nm = pkg.mirror_dir.join("node_modules");
    if real_nm.is_dir() && !mirror_nm.exists() {
        fs::create_dir_all(&pkg.mirror_dir)?;
        let _ = symlink_dir(&real_nm, &mirror_nm);
    }
    for abs_source in &pkg.svelte_files {
        let rel = safe_relative(abs_source, &pkg.real_dir);
        let tsx_path = pkg.mirror_dir.join(append_extension(&rel, ".tsx"));
        let dts_path = pkg.mirror_dir.join(append_extension(&rel, ".d.ts"));
        if let Some(parent) = tsx_path.parent() {
            fs::create_dir_all(parent)?;
        }
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
            emit_jsdoc: true,
            // Imports that stay within the external package keep resolving via
            // the package↔mirror `rootDirs` pair; only imports escaping the
            // package get rebased.
            rewrite_external_imports: Some(RewriteExternalImportsOptions {
                source_path: abs_source.display().to_string(),
                generated_path: tsx_path.display().to_string(),
                workspace_path: pkg.real_dir.display().to_string(),
            }),
        };
        let result = svelte2tsx(&source, opts).map_err(|e| OverlayError::Svelte2Tsx {
            file: abs_source.clone(),
            message: format!("{e}"),
        })?;
        let mut tsx_code = result.code.clone();
        if let Some(spec) = companion_reexport_specifier(abs_source, &tsx_path) {
            let _ = writeln!(tsx_code, "\nexport * from \"{spec}\";");
        }
        fs::write(&tsx_path, &tsx_code)?;
        let import_basename = tsx_path
            .file_name()
            .and_then(|s| s.to_str())
            .unwrap_or("missing.tsx");
        let dts_content = format!(
            "export {{ default }} from \"./{0}\";\nexport * from \"./{0}\";\n",
            import_basename
        );
        fs::write(&dts_path, dts_content)?;
    }
    Ok(())
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
        let rel = safe_relative(&abs, workspace);
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

/// Mirror each SvelteKit route's generated `$types.d.ts` next to the
/// route's shadows under `<emit_dir>/<route-rel>/$types.d.ts`, rewriting
/// the `import('…/+layout.js').load` / `+page.js` reverse-references so
/// they point at the **injected** mirror route file (co-located
/// `./+layout.js`) rather than the raw on-disk source.
///
/// Why this is needed: svelte-kit's `$types.d.ts` derives `PageData` /
/// `LayoutData` from `ReturnType<typeof import('…/+layout.js').load>`.
/// That specifier resolves (via the overlay `rootDirs`) to the *source*
/// `+layout.ts`, whose `load` event is un-annotated — so an un-typed
/// `await parent()` collapses streamed/parent props to `any`, surfacing
/// as spurious `implicitly has an 'any' type` at the consuming `.svelte`.
/// `materialize_kit_files` already writes an injected mirror (`(…)
/// satisfies LayoutLoad`) that types the event, but nothing referenced it
/// because the un-rewritten `$types` still pointed at the source.
///
/// Official svelte-check sidesteps this entirely: its in-memory language
/// service serves the injected text *as* the source file's content, so
/// the source path is already authoritative. A subprocess driver (tsc /
/// tsgo over a real overlay dir) can't overlay on-disk content, so we
/// instead co-locate a rewritten `$types.d.ts` with the shadows — an
/// exact-directory match that wins over the `rootDirs` route to the
/// source copy, with no global `rootDirs` reordering (which would perturb
/// resolution for every non-kit file).
fn materialize_kit_types(
    workspace: &Path,
    emit_dir: &Path,
    kit_files: &[PathBuf],
) -> Result<(), OverlayError> {
    let kit_types_dir = workspace.join(".svelte-kit").join("types");
    if !kit_types_dir.is_dir() {
        // No `svelte-kit sync` output (or a custom `outDir`) — nothing to
        // mirror. The shadows fall back to the source `$types` via
        // `rootDirs`, exactly as before this pass existed.
        return Ok(());
    }

    // Unique route directories (workspace-relative) that own a route file.
    let mut route_dirs: BTreeMap<PathBuf, ()> = BTreeMap::new();
    for source in kit_files {
        let abs = if source.is_absolute() {
            source.clone()
        } else {
            workspace.join(source)
        };
        if !kit_file::is_kit_route_file(&abs) {
            continue;
        }
        let rel = abs.strip_prefix(workspace).unwrap_or(&abs);
        if let Some(dir) = rel.parent() {
            route_dirs.insert(dir.to_path_buf(), ());
        }
    }

    for dir in route_dirs.keys() {
        let types_src = kit_types_dir.join(dir).join("$types.d.ts");
        if !types_src.is_file() {
            continue;
        }
        let Ok(text) = fs::read_to_string(&types_src) else {
            continue;
        };
        let mirror_dir = emit_dir.join(dir);
        let rewritten = rewrite_kit_types_route_imports(&text, &mirror_dir);
        let dest = mirror_dir.join("$types.d.ts");
        if let Some(parent) = dest.parent() {
            fs::create_dir_all(parent)?;
        }
        fs::write(&dest, rewritten)?;

        // When the source `load` carries an explicit `: LayoutLoad` /
        // `: PageLoad` annotation, svelte-kit doesn't reverse-reference the
        // source file; it emits a sibling `proxy+layout.ts` (`@ts-nocheck`,
        // event typed via `Parameters<LayoutLoad>[0]`) and points `$types`
        // at `./proxy+layout.js`. That proxy in turn imports `./$types.ts`
        // — so unless we co-locate it next to our rewritten `$types`, the
        // proxy resolves back to the *source* `$types` (and its un-typed
        // parent chain), reintroducing the `any`. Copy the proxies verbatim
        // into the mirror dir so the whole chain stays on the mirror tree.
        let types_route_dir = kit_types_dir.join(dir);
        if let Ok(read_dir) = fs::read_dir(&types_route_dir) {
            for entry in read_dir.flatten() {
                let name = entry.file_name();
                let Some(name_str) = name.to_str() else {
                    continue;
                };
                if name_str.starts_with("proxy+")
                    && name_str.ends_with(".ts")
                    && let Ok(proxy_text) = fs::read_to_string(entry.path())
                {
                    fs::write(mirror_dir.join(name_str), proxy_text)?;
                }
            }
        }
    }
    Ok(())
}

/// Rewrite `import('…/+layout.js')` (and `+page.js`, `+{layout,page}.server.js`)
/// reverse-references inside a route's `$types.d.ts` to the co-located
/// injected mirror (`./+layout.js`, …), but only when that mirror exists
/// in `mirror_dir` — otherwise the specifier is left untouched so it still
/// resolves to the source via `rootDirs`. A route's `$types` only ever
/// reverse-references its *own* route files (parent data flows through
/// `import('…/$types.js')`, which is deliberately not matched), so a
/// basename-keyed rewrite is unambiguous.
fn rewrite_kit_types_route_imports(text: &str, mirror_dir: &Path) -> String {
    // `import( <q> <maybe-path>/ +layout .js <q> )` → capture quote + basename.
    static RE: std::sync::LazyLock<regex::Regex> = std::sync::LazyLock::new(|| {
        regex::Regex::new(
            r#"import\((['"])(?:[^'"]*/)?(\+(?:layout|page)(?:\.server)?)\.js(['"])\)"#,
        )
        .expect("static kit-$types import regex")
    });
    RE.replace_all(text, |caps: &regex::Captures| {
        let quote = &caps[1];
        let base = &caps[2];
        if mirror_dir.join(format!("{base}.ts")).is_file() {
            format!("import({quote}./{base}.js{quote})")
        } else {
            caps[0].to_string()
        }
    })
    .into_owned()
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

/// Rebase `abs` under `base` for use as an emit path, guaranteeing the
/// result can never escape a subsequent `emit_dir.join(..)`. A plain
/// `strip_prefix(base).unwrap_or(abs)` returns the *absolute* input when
/// `abs` is not under `base`, and `Path::join` discards its left operand
/// on an absolute right operand — so the overlay would write outside its
/// cache directory. Here we fall back to the bare file name (always
/// contained) and reject any `..` / root component that survived.
fn safe_relative(abs: &Path, base: &Path) -> PathBuf {
    if let Ok(rel) = abs.strip_prefix(base) {
        let escapes = rel.components().any(|c| {
            matches!(
                c,
                std::path::Component::ParentDir
                    | std::path::Component::RootDir
                    | std::path::Component::Prefix(_)
            )
        });
        if !rel.as_os_str().is_empty() && !escapes {
            return rel.to_path_buf();
        }
    }
    abs.file_name()
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("__unnamed"))
}

/// Quick lexical sniff for `<script lang="ts">` so the v0.2 overlay can
/// pass the right `is_ts_file` to svelte2tsx without re-parsing.
fn looks_like_ts_svelte(source: &str) -> bool {
    let lower = source.to_ascii_lowercase();
    lower.contains("lang=\"ts\"") || lower.contains("lang='ts'") || lower.contains("lang=ts")
}

fn build_overlay_tsconfig(
    cache_dir: &Path,
    original: Option<&Path>,
    workspace: &Path,
    ext_root_dir_pairs: &[(PathBuf, PathBuf)],
    incremental: bool,
) -> String {
    let mut obj: BTreeMap<&str, serde_json::Value> = BTreeMap::new();
    if let Some(orig) = original {
        let rel = path_relative(cache_dir, orig);
        obj.insert("extends", serde_json::Value::String(rel));
    }
    let mut compiler_opts = serde_json::Map::new();
    compiler_opts.insert("noEmit".into(), true.into());
    compiler_opts.insert("allowArbitraryExtensions".into(), true.into());
    // In `--incremental` mode, hand the compiler a `tsBuildInfoFile` so tsgo /
    // tsc persist their program graph + per-file check state across runs.
    // Without this the manifest only short-circuits svelte2tsx; the compiler
    // still re-parses + re-checks all ~8k program files every invocation
    // (the dominant cost). The overlay tsconfig is byte-stable across runs, so
    // the build-info stays valid and an unchanged warm run drops from ~5.5s to
    // ~1s. The path is relative to the overlay tsconfig (this `cache_dir`).
    if incremental {
        compiler_opts.insert("incremental".into(), true.into());
        compiler_opts.insert(
            "tsBuildInfoFile".into(),
            "./tsgo.tsbuildinfo".to_string().into(),
        );
    }
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
        .unwrap_or_default();
    // Always pair the workspace source root with the `<cache>/svelte` shadow
    // mirror. `rootDirs` is what bridges a `.svelte` import to its generated
    // `.tsx` shadow, but TS applies it only to RELATIVE specifiers resolved
    // across the listed roots — so a plain `.ts` / `.svelte.ts` source file
    // importing `./Foo.svelte` needs the workspace root present to reach the
    // mirror. SvelteKit projects declare `rootDirs: ["..", …]` (workspace
    // included), but a project without its own `rootDirs` would otherwise fall
    // back to the cache dir alone and lose the bridge entirely — every
    // `.svelte` import from a `.ts` file then resolves to nothing (`any`),
    // which silently poisons e.g. `ComponentProps<typeof Foo>`.
    if !root_dirs_abs.iter().any(|p| p == workspace) {
        root_dirs_abs.push(workspace.to_path_buf());
    }
    root_dirs_abs.push(cache_dir.join("svelte"));
    // Each external package contributes a `rootDirs` pair: its real source dir
    // and the cache mirror holding its shadows. TypeScript then treats both as
    // the same virtual dir, so `import … from '@scope/pkg/Foo.svelte'` (resolved
    // through the package's real source) finds `Foo.svelte.tsx` in the mirror.
    for (real_dir, mirror_dir) in ext_root_dir_pairs {
        root_dirs_abs.push(real_dir.clone());
        root_dirs_abs.push(mirror_dir.clone());
    }
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
    // Scan raw bytes but copy them through verbatim (never `c as char`,
    // which would mangle any multi-byte UTF-8 sequence). Comment markers
    // are all ASCII, so byte-level detection is exact; non-ASCII bytes only
    // ever appear inside string literals or values and pass through intact.
    let mut out: Vec<u8> = Vec::with_capacity(src.len());
    let bytes = src.as_bytes();
    let mut i = 0;
    let mut in_string = false;
    let mut escape = false;
    while i < bytes.len() {
        let c = bytes[i];
        if in_string {
            out.push(c);
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
            out.push(c);
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
        out.push(c);
        i += 1;
    }
    // Every retained byte came unaltered from a valid UTF-8 `&str`, and we
    // only ever drop whole ASCII comment spans, so the result stays UTF-8.
    String::from_utf8(out).unwrap_or_else(|e| String::from_utf8_lossy(e.as_bytes()).into_owned())
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

/// If `abs_source` (`…/Foo.svelte`) has a sibling companion module
/// (`Foo.svelte.ts` or `Foo.svelte.js`), return a module specifier — relative
/// to the component shadow's directory and ending in `.js` so TS strips it and
/// finds the real file — suitable for an `export * from "…"` re-export appended
/// to the shadow `.tsx`. Returns `None` when no companion exists.
fn companion_reexport_specifier(abs_source: &Path, tsx_path: &Path) -> Option<String> {
    let from_dir = tsx_path.parent()?;
    for ext in [".ts", ".js"] {
        let mut cand = abs_source.as_os_str().to_os_string();
        cand.push(ext);
        let cand = PathBuf::from(cand);
        if cand.is_file() {
            let mut spec = path_relative(from_dir, &cand);
            if !spec.starts_with('.') {
                spec = format!("./{spec}");
            }
            // TS resolves `./x.svelte.js` by stripping `.js` and finding the
            // real `.ts`/`.js`; normalise a `.ts` companion's specifier to `.js`.
            if let Some(stripped) = spec.strip_suffix(".ts") {
                spec = format!("{stripped}.js");
            }
            return Some(spec);
        }
    }
    None
}

/// Build the module resolver used to re-point tsconfig-alias `.svelte` imports
/// at their shadow `.tsx`. `None` when there is no project tsconfig (aliases
/// can only come from a tsconfig's `paths`/`baseUrl`).
fn build_svelte_import_resolver(tsconfig: Option<&Path>) -> Option<oxc_resolver::Resolver> {
    use oxc_resolver::{
        ResolveOptions, Resolver, TsconfigDiscovery, TsconfigOptions, TsconfigReferences,
    };
    let tsconfig = tsconfig?;
    Some(Resolver::new(ResolveOptions {
        extensions: vec![
            ".svelte".into(),
            ".ts".into(),
            ".tsx".into(),
            ".js".into(),
            ".jsx".into(),
            ".json".into(),
        ],
        tsconfig: Some(TsconfigDiscovery::Manual(TsconfigOptions {
            config_file: tsconfig.to_path_buf(),
            references: TsconfigReferences::Auto,
        })),
        condition_names: vec!["svelte".into(), "import".into(), "default".into()],
        ..ResolveOptions::default()
    }))
}

/// Rewrite non-relative `.svelte` import specifiers (tsconfig path aliases like
/// `$lib/Foo.svelte`) in a generated shadow `.tsx` so they point straight at
/// the target component's shadow `.tsx` under `emit_dir`. Relative `.svelte`
/// imports are left as-is — the overlay's `rootDirs` already bridges those to
/// shadows, and TS only applies `rootDirs` to relative specifiers.
///
/// Only specifiers that oxc_resolver maps to a `.svelte` file UNDER the
/// workspace are rewritten; bare packages, `.svelte.ts` companions and
/// cross-package components are untouched.
fn rewrite_aliased_svelte_imports(
    tsx: &str,
    abs_source: &Path,
    tsx_path: &Path,
    workspace: &Path,
    emit_dir: &Path,
    resolver: &oxc_resolver::Resolver,
) -> String {
    let (Some(source_dir), Some(generated_dir)) = (abs_source.parent(), tsx_path.parent()) else {
        return tsx.to_string();
    };
    // oxc_resolver returns canonicalised paths (symlinks resolved), so compare
    // against a canonicalised workspace — otherwise a symlinked root (e.g.
    // macOS `/var` → `/private/var`) makes `strip_prefix` spuriously fail and
    // no alias gets rewritten.
    let workspace_canon = workspace
        .canonicalize()
        .unwrap_or_else(|_| workspace.to_path_buf());

    let decide = |spec: &str| -> Option<String> {
        if spec.starts_with('.') {
            return None;
        }
        let path_part = spec.split(['?', '#']).next().unwrap_or(spec);
        if !path_part.ends_with(".svelte") {
            return None;
        }
        let resolution = resolver.resolve(source_dir, spec).ok()?;
        let resolved = resolution.path();
        if resolved.extension().and_then(|e| e.to_str()) != Some("svelte") {
            return None;
        }
        let resolved_canon = resolved
            .canonicalize()
            .unwrap_or_else(|_| resolved.to_path_buf());
        let rel = resolved_canon.strip_prefix(&workspace_canon).ok()?;
        let shadow = append_extension(&emit_dir.join(rel), ".tsx");
        let mut rewritten = lexical_relative_posix(generated_dir, &shadow);
        if !rewritten.starts_with('.') {
            rewritten = format!("./{rewritten}");
        }
        Some(rewritten)
    };

    rewrite_module_specifiers(tsx, &decide)
}

/// Scan `text` for `from "<spec>"` / `import("<spec>")` module specifiers and
/// replace each one for which `decide` returns `Some(replacement)`. String
/// literals and line comments are skipped so only real specifiers are touched.
/// (Same scanner shape as svelte2tsx's `rewrite_external_specifiers_in_text`.)
fn rewrite_module_specifiers(text: &str, decide: &dyn Fn(&str) -> Option<String>) -> String {
    let bytes = text.as_bytes();
    let len = bytes.len();
    let is_ws = |b: u8| matches!(b, b' ' | b'\t' | b'\n' | b'\r');
    let is_ident = |b: u8| b.is_ascii_alphanumeric() || b == b'_' || b == b'$';
    let mut out = String::with_capacity(len);
    let mut copied = 0usize;
    let mut i = 0usize;
    let emit = |spec_start: usize, spec_end: usize, out: &mut String, copied: &mut usize| {
        if let Some(rep) = decide(&text[spec_start..spec_end]) {
            out.push_str(&text[*copied..spec_start]);
            out.push_str(&rep);
            *copied = spec_end;
        }
    };
    while i < len {
        let b = bytes[i];
        if b == b'\'' || b == b'"' {
            let q = b;
            i += 1;
            while i < len && bytes[i] != q {
                if bytes[i] == b'\\' && i + 1 < len {
                    i += 2;
                    continue;
                }
                i += 1;
            }
            i = (i + 1).min(len);
            continue;
        }
        if b == b'/' && i + 1 < len && bytes[i + 1] == b'/' {
            while i < len && bytes[i] != b'\n' {
                i += 1;
            }
            continue;
        }
        if b == b'f' && i + 4 <= len && &bytes[i..i + 4] == b"from" {
            let prev_ok = i == 0 || !is_ident(bytes[i - 1]);
            if prev_ok {
                let mut j = i + 4;
                while j < len && is_ws(bytes[j]) {
                    j += 1;
                }
                if j < len && (bytes[j] == b'\'' || bytes[j] == b'"') {
                    let q = bytes[j];
                    let spec_start = j + 1;
                    let mut spec_end = spec_start;
                    while spec_end < len && bytes[spec_end] != q {
                        spec_end += 1;
                    }
                    emit(spec_start, spec_end, &mut out, &mut copied);
                    i = (spec_end + 1).min(len);
                    continue;
                }
            }
        }
        if b == b'i' && i + 6 <= len && &bytes[i..i + 6] == b"import" {
            let prev_ok = i == 0 || !is_ident(bytes[i - 1]);
            if prev_ok {
                let mut j = i + 6;
                while j < len && is_ws(bytes[j]) {
                    j += 1;
                }
                if j < len && bytes[j] == b'(' {
                    j += 1;
                    while j < len && is_ws(bytes[j]) {
                        j += 1;
                    }
                    if j < len && (bytes[j] == b'\'' || bytes[j] == b'"') {
                        let q = bytes[j];
                        let spec_start = j + 1;
                        let mut spec_end = spec_start;
                        while spec_end < len && bytes[spec_end] != q {
                            spec_end += 1;
                        }
                        emit(spec_start, spec_end, &mut out, &mut copied);
                        i = (spec_end + 1).min(len);
                        continue;
                    }
                }
            }
        }
        i += 1;
    }
    if copied < text.len() {
        out.push_str(&text[copied..]);
    }
    out
}

/// Lexical POSIX relative path from `from_dir` to `to_path` — no filesystem
/// access (the shadow `.tsx` may not be written yet), so symlink resolution
/// can't skew the result the way [`path_relative`]'s `canonicalize` would.
fn lexical_relative_posix(from_dir: &Path, to_path: &Path) -> String {
    use std::path::Component;
    let comps = |p: &Path| -> Vec<String> {
        p.components()
            .filter(|c| !matches!(c, Component::RootDir | Component::Prefix(_)))
            .map(|c| c.as_os_str().to_string_lossy().into_owned())
            .collect()
    };
    let from = comps(from_dir);
    let to = comps(to_path);
    let common = from.iter().zip(&to).take_while(|(a, b)| a == b).count();
    let mut parts: Vec<String> = vec!["..".to_string(); from.len() - common];
    parts.extend(to[common..].iter().cloned());
    if parts.is_empty() {
        ".".to_string()
    } else {
        parts.join("/")
    }
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
    fn strip_jsonc_comments_preserves_non_ascii() {
        // A tsconfig with a multi-byte UTF-8 comment and a multi-byte value.
        // The comment is dropped whole; the string value survives verbatim.
        let src = "{\n  // コメント — dropped\n  \"paths\": { \"@app/*\": [\"./ソース/*\"] } /* ブロック */\n}\n";
        let out = strip_jsonc_comments(src);
        assert!(out.is_char_boundary(out.len()));
        assert!(
            out.contains("./ソース/*"),
            "non-ASCII string value must survive intact: {out}"
        );
        assert!(
            !out.contains("コメント"),
            "line comment must be stripped: {out}"
        );
        assert!(
            !out.contains("ブロック"),
            "block comment must be stripped: {out}"
        );
        // Result must be valid JSON once comments are gone.
        let parsed: serde_json::Value = serde_json::from_str(&out).expect("valid JSON after strip");
        assert_eq!(parsed["paths"]["@app/*"][0], "./ソース/*");
    }

    #[test]
    fn rewrites_kit_types_route_imports_to_colocated_mirror() {
        let tmp = std::env::temp_dir().join(format!("svc_kittypes_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(&tmp).unwrap();
        // A co-located injected mirror exists for +layout but NOT +page.
        fs::write(tmp.join("+layout.ts"), b"export const load = () => ({});\n").unwrap();

        let text = concat!(
            "type A = import('../../../../../$types.js').LayoutData;\n",
            "type L = ReturnType<typeof import('../../../../src/routes/x/+layout.js').load>;\n",
            "type P = ReturnType<typeof import('../../../../src/routes/x/+page.js').load>;\n",
            "import type * as Kit from '@sveltejs/kit';\n",
        );
        let out = rewrite_kit_types_route_imports(text, &tmp);

        // Own +layout.js reverse-ref → co-located mirror (mirror exists).
        assert!(
            out.contains("import('./+layout.js')"),
            "+layout.js should be rewritten to the co-located mirror: {out}"
        );
        // +page.js left untouched — no mirror on disk, must still resolve
        // to the source via rootDirs rather than become a dangling import.
        assert!(
            out.contains("src/routes/x/+page.js"),
            "+page.js must be left untouched when no mirror exists: {out}"
        );
        // Parent-data `$types.js` and bare `@sveltejs/kit` are never matched.
        assert!(out.contains("import('../../../../../$types.js')"), "{out}");
        assert!(out.contains("from '@sveltejs/kit'"), "{out}");

        let _ = fs::remove_dir_all(&tmp);
    }

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
    fn incremental_overlay_tsconfig_enables_tsbuildinfo() {
        let tmp = std::env::temp_dir().join(format!("svc_overlay_inctsc_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(tmp.join("src")).unwrap();
        let svelte_path = tmp.join("src/App.svelte");
        fs::File::create(&svelte_path)
            .unwrap()
            .write_all(b"<script>let x = 0;</script>{x}")
            .unwrap();
        let files = vec![svelte_path];

        // Non-incremental: no compiler-side build info (each run is cold).
        let layout = materialize_overlay_with(&tmp, &files, None, false).unwrap();
        let cfg: serde_json::Value =
            serde_json::from_str(&fs::read_to_string(&layout.overlay_tsconfig).unwrap()).unwrap();
        assert!(
            cfg["compilerOptions"]["incremental"].is_null(),
            "non-incremental overlay must not set incremental"
        );

        // Incremental: hand tsgo/tsc a `tsBuildInfoFile` so the compiler caches
        // its program graph across runs (the warm-run speedup).
        let layout = materialize_overlay_with(&tmp, &files, None, true).unwrap();
        let cfg: serde_json::Value =
            serde_json::from_str(&fs::read_to_string(&layout.overlay_tsconfig).unwrap()).unwrap();
        assert_eq!(
            cfg["compilerOptions"]["incremental"],
            serde_json::json!(true)
        );
        assert_eq!(
            cfg["compilerOptions"]["tsBuildInfoFile"],
            serde_json::json!("./tsgo.tsbuildinfo")
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

    #[test]
    fn rewrite_module_specifiers_targets_only_real_specifiers() {
        let src = "import A from '$lib/A.svelte';\n\
                   export { x } from '$lib/B.svelte';\n\
                   const m = import(\"./rel.svelte\");\n\
                   const s = \"$lib/A.svelte is not a specifier\";\n";
        let out = rewrite_module_specifiers(src, &|spec| {
            spec.strip_prefix("$lib/")
                .map(|rest| format!("./shadow/{rest}"))
        });
        // `from '<alias>'` (import + re-export) is rewritten …
        assert!(out.contains("from './shadow/A.svelte'"), "{out}");
        assert!(out.contains("from './shadow/B.svelte'"), "{out}");
        // … the relative dynamic import is left alone by this decider …
        assert!(out.contains("import(\"./rel.svelte\")"), "{out}");
        // … and a bare string literal that merely looks like a specifier is
        // not touched (the scanner skips string-literal bodies).
        assert!(
            out.contains("\"$lib/A.svelte is not a specifier\""),
            "{out}"
        );
    }

    #[test]
    fn aliased_svelte_import_is_rewritten_to_its_shadow() {
        let tmp = std::env::temp_dir().join(format!("svc_alias_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(tmp.join("src/lib")).unwrap();
        fs::write(
            tmp.join("tsconfig.json"),
            "{\"compilerOptions\":{\"paths\":{\"$lib/*\":[\"./src/lib/*\"]}}}",
        )
        .unwrap();
        fs::write(
            tmp.join("src/lib/Button.svelte"),
            "<script lang=\"ts\">let { n }: { n: number } = $props();</script>\n<button>{n}</button>\n",
        )
        .unwrap();
        fs::write(
            tmp.join("src/App.svelte"),
            "<script lang=\"ts\">import Button from '$lib/Button.svelte';</script>\n<Button n={1} />\n",
        )
        .unwrap();

        let files = vec![
            tmp.join("src/App.svelte"),
            tmp.join("src/lib/Button.svelte"),
        ];
        let tsconfig = tmp.join("tsconfig.json");
        materialize_overlay_with(&tmp, &files, Some(&tsconfig), false).unwrap();

        let app_tsx =
            fs::read_to_string(tmp.join(".svelte-check/svelte/src/App.svelte.tsx")).unwrap();
        // The `$lib/Button.svelte` alias is gone, replaced by a concrete
        // relative path at Button's shadow `.tsx` (which TS resolves directly,
        // unlike the alias `rootDirs` can't bridge).
        assert!(
            !app_tsx.contains("$lib/Button.svelte"),
            "alias was not rewritten:\n{app_tsx}"
        );
        assert!(
            app_tsx.contains("Button.svelte.tsx"),
            "rewrite did not point at the shadow:\n{app_tsx}"
        );

        let _ = fs::remove_dir_all(&tmp);
    }
}
