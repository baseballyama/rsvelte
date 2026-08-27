//! Comments between a destructured `$props()` declarator's `=` and the rune
//! follow the last source-located node that survives lowering. These outputs
//! pin the official compiler's esrap cursor placement for #3515.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(script: &str, template: &str, dev: bool) -> String {
    let source = format!("<script>\n\t{script}\n</script>\n\n{template}\n");
    compile(
        &source,
        CompileOptions {
            generate: GenerateMode::Client,
            dev,
            ..Default::default()
        },
    )
    .expect("compile failed")
    .js
    .code
}

#[track_caller]
fn assert_contains(code: &str, needle: &str) {
    assert!(
        code.contains(needle),
        "expected to find\n  {needle}\nin:\n{code}"
    );
}

#[test]
fn block_comment_after_props_assignment_trails_the_default_argument() {
    let script = "let { a = 1 } = /* c */ $props();";
    let expected = "let a = $.prop($$props, 'a', 3, 1 /* c */);";
    assert_contains(&client(script, "{a}", false), expected);
    assert_contains(&client(script, "{a}", true), expected);
}

#[test]
fn line_comment_after_props_assignment_breaks_the_prop_call() {
    let script = "let { a = 1 } = // c\n\t\t$props();";
    let expected = "let a = $.prop($$props, 'a', 3, 1 // c\n\t);";
    assert_contains(&client(script, "{a}", false), expected);
    assert_contains(&client(script, "{a}", true), expected);
}

#[test]
fn a_plain_pattern_comment_flushes_at_the_next_generated_node() {
    let plain = client(
        "let { a } = /* plain */ $props();",
        "<button onclick={() => a++}>{a}</button>",
        false,
    );
    assert_contains(&plain, "var /* plain */\n\tbutton = root();");
}

#[test]
fn a_rest_pattern_comment_flushes_after_the_declaration() {
    let rest = client(
        "let { a, ...rest } = // rest\n\t\t$props();",
        "{a}{rest.x}",
        false,
    );
    assert_contains(&rest, "let rest = $.rest_props($$props,");
    assert_contains(&rest, ");\n\t// rest");
}

#[test]
fn multiple_and_multiline_comments_keep_source_order_inside_the_prop_call() {
    let multiple = client(
        "let { a = 1 } = /* one */ /* two */ $props();",
        "{a}",
        false,
    );
    assert_contains(&multiple, "1 /* one */ /* two */);");

    let multiline = client("let { a = 1 } = /* one\n+two */ $props();", "{a}", false);
    assert_contains(&multiline, "1 /* one\n\t\t+two */\n\t);");
}
