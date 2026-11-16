//! A component is linted with its project's `compilerOptions`: with
//! `experimental.async` on, top-level `await` is no analysis error, so the
//! compiler's warnings for the rest of the component are still reported.

use std::path::{Path, PathBuf};
use std::process::Command;

use rsvelte_lint::{LintConfig, ProjectOptionsCache, lint_file_messages};

const ASYNC_COMPONENT: &str = "<script>\n\tconst data = await fetch('/x').then((r) => r.json());\n</script>\n\n<img src=\"a.png\" />\n<p>{data}</p>\n";

const ENABLE_ASYNC: &str = r"import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit({ compilerOptions: { experimental: { async: true } } })]
});
";

const PLAIN_VITE: &str = r"import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({ plugins: [sveltekit()] });
";

fn temp_dir(tag: &str) -> PathBuf {
    let dir = std::env::temp_dir().join(format!(
        "rsvelte_lint_project_compiler_options_{tag}_{}",
        std::process::id()
    ));
    let _ = std::fs::remove_dir_all(&dir);
    std::fs::create_dir_all(&dir).unwrap();
    dir
}

/// An app with a `vite.config.ts` and one async component, returning the
/// component's path.
fn app(root: &Path, name: &str, vite_config: &str) -> PathBuf {
    let dir = root.join(name);
    std::fs::create_dir_all(dir.join("src/routes")).unwrap();
    std::fs::write(dir.join("vite.config.ts"), vite_config).unwrap();
    let component = dir.join("src/routes/+page.svelte");
    std::fs::write(&component, ASYNC_COMPONENT).unwrap();
    component
}

fn codes(file: &Path) -> Vec<String> {
    let cache = ProjectOptionsCache::default();
    lint_file_messages(file, &cache.for_file(file), &LintConfig::recommended())
        .unwrap()
        .into_iter()
        .filter_map(|m| m.diagnostic.code)
        .collect()
}

#[test]
fn async_enabled_in_vite_config_lints_like_any_component() {
    let root = temp_dir("enabled");
    let codes = codes(&app(&root, "app", ENABLE_ASYNC));
    assert!(
        !codes.iter().any(|c| c == "experimental_async"),
        "experimental.async is on, got {codes:?}"
    );
    assert!(
        codes.iter().any(|c| c == "a11y_missing_attribute"),
        "compiler warnings must still be reported, got {codes:?}"
    );
    let _ = std::fs::remove_dir_all(&root);
}

#[test]
fn async_not_enabled_is_still_an_analysis_error() {
    let root = temp_dir("disabled");
    let codes = codes(&app(&root, "app", PLAIN_VITE));
    assert!(
        codes.iter().any(|c| c == "experimental_async"),
        "experimental.async is off, got {codes:?}"
    );
    let _ = std::fs::remove_dir_all(&root);
}

/// `rsvelte-lint .` at a monorepo root lints each app with its own config.
#[test]
fn cli_resolves_each_apps_config_from_a_monorepo_root() {
    let root = temp_dir("cli");
    app(&root, "apps/enabled", ENABLE_ASYNC);
    app(&root, "apps/disabled", PLAIN_VITE);

    let output = Command::new(env!("CARGO_BIN_EXE_rsvelte-lint"))
        .args(["--format", "machine-verbose", "."])
        .current_dir(&root)
        .output()
        .unwrap();
    let stdout = String::from_utf8(output.stdout).unwrap();
    let lines_for = |app: &str| -> Vec<&str> {
        stdout
            .lines()
            .filter(|line| line.contains(&format!("apps/{app}/")))
            .collect()
    };

    let enabled = lines_for("enabled");
    assert!(
        !enabled.iter().any(|l| l.contains("experimental_async")),
        "{stdout}"
    );
    assert!(
        enabled.iter().any(|l| l.contains("a11y_missing_attribute")),
        "{stdout}"
    );
    assert!(
        lines_for("disabled")
            .iter()
            .any(|l| l.contains("experimental_async")),
        "{stdout}"
    );
    let _ = std::fs::remove_dir_all(&root);
}
