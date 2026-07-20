//! Phase 6 coverage: whitespace inside `<pre>` and `<textarea>` is
//! preserved verbatim. The element's own open / close tags are still
//! normalized; only the body whitespace is left alone.

use rsvelte_formatter::{FormatOptions, format};

fn fmt(src: &str) -> String {
    let out = format(src, &FormatOptions::default()).expect("format ok");
    out.strip_suffix('\n').map(str::to_string).unwrap_or(out)
}

#[test]
fn pre_preserves_inner_whitespace() {
    // Use lines that don't contain `{` — Svelte would otherwise parse
    // it as a template expression. `<pre>` doesn't change that.
    let src = "<pre>\n  some\n    indented\n      text\n</pre>";
    let out = fmt(src);
    assert!(
        out.contains("\n  some\n    indented\n      text\n"),
        "expected pre body verbatim:\n{out}"
    );
}

#[test]
fn pre_open_tag_still_normalized() {
    let out = fmt("<pre  class=\"a\"  >x</pre>");
    assert!(
        out.starts_with("<pre class=\"a\">"),
        "expected open tag normalized:\n{out}"
    );
}

#[test]
fn textarea_preserves_inner_whitespace() {
    let src = "<textarea>\n  line1\n     line2\n</textarea>";
    let out = fmt(src);
    assert!(
        out.contains("\n  line1\n     line2\n"),
        "expected textarea body verbatim:\n{out}"
    );
}

#[test]
fn pre_with_child_element_preserves_outer_whitespace() {
    // `<pre><code>x</code></pre>` — the whitespace-only Text inside is
    // preserved; `<code>`'s open tag is still normalized.
    let src = "<pre>\n  <code  class=\"x\">y</code>\n</pre>";
    let out = fmt(src);
    assert!(
        out.contains("\n  <code class=\"x\">y</code>\n"),
        "expected pre's inner whitespace preserved and code normalized:\n{out}"
    );
}

#[test]
fn nested_pre_inside_div_preserves() {
    let src = "<div>\n<pre>\n  raw stuff\n</pre>\n</div>";
    let out = fmt(src);
    // The outer <div> still normalizes the whitespace around <pre>
    // (depth 1 indent), but <pre>'s body is verbatim.
    assert!(
        out.contains("\n  <pre>\n  raw stuff\n</pre>\n"),
        "expected outer indent + inner pre verbatim:\n{out}"
    );
}

#[test]
fn non_pre_element_still_reindents() {
    // Sanity: this is the regression marker — Phase 6 should not have
    // broken regular indentation.
    let out = fmt("<div>\n<p>x</p>\n</div>");
    assert_eq!(out, "<div>\n  <p>x</p>\n</div>");
}

/// The `<pre>`-with-a-block pass re-parses its own sub-format output. That
/// re-parse must use the same options `format` uses, or it fails and the pass
/// silently leaves the body unformatted. Neither case is reachable from the
/// corpus, so assert both here.
#[test]
fn pre_block_reformat_survives_non_css_lang_style() {
    let src = "<pre>\n<style lang=\"scss\">\n$brand: red;\n.a { color: $brand; }\n</style>\n{#if true}\n<code>x</code>\n{/if}\n</pre>";
    let out = fmt(src);
    // The pass re-indents the block; when the re-parse fails it bails and the
    // block stays at column 0.
    assert!(
        out.contains("\t{#if true}") && out.contains("$brand: red;"),
        "expected the block pass to run with the scss body intact:\n{out}"
    );
}

#[test]
fn pre_block_reformat_survives_ts_in_plain_script() {
    let src = "<pre>\n<script>\nconst f = (x: string): number => x.length;\n</script>\n{#if true}\n<code>x</code>\n{/if}\n</pre>";
    let out = fmt(src);
    assert!(
        out.contains("\t{#if true}") && out.contains("(x: string): number"),
        "expected the block pass to run with the TS body intact:\n{out}"
    );
}
