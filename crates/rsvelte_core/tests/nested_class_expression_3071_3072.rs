use rsvelte_core::{CompileOptions, GenerateMode, ModuleCompileOptions, compile, compile_module};

fn module(source: &str, generate: GenerateMode) -> String {
    compile_module(
        source,
        ModuleCompileOptions {
            filename: Some("A.svelte.js".to_string()),
            generate,
            ..Default::default()
        },
    )
    .expect("compileModule failed")
    .js
    .code
}

fn component(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("A.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile failed")
    .js
    .code
}

#[test]
fn class_expression_in_a_state_argument_is_lowered_and_proxied() {
    let out = module(
        "export class A {\n\theld = $state(class {\n\t\tdeep = $state(1);\n\t});\n}\n",
        GenerateMode::Client,
    );
    assert!(
        out.contains("#held = $.state($.proxy(class {"),
        "missing the proxy wrapper:\n{out}"
    );
    assert!(out.contains("#deep = $.state(1);"), "{out}");
    assert!(out.contains("get deep()"), "{out}");
    assert!(out.contains("set deep(value)"), "{out}");
}

#[test]
fn class_expression_nested_inside_a_state_argument_is_lowered() {
    let out = module(
        "export class A {\n\theld = $state(new (class {\n\t\tdeep = $state(1);\n\t})());\n}\n",
        GenerateMode::Client,
    );
    assert!(
        out.contains("#held = $.state($.proxy(new (class {"),
        "missing the proxy wrapper:\n{out}"
    );
    assert!(out.contains("#deep = $.state(1);"), "{out}");
}

#[test]
fn a_derived_argument_class_is_lowered_but_not_proxied() {
    let out = module(
        "export class A {\n\tn = $state(0);\n\theld = $derived(class {\n\t\tdeep = $state(1);\n\t});\n}\n",
        GenerateMode::Client,
    );
    assert!(out.contains("#deep = $.state(1);"), "{out}");
    assert!(
        !out.contains("$.proxy("),
        "`$derived` must not gain a proxy:\n{out}"
    );
}

#[test]
fn class_expression_in_a_state_argument_is_lowered_in_a_component() {
    let out = component(
        "<script>\n\tclass A {\n\t\theld = $state(class {\n\t\t\tdeep = $state(1);\n\t\t});\n\t}\n\n\tvoid A;\n</script>\n",
    );
    assert!(out.contains("#deep = $.state(1);"), "{out}");
    // The un-lowered form left a reference to the `$state` global, which throws
    // on first render even though the module parses.
    assert!(!out.contains("$state("), "rune left un-lowered:\n{out}");
}

#[test]
fn an_inline_heritage_class_does_not_swallow_the_subclass_body() {
    let source = "export class Sub extends class {\n\tinline = $state(\"i\");\n} {\n\town = $derived(this.inline + \"!\");\n}\n";
    let client = module(source, GenerateMode::Client);
    assert!(
        client.contains("extends class {"),
        "heritage class parenthesised:\n{client}"
    );
    assert!(client.contains("#inline = $.state(\"i\");"), "{client}");
    assert!(client.contains("#own = $.derived("), "{client}");
    assert!(client.contains("get own()"), "{client}");

    // The same defect is in the server's port of the transform, which shares
    // `find_class_header` with the client's.
    let server = module(source, GenerateMode::Server);
    assert!(
        server.contains("extends class {"),
        "heritage class parenthesised:\n{server}"
    );
    assert!(server.contains("#own = $.derived("), "{server}");
}

#[test]
fn an_inline_heritage_class_is_lowered_when_the_subclass_declares_nothing() {
    let out = module(
        "export class Sub extends class {\n\tinline = $state(\"i\");\n} {\n\town = 1;\n}\n",
        GenerateMode::Client,
    );
    assert!(out.contains("#inline = $.state(\"i\");"), "{out}");
    assert!(out.contains("get inline()"), "{out}");
    // This path re-emits the source slice verbatim, so it is the one that
    // proves the transformed header is what gets emitted rather than the slice.
    assert!(
        out.contains("extends class {") && out.contains("} {\n\town = 1;"),
        "heritage class parenthesised, or the subclass body lost:\n{out}"
    );
}

#[test]
fn two_stacked_heritage_classes_are_all_lowered() {
    let out = module(
        "export class Sub extends class extends class {\n\tdeep = $state(1);\n} {\n\tmid = $state(2);\n} {\n\town = $state(3);\n}\n",
        GenerateMode::Client,
    );
    for expected in [
        "#deep = $.state(1);",
        "#mid = $.state(2);",
        "#own = $.state(3);",
    ] {
        assert!(out.contains(expected), "missing {expected}:\n{out}");
    }
}

#[test]
fn only_a_primary_expression_superclass_loses_its_parentheses() {
    let out = module(
        "const Base = class {};\nconst mixin = (b) => b;\nexport class C extends class {} {}\nexport class G extends function () {} {}\nexport class D extends (0, Base) {}\nexport class B extends mixin(Base) {}\nexport class E extends (Base ?? class {}) {}\nexport class J extends (true ? Base : Base) {}\n",
        GenerateMode::Client,
    );
    // Matches official.
    assert!(out.contains("extends class {} {}"), "{out}");
    assert!(out.contains("extends function () {} {}"), "{out}");
    assert!(out.contains("extends (0, Base) {}"), "{out}");
    assert!(out.contains("extends mixin(Base) {}"), "{out}");
    // Deliberate divergence: official omits these and emits text no parser
    // accepts — see compatibility/GATES.md#deliberate-divergences.
    assert!(out.contains("extends (Base ?? class {}) {}"), "{out}");
    assert!(out.contains("extends (true ? Base : Base) {}"), "{out}");
}
