//! Which directives keep a `|modifier` when formatted.
//!
//! The oracle (`oxfmt --svelte`, i.e. `prettier-plugin-svelte`) prints
//! `node.modifiers` for `on:`, `bind:`, `style:` and `transition:`/`in:`/`out:`
//! and prints `node.name` alone for `use:`, `class:`, `animate:` and `let:` —
//! the four whose accepted modifier list is empty. Verified against
//! `oxfmt -c scripts/fixtures/fmt-corpus.oxfmtrc.json`.
//!
//! This is pinned because it is a consequence of splitting the directive name on
//! `|` (#3221): while the modifier was still part of `name`, these four echoed it
//! back and disagreed with the oracle on a shape no corpus file happens to carry.

use rsvelte_formatter::{FormatOptions, format};

fn fmt(src: &str) -> String {
    format(src, &FormatOptions::default()).expect("format ok")
}

const SRC: &str = "<div use:action|once class:on|once={flag} let:x|foo animate:flip|local style:color|important=\"red\" on:click|once={action}>x</div>";

#[test]
fn a_modifier_is_dropped_where_the_directive_accepts_none() {
    let out = fmt(SRC);
    for gone in ["use:action|", "class:on|", "let:x|", "animate:flip|"] {
        assert!(
            !out.contains(gone),
            "expected `{gone}` to be dropped:\n{out}"
        );
    }
    for kept in ["use:action", "class:on", "let:x", "animate:flip"] {
        assert!(out.contains(kept), "expected `{kept}` to survive:\n{out}");
    }
}

#[test]
fn a_modifier_is_kept_where_the_directive_consumes_it() {
    let out = fmt(SRC);
    for kept in ["style:color|important", "on:click|once"] {
        assert!(out.contains(kept), "expected `{kept}` to survive:\n{out}");
    }
}

#[test]
fn a_transition_modifier_is_kept() {
    let out = fmt("<div transition:fade|global in:fade|local out:fade|local>x</div>");
    for kept in ["transition:fade|global", "in:fade|local", "out:fade|local"] {
        assert!(out.contains(kept), "expected `{kept}` to survive:\n{out}");
    }
}
