//! The server decides a trailing comment's place the same way the client does,
//! and it reached that decision through a rule that could not fire.
//!
//! esrap attaches the comment run after a declaration's last code byte to the
//! statement's last LOCATED node. `export let v = 1` lowers to
//! `$.fallback($$props['v'], 1)`, whose last argument IS the source `1`, so
//! upstream flushes the comment before the closing paren; `= {}` lowers to
//! `() => ({}), true`, whose last argument is builder-made and carries no
//! position, so the comment trails the statement. Neither the comment's
//! spelling nor a `;` is an axis — the `line`/`block` and `nosemi`/`semi`
//! columns below are there to say so.
//!
//! Two things had to change together for any cell to move, which is why a fix
//! to either alone measures as zero: the prop lowering blanked the default's
//! spans, and the placement declined to carry the region *because* it blanked.
//!
//! Every expected string is the ORACLE's own output
//! (`submodules/svelte/…/src/compiler/index.js`, `generate: 'server'`,
//! `dev: false`), generated rather than typed.
//!
//! Not fixed here, and each still diverges: a comment that also sits BEFORE the
//! statement's end (a leading one, or one interior to the declaration) and a
//! multi-declarator split. Those take the collapse-onto-one-address form, which
//! is what keeps this change off every cell that was already agreeing.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// The `let v` statement, however many lines it takes to balance the parens
/// esrap opened — a comment broken onto its own line before `)` makes that two
/// lines where every other cell is one.
fn compile_cell(body: &str) -> Vec<String> {
    let src = format!("<script>\n{body}\n</script>\n<p>{{v}}</p>\n");
    let js = compile(
        &src,
        CompileOptions {
            filename: Some("C.svelte".to_string()),
            generate: GenerateMode::Server,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    let lines: Vec<String> = js.lines().map(|l| l.trim().to_string()).collect();
    let Some(at) = lines.iter().position(|l| l.starts_with("let v")) else {
        return vec!["<no `let v` statement>".to_string()];
    };
    let mut out = Vec::new();
    let mut depth = 0i32;
    for line in &lines[at..] {
        out.push(line.clone());
        for ch in strip_comments(line).chars() {
            match ch {
                '(' => depth += 1,
                ')' => depth -= 1,
                _ => {}
            }
        }
        if depth <= 0 {
            break;
        }
    }
    out
}

/// Code bytes of one line: comments removed, string literals kept. A `//`
/// INSIDE a string is not a comment, which is exactly the shape one of the
/// controls below is made of — a picker that gets this wrong swallows the rest
/// of the component and the control fails for the wrong reason.
fn strip_comments(line: &str) -> String {
    let mut out = String::new();
    let bytes = line.as_bytes();
    let mut i = 0;
    while i < bytes.len() {
        match bytes[i] {
            b'"' | b'\'' | b'`' => {
                let quote = bytes[i];
                out.push(quote as char);
                i += 1;
                while i < bytes.len() && bytes[i] != quote {
                    if bytes[i] == b'\\' {
                        i += 1;
                    }
                    i += 1;
                }
                i += 1;
            }
            b'/' if bytes.get(i + 1) == Some(&b'/') => break,
            b'/' if bytes.get(i + 1) == Some(&b'*') => match line[i + 2..].find("*/") {
                Some(at) => i += 2 + at + 2,
                None => break,
            },
            c => {
                out.push(c as char);
                i += 1;
            }
        }
    }
    out
}

/// Every line of the component function before `$$renderer.push`, so a comment
/// placed BEFORE the declaration is inside the window. `compile_cell` starts at
/// the `let v` line and structurally cannot see one.
fn compile_prelude(body: &str) -> Vec<String> {
    let src = format!("<script>\n{body}\n</script>\n<p>{{v}}</p>\n");
    let js = compile(
        &src,
        CompileOptions {
            filename: Some("C.svelte".to_string()),
            generate: GenerateMode::Server,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    let lines: Vec<String> = js.lines().map(|l| l.trim().to_string()).collect();
    let Some(open) = lines
        .iter()
        .position(|l| l.starts_with("export default function"))
    else {
        return vec!["<no component function>".to_string()];
    };
    let Some(push) = lines.iter().position(|l| l.starts_with("$$renderer.push")) else {
        return vec!["<no $$renderer.push>".to_string()];
    };
    // Trailing blanks only: an interior blank line is still visible, because a
    // comment landing on the wrong side of one is the kind of thing this window
    // exists to show.
    let mut out = lines[open + 1..push].to_vec();
    while out.last().is_some_and(|l| l.is_empty()) {
        out.pop();
    }
    out
}

fn body(host: &str, default: &str, semi: &str, comment: &str) -> String {
    match host {
        "export_let" => format!("\texport let v{default}{semi} {comment}"),
        // The second host: `export { v }` reaches the same prop lowering through
        // a different statement kind, so it is a separate cell and not a dup.
        _ => format!("\tlet v{default}{semi} {comment}\n\texport {{ v }};"),
    }
}

const DEFAULTS: [(&str, &str); 3] = [("lit", " = 1"), ("none", ""), ("obj", " = {}")];
const COMMENTS: [(&str, &str); 2] = [("line", "// c"), ("block", "/* c */")];

#[test]
fn a_trailing_comment_lands_on_the_node_upstream_puts_it_on() {
    #[rustfmt::skip]
    let cells: &[(&str, &str, &str, &str, &[&str])] = &[
        ("export_let", "line", "nosemi", "lit", &["let v = $.fallback($$props['v'], 1 // c", ");"]),
        ("export_let", "line", "nosemi", "none", &["let v = $$props['v']; // c"]),
        ("export_let", "line", "nosemi", "obj", &["let v = $.fallback($$props['v'], () => ({}), true); // c"]),
        ("export_let", "line", "semi", "lit", &["let v = $.fallback($$props['v'], 1 // c", ");"]),
        ("export_let", "line", "semi", "none", &["let v = $$props['v']; // c"]),
        ("export_let", "line", "semi", "obj", &["let v = $.fallback($$props['v'], () => ({}), true); // c"]),
        ("export_let", "block", "nosemi", "lit", &["let v = $.fallback($$props['v'], 1 /* c */);"]),
        ("export_let", "block", "nosemi", "none", &["let v = $$props['v']; /* c */"]),
        ("export_let", "block", "nosemi", "obj", &["let v = $.fallback($$props['v'], () => ({}), true); /* c */"]),
        ("export_let", "block", "semi", "lit", &["let v = $.fallback($$props['v'], 1 /* c */);"]),
        ("export_let", "block", "semi", "none", &["let v = $$props['v']; /* c */"]),
        ("export_let", "block", "semi", "obj", &["let v = $.fallback($$props['v'], () => ({}), true); /* c */"]),
        ("reexport", "line", "nosemi", "lit", &["let v = $.fallback($$props['v'], 1 // c", ");"]),
        ("reexport", "line", "nosemi", "obj", &["let v = $.fallback($$props['v'], () => ({}), true); // c"]),
        ("reexport", "line", "semi", "lit", &["let v = $.fallback($$props['v'], 1 // c", ");"]),
        ("reexport", "line", "semi", "obj", &["let v = $.fallback($$props['v'], () => ({}), true); // c"]),
        ("reexport", "block", "nosemi", "lit", &["let v = $.fallback($$props['v'], 1 /* c */);"]),
        ("reexport", "block", "nosemi", "obj", &["let v = $.fallback($$props['v'], () => ({}), true); /* c */"]),
        ("reexport", "block", "semi", "lit", &["let v = $.fallback($$props['v'], 1 /* c */);"]),
        ("reexport", "block", "semi", "obj", &["let v = $.fallback($$props['v'], () => ({}), true); /* c */"]),
    ];

    let mut bad = Vec::new();
    for (host, kind, semi, default, want) in cells {
        let comment = COMMENTS.iter().find(|(n, _)| n == kind).unwrap().1;
        let d = DEFAULTS.iter().find(|(n, _)| n == default).unwrap().1;
        let s = if *semi == "semi" { ";" } else { "" };
        let got = compile_cell(&body(host, d, s, comment));
        if got != *want {
            bad.push(format!(
                "  {host}/{kind}/{semi}/{default}\n    want {want:?}\n    got  {got:?}"
            ));
        }
    }
    assert!(bad.is_empty(), "{} cells:\n{}", bad.len(), bad.join("\n"));
}

#[test]
fn the_semicolon_is_not_an_axis() {
    // Written as a RELATION rather than as ten more literals: whatever the
    // oracle does, a cell and its semicolon twin must agree, so this row cannot
    // go stale against a compiler change the grid above tracks.
    let mut bad = Vec::new();
    for host in ["export_let", "reexport"] {
        for (kn, comment) in COMMENTS {
            for (dn, d) in DEFAULTS {
                if host == "reexport" && dn == "none" {
                    continue;
                }
                let without = compile_cell(&body(host, d, "", comment));
                let with = compile_cell(&body(host, d, ";", comment));
                if without != with {
                    bad.push(format!("  {host}/{kn}/{dn}\n    {without:?}\n    {with:?}"));
                }
            }
        }
    }
    assert!(bad.is_empty(), "{} pairs:\n{}", bad.len(), bad.join("\n"));
}

#[test]
fn a_string_and_a_bare_default_are_not_trailing_runs() {
    // Two shapes the carry must leave exactly where they were: `//` inside a
    // string literal is not a comment, and a declaration with no comment at all
    // has no run to move. Both agreed with the oracle before this change and
    // must still.
    for (name, src, want) in [
        (
            "string holding slashes",
            "\texport let v = \"// not a comment\"",
            "let v = $.fallback($$props['v'], \"// not a comment\");",
        ),
        (
            "no comment at all",
            "\texport let v = 1",
            "let v = $.fallback($$props['v'], 1);",
        ),
    ] {
        assert_eq!(compile_cell(src), vec![want.to_string()], "{name}");
    }
}

/// The residue, pinned with the pair that discriminates it rather than left as
/// a sentence. `single_declarator_trailing_carry` refuses the carry when ANY
/// comment sits between the region's start and the statement's end, and that is
/// wider than the shape it was written for: a comment merely PRECEDING the
/// declaration disqualifies it too.
///
/// The first cell is the control that makes it a residue and not a rule — a
/// comment trailing a statement that stays in place is fine, so it is not
/// "any earlier comment". What breaks it is a comment the region still owns
/// when this statement is printed: an own-line note, or the trailing comment of
/// an `import`, which the server hoists out while leaving its comment behind.
///
/// Narrowing the condition to comments inside the declaration was measured and
/// is NOT the fix: it grants the carry and then splices the preceding comment
/// between the keyword and the declarator (`let // pre` / `v = …`), which is
/// #4279's shape in the server port. Recording that because the narrowing is
/// the obvious next edit and it produces text upstream never emits.
#[test]
fn a_comment_preceding_the_declaration_keeps_the_trailing_carry() {
    // Generated by the oracle, not typed: `// pre` sits before `let`, and the
    // trailing comment still flushes inside the `$.fallback(...)` call.
    let oracle = vec![
        "// pre".to_string(),
        "let v = $.fallback($$props['v'], 1 // c".to_string(),
        ");".to_string(),
    ];

    // Control: a trailing comment on a statement that stays in place. This one
    // agreed before the fix too, so it says the axis is not "an earlier comment
    // exists" -- it is whether the region still owns the comment at print time.
    assert_eq!(
        compile_prelude("\tconst q = 1; // pre\n\texport let v = 1; // c"),
        vec![
            "const q = 1; // pre".to_string(),
            "let v = $.fallback($$props['v'], 1 // c".to_string(),
            ");".to_string(),
        ],
        "a comment trailing a kept statement must not disturb the carry"
    );

    // An own-line comment before the declaration.
    assert_eq!(
        compile_prelude("\t// pre\n\texport let v = 1; // c"),
        oracle,
        "own-line comment: the carry survives and `// pre` stays ahead of `let`"
    );

    // A block comment reaches the same owner.
    assert_eq!(
        compile_prelude("\t/* pre */\n\texport let v = 1; // c"),
        vec![
            "/* pre */".to_string(),
            "let v = $.fallback($$props['v'], 1 // c".to_string(),
            ");".to_string(),
        ],
        "block comment: same region owner, same placement"
    );

    // Two of them, so the anchor is tested against a run rather than one comment.
    assert_eq!(
        compile_prelude("\t// p1\n\t// p2\n\texport let v = 1; // c"),
        vec![
            "// p1".to_string(),
            "// p2".to_string(),
            "let v = $.fallback($$props['v'], 1 // c".to_string(),
            ");".to_string(),
        ],
        "a run of preceding comments all stay ahead of the keyword"
    );

    // The trailing comment of a hoisted `import`: the server lifts the import
    // out and leaves its comment behind, so the region owns it at print time
    // even though nothing was written on its own line.
    assert_eq!(
        compile_prelude("\timport { marked } from 'marked'; // ic\n\texport let v = 1; // c"),
        vec![
            "// ic".to_string(),
            "let v = $.fallback($$props['v'], 1 // c".to_string(),
            ");".to_string(),
        ],
        "hoisted import comment: same collapse owner, reached from a different one"
    );
}
