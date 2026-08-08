//! A multi-declarator list is split into one statement per declarator. A
//! comment that preceded a declarator has to be emitted above the keyword: a
//! `let // c` / newline / `name` shape hides the declaration from every later
//! pass, which then reads the name as a bare assignment.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
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

/// The corpus shape: a re-exported prop declared last in a multi-declarator
/// list, with a comment on the line before it.
#[test]
fn a_reexported_prop_behind_a_comment_stays_a_declaration() {
    let out = client(
        "<script>\n\tlet a = 1,\n\t\t// ; c\n\t\tlabelId = \"\";\n\texport { labelId };\n</script>\n\n<p id={labelId}>{a}</p>\n",
    );
    assert!(parses(&out), "{out}");
    assert!(
        out.contains("let labelId = $.prop($$props, 'labelId', 8, \"\");"),
        "{out}"
    );
    assert!(!out.contains("labelId(\"\")"), "{out}");
}

#[test]
fn the_same_holds_for_a_const_list() {
    let out =
        client("<script>\n\tconst a = 1,\n\t\t// c\n\t\tb = 2;\n</script>\n\n<p>{a}{b}</p>\n");
    assert!(parses(&out), "{out}");
    assert!(out.contains("const b = 2;"), "{out}");
}

#[test]
fn a_plain_state_variable_behind_a_comment_still_declares() {
    let out = client(
        "<script>\n\tlet a = 1,\n\t\t// c\n\t\tb = 2;\n\tfunction bump() { b += 1; }\n</script>\n\n<button onclick={bump}>{a}{b}</button>\n",
    );
    assert!(parses(&out), "{out}");
    assert!(out.contains("let b = $.mutable_source(2);"), "{out}");
}

#[test]
fn a_real_assignment_after_a_declaration_is_still_an_assignment() {
    let out = client(
        "<script>\n\texport let labelId = \"\";\n\tfunction set() { labelId = \"x\"; }\n</script>\n\n<button onclick={set}>{labelId}</button>\n",
    );
    assert!(parses(&out), "{out}");
    assert!(out.contains("labelId(\"x\")"), "{out}");
}

#[test]
fn a_variable_actually_named_after_the_keyword_is_untouched() {
    let out = client(
        "<script>\n\tlet letter = 1;\n\tlet constant = 2;\n</script>\n\n<p>{letter}{constant}</p>\n",
    );
    assert!(parses(&out), "{out}");
    assert!(out.contains("let letter = 1;"), "{out}");
    assert!(out.contains("let constant = 2;"), "{out}");
}
