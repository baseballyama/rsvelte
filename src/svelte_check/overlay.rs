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

#[derive(Debug, Clone)]
pub struct OverlayLayout {
    pub workspace: PathBuf,
    pub cache_dir: PathBuf,
    pub emit_dir: PathBuf,
    pub overlay_tsconfig: PathBuf,
    pub entries: Vec<OverlayEntry>,
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
    let cache_dir = workspace.join(".svelte-check");
    let emit_dir = cache_dir.join("svelte");
    fs::create_dir_all(&emit_dir)?;

    let mut entries = Vec::with_capacity(files.len());
    for source_path in files {
        let abs_source = if source_path.is_absolute() {
            source_path.clone()
        } else {
            workspace.join(source_path)
        };
        let rel = abs_source
            .strip_prefix(workspace)
            .unwrap_or(&abs_source)
            .to_path_buf();
        let tsx_rel = append_extension(&rel, ".tsx");
        let dts_rel = append_extension(&rel, ".d.ts");
        let tsx_path = emit_dir.join(&tsx_rel);
        let dts_path = emit_dir.join(&dts_rel);
        if let Some(parent) = tsx_path.parent() {
            fs::create_dir_all(parent)?;
        }

        let source = fs::read_to_string(&abs_source)?;
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

        entries.push(OverlayEntry {
            source_path: abs_source,
            tsx_path,
            dts_path,
            source_map: result.map,
        });
    }

    let overlay_tsconfig = cache_dir.join("tsconfig.json");
    let tsconfig_json = build_overlay_tsconfig(&cache_dir, tsconfig_path);
    fs::write(&overlay_tsconfig, tsconfig_json)?;

    Ok(OverlayLayout {
        workspace: workspace.to_path_buf(),
        cache_dir,
        emit_dir,
        overlay_tsconfig,
        entries,
    })
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

fn build_overlay_tsconfig(cache_dir: &Path, original: Option<&Path>) -> String {
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
    obj.insert("include", serde_json::json!(["./svelte/**/*"]));
    // Override `files` so any `.svelte` entries listed in the base
    // tsconfig don't reach tsc — TS rejects arbitrary extensions in the
    // `files` array even with `allowArbitraryExtensions`, producing
    // TS6054 before it ever checks anything. The fuller story (forward
    // user-listed `.ts` entries, merge user's `include`/`exclude`
    // rebased to the overlay dir) is mirrored in
    // `submodules/language-tools/packages/svelte-check/src/incremental.ts::buildOverlayTsconfig`
    // and tracked as future work.
    obj.insert("files", serde_json::json!([]));
    serde_json::to_string_pretty(&obj).unwrap_or_else(|_| "{}".into())
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
}
