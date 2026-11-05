//! A component whose script awaits inside a TypeScript wrapper, such as
//! `$derived((await f()) as T)`, needs `async function $$render()`; upstream
//! svelte2tsx emits it, and without it TypeScript rejects the `await`
//! (TS1308) in the generated file.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn render_header(script: &str) -> String {
    let source = format!("<script lang=\"ts\">\n{script}\n</script>\n<p>x</p>\n");
    let out = svelte2tsx(
        &source,
        Svelte2TsxOptions {
            filename: "A.svelte".to_string(),
            is_ts_file: true,
            ..Default::default()
        },
    )
    .expect("svelte2tsx");
    out.code
}

#[test]
fn await_inside_a_ts_wrapper_makes_render_async() {
    for script in [
        "const a = $derived((await fetch('/x')) as Response);",
        "const a = $derived((await fetch('/x')) satisfies Response);",
        "const a = $derived((await fetch('/x'))!);",
        "const a = $derived(<Response>(await fetch('/x')));",
        "const a = $derived((await fetch('/x'))?.status);",
        "const a = $derived(f(await g())?.());",
    ] {
        let code = render_header(script);
        assert!(
            code.contains("async function $$render"),
            "`{script}` did not make $$render async:\n{code}"
        );
    }
}

#[test]
fn await_only_inside_a_function_keeps_render_sync() {
    let code = render_header("const a = async () => (await fetch('/x')) as Response;");
    assert!(
        !code.contains("async function $$render"),
        "an await inside a function must not make $$render async:\n{code}"
    );
}
