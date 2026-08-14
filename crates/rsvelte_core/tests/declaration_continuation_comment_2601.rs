//! A multi-declarator `let` whose declarators sit on separate lines is
//! accumulated onto one line before it is split. A line comment between two
//! declarators has to keep its newline, or the declarators after it end up
//! inside the comment.

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

/// The output with its comments removed and its whitespace collapsed — the form
/// in which "the declarator is still code" is a substring test.
fn code_only(out: &str) -> String {
    let mut kept = String::with_capacity(out.len());
    let bytes = out.as_bytes();
    let mut i = 0;
    while i < bytes.len() {
        if bytes[i] == b'/' && bytes.get(i + 1) == Some(&b'/') {
            while i < bytes.len() && bytes[i] != b'\n' {
                i += 1;
            }
        } else if bytes[i] == b'/' && bytes.get(i + 1) == Some(&b'*') {
            i = out[i + 2..]
                .find("*/")
                .map_or(bytes.len(), |at| i + 2 + at + 2);
        } else {
            kept.push(bytes[i] as char);
            i += 1;
        }
    }
    kept.split_whitespace().collect::<Vec<_>>().join(" ")
}

#[test]
fn a_line_comment_between_declarators_does_not_swallow_the_next_one() {
    let out =
        client("<script>\n\tlet a,\n\t\tb = 1,\n// c\n\t\tc;\n</script>\n\n<p>{a}{b}{c}</p>\n");
    assert!(parses(&out), "{out}");
    assert!(code_only(&out).contains("let c;"), "{out}");
}

#[test]
fn the_same_holds_for_a_typescript_definite_assignment_list() {
    let out = client(
        "<script lang=\"ts\">\n\tlet a!: string,\n\t\tb = 1,\n// c\n\t\tc!: number;\n</script>\n\n<p>{a}{b}{c}</p>\n",
    );
    assert!(parses(&out), "{out}");
    assert!(code_only(&out).contains("let c;"), "{out}");
}

#[test]
fn a_line_comment_before_the_first_continuation_line_keeps_it() {
    let out = client("<script>\n\tlet a, // keep\n\t\tb = 1;\n</script>\n\n<p>{a}{b}</p>\n");
    assert!(parses(&out), "{out}");
    assert!(code_only(&out).contains("let b = 1;"), "{out}");
}

#[test]
fn a_block_comment_between_declarators_does_not_swallow_the_next_one() {
    let out = client("<script>\n\tlet a,\n/* c */\n\t\tc;\n</script>\n\n<p>{a}{c}</p>\n");
    assert!(parses(&out), "{out}");
    assert!(code_only(&out).contains("let c;"), "{out}");
}

#[test]
fn a_multi_line_declaration_without_comments_is_unchanged() {
    let out = client("<script>\n\tlet a = 1,\n\t\tb = 2;\n</script>\n\n<p>{a}{b}</p>\n");
    assert!(parses(&out), "{out}");
    assert!(out.contains("let a = 1;"), "{out}");
    assert!(out.contains("let b = 2;"), "{out}");
}

#[test]
fn a_slash_inside_a_string_declarator_is_not_a_comment() {
    let out = client("<script>\n\tlet a = '// x',\n\t\tb = 2;\n</script>\n\n<p>{a}{b}</p>\n");
    assert!(parses(&out), "{out}");
    assert!(out.contains("let b = 2;"), "{out}");
}
