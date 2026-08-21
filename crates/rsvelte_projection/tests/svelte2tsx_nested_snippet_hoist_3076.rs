//! Upstream's `hoistSnippetBlock` moves a nested `{#snippet}` in front of the
//! first non-snippet child of its container, so a snippet body that opens with
//! markup still emits the nested function first. The expected string is
//! official svelte2tsx's byte-exact output for the same source.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

#[test]
fn a_nested_snippet_is_emitted_before_the_enclosing_snippets_markup() {
    let source = "{#snippet outer(a)}\n\t<b>{a}</b>\n\t{#snippet inner(b)}\n\t\t<i>{b}</i>\n\t{/snippet}\n\t{@render inner(a)}\n{/snippet}\n\n{@render outer('x')}\n";

    let options = Svelte2TsxOptions {
        filename: "Test.svelte".to_string(),
        ..Svelte2TsxOptions::default()
    };
    let code = svelte2tsx(source, options).expect("valid component").code;

    assert_eq!(
        code,
        "///<reference types=\"svelte\" />\n;function $$render() {\nasync () => { const outer/*Ωignore_positionΩ*/ = (a)/*Ωignore_startΩ*/: ReturnType<import('svelte').Snippet>/*Ωignore_endΩ*/ => { async ()/*Ωignore_positionΩ*/ => {\n\t const inner/*Ωignore_positionΩ*/ = (b)/*Ωignore_startΩ*/: ReturnType<import('svelte').Snippet>/*Ωignore_endΩ*/ => { async ()/*Ωignore_positionΩ*/ => {\n\t\t { svelteHTML.createElement(\"i\", {});b; }\n\t};return __sveltets_2_any(0)}; { svelteHTML.createElement(\"b\", {});a; }\n\t\n\t;__sveltets_2_ensureSnippet(inner(a));\n};return __sveltets_2_any(0)};\n\n;__sveltets_2_ensureSnippet(outer('x'));\n};\nreturn { props: /** @type {Record<string, never>} */ ({}), exports: {}, bindings: \"\", slots: {}, events: {} }}\nconst Test__SvelteComponent_ = __sveltets_2_isomorphic_component(__sveltets_2_partial(__sveltets_2_with_any_event($$render())));\n/*Ωignore_startΩ*/type Test__SvelteComponent_ = InstanceType<typeof Test__SvelteComponent_>;\n/*Ωignore_endΩ*/export default Test__SvelteComponent_;"
    );
}
