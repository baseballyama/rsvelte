//! An expression tag glued into a run inside an element that hugs
//! (`<span\n  >{…}{…}</span\n>`) shares its printed line with the hug's `>` and
//! the trailing `</tag` — columns its own source position cannot see. Both
//! doc-building paths modelled such a tag as an unbreakable atom, so the run
//! never broke where prettier-plugin-svelte breaks it (#3423, #3565).
//!
//! Every expectation below is the oxfmt(`svelte: true`) oracle's own output for
//! the input above it, not a hand-written guess.

use rsvelte_formatter::{FormatOptions, JsFormatOptions, LineWidth, format};

fn fmt(src: &str) -> String {
    let opts = FormatOptions {
        js: JsFormatOptions {
            line_width: LineWidth::try_from(80u16).expect("valid line width"),
            ..JsFormatOptions::default()
        },
        ..FormatOptions::default()
    };
    format(src, &opts).expect("format ok")
}

/// A formatter that decides a width from the source column instead of the
/// printed one is unstable on its own output, so every case is also a fixed
/// point.
fn assert_fmt(src: &str, expected: &str) {
    let out = fmt(src);
    assert_eq!(out, expected, "got:\n{out}");
    let again = fmt(&out);
    assert_eq!(again, out, "not idempotent:\n{again}");
}

#[test]
fn issue_3423_hugged_span_breaks_the_first_group() {
    assert_fmt(
        "<div>\n\t<span>{someValue['a quoted key here']}{otherValue}{thirdValue}{fourthValue}{fifth}</span>\n</div>\n",
        "<div>\n  <span\n    >{someValue[\n      \"a quoted key here\"\n    ]}{otherValue}{thirdValue}{fourthValue}{fifth}</span\n  >\n</div>\n",
    );
}

#[test]
fn run_of_identifiers_has_nothing_to_break() {
    assert_fmt(
        "<b>{aaaaaaaaaa}{bbbbbbbbbb}{cccccccccc}{dddddddddd}{eeeeeeeeee}{ffffffffff}{gg}</b>\n",
        "<b\n  >{aaaaaaaaaa}{bbbbbbbbbb}{cccccccccc}{dddddddddd}{eeeeeeeeee}{ffffffffff}{gg}</b\n>\n",
    );
}

#[test]
fn run_of_dotted_members_has_nothing_to_break() {
    assert_fmt(
        "<b>{o.aaaaaaaa}{o.bbbbbbbb}{o.cccccccc}{o.dddddddd}{o.eeeeeeee}{o.ffffffff}{o.g}</b>\n",
        "<b\n  >{o.aaaaaaaa}{o.bbbbbbbb}{o.cccccccc}{o.dddddddd}{o.eeeeeeee}{o.ffffffff}{o.g}</b\n>\n",
    );
}

#[test]
fn computed_member_key_breaks_in_a_run() {
    assert_fmt(
        "<b>{o[\"aaaa\"]}{o.bbbbbbbb}{o.cccccccc}{o.dddddddd}{o.eeeeeeee}{o.ffffffff}{o.gg}</b>\n",
        "<b\n  >{o[\n    \"aaaa\"\n  ]}{o.bbbbbbbb}{o.cccccccc}{o.dddddddd}{o.eeeeeeee}{o.ffffffff}{o.gg}</b\n>\n",
    );
}

#[test]
fn call_argument_list_breaks_in_a_run() {
    assert_fmt(
        "<b>{f(1, 2)}{o.bbbbbbbb}{o.cccccccc}{o.dddddddd}{o.eeeeeeee}{o.ffffffff}{o.gggg}</b>\n",
        "<b\n  >{f(\n    1,\n    2,\n  )}{o.bbbbbbbb}{o.cccccccc}{o.dddddddd}{o.eeeeeeee}{o.ffffffff}{o.gggg}</b\n>\n",
    );
}

#[test]
fn host_component() {
    assert_fmt(
        "<Comp>{o[\"aaaa\"]}{o.bbbbbbbb}{o.cccccccc}{o.dddddddd}{o.eeeeeeee}{o.ffffffff}{o.gggggggg}</Comp>\n",
        "<Comp\n  >{o[\n    \"aaaa\"\n  ]}{o.bbbbbbbb}{o.cccccccc}{o.dddddddd}{o.eeeeeeee}{o.ffffffff}{o.gggggggg}</Comp\n>\n",
    );
}

#[test]
fn host_svelte_element() {
    assert_fmt(
        "<svelte:element this={tag}>{o[\"aaaa\"]}{o.bbbbbbbb}{o.cccccccc}{o.dddddddd}{o.eeeeeeee}{o.ffffffff}{o.gggggggg}</svelte:element>\n",
        "<svelte:element this={tag}\n  >{o[\n    \"aaaa\"\n  ]}{o.bbbbbbbb}{o.cccccccc}{o.dddddddd}{o.eeeeeeee}{o.ffffffff}{o.gggggggg}</svelte:element\n>\n",
    );
}

