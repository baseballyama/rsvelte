//! A leading UTF-8 BOM is not document content. Upstream's `compiler/index.js`
//! calls `remove_bom` at every public entry (`compile`, `compileModule`,
//! `parse`, `parseCss`) before anything sees the source; rsvelte kept it, so it
//! became a template text node — which also shifts the template's node count,
//! so the client's extra-node flag and the server's leading anchor move with it.
//!
//! Every expectation here was read off the official compiler
//! (`submodules/svelte`) one input per process.

use rsvelte_core::{
    CompileOptions, GenerateMode, ModuleCompileOptions, compile, compile_both, compile_module,
};

const BOM: &str = "\u{feff}";

fn js(src: &str, generate: GenerateMode) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Main.svelte".to_string()),
            generate,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[test]
fn leading_bom_is_not_template_content() {
    let source = "<p>x</p>";
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        assert_eq!(
            js(&format!("{BOM}{source}"), generate),
            js(source, generate),
            "a leading BOM must compile like the same source without one"
        );
    }
    // Positive control: the un-stripped form really did carry the BOM into the
    // template, so this test can fail.
    assert!(!js(source, GenerateMode::Client).contains(BOM));
}

#[test]
fn leading_bom_with_a_script_is_stripped_too() {
    let source = "<script>\n\tlet x = 1;\n</script>\n\n<p>{x}</p>\n";
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        assert_eq!(
            js(&format!("{BOM}{source}"), generate),
            js(source, generate)
        );
    }
}

#[test]
fn a_bom_that_is_not_leading_is_left_alone() {
    // Control: upstream only strips index 0, so U+FEFF elsewhere stays content.
    let with_inner_bom = format!("<p>a{BOM}b</p>");
    assert!(js(&with_inner_bom, GenerateMode::Client).contains(BOM));
    assert_eq!(
        js(&format!("{BOM}{with_inner_bom}"), GenerateMode::Client),
        js(&with_inner_bom, GenerateMode::Client)
    );
}

#[test]
fn compile_both_strips_the_leading_bom() {
    let source = "<p>x</p>";
    let (with_client, with_server) = compile_both(
        &format!("{BOM}{source}"),
        CompileOptions {
            filename: Some("Main.svelte".to_string()),
            ..Default::default()
        },
    )
    .expect("compile_both");
    assert_eq!(with_client.js.code, js(source, GenerateMode::Client));
    assert_eq!(with_server.js.code, js(source, GenerateMode::Server));
}

#[test]
fn compile_module_strips_the_leading_bom() {
    let source = "export let count = $state(0);\n";
    let module = |src: &str| {
        compile_module(
            src,
            ModuleCompileOptions {
                filename: Some("state.svelte.js".to_string()),
                ..Default::default()
            },
        )
        .expect("compile_module")
        .js
        .code
    };
    assert_eq!(module(&format!("{BOM}{source}")), module(source));
}
