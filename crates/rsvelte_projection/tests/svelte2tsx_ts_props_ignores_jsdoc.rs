//! A `lang="ts"` script's `$props()` derives `$$ComponentProps` from the
//! destructuring, even when a JSDoc `@type` sits above it.
//!
//! Upstream reaches its whole JSDoc scan under `if (!this.isTsFile)`
//! (`ExportedNames.ts:242`), so in a TS file the comment is never consulted and
//! `createPropsStr` runs. rsvelte read `jsdoc_type` regardless of the language,
//! so four real components lost their `$$ComponentProps` alias entirely — the
//! props return type then falls back and every consumer of the component sees
//! `any` where the author's shape should be.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

const SRC_TS: &str = concat!(
    "<script lang=\"ts\">\n",
    "\t/** @type {Props} */\n",
    "\tlet { icon, active = false, onclick } = $props()\n",
    "</script>\n",
);

const SRC_JS: &str = concat!(
    "<script>\n",
    "\t/** @type {Props} */\n",
    "\tlet { icon, active = false, onclick } = $props()\n",
    "</script>\n",
);

fn to_tsx(src: &str, is_ts_file: bool) -> String {
    let opts = Svelte2TsxOptions {
        filename: "X.svelte".to_string(),
        is_ts_file,
        ..Default::default()
    };
    svelte2tsx(src, opts).expect("svelte2tsx").code
}

#[test]
fn a_ts_script_derives_the_alias_from_the_destructuring() {
    let out = to_tsx(SRC_TS, true);
    assert!(
        out.contains(
            "/*\u{03A9}ignore_start\u{03A9}*/;type $$ComponentProps = { icon: any, active?: boolean, onclick: any };/*\u{03A9}ignore_end\u{03A9}*/"
        ),
        "TS props alias missing or reshaped:\n{out}"
    );
    assert!(
        out.contains("let { icon, active = false, onclick }: $$ComponentProps = $props()"),
        "the annotation was not attached to the pattern:\n{out}"
    );
}

/// The control that separates "read the comment" from "ignore it": the same
/// source as JavaScript keeps the JSDoc and emits no alias, which is what
/// upstream does and what rsvelte already did.
#[test]
fn a_js_script_still_honours_the_jsdoc() {
    let out = to_tsx(SRC_JS, false);
    assert!(
        !out.contains("type $$ComponentProps ="),
        "a TS alias leaked into a JS projection:\n{out}"
    );
    assert!(
        out.contains("let { icon, active = false, onclick } = $props()"),
        "the JS declaration was rewritten:\n{out}"
    );
}
