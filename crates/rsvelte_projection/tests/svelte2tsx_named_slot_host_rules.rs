//! A `slot="…"` attribute routes its element through a second port, and that
//! port answered two questions its own way.
//!
//! `<svelte:fragment slot="s">` is an `Element` whose node type is not
//! `Element`, so neither the attribute-case fold nor the number-only rewrite
//! reaches it — the same rule the root-level `<svelte:…>` tags follow. And its
//! opener is position-preserving like any other element's, so the columns the
//! stripped `slot=` / `let:` occupy come back as spaces; rsvelte emitted those
//! spaces only when nothing else survived the strip, and none at all otherwise.
//!
//! The grid is the host carrying `slot="…"` × the attribute shapes that separate
//! the rules, plus the layout rows that vary what the spacing is a function of:
//! the stripped attribute's own length and count are held against the kept
//! attributes' count, a self-closing tag against one with a closing tag, and the
//! source's own whitespace. Only the last group can tell "one space per stripped
//! attribute" from the position-preserving rule, and the two agree on every row
//! that has nothing left to keep.
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
fn a_named_slot_host_keeps_its_own_name_and_layout_rules() {
    let mut failures = Vec::new();
    for (label, src, expected) in [
        (
            "div, mixed-case name",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><div slot=\"s\" someProp=\"0\" /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"div\", {    \"someprop\":`0`,});}} C}};",
        ),
        (
            "div, number-only attribute",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><div slot=\"s\" cols=\"3\" /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"div\", {    \"cols\":3,});}} C}};",
        ),
        (
            "div, data- attribute",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><div slot=\"s\" data-x={b} /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"div\", {    ...__sveltets_2_empty({\"data-x\":b}),});}} C}};",
        ),
        (
            "div, css custom property",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><div slot=\"s\" --x=\"1\" /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"div\", {    \"--x\":`1`,});}} C}};",
        ),
        (
            "div, valueless",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><div slot=\"s\" x /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}});  {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"div\", {  \"x\":true,});}} C}};",
        ),
        (
            "custom element, mixed-case name",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><my-el slot=\"s\" someProp=\"0\" /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"my-el\", {    \"someProp\":`0`,});}} C}};",
        ),
        (
            "custom element, number-only attribute",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><my-el slot=\"s\" cols=\"3\" /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"my-el\", {    \"cols\":3,});}} C}};",
        ),
        (
            "custom element, data- attribute",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><my-el slot=\"s\" data-x={b} /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"my-el\", {    ...__sveltets_2_empty({\"data-x\":b}),});}} C}};",
        ),
        (
            "custom element, css custom property",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><my-el slot=\"s\" --x=\"1\" /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"my-el\", {    \"--x\":`1`,});}} C}};",
        ),
        (
            "custom element, valueless",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><my-el slot=\"s\" x /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}});  {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"my-el\", {  \"x\":true,});}} C}};",
        ),
        (
            "svg, mixed-case name",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><svg slot=\"s\" someProp=\"0\" /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"svg\", {    \"someprop\":`0`,});}} C}};",
        ),
        (
            "svg, number-only attribute",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><svg slot=\"s\" cols=\"3\" /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"svg\", {    \"cols\":3,});}} C}};",
        ),
        (
            "svg, data- attribute",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><svg slot=\"s\" data-x={b} /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"svg\", {    ...__sveltets_2_empty({\"data-x\":b}),});}} C}};",
        ),
        (
            "svg, css custom property",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><svg slot=\"s\" --x=\"1\" /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"svg\", {    \"--x\":`1`,});}} C}};",
        ),
        (
            "svg, valueless",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><svg slot=\"s\" x /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}});  {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"svg\", {  \"x\":true,});}} C}};",
        ),
        (
            "svelte:element, mixed-case name",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><svelte:element this={\"div\"} slot=\"s\" someProp=\"0\" /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"div\", {     \"someprop\":`0`,});}} C}};",
        ),
        (
            "svelte:element, number-only attribute",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><svelte:element this={\"div\"} slot=\"s\" cols=\"3\" /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"div\", {     \"cols\":3,});}} C}};",
        ),
        (
            "svelte:element, data- attribute",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><svelte:element this={\"div\"} slot=\"s\" data-x={b} /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"div\", {     ...__sveltets_2_empty({\"data-x\":b}),});}} C}};",
        ),
        (
            "svelte:element, css custom property",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><svelte:element this={\"div\"} slot=\"s\" --x=\"1\" /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"div\", {     \"--x\":`1`,});}} C}};",
        ),
        (
            "svelte:element, valueless",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><svelte:element this={\"div\"} slot=\"s\" x /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}});  {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"div\", {   \"x\":true,});}} C}};",
        ),
        (
            "svelte:self, mixed-case name",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><svelte:self slot=\"s\" someProp=\"0\" /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ __sveltets_2_createComponentAny({    \"someProp\":`0`,});}} C}};",
        ),
        (
            "svelte:self, number-only attribute",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><svelte:self slot=\"s\" cols=\"3\" /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ __sveltets_2_createComponentAny({    \"cols\":`3`,});}} C}};",
        ),
        (
            "svelte:self, data- attribute",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><svelte:self slot=\"s\" data-x={b} /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ __sveltets_2_createComponentAny({    \"data-x\":b,});}} C}};",
        ),
        (
            "svelte:self, css custom property",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><svelte:self slot=\"s\" --x=\"1\" /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ __sveltets_2_createComponentAny({    ...__sveltets_2_cssProp({\"--x\":`1`}),});}} C}};",
        ),
        (
            "svelte:self, valueless",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><svelte:self slot=\"s\" x /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}});  {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ __sveltets_2_createComponentAny({  \"x\":true,});}} C}};",
        ),
        (
            "svelte:component, mixed-case name",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><svelte:component this={D} slot=\"s\" someProp=\"0\" /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ const $$_tnenopmoc_etlevs1C = __sveltets_2_ensureComponent(D); new $$_tnenopmoc_etlevs1C({ target: __sveltets_2_any(), props: {     \"someProp\":`0`,}});}} C}};",
        ),
        (
            "svelte:component, number-only attribute",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><svelte:component this={D} slot=\"s\" cols=\"3\" /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ const $$_tnenopmoc_etlevs1C = __sveltets_2_ensureComponent(D); new $$_tnenopmoc_etlevs1C({ target: __sveltets_2_any(), props: {     \"cols\":`3`,}});}} C}};",
        ),
        (
            "svelte:component, data- attribute",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><svelte:component this={D} slot=\"s\" data-x={b} /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ const $$_tnenopmoc_etlevs1C = __sveltets_2_ensureComponent(D); new $$_tnenopmoc_etlevs1C({ target: __sveltets_2_any(), props: {     \"data-x\":b,}});}} C}};",
        ),
        (
            "svelte:component, css custom property",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><svelte:component this={D} slot=\"s\" --x=\"1\" /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ const $$_tnenopmoc_etlevs1C = __sveltets_2_ensureComponent(D); new $$_tnenopmoc_etlevs1C({ target: __sveltets_2_any(), props: {     ...__sveltets_2_cssProp({\"--x\":`1`}),}});}} C}};",
        ),
        (
            "svelte:component, valueless",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><svelte:component this={D} slot=\"s\" x /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}});  {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ const $$_tnenopmoc_etlevs1C = __sveltets_2_ensureComponent(D); new $$_tnenopmoc_etlevs1C({ target: __sveltets_2_any(), props: {   \"x\":true,}});}} C}};",
        ),
        (
            "svelte:fragment, mixed-case name",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><svelte:fragment slot=\"s\" someProp=\"0\" /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"svelte:fragment\", {    \"someProp\":`0`,});}} C}};",
        ),
        (
            "svelte:fragment, number-only attribute",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><svelte:fragment slot=\"s\" cols=\"3\" /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"svelte:fragment\", {    \"cols\":`3`,});}} C}};",
        ),
        (
            "svelte:fragment, data- attribute",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><svelte:fragment slot=\"s\" data-x={b} /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"svelte:fragment\", {    ...__sveltets_2_empty({\"data-x\":b}),});}} C}};",
        ),
        (
            "svelte:fragment, css custom property",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><svelte:fragment slot=\"s\" --x=\"1\" /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"svelte:fragment\", {    \"--x\":`1`,});}} C}};",
        ),
        (
            "svelte:fragment, valueless",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><svelte:fragment slot=\"s\" x /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}});  {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"svelte:fragment\", {  \"x\":true,});}} C}};",
        ),
        (
            "component, mixed-case name",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><D slot=\"s\" someProp=\"0\" /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ const $$_D1C = __sveltets_2_ensureComponent(D); new $$_D1C({ target: __sveltets_2_any(), props: {    \"someProp\":`0`,}});}} C}};",
        ),
        (
            "component, number-only attribute",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><D slot=\"s\" cols=\"3\" /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ const $$_D1C = __sveltets_2_ensureComponent(D); new $$_D1C({ target: __sveltets_2_any(), props: {    \"cols\":`3`,}});}} C}};",
        ),
        (
            "component, data- attribute",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><D slot=\"s\" data-x={b} /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ const $$_D1C = __sveltets_2_ensureComponent(D); new $$_D1C({ target: __sveltets_2_any(), props: {    \"data-x\":b,}});}} C}};",
        ),
        (
            "component, css custom property",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><D slot=\"s\" --x=\"1\" /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ const $$_D1C = __sveltets_2_ensureComponent(D); new $$_D1C({ target: __sveltets_2_any(), props: {    ...__sveltets_2_cssProp({\"--x\":`1`}),}});}} C}};",
        ),
        (
            "component, valueless",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><D slot=\"s\" x /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}});  {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ const $$_D1C = __sveltets_2_ensureComponent(D); new $$_D1C({ target: __sveltets_2_any(), props: {  \"x\":true,}});}} C}};",
        ),
        (
            "fragment, one attribute",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><svelte:fragment slot=\"s\" x=\"1\" /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"svelte:fragment\", {    \"x\":`1`,});}} C}};",
        ),
        (
            "fragment, longer name",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><svelte:fragment slot=\"s\" xx=\"1\" /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"svelte:fragment\", {    \"xx\":`1`,});}} C}};",
        ),
        (
            "fragment, longer slot name",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><svelte:fragment slot=\"ss\" x=\"1\" /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"ss\"];$$_$$;{ svelteHTML.createElement(\"svelte:fragment\", {    \"x\":`1`,});}} C}};",
        ),
        (
            "fragment, let: plus attribute",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><svelte:fragment slot=\"s\" let:y x=\"1\" /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,y,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"svelte:fragment\", {    \"x\":`1`,});}} C}};",
        ),
        (
            "fragment, two attributes",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><svelte:fragment slot=\"s\" x=\"1\" y=\"2\" /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"svelte:fragment\", {      \"x\":`1`,\"y\":`2`,});}} C}};",
        ),
        (
            "fragment, slot last",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><svelte:fragment x=\"1\" slot=\"s\" /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"svelte:fragment\", {   \"x\":`1`,});}} C}};",
        ),
        (
            "fragment, with closing tag",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><svelte:fragment slot=\"s\" x=\"1\"></svelte:fragment></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"svelte:fragment\", {   \"x\":`1`,}); }} C}};",
        ),
        (
            "fragment, extra whitespace",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><svelte:fragment    slot=\"s\"   x=\"1\" /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"svelte:fragment\", {    \"x\":`1`,});}} C}};",
        ),
        (
            "fragment, no other attribute",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><svelte:fragment slot=\"s\" /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"svelte:fragment\", {  });}} C}};",
        ),
        (
            "fragment, one let:",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><svelte:fragment slot=\"s\" let:y /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}});  {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,y,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"svelte:fragment\", {  });}} C}};",
        ),
        (
            "fragment, two let:",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><svelte:fragment slot=\"s\" let:y let:z /></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}});  {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,y,z,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"svelte:fragment\", {   });}} C}};",
        ),
        (
            "fragment, empty with closing tag",
            "<script lang=\"ts\">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>\n<C><svelte:fragment slot=\"s\"></svelte:fragment></C>",
            " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"svelte:fragment\", { }); }} C}};",
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
        "{} of 52 cells diverge from official:\n{}",
        failures.len(),
        failures.join("\n")
    );
}
