//! Upstream never scans a `<style>` block as raw text: `read_body` tests
//! `parser.match('</style')` only at a rule boundary, so a `</style` inside a
//! CSS string, a comment or an unquoted `url()` is content. rsvelte used a plain
//! byte search for `</style`, which ended the block early and left the rest of
//! the file to be parsed as markup — an over-rejection of documents the official
//! compiler compiles.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

/// The stylesheet with the component hash replaced by `HASH`.
fn scoped_css(body: &str) -> String {
    let source = format!("<p class=\"a\">x</p>\n<style>{body}</style>\n");
    let result = compile(
        &source,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .unwrap_or_else(|err| panic!("{body}: {err:?}"));
    let css = result.css.map(|c| c.code).unwrap_or_default();
    // An unused rule is commented out, so it carries no scope class.
    let Some(start) = css.find("svelte-") else {
        return css;
    };
    let len = css[start..]
        .char_indices()
        .find(|(i, c)| *i > 0 && !c.is_ascii_alphanumeric() && *c != '-')
        .map_or(css.len() - start, |(i, _)| i);
    css.replace(&css[start..start + len], "HASH")
}

#[test]
fn a_closing_tag_inside_a_double_quoted_value_is_content() {
    assert_eq!(
        scoped_css(r#".a { content: "a</style>b" }"#),
        r#".a.HASH { content: "a</style>b" }"#
    );
}

#[test]
fn a_closing_tag_inside_a_single_quoted_value_is_content() {
    assert_eq!(
        scoped_css(".a { content: 'a</style>b' }"),
        ".a.HASH { content: 'a</style>b' }"
    );
}

#[test]
fn a_closing_tag_with_a_space_before_the_bracket_is_content() {
    assert_eq!(
        scoped_css(r#".a { content: "a</style >b" }"#),
        r#".a.HASH { content: "a</style >b" }"#
    );
}

#[test]
fn a_closing_tag_inside_a_quoted_url_is_content() {
    assert_eq!(
        scoped_css(r#".a { background: url("</style>") }"#),
        r#".a.HASH { background: url("</style>") }"#
    );
}

#[test]
fn a_closing_tag_inside_an_unquoted_url_is_content() {
    assert_eq!(
        scoped_css(".a { background: url(</style>) }"),
        ".a.HASH { background: url(</style>) }"
    );
}

#[test]
fn a_closing_tag_inside_a_trailing_comment_is_content() {
    assert_eq!(
        scoped_css(".a { color: red } /* </style> */"),
        ".a.HASH { color: red } /* </style> */"
    );
}

#[test]
fn a_closing_tag_inside_a_leading_comment_is_content() {
    assert_eq!(
        scoped_css("/* </style> */ .a { color: red }"),
        "/* </style> */ .a.HASH { color: red }"
    );
}

#[test]
fn a_closing_tag_inside_an_html_comment_is_content() {
    assert_eq!(
        scoped_css("<!-- </style> --> .a { color: red }"),
        "<!-- </style> --> .a.HASH { color: red }"
    );
}

#[test]
fn a_closing_tag_inside_an_attribute_selector_value_is_content() {
    // The rule is unused, so it is commented out rather than pruned — which is
    // still proof the block reader ran to the real `</style>`.
    assert_eq!(
        scoped_css(r#".a[data-x="</style>"] { color: red }"#),
        r#"/* (unused) .a[data-x="</style>"] { color: red }*/"#
    );
}

#[test]
fn an_escaped_quote_does_not_reopen_the_string() {
    assert_eq!(
        scoped_css(r#".a { content: "a\"</style>b" }"#),
        r#".a.HASH { content: "a\"</style>b" }"#
    );
}

#[test]
fn an_uppercase_closing_tag_is_content_too() {
    // Control: the block reader is reached and agrees when there is no
    // lowercase `</style` to trip on.
    assert_eq!(
        scoped_css(r#".a { content: "a</STYLE>b" }"#),
        r#".a.HASH { content: "a</STYLE>b" }"#
    );
}

#[test]
fn a_real_closing_tag_still_ends_the_block() {
    assert_eq!(
        scoped_css(r#".a { content: "ab" }"#),
        r#".a.HASH { content: "ab" }"#
    );
}

#[test]
fn a_stray_open_tag_in_the_block_is_still_rejected() {
    let source = "<p class=\"a\">x</p>\n<style>.a { color: red } <b></style>\n";
    let err = compile(
        source,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect_err("expected a CSS parse error");
    assert!(
        format!("{err:?}").contains("css_expected_identifier"),
        "{err:?}"
    );
}

#[test]
fn an_unterminated_string_still_reports_eof() {
    let source = "<p class=\"a\">x</p>\n<style>.a { content: \"ab }</style>\n";
    let err = compile(
        source,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect_err("expected an EOF error");
    assert!(format!("{err:?}").contains("unexpected_eof"), "{err:?}");
}

#[test]
fn an_apostrophe_in_an_scss_line_comment_does_not_hide_the_css_error() {
    let source =
        "<style lang=\"scss\">\n// children don't add margins\n.a { color: red; }\n</style>\n";
    let err = compile(
        source,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect_err("expected a CSS identifier error");
    assert!(
        format!("{err:?}").contains("css_expected_identifier"),
        "{err:?}"
    );
}

#[test]
fn balanced_apostrophes_in_scss_line_comments_do_not_hide_the_css_error() {
    let source = "<style lang=\"scss\">\n.a {\n// can't\n}\n// isn't\n</style>\n";
    let err = compile(
        source,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect_err("expected a CSS identifier error");
    assert!(
        format!("{err:?}").contains("css_expected_identifier"),
        "{err:?}"
    );
}
