//! A multi-declarator list is split into one statement per declarator, and
//! upstream prints the declaration's comments between the keyword and the
//! declarator — the statement it rebuilt has no `loc`, so esrap flushes them at
//! the first located node inside it. Emitting them above the keyword instead
//! was a workaround for the later text passes, whose needles are the literal
//! `"<keyword> <var> ="`; those now peel the comment run before matching, so
//! the shape upstream emits no longer hides the declaration from them.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compiles")
    .js
    .code
}

fn parses(code: &str) -> bool {
    let allocator = oxc_allocator::Allocator::default();
    oxc_parser::Parser::new(&allocator, code, oxc_span::SourceType::mjs())
        .parse()
        .diagnostics
        .is_empty()
}

/// The corpus shape: a re-exported prop declared last in a multi-declarator
/// list, with a comment on the line before it.
#[test]
fn a_reexported_prop_behind_a_comment_stays_a_declaration() {
    let out = client(
        "<script>\n\tlet a = 1,\n\t\t// ; c\n\t\tlabelId = \"\";\n\texport { labelId };\n</script>\n\n<p id={labelId}>{a}</p>\n",
    );
    assert!(parses(&out), "{out}");
    assert!(
        out.contains("let // ; c\n\tlabelId = $.prop($$props, 'labelId', 8, \"\");"),
        "{out}"
    );
    assert!(!out.contains("labelId(\"\")"), "{out}");
}

#[test]
fn the_same_holds_for_a_const_list() {
    let out =
        client("<script>\n\tconst a = 1,\n\t\t// c\n\t\tb = 2;\n</script>\n\n<p>{a}{b}</p>\n");
    assert!(parses(&out), "{out}");
    assert!(out.contains("const // c\n\tb = 2;"), "{out}");
}

/// The same for a comment LEADING the declaration rather than sitting between
/// two declarators: the split moves it after the keyword either way, and the
/// legacy state lowering must still see the declaration behind it. This shape
/// compiled to `let a = 1` — no `$.mutable_source`, so the variable silently
/// lost its reactivity — while the output still parsed.
#[test]
fn a_leading_comment_does_not_hide_the_state_lowering() {
    let out = client(
        "<script>\n\t// lead\n\tlet a = 1,\n\t\tb = 2;\n\tfunction bump() { a += 1; }\n</script>\n\n<button onclick={bump}>{a}{b}</button>\n",
    );
    assert!(parses(&out), "{out}");
    assert!(
        out.contains("let // lead\n\ta = $.mutable_source(1);"),
        "{out}"
    );
}

#[test]
fn a_plain_state_variable_behind_a_comment_still_declares() {
    let out = client(
        "<script>\n\tlet a = 1,\n\t\t// c\n\t\tb = 2;\n\tfunction bump() { b += 1; }\n</script>\n\n<button onclick={bump}>{a}{b}</button>\n",
    );
    assert!(parses(&out), "{out}");
    assert!(
        out.contains("let // c\n\tb = $.mutable_source(2);"),
        "{out}"
    );
}

#[test]
fn a_real_assignment_after_a_declaration_is_still_an_assignment() {
    let out = client(
        "<script>\n\texport let labelId = \"\";\n\tfunction set() { labelId = \"x\"; }\n</script>\n\n<button onclick={set}>{labelId}</button>\n",
    );
    assert!(parses(&out), "{out}");
    assert!(out.contains("labelId(\"x\")"), "{out}");
}

#[test]
fn a_variable_actually_named_after_the_keyword_is_untouched() {
    let out = client(
        "<script>\n\tlet letter = 1;\n\tlet constant = 2;\n</script>\n\n<p>{letter}{constant}</p>\n",
    );
    assert!(parses(&out), "{out}");
    assert!(out.contains("let letter = 1;"), "{out}");
    assert!(out.contains("let constant = 2;"), "{out}");
}

/// A comment sharing the declarator's line was written there and keeps that
/// line: only a comment that ENDED its own line is one esrap moves. The prop
/// lowering re-emits the declaration from its own text, so a peel that does not
/// separate the two either drops this one or breaks the line upstream keeps.
#[test]
fn a_same_line_block_comment_keeps_the_declarators_line() {
    let out =
        client("<script>\n\texport let /* same line */ a = [],\n\t\tb = 2;\n</script>\n{a}{b}\n");
    assert!(
        out.contains("let /* same line */ a = $.prop($$props, 'a', 24, () => []);"),
        "{out}"
    );
}
