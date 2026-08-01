//! Regression tests for the `Foo.svelte` + `Foo.svelte.{ts,js}` companion
//! split: #751 (named imports resolved *from* the companion) and the structural
//! half of #800 (the component module reached *through* the companion).
//!
//! A `Foo.svelte` component and a sibling companion module
//! `Foo.svelte.ts` (or `.js`) collide on the same TypeScript basename:
//! `import X from './Foo.svelte'` and `import { y } from './Foo.svelte.js'`
//! both resolve to the single `Foo.svelte.{ts,tsx,d.ts}` family. The overlay
//! emits the component shadow as `Foo.svelte.tsx`; without special handling a
//! companion's named exports (`{ y }`) are invisible — TS reports a spurious
//! `TS2614: has no exported member 'y'`.
//!
//! The fix re-points the companion specifier at the real module, so the shadow
//! stays the component and nothing else. Folding the companion's exports into
//! the shadow instead would leak them into every `.svelte` specifier resolving
//! through it, where official svelte-check reports TS2614 (#2061).

use rsvelte_check::overlay::materialize_overlay;
use std::fs;
use std::path::PathBuf;

fn workspace(tag: &str) -> PathBuf {
    let ws = std::env::temp_dir().join(format!("svc_751_{}_{}", tag, std::process::id()));
    let _ = fs::remove_dir_all(&ws);
    fs::create_dir_all(&ws).unwrap();
    ws
}

fn read_tsx(ws: &std::path::Path, name: &str) -> String {
    fs::read_to_string(ws.join(".svelte-check/svelte").join(name)).unwrap()
}

#[test]
fn component_shadow_keeps_the_sibling_ts_companion_out() {
    let ws = workspace("ts");
    fs::write(
        ws.join("Tip.svelte.ts"),
        "export const tip = (x: number): number => x * 2;\n",
    )
    .unwrap();
    fs::write(
        ws.join("Tip.svelte"),
        "<script lang=\"ts\">let { n }: { n: number } = $props();</script>\n<p>{n}</p>\n",
    )
    .unwrap();

    let files = vec![ws.join("Tip.svelte")];
    materialize_overlay(&ws, &files, None).expect("overlay");

    let tsx = read_tsx(&ws, "Tip.svelte.tsx");
    // Default export (the component) is preserved …
    assert!(
        tsx.contains("export default Tip__SvelteComponent_;"),
        "component default export missing:\n{tsx}"
    );
    // … and the companion stays out of it, so a `.svelte` specifier resolving
    // through this shadow sees the component alone.
    assert!(
        !tsx.contains("Tip.svelte.js"),
        "companion folded into the component shadow:\n{tsx}"
    );
}

/// #751: the companion specifier itself (`./Tip.svelte.js`) resolves from the
/// shadow's own directory, where the component shadow answers it first. It is
/// rewritten to the real module so both halves stay reachable.
#[test]
fn companion_specifier_is_repointed_at_the_real_module() {
    let ws = workspace("spec");
    fs::write(ws.join("Tip.svelte.ts"), "export const tip = 1;\n").unwrap();
    fs::write(ws.join("Tip.svelte"), "<p>hi</p>\n").unwrap();
    fs::write(
        ws.join("User.svelte"),
        "<script lang=\"ts\">import { tip } from './Tip.svelte.js';</script>\n<p>{tip}</p>\n",
    )
    .unwrap();

    let files = vec![ws.join("Tip.svelte"), ws.join("User.svelte")];
    materialize_overlay(&ws, &files, None).expect("overlay");

    let tsx = read_tsx(&ws, "User.svelte.tsx");
    assert!(
        tsx.contains("'../../Tip.svelte.js'"),
        "companion specifier not repointed at the real module:\n{tsx}"
    );
}

#[test]
fn a_js_companion_specifier_is_repointed_too() {
    let ws = workspace("js");
    fs::write(ws.join("Tip.svelte.js"), "export const tip = 1;\n").unwrap();
    fs::write(ws.join("Tip.svelte"), "<p>hi</p>\n").unwrap();
    fs::write(
        ws.join("User.svelte"),
        "<script lang=\"ts\">import { tip } from './Tip.svelte.js';</script>\n<p>{tip}</p>\n",
    )
    .unwrap();

    let files = vec![ws.join("Tip.svelte"), ws.join("User.svelte")];
    materialize_overlay(&ws, &files, None).expect("overlay");

    let tsx = read_tsx(&ws, "User.svelte.tsx");
    assert!(
        tsx.contains("'../../Tip.svelte.js'"),
        "js companion specifier not repointed:\n{tsx}"
    );
}

