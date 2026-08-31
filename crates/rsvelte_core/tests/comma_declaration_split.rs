//! The instance script's top-level multi-declarator declarations become one
//! statement per declarator, and nothing else in the script is rewritten.
//!
//! The split used to run a line-by-line rewrite of the whole script, so these
//! cases also pin what that rewrite must no longer disturb: a nested
//! declaration, an unaffected statement's own text, and the declarators a class
//! lowering produces.

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
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

#[test]
fn splits_let_const_and_var() {
    let out = client(
        "<script>\nlet a = $state(1), b = $state(2);\nconst c = 3, d = 4;\nvar e = 5, f = 6;\n</script>\n{a}{b}{c}{d}{e}{f}",
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("let a = 1;"), "{out}");
    assert!(out.contains("let b = 2;"), "{out}");
    assert!(out.contains("const c = 3;"), "{out}");
    assert!(out.contains("const d = 4;"), "{out}");
    assert!(out.contains("var e = 5;"), "{out}");
    assert!(out.contains("var f = 6;"), "{out}");
}

#[test]
fn splits_destructuring_declarators() {
    let out = client(
        "<script>\nlet o = $state({ x: 1 });\nconst { x } = o, [y] = [1];\n</script>\n{x}{y}",
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("const { x } = "), "{out}");
    assert!(out.contains("const [y] = [1]"), "{out}");
}

#[test]
fn keeps_typescript_annotations_on_each_declarator() {
    let out = client(
        "<script lang=\"ts\">\nlet a = $state(1);\nconst b: number = 2, c: string = 'x';\n</script>\n{a}{b}{c}",
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("const b = 2;"), "{out}");
    assert!(out.contains("const c = 'x';"), "{out}");
}

/// Upstream prints the comment after the keyword and the declarator on the next
/// line (measured against svelte 5.56.10); the newline is what keeps the
/// declarator out of the comment.
#[test]
fn prints_a_comment_between_declarators_after_the_keyword() {
    let out = client("<script>\nlet a = $state(1),\n\t// why\n\tb = $state(2);\n</script>\n{a}{b}");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("let // why\n\tb = 2;"),
        "the comment must print after the keyword, with the declarator on its own line: {out}"
    );
}

#[test]
fn splits_alongside_a_class_lowering() {
    let out = client(
        "<script>\nclass C {\n\tx = $state(0);\n}\nconst one = new C(), two = new C();\n</script>\n{one.x}{two.x}",
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("const one = new C();"), "{out}");
    assert!(out.contains("const two = new C();"), "{out}");
    assert!(
        out.contains("#x = $.state(0)"),
        "class lowering lost: {out}"
    );
}

#[test]
fn leaves_a_nested_declaration_and_its_neighbours_alone() {
    let out = client(
        "<script>\nlet a = $state(1), b = $state(2);\nfunction f() {\n\tlet c = 1, d = 2;\n\treturn c + d;\n}\nconst tpl = `a\n\tb`;\n</script>\n{a}{b}{f()}{tpl}",
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("let c = 1, d = 2;"),
        "a nested declaration was split: {out}"
    );
    assert!(
        out.contains("const tpl = `a\n\tb`;"),
        "an unaffected statement was reflowed: {out}"
    );
}

/// A BLOCK comment that stood on its own line between two declarators keeps that
/// line. `collapse_lines` joins a declarator's lines with a space, so the peel
/// has to run on the raw slice — asked after the collapse, an own-line block
/// comment is indistinguishable from one written beside the declarator, and the
/// two print differently.
#[test]
fn an_own_line_block_comment_between_declarators_keeps_its_line() {
    let out =
        client("<script>\n\texport let a = 1,\n\t\t/** doc */\n\t\tb = 2;\n</script>\n{a}{b}\n");
    assert!(
        out.contains("let /** doc */\n\tb = $.prop($$props, 'b', 8, 2);"),
        "{out}"
    );
}

/// CONTROL: the same comment written beside the declarator stays beside it.
#[test]
fn a_same_line_block_comment_between_declarators_stays_inline() {
    let out = client("<script>\n\texport let a = 1,\n\t\t/** doc */ b = 2;\n</script>\n{a}{b}\n");
    assert!(
        out.contains("let /** doc */ b = $.prop($$props, 'b', 8, 2);"),
        "{out}"
    );
}
