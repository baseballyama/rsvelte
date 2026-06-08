//! Regression test for issue #751.
//!
//! A `Foo.svelte` component and a sibling companion module
//! `Foo.svelte.ts` (or `.js`) collide on the same TypeScript basename:
//! `import X from './Foo.svelte'` and `import { y } from './Foo.svelte.js'`
//! both resolve to the single `Foo.svelte.{ts,tsx,d.ts}` family. The overlay
//! emits the component shadow as `Foo.svelte.tsx`; without special handling a
//! companion's named exports (`{ y }`) are invisible — TS reports a spurious
//! `TS2614: has no exported member 'y'`.
//!
//! The fix folds the companion's named exports into the component shadow via an
//! appended `export * from "<companion>.js"`, so the one resolvable module
//! carries both the component default export and the companion's named exports.

use rsvelte_core::svelte_check::overlay::materialize_overlay;
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
fn component_shadow_reexports_sibling_ts_companion() {
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
    // … and the companion's named exports are folded in via re-export.
    assert!(
        tsx.contains("export * from \"../../Tip.svelte.js\";"),
        "companion re-export missing:\n{tsx}"
    );
}

#[test]
fn component_shadow_reexports_sibling_js_companion() {
    let ws = workspace("js");
    fs::write(ws.join("Tip.svelte.js"), "export const tip = 1;\n").unwrap();
    fs::write(ws.join("Tip.svelte"), "<p>hi</p>\n").unwrap();

    let files = vec![ws.join("Tip.svelte")];
    materialize_overlay(&ws, &files, None).expect("overlay");

    let tsx = read_tsx(&ws, "Tip.svelte.tsx");
    assert!(
        tsx.contains("export * from \"../../Tip.svelte.js\";"),
        "js companion re-export missing:\n{tsx}"
    );
}

#[test]
fn no_companion_means_no_reexport() {
    let ws = workspace("none");
    fs::write(ws.join("Tip.svelte"), "<p>hi</p>\n").unwrap();

    let files = vec![ws.join("Tip.svelte")];
    materialize_overlay(&ws, &files, None).expect("overlay");

    let tsx = read_tsx(&ws, "Tip.svelte.tsx");
    assert!(
        !tsx.contains("export * from \"../../Tip.svelte.js\";"),
        "unexpected companion re-export with no companion present:\n{tsx}"
    );
}

#[test]
fn nested_component_reexport_path_is_correct() {
    let ws = workspace("nested");
    fs::create_dir_all(ws.join("src/lib")).unwrap();
    fs::write(ws.join("src/lib/Tip.svelte.ts"), "export const tip = 2;\n").unwrap();
    fs::write(ws.join("src/lib/Tip.svelte"), "<p>hi</p>\n").unwrap();

    let files = vec![ws.join("src/lib/Tip.svelte")];
    materialize_overlay(&ws, &files, None).expect("overlay");

    // Shadow lives at <emit>/src/lib/Tip.svelte.tsx; the real companion is at
    // <ws>/src/lib/Tip.svelte.ts → up out of `.svelte-check/svelte` (2 levels)
    // then back down the mirrored subpath.
    let tsx = fs::read_to_string(ws.join(".svelte-check/svelte/src/lib/Tip.svelte.tsx")).unwrap();
    assert!(
        tsx.contains("export * from \"../../../../src/lib/Tip.svelte.js\";"),
        "nested companion re-export path wrong:\n{tsx}"
    );
}
