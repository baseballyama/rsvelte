//! Regression tests for JS string escaping of static SSR attribute values
//! (correctness review C-011).
//!
//! Bug: the SSR attribute-object builder embedded static `AttributeValue::Text`
//! into single-quoted JS string literals without escaping. A value containing a
//! single quote or newline produced invalid JS (`{ value: 'a'b' }`), a
//! backslash produced a wrong escape, and `</script>` survived unescaped.
//!
//! Fix: route static values through `escape_attr` (HTML, matching upstream
//! `escape_html(data, /*is_attr*/ true)`) then `escape_js_string` (JS literal),
//! so the output is valid JS and byte-identical to the official compiler.

use svelte_compiler_rust::{CompileOptions, GenerateMode, compile};

fn ssr(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Server,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[test]
fn single_quote_in_spread_attribute_is_escaped() {
    let out = ssr("<input value=\"a'b\" {...rest} />");
    // Matches the official compiler: `value: 'a\'b'`.
    assert!(out.contains(r"value: 'a\'b'"), "got:\n{out}");
}

#[test]
fn backslash_in_spread_attribute_is_escaped() {
    let out = ssr(r#"<input value="a\b" {...rest} />"#);
    // `a\b` → `'a\\b'` (literal backslash), not `'a\b'` (backspace escape).
    assert!(out.contains(r"value: 'a\\b'"), "got:\n{out}");
}

#[test]
fn newline_in_spread_attribute_is_escaped() {
    let out = ssr("<input value=\"l1\nl2\" {...rest} />");
    // A raw newline inside a single-quoted literal is a JS syntax error.
    assert!(out.contains(r"value: 'l1\nl2'"), "got:\n{out}");
    assert!(
        !out.contains("value: 'l1\nl2'"),
        "raw newline leaked into the literal:\n{out}"
    );
}

#[test]
fn script_boundary_in_spread_attribute_is_html_escaped() {
    let out = ssr("<input value=\"</script><x>\" {...rest} />");
    // The `<` is HTML-escaped to `&lt;` (matching the official compiler), so no
    // raw `</script>` boundary survives in the generated module.
    assert!(out.contains(r"value: '&lt;/script>&lt;x>'"), "got:\n{out}");
    assert!(
        !out.contains("'</script>"),
        "raw `</script>` boundary leaked into the literal:\n{out}"
    );
}

#[test]
fn class_static_with_spread_is_escaped() {
    let out = ssr("<div class=\"a'b\" {...rest}></div>");
    assert!(out.contains(r"class: 'a\'b'"), "got:\n{out}");
}
