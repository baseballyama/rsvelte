//! Shapes found by differential reviews against the oracle.

use super::*;

/// Expected outputs from prettier-plugin-svelte 4.1.1.
#[test]
fn review_d_shapes_print_as_the_plugin_prints_them() {
    // A block whose first child starts with a character wider than a byte.
    assert_eq!(formatted("{#if a}é{/if}\n"), "{#if a}é{/if}\n");
    // Prettier reads `\r\n` as `\n` before it formats, comments included.
    assert_eq!(formatted("<!-- a\r\n  b\r\n-->\r\n"), "<!-- a\n  b\n-->\n");
    assert_eq!(
        formatted_with(
            "<!-- a\r\n  b\r\n-->\r\n",
            &options(r#"{"endOfLine": "crlf"}"#)
        ),
        "<!-- a\r\n  b\r\n-->\r\n"
    );
    // A line break in a template literal breaks the groups around it.
    assert_eq!(
        formatted("<p>{`a\n  b`}</p>\n"),
        "<p>\n  {`a\n  b`}\n</p>\n"
    );
    // "off" skips `embed`, where `bind:` values get their softlines.
    assert_eq!(
        formatted_with(
            "<div bind:value={v}></div>\n",
            &options(r#"{"printWidth": 10, "embeddedLanguageFormatting": "off"}"#)
        ),
        "<div\n  bind:value={v}\n></div>\n"
    );
    assert_eq!(
        formatted("{#if a && b || c}x{/if}\n"),
        "{#if (a && b) || c}x{/if}\n"
    );
}

/// Each of these prints otherwise under the plugin (or fails there), in a way not ported.
#[test]
fn review_d_shapes_the_port_cannot_print_are_refused() {
    let off = options(r#"{"embeddedLanguageFormatting": "off"}"#);
    let refused: Vec<&str> = [
        ("<p>{9007199254740993}</p>\n", &off),
        (
            "<p>x</p>\n<script>\n  let a;\n</script><!-- #ENDREGION -->\n<p>y</p>\n",
            &Options::default(),
        ),
        (
            "<script lang=\"json\">\n  'a'\n</script>\n",
            &Options::default(),
        ),
        (
            "<script type=\"importmap\">\n  [1]\n</script>\n",
            &Options::default(),
        ),
        ("<p>{007}</p>\n", &Options::default()),
        ("<p>{a ?? b || c}</p>\n", &Options::default()),
        ("<p>{a || (b || c)}</p>\n", &Options::default()),
        ("<p>👋🏽</p>\n", &Options::default()),
        // Collapsing whitespace would reach inside the string.
        (
            "<style>\n  a {\n    content: \"a  b\";\n  }\n</style>\n",
            &Options::default(),
        ),
        // Prettier breaks every argument; the hugged layout does not fit.
        (
            "{array.map((item) => {\n  return item + 1\n})}\n",
            &options(r#"{"printWidth": 16}"#),
        ),
    ]
    .iter()
    .map(|(source_text, options)| refusal_with(source_text, options).0)
    .collect();
    assert_eq!(
        refused,
        [
            "an expression that `embeddedLanguageFormatting: off` cannot print",
            "comments attached to <script> or <style>",
            "a script language other than JavaScript",
            "a script language other than JavaScript",
            "a legacy octal number",
            "`??` mixed with `||` or `&&` without parentheses",
            "a logical expression nested on the right of the same operator",
            "an emoji sequence, which Prettier measures as one character",
            "CSS that prettier rewrites",
            "a layout that does not fit on one line",
        ]
    );
}

/// Expected outputs from prettier-plugin-svelte 4.1.1.
#[test]
fn review_e_shapes_print_as_the_plugin_prints_them() {
    for (source_text, want) in [
        ("<p>{1..toString()}</p>\n", "<p>{(1).toString()}</p>\n"),
        ("<p>{1_0.5_0}</p>\n", "<p>{1_0.5_0}</p>\n"),
        (
            "<style>\n  p {\n    a: 1;\n\n\n    b: 2;\n    .x {\n      c: 1;\n    }\n    d: 3;\n  }\n</style>\n",
            "<style>\n  p {\n    a: 1;\n\n    b: 2;\n    .x {\n      c: 1;\n    }\n    d: 3;\n  }\n</style>\n",
        ),
        (
            "<script>\n  setTimeout(function () { return 1; }, x + y);\n</script>\n",
            "<script>\n  setTimeout(function () {\n    return 1;\n  }, x + y);\n</script>\n",
        ),
        ("<p>{f(a = 1)}</p>\n", "<p>{f((a = 1))}</p>\n"),
        (
            "<p>{a ? b ? c : d : e}</p>\n",
            "<p>{a ? (b ? c : d) : e}</p>\n",
        ),
        ("<p>{(a ?? b) ? c : d}</p>\n", "<p>{(a ?? b) ? c : d}</p>\n"),
        ("<p>{`${a, b}`}</p>\n", "<p>{`${(a, b)}`}</p>\n"),
        (
            "<script>\n  \"use strict\";\n  (\"s\");\n</script>\n",
            "<script>\n  \"use strict\";\n  (\"s\");\n</script>\n",
        ),
        ("<p>{(!a) in b}</p>\n", "<p>{(!a) in b}</p>\n"),
        (
            "<p>{f(() => a, () => b)}</p>\n",
            "<p>\n  {f(\n    () => a,\n    () => b,\n  )}\n</p>\n",
        ),
        ("<p>{f(`x\ny`)}</p>\n", "<p>\n  {f(`x\ny`)}\n</p>\n"),
    ] {
        assert_eq!(formatted(source_text), want, "{source_text:?}");
    }
}

/// The plugin throws on these, or prints them in a layout not ported.
#[test]
fn review_e_shapes_the_port_cannot_print_are_refused() {
    for source_text in [
        "<script lang=\"ts\" lang=\"ts\">\n  let a;\n</script>\n",
        "<p>{\"\\8\"}</p>\n",
        "<p>{static}</p>\n",
        "<p>{a?.b = 1}</p>\n",
        "<p>{-x ** 2}</p>\n",
        "<p>{await -1}</p>\n",
        "<p>{a || `x\ny`}</p>\n",
        "{#if z}{@const q = a = b}{q}{/if}\n",
        "{#if f(someQuiteLongIdentifierNumberOne + someQuiteLongIdentifierNumberOne, [a, b])}y{/if}\n",
        "<style>\n  @document url(http://a.b) {\n    a {\n      b: 1;\n    }\n  }\n</style>\n",
    ] {
        refusal_with(source_text, &Options::default());
    }
}

/// Hugging the last argument while another breaks puts every argument out, and in a block's head
/// that opens with a space (prettier-plugin-svelte 4.1.1).
#[test]
fn every_argument_out_keeps_its_spaces_in_a_head() {
    assert_eq!(
        formatted_with(
            "{#if f(`x\ny`, () => {})}y{/if}\n",
            &options(r#"{"printWidth": 30}"#)
        ),
        "{#if f( `x\ny`, () => {} )}y{/if}\n"
    );
}

/// Prettier prints these chains expanded, and these heads with a layout's indent; neither is built.
#[test]
fn expanded_chains_and_broken_properties_in_heads_are_refused() {
    let narrow = options(r#"{"printWidth": 30}"#);
    for source_text in [
        "{#key items >> someLongIdentifierName.b(1).x.i(~anotherQuiteLongVariableName(`a ${b} c`, items))}k{/key}\n",
        "{#await { k: obj.props((a) => { x; }) }}\n  w\n{/await}\n",
        "<script>\n  promise.then((a) => {\n    x;\n  }).then(b).catch(c);\n</script>\n",
    ] {
        refusal_with(source_text, &narrow);
    }
}

/// A comparison right after a cast ends the type instead of being read as its type arguments.
#[test]
fn a_comparison_after_a_cast_parses() {
    for source_text in [
        "<script lang=\"ts\">\n  a as T < c;\n</script>\n",
        "<script lang=\"ts\">\n  a as T > c;\n</script>\n",
        "<script lang=\"ts\">\n  let a = b satisfies { a: string } < c;\n</script>\n",
    ] {
        refusal_with(source_text, &Options::default());
    }
}

/// Shapes a differential review found printed wrong; outputs from Prettier 3.9.10 with
/// prettier-plugin-svelte 4.1.1.
#[test]
fn review_f_shapes_print_as_prettier_does() {
    for (source_text, expected) in [
        (
            "<script>\n  function* g() {}\n</script>\n",
            "<script>\n  function* g() {}\n</script>\n",
        ),
        (
            "<script>\n  let g = async function* () {};\n</script>\n",
            "<script>\n  let g = async function* () {};\n</script>\n",
        ),
        (
            "<script>\n  (function () { x; });\n</script>\n",
            "<script>\n  (function () {\n    x;\n  });\n</script>\n",
        ),
        (
            "<script>\n  ({ a: function () { x; } }).a();\n</script>\n",
            "<script>\n  ({\n    a: function () {\n      x;\n    },\n  }).a();\n</script>\n",
        ),
        (
            "<script>\n  let f = function () {}.bind(this);\n</script>\n",
            "<script>\n  let f = function () {}.bind(this);\n</script>\n",
        ),
        (
            "<script>\n  if (a) \"x\";\n</script>\n",
            "<script>\n  if (a) \"x\";\n</script>\n",
        ),
        (
            "<script>\n  new (a())();\n</script>\n",
            "<script>\n  new (a())();\n</script>\n",
        ),
        (
            "<script>\n  new (a().b)();\n</script>\n",
            "<script>\n  new (a().b)();\n</script>\n",
        ),
        (
            "<script>\n  (a?.b).c;\n</script>\n",
            "<script>\n  (a?.b).c;\n</script>\n",
        ),
        (
            "<script>\n  f(\"a\\\nb\");\n</script>\n",
            "<script>\n  f(\n    \"a\\\nb\",\n  );\n</script>\n",
        ),
        (
            "<style>\n  a {\n    > b {\n      color: red;\n    }\n  }\n</style>\n",
            "<style>\n  a {\n    > b {\n      color: red;\n    }\n  }\n</style>\n",
        ),
    ] {
        assert_eq!(formatted(source_text), expected, "{source_text:?}");
    }
}

/// Layouts and inputs the formatter does not build, and JavaScript a module rejects.
#[test]
fn review_f_shapes_are_refused() {
    for source_text in [
        "<script lang=\"ts\">\n  [...(a as T)];\n</script>\n",
        "<script lang=\"ts\">\n  (a as T)!;\n</script>\n",
        "<script>\n  it(\"x\", function () { a(); }, 1000);\n</script>\n",
        "<script lang=\"ts\">\n  function f(a: { k: T }) {}\n</script>\n",
        "<script>\n  let s = `\n\t\tnext ${() => { x; }} post`;\n</script>\n",
        "<script>\n  let x = this.a[() => { x; }];\n</script>\n",
        "<script>\n  let true = 1;\n</script>\n",
        "<script>\n  [a?.b] = c;\n</script>\n",
        "<script>\n  ({a}) = 1;\n</script>\n",
        "<script>\n  if (a) let x = 1;\n</script>\n",
        "<script>\n  [...a = 1] = b;\n</script>\n",
        "<script>\n  let x = (a, ...b, c) => 1;\n</script>\n",
        "<button onclick={() => { let a; let a; }}>b</button>\n",
        "<p>{(a, { a }) => 1}</p>\n",
        "{eval = 1}\n",
        "<script lang=\"ts\">\n  f(user!.pppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp);\n</script>\n",
        "<script>\n  let x = Foo.API[0].bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb;\n</script>\n",
    ] {
        refusal(source_text);
    }
}

/// Corpus files that printed otherwise; expected outputs from prettier-plugin-svelte 4.1.1.
#[test]
fn corpus_shapes_print_as_the_plugin_prints_them() {
    for (source_text, want) in [
        (
            "<script lang=\"ts\">\n  let { a, b }: {\n a: string; b: number } = $props();\n</script>\n",
            "<script lang=\"ts\">\n  let {\n    a,\n    b,\n  }: {\n    a: string;\n    b: number;\n  } = $props();\n</script>\n",
        ),
        (
            "<script>\n  import {} from \"svelte\";\n</script>\n",
            "<script>\n  import {} from \"svelte\";\n</script>\n",
        ),
        (
            "<script lang=\"ts\">\n  interface P {\n    a: {\n      b: string;\n    };\n    c: number;\n  }\n</script>\n",
            "<script lang=\"ts\">\n  interface P {\n    a: {\n      b: string;\n    };\n    c: number;\n  }\n</script>\n",
        ),
        (
            "<script>\n  let a = [\n    { name: \"Online Stores\", help: \"Connect with third-party tools that you are already using.\" },\n\n    { name: \"Segmentation\" },\n  ];\n</script>\n",
            "<script>\n  let a = [\n    {\n      name: \"Online Stores\",\n      help: \"Connect with third-party tools that you are already using.\",\n    },\n\n    { name: \"Segmentation\" },\n  ];\n</script>\n",
        ),
        (
            "<script>\n  let a = [x,\n\n y];\n</script>\n",
            "<script>\n  let a = [x, y];\n</script>\n",
        ),
    ] {
        assert_eq!(formatted(source_text), want, "{source_text}");
    }
    // The plugin expands this chain: three calls, counting the base `Array(100)`.
    refusal(
        "<script>\n  const xs = Array(100).fill(0).map((_, index) => \"Item \" + index);\n</script>\n",
    );
}
