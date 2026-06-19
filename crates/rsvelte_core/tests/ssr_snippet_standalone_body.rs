//! Regression test: a snippet body whose sole meaningful child is a single
//! non-dynamic RenderTag (or Component) is "standalone" — it must NOT emit
//! a trailing `<!---->` hydration anchor after the call.
//!
//! Bug: `generate_snippet_body` (used when a SnippetBlock appears inside a
//! component's children, e.g. `<Comp>{#snippet child(p)}{@render foo(p)}{/snippet}</Comp>`)
//! did not compute `is_standalone` for the trimmed body nodes and therefore
//! left `body_generator.skip_hydration_boundaries = false`, causing the
//! RenderTag visitor to push `skip_boundary: false` and the codegen to emit
//! a spurious `$$renderer.push(\`<!---->\`)` at the end of the snippet function.
//!
//! Upstream check: RenderTag.js line 42 `!context.state.is_standalone`; the
//! `is_standalone` is set by Fragment.js via `clean_nodes()` for every fragment
//! including snippet bodies.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn ssr(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Server,
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

/// A snippet body with a single `{@render foo(props)}` is standalone.
/// The generated snippet function must NOT contain `$$renderer.push(\`<!---->\`)`.
#[test]
fn standalone_render_tag_in_snippet_no_trailing_marker() {
    let src = r#"<script>
import Outer from "./O.svelte";
import Inner from "./I.svelte";
</script>
<Outer>
  {#snippet child(props)}
    {@render Inner(props)}
  {/snippet}
</Outer>"#;
    let out = ssr(src);
    // The child snippet function must not contain a trailing empty-comment push.
    assert!(
        !out.contains("$$renderer.push(`<!---->`);"),
        "standalone snippet body emitted a spurious trailing marker:\n{out}"
    );
    // The snippet function call itself must be present.
    assert!(
        out.contains("Inner($$renderer, props)"),
        "expected Inner($$renderer, props) in output:\n{out}"
    );
}

/// Negative case: a snippet body with MULTIPLE children (not standalone) still
/// emits the trailing `<!---->` after the RenderTag (merged with following HTML).
#[test]
fn non_standalone_snippet_siblings_keep_marker() {
    let src = r#"<script>
import Outer from "./O.svelte";
import Inner from "./I.svelte";
</script>
<Outer>
  {#snippet child(props)}
    {@render Inner(props)}
    <span>hi</span>
  {/snippet}
</Outer>"#;
    let out = ssr(src);
    // With multiple children the RenderTag is not standalone. The codegen merges
    // the trailing `<!---->` with the next HTML node into a single push call,
    // e.g. `$$renderer.push(\`<!----> <span>hi</span>\`)`.
    // We check that the `<!---->` anchor is present somewhere in the output string
    // (possibly concatenated with the following element).
    assert!(
        out.contains("<!---->"),
        "non-standalone snippet body should still have a trailing <!---> marker:\n{out}"
    );
}
