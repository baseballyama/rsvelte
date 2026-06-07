//! Regression test: pending-only / pending+catch `{#await}` blocks.
//!
//! `{#await p}…{/await}` (pending only, no `{:then}`/`{:catch}`) and
//! `{#await p}…{:catch e}…{/await}` (pending + catch, no then) previously
//! generated invalid TSX — the block was never opened, the `await(promise)`
//! was dropped entirely, and the catch was ignored — so the overlay was
//! brace-unbalanced (which trips the program-wide tsgo suppression). Now
//! mirrors upstream `handleAwait`.

use rsvelte_core::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn to_tsx(src: &str) -> String {
    let opts = Svelte2TsxOptions {
        filename: "T.svelte".to_string(),
        is_ts_file: true,
        ..Default::default()
    };
    svelte2tsx(src, opts).expect("svelte2tsx").code
}

fn braces_balanced(s: &str) -> bool {
    let mut depth: i32 = 0;
    let mut in_str: Option<char> = None;
    let mut prev = '\0';
    for c in s.chars() {
        match in_str {
            Some(q) => {
                if c == q && prev != '\\' {
                    in_str = None;
                }
            }
            None => match c {
                '"' | '\'' | '`' => in_str = Some(c),
                '{' => depth += 1,
                '}' => depth -= 1,
                _ => {}
            },
        }
        if depth < 0 {
            return false;
        }
        prev = c;
    }
    depth == 0
}

const PRELUDE: &str = "<script lang=\"ts\">const p = Promise.resolve(true);</script>\n";

#[test]
fn pending_only_is_balanced_and_awaits_promise() {
    let out = to_tsx(&format!("{PRELUDE}{{#await p}}wait{{/await}}"));
    assert!(braces_balanced(&out), "unbalanced:\n{out}");
    assert!(out.contains("await (p)"), "promise not awaited:\n{out}");
}

#[test]
fn pending_then_catch_no_then_is_balanced() {
    let out = to_tsx(&format!(
        "{PRELUDE}{{#await p}}wait{{:catch e}}{{e}}{{/await}}"
    ));
    assert!(braces_balanced(&out), "unbalanced:\n{out}");
    assert!(out.contains("await (p)"), "promise not awaited:\n{out}");
    assert!(
        out.contains("} catch($$_e) {"),
        "missing balanced catch:\n{out}"
    );
    assert!(
        out.contains("const e = __sveltets_2_any();"),
        "catch var lost:\n{out}"
    );
}

#[test]
fn pending_catch_no_var_is_balanced() {
    let out = to_tsx(&format!("{PRELUDE}{{#await p}}wait{{:catch}}err{{/await}}"));
    assert!(braces_balanced(&out), "unbalanced:\n{out}");
    assert!(
        out.contains("} catch($$_e) {"),
        "missing balanced catch:\n{out}"
    );
}
