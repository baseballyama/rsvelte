//! Port of esrap's `test/additional-comments.test.js`.
//!
//! esrap lets a caller inject synthetic comments around a node via the
//! `getLeadingComments` / `getTrailingComments` options. rsvelte_esrap exposes
//! the same surface through [`rsvelte_esrap::CommentHooks`] +
//! [`rsvelte_esrap::print_with_hooks`]. The callbacks here target the function's
//! `return` statement, exactly like the JS test's `n === returnStatement`.

use oxc_allocator::Allocator;
use oxc_ast::ast::Statement;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_esrap::{CommentHooks, PrintOptions, SynthComment, print_with_hooks};

fn parse_and_print(source: &str, hooks: &CommentHooks) -> String {
    let alloc = Allocator::default();
    let ret = Parser::new(&alloc, source, SourceType::default().with_module(true)).parse();
    assert!(
        ret.diagnostics.is_empty(),
        "parse error: {:?}",
        ret.diagnostics
    );
    print_with_hooks(&ret.program, source, &PrintOptions::default(), hooks)
}

fn is_return(stmt: &Statement) -> bool {
    matches!(stmt, Statement::ReturnStatement(_))
}

#[test]
fn leading_and_trailing_comments_inserted() {
    let source = "function example() {\n\tconst x = 1;\n\treturn x;\n}";
    let hooks = CommentHooks {
        get_leading: Some(Box::new(|n: &Statement| {
            if is_return(n) {
                vec![SynthComment::line(" This is a leading comment")]
            } else {
                vec![]
            }
        })),
        get_trailing: Some(Box::new(|n: &Statement| {
            if is_return(n) {
                vec![SynthComment::block(" This is a trailing comment ")]
            } else {
                vec![]
            }
        })),
    };
    let code = parse_and_print(source, &hooks);
    assert!(
        code.contains("// This is a leading comment"),
        "got:\n{code}"
    );
    assert!(
        code.contains("/* This is a trailing comment */"),
        "got:\n{code}"
    );
}

#[test]
fn only_leading_comments_when_specified() {
    let source = "function test() { return 42; }";
    let hooks = CommentHooks {
        get_leading: Some(Box::new(|n: &Statement| {
            if is_return(n) {
                vec![SynthComment::line(" Leading only ")]
            } else {
                vec![]
            }
        })),
        ..Default::default()
    };
    let code = parse_and_print(source, &hooks);
    assert!(code.contains("// Leading only"), "got:\n{code}");
    assert!(!code.contains("trailing"), "got:\n{code}");
}

#[test]
fn only_trailing_comments_when_specified() {
    let source = "function test() { return 42; }";
    let hooks = CommentHooks {
        get_trailing: Some(Box::new(|n: &Statement| {
            if is_return(n) {
                vec![SynthComment::block(" Trailing only ")]
            } else {
                vec![]
            }
        })),
        ..Default::default()
    };
    let code = parse_and_print(source, &hooks);
    assert!(code.contains("/* Trailing only */"), "got:\n{code}");
    assert!(!code.contains("//"), "got:\n{code}");
}

#[test]
fn multi_line_leading_block_comment() {
    let source = "function example() {\n\tconst x = 1;\n\treturn x;\n}";
    let hooks = CommentHooks {
        get_leading: Some(Box::new(|n: &Statement| {
            if is_return(n) {
                vec![SynthComment::block("*\n * This is a leading comment\n ")]
            } else {
                vec![]
            }
        })),
        ..Default::default()
    };
    let code = parse_and_print(source, &hooks);
    let expected = "function example() {\n\tconst x = 1;\n\n\t/**\n\t * This is a leading comment\n\t */\n\treturn x;\n}";
    assert_eq!(code, expected, "got:\n{code}");
}
