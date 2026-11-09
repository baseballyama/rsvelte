//! Single components compiled end to end, pinning the official compiler's output or diagnostic,
//! or rsvelte's documented deviation where the official output is an upstream bug. Printed code is
//! compared without whitespace unless the whitespace is the point.

use rsvelte_svelte_compile::{CompileInput, Target, compile_input};
use rsvelte_svelte_semantic::{analyze, compiler_syntax_tree, resolve};

/// The output, or the code of the diagnostic that refuses the source.
fn compile(source: &str, target: Target) -> Result<String, String> {
    let component =
        rsvelte_svelte_syntax::parse::parse(source).map_err(|error| format!("{error:?}"))?;
    let tree = compiler_syntax_tree::lower(&component, source);
    let input = rsvelte_svelte_semantic::svelte_input(&component, &tree, source, "App.svelte");
    let resolution = resolve::resolve_with_module(
        &component.javascript,
        component.program,
        component.module.as_ref().map(|s| s.program),
        &tree,
    );
    let analysis = analyze::analyze(&input, &resolution);
    compile_input(&CompileInput::from(input), &resolution, &analysis, target)
        .map_err(|error| error.code.to_string())
}

fn compiled(source: &str, target: Target) -> String {
    compile(source, target).unwrap_or_else(|error| panic!("{source} on {target:?}: {error}"))
}

/// The output without whitespace, so that a test does not depend on the printer's layout.
fn squashed(source: &str, target: Target) -> String {
    compiled(source, target)
        .chars()
        .filter(|c| !c.is_whitespace())
        .collect()
}

#[test]
fn an_await_while_rendering_needs_async_mode() {
    for (source, error) in [
        (
            "<script>let a = await Promise.resolve(1);</script>{a}",
            true,
        ),
        ("<script>let a = 1;</script>{await a}", true),
        // Upstream prints this `for await` into the component function, which is not async.
        ("<script>for await (const a of []) {}</script>", true),
        (
            "<script>async function f() { for await (const a of []) {} }</script>",
            false,
        ),
        ("<script>async function f() { await 1; }</script>", false),
        ("<script module>await Promise.resolve();</script>", false),
    ] {
        for target in [Target::Client, Target::Server] {
            assert_eq!(
                compile(source, target).err().as_deref() == Some("experimental_async"),
                error,
                "{source} on {target:?}"
            );
        }
    }
}

#[test]
fn a_byte_order_mark_is_no_text() {
    assert!(squashed("\u{feff}<p>a</p>", Target::Server).contains("`<p>a</p>`"));
}

#[test]
fn an_optional_global_member_is_not_folded() {
    for (markup, kept) in [
        ("<p>{Math?.PI}</p>", "Math?.PI"),
        ("<p>{Math.max?.(1, 2)}</p>", "Math.max?.(1,2)"),
    ] {
        assert!(squashed(markup, Target::Client).contains(kept), "{markup}");
    }
}

#[test]
fn a_grouped_optional_chain_is_neither_pure_nor_safe() {
    for markup in [
        "<p>{(Math?.PI).toFixed()}</p>",
        "<p>{(Math?.max)(1, 2)}</p>",
    ] {
        let client = squashed(markup, Target::Client);
        assert!(client.contains("$.push($$props,true);"), "{client}");
        assert!(client.contains("$.template_effect(($0)=>"), "{client}");
        let server = squashed(markup, Target::Server);
        assert!(
            server.contains("$$renderer.component(($$renderer)=>"),
            "{server}"
        );
    }
}