/// With no component beside it, a `.svelte.ts` module keeps resolving through
/// `rootDirs` and must be left alone.
#[test]
fn a_rune_module_specifier_is_left_alone() {
    let ws = workspace("none");
    fs::write(ws.join("state.svelte.ts"), "export const n = 1;\n").unwrap();
    fs::write(
        ws.join("User.svelte"),
        "<script lang=\"ts\">import { n } from './state.svelte.js';</script>\n<p>{n}</p>\n",
    )
    .unwrap();

    let files = vec![ws.join("User.svelte")];
    materialize_overlay(&ws, &files, None).expect("overlay");

    let tsx = read_tsx(&ws, "User.svelte.tsx");
    assert!(
        tsx.contains("'./state.svelte.js'"),
        "a companion-less rune module specifier was rewritten:\n{tsx}"
    );
}

#[test]
fn nested_companion_specifier_path_is_correct() {
    let ws = workspace("nested");
    fs::create_dir_all(ws.join("src/lib")).unwrap();
    fs::write(ws.join("src/lib/Tip.svelte.ts"), "export const tip = 2;\n").unwrap();
    fs::write(ws.join("src/lib/Tip.svelte"), "<p>hi</p>\n").unwrap();
    fs::write(
        ws.join("src/lib/User.svelte"),
        "<script lang=\"ts\">import { tip } from './Tip.svelte.js';</script>\n<p>{tip}</p>\n",
    )
    .unwrap();

    let files = vec![
        ws.join("src/lib/Tip.svelte"),
        ws.join("src/lib/User.svelte"),
    ];
    materialize_overlay(&ws, &files, None).expect("overlay");

    // Shadow lives at <emit>/src/lib/User.svelte.tsx; the real companion is at
    // <ws>/src/lib/Tip.svelte.ts → up out of `.svelte-check/svelte` (2 levels)
    // then back down the mirrored subpath.
    let tsx = fs::read_to_string(ws.join(".svelte-check/svelte/src/lib/User.svelte.tsx")).unwrap();
    assert!(
        tsx.contains("'../../../../src/lib/Tip.svelte.js'"),
        "nested companion specifier path wrong:\n{tsx}"
    );
}

/// #800 (the other direction): `./Foo.svelte` resolves to the companion, so the
/// overlay augments *that* module with the component's default + `<script
/// module>` exports. Structural check; the real-compiler e2e lives in
/// `svelte_check_companion_800.rs`.
#[test]
fn companion_augmentation_declares_the_component_module() {
    let ws = workspace("aug");
    fs::create_dir_all(ws.join("src")).unwrap();
    fs::write(
        ws.join("src/Tip.svelte.ts"),
        "export const tip = (x: number): number => x * 2;\n",
    )
    .unwrap();
    fs::write(
        ws.join("src/Tip.svelte"),
        "<script module lang=\"ts\">export const ATTR = 'data-x';\nexport type Kind = 'a';</script>\n<p>hi</p>\n",
    )
    .unwrap();

    let files = vec![ws.join("src/Tip.svelte")];
    materialize_overlay(&ws, &files, None).expect("overlay");

    let aug = fs::read_to_string(ws.join(".svelte-check/companion-augment.d.ts")).unwrap();
    assert!(
        aug.contains("declare module \"../src/Tip.svelte\" {"),
        "augmentation must target the `.svelte` specifier:\n{aug}"
    );
    assert!(
        aug.contains("export default _default;"),
        "component default export must be forwarded:\n{aug}"
    );
    // `export import` carries the value *and* the type meaning of each name.
    assert!(
        aug.contains("export import ATTR ="),
        "module-context value export missing:\n{aug}"
    );
    assert!(
        aug.contains("export import Kind ="),
        "module-context type export missing:\n{aug}"
    );
    // The companion's own exports stay with the companion — re-declaring them
    // in the augmentation would be a duplicate identifier.
    assert!(
        !aug.contains("export import tip ="),
        "companion export must not be re-declared:\n{aug}"
    );

    let tsconfig = fs::read_to_string(ws.join(".svelte-check/tsconfig.json")).unwrap();
    assert!(
        tsconfig.contains("./companion-augment.d.ts"),
        "augmentation must be a program root:\n{tsconfig}"
    );
}

/// No companion → no augmentation file, and a stale one from a previous run is
/// cleaned up (it would otherwise keep augmenting a module that no longer
/// resolves to the companion).
#[test]
fn companion_augmentation_is_removed_when_the_companion_goes_away() {
    let ws = workspace("aug_stale");
    fs::write(ws.join("Tip.svelte.ts"), "export const tip = 1;\n").unwrap();
    fs::write(ws.join("Tip.svelte"), "<p>hi</p>\n").unwrap();
    let files = vec![ws.join("Tip.svelte")];
    materialize_overlay(&ws, &files, None).expect("overlay");
    assert!(ws.join(".svelte-check/companion-augment.d.ts").is_file());

    fs::remove_file(ws.join("Tip.svelte.ts")).unwrap();
    materialize_overlay(&ws, &files, None).expect("overlay");
    assert!(!ws.join(".svelte-check/companion-augment.d.ts").exists());

    let tsconfig = fs::read_to_string(ws.join(".svelte-check/tsconfig.json")).unwrap();
    assert!(!tsconfig.contains("./companion-augment.d.ts"));
}
