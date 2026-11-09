use rsvelte_svelte_compile::{CompileInput, Target, lower};

#[test]
fn direct_lowering_and_compilation_refuse_runtime_typescript() {
    for script in [
        "enum Color { Red }",
        "namespace Color { export const red = 1; }",
    ] {
        let source = format!("<script lang=\"ts\">{script}</script>");
        let component = rsvelte_svelte_syntax::parse::parse(&source).expect("parses");
        let tree = rsvelte_svelte_semantic::compiler_syntax_tree::lower(&component, &source);
        let input = CompileInput::from(rsvelte_svelte_semantic::svelte_input(
            &component,
            &tree,
            &source,
            "App.svelte",
        ));
        let resolution = rsvelte_svelte_semantic::resolve::resolve(
            &component.javascript,
            component.program,
            &tree,
        );
        let analysis = rsvelte_svelte_semantic::analyze::analyze(&input.component, &resolution);
        for target in [Target::Client, Target::Server] {
            let lowered = lower::lower(&input, &resolution, &analysis, target)
                .expect_err("runtime TypeScript refused");
            let compiled =
                rsvelte_svelte_compile::compile_input(&input, &resolution, &analysis, target)
                    .expect_err("runtime TypeScript refused");
            assert_eq!(lowered.code, "typescript_invalid_feature");
            assert_eq!(lowered.code, compiled.code);
            assert_eq!(lowered.message, compiled.message);
            assert_eq!(lowered.span, compiled.span);
        }
    }
}

#[test]
fn a_scoped_class_is_trimmed_as_javascript_trims() {
    let options = rsvelte_svelte_compile::CompileOptions {
        filename: "App.svelte".to_owned(),
        generate: Target::Server,
        ..rsvelte_svelte_compile::CompileOptions::default()
    };
    let source = "<div class=\"\u{85}\"></div><style>div { color: red }</style>";
    let code = rsvelte_svelte_compile::compile(source, &options)
        .expect("compiles")
        .js
        .code;
    assert!(code.contains("class=\"\u{85} svelte-"), "{code}");
}
