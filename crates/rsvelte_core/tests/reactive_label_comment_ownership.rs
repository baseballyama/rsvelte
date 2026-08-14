//! A comment preceding a legacy `$:` statement belongs to the labeled
//! statement's body, so SSR keeps it between the label and the body.

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

fn assert_between_label_and_body(out: &str, comment: &str) {
    let label = out.find("$:").expect("reactive label");
    let comment = out.find(comment).expect("comment");
    let body = out.find("b = a * 2;").expect("reactive body");
    assert!(label < comment && comment < body, "{out}");
}

#[test]
fn line_comment_follows_the_reactive_label() {
    let out = server(&source_with("// c"));
    assert_between_label_and_body(&out, "// c");
}

#[test]
fn block_comment_follows_the_reactive_label() {
    let out = server(&source_with("/* } c */"));
    assert_between_label_and_body(&out, "/* } c */");
}

#[test]
fn svelte_ignore_comment_follows_the_reactive_label() {
    let out = server(&source_with(
        "// svelte-ignore a11y_no_static_element_interactions",
    ));
    assert_between_label_and_body(&out, "// svelte-ignore a11y_no_static_element_interactions");
}

#[test]
fn leading_comment_stays_before_a_successor_after_reactive_reorder() {
    let out = server(
        "<script>\n\tlet total = 10;\n\tlet half;\n\t// c\n\t$: half = total / 2;\n\tlet z = 1;\n</script>\n\n<p>{half}</p>\n",
    );
    let comment = out.find("// c").expect("comment survives");
    let successor = out.find("let z = 1;").expect("successor survives");
    let reactive = out.find("half = total / 2").expect("reactive survives");
    assert!(comment < successor && successor < reactive, "{out}");
}
