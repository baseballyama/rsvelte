use super::*;

fn refusal(source_text: &str) -> (&'static str, Option<&str>) {
    refusal_with(source_text, &Options::default())
}

fn refusal_with<'s>(source_text: &'s str, options: &Options) -> (&'static str, Option<&'s str>) {
    // The plugin throws on what the parsers reject too.
    let c = match rsvelte_svelte_syntax::parse::parse(source_text) {
        Ok(c) => c,
        Err(d) => return ("a syntax error", Some(d.span.text(source_text))),
    };
    let u =
        format(&c, source_text, options, rejected(&c, source_text).as_ref()).expect_err("refused");
    (
        u.what,
        u.source_location.span().map(|s| s.text(source_text)),
    )
}

#[test]
fn a_refusal_points_at_the_construct() {
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
    let print = |json: &str| format(&c, source_text, &options(json), None).expect("prints");
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
    format(&c, source_text, options, rejected(&c, source_text).as_ref()).expect("prints")
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
            "<script>\n  let a = 1;\n</script>\n<script module>\n  let b = \
                1;\n</script>\n<p>a</p>\n"
        ),
        "<script module>\n  let b = 1;\n</script>\n\n<script>\n  let a = \
            1;\n</script>\n\n<p>a</p>\n"
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
        refusal("<svelte:element this={/* a */ t}></svelte:element>\n"),
        ("comments in the template's JavaScript", Some("/* a */"))
    );
}

