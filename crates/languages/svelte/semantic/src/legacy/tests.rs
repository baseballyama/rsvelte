use rsvelte_svelte_syntax::parse::parse;

use super::{Legacy, TopLevel, Variable};
use crate::compiler_syntax_tree::lower;
use crate::resolve::resolve;

/// Each reference of the instance script `script` as `(name, what it refers to)`, in source
/// order.
fn references(script: &str) -> (Legacy, Vec<(String, Option<TopLevel>)>) {
    let source = format!("<script>{script}</script>");
    let component = parse(&source).expect("parses");
    let lowered = lower(&component, &source);
    let instance = component.instance.as_ref().map(|s| s.program);
    let res = resolve(&component.javascript, instance, None, &lowered);
    let legacy = Legacy::new(&res, &instance.into_iter().collect::<Vec<_>>());
    let mut names: Vec<(u32, String, usize)> = Vec::new();
    let scoping = res.scoping();
    for symbol in scoping.symbol_ids() {
        for &reference in scoping.get_resolved_reference_ids(symbol) {
            let node = scoping.get_reference(reference).node_id();
            let span = oxc_span::GetSpan::span(&res.semantic().nodes().kind(node));
            names.push((
                span.start,
                scoping.symbol_name(symbol).to_owned(),
                reference.index(),
            ));
        }
    }
    for (name, ids) in scoping.root_unresolved_references() {
        for &reference in ids {
            let node = scoping.get_reference(reference).node_id();
            let span = oxc_span::GetSpan::span(&res.semantic().nodes().kind(node));
            names.push((span.start, name.as_str().to_owned(), reference.index()));
        }
    }
    names.sort_unstable();
    let out = names
        .into_iter()
        .map(|(_, name, reference)| (name, legacy.references[reference]))
        .collect();
    (legacy, out)
}

#[test]
fn a_reactive_assignment_declares_an_undeclared_name_and_stores_resolve() {
    let (legacy, out) = references(
        "let a = 1; let s = 0;\n$: b = a;\n$: b = 2;\nfunction f(a) { return b + a + $s + $b + \
            $$props + $x; }",
    );
    assert_eq!(legacy.reactive_statements.len(), 2);
    assert_eq!(legacy.implicit.len(), 1);
    assert!(matches!(
        out[5].1,
        Some(TopLevel {
            variable: Variable::Declared(_),
            store: true
        })
    ));
    assert_ne!(
        out[5].1.map(|top| top.variable),
        out[1].1.map(|top| top.variable)
    );
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
            ("$s", names[5].1),
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
