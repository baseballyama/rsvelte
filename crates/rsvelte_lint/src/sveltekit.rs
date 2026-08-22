//! Whether the linted file belongs to a SvelteKit project.
//!
//! Upstream gates five rules with `conditions: [{ svelteKitVersions: … }]` /
//! `{ svelteKitFileTypes: … }`, and `svelteKitFileType` is itself only computed
//! once a version is known — so all five are **disabled** when `@sveltejs/kit`
//! cannot be resolved from the file. Without this, a plain Svelte project gets
//! findings ESLint would never produce.
//!
//! Port of `getSvelteKitVersion` in eslint-plugin-svelte's
//! `src/utils/svelte-context.ts`: a `node_modules/@sveltejs/kit` directory
//! walking up from the file, else a `@sveltejs/kit` entry in the
//! `dependencies` / `devDependencies` of any `package.json` up the same chain.

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::{Mutex, OnceLock};

/// Rules upstream will not run outside a SvelteKit project.
///
/// Upstream carries this in each rule's `meta.conditions`; rsvelte's
/// `RuleConditions` cannot express it yet, so the set lives here.
const SVELTEKIT_ONLY: &[&str] = &[
    "svelte/no-goto-without-base",
    "svelte/no-navigation-without-base",
    "svelte/no-navigation-without-resolve",
    "svelte/no-export-load-in-svelte-module-in-kit-pages",
    "svelte/valid-prop-names-in-kit-pages",
];

#[must_use]
pub fn is_sveltekit_only(rule_name: &str) -> bool {
    SVELTEKIT_ONLY.contains(&rule_name)
}

/// True when a SvelteKit-gated rule may run for `path`.
///
/// A file with no path (stdin, an in-memory buffer) is permissive, mirroring
/// upstream's "if svelteContext is null … always execute the rule".
#[must_use]
pub fn available(path: Option<&Path>) -> bool {
    let Some(path) = path else {
        return true;
    };
    // A bare filename names no location: `parent()` is `Some("")`, which would
    // silently resolve the dependency walk against the process's cwd and answer
    // for a project the file is not in. Treat it as "no path".
    let Some(dir) = path.parent().filter(|p| !p.as_os_str().is_empty()) else {
        return true;
    };
    let dir = match std::fs::canonicalize(dir) {
        Ok(d) => d,
        Err(_) => dir.to_path_buf(),
    };
    static CACHE: OnceLock<Mutex<HashMap<PathBuf, bool>>> = OnceLock::new();
    let cache = CACHE.get_or_init(|| Mutex::new(HashMap::new()));
    if let Ok(map) = cache.lock()
        && let Some(hit) = map.get(&dir)
    {
        return *hit;
    }
    let found = search_upward(&dir);
    if let Ok(mut map) = cache.lock() {
        map.insert(dir, found);
    }
    found
}

fn search_upward(start: &Path) -> bool {
    // Upstream probes every ancestor's `node_modules` first, then reads the
    // manifests — the order matters only for its own caching, but keeping it
    // keeps the two readable side by side.
    let mut dir = Some(start);
    while let Some(d) = dir {
        if d.join("node_modules/@sveltejs/kit").is_dir() {
            return true;
        }
        dir = d.parent();
    }

    let manifests: Vec<serde_json::Value> = std::iter::successors(Some(start), |d| d.parent())
        .filter_map(|d| std::fs::read_to_string(d.join("package.json")).ok())
        .filter_map(|text| serde_json::from_str::<serde_json::Value>(&text).ok())
        .collect();

    // Upstream's own hack: its CI removes `@sveltejs/kit`, so a file whose
    // nearest manifest is the plugin package is treated as SvelteKit 2. That is
    // what makes its RuleTester fixtures exercise the kit-gated rules at all.
    if manifests
        .first()
        .and_then(|m| m.get("name"))
        .and_then(serde_json::Value::as_str)
        == Some("eslint-plugin-svelte")
    {
        return true;
    }

    manifests.iter().any(|m| {
        ["dependencies", "devDependencies"].iter().any(|field| {
            m.get(field)
                .is_some_and(|d| d.get("@sveltejs/kit").is_some())
        })
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn a_manifest_dependency_is_enough() {
        let dir = std::env::temp_dir().join(format!("rsvelte-kit-probe-{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&dir);
        std::fs::create_dir_all(dir.join("src")).unwrap();
        std::fs::write(dir.join("src/A.svelte"), "<p>x</p>").unwrap();

        // No manifest anywhere the walk can reach a declaration: the temp dir's
        // ancestors are system directories, so this is the negative control.
        assert!(!search_upward(&dir.join("src")));

        std::fs::write(
            dir.join("package.json"),
            r#"{"devDependencies":{"@sveltejs/kit":"^2.0.0"}}"#,
        )
        .unwrap();
        assert!(search_upward(&dir.join("src")));
        let _ = std::fs::remove_dir_all(&dir);
    }
}
