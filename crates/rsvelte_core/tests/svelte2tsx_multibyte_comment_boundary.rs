//! Regression test: svelte2tsx must not panic on a multi-byte char immediately
//! before a declaration.
//!
//! `leading_jsdoc_comment` (script/mod.rs) probes the two bytes ending at the
//! declaration start for a `*/` block-comment terminator. It used to slice
//! `&source[p - 2..p]` directly, which panics ("byte index is not a char
//! boundary") when the byte before the declaration is part of a multi-byte
//! char — e.g. a `─` box-drawing character in a preceding line comment. In the
//! wasm playground this surfaced as a bare `unreachable` trap. The playground's
//! default example uses exactly these `// ── … ──` comment banners.

use rsvelte_core::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

#[test]
fn multibyte_char_before_declaration_does_not_panic() {
    // The `─` (U+2500) box-drawing chars are multi-byte; the declaration that
    // follows starts right after the comment line's whitespace.
    let src = "<script>\n\
        \t// ── $state ────────────────────────────────────\n\
        \tlet count = $state(0);\n\
        </script>\n\
        <p>{count}</p>";

    let opts = Svelte2TsxOptions {
        filename: "Component.svelte".to_string(),
        is_ts_file: true,
        ..Default::default()
    };

    let result = svelte2tsx(src, opts).expect("svelte2tsx should not panic");
    assert!(result.code.contains("count"), "output:\n{}", result.code);
}
