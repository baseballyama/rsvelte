use rsv_js::ast::Ast;
use rsv_js::parser::{parse_expression, parse_program};
use rsv_js::scope::{DeclKind, analyze};
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
    let sem = analyze(&ast, program, &roots);

    let count = sem
        .root_binding(ast.atoms.lookup("count").unwrap())
        .expect("count is bound");
    let b = &sem.bindings[count as usize];
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
        .map(|b| ast.atoms.get(b.name).to_string())
        .collect();
    assert_eq!(names, ["a", "c", "f", "a"]);
    let outer_a = &sem.bindings[0];
    assert_eq!(
        outer_a.reads,
        1,
        "only the default `c = a` reads the outer `a`: {:?}",
        sem.bindings.iter().map(|b| b.reads).collect::<Vec<_>>()
    );
    assert_eq!(sem.bindings[3].reads, 1);
    assert_eq!(sem.bindings[1].reads, 1);
}
