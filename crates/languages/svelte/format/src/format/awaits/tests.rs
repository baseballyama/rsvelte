use crate::options::Options;

fn format(script: &str, lang: &str) -> Result<String, String> {
    let source_text = format!("<script{lang}>\n{script}\n</script>\n");
    crate::task::format(&source_text, &Options::default()).map_err(|refused| refused.message)
}

#[test]
fn an_await_prettier_reads_as_oxc_does_is_formatted() {
    for (script, expected) in [
        (
            "class A { x = await f(); }",
            "  class A {\n    x = await f();\n  }\n",
        ),
        (
            "enum E { A = await f() }",
            "  enum E {\n    A = await f(),\n  }\n",
        ),
        (
            "class A { static { await (f()); } }",
            "  class A {\n    static {\n      await f();\n    }\n  }\n",
        ),
        (
            "class A { [await (f())] = 1; }",
            "  class A {\n    [await f()] = 1;\n  }\n",
        ),
        ("const r = await (g());", "  const r = await g();\n"),
    ] {
        let printed = format(script, " lang=\"ts\"");
        assert_eq!(
            printed,
            Ok(format!("<script lang=\"ts\">\n{expected}</script>\n")),
            "{script}"
        );
    }
}

#[test]
fn an_await_prettier_reads_otherwise_is_refused() {
    for (script, lang) in [
        ("class A { x = await (f()); }", " lang=\"ts\""),
        ("function h() { return await (g()); }", " lang=\"ts\""),
        (
            "async function h() { class A { x = await (f()); } }",
            " lang=\"ts\"",
        ),
        ("const g = (a = await (f())) => a;", " lang=\"ts\""),
        ("namespace N { const a = await (f()); }", " lang=\"ts\""),
        (
            "function h() { for await (const x of y) {} }",
            " lang=\"ts\"",
        ),
        ("class A { x = await f(); }", ""),
    ] {
        let refused = format(script, lang).expect_err(script);
        assert!(refused.contains("await"), "{script}: {refused}");
    }
}
