//! Regression test for issue #2113.
//!
//! A re-export in the *instance* script (`export { x } from './mod'`) used to be
//! left verbatim inside the generated `$$render()` body, which is not valid TSX
//! (TS1233 "An export declaration can only be used at the top level of a
//! module"). svelte-check then classified the whole overlay as invalid and
//! dropped every diagnostic for the component.
//!
//! Official `ExportedNames.handleExportDeclaration` keys off
//! `ts.isNamedExports(exportClause)` only — it never inspects `moduleSpecifier`
//! — so a re-export is removed from the script and recorded like any other
//! named export. The expectations below are the official svelte2tsx output for
//! the same input.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn to_tsx(src: &str) -> String {
    let opts = Svelte2TsxOptions {
        filename: "Input.svelte".to_string(),
        is_ts_file: false,
        ..Default::default()
    };
    svelte2tsx(src, opts).expect("svelte2tsx").code
}

/// The generated `$$render()` body must never contain an `export … from`.
fn assert_no_export_from(out: &str) {
    let body_end = out.find("\nasync () =>").unwrap_or(out.len());
    let body = &out[..body_end];
    assert!(
        !body.contains("export "),
        "an `export` statement survived into the $$render() body:\n{out}"
    );
}

#[test]
fn named_reexport_is_hoisted_out_of_render_body() {
    let out = to_tsx("<script>\n  export { x } from './mod';\n</script>\n\n<p>hi</p>\n");

    assert_no_export_from(&out);
    assert!(out.contains("props: {x: x}"), "{out}");
    assert!(
        out.contains("exports: /** @type {{x: typeof x}} */ ({})"),
        "{out}"
    );
}

#[test]
fn renamed_reexport_keeps_official_local_to_exported_mapping() {
    let out = to_tsx("<script>\n  export { x as y } from './mod';\n</script>\n\n<p>hi</p>\n");

    assert_no_export_from(&out);
    // Official renders `identifierText || key` : `key`, i.e. exported : local.
    assert!(out.contains("props: {y: x}"), "{out}");
    assert!(
        out.contains("exports: /** @type {{y: typeof x}} */ ({})"),
        "{out}"
    );
}

#[test]
fn reexport_mixes_with_plain_named_exports_in_source_order() {
    let out = to_tsx(concat!(
        "<script>\n",
        "  let local = 1;\n",
        "  export { local };\n",
        "  export { x, y as z } from './mod';\n",
        "</script>\n",
        "\n<p>hi</p>\n",
    ));

    assert_no_export_from(&out);
    assert!(out.contains("props: {local: local , x: x , z: y}"), "{out}");
    assert!(
        out.contains("exports: /** @type {{x: typeof x,z: typeof y}} */ ({})"),
        "{out}"
    );
    assert!(
        out.contains("__sveltets_2_partial(['local','x','z']"),
        "{out}"
    );
}

#[test]
fn type_only_reexport_is_removed_like_official() {
    // Official does not special-case `export type { … } from` either: the
    // statement is removed and `T` is recorded as an export.
    let out = to_tsx("<script>\n  export type { T } from './mod';\n</script>\n\n<p>hi</p>\n");

    assert_no_export_from(&out);
    assert!(out.contains("props: {T: T}"), "{out}");
}

#[test]
fn empty_export_clauses_are_removed() {
    for src in [
        "<script>\n  export {} from './mod';\n</script>\n",
        "<script>\n  export {};\n</script>\n",
    ] {
        let out = to_tsx(src);
        assert_no_export_from(&out);
        assert!(
            out.contains("props: /** @type {Record<string, never>} */ ({})"),
            "{out}"
        );
    }
}

#[test]
fn reexport_of_a_local_let_still_widens_and_stays_a_prop() {
    // `let x` exists locally, so the specifier resolves to the possible-export
    // and the entry stays `isLet` (prop, not a class export) — same as official.
    let out = to_tsx("<script>\n  let x = 1;\n  export { x as y } from './mod';\n</script>\n");

    assert_no_export_from(&out);
    assert!(out.contains("props: {y: x}"), "{out}");
    assert!(out.contains("exports: {}"), "{out}");
}

#[test]
fn module_script_reexport_is_left_verbatim() {
    // Module scripts are real modules: official never touches their exports.
    let out = to_tsx(concat!(
        "<script context=\"module\">\n",
        "  export { x } from './mod';\n",
        "</script>\n",
        "<script>\n  let a = 1;\n</script>\n",
    ));

    assert!(out.contains("export { x } from './mod';"), "{out}");
}
