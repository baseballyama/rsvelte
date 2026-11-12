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
    ]
    .iter()
    .map(|(source_text, options)| refusal_with(source_text, options).0)
    .collect();
    assert_eq!(
        refused,
        [
            "an expression that `embeddedLanguageFormatting: off` cannot print",
            "`<!-- #endregion -->` after <script> or <style>",
            "a script language other than JavaScript",
            "a script language other than JavaScript",
            "code a module rejects",
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
            "<style>\n  p {\n    a: 1;\n\n\n    b: 2;\n    .x {\n      c: 1;\n    }\n    d: 3;\n  \
                }\n</style>\n",
            "<style>\n  p {\n    a: 1;\n\n    b: 2;\n    .x {\n      c: 1;\n    }\n    d: 3;\n  \
                }\n</style>\n",
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
        "<p>{\"\\8\"}</p>\n",
        "<p>{a?.b = 1}</p>\n",
        "<p>{-x ** 2}</p>\n",
    ] {
        refusal_with(source_text, &Options::default());
    }
}

/// oxc's parser reads `T < c` as the start of type arguments; Prettier's reads a comparison.
#[test]
fn a_comparison_after_a_cast_is_refused() {
    refusal("<script lang=\"ts\">\n  a as T < c;\n</script>\n");
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
        ("<p>{(a ?? b) || c}</p>\n", "<p>{(a ?? b) || c}</p>\n"),
        ("<p>{a ?? (b && c)}</p>\n", "<p>{a ?? (b && c)}</p>\n"),
        (
            "<script>\n  let x = (a || b) ?? c;\n</script>\n",
            "<script>\n  let x = (a || b) ?? c;\n</script>\n",
        ),
        // In a module `await` is a keyword, so this awaits `-1`.
        ("<p>{await -1}</p>\n", "<p>{await -1}</p>\n"),
        // JavaScript's trim keeps U+0085, so this is no prettier-ignore comment.
        (
            "<!--\u{85}prettier-ignore -->\n<p>a</p>\n",
            "<!--\u{85}prettier-ignore -->\n<p>a</p>\n",
        ),
        (
            "<script>\n  new (a?.b)();\n</script>\n",
            "<script>\n  new (a?.b)();\n</script>\n",
        ),
        (
            "<script>\n  (a?.b)();\n</script>\n",
            "<script>\n  (a?.b)();\n</script>\n",
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

/// JavaScript a module rejects.
#[test]
fn review_f_shapes_are_refused() {
    for source_text in [
        "<script>\n  [a?.b] = c;\n</script>\n",
        "<script>\n  ({a}) = 1;\n</script>\n",
        "<script>\n  if (a) let x = 1;\n</script>\n",
        "<script>\n  [...a = 1] = b;\n</script>\n",
        "<script>\n  let x = (a, ...b, c) => 1;\n</script>\n",
        "<button onclick={() => { let a; let a; }}>b</button>\n",
        "<p>{(a, { a }) => 1}</p>\n",
    ] {
        refusal(source_text);
    }
}

/// Corpus files that printed otherwise; expected outputs from prettier-plugin-svelte 4.1.1.
#[test]
fn corpus_shapes_print_as_the_plugin_prints_them() {
    for (source_text, want) in [
        (
            "<script lang=\"ts\">\n  let { a, b }: {\n a: string; b: number } = \
                $props();\n</script>\n",
            "<script lang=\"ts\">\n  let {\n    a,\n    b,\n  }: {\n    a: string;\n    b: \
                number;\n  } = $props();\n</script>\n",
        ),
        (
            "<script>\n  import {} from \"svelte\";\n</script>\n",
            "<script>\n  import {} from \"svelte\";\n</script>\n",
        ),
        (
            "<script lang=\"ts\">\n  interface P {\n    a: {\n      b: string;\n    };\n    c: \
                number;\n  }\n</script>\n",
            "<script lang=\"ts\">\n  interface P {\n    a: {\n      b: string;\n    };\n    c: \
                number;\n  }\n</script>\n",
        ),
        (
            "<script>\n  let a = [\n    { name: \"Online Stores\", help: \"Connect with \
                third-party tools that you are already using.\" },\n\n    { name: \"Segmentation\" \
                },\n  ];\n</script>\n",
            "<script>\n  let a = [\n    {\n      name: \"Online Stores\",\n      help: \"Connect \
                with third-party tools that you are already using.\",\n    },\n\n    { name: \
                \"Segmentation\" },\n  ];\n</script>\n",
        ),
        // Three calls, counting the base `Array(100)`, expand the chain.
        (
            "<script>\n  const xs = Array(100).fill(0).map((_, index) => \"Item \" + \
                index);\n</script>\n",
            "<script>\n  const xs = Array(100)\n    .fill(0)\n    .map((_, index) => \"Item \" + \
                index);\n</script>\n",
        ),
    ] {
        assert_eq!(formatted(source_text), want, "{source_text}");
    }
}

/// Inputs the earlier printer refused, with their print width; expected outputs from Prettier
/// 3.9.10 with prettier-plugin-svelte 4.1.1.
const ONCE_REFUSED: &[(u32, &str, &str)] = &[
    (
        20,
        "<title>x</title>{a + b}\n",
        "<title>x</title>{a +\n  b}\n",
    ),
    (
        80,
        "<script>\n\tlet a = { 'b': 1 };\n</script>\n",
        "<script>\n  let a = { b: 1 };\n</script>\n",
    ),
    (
        80,
        "<script lang=\"ts\">\n  a as T > c;\n</script>\n",
        "<script lang=\"ts\">\n  (a as T) > c;\n</script>\n",
    ),
    (
        80,
        "<script lang=\"ts\">\n  let a = b satisfies { a: string } < c;\n</script>\n",
        "<script lang=\"ts\">\n  let a = (b satisfies { a: string }) < c;\n</script>\n",
    ),
    (
        30,
        "<script>\n  promise.then((a) => {\n    x;\n  }).then(b).catch(c);\n</script>\n",
        "<script>\n  promise\n    .then((a) => {\n      x;\n    })\n    .then(b)\n    \
            .catch(c);\n</script>\n",
    ),
    (80, "<p>{a || (b || c)}</p>\n", "<p>{a || b || c}</p>\n"),
    (
        80,
        "<style>\n  a {\n    content: \"a  b\";\n  }\n</style>\n",
        "<style>\n  a {\n    content: \"a  b\";\n  }\n</style>\n",
    ),
    (
        16,
        "{array.map((item) => {\n  return item + 1\n})}\n",
        "{array.map(\n  (item) => {\n    return (\n      item + 1\n    );\n  },\n)}\n",
    ),
    (
        80,
        "<p>{a || `x\ny`}</p>\n",
        "<p>\n  {a ||\n    `x\ny`}\n</p>\n",
    ),
    (
        80,
        "{#if z}{@const q = a = b}{q}{/if}\n",
        "{#if z}{@const q = a = b}{q}{/if}\n",
    ),
    (
        80,
        "<script lang=\"ts\">\n  [...(a as T)];\n</script>\n",
        "<script lang=\"ts\">\n  [...(a as T)];\n</script>\n",
    ),
    (
        80,
        "<script lang=\"ts\">\n  (a as T)!;\n</script>\n",
        "<script lang=\"ts\">\n  (a as T)!;\n</script>\n",
    ),
    (
        80,
        "<script>\n  it(\"x\", function () { a(); }, 1000);\n</script>\n",
        "<script>\n  it(\"x\", function () {\n    a();\n  }, 1000);\n</script>\n",
    ),
    (
        80,
        "<script lang=\"ts\">\n  function f(a: { k: T }) {}\n</script>\n",
        "<script lang=\"ts\">\n  function f(a: { k: T }) {}\n</script>\n",
    ),
    (
        80,
        "<script>\n  let s = `\n\t\tnext ${() => { x; }} post`;\n</script>\n",
        "<script>\n  let s = `\n\t\tnext ${() => {\n      x;\n    }} post`;\n</script>\n",
    ),
    (
        80,
        "<script>\n  let x = this.a[() => { x; }];\n</script>\n",
        "<script>\n  let x =\n    this.a[\n      () => {\n        x;\n      }\n    \
            ];\n</script>\n",
    ),
    (
        80,
        "<script lang=\"ts\">\n  \
            f(user!.pppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp);\n\
            </script>\n",
        "<script lang=\"ts\">\n  f(\n    user!\n      \
            .pppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp,\n  \
            );\n</script>\n",
    ),
    (
        80,
        "<script>\n  let x = \
            Foo.API[0].bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb\
            ;\n</script>\n",
        "<script>\n  let x =\n    Foo.API[0]\n      \
            .bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb;\n</scrip\
            t>\n",
    ),
];

#[test]
fn shapes_once_refused_print_as_the_plugin_prints_them() {
    for &(print_width, source_text, want) in ONCE_REFUSED {
        let options = options(&format!(r#"{{"printWidth": {print_width}}}"#));
        assert_eq!(
            formatted_with(source_text, &options),
            want,
            "{source_text:?}"
        );
    }
}

/// Where the plugin's output comes from a Prettier quirk, the output is what the plugin means.
#[test]
fn upstream_quirks_are_not_reproduced() {
    let narrow = options(r#"{"printWidth": 30}"#);
    for (source_text, options, want) in [
        // `removeLines` makes spaces of the lines around every argument put out: `f( a, b )`.
        (
            "{#if f(`x\ny`, () => {})}y{/if}\n",
            &narrow,
            "{#if f(`x\ny`, () => {})}y{/if}\n",
        ),
        (
            "{#if f(someQuiteLongIdentifierNumberOne + someQuiteLongIdentifierNumberOne, [a, \
                b])}y{/if}\n",
            &Options::default(),
            "{#if f(someQuiteLongIdentifierNumberOne + someQuiteLongIdentifierNumberOne, [a, \
                b])}y{/if}\n",
        ),
        (
            "{#await { k: obj.props((a) => { x; }) }}\n  w\n{/await}\n",
            &narrow,
            "{#await { k: obj.props((a) => {\n    x;\n  }) }}\n  w\n{/await}\n",
        ),
        // `removeLines` keeps a member chain's hard lines, so a head meant for one line breaks.
        (
            "{#key items >> someLongIdentifierName.b(1).x.i(~anotherQuiteLongVariableName(`a ${b} \
                c`, items))}k{/key}\n",
            &narrow,
            "{#key items >> someLongIdentifierName.b(1).x.i(~anotherQuiteLongVariableName(`a ${b} \
                c`, items))}k{/key}\n",
        ),
        // Prettier puts the `{` after a `url(…)` prelude on its own line.
        (
            "<style>\n  @document url(http://a.b) {\n    a {\n      b: 1;\n    }\n  }\n</style>\n",
            &Options::default(),
            "<style>\n  @document url(http://a.b) {\n    a {\n      b: 1;\n    }\n  }\n</style>\n",
        ),
    ] {
        assert_eq!(
            formatted_with(source_text, options),
            want,
            "{source_text:?}"
        );
    }
}

/// oxc keeps a blank line between array elements and breaks the array; Prettier joins it.
#[test]
fn a_blank_line_in_an_array_breaks_it_as_oxc_does() {
    assert_eq!(
        formatted("<script>\n  let a = [x,\n\n y];\n</script>\n"),
        "<script>\n  let a = [\n    x,\n\n    y,\n  ];\n</script>\n"
    );
}
