//! Project walker: find `.svelte` files in a workspace.
//!
//! Mirrors `submodules/language-tools/packages/svelte-check/src/utils.ts`'s
//! file traversal: walk the workspace skipping `node_modules` and any
//! user-supplied ignore globs.

use std::path::{Path, PathBuf};

use walkdir::WalkDir;

/// Find every `.svelte` file under `root`, skipping `node_modules` and any
/// user-supplied `filter_paths` (relative path fragments — entries whose
/// path contains any fragment as a path component are skipped).
pub fn find_svelte_files(root: &Path, filter_paths: &[String]) -> Vec<PathBuf> {
    let mut out: Vec<PathBuf> = Vec::new();
    let walker = WalkDir::new(root)
        .follow_links(false)
        .into_iter()
        .filter_entry(|e| {
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
        });
    for entry in walker.flatten() {
        if entry.file_type().is_file() && entry.path().extension().is_some_and(|e| e == "svelte") {
            out.push(entry.into_path());
        }
    }
    out.sort();
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
