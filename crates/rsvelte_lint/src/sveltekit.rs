//! Which SvelteKit version the linted file belongs to.
//!
//! Upstream gates five rules with `conditions: [{ svelteKitVersions: … }]` /
//! `{ svelteKitFileTypes: … }`, and `svelteKitFileType` is itself only computed
//! once a version is known — so all five are **disabled** when `@sveltejs/kit`
//! cannot be resolved from the file, and the `svelteKitVersions` ones are also
//! disabled under a major they do not list.
//!
//! Port of `getSvelteKitVersion` in eslint-plugin-svelte's
//! `src/utils/svelte-context.ts`: the `version` of the first
//! `node_modules/@sveltejs/kit` walking up from the file, else the
//! `dependencies` / `devDependencies` range of the first `package.json` up the
//! same chain whose range parses.

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::{Mutex, OnceLock};

/// Each rule's `svelteKitVersions`; an empty list is a `svelteKitFileTypes`
/// condition, which admits any version but still needs one.
///
/// Upstream carries this in each rule's `meta.conditions`; rsvelte's
/// `RuleConditions` cannot express it yet, so the table lives here
/// (`scripts/compat-corpus/lint-conditions.mjs` compares it with upstream).
const SVELTEKIT_ONLY: &[(&str, &[&str])] = &[
    ("svelte/no-goto-without-base", &["1.0.0-next", "1", "2"]),
    (
        "svelte/no-navigation-without-base",
        &["1.0.0-next", "1", "2"],
    ),
    (
        "svelte/no-navigation-without-resolve",
        &["1.0.0-next", "1", "2", "3"],
    ),
    ("svelte/no-export-load-in-svelte-module-in-kit-pages", &[]),
    ("svelte/valid-prop-names-in-kit-pages", &[]),
];

/// The SvelteKit context of one file.
#[derive(Debug, Clone)]
pub enum KitContext {
    /// No file location: upstream's "if svelteContext is null … always execute
    /// the rule".
    Unknown,
    /// Upstream's `svelteKitVersion`; `None` is its `null`.
    Version(Option<String>),
}

impl KitContext {
    #[must_use]
    pub fn for_path(path: Option<&Path>) -> Self {
        let Some(path) = path else {
            return Self::Unknown;
        };
        // A bare filename names no location: `parent()` is `Some("")`, which would
        // silently resolve the walk against the process's cwd and answer for a
        // project the file is not in.
        let Some(dir) = path.parent().filter(|p| !p.as_os_str().is_empty()) else {
            return Self::Unknown;
        };
        let dir = std::fs::canonicalize(dir).unwrap_or_else(|_| dir.to_path_buf());
        static CACHE: OnceLock<Mutex<HashMap<PathBuf, Option<String>>>> = OnceLock::new();
        let cache = CACHE.get_or_init(|| Mutex::new(HashMap::new()));
        if let Ok(map) = cache.lock()
            && let Some(hit) = map.get(&dir)
        {
            return Self::Version(hit.clone());
        }
        let version = svelte_kit_version(&dir);
        if let Ok(mut map) = cache.lock() {
            map.insert(dir, version.clone());
        }
        Self::Version(version)
    }

    /// False when upstream's SvelteKit conditions keep `rule_name` from running.
    #[must_use]
    pub fn allows(&self, rule_name: &str) -> bool {
        let Some((_, versions)) = SVELTEKIT_ONLY.iter().find(|(n, _)| *n == rule_name) else {
            return true;
        };
        match self {
            Self::Unknown => true,
            Self::Version(None) => false,
            Self::Version(Some(v)) => versions.is_empty() || versions.contains(&v.as_str()),
        }
    }
}

/// `extractMajorVersion`: `/^(?:\^|~)?(\d+)\./`, or with
/// `recognize_prerelease` first `/^(?:\^|~)?(\d+\.0\.0-next)/`.
fn extract_major_version(version: &str, recognize_prerelease: bool) -> Option<&str> {
    let body = version
        .strip_prefix('^')
        .or_else(|| version.strip_prefix('~'))
        .unwrap_or(version);
    let digits = body.bytes().take_while(u8::is_ascii_digit).count();
    if digits == 0 {
        return None;
    }
    let rest = &body[digits..];
    if recognize_prerelease && rest.starts_with(".0.0-next") {
        return Some(&body[..digits + ".0.0-next".len()]);
    }
    rest.starts_with('.').then(|| &body[..digits])
}

/// `checkAndSetSvelteKitVersion`: Kit 1's prerelease keeps its own label,
/// every later prerelease collapses to its major.
fn kit_major(version: &str) -> Option<String> {
    if extract_major_version(version, true) == Some("1.0.0-next") {
        return Some("1.0.0-next".to_string());
    }
    extract_major_version(version, false).map(str::to_string)
}

