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
//!   named exports (so import-by-name still resolves), and a
//!   `<rel>.d.svelte.ts` twin of it (see `write_esm_bridge`).
//! - The emitted overlay tsconfig EXTENDS the original tsconfig.json
//!   instead of duplicating compiler options.

use std::collections::BTreeMap;
use std::fmt::Write as _;
use std::fs;
use std::io;
use std::path::{Path, PathBuf};

use oxc_allocator::Allocator;
use oxc_ast::ast as oxc;
use oxc_parser::Parser as OxcParser;
use oxc_span::SourceType;

use super::config::CompilerOptionsSettings;
use super::diagnostic::{Diagnostic, DiagnosticSeverity, Position, Range};
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
    (SHIM_SHIMS_V4_NAME, SHIM_SVELTE_SHIMS_V4),
    (SHIM_JSX_V4_NAME, SHIM_SVELTE_JSX_V4),
];

const SHIM_SHIMS_V4_NAME: &str = "svelte-shims-v4.d.ts";
const SHIM_JSX_V4_NAME: &str = "svelte-jsx-v4.d.ts";

/// The `svelte` package file that supersedes the vendored JSX shim.
const SVELTE_HTML_DTS: &str = "svelte-html.d.ts";

/// Cache-dir name of the rewritten copy of the installed svelte's bundled
/// declarations (see [`materialize_svelte_types_shadow`]).
const SVELTE_TYPES_SHADOW_NAME: &str = "svelte-types.d.ts";

/// The ambient `.d.ts` environment handed to the overlay program — the port
/// of `get_global_types`
/// (`submodules/language-tools/packages/svelte2tsx/src/helpers/files.ts`).
#[derive(Debug, Clone, PartialEq, Eq)]
struct GlobalTypes {
    /// Vendored shims (basenames from [`SHIM_FILES`]) to materialise into
    /// the cache dir and list in the overlay tsconfig.
    shims: Vec<&'static str>,
    /// The installed `svelte` package's `svelte-html.d.ts`, when present.
    svelte_html: Option<PathBuf>,
    /// The cache-dir copy of the installed `svelte` package's bundled
    /// declarations with its ambient `*.svelte` wildcard blanked out, plus the
    /// module names it declares (see [`materialize_svelte_types_shadow`]).
    svelte_types: Option<SvelteTypesShadow>,
}

/// The rewritten copy of `svelte/types/index.d.ts` and every ambient module
/// name it declares, which the overlay tsconfig redirects onto it.
#[derive(Debug, Clone, PartialEq, Eq)]
struct SvelteTypesShadow {
    path: PathBuf,
    modules: Vec<String>,
    /// Directory to put first in `typeRoots` so a `/// <reference types="svelte" />`
    /// resolves to the stub inside it instead of the original declarations (see
    /// [`materialize_svelte_type_ref_stub`]).
    type_ref_root: PathBuf,
}

/// The installed `svelte` package, as `getPackageInfo('svelte', …)` in
/// `language-server/src/importPackage.ts` resolves it.
struct SveltePackage {
    dir: PathBuf,
    major: Option<u32>,
}

/// Port of `get_global_types`' file selection. Upstream prefers the
/// project's own `<sveltePath>/svelte-html.d.ts` (Svelte 4+) and then omits
/// `svelte-jsx-v4.d.ts`, because the vendored shim hand-enumerates
/// `IntrinsicElements` while `svelte-html.d.ts` extends `SvelteHTMLElements`
/// from the installed `svelte/elements` — so it tracks the user's Svelte
/// version instead of freezing at the snapshot date (#1889).
///
/// Two upstream branches are deliberately not reproduced: the Svelte 3 shim
/// pair (`svelte-shims.d.ts` / `svelte-jsx.d.ts`), which rsvelte does not
/// vendor because it is a Svelte 5 compiler — Svelte 3 falls back to the v4
/// pair; and `svelte-native-jsx.d.ts`, which only types the
/// `svelteNative.JSX` typings namespace rsvelte never emits — upstream selects
/// that one from the tsconfig's `svelteOptions.namespace`, a separate input
/// from `compilerOptions.namespace`, matching svelte-check's own commented-out
/// entry in `incremental.ts`.
fn select_global_types(workspace: &Path, cache_dir: &Path) -> GlobalTypes {
    // The resolved path is written into the overlay tsconfig, which lives in
    // a different directory than the CLI's cwd a relative `--workspace`
    // resolves against.
    let root = fs::canonicalize(workspace).unwrap_or_else(|_| workspace.to_path_buf());
    let package = resolve_svelte_package(&root);
    let svelte_html = package.as_ref().and_then(|pkg| {
        if pkg.major == Some(3) {
            return None;
        }
        let path = pkg.dir.join(SVELTE_HTML_DTS);
        path.is_file().then_some(path)
    });
    let svelte_types = package
        .as_ref()
        .and_then(|pkg| materialize_svelte_types_shadow(&pkg.dir, cache_dir));
    let mut shims = vec![SHIM_SHIMS_V4_NAME];
    if svelte_html.is_none() {
        shims.push(SHIM_JSX_V4_NAME);
    }
    GlobalTypes {
        shims,
        svelte_html,
        svelte_types,
    }
}

/// The `declare module '*.svelte'` block svelte ships in its bundled
/// declarations.
const SVELTE_AMBIENT_WILDCARD: &str = "declare module '*.svelte' {";

/// Cache-dir subdirectory holding the `svelte` type-reference stub package,
/// used as the first `typeRoots` entry.
const SVELTE_TYPE_REF_DIR: &str = "svelte-type-ref";

/// Copy the installed svelte's `types/index.d.ts` into the cache dir with its
/// ambient `declare module '*.svelte'` block blanked out, mirroring what
/// official svelte-check does to the same file as it reads it
/// (`DocumentSnapshot.fromNonSvelteFilePath`).
///
/// That wildcard is the difference between a `.svelte` specifier that fails to
/// resolve being an error and being silently typed as a default-only component:
/// with it in the program, a missing file reads as `TS2614` on a named import
/// instead of official's `TS2307` / `TS7016` (#2061). We cannot intercept the
/// compiler's reads the way a language-service host can, so the copy is
/// redirected onto instead — see [`svelte_types_path_overrides`]. The block is
/// replaced with spaces down to the newline, byte for byte as upstream does it,
/// so a position anywhere in the file is the one official would report.
fn materialize_svelte_types_shadow(
    package_dir: &Path,
    cache_dir: &Path,
) -> Option<SvelteTypesShadow> {
    let source = package_dir.join("types").join("index.d.ts");
    let text = fs::read_to_string(&source).ok()?;
    let start = text.find(SVELTE_AMBIENT_WILDCARD)?;
    let end = text[start..].find("\n}").map(|i| start + i + 2)?;
    let mut blanked = String::with_capacity(text.len());
    blanked.push_str(&text[..start]);
    blanked.extend(std::iter::repeat_n(' ', end - start));
    blanked.push_str(&text[end..]);

    // Read off the original: blanking the block's newlines splices its line
    // into the next declaration's.
    let modules = text
        .lines()
        .filter_map(|line| {
            let rest = line.strip_prefix("declare module ")?;
            let quote = rest.chars().next()?;
            let name = rest[1..].split(quote).next()?;
            (!name.contains('*')).then(|| name.to_string())
        })
        .collect::<Vec<_>>();
    if modules.is_empty() {
        return None;
    }

    let type_ref_root = materialize_svelte_type_ref_stub(cache_dir)?;
    let path = cache_dir.join(SVELTE_TYPES_SHADOW_NAME);
    // Rewriting an unchanged file would invalidate the compiler's build info.
    if fs::read_to_string(&path).is_ok_and(|existing| existing == blanked) {
        return Some(SvelteTypesShadow {
            path,
            modules,
            type_ref_root,
        });
    }
    fs::create_dir_all(cache_dir).ok()?;
    fs::write(&path, &blanked).ok()?;
    Some(SvelteTypesShadow {
        path,
        modules,
        type_ref_root,
    })
}

/// Materialise `<cache>/<SVELTE_TYPE_REF_DIR>/svelte/` — a types package named
/// `svelte` whose declarations are empty — and return the directory to place
/// first in `typeRoots`.
///
/// `paths` and [`blank_svelte_type_reference`] between them cover every channel
/// rsvelte controls, but not the one its dependencies use: `@sveltejs/kit` and
/// `@tanstack/svelte-table` (among others) open their shipped `.d.ts` with
/// `/// <reference types="svelte" />`, and a type reference inside a file we do
/// not generate resolves through `typeRoots` / node resolution, not `paths`.
/// That pulled the ORIGINAL `types/index.d.ts` back into the program next to the
/// blanked copy, so svelte's ambient modules were declared twice — and
/// `Snippet`'s brand being a `unique symbol` per declaration, a snippet built
/// against one was not assignable to the other (#2211: false TS2322 on every
/// snippet handed to a component prop).
///
/// An empty stub is enough to satisfy those references because the blanked copy
/// is in the overlay's `files` unconditionally: the program has svelte's
/// declarations either way, and now from exactly one file. `typeRoots` keeps
/// resolving everything else — the primary lookup falls through to the node
/// resolution that finds `@types/node` and friends.
fn materialize_svelte_type_ref_stub(cache_dir: &Path) -> Option<PathBuf> {
    let root = cache_dir.join(SVELTE_TYPE_REF_DIR);
    let package_dir = root.join("svelte");
    fs::create_dir_all(&package_dir).ok()?;
    write_if_changed(
        &package_dir.join("package.json"),
        "{ \"name\": \"svelte\", \"version\": \"0.0.0\", \"types\": \"./index.d.ts\" }\n",
    )?;
    write_if_changed(
        &package_dir.join("index.d.ts"),
        "// Intentionally empty: see materialize_svelte_type_ref_stub.\n",
    )?;
    Some(root)
}

/// Write `contents` unless the file already holds them — an unchanged cache dir
/// keeps the compiler's build info valid across runs.
fn write_if_changed(path: &Path, contents: &str) -> Option<()> {
    if fs::read_to_string(path).is_ok_and(|existing| existing == contents) {
        return Some(());
    }
    fs::write(path, contents).ok()
}

/// Exact `paths` entries redirecting every module the installed svelte declares
/// onto the blanked copy from [`materialize_svelte_types_shadow`], so the
/// original — and with it the `*.svelte` wildcard — never enters the program.
/// `svelte/elements` and the runtime-only `svelte/internal/*` subpaths resolve
/// to their own files and are untouched.
fn svelte_types_path_overrides(global_types: &GlobalTypes) -> Vec<(String, PathBuf)> {
    let Some(shadow) = &global_types.svelte_types else {
        return Vec::new();
    };
    shadow
        .modules
        .iter()
        .map(|name| (name.clone(), shadow.path.clone()))
        .collect()
}

/// svelte2tsx opens every shadow with this directive, which pulls the ORIGINAL
/// `types/index.d.ts` in through type-reference resolution — a channel `paths`
/// cannot redirect. Blanking it (in place, so positions survive) leaves the
/// blanked copy in `files` as the only source of svelte's ambient modules.
fn blank_svelte_type_reference(tsx: &mut String) {
    for directive in [
        "///<reference types=\"svelte\" />",
        "/// <reference types=\"svelte\" />",
    ] {
        while let Some(at) = tsx.find(directive) {
            tsx.replace_range(at..at + directive.len(), &" ".repeat(directive.len()));
        }
    }
}

/// Walk `node_modules` upwards from `from` for the `svelte` package, the
/// Rust equivalent of `require.resolve('svelte/package.json', { paths })`.
fn resolve_svelte_package(from: &Path) -> Option<SveltePackage> {
    let mut cursor = Some(from);
    while let Some(dir) = cursor {
        let pkg_dir = dir.join("node_modules").join("svelte");
        let manifest = pkg_dir.join("package.json");
        if manifest.is_file() {
            let major = fs::read_to_string(&manifest)
                .ok()
                .and_then(|s| serde_json::from_str::<serde_json::Value>(&s).ok())
                .and_then(|v| v.get("version")?.as_str().map(str::to_owned))
                .and_then(|v| v.split('.').next()?.parse().ok());
            return Some(SveltePackage {
                dir: pkg_dir,
                major,
            });
        }
        cursor = dir.parent();
    }
    None
}

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

/// One plain `.ts` / `.js` source mirrored into the overlay with everything
/// but its hijacked `.svelte` import declarations blanked out (see
/// `emit_import_probes`). Positions are preserved byte for byte, so a
/// diagnostic on the probe is reported at the source's own line and column.
#[derive(Debug, Clone)]
pub struct ImportProbeEntry {
    pub source_path: PathBuf,
    pub out_path: PathBuf,
    /// Byte ranges of the kept import declarations, in the source's own
    /// coordinates. The probe owns exactly these ranges: the source's own
    /// diagnostics inside them are dropped in favour of the probe's.
    pub spans: Vec<(usize, usize)>,
}

#[derive(Debug, Clone)]
pub struct OverlayLayout {
    pub workspace: PathBuf,
    pub cache_dir: PathBuf,
    pub emit_dir: PathBuf,
    pub overlay_tsconfig: PathBuf,
    pub entries: Vec<OverlayEntry>,
    pub kit_entries: Vec<KitOverlayEntry>,
    pub import_probes: Vec<ImportProbeEntry>,
    /// `<base>.svelte.js` rune modules deliberately left without a
    /// `.d.svelte.ts` bridge (see `emit_svelte_module_bridges`).
    pub withheld_js_modules: Vec<PathBuf>,
    /// Whether the project type-checks with `noImplicitAny`, which decides
    /// what official reports for those withheld modules.
    pub no_implicit_any: bool,
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
    materialize_overlay_with(
        workspace,
        files,
        tsconfig_path,
        false,
        &[],
        &CompilerOptionsSettings::default(),
    )
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
    ignore: &[String],
    compiler_opts: &CompilerOptionsSettings,
) -> Result<OverlayLayout, OverlayError> {
    let mut layout = materialize_overlay_with(
        workspace,
        svelte_files,
        tsconfig_path,
        incremental,
        ignore,
        compiler_opts,
    )?;
    layout.kit_entries = materialize_kit_files(workspace, &layout.emit_dir, kit_files, settings)?;
    materialize_kit_types(workspace, &layout.emit_dir, kit_files)?;
    // A kit file already has a mirror copy at its own path, which resolves its
    // `.svelte` imports from inside the mirror exactly as a probe would — a
    // second copy of the same import would only report it twice.
    layout.import_probes.retain(|probe| {
        let mirrored = layout
            .kit_entries
            .iter()
            .any(|kit| kit.source_path == probe.source_path);
        if mirrored {
            let _ = fs::remove_file(&probe.out_path);
        }
        !mirrored
    });
    Ok(layout)
}

