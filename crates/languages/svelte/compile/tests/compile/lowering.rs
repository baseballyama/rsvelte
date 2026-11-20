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
