use rsvelte_core::{ModuleCompileOptions, compile_module};

fn diagnostic(source: &str) -> rsvelte_core::compiler::CompileErrorDiagnostic {
    compile_module(source, ModuleCompileOptions::default())
        .expect_err("the invalid rune must be rejected")
        .diagnostic()
}

#[test]
fn invalid_rune_name_span_includes_the_call_parent() {
    let source = "class State { value = $state.foo(); }";
    let diagnostic = diagnostic(source);
    let start = source.find("$state.foo()").unwrap() as u32;

    assert_eq!(diagnostic.code.as_deref(), Some("rune_invalid_name"));
    assert_eq!(diagnostic.span, Some((start, start + 12)));
}

#[test]
fn renamed_and_removed_rune_spans_include_parentheses() {
    for (source, code) in [
        ("$effect.active();", "rune_renamed"),
        ("$state.is();", "rune_removed"),
    ] {
        let diagnostic = diagnostic(source);

        assert_eq!(diagnostic.code.as_deref(), Some(code));
        assert_eq!(diagnostic.span, Some((0, source.len() as u32 - 1)));
    }
}
