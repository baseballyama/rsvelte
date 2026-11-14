use super::instance;

/// Each code and range is svelte-check's.
#[test]
fn a_namespace_or_ambient_module_in_the_instance_is_refused_at_its_first_token() {
    let source = "<script lang=\"ts\">\nnamespace A {}\nexport module B {}\ndeclare global {}\n\
                  declare module 'm' {}\ntype T = 1;\n</script>";
    let component = rsvelte_svelte_syntax::parse::parse(source).expect("parses");
    let found: Vec<(&str, u32)> = instance(&component)
        .into_iter()
        .map(|(span, code, _)| (span.text(source), code))
        .collect();
    assert_eq!(
        found,
        [
            ("namespace", 1235),
            ("export", 1235),
            ("declare", 1234),
            ("declare", 1234)
        ]
    );
    let declared = "<script lang=\"ts\">declare function f(): void;\ndeclare const c: 1;\n\
                    declare class C {}\ndeclare enum E {}\nexport declare const d: 1;</script>";
    let component = rsvelte_svelte_syntax::parse::parse(declared).expect("parses");
    let codes: Vec<(&str, u32)> = instance(&component)
        .into_iter()
        .map(|(span, code, _)| (span.text(declared), code))
        .collect();
    assert_eq!(codes, [("declare", 1184); 5]);
    let exported = "<script lang=\"ts\">export declare enum E {}\nexport declare global {}\n\
                    export enum F {}</script>";
    let component = rsvelte_svelte_syntax::parse::parse(exported).expect("parses");
    let codes: Vec<(&str, u32)> = instance(&component)
        .into_iter()
        .map(|(span, code, _)| (span.text(exported), code))
        .collect();
    assert_eq!(
        codes,
        [
            ("export", 1184),
            ("export", 1234),
            ("export", 2668),
            ("export", 1184)
        ]
    );
    let module = "<script lang=\"ts\" module>namespace A {}</script>";
    let component = rsvelte_svelte_syntax::parse::parse(module).expect("parses");
    assert!(
        instance(&component).is_empty(),
        "the module script is top level upstream too"
    );
}

/// Each code and range is TypeScript's in svelte2tsx's render function.
#[test]
fn an_await_is_refused_when_svelte2tsx_does_not_make_its_render_function_async() {
    let found = |script: &str| {
        let source = format!("<script lang=\"ts\">{script}</script>");
        let component = rsvelte_svelte_syntax::parse::parse(&source).expect("parses");
        instance(&component)
            .into_iter()
            .map(|(span, code, _)| (span.start_offset - 18, span.text(&source).to_owned(), code))
            .collect::<Vec<_>>()
    };
    let refused = "{ await f(); }\nfor /* a */ await (const x of y) {}\nawait using z = g();";
    assert_eq!(
        found(refused),
        [
            (2, "await".to_owned(), 1308),
            (27, "await".to_owned(), 1103),
            (51, "await".to_owned(), 2852)
        ]
    );
    // An await expression outside every block and function makes it async.
    assert_eq!(found(&format!("{refused}\nawait f();")), []);
    assert_eq!(found("class A { x = await f(); }\n{ await g(); }"), []);
    // TypeScript refuses these in the projection too.
    assert_eq!(found("function h() { { await f(); } }"), []);
    assert_eq!(found("{ class A { x = await f(); } }"), []);
    assert_eq!(found("class A { static { await f(); } }"), []);
    assert_eq!(
        found("{ class A { [await f()] = 1; } }"),
        [(13, "await".to_owned(), 1308)]
    );
}