#[test]
fn a_template_expression_keeps_the_comments_before_it_and_drops_those_after() {
    // Expected outputs from Prettier 3.9.10 with prettier-plugin-svelte 4.1.1.
    assert_eq!(formatted("<p>{/* a */ x}</p>\n"), "<p>{/* a */ x}</p>\n");
    assert_eq!(formatted("<p>{x /* a */}</p>\n"), "<p>{x}</p>\n");
    assert_eq!(
        formatted("<p title={// a\nx}></p>\n"),
        "<p\n  title={// a\n  x}\n></p>\n"
    );
    assert_eq!(
        formatted("{#if /* a */ x /* b */}<p></p>{/if}\n"),
        "{#if /* a */ x}<p></p>{/if}\n"
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
            "{#if x}\n  {@const {a}: {a:number} = b}\n{/if}\n",
            "{#if x}\n  {@const {a}: {a:number} = b}\n{/if}\n",
        ),
        // TypeScript in the value parses, so it is formatted.
        (
            "{#if x}\n  {@const a=1  as   number}\n{/if}\n",
            "{#if x}\n  {@const a = 1 as number}\n{/if}\n",
        ),
        (
            "{#if x}\n  {@const a = b satisfies   C}\n{/if}\n",
            "{#if x}\n  {@const a = b satisfies C}\n{/if}\n",
        ),
        (
            "{#if x}\n  {@const prevStoryWithCategory = index > 0 ? (displayedStories[index - 1] \
                as StoryWithCategory) : null}\n{/if}\n",
            "{#if x}\n  {@const prevStoryWithCategory =\n    index > 0 ? (displayedStories[index - \
                1] as StoryWithCategory) : null}\n{/if}\n",
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
    // Expected output from Prettier 3.9.10 with prettier-plugin-svelte 4.1.1.
    assert_eq!(
        formatted("<script lang=\"ts\"></script>\n{#snippet s<T,U>(a)}x{/snippet}\n"),
        "<script lang=\"ts\"></script>\n\n{#snippet s<T, U>(a)}x{/snippet}\n"
    );
    assert_eq!(
        refusal("{#each xs as {...{a}}}x{/each}\n").0,
        "a syntax error"
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
        "a syntax error"
    );
    assert_eq!(
        refusal("<svelte:options runes>\n</svelte:options>\n").0,
        "a syntax error"
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
        assert_eq!(refusal(source_text).0, "a syntax error", "{source_text}");
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
mod review;

#[test]
fn prettier_ignore_keeps_the_next_sibling_as_the_plugin_does() {
    // An ignored comment is itself the node kept, so the element after it is formatted.
    assert_eq!(
        formatted(
            "<!-- prettier-ignore -->\n<!-- prettier-ignore -->\n<div   a=\"1\"   >x</div>\n"
        ),
        "<!-- prettier-ignore -->\n<!-- prettier-ignore -->\n<div a=\"1\">x</div>\n"
    );
    // Text that is not blank is the next node, kept with its own spaces.
    assert_eq!(
        formatted("<p><!-- prettier-ignore -->  text   here  <b   >x</b></p>\n"),
        "<p><!-- prettier-ignore -->  text   here   <b>x</b></p>\n"
    );
    // The kept source has the `\n` line endings Prettier reads.
    assert_eq!(
        formatted(
            "<!-- prettier-ignore -->\r\n<div\r\n      a=\"1\"   >x</div>\r\n<p   >y</p>\r\n"
        ),
        "<!-- prettier-ignore -->\n<div\n      a=\"1\"   >x</div>\n<p>y</p>\n"
    );
    // A deviation: the plugin keeps `<p>` as written here, which the comment does not precede.
    assert_eq!(
        formatted("<div><!-- prettier-ignore --></div>\n<p   class=\"a\"   >x</p>\n"),
        "<div><!-- prettier-ignore --></div>\n<p class=\"a\">x</p>\n"
    );
}

#[test]
fn a_script_or_style_inside_an_element_is_embedded_as_the_plugin_embeds_it() {
    for (input, expected) in [
        (
            "<p>a</p>\n<svelte:head><script>a</script></svelte:head>\n",
            "<p>a</p>\n<svelte:head\n  ><script>\n    a;\n  </script></svelte:head\n>\n",
        ),
        (
            "<div><style>p {\ncolor:red}</style></div>\n",
            "<div>\n  <style>\n    p {\n      color: red;\n    }\n  </style>\n</div>\n",
        ),
        (
            "<svelte:head><script src={url} defer></script></svelte:head>\n",
            "<svelte:head><script src={url} defer></script></svelte:head>\n",
        ),
        // A `prettier-ignore` comment keeps the body, which the plugin prints on literal lines.
        (
            "<div>\n<!-- prettier-ignore -->\n<script>a  =  1</script>\n</div>\n",
            "<div>\n  <!-- prettier-ignore -->\n  <script>\na  =  1\n  </script>\n</div>\n",
        ),
        (
            "<div><style lang=\"stylus\">p\n  color red</style></div>\n",
            "<div>\n  <style lang=\"stylus\">\np\n  color red\n  </style>\n</div>\n",
        ),
        (
            "<div><script type=\"text/typescript\">let a:number=1</script></div>\n",
            "<div>\n  <script type=\"text/typescript\">\n    let a: number = 1;\n  \
                </script>\n</div>\n",
        ),
        (
            "<div><style lang=\"scss\">p {\na {\ncolor:red}}</style></div>\n",
            "<div>\n  <style lang=\"scss\">\n    p {\n      a {\n        color: red;\n      }\n    \
                }\n  </style>\n</div>\n",
        ),
    ] {
        assert_eq!(formatted(input), expected, "{input:?}");
    }
}

#[test]
fn a_script_babel_rejects_is_kept_as_written_and_the_rest_formatted() {
    // Expected output from Prettier 3.9.10 with prettier-plugin-svelte 4.1.1.
    let script = "<script>\n\tfunction f() { continue; }\n\tlet   x =  1\n</script>\n";
    assert_eq!(
        formatted(&format!("{script}<div   class=\"a\"  >{{x+1}}</div>\n")),
        format!("{script}\n<div class=\"a\">{{x + 1}}</div>\n")
    );
    // Prettier's TypeScript parser recovers, and the port does not know what it prints.
    assert_eq!(
        refusal("<script lang=\"ts\">\n\tfunction f() { continue; }\n</script>\n<p>x</p>\n").0,
        "code a module rejects"
    );
}

#[test]
fn a_lone_carriage_return_is_a_line_break_as_prettier_reads_it() {
    // Expected outputs from Prettier 3.9.10 with prettier-plugin-svelte 4.1.1.
    assert_eq!(
        formatted("<script>\rlet a=1\r</script>\r<p>{a}</p>\r"),
        "<script>\n  let a = 1;\n</script>\n\n<p>{a}</p>\n"
    );
    let auto = options(r#"{"endOfLine": "auto"}"#);
    assert_eq!(
        formatted_with("<p>a</p>\r<p>b</p>\r", &auto),
        "<p>a</p>\r<p>b</p>\r"
    );
    assert_eq!(
        formatted_with("<p>a</p>\r\n<p>b</p>\r<i>c</i>\n", &auto),
        "<p>a</p>\r\n<p>b</p>\r\n<i>c</i>\r\n"
    );
}
