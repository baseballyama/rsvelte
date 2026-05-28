//! Issue #448 H-108: a component's CSS custom-prop (`--foo=...`) values must be
//! normalised like ordinary component attributes — store refs routed through
//! `$.store_get` and static text JS-escaped — rather than emitted from raw
//! source.

use svelte_compiler_rust::{CompileOptions, GenerateMode, compile};

fn ssr(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Server,
            dev: false,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

#[test]
fn css_custom_prop_store_ref_is_transformed() {
    let src = "<script>\nimport { writable } from 'svelte/store';\nimport Child from './Child.svelte';\nconst theme = writable('red');\n</script>\n<Child --color={$theme} />";
    let out = ssr(src);
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("'--color': $.store_get("),
        "store ref in CSS custom prop not transformed: {out}"
    );
}

#[test]
fn css_custom_prop_text_value_is_escaped() {
    let src = "<script>\nimport Child from './Child.svelte';\n</script>\n<Child --label=\"a'b\" />";
    let out = ssr(src);
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("'--label': 'a\\'b'"),
        "single quote in CSS custom prop text value not escaped: {out}"
    );
}
