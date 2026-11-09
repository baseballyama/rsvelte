//! A self-closing element glued between block tags (`{:else if …}<Second … />{:else}`)
//! whose open tag the first run wraps: the closers after it were counted only
//! while the source element sat on one line, so the second run measured the
//! wrapped form without them, judged it to fit and joined it back. The two
//! layouts alternated forever (#4765).
//!
//! Every expectation below is the oxfmt(`svelte: true`) oracle's own output for
//! the input above it; the oracle is a fixed point on each of them.

use rsvelte_formatter::{FormatOptions, JsFormatOptions, LineWidth, format};

fn fmt(src: &str, width: u16) -> String {
    let opts = FormatOptions {
        js: JsFormatOptions {
            line_width: LineWidth::try_from(width).expect("valid line width"),
            ..JsFormatOptions::default()
        },
        ..FormatOptions::default()
    };
    format(src, &opts).expect("format ok")
}

fn assert_fmt(src: &str, width: u16, expected: &str) {
    let out = fmt(src, width);
    assert_eq!(out, expected, "got:\n{out}");
    let again = fmt(&out, width);
    assert_eq!(again, out, "not idempotent:\n{again}");
}

#[test]
fn self_closing_arm_after_a_nested_block() {
    assert_fmt(
        "{#if a}{#if b}<First name={b.owner.name} />{/if}{:else if c && b}<Second viewer={b.view.as} {c} />{:else}<Third />{/if}\n",
        100,
        "{#if a}{#if b}<First name={b.owner.name} />{/if}{:else if c && b}<Second\n    viewer={b.view.as}\n    {c}\n  />{:else}<Third />{/if}\n",
    );
}

#[test]
fn self_closing_arm_before_the_closer() {
    assert_fmt(
        "{#if a}{#if b}<First name={b.owner.name} />{/if}{:else if c && b}<Second viewer={b.view.as} {c} />{/if}\n",
        100,
        "{#if a}{#if b}<First name={b.owner.name} />{/if}{:else if c && b}<Second\n    viewer={b.view.as}\n    {c}\n  />{/if}\n",
    );
}

#[test]
fn self_closing_element_in_an_each_body() {
    assert_fmt(
        "{#each items as item}{#if b}<First name={b.owner.name} />{/if}<Second viewer={b.view.as} {c} />{/each}\n",
        100,
        "{#each items as item}{#if b}<First name={b.owner.name} />{/if}<Second\n    viewer={b.view.as}\n    {c}\n  />{/each}\n",
    );
}

#[test]
fn control_at_width_80() {
    assert_fmt(
        "{#if a}{#if b}<First name={b.owner.name} />{/if}{:else if c && b}<Second viewer={b.view.as} {c} />{:else}<Third />{/if}\n",
        80,
        "{#if a}{#if b}<First name={b.owner.name} />{/if}{:else if c && b}<Second\n    viewer={b.view.as}\n    {c}\n  />{:else}<Third />{/if}\n",
    );
}

#[test]
fn control_that_fits_at_width_120() {
    assert_fmt(
        "{#if a}{#if b}<First name={b.owner.name} />{/if}{:else if c && b}<Second viewer={b.view.as} {c} />{:else}<Third />{/if}\n",
        120,
        "{#if a}{#if b}<First name={b.owner.name} />{/if}{:else if c && b}<Second viewer={b.view.as} {c} />{:else}<Third />{/if}\n",
    );
}

// A void element written without `/>` has no close tag either, and prints as
// `<input … />`, so the first run must count its closers too.
#[test]
fn void_element_without_a_slash_split_in_the_source() {
    assert_fmt(
        "{#if a}<input\n  viewer={b.view.as} {c} data-p=\"ppppppppppppppppppppp\"\n>{/if}{value}\n",
        80,
        "{#if a}<input\n    viewer={b.view.as}\n    {c}\n    data-p=\"ppppppppppppppppppppp\"\n  />{/if}{value}\n",
    );
}

// The closers sit on the close tag's line for an element with a close tag, and
// inside an element the collapse pass lays the parent out; neither may move.

#[test]
fn empty_element_keeps_its_closer_on_the_close_tag_line() {
    let oracle = "{#if a}<span class=\"alpha beta gamma\" title={someLongExpressionName} data-x={another.long.path.xyz}\n  ></span>{/if}\n";
    assert_eq!(fmt(oracle, 100), oracle);
}

#[test]
fn self_closing_element_in_a_block_inside_an_element() {
    assert_fmt(
        "<ul>{#each items as item}<Second\n  onclick={() => handle(item.id, item.name)} disabled={!enabled}\n/>{/each}</ul>\n",
        100,
        "<ul>\n  {#each items as item}<Second\n      onclick={() => handle(item.id, item.name)}\n      disabled={!enabled}\n    />{/each}\n</ul>\n",
    );
}

#[test]
fn split_open_tag_with_a_body_on_its_last_line() {
    assert_fmt(
        "{#key k}<span\n  onclick={() => handle(item.id, item.name)} disabled={!enabled}>x</span>{/key}\n",
        80,
        "{#key k}<span onclick={() => handle(item.id, item.name)} disabled={!enabled}\n    >x</span\n  >{/key}\n",
    );
}
