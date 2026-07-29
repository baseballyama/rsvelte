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

use rsvelte_check::{RunOptions, run};

/// The current directory is process-wide while tests run in parallel, so every
/// test that has to exercise a CLI-relative path takes this first. The other
/// tests here drive `run` with an absolute workspace and tsconfig, which never
/// consults the CWD.
static CWD_LOCK: std::sync::Mutex<()> = std::sync::Mutex::new(());

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
fn external_package_self_referential_alias_import_is_rewritten_to_its_own_shadow() {
    // #1887: `SelectionMenu.svelte` (in sibling package B) imports its own
    // sibling `Input.svelte` through the SAME public alias (`$lib/...`) that
    // package A's tsconfig also defines — a common monorepo pattern where a
    // design-system package imports its own components via the alias its
    // consumers use, not a relative path. Without rewriting that import
    // inside B's own emitted shadow, `Input` stays unresolved there and any
    // `ComponentProps<typeof Input>` a consumer computes through
    // `SelectionMenu` collapses to the ambient wildcard.
    let root = target_dir("_xpkg1887");

    let b = root.join("pkgB");
    fs::create_dir_all(b.join("src")).unwrap();
    fs::write(
        b.join("package.json"),
        r#"{ "name": "@scope/design-system", "version": "0.0.0" }"#,
    )
    .unwrap();
    fs::write(
        b.join("src/input.svelte"),
        "<script lang=\"ts\">interface Props { onChange?: (v: string) => void }\nlet { onChange }: Props = $props();</script>\n<input />\n",
    )
    .unwrap();
    fs::write(
        b.join("src/selection-menu.svelte"),
        "<script lang=\"ts\">import Input from '$lib/input.svelte';</script>\n<Input />\n",
    )
    .unwrap();

    let a = root.join("pkgA");
    fs::create_dir_all(a.join("src")).unwrap();
    fs::create_dir_all(a.join("node_modules/@scope")).unwrap();
    fs::write(
        a.join("tsconfig.json"),
        r#"{ "compilerOptions": { "moduleResolution": "bundler", "paths": { "$lib/*": ["../pkgB/src/*"] } }, "include": ["**/*.ts", "**/*.svelte"] }"#,
    )
    .unwrap();
    fs::write(
        a.join("src/uses.svelte"),
        "<script lang=\"ts\">import SelectionMenu from '@scope/design-system/selection-menu.svelte';</script>\n<SelectionMenu />\n",
    )
    .unwrap();
    symlink(
        Path::new("../../../pkgB/src"),
        a.join("node_modules/@scope/design-system"),
    )
    .unwrap();

    let result = run(&RunOptions {
        workspace: a.clone(),
        emit_overlay: true,
        tsconfig: Some(a.join("tsconfig.json")),
        ..RunOptions::default()
    });
    let layout = result.overlay.expect("overlay should be materialised");
    let ext_root = layout.cache_dir.join("ext");

    let selection_menu_tsx =
        find_shadow(&ext_root, "selection-menu.svelte.tsx").unwrap_or_else(|| {
            panic!(
                "no external selection-menu.svelte.tsx under {}",
                ext_root.display()
            )
        });
    let tsx_code = fs::read_to_string(&selection_menu_tsx).unwrap();
    assert!(
        !tsx_code.contains("'$lib/input.svelte'") && !tsx_code.contains("\"$lib/input.svelte\""),
        "self-referential alias import should have been rewritten to a relative shadow path:\n{tsx_code}"
    );
    assert!(
        tsx_code.contains("input.svelte.tsx"),
        "rewritten specifier should still point at Input's own shadow:\n{tsx_code}"
    );
}

