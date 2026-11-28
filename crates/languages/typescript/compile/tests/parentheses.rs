//! The parentheses of the emit, against TypeScript 6.0.3's `transpileModule` with ts.compile's
//! options. Both sides are compared as trees that keep each pair of parentheses.

use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_typescript_compile::emit;
use rsvelte_typescript_compile::print::print_with_parentheses;

/// `source_text` read as a module with its parentheses and printed with them.
fn tree(source_text: &str) -> String {
    let allocator = Allocator::default();
    let parsed = Parser::new(&allocator, source_text, SourceType::mjs()).parse();
    assert!(
        parsed.diagnostics.is_empty(),
        "{source_text}: {:?}",
        parsed.diagnostics
    );
    print_with_parentheses(&parsed.program)
}

fn emitted(source_text: &str) -> String {
    let allocator = Allocator::default();
    let parsed = Parser::new(&allocator, source_text, SourceType::ts()).parse();
    assert!(
        parsed.diagnostics.is_empty(),
        "{source_text}: {:?}",
        parsed.diagnostics
    );
    emit(&parsed.program)
}

#[test]
fn the_emit_keeps_the_parentheses_typescript_keeps() {
    for (written, typescript) in [
        ("(f)(1);", "(f)(1);"),
        ("((a));", "((a));"),
        ("x = (a);", "x = (a);"),
        ("(a as T).x;", "a.x;"),
        ("(<T>a).x;", "a.x;"),
        ("(a satisfies T).x;", "a.x;"),
        ("(a!).x;", "(a).x;"),
        ("((a as T)).x;", "a.x;"),
        ("(a + b as T) * c;", "(a + b) * c;"),
        ("({} as any).x;", "({}.x);"),
        ("({} as any) + 1;", "({} + 1);"),
        ("({} as any);", "({});"),
        (
            "(function () {} as any).call();",
            "(function () { }.call());",
        ),
        ("(function () {} as any)();", "(function () { })();"),
        ("new (a.b() as any)();", "new (a.b())();"),
        ("(f<T>)(1);", "(f)(1);"),
        ("(1).x;", "(1).x;"),
        ("(a as any) = 1;", "a = 1;"),
        (
            "for (const x = (\"a\" in b); ;) {}",
            "for (const x = (\"a\" in b);;) { }",
        ),
        ("(a, b);", "(a, b);"),
        ("const v = (a as T);", "const v = a;"),
        ("f((a as T));", "f(a);"),
        ("(a as T)!.x;", "a.x;"),
        ("((a) as T).x;", "(a).x;"),
        ("(a as T as U).x;", "a.x;"),
        ("x = (a as any) ? 1 : 2;", "x = a ? 1 : 2;"),
        ("x = typeof (a as T);", "x = typeof a;"),
        ("x = (a ? b : c as any).x;", "x = (a ? b : c).x;"),
        ("x = ((a, b) as any).x;", "x = (a, b).x;"),
        ("f(((a, b) as any));", "f((a, b));"),
        ("x = (a as any)`t`;", "x = a `t`;"),
        ("x = (a?.b as any).c;", "x = (a?.b).c;"),
        ("x = (a?.b as any)();", "x = (a?.b)();"),
        ("x = (a?.b!).c;", "x = (a?.b).c;"),
        ("(a?.b!)();", "(a?.b)();"),
        ("const f = () => ({} as any);", "const f = () => ({});"),
        ("const f = () => ({} as any).x;", "const f = () => ({}.x);"),
        (
            "const f = () => ((a, b) as any);",
            "const f = () => (a, b);",
        ),
        ("x = (x = 1 as any);", "x = (x = 1);"),
        ("x = ((x = 1) as any).y;", "x = (x = 1).y;"),
        ("for ((a as any) in b) {}", "for (a in b) { }"),
        ("let x = (a as any), y = 1;", "let x = a, y = 1;"),
        ("({} as any).x = 1;", "({}.x = 1);"),
        ("({} as any).x++;", "({}.x++);"),
        ("({} as any)?.x;", "({}?.x);"),
        ("(function () {} as any)?.();", "(function () { })?.();"),
        ("x = (a * b) + c;", "x = (a * b) + c;"),
        ("x = a + (b * c);", "x = a + (b * c);"),
        ("x = (a && b) || c;", "x = (a && b) || c;"),
        ("x = (a) ? (b) : (c);", "x = (a) ? (b) : (c);"),
        ("x = `${(a)}`;", "x = `${(a)}`;"),
        ("x = (a as any) * (b as any);", "x = a * b;"),
        ("x = -(a as any);", "x = -a;"),
        ("x = (await_ as any);", "x = await_;"),
        ("x = new (A as any);", "x = new A;"),
        ("x = (a as any)[0];", "x = a[0];"),
        ("x = (() => 1 as any);", "x = (() => 1);"),
        ("x = ((a as any) || b) ?? c;", "x = (a || b) ?? c;"),
        ("export default ({} as any).x;", "export default {}.x;"),
        (
            "export default (function () {} as any)();",
            "export default (function () { }());",
        ),
        ("export default ((a, b) as any);", "export default (a, b);"),
        (
            "export default (class {} as any).x;",
            "export default (class {\n}.x);",
        ),
        (
            "export default (function () {} as any);",
            "export default (function () { });",
        ),
        ("export default (a as any);", "export default a;"),
        (
            "export default (function () {}).call();",
            "export default (function () { }).call();",
        ),
    ] {
        // A module, so that the emit has no prologue.
        let source_text = format!("export const m = 0;\n{written}\n");
        let expected = tree(&format!("export const m = 0;\n{typescript}\n"));
        assert_eq!(tree(&emitted(&source_text)), expected, "{written}");
    }
}

/// The shapes `DIVERGENCES.md` lists: TypeScript keeps a pair the tree cannot hold. oxc's parser
/// drops the pair around an assignment target on either side, so only the text shows it.
#[test]
fn an_assignment_target_and_a_bare_new_lose_the_pair_typescript_keeps() {
    for (written, typescript, rsvelte) in [
        ("(a) = 1;", "(a) = 1;", "a = 1;"),
        ("[(a)] = b;", "[(a)] = b;", "[a] = b;"),
        ("((a) as any) = 1;", "(a) = 1;", "a = 1;"),
        ("x = (new A as any).b;", "x = (new A).b;", "x = new A().b;"),
    ] {
        let emitted = emitted(&format!("export const m = 0;\n{written}\n"));
        let body = emitted
            .trim_start_matches("export const m = 0;\n")
            .trim_end();
        assert_ne!(body, typescript, "{written}");
        assert_eq!(body, rsvelte, "{written}");
    }
}
