use oxc_allocator::Allocator;
use oxc_ast::ast::Expression;
use oxc_semantic::SymbolId;
use rsvelte_svelte_semantic::compiler_syntax_tree::lower;
use rsvelte_svelte_semantic::resolve::{
    self, BindingKind, RUNE_ROOTS, RUNES, Resolution, rune_call,
};

/// The rune `source` calls, and whether its first argument is the identifier `argument`.
fn shape(source: &str) -> Option<(&'static str, bool)> {
    let allocator = Allocator::default();
    let e = oxc_parser::Parser::new(&allocator, source, oxc_span::SourceType::mjs())
        .parse_expression()
        .expect("an expression");
    rune_call(&e).map(|(rune, argument)| {
        let named = matches!(argument, Some(Expression::Identifier(a)) if a.name == "argument");
        (rune, named)
    })
}

#[test]
fn every_public_rune_is_recognized_by_its_shape() {
    for &rune in RUNES {
        assert_eq!(
            shape(&format!("{rune}(argument)")),
            Some((rune, true)),
            "{rune}"
        );
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
    for source in [
        "$state[raw]()",
        "$state.raw.extra()",
        "ordinary()",
        "$state",
    ] {
        assert_eq!(shape(source), None, "{source}");
    }
}

#[test]
fn inspect_with_is_a_rune() {
    assert_eq!(
        shape("$inspect(value).with(argument)"),
        Some(("$inspect().with", true))
    );
}

/// The resolution of a component whose instance script is `script`.
fn resolution(script: &str) -> Resolution {
    let source = format!("<script>{script}</script>");
    let component = rsvelte_svelte_syntax::parse::parse(&source).expect("parses");
    let lowered = lower(&component, &source);
    resolve::resolve(
        &component.javascript,
        component.instance.as_ref().map(|s| s.program),
        component.module.as_ref().map(|s| s.program),
        &lowered,
    )
}

/// The binding the instance script declares as `name`.
fn top_level(resolution: &Resolution, name: &str) -> Option<SymbolId> {
    resolution
        .scoping()
        .get_binding(resolution.instance_scope(), name.into())
}

#[test]
fn destructured_runes_classify_every_leaf_without_classifying_keys() {
    let resolution = resolution(concat!(
        "let { first: a, nested: [b = 1, ...c], ...d } = $derived(value); ",
        "let [e, f] = $state([]); let { g } = $state.raw({}); ",
        "let [h] = $derived.by(() => []);",
    ));
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
        let symbol = top_level(&resolution, name).expect("a top-level binding");
        assert_eq!(resolution.binding(symbol).kind, kind, "{name}");
    }
    for name in ["first", "nested"] {
        assert!(top_level(&resolution, name).is_none(), "{name}");
    }
}

#[test]
fn nested_runes_classify_bindings_in_their_own_scope() {
    let resolution = resolution(concat!(
        "function counter() { let value = $state(1); let [offset] = $derived([value]);",
        " return () => value + offset; } let value = 2;"
    ));
    let scoping = resolution.scoping();
    let kinds: Vec<_> = scoping
        .symbol_ids()
        .map(|symbol| (scoping.symbol_name(symbol), resolution.binding(symbol).kind))
        .filter(|(name, _)| matches!(*name, "value" | "offset"))
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
/// rune of the initializer of `name`'s declarator, in `script`.
fn store_or_rune(
    script: &str,
    name: &str,
    rune: &str,
) -> (BindingKind, bool, Option<&'static str>) {
    let resolution = resolution(script);
    let symbol = top_level(&resolution, name).expect("a top-level binding");
    let initializer = resolution.initializer(symbol).expect("an initializer");
    (
        resolution.binding(symbol).kind,
        resolution.is_store_subscription(rune),
        resolution.rune(initializer).map(|(called, _)| called),
    )
}

#[test]
fn a_binding_named_after_a_rune_makes_the_rune_a_store_subscription() {
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
