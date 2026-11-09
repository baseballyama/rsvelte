use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_syntax::parser::parse_program;
use rsvelte_typescript_syntax::syntax_tree::{Kind, NodeIdentifier, SyntaxTree};

/// The expression of each statement in `source_text`.
fn expressions(syntax_tree: &mut SyntaxTree, source_text: &str) -> Vec<NodeIdentifier> {
    let program = parse_program(
        syntax_tree,
        source_text,
        Span::new(0, source_text.len() as u32),
        false,
    )
    .expect("parses");
    let Kind::Program(body) = syntax_tree.kind(program) else {
        panic!("a program")
    };
    body.iter()
        .map(|&statement| match syntax_tree.kind(statement) {
            Kind::ExpressionStatement(e) => e,
            kind => panic!("an expression statement, not {kind:?}"),
        })
        .collect()
}

#[test]
fn only_the_outermost_link_of_an_optional_chain_ends_it() {
    let mut syntax_tree = SyntaxTree::new();
    let [whole, grouped, call, plain] =
        expressions(&mut syntax_tree, "a?.b.c; (a?.b).c; f?.()(); a.b.c;")[..]
    else {
        panic!("four statements")
    };
    let object = |e| match syntax_tree.kind(e) {
        Kind::Member { object, .. } => object,
        Kind::Call { callee, .. } => callee,
        kind => panic!("a link, not {kind:?}"),
    };
    assert!(syntax_tree.is_chain(whole));
    assert!(!syntax_tree.is_chain(object(whole)));
    assert!(!syntax_tree.is_chain(grouped));
    assert!(syntax_tree.is_chain(object(grouped)));
    assert!(syntax_tree.is_chain(call));
    assert!(!syntax_tree.is_chain(plain));
}
