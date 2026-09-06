//! Where a trailing comment prints is decided by WHICH NODE it lands on, and the
//! port decided it from the comment's spelling and the host it was written in.
//!
//! esrap attaches the comment run after a declaration's last code byte to that
//! statement's last LOCATED node. When the source initializer survives as the
//! last `$.prop(…)` argument, that node is inside the call and the comment
//! prints before the closing paren; when this pass synthesizes a thunk — or
//! there is no initializer at all — there is no located node inside the call and
//! upstream flushes the comment after the statement. Nothing about that rule
//! reads the comment's kind or a `;`.
//!
//! Every expected string below is the ORACLE's own output
//! (`submodules/svelte/…/src/compiler/index.js`, `generate: 'client'`,
//! `dev: false`), generated rather than typed.
//!
//! Two axes the earlier grid held fixed, each of which carries live cells:
//!
//! * **the HOST.** `let v = 1 // c` with `export { v }` reaches
//!   `transform_let_with_reexported_props`, a second port that had no trailing
//!   comment handling at all — 8 of its 8 cells dropped the comment.
//! * **the absence of an initializer.** `export let v // c` has nothing for the
//!   comment to attach to inside the call, and the restorer was gated on the
//!   declaration having an initializer, so all four of those cells dropped it.
//!
//! The `;` axis is kept because the defect it exposed inverted along it, and it
//! is now measured to be inert: every `semi` cell equals its `nosemi` twin.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_cell(body: &str) -> Vec<String> {
    let src = format!("<script>\n{body}\n</script>\n<p>{{v}}{{w}}</p>\n");
    let js = compile(
        &src,
        CompileOptions {
            filename: Some("C.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    let lines: Vec<String> = js.lines().map(|l| l.trim().to_string()).collect();
    match lines.iter().position(|l| l.starts_with("let v =")) {
        Some(at) => lines[at..(at + 2).min(lines.len())].to_vec(),
        None => vec!["(not found)".to_string()],
    }
}

#[test]
fn a_trailing_comment_lands_on_the_node_upstream_puts_it_on() {
    let cells: [(&str, &str, [&str; 2]); 20] = [
        (
            "export let / line / nosemi / lit",
            "\texport let v = 1 // c\n\texport let w = 2;",
            ["let v = $.prop($$props, 'v', 8, 1 // c", ");"],
        ),
        (
            "export let / line / nosemi / none",
            "\texport let v // c\n\texport let w = 2;",
            [
                "let v = $.prop($$props, 'v', 8); // c",
                "let w = $.prop($$props, 'w', 8, 2);",
            ],
        ),
        (
            "export let / line / nosemi / obj",
            "\texport let v = {} // c\n\texport let w = 2;",
            [
                "let v = $.prop($$props, 'v', 24, () => ({})); // c",
                "let w = $.prop($$props, 'w', 8, 2);",
            ],
        ),
        (
            "export let / line / semi / lit",
            "\texport let v = 1; // c\n\texport let w = 2;",
            ["let v = $.prop($$props, 'v', 8, 1 // c", ");"],
        ),
        (
            "export let / line / semi / none",
            "\texport let v; // c\n\texport let w = 2;",
            [
                "let v = $.prop($$props, 'v', 8); // c",
                "let w = $.prop($$props, 'w', 8, 2);",
            ],
        ),
        (
            "export let / line / semi / obj",
            "\texport let v = {}; // c\n\texport let w = 2;",
            [
                "let v = $.prop($$props, 'v', 24, () => ({})); // c",
                "let w = $.prop($$props, 'w', 8, 2);",
            ],
        ),
        (
            "export let / block / nosemi / lit",
            "\texport let v = 1 /* c */\n\texport let w = 2;",
            [
                "let v = $.prop($$props, 'v', 8, 1 /* c */);",
                "let w = $.prop($$props, 'w', 8, 2);",
            ],
        ),
        (
            "export let / block / nosemi / none",
            "\texport let v /* c */\n\texport let w = 2;",
            [
                "let v = $.prop($$props, 'v', 8); /* c */",
                "let w = $.prop($$props, 'w', 8, 2);",
            ],
        ),
        (
            "export let / block / nosemi / obj",
            "\texport let v = {} /* c */\n\texport let w = 2;",
            [
                "let v = $.prop($$props, 'v', 24, () => ({})); /* c */",
                "let w = $.prop($$props, 'w', 8, 2);",
            ],
        ),
        (
            "export let / block / semi / lit",
            "\texport let v = 1; /* c */\n\texport let w = 2;",
            [
                "let v = $.prop($$props, 'v', 8, 1 /* c */);",
                "let w = $.prop($$props, 'w', 8, 2);",
            ],
        ),
        (
            "export let / block / semi / none",
            "\texport let v; /* c */\n\texport let w = 2;",
            [
                "let v = $.prop($$props, 'v', 8); /* c */",
                "let w = $.prop($$props, 'w', 8, 2);",
            ],
        ),
        (
            "export let / block / semi / obj",
            "\texport let v = {}; /* c */\n\texport let w = 2;",
            [
                "let v = $.prop($$props, 'v', 24, () => ({})); /* c */",
                "let w = $.prop($$props, 'w', 8, 2);",
            ],
        ),
        (
            "reexport / line / nosemi / lit",
            "\tlet v = 1 // c\n\tlet w = 2;\n\texport { v, w };",
            ["let v = $.prop($$props, 'v', 8, 1 // c", ");"],
        ),
        (
            "reexport / line / nosemi / obj",
            "\tlet v = {} // c\n\tlet w = 2;\n\texport { v, w };",
            [
                "let v = $.prop($$props, 'v', 24, () => ({})); // c",
                "let w = $.prop($$props, 'w', 8, 2);",
            ],
        ),
        (
            "reexport / line / semi / lit",
            "\tlet v = 1; // c\n\tlet w = 2;\n\texport { v, w };",
            ["let v = $.prop($$props, 'v', 8, 1 // c", ");"],
        ),
        (
            "reexport / line / semi / obj",
            "\tlet v = {}; // c\n\tlet w = 2;\n\texport { v, w };",
            [
                "let v = $.prop($$props, 'v', 24, () => ({})); // c",
                "let w = $.prop($$props, 'w', 8, 2);",
            ],
        ),
        (
            "reexport / block / nosemi / lit",
            "\tlet v = 1 /* c */\n\tlet w = 2;\n\texport { v, w };",
            [
                "let v = $.prop($$props, 'v', 8, 1 /* c */);",
                "let w = $.prop($$props, 'w', 8, 2);",
            ],
        ),
        (
            "reexport / block / nosemi / obj",
            "\tlet v = {} /* c */\n\tlet w = 2;\n\texport { v, w };",
            [
                "let v = $.prop($$props, 'v', 24, () => ({})); /* c */",
                "let w = $.prop($$props, 'w', 8, 2);",
            ],
        ),
        (
            "reexport / block / semi / lit",
            "\tlet v = 1; /* c */\n\tlet w = 2;\n\texport { v, w };",
            [
                "let v = $.prop($$props, 'v', 8, 1 /* c */);",
                "let w = $.prop($$props, 'w', 8, 2);",
            ],
        ),
        (
            "reexport / block / semi / obj",
            "\tlet v = {}; /* c */\n\tlet w = 2;\n\texport { v, w };",
            [
                "let v = $.prop($$props, 'v', 24, () => ({})); /* c */",
                "let w = $.prop($$props, 'w', 8, 2);",
            ],
        ),
    ];

    let mut wrong = Vec::new();
    for (name, body, expected) in cells {
        let got = compile_cell(body);
        let want: Vec<String> = expected.iter().map(ToString::to_string).collect();
        if got != want {
            wrong.push(format!("{name}\n  want {want:?}\n  got  {got:?}"));
        }
    }
    assert!(wrong.is_empty(), "{}", wrong.join("\n"));
}

/// The `;` is inert: a cell and its semicolon twin must agree. Written as a
/// relation between cells rather than as more expected strings, so it cannot go
/// stale against the oracle the way a transcribed literal can.
#[test]
fn the_semicolon_is_not_an_axis() {
    let pairs: [(&str, &str); 10] = [
        (
            "\texport let v = 1 // c\n\texport let w = 2;",
            "\texport let v = 1; // c\n\texport let w = 2;",
        ),
        (
            "\texport let v // c\n\texport let w = 2;",
            "\texport let v; // c\n\texport let w = 2;",
        ),
        (
            "\texport let v = {} // c\n\texport let w = 2;",
            "\texport let v = {}; // c\n\texport let w = 2;",
        ),
        (
            "\texport let v = 1 /* c */\n\texport let w = 2;",
            "\texport let v = 1; /* c */\n\texport let w = 2;",
        ),
        (
            "\texport let v /* c */\n\texport let w = 2;",
            "\texport let v; /* c */\n\texport let w = 2;",
        ),
        (
            "\texport let v = {} /* c */\n\texport let w = 2;",
            "\texport let v = {}; /* c */\n\texport let w = 2;",
        ),
        (
            "\tlet v = 1 // c\n\tlet w = 2;\n\texport { v, w };",
            "\tlet v = 1; // c\n\tlet w = 2;\n\texport { v, w };",
        ),
        (
            "\tlet v = {} // c\n\tlet w = 2;\n\texport { v, w };",
            "\tlet v = {}; // c\n\tlet w = 2;\n\texport { v, w };",
        ),
        (
            "\tlet v = 1 /* c */\n\tlet w = 2;\n\texport { v, w };",
            "\tlet v = 1; /* c */\n\tlet w = 2;\n\texport { v, w };",
        ),
        (
            "\tlet v = {} /* c */\n\tlet w = 2;\n\texport { v, w };",
            "\tlet v = {}; /* c */\n\tlet w = 2;\n\texport { v, w };",
        ),
    ];
    for (nosemi, semi) in pairs {
        assert_eq!(compile_cell(nosemi), compile_cell(semi), "{nosemi:?}");
    }
}

/// Two shapes that must NOT move, and they are not the same control: the first
/// says a `//` inside a string is not a comment run, the second that a
/// declaration whose only content is a comment keeps the leading-comment path
/// rather than being read as a trailing run with nothing in front of it.
#[test]
fn a_string_and_a_leading_comment_are_not_trailing_runs() {
    assert_eq!(
        compile_cell("\texport let v = '// not a comment'\n\texport let w = 2;"),
        vec![
            "let v = $.prop($$props, 'v', 8, '// not a comment');".to_string(),
            "let w = $.prop($$props, 'w', 8, 2);".to_string(),
        ]
    );
    assert_eq!(
        compile_cell("\t// leading here\n\texport let v = 1\n\texport let w = 2;"),
        vec![
            "let v = $.prop($$props, 'v', 8, 1);".to_string(),
            String::new()
        ]
    );
}
