//! A multi-line block comment opening on the instance script's first line kept
//! the source indentation on top of the output's (#4671). Expected values are
//! the official compiler's output for the same input.
//!
//! The corpus output gate compares ASTs with `CommentPolicy::Ignore`, so a
//! difference inside a comment token cannot be pinned by a `pattern-corpus`
//! repro.

use rsvelte_core::compiler::{CompileOptions, GenerateMode, compile};

fn client(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .unwrap()
    .js
    .code
}

fn script(body: &str) -> String {
    format!("<script>\n{body}\n</script>\n\n<p>{{n}}</p>\n")
}

#[test]
fn a_comment_trailing_the_first_statement_keeps_one_indent() {
    let code = client(&script("\tlet q = 1 /* c\n\tmore */\n\tlet n = $state(q)"));
    assert!(code.contains("\n\tmore */\n"), "{code}");
}

#[test]
fn an_unindented_continuation_line_is_indented_once() {
    let code = client(&script("\tlet q = 1 /* c\nmore */\n\tlet n = $state(q)"));
    assert!(code.contains("\n\tmore */\n"), "{code}");
}

#[test]
fn a_deeper_continuation_line_keeps_its_extra_level() {
    let code = client(&script(
        "\tlet q = 1 /* c\n\t\tmore */\n\tlet n = $state(q)",
    ));
    assert!(code.contains("\n\t\tmore */\n"), "{code}");
}

#[test]
fn the_source_semicolon_does_not_change_it() {
    let code = client(&script("\tlet q = 1; /* c\n\tmore */\n\tlet n = $state(q)"));
    assert!(code.contains("\n\tmore */\n"), "{code}");
}

#[test]
fn a_comment_trailing_a_rune_declaration_is_read_the_same_way() {
    let code = client(&script("\tlet n = $state(1) /* c\n\tmore */"));
    assert!(code.contains("\n\tmore */\n"), "{code}");
}

#[test]
fn a_comment_inside_a_function_body_still_moves_with_its_opener() {
    let code = client(&script(
        "\tfunction f() {\n\t\t/* c\n\t\tmore */\n\t\treturn 1;\n\t}\n\tlet n = $state(f())",
    ));
    assert!(code.contains("\n\t\tmore */\n"), "{code}");
}

#[test]
fn a_comment_on_its_own_first_line_is_unchanged() {
    let code = client(&script("\t/* c\n\tmore */\n\tlet n = $state(1)"));
    assert!(code.contains("\n\tmore */\n"), "{code}");
}

#[test]
fn a_comment_opening_on_a_later_line_is_unchanged() {
    let code = client(&script(
        "\tlet z = 0\n\tlet q = 1 /* c\n\tmore */\n\tlet n = $state(q)",
    ));
    assert!(code.contains("\n\tmore */\n"), "{code}");
}

#[test]
fn a_three_line_comment_on_its_own_lines_is_unchanged() {
    let code = client(&script("\t/* a\n\tb\n\tc */\n\tlet n = $state(1)"));
    assert!(code.contains("\n\tb\n\tc */\n"), "{code}");
}
