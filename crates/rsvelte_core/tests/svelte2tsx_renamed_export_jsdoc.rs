//! Regression test for issue #1230.
//!
//! Official svelte2tsx attaches a `/** @type {...} */` JSDoc to a prop in the
//! generated `render({...})` destructure. The doc is resolved via `getDoc`,
//! which looks first at the `let x` declaration, then — when none is there — at
//! the `export { x as y }` statement itself (`exportExpr`). The common
//! real-world shape (e.g. `attractions/accordion/accordion-section.svelte`)
//! puts the doc on the renamed-export statement:
//!
//! ```svelte
//! let _class = null;
//! /** @type {string | false | null} */
//! export { _class as class };
//! ```
//!
//! Without the `exportExpr` fallback the prop lost its declared type in the
//! language server. This guards that the doc round-trips onto the prop.

use rsvelte_core::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn to_tsx(src: &str) -> String {
    let opts = Svelte2TsxOptions {
        filename: "T.svelte".to_string(),
        is_ts_file: false,
        ..Default::default()
    };
    svelte2tsx(src, opts).expect("svelte2tsx").code
}

#[test]
fn jsdoc_on_renamed_export_statement_round_trips_onto_prop() {
    let out = to_tsx(concat!(
        "<script>\n",
        "  let _class = null;\n",
        "  /** @type {string | false | null} */\n",
        "  export { _class as class };\n",
        "</script>\n",
        "<li class={_class}></li>",
    ));

    assert!(
        out.contains("/** @type {string | false | null} */ class: _class"),
        "renamed-export JSDoc missing from props destructure:\n{out}"
    );
}

#[test]
fn jsdoc_on_let_declaration_still_takes_precedence() {
    // When the doc is on the `let x` declaration, that one wins (it is checked
    // first in `getDoc`), and the export statement has no comment of its own.
    let out = to_tsx(concat!(
        "<script>\n",
        "  /** @type {number} */\n",
        "  let _value = 0;\n",
        "  export { _value as value };\n",
        "</script>\n",
        "<span>{_value}</span>",
    ));

    assert!(
        out.contains("/** @type {number} */ value: _value"),
        "let-declaration JSDoc missing from props destructure:\n{out}"
    );
}
