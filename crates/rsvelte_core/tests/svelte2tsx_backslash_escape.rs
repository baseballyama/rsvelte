//! Regression test: a mixed attribute (static text + expression) is emitted as
//! a template literal whose static text is sliced from the RAW source, exactly
//! like official svelte2tsx (`htmlxtojsx_v2/nodes/Attribute.ts`). Official does
//! NOT escape backslashes — only the template-literal delimiters (`` ` `` and
//! `${`) — so a Windows-style path keeps its single backslashes. The corpus is
//! the byte-for-byte oracle, so matching official (single backslash) is correct
//! even though `\t`/`\n` are escape sequences inside the literal (the generated
//! TSX exists only for type-checking, never execution). Earlier this escaped
//! backslashes (issue #455, H-091), which diverged from official.

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
fn backslash_in_mixed_attribute_is_sliced_raw() {
    // Mirror official: the raw source text is sliced verbatim into the template
    // literal, so backslashes stay single (`C:\temp\new`), not doubled.
    let input = r#"<script>let x = 1;</script><div class="C:\temp\new{x}"></div>"#;
    let out = svelte2tsx(input, opts()).expect("svelte2tsx").code;
    assert!(
        out.contains(r"C:\temp\new${x}"),
        "expected raw single-backslash slice, got:\n{out}"
    );
    assert!(
        !out.contains(r"C:\\temp"),
        "backslashes must NOT be escaped (official slices raw), got:\n{out}"
    );
}
