use rsvelte_formatter::{FormatOptions, format};

#[test]
fn formats_instance_script_body() {
    let source = "<script>let x=1+2;function f(a,b){return a+b}</script>\n<h1>hello</h1>";
    let out = format(source, &FormatOptions::default()).expect("format ok");
    println!("--- input ---\n{source}\n--- output ---\n{out}");
    assert!(
        out.contains("let x = 1 + 2"),
        "missing spaced binary op:\n{out}"
    );
    assert!(
        out.contains("function f(a, b)"),
        "missing spaced params:\n{out}"
    );
    assert!(
        out.contains("<h1>hello</h1>"),
        "markup not preserved:\n{out}"
    );
}

#[test]
fn passes_through_when_no_script() {
    let source = "<h1>hello</h1>\n";
    let out = format(source, &FormatOptions::default()).expect("format ok");
    assert_eq!(out, source);
}

#[test]
fn passes_through_empty_script() {
    let source = "<script></script>\n<p>x</p>";
    let out = format(source, &FormatOptions::default()).expect("format ok");
    assert_eq!(out, source);
}

#[test]
fn formats_module_and_instance_independently() {
    let source = concat!(
        "<script context=\"module\">export const A=1+2</script>\n",
        "<script>let x=3+4</script>\n",
        "<p>{x}</p>",
    );
    let out = format(source, &FormatOptions::default()).expect("format ok");
    println!("--- output ---\n{out}");
    assert!(
        out.contains("export const A = 1 + 2"),
        "module script not formatted:\n{out}"
    );
    assert!(
        out.contains("let x = 3 + 4"),
        "instance script not formatted:\n{out}"
    );
    assert!(out.contains("<p>{x}</p>"), "markup not preserved:\n{out}");
}

#[test]
fn template_literal_interior_is_not_reindented() {
    // Re-embedding `<script>` must not re-indent the interior of a
    // multi-line template literal — that whitespace is part of the string
    // value, and re-indenting it both mutates the string and breaks
    // idempotency (#686).
    let source = concat!(
        "<script lang=\"ts\">\n",
        "  const html = `\n",
        "    <div>\n",
        "      hello\n",
        "    </div>\n",
        "  `;\n",
        "</script>\n",
        "\n",
        "<p>{html}</p>\n",
    );
    let out = format(source, &FormatOptions::default()).expect("format ok");
    println!("--- output ---\n{out}");
    // Quasi lines keep their original indentation (4 / 6 spaces).
    assert!(
        out.contains("\n    <div>\n"),
        "quasi line reindented:\n{out}"
    );
    assert!(
        out.contains("\n      hello\n"),
        "quasi line reindented:\n{out}"
    );
    // Idempotent: a second pass is a fixed point.
    let out2 = format(&out, &FormatOptions::default()).expect("format ok");
    assert_eq!(out, out2, "formatting is not idempotent");
}
