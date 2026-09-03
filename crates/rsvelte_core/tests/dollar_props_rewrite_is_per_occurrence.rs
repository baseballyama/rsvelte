//! Upstream renames `$$props` from `Identifier.js`, so it reaches exactly the
//! source references: a comment, a string, a template's text and a regex are not
//! identifiers, and the builder-made prop calls are emitted after the rename has
//! already run. rsvelte's legacy port runs on the generated text instead and used
//! to decide per LINE — which is wrong in both directions at once, because a line
//! carrying `$.prop(` also carries source references and a line carrying none can
//! still hold a comment.
//!
//! Expectations are the oracle's own output. The two cells that were EQ before the
//! fix are kept: `const s = '$$props';` was right for the wrong reason (its line
//! happened to carry a needle), so a grid of only-failing cells would have scored
//! the fix on a cell whose verdict cannot move.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_cell(body: &str) -> String {
    let src = format!("<script>\n{body}\n</script>\n<div {{...$$restProps}}>{{a}}</div>");
    compile(
        &src,
        CompileOptions {
            filename: Some("M.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// The first trimmed line containing `needle`.
fn line_with(js: &str, needle: &str) -> String {
    js.lines()
        .map(str::trim)
        .find(|l| l.contains(needle))
        .unwrap_or("(not found)")
        .to_string()
}

#[test]
fn the_dollar_props_rename_is_decided_per_occurrence() {
    let cells: [(&str, &str, &str, &str); 12] = [
        (
            "comment",
            "\t// $$props is mentioned here\n\texport let a = 1;",
            "// $$",
            "// $$props is mentioned here",
        ),
        (
            "block comment",
            "\texport let a = 1;\n\t/* $$props here */\n\tconst u = 1;",
            "/* $$",
            "/* $$props here */",
        ),
        (
            "template text",
            "\texport let a = 1;\n\tconst v = `x $$props y`;",
            "const v =",
            "const v = `x $$props y`;",
        ),
        (
            "string literal",
            "\texport let a = 1;\n\tconst s = '$$props';\n\tconst t = s.length;",
            "const s =",
            "const s = '$$props';",
        ),
        (
            "prop default reads it",
            "\texport let a = 1;\n\texport let b = $$props.x;",
            "let b =",
            "let b = $.prop($$props, 'b', 24, () => $$sanitized_props.x);",
        ),
        (
            "prop default is an arrow",
            "\texport let a = 1;\n\texport let b = () => $$props.x;",
            "let b =",
            "let b = $.prop($$props, 'b', 8, () => $$sanitized_props.x);",
        ),
        (
            "two declarators on one line",
            "\texport let a = 1, b = $$props.z;",
            "let b =",
            "let b = $.prop($$props, 'b', 24, () => $$sanitized_props.z);",
        ),
        (
            "plain read",
            "\texport let a = 1;\n\tconst c = $$props.y;",
            "const c =",
            "const c = $$sanitized_props.y;",
        ),
        (
            // A generated read-only-prop reference and a source `$$props` on the
            // SAME statement: the line rule protected both and lost the second.
            "generated read beside a source read",
            "\texport let a = 1;\n\texport let count = 0;\n\texport let b = count + $$props.z;",
            "let b =",
            "let b = $.prop($$props, 'b', 24, () => count() + $$sanitized_props.z);",
        ),
        (
            "read-only prop in the body",
            "\texport let a = 1;\n\texport let count = 0;\n\tconst d = count + 1;",
            "const d =",
            "const d = count() + 1;",
        ),
        (
            "read-only prop as a shorthand",
            "\texport let a = 1;\n\texport let count = 0;\n\tconst o = { count };",
            "const o =",
            "const o = { count: count() };",
        ),
        (
            "read-only prop in another default",
            "\texport let a = 1;\n\texport let count = 0;\n\texport let b = count + 1;",
            "let b =",
            "let b = $.prop($$props, 'b', 24, () => count() + 1);",
        ),
    ];

    let mut wrong = Vec::new();
    for (name, body, needle, expected) in cells {
        let got = line_with(&compile_cell(body), needle);
        if got != expected {
            wrong.push(format!("{name}\n  want {expected}\n  got  {got}"));
        }
    }
    assert!(wrong.is_empty(), "{}", wrong.join("\n"));
}
