use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn diagnostic(source: &str) -> rsvelte_core::compiler::CompileErrorDiagnostic {
    compile(
        source,
        CompileOptions {
            filename: Some("main.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect_err("the invalid export must be rejected")
    .diagnostic()
}

#[test]
fn export_undefined_points_at_the_whole_export_specifier() {
    let source = "<script module>\n\texport { missing as alias };\n</script>";
    let diagnostic = diagnostic(source);
    let start = source.find("missing as alias").unwrap() as u32;

    assert_eq!(diagnostic.code.as_deref(), Some("export_undefined"));
    assert_eq!(diagnostic.span, Some((start, start + 16)));
}

#[test]
fn snippet_invalid_export_points_at_the_export_specifier() {
    let source = "<script module>\n\texport { greeting };\n</script>\n\
<script>let message = 1;</script>\n\
{#snippet greeting()}{message}{/snippet}";
    let diagnostic = diagnostic(source);
    let start = source.find("greeting").unwrap() as u32;

    assert_eq!(diagnostic.code.as_deref(), Some("snippet_invalid_export"));
    assert_eq!(diagnostic.span, Some((start, start + 8)));
}
