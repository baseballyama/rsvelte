//! Where the SSR output prints a comment that leads a declarator.
//!
//! Upstream SPLITS a multi-declarator declaration into one builder-made
//! statement per declarator, so the statement carries no `loc` and esrap flushes
//! the comment at the first located node inside it — the binding pattern, which
//! prints AFTER the keyword. A one-declarator declaration keeps the source
//! statement's own `loc` and prints its comment before it. rsvelte's SSR
//! assembly registers a source region per statement and used to collapse the
//! whole region onto one address, which put every such comment before the
//! keyword.
//!
//! Every expectation below is the official compiler's bytes (svelte 5.56.10).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn server(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Server,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

fn assert_contains(actual: &str, expected: &str) {
    assert!(
        actual.contains(expected),
        "expected `{expected}`. Got:\n{actual}"
    );
}

#[test]
fn a_line_comment_leading_a_split_prop_declaration_prints_after_the_keyword() {
    assert_contains(
        &server("<script>\n\t// lead\n\texport let a = 1,\n\t\tb = 2;\n</script>\n{a}{b}\n"),
        "let // lead\n\ta = $.fallback($$props['a'], 1);",
    );
}

#[test]
fn a_block_comment_leading_a_split_prop_declaration_prints_after_the_keyword() {
    assert_contains(
        &server("<script>\n\t/* lead */\n\texport let a = 1,\n\t\tb = 2;\n</script>\n{a}{b}\n"),
        "let /* lead */\n\ta = $.fallback($$props['a'], 1);",
    );
}

/// A comment sharing the declarator's line keeps that line. The break is decided
/// from the region text, which is the source, so this needs no separate rule —
/// it is the same flush answering a different question about the same bytes.
#[test]
fn a_same_line_comment_keeps_the_declarators_line() {
    assert_contains(
        &server("<script>\n\texport let /* same line */ a = 1,\n\t\tb = 2;\n</script>\n{a}{b}\n"),
        "let /* same line */ a = $.fallback($$props['a'], 1);",
    );
}

#[test]
fn a_comment_between_two_declarators_prints_after_the_second_keyword() {
    assert_contains(
        &server("<script>\n\texport let a = 1,\n\t\t/* mid */\n\t\tb = 2;\n</script>\n{a}{b}\n"),
        "let /* mid */\n\tb = $.fallback($$props['b'], 2);",
    );
}

/// The same rule on a declaration that is not a prop at all: the declarators are
/// plain locals, and upstream splits them just the same.
#[test]
fn a_plain_split_declaration_carries_its_comment_too() {
    let out = server("<script>\n\tlet a,\n/* c */\n\t\tc;\n</script>\n<p>{a}{c}</p>\n");
    assert_contains(&out, "let a;");
    assert_contains(&out, "let /* c */\n\tc;");
}

/// CONTROL: one declarator is not split, so upstream keeps the source
/// statement's `loc` and the comment stays BEFORE the keyword. A fix that moves
/// every declaration's comment breaks this row.
#[test]
fn a_single_declarator_declaration_keeps_its_comment_before_the_keyword() {
    assert_contains(
        &server("<script>\n\t// lead\n\texport let solo = 7;\n</script>\n{solo}\n"),
        "// lead\n\tlet solo = $.fallback($$props['solo'], 7);",
    );
}

/// CONTROL: the dev target reaches the same statements through
/// `$$renderer.component(($$renderer) => { … })`, and upstream places the
/// comment identically there.
#[test]
fn the_dev_target_places_it_the_same_way() {
    let out = compile(
        "<script>\n\t// lead\n\texport let a = 1,\n\t\tb = 2;\n</script>\n{a}{b}\n",
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Server,
            dev: true,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    assert_contains(&out, "let // lead\n\t\t\ta = $.fallback($$props['a'], 1);");
}
