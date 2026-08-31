//! Regression tests for #3606 and the nested half of #3271 — an `$inspect(…)`
//! below the script top level was removed outright, where upstream treats it
//! exactly like a top-level one.
//!
//! Upstream's server `CallExpression` visitor is a tree-wide zimmerframe
//! visitor, so depth is not part of its decision:
//!
//! - in **dev** it lowers `$inspect(args)` to
//!   `console.log('$inspect(', args, ')')` and `$inspect(args).with(fn)` to
//!   `(fn)('init', args)` — rsvelte handled only the top-level statement, so
//!   the logging the rune exists for never ran from inside a function, a bare
//!   block, an `if`, a `try` or a class method. That half is a **behaviour**
//!   difference, not just a byte one;
//! - in **prod** the `ExpressionStatement` survives with `b.empty` as its
//!   expression, which esrap prints as `;;`. rsvelte dropped the statement on
//!   the server and left a single `;` on the client.
//!
//! `$effect` / `$effect.pre` / `$effect.root` are removed in every mode and at
//! every depth, and they are the controls: a fix that reads "keep everything
//! nested" fails them. (`$inspect.trace` behaves the same way but official
//! rejects it anywhere but the first statement of a function body, so most of
//! these hosts cannot carry it.)
//!
//! One trap is recorded in the code and here: for the nested path the argument
//! text comes from `expr_to_string`, not from a source slice, because the
//! enclosing statement has already been re-homed by `reparse_statement` and its
//! spans index the re-parsed slice — slicing the component source produced
//! `console.log('$inspect(', 1, let, ')')`. The same re-homing is why the
//! nested lowering must NOT read-wrap again: the statement was wrapped whole,
//! so a derived argument already reads as `d()` and re-wrapping made it `d()()`.
//!
//! Every expectation below is the byte-exact output of the official compiler
//! (Svelte v5.56.9).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// `%s` is the call; the component declares `a` (`$state`) and `d`
/// (`$derived`).
fn compile_host(host: &str, call: &str, generate: GenerateMode, dev: bool) -> String {
    let body = host.replace("%s", call);
    let src = format!(
        "<script>\n\tlet a = $state(1);\n\tlet d = $derived(a * 2);\n\t{body}\n</script>\n<b>{{a}}{{d}}</b>\n"
    );
    compile(
        &src,
        CompileOptions {
            filename: Some("X.svelte".to_string()),
            generate,
            dev,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// Every host that puts the call below the script top level.
const NESTED_HOSTS: &[&str] = &[
    "function f() {\n\t\t%s\n\t}\n\tf();",
    "const g = () => {\n\t\t%s\n\t};\n\tg();",
    "{\n\t\t%s\n\t}",
    "if (a) {\n\t\t%s\n\t}",
    "try {\n\t\t%s\n\t} catch {}",
    "for (let i = 0; i < 1; i++) {\n\t\t%s\n\t}",
    "class C {\n\t\tm() {\n\t\t\t%s\n\t\t}\n\t}\n\tnew C().m();",
    "function f() {\n\t\tfunction h() {\n\t\t\t%s\n\t\t}\n\t\th();\n\t}\n\tf();",
];

/// The defect: in dev the nested call must LOWER, not vanish.
#[test]
fn a_nested_inspect_is_lowered_in_dev() {
    for host in NESTED_HOSTS {
        let code = compile_host(host, "$inspect(a);", GenerateMode::Server, true);
        assert!(
            code.contains("console.log('$inspect(', a, ')');"),
            "for host {host:?} in:\n{code}"
        );
    }
}

/// `.with(fn)` is the second lowering, and multiple arguments are the row that
/// separates "the args are rendered" from "the first arg is rendered".
#[test]
fn the_argument_shapes_render_the_same_nested_as_at_the_top() {
    let host = "function f() {\n\t\t%s\n\t}\n\tf();";
    for (call, expected) in [
        ("$inspect(a);", "console.log('$inspect(', a, ')');"),
        (
            "$inspect(a, a + 1);",
            "console.log('$inspect(', a, a + 1, ')');",
        ),
        ("$inspect(a).with(console.log);", "console.log('init', a);"),
    ] {
        let code = compile_host(host, call, GenerateMode::Server, true);
        assert!(code.contains(expected), "for {call} in:\n{code}");
    }
}

/// A derived argument reads as `d()` exactly once. The enclosing statement was
/// already read-wrapped whole, so the lowering must not wrap again — the first
/// version of this fix emitted `d()()`.
#[test]
fn a_derived_argument_is_read_once() {
    for host in NESTED_HOSTS {
        let code = compile_host(host, "$inspect(d);", GenerateMode::Server, true);
        assert!(
            code.contains("console.log('$inspect(', d(), ')');"),
            "for host {host:?} in:\n{code}"
        );
        assert!(!code.contains("d()()"), "for host {host:?} in:\n{code}");
    }
}

/// The control: these four are removed at every depth, in every mode. Without
/// them the fix reads as "stop removing nested rune statements".
#[test]
fn the_effect_runes_are_still_removed_when_nested() {
    for host in NESTED_HOSTS {
        // `$inspect.trace()` is not here: official rejects it outside the first
        // statement of a FUNCTION body, so most of these hosts cannot carry it.
        for call in ["$effect(() => a);", "$effect.pre(() => a);"] {
            for (generate, dev) in [(GenerateMode::Server, true), (GenerateMode::Server, false)] {
                let code = compile_host(host, call, generate, dev);
                assert!(
                    !code.contains("console.log('$inspect("),
                    "for {call} in host {host:?} (dev={dev}) in:\n{code}"
                );
            }
        }
    }
}

/// The two `;` a removed statement leaves, counted rather than matched as text:
/// formatting is not part of this regression. Counting keeps both a vanished
/// hole and a run of three failing while allowing either legal line layout.
fn empty_statement_semicolons(code: &str) -> usize {
    code.lines()
        .map(|l| match l.trim() {
            ";;" => 2,
            ";" => 1,
            _ => 0,
        })
        .sum()
}

/// Prod keeps the statement with an empty expression, which prints as `;;` —
/// the same two the top-level path already emitted, on both targets.
#[test]
fn a_removed_nested_inspect_leaves_two_empty_statements() {
    for host in NESTED_HOSTS {
        for generate in [GenerateMode::Server, GenerateMode::Client] {
            let code = compile_host(host, "$inspect(a);", generate, false);
            assert_eq!(
                empty_statement_semicolons(&code),
                2,
                "for host {host:?} ({generate:?}) in:\n{code}"
            );
        }
    }
}

/// And the other direction for that half: `$effect` prints NOTHING, so a fix
/// that emits `;;` for every removed rune statement fails here.
#[test]
fn a_removed_nested_effect_leaves_nothing() {
    for host in NESTED_HOSTS {
        for generate in [GenerateMode::Server, GenerateMode::Client] {
            let code = compile_host(host, "$effect(() => a);", generate, false);
            assert!(
                !code.contains(";;"),
                "for host {host:?} ({generate:?}) in:\n{code}"
            );
        }
    }
}

/// Two calls in one body, which is where both halves had a second bug: the
/// client's removal ran `find_code` ONCE per statement slice, so the second
/// `$inspect(...)` survived verbatim into the output; and the printer joined
/// ANY two adjacent kept empties, so four holes printed as one `;;;;;;;;` line
/// instead of four `;;` lines. A pair is joined only at consecutive starts.
#[test]
fn several_calls_in_one_body_are_each_their_own_hole() {
    let host = "function f() {\n\t\t%s\n\t}\n\tf();";
    let call = "$inspect(a);\n\t\t$inspect(d);";
    for generate in [GenerateMode::Server, GenerateMode::Client] {
        let code = compile_host(host, call, generate, false);
        assert!(
            !code.contains("$inspect("),
            "a call survived ({generate:?}) in:\n{code}"
        );
        assert_eq!(
            empty_statement_semicolons(&code),
            4,
            "expected two separate holes ({generate:?}) in:\n{code}"
        );
        assert!(
            !code.contains(";;;"),
            "expected no run of three ({generate:?}) in:\n{code}"
        );
    }
    let code = compile_host(host, call, GenerateMode::Server, true);
    assert!(
        code.contains("console.log('$inspect(', a, ')');")
            && code.contains("console.log('$inspect(', d(), ')');"),
        "in:\n{code}"
    );
}

/// The top-level row, unchanged by all of this — the control that says the
/// lowering itself was always right and only its reachability differed.
#[test]
fn the_top_level_call_is_unchanged() {
    let code = compile_host("%s", "$inspect(a);", GenerateMode::Server, true);
    assert!(
        code.contains("console.log('$inspect(', a, ')');"),
        "in:\n{code}"
    );
    let code = compile_host("%s", "$inspect(a);", GenerateMode::Server, false);
    assert!(code.contains(";;"), "in:\n{code}");
}
