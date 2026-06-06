//! Open-tag normalization: attribute spacing, self-closing form,
//! `this={X}` rendering on `<svelte:component>` / `<svelte:element>`,
//! and shorthand expansion.

use rsvelte_formatter::{FormatOptions, format};

fn fmt(src: &str) -> String {
    format(src, &FormatOptions::default()).expect("format ok")
}

// ─── Whitespace normalization ────────────────────────────────────────────

#[test]
fn collapses_multiple_spaces_between_attributes() {
    let out = fmt("<div  class=\"a\"   id=\"b\">  </div>");
    assert!(
        out.starts_with("<div class=\"a\" id=\"b\">"),
        "expected single-space between attrs:\n{out}"
    );
}

#[test]
fn collapses_attribute_newlines_to_single_space() {
    let out = fmt("<div\n  class=\"a\"\n  id=\"b\"\n></div>");
    assert!(
        out.starts_with("<div class=\"a\" id=\"b\">"),
        "expected attributes on one line:\n{out}"
    );
}

#[test]
fn no_attributes_open_tag_stays_minimal() {
    let out = fmt("<div  ></div>");
    assert!(
        out.starts_with("<div>"),
        "expected `<div>` (trim trailing ws):\n{out}"
    );
}

// ─── Self-closing form ───────────────────────────────────────────────────

#[test]
fn self_closing_normalized_to_space_slash() {
    let out = fmt("<br/>");
    assert!(out.contains("<br />"), "expected `<br />`:\n{out}");
}

#[test]
fn self_closing_with_attributes() {
    let out = fmt("<input  type=\"text\"  value={ foo }/>");
    assert!(
        out.contains("<input type=\"text\" value={foo} />"),
        "expected normalized self-closing input:\n{out}"
    );
}

#[test]
fn closing_tag_not_treated_as_self_closing() {
    let out = fmt("<div  class=\"a\"></div>");
    assert!(out.contains("<div class=\"a\">"), "{out}");
    assert!(!out.contains("/>"), "{out}");
}

// ─── Shorthand ───────────────────────────────────────────────────────────

#[test]
fn attribute_shorthand_collapses() {
    let out = fmt("<div id={id}></div>");
    assert!(out.contains("<div {id}>"), "expected shorthand:\n{out}");
}

#[test]
fn shorthand_attribute_is_preserved_verbatim() {
    // Regression for #679: a `{name}` shorthand's ExpressionTag spans only the
    // identifier (no braces), so the formatter must not strip a byte from each
    // end — `{width}` was being rewritten to `width={idt}` (silent data loss).
    for (src, expect) in [
        ("<div {width}></div>", "<div {width}>"),
        ("<div {height}></div>", "<div {height}>"),
        ("<input {value} />", "<input {value} />"),
        (
            "<div {disabled} {hidden}></div>",
            "<div {disabled} {hidden}>",
        ),
    ] {
        let out = fmt(src);
        assert!(
            out.contains(expect),
            "expected `{expect}` from `{src}`:\n{out}"
        );
    }
}

#[test]
fn single_char_shorthand_attribute_is_preserved() {
    // The 1-char case `{x}` previously sliced to an empty range (`1..0`) and
    // emitted `x={}` (#679).
    let out = fmt("<div {x}></div>");
    assert!(out.contains("<div {x}>"), "expected `<div {{x}}>`:\n{out}");
}

#[test]
fn attribute_no_shorthand_when_names_differ() {
    let out = fmt("<div id={otherId}></div>");
    assert!(
        out.contains("<div id={otherId}>"),
        "expected non-shorthand:\n{out}"
    );
}

#[test]
fn bind_directive_shorthand() {
    let out = fmt("<input bind:value={value}/>");
    assert!(
        out.contains("<input bind:value />"),
        "expected bind shorthand:\n{out}"
    );
}

#[test]
fn class_directive_shorthand() {
    let out = fmt("<div class:active={active}></div>");
    assert!(
        out.contains("<div class:active>"),
        "expected class shorthand:\n{out}"
    );
}

// ─── Spread and tag-form attributes ──────────────────────────────────────

#[test]
fn spread_attribute_renders_in_open_tag() {
    let out = fmt("<div  {...rest}  class=\"x\"></div>");
    assert!(
        out.starts_with("<div {...rest} class=\"x\">"),
        "expected spread in open tag:\n{out}"
    );
}

#[test]
fn attach_attribute_renders_in_open_tag() {
    let out = fmt("<div  {@attach effect}  class=\"x\"></div>");
    assert!(
        out.starts_with("<div {@attach effect} class=\"x\">"),
        "expected @attach attribute in open tag:\n{out}"
    );
}

// ─── Modifiers ───────────────────────────────────────────────────────────

#[test]
fn on_directive_preserves_modifiers() {
    let out = fmt("<button on:click|preventDefault|stopPropagation={fn}></button>");
    assert!(
        out.contains("on:click|preventDefault|stopPropagation={fn}"),
        "expected modifiers preserved:\n{out}"
    );
}

