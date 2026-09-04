//! esrap flushes a same-line comment after a source declaration onto the
//! initializer node, so once that initializer becomes `$.prop(…)`'s last
//! argument the comment prints *inside* the call and the closing paren moves to
//! its own line. rsvelte's port kept the comment only when the text before it
//! ended in a `;` — and a declaration is delimited by ASI as readily as by a
//! semicolon, so semicolon-free source lost it.
//!
//! Every expected string is the oracle's own output
//! (`submodules/svelte/…/src/compiler/index.js`, `generate: 'client'`,
//! `dev: false`). The grid crosses the comment's kind with the semicolon because
//! **the verdict inverts along that second axis**: before the fix a `//` was
//! dropped without a `;` and kept with one, while a `/* */` was kept without one
//! and dropped with it. A grid holding the semicolon fixed measures a property of
//! its own held constant.
//!
//! The second axis is the emitted argument's PROVENANCE. A `{}` or `[]` default
//! is wrapped in a thunk this pass synthesizes, and a builder-made node carries
//! no `loc`, so esrap flushes the comment after the statement rather than inside
//! the call — while a no-arg call, which is equally lazy, is unwrapped to its
//! source callee and stays inside. A grid of literal defaults holds that axis
//! fixed and reads 7/7 while the shape a real component carries is wrong.
//!
//! A trailing BLOCK comment on a synthesized-thunk default is a separate,
//! pre-existing defect and is not covered here: it reaches the initializer
//! through `interior_comments` rather than through this restorer, and its four
//! cells are byte-identical on the arm before this change. Measured in #4280.
//!
//! Not covered here, and not this fix: a MULTI-declarator declaration is split
//! one statement per declarator before this lowering sees it, so the comment
//! travels with the declarator it textually trails, while official puts it on the
//! first `$.prop` that carries a default. That is a `declaration_split` defect,
//! byte-identical on the arm before this fix, and it is the same placement rule
//! `primo/…/ui/Button.svelte` carries.

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
fn a_trailing_comment_survives_a_semicolon_free_export_let() {
    let cells: [(&str, &str, [&str; 2]); 17] = [
        (
            "line comment, no semicolon",
            "\texport let v = 1 // trailing here\n\texport let w = 2;",
            ["let v = $.prop($$props, 'v', 8, 1 // trailing here", ");"],
        ),
        (
            "line comment, semicolon",
            "\texport let v = 1; // trailing here\n\texport let w = 2;",
            ["let v = $.prop($$props, 'v', 8, 1 // trailing here", ");"],
        ),
        (
            // The cell whose verdict runs the OTHER way before the fix, which is
            // what makes the semicolon an axis rather than a detail.
            "block comment, no semicolon",
            "\texport let v = 1 /* trailing here */\n\texport let w = 2;",
            [
                "let v = $.prop($$props, 'v', 8, 1 /* trailing here */);",
                "let w = $.prop($$props, 'w', 8, 2);",
            ],
        ),
        (
            "no comment, no semicolon",
            "\texport let v = 1\n\texport let w = 2;",
            [
                "let v = $.prop($$props, 'v', 8, 1);",
                "let w = $.prop($$props, 'w', 8, 2);",
            ],
        ),
        (
            "own-line comment before the declaration",
            "\t// leading here\n\texport let v = 1\n\texport let w = 2;",
            ["let v = $.prop($$props, 'v', 8, 1);", ""],
        ),
        (
            "`//` inside a string is not a comment",
            "\texport let v = '// not a comment'\n\texport let w = 2;",
            [
                "let v = $.prop($$props, 'v', 8, '// not a comment');",
                "let w = $.prop($$props, 'w', 8, 2);",
            ],
        ),
        (
            // The axis the literal cells cannot see: esrap prints the comment
            // inside the call only while the last argument is the SOURCE
            // initializer. An object or array default is wrapped in a thunk
            // this pass synthesizes, which carries no `loc`, so the comment
            // flushes AFTER the statement instead.
            "object default, synthesized thunk",
            "\texport let v = {} // trailing here\n\texport let w = 2;",
            [
                "let v = $.prop($$props, 'v', 24, () => ({})); // trailing here",
                "let w = $.prop($$props, 'w', 8, 2);",
            ],
        ),
        (
            "array default, synthesized thunk",
            "\texport let v = [] // trailing here\n\texport let w = 2;",
            [
                "let v = $.prop($$props, 'v', 24, () => []); // trailing here",
                "let w = $.prop($$props, 'w', 8, 2);",
            ],
        ),
        (
            // A no-arg call is LAZY too, yet upstream unwraps it to the bare
            // callee — a source node with a `loc` — so it stays INSIDE. That is
            // what says the axis is the argument's provenance and not the flag.
            "no-arg call default",
            "\tfunction f() { return 1; }\n\texport let v = f() // trailing here\n\texport let w = 2;",
            ["let v = $.prop($$props, 'v', 24, f // trailing here", ");"],
        ),
        (
            // Seven more values, all of which upstream lowers to a synthesized
            // `() => …`. The rule is the argument's provenance, so the list is
            // whatever upstream wraps — not a list of "object-like" defaults.
            "member default",
            "\tconst o = { k: 1 };\n\texport let v = o.k // trailing here\n\texport let w = 2;",
            [
                "let v = $.prop($$props, 'v', 24, () => o.k); // trailing here",
                "let w = $.prop($$props, 'w', 8, 2);",
            ],
        ),
        (
            "template-literal default",
            "\texport let v = `x` // trailing here\n\texport let w = 2;",
            [
                "let v = $.prop($$props, 'v', 24, () => `x`); // trailing here",
                "let w = $.prop($$props, 'w', 8, 2);",
            ],
        ),
        (
            "new-expression default",
            "\texport let v = new Map() // trailing here\n\texport let w = 2;",
            [
                "let v = $.prop($$props, 'v', 24, () => new Map()); // trailing here",
                "let w = $.prop($$props, 'w', 8, 2);",
            ],
        ),
        (
            // The pair that separates provenance from the lazy FLAG: both calls
            // are lazy, and only the no-arg one is unwrapped to a source callee.
            "call-with-argument default",
            "\tfunction f(x) { return x; }\n\texport let v = f(1) // trailing here\n\texport let w = 2;",
            [
                "let v = $.prop($$props, 'v', 24, () => f(1)); // trailing here",
                "let w = $.prop($$props, 'w', 8, 2);",
            ],
        ),
        (
            "nested-object default",
            "\texport let v = { a: { b: 1 } } // trailing here\n\texport let w = 2;",
            [
                "let v = $.prop($$props, 'v', 24, () => ({ a: { b: 1 } })); // trailing here",
                "let w = $.prop($$props, 'w', 8, 2);",
            ],
        ),
        (
            "array-of-objects default",
            "\texport let v = [{ a: 1 }] // trailing here\n\texport let w = 2;",
            [
                "let v = $.prop($$props, 'v', 24, () => [{ a: 1 }]); // trailing here",
                "let w = $.prop($$props, 'w', 8, 2);",
            ],
        ),
        (
            // A ternary is SIMPLE, so it is emitted bare and stays inside — the
            // control that stops "anything non-literal goes after" from passing.
            "ternary default",
            "\tconst a = 1;\n\texport let v = a ? 1 : 2 // trailing here\n\texport let w = 2;",
            [
                "let v = $.prop($$props, 'v', 8, a ? 1 : 2 // trailing here",
                ");",
            ],
        ),
        (
            "arrow default, no semicolon",
            "\texport let v = () => 1 // trailing here\n\texport let w = 2;",
            [
                "let v = $.prop($$props, 'v', 8, () => 1 // trailing here",
                ");",
            ],
        ),
    ];

    let mut wrong = Vec::new();
    for (name, body, expected) in cells {
        let got = compile_cell(body);
        let want: Vec<String> = expected.iter().map(|s| s.to_string()).collect();
        if got != want {
            wrong.push(format!("{name}\n  want {want:?}\n  got  {got:?}"));
        }
    }
    assert!(wrong.is_empty(), "{}", wrong.join("\n"));
}
