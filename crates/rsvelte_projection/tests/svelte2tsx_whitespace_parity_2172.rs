//! Regression test: whitespace / gap accounting around a top-level `<style>`
//! and a `<svelte:boundary>` opening tag (issue #2172).
//!
//! Every expectation is the byte-exact `async () => { … };` body official
//! svelte2tsx (submodules/language-tools) emits for the same source.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

/// The `async () => { … };` template body, which is where the divergences show.
fn template_body(source: &str) -> String {
    let opts = Svelte2TsxOptions {
        filename: "Input.svelte".to_string(),
        is_ts_file: false,
        ..Default::default()
    };
    let code = svelte2tsx(source, opts).expect("svelte2tsx").code;
    let start = code.find("async () => {").expect("template body");
    let end = code.find("\nreturn { props:").expect("template body end");
    code[start..end].to_string()
}

#[test]
fn top_level_style_keeps_the_whitespace_around_it() {
    // `handleStyleTag` removes exactly the node range, so the newline after
    // `</style>` survives into the template body.
    assert_eq!(
        template_body("<style>\n\tp { color: red; }\n</style>\n"),
        "async () => {\n};"
    );
    assert_eq!(template_body("<style></style>"), "async () => {};");
    assert_eq!(template_body("<style></style>\n\n"), "async () => {\n\n};");
    assert_eq!(template_body("<style></style>  "), "async () => {  };");
}

#[test]
fn style_between_elements_keeps_both_sides() {
    assert_eq!(
        template_body("<p>x</p>\n<style>p{color:red}</style>\n"),
        "async () => { { svelteHTML.createElement(\"p\", {});  }\n\n};"
    );
    assert_eq!(
        template_body("<style>p{color:red}</style>\n<p>x</p>\n"),
        "async () => {\n { svelteHTML.createElement(\"p\", {});  }\n};"
    );
}

#[test]
fn style_the_parser_does_not_capture_keeps_the_whitespace_around_it() {
    // `<style lang="…">` is not in `ast.css`, so the fallback scanner blanks it.
    assert_eq!(
        template_body("<style lang=\"scss\">\n\tp { color: red; }\n</style>\n"),
        "async () => {\n};"
    );
}

#[test]
fn boundary_opener_keeps_the_default_start_transformation_gaps() {
    // `svelte:boundary` is not one of the `svelte:` tags upstream names with a
    // string literal, so the tag name stays a kept source range and the props
    // gap widens by one space.
    assert_eq!(
        template_body("<svelte:boundary onerror={handler}>\n\t<p>hi</p>\n</svelte:boundary>\n"),
        concat!(
            "async () => { { svelteHTML.createElement(\"svelte:boundary\", {  \"onerror\":handler,}); ",
            "{ svelteHTML.createElement(\"p\", {});  }\n }\n};"
        )
    );
    assert_eq!(
        template_body(
            "<svelte:boundary onerror={handler} foo=\"bar\">\n\t<p>hi</p>\n</svelte:boundary>\n"
        ),
        concat!(
            "async () => { { svelteHTML.createElement(\"svelte:boundary\", ",
            "{    \"onerror\":handler,\"foo\":`bar`,}); ",
            "{ svelteHTML.createElement(\"p\", {});  }\n }\n};"
        )
    );
}

#[test]
fn boundary_folds_a_dropped_leading_whitespace_child_into_the_opener() {
    // `remove_surrounding_whitespace_nodes` drops the whitespace-only first
    // child, so `computeStartTagEnd` lands on the `<p>` and the `\n\t` is eaten.
    assert_eq!(
        template_body("<svelte:boundary>\n\t<p>hi</p>\n</svelte:boundary>\n"),
        concat!(
            "async () => {  { svelteHTML.createElement(\"svelte:boundary\", {}); ",
            "{ svelteHTML.createElement(\"p\", {});  }\n }\n};"
        )
    );
    assert_eq!(
        template_body("<svelte:boundary>\n\t{value}\n</svelte:boundary>\n"),
        "async () => {  { svelteHTML.createElement(\"svelte:boundary\", {});value;\n }\n};"
    );
    assert_eq!(
        template_body("<svelte:boundary>\n\t{#if x}\n\t\t<p>a</p>\n\t{/if}\n</svelte:boundary>\n"),
        concat!(
            "async () => {  { svelteHTML.createElement(\"svelte:boundary\", {});if(x){\n\t\t ",
            "{ svelteHTML.createElement(\"p\", {});  }\n\t}\n }\n};"
        )
    );
}

#[test]
fn boundary_trims_a_content_bearing_first_and_last_text_child() {
    // The same conversion trims (rather than drops) a `Text` child that carries
    // content, which changes the blanked-out replacement `handleText` computes.
    assert_eq!(
        template_body("<svelte:boundary>\n\thello\n</svelte:boundary>\n"),
        "async () => { { svelteHTML.createElement(\"svelte:boundary\", {});  }\n};"
    );
    assert_eq!(
        template_body("<svelte:boundary>\n\ta{x}b\n</svelte:boundary>\n"),
        "async () => { { svelteHTML.createElement(\"svelte:boundary\", {}); x;  }\n};"
    );
    assert_eq!(
        template_body("<svelte:boundary>\n\ta\n\t<p>x</p>\n\tb\n</svelte:boundary>\n"),
        concat!(
            "async () => { { svelteHTML.createElement(\"svelte:boundary\", {});\n\t ",
            "{ svelteHTML.createElement(\"p\", {});  }\n\t }\n};"
        )
    );
}

#[test]
fn boundary_snippet_children_stay_implicit_props_after_the_fold() {
    assert_eq!(
        template_body(
            "<svelte:boundary>\n\t{#snippet failed(e, reset)}\n\t\t<button onclick={reset}>x</button>\n\t{/snippet}\n</svelte:boundary>\n"
        ),
        concat!(
            "async () => {  { svelteHTML.createElement(\"svelte:boundary\", ",
            "{failed:(e, reset) => { async ()/*Ωignore_positionΩ*/ => {\n\t\t ",
            "{ svelteHTML.createElement(\"button\", { \"onclick\":reset,});  }\n\t};",
            "return __sveltets_2_any(0)},});\n }\n};"
        )
    );
}

#[test]
fn boundary_without_children_keeps_the_closing_tag_lookup() {
    assert_eq!(
        template_body("<svelte:boundary></svelte:boundary>\n"),
        "async () => { { svelteHTML.createElement(\"svelte:boundary\", {}); }\n};"
    );
    assert_eq!(
        template_body("<svelte:boundary />\n"),
        "async () => { { svelteHTML.createElement(\"svelte:boundary\", {});}\n};"
    );
    // A whitespace-only child is dropped, so it is never visited and survives.
    assert_eq!(
        template_body("<svelte:boundary>\n\t\n</svelte:boundary>\n"),
        "async () => { { svelteHTML.createElement(\"svelte:boundary\", {});\n\t\n }\n};"
    );
}

#[test]
fn bare_await_pending_arm_keeps_its_gap() {
    assert_eq!(
        template_body("{#await p}\n\t<p>loading</p>\n{/await}\n"),
        "async () => {  { \n\t { svelteHTML.createElement(\"p\", {});  }\nawait (p);}\n};"
    );
    assert_eq!(
        template_body("{#await p}x{/await}"),
        "async () => {  {  await (p);}};"
    );
}
