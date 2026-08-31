//! Three independent pins for esrap's keyword source-map anchors.
//!
//! `write_source_keyword` brackets a keyword with `location(line, column)` and
//! `location(line, column + keyword.length)`, and esrap's `run()` pushes one
//! segment per `Location` command. Each test below fails on its own when one of
//! those properties is dropped, so a single "the anchors are right" assertion
//! cannot be satisfied by the other two.

use oxc_allocator::Allocator;
use oxc_ast::ast::Statement;
use oxc_parser::Parser;
use oxc_span::{SourceType, Span};

use rsvelte_esrap::{Mapping, PrintOptions, PrintWithMap, print_with_map};

fn print(source: &str, synthesize_declaration: bool) -> PrintWithMap {
    let allocator = Allocator::default();
    let source_type = SourceType::default().with_module(true);
    let mut ret = Parser::new(&allocator, source, source_type).parse();
    assert!(
        ret.diagnostics.is_empty(),
        "parse errors: {:?}",
        ret.diagnostics
    );
    if synthesize_declaration
        && let Some(Statement::VariableDeclaration(d)) = ret.program.body.first_mut()
    {
        // A builder-made node carries no `loc` upstream; rsvelte spells that as
        // an empty span.
        d.span = Span::new(0, 0);
    }
    print_with_map(&ret.program, source, &PrintOptions::default())
}

fn at_generated_column(mappings: &[Mapping], line: u32, column: u32) -> Vec<(u32, u32)> {
    mappings
        .iter()
        .filter(|m| m.gen_line == line && m.gen_column == column)
        .map(|m| (m.source_line, m.source_column))
        .collect()
}

/// The keyword's end anchor is `column + keyword.length` even where the source
/// line is shorter than that — `import` alone on its line is 6 characters wide
/// and the anchor for `import ` lands one past its terminator. The `{` that
/// follows is unmapped, so this column carries that anchor alone.
#[test]
fn a_keyword_end_anchor_may_sit_past_the_end_of_its_source_line() {
    let printed = print("import\n{a}\nfrom 'm';", false);
    assert_eq!(printed.code, "import { a } from 'm';");
    assert_eq!(
        at_generated_column(&printed.mappings, 0, 7),
        vec![(0, 7)],
        "no anchor at the end of `import `: {:?}",
        printed.mappings
    );
}

/// Two anchors at one generated column are two segments. The keyword's end and
/// the following identifier's start collide at column 4 here, and collapsing
/// them loses whichever the collapse discards.
#[test]
fn b_two_anchors_at_one_generated_column_are_two_segments() {
    let printed = print("let x = 1;", false);
    assert_eq!(printed.code, "let x = 1;");
    assert_eq!(
        at_generated_column(&printed.mappings, 0, 4),
        vec![(0, 4), (0, 4)],
        "expected the keyword end and the binding start: {:?}",
        printed.mappings
    );
}

/// A declaration with no source span is builder-made, so its keyword carries no
/// anchor at all — mapping it would point every synthesized `var`/`let` at
/// offset 0 of the file.
#[test]
fn c_a_synthesized_declaration_keyword_is_not_anchored() {
    let printed = print("let x = 1;", true);
    assert_eq!(printed.code, "let x = 1;");
    assert_eq!(
        at_generated_column(&printed.mappings, 0, 0),
        Vec::<(u32, u32)>::new(),
        "a spanless declaration anchored its keyword: {:?}",
        printed.mappings
    );
}
