//! Upstream's `scriptRegex` / `styleRegex` (`htmlxparser.ts:33-36`) carry `g`
//! and no `i`, so `<Script>` and `<Style />` are components. rsvelte scanned
//! for them case-insensitively, blanked their source range as if they were
//! verbatim tags, and — with no top-level `<script>` to hold it — injected the
//! blanked body into `$$render()` as a bare statement, emitting TSX no parser
//! accepts. The expected strings below are official svelte2tsx's byte-exact
//! output for the same source, called with the options
//! `Svelte2TsxOptions::default()` carries (`filename: "Test.svelte"`,
//! `mode: 'ts'`, `namespace: 'html'`, `version: '5'`).

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn convert(source: &str) -> String {
    let options = Svelte2TsxOptions {
        filename: "Test.svelte".to_string(),
        ..Svelte2TsxOptions::default()
    };
    svelte2tsx(source, options)
        .expect("a component named like a script tag is not an error")
        .code
}

#[test]
fn script_like_component_is_not_blanked() {
    assert_eq!(
        convert("<Script>\n\t<p>hello</p>\n</Script>\n"),
        "///<reference types=\"svelte\" />\n;function $$render() {\nasync () => { { const $$_tpircS0C = __sveltets_2_ensureComponent(Script); new $$_tpircS0C({ target: __sveltets_2_any(), props: {children:() => { return __sveltets_2_any(0); },}});\n\t { svelteHTML.createElement(\"p\", {});  }\n Script}\n};\nreturn { props: /** @type {Record<string, never>} */ ({}), exports: {}, bindings: \"\", slots: {}, events: {} }}\nconst Test__SvelteComponent_ = __sveltets_2_isomorphic_component(__sveltets_2_partial(__sveltets_2_with_any_event($$render())));\n/*Ωignore_startΩ*/type Test__SvelteComponent_ = InstanceType<typeof Test__SvelteComponent_>;\n/*Ωignore_endΩ*/export default Test__SvelteComponent_;"
    );
}

#[test]
fn uppercase_script_like_component_is_not_blanked() {
    assert_eq!(
        convert("<SCRIPT>\n\t<p>hello</p>\n</SCRIPT>\n"),
        "///<reference types=\"svelte\" />\n;function $$render() {\nasync () => { { const $$_TPIRCS0C = __sveltets_2_ensureComponent(SCRIPT); new $$_TPIRCS0C({ target: __sveltets_2_any(), props: {children:() => { return __sveltets_2_any(0); },}});\n\t { svelteHTML.createElement(\"p\", {});  }\n SCRIPT}\n};\nreturn { props: /** @type {Record<string, never>} */ ({}), exports: {}, bindings: \"\", slots: {}, events: {} }}\nconst Test__SvelteComponent_ = __sveltets_2_isomorphic_component(__sveltets_2_partial(__sveltets_2_with_any_event($$render())));\n/*Ωignore_startΩ*/type Test__SvelteComponent_ = InstanceType<typeof Test__SvelteComponent_>;\n/*Ωignore_endΩ*/export default Test__SvelteComponent_;"
    );
}

#[test]
fn style_like_component_is_not_blanked() {
    assert_eq!(
        convert("<Style />\n"),
        "///<reference types=\"svelte\" />\n;function $$render() {\nasync () => { { const $$_elytS0C = __sveltets_2_ensureComponent(Style); new $$_elytS0C({ target: __sveltets_2_any(), props: {}});}\n};\nreturn { props: /** @type {Record<string, never>} */ ({}), exports: {}, bindings: \"\", slots: {}, events: {} }}\nconst Test__SvelteComponent_ = __sveltets_2_isomorphic_component(__sveltets_2_partial(__sveltets_2_with_any_event($$render())));\n/*Ωignore_startΩ*/type Test__SvelteComponent_ = InstanceType<typeof Test__SvelteComponent_>;\n/*Ωignore_endΩ*/export default Test__SvelteComponent_;"
    );
}

#[test]
fn a_real_lowercase_script_is_still_hoisted() {
    assert_eq!(
        convert("<script>\n\tlet a = 1;\n</script>\n<p>{a}</p>\n"),
        "///<reference types=\"svelte\" />\n;function $$render() {\n\n\tlet a = 1;\n;\nasync () => {\n { svelteHTML.createElement(\"p\", {});a; }\n};\nreturn { props: /** @type {Record<string, never>} */ ({}), exports: {}, bindings: \"\", slots: {}, events: {} }}\nconst Test__SvelteComponent_ = __sveltets_2_isomorphic_component(__sveltets_2_partial(__sveltets_2_with_any_event($$render())));\n/*Ωignore_startΩ*/type Test__SvelteComponent_ = InstanceType<typeof Test__SvelteComponent_>;\n/*Ωignore_endΩ*/export default Test__SvelteComponent_;"
    );
}

#[test]
fn style_like_component_with_a_close_tag_is_not_blanked() {
    assert_eq!(
        convert("<Style>\n\t<p>hello</p>\n</Style>\n"),
        "///<reference types=\"svelte\" />\n;function $$render() {\nasync () => { { const $$_elytS0C = __sveltets_2_ensureComponent(Style); new $$_elytS0C({ target: __sveltets_2_any(), props: {children:() => { return __sveltets_2_any(0); },}});\n\t { svelteHTML.createElement(\"p\", {});  }\n Style}\n};\nreturn { props: /** @type {Record<string, never>} */ ({}), exports: {}, bindings: \"\", slots: {}, events: {} }}\nconst Test__SvelteComponent_ = __sveltets_2_isomorphic_component(__sveltets_2_partial(__sveltets_2_with_any_event($$render())));\n/*Ωignore_startΩ*/type Test__SvelteComponent_ = InstanceType<typeof Test__SvelteComponent_>;\n/*Ωignore_endΩ*/export default Test__SvelteComponent_;"
    );
}