#[test]
fn host_inline_block_button() {
    assert_fmt(
        "<button>{o[\"aaaa\"]}{o.bbbbbbbb}{o.cccccccc}{o.dddddddd}{o.eeeeeeee}{o.ffffffff}{o.gggggggg}</button>\n",
        "<button\n  >{o[\n    \"aaaa\"\n  ]}{o.bbbbbbbb}{o.cccccccc}{o.dddddddd}{o.eeeeeeee}{o.ffffffff}{o.gggggggg}</button\n>\n",
    );
}

#[test]
fn host_nested_inline_element() {
    assert_fmt(
        "<b><i>{o[\"aaaa\"]}{o.bbbbbbbb}{o.cccccccc}{o.dddddddd}{o.eeeeeeee}{o.ffffffff}{o.gggggggg}</i></b>\n",
        "<b\n  ><i\n    >{o[\n      \"aaaa\"\n    ]}{o.bbbbbbbb}{o.cccccccc}{o.dddddddd}{o.eeeeeeee}{o.ffffffff}{o.gggggggg}</i\n  ></b\n>\n",
    );
}

#[test]
fn host_block_element() {
    assert_fmt(
        "<p>{o[\"aaaa\"]}{o.bbbbbbbb}{o.cccccccc}{o.dddddddd}{o.eeeeeeee}{o.ffffffff}{o.gggggggg}</p>\n",
        "<p>\n  {o[\n    \"aaaa\"\n  ]}{o.bbbbbbbb}{o.cccccccc}{o.dddddddd}{o.eeeeeeee}{o.ffffffff}{o.gggggggg}\n</p>\n",
    );
}

#[test]
fn host_if_block() {
    assert_fmt(
        "{#if flag}\n\t<span>{o[\"aaaa\"]}{o.bbbbbbbb}{o.cccccccc}{o.dddddddd}{o.eeeeeeee}{o.ffffffff}{o.gggggggg}</span>\n{/if}\n",
        "{#if flag}\n  <span\n    >{o[\n      \"aaaa\"\n    ]}{o.bbbbbbbb}{o.cccccccc}{o.dddddddd}{o.eeeeeeee}{o.ffffffff}{o.gggggggg}</span\n  >\n{/if}\n",
    );
}

#[test]
fn host_each_block() {
    assert_fmt(
        "{#each list as item}\n\t<span>{o[\"aaaa\"]}{o.bbbbbbbb}{o.cccccccc}{o.dddddddd}{o.eeeeeeee}{o.ffffffff}{o.gggggggg}</span>\n{/each}\n",
        "{#each list as item}\n  <span\n    >{o[\n      \"aaaa\"\n    ]}{o.bbbbbbbb}{o.cccccccc}{o.dddddddd}{o.eeeeeeee}{o.ffffffff}{o.gggggggg}</span\n  >\n{/each}\n",
    );
}

#[test]
fn render_tag_first_in_a_run() {
    assert_fmt(
        "<b>{@render foo(\"aaaa\")}{o.bbbbbbbb}{o.cccccccc}{o.dddddddd}{o.eeeeeeee}{o.ffffffff}{o.gggggggg}</b>\n",
        "<b\n  >{@render foo(\n    \"aaaa\",\n  )}{o.bbbbbbbb}{o.cccccccc}{o.dddddddd}{o.eeeeeeee}{o.ffffffff}{o.gggggggg}</b\n>\n",
    );
}

#[test]
fn html_tag_first_in_a_run() {
    assert_fmt(
        "<b>{@html o[\"aaaa\"]}{o.bbbbbbbb}{o.cccccccc}{o.dddddddd}{o.eeeeeeee}{o.ffffffff}{o.gggggggg}</b>\n",
        "<b\n  >{@html o[\n    \"aaaa\"\n  ]}{o.bbbbbbbb}{o.cccccccc}{o.dddddddd}{o.eeeeeeee}{o.ffffffff}{o.gggggggg}</b\n>\n",
    );
}

#[test]
fn the_group_that_breaks_is_the_one_that_misses_its_fit() {
    assert_fmt(
        "<b>{o[\"aaaaaaaaaaaa\"]}{o.bbbbbbbb}{o.cccccccc}{p[\"ddddddddddddddd\"]}{o.eeeeeeee}{o.ffffffff}{o.gggggggg}</b>\n",
        "<b\n  >{o[\"aaaaaaaaaaaa\"]}{o.bbbbbbbb}{o.cccccccc}{p[\n    \"ddddddddddddddd\"\n  ]}{o.eeeeeeee}{o.ffffffff}{o.gggggggg}</b\n>\n",
    );
}

