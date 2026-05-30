//! Phase 4 coverage: whitespace-between-siblings normalization +
//! close-tag normalization.

use rsvelte_formatter::{FormatOptions, IndentStyle, IndentWidth, JsFormatOptions, format};

fn fmt(src: &str) -> String {
    format(src, &FormatOptions::default()).expect("format ok")
}

fn fmt_with(src: &str, opts: &FormatOptions) -> String {
    format(src, opts).expect("format ok")
}

// ─── Close-tag normalization ─────────────────────────────────────────────

#[test]
fn close_tag_whitespace_stripped() {
    let out = fmt("<div></div  >");
    assert_eq!(out, "<div></div>");
}

#[test]
fn close_tag_with_content() {
    let out = fmt("<p>hello</p   >");
    assert_eq!(out, "<p>hello</p>");
}

#[test]
fn close_tag_with_newlines() {
    let out = fmt("<div></div\n>");
    assert_eq!(out, "<div></div>");
}

// ─── Indentation: simple nesting ─────────────────────────────────────────

#[test]
fn nested_element_indented_to_two_spaces() {
    let out = fmt("<div>\n    <p>x</p>\n</div>");
    assert_eq!(out, "<div>\n  <p>x</p>\n</div>");
}

#[test]
fn nested_under_no_indent_at_source_normalizes() {
    let out = fmt("<div>\n<p>x</p>\n</div>");
    assert_eq!(out, "<div>\n  <p>x</p>\n</div>");
}

#[test]
fn deeply_nested_indent_scales() {
    let out = fmt("<section>\n<div>\n<p>x</p>\n</div>\n</section>");
    assert_eq!(
        out,
        "<section>\n  <div>\n    <p>x</p>\n  </div>\n</section>"
    );
}

#[test]
fn multiple_siblings_share_indent() {
    let out = fmt("<div>\n  <p>a</p>\n   <p>b</p>\n     <p>c</p>\n</div>");
    assert_eq!(out, "<div>\n  <p>a</p>\n  <p>b</p>\n  <p>c</p>\n</div>");
}

// ─── Root level: no indent on top-level elements ────────────────────────

#[test]
fn root_level_elements_stay_at_column_zero() {
    let src = "<p>a</p>\n<p>b</p>";
    assert_eq!(fmt(src), src);
}

#[test]
fn root_whitespace_between_elements_normalized() {
    // Two top-level <p>s separated by "  \n    " — normalize to just "\n".
    let out = fmt("<p>a</p>  \n    <p>b</p>");
    assert_eq!(out, "<p>a</p>\n<p>b</p>");
}

// ─── Tab indent ──────────────────────────────────────────────────────────

#[test]
fn tab_style_uses_tabs_for_nesting() {
    let opts = FormatOptions {
        js: JsFormatOptions {
            indent_style: IndentStyle::Tab,
            ..JsFormatOptions::new()
        },
    };
    let out = fmt_with("<div>\n  <p>x</p>\n</div>", &opts);
    assert_eq!(out, "<div>\n\t<p>x</p>\n</div>");
}

#[test]
fn four_space_indent_used() {
    let opts = FormatOptions {
        js: JsFormatOptions {
            indent_width: IndentWidth::try_from(4).expect("4 is valid"),
            ..JsFormatOptions::new()
        },
    };
    let out = fmt_with("<div>\n<p>x</p>\n</div>", &opts);
    assert_eq!(out, "<div>\n    <p>x</p>\n</div>");
}

// ─── Block bodies add an indent level ──────────────────────────────────

#[test]
fn if_block_body_indented_under_outer_element() {
    let out = fmt("<div>\n{#if cond}\n<p>x</p>\n{/if}\n</div>");
    // Inner `<p>` is two levels deep (under div + under if).
    assert!(
        out.contains("\n    <p>x</p>\n"),
        "expected 4-space indent for if body inside div:\n{out}"
    );
}

#[test]
fn each_block_body_indented_at_root() {
    let out = fmt("{#each items as item}\n<p>{item}</p>\n{/each}");
    assert!(
        out.contains("\n  <p>{item}</p>\n"),
        "expected 2-space indent for each body at root:\n{out}"
    );
}

// ─── Inline-only contents stay verbatim ─────────────────────────────────

#[test]
fn inline_text_only_preserved() {
    let src = "<p>hello world</p>";
    assert_eq!(fmt(src), src);
}

#[test]
fn inline_text_and_expression_preserved() {
    let src = "<p>count is {count}</p>";
    assert_eq!(fmt(src), src);
}

#[test]
fn mixed_text_and_inline_element_preserved() {
    // No whitespace-only Text nodes, no normalization runs on this fragment.
    let src = "<p>hello <em>world</em></p>";
    assert_eq!(fmt(src), src);
}

// ─── End-to-end ──────────────────────────────────────────────────────────

#[test]
fn end_to_end_realistic_nested_component() {
    let src = "<script>let x=1</script>\n\
               <section>\n\
                  <h1>Title</h1>\n\
                  <p>Body { x }</p>\n\
                  {#if x>0}\n\
                  <span>positive</span>\n\
                  {/if}\n\
               </section>";
    let out = fmt(src);
    // Script formatted, section opener trimmed, nested element indents normalized.
    assert!(out.contains("let x = 1;"), "{out}");
    assert!(out.contains("\n  <h1>Title</h1>\n"), "{out}");
    assert!(out.contains("\n  <p>Body {x}</p>\n"), "{out}");
    // The `<span>` is inside the if-block which is inside section, so depth 2.
    assert!(out.contains("\n    <span>positive</span>\n"), "{out}");
}
