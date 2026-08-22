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

#[test]
fn pre_child_open_tag_breaks_when_content_is_multiline() {
    let out = fmt("<pre><code><span>a</span>\n<span>b</span>\n</code></pre>");
    assert_eq!(
        out,
        "<pre><code\n    ><span>a</span>\n<span>b</span>\n</code></pre>"
    );
}

#[test]
fn pre_child_open_tag_breaks_for_text_and_expression_content() {
    assert_eq!(
        fmt("<pre><code>a\nb\n</code></pre>"),
        "<pre><code\n    >a\nb\n</code></pre>"
    );
    assert_eq!(
        fmt("<pre><code>{value}\nb\n</code></pre>"),
        "<pre><code\n    >{value}\nb\n</code></pre>"
    );
}

#[test]
fn pre_child_open_tag_stays_hugged_when_not_borrowed() {
    // Single-line content: nothing forces the break.
    assert_eq!(
        fmt("<pre><code><span>a</span></code></pre>"),
        "<pre><code><span>a</span></code></pre>"
    );
    // Leading whitespace in the content is not borrowed, so the `>` stays.
    assert_eq!(
        fmt("<pre><code> a\nb\n</code></pre>"),
        "<pre><code> a\nb\n</code></pre>"
    );
    assert_eq!(
        fmt("<pre><code>\na\nb\n</code></pre>"),
        "<pre><code>\na\nb\n</code></pre>"
    );
    // A block-display child is not leading-space-sensitive.
    assert_eq!(
        fmt("<pre><div>a\nb\n</div></pre>"),
        "<pre><div>a\nb\n</div></pre>"
    );
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
        !out.contains("\n{#if true}") && out.contains("$brand: red;"),
        "expected the block pass to run with the scss body intact:\n{out}"
    );
}

#[test]
fn pre_block_reformat_survives_ts_in_plain_script() {
    let src = "<pre>\n<script>\nconst f = (x: string): number => x.length;\n</script>\n{#if true}\n<code>x</code>\n{/if}\n</pre>";
    let out = fmt(src);
    assert!(
        !out.contains("\n{#if true}") && out.contains("(x: string): number"),
        "expected the block pass to run with the TS body intact:\n{out}"
    );
}

#[test]
fn unicode_separators_in_text_are_content() {
    // U+2028/U+2029/U+3000 are Unicode whitespace but NOT HTML whitespace
    // (`[\t\n\f\r ]`): prettier keeps them verbatim, so collapsing or
    // trimming them changes what the browser renders (#3046).
    let src = "<p>a\u{2028}b</p>\n<p>c\u{2029}d</p>\n";
    assert_eq!(fmt(src), "<p>a\u{2028}b</p>\n<p>c\u{2029}d</p>");
}

#[test]
fn ideographic_space_at_text_edges_survives() {
    let src = "<p>\u{3000}x\u{3000}</p>\n";
    assert_eq!(fmt(src), "<p>\u{3000}x\u{3000}</p>");
}

#[test]
fn multiline_textarea_breaks_its_tags() {
    // prettier breaks a whitespace-sensitive `<textarea>`'s tags so no
    // formatter-inserted newline changes the value (#3060): `>` drops one
    // level in when content starts inline, the close tag when it ends inline.
    let out = fmt("<textarea>static\n\tmultiline</textarea>");
    assert_eq!(out, "<textarea\n  >static\n\tmultiline</textarea\n>");
}

#[test]
fn textarea_edge_newlines_keep_that_tag_unbroken() {
    // A leading newline keeps the open tag glued; a trailing one the close.
    let out = fmt("<textarea>\na\nb</textarea>");
    assert_eq!(out, "<textarea>\na\nb</textarea\n>");
    let out = fmt("<textarea>a\nb\n</textarea>");
    assert_eq!(out, "<textarea\n  >a\nb\n</textarea>");
    let out = fmt("<textarea>\na\nb\n</textarea>");
    assert_eq!(out, "<textarea>\na\nb\n</textarea>");
}

#[test]
fn overflowing_textarea_keeps_attrs_on_the_open_line() {
    // Unlike `<pre>`, an overflowing one-line `<textarea>` does not break its
    // attributes — the whole open tag stays and only `>` drops.
    let src = "<textarea class=\"aaaaaaaaaaaaaaaaaaaa bbbbbbbbbbbbbbbbbbbb cccccccccccccccccccc\" rows=\"10\">some content here</textarea>";
    let out = fmt(src);
    assert_eq!(
        out,
        "<textarea class=\"aaaaaaaaaaaaaaaaaaaa bbbbbbbbbbbbbbbbbbbb cccccccccccccccccccc\" rows=\"10\"\n  >some content here</textarea\n>"
    );
}
