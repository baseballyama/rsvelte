//! Resolve a module specifier from a Svelte file context.
//!
//! Mirrors the JS reference's
//! `submodules/vite-plugin-svelte/packages/vite-plugin-svelte/src/utils/id.js`.
//! The Vite plugin asks Rust to map an `import` specifier to an absolute
//! filesystem path so it can register the dependency graph.
//!
//! Scope for v0.1:
//! - Relative specifiers (`./`, `../`) — resolved against the importer.
//! - Bare specifiers — left to Vite's main resolver (we return `None`).
//! - Implicit `.svelte`/`.ts`/`.js` extensions and `index.<ext>` lookups.

use serde::{Deserialize, Serialize};
use std::path::{Component, Path, PathBuf};

#[derive(Debug, Clone)]
pub struct ResolveOptions<'a> {
    pub importer: Option<&'a Path>,
    pub specifier: &'a str,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ResolveResult {
    /// Absolute path (POSIX-normalised) the importer should consume.
    pub resolved: String,
}

/// Try to resolve `specifier` against `importer`. Returns `None` for
/// bare specifiers or anything that doesn't exist on disk; the JS shim
/// falls back to Vite's resolver for those cases.
pub fn resolve_id(opts: ResolveOptions<'_>) -> Option<ResolveResult> {
    if !is_relative(opts.specifier) {
        return None;
    }
    let importer_dir = opts.importer.and_then(|p| p.parent())?;
    let combined = combine(importer_dir, opts.specifier);
    let normalised = normalise(&combined);
    if let Some(found) = first_existing(&normalised, &candidate_extensions()) {
        return Some(ResolveResult {
            resolved: to_posix_string(&found),
        });
    }
    None
}

fn is_relative(spec: &str) -> bool {
    spec.starts_with("./") || spec.starts_with("../") || spec == "." || spec == ".."
}

fn combine(base: &Path, spec: &str) -> PathBuf {
    base.join(spec)
}

/// Lexical path normalisation (resolves `.` and `..` without touching
/// the filesystem). Avoids `Path::canonicalize` because the target
/// might not exist yet and on Windows it can return UNC prefixes.
fn normalise(p: &Path) -> PathBuf {
    let mut out: Vec<Component<'_>> = Vec::new();
    for c in p.components() {
        match c {
            Component::ParentDir => {
                let pop_ok = out
                    .last()
                    .is_some_and(|c| matches!(c, Component::Normal(_)));
                if pop_ok {
                    out.pop();
                } else {
                    out.push(c);
                }
            }
            Component::CurDir => {}
            other => out.push(other),
        }
    }
    out.into_iter().collect()
}

fn candidate_extensions() -> Vec<&'static str> {
    vec!["", ".svelte", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]
}

/// Try `path`, `path<.ext>` for each extension, and `path/index<.ext>`.
fn first_existing(path: &Path, exts: &[&str]) -> Option<PathBuf> {
    for ext in exts {
        let candidate = if ext.is_empty() {
            path.to_path_buf()
        } else {
            let mut s = path.as_os_str().to_owned();
            s.push(ext);
            PathBuf::from(s)
        };
        if candidate.is_file() {
            return Some(candidate);
        }
    }
    if path.is_dir() {
        for ext in exts {
            let candidate = path.join(format!("index{ext}"));
            if candidate.is_file() {
                return Some(candidate);
            }
        }
    }
    None
}

fn to_posix_string(p: &Path) -> String {
    p.display().to_string().replace('\\', "/")
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::io::Write;

    #[test]
    fn returns_none_for_bare_specifiers() {
        let r = resolve_id(ResolveOptions {
            importer: Some(Path::new("/tmp/App.svelte")),
            specifier: "lodash",
        });
        assert!(r.is_none());
    }

    #[test]
    fn resolves_relative_svelte_import() {
        let tmp = std::env::temp_dir().join(format!("vps_resolver_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(tmp.join("src")).unwrap();
        fs::File::create(tmp.join("src/Foo.svelte"))
            .unwrap()
            .write_all(b"<div />")
            .unwrap();
        let importer = tmp.join("src/App.svelte");
        fs::File::create(&importer)
            .unwrap()
            .write_all(b"<div />")
            .unwrap();

        let r = resolve_id(ResolveOptions {
            importer: Some(&importer),
            specifier: "./Foo.svelte",
        })
        .expect("relative .svelte resolves");
        assert!(r.resolved.ends_with("/src/Foo.svelte"), "{}", r.resolved);

        // Implicit extension
        let r2 = resolve_id(ResolveOptions {
            importer: Some(&importer),
            specifier: "./Foo",
        })
        .expect("implicit extension");
        assert!(r2.resolved.ends_with("/src/Foo.svelte"), "{}", r2.resolved);

        let _ = fs::remove_dir_all(&tmp);
    }

    #[test]
    fn resolves_index_lookup() {
        let tmp = std::env::temp_dir().join(format!("vps_resolver_idx_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        fs::create_dir_all(tmp.join("pkg")).unwrap();
        fs::File::create(tmp.join("pkg/index.ts"))
            .unwrap()
            .write_all(b"export const x = 1;")
            .unwrap();
        let importer = tmp.join("App.svelte");
        fs::File::create(&importer)
            .unwrap()
            .write_all(b"<div />")
            .unwrap();
        let r = resolve_id(ResolveOptions {
            importer: Some(&importer),
            specifier: "./pkg",
        })
        .expect("dir/index.ts");
        assert!(r.resolved.ends_with("/pkg/index.ts"), "{}", r.resolved);
        let _ = fs::remove_dir_all(&tmp);
    }
}
