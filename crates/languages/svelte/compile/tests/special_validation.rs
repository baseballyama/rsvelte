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
        let resolution = resolve::resolve(
            &component.javascript,
            component.instance.as_ref().map(|s| s.program),
            component.module.as_ref().map(|s| s.program),
            &tree,
        );
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
        ("$inspect.trace();", "inspect_trace_invalid_placement"),
        (
            "function f() { let a = 1; $inspect.trace(); }",
            "inspect_trace_invalid_placement",
        ),
        (
            "function* g() { $inspect.trace(); }",
            "inspect_trace_generator",
        ),
        ("function f() { $inspect.trace(); }", "unsupported"),
        ("let { a: { b } } = $props();", "props_invalid_pattern"),
        ("let { [k]: a } = $props();", "props_invalid_pattern"),
        ("let { a: [b] = [] } = $props();", "props_invalid_pattern"),
        (
            "let { a: { b = $bindable() } } = $props();",
            "props_invalid_pattern",
        ),
        ("let [a] = $props();", "props_invalid_identifier"),
        ("class K extends (await x) {}", "experimental_async"),
    ] {
        raises_on_both_targets(script, code);
    }
}

/// Upstream's class body checks: a state rune is a field or a constructor's first assignment.
#[test]
fn runes_in_a_class_body_raise_upstream_errors_on_both_targets() {
    for (script, code) in [
        ("class K { [await 1] = 2; }", "experimental_async"),
        (
            "class K { static x = $state(1); }",
            "state_invalid_placement",
        ),
        ("class K { [k] = $state(1); }", "state_invalid_placement"),
        (
            "class K { m() { this.x = $state(1); } }",
            "state_invalid_placement",
        ),
        (
            "class K { constructor() { if (1) this.x = $state(1); } }",
            "state_invalid_placement",
        ),
        (
            "class K { constructor() { this.x.y = $state(1); } }",
            "state_invalid_placement",
        ),
        (
            "class K { constructor() { this.x += $state(1); } }",
            "state_invalid_placement",
        ),
        (
            "class K { m() { return { a: $state(1) }; } }",
            "state_invalid_placement",
        ),
        (
            "class K { ['constructor']() { this.x = $state(1); } }",
            "state_invalid_placement",
        ),
        (
            "class K { x = $state(1); x = $state(2); }",
            "state_field_duplicate",
        ),
        (
            "class K { constructor() { this.x = $state(1); this.x = $state(2); } }",
            "state_field_duplicate",
        ),
        ("class K { x; x = $state(1); }", "duplicate_class_field"),
        (
            "class K { get x() {} x = $state(1); }",
            "duplicate_class_field",
        ),
        (
            "class K { x = 1; constructor() { this.x = $state(1); } }",
            "duplicate_class_field",
        ),
        (
            "class K { static x() {} static x() {} }",
            "duplicate_class_field",
        ),
        (
            "class K { constructor() { this.x = 1; this.x = $state(1); } }",
            "state_field_invalid_assignment",
        ),
        (
            "class K { constructor() { this.x++; this.x = $state(1); } }",
            "state_field_invalid_assignment",
        ),
    ] {
        raises_on_both_targets(script, code);
    }
}

