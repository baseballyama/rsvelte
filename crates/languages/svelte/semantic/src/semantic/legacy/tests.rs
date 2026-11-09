use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript::{SyntaxTree, parser, scope};

use super::{Legacy, TopLevel, Variable};

/// Each reference as `(name, what it refers to)`, in source order.
fn references(source: &str) -> (Legacy, Vec<(String, Option<TopLevel>)>) {
    let mut tree = SyntaxTree::new();
    let program =
        parser::parse_program(&mut tree, source, Span::new(0, source.len() as u32), false)
            .expect("parses");
    let sem = scope::analyze(&tree, program, &[]);
    let legacy = Legacy::new(&tree, &sem, &[program]);
    let out = sem
        .references
        .iter()
        .zip(&legacy.references)
        .map(|(reference, top)| (tree.name(reference.node).to_owned(), *top))
        .collect();
    (legacy, out)
}

#[test]
fn a_reactive_assignment_declares_an_undeclared_name_and_stores_resolve() {
    let (legacy, out) = references(
        "let a = 1; let s = 0;\n$: b = a;\n$: b = 2;\nfunction f(a) { return b + a + $s + $b + $$props + $x; }",
    );
    assert_eq!(legacy.reactive_statements.len(), 2);
    assert_eq!(legacy.implicit.len(), 1);
    let names: Vec<(&str, Option<TopLevel>)> = out
        .iter()
        .map(|(name, top)| (name.as_str(), *top))
        .collect();
    let declared = |name: &str| match names.iter().find(|(n, _)| *n == name) {
        Some((_, Some(TopLevel { variable, .. }))) => Some(*variable),
        _ => None,
    };
    let a = declared("a").expect("the top-level `a`");
    assert!(matches!(a, Variable::Declared(_)));
    let implicit = Some(TopLevel {
        variable: Variable::Implicit(0),
        store: false,
    });
    assert_eq!(
        names,
        [
            (
                "a",
                Some(TopLevel {
                    variable: a,
                    store: false
                })
            ),
            ("s", names[1].1),
            ("b", implicit),
            (
                "a",
                Some(TopLevel {
                    variable: a,
                    store: false
                })
            ),
            ("b", implicit),
            ("b", implicit),
            // The parameter `a` shadows the top-level one.
            ("a", None),
            (
                "$s",
                Some(TopLevel {
                    variable: declared("s").expect("`s`"),
                    store: true
                })
            ),
            (
                "$b",
                Some(TopLevel {
                    variable: Variable::Implicit(0),
                    store: true
                })
            ),
            ("$$props", None),
            ("$x", None),
        ]
    );
}

#[test]
fn a_declared_name_and_a_block_are_not_implicit() {
    let (legacy, _) = references("let c;\n$: c = 1;\n$: { d = 1; }\nfoo: e = 1;");
    assert_eq!(legacy.reactive_statements.len(), 2);
    assert!(legacy.implicit.is_empty());
}
