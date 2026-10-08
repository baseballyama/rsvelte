use rsvelte_kernel::source::positions::SourceLocation;
use rsvelte_svelte_semantic::semantic::resolve::{RUNES, rune_call};
use rsvelte_typescript::SyntaxTree;

#[test]
fn every_public_rune_is_recognized_in_both_supported_shapes() {
    let mut tree = SyntaxTree::new();
    for &rune in RUNES {
        let callee = tree.identifier(rune);
        let argument = tree.identifier("argument");
        let call = tree.call0(callee, &[argument]);
        assert_eq!(
            rune_call(&tree, call),
            Some((rune, Some(argument))),
            "{rune}"
        );
        if let Some((root, member)) = rune.split_once('.') {
            let root = tree.identifier(root);
            let callee = tree.dot(root, member);
            let call = tree.call0(callee, &[]);
            assert_eq!(rune_call(&tree, call), Some((rune, None)), "{rune}");
        }
    }
}

#[test]
fn ordinary_computed_and_nested_calls_are_not_runes() {
    let mut tree = SyntaxTree::new();
    let root = tree.identifier("$state");
    let raw = tree.identifier("raw");
    let computed = tree.member(root, raw, true, false, SourceLocation::SYNTHETIC);
    let nested = tree.dot(root, "raw");
    let nested = tree.dot(nested, "extra");
    let ordinary = tree.identifier("ordinary");
    for callee in [computed, nested, ordinary] {
        let call = tree.call0(callee, &[]);
        assert_eq!(rune_call(&tree, call), None);
    }
    assert_eq!(rune_call(&tree, root), None);
}

#[test]
fn destructured_runes_classify_every_leaf_without_classifying_keys() {
    use rsvelte_kernel::source::positions::Span;
    use rsvelte_svelte_compiler_syntax_tree::compiler_syntax_tree::{
        Children, CompilerSyntaxTreeBuilder,
    };
    use rsvelte_svelte_semantic::semantic::resolve::{self, BindingKind};
    use rsvelte_typescript::parser;

    let source = concat!(
        "let { first: a, nested: [b = 1, ...c], ...d } = $derived(value); ",
        "let [e, f] = $state([]); let { g } = $state.raw({}); ",
        "let [h] = $derived.by(() => []);",
    );
    let mut tree = SyntaxTree::new();
    let program =
        parser::parse_program(&mut tree, source, Span::new(0, source.len() as u32), false)
            .expect("valid JavaScript");
    let compiler_syntax_tree =
        CompilerSyntaxTreeBuilder::new(source, 0, 0).finish(Children::default());
    let resolution = resolve::resolve(&tree, program, &compiler_syntax_tree);
    for (name, kind) in [
        ("a", BindingKind::Derived),
        ("b", BindingKind::Derived),
        ("c", BindingKind::Derived),
        ("d", BindingKind::Derived),
        ("e", BindingKind::State),
        ("f", BindingKind::State),
        ("g", BindingKind::RawState),
        ("h", BindingKind::DerivedBy),
    ] {
        let atom = tree.atoms.lookup(name).expect("a declared name");
        let binding = resolution.sem.root_binding(atom).expect("a root binding");
        assert_eq!(resolution.bindings[binding].kind, kind, "{name}");
    }
    for name in ["first", "nested"] {
        let atom = tree.atoms.lookup(name).expect("a property key");
        assert!(resolution.sem.root_binding(atom).is_none(), "{name}");
    }
}

#[test]
fn nested_runes_classify_bindings_in_their_own_scope() {
    use rsvelte_kernel::source::positions::Span;
    use rsvelte_svelte_compiler_syntax_tree::compiler_syntax_tree::{
        Children, CompilerSyntaxTreeBuilder,
    };
    use rsvelte_svelte_semantic::semantic::resolve::{self, BindingKind};
    use rsvelte_typescript::parser;

    let source = concat!(
        "function counter() { let value = $state(1); let [offset] = $derived([value]);",
        " return () => value + offset; } let value = 2;"
    );
    let mut tree = SyntaxTree::new();
    let program =
        parser::parse_program(&mut tree, source, Span::new(0, source.len() as u32), false)
            .expect("valid JavaScript");
    let compiler_syntax_tree =
        CompilerSyntaxTreeBuilder::new(source, 0, 0).finish(Children::default());
    let resolution = resolve::resolve(&tree, program, &compiler_syntax_tree);
    let kinds: Vec<_> = resolution
        .sem
        .bindings
        .iter_enumerated()
        .filter(|(_, binding)| matches!(tree.name(binding.node), "value" | "offset"))
        .map(|(identifier, binding)| {
            (
                tree.name(binding.node),
                resolution.bindings[identifier].kind,
            )
        })
        .collect();
    assert_eq!(
        kinds,
        vec![
            ("value", BindingKind::State),
            ("offset", BindingKind::Derived),
            ("value", BindingKind::Normal)
        ]
    );
}
