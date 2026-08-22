//! `hmr: true` output parity (issue #3240).
//!
//! `hmr` is the Vite plugin's compile path and no corpus target sets it, so four
//! divergences lived there unobserved. Each expectation below is the official
//! compiler's verbatim output at the pinned Svelte revision.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn code(src: &str, generate: GenerateMode, hmr: bool, css: CssMode) -> String {
    let opts = CompileOptions {
        filename: Some("A.svelte".to_string()),
        generate,
        css,
        hmr,
        ..Default::default()
    };
    compile(src, opts).expect("compiles").js.code
}

const RENDER_TAG: &str = "{#snippet s(x)}<b>{x}</b>{/snippet}{@render s(1)}";

const COMPONENT: &str = "<script>\n\timport C from \"./C.svelte\";\n</script>\n<C a={1}>x</C>";

const STYLED: &str = "<script>\n\tlet n = $state(1);\n</script>\n<div class=\"a\">{n}</div>\n<style>\n\t.a { color: red }\n</style>";

const CUSTOM_ELEMENT: &str = "<svelte:options customElement=\"my-el\" />\n<script>\n\tlet { a = 1 } = $props();\n</script>\n<div>{a}</div>";

/// A `<style>` block means the accept hook has to drop the previous version's
/// injected stylesheet, or its rules accumulate across every hot update.
#[test]
fn accept_hook_cleans_up_injected_styles() {
    let with_style = code(STYLED, GenerateMode::Client, true, CssMode::Injected);
    assert!(
        with_style.contains(
            "\timport.meta.hot.accept((module) => {\n\t\t$.cleanup_styles('svelte-1lj1c2h');\n\t\tA[$.HMR].update(module.default);\n\t});"
        ),
        "expected `$.cleanup_styles` ahead of the update call:\n{with_style}"
    );

    // Control: no `<style>` means no hash, and then no `cleanup_styles` call.
    let no_style = code(
        "<script>\n\tlet n = $state(1);\n</script>\n<div>{n}</div>",
        GenerateMode::Client,
        true,
        CssMode::Injected,
    );
    assert!(
        no_style.contains(
            "\timport.meta.hot.accept((module) => {\n\t\tA[$.HMR].update(module.default);\n\t});"
        ) && !no_style.contains("cleanup_styles"),
        "a style-less component must not clean up styles:\n{no_style}"
    );
}

/// `customElements.define` throws on a name that is already defined, so the
/// second hot update of a custom-element component would abort the module.
#[test]
fn custom_element_definition_is_guarded_under_hmr() {
    let hot = code(
        CUSTOM_ELEMENT,
        GenerateMode::Client,
        true,
        CssMode::External,
    );
    assert!(
        hot.contains(
            "if (customElements.get('my-el') == null) customElements.define('my-el', $.create_custom_element(A, { a: {} }, [], [], { mode: 'open' }));"
        ),
        "expected the `customElements.get(...) == null` guard:\n{hot}"
    );

    let cold = code(
        CUSTOM_ELEMENT,
        GenerateMode::Client,
        false,
        CssMode::External,
    );
    assert!(
        cold.contains("customElements.define('my-el',") && !cold.contains("customElements.get"),
        "without hmr the define stays bare:\n{cold}"
    );
}

/// Upstream gates `is_standalone` on `hmr` for the `Component` arm only, so a
/// root `{@render}` keeps the parent anchor while a root component does not.
/// One of the two alone cannot tell a blanket rule from the real one.
#[test]
fn hmr_suppresses_standalone_for_components_but_not_render_tags() {
    let render_tag = code(RENDER_TAG, GenerateMode::Client, true, CssMode::External);
    assert!(
        render_tag.contains("function A($$anchor) {\n\ts($$anchor, () => 1);\n}"),
        "a root `{{@render}}` needs no anchor comment under hmr:\n{render_tag}"
    );

    let component = code(COMPONENT, GenerateMode::Client, true, CssMode::External);
    assert!(
        component.contains("var fragment = $.comment();\n\tvar node = $.first_child(fragment);")
            && component.contains("$.append($$anchor, fragment);"),
        "a root component DOES get the anchor comment under hmr:\n{component}"
    );

    // Control: without hmr the component is standalone again.
    let cold = code(COMPONENT, GenerateMode::Client, false, CssMode::External);
    assert!(
        !cold.contains("$.comment()"),
        "without hmr the root component stays standalone:\n{cold}"
    );
}

/// The server port of the same predicate: the trailing hydration anchor after a
/// component must survive under `hmr`, or hydration of that subtree mismatches.
#[test]
fn server_keeps_the_trailing_anchor_after_a_component_under_hmr() {
    let hot = code(COMPONENT, GenerateMode::Server, true, CssMode::External);
    assert!(
        hot.contains("\t\t$$slots: { default: true }\n\t});\n\n\t$$renderer.push(`<!---->`);"),
        "expected the closing `<!---->` push:\n{hot}"
    );

    let cold = code(COMPONENT, GenerateMode::Server, false, CssMode::External);
    assert!(
        !cold.contains("$$renderer.push(`<!---->`);"),
        "without hmr there is no trailing anchor:\n{cold}"
    );

    // A render tag is unaffected in either mode.
    for hmr in [false, true] {
        let render_tag = code(RENDER_TAG, GenerateMode::Server, hmr, CssMode::External);
        assert!(
            render_tag.contains("export default function A($$renderer) {\n\ts($$renderer, 1);\n}"),
            "render tag must be unchanged (hmr={hmr}):\n{render_tag}"
        );
    }
}
