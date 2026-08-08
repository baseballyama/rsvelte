//! The server class-member scan accumulates a multi-line field until its
//! brackets balance. A delimiter inside a comment must not move that count, or
//! the field ends early and every member after it is emitted into the wrong
//! place.

use rsvelte_core::{GenerateMode, ModuleCompileOptions, compile_module};

fn server_module(src: &str) -> String {
    compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("T.svelte.js".into()),
            generate: GenerateMode::Server,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compiles")
    .js
    .code
}

fn parses(code: &str) -> bool {
    let allocator = oxc_allocator::Allocator::default();
    oxc_parser::Parser::new(&allocator, code, oxc_span::SourceType::mjs())
        .parse()
        .diagnostics
        .is_empty()
}

/// The shape the corpus found it in: a class with a constructor and an earlier
/// `$derived.by` field, then the field whose initializer carries the comment.
fn class_with(field: &str) -> String {
    format!(
        "export class C {{\n\
         \topts;\n\
         \tconstructor(opts) {{\n\
         \t\tthis.opts = opts;\n\
         \t}}\n\
         \tfirst = $derived.by(() => ({{ a: this.opts.a }}));\n\
         {field}\
         }}\n"
    )
}

#[test]
fn a_close_paren_in_a_comment_does_not_end_a_derived_field() {
    let out = server_module(&class_with(
        "\tsecond = $derived.by(\n\t\t() => ({\n\t\t\t// ) c\n\t\t\tb: 2,\n\t\t\tlast: 3\n\t\t})\n\t);\n",
    ));
    assert!(parses(&out), "{out}");
    assert!(out.contains("last: 3"), "{out}");
}

#[test]
fn a_close_brace_in_a_comment_does_not_end_a_state_field() {
    let out = server_module(&class_with(
        "\tsecond = $state(\n\t\t{\n\t\t\t// } c\n\t\t\tb: 2,\n\t\t\tlast: 3\n\t\t}\n\t);\n",
    ));
    assert!(parses(&out), "{out}");
    assert!(out.contains("last: 3"), "{out}");
}

#[test]
fn a_close_paren_in_a_comment_does_not_end_a_plain_field() {
    let out = server_module(&class_with(
        "\tsecond = f(\n\t\t// ) c\n\t\t1,\n\t\t2\n\t);\n\tlast = 3;\n",
    ));
    assert!(parses(&out), "{out}");
    assert!(out.contains("last = 3"), "{out}");
}

#[test]
fn the_delimiter_may_sit_in_a_block_comment_spanning_lines() {
    let out = server_module(&class_with(
        "\tsecond = $derived.by(\n\t\t() => ({\n\t\t\t/* )\n\t\t\t   ) */\n\t\t\tb: 2,\n\t\t\tlast: 3\n\t\t})\n\t);\n",
    ));
    assert!(parses(&out), "{out}");
    assert!(out.contains("last: 3"), "{out}");
}

#[test]
fn a_close_paren_in_a_string_does_not_end_a_derived_field() {
    let out = server_module(&class_with(
        "\tsecond = $derived.by(\n\t\t() => ({\n\t\t\tb: ')',\n\t\t\tlast: 3\n\t\t})\n\t);\n",
    ));
    assert!(parses(&out), "{out}");
    assert!(out.contains("last: 3"), "{out}");
}

#[test]
fn a_comment_free_multi_line_derived_field_is_unchanged() {
    let out = server_module(&class_with(
        "\tsecond = $derived.by(\n\t\t() => ({\n\t\t\tb: 2,\n\t\t\tlast: 3\n\t\t})\n\t);\n",
    ));
    assert!(parses(&out), "{out}");
    assert!(out.contains("#second = $.derived("), "{out}");
    assert!(out.contains("get second()"), "{out}");
}
