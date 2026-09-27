//! An inline element that hugs its content and wraps its attributes inside a
//! flow block that follows a mustache or an inline element: the children port lays the parent out
//! onto indented lines, and its gate declined that very output on the next run,
//! leaving the open `>` glued to the last attribute. The two layouts alternated
//! forever (#4725).
//!
//! Every expectation below is the oxfmt(`svelte: true`) oracle's own output for
//! the input above it; the oracle is a fixed point on each of them.

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

fn assert_fmt(src: &str, expected: &str) {
    let out = fmt(src);
    assert_eq!(out, expected, "got:\n{out}");
    let again = fmt(&out);
    assert_eq!(again, out, "not idempotent:\n{again}");
}

#[test]
fn issue_4725_sup_after_mustache_in_if() {
    assert_fmt(
        "<div>{value}{#if unit}<sup class=\"ml-0.75 align-top text-sm font-medium text-gray-500 underline\">{unit}</sup>{/if}</div>\n",
        "<div>\n  {value}{#if unit}<sup\n      class=\"ml-0.75 align-top text-sm font-medium text-gray-500 underline\"\n      >{unit}</sup\n    >{/if}\n</div>\n",
    );
}

#[test]
fn strong_after_mustache_in_if() {
    assert_fmt(
        "<div>{value}{#if unit}<strong class=\"ml-0.75 align-top text-sm font-medium text-gray-500 underline\">{unit}</strong>{/if}</div>\n",
        "<div>\n  {value}{#if unit}<strong\n      class=\"ml-0.75 align-top text-sm font-medium text-gray-500 underline\"\n      >{unit}</strong\n    >{/if}\n</div>\n",
    );
}

#[test]
fn anchor_after_mustache_in_if() {
    assert_fmt(
        "<div>{value}{#if unit}<a href=\"/x\" class=\"ml-0.75 align-top text-sm font-medium text-gray-500 underline\">{unit}</a>{/if}</div>\n",
        "<div>\n  {value}{#if unit}<a\n      href=\"/x\"\n      class=\"ml-0.75 align-top text-sm font-medium text-gray-500 underline\"\n      >{unit}</a\n    >{/if}\n</div>\n",
    );
}

#[test]
fn else_branch_after_mustache() {
    assert_fmt(
        "<div>{value}{#if unit}x{:else}<sup class=\"ml-0.75 align-top text-sm font-medium text-gray-500 underline\">{unit}</sup>{/if}</div>\n",
        "<div>\n  {value}{#if unit}x{:else}<sup\n      class=\"ml-0.75 align-top text-sm font-medium text-gray-500 underline\"\n      >{unit}</sup\n    >{/if}\n</div>\n",
    );
}

#[test]
fn each_body_after_mustache() {
    assert_fmt(
        "<div>{value}{#each units as unit}<sup class=\"ml-0.75 align-top text-sm font-medium text-gray-500 underline\">{unit}</sup>{/each}</div>\n",
        "<div>\n  {value}{#each units as unit}<sup\n      class=\"ml-0.75 align-top text-sm font-medium text-gray-500 underline\"\n      >{unit}</sup\n    >{/each}\n</div>\n",
    );
}

#[test]
fn key_body_after_mustache() {
    assert_fmt(
        "<div>{value}{#key unit}<sup class=\"ml-0.75 align-top text-sm font-medium text-gray-500 underline\">{unit}</sup>{/key}</div>\n",
        "<div>\n  {value}{#key unit}<sup\n      class=\"ml-0.75 align-top text-sm font-medium text-gray-500 underline\"\n      >{unit}</sup\n    >{/key}\n</div>\n",
    );
}

#[test]
fn element_with_mixed_children() {
    assert_fmt(
        "<div>{value}{#if unit}<sup class=\"ml-0.75 align-top text-sm font-medium text-gray-500 underline\">{unit}<b>x</b></sup>{/if}</div>\n",
        "<div>\n  {value}{#if unit}<sup\n      class=\"ml-0.75 align-top text-sm font-medium text-gray-500 underline\"\n      >{unit}<b>x</b></sup\n    >{/if}\n</div>\n",
    );
}

#[test]
fn else_if_branches() {
    assert_fmt(
        "<div>{value}{#if unit}<sup class=\"ml-0.75 align-top text-sm font-medium text-gray-500 underline\">{unit}</sup>{:else if x}<sub class=\"ml-0.75 align-top text-sm font-medium text-gray-500 underline\">{x}</sub>{/if}</div>\n",
        "<div>\n  {value}{#if unit}<sup\n      class=\"ml-0.75 align-top text-sm font-medium text-gray-500 underline\"\n      >{unit}</sup\n    >{:else if x}<sub\n      class=\"ml-0.75 align-top text-sm font-medium text-gray-500 underline\"\n      >{x}</sub\n    >{/if}\n</div>\n",
    );
}

#[test]
fn html_tag_before_block() {
    assert_fmt(
        "<div>{@html value}{#if unit}<sup class=\"ml-0.75 align-top text-sm font-medium text-gray-500 underline\">{unit}</sup>{/if}</div>\n",
        "<div>\n  {@html value}{#if unit}<sup\n      class=\"ml-0.75 align-top text-sm font-medium text-gray-500 underline\"\n      >{unit}</sup\n    >{/if}\n</div>\n",
    );
}

#[test]
fn inline_element_before_block() {
    assert_fmt(
        "<div><b>x</b>{#if unit}<sup class=\"ml-0.75 align-top text-sm font-medium text-gray-500 underline\">{unit}</sup>{/if}</div>\n",
        "<div>\n  <b>x</b>{#if unit}<sup\n      class=\"ml-0.75 align-top text-sm font-medium text-gray-500 underline\"\n      >{unit}</sup\n    >{/if}\n</div>\n",
    );
}

#[test]
fn nested_if_blocks() {
    assert_fmt(
        "<div>{value}{#if a}{#if unit}<sup class=\"ml-0.75 align-top text-sm font-medium text-gray-500 underline\">{unit}</sup>{/if}{/if}</div>\n",
        "<div>\n  {value}{#if a}{#if unit}<sup\n        class=\"ml-0.75 align-top text-sm font-medium text-gray-500 underline\"\n        >{unit}</sup\n      >{/if}{/if}\n</div>\n",
    );
}
