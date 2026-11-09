use rsvelte_svelte_compile::{CompileInput, Target, compile_input};
use rsvelte_svelte_semantic::{analyze, compiler_syntax_tree, resolve};

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
        let component = rsvelte_svelte_syntax::parse::parse(source).expect("valid syntax");
        let tree = compiler_syntax_tree::lower(&component, source);
        let input = rsvelte_svelte_semantic::svelte_input(&component, &tree, source, "test.svelte");
        let resolution = resolve::resolve(&component.javascript, component.program, &tree);
        let analysis = analyze::analyze(&input, &resolution);
        for target in [Target::Client, Target::Server] {
            let error = compile_input(&CompileInput::from(input), &resolution, &analysis, target)
                .expect_err("invalid attributes");
            assert_eq!(error.code, code, "{source} on {target:?}");
        }
    }
}

#[test]
fn misplaced_runes_and_wrong_rune_arguments_raise_upstream_errors_on_both_targets() {
    for (script, code) in [
        (
            "function f() { let p = $props(); }",
            "props_invalid_placement",
        ),
        ("{ let p = $props(); }", "props_invalid_placement"),
        ("let p = $props(); let q = $props();", "props_duplicate"),
        ("let p = $props(1);", "rune_invalid_arguments"),
        ("let { id } = $props.id();", "props_id_invalid_placement"),
        (
            "let i = $props.id(); let j = $props.id();",
            "props_duplicate",
        ),
        ("let a = $bindable(1);", "bindable_invalid_location"),
        (
            "let { a = $bindable(1, 2) } = $props();",
            "rune_invalid_arguments_length",
        ),
        ("let o = { a: $state(1) };", "state_invalid_placement"),
        ("let a = $state?.(1);", "state_invalid_placement"),
        ("let a = $state(1, 2);", "rune_invalid_arguments_length"),
        ("let a = $state(...[1]);", "rune_invalid_spread"),
        ("let a = $derived();", "rune_invalid_arguments_length"),
        ("let x = $effect(() => {});", "effect_invalid_placement"),
        ("$effect();", "rune_invalid_arguments_length"),
        ("let t = $effect.tracking(1);", "rune_invalid_arguments"),
        ("let r = $effect.root();", "rune_invalid_arguments_length"),
        (
            "let s = $state.snapshot();",
            "rune_invalid_arguments_length",
        ),
        ("$inspect();", "rune_invalid_arguments_length"),
        ("$inspect.trace(1, 2);", "rune_invalid_arguments_length"),
        ("let h = $host(1);", "rune_invalid_arguments"),
        ("let h = $host();", "host_invalid_placement"),
    ] {
        let source = format!("<script>{script}</script>");
        let component = rsvelte_svelte_syntax::parse::parse(&source).expect("valid syntax");
        let tree = compiler_syntax_tree::lower(&component, &source);
        let input =
            rsvelte_svelte_semantic::svelte_input(&component, &tree, &source, "test.svelte");
        let resolution = resolve::resolve(&component.javascript, component.program, &tree);
        let analysis = analyze::analyze(&input, &resolution);
        for target in [Target::Client, Target::Server] {
            let error = compile_input(&CompileInput::from(input), &resolution, &analysis, target)
                .expect_err("a misplaced rune");
            assert_eq!(error.code, code, "{script} on {target:?}");
        }
    }
}

#[test]
fn a_leading_byte_order_mark_still_counts_in_line_one_columns() {
    // A known deviation: upstream strips the mark before it parses, so its line-one columns are
    // one less (official 1:4 here). The line index is shared by every task, so this pins it.
    let source = "\u{feff}<p>{await x}</p>";
    let component = rsvelte_svelte_syntax::parse::parse(source).expect("valid syntax");
    let tree = compiler_syntax_tree::lower(&component, source);
    let input = rsvelte_svelte_semantic::svelte_input(&component, &tree, source, "test.svelte");
    let resolution = resolve::resolve(&component.javascript, component.program, &tree);
    let analysis = analyze::analyze(&input, &resolution);
    let error = compile_input(
        &CompileInput::from(input),
        &resolution,
        &analysis,
        Target::Client,
    )
    .expect_err("an await without async mode");
    assert_eq!(error.code, "experimental_async");
    let start = rsvelte_kernel::source::positions::LineIndex::new(source)
        .line_column(error.span.start_offset);
    assert_eq!((start.line, start.column), (1, 5));
}
