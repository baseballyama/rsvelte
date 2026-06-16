//! Phase 5 coverage: line-width-aware open-tag wrapping. When an open
//! tag's one-line rendering plus its parent indent exceeds
//! `options.js.line_width`, attributes break to one-per-line with the
//! closing `>` / `/>` on a new line at the parent indent.

use rsvelte_formatter::{FormatOptions, JsFormatOptions, LineWidth, format};

fn fmt_at_width(src: &str, line_width: u16) -> String {
    let opts = FormatOptions {
        js: JsFormatOptions {
            line_width: LineWidth::try_from(line_width).expect("valid line width"),
            ..JsFormatOptions::new()
        },
        ..FormatOptions::default()
    };
    let out = format(src, &opts).expect("format ok");
    out.strip_suffix('\n').map(str::to_string).unwrap_or(out)
}

#[test]
fn fits_one_line_under_width() {
    // 80-char default; this open tag is short and stays inline.
    let out = fmt_at_width("<div class=\"a\" id=\"b\"></div>", 80);
    assert_eq!(out, "<div class=\"a\" id=\"b\"></div>");
}

#[test]
fn wraps_when_one_liner_exceeds_width() {
    // Forced wrap by setting line_width = 20.
    let out = fmt_at_width("<div class=\"foo\" id=\"bar\"></div>", 20);
    assert_eq!(out, "<div\n  class=\"foo\"\n  id=\"bar\"\n></div>");
}

#[test]
fn wrapped_self_closing_keeps_slash_on_outer_indent() {
    let out = fmt_at_width(
        "<input type=\"text\" value={foo} placeholder=\"hello world\"/>",
        20,
    );
    assert_eq!(
        out,
        "<input\n  type=\"text\"\n  value={foo}\n  placeholder=\"hello world\"\n/>"
    );
}

#[test]
fn nested_element_uses_deeper_indent_when_wrapped() {
    // The inner <span> has a long attribute list; we expect the
    // continuation lines to be indented at depth 2 (4 spaces under
    // <div>'s depth 0 → <span> at depth 1 → attrs at depth 2).
    let src = "<div>\n<span class=\"foo\" id=\"bar\" data-x=\"y\"></span>\n</div>";
    let out = fmt_at_width(src, 30);
    // After indent.rs normalizes the whitespace, <span> sits at depth 1.
    // Attribute continuation is at depth 2 = 4 spaces.
    assert!(
        out.contains("\n  <span\n    class=\"foo\""),
        "expected continuation at depth 2:\n{out}"
    );
    assert!(out.contains("\n  ></span>"), "{out}");
}

#[test]
fn empty_open_tag_stays_inline_even_with_short_width() {
    // No attributes — never wrap.
    let out = fmt_at_width("<div></div>", 10);
    assert_eq!(out, "<div></div>");
}

#[test]
fn single_short_attribute_stays_inline() {
    let out = fmt_at_width("<div class=\"a\"></div>", 30);
    assert_eq!(out, "<div class=\"a\"></div>");
}

#[test]
fn wraps_svelte_component_with_this_first() {
    let out = fmt_at_width(
        "<svelte:component this={ Comp } prop1={ longValueName } prop2={otherValue}/>",
        40,
    );
    assert!(
        out.starts_with("<svelte:component\n  this={Comp}\n"),
        "expected `this` as first attribute when wrapped:\n{out}"
    );
    assert!(
        out.contains("\n/>"),
        "expected closing /> on its own line:\n{out}"
    );
}

#[test]
fn directive_with_modifiers_wraps_as_one_attr() {
    let out = fmt_at_width(
        "<button class=\"primary\" on:click|preventDefault={handleClickWithLongName}>x</button>",
        40,
    );
    // The directive stays on one line. When every attribute wraps, the open tag
    // is in break mode, so its `>` goes on its own indented line before the inline
    // text (`>x`), and the close `>` breaks too — matching the oracle at width 40:
    //   <button
    //     class="primary"
    //     on:click|preventDefault={handleClickWithLongName}
    //     >x</button
    //   >
    assert!(
        out.contains("\n  on:click|preventDefault={handleClickWithLongName}\n  >x</button\n>"),
        "expected directive on one line + broken tag:\n{out}"
    );
}

// ─── #798: whitespace-sensitive inline element — hug open `>`, break close ──