/// Same as [`materialize_overlay`] but with an explicit `incremental`
/// flag. When `true`, we load `<cacheDir>/manifest.json`, prune entries
/// for files that have been deleted, and skip running svelte2tsx on
/// files whose `(mtime_ms, size)` matches the manifest (and whose
/// `.tsx` / `.d.ts` shadows still exist on disk). The source map for
/// skipped files is recovered from the sibling `.tsx.map` file written
/// on the previous run, so downstream diagnostic mapping still works.
///
/// `ignore` is the CLI's `--ignore` list, applied to the extra workspace walk
/// `emit_svelte_module_bridges` does so it sees the same tree the checked
/// file set was collected from.
pub fn materialize_overlay_with(
    workspace: &Path,
    files: &[PathBuf],
    tsconfig_path: Option<&Path>,
    incremental: bool,
    ignore: &[String],
    compiler_opts: &CompilerOptionsSettings,
) -> Result<OverlayLayout, OverlayError> {
    let cache_dir = workspace.join(".svelte-check");
    let emit_dir = cache_dir.join("svelte");
    fs::create_dir_all(&emit_dir)?;
    let manifest_path = cache_dir.join("manifest.json");
    let namespace = compiler_opts.projection_namespace();
    let accessors = compiler_opts.projection_accessors();
    let config_signature = compiler_opts.signature();
    // Chosen up front: every shadow's `<reference types="svelte" />` has to be
    // blanked as it is emitted once the blanked copy stands in for the package.
    let global_types = select_global_types(workspace, &cache_dir);

    // The shadows depend on `compilerOptions` too, and a config edit moves
    // neither the source mtime nor its size.
    let mut manifest = if incremental {
        let cached = manifest::load(&manifest_path, workspace);
        if cached.config_signature == config_signature {
            cached
        } else {
            Manifest::empty()
        }
    } else {
        Manifest::empty()
    };
    manifest.config_signature = config_signature;

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

    // External (workspace-sibling) `.svelte` packages reachable via
    // node_modules symlinks or a tsconfig `paths` alias: emit shadows into
    // per-package cache mirrors and collect the (real-dir, mirror-dir)
    // `rootDirs`/alias-rewrite pairs that bridge them (#782). Must run BEFORE
    // the per-file loop below, since `rewrite_aliased_svelte_imports` needs
    // the mirrors to already exist to re-point an aliased cross-package
    // import at its shadow.
    let external = discover_external_svelte_packages(workspace, &cache_dir, tsconfig_path);
    let ext_root_dir_pairs: Vec<(PathBuf, PathBuf)> = external
        .iter()
        .map(|pkg| (pkg.real_dir.clone(), pkg.mirror_dir.clone()))
        .collect();
    let allow_js = resolve_allow_js(tsconfig_path);
    let mut module_bridges: Vec<(PathBuf, PathBuf)> = Vec::new();
    let mut withheld_js_modules: Vec<PathBuf> = Vec::new();
    for pkg in &external {
        emit_external_shadows(
            pkg,
            workspace,
            &emit_dir,
            svelte_resolver.as_ref(),
            &ext_root_dir_pairs,
            global_types.svelte_types.is_some(),
            namespace,
            accessors,
        )?;
        module_bridges.extend(emit_svelte_module_bridges(
            &pkg.real_dir,
            &pkg.mirror_dir,
            &[],
            allow_js,
            &mut withheld_js_modules,
        )?);
    }
    module_bridges.extend(emit_svelte_module_bridges(
        workspace,
        &emit_dir,
        ignore,
        allow_js,
        &mut withheld_js_modules,
    )?);

    let mut entries = Vec::with_capacity(files.len());
    let mut augments: Vec<CompanionAugment> = Vec::new();
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
                accessors,
                namespace,
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
            let mut tsx_code =
                rewrite_companion_module_imports(&result.code, abs_source, &tsx_path);
            if global_types.svelte_types.is_some() {
                blank_svelte_type_reference(&mut tsx_code);
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
                    &tsx_code,
                    abs_source,
                    &tsx_path,
                    workspace,
                    &emit_dir,
                    resolver,
                    &ext_root_dir_pairs,
                    None,
                );
            }
            fs::write(&tsx_path, &tsx_code)?;

            // `<name>.svelte.d.ts` re-exports default + named so module
            // resolution by `import Foo from './Foo.svelte'` still works.
            fs::write(&dts_path, shadow_reexport(&tsx_path))?;
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

        // Outside the cache-hit branch: a `.svelte-check` dir left by a build
        // without bridges would otherwise never gain them.
        write_esm_bridge(&tsx_path, &shadow_reexport(&tsx_path), can_skip)?;

        // A duplicated input would emit the same `declare module` block twice.
        if let Some(companion) = find_companion_module(abs_source)
            && !augments.iter().any(|a| a.source_path == *abs_source)
        {
            let augment = build_companion_augment(abs_source, &tsx_path, &companion);
            if augment.forward_default || !augment.names.is_empty() {
                augments.push(augment);
            }
        }

        entries.push(OverlayEntry {
            source_path: abs_source.clone(),
            tsx_path,
            dts_path,
            source_map,
        });
    }
    let has_augments = write_companion_augmentation(&cache_dir, &augments)?;

    let import_probes = emit_import_probes(
        workspace,
        &emit_dir,
        ignore,
        &components_hijacked_by_a_companion(&abs_files),
    )?;

    // Materialise the selected svelte2tsx shims into the cache dir so the
    // overlay tsconfig can reference them by a stable relative path — a
    // standalone rsvelte install has no `node_modules/svelte2tsx` to read.
    if global_types.svelte_types.is_none() {
        let _ = fs::remove_file(cache_dir.join(SVELTE_TYPES_SHADOW_NAME));
        let _ = fs::remove_dir_all(cache_dir.join(SVELTE_TYPE_REF_DIR));
    }
    for (name, contents) in SHIM_FILES {
        let path = cache_dir.join(name);
        if global_types.shims.contains(name) {
            fs::write(path, contents)?;
        } else {
            // A previous run's copy would otherwise linger in the cache dir
            // and be picked up by an inherited `include` pattern.
            let _ = fs::remove_file(path);
        }
    }

    // A PLAIN `.ts`/`.js`/`.svelte.ts` source file that imports a `.svelte`
    // component via a tsconfig `paths` alias never goes through svelte2tsx
    // (only `.svelte` files do), so `rewrite_aliased_svelte_imports` never
    // touches it — the alias resolves straight to the ambient `declare
    // module '*.svelte'` fallback (#1888). For each such component, add an
    // EXACT (non-wildcard) `paths` entry pointing straight at its shadow
    // `.tsx` — TS prefers an exact `paths` match over a wildcard pattern, and
    // since the resolved target no longer ends in `.svelte`, the ambient
    // wildcard is never consulted at all, applying regardless of which kind
    // of file does the importing. `module_bridges` gets the same entry for
    // each rune module, whose `.d.svelte.ts` twin `rootDirs` alone cannot
    // reach through a non-relative specifier (#1942).
    let mut alias_path_overrides = tsconfig_path
        .map(|tsconfig| {
            let alias_prefixes = resolve_paths_alias_prefixes(tsconfig);
            compute_alias_path_overrides(&entries, &external, &module_bridges, &alias_prefixes)
        })
        .unwrap_or_default();
    alias_path_overrides.extend(svelte_types_path_overrides(&global_types));

    let overlay_tsconfig = cache_dir.join("tsconfig.json");
    let tsconfig_json = build_overlay_tsconfig(
        &cache_dir,
        tsconfig_path,
        workspace,
        &ext_root_dir_pairs,
        incremental,
        has_augments,
        &alias_path_overrides,
        &global_types,
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
        import_probes,
        withheld_js_modules,
        no_implicit_any: resolve_no_implicit_any(tsconfig_path),
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
/// source dir into `node_modules/<name>`), OR through a `tsconfig.json`
/// `compilerOptions.paths` alias that maps straight onto a sibling package's
/// source tree with no `node_modules` entry at all (common with SvelteKit's
/// `kit.alias` / bundler `resolve.alias`, e.g. `$libs` → `../../libs`) —
/// #782's fix only covered the former, leaving the alias case still resolving
/// to the ambient `*.svelte` wildcard. Registry deps — whose realpath stays
/// inside a `node_modules` store — and in-workspace targets are skipped; only
/// packages that actually contain `.svelte` files are returned. Each gets a
/// distinct `<cache>/ext/<n>` mirror dir.
fn discover_external_svelte_packages(
    workspace: &Path,
    cache_dir: &Path,
    tsconfig_path: Option<&Path>,
) -> Vec<ExternalPackage> {
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
    if let Some(tsconfig_path) = tsconfig_path {
        candidates.extend(resolve_paths_alias_dirs_abs(tsconfig_path));
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
        // A `paths` alias can name any directory, including one that CONTAINS
        // the workspace (`"@/*": ["../../*"]` in a monorepo). Mirroring a tree
        // the workspace itself lives in is never right, and it would walk the
        // whole repository looking for `.svelte` files.
        if ws_real.starts_with(&real) {
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
/// Nearest `tsconfig.json` / `jsconfig.json` at or above `dir`, not looking
/// past the directory that owns the package (`package.json`).
fn find_nearest_tsconfig(dir: &Path) -> Option<PathBuf> {
    let mut current = Some(dir);
    while let Some(d) = current {
        for name in ["tsconfig.json", "jsconfig.json"] {
            let candidate = d.join(name);
            if candidate.is_file() {
                return Some(candidate);
            }
        }
        if d.join("package.json").is_file() {
            return None;
        }
        current = d.parent();
    }
    None
}

fn emit_external_shadows(
    pkg: &ExternalPackage,
    workspace: &Path,
    emit_dir: &Path,
    resolver: Option<&oxc_resolver::Resolver>,
    ext_pairs: &[(PathBuf, PathBuf)],
    blank_svelte_reference: bool,
    namespace: Svelte2TsxNamespace,
    accessors: bool,
) -> Result<(), OverlayError> {
    // Mirror the package's own `node_modules` into the shadow dir so the
    // shadow's bare-package imports (`import type { X } from 'sortablejs'`,
    // incl. its `@types/*` declarations) resolve from the SAME context as the
    // real package. The shadows live under `<cache>/ext/<n>/`, where TS's
    // walk-up would otherwise reach the *workspace* `node_modules` and miss a
    // dependency present only in the external package's tree — silently
    // degrading the imported type to `any` (and poisoning `ComponentProps<…>`
    // in every consumer). A symlink keeps resolution identical to in-place
    // checking without copying or rewriting specifiers.
    // Resolve the package's own aliases with its own tsconfig when it ships
    // one — the caller's resolver was built from the *consumer's* config and
    // its `paths` describe a different project.
    let pkg_resolver =
        find_nearest_tsconfig(&pkg.real_dir).and_then(|c| build_svelte_import_resolver(Some(&c)));
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
            accessors,
            namespace,
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
        let mut tsx_code = rewrite_companion_module_imports(&result.code, abs_source, &tsx_path);
        if blank_svelte_reference {
            blank_svelte_type_reference(&mut tsx_code);
        }
        // An external package commonly imports its OWN components through the
        // same public alias its consumers use (`$lib/Input.svelte` from
        // inside `SelectionMenu.svelte`, both living in the same package) —
        // without this, that self-referential import is left unrewritten,
        // falls back to the ambient `*.svelte` wildcard, and poisons any
        // `ComponentProps<typeof Input>` a consumer computes through it (#1887).
        if let Some(resolver) = pkg_resolver.as_ref().or(resolver) {
            tsx_code = rewrite_aliased_svelte_imports(
                &tsx_code,
                abs_source,
                &tsx_path,
                workspace,
                emit_dir,
                resolver,
                ext_pairs,
                Some(&pkg.real_dir),
            );
        }
        fs::write(&tsx_path, &tsx_code)?;
        let dts_content = shadow_reexport(&tsx_path);
        fs::write(&dts_path, &dts_content)?;
        write_esm_bridge(&tsx_path, &dts_content, false)?;
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
    has_companion_augmentation: bool,
    alias_path_overrides: &[(String, PathBuf)],
    global_types: &GlobalTypes,
) -> String {
    let mut obj: BTreeMap<&str, serde_json::Value> = BTreeMap::new();
    if let Some(orig) = original {
        let rel = path_relative(cache_dir, orig);
        obj.insert("extends", serde_json::Value::String(rel));
    }
    let mut compiler_opts = serde_json::Map::new();
    compiler_opts.insert("noEmit".into(), true.into());
    compiler_opts.insert("allowArbitraryExtensions".into(), true.into());
    // `rewrite_aliased_svelte_imports` rewrites alias-resolved `.svelte`
    // imports to relative `.svelte.tsx` specifiers (no rootDirs bridge
    // applies across an alias), which tsgo/tsc otherwise reject unless the
    // user's own tsconfig happens to set this. The overlay is isolated, so
    // it never leaks into the user's real build.
    compiler_opts.insert("allowImportingTsExtensions".into(), true.into());
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
    // An unset target falls back to tsgo/tsc's ES5/ES3 default lib, which breaks the vendored shims themselves; mirrors `service.ts#getParsedConfig`'s unconditional forcing.
    if let Some(target) = resolve_forced_target(original) {
        compiler_opts.insert("target".into(), target.into());
    }
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
    // `typeRoots`: put the stub package first so a `/// <reference types="svelte" />`
    // in a dependency's shipped `.d.ts` cannot pull the original declarations in
    // beside the blanked copy (#2211). Setting the option replaces TypeScript's
    // default of every ancestor `node_modules/@types`, which would stop `@types/*`
    // packages being auto-included, so the effective value is restated after it.
    if let Some(shadow) = &global_types.svelte_types {
        let mut type_roots_abs = vec![shadow.type_ref_root.clone()];
        type_roots_abs.extend(
            original
                .map(resolve_type_roots_abs)
                .filter(|v| !v.is_empty())
                .unwrap_or_else(|| default_type_roots(cache_dir)),
        );
        // A name in `types` resolves through `typeRoots` alone — unlike a
        // `/// <reference types="…" />`, it does not fall back to node
        // resolution — so a plain package pinned there (`"types": ["@sveltejs/kit"]`,
        // which SvelteKit projects use) would become TS2688 the moment the option
        // is set at all. Widening with the `node_modules` dirs themselves is inert
        // here precisely because a pinned `types` turns automatic inclusion off:
        // nothing under them enters the program unless it is named.
        if original.is_some_and(has_explicit_types) {
            type_roots_abs.extend(ancestor_dirs_containing(
                cache_dir,
                Path::new("node_modules"),
            ));
        }
        compiler_opts.insert(
            "typeRoots".into(),
            serde_json::Value::Array(
                type_roots_abs
                    .iter()
                    .map(|p| serde_json::Value::String(path_relative(cache_dir, p)))
                    .collect(),
            ),
        );
    }
    // `paths`: same override-wholesale gotcha as `rootDirs` above — a child
    // `compilerOptions.paths` replaces the base's entirely, so start from the
    // resolved chain (absolutised, since the overlay tsconfig lives in a
    // different dir than whichever config in the chain defined them) and add
    // our own exact-match overrides (#1888) alongside, never touching the
    // original wildcard entries.
    // Restating them also silences TypeScript's own validation of the user's
    // values, which it only ever reports against the ROOT config of the program
    // — the overlay, not the user's file. [`paths_option_diagnostics`] replays
    // the one check that matters (#2061) where the user can act on it.
    if !alias_path_overrides.is_empty() || original.is_some() {
        let mut paths_obj = original.map(resolve_paths_object_abs).unwrap_or_default();
        for (spec, shadow) in alias_path_overrides {
            // `shadow` may still be CWD-relative (a relative `workspace`
            // produces a relative `tsx_path` throughout `entries`); `paths`
            // values are resolved relative to THIS tsconfig's own directory,
            // not the CWD, so anchor it absolute like every other value here.
            paths_obj.insert(
                spec.clone(),
                serde_json::Value::Array(vec![serde_json::Value::String(
                    absolutize(shadow).display().to_string(),
                )]),
            );
        }
        if !paths_obj.is_empty() {
            compiler_opts.insert("paths".into(), serde_json::Value::Object(paths_obj));
        }
    }
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

    // Reference the ambient `.d.ts` environment `select_global_types` chose
    // (the port of `get_global_types`): the vendored shims we materialised
    // into the cache dir, plus the installed svelte's `svelte-html.d.ts`
    // when it exists. Without these, tsgo / tsc trips on every reference to
    // `__sveltets_2_with_any_event` / `svelteHTML` etc that svelte2tsx emits
    // into the `.tsx` shadow. We embed the shims rather than resolving them
    // from `node_modules/svelte2tsx` (which a standalone rsvelte install has
    // no reason to provide).
    //
    // We always set `files` so any `.svelte` entries listed in the base
    // tsconfig (TS rejects arbitrary extensions in `files` even with
    // `allowArbitraryExtensions` → TS6054) get overridden out. Non-
    // `.svelte` entries from the user's `files` are forwarded.
    let mut files_entries: Vec<String> = global_types
        .shims
        .iter()
        .map(|name| format!("./{name}"))
        .collect();
    if let Some(svelte_html) = &global_types.svelte_html {
        // Absolute: `files` resolves against the overlay dir, and the svelte
        // package sits outside it.
        files_entries.push(tsconfig_absolute_path(svelte_html));
    }
    if global_types.svelte_types.is_some() {
        files_entries.push(format!("./{SVELTE_TYPES_SHADOW_NAME}"));
    }
    if has_companion_augmentation {
        files_entries.push(format!("./{COMPANION_AUGMENT_FILE}"));
    }
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
    let config_dir = config_dir_of(tsconfig_path);
    // A `${configDir}` spec is already anchored on the project, so it only
    // needs the same lexical rebase onto the overlay dir that `rebase_spec`
    // ends with.
    let rebase = |spec: &str, base: &Path| match substitute_config_dir(spec, &config_dir) {
        Some(path) => relative_lexical(&absolutize(cache_dir), &path),
        None => rebase_spec(spec, base, cache_dir),
    };
    let rebased = |key: &str| -> Vec<String> {
        resolve_config_specs(tsconfig_path, key)
            .map(|(specs, base)| specs.iter().map(|s| rebase(s, &base)).collect())
            .unwrap_or_default()
    };

    let include = rebased("include");
    let exclude = rebased("exclude");
    let files = resolve_config_specs(tsconfig_path, "files")
        .map(|(specs, base)| {
            specs
                .iter()
                .filter(|s| !s.ends_with(".svelte"))
                .map(|s| rebase(s, &base))
                .collect()
        })
        .unwrap_or_default();

    InheritedSpecs {
        include,
        exclude,
        files,
    }
}

/// How many configs an `extends` graph may contribute before the walk gives
/// up, so a cycle or a pathological diamond cannot spin forever.
const MAX_EXTENDS_CONFIGS: usize = 32;

/// A tsconfig's `extends` graph, flattened into TypeScript's precedence order:
/// the config itself first, then its parents from the **last** `extends` entry
/// to the first, each parent immediately followed by its own chain. Every
/// entry is `(dir of the config, parsed config)`, so a caller can resolve a
/// value's relative paths against the config that declared it.
///
/// Callers take the first entry that defines the key they want, which keeps the
/// nearest-definition-wins rule TypeScript applies to `include` / `exclude` /
/// `files` / `paths` / `rootDirs` (a child's value replaces the parent's
/// wholesale) and gives the array form (TS 5.0+) its documented semantics of
/// later entries winning.
///
/// Only relative-path `extends` targets are followed; a bare package name ends
/// that branch (see [`resolve_root_dirs_abs`] for the rationale). Paths are
/// absolutised up front so a relative `--tsconfig` argument cannot compound
/// through the hops into an unresolvable target.
fn extends_chain(tsconfig_path: &Path) -> Vec<(PathBuf, serde_json::Value)> {
    let mut out = Vec::new();
    let mut pending = vec![absolutize(tsconfig_path)];
    while let Some(file) = pending.pop() {
        if out.len() >= MAX_EXTENDS_CONFIGS {
            break;
        }
        let Ok(raw) = fs::read_to_string(&file) else {
            continue;
        };
        let stripped = strip_jsonc_comments(&raw);
        let Ok(parsed) = serde_json::from_str::<serde_json::Value>(&stripped) else {
            continue;
        };
        let dir = file.parent().unwrap_or(Path::new(".")).to_path_buf();

        // Queued in declaration order, popped from the back: the last entry —
        // the one TypeScript gives precedence — is visited first, and its own
        // parents before the entries to its left.
        let parents: Vec<PathBuf> = match parsed.get("extends") {
            Some(serde_json::Value::String(ext)) => vec![ext.clone()],
            Some(serde_json::Value::Array(exts)) => exts
                .iter()
                .filter_map(|v| v.as_str().map(str::to_string))
                .collect(),
            _ => Vec::new(),
        }
        .iter()
        .filter(|ext| ext.starts_with('.'))
        .map(|ext| resolve_extends_path(&dir, ext))
        .collect();
        pending.extend(parents);

        out.push((dir, parsed));
    }
    out
}

/// The `(specs, base_dir)` of the nearest config in `tsconfig_path`'s
/// [`extends_chain`] that defines `key` (`include` / `exclude` / `files`).
/// `base_dir` is the directory of the *defining* config so its relative specs
/// rebase correctly.
fn resolve_config_specs(tsconfig_path: &Path, key: &str) -> Option<(Vec<String>, PathBuf)> {
    extends_chain(tsconfig_path)
        .into_iter()
        .find_map(|(dir, parsed)| {
            let specs = parsed
                .get(key)?
                .as_array()?
                .iter()
                .filter_map(|v| v.as_str().map(str::to_string))
                .collect();
            Some((specs, dir))
        })
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

/// Resolve symlinks where the path exists, and leave it untouched where it
/// does not — so two paths that name the same file compare equal even when one
/// side reached it through a symlinked temp dir.
fn canonicalized(path: &Path) -> PathBuf {
    path.canonicalize().unwrap_or_else(|_| path.to_path_buf())
}

/// Make `path` absolute by anchoring relative paths on the current working
/// directory, then normalise `.`/`..` lexically. No filesystem access
/// beyond reading the CWD, so it works for not-yet-created paths.
///
/// `pub(crate)`: also the canonical implementation behind
/// `runner::absolutize_workspace`, which `runner::run` uses to normalise
/// `RunOptions::workspace` up front (#1919) — kept as one function so the
/// two callers can never drift apart on what "absolute" means here.
pub(crate) fn absolutize(path: &Path) -> PathBuf {
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

/// Resolve a tsconfig's effective `rootDirs` to absolute paths. Returns the
/// entries from the nearest config in the [`extends_chain`] that defines
/// `rootDirs` (a child `compilerOptions.rootDirs` replaces the parent's
/// wholesale, mirroring TypeScript), each resolved relative to the directory of
/// the file that defined it. Empty when no config in the chain sets `rootDirs`.
///
/// Only relative-path `extends` are followed (the common case, incl.
/// SvelteKit's `./.svelte-kit/tsconfig.json`); a bare package-name
/// `extends` ends that branch — we'd need full node resolution to chase it,
/// and the caller falls back to a sensible default.
fn resolve_root_dirs_abs(tsconfig_path: &Path) -> Vec<PathBuf> {
    let config_dir = config_dir_of(tsconfig_path);
    extends_chain(tsconfig_path)
        .into_iter()
        .find_map(|(dir, parsed)| {
            let dirs = parsed
                .get("compilerOptions")?
                .get("rootDirs")?
                .as_array()?
                .iter()
                .filter_map(|v| v.as_str())
                .map(|s| substitute_config_dir(s, &config_dir).unwrap_or_else(|| dir.join(s)))
                .collect();
            Some(dirs)
        })
        .unwrap_or_default()
}

/// Resolve a tsconfig's effective `typeRoots` to absolute paths, the same
/// nearest-definition-wins way [`resolve_root_dirs_abs`] resolves `rootDirs`.
/// Empty when no config in the chain sets it, which is when TypeScript's own
/// default applies — see [`default_type_roots`].
fn resolve_type_roots_abs(tsconfig_path: &Path) -> Vec<PathBuf> {
    let config_dir = config_dir_of(tsconfig_path);
    extends_chain(tsconfig_path)
        .into_iter()
        .find_map(|(dir, parsed)| {
            let dirs = parsed
                .get("compilerOptions")?
                .get("typeRoots")?
                .as_array()?
                .iter()
                .filter_map(|v| v.as_str())
                .map(|s| substitute_config_dir(s, &config_dir).unwrap_or_else(|| dir.join(s)))
                .collect();
            Some(dirs)
        })
        .unwrap_or_default()
}

/// TypeScript's default `typeRoots`: every `node_modules/@types` from `from`
/// upwards (`getDefaultTypeRoots`). Only existing directories are listed — the
/// value is restated verbatim in the overlay, and a path that resolves to
/// nothing is what TypeScript itself would have skipped.
fn default_type_roots(from: &Path) -> Vec<PathBuf> {
    ancestor_dirs_containing(from, &Path::new("node_modules").join("@types"))
}

/// Every `<ancestor>/<suffix>` that exists, walking up from `from`.
fn ancestor_dirs_containing(from: &Path, suffix: &Path) -> Vec<PathBuf> {
    let mut found = Vec::new();
    let mut cursor = Some(absolutize(from));
    while let Some(dir) = cursor {
        let candidate = dir.join(suffix);
        if candidate.is_dir() {
            found.push(candidate);
        }
        cursor = dir.parent().map(Path::to_path_buf);
    }
    found
}

/// Whether any config in the chain pins `compilerOptions.types`, which turns off
/// TypeScript's automatic inclusion of every type package it can find.
fn has_explicit_types(tsconfig_path: &Path) -> bool {
    extends_chain(tsconfig_path).into_iter().any(|(_, parsed)| {
        parsed
            .get("compilerOptions")
            .and_then(|c| c.get("types"))
            .is_some_and(serde_json::Value::is_array)
    })
}

/// Whether a tsconfig `target` is ES2015+; `None` for an unrecognized string — a year-numbered target is parsed generically so newer TS releases need no change here.
fn is_es2015_or_newer(target: &str) -> Option<bool> {
    Some(match target.to_ascii_lowercase().as_str() {
        "es3" | "es5" => false,
        "es6" | "esnext" | "latest" => true,
        other => other.strip_prefix("es")?.parse::<u32>().ok()? >= 2015,
    })
}

/// Nearest-definition-wins `compilerOptions.target`, read off the [`extends_chain`].
fn resolve_effective_target(tsconfig_path: Option<&Path>) -> Option<String> {
    extends_chain(tsconfig_path?)
        .into_iter()
        .find_map(|(_, parsed)| {
            Some(
                parsed
                    .get("compilerOptions")?
                    .get("target")?
                    .as_str()?
                    .to_string(),
            )
        })
}

/// Nearest-definition-wins `compilerOptions.allowJs`, read off the
/// [`extends_chain`]; `false` (TypeScript's default) without a tsconfig.
fn resolve_allow_js(tsconfig_path: Option<&Path>) -> bool {
    tsconfig_path
        .map(|p| {
            extends_chain(p)
                .into_iter()
                .find_map(|(_, parsed)| parsed.get("compilerOptions")?.get("allowJs")?.as_bool())
                .unwrap_or(false)
        })
        .unwrap_or(false)
}

/// Nearest-definition-wins `compilerOptions.noImplicitAny`, falling back to
/// `strict` and then to TypeScript's `false` default. Each option is resolved
/// on its own chain, since an explicit `noImplicitAny` in a child overrides a
/// `strict` in the base.
fn resolve_no_implicit_any(tsconfig_path: Option<&Path>) -> bool {
    let Some(path) = tsconfig_path else {
        return false;
    };
    let chain = extends_chain(path);
    let read = |key: &str| {
        chain
            .iter()
            .find_map(|(_, parsed)| parsed.get("compilerOptions")?.get(key)?.as_bool())
    };
    read("noImplicitAny")
        .or_else(|| read("strict"))
        .unwrap_or(false)
}

/// The `target` the overlay tsconfig should force, or `None` to leave the inherited value alone (already ES2015+, so the `extends` chain provides it).
fn resolve_forced_target(original: Option<&Path>) -> Option<&'static str> {
    match resolve_effective_target(original)
        .as_deref()
        .map(is_es2015_or_newer)
    {
        None | Some(None) => Some("ESNext"),
        Some(Some(false)) => Some("ES2015"),
        Some(Some(true)) => None,
    }
}

/// TypeScript's `${configDir}` template (TS 5.5+).
const CONFIG_DIR_TEMPLATE: &str = "${configDir}";

/// Substitute a leading `${configDir}` with the directory of the config loaded
/// as the *project*, normalised absolute — TypeScript's
/// `getSubstitutedPathWithConfigDirTemplate`, which runs before any option is
/// validated or resolved. `None` when the value does not open with the template
/// (a `${configDir}` anywhere else is left alone, as upstream leaves it).
///
/// The overlay has to do this itself: it reads the user's values and restates
/// them in a tsconfig of its own, where TypeScript would expand the template
/// against the cache dir instead of the user's project.
fn substitute_config_dir(value: &str, project_dir: &Path) -> Option<PathBuf> {
    let head = value.get(..CONFIG_DIR_TEMPLATE.len())?;
    if !head.eq_ignore_ascii_case(CONFIG_DIR_TEMPLATE) {
        return None;
    }
    let rest = &value[CONFIG_DIR_TEMPLATE.len()..];
    let rest = rest.strip_prefix(['/', '\\']).unwrap_or(rest);
    Some(normalize_abs(&project_dir.join(rest)))
}

/// The directory a [`CONFIG_DIR_TEMPLATE`] in `tsconfig_path`'s chain expands
/// to: the project config's own directory, whichever config in the chain wrote
/// the value.
fn config_dir_of(tsconfig_path: &Path) -> PathBuf {
    absolutize(tsconfig_path)
        .parent()
        .map(Path::to_path_buf)
        .unwrap_or_default()
}

/// TypeScript's `verifyCompilerOptions` check that a `paths` substitution is
/// relative or absolute whenever `baseUrl` is unset (TS5090), replayed here
/// because the overlay restates `paths` with absolutised targets and so denies
/// the compiler the chance (#2061).
///
/// Mirrors `createDiagnosticForOptionPathKeyValue`: only the ROOT config's own
/// syntax is searched for a position — an entry inherited through `extends` is
/// reported without one, exactly as TypeScript does. Official svelte-check
/// downgrades every config diagnostic to a warning, so this is a warning too.
pub(crate) fn paths_option_diagnostics(tsconfig_path: &Path) -> Vec<Diagnostic> {
    let chain = extends_chain(tsconfig_path);
    let has_base_url = chain.iter().any(|(_, parsed)| {
        parsed
            .get("compilerOptions")
            .and_then(|c| c.get("baseUrl"))
            .is_some()
    });
    if has_base_url {
        return Vec::new();
    }
    let Some((paths, _)) = resolve_paths_chain(tsconfig_path) else {
        return Vec::new();
    };
    let root_text = fs::read_to_string(tsconfig_path).unwrap_or_default();

    let mut out = Vec::new();
    for (key, targets) in &paths {
        let Some(targets) = targets.as_array() else {
            continue;
        };
        for (index, target) in targets.iter().enumerate() {
            let Some(target) = target.as_str() else {
                continue;
            };
            if is_relative_specifier(target) || is_absolute_specifier(target) {
                continue;
            }
            out.push(Diagnostic {
                file: tsconfig_path.to_path_buf(),
                severity: DiagnosticSeverity::Warning,
                code: Some("TS5090".into()),
                message: "Non-relative paths are not allowed when 'baseUrl' is not set. \
                          Did you forget a leading './'?"
                    .into(),
                range: paths_value_offset(&root_text, key, index)
                    .map(|(start, end)| text_range(&root_text, start, end)),
                source: "ts",
            });
        }
    }
    out
}

/// TypeScript's `pathIsRelative`: `.`, `..`, or either followed by a separator.
fn is_relative_specifier(path: &str) -> bool {
    let rest = path
        .strip_prefix("..")
        .or_else(|| path.strip_prefix('.'))
        .filter(|_| path.starts_with('.'));
    match rest {
        Some(rest) => rest.is_empty() || rest.starts_with('/') || rest.starts_with('\\'),
        None => false,
    }
}

/// TypeScript's `pathIsAbsolute`: a root slash or a drive-letter root. Written
/// out rather than deferring to `Path::is_absolute`, which calls a Windows path
/// relative when the check itself runs on a unix host.
fn is_absolute_specifier(path: &str) -> bool {
    let bytes = path.as_bytes();
    matches!(bytes.first(), Some(b'/' | b'\\'))
        || (bytes.first().is_some_and(u8::is_ascii_alphabetic) && bytes.get(1) == Some(&b':'))
}

/// Byte span of the `index`-th substitution of `compilerOptions.paths[key]` in a
/// tsconfig's own text, or `None` when the config does not declare it itself.
fn paths_value_offset(text: &str, key: &str, index: usize) -> Option<(usize, usize)> {
    let mut cursor = JsonCursor::new(text);
    if !cursor.enter_member("compilerOptions")
        || !cursor.enter_member("paths")
        || !cursor.enter_member(key)
    {
        return None;
    }
    cursor.nth_element(index)
}

/// Byte offsets → a 1-based-line / 0-based-column [`Range`].
fn text_range(text: &str, start: usize, end: usize) -> Range {
    let position = |offset: usize| {
        let before = &text[..offset.min(text.len())];
        let line = before.matches('\n').count() as u32 + 1;
        let column = before
            .rsplit_once('\n')
            .map(|(_, last)| last)
            .unwrap_or(before)
            .encode_utf16()
            .count() as u32;
        Position { line, column }
    };
    Range {
        start: position(start),
        end: position(end),
    }
}

/// Minimal JSONC walker used only to locate a value's byte span — the document
/// itself is read with `serde_json` after [`strip_jsonc_comments`], which drops
/// bytes and so cannot carry positions.
struct JsonCursor<'a> {
    bytes: &'a [u8],
    at: usize,
}

impl<'a> JsonCursor<'a> {
    fn new(text: &'a str) -> Self {
        Self {
            bytes: text.as_bytes(),
            at: 0,
        }
    }

    /// Skip whitespace and comments, then report the byte at the cursor.
    fn peek(&mut self) -> Option<u8> {
        loop {
            while self.at < self.bytes.len() && self.bytes[self.at].is_ascii_whitespace() {
                self.at += 1;
            }
            match (self.bytes.get(self.at), self.bytes.get(self.at + 1)) {
                (Some(b'/'), Some(b'/')) => {
                    while self.at < self.bytes.len() && self.bytes[self.at] != b'\n' {
                        self.at += 1;
                    }
                }
                (Some(b'/'), Some(b'*')) => {
                    self.at += 2;
                    while self.at + 1 < self.bytes.len()
                        && !(self.bytes[self.at] == b'*' && self.bytes[self.at + 1] == b'/')
                    {
                        self.at += 1;
                    }
                    self.at = (self.at + 2).min(self.bytes.len());
                }
                (byte, _) => return byte.copied(),
            }
        }
    }

    /// Consume the string at the cursor, returning its raw (still escaped) body.
    fn string(&mut self) -> Option<&'a [u8]> {
        if self.peek()? != b'"' {
            return None;
        }
        self.at += 1;
        let start = self.at;
        while self.at < self.bytes.len() {
            match self.bytes[self.at] {
                b'\\' => self.at += 2,
                b'"' => {
                    let end = self.at;
                    self.at += 1;
                    return Some(&self.bytes[start..end]);
                }
                _ => self.at += 1,
            }
        }
        None
    }

    fn skip_value(&mut self) {
        match self.peek() {
            Some(b'"') => {
                self.string();
            }
            Some(open @ (b'{' | b'[')) => {
                let close = if open == b'{' { b'}' } else { b']' };
                self.at += 1;
                let mut depth = 1usize;
                while depth > 0 {
                    match self.peek() {
                        Some(b'"') => {
                            self.string();
                        }
                        Some(byte) => {
                            if byte == open {
                                depth += 1;
                            } else if byte == close {
                                depth -= 1;
                            }
                            self.at += 1;
                        }
                        None => return,
                    }
                }
            }
            Some(_) => {
                while self.at < self.bytes.len()
                    && !matches!(self.bytes[self.at], b',' | b'}' | b']')
                {
                    self.at += 1;
                }
            }
            None => {}
        }
    }

    /// Move the cursor onto the value of `name` in the object it points at.
    fn enter_member(&mut self, name: &str) -> bool {
        if self.peek() != Some(b'{') {
            return false;
        }
        self.at += 1;
        loop {
            match self.peek() {
                Some(b',') => {
                    self.at += 1;
                    continue;
                }
                Some(b'"') => {}
                _ => return false,
            }
            let Some(found) = self.string() else {
                return false;
            };
            if self.peek() != Some(b':') {
                return false;
            }
            self.at += 1;
            if found == name.as_bytes() {
                self.peek();
                return true;
            }
            self.skip_value();
        }
    }

    /// Byte span of the `index`-th element of the array the cursor points at.
    fn nth_element(&mut self, index: usize) -> Option<(usize, usize)> {
        if self.peek()? != b'[' {
            return None;
        }
        self.at += 1;
        let mut seen = 0usize;
        loop {
            match self.peek()? {
                b']' => return None,
                b',' => {
                    self.at += 1;
                    continue;
                }
                _ => {}
            }
            let start = self.at;
            self.skip_value();
            if seen == index {
                return Some((start, self.at));
            }
            seen += 1;
        }
    }
}

/// The nearest `compilerOptions.paths` in a tsconfig's `extends` chain, paired
/// with the directory its targets resolve against: `baseUrl` (itself the
/// nearest one in the chain, resolved against the config that declared it)
/// when set, else the directory of the config that declared `paths` —
/// TypeScript's default since `paths` stopped requiring `baseUrl`. `paths` and
/// `baseUrl` are each taken wholesale from the nearest config that defines
/// them, which may not be the same config.
fn resolve_paths_chain(
    tsconfig_path: &Path,
) -> Option<(serde_json::Map<String, serde_json::Value>, PathBuf)> {
    let chain = extends_chain(tsconfig_path);
    let (paths, paths_dir) = chain.iter().find_map(|(dir, parsed)| {
        let p = parsed.get("compilerOptions")?.get("paths")?.as_object()?;
        Some((p.clone(), dir.clone()))
    })?;
    let config_dir = config_dir_of(tsconfig_path);
    let paths = paths
        .into_iter()
        .map(|(key, targets)| {
            let targets = match targets {
                serde_json::Value::Array(targets) => serde_json::Value::Array(
                    targets
                        .into_iter()
                        .map(|target| match target.as_str() {
                            Some(t) => match substitute_config_dir(t, &config_dir) {
                                Some(path) => path.display().to_string().into(),
                                None => target,
                            },
                            None => target,
                        })
                        .collect(),
                ),
                other => other,
            };
            (key, targets)
        })
        .collect();
    let base_url = chain.iter().find_map(|(dir, parsed)| {
        let b = parsed.get("compilerOptions")?.get("baseUrl")?.as_str()?;
        Some(substitute_config_dir(b, &config_dir).unwrap_or_else(|| dir.join(b)))
    });
    Some((paths, base_url.unwrap_or(paths_dir)))
}

/// Resolve a tsconfig's `compilerOptions.paths` wildcard entries
/// (`"$lib/*": ["../lib/*"]`) to `(alias prefix, absolute target dir)` pairs.
/// Only the common `"<prefix>/*": ["<target>/*"]` shape is supported; an exact
/// (non-wildcard) key, or a value not ending in `/*`, is skipped — there is no
/// file *set* to reverse-map for those. Every target of a multi-target entry is
/// returned, in declaration order.
fn resolve_paths_alias_prefixes(tsconfig_path: &Path) -> Vec<(String, PathBuf)> {
    let Some((paths, base)) = resolve_paths_chain(tsconfig_path) else {
        return Vec::new();
    };
    let mut out = Vec::new();
    for (key, targets) in &paths {
        let Some(prefix) = key.strip_suffix("/*") else {
            continue;
        };
        let Some(targets) = targets.as_array() else {
            continue;
        };
        for target in targets
            .iter()
            .filter_map(|v| v.as_str())
            .filter_map(|s| s.strip_suffix("/*"))
        {
            out.push((prefix.to_string(), base.join(target)));
        }
    }
    out
}

/// Resolve a tsconfig's `compilerOptions.paths` alias targets to absolute
/// directories (see [`resolve_paths_chain`] for the `baseUrl`/`extends`
/// rules). Each target glob has its trailing `/*` (or bare `*`) stripped; a
/// target that names a file contributes that file's parent directory, and one
/// that does not exist is skipped rather than widened to its parent. Used to
/// extend [`discover_external_svelte_packages`] to sibling packages reached
/// through a bundler/tsconfig alias rather than a `node_modules` symlink
/// (#782's fix only covers the latter).
fn resolve_paths_alias_dirs_abs(tsconfig_path: &Path) -> Vec<PathBuf> {
    let Some((paths, base)) = resolve_paths_chain(tsconfig_path) else {
        return Vec::new();
    };
    let mut out = Vec::new();
    for targets in paths.values() {
        let Some(targets) = targets.as_array() else {
            continue;
        };
        for target in targets.iter().filter_map(|v| v.as_str()) {
            let trimmed = target
                .strip_suffix("/*")
                .or_else(|| target.strip_suffix('*'))
                .unwrap_or(target);
            if trimmed.is_empty() {
                continue;
            }
            // A missing target must not widen to its parent: `"$types/*":
            // ["../../shared/types/*"]` with `shared/types` not generated yet
            // would otherwise nominate all of `shared/` as a package to mirror.
            let resolved = base.join(trimmed);
            let resolved = if resolved.is_dir() {
                resolved
            } else if resolved.is_file() {
                match resolved.parent() {
                    Some(parent) => parent.to_path_buf(),
                    None => continue,
                }
            } else {
                continue;
            };
            out.push(resolved);
        }
    }
    out
}

/// For every discovered `.svelte` file (in-workspace or external) that lies
/// under one of `alias_prefixes`' target dirs, compute its exact alias
/// specifier (`$lib/Foo.svelte`) paired with its shadow `.tsx`'s absolute
/// path — for use as an exact (non-wildcard) `compilerOptions.paths` entry
/// (see `build_overlay_tsconfig`).
///
/// A plain `.ts`/`.js` source file importing a `.svelte` component through an
/// alias never goes through svelte2tsx (only `.svelte` files do), so
/// `rewrite_aliased_svelte_imports` never touches it — it falls back to the
/// ambient `declare module '*.svelte'` wildcard (#1888). An exact `paths`
/// entry redirects the specifier straight to a file that doesn't end in
/// `.svelte`, so the wildcard is never consulted, regardless of which kind of
/// file does the importing.
///
/// `module_bridges` extends the same treatment to `<base>.svelte.ts` rune
/// modules, whose specifier is likewise `<base>.svelte`: their
/// [`write_esm_bridge`] twin is only reachable through `rootDirs`, and
/// TypeScript applies `rootDirs` to RELATIVE specifiers alone, so an aliased
/// rune module fell through to the same ambient wildcard even after #1941
/// (#1942).
fn compute_alias_path_overrides(
    entries: &[OverlayEntry],
    external: &[ExternalPackage],
    module_bridges: &[(PathBuf, PathBuf)],
    alias_prefixes: &[(String, PathBuf)],
) -> Vec<(String, PathBuf)> {
    if alias_prefixes.is_empty() {
        return Vec::new();
    }
    // (path the specifier names, overlay file it must resolve to), the former
    // pre-canonicalized to compare against a canonicalized alias target dir.
    let mut candidates: Vec<(PathBuf, PathBuf)> = entries
        .iter()
        .map(|e| (canonicalized(&e.source_path), e.tsx_path.clone()))
        .collect();
    for pkg in external {
        for abs_source in &pkg.svelte_files {
            let rel = safe_relative(abs_source, &pkg.real_dir);
            let tsx_path = pkg.mirror_dir.join(append_extension(&rel, ".tsx"));
            candidates.push((canonicalized(abs_source), tsx_path));
        }
    }
    // A rune module's specifier is its path minus the `.ts`/`.js`. Emission
    // already dropped every module a sibling `.svelte` component shadows, so
    // these can never outrank a component entry above.
    for (module, bridge) in module_bridges {
        candidates.push((canonicalized(module).with_extension(""), bridge.clone()));
    }

    let mut out = Vec::new();
    let mut seen: std::collections::HashSet<String> = std::collections::HashSet::new();
    for (real_canon, tsx_path) in &candidates {
        // Longest target-dir prefix wins when aliases nest.
        let best = alias_prefixes
            .iter()
            .filter_map(|(prefix, target_dir)| {
                let target_canon = canonicalized(target_dir);
                real_canon
                    .strip_prefix(&target_canon)
                    .ok()
                    .map(|rel| (prefix, rel.to_path_buf()))
            })
            .max_by_key(|(_, rel)| real_canon.as_os_str().len() - rel.as_os_str().len());
        let Some((prefix, rel)) = best else { continue };
        let rel_posix = rel
            .components()
            .filter_map(|c| c.as_os_str().to_str())
            .collect::<Vec<_>>()
            .join("/");
        if rel_posix.is_empty() {
            continue;
        }
        // A multi-target alias (`"$lib/*": ["./a/*", "./b/*"]`) can map two
        // different components onto the same specifier; TypeScript resolves
        // such a specifier against the first target that exists, so keep the
        // first match rather than letting discovery order decide.
        let spec = format!("{prefix}/{rel_posix}");
        if seen.insert(spec.clone()) {
            out.push((spec, tsx_path.clone()));
        }
    }
    out
}

/// Resolve a tsconfig's effective `compilerOptions.paths` object with every
/// target made absolute, so the overlay tsconfig — which lives in a different
/// directory than whichever config in the chain defined them — can restate it
/// verbatim. See [`resolve_paths_chain`] for the `baseUrl`/`extends` rules.
fn resolve_paths_object_abs(tsconfig_path: &Path) -> serde_json::Map<String, serde_json::Value> {
    let Some((paths, base)) = resolve_paths_chain(tsconfig_path) else {
        return serde_json::Map::new();
    };
    let mut out = serde_json::Map::new();
    for (key, targets) in &paths {
        let Some(targets) = targets.as_array() else {
            continue;
        };
        let abs_targets: Vec<serde_json::Value> = targets
            .iter()
            .filter_map(|v| v.as_str())
            .map(|t| serde_json::Value::String(base.join(t).display().to_string()))
            .collect();
        out.insert(key.clone(), serde_json::Value::Array(abs_targets));
    }
    out
}

/// A re-export of one component shadow's default + named exports, shared by the
/// `.svelte.d.ts` twin and the `.d.svelte.ts` bridge that sit next to it.
fn shadow_reexport(tsx_path: &Path) -> String {
    let basename = tsx_path
        .file_name()
        .and_then(|s| s.to_str())
        .unwrap_or("missing.tsx");
    format!("export {{ default }} from \"./{basename}\";\nexport * from \"./{basename}\";\n")
}

/// `<dir>/<base>.svelte.<ext>` → `<dir>/<base>.d.svelte.ts`.
pub(super) fn esm_bridge_path(path: &Path) -> Option<PathBuf> {
    let name = path.file_name()?.to_str()?;
    let base = name.split_once(".svelte.")?.0;
    Some(path.with_file_name(format!("{base}.d.svelte.ts")))
}

/// Write the `.d.svelte.ts` twin of a `.svelte`-suffixed overlay file.
///
/// Under ESM-mode resolution (`moduleResolution: node16`/`nodenext` inside a
/// `"type": "module"` package) TypeScript performs NO implicit extension
/// substitution, so the single candidate it probes for `./Foo.svelte` is
/// `./Foo.d.svelte.ts` (the `allowArbitraryExtensions` form) — never the
/// `.svelte.tsx` shadow, and never a real `Foo.svelte.ts`. The specifier then
/// falls through to the ambient `declare module "*.svelte"` and every *named*
/// import errors with `TS2614` (#1916). Official svelte-check instead forces the
/// pre-ESM algorithm for `.svelte` specifiers inside its own
/// `resolveModuleNames` hook (`module-loader.ts`); a stock compiler driven over
/// an on-disk overlay has to supply the file it actually looks for. Emitting it
/// for every shadow keeps resolution identical in both modes and independent of
/// whether the importer is a `.svelte` shadow or a plain `.ts` file we cannot
/// rewrite.
///
/// `only_if_missing` is for an incremental cache hit, whose shadow was not
/// rewritten either: the bridge still has to be backfilled when it comes from a
/// build that never wrote one, but its content cannot have gone stale.
fn write_esm_bridge(path: &Path, content: &str, only_if_missing: bool) -> io::Result<()> {
    let Some(bridge) = esm_bridge_path(path) else {
        return Ok(());
    };
    if only_if_missing && bridge.exists() {
        return Ok(());
    }
    fs::write(bridge, content)
}

/// Emit the [`write_esm_bridge`] twins for `<base>.svelte.ts` /
/// `<base>.svelte.js` rune modules under `root`, into `mirror_dir`'s matching
/// subtree so the overlay's `rootDirs` pair bridges them.
///
/// A module with a sibling `<base>.svelte` component is skipped: the component's
/// own bridge already claims the specifier, which is what a `.svelte` specifier
/// means (see [`rewrite_companion_module_imports`]).
///
/// A `.js` module in a project without `allowJs` is skipped too: it is not part
/// of the program at all, so official svelte-check resolves the specifier to it
/// and reports TS7016 ("could not find a declaration file"). A bridge only
/// replaces that with a wrong error — `export *` of an untyped module forwards
/// no names, so every named import fails with TS2614 instead (#2061). Those
/// skips are collected into `withheld` so
/// [`replay_withheld_js_module_diagnostics`] can restate what official says
/// about them.
///
/// These bridges have no manifest entry to prune them by, so the mirror is also
/// swept for ones whose source module has since been deleted or renamed.
///
/// Returns the `(rune module, bridge)` pairs it kept, for
/// [`compute_alias_path_overrides`] to turn into exact `paths` entries — the
/// skip and `.ts`-over-`.js` rules above are exactly the ones an alias
/// specifier has to follow too (#1942).
fn emit_svelte_module_bridges(
    root: &Path,
    mirror_dir: &Path,
    ignore: &[String],
    allow_js: bool,
    withheld: &mut Vec<PathBuf>,
) -> Result<Vec<(PathBuf, PathBuf)>, OverlayError> {
    let mut modules = super::walker::find_svelte_suffixed_modules(root, ignore);
    // `x.svelte.ts` and `x.svelte.js` share one bridge path; TypeScript probes
    // `.ts` first, so let it win.
    modules.sort_by_key(|p| {
        let is_js = p.extension().and_then(|e| e.to_str()) == Some("js");
        (is_js, p.clone())
    });
    let mut written: std::collections::HashSet<PathBuf> = std::collections::HashSet::new();
    let mut kept: Vec<(PathBuf, PathBuf)> = Vec::new();
    for module in &modules {
        if module.with_extension("").is_file() {
            continue;
        }
        if !allow_js
            && module.extension().and_then(|e| e.to_str()) == Some("js")
            && !module.with_extension("d.ts").is_file()
        {
            withheld.push(module.clone());
            continue;
        }
        let rel = safe_relative(module, root);
        let Some(bridge) = esm_bridge_path(&mirror_dir.join(&rel)) else {
            continue;
        };
        if !written.insert(bridge.clone()) {
            continue;
        }
        let Some(bridge_dir) = bridge.parent() else {
            continue;
        };
        fs::create_dir_all(bridge_dir)?;
        let mut spec = lexical_relative_posix(&absolutize(bridge_dir), &absolutize(module));
        // A `.js` specifier is the one form TypeScript substitutes for the real
        // `.ts` in every resolution mode, so it needs neither an implicit
        // extension nor `allowImportingTsExtensions`.
        if let Some(stripped) = spec.strip_suffix(".ts") {
            spec = format!("{stripped}.js");
        }
        if !spec.starts_with('.') {
            spec = format!("./{spec}");
        }
        let mut content = format!("export * from \"{spec}\";\n");
        // `export *` never forwards a default.
        if module_has_default(module) {
            let _ = writeln!(content, "export {{ default }} from \"{spec}\";");
        }
        fs::write(&bridge, content)?;
        kept.push((module.clone(), bridge));
    }
    prune_orphaned_module_bridges(mirror_dir, &written);
    Ok(kept)
}

/// Drop `.d.svelte.ts` files under `mirror_dir` that this run did not write and
/// that no component shadow owns — i.e. bridges left behind by a rune module
/// that has since been deleted or renamed. A component's bridge is recognised by
/// its `.svelte.tsx` sibling, so the sweep is safe whichever order the two kinds
/// of bridge are emitted in.
fn prune_orphaned_module_bridges(mirror_dir: &Path, written: &std::collections::HashSet<PathBuf>) {
    // A bridge's own name ends in `.svelte.ts`, so the rune-module finder lists
    // it too — filter for the declaration form.
    for bridge in super::walker::find_svelte_suffixed_modules(mirror_dir, &[]) {
        let Some(base) = bridge
            .file_name()
            .and_then(|n| n.to_str())
            .and_then(|n| n.strip_suffix(".d.svelte.ts"))
        else {
            continue;
        };
        if written.contains(&bridge) {
            continue;
        }
        let shadow = bridge.with_file_name(format!("{base}.svelte.tsx"));
        if shadow.is_file() {
            continue;
        }
        let _ = fs::remove_file(&bridge);
    }
}

/// Infix marking a file under the mirror as an `emit_import_probes` probe.
/// It has to differ from the source's own basename: a probe is a *blanked*
/// copy, so a mirror file resolving `./relative` to it instead of the real
/// module would see none of its exports.
pub(super) const IMPORT_PROBE_INFIX: &str = ".rsvelte-import-probe";

/// Components whose own `.svelte` specifier TypeScript hands to a same-named
/// companion module instead, where official svelte-check hands it to the
/// component.
///
/// Resolving `./Foo.svelte` from the importer's own directory, TypeScript
/// probes `Foo.d.svelte.ts` (the `allowArbitraryExtensions` form) and then
/// `Foo.svelte.ts` / `.tsx` / `.js`, so a real companion wins. Official's
/// `svelteSys.fileExists` answers the first probe with "yes" whenever
/// `Foo.svelte` exists — unless a real declaration (`Foo.svelte.d.ts` or
/// `Foo.d.svelte.ts`) sits there, which it lets take precedence (#2061).
fn components_hijacked_by_a_companion(abs_files: &[PathBuf]) -> std::collections::HashSet<PathBuf> {
    let sibling = |component: &Path, suffix: &str| -> PathBuf {
        let mut p = component.as_os_str().to_os_string();
        p.push(suffix);
        PathBuf::from(p)
    };
    let real_declaration = |component: &Path| -> bool {
        let Some(stem) = component.file_stem().and_then(|s| s.to_str()) else {
            return false;
        };
        sibling(component, ".d.ts").is_file()
            || component
                .with_file_name(format!("{stem}.d.svelte.ts"))
                .is_file()
    };
    let mut out = std::collections::HashSet::new();
    for component in abs_files {
        if real_declaration(component) {
            continue;
        }
        if [".ts", ".tsx", ".js", ".jsx"]
            .iter()
            .any(|ext| sibling(component, ext).is_file())
        {
            out.insert(normalize_abs(component));
        }
    }
    out
}

/// Mirror every plain `.ts` / `.js` source whose relative `.svelte` specifier
/// is hijacked by a companion module (see [`components_hijacked_by_a_companion`])
/// into `<emit_dir>`, with everything but those import declarations blanked out.
///
/// A `.svelte` importer can be steered by rewriting the specifier as the shadow
/// is generated, and a non-relative one by an exact `paths` entry, but a
/// relative specifier in a file we do not own is beyond both: `paths` never
/// applies to it and `rootDirs` only offers the mirror *after* the importer's
/// own directory came up empty, which it does not. Re-resolving the same import
/// from inside the mirror — where the component's `.d.svelte.ts` bridge is the
/// only candidate — is what makes the compiler agree with official's
/// `resolveModuleNames` hook. Blanking the rest keeps the probe answerable for
/// nothing but the import it exists to test, and preserves every byte position
/// so its diagnostics are reported where the user wrote them.
fn emit_import_probes(
    workspace: &Path,
    emit_dir: &Path,
    ignore: &[String],
    hijacked: &std::collections::HashSet<PathBuf>,
) -> Result<Vec<ImportProbeEntry>, OverlayError> {
    let mut written: std::collections::HashSet<PathBuf> = std::collections::HashSet::new();
    let mut out: Vec<ImportProbeEntry> = Vec::new();
    if !hijacked.is_empty() {
        for source in super::walker::find_probeable_modules(workspace, ignore) {
            let Ok(text) = fs::read_to_string(&source) else {
                continue;
            };
            if !text.contains(".svelte") {
                continue;
            }
            let spans = hijacked_import_spans(&text, &source, hijacked);
            if spans.is_empty() {
                continue;
            }
            let rel = safe_relative(&source, workspace);
            let Some(probe) = import_probe_path(&emit_dir.join(&rel)) else {
                continue;
            };
            if let Some(parent) = probe.parent() {
                fs::create_dir_all(parent)?;
            }
            fs::write(&probe, blank_outside(&text, &spans))?;
            written.insert(probe.clone());
            out.push(ImportProbeEntry {
                source_path: source,
                out_path: probe,
                spans,
            });
        }
    }
    prune_orphaned_import_probes(emit_dir, &written);
    Ok(out)
}

/// `<dir>/<stem>.<ext>` → `<dir>/<stem>.rsvelte-import-probe.<ext>`.
fn import_probe_path(mirrored: &Path) -> Option<PathBuf> {
    let name = mirrored.file_name()?.to_str()?;
    let (stem, ext) = name.rsplit_once('.')?;
    Some(mirrored.with_file_name(format!("{stem}{IMPORT_PROBE_INFIX}.{ext}")))
}

/// Byte ranges of `text`'s top-level `import` / `export … from` declarations
/// whose specifier is a relative `.svelte` path landing on a `hijacked`
/// component.
fn hijacked_import_spans(
    text: &str,
    source: &Path,
    hijacked: &std::collections::HashSet<PathBuf>,
) -> Vec<(usize, usize)> {
    let Some(source_dir) = source.parent().map(absolutize) else {
        return Vec::new();
    };
    let source_type = SourceType::from_path(source).unwrap_or_default();
    let allocator = Allocator::default();
    let parsed = OxcParser::new(&allocator, text, source_type).parse();
    let mut spans: Vec<(usize, usize)> = Vec::new();
    let mut take = |specifier: &str, span: oxc_span::Span| {
        if !specifier.starts_with('.') || !specifier.ends_with(".svelte") {
            return;
        }
        if hijacked.contains(&normalize_abs(&source_dir.join(specifier))) {
            spans.push((span.start as usize, span.end as usize));
        }
    };
    for stmt in &parsed.program.body {
        match stmt {
            oxc::Statement::ImportDeclaration(decl) => take(&decl.source.value, decl.span),
            oxc::Statement::ExportFromDeclaration(decl) => take(&decl.source.value, decl.span),
            oxc::Statement::ExportAllDeclaration(decl) => take(&decl.source.value, decl.span),
            _ => {}
        }
    }
    spans
}

/// Replace every byte outside `spans` with a space, newlines excepted, so the
/// result parses as just those declarations while every retained byte keeps its
/// original line and column.
fn blank_outside(text: &str, spans: &[(usize, usize)]) -> String {
    let mut out = String::with_capacity(text.len());
    for (offset, ch) in text.char_indices() {
        let kept =
            ch == '\n' || ch == '\r' || spans.iter().any(|(s, e)| offset >= *s && offset < *e);
        if kept {
            out.push(ch);
        } else {
            out.extend(std::iter::repeat_n(' ', ch.len_utf8()));
        }
    }
    out
}

/// Drop probes under `emit_dir` this run did not write — their source has
/// since lost the import (or the companion) that called for one.
fn prune_orphaned_import_probes(emit_dir: &Path, written: &std::collections::HashSet<PathBuf>) {
    for probe in super::walker::find_import_probes(emit_dir) {
        if !written.contains(&probe) {
            let _ = fs::remove_file(&probe);
        }
    }
}

/// Restate what official svelte-check reports for a `.svelte` specifier that
/// lands on a `.svelte.js` rune module the overlay deliberately left without a
/// bridge (see `emit_svelte_module_bridges`).
///
/// Under ESM-mode resolution the specifier reaches nothing at all, so the
/// compiler says TS2307. Official forces the pre-ESM algorithm for `.svelte`
/// specifiers, finds the untyped `.js`, and says TS7016 — or, without
/// `noImplicitAny`, says nothing. Having withheld the file, the overlay owes
/// the user that answer (#2061).
pub(crate) fn replay_withheld_js_module_diagnostics(
    diagnostics: &mut Vec<Diagnostic>,
    withheld: &[PathBuf],
    no_implicit_any: bool,
) {
    if withheld.is_empty() {
        return;
    }
    let withheld: std::collections::HashSet<PathBuf> =
        withheld.iter().map(|p| normalize_abs(p)).collect();
    diagnostics.retain_mut(|diag| {
        if diag.code.as_deref() != Some("TS2307") {
            return true;
        }
        let Some(specifier) = quoted_module_name(&diag.message) else {
            return true;
        };
        if !specifier.starts_with('.') || !specifier.ends_with(".svelte") {
            return true;
        }
        let Some(dir) = diag.file.parent().map(absolutize) else {
            return true;
        };
        let base = normalize_abs(&dir.join(specifier));
        let Some(module) = [".js", ".jsx"]
            .iter()
            .map(|ext| {
                let mut p = base.as_os_str().to_os_string();
                p.push(ext);
                PathBuf::from(p)
            })
            .find(|p| withheld.contains(p))
        else {
            return true;
        };
        if !no_implicit_any {
            return false;
        }
        diag.code = Some("TS7016".into());
        diag.message = format!(
            "Could not find a declaration file for module '{specifier}'. '{}' implicitly has an 'any' type.",
            module.display()
        );
        true
    });
}

/// The first single-quoted run in a TypeScript diagnostic message — the module
/// name in `Cannot find module 'X' or its corresponding type declarations.`
fn quoted_module_name(message: &str) -> Option<&str> {
    let rest = message.split_once('\'')?.1;
    rest.split_once('\'').map(|(name, _)| name)
}

fn module_has_default(path: &Path) -> bool {
    let source_type = if path.extension().and_then(|e| e.to_str()) == Some("ts") {
        SourceType::ts()
    } else {
        SourceType::default()
    };
    fs::read_to_string(path)
        .map(|src| module_exports(&src, source_type).has_default)
        .unwrap_or(false)
}

/// Sibling companion module (`Foo.svelte.ts` / `Foo.svelte.js`) of a
/// `…/Foo.svelte` component source, when one exists on disk.
fn find_companion_module(abs_source: &Path) -> Option<PathBuf> {
    for ext in [".ts", ".js"] {
        let mut cand = abs_source.as_os_str().to_os_string();
        cand.push(ext);
        let cand = PathBuf::from(cand);
        if cand.is_file() {
            return Some(cand);
        }
    }
    None
}

/// Re-point a shadow's relative `./Foo.svelte.js` / `./Foo.svelte.ts` specifiers
/// at the real companion module.
///
/// A companion collides with its component on the same TypeScript basename:
/// resolved from the shadow's own directory, `./Foo.svelte.js` substitutes to
/// `Foo.svelte.tsx` — the component shadow — before `rootDirs` can reach the
/// real `Foo.svelte.ts`, so the companion's named exports read as missing
/// (`TS2614`, #751). Folding them into the shadow instead would leak them into
/// every `.svelte` specifier that resolves *through* the shadow, where official
/// svelte-check reports `TS2614` because a `.svelte` specifier means the
/// component and nothing else (#2061). Rewriting the one specifier that is
/// genuinely about the companion keeps both halves honest.
fn rewrite_companion_module_imports(tsx: &str, abs_source: &Path, tsx_path: &Path) -> String {
    let (Some(source_dir), Some(generated_dir)) = (abs_source.parent(), tsx_path.parent()) else {
        return tsx.to_string();
    };
    let source_dir = absolutize(source_dir);
    let generated_dir = absolutize(generated_dir);

    let decide = |spec: &str| -> Option<String> {
        if !spec.starts_with('.') {
            return None;
        }
        let base = spec
            .strip_suffix(".js")
            .or_else(|| spec.strip_suffix(".ts"))?;
        if !base.ends_with(".svelte") {
            return None;
        }
        // Only a real component sitting next to the module makes the shadow
        // outrank it; any other `.svelte.ts` already resolves through `rootDirs`.
        let component = normalize_abs(&source_dir.join(base));
        if !component.is_file() {
            return None;
        }
        let companion = find_companion_module(&component)?;
        let mut rewritten = lexical_relative_posix(&generated_dir, &companion);
        // TS resolves `./x.svelte.js` by stripping `.js` and finding the real
        // `.ts`/`.js`; normalise a `.ts` companion's specifier to `.js`.
        if let Some(stripped) = rewritten.strip_suffix(".ts") {
            rewritten = format!("{stripped}.js");
        }
        if !rewritten.starts_with('.') {
            rewritten = format!("./{rewritten}");
        }
        Some(rewritten)
    };

    rewrite_module_specifiers(tsx, &decide)
}

/// Filename of the generated module-augmentation declaration, written into the
/// cache dir next to the shims.
const COMPANION_AUGMENT_FILE: &str = "companion-augment.d.ts";

/// One `Foo.svelte` + same-name companion pair that needs a module
/// augmentation (see [`write_companion_augmentation`]).
struct CompanionAugment {
    /// The `.svelte` source; `path_relative` from the cache dir gives the
    /// specifier whose resolution we are augmenting.
    source_path: PathBuf,
    /// The component shadow that supplies the augmented types.
    tsx_path: PathBuf,
    /// Component exports to forward, minus anything the companion already
    /// exports itself (re-declaring those would be a duplicate identifier).
    names: Vec<String>,
    /// Whether the component's default export still needs forwarding — a
    /// companion that already re-exports it must not get a second one.
    forward_default: bool,
}

fn build_companion_augment(
    abs_source: &Path,
    tsx_path: &Path,
    companion: &Path,
) -> CompanionAugment {
    let shadow = fs::read_to_string(tsx_path)
        .map(|src| module_exports(&src, SourceType::tsx()))
        .unwrap_or_default();
    let companion_source_type = if companion.extension().and_then(|e| e.to_str()) == Some("ts") {
        SourceType::ts()
    } else {
        SourceType::default()
    };
    let companion = fs::read_to_string(companion)
        .map(|src| module_exports(&src, companion_source_type))
        .unwrap_or_default();
    let names = shadow
        .names
        .into_iter()
        .filter(|n| !companion.names.contains(n))
        .collect();
    CompanionAugment {
        source_path: abs_source.to_path_buf(),
        tsx_path: tsx_path.to_path_buf(),
        names,
        forward_default: !companion.has_default,
    }
}

/// Write the module augmentation that restores `./Foo.svelte`'s component
/// identity when a same-name `Foo.svelte.ts` / `.js` companion exists (#800).
///
/// TypeScript resolves `./Foo.svelte` by appending extensions in the
/// *importer's own* directory, so a sibling `Foo.svelte.ts` always wins over
/// the overlay's `Foo.svelte.tsx` shadow — `rootDirs` is only consulted after
/// that lookup fails, and `paths` never applies to relative specifiers. The
/// specifier therefore lands on the companion, and the component's default
/// export plus its `<script module>` named exports vanish. Since the module
/// TypeScript picked is a real user file we cannot rewrite, we instead
/// *augment* it with the shadow's exports, so one resolvable module carries
/// both halves. Returns whether anything was written.
fn write_companion_augmentation(
    cache_dir: &Path,
    augments: &[CompanionAugment],
) -> io::Result<bool> {
    let path = cache_dir.join(COMPANION_AUGMENT_FILE);
    if augments.is_empty() {
        // A previous run may have left a stale file that `files` no longer
        // lists; drop it so it can't shadow a companion that has since gone.
        let _ = fs::remove_file(&path);
        return Ok(false);
    }
    let mut out = String::new();
    for (i, aug) in augments.iter().enumerate() {
        let ns = format!("__rsvelte_companion_{i}");
        let shadow_spec = dot_relative(cache_dir, &aug.tsx_path);
        let module_spec = dot_relative(cache_dir, &aug.source_path);
        let _ = writeln!(out, "import * as {ns} from \"{shadow_spec}\";");
        let _ = writeln!(out, "declare module \"{module_spec}\" {{");
        if aug.forward_default {
            let _ = writeln!(out, "    const _default: (typeof {ns})[\"default\"];");
            // TS applies a default export inside an augmentation but still
            // grammar-errors on it (TS2666); this file is ours, not user code.
            let _ = writeln!(out, "    // @ts-ignore");
            let _ = writeln!(out, "    export default _default;");
        }
        for name in &aug.names {
            // `export import` aliases the value *and* the type meaning of the
            // name; a plain `export const` would drop `export type` members.
            let _ = writeln!(out, "    export import {name} = {ns}.{name};");
        }
        let _ = writeln!(out, "}}");
    }
    fs::write(&path, out)?;
    Ok(true)
}

/// [`path_relative`] forced into an explicitly-relative module specifier.
fn dot_relative(from_dir: &Path, to_path: &Path) -> String {
    let spec = path_relative(from_dir, to_path);
    if spec.starts_with('.') {
        spec
    } else {
        format!("./{spec}")
    }
}

/// A module's top-level exports. Bare `export * from` contributes nothing —
/// its names are not knowable without resolving the target.
#[derive(Default)]
struct ModuleExports {
    /// Named exports, excluding `default` and any non-identifier name
    /// (`export { x as "a-b" }`) that cannot appear in an `export import`.
    names: Vec<String>,
    has_default: bool,
}

fn module_exports(source: &str, source_type: SourceType) -> ModuleExports {
    let allocator = Allocator::default();
    let parsed = OxcParser::new(&allocator, source, source_type).parse();
    let mut names: Vec<String> = Vec::new();
    let mut has_default = false;
    for stmt in &parsed.program.body {
        match stmt {
            oxc::Statement::ExportDeclaration(decl) => {
                collect_declaration_names(&decl.declaration, &mut names);
            }
            oxc::Statement::ExportNamedDeclaration(decl) => {
                for spec in &decl.specifiers {
                    names.push(spec.exported.name().to_string());
                }
            }
            oxc::Statement::ExportFromDeclaration(decl) => {
                for spec in &decl.specifiers {
                    names.push(spec.exported.name().to_string());
                }
            }
            oxc::Statement::ExportAllDeclaration(decl) => {
                if let Some(exported) = &decl.exported {
                    names.push(exported.name().to_string());
                }
            }
            oxc::Statement::ExportDefaultDeclaration(_) => has_default = true,
            _ => {}
        }
    }
    has_default |= names.iter().any(|n| n == "default");
    names.retain(|n| n != "default" && is_js_identifier(n));
    names.sort();
    names.dedup();
    ModuleExports { names, has_default }
}

fn collect_declaration_names(declaration: &oxc::Declaration, names: &mut Vec<String>) {
    match declaration {
        oxc::Declaration::VariableDeclaration(var) => {
            for declarator in &var.declarations {
                collect_binding_pattern_names(&declarator.id, names);
            }
        }
        oxc::Declaration::FunctionDeclaration(func) => {
            if let Some(id) = &func.id {
                names.push(id.name.to_string());
            }
        }
        oxc::Declaration::ClassDeclaration(class) => {
            if let Some(id) = &class.id {
                names.push(id.name.to_string());
            }
        }
        oxc::Declaration::TSTypeAliasDeclaration(alias) => names.push(alias.id.name.to_string()),
        oxc::Declaration::TSInterfaceDeclaration(iface) => names.push(iface.id.name.to_string()),
        oxc::Declaration::TSEnumDeclaration(enum_decl) => names.push(enum_decl.id.name.to_string()),
        // `declare module`/`namespace` bodies can re-open across files; aliasing
        // them into an augmentation is not worth the ambiguity.
        _ => {}
    }
}

fn collect_binding_pattern_names(pattern: &oxc::BindingPattern, names: &mut Vec<String>) {
    match pattern {
        oxc::BindingPattern::BindingIdentifier(id) => names.push(id.name.to_string()),
        oxc::BindingPattern::ObjectPattern(obj) => {
            for prop in &obj.properties {
                collect_binding_pattern_names(&prop.value, names);
            }
            if let Some(rest) = &obj.rest {
                collect_binding_pattern_names(&rest.argument, names);
            }
        }
        oxc::BindingPattern::ArrayPattern(arr) => {
            for el in arr.elements.iter().flatten() {
                collect_binding_pattern_names(el, names);
            }
            if let Some(rest) = &arr.rest {
                collect_binding_pattern_names(&rest.argument, names);
            }
        }
        oxc::BindingPattern::AssignmentPattern(assign) => {
            collect_binding_pattern_names(&assign.left, names)
        }
    }
}

fn is_js_identifier(name: &str) -> bool {
    let mut chars = name.chars();
    match chars.next() {
        Some(c) if c.is_alphabetic() || c == '_' || c == '$' => {}
        _ => return false,
    }
    chars.all(|c| c.is_alphanumeric() || c == '_' || c == '$')
}

/// Build the module resolver used to re-point tsconfig-alias `.svelte` imports
/// at their shadow `.tsx`. `None` when there is no project tsconfig (aliases
/// can only come from a tsconfig's `paths`/`baseUrl`).
fn build_svelte_import_resolver(tsconfig: Option<&Path>) -> Option<oxc_resolver::Resolver> {
    use oxc_resolver::{
        ResolveOptions, Resolver, TsconfigDiscovery, TsconfigOptions, TsconfigReferences,
    };
    let tsconfig = tsconfig?;
    // With a relative `config_file`, oxc_resolver's tsconfig discovery returns
    // `NotFound` (no error surfaced) for any `paths` target that resolves
    // outside the current working directory via `..` — which is exactly
    // every cross-package alias (a sibling package is reached by climbing up
    // and over). `--tsconfig ./tsconfig.json` is the CLI's own documented
    // usage, so this silently defeated alias rewriting for precisely the
    // cross-package case this module exists to handle. Anchor on the CWD,
    // matching how the rest of the CLI resolves relative paths passed on the
    // command line.
    let tsconfig = absolutize(tsconfig);
    let tsconfig = tsconfig.as_path();
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
/// Specifiers that oxc_resolver maps to a `.svelte` file UNDER the workspace
/// are rewritten to that file's shadow under `emit_dir`. A specifier that
/// resolves OUTSIDE the workspace but under one of `ext_pairs`' real dirs (a
/// sibling package discovered by [`discover_external_svelte_packages`], via
/// either a `node_modules` symlink or a `paths` alias) is rewritten to that
/// package's mirror shadow instead — `rootDirs` cannot bridge a non-relative
/// alias (#782), so the specifier itself has to point at the shadow. A bare
/// package specifier deep-importing a `.svelte` file from such a package is
/// rewritten the same way; anything resolving outside both is left untouched.
///
/// `confine_to` restricts what counts as a valid target: when emitting an
/// external package's own shadows the alias was resolved with a `paths` map
/// that may belong to a different project, so only a target inside that
/// package is accepted.
fn rewrite_aliased_svelte_imports(
    tsx: &str,
    abs_source: &Path,
    tsx_path: &Path,
    workspace: &Path,
    emit_dir: &Path,
    resolver: &oxc_resolver::Resolver,
    ext_pairs: &[(PathBuf, PathBuf)],
    confine_to: Option<&Path>,
) -> String {
    let (Some(source_dir), Some(generated_dir)) = (abs_source.parent(), tsx_path.parent()) else {
        return tsx.to_string();
    };
    // `--workspace .` makes every walked source path relative, and a relative
    // resolution base has no parent to climb, so oxc_resolver's `node_modules`
    // walk-up never leaves the workspace and every bare specifier fails.
    let source_dir = absolutize(source_dir);
    let source_dir = source_dir.as_path();
    // oxc_resolver returns canonicalised paths (symlinks resolved), so compare
    // against a canonicalised workspace — otherwise a symlinked root (e.g.
    // macOS `/var` → `/private/var`) makes `strip_prefix` spuriously fail and
    // no alias gets rewritten.
    let workspace_canon = workspace
        .canonicalize()
        .unwrap_or_else(|_| workspace.to_path_buf());
    let confine_canon =
        confine_to.map(|dir| dir.canonicalize().unwrap_or_else(|_| dir.to_path_buf()));
    let ext_pairs_canon: Vec<(PathBuf, &Path)> = ext_pairs
        .iter()
        .map(|(real, mirror)| {
            (
                real.canonicalize().unwrap_or_else(|_| real.clone()),
                mirror.as_path(),
            )
        })
        .collect();

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
        // Rewriting a file inside an external package: the alias was resolved
        // with a `paths` map that belongs to a different project, so a name
        // collision (`$lib` means one thing to the consumer and another to the
        // package — and it is SvelteKit's own convention) would silently
        // repoint the import at an unrelated component. Only accept a target
        // inside the package being emitted; anything else keeps the original
        // specifier and its ambient fallback.
        if let Some(confine) = &confine_canon
            && !resolved_canon.starts_with(confine)
        {
            return None;
        }
        let (rel, mirror_dir) = if let Ok(rel) = resolved_canon.strip_prefix(&workspace_canon) {
            (rel, emit_dir)
        } else {
            // Longest real-dir prefix wins when packages nest.
            ext_pairs_canon
                .iter()
                .filter_map(|(real, mirror)| {
                    resolved_canon
                        .strip_prefix(real)
                        .ok()
                        .map(|rel| (rel, *mirror))
                })
                .max_by_key(|(rel, _)| resolved_canon.as_os_str().len() - rel.as_os_str().len())?
        };
        let shadow = append_extension(&mirror_dir.join(rel), ".tsx");
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

/// POSIX-style *absolute* path for a tsconfig entry. Everything else in the
/// generated tsconfig goes through [`path_relative`], which sidesteps this by
/// dropping `Component::Prefix` outright; an entry that has to stay absolute
/// (the installed svelte's `svelte-html.d.ts`) must instead strip Windows'
/// `\\?\` verbatim prefix, which `fs::canonicalize` adds and tsc/tsgo cannot
/// resolve once the separators are flipped.
fn tsconfig_absolute_path(path: &Path) -> String {
    let slashed = path.to_string_lossy().replace('\\', "/");
    // `\\?\UNC\server\share\…` denotes `\\server\share\…`.
    if let Some(rest) = slashed.strip_prefix("//?/UNC/") {
        return format!("//{rest}");
    }
    if let Some(rest) = slashed.strip_prefix("//?/") {
        return rest.to_owned();
    }
    slashed
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

    /// The current directory is process-wide while tests run in parallel, so
    /// every test that has to exercise a CLI-relative path takes this first.
    static CWD_LOCK: std::sync::Mutex<()> = std::sync::Mutex::new(());
    use std::fs;
    use std::io::Write;

    /// Shadows the real entry point with the default compiler options; the
    /// tests below are about layout and module resolution, not config.
    fn materialize_overlay_with(
        workspace: &Path,
        files: &[PathBuf],
        tsconfig_path: Option<&Path>,
        incremental: bool,
        ignore: &[String],
    ) -> Result<OverlayLayout, OverlayError> {
        super::materialize_overlay_with(
            workspace,
            files,
            tsconfig_path,
            incremental,
            ignore,
            &CompilerOptionsSettings::default(),
        )
    }

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
        let layout = materialize_overlay_with(&tmp, &files, None, false, &[]).unwrap();
        let cfg: serde_json::Value =
            serde_json::from_str(&fs::read_to_string(&layout.overlay_tsconfig).unwrap()).unwrap();
        assert!(
            cfg["compilerOptions"]["incremental"].is_null(),
            "non-incremental overlay must not set incremental"
        );

        // Incremental: hand tsgo/tsc a `tsBuildInfoFile` so the compiler caches
        // its program graph across runs (the warm-run speedup).
        let layout = materialize_overlay_with(&tmp, &files, None, true, &[]).unwrap();
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
        let layout1 = materialize_overlay_with(&tmp, &files, None, true, &[]).unwrap();
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
        let layout2 = materialize_overlay_with(&tmp, &files, None, true, &[]).unwrap();
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
        let layout3 = materialize_overlay_with(&tmp, &files, None, true, &[]).unwrap();
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
            materialize_overlay_with(&tmp, &[kept.clone(), removed.clone()], None, true, &[])
                .unwrap();
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
        let _ =
            materialize_overlay_with(&tmp, std::slice::from_ref(&kept), None, true, &[]).unwrap();
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

    /// Regression test for issue #1569: `rewrite_aliased_svelte_imports`
    /// rewrites tsconfig-alias-resolved `.svelte` imports (e.g. SvelteKit's
    /// `$lib/...`) to relative `.svelte.tsx` specifiers, which tsgo/tsc
    /// reject with "An import path can only end with a '.tsx' extension
    /// when 'allowImportingTsExtensions' is enabled" unless the overlay
    /// tsconfig sets it itself.
    #[test]
    fn overlay_tsconfig_allows_importing_ts_extensions() {
        let tmp = std::env::temp_dir().join(format!("svc_overlay_ts_ext_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(tmp.join("src")).unwrap();
        fs::write(tmp.join("src/App.svelte"), "<div>hi</div>").unwrap();

        let files = vec![tmp.join("src/App.svelte")];
        let layout = materialize_overlay(&tmp, &files, None).unwrap();

        let cfg: serde_json::Value =
            serde_json::from_str(&fs::read_to_string(&layout.overlay_tsconfig).unwrap()).unwrap();
        assert_eq!(
            cfg["compilerOptions"]["allowImportingTsExtensions"],
            serde_json::json!(true)
        );

        let _ = fs::remove_dir_all(&tmp);
    }

    /// With no `--tsconfig` at all, tsgo/tsc would otherwise fall back to the ES5/ES3 default lib and the vendored shims themselves fail to compile.
    #[test]
    fn overlay_tsconfig_forces_modern_target_with_no_tsconfig() {
        let tmp =
            std::env::temp_dir().join(format!("svc_overlay_target_none_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(tmp.join("src")).unwrap();
        fs::write(tmp.join("src/App.svelte"), "<div>hi</div>").unwrap();

        let files = vec![tmp.join("src/App.svelte")];
        let layout = materialize_overlay(&tmp, &files, None).unwrap();

        let cfg: serde_json::Value =
            serde_json::from_str(&fs::read_to_string(&layout.overlay_tsconfig).unwrap()).unwrap();
        assert_eq!(
            cfg["compilerOptions"]["target"],
            serde_json::json!("ESNext")
        );

        let _ = fs::remove_dir_all(&tmp);
    }

    /// A target below ES2015 is bumped to ES2015 rather than left at whatever pre-ES2015 default lib it would otherwise pull in.
    #[test]
    fn overlay_tsconfig_bumps_low_target_to_es2015() {
        let tmp =
            std::env::temp_dir().join(format!("svc_overlay_target_es5_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(tmp.join("src")).unwrap();
        fs::write(
            tmp.join("tsconfig.json"),
            r#"{ "compilerOptions": { "target": "es5" } }"#,
        )
        .unwrap();
        fs::write(tmp.join("src/App.svelte"), "<div>hi</div>").unwrap();

        let files = vec![tmp.join("src/App.svelte")];
        let tsconfig = tmp.join("tsconfig.json");
        let layout = materialize_overlay(&tmp, &files, Some(&tsconfig)).unwrap();

        let cfg: serde_json::Value =
            serde_json::from_str(&fs::read_to_string(&layout.overlay_tsconfig).unwrap()).unwrap();
        assert_eq!(
            cfg["compilerOptions"]["target"],
            serde_json::json!("ES2015")
        );

        let _ = fs::remove_dir_all(&tmp);
    }

    /// The overlay must not clobber a deliberate, already-modern-enough target with its own override.
    #[test]
    fn overlay_tsconfig_leaves_modern_target_untouched() {
        let tmp =
            std::env::temp_dir().join(format!("svc_overlay_target_modern_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(tmp.join("src")).unwrap();
        fs::write(
            tmp.join("tsconfig.json"),
            r#"{ "compilerOptions": { "target": "ES2022" } }"#,
        )
        .unwrap();
        fs::write(tmp.join("src/App.svelte"), "<div>hi</div>").unwrap();

        let files = vec![tmp.join("src/App.svelte")];
        let tsconfig = tmp.join("tsconfig.json");
        let layout = materialize_overlay(&tmp, &files, Some(&tsconfig)).unwrap();

        let cfg: serde_json::Value =
            serde_json::from_str(&fs::read_to_string(&layout.overlay_tsconfig).unwrap()).unwrap();
        assert!(
            cfg["compilerOptions"]["target"].is_null(),
            "overlay should not override an already-modern target: {cfg}"
        );

        let _ = fs::remove_dir_all(&tmp);
    }

    /// A year-numbered target beyond the hardcoded aliases (`es3`/`es5`/`es6`/`esnext`) must still be recognized as modern via the generic `esNNNN` parse.
    #[test]
    fn overlay_tsconfig_leaves_es2025_target_untouched() {
        let tmp =
            std::env::temp_dir().join(format!("svc_overlay_target_es2025_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(tmp.join("src")).unwrap();
        fs::write(
            tmp.join("tsconfig.json"),
            r#"{ "compilerOptions": { "target": "ES2025" } }"#,
        )
        .unwrap();
        fs::write(tmp.join("src/App.svelte"), "<div>hi</div>").unwrap();

        let files = vec![tmp.join("src/App.svelte")];
        let tsconfig = tmp.join("tsconfig.json");
        let layout = materialize_overlay(&tmp, &files, Some(&tsconfig)).unwrap();

        let cfg: serde_json::Value =
            serde_json::from_str(&fs::read_to_string(&layout.overlay_tsconfig).unwrap()).unwrap();
        assert!(
            cfg["compilerOptions"]["target"].is_null(),
            "overlay should not override an already-modern target: {cfg}"
        );

        let _ = fs::remove_dir_all(&tmp);
    }

    /// A target set only on a grandparent config (e.g. SvelteKit's generated `.svelte-kit/tsconfig.json`) must still be found via the `extends` chain.
    #[test]
    fn overlay_tsconfig_target_search_follows_extends_chain() {
        let tmp =
            std::env::temp_dir().join(format!("svc_overlay_target_chain_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(tmp.join("src")).unwrap();
        fs::create_dir_all(tmp.join(".svelte-kit")).unwrap();
        fs::write(
            tmp.join(".svelte-kit/tsconfig.json"),
            r#"{ "compilerOptions": { "target": "ES2020" } }"#,
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

        let cfg: serde_json::Value =
            serde_json::from_str(&fs::read_to_string(&layout.overlay_tsconfig).unwrap()).unwrap();
        assert!(
            cfg["compilerOptions"]["target"].is_null(),
            "inherited ES2020 target found via extends chain should not be overridden: {cfg}"
        );

        let _ = fs::remove_dir_all(&tmp);
    }

    #[test]
    fn is_es2015_or_newer_parses_year_targets_generically() {
        assert_eq!(is_es2015_or_newer("es3"), Some(false));
        assert_eq!(is_es2015_or_newer("es5"), Some(false));
        assert_eq!(is_es2015_or_newer("ES6"), Some(true));
        assert_eq!(is_es2015_or_newer("es2015"), Some(true));
        assert_eq!(is_es2015_or_newer("ES2024"), Some(true));
        // Not a hardcoded alias — must resolve through the generic `esNNNN` parse.
        assert_eq!(is_es2015_or_newer("es2025"), Some(true));
        assert_eq!(is_es2015_or_newer("esnext"), Some(true));
        assert_eq!(is_es2015_or_newer("latest"), Some(true));
        assert_eq!(is_es2015_or_newer("nonsense"), None);
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
    fn overlay_forwards_project_specs_through_an_array_extends() {
        // The array form is the only way to combine a shared base config with a
        // *generated* one that can't be edited by hand (`.svelte-kit/tsconfig.json`,
        // `.wxt/tsconfig.json`), so a reader that only understands the string form
        // drops the generated `include`/`paths` and every ambient module they pull
        // in ($env/dynamic/public, ./$types) is reported missing.
        let tmp = std::env::temp_dir().join(format!("svc_overlay_arr_ext_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(tmp.join("src/lib")).unwrap();
        fs::create_dir_all(tmp.join(".svelte-kit")).unwrap();
        fs::write(
            tmp.join("tsconfig.base.json"),
            r#"{
                "compilerOptions": {
                    "target": "ES2022",
                    "paths": { "$base/*": ["./base/*"] }
                }
            }"#,
        )
        .unwrap();
        fs::write(
            tmp.join(".svelte-kit/tsconfig.json"),
            r#"{
                "compilerOptions": {
                    "rootDirs": ["..", "./types"],
                    "paths": { "$lib/*": ["../src/lib/*"] }
                },
                "include": ["../src/**/*.ts", "../src/**/*.svelte", "./ambient.d.ts"]
            }"#,
        )
        .unwrap();
        fs::write(
            tmp.join("tsconfig.json"),
            r#"{ "extends": ["./tsconfig.base.json", "./.svelte-kit/tsconfig.json"] }"#,
        )
        .unwrap();
        fs::write(
            tmp.join("src/lib/Button.svelte"),
            "<script lang=\"ts\">let { n }: { n: number } = $props();</script>\n<button>{n}</button>\n",
        )
        .unwrap();

        let files = vec![tmp.join("src/lib/Button.svelte")];
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
        assert!(
            include.iter().any(|i| i == "../src/**/*.ts"),
            "include from an array-`extends` parent not forwarded: {include:?}"
        );
        assert!(
            include.iter().any(|i| i == "../.svelte-kit/ambient.d.ts"),
            "exact ambient include not forwarded: {include:?}"
        );

        // The last array entry wins, as TypeScript documents: `$lib/*` from the
        // generated config, not `$base/*` from the base it is listed after.
        let paths = &cfg["compilerOptions"]["paths"];
        assert!(
            paths["$lib/*"].is_array(),
            "later array-`extends` entry's paths must win:\n{paths}"
        );
        assert!(
            paths["$base/*"].is_null(),
            "earlier entry's paths must not leak in wholesale:\n{paths}"
        );
        assert!(
            paths["$lib/Button.svelte"][0].as_str().is_some(),
            "aliased .svelte shadow override missing:\n{paths}"
        );

        // rootDirs likewise comes from the generated config …
        let root_dirs: Vec<String> = cfg["compilerOptions"]["rootDirs"]
            .as_array()
            .expect("rootDirs forwarded")
            .iter()
            .map(|v| v.as_str().unwrap().to_string())
            .collect();
        assert!(
            root_dirs.iter().any(|d| d.ends_with(".svelte-kit/types")),
            "rootDirs from an array-`extends` parent not forwarded: {root_dirs:?}"
        );
        // … while the *earlier* entry is still reachable for anything the later
        // one leaves undefined: its ES2022 target is ES2015+, so nothing is forced.
        assert!(
            cfg["compilerOptions"]["target"].is_null(),
            "target from the first array entry not seen, so it was force-set: {}",
            cfg["compilerOptions"]["target"]
        );

        let _ = fs::remove_dir_all(&tmp);
    }

    #[test]
    fn extends_chain_visits_array_entries_last_to_first_depth_first() {
        let tmp = std::env::temp_dir().join(format!("svc_ext_chain_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(&tmp).unwrap();
        fs::write(tmp.join("grandparent.json"), "{}").unwrap();
        fs::write(tmp.join("a.json"), r#"{ "extends": "./grandparent.json" }"#).unwrap();
        fs::write(tmp.join("b.json"), "{}").unwrap();
        fs::write(
            tmp.join("tsconfig.json"),
            r#"{ "extends": ["./a.json", "./b.json", "pkg/tsconfig"] }"#,
        )
        .unwrap();

        let visited: Vec<String> = extends_chain(&tmp.join("tsconfig.json"))
            .into_iter()
            .map(|(dir, _)| dir.to_string_lossy().into_owned())
            .collect();
        // Every entry resolves to the same dir here, so assert on the count:
        // self + b + a + a's parent, with the bare package name skipped.
        assert_eq!(
            visited.len(),
            4,
            "expected self + 2 array entries + 1 grandparent, got {visited:?}"
        );

        // Order is observable through a key only the deepest config defines.
        fs::write(
            tmp.join("grandparent.json"),
            r#"{ "include": ["./from-grandparent/**/*"] }"#,
        )
        .unwrap();
        fs::write(tmp.join("b.json"), r#"{ "include": ["./from-b/**/*"] }"#).unwrap();
        let (specs, _) = resolve_config_specs(&tmp.join("tsconfig.json"), "include").unwrap();
        assert_eq!(
            specs,
            vec!["./from-b/**/*".to_string()],
            "the last array entry must be searched before the first"
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
    fn esm_bridge_path_replaces_the_svelte_suffix() {
        let bridge = |p: &str| {
            esm_bridge_path(Path::new(p))
                .map(|b| b.to_string_lossy().replace('\\', "/"))
                .unwrap_or_default()
        };
        assert_eq!(bridge("/w/src/Foo.svelte.tsx"), "/w/src/Foo.d.svelte.ts");
        assert_eq!(bridge("/w/src/store.svelte.ts"), "/w/src/store.d.svelte.ts");
        assert_eq!(bridge("/w/src/store.svelte.js"), "/w/src/store.d.svelte.ts");
        // Nothing to bridge for a file whose name has no `.svelte.` segment.
        assert_eq!(esm_bridge_path(Path::new("/w/src/plain.ts")), None);
    }

    /// Regression test for #1916: ESM-mode module resolution probes only
    /// `./Foo.d.svelte.ts` for `./Foo.svelte`, so the overlay has to emit it.
    #[test]
    fn overlay_emits_an_esm_bridge_per_component_shadow() {
        let tmp = std::env::temp_dir().join(format!("svc_overlay_bridge_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(tmp.join("src")).unwrap();
        let svelte_path = tmp.join("src/Foo.svelte");
        fs::File::create(&svelte_path)
            .unwrap()
            .write_all(b"<div>hi</div>")
            .unwrap();

        let layout = materialize_overlay(&tmp, &[svelte_path], None).unwrap();
        let bridge = layout.emit_dir.join("src/Foo.d.svelte.ts");
        let content = fs::read_to_string(&bridge).unwrap_or_default();
        assert_eq!(
            content,
            fs::read_to_string(&layout.entries[0].dts_path).unwrap(),
            "the bridge forwards exactly what the `.svelte.d.ts` twin does"
        );

        let _ = fs::remove_dir_all(&tmp);
    }

    /// Second half of #1916: a `.svelte.ts` rune module with no sibling
    /// component is reached through the same `./x.svelte` specifier shape, and
    /// only `export *` forwards its names — a default needs its own clause.
    #[test]
    fn overlay_bridges_svelte_suffixed_rune_modules() {
        let tmp = std::env::temp_dir().join(format!("svc_overlay_rune_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(tmp.join("src/modules")).unwrap();
        fs::File::create(tmp.join("src/modules/provider.svelte.ts"))
            .unwrap()
            .write_all(b"export function useProvider() {}\n")
            .unwrap();
        fs::File::create(tmp.join("src/modules/theme.svelte.ts"))
            .unwrap()
            .write_all(b"export const tokens = [];\nexport default {};\n")
            .unwrap();
        // A companion of a real component is covered by that component's own
        // shadow, so it must not get a competing bridge of its own.
        fs::File::create(tmp.join("src/modules/Pair.svelte"))
            .unwrap()
            .write_all(b"<div></div>")
            .unwrap();
        fs::File::create(tmp.join("src/modules/Pair.svelte.ts"))
            .unwrap()
            .write_all(b"export const pair = 1;\n")
            .unwrap();

        let layout =
            materialize_overlay(&tmp, &[tmp.join("src/modules/Pair.svelte")], None).unwrap();
        let read = |name: &str| fs::read_to_string(layout.emit_dir.join("src/modules").join(name));

        let provider = read("provider.d.svelte.ts").unwrap();
        assert!(
            provider.contains("export * from \"../../../../src/modules/provider.svelte.js\";"),
            "{provider}"
        );
        assert!(
            !provider.contains("default"),
            "no default to forward: {provider}"
        );
        let theme = read("theme.d.svelte.ts").unwrap();
        assert!(
            theme.contains("export { default } from \"../../../../src/modules/theme.svelte.js\";"),
            "{theme}"
        );
        // Pair's bridge is the component's, pointing at the shadow.
        let pair = read("Pair.d.svelte.ts").unwrap();
        assert!(pair.contains("./Pair.svelte.tsx"), "{pair}");

        let _ = fs::remove_dir_all(&tmp);
    }

    /// A rune module's bridge has no manifest entry to prune it by, so the
    /// sweep in `emit_svelte_module_bridges` is what keeps a deleted module from
    /// leaving a permanently resolvable `./x.svelte`.
    #[test]
    fn orphaned_rune_module_bridge_is_swept_on_the_next_run() {
        let tmp = std::env::temp_dir().join(format!("svc_overlay_sweep_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(tmp.join("src")).unwrap();
        let component = tmp.join("src/Keep.svelte");
        fs::write(&component, "<div></div>").unwrap();
        let module = tmp.join("src/gone.svelte.ts");
        fs::write(&module, "export const x = 1;\n").unwrap();

        let files = [component];
        let layout = materialize_overlay(&tmp, &files, None).unwrap();
        let orphan = layout.emit_dir.join("src/gone.d.svelte.ts");
        let component_bridge = layout.emit_dir.join("src/Keep.d.svelte.ts");
        assert!(orphan.is_file());
        assert!(component_bridge.is_file());

        fs::remove_file(&module).unwrap();
        materialize_overlay(&tmp, &files, None).unwrap();
        assert!(!orphan.exists(), "orphaned rune bridge should be swept");
        assert!(
            component_bridge.is_file(),
            "a component's own bridge must survive the sweep"
        );

        let _ = fs::remove_dir_all(&tmp);
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
        materialize_overlay_with(&tmp, &files, Some(&tsconfig), false, &[]).unwrap();

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

    /// Regression test for #782's uncovered case: a sibling package reached
    /// through a `paths` alias with NO `node_modules` entry at all (a plain
    /// SvelteKit `kit.alias` / bundler `resolve.alias`, not a package
    /// `exports` barrel resolved via a symlink). Named `<script module>`
    /// exports must resolve through the alias just like the in-workspace case
    /// above, not fall back to the ambient default-only `*.svelte` wildcard.
    #[test]
    fn cross_package_paths_alias_named_export_resolves_to_its_shadow() {
        let tmp = std::env::temp_dir().join(format!("svc_xpkg_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(tmp.join("pkg-a/src")).unwrap();
        fs::create_dir_all(tmp.join("pkg-libs/components")).unwrap();
        // No `node_modules` anywhere — `libs` is not even a declared
        // dependency of `pkg-a`; resolution goes entirely through `paths`.
        fs::write(
            tmp.join("pkg-a/tsconfig.json"),
            "{\"compilerOptions\":{\"paths\":{\"$libs/*\":[\"../pkg-libs/*\"]}}}",
        )
        .unwrap();
        fs::write(
            tmp.join("pkg-libs/components/survey-options.svelte"),
            "<script module lang=\"ts\">export type WithOther<T extends string> = T | `OTHER: ${string}`;</script>\n<script lang=\"ts\">let { id }: { id: string } = $props();</script>\n<div>{id}</div>\n",
        )
        .unwrap();
        fs::write(
            tmp.join("pkg-a/src/consumer.svelte"),
            "<script lang=\"ts\">\nimport SurveyOptions, { type WithOther } from '$libs/components/survey-options.svelte';\ntype X = WithOther<'a' | 'b'>;\n</script>\n<SurveyOptions id=\"a\" />\n",
        )
        .unwrap();

        let workspace = tmp.join("pkg-a");
        let files = vec![workspace.join("src/consumer.svelte")];
        let tsconfig = workspace.join("tsconfig.json");
        materialize_overlay_with(&workspace, &files, Some(&tsconfig), false, &[]).unwrap();

        let consumer_tsx =
            fs::read_to_string(workspace.join(".svelte-check/svelte/src/consumer.svelte.tsx"))
                .unwrap();
        assert!(
            !consumer_tsx.contains("$libs/components/survey-options.svelte"),
            "cross-package alias was not rewritten:\n{consumer_tsx}"
        );
        assert!(
            consumer_tsx.contains("survey-options.svelte.tsx"),
            "rewrite did not point at the external mirror's shadow:\n{consumer_tsx}"
        );

        let _ = fs::remove_dir_all(&tmp);
    }

    /// A `paths` alias that names a directory CONTAINING the workspace
    /// (`"@/*": ["../../*"]`, an ordinary monorepo shape) must not be mirrored
    /// as an external package — the workspace's own files are already covered,
    /// and the mirror walk would cover the whole repository. A `baseUrl`-based
    /// alias in the same config must still resolve through `baseUrl`.
    #[test]
    fn paths_alias_naming_an_ancestor_of_the_workspace_is_not_mirrored() {
        let tmp = std::env::temp_dir().join(format!("svc_alias_ancestor_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(tmp.join("apps/web/src")).unwrap();
        fs::create_dir_all(tmp.join("libs")).unwrap();
        fs::write(
            tmp.join("apps/web/tsconfig.json"),
            "{\"compilerOptions\":{\"baseUrl\":\"../..\",\"paths\":{\"@/*\":[\"./*\"],\"$libs/*\":[\"libs/*\"]}}}",
        )
        .unwrap();
        fs::write(
            tmp.join("libs/Shared.svelte"),
            "<script lang=\"ts\">let { n }: { n: number } = $props();</script>\n<i>{n}</i>\n",
        )
        .unwrap();
        fs::write(
            tmp.join("apps/web/src/App.svelte"),
            "<script lang=\"ts\">import Shared from '$libs/Shared.svelte';</script>\n<Shared n={1} />\n",
        )
        .unwrap();

        let workspace = tmp.join("apps/web");
        let files = vec![workspace.join("src/App.svelte")];
        let tsconfig = workspace.join("tsconfig.json");
        materialize_overlay_with(&workspace, &files, Some(&tsconfig), false, &[]).unwrap();

        let ext_root = workspace.join(".svelte-check/ext");
        let mirrored: Vec<String> = fs::read_dir(&ext_root)
            .into_iter()
            .flatten()
            .flatten()
            .map(|e| e.file_name().to_string_lossy().into_owned())
            .collect();
        assert_eq!(
            mirrored.len(),
            1,
            "only the `$libs` sibling should be mirrored, got {mirrored:?}"
        );
        assert!(
            ext_root.join("0/Shared.svelte.tsx").is_file(),
            "the `$libs` sibling (resolved through baseUrl) should have a shadow"
        );

        let _ = fs::remove_dir_all(&tmp);
    }

    /// Regression test: a relative `--tsconfig` path (`./tsconfig.json`, the
    /// CLI's own documented usage) must not silently disable alias rewriting
    /// for a `paths` target that climbs outside the CWD via `..` — exactly
    /// what every cross-package alias does. `oxc_resolver`'s tsconfig
    /// discovery returns `NotFound` for such a target when `config_file` is
    /// relative; `build_svelte_import_resolver` has to absolutise it first.
    #[test]
    fn relative_tsconfig_path_still_resolves_paths_aliases_that_escape_cwd() {
        let tmp =
            std::env::temp_dir().join(format!("svc_relcfg_paths_alias_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(tmp.join("pkg-a/src")).unwrap();
        fs::create_dir_all(tmp.join("pkg-libs/lib")).unwrap();
        fs::write(
            tmp.join("pkg-a/tsconfig.json"),
            "{\"compilerOptions\":{\"paths\":{\"$lib/*\":[\"../pkg-libs/lib/*\"]}}}",
        )
        .unwrap();
        fs::write(
            tmp.join("pkg-libs/lib/Button.svelte"),
            "<script lang=\"ts\">let { n }: { n: number } = $props();</script>\n<button>{n}</button>\n",
        )
        .unwrap();
        fs::write(
            tmp.join("pkg-a/src/App.svelte"),
            "<script lang=\"ts\">import Button from '$lib/Button.svelte';</script>\n<Button n={1} />\n",
        )
        .unwrap();

        let workspace = tmp.join("pkg-a");
        let _cwd_guard = CWD_LOCK.lock().unwrap_or_else(|e| e.into_inner());
        let cwd = std::env::current_dir().unwrap();
        std::env::set_current_dir(&workspace).unwrap();
        let result = {
            let files = vec![PathBuf::from("src/App.svelte")];
            materialize_overlay_with(
                Path::new("."),
                &files,
                Some(Path::new("./tsconfig.json")),
                false,
                &[],
            )
        };
        std::env::set_current_dir(&cwd).unwrap();
        result.unwrap();

        let app_tsx =
            fs::read_to_string(workspace.join(".svelte-check/svelte/src/App.svelte.tsx")).unwrap();
        assert!(
            !app_tsx.contains("$lib/Button.svelte"),
            "alias was not rewritten with a relative --tsconfig path:\n{app_tsx}"
        );
        assert!(
            app_tsx.contains("Button.svelte.tsx"),
            "rewrite did not point at the shadow:\n{app_tsx}"
        );

        let _ = fs::remove_dir_all(&tmp);
    }

    /// `select_global_types` canonicalises its root, so expectations have to
    /// go through the same normalisation (`/var` -> `/private/var` on macOS).
    fn expected_svelte_html(root: &Path) -> Option<PathBuf> {
        Some(
            fs::canonicalize(root)
                .unwrap()
                .join("node_modules/svelte/svelte-html.d.ts"),
        )
    }

    /// Lay out `<root>/node_modules/svelte` with the given version, and
    /// `svelte-html.d.ts` when asked for.
    fn fake_svelte_package(root: &Path, version: &str, with_svelte_html: bool) {
        let pkg = root.join("node_modules/svelte");
        fs::create_dir_all(&pkg).unwrap();
        fs::write(
            pkg.join("package.json"),
            format!("{{ \"name\": \"svelte\", \"version\": \"{version}\" }}"),
        )
        .unwrap();
        if with_svelte_html {
            fs::write(pkg.join("svelte-html.d.ts"), "declare global {}\n").unwrap();
        }
    }

    #[test]
    fn relative_tsconfig_path_still_bridges_a_node_modules_sibling_package() {
        // With a relative `--tsconfig`, oxc_resolver's tsconfig discovery
        // silently returns `NotFound` for any `paths` target that resolves
        // outside the CWD via `..` — exactly what a workspace-sibling
        // package reached through a `node_modules` symlink needs when it ALSO
        // imports itself through a `paths` alias (#1887's self-referential
        // case). This is the CLI's own documented usage
        // (`--tsconfig ./tsconfig.json`).
        #[cfg(unix)]
        {
            let tmp =
                std::env::temp_dir().join(format!("svc_relcfg_nm_sibling_{}", std::process::id()));
            let _ = fs::remove_dir_all(&tmp);
            fs::create_dir_all(tmp.join("pkg-a/src")).unwrap();
            fs::create_dir_all(tmp.join("pkg-a/node_modules")).unwrap();
            fs::create_dir_all(tmp.join("pkg-libs/lib")).unwrap();
            fs::write(
                tmp.join("pkg-a/tsconfig.json"),
                "{\"compilerOptions\":{\"paths\":{\"$lib/*\":[\"../pkg-libs/lib/*\"]}}}",
            )
            .unwrap();
            fs::write(
                tmp.join("pkg-libs/lib/Input.svelte"),
                "<script lang=\"ts\">let { n }: { n: number } = $props();</script>\n<input value={n} />\n",
            )
            .unwrap();
            fs::write(
                tmp.join("pkg-libs/lib/Field.svelte"),
                "<script lang=\"ts\">import Input from '$lib/Input.svelte';</script>\n<Input n={1} />\n",
            )
            .unwrap();
            fs::write(
                tmp.join("pkg-a/src/App.svelte"),
                "<script lang=\"ts\">import Field from 'libs/Field.svelte';</script>\n<Field />\n",
            )
            .unwrap();
            std::os::unix::fs::symlink(
                tmp.join("pkg-libs/lib"),
                tmp.join("pkg-a/node_modules/libs"),
            )
            .unwrap();

            let workspace = tmp.join("pkg-a");
            let _cwd_guard = CWD_LOCK.lock().unwrap_or_else(|e| e.into_inner());
            let cwd = std::env::current_dir().unwrap();
            std::env::set_current_dir(&workspace).unwrap();
            let result = {
                let files = vec![PathBuf::from("src/App.svelte")];
                materialize_overlay_with(
                    Path::new("."),
                    &files,
                    Some(Path::new("./tsconfig.json")),
                    false,
                    &[],
                )
            };
            std::env::set_current_dir(&cwd).unwrap();
            result.unwrap();

            let field_tsx =
                fs::read_to_string(workspace.join(".svelte-check/ext/0/Field.svelte.tsx"))
                    .expect("external Field.svelte shadow should have been emitted");
            assert!(
                !field_tsx.contains("$lib/Input.svelte"),
                "self-referential alias was not rewritten with a relative --tsconfig path:\n{field_tsx}"
            );

            let _ = fs::remove_dir_all(&tmp);
        }
    }

    #[test]
    fn overlay_tsconfig_adds_exact_paths_override_for_a_plain_ts_file() {
        // #1888: a PLAIN `.ts` file (not a `.svelte` source svelte2tsx ever
        // touches) importing a component via a `paths` alias never gets its
        // specifier rewritten — only the overlay tsconfig's `paths` can help
        // it, so the fix has to live there.
        let tmp = std::env::temp_dir().join(format!("svc_alias_paths_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(tmp.join("src/lib")).unwrap();
        fs::write(
            tmp.join("tsconfig.json"),
            "{\"compilerOptions\":{\"paths\":{\"$lib/*\":[\"./src/lib/*\"],\"$other\":[\"./src/other.ts\"]}}}",
        )
        .unwrap();
        fs::write(
            tmp.join("src/lib/Button.svelte"),
            "<script lang=\"ts\">let { n }: { n: number } = $props();</script>\n<button>{n}</button>\n",
        )
        .unwrap();

        let files = vec![tmp.join("src/lib/Button.svelte")];
        let tsconfig = tmp.join("tsconfig.json");
        let layout = materialize_overlay_with(&tmp, &files, Some(&tsconfig), false, &[]).unwrap();

        let cfg: serde_json::Value =
            serde_json::from_str(&fs::read_to_string(&layout.overlay_tsconfig).unwrap()).unwrap();
        let paths = &cfg["compilerOptions"]["paths"];

        // The original wildcard + unrelated exact entries survive the merge.
        assert!(
            paths["$lib/*"].is_array(),
            "original wildcard alias dropped:\n{paths}"
        );
        assert!(
            paths["$other"].is_array(),
            "unrelated original exact alias dropped:\n{paths}"
        );

        // A new EXACT entry redirects the component's own alias specifier
        // straight at its shadow `.tsx` (no longer ending in `.svelte`, so the
        // ambient `*.svelte` wildcard never gets consulted for it).
        let target = paths["$lib/Button.svelte"][0]
            .as_str()
            .unwrap_or_else(|| panic!("no exact override for $lib/Button.svelte:\n{paths}"));
        assert!(
            target.ends_with("Button.svelte.tsx"),
            "override does not point at the shadow: {target}"
        );

        let _ = fs::remove_dir_all(&tmp);
    }

    #[test]
    fn overlay_tsconfig_adds_exact_paths_override_for_an_aliased_rune_module() {
        // #1942: #1941's `.d.svelte.ts` bridge is reachable only through
        // `rootDirs`, which TypeScript applies to relative specifiers alone, so
        // `$lib/state.svelte` needs an exact `paths` entry of its own.
        let tmp = std::env::temp_dir().join(format!("svc_alias_rune_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(tmp.join("src/lib")).unwrap();
        fs::write(
            tmp.join("tsconfig.json"),
            "{\"compilerOptions\":{\"paths\":{\"$lib/*\":[\"./src/lib/*\"]}}}",
        )
        .unwrap();
        fs::write(
            tmp.join("src/lib/state.svelte.ts"),
            "export const shared = 1;\nexport default {};\n",
        )
        .unwrap();
        // A rune module OUTSIDE every alias target contributes no entry.
        fs::write(tmp.join("src/loose.svelte.ts"), "export const loose = 1;\n").unwrap();
        // A component shadows its own companion, so the specifier must keep
        // resolving to the component — the companion has no bridge to claim it.
        fs::write(tmp.join("src/lib/Pair.svelte"), "<div></div>").unwrap();
        fs::write(
            tmp.join("src/lib/Pair.svelte.ts"),
            "export const pair = 1;\n",
        )
        .unwrap();

        let files = vec![tmp.join("src/lib/Pair.svelte")];
        let tsconfig = tmp.join("tsconfig.json");
        let layout = materialize_overlay_with(&tmp, &files, Some(&tsconfig), false, &[]).unwrap();

        let cfg: serde_json::Value =
            serde_json::from_str(&fs::read_to_string(&layout.overlay_tsconfig).unwrap()).unwrap();
        let paths = &cfg["compilerOptions"]["paths"];

        let target = paths["$lib/state.svelte"][0]
            .as_str()
            .unwrap_or_else(|| panic!("no exact override for $lib/state.svelte:\n{paths}"));
        assert!(
            target.ends_with("state.d.svelte.ts"),
            "override does not point at the ESM bridge: {target}"
        );
        assert!(
            Path::new(target).is_file(),
            "override points at a file that was never emitted: {target}"
        );

        let pair = paths["$lib/Pair.svelte"][0]
            .as_str()
            .unwrap_or_else(|| panic!("no exact override for $lib/Pair.svelte:\n{paths}"));
        assert!(
            pair.ends_with("Pair.svelte.tsx"),
            "the companion outranked its own component: {pair}"
        );

        assert!(
            paths.get("$lib/loose.svelte").is_none(),
            "a module outside the alias target got an entry:\n{paths}"
        );

        let _ = fs::remove_dir_all(&tmp);
    }

    #[test]
    fn overlay_tsconfig_paths_respect_base_url() {
        // `paths` targets are resolved against `baseUrl` when one is set (and
        // `baseUrl` may itself come from further up the `extends` chain). The
        // overlay tsconfig restates `paths` wholesale — resolving the targets
        // against the config's own directory instead would break every alias
        // in such a project, which previously resolved fine by inheritance.
        let tmp = std::env::temp_dir().join(format!("svc_alias_baseurl_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(tmp.join("src/lib")).unwrap();
        fs::write(
            tmp.join("tsconfig.base.json"),
            "{\"compilerOptions\":{\"baseUrl\":\"./src\"}}",
        )
        .unwrap();
        fs::write(
            tmp.join("tsconfig.json"),
            "{\"extends\":\"./tsconfig.base.json\",\"compilerOptions\":{\"paths\":{\"@/*\":[\"lib/*\"]}}}",
        )
        .unwrap();
        fs::write(
            tmp.join("src/lib/Button.svelte"),
            "<script lang=\"ts\">let { n }: { n: number } = $props();</script>\n<button>{n}</button>\n",
        )
        .unwrap();

        let files = vec![tmp.join("src/lib/Button.svelte")];
        let tsconfig = tmp.join("tsconfig.json");
        let layout = materialize_overlay_with(&tmp, &files, Some(&tsconfig), false, &[]).unwrap();
        let cfg: serde_json::Value =
            serde_json::from_str(&fs::read_to_string(&layout.overlay_tsconfig).unwrap()).unwrap();
        let paths = &cfg["compilerOptions"]["paths"];

        let wildcard = paths["@/*"][0].as_str().expect("wildcard alias kept");
        assert!(
            Path::new(wildcard).starts_with(tmp.join("src/lib")),
            "wildcard target must resolve through baseUrl, got: {wildcard}"
        );
        let exact = paths["@/Button.svelte"][0]
            .as_str()
            .unwrap_or_else(|| panic!("no exact override for @/Button.svelte:\n{paths}"));
        assert!(
            exact.ends_with("Button.svelte.tsx"),
            "override does not point at the shadow: {exact}"
        );

        let _ = fs::remove_dir_all(&tmp);
    }

    #[test]
    fn overlay_tsconfig_paths_override_survives_a_relative_multi_hop_extends_chain() {
        // A real SvelteKit project's `tsconfig.json` extends a *generated*
        // `.svelte-kit/tsconfig.json` that actually owns `paths` — a two-hop
        // chain. Combined with the CLI's own documented relative
        // `--tsconfig ./tsconfig.json` usage, `file.parent()` at each
        // `extends` hop stayed relative and compounded into a garbled,
        // unresolvable exact-override target (`././.svelte-kit/../src/lib/...`)
        // instead of an absolute path — invisible on a single-hop config,
        // where the bug doesn't get a chance to compound.
        let tmp =
            std::env::temp_dir().join(format!("svc_alias_paths_chain_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(tmp.join("src/lib")).unwrap();
        fs::create_dir_all(tmp.join(".svelte-kit")).unwrap();
        fs::write(
            tmp.join(".svelte-kit/tsconfig.json"),
            "{\"compilerOptions\":{\"paths\":{\"$lib/*\":[\"../src/lib/*\"]}}}",
        )
        .unwrap();
        fs::write(
            tmp.join("tsconfig.json"),
            "{\"extends\":\"./.svelte-kit/tsconfig.json\"}",
        )
        .unwrap();
        fs::write(
            tmp.join("src/lib/Button.svelte"),
            "<script lang=\"ts\">let { n }: { n: number } = $props();</script>\n<button>{n}</button>\n",
        )
        .unwrap();

        let _cwd_guard = CWD_LOCK.lock().unwrap_or_else(|e| e.into_inner());
        let cwd = std::env::current_dir().unwrap();
        std::env::set_current_dir(&tmp).unwrap();
        let result = {
            let files = vec![PathBuf::from("src/lib/Button.svelte")];
            materialize_overlay_with(
                Path::new("."),
                &files,
                Some(Path::new("./tsconfig.json")),
                false,
                &[],
            )
        };
        std::env::set_current_dir(&cwd).unwrap();
        result.unwrap();

        let cfg: serde_json::Value = serde_json::from_str(
            &fs::read_to_string(tmp.join(".svelte-check/tsconfig.json")).unwrap(),
        )
        .unwrap();
        let paths = &cfg["compilerOptions"]["paths"];
        let target = paths["$lib/Button.svelte"][0]
            .as_str()
            .unwrap_or_else(|| panic!("no exact override for $lib/Button.svelte:\n{paths}"));
        assert!(
            Path::new(target).is_absolute() && Path::new(target).exists(),
            "override target must be a valid absolute path reachable through the \
             multi-hop extends chain, got: {target}"
        );

        let _ = fs::remove_dir_all(&tmp);
    }

    #[test]
    fn svelte_jsx_shim_types_svelte_boundary_onerror() {
        // #1889: the embedded `svelte-jsx-v4.d.ts`'s `IntrinsicElements` had
        // no `'svelte:boundary'` entry, so `svelteHTML.createElement(
        // "svelte:boundary", { onerror: e => ... })` fell through to the
        // interface's `[name: string]: { [name: string]: any }` catch-all —
        // every prop (including `onerror`) contextually typed as bare `any`,
        // which doesn't propagate a parameter type to an inline arrow
        // function the way an actual function-typed prop would, so `e`
        // surfaced as a false `implicit any`.
        assert!(
            SHIM_SVELTE_JSX_V4.contains("'svelte:boundary'"),
            "svelte-jsx-v4.d.ts must declare an IntrinsicElements entry for \
             'svelte:boundary' (onerror/failed/pending), not fall through to \
             the catch-all index signature"
        );
    }

    #[test]
    fn tsconfig_absolute_path_strips_the_windows_verbatim_prefix() {
        // A string-level test so it runs on the CI runners we actually have:
        // `Path::components` only recognises a Windows prefix on Windows.
        assert_eq!(
            tsconfig_absolute_path(Path::new(
                r"\\?\C:\proj\node_modules\svelte\svelte-html.d.ts"
            )),
            "C:/proj/node_modules/svelte/svelte-html.d.ts",
            "tsc/tsgo cannot resolve the `//?/` form `fs::canonicalize` produces"
        );
        assert_eq!(
            tsconfig_absolute_path(Path::new(r"\\?\UNC\server\share\proj\svelte-html.d.ts")),
            "//server/share/proj/svelte-html.d.ts"
        );
        assert_eq!(
            tsconfig_absolute_path(Path::new(r"C:\proj\svelte-html.d.ts")),
            "C:/proj/svelte-html.d.ts"
        );
        assert_eq!(
            tsconfig_absolute_path(Path::new("/proj/node_modules/svelte/svelte-html.d.ts")),
            "/proj/node_modules/svelte/svelte-html.d.ts"
        );
    }

    #[test]
    fn global_types_prefer_project_svelte_html_over_the_vendored_jsx_shim() {
        // #1889: the vendored shim's hand-enumerated `IntrinsicElements`
        // freezes at its snapshot date, so every tag `svelte/elements` gained
        // since (`svelte:boundary`, `search`, …) falls through to the
        // catch-all index signature and its props become bare `any`.
        let tmp = std::env::temp_dir().join(format!("svc_gt_html_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fake_svelte_package(&tmp, "5.56.8", true);

        let selected = select_global_types(&tmp, &tmp.join(".svelte-check"));
        assert_eq!(selected.shims, vec![SHIM_SHIMS_V4_NAME]);
        assert_eq!(selected.svelte_html, expected_svelte_html(&tmp));

        let _ = fs::remove_dir_all(&tmp);
    }

    #[test]
    fn global_types_fall_back_to_the_vendored_jsx_shim_without_svelte_html() {
        let tmp = std::env::temp_dir().join(format!("svc_gt_nohtml_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fake_svelte_package(&tmp, "5.56.8", false);

        let selected = select_global_types(&tmp, &tmp.join(".svelte-check"));
        assert_eq!(
            selected.shims,
            vec![SHIM_SHIMS_V4_NAME, SHIM_JSX_V4_NAME],
            "without a project `svelte-html.d.ts` the vendored JSX shim is the \
             only source of `svelteHTML.IntrinsicElements`"
        );
        assert_eq!(selected.svelte_html, None);

        let _ = fs::remove_dir_all(&tmp);
    }

    #[test]
    fn global_types_ignore_svelte_html_on_svelte_3() {
        let tmp = std::env::temp_dir().join(format!("svc_gt_v3_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        // Upstream skips the lookup entirely for Svelte 3, so even a stray
        // `svelte-html.d.ts` must not displace the JSX shim.
        fake_svelte_package(&tmp, "3.59.2", true);

        let selected = select_global_types(&tmp, &tmp.join(".svelte-check"));
        assert_eq!(selected.shims, vec![SHIM_SHIMS_V4_NAME, SHIM_JSX_V4_NAME]);
        assert_eq!(selected.svelte_html, None);

        let _ = fs::remove_dir_all(&tmp);
    }

    #[test]
    fn global_types_fall_back_when_svelte_is_not_installed() {
        let tmp = std::env::temp_dir().join(format!("svc_gt_nosvelte_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(tmp.join("src")).unwrap();

        let selected = select_global_types(&tmp.join("src"), &tmp.join(".svelte-check"));
        assert_eq!(selected.shims, vec![SHIM_SHIMS_V4_NAME, SHIM_JSX_V4_NAME]);
        assert_eq!(selected.svelte_html, None);

        let _ = fs::remove_dir_all(&tmp);
    }

    #[test]
    fn global_types_resolve_svelte_from_a_parent_node_modules() {
        let tmp = std::env::temp_dir().join(format!("svc_gt_hoisted_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fake_svelte_package(&tmp, "5.56.8", true);
        let nested = tmp.join("packages/app");
        fs::create_dir_all(&nested).unwrap();

        let selected = select_global_types(&nested, &nested.join(".svelte-check"));
        assert_eq!(
            selected.svelte_html,
            expected_svelte_html(&tmp),
            "a hoisted monorepo install must still be found by walking up"
        );

        let _ = fs::remove_dir_all(&tmp);
    }
    /// Writes a `svelte` package whose bundled declarations carry the ambient
    /// `*.svelte` wildcard, like the real one.
    fn fake_svelte_types(root: &Path) {
        let types = root.join("node_modules/svelte/types");
        fs::create_dir_all(&types).unwrap();
        fs::write(
            root.join("node_modules/svelte/package.json"),
            "{ \"name\": \"svelte\", \"version\": \"5.56.8\" }",
        )
        .unwrap();
        fs::write(
            types.join("index.d.ts"),
            "declare module 'svelte' {\n\texport type Snippet = unknown;\n}\n\
             declare module 'svelte/store' {\n\texport type Readable = unknown;\n}\n\
             declare module '*.svelte' {\n\tconst Comp: unknown;\n\texport default Comp;\n}\n",
        )
        .unwrap();
    }

    #[test]
    fn svelte_ambient_wildcard_is_blanked_and_redirected() {
        // #2061: with `declare module '*.svelte'` in the program, every
        // unresolvable `.svelte` specifier silently types as a default-only
        // component instead of erroring the way official svelte-check does.
        let tmp = std::env::temp_dir().join(format!("svc_wildcard_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(tmp.join("src")).unwrap();
        fake_svelte_types(&tmp);
        fs::write(tmp.join("src/App.svelte"), "<p>hi</p>\n").unwrap();

        let files = vec![tmp.join("src/App.svelte")];
        let layout = materialize_overlay(&tmp, &files, None).unwrap();

        let shadow = fs::read_to_string(tmp.join(".svelte-check/svelte-types.d.ts")).unwrap();
        assert!(
            !shadow.contains("declare module '*.svelte'"),
            "the ambient wildcard survived:\n{shadow}"
        );
        assert!(
            shadow.contains("declare module 'svelte/store'"),
            "an unrelated ambient module was lost:\n{shadow}"
        );

        let cfg: serde_json::Value =
            serde_json::from_str(&fs::read_to_string(&layout.overlay_tsconfig).unwrap()).unwrap();
        assert!(
            cfg["files"]
                .as_array()
                .unwrap()
                .iter()
                .any(|f| f.as_str() == Some("./svelte-types.d.ts")),
            "the blanked copy must be a program root:\n{cfg}"
        );
        // …and every module the package declares resolves to it, so the
        // original — wildcard and all — never enters the program.
        for name in ["svelte", "svelte/store"] {
            let target = cfg["compilerOptions"]["paths"][name][0]
                .as_str()
                .unwrap_or_else(|| panic!("no redirect for {name}:\n{cfg}"));
            assert!(target.ends_with(SVELTE_TYPES_SHADOW_NAME), "{target}");
        }

        // The shadow's own type reference would pull the original back in
        // through a channel `paths` cannot reach.
        let tsx = fs::read_to_string(tmp.join(".svelte-check/svelte/src/App.svelte.tsx")).unwrap();
        assert!(
            !tsx.contains("reference types=\"svelte\""),
            "the svelte type reference must be blanked:\n{tsx}"
        );

        let _ = fs::remove_dir_all(&tmp);
    }

    #[test]
    fn a_dependencys_svelte_type_reference_resolves_to_an_empty_stub() {
        // #2211: blanking the directive in our own shadows covers only the files
        // we generate. A dependency that opens its shipped `.d.ts` with
        // `/// <reference types="svelte" />` (@sveltejs/kit, @tanstack/svelte-table)
        // resolves it through `typeRoots`, which `paths` cannot intercept, so the
        // original declarations came back beside the blanked copy and every
        // ambient svelte module was declared twice — `Snippet`'s `unique symbol`
        // brand included, which is what made a snippet unassignable to `Snippet`.
        let tmp = std::env::temp_dir().join(format!("svc_typeref_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(tmp.join("src")).unwrap();
        fs::create_dir_all(tmp.join("node_modules/@types/node")).unwrap();
        fake_svelte_types(&tmp);
        fs::write(tmp.join("src/App.svelte"), "<p>hi</p>\n").unwrap();

        let files = vec![tmp.join("src/App.svelte")];
        let layout = materialize_overlay(&tmp, &files, None).unwrap();
        let cfg: serde_json::Value =
            serde_json::from_str(&fs::read_to_string(&layout.overlay_tsconfig).unwrap()).unwrap();

        let type_roots: Vec<String> = cfg["compilerOptions"]["typeRoots"]
            .as_array()
            .unwrap_or_else(|| panic!("typeRoots not set:\n{cfg}"))
            .iter()
            .map(|v| v.as_str().unwrap().to_string())
            .collect();
        assert_eq!(
            type_roots.first().map(String::as_str),
            Some(SVELTE_TYPE_REF_DIR),
            "the stub root must be searched first: {type_roots:?}"
        );
        // TypeScript's default is replaced by whatever we set, so the roots it
        // would have used itself have to survive — otherwise `@types/*` packages
        // stop being auto-included.
        assert!(
            type_roots
                .iter()
                .any(|r| r.ends_with("node_modules/@types")),
            "the default type roots were dropped: {type_roots:?}"
        );

        let stub = tmp.join(format!(
            ".svelte-check/{SVELTE_TYPE_REF_DIR}/svelte/index.d.ts"
        ));
        let stub_text = fs::read_to_string(&stub).expect("stub not materialised");
        assert!(
            !stub_text.contains("declare module"),
            "the stub must declare nothing — the blanked copy in `files` is the \
             single source of svelte's ambient modules:\n{stub_text}"
        );
        assert!(
            fs::read_to_string(tmp.join(format!(
                ".svelte-check/{SVELTE_TYPE_REF_DIR}/svelte/package.json"
            )))
            .is_ok_and(|p| p.contains("\"types\"")),
            "a typeRoots entry is only resolvable as a types package"
        );

        let _ = fs::remove_dir_all(&tmp);
    }

    #[test]
    fn a_pinned_types_entry_still_resolves_under_the_stub_type_roots() {
        // Setting `typeRoots` at all replaces TypeScript's default, and a name in
        // `types` resolves through that option alone — no node-resolution fallback
        // — so a plain package pinned there (SvelteKit writes
        // `"types": ["@sveltejs/kit"]`) came back as TS2688, which took every real
        // diagnostic in the project with it.
        let tmp = std::env::temp_dir().join(format!("svc_typeref_types_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(tmp.join("src")).unwrap();
        fs::create_dir_all(tmp.join("node_modules/@sveltejs/kit")).unwrap();
        fake_svelte_types(&tmp);
        fs::write(tmp.join("src/App.svelte"), "<p>hi</p>\n").unwrap();
        fs::write(
            tmp.join("tsconfig.json"),
            r#"{ "compilerOptions": { "types": ["@sveltejs/kit"] } }"#,
        )
        .unwrap();

        let files = vec![tmp.join("src/App.svelte")];
        let tsconfig = tmp.join("tsconfig.json");
        let layout = materialize_overlay(&tmp, &files, Some(&tsconfig)).unwrap();
        let cfg: serde_json::Value =
            serde_json::from_str(&fs::read_to_string(&layout.overlay_tsconfig).unwrap()).unwrap();
        let type_roots: Vec<String> = cfg["compilerOptions"]["typeRoots"]
            .as_array()
            .unwrap_or_else(|| panic!("typeRoots not set:\n{cfg}"))
            .iter()
            .map(|v| v.as_str().unwrap().to_string())
            .collect();
        assert!(
            type_roots.iter().any(|r| r.ends_with("node_modules")),
            "a pinned `types` needs the `node_modules` dirs among the roots to stay \
             resolvable: {type_roots:?}"
        );

        // Without a pinned `types`, automatic inclusion is on and the same entry
        // would drag every installed package into the program as a type library.
        fs::write(tmp.join("tsconfig.json"), r#"{ "compilerOptions": {} }"#).unwrap();
        let layout = materialize_overlay(&tmp, &files, Some(&tsconfig)).unwrap();
        let cfg: serde_json::Value =
            serde_json::from_str(&fs::read_to_string(&layout.overlay_tsconfig).unwrap()).unwrap();
        let type_roots: Vec<String> = cfg["compilerOptions"]["typeRoots"]
            .as_array()
            .unwrap()
            .iter()
            .map(|v| v.as_str().unwrap().to_string())
            .collect();
        assert!(
            !type_roots.iter().any(|r| r.ends_with("node_modules")),
            "widened roots must stay behind a pinned `types`: {type_roots:?}"
        );

        let _ = fs::remove_dir_all(&tmp);
    }

    #[test]
    fn a_js_rune_module_gets_no_bridge_without_allow_js() {
        // #2061: such a module is not in the program at all, so official
        // resolves the specifier straight to it and reports TS7016. A bridge
        // would answer the specifier first and turn that into a wrong TS2614.
        let tmp = std::env::temp_dir().join(format!("svc_allowjs_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(tmp.join("src")).unwrap();
        fs::write(tmp.join("src/counter.svelte.js"), "export const n = 1;\n").unwrap();
        fs::write(tmp.join("src/App.svelte"), "<p>hi</p>\n").unwrap();
        let files = vec![tmp.join("src/App.svelte")];
        let bridge = tmp.join(".svelte-check/svelte/src/counter.d.svelte.ts");

        fs::write(tmp.join("tsconfig.json"), "{\"compilerOptions\":{}}").unwrap();
        let tsconfig = tmp.join("tsconfig.json");
        materialize_overlay_with(&tmp, &files, Some(&tsconfig), false, &[]).unwrap();
        assert!(!bridge.exists(), "a .js module was bridged without allowJs");

        // With `allowJs` the module is a real part of the program again.
        fs::write(&tsconfig, "{\"compilerOptions\":{\"allowJs\":true}}").unwrap();
        materialize_overlay_with(&tmp, &files, Some(&tsconfig), false, &[]).unwrap();
        assert!(bridge.is_file(), "allowJs must restore the bridge");

        let _ = fs::remove_dir_all(&tmp);
    }

    #[test]
    fn a_companion_hijacked_relative_import_gets_a_blanked_probe() {
        // #2061: TypeScript resolves `./widget.svelte` in the importer's own
        // directory, where the real companion wins; official hands the same
        // specifier to the component. Re-resolving it from the mirror, where
        // only the component's bridge exists, is what makes the two agree.
        let tmp = std::env::temp_dir().join(format!("svc_probe_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(tmp.join("src/lib")).unwrap();
        fs::write(tmp.join("src/lib/widget.svelte"), "<p>hi</p>\n").unwrap();
        fs::write(
            tmp.join("src/lib/widget.svelte.ts"),
            "export const helper = 1;\n",
        )
        .unwrap();
        fs::write(
            tmp.join("src/relative.ts"),
            "import { helper } from './lib/widget.svelte';\nexport const m = helper;\n",
        )
        .unwrap();
        fs::write(tmp.join("src/unrelated.ts"), "export const k = 1;\n").unwrap();
        fs::write(tmp.join("tsconfig.json"), "{\"compilerOptions\":{}}").unwrap();

        let files = vec![tmp.join("src/lib/widget.svelte")];
        let layout =
            materialize_overlay_with(&tmp, &files, Some(&tmp.join("tsconfig.json")), false, &[])
                .unwrap();

        assert_eq!(layout.import_probes.len(), 1, "only the hijacked importer");
        let probe = &layout.import_probes[0];
        assert_eq!(probe.source_path, tmp.join("src/relative.ts"));
        let text = fs::read_to_string(&probe.out_path).unwrap();
        assert_eq!(
            text, "import { helper } from './lib/widget.svelte';\n                        \n",
            "everything but the hijacked declaration is blanked in place"
        );

        // Lose the companion and the specifier is no longer hijacked, so the
        // probe has to disappear with it.
        fs::remove_file(tmp.join("src/lib/widget.svelte.ts")).unwrap();
        let layout =
            materialize_overlay_with(&tmp, &files, Some(&tmp.join("tsconfig.json")), false, &[])
                .unwrap();
        assert!(layout.import_probes.is_empty());
        assert!(!probe.out_path.exists(), "stale probe must be swept");

        let _ = fs::remove_dir_all(&tmp);
    }

    #[test]
    fn a_real_declaration_keeps_the_specifier_on_the_companion() {
        // Official's `svelteSys` lets a hand-written `Foo.svelte.d.ts` take
        // precedence over the component, so there is nothing to re-resolve.
        let tmp = std::env::temp_dir().join(format!("svc_probe_dts_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(tmp.join("src")).unwrap();
        fs::write(tmp.join("src/widget.svelte"), "<p>hi</p>\n").unwrap();
        fs::write(
            tmp.join("src/widget.svelte.ts"),
            "export const helper = 1;\n",
        )
        .unwrap();
        fs::write(
            tmp.join("src/widget.svelte.d.ts"),
            "export declare const helper: number;\n",
        )
        .unwrap();
        fs::write(
            tmp.join("src/relative.ts"),
            "import { helper } from './widget.svelte';\nexport const m = helper;\n",
        )
        .unwrap();
        fs::write(tmp.join("tsconfig.json"), "{\"compilerOptions\":{}}").unwrap();

        let layout = materialize_overlay_with(
            &tmp,
            &[tmp.join("src/widget.svelte")],
            Some(&tmp.join("tsconfig.json")),
            false,
            &[],
        )
        .unwrap();
        assert!(layout.import_probes.is_empty());

        let _ = fs::remove_dir_all(&tmp);
    }

    #[test]
    fn a_withheld_js_module_replays_official_answer() {
        // #2061: TS2307 is what an ESM-mode specifier gets when the bridge is
        // withheld; official resolves it onto the untyped `.js` instead.
        let diag = |file: &str, code: &str, message: &str| Diagnostic {
            file: PathBuf::from(file),
            severity: DiagnosticSeverity::Error,
            code: Some(code.into()),
            message: message.into(),
            range: None,
            source: "ts",
        };
        let withheld = vec![PathBuf::from("/ws/src/lib/counter.svelte.js")];
        let cannot_find = |spec: &str| {
            format!("Cannot find module '{spec}' or its corresponding type declarations.")
        };

        let mut diagnostics = vec![
            diag(
                "/ws/src/plain.ts",
                "TS2307",
                &cannot_find("./lib/counter.svelte"),
            ),
            diag(
                "/ws/src/plain.ts",
                "TS2307",
                &cannot_find("./lib/gone.svelte"),
            ),
            diag("/ws/src/plain.ts", "TS2322", "unrelated"),
        ];
        replay_withheld_js_module_diagnostics(&mut diagnostics, &withheld, true);
        assert_eq!(diagnostics.len(), 3);
        assert_eq!(diagnostics[0].code.as_deref(), Some("TS7016"));
        assert_eq!(
            diagnostics[0].message,
            "Could not find a declaration file for module './lib/counter.svelte'. \
             '/ws/src/lib/counter.svelte.js' implicitly has an 'any' type."
        );
        assert_eq!(diagnostics[1].code.as_deref(), Some("TS2307"));
        assert_eq!(diagnostics[2].code.as_deref(), Some("TS2322"));

        // Without `noImplicitAny` official says nothing at all.
        let mut diagnostics = vec![diag(
            "/ws/src/plain.ts",
            "TS2307",
            &cannot_find("./lib/counter.svelte"),
        )];
        replay_withheld_js_module_diagnostics(&mut diagnostics, &withheld, false);
        assert!(diagnostics.is_empty());
    }

    #[test]
    fn non_relative_paths_without_base_url_warn_where_the_user_wrote_them() {
        // #2061: the overlay restates `paths` with absolute targets, so
        // TypeScript never gets to check the user's own values.
        let tmp = std::env::temp_dir().join(format!("svc_ts5090_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(&tmp).unwrap();
        let tsconfig = tmp.join("tsconfig.json");
        fs::write(
            &tsconfig,
            "{\n\t\"compilerOptions\": {\n\t\t\"paths\": {\n\t\t\t\"$lib/*\": [\"./ok/*\", \"src/lib/*\"]\n\t\t}\n\t}\n}\n",
        )
        .unwrap();

        let diagnostics = paths_option_diagnostics(&tsconfig);
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        let diagnostic = &diagnostics[0];
        assert_eq!(diagnostic.code.as_deref(), Some("TS5090"));
        // Official svelte-check downgrades every config diagnostic to a warning.
        assert_eq!(diagnostic.severity, DiagnosticSeverity::Warning);
        assert_eq!(diagnostic.file, tsconfig);
        // Reported on the offending substitution, not on the entry or the file.
        let range = diagnostic
            .range
            .expect("positioned in the config's own text");
        assert_eq!(range.start.line, 4);
        assert!(range.start.column > 0, "{range:?}");

        // A `baseUrl` anywhere in the chain makes the value legal again.
        fs::write(
            &tsconfig,
            "{\"compilerOptions\":{\"baseUrl\":\".\",\"paths\":{\"$lib/*\":[\"src/lib/*\"]}}}",
        )
        .unwrap();
        assert!(paths_option_diagnostics(&tsconfig).is_empty());

        let _ = fs::remove_dir_all(&tmp);
    }

    #[test]
    fn a_config_dir_template_is_substituted_before_it_is_judged() {
        // TS 5.5+ expands `${configDir}` before validating or resolving
        // anything, so the value is absolute by the time TS5090 would fire —
        // and it expands to the PROJECT's directory, not the overlay's.
        let tmp = std::env::temp_dir().join(format!("svc_configdir_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(&tmp).unwrap();
        let tsconfig = tmp.join("tsconfig.json");
        fs::write(
            &tsconfig,
            "{\"compilerOptions\":{\"paths\":{\"$shared/*\":[\"${configDir}/src/shared/*\"]},\
             \"rootDirs\":[\"${configDir}/gen\"]}}",
        )
        .unwrap();

        assert!(paths_option_diagnostics(&tsconfig).is_empty());

        let (paths, _) = resolve_paths_chain(&tsconfig).expect("paths");
        let target = paths["$shared/*"][0].as_str().unwrap();
        assert_eq!(
            Path::new(target),
            absolutize(&tmp).join("src/shared/*"),
            "the template must expand to the project dir"
        );
        assert_eq!(
            resolve_root_dirs_abs(&tsconfig),
            vec![absolutize(&tmp).join("gen")]
        );

        // Anywhere but the start it is not a template at all — upstream leaves
        // such a value alone, so it stays non-relative and still warns.
        fs::write(
            &tsconfig,
            "{\"compilerOptions\":{\"paths\":{\"$x/*\":[\"src/${configDir}/*\"]}}}",
        )
        .unwrap();
        assert_eq!(paths_option_diagnostics(&tsconfig).len(), 1);

        let _ = fs::remove_dir_all(&tmp);
    }

    #[test]
    fn paths_declared_in_an_extended_config_warn_without_a_position() {
        // TypeScript only ever looks in the root config's own syntax for one
        // (`createDiagnosticForOptionPathKeyValue`), so neither do we.
        let tmp = std::env::temp_dir().join(format!("svc_ts5090_ext_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(&tmp).unwrap();
        fs::write(
            tmp.join("base.json"),
            "{\"compilerOptions\":{\"paths\":{\"$lib/*\":[\"src/lib/*\"]}}}",
        )
        .unwrap();
        let tsconfig = tmp.join("tsconfig.json");
        fs::write(&tsconfig, "{\"extends\":\"./base.json\"}").unwrap();

        let diagnostics = paths_option_diagnostics(&tsconfig);
        assert_eq!(diagnostics.len(), 1, "{diagnostics:?}");
        assert_eq!(diagnostics[0].file, tsconfig);
        assert!(diagnostics[0].range.is_none(), "{:?}", diagnostics[0].range);

        let _ = fs::remove_dir_all(&tmp);
    }

    #[test]
    fn paths_value_offset_walks_past_comments_and_earlier_members() {
        let text = "{\n// \"paths\": { \"x\": [\"decoy\"] }\n\"compilerOptions\": {\n\t/* c */ \"strict\": true,\n\t\"paths\": { \"a\": [\"x\"], \"$lib/*\": [\"one\", \"two\"] }\n}\n}\n";
        let (start, end) = paths_value_offset(text, "$lib/*", 1).expect("located");
        assert_eq!(&text[start..end], "\"two\"");
    }
}
