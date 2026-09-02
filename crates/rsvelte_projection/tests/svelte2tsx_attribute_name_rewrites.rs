//! `Attribute.ts` folds an attribute name's case and rewrites a number-only
//! value under `element instanceof Element && parent.type === 'Element'` — two
//! conditions, where the `data-` / `--` wrapper needs only the first.
//!
//! Every `<svelte:…>` tag is built as an `Element`, but only `<svelte:element>`
//! carries the node type `Element`. So `<svelte:body|window|document|head|fragment>`
//! take the `data-` wrapper and neither name rewrite, and rsvelte applied both
//! rewrites to all of them.
//!
//! The grid is host × the attribute shapes that separate the rules: a mixed-case
//! name and a number-only value are what the second condition gates, an SVG-cased
//! name / an `on`-prefixed name / a custom-element tag are the three exemptions
//! inside the case fold itself, and the `data-` and `--` rows pin the first
//! condition so a fix to the second cannot quietly move it.
//!
//! Each expectation is the template body of the pinned
//! `submodules/language-tools` svelte2tsx's own output for that source.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn template_body(src: &str) -> String {
    let code = svelte2tsx(
        src,
        Svelte2TsxOptions {
            filename: "T.svelte".to_string(),
            is_ts_file: true,
            ..Default::default()
        },
    )
    .expect("svelte2tsx")
    .code;
    const OPEN: &str = "async () => {\n";
    let start = code.find(OPEN).expect("render body") + OPEN.len();
    let end = code[start..]
        .find("\nreturn { props:")
        .expect("render body end")
        + start;
    code[start..end].to_string()
}

