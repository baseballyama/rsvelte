use rsvelte_svelte::compilation::compiler_syntax_tree;
use rsvelte_svelte::semantic::{analyze, resolve};
use rsvelte_svelte_compile::{CompileInput, Target, compile};

#[test]
fn invalid_special_attributes_are_refused_on_both_targets() {
    for (source, code) in [
        (
            r#"<svelte:options customElement="Element"/>"#,
            "svelte_options_invalid_tagname",
        ),
        (
            r#"<svelte:options customElement="font-face"/>"#,
            "svelte_options_reserved_tagname",
        ),
        (
            r#"<svelte:options customElement={{props:{value:{type:"Date"}}}}/>"#,
            "svelte_options_invalid_customelement_props",
        ),
        (
            r#"<svelte:options customElement={{shadow:"closed"}}/>"#,
            "svelte_options_invalid_customelement_shadow",
        ),
        (
            "<svelte:boundary>{#snippet failed(...errors)}{errors}{/snippet}</svelte:boundary>",
            "snippet_invalid_rest_parameter",
        ),
        ("<svelte:head id=\"x\" />", "svelte_head_illegal_attribute"),
        (
            "<svelte:head><title id=\"x\">X</title></svelte:head>",
            "title_illegal_attribute",
        ),
        (
            "<svelte:head><title><b>X</b></title></svelte:head>",
            "title_invalid_content",
        ),
        (
            "<svelte:boundary id={value} />",
            "svelte_boundary_invalid_attribute",
        ),
        (
            "<svelte:boundary onerror=\"value\" />",
            "svelte_boundary_invalid_attribute_value",
        ),
    ] {
        let component = rsvelte_svelte::syntax::parse::parse(source).expect("valid syntax");
        let tree = compiler_syntax_tree::lower(&component, source);
        let input = rsvelte_svelte::svelte_input(&component, &tree, source, "test.svelte");
        let resolution = resolve::resolve(&component.javascript, component.program, &tree);
        let analysis = analyze::analyze(&input, &resolution);
        for target in [Target::Client, Target::Server] {
            let error = compile(&CompileInput::from(input), &resolution, &analysis, target)
                .expect_err("invalid attributes");
            assert_eq!(error.code, code, "{source} on {target:?}");
        }
    }
}
