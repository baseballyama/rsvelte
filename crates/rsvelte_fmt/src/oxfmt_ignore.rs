//! oxfmt-compatible ignore resolution for the in-process `.svelte` walker.
//!
//! `rsvelte-fmt` formats `.svelte` files itself and delegates every other file
//! to `oxfmt`. `oxfmt` already honors `.gitignore`, `.prettierignore`, and the
//! `.oxfmtrc` `ignorePatterns` field, so the `.svelte` walker must apply the
//! *same* rules — otherwise a `.svelte` file excluded via `ignorePatterns`
//! (e.g. a test fixture) would be reformatted by us but skipped by `oxfmt`.
//!
//! `.oxfmtrc`'s `ignorePatterns` is parsed by [`crate::config`]; this module
//! turns it (plus `.prettierignore`) into gitignore-style matchers and wires up
//! the shared `.gitignore` walk settings. The logic is ported (both projects
//! are MIT) from oxc so the behavior matches `oxfmt .` exactly:
//! - `oxc_config::walk` → [`configure_walk_builder`], [`all_paths_have_vcs_boundary`]
//! - `oxfmt`'s `cli::resolve` → global ignore matchers + [`is_ignored`]
//! - `oxfmt`'s `core::config::build_ignore_glob` → the `ignorePatterns` matcher
//! - `oxfmt`'s `cli::walk::is_ignored_dir` → [`is_ignored_dir`]
//!
//! Upstream: <https://github.com/oxc-project/oxc> (apps/oxfmt, crates/oxc_config).

use std::collections::HashMap;
use std::ffi::OsStr;
use std::path::{Path, PathBuf};

use anyhow::{Result, anyhow};
use ignore::WalkBuilder;
use ignore::gitignore::{Gitignore, GitignoreBuilder};

use crate::config::OxfmtConfig;

/// Global ignore matchers (`.prettierignore` + `.oxfmtrc` `ignorePatterns`)
/// applied to `.svelte` files during the walk, mirroring what `oxfmt` builds
/// for the same inputs. `.gitignore` itself is handled by the [`WalkBuilder`]
/// (see [`configure_walk_builder`]), not here.
pub struct SvelteIgnore {
    matchers: Vec<Gitignore>,
}

impl SvelteIgnore {
    /// Build matchers from `.prettierignore` (in `cwd`) and the resolved
    /// `.oxfmtrc` `ignorePatterns` (rooted at the config file's directory).
    pub fn from_config(cwd: &Path, cfg: &OxfmtConfig) -> Result<Self> {
        let mut matchers = Vec::new();

        // 1. `.prettierignore` in cwd — oxfmt's default formatter ignore file.
        let prettierignore = cwd.join(".prettierignore");
        if prettierignore.is_file() {
            let (gitignore, err) = Gitignore::new(&prettierignore);
            if let Some(err) = err {
                return Err(anyhow!(
                    "failed to parse {}: {err}",
                    prettierignore.display()
                ));
            }
            matchers.push(gitignore);
        }

        // 2. `.oxfmtrc` `ignorePatterns`, rooted at the config file's directory.
        if let Some(config_dir) = cfg.config_dir()
            && !cfg.ignore_patterns.is_empty()
        {
            let mut builder = GitignoreBuilder::new(config_dir);
            for pattern in &cfg.ignore_patterns {
                builder
                    .add_line(None, pattern)
                    .map_err(|e| anyhow!("invalid `ignorePatterns` entry `{pattern}`: {e}"))?;
            }
            let gitignore = builder
                .build()
                .map_err(|e| anyhow!("failed to build `ignorePatterns` matcher: {e}"))?;
            matchers.push(gitignore);
        }

        Ok(Self { matchers })
    }

    /// Whether `path` is ignored by any matcher. Ancestor directories are also
    /// checked, since walk entries are matched individually rather than strictly
    /// top-down.
    pub fn is_ignored(&self, path: &Path, is_dir: bool) -> bool {
        is_ignored(&self.matchers, path, is_dir)
    }
}

/// Ported from oxfmt `cli::resolve::is_ignored` (ancestor-checking variant).
/// A path is ignored if any matcher ignores it and that same matcher does not
/// whitelist it.
fn is_ignored(matchers: &[Gitignore], path: &Path, is_dir: bool) -> bool {
    for matcher in matchers {
        // `matched_path_or_any_parents` panics if `path` is not under the
        // matcher's root, so skip matchers whose root doesn't contain `path`.
        if !path.starts_with(matcher.path()) {
            continue;
        }
        let matched = matcher.matched_path_or_any_parents(path, is_dir);
        if matched.is_ignore() && !matched.is_whitelist() {
            return true;
        }
    }
    false
}

// ─── walk configuration (ported from `oxc_config::walk`) ─────────────────────

/// Ported from `oxc_config::configure_walk_builder`. Applies the gitignore
/// settings shared by oxlint and oxfmt so the `.svelte` walk honors the same
/// `.gitignore` / parent-gitignore / `.git/info/exclude` rules as `oxfmt .`.
pub fn configure_walk_builder(
    builder: &mut WalkBuilder,
    has_vcs_boundary: bool,
) -> &mut WalkBuilder {
    builder
        // Include hidden files; VCS dirs are skipped separately.
        .hidden(false)
        // Ignore generic `.ignore` files.
        .ignore(false)
        // Ignore the user's global gitignore.
        .git_global(false)
        // Respect repository-local (nested) `.gitignore` files.
        .git_ignore(true)
        // Also look up parent directories.
        .parents(true)
        // Respect `.git/info/exclude` as well.
        .git_exclude(true)
        // Parent `.gitignore` lookup stops at the repo boundary when inside one.
        .require_git(has_vcs_boundary)
}

/// Ported from `oxc_config::all_paths_have_vcs_boundary`. Returns `true` when
/// every path is inside a Git or Jujutsu repository.
pub fn all_paths_have_vcs_boundary(paths: &[PathBuf], cwd: &Path) -> bool {
    let mut cache = HashMap::new();
    paths
        .iter()
        .all(|path| has_vcs_boundary(path, cwd, &mut cache))
}

fn has_vcs_boundary(path: &Path, cwd: &Path, cache: &mut HashMap<PathBuf, bool>) -> bool {
    let path = if path.is_absolute() {
        path.to_path_buf()
    } else {
        cwd.join(path)
    };
    let start = if path.is_file() {
        path.parent().unwrap_or(&path)
    } else {
        path.as_path()
    };
    start.ancestors().any(|dir| {
        if let Some(&has) = cache.get(dir) {
            return has;
        }
        let has = dir.join(".git").exists() || dir.join(".jj").exists();
        cache.insert(dir.to_path_buf(), has);
        has
    })
}

/// Ported from oxfmt `cli::walk::is_ignored_dir`. VCS internal directories are
/// always skipped; `node_modules` is skipped because we never format it.
pub fn is_ignored_dir(dir_name: &OsStr) -> bool {
    matches!(
        dir_name.to_str(),
        Some(".git" | ".jj" | ".sl" | ".svn" | ".hg" | "node_modules")
    )
}
