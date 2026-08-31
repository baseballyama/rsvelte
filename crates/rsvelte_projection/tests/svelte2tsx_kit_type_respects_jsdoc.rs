//! A SvelteKit route prop that already carries a JSDoc `@type` keeps it.
//!
//! `ExportedNames.handleTypeAssertion` computes `kitType` from
//! `tsType || ts.getJSDocType(declaration)`, so `/** @type {any} */ export let
//! form` suppresses the `import('./$types.js').ActionData` injection. Injecting
//! anyway is not merely redundant: on a route whose `$types.d.ts` has no
//! `ActionData` (no `+page.server.js` actions) it raises a TS2694 the author
//! never wrote.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn to_tsx(src: &str, filename: &str, is_ts_file: bool) -> String {
    let opts = Svelte2TsxOptions {
        filename: filename.to_string(),
        is_ts_file,
        emit_jsdoc: true,
        ..Default::default()
    };
    svelte2tsx(src, opts).expect("svelte2tsx").code
}

#[test]
fn jsdoc_typed_kit_prop_keeps_the_authors_type() {
    let out = to_tsx(
        concat!(
            "<script>\n",
            "  /** @type {any} */\n",
            "  export let form;\n",
            "  /** @type {any} */\n",
            "  export let data;\n",
            "</script>\n",
        ),
        "+page.svelte",
        false,
    );
    assert!(
        !out.contains("ActionData"),
        "kit type injected over an explicit JSDoc type:\n{out}"
    );
    assert!(
        !out.contains("PageData"),
        "kit type injected over an explicit JSDoc type:\n{out}"
    );
}

#[test]
fn untyped_kit_prop_still_gets_the_injection() {
    let out = to_tsx(
        concat!("<script>\n", "  export let form;\n", "</script>\n"),
        "+page.svelte",
        false,
    );
    assert!(
        out.contains("import('./$types.js').ActionData"),
        "kit type missing on an untyped prop:\n{out}"
    );
}

/// The overlay gives a JS-authored component a `.jsx` shadow, which only works
/// if its projection is JavaScript. `<script generics="T">` is the shape that
/// most nearly isn't — it declares type parameters — so pin that it comes out
/// as `@template` / `@typedef` rather than TS syntax.
#[test]
fn a_js_generics_component_projects_to_javascript() {
    let out = to_tsx(
        concat!(
            "<script generics=\"T\">\n",
            "  /** @type {{ b: T }} */\n",
            "  let { b } = $props();\n",
            "</script>\n",
            "{b}\n",
        ),
        "Input.svelte",
        false,
    );
    assert!(
        out.contains("/** @template T */"),
        "generics not projected as JSDoc:\n{out}"
    );
    assert!(
        !out.contains("interface "),
        "TS-only syntax in a JS projection:\n{out}"
    );
    assert!(
        !out.contains("declare "),
        "TS-only syntax in a JS projection:\n{out}"
    );
}

#[test]
fn ts_typed_kit_prop_keeps_the_authors_type() {
    let out = to_tsx(
        concat!(
            "<script lang=\"ts\">\n",
            "  export let form: unknown;\n",
            "</script>\n",
        ),
        "+page.svelte",
        true,
    );
    assert!(
        !out.contains("ActionData"),
        "kit type injected over an explicit TS annotation:\n{out}"
    );
}

/// The corpus gate calls svelte2tsx without `emitJsDoc`, which is the branch the
/// two tests below live in; the helper above hardcodes it on.
fn to_tsx_no_jsdoc(src: &str, filename: &str) -> String {
    let opts = Svelte2TsxOptions {
        filename: filename.to_string(),
        is_ts_file: false,
        ..Default::default()
    };
    svelte2tsx(src, opts).expect("svelte2tsx").code
}

/// The combined branch — kit type *and* widener in one ignore block — is written
/// out as a single format string here, where upstream concatenates
/// `` `${kitType};${name} = __sveltets_2_any(${name});` `` (`ExportedNames.ts:476`).
/// The two must agree byte for byte, and the separator between them is one
/// character wide, so it is asserted as text rather than by `contains` on the
/// pieces. Control: the *separate* branch below never had the space, which is
/// what makes this a divergence between two spellings of one upstream string.
#[test]
fn the_combined_kit_type_and_widener_glue_with_no_space() {
    let out = to_tsx_no_jsdoc(
        concat!("<script>\n", "\texport let data;\n", "</script>\n"),
        "+page.svelte",
    );
    assert!(
        out.contains(
            "/*\u{03A9}ignore_start\u{03A9}*/: import('./$types.js').PageData;data = __sveltets_2_any(data);/*\u{03A9}ignore_end\u{03A9}*/"
        ),
        "combined kit block does not match upstream's spelling:\n{out}"
    );
}

#[test]
fn the_widener_alone_already_glued() {
    // No kit type (not a route prop name), so the widener is emitted on its own —
    // the branch that was already correct, kept as the control for the test above.
    let out = to_tsx_no_jsdoc(
        concat!("<script>\n", "\texport let other;\n", "</script>\n"),
        "+page.svelte",
    );
    assert!(
        out.contains(
            "/*\u{03A9}ignore_start\u{03A9}*/;other = __sveltets_2_any(other);/*\u{03A9}ignore_end\u{03A9}*/"
        ),
        "standalone widener changed shape:\n{out}"
    );
}
