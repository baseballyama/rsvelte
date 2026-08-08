//! A line continuation inside a string literal carries the string across a line
//! break, so the carried text is content: indenting it changes the value
//! (issue #2652). The quote character is the axis this file owns — the corpus
//! repros cannot cover it, because the fmt oracle rewrites every literal to
//! double quotes and a single-quoted repro stops being one once committed.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_js(src: &str, generate: GenerateMode, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate,
            dev,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("must compile")
    .js
    .code
}

/// `'a\<break>b'` denotes `ab`. Any tab between the break and `b` is a
/// different string, and the output still parses — so this asserts the value,
/// not the formatting.
fn assert_continuation_intact(source: &str) {
    for (generate, dev) in [
        (GenerateMode::Client, false),
        (GenerateMode::Client, true),
        (GenerateMode::Server, false),
    ] {
        let js = compile_js(source, generate, dev);
        assert!(
            !js.contains("\\\n\tb") && !js.contains("\\\n  b"),
            "the carried line was indented, which changes the string: {js}"
        );
    }
}

#[test]
fn single_quoted_continuation_is_not_indented() {
    assert_continuation_intact(
        "<script>\n\tlet n = $state(0);\n\tconst cont = 'a\\\nb';\n</script>\n\n<p>{cont}{n}</p>\n",
    );
}

#[test]
fn double_quoted_continuation_is_not_indented() {
    assert_continuation_intact(
        "<script>\n\tlet n = $state(0);\n\tconst cont = \"a\\\nb\";\n</script>\n\n<p>{cont}{n}</p>\n",
    );
}

/// The server folds the literal into the pushed template. Before the fix the
/// joined logical line still held the raw newline, so `.lines()` re-split it and
/// the read stayed dynamic.
#[test]
fn server_folds_a_continued_literal() {
    for source in [
        "<script>\n\tconst cont = 'a\\\nb';\n</script>\n\n<p>{cont}</p>\n",
        "<script>\n\tconst cont = \"a\\\nb\";\n</script>\n\n<p>{cont}</p>\n",
    ] {
        let js = compile_js(source, GenerateMode::Server, false);
        assert!(
            js.contains("<p>ab</p>"),
            "expected a folded `ab`, got: {js}"
        );
    }
}

/// #2661: `starts_with` plus `ends_with` also answers yes to two literals with
/// an operator between them, and the fold then emitted the source text.
#[test]
fn server_folds_a_concatenation_rather_than_its_source_text() {
    let js = compile_js(
        "<script>\n\tconst cont = 'ab' + 'cd';\n</script>\n\n<p>{cont}</p>\n",
        GenerateMode::Server,
        false,
    );
    assert!(js.contains("<p>abcd</p>"), "expected `abcd`, got: {js}");
    // The declaration itself keeps the user's `'ab' + 'cd'`; what must not
    // appear is that source text inside the rendered markup.
    assert!(
        !js.contains("<p>ab' + 'cd</p>"),
        "the fold emitted its own source text: {js}"
    );
}

/// The control: a template literal's newline really is content and must keep
/// behaving as it did.
#[test]
fn template_literal_newline_is_unchanged() {
    let js = compile_js(
        "<script>\n\tconst cont = `a\nb`;\n</script>\n\n<p>{cont}</p>\n",
        GenerateMode::Server,
        false,
    );
    assert!(js.contains("a\nb"), "the template's newline was lost: {js}");
}
