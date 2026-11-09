use rsvelte_kernel::source::positions::{SourceLocation, Span};
use rsvelte_typescript_syntax::operators::{BinaryOperator, LogicalOperator};
use rsvelte_typescript_syntax::parser::parse_program;
use rsvelte_typescript_syntax::syntax_tree::SyntaxTree;

use super::{number, print_expression, print_program};

#[test]
fn number_to_string_matches_javascript() {
    for (v, javascript) in [
        (0.0, "0"),
        (-0.0, "0"),
        (1.0, "1"),
        (-42.5, "-42.5"),
        (0.1 + 0.2, "0.30000000000000004"),
        (1e21, "1e+21"),
        (123_456_789_012_345_680_000.0, "123456789012345680000"),
        (1e-7, "1e-7"),
        (0.000_001, "0.000001"),
        (1.5e-10, "1.5e-10"),
        (f64::INFINITY, "Infinity"),
        (f64::NAN, "NaN"),
    ] {
        assert_eq!(number(v), javascript, "{v:?}");
    }
}

#[test]
fn long_chains_print_without_recursing_per_link() {
    const LINKS: usize = 100_000;
    std::thread::Builder::new()
        .stack_size(1 << 20)
        .spawn(|| {
            let mut tree = SyntaxTree::new();
            let mut cases = Vec::new();
            for (shape, link) in [
                ("member", ".b"),
                ("call", "()"),
                ("binary", " + a"),
                ("logical", " || a"),
            ] {
                let mut e = tree.identifier("a");
                for _ in 0..LINKS {
                    e = match shape {
                        "member" => {
                            let b = tree.identifier("b");
                            tree.member(e, b, false, false, SourceLocation::SYNTHETIC)
                        }
                        "call" => tree.call0(e, &[]),
                        "binary" => {
                            let a = tree.identifier("a");
                            tree.binary(BinaryOperator::Add, e, a, SourceLocation::SYNTHETIC)
                        }
                        _ => {
                            let a = tree.identifier("a");
                            tree.logical(LogicalOperator::Or, e, a, SourceLocation::SYNTHETIC)
                        }
                    };
                }
                cases.push((shape, e, format!("a{}", link.repeat(LINKS))));
            }
            for (shape, e, expected) in cases {
                assert_eq!(print_expression(&tree, "", e), expected, "{shape}");
            }
        })
        .expect("spawns")
        .join()
        .expect("prints within a 1 MiB stack");
}

/// Prints `source` on a stack of `stack` bytes, after parsing it on a large one.
fn print_on(source: &str, stack: usize) -> String {
    let mut tree = SyntaxTree::new();
    let program = std::thread::scope(|scope| {
        std::thread::Builder::new()
            .stack_size(1 << 30)
            .spawn_scoped(scope, || {
                let range = Span::new(0, u32::try_from(source.len()).expect("small source"));
                parse_program(&mut tree, source, range, false).expect("parses")
            })
            .expect("spawns")
            .join()
            .expect("parses on a large stack")
    });
    std::thread::scope(|scope| {
        std::thread::Builder::new()
            .stack_size(stack)
            .spawn_scoped(scope, || print_program(&tree, source, program).out)
            .expect("spawns")
            .join()
            .expect("prints")
    })
}

#[test]
fn deep_nesting_prints_on_a_small_stack_as_on_a_large_one() {
    const DEPTH: usize = 20_000;
    // Each nested statement is indented, so their output grows with the square of the depth.
    const STATEMENTS: usize = 5_000;
    for source in [
        format!("x = {}{};", "[".repeat(DEPTH), "]".repeat(DEPTH)),
        format!(
            "{}x;{}",
            "function f(){".repeat(STATEMENTS),
            "}".repeat(STATEMENTS)
        ),
        format!("{}x;{}", "{".repeat(STATEMENTS), "}".repeat(STATEMENTS)),
    ] {
        assert_eq!(print_on(&source, 1 << 20), print_on(&source, 1 << 30));
    }
}