/// A bare package specifier deep-importing a `.svelte` file from a symlinked
/// sibling (`import X from 'libs/components/x.svelte'`) has to be rewritten to
/// the mirror shadow: `rootDirs` only bridges relative specifiers. The CLI is
/// documented as `--workspace .`, which makes every walked source path
/// relative — and a relative resolution base has no parent to climb, so the
/// resolver's `node_modules` walk-up never reaches the symlink.
#[test]
fn bare_deep_specifier_is_rewritten_under_a_relative_workspace() {
    let root = target_dir("_xpkg1900");

    let libs = root.join("pkg-libs");
    fs::create_dir_all(libs.join("src/components")).unwrap();
    fs::write(
        libs.join("package.json"),
        r#"{ "name": "libs", "version": "0.0.0", "type": "module", "exports": { "./components/*": "./src/components/*" } }"#,
    )
    .unwrap();
    fs::write(
        libs.join("src/components/survey-options.svelte"),
        "<script module lang=\"ts\">export type WithOther<T extends string> = T | `OTHER: ${string}`;</script>\n<script lang=\"ts\">let { id }: { id: string } = $props();</script>\n<div>{id}</div>\n",
    )
    .unwrap();

    let a = root.join("pkg-a");
    fs::create_dir_all(a.join("src")).unwrap();
    fs::create_dir_all(a.join("node_modules")).unwrap();
    fs::write(
        a.join("package.json"),
        r#"{ "name": "pkg-a", "version": "0.0.0", "type": "module" }"#,
    )
    .unwrap();
    fs::write(
        a.join("tsconfig.json"),
        r#"{ "compilerOptions": { "moduleResolution": "bundler" }, "include": ["src/**/*.svelte"] }"#,
    )
    .unwrap();
    fs::write(
        a.join("src/deep.svelte"),
        "<script lang=\"ts\">import SurveyOptions, { type WithOther } from 'libs/components/survey-options.svelte';\nconst answer: WithOther<'a'> = 'OTHER: c';</script>\n<SurveyOptions id={answer} />\n",
    )
    .unwrap();
    symlink(Path::new("../../pkg-libs"), a.join("node_modules/libs")).unwrap();

    let _cwd_guard = CWD_LOCK.lock().unwrap_or_else(|e| e.into_inner());
    let cwd = std::env::current_dir().unwrap();
    std::env::set_current_dir(&a).unwrap();
    let result = run(&RunOptions {
        workspace: PathBuf::from("."),
        emit_overlay: true,
        tsconfig: Some(PathBuf::from("./tsconfig.json")),
        ..RunOptions::default()
    });
    std::env::set_current_dir(&cwd).unwrap();

    result.overlay.expect("overlay should be materialised");
    // `emit_dir` is relative to the (now restored) CWD, so re-anchor on `a`.
    let deep_tsx = fs::read_to_string(a.join(".svelte-check/svelte/src/deep.svelte.tsx")).unwrap();
    assert!(
        !deep_tsx.contains("'libs/components/survey-options.svelte'"),
        "bare deep specifier was not rewritten:\n{deep_tsx}"
    );
    assert!(
        deep_tsx.contains("ext/0/src/components/survey-options.svelte.tsx"),
        "bare deep specifier should point at the sibling's mirror shadow:\n{deep_tsx}"
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

#[test]
fn external_package_alias_is_never_repointed_at_the_consumers_own_component() {
    // `$lib` is SvelteKit's own convention, so a consumer and an external
    // package routinely both define it — pointing at their own sources.
    // Resolving the package's `$lib/input.svelte` with the CONSUMER's `paths`
    // would silently swap in the consumer's unrelated component; the package's
    // own tsconfig has to win, and a target outside the package is rejected.
    let root = target_dir("_xpkg_alias_collision");

    let b = root.join("pkgB");
    fs::create_dir_all(b.join("src/lib")).unwrap();
    fs::write(
        b.join("package.json"),
        r#"{ "name": "@scope/ds", "version": "0.0.0" }"#,
    )
    .unwrap();
    fs::write(
        b.join("tsconfig.json"),
        r#"{ "compilerOptions": { "moduleResolution": "bundler", "paths": { "$lib/*": ["./src/lib/*"] } } }"#,
    )
    .unwrap();
    fs::write(
        b.join("src/lib/input.svelte"),
        "<script lang=\"ts\">let { fromB }: { fromB: number } = $props();</script>\n<input value={fromB} />\n",
    )
    .unwrap();
    fs::write(
        b.join("src/menu.svelte"),
        "<script lang=\"ts\">import Input from '$lib/input.svelte';</script>\n<Input fromB={1} />\n",
    )
    .unwrap();

    let a = root.join("pkgA");
    fs::create_dir_all(a.join("src/lib")).unwrap();
    fs::create_dir_all(a.join("node_modules/@scope")).unwrap();
    fs::write(
        a.join("tsconfig.json"),
        r#"{ "compilerOptions": { "moduleResolution": "bundler", "paths": { "$lib/*": ["./src/lib/*"] } }, "include": ["**/*.ts", "**/*.svelte"] }"#,
    )
    .unwrap();
    fs::write(
        a.join("src/lib/input.svelte"),
        "<script lang=\"ts\">let { fromA }: { fromA: string } = $props();</script>\n<b>{fromA}</b>\n",
    )
    .unwrap();
    fs::write(
        a.join("src/uses.svelte"),
        "<script lang=\"ts\">import Menu from '@scope/ds/menu.svelte';</script>\n<Menu />\n",
    )
    .unwrap();
    symlink(
        Path::new("../../../pkgB/src"),
        a.join("node_modules/@scope/ds"),
    )
    .unwrap();

    let result = run(&RunOptions {
        workspace: a.clone(),
        emit_overlay: true,
        tsconfig: Some(a.join("tsconfig.json")),
        ..RunOptions::default()
    });
    let layout = result.overlay.expect("overlay should be materialised");
    let menu = find_shadow(&layout.cache_dir.join("ext"), "menu.svelte.tsx")
        .expect("external menu.svelte shadow");
    let code = fs::read_to_string(&menu).unwrap();
    let import_line = code
        .lines()
        .find(|l| l.contains("input.svelte"))
        .unwrap_or_default();
    assert!(
        !import_line.contains("/svelte/src/lib/"),
        "package B's own $lib import was repointed at package A's component:\n{import_line}"
    );
    assert!(
        import_line.contains("input.svelte.tsx"),
        "package B's own $lib import should resolve to its own shadow:\n{import_line}"
    );
}

#[test]
fn external_package_alias_it_cannot_resolve_itself_is_left_alone() {
    // Same collision, but package B ships no tsconfig of its own, so there is
    // no correct mapping to fall back on. Leaving the specifier untouched (and
    // with it the ambient `*.svelte` fallback) is imprecise; rewriting it to
    // the consumer's unrelated component would be wrong.
    let root = target_dir("_xpkg_alias_unconfined");

    let b = root.join("pkgB");
    fs::create_dir_all(b.join("src/lib")).unwrap();
    fs::write(
        b.join("package.json"),
        r#"{ "name": "@scope/ds", "version": "0.0.0" }"#,
    )
    .unwrap();
    fs::write(
        b.join("src/lib/input.svelte"),
        "<script lang=\"ts\">let { fromB }: { fromB: number } = $props();</script>\n<input value={fromB} />\n",
    )
    .unwrap();
    fs::write(
        b.join("src/menu.svelte"),
        "<script lang=\"ts\">import Input from '$lib/input.svelte';</script>\n<Input fromB={1} />\n",
    )
    .unwrap();

    let a = root.join("pkgA");
    fs::create_dir_all(a.join("src/lib")).unwrap();
    fs::create_dir_all(a.join("node_modules/@scope")).unwrap();
    fs::write(
        a.join("tsconfig.json"),
        r#"{ "compilerOptions": { "moduleResolution": "bundler", "paths": { "$lib/*": ["./src/lib/*"] } }, "include": ["**/*.ts", "**/*.svelte"] }"#,
    )
    .unwrap();
    fs::write(
        a.join("src/lib/input.svelte"),
        "<script lang=\"ts\">let { fromA }: { fromA: string } = $props();</script>\n<b>{fromA}</b>\n",
    )
    .unwrap();
    fs::write(
        a.join("src/uses.svelte"),
        "<script lang=\"ts\">import Menu from '@scope/ds/menu.svelte';</script>\n<Menu />\n",
    )
    .unwrap();
    symlink(
        Path::new("../../../pkgB/src"),
        a.join("node_modules/@scope/ds"),
    )
    .unwrap();

    let result = run(&RunOptions {
        workspace: a.clone(),
        emit_overlay: true,
        tsconfig: Some(a.join("tsconfig.json")),
        ..RunOptions::default()
    });
    let layout = result.overlay.expect("overlay should be materialised");
    let menu = find_shadow(&layout.cache_dir.join("ext"), "menu.svelte.tsx")
        .expect("external menu.svelte shadow");
    let code = fs::read_to_string(&menu).unwrap();
    let import_line = code
        .lines()
        .find(|l| l.contains("input.svelte"))
        .unwrap_or_default();
    assert!(
        import_line.contains("$lib/input.svelte"),
        "an alias with no in-package resolution must keep its original specifier:\n{import_line}"
    );
}