fn raises_on_both_targets(script: &str, code: &str) {
    let source = format!("<script>{script}</script>");
    let component = rsvelte_svelte_syntax::parse::parse(&source).expect("valid syntax");
    let tree = compiler_syntax_tree::lower(&component, &source);
    let input = rsvelte_svelte_semantic::svelte_input(&component, &tree, &source, "test.svelte");
    let resolution = resolve::resolve(
        &component.javascript,
        component.instance.as_ref().map(|s| s.program),
        component.module.as_ref().map(|s| s.program),
        &tree,
    );
    let analysis = analyze::analyze(&input, &resolution);
    for target in [Target::Client, Target::Server] {
        let error = compile_input(&CompileInput::from(input), &resolution, &analysis, target)
            .expect_err("a misplaced rune");
        assert_eq!(error.code, code, "{script} on {target:?}");
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
    let resolution = resolve::resolve(
        &component.javascript,
        component.instance.as_ref().map(|s| s.program),
        component.module.as_ref().map(|s| s.program),
        &tree,
    );
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

fn compiled(source: &str) -> Result<(), rsvelte_kernel::diagnostics::Diagnostic> {
    let component = rsvelte_svelte_syntax::parse::parse(source)?;
    let tree = compiler_syntax_tree::lower(&component, source);
    let input = rsvelte_svelte_semantic::svelte_input(&component, &tree, source, "test.svelte");
    let resolution = resolve::resolve(
        &component.javascript,
        component.instance.as_ref().map(|s| s.program),
        component.module.as_ref().map(|s| s.program),
        &tree,
    );
    let analysis = analyze::analyze(&input, &resolution);
    compile_input(
        &CompileInput::from(input),
        &resolution,
        &analysis,
        Target::Client,
    )
    .map(|_| ())
}

/// Each span and message is the official compiler's.
#[test]
fn a_tree_the_browser_would_repair_raises_node_invalid_placement() {
    for (source, span, message) in [
        (
            "<table><tr><td>a</td></tr></table>",
            (7, 26),
            "`<tr>` cannot be a child of `<table>`. `<table>` only allows these children: `<caption>`, `<colgroup>`, `<tbody>`, `<thead>`, `<tfoot>`, `<style>`, `<script>`, `<template>`",
        ),
        (
            "<p><span><div>a</div></span></p>",
            (9, 21),
            "`<div>` cannot be a descendant of `<p>`",
        ),
        (
            "<dt><span><dd>a</dd></span></dt>",
            (10, 20),
            "`<dd>` cannot be a descendant of `<dt>`",
        ),
        (
            "<p><my-el><div></div></my-el></p>",
            (10, 21),
            "`<div>` cannot be a descendant of `<p>`",
        ),
        (
            "<p><svelte:boundary><div></div></svelte:boundary></p>",
            (20, 31),
            "`<div>` cannot be a child of `<p>`",
        ),
        (
            "<table>{#if x}text{/if}</table>",
            (14, 18),
            "`<#text>` cannot be a child of `<table>`",
        ),
        (
            "<tr>{x}</tr>",
            (4, 7),
            "`<#text>` cannot be a child of `<tr>`",
        ),
        (
            "<div><td></td></div>",
            (5, 14),
            "`<td>` must be the child of a `<tr>`, not a `<div>`",
        ),
        (
            "<div><caption></caption></div>",
            (5, 24),
            "`<caption>` cannot be a child of `<div>`",
        ),
    ] {
        let error = compiled(source).expect_err(source);
        assert_eq!(error.code, "node_invalid_placement", "{source}");
        assert_eq!(
            (error.span.start_offset, error.span.end_offset),
            span,
            "{source}"
        );
        assert!(
            error.message.starts_with(message),
            "{source}: {}",
            error.message
        );
    }
    // A block makes upstream only warn; a `<dl>` or a custom element allows `<dt>` again.
    for source in [
        "<table><tbody><tr><td>a</td></tr></tbody></table>",
        "<table>{#if x}<tr><td>a</td></tr>{/if}</table>",
        "<p><span>{#if x}<div>a</div>{/if}</span></p>",
        "<dl><dt><dl><dt>a</dt></dl></dt></dl>",
        "<dt><my-el><dd>a</dd></my-el></dt>",
        "<dt><dl><span><dd>a</dd></span></dl></dt>",
        "<a><svelte:element this=\"b\"><a>x</a></svelte:element></a>",
        "<table> </table>",
        "<table>&#32;</table>",
    ] {
        compiled(source).unwrap_or_else(|error| panic!("{source}: {error:?}"));
    }
}

/// Official 5.57.3: the whole block is named, and other rune names pass.
#[test]
fn an_each_context_named_state_or_derived_raises_state_invalid_placement() {
    for (source, end) in [
        ("{#each a as $state}{/each}", 26),
        ("{#each a as $derived, i}{/each}", 31),
    ] {
        let error = compiled(source).expect_err(source);
        assert_eq!(error.code, "state_invalid_placement", "{source}");
        assert_eq!(
            (error.span.start_offset, error.span.end_offset),
            (0, end),
            "{source}"
        );
    }
    for source in [
        "{#each a as $effect}{/each}",
        "{#each a as x, $state}{/each}",
    ] {
        compiled(source).unwrap_or_else(|error| panic!("{source}: {error:?}"));
    }
}
