use super::*;

fn refusal(source_text: &str) -> (&'static str, Option<&str>) {
    refusal_with(source_text, &Options::default())
}

fn refusal_with<'s>(source_text: &'s str, options: &Options) -> (&'static str, Option<&'s str>) {
    let c = rsvelte_svelte_syntax::parse::parse(source_text).expect("parses");
    let u = format(&c, source_text, &LineIndex::new(source_text), options).expect_err("refused");
    (
        u.what,
        u.source_location.span().map(|s| s.text(source_text)),
    )
}

#[test]
fn a_refusal_points_at_the_construct() {
    assert_eq!(
        refusal("<p>a</p>\n<svelte:head><script>a</script></svelte:head>\n"),
        (
            "<script> or <style> inside an element",
            Some("<script>a</script>")
        )
    );
    assert_eq!(
        refusal("<script>\n\tlet a = { 'b': 1 };\n</script>\n"),
        ("quoted or numeric property key", Some("'b'"))
    );
    assert_eq!(
        refusal("{#each xs as {a: b = 1}}{b}{/each}\n"),
        (
            "a renamed property with a default in a block's pattern",
            Some("a: b = 1")
        )
    );
}

fn options(json: &str) -> Options {
    serde_json::from_str(json).expect("valid options")
}

#[test]
fn every_option_value_not_printed_yet_is_refused() {
    let cases = [
        (r#"{"semi": false}"#, "semi"),
        (r#"{"singleQuote": true}"#, "singleQuote"),
        (r#"{"quoteProps": "consistent"}"#, "quoteProps"),
        (r#"{"trailingComma": "es5"}"#, "trailingComma"),
        (r#"{"bracketSpacing": false}"#, "bracketSpacing"),
        (r#"{"objectWrap": "collapse"}"#, "objectWrap"),
        (r#"{"arrowParens": "avoid"}"#, "arrowParens"),
        (r#"{"rangeStart": 1}"#, "rangeStart"),
        (r#"{"rangeEnd": 10}"#, "rangeEnd"),
        (
            r#"{"experimentalTernaries": true}"#,
            "experimentalTernaries",
        ),
        (
            r#"{"experimentalOperatorPosition": "start"}"#,
            "experimentalOperatorPosition",
        ),
    ];
    assert_eq!(unported(&Options::default()), None);
    for (json, name) in cases {
        assert_eq!(unported(&options(json)), Some(name), "{json}");
    }
}

#[test]
fn print_width_and_tab_width_reach_the_output() {
    let source_text = "<div>\n<p>aaaa bbbb cccc dddd</p>\n</div>\n";
    let c = rsvelte_svelte_syntax::parse::parse(source_text).expect("parses");
    let lines = LineIndex::new(source_text);
    let print = |json: &str| format(&c, source_text, &lines, &options(json)).expect("prints");
    assert_eq!(print("{}"), "<div>\n  <p>aaaa bbbb cccc dddd</p>\n</div>\n");
    assert_eq!(
        print(r#"{"tabWidth": 3}"#),
        "<div>\n   <p>aaaa bbbb cccc dddd</p>\n</div>\n"
    );
    assert_eq!(
        print(r#"{"printWidth": 20}"#),
        "<div>\n  <p>\n    aaaa bbbb cccc\n    dddd\n  </p>\n</div>\n"
    );
}

fn formatted(source_text: &str) -> String {
    formatted_with(source_text, &Options::default())
}

fn formatted_with(source_text: &str, options: &Options) -> String {
    let c = rsvelte_svelte_syntax::parse::parse(source_text).expect("parses");
    format(&c, source_text, &LineIndex::new(source_text), options).expect("prints")
}

#[test]
fn the_source_is_trimmed_as_javascript_trims_and_keeps_its_byte_order_mark() {
    // Expected outputs from Prettier 3.9.10 with prettier-plugin-svelte 4.1.1.
    assert_eq!(
        formatted("\u{FEFF}<script>\n  let a = 1;\n</script>\n<p>a</p>\n"),
        "\u{FEFF}<script>\n  let a = 1;\n</script>\n\n<p>a</p>\n"
    );
    assert_eq!(
        formatted("\u{FEFF}  hello  <b>x</b>\n"),
        "\u{FEFF}hello <b>x</b>\n"
    );
    assert_eq!(formatted("\u{A0}<p>a</p>\u{A0}\n"), "<p>a</p>\n");
    assert_eq!(formatted("<p>a</p>\u{2028}\n\u{A0}\n"), "<p>a</p>\n");
}

#[test]
fn the_module_script_comes_before_the_instance_script() {
    assert_eq!(
        formatted(
            "<script>\n  let a = 1;\n</script>\n<script module>\n  let b = 1;\n</script>\n<p>a</p>\n"
        ),
        "<script module>\n  let b = 1;\n</script>\n\n<script>\n  let a = 1;\n</script>\n\n<p>a</p>\n"
    );
}

#[test]
fn a_block_pattern_upstream_would_change_or_throw_on_is_refused() {
    for (source_text, what) in [
        (
            "{#each xs as {a: b = 1}}{b}{/each}\n",
            "a renamed property with a default in a block's pattern",
        ),
        (
            "{#each xs as {a = f()}}{a}{/each}\n",
            "this part of a block's pattern",
        ),
        (
            "{#each xs as {[v]: v}}{v}{/each}\n",
            "a computed key named like its value",
        ),
        (
            "{#each xs as {'a': {b}}}{b}{/each}\n",
            "a quoted key before a nested pattern",
        ),
    ] {
        assert_eq!(refusal(source_text).0, what, "{source_text}");
    }
}

#[test]
fn a_block_pattern_prints_as_expand_node_does() {
    // Expected outputs from Prettier 3.9.10 with prettier-plugin-svelte 4.1.1.
    assert_eq!(
        formatted("{#each xs as {\"a-b\": c, [k]: v, ...rest}}{c}{/each}\n"),
        "{#each xs as { \"a-b\": c, [k]: v, ...rest }}{c}{/each}\n"
    );
    assert_eq!(
        formatted("{#each xs as [, b, ...c]}{b}{/each}\n"),
        "{#each xs as [, b, ...c]}{b}{/each}\n"
    );
    assert_eq!(
        formatted("{#await p then {a: [b]}}{b}{/await}\n"),
        "{#await p then { a: [b] }}{b}{/await}\n"
    );
}

#[test]
fn only_text_at_the_source_s_own_ends_is_trimmed_as_javascript_trims() {
    // Expected outputs from Prettier 3.9.10 with prettier-plugin-svelte 4.1.1.
    assert_eq!(
        formatted("<div/>\u{A0}\n<style>a{}</style>"),
        "<div />\n\u{A0}\n\n<style>\n  a {\n  }\n</style>\n"
    );
    assert_eq!(
        formatted("<script>let a</script>\u{A0}<div/>"),
        "<script>\n  let a;\n</script>\n\n\u{A0}\n<div />\n"
    );
    assert_eq!(
        formatted("<script module>let a</script>\u{A0}<script>let b</script>"),
        "<script module>\n  let a;\n</script>\n\n<script>\n  let b;\n</script>\n\n\u{A0}\n"
    );
}

#[test]
fn a_doctype_and_empty_inline_elements_print_as_the_plugin_prints_them() {
    assert_eq!(
        formatted("<!DOCTYPE html>\n<p>a</p>\n"),
        "<!DOCTYPE html>\n<p>a</p>\n"
    );
    assert_eq!(
        formatted("<span> </span>\n<b>\n</b>\n"),
        "<span> </span>\n<b> </b>\n"
    );
}

#[test]
fn what_the_template_printer_cannot_place_yet_is_refused() {
    assert_eq!(
        refusal("<div><script>a</script></div>\n").0,
        "<script> or <style> inside an element"
    );
    assert_eq!(
        refusal("<p>{/* a */ x}</p>\n"),
        ("comments in the template's JavaScript", Some("/* a */"))
    );
}

#[test]
fn a_root_assignment_or_sequence_keeps_the_parentheses_the_plugin_wraps_it_in() {
    // Expected outputs from Prettier 3.9.10 with prettier-plugin-svelte 4.1.1.
    assert_eq!(formatted("<b>{a = b}</b>\n"), "<b>{(a = b)}</b>\n");
    assert_eq!(
        formatted("<b on:click={a += 1}></b>\n"),
        "<b on:click={(a += 1)}></b>\n"
    );
    assert_eq!(formatted("<b>{a, b}</b>\n"), "<b>{(a, b)}</b>\n");
    assert_eq!(
        formatted("<input bind:value={a, b} />\n"),
        "<input bind:value={a, b} />\n"
    );
}

#[test]
fn modifiers_the_plugin_would_drop_are_refused() {
    for source_text in [
        "<div use:a|x={b}></div>\n",
        "<div bind:value|x={v}></div>\n",
        "<div class:a|x={b}></div>\n",
        "<div animate:a|x></div>\n",
        "<div let:a|x></div>\n",
    ] {
        assert_eq!(
            refusal(source_text).0,
            "modifiers on this directive",
            "{source_text}"
        );
    }
}

#[test]
fn typescript_in_blocks_matches_the_plugin() {
    // Expected outputs from Prettier 3.9.10 with prettier-plugin-svelte 4.1.1.
    let typescript = "<script lang=\"ts\"></script>\n\n";
    for (input, expected) in [
        (
            "{#each items as item: Item, i}x{/each}\n",
            "{#each items as item: Item, i}x{/each}\n",
        ),
        (
            "{#await p then v: number}x{/await}\n",
            "{#await p then v: number}x{/await}\n",
        ),
        // A typed declarator does not parse as the plugin wraps it, so it prints as written.
        (
            "{#if x}\n  {@const a:number=1}\n{/if}\n",
            "{#if x}\n  {@const a:number=1}\n{/if}\n",
        ),
        (
            "{#if x}\n  {@const a = 1 as number}\n{/if}\n",
            "{#if x}\n  {@const a = 1 as number}\n{/if}\n",
        ),
        ("{let a = 1;}\n", "{let a = 1}\n"),
        ("{let a}\n", "{let a;}\n"),
        ("{let a;}\n", "{let a;}\n"),
    ] {
        assert_eq!(
            formatted(&format!("{typescript}{input}")),
            format!("{typescript}{expected}"),
            "{input}"
        );
    }
    assert_eq!(
        refusal(&format!(
            "{typescript}{{#snippet f<T>(a: T)}}x{{/snippet}}\n"
        ))
        .0,
        "a snippet's type parameters"
    );
    assert_eq!(
        refusal("{#each xs as {...{a}}}x{/each}\n").0,
        "a pattern after `...` in an object pattern"
    );
}

#[test]
fn svelte_elements_options_and_sort_orders_match_the_plugin() {
    // Expected outputs from Prettier 3.9.10 with prettier-plugin-svelte 4.1.1.
    for (input, expected) in [
        ("<svelte:window></svelte:window>\n", "<svelte:window />\n"),
        (
            "<svelte:head></svelte:head>\n",
            "<svelte:head></svelte:head>\n",
        ),
        (
            "<svelte:element class=\"a\" this={'div'} />\n",
            "<svelte:element this={\"div\"} class=\"a\" />\n",
        ),
        (
            "<svelte:element this={ 'div' } />\n",
            "<svelte:element this=\"div\" />\n",
        ),
        (
            "<svelte:element this=div />\n",
            "<svelte:element this=\"div\" />\n",
        ),
        (
            "<svelte:component a=\"1\" this={C} />\n",
            "<svelte:component this={C} a=\"1\" />\n",
        ),
        (
            "<p>x</p>\n<!-- c -->\n<svelte:options runes />\n",
            "<!-- c -->\n<svelte:options runes />\n\n<p>x</p>\n",
        ),
    ] {
        assert_eq!(formatted(input), expected, "{input}");
    }
    let sc = "<script>\n  let a;\n</script>\n";
    let none = options(r#"{"svelteSortOrder": "none"}"#);
    let markup_first = options(r#"{"svelteSortOrder": "markup-styles-scripts-options"}"#);
    let input = format!("{sc}<svelte:options runes />\n<p>x</p>\n");
    assert_eq!(
        formatted_with(&input, &markup_first),
        format!("<p>x</p>\n\n{sc}\n<svelte:options runes />\n")
    );
    let input = format!("<p>x</p>\n{sc}<p>y</p>\n");
    assert_eq!(formatted_with(&input, &none), input);
    // The plugin drops a part that has no markup to stand next to, and repeats one here.
    for input in [
        sc.to_owned(),
        "<p>a</p><script>let a</script><style>p{}</style>\n".to_owned(),
    ] {
        assert_eq!(
            refusal_with(&input, &none).0,
            "a <script> or <style> that `svelteSortOrder: none` drops or repeats",
            "{input}"
        );
    }
}

/// Expected outputs from prettier-plugin-svelte 4.1.1 with default options.
#[test]
fn pre_content_and_written_names_print_as_written() {
    for source_text in [
        "<pre style:color=\"a   b\"></pre>\n",
        "<pre><span style:color=\"a   b\">x</span></pre>\n",
        "<pre>{#if a}<div>a</div><div>x</div>{/if}</pre>\n",
        "<div class:foo-bar></div>\n",
        "<div class:a.b></div>\n",
        "<div class:a style:a xlink:href=\"x\" href=\"y\"></div>\n",
    ] {
        assert_eq!(formatted(source_text), source_text);
    }
}

/// Svelte rejects each of these; the formatter must not print them.
#[test]
fn what_svelte_rejects_is_refused() {
    assert_eq!(
        refusal("<svelte:head></svelte:head><svelte:head></svelte:head>\n").0,
        "a root-only `svelte:` tag twice"
    );
    assert_eq!(
        refusal("<div a=\"1\" a=\"2\"></div>\n"),
        ("an attribute named twice", Some("a=\"2\""))
    );
    assert_eq!(
        refusal("<div bind:value={x} value={y}></div>\n").0,
        "an attribute named twice"
    );
    assert_eq!(
        refusal("<svelte:options runes>\n</svelte:options>\n").0,
        "`<svelte:options>` with children"
    );
    for source_text in [
        "<svelte:options runes=\"true\" />\n",
        "<svelte:options foo />\n",
        "<svelte:options customElement=\"myel\" />\n",
        "<svelte:options customElement=\"font-face\" />\n",
        "<svelte:options namespace=\"foo\" />\n",
        "<svelte:options tag=\"my-el\" />\n",
        "<svelte:options bind:runes />\n",
        "<svelte:options customElement={{ tag: \"myel\" }} />\n",
        "<svelte:options customElement={{ tag }} />\n",
        "<svelte:options customElement={{ [a]: 1 }} />\n",
        "<svelte:options customElement={{ shadow: \"closed\" }} />\n",
        "<svelte:options customElement={{ props: { a: { type: \"Date\" } } }} />\n",
        "<svelte:options customElement={{ props: { a: 1 } }} />\n",
        "<svelte:options customElement={x} />\n",
        "<svelte:options customElement />\n",
    ] {
        assert_eq!(
            refusal(source_text).0,
            "a `<svelte:options>` attribute Svelte may reject",
            "{source_text}"
        );
    }
    for source_text in [
        "<svelte:options runes={false} immutable accessors={true} preserveWhitespace />\n",
        "<svelte:options namespace=\"svg\" css=\"injected\" customElement=\"my-el\" />\n",
        "<svelte:options namespace={\"html\"} />\n",
        "<svelte:options customElement={null} />\n",
        "<svelte:options customElement={{ shadow: { mode: \"open\" } }} />\n",
    ] {
        assert_eq!(formatted(source_text), source_text);
    }
}

/// The `<title>` group fits only because the binary expression after it would break, a layout
/// the expression printer does not build: Prettier prints `<title>x</title>{a +\n  b}`.
#[test]
fn a_fit_that_needs_an_unbuilt_broken_layout_is_refused() {
    let options = options(r#"{"printWidth": 20}"#);
    assert_eq!(
        refusal_with("<title>x</title>{a + b}\n", &options).0,
        "a layout that does not fit on one line"
    );
}

mod review;
