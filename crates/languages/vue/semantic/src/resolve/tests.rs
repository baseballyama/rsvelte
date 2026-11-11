use oxc_ast::ast::Expression;

use super::*;
use crate::compiler_syntax_tree::{NodeKind, lower};
use crate::expressions::{Parent, collect_identifiers};

fn resolved(source_text: &str) -> (SingleFileComponent, CompilerSyntaxTree, Resolution) {
    let c = rsvelte_vue_syntax::parse::parse(source_text).expect("parses");
    let compiler_syntax_tree = lower(&c, source_text).expect("has a template");
    let resolution = resolve(&c.javascript, c.program, None, Some(&compiler_syntax_tree));
    (c, compiler_syntax_tree, resolution)
}

#[test]
fn script_setup_bindings_are_typed_as_compile_script_types_them() {
    let (_, _, r) = resolved(
        "<script setup lang=\"ts\">\nimport { ref as r } from 'vue'\nimport X from './X.vue'\nimport { y } from './y'\nconst a = r(1)\nlet b = 1\nconst c = 1 as number\nconst d = {}\nconst e = y()\nfunction f() {}\nconst props = defineProps({ p: Number, a: String })\n</script>\n<template><p>{{ a }}</p></template>\n",
    );
    for (name, want) in [
        ("r", BindingType::SetupConst),
        ("X", BindingType::SetupConst),
        ("y", BindingType::SetupMaybeRef),
        ("a", BindingType::SetupRef),
        ("b", BindingType::SetupLet),
        ("c", BindingType::LiteralConst),
        ("d", BindingType::SetupConst),
        ("e", BindingType::SetupMaybeRef),
        ("f", BindingType::SetupConst),
        ("props", BindingType::SetupReactiveConst),
        ("p", BindingType::Props),
    ] {
        assert_eq!(r.binding_type(name), Some(want), "{name}");
    }
    let define_props = r.define_props().expect("calls defineProps");
    assert_eq!(
        define_props.declaration.map(|d| d.name.as_str()),
        Some("props")
    );
    assert!(matches!(
        define_props.runtime,
        Some(Expression::ObjectExpression(_))
    ));
}

#[test]
fn template_names_resolve_to_the_script_or_a_v_for_alias() {
    let (c, compiler_syntax_tree, r) = resolved(
        "<script setup>\nconst items = [1]\n</script>\n<template><p v-for=\"item in items\">{{ item + other }}</p></template>\n",
    );
    let element = compiler_syntax_tree.root()[0];
    assert!(r.for_scope(element).is_some());
    let NodeKind::Element(el) = &compiler_syntax_tree.node(element).kind else {
        unreachable!("the root is the element")
    };
    let interpolation = compiler_syntax_tree.children(el.children)[0];
    let &NodeKind::Interpolation { expression } = &compiler_syntax_tree.node(interpolation).kind
    else {
        unreachable!("the element holds the interpolation")
    };
    let mut identifiers = Vec::new();
    collect_identifiers(c.javascript.get_expression(expression), &mut identifiers);
    let names: Vec<_> = identifiers.iter().map(|i| i.name).collect();
    assert_eq!(names, ["item", "other"]);
    let item = r
        .symbol_of(identifiers[0].reference.expect("a reference"))
        .expect("the alias");
    assert!(r.is_alias(item));
    assert_eq!(
        r.symbol_of(identifiers[1].reference.expect("a reference")),
        None
    );
    let items = r
        .scoping()
        .find_binding(r.root_scope(), "items".into())
        .expect("declared");
    assert!(!r.is_alias(items));
    assert_eq!(r.scoping().get_resolved_reference_ids(items).len(), 1);
}

#[test]
fn identifiers_say_what_holds_them() {
    let source_text = "<template><p>{{ f({ a }, b.c) }}</p></template>\n";
    let c = rsvelte_vue_syntax::parse::parse(source_text).expect("parses");
    let TemplateNode::Element { children, .. } = c.node(c.root()[0]) else {
        unreachable!("the root is the element")
    };
    let &TemplateNode::Interpolation { expression, .. } = c.node(c.children(*children)[0]) else {
        unreachable!("the element holds the interpolation")
    };
    let mut identifiers = Vec::new();
    collect_identifiers(c.javascript.get_expression(expression), &mut identifiers);
    let seen: Vec<_> = identifiers.iter().map(|i| (i.name, i.parent)).collect();
    assert_eq!(
        seen,
        [
            ("f", Parent::Accessed),
            ("a", Parent::Shorthand),
            ("b", Parent::Accessed),
            ("c", Parent::Accessed),
        ]
    );
}

#[test]
fn a_module_script_encloses_the_setup_script() {
    let source = "const m = 1;\nlet s = m;\n";
    let (tree, (setup, module)) = Tree::build(source, |builder| {
        let module = builder.program(
            rsvelte_kernel::source::positions::Span::new(0, 12),
            oxc_span::SourceType::mjs(),
        )?;
        let setup = builder.program(
            rsvelte_kernel::source::positions::Span::new(13, 23),
            oxc_span::SourceType::mjs(),
        )?;
        Ok((setup, module))
    })
    .expect("parses");
    let r = resolve(&tree, setup, Some(module), None);
    let scoping = r.scoping();
    let m = scoping
        .find_binding(scoping.root_scope_id(), "m".into())
        .expect("in the module");
    let s = scoping
        .get_bindings(r.root_scope())
        .get("s")
        .copied()
        .expect("in setup");
    assert_ne!(r.root_scope(), scoping.root_scope_id());
    assert_eq!(scoping.symbol_scope_id(s), r.root_scope());
    assert_eq!(scoping.get_resolved_references(m).count(), 1);
    assert_eq!(r.binding_type("s"), Some(BindingType::SetupLet));
}
