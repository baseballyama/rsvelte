//! Every attribute expression is a template expression, on every host (#3318).
//!
//! `experimental_async` is one `state.expression` assignment upstream and one
//! arm per element visitor here, so the hosts it reaches were an unenumerated
//! product. The issue reports it for `{@attach}` on 6 hosts; the product is
//! seven attribute shapes x twelve hosts, of which **29 cells** compiled before
//! the fix. Every verdict below was measured against the `submodules/svelte`
//! oracle every gate reads (5.56.9, 20b341f10) — including the cells where a
//! host-specific rule fires first, so an over-rejection is as visible as an
//! over-acceptance.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

const HEAD: &str = concat!(
    "<script>\n",
    "\timport Child from './Child.svelte';\n",
    "\tfunction act(node) {}\n",
    "\tlet p = Promise.resolve(act);\n",
    "\tlet flag = true;\n",
    "</script>\n"
);

fn shape(name: &str) -> &'static str {
    match name {
        "use" => "use:act={await p}",
        "transition" => "transition:act={await p}",
        "in" => "in:act={await p}",
        "animate" => "animate:act={await p}",
        "class" => "class:x={await flag}",
        "spread" => "{...(await p)}",
        "attach" => "{@attach await p}",
        other => panic!("unknown shape {other}"),
    }
}

fn host(name: &str, a: &str) -> String {
    match name {
        "regular_element" => format!("<div {a}></div>"),
        "void_element" => format!("<input {a} />"),
        "component" => format!("<Child {a} />"),
        "svelte_self" => format!("<svelte:self {a} />"),
        "svelte_element" => format!("<svelte:element this={{'div'}} {a}></svelte:element>"),
        "svelte_component" => format!("<svelte:component this={{Child}} {a} />"),
        "svelte_body" => format!("<svelte:body {a} />"),
        "svelte_window" => format!("<svelte:window {a} />"),
        "svelte_document" => format!("<svelte:document {a} />"),
        "svelte_head_child" => format!("<svelte:head><div {a}></div></svelte:head>"),
        "svelte_fragment" => {
            format!("<Child><svelte:fragment slot=\"s\" {a}></svelte:fragment></Child>")
        }
        "svelte_boundary" => format!("<svelte:boundary {a}></svelte:boundary>"),
        other => panic!("unknown host {other}"),
    }
}