#[test]
fn only_an_element_typed_node_folds_an_attribute_name() {
    let mut failures = Vec::new();
    for (label, src, expected) in [
        (
            "div, mixed-case name",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<div someProp=\"0\" />",
            " { svelteHTML.createElement(\"div\", {  \"someprop\":`0`,});}};",
        ),
        (
            "div, number-only attribute",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<div cols=\"3\" />",
            " { svelteHTML.createElement(\"div\", {  \"cols\":3,});}};",
        ),
        (
            "div, svg-cased name",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<div viewBox=\"0\" />",
            " { svelteHTML.createElement(\"div\", {  \"viewBox\":`0`,});}};",
        ),
        (
            "div, on-prefixed name",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<div onFoo=\"0\" />",
            " { svelteHTML.createElement(\"div\", {  \"onFoo\":`0`,});}};",
        ),
        (
            "div, data- attribute",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<div data-x={b} />",
            " { svelteHTML.createElement(\"div\", {  ...__sveltets_2_empty({\"data-x\":b}),});}};",
        ),
        (
            "div, css custom property",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<div --x=\"1\" />",
            " { svelteHTML.createElement(\"div\", {  \"--x\":`1`,});}};",
        ),
        (
            "custom element, mixed-case name",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<my-el someProp=\"0\" />",
            " { svelteHTML.createElement(\"my-el\", {  \"someProp\":`0`,});}};",
        ),
        (
            "custom element, number-only attribute",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<my-el cols=\"3\" />",
            " { svelteHTML.createElement(\"my-el\", {  \"cols\":3,});}};",
        ),
        (
            "custom element, svg-cased name",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<my-el viewBox=\"0\" />",
            " { svelteHTML.createElement(\"my-el\", {  \"viewBox\":`0`,});}};",
        ),
        (
            "custom element, on-prefixed name",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<my-el onFoo=\"0\" />",
            " { svelteHTML.createElement(\"my-el\", {  \"onFoo\":`0`,});}};",
        ),
        (
            "custom element, data- attribute",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<my-el data-x={b} />",
            " { svelteHTML.createElement(\"my-el\", {  ...__sveltets_2_empty({\"data-x\":b}),});}};",
        ),
        (
            "custom element, css custom property",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<my-el --x=\"1\" />",
            " { svelteHTML.createElement(\"my-el\", {  \"--x\":`1`,});}};",
        ),
        (
            "svg, mixed-case name",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svg someProp=\"0\" />",
            " { svelteHTML.createElement(\"svg\", {  \"someprop\":`0`,});}};",
        ),
        (
            "svg, number-only attribute",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svg cols=\"3\" />",
            " { svelteHTML.createElement(\"svg\", {  \"cols\":3,});}};",
        ),
        (
            "svg, svg-cased name",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svg viewBox=\"0\" />",
            " { svelteHTML.createElement(\"svg\", {  \"viewBox\":`0`,});}};",
        ),
        (
            "svg, on-prefixed name",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svg onFoo=\"0\" />",
            " { svelteHTML.createElement(\"svg\", {  \"onFoo\":`0`,});}};",
        ),
        (
            "svg, data- attribute",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svg data-x={b} />",
            " { svelteHTML.createElement(\"svg\", {  ...__sveltets_2_empty({\"data-x\":b}),});}};",
        ),
        (
            "svg, css custom property",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svg --x=\"1\" />",
            " { svelteHTML.createElement(\"svg\", {  \"--x\":`1`,});}};",
        ),
        (
            "svelte:element, mixed-case name",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:element this={\"div\"} someProp=\"0\" />",
            " { svelteHTML.createElement(\"div\", {    \"someprop\":`0`,});}};",
        ),
        (
            "svelte:element, number-only attribute",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:element this={\"div\"} cols=\"3\" />",
            " { svelteHTML.createElement(\"div\", {    \"cols\":3,});}};",
        ),
        (
            "svelte:element, svg-cased name",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:element this={\"div\"} viewBox=\"0\" />",
            " { svelteHTML.createElement(\"div\", {    \"viewBox\":`0`,});}};",
        ),
        (
            "svelte:element, on-prefixed name",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:element this={\"div\"} onFoo=\"0\" />",
            " { svelteHTML.createElement(\"div\", {    \"onFoo\":`0`,});}};",
        ),
        (
            "svelte:element, data- attribute",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:element this={\"div\"} data-x={b} />",
            " { svelteHTML.createElement(\"div\", {    ...__sveltets_2_empty({\"data-x\":b}),});}};",
        ),
        (
            "svelte:element, css custom property",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:element this={\"div\"} --x=\"1\" />",
            " { svelteHTML.createElement(\"div\", {    \"--x\":`1`,});}};",
        ),
        (
            "svelte:body, mixed-case name",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:body someProp=\"0\" />",
            " { svelteHTML.createElement(\"svelte:body\", {  \"someProp\":`0`,});}};",
        ),
        (
            "svelte:body, number-only attribute",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:body cols=\"3\" />",
            " { svelteHTML.createElement(\"svelte:body\", {  \"cols\":`3`,});}};",
        ),
        (
            "svelte:body, svg-cased name",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:body viewBox=\"0\" />",
            " { svelteHTML.createElement(\"svelte:body\", {  \"viewBox\":`0`,});}};",
        ),
        (
            "svelte:body, on-prefixed name",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:body onFoo=\"0\" />",
            " { svelteHTML.createElement(\"svelte:body\", {  \"onFoo\":`0`,});}};",
        ),
        (
            "svelte:body, data- attribute",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:body data-x={b} />",
            " { svelteHTML.createElement(\"svelte:body\", {  ...__sveltets_2_empty({\"data-x\":b}),});}};",
        ),
        (
            "svelte:body, css custom property",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:body --x=\"1\" />",
            " { svelteHTML.createElement(\"svelte:body\", {  \"--x\":`1`,});}};",
        ),
        (
            "svelte:window, mixed-case name",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:window someProp=\"0\" />",
            " { svelteHTML.createElement(\"svelte:window\", {  \"someProp\":`0`,});}};",
        ),
        (
            "svelte:window, number-only attribute",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:window cols=\"3\" />",
            " { svelteHTML.createElement(\"svelte:window\", {  \"cols\":`3`,});}};",
        ),
        (
            "svelte:window, svg-cased name",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:window viewBox=\"0\" />",
            " { svelteHTML.createElement(\"svelte:window\", {  \"viewBox\":`0`,});}};",
        ),
        (
            "svelte:window, on-prefixed name",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:window onFoo=\"0\" />",
            " { svelteHTML.createElement(\"svelte:window\", {  \"onFoo\":`0`,});}};",
        ),
        (
            "svelte:window, data- attribute",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:window data-x={b} />",
            " { svelteHTML.createElement(\"svelte:window\", {  ...__sveltets_2_empty({\"data-x\":b}),});}};",
        ),
        (
            "svelte:window, css custom property",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:window --x=\"1\" />",
            " { svelteHTML.createElement(\"svelte:window\", {  \"--x\":`1`,});}};",
        ),
        (
            "svelte:document, mixed-case name",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:document someProp=\"0\" />",
            " { svelteHTML.createElement(\"svelte:document\", {  \"someProp\":`0`,});}};",
        ),
        (
            "svelte:document, number-only attribute",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:document cols=\"3\" />",
            " { svelteHTML.createElement(\"svelte:document\", {  \"cols\":`3`,});}};",
        ),
        (
            "svelte:document, svg-cased name",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:document viewBox=\"0\" />",
            " { svelteHTML.createElement(\"svelte:document\", {  \"viewBox\":`0`,});}};",
        ),
        (
            "svelte:document, on-prefixed name",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:document onFoo=\"0\" />",
            " { svelteHTML.createElement(\"svelte:document\", {  \"onFoo\":`0`,});}};",
        ),
        (
            "svelte:document, data- attribute",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:document data-x={b} />",
            " { svelteHTML.createElement(\"svelte:document\", {  ...__sveltets_2_empty({\"data-x\":b}),});}};",
        ),
        (
            "svelte:document, css custom property",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:document --x=\"1\" />",
            " { svelteHTML.createElement(\"svelte:document\", {  \"--x\":`1`,});}};",
        ),
        (
            "svelte:head, mixed-case name",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:head someProp=\"0\" />",
            " { svelteHTML.createElement(\"svelte:head\", {  \"someProp\":`0`,});}};",
        ),
        (
            "svelte:head, number-only attribute",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:head cols=\"3\" />",
            " { svelteHTML.createElement(\"svelte:head\", {  \"cols\":`3`,});}};",
        ),
        (
            "svelte:head, svg-cased name",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:head viewBox=\"0\" />",
            " { svelteHTML.createElement(\"svelte:head\", {  \"viewBox\":`0`,});}};",
        ),
        (
            "svelte:head, on-prefixed name",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:head onFoo=\"0\" />",
            " { svelteHTML.createElement(\"svelte:head\", {  \"onFoo\":`0`,});}};",
        ),
        (
            "svelte:head, data- attribute",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:head data-x={b} />",
            " { svelteHTML.createElement(\"svelte:head\", {  ...__sveltets_2_empty({\"data-x\":b}),});}};",
        ),
        (
            "svelte:head, css custom property",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:head --x=\"1\" />",
            " { svelteHTML.createElement(\"svelte:head\", {  \"--x\":`1`,});}};",
        ),
        (
            "svelte:fragment, mixed-case name",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:fragment someProp=\"0\" />",
            " { svelteHTML.createElement(\"svelte:fragment\", {  \"someProp\":`0`,});}};",
        ),
        (
            "svelte:fragment, number-only attribute",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:fragment cols=\"3\" />",
            " { svelteHTML.createElement(\"svelte:fragment\", {  \"cols\":`3`,});}};",
        ),
        (
            "svelte:fragment, svg-cased name",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:fragment viewBox=\"0\" />",
            " { svelteHTML.createElement(\"svelte:fragment\", {  \"viewBox\":`0`,});}};",
        ),
        (
            "svelte:fragment, on-prefixed name",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:fragment onFoo=\"0\" />",
            " { svelteHTML.createElement(\"svelte:fragment\", {  \"onFoo\":`0`,});}};",
        ),
        (
            "svelte:fragment, data- attribute",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:fragment data-x={b} />",
            " { svelteHTML.createElement(\"svelte:fragment\", {  ...__sveltets_2_empty({\"data-x\":b}),});}};",
        ),
        (
            "svelte:fragment, css custom property",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:fragment --x=\"1\" />",
            " { svelteHTML.createElement(\"svelte:fragment\", {  \"--x\":`1`,});}};",
        ),
        (
            "slot, mixed-case name",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<slot someProp=\"0\" />",
            " { __sveltets_createSlot(\"default\", {  \"someProp\":`0`,});}};",
        ),
        (
            "slot, number-only attribute",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<slot cols=\"3\" />",
            " { __sveltets_createSlot(\"default\", {  \"cols\":`3`,});}};",
        ),
        (
            "slot, svg-cased name",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<slot viewBox=\"0\" />",
            " { __sveltets_createSlot(\"default\", {  \"viewBox\":`0`,});}};",
        ),
        (
            "slot, on-prefixed name",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<slot onFoo=\"0\" />",
            " { __sveltets_createSlot(\"default\", {  \"onFoo\":`0`,});}};",
        ),
        (
            "slot, data- attribute",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<slot data-x={b} />",
            " { __sveltets_createSlot(\"default\", {  ...__sveltets_2_empty({\"data-x\":b}),});}};",
        ),
        (
            "slot, css custom property",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<slot --x=\"1\" />",
            " { __sveltets_createSlot(\"default\", {  \"--x\":`1`,});}};",
        ),
        (
            "component, mixed-case name",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<C someProp=\"0\" />",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); new $$_C0C({ target: __sveltets_2_any(), props: {  \"someProp\":`0`,}});}};",
        ),
        (
            "component, number-only attribute",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<C cols=\"3\" />",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); new $$_C0C({ target: __sveltets_2_any(), props: {  \"cols\":`3`,}});}};",
        ),
        (
            "component, svg-cased name",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<C viewBox=\"0\" />",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); new $$_C0C({ target: __sveltets_2_any(), props: {  \"viewBox\":`0`,}});}};",
        ),
        (
            "component, on-prefixed name",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<C onFoo=\"0\" />",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); new $$_C0C({ target: __sveltets_2_any(), props: {  \"onFoo\":`0`,}});}};",
        ),
        (
            "component, data- attribute",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<C data-x={b} />",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); new $$_C0C({ target: __sveltets_2_any(), props: {  \"data-x\":b,}});}};",
        ),
        (
            "component, css custom property",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<C --x=\"1\" />",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); new $$_C0C({ target: __sveltets_2_any(), props: {  ...__sveltets_2_cssProp({\"--x\":`1`}),}});}};",
        ),
    ] {
        let actual = template_body(src);
        if actual != expected {
            failures.push(format!(
                "{label}\n  expected {expected:?}\n  actual   {actual:?}"
            ));
        }
    }
    assert!(
        failures.is_empty(),
        "{} of 66 cells diverge from official:\n{}",
        failures.len(),
        failures.join("\n")
    );
}
