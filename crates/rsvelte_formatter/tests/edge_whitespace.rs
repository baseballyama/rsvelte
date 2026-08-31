use rsvelte_formatter::{FormatOptions, format};

/// Whether an element's edge whitespace is significant depends on the PARENT
/// alone — measured against the oracle over 45 parent tags. `trims_edge` already
/// encodes that split, but `try_collapse` bails before reading it as soon as any
/// child is an element, so only a pure-text body was ever trimmed.
fn fmt(source: &str) -> String {
    format(source, &FormatOptions::default()).expect("format ok")
}

#[test]
fn a_component_drops_the_edge_whitespace_around_an_element_child() {
    assert_eq!(
        fmt("<A value=\"t\"> <div>c</div> </A>\n"),
        "<A value=\"t\"><div>c</div></A>\n",
    );
}

#[test]
fn a_slot_drops_it_too() {
    assert_eq!(
        fmt("<slot name=\"x\"> <div>c</div> </slot>\n"),
        "<slot name=\"x\"><div>c</div></slot>\n",
    );
}

#[test]
fn a_block_element_drops_it_around_a_block_child() {
    assert_eq!(
        fmt("<div class=\"a\"> <div>c</div> </div>\n"),
        "<div class=\"a\"><div>c</div></div>\n",
    );
}

#[test]
fn a_dynamic_element_drops_it() {
    assert_eq!(
        fmt("<svelte:element this={tag}> <div>c</div> </svelte:element>\n"),
        "<svelte:element this={tag}><div>c</div></svelte:element>\n",
    );
}

/// Controls. An inline parent keeps the whitespace (it is significant there), a
/// `<pre>` keeps everything, and an edge run holding a newline is the element's
/// line structure rather than a gap — each of these is a shape the trim must not
/// touch, and each fails on its own if the condition is widened.
#[test]
fn an_inline_parent_keeps_it() {
    for src in [
        "<span class=\"a\"> <div>c</div> </span>\n",
        "<a href=\"x\"> <span>c</span> </a>\n",
        "<b class=\"a\"> <span>c</span> </b>\n",
    ] {
        assert_eq!(fmt(src), src, "inline parent must keep its edge whitespace");
    }
}

#[test]
fn an_edge_run_holding_a_newline_is_left_alone() {
    let src = "<A value=\"t\">\n  <div>c</div>\n</A>\n";
    assert_eq!(fmt(src), src);
}

#[test]
fn a_pre_keeps_everything() {
    let src = "<pre> <div>c</div> </pre>\n";
    assert_eq!(fmt(src), src);
}

/// Two element children: the gap between them carries the element's line
/// structure, so the trim declines and the edge whitespace survives. The oracle
/// breaks this shape onto four lines instead — a separate, still-open
/// divergence; what this pins is only that the trim did not fire here.
#[test]
fn two_element_children_are_out_of_scope() {
    assert_eq!(
        fmt("<A value=\"t\"> <div>c</div><div>d</div> </A>\n"),
        "<A value=\"t\"> <div>c</div>\n  <div>d</div> </A>\n",
    );
}

/// Every remaining `svelte:*` parent. Measured one tag at a time against the
/// oracle: all seven trim there and none of them trimmed here, because the
/// node types carry `SvelteElement` and the target match listed only
/// `<svelte:element>` and `<svelte:component>`. `<svelte:options>` is absent
/// because both compilers reject content in it.
#[test]
fn every_svelte_special_element_drops_it() {
    for (open, close) in [
        ("<svelte:fragment slot=\"a\">", "</svelte:fragment>"),
        ("<svelte:head>", "</svelte:head>"),
        ("<svelte:boundary>", "</svelte:boundary>"),
        ("<svelte:body>", "</svelte:body>"),
        ("<svelte:window>", "</svelte:window>"),
        ("<svelte:document>", "</svelte:document>"),
        ("<svelte:self>", "</svelte:self>"),
    ] {
        assert_eq!(
            fmt(&format!("{open} <b>c</b> {close}\n")),
            format!("{open}<b>c</b>{close}\n"),
            "{open} must drop its edge whitespace",
        );
    }
}
