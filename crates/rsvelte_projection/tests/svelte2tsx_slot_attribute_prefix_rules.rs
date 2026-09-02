//! `Attribute.ts` asks two different questions about an attribute's host, and
//! rsvelte answered both with one flag. `element instanceof Element` picks the
//! `data-` workaround (`...__sveltets_2_empty({…})`) over the component-only
//! `--` one (`__sveltets_2_cssProp`); the case and number rewrites need
//! `parent.type === 'Element'` as well.
//!
//! A `<slot>` is the one host where the two answers differ: `index.ts` builds it
//! as an `Element` whose node type is `Slot`. So it takes the `data-` wrapper and
//! not the `--` one, and neither rewrite — and rsvelte had the two wrappers
//! exactly the wrong way round while agreeing on the rewrites.
//!
//! The grid is host × attribute-name prefix so the two questions are separable:
//! an element and a component pin the rows where the answers agree, and a
//! collapse of either question back onto one flag moves a cell.
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
fn a_slot_takes_the_element_prefix_rule_and_not_the_component_one() {
    let mut failures = Vec::new();
    for (label, src, expected) in [
        (
            "slot, data- expression",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<slot data-x={b} />",
            " { __sveltets_createSlot(\"default\", {  ...__sveltets_2_empty({\"data-x\":b}),});}};",
        ),
        (
            "slot, data- literal",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<slot data-x=\"y\" />",
            " { __sveltets_createSlot(\"default\", {  ...__sveltets_2_empty({\"data-x\":`y`}),});}};",
        ),
        (
            "slot, data- valueless",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<slot data-x />",
            "  { __sveltets_createSlot(\"default\", {...__sveltets_2_empty({\"data-x\":true}),});}};",
        ),
        (
            "slot, data-sveltekit- expression",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<slot data-sveltekit-preload-data={b} />",
            " { __sveltets_createSlot(\"default\", {  \"data-sveltekit-preload-data\":b,});}};",
        ),
        (
            "slot, -- literal",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<slot --x=\"1\" />",
            " { __sveltets_createSlot(\"default\", {  \"--x\":`1`,});}};",
        ),
        (
            "slot, -- expression",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<slot --x={b} />",
            " { __sveltets_createSlot(\"default\", {  \"--x\":b,});}};",
        ),
        (
            "slot, -- valueless",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<slot --x />",
            "  { __sveltets_createSlot(\"default\", {\"--x\":true,});}};",
        ),
        (
            "slot, number-only attribute",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<slot cols=\"3\" />",
            " { __sveltets_createSlot(\"default\", {  \"cols\":`3`,});}};",
        ),
        (
            "slot, mixed-case attribute",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<slot someProp=\"0\" />",
            " { __sveltets_createSlot(\"default\", {  \"someProp\":`0`,});}};",
        ),
        (
            "slot, plain expression",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<slot x={b} />",
            " { __sveltets_createSlot(\"default\", {  \"x\":b,});}};",
        ),
        (
            "element, data- expression",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<div data-x={b} />",
            " { svelteHTML.createElement(\"div\", {  ...__sveltets_2_empty({\"data-x\":b}),});}};",
        ),
        (
            "element, data- literal",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<div data-x=\"y\" />",
            " { svelteHTML.createElement(\"div\", {  ...__sveltets_2_empty({\"data-x\":`y`}),});}};",
        ),
        (
            "element, data- valueless",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<div data-x />",
            "  { svelteHTML.createElement(\"div\", {...__sveltets_2_empty({\"data-x\":true}),});}};",
        ),
        (
            "element, data-sveltekit- expression",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<div data-sveltekit-preload-data={b} />",
            " { svelteHTML.createElement(\"div\", {  \"data-sveltekit-preload-data\":b,});}};",
        ),
        (
            "element, -- literal",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<div --x=\"1\" />",
            " { svelteHTML.createElement(\"div\", {  \"--x\":`1`,});}};",
        ),
        (
            "element, -- expression",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<div --x={b} />",
            " { svelteHTML.createElement(\"div\", {  \"--x\":b,});}};",
        ),
        (
            "element, -- valueless",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<div --x />",
            "  { svelteHTML.createElement(\"div\", {\"--x\":true,});}};",
        ),
        (
            "element, number-only attribute",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<div cols=\"3\" />",
            " { svelteHTML.createElement(\"div\", {  \"cols\":3,});}};",
        ),
        (
            "element, mixed-case attribute",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<div someProp=\"0\" />",
            " { svelteHTML.createElement(\"div\", {  \"someprop\":`0`,});}};",
        ),
        (
            "element, plain expression",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<div x={b} />",
            " { svelteHTML.createElement(\"div\", {  \"x\":b,});}};",
        ),
        (
            "component, data- expression",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<C data-x={b} />",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); new $$_C0C({ target: __sveltets_2_any(), props: {  \"data-x\":b,}});}};",
        ),
        (
            "component, data- literal",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<C data-x=\"y\" />",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); new $$_C0C({ target: __sveltets_2_any(), props: {  \"data-x\":`y`,}});}};",
        ),
        (
            "component, data- valueless",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<C data-x />",
            "  { const $$_C0C = __sveltets_2_ensureComponent(C); new $$_C0C({ target: __sveltets_2_any(), props: {\"data-x\":true,}});}};",
        ),
        (
            "component, data-sveltekit- expression",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<C data-sveltekit-preload-data={b} />",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); new $$_C0C({ target: __sveltets_2_any(), props: {  \"data-sveltekit-preload-data\":b,}});}};",
        ),
        (
            "component, -- literal",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<C --x=\"1\" />",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); new $$_C0C({ target: __sveltets_2_any(), props: {  ...__sveltets_2_cssProp({\"--x\":`1`}),}});}};",
        ),
        (
            "component, -- expression",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<C --x={b} />",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); new $$_C0C({ target: __sveltets_2_any(), props: {  ...__sveltets_2_cssProp({\"--x\":b}),}});}};",
        ),
        (
            "component, -- valueless",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<C --x />",
            "  { const $$_C0C = __sveltets_2_ensureComponent(C); new $$_C0C({ target: __sveltets_2_any(), props: {...__sveltets_2_cssProp({\"--x\":true}),}});}};",
        ),
        (
            "component, number-only attribute",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<C cols=\"3\" />",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); new $$_C0C({ target: __sveltets_2_any(), props: {  \"cols\":`3`,}});}};",
        ),
        (
            "component, mixed-case attribute",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<C someProp=\"0\" />",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); new $$_C0C({ target: __sveltets_2_any(), props: {  \"someProp\":`0`,}});}};",
        ),
        (
            "component, plain expression",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<C x={b} />",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); new $$_C0C({ target: __sveltets_2_any(), props: {  \"x\":b,}});}};",
        ),
        (
            "svelte:component, data- expression",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:component this={C} data-x={b} />",
            " { const $$_tnenopmoc_etlevs0C = __sveltets_2_ensureComponent(C); new $$_tnenopmoc_etlevs0C({ target: __sveltets_2_any(), props: {    \"data-x\":b,}});}};",
        ),
        (
            "svelte:component, data- literal",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:component this={C} data-x=\"y\" />",
            " { const $$_tnenopmoc_etlevs0C = __sveltets_2_ensureComponent(C); new $$_tnenopmoc_etlevs0C({ target: __sveltets_2_any(), props: {    \"data-x\":`y`,}});}};",
        ),
        (
            "svelte:component, data- valueless",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:component this={C} data-x />",
            "  { const $$_tnenopmoc_etlevs0C = __sveltets_2_ensureComponent(C); new $$_tnenopmoc_etlevs0C({ target: __sveltets_2_any(), props: {  \"data-x\":true,}});}};",
        ),
        (
            "svelte:component, data-sveltekit- expression",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:component this={C} data-sveltekit-preload-data={b} />",
            " { const $$_tnenopmoc_etlevs0C = __sveltets_2_ensureComponent(C); new $$_tnenopmoc_etlevs0C({ target: __sveltets_2_any(), props: {    \"data-sveltekit-preload-data\":b,}});}};",
        ),
        (
            "svelte:component, -- literal",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:component this={C} --x=\"1\" />",
            " { const $$_tnenopmoc_etlevs0C = __sveltets_2_ensureComponent(C); new $$_tnenopmoc_etlevs0C({ target: __sveltets_2_any(), props: {    ...__sveltets_2_cssProp({\"--x\":`1`}),}});}};",
        ),
        (
            "svelte:component, -- expression",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:component this={C} --x={b} />",
            " { const $$_tnenopmoc_etlevs0C = __sveltets_2_ensureComponent(C); new $$_tnenopmoc_etlevs0C({ target: __sveltets_2_any(), props: {    ...__sveltets_2_cssProp({\"--x\":b}),}});}};",
        ),
        (
            "svelte:component, -- valueless",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:component this={C} --x />",
            "  { const $$_tnenopmoc_etlevs0C = __sveltets_2_ensureComponent(C); new $$_tnenopmoc_etlevs0C({ target: __sveltets_2_any(), props: {  ...__sveltets_2_cssProp({\"--x\":true}),}});}};",
        ),
        (
            "svelte:component, number-only attribute",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:component this={C} cols=\"3\" />",
            " { const $$_tnenopmoc_etlevs0C = __sveltets_2_ensureComponent(C); new $$_tnenopmoc_etlevs0C({ target: __sveltets_2_any(), props: {    \"cols\":`3`,}});}};",
        ),
        (
            "svelte:component, mixed-case attribute",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:component this={C} someProp=\"0\" />",
            " { const $$_tnenopmoc_etlevs0C = __sveltets_2_ensureComponent(C); new $$_tnenopmoc_etlevs0C({ target: __sveltets_2_any(), props: {    \"someProp\":`0`,}});}};",
        ),
        (
            "svelte:component, plain expression",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:component this={C} x={b} />",
            " { const $$_tnenopmoc_etlevs0C = __sveltets_2_ensureComponent(C); new $$_tnenopmoc_etlevs0C({ target: __sveltets_2_any(), props: {    \"x\":b,}});}};",
        ),
        (
            "svelte:self, data- expression",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:self data-x={b} />",
            " { __sveltets_2_createComponentAny({  \"data-x\":b,});}};",
        ),
        (
            "svelte:self, data- literal",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:self data-x=\"y\" />",
            " { __sveltets_2_createComponentAny({  \"data-x\":`y`,});}};",
        ),
        (
            "svelte:self, data- valueless",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:self data-x />",
            "  { __sveltets_2_createComponentAny({\"data-x\":true,});}};",
        ),
        (
            "svelte:self, data-sveltekit- expression",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:self data-sveltekit-preload-data={b} />",
            " { __sveltets_2_createComponentAny({  \"data-sveltekit-preload-data\":b,});}};",
        ),
        (
            "svelte:self, -- literal",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:self --x=\"1\" />",
            " { __sveltets_2_createComponentAny({  ...__sveltets_2_cssProp({\"--x\":`1`}),});}};",
        ),
        (
            "svelte:self, -- expression",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:self --x={b} />",
            " { __sveltets_2_createComponentAny({  ...__sveltets_2_cssProp({\"--x\":b}),});}};",
        ),
        (
            "svelte:self, -- valueless",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:self --x />",
            "  { __sveltets_2_createComponentAny({...__sveltets_2_cssProp({\"--x\":true}),});}};",
        ),
        (
            "svelte:self, number-only attribute",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:self cols=\"3\" />",
            " { __sveltets_2_createComponentAny({  \"cols\":`3`,});}};",
        ),
        (
            "svelte:self, mixed-case attribute",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:self someProp=\"0\" />",
            " { __sveltets_2_createComponentAny({  \"someProp\":`0`,});}};",
        ),
        (
            "svelte:self, plain expression",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<svelte:self x={b} />",
            " { __sveltets_2_createComponentAny({  \"x\":b,});}};",
        ),
        (
            "named-slot element, data- expression",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<C><div slot=\"s\" data-x={b} /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"div\", {    ...__sveltets_2_empty({\"data-x\":b}),});}} C}};",
        ),
        (
            "named-slot element, data- literal",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<C><div slot=\"s\" data-x=\"y\" /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"div\", {    ...__sveltets_2_empty({\"data-x\":`y`}),});}} C}};",
        ),
        (
            "named-slot element, data- valueless",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<C><div slot=\"s\" data-x /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}});  {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"div\", {  ...__sveltets_2_empty({\"data-x\":true}),});}} C}};",
        ),
        (
            "named-slot element, data-sveltekit- expression",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<C><div slot=\"s\" data-sveltekit-preload-data={b} /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"div\", {    \"data-sveltekit-preload-data\":b,});}} C}};",
        ),
        (
            "named-slot element, -- literal",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<C><div slot=\"s\" --x=\"1\" /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"div\", {    \"--x\":`1`,});}} C}};",
        ),
        (
            "named-slot element, -- expression",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<C><div slot=\"s\" --x={b} /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"div\", {    \"--x\":b,});}} C}};",
        ),
        (
            "named-slot element, -- valueless",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<C><div slot=\"s\" --x /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}});  {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"div\", {  \"--x\":true,});}} C}};",
        ),
        (
            "named-slot element, number-only attribute",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<C><div slot=\"s\" cols=\"3\" /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"div\", {    \"cols\":3,});}} C}};",
        ),
        (
            "named-slot element, mixed-case attribute",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<C><div slot=\"s\" someProp=\"0\" /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"div\", {    \"someprop\":`0`,});}} C}};",
        ),
        (
            "named-slot element, plain expression",
            "<script lang=\"ts\">import C from './C.svelte'; export let b: any;</script>\n<C><div slot=\"s\" x={b} /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"div\", {    \"x\":b,});}} C}};",
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
        "{} of 60 cells diverge from official:\n{}",
        failures.len(),
        failures.join("\n")
    );
}
