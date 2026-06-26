//! Regression tests for issue #1237 — three CSS scoping/pruning divergences
//! from the official `svelte` compiler, surfaced by the awesome-svelte compat
//! corpus (svar-core, svelte-toast).
//!
//! 1. A sibling-combinator selector (`.wx-icon + .wx-label`) was over-pruned
//!    when the matching `.wx-icon` element carried a *dynamic* class
//!    (`class="wx-icon {expr}"`). The static `wx-icon` chunk dropped out of the
//!    element's class set on bail-out, so the sibling no longer matched.
//!    Upstream `attribute_matches` treats an indeterminate class as matching any
//!    class selector, so the rule must be kept and scoped.
//! 2. A multi-line `:global( … )` wrapper lost the whitespace that sits between
//!    the parentheses and the inner selector list. Upstream only removes
//!    `:global(` and the closing `)`, leaving the inner span byte-for-byte.
//! 3. A `<style>` substring inside a `<script>` template-literal (a docs page
//!    rendering a Svelte code sample) was mistaken for the real stylesheet,
//!    because the CSS content was located by a textual scan from offset 0
//!    instead of the parsed stylesheet's recorded span.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn css(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            runes: Some(true),
            ..Default::default()
        },
    )
    .expect("compile")
    .css
    .map(|c| c.code)
    .unwrap_or_default()
}

#[test]
fn sibling_combinator_kept_when_before_element_has_dynamic_class() {
    let src = r#"<script>let { options = [], children } = $props();</script>
<div>
  {#each options as option (option.id)}
    <button>
      {#if children}{@render children({ option })}{:else}
        {#if option.icon}<i class="wx-icon {option.icon} {!option.label ? 'wx-only' : ''}"></i>{/if}
        {#if option.label}<span class="wx-label">{option.label}</span>{/if}
      {/if}
    </button>
  {/each}
</div>
<style>
  .wx-icon + .wx-label { color: red; }
</style>"#;
    let out = css(src);
    assert!(
        !out.contains("(unused)"),
        "`.wx-icon + .wx-label` must not be pruned, got:\n{out}"
    );
    assert!(
        out.contains("+ .wx-label"),
        "scoped sibling selector missing, got:\n{out}"
    );
}

#[test]
fn multiline_global_wrapper_preserves_inner_whitespace() {
    let src = "<div class=\"wx-theme\">x</div>\n\n<style>\n\t:global(\n\t\t\t.wx-theme *,\n\t\t\t.wx-theme *:before,\n\t\t\t.wx-theme *:after\n\t\t) {\n\t\tbox-sizing: border-box;\n\t}\n</style>";
    let out = css(src);
    // Upstream removes only `:global(` and the closing `)`; every byte between
    // them (including the leading newline+tabs and the trailing `\n\t\t`) stays.
    assert!(
        out.contains(
            "\n\t\t\t.wx-theme *,\n\t\t\t.wx-theme *:before,\n\t\t\t.wx-theme *:after\n\t\t {"
        ),
        "inner :global() whitespace not preserved, got:\n{out:?}"
    );
}

#[test]
fn style_inside_script_template_literal_is_not_picked_up() {
    let src = "<script>\n  const code = `<style>\n  :root { color: red; }\n</style>`;\n</script>\n\n<div class=\"custom\">x</div>\n\n<style>\n.custom { color: green; }\n</style>";
    let out = css(src);
    assert!(
        out.contains(".custom") && out.contains("color: green"),
        "real stylesheet must be compiled, got:\n{out}"
    );
    assert!(
        !out.contains(":root") && !out.contains("color: red"),
        "template-literal <style> must be ignored, got:\n{out}"
    );
}
