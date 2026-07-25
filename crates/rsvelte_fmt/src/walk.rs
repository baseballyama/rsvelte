use std::path::{Path, PathBuf};

use anyhow::{Context, Result};
use ignore::WalkBuilder;

use crate::oxfmt_ignore;
use crate::paths::{is_native_css, is_native_js, is_native_json, is_svelte};

// ─── file walking ───────────────────────────────────────────────────────

/// Split the user's inputs into the in-process Svelte pass and the delegated
/// `oxfmt` pass.
///
/// `.svelte` files are enumerated for the in-process formatter by walking every
/// directory input (plus any explicit `.svelte` file arguments). Everything else
/// is handed to `oxfmt`: directory inputs go through verbatim so `oxfmt` walks
/// them with its full supported extension set (`.md`/`.yaml`/`.toml`/`.html`,
/// …) — the same coverage as `oxfmt .` — while a `!**/*.svelte` exclude (added
/// in [`crate::oxfmt::run_oxfmt`]) keeps the Svelte files for us. Non-`.svelte` file
/// arguments are passed straight through. See #694.
#[allow(clippy::type_complexity)]
pub(crate) fn partition_files(
    roots: &[PathBuf],
    ignore: &oxfmt_ignore::SvelteIgnore,
    cwd: &Path,
    native_js: bool,
    native_css: bool,
) -> Result<(
    Vec<PathBuf>,
    Vec<PathBuf>,
    Vec<PathBuf>,
    Vec<PathBuf>,
    Vec<PathBuf>,
)> {
    let mut svelte = Vec::new();
    let mut native = Vec::new();
    let mut native_json = Vec::new();
    let mut native_css_files = Vec::new();
    let mut oxfmt_paths = Vec::new();
    for root in roots {
        let meta = std::fs::metadata(root)
            .with_context(|| format!("reading {} — no such file or directory", root.display()))?;
        if meta.is_dir() {
            // Enumerate `.svelte` files ourselves (oxfmt walks the rest),
            // honoring the same `.gitignore` / `.prettierignore` / `.oxfmtrc`
            // `ignorePatterns` oxfmt applies to the files it walks. Walk from an
            // absolute root so entry paths can be matched against the
            // (absolute-rooted) ignore matchers.
            let abs_root = if root.is_absolute() {
                root.clone()
            } else if root.as_os_str() == "." {
                // `.` and cwd differ as paths; normalize so entry paths don't
                // carry a `.` component that would break ignore matching.
                cwd.to_path_buf()
            } else {
                cwd.join(root)
            };
            let has_vcs_boundary =
                oxfmt_ignore::all_paths_have_vcs_boundary(std::slice::from_ref(&abs_root), cwd);
            let mut builder = WalkBuilder::new(&abs_root);
            builder.follow_links(false);
            oxfmt_ignore::configure_walk_builder(&mut builder, has_vcs_boundary);
            builder.filter_entry(|entry| {
                // `.gitignore` is applied by the walker; here we only skip VCS
                // internals and `node_modules`. File-level ignores are below.
                !(entry.file_type().is_some_and(|ft| ft.is_dir())
                    && oxfmt_ignore::is_ignored_dir(entry.file_name()))
            });
            for entry in builder.build() {
                let entry = entry.context("walking input tree")?;
                let path = entry.path();
                if !entry.file_type().is_some_and(|ft| ft.is_file()) {
                    continue;
                }
                if is_svelte(path) && !ignore.is_ignored(path, false) {
                    svelte.push(entry.into_path());
                } else if native_js && is_native_js(path) && !ignore.is_ignored(path, false) {
                    native.push(entry.into_path());
                } else if native_js && is_native_json(path) && !ignore.is_ignored(path, false) {
                    // JSON (incl. `package.json`) goes to the native-JSON pass;
                    // `package.json` is re-delegated to oxfmt there.
                    native_json.push(entry.into_path());
                } else if native_css && is_native_css(path) && !ignore.is_ignored(path, false) {
                    // `.css`/`.scss`/`.less` go to the native-CSS pass; parse
                    // errors are re-delegated to oxfmt there.
                    native_css_files.push(entry.into_path());
                }
            }
            oxfmt_paths.push(root.clone());
        } else if is_svelte(root) {
            // Single explicit `.svelte` file — apply the same ignore rules.
            let abs = if root.is_absolute() {
                root.clone()
            } else {
                cwd.join(root)
            };
            if !ignore.is_ignored(&abs, false) {
                svelte.push(root.clone());
            }
        } else if native_js && is_native_js(root) {
            // Single explicit `.ts`/`.js` file — native pass (same ignore rules).
            let abs = if root.is_absolute() {
                root.clone()
            } else {
                cwd.join(root)
            };
            if !ignore.is_ignored(&abs, false) {
                native.push(root.clone());
            }
        } else if native_js && is_native_json(root) {
            // Single explicit `.json`/`.jsonc` file — native-JSON pass.
            let abs = if root.is_absolute() {
                root.clone()
            } else {
                cwd.join(root)
            };
            if !ignore.is_ignored(&abs, false) {
                native_json.push(root.clone());
            }
        } else if native_css && is_native_css(root) {
            // Single explicit `.css`/`.scss`/`.less` file — native-CSS pass.
            let abs = if root.is_absolute() {
                root.clone()
            } else {
                cwd.join(root)
            };
            if !ignore.is_ignored(&abs, false) {
                native_css_files.push(root.clone());
            }
        } else {
            oxfmt_paths.push(root.clone());
        }
    }
    Ok((svelte, native, native_json, native_css_files, oxfmt_paths))
}
