//! Integration coverage for issue #1034 — `svelte-check` must honour the
//! Svelte `compilerOptions` declared in project config, including the
//! `experimental.async` flag that SvelteKit projects increasingly place
//! in the `vite.config.{js,ts}` Svelte-plugin call rather than in
//! `svelte.config.js`.
//!
//! Before the fix, the runner compiled every file with default
//! `CompileOptions`, so a component using top-level `await` always
//! produced the `experimental_async` analysis error regardless of the
//! project's config.
//!
//! Run with:
//!     cargo test --test svelte_check_compiler_options

use std::path::{Path, PathBuf};

use rsvelte_core::svelte_check::diagnostic::DiagnosticSeverity;
use rsvelte_core::svelte_check::{RunOptions, run};

/// A unique temp workspace seeded with a component that uses top-level
/// `await` (which requires `experimental.async`).
fn workspace_with_async_component(tag: &str) -> PathBuf {
    let dir = std::env::temp_dir().join(format!("rsvelte_1034_{tag}_{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&dir);
    std::fs::create_dir_all(dir.join("src/routes")).unwrap();
    std::fs::write(
        dir.join("src/routes/+page.svelte"),
        "<script>\n  let x = await Promise.resolve(1);\n</script>\n<p>{x}</p>\n",
    )
    .unwrap();
    dir
}

fn write(dir: &Path, name: &str, body: &str) {
    std::fs::write(dir.join(name), body).unwrap();
}

fn svelte_errors(dir: &Path) -> Vec<String> {
    let opts = RunOptions {
        workspace: dir.to_path_buf(),
        ..RunOptions::default()
    };
    let result = run(&opts);
    result
        .diagnostics
        .iter()
        .filter(|d| d.source == "svelte" && d.severity == DiagnosticSeverity::Error)
        .map(|d| d.message.clone())
        .collect()
}

#[test]
fn without_config_top_level_await_errors() {
    // Baseline: with no config the default `experimental.async = false`
    // applies, so the compiler must flag the top-level await.
    let dir = workspace_with_async_component("noconfig");
    let errors = svelte_errors(&dir);
    assert!(
        errors.iter().any(|m| m.contains("experimental_async")),
        "expected an experimental_async error with no config, got: {errors:#?}"
    );
    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn experimental_async_from_svelte_config_clears_error() {
    let dir = workspace_with_async_component("svelteconfig");
    write(
        &dir,
        "svelte.config.js",
        "export default { compilerOptions: { experimental: { async: true } } };",
    );
    let errors = svelte_errors(&dir);
    assert!(
        errors.is_empty(),
        "experimental.async in svelte.config.js should clear the error, got: {errors:#?}"
    );
    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn experimental_async_from_vite_plugin_clears_error() {
    // The crux of issue #1034: the option lives only in the vite-plugin
    // call, not svelte.config.js.
    let dir = workspace_with_async_component("viteconfig");
    write(
        &dir,
        "vite.config.ts",
        r#"import { svelte } from '@sveltejs/vite-plugin-svelte';
        import { defineConfig } from 'vite';
        export default defineConfig({
            plugins: [svelte({ compilerOptions: { experimental: { async: true } } })]
        });"#,
    );
    let errors = svelte_errors(&dir);
    assert!(
        errors.is_empty(),
        "experimental.async in the vite plugin call should clear the error, got: {errors:#?}"
    );
    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn experimental_async_from_sveltekit_plugin_clears_error() {
    // SvelteKit 2.62.0 lets the option live in the `sveltekit()` plugin
    // call in vite.config rather than in svelte.config.js / a `svelte()`
    // call. svelte-check must honour it the same way.
    let dir = workspace_with_async_component("sveltekitconfig");
    write(
        &dir,
        "vite.config.ts",
        r#"import { sveltekit } from '@sveltejs/kit/vite';
        import { defineConfig } from 'vite';
        export default defineConfig({
            plugins: [sveltekit({ compilerOptions: { experimental: { async: true } } })]
        });"#,
    );
    let errors = svelte_errors(&dir);
    assert!(
        errors.is_empty(),
        "experimental.async in the sveltekit() plugin call should clear the error, got: {errors:#?}"
    );
    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn incremental_cache_invalidates_when_config_changes() {
    // First incremental run with no config caches the experimental_async
    // error; adding a vite.config that enables async must invalidate that
    // cache (the `.svelte` source mtime/size is unchanged).
    let dir = workspace_with_async_component("incremental");

    let opts = RunOptions {
        workspace: dir.clone(),
        incremental: true,
        ..RunOptions::default()
    };
    let first = run(&opts);
    assert!(
        first
            .diagnostics
            .iter()
            .any(|d| d.message.contains("experimental_async")),
        "first incremental run should record the error"
    );

    write(
        &dir,
        "vite.config.js",
        r#"import { svelte } from '@sveltejs/vite-plugin-svelte';
        export default { plugins: [svelte({ compilerOptions: { experimental: { async: true } } })] };"#,
    );
    let second = run(&opts);
    let errors: Vec<_> = second
        .diagnostics
        .iter()
        .filter(|d| d.source == "svelte" && d.severity == DiagnosticSeverity::Error)
        .collect();
    assert!(
        errors.is_empty(),
        "second incremental run must invalidate the stale cache after the config change, got: {errors:#?}"
    );

    let _ = std::fs::remove_dir_all(&dir);
}
