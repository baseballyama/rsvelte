//! CSS custom properties accept balanced block values.
//!
//! The official compiler rejects these valid `<declaration-value>` token streams
//! with `css_expected_identifier`. rsvelte deliberately keeps the browser-valid
//! CSS instead of reproducing that semantic defect. See
//! `upstream_issues/3052-svelte-css-custom-property-brace-block.md`.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_css(style: &str) -> Result<String, rsvelte_core::CompileError> {
    let source = format!("<p>x</p>\n<style>\np {{ {style} }}\n</style>\n");
    compile(
        &source,
        CompileOptions {
            filename: Some("Main.svelte".to_string()),
            generate: GenerateMode::Client,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .map(|result| result.css.map(|css| css.code).unwrap_or_default())
}

#[test]
fn a_custom_property_accepts_balanced_curly_and_square_blocks() {
    let css = compile_css("--tpl: { color: red; }; --nested: [a; { b: c; }]; color: blue;")
        .expect("balanced custom-property blocks are valid CSS");

    for token in [
        "--tpl: { color: red; }",
        "--nested: [a; { b: c; }]",
        "color: blue",
    ] {
        assert!(css.contains(token), "expected `{token}` in:\n{css}");
    }
}

#[test]
fn strings_comments_and_escapes_do_not_close_a_custom_property_block() {
    let css = compile_css(
        r#"--tokens: { content: "};"; /* } ; */ escaped: \}; nested: [x; y]; }; color: blue;"#,
    )
    .expect("opaque tokens inside a custom-property block must not terminate it");

    assert!(
        css.contains("/* } ; */"),
        "comment was not preserved:\n{css}"
    );
    assert!(css.contains("nested: [x; y]"), "nested block lost:\n{css}");
    assert!(
        css.contains("color: blue"),
        "following declaration lost:\n{css}"
    );
}

#[test]
fn a_declaration_block_does_not_misclassify_the_value_as_a_nested_rule() {
    let css = compile_css("@font-face { --tokens: { a: b; }; font-family: demo; }")
        .expect("a custom property in a declaration-taking at-rule must compile");

    assert!(css.contains("--tokens: { a: b; }"), "block lost:\n{css}");
    assert!(
        css.contains("font-family: demo"),
        "following declaration lost:\n{css}"
    );
}

#[test]
fn an_ordinary_property_does_not_gain_the_custom_property_grammar() {
    let error = compile_css("color: { red }; background: blue;")
        .expect_err("ordinary declaration values still reject a curly block");
    assert_eq!(
        error.diagnostic().code.as_deref(),
        Some("css_expected_identifier")
    );
}

#[test]
fn scss_line_comment_parentheses_do_not_end_the_enclosing_rule_early() {
    let source = r#"<p>x</p>
<style lang="scss">
  .pill {
    // The container (opt-in via `container: pill / inline-size`) is optional.
    --overlap: calc(var(--size) * -0.5);
  }

  @container pill (min-width: 0px) {
    .pill {
      --available: calc(
        100cqi - var(--reserved-inline, 0px)
      );
    }
  }
</style>
"#;

    compile(
        source,
        CompileOptions {
            filename: Some("AvatarPill.svelte".to_string()),
            generate: GenerateMode::Client,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("the SCSS carrier accepted by upstream must remain accepted");
}
