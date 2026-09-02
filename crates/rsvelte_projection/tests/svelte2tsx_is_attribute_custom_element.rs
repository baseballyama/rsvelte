//! Upstream's `Element.isCustomElement()` has two conditions — a dash in the
//! tag name, and an `is=` attribute whose first value chunk is text containing a
//! dash — and only a custom element keeps a mixed-case attribute name. rsvelte
//! implemented the first condition only, so `is="x-y"` lowercased the name on
//! every host. Expectations are generated from official svelte2tsx.
//!
//! `is={expr}` is absent on purpose: official throws from `isCustomElement`
//! (`value[0].data` is undefined on a mustache), so it has no expected output.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn template_body(src: &str) -> String {
    let code = svelte2tsx(
        src,
        Svelte2TsxOptions {
            filename: "C.svelte".to_string(),
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

const CASES: &[(&str, &str, &str)] = &[
    (
        "div, is with dash",
        "<script lang=\"ts\">import C from './C.svelte'; let tt: any; let v: any;</script>\n<div is=\"x-y\" defaultValue=\"1\"></div>",
        " { svelteHTML.createElement(\"div\", {   \"is\":`x-y`,\"defaultValue\":`1`,}); }};",
    ),
    (
        "div, is without dash",
        "<script lang=\"ts\">import C from './C.svelte'; let tt: any; let v: any;</script>\n<div is=\"plain\" defaultValue=\"1\"></div>",
        " { svelteHTML.createElement(\"div\", {   \"is\":`plain`,\"defaultvalue\":`1`,}); }};",
    ),
    (
        "div, is empty",
        "<script lang=\"ts\">import C from './C.svelte'; let tt: any; let v: any;</script>\n<div is=\"\" defaultValue=\"1\"></div>",
        " { svelteHTML.createElement(\"div\", { \"is\":\"\",\"defaultvalue\":`1`,}); }};",
    ),
    (
        "div, is valueless",
        "<script lang=\"ts\">import C from './C.svelte'; let tt: any; let v: any;</script>\n<div is defaultValue=\"1\"></div>",
        " { svelteHTML.createElement(\"div\", { \"is\":true,\"defaultvalue\":`1`,}); }};",
    ),
    (
        "div, no is",
        "<script lang=\"ts\">import C from './C.svelte'; let tt: any; let v: any;</script>\n<div  defaultValue=\"1\"></div>",
        " { svelteHTML.createElement(\"div\", { \"defaultvalue\":`1`,}); }};",
    ),
    (
        "button, is with dash",
        "<script lang=\"ts\">import C from './C.svelte'; let tt: any; let v: any;</script>\n<button is=\"x-y\" defaultValue=\"1\"></button>",
        " { svelteHTML.createElement(\"button\", {   \"is\":`x-y`,\"defaultValue\":`1`,}); }};",
    ),
    (
        "button, is without dash",
        "<script lang=\"ts\">import C from './C.svelte'; let tt: any; let v: any;</script>\n<button is=\"plain\" defaultValue=\"1\"></button>",
        " { svelteHTML.createElement(\"button\", {   \"is\":`plain`,\"defaultvalue\":`1`,}); }};",
    ),
    (
        "button, is empty",
        "<script lang=\"ts\">import C from './C.svelte'; let tt: any; let v: any;</script>\n<button is=\"\" defaultValue=\"1\"></button>",
        " { svelteHTML.createElement(\"button\", { \"is\":\"\",\"defaultvalue\":`1`,}); }};",
    ),
    (
        "button, is valueless",
        "<script lang=\"ts\">import C from './C.svelte'; let tt: any; let v: any;</script>\n<button is defaultValue=\"1\"></button>",
        " { svelteHTML.createElement(\"button\", { \"is\":true,\"defaultvalue\":`1`,}); }};",
    ),
    (
        "button, no is",
        "<script lang=\"ts\">import C from './C.svelte'; let tt: any; let v: any;</script>\n<button  defaultValue=\"1\"></button>",
        " { svelteHTML.createElement(\"button\", { \"defaultvalue\":`1`,}); }};",
    ),
    (
        "title, is with dash",
        "<script lang=\"ts\">import C from './C.svelte'; let tt: any; let v: any;</script>\n<title is=\"x-y\" defaultValue=\"1\"></title>",
        " { svelteHTML.createElement(\"title\", {   \"is\":`x-y`,\"defaultValue\":`1`,}); }};",
    ),
    (
        "title, is without dash",
        "<script lang=\"ts\">import C from './C.svelte'; let tt: any; let v: any;</script>\n<title is=\"plain\" defaultValue=\"1\"></title>",
        " { svelteHTML.createElement(\"title\", {   \"is\":`plain`,\"defaultvalue\":`1`,}); }};",
    ),
    (
        "title, is empty",
        "<script lang=\"ts\">import C from './C.svelte'; let tt: any; let v: any;</script>\n<title is=\"\" defaultValue=\"1\"></title>",
        " { svelteHTML.createElement(\"title\", { \"is\":\"\",\"defaultvalue\":`1`,}); }};",
    ),
    (
        "title, is valueless",
        "<script lang=\"ts\">import C from './C.svelte'; let tt: any; let v: any;</script>\n<title is defaultValue=\"1\"></title>",
        " { svelteHTML.createElement(\"title\", { \"is\":true,\"defaultvalue\":`1`,}); }};",
    ),
    (
        "title, no is",
        "<script lang=\"ts\">import C from './C.svelte'; let tt: any; let v: any;</script>\n<title  defaultValue=\"1\"></title>",
        " { svelteHTML.createElement(\"title\", { \"defaultvalue\":`1`,}); }};",
    ),
    (
        "svelte:element, is with dash",
        "<script lang=\"ts\">import C from './C.svelte'; let tt: any; let v: any;</script>\n<svelte:element this={tt} is=\"x-y\" defaultValue=\"1\"></svelte:element>",
        " { svelteHTML.createElement(tt, {     \"is\":`x-y`,\"defaultValue\":`1`,}); }};",
    ),
    (
        "svelte:element, is without dash",
        "<script lang=\"ts\">import C from './C.svelte'; let tt: any; let v: any;</script>\n<svelte:element this={tt} is=\"plain\" defaultValue=\"1\"></svelte:element>",
        " { svelteHTML.createElement(tt, {     \"is\":`plain`,\"defaultvalue\":`1`,}); }};",
    ),
    (
        "svelte:element, is empty",
        "<script lang=\"ts\">import C from './C.svelte'; let tt: any; let v: any;</script>\n<svelte:element this={tt} is=\"\" defaultValue=\"1\"></svelte:element>",
        " { svelteHTML.createElement(tt, {   \"is\":\"\",\"defaultvalue\":`1`,}); }};",
    ),
    (
        "svelte:element, is valueless",
        "<script lang=\"ts\">import C from './C.svelte'; let tt: any; let v: any;</script>\n<svelte:element this={tt} is defaultValue=\"1\"></svelte:element>",
        " { svelteHTML.createElement(tt, {   \"is\":true,\"defaultvalue\":`1`,}); }};",
    ),
    (
        "svelte:element, no is",
        "<script lang=\"ts\">import C from './C.svelte'; let tt: any; let v: any;</script>\n<svelte:element this={tt}  defaultValue=\"1\"></svelte:element>",
        " { svelteHTML.createElement(tt, {   \"defaultvalue\":`1`,}); }};",
    ),
    (
        "named-slot elem, is with dash",
        "<script lang=\"ts\">import C from './C.svelte'; let tt: any; let v: any;</script>\n<C><div slot=\"s\" is=\"x-y\" defaultValue=\"1\"></div></C>",
        " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"div\", {     \"is\":`x-y`,\"defaultValue\":`1`,}); }} C}};",
    ),
    (
        "named-slot elem, is without dash",
        "<script lang=\"ts\">import C from './C.svelte'; let tt: any; let v: any;</script>\n<C><div slot=\"s\" is=\"plain\" defaultValue=\"1\"></div></C>",
        " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"div\", {     \"is\":`plain`,\"defaultvalue\":`1`,}); }} C}};",
    ),
    (
        "named-slot elem, is empty",
        "<script lang=\"ts\">import C from './C.svelte'; let tt: any; let v: any;</script>\n<C><div slot=\"s\" is=\"\" defaultValue=\"1\"></div></C>",
        " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"div\", {   \"is\":\"\",\"defaultvalue\":`1`,}); }} C}};",
    ),
    (
        "named-slot elem, is valueless",
        "<script lang=\"ts\">import C from './C.svelte'; let tt: any; let v: any;</script>\n<C><div slot=\"s\" is defaultValue=\"1\"></div></C>",
        " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"div\", {   \"is\":true,\"defaultvalue\":`1`,}); }} C}};",
    ),
    (
        "named-slot elem, no is",
        "<script lang=\"ts\">import C from './C.svelte'; let tt: any; let v: any;</script>\n<C><div slot=\"s\"  defaultValue=\"1\"></div></C>",
        " { const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"s\"];$$_$$;{ svelteHTML.createElement(\"div\", {   \"defaultvalue\":`1`,}); }} C}};",
    ),
    (
        "dash tag, is with dash",
        "<script lang=\"ts\">import C from './C.svelte'; let tt: any; let v: any;</script>\n<my-el is=\"x-y\" defaultValue=\"1\"></my-el>",
        " { svelteHTML.createElement(\"my-el\", {   \"is\":`x-y`,\"defaultValue\":`1`,}); }};",
    ),
    (
        "dash tag, is without dash",
        "<script lang=\"ts\">import C from './C.svelte'; let tt: any; let v: any;</script>\n<my-el is=\"plain\" defaultValue=\"1\"></my-el>",
        " { svelteHTML.createElement(\"my-el\", {   \"is\":`plain`,\"defaultValue\":`1`,}); }};",
    ),
    (
        "dash tag, is empty",
        "<script lang=\"ts\">import C from './C.svelte'; let tt: any; let v: any;</script>\n<my-el is=\"\" defaultValue=\"1\"></my-el>",
        " { svelteHTML.createElement(\"my-el\", { \"is\":\"\",\"defaultValue\":`1`,}); }};",
    ),
    (
        "dash tag, is valueless",
        "<script lang=\"ts\">import C from './C.svelte'; let tt: any; let v: any;</script>\n<my-el is defaultValue=\"1\"></my-el>",
        " { svelteHTML.createElement(\"my-el\", { \"is\":true,\"defaultValue\":`1`,}); }};",
    ),
    (
        "dash tag, no is",
        "<script lang=\"ts\">import C from './C.svelte'; let tt: any; let v: any;</script>\n<my-el  defaultValue=\"1\"></my-el>",
        " { svelteHTML.createElement(\"my-el\", { \"defaultValue\":`1`,}); }};",
    ),
    (
        "div, is dash then mustache",
        "<script lang=\"ts\">import C from './C.svelte'; let tt: any; let v: any;</script>\n<div is=\"x-y{v}\" defaultValue=\"1\"></div>",
        " { svelteHTML.createElement(\"div\", {   \"is\":`x-y${v}`,\"defaultValue\":`1`,}); }};",
    ),
    (
        "div, is mustache then dash",
        "<script lang=\"ts\">import C from './C.svelte'; let tt: any; let v: any;</script>\n<div is=\"a{v}-b\" defaultValue=\"1\"></div>",
        " { svelteHTML.createElement(\"div\", {   \"is\":`a${v}-b`,\"defaultvalue\":`1`,}); }};",
    ),
    (
        "dash tag, is without dash",
        "<script lang=\"ts\">import C from './C.svelte'; let tt: any; let v: any;</script>\n<my-el is=\"plain\" fooBar=\"1\"></my-el>",
        " { svelteHTML.createElement(\"my-el\", {   \"is\":`plain`,\"fooBar\":`1`,}); }};",
    ),
    (
        "div, svg attribute",
        "<script lang=\"ts\">import C from './C.svelte'; let tt: any; let v: any;</script>\n<div is=\"x-y\" viewBox=\"1\"></div>",
        " { svelteHTML.createElement(\"div\", {   \"is\":`x-y`,\"viewBox\":`1`,}); }};",
    ),
    (
        "div, on-prefixed",
        "<script lang=\"ts\">import C from './C.svelte'; let tt: any; let v: any;</script>\n<div is=\"x-y\" onFoo=\"1\"></div>",
        " { svelteHTML.createElement(\"div\", {   \"is\":`x-y`,\"onFoo\":`1`,}); }};",
    ),
];

#[test]
fn an_is_attribute_makes_an_element_custom_and_keeps_its_attribute_case() {
    let mut failures = Vec::new();
    for (label, source, expected) in CASES {
        let actual = template_body(source);
        if actual != *expected {
            failures.push(format!(
                "{label}\n  expected {expected:?}\n  actual   {actual:?}"
            ));
        }
    }
    assert!(
        failures.is_empty(),
        "{} of {} cells diverge from official:\n{}",
        failures.len(),
        CASES.len(),
        failures.join("\n")
    );
}
