use rsvelte_svelte_compile::{Target, lower};

#[test]
fn direct_lowering_and_compilation_refuse_runtime_typescript() {
    for script in [
        "enum Color { Red }",
        "namespace Color { export const red = 1; }",
    ] {
        let source = format!("<script lang=\"ts\">{script}</script>");
        super::analyzed(&source, "App.svelte", |input, resolution, analysis| {
            for target in [Target::Client, Target::Server] {
                let allocator = oxc_allocator::Allocator::default();
                let lowered = lower::lower(&input, resolution, analysis, target, &allocator)
                    .expect_err("runtime TypeScript refused");
                let compiled = rsvelte_svelte_compile::compile_to_javascript(
                    &input, resolution, analysis, target,
                )
                .expect_err("runtime TypeScript refused");
                assert_eq!(lowered.code, "typescript_invalid_feature");
                assert_eq!(lowered.code, compiled.code);
                assert_eq!(lowered.message, compiled.message);
                assert_eq!(lowered.span, compiled.span);
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
