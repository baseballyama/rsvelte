use rsvelte_svelte_compile::Target;

#[test]
fn compilation_refuses_runtime_typescript() {
    // The features and spans are the official compiler's (5.57.3) on both targets.
    for (script, feature) in [
        ("enum Color { Red }", "like enums "),
        (
            "namespace Color { export const red = 1; }",
            "like namespaces with non-type nodes ",
        ),
    ] {
        let source = format!("<script lang=\"ts\">{script}</script>");
        super::analyzed(&source, "App.svelte", |input, resolution, analysis| {
            for target in [Target::Client, Target::Server] {
                let error = rsvelte_svelte_compile::compile_to_javascript(
                    &input, resolution, analysis, target,
                )
                .expect_err("runtime TypeScript refused");
                assert_eq!(error.code, "typescript_invalid_feature");
                assert!(error.message.contains(feature), "{}", error.message);
                let start = u32::try_from("<script lang=\"ts\">".len()).expect("short");
                let end = start + u32::try_from(script.len()).expect("short");
                assert_eq!(
                    (error.span.start_offset, error.span.end_offset),
                    (start, end)
                );
            }
        })
        .expect("parses");
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

#[test]
fn an_interpolated_attribute_decodes_references_as_an_attribute_value() {
    // In an attribute `&#10;` stays a newline and `&copy=` stays as written; text reads both
    // differently. The expected lines are the official compiler's.
    let source =
        r#"<script>let x = $state(1);</script><a title="{x}&lbrace;&#10;&copy=&copy;">a</a>"#;
    super::analyzed(source, "App.svelte", |input, resolution, analysis| {
        for (target, expected) in [
            (
                Target::Client,
                r#"$.set_attribute(a, "title", "1{\n&copy=©");"#,
            ),
            (Target::Server, "<a title=\"1{\n&amp;copy=©\">a</a>"),
        ] {
            let code =
                rsvelte_svelte_compile::compile_to_javascript(&input, resolution, analysis, target)
                    .expect("compiles");
            assert!(code.contains(expected), "{target:?}:\n{code}");
        }
    })
    .expect("parses");
}

// The directives acorn reads at the start of the component function in svelte 5.59.1's output,
// client then server: a string statement is one only where the script's prologue put it.
#[test]
fn only_the_scripts_prologue_opens_the_component_function_with_directives() {
    use oxc_ast::ast::{ExportDefaultDeclarationKind, Statement};
    let cells: [(&str, [&[&str]; 2]); 4] = [
        (
            "let { x } = $props();\n\"use strict\";\n`template stmt`;\n(\"parens\");",
            [&[], &[]],
        ),
        (
            "\"use strict\";\n\"b\";\nlet { x } = $props();\n\"late\";",
            [&["use strict", "b"], &["use strict", "b"]],
        ),
        (
            "\"use strict\";\nlet { x } = $props();\nexport function f() {}",
            [&[], &["use strict"]],
        ),
        (
            "\"use strict\";\nlet x = 1;",
            [&["use strict"], &["use strict"]],
        ),
    ];
    for (script, expected) in cells {
        let source = format!("<script>\n{script}\n</script>\n<p>{{x}}</p>\n");
        for (generate, expected) in [Target::Client, Target::Server].into_iter().zip(expected) {
            let options = rsvelte_svelte_compile::CompileOptions {
                filename: "App.svelte".to_owned(),
                generate,
                ..rsvelte_svelte_compile::CompileOptions::default()
            };
            let code = rsvelte_svelte_compile::compile(&source, &options)
                .expect("compiles")
                .js
                .code;
            let allocator = oxc_allocator::Allocator::default();
            let parsed =
                oxc_parser::Parser::new(&allocator, &code, oxc_span::SourceType::mjs()).parse();
            let body = parsed
                .program
                .body
                .iter()
                .find_map(|statement| match statement {
                    Statement::ExportDefaultDeclaration(export) => match &export.declaration {
                        ExportDefaultDeclarationKind::FunctionDeclaration(f) => f.body.as_ref(),
                        _ => None,
                    },
                    _ => None,
                });
            let directives: Vec<&str> = body
                .expect("a component function")
                .directives
                .iter()
                .map(|d| d.directive.as_str())
                .collect();
            assert_eq!(directives, expected, "{generate:?}\n{code}");
        }
    }
}
