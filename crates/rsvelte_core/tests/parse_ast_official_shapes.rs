//! `parse()` shapes compared field-for-field against the official parser.
//!
//! Every expected value is the official parser's own output on the same source
//! (Svelte 5.57.1). Positions are byte offsets: sources are ASCII except where a
//! test says otherwise and derives the offset from the source.

use rsvelte_core::{ParseOptions, convert_to_legacy, parse};
use serde_json::{Value, json};

fn legacy(src: &str) -> Value {
    let ast = parse(
        src,
        &oxc_allocator::Allocator::default(),
        ParseOptions::default(),
    )
    .expect("parse");
    convert_to_legacy(src, ast)
}

#[test]
fn legacy_empty_await_branches_end_at_the_brace_before_them() {
    let block = legacy("{#await p}{:then}{:catch}{/await}")["html"]["children"][0].clone();
    for key in ["pending", "then", "catch"] {
        assert_eq!(
            (block[key]["start"].clone(), block[key]["end"].clone()),
            (json!(10), json!(10)),
            "{key}"
        );
    }
}
