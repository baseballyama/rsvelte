//! Regression test for issue #1227.
//!
//! A `{#snippet}` whose body lives in an SVG context but contains only adjacent
//! component / render-tag anchors (no direct element) was emitted via
//! `$.from_html` instead of `$.from_svg`, and the SSR markup kept a spurious
//! whitespace text node between the anchors. The root cause was the namespace
//! inference for element-less fragments defaulting to `"html"` rather than
//! inheriting the enclosing namespace (`svg`).

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_gen(src: &str, g: GenerateMode) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: g,
            dev: false,
            css: CssMode::External,
            runes: Some(true),
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

const SNIPPET_IN_SVG: &str = r#"<script>import {a,b} from 'x';</script>
<svg>
  {#snippet inner()}
    {@render a()}
    {@render b()}
  {/snippet}
</svg>"#;

#[test]
fn svg_snippet_uses_from_svg_no_whitespace_anchor() {
    let client = compile_gen(SNIPPET_IN_SVG, GenerateMode::Client);
    // The snippet body must be an SVG template with adjacent anchors and no
    // separating whitespace text node.
    assert!(
        client.contains("$.from_svg(`<!><!>`, 1)"),
        "expected snippet body to use $.from_svg(`<!><!>`, 1); got:\n{client}"
    );
    assert!(
        !client.contains("$.from_html(`<!> <!>`"),
        "snippet body must not fall back to $.from_html with a whitespace anchor; got:\n{client}"
    );
}

#[test]
fn svg_snippet_ssr_has_no_spurious_space() {
    let server = compile_gen(SNIPPET_IN_SVG, GenerateMode::Server);
    // SSR must emit bare `<!---->` anchors, not `<!----> ` with a trailing space.
    assert!(
        !server.contains("<!----> "),
        "SSR must not emit a spurious trailing space after the anchor; got:\n{server}"
    );
}

#[test]
fn svg_snippet_with_html_child_stays_html() {
    // A snippet whose body is an HTML element inside <svg> must still resolve to
    // html (the element overrides the inherited svg namespace).
    let src = r#"<script>let x=1;</script>
<svg>
  {#snippet inner()}
    <p>{x}</p>
  {/snippet}
</svg>"#;
    let client = compile_gen(src, GenerateMode::Client);
    assert!(
        client.contains("$.from_html(`<p></p>`)"),
        "snippet body with <p> child must use $.from_html; got:\n{client}"
    );
}

#[test]
fn svg_snippet_if_html_child_deep_walk_stays_html() {
    // Deep-walk: an HTML element nested inside an {#if} within an <svg> snippet
    // must resolve the snippet body to html.
    let src = r#"<script>let c=true; let x=1;</script>
<svg>
  {#snippet inner()}
    {#if c}<p>{x}</p>{/if}
  {/snippet}
</svg>"#;
    let client = compile_gen(src, GenerateMode::Client);
    assert!(
        client.contains("$.from_html(`<p></p>`)"),
        "snippet body with {{#if}}<p>{{/if}} must use $.from_html; got:\n{client}"
    );
}