fn svelte_kit_version(start: &Path) -> Option<String> {
    let mut dir = Some(start);
    while let Some(d) = dir {
        let module = d.join("node_modules/@sveltejs/kit");
        if module.is_dir() {
            // Only the first hit is read; an unreadable or unparseable version
            // falls through to the manifests rather than to the next ancestor.
            let version = std::fs::read_to_string(module.join("package.json"))
                .ok()
                .and_then(|t| serde_json::from_str::<serde_json::Value>(&t).ok())
                .and_then(|m| {
                    m.get("version")
                        .and_then(|v| v.as_str())
                        .and_then(kit_major)
                });
            if version.is_some() {
                return version;
            }
            break;
        }
        dir = d.parent();
    }

    let manifests: Vec<serde_json::Value> = std::iter::successors(Some(start), |d| d.parent())
        .filter_map(|d| std::fs::read_to_string(d.join("package.json")).ok())
        .filter_map(|text| serde_json::from_str::<serde_json::Value>(&text).ok())
        .filter(|m| m.is_object() || m.is_array())
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
        return Some("2".to_string());
    }

    manifests.iter().find_map(|m| {
        // `dependencies?.[kit] ?? devDependencies?.[kit]`, then `typeof === 'string'`.
        let declared = m
            .get("dependencies")
            .and_then(|d| d.get("@sveltejs/kit"))
            .filter(|v| !v.is_null())
            .or_else(|| {
                m.get("devDependencies")
                    .and_then(|d| d.get("@sveltejs/kit"))
            });
        declared
            .and_then(serde_json::Value::as_str)
            .and_then(kit_major)
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn major_version_follows_upstream_regexes() {
        assert_eq!(kit_major("3.0.0"), Some("3".into()));
        assert_eq!(kit_major("^2.5.0"), Some("2".into()));
        assert_eq!(kit_major("~1.30.4"), Some("1".into()));
        assert_eq!(kit_major("1.0.0-next.589"), Some("1.0.0-next".into()));
        assert_eq!(kit_major("^1.0.0-next.100"), Some("1.0.0-next".into()));
        assert_eq!(kit_major("3.0.0-next.4"), Some("3".into()));
        assert_eq!(kit_major("10.1.0"), Some("10".into()));
        for unparsed in ["workspace:*", "next", "latest", ">=2.0.0", "2", "*", "^x.1"] {
            assert_eq!(kit_major(unparsed), None, "{unparsed}");
        }
    }

    #[test]
    fn version_lists_gate_per_rule() {
        let kit3 = KitContext::Version(Some("3".into()));
        assert!(!kit3.allows("svelte/no-goto-without-base"));
        assert!(!kit3.allows("svelte/no-navigation-without-base"));
        assert!(kit3.allows("svelte/no-navigation-without-resolve"));
        assert!(kit3.allows("svelte/valid-prop-names-in-kit-pages"));
        let kit2 = KitContext::Version(Some("2".into()));
        assert!(kit2.allows("svelte/no-goto-without-base"));
        let kit4 = KitContext::Version(Some("4".into()));
        assert!(!kit4.allows("svelte/no-navigation-without-resolve"));
        assert!(kit4.allows("svelte/no-export-load-in-svelte-module-in-kit-pages"));
        let none = KitContext::Version(None);
        assert!(!none.allows("svelte/valid-prop-names-in-kit-pages"));
        assert!(none.allows("svelte/no-at-html-tags"));
        assert!(KitContext::Unknown.allows("svelte/no-goto-without-base"));
    }

    #[test]
    fn manifest_and_node_modules_resolution() {
        let dir = std::env::temp_dir().join(format!("rsvelte-kit-probe-{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&dir);
        let src = dir.join("app/src");
        std::fs::create_dir_all(&src).unwrap();

        // The temp dir's ancestors are system directories: the negative control.
        assert_eq!(svelte_kit_version(&src), None);

        std::fs::write(
            dir.join("package.json"),
            r#"{"devDependencies":{"@sveltejs/kit":"^2.0.0"}}"#,
        )
        .unwrap();
        assert_eq!(svelte_kit_version(&src).as_deref(), Some("2"));

        // An unparseable range is skipped for the next manifest up the chain.
        std::fs::write(
            dir.join("app/package.json"),
            r#"{"dependencies":{"@sveltejs/kit":"workspace:*"}}"#,
        )
        .unwrap();
        assert_eq!(svelte_kit_version(&src).as_deref(), Some("2"));

        // An installed package's version wins over every declared range.
        let module = dir.join("node_modules/@sveltejs/kit");
        std::fs::create_dir_all(&module).unwrap();
        std::fs::write(module.join("package.json"), r#"{"version":"3.1.0"}"#).unwrap();
        assert_eq!(svelte_kit_version(&src).as_deref(), Some("3"));

        // ...unless its version does not parse, which falls back to the manifests.
        std::fs::write(module.join("package.json"), r#"{"version":"x"}"#).unwrap();
        assert_eq!(svelte_kit_version(&src).as_deref(), Some("2"));

        std::fs::write(
            dir.join("app/package.json"),
            r#"{"name":"eslint-plugin-svelte","devDependencies":{"@sveltejs/kit":"^3.0.0"}}"#,
        )
        .unwrap();
        assert_eq!(svelte_kit_version(&src).as_deref(), Some("2"));
        let _ = std::fs::remove_dir_all(&dir);
    }
}
