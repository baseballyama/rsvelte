//! The stylesheet injected into `js.code` (`css: "injected"`, and every custom
//! element) is minified, and `css.code` — the only thing the corpus gate
//! compares — is byte-identical on all of these, so nothing saw the minifier.
//! It emitted a `;` per declaration on top of the source's own, doubled the
//! opening brace of a nested block, and kept the whitespace upstream's
//! `remove_preceding_whitespace` removes.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn injected(body: &str) -> String {
    let source = format!("<b class=\"a\">x</b>\n<style>\n\t{body}\n</style>\n");
    let result = compile(
        &source,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::Injected,
            ..Default::default()
        },
    )
    .expect("compile");
    let js = result.js.code;
    let start = js.find("code: '").expect("no injected stylesheet") + "code: '".len();
    let mut out = String::new();
    let mut chars = js[start..].chars();
    while let Some(ch) = chars.next() {
        match ch {
            '\'' => return out,
            '\\' => match chars.next() {
                Some('n') => out.push('\n'),
                Some('t') => out.push('\t'),
                Some(escaped) => out.push(escaped),
                None => break,
            },
            _ => out.push(ch),
        }
    }
    panic!("unterminated stylesheet literal");
}

#[test]
fn a_declaration_without_a_trailing_semicolon_gets_none() {
    assert_eq!(
        injected(".a { color: red }"),
        ".a.svelte-1lj1c24 {color:red}"
    );
}

#[test]
fn a_declaration_with_a_trailing_semicolon_keeps_exactly_one() {
    assert_eq!(
        injected(".a { color: red; }"),
        ".a.svelte-1lj1c24 {color:red;}"
    );
}

#[test]
fn sibling_declarations_keep_the_source_separator() {
    assert_eq!(
        injected(".a { color: red; margin: 0 }"),
        ".a.svelte-1lj1c24 {color:red;margin:0}"
    );
}

#[test]
fn a_value_with_spaces_is_not_given_a_trailing_semicolon() {
    assert_eq!(
        injected(".a { margin: 0 1px 2px 3px }"),
        ".a.svelte-1lj1c24 {margin:0 1px 2px 3px}"
    );
}

#[test]
fn a_nested_rule_keeps_the_braces_balanced() {
    assert_eq!(
        injected(".a { color: red; &:hover { color: blue } }"),
        ".a.svelte-1lj1c24 {color:red;&:hover {color:blue}}"
    );
}

#[test]
fn a_space_before_the_colon_is_left_alone() {
    // Upstream cuts the whitespace run starting at `property.length + 1`, so a
    // declaration whose colon is not adjacent to the property is untouched.
    assert_eq!(
        injected(".a { COLOR : red }"),
        ".a.svelte-1lj1c24 {COLOR : red}"
    );
}

#[test]
fn a_custom_property_keeps_its_whitespace() {
    assert_eq!(
        injected(".a { --custom:   spaced  ; color: red }"),
        ".a.svelte-1lj1c24 {--custom:   spaced  ;color:red}"
    );
}

#[test]
fn an_animation_declaration_is_not_minified() {
    // Upstream's Declaration visitor handles `animation` in its first branch, so
    // the minify branch never runs for it.
    assert_eq!(
        injected(".a { animation: spin 1s }\n\t@keyframes spin { from { opacity: 0 } }"),
        ".a.svelte-1lj1c24 { animation: svelte-1lj1c24-spin 1s}\n\t@keyframes svelte-1lj1c24-spin { from { opacity: 0 } }"
    );
}

#[test]
fn an_at_rule_keeps_the_whitespace_around_it() {
    // `remove_preceding_whitespace` is called from the Rule visitor only.
    assert_eq!(
        injected("@media (min-width: 1px) { .a { color: red } }"),
        "\n\t@media (min-width: 1px) {.a.svelte-1lj1c24 {color:red} }"
    );
}

#[test]
fn a_font_face_body_is_minified_too() {
    assert_eq!(
        injected("@font-face { font-family: x; src: url(a.woff) }\n\t.a { color: red }"),
        "\n\t@font-face {font-family:x;src:url(a.woff) }.a.svelte-1lj1c24 {color:red}"
    );
}

#[test]
fn a_global_block_body_is_minified_too() {
    assert_eq!(injected(":global { .g { color: red } }"), ".g {color:red}");
}

#[test]
fn a_comment_survives_minification() {
    assert_eq!(
        injected(".a { /* hi */ color: red }"),
        ".a.svelte-1lj1c24 { /* hi */color:red}"
    );
}
