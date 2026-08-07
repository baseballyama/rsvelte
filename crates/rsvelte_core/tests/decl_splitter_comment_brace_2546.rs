//! A `}` inside a comment must not join two top-level declarations (#2546).

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn client(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("Comment.svelte".to_string()),
            generate: GenerateMode::Client,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// The seed the corpus mutation fuzz found: a comment carrying `}` on its own
/// line inside an arrow body, followed by a multi-declarator `let`.
#[test]
fn a_comment_brace_does_not_swallow_the_next_declaration() {
    let out = client(
        "<script>\n\
         \tconst wrap = (val) => {\n\
         \t\treturn val;\n\
         \t/* } c */\n\
         \t};\n\
         \n\
         \tlet w, h;\n\
         </script>\n\
         \n\
         <div bind:offsetWidth={w} bind:offsetHeight={h}></div>\n",
    );

    // `const h;` is a syntax error — the declarator lost both its `let` and its
    // initializer because the splitter counted the comment's `}` as code.
    assert!(
        !out.contains("const h"),
        "declarator re-prefixed with the wrong keyword: {out}"
    );
    assert!(
        out.contains("let w = $.mutable_source()"),
        "expected w to become a source: {out}"
    );
    assert!(
        out.contains("let h = $.mutable_source()"),
        "expected h to become a source: {out}"
    );
}

/// Control: the same file without the comment already compiled correctly, so
/// the assertions above are about the comment and not about `let w, h;`.
#[test]
fn the_same_declarations_without_the_comment_are_unchanged() {
    let out = client(
        "<script>\n\
         \tconst wrap = (val) => {\n\
         \t\treturn val;\n\
         \t};\n\
         \n\
         \tlet w, h;\n\
         </script>\n\
         \n\
         <div bind:offsetWidth={w} bind:offsetHeight={h}></div>\n",
    );

    assert!(out.contains("let w = $.mutable_source()"), "{out}");
    assert!(out.contains("let h = $.mutable_source()"), "{out}");
}

/// A line comment carrying `}` reaches the same scan through a different
/// `skip_opaque` branch.
#[test]
fn a_line_comment_brace_does_not_swallow_the_next_declaration() {
    let out = client(
        "<script>\n\
         \tconst wrap = (val) => {\n\
         \t\treturn val;\n\
         \t// } c\n\
         \t};\n\
         \n\
         \tlet w, h;\n\
         </script>\n\
         \n\
         <div bind:offsetWidth={w} bind:offsetHeight={h}></div>\n",
    );

    assert!(!out.contains("const h"), "{out}");
    assert!(out.contains("let h = $.mutable_source()"), "{out}");
}
