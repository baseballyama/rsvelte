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

#[test]
fn non_hoistable_snippet_guard_keeps_declaration_tag_order() {
    let output = compile_server_dev("{#if true}{@const xx = test}{#snippet test()}{/snippet}{/if}");
    let constant = output.find("const xx = test;").expect("const declaration");
    let guard = output
        .find("$.prevent_snippet_stringification(test);")
        .expect("snippet guard");
    assert!(
        constant < guard,
        "the guard must retain its source order after earlier declaration tags:\n{output}"
    );
}
