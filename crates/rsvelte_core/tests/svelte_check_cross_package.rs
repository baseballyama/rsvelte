//! Regression test for issue #782.
//!
//! A `.svelte` component in another workspace package — reachable through that
//! package's `node_modules` symlink and its `exports` barrel — used to resolve
//! to the ambient `declare module '*.svelte'` (default-only) under `--tsgo`, so
//! its `<script module>` named exports / `export { default }` re-exports were
//! reported missing (`Module '"*.svelte"' has no exported member 'X'`).
//!
//! The overlay now discovers workspace-sibling packages via `node_modules`
//! symlinks, emits `.tsx`/`.d.ts` shadows for their `.svelte` files into a
//! per-package cache mirror (`.svelte-check/ext/<n>/…`), and adds a `rootDirs`
//! pair bridging the package's real source dir to that mirror — so the
//! cross-package import resolves to the component's real module.
//!
//! This test asserts the overlay *mechanism* (shadow emission + `rootDirs`
//! bridge), which needs neither `tsgo` nor an installed `svelte`, so it runs on
//! CI. End-to-end resolution was verified separately against real `tsgo`.

#![cfg(unix)]

use std::fs;
use std::os::unix::fs::symlink;
use std::path::{Path, PathBuf};

use rsvelte_core::svelte_check::{RunOptions, run};

fn target_dir(name: &str) -> PathBuf {
    let base = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../../target")
        .join(name);
    let _ = fs::remove_dir_all(&base);
    fs::create_dir_all(&base).unwrap();
    base
}

fn find_shadow(ext_root: &Path, name: &str) -> Option<PathBuf> {
    let mut stack = vec![ext_root.to_path_buf()];
    while let Some(dir) = stack.pop() {
        let Ok(rd) = fs::read_dir(&dir) else { continue };
        for e in rd.flatten() {
            let p = e.path();
            if p.is_dir() {
                stack.push(p);
            } else if p.file_name().and_then(|s| s.to_str()) == Some(name) {
                return Some(p);
            }
        }
    }
    None
}

#[test]
fn cross_package_svelte_gets_shadow_and_rootdirs_bridge() {
    let root = target_dir("_xpkg782");

    // Sibling package B with a module-context named export.
    let b = root.join("pkgB");
    fs::create_dir_all(b.join("src/sidebar")).unwrap();
    fs::write(
        b.join("package.json"),
        r#"{ "name": "@scope/design-system", "version": "0.0.0", "type": "module", "exports": { "./components": "./src/components/index.ts" } }"#,
    )
    .unwrap();
    fs::write(
        b.join("src/sidebar/Sidebar.svelte"),
        "<script module lang=\"ts\">export const SIDEBAR_DEFAULT_WIDTH = 256 as const;</script>\n<script lang=\"ts\"></script>\n<div></div>\n",
    )
    .unwrap();

    // Package A (checked) imports B through a node_modules symlink.
    let a = root.join("pkgA");
    fs::create_dir_all(a.join("src")).unwrap();
    fs::create_dir_all(a.join("node_modules/@scope")).unwrap();
    fs::write(
        a.join("tsconfig.json"),
        r#"{ "compilerOptions": { "moduleResolution": "bundler", "allowArbitraryExtensions": true }, "include": ["**/*.ts", "**/*.svelte"] }"#,
    )
    .unwrap();
    fs::write(
        a.join("src/Uses.svelte"),
        "<script lang=\"ts\">import { SIDEBAR_DEFAULT_WIDTH } from '@scope/design-system/components';</script>\n<div>{SIDEBAR_DEFAULT_WIDTH}</div>\n",
    )
    .unwrap();
    symlink(
        Path::new("../../../pkgB"),
        a.join("node_modules/@scope/design-system"),
    )
    .unwrap();

    let result = run(&RunOptions {
        workspace: a.clone(),
        emit_overlay: true,
        ..RunOptions::default()
    });
    let layout = result.overlay.expect("overlay should be materialised");
    let ext_root = layout.cache_dir.join("ext");

    // 1. A shadow .tsx + .d.ts were emitted for the sibling's Sidebar.svelte.
    let tsx = find_shadow(&ext_root, "Sidebar.svelte.tsx").unwrap_or_else(|| {
        panic!(
            "no external Sidebar.svelte.tsx under {}",
            ext_root.display()
        )
    });
    assert!(
        find_shadow(&ext_root, "Sidebar.svelte.d.ts").is_some(),
        "external Sidebar.svelte.d.ts missing under {}",
        ext_root.display()
    );

    // 2. The shadow preserves the module-context named export.
    let tsx_code = fs::read_to_string(&tsx).unwrap();
    assert!(
        tsx_code.contains("SIDEBAR_DEFAULT_WIDTH"),
        "external shadow dropped the named export:\n{tsx_code}"
    );

    // 3. The overlay tsconfig bridges the sibling's real dir to the mirror via
    //    rootDirs (so `@scope/design-system/...` -> Sidebar.svelte resolves).
    let cfg = fs::read_to_string(layout.cache_dir.join("tsconfig.json")).unwrap();
    assert!(
        cfg.contains("\"ext/0\""),
        "mirror dir not in rootDirs:\n{cfg}"
    );
    assert!(
        cfg.contains("pkgB"),
        "sibling real dir not bridged in rootDirs:\n{cfg}"
    );
}

#[test]
fn no_external_packages_leaves_overlay_unchanged() {
    // Guard: a plain single-package workspace (no node_modules sibling links)
    // emits no `ext/` mirror and no extra rootDirs entries.
    let ws = target_dir("_xpkg782_plain");
    fs::write(
        ws.join("tsconfig.json"),
        r#"{ "compilerOptions": { "moduleResolution": "bundler" }, "include": ["**/*.svelte"] }"#,
    )
    .unwrap();
    fs::write(
        ws.join("A.svelte"),
        "<script lang=\"ts\"></script>\n<div></div>\n",
    )
    .unwrap();

    let result = run(&RunOptions {
        workspace: ws.clone(),
        emit_overlay: true,
        ..RunOptions::default()
    });
    let layout = result.overlay.expect("overlay should be materialised");
    assert!(
        !layout.cache_dir.join("ext").exists(),
        "no external packages → no ext/ mirror dir should be created"
    );
}
