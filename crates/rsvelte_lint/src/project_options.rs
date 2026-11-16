//! The Svelte `compilerOptions` a linted file's project declares.
//!
//! eslint-plugin-svelte compiles with the `runes` and `experimental.async` of
//! the nearest `svelte.config.js` above the file. Here the same two options
//! come from rsvelte-check's reader, so a `SvelteKit` project that passes them
//! to `sveltekit({ compilerOptions })` in `vite.config.*` is linted with them
//! too. The project is found per file, so one run over a monorepo root lints
//! each app with its own config.

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex, PoisonError};

use rsvelte_core::CompileOptions;
use rsvelte_core::compiler::ExperimentalOptions;
use rsvelte_svelte_config::compiler_options::{
    CompilerOptionsSettings, has_project_config, load_compiler_options,
};

/// The nearest directory at or above `start` holding a `svelte.config.*` or
/// `vite.config.*`.
#[must_use]
pub fn find_project_dir(start: &Path) -> Option<&Path> {
    start.ancestors().find(|dir| has_project_config(dir))
}

/// The compile options for files under `dir`, read from its project's config;
/// the defaults when there is none.
#[must_use]
pub fn compile_options_for_dir(dir: &Path) -> CompileOptions {
    find_project_dir(dir).map_or_else(CompileOptions::default, |project| {
        to_compile_options(&load_compiler_options(project))
    })
}

fn to_compile_options(settings: &CompilerOptionsSettings) -> CompileOptions {
    CompileOptions {
        experimental: ExperimentalOptions {
            r#async: settings.experimental_async,
        },
        runes: settings.runes,
        ..CompileOptions::default()
    }
}

/// [`compile_options_for_dir`], memoised per directory and per project so a
/// run over many files reads each config once. Safe to share across threads.
#[derive(Default)]
pub struct ProjectOptionsCache {
    inner: Mutex<CacheMaps>,
}

#[derive(Default)]
struct CacheMaps {
    by_dir: HashMap<PathBuf, Arc<CompileOptions>>,
    by_project: HashMap<PathBuf, Arc<CompileOptions>>,
}

impl ProjectOptionsCache {
    /// The compile options for `file`, discovered upward from its directory.
    pub fn for_file(&self, file: &Path) -> Arc<CompileOptions> {
        // A relative path's parents stop at the working directory.
        let file = std::path::absolute(file).unwrap_or_else(|_| file.to_path_buf());
        self.for_dir(file.parent().unwrap_or(Path::new("")))
    }

    /// The compile options for files directly under `dir`.
    pub fn for_dir(&self, dir: &Path) -> Arc<CompileOptions> {
        let mut maps = self.inner.lock().unwrap_or_else(PoisonError::into_inner);
        if let Some(options) = maps.by_dir.get(dir) {
            return Arc::clone(options);
        }
        let options = match find_project_dir(dir) {
            Some(project) => match maps.by_project.get(project) {
                Some(options) => Arc::clone(options),
                None => {
                    let options = Arc::new(to_compile_options(&load_compiler_options(project)));
                    maps.by_project
                        .insert(project.to_path_buf(), Arc::clone(&options));
                    options
                }
            },
            None => Arc::new(CompileOptions::default()),
        };
        maps.by_dir.insert(dir.to_path_buf(), Arc::clone(&options));
        options
    }

    /// Forget every resolved config, e.g. after one changed on disk.
    pub fn clear(&self) {
        let mut maps = self.inner.lock().unwrap_or_else(PoisonError::into_inner);
        maps.by_dir.clear();
        maps.by_project.clear();
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn project(tag: &str) -> PathBuf {
        let dir = std::env::temp_dir().join(format!(
            "rsvelte_lint_project_options_{tag}_{}",
            std::process::id()
        ));
        let _ = std::fs::remove_dir_all(&dir);
        std::fs::create_dir_all(dir.join("src/routes")).unwrap();
        dir
    }

    fn write(dir: &Path, name: &str, body: &str) {
        std::fs::write(dir.join(name), body).unwrap();
    }

    #[test]
    fn reads_inline_sveltekit_compiler_options_from_vite_config() {
        let dir = project("vite_sveltekit");
        write(
            &dir,
            "vite.config.ts",
            r"import { sveltekit } from '@sveltejs/kit/vite';
            import { defineConfig } from 'vite';
            export default defineConfig({
                plugins: [sveltekit({ compilerOptions: { experimental: { async: true }, runes: true } })]
            });",
        );
        let options = compile_options_for_dir(&dir.join("src/routes"));
        assert!(options.experimental.r#async);
        assert_eq!(options.runes, Some(true));
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn reads_svelte_config() {
        let dir = project("svelte_config");
        write(
            &dir,
            "svelte.config.js",
            "export default { compilerOptions: { experimental: { async: true } } };",
        );
        let options = compile_options_for_dir(&dir.join("src/routes"));
        assert!(options.experimental.r#async);
        assert_eq!(options.runes, None);
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn defaults_without_a_config() {
        let dir = project("none");
        assert_eq!(find_project_dir(&dir.join("src/routes")), None);
        let options = compile_options_for_dir(&dir.join("src/routes"));
        assert!(!options.experimental.r#async);
        assert_eq!(options.runes, None);
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn each_file_gets_its_nearest_project() {
        let root = project("monorepo");
        let enabled = root.join("apps/enabled");
        let disabled = root.join("apps/disabled");
        for app in [&enabled, &disabled] {
            std::fs::create_dir_all(app.join("src")).unwrap();
        }
        write(
            &enabled,
            "vite.config.ts",
            "export default { plugins: [sveltekit({ compilerOptions: { experimental: { async: true } } })] };",
        );
        write(
            &disabled,
            "vite.config.ts",
            "export default { plugins: [sveltekit()] };",
        );
        // A config at the root must not leak into an app that has its own.
        write(
            &root,
            "svelte.config.js",
            "export default { compilerOptions: { experimental: { async: true } } };",
        );

        let cache = ProjectOptionsCache::default();
        assert!(
            cache
                .for_file(&enabled.join("src/App.svelte"))
                .experimental
                .r#async
        );
        assert!(
            !cache
                .for_file(&disabled.join("src/App.svelte"))
                .experimental
                .r#async
        );
        assert!(
            cache
                .for_file(&root.join("src/App.svelte"))
                .experimental
                .r#async
        );
        let _ = std::fs::remove_dir_all(&root);
    }
}
