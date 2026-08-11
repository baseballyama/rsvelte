use rsvelte_core::compiler::ModuleCompileOptions;
use rsvelte_core::{CompileOptions, GenerateMode, compile, compile_module};

fn compile_module_code(source: &str, dev: bool) -> String {
    compile_module(
        source,
        ModuleCompileOptions {
            filename: Some("effect.svelte.js".to_string()),
            generate: GenerateMode::Client,
            dev,
            ..Default::default()
        },
    )
    .expect("compile module")
    .js
    .code
}

fn compile_component_code(source: &str, dev: bool) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("Effect.svelte".to_string()),
            generate: GenerateMode::Client,
            dev,
            ..Default::default()
        },
    )
    .expect("compile component")
    .js
    .code
}

fn assert_effect_comment_is_an_argument(out: &str) {
    assert!(
        out.contains("} // c\n") && !out.contains("}); // c"),
        "trailing comment must be printed with the callback argument:\n{out}"
    );
}

#[test]
fn trailing_effect_comment_wraps_module_call_in_client_and_dev() {
    let source = "export function f(a) {\n\t$effect(() => {\n\t\tconsole.log(a);\n\t}); // c\n}";
    for dev in [false, true] {
        assert_effect_comment_is_an_argument(&compile_module_code(source, dev));
    }
}

#[test]
fn trailing_effect_comment_wraps_instance_function_call_in_client_and_dev() {
    let source = "<script>\n\tfunction f(a) {\n\t\t$effect(() => {\n\t\t\tconsole.log(a);\n\t\t}); // c\n\t}\n</script>\n<p>ok</p>";
    for dev in [false, true] {
        assert_effect_comment_is_an_argument(&compile_component_code(source, dev));
    }
}

#[test]
fn trailing_effect_comment_wraps_instance_top_level_call_in_client_and_dev() {
    let source =
        "<script>\n\t$effect(() => {\n\t\tconsole.log('ok');\n\t}); // c\n</script>\n<p>ok</p>";
    for dev in [false, true] {
        assert_effect_comment_is_an_argument(&compile_component_code(source, dev));
    }
}

#[test]
fn trailing_inspect_comment_wraps_dev_console_call() {
    let source =
        "<script>\n\t$inspect(() => {\n\t\tconsole.log('ok');\n\t}); // c\n</script>\n<p>ok</p>";
    assert_effect_comment_is_an_argument(&compile_component_code(source, true));
}
