use super::*;
use crate::compiler_syntax_tree::is_component_name;

fn compiler_syntax_tree(source_text: &str) -> (Component, CompilerSyntaxTree) {
    let c = rsvelte_svelte_syntax::parse::parse(source_text).expect("parses");
    let h = lower(&c, source_text);
    (c, h)
}

#[test]
fn an_else_if_chain_is_one_node_with_its_branches() {
    let source_text = "{#if a}A{:else if b}B{:else if c}C{:else}D{/if}";
    let (_, h) = compiler_syntax_tree(source_text);
    let [top] = h.children(h.root) else {
        panic!("one top-level node")
    };
    let NodeKind::If {
        branches,
        otherwise,
    } = h.node(*top).kind
    else {
        panic!("an if")
    };
    let bodies: Vec<&str> = h
        .branches(branches)
        .iter()
        .map(|b| {
            let [t] = h.children(b.body) else { panic!() };
            h.node(*t).kind.text(source_text).unwrap()
        })
        .collect();
    assert_eq!(bodies, ["A", "B", "C"]);
    let [d] = h.children(otherwise.expect("an else")) else {
        panic!()
    };
    assert_eq!(h.node(*d).kind.text(source_text), Some("D"));
    assert_eq!(h.node(*d).parent, Some(*top));
}

#[test]
fn attribute_values_are_classified() {
    let source_text = "<p a b=\"x&amp;y\" c={e} d=\"{e}\" {e} f=\"x{e}\" g=\"\"></p>";
    let (_, h) = compiler_syntax_tree(source_text);
    let (_, el) = h.elements().next().expect("an element");
    let got: Vec<String> = h
        .attributes(el.attributes)
        .iter()
        .map(|a| match &a.value {
            AttributeValue::Boolean => "boolean".into(),
            AttributeValue::Static(v) => format!("static {v:?}"),
            AttributeValue::Expression { quoted, .. } => format!("expression quoted={quoted}"),
            AttributeValue::Shorthand(_) => "shorthand".into(),
            AttributeValue::Interpolated(p) => format!("interpolated {}", p.len()),
            AttributeValue::Bind(_) => "bind".into(),
            AttributeValue::Attach(_) => "attach".into(),
            AttributeValue::Class(_) => "class".into(),
            AttributeValue::Spread(_) => "spread".into(),
            _ => "directive".into(),
        })
        .collect();
    assert_eq!(
        got,
        [
            "boolean",
            "static \"x&y\"",
            "expression quoted=false",
            "expression quoted=true",
            "shorthand",
            "interpolated 2",
            "static \"\"",
        ]
    );
}

#[test]
#[expect(
    clippy::literal_string_with_formatting_args,
    reason = "Svelte expression braces"
)]
fn directives_keep_their_parts() {
    let source_text = "<p on:click|once|capture={h} use:a.b={x} in:fade out:fly|global={y} \
                           style:color style:width=\"{w}px\" style:--x|important=\"1\"></p>";
    let (c, h) = compiler_syntax_tree(source_text);
    let (_, el) = h.elements().next().expect("an element");
    let got: Vec<String> = h
        .attributes(el.attributes)
        .iter()
        .map(|a| {
            let name = a.name.text(source_text);
            match &a.value {
                AttributeValue::On { handler, modifiers } => format!(
                    "on {name} {} once={} capture={}",
                    handler.is_some(),
                    modifiers.contains(Modifiers::ONCE),
                    modifiers.contains(Modifiers::CAPTURE)
                ),
                AttributeValue::Use { action, argument } => {
                    let member = matches!(
                        c.javascript.kind(*action),
                        rsvelte_typescript_syntax::Kind::Member { .. }
                    );
                    format!("use member={member} {}", argument.is_some())
                }
                AttributeValue::Transition {
                    intro,
                    outro,
                    modifiers,
                    argument,
                    ..
                } => format!(
                    "transition {name} {intro} {outro} {} global={}",
                    argument.is_some(),
                    modifiers.contains(Modifiers::GLOBAL)
                ),
                AttributeValue::Style { value, modifiers } => format!(
                    "style {name} {} important={}",
                    match **value {
                        StyleValue::Shorthand(_) => "shorthand",
                        StyleValue::Interpolated(_) => "interpolated",
                        StyleValue::Static(_) => "static",
                        StyleValue::Empty => "empty",
                        StyleValue::Expression { .. } => "expression",
                    },
                    modifiers.contains(Modifiers::IMPORTANT)
                ),
                other => format!("{other:?}"),
            }
        })
        .collect();
    assert_eq!(
        got,
        [
            "on click true once=true capture=true",
            "use member=true true",
            "transition fade true false false global=false",
            "transition fly false true true global=true",
            "style color shorthand important=false",
            "style width interpolated important=false",
            "style --x static important=true",
        ]
    );
}

#[test]
fn element_kinds_follow_the_svelte_parser() {
    use ElementKind::*;
    let source_text = "<svelte:head><title>t</title></svelte:head><div><title>u</title></div>\
                   <Foo/><a.b/><slot/>\
                   <template shadowrootmode=\"open\"><slot/></template>";
    let (_, h) = compiler_syntax_tree(source_text);
    let got: Vec<(String, ElementKind)> = h
        .elements()
        .map(|(_, el)| (el.name.text(source_text).to_owned(), el.kind))
        .collect();
    let want = [
        ("svelte:head", Metadata(Some(MetadataTag::Head))),
        ("title", Title),
        ("div", Regular),
        ("title", Regular),
        ("Foo", Component),
        ("a.b", Component),
        ("slot", Slot),
        ("template", Regular),
        ("slot", Regular),
    ];
    let want: Vec<(String, ElementKind)> = want.iter().map(|(n, k)| (n.to_string(), *k)).collect();
    assert_eq!(got, want);
}

#[test]
fn component_names_match_the_upstream_pattern() {
    for (name, want) in [
        ("Foo", true),
        ("Foo.bar", true),
        ("foo.bar", true),
        ("Ärger", true),
        ("foo", false),
        ("foo.", false),
        ("_x.y", false),
        ("x-y", false),
        ("\u{2160}", false),
    ] {
        assert_eq!(is_component_name(name), want, "{name}");
    }
}

#[test]
fn every_node_points_back_to_its_surface_node() {
    let source_text = "<p>a</p>{#if x}<b/>{/if}";
    let (c, h) = compiler_syntax_tree(source_text);
    for (identifier, n) in h.nodes.iter_enumerated() {
        assert_eq!(
            c.node(h.origin[identifier]).span(),
            n.span,
            "{identifier:?}"
        );
    }
}
