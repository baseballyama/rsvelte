//! `UpdateExpression.js` does not import `build_assignment`, so upstream never
//! grows the `$.invalidate_inner_signals` tail on a `++` / `--` — while the same
//! binding's `=` and `+=` keep it. rsvelte wrapped all three, in four places:
//! the AST and in-place ports of both `legacy_state_member_mutate_ast` and
//! `prop_member_mutate_ast`; the `store_member_mutate_ast` rows are the same
//! rule at a third port, which grew a tail for the first time in the same
//! change and had to be gated on the way in.
//!
//! The key is the mutation each tail is attached to, not a count: an
//! over-wrap and a moved wrap have the same count. Expectations are the
//! oracle's own output.
//!
//! What this cannot see: `$: st.a++` loses its `$.mutate` wrapper entirely,
//! which changes no tail and so leaves every row here unmoved.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

const NEEDLE: &str = "$.invalidate_inner_signals";

/// The balanced expression the tail is appended to, one per occurrence.
fn tail_hosts(js: &str) -> Vec<String> {
    let b = js.as_bytes();
    let mut out = Vec::new();
    let mut from = 0;
    while let Some(rel) = js[from..].find(NEEDLE) {
        let i = from + rel;
        let mut end = i;
        while end > 0 && b[end - 1].is_ascii_whitespace() {
            end -= 1;
        }
        if end > 0 && b[end - 1] == b',' {
            end -= 1;
        }
        while end > 0 && b[end - 1].is_ascii_whitespace() {
            end -= 1;
        }
        let mut depth = 0usize;
        let mut j = end;
        while j > 0 {
            match b[j - 1] {
                b')' => depth += 1,
                b'(' => {
                    if depth == 0 {
                        break;
                    }
                    depth -= 1;
                }
                _ => {}
            }
            j -= 1;
        }
        out.push(js[j..end].split_whitespace().collect::<Vec<_>>().join(" "));
        from = i + NEEDLE.len();
    }
    out
}

fn compile_cell(decl: &str, reference: &str, op: &str, host: &str) -> String {
    let body = match host {
        "fn" => format!("\tfunction go() {{ {op} }}"),
        "reactive" => format!("\tlet tick = 0;\n\t$: if (tick) {{ {op} }}"),
        other => panic!("unknown host {other}"),
    };
    let src = format!(
        "<script>\n\t{decl}\n\tlet opts = ['x', 'y'];\n{body}\n</script>\n\
         <select bind:value={{{reference}.t}}>{{#each opts as o}}<option value={{o}}>{{o}}</option>{{/each}}</select>\n\
         <button on:click={{() => {{}}}}>go</button>"
    );
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

#[test]
fn an_update_expression_carries_no_invalidate_tail() {
    let kinds: [(&str, &str, &str); 3] = [
        ("state", "let st = { a: 1, t: 'x' };", "st"),
        ("prop", "export let p = { a: 1, t: 'x' };", "p"),
        (
            "store",
            "import { writable } from 'svelte/store';\n\texport const s = writable({ a: 1, t: 'x' });",
            "$s",
        ),
    ];
    let ops: [(&str, &str); 3] = [
        ("assign", ".a = 2;"),
        ("compound", ".a += 2;"),
        ("update", ".a++;"),
    ];

    let expected: Vec<((&str, &str, &str), Vec<&str>)> = vec![
        (
            ("state", "assign", "fn"),
            vec![
                "$.mutate(st, $.get(st).a = 2)",
                "$.mutate(st, $.get(st).t = $$value)",
            ],
        ),
        (
            ("state", "assign", "reactive"),
            vec![
                "$.mutate(st, $.get(st).a = 2)",
                "$.mutate(st, $.get(st).t = $$value)",
            ],
        ),
        (
            ("state", "compound", "fn"),
            vec![
                "$.mutate(st, $.get(st).a += 2)",
                "$.mutate(st, $.get(st).t = $$value)",
            ],
        ),
        (
            ("state", "compound", "reactive"),
            vec![
                "$.mutate(st, $.get(st).a += 2)",
                "$.mutate(st, $.get(st).t = $$value)",
            ],
        ),
        (
            ("state", "update", "fn"),
            vec!["$.mutate(st, $.get(st).t = $$value)"],
        ),
        (
            ("state", "update", "reactive"),
            vec!["$.mutate(st, $.get(st).t = $$value)"],
        ),
        (
            ("prop", "assign", "fn"),
            vec!["p(p().a = 2, true)", "p(p().t = $$value, true)"],
        ),
        (
            ("prop", "assign", "reactive"),
            vec!["p(p().a = 2, true)", "p(p().t = $$value, true)"],
        ),
        (
            ("prop", "compound", "fn"),
            vec!["p(p().a += 2, true)", "p(p().t = $$value, true)"],
        ),
        (
            ("prop", "compound", "reactive"),
            vec!["p(p().a += 2, true)", "p(p().t = $$value, true)"],
        ),
        (("prop", "update", "fn"), vec!["p(p().t = $$value, true)"]),
        (
            ("prop", "update", "reactive"),
            vec!["p(p().t = $$value, true)"],
        ),
        (
            ("store", "assign", "fn"),
            vec![
                "$.store_mutate(s, $.untrack($s).a = 2, $.untrack($s))",
                "$.store_mutate(s, $.untrack($s).t = $$value, $.untrack($s))",
            ],
        ),
        (
            ("store", "assign", "reactive"),
            vec![
                "$.store_mutate(s, $.untrack($s).a = 2, $.untrack($s))",
                "$.store_mutate(s, $.untrack($s).t = $$value, $.untrack($s))",
            ],
        ),
        (
            ("store", "compound", "fn"),
            vec![
                "$.store_mutate(s, $.untrack($s).a += 2, $.untrack($s))",
                "$.store_mutate(s, $.untrack($s).t = $$value, $.untrack($s))",
            ],
        ),
        (
            ("store", "compound", "reactive"),
            vec![
                "$.store_mutate(s, $.untrack($s).a += 2, $.untrack($s))",
                "$.store_mutate(s, $.untrack($s).t = $$value, $.untrack($s))",
            ],
        ),
        (
            ("store", "update", "fn"),
            vec!["$.store_mutate(s, $.untrack($s).t = $$value, $.untrack($s))"],
        ),
        (
            ("store", "update", "reactive"),
            vec!["$.store_mutate(s, $.untrack($s).t = $$value, $.untrack($s))"],
        ),
    ];

    let mut failures = Vec::new();
    for (kind, decl, reference) in kinds {
        for (op_name, suffix) in ops {
            for host in ["fn", "reactive"] {
                let op = format!("{reference}{suffix}");
                let js = compile_cell(decl, reference, &op, host);
                let got = tail_hosts(&js);
                let want = &expected
                    .iter()
                    .find(|(k, _)| *k == (kind, op_name, host))
                    .expect("cell listed")
                    .1;
                if got != *want {
                    failures.push(format!(
                        "{kind}/{op_name}/{host}\n  want {want:?}\n  got  {got:?}"
                    ));
                }
            }
        }
    }
    assert!(failures.is_empty(), "{}", failures.join("\n"));
}