/// `(shape, host, official's error code)`. No cell is `ACCEPT`: `await` in a
/// template expression always needs the async option, and the hosts that reject
/// an attribute outright do so before the expression is reached.
const GRID: &[(&str, &str, &str)] = &[
    ("use", "regular_element", "experimental_async"),
    ("use", "void_element", "experimental_async"),
    ("use", "component", "component_invalid_directive"),
    ("use", "svelte_self", "svelte_self_invalid_placement"),
    ("use", "svelte_element", "experimental_async"),
    ("use", "svelte_component", "component_invalid_directive"),
    ("use", "svelte_body", "experimental_async"),
    ("use", "svelte_window", "experimental_async"),
    ("use", "svelte_document", "experimental_async"),
    ("use", "svelte_head_child", "experimental_async"),
    (
        "use",
        "svelte_fragment",
        "svelte_fragment_invalid_attribute",
    ),
    (
        "use",
        "svelte_boundary",
        "svelte_boundary_invalid_attribute",
    ),
    ("transition", "regular_element", "experimental_async"),
    ("transition", "void_element", "experimental_async"),
    ("transition", "component", "component_invalid_directive"),
    ("transition", "svelte_self", "svelte_self_invalid_placement"),
    ("transition", "svelte_element", "experimental_async"),
    (
        "transition",
        "svelte_component",
        "component_invalid_directive",
    ),
    ("transition", "svelte_body", "experimental_async"),
    ("transition", "svelte_window", "experimental_async"),
    ("transition", "svelte_document", "experimental_async"),
    ("transition", "svelte_head_child", "experimental_async"),
    (
        "transition",
        "svelte_fragment",
        "svelte_fragment_invalid_attribute",
    ),
    (
        "transition",
        "svelte_boundary",
        "svelte_boundary_invalid_attribute",
    ),
    ("in", "regular_element", "experimental_async"),
    ("in", "void_element", "experimental_async"),
    ("in", "component", "component_invalid_directive"),
    ("in", "svelte_self", "svelte_self_invalid_placement"),
    ("in", "svelte_element", "experimental_async"),
    ("in", "svelte_component", "component_invalid_directive"),
    ("in", "svelte_body", "experimental_async"),
    ("in", "svelte_window", "experimental_async"),
    ("in", "svelte_document", "experimental_async"),
    ("in", "svelte_head_child", "experimental_async"),
    ("in", "svelte_fragment", "svelte_fragment_invalid_attribute"),
    ("in", "svelte_boundary", "svelte_boundary_invalid_attribute"),
    ("animate", "regular_element", "animation_invalid_placement"),
    ("animate", "void_element", "animation_invalid_placement"),
    ("animate", "component", "component_invalid_directive"),
    ("animate", "svelte_self", "svelte_self_invalid_placement"),
    ("animate", "svelte_element", "animation_invalid_placement"),
    ("animate", "svelte_component", "component_invalid_directive"),
    ("animate", "svelte_body", "experimental_async"),
    ("animate", "svelte_window", "experimental_async"),
    ("animate", "svelte_document", "experimental_async"),
    (
        "animate",
        "svelte_head_child",
        "animation_invalid_placement",
    ),
    (
        "animate",
        "svelte_fragment",
        "svelte_fragment_invalid_attribute",
    ),
    (
        "animate",
        "svelte_boundary",
        "svelte_boundary_invalid_attribute",
    ),
    ("class", "regular_element", "experimental_async"),
    ("class", "void_element", "experimental_async"),
    ("class", "component", "component_invalid_directive"),
    ("class", "svelte_self", "svelte_self_invalid_placement"),
    ("class", "svelte_element", "experimental_async"),
    ("class", "svelte_component", "component_invalid_directive"),
    ("class", "svelte_body", "experimental_async"),
    ("class", "svelte_window", "experimental_async"),
    ("class", "svelte_document", "experimental_async"),
    ("class", "svelte_head_child", "experimental_async"),
    (
        "class",
        "svelte_fragment",
        "svelte_fragment_invalid_attribute",
    ),
    (
        "class",
        "svelte_boundary",
        "svelte_boundary_invalid_attribute",
    ),
    ("spread", "regular_element", "experimental_async"),
    ("spread", "void_element", "experimental_async"),
    ("spread", "component", "experimental_async"),
    ("spread", "svelte_self", "svelte_self_invalid_placement"),
    ("spread", "svelte_element", "experimental_async"),
    ("spread", "svelte_component", "experimental_async"),
    ("spread", "svelte_body", "svelte_body_illegal_attribute"),
    ("spread", "svelte_window", "illegal_element_attribute"),
    ("spread", "svelte_document", "illegal_element_attribute"),
    ("spread", "svelte_head_child", "experimental_async"),
    (
        "spread",
        "svelte_fragment",
        "svelte_fragment_invalid_attribute",
    ),
    (
        "spread",
        "svelte_boundary",
        "svelte_boundary_invalid_attribute",
    ),
    ("attach", "regular_element", "experimental_async"),
    ("attach", "void_element", "experimental_async"),
    ("attach", "component", "experimental_async"),
    ("attach", "svelte_self", "svelte_self_invalid_placement"),
    ("attach", "svelte_element", "experimental_async"),
    ("attach", "svelte_component", "experimental_async"),
    ("attach", "svelte_body", "experimental_async"),
    ("attach", "svelte_window", "experimental_async"),
    ("attach", "svelte_document", "experimental_async"),
    ("attach", "svelte_head_child", "experimental_async"),
    (
        "attach",
        "svelte_fragment",
        "svelte_fragment_invalid_attribute",
    ),
    (
        "attach",
        "svelte_boundary",
        "svelte_boundary_invalid_attribute",
    ),
];

#[test]
fn directive_await_matches_official_on_every_host() {
    let mut failures = Vec::new();
    for (shape_name, host_name, want) in GRID {
        let src = format!("{HEAD}{}", host(host_name, shape(shape_name)));
        let got = match compile(
            &src,
            CompileOptions {
                generate: GenerateMode::Client,
                filename: Some("Comp.svelte".into()),
                ..Default::default()
            },
        ) {
            Ok(_) => "ACCEPT".to_string(),
            Err(err) => err.diagnostic().code.unwrap_or_else(|| "<none>".into()),
        };
        if got != *want {
            failures.push(format!("{shape_name}/{host_name}: want {want}, got {got}"));
        }
    }
    assert!(
        failures.is_empty(),
        "{} of {} cells diverge from the official compiler:\n{}",
        failures.len(),
        GRID.len(),
        failures.join("\n")
    );
}