#[test]
fn inline_text_element_hugs_open_and_breaks_close() {
    let src = "<button onclick={() => { doSomethingWithAVeryLongName(); doAnotherThingWithLongName(); doThird(); }}>x</button>";
    let out = fmt_at_width(src, 80);
    // Open `>` glued to the last attribute line (`}}>x`), not on its own line.
    assert!(out.contains("}}>x"), "open > should hug content:\n{out}");
    assert!(
        !out.contains("\n>x"),
        "open > must not sit on its own line:\n{out}"
    );
    // Close tag broken: `</button` then `>` on its own line.
    assert!(
        out.contains("</button\n>"),
        "close > should break onto its own line:\n{out}"
    );
    // Idempotent.
    assert_eq!(fmt_at_width(&out, 80), out, "formatting must be idempotent");
}

#[test]
fn wrapped_block_element_keeps_tags_unchanged() {
    // Child on its own line => content not whitespace-adjacent => no hug.
    let src = "<div data-thing={someValueHere} class=\"a-fairly-long-classname-goes-here\">\n  <span>child</span>\n</div>";
    let out = fmt_at_width(src, 40);
    assert!(
        out.contains("</div>"),
        "block element close tag stays intact:\n{out}"
    );
    assert!(
        !out.contains("</div\n"),
        "block element close > must not break:\n{out}"
    );
}

// ─── #795: attribute value wrap decision accounts for nesting depth ─────────

#[test]
fn attribute_object_value_breaks_by_nested_column() {
    // The object fits at column 0 but overflows once `config` renders at the
    // attribute column under a wrapped tag, so it must break — matching
    // prettier-plugin-svelte (which narrows the value width by the attribute's
    // nesting indent).
    let out = fmt_at_width(
        "<Comp config={{ alpha: oneValue, beta: twoValue, gamma: threeValue, delta: fourValue, epsilon: fiveValue }} />",
        80,
    );
    let expected = "<Comp\n  config={{\n    alpha: oneValue,\n    beta: twoValue,\n    gamma: threeValue,\n    delta: fourValue,\n    epsilon: fiveValue,\n  }}\n/>";
    assert_eq!(
        out.trim_end(),
        expected,
        "object value should break at the nested column:\n{out}"
    );
    // Idempotent.
    assert_eq!(fmt_at_width(&out, 80), out, "must be idempotent");
}

#[test]
fn short_attribute_value_stays_inline_when_nested() {
    // A short value still fits at the nested column, so it stays inline.
    let out = fmt_at_width(
        "<div data-x={shortValue} class=\"a-long-classname-to-force-the-tag-to-wrap-here\"></div>",
        40,
    );
    assert!(
        out.contains("data-x={shortValue}"),
        "short value should stay inline:\n{out}"
    );
}

// ─── #795 sub-case (b): function-binding brace break ────────────────────────

#[test]
fn function_binding_breaks_braces_when_multiline() {
    // A Svelte 5 function binding `bind:value={get, set}` whose setter has a
    // block body can't sit on one line; prettier-plugin-svelte breaks the
    // `{` / `}` onto their own lines (no outer parens) with each member
    // indented one level.
    let out = fmt_at_width(
        "<TextInput bind:value={() => model.data.samlMetadataUrl ?? '', (value) => { model.data.samlMetadataUrl = value; }} />",
        80,
    );
    let expected = "<TextInput
  bind:value={
    () => model.data.samlMetadataUrl ?? \"\",
    (value) => {
      model.data.samlMetadataUrl = value;
    }
  }
/>";
    assert_eq!(
        out.trim_end(),
        expected,
        "function binding should break its braces:\n{out}"
    );
    // Idempotent.
    assert_eq!(fmt_at_width(&out, 80), out, "must be idempotent");
}

#[test]
fn short_function_binding_stays_inline_without_parens() {
    // A short function binding fits on one line and stays inline — and must
    // NOT gain the outer parens a mustache sequence keeps (#799 is a separate
    // path).
    let out = fmt_at_width("<X bind:value={() => a, (v) => (a = v)} />", 80);
    assert_eq!(
        out.trim_end(),
        "<X bind:value={() => a, (v) => (a = v)} />",
        "short function binding stays inline:\n{out}"
    );
    assert_eq!(fmt_at_width(&out, 80), out, "must be idempotent");
}
