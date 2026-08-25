//! Template expressions use specialized parse and analysis walks. These cases
//! pin JavaScript restrictions that the ordinary script walks already enforce.

use rsvelte_core::{CompileOptions, compile};

fn error(source: &str) -> rsvelte_core::CompileError {
    compile(source, CompileOptions::default()).expect_err(source)
}

#[test]
fn super_and_await_match_the_module_parser_restrictions() {
    let super_error = error("{super.x}");
    let diagnostic = super_error.diagnostic();
    assert_eq!(diagnostic.code.as_deref(), Some("js_parse_error"));
    assert_eq!(diagnostic.span, Some((1, 1)));

    for source in ["{await}", "{await.x}"] {
        let await_error = error(source);
        let diagnostic = await_error.diagnostic();
        assert_eq!(
            diagnostic.code.as_deref(),
            Some("js_parse_error"),
            "{source}"
        );
        assert_eq!(diagnostic.span, Some((6, 6)));
    }
}

#[test]
fn super_is_still_legal_in_a_method_and_await_is_legal_as_a_property() {
    compile(
        "{class A extends B { m() { return super.x } }}",
        CompileOptions::default(),
    )
    .expect("super in a method must remain valid");
    compile("{obj.await}", CompileOptions::default())
        .expect("await as a property name must remain valid");

    for source in ["{await promise}", "{await (await (value.nested)).one}"] {
        assert_eq!(
            error(source).diagnostic().code.as_deref(),
            Some("experimental_async"),
            "an await expression must reach analysis: {source}"
        );
    }
}

#[test]
fn arguments_is_rejected_in_template_references_but_not_in_function_expressions() {
    for source in [
        "{arguments}",
        "{arguments.length}",
        "{String(arguments)}",
        "{(() => arguments)()}",
    ] {
        assert_eq!(
            error(source).diagnostic().code.as_deref(),
            Some("invalid_arguments_usage"),
            "{source}"
        );
    }

    compile(
        "{(function () { return arguments; })()}",
        CompileOptions::default(),
    )
    .expect("a regular function owns arguments");
}
