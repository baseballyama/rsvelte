//! Which `{#await}` clauses survive formatting.
//!
//! prettier-plugin-svelte decides the whole shape from three booleans — whether
//! the pending / then / catch fragments hold anything that is not blank text —
//! and prints only the clauses those booleans keep. Every case below was
//! measured against the oxfmt(`svelte: true`) oracle.

use rsvelte_formatter::{FormatOptions, format};

fn fmt(src: &str) -> String {
    let out = format(src, &FormatOptions::default()).expect("format ok");
    out.strip_suffix('\n').map(str::to_string).unwrap_or(out)
}

#[test]
fn empty_bare_then_clause_is_dropped() {
    assert_eq!(fmt("{#await p}{:then}{/await}"), "{#await p}{/await}");
}

#[test]
fn empty_then_clause_with_binding_is_dropped() {
    assert_eq!(fmt("{#await p}{:then v}{/await}"), "{#await p}{/await}");
}

#[test]
fn empty_then_clause_after_a_pending_body_is_dropped() {
    assert_eq!(
        fmt("{#await p}\n\t<p>pending</p>\n{:then}\n{/await}"),
        "{#await p}\n  <p>pending</p>\n{/await}"
    );
}

#[test]
fn empty_then_clause_is_dropped_even_when_a_catch_survives() {
    assert_eq!(
        fmt("{#await p}\n\t<p>pending</p>\n{:then v}\n{:catch e}\n\t<p>err</p>\n{/await}"),
        "{#await p}\n  <p>pending</p>\n{:catch e}\n  <p>err</p>\n{/await}"
    );
}

#[test]
fn empty_pending_and_then_collapse_into_the_catch_header() {
    assert_eq!(
        fmt("{#await p}\n{:then v}\n{:catch e}\n\t<p>err</p>\n{/await}"),
        "{#await p catch e}\n  <p>err</p>\n{/await}"
    );
}

#[test]
fn empty_pending_collapses_a_bare_then_into_the_header() {
    assert_eq!(
        fmt("{#await p}\n{:then}\n\t<p>ok</p>\n{/await}"),
        "{#await p then}\n  <p>ok</p>\n{/await}"
    );
}

#[test]
fn empty_catch_body_drops_the_catch_clause() {
    assert_eq!(
        fmt("{#await p}\n\t<p>pending</p>\n{:then v}\n\t<p>ok</p>\n{:catch e}\n{/await}"),
        "{#await p}\n  <p>pending</p>\n{:then v}\n  <p>ok</p>\n{/await}"
    );
}

#[test]
fn shorthand_headers_with_empty_bodies_lose_their_clause() {
    assert_eq!(fmt("{#await p then v}{/await}"), "{#await p}{/await}");
    assert_eq!(fmt("{#await p catch e}{/await}"), "{#await p}{/await}");
    assert_eq!(fmt("{#await p}{:catch e}{/await}"), "{#await p}{/await}");
}

#[test]
fn every_clause_survives_when_every_body_has_content() {
    let src =
        "{#await p}\n  <p>pending</p>\n{:then v}\n  <p>ok</p>\n{:catch e}\n  <p>err</p>\n{/await}";
    assert_eq!(fmt(src), src);
}

#[test]
fn a_comment_counts_as_content() {
    let src = "{#await p}\n  <!-- c -->\n{:then v}\n{/await}";
    assert_eq!(fmt(src), "{#await p}\n  <!-- c -->\n{/await}");
    let src = "{#await p}\n{:then v}\n  <!-- c -->\n{/await}";
    assert_eq!(fmt(src), "{#await p then v}\n  <!-- c -->\n{/await}");
}
