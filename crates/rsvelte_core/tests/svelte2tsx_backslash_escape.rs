//! Regression test: svelte2tsx mixed-attribute template literals must escape
//! backslashes (issue #455, H-091). A Windows-style path in an attribute value
//! would otherwise turn `\n` / `\t` into a newline / tab inside the generated
//! template literal.

use rsvelte_core::svelte2tsx::{
    Svelte2TsxMode, Svelte2TsxNamespace, Svelte2TsxOptions, SvelteVersion, svelte2tsx,
};

fn opts() -> Svelte2TsxOptions {
    Svelte2TsxOptions {
        filename: "T.svelte".to_string(),
        is_ts_file: false,
        mode: Svelte2TsxMode::Ts,
        accessors: false,
        namespace: Svelte2TsxNamespace::Html,
        version: SvelteVersion::V5,
        runes: None,
        emit_jsdoc: false,
        rewrite_external_imports: None,
    }
}

#[test]
fn backslash_in_mixed_attribute_is_escaped() {
    // A mixed attribute (static text + expression) is emitted as a template
    // literal; the static text contains backslashes that must be escaped.
    let input = r#"<script>let x = 1;</script><div class="C:\temp\new{x}"></div>"#;
    let out = svelte2tsx(input, opts()).expect("svelte2tsx").code;
    assert!(
        out.contains(r"C:\\temp\\new"),
        "backslashes in attribute text were not escaped, got:\n{out}"
    );
}
