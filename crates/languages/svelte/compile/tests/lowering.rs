use rsvelte_svelte_compile::{CompileInput, Target, lower};

#[test]
fn direct_lowering_and_compilation_refuse_runtime_typescript() {
    for script in [
        "enum Color { Red }",
        "namespace Color { export const red = 1; }",
    ] {
        let source = format!("<script lang=\"ts\">{script}</script>");
        let component = rsvelte_svelte::syntax::parse::parse(&source).expect("parses");
        let tree = rsvelte_svelte::compilation::compiler_syntax_tree::lower(&component, &source);
        let input = CompileInput::from(rsvelte_svelte::svelte_input(
            &component,
            &tree,
            &source,
            "App.svelte",
        ));
        let resolution = rsvelte_svelte::semantic::resolve::resolve(
            &component.javascript,
            &source,
            component.program,
            &tree,
        );
        let analysis = rsvelte_svelte::semantic::analyze::analyze(&input.component, &resolution);
        for target in [Target::Client, Target::Server] {
            let lowered = lower::lower(&input, &resolution, &analysis, target)
                .expect_err("runtime TypeScript refused");
            let compiled = rsvelte_svelte_compile::compile(&input, &resolution, &analysis, target)
                .expect_err("runtime TypeScript refused");
            assert_eq!(lowered.code, "typescript_invalid_feature");
            assert_eq!(lowered.code, compiled.code);
            assert_eq!(lowered.message, compiled.message);
            assert_eq!(lowered.span, compiled.span);
        }
    }
}

#[test]
fn an_interpolated_attribute_decodes_references_as_an_attribute_value() {
    // In an attribute `&#10;` stays a newline and `&copy=` stays as written; text reads both
    // differently. The expected lines are the official compiler's.
    let source =
        r#"<script>let x = $state(1);</script><a title="{x}&lbrace;&#10;&copy=&copy;">a</a>"#;
    let component = rsvelte_svelte::syntax::parse::parse(source).expect("parses");
    let tree = rsvelte_svelte::compilation::compiler_syntax_tree::lower(&component, source);
    let input = CompileInput::from(rsvelte_svelte::svelte_input(
        &component,
        &tree,
        source,
        "App.svelte",
    ));
    let resolution = rsvelte_svelte::semantic::resolve::resolve(
        &component.javascript,
        source,
        component.program,
        &tree,
    );
    let analysis = rsvelte_svelte::semantic::analyze::analyze(&input.component, &resolution);
    for (target, expected) in [
        (
            Target::Client,
            r"$.set_attribute(a, 'title', '1{\n&copy=©');",
        ),
        (Target::Server, "<a title=\"1{\n&amp;copy=©\">a</a>"),
    ] {
        let code = rsvelte_svelte_compile::compile(&input, &resolution, &analysis, target)
            .expect("compiles");
        assert!(code.contains(expected), "{target:?}:\n{code}");
    }
}
