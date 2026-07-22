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
fn inline_else_prefix_is_not_reused_as_indentation() {
    let src = r#"{#if found}<div>Found</div>{:else}<section class="mx-auto max-w-3xl px-4 py-20 text-center"><h1 class="text-3xl font-bold">Stage not found</h1></section>{/if}"#;
    let out = fmt_at_width(src, 80);

    rsvelte_core::parse(&out, rsvelte_core::ParseOptions::default())
        .expect("formatted output should remain valid Svelte");
    assert_eq!(fmt_at_width(&out, 80), out, "formatting must be idempotent");
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

// ─── #971: value wrap budget subtracts the value's rendered `{` column ───
//
// The attribute/directive value's wrap budget must account for the actual
// column its leading `{` lands at (indent + `name=` + `{`) and the trailing
// `}`, not just the nesting indent. Otherwise a value up to ~len(name) wide
// over printWidth wrongly stays inline and emits a line that exceeds the
// width. Each case below is asserted byte-for-byte against oxfmt(svelte:true).

/// Assert no rendered line exceeds the print width (visual / East-Asian).
fn assert_no_line_exceeds(out: &str, width: usize) {
    for (i, line) in out.lines().enumerate() {
        let w = unicode_width::UnicodeWidthStr::width(line);
        assert!(
            w <= width,
            "line {} is {} cols > printWidth {}:\n{:?}\nfull:\n{}",
            i + 1,
            w,
            width,
            line,
            out
        );
    }
}

#[test]
fn attribute_value_wraps_by_rendered_brace_column() {
    // The DefinitionListItem repro from #971: at printWidth 100 the value
    // (`description={…}`, 81-col expr) fits the indent-only budget (92) but its
    // true rendered line is 103 cols, so oxfmt breaks the ternary. rsvelte must
    // match byte-for-byte and emit no line > 100.
    let src = "<div>\n  <div>\n    <div>\n      <DefinitionListItem\n        term=\"最終ログイン\"\n        description={user.lastAccessedAt ? formatDateInOrganizationTimezone(user.lastAccessedAt) : '-'}\n      />\n    </div>\n  </div>\n</div>\n";
    let out = fmt_at_width(src, 100);
    let expected = "<div>\n  <div>\n    <div>\n      <DefinitionListItem\n        term=\"最終ログイン\"\n        description={user.lastAccessedAt\n          ? formatDateInOrganizationTimezone(user.lastAccessedAt)\n          : \"-\"}\n      />\n    </div>\n  </div>\n</div>";
    assert_eq!(out, expected, "value ternary must break (#971):\n{out}");
    assert_no_line_exceeds(&out, 100);
    assert_eq!(fmt_at_width(&out, 100), out, "must be idempotent");
}

#[test]
fn content_mustache_wraps_by_rendered_column() {
    // A content mustache shifted right by leading text must break at its own
    // top-level operator so no line exceeds the width (#971 sibling case).
    let src = "<div>some text content here {user.lastAccessedAt ? formatDateInOrganizationTimezone(user.lastAccessedAt) : '-'}</div>\n";
    let out = fmt_at_width(src, 100);
    let expected = "<div>\n  some text content here {user.lastAccessedAt\n    ? formatDateInOrganizationTimezone(user.lastAccessedAt)\n    : \"-\"}\n</div>";
    assert_eq!(out, expected, "content mustache must break (#971):\n{out}");
    assert_no_line_exceeds(&out, 100);
}

#[test]
fn directive_value_stays_inline_when_it_fits() {
    // class:/style: directive values that fit (98/97 cols at indent 2) must
    // stay inline, matching oxfmt — the prefix narrowing must not over-wrap.
    let class_src = "<div class:active={user.lastAccessedAt ? formatDateInOrganizationTimezone(user.lastAccessedAt) : '-'}></div>\n";
    let class_out = fmt_at_width(class_src, 100);
    let class_expected = "<div\n  class:active={user.lastAccessedAt ? formatDateInOrganizationTimezone(user.lastAccessedAt) : \"-\"}\n></div>";
    assert_eq!(class_out, class_expected, "class directive:\n{class_out}");
    assert_no_line_exceeds(&class_out, 100);

    let style_src = "<div style:width={user.lastAccessedAt ? formatDateInOrganizationTimezone(user.lastAccessedAt) : '-'}></div>\n";
    let style_out = fmt_at_width(style_src, 100);
    let style_expected = "<div\n  style:width={user.lastAccessedAt ? formatDateInOrganizationTimezone(user.lastAccessedAt) : \"-\"}\n></div>";
    assert_eq!(style_out, style_expected, "style directive:\n{style_out}");
    assert_no_line_exceeds(&style_out, 100);
}

#[test]
fn on_directive_arrow_handler_breaks_by_prefix() {
    // An arrow handler whose body overflows the value line must break after the
    // `=>` and land its body one indent in, matching oxfmt (#971 sibling case).
    let src = "<button on:click={() => doSomethingQuiteLong(withAnArgument, andAnother, andYetAnotherOne)}>x</button>\n";
    let out = fmt_at_width(src, 80);
    let expected = "<button\n  on:click={() =>\n    doSomethingQuiteLong(withAnArgument, andAnother, andYetAnotherOne)}\n  >x</button\n>";
    assert_eq!(out, expected, "on:click arrow must break (#971):\n{out}");
    assert_no_line_exceeds(&out, 80);
}

#[test]
fn quoted_string_embedded_expr_breaks_by_rendered_column() {
    // An expression embedded in a quoted attribute string must break its call
    // args when the rendered line overflows, matching oxfmt (#971 sibling).
    let src = "<div style=\"width: {computeWidthBasedOnSomeVeryLongComputationFunctionCallHere(a, b)}px;\"></div>\n";
    let out = fmt_at_width(src, 80);
    let expected = "<div\n  style=\"width: {computeWidthBasedOnSomeVeryLongComputationFunctionCallHere(\n    a,\n    b,\n  )}px;\"\n></div>";
    assert_eq!(
        out, expected,
        "quoted embedded expr must break (#971):\n{out}"
    );
    assert_no_line_exceeds(&out, 80);
}

#[test]
fn overflowing_single_line_prose_in_component_body_wraps() {
    // A single-line pure-text run that overflows must still fill-wrap, even
    // though it sits on one source line. Inside a Component body with a block
    // child (`<div slot="title">`), the element-level mixed fill bails on the
    // block child and the text reaches `try_fill_run` as a lone single-line
    // text run — which must reflow it (matching prettier / oxfmt). This is the
    // sveltestrap `<Popover>` prose shape.
    let src = "<Popover>\n  <div slot=\"title\">Title</div>\n  You can click inside this Popover and it will not dismiss. Dismissal will only occur if outside.\n</Popover>\n";
    let out = fmt_at_width(src, 80);
    // The first wrapped line reaches 86 cols: prettier's fill keeps the
    // boundary-crossing word ("occur") on the line (last-word overflow
    // tolerance), so `assert_no_line_exceeds` does not apply — the oracle
    // overflows here too.
    let expected = "<Popover>\n  <div slot=\"title\">Title</div>\n  You can click inside this Popover and it will not dismiss. Dismissal will only occur\n  if outside.\n</Popover>";
    assert_eq!(out, expected, "single-line prose must wrap:\n{out}");
}

#[test]
fn prose_after_broken_inline_element_stays_word_first() {
    // Multi-pass artifact: an earlier collapse pass hug-breaks the inline
    // `<code>` (its close tag dangles), which pushes the following text onto a
    // fresh line. The final children-port pass re-parses that intermediate and
    // must NOT read the artifact newline as a source break — the source had a
    // SPACE after `</code>`, so the fill stays word-first and wraps "follow"
    // onto its own line (matching prettier / oxfmt), rather than the inverted
    // (last-word-overflow-tolerant) fill that keeps "follow" on the long line.
    let src = "<ul>\n  <li>\n    Svelte UX 1.0.0 requires Tailwind 3. For new projects, Svelte CLI <code>sv</code> installs\n    Tailwind 4 which can not be used. Instead you will need to follow the\n    <a href=\"https://v3.tailwindcss.com/docs/guides/sveltekit\" target=\"_blank\">official guide</a>\n    to setup your project.\n  </li>\n</ul>\n";
    let out = fmt_at_width(src, 80);
    let expected = "<ul>\n  <li>\n    Svelte UX 1.0.0 requires Tailwind 3. For new projects, Svelte CLI <code\n      >sv</code\n    >\n    installs Tailwind 4 which can not be used. Instead you will need to follow\n    the\n    <a href=\"https://v3.tailwindcss.com/docs/guides/sveltekit\" target=\"_blank\"\n      >official guide</a\n    >\n    to setup your project.\n  </li>\n</ul>";
    assert_eq!(
        out, expected,
        "prose after broken inline must stay word-first:\n{out}"
    );
}