#[test]
fn transition_in_out_keyword() {
    let out = fmt("<div in:fade  out:slide={ {duration: 200} }></div>");
    assert!(out.contains("in:fade"), "{out}");
    assert!(out.contains("out:slide={{ duration: 200 }}"), "{out}");
}

// ─── svelte:component / svelte:element this={X} ─────────────────────────

#[test]
fn svelte_component_this_renders_in_open_tag() {
    let out = fmt("<svelte:component  this={ MyComp }  prop={ value } />");
    assert!(
        out.contains("<svelte:component this={MyComp} prop={value} />"),
        "expected this attr in open tag:\n{out}"
    );
}

#[test]
fn svelte_element_tag_renders_in_open_tag() {
    let out = fmt("<svelte:element  this={ tag }></svelte:element>");
    assert!(
        out.contains("<svelte:element this={tag}>"),
        "expected this attr in open tag:\n{out}"
    );
}

// ─── Component tags ──────────────────────────────────────────────────────

#[test]
fn component_open_tag_normalizes_attrs() {
    let out = fmt("<MyComponent  name=\"x\"  value={ foo+1 } />");
    assert!(
        out.contains("<MyComponent name=\"x\" value={foo + 1} />"),
        "expected component open tag normalized:\n{out}"
    );
}

// ─── Title element ───────────────────────────────────────────────────────

#[test]
fn title_element_normalizes() {
    let out = fmt("<title  >My Page</title>");
    assert!(out.contains("<title>"), "{out}");
}

// ─── Combined ────────────────────────────────────────────────────────────

#[test]
fn end_to_end_realistic_component() {
    let src = "<script>let count=0</script>\n\
               <button  on:click={() =>count++}  class:active={count >0}  disabled={count > 10}>\n\
                 {count}\n\
               </button>";
    let out = fmt(src);
    assert!(out.contains("let count = 0;"), "{out}");
    assert!(
        out.contains(
            "<button on:click={() => count++} class:active={count > 0} disabled={count > 10}>"
        ),
        "expected normalized open tag:\n{out}"
    );
    assert!(out.contains("{count}"), "{out}");
}

// ─── Comments inside the open tag are preserved (#685) ───────────────────

#[test]
fn line_comment_between_attributes_is_preserved() {
    let out = fmt("<div\n  role=\"x\"\n  // important note\n  class=\"y\"\n></div>");
    assert!(
        out.contains("// important note"),
        "line comment inside open tag was dropped:\n{out}"
    );
    assert!(out.contains("role=\"x\""), "{out}");
    assert!(out.contains("class=\"y\""), "{out}");
}

#[test]
fn line_comment_forces_multiline_open_tag() {
    // A `//` comment can't share a line with the closing `>`, so even a
    // short tag must render multi-line when one is present.
    let out = fmt("<div\n  role=\"x\"\n  // note\n  class=\"y\"\n></div>");
    assert!(
        out.lines().any(|l| l.trim_start() == "// note"),
        "expected line comment on its own line:\n{out}"
    );
}

#[test]
fn block_comment_between_attributes_is_preserved() {
    let out = fmt("<div\n  role=\"x\"\n  /* note */\n  class=\"y\"\n></div>");
    assert!(
        out.contains("/* note */"),
        "block comment inside open tag was dropped:\n{out}"
    );
}

// ─── Multi-line attribute values (#692) ──────────────────────────────────

#[test]
fn multiline_attr_expression_reindented_to_attribute_column() {
    // A multi-line arrow handler must force the multi-line tag layout and have
    // its continuation lines aligned under the attribute, not collapsed to
    // column 0 (#692).
    let src = "<div>\n  <div>\n    <button\n      onclick={() => {\n        foo();\n        bar();\n      }}\n    >x</button>\n  </div>\n</div>\n";
    let out = fmt(src);
    let expected = "    <button\n      onclick={() => {\n        foo();\n        bar();\n      }}\n    >x</button>";
    assert!(
        out.contains(expected),
        "multi-line attr not re-indented to nesting level:\n{out}"
    );
}

#[test]
fn multiline_attr_forces_multiline_tag_even_when_short() {
    // The one-liner would "fit" by char count, but a newline in the value means
    // it can't actually be one line — force the multi-line shape.
    let src = "<button onclick={() => {\n  a();\n  b();\n}}>x</button>\n";
    let out = fmt(src);
    // The attribute lands on its own line under `<button`.
    assert!(
        out.contains("<button\n  onclick={() => {"),
        "expected multi-line tag layout:\n{out}"
    );
    // Closing brace of the handler aligns under the attribute (2 spaces), and
    // the body one JS level deeper (4 spaces).
    assert!(out.contains("\n    a();\n"), "body not re-indented:\n{out}");
    assert!(
        out.contains("\n  }}\n"),
        "closing brace not aligned:\n{out}"
    );
}

#[test]
fn multiline_attr_idempotent() {
    let src =
        "<div>\n  <button\n    onclick={() => {\n      foo();\n    }}\n  >x</button>\n</div>\n";
    let once = fmt(src);
    let twice = fmt(&once);
    assert_eq!(once, twice, "re-indentation should be idempotent");
}
