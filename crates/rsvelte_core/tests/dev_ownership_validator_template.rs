//! Regression test for prop mutations written inside template expressions.
//!
//! Event-handler bodies are converted through the typed `JsNode` path, which
//! never reaches the JSON assignment converter where ownership validation lived,
//! so every such mutation shipped unvalidated and without the preamble.
//!
//! The corpus gates compile with `dev: false`, so nothing else covers this.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_client_dev(src: &str) -> String {
    let result = compile(
        src,
        CompileOptions {
            filename: Some("TemplateMutation.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .expect("compile");
    result.js.code
}

#[test]
fn handler_block_body_mutation_is_ownership_validated() {
    let src = "<script>let { listEl } = $props();</script>\n\
               <button onclick={() => { listEl.style.overflow = \"hidden\"; }}>x</button>\n";
    let out = compile_client_dev(src);
    assert!(
        out.contains("$ownership_validator = $.create_ownership_validator($$props)"),
        "expected the ownership validator preamble, got:\n{out}"
    );
    assert!(
        out.contains(
            "$ownership_validator.mutation('listEl', ['listEl', 'style', 'overflow'], listEl().style.overflow = \"hidden\", 2, 25)"
        ),
        "expected the mutation to be wrapped, got:\n{out}"
    );
}

#[test]
fn handler_expression_body_mutation_is_ownership_validated() {
    let src = "<script>let { listEl } = $props();</script>\n\
               <button onclick={() => (listEl.style.overflow = \"hidden\")}>x</button>\n";
    let out = compile_client_dev(src);
    assert!(
        out.contains(
            "$ownership_validator.mutation('listEl', ['listEl', 'style', 'overflow'], listEl().style.overflow = \"hidden\", 2, 24)"
        ),
        "expected the mutation to be wrapped, got:\n{out}"
    );
}

#[test]
fn handler_update_expression_is_ownership_validated() {
    let src = "<script>let { obj } = $props();</script>\n\
               <button onclick={() => { obj.count++; }}>x</button>\n";
    let out = compile_client_dev(src);
    assert!(
        out.contains("$ownership_validator.mutation('obj', ['obj', 'count'], obj().count++"),
        "expected the update to be wrapped, got:\n{out}"
    );
}

#[test]
fn svelte_ignore_suppresses_handler_validation() {
    let src = "<script>let { listEl } = $props();</script>\n\
               <button onclick={() => {\n\
               \t// svelte-ignore ownership_invalid_mutation\n\
               \tlistEl.style.overflow = \"hidden\";\n\
               }}>x</button>\n";
    let out = compile_client_dev(src);
    assert!(
        !out.contains("$ownership_validator.mutation"),
        "expected svelte-ignore to suppress validation, got:\n{out}"
    );
}
