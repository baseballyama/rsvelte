//! Upstream's `PseudoClassSelector` visitor calls `context.next()` for
//! `is` / `where` / `has` / `not` unconditionally
//! (`3-transform/css/index.js:377-381`), so the argument list is walked whether
//! or not a scoping modifier will be added there — and the `ComplexSelector`
//! visitor inside it still removes `:global`. rsvelte descended only when it
//! had a scope class to add, so `:not(:has(:global(.b)))` — where the `:not`
//! argument is simple and takes no class — kept the `:global(...)`.
//!
//! Every expectation is the official compiler's own output (5.56.10).

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn scoped(markup: &str, body: &str) -> String {
    let source = format!("{markup}\n\n<style>{body}</style>\n");
    let out = compile(
        &source,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .unwrap_or_else(|err| panic!("{body}: {err:?}"))
    .css
    .map(|c| c.code)
    .unwrap_or_default();
    let Some(start) = out.find("svelte-") else {
        return out;
    };
    let len = out[start..]
        .char_indices()
        .find(|(i, c)| *i > 0 && !c.is_ascii_alphanumeric() && *c != '-')
        .map_or(out.len() - start, |(i, _)| i);
    out.replace(&out[start..start + len], "HASH")
}

#[test]
fn a_global_two_pseudos_deep_is_still_unwrapped() {
    let out = scoped(
        "<div class=\"a\">x</div>",
        "\n\t.a:not(:has(:global(.b))) {\n\t\tcolor: red;\n\t}\n",
    );
    assert_eq!(out.trim(), ".a.HASH:not(:has(.b)) {\n\t\tcolor: red;\n\t}");
}

#[test]
fn a_global_one_pseudo_deep_is_unchanged() {
    // The controls: these already worked, and none of them gains a scope class
    // inside the argument — descending further must not start adding one.
    for (markup, body, expected) in [
        (
            "<div class=\"a\">x</div>",
            "\n\t.a:not(:global(.b)) {\n\t\tcolor: red;\n\t}\n",
            ".a.HASH:not(.b)",
        ),
        (
            "<div class=\"a\"><div class=\"b\">y</div></div>",
            "\n\t.a:has(:global(.b)) {\n\t\tcolor: red;\n\t}\n",
            ".a.HASH:has(.b)",
        ),
        (
            "<div class=\"a\"><div class=\"b\">y</div></div>",
            "\n\t.a:is(:global(.b)) {\n\t\tcolor: red;\n\t}\n",
            ".a.HASH:is(.b)",
        ),
    ] {
        let out = scoped(markup, body);
        assert!(out.contains(expected), "{expected}\n{out}");
    }
}
