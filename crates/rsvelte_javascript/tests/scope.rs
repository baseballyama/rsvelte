use rsvelte_javascript::parser::{parse_expression, parse_parameters, parse_program};
use rsvelte_javascript::scope::{DeclarationKind, HostRoot, HostScope, analyze};
use rsvelte_javascript::syntax_tree::SyntaxTree;
use rsvelte_kernel::source::positions::Span;

#[test]
fn template_expressions_resolve_against_the_instance_scope() {
    // One SyntaxTree per document: the script and the template expressions share it.
    let source_text =
        "let count = $state(0); function inc(n) { count += n; }\n{count} {inc} {other}";
    let script_end = source_text.find('\n').unwrap() as u32;
    let mut syntax_tree = SyntaxTree::new();
    let program = parse_program(
        &mut syntax_tree,
        source_text,
        Span::new(0, script_end),
        false,
    )
    .unwrap();
    let mut roots = Vec::new();
    for name in ["count", "inc", "other"] {
        let start_offset = source_text[script_end as usize..]
            .find(&format!("{{{name}}}"))
            .unwrap() as u32
            + script_end
            + 1;
        roots.push(
            parse_expression(
                &mut syntax_tree,
                source_text,
                Span::new(start_offset, start_offset + name.len() as u32),
                false,
            )
            .unwrap(),
        );
    }
    let host: Vec<HostRoot> = roots.iter().map(|&e| HostRoot::Expression(e)).collect();
    let sem = analyze(&syntax_tree, program, &host);

    let count = sem
        .root_binding(syntax_tree.atoms.lookup("count").unwrap())
        .expect("count is bound");
    let b = &sem.bindings[count];
    assert!(matches!(b.kind, DeclarationKind::Let));
    assert_eq!(
        (b.reads, b.writes),
        (2, 1),
        "`count += n` reads and writes, the template reads; the initializer is not a write"
    );

    let n = sem
        .bindings
        .iter()
        .find(|b| syntax_tree.atoms.get(b.name) == "n")
        .unwrap();
    assert!(matches!(n.kind, DeclarationKind::Param));
    assert_ne!(n.scope, b.scope, "params live in the function scope");

    assert!(sem.binding_of(roots[1]).is_some());
    assert!(sem.binding_of(roots[2]).is_none(), "`other` is a global");
}

#[test]
fn shadowing_and_destructuring() {
    let source_text = "let { a, b: [c = a] } = $props(); const f = (a) => a + c;";
    let mut syntax_tree = SyntaxTree::new();
    let program = parse_program(
        &mut syntax_tree,
        source_text,
        Span::new(0, source_text.len() as u32),
        false,
    )
    .unwrap();
    let sem = analyze(&syntax_tree, program, &[]);
    let names: Vec<_> = sem
        .bindings
        .iter()
        .map(|b| syntax_tree.atoms.get(b.name).to_owned())
        .collect();
    assert_eq!(names, ["a", "c", "f", "a"]);
    let outer_a = &sem.bindings.raw()[0];
    assert_eq!(
        outer_a.reads,
        1,
        "only the default `c = a` reads the outer `a`: {:?}",
        sem.bindings.iter().map(|b| b.reads).collect::<Vec<_>>()
    );
    assert_eq!(sem.bindings.raw()[3].reads, 1);
    assert_eq!(sem.bindings.raw()[1].reads, 1);
}

/// `<li v-for="(item, i) in list" :key="i">{{ item }}</li>` over a script that also declares
/// `item`: the list is read in the program scope, the alias shadows the script's `item` inside the
/// scope.
#[test]
fn a_host_scope_declares_names_its_body_sees() {
    let source_text = "let item = 1; let list = [];\nitem, i|list|i|item";
    let script_end = source_text.find('\n').unwrap() as u32;
    let mut syntax_tree = SyntaxTree::new();
    let program = parse_program(
        &mut syntax_tree,
        source_text,
        Span::new(0, script_end),
        false,
    )
    .unwrap();
    let fields: Vec<Span> = {
        let mut at = script_end + 1;
        source_text[at as usize..]
            .split('|')
            .map(|f| {
                let s = Span::new(at, at + f.len() as u32);
                at += f.len() as u32 + 1;
                s
            })
            .collect()
    };
    let parameters = parse_parameters(&mut syntax_tree, source_text, fields[0], false).unwrap();
    let list = parse_expression(&mut syntax_tree, source_text, fields[1], false).unwrap();
    let key = parse_expression(&mut syntax_tree, source_text, fields[2], false).unwrap();
    let body = parse_expression(&mut syntax_tree, source_text, fields[3], false).unwrap();
    let host = [
        HostRoot::Expression(list),
        HostRoot::Scope(HostScope {
            node: parameters[0],
            parameters: parameters.clone(),
            body: vec![HostRoot::Expression(key), HostRoot::Expression(body)],
        }),
    ];
    let sem = analyze(&syntax_tree, program, &host);
    let name = |b: rsvelte_javascript::scope::BindingIdentifier| {
        syntax_tree.atoms.get(sem.bindings[b].name).to_owned()
    };
    let outer = sem
        .root_binding(syntax_tree.atoms.lookup("item").unwrap())
        .unwrap();
    assert_eq!(
        sem.bindings[outer].reads, 0,
        "the alias shadows the script's `item`"
    );
    let inner = sem.binding_of(body).expect("the body's `item` resolves");
    assert_ne!(inner, outer);
    assert_eq!(sem.bindings[inner].kind, DeclarationKind::Host);
    assert_eq!(name(sem.binding_of(key).unwrap()), "i");
    assert_eq!(
        sem.binding_of(list),
        sem.root_binding(syntax_tree.atoms.lookup("list").unwrap()),
        "the list is outside the scope"
    );
}
