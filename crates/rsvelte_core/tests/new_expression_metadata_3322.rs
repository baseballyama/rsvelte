use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(source: &str) -> String {
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
fn new_expression_over_a_known_binding_is_not_reactive() {
    let out = client("<script>\n\tlet s = \"x\";\n\tvoid s;\n</script>\n\n{new String(s)}\n");
    assert!(
        out.contains("text.nodeValue = new String(s);"),
        "expected a one-shot assignment:\n{out}"
    );
    assert!(!out.contains("$.template_effect"), "{out}");
}

#[test]
fn new_expression_propagates_has_call_from_its_argument() {
    let out = client(
        "<script>\n\tfunction f() { return \"f\"; }\n\tvoid f;\n</script>\n\n{new String(f())}\n",
    );
    assert!(
        out.contains("$.template_effect(($0) => $.set_text(text, $0), [() => new String(f())]);"),
        "expected the memoized dependency-array form:\n{out}"
    );
}

#[test]
fn new_expression_propagates_has_call_from_its_callee() {
    let out = client(
        "<script>\n\tclass C {}\n\tfunction getC() { return C; }\n\tvoid getC;\n</script>\n\n{new (getC())()}\n",
    );
    assert!(
        out.contains("$.template_effect(($0) => $.set_text(text, $0), [() => new (getC())()]);"),
        "expected the memoized dependency-array form:\n{out}"
    );
}

#[test]
fn new_expression_over_state_stays_reactive() {
    let out = client(
        "<script>\n\tlet n = $state(0);\n\tfunction bump() { n += 1; }\n\tvoid bump;\n</script>\n\n{new String(n)}\n",
    );
    assert!(
        out.contains("$.template_effect(() => $.set_text(text, new String($.get(n))));"),
        "expected a reactive update:\n{out}"
    );
}