#[test]
fn threshold_flat_one_column_under() {
    assert_fmt(
        "<div>\n\t<span>{o['kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk']}{otherValue}{thirdValue}</span>\n</div>\n",
        "<div>\n  <span\n    >{o[\"kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk\"]}{otherValue}{thirdValue}</span\n  >\n</div>\n",
    );
}

#[test]
fn threshold_breaks_one_column_over() {
    assert_fmt(
        "<div>\n\t<span>{o['kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk']}{otherValue}{thirdValue}</span>\n</div>\n",
        "<div>\n  <span\n    >{o[\n      \"kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk\"\n    ]}{otherValue}{thirdValue}</span\n  >\n</div>\n",
    );
}

#[test]
fn control_single_tag_flat_one_column_under() {
    assert_fmt(
        "<div>\n\t<span>{o['kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk']}</span>\n</div>\n",
        "<div>\n  <span\n    >{o[\"kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk\"]}</span\n  >\n</div>\n",
    );
}

#[test]
fn control_single_tag_breaks_one_column_over() {
    assert_fmt(
        "<div>\n\t<span>{o['kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk']}</span>\n</div>\n",
        "<div>\n  <span\n    >{o[\n      \"kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk\"\n    ]}</span\n  >\n</div>\n",
    );
}

#[test]
fn control_breakable_tag_last_in_the_run() {
    assert_fmt(
        "<div>\n\t<span>{otherValue}{thirdValue}{o['kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk']}</span>\n</div>\n",
        "<div>\n  <span\n    >{otherValue}{thirdValue}{o[\n      \"kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk\"\n    ]}</span\n  >\n</div>\n",
    );
}

#[test]
fn control_block_host_run_on_its_own_line() {
    assert_fmt(
        "<div>\n\t{o[\"aaaa\"]}{o.bbbbbbbb}{o.cccccccc}{o.dddddddd}{o.eeeeeeee}{o.ffffffff}{o.gggggggg}\n</div>\n",
        "<div>\n  {o[\n    \"aaaa\"\n  ]}{o.bbbbbbbb}{o.cccccccc}{o.dddddddd}{o.eeeeeeee}{o.ffffffff}{o.gggggggg}\n</div>\n",
    );
}

#[test]
fn control_prose_after_the_tag() {
    assert_fmt(
        "<b>{o[\"aaaaaaaaaaaaaaaaaaaa\"]} some words here that go on and on and on and on x</b>\n",
        "<b\n  >{o[\"aaaaaaaaaaaaaaaaaaaa\"]} some words here that go on and on and on and on x</b\n>\n",
    );
}

#[test]
fn control_prose_before_the_tag() {
    assert_fmt(
        "<b>some words here that go on and on and on and on and on {o[\"aaaaaaaaaaaaaaaaaa\"]}</b>\n",
        "<b\n  >some words here that go on and on and on and on and on {o[\n    \"aaaaaaaaaaaaaaaaaa\"\n  ]}</b\n>\n",
    );
}

#[test]
fn control_attribute_value() {
    assert_fmt(
        "<div data-a={o[\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\"]}>x</div>\n",
        "<div\n  data-a={o[\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\"]}\n>\n  x\n</div>\n",
    );
}

#[test]
fn control_run_that_fits() {
    assert_fmt(
        "<span>{o[\"aaaa\"]}{o.bb}{o.cc}</span>\n",
        "<span>{o[\"aaaa\"]}{o.bb}{o.cc}</span>\n",
    );
}

#[test]
fn corpus_carrier_bigint_comparison_run() {
    assert_fmt(
        "<script>\n\tconst fraction = 2n < 2.5;\n\tconst rounded = 2n > 2.5;\n\tconst nullish = 2n > null;\n\tconst undef = 2n < undefined;\n\tconst bigints = 7n <= 7n;\n\tconst numericText = 2n < '3';\n\tconst nonNumericText = 2n < 'x';\n\tconst boolean = 0n < true;\n</script>\n\n<p>{fraction}{rounded}{nullish}{undef}{bigints}{numericText}{nonNumericText}{boolean}</p>\n<p>{2n == 2}{2n === 2}{2n != 2}{2n == '2'}{2n == 'x'}{1n == true}{2n == null}{0 == '0'}</p>\n",
        "<script>\n  const fraction = 2n < 2.5;\n  const rounded = 2n > 2.5;\n  const nullish = 2n > null;\n  const undef = 2n < undefined;\n  const bigints = 7n <= 7n;\n  const numericText = 2n < \"3\";\n  const nonNumericText = 2n < \"x\";\n  const boolean = 0n < true;\n</script>\n\n<p>\n  {fraction}{rounded}{nullish}{undef}{bigints}{numericText}{nonNumericText}{boolean}\n</p>\n<p>\n  {2n == 2}{2n === 2}{2n != 2}{2n == \"2\"}{2n == \"x\"}{1n == true}{2n ==\n    null}{0 == \"0\"}\n</p>\n",
    );
}
