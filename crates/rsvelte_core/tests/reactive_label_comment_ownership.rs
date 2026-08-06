//! A comment preceding a legacy `$:` statement belongs to the labeled
//! statement's body, so SSR prints `$: // c` and the body on the next line.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn server(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Server,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

fn source_with(comment: &str) -> String {
    format!(
        "<script>\n\texport let a = 1;\n\tlet b = 0;\n\t{comment}\n\t$: b = a * 2;\n</script>\n\n<p>{{b}}</p>\n"
    )
}

#[test]
fn line_comment_follows_the_reactive_label() {
    let out = server(&source_with("// c"));
    assert!(out.contains("$: // c\n\tb = a * 2;"), "{out}");
}

#[test]
fn block_comment_follows_the_reactive_label() {
    let out = server(&source_with("/* } c */"));
    assert!(out.contains("$: /* } c */"), "{out}");
    assert!(!out.contains("/* } c */\n\t$:"), "{out}");
}

#[test]
fn svelte_ignore_comment_follows_the_reactive_label() {
    let out = server(&source_with(
        "// svelte-ignore a11y_no_static_element_interactions",
    ));
    assert!(
        out.contains("$: // svelte-ignore a11y_no_static_element_interactions"),
        "{out}"
    );
}
