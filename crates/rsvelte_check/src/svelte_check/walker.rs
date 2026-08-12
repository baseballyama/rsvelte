//! Project walker: find `.svelte` files in a workspace.
//!
//! Mirrors `submodules/language-tools/packages/svelte-check/src/utils.ts`'s
//! file traversal: walk the workspace skipping `node_modules` and any
//! user-supplied ignore globs.

use std::path::{Path, PathBuf};

use walkdir::WalkDir;

use super::kit_file::{KitFilesSettings, is_kit_file};

/// Result of `find_relevant_files`, split into Svelte and kit files.
///
/// Each kind takes a different downstream augmentation path.
#[derive(Debug, Default)]
pub struct RelevantFiles {
    pub svelte: Vec<PathBuf>,
    pub kit: Vec<PathBuf>,
}

/// Finds `.svelte` files under `root`.
///
/// Skips `node_modules` and entries matching a supplied path fragment.
#[must_use]
pub fn find_svelte_files(root: &Path, filter_paths: &[String]) -> Vec<PathBuf> {
    let mut out: Vec<PathBuf> = Vec::new();
    for entry in pruned_walk(root, filter_paths).flatten() {
        if entry.file_type().is_file() && entry.path().extension().is_some_and(|e| e == "svelte") {
            out.push(entry.into_path());
        }
    }
    out.sort();
    out
}

/// Finds `<name>.svelte.ts` and `<name>.svelte.js` modules under `root`.
///
/// These Svelte 5 rune modules use extensionless `.svelte` specifiers.
#[must_use]
pub fn find_svelte_suffixed_modules(root: &Path, filter_paths: &[String]) -> Vec<PathBuf> {
    let mut out: Vec<PathBuf> = Vec::new();
    for entry in pruned_walk(root, filter_paths).flatten() {
        if !entry.file_type().is_file() {
            continue;
        }
        let name = entry.file_name().to_string_lossy();
        if name.ends_with(".svelte.ts") || name.ends_with(".svelte.js") {
            out.push(entry.into_path());
        }
    }
    out.sort();
    out
}

/// Extensions a plain TypeScript / JavaScript module can carry.
const JS_TS_EXTENSIONS: [&str; 8] = ["ts", "tsx", "mts", "cts", "js", "jsx", "mjs", "cjs"];

/// Finds plain modules that could carry a relative `.svelte` import.
///
/// Rune modules use a separate bridge and are excluded.
#[must_use]
pub fn find_probeable_modules(root: &Path, filter_paths: &[String]) -> Vec<PathBuf> {
    let mut out: Vec<PathBuf> = Vec::new();
    for entry in pruned_walk(root, filter_paths).flatten() {
        if !entry.file_type().is_file() {
            continue;
        }
        let name = entry.file_name().to_string_lossy().into_owned();
        if name.contains(".svelte.") || name.ends_with(".d.ts") {
            continue;
        }
        if entry
            .path()
            .extension()
            .is_some_and(|e| JS_TS_EXTENSIONS.iter().any(|k| e == *k))
        {
            out.push(entry.into_path());
        }
    }
    out.sort();
    out
}

/// Find every import probe the overlay has previously written under `mirror`.
#[must_use]
pub fn find_import_probes(mirror: &Path) -> Vec<PathBuf> {
    let mut out: Vec<PathBuf> = Vec::new();
    for entry in WalkDir::new(mirror)
        .follow_links(false)
        .into_iter()
        .flatten()
    {
        if entry.file_type().is_file()
            && entry
                .file_name()
                .to_string_lossy()
                .contains(super::overlay::IMPORT_PROBE_INFIX)
        {
            out.push(entry.into_path());
        }
    }
    out.sort();
    out
}

/// The shared traversal both finders use: skip `node_modules`, hidden
/// directories and any user-supplied ignore fragment.
fn pruned_walk(
    root: &Path,
    filter_paths: &[String],
) -> impl Iterator<Item = walkdir::Result<walkdir::DirEntry>> {
    let filter_paths = filter_paths.to_vec();
    WalkDir::new(root)
        .follow_links(false)
        .into_iter()
        .filter_entry(move |e| {
            // Never prune the walk root itself — it's the workspace the user
            // explicitly pointed us at. `WalkDir::new(".")` / `"./"` reports a
            // depth-0 entry whose `file_name()` falls back to the path string
            // (`.`), which would otherwise trip the hidden-dir skip below and
            // silently discard the entire tree (issue #718). The same guard
            // also honours a workspace dir whose own name starts with `.`.
            if e.depth() == 0 {
                return true;
            }
            let name = e.file_name().to_string_lossy();
            // Always skip node_modules and hidden directories — matches
            // the JS `excludePattern: /node_modules/.*\..*$/` plus the
            // implicit hidden-dir skip.
            if name == "node_modules" || name.starts_with('.') {
                return false;
            }
            if filter_paths.is_empty() {
                return true;
            }
            // User-supplied ignore: skip if any path component matches.
            let path = e.path();
            !filter_paths.iter().any(|frag| {
                path.components()
                    .any(|c| c.as_os_str().to_string_lossy() == *frag)
            })
        })
}

