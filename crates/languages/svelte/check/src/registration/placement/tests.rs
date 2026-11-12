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
    assert_eq!(codes, [("declare", 1184); 4]);
    let module = "<script lang=\"ts\" module>namespace A {}</script>";
    let component = rsvelte_svelte_syntax::parse::parse(module).expect("parses");
    assert!(
        instance(&component).is_empty(),
        "the module script is top level upstream too"
    );
}
