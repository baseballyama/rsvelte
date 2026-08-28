use rsvelte_core::{CompileOptions, GenerateMode, ModuleCompileOptions, compile, compile_module};

#[test]
fn module_file_store_subscription_points_at_the_first_reference() {
    let source = "import { store } from 'somewhere';\n\nconsole.log($store);";
    let diagnostic = compile_module(source, ModuleCompileOptions::default())
        .expect_err("module store subscriptions must be rejected")
        .diagnostic();
    let start = source.find("$store").unwrap() as u32;

    assert_eq!(
        diagnostic.code.as_deref(),
        Some("store_invalid_subscription_module")
    );
    assert_eq!(diagnostic.span, Some((start, start + 6)));
}

#[test]
fn module_script_store_subscription_points_at_the_reference() {
    let source = "<script module>\n\tconst foo = {};\n\tconst answer = $foo;\n</script>";
    let diagnostic = compile(
        source,
        CompileOptions {
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect_err("module script store subscriptions must be rejected")
    .diagnostic();
    let start = source.find("$foo").unwrap() as u32;

    assert_eq!(
        diagnostic.code.as_deref(),
        Some("store_invalid_subscription")
    );
    assert_eq!(diagnostic.span, Some((start, start + 4)));
}