/// Find both `.svelte` files and `SvelteKit` `.ts` / `.js` files (route,
/// hooks, params) under `root`. Mirrors `incremental.ts`'s `findFiles`
/// filter `endsWith('.svelte') || (isJsOrTsFile && isKitFile)`.
#[must_use]
pub fn find_relevant_files(
    root: &Path,
    filter_paths: &[String],
    settings: &KitFilesSettings,
) -> RelevantFiles {
    let mut out = RelevantFiles::default();
    for entry in pruned_walk(root, filter_paths).flatten() {
        if !entry.file_type().is_file() {
            continue;
        }
        let path = entry.path();
        if path.extension().is_some_and(|e| e == "svelte") {
            out.svelte.push(entry.into_path());
            continue;
        }
        let is_ts_or_js = path.extension().is_some_and(|e| e == "ts" || e == "js");
        if is_ts_or_js && is_kit_file(path, settings) {
            out.kit.push(entry.into_path());
        }
    }
    out.svelte.sort();
    out.kit.sort();
    out
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::io::Write;

    fn setup_project(root: &Path) {
        fs::create_dir_all(root.join("src")).unwrap();
        fs::create_dir_all(root.join("node_modules/something")).unwrap();
        fs::create_dir_all(root.join("dist")).unwrap();
        fs::create_dir_all(root.join(".hidden")).unwrap();
        let touch = |p: &Path| {
            fs::File::create(p)
                .unwrap()
                .write_all(b"<div></div>")
                .unwrap();
        };
        touch(&root.join("src/App.svelte"));
        touch(&root.join("src/Inner.svelte"));
        touch(&root.join("node_modules/something/Bad.svelte"));
        touch(&root.join("dist/Build.svelte"));
        touch(&root.join(".hidden/Hidden.svelte"));
    }

    #[test]
    fn finds_svelte_files_skipping_node_modules() {
        let tmp = std::env::temp_dir().join(format!("svc_walker_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        setup_project(&tmp);
        let files = find_svelte_files(&tmp, &[]);
        let names: Vec<_> = files
            .iter()
            .filter_map(|p| p.file_name().map(|n| n.to_string_lossy().into_owned()))
            .collect();
        assert!(names.contains(&"App.svelte".into()));
        assert!(names.contains(&"Inner.svelte".into()));
        assert!(names.contains(&"Build.svelte".into()));
        assert!(
            !names.contains(&"Bad.svelte".into()),
            "node_modules skipped"
        );
        assert!(
            !names.contains(&"Hidden.svelte".into()),
            "hidden dirs skipped"
        );
        let _ = fs::remove_dir_all(&tmp);
    }

    #[test]
    fn walk_root_is_never_pruned_by_hidden_skip() {
        // Regression for #718: when the walk root's own name starts with `.`
        // (as `WalkDir::new(".")` / `"./"` reports it at depth 0), the
        // hidden-dir skip must not discard the entire tree. A workspace dir
        // literally named `.app` exercises the same depth-0 guard.
        let tmp = std::env::temp_dir().join(format!(".svc_walker_dot_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        setup_project(&tmp);
        let files = find_svelte_files(&tmp, &[]);
        let names: Vec<_> = files
            .iter()
            .filter_map(|p| p.file_name().map(|n| n.to_string_lossy().into_owned()))
            .collect();
        assert!(
            names.contains(&"App.svelte".into()),
            "files under a dot-named root must still be found, got {names:?}"
        );
        assert!(
            !names.contains(&"Hidden.svelte".into()),
            "descendant hidden dirs are still skipped"
        );
        let _ = fs::remove_dir_all(&tmp);
    }

    #[test]
    fn finds_svelte_suffixed_modules() {
        let tmp = std::env::temp_dir().join(format!("svc_walker_runes_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        setup_project(&tmp);
        let touch = |p: &Path| {
            fs::File::create(p)
                .unwrap()
                .write_all(b"export {};")
                .unwrap();
        };
        touch(&tmp.join("src/state.svelte.ts"));
        touch(&tmp.join("src/legacy.svelte.js"));
        touch(&tmp.join("src/plain.ts"));
        touch(&tmp.join("node_modules/something/dep.svelte.ts"));
        touch(&tmp.join("dist/built.svelte.js"));
        let names = |filter: &[String]| -> Vec<String> {
            find_svelte_suffixed_modules(&tmp, filter)
                .iter()
                .filter_map(|p| p.file_name().map(|n| n.to_string_lossy().into_owned()))
                .collect()
        };
        assert_eq!(
            names(&[]),
            vec!["built.svelte.js", "legacy.svelte.js", "state.svelte.ts"]
        );
        // `--ignore` applies here too, so the bridges the overlay emits cover
        // exactly the tree the checked file set was collected from.
        assert_eq!(
            names(&["dist".to_string()]),
            vec!["legacy.svelte.js", "state.svelte.ts"]
        );
        let _ = fs::remove_dir_all(&tmp);
    }

    #[test]
    fn applies_user_filter() {
        let tmp = std::env::temp_dir().join(format!("svc_walker_filter_{}", std::process::id()));
        let _ = fs::remove_dir_all(&tmp);
        setup_project(&tmp);
        let files = find_svelte_files(&tmp, &["dist".into()]);
        let names: Vec<_> = files
            .iter()
            .filter_map(|p| p.file_name().map(|n| n.to_string_lossy().into_owned()))
            .collect();
        assert!(names.contains(&"App.svelte".into()));
        assert!(!names.contains(&"Build.svelte".into()), "dist filtered");
        let _ = fs::remove_dir_all(&tmp);
    }
}
