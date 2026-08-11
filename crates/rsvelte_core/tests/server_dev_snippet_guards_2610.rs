use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_server_dev(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            generate: GenerateMode::Server,
            dev: true,
            ..Default::default()
        },
    )
    .unwrap_or_else(|error| panic!("compile failed: {error:?}"))
    .js
    .code
}

#[test]
fn snippet_block_gets_server_dev_guards() {
    let output = compile_server_dev("{#snippet foo()}foo{/snippet}{@render foo()}");
    assert!(
        output.contains("$.prevent_snippet_stringification(foo);"),
        "{output}"
    );
    assert!(
        output.contains("$.validate_snippet_args($$renderer);"),
        "{output}"
    );
}

#[test]
fn default_component_children_get_server_dev_stringification_guard() {
    let output = compile_server_dev("<Child>default</Child>");
    assert!(
        output.contains("children: $.prevent_snippet_stringification("),
        "{output}"
    );
}
