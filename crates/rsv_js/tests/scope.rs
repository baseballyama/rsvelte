use rsv_js::ast::Ast;
use rsv_js::parser::{parse_expression, parse_params, parse_program};
use rsv_js::scope::{DeclKind, HostRoot, HostScope, analyze};
use rsv_kernel::source::Span;

#[test]
fn template_expressions_resolve_against_the_instance_scope() {
    // One Ast per document: the script and the template expressions share it.
    let src = "let count = $state(0); function inc(n) { count += n; }\n{count} {inc} {other}";
    let script_end = src.find('\n').unwrap() as u32;
    let mut ast = Ast::new();
    let program = parse_program(&mut ast, src, Span::new(0, script_end), false).unwrap();
    let mut roots = Vec::new();
    for name in ["count", "inc", "other"] {
        let lo = src[script_end as usize..]
            .find(&format!("{{{name}}}"))
            .unwrap() as u32
            + script_end
            + 1;
        roots.push(
            parse_expression(&mut ast, src, Span::new(lo, lo + name.len() as u32), false).unwrap(),
        );
    }
    let host: Vec<HostRoot> = roots.iter().map(|&e| HostRoot::Expr(e)).collect();
    let sem = analyze(&ast, program, &host);

    let count = sem
        .root_binding(ast.atoms.lookup("count").unwrap())
        .expect("count is bound");
    let b = &sem.bindings[count];
    assert!(matches!(b.kind, DeclKind::Let));
    assert_eq!(
        (b.reads, b.writes),
        (2, 1),
        "`count += n` reads and writes, the template reads; the initializer is not a write"
    );

    let n = sem
        .bindings
        .iter()
        .find(|b| ast.atoms.get(b.name) == "n")
        .unwrap();
    assert!(matches!(n.kind, DeclKind::Param));
    assert_ne!(n.scope, b.scope, "params live in the function scope");

    assert!(sem.binding_of(roots[1]).is_some());
    assert!(sem.binding_of(roots[2]).is_none(), "`other` is a global");
}

#[test]
fn shadowing_and_destructuring() {
    let src = "let { a, b: [c = a] } = $props(); const f = (a) => a + c;";
    let mut ast = Ast::new();
    let program = parse_program(&mut ast, src, Span::new(0, src.len() as u32), false).unwrap();
    let sem = analyze(&ast, program, &[]);
    let names: Vec<_> = sem
        .bindings
        .iter()
        .map(|b| ast.atoms.get(b.name).to_owned())
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
    let src = "let item = 1; let list = [];\nitem, i|list|i|item";
    let script_end = src.find('\n').unwrap() as u32;
    let mut ast = Ast::new();
    let program = parse_program(&mut ast, src, Span::new(0, script_end), false).unwrap();
    let fields: Vec<Span> = {
        let mut at = script_end + 1;
        src[at as usize..]
            .split('|')
            .map(|f| {
                let s = Span::new(at, at + f.len() as u32);
                at += f.len() as u32 + 1;
                s
            })
            .collect()
    };
    let params = parse_params(&mut ast, src, fields[0], false).unwrap();
    let list = parse_expression(&mut ast, src, fields[1], false).unwrap();
    let key = parse_expression(&mut ast, src, fields[2], false).unwrap();
    let body = parse_expression(&mut ast, src, fields[3], false).unwrap();
    let host = [
        HostRoot::Expr(list),
        HostRoot::Scope(HostScope {
            node: params[0],
            params: params.clone(),
            body: vec![HostRoot::Expr(key), HostRoot::Expr(body)],
        }),
    ];
    let sem = analyze(&ast, program, &host);
    let name = |b: rsv_js::scope::BindingId| ast.atoms.get(sem.bindings[b].name).to_owned();
    let outer = sem.root_binding(ast.atoms.lookup("item").unwrap()).unwrap();
    assert_eq!(
        sem.bindings[outer].reads, 0,
        "the alias shadows the script's `item`"
    );
    let inner = sem.binding_of(body).expect("the body's `item` resolves");
    assert_ne!(inner, outer);
    assert_eq!(sem.bindings[inner].kind, DeclKind::Host);
    assert_eq!(name(sem.binding_of(key).unwrap()), "i");
    assert_eq!(
        sem.binding_of(list),
        sem.root_binding(ast.atoms.lookup("list").unwrap()),
        "the list is outside the scope"
    );
}
