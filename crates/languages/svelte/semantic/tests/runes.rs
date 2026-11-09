use rsvelte_kernel::source::positions::SourceLocation;
use rsvelte_svelte_semantic::resolve::{RUNE_ROOTS, RUNES, rune_call};
use rsvelte_typescript_syntax::SyntaxTree;

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
        // `$inspect().with` calls a member of a call; `inspect_with_is_a_rune` builds it.
        if let Some((root, member)) = rune.split_once('.')
            && !root.ends_with("()")
        {
            let root = tree.identifier(root);
            let callee = tree.dot(root, member);
            let call = tree.call0(callee, &[]);
            assert_eq!(rune_call(&tree, call), Some((rune, None)), "{rune}");
        }
    }
}

#[test]
fn the_rune_roots_are_the_runes_up_to_their_first_dot_or_parenthesis() {
    let mut roots: Vec<&str> = RUNES
        .iter()
        .map(|rune| {
            rune.split(['.', '('])
                .next()
                .expect("split yields one part")
        })
        .collect();
    roots.sort_unstable();
    roots.dedup();
    let mut declared = RUNE_ROOTS.to_vec();
    declared.sort_unstable();
    assert_eq!(declared, roots);
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
    use rsvelte_svelte_semantic::compiler_syntax_tree::{Children, CompilerSyntaxTreeBuilder};
    use rsvelte_svelte_semantic::resolve::{self, BindingKind};
    use rsvelte_typescript_syntax::parser;

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
    let resolution = resolve::resolve(&tree, source, program, &compiler_syntax_tree);
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
    use rsvelte_svelte_semantic::compiler_syntax_tree::{Children, CompilerSyntaxTreeBuilder};
    use rsvelte_svelte_semantic::resolve::{self, BindingKind};
    use rsvelte_typescript_syntax::parser;

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
    let resolution = resolve::resolve(&tree, source, program, &compiler_syntax_tree);
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

/// The kind of the top-level binding `name`, whether `$<rune>` is a store subscription, and the
/// rune of the initializer of `name`'s declarator, in `source`.
fn store_or_rune(
    source: &str,
    name: &str,
    rune: &str,
) -> (
    rsvelte_svelte_semantic::resolve::BindingKind,
    bool,
    Option<&'static str>,
) {
    use rsvelte_kernel::source::positions::Span;
    use rsvelte_svelte_semantic::compiler_syntax_tree::{Children, CompilerSyntaxTreeBuilder};
    use rsvelte_svelte_semantic::resolve;
    use rsvelte_typescript_syntax::parser;

    let mut tree = SyntaxTree::new();
    let program =
        parser::parse_program(&mut tree, source, Span::new(0, source.len() as u32), false)
            .expect("valid JavaScript");
    let compiler_syntax_tree =
        CompilerSyntaxTreeBuilder::new(source, 0, 0).finish(Children::default());
    let resolution = resolve::resolve(&tree, source, program, &compiler_syntax_tree);
    let atom = tree.atoms.lookup(name).expect("a declared name");
    let binding = resolution.sem.root_binding(atom).expect("a root binding");
    let initializer = resolution.sem.bindings[binding]
        .initializer(&tree)
        .expect("an initializer");
    assert_eq!(
        resolve::runes(&tree, source, program, None).rune(&tree, initializer),
        resolution.rune(&tree, initializer),
        "the narrower query agrees with the resolution"
    );
    (
        resolution.bindings[binding].kind,
        resolution.is_store_subscription(rune),
        resolution
            .rune(&tree, initializer)
            .map(|(called, _)| called),
    )
}

#[test]
fn a_binding_named_after_a_rune_makes_the_rune_a_store_subscription() {
    use rsvelte_svelte_semantic::resolve::BindingKind;

    let imported = "import { state } from './store.js'; let a = $state(0);";
    assert_eq!(
        store_or_rune(imported, "a", "$state"),
        (BindingKind::Normal, true, None)
    );
    let declared = "let state = 1; let a = $state(0);";
    assert_eq!(
        store_or_rune(declared, "a", "$state"),
        (BindingKind::Normal, true, None)
    );
    // A binding initialized by a rune shadows nothing.
    let rune = "let state = $state(1); let a = $state(0);";
    assert_eq!(
        store_or_rune(rune, "a", "$state"),
        (BindingKind::State, false, Some("$state"))
    );
    // Only `$state` is a subscription; `$derived` is still the rune.
    let other = "import { state } from './store.js'; let a = $derived(0);";
    assert_eq!(
        store_or_rune(other, "a", "$derived"),
        (BindingKind::Derived, false, Some("$derived"))
    );
}

#[test]
fn derived_from_svelte_store_and_props_keep_their_runes() {
    use rsvelte_svelte_semantic::resolve::BindingKind;

    let store = "import { derived } from 'svelte/store'; let a = $derived(0);";
    assert_eq!(
        store_or_rune(store, "a", "$derived"),
        (BindingKind::Derived, false, Some("$derived"))
    );
    let elsewhere = "import { derived } from './derived.js'; let a = $derived(0);";
    assert_eq!(
        store_or_rune(elsewhere, "a", "$derived"),
        (BindingKind::Normal, true, None)
    );
    // `$props()` makes a prop called `props` no subscription, and any other prop one.
    let props = "let { props } = $props(); let a = $props.id();";
    assert_eq!(
        store_or_rune(props, "a", "$props"),
        (BindingKind::Normal, false, Some("$props.id"))
    );
    let state = "let { state } = $props(); let a = $state(0);";
    assert_eq!(
        store_or_rune(state, "a", "$state"),
        (BindingKind::Normal, true, None)
    );
}

#[test]
fn inspect_with_is_a_rune() {
    let mut tree = SyntaxTree::new();
    let inspect = tree.identifier("$inspect");
    let value = tree.identifier("value");
    let inspected = tree.call0(inspect, &[value]);
    let callee = tree.dot(inspected, "with");
    let callback = tree.identifier("callback");
    let call = tree.call0(callee, &[callback]);
    assert_eq!(
        rune_call(&tree, call),
        Some(("$inspect().with", Some(callback)))
    );
}
