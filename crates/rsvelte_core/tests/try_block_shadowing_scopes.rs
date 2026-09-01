//! A `const` in a `try` or `finally` body must shadow an outer reactive `let`
//! when the block sits inside a template expression.
//!
//! `apply_transforms_to_statement_with_shadowed`'s `Try` arm walked the `block`
//! and `finalizer` children with the OUTER scope — only the `catch` clause built
//! a child scope, and only for its parameter. Every other block form
//! (`JsStatement::Block`, an `if` consequent, a loop body) calls
//! `register_block_local_vars` first, which is why those cells were already
//! correct and these two were not.
//!
//! Every expectation was taken from the official Svelte compiler
//! (`submodules/svelte/packages/svelte/src/compiler/index.js`).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// The only variable across the cells is which block the shadowing `const` sits
/// in; `{models}{reload}` keeps `models` reactive in every one of them.
fn cell(body: &str) -> String {
    format!(
        r#"<script>
	let models = null;
	function reload() {{ models = []; }}
	function send(m) {{ return m; }}
</script>
<button onclick={{() => {{
{body}
}}}}>{{models}}{{reload}}</button>
"#
    )
}

#[test]
fn a_const_in_a_try_body_shadows_an_outer_reactive_let() {
    let out = compile_client(&cell(
        "\ttry {\n\t\tconst models = [1];\n\t\tsend(models);\n\t} catch (e) {}",
    ));
    assert!(
        out.contains("send(models)"),
        "the local `const` must be read directly:\n{out}"
    );
    assert!(
        !out.contains("send($.get(models))"),
        "the outer signal must not be read:\n{out}"
    );
}

#[test]
fn a_const_in_a_finally_body_shadows_an_outer_reactive_let() {
    let out = compile_client(&cell(
        "\ttry {} finally {\n\t\tconst models = [1];\n\t\tsend(models);\n\t}",
    ));
    assert!(
        out.contains("send(models)"),
        "the local `const` must be read directly:\n{out}"
    );
    assert!(
        !out.contains("send($.get(models))"),
        "the outer signal must not be read:\n{out}"
    );
}

#[test]
fn a_catch_parameter_still_shadows() {
    let out = compile_client(&cell("\ttry {} catch (models) {\n\t\tsend(models);\n\t}"));
    assert!(
        out.contains("send(models)"),
        "the catch parameter was already handled and must stay so:\n{out}"
    );
}

#[test]
fn a_bare_block_still_shadows() {
    let out = compile_client(&cell(
        "\t{\n\t\tconst models = [1];\n\t\tsend(models);\n\t}",
    ));
    assert!(
        out.contains("send(models)"),
        "a plain block was already correct and must stay so:\n{out}"
    );
}

#[test]
fn an_unshadowed_read_in_a_try_body_still_reads_the_signal() {
    let out = compile_client(&cell("\ttry {\n\t\tsend(models);\n\t} catch (e) {}"));
    assert!(
        out.contains("send($.get(models))"),
        "with no shadow the outer signal must still be read — the fix must not \
         suppress the transform wholesale:\n{out}"
    );
}
